var fs = require("fs");
var pythonjs = require('python-js');
var data = fs.readFileSync("prs_decomp.py");
var pycode = data.toString();
console.log(pycode);
var code = pythonjs.translator.to_javascript(pycode);
console.log(code);
//fs.writeFileSync("py_out.js", code)
