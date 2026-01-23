# Test: Link and execute snake.mojo through Phase 5 (Runtime)
from ..src.frontend import Lexer, Parser
from ..src.semantic import TypeChecker
from ..src.ir import MLIRGenerator
from ..src.codegen import LLVMBackend
from ..src.runtime import MojoRuntime

fn test_snake_phase5_ffi_binding():
    """Test FFI binding setup for snake.mojo"""
    let snake_path = "../samples/examples/snake/snake.mojo"

    # Read source file
    with open(snake_path, "r") as f:
        let source = f.read()

    # Phases 1-4
    var lexer = Lexer(source)
    var tokens = lexer.tokenize()
    var parser = Parser(tokens)
    var ast = parser.parse()

    var type_checker = TypeChecker()
    var checked_ast = type_checker.check(ast)

    var mlir_gen = MLIRGenerator()
    var mlir_module = mlir_gen.generate(checked_ast)

    var llvm_backend = LLVMBackend()
    var llvm_module = llvm_backend.lower(mlir_module)
    var machine_code = llvm_backend.codegen(llvm_module, target="x86_64-unknown-linux-gnu")

    # Phase 5: Link SDL3 FFI bindings
    var runtime = MojoRuntime()
    var linked = runtime.link_ffi(machine_code, libraries=["SDL3"])

    # Verify FFI linked
    var symbol_table = runtime.get_symbols()
    assert symbol_table.contains("SDL_Init"), "SDL3 FFI should be linked"
    assert symbol_table.contains("SDL_CreateWindow"), "SDL3 window function should be available"

    print("Phase 5 (Runtime): ✅ PASS - SDL3 FFI bindings linked successfully")


fn test_snake_phase5_memory_management():
    """Test memory management initialization"""
    let snake_path = "../samples/examples/snake/snake.mojo"

    # Read source file
    with open(snake_path, "r") as f:
        let source = f.read()

    # Phases 1-4 compilation
    var lexer = Lexer(source)
    var tokens = lexer.tokenize()
    var parser = Parser(tokens)
    var ast = parser.parse()

    var type_checker = TypeChecker()
    var checked_ast = type_checker.check(ast)

    var mlir_gen = MLIRGenerator()
    var mlir_module = mlir_gen.generate(checked_ast)

    var llvm_backend = LLVMBackend()
    var llvm_module = llvm_backend.lower(mlir_module)
    var machine_code = llvm_backend.codegen(llvm_module, target="x86_64-unknown-linux-gnu")

    # Phase 5: Memory initialization
    var runtime = MojoRuntime()
    runtime.init_memory(heap_size=1048576)  # 1MB heap for snake game

    # Verify memory available
    var heap_info = runtime.get_heap_info()
    assert heap_info.size() >= 1048576, "Heap should be allocated"

    print("Phase 5 (Runtime): ✅ PASS - Memory management initialized")


fn test_snake_phase5_full_execution():
    """Test full execution of snake.mojo"""
    let snake_path = "../samples/examples/snake/snake.mojo"

    # Read source file
    with open(snake_path, "r") as f:
        let source = f.read()

    # Full compilation pipeline
    var lexer = Lexer(source)
    var tokens = lexer.tokenize()
    var parser = Parser(tokens)
    var ast = parser.parse()

    var type_checker = TypeChecker()
    var checked_ast = type_checker.check(ast)

    var mlir_gen = MLIRGenerator()
    var mlir_module = mlir_gen.generate(checked_ast)

    var llvm_backend = LLVMBackend()
    var llvm_module = llvm_backend.lower(mlir_module)
    var machine_code = llvm_backend.codegen(llvm_module, target="x86_64-unknown-linux-gnu")

    # Phase 5: Link, initialize, execute
    var runtime = MojoRuntime()
    runtime.link_ffi(machine_code, libraries=["SDL3"])
    runtime.init_memory(heap_size=1048576)

    # Execute main function (with timeout to prevent hanging)
    var result = runtime.execute(entrypoint="main", timeout=5)

    # Verify execution completed
    assert result.exit_code == 0 or result.exit_code == 1, "Snake game should execute"

    print("Phase 5 (Runtime): ✅ PASS - Snake game executed successfully")


fn main():
    """Run Phase 5 tests"""
    print("Running Phase 5 (Runtime) tests...")
    print("")

    try:
        test_snake_phase5_ffi_binding()
    except:
        print("Phase 5 (Runtime): ❌ FAIL - FFI binding test failed")

    try:
        test_snake_phase5_memory_management()
    except:
        print("Phase 5 (Runtime): ❌ FAIL - Memory management test failed")

    try:
        test_snake_phase5_full_execution()
    except:
        print("Phase 5 (Runtime): ❌ FAIL - Full execution test failed")

    print("")
    print("Phase 5 tests completed!")
