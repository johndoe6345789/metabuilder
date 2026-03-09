// testcontainers-sidecar — starts a Docker container via testcontainers-go,
// writes the host-side mapped port as JSON to stdout, then waits for SIGTERM.
//
// Usage:
//
//	testcontainers-sidecar \
//	  --image  postgres:16-alpine \
//	  --port   5432 \
//	  --env    POSTGRES_PASSWORD=testpass \
//	  --env    POSTGRES_USER=testuser \
//	  --env    POSTGRES_DB=dbal_test \
//	  --wait-log "database system is ready to accept connections"
//
// On success writes one JSON line to stdout:
//
//	{"status":"ready","host_port":54321,"container_id":"abc123"}
//
// On error writes to stderr and exits non-zero.
// Ryuk (launched automatically by testcontainers-go) cleans up the container
// even if this process is killed unexpectedly.
package main

import (
	"context"
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"os"
	"os/signal"
	"strconv"
	"strings"
	"syscall"
	"time"

	"github.com/docker/go-connections/nat"
	"github.com/testcontainers/testcontainers-go"
	"github.com/testcontainers/testcontainers-go/wait"
)

// envFlags collects repeated --env KEY=VALUE flags.
type envFlags []string

func (e *envFlags) String() string { return strings.Join(*e, ", ") }
func (e *envFlags) Set(v string) error {
	*e = append(*e, v)
	return nil
}

// readyMsg is written to stdout once the container is healthy.
type readyMsg struct {
	Status      string `json:"status"`
	HostPort    int    `json:"host_port"`
	ContainerID string `json:"container_id"`
}

func main() {
	image          := flag.String("image",              "",    "Docker image (required)")
	port           := flag.Int("port",                  0,     "Container port to expose (required)")
	waitLog        := flag.String("wait-log",           "",    "Log substring to wait for before declaring ready")
	waitLogOccur   := flag.Int("wait-log-occurrence",   1,     "Number of times the log line must appear (default 1)")
	waitHTTP       := flag.String("wait-http",          "",    "HTTP path to poll on the exposed port (e.g. /health)")
	timeout        := flag.Duration("timeout",          120*time.Second, "Container startup timeout")

	var envs envFlags
	flag.Var(&envs, "env", "KEY=VALUE environment variable (repeatable)")
	flag.Parse()

	if *image == "" || *port == 0 {
		fmt.Fprintln(os.Stderr, "usage: testcontainers-sidecar --image IMAGE --port PORT [--env K=V ...] [--wait-log LOG | --wait-http PATH]")
		os.Exit(1)
	}

	// Parse env vars
	envMap := make(map[string]string, len(envs))
	for _, kv := range envs {
		parts := strings.SplitN(kv, "=", 2)
		if len(parts) == 2 {
			envMap[parts[0]] = parts[1]
		}
	}

	// Choose wait strategy
	tcPort := nat.Port(fmt.Sprintf("%d/tcp", *port))
	var strategy wait.Strategy
	switch {
	case *waitLog != "":
		logWait := wait.ForLog(*waitLog).WithStartupTimeout(*timeout)
		if *waitLogOccur > 1 {
			logWait = logWait.WithOccurrence(*waitLogOccur)
		}
		strategy = logWait
	case *waitHTTP != "":
		strategy = wait.ForHTTP(*waitHTTP).
			WithPort(tcPort).
			WithStartupTimeout(*timeout)
	default:
		strategy = wait.ForListeningPort(tcPort).
			WithStartupTimeout(*timeout)
	}

	ctx := context.Background()

	container, err := testcontainers.GenericContainer(ctx, testcontainers.GenericContainerRequest{
		ContainerRequest: testcontainers.ContainerRequest{
			Image:        *image,
			Env:          envMap,
			ExposedPorts: []string{string(tcPort)},
			WaitingFor:   strategy,
		},
		Started: true,
	})
	if err != nil {
		log.Fatalf("failed to start container %s: %v", *image, err)
	}
	defer func() {
		if terr := container.Terminate(context.Background()); terr != nil {
			fmt.Fprintf(os.Stderr, "terminate error: %v\n", terr)
		}
	}()

	// Get host-side mapped port
	mappedPort, err := container.MappedPort(ctx, tcPort)
	if err != nil {
		log.Fatalf("failed to get mapped port for %d: %v", *port, err)
	}
	hostPort, err := strconv.Atoi(mappedPort.Port())
	if err != nil {
		log.Fatalf("unexpected mapped port value %q: %v", mappedPort.Port(), err)
	}

	containerID := container.GetContainerID()

	// Signal readiness to parent process
	msg := readyMsg{Status: "ready", HostPort: hostPort, ContainerID: containerID}
	if encErr := json.NewEncoder(os.Stdout).Encode(msg); encErr != nil {
		log.Fatalf("failed to write ready message: %v", encErr)
	}

	// Keep running until terminated — Ryuk will clean up if we die unexpectedly
	sig := make(chan os.Signal, 1)
	signal.Notify(sig, syscall.SIGTERM, syscall.SIGINT)
	<-sig
	fmt.Fprintln(os.Stderr, "testcontainers-sidecar: received shutdown signal")
}
