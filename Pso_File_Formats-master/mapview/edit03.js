var fs = require("fs");
var util = require("util");

var filename = "map_forest01n.rel";
var buffer = fs.readFileSync(filename);

var fp, ap, bp, vp, tmp;
var c, ic, c2, ic2, q, o, e, f;
var areas, textoff, blockcount, textnum;
var textlist = [];
var MapSection = [];
var MapSectionData = [];

blockcount = 0;

//Get pointer to header
fp = buffer.readUInt16LE(buffer.length-16);
fp += 8;

//Get number of areas
areas = buffer.readUInt16LE(fp); //16
fp += 8;

//Get pointer to first area
ap = buffer.readUInt16LE(fp);  // 8368
fp += 4;

//Get pointer to texture offset
textoff = buffer.readUInt16LE(fp); // 9824
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
      textureidAlpha : []
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
      MapSectionData[i].VList[k].data.push(tmp);
      fp += c;
    }else{
      throw new Error("Unkown vertex type");
    }

  }

  fp = textoff;
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

}//End parse MapSectionData


/****************************************************************************
*****************************************************************************
**                   Parsing Map File Complete                             **
**                     Creating Output files                               **
*****************************************************************************
****************************************************************************/

var base = filename.split(".")[0];
var out_model = util.format("%s.obj", base);
var out_material = util.format("%s.mtl", base);

var modf;
var img_format;
var tmp, total, txt_id, blocks;
var vlist, indice_list, total;
var str, vertex, tnum, a, b, c;

img_format = ".dds";
total = 1;
txt_id = 1;
block  = 1;
modf = fs.openSync(out_model, "w");
//matf = fs.openSync(out_material, "w");

//tmp = util.format("mtllib %s\r\n", out_material);
//fs.writeSync(modf, tmp);

for(var i = 0; i < MapSectionData.length; i++){
  vlist = MapSectionData[i].VList;

  tmp = util.format("\r\n#Section %d\r\n", i + 1);
  fs.writeSync(modf, tmp);
  console.log("Section %d", i);
  console.log(vlist);
  for(var k = 0; k < vlist.length; k++){
    console.log(vlist[k].indice.length);
    //Vertex list for section
    for(var j = 0; j < vlist[k].data.length; j++){
      vertex = vlist[k].data[j];
      str = util.format("v %d %d %d\r\n",vertex.px, vertex.pz, vertex.py);
      fs.writeSync(modf, str);
    }

    //Groups
    for(j = 0; j < vlist[k].indice.length; j++){
      indice_list = vlist[k].indice[j];
      tnum = vlist[k].textureid[j];
      console.log(tnum);
      console.log(textlist[tnum]);

      fs.writeSync(modf, "\r\n");
      fs.writeSync(modf, "o block"+block+"\r\n");
      block++;
      //fs.writeSync(modf, 'usemtl mat'+txt_id+"\r\n");

      //faces
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

      }

      total += vlist[k].data.length;
    }


  }

  //if(i)
  break;
}

fs.closeSync(modf);
//fs.closeSync(matf);
