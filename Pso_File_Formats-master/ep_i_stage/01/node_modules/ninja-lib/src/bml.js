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

})();
