module github.com/metabuilder/workflow-plugins-go

go 1.21

// Core workflow plugin interface
require (
	github.com/metabuilder/workflow v1.0.0
)

// Math plugins - stdlib only
// control/* - stdlib only
// convert/* - stdlib only
// core/* - stdlib only
// dict/* - stdlib only
// list/* - stdlib only
// logic/* - stdlib only
// string/* - stdlib only
// test/* - stdlib only
// tools/* - stdlib only
// utils/* - stdlib only
// var/* - stdlib only
// notifications/* - stdlib only
// web/* - stdlib only

// All plugins use only Go standard library and the workflow interface
// No external dependencies required beyond the workflow module
