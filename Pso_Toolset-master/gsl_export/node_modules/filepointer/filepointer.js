/*--------------------------------------------------------------------------
  FilePointer a small wrapper class for reading binary files
  Copyright (C) 2015  Benjamin Collins

  This utility is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 2 of the License, or
  (at your option) any later version.

  This utility is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with this utility.  If not, see <http://www.gnu.org/licenses/>.
--------------------------------------------------------------------------*/

var fs = require("fs");

module.exports = function(file){
  this.fp = 0;
  if(Buffer.isBuffer(file)){
    this.buffer = file;
  }else{
    this.buffer = fs.readFileSync(file);
  }

  this.is_zero = function(){
    var integer = this.buffer.readUInt32LE(this.fp);
    return !integer;
  }

  this.seek_set = function(offset){
    this.fp = 0;
    this.fp += offset;
  }

  this.seek_cur = function(offset){
    this.fp += offset;
  }

  this.seek_end = function(offset){
    this.fp = this.buffer.length;
    this.fp += offset;
  }

  this.trim = function(){
    this.buffer = this.buffer.slice(this.fp);
    this.fp = 0;
  }

  this.read_byte = function(){
    var integer = this.buffer.readUInt8(this.fp);
    this.fp += 1;
    return integer;
  }

  this.copy = function(start, end){

    if(arguments.length == 1){
      end = this.fp + start;
      start = this.fp;
    }

    var tmp = new Buffer(end - start);
    this.buffer.copy(tmp, 0, start, end);
    return tmp;
  }

  this.read_word = function(){
    var integer = this.buffer.readUInt16LE(this.fp);
    this.fp += 2;
    return integer;
  }

  this.read_dword = function(){
    var integer = this.buffer.readUInt32LE(this.fp);
    this.fp += 4;
    return integer;
  }

  this.read_single = function(){
    var double = this.buffer.readFloatLE(this.fp);
    this.fp += 4;
    double = double.toFixed(6);
    double = parseFloat(double);
    return double;
  }

  this.read_hex = function(len){
    var str = this.buffer.toString("hex", this.fp, this.fp + len);
    this.fp += len;
    return str;
  }

  this.read_str = function(len, cut){
    var str = this.buffer.toString("ascii", this.fp, this.fp + len);

    if(cut){
      var end = str.indexOf("\0");
      str = str.substr(0, end);
    }else{
      str = str.replace(/\0/g, "");
    }

    this.fp += len;
    return str;
  }

  this.read_iff = function(){
    var str = this.buffer.toString("ascii", this.fp, this.fp + 4);
    str = str.replace(/\0/g, "");
    this.fp += 4;
    return str;
  }

  this.get_pos = function(){
    return this.fp;
  }

  this.find = function(match, from_start){
    var pos;
    if(from_start){
     pos = 0;
   }else{
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

  this.read_angle = function(){
    var angle = this.buffer.readInt32LE(this.fp);
    this.fp += 4;
    var angle = angle / 0xFFFF;
    angle = parseInt(360 * angle);
    return angle;
  }

  this.lz77_decomp = function (data){
    var self = {
      ibuf : data,
      obuf : [],
      iofs : 0,
      bit : 0,
      cmd : 0,
      getByte : int_getByte,
      getBit : bool_getBit
    }

    var t, a, b, j, cmd;
    var offset, amount, start;

    while (self.iofs < self.ibuf.length){
      cmd = self.getBit();
      if(cmd){
        self.obuf.push(self.ibuf[self.iofs]);
        self.iofs += 1;
      }else{
        t = self.getBit();
        if(t){
          a = self.getByte();
          b = self.getByte();

          offset = ((b << 8) | a) >> 3;
          amount = a & 7;
          if (self.iofs < self.ibuf.length){
            if (amount == 0)
              amount = self.getByte() + 1;
            else
              amount += 2;
          }
          start = self.obuf.length - 0x2000 + offset;
        }else{
          amount = 0;
          for (j = 0; j < 2; j++){
            amount <<= 1;
            amount |= self.getBit();
          }
          offset = self.getByte();
          amount += 2;

          start = self.obuf.length - 0x100 + offset;
        }
        for(j = 0; j < amount; j++){
          if (start < 0)
            self.obuf.push(0);
          else if (start < self.obuf.length)
            self.obuf.push(self.obuf[start]);
          else
            self.obuf.push(0);

          start += 1;
        }
      }
    }//end while

    return new Buffer(self.obuf);

    function int_getByte(){
      var val = self.ibuf[self.iofs];
      self.iofs += 1;
      return parseInt(val);
    }

    function bool_getBit(){
      if(self.bit == 0){
  	     self.cmd = self.getByte()
         self.bit = 8
      }
      var bit = self.cmd & 1;
      self.cmd >>= 1;
  	  self.bit -= 1;
  	  return parseInt(bit);
    }

  }

}
