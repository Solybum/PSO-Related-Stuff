var fs = require("fs");
var clone = require("clone");
var id = -1;

function split_nodes(node){
  id++;
  node.id = id;

  if(node.child){
    split_nodes(node.child);
  }
}
