var fs = require("fs");
var clone = require("clone");
var matrix = require("./matrix.js");
var sprintf = require("util").format;

const OUTFILE = "output.obj";
const FILENAME = "sample/pwand.json";
var file = fs.readFileSync(FILENAME);
var model = JSON.parse(file.toString());

var section = 0;
var total = 1;
var obj_str = "";
make_vertexes(model);

fs.writeFileSync(OUTFILE, obj_str);

function make_vertexes(node, mtx){

  var tr = clone(node.translation);
  var rt = clone(node.rotation);
  var sc = clone(node.scale);
  console.log(tr);
  var translationMatrix = matrix.make_translation(tr.x, tr.y, tr.z);
  var rotationXMatrix = matrix.make_x_rotation(rt.x);
  var rotationYMatrix = matrix.make_y_rotation(rt.y);
  var rotationZMatrix = matrix.make_z_rotation(rt.z);
  var scaleMatrix = matrix.make_scale(sc.x, sc.y, sc.z);

  var a = mtx || matrix.identify();
  console.log(node.flags);
  if(node.flags.scale){
    a = matrix.multiply(a, scaleMatrix);
  }

  if(node.flags.rotate){
    console.log(a);
    a = matrix.multiply(a, rotationXMatrix);
    a = matrix.multiply(a, rotationYMatrix);
    a = matrix.multiply(a, rotationZMatrix);
  }

  if(true || node.flags.translate){
    a = matrix.multiply(a, translationMatrix);
  }

  if(mtx){
    //a = matrix.multiply(a, mtx);
  }

  var next = a;
  console.log(next);

  var v_list = [];
  for(var i = 0; i < node.vertex_list.length; i++){
    var v = node.vertex_list[i].pos;
    var cols = [];
    var index = 0;
    for(var k = 0; k < 16; k+=4){
      cols[index] = v.x*a[k] + v.y*a[k+1] + v.z*a[k+2] + a[k+3];
      index++;
    }
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
    section++;
    obj_str += sprintf("g debug_%d\r\n", section);
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
