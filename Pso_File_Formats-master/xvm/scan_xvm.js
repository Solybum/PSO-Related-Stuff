var fs = require("fs");
//var dxt = require('dxt-js');
var PNG = require('pngjs').PNG;
var jpeg = require("jpeg-js");

const FILENAME = "input/ItemTexture_000.xvm";
export_xvm(FILENAME);

function export_xvm(file, array){
  var buffer = fs.readFileSync(file);

  var iff = buffer.toString("ascii", 0, 4);
  if(iff != "XVMH"){
    throw new Error("Invalid file parameter provided");
  }

  var offset = buffer.readUInt32LE(4) + 8;
  var num_elements = buffer.readUInt32LE(8);

  for(var i = 0; i < num_elements; i++){
    var header = read_xvrt_header(offset);
    offset += 0x40;
    console.log(header);

    var data = new Buffer(header.data_length);
    buffer.copy(data, 0, offset, offset + header.data_length);
    offset += data.length;

    write_file(header, data);
    break;
  }

  function read_xvrt_header(fp){
    var tmp = {
      iff : buffer.toString("ascii", fp, fp + 4),
      byte_size : buffer.readUInt32LE(fp + 0x04),
      color_type : buffer.readUInt32LE(fp + 0x08),
      category_code : buffer.readUInt32LE(fp + 0x0C),
      resource_id : buffer.toString("hex", fp + 0x10, fp + 0x14),
      width : buffer.readUInt16LE(fp + 0x14),
      height : buffer.readUInt16LE(fp + 0x16),
      data_length : buffer.readUInt32LE(fp + 0x18)
    };

    switch(tmp.category_code){
      case 6:
        tmp.type = "DXT1 RGBA565";
      break;
      default:
        throw new Error("unknown color code ", tmp.category_code);
      break;
    }
    tmp.resource_id = tmp.resource_id.match(/.{1,2}/g);
    tmp.resource_id = tmp.resource_id.reverse();
    tmp.resource_id = tmp.resource_id.join("");

    return tmp;
  }

  function write_file(header, data){
    var width = 320, height = 180;
    var frameData = new Buffer(width * height * 4);
    var i = 0;
    while (i < frameData.length) {
      frameData[i++] = 0xFF; // red
      frameData[i++] = 0x00; // green
      frameData[i++] = 0x00; // blue
      frameData[i++] = 0xFF; // alpha - ignored in JPEGs
    }
    var rawImageData = {
      data: frameData,
      width: width,
      height: height
    };
    var jpegImageData = jpeg.encode(rawImageData, 50);
    console.log(jpegImageData);
    fs.writeFileSync("test.jpeg", jpegImageData.data);
  }

}
