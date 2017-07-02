var fs = require("fs");
var clone = require("clone");
var sprintf = require("util").format;
var math = require("mathjs");

Array.prototype.chunk = function(chunkSize) {
    var array=this;
    return [].concat.apply([],
        array.map(function(elem,i) {
            return i%chunkSize ? [] : [array.slice(i,i+chunkSize)];
        })
    );
}

const FILENAME = "sample/pwand.json";
var file = fs.readFileSync(FILENAME);
var model = JSON.parse(file.toString());
var section = 0;
var total = 1;
var stack = [
  1, 0, 0, 0,
  0, 1, 0, 0,
  0, 0, 1, 0,
  0, 0, 0, 1
];;

const OUTFILE = "output.obj";
var obj_str = "";

write_model(model, stack);
fs.writeFileSync(OUTFILE, obj_str);

function write_model(node, nix){

  var tr = clone(node.translation);
  var rt = clone(node.rotation);
  var sc = clone(node.scale);

  var translationMatrix = makeTranslation(tr.x, tr.y, tr.z);
  var rotationXMatrix = makeXRotation(rt.x);
  var rotationYMatrix = makeYRotation(rt.y);
  var rotationZMatrix = makeZRotation(rt.z);
  var scaleMatrix = makeScale(sc.x, sc.y, sc.z);

  var matrix = [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
  ];

  if(node.flags.rotate){
    matrix = matrixMultiply(matrix, rotationZMatrix);
    matrix = matrixMultiply(matrix, rotationYMatrix);
    matrix = matrixMultiply(matrix, rotationXMatrix);
  }
  if(node.flags.translate){
    matrix = matrixMultiply(matrix, translationMatrix);
  }
  if(node.flags.scale){
    matrix = matrixMultiply(matrix, scaleMatrix);
  }

  matrix = matrixMultiply(matrix, nix);

  var list = [];
  for(var i = 0; i < node.vertex_list.length; i++){
    list.push([
      node.vertex_list[i].pos.x,
      node.vertex_list[i].pos.y,
      node.vertex_list[i].pos.z,
      1
    ]);
  }

  var mult = matrix.chunk(4);

  for(var i = 0; i < list.length; i++){
    var point = math.multiply(mult, list[i]);
    obj_str += sprintf("v %s %s %s \r\n",point[0],point[1],point[2]);
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
    write_model(node.child, matrix);
  }


  if(node.sibling){
    write_model(node.sibling, nix);
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

function makeTranslation(tx, ty, tz) {
  return [
     1,  0,  0,  0,
     0,  1,  0,  0,
     0,  0,  1,  0,
     tx, ty, tz, 1
  ];
}

function makeXRotation(angleInRadians) {
  //var angleInRadians = Math.PI * angleInDegrees / 180;
  var c = Math.cos(angleInRadians);
  var s = Math.sin(angleInRadians);

  return [
    1, 0, 0, 0,
    0, c, s, 0,
    0, -s, c, 0,
    0, 0, 0, 1
  ];
};

function makeYRotation(angleInRadians) {
  //var angleInRadians = Math.PI * angleInDegrees / 180;
  var c = Math.cos(angleInRadians);
  var s = Math.sin(angleInRadians);

  return [
    c, 0, -s, 0,
    0, 1, 0, 0,
    s, 0, c, 0,
    0, 0, 0, 1
  ];
};

function makeZRotation(angleInRadians) {
  //var angleInRadians = Math.PI * angleInDegrees / 180;
  var c = Math.cos(angleInRadians);
  var s = Math.sin(angleInRadians);
  return [
     c, s, 0, 0,
    -s, c, 0, 0,
     0, 0, 1, 0,
     0, 0, 0, 1,
  ];
}

function makeScale(sx, sy, sz) {
  return [
    sx, 0,  0,  0,
    0, sy,  0,  0,
    0,  0, sz,  0,
    0,  0,  0,  1,
  ];
}

function matrixMultiply(a, b) {
  var a00 = a[0*4+0];
  var a01 = a[0*4+1];
  var a02 = a[0*4+2];
  var a03 = a[0*4+3];
  var a10 = a[1*4+0];
  var a11 = a[1*4+1];
  var a12 = a[1*4+2];
  var a13 = a[1*4+3];
  var a20 = a[2*4+0];
  var a21 = a[2*4+1];
  var a22 = a[2*4+2];
  var a23 = a[2*4+3];
  var a30 = a[3*4+0];
  var a31 = a[3*4+1];
  var a32 = a[3*4+2];
  var a33 = a[3*4+3];
  var b00 = b[0*4+0];
  var b01 = b[0*4+1];
  var b02 = b[0*4+2];
  var b03 = b[0*4+3];
  var b10 = b[1*4+0];
  var b11 = b[1*4+1];
  var b12 = b[1*4+2];
  var b13 = b[1*4+3];
  var b20 = b[2*4+0];
  var b21 = b[2*4+1];
  var b22 = b[2*4+2];
  var b23 = b[2*4+3];
  var b30 = b[3*4+0];
  var b31 = b[3*4+1];
  var b32 = b[3*4+2];
  var b33 = b[3*4+3];
  return [a00 * b00 + a01 * b10 + a02 * b20 + a03 * b30,
          a00 * b01 + a01 * b11 + a02 * b21 + a03 * b31,
          a00 * b02 + a01 * b12 + a02 * b22 + a03 * b32,
          a00 * b03 + a01 * b13 + a02 * b23 + a03 * b33,
          a10 * b00 + a11 * b10 + a12 * b20 + a13 * b30,
          a10 * b01 + a11 * b11 + a12 * b21 + a13 * b31,
          a10 * b02 + a11 * b12 + a12 * b22 + a13 * b32,
          a10 * b03 + a11 * b13 + a12 * b23 + a13 * b33,
          a20 * b00 + a21 * b10 + a22 * b20 + a23 * b30,
          a20 * b01 + a21 * b11 + a22 * b21 + a23 * b31,
          a20 * b02 + a21 * b12 + a22 * b22 + a23 * b32,
          a20 * b03 + a21 * b13 + a22 * b23 + a23 * b33,
          a30 * b00 + a31 * b10 + a32 * b20 + a33 * b30,
          a30 * b01 + a31 * b11 + a32 * b21 + a33 * b31,
          a30 * b02 + a31 * b12 + a32 * b22 + a33 * b32,
          a30 * b03 + a31 * b13 + a32 * b23 + a33 * b33];
}
