var fs = require("fs");
var util = require("util");

//for(var i = 0; i < 370; i++){
  parse_xj("input/ItemModel_028.xj");
//}

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
  var parse_vertex_entry = _parse_vertex_entry;
  var read_vertex_list = _read_vertex_list;
  var parse_indice_entry = _parse_indice_entry;
  var write_section = _write_section;

  //begin:
  buffer = fs.readFileSync(filename);
  textures = parse_njtl();
  njcm_offset = find_str("njcm");
  node_struct = parse_node(njcm_offset);
  write_section(node_struct);

  //var debug = JSON.stringify(node_struct, null, 2);
  //fs.writeFileSync("debug.json", debug);
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
          buffer.readFloatLE(fp + 0x08),
          buffer.readFloatLE(fp + 0x0C),
          buffer.readFloatLE(fp + 0x10)
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
      tmp.flags = eval_flags(tmp.flags);

      if(tmp.child){
        tmp.child = parse_node(njcm_offset + tmp.child);
      }
      if(tmp.sibling){
        tmp.sibling = parse_node(njcm_offset + tmp.sibling);
      }
      if(tmp.model){
        tmp.model = parse_model(njcm_offset + tmp.model);
      }
      return tmp;
  }

  function _parse_model(offset){
    fp = offset;

    var tmp = {
      a_dword : buffer.readUInt32LE(fp),
      vertex_list : buffer.readUInt32LE(fp + 0x04),
      vtemp : buffer.readUInt32LE(fp + 0x08),
      list_a : buffer.readUInt32LE(fp + 0x0C),
      text_a : buffer.readUInt32LE(fp + 0x10),
      list_b : buffer.readUInt32LE(fp + 0x14),
      text_b : buffer.readUInt32LE(fp + 0x18),
      center : [
        buffer.readFloatLE(fp + 0x1C),
        buffer.readFloatLE(fp + 0x20),
        buffer.readFloatLE(fp + 0x24)
      ],
      radius : buffer.readFloatLE(fp + 0x28)
    };

    if(tmp.vertex_list){
      tmp.vertex_list = parse_vertex_entry(njcm_offset + tmp.vertex_list);
    }

    if(tmp.list_a){
      tmp.list_a = parse_indice_entry(njcm_offset + tmp.list_a);
    }

    if(tmp.list_b){
      tmp.list_b = parse_indice_entry(njcm_offset + tmp.list_b);
    }

    return tmp;
  }

  function _parse_vertex_entry(offset){
    var fp = offset;

    var tmp = {
      flag_a : buffer.readUInt32LE(fp),
      list : buffer.readUInt32LE(fp + 0x04),
      flag_b : buffer.readUInt32LE(fp + 0x08),
      num_verts : buffer.readUInt32LE(fp + 0x0C),
    };

    tmp.list = read_vertex_list(njcm_offset + tmp.list, tmp.num_verts);
    return tmp;
  }

  function _read_vertex_list(offset, number){
    var fp = offset;
    var array = [];
    for(var i = 0; i < number; i++){
      array.push({
        pos : [
          buffer.readFloatLE(fp + 0x00),
          buffer.readFloatLE(fp + 0x04),
          buffer.readFloatLE(fp + 0x08)
        ],
        norm : [
          buffer.readFloatLE(fp + 0x10),
          buffer.readFloatLE(fp + 0x0C),
          buffer.readFloatLE(fp + 0x14)
        ],
        color : {
          r : buffer[fp + 0x18],
          g : buffer[fp + 0x19],
          b : buffer[fp + 0x1A],
          a : buffer[fp + 0x1B]
        },
        uv : [
          buffer.readFloatLE(fp + 0x1C),
          buffer.readFloatLE(fp + 0x20)
        ]
      });
      fp += 0x24;
    }
    return array;
  }

  function _parse_indice_entry(offset){
    fp = offset;

    var tmp = {
      text_list : buffer.readUInt32LE(fp + 0x00).toString(16),
      unkown : buffer.readUInt32LE(fp + 0x04),
      indice_list : buffer.readUInt32LE(fp + 0x08),
      indice_num : buffer.readUInt32LE(fp + 0x0C),
    };

    var indices = [];
    fp = njcm_offset + tmp.indice_list;
    for(var i = 0; i < tmp.indice_num; i++){
      indices.push(buffer.readUInt16LE(fp));
      fp += 2;
    }

    tmp.indice_list = indices;
    return tmp;
  }

  function _write_section(tree){
    console.log("Writing %s", filename);
    var vertexes, indices;
    var total = 1;
    var section = 1;
    var a, b, c;
    var center, angle;
    var flag;
    //var step = 0;
    var output = filename+".obj";
    fs.writeFileSync(output, "");
    write_node(tree);

    function write_node(n){
      var cp = clone(n);
      delete cp.child;
      delete cp.sibling;

      flag = n.flags;

      if(n.model.vertex_list && !flag.hide){
        console.log(cp);

        center = n.position;
        angle = n.angle;

        vertexes = n.model.vertex_list.list;
        for(var i = 0; i < vertexes.length; i++){
          v = vertexes[i]["pos"];

          //position offset
          /*
          if(!flag.skip_pos){
            v[0] = v[0] + center[0];
            v[1] = v[1] + center[1];
            v[2] = v[2] + center[2];
          }

          //rotation
          if(!flag.skip_ang){
            v = rotate_vertexes(v,angle);
          }
          */
          //format for file
          a = v[0].toFixed(6);
          b = v[1].toFixed(6);
          c = v[2].toFixed(6);

          str = util.format("v %s %s %s \r\n", a, b, c);
          fs.appendFileSync(output, str);
          v = vertexes[i]["norm"];
          a = v[0].toFixed(6);
          b = v[1].toFixed(6);
          c = v[2].toFixed(6);
          str = util.format("vn %d %d %d \r\n", a, b, c);
          fs.appendFileSync(output, str);
        }

        indices = n.model.list_a;
        indices = indices.indice_list || [];
        if(indices)
          fs.appendFileSync(output, "g debug"+section+"\r\n");
        for(var i = 0; i < indices.length - 1; i++){
          a = indices[i] + total;
          b = indices[i + 1] + total;
          c = indices[i + 2] + total;
          d = (i) ? indices[i - 1] + total : 0;

          if(!i % 2){
            str = util.format("f %d/%d %d/%d %d/%d\r\n", a,a, b,b, c,c);
            fs.appendFileSync(output, str);
            str = util.format("f %d/%d %d/%d %d/%d\r\n", a,a, c,c, b,b);
            fs.appendFileSync(output, str);
          }else{
            str = util.format("f %d/%d %d/%d %d/%d\r\n", a,a, d,d, b,b);
            fs.appendFileSync(output, str);
            str = util.format("f %d/%d %d/%d %d/%d\r\n", a,a, b,b, d,d);
            fs.appendFileSync(output, str);
          }
        }
        section++;

        indices = n.model.list_b;
        indices = indices.indice_list || [];
        if(indices)
          fs.appendFileSync(output, "g debug"+section+"\r\n");
        for(var i = 0; i < indices.length - 1; i++){
          a = indices[i] + total;
          b = indices[i + 1] + total;
          c = indices[i + 2] + total;
          d = (i) ? indices[i - 1] + total : 0;

          if(!i % 2){
            str = util.format("f %d/%d %d/%d %d/%d\r\n", a,a, b,b, c,c);
            fs.appendFileSync(output, str);
            str = util.format("f %d/%d %d/%d %d/%d\r\n", a,a, c,c, b,b);
            fs.appendFileSync(output, str);
          }else{
            str = util.format("f %d/%d %d/%d %d/%d\r\n", a,a, d,d, b,b);
            fs.appendFileSync(output, str);
            str = util.format("f %d/%d %d/%d %d/%d\r\n", a,a, b,b, d,d);
            fs.appendFileSync(output, str);
          }
        }
        section++;


        section++;
        total += n.model.vertex_list.num_verts;
        //return;
      }

      if(n.sibling){
        //step--;
        write_node(n.sibling);
      }

      if(n.child){
        //step--;
        write_node(n.child);
      }

    }

  }
}

function clone(obj) {
    if(obj === null || typeof(obj) !== 'object' || 'isActiveClone' in obj)
        return obj;

    var temp = obj.constructor(); // changed

    for(var key in obj) {
        if(Object.prototype.hasOwnProperty.call(obj, key)) {
            obj['isActiveClone'] = null;
            temp[key] = clone(obj[key]);
            delete obj['isActiveClone'];
        }
    }

    return temp;
}

function eval_flags(uint){
  uint = uint & 0xFF;
  uint = uint.toString(2);
  while(uint.length < 8){
    uint = "0" + uint;
  }
  uint = {
    skip_pos : parseInt(uint.charAt(7)),
    skip_ang : parseInt(uint.charAt(6)),
    skip_scl : parseInt(uint.charAt(5)),
    hide : parseInt(uint.charAt(4)),
    eval_break : parseInt(uint.charAt(3)),
    lightwave_zxy : parseInt(uint.charAt(2)),
    skip_motion : parseInt(uint.charAt(1)),
    skip_shape :  parseInt(uint.charAt(0)),
  };

  return uint;
}

function rotate_vertexes(v,a){
  var angle;
  var x = v[0];
  var y = v[1];
  var z = v[2];

  /*
  //x rotation
  if(a[0]){
    angle = a[0]/65536 * Math.PI * 0.5;
    y = y*Math.cos(angle) - z*Math.sin(angle);
    z = y*Math.sin(angle) + z*Math.cos(angle);
    x = x;
  }

  //y rotation
  if(a[1]){
   angle = a[1]/65536 * Math.PI * 0.5;
   x = x*Math.cos(angle) - y*Math.sin(angle)
   y = x*Math.sin(angle) + y*Math.cos(angle);
   z = z;
  }

  //z rotation
  if(a[2]){
    angle = a[2]/65536 * Math.PI * 0.5;
    z = z*Math.cos(angle) - x*Math.sin(angle);
    x = z*Math.sin(angle) + x*Math.cos(angle);
    y = y;
  }
  */

  return [x,y,z];
}
