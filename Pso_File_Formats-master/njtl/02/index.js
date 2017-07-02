var fs = require("fs");
var path = require("path");
var ninja = require("ninja-lib");

var files = fs.readdirSync("data");
for(var i = 0; i < files.length; i++){
  var base = path.basename(files[i], ".afs");
  fs.mkdirSync(base);
  ninja.extract_afs("data/" + files[i], true, base);
}
