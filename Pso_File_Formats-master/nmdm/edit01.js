var net = require("net");
var fs = require("fs");
var util = require("util");

const NULL = null;
const SEEK_SET = 0;
const SEEK_CUR = NULL;
const SEEK_END = -1;

fs.stat = fs.statSync;
fs.open = fs.openSync;

fs.read = function(p, length, flag){
  var buffer = new Buffer(length);
  fs.readSync(p, buffer, 0, length, flag)
  return buffer;
}

var tmp, eof, pointer, frames;
var filename = "rappy_ep2.njm";
var motion_list = [];
var fp = fs.open(filename, "r");

//Read head of file
tmp = fs.read(fp, 4, SEEK_SET);
var type = tmp.toString("ascii");
console.log(type);

if(type != "NMDM"){
  console.log("incorrect file type");
  process.exit();
}

//Read eof pointer
tmp = fs.read(fp, 4, SEEK_CUR);
eof = tmp.readUInt16LE(0);
console.log("End of file location %d", eof);

//Read pointer to file
tmp = fs.read(fp, 4, SEEK_CUR);
pointer = tmp.readUInt16LE(0);
console.log("Pointer to motion data %d", pointer);

//Number of frames
tmp = fs.read(fp, 4, SEEK_CUR);
frames = tmp.readUInt16LE(0);
console.log("Number of frames %d", frames);

fs.read(fp, 16, pointer - 4 + 32);
pointer += 34;

while(pointer < eof){
  tmp = fs.read(fp, 16, SEEK_CUR);
  pointer += 16;

  var struct = {
    pointer : tmp.readUInt16LE(0),
    unkown1 : tmp.readUInt16LE(4),
    frames : tmp.readUInt16LE(8),
    unkown2 : tmp.readUInt16LE(12)
  };

  if(struct.unkown2){
    break;
  }

  if(!struct.pointer){
    continue;
  }

  console.log(tmp.toString("hex", 0, 4));
  motion_list.push(struct);

}

console.log(motion_list);
