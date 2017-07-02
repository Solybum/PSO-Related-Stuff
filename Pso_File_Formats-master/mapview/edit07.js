/* Imports */
var fs = require("fs");
var util = require("util");

/* Global Variables */
var textlist = [];
var MapSection = [];
var MapSectionData = [];

/* Function Defitions */
var CheckArgs = void_CheckArgs;
var ParseMap = void_ParseMap;
var WriteOutput = void_WriteOutput;

/******************************************************************************
**                             Main Function                                 **
******************************************************************************/

!function main(args){
  CheckArgs(args);
  ParseMap(args[2]);
  WriteOutput(args[2]);
}(process.argv);

/******************************************************************************
**                           Check Args Function                             **
******************************************************************************/

function void_CheckArgs(args){

  //fn:
  var endswith = bool_endswith;

  //begin:
  if(args.length != 3){
    console.log("Usage: node edit.js <filename.rel>")
    process.exit();
  }

  if(!endswith(args[2], ".rel")){
      console.log("Must pass a .rel file into this script");
      process.exit();
  }

  var exists = fs.existsSync(args[2]);
  if(!exists){
    console.log("Passed in filename does not exist")
    process.exit();
  }

  return;

  function bool_endswith(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
  }

}

/******************************************************************************
**                           Parse Map Function                              **
******************************************************************************/

function void_ParseMap(filename){
  //var:
  var buffer;
  var fp, ap, bp, vp, tmp;
  var c, ic, c2, ic2, q, o, e, f;
  var areas, textoff, blockcount, textnum;

  //fn:
  var readtexture = void_readtexture;
  var makevertex = void_makevertex;
  var adjustvertex = void_adjustvertex;

  //begin:
  buffer = fs.readFileSync(filename);

  //Get pointer to header
  fp = buffer.readUInt32LE(buffer.length-16);
  fp += 8;
  //Get number of areas
  areas = buffer.readUInt32LE(fp);
  fp += 8;
  //Get pointer to first area
  ap = buffer.readUInt32LE(fp);
  fp += 4;
  //Get pointer to texture offset
  textoff = buffer.readUInt32LE(fp);
  readtexture(textoff);
  //Goto area pointer
  fp = ap;

  //Parse MapSection
  for(var i = 0; i < areas; i++){
    MapSection.push({
      ID : buffer.readUInt32LE(fp),
      dx : buffer.readFloatLE(fp+4),
      dz : buffer.readFloatLE(fp+8),
      dy : buffer.readFloatLE(fp+12),
      unknown1 : buffer.readUInt32LE(fp+16),
      Rotation : buffer.readUInt32LE(fp+20),
      unkown2 : buffer.readUInt32LE(fp+24),
      unkown3 : buffer.readFloatLE(fp+28),
      VertexA_Off : buffer.readUInt32LE(fp+32),
      VertexB_Off : buffer.readUInt32LE(fp+36),
      VertexA_Count : buffer.readUInt32LE(fp+40),
      VertexB_Count : buffer.readUInt32LE(fp+44),
      unkown8 : buffer.readUInt32LE(fp+48)
    }); // okay
    fp += 52;
  }

  //Parse MapSectionData;
  for(var i = 0; i < areas; i++){

    MapSectionData[i] = {
      VBlock : [],
      EVBlock : [],
      VList : [],
      EVList : [],
      VListCount : [],
      EVListCount : []
    };

    fp = MapSection[i].VertexA_Off;
    for(var k = 0; k < MapSection[i].VertexA_Count; k++){
      MapSectionData[i].VBlock.push({
        Offset : buffer.readUInt32LE(fp),
        unkown1: buffer.readUInt32LE(fp+4),
        unkown2: buffer.readUInt32LE(fp+8),
        Flag : buffer.readUInt32LE(fp+12)
      }); //okay
      fp += 16;
    }
    //console.log(MapSectionData[i].VBlock);

    fp = MapSection[i].VertexB_Off;
    for(var k = 0; k < MapSection[i].VertexB_Count; k++){
      MapSectionData[i].EVBlock.push({
        Offset : buffer.readUInt32LE(fp),
        unkown1: buffer.readUInt32LE(fp+4),
        unkown2: buffer.readUInt32LE(fp+8),
        unkown3: buffer.readUInt32LE(fp+12),
        unkown4: buffer.readUInt32LE(fp+16),
        unkown5: buffer.readUInt32LE(fp+20),
        unkown6: buffer.readUInt32LE(fp+24),
        Flag : buffer.readUInt32LE(fp+28)
      });
      fp += 32;
    }
    //console.log(MapSectionData[i].EVBlock);

    //Vertex List A
    for(var k = 0; k < MapSection[i].VertexA_Count; k++){
      blockcount++;

      if((MapSectionData[i].VBlock[k].Flag & 0x4) === 0x4){
        throw new Error("Partity bit exception");
      }

      fp = MapSectionData[i].VBlock[k].Offset + 4;
      var duno = [];
      duno[0] = buffer.readFloatLE(fp);
      duno[1] = buffer.readFloatLE(fp + 4);
      duno[2] = buffer.readFloatLE(fp + 8);
      bp = buffer.readUInt32LE(fp); //200148

      if(!bp)
        continue;

      fp = bp + 4;
      vp = buffer.readUInt32LE(fp);
      fp += 8;

      c = buffer.readUInt32LE(fp);
      fp+=4;
      ic = buffer.readUInt32LE(fp);
      fp+=4;
      c2 = buffer.readUInt32LE(fp);
      fp+=4;
      ic2 = buffer.readUInt32LE(fp);

      MapSectionData[i].VList[k] = {
        indicecountcount : ic,
        indiceAlphacountcount : ic2,
        indice : [],
        indicecount : [],
        textureid : [],
        indiceAlpha : [],
        indiceAlphacount : [],
        textureidAlpha : [],
        duno : duno
      };

      //indicecountcount
      for(var j = 0; j < ic; j++){
        fp = c;
        c += 20;

        q = buffer.readUInt32LE(fp);
        fp += 4;
        o = buffer.readUInt32LE(fp);
        fp += 4;
        e = buffer.readUInt32LE(fp);
        fp += 4;
        f = buffer.readUInt32LE(fp);
        fp += 4;

        fp = e;

        MapSectionData[i].VList[k].indice[j] = [];
        for(var n = 0; n < f; n++){
          MapSectionData[i].VList[k].indice[j][n] = buffer.readUInt16LE(fp);
          fp += 2;
        }
        MapSectionData[i].VList[k].indicecount[j] = f;

        if(o){

          if(o === 4)
            q += 16;

          fp = q + 4;
          tmp = buffer.readUInt32LE(fp);
          MapSectionData[i].VList[k].textureid[j] = tmp;
        }else if(j > 0){
          tmp = MapSectionData[i].VList[k].textureid[j-1];
          MapSectionData[i].VList[k].textureid[j] = tmp;
        }else{
          MapSectionData[i].VList[k].textureid[j] = -1;
        }

      }//indicecountcount for

      //indiceAlphacountcount
      for(var j = 0; j < ic2; j++){
        fp = c2;
        c2 += 20;

        q = buffer.readUInt32LE(fp);
        fp += 4;
        o = buffer.readUInt32LE(fp);
        fp += 4;
        e = buffer.readUInt32LE(fp);
        fp += 4;
        f = buffer.readUInt32LE(fp);
        fp += 4;

        fp = e;

        MapSectionData[i].VList[k].indiceAlpha[j] = [];
        for(var n = 0; n < f; n++){
          MapSectionData[i].VList[k].indiceAlpha[j][n] = buffer.readUInt16LE(fp);
          fp += 2;
        }
        MapSectionData[i].VList[k].indiceAlphacount[j] = f;

        if(o){
          if(o === 4)
            q += 16;

          fp = q + 4;
          tmp = buffer.readUInt32LE(fp);
          MapSectionData[i].VList[k].textureidAlpha[j] = tmp;
        }else if(j > 0){
          tmp = MapSectionData[i].VList[k].textureidAlpha[j-1];
          MapSectionData[i].VList[k].textureidAlpha[j] = tmp;
        }else{
          MapSectionData[i].VList[k].textureidAlpha[j] = -1;
        }

      }//indicealphacount for

      fp = vp + 4;
      vp = buffer.readUInt32LE(fp);
      fp += 4;
      c = buffer.readUInt32LE(fp);
      fp += 4;

      //number of vertex
      tmp = buffer.readUInt32LE(fp);
      MapSectionData[i].VListCount[k] = tmp;

      fp = vp;
      MapSectionData[i].VList[k].data = [];

      if(c === 16){
        for(var o = 0; o < MapSectionData[i].VListCount[k]; o++){
          tmp = {
            px : buffer.readFloatLE(fp),
            pz : buffer.readFloatLE(fp+4),
            py : buffer.readFloatLE(fp+8),
            color : buffer.readUInt32LE(fp+12),
            tu : 0,
            tv : 0
          };
          tmp = makevertex(tmp);
          tmp = adjustvertex(tmp, i, k);
          MapSectionData[i].VList[k].data.push(tmp);
          fp += c;
        }
      }else if(c === 24){
        for(var o = 0; o < MapSectionData[i].VListCount[k]; o++){
          tmp = {
            px : buffer.readFloatLE(fp),
            pz : buffer.readFloatLE(fp+4),
            py : buffer.readFloatLE(fp+8),
            color : buffer.readUInt32LE(fp+12),
            tu : buffer.readFloatLE(fp+16),
            tv : buffer.readFloatLE(fp+20)
          };
          tmp = makevertex(tmp);
          tmp = adjustvertex(tmp, i, k);
          MapSectionData[i].VList[k].data.push(tmp);
          fp += c;
        }
      }else if(c === 28){
        tmp = {
          px : buffer.readFloatLE(fp),
          pz : buffer.readFloatLE(fp+4),
          py : buffer.readFloatLE(fp+8),
          nx : buffer.readFloatLE(fp+12),
          nz : buffer.readFloatLE(fp+16),
          ny : buffer.readFloatLE(fp+20),
          color : buffer.readUInt32LE(fp+24),
          tu : 0,
          tv : 0
        };
        tmp = adjustvertex(tmp, i, k);
        MapSectionData[i].VList[k].data.push(tmp);
        fp += c;
      }else if(c === 36){
        tmp = {
          px : buffer.readFloatLE(fp),
          pz : buffer.readFloatLE(fp+4),
          py : buffer.readFloatLE(fp+8),
          nx : buffer.readFloatLE(fp+12),
          nz : buffer.readFloatLE(fp+16),
          ny : buffer.readFloatLE(fp+20),
          color : buffer.readUInt32LE(fp+24),
          tu : buffer.readFloatLE(fp+28),
          tv : buffer.readFloatLE(fp+32)
        };
        tmp = adjustvertex(tmp, i, k);
        MapSectionData[i].VList[k].data.push(tmp);
        fp += c;
      }else{
        throw new Error("Unkown vertex type");
      }

    }
  }

  return;

  function void_readtexture(offset){
    //var:
    var fp, textoff;

    //begin:
    fp = offset;
    textoff = buffer.readUInt32LE(fp);
    fp += 4;
    textnum = buffer.readUInt32LE(fp);

    var test = String.fromCharCode(0);
    for(var i= 0; i < textnum; i++){
      fp = textoff;
      textoff += 12;
      fp = buffer.readUInt32LE(fp);
      tmp = buffer.toString("ascii", fp, fp+128);
      if(tmp.indexOf(test) != -1)
        tmp = tmp.substr(0, tmp.indexOf(test));
      textlist[i] = tmp;
    }
  }

  function void_makevertex(v){
    var result;

    result = {};

    result.px = v.px;
    result.py = v.py;
    result.pz = v.pz;
    result.nx = 1;
    result.ny = 0;
    result.nz = 0;
    result.color = v.color;
    result.tu = v.tu;
    result.tv = v.tv;

    return result;
  }

  function void_adjustvertex(v, l, k){
    var r;
    var result;

    r = 0;
    result = {};

    if(MapSection[l].Rotation != 0)
      r = MapSection[l].Rotation / 10430.378350;

    result.px = v.px + MapSectionData[l].VList[k].duno[0];
    result.px = (result.px*Math.sin(r))+(result.px*Math.cos(r));
    result.py = v.py + MapSectionData[l].VList[k].duno[2];
    result.py = (result.py*Math.sin(r))-(result.py*Math.cos(r));

    result.px = result.px+MapSection[l].dx;
    result.py = result.py-MapSection[l].dy;
    result.pz = v.pz+MapSection[l].dz +MapSectionData[l].VList[k].duno[1];
    result.nx = 1;
    result.ny = 0;
    result.nz = 0;
    result.color = v.color;
    result.tu = v.tu;
    result.tv = v.tv;

    return result;

  }

}

/******************************************************************************
**                        Write Output Function                              **
******************************************************************************/

function void_WriteOutput(filename){
  //var:
  var base, out_dir, modf, block, total;


  //begin:
  block = 0;
  total = 1;
  base = filename.split(".")[0];
  base = base.split("/");
  base = base[base.length - 1];

  out_dir = "output";
  out_model = util.format("%s/%s_all.obj",out_dir, base);
  modf = fs.openSync(out_model, "w");

  for(var i = 0; i < MapSectionData.length; i++){
    vlist = MapSectionData[i].VList;
    tmp = util.format("\r\n#Section %d\r\n", i + 1);
    //fs.writeSync(modf, tmp);
    console.log("Section %d", i);
    console.log("VList length: %d", vlist.length);

    for(var k = 0; k < vlist.length; k++){

      if(!vlist[k].indice.length)
        continue;

      //vertex list
      for(var j = 0; j < vlist[k].data.length; j++){
        vertex = vlist[k].data[j];

        str = util.format("v %d %d %d\r\n",vertex.px, vertex.pz, vertex.py);
        fs.writeSync(modf, str);
      }

      //Groups
      for(j = 0; j < vlist[k].indice.length; j++){
        indice_list = vlist[k].indice[j];
        tnum = vlist[k].textureid[j];

        block++;
        fs.writeSync(modf, "g block"+block+"\r\n");
        for(var n = 0; n < indice_list.length - 1; n++){
          a = indice_list[n] + total;
          b = indice_list[n + 1]  + total;
          c = indice_list[n + 2]  + total;
          d = (n) ? indice_list[n - 1] + total : 0;
          if(!n % 2){
            str = util.format("f %d %d %d\r\n", a, b, c);
            fs.writeSync(modf, str);
            str = util.format("f %d %d %d\r\n", a, c, b);
            fs.writeSync(modf, str);
          }else{
            str = util.format("f %d %d %d\r\n", a, d, b);
            fs.writeSync(modf, str);
            str = util.format("f %d %d %d\r\n", a, b, d);
            fs.writeSync(modf, str);
          }
        }//indice for

      }//group for

      total += vlist[k].data.length;
    }//vlist for

  }//section for

  fs.closeSync(modf);
}
