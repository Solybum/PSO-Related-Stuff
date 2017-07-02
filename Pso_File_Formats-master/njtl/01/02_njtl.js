var fs = require("fs");
var util = require("util");

parse_xj("saber.xj");

function parse_xj(filename){
  //var:
  var buffer;
  var textures;

  //fn:
  var find_str = _find_str;
  var parse_njtl = _parse_njtl;

  //begin:
  buffer = fs.readFileSync(filename);
  textlist = parse_njtl();
  return;

  //function defitions

  //Find String
  function _find_str(str){
    if(str.length != 4){
      throw new Error("Must provide length 4 string");
    }

    str = str.toUpperCase();
    console.log(str);
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
}
