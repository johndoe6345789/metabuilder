#!/usr/bin/env python3
"""
WorkflowUI Test Runner
Self-documenting test infrastructure manager
"""

import argparse
import subprocess
import sys
import os
import time
from pathlib import Path

def run_cmd(cmd, check=True):
    """Run shell command"""
    result = subprocess.run(cmd, shell=True, check=check)
    return result.returncode == 0

def check_port(port):
    """Check if port is in use"""
    result = subprocess.run(
        f"lsof -i :{port} -t",
        shell=True,
        capture_output=True
    )
    return result.returncode == 0

def start_mock_dbal():
    """Start mock DBAL server"""
    if check_port(8080):
        print("✅ Mock DBAL already running on port 8080")
        return True
    
    print("🚀 Starting mock DBAL server on port 8080...")
    subprocess.Popen(
        "npm start",
        shell=True,
        cwd=Path(__file__).parent,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL
    )
    
    # Wait for server to start
    for i in range(10):
        time.sleep(1)
        if check_port(8080):
            print("✅ Mock DBAL started successfully")
            return True
        print(f"   Waiting for server... ({i+1}/10)")
    
    print("❌ Failed to start mock DBAL")
    return False

def start_workflowui():
    """Start WorkflowUI dev server"""
    if check_port(3000):
        print("✅ WorkflowUI already running on port 3000")
        return True
    
    print("🚀 Starting WorkflowUI dev server on port 3000...")
    subprocess.Popen(
        "npm run dev",
        shell=True,
        cwd=Path(__file__).parent.parent,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL
    )
    
    # Wait for server to start
    for i in range(20):
        time.sleep(1)
        if check_port(3000):
            print("✅ WorkflowUI started successfully")
            return True
        print(f"   Waiting for server... ({i+1}/20)")
    
    print("❌ Failed to start WorkflowUI")
    return False

def health_check():
    """Check if both servers are healthy"""
    print("🏥 Checking server health...")
    
    # Check mock DBAL
    result = subprocess.run(
        "curl -s http://localhost:8080/health",
        shell=True,
        capture_output=True,
        text=True
    )
    
    if result.returncode == 0:
        print("✅ Mock DBAL: healthy")
        print(f"   Response: {result.stdout}")
    else:
        print("❌ Mock DBAL: not responding")
        return False
    
    # Check WorkflowUI
    result = subprocess.run(
        "curl -s -I http://localhost:3000",
        shell=True,
        capture_output=True,
        text=True
    )
    
    if result.returncode == 0 and "200 OK" in result.stdout:
        print("✅ WorkflowUI: healthy")
    else:
        print("❌ WorkflowUI: not responding")
        return False
    
    return True

def run_tests(test_type="all", headed=False, ui=False):
    """Run Playwright tests"""
    script_dir = Path(__file__).parent
    os.chdir(script_dir)
    
    cmd = "npx playwright test"
    
    if test_type == "comprehensive":
        cmd += " comprehensive.spec.ts"
    elif test_type != "all":
        cmd += f" {test_type}"
    
    if headed:
        cmd += " --headed"
    
    if ui:
        cmd = "npx playwright test --ui"
    
    print(f"🧪 Running tests: {cmd}")
    return run_cmd(cmd, check=False)

def show_report():
    """Show test report"""
    script_dir = Path(__file__).parent
    os.chdir(script_dir)
    
    print("📊 Opening test report...")
    return run_cmd("npx playwright show-report", check=False)

def stop_servers():
    """Stop both servers"""
    print("🛑 Stopping servers...")
    
    # Kill processes on ports
    for port in [8080, 3000]:
        if check_port(port):
            subprocess.run(
                f"lsof -ti :{port} | xargs kill -9",
                shell=True,
                stderr=subprocess.DEVNULL
            )
            print(f"   Stopped server on port {port}")

def main():
    parser = argparse.ArgumentParser(
        description="WorkflowUI Test Runner",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Quick start (start servers + run all tests)
  %(prog)s run --start-servers
  
  # Run comprehensive E2E tests
  %(prog)s run comprehensive
  
  # Run tests with UI (interactive)
  %(prog)s run --ui
  
  # Check server health
  %(prog)s health
  
  # View test report
  %(prog)s report
  
  # Stop all servers
  %(prog)s stop
        """
    )
    
    subparsers = parser.add_subparsers(dest="command", help="Command to run")
    
    # start-servers
    subparsers.add_parser("start-servers", help="Start mock DBAL + WorkflowUI")
    
    # health
    subparsers.add_parser("health", help="Check server health")
    
    # run
    run_parser = subparsers.add_parser("run", help="Run tests")
    run_parser.add_argument("test_type", nargs="?", default="all", 
                           help="Test type: all, comprehensive, or file path")
    run_parser.add_argument("--start-servers", action="store_true",
                           help="Start servers before running tests")
    run_parser.add_argument("--headed", action="store_true",
                           help="Run tests in headed mode (visible browser)")
    run_parser.add_argument("--ui", action="store_true",
                           help="Run tests in UI mode (interactive)")
    
    # report
    subparsers.add_parser("report", help="Show test report")
    
    # stop
    subparsers.add_parser("stop", help="Stop all servers")
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        return 0
    
    try:
        if args.command == "start-servers":
            start_mock_dbal()
            start_workflowui()
            health_check()
        
        elif args.command == "health":
            health_check()
        
        elif args.command == "run":
            if args.start_servers:
                if not start_mock_dbal():
                    return 1
                if not start_workflowui():
                    return 1
                if not health_check():
                    return 1
            
            run_tests(args.test_type, headed=args.headed, ui=args.ui)
        
        elif args.command == "report":
            show_report()
        
        elif args.command == "stop":
            stop_servers()
        
        return 0
    
    except KeyboardInterrupt:
        print("\n⚠️  Interrupted")
        return 1
    except Exception as e:
        print(f"❌ Error: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main())
