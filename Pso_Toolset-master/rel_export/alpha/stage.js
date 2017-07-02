"use strict";

var fs = require("fs");
var FilePointer = require("filepointer");
var parse_njcm = require("./njcm.js");

!function main(){
  var filename = process.argv[2];
  if(!filename){
    throw new Error("No filename provided");
  }

  fp = new FilePointer(filename);

  fp.seek_end(-16);
  var pointer = fp.read_dword();
  fp.seek_set(pointer);
  var map = read_header(fp);
  fp.seek_set(map.section);
  var stage = read_sections(fp, map.num_sections);

  for(var i = 0; i < stage.length; i++){
    stage[i] = model_list(fp, stage[i]);

    for(var k = 0; k < stage[i].models.length; k++){
      fp.seek_set(stage[i].models[k]);
      stage[i].models[k] = parse_njcm(fp);
    }
  }

  var str = "";
  var len = 1;
  for(var i = 0; i < stage.length; i++){
    for(var k = 0; k < stage[i].models.length; k++){
      if(!stage[i].models[k]){
        continue;
      }
      var s = stage[i].models[k].toString(len, stage[i].rot, stage[i].trans);
      str += s.str;
      len = s.len;
    }
  }

  var out_file = filename.split(".");
  out_file.pop();
  out_file = folder.join("") + ".obj";

  fs.writeFileSync(out_file, str);
}();


function read_header(fp){
  return {
    num_sections : fp.read_dword(),
    iff_str : fp.read_dword(),
    section : fp.read_dword(),
    texture : fp.read_dword()
  };
}

function read_sections(fp, num_sections){
  var array = [];
  var c = 0.005493164;

  for(var i = 0; i < num_sections; i++){
    var sect = {
      id : fp.read_dword(),
      trans : {
        x : fp.read_single(),
        y : fp.read_single(),
        z : fp.read_single()
      },
      rot : {
        x : (fp.read_dword() & 0xffff) * c,
        y : (fp.read_dword() & 0xffff) * c,
        z : (fp.read_dword() & 0xffff) * c
      },
      radius : fp.read_single(),
      model_a : fp.read_dword(),
      unknown : fp.read_dword(),
      model_b : fp.read_dword(),
      num_model_a : fp.read_dword(),
      num_unknown : fp.read_dword(),
      num_model_b : fp.read_dword(),
      end : fp.read_dword()
    };

    array.push(sect);
  }

  return array;
}

function model_list(fp, sect){
  var addr = [];
  var len = fp.get_len();

  fp.seek_set(sect.model_a);
  for(var i = 0; i < sect.num_model_a; i++){
    addr.push(fp.read_dword());
    fp.seek_cur(0x2c);
  }

  fp.seek_set(sect.model_b);
  for(var i = 0; i < sect.num_model_b; i++){
    addr.push(fp.read_dword());
    fp.seek_cur(0x38);
  }

  var section = {};
  section.trans = sect.trans;
  section.rot = sect.rot;
  section.models = addr;

  return section;
}
