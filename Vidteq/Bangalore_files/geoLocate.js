
if (typeof(vidteq) == 'undefined') { vidteq = {}; }

// we have following geolocation implementations
//  1. Geolocate - this file
//  2. geolocate-lite - used by all apps
//  3. geolocate/tracker - used by tracking
//  4. geolocate - used by surveyApp
//
//  - we need to consolidate - why ?
//  1. There are multiple sources of locations
//     a  - flash geolocation - we dont know if it is fine/coarse/networ/gps
//     b  - android geolocation - fine/coarse, network/gps
//     c  - Javascript geolocation - we dont know 
//     d. - native code in iphone/ipad - similar to (b)
//  2. we need to be able source our position from one or more of above
//  3. we need to fake the position - so that we can test
//  4. we need tracking ability to record and replay 
//  5. We need to be asynchronous, so that loading time (init of map) 
//     is not affected by this. Map should come up without location
//  6. We need predictor so that we can do look ahead 
//  7. We need to be sensitive to time and accuracy of the position
//  8. we need to be backward compatible - so that existing apps work.
//
//  How do we go about ?
//    1. do we know the difference of all 4 implementation ?
//       no 
//    2. First study all the four implementations
//    3. Bring in new capability like track, record and replay
//    4. while bringing new capability - consilidate and modify existing code
// 

//  how does geoL work ?
//  outer vidNav.mxml suplies variable through view actionation
//   main mxml -gets the variable - 
//        invokes stage webview, with url - after 6 seconds 
//        also installs video through init
//        
//  Now flex system waits till accountDetails call - this happens at 8sec
//  vidteq.js - init happens
//    geoL.init 
//       cityLimit
//       attache click
//       handleGeoSuccess
//       newCityCenter - sets the buddy point to center 
//    accountDetailsFn - webview call 
//      starts vidteq.as file and sets accountDetails
//    that starts the flex geoLocation 
//      check city is done
//  

vidteq._geoLocate = function (opt) {
  var opt = opt || {};
  this.lastPos = null;
  this.permitted = false;
  this.errored = false;
  this.error = "";
  this.posArray = [];
  this.firstTimeCenter=false;
  this.doFindhood = true;
  if (opt && 'doFindhood' in opt) { this.doFindhood = opt.doFindhood; }
  this.findhoodUrl = opt.findhoodUrl || 'vs/magicHappens.php';
  this.findhoodType = opt.findhoodType || 'json';
  this.posStorageLength = opt.posStorageLength || 10;
  this.noClone = false;
  if ('noClone' in opt) { this.noClone = opt.noClone; }
  if (opt.track) {
    this.tracker = new vidteq._geoLocate._tracker(this,opt);
  }
  this.src = {
    js:true
    ,flex:false
    ,android:false
    ,ios:false
  };
  for (var i in this.src) {
    if (opt.src && (i in opt.src)) { this.src[i] = opt.src[i]; }
  }
  if (opt.callbackEarly) { this.callbackEarly = opt.callbackEarly; }
  if (opt.callbackLate) { this.callbackLate = opt.callbackLate; }
  if (this.src.js) {
    this.initParams(opt);
    this.initJsGlMode(opt);
  }
  if (this.src.android || this.src.ios || this.src.flex) {
    this.initAppMode(opt);
  }
  this.initTestMode(opt);
  //if (opt.predict) { // we can init predictor later as well due to mbox
  this.initPredictor(opt);
  //}
}

vidteq._geoLocate.prototype.initPredictor = function (opt) {
  if ('predict' in opt) {} else { return; }
  this.predictor = new vidteq._geoLocate._predictor(this,opt.predict);
}

vidteq._geoLocate.prototype.off = function () {
  if (this.trackPlayer) {
    this.trackPlayer.off();
  }
  if (this.predictPlayer) { 
    this.predictPlayer.off();
  }
  if (this.routePlayer) { 
    this.routePlayer.off();
  }
  if (this.tracker) { 
    this.tracker.off();
  }
  if (this.predict) { 
    this.predict.off();
  }
}

vidteq._geoLocate.prototype.initParams = function (opt) {
  // this section is relevent for JS source alone
  if (!this.trackingParams) {
    this.trackingParams = {enableHighAccuracy:true,maximumAge:1000,timeout:27000};
  } 
  var p = ['enableHighAccuracy','maximumAge','timeout'];
  for (var i in p) {
    if (opt && typeof(opt[p[i]]) != 'undefined') {
      this.trackingParams[p[i]] = opt[p[i]];
    }
  }
}

vidteq._geoLocate.prototype.receiveExternalPosition = function (pos) {
}

vidteq._geoLocate.prototype.isPosValid = function (opt,pos) {
  // following code is to ensure no side effect when we play TBD
  //if (this.src.track) {
  //  if (opt.src && opt.src == 'player') { } else {
  //    return false;
  //  }
  //}
  if (pos.longitude || 
      pos.lon || 
      (pos.coords && pos.coords.longitude)) { } else {
    return false;
  }
  var lon = pos.longitude || pos.lon || pos.coords.longitude;
  if (isNaN(lon)) { return false; }
  pos.lon = parseFloat(lon);
  if (pos.latitude ||
      pos.lat ||
      (pos.coords && pos.coords.latitude)) { } else {
    return false;
  }
  var lat = pos.latitude || pos.lat || pos.coords.latitude;
  if (isNaN(lat)) { return false; }
  pos.lat = parseFloat(lat);
  return true;
}

vidteq._geoLocate.prototype.handleSuccess = function (opt,pos) {
  // opt is object cotaining {src:source,type:type,provider:<>,accuracy}
  // source can be 'js','flex','android','ios'
  // type can be 'single','periodic'
  // provider can be 'network','gps'
  // accuracy - fine or coarse
  if (!this.isPosValid(opt,pos)) { 
    this.invalidPos = pos;
    return; 
  }
  this.permitted = true;
  var curPos = pos;
  if (this.noClone) { } else {
    curPos = $.extend(true,{},pos);
  }
  curPos.rcvdTime = new Date();
  //curPos.coords = $.extend(true,{},pos.coords); // not sure needed TBD
  this.storeLocally(curPos);
  if (this.callbackEarly) { this.callbackEarly(curPos); }
  if (this.doFindhood) { 
    var that = this;
    (function () { // closure needed to protect curPos
      var pos = curPos;
      that.findhood(pos,function (loc) {
        $.extend(pos,loc);
        if (that.callbackLate) { that.callbackLate(pos); } 
      });
    })(); 
  } 
}

vidteq._geoLocate.prototype.storeLocally = function (pos) {
  this.lastPos = pos;
  this.posArray.push(pos);
  if (this.tracker) {
    // tracker need to post the pos - so needs a copy not ptr
    this.tracker.putPosition($.extend(true,{},pos));
  }
  if (this.predictor) {
    this.predictor.putPosition(pos);
  }
  while (this.posArray.length > this.posStorageLength) {
    this.posArray.shift();
  }
  // TBD - try to keep the trend
}

vidteq._geoLocate.prototype.handleError = function (opt,err) {
  this.errored = true;
  var msg;
  switch(err.code) {
    case err.UNKNOWN_ERROR:
    msg = "Unable to find your location";
    break;
    case err.PERMISSION_DENIED:
    msg = "Permission denied in finding your location";
    break;
    case err.POSITION_UNAVAILABLE:
    msg = "Your location is currently unknown";
    break;
    case err.TIMEOUT:
    msg = "Attempt failed due to timeout";
    break;
    case err.BREAK:
    msg = "Attempt to find location took too long";
    break;
    default:
    msg = "Location detection not supported in browser";
  }
  this.error = msg;
  try { console.debug(msg); } catch (e) { }
}

vidteq._geoLocate.prototype.initAppMode = function (opt) {
  if (vidteq && vidteq.gui && vidteq.gui.appMode) { } else { return false; }
  this.callbackEarly = function (pos) {
    vidteq.gL.tempoFunc(pos.longitude,pos.latitude,pos.acc,pos.speed);
  };
  var that = this;
  var successFunc = 'goeLCallbackSuccess'+parseInt(10000*Math.random());
  window[successFunc] = function (opt,pos) {
    that.handleSuccess(opt,pos);
  };
  var errorFunc = 'goeLCallbackError'+parseInt(10000*Math.random());
  window[errorFunc] = function (opt,pos) {
    that.handleError(opt,pos);
  };
  StageWebViewBridge.call('initGeoLocation', null,successFunc,errorFunc);
  return true;
}

vidteq._geoLocate.prototype.getQueryString = function() {
  //if(window.location.search == "") {
  //  window.location.search = window.parent.location.search;
  //}
  if(window.location.search == "") {
    return null;
  }
  var qs = (function(a) {
    if (a == "") return {};
    var b = {};
    for (var i = 0; i < a.length; ++i) {
       var p=a[i].split('=');
       if (p.length != 2) continue;
       b[p[0]] = decodeURIComponent(p[1].replace(/\+/g," "));
    }
    return b;
  })(window.location.search.substr(1).split('&'));
  return qs;
}

vidteq._geoLocate.prototype.initTestMode = function (opt) {
  //var dateStr = 'bang-110414-T2';  // TBD any
  //var qs = this.getQueryString();
  //if (qs.date) { dateStr = qs.date; }
  //this.getVideoTracks(dateStr,function (pos) {
  //});
  opt.qs = this.getQueryString();
  opt.qs = opt.qs || {};
  
  var that = this;
  if ('trackPlay' in opt || opt.qs.trackPlay) {
    // this code is to ensure no sde effect when we track play TBD
    //this.src.track = true;
    var newOpt = opt.trackPlay || opt.qs.trackPlay;
    if (opt.qs.trackPlay) {
      newOpt = {};
      newOpt.dateStr =  opt.qs.trackPlay || 'bang-110414-T2';  // TBD any
      // TBD city
    }
    this.trackPlayer = new vidteq._geoLocate._trackPlayer(
      this
      ,function (pos) {
        that.handleSuccess({src:'player',type:'track'},pos);
      }
      ,newOpt
    );
  }
  if ('routePlay' in opt) {
    //this.doFindhood = false;
    this.routePlayer = new vidteq._geoLocate._routePlayer(
      opt.routePlay.startTn
      ,opt.routePlay.endTn
      ,function (pos) {
        that.handleSuccess({src:'player',type:'route'},pos);
      }
      ,opt.routePlay
    );
  }
  if ('predictPlayer' in opt) {
    this.predictPlayer = new vidteq._geoLocate._predictPlayer(
      this
      ,function (pos) {
        that.handleSuccess({src:'player',type:'predict'},pos);
      }
      ,opt.predictPlayer
    );
  }
}

vidteq._geoLocate.prototype.initJsGlMode = function (opt) {
  if (!navigator.geolocation) {
    this.handleError({code:-1});
    return;
  }
  var that = this;
  var lauchWP = function () {
    if (opt && opt.singlePos) {
      navigator.geolocation.getCurrentPosition(function (position) {
        that.handleSuccess({src:'js',type:'single'},position);
      },function (err) {
        that.handleError({src:'js',type:'single'},err);
      },{enableHighAccuracy:true, maximumAge:1000, timeout:5000});
    } else {
      that.wId = navigator.geolocation.watchPosition(function (position) {
        that.handleSuccess({src:'js',type:'single'},position);
      },function (err) {
        that.handleError({src:'js',type:'single'},err);
      },that.trackingParams
      );
    }
  };
  this.errored = false;
  this.error = "";
  if (this.trackingParams.timeout) {
    setTimeout(lauchWP,10);
  } else {
    lauchWP();
  }   
}

vidteq._geoLocate.prototype.init = function (opt) {
  //if (this.initAppMode(opt)) { return; }
  this.initTestMode(opt);
  //this.initJsGlMode(opt);
  return;
  if(true){
  } else {
    var lat='12.99280';
    var lon='77.73244';
    // TBD use center from the cfg
    setTimeout(function(){
      gL.findHood(lat,lon);
      gL.markRing(lat,lon);
      //    gL.markCarLocation(lat,lon);
    },2000);
  }
}

//vidteq._geoLocate.prototype.getAndClearPosArray = function () {
//  var ret = this.posArray;
//  this.posArray = [];
//  return ret;
//}

vidteq._geoLocate.prototype.findhood = function (pos,callback) {
  var lon = pos.longitude || pos.lon || pos.coords.longitude;
  var lat = pos.latitude || pos.lat || pos.coords.latitude;
  if (this.lF) {  // lF = lastFindhood
    var lF = this.lF;
    var cF = {
      lon:parseFloat(lon)
      ,lat:parseFloat(lat)
    };
    var dist = Math.sqrt(
      (lF.lon - cF.lon)*(lF.lon - cF.lon) 
      + (lF.lat - cF.lat)*(lF.lat - cF.lat)
    );
    if (this.ddToMeters(dist) < 50) {
      if (lF.callback) { 
        lF.callback.push(function (lFN) {
          var lon = pos.longitude || pos.lon || pos.coords.longitude;
          var lat = pos.latitude || pos.lat || pos.coords.latitude;
          var ll = {
            lon:parseFloat(lon)
            ,lat:parseFloat(lat)
            ,road:lFN.road
            ,area:lFN.area
          };
          if (lFN.city) { ll.city = lFN.city; }
          callback(ll);
        }); 
      } else {
        var ll = {
          lon:parseFloat(lon)
          ,lat:parseFloat(lat)
          ,road:lF.road
          ,area:lF.area
        };
        if (lF.city) { ll.city = lF.city; }
        callback(ll);
      }
      return;
    }
  }
  var data = {
    point:lon+' '+lat
    //,action:'findhood'
    ,action:'findAndSearch'
    ,account:'vidteq'
    ,key:'vidteq_bangalore'
  };
  if (this.lF && this.lF.city) { data.city = this.lF.city; }
  this.lF = {
    lon:parseFloat(lon)
    ,lat:parseFloat(lat)
    ,callback:[callback]
  };
  var that = this;
  var url = this.findhoodUrl;
  var dataType = this.findhoodType;
  (function () {  // to avoid duplicate calls 
    var lF = that.lF;
    $.ajax({
      //url:vidteq.cfg.magicHappensUrl
      url:url
      ,type:"GET"
      ,data:data
      ,dataType:dataType
      ,success: function (response) {
        if (typeof(response) == 'string') response=JSON.parse(response);
        if (response.error) {
          delete lF.callback;
          return; // TBD what to do
        }
        var res = response.srf[0].results;
        // TBD we need better error handling
        $.extend(lF,{
          road:res.roadName
          ,area:res.areaName
        });
        if (res.city) { lF.city = res.city; }
        var callbackA = lF.callback;
        delete lF.callback;
        for (var c in callbackA) { callbackA[c](lF); }
      },
      error:function(response) { 
      }
    }); 
  })();
}

// TBD duplicates are there
vidteq._geoLocate.prototype.ddToMeters = function(dd) {
  var meters = 6378137.0* Math.PI*dd/180.0;
  return meters;
}

vidteq._geoLocate.prototype.metersToDd = function(meters) {
  var dd = 180.0*meters/(6378137.0* Math.PI);
  return dd;
}

// TBD duplicates are there
vidteq._geoLocate.prototype.getDistance = function (d1,d2) {
  var dist = this.ddToMeters(Math.sqrt(
    (d1.lon-d2.lon)*(d1.lon-d2.lon)+
    (d1.lat-d2.lat)*(d1.lat-d2.lat)
  ));
  return dist;
}

vidteq._geoLocate.prototype.geoFlexCall = function (action) {
  switch(action){
    case "stop" : 
      StageWebViewBridge.call('startGeoLoc',null);
      break;
    case "start":
      StageWebViewBridge.call('stopGeoLoc',null);
      break;
  }
}


// predictor start
vidteq._geoLocate._predictor = function (locator,opt) {
  var opt = opt || {};
  //opt.predict = opt.predict || {};
  //this.posOpt = opt.predict;
  this.posOpt = opt;
  this.locator = locator;
  this.posArray = [];
  //this.trailHoldLength = opt.predict.trailHoldLength || 10;
  //this.predInterval = opt.predict.predInterval || 1000;
  this.trailHoldLength = opt.trailHoldLength || 10;
  this.predInterval = opt.predInterval || 1000;
  //this.mboxIf = new vidteq._geoLocateMboxIf(opt.predict.mbox,this,opt.predict);
  this.mboxIf = new vidteq._geoLocateMboxIf(opt.mbox,this,opt);
  // is it locator or this ? TBD
  this.installTimer();
}

vidteq._geoLocate._predictor.prototype.putPosition = function (pos) {
  this.posArray.push(pos);
  while (this.posArray.length > this.trailHoldLength) {
    this.posArray.shift();
  }
  // how 
  // trail is last 5 position such that it is perceptible movement
  // angle is angle of last two positions sufficently apart
  // 
  this.fillAndGetOneTrail(this.posArray,this.posArray.length-1,this.predInterval);
  //this.mboxIf.mbox = vidteq.mboxObj; // TBD temporary
  //try {
    var curTrail = [];
    for (var i = this.posArray.length-1;i>=0;i--) {
      if (!this.posArray[i].trail) { continue; }
      curTrail = curTrail.concat(this.posArray[i].trail);
      if (curTrail.length > 20) { break; }
    }
    //vidteq.mboxObj.plotMan(pos,curTrail);
    this.mboxIf.plotMan(pos,curTrail,this.posOpt);
    //StageWebViewBridge.call('callGenricFunc','plotMan',pos,curTrail);
    //StageWebViewBridge.call('callGenricFunc','plotManMove',pos,curTrail);
    //vidteq.gL.tempoFunc(pos.longitude,pos.latitude,pos.acc,pos.speed);
  //} catch (e) {
  //  console.log(e);
  //  console.log("not able to run Geol");
  //}
}

vidteq._geoLocate._predictor.prototype.fillAndGetSelfAsTrail = function (pos) {
  if (!('trail' in pos)) { pos.trail = []; }
  var curTime = pos.rcvdTime;
  var oneTrail = {
    lon:parseFloat(pos.longitude || pos.lon)
    ,lat:parseFloat(pos.latitude || pos.lat)
    ,ts:curTime
  };
  pos.trail.push(oneTrail);
  return oneTrail; 
}

// TBD why is it needed
//vidteq._geoLocate._predictor.prototype.getTrailHead = function (posArray,idx) {
//  if (!posArray[idx]) { return {head:null,idx:null}; }
//  var pos = posArray[idx];
//  if ('trail' in pos && pos.trail.length) {
//    return {
//      head:pos.trail[pos.trail.length-1]
//      ,idx:idx
//    }; 
//  }
//  if (!posArray[idx-1]) { return {head:null,idx:idx}; }
//  return this.getTrailHead(posArray,idx-1);
//}

vidteq._geoLocate._predictor.prototype.fillAndGetOneTrail = function (posArray,idx,interval) {
  if (!posArray[idx]) { return; }
  // first try to send ready made trail heads
  var pos = posArray[idx];
  if ('trail' in pos) {
    if (pos.trail.length) { return pos.trail[pos.trail.length-1]; }
    if (!posArray[idx-1]) { return; }
    return this.fillAndGetOneTrail(posArray,idx-1,interval);
  }
  // now fill 
  if (!('trail' in pos)) { pos.trail = []; }
  if (!posArray[idx-1]) {
    return this.fillAndGetSelfAsTrail(pos);
  }
  // now find diff and fill
  var posLast = posArray[idx-1];
  var curTrail = this.fillAndGetOneTrail(posArray,idx-1,interval);
  if (!curTrail) { // incase of some bug
    return this.fillAndGetSelfAsTrail(pos);
  }
  var startTimeInt = posLast.rcvdTime.getTime();
  var finalTimeInt = pos.rcvdTime.getTime();
  var startLon = parseFloat(posLast.longitude||posLast.lon);
  var startLat = parseFloat(posLast.latitude||posLast.lat);
  var finalLon = parseFloat(pos.longitude||pos.lon);
  var finalLat = parseFloat(pos.latitude||pos.lat);
  var totTime = finalTimeInt - startTimeInt;
  var spill = 0;
  if (curTrail) {
    var spill = startTimeInt - curTrail.ts.getTime();
  }
  var curTime = interval - spill;
  var curTimeInt = startTimeInt + curTime;
  while (curTimeInt < finalTimeInt) {
    var lon = (startLon - finalLon)* curTime/totTime + finalLon;
    lon = lon.toFixed(6);
    var lat = (startLat - finalLat)* curTime/totTime + finalLat;
    lat = lat.toFixed(6);
    var t = new Date();
    t.setTime(curTimeInt);
    var oneTrail = {
      lon:lon
      ,lat:lat
      ,ts:t
    };
    pos.trail.push(oneTrail);
    curTime += interval;
    curTimeInt = startTimeInt + curTime;
  }
  if (pos.trail.length) { return pos.trail[pos.trail.length-1]; }
  return curTrail;
}

vidteq._geoLocate._predictor.prototype.off = function () {
  if (this.timer) {
    clearInterval(this.timer);
  }
}

vidteq._geoLocate._predictor.prototype.installTimer = function () {
  var that = this;
  this.predictionOn = true;
  this.timer = setInterval(function () { 
    //that.mboxIf.mbox = vidteq.mboxObj; // TBD temporary
    var pos = that.doPrediction();
    if (that.predictionOn) {
      that.mboxIf.plotManMove(pos,pos?pos.trail:null,that.posOpt); 
    }
    that.predictionOn = true;
    if (!pos) { that.predictionOn = false; }
  },this.predInterval);
}

vidteq._geoLocate._predictor.prototype.doPrediction = function () {
  this.predictionCode = 'before length check'; 
  if (!this.posArray.length) { return; }
  // if sample is alone - we may not predict
  this.predictionCode = 'before length 1 check'; 
  if (this.posArray.length == 1) { return; }
  //
  // if sample is old we may not predict
  //  older the sample lesser the accuracy
  //  lesser the given positions accuracy, lower the predicted accuracy
  //  more roads are there lower accuracy - but that is later 
  //  how old the sample, that renders prediction useless ?
  //  IT should be around 1 to 10 seconds 
  //  Anything beyond just shut up, prediction is almost wrong, dont 
  //  within this predictable time 10 sec
  var curDate = new Date();
  var last0Pos = this.posArray[this.posArray.length-1];
  if (last0Pos.pred) {
    var pred = last0Pos.pred;
    if (pred.predOff) { return; }
    pred.predOff = true;
    pred.age = (curDate.getTime() - last0Pos.rcvdTime.getTime())/1000;
    this.predictionCode = 'before cached check'; 
    if (pred.age > 20) { return; }
    pred.r = this.locator.metersToDd(pred.speed * pred.age);
    pred.predOff = false;
    var pos = {
      longitude:(pred.lon+pred.r*Math.cos(pred.s)).toFixed(6)
      ,latitude:(pred.lat+pred.r*Math.sin(pred.s)).toFixed(6)
    };
    return pos;
  }
  var last0PosR = {
    lon:parseFloat(last0Pos.longitude || last0Pos.lon) 
    ,lat:parseFloat(last0Pos.latitude || last0Pos.lat)
    ,age:(curDate.getTime() - last0Pos.rcvdTime.getTime())/1000
    ,predOff:true
  };
  last0Pos.pred = last0PosR;

  this.predictionCode = 'before age 0 check'; 
  if (last0PosR.age > 20) { return; }
  // now get second sample
  var last1Pos = this.posArray[this.posArray.length-2];
  var last1PosR = {
    lon:parseFloat(last1Pos.longitude || last1Pos.lon) 
    ,lat:parseFloat(last1Pos.latitude || last1Pos.lat)
    ,age:(curDate.getTime() - last1Pos.rcvdTime.getTime())/1000
  };
  this.predictionCode = 'before age 1 check'; 
  if (last1PosR.age > 20) { return; }
  var ageDiff = last1PosR.age - last0PosR.age;
  this.predictionCode = 'before ageDiff check'; 
  if (ageDiff < 0.5) { return; } // 500 ms and below is stationary
  // Speed rule
  // if more than one sample is there - they should abide be speed rule
  // speed should be 0 to 60kmph
  //  outlier samples do not qualify for prediction
  //
  var dist = this.locator.getDistance(last0PosR,last1PosR);
  last0PosR.dist = dist;
  this.predictionCode = 'before dist check'; 
  if (dist < 1) { return; } // 1m or below is stationary
  var speed = dist/ageDiff;
  last0PosR.speed = speed;
  //  older samples contribute least prediction
  //  immediately older sample contribute to most
  // 
  this.predictionCode = 'before speed check'; 
  if (speed > 60*1000/(60*60)) { return; } // 60Kmph and above is wrong
  if (speed < 3*1000/(60*60)) { return; } // 1Kmph and above is wrong
  var r = this.locator.metersToDd(speed * last0PosR.age);
  var s = Math.atan2(last0PosR.lat-last1PosR.lat,last0PosR.lon-last1PosR.lon);
  last0PosR.predOff = false;
  last0PosR.r = r; 
  last0PosR.s = s; 
  var pos = {
    longitude:(last0PosR.lon+r*Math.cos(s)).toFixed(6)
    ,latitude:(last0PosR.lat+r*Math.sin(s)).toFixed(6)
  };
  return pos;
} 
// predictor ends here

// predictPlayer starts here
vidteq._geoLocate._predictPlayer = function (locator,callback,opt) {
  this.locator = locator;
  opt = opt || {};
  this.callback = callback;
  this.posArray = [];
  this.posArrayMax = opt.posArrayMax || 5;
  this.parkingWobbleDist = opt.parkingWobbleDist || 20; // meters
  this.parkingWobbleTimeMax = opt.parkingWobbleTimeMax || 10; // seconds
  this.parkingWobbleTimeMin = opt.parkingWobbleTimeMin || 1; // seconds
  this.firstSampleAgeLimit = 30;
  this.secondSampleAgeLimit = 40;
  // TBD network down probability
}

vidteq._geoLocate._predictPlayer.prototype.getOneMovingPos = function () {
  if (!this.posArray || !this.posArray.length) {
    return;
  }
  var pos = this.doPrediction();
  if (pos) { 
    this.curPos = pos;
    this.curPos.time = new Date();
    if (this.callback) { this.callback(this.curPos); }
  } else {
    this.getOneParkingPos(this.posArray[this.posArray.length-1]);
  }
}

vidteq._geoLocate._predictPlayer.prototype.getOneParkingPos = function (tiePos) {
  if (!tiePos) { 
    console.log("tie position not there but predictPlayer parking is on");
    return; 
  }
  var oneDist = Math.floor(Math.random() * this.parkingWobbleDist);
  var theta = Math.floor(Math.random() * 360);
  var lon = tiePos.lon + this.locator.metersToDd(oneDist * Math.sin(theta));
  lon = parseFloat(lon.toFixed(6));
  var lat = tiePos.lat + this.locator.metersToDd(oneDist * Math.cos(theta));
  lat = parseFloat(lat.toFixed(6));
  this.curPos = {
    longitude:lon
    ,latitude:lat
    ,time:new Date()
  }; // TBD time and accuracy
  if (this.callback) { this.callback(this.curPos); }
}

vidteq._geoLocate._predictPlayer.prototype.on = function (pos,opt) {
  if (pos) {
    var lon = parseFloat(pos.longitude || pos.lon); 
    var lat = parseFloat(pos.latitude || pos.lat);
    if (opt.mockDist) {
      var theta = Math.floor(Math.random() * 360);
      lon += this.locator.metersToDd(opt.mockDist * Math.sin(theta));
      lon = parseFloat(lon.toFixed(6));
      lat += this.locator.metersToDd(opt.mockDist * Math.cos(theta));
      lat = parseFloat(lat.toFixed(6));
    }
    var posH = {lon:lon,lat:lat,rcvdTime:new Date()};
  }
  if ('moving' in opt && opt.moving) {
    if (this.parking) { // transition
      this.tiePos.rcvdTime = new Date();
      this.posArray.push(this.tiePos); // TBD time
    }
    if (pos) { this.posArray.push(posH); }
    this.moving = true;
    this.parking = false;
  } else if ('parking' in opt && opt.parking) {
    if (this.moving && this.posArray.length) { // transition
      var one = this.posArray[this.posArray.length-1];
      this.tiePos = {
        lon:parseFloat(one.longitude || one.lon) 
        ,lat:parseFloat(one.latitude || one.lat) 
      };
    }
    if (pos) { this.tiePos = posH; }
    this.moving = false;
    this.parking = true;
  } else {
    if (pos && this.parking) { this.tiePos = posH; }
    if (pos && this.moving) { this.posArray.push(posH); }
  }
  if (this.timer) { clearInterval(this.timer); }
  var that = this;
  var oneRun = function () {
    if (!that.parking && !that.moving) { return; }
    var oneTime = that.parkingWobbleTimeMin + 
      Math.floor(Math.random() * 
      (that.parkingWobbleTimeMax-that.parkingWobbleTimeMin)); 
      // TBD check the boundaries
    that.timer = setTimeout(oneRun,oneTime*1000);
    if (that.parking) {
      that.getOneParkingPos(that.tiePos);
    }
    if (that.moving) {
      that.getOneMovingPos();
    }
  };
  oneRun();
}

vidteq._geoLocate._predictPlayer.prototype.off = function (opt) {
  this.parking = false;
  this.moving = false;
  if (this.timer) { clearInterval(this.timer); }
}

vidteq._geoLocate._predictPlayer.prototype.triggerPos = function (pos,opt) {
  this.posArray.push({
    lon:parseFloat(pos.longitude || pos.lon) 
    ,lat:parseFloat(pos.latitude || pos.lat) 
    ,rcvdTime:new Date()
  });
  while (this.posArray.length > this.posArrayMax) {
    this.posArray.shift();
  }
}

// following function is duplicated 
// we need to find some solution
vidteq._geoLocate._predictPlayer.prototype.doPrediction = function () {
  this.predictionCode = 'before length check'; 
  if (!this.posArray.length) { return; }
  // if sample is alone - we may not predict
  this.predictionCode = 'before length 1 check'; 
  if (this.posArray.length == 1) { 
    // TBD stationary positions are ok here
    return; 
  }
  //
  // if sample is old we may not predict
  //  older the sample lesser the accuracy
  //  lesser the given positions accuracy, lower the predicted accuracy
  //  more roads are there lower accuracy - but that is later 
  //  how old the sample, that renders prediction useless ?
  //  IT should be around 1 to 10 seconds 
  //  Anything beyond just shut up, prediction is almost wrong, dont 
  //  within this predictable time 10 sec
  var curDate = new Date();
  var last0Pos = this.posArray[this.posArray.length-1];
  if (last0Pos.pred) {
    var pred = last0Pos.pred;
    if (pred.predOff) { return; }
    pred.predOff = true;
    pred.age = (curDate.getTime() - last0Pos.rcvdTime.getTime())/1000;
    this.predictionCode = 'before cached check'; 
    //if (pred.age > 20) { return; }
    if (pred.age > this.firstSampleAgeLimit) { return; }
    pred.r = this.locator.metersToDd(pred.speed * pred.age);
    pred.predOff = false;
    var pos = {
      longitude:(pred.lon+pred.r*Math.cos(pred.s)).toFixed(6)
      ,latitude:(pred.lat+pred.r*Math.sin(pred.s)).toFixed(6)
    };
    return pos;
  }
  var last0PosR = {
    lon:parseFloat(last0Pos.longitude || last0Pos.lon) 
    ,lat:parseFloat(last0Pos.latitude || last0Pos.lat)
    ,age:(curDate.getTime() - last0Pos.rcvdTime.getTime())/1000
    ,predOff:true
  };
  last0Pos.pred = last0PosR;

  this.predictionCode = 'before age 0 check'; 
  //if (last0PosR.age > 20) { return; }
  if (last0PosR.age > this.firstSampleAgeLimit) { return; }
  // now get second sample
  var last1Pos = this.posArray[this.posArray.length-2];
  var last1PosR = {
    lon:parseFloat(last1Pos.longitude || last1Pos.lon) 
    ,lat:parseFloat(last1Pos.latitude || last1Pos.lat)
    ,age:(curDate.getTime() - last1Pos.rcvdTime.getTime())/1000
  };
  this.predictionCode = 'before age 1 check'; 
  //if (last1PosR.age > 20) { return; }
  if (last1PosR.age > this.secondSampleAgeLimit) { return; }
  var ageDiff = last1PosR.age - last0PosR.age;
  this.predictionCode = 'before ageDiff check'; 
  if (ageDiff < 0.5) { return; } // 500 ms and below is stationary
  // Speed rule
  // if more than one sample is there - they should abide be speed rule
  // speed should be 0 to 60kmph
  //  outlier samples do not qualify for prediction
  //
  var dist = this.locator.getDistance(last0PosR,last1PosR);
  last0PosR.dist = dist;
  this.predictionCode = 'before dist check'; 
  if (dist < 1) { return; } // 1m or below is stationary
  var speed = dist/ageDiff;
  last0PosR.speed = speed;
  //  older samples contribute least prediction
  //  immediately older sample contribute to most
  // 
  this.predictionCode = 'before speed check'; 
  if (speed > 60*1000/(60*60)) { return; } // 60Kmph and above is wrong
  if (speed < 3*1000/(60*60)) { return; } // 1Kmph and above is wrong
  var r = this.locator.metersToDd(speed * last0PosR.age);
  var s = Math.atan2(last0PosR.lat-last1PosR.lat,last0PosR.lon-last1PosR.lon);
  last0PosR.predOff = false;
  last0PosR.r = r; 
  last0PosR.s = s; 
  var pos = {
    longitude:(last0PosR.lon+r*Math.cos(s)).toFixed(6)
    ,latitude:(last0PosR.lat+r*Math.sin(s)).toFixed(6)
  };
  return pos;
} 
// predictPlayer ends here

// routePlayer starts here
// TBD not tested
vidteq._geoLocate._routePlayer = function (startIn,endIn,callback,opt) {
  // TBD if startTn or endTn are missing 
  // Time should be filled 
  // randomize the interval
  // also randomize the point 
  // TBD initialized by the caller
  this.callback = callback;
  if (opt.showWktFunc) {
    this.showWktFunc = opt.showWktFunc;
  }
  if (opt.hideWktFunc) {
    this.hideWktFunc = opt.hideWktFunc;
  }
  //this.mbox = vidteq.mboxObj;//added 
  //var that = this;
  //this.showWktFunc = function (wkt) {
  //  //that.mbox.displayRoute(response);
  //  return that.mbox.writeWkt(that.mbox.route,wkt);
  //};
  this.install(startIn,endIn,opt);
}

vidteq._geoLocate._routePlayer.prototype.hideWkt = function (wkt) {
  if (this.prevWktPtr && this.hideWktFunc) {
    this.hideWktFunc(this.prevWktPtr);
    delete this.prevWktPtr;
  }
}

vidteq._geoLocate._routePlayer.prototype.showWkt = function (wkt) {
  this.hideWkt();
  if (this.showWktFunc) {
    this.prevWktPtr = this.showWktFunc(wkt);
  }
}

vidteq._geoLocate._routePlayer.prototype.install = function (startIn,endIn,opt) {
  //if(this.cETimer) { clearInterval(this.cETimer);}
  opt = opt || {};
  if (!startIn && !endIn) { return; }
  var ends = {
    startOrig:startIn
    ,endOrig:endIn
  };
  ends.mockDist = (opt.mockDist)? opt.mockDist : 5000;
  this.fillStartEnds(ends);
  //if (!startIn) { startIn = this.getMockPoint(endIn,mockDist,10); }
  //if (!endIn) { endIn = this.getMockPoint(startIn,mockDist,-10); }
  var that = this;
  //this.getRoutePoints(startIn,endIn,function (wkt,start,end) { }
  this.getRoutePoints(ends,function (wkt,start,end) {
    if (that.goVidPendingOff) {
      that.goVidPendingOff = false;
      return;
    }
    var pArray = that.getPointsFromWkt(wkt);
    var startTime = (start.t || start.time).getTime();
    var endTime = (end.t || end.time).getTime();
    var interval = 2*1000; // milli seconds
    var noOfPoints = parseInt((endTime-startTime)/interval);
    that.installCycler({
      pArray:pArray
      //,noOfPoints:10*4
      ,noOfPoints:noOfPoints
      ,eachTime:interval
      //,eachTime:100
      //,lastPoint:endIn  // TBD to be checked
      ,lastPoint:end
      //,eachTime:10
      }
      ,function (t) {
        if (that.callback) { that.callback(t); }
      }
    );
  },opt);
}

vidteq._geoLocate._routePlayer.prototype.getPointsFromWkt = function (wkt) {
  wkt = wkt.toString().replace(/^MULTILINESTRING\(\(/,'');
  wkt = wkt.replace(/\)\)$/,'');
  var a = wkt.split(',');
  var ret = [];
  for (var i in a) {
    var t = a[i].toString().split(' ');
    ret.push({lon:t[0],lat:t[1]});
  }
  return ret; 
}

vidteq._geoLocate._routePlayer.prototype.off = function () {
  if (this.timer) {
    clearInterval(this.timer);
  }
  this.hideWkt();
  if (this.goVidPending) {
    this.goVidPendingOff = true;
  }
}

vidteq._geoLocate._routePlayer.prototype.installCycler = function (info,callback) {
  for (var i in info.pArray) {
    info.pArray[i].lon = parseFloat(info.pArray[i].lon);
    info.pArray[i].lat = parseFloat(info.pArray[i].lat);
  }
  var totalDist = this.getTotalDistance(info.pArray);
  info.totalDist = totalDist;
  info.oneDist = totalDist/info.noOfPoints;
  info.pIdx = 0;
  info.cumDist = 0;
  var ok = this.offsetPointArray(info);
  if (!ok) {
    console.log("something is wrong and not able to offset");
    console.log(info);
  }
  var that = this;
  var timerRunning = false;
  this.timer = setInterval(function () {
    timerRunning = true;
    var t = that.getNextPointInWkt(info);
    var lastPoint = info.lastPoint;
    t.distFromTar = that.getDistance(t,lastPoint);
    if (info.pIdx >= info.pArray.length) {
      clearInterval(that.timer);
      timerRunning = false;
      t.finalSample = true;
    }
    callback(t);
  },info.eachTime);
}

vidteq._geoLocate._routePlayer.prototype.offsetPointArray = function (info) {
  if (!info.lastPoint) { return false; }
  if (!info.lastPoint.t) { return false; }
  var endTn = info.lastPoint;
  var t = new Date();
  if (endTn.t.getTime() < t.getTime()) { return false; }
  // we need to run the show from now to endTn
  var runTime = parseInt(endTn.t.getTime() - t.getTime());
  var offsetIdx = info.noOfPoints - parseInt(runTime/info.eachTime);
  if (offsetIdx < 0) { return false; }
  if (offsetIdx == info.noOfPoints) { return false; }
  if (offsetIdx == 0) { return true; }
  while(offsetIdx) {
    offsetIdx--;
    this.getNextPointInWkt(info);
  };
  return true;
}

vidteq._geoLocate._routePlayer.prototype.getNextPointInWkt = function (info) {
  var pArray = info.pArray;
  var cumDist = info.cumDist;
  // we need to get next point at a distance of this.oneDist
  for (var i = info.pIdx+1; i<pArray.length; i++) {
    var dist = this.ddToMeters(Math.sqrt(
      (pArray[i].lat-pArray[i-1].lat)*(pArray[i].lat-pArray[i-1].lat)
      +(pArray[i].lon-pArray[i-1].lon)*(pArray[i].lon-pArray[i-1].lon)
    ));
    if (dist+cumDist < info.oneDist) { 
      cumDist += dist;
      continue; 
    }
    info.pIdx = i-1;
    var before = info.oneDist - cumDist;
    var after = dist+cumDist - info.oneDist;
    var lon = pArray[i-1].lon + 
      (pArray[i].lon - pArray[i-1].lon) * before/dist;
    var lat = pArray[i-1].lat + 
      (pArray[i].lat - pArray[i-1].lat) * before/dist;
    info.cumDist = -before;
    var ret = {lon:lon,lat:lat,time:new Date()};
    return ret;
  }
  //if(typeof(pArray[i]) == 'undefined') { this.pIdx = i-1; break;}
  info.pIdx = i;
  return ({
    lon:pArray[pArray.length-1].lon
    ,lat:pArray[pArray.length-1].lat
    ,time:new Date()
  }) // just for safety return last one
}

vidteq._geoLocate._routePlayer.prototype.getTotalDistance = function (pArray) {
  var dist = 0;
  for (var i in pArray) {
    var i = parseInt(i);
    if (i==0) { continue; }
    dist += Math.sqrt(
      (pArray[i].lon-pArray[i-1].lon)*(pArray[i].lon-pArray[i-1].lon)+
      (pArray[i].lat-pArray[i-1].lat)*(pArray[i].lat-pArray[i-1].lat)
    );
  }
  return this.ddToMeters(dist);
}

vidteq._geoLocate._routePlayer.prototype.getDistance = function (d1,d2) {
  var dist = this.ddToMeters(Math.sqrt(
    (d1.lon-d2.lon)*(d1.lon-d2.lon)+
    (d1.lat-d2.lat)*(d1.lat-d2.lat)
  ));
  return dist;
}

// TBD
vidteq._geoLocate._routePlayer.prototype.getRoutePointsOld = function (startIn,endIn,callback,opt) {
  var birdFlyDist = this.getDistance(startIn,endIn);
  if (opt.birdFly || birdFlyDist < 800) {  // less than 800 meters is bird fly
    this.birdFlyPlayer(startIn,endIn,function(pArray) {
      callback(pArray,startIn,endIn);
    });
    return;
  }

  if (!startIn && !endIn) { return; }
  var start = startIn;
  var end = endIn;
  if (!startIn) { start = this.getMockPoint(endIn,5000,10); }
  if (!endIn) { end = this.getMockPoint(startIn,5000,10); }
  var that = this;
  var startLon = start.lon||start.n.lon;
  var startLat = start.lat||start.n.lat;
  var endLon = end.lon||end.n.lon;
  var endLat = end.lat||end.n.lat;
  var that = this;
  this.goVid(startLon+','+startLat,endLon+','+endLat,function(res){
    // TBD check if respons is valid - if not - retry
    if(typeof(res.edge) == 'undefined') { 
      that.getRoutePointsOld(startIn,endIn,callback,opt);
      return;
    }
    //callback(res.edge.wkt,startIn,endIn);
    that.showWkt(res.edge.wkt);
    callback(res.edge.wkt,start,end);
    return;
  });
}

vidteq._geoLocate._routePlayer.prototype.fillStartEnds = function (ends) {
  ends.start = ends.startOrig || this.getMockPoint(ends.endOrig,ends.mockDist,10);
  ends.end = ends.endOrig || this.getMockPoint(ends.startOrig,ends.mockDist,-10);
}

vidteq._geoLocate._routePlayer.prototype.getRoutePoints = function (ends,callback,opt) {
  if (!('recurseGate' in ends)) { ends.recurseGate = 3; }
  var birdFlyDist = this.getDistance(ends.start,ends.end);
  if (opt.birdFly || birdFlyDist < 800 || ends.recurseGate <= 0) {  // less than 800 meters is bird fly
    this.birdFlyPlayer(ends.start,ends.end,function(pArray) {
      that.goVidPending = false;
      callback(pArray,ends.start,ends.end);
    });
    return;
  }
  var start = ends.start;
  var end = ends.end;
  var that = this;
  var startLon = start.lon||start.n.lon;
  var startLat = start.lat||start.n.lat;
  var endLon = end.lon||end.n.lon;
  var endLat = end.lat||end.n.lat;
  var that = this;
  this.goVidPending = true;
  this.goVid(startLon+','+startLat,endLon+','+endLat,function(res){
    if (!res.edge || !res.edge.wkt) { 
      ends.recurseGate--;
      that.fillStartEnds(ends);
      that.getRoutePoints(ends,callback,opt);
      return;
    }
    that.showWkt(res.edge.wkt);
    that.goVidPending = false;
    callback(res.edge.wkt,start,end);
    return;
  });
}

vidteq._geoLocate._routePlayer.prototype.birdFlyPlayer = function (startIn,endIn,callback) {
  var pArray = [];
  //var R = 1000;//random distance;
  //var theta = Math.floor(Math.random() * 360); 
  //var mockTn = this.getMockPoint(endIn,R,10,theta);
  //if(startIn) { mockTn = startIn;} 
  //pArray.push(mockTn.lon+" "+mockTn.lat);
  pArray.push(startIn.lon+" "+startIn.lat);
  pArray.push(endIn.lon+" "+endIn.lat);
  callback(pArray,startIn);
}

vidteq._geoLocate._routePlayer.prototype.getMockPoint = function (tN,dist,interval,theta) {
  // interval is in minutes
  var t = new Date();
  t.setTime(tN.t.getTime()-interval*60*1000);
  if(typeof(theta) != 'undefined') { } else {
    theta = Math.floor(Math.random() * 360);
  } 
  var lon = tN.lon + this.metersToDd(dist * Math.sin(theta));
  lon = lon.toFixed(6);
  var lat = tN.lat + this.metersToDd(dist * Math.cos(theta));
  lat = lat.toFixed(6);
  return {
    t:t
    ,lon:lon
    ,lat:lat
    ,geom:'POINT('+lon+' '+lat+')'
  };
}

vidteq._geoLocate._routePlayer.prototype.metersToDd = function (meters) {
  var dd = 180.0*meters/(6378137.0* Math.PI);
  return dd;
}

vidteq._geoLocate._routePlayer.prototype.ddToMeters = function(dd) {
  var meters = 6378137.0* Math.PI*dd/180.0;
  return meters;
}

// TBD
vidteq._geoLocate._routePlayer.prototype.goVid = function (from,to,callbackFunc) {
  var that = this;
  var handleGetRouteWrap = function (response) {
    //if (that.showWktFunc) { 
    //  that.showWktFunc(response.edge); 
    //}
    callbackFunc(response);
  } 
  var handleErrorWrap = function (response) {
    //that.gui.postGoVidRequest();
    //that.handleError(response);
    console.log("Route Player found error ");
    callbackFunc(response);
  }
  var data={
    action:"viaRoute",
    city:vidteq.cfg.city,
    //city:"bangalore",
    startaddress:from,
    endaddress:to,
    account:vidteq.vidteq.account,
    key:vidteq.vidteq.key,
    searchStartString:'none',
    searchEndString:'none'
  };
  this.glbAjxRoute=$.ajax({
    url:vidteq.cfg.magicHappensUrl,
    data:data,
    dataType:vidteq.vidteq.dataType,
    success:handleGetRouteWrap,
    error:handleErrorWrap
  }); 
  return 0;
}
// routePlayer end

/// tracker code
vidteq._geoLocate._tracker = function (locator,opt) {
  var opt = opt || {};
  this.locator = locator;
  this.posArray = [];
  this.reportAlive = true;
  this.reportAliveMax = 50;
  this.enableReporting = true;
  if ('reportAlive' in opt) { this.reportAlive = opt.reportAlive; }
  if ('reportAliveMax' in opt) { this.reportAliveMax = opt.reportAliveMax; }
  this.reportHoldLength = opt.reportHoldLength || 10;
  this.posStorageLength = opt.posStorageLength || 10;
  if (locator.posStorageLength >= this.reportHoldLength) {
    this.reportHoldLength = locator.posStorageLength -1;
  }
  this.reportHoldTime = opt.reportHoldTime || 15; // sec
  this.maxPastReportHolds = opt.maxPastReportHolds || 5;
  this.reportId = opt.reportId || Math.floor(Math.random() * 100000);
  this.reportUrl = opt.reportUrl || 'tracker/registerTrackerReport.php'; 
  this.reportDataType = opt.reportDataType || 'json';
  this.init(opt);
}

vidteq._geoLocate._tracker.prototype.init = function (opt) {
  //if (opt && (opt.reportHoldTime || opt.reportHoldLength)) { 
    // TBD check report time for integer
    this.startDate = new Date();
    this.lastGpsTimestamp = this.startDate.getTime();  // Should get gps time
    var that = this;
    if (opt.packTrackerData) { this.packTrackerData = opt.packTrackerData; }
    if (opt.trackerCallback) { this.callback = opt.trackerCallback; }
    this.timer = setInterval(function () { that.monitor(); },1000);
    if (opt.gpsStatusId) {
      this.lastGpsLocalTimestamp = this.startDate.getTime();
      this.gpsStatusId = opt.gpsStatusId;
    }
    if (opt.netStatusId) {
      this.lastNetTimestamp = this.startDate.getTime();
      this.netStatusId = opt.netStatusId;
    }
    if (opt.messageId) {
      this.lastGpsLocalTimestamp = this.startDate.getTime();
      this.messageId = opt.messageId;
    }
    if (opt.messageExtId) {
      this.messageExtId = opt.messageExtId;
      this.maxLogCount = opt.maxLogCount || 10;
      this.maxLogTime = opt.maxLogTime || 60 * 60 * 24 * 2 * 1000; // 2 days
    }
  //}
}

vidteq._geoLocate._tracker.prototype.off = function () {
  if (this.timer) {
    clearInterval(this.timer);
  }
}

vidteq._geoLocate._tracker.prototype.monitor = function () {
  this.updateGpsStatusColor();
  this.updateNetStatusColor();
  this.updateMessageStatus();
  this.report();
}

vidteq._geoLocate._tracker.prototype.getGpsMsg = function (lastMsg) {
  var myDate = new Date();
  var msg = "Detecting ...";
  if (!this.locator.permitted) { 
    msg = "Position not enabled, please enable it";
  } else if (this.locator.errored) {
    msg = "Error "+this.locator.error;
  } else if (
    this.locator.lastPos && 
    this.locator.lastPos.coords && 
    this.lastGpsTimestamp != this.locator.lastPos.timestamp) {
    var c = this.locator.lastPos.coords;
    this.lastGpsTimestamp = this.locator.lastPos.timestamp;
    this.lastGpsLocalTimestamp = myDate.getTime();
    this.updateGpsStatusColor();
    var age = this.getAgeOf(this.lastGpsLocalTimestamp);
    if (age != '') { age = " at "+age+"."; }
    else { age = "."; }
    msg = " Position "+c.longitude.toFixed(6)+" "+c.latitude.toFixed(6)+" "+c.accuracy+'m'+age;
    this.posId++;
  } else if (lastMsg) { 
    msg = lastMsg;
  }
  return msg;
}


vidteq._geoLocate._tracker.prototype.updateMessageStatus = function () {
  if (!this.messageId) { return; }
  var myDate = new Date();
  var lastMsg = $('#'+this.messageId+' a #msg').text();
  var msg = this.getGpsMsg();
  if (msg != lastMsg) {
    this.logCurMsg();
    var findHoodStuff = "";
    if (this.posId != this.lastPosId) { 
      findHoodStuff = '<span id=findhood_'+this.posId+' ></span>'; 
    }
    $('#'+this.messageId).html("<a><span timeStamp="+myDate.getTime()+" >"+myDate+"</span> <span id=msg >"+msg+"</span>"+findHoodStuff+"<br></a>");
  }
  this.updateLogAge();
  //this.launchFindHood();
  this.lastPosId = this.posId;
}

vidteq._geoLocate._tracker.prototype.logCurMsg = function () {
  if (!this.messageExtId) { return; }
  $('#'+this.messageExtId).prepend($('#'+this.messageId+' a'));
}

vidteq._geoLocate._tracker.prototype.updateLogAge = function () {
  var that = this;
  if (this.messageId) { 
    var curDate = new Date();
    $('#'+this.messageId+' a span').each(function () {
      if (!$(this).attr('timeStamp')) { return; }
      var timestamp = $(this).attr('timeStamp');
      var age = that.getAgeOf(timestamp);
      $(this).text(curDate+' since ('+age+')');
    });
  }
  if (this.messageExtId) {
    var logCount = 0;
    $('#'+this.messageExtId+' a span').each(function () {
      if (!$(this).attr('timeStamp')) { return; }
      logCount++;
      if (logCount > that.maxLogCount) { 
        $(this).parent().remove(); 
      }
      var timestamp = $(this).attr('timeStamp');
      if ((new Date()).getTime() - parseInt(timestamp) > that.maxLogTime) {
        $(this).parent().remove(); 
      }
      var age = that.getAgeOf(timestamp);
      $(this).text(age+":");
    });
  }
}

vidteq._geoLocate._tracker.prototype.report = function () {
  if (!this.enableReporting) { return; }
  if (this.posArray.length >= this.reportHoldLength) {
    this.postTheReport();
    return;
  }
  if (this.lastReportedTime) {
    var elapsed = (new Date()).getTime() - this.lastReportedTime;
    if (elapsed < this.reportHoldTime * 1000) { return; }
  }
  if (!(this.reportAlive || this.posArray.length)) { return; } 
  this.postTheReport();
}

vidteq._geoLocate._tracker.prototype.putPosition = function (pos) {
  this.posArray.push(pos);
  // tbd needs predictor ?
}

vidteq._geoLocate._tracker.prototype.getAndClearPosArray = function () {
  var ret = this.posArray;
  this.posArray = [];
  return ret;
}

vidteq._geoLocate._tracker.prototype.postTheReport = function () {
  this.lastReportedTime = (new Date()).getTime();
  var posA = this.getAndClearPosArray();
  if (!('reportAliveCount' in this)) { this.reportAliveCount = 0; }
  this.reportAliveCount++;
  if (posA.length) { this.reportAliveCount = 0; }
  if (this.reportAliveCount > this.reportAliveMax) {
    clearInterval(this.timer);
  }
  var toPost = {
    id:this.reportId,
    reportTime: this.lastReportedTime,
    positions: posA
  }
  if (this.pastReports && this.pastReports.length) {
    toPost.pastReports = this.pastReports;
  }
  var type = 'PUT';
  var data = {data:JSON.stringify(toPost)};
  if (this.packTrackerData) {
    var data = this.packTrackerData(toPost);
    type = 'GET'; // TBD why ?
  }
  var that = this;
  $.ajax({
    //type: 'PUT'
    type: type
    ,url: this.reportUrl
    ,data:data
    //,dataType:vidteq.vidteq.dataType
    ,dataType:this.reportDataType
    ,success: function(data) {
      if (that.pastReports) { delete that.pastReports; }
      that.lastNetTimestamp = (new Date()).getTime();
      if (that.callback) { that.callback(data,toPost); }
    }
    ,error:function () {
      if (toPost.pastReports) { delete toPost.pastReports; }
      if (!('pastReports' in that)) { that.pastReports = []; }
      that.pastReports.push(JSON.stringify(toPost));
      if (that.pastReports.length > that.maxPastReportHolds) {
        that.pastReports.shift();
      }
    }
  });
  // TBD message que need to be adjusted
}

vidteq._geoLocate._tracker.prototype.getAgeOf = function (oldTime) {
  var curDate = new Date();
  var ret = "";
  var diff = curDate.getTime() - parseInt(oldTime);
  if (diff < 0) { console.log("time is negative why ?"); diff = 0; }
  //var days = parseInt(diff / (24*60*60*1000));
  var days = Math.floor(diff / (24*60*60*1000));
  diff = diff - days * (24*60*60*1000);
  //var hours = parseInt(diff / (60*60*1000));
  var hours = Math.floor(diff / (60*60*1000));
  diff = diff - hours * (60*60*1000);
  //var minutes = parseInt(diff / (60*1000));
  var minutes = Math.floor(diff / (60*1000));
  diff = diff - minutes * (60*1000);
  //var seconds = parseInt(diff/1000);
  var seconds = Math.floor(diff/1000);
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
}

vidteq._geoLocate._tracker.prototype.getColorForAge = function (timestamp,divFactor) {
  var divFactor = divFactor || 1;
  var myDate = new Date();
  var diff = myDate.getTime() - parseInt(timestamp);
  var colorIndex = parseInt(diff/(1000*divFactor));
  var colorMap = [
    '#00ff00','#08f808','#0ff00f','#18e818',
    '#1fe01f','#28d828','#2fd02f','#38c838',
    '#3fc03f','#48b848','#4fb04f','#58a858',
    '#5fa05f','#689868','#6f906f','#788878',
    '#757575'
  ];
  if (typeof(colorMap[colorIndex]) != 'undefined') {
    return colorMap[colorIndex];
  }
  return colorMap[colorMap.length-1];
}

vidteq._geoLocate._tracker.prototype.updateGpsStatusColor = function () {
  if (!this.gpsStatusId) { return; }
  $('#'+this.gpsStatusId).css('background-color',
    this.getColorForAge(this.lastGpsLocalTimestamp)
  );
}

vidteq._geoLocate._tracker.prototype.updateNetStatusColor = function () {
  if (!this.netStatusId) { return; }
  $('#'+this.netStatusId).css('background-color',
    this.getColorForAge(this.lastNetTimestamp,this.reportHoldTime)
  );
}
/// tracker ended

// TrackPlayer
vidteq._geoLocate._trackPlayer = function(locator,callback,opt) {
  this.locator = locator;
  var opt = opt || {};
  this.callback = callback;
  opt.trackPlay = opt.trackPlay || {};
  this.speedup = 1;
  if ('speedup' in opt) { this.speedup = opt.speedup; }
  this.stop = false;
  this.init(opt);
}

vidteq._geoLocate._trackPlayer.prototype.init = function(opt) {
  if (!opt) { return; }
  if (opt.data) {
    this.installTrackPlay(opt.data,opt);
  }
  if (opt.dataStr) {
    var resultText = {
      action: "getVideoTracks",
      city: vidteq.cfg.city,
      dateStr: opt.dateStr
    }
    var that = this;
    //var handleVideoTrackResponseWrap = function (response) {
    //  that.handleVideoTrackResponse(response,dateStr,callback); 
    //}
    $.ajax({
      type: 'GET',
      url: './vidi/vs/softTouch.php',
      data: resultText,
      dataType: "json",
      success: function (response) {
        if (typeof(response) == 'string') response=JSON.parse(response);
        that.installTrackPlay(response.track,opt);
      }
    });
  }
}

//vidteq._geoLocate._trackPlayer.prototype.handleVideoTrackResponse = function (response) {
//  // TBD how to use date string ?
//  this.installTrackPlay(response.track,callback);
//}

//  arrow player code
vidteq._geoLocate._trackPlayer.prototype.installTrackPlay = function (trackIn,opt) {
  this.off();
  var track = {d:trackIn,type:'timeBased'};
  if (!trackIn.length) { return; }
  if (trackIn[0].legtime) { track.type = 'legtimeBased'; }
  return this.runOneTrackPlay(track,opt);
}

vidteq._geoLocate._trackPlayer.prototype.off = function () {
  if (this.timer) {
    clearTimeout(this.timer);
  }
}

vidteq._geoLocate._trackPlayer.prototype.runOneTrackPlay = function (track,opt) {
  //if (this.stop) { return false; }
  //if (track.idx > 5) { return false; }
  if (track.toSend && this.callback) {
    var that = this;
    setTimeout(function () {
      that.callback(track.toSend); 
    },10);
  }
  var curPoint = this.getNextPoint(track);
  if (!curPoint) { return false; }
  var refTime;
  if (track.type == 'timeBased') {
    if (!track.prevPoint) { 
      track.prevPoint = curPoint;
      if (opt && opt.realTime) {
        var curT = new Date();
        refTime = curPoint.t.getTime() - curT.getTime();
      } else {
        refTime = 10;
      }
      //var that = this;
      //this.timer = setTimeout(function () {
      //  that.runOneTrackPlay(track);
      //},10);
      //return false;
    } else {
      refTime = curPoint.t.getTime() - track.prevPoint.t.getTime();
      track.prevPoint = curPoint;
    }
  } else {
    var rTs = this.getTs('00:00:00');
    var legtime = curPoint.legtime || '00:00:00';
    var lTs = this.getTs(legtime);
    // lTs should be later than rTs to avoid negative time
    refTime = lTs.getTime()-rTs.getTime();
  }
  if (!refTime || refTime < 0) { refTime = 1; } // just 1ms if refTime is zero
  if (opt && opt.dontClip) { } else {
    if (refTime > 10*1000) { refTime = 10*1000; } // clip at 5 sec
  }
  refTime = Math.max(parseInt(refTime/this.speedup),1); 
  track.toSend = curPoint;
  var that = this;
  this.timer = setTimeout(function () {
    that.runOneTrackPlay(track,opt);
  },refTime);
  //if (this.callback) { this.callback(curPoint); }
  return true;
}

//vidteq._geoLocate._trackPlayer.prototype.runOneTrackPlayOld = function (track,callback) {
//  //if (this.stop) { return false; }
//  //if (track.idx > 5) { return false; }
//  var curPoint = this.getNextPoint(track);
//  if (!curPoint) { return false; }
//  var rTs = this.getTs('00:00:00');
//  var legtime = curPoint.legtime || '00:00:00';
//  var lTs = this.getTs(legtime);
//  // lTs should be later than rTs to avoid negative time
//  var refTime = lTs.getTime()-rTs.getTime();
//  if (!refTime || refTime < 0) { refTime = 1; } // just 1ms if refTime is zero
//  if (refTime > 10*1000) { refTime = 10*1000; } // clip at 5 sec
//  var that = this; 
//  var playTimer = setTimeout(function () {
//    that.runOneTrackPlay(track,callback);
//  },refTime);
//  callback(curPoint);
//  return true;
//}

vidteq._geoLocate._trackPlayer.prototype.getNextPoint = function(track) {
  if (!('idx' in track)) { track.idx = -1; }
  if(this.stop) {
  } else {
    track.idx++;
  }
  if (!track.d[track.idx]) { 
    //alert("No track ponts for index "+curIndex);
    return null;
  }
  var points;
  var cur = track.d[track.idx];
  if (cur.lon && cur.lat) {
    points = [{lon:cur.lon,lat:cur.lat}];
  } else if (cur.wkt) {
    points = this.getLatLongFromArrow(track.d[track.idx].wkt);
  } else if (track.prevPoint) {
    var prevPoints = track.prevPoint.points;
    var prevPoint = prevPoints[prevPoints.length-1];
    var curPointA = this.getLatLongFromArrow(cur.n);
    points = [ prevPoint ,curPointA[0] ];
  } else {
    points = this.getLatLongFromArrow(cur.n);
  }
  track.d[track.idx].points = points;
  track.d[track.idx].latitude = points[0].lat;
  track.d[track.idx].longitude = points[0].lon;
  return track.d[track.idx];
}

vidteq._geoLocate._trackPlayer.prototype.getLatLongFromArrow = function(arrowWkt) {
  var points = [];
  if (arrowWkt.match(/^[0-9\.][0-9\.]*,[0-9\.][0-9\.]*$/)) {
    var ll = arrowWkt.split(",");
    points.push({
      lon:ll[0]
      ,lat:ll[1]
      ,wkt:'POINT('+ll[0]+' '+ll[1]+')'
    });
    return points;
  }
  arrowWkt = arrowWkt.replace(/MULTILINESTRING\(\(/,'');
  arrowWkt = arrowWkt.replace(/\).*/,'');
  var points = [];
  var arr = arrowWkt.split(/,/);
  var arr0 = arr[0].split(/ /);
  points.push({
    lon:arr0[0]
    ,lat:arr0[1]
    ,wkt:'POINT('+arr0[0]+' '+arr0[1]+')'
  });
  var arr1 = arr[1].split(/ /);
  points.push({
    lon:arr1[0]
    ,lat:arr1[1]
    ,wkt:'POINT('+arr1[0]+' '+arr1[1]+')'
  });
  return points;
}

vidteq._geoLocate._trackPlayer.prototype.getTs = function(str,dateStr) {
  var ts = new Date();
  if (dateStr && dateStr == 'epoch') {
    ts.setTime(0);
  } else if (dateStr) {
    var year = parseInt('20'+dateStr.replace(/([0-9][0-9])([0-9][0-9])([0-9][0-9])/,'$3'));
    var month = parseInt(dateStr.replace(/([0-9][0-9])([0-9][0-9])([0-9][0-9])/,'$2'))-1;
    var day = parseInt(dateStr.replace(/([0-9][0-9])([0-9][0-9])([0-9][0-9])/,'$1'));
    ts.setFullYear(year,month,day);
  }
  var tA = str.toString().split(/:/);
  ts.setHours(tA[0]);
  ts.setMinutes(tA[1]);
  ts.setSeconds(tA[2]);
  return ts;
}
//  trackPlayer end 

vidteq._geoLocate.prototype.spoofLoc = function(){
  vidteq.gL.tempoFunc(vidteq.cfg.centerLon,vidteq.cfg.centerLat,null,null,null);
}

