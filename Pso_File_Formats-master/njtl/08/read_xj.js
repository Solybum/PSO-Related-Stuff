var FilePointer = require("filepointer");

const FILENAME = "sample/pwand.xj";
parse_xj(FILENAME);

function parse_xj(filename){
  var fp = new FilePointer(filename);
  var data = {};
  data.textures = read_njtl();
  data.nodes = read_njcm();

  //console.log(data);


  /**
  * read_njtl
  **/
  function read_njtl(){
    var bool = fp.search("NJTL");
    if(!bool){
      return [];
    }
    var iff = fp.readIff();
    var length = fp.readDword();
    fp.trim();

    var info = {
      start : fp.readDword(),
      num_textures : fp.readDword()
    };

    fp.seek(info.start, fp.SEEK_SET);

    var textures = [];
    for(var i = 0; i < info.num_textures; i++){
      textures.push({
        addr : fp.readDword(),
        attr : fp.readDword(),
        texAttr : fp.readDword()
      });
    }

    var len;
    for(var i = 0; i < info.num_textures; i++){
      if(i == info.num_textures - 1){
        len = length - textures[i].addr;
      }else{
        len = textures[i+1].addr - textures[i].addr;
      }
      //delete textures[i].addr;
      textures[i] = fp.readStr(len);
    }

    return textures;
  }

  /**
  * read_njcm
  **/
  function read_njcm(){
    var bool = fp.search("NJCM");
    if(!bool){
      return;
    }

    var iff = fp.readIff();
    var length = fp.readDword();
    fp.trim();
    var nodes = [];
    readNodes(0);
    evalFlags();
    return nodes;

    //read nodes
    function readNodes(addr){
      fp.seek(addr, fp.SEEK_SET);

      var node = {
        flags : fp.readDword(),
        modelAddr : fp.readDword(),
        pos : {
          x : fp.readSingle(),
          y : fp.readSingle(),
          z : fp.readSingle()
        },
        ang : {
          x : fp.readAngle(),
          y : fp.readAngle(),
          z : fp.readAngle()
        },
        scale : {
          x : fp.readSingle(),
          y : fp.readSingle(),
          z : fp.readSingle()
        },
        childAddr : fp.readDword(),
        siblingAddr : fp.readDword()
      };

      if(node.childAddr){
        readNodes.apply(this, [node.childAddr])
      }

      if(node.siblingAddr){
        readNodes.apply(this, [node.siblingAddr])
      }

      nodes.push(node);
    }

    //eval flags
    function evalFlags(){
      for(var i = 0; i < nodes.length; i++){
        var str = nodes[i].flags.toString(2);
        while(str.length < 8){
          str = "0" + str;
        }
        var flags = {};
        flags.skip_pos =   Boolean(nodes[i].flags & 0b00000001);
        flags.skip_rot =   Boolean(nodes[i].flags & 0b00000010);
        flags.skip_scl =   Boolean(nodes[i].flags & 0b00000100);
        flags.eval_hide =  Boolean(nodes[i].flags & 0b00010000);
        flags.eval_break = Boolean(nodes[i].flags & 0b00100000);
        flags.zxy_ang =    Boolean(nodes[i].flags & 0b01000000);
        flags.skip_mot =   Boolean(nodes[i].flags & 0b10000000);
        flags.push_pop = (flags.skip_pos && flags.skip_rot && flags.skip_scl);

        console.log(flags);
      }
    }

  }
}
