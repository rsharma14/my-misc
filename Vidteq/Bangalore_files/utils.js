if (typeof(vidteq) == 'undefined') { vidteq = {}; }

vidteq._utils = function () {
  this.otherTip = {start:'end',end:'start'};
}

vidteq._utils.prototype.ucfirst = function (str) {
  return str.substr(0,1).toUpperCase() + str.substr(1);
}

vidteq._utils.prototype.isObjectEmpty = function (obj) {
  for(var prop in obj) {
    if(obj.hasOwnProperty(prop)) return false; 
  }
  return true;
}

vidteq._utils.prototype.createElem = function (name, doc) {
  if (! doc) {
    doc = document;
  }
  return doc.createElement(name);
}

vidteq._utils.prototype.trim = function (str) {
  str = str || '';
  return str.toString().replace(/^\s*|\s*$/g, '');
}

vidteq._utils.prototype.ucFirst = function (str) {
  str = str || '';
  return str.charAt(0).toUpperCase()+str.slice(1);
}

//vidteq._utils.prototype.createText = function (str, doc) {
//  if (!doc) {
//    doc = document;
//  }
//  return doc.createTextNode(str);
//}

vidteq._utils.prototype.returnBrowserHeightWidth = function () {
  var a={};  
  if(typeof(window.innerHeight)=='number') {
    a.height=(typeof(vidteq.gui)!='undefined' && typeof(vidteq.gui.embed)!='undefined')?window.innerHeight:document.body.offsetHeight;
    a.width=document.body.clientWidth;
  } else if(document.documentElement) {
    a.height=document.documentElement.clientHeight;  
    a.width=document.documentElement.clientWidth;  
  }
  return a;
} 

vidteq._utils.prototype.geomToLonLat = function(geom) {
  //geom is in lon-lat format: "POINT(80.210225 12.935052)"
  //converts it to ["80.210225", "12.935052"] in [lon, lat]
  return geom.replace(/[^\s\d.]/g,'').split(/ /);  
}

vidteq._utils.prototype.geomToLatLonObj = function(geom) {
  //geom is in lon-lat format: "POINT(80.210225 12.935052)"
  //converts it to lat-lon Object format: { lat:"12.935052", lon:"80.210225" }
  var lonlat = this.geomToLonLat(geom);
  
  var latlonObj = {
    lat: lonlat[1]
    ,lon: lonlat[0]
  };
  
  return latlonObj;
}

vidteq._utils.prototype.lonLatObjFrmPoint = function (point) {
  if(typeof(point) == 'undefined' || point == null) return null;
  var temp=point.replace(/POINT\(/,"");
  temp=temp.replace(/\)/,"");
  temp=temp.replace(/\,/," ");
  var pt=temp.split(" ");
  var p={};
  p.lon=parseFloat(pt[0]);
  p.lat=parseFloat(pt[1]);
  return p;
}

vidteq._utils.prototype.normalizeGeom = function (entity) {
  if (entity.geom && !entity.geom.toString().match(/POINT/)) {
    entity.geom = "POINT("+entity.geom+")";
  }
  if (entity.geom && entity.lat && entity.lon) { return; }
  if (!entity.geom) {
    entity.geom = 'POINT('+entity.lon+' '+entity.lat+')';
  }
  if (!entity.lon || !entity.lat) {
    var temp=entity.geom.replace(/POINT\(/,"");
    temp=temp.replace(/\)/,"");
    temp=temp.replace(/\,/," ");
    var pt=temp.split(" ");
    entity.lon=parseFloat(pt[0]);
    entity.lat=parseFloat(pt[1]);
  }
}


//vidteq._utils.prototype.fetchBrowserDetails = function  () {
//      vidteq=vidteq || {};
//      vidteq.browser={};
//      $.each($.browser, function(i, val) {
//      if(val) vidteq.browser[i]=val;
//    });
//}

vidteq._utils.prototype.writeCookie = function(name,value,days) {
  if( typeof days === 'undefined' ) days=3;
  if(days) {
    var date = new Date();
    date.setTime(date.getTime()+(days*24*60*60*1000));
    var expires = "; expires="+date.toGMTString();
  }
  else var expires = "";
  //TBD: same domain cookie
  /*
  encodeURIComponent(key), '=',
            options.raw ? value : encodeURIComponent(value),
            options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
            options.path ? '; path=' + options.path : '',
            options.domain ? '; domain=' + options.domain : '',
            options.secure ? '; secure' : ''
  */
  document.cookie = name+"="+value+expires+"; path=/";
}

vidteq._utils.prototype.isCookieEnabled = function(cookie,msg) {
  try {
    cookie = typeof cookie !== 'undefined'? cookie : document.cookie;
    msg = typeof msg !== 'undefined'? msg : "cookie: ";
    console.log(msg);console.log(cookie);
  }catch(err) {};
}

vidteq._utils.prototype.readCookie = function (cookieName) {
  var cookies = this.getCookieArray();
  if (cookies.length < 0 || typeof(cookies[cookieName]) == 'undefined') {
    return false;
  }
  return cookies[cookieName];
}

vidteq._utils.prototype.getCookieArray = function () {
  var cookies = {};
  if (document.cookie && document.cookie != '') {
    var split = document.cookie.split(';');
    for (var i=0; i<split.length;i++) {
      var keyVal = split[i].split("=");
      keyVal[0] = keyVal[0].replace(/^ /,'');
      cookies[decodeURIComponent(keyVal[0])] = decodeURIComponent(keyVal[1]);
    }
  }
  return cookies;
}

vidteq._utils.prototype.getRootPath = function  () {
  var root = document.location.protocol+'//'+document.location.host+document.location.pathname;
  root = root.replace(/[0-9\.a-zA-Z_]+$/,'');
  return root;
}

vidteq._utils.prototype.prependPath = function  (str,prePath) {
  if( !str ) return;
  var protocol = document.location.protocol || "http:"; // http:
  var rgxp = new RegExp(protocol);
  if (str.match(rgxp)) { return str; }
  if (str.match(/^\//)) { return str; }
  return prePath+str;
}

vidteq._utils.prototype.makePathAbsolute = function  (str,homeUrl,rootUrl) {
  if( !str ) return;
  var root = this.getRootPath();
  var force = false;
  if (typeof(homeUrl) != 'undefined') { 
    root = homeUrl; 
    force = true;
  }
  var protocol = document.location.protocol || "http:"; // http:
  var rgxp = new RegExp(protocol);
  if (str.match(/^\//)) { 
    if (force) {
      //str = str.replace(/^./,'');
      if (typeof(rootUrl) != 'undefined') { 
        return rootUrl+str;
      }
      return root+str;
    }
    return protocol + '//'+document.location.host+str; 
  }
  //Reference:
  //1. http://stackoverflow.com/questions/3172985/javascript-use-variable-in-string-match
  //2. https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/RegExp
  
  if (!str.match(/^http/)) { return root+str; }
  //if (!str.match(rgxp)) { return root+str; }
  return str;
}

vidteq._utils.prototype.isBorderSupported = function () {
  if (this._useCss) { return true; }  // TBD false case
  var cssAttributesNames = ['borderRadius','BorderRadius','MozBorderRadius','WebkitBorderRadius','OBorderRadius','KhtmlBorderRadius'];
  for (var i in cssAttributesNames) {
    if (window.document.body.style[cssAttributesNames[i]] !== undefined) {
      this._useCss = true;
      return true;
    }
  }
}

vidteq._utils.prototype.boxify = function (boxImage,divId,corners,clone) {
//nanda-checks if browser is IE or not, for non-ie use css border-radius option
//to round corners else do the complicated stuff. need to customize the code piece for colors
  //if(!$.browser.msie && vidteq.gui.handheld){//TBD NANDA
  if(vidteq.gui.handheld){
    var par='';
    if (typeof(clone) == 'undefined') 
      par=divId;
    else 
      par=$('#'+divId).parents().parents().attr('id');

    var backgdC = vidteq.aD.config.bgColor;  
    var borderC = vidteq.aD.config.topStripSelectColor;
    var borderW = boxImage.url;
    var wpixel = parseInt(borderW.match(/[0-9].png|[0-9][0-9].png/g))*5+"px";
//    if(corners) console.log(corners.lt+" "+corners.mc+" "+corners.tc+" "+corners.lc+" "+Math.random());
/*    var test = borderW.match(/[0-9].png|[0-9][0-9].png/g);
    $('#'+par).css('background-color','#000');
    $('#'+par).css('border','4px solid #555678');
    $('#'+par).css('-moz-border-radius','10px');
    $('#'+par).css('-border-radius','10px');
    $('#'+par).css('borderRadius','10px');
    $('#'+par).css('-webkit-border-radius','10px');*/
    $('#'+par).css('background-color',backgdC);
    $('#'+par).css('border','3px solid '+borderC);
    $('#'+par).css('-moz-border-radius',wpixel);
    $('#'+par).css('-border-radius',wpixel);
    $('#'+par).css('borderRadius',wpixel);
    $('#'+par).css('-webkit-border-radius',wpixel);

    /*
      for lt:
      border-top-left-radius  
      -moz-border-radius-topleft

      for rt:
      border-top-right-radius 
      -moz-border-radius-topright

      for rb:
      border-bottom-right-radius  
      -moz-border-radius-bottomright

      for lb:
      border-bottom-left-radius 
      -moz-border-radius-bottomleft

    */
  
  } else if ($.support.borderRadius && corners.smoothCorner) {
    $('#' + divId).corner(boxImage.cornerW);
  } else {
    if (typeof(corners) == 'undefined') { var corners = {lt:1,rt:1,lb:1,rb:1}; }
    var w = parseInt($('#'+divId).outerWidth(true));
    if (corners.mc) { w += corners.mc; }
    var h = parseInt($('#'+divId).outerHeight(true));
    var oldHtml;
    if (typeof(clone) == 'undefined') {
      oldHtml = $('#'+divId).html();
      $('#'+divId).html('');
    } else {
      $('#'+divId).attr('id',divId+"Inner");
      $('#'+divId).addClass(divId+"Inner");
      $("<div id = '"+divId+"'></div>").appendTo($('#'+divId+"Inner").parent());
      // TBD css and all that
    }
    var lt = {w:0,h:0};
    var rt = {w:0,h:0};
    var lb = {w:0,h:0};
    var rb = {w:0,h:0};
    if (corners.lt) {
      var newHtml = "<div id='"+divId+"TopLeft' style='position:absolute;top:0px;left:0px;width:"+boxImage.cornerW+"px;height:"+boxImage.cornerW+"px;background:url(\""+boxImage.url+"\"); background-repeat:no-repeat;background-position:"+(-boxImage.offsetW)+"px "+(-boxImage.offsetH)+"px;'></div>";
      $('#'+divId).append(newHtml);
      lt = {w:boxImage.cornerW,h:boxImage.cornerH};
    }
    if (!corners.lt && corners.tc) { lt.w = corners.tc; corners.tcl = corners.tc; }
    if (!corners.lt && corners.lc) { lt.h = corners.lc; corners.lct = corners.tc; }
    if (corners.rt) {
    var newHtml = "<div id='"+divId+"TopRight' style='position:absolute;top:0px;right:0px;width:"+boxImage.cornerW+"px;height:"+boxImage.cornerW+"px;background:url(\""+boxImage.url+"\"); background-repeat:no-repeat;background-position:"+(-boxImage.boxW-boxImage.offsetW)+"px "+(-boxImage.offsetH)+"px;'></div>";
    $('#'+divId).append(newHtml);
    rt = {w:boxImage.cornerW,h:boxImage.cornerH};
  }
  if (!corners.rt && corners.tc) { rt.w = corners.tc; corners.tcr = corners.tc; }
  if (!corners.rt && corners.rc) { rt.h = corners.rc; corners.rct = corners.tc; }
  if (corners.lb) {
    //var newHtml = "<div id='"+divId+"BotLeft' style='position:absolute;bottom:0px;left:0px;width:"+boxImage.cornerW+"px;height:"+boxImage.cornerW+"px;background:url(\""+boxImage.url+"\"); background-repeat:no-repeat;background-position:"+(-boxImage.offsetW)+"px "+(-boxImage.boxH-boxImage.offsetH)+"px;'></div>";
    var newHtml = "<div id='"+divId+"BotLeft' style='position:absolute;top:"+(h-boxImage.cornerH)+"px;left:0px;width:"+boxImage.cornerW+"px;height:"+boxImage.cornerW+"px;background:url(\""+boxImage.url+"\"); background-repeat:no-repeat;background-position:"+(-boxImage.offsetW)+"px "+(-boxImage.boxH-boxImage.offsetH)+"px;'></div>";
    $('#'+divId).append(newHtml);
    lb = {w:boxImage.cornerW,h:boxImage.cornerH};
  }
  if (!corners.lb && corners.lc) { lb.h = corners.lc; corners.lcb = corners.lc; }
  if (!corners.lb && corners.bc) { lb.w = corners.bc; corners.bcl = corners.lc; }
  if (corners.rb) {
    //var newHtml = "<div id='"+divId+"BotRight' style='position:absolute;bottom:0px;right:0px;width:"+boxImage.cornerW+"px;height:"+boxImage.cornerW+"px;background:url(\""+boxImage.url+"\"); background-repeat:no-repeat;background-position:"+(-boxImage.boxW-boxImage.offsetW)+"px "+(-boxImage.boxH-boxImage.offsetH)+"px;'></div>";
    var newHtml = "<div id='"+divId+"BotRight' style='position:absolute;top:"+(h-boxImage.cornerH)+"px;right:0px;width:"+boxImage.cornerW+"px;height:"+boxImage.cornerW+"px;background:url(\""+boxImage.url+"\"); background-repeat:no-repeat;background-position:"+(-boxImage.boxW-boxImage.offsetW)+"px "+(-boxImage.boxH-boxImage.offsetH)+"px;'></div>";
    $('#'+divId).append(newHtml);
    rb = {w:boxImage.cornerW,h:boxImage.cornerH};
  }
  if (!corners.rb && corners.rc) { rb.h = corners.rc; corners.rcb = corners.rc; }
  if (!corners.rb && corners.bc) { rb.w = corners.bc; corners.bcr = corners.bc; }

  boxImage.w = boxImage.boxW - 2*boxImage.cornerW;
  boxImage.h = boxImage.boxH - 2*boxImage.cornerH;
  var tt,bb,ll,rr;
  if (corners.tcl) {
    tt = {  cut:{w:corners.tcl-boxImage.cornerW,h:boxImage.cornerH,
                 t:0,l:boxImage.cornerW},
          uncut:{w:w-corners.tcl-boxImage.cornerW,h:boxImage.cornerH,
                 t:0,l:corners.tcl}};
  } else if (corners.tcr) {
    tt = {uncut:{w:w-corners.tcr-boxImage.cornerW,h:boxImage.cornerH,
                 t:0,l:boxImage.cornerW},
            cut:{w:corners.tcr-boxImage.cornerW,h:boxImage.cornerH,
                   t:0,l:corners.tcr}};
  } else {
    var c1 = corners.lct?0:boxImage.cornerW;
    var c2 = corners.rct?0:boxImage.cornerW;
    tt = {cut:{w:0,h:0,t:0,l:0},
        uncut:{w:w-c1-c2,h:boxImage.cornerH,t:0,l:c1}};
  }
  var newHtml;
  if (tt.cut.w > 0) {
    var b = tt.cut;
    for (var i=0;i<parseInt(b.w/boxImage.w+1);i++) {
      var curL = b.l + i*boxImage.w;
      var curW = Math.min((b.w-i*boxImage.w),b.w);
      curW = curW > boxImage.w ? boxImage.w : curW;
      //newHtml = "<div id='"+divId+"TopCut' style='position:absolute;top:"+b.t+"px;left:"+b.l+"px;width:"+b.w+"px;height:"+b.h+"px;background:url(\""+boxImage.url+"\"); background-repeat:no-repeat;background-position:"+(-boxImage.cornerW-boxImage.offsetW)+"px "+(-boxImage.cornerW-boxImage.offsetH)+"px;'></div>";
      newHtml = "<div id='"+divId+"TopCut"+i+"' style='position:absolute;top:"+b.t+"px;left:"+curL+"px;width:"+curW+"px;height:"+b.h+"px;background:url(\""+boxImage.url+"\"); background-repeat:no-repeat;background-position:"+(-boxImage.cornerW-boxImage.offsetW)+"px "+(-boxImage.cornerW-boxImage.offsetH)+"px;'></div>";
      $('#'+divId).append(newHtml);
    }
  }
  if (tt.uncut.w > 0) { 
    var b = tt.uncut;
    for (var i=0;i<parseInt(b.w/boxImage.w+1);i++) {
      var curL = b.l + i*boxImage.w;
      var curW = Math.min((b.w-i*boxImage.w),b.w);
      curW = curW > boxImage.w ? boxImage.w : curW;
      //newHtml = "<div id='"+divId+"TopUncut' style='position:absolute;top:"+b.t+"px;left:"+b.l+"px;width:"+b.w+"px;height:"+b.h+"px;background:url(\""+boxImage.url+"\"); background-repeat:no-repeat;background-position:"+(-boxImage.cornerW-boxImage.offsetW)+"px "+(-boxImage.offsetH)+"px;'></div>";
      newHtml = "<div id='"+divId+"TopUncut"+i+"' style='position:absolute;top:"+b.t+"px;left:"+curL+"px;width:"+curW+"px;height:"+b.h+"px;background:url(\""+boxImage.url+"\"); background-repeat:no-repeat;background-position:"+(-boxImage.cornerW-boxImage.offsetW)+"px "+(-boxImage.offsetH)+"px;'></div>";
      $('#'+divId).append(newHtml);
    }
  }
  //var newHtml = "<div id='"+divId+"Top' style='position:absolute;top:0px;left:"+lt.w+"px;width:"+(w-lt.w-rt.w)+"px;height:"+boxImage.cornerH+"px;background:url(\""+boxImage.url+"\"); background-repeat:no-repeat;background-position:"+(-boxImage.cornerW-boxImage.offsetW)+"px "+(-boxImage.offsetH)+"px;'></div>";
  //$('#'+divId).append(newHtml);
  if (corners.rct) {
    rr = {  cut:{w:boxImage.cornerW,h:corners.rct-boxImage.cornerH,
                 t:boxImage.cornerH,r:0},
          uncut:{w:boxImage.cornerW,h:h-corners.rct-boxImage.cornerH,
                 t:corners.rct,r:0}};
  } else if (corners.rcb) {
    rr = {uncut:{w:boxImage.cornerW,h:h-corners.rcb-boxImage.cornerH,
                 t:boxImage.cornerH,r:0},
            cut:{w:boxImage.cornerW,h:corners.rcb-boxImage.cornerH,
                 t:corners.rcb,r:0}};
  } else { 
    var c1 = corners.tcr?0:boxImage.cornerH;
    var c2 = corners.bcr?0:boxImage.cornerH;
    rr = {cut:{w:0,h:0,t:0,r:0},
        uncut:{w:boxImage.cornerW,h:h-c1-c2,t:c1,r:0}};
  }
  if (rr.cut.h > 0) {
    var b = rr.cut;
    for (var i=0;i<parseInt(b.h/boxImage.h+1);i++) {
      var curT = b.t + i*boxImage.h;
      var curH = Math.min((b.h-i*boxImage.h),b.h);
      curH = curH > boxImage.h ? boxImage.h : curH;
      //newHtml = "<div id='"+divId+"RightCut' style='position:absolute;top:"+b.t+"px;right:"+b.r+"px;width:"+b.w+"px;height:"+b.h+"px;background:url(\""+boxImage.url+"\"); background-repeat:no-repeat;background-position:"+(-boxImage.boxW+boxImage.CornerW-boxImage.offsetW)+"px "+(-boxImage.cornerH-boxImage.offsetH)+"px;'></div>";
      newHtml = "<div id='"+divId+"RightCut"+i+"' style='position:absolute;top:"+curT+"px;right:"+b.r+"px;width:"+b.w+"px;height:"+curH+"px;background:url(\""+boxImage.url+"\"); background-repeat:no-repeat;background-position:"+(-boxImage.boxW+boxImage.CornerW-boxImage.offsetW)+"px "+(-boxImage.cornerH-boxImage.offsetH)+"px;'></div>";
      $('#'+divId).append(newHtml);
    }
  }
  if (rr.uncut.h > 0) {
    var b = rr.uncut;
    for (var i=0;i<parseInt(b.h/boxImage.h+1);i++) {
      var curT = b.t + i*boxImage.h;
      var curH = Math.min((b.h-i*boxImage.h),b.h);
      curH = curH > boxImage.h ? boxImage.h : curH;
      //newHtml = "<div id='"+divId+"RightUncut' style='position:absolute;top:"+b.t+"px;right:"+b.r+"px;width:"+b.w+"px;height:"+b.h+"px;background:url(\""+boxImage.url+"\"); background-repeat:no-repeat;background-position:"+(-boxImage.boxW-boxImage.offsetW)+"px "+(-boxImage.cornerH-boxImage.offsetH)+"px;'></div>";
      newHtml = "<div id='"+divId+"RightUncut"+i+"' style='position:absolute;top:"+curT+"px;right:"+b.r+"px;width:"+b.w+"px;height:"+curH+"px;background:url(\""+boxImage.url+"\"); background-repeat:no-repeat;background-position:"+(-boxImage.boxW-boxImage.offsetW)+"px "+(-boxImage.cornerH-boxImage.offsetH)+"px;'></div>";
      $('#'+divId).append(newHtml);
    }
  }
  //var newHtml = "<div id='"+divId+"Right' style='position:absolute;top:"+rt.h+"px;right:0px;width:"+boxImage.cornerW+"px;height:"+(h-rt.h-rb.h)+"px;background:url(\""+boxImage.url+"\"); background-repeat:no-repeat;background-position:"+(-boxImage.boxW-boxImage.offsetW)+"px "+(-boxImage.cornerH-boxImage.offsetH)+"px;'></div>";
  //$('#'+divId).append(newHtml);
  if (corners.bcl) {
    bb = {  cut:{w:corners.bcl-boxImage.cornerW,h:boxImage.cornerH,
                 b:0,l:boxImage.cornerW},
          uncut:{w:w-corners.bcl-boxImage.cornerW,h:boxImage.cornerH,
                 b:0,l:corners.bcl}};
  } else if (corners.bcr) {
    bb = {uncut:{w:w-corners.bcr-boxImage.cornerW,h:boxImage.cornerH,
                 b:0,l:boxImage.cornerW},
            cut:{w:corners.bcr-boxImage.cornerW,h:boxImage.cornerH,
                 b:0,l:corners.bcr}};
  } else {
    var c1 = corners.lcb?0:boxImage.cornerW;
    var c2 = corners.rcb?0:boxImage.cornerW;
    bb = {cut:{w:0,h:0,b:0,l:0},
        uncut:{w:w-c1-c2,h:boxImage.cornerH,b:0,l:c1}};
  }
  if (bb.cut.w > 0) {
    var b = bb.cut;
    for (var i=0;i<parseInt(b.w/boxImage.w+1);i++) {
      var curL = b.l + i*boxImage.w;
      var curW = Math.min((b.w-i*boxImage.w),b.w);
      curW = curW > boxImage.w ? boxImage.w : curW;
      //newHtml = "<div id='"+divId+"BotCut' style='position:absolute;bottom:"+b.b+"px;left:"+b.l+"px;width:"+b.w+"px;height:"+b.h+"px;background:url(\""+boxImage.url+"\"); background-repeat:no-repeat;background-position:"+(-boxImage.cornerW-boxImage.offsetW)+"px "+(-boxImage.boxH+boxImage.cornerH-boxImage.offsetH)+"px;'></div>";
      //newHtml = "<div id='"+divId+"BotCut"+i+"' style='position:absolute;bottom:"+b.b+"px;left:"+curL+"px;width:"+curW+"px;height:"+b.h+"px;background:url(\""+boxImage.url+"\"); background-repeat:no-repeat;background-position:"+(-boxImage.cornerW-boxImage.offsetW)+"px "+(-boxImage.boxH+boxImage.cornerH-boxImage.offsetH)+"px;'></div>";
      newHtml = "<div id='"+divId+"BotCut"+i+"' style='position:absolute;top:"+(h-b.b-boxImage.cornerH)+"px;left:"+curL+"px;width:"+curW+"px;height:"+b.h+"px;background:url(\""+boxImage.url+"\"); background-repeat:no-repeat;background-position:"+(-boxImage.cornerW-boxImage.offsetW)+"px "+(-boxImage.boxH+boxImage.cornerH-boxImage.offsetH)+"px;'></div>";
      $('#'+divId).append(newHtml);
    }
  }
  if (bb.uncut.w > 0) {
    var b = bb.uncut;
    for (var i=0;i<parseInt(b.w/boxImage.w+1);i++) {
      var curL = b.l + i*boxImage.w;
      var curW = Math.min((b.w-i*boxImage.w),b.w);
      curW = curW > boxImage.w ? boxImage.w : curW;
      //newHtml = "<div id='"+divId+"BotUncut' style='position:absolute;bottom:"+b.b+"px;left:"+b.l+"px;width:"+b.w+"px;height:"+b.h+"px;background:url(\""+boxImage.url+"\"); background-repeat:no-repeat;background-position:"+(-boxImage.cornerW-boxImage.offsetW)+"px "+(-boxImage.boxH-boxImage.offsetH)+"px;'></div>";
      //newHtml = "<div id='"+divId+"BotUncut"+i+"' style='position:absolute;bottom:"+b.b+"px;left:"+curL+"px;width:"+curW+"px;height:"+b.h+"px;background:url(\""+boxImage.url+"\"); background-repeat:no-repeat;background-position:"+(-boxImage.cornerW-boxImage.offsetW)+"px "+(-boxImage.boxH-boxImage.offsetH)+"px;'></div>";
      newHtml = "<div id='"+divId+"BotUncut"+i+"' style='position:absolute;top:"+(h-b.b-boxImage.cornerH)+"px;left:"+curL+"px;width:"+curW+"px;height:"+b.h+"px;background:url(\""+boxImage.url+"\"); background-repeat:no-repeat;background-position:"+(-boxImage.cornerW-boxImage.offsetW)+"px "+(-boxImage.boxH-boxImage.offsetH)+"px;'></div>";
      $('#'+divId).append(newHtml);
    }
  }
  //var newHtml = "<div id='"+divId+"Bot' style='position:absolute;bottom:0px;left:"+lb.w+"px;width:"+(w-lb.w-rb.w)+"px;height:"+boxImage.cornerH+"px;background:url(\""+boxImage.url+"\"); background-repeat:no-repeat;background-position:"+(-boxImage.cornerW-boxImage.offsetW)+"px "+(-boxImage.boxH-boxImage.offsetH)+"px;'></div>";
  //$('#'+divId).append(newHtml);
  if (corners.lct) {
    ll = {  cut:{w:boxImage.cornerW,h:corners.lct-boxImage.cornerH,
                 t:boxImage.cornerH,l:0},
          uncut:{w:boxImage.cornerW,h:h-corners.lct-boxImage.cornerH,
                 t:corners.lct,l:0}};
  } else if (corners.lcb) {
    ll = {uncut:{w:boxImage.cornerW,h:h-corners.lcb-boxImage.cornerH,
                 t:boxImage.cornerH,l:0},
            cut:{w:boxImage.cornerW,h:corners.lcb-boxImage.cornerH,
                 t:corners.rcb,l:0}};
  } else {
    var c1 = corners.tcl?0:boxImage.cornerH;
    var c2 = corners.bcl?0:boxImage.cornerH;
    ll = {cut:{w:0,h:0,t:0,r:0},
        uncut:{w:boxImage.cornerW,h:h-c1-c2,t:c1,l:0}};
  }
  if (ll.cut.w > 0) {
    var b = ll.cut;
    for (var i=0;i<parseInt(b.h/boxImage.h+1);i++) {
      var curT = b.t + i*boxImage.h;
      var curH = Math.min((b.h-i*boxImage.h),b.h);
      curH = curH > boxImage.h ? boxImage.h : curH;
      //newHtml = "<div id='"+divId+"LeftCut' style='position:absolute;top:"+b.t+"px;left:"+b.l+"px;width:"+b.w+"px;height:"+b.h+"px;background:url(\""+boxImage.url+"\"); background-repeat:no-repeat;background-position:"+(-boxImage.cornerW-boxImage.offsetW)+"px "+(-boxImage.cornerH-boxImage.offsetH)+"px;'></div>";
      newHtml = "<div id='"+divId+"LeftCut"+i+"' style='position:absolute;top:"+curT+"px;left:"+b.l+"px;width:"+b.w+"px;height:"+curH+"px;background:url(\""+boxImage.url+"\"); background-repeat:no-repeat;background-position:"+(-boxImage.cornerW-boxImage.offsetW)+"px "+(-boxImage.cornerH-boxImage.offsetH)+"px;'></div>";
      $('#'+divId).append(newHtml);
    }
  }
  if (ll.uncut.w > 0) {
    var b = ll.uncut;
    for (var i=0;i<parseInt(b.h/boxImage.h+1);i++) {
      var curT = b.t + i*boxImage.h;
      var curH = Math.min((b.h-i*boxImage.h),b.h);
      curH = curH > boxImage.h ? boxImage.h : curH;
      //newHtml = "<div id='"+divId+"LeftUncut' style='position:absolute;top:"+b.t+"px;left:"+b.l+"px;width:"+b.w+"px;height:"+b.h+"px;background:url(\""+boxImage.url+"\"); background-repeat:no-repeat;background-position:"+(-boxImage.offsetW)+"px "+(-boxImage.cornerH-boxImage.offsetH)+"px;'></div>";
      newHtml = "<div id='"+divId+"LeftUncut"+i+"' style='position:absolute;top:"+curT+"px;left:"+b.l+"px;width:"+b.w+"px;height:"+curH+"px;background:url(\""+boxImage.url+"\"); background-repeat:no-repeat;background-position:"+(-boxImage.offsetW)+"px "+(-boxImage.cornerH-boxImage.offsetH)+"px;'></div>";
      $('#'+divId).append(newHtml);
    }
  }
  //var newHtml = "<div id='"+divId+"Left' style='position:absolute;top:"+lt.h+"px;left:0px;width:"+boxImage.cornerW+"px;height:"+(h-lt.h-lb.h)+"px;background:url(\""+boxImage.url+"\"); background-repeat:no-repeat;background-position:"+(-boxImage.offsetW)+"px "+(-boxImage.cornerH-boxImage.offsetH)+"px;'></div>";
  //$('#'+divId).append(newHtml);
  if (typeof(clone) == 'undefined') {
    $('#'+divId).append("<div id='"+divId+"Inner' class='"+divId+"Inner'>"+oldHtml+"</div>");
  } else {
    $('#'+divId).append($('#'+divId+"Inner"));
  }
  //$('#'+divId+"Inner").css('background-color',$('#'+divId).css('background-color'));
  //$('#'+divId).css('background-color','transparent');
  //$('#'+divId+"Inner").css('margin-left','-5px');
}
}

vidteq._utils.prototype.undrapeCurtain = function (popName) {
  this.undrapeSheer(popName);
  //var pName = 'bgCurtain';
  //if ($("#"+pName).length == 0) { return; } 
  //var curtainDepth = $("#"+pName).data('curtainDepth');
  //if (typeof(curtainDepth[popName]) == 'undefined') { return; }
  //delete curtainDepth[popName];
  ////if (utils.isObjectEmpty(curtainDepth)) { $("#"+pName).remove(); }
  //if (utils.isObjectEmpty(curtainDepth)) { $("#"+pName).hide('slow',function () { $(this).remove(); }); }
  //else $("#"+pName).data('curtainDepth',curtainDepth);
}

vidteq._utils.prototype.undrapeSheer = function (popName) {
  var pName = 'bgCurtain';
  if ($("#"+pName).length == 0) { return; } 
  var curtainDepth = $("#"+pName).data('curtainDepth');
  if (typeof(curtainDepth[popName]) == 'undefined') { return; }
  delete curtainDepth[popName];
  //if (vidteq.utils.isObjectEmpty(curtainDepth)) { $("#"+pName).remove(); }
  if (vidteq.utils.isObjectEmpty(curtainDepth)) { $("#"+pName).hide('slow',function () { $(this).remove(); }); }
  else $("#"+pName).data('curtainDepth',curtainDepth);
}

vidteq._utils.prototype.drapeSheer = function ( popName, width, height, appendTo ) {
  appendTo = appendTo || 'body';
  var pName = 'bgCurtain';
  var bgCurtain = '<div id = "'+pName+'" class="curtain"></div>';
  if( popName == 'loader' ) {
    appendTo = '#fvtDiv'; //TBD: this as parameter
    width = '100%';
    height = '100%';
    bgCurtain = '<div id = "'+pName+'" class="curtain '+pName+'-loader">'+
                    '<img src="'+vidteq.imgPath.ajaxLoader+'" alt="Loading..." style="position:absolute;" >'+
                  '</div>';
  }
  if ($("#"+pName).length != 0) { 
    var curtainDepth = $("#"+pName).data('curtainDepth');
    curtainDepth[popName] = 1;
    $("#"+pName).data('curtainDepth',curtainDepth);
    return;
  }
  var con = $(bgCurtain).appendTo( appendTo );
  var curtainDepth = {};
  curtainDepth[popName] = 1;
  con.data('curtainDepth',curtainDepth);
  //con.height($(window).height());
  //con.width($(window).width());
  //con.css({height:'100%',width:'100%'});
  //con.css({height:$(document).height()+'px',width:$(document).width()+'px'});
  if (self.navigator.userAgent.match(/MSIE\s[7]/)){
    // Screen height does not seem to be right to thing to do
    // However we need be careful with legacy before we change
    // 
    //con.css({height:($(document).height()-21)+'px',width:$(document).width()+'px'});
    width =  width || '100%';
    height = height || '100%';
  } else {
    //screen height giving scrolls, safer bet is to provide my own height and width. If not present then fallback to legacy.
    //width = width || (screen.width+'px');
    //height = height || (screen.height+'px');
        
    //Lets take risk and use document instead of screen
    //If required put condition for script mode alone if((vidteq.vidteq || vidteq).scriptBased) {} 
    width = width || ($(document).width()+'px');
    height = height || ($(document).height()+'px');    
  }
  con.css({height:height,width:width});
}

vidteq._utils.prototype.buildDiveInArray = function (dIRef,cI,sI,finalPoint) {
  var dI = {};
  var returnPoint = parseInt(finalPoint/2);
  for(var i=0;i<dIRef[cI];i++) {
    if (sI+i <= returnPoint) {
      if (!dI.pre) { dI.pre = []; }
      dI['pre'].push(sI+i);
    }
  }
  if ((sI + dIRef[cI]-1) < returnPoint) { 
    dI.dI = this.buildDiveInArray (dIRef,(cI+1),(sI+dIRef[cI]),finalPoint);
  }
  for(var i=dIRef[cI]-1;i>-1;i--) {
    if (finalPoint-i-sI > returnPoint ) {
      if (!dI.post) { dI.post = []; }
      dI['post'].push(finalPoint-i-sI);
    }
  }
  return dI;
}

vidteq._utils.prototype.buildDiveIn = function (dIRef,seedArray,attr,createDITopHtml,createOneHtml) {
  var fullHtml = '';
  var hintHtml = '';
  if (dIRef.pre) {
    for (var i in dIRef.pre) {
      attr.lId = dIRef.pre[i];
      attr.begin = false;
      attr.end = false;
      if (i==0) { attr.begin = true; }
      var allHtml = createOneHtml(attr,seedArray[dIRef.pre[i]]);
      hintHtml += allHtml.hintHtml;
      fullHtml += allHtml.fullHtml;
    }
  }
  var oldVisibility = attr.visible;
  attr.visible = false;
  attr.depth++;
  if (dIRef.dI) {
    var dIHtml = this.buildDiveIn(dIRef.dI,seedArray,attr,createDITopHtml,createOneHtml);
    var dITopHtml = createDITopHtml(dIRef,attr,dIHtml);
    hintHtml += dITopHtml.hintHtml;
    fullHtml += dITopHtml.fullHtml;
  }
  attr.visible = oldVisibility;
  attr.depth--;
  if (dIRef.post) {
    for (var i in dIRef.post) {
      attr.lId = dIRef.post[i];
      attr.begin = false;
      attr.end = false;
      if (i==dIRef.post.length-1) { attr.end = true; }
      var allHtml = createOneHtml(attr,seedArray[dIRef.post[i]]);
      hintHtml += allHtml.hintHtml;
      fullHtml += allHtml.fullHtml;
    }
  }
  return {hintHtml:hintHtml,fullHtml:fullHtml};
}

vidteq._utils.prototype.getPopupParams = function(shrinkFactor) {
  var wh = parseInt($(window).height())
  ,ww = parseInt($(window).width())
  ,height = parseInt(wh/shrinkFactor)
  ,width = parseInt(ww/shrinkFactor)
  ,left = 0
  ,top = 320
  ,s = {
    wh: wh
    ,ww: ww
    ,height: height
    ,width: width
    ,left: left
    ,top: top
  }  
  // this ends stright calculations ,now start crooked calculations
  ,a = this.returnBrowserHeightWidth()
  //css3 selectors not supported in IE7,8, cannot use $('body > div:first-of-type')
  ,el_body_firstDiv = $('body > div') //earlier: $('#vidteq')
  ;
  //TBD: if we can use this
  //wh = ( vidteq.gui && vidteq.gui.embed ? a.height : ( $('#dynamicDiv').length>0? $('#dynamicDiv')[0].offsetHeight : "100%" ) ); 
  //ww = ( vidteq.gui && vidteq.gui.embed ? $('body')[0].offsetWidth : ( $('#dynamicDiv').length>0? $('#dynamicDiv')[0].offsetWidth : "100%" ) );
  
  wh = ( typeof vidteq.gui != 'undefined' && typeof vidteq.gui.embed !='undefined' )?
    a.height : (
      $('#dynamicDiv').length?$('#dynamicDiv')[0].offsetHeight:
      ($('#main').length?$('#main').height():600)
    );
  
  ww = ( typeof vidteq.gui != 'undefined' && typeof vidteq.gui.embed !='undefined' )?
    $('body')[0].offsetWidth : (
      $('#dynamicDiv').length?$('#dynamicDiv')[0].offsetWidth :
      ($('#main').length?$('#main').width():300)
    );
    
  if((vidteq.vidteq || vidteq).scriptBased) {
    if( el_body_firstDiv[0] ) {
      wh = el_body_firstDiv.height();
      ww = el_body_firstDiv.width();
    }
  }
  //s.top = ( typeof vidteq.gui.embed != 'undefined' )? parseInt((wh-s.height)/2) : 320;
  s.top = parseInt((wh-s.height)/2);
  s.height = parseInt(wh/shrinkFactor);
  s.width = parseInt(ww/shrinkFactor);
  
  if(typeof(vidteq.aD) != 'undefined' && (vidteq.aD.q == 'blocate' || vidteq.aD.q == 'locatestores')) {
    s.height = 450; s.width = 650;
  }
  
  if(typeof($('#main')[0])!=="undefined") {
    s.left = $('#main')[0].offsetLeft;  
  }
  s.left += parseInt((ww-s.width)/2);
  
  return s;
}

vidteq._utils.prototype.attachCloseDiv = function(divId,conInfo) {
  var closeFuncLocal = function () { return true; }
  if (typeof(conInfo) != 'undefined' && conInfo.closeFunc) { closeFuncLocal = conInfo.closeFunc; }
  var closeClass = 'close1';
  if (typeof(conInfo) != 'undefined' && conInfo.closeClass) { closeClass = conInfo.closeClass; }
  var closeDiv = $("<div id='"+divId+"Close' class='"+closeClass+"' title='Close'></div>").appendTo($('#'+divId));
  var that = $('#'+divId);
  var closeMe = function () {
    if (!closeFuncLocal()) { return false; }
    var divId = that[0].id;
    vidteq.utils.undrapeCurtain(divId);  // TBD context
    that.remove(); 
  };
  closeDiv.click(closeMe);
}

vidteq._utils.prototype.selectText = function(element) {
  //Reference: http://stackoverflow.com/questions/985272/jquery-selecting-text-in-an-element-akin-to-highlighting-with-your-mouse
  var doc = document
  ,range ,selection
  ;    
  if( doc.body.createTextRange ) { //IE
    range = doc.body.createTextRange();
    range.moveToElementText(element);
    range.select();
  }else if( window.getSelection ) { //all others
    selection = window.getSelection();        
    range = doc.createRange();
    range.selectNodeContents(element);
    selection.removeAllRanges();
    selection.addRange(range);
  }
}

vidteq._utils.prototype.createPopup = function(conInfo,popInfo) {
  var animateTime = typeof popInfo.animateTime !== "undefined"? popInfo.animateTime : 1000;
  var s = this.getPopupParams(popInfo.factor); 
  var pName = popInfo.name;
  var pClasses = pName + ( popInfo.type? ' ' + popInfo.type : '' );
  if ($("#"+pName).length) { $("#"+pName).remove(); }
  //may have some side effects origina z-index:80000
  var con = $("<div id='"+pName+"' class='"+pClasses+"' style='z-index:9985;position:absolute;left:"+s.left+"px;top:"+s.top+"px;padding:10px;background-color:transparent;'></div>").appendTo('body');
  con.html(conInfo.html);
  if (parseInt(con.height()) > s.height && conInfo.overflowDiv) {
    $('#'+conInfo.overflowDiv).css('overflow','auto');
    //$('#'+conInfo.overflowDiv).height((s.height-parseInt($('#'+conInfo.headerDiv).outerHeight())-20-conInfo.margins)+'px');
    $('#'+conInfo.overflowDiv).height((s.height-parseInt($('#'+conInfo.headerDiv).outerHeight())-20-$('#hrSeparator').outerHeight()-conInfo.margins)+'px');
    con.css('height',s.height+'px'); // just formalize
  } else {
    con.css('height',con.height()); // just formalize
  }
  con.css('width',con.width());  // just formalize
  //TBD: configurable
  //var boxImage = { url:vidteq.imgPath.refBox3, cornerW:0, cornerH:0, boxW:510, boxH:378, offsetW:0, offsetH:0 };
  //this.boxify(boxImage,pName,{lt:0,rt:0,lb:0,rb:0});
  var boxImage = { url:vidteq.imgPath.refBox3, cornerW:10, cornerH:10, boxW:510, boxH:378, offsetW:0, offsetH:0 };
  this.boxify(boxImage,pName,{lt:1,rt:1,lb:1,rb:1});
  if (conInfo.funcList) {
    for (var i in conInfo.funcList) { 
      if (conInfo.submitId && i == conInfo.submitId) { continue; }
      $("#"+i).click(conInfo.funcList[i]); 
    }
  }

  if (!popInfo.force) { this.attachCloseDiv(pName); }
  if (conInfo.submitId) {
    var submitFunc;
    if (conInfo.funcList && conInfo.funcList[conInfo.submitId]) {
      submitFunc = conInfo.funcList[conInfo.submitId];
    } else {
      submitFunc = conInfo.submitFunc;
    }
    $("#"+conInfo.submitId)[0].onclick = null;
    $("#"+conInfo.submitId).click(function () {
      if (!submitFunc()) { return false; }
      vidteq.utils.undrapeCurtain(pName);  // TBD context 
      $('#'+pName).remove();
    });
  } 
  s.rWidth = parseInt($("#"+pName).outerWidth());
  s.rHeight = parseInt($("#"+pName).outerHeight());
  $("#"+pName).css('margin',"auto");
  $("#"+pName).animate({
    left:parseInt(s.left+(s.width-s.rWidth)/2)+'px'
    //,top:parseInt(s.top+(s.height-s.rHeight)/2)+"px"
    ,top:"0px"
    ,bottom:"0px"
  },animateTime);  
}

vidteq._utils.prototype.createPopupGeneric = function (conInfo,popInfo) { 
  var s = this.getPopupParams(popInfo.factor); 
  var pName = popInfo.name;
  var pClasses = pName + ( popInfo.type? ' ' + popInfo.type : '' );
  if ($("#"+pName).length) { 
    if (popInfo.returnIfPresent) { return; }
    $("#"+pName).remove(); 
  }
  var con = $("<div id='"+pName+"' class='"+pClasses+"'> </div>").appendTo('body');
  //may have some side effects origina z-index:80000
  var constyle = {
    'z-index':9985,
    position:'absolute',
    left:s.left+"px",
    top:s.top+"px",
    padding:'10px',
    'background-color':'transparent'
  }
  if (popInfo.startStyle) { conStyle = popInfo.startStyle; }
  con.css(constyle);
  if (conInfo.html) { con.html(conInfo.html);}
  if (conInfo.div) { con.append(conInfo.div); }
  if (conInfo.overflowDiv && parseInt(con.height()) > s.height) {
    $('#'+conInfo.overflowDiv).css('overflow','auto');
    $('#'+conInfo.overflowDiv).height((s.height-parseInt($('#'+conInfo.headerDiv).outerHeight())-10-conInfo.margins)+'px');
    con.css('height',s.height+'px'); // just formalize
  } else {
    con.css('height',con.height()); // just formalize
  }
  con.css('width',con.width());  // just formalize
  var boxImage = { url:vidteq.imgPath.refBox3, cornerW:10, cornerH:10, boxW:510, boxH:378, offsetW:0, offsetH:0 };
  if (popInfo.boxImage) { boxImage = popInfo.boxImage; }
  vidteq.utils.boxify(boxImage,pName,{lt:1,rt:1,lb:1,rb:1});
  //if (!popInfo.force) { attachCloseDiv(pName,conInfo.closeFunc); }
  if (!popInfo.force) { this.attachCloseDiv(pName,conInfo); }
  if (conInfo.submitId) {
    var submitFunc = conInfo.submitFunc;
    $("#"+conInfo.submitId)[0].onclick = null;
    $("#"+conInfo.submitId).click(function () {
      if (!submitFunc()) { return false; }
      vidteq.utils.undrapeCurtain(pName);
      $('#'+pName).remove();
    });
  } 
  s.rWidth = parseInt($("#"+pName).outerWidth());
  s.rHeight = parseInt($("#"+pName).outerHeight());
  var animateStyle = {left:parseInt(s.left+(s.width-s.rWidth)/2)+'px',top:parseInt(s.top+(s.height-s.rHeight)/2)+"px"};
  if (popInfo.animateStyle) { animateStyle = popInfo.animateStyle; }
  var animateTime = 1000;
  if (popInfo.animateTime) { animateTime = popInfo.animateTime; }
  if (popInfo.handheld) { 
    $("#"+pName).css('left',parseInt(s.left+(s.width-s.rWidth)/2)+'px'); 
    $("#"+pName).show(1000);
  } else $("#"+pName).animate(animateStyle,animateTime);
  $("#"+pName).data('animateStyle',animateStyle); // Just for reference
}

vidteq._utils.prototype.checkEmailId = function (inStr,dontAlert) {
  var str = this.trim(inStr);
  var at="@"
  var dot="."
  var lat=str.indexOf(at)
  var lstr=str.length
  var ldot=str.indexOf(dot)
  dontAlert = dontAlert || 0;
  if (str.indexOf(at)==-1){
    var msg = "Invalid E-mail ID";
    if (dontAlert) { return msg; }
    alert(msg);
    return false;
  }
  if (str.indexOf(at)==-1 || str.indexOf(at)==0 || str.indexOf(at)==lstr){
    var msg = "Invalid E-mail ID";
    if (dontAlert) { return msg; }
    alert(msg);
    return false;
  }
  if (str.indexOf(dot)==-1 || str.indexOf(dot)==0 || str.indexOf(dot)==lstr){
    var msg = "Invalid E-mail ID";
    if (dontAlert) { return msg; }
    alert(msg);
    return false;
  }
  if (str.indexOf(at,(lat+1))!=-1){
    var msg = "Invalid E-mail ID";
    if (dontAlert) { return msg; }
    alert(msg);
    return false;
  }
  if (str.substring(lat-1,lat)==dot || str.substring(lat+1,lat+2)==dot){
    var msg = "Invalid E-mail ID";
    if (dontAlert) { return msg; }
    alert(msg);
    return false;
  }
  if (str.indexOf(dot,(lat+2))==-1){
    var msg = "Invalid E-mail ID";
    if (dontAlert) { return msg; }
    alert(msg);
    return false;
  }
  if (str.indexOf(" ")!=-1){
    var msg = "Invalid E-mail ID";
    if (dontAlert) { return msg; }
    alert(msg);
    return false;
  }
  //if (str == ioAreaObj.inputValEmail)  
  if (str == 'id@company.com') { 
    var msg = "Invalid E-mail ID";
    if (dontAlert) { return msg; }
    alert(msg);
    return false;
  }
  if (dontAlert) { return ""; }
  return true
}

vidteq._utils.prototype.checkPhoneNumber = function (inStr,m,dontAlert) {
  dontAlert = dontAlert || 0;
  var str = this.trim(inStr);
  var phoneMinLimit = this.getSafe('vidteq.gui.phoneNumMinLimit') || 6;
  var phoneMaxLimit = this.getSafe('vidteq.gui.phoneNumMaxLimit') || 15;
  if (str.length < phoneMinLimit || 
       str.length > phoneMaxLimit || 
       !str.match(/^[0-9]*$/)) {
    var msg = "Please enter a valid mobile number";
    if (dontAlert) { return msg; }
    alert(msg);
    return false;
  }
  if (typeof(m) != 'undefined' && (str.length!=10 || !str.match(/^[987]\d{9}/))) {    
    if(m == 'sideBarUI') {
      if(str.match(/^[0-1]{10}/) && str.length==10) {
        return '';
      }
    }
    var msg = "Please enter a valid mobile number";
    if (dontAlert) { return msg; }
    alert(msg);
    return false;
  }
  if (dontAlert) { return ''; }
  return true;
}

vidteq._utils.prototype.attachHiddenInputField = function (elementToAttach, name, doc, value) {
  if (!doc) {
    doc = document;
  }
  var obj = this.createElem("input", doc);
  obj.type = "hidden";
  obj.name = name;
  obj.value = value;
  elementToAttach.appendChild(obj);
  return obj;
}

vidteq._utils.prototype.getIFrameDocument = function (name) {
  var iframe = frames[name];  
  var doc = null;
  if (iframe.contentDocument) {
    doc = iframe.contentDocument; 
  } else if (iframe.contentWindow) {
    doc = iframe.contentWindow.document;
  } else if (iframe.document) {
    doc = iframe.document;
  } else {
    throw "Document not initialised";
  }
  return doc;
}

vidteq._utils.prototype.attachForm = function(href, elementToAttach, doc, method) {
  var formObj = this.createElem("form", doc);
  formObj.method = method;
  formObj.action = href;
  elementToAttach.appendChild(formObj);
  return formObj;
}

// note
// show Sending prompt is also similar to below but has timeout
// it is used in sped - again there are two variants in showSending
vidteq._utils.prototype.showLoadingPrompt = function(seedMsg) {  
  seedMsg = seedMsg || 'Loading ....';
  var s = vidteq.utils.getPopupParams(1.7); 
  var pName = 'divLoading';
  var bgColor = ( vidteq.vidteq || {} ).bgColor || vidteq.aD.config.bgColor;
  if ($("#"+pName).length) { $("#"+pName).remove(); }
  //this.con = $("<div id='"+pName+"' style='z-index:80001;position:absolute;left:"+s.left+"px;top:"+s.top+"px;height:50px;width:280px;padding:10px;background-color:transparent;'><div id='divLoadingText' style='text-align:center;background-color:white;width:280px;height:50px;margin:0;padding:0;'></div></div>").appendTo('body');
  //may have some side effects origina z-index:80001
  this.con = $("<div id='"+pName+"' class='"+pName+"' style='z-index:990;position:absolute;left:"+s.left+"px;top:"+s.top+"px;height:50px;width:280px;padding:10px;background-color:transparent;'><div id='"+pName+"Text' class='"+pName+"Text' style='text-align:center;background-color:"+bgColor+";width:280px;height:50px;margin:0;padding:0;'></div></div>").appendTo('body');
  this.conText = $('#'+pName+'Text'); // first time
  var that = this;  
  this.putMessage = function (msg) {
    if(typeof(vidteq.gui) != 'undefined' 
          && typeof(vidteq.gui.sideBarUI) != 'undefined' 
          && vidteq.gui.sideBarUI) {      
      that.conText.html("<p style='margin:0;padding:0;padding-top:15px;color:white;font-size:14px; text-align:center'>"+msg+"</p>");
    } else {
      that.conText.html("<p style='margin:0;padding:0;padding-top:15px;font-color:black;font-size:14px; text-align:center'>"+msg+"</p>"); 
    }    
  }
  //this.putMessage('Loading ....');
  this.putMessage(seedMsg);
  var boxImage = { url:vidteq.imgPath.refBox3, cornerW:10, cornerH:10, boxW:510, boxH:378, offsetW:0, offsetH:0 };
  vidteq.utils.boxify(boxImage,pName,{lt:1,rt:1,lb:1,rb:1});
  this.conText = $('#'+pName+'Text'); // readjust

  this.animateAndKill = function (seconds) {
    setTimeout(function () { 
      that.con.hide('slow',function () { that.con.remove(); }); 
    },seconds * 1000);
  }

  s.rWidth = parseInt($("#"+pName).outerWidth());
  s.rHeight = parseInt($("#"+pName).outerHeight());
  //$("#"+pName).animate({left:parseInt(s.left+(s.width-s.rWidth)/2)+'px',top:parseInt(s.top+(s.height-s.rHeight)/2)+"px"},1000);
  $("#"+pName).css('left',parseInt(s.left+(s.width-s.rWidth)/2)+'px');
  $("#"+pName).css('top',parseInt(s.top+(s.height-s.rHeight)/2)+"px");
  $("#"+pName).animate({left:parseInt(s.ww-s.rWidth-100)+'px',top:'100px'},1000);
}

vidteq._utils.prototype.boldify = function(str,withStr) {
  if (typeof(withStr) == 'undefined') { return str; }
  if (this.trim(withStr) == '') { return str; }
  var pat = new RegExp(withStr,"ig");
  var ret;
  if(self.navigator.appName.match(/Microsoft/i)) {
    ret=str;
  } else {
    ret=(str.match(pat))?this.realBoldify(str,pat,withStr):str;
  }
  return ret;
}

vidteq._utils.prototype.realBoldify = function(me,pat,withStr) {
  if(me.match(/\(|\)/gi)) {
    me=me.replace(/\(/gi," ")
    me=me.replace(/\)/gi," ")
  }
  var a=me.split(pat);
  var l=a.length;
  var n="";
  var s=withStr.substring(0,1);
  var t=withStr.substring(1);
  withStr=s.toUpperCase()+t.toLowerCase();
  for(var i=0;i<l;i++) {
    n+=a[i];
    if(i!=(l-1)) {
      if(a[i].match(/[^\s+]$/)) {
        withStr=withStr.toLowerCase();
      }  
      n+="<b style='color:red;'>"+withStr+"</b>";
      //n+=a[i+1];
    }  
  }
  return n;    
}

vidteq._utils.prototype.showHideDecider = function(id,validIndexes,idsAffected) {
  var ind=$('#'+id)[0].selectedIndex;
  for(var i in validIndexes) {
    if(validIndexes[i]==ind) {
      for(var j in idsAffected) { $('#'+idsAffected[j]).show(); }
      return 0;
    }
  }
  for(var j in idsAffected) { $('#'+idsAffected[j]).hide(); }
}

vidteq._utils.prototype.showHide = function(arr,yesNo) {
  for(i in arr) {
    if(yesNo) { $('#'+arr[i]).show('fast'); }
    else { $('#'+arr[i]).hide('fast'); }
  }
}

vidteq._utils.prototype.waitAndFire = function(checkFunc,fireFunc,failFunc,opt) {
  var maxIter = 10;
  var curIter = 0;
  var timeIter = 1000;
  if (opt && typeof(opt.timeIter)) { timeIter = opt.timeIter; }
  if (opt && typeof(opt.maxIter)) { maxIter = opt.maxIter; }
  var timer;
  var runFunc;
  var that = this;
  runFunc = function () {
    if (checkFunc()) {
      fireFunc();
      $(that).remove();
      return;
    }
    if (curIter > maxIter) { 
      if (typeof(failFunc) != 'undefined') { failFunc(); }
      $(that).remove(); 
      return; 
    }
    curIter++; 
    timer = setTimeout(runFunc,timeIter);
  }
  runFunc();
}

vidteq._utils.prototype.executeAllFunc=function (funcArray) {
  for (var i in funcArray) {(funcArray[i])();}
}

/// these are credentials functions 

vidteq._utils.prototype.keyCountTimer = function (keyDom,counterDom) {
  if (!$('#'+keyDom).length || ! $('#'+counterDom).length) { return }
  if ($('#'+counterDom).data('vanishTimer')) {
    clearTimeout($('#'+counterDom).data('vanishTimer'));
  }
  $('#'+counterDom).text($('#'+keyDom).val().length);
  var localDom = counterDom;
  $('#'+counterDom).data('vanishTimer',setTimeout(function () { $('#'+localDom).text(''); },4000));
}

vidteq._utils.prototype.dotifyWords = function (str,chars){
  var refLength = parseInt(chars);
  if (str.length <= refLength) return str;
  var wordA = str.split(/ /);
  var strLength = 0;
  var headIdx = 0;
  var tailIdx = wordA.length-1;
  var headA = [];
  var tailA = [];
  while (strLength < refLength) {
    strLength += wordA[headIdx].length;
    if (strLength > refLength) { break; }
    headA.push(wordA[headIdx++]);
    if (headIdx > tailIdx) { break; }
    strLength += wordA[tailIdx].length;
    if (strLength > refLength) { break; }
    tailA.push(wordA[tailIdx--]);
    if (headIdx > tailIdx) { break; }
  }
  var outStr = headA.join(' ')+' ... '+tailA.join(' ');
  return outStr;
}

vidteq._utils.prototype.dotify = function (str,chars){
  if (str.length <= parseInt(chars)) return str;
  var endChars = (parseInt(chars) - 4 )/2;
  var outStr = str.substring(0,endChars)+".."+str.substring(str.length,str.length-endChars);
  return outStr;
}

vidteq._utils.prototype.lineBreaker = function (str,word){
  //var str = "sri durga nivas, near ayyapa temple, kunjathbail, mangalore 575015 Ph:2342532423 Website : racdvcds";
  //utils.lineBreaker(str,3);
  //if(str.length <= parseInt(word)) return str;
  ////var sum =0;
  //var s1 = '';
  //var words = str.split(/ /);
  //$.each(words, function(i, v) {
  //  console.log(i);
  //  console.log(v);
  //  if(v.match(/Ph|Website/i)) {
  //    s1 += "<br />";  
  //  }
  //  s1 += v + ' ';
  //  if(v.match(/,/i)) {
  //    s1 += "<br />";
  //  }
  //  //if ($.trim(v) !== '') {sum++;}
  //  //s1 += v;
  //  //if(v != '' && i > parseInt(word)) {
  //  //  s1 += ",<br />";
  //  //} else if(v != '' && i <= parseInt(word)) {
  //  //  s1 += " ";
  //  //}
  //});
  //console.log(sum);
  //console.log(s1);
  ////var endChars = (parseInt(chars) - 4 )/2;
  ////var outStr = str.substring(0,endChars)+".."+str.substring(str.length,str.length-endChars);
  ////return outStr;
}

vidteq._utils.prototype.getHandheldWAndH = function() {
  var w = 320;
  var h = 240;
  if (vidteq.gui.embed && vidteq.aD.handheldEnabled ){ 
     var maxw=(vidteq.gui.embed)?vidteq.gui.embed.vidWidth:480;
     maxw = parseInt(maxw);
     var minw = 128;
     var input = vidteq.utils.getScreenWidth(); // TBD context needed
     if (input < maxw && input> minw) {
       w=input;
     } else if(input < minw){
       w=minw;
     } else if(input >maxw){
       w=maxw;
     }

     var maxh=(vidteq.gui.embed)?vidteq.gui.embed.vidHeight:350;
     maxh = parseInt(maxh);
     var minh = 100;
     var input = vidteq.utils.getScreenHeight()/2;  // TBD context is problem
    if(input < maxh && input > minh){
      h=input;
    } else if(input < minh){
      h=minh;
    } else if(input >maxh){
      h=maxh;
    }
  }
  return {w:w,h:h};
}

vidteq._utils.prototype.getScreenWidth = function() {
  xWidth = null;
  if(window.screen != null) xWidth = window.screen.availWidth;
  if(window.innerWidth != null && xWidth > window.innerWidth) 
    xWidth = window.innerWidth;
  if(document.body != null && xWidth > document.body.clientWidth )
    xWidth = document.body.clientWidth;
  return xWidth;
}

vidteq._utils.prototype.getScreenHeight = function() {
  xHeight = null;
  //if(window.screen != null)
  // xHeight = window.screen.availHeight;
  if(window.innerHeight != null)
    xHeight =   window.innerHeight;
  return xHeight;
}

vidteq._utils.prototype.checkError=function (response,msgObj,noAlert) {
  if (response.error) {
    if (msgObj && msgObj.messageText) {
      msgObj.messageText('Error Found ...'+response.error);
    }
    if (!noAlert) {
      alert ("Error found: "+response.error);
    }
    return true;
  }
  return false
}

vidteq._utils.prototype.inArray = function(arrayObj,comparer) {
  var arrayObj = arrayObj || [];
  var i, l = arrayObj.length;
  for (i = 0; i < l; i++) {
    if (arrayObj[i] === comparer) return i;
  }
  return -1;
}

vidteq._utils.prototype.pushIfNotExist = function(arrayObj,comparer) {
  var arrayObj = arrayObj || [];
  if (0 > this.inArray(arrayObj,comparer)) {
    arrayObj.push(comparer);
  }
}

vidteq._utils.prototype.spliceIfExist = function(arrayObj,comparer) {
  var arrayObj = arrayObj || [];
  var index = this.inArray(arrayObj,comparer);
  //console.log("spliced index is: " + index + "Element: " + comparer);
  if (-1 < index) {
    arrayObj.splice(index,1);
  }
}

vidteq._utils.prototype.defined = function(str) {
  var strA = str.toString().split(/\./);
  // TBD
}

vidteq._utils.prototype.getSafe = function(str,obj) {
  var strA = str.toString().split(/\./);
  if (!strA.length) { return null; }
  var obj = obj || window;
  return this.getSafeInner(strA,obj,{});
}

vidteq._utils.prototype.getSafeInner = function(keys,obj,opt) {
  var opt = opt || {};
  if (!opt.stopper) { opt.stopper = -1; }
  opt.stopper = opt.stopper++;
  if (opt.stopper > 10) { return null; }
  if (!('curIdx' in opt)) { opt.curIdx = 0; }
  if (!keys[opt.curIdx]) { return null; }
  if (!obj) { return null; }
  if (typeof(obj) != 'object') { return null; }
  if (!Object.keys(obj).length) { return null; }
  if (!(keys[opt.curIdx] in obj)) { return null; }
  var newObj = obj[keys[opt.curIdx]];
  opt.curIdx++;
  if (keys.length == opt.curIdx) { return newObj; }
  return this.getSafeInner(keys,newObj,opt);
}

vidteq._utils.prototype.getSafeTrim = function(str) {
  return this.trim(this.getSafe(str));
}

vidteq._utils.prototype.parseObject = function(obj,opt) {
  for (var child in obj) {
    if(obj.hasOwnProperty(child)) {
      this.strChildCmp(child,obj,opt);
      if (typeof obj[child] === 'object') {
        this.parseObject(obj[child],opt);
      }
    }
  }      
}

vidteq._utils.prototype.strChildCmp = function(child,obj,opt) {
  var str = opt.str || '';
  var pattern = opt.pattern || '';
  var rPattern = opt.rPattern || '';
  var mPattern = opt.mPattern || '';
  if(child == str) {
    if(obj[child].toString().match(pattern)){
      obj[child] = obj[child].toString().replace(rPattern,mPattern);
    }
  }
}

// may be this is temporary
vidteq._utils.prototype.fillBrowserType = function(ctx) {
  ctx.isChrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
  ctx.isIe = vidteq.utils.getIEVer(); // Wrong to use this TBD fix later
  if (ctx.isIe) { 
    ctx.ieVer = ((ctx.isIe).toString().split(/\./))[0];
  }
}

vidteq._utils.prototype.getIEVer = function() {
  var rv = false;
  if (navigator.appName == 'Microsoft Internet Explorer') {
    var ua = navigator.userAgent;
    var re  = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
    if (re.exec(ua) != null) {
      rv = parseFloat( RegExp.$1 );
    }
  } else if (navigator.appName == 'Netscape') {
    var ua = navigator.userAgent;
    var re  = new RegExp("Trident/.*rv:([0-9]{1,}[\.0-9]{0,})");
    if (re.exec(ua) != null) {
      rv = parseFloat( RegExp.$1 );
    }
  }
  return rv;
}

vidteq._utils.prototype.ddToMeters = function(dd) {
  var meters = 6378137.0* Math.PI*dd/180.0;
  return meters;
}
vidteq._utils.prototype.metersToDd = function(meters) {
  var dd = 180.0*meters/(6378137.0* Math.PI);
  return dd;
}

vidteq._utils.prototype.stringifyDist = function (dist) {
  if (dist < 10) {
    dist = '< 10 Meters';
  } else if (dist < 1000) {
    dist = parseInt(dist) + ' Meters';
  } else {
    dist = (dist/1000).toFixed(2) + ' Kms';
  }
  return dist;
}

vidteq._utils.prototype.getDist = function (d1,d2,pretty) {
  var dist = this.ddToMeters(Math.sqrt(
    (d1.lon-d2.lon)*(d1.lon-d2.lon)+
    (d1.lat-d2.lat)*(d1.lat-d2.lat)
  ));
  if (pretty) {
    dist = dist.toFixed(2);
  }
  return dist;
}

vidteq._utils.prototype.getAgeOf = function (ts,opt) {
  // TBD handle if ts is non time, say integer, say date etc
  var curDate = new Date();
  var diff = parseInt(curDate.getTime()) - parseInt(ts.getTime());
  if (diff < 0 && opt && !opt.negativeOk) { 
    console.log("time is negative why ?"); 
    diff = 0; 
  } // TBD negative time handling is not perfected
  if (opt && opt.pretty) {} else {
    return diff;
  }
  var negative = false;
  if (diff < 0) { negative = true; }
  //var days = parseInt(diff / (24*60*60*1000));
  var days = negative ? 
               -Math.ceil(diff / (24*60*60*1000)) :
               Math.floor(diff / (24*60*60*1000));
  diff = negative ? 
           diff + days * (24*60*60*1000):
           diff - days * (24*60*60*1000);
  //diff =  diff - days * (24*60*60*1000);
  //var hours = parseInt(diff / (60*60*1000));
  var hours = negative ? 
                -Math.ceil(diff / (60*60*1000)):
                Math.floor(diff / (60*60*1000));
  diff = negative ? 
           diff + hours * (60*60*1000) :
           diff - hours * (60*60*1000);
  //diff = diff - hours * (60*60*1000);
  //var minutes = parseInt(diff / (60*1000));
  var minutes = negative ?
                  -Math.ceil(diff / (60*1000)):
                  Math.floor(diff / (60*1000));
  diff = negative ? 
           diff + minutes * (60*1000):
           diff - minutes * (60*1000);
  //diff = diff - minutes * (60*1000);
  //var seconds = parseInt(diff/1000);
  var seconds = negative ? 
                  -Math.ceil(diff/1000) :
                  Math.floor(diff/1000);
  if (opt && opt.verbose) {
    var ret = "";
    if (days) { ret += days+" days"; }
    if (ret != '') { ret += ", "; } 
    if (hours) { ret += hours+" hours"; }
    if (ret != '') { ret += ", "; } 
    if (minutes) { ret += minutes+" minutes"; }
    if (ret != '') { ret += ", "; } 
    if (seconds) { ret += seconds+" seconds"; }
    if (ret != '') { ret += " ago"; }
    //ret = days+" days, "+hours+" hours, "+minutes+" minutes, "+diff+" seconds";
    return ret;
  } else {
    var ret = "";
    if (days) { ret += days; }
    if (ret != '') { ret += "-"; } 
    if (hours < 10) { ret += '0'+hours; } else { ret += hours; }
    ret += ':';
    if (minutes < 10) { ret += '0'+minutes; } else { ret += minutes; }
    ret += ':';
    if (seconds < 10) { ret += '0'+seconds; } else { ret += seconds; }
    if (negative) { ret += '(E)'; }
    return ret;
  }
}

vidteq._utils.prototype.loadScript = function(info,callback) {
  var checkFunc = function () {
    var done = true;
    for (var i in info) {
      if (info[i].checkObj && 
          (eval('typeof('+info[i].checkObj+')') != 'undefined')) { } else {
        done = false;
      }
    }
    return done;
  };
  if (checkFunc()) { 
    if (callback) { callback(); }
    return;
  }
  var fireFunc = function () {
    for (var i in sTags) {
      sTags[i].remove();
    }
    if (callback) { callback(); }
  };
  var sTags = [];
  for (var i in info) {
    sTags.push($('<script/>').attr('src',info[i].url).appendTo('head'));
  }
  var t = new vidteq._utils.prototype.waitAndFire(
    checkFunc
    ,fireFunc
    ,undefined
    ,{maxIter:500}
  );
}

vidteq._utils.prototype.triggerNextOneMonitor = function (opt) {
  if (!opt.consoleStore) { return; }
  var objA = opt.consoleStore;
  delete opt.consoleStore;
  this.triggerOneMonitor(objA,opt);
}

vidteq._utils.prototype.triggerOneMonitor = function (objA,opt) {
  if (opt.ajaxActive) { 
    if (!('consoleStore' in opt)) { 
      opt.consoleStore = [];
    }
    for (var i in objA) { 
      opt.consoleStore.push(objA[i]);
    }
    // Make sure consoleStore does not grow beyond some max size TBD
    while (opt.consoleStore.length > 10) {
      opt.consoleStore.shift();
    };
  } else {
    opt.ajaxActive = new Date();
    var strA = [];
    for (var i in objA) {
      strA.push(JSON.stringify(objA[i]));
    }
    if (!('monitorId' in opt)) {
      opt.monitorId = Math.floor((Math.random() * 100000) + 1); 
    } 
    var str = {data:strA.join("\n"),id:opt.monitorId};
    var url = opt.url || 'vs/monitor.php';
    //  url:'../../../../vs/monitor.php'
    var dataType = vidteq && vidteq.vidteq && vidteq.vidteq.dataType ? vidteq.vidteq.dataType : 'json';
    var that = this;
    opt.ajaxHandle = $.ajax({
      url:url
      ,type:'POST'
      ,data:str
      ,dataType:dataType
      ,success : function (res) {
        delete opt.ajaxActive;
        that.triggerNextOneMonitor(opt);
      }
      ,error: function (res) {
        delete opt.ajaxActive;
        that.triggerNextOneMonitor(opt);
      }
    });
  }
}

vidteq._utils.prototype.checkAndInsertConsoleLog = function (opt) {
  //alert(console);
  //alert(console.log);
  opt = opt || {};
  if (opt.forceConsole) { } else {
    if (typeof(console) != 'undefined' && typeof(console.log) != 'undefined') { return; }
    if (typeof(console) == 'undefined') {
      console = {};
    }
  }
  var that = this;
  console.log = function (obj) {
    that.triggerOneMonitor([obj],opt);
    //StageWebViewBridge.call('debugMsg', null,'js',obj);
  };
}


vidteq._utils.prototype.multiClicker = function (opt) {
  if (!opt.dom) { return; }
  if (!opt.callback) { return; }
  $('#'+opt.dom).click(function(){
    var con = $(this).data('multiClicker');
    if (!con) {
      con = {};
      $(this).data('multiClicker',con);
    }
    if (!('state' in con)) { con.state = 0; }
    if (con.state >= 4) {
      opt.callback(this);
      con.state = 0;
      if (con.testTimer) { clearTimeout(con.testTimer); }
      return;
    }
    con.state++;
    if (con.testTimer) clearTimeout(con.testTimer);
    con.testTimer = setTimeout(function() { con.state=0; },1000);
  });
}

vidteq._utils.prototype.isValidJSON = function (str) {
  try {
    JSON.parse(str);
  } catch (e) {
		return false;
  }
  return true;
}

// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.
//Reference: http://davidwalsh.name/javascript-debounce-function
//Reference: http://rifatnabi.com/post/detect-end-of-jquery-resize-event-using-underscore-debounce
//example Usage:
//  $(window).resize( vidteq.utils.debounce(function() {
//    // Do our things here
//  }, 500 ));
vidteq._utils.prototype.debounce = function(func, wait, immediate) {
  var timeout;
  return function() {
    var context = this, args = arguments;
    var later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
};
 
 vidteq._utils.prototype.createUUID = function() {
    return"uuid-"+((new Date).getTime().toString(16)+Math.floor(1E7*Math.random()).toString(16));
  }
  
//vidteq.utils = vidteq.utils || new vidteq._utils()
