# ===----------------------------------------------------------------------=== #
# Copyright (c) 2025, Modular Inc. All rights reserved.
#
# Licensed under the Apache License v2.0 with LLVM Exceptions:
# https://llvm.org/LICENSE.txt
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
# ===----------------------------------------------------------------------=== #

"""LLVM backend for code generation.

This module handles:
- Lowering MLIR to LLVM IR
- Target-specific code generation
- Object file generation
- Linking
"""


struct LLVMBackend:
    """LLVM backend for generating native code.
    
    Converts optimized MLIR to LLVM IR and then to native machine code.
    Supports multiple targets (x86_64, aarch64, etc.).
    """
    
    var target: String
    var optimization_level: Int
    
    fn __init__(inout self, target: String = "native", optimization_level: Int = 2):
        """Initialize the LLVM backend.
        
        Args:
            target: The target architecture (e.g., "x86_64-linux", "aarch64-darwin").
            optimization_level: The optimization level (0-3).
        """
        self.target = target
        self.optimization_level = optimization_level
    
    fn lower_to_llvm_ir(self, mlir_code: String) -> String:
        """Lower MLIR to LLVM IR.
        
        Args:
            mlir_code: The optimized MLIR code.
            
        Returns:
            The LLVM IR code.
        """
        var llvm_ir = String("")
        llvm_ir += "; ModuleID = 'mojo_module'\n"
        llvm_ir += "source_filename = \"mojo_module\"\n"
        llvm_ir += "target triple = \"" + self.target + "\"\n\n"
        
        # Add runtime function declarations
        llvm_ir += "; External function declarations\n"
        llvm_ir += "declare void @_mojo_print_string(i8*)\n"
        llvm_ir += "declare void @_mojo_print_int(i64)\n"
        llvm_ir += "declare void @_mojo_print_float(double)\n"
        llvm_ir += "declare void @_mojo_print_bool(i1)\n\n"
        
        # Parse and translate MLIR functions
        llvm_ir += self.translate_mlir_to_llvm(mlir_code)
        
        return llvm_ir
    
    fn translate_mlir_to_llvm(self, mlir_code: String) -> String:
        """Translate MLIR operations to LLVM IR.
        
        Args:
            mlir_code: The MLIR code to translate.
            
        Returns:
            The translated LLVM IR.
        """
        var result = String("")
        var lines = mlir_code.split("\n")
        var in_function = False
        var function_name = String("")
        var has_return_type = False
        var string_constants = String("")
        var string_counter = 0
        var string_lengths = List[Int]()  # Track string lengths by index
        
        for line in lines:
            let trimmed = line[].strip()
            
            # Skip module markers and empty lines
            if trimmed == "module {" or trimmed == "}" or trimmed == "":
                continue
            
            # Parse function definition
            if "func.func @" in trimmed:
                in_function = True
                let parts = trimmed.split("@")
                if len(parts) > 1:
                    let name_part = parts[1].split("(")[0]
                    function_name = name_part
                    
                    # Check if it has return type
                    has_return_type = " -> " in trimmed and "-> i64" in trimmed
                    
                    # Generate function signature
                    if function_name == "main":
                        result += "define i32 @main() {\n"
                        result += "entry:\n"
                    elif has_return_type:
                        # Extract parameters and return type
                        let param_start = trimmed.find("(")
                        let param_end = trimmed.find(")")
                        let return_start = trimmed.find(" -> ")
                        
                        var params = String("")
                        if param_start != -1 and param_end != -1 and param_end > param_start:
                            let param_section = trimmed[param_start+1:param_end]
                            # Parse parameters: %arg0: i64, %arg1: i64
                            let param_list = param_section.split(",")
                            var param_parts = List[String]()
                            for p in param_list:
                                let p_trimmed = p[].strip()
                                if ": i64" in p_trimmed:
                                    let arg_name = p_trimmed.split(":")[0].strip()
                                    param_parts.append("i64 " + arg_name)
                            
                            for i in range(len(param_parts)):
                                if i > 0:
                                    params += ", "
                                params += param_parts[i]
                        
                        result += "define i64 @" + function_name + "(" + params + ") {\n"
                        result += "entry:\n"
                continue
            
            if in_function:
                # Handle return statement
                if trimmed.startswith("return") or "return " in trimmed:
                    if "return %" in trimmed:
                        # return %value : type
                        let parts = trimmed.split(" ")
                        if len(parts) >= 2:
                            let val = parts[1].replace(":", "")
                            if function_name == "main":
                                result += "  ret i32 0\n"
                            else:
                                result += "  ret i64 " + val + "\n"
                    else:
                        result += "  ret i32 0\n"
                    result += "}\n\n"
                    in_function = False
                    continue
                
                # Handle arith.constant for integers
                if "arith.constant" in trimmed and ": i64" in trimmed:
                    # %0 = arith.constant 42 : i64 -> i64 constant directly
                    continue  # We'll inline constants
                
                # Handle arith.constant for strings
                if "arith.constant" in trimmed and ": !mojo.string" in trimmed:
                    # %0 = arith.constant "Hello, World!" : !mojo.string
                    let start = trimmed.find('"')
                    let end = trimmed.rfind('"')
                    if start != -1 and end != -1 and end > start:
                        let string_val = trimmed[start+1:end]
                        let str_len = len(string_val) + 1  # +1 for null terminator
                        
                        # Add string constant to global section
                        let const_name = "@.str" + str(string_counter)
                        string_constants += const_name + " = private constant ["
                        string_constants += str(str_len) + " x i8] c\""
                        string_constants += string_val + "\\00\"\n"
                        string_lengths.append(str_len)
                        string_counter += 1
                    continue
                
                # Handle arithmetic operations
                if "arith.addi" in trimmed:
                    # %2 = arith.addi %0, %1 : i64 -> %2 = add i64 %0, %1
                    let eq_pos = trimmed.find("=")
                    if eq_pos != -1:
                        let result_var = trimmed[:eq_pos].strip()
                        let args_start = trimmed.find("arith.addi") + 10
                        let args_end = trimmed.find(":")
                        if args_end != -1:
                            let args = trimmed[args_start:args_end].strip()
                            result += "  " + result_var + " = add i64 " + args + "\n"
                    continue
                
                if "arith.subi" in trimmed:
                    let eq_pos = trimmed.find("=")
                    if eq_pos != -1:
                        let result_var = trimmed[:eq_pos].strip()
                        let args_start = trimmed.find("arith.subi") + 10
                        let args_end = trimmed.find(":")
                        if args_end != -1:
                            let args = trimmed[args_start:args_end].strip()
                            result += "  " + result_var + " = sub i64 " + args + "\n"
                    continue
                
                if "arith.muli" in trimmed:
                    let eq_pos = trimmed.find("=")
                    if eq_pos != -1:
                        let result_var = trimmed[:eq_pos].strip()
                        let args_start = trimmed.find("arith.muli") + 10
                        let args_end = trimmed.find(":")
                        if args_end != -1:
                            let args = trimmed[args_start:args_end].strip()
                            result += "  " + result_var + " = mul i64 " + args + "\n"
                    continue
                
                # Handle function calls
                if "func.call" in trimmed:
                    # %2 = func.call @add(%0, %1) : (i64, i64) -> i64
                    let eq_pos = trimmed.find("=")
                    let call_pos = trimmed.find("@")
                    let paren_pos = trimmed.find("(", call_pos)
                    let close_paren = trimmed.find(")", paren_pos)
                    
                    if call_pos != -1 and paren_pos != -1:
                        let func_name = trimmed[call_pos+1:paren_pos]
                        let args = trimmed[paren_pos+1:close_paren]
                        
                        if eq_pos != -1:
                            let result_var = trimmed[:eq_pos].strip()
                            result += "  " + result_var + " = call i64 @" + func_name + "(" + args + ")\n"
                        else:
                            result += "  call void @" + func_name + "(" + args + ")\n"
                    continue
                
                # Handle mojo.print
                if "mojo.print" in trimmed:
                    # mojo.print %0 : !mojo.string or mojo.print %2 : i64
                    let parts = trimmed.split(" ")
                    if len(parts) >= 3:
                        let value = parts[1]
                        let type_part = parts[3] if len(parts) > 3 else ""
                        
                        if "!mojo.string" in type_part:
                            # Need to get the string constant
                            let str_idx = string_counter - 1  # Last string added
                            if str_idx >= 0 and str_idx < len(string_lengths):
                                let str_len = string_lengths[str_idx]
                                result += "  %str_ptr = getelementptr ["
                                result += str(str_len) + " x i8], [" + str(str_len) + " x i8]* @.str" + str(str_idx)
                                result += ", i32 0, i32 0\n"
                                result += "  call void @_mojo_print_string(i8* %str_ptr)\n"
                        elif "i64" in type_part:
                            result += "  call void @_mojo_print_int(i64 " + value + ")\n"
                        elif "f64" in type_part:
                            result += "  call void @_mojo_print_float(double " + value + ")\n"
                    continue
        
        # Prepend string constants
        if string_constants != "":
            result = string_constants + "\n" + result
        
        return result
    
    fn compile_to_object(self, llvm_ir: String, obj_path: String) raises -> Bool:
        """Compile LLVM IR to object file using llc.
        
        Args:
            llvm_ir: The LLVM IR code.
            obj_path: The path to write the object file.
            
        Returns:
            True if successful, False otherwise.
        """
        print("  [Backend] Compiling to object file:", obj_path)
        print("  [Backend] Target:", self.target)
        print("  [Backend] Optimization level: O" + str(self.optimization_level))
        
        # Write LLVM IR to temporary file
        let ir_path = obj_path + ".ll"
        
        try:
            # Write IR file
            with open(ir_path, "w") as f:
                f.write(llvm_ir)
            
            # Check if llc is available
            var check_result = os.system("which llc > /dev/null 2>&1")
            if check_result != 0:
                print("  [Backend] Warning: llc not found, skipping object file generation")
                print("  [Backend] Install LLVM to enable compilation: apt-get install llvm")
                return False
            
            # Compile with llc
            var opt_flag = "-O" + str(self.optimization_level)
            var cmd = "llc -filetype=obj " + opt_flag + " " + ir_path + " -o " + obj_path
            print("  [Backend] Running:", cmd)
            
            var result = os.system(cmd)
            if result != 0:
                print("  [Backend] Error: llc compilation failed with code", result)
                return False
            
            print("  [Backend] Successfully generated object file")
            return True
        except:
            print("  [Backend] Error writing LLVM IR file")
            return False
    
    fn link_executable(self, obj_path: String, output_path: String, runtime_path: String = "runtime") raises -> Bool:
        """Link object files into an executable with runtime library.
        
        Args:
            obj_path: Path to the object file.
            output_path: The path to write the executable.
            runtime_path: Path to runtime library directory.
            
        Returns:
            True if successful, False otherwise.
        """
        print("  [Backend] Linking executable:", output_path)
        print("  [Backend] Object file:", obj_path)
        print("  [Backend] Runtime library:", runtime_path)
        
        # Check if C compiler is available
        var check_cc = os.system("which cc > /dev/null 2>&1")
        if check_cc != 0:
            print("  [Backend] Error: C compiler (cc) not found")
            print("  [Backend] Install gcc or clang to enable linking")
            return False
        
        # Build linker command
        # Link object file with runtime library
        var cmd = "cc " + obj_path + " -L" + runtime_path + " -lmojo_runtime -o " + output_path
        print("  [Backend] Running:", cmd)
        
        var result = os.system(cmd)
        if result != 0:
            print("  [Backend] Error: Linking failed with code", result)
            return False
        
        # Make executable
        var chmod_result = os.system("chmod +x " + output_path)
        if chmod_result != 0:
            print("  [Backend] Warning: Could not set executable permissions")
        
        print("  [Backend] Successfully created executable")
        return True
    
    fn compile(inout self, mlir_code: String, output_path: String, runtime_path: String = "runtime") raises -> Bool:
        """Compile MLIR code to a native executable.
        
        Args:
            mlir_code: The optimized MLIR code.
            output_path: The path to write the executable.
            runtime_path: Path to runtime library directory.
            
        Returns:
            True if successful, False otherwise.
        """
        print("[Backend] Starting compilation pipeline...")
        
        # Step 1: Lower MLIR to LLVM IR
        print("[Backend] Step 1: Lowering MLIR to LLVM IR...")
        let llvm_ir = self.lower_to_llvm_ir(mlir_code)
        
        # Step 2: Compile to object file
        print("[Backend] Step 2: Compiling to object file...")
        let object_file = output_path + ".o"
        
        if not self.compile_to_object(llvm_ir, object_file):
            print("[Backend] Compilation failed at object generation")
            return False
        
        # Step 3: Link with runtime library
        print("[Backend] Step 3: Linking executable...")
        if not self.link_executable(object_file, output_path, runtime_path):
            print("[Backend] Compilation failed at linking")
            return False
        
        print("[Backend] Compilation successful!")
        print("[Backend] Executable:", output_path)
        return True
