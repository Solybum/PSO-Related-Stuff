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
    read_header : read_header,
    extract_files : extract_files
  };

  /**
  * parses the files in the header
  * @param{Buffer} buffer
  * @return{Array} list of files
  */
  function read_header(){

  }

  /**
  * extract all of the files
  * @param{String} filename
  * @param{String} directory
  * @return{Array} list of files
  */
  function extract_files(){
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

})();
