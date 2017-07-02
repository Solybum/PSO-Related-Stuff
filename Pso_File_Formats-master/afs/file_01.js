var fs = require("fs");
var path = require("path");

extract_afs("sample/PLAYER.AFS", false, "player");

function get_extension(buffer){
  var extensions = {
    "AFS" : ".afs",
    "XVMH" : ".xvm"
  };

  var head = buffer.toString("ascii", 0, 4);
  if(extensions[head]){
    return extensions[head];
  }else{
    return ".bin";
  }
}

function extract_afs(filename, compressed, dest_folder){
  var array = new Array();
  compressed = compressed || false;
  if(!dest_folder){
    dest_folder = path.dirname(filename);
  }

  if(dest_folder[dest_folder.length - 1] == "/"){
    dest_folder = dest_folder.substring(0, dest_folder.length - 1);
  }

  if(!fs.existsSync(filename)){
    return false;
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
