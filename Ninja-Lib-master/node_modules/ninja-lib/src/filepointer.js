/*
    This file is part of Ninja-lib

    Copyright (C) 2015 Benjamin Collins

    This library is free software: you can redistribute it and/or modify
    it under the terms of the GNU Lesser General Public License as
    published by the Free Software Foundation, either version 2.1 or
    version 3 of the License.

    This library is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Lesser General Public License for more details.

    You should have received a copy of the GNU Lesser General Public
    License along with this library. If not, see <http://www.gnu.org/licenses/>.
*/
var fs = require("fs");

module.exports = function(){
  var fp = 0;
  var buffer = fs.readFileSync(filename);

  this.seek = function(offset, pos){
    if(pos === 0){
      pos = 0;
    }else if(pos === 2){
      pos = buffer.length;
    };

    fp = pos;
    fp += offset;
  }

  this.readWord = function(){
    var integer = buffer.readUInt16LE(fp);
    fp += 2;
    return integer;
  }

  this.readDword = function(){
    var integer = buffer.readUInt32LE(fp);
    fp += 4;
    return integer;
  }

  this.readSingle = function(){
    var double = buffer.readFloatLE(fp);
    fp += 4;
    double = double.toFixed(6);
    double = parseFloat(double);
    return double;
  }

  this.readHex = function(len){
    var str = buffer.toString("hex", fp, fp + len);
    fp += len;
    return str;
  }

  this.readString = function(len){
    var str = buffer.toString("ascii", fp, fp + len);
    fp += len;
    str = str.replace(/\0/g, "");
    return str;
  }

  this.readIFF = function(){
    var str = buffer.toString("ascii", fp, fp + 4);
    fp += 4;
    str = str.replace(/\0/g, "");
    return str;
  }

  this.getPosition = function(){
    return fp;
  }

  this.findIFF = function(match, pos){
    var pos = pos || 0;

    for(pos; pos < buffer.length - 4; pos += 4){
      var str = buffer.toString("ascii", pos, pos + 4);
      str = str.replace(/\0/g, "");

      if(str == match){
        fp = pos;
        return true;
      }
    }

    return false;
  }

  this.readAngle = function(){
    var angle = buffer.readInt32LE(fp);
    fp += 4;
    var angle = angle / 0xFFFF;
    angle = parseInt(360 * angle);
    return angle;
  }

};
