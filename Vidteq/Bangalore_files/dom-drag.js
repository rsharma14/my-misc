/**************************************************
 * dom-drag.js
 * 09.25.2001
 * www.youngpup.net
 **************************************************
 * 10.28.2001 - fixed minor bug where events
 * sometimes fired off the handle, not the root.
 **************************************************/

if (typeof(vidteq) == 'undefined') { vidteq = {}; }

vidteq.Drag = {
  obj : null,
  init : function(o, oRoot, minX, maxX, minY, maxY, bSwapHorzRef, bSwapVertRef, fXMapper, fYMapper) {
    o.onmousedown  = vidteq.Drag.start;

    o.hmode      = bSwapHorzRef ? false : true ;
    o.vmode      = bSwapVertRef ? false : true ;

    o.root = oRoot && oRoot != null ? oRoot : o ;

    if (o.hmode  && isNaN(parseInt(o.root.style.left  ))) o.root.style.left   = "0px";
    if (o.vmode  && isNaN(parseInt(o.root.style.top   ))) o.root.style.top    = "0px";
    if (!o.hmode && isNaN(parseInt(o.root.style.right ))) o.root.style.right  = "0px";
    if (!o.vmode && isNaN(parseInt(o.root.style.bottom))) o.root.style.bottom = "0px";

    o.minX  = typeof minX != 'undefined' ? minX : null;
    o.minY  = typeof minY != 'undefined' ? minY : null;
    o.maxX  = typeof maxX != 'undefined' ? maxX : null;
    o.maxY  = typeof maxY != 'undefined' ? maxY : null;

    o.xMapper = fXMapper ? fXMapper : null;
    o.yMapper = fYMapper ? fYMapper : null;

    o.root.onDragStart  = new Function();
    o.root.onDragEnd  = new Function();
    o.root.onDrag  = new Function();
  },
  start : function(e){
    var o = vidteq.Drag.obj = this;
    e = vidteq.Drag.fixE(e);
    var y = parseInt(o.vmode ? o.root.style.top  : o.root.style.bottom);
    var x = parseInt(o.hmode ? o.root.style.left : o.root.style.right );
    o.root.onDragStart(x, y);

    o.lastMouseX  = e.clientX;
    o.lastMouseY  = e.clientY;

    if (o.hmode) {
      if (o.minX != null)  o.minMouseX  = e.clientX - x + o.minX;
      if (o.maxX != null)  o.maxMouseX  = o.minMouseX + o.maxX - o.minX;
    } else {
      if (o.minX != null) o.maxMouseX = -o.minX + e.clientX + x;
      if (o.maxX != null) o.minMouseX = -o.maxX + e.clientX + x;
    }

    if (o.vmode) {
      if (o.minY != null)  o.minMouseY  = e.clientY - y + o.minY;
      if (o.maxY != null)  o.maxMouseY  = o.minMouseY + o.maxY - o.minY;
    } else {
      if (o.minY != null) o.maxMouseY = -o.minY + e.clientY + y;
      if (o.maxY != null) o.minMouseY = -o.maxY + e.clientY + y;
    }

    document.onmousemove  = vidteq.Drag.drag;
    document.onmouseup  = vidteq.Drag.end;

    return false;
  },
  drag : function(e) {
    e = vidteq.Drag.fixE(e);
    var o = vidteq.Drag.obj;

    var ey  = e.clientY;
    var ex  = e.clientX;
    var y = parseInt(o.vmode ? o.root.style.top  : o.root.style.bottom);
    var x = parseInt(o.hmode ? o.root.style.left : o.root.style.right );
    var nx, ny;

    if (o.minX != null) ex = o.hmode ? Math.max(ex, o.minMouseX) : Math.min(ex, o.maxMouseX);
    if (o.maxX != null) ex = o.hmode ? Math.min(ex, o.maxMouseX) : Math.max(ex, o.minMouseX);
    if (o.minY != null) ey = o.vmode ? Math.max(ey, o.minMouseY) : Math.min(ey, o.maxMouseY);
    if (o.maxY != null) ey = o.vmode ? Math.min(ey, o.maxMouseY) : Math.max(ey, o.minMouseY);

    nx = x + ((ex - o.lastMouseX) * (o.hmode ? 1 : -1));
    ny = y + ((ey - o.lastMouseY) * (o.vmode ? 1 : -1));

    if (o.xMapper)    nx = o.xMapper(y)
    else if (o.yMapper)  ny = o.yMapper(x)

    vidteq.Drag.obj.root.style[o.hmode ? "left" : "right"] = nx + "px";
    vidteq.Drag.obj.root.style[o.vmode ? "top" : "bottom"] = ny + "px";
    vidteq.Drag.obj.lastMouseX  = ex;
    vidteq.Drag.obj.lastMouseY  = ey;

    vidteq.Drag.obj.root.onDrag(nx, ny);
    return false;
  },
  end : function() {
    document.onmousemove = null;
    document.onmouseup   = null;
    vidteq.Drag.obj.root.onDragEnd(  parseInt(vidteq.Drag.obj.root.style[vidteq.Drag.obj.hmode ? "left" : "right"]), 
                  parseInt(vidteq.Drag.obj.root.style[vidteq.Drag.obj.vmode ? "top" : "bottom"]));
    vidteq.Drag.obj = null;
  },
  fixE : function(e) {
    if (typeof e == 'undefined') e = window.event;
    if (typeof e.layerX == 'undefined') e.layerX = e.offsetX;
    if (typeof e.layerY == 'undefined') e.layerY = e.offsetY;
    return e;
  }
};

/* =======================================================
* ypSimpleScroll
* 3/11/2001
* 
* http://www.youngpup.net/
* ======================================================= */

// Modified by Sergi Meseguer (www.zigotica.com) 04/2004
// Now it works with dragger and can use multiple instances in a page

// modified for vidteq needs

if (typeof(vidteq) == 'undefined') { vidteq = {}; }

//function ypSimpleScroll(id, left, top, width, height, speed) 
vidteq.ypSimpleScroll = function(id, left, top, width, height, speed) {
  var y = this.y = vidteq.ypSimpleScroll;
  if (document.layers && !y.ns4) history.go(0)
  if (y.ie || y.ns4 || y.dom) {
    this.loaded = false;
    this.id = id;
    this.origSpeed = speed;
    this.aniTimer = false;
    this.op = "";
    this.lastTime = 0;
    this.clipH = height;
    this.clipW = width;
    this.scrollOffsetTop = top;
    this.scrollOffsetLeft = left;
    this.scrollTop = 0;
    this.scrollLeft = 0;
    var _gRef = "ypSimpleScroll_"+id;
    this.gRef = "vidteq."+_gRef;
    vidteq[_gRef] = this;
    //eval(this.gRef+"=this");
  }
  this.theThumb = null;
  this.theThumb1 = null;
}

vidteq.ypSimpleScroll.minRes = 10;
vidteq.ypSimpleScroll.ie = document.all ? 1 : 0;
vidteq.ypSimpleScroll.ns4 = document.layers ? 1 : 0;
vidteq.ypSimpleScroll.dom = document.getElementById ? 1 : 0;
vidteq.ypSimpleScroll.mac = navigator.platform == "MacPPC";
vidteq.ypSimpleScroll.mo5 = document.getElementById && !document.all ? 1 : 0;
vidteq.ypSimpleScroll.getDom = function( options ) {
  options = options || {};
  var theme = options.theme || {}
  ,dArry = theme.dArry || ['up','down','thumb','bigbar']
  ,classes = theme.classes || {}
  ,imgPath = options.imgPath
  ,activeTheme = options.activeTheme || "classic"
  ,numOfScrolls = options.numOfScrolls
  ,pos = typeof options.pos !== "undefined"? options.pos : 0
  ,sW = typeof theme.sW !== "undefined"? theme.sW : options.sW
  ,sH = typeof theme.sH !== "undefined"? theme.sH : options.sH
  ,delta = typeof theme.delta !== "undefined"? theme.delta : 0
  ,h = options.h
  ,w = options.w
  ,posT = (h-sH)
  ,posL = 0
  ,type = ''
  ;
  if( pos=="left" || pos==0 ) {
    type = "left"; pos = 0;
    posL = (0+delta);
  }
  if( pos=="right" || pos==1 ) {
    type = "right"; pos = 1;
    posL = (w-sW-delta);
  }
  activeTheme += ' '+type;
  
  var dom = {
    up:function(id) {
      var dom = '<div id="'+id+pos+'" class="up '+activeTheme+themeClasses+'" style="left:'+posL+'px;">'+
        '<a href="javascript:void(0);" onmouseover="vidteq.fvtObj.theScroll[0].scrollNorth(0)" onmouseout="vidteq.fvtObj.theScroll[0].endScroll()" onclick="return false;">'+
          //'<img src="'+imgPath.up+'" height="100" width="'+sW+'">'+
          '<img src="'+imgPath.up+'">'+
        '</a>'+
      '</div>';
      return dom;
    }
    ,down:function(id) {
      var dom = '<div id="'+id+pos+'" class="dn '+activeTheme+themeClasses+'" style="left:'+posL+'px;top:'+posT+'px;">'+
        '<a href="javascript:void(0);" onmouseover="vidteq.fvtObj.theScroll[0].scrollSouth(0)" onmouseout="vidteq.fvtObj.theScroll[0].endScroll()" onclick="return false;">'+
          //'<img src="'+imgPath.down+'" height="'+sH+'" width="'+sW+'">'+
          '<img src="'+imgPath.down+'">'+
        '</a>'+
      '</div>';
      return dom;
    }
    ,thumb:function( id, themeClasses ) {
      var dom = '<div id="'+id+pos+'" class="thumb '+activeTheme+themeClasses+'" style="border:0pt none;top:'+sH+'px;left:'+posL+'px;">'+
        '<a href="javascript:void(0);">'+
          //'<img src="'+imgPath.thumb+'" height="'+sH+'" width="'+sW+'">'+
          '<img src="'+imgPath.thumb+'">'+
        '</a>'+
      '</div>';
      return dom;
    }
    ,bigbar:function( id, themeClasses ) {
      //var dom = '<div id="bigbar'+pos+'" class="bigbar" style="border:0pt none;top:'+sH+'px;left:'+posL+'px;height:'+(h-(sH*2))+'px;width:'+sW+'px;" href="javascript:void(0);" ></div>';
      var dom = '<div id="'+id+pos+'" class="bigbar '+activeTheme+themeClasses+'" style="top:'+sH+'px;left:'+posL+'px;height:'+(h-(sH*2))+'px;" href="javascript:void(0);" ></div>';
      return dom;
    }
  };
  
  var dStr = '';
  for(var j=0; j<dArry.length; j++ ) {
    var id = dArry[j];
    var themeClasses = classes[id]? ' '+classes[id] : '';
    dStr = dStr + dom[ id ]( id, themeClasses );
  }
  return dStr;
};

vidteq.ypSimpleScroll.prototype.init = function( options ) {
  this.load();
  options = options || {};
  var prefix = options.prefix || "theThumb"
  ,leftIdx = 0
  ,rightIdx = 1
  ,numOfScrolls = options.numOfScrolls
  ,left = options.left
  ,right = options.right
  ,res = typeof options.res !== "undefined"? options.res : 32
  ,jumpIndex = typeof options.jumpIndex !== "undefined"? options.jumpIndex : 0
  ,jumpToIndex = ( options.jumpToIndex )? options.jumpToIndex : null
  ,getTheRatio = ( options.getTheRatio && typeof options.getTheRatio === 'function')? options.getTheRatio : null
  ,bigbarOnClick = ( options.bigbarOnClick && typeof options.bigbarOnClick === 'function')? options.bigbarOnClick : null
  ;
  this.res = res;
  this.jumpIndex = jumpIndex;
  
  if( left ) {
    var leftThumb = document.getElementById('thumb'+leftIdx);
    if( leftThumb ) {
      this[prefix] = leftThumb;
    }
    if( left.dragInit && typeof left.dragInit === 'function' ) {
      left.dragInit( this[prefix], this, numOfScrolls );
      var that = this;
      this[prefix].onDrag = function(x,y) {
        //try to get the right thumb and if not found then fallback to left
        var thumb = that[prefix+rightIdx] || that[prefix];
        that.jumpTo(null, Math.round((y - thumb.minY) * that.theRatio));
        thumb.style.top = y + "px";
        that.jumpIndex = Math.round((y - thumb.minY)*that.res/(thumb.maxY - thumb.minY));
      }
    }
  }
  if( right ) {
    var rightThumb = document.getElementById('thumb'+rightIdx);
    if( rightThumb ) {
      this[prefix+rightIdx] = rightThumb;
    }
    if( right.dragInit && typeof right.dragInit === 'function' ) {
      right.dragInit( this[prefix+rightIdx], this, numOfScrolls );
      this[prefix+rightIdx].onDrag = function(x,y) {
        //try to get the right thumb and if not found then fallback to left
        var thumb = that[prefix] || that[prefix+rightIdx];
        that.jumpTo(null, Math.round((y - thumb.minY) * that.theRatio));
        thumb.style.top = y + "px";
        that.jumpIndex = Math.round((y - thumb.minY)*that.res/(thumb.maxY - thumb.minY));
      }
    }
  }
  
  if( getTheRatio ) {
    var thumb = this[prefix] || this[prefix+rightIdx]
    getTheRatio( thumb, this );
  }
  if( jumpToIndex ) {
    var thumb = this[prefix] || this[prefix+rightIdx];
    var that = this;
    this.jumpToIndex = function(index) {
      var yOfIndex = index*(thumb.maxY - thumb.minY)/that.res;
      that.jumpTo(null, Math.round(yOfIndex * that.theRatio));
      that.jumpIndex = index;
      //left
      if( that[prefix] ) {
        that[prefix].style.top = Math.round(yOfIndex+thumb.minY) + "px";
      }
      //right
      if( that[prefix+rightIdx] ) {
        that[prefix+rightIdx].style.top = Math.round(yOfIndex+thumb.minY) + "px"; 
      }
    };
  }
  if( left ) {
    bigbarOnClick( leftIdx );
  }
  if( right ) {
    bigbarOnClick( rightIdx );
  }
  //only right scroll is present
  if( !left && right ) {
    //hack for the scroll to work when videoPlayer seek bar is used
    //TBD: if the videoPlayer seek bar api can be made sensitive to left/right scrollbar
    this[prefix] = this[prefix+rightIdx];
  }
}

vidteq.ypSimpleScroll.prototype.scrollNorth = function(count) { this.startScroll(90, count) }
vidteq.ypSimpleScroll.prototype.scrollSouth = function(count) { this.startScroll(270, count) }
vidteq.ypSimpleScroll.prototype.scrollWest = function(count) { this.startScroll(180, count) }
vidteq.ypSimpleScroll.prototype.scrollEast = function(count) { this.startScroll(0, count) }

vidteq.ypSimpleScroll.prototype.startScroll = function(deg, count) {
  if (this.loaded){
    if (this.aniTimer) window.clearTimeout(this.aniTimer)
    this.overrideScrollAngle(deg)
    this.speed = this.origSpeed
    this.lastTime = (new Date()).getTime() - this.y.minRes
    this.aniTimer = window.setTimeout(this.gRef + ".scroll('"+deg+"','"+count+"')", this.y.minRes)
  }
}

vidteq.ypSimpleScroll.prototype.endScroll = function() {
  if (this.loaded){
    window.clearTimeout(this.aniTimer)
    this.aniTimer = 0;
    this.speed = this.origSpeed
  }
}

vidteq.ypSimpleScroll.prototype.overrideScrollAngle = function(deg) {
  if (this.loaded){
    deg = deg % 360
    if (deg % 90 == 0) {
      var cos = deg == 0 ? 1 : deg == 180 ? -1 : 0
      var sin = deg == 90 ? -1 : deg == 270 ? 1 : 0
    } 
    else {
      var angle = deg * Math.PI / 180
      var cos = Math.cos(angle)
      var sin = Math.sin(angle)
      sin = -sin
    }
    this.fx = cos / (Math.abs(cos) + Math.abs(sin))
    this.fy = sin / (Math.abs(cos) + Math.abs(sin))
    this.stopH = deg == 90 || deg == 270 ? this.scrollLeft : deg < 90 || deg > 270 ? this.scrollW : 0
    this.stopV = deg == 0 || deg == 180 ? this.scrollTop : deg < 180 ? 0 : this.scrollH
  }
}

vidteq.ypSimpleScroll.prototype.overrideScrollSpeed = function(speed) {
  if (this.loaded) this.speed = speed
}

vidteq.ypSimpleScroll.prototype.scrollTo = function(stopH, stopV, aniLen) {
  if (this.loaded){
    if (stopH != this.scrollLeft || stopV != this.scrollTop) {
      if (this.aniTimer) window.clearTimeout(this.aniTimer)
      this.lastTime = (new Date()).getTime()
      var dx = Math.abs(stopH - this.scrollLeft)
      var dy = Math.abs(stopV - this.scrollTop)
      var d = Math.sqrt(Math.pow(dx,2) + Math.pow(dy,2))
      this.fx = (stopH - this.scrollLeft) / (dx + dy)
      this.fy = (stopV - this.scrollTop) / (dx + dy)
      this.stopH = stopH
      this.stopV = stopV
      this.speed = d / aniLen * 1000
      window.setTimeout(this.gRef + ".scroll()", this.y.minRes)
    }
  }
}

vidteq.ypSimpleScroll.prototype.jumpTo = function(nx, ny) { 
  if (this.loaded){
    nx = Math.min(Math.max(nx, 0), this.scrollW)
    ny = Math.min(Math.max(ny, 0), this.scrollH)
    this.scrollLeft = nx
    this.scrollTop = ny
    if (this.y.ns4)this.content.moveTo(-nx+this.scrollOffsetLeft, -ny+this.scrollOffsetTop)
    else {
      this.content.style.left = (-nx+this.scrollOffsetLeft) + "px"
      this.content.style.top = (-ny+this.scrollOffsetTop) + "px"
    }
  }
}

vidteq.ypSimpleScroll.prototype.scroll = function(deg,count) {
  this.aniTimer = window.setTimeout(this.gRef + ".scroll('"+deg+"','"+count+"')", this.y.minRes)
  var nt = (new Date()).getTime()
  var d = Math.round((nt - this.lastTime) / 1000 * this.speed)
  if (d > 0){
    var nx = d * this.fx + this.scrollLeft
    var ny = d * this.fy + this.scrollTop
    var xOut = (nx >= this.scrollLeft && nx >= this.stopH) || (nx <= this.scrollLeft && nx <= this.stopH)
    var yOut = (ny >= this.scrollTop && ny >= this.stopV) || (ny <= this.scrollTop && ny <= this.stopV)
    if (nt - this.lastTime != 0 && 
      ((this.fx == 0 && this.fy == 0) || 
      (this.fy == 0 && xOut) || 
      (this.fx == 0 && yOut) || 
      (this.fx != 0 && this.fy != 0 && 
      xOut && yOut))) {
      this.jumpTo(this.stopH, this.stopV)
      this.endScroll()
    }
    else {
      this.jumpTo(nx, ny)
      this.lastTime = nt
    }
  var thumb = this.theThumb || this.theThumb1;
  if( deg=='90' ) {
    //ok nomes down
    if( this.theThumb ) {
      this.theThumb.style.top = parseInt(((thumb.maxY-thumb.minY)*this.scrollTop/this.scrollH)+thumb.minY) + "px";
      }
    if( this.theThumb1 ) {
      this.theThumb1.style.top = parseInt(((thumb.maxY-thumb.minY)*this.scrollTop/this.scrollH)+thumb.minY) + "px";
    }
  }
  if( deg=='270' ) {
    //ok nomes down
    if( this.theThumb ) {
      this.theThumb.style.top = parseInt(((thumb.maxY-thumb.minY)*this.scrollTop/this.stopV)+thumb.minY) + "px";
    }
    if( this.theThumb1 ) {
      this.theThumb1.style.top = parseInt(((thumb.maxY-thumb.minY)*this.scrollTop/this.stopV)+thumb.minY) + "px";
    }
  }
  this.jumpIndex = Math.round((this.scrollTop/this.scrollH)*this.res);
  }
}

vidteq.ypSimpleScroll.prototype.load = function() {
  var d = document
  ,lyrId1 = this.id + "Container"
  ,lyrId2 = this.id + "Content"
  ;
  
  this.container = this.y.dom ? d.getElementById(lyrId1) : this.y.ie ? d.all[lyrId1] : d.layers[lyrId1];
  //this.content = obj2 = this.y.ns4 ? this.container.layers[lyrId2] : this.y.ie ? d.all[lyrId2] : d.getElementById(lyrId2);
  this.content = this.y.ns4 ? this.container.layers[lyrId2] : this.y.ie ? d.all[lyrId2] : d.getElementById(lyrId2);
  this.docH = Math.max(this.y.ns4 ? this.content.document.height : this.content.offsetHeight, this.clipH);
  this.docW = Math.max(this.y.ns4 ? this.content.document.width : this.content.offsetWidth, this.clipW);
  this.scrollH = this.docH - this.clipH;
  this.scrollW = this.docW - this.clipW;
  this.loaded = true;
  this.scrollLeft = Math.max(Math.min(this.scrollLeft, this.scrollW),0);
  this.scrollTop = Math.max(Math.min(this.scrollTop, this.scrollH),0);
  this.jumpTo(this.scrollLeft, this.scrollTop);
  //for chaining
  return this;
}

// ==============================================================
// HANDLES SCROLLER/S
// Modified from Aaron Boodman http://webapp.youngpup.net/?request=/components/ypSimpleScroll.xml
// mixed ypSimpleScroll with dom-drag script and allowed multiple scrolelrs through array instances
// (c)2004 Sergi Meseguer (http://zigotica.com/), 04/2004:
// ==============================================================
//var theHandle = []; var theRoot = []; var theThumb = []; var theScroll = []; var thumbTravel = []; var ratio = [];

//function instantiateScroller(count, id, left, top, width, height, speed){
//  if(document.getElementById) {
//    theScroll[count] = new ypSimpleScroll(id, left, top, width, height, speed);
//  }
//}

//function createDragger(count, handler, root, thumb, minX, maxX, minY, maxY){
//    var buttons = '<div class="up" id="up'+count+'">'+
//                  '<a href="#" onmouseover="theScroll['+count+'].scrollNorth(\''+count+'\')" '+
//                  'onmouseout="theScroll['+count+'].endScroll()" onclick="return false;">'+
//                  '<img src="textScrollUp.gif" width="15" height="15"></a></div>'+
//                  '<div class="dn"  id="dn'+count+'"">'+
//                  '<a href="#" onmouseover="theScroll['+count+'].scrollSouth(\''+count+'\')" '+
//                  'onmouseout="theScroll['+count+'].endScroll()" onclick="return false;">'+
//                  '<img src="textScrollDown.gif" width="15" height="15"></a></div>'+
//                  '<div class="thumb" id="'+thumb+'" style="left: 135px; top: 15px;">'+
//                  '<img src="brownThumb.gif" width="15" height="15"></div>';
//    
//    
//    document.getElementById(root).innerHTML = buttons + document.getElementById(root).innerHTML;
//
//    theRoot[count]   = document.getElementById(root);
//    theThumb[count]  = document.getElementById(thumb);
//    var thisup = document.getElementById("up"+count);
//    var thisdn = document.getElementById("dn"+count);
//    theThumb[count].style.left = parseInt(minX+15) + "px";
//    thisup.style.left = parseInt(minX+15) + "px";
//    thisdn.style.left = parseInt(minX+15) + "px";
//    theThumb[count].style.border =0;
//    theThumb[count].style.top = parseInt(minY) + "px";
//    thisup.style.top = 0 + "px";
//    thisdn.style.top = parseInt(minY+maxY) + "px";
    //thisdn.style.top = 15 + "px";

//    theScroll[count].load();

    //vidteq.Drag.init(theHandle[count], theRoot[count]); //not draggable on screen
    //vidteq.Drag.init(theThumb[count], null, minX+15, maxX+15, minY, maxY);
//    vidteq.Drag.init(theThumb[count], null, minX, maxX, minY, maxY);
    
    // the number of pixels the thumb can travel vertically (max - min)
//    thumbTravel[count] = theThumb[count].maxY - theThumb[count].minY;

    // the ratio between scroller movement and thumbMovement
//    ratio[count] = theScroll[count].scrollH / thumbTravel[count];

//    theThumb[count].onDrag = function(x, y) {
//      theScroll[count].jumpTo(null, Math.round((y - theThumb[count].minY) * ratio[count]));
//    }
//    theThumb[count].jumpToIndex = function(index) {
//      theScroll[count].jumpTo(null, Math.round(index*(theThumb[count].maxY - theThumb[count].minY)/32 * ratio[count]));
//      theThumb[count].style.top = Math.round((index*(theThumb[count].maxY-theThumb[count].minY)/32)+theThumb[count].minY) + "px"; 
//    }
//}  


