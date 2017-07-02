var fs = require("fs");
var clone = require("clone");
var FilePointer = require("filepointer");

const FILENAME = "sample/pwand.xj";
var fp = new FilePointer(FILENAME);

var bool = fp.find("NJCM");
if(!bool){
  process.exit("File format not found");
}
fp.seek_cur(0x08);
fp.trim();
var called = 0;
var node = read_node(0);
//sort_node();
var str = JSON.stringify(node, null, "\t");
fs.writeFileSync("sample/pwand.json", str);

function read_node(offset){
  fp.seek_set(offset);

  //read the njcm node
  var node = {
    flags : fp.read_dword(),
    model : fp.read_dword(),
    translation : {
      x : fp.read_single(),
      y : fp.read_single(),
      z : fp.read_single()
    },
    rotation : {
      x : fp.read_angle(),
      y : fp.read_angle(),
      z : fp.read_angle()
    },
    scale : {
      x : fp.read_single(),
      y : fp.read_single(),
      z : fp.read_single()
    },
    child : fp.read_dword(),
    sibling : fp.read_dword()
  };

  fp.seek_set(node.model);
  delete node.model;
  delete node.scale;

  //read the model entry
  var model = {
    unknown_01 : fp.read_dword(),
    vert_entry_addr : fp.read_dword(),
    unknown_02 : fp.read_dword(),
    polygon_entry_01_addr : fp.read_dword(),
    polygon_01_texture : fp.read_dword(),
    polygon_entry_02_addr : fp.read_dword(),
    polygon_02_texture : fp.read_dword(),
    center : {
      x : fp.read_single(),
      y : fp.read_single(),
      z : fp.read_single()
    },
    radius : fp.read_single()
  };

  node.vertex_list = [];
  node.center = model.center;
  node.radius = model.radius;

  //read the vertexes
  if(model.vert_entry_addr){
    fp.seek_set(model.vert_entry_addr);

    var tmp_vert = {
      unknown_05 : fp.read_dword(),
      vertex_list_addr : fp.read_dword(),
      unknown_06 : fp.read_dword(),
      num_vertexes : fp.read_dword()
    };

    fp.seek_set(tmp_vert.vertex_list_addr);
    for(var i = 0; i < tmp_vert.num_vertexes; i++){
      node.vertex_list.push({
        pos : {
          x : fp.read_single(),
          y : fp.read_single(),
          z : fp.read_single()
        },
        norm : {
          x : fp.read_single(),
          y : fp.read_single(),
          z : fp.read_single()
        },
        color : {
          r : fp.read_byte(),
          g : fp.read_byte(),
          b : fp.read_byte(),
          a : fp.read_byte()
        },
        map : {
          u : fp.read_single(),
          v : fp.read_single()
        }
      });
    }
  }

  node.polygon = [];

  //polygon list 01
  if(model.polygon_entry_01_addr){
    fp.seek_set(model.polygon_entry_01_addr);

    var text_tmp = {
      unknown_06 : fp.read_dword(),
      unknown_07 : fp.read_dword(),
      indice_list_addr : fp.read_dword(),
      num_indices : fp.read_dword()
    };

    var poly = {};
    poly.texture = model.polygon_01_texture;
    poly.list = [];

    fp.seek_set(text_tmp.indice_list_addr);
    for(var i = 0; i < text_tmp.num_indices; i++){
      poly.list.push(fp.read_word());
    }

    node.polygon.push(poly);
  }

  //polygon list 02
  if(model.polygon_entry_02_addr){
    fp.seek_set(model.polygon_entry_02_addr);

    var text_tmp = {
      unknown_06 : fp.read_dword(),
      unknown_07 : fp.read_dword(),
      indice_list_addr : fp.read_dword(),
      num_indices : fp.read_dword()
    };

    var poly = {};
    poly.texture = model.polygon_02_texture;
    poly.list = [];

    fp.seek_set(text_tmp.indice_list_addr);
    for(var i = 0; i < text_tmp.num_indices; i++){
      poly.list.push(fp.read_word());
    }

    node.polygon.push(poly);
  }

  if(node.child){
    node.child = read_node(node.child);
  }else{
    node.child = null;
  }

  if(node.sibling){
    node.sibling = read_node(node.sibling);
  }else{
    node.sibling = null;
  }

  return node;
}

function sort_node(){
  var id = -1;
  var len = 0;

  set_number(node);
  function set_number(node){
    id++;
    node.id = id;

    len++;

    if(node.child){
      set_number(node.child);
    }
    if(node.sibling){
      set_number(node.sibling);
    }
  }

  var node_list = new Array(len);
  var vert_list = new Array(len);

  populate_array(node);
  function populate_array(node){
    var n = clone(node);
    delete n.child;
    delete n.sibling;


    if(node.child){
      n.child = node.child.id;
    }

    if(node.sibling){
      n.sibling = node.sibling.id;
    }

    var v = clone(n.vertex_list);
    delete n.vertex_list;
    delete n.polygon;
    delete n.center;
    delete n.translation;
    delete n.radius;

    node_list[n.id] = JSON.stringify(n, null, "\t");
    vert_list[n.id] = v;

    if(node.child){
      populate_array(node.child)
    }

    if(node.sibling){
      populate_array(node.sibling)
    }
  }

  //console.log(node_list);
  var string = node_list.join(",\n");
  fs.writeFileSync("output.json", node_list);
}
