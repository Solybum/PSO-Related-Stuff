"use strict";

const FACTOR = 4294967296;
const RAD = 3.1415926535897309 / 180.0;

module.exports = {

  /*
  * New
  */
  New : function(){
    return [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ];
  },

  /*
  * Identity
  */
  Identity : function(){
    return [
      [1, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1]
    ];
  },

  /*
  * Normalize
  */
  Normalize : function(a){
    var tmp = this.Identity();
    for(var i = 0; i < 4; i++){
      for(var j = 0; j < 4; j++){
        tmp[i][j] = a[i][j] / a[3][3]
      }
    }
    return tmp;
  },

  /*
  * Multiply
  */
  Multiply : function(a, b){
    var tmp = this.Identity();
    var t, q, r;

    for(var i = 0; i < 4; i++){
      for(var j = 0; j < 4; j++){
        t = 0.0;
        for(var k = 0; k < 4; k++){
          t += a[i][k] * b[k][j];
        }
        tmp[i][j] = t;
      }
    }
    return tmp;
  },

  /*
  * dsin
  */
  dsin : function(theta){
    return Math.sin(theta * RAD);
  },

  /*
  * dcos
  */
  dcos : function(theta){
    return Math.cos(theta * RAD);
  },

  /*
  * Add
  */
  Add : function(a, b){
    tmp = this.Identity();
    for(var i = 0; i < 4; i++){
      for(var j = 0; j < 4; j++){
        tmp[i][j] = a[i][j] + b[i][j];
      }
    }
    tmp = this.Normalize(tmp);
    return tmp;
  },

  /*
  * Scale
  * @a matrix, @x,y,z axis-wise scale
  */
  Scale : function(a, x, y, z){
    var tmp = this.Identity();
    tmp[0][0] = x;
    tmp[1][1] = y;
    tmp[2][2] = z;
    tmp = this.Multiply(a, tmp);
    return tmp;
  },

  /*
  * ScaleNew
  * @a Matrix, @b xyzCoord
  */
  ScaleNew : function(a, b){
    var tmp = this.Identity();
    tmp[0][0] = b.x;
    tmp[1][1] = b.y;
    tmp[2][2] = b.z;
    tmp = this.Multiply(a, tmp);
    return tmp;
  },

  /*
  * Translate
  */
  Translate : function(a, x, y, z){
    var tmp = this.Identity();
    tmp[3][0] = x;
    tmp[3][1] = y;
    tmp[3][2] = z;
    tmp = this.Multiply(a, tmp);
    return tmp;
  },

  /*
  * TranslateNew
  */
  TranslateNew : function(a, b){
    var tmp = this.Identity();
    tmp[3][0] = b.x;
    tmp[3][1] = b.y;
    tmp[3][2] = b.z;
    tmp = this.Multiply(a, tmp);
    return tmp;
  },

  /*
  * RotateX
  */
  RotateX : function(a, theta){
    var tmp = this.Identity();
    var c = this.dcos(theta);
    var s = this.dsin(theta);
    tmp[1][1] = c;
    tmp[1][2] = s;
    tmp[2][1] = -s;
    tmp[2][2] = c;
    tmp = this.Multiply(a, tmp);
    return tmp;
  },

  /*
  * RotateY
  */
  RotateY : function(a, theta){
    var tmp = this.Identity();
    var c = this.dcos(theta);
    var s = this.dsin(theta);
    tmp[0][0] = c;
    tmp[0][2] = -s;
    tmp[2][0] = s;
    tmp[2][2] = c;
    tmp = this.Multiply(a, tmp);
    return tmp;
  },

  /*
  * RotateZ
  */
  RotateZ : function(a, theta){
    var tmp = this.Identity();
    var c = this.dcos(theta);
    var s = this.dsin(theta);
    tmp[0][0] = c;
    tmp[0][1] = s;
    tmp[1][0] = -s;
    tmp[1][1] = c;
    tmp = this.Multiply(a, tmp);
    return tmp;
  },

  /*
  * Rotate
  */
  Rotate : function(a, x, y, z){
    var tmp = this.Identity();
    tmp = this.RotateX(tmp, x);
    tmp = this.RotateY(tmp, y);
    tmp = this.RotateZ(tmp, z);
    tmp = this.Multiply(a, tmp);
    return tmp;
  },

  /*
  * RotateNew
  */
  RotateNew : function(a, b){
    var tmp = this.Identity();
    tmp = this.RotateX(tmp, b.x);
    tmp = this.RotateY(tmp, b.y);
    tmp = this.RotateZ(tmp, b.z);
    tmp = this.Multiply(a, tmp);
    return tmp;
  },

  /*
  * RotateNew
  */
  MakeRotate : function(b){
    var tmp = this.Identity();
    tmp = this.RotateX(tmp, b.x);
    tmp = this.RotateY(tmp, b.y);
    tmp = this.RotateZ(tmp, b.z);
    return tmp;
  },

  /*
  * Rotate2
  */
  Rotate2 : function(a, x, y, z){
    var tmp = this.Identity();
    tmp = this.RotateZ(tmp, z);
    tmp = this.RotateY(tmp, y);
    tmp = this.RotateX(tmp, x);
    tmp = this.Multiply(a, tmp);
    return tmp;
  },

  /*
  * Rotate2New
  */
  Rotate2New : function(a, b){
    var tmp = this.Identity();
    tmp = this.RotateZ(tmp, b.z);
    tmp = this.RotateY(tmp, b.y);
    tmp = this.RotateX(tmp, b.x);
    tmp = this.Multiply(a, tmp);
    return tmp;
  },

  /*
  * Apply
  */
  Apply : function(a, x, y, z){
    var t;
    var res = [];
    var tmp = [x, y, z, 1];
    for(var i = 0; i < 4; i++){
      t = 0.0;
      for(var j = 0; j < 4; j++){
        t += tmp[j] * a[j][i];
      }
      res[i] = t;
    }
    res[0] = res[0] / res[3];
    res[1] = res[1] / res[3];
    res[2] = res[2] / res[3];
    return res;
  },

  /*
  * Apply2
  * @a Matrix, @b XYZCoord
  */
  Apply2 : function(a, b){
    var t;
    var res = [];
    var tmp = [b.x, b.y, b.z, 1];
    for(var i = 0; i < 4; i++){
      t = 0.0;
      for(var j = 0; j < 4; j++){
        t += tmp[j] * a[j][i];
      }
      res[i] = t;
    }

    return {
      x : res[0] / res[3],
      y : res[1] / res[3],
      z : res[2] / res[3]
    };
  }
}
