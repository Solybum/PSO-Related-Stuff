/*
LZSS Decompression
http://wiki.xentax.com/index.php?title=LZSS
*/

var fs = require("fs");

const FILENAME = "lappy_base.nj.prs";
var data = fs.readFileSync(FILENAME);
console.log(data);

function lzss_decompress(ibuf){
  var iofs = 0;
  var bit = 0;
  var cmd = 0;
  



}
