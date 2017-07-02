var fs = require("fs");
var util = require("util");

parse_xj("saber.xj");

function parse_xj(filename){
  //var:
  var buffer;
  var textures;
  var njcm_offset;
  var node_struct;

  //fn:
  var find_str = _find_str;
  var parse_njtl = _parse_njtl;
  var parse_node = _parse_node;
  var parse_model = _parse_model;

  //begin:
  buffer = fs.readFileSync(filename);
  textures = parse_njtl();
  njcm_offset = find_str("njcm");
  node_struct = parse_node(njcm_offset);
  var debug = JSON.stringify(node_struct, null, 2);
  fs.writeFileSync("debug.json", debug);
  return;

  //function defitions

  //Find String
  function _find_str(str){
    if(str.length != 4){
      throw new Error("Must provide length 4 string");
    }

    str = str.toUpperCase();
    for(var i = 0; i < buffer.length - 4; i += 4){
      if(buffer.toString("ascii", i, i + 4) == str){
        return i + 8;
      }
    }

    return -1;
  }

  //Parse NJTL
  function _parse_njtl(){
    var offset = find_str("njtl");
    var fp = offset;
    var textures = [];

    //textlist pointer
    var textlist = {
      entry : buffer.readUInt32LE(fp),
      num_items : buffer.readUInt32LE(fp + 0x04)
    };

    //goto textlist
    fp = textlist.entry + offset;
    for(var i = 0; i < textlist.num_items; i++){
      textures.push({
        filename : buffer.readUInt32LE(fp),
        attr : buffer.readUInt32LE( fp + 0x04),
        texattr : buffer.readUInt32LE( fp + 0x08)
      });
      fp += 0x0C;
    }

    //get texture names
    for(var i = 0; i < textures.length; i++){
      fp = textures[i].filename + offset;
      for(var k = fp; k < fp + 32; k++){
        if(buffer.readUInt32LE(k) == 0){
          textures[i].filename = buffer.toString("ascii", fp, k);
          break;
        }
      }
    }

    return textures;
  }

  function _parse_node(fp){
      var tmp = {
        flags : buffer.readUInt32LE(fp),
        model : buffer.readUInt32LE(fp + 0x04),
        position : [
          buffer.readFloatLE(fp + 0x08).toFixed(6),
          buffer.readFloatLE(fp + 0x0C).toFixed(6),
          buffer.readFloatLE(fp + 0x10).toFixed(6)
        ],
        angle : [
          buffer.readInt32LE(fp + 0x14),
          buffer.readInt32LE(fp + 0x18),
          buffer.readInt32LE(fp + 0x1C),
        ],
        scale : [
          buffer.readFloatLE(fp + 0x20).toFixed(6),
          buffer.readFloatLE(fp + 0x24).toFixed(6),
          buffer.readFloatLE(fp + 0x28).toFixed(6),
        ],
        child : buffer.readUInt32LE(fp + 0x2C),
        sibling : buffer.readUInt32LE(fp + 0x30)
      };

      if(tmp.child){
        tmp.child = parse_node(njcm_offset + tmp.child);
      }
      if(tmp.sibling){
        tmp.sibling = parse_node(njcm_offset + tmp.sibling);
      }
      tmp.model = parse_model(njcm_offset + tmp.model);
      return tmp;
  }

  function _parse_model(fp){
    return {
      a_dword : buffer.readUInt32LE(fp),
      vertex_list : buffer.readUInt32LE(fp + 0x04).toString(16),
      v_tmp : buffer.readUInt32LE(fp + 0x08), //textnum
      strip_list : buffer.readUInt32LE(fp + 0x0C).toString(16),
      s_tmp : buffer.readUInt32LE(fp + 0x10), //textnum
      b_dword : buffer.readUInt32LE(fp + 0x14).toString(16),
      c_dword : buffer.readUInt32LE(fp + 0x18),
      center : [
        buffer.readFloatLE(fp + 0x1C).toFixed(6),
        buffer.readFloatLE(fp + 0x20).toFixed(6),
        buffer.readFloatLE(fp + 0x24).toFixed(6)
      ],
      radius : buffer.readFloatLE(fp + 0x28).toFixed(6)
    };
  }

}
