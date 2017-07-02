var fs = require("fs");

module.exports = function(filename){
  this.fp = 0;
  this.buffer = fs.readFileSync(filename);

  this.SEEK_SET = 0;
  this.SEEK_CUR = 1;
  this.SEEK_END = 2;

  this.seek = function(offset, pos){
    if(pos === 0){
      pos = 0;
    }else if(pos === 2){
      pos = this.buffer.length;
    };

    this.fp = pos;
    this.fp += offset;
  }

  this.advance = function(offset){
    this.fp += offset;
  }

  this.trim = function(){
    this.buffer = this.buffer.slice(this.fp);
    this.fp = 0;
  }

  this.slice = function(start, end){
    var tmp = new this.buffer(end - start);
    this.buffer.copy(tmp, 0, start, end);
    return tmp;
  }

  this.readWord = function(){
    var integer = this.buffer.readUInt16LE(this.fp);
    this.fp += 2;
    return integer;
  }

  this.readDword = function(){
    var integer = this.buffer.readUInt32LE(this.fp);
    this.fp += 4;
    return integer;
  }

  this.readSingle = function(){
    var double = this.buffer.readFloatLE(this.fp);
    this.fp += 4;
    double = double.toFixed(6);
    double = parseFloat(double);
    return double;
  }

  this.readHex = function(len){
    var str = this.buffer.toString("hex", this.fp, this.fp + len);
    this.fp += len;
    return str;
  }

  this.readStr = function(len){
    var str = this.buffer.toString("ascii", this.fp, this.fp + len);
    this.fp += len;
    str = str.replace(/\0/g, "");
    return str;
  }

  this.readIff = function(){
    var str = this.buffer.toString("ascii", this.fp, this.fp + 4);
    str = str.replace(/\0/g, "");
    this.fp += 4;
    return str;
  }

  this.ftell = function(){
    return this.fp;
  }

  this.search = function(match, whence){
    var pos;
    if(!whence || whence == 0){
     pos = 0;
   }else if(whence == 1){
     pos = this.fp;
   }

    for(pos; pos < this.buffer.length - 4; pos += 4){
      var str = this.buffer.toString("ascii", pos, pos + 4);
      str = str.replace(/\0/g, "");

      if(str == match){
        this.fp = pos;
        return true;
      }
    }

    return false;
  }

  this.readAngle = function(){
    var angle = this.buffer.readInt32LE(this.fp);
    this.fp += 4;
    var angle = angle / 0xFFFF;
    angle = parseInt(360 * angle);
    return angle;
  }

}
