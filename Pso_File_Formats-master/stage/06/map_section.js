module.exports = {

  /* Read Map Stage Header */

  read_stage_header : function(fp){
    fp.seek_end(-16);
    var addr = fp.read_dword();
    fp.seek_set(addr);

    return {
      iff : fp.read_iff(),            //fmt2
      unknown : fp.read_dword(),      //0x40
      num_sections : fp.read_dword(),
      hd : fp.read_iff(),             //..HD
      section_addr : fp.read_dword(),
      texture_addr : fp.read_dword()
    };

  },

  /* Read Texture List */

  read_texture_list : function(addr, fp){
    fp.seek_set(addr);

    var texture_header = {
      list_addr : fp.read_dword(),
      num_textures : fp.read_dword()
    }

    //read the list
    var texture_list = [];
    fp.seek_set(texture_header.list_addr);
    for(var i = 0; i < texture_header.num_textures; i++){
      //read the address
      texture_list.push(fp.read_dword());
      //skip over empty bytes
      fp.seek_cur(8);
    }

    for(var i = 0; i < texture_list.length; i++){
      fp.seek_set(texture_list[i]);
      texture_list[i] = fp.read_str(32, true);
    }

    return texture_list;
  },

  /* Read XJ Ninja Chunk Model */

  read_xj_model : function (offset, fp,rot){
    fp.seek_set(offset);

    //read the njcm node
    var node = {
      flags : fp.read_dword(),
      model : fp.read_dword(),
      translation : {
        x : fp.read_single(),
        y : fp.read_single(),
        z : fp.read_single()
      },
      rotation : {
        x : fp.read_angle(),
        y : fp.read_angle(),
        z : fp.read_angle()
      },
      scale : {
        x : fp.read_single(),
        y : fp.read_single(),
        z : fp.read_single()
      },
      child : fp.read_dword(),
      sibling : fp.read_dword()
    };

    fp.seek_set(node.model);
    delete node.model;

    var flag = node.flags;
    node.flags = {};
    node.flags.translate = Number(!Boolean(flag & 0b00000001));
    node.flags.rotate = Number(!Boolean(flag & 0b00000010));
    node.flags.scale = Number(!Boolean(flag & 0b00000100));
    node.flags.draw = Number(!Boolean(flag & 0b00001000));
    node.flags.trace = Number(!Boolean(flag & 0b00010000));
    node.flags.lwo_order = Number(Boolean(flag & 0b00100000));
    node.flags.skip = Number(Boolean(flag & 0b01000000));
    node.flags.skip_shape = Number(Boolean(flag & 0b10000000));
    node.flags.pushpop = (!node.flags.translate && !node.flags.rotate && !node.flags.scale);

    //console.log(rot);
    node.rotation.x += rot.x;
    node.rotation.y += rot.z;
    node.rotation.z += rot.y;

    node.rotation.x = Math.PI * node.rotation.x / 180;
    node.rotation.y = Math.PI * node.rotation.y / 180;
    node.rotation.z = Math.PI * node.rotation.z / 180;
    //console.log(node.rotation);

    //read the model entry
    var model = {
      unknown_01 : fp.read_dword(),
      vert_entry_addr : fp.read_dword(),
      unknown_02 : fp.read_dword(),
      polygon_entry_01_addr : fp.read_dword(),
      polygon_01_texture : fp.read_dword(),
      polygon_entry_02_addr : fp.read_dword(),
      polygon_02_texture : fp.read_dword(),
      center : {
        x : fp.read_single(),
        y : fp.read_single(),
        z : fp.read_single()
      },
      radius : fp.read_single()
    };

    node.vertex_list = [];
    node.center = model.center;
    node.radius = model.radius;

    //read the vertexes
    if(model.vert_entry_addr){
      fp.seek_set(model.vert_entry_addr);

      var tmp_vert = {
        unknown_05 : fp.read_dword(),
        vertex_list_addr : fp.read_dword(),
        vertex_size : fp.read_dword(),
        num_vertexes : fp.read_dword()
      };

      fp.seek_set(tmp_vert.vertex_list_addr);

      for(var i = 0; i < tmp_vert.num_vertexes; i++){
        var v = {
          pos : {},
          norm : {},
          color : {},
          map : {}
        };

        switch(tmp_vert.vertex_size){
          case 0x10:
            v.pos.x = fp.read_single();
            v.pos.y = fp.read_single();
            v.pos.z = fp.read_single();
            v.norm.x = 1;
            v.norm.y = 0;
            v.norm.z = 0;
            v.color.r = fp.read_byte();
            v.color.g = fp.read_byte();
            v.color.b = fp.read_byte();
            v.color.a = fp.read_byte();
            v.map.u = 0;
            v.map.v = 0;
          break;
          case 0x18:
            v.pos.x = fp.read_single();
            v.pos.y = fp.read_single();
            v.pos.z = fp.read_single();
            v.norm.x = 1;
            v.norm.y = 0;
            v.norm.z = 0;
            v.color.r = fp.read_byte();
            v.color.g = fp.read_byte();
            v.color.b = fp.read_byte();
            v.color.a = fp.read_byte();
            v.map.u = fp.read_single();
            v.map.v = fp.read_single();
          break;
          case 0x1c:
            v.pos.x = fp.read_single();
            v.pos.y = fp.read_single();
            v.pos.z = fp.read_single();
            v.norm.x = fp.read_single();
            v.norm.y = fp.read_single();
            v.norm.z = fp.read_single();
            v.color.r = fp.read_byte();
            v.color.g = fp.read_byte();
            v.color.b = fp.read_byte();
            v.color.a = fp.read_byte();
            v.map.u = 0;
            v.map.v = 0;
          break;
          case 0x24:
            v.pos.x = fp.read_single();
            v.pos.y = fp.read_single();
            v.pos.z = fp.read_single();
            v.norm.x = fp.read_single();
            v.norm.y = fp.read_single();
            v.norm.z = fp.read_single();
            v.color.r = fp.read_byte();
            v.color.g = fp.read_byte();
            v.color.b = fp.read_byte();
            v.color.a = fp.read_byte();
            v.map.u = fp.read_single();
            v.map.v = fp.read_single();
          break;
          default:
            throw new Error("unkown vertext length: ", vertex_size);
          break;
        }//end switch

        /*
        if(trans){
          v.pos.x += trans.x;
          v.pos.y += trans.y;
          v.pos.z += trans.z;
        }
        */

        node.vertex_list.push(v);
      }//end for
    }

    node.polygon = [];

    //polygon list 01
    if(model.polygon_entry_01_addr){
      fp.seek_set(model.polygon_entry_01_addr);

      var text_tmp = {
        unknown_06 : fp.read_dword(),
        unknown_07 : fp.read_dword(),
        indice_list_addr : fp.read_dword(),
        num_indices : fp.read_dword()
      };

      console.log(text_tmp.unknown_06.toString(16));

      var poly = {};
      poly.texture = model.polygon_01_texture;
      poly.list = [];

      fp.seek_set(text_tmp.indice_list_addr);
      for(var i = 0; i < text_tmp.num_indices; i++){
        poly.list.push(fp.read_word());
      }

      node.polygon.push(poly);
    }


    //polygon list 02
    if(model.polygon_entry_02_addr){
      fp.seek_set(model.polygon_entry_02_addr);

      var text_tmp = {
        unknown_06 : fp.read_dword(),
        unknown_07 : fp.read_dword(),
        indice_list_addr : fp.read_dword(),
        num_indices : fp.read_dword()
      };

      var poly = {};
      poly.texture = model.polygon_02_texture;
      poly.list = [];

      fp.seek_set(text_tmp.indice_list_addr);
      for(var i = 0; i < text_tmp.num_indices; i++){
        poly.list.push(fp.read_word());
      }

      node.polygon.push(poly);
    }

    if(node.child){
      node.child = read_node(node.child);
    }else{
      node.child = null;
    }

    if(node.sibling){
      node.sibling = read_node(node.sibling);
    }else{
      node.sibling = null;
    }

    return node;
  }

}
