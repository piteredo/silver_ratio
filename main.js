//
//
// main.js
// 2018 @auther Taku Oshiba
// This Program is MIT license.
//
//
phina.globalize();

SCREEN_WIDTH = 1024;
SCREEN_HEIGHT = 768;
BACKGROUND_COLOR = "#333";
BPM = 390; //16note


phina.define('MainScene',{
  superClass: 'DisplayScene',

  NODE_SIZE: 14,
  LAYOUT_ID: 0,
  MOVE_SPEED: 1000 * 60 / BPM,

  init: function(option) {
    this.superInit(option);
    this.backgroundColor = BACKGROUND_COLOR;
    let marginLeft = (SCREEN_WIDTH - (Layout().getLongSidelength(Layout().getListLength() - 1) * this.NODE_SIZE)) / 2;
    let marginTop = 55;

    let stage = DisplayElement()
      .setOrigin(0, 0)
      .setPosition(marginLeft, marginTop) //暫定位置
      .addChildTo(this);

    this.labels = Labels(this.LAYOUT_ID)
      .setPosition(SCREEN_WIDTH/2, SCREEN_HEIGHT)
      .addChildTo(this);
    this.square = Square(this.NODE_SIZE, this.LAYOUT_ID)
      .addChildTo(stage);
    this.turnLengthLabel = TurnLengthLabel(this.NODE_SIZE, this.LAYOUT_ID)
      .addChildTo(stage);
    this.ball = Ball(this.NODE_SIZE, this.LAYOUT_ID, this.square, this.labels, this.turnLengthLabel)
      .setMoveSpeed(this.MOVE_SPEED)
      .addChildTo(stage)
      .appStart(0);
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
    this.renew(nodeSize, layoutId, false);
  },

  renew: function(nodeSize, layoutId, isLastTurn) {
    this.children.clear();
    this._nodeList = [];
    this._musicNoteList = [];
    this._nodeSize = nodeSize;

    //layoutList: {top:[5or7, ..], right:[], bottom:[], left:[]}
    let layoutList = this._calcLayoutList(layoutId);


    let w = Layout().getHorizontalSideLength(layoutId) * this._nodeSize;
    let h = Layout().getVerticalSideLength(layoutId) * this._nodeSize;
    this.backgroundRect = RectangleShape({
      width: w,
      height: h,
      padding: 0,
      stroke: null,
      fill: "#164a84"
    })
    .setOrigin(0, 0)
    .setPosition(0, 0)
    .addChildTo(this);
    this.backgroundRect.alpha = 0.5;
    //this.backgroundRect.visible = false;


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
            fill: "#000"
          })
          .setOrigin(0, 0)
          .setPosition(w*x, h*y)
          .addChildTo(this)
          .alpha = 0.2;
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
    node.nodeNum = {};
    this._createNumberLabel(index)
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
    return PathShape();
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
    else if(musicNodeIndex == 0) {
      let prevMusicNoteGroup = this._musicNoteList[this._musicNoteList.length-1];
      for(let k=0; k<prevMusicNoteGroup.children.length; k++){
        for(let l=0; l<prevMusicNoteGroup.children[k].children.length; l++){
          prevMusicNoteGroup.children[k].children[l].stroke = "#AAA";
        }
      }
    }
  },

  switchBackgroundVisible: function() {
    switch(this.backgroundRect.visible){
      case true:
        this.backgroundRect.visible = false;
        break;
      case false:
        this.backgroundRect.visible = true;
        break;
    }
  }
});


phina.define('Layout',{
  LIST: [
    {short: [5], long: [7], dir: "PORTRAIT", length: 12}, //12
    {short: [7], long: [5, 5], dir: "LANDSCAPE", length: 9}, //9
    {short: [7, 5], long: [5, 7, 5], dir: "PORTRAIT", length: 6}, //6
    {short: [5, 7, 5], long: [7, 5, 7, 5], dir: "LANDSCAPE", length: 7}, //7
    {short: [5, 7, 5, 7, 5], long: [7, 5, 5, 7, 5, 7, 5], dir: "PORTRAIT", length: 4}, //4
    {short: [7, 5, 5, 7, 5, 7, 5], long: [5, 7, 5, 7, 5, 5, 7, 5, 7, 5], dir: "LANDSCAPE", length: 5} //5
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
  },

  getTurnLength: function(id) {
    return this.LIST[id].length;
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
  turnLength: 0,

  WAIT_COUNT: 4000, //4000

  init: function(nodeSize, layoutId, square, labels, turnLengthLabel) {
    this.superInit({
      radius: 6,
      fill: "#333300",
      stroke: null
    });
    this.setOrigin(0.5, 0.5);
    this._nodeSize = nodeSize;
    this.layoutId = layoutId;
    this._square = square;
    this.labels = labels;
    this.turnLengthLabel = turnLengthLabel;
  },

  setMoveSpeed: function(moveSpeed) {
    this.moveSpeed = moveSpeed;
    return this;
  },

  appStart: function(moveDirCount) {
    this.fill = "#CC0000";
    let highlightTime = 200;
    let waitCount = 1000 * 60 / (BPM / 4) - highlightTime;
    this.tweener
      .wait(this.WAIT_COUNT)
      .call(function(){
        this.fill = "#FFF";
      }.bind(this))
      .wait(highlightTime)
      .call(function(){
        this.fill = "#CC0000";
      }.bind(this))
      .wait(waitCount)
      .call(function(){
        this.fill = "#FFF";
      }.bind(this))
      .wait(highlightTime)
      .call(function(){
        this.fill = "#CC0000";
      }.bind(this))
      .wait(waitCount)
      .call(function(){
        this.fill = "#FFF";
      }.bind(this))
      .wait(highlightTime)
      .call(function(){
        this.fill = "#CC0000";
      }.bind(this))
      .wait(waitCount)
      .call(function(){
        this.fill = "#FFF";
      }.bind(this))
      .wait(highlightTime)
      .call(function(){
        this.fill = "#CC0000";
      }.bind(this))
      .wait(waitCount)
      .call(function(){
        this.moveStart(moveDirCount);
      }.bind(this))
  },

  moveStart: function(moveDirCount) {
    this.moveDirCount = moveDirCount;

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

    let nodeIsFirstOfBlock = this._square.getNodeIsFirstOfBlock(this.moveNodeCount % squareNodeLength);
    if(nodeIsFirstOfBlock){
      this.fill = "#FFF";
    } else {
      this.fill = "#CC0000";
    }

    this._square.highlight(this.moveNodeCount % squareNodeLength);

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
          this.turnLength++;
          if(this.turnLength == Layout().getTurnLength(this.layoutId)){
            this.turnLength = 0;
            this.layoutId = Layout().getNextLayoutId(this.layoutId);
            switch(Layout().getSquareDirection(this.layoutId)){
              case "PORTRAIT":
                this.moveDirCount = 0;
                this.moveNodeCount = 0;
                break;
              case "LANDSCAPE":
                this.moveDirCount = 1;
                this.moveNodeCount = Layout().getLongSidelength(this.layoutId);
                break;
            }
            this.currentNode = 0;
            // wait callback start ---------
            let highlightTime = 200;
            let waitCount = 1000 * 60 / (BPM / 4) - highlightTime;
            this.tweener
              .wait(this.WAIT_COUNT)
              .call(function(){
                switch(Layout().getSquareDirection(this.layoutId)){
                  case "PORTRAIT":
                    this.x = 0;
                    break;
                  case "LANDSCAPE":
                    this.x = this._nodeSize * Layout().getLongSidelength(this.layoutId);
                    break;
                }
                this._square.renew(this._nodeSize, this.layoutId);
                this.labels.updateLabels(this.layoutId);
                this.turnLengthLabel.updateLabels(this.layoutId, this.turnLength + 1, this._nodeSize);
              }.bind(this))
              .wait(this.WAIT_COUNT)


              .call(function(){
                this.fill = "#FFF";
              }.bind(this))
              .wait(highlightTime)
              .call(function(){
                this.fill = "#CC0000";
              }.bind(this))
              .wait(waitCount)
              .call(function(){
                this.fill = "#FFF";
              }.bind(this))
              .wait(highlightTime)
              .call(function(){
                this.fill = "#CC0000";
              }.bind(this))
              .wait(waitCount)
              .call(function(){
                this.fill = "#FFF";
              }.bind(this))
              .wait(highlightTime)
              .call(function(){
                this.fill = "#CC0000";
              }.bind(this))
              .wait(waitCount)
              .call(function(){
                this.fill = "#FFF";
              }.bind(this))
              .wait(highlightTime)
              .call(function(){
                this.fill = "#CC0000";
              }.bind(this))
              .wait(waitCount)
              .call(function(){
                this.moveStart(this.moveDirCount);
              }.bind(this))
            // wait callback end ---------
          }
          else {
            this.labels.updateLabels(this.layoutId);
            this.turnLengthLabel.updateLabels(this.layoutId, this.turnLength + 1, this._nodeSize);
            switch(Layout().getSquareDirection(this.layoutId)){
              case "PORTRAIT":
                this.moveDirCount = 0;
                this.moveNodeCount = 0;
                this.x = 0;
                break;
              case "LANDSCAPE":
                this.moveDirCount = 1;
                this.moveNodeCount = Layout().getLongSidelength(this.layoutId);
                this.x = this._nodeSize * Layout().getLongSidelength(this.layoutId);
                break;
            }
            this.currentNode = 0;

            if(this.turnLength == Layout().getTurnLength(this.layoutId) - 1) {
              this._square.switchBackgroundVisible();
            }

            this.moveStart(this.moveDirCount);
          }
        }
        else {
          this.moveNodeCount++;
          this.currentNode++;
          this.moveStart(this.moveDirCount);
        }
      }.bind(this));
  },

  _isPossibleGoStraight: function(squareNodeLength) {
    if(this._square.getIsLastOfSide(this.moveNodeCount % squareNodeLength)) this._turn();
  },

  _turn: function(){
    this.moveDirCount += 1;

    if(this.turnLength == Layout().getTurnLength(this.layoutId) - 1) {
      this._square.switchBackgroundVisible();
    }
  }
});


phina.define('Labels',{
  superClass: 'DisplayElement',

  init: function(layoutId) {
    this.superInit();
    let grayColor = "#AAA";

    this.mainLabel = Label({
      fontSize: 45,
      fill: "#FFF"
    })
    .setPosition(0, -60) //暫定位置
    .addChildTo(this);

    this.ratioLabel = Label({
      fontSize: 18,
      fill: grayColor
    })
    .setPosition(0, -25) //暫定位置
    .addChildTo(this);

    this.sqrtLabel = Label({
      fontSize: 18,
      fill: grayColor
    })
    .setPosition(370, -52) //暫定位置
    .addChildTo(this);

    this.diffLabel = Label({
      fontSize: 18,
      fill: grayColor
    })
    .setPosition(355, -25) //暫定位置
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


phina.define('TurnLengthLabel',{
  superClass: 'DisplayElement',

  init: function(nodeSize, layoutId) {
    this.superInit();

    this.turnLengthLabel = Label({
      fontSize: 20,
      fill: "#FFF",
      text: "1"
    })
    .addChildTo(this);

    this.updateLabels(layoutId, this.turnLengthLabel.text, nodeSize);
  },

  updateLabels: function(layoutId, turnLength, nodeSize) {
    this.turnLengthLabel.text = turnLength;
    this.turnLengthLabel.setPosition(
      Layout().getHorizontalSideLength(layoutId) * nodeSize / 2,
      Layout().getVerticalSideLength(layoutId) * nodeSize / 2
    )
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
