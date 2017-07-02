var fs = require("fs");
var path = require("path");

extract_gsl("gsl_forest01.gsl", "output");

function extract_gsl(filename, dest_folder){
  var buffer = fs.readFileSync(filename);
  var pointer = 0;
  var files = new Array();
  var array = new Array();

  if(!dest_folder){
    dest_folder = path.dirname(filename);
  }

  if(dest_folder[dest_folder.length - 1] == "/"){
    dest_folder = dest_folder.substring(0, dest_folder.length - 1);
  }

  while(buffer.readUInt32LE(pointer)){
    var str = buffer.toString("ascii", pointer, pointer + 32);
    str = str.replace(/\0/g, '');
    files.push({
      filename : str,
      offset : buffer.readUInt32LE(pointer + 32),
      length : buffer.readUInt32LE(pointer + 36)
    });
    pointer += 48;
  }

  for(var i = 0; i < files.length; i++){
    var length = files[i].length;
    var offset = files[i].offset * 2048;
    var tmp = new Buffer(length);
    var str = dest_folder + "/" + files[i].filename;
    var ext = path.extname(str);
    buffer.copy(tmp, 0, offset, offset + length);

    if(ext.length < 4){
      ext = get_extension(tmp);
      str = str.split(".");
      str.pop();
      str.push(ext);
      str = str.join("");
    }

    array.push(str);

    fs.writeFileSync(str, tmp);
  }

  return array;
}

function get_extension(buffer){
  var extensions = {
    "AFS" : ".afs",
    "XVMH" : ".xvm",
    "NJTL" : ".nj",
    "NMDM" : ".njm"
  };

  var head = buffer.toString("ascii", 0, 4).trim();

  if(extensions[head]){
    return extensions[head];
  }

  var bml_check = buffer.toString("hex", 8, 12);
  if(bml_check == "50010000"){
    return ".bml";
  }

  return ".bin";
}
