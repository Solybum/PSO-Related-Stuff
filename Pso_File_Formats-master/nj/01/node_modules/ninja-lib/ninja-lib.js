/**************************************************************
 * Ninja Library                                              *
 * Copyright 2015 Kion                                        *
 **************************************************************/

var fs = require("fs");
var path = require("path");

module.exports = {
  get_extension : get_extension,
  extract_bml : extract_bml,
  extract_afs : extract_afs,
  extract_gsl : extract_gsl,
  decompress_prs : lzss_decompress
};

/**************************************************************
 * get_extension                                              *
 **************************************************************/

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

/**************************************************************
 * extract_bml                                                *
 **************************************************************/

function extract_bml(filename, dest_folder){
  //var:
  var dest;
  var buffer;
  var num_items,type;
  var offset,entry,i,str,str_pos;
  var tmp_data, new_file;
  var array = new Array();

  if(!dest_folder){
    dest_folder = path.dirname(filename);
  }

  if(dest_folder[dest_folder.length - 1] == "/"){
    dest_folder = dest_folder.substring(0, dest_folder.length - 1);
  }

  //fn:
  buffer = fs.readFileSync(filename);

  if(!buffer)
    return false;

  //parse headers
  num_items = buffer.readUInt32LE(4);

  type = buffer.toString("hex",8,12);
  if(type != "50010000"){
    throw new Error("Invalid type debug string");
  }

  //parse entries
  entry = [];
  offset = 0x40;

  for(i = 0; i < num_items; i++){
    //parse filename
    str = buffer.toString("ascii",offset,offset+0x20);
    str_pos = -(32 - str.indexOf("\u0000"));
    str = str.slice(0,str_pos);
    offset += 0x20;

    //parse entry
    entry.push({
      name : str,
      csize : buffer.readUInt32LE(offset),
      unk : buffer.readUInt32LE(offset+0x4),
      usize : buffer.readUInt32LE(offset+0x8),
      pvm_csize : buffer.readUInt32LE(offset+0xc),
      pvm_usize : buffer.readUInt32LE(offset+0x10)
    });

    offset += 0x20;
  }

  //Read files
  if((offset & 0x7FF)){
    offset = (offset + 0x800) & 0xFFFFF800;
  }

  for(i = 0; i < num_items; i++){

    if(!buffer.readUInt32LE(offset)){
      offset += 0x10;
    }

    tmp_data = new Buffer(buffer.slice(
        offset,
        offset + entry[i].csize
    ));

    tmp_data = lzss_decompress(tmp_data);
    dest = dest_folder + "/" + entry[i].name;
    array.push(dest);
    fs.writeFileSync(dest, tmp_data);
    offset += entry[i].csize;

    if(offset % 0x10){
      offset += (0x10 - (offset % 0x10));
    }

    if(!entry[i].pvm_csize){
      continue;
    }

    str_pos = entry[i].name.lastIndexOf(".");
    str = entry[i].name.substr(0, str_pos) + ".pvm";

    tmp_data = new Buffer(buffer.slice(
      offset,
      offset + entry[i].pvm_csize
    ));

    tmp_data = lzss_decompress(tmp_data);
    dest = dest_folder + "/" + str;
    array.push(dest);
    fs.writeFileSync(str, tmp_data);
    offset += entry[i].pvm_csize;

    if(offset % 0x10){
      offset += (0x10 - (offset % 0x10));
    }
  }

  return array;
}

/**************************************************************
 * extract_afs                                                *
 **************************************************************/

function extract_afs(filename, compressed, dest_folder){
  var array = new Array();
  compressed = compressed || false;
  if(!dest_folder){
    dest_folder = path.dirname(filename);
  }

  if(dest_folder[dest_folder.length - 1] == "/"){
    dest_folder = dest_folder.substring(0, dest_folder.length - 1);
  }

  var data = fs.readFileSync(filename);
  var base = path.basename(filename);
  base = base.split(".");
  base.pop();
  base = base.join();

  var head = data.toString("ascii", 0, 4);
  fs.writeFileSync("name.txt", head);
  var num_items = data.readUInt32LE(4);

  var pointer = 8;
  for(var i = 0; i < num_items; i++){
    var offset = data.readUInt32LE(pointer);
    var length = data.readUInt32LE(pointer + 4);
    var buffer = new Buffer(length);
    data.copy(buffer, 0, offset, offset + length);

    if(compressed){
      buffer = lzss_decompress(buffer);
    }

    var num = i.toString();
    while(num.length < 3){
      num = "0" + num;
    }
    var ext = get_extension(buffer);
    num = dest_folder + "/" + base + "_" + num + ext;
    array.push(num);
    fs.writeFileSync(num, buffer);

    pointer += 8;
  }

  return array;
}

/**************************************************************
 * extract_gsl                                                *
 **************************************************************/

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

/**************************************************************
 * lzss_decompress                                            *
 **************************************************************/

function lzss_decompress(data){
  var self = {
    ibuf : data,
    obuf : [],
    iofs : 0,
    bit : 0,
    cmd : 0,
    getByte : int_getByte,
    getBit : bool_getBit
  }

  var t, a, b, j, cmd;
  var offset, amount, start;

  while (self.iofs < self.ibuf.length){
    cmd = self.getBit();
    if(cmd){
      self.obuf.push(self.ibuf[self.iofs]);
      self.iofs += 1;
    }else{
      t = self.getBit();
      if(t){
        a = self.getByte();
        b = self.getByte();

        offset = ((b << 8) | a) >> 3;
        amount = a & 7;
        if (self.iofs < self.ibuf.length){
          if (amount == 0)
            amount = self.getByte() + 1;
          else
            amount += 2;
        }
        start = self.obuf.length - 0x2000 + offset;
      }else{
        amount = 0;
        for (j = 0; j < 2; j++){
          amount <<= 1;
          amount |= self.getBit();
        }
        offset = self.getByte();
        amount += 2;

        start = self.obuf.length - 0x100 + offset;
      }
      for(j = 0; j < amount; j++){
        if (start < 0)
          self.obuf.push(0);
        else if (start < self.obuf.length)
          self.obuf.push(self.obuf[start]);
        else
          self.obuf.push(0);

        start += 1;
      }
    }
  }//while

  return new Buffer(self.obuf);

  function int_getByte(){
    var val = self.ibuf[self.iofs];
    self.iofs += 1;
    return parseInt(val);
  }

  function bool_getBit(){
    if(self.bit == 0){
	     self.cmd = self.getByte()
       self.bit = 8
    }
    var bit = self.cmd & 1;
    self.cmd >>= 1;
	  self.bit -= 1;
	  return parseInt(bit);
  }

}
