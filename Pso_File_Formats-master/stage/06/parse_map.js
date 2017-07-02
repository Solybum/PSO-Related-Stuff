var fs = require("fs");
var stagelib = require("./map_section.js")
var FilePointer = require("filepointer");
var clone = require("clone");
var matrix = require("./matrix.js");
var sprintf = require("util").format;

const FILENAME = "sample/map_acave01_01n.rel";
var fp = new FilePointer(FILENAME);

var stage_header = stagelib.read_stage_header(fp);
var texture_list = stagelib.read_texture_list(stage_header.texture_addr, fp);

fp.seek_set(stage_header.section_addr);
var sections = [];
for(var i = 0; i < stage_header.num_sections; i++){
  sections.push({
    id : fp.read_dword(),
    translation : {
      x : fp.read_single(),
      y : fp.read_single(),
      z : fp.read_single()
    }, //possibly translation?
    rotation : {
      x : fp.read_angle(),
      y : fp.read_angle(),
      z : fp.read_angle()
    },
    radius : fp.read_single(),
    model_list_a : fp.read_dword(),
    model_list_b : fp.read_dword(),
    num_list_a : fp.read_dword(),
    num_list_b : fp.read_dword(),
    terminator : fp.read_dword()    //0x010000
  });
  console.log(sections[i].rotation);
}

//process.exit();

sections.forEach(function(section){
  section.extra = [];

  var addr = section.model_list_a;
  section.model_list_a = [];

  //Section A
  if(section.num_list_a){
    fp.seek_set(addr);

    for(var i = 0; i < section.num_list_a; i++){
      section.model_list_a.push(fp.read_dword());
      //normal
      section.extra.push({
        a : fp.read_angle(),
        b : fp.read_angle(),
        c : fp.read_angle()
      });
      //fp.seek_cur(12);
    }

    for(var i = 0; i < section.num_list_a; i++){
      section.model_list_a[i] = stagelib.read_xj_model(section.model_list_a[i], fp, section.rotation);
    }
  }

  delete section.model_list_b;
  delete section.num_list_a;
  delete section.num_list_b;
  delete section.terminator;

});


var total = 1;
var obj_str = "mtllib output.mtl\r\n";
var group = 0;

write_mtl_file(texture_list);
for(var i = 0 ; i < sections.length; i++){
  console.log("Rotation : %o", sections[i].rotation);

  if(i >= 24){
    //break;
  }

  for(var k = 0; k < sections[i].model_list_a.length; k++){
    console.log(sections[i].extra[k]);

    var model = sections[i].model_list_a[k];
    console.log(model.rotation);
    make_vertexes(model, null, sections[i].translation);
  }

}

const OUTFILE = "caves/output.obj";
fs.writeFileSync(OUTFILE, obj_str);

/* Write Vertex Function */

function write_mtl_file(textures){
  var mtl_str = "";
  for(var i = 0; i < textures.length; i++){
    var num = i+1;
    mtl_str += "newmtl mat_" + num + "\r\n";
    mtl_str += "Kd 1.0 1.0 1.0\r\n";
    mtl_str += "Ka 0.5 0.5 0.5\r\n";
    mtl_str += "Ks 0.0 0.0 0.0\r\n";
    mtl_str += "d 1.0\r\n";
    mtl_str += "map_Kd Image "+i+".dds\r\n";
    mtl_str += "\r\n";
  }
  console.log("meya");
  fs.writeFileSync("caves/output.mtl", mtl_str);
}

function make_vertexes(node, mtx, trans){

  var tr = clone(node.translation);
  var rt = clone(node.rotation);
  var sc = clone(node.scale);

  //console.log(tr);
  var translationMatrix = matrix.make_translation(tr.x, tr.y, tr.z);
  var rotationXMatrix = matrix.make_x_rotation(rt.x);
  var rotationYMatrix = matrix.make_y_rotation(rt.y);
  var rotationZMatrix = matrix.make_z_rotation(rt.z);
  var scaleMatrix = matrix.make_scale(sc.x, sc.y, sc.z);

  var a = mtx || matrix.identify();
  //console.log(node.flags);
  if(node.flags.scale){
    a = matrix.multiply(a, scaleMatrix);
  }

  //if(node.flags.rotate){
    console.log("hey");
    a = matrix.multiply(a, rotationXMatrix);
    a = matrix.multiply(a, rotationYMatrix);
    a = matrix.multiply(a, rotationZMatrix);
  //}

  if(true || node.flags.translate){
    a = matrix.multiply(a, translationMatrix);
  }

  if(mtx){
    //a = matrix.multiply(a, mtx);
  }

  var next = a;
  //console.log(next);

  var v_list = [];
  for(var i = 0; i < node.vertex_list.length; i++){
    var v = node.vertex_list[i].pos;
    var cols = [];
    var index = 0;

    for(var k = 0; k < 16; k+=4){
      cols[index] = v.x*a[k] + v.z*a[k+1] + v.y*a[k+2] + a[k+3];
      index++;
    }

    cols[0] += trans.x;
    cols[1] += trans.z;
    obj_str += sprintf("v %s %s %s \r\n",cols[0],cols[1],cols[2]);
  }

  for(var i = 0; i < node.vertex_list.length; i++){
    obj_str += sprintf("vn %s %s %s \r\n",
      node.vertex_list[i].norm.x,
      node.vertex_list[i].norm.y,
      node.vertex_list[i].norm.z);
  }

  for(var i = 0; i < node.vertex_list.length; i++){
    obj_str += sprintf("vt %d %d\r\n",
      node.vertex_list[i].map.u,
      node.vertex_list[i].map.v);
  }

  node.polygon.forEach(function(strip){
    group++;
    obj_str += sprintf("g debug_%d\r\n", group);
    console.log(strip.texture);
    obj_str += sprintf("usemtl mat_%d\r\n", strip.texture);

    for(var i = 0; i < strip.list.length - 1; i++){
      a = strip.list[i] + total;
      b = strip.list[i + 1] + total;
      c = strip.list[i + 2] + total;
      d = (i) ? strip.list[i - 1] + total : 0;

      if(!i % 2){
        obj_str += append_face(a,b,c);
        obj_str += append_face(a,c,b);
      }else{
        obj_str += append_face(a,d,b);
        obj_str += append_face(a,b,d);
      }
    }
  });

  total += node.vertex_list.length;

  if(node.child){
    make_vertexes(node.child, next);
  }


  if(node.sibling){
    make_vertexes(node.sibling, mtx);
  }

}

function append_face(a,b,c){
  var str = "f ";
  str += sprintf("%d/%d/%d ", a, a, a);
  str += sprintf("%d/%d/%d ", b, b, b);
  str += sprintf("%d/%d/%d", c, c, c);
  str += "\r\n";
  return str;
}
