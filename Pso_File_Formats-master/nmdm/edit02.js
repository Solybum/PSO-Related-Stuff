var fs = require("fs");
var util = require("util");

if(process.argv.length != 3){
  console.log("Usage node edit02.js <file.njm>");
  process.exit();
}

var buffer = fs.readFileSync(process.argv[2]);
if(!buffer){
  console.log("Could not open file");
  process.exit();
}

const NMDM = "4E4D444D";
const NULL = "00000000";
const TYPE = "03000200";

var data = "";
var offset = 12;
var hex, struct, pos, length, frames, head;
var motion_list = [];
var eof = buffer.readUInt16LE(4);
var pointer = buffer.readUInt16LE(8);
var number_frames = buffer.readUInt16LE(12);

console.log("EOF pointer: %d", eof);
console.log("Motion data: %d", pointer);
console.log("Number of frames: %d", number_frames);

pointer = pointer + 8;
var first = true;
while(pointer < eof){

  struct = {
    pointer : buffer.readUInt16LE(pointer),
    unkown1 : buffer.readUInt16LE(pointer+4),
    frames : buffer.readUInt16LE(pointer+8),
    unkown2 : buffer.readUInt16LE(pointer+12)
  };

  pointer += 16;

  if(struct.unkown2)
    break;

  motion_list.push(struct);

  if(first){
    console.log(struct);
    first = false;
    pointer += 4;
  }

}

console.log(motion_list);

for(var i = 0; i < motion_list.length; i++){
  if(!motion_list[i].pointer)
    continue;

  pos = motion_list[i].pointer + 8;
  length = motion_list[i].frames * 8;
  hex = buffer.toString("hex", pos, pos+length);
  hex = hex.match(/.{1,4}/g)

  for(var v in hex){
    if(hex[v].lastIndexOf("ff") > 1){
        hex[v] = hex[v].substr(0,2) + "0000ff";
    }else{
      hex[v] = hex[v] + "0000";
    }
  }

  motion_list[i].offset = offset;
  offset += hex.length * 4;

  data += hex.join("");
}

for(var i = 0; i < motion_list.length; i++){
  if(!motion_list[i].pointer){
    data += util.format("%s%s%s%s",NULL,NULL,NULL,NULL);
    continue;
  }

  pos = le_string(motion_list[i].offset, true);
  length = le_string(motion_list[i].frames);

  data += pos;
  data += NULL;
  data += length;
  data += NULL;

  if(!i){
    data += NULL;
  }
}


offset = le_string(offset);
frames = le_string(number_frames);
head = offset + frames + TYPE;
data = head + data;

eof = le_string(data.length / 2);
head = NMDM + eof;
data = head + data;

fs.writeFileSync("output02.njm", data, {encoding:"hex"});

function le_string(num){
  var h = num.toString(16);

  if(h.length%2)
    h = "0" + h;

  h = h.match(/.{1,2}/g);
  h = h.reverse();

  h = h.join("");

  while(h.length < 8)
    h += "0";

  return h;
}
