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
  * @param{Buffer} filename
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
  function extract_files(filename){
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

})();
