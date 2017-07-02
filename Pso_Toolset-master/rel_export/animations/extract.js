"use strict";

var fs = require("fs");
var FilePointer = require("filepointer");

!function main(){
  var fp, map, sections;
  var filename, addr;
  var model_list;

  filename = process.argv[2];
  if(!filename){
    throw new Error("No filename provided");
  }

  fp = new FilePointer(filename);
  fp.seek_end(-16);
  addr = fp.read_dword();

  map = read_header(fp, addr);
  fp.seek_set(map.section_addr);
  sections = read_sections(fp, map.num_sections);
  model_list = read_models(fp, sections);

  for(var i = 0; i < model_list.length; i++){
    model_list[i].njcm = copy_model(fp, model_list[i].njcm);
    model_list[i].nmdm = copy_animation(fp, model_list[i].nmdm);
  }

  var folder = filename.split(".");
  folder.pop();
  folder = folder.join("");
  try{
    var stats = fs.lstatSync(folder);
    if(!stats.isDirectory()){
      throw new Error("Filename :" + folder + "already exists");
    }
  }catch(e){
    fs.mkdirSync(folder);
  }

  for(var i = 0; i < model_list.length; i++){
    fs.writeFileSync(folder + "/file_" + i + ".nj", model_list[i].njcm);
    fs.writeFileSync(folder + "/file_" + i + ".njm", model_list[i].nmdm);
  }

}();

/**************************************************************
 * Read Header                                                *
 **************************************************************/

function read_header(fp, addr){
  fp.seek_set(addr);

  return {
    num_sections : fp.read_dword(),
    iff_str : fp.read_dword(),
    section_addr : fp.read_dword(),
    texture_addr : fp.read_dword()
  };
}


/**************************************************************
 * Read Sections                                              *
 **************************************************************/

function read_sections(fp, num_sections){

  var array = [];
  for(var i = 0; i < num_sections; i++){
    array.push({
      id : fp.read_dword(),
      trans : {
        x : fp.read_single(),
        y : fp.read_single(),
        z : fp.read_single()
      },
      rot : {
        x : (fp.read_dword() & 0xffff),
        y : (fp.read_dword() & 0xffff),
        z : (fp.read_dword() & 0xffff)
      },
      radius : fp.read_single(),
      model_a_addr : fp.read_dword(),
      unknown_addr : fp.read_dword(),
      model_b_addr : fp.read_dword(),
      num_model_a : fp.read_dword(),
      num_unknown : fp.read_dword(),
      num_model_b : fp.read_dword(),
      end : fp.read_dword()
    });
  }

  return array;
}

/**************************************************************
 * Read Models                                                *
 **************************************************************/

function read_models(fp, section){
  var array = [];

  section.forEach(function(area){
    fp.seek_set(area.model_b_addr);
    for(var i = 0; i < area.num_model_b; i++){
      array.push({
        njcm : fp.read_dword(),
        nmdm : fp.read_dword()
      });
      fp.seek_cur(0x34);
    }
  });

  return array;
}

/**************************************************************
 * Copy Model                                                 *
 **************************************************************/

function copy_model(fp, addr){

  var node = {};
  var vert_addr, poly_addr, len;

  fp.seek_set(addr);
  node.obj = fp.copy(13 * 4);
  fp.seek_cur(4);

  var model_addr = fp.read_dword();
  fp.seek_cur(9 * 4);

  var child_addr = fp.read_dword();
  var sibling_addr = fp.read_dword();

  if(model_addr){
    fp.seek_set(model_addr);
    node.model = fp.copy(6 * 4);
    vert_addr = fp.read_dword();
    poly_addr = fp.read_dword();
  }

  if(vert_addr){
    fp.seek_set(vert_addr);
    node.vertex = fp.copy(vert_addr, model_addr);
  }

  if(poly_addr){
    fp.seek_set(poly_addr);
    node.polygon = fp.copy(poly_addr, vert_addr);
  }

  if(child_addr){
    throw new Error("Child exists exception");
  }

  if(sibling_addr){
    throw new Error("Sibling exists exception");
  }

  len = node.obj.length + node.vertex.length + node.polygon.length;
  node.obj.writeUInt32LE(len, 4);
  len = node.obj.length + node.polygon.length;
  node.model.writeUInt32LE(len, 0);
  node.model.writeUInt32LE(node.obj.length, 4);
  len = node.obj.length + node.polygon.length + node.vertex.length + node.model.length;
  var iff = new Buffer("NJCM....");
  iff.writeUInt32LE(len, 4);

  var file = Buffer.concat([
    iff, node.obj, node.polygon, node.vertex, node.model
  ]);

  //fs.writeFileSync("test.nj", file);
  return file;
}

/**************************************************************
 * Animation                                                  *
 **************************************************************/

function copy_animation(fp, addr){
  fp.seek_set(addr);

  var njm = {};
  njm.header = fp.copy(3 * 4);

  var list_addr = fp.read_dword();
  fp.seek_set(list_addr);

  njm.list = fp.copy(4 * 4);
  var pos = 0;
  var start = fp.read_dword();
  if(!start){
    pos = 4;
    start = fp.read_dword();
  }
  njm.list.writeUInt32LE(0x0c, pos);

  njm.frames = fp.copy(start, list_addr);
  njm.header.writeUInt32LE(12 + njm.frames.length, 0);

  var iff = new Buffer("NMDM....");
  var len = njm.header.length + njm.list.length + njm.frames.length;
  iff.writeUInt32LE(len, 4);

  var file = Buffer.concat([
    iff, njm.header, njm.frames, njm.list
  ]);

  return file;
}
