//
//
// main.js
// 2018 @auther Taku Oshiba
// This Program is MIT license.
//
//
phina.globalize();

SCREEN_WIDTH = 960;
SCREEN_HEIGHT = 920;
BACKGROUND_COLOR = "#333";


phina.define('MainScene',{
  superClass: 'DisplayScene',

  NODE_SIZE: 14,
  LAYOUT_ID: 0,
  MOVE_SPEED: 165, //165

  init: function(option) {
    this.superInit(option);
    this.backgroundColor = BACKGROUND_COLOR;
    let marginTop = (SCREEN_WIDTH - (Layout().getLongSidelength(Layout().getListLength() - 1) * this.NODE_SIZE)) / 2;
    let marginLeft = (SCREEN_WIDTH - (Layout().getLongSidelength(Layout().getListLength() - 1) * this.NODE_SIZE)) / 2;

    this.labels = Labels(this.LAYOUT_ID)
      .setPosition(SCREEN_WIDTH/2, SCREEN_HEIGHT-60)
      .addChildTo(this);
    this.square = Square(this.NODE_SIZE, this.LAYOUT_ID)
      .setPosition(marginTop, marginLeft) //暫定位置
      .addChildTo(this);
    this.ball = Ball(this.NODE_SIZE, this.LAYOUT_ID, this.square, this.labels)
      .setPosition(marginTop, marginLeft) //暫定位置
      .setMoveSpeed(this.MOVE_SPEED)
      .addChildTo(this)
      .moveStart();
  },
});


phina.define('Square',{
  superClass: 'DisplayElement',

  _nodeSize: 0,
  _nodeList: [],
  _musicNoteList: [],
  NOTE_POS_Y: -39,
  LABEL_POS_Y: -15,

  init: function(nodeSize, layoutId) {
    this.superInit();
    this.renew(nodeSize, layoutId);
  },

  renew: function(nodeSize, layoutId) {
    this.children.clear();
    this._nodeList = [];
    this._musicNoteList = [];
    this._nodeSize = nodeSize;

    //layoutList: {top:[5or7, ..], right:[], bottom:[], left:[]}
    let layoutList = this._calcLayoutList(layoutId);


    //超暫定
    let horiLength, vertLength;
    switch(layoutId) {
      case 0:
        horiLength = 1;
        vertLength = 1;
        break;
      case 1:
        horiLength = 2;
        vertLength = 1;
        break;
      case 2:
        horiLength = 2;
        vertLength = 2;
        break;
      case 3:
        horiLength = 4;
        vertLength = 2;
        break;
      case 4:
        horiLength = 4;
        vertLength = 4;
        break;
      case 5:
        horiLength = 8;
        vertLength = 4;
        break;
    }
    for(let x=0; x<horiLength; x++){
      for(let y=0; y<vertLength; y++){
        let w = Layout().getHorizontalSideLength(layoutId) * this._nodeSize / horiLength;
        let h = Layout().getVerticalSideLength(layoutId) * this._nodeSize / vertLength;
        if((y%2 == 0 && x%2 != 0) || (y%2 !=0 && x%2 == 0)){
          RectangleShape({
            width: w,
            height: h,
            padding: 0,
            stroke: null,
            fill: "#3c3c3c"
          })
          .setOrigin(0, 0)
          .setPosition(w*x, h*y)
          .addChildTo(this);
        }
      }
    }


    Object.keys(layoutList).forEach(function(key){
      let p = this._calcSidePosition(key, layoutList);
      let r = this._calcSideRotation(key);
      this._createSide(layoutList[key])
        .setPosition(p.x, p.y)
        .setRotation(r)
        .addChildTo(this);
    }.bind(this));
  },

  _calcLayoutList: function(layoutId) {
    let horiArr
    let vertArr;
    switch(Layout().getSquareDirection(layoutId)){
      case "PORTRAIT":
        horiArr = Layout().getShortLayoutList(layoutId); //[5or7, ...]
        vertArr = Layout().getLongLayoutList(layoutId);
        break;
      case "LANDSCAPE":
        horiArr = Layout().getLongLayoutList(layoutId);
        vertArr = Layout().getShortLayoutList(layoutId);
        break;
    }
    return {top: horiArr, right: vertArr, bottom: horiArr, left: vertArr};
  },

  _calcSidePosition: function(key, layoutList) {
    let xMax = this._nodeSize * layoutList.top.reduce((prev,current)=>prev+current);
    let yMax = this._nodeSize * layoutList.right.reduce((prev,current)=>prev+current);
    switch(key){
      case "top":
        return Vector2(0, 0);
        break;
      case "right":
        return Vector2(xMax, 0);
        break;
      case "bottom":
        return Vector2(xMax, yMax);
        break;
      case "left":
        return Vector2(0, yMax);
        break;
    }
  },

  _calcSideRotation: function(key) {
    switch(key){
      case "top": return 0; break;
      case "right": return 90; break;
      case "bottom": return 180; break;
      case "left": return 270; break;
    }
  },

  _createSide: function(sideLayout) {
    let side = DisplayElement();
    for(let i=0; i<sideLayout.length; i++){
      let blockSize = sideLayout[i];
      let isLastOfSide = this._calcIsLastOfSide(i, sideLayout.length);
      let p = this._calcBlockPosition(sideLayout, i);
      this._createBlock(blockSize, isLastOfSide)
        .setPosition(p.x, p.y)
        .addChildTo(side);
    };
    return side;
  },

  _calcIsLastOfSide: function(i, sideLayoutLength) {
    if(i == sideLayoutLength - 1) return true;
    return false;
  },

  _calcBlockPosition: function(sideLayout, i) {
    return Vector2(this._nodeSize * this._calcArraySum(sideLayout, 0, i-1), 0);
  },

  _calcArraySum: function(arr, start, end) {
    //include end
    let result = 0;
    for(let i=start; i<=end; i++) {
      result += arr[i];
    }
    return result;
  },

  _createBlock: function(blockSize, isLastOfSide) {
    let block = DisplayElement();
    for(i=0; i<blockSize; i++) {
      let isFirstOfBlock = this._calcIsFirstOfBlock(i);
      let isLastOfBlock = this._calcIsLastOfBlock(i, blockSize);
      if(isFirstOfBlock) {
        let musicNote = this._createMusicalNote(blockSize)
          .setPosition(0, this.NOTE_POS_Y)
          .addChildTo(block);
        this._musicNoteList.push(musicNote);
      }
      let musicNodeIndex = this._musicNoteList.length - 1;
      this._createNode(isLastOfSide, isLastOfBlock, isFirstOfBlock, i, musicNodeIndex)
        .setPosition(this._nodeSize * i, 0)
        .addChildTo(block);
    }
    return block;
  },

  _calcIsFirstOfBlock: function(i) {
    return i == 0;
  },

  _calcIsLastOfBlock: function(i, blockSize) {
    if(i == blockSize - 1) return true;
    return false;
  },

  _createMusicalNote: function(blockSize) {
    switch(blockSize) {
      case 5:
        return MusicalNote().getNoteFifth(this._nodeSize, this._nodeSize);
        break;
      case 7:
        return MusicalNote().getNoteSeventh(this._nodeSize, this._nodeSize);
        break;
    }
  },

  _createNode: function(isLastOfSide, isLastOfBlock, isFirstOfBlock, index, musicNodeIndex) {
    //index: 0 ~ 4or6
    let node = DisplayElement();
    this._createLine().addChildTo(node);
    this._createDivision(isLastOfSide, isLastOfBlock).addChildTo(node);
    node.nodeNum = this._createNumberLabel(index)
      .setPosition(0, this.LABEL_POS_Y)
      .addChildTo(node);
    node.isLastOfSide = isLastOfSide && isLastOfBlock;
    node.musicNodeIndex = musicNodeIndex;
    node.isFirstOfBlock = isFirstOfBlock;
    this._nodeList.push(node);
    return node;
  },

  _createLine: function() {
    return PathShape({stroke:"#FFF",strokeWidth:2})
      .addPath(0, 0)
      .addPath(this._nodeSize, 0);
  },

  _createDivision: function(isLastOfSide, isLastOfBlock) {
    let SMALL_DIV_SIZE = 10;
    let LARGE_DIV_SIZE = 15;
    let divSize = SMALL_DIV_SIZE;
    let color = "#AAA";
    let width = 1;
    if(isLastOfBlock){
      divSize = LARGE_DIV_SIZE;
      //color = "#2ca9e1";
      width = 2;
    }
    if(isLastOfSide && isLastOfBlock){
      return PathShape({stroke:"#AAA",strokeWidth:2})
        .addPath(this._nodeSize + divSize/2, -divSize/2)
        .addPath(this._nodeSize - divSize/2, divSize/2)
    } else {
      return PathShape({stroke:color,strokeWidth:width})
        .addPath(this._nodeSize, -divSize/2)
        .addPath(this._nodeSize, divSize/2)
    }
  },

  _createNumberLabel: function(index) {
    return Label({
      text: index + 1,
      fill: "#AAA",
      fontSize: 10
    });
  },

  getNodeLength: function() {
    return this._nodeList.length;
  },

  getIsLastOfSide: function(nodeIndex) {
    return this._nodeList[nodeIndex].isLastOfSide;
  },

  getNodeIsFirstOfBlock: function(nodeIndex) {
    return this._nodeList[nodeIndex].isFirstOfBlock;
  },

  highlight: function(nodeIndex) {
    let HIGHLIGHT_COLOR = "#EEE"

    this._nodeList[nodeIndex].nodeNum.fill = HIGHLIGHT_COLOR;
    if(nodeIndex != 0) {
      this._nodeList[nodeIndex - 1].nodeNum.fill = "#AAA";
    }

    let musicNodeIndex = this._nodeList[nodeIndex].musicNodeIndex;
    let musicNoteGroup = this._musicNoteList[musicNodeIndex];
    for(let i=0; i<musicNoteGroup.children.length; i++){
      for(let j=0; j<musicNoteGroup.children[i].children.length; j++){
        musicNoteGroup.children[i].children[j].stroke = HIGHLIGHT_COLOR;
      }
    }
    if(musicNodeIndex != 0) {
      let prevMusicNoteGroup = this._musicNoteList[musicNodeIndex - 1];
      for(let k=0; k<prevMusicNoteGroup.children.length; k++){
        for(let l=0; l<prevMusicNoteGroup.children[k].children.length; l++){
          prevMusicNoteGroup.children[k].children[l].stroke = "#AAA";
        }
      }
    }
  }
});


phina.define('Layout',{
  LIST: [
    {short: [5], long: [7], dir: "PORTRAIT"},
    {short: [7], long: [5, 5], dir: "LANDSCAPE"},
    {short: [7, 5], long: [5, 7, 5], dir: "PORTRAIT"},
    {short: [5, 7, 5], long: [7, 5, 7, 5], dir: "LANDSCAPE"},
    {short: [5, 7, 5, 7, 5], long: [7, 5, 5, 7, 5, 7, 5], dir: "PORTRAIT"},
    {short: [7, 5, 5, 7, 5, 7, 5], long: [5, 7, 5, 7, 5, 5, 7, 5, 7, 5], dir: "LANDSCAPE"}
  ],

  init: function() {
    //private
  },

  getSquareDirection: function(id) {
    return this.LIST[id].dir;
  },

  getShortLayoutList: function(id) {
    return this.LIST[id].short;
  },

  getLongLayoutList: function(id) {
    return this.LIST[id].long;
  },

  getShortSidelength: function(id) {
    return this.LIST[id].short.reduce((prev, current)=>prev+current);
  },

  getLongSidelength: function(id) {
    return this.LIST[id].long.reduce((prev, current)=>prev+current);
  },

  getNextLayoutId: function(currentId) {
    return (currentId + 1) % this.LIST.length;
  },

  getListLength: function() {
    return this.LIST.length;
  },

  getHorizontalSideLength: function(id) {
    switch(this.LIST[id].dir){
      case "PORTRAIT":
        return this.getShortSidelength(id);
      case "LANDSCAPE":
        return this.getLongSidelength(id);
    }
  },

  getVerticalSideLength: function(id) {
    switch(this.LIST[id].dir){
      case "PORTRAIT":
        return this.getLongSidelength(id);
      case "LANDSCAPE":
        return this.getShortSidelength(id);
    }
  }
});


phina.define('MusicalNote',{
  COLOR: "#AAA",
  WEIGHT: 2,
  STEM16_HEIGHT: 2.2, // height / n

  init: function() {
    //private
  },

  _createNote0: function(w, h) {
    let result = DisplayElement();
    PathShape({stroke:this.COLOR, strokeWidth:this.WEIGHT})
      .addPath(w/2, 0)
      .addPath(0, 0)
      .addPath(0, h)
      .addChildTo(result);
    return result;
  },

  _createNote1: function(w, h) {
    let result = DisplayElement();
    PathShape({stroke:this.COLOR, strokeWidth:this.WEIGHT})
      .addPath(-w/2, 0)
      .addPath(w/2, 0)
      .addChildTo(result);
    return result;
  },

  _createNote2: function(w, h) {
    let result = DisplayElement();
    PathShape({stroke:this.COLOR, strokeWidth:this.WEIGHT})
      .addPath(0, 0)
      .addPath(0, h)
      .addChildTo(result);
    PathShape({stroke:this.COLOR, strokeWidth:this.WEIGHT})
      .addPath(-w/2, 0)
      .addPath(w/2, 0)
      .addChildTo(result);
    PathShape({stroke:this.COLOR, strokeWidth:this.WEIGHT})
      .addPath(-w/2, h/this.STEM16_HEIGHT)
      .addPath(0, h/this.STEM16_HEIGHT)
      .addChildTo(result);
    return result;
  },

  _createNote3: function(w, h) {
    let result = DisplayElement();
    PathShape({stroke:this.COLOR, strokeWidth:this.WEIGHT})
      .addPath(-w/2, 0)
      .addPath(0, 0)
      .addPath(0, h)
      .addChildTo(result);
    return result;
  },

  _createNote4: function(w, h) {
    let result = DisplayElement();
    PathShape({stroke:this.COLOR, strokeWidth:this.WEIGHT})
      .addChildTo(result);
    return result;
  },

  _createNote5: function(w, h) {
    let result = DisplayElement();
    PathShape({stroke:this.COLOR, strokeWidth:this.WEIGHT})
      .addPath(-w/2, 0)
      .addPath(w/2, 0)
      .addChildTo(result);
    PathShape({stroke:this.COLOR, strokeWidth:this.WEIGHT})
      .addPath(0, 0)
      .addPath(0, h)
      .addChildTo(result);
    return result;
  },

  _createNote6: function(w, h) {
    let result = DisplayElement();
    PathShape({stroke:this.COLOR, strokeWidth:this.WEIGHT})
      .addPath(0, 0)
      .addPath(0, h)
      .addChildTo(result);
    PathShape({stroke:this.COLOR, strokeWidth:this.WEIGHT})
      .addPath(-w/2, 0)
      .addPath(0, 0)
      .addChildTo(result);
    PathShape({stroke:this.COLOR, strokeWidth:this.WEIGHT})
      .addPath(-w/2, h/this.STEM16_HEIGHT)
      .addPath(0, h/this.STEM16_HEIGHT)
      .addChildTo(result);
    return result;
  },

  getNoteFifth: function(w, h) {
    let result = DisplayElement();
    this._createNote0(w, h).setPosition(w*0, 0).addChildTo(result);
    this._createNote1(w, h).setPosition(w*1, 0).addChildTo(result);
    this._createNote2(w, h).setPosition(w*2, 0).addChildTo(result);
    this._createNote3(w, h).setPosition(w*3, 0).addChildTo(result);
    this._createNote4(w, h).setPosition(w*4, 0).addChildTo(result);
    return result;
  },

  getNoteSeventh: function(w, h) {
    let result = DisplayElement();
    this._createNote0(w, h).setPosition(w*0, 0).addChildTo(result);
    this._createNote1(w, h).setPosition(w*1, 0).addChildTo(result);
    this._createNote5(w, h).setPosition(w*2, 0).addChildTo(result);
    this._createNote1(w, h).setPosition(w*3, 0).addChildTo(result);
    this._createNote5(w, h).setPosition(w*4, 0).addChildTo(result);
    this._createNote1(w, h).setPosition(w*5, 0).addChildTo(result);
    this._createNote6(w, h).setPosition(w*6, 0).addChildTo(result);
    return result;
  }
});


phina.define('Ball',{
  superClass: 'CircleShape',

  pos: Vector2(0, 0),
  moveSpeed: 0,
  moveDir: ["RIGHT", "DOWN", "LEFT", "UP"],
  moveDirCount: 0,
  moveNodeCount: 0,
  currentNode: 0,

  init: function(nodeSize, layoutId, square, labels) {
    this.superInit({
      radius: 5,
      fill: "#333300",
      stroke: null
    });
    this.setOrigin(0.5, 0.5);
    this._nodeSize = nodeSize;
    this.layoutId = layoutId;
    this._square = square;
    this.labels = labels;
  },

  setMoveSpeed: function(moveSpeed) {
    this.moveSpeed = moveSpeed;
    return this;
  },

  moveStart: function() {
    let squareNodeLength = this._square.getNodeLength();
    let nextX = this.x;
    let nextY = this.y;
    let dir = this.moveDir[this.moveDirCount % this.moveDir.length];
    switch(dir){
      case "RIGHT": nextX += this._nodeSize; break;
      case "DOWN": nextY += this._nodeSize; break;
      case "LEFT": nextX -= this._nodeSize; break;
      case "UP": nextY -= this._nodeSize; break;
    }

    let nodeIsFirstOfBlock = this._square.getNodeIsFirstOfBlock(this.currentNode);
    if(nodeIsFirstOfBlock){
      this.fill = "#FFFF00";
    } else {
      this.fill = "#777700";
    }
    this._square.highlight(this.currentNode);

    this._moveCore(nextX, nextY, dir, squareNodeLength);
  },

  _moveCore: function(nextX, nextY, dir, squareNodeLength) {
    this.tweener
      .to({
        x: nextX,
        y: nextY,
      }, this.moveSpeed)
      .call(function(){
        this.pos.add(Vector2[dir]);
        this._isPossibleGoStraight(squareNodeLength);

        if(this.currentNode == squareNodeLength - 1){
          this.layoutId = Layout().getNextLayoutId(this.layoutId);
          this._square.renew(this._nodeSize, this.layoutId);
          this.labels.updateLabels(this.layoutId);
          this.currentNode = 0;
          this.moveNodeCount = 0;
        } else {
          this.moveNodeCount++;
          this.currentNode = this.moveNodeCount % squareNodeLength;
        }
        this.moveStart();
      }.bind(this));
  },

  _isPossibleGoStraight: function(squareNodeLength) {
    if(this._square.getIsLastOfSide(this.currentNode)) this._turn();
  },

  _turn: function(){
    this.moveDirCount += 1;
  }
});


phina.define('Labels',{
  superClass: 'DisplayElement',

  init: function(layoutId) {
    this.superInit();

    this.mainLabel = Label({
      fontSize: 45,
      fill: "#FFF"
    })
    .setPosition(0, -113) //暫定位置
    .addChildTo(this);

    this.ratioLabel = Label({
      fontSize: 18,
      fill: "#AAA"
    })
    .setPosition(0, -65) //暫定位置
    .addChildTo(this);

    this.sqrtLabel = Label({
      fontSize: 18,
      fill: "#AAA"
    })
    .setPosition(0, -20) //暫定位置
    .addChildTo(this);

    this.diffLabel = Label({
      fontSize: 18,
      fill: "#AAA"
    })
    .setPosition(0, 12) //暫定位置
    .addChildTo(this);

    this.updateLabels(layoutId);
  },

  updateLabels: function(layoutId) {
    let shortSideSum = Layout().getShortSidelength(layoutId);
    let longSideSum = Layout().getLongSidelength(layoutId);
    this.mainLabel.text = shortSideSum + " : " + longSideSum;
    this.ratioLabel.text = "1 : " + longSideSum / shortSideSum;
    this.sqrtLabel.text = "√2 = " + Math.sqrt(2);
    this.diffLabel.text = "diff = " + Math.abs(Math.sqrt(2) - longSideSum / shortSideSum);
  },
});


phina.main(function() {
  let app = GameApp({
    startLabel: 'main',
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  });
  app.run();
});
