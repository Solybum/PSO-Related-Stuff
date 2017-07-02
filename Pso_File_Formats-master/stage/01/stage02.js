/****************************************************************************
 * Pso Episode I Map Parser  Copyright 2015 Kion                            *
 ***************************************************************************/

var fs = require("fs");
var util = require("util");

/****************************************************************************
 * main                                                                     *
 ***************************************************************************/

!function main(args){
  //var:
  var file, filename, model;

  //fn:
  model = {};
  filename = "sample/" + args;
  file = fs.readFileSync(filename);

  if(!file){
    console.log("Could not open file");
    process.exit();
  }

  /*
  str = file.toString("hex");
  str = str.match(/.{1,4}/g);
  for(var i = 0; i < str.length; i++){
    str[i] = str[i].match(/.{1,2}/g);
    str[i] = str[i].reverse();
    str[i] = str[i].join("");
  }
  str = str.join("");
  file = new Buffer(str, "hex");
  */
  
  //Get information from header
  var pointer = file.readUInt32LE(file.length - 16);
  var header = get_file_header(file, pointer);

  //model.textures = get_texture_list(file, header.texture_offset);
  model.sections = get_section_list(file, header.section_offset, header.num);
  console.log(model.sections);

  //loop through every section
  var item, groups;
  for(var i = 0; i < model.sections.length; i++){
    item = model.sections[i];
    groups = model_entry_01(file, item.model_list[0], item.num_models[0]);
    item.groups = groups;
  }

  //write_obj_file(model);
}("map_cardlobby01n.rel")

/****************************************************************************
 * get_file_header                                                         *
 ***************************************************************************/

function get_file_header(fp, pos){
  return {
    num : fp.readUInt32LE(pos + 0x00),
    type : fp.readUInt32LE(pos + 0x04).toString(16),
    section_offset : fp.readUInt32LE(pos + 0x08),
    texture_offset : fp.readUInt32LE(pos + 0x0c)
  };
}

/****************************************************************************
 * get_vertex_list                                                         *
 ***************************************************************************/

function get_texture_list(fp, offset){
  var text_list_offset = fp.readUInt32LE(offset + 0x00);
  var num_textures = fp.readUInt32LE(offset + 0x04);

  var pointers = [];
  var pos = text_list_offset;
  for(var i = 0; i < num_textures; i++){
    pointers.push(fp.readUInt32LE(pos));
    pos += 0x0C;
  }
  pointers.push(text_list_offset);

  var str_pos;
  var textures = [];
  for(var i = 0; i < pointers.length - 1; i++){
    textures[i] = fp.toString("ascii", pointers[i], pointers[i + 1]);
    str_pos = textures[i].indexOf("\u0000");
    textures[i] = textures[i].substr(0, str_pos);
  }

  return textures;
}


/****************************************************************************
 * get_section_list                                                         *
 ***************************************************************************/

function get_section_list(fp, offset, num){
  var sections = [];

  for(var i = 0; i < num; i++){
      sections.push({
        section_no : fp.readUInt32LE(offset + 0x00),
        position : {
          x : fp.readFloatLE(offset + 0x04),
          y : fp.readFloatLE(offset + 0x08),
          z : fp.readFloatLE(offset + 0x0C)
        },
        rotation : {
          x : fp.readInt32LE(offset + 0x10),
          y : fp.readInt32LE(offset + 0x14),
          z : fp.readInt32LE(offset + 0x18)
        },
        radius : fp.readFloatLE(offset + 0x1C),
        model_list : [
          fp.readInt32LE(offset + 0x20), //0x014BE8
          fp.readInt32LE(offset + 0x24), //0x014C18
          fp.readInt32LE(offset + 0x28)  //0x014D50
        ],
        num_models : [
          fp.readInt32LE(offset + 0x2C), //0x01
          fp.readInt32LE(offset + 0x30), //0x1A
          fp.readInt32LE(offset + 0x34)  //0x03
        ],
        fin : fp.readInt32LE(offset + 0x38).toString(16)
      });
      offset += 0x3C;
  }

  return sections;
}

/****************************************************************************
 * model_entry 01                                                           *
 ***************************************************************************/

function model_entry_01(fp, offset, num){
  var pos;
  var models = [];
  var pointer;
  console.log(num);
  for(var i = 0; i < num; i++){
    //read the offset

    var pointer = fp.readUInt32LE(offset);
    offset += 0x30;

    //goto offset and get model information
    pos = pointer;
    //NJS_OBJECT
    models[i] = {
      flags : fp.readUInt32LE(pos).toString(16),
      njs_model : fp.readUInt32LE(pos + 0x04),
      position : {
        x : fp.readFloatLE(pos + 0x08),
        y : fp.readFloatLE(pos + 0x0C),
        z : fp.readFloatLE(pos + 0x10)
      },
      rotation : {
        x : fp.readInt32LE(pos + 0x14),
        y : fp.readInt32LE(pos + 0x18),
        z : fp.readInt32LE(pos + 0x1C)
      },
      scale : {
        x : fp.readFloatLE(pos + 0x20),
        y : fp.readFloatLE(pos + 0x24),
        z : fp.readFloatLE(pos + 0x28)
      },
      child : fp.readUInt32LE(pos + 0x2C),
      sibling : fp.readUInt32LE(pos + 0x30),
    };
    console.log(models[i]);
    //NJS_MODEL
    pos = models[i].njs_model;
    models[i].njs_model = {
      vertex : fp.readUInt32LE(pos),
      normals : fp.readUInt32LE(pos + 0x04)
    };

    //Points
    pos = models[i].njs_model.vertex;
    models[i].njs_model.vert_info = {
      mesh : fp.readUInt16LE(pos),
      flag : fp.readUInt16LE(pos+0x02),
      zero : fp.readUInt16LE(pos+0x04),
      num_verts : fp.readUInt16LE(pos+0x06)
    };

    models[i].vertex = [];
    pos += 0x08;
    for(var k = 0; k < models[i].njs_model.vert_info.num_verts; k++){
      models[i].vertex.push({
        x : fp.readFloatLE(pos),
        y : fp.readFloatLE(pos + 0x04),
        z : fp.readFloatLE(pos + 0x08),
        color : {
          r : fp[pos + 0x0C],
          g : fp[pos + 0x0D],
          b : fp[pos + 0x0E],
          a : fp[pos + 0x0F]
        }
      });
      pos += 0x10;
    }

    //normals
    pos = models[i].njs_model.normals;
    models[i].njs_model.norm_info = {
      mesh : fp.readUInt16LE(pos),
      flag : fp.readUInt16LE(pos+0x02),
      zero : fp.readUInt16LE(pos+0x04),
      num_verts : fp.readUInt16LE(pos+0x06)
    };

    models[i].njs_model.normals = [];
    for(var k = 0; k < models[i].njs_model.vert_info.num_verts; k++){

    }
  }

  return models;
}

/****************************************************************************
 * write obj file                                                           *
 ***************************************************************************/

 function write_obj_file(model){
   var pos, rot, item, section, vertices, str;
   var total = 1;
   section = model.sections;
   //console.log(model);
   fs.writeFileSync("output.obj", "");
   for(var i = 0; i < section.length; i++){
     //section information
     pos = section[i].position;
     rot = section[i].rotation;

     //group
     for(var k = 0; k < section[i].models.length; k++){
      vertices = section[i].models[k].model.vertexes;

      //write vertices
      for(var j = 0; j < vertices.length; j++){
        console.log(vertices[j]);
        str = util.format("v %s %s %s\r\n",
          vertices[j].x.toFixed(6),
          vertices[j].y.toFixed(6),
          vertices[j].z.toFixed(6)
        );
        fs.appendFileSync("output.obj", str);
      }

      for(var j = 0; j < vertices.length - 1; j++){
        a = j + total;
        b = j + 1 + total;
        c = j + 2 + total;
        d = (j) ? j - 1 + total : 0;

        if(!j % 2){
          str = util.format("f %d %d %d\r\n", a, b, c);
          fs.appendFileSync("output.obj", str);
          str = util.format("f %d %d %d\r\n", a, c, b);
          fs.appendFileSync("output.obj", str);
        }else{
          str = util.format("f %d %d %d\r\n", a, d, b);
          fs.appendFileSync("output.obj", str);
          str = util.format("f %d %d %d\r\n", a, b, d);
          fs.appendFileSync("output.obj", str);
        }
      }

     }
   }
 }
