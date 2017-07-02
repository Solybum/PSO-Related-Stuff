#!/usr/bin/env node

/*--------------------------------------------------------------------------
  Utility for converting njm animations to a format compatible with noesis
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
var FilePointer = require("filepointer");

var filename = process.argv[2];
var fp = new FilePointer(filename);
var out_file = filename.split(".");
if(out_file.length > 1){
  out_file.pop();
}
out_file = out_file.join("") + "_n.njm";

var iff = {
  "name" : fp.read_iff(),
  "len" : fp.read_dword()
};

console.log(iff);
fp.trim();

var header = {
  "motion" : fp.read_dword(),
  "key_frames" : fp.read_dword(),
  "flags" : fp.read_dword()
};

fp.seek_set(header.motion);
var motion_list = [];
var first = true;
var end = iff.len;
while(fp.get_pos() < end){
  var list_item = {
    pos_a : fp.read_dword(),
    pos_b : fp.read_dword(),
    key_a : fp.read_dword(),
    key_b : fp.read_dword()
  };

  if(first){
    end = list_item.pos_a || list_item.pos_b;
    first = false;
  }

  motion_list.push(list_item);
}

var start = 0x0c;
var buffer_list = [];

for(var i = 0; i < motion_list.length; i++){
  var motion = motion_list[i];

  if(motion.pos_a){
    var real = read_frames(motion.pos_a, motion.key_a);
    motion.pos_a = start;
    start += real.length;
    buffer_list.push(real);
  }

  if(motion.pos_b){
    var real = read_frames(motion.pos_b, motion.key_b);
    motion.pos_b = start;
    start += real.length;
    buffer_list.push(real);
  }

  var buffer = new Buffer(16);
  buffer.writeUInt32LE(motion.pos_a, 0);
  buffer.writeUInt32LE(motion.pos_b, 4);
  buffer.writeUInt32LE(motion.key_a, 8);
  buffer.writeUInt32LE(motion.key_b, 12);

  motion_list[i] = buffer;
}

header.motion = start;
var init = new Buffer(12);
init.writeUInt32LE(header.motion, 0);
init.writeUInt32LE(header.key_frames, 4);
init.writeUInt32LE(header.flags, 8);
buffer_list.unshift(init);
buffer_list = buffer_list.concat(motion_list);

var len = 0;
for(var i = 0; i < buffer_list.length; i++){
  len += buffer_list[i].length;
}

var iff = new Buffer("NMDM....");
iff.writeUInt32LE(len, 4);
buffer_list.unshift(iff);
var file = Buffer.concat(buffer_list);
fs.writeFileSync(out_file, file);

console.log("Exported: %s", out_file);

function read_frames(pos, frames){
  fp.seek_set(pos);

  var key_frames = [];
  for(var i = 0; i < frames; i++){
    var item = {
      "frame_no" : fp.read_word(),
      "mx" : fp.read_word(),
      "my" : fp.read_word(),
      "mz" : fp.read_word()
    };

    var buffer = new Buffer(16);
    buffer.fill(0);
    buffer.writeUInt32LE(item.frame_no, 0);
    buffer.writeUInt32LE(item.mx, 4);
    buffer.writeUInt32LE(item.my, 8);
    buffer.writeUInt32LE(item.mz, 12);
    key_frames.push(buffer);
  }

  //console.log(key_frames);
  return Buffer.concat(key_frames);
}
