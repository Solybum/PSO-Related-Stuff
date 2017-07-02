var fs = require("fs");

var buffer;
var nj = [];
var xj = [];

buffer = fs.readFileSync("bullet_01.nj");
for(var fp = 0; fp < buffer.length - 4; fp += 4){
  if(!buffer.readUInt32LE(fp)){
    continue;
  }

  nj.push(buffer.toString("hex", fp, fp + 4));
}

buffer = fs.readFileSync("bullet_01.xj");
for(var fp = 0; fp < buffer.length - 4; fp += 4){
  if(!buffer.readUInt32LE(fp)){
    continue;
  }

  xj.push(buffer.toString("hex", fp, fp + 4));
}

console.log("nj: %d, xj: %d", nj.length, xj.length);

var found;
for(var i = 0; i < nj.length; i++){
  found = false;

  for(var k = 0; k < xj.length; k++){
    if(nj[i] == xj[k]){
      found = k;
      break;
    }
  }

  if(found){
    nj[i] = null;
    xj[k] = null;
  }
}

var tmp = [];
for(var i = 0; i < nj.length; i++){
  if(nj[i])
    tmp.push(nj[i]);
}
nj = tmp;

var tmp = [];
for(var i = 0; i < xj.length; i++){
  if(xj[i])
    tmp.push(xj[i]);
}
xj = tmp;

console.log(nj);
console.log(xj);
