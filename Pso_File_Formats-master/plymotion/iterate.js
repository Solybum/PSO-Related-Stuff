var fs = require("fs");

var filename;
var index = 0;
var buffer = fs.readFileSync("PlyMotionDataPr2.bin");

var tmp;
var nmdm = new Buffer("4E4D444D30CA1C00", "hex");
var njm = fs.readFileSync("PlyMotionDataPr2.bin");

njm = njm.slice(12, njm.length);

for(var i = 0; i < buffer.length - 4; i += 4){
  var str = buffer.toString("hex", i, i+4);

  if(str != "03000200"){
    continue;
  }

  str = buffer.toString("hex", i-8, i+4);
  tmp = new Buffer(str, "hex");

  str = str.match(/.{1,8}/g);
  str = str.join(" ");
  console.log(str);

  index++;
  filename = (index > 9) ? index : "0" + index;
  filename = "output/motion"+filename+".njm";
  fs.writeFileSync(filename, nmdm);
  fs.appendFileSync(filename, tmp);
  fs.appendFileSync(filename, njm);
}
