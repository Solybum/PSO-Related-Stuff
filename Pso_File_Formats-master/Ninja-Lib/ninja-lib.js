/*
    This file is part of Ninja-lib

    Copyright (C) 2015 Benjamin Collins

    This library is free software: you can redistribute it and/or modify
    it under the terms of the GNU Lesser General Public License as
    published by the Free Software Foundation, either version 2.1 or
    version 3 of the License.

    This library is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Lesser General Public License for more details.

    You should have received a copy of the GNU Lesser General Public
    License along with this library. If not, see <http://www.gnu.org/licenses/>.
*/

module.exports = (function(){

  return {
    AFS : require("src/afs.js"),
    GSL : require("src/gsl.js"),
    BML : require("src/bml.js"),
    PRS : require("src/prs.js"),

    read_njtl : function(addr, fp){
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

    read_node : function(addr, fp){
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

      node.rotation.x = Math.PI * node.rotation.x / 180;
      node.rotation.y = Math.PI * node.rotation.y / 180;
      node.rotation.z = Math.PI * node.rotation.z / 180;

      return node;
    }

  };

})();
