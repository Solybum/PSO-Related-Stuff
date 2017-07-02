
/*
    Sylverant PSO Tools, BML Tool
    Copyright (C) 2014 Lawrence Sebald
    Adapted to Nodejs By Kion

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License version 3
    as published by the Free Software Foundation.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

var fs = require("fs");

const FILENAME = "item.bml";
extract_bml(FILENAME);

/** boolean - EXTRACT BML -
 * Extract BML Function Definition
 * Takes a filename as an argument
 * Filename must be bml or false will be returned
 * Contents of the file are extracted to filename directory
 */

function extract_bml(filename){
  //var:
  var buffer;
  var num_items,type;
  var offset,entry,i,str,str_pos;
  var tmp_data, new_file;

  //fn:
  buffer = fs.readFileSync(filename);

  if(!buffer)
    return false;

  //parse headers
  num_items = buffer.readUInt32LE(4);

  type = buffer.toString("hex",8,12);
  if(type != "50010000")
    throw new Error("Invalid type debug string");

  //parse entries
  entry = [];
  offset = 0x40;

  for(i = 0; i < num_items; i++){
    //parse filename
    str = buffer.toString("ascii",offset,offset+0x20);
    str_pos = -(32 - str.indexOf("\u0000"));
    str = str.slice(0,str_pos);
    offset += 0x20;

    //parse entry
    entry.push({
      name : str,
      csize : buffer.readUInt32LE(offset),
      unk : buffer.readUInt32LE(offset+0x4),
      usize : buffer.readUInt32LE(offset+0x8),
      pvm_csize : buffer.readUInt32LE(offset+0xc),
      pvm_usize : buffer.readUInt32LE(offset+0x10)
    });

    offset += 0x20;
  }
  console.log(entry);

  //Read files
  if((offset & 0x7FF))
    offset = (offset + 0x800) & 0xFFFFF800;

  for(i = 0; i < num_items; i++){

    if(!buffer.readUInt32LE(offset))
      offset += 0x10;

    tmp_data = new Buffer(buffer.slice(
        offset,
        offset + entry[i].csize
    ));

    tmp_data = lzss_decompress(tmp_data);
    fs.writeFileSync(entry[i].name, tmp_data);
    offset += entry[i].csize;

    if(offset % 0x10)
      offset += (0x10 - (offset % 0x10));

    if(!entry[i].pvm_csize)
      continue;

    str_pos = entry[i].name.lastIndexOf(".");
    str = entry[i].name.substr(0, str_pos) + ".pvm";
    str = "out/" + str;

    tmp_data = new Buffer(buffer.slice(
      offset,
      offset + entry[i].pvm_csize
    ));

    tmp_data = lzss_decompress(tmp_data);
    fs.writeFileSync(str, tmp_data);
    offset += entry[i].pvm_csize;

    if(offset % 0x10)
      offset += (0x10 - (offset % 0x10));
  }

}


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
