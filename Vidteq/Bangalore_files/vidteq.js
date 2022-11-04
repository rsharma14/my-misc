///var $ = jQuery.noConflict();
//var $;
//var vidteq;
if (typeof(vidteq) == 'undefined') { vidteq = {}; }
//var __FeedbackCustomHeaderTimer;
//variable used to switch between old and new business locate
// Major version of Flash required
//var requiredMajorVersion = 8;
// Minor version of Flash required
//var requiredMinorVersion = 0;
// Minor version of Flash required
//var requiredRevision = 0;
//var hasReqestedFlashVersion=true;
vidteq._vidteq = function (aD,options) {
  options = (typeof(options)!=="undefined" && typeof(options)==="object")?options:{};  
  this.topStripColor='#376092';
  this.bgColor='white';
  this.account=options.account || 'VidTeq';
  this.theme = (function(that) {
    var theme = options.theme || 'none'; // it was 'false'
    if( vidteq.aD && vidteq.aD.firstTimeRule && vidteq.aD.firstTimeRule.experimental ) {
      theme = vidteq.aD.config.theme = vidteq.aD.config.theme+"1";
    }
    return theme;
  })(this);
  if(options.cfg) {
    this.cfg = options.cfg;
  }
  this.scriptBased = (vidteq._serverHostUrl? true : false);
  if(options.scriptBased) {
    this.scriptBased = options.scriptBased;
  }
  this.fvtColor='#99B3CC';
  this.topStripTextColor='';
  this.fvtTextColor='';
  this.fvtTextHoverColor='';
  this.showHeader='false';
  this.height = 600;
  this.width = 600;
  this.pf = 3;
  this.dataType ='json';
  this.q = '';
  // Major version of Flash required
  this.requiredMajorVersion = 8;
  // Minor version of Flash required
  this.requiredMinorVersion = 0;
  // Minor version of Flash required
  this.requiredRevision = 0;
  this.hasReqestedFlashVersion=true;
  this.flashVersionDetected=false;
  //this.init();
}

vidteq._vidteq.prototype.installGeoLocate = function(aD) {
  var that = this;
  var opt = { 
    src:{js:false}
    ,callbackEarly:function (pos) {
      //console.log("callback Early called");
    }
    ,callbackLate:function (pos) {
      //console.log("callback Late called");
      vidteq.mobUI.handleMyLoc(pos);
    }
    //,track:true
  };
  if (vidteq.iPhone) { } else { }
  //if (vidteq.openScale || (aD && aD.openScale)) { } else {
  //  opt.predict = {
  //    mbox:vidteq.mboxObj
  //  };
  //};
  if( vidteq._geoLocate ) {
    vidteq.gLAuto = new vidteq._geoLocate(opt);
    //vidteq.gLAuto = new vidteq._geoLocate({track:true});
    //vidteq.gLAuto.init({singlePos:true,track:true});
    //vidteq.gL= vidteq.geoL? new vidteq.geoL({}) : undefined;
  }
}

vidteq._vidteq.prototype.init = function(aD,embedMode) {
  this.checkAndInsertConsoleLog();
  var embedMode = embedMode || 'embed';
  //http = new XMLHttpRequest();
  //http.open("GET","dummy.xml");
  //http.onreadystatechange = function() {
  //  alert(http.readyState);
  //};
  //http.send(null);

  vidteq.utils = this.utils = new vidteq._utils();
  // ie7 to 9 magically converts geom brackets to hash
  // ie11 userAgent is Trident
  if( (self.navigator.userAgent.match(/MSIE/) || self.navigator.userAgent.match(/Trident/))
       && typeof(aD) != 'undefined' 
       && typeof(aD.places.center) != 'undefined' 
       && typeof(aD.firstTimeRule) != 'undefined') {
    var rPattern=/#([0-9\.][0-9\.]* [0-9\.][0-9\.]*)#/;
    var obj = aD;
    this.utils.parseObject(obj,{str:'geom',pattern:/#/,rPattern:rPattern,mPattern:'($1)'});
  }
  if(typeof(aD) != 'undefined' && 
       typeof(aD.config.sideBarUI) != 'undefined' &&
       parseInt(aD.config.sideBarUI)){
    aD.config.clickAttachedFrontPage = 1;
    aD.config.frontCurtainHtmlFile = vidteq.aD.config.sideBarUIFCHtmlFile;
  //  var src = vidteq._vidteqCfg.imageLogosLoc + vidteq.aD.urlId + '.png';
  //  var devSrc = vidteq._vidteqCfg.imageLogosLoc + 'Prestige.png';
  //  if(typeof(document.getElementById("themeProjLogo")) != 'undefined' 
  //       && typeof(document.getElementById("developerLogo")) != 'undefined'
  //       && document.getElementById("themeProjLogo") != null
  //       && document.getElementById("developerLogo") != null) {
  //    document.getElementById("themeProjLogo").setAttribute('src',src);
  //    document.getElementById("developerLogo").setAttribute('src',devSrc);
  //  }
  }
  if(typeof(vidteq.aD) != 'undefined' 
        && typeof(vidteq.aD.config) != 'undefined' 
        && typeof(vidteq.aD.config.customtoplogo_preview) != 'undefined'
        && vidteq.aD.config.customtoplogo_preview != '') {
    var customDataLogo = vidteq._vidteqCfg.customHtmlUrl.replace('customDataHtml/','');
    var src = customDataLogo + 'customDataLogo/'+ vidteq.aD.config.customtoplogo_preview;
    $("#projLogo").attr('src',src);
    $('#logoDom').show();
  }

  // ie8 magically converts geom brackets to hash
  //if(typeof(aD) != 'undefined') {
  //  if(typeof(aD.places.center) != 'undefined') {
  //    var ent = aD.places.center.entity;
  //    if(ent.geom.toString().match(/#/)){
  //      ent.geom = ent.geom.toString().replace(/#([0-9\.][0-9\.]* [0-9\.][0-9\.]*)#/,'($1)');
  //    }
  //  }
  //}
  this.prepareGlobalVariables(aD,embedMode);
  this.initFromAccountDetails(aD);
  this.createObjects(aD);
  this.installGeoLocate(aD);
 
  if (vidteq.mobUI) {
    vidteq.mobUI? vidteq.mobUI.init(aD) : '';
  }
  //if( typeof(vidteq.gui)!='undefined' ) { vidteq.gui.nemo? '' : vidteq.gui.init(aD); }
  if( vidteq.gui ) { vidteq.gui.init(aD); }
  if( vidteq._geoLocate ) {
    if (vidteq.openScale || (aD && aD.openScale)) { } else {
      vidteq.gLAuto.initPredictor({predict:{mbox:vidteq.mboxObj}});
    }
  }
  if (vidteq.openScale || (aD && aD.openScale)) {
    //if(aD.openScale && !aD.wfHandheld) { }
    // TBD please check wfHandled mode with nanda and raghu
    var aD = aD || {
      account:'VidTeq',
      q:'blocate',
      city:vidteq.cfg.city
    };
    StageWebViewBridge.call('accountDetailsfn', null, {
      accountDetails:JSON.stringify(aD)
      ,cfg:JSON.stringify(vidteq.cfg)
    });
  } 
  if (vidteq.mobUI) {
    //vidteq.mobUI? vidteq.mobUI.init(aD) : '';
    //if(typeof(vidteq.gui)!='undefined') vidteq.gui.nemo? '' : vidteq.gui.init(aD);
    // note that it happens only in mobUI mode 
    vidteq.mobUI?vidteq.mobUI.attachRcmItems():'';
    return;
  } 
  //if (typeof(aD) == 'undefined') {
  //  //if (vidteq.iPhone) {
  //  //  var aD = {
  //  //    account:'VidTeq',
  //  //    q:'blocate',
  //  //    city:vidteq.cfg.city
  //  //  }
  //  //   StageWebViewBridge.call('accountDetailsfn', null, {accountDetails:JSON.stringify(aD),cfg:JSON.stringify(vidteq.cfg)});
  //  //}
  //  vidteq.mobUI? vidteq.mobUI.init(aD) : '';
  //  //vidteq.gL? vidteq.gL.init() : '';
  //  if(typeof(vidteq.gui)!='undefined') vidteq.gui.nemo? '' : vidteq.gui.init();
  //  // note that it happens only in mobUI mode 
  //  vidteq.mobUI?vidteq.mobUI.attachRcmItems():'';
  //  return;
  //}
  if(!aD.openScale) {
    if( window['DetectFlashVer'] ) {
        this.detectFlashVersions();
    }
  }
  //if (aD.q == 'wayfinder-lite' || 
  //    aD.q == 'wayfinder' || 
  //    aD.q == 'EScheduler' || 
  //    aD.q == 'blocate' || 
  //    aD.q == 'blocate-lite' || 
  //    aD.q == 'locatestores') {
  //  vidteq.gui.defaultLoc = 'Enter your address to find a Store nearby & get Video Directions';
  //  //vidteq.gui.init(aD.q,{on:true,fix:'end'});
  //  vidteq.gui.init(aD);
  //}
  //if(aD.openScale && !aD.wfHandheld) {
  //  //StageWebViewBridge.call('accountDetailsfn', null, {accountDetails:JSON.stringify(aD),cfg:JSON.stringify(vidteq.cfg)});
  //  // Done above already
  //  vidteq.imgPath.maxZ =  'images/os/max_os.png?myRand='+Math.floor(Math.random()*100000);
  //  vidteq.imgPath.minZ =  'images/os/min_os.png?myRand='+Math.floor(Math.random()*100000);
  //  vidteq.imgPath.vidZ =  'images/os/car_os.png?myRand='+Math.floor(Math.random()*100000);

  //  if (aD.multiPage) {
  //    $('#back_multiPage').show();
  //    //var from = document.referrer;
  //    //$('#back_multiPage').attr('href',from);


  //    $('#back_multiPage').click(function() {
  //      StageWebViewBridge.call('goStageBack', null, null);      
  //    });
  //  }
  //  //if(aD.handheldEnabled) {
  //  //  vidteq.imgPath.maxZ =  'images/os/maxzNew.png?myRand='+Math.floor(Math.random()*100000);
  //  //  vidteq.imgPath.minZ =  'images/os/minZ.png?myRand='+Math.floor(Math.random()*100000);
  //  //  vidteq.imgPath.vidZ =  'images/os/carNew.png?myRand='+Math.floor(Math.random()*100000);
  //  //}
  //}

  //if(aD.appMode) {
  //  window.ondevicemotion = function(event) {
  //    var landscapeOrientation = window.innerWidth / window.innerHeight > 1;
  //    if (landscapeOrientation) {
  //      $('body').css({width:window.innerWidth});
  //      $('#bgCurtain').css({height:window.innerHeight+'px',width:window.innerWidth+'px'});
  //    } else {
  //      $('body').css({width:window.innerWidth});
  //      $('#bgCurtain').css({height:window.innerHeight+'px',width:window.innerWidth+'px'});
  //    }
  //  }
  //}
  // TBD autoplay front page etc
}

vidteq._vidteq.prototype.detectFlashVersions = function() {
  var that = this;
  var deferredDetectFlash = function () {
    that.hasReqestedFlashVersion = DetectFlashVer(that.requiredMajorVersion, that.requiredMinorVersion, that.requiredRevision);
    that.flashVersionDetected=true;
  }
  setTimeout(deferredDetectFlash,10);
}

vidteq._vidteq.prototype.reRequestKey = function() {
  //var url = "vs/key.php?request=true&urlid="+vidteq.aD.urlId+"&city="+vidteq.cfg.city+"&key="this.key;
  //var keyUrl = (this.scriptBased)? vidteq._serverHostUrl+url : url;
  /* 
  $.get(keyUrl,function(newKey) {
    that.key = newKey;
  });
  */

  var keyUrl = "vs/key.php";
  var dataType = 'json';
  
  if( this.scriptBased ){
    keyUrl = vidteq._serverHostUrl+keyUrl;
    dataType = 'jsonp';
  }
  
  var that = this;
  $.ajax({
    url: keyUrl
    ,data: {
      urlid: vidteq.aD.urlId
      ,city: vidteq.cfg.city
      ,key: vidteq.vidteq.key
      ,request: true 
    }
    ,dataType: dataType
    ,cache: false
    ,success: function(res) {
      that.key = res;
      //console.log("key success: ");console.log(res);
      //console.log("that.key");console.log(that.key);
    }
    ,error: function(res) {
      //console.log("key error: ");console.log(res);
    }
  });
}

vidteq._vidteq.prototype.installKeyTimer = function  (keyInfo) {
  if (keyInfo && keyInfo.initKey) this.key = keyInfo.initKey; 
  if (keyInfo && keyInfo.interval) this.interval = keyInfo.interval; 
  var that = this;
  // TBD check if interval is actuall set, then warn
  //this.interval = 30000;
  setInterval(function () { that.reRequestKey(); },this.interval);
}

vidteq._vidteq.prototype.initFromAccountDetails = function(aD) {
  if (typeof(aD) == 'undefined') return;
  this.installKeyTimer(aD);
  if (aD.config.h) aD.config.height = aD.config.h;
  if (aD.config.w) aD.config.width = aD.config.w;
  var params = ['theme','topStripColor','fvtColor','topStripTextColor','fvtTextColor','fvtTextHoverColor','bgColor','showHeader','height','width','pf'];
  for (var i in params) {
    var val = params[i];
    if (aD.config[val]) this[val] = aD.config[val];
  }
  var params = ['account','q'];
  for (var i in params) {
    var val = params[i];
    if (aD[val]) this[val] = aD[val];
  }
  vidteq.mainColor=this.topStripColor;
  this.urlId = aD.urlId;
  this.fetchBrowserDetails();
  // TBD attempt to make top strip vary with window width
  //if(this.browser.msie && (this.browser.version == "8.0" || this.browser.version == "7.0")){
  //  $('#topStripLocateBar').css({position:'absolute'});
  //} else {
  //  $('#topStripLocateBar').css({position:'absolute','margin-left':'-600px'});
  //}
}

vidteq._vidteq.prototype.fetchBrowserDetails = function  () {
  this.browser={};
  var that = this;
  $.each($.browser, function(i, val) {
    if(val) that.browser[i]=val;
  });
}

vidteq._vidteq.prototype.prepareGlobalVariables = function(aD,embedMode) {
  vidteq.MSIE6=false;
  vidteq.MSIE7=false;
  if(self.navigator.userAgent.indexOf("MSIE 6")!=-1) vidteq.MSIE6=true;
  if(self.navigator.userAgent.indexOf("MSIE 7")!=-1) vidteq.MSIE7=true;
  $ = jQuery.noConflict();
  
  //this is moved to io.js. Also,  nemoQ should not be overridden from boolean to object type
  var myCenter = this.utils.getSafe('places.center',aD);
  if (myCenter) { 
    aD.nemoCenter = $.extend(true,{},myCenter.entity);   
  }
  //if (typeof(aD) != 'undefined' ) 
  //  if (typeof(aD.places.center) != 'undefined' && this.utils.getSafe('nemoQ',aD) == 'nemo') {
  //    aD.nemoQ = $.extend(true,{},aD.places.center.entity);   
  //}
  vidteq.vidNav = false;
  vidteq.utils = this.utils;
  vidteq._vidteqCfg._rStr = vidteq._rStr;
  vidteq.cfg = vidteq._vidteqCfg;
  vidteq.cfg.feedbackFormUrl = "feedback/getFeedbackForm.php";
  
  if (typeof(embedMode) != 'undefined' && embedMode == 'widget') {
    //this.scriptBased=true;
    this.dataType='jsonp'; 
    var keys = vidteq.cfg.widgetKeys.split(/\s*,\s*/);
    for (var i in keys) {
      vidteq.cfg[keys[i]]=this.utils.makePathAbsolute(vidteq.cfg[keys[i]],vidteq._serverHostUrl,vidteq._serverHostRootUrl);
    } 
    //$('#vidteq').html(embedHtmlContent);
    //embedHtmlContent = '';
    vidteq.width = $('#vidteq').width();
    vidteq.height = $('#vidteq').height();
  }
}

vidteq._vidteq.prototype.createObjects = function(aD) {
  if( vidteq.imgPath ) {
    vidteq.imgPath.generatePath({
      vidteq: this
      ,_serverHostUrl: vidteq._serverHostUrl
      ,gui: vidteq.gui
    });
  }
  
  if( vidteq._routeEnds ) {
      vidteq.routeEndsObj = new vidteq._routeEnds();
  }
  //if (typeof(aD) == 'undefined') { }
  if (vidteq._mobUI) {
    var msgObj = new Object();
    msgObj.wap=true;
    vidteq.vidNav=true;
    vidteq.mobUI = vidteq._mobUI? new vidteq._mobUI({}) : undefined;
    //if(!vidteq.iPhone) { }
      vidteq.gui = new vidteq._gui(msgObj);
      if (vidteq._overRide) {
        vidteq.overRider = new vidteq._overRide();
        vidteq.gui = $.extend({},vidteq.gui,vidteq.overRider);
      }
    //if(!vidteq.iPhone) { 
    //  vidteq.gui.wap=true;
    //}
    // TBD wap is already true
    //vidteq.gL= vidteq.geoL? new vidteq.geoL({}) : undefined;
    vidteq.io = new vidteq._io(vidteq.gui);
    vidteq.gui.io = vidteq.io; 
    vidteq.linearResponse = new vidteq._linearResponse();
    vidteq.fB = new vidteq._flashBridge();
    vidteq.fB.gui = vidteq.gui;
    vidteq.fB.utils = this.utils;
    //vidteq.fB.gL = vidteq.gL;
    vidteq.fB.exporter1();
    vidteq.fB.exporter2(); // only if flex
    return;
  }
  
  switch (aD.q) {
    case "wayfinder":
    case "blocate":
    case "blocate-lite":
    case "EScheduler":
    case "VidCorp":
    case "wayfinder-lite":
    case "locatestores":
      vidteq.gui = new vidteq._gui({});
      if(aD.handheldEnabled){
        //if ( aD.q == 'wayfinder' ) {
        //  vidteq.gL = new vidteq._geoLocate({track:true});
        //  //vidteq.gL = new vidteq._geoLocate({track:true});
        //  //vidteq.gL.init({singlePos:true,track:true});
        //  vidteq.gui.locateTimer = setInterval(function () { vidteq.gL.init({singlePos:true}); },2*60*1000);
        //  vidteq.gL.callBack = function (coords) { vidteq.gui.findHood(coords); };
        //}
        // TBD commented as this mode is meant for only senthil wayfinder
        // GeoLocate has changed - so will not work
        handheldUI = new vidteq._handheldUI();
        handheldUI.gui = vidteq.gui;
        vidteq.gui.handheldUI = handheldUI;
        handheldUI.utils = this.utils;  // how and why TBD
        handheldUI.init(aD.q);
        //var myConsoleScroll = new iScroll('myConsoleCover');
      }
      vidteq.io = new vidteq._io(vidteq.gui);
      vidteq.gui.io = vidteq.io; 
      break;
    default:break;
  }
  
  if( vidteq.Nemo && vidteq._gui ) {
    vidteq.Nemo.prototype = new vidteq._gui();
    vidteq.gui = new vidteq.Nemo();
  }
  
  if( vidteq._linearResponse ) {
      vidteq.linearResponse = new vidteq._linearResponse();
  }
  var fvtOptions = {
    fvtScrollOptions:{}
  };
  
  if( vidteq.aD && vidteq.aD.firstTimeRule && vidteq.aD.firstTimeRule.manner ) {
    if( vidteq.aD.firstTimeRule.manner == 'videoMap' && vidteq.aD.urlId == "indiaproperty" && !vidteq.aD.firstTimeRule.experimental ) {
      fvtOptions.fvtScrollOptions.left = false;
      fvtOptions.fvtScrollOptions.activeTheme = 'ultra';
    }
  }
  if( vidteq.aD && vidteq.aD.firstTimeRule && vidteq.aD.firstTimeRule.behaveAs && vidteq.aD.firstTimeRule.behaveAs == 'lite'
      && vidteq.aD.firstTimeRule.manner && vidteq.aD.firstTimeRule.manner == 'VideoRoute' ) {
      fvtOptions.fvtScrollOptions.left = false;
      fvtOptions.fvtScrollOptions.activeTheme = 'niceScroll';
  }
    
  if (aD.urlId == 'Golf_Edge') {
    fvtOptions.detach = true;
  }
  if( vidteq.fvt ) {
      vidteq.fvtObj = new vidteq.fvt(vidteq.gui,fvtOptions);
  }
  if( vidteq._flashBridge ) {
    vidteq.fB = new vidteq._flashBridge();
    if( vidteq.fvtObj ) {
      vidteq.fB.fvt = vidteq.fvtObj;
      vidteq.fvtObj.clearFvtContent=aD.clearFvtContent;
    }
    vidteq.fB.gui = vidteq.gui;
    vidteq.fB.utils = this.utils;
    vidteq.fB.exporter1();
    vidteq.fB.exporter2(); // TBD only if flex
  }
  aD.clearFvtContent='';
}

//var timeOutEnabled;
vidteq._vidteq.prototype.preventAppStoreRedirect = function() {
  clearTimeout(this.timeOutEnabled);
  this.timeOutEnabled = null;
  var that = this;
  window.removeEventListener('pagehide', function (e) {
    that.preventAppStoreRedirect();
  });
}

vidteq._vidteq.prototype.switchToAppFromBrowser = function() {
  var tAppUrl = "" || vidteq.aD.config.iPadAppID;
  var appstore = "" || vidteq.aD.config.iPadAppStoreLink;
  var appUrl = "";
  var appDirName = this.utils.getSafe('vidteq.aD.config.appDirName');
  if (!appDirName) { 
    appDirName = '&project='+appDirName;
  }
  appDirName = appDirName || '';
  if(tAppUrl != '') {
    if(vidteq.io.link != '') {
      var rule = this.utils.getRootPath()+'which.php?urlid='+vidteq.aD.urlId+'&city='+vidteq.cfg.city+'&';
      var ftr = vidteq.io.link.split(rule);
    }
    var tUrlid = tAppUrl+':// embed3.php?city='+vidteq.cfg.city+'&urlid='+vidteq.aD.urlId+'&flex=1&openScale=1&multiPage=1 '+appDirName+ftr[1];
    appUrl = tUrlid;
  }
  if(appUrl == '' && appstore == '') return;
  var message = "";
  if(this.hasReqestedFlashVersion) {
    message = "For better experience of VideoMap, You can try our application!";
  } else {
    message = "You do not seem to have Flash Enabled in your device, do you want to use VideoMap app now?";
  }
  var that = this;
  if(confirm(message)) {
    if(appUrl != '') document.location = appUrl;
    if(appstore != '') {
      this.timeOutEnabled = setTimeout(function(){
        document.location = appstore;
      }, 1000);
      window.addEventListener('pagehide', function (e) {
        that.preventAppStoreRedirect();
      });
    }
  }
}

// how to find border radius supported or not
vidteq._vidteq.prototype.isBorderSupported = function () {
  if (this._useCss) { return true; }  // TBD false case
  var cssAttributesNames = ['borderRadius','BorderRadius','MozBorderRadius','WebkitBorderRadius','OBorderRadius','KhtmlBorderRadius'];
  for (var i in cssAttributesNames) {
    if (window.document.body.style[cssAttributesNames[i]] !== undefined) {
      this._useCss = true;
      return true;
    }
  }
}

vidteq._vidteq.Class = function () {
  var len = arguments.length;
  var myParent = arguments[0];  // parent
  var myProps = arguments[len-1];  // function
  
  var me = typeof myProps.construct == 'function' ?
    myProps.construct : function () { 
      myParent.prototype.construct.apply(this,arguments); 
    };
  
  if (len > 1) {
    var newArgs = [me, myParent].concat(
      Array.prototype.slice.call(arguments).slice(1,len-1),
      myProps
    );
    _vidteq.inherit.apply(null, newArgs);
  } else {
    me.prototype = myProps;
  }
  return me;
};

vidteq._vidteq.inherit = function(me,myParent) {
  var mySeed = function () {};
  mySeed.prototype = myParent.prototype;
  me.prototype = new mySeed;
  var i, l, o;
  for (i=2,l=arguments.length;i<l;i++) {
    o = arguments[i];
    if (typeof o === 'function') {
      o = o.prototype;
    }
    _vidteq.extend(me.prototype,o);
  }
};

vidteq._vidteq.extend = function(dst,src) {
  dst = dst || {};
  if (src) {
    for (var p in src) {
      var v = src[p];
      if (v !== undefined) {
        dst[p] = v;
      }
    }
    var sourceIsEvt = typeof window.event == 'function' &&
      src instanceof window.event;
    if (!sourceIsEvt && 
        src.hasOwnProperty && src.hasOwnProperty('toString')) {
      dst.toString = src.toString;
    }
  }
  return dst;
}

vidteq._vidteq.prototype.loadScript = function(info,callback) {
  var checkFunc = function () {
    if (info.checkObj && (eval('typeof('+info.checkObj+')') != 'undefined')) { 
      return true; 
    }
    return false;
  };
  if (checkFunc()) { 
    if (callback) { callback(); }
    return;
  }
  var fireFunc = function () {
    script.remove();
    if (callback) { callback(); }
  };
  
  var url = this.scriptBased? vidteq._serverHostUrl+info.url : info.url;
  var script = $('<script/>').attr('src',url).appendTo('head');
  var t = new vidteq.utils.waitAndFire(checkFunc,fireFunc,undefined,{maxIter:500});
}

vidteq._vidteq.prototype.triggerNextOneMonitor = function () {
  if (!this.consoleStore) { return; }
  var objA = this.consoleStore;
  delete this.consoleStore;
  this.triggerOneMonitor(objA);
}

vidteq._vidteq.prototype.triggerOneMonitor = function (objA) {
  if (this.ajaxActive) { 
    if (!('consoleStore' in this)) { 
      this.consoleStore = [];
    }
    for (var i in objA) { 
      this.consoleStore.push(objA[i]);
    }
    // Make sure consoleStore does not grow beyond some max size TBD
    while (this.consoleStore.length > 10) {
      this.consoleStore.shift();
    };
  } else {
    this.ajaxActive = new Date();
    var strA = [];
    for (var i in objA) {
      strA.push(JSON.stringify(objA[i]));
    }
    if (!('monitorId' in this)) {
      this.monitorId = Math.floor((Math.random() * 100000) + 1); 
    } 
    var str = {data:strA.join("\n"),id:this.monitorId};
    var that = this;
    this.ajaxHandle = $.ajax({
      url:'vs/monitor.php'
      ,type:'POST'
      ,data:str
      ,dataType:vidteq.vidteq.dataType
      ,success : function (res) {
        delete that.ajaxActive;
        that.triggerNextOneMonitor();
      }
      ,error: function (res) {
        delete that.ajaxActive;
        that.triggerNextOneMonitor();
      }
    });
  }
}

vidteq._vidteq.prototype.checkAndInsertConsoleLog = function () {
  if (!vidteq.flex) { return; }
  //alert("overriding console.log ");
  if (typeof(console) == 'undefined') {
    console = {};
  }
  var that = this;
  console.log = function (obj) {
    that.triggerOneMonitor([obj]);
    //StageWebViewBridge.call('debugMsg', null,'js',obj);
  };
}

//function callTaker(a,b,d,d) {
//  console.log(arguments);
//  console.log(arguments.length);
//  console.log(arguments.callee);
//  console.log(arguments[1]);
//  console.log(callTaker.length);
//  console.log(callTaker.caller);
//  console.log(arguments.callee.caller);
//  console.log(arguments.callee.caller.caller);
//  console.log(callTaker.name);
//  console.log(callTaker.constructor);
//  console.log(Array.prototype.slice.call(arguments));
//}
//
//function callMaker() {
//  callTaker('foo','bar',this,document);
//}
//
//callMaker();
//console.log("second time");
//blah = new callMaker;
//console.log("writing blah");
//console.log(blah);


