"use strict";

var fs = require("fs");
var FilePointer = require("filepointer");
var MatrixUtil = require("./MatrixUtil.js");
var sprintf = require("util").format;

!function main(){
  var filename,fp,njcm;
  var files = fs.readdirSync("ItemModel");

  for(var i = 0; i < files.length; i++){
    filename = "ItemModel/" + files[i];
    fp = new FilePointer(filename);
    fp.find("NJCM");
    fp.seek_cur(8);
    fp.trim();
    njcm = parse_njcm(fp, 0);
    filename = files[i].split(".");
    filename.pop();
    filename = "Export/" + filename.join("") + ".obj";
    fs.writeFileSync(filename, njcm.toString());
  }

}();

/*
 * parse_njtl
 */
function parse_njcm(fp, addr, px){
  var node = read_node(fp);
  var mx = MakeMatrix(node, px);

  if(node.model){
    fp.seek_set(node.model);
    node.model = read_model(fp);

    if(node.model.vertex){
      fp.seek_set(node.model.vertex);
      node.model.vertex = ProcessVerts(fp, mx);
    }

    if(node.model.polygon){
      fp.seek_set(node.model.polygon);
      node.model.polygon = ProcessStrips(fp);
    }
  }

  if(node.child){
    fp.seek_set(node.child);
    node.child = parse_njcm(fp, node.child, mx);
  }

  if(node.sibling){
    fp.seek_set(node.sibling);
    node.sibling = parse_njcm(fp, node.sibling, px);
  }

  if(!px){
    node.toString = toString;
  }

  return node;
}

/*
 * read_node
 */
function read_node(fp){

  var node = {
    flags : fp.read_dword(),
    model : fp.read_dword(),
    translate : read_xyz(fp),
    rotate : read_abc(fp),
    scale : read_xyz(fp),
    child : fp.read_dword(),
    sibling : fp.read_dword()
  };

  node.flags = eval_flags(node.flags);
  return node;
}

/*
 * bittest
 */
function bittest(dword, n){
  return Boolean(dword & Math.pow(2,n));
}

/*
 * read_xyz
 */
function read_xyz(fp){
  return {
    x : fp.read_single(),
    y : fp.read_single(),
    z : fp.read_single()
  };
}

/*
 * read_abc
 */
function read_abc(fp){
  var c = 0.005493164;
  return {
    x : (fp.read_dword() & 0xffff) * c,
    y : (fp.read_dword() & 0xffff) * c,
    z : (fp.read_dword() & 0xffff) * c
  };
}

/*
 * eval_flags
 */
function eval_flags(flags){
  var tmp = {
    trans : !bittest(flags, 0),
    rotate : !bittest(flags, 1),
    scale : !bittest(flags, 2),
    draw : bittest(flags, 3),
    trace : bittest(flags, 4),
    light : bittest(flags, 5),
    SKIP1 : bittest(flags, 6),
    SKIP2 : bittest(flags, 7),
  };

  tmp.Pushpop = !tmp.trans && !tmp.rotate && !tmp.scale;
  return tmp;
}

/*
 * read_model
 */
function read_model(fp){
  return {
    vertex : fp.read_dword(),
    polygon : fp.read_dword(),
    center : read_xyz(fp),
    radius : fp.read_single()
  };
}

/*
 * MakeMatrix
 */
function MakeMatrix(n, px){
  var tmp = MatrixUtil.Identity();

  if(n.flags.scale){
    tmp = MatrixUtil.ScaleNew(tmp, n.scale);
  }

  if(n.flags.rotate){
    if(!n.flags.light){
      tmp = MatrixUtil.RotateNew(tmp, n.rotate)
    }else{
      tmp = MatrixUtil.Rotate2New(tmp, n. rotate)
    }
  }

  if(n.flags.trans){
    tmp = MatrixUtil.TranslateNew(tmp, n.translate)
  }

  if(px){
    tmp = MatrixUtil.Multiply(tmp, px);
  }

  return tmp;
}
/*
 * Process Verts
 */
function ProcessVerts(fp, mx){

  var flags = [
    3, 15, 1, 3, 3, 3, 3, 3, 3, 5, 13, 13, 13, 13, 13, 13, 3, 11, 11
  ];

  var format = fp.read_word();
  var chunk_length = fp.read_word();
  var index_offset = fp.read_word();
  var vertex_count = fp.read_word();

  console.log(chunk_length + " " + vertex_count);

  var vlist = [];
  var vertex = {};
  var vertex_type = flags[format - 0x20];

  console.log(vertex_type);

  for(var i = 0; i < vertex_count; i++){
    vertex = MatrixUtil.Apply2(mx,{
      x : fp.read_single(),
      y : fp.read_single(),
      z : fp.read_single()
    });

    if(vertex_type & 0x02){
      fp.seek_cur(4);
    }

    if(vertex_type & 0x04){
      vertex.nx = fp.read_single();
      vertex.ny = fp.read_single();
      vertex.nz = fp.read_single();
    }

    if(vertex_type & 0x08){
      fp.seek_cur(4);
    }

    vlist.push(vertex);
  }


  if(fp.read_dword() !== 0xff){
    //console.log(fp.get_pos().toString(16) + " " + format);
    //throw new Error("Vertex chunk did not parse correctly");
  }

  return vlist;
}

/*
 * Process Strips
 */
function ProcessStrips(fp){
  var tx_index;
  var groups = [];

  //process polygon list
  var type = fp.read_byte();
  while(type !== 0xff){

    if(type <= 0x08){
      tx_index = texture_id();
    }else if(type >= 0x10 && type <= 0x17){
      material_def();
    }else if(type >= 0x40 && type <= 0x4b){
      groups.push(triangle_strip(type));
    }else{
		  //console.log(type);
      //throw new Error("Error! Unknown type ");
    }

    type = fp.read_byte();
  }
  return groups;

  //texture id
  function texture_id(){
    var tx_flag = fp.read_byte();
    var texture_index = fp.read_word();
    return texture_index & 0x3FFF;
  }

  //material definition
  function material_def(){
    var flag = fp.read_byte();
    var size = fp.read_word() * 2;
    fp.seek_cur(size);
  }

  //triangle strip
  function triangle_strip(strip_type){
    var plist = [];

    var strip_flags = fp.read_byte();
    var chunk_length = fp.read_word() * 2;
    var end_pos = fp.get_pos() + chunk_length;

    var nbStrip = fp.read_word();
    var user_flags = nbStrip >> 13;
    var num_strips = nbStrip & 0x3FFF;

    var uv_format = [1, 255, 1023]
    var eval_flags = [1, 3, 3, 9, 11, 11, 5, 7, 7, 1, 19, 19];

    var ti = strip_type - 0x40;
    var flag = eval_flags[ti];

    for(var i = 0; i < num_strips; i++){
      var len = fp.read_short();

      plist[i] = {
        clockwise : len > 0,
        tx_id : tx_index,
        indices : []
      };

      len = Math.abs(len);
      for(var k = 0; k < len; k++){
        plist[i].indices.push(fp.read_word());

        var tu,tv;
        if(flag & 0b10){
          tu = fp.read_word();
          tv = fp.read_word();
        }else{
          tu = 0;
          tv = 0;
        }

        if(flag & 0b100){
          fp.seek_cur(0x04);
        }

        if(flag & 0b1000){
          fp.seek_cur(0x06);
        }

        if(flag & 0x10000){
          fp.seek_cur(0x04);
        }

      }
    }

    if(fp.get_pos() % 4){
      fp.seek_cur(2);
    }

    return plist;
  }

}

/*
 * toString
 */
 function toString() {
 	var str = "";
 	var group_num = 1;
 	var a, b, c;
 	var face_str = "f %d/%d %d/%d %d/%d\r\n";
 	var v_length = 1;
 	make_string(this);
 	return str;

 	function make_string(node) {
    if(!node.model){
      node.model = {};
    }
 		var vlist = node.model.vertex || [];
 		for (var i = 0; i < vlist.length; i++) {
 			str += sprintf("v %s %s %s\r\n", vlist[i].x, vlist[i].y, vlist[i].z);
 		}

 		if (!node.model.polygon) {
 			node.model.polygon = [];
 		}
 		for (var i = 0; i < node.model.polygon.length; i++) {

 			var plist = node.model.polygon[i];
 			str += sprintf("\r\ng group_%d\r\n", group_num);
 			plist.forEach(function(p) {
 				for (var k = 0; k < p.indices.length - 2; k++) {
 					if (k % 2 === 0) {
 						a = p.indices[k + 0];
 						b = p.indices[k + 1];
 						c = p.indices[k + 2];
 					} else if (p.clockwise) {
 						a = p.indices[k + 2];
 						b = p.indices[k + 1];
 						c = p.indices[k + 0];
 					} else {
 						a = p.indices[k + 1];
 						b = p.indices[k + 2];
 						c = p.indices[k + 0];
 					}

 					a += v_length;
 					b += v_length;
 					c += v_length;

 					str += sprintf(face_str, a, a, b, b, c, c);
 				}
 			});

 			group_num++;
 		} //end group

 		if (node.model.vertex) {
 			v_length += node.model.vertex.length;
 		}

 		if (node.child) {
 			make_string(node.child);
 		}

 		if (node.sibling) {
 			make_string(node.sibling);
 		}
 	}
}
