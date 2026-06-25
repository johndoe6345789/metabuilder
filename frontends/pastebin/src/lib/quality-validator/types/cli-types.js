/**
 * CLI and command line option types for the Quality Validation tool
 */
export var ExitCode;
(function (ExitCode) {
    ExitCode[ExitCode["SUCCESS"] = 0] = "SUCCESS";
    ExitCode[ExitCode["QUALITY_FAILURE"] = 1] = "QUALITY_FAILURE";
    ExitCode[ExitCode["CONFIGURATION_ERROR"] = 2] = "CONFIGURATION_ERROR";
    ExitCode[ExitCode["EXECUTION_ERROR"] = 3] = "EXECUTION_ERROR";
    ExitCode[ExitCode["KEYBOARD_INTERRUPT"] = 130] = "KEYBOARD_INTERRUPT";
})(ExitCode || (ExitCode = {}));
