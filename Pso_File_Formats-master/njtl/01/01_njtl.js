var fs = require("fs");
var util = require("util");

parse_xj("weapons/File 3.xj");

function parse_xj(filename){
  //var:
  var buffer, offset, eof, fp;
  var vertexes;
  //fn:
  buffer = fs.readFileSync(filename);

  //get offset for NJCM label
  for(fp = 0; fp < buffer.length - 4; fp += 4){
    if(buffer.toString("ascii", fp, fp+4) == "NJCM"){
      fp += 4;
      break;
    }
  }
  eof = buffer.readUInt32LE(fp) + 8;
  fp += 4;
  offset = fp;

//Read first node of the file
  var node = {
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
      buffer.readFloatLE(fp + 0x20),
      buffer.readFloatLE(fp + 0x24),
      buffer.readFloatLE(fp + 0x28),
    ],
    child : buffer.readUInt32LE(fp + 0x2C),
    sibling : buffer.readUInt32LE(fp + 0x30)
  };

  //Goto model pointer
  fp = node.model + offset;
  var header = {
    a_dword : buffer.readUInt32LE(fp),
    vertex_list : buffer.readUInt32LE(fp + 0x04),
    vtemp : buffer.readUInt32LE(fp + 0x08), //eval?
    strip_list : buffer.readUInt32LE(fp + 0x0C),
    stemp : buffer.readUInt32LE(fp + 0x10), //eval?
    b_dword : buffer.readUInt32LE(fp + 0x14),
    c_dword : buffer.readUInt32LE(fp + 0x18),
    center : [
      buffer.readFloatLE(fp + 0x1C),
      buffer.readFloatLE(fp + 0x20),
      buffer.readFloatLE(fp + 0x24)
    ],
    radius : buffer.readFloatLE(fp + 0x28)
  };

  //Goto vertex_list description
  fp = header.vertex_list + offset;
  var vert_header = {
    a_dword : buffer.readUInt32LE(fp),
    list : buffer.readUInt32LE(fp + 0x04),
    b_dword : buffer.readUInt32LE(fp + 0x08),
    num_verts : buffer.readUInt32LE(fp + 0x0C),
  };

  //Read all of the vertexes
  fp = vert_header.list + offset;
  vertexes = [];

  for(var i = 0; i < vert_header.num_verts; i++){
    vertexes.push({
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
      color : buffer.readUInt32LE(fp + 0x18),
      uv : [
        buffer.readFloatLE(fp + 0x1C),
        buffer.readFloatLE(fp + 0x20)
      ]
    });
    fp += 0x24;
  }

  //goto strip_list
  fp = header.strip_list + offset;
  var info = {
    text_list : buffer.readUInt32LE(fp + 0x00),
    text_num : buffer.readUInt32LE(fp + 0x04),
    indice_list : buffer.readUInt32LE(fp + 0x08),
    indice_num : buffer.readUInt32LE(fp + 0x0C),
  };

  //read the indices
  fp = info.indice_list + offset;
  var indices = [];
  for(var i = 0; i < info.indice_num; i++){
    indices.push(buffer.readUInt16LE(fp));
    fp += 2;
  }

  //write obj file for debugging
  var output = "output_saber.obj";
  var v, str;
  fs.writeFileSync(output, "");
  for(var i = 0; i < vertexes.length; i++){
    v = vertexes[i]["pos"];
    str = util.format("v %d %d %d \r\n", v[0], v[2], v[1]);
    fs.appendFileSync(output, str);
    v = vertexes[i]["norm"];
    str = util.format("vn %d %d %d \r\n", v[0], v[2], v[1]);
    fs.appendFileSync(output, str);
  }

  //write faces
  fs.appendFileSync(output, "g debug\r\n");
  var a, b, c;
  for(var i = 0; i < indices.length - 1; i++){
    a = indices[i] + 1;
    b = indices[i + 1] + 1;
    c = indices[i + 2] + 1;
    d = (i) ? indices[i - 1] + 1 : 0;

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
}
