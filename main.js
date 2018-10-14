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

phina.main(function() {
  let app = GameApp({
    startLabel: 'main',
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  });
  app.run();
});


phina.define('MainScene',{
  superClass: 'DisplayScene',

  init: function() {
    this.superInit({
      backgroundColor: BACKGROUND_COLOR
    });

    let sizeNum = 5;
    let w = 10;
    let h = 10;
    let marginTop = (SCREEN_WIDTH - (SizeList().getShortSum(5) * w)) / 2;
    let marginLeft = (SCREEN_WIDTH - (SizeList().getShortSum(5) * w)) / 2;
    let shortSum = SizeList().getShortSum(sizeNum);
    let longSum = SizeList().getLongSum(sizeNum);
    let shortSize = w * shortSum;
    let longSize = h * longSum;
    let side1 = Side(w, h, "s", sizeNum)
      .setRotation(0)
      .setPosition(marginLeft, marginTop)
      .addChildTo(this);
    let side2 = Side(w, h, "l", sizeNum)
      .setRotation(90)
      .setPosition(marginLeft + shortSize, marginTop)
      .addChildTo(this);
    let side3 = Side(w, h, "s", sizeNum)
      .setRotation(180)
      .setPosition(marginLeft + shortSize, marginTop + longSize)
      .addChildTo(this);
    let side4 = Side(w, h, "l", sizeNum)
      .setRotation(270)
      .setPosition(marginLeft, marginTop + longSize)
      .addChildTo(this);

    let square = RectangleShape({
      width: shortSize,
      height: longSize,
      stroke: null,
      fill: null
    })
    .setPosition(marginLeft, marginTop)
    .addChildTo(this);

    let speed = 165;
    let pointer = Pointer()
      .setPosition(0, 0, w)
      .setMoveSpeed(speed)
      .setSquareInstance(square)
      .addChildTo(square);

    pointer.moveStart();

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
  },
});


phina.define('SizeList',{

  LIST: [
    {
      short: {arr: [5], sum: 5},
      long: {arr: [7], sum: 7}
    },
    {
      short: {arr: [7], sum: 7},
      long: {arr: [5, 5], sum: 10}
    },
    {
      short: {arr: [7, 5], sum: 12},
      long: {arr: [5, 7, 5], sum: 17}
    },
    {
      short: {arr: [5, 7, 5], sum: 17},
      long: {arr: [7, 5, 7, 5], sum: 24}
    },
    {
      short: {arr: [5, 7, 5, 7, 5], sum: 29},
      long: {arr: [7, 5, 5, 7, 5, 7, 5], sum: 41}
    },
    {
      short: {arr: [7, 5, 5, 7, 5, 7, 5], sum: 41},
      long: {arr: [5, 7, 5, 7, 5, 5, 7, 5, 7, 5], sum: 58}
    }
  ],

  init: function() {
    //private
  },

  getLength: function() {
    return this.LIST.length;
  },

  getShortArr: function(i) {
    return this.LIST[i].short.arr;
  },

  getLongArr: function(i) {
    return this.LIST[i].long.arr;
  },

  getShortSum: function(i) {
    return this.LIST[i].short.sum;
  },

  getLongSum: function(i) {
    return this.LIST[i].long.sum;
  }
});


phina.define('NoteList',{

  init: function(w, h) {
    //private
  },

  _createNote0: function(w, h) {
    let result = DisplayElement();
    PathShape({stroke:"#AAA",strokeWidth:2}).addPath(w/2, 0).addPath(0, 0).addPath(0, h).addChildTo(result);
    return result;
  },

  _createNote1: function(w, h) {
    let result = DisplayElement();
    PathShape({stroke:"#AAA",strokeWidth:2}).addPath(-w/2, 0).addPath(w/2, 0).addChildTo(result);
    return result;
  },

  _createNote2: function(w, h) {
    let result = DisplayElement();
    PathShape({stroke:"#AAA",strokeWidth:2}).addPath(0, 0).addPath(0, h).addChildTo(result);
    PathShape({stroke:"#AAA",strokeWidth:2}).addPath(-w/2, 0).addPath(w/2, 0).addChildTo(result);
    PathShape({stroke:"#AAA",strokeWidth:2}).addPath(-w/2, h/2.2).addPath(0, h/2.2).addChildTo(result);
    return result;
  },

  _createNote3: function(w, h) {
    let result = DisplayElement();
    PathShape({stroke:"#AAA",strokeWidth:2}).addPath(-w/2, 0).addPath(0, 0).addPath(0, h).addChildTo(result);
    return result;
  },

  _createNote4: function(w, h) {
    let result = DisplayElement();
    PathShape({stroke:"#AAA",strokeWidth:2}).addChildTo(result);
    return result;
  },

  _createNote5: function(w, h) {
    let result = DisplayElement();
    PathShape({stroke:"#AAA",strokeWidth:2}).addPath(-w/2, 0).addPath(w/2, 0).addChildTo(result);
    PathShape({stroke:"#AAA",strokeWidth:2}).addPath(0, 0).addPath(0, h).addChildTo(result);
    return result;
  },

  _createNote6: function(w, h) {
    let result = DisplayElement();
    PathShape({stroke:"#AAA",strokeWidth:2}).addPath(0, 0).addPath(0, h).addChildTo(result);
    PathShape({stroke:"#AAA",strokeWidth:2}).addPath(-w/2, 0).addPath(0, 0).addChildTo(result);
    PathShape({stroke:"#AAA",strokeWidth:2}).addPath(-w/2, h/2.2).addPath(0, h/2.2).addChildTo(result);
    return result;
  },

  getNoteFifth: function(w, h) {
    let note0 = this._createNote0(w, h);
    let note1 = this._createNote1(w, h);
    let note2 = this._createNote2(w, h);
    let note3 = this._createNote3(w, h);
    let note4 = this._createNote4(w, h);
    return [note0, note1, note2, note3, note4];
  },

  getNoteSeventh: function(w, h) {
    let note0 = this._createNote0(w, h);
    let note1 = this._createNote1(w, h);
    let note5 = this._createNote5(w, h);
    let note6 = this._createNote6(w, h);
    return [note0, note1, note5, note1, note5, note1, note6];
  }
});


phina.define('Side',{
  superClass: 'DisplayElement',

  init: function(w, h, type, sizeNum) {
    this.superInit();
    let arr;
    switch(type){
      case "s":
        arr = SizeList().getShortArr(sizeNum);
        break;
      case "l":
        arr = SizeList().getLongArr(sizeNum);
        break;
    }
    this._createSide(w, h, arr).addChildTo(this);
  },

  _createSide: function(w, h, arr) {
    let result = DisplayElement();
    let note = DisplayElement().setPosition(0, -39).addChildTo(result);
    let label = DisplayElement().setPosition(0, -15).addChildTo(result);
    let path = DisplayElement().setPosition(0, 0).addChildTo(result);
    for(let i=0; i<arr.length; i++){
      let startNode = this._calcArraySum(arr, 0, i - 1);
      for(let node=0; node<arr[i]; node++){

        let startPos = Vector2((w * node) + (w * startNode), 0);
        let endPos = Vector2((w * (node + 1)) + (w * startNode), 0);
        let nodeEndBoo = (node == arr[i] - 1) ? true : false;
        let pathEndBoo = (i == arr.length - 1) ? true : false;
        let noteType = arr[i];
        let text = node + 1;

        this._createPath(w, node, startPos, endPos, nodeEndBoo, pathEndBoo).addChildTo(path);
        this._createNote(w, h, startPos, noteType, node).addChildTo(note);
        this._createLabel(text, startPos).addChildTo(label);
      }
    }
    return result;
  },

  _calcArraySum: function(arr, start, end) {
    //include end index
    let result = 0;
    if(end < 0) return result;
    for(let i=end; i>=start; i--){
      result += arr[i];
    }
    return result;
  },

  _createPath: function(w, node, startPos, endPos, nodeEndBoo, pathEndBoo) {
    let result = DisplayElement();
    let divSmall = 5;
    let divLarge = 8;
    if(nodeEndBoo && pathEndBoo){
      PathShape({stroke:"#2ca9e1",strokeWidth:2}).addPath(endPos.x + (divLarge / 2), endPos.y - (divLarge / 2)).addPath(endPos.x - (divLarge / 2), endPos.y + (divLarge / 2)).addChildTo(result);
    } else if(nodeEndBoo){
      PathShape({stroke:"#2ca9e1",strokeWidth:2}).addPath(endPos.x, endPos.y - (divLarge / 2)).addPath(endPos.x, endPos.y + (divLarge / 2)).addChildTo(result);
    } else {
      PathShape({stroke:"#333",strokeWidth:1}).addPath(endPos.x, endPos.y - (divSmall / 2)).addPath(endPos.x, endPos.y + (divSmall / 2)).addChildTo(result);
    }
    PathShape({stroke:"#000",strokeWidth:2}).addPath(startPos.x, startPos.y).addPath(endPos.x, endPos.y).addChildTo(result);
    return result;
  },

  _createNote: function(w, h, startPos, noteType, node) {
    let result = DisplayElement();
    switch(noteType){
      case 5:
        NoteList({stroke:"#000",strokeWidth:1}).getNoteFifth(w, h)[node].setPosition(startPos.x, startPos.y).addChildTo(result);
        break;
      case 7:
        NoteList({stroke:"#000",strokeWidth:1}).getNoteSeventh(w, h)[node].setPosition(startPos.x, startPos.y).addChildTo(result);
        break;
    }
    return result;
  },

  _createLabel: function(text, startPos) {
    let result = DisplayElement();
    let color;
    switch(text){
      case 1:
        color = "#2ca9e1";
        break;
      default:
        color = "#000";
        break;
    }
    Label({
      text: text,
      fontSize: 2,
      fill: color
    })
    .setPosition(startPos.x, startPos.y)
    .addChildTo(result);
    return result;
  }
});


phina.define('Pointer',{
  superClass: 'CircleShape',

  pos: Vector2(0, 0),
  moveSpeed: 0,
  moveDir: ["RIGHT", "DOWN", "LEFT", "UP"],
  moveDirIndex: 0,

  init: function() {
    this.superInit({
      radius: 5,
      fill: "#2ca9e1",
      stroke: null
    });
    this.setOrigin(0.5, 0.5);
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
      case "RIGHT":
        nextX += 10;
        break;
      case "DOWN":
        nextY += 10;
        break;
      case "LEFT":
        nextX -= 10;
        break;
      case "UP":
        nextY -= 10;
        break;
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
      case "RIGHT":
        a = this.pos.x;
        b = 41;
        break;
      case "DOWN":
        a = this.pos.y;
        b = 58;
        break;
      case "LEFT":
        a = this.pos.x;
        b = 0;
        break;
      case "UP":
        a = this.pos.y;
        b = 0;
        break;
    }
    if(a == b) this.moveDirIndex += 1;
    this.moveStart();
  }
});
