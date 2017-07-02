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

/****************************************************************************
 * Imports and Global Variable Declarations                                 *
 ****************************************************************************/

var fs = require("fs");
var PNG = require("pngjs").PNG;
var FilePointer = require("filepointer");

/****************************************************************************
 * Main - Takes a PVM file as an argument and writes a folder of PNG files  *
 ****************************************************************************/

!function main(){
  var filename;
  filename = process.argv[2];

  //debug set default filename
  if(!filename){
    console.error("Usage: > pvm_export <filename.pvm>");
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
  dest_folder = dest_folder + "/";

  var pvm = parse_pvm(filename);

  var index = -1;
  next();
  function next(buffer){
    if(buffer){
      var filename = dest_folder;
      filename += pvm[index].str + ".png";
      fs.writeFileSync(filename, buffer);
    }

    index++;
    if(!pvm[index]){
      console.log("Export complete");
      return;
    }

    parse_pvr(pvm[index].data, next);
  }

}();

/****************************************************************************
 * Parse PVM - Reads PVM archive and returns array of pvr buffers           *
 ****************************************************************************/

function parse_pvm(name){
  var fp = new FilePointer(name);

  var iff = {
    name : fp.read_iff(),
    len: fp.read_dword()
  };
  fp.trim();

  iff.flags = fp.read_word();
  iff.num_textures = fp.read_word();

  var flag = iff.flags;
  iff.flags = {};
  iff.flags.global_index = Boolean(flag & 0x01);
  iff.flags.dimensions = Boolean(flag & 0x02);
  iff.flags.data_format = Boolean(flag & 0x04);
  iff.flags.filenames = Boolean(flag & 0x08);

  var entries = [];
  for(var i = 0; i < iff.num_textures; i++){
    var item = {};

    item.id = fp.read_word();

    if(iff.flags.filenames){
      item.str = fp.read_str(0x1C);
    }

    if(iff.flags.data_format){
      item.format = fp.read_word();
    }

    if(iff.flags.dimensions){
      item.width = fp.read_byte();
      item.height = fp.read_byte();
    }

    if(iff.flags.global_index){
      item.index = fp.read_dword();
    }

    entries.push(item);
  }

  fp.seek_set(iff.len);
  for(var i = 0; i < iff.num_textures; i++){
    var debug = fp.read_iff();
    var len = fp.read_dword();

    if(debug != "PVRT"){
      throw new Error("Unexpected input");
    }

    fp.seek_cur(-8);
    len += 0x08;
    entries[i].data = fp.copy(len);
    fp.seek_cur(len);
  }

  return entries;
}


/****************************************************************************
 * Parse PVR - Reads PVR Buffer and returns a PNG image buffer              *
 ****************************************************************************/

function parse_pvr(buffer, callback){
  var fp = new FilePointer(buffer);

  //read the header
  var pvr = {
    name : fp.read_iff(),
    len : fp.read_dword(),
    pixel : fp.read_byte(),
    data : fp.read_byte(),
    zero : fp.read_word(),
    width : fp.read_word(),
    height : fp.read_word()
  };

  //read all of the data to array
  var img_data = [];
  var img_len = pvr.width * pvr.height;
  for(var i = 0; i < img_len; i++){
    img_data.push(fp.read_word());
  }

  //Create buffer based on pixel data format
  switch(pvr.data){
    case 1:
      img_data = square_twiddled(img_data, pvr.width);
    break;
    default:
      console.error("Unknown data format: %d", pvr.data);
      return 1;
    break;
  }

  switch(pvr.pixel){
    case 0x00:
      img_data = format_pixels(img_data, ARGB1555);
    break;
    case 0x01:
      img_data = format_pixels(img_data, ARGB0565);
    break;
    case 0x02:
      img_data = format_pixels(img_data, ARGB4444);
    break;
    default:
      console.error("Unkown pixel format %d", iff.pixel);
      return 1;
    break;
  }


  outputPNG(img_data, pvr.width, pvr.height, callback);
}

/****************************************************************************
 * PVR Pixel and Format Helper Functions                                    *
 ****************************************************************************/

function format_pixels(data, fn){
  var buffer = [];

  for(var i = 0; i < data.length; i++){
    p = fn(data[i]);
    p.forEach(function(c){
      buffer.push(c);
    });
  }

  return new Buffer(buffer);
}

function ARGB0565(v){
  var a = 0xff;
  var r = (v >> (11-3)) & (0x1f<<3);
  var g = (v >> (5-2)) & (0x3f<<2);
  var b = (v << 3) & (0x1f<<3);

  return [r,g,b,a];
}

function ARGB4444(v){
  var a = (v >> (12-4)) & 0xf0;
  var r = (v >> (8-4)) & 0xf0;
  var g = (v >> (4-4)) & 0xf0;
  var b = (v << 4) & 0xf0;

  return [r,g,b,a];
}

function ARGB1555(v){
  var a = (v & (1<<15)) ? 0xff : 0;
  var r = (v >> (10-3)) & 0xf8;
  var g = (v >> (5-3)) & 0xf8;
  var b = (v << 3) & 0xf8;

  return [r,g,b,a];
}

function square_twiddled(twiddled, imgsize){
  var ptr = -1;
  var detwiddled = [];
  subdivide_and_move(0, 0, imgsize, 0);
  return detwiddled;

  function read_pixel(){
    ptr++;
    return twiddled[ptr];
  }

  function subdivide_and_move(x1, y1, size, op) {
  	if (size == 1) {
  	   detwiddled[y1*imgsize+x1] = read_pixel();
  	} else {
  		var ns = size/2;
  		subdivide_and_move(x1, y1, ns);
  		subdivide_and_move(x1, y1+ns, ns);
  		subdivide_and_move(x1+ns, y1, ns);
  		subdivide_and_move(x1+ns, y1+ns, ns);
  	}
  }
}

function outputPNG( data, width, height, callback ) {
    // provides width/height so it is initialized with the correct-size buffer
    var png = new PNG({
      width: width,
      height: height
    });

    // copy our image data into the pngjs.PNG's data buffer;
    data.copy( png.data, 0, 0, data.length );

    // will concatenate the buffers from the stream into one once it is finished
    var buffers = [];
    png.on( 'data', function( buffer ) {
      buffers.push( buffer );
    } );
    png.on( 'end', function() {
      var buffer = Buffer.concat( buffers );

      callback( buffer );
    } );
    png.on( 'error', function( err ) {
      throw err;
    } );

    // kick off the encoding of the PNG
    png.pack();
}
