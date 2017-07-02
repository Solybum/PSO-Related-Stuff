#!/usr/bin/env node

/*--------------------------------------------------------------------------
  Utility for exporting gsl archives to a folder from command line
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
var FilePointer = require("filepointer");

/****************************************************************************
 * Main function - Interpret Command line arguments                         *
 ****************************************************************************/

!function main(){
  var filename = process.argv[2];
  if(!filename){
    console.error("Usage: > gsl_export <filename.gsl>");
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

  //parse gsl file
  var gsl = parse_gsl(filename);
  gsl.forEach(function(item){
    var name = dst + item.filename;
    fs.writeFileSync(name, item.data);
  });

  console.log("Export complete");
}();

/****************************************************************************
 * Parse gsl - Takes an gsl file and returns an array of buffers            *
 ****************************************************************************/

function parse_gsl(filename){
  var fp = new FilePointer(filename);

  var gsl = [];
  //read_file header
  while(!fp.is_zero()){
    gsl.push({
      filename : fp.read_str(0x20),
      offset : fp.read_dword(),
      length : fp.read_dword()
    });
    fp.seek_cur(0x08);
  }

  var offset, length;
  for(var i = 0; i < gsl.length; i++){
    fp.seek_set(gsl[i].offset * 2048);
    gsl[i].data = fp.copy(gsl[i].length);
  }

  return gsl;
}
