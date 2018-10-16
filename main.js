//
//
// main.js
// 2018 @auther Taku Oshiba
// This Program is MIT license.
//
//
phina.globalize();

SCREEN_WIDTH = 640;
SCREEN_HEIGHT = 640;
BACKGROUND_COLOR = "#F3F3F2";


phina.define('MainScene',{
  superClass: 'DisplayScene',

  NODE_SIZE: 12,
  LAYOUT_ID: 4,
  MOVE_SPEED: 165,

  init: function() {
    this.superInit({
      backgroundColor: BACKGROUND_COLOR
    });

    /*
    四角生成
      ・１ノードのサイズ
      ・始点(左上)
      ・生成方向
      ・短辺 / 長辺 のノード数
      ・横長 or 縦長
      メイン四角生成
        ・全ノードの通し番号配列
        ・各辺は横向き生成後に回転させる
        目盛り生成
          ・各ノードごとに短目盛り / 各配列(5 or 7)の最後は長目盛り
        数字生成
          ・各配列(5 or 7)どおり 1～7 で生成
        音符生成
          ・連符１ブロックごとに配列に入れる。
          ・現在位置ノードから現在位置連符を参照できるように
    ボール生成
      ・メイン四角上に addChild
      ・通し番号配列からカーブ位置を計算
      ・進行方角
      ・スタート位置(ノード)
      ボール移動
        ・１周したら四角のサイズを変更
        ・現在位置ノードの数字と、音符の色を変更
    ラベル生成
      ・拍子
      ・比率
      ・理想値
      ・誤差
    */
    this.square = Square(this.NODE_SIZE, this.LAYOUT_ID).setPosition(30,30).addChildTo(this);
    this.square.highlight(20);
  },
});


phina.define('Square',{
  superClass: 'DisplayElement',

  _nodeSize: 0,
  _nodeList: [],

  init: function(nodeSize, layoutId) {
    this.superInit();
    this.renew(nodeSize, layoutId);
  },

  renew: function(nodeSize, layoutId) {
    this.children.clear();
    this._nodeSize = nodeSize;
    //layoutList: {top:[5or7, ..], right:[], bottom:[], left:[]}
    let layoutList = this._calcLayoutList(layoutId);
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
      let isLastOfBlock = this._calcIsLastOfBlock(i, blockSize);
      this._createNode(isLastOfSide, isLastOfBlock)
        .setPosition(this._nodeSize * i, 0)
        .addChildTo(block);
    }
    return block;
  },

  _calcIsLastOfBlock: function(i, blockSize) {
    if(i == blockSize - 1) return true;
    return false;
  },

  _createNode: function(isLastOfSide, isLastOfBlock) {
    let node = DisplayElement();
    this._createLine().addChildTo(node);
    this._createDivision(isLastOfSide, isLastOfBlock).addChildTo(node);
    this._nodeList.push(node);
    return node;
  },

  _createLine: function() {
    return PathShape()
      .addPath(0, 0)
      .addPath(this._nodeSize, 0);
  },

  _createDivision: function(isLastOfSide, isLastOfBlock) {
    let SMALL_DIV_SIZE = 10;
    let LARGE_DIV_SIZE = 20;
    let divSize = SMALL_DIV_SIZE;
    if(isLastOfBlock){
      divSize = LARGE_DIV_SIZE;
    }
    if(isLastOfSide && isLastOfBlock){
      return PathShape()
        .addPath(this._nodeSize + divSize/2, -divSize/2)
        .addPath(this._nodeSize - divSize/2, divSize/2)
    } else {
      return PathShape()
        .addPath(this._nodeSize, -divSize/2)
        .addPath(this._nodeSize, divSize/2)
    }
  },

  highlight: function(i) {
    //console.log(this._nodeList[i].children[1].stroke ="#000");
  }
});


phina.define('Layout',{
  LIST: [
    {short: [5], long: [7], dir: "PORTRAIT"},
    {short: [7], long: [5, 5], dir: "PORTRAIT"},
    {short: [7, 5], long: [5, 7, 5], dir: "PORTRAIT"},
    {short: [5, 7, 5], long: [7, 5, 7, 5], dir: "PORTRAIT"},
    {short: [5, 7, 5, 7, 5], long: [7, 5, 5, 7, 5, 7, 5], dir: "PORTRAIT"},
    {short: [7, 5, 5, 7, 5, 7, 5], long: [5, 7, 5, 7, 5, 5, 7, 5, 7, 5], dir: "PORTRAIT"}
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
});


 phina.main(function() {
   let app = GameApp({
     startLabel: 'main',
     width: SCREEN_WIDTH,
     height: SCREEN_HEIGHT,
   });
   app.run();
 });
