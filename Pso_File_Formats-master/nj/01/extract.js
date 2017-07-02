var fs = require("fs");
var ninja = require("ninja-lib");
var FilePointer = require("./filepointer.js").fp;

const SEEK_SET = 0;
const SEEK_CUR = 1;
const SEEK_END = 2;

const FILENAME = "models/ItemModel_000.nj";
parse_nj(FILENAME);

function parse_nj(filename){
  var fp = new FilePointer(filename);
  var model = {};
  model.NJTL = parse_NJTL();
  model.NJCM = parse_NJCM();
  return model;

  //parse_NJTL
  function parse_NJTL(){
    if(!fp.findIFF("NJTL")){
      return null;
    }

    var iff = {
      "TYPE" : fp.readIFF(),
      "BYTE" : fp.readDword()
    };

    var header = {
      "Entry" : fp.readDword(),
      "Num_Textures" : fp.readDword()
    };

    header.List = [];
    for(var i = 0; i < header.Num_Textures; i++){
      header.List.push({
        "Pointer" : fp.readDword(),
        "Attr" : fp.readDword(),
        "Texture_Attr" : fp.readDword()
      });
    }

    for(var i = 0; i < header.Num_Textures; i++){
      var length;
      var next = i + 1;

      if(!header.List[next]){
        length = iff.BYTE - header.List[i].Pointer;
      }else{
        length = header.List[next].Pointer - header.List[i].Pointer;
      }

      delete header.List[i].Pointer;
      header.List[i].String = fp.readString(length);
    }

    return header.List;
  }//end NJTL

  //parse_NJCM
  function parse_NJCM(){
    if(!fp.findIFF("NJCM")){
      throw new Error("Could not find NJCM");
    }

    var iff = {
      "TYPE" : fp.readIFF(),
      "BYTE" : fp.readDword()
    };

    const NJCM_OFFSET = fp.getPosition();
    console.log("NJCM_OFFSET ", NJCM_OFFSET.toString(16));

    var nodes = [];
    read_node(NJCM_OFFSET);
    read_model(nodes);
    return nodes;

    function read_node(offset, p, s){
      fp.seek(offset, SEEK_SET);

      var node = {
        evalflags : fp.readDword(),
        modelAddr : fp.readDword(),
        pos : {
          x : fp.readSingle(),
          y : fp.readSingle(),
          z : fp.readSingle()
        },
        ang : {
          x : fp.readAngle(),
          y : fp.readAngle(),
          z : fp.readAngle()
        },
        scale : {
          x : fp.readSingle(),
          y : fp.readSingle(),
          z : fp.readSingle()
        },
        childAddr : fp.readDword(),
        siblingAddr : fp.readDword()
      };

      if(p){
        node.parentNode = p;
      }else if(s){
        node.siblingNode = s;
      }

      nodes.push(node);
      node.ID = nodes.length;

      if(node.childAddr){
        node.childAddr += NJCM_OFFSET;
        read_node(node.childAddr, node.ID, null);
      }

      if(node.siblingAddr){
        node.siblingAddr += NJCM_OFFSET;
        read_node(node.siblingAddr, null, node.ID);
      }

      console.log(node);

      delete node.childAddr;
      delete node.siblingAddr;

    }//end node

    function read_model(nodes){

      var offset;
      for(var i = 0; i < nodes.length; i++){
        offset = nodes[i].modelAddr + NJCM_OFFSET + 8;
        fp.seek(offset, SEEK_SET);

        console.log("Model offset", nodes[i].modelAddr.toString(16));
        //delete nodes[i].modelAddr;
        nodes[i].modelAddr = nodes[i].modelAddr.toString();

        var NJS_MODEL = {
          VertexListAddr : fp.readDword(), //NJS_POINT3
          NormalListAddr : fp.readDword(), //NJS_VECTOR
          num_points : fp.readDword(),
          MeshSheetsAddr : fp.readDword(), //NJS_MESHSET
          MaterialListAddr : fp.readDword(), //NJS_MATERIAL
          num_meshs : fp.readWord(),
          num_mats : fp.readWord(),
          center : {
            x : fp.readSingle(),
            y : fp.readSingle(),
            z : fp.readSingle()
          },
          radius : fp.readSingle()
        };

        //NJS_POINT3
        if(NJS_MODEL.VertexListAddr){
          offset = NJS_MODEL.VertexListAddr + NJCM_OFFSET;
          delete NJS_MODEL.VertexListAddr;

          NJS_MODEL.VertexList = [];
          for(var k = 0; k < nodes[i].num_points; k++){
            NJS_MODEL.VertexList.push({
              x : fp.readSingle(),
              y : fp.readSingle(),
              z : fp.readSingle()
            });
          }
        }

        //NJS_VECTOR
        if(NJS_MODEL.NormalListAddr){
          offset = NJS_MODEL.NormalListAddr + NJCM_OFFSET;
          delete NJS_MODEL.NormalListAddr;

          NJS_MODEL.NormalList = [];
          for(var k = 0; k < nodes[i].num_points; k++){
            NJS_MODEL.NormalList.push({
              x : fp.readSingle(),
              y : fp.readSingle(),
              z : fp.readSingle()
            });
          }
        }
        console.log(NJS_MODEL);
        //return
        nodes[i].NJS_MODEL = NJS_MODEL;
      }
    }//end read_model

  }//end_njcm

}
