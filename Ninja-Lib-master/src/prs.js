/*
    This file is part of Ninja-lib

    Copyright (C) 2015 Benjamin Collins

    This library is free software: you can redistribute it and/or modify
    it under the terms of the GNU Lesser General Public License as
    published by the Free Software Foundation, either version 2.1 or
    version 3 of the License.

    This library is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Lesser General Public License for more details.

    You should have received a copy of the GNU Lesser General Public
    License along with this library. If not, see <http://www.gnu.org/licenses/>.
*/

module.exports = (function(){

  return {
    compress : compress,
    decompress : decompress
  };

  /**
  * compress placeholder
  * @param{Buffer} decompressed-buffer
  * @return{Buffer} compressed-buffer
  */
  function compress(buffer){

  }

  /**
  * decompress
  * @param{Buffer} compressed-buffer
  * @return{Buffer} decompressed-buffer
  */
  function decompress(buffer){
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

})();
