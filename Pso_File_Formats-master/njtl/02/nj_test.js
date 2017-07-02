var fs = require("fs");

const DIR = "ItemModel";
var files = fs.readdirSync(DIR);
for(var i = 0; i < files.length; i++){
  var filename = DIR + "/" + files[i];
  var data = fs.readFileSync(filename);
  console.log(data.toString("hex", 4, 6));
}
