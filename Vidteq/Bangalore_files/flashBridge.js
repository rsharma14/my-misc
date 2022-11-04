
//function call_state(stringResponse) {
//  vidteq.mboxObj.moveCarTo.apply(vidteq.mboxObj,[stringResponse]);
//  if (vidteq.gui.wap) {
//    vidteq.gL.getVideoPoint.apply(vidteq.gL,[stringResponse]);
//  } else{
//    vidteq.fvtObj.changeTextDirectionIfNeeded.apply(vidteq.fvtObj,[stringResponse]);
//  }
//  //vidteq.gui.check3dCarProximity(stringResponse);
//}

//function tempoFunc(lon,lat,acc,speed,heading) {
//  if(typeof(vidteq.gL)!='undefined'){
//    vidteq.gL.getLocLaterally(lon,lat,acc,speed,heading);
//  }
//}

  function delinkVideo (booL){
    //vidteq.gL.videoSync=booL;
    if (bool) {
      vidteq.navigate.switchOnNavi();
    } else {
      vidteq.navigate.switchOffNavi();
    }
  }

function videoControl (index,type){
  //vidteq.gL.videoControl(index,type);
  vidteq.navigate.videoControl(index);
}

//function swfready () {
//  //console.log("swf ready called");
//  var myVar = vidteq.fvtObj.swfready.apply(vidteq.fvtObj,[]);
//  return myVar;
//}

// checked in flex code and commented
//function stageTextSync(textIndex,shudZoom) {
//  vidteq.fvtObj.textSync(textIndex,shudZoom);
//}

//function prepareRouteSummary (data) {
//  StageWebViewBridge.call('prepareRouteSummary', null, {
//    routeSummary:vidteq.gui.routeSummary
//    ,response:vidteq.gui.stageRouteResponse
//    ,dirIndex:vidteq.gui.dirLandmarkRoutesIndex
//    ,allLimits:vidteq.gui.allLimits
//    ,totalD:vidteq.gui.totalD
//  });
//}

//function startCallStatefn() {
//  vidteq.gui.stageCallBack();
//}

//function startVideoAsyncCalls() {
//  vidteq.gui.stopVideoCallBack();
//  setTimeout(function () { 
//    vidteq.gui.startVideoCallBack();
//  },1000);
//}

//function stageGoVid(data) {
//  vidteq.gui.routeEnds.replaceEntity(data.which,data.rcmEntity);
//  vidteq.io.goVid();
//}

//function stageViaGoVid(data) {
//  if(!data.viaEnabled) {
//    if(!data.noGoVid) {
//      vidteq.gui.routeEnds.replaceEntity(data.which,data.rcmEntity);
//    }
//    var viaSetT = JSON.parse(data.viaSet);
//    vidteq.gui.routeEnds.viaSet = viaSetT;
//  }
//  if(!data.noGoVid) { vidteq.io.goVid(); }
//}

//function stageGetPointInfo(data) {
//  var viaSetT = JSON.parse(data.viaSet);
//  vidteq.gui.routeEnds.viaSet = viaSetT;
//  //vidteq.gui.getPointInfo(data.entity,data.tip);
//  vidteq.gui.fillKeyBoxAfterFindhood(data.entity,data.tip);
//}

//function callOSPopupLocation(index) {
//  StageWebViewBridge.call('callPopupLocation', null, index);
//}

function handleHashChange(id) {
  if(vidteq.gui.handheld && vidteq.gui.openScale) {window.location.hash='dholder'; return;}
  var hash = location.hash;
  if(hash== '#nearby' || hash== '#landmark' || hash== '' || id == 'home') {
    $(".top-content").show();
    $('.top-content1').show();
    $('#videoLeftDiv').hide();
    $('#videoRightDiv').hide();
    $('#exploreLeftDiv').hide();
    $('#exploreRightDiv').hide();
    $('#initialLeftDiv').fadeIn("slow");
    $('#initialRightDiv').fadeIn("slow");
    if(vidteq.aD.multiPage) {
      $('#back_multiPage').show();
    }
    $('#back').hide();
    $('#homeid').hide();
    $('#matchResults').css('display','none');
    if($('#searches').hasClass('showDiv')) {$('#searches').addClass('hideDiv');$('#searches').removeClass('showDiv');}
    $('#landmarks').show();
  }
  if(hash== '#dsc') {
    window.location.hash='nearby';
    $('#dsc').hide();
    $('#nearby').show();
    $('#exploreAreaStrip').show();   
    $('.screen_NearByheader').show();
    $('.bottom-content').show();             
  }
}

function goPreviousPage(val) {
  if(val == 'home') { 
    handleHashChange('home');
  } else if(val == 'nearby') {
    handleHashChange('back');
  }
}

//function sendEmailOS(val) {
//  var emailId = prompt("Please enter your Email Id (Multiple Email Ids separated by a comma)","");
//  if (emailId!=null) {
//    vidteq.gui.sped.clickedEmailtab();
//    $('#emailinput').val(emailId);
//    vidteq.gui.sped.sendEmail();
//    vidteq.utils.undrapeCurtain('divRoutePop');
//    $('#divRoutePop').remove();
//    
//  }
//}

//function sendSMSOS(val) {
//  var mobinput = prompt("Please enter your Mobile Number (+91) Eg: XXXXXYYYYY ","");
//  if (mobinput!=null) {
//    vidteq.gui.sped.clickedSmstab();
//    $('#mobinput').val(mobinput);
//    vidteq.gui.sped.sendSMS();
//    vidteq.utils.undrapeCurtain('divRoutePop');
//    $('#divRoutePop').remove();
//  }
//}

function getLocFromFlexApp(lon,lat) {
  //vidteq.gL.getLocLaterally(lon,lat);
  vidteq.gLAuto.handleSuccess({},{lon:lon,lat:lat});
}

function enableAppBackButton() {
  $('#backPage img').attr('src','images/backBt.png');
  $('#historyBackDiv').show();
  $('#backPage').click(function() {
    //StageWebViewBridge.call('launchCollapseVideoPort', null, 2000);
    StageWebViewBridge.call('goBackToProjectPage', null, 2000);
    //setTimeout(function() { window.history.back(); },10);
  });
}

//function reloadCity () {
//  this.vidteq._vidteqCfg._rStr = vidteq._rStr;  // TBD - rStr is not right fix it
//  this.vidteq.cfg = vidteq._vidteqCfg;
//  try { 
//    this.vidteq.mboxObj.changeCity(vidteq.cfg.city);
//  } catch (e) {};
//  demoFilename();
//  $("#home_map").css('background-image',"url('ads/"+vidteq.cfg.city+"/img/home_map.gif");
//  
//  this.fadeshowObj.reload(new vidteq._fadeImages(vidteq.cfg.city,vidteq.cfg.demoImageCount));
//  ioAreaObj.restoreDefaults();
//  $("#frequencyContainer").html('');
//  $.get('vs/getLatest.php?city='+vidteq.cfg.city,function (content) { 
//      $("#frequencyContainer").html(content);
//  });
//  return;
//}

//function changeCity (city) {
//  var newCity = city+'.';
//  if (city == 'bangalore') { newCity = ''; }
//  var that = this;
//  var reloadCityWrap = function() { that.reloadCity(); }
//  $.getScript("js/config."+newCity+"js",reloadCityWrap);
//}

function demoFilename () {
  $.ajax({url:vidteq.cfg.demoListUrl,success:sendDemoFiles}); 
}

function sendDemoFiles(response){
  response = JSON.parse(response);
  var demoFileName = [];
  if(response.demofiles != null) {
    demoFileName = response.demofiles;
  } else {
    demoFileName.push('ads/flv/zero.flv');
  }
  try {getMovieNameNew("demoVideo").playDemo(demoFileName);} catch (e) { }
}

function getMovieNameNew(movieName) {
  if (navigator.appName.indexOf("Microsoft") != -1) {
    return window[movieName];
  } else {
    return document[movieName];
  }
}

//function getObjectVideo() {
//  if (vidteq.gui.wap) {
//    return vidteq.gL.response;
//  } 
//  return vidteq.gui.io.response;
//}

//function getDirections(str) {
//  return arrows;
//}

//function getBwCtrlUrl(){
//  if(typeof(vidteq.cfg.videoUrlLb) == 'undefined') {
//    //return videoUrlLb;
//    return "zero";
//  } else {
//    return vidteq.cfg.videoUrlLb;
//  }
//}

//function getMovieName(movieName) {
//  if (navigator.appName.indexOf("Microsoft") != -1) {
//    return window[movieName]
//  } else {
//    return document[movieName]
//  }
//}

function debugOn(){
  return vidteq.cfg.debug;
}

//function getMovieName(movieName) {
//  if (navigator.appName.indexOf("Microsoft") != -1) {
//    return window[movieName]
//  } else {
//    return document[movieName]
//  }
//}

function pause3dClicked() {
  vidteq.fvtObj.getVideoObj(vidteq.fvtObj.videoSwf).pauseClicked(); 
}

function play3dClicked() {
  vidteq.fvtObj.getVideoObj(vidteq.fvtObj.videoSwf).playClicked();
}

//function popupSkip() {
//  vidteq.gui.venue360.popupSkip();
//}

//function popupFinished() {
//  //vidteq.gui.venue360.popupSkip();
//   vidteq.gui.venue360.loadFinished();
//} 
// TBD functions

function clearVideoTd() {
}

//function panTheMap (index) {
//  vidteq.gL.videoSync=false;
//  var point,lon,lat;
//  if(index==0){
//    point=vidteq.mboxObj.lonLatObjFrmPoint(vidteq.gL.response.startEntity);
//    lon=point.lon;
//    lat=point.lat;
//  } else if (index==vidteq.gL.response.vid.length -1) {
//    point=vidteq.mboxObj.lonLatObjFrmPoint(vidteq.gL.response.endEntity);
//    lon=point.lon;
//    lat=point.lat;
//  } else  {
//    lon=vidteq.mboxObj.textDirLayer.features[parseInt(index) - 1].geometry.x;
//    lat=vidteq.mboxObj.textDirLayer.features[parseInt(index) - 1].geometry.y;
//  }
//  var loc=new OpenLayers.LonLat(lon,lat);
//  vidteq.mboxObj.map.panTo(loc);
//}

//function resizeMap() {
//  $('#map').height(hheight);
//  $('#main').height(hheight);
//}

//function mapAdjust (direction) {
//  if(direction=="up"){
//    $('#map').height(hheight/2+hheight/10);
//    $('#main').height(hheight/2+hheight/10);
//  } else {
//    $('#map').height(hheight/2);
//    $('#main').height(hheight/2);
//  }
//}

//function clearRoute () {
//  vidteq.mboxObj.clearRouteAndSrf();
//  vidteq.gL.videoPlaying=false;
//  vidteq.gL.videoSync=true;
//  clearTimeout(vidteq.mobUI.timer);
//  $('#map').off('touchend mouseup touchcancel');
//  vidteq.mobUI.showHideControls('show');
//}

function alertFromSwf (str) {
  handheldUI.flashCall(str);
}

if (typeof(vidteq) == 'undefined') { vidteq = {}; }

vidteq._flashBridge = function () {
}

vidteq._flashBridge.prototype.delinkVideo = function(bool) {
  if (bool) {
    vidteq.navigate.switchOnNavi();
  } else {
    vidteq.navigate.switchOffNavi();
  }
}

vidteq._flashBridge.prototype.callState = function(res) {
  this.mbox.moveCarTo(res);
  if (this.gui.wap) {
    //this.gL.getVideoPoint(res);
  } else{
    this.fvt.changeTextDirectionIfNeeded(res);
  }
  //vidteq.gui.check3dCarProximity(stringResponse);
}

vidteq._flashBridge.prototype.swfReady = function() {
  //console.log("swf ready called");
  var myVar = this.fvt.swfready();
  return myVar;
}

vidteq._flashBridge.prototype.geoLocate = function(opt,pos) {
  if (!vidteq.gLAuto) { return; }
  vidteq.gLAuto.handleSuccess(opt,pos);
}

vidteq._flashBridge.prototype.syncStageText = function(textIndex,shudZoom) {
  this.textSync(textIndex,shudZoom);
}

vidteq._flashBridge.prototype.startCallStatefn = function() {
  this.gui.stageCallBack();
}

vidteq._flashBridge.prototype.startVideoAsyncCalls = function() {
  this.gui.stopVideoCallBack();
  var that = this;
  setTimeout(function () { 
    that.gui.startVideoCallBack();
  },1000);
}

vidteq._flashBridge.prototype.stageGoVid = function(data) {
  this.gui.routeEnds.replaceEntity(data.which,data.rcmEntity);
  this.gui.io.goVid();
}

vidteq._flashBridge.prototype.stageViaGoVid = function(data) {
  if (!data.viaEnabled) {
    if (!data.noGoVid) {
      this.gui.routeEnds.replaceEntity(data.which,data.rcmEntity);
    }
    var viaSetT = JSON.parse(data.viaSet);
    this.gui.routeEnds.viaSet = viaSetT;
  }
  if(!data.noGoVid) { this.gui.io.goVid(); }
}

vidteq._flashBridge.prototype.stageGetPointInfo = function(data) {
  var viaSetT = JSON.parse(data.viaSet);
  this.gui.routeEnds.viaSet = viaSetT;
  //this.gui.getPointInfo(data.entity,data.tip);
  this.gui.fillKeyBoxAfterFindhood(data.entity,data.tip);
}

vidteq._flashBridge.prototype.prepareRouteSummary = function(data) {
  StageWebViewBridge.call('prepareRouteSummary', null, {
    routeSummary:this.gui.routeSummary
    ,response:this.gui.stageRouteResponse
    ,dirIndex:this.gui.dirLandmarkRoutesIndex
    ,allLimits:this.gui.allLimits
    ,totalD:this.gui.totalD
  });
}

vidteq._flashBridge.prototype.callOSPopupLocation = function(index) {
  StageWebViewBridge.call('callPopupLocation', null, index);
}

vidteq._flashBridge.prototype.sendEmailOS = function(val) {
  var emailId = prompt("Please enter your Email Id (Multiple Email Ids separated by a comma)","");
  if (emailId!=null) {
    this.gui.sped.clickedEmailtab();
    $('#emailinput').val(emailId);
    this.gui.sped.sendEmail();
    this.utils.undrapeCurtain('divRoutePop');
    $('#divRoutePop').remove();
  }
}

vidteq._flashBridge.prototype.sendSMSOS = function(val) {
  var mobinput = prompt("Please enter your Mobile Number (+91) Eg: XXXXXYYYYY ","");
  if (mobinput!=null) {
    this.gui.sped.clickedSmstab();
    $('#mobinput').val(mobinput);
    this.gui.sped.sendSMS();
    this.utils.undrapeCurtain('divRoutePop');
    $('#divRoutePop').remove();
  }
}

vidteq._flashBridge.prototype.removeLoc = function() {
  vidteq.fB.notValidCenter = true;
  $('#whereDiv').html('');
  $('#centerPin').hide();  
  $('#checkBox').attr('checked',false);
  $('#starttextbox').attr('readonly',false);
  $('#starttextbox').css('background','#ffffff');
  $('#starttextbox').val('Start Address');
  $('#starttextbox').val('Start Address');
  $('#endtextbox').val('End Address');
  $('#checkboxDiv').hide();
}

vidteq._flashBridge.prototype.changeCity = function(ref) {
  var newCity = ref.city+'.';
  if (ref.city == 'bangalore') { newCity = ''; }
  if(typeof(ref.validCenter) != 'undefined' && !ref.validCenter) {
    vidteq.fB.removeLoc();
  }
  var that = this;
  var reloadCityWrap = function() { 
    vidteq._vidteqCfg._rStr = vidteq._rStr;  // TBD - rStr is not right fix it
    vidteq.cfg = vidteq._vidteqCfg;
    if(typeof(ref.validCenter) != 'undefined' && ref.validCenter) {
      //vidteq.gL.lon = ref.lon;
      //vidteq.gL.lat = ref.lat; 
    }    
  }
  if(vidteq.cfg.city != ref.city) {
    $.getScript("js/config."+newCity+"js",reloadCityWrap);
  } 
}

vidteq._flashBridge.prototype.getDeomFiles = function() { // earlier function demoFilename
  var that = this;
  $.ajax({
    url:vidteq.cfg.demoListUrl
    ,success:function (res) { that.sendDemoFiles(res); }
  }); 
}

vidteq._flashBridge.prototype.sendDemoFiles = function(res) {
  if (typeof(res)!='object') res = JSON.parse(res);
  var demoFileName = [];
  if(res.demofiles != null) {
    demoFileName = res.demofiles;
  } else {
    demoFileName.push('ads/flv/zero.flv');
  }
  try {
    this.getMovieName("demoVideo").playDemo(demoFileName);
  } catch (e) { }
}

vidteq._flashBridge.prototype.getObjectVideo = function() {
  var res = undefined;
  if (this.gui.wap) {
    //return vidteq.mobUI.response;
    res = vidteq.mobUI.response;
  } else {
    res = this.gui.io.response;
  }
  //return this.gui.io.response;
  if('linearResponse' in vidteq) {
    return vidteq.linearResponse.getObjectVideo(res);
  }
  return res;
}

vidteq._flashBridge.prototype.getBwCtrlUrl = function() {
  if(typeof(vidteq.cfg.videoUrlLb) == 'undefined') {
    //return videoUrlLb;
    return "zero";
  } else {
    return vidteq.cfg.videoUrlLb;
  }
}

vidteq._flashBridge.prototype.getMovieName = function(movieName) {
  if (navigator.appName.indexOf("Microsoft") != -1) {
    return window[movieName]
  } else {
    return document[movieName]
  }
}

vidteq._flashBridge.prototype.debugOn = function() {
  return vidteq.cfg.debug;
}

vidteq._flashBridge.prototype.pause3dClicked = function() {
  this.fvt.getVideoObj(this.fvt.videoSwf).pauseClicked(); 
}

vidteq._flashBridge.prototype.play3dClicked = function() {
  this.fvt.getVideoObj(this.fvt.videoSwf).playClicked();
}

vidteq._flashBridge.prototype.popupSkip = function() {
  if (!this.gui.venue360) { return; }
  this.gui.venue360.popupSkip();
}

vidteq._flashBridge.prototype.popupFinished = function() {
  if (!this.gui.venue360) { return; }
  //this.gui.venue360.popupSkip();
  this.gui.venue360.loadFinished();
} 

vidteq._flashBridge.prototype.panTheMap = function(index) {
  vidteq.navigate.switchOffNavi();
  //vidteq.gL.videoSync=false;
  var point,lon,lat;
  if(index==0){
    //point=vidteq.mboxObj.lonLatObjFrmPoint(vidteq.gL.response.startEntity);
    point=this.mbox.lonLatObjFrmPoint(vidteq.navigate.vr.startEntity);
    lon=point.lon;
    lat=point.lat;
  //} else if (index==vidteq.gL.response.vid.length -1) {
  } else if (index==vidteq.navigate.vr.vid.length -1) {
    //point=vidteq.mboxObj.lonLatObjFrmPoint(vidteq.gL.response.endEntity);
    point=this.mbox.lonLatObjFrmPoint(vidteq.navigate.vr.endEntity);
    lon=point.lon;
    lat=point.lat;
  } else  {
    lon=this.mbox.textDirLayer.features[parseInt(index) - 1].geometry.x;
    lat=this.mbox.textDirLayer.features[parseInt(index) - 1].geometry.y;
  }
  var loc=new OpenLayers.LonLat(lon,lat);
  this.mbox.map.panTo(loc);
}

vidteq._flashBridge.prototype.alertFromSwf = function(str) {
  handheldUI.flashCall(str);
  // TBD why ?
}

vidteq._flashBridge.prototype.doCallSB = function() {
  console.log("doCall called");console.log(arguments);
}
vidteq._flashBridge.prototype.callSB = function() {
  console.log("call called");console.log(arguments);
}
vidteq._flashBridge.prototype.getFilePathSB = function() {
  console.log("getFilePath called");console.log(arguments);
}
vidteq._flashBridge.prototype.setRootPathSB = function() {
  console.log("setRootPath called");console.log(arguments);
}
vidteq._flashBridge.prototype.readySB = function() {
  console.log("ready called");console.log(arguments);
}

vidteq._flashBridge.prototype.exporter1 = function() {
  var that = this;
  // for tempoary compatibility
  vidteq.gL = {
    tempoFunc:function(lon,lat,acc,speed,heading) {
      vidteq.gLAuto.handleSuccess({},{lon:lon,lat:lat,acc:acc,speed:speed,heading:heading});
    },
    delinkVideo:function(bool){
      if (bool) {
        vidteq.navigate.switchOnNavi();
      } else {
        vidteq.navigate.switchOffNavi();
      }
    }
  };
  // following function added so the vidteq.fB.call_state can be called
  // That call also has context problem 
  this.callStateCC = function (res) { // CC stands for context changer
    return that.callState(res);
  }
  this.call_state = function (res) {
    return that.callState(res);
  };
  call_state = function (res) {
    return that.callState(res);
  };
  swfready = function () {
    return that.swfReady();
  };
  getObjectVideo = function () {
    return that.getObjectVideo();
  };
  getBwCtrlUrl = function () {
    return that.getBwCtrlUrl();
  };
  getMovieName = function (movieName) {
    return that.getMovieName(movieName);
  };
  popupSkip = function () {
    return that.popupSkip(); 
  };
  popupFinished = function () {
    return that.popupFinished();
  };
  if (typeof(StageWebViewBridge) == 'undefined') {
    StageWebViewBridge = {
      doCall: that.doCallSB,
      call: that.callSB,
      getFilePath:that.getFilePathSB,
      setRootPath:that.setRootPathSB,
      ready:that.readySB
    };
  }
  if (typeof(getJsPath) == 'undefined') {
    getJsPath = function () {
      //var path= 'http://'+document.location.host+document.location.pathname+'/js/frontScript.js'
      var path = (vidteq.vidteq.scriptBased)?(vidteq._serverHostUrl):'http://'+document.location.host+document.location.pathname;
      path += '/js/frontScript.js';
      path = path.replace("/embed3.php","");
      return path;
    }
  }
}

vidteq._flashBridge.prototype.exporter2 = function() {
  var that = this;
  //stageTextSync = function (textIndex,shudZoom) {
  //  that.fvt.textSync(textIndex,shudZoom);
  //};
  prepareRouteSummary = function (data) {
    that.prepareRouteSummary(data);
  };
  startCallStatefn = function () {
    that.startCallStatefn();
  };
  startVideoAsyncCalls = function () {
    that.startVideoAsyncCalls();
  }
  stageGoVid = function () {
    that.stageGoVid();
  };
  stageViaGoVid = function (data) {
    that.stageViaGoVid(data);
  };
  stageGetPointInfo = function () {
    that.stageGetPointInfo();
  };
  callOSPopupLocation = function (index) {
    that.callOSPopupLocation(index);
  };
  sendEmailOS = function (val) {
    return that.sendEmailOS(val);
  };
  sendSMSOS = function (val) {
    return that.sendSMSOS(val);
  };
  panTheMap = function (index) {
    return that.panTheMap(index);
  };
}

// Commmented as callState is used instead - but not verified - navada
//vidteq._flashBridge.prototype.call_state = function (stringResponse) {
//  //vidteq.fB.callState(stringResponse);
//  vidteq.mboxObj.moveCarTo(stringResponse);
//  if (vidteq.gui.wap) {
//    vidteq.gL.getVideoPoint(stringResponse);
//  } else{
//    vidteq.fvtObj.changeTextDirectionIfNeeded(stringResponse);
//  }
//  vidteq.gui.check3dCarProximity(stringResponse);
//}


