var fs = require("fs");
var FilePointer = require("./fp.js")

const FILES = [
  "sample/map_aboss01n.rel",
  "sample/map_aancient01_03n.rel",
  "sample/map_aboss02n.rel",
  "sample/map_aboss03n.rel",
  "sample/map_ancient01_03n.rel",
  "sample/map_boss03bn.rel",
  "sample/map_boss03n.rel",
  "sample/map_aforest01n.rel"
];

var fp = new FilePointer(FILES[0]);
fp.seek(-16, fp.SEEK_END);

var offset = fp.readDword();
fp.seek(offset, fp.SEEK_SET);

var num_section = fp.readDword();
var hd = fp.readIFF();

var section_offset = fp.readDword();
var texture_offset = fp.readDword();

//get textures
fp.seek(texture_offset, fp.SEEK_SET);
offset = fp.readDword();
var num_textures = fp.readDword();
fp.seek(offset, fp.SEEK_SET);

var textures = [];
for(var i = 0; i < num_textures; i++){
  textures.push({
    "addr" : fp.readDword(),
    "attr" : fp.readDword(),
    "text_attr" : fp.readDword()
  });
}

fp.seek(textures[0].addr, fp.SEEK_SET);
for(var i = 0; i < num_textures; i++){
  if(i == num_textures - 1){
    next = offset;
  }else{
    next = textures[i+1].addr;
  }

  next = next - textures[i].addr;
  textures[i].str = fp.readString(next);
}

fp.seek(section_offset, fp.SEEK_SET);

var models = [];
var map_section = [];
for(var i = 0; i < num_section; i++){
  map_section.push({
    unknown1 : fp.readDword(),
    pos : {
      x : fp.readSingle(),
      y : fp.readSingle(),
      z : fp.readSingle()
    },
    ang : {
      x : fp.readSingle(),
      y : fp.readSingle(),
      z : fp.readSingle()
    },
    radius : fp.readSingle(),
    pointer1 : fp.readDword(),
    pointer2 : fp.readDword(),
    pointer3 : fp.readDword(),
    num_p1 : fp.readDword(),
    num_p2 : fp.readDword(),
    num_p3 : fp.readDword(),
    unkown2 : fp.readDword()
  });
}


for(var i = 0; i < map_section.length; i++){
  map_section[i].model_entries = [];
  fp.seek(map_section[i].pointer1, fp.SEEK_SET);

  for(var k = 0; k < map_section[i].num_p1; k++){
    map_section[i].model_entries.push({
      addr : fp.readDword(),
      zero : fp.readDword(),
      num : fp.readDword(),
      zeros : [
        fp.readDword(), // 1
        fp.readDword(), // 2
        fp.readDword(), // 3
        fp.readDword(), // 4
        fp.readDword(), // 5
        fp.readDword(), // 6
        fp.readDword(), // 7
        fp.readDword()  // 8
      ],
      flag : fp.readDword()
    });
  }

  for(var k = 0; k < map_section[i].model_entries.length; k++){
    fp.seek(map_section[i].model_entries[k].addr, fp.SEEK_SET);
    models.push({
      flags : fp.readDword(),
      modelAddr : fp.readDword(),
      pos : {
        x : fp.readSingle(),
        y : fp.readSingle(),
        z : fp.readSingle()
      },
      ang : {
        x : fp.readInt32(),
        y : fp.readInt32(),
        z : fp.readInt32()
      },
      scale : {
        x : fp.readSingle(),
        y : fp.readSingle(),
        z : fp.readSingle()
      },
      childAddr : fp.readDword(),
      siblingAddr : fp.readDword(),
      buffer_str : fp.extract(map_section[i].model_entries[k].addr + 8, map_section[i].model_entries[k].addr + (11 * 4))
    });
  }

}

for(var i = 0; i < models.length; i++){
  fp.seek(models[i].modelAddr, fp.SEEK_SET);
  models[i].model = {
    vertexAddr : fp.readDword(),
    textureAddr : fp.readDword()
  }

  fp.seek(models[i].model.vertexAddr, fp.SEEK_SET);
  var model_end = fp.search(0xFF) + 4;
  models[i].model.vBuffer = fp.extract(models[i].model.vertexAddr, model_end);

  fp.seek(models[i].model.textureAddr, fp.SEEK_SET);
  var texture_end = fp.search(0xFF) + 4;
  models[i].model.tBuffer = fp.extract(models[i].model.textureAddr, texture_end);

  models[i].model.vertexAddr = models[i].model.vertexAddr.toString(16);
  models[i].model.textureAddr = models[i].model.textureAddr.toString(16);
}

//write out njtl
var list = [];
var data_str = "";
data_str += dword_to_hex(8);
data_str += dword_to_hex(textures.length);
var texture_start = textures.length * 3 * 0x04 + 0x08;
for(var i = 0 ; i < textures.length; i++){
  while(textures[i].str.length % 4){
    textures[i].str += "\0";
  }

  data_str += dword_to_hex(texture_start);
  data_str += dword_to_hex(textures[i].attr);
  data_str += dword_to_hex(textures[i].text_attr);
  list.push(str_to_hex(textures[i].str));
  texture_start += textures[i].str.length;
}


data_str += list.join("");
data_str += str_to_hex("POF0");
var start = str_to_hex("NJTL");
start += dword_to_hex(data_str.length);
data_str = start + data_str;
data_str += "0400000040424343"; //....@BCC

fs.writeFileSync("test.bin",data_str, {encoding : "hex"});


var node;
var model_str;
for(var i = 0; i < models.length; i++){
  node = models[i];
  console.log();
  model_str = "";
  model_str += dword_to_hex(node.flags);
  model_str += dword_to_hex(13 * 0x04);
  model_str += node.buffer_str.toString("hex");
  model_str += dword_to_hex(0);
  model_str += dword_to_hex(0);
  model_str += dword_to_hex(15 * 0x04);
  model_str += dword_to_hex(15 * 0x04 + node.model.vBuffer.length);
  model_str += node.model.vBuffer.toString("hex");
  model_str += node.model.tBuffer.toString("hex");

  var start = str_to_hex("NJCM");
  start += dword_to_hex(model_str.length/2);
  model_str = start + model_str;
  model_str += str_to_hex("POF0");
  model_str = data_str + model_str;
  break;
}

fs.writeFileSync("model.bin",model_str, {encoding : "hex"});

function dword_to_hex(num){
  num = num.toString(16);
  if(num.length % 2){
    num = "0" + num;
  }
  num = num.match(/.{1,2}/g).reverse().join("");
  while(num.length < 8){
    num += "0";
  }
  return num;
}

function str_to_hex(str){
  return new Buffer(str, "ascii").toString("hex");
}

function str_byte_len(str){
  return new Buffer(str, "hex").length;
}
