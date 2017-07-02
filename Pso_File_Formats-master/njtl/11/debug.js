var fs = require("fs");
var clone = require("clone");
var sprintf = require("util").format;

const FILENAME = "sample/pwand.json";
var file = fs.readFileSync(FILENAME);
var model = JSON.parse(file.toString());
var array = split_nodes(model);

var str = JSON.stringify(array, null, "\t");
fs.writeFileSync("debug.json", str);

function split_nodes(model){
  var array = [];
  var id = -1;
  child_loop(model);
  return array;

  function child_loop(node){
    var n = clone(node);

    id++;
    n.id = id;
    delete n.child;
    delete n.sibling;
    array.push(n);

    var vert_str = "";
    for(var i = 0; i < node.vertex_list.length; i++){
      vert_str += sprintf("x: %s, y: %s, z: %s \r\n",
      node.vertex_list[i].pos.x,node.vertex_list[i].pos.y,node.vertex_list[i].pos.z)
    }
    n.vertex_list = vert_str;

    for(var i = 0; i < node.polygon.length; i++){
      n.polygon[i].list = node.polygon[i].list.join(",");
    }
    if(node.child){
      child_loop(node.child);
    }

    if(node.sibling){
      child_loop(node.sibling);
    }

  }

}
