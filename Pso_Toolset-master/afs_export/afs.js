#!/usr/bin/env node

/*--------------------------------------------------------------------------
  Utility for exporting afs archives to a folder from command line
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

"use strict";

/****************************************************************************
 * Imports and Global Variable Declarations                                 *
 ****************************************************************************/

var fs = require("fs");

/****************************************************************************
 * Main function - Interpret Command line arguments                         *
 ****************************************************************************/

!function main(){
  var filename = process.argv[2];
  if(!filename){
    console.error("Usage: > afs_export <filename.afs>");
    return 1;
  }

  //Make folder with base filename
  var dest_folder = filename.split(".");
  dest_folder.pop();
  dest_folder = dest_folder.join("");

  try{
    var stat = fs.statSync(dest_folder);
  }catch(e){
    fs.mkdirSync(dest_folder);
  }

  //File exists but not a folder, throw error
  if(stat && !stat.isDirectory()){
    console.error("Destination file exists");
    return 1;
  }
  var dst = dest_folder + "/";

  //parse afs file
  var afs = parse_afs(filename);
  var len = afs.length.toString().length;

  var name, num, ext;
  for(var i = 0; i < afs.length; i++){
    num = i.toString();
    while(num.length < len){
      num = "0" + num;
    }
    ext = get_extension(afs[i]);
    name = dst + "file_" + num + ext;
    fs.writeFileSync(name, afs[i]);
  }

}();

/****************************************************************************
 * Parse Afs - Takes an afs file and returns an array of buffers            *
 ****************************************************************************/

function parse_afs(filename){
  var fp = fs.readFileSync(filename);
  var num_items = fp.readUInt32LE(4);

  var files = [];

  var pos = 8;
  var offset, length, buffer;
  for(var i = 0; i < num_items; i++){
    offset = fp.readUInt32LE(pos);
    length = fp.readUInt32LE(pos + 4);
    buffer = new Buffer(length);
    fp.copy(buffer, 0, offset, offset + length);
    buffer = lzss_decompress(buffer);
    files.push(buffer);
    pos += 8;
  }

  return files;
}

/****************************************************************************
 * get_extension, returns a file extension based iff magic number           *
 ****************************************************************************/

function get_extension(buffer){
  var formats = {
    'AFS'   : ".afs",
    'XVMH'  : ".xvm",
    'NJCM'  : ".nj",
    'NJTL'  : ".nj",
    'PVRT'  : ".pvr",
    'PVMH'  : ".pvm"
  };
  var iff = buffer.toString("ascii", 0, 4);
  iff = iff.replace(/\0/g, "");

  if(formats[iff]){
    return formats[iff];
  }else{
    return ".bin";
  }
}

/****************************************************************************
 * lzss_decompress - Decompresses a buffer based on the lz77 algorythm      *
 ****************************************************************************/

 function lzss_decompress(data){
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
   }//while

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
