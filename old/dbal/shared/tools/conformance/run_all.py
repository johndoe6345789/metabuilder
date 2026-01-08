#!/usr/bin/env python3
"""
Conformance test runner
Runs the same test vectors against both TypeScript and C++ implementations
"""

import subprocess
import json
import yaml
from pathlib import Path
from typing import Dict, Any, List
import sys


class ConformanceRunner:
    def __init__(self, root_dir: Path):
        self.root_dir = root_dir
        self.test_dir = root_dir / 'common' / 'contracts'
        self.results = {'ts': {}, 'cpp': {}}
        
    def load_test_cases(self) -> List[Dict[str, Any]]:
        """Load all conformance test cases"""
        test_cases = []
        for yaml_file in self.test_dir.glob('*_tests.yaml'):
            with open(yaml_file) as f:
                cases = yaml.safe_load(f)
                if isinstance(cases, list):
                    test_cases.extend(cases)
        return test_cases
    
    def run_typescript_tests(self) -> bool:
        """Run TypeScript conformance tests"""
        print("\n=== Running TypeScript Conformance Tests ===")
        ts_dir = self.root_dir / 'ts'
        
        try:
            result = subprocess.run(
                ['npm', 'run', 'test:conformance'],
                cwd=ts_dir,
                capture_output=True,
                text=True,
                timeout=300
            )
            
            print(result.stdout)
            if result.returncode != 0:
                print(f"TypeScript tests failed:\n{result.stderr}", file=sys.stderr)
                return False
                
            self.results['ts'] = self.parse_test_output(result.stdout)
            return True
            
        except subprocess.TimeoutExpired:
            print("TypeScript tests timed out", file=sys.stderr)
            return False
        except Exception as e:
            print(f"Error running TypeScript tests: {e}", file=sys.stderr)
            return False
    
    def run_cpp_tests(self) -> bool:
        """Run C++ conformance tests"""
        print("\n=== Running C++ Conformance Tests ===")
        cpp_build_dir = self.root_dir / 'cpp' / 'build'
        
        if not cpp_build_dir.exists():
            print("C++ build directory not found. Run: cd cpp && cmake -B build && make", 
                  file=sys.stderr)
            return False
        
        try:
            result = subprocess.run(
                ['./conformance_tests'],
                cwd=cpp_build_dir,
                capture_output=True,
                text=True,
                timeout=300
            )
            
            print(result.stdout)
            if result.returncode != 0:
                print(f"C++ tests failed:\n{result.stderr}", file=sys.stderr)
                return False
                
            self.results['cpp'] = self.parse_test_output(result.stdout)
            return True
            
        except subprocess.TimeoutExpired:
            print("C++ tests timed out", file=sys.stderr)
            return False
        except Exception as e:
            print(f"Error running C++ tests: {e}", file=sys.stderr)
            return False
    
    def parse_test_output(self, output: str) -> Dict[str, Any]:
        """Parse test output to structured results"""
        results = {}
        for line in output.split('\n'):
            if 'PASS' in line or 'FAIL' in line:
                parts = line.split()
                if len(parts) >= 2:
                    test_name = parts[0]
                    status = 'pass' if 'PASS' in line else 'fail'
                    results[test_name] = status
        return results
    
    def compare_results(self) -> bool:
        """Compare TypeScript and C++ test results"""
        print("\n=== Comparing Results ===")
        
        ts_results = self.results['ts']
        cpp_results = self.results['cpp']
        
        all_tests = set(ts_results.keys()) | set(cpp_results.keys())
        
        mismatches = []
        for test_name in sorted(all_tests):
            ts_status = ts_results.get(test_name, 'missing')
            cpp_status = cpp_results.get(test_name, 'missing')
            
            if ts_status != cpp_status:
                mismatches.append({
                    'test': test_name,
                    'ts': ts_status,
                    'cpp': cpp_status
                })
        
        if mismatches:
            print("\n❌ Implementation Mismatch Detected!")
            print(f"Found {len(mismatches)} test(s) with different results:\n")
            for mismatch in mismatches:
                print(f"  {mismatch['test']}:")
                print(f"    TypeScript: {mismatch['ts']}")
                print(f"    C++:        {mismatch['cpp']}")
            return False
        else:
            print("\n✓ All tests passed consistently across both implementations!")
            print(f"  Total tests: {len(all_tests)}")
            return True
    
    def run_all(self) -> bool:
        """Run all conformance tests"""
        print("DBAL Conformance Test Runner")
        print("=" * 60)
        
        test_cases = self.load_test_cases()
        print(f"Loaded {len(test_cases)} test cases")
        
        ts_success = self.run_typescript_tests()
        cpp_success = self.run_cpp_tests()
        
        if not (ts_success and cpp_success):
            print("\n❌ Conformance tests failed", file=sys.stderr)
            return False
        
        return self.compare_results()


def main():
    root_dir = Path(__file__).parent.parent.parent
    runner = ConformanceRunner(root_dir)
    
    success = runner.run_all()
    sys.exit(0 if success else 1)


if __name__ == '__main__':
    main()
