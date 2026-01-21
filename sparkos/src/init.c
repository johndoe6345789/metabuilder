/*
 * SparkOS Init - Minimal init system for SparkOS
 * This is the first process that runs after the kernel boots
 * 
 * SparkOS Philosophy: GUI-only, no CLI, network-first
 * - No shell spawning or CLI utilities
 * - Direct boot to Qt6 GUI
 * - Network initialization via direct C system calls
 */

#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <sys/wait.h>
#include <sys/reboot.h>
#include <sys/socket.h>
#include <sys/ioctl.h>
#include <sys/mount.h>
#include <sys/stat.h>
#include <net/if.h>
#include <linux/if.h>
#include <signal.h>
#include <errno.h>
#include <string.h>
#include <arpa/inet.h>
#include <limits.h>

static void signal_handler(int sig) {
    if (sig == SIGCHLD) {
        // Reap zombie processes
        while (waitpid(-1, NULL, WNOHANG) > 0);
    }
}

static void spawn_gui() {
    pid_t pid = fork();
    
    if (pid < 0) {
        perror("fork failed");
        return;
    }
    
    if (pid == 0) {
        // Child process - exec Qt6 GUI application as root (no user switching)
        
        char *argv[] = {"/usr/bin/sparkos-gui", NULL};
        char *envp[] = {
            "HOME=/root",
            "PATH=/usr/bin:/usr/sbin",
            "QT_QPA_PLATFORM=linuxfb:fb=/dev/fb0",
            "QT_QPA_FB_FORCE_FULLSCREEN=1",
            "QT_QPA_FONTDIR=/usr/share/fonts",
            NULL
        };
        
        execve("/usr/bin/sparkos-gui", argv, envp);
        
        perror("failed to exec GUI application");
        exit(1);
    }
    
    // Parent process - wait for GUI to exit
    int status;
    waitpid(pid, &status, 0);
}

/*
 * Initialize network interface directly via ioctl
 * No dependency on busybox or CLI tools
 */
static int init_network_interface(const char *ifname) {
    int sock;
    struct ifreq ifr;
    
    // Create socket for ioctl operations
    sock = socket(AF_INET, SOCK_DGRAM, 0);
    if (sock < 0) {
        perror("socket creation failed");
        return -1;
    }
    
    // Prepare interface request structure
    memset(&ifr, 0, sizeof(ifr));
    strncpy(ifr.ifr_name, ifname, IFNAMSIZ - 1);
    ifr.ifr_name[IFNAMSIZ - 1] = '\0';  // Ensure null termination
    
    // Get current flags
    if (ioctl(sock, SIOCGIFFLAGS, &ifr) < 0) {
        close(sock);
        return -1;  // Interface doesn't exist
    }
    
    // Bring interface up
    ifr.ifr_flags |= IFF_UP | IFF_RUNNING;
    if (ioctl(sock, SIOCSIFFLAGS, &ifr) < 0) {
        perror("failed to bring up interface");
        close(sock);
        return -1;
    }
    
    close(sock);
    printf("Network interface %s brought up successfully\n", ifname);
    return 0;
}

/*
 * Initialize networking without external dependencies
 * Brings up loopback and first available ethernet interface
 */
static void init_network() {
    const char *interfaces[] = {"lo", "eth0", "enp0s3", "enp0s8", "ens33", NULL};
    int i;
    int eth_initialized = 0;
    
    printf("Initializing network interfaces...\n");
    
    // Bring up loopback
    if (init_network_interface("lo") == 0) {
        printf("Loopback interface initialized\n");
    }
    
    // Try to bring up first available ethernet interface
    for (i = 1; interfaces[i] != NULL && !eth_initialized; i++) {
        if (init_network_interface(interfaces[i]) == 0) {
            printf("Primary network interface %s initialized\n", interfaces[i]);
            printf("Note: DHCP configuration should be handled by Qt6 GUI\n");
            eth_initialized = 1;
        }
    }
    
    if (!eth_initialized) {
        fprintf(stderr, "Warning: No ethernet interface found or initialized\n");
        fprintf(stderr, "Network configuration will be available through GUI\n");
    }
}

/*
 * Mount filesystem using direct mount() system call
 * No dependency on mount binary
 */
static int mount_fs(const char *source, const char *target, const char *fstype, unsigned long flags) {
    if (mount(source, target, fstype, flags, NULL) < 0) {
        return -1;
    }
    return 0;
}

/*
 * Create directory recursively
 * No dependency on mkdir binary
 */
static int mkdir_p(const char *path) {
    char tmp[PATH_MAX];
    char *p = NULL;
    size_t len;
    
    len = strlen(path);
    if (len >= PATH_MAX) {
        errno = ENAMETOOLONG;
        return -1;
    }
    
    snprintf(tmp, sizeof(tmp), "%s", path);
    if (tmp[len - 1] == '/')
        tmp[len - 1] = 0;
    
    for (p = tmp + 1; *p; p++) {
        if (*p == '/') {
            *p = 0;
            if (mkdir(tmp, 0755) < 0 && errno != EEXIST) {
                return -1;
            }
            *p = '/';
        }
    }
    
    if (mkdir(tmp, 0755) < 0 && errno != EEXIST) {
        return -1;
    }
    
    return 0;
}

int main(int argc, char *argv[]) {
    printf("SparkOS Init System Starting...\n");
    printf("================================\n");
    printf("Philosophy: GUI-Only, No CLI, Network-First\n");
    printf("================================\n\n");
    
    // Make sure we're PID 1
    if (getpid() != 1) {
        fprintf(stderr, "init must be run as PID 1\n");
        return 1;
    }
    
    // Set up signal handlers
    signal(SIGCHLD, signal_handler);
    
    // Mount essential filesystems using direct system calls
    printf("Mounting essential filesystems...\n");
    if (mount_fs("proc", "/proc", "proc", 0) != 0) {
        fprintf(stderr, "Warning: Failed to mount /proc\n");
    }
    if (mount_fs("sysfs", "/sys", "sysfs", 0) != 0) {
        fprintf(stderr, "Warning: Failed to mount /sys\n");
    }
    if (mount_fs("devtmpfs", "/dev", "devtmpfs", 0) != 0) {
        fprintf(stderr, "Warning: Failed to mount /dev\n");
    }
    if (mount_fs("tmpfs", "/tmp", "tmpfs", 0) != 0) {
        fprintf(stderr, "Warning: Failed to mount /tmp\n");
    }
    
    // Set up overlay filesystem for immutable base OS
    printf("Setting up overlay filesystem for writable layer...\n");
    
    // Create overlay directories in tmpfs
    if (mkdir_p("/tmp/overlay/var-upper") != 0 || mkdir_p("/tmp/overlay/var-work") != 0) {
        fprintf(stderr, "Warning: Failed to create overlay directories for /var\n");
    }
    
    // Mount overlay on /var for logs and runtime data
    char overlay_opts[256];
    snprintf(overlay_opts, sizeof(overlay_opts), 
             "lowerdir=/var,upperdir=/tmp/overlay/var-upper,workdir=/tmp/overlay/var-work");
    if (mount("overlay", "/var", "overlay", 0, overlay_opts) != 0) {
        fprintf(stderr, "Warning: Failed to mount overlay on /var - system may be read-only\n");
    } else {
        printf("Overlay filesystem mounted on /var (base OS is immutable)\n");
    }
    
    // Mount tmpfs on /run for runtime data
    if (mkdir_p("/run") == 0) {
        if (mount_fs("tmpfs", "/run", "tmpfs", 0) != 0) {
            fprintf(stderr, "Warning: Failed to mount /run\n");
        }
    }
    
    // Initialize network interfaces
    init_network();
    
    printf("\nStarting Qt6 GUI application...\n");
    printf("Welcome to SparkOS!\n");
    printf("===================\n");
    printf("Base OS: Read-only (immutable)\n");
    printf("Writable: /tmp, /var (overlay), /run\n");
    printf("Mode: Qt6 GUI (Network-First Architecture)\n");
    printf("No Users/Authentication - Direct Boot to GUI\n");
    printf("No CLI/Shell - Pure GUI Experience\n\n");
    
    // Main loop - keep respawning GUI application
    while (1) {
        spawn_gui();
        
        // If GUI exits, respawn after a short delay
        printf("\nGUI application exited. Restarting in 2 seconds...\n");
        sleep(2);
    }
    
    return 0;
}
