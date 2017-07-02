var fs = require("fs");

const FILENAME = "input/CCCONSOLE.PVM";
read_pvm(FILENAME);

function read_pvm(filename){
  var buffer = fs.readFileSync(filename);
  var iff = buffer.toString("ascii", 0, 4);

  if(iff != "PVMH"){
    throw new Error("Incorrect iff string");
  }

  var header = scan_header(buffer);
  parse_textures(header, buffer);

  function scan_header(buffer){
    var length = buffer.readUInt32LE(4) + 8;

    var array = [];
    for(var fp = 8; fp < length - 0x22; fp += 0x22){
      array.push({
        unknown1 : buffer.toString("hex", fp, fp + 2),
        unknown2 : buffer.toString("hex", fp+2, fp + 4),
        text_id : buffer.readUInt16LE(fp + 4),
        name : buffer.toString("ascii", fp + 6, fp + 6 + 0x1C).replace(/\0/g, "")
      });
    }

    return array;
  }

  function parse_textures(array, buffer){
    var length = buffer.readUInt32LE(4) + 8;

    const COLOR_TYPES = {
      "00" : "ARGB_1555",
      "01" : "RGB_565",
      "02" : "ARGB_4444",
      "03" : "YUV_422",
      "04" : "BUMP",
      "05" : "RGB_555",
      "FF" : "COLOR_MASK"
    };

    const CATEGORY_TYPES = {
      "01" : "TWIDDLED",
      "02" : "TWIDDLED_MM",
      "03" : "VQ",
      "04" : "VQ_MM",
      "05" : "PALETTIZE4",
      "06" : "PALETTIZE4_MM",
      "07" : "PALETTIZE8",
      "08" : "PALETTIZE8_MM",
      "09" : "RECTANGLE",
      "0B" : "STRIDE",
      "10" : "SMALLVQ",
      "11" : "SMALLVQ_MM",
      "FF" : "TYPE_MASK"
    };

    var fp = length;
    var iff = buffer.toString("ascii", fp, fp + 4);
    var byte_size = buffer.readUInt32LE(fp + 4) - 8;
    var type = buffer.toString("hex", fp + 8, fp + 10);
    type = type.toUpperCase().match(/.{1,2}/g);
    var color = COLOR_TYPES[type[0]];
    var category = CATEGORY_TYPES[type[1]];

    var width = buffer.readUInt16LE(fp + 12);
    var height = buffer.readUInt16LE(fp + 14);
    fp += 16;

    var data = new Buffer(byte_size);
    buffer.copy(data, 0, fp, fp + byte_size);

    fp += byte_size;

    var conf = buffer.toString("ascii", fp, fp + 4);
    console.log(conf);
  }

}
