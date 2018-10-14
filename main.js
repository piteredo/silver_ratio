//
//
// main.js
// 2018 @auther Taku Oshiba
// This Program is MIT license.
//
//
phina.globalize();

SCREEN_WIDTH = 640;
SCREEN_HEIGHT = 960;
BACKGROUND_COLOR = "#F3F3F2";


phina.define('MainScene',{
  superClass: 'DisplayScene',

  NODE_SIZE: 12,
  SIZE_ID: 5,
  MOVE_SPEED: 165,

  init: function() {
    this.superInit({
      backgroundColor: BACKGROUND_COLOR
    });

    let shortSum = SizeList().getShortSum(this.SIZE_ID);
    let longSum = SizeList().getLongSum(this.SIZE_ID);
    let shortMaxSum = SizeList().getShortSum(5);
    let marginTop = (SCREEN_WIDTH - (shortMaxSum * this.NODE_SIZE)) / 2;
    let marginLeft = (SCREEN_WIDTH - (shortMaxSum * this.NODE_SIZE)) / 2;

    let square = Square(this.NODE_SIZE, this.SIZE_ID)
      .setPosition(marginLeft, marginTop)
      .addChildTo(this);

    let pointer = Pointer(this.NODE_SIZE, this.SIZE_ID)
      .setPosition(0, 0, this.NODE_SIZE)
      .setMoveSpeed(this.MOVE_SPEED)
      .setSquareInstance(square)
      .addChildTo(square);

    pointer.moveStart();

    Labels(shortSum, longSum).addChildTo(this);
  },
});


phina.define('Square',{
  superClass: 'DisplayElement',

  init: function(nodeSize, sizeId) {
    this.superInit();
    this._nodeSize = nodeSize;
    this._sizeId = sizeId;
    this._shortSize = nodeSize * SizeList().getShortSum(sizeId);
    this._longSize = nodeSize * SizeList().getLongSum(sizeId);
    this._createSquare().addChildTo(this);
  },

  _createSquare: function() {
    let result = DisplayElement();
    this._createSideTop().addChildTo(result);
    this._createSideRight().addChildTo(result);
    this._createSideBottom().addChildTo(result);
    this._createSideLeft().addChildTo(result);
    return result;
  },

  _createSideTop: function() {
    return Side()
      .createShortSide(this._nodeSize, this._sizeId)
      .setRotation(0)
      .setPosition(0, 0)
      .addChildTo(this);
  },

  _createSideRight: function() {
    return Side()
      .createLongSide(this._nodeSize, this._sizeId)
      .setRotation(90)
      .setPosition(this._shortSize, 0)
      .addChildTo(this);
  },

  _createSideBottom: function() {
    return Side()
      .createShortSide(this._nodeSize, this._sizeId)
      .setRotation(180)
      .setPosition(this._shortSize, this._longSize)
      .addChildTo(this);
  },

  _createSideLeft: function() {
    return Side()
      .createLongSide(this._nodeSize, this._sizeId)
      .setRotation(270)
      .setPosition(0, this._longSize)
      .addChildTo(this);
  }
});


phina.define('Side',{
  superClass: 'DisplayElement',

  NOTE_POS_Y: -39,
  LABEL_POS_Y: -15,

  init: function() {
    this.superInit();
  },

  createShortSide: function(size, sizeId) {
    let arr = SizeList().getShortArr(sizeId);
    this._createSide(size, arr).addChildTo(this);
    return this;
  },

  createLongSide: function(size, sizeId) {
    let arr = SizeList().getLongArr(sizeId);
    this._createSide(size, arr).addChildTo(this);
    return this;
  },

  _createSide: function(size, arr) {
    let result = DisplayElement();
    let note = DisplayElement()
      .setPosition(0, this.NOTE_POS_Y)
      .addChildTo(result);
    let label = DisplayElement()
      .setPosition(0, this.LABEL_POS_Y)
      .addChildTo(result);
    let path = DisplayElement()
      .setPosition(0, 0)
      .addChildTo(result);

    for(let i=0; i<arr.length; i++){
      let startNode = this._calcArraySum(arr, 0, i - 1);

      for(let node=0; node<arr[i]; node++){
        let startX = size*node + size*startNode;
        let endX = size*(node+1) + size*startNode;
        let isNodeEnd = (node == arr[i]-1) ? true : false;
        let ispathEnd = (i == arr.length-1) ? true : false;
        let noteType = arr[i];
        let text = node + 1;

        this._createPath(size, node, startX, endX, isNodeEnd, ispathEnd).addChildTo(path);
        this._createNote(size, startX, noteType, node).addChildTo(note);
        this._createLabel(text, startX).addChildTo(label);
      }
    }
    return result;
  },

   _calcArraySum: function(arr, start, end) {
     //include end index
     let result = 0;
     if(end < 0) return result;
     for(let i=end; i>=start; i--) result += arr[i];
     return result;
   },

   _createPath: function(w, node, startX, endX, isNodeEnd, ispathEnd) {
     let result = DisplayElement();
     let divSmall = 5;
     let divLarge = 8;
     if(isNodeEnd && ispathEnd){
       PathShape({stroke:"#2ca9e1",strokeWidth:2})
         .addPath(endX + (divLarge / 2), -(divLarge / 2))
         .addPath(endX - (divLarge / 2), divLarge / 2)
         .addChildTo(result);
     } else if(isNodeEnd){
       PathShape({stroke:"#2ca9e1",strokeWidth:2})
         .addPath(endX, -(divLarge / 2))
         .addPath(endX, divLarge / 2)
         .addChildTo(result);
     } else {
       PathShape({stroke:"#333",strokeWidth:1})
         .addPath(endX, -(divSmall / 2))
         .addPath(endX, divSmall / 2)
         .addChildTo(result);
     }
     PathShape({stroke:"#000",strokeWidth:2})
       .addPath(startX, 0)
       .addPath(endX, 0)
       .addChildTo(result);
     return result;
   },

  _createNote: function(size, startX, noteType, node) {
    let result = DisplayElement();
    switch(noteType){
      case 5:
        NoteList()
          .getNoteFifth(size, size)[node]
          .setPosition(startX, 0)
          .addChildTo(result);
        break;
      case 7:
        NoteList()
          .getNoteSeventh(size, size)[node]
          .setPosition(startX, 0)
          .addChildTo(result);
        break;
     }
     return result;
   },

   _createLabel: function(text, startX) {
     let result = DisplayElement();
     let color;
     switch(text){
       case 1: color = "#2ca9e1"; break;
       default: color = "#000"; break;
     }
     Label({
       text: text,
       fontSize: 10,
       fill: color
     })
     .setPosition(startX, 0)
     .addChildTo(result);
     return result;
   }
 });


phina.define('SizeList',{
  LIST: [
    {short: [5], long: [7]},
    {short: [7], long: [5, 5]},
    {short: [7, 5], long: [5, 7, 5]},
    {short: [5, 7, 5], long: [7, 5, 7, 5]},
    {short: [5, 7, 5, 7, 5], long: [7, 5, 5, 7, 5, 7, 5]},
    {short: [7, 5, 5, 7, 5, 7, 5], long: [5, 7, 5, 7, 5, 5, 7, 5, 7, 5]}
  ],

  init: function() {},
  getLength: function() { return this.LIST.length; },
  getShortArr: function(i) { return this.LIST[i].short; },
  getLongArr: function(i) { return this.LIST[i].long; },
  getShortSum: function(i) { return this._calcSum(this.LIST[i].short); },
  getLongSum: function(i) { return this._calcSum(this.LIST[i].long); },

  _calcSum: function(arr) {
    return arr.reduce(function(prev, current){
      return prev + current;
    });
  }
});


phina.define('NoteList',{
  COLOR: "#AAA",
  WEIGHT: 2,
  STEM16_HEIGHT: 2.2, // h/n

  init: function() {},

  _createNote0: function(w, h) {
    let result = DisplayElement();
    Path(this.COLOR, this.WEIGHT)
      .addPath(w/2, 0)
      .addPath(0, 0)
      .addPath(0, h)
      .addChildTo(result);
    return result;
  },

  _createNote1: function(w, h) {
    let result = DisplayElement();
    Path(this.COLOR, this.WEIGHT)
      .addPath(-w/2, 0)
      .addPath(w/2, 0)
      .addChildTo(result);
    return result;
  },

  _createNote2: function(w, h) {
    let result = DisplayElement();
    Path(this.COLOR, this.WEIGHT)
      .addPath(0, 0)
      .addPath(0, h)
      .addChildTo(result);
    Path(this.COLOR, this.WEIGHT)
      .addPath(-w/2, 0)
      .addPath(w/2, 0)
      .addChildTo(result);
    Path(this.COLOR, this.WEIGHT)
      .addPath(-w/2, h/this.STEM16_HEIGHT)
      .addPath(0, h/this.STEM16_HEIGHT)
      .addChildTo(result);
    return result;
  },

  _createNote3: function(w, h) {
    let result = DisplayElement();
    Path(this.COLOR, this.WEIGHT)
      .addPath(-w/2, 0)
      .addPath(0, 0)
      .addPath(0, h)
      .addChildTo(result);
    return result;
  },

  _createNote4: function(w, h) {
    let result = DisplayElement();
    Path(this.COLOR, this.WEIGHT)
      .addChildTo(result);
    return result;
  },

  _createNote5: function(w, h) {
    let result = DisplayElement();
    Path(this.COLOR, this.WEIGHT)
      .addPath(-w/2, 0)
      .addPath(w/2, 0)
      .addChildTo(result);
    Path(this.COLOR, this.WEIGHT)
      .addPath(0, 0)
      .addPath(0, h)
      .addChildTo(result);
    return result;
  },

  _createNote6: function(w, h) {
    let result = DisplayElement();
    Path(this.COLOR, this.WEIGHT)
      .addPath(0, 0)
      .addPath(0, h)
      .addChildTo(result);
    Path(this.COLOR, this.WEIGHT)
      .addPath(-w/2, 0)
      .addPath(0, 0)
      .addChildTo(result);
    Path(this.COLOR, this.WEIGHT)
      .addPath(-w/2, h/this.STEM16_HEIGHT)
      .addPath(0, h/this.STEM16_HEIGHT)
      .addChildTo(result);
    return result;
  },

  getNoteFifth: function(w, h) {
    return [
      this._createNote0(w, h),
      this._createNote1(w, h),
      this._createNote2(w, h),
      this._createNote3(w, h),
      this._createNote4(w, h)
    ];
  },

  getNoteSeventh: function(w, h) {
    return [
      this._createNote0(w, h),
      this._createNote1(w, h),
      this._createNote5(w, h),
      this._createNote1(w, h),
      this._createNote5(w, h),
      this._createNote1(w, h),
      this._createNote6(w, h)
    ];
  }
});


phina.define('Path',{
  superClass: 'PathShape',

  init: function(color, width){
    this.superInit({
      stroke: color || "#000",
      strokeWidth: width || 1
    });
  }
});


phina.define('Pointer',{
  superClass: 'CircleShape',

  pos: Vector2(0, 0),
  moveSpeed: 0,
  moveDir: ["RIGHT", "DOWN", "LEFT", "UP"],
  moveDirIndex: 0,

  init: function(nodeSize, sizeId) {
    this.superInit({
      radius: 5,
      fill: "#CC0000",
      stroke: null
    });
    this.setOrigin(0.5, 0.5);
    this._nodeSize = nodeSize;
    this._sizeId = sizeId;
  },

  //@orverride
  setPosition: function(posX, posY, squareUnitLength) {
    this.pos.set(posX, posY);
    this.x = posX * squareUnitLength;
    this.y = posY * squareUnitLength;
    return this;
  },

  setMoveSpeed: function(moveSpeed) {
    this.moveSpeed = moveSpeed;
    return this;
  },

  setSquareInstance: function(squareInstance) {
    this.square = squareInstance;
    return this;
  },

  moveStart: function() {
    let nextX = this.x;
    let nextY = this.y;
    switch(this.moveDir[this.moveDirIndex%this.moveDir.length]){
      case "RIGHT": nextX += this._nodeSize; break;
      case "DOWN": nextY += this._nodeSize; break;
      case "LEFT": nextX -= this._nodeSize; break;
      case "UP": nextY -= this._nodeSize; break;
    }

    this._moveCore(nextX, nextY, this.moveDir[this.moveDirIndex%this.moveDir.length]);
  },

  _moveCore: function(nextX, nextY, dir) {
    this.tweener
      .to({
        x: nextX,
        y: nextY,
      }, this.moveSpeed)
      .call(function(){
        this.pos.add(Vector2[dir]);
        this._isPossibleGoStraight(dir);
      }.bind(this));
  },

  _isPossibleGoStraight: function(dir) {
    let a, b;
    switch(dir){
      case "RIGHT": a = this.pos.x; b = SizeList().getShortSum(this._sizeId); break;
      case "DOWN": a = this.pos.y; b = SizeList().getLongSum(this._sizeId); break;
      case "LEFT": a = this.pos.x; b = 0; break;
      case "UP": a = this.pos.y; b = 0; break;
    }
    if(a == b) this.moveDirIndex += 1;
    this.moveStart();
  }
});





 phina.define('Labels',{
   superClass: 'DisplayElement',

   init: function(shortSum, longSum) {
     this.superInit();

     Label({
       text: shortSum + " : " + longSum,
       fontSize: 26
     })
     .setPosition(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 - 100)
     .addChildTo(this);

     Label({
       text: "1 : " + longSum / shortSum,
       fontSize: 18
     })
     .setPosition(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 + 30 - 95)
     .addChildTo(this);

     Label({
       text: "√2 = " + Math.sqrt(2),
       fontSize: 18
     })
     .setPosition(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 + 80 - 90)
     .addChildTo(this);

     Label({
       text: "diff = " + Math.abs(Math.sqrt(2) - longSum / shortSum),
       fontSize: 18
     })
     .setPosition(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 + 110 - 88)
     .addChildTo(this);
   }
 });


 phina.main(function() {
   let app = GameApp({
     startLabel: 'main',
     width: SCREEN_WIDTH,
     height: SCREEN_HEIGHT,
   });
   app.run();
 });
