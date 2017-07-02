var fs = require("fs");

const FILENAME = "anim01.prs";
var data = fs.readFileSync(FILENAME);
var buff = lzss_decompress(data);
fs.writeFileSync("anim_out.njm", buff);

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

  //var comp = fs.readFileSync("lappy_base.nj.bin");

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

  function compare_buffers(buf1, buf2){
    var str1 = buf1.toString("hex");
    var str2 = buf2.toString("hex", 0, str1.length);

    if(str1 != str2){
      throw new Error("Error: strings do not match")
    }
  }

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
