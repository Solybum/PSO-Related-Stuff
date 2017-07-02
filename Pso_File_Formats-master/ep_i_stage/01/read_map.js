var ninja = require("ninja-lib");
var FilePointer = require("filepointer");

var stage = {};
const FILENAME = "sample/map_lobby_black00n.rel";
var fp = new FilePointer(FILENAME);

fp.seek_end(-16);
var addr = fp.read_dword();
fp.seek_set(addr);

stage.header = {
  num_sections : fp.read_dword(),
  unknown : fp.read_dword(),
  section_addr : fp.read_dword(),
  texture_addr : fp.read_dword()
};

stage.texture = ninja.read_njtl(stage.header.texture_addr, fp);

fp.seek_set(stage.header.section_addr);

stage.sections = [];
for(var i = 0; i < stage.header.num_sections; i++){

  stage.sections[i] = {
    id : fp.read_dword(),
    pos : {
      x : fp.read_single(),
      y : fp.read_single(),
      z : fp.read_single()
    },
    rot : {
      x : fp.read_angle(),
      y : fp.read_angle(),
      z : fp.read_angle(),
    },
    radius : fp.read_single(),
    model_list_a : fp.read_dword(),
    stupid : fp.read_dword(),
    model_list_b : fp.read_dword(),
    num_model_a : fp.read_dword(),
    num_stupid : fp.read_dword(),
    num_model_b : fp.read_dword(),
    end : fp.read_dword()
  };

  stage.sections[i].id = i;
}

for(var i = 0; i < stage.sections.length; i++){
  var section = stage.sections[i];
  section.models = {A:[],B:[]};

  if(section.num_model_a){
    fp.seek_set(section.model_list_a);
    section.model_list_a = [];

    //read address
    for(var k = 0; k < section.num_model_a; k++){
      section.model_list_a[k] = {
        addr : fp.read_dword(),
        zero : [
          fp.read_dword(),
          fp.read_dword(),
          fp.read_dword(),
          fp.read_dword(),
          fp.read_dword(),
          fp.read_dword(),
          fp.read_dword(),
          fp.read_dword(),
          fp.read_dword(),
          fp.read_dword(),
        ],
        end : fp.read_dword()
      };
    }

    //read node
    for(var k = 0; k < section.num_model_a; k++){
      var addr = section.model_list_a[k].addr;
      var model = ninja.read_node(addr, fp);
      console.log(model);
    }

  }//end section a

}
