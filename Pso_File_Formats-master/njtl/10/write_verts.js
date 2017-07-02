var fs = require("fs");
var clone = require("clone");
var sprintf = require("util").format;
var math = require("mathjs");

const FILENAME = "sample/pwand.json";
var file = fs.readFileSync(FILENAME);



var model = JSON.parse(file.toString());

var node_num = 0;

var section = 0;
var total = 1;
const OUTFILE = "output.obj";
var obj_str = "";

write_model(model);
fs.writeFileSync(OUTFILE, obj_str);

function write_model(node){
  console.log("Node %d: %d %s", node_num, node.flags, node.flags.toString(2));

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
  console.log(node.flags);

  for(var i = 0; i < node.vertex_list.length; i++){
    var v = clone(node.vertex_list[i].pos);

    if(node.flags.rotate){
      v = rotate_vertexes(v, node.rotation);
    }
    //translation
    //v.x += node.translation.x;
    //v.y += node.translation.y;
    //v.z += node.translation.z;

    obj_str += sprintf("v %s %s %s \r\n", v.x, v.y, v.z);
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



  if(node.child){
    node.child.rotation.x = node.child.rotation.x || node.rotation.x;
    node.child.rotation.y = node.child.rotation.y || node.rotation.y;
    node.child.rotation.z = node.child.rotation.z || node.rotation.z;

    write_model(node.child);
  }

  if(node.sibling){
    node.sibling.rotation.x = node.sibling.rotation.x || node.rotation.x;
    node.sibling.rotation.y = node.sibling.rotation.y || node.rotation.y;
    node.sibling.rotation.z = node.sibling.rotation.z || node.rotation.z;

    write_model(node.sibling);
  }

  for(var i = 0; i < node.vertex_list.length; i++){

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

function rotate_vertexes(vertex,angle){
  var a = clone(angle);
  var v = clone(vertex);

  a.x = Math.PI * a.x / 180;
  a.y = Math.PI * a.y / 180;
  a.z = Math.PI * a.z / 180;


  //Z-Axis Rotation
  var x = v.x*Math.cos(a.z) - v.y*Math.sin(a.z);
  var y = v.x*Math.sin(a.z) + v.y*Math.cos(a.z);
  v.x = x;
  v.y = y;

  //X-Axis Rotation
  var y = v.y*Math.cos(a.x) - v.z*Math.sin(a.x);
  var z = v.y*Math.sin(a.x) + v.z*Math.cos(a.x);
  v.y = y;
  v.z = z;

  //Y-Axis Rotation
  var z = v.z*Math.cos(a.y) - v.x*Math.sin(a.y);
  var x = v.z*Math.sin(a.y) + v.x*Math.cos(a.y);
  v.z = z;
  v.x = x;

  //console.log(v);
  return v;
}
