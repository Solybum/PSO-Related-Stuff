var fs = require("fs");
var sprintf = require("util").format;

const FILENAME = "input/ItemModel_028.xj";
parse_xj(FILENAME);

function parse_xj(filename){
  var buffer = fs.readFileSync(filename);
  var textures = get_textures();

  buffer = trim_buffer();
  fs.writeFileSync("debug.bin", buffer);

  var nodes = [];
  parse_node(0);
  write_obj_file(nodes);
  write_mtl_file(textures);

  /**
  * get_textures
  **/
  function get_textures(){
    var offset = 0x08;
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
          textures[i].filename = textures[i].filename.replace("/\0/g", "");
          break;
        }
      }
    }

    return textures;
  }

  /**
  * trim_buffer
  **/
  function trim_buffer(){
    const STR = "NJCM";
    var offset;
    for(var i = 0; i < buffer.length - 4; i += 4){
      if(buffer.toString("ascii", i, i + 4) == STR){
        offset = i + 8;
      }
    }

    return buffer.slice(offset);
  }

  /**
  * parse_node
  **/
  function parse_node(fp, p, s){

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
    if(p){
      tmp.p = p;
    }
    if(s){
      tmp.s = s;
    }

    tmp.id = nodes.length;
    nodes.push(tmp);

    if(tmp.child){
      //tmp.child = parse_node(tmp.child);
      parse_node(tmp.child, tmp, null);
    }
    if(tmp.sibling){
      //tmp.sibling = parse_node(tmp.sibling);
      parse_node(tmp.sibling, null, tmp);
    }

    if(tmp.model){
      tmp.model = parse_model(tmp.model);
    }

  }

  /**
  * eval_flags
  **/
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

  /**
  * parse_model
  **/
  function parse_model(fp){

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
      tmp.vertex_list = parse_vertex_entry(tmp.vertex_list);
    }

    if(tmp.list_a){
      tmp.list_a = parse_indice_entry(tmp.list_a);
    }

    if(tmp.list_b){
      tmp.list_b = parse_indice_entry(tmp.list_b);
    }

    return tmp;
  }

  /**
  * parse_vertex_entry
  **/
  function parse_vertex_entry(fp){
    var tmp = {
      flag_a : buffer.readUInt32LE(fp),
      list : buffer.readUInt32LE(fp + 0x04),
      flag_b : buffer.readUInt32LE(fp + 0x08),
      num_verts : buffer.readUInt32LE(fp + 0x0C),
    };
    tmp.flag_a = eval_flags(tmp.flag_a);
    tmp.flag_b = eval_flags(tmp.flag_b);

    tmp.list = read_vertex_list(tmp.list, tmp.num_verts);
    return tmp;
  }

  /**
  * read_vertex_list
  **/
  function read_vertex_list(fp, number){
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

  /**
  * parse_indice_entry
  **/
  function parse_indice_entry(fp){
    var tmp = {
      text_list : buffer.readUInt32LE(fp + 0x00),
      unkown : buffer.readUInt32LE(fp + 0x04),
      indice_list : buffer.readUInt32LE(fp + 0x08),
      indice_num : buffer.readUInt32LE(fp + 0x0C),
    };
    tmp.text_list = tmp.text_list.toString(16);

    var indices = [];
    fp = tmp.indice_list;
    for(var i = 0; i < tmp.indice_num; i++){
      indices.push(buffer.readUInt16LE(fp));
      fp += 2;
    }

    tmp.indice_list = indices;
    return tmp;
  }

}


/**
* write_mtl_file
**/
function write_mtl_file(textures){
  var mtl_str = "";
  for(var i = 0; i < textures.length; i++){
    var num = i+1;
    mtl_str += "newmtl mat_" + num + "\r\n";
    mtl_str += "Kd 1.0 1.0 1.0\r\n";
    mtl_str += "Ka 0.5 0.5 0.5\r\n";
    mtl_str += "Ks 0.0 0.0 0.0\r\n";
    mtl_str += "d 1.0\r\n";
    mtl_str += "map_Kd Image_"+i+".dds\r\n";
    mtl_str += "\r\n";
  }
  fs.writeFileSync("output/output.mtl", mtl_str);
}

/**
* write_obj_file
**/
function write_obj_file(nodes){
  var n;
  var obj_str = "";
  obj_str += "mtllib output.mtl\r\n";
  obj_str += "\r\n";

  var a, b, c, d;
  var total = 1;
  var section = 0;

  for(var i = 0; i < nodes.length; i++){
    n = nodes[i];

    if(i === 3){
      //break;
    }

    if(n.s){
      console.log("sibling %d", n.s.id);
      n.angle[0] += n.s.angle[0];
      n.angle[1] += n.s.angle[1];
      n.angle[2] += n.s.angle[2];
    }
    if(n.p){
      console.log("parent %d", n.p.id);

      n.angle[0] += n.p.angle[0];
      n.angle[1] += n.p.angle[1];
      n.angle[2] += n.p.angle[2];
    }

    console.log(n.flags);
    console.log({pos:n.position});
    console.log({angle:n.angle});
    console.log("");

    n.model.vertex_list.list.forEach(append_vertex);
    obj_str += "\r\n";
    n.model.vertex_list.list.forEach(append_vertex_normal);
    obj_str += "\r\n";
    n.model.vertex_list.list.forEach(append_vertex_texture);
    obj_str += "\r\n";

    append_indice(n.model.list_a.indice_list, n.model.text_a);
    append_indice(n.model.list_b.indice_list, n.model.text_b);
    total += n.model.vertex_list.num_verts;

    function rotate_vertexes(v,a){
      var angle;
      var x = v[0];
      var y = v[1];
      var z = v[2];


      //x rotation

      if(a[0]){
        angle = a[0]/65536 * 360;
        angle = angle * Math.PI / 180;
        //console.log("x angle: %d", angle);
        var y_2 = y*Math.cos(angle) - z*Math.sin(angle);
        var z_2 = y*Math.sin(angle) + z*Math.cos(angle);
        y = y_2;
        z = z_2;
      }

      if(a[2]){
        console.log(a[2]);
        angle = a[2]/65536 * 360;
        angle = angle * Math.PI / 180;

        x_2 = x*Math.cos(angle) - y*Math.sin(angle);
        y_2 = x*Math.sin(angle) + y*Math.cos(angle);
        x = x_2;
        y = y_2;
      }
      /*
      //y rotation
      if(a[1]){
       angle = a[1]/65536 * 360;
       angle = angle * Math.PI / 180;

       var z_2 = z*Math.cos(angle) - x*Math.sin(angle);
       var x_2 = z*Math.sin(angle) + x*Math.cos(angle);
       z = z_2;
       x = x_2;
      }

      //z rotation
      if(a[2]){
        angle = a[2]/65536 * 360;
        angle = angle * Math.PI / 180;

        x_2 = x*Math.cos(angle) - y*Math.sin(angle);
        y_2 = x*Math.sin(angle) + y*Math.cos(angle);
        x = x_2;
        y = y_2;
      }
      */
      return [x,y,z];
    }

    function append_vertex(v){
      /*
      v.pos[0] += n.position[0];
      v.pos[1] += n.position[1];
      v.pos[2] += n.position[2];
      */

      v.pos = rotate_vertexes(v.pos, n.angle);

      a = v.pos[0].toFixed(6);
      b = v.pos[1].toFixed(6);
      c = v.pos[2].toFixed(6);

      obj_str += sprintf("v %s %s %s \r\n", a, b, c);
    }

    function append_vertex_normal(v){
      a = v.norm[0].toFixed(6);
      b = v.norm[1].toFixed(6);
      c = v.norm[2].toFixed(6);
      obj_str += sprintf("vn %d %d %d \r\n", a, b, c);
    }

    function append_vertex_texture(v){
      a = v.uv[0].toFixed(6);
      b = v.uv[1].toFixed(6);
      obj_str += sprintf("vt %d %d\r\n", a, b);
    }

    function append_indice(indices, text_index){
      if(!indices){
        return;
      }

      function append_face(a,b,c){
        var str = "f ";
        str += sprintf("%d/%d/%d ", a, a, a);
        str += sprintf("%d/%d/%d ", b, b, b);
        str += sprintf("%d/%d/%d", c, c, c);
        str += "\r\n";
        return str;
      }

      section++;
      obj_str += sprintf("g debug_%d\r\n", section);
      obj_str += sprintf("usemtl mat_%d\r\n", text_index);

      for(var i = 0; i < indices.length - 1; i++){
        a = indices[i] + total;
        b = indices[i + 1] + total;
        c = indices[i + 2] + total;
        d = (i) ? indices[i - 1] + total : 0;

        if(!i % 2){
          obj_str += append_face(a,b,c);
          obj_str += append_face(a,c,b);
        }else{
          obj_str += append_face(a,d,b);
          obj_str += append_face(a,b,d);
        }
      }

    }

  }//end loop

  fs.writeFileSync("output/output.obj", obj_str);
}
