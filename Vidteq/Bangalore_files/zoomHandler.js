
if (typeof(vidteq) == 'undefined') { vidteq = {}; }

vidteq._zoomHandler = function _zoomHandler (con,fVId,fVImgId,wVId) {
  this.con = con;
  this.fVId = fVId;
  this.zVId = fVId+'ZoomView';  // this can be common to all
  this.wVId = wVId;
  this.fVImgId = fVImgId;
  this.zVImgId = fVId+'zoomViewImg';  // TBD this can be common to all
  var that = this;
  
  $("#"+this.zVId).hide();
  
  this.con.find('#'+fVImgId).load(function () {
    //if( ($("#"+fVImgId).width() > con.width()) && ($("#"+fVImgId).height() > $("#ZoomContainer").height()) ) {
    if( ($(this).width() > con.width()) && ($(this).height() > con.height()) ) {
      that.setIsWVidDisplayed();
      $(this).hide();
      $(this).fadeIn(2000);
      that.init();
    }
  });
  if (this.con.find('#'+fVImgId).length) { 
    //if( ($("#"+fVImgId).width() > con.width()) && ($("#"+fVImgId).height() > $("#ZoomContainer").height()) ) {
    if( ($("#"+fVImgId).width() > con.width()) && ($("#"+fVImgId).height() > con.height()) ) {
      this.setIsWVidDisplayed();
      this.init(); 
    }
  }
}

vidteq._zoomHandler.prototype.setIsWVidDisplayed = function() {
  var isWVidDisplayed = true;
   if((this.con.width()+this.con.width()/2)>=$("#"+this.fVImgId).width()) {
     var isWVidDisplayed = false;
   }
   this.isWVidDisplayed = isWVidDisplayed;
   var isWVidApplicable = function() { }
}

vidteq._zoomHandler.prototype.isWVidAndZVidApplicable = function(imgId) {
  var applicable = true;
   if((this.con.width()+this.con.width()/2)>=$("#"+imgId).width()) {
     var applicable = false;
   }
   return applicable;
}

vidteq._zoomHandler.prototype.trickleImgUpdate = function() {
  this.imgRef.wCur=this.con.find('#'+this.fVImgId).width();
  this.imgRef.hCur=this.con.find('#'+this.fVImgId).height();
  this.imgRef.wCurMax=this.con.find('#'+this.fVImgId).width()-this.fVRef.w;
  this.imgRef.hCurMax=this.con.find('#'+this.fVImgId).height()-this.fVRef.h;
  this.setWindowView();
}

vidteq._zoomHandler.prototype.setWindowView = function() {
  var wVRef = {
    w:this.imgRef.wCur * this.zVDiv.width() / this.imgRef.w, 
    h:this.imgRef.hCur * this.zVDiv.height() / this.imgRef.h
  };
  if (this.wVRef) {
    this.wVRef.w = wVRef.w; 
    this.wVRef.h = wVRef.h;
    wVRef = this.wVRef; 
  } else {
    this.wVRef = wVRef;
  }
  wVRef.wMax = this.fVRef.w - wVRef.w;
  wVRef.hMax = this.fVRef.h - wVRef.h;
  wVRef.wHalf = wVRef.w/2;
  wVRef.hHalf = wVRef.h/2;
  wVRef.wRatio = this.imgRef.w/this.imgRef.wCur;
  wVRef.hRatio = this.imgRef.h/this.imgRef.hCur;
  this.con.find('#'+this.wVId).width(wVRef.w);
  this.con.find('#'+this.wVId).height(wVRef.h);
}

vidteq._zoomHandler.prototype.attachMouseEvents = function() {
  var that = this;
  this.con.mousemove(function (evt) { that.mouseMove(evt); });
  if(this.isWVidDisplayed) {
    this.con.mouseover(function (evt) { that.mouseOver(evt,this); });
  }
  this.con.mouseout(function (evt) { that.mouseOut(evt); });
  this.con.mousedown(function (evt) { that.mouseDown(evt); });
  this.con.mouseup(function (evt) { that.mouseUp(evt); });
  this.con.mousewheel(function (evt,delta) { that.mouseWheel(evt,delta); return false; });
}

vidteq._zoomHandler.prototype.attachZoomView = function() {
  var options = {
    radiusLT:20,
    radiusLB:20,
    radiusRT:20,
    radiusRB:20
  };

  
  var wVDiv = this.con.find('#'+this.wVId).addClass('wVClass').css({
      background:'none repeat scroll 0 0 #FFFFFF',
      border:'1px solid #AAAAAA',
      position:'absolute',
      opacity:'0.5',
      width:'97px',
      height:'122px',
      left:'0px',
      top:'0px',
      'z-index':200,
      'pointer-events':'none'
  }).hide().attr('title',"Please roll your mouse to zoom.");
 
  if (this.con.find('#'+this.zVId).length && 
      this.con.find('#'+this.zVImgId).length) {
    var zVDiv = this.con.find('#'+this.zVId);
    this.zVDiv = zVDiv;
    var zVImgDiv = this.con.find('#'+this.zVImgId);
    this.zVImgDiv = zVImgDiv;
    this.zVLocal = true;
  } else {
    this.zVLocal = false;
    var zVDiv = $('<div id='+this.zVId+' />').addClass('zVClass')
      .css({
        position:'absolute',
        width:'290px',
        height:'290px',
        left:'0px',
        top:'0px',
        'z-index':80001,
        'background-color':'#ffffff',
        border:'5px solid black'
    }).hide().appendTo('body');
    this.zVDiv = zVDiv;
    var zVImgDiv = $('<div id='+this.zVImgId+' />').addClass('zVImgClass')
      .css({
        overflow:'hidden',
        position:'absolute',
        width:'290px',
        height:'290px',
        left:'0px',
        top:'0px'
    }).appendTo(zVDiv);
    this.zVImgDiv = zVImgDiv; 
  }
  if (this.cssProperty('borderRadius')) {
    $(wVDiv)
      .css('border-top-left-radius', options.radiusLT)
      .css('border-bottom-left-radius', options.radiusLB)
      .css('border-bottom-right-radius', options.radiusRB)
      .css('border-top-right-radius', options.radiusRT)
      .css('-moz-border-radius-topleft', options.radiusLT)
      .css('-moz-border-radius-bottomright', options.radiusRB)
      .css('-moz-border-radius-bottomleft', options.radiusLB)
      .css('-moz-border-radius-topright', options.radiusRT);
    $(zVDiv)
      .css('border-top-left-radius', options.radiusLT*4)
      .css('border-bottom-left-radius', options.radiusLB*4)
      .css('border-bottom-right-radius', options.radiusRB*4)
      .css('border-top-right-radius', options.radiusRT*4)
      .css('-moz-border-radius-topleft', options.radiusLT*4)
      .css('-moz-border-radius-bottomright', options.radiusRB*4)
      .css('-moz-border-radius-bottomleft', options.radiusLB*4)
      .css('-moz-border-radius-topright', options.radiusRT*4);
    $(zVImgDiv)
      .css('border-top-left-radius', options.radiusLT*4)
      .css('border-bottom-left-radius', options.radiusLB*4)
      .css('border-bottom-right-radius', options.radiusRB*4)
      .css('border-top-right-radius', options.radiusRT*4)
      .css('-moz-border-radius-topleft', options.radiusLT*4)
      .css('-moz-border-radius-bottomright', options.radiusRB*4)
      .css('-moz-border-radius-bottomleft', options.radiusLB*4)
      .css('-moz-border-radius-topright', options.radiusRT*4);
  }
}

vidteq._zoomHandler.prototype.init = function() {
  if (this.inited) { return; }
  this.inited = true; 
  this.attachZoomView();

  var fVRef = {
    w:parseInt(this.con.css('width')),
    h:parseInt(this.con.css('height')),
    wHalf:parseInt(this.con.css('width'))/2,
    hHalf:parseInt(this.con.css('height'))/2
  }
  this.fVRef = fVRef;
  var imgRef = {
    w:this.con.find('#'+this.fVImgId).width(),
    h:this.con.find('#'+this.fVImgId).height(),
    wCur:this.con.find('#'+this.fVImgId).width(),
    hCur:this.con.find('#'+this.fVImgId).height(),
    wCurMax:this.con.find('#'+this.fVImgId).width()-fVRef.w,
    hCurMax:this.con.find('#'+this.fVImgId).height()-fVRef.h
  };
  this.imgRef = imgRef;
  // first shrink to full size
  this.con.find('#'+this.fVImgId).width(fVRef.w);
  this.con.find('#'+this.fVImgId).height(fVRef.h);
  this.con.find('#'+this.fVImgId).css({'left':'0px','top':'0px'});
  this.trickleImgUpdate();

  this.offset = this.con.offset();
  this.mouseIsDown = false;
  this.imgPath = this.con.find('#'+this.fVImgId).attr('src');
  if (!this.imgPath.match(/^http/)) { 
    this.imgPath = vidteq.cfg.customHtmlUrl+this.imgPath;
    
  }
 
  //TBD 
  //this.zVImgDiv.css('backgroundImage','url('+this.imgPath);
  //if (this.zVDiv.is(':visible')) {
  //  this.con.find('#'+this.wVId).hide();
  //  this.zVDiv.hide('slow');
  //}

  this.attachMouseEvents();
}

vidteq._zoomHandler.prototype.cssProperty = (function() {
  function cssProperty(p, rp) {
    var b = document.body || document.documentElement;
    var s = b.style;
    if(typeof s == 'undefined') { return false; }
    if(typeof s[p] == 'string') { return rp ? p : true; }
    var v = ['Moz', 'Webkit', 'Khtml', 'O', 'Ms'];
    p = p.charAt(0).toUpperCase() + p.substr(1);
    for(var i=0; i<v.length; i++) {if(typeof s[v[i] + p] == 'string') { return rp ? (v[i] + p) : true; }}
  }
  return cssProperty;
})();

vidteq._zoomHandler.prototype.mouseMove = function(evt) {
  if (this.mouseIsDown) { this.drag(evt); } 
  this.pan(evt); 
}

vidteq._zoomHandler.prototype.mouseOver = function(evt,myDom) {
  this.con.find('#'+this.wVId).show();
  this.zVDiv.show();
  // TBD
  //this.zVImgDiv.css('backgroundImage','url('+this.imgPath);
  //$('#'+this.zVImgId).css('backgroundImage','url('+this.imgPath);
  var imgSrc = $("#"+this.fVImgId).attr("src");
  this.zVImgDiv.css("backgroundImage","url("+imgSrc+")");
  var o = this.con.offset();
  if (!this.zVLocal) {
    this.zVDiv.css({
      left:(parseInt(o.left)+20+parseInt(this.con.css('width')))+'px',
      top:o.top+'px'
    });
  }
}
vidteq._zoomHandler.prototype.mouseOut = function(evt) {
  this.con.find('#'+this.wVId).hide();
  this.zVDiv.hide();
  this.mouseIsDown = false;
}

vidteq._zoomHandler.prototype.mouseDown = function(evt) {
  evt.preventDefault();
  this.mouseIsDown = true;
  this.registerMousePoint(evt);
}
vidteq._zoomHandler.prototype.mouseUp = function(evt) {
  this.mouseIsDown = false;
}

vidteq._zoomHandler.prototype.mouseWheel = function(evt,delta) {

  this.registerMousePoint(evt);

  var cur = {ratio:(1+delta*0.2)};
  cur.w = Math.min(this.imgRef.w,Math.max(this.fVRef.w,parseInt(this.con.find('#'+this.fVImgId).width()*cur.ratio)));
  cur.h = Math.min(this.imgRef.h,Math.max(this.fVRef.h,parseInt(this.con.find('#'+this.fVImgId).height()*cur.ratio)));
  this.con.find('#'+this.fVImgId).width(cur.w);
  this.con.find('#'+this.fVImgId).height(cur.h);

  this.trickleImgUpdate();
  if(this.isWVidAndZVidApplicable(this.fVImgId)) {
    $("#"+this.zVId).hide();
    $("#"+this.wVId).hide();
  } else {
    $("#"+this.zVId).show();
    $("#"+this.wVId).show();
  }
  this.drag(evt);
  this.pan(evt);
}

vidteq._zoomHandler.prototype.drag = function(evt) {
  var cur = {
    x:evt.pageX-this.offset.left,
    y:evt.pageY-this.offset.top
  };
  cur.left = Math.max(-this.imgRef.wCurMax,Math.min(0,parseInt(this.fVRef.left+cur.x-this.fVRef.x)));
  cur.top = Math.max(-this.imgRef.hCurMax,Math.min(0,parseInt(this.fVRef.top+cur.y-this.fVRef.y)));
  this.con.find('#'+this.fVImgId).css('left',cur.left+'px');
  this.con.find('#'+this.fVImgId).css('top',cur.top+'px');
}

vidteq._zoomHandler.prototype.pan = function(evt) {
  //Not working when integrated  TBD 
  // Some issues observed cross browser or load time dependency
  var l = Math.min(this.wVRef.wMax,Math.max(0,parseInt(evt.pageX-(this.offset.left)-this.wVRef.wHalf)));
  var t = Math.min(this.wVRef.hMax,Math.max(0,parseInt(evt.pageY-(this.offset.top)-this.wVRef.hHalf)));
  //Working
  //var l = Math.min(this.wVRef.wMax,Math.max(0,parseInt(evt.pageX-(this.offset.left))));
  //var t = Math.min(this.wVRef.hMax,Math.max(0,parseInt(evt.pageY-(this.offset.top))));
  
  this.con.find('#'+this.wVId).css({left:l+'px',top:t+'px'});
  var l = parseInt(l * this.wVRef.wRatio) - parseInt(this.con.find('#'+this.fVImgId).css('left'))*this.wVRef.wRatio;
  var t = parseInt(t * this.wVRef.hRatio) - parseInt(this.con.find('#'+this.fVImgId).css('top'))*this.wVRef.hRatio;
  //$('#'+this.zVImgId).css('backgroundPosition',''+(-l)+'px '+(-t)+'px');
  
  this.zVImgDiv.css('backgroundPosition',''+(-l)+'px '+(-t)+'px');
}

vidteq._zoomHandler.prototype.registerMousePoint = function(evt) {
  this.fVRef.left=parseInt(this.con.find('#'+this.fVImgId).css('left'));
  this.fVRef.top=parseInt(this.con.find('#'+this.fVImgId).css('top'));
  this.fVRef.x=evt.pageX-this.offset.left;
  this.fVRef.y=evt.pageY-this.offset.top;
}



