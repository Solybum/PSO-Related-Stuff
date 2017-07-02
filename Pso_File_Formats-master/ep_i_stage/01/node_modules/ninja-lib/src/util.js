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

  /**
  * return library interface
  **/
  return {
    get_extension : get_extension
  };

/**
 * Reads the interchange file format header
 * @param {Buffer} buffer
 * @return {String} extension
 **/

  function get_extension(buffer){
    var iff;
    iff = buffer.toString("ascii", 0, 4);
    iff = head.replace(/\0/g, "");

    switch(iff){
      case "AFS":
        return ".afs";
      break;
      case "XVMH":
        return ".xvm";
      break;
      case "XVRT":
        return ".xvr";
      break;
      case "PVMH":
        return ".xvm";
      break;
      case "PVRT":
        return ".xvr";
      break;
      case "NMDM":
        return ".njm"
      break;
      case "NJTL":
        return ".nj";
      break;
      default:
        return ".bin";
      break;
    }
  }

})();
