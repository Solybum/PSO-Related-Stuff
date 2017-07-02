#!/usr/bin/env node

/*--------------------------------------------------------------------------
  Utility for exporting pvm archives to PNG
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

var filename = process.argv[2];
var buffer = fs.readFileSync(filename);

var dword = new Buffer("03000200", "hex");
dword = dword.readUInt32LE(0);

var sections = [0];
for(var fp = 0; fp < buffer.length; fp += 4){
  if(buffer.readUInt32LE(fp) !== dword){
      continue;
  }

  sections.push(fp + 4);
}

var dir = "./output"
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
}

var part = [];
var start, end, len;
for(var i = 0; i < sections.length - 1; i++){
  //copy to buffer
  start = sections[i];
  end = sections[i + 1];

  var len = end - start;
  var tmp = new Buffer(len);
  buffer.copy(tmp, 0, start, end);

  //move footer to head
  var header = new Buffer(12);
  tmp.copy(header, 0, tmp.length - 12, tmp.length);
  var body = new Buffer(len - 12);
  tmp.copy(body, 0, 0, tmp.length - 12);
  tmp = Buffer.concat([header, body], len);

  var p = tmp.readUInt32LE(0);
  p = p - start + 12;
  tmp.writeUInt32LE(p, 0);
  var dword;
  var firstRow = true;
  for(fp = p; fp < tmp.length - 16; fp += 16){
    dword = tmp.readUInt32LE(fp);

    if(firstRow){
      var check = tmp.readUInt32LE(fp + 8);
      if(check > 0 && dword == 0){
        tmp.writeUInt32LE(12, fp);
      }
    }

    if(dword){
      dword = dword - start + 12;
      tmp.writeUInt32LE(dword, fp);
    }

    dword = tmp.readUInt32LE(fp + 4);
    if(firstRow){
      var check = tmp.readUInt32LE(fp + 12);
      if(check > 0 && dword == 0){
        tmp.writeUInt32LE(12, fp+4);
      }
    }

    if(dword){
      dword = dword - start + 12;
      tmp.writeUInt32LE(dword, fp + 4);
    }

    if(firstRow){
      firstRow = false;
    }

  }
  var iff = new Buffer("NMDM....");
  iff.writeUInt32LE(tmp.length, 4);
  tmp = Buffer.concat([iff, tmp], tmp.length + 8);

  var num = i.toString();
  while(num.length < 3){
    num = "0" + num;
  }

  fs.writeFileSync("output/plymotion_" + num + ".njm", tmp);
}
