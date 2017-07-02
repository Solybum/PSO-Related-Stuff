#!/usr/bin/env node

/*--------------------------------------------------------------------------
  Utility for extracting files from a bml archive
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

const FILENAME = process.argv[2];
var fp = new FilePointer(FILENAME);

var dest_folder = FILENAME.split(".");
dest_folder.pop();
dest_folder = dest_folder.join("");
try{
  var stat = fs.statSync(dest_folder);
}catch(e){
  fs.mkdirSync(dest_folder);
}

if(stat && !stat.isDirectory()){
  throw new Error("Destination file exists");
  process.exit();
}
dest_folder = dest_folder + "/";

//var stats = fs.lstatSync('/the/path');

/* Read Number of Entires */
fp.seek_set(0x04);
var num_entries = fp.read_dword();
var entry_type = fp.read_dword();
fp.seek_set(0x40);

/* Read Header for Entries */
var entries = [];
for(var i = 0; i < num_entries; i++){
  var item = {};
  item.filename = fp.read_str(0x20);
  item.csize = fp.read_dword();
  item.unk = fp.read_dword();
  item.usize = fp.read_dword();
  item.pvm_csize = fp.read_dword();
  item.pvm_usize = fp.read_dword();
  entries.push(item);
  fp.seek_cur(0x0C);
}

/* Seek to start of archives */
var pos = fp.get_pos();
if(pos & 0x7FF){
  pos = (pos + 0x800) & 0xFFFFF800;
}
fp.seek_set(pos);

/* Loop through each entry */
for(var i = 0; i < num_entries; i++){
  var item = entries[i];

  //Seek ahead if row starts with 0x00
  if(fp.is_zero()){
    fp.seek_cur(0x10);
  }

  //copy File to buffer
  var data = fp.copy(item.csize);
  data = fp.lz77_decomp(data);
  var dest = dest_folder + item.filename;

  //Write to file
  fs.writeFileSync(dest, data);

  //Seek to next entry
  if(item.csize % 0x10){
    item.csize += 0x10 - (item.csize % 0x10);
  }
  fp.seek_cur(item.csize);

  //Check if texture parameter exists
  if(!item.pvm_csize){
    continue;
  }

  //Seek ahead if row starts with 0x00
  if(fp.is_zero()){
    fp.seek_cur(0x10);
  }

  //Read texture entry
  var data = fp.copy(item.pvm_csize);
  data = fp.lz77_decomp(data);
  var texture = data.toString("ascii", 0, 3);
  texture = texture.toLowerCase();
  var dest = dest_folder + item.filename;
  dest = dest.split(".");
  dest.pop();
  dest = dest.join("") + "." + texture;
  fs.writeFileSync(dest, data);

  //Seek to next entry
  if(item.pvm_csize % 0x10){
    item.pvm_csize += 0x10 - (item.pvm_csize % 0x10);
  }
  fp.seek_cur(item.pvm_csize);
};
