if (typeof(vidteq) == 'undefined') { vidteq = {}; }

vidteq._linearResponse = function () {
  this.gui = vidteq.gui || {};
  this.io = this.gui.io || {};
}

vidteq._linearResponse.prototype.reviseStartEndInResponse = function (res) {
  //console.log('i am inside reviseStartEndInResponse');
  //console.log(res);
  //res.startAddress = res.startAddress || this.startAddress;
  //res.endAddress = res.endAddress || this.endAddress;
  res.startAddress = res.startAddress || this.startAddress;
  res.endAddress = res.endAddress || this.endAddress;
  if (typeof(res.busStops) != 'undefined') {
    res.startEntity = {
      index : -1, type: 'rcm', 
      lonlat : vidteq.utils.lonLatObjFrmPoint(res.busStops[0].geom),
      geom : res.busStops[0].geom,
      address : { name : res.busStops[0].name }
    };
    var l = res.busStops.length-1;
    res.endEntity = {
      index : -1, type: 'rcm', 
      lonlat : vidteq.utils.lonLatObjFrmPoint(res.busStops[l].geom),
      geom : res.busStops[l].geom,
      address : { name : res.busStops[l].name }
    };
    // TBD center interaction
  } else {
    var g = res.marker.split('+');
    //res.startEntity = res.startEntity || this.startEntity;     
    res.startEntity = res.startEntity || this.startEntity;     
    if (!res.startEntity.type || res.startEntity.type != 'center') {
      if (res.startEntity.lonlat &&
          !res.startEntity.lonlatOrig) {
        res.startEntity.lonlatOrig = res.startEntity.lonlat; 
      }
      res.startEntity.lonlat = { lon : g[0], lat : g[1] };
      if (res.startEntity.geom &&
          !res.startEntity.geomOrig) {
        res.startEntity.geomOrig = res.startEntity.geom; 
      }
      res.startEntity.geom = "POINT("+g[0]+" "+g[1]+")";
    }
    //res.endEntity = res.endEntity || this.endEntity;     
    res.endEntity = res.endEntity || this.endEntity;     
    if (!res.endEntity.type || res.endEntity.type != 'center') {
      if (res.endEntity.lonlat &&
          !res.endEntity.lonlatOrig) {
        res.endEntity.lonlatOrig = res.endEntity.lonlat; 
      }
      res.endEntity.lonlat = { lon : g[2], lat : g[3] };
      if (res.endEntity.geom &&
          !res.endEntity.geomOrig) {
        res.endEntity.geomOrig = res.endEntity.geom; 
      }
      res.endEntity.geom = "POINT("+g[2]+" "+g[3]+")";
    }
  }
  res.routeSummary={};
  //var a = res.summary.split("|");
  var dist = parseFloat(res.dist).toFixed(2);//a[0];
  var dur = res.videoTime;//a[1];
  res.routeSummary.distance = dist;
  res.routeSummary.videoDuration = dur;
  var HMS = dur.split(":");
  var S = parseInt(HMS[2]);
  var M = 60*parseInt(HMS[1]);
  var H = 3600*parseInt(HMS[0]);
  S += M+H;
  var vidScale = parseFloat(parseFloat(dist)/parseFloat(S));
  res.vidScale = vidScale;
  // some special people need it
  res.tdist = dist;
  res.ttime = dur;
  // some special people need it TBD why ?
  res.dname = vidteq.utils.dotify(res.endAddress,20);
}	

vidteq._linearResponse.prototype.reviseVideoInResponse = function(res) {
  var vid = res.videos;
  var videoIdx = 0;
  var videos = [];
  var idx = 0;
  for(var i in vid) {
    var oneVid = vid[i];
    if (!oneVid.video.match(/.flv$/)) {
      oneVid.video += '.flv';
    }
    oneVid['src'] = oneVid.video;
  }

  // first linearize
  //var vid = res.videos;
  //var videoIdx = 0;
  //var videos = [];
  //var idx = 0;
  //for (var i in vid) {
  //  var oneVid = vid[i];
  //  oneVid.video.cap = oneVid.cap;
  //  videos.push(oneVid.video);
  //  idx++;
  //  var numVids = parseInt(res.NumVvid[i]);
  //  for (var j=videoIdx;j<videoIdx+numVids;j++) {
  //    var oneVideo = res.video[j].VvidSource;
  //    videos.push(oneVideo);
  //    idx++;
  //  }
  //  videoIdx += numVids;
  //  oneVid.video.nextVid = idx;  
  //}
  //
  //var videoSrc = [];
  //$.each(videos,function(idx,elm) {
  //  videoSrc.push(elm.src);
  //});
  //res.allVideoLinks = videoSrc;

  //var vidVideoSrc = [];
  //$.each(videos,function(idx,elm) {
  //  if (elm.cap) { vidVideoSrc.push(elm.src); }
  //});
  //res.mainDpVideoLinks = vidVideoSrc;

  //var vidDur = 0;
  //$.each(videos,function(idx,elm) {
  //  if (elm.cap) { } else { 
  //    vidDur += parseInt(elm.duration||0, "10");
  //  }
  //});
  //res.vVidDuration = vidDur;  // some how legacy of opposite

  //var vVidDur = 0;
  //$.each(videos,function(idx,elm) {
  //  if (elm.cap) { 
  //    vVidDur += parseInt(elm.duration||0, "10");
  //  }
  //});
  //res.vidDuration = vVidDur;  // some how legacy of opposite
  //
  //var durations = [];
  //$.each(videos,function(idx,elm) {
  //  durations.push(elm.duration);
  //});
  //res.durations = durations;

  //var vidStarts = [];
  //$.each(videos,function(idx,elm) {
  //  if (elm.cap) { vidStarts.push(idx); }
  //});
  //res.vidStarts = vidStarts;
  //
  //var captions = [];
  //$.each(videos,function(idx,elm) {
  //  if (!elm.cap) { return; }
  //  captions.push((elm.cap.split("|"))[1]);  // TBD hash issue
  //});
  //res.captions = captions;

  //var nLimits = []; // I guess caption limits, is it not same as vidStart
  //$.each(videos,function(idx,elm) {
  //  if (elm.cap) nLimits.push(idx);
  //});
  //res.nLimits = nLimits

  //var cLimits = [];  // I guess cumulative limits
  //var tot = 0;
  //$.each(videos,function(idx,elm) {
  //  var d = parseFloat(elm.distance)*6378.137*Math.PI/180;
  //  tot += d; 
  //  cLimits.push(tot);
  //});

  //var rLimits = []; // I guess reverse limits
  //$.each(videos,function(idx,elm) {
  //  rLimits.push(tot-cLimits[idx]);
  //});
  //res.allLimits = rLimits;

  //var tLimits = []; // I guess total vid limits (within vids)
  //var cum = 0;
  //$.each(videos,function(idx,elm) {
  //  if (elm.cap) { cum = rLimits[idx]; }
  //  tLimits.push((cum - rLimits[idx]).toFixed(2));
  //});
  //res.tLimits = tLimits; 
}

vidteq._linearResponse.prototype.reviseCaptionInResponse = function(res) {
  //console.log('pass by ',res.videos);
  var pois = {};
  for (var i in res.pois) {
    if(typeof(pois[res.pois[i].road_gid]) == 'undefined') {
      pois[res.pois[i].road_gid] = [];
    }
    res.pois[i]['key'] = i;
    pois[res.pois[i].road_gid].push(res.pois[i]);
  }
  var passByOuter = [];
  var passBy = [];
  var capIndex = undefined;
  if(res.videos.length && typeof(res.videos[0]['caption']) != 'undefined') {
    capIndex = 0;
  }
  var imgData = [];
  for (var i in res.videos) {
    if('gids' in res.videos[i]) {
      var gids = res.videos[i].gids.replace(/([\{\}])/g,'').split(/,/g);
      //console.log('all gids ',gids);
      for(var innerKey in gids) {
        //console.log('pois inside ',pois[gids[innerKey]]);
        for(var lastKey in pois[gids[innerKey]]) {
          var passbyRes = {};
          passbyRes['name'] = pois[gids[innerKey]][lastKey].name;
          passbyRes['id'] = capIndex;
          passbyRes['idx'] = parseInt(capIndex);
          passBy.push(passbyRes);

          var imgDataT = {};
          imgDataT['poiName']=pois[gids[innerKey]][lastKey].name;
          imgDataT['imgName']=pois[gids[innerKey]][lastKey].path;
          imgDataT['id']=capIndex;
          if(typeof(OpenLayers)!='undefined') {
            var ab=vidteq.mboxObj.lonLatObjFrmPoint(pois[gids[innerKey]][lastKey].geom);
            imgDataT['lonlat'] = new OpenLayers.LonLat(ab.lon,ab.lat);
          }
          imgDataT['arrowHtml']='';
          imgData.push(imgDataT);
        }
      }
    }
    if(i < res.videos.length-1 && typeof(res.videos[parseInt(i)+1]['caption']) != 'undefined') {
      res.videos[capIndex]['passBy'] = passBy;
      capIndex = parseInt(i)+1;
      passBy = [];
    }
  }
  for (var i in res.videos) {
    var vid = res.videos[i];
    if(typeof(res.videos[i]['caption']) !='undefined' && res.videos[i]['caption'] != '') {
      vid.arrow = vid.dir; 
      vid.arrowSrc = this.io.getArrowSrc(vid.dir,false); 
      vid.arrowPrintSrc = this.io.getArrowSrc(vid.dir,true); 
      vid.direction = vid.caption;
    }
  }
  res['imgData']=imgData;
}

vidteq._linearResponse.prototype.getObjectVideo= function(videoResponse){
  console.log('gets inside getObjectVideo',videoResponse);
  var mainVideoObj = {};  
  mainVideoObj.videoList = [];  
  mainVideoObj.durationVideo = [];
  mainVideoObj.roadNames = [];
  
  var newVideoObject = '';
  //if('wowSecondPage' in vidteq) {
  //  if('playerActive' in this && !this.playerActive) {
  //    newVideoObject =  vidteq.gui.io.response;
  //  }
  //  newVideoObject = ioAreaObj.response;
  //} else {
  //  if (this.gui.wap) {
  //    newVideoObject = vidteq.mobUI.response;
  //  } 
  //  newVideoObject = this.gui.io.response;
  //}
  newVideoObject = videoResponse;

  //console.log('getObjectVideo ');
  //console.log(newVideoObject);
  mainVideoObj.videoObject = newVideoObject;
  
  //if (newVideoObject.srf) {
  //  this.fillVideoFromSrf(mainVideoObj,newVideoObject.srf[0].results[0]);
  //  return mainVideoObj;
  //} else if(newVideoObject.vid) {
  if(newVideoObject.vid) {
    mainVideoObj.curPlayIndex = 0;
    if (mainVideoObj.videoObject.curPlayIndex) { 
      mainVideoObj.curPlayIndex = mainVideoObj.videoObject.curPlayIndex;
    }

    var vidobj = mainVideoObj.videoObject.vid;  
    
    var vvidCount = 0;
    var cumDur = 0;
    var cumIndex = 0;
    mainVideoObj.durationVideo.push(cumDur);
    mainVideoObj.roadNames.push(vidobj[0].video.roadname);
    
    for(var i in vidobj) {
      var oneVideo = {};
      oneVideo.src = vidobj[i].video.src;
      oneVideo.cap = vidobj[i].cap;
      if (parseInt(i) == 0) { oneVideo.label = "Source"+": "; }
      else if (parseInt(i) == vidobj.length-1) { oneVideo.label = "Destination"+": "; }
      else { oneVideo.label = (parseInt(i) + 1)+": "; }
      oneVideo.label += this.extractCaption(vidobj[i].cap)+"."; 
      oneVideo.roadName = vidobj[i].video.roadname;
      oneVideo.cumDur = cumDur;
      oneVideo.dur = parseInt(vidobj[i].video.duration);
      oneVideo.metaDur = parseInt(vidobj[i].video.duration);
      oneVideo.scale = parseInt(1.0);
      oneVideo.mainIndex = i;
      oneVideo.subIndex = 0;
      oneVideo.cumIndex = cumIndex++;
      oneVideo.numItems = mainVideoObj.videoObject.NumVvid[i];
      oneVideo.startSeek = 0;
      oneVideo.endSeek = 0;
      if (parseInt(i) == 0) { oneVideo.startSeek = parseInt(mainVideoObj.videoObject.sourceHandle); }
      if (vidobj[i].video.caOverride) { oneVideo.caOverride = 1; }
      if (vidobj[i].video.url) { oneVideo.url = vidobj[i].video.url; }
      mainVideoObj.videoList.push(oneVideo);
      cumDur += parseInt(vidobj[i].video.duration) - oneVideo.startSeek; 
      mainVideoObj.durationVideo.push(cumDur);
      mainVideoObj.roadNames.push(vidobj[i].video.roadname);
      var numitem = mainVideoObj.videoObject.NumVvid[i];
    
      for (var j=0;j < mainVideoObj.videoObject.NumVvid[i] ;j++) {
        var oneVideoInner = {};
        oneVideoInner.src = mainVideoObj.videoObject.video[vvidCount].VvidSource.src;
        oneVideoInner.dur = parseInt(mainVideoObj.videoObject.video[vvidCount].VvidSource.duration);
        oneVideoInner.metaDur = parseInt(mainVideoObj.videoObject.video[vvidCount].VvidSource.duration);
        oneVideoInner.scale = parseInt(1.0);
        oneVideoInner.cumDur = cumDur;
        oneVideoInner.mainIndex = i;
        oneVideoInner.subIndex = j;
        oneVideoInner.cumIndex = cumIndex++;
        oneVideoInner.numItems = mainVideoObj.videoObject.NumVvid[i];
        oneVideoInner.startSeek = 0;
        oneVideoInner.endSeek = 0;
        if (mainVideoObj.videoObject.video[vvidCount].VvidSource.caOverride) { oneVideoInner.caOverride = 1; }
        if (mainVideoObj.videoObject.video[vvidCount].VvidSource.url) { oneVideoInner.url = mainVideoObj.videoObject.video[vvidCount].VvidSource.url; }
        mainVideoObj.videoList.push(oneVideoInner); 
        cumDur += parseInt(mainVideoObj.videoObject.video[vvidCount].VvidSource.duration);
        mainVideoObj.durationVideo.push(cumDur);
        mainVideoObj.roadNames.push(mainVideoObj.videoObject.video[vvidCount].VvidSource.roadname);
        vvidCount++;
      }
    }
    
    mainVideoObj.videoList[mainVideoObj.videoList.length-1].endSeek = parseInt(mainVideoObj.videoObject.endHandle);
    
    // null protection
    if (mainVideoObj.videoList.length == 1 && mainVideoObj.videoList[0].endSeek &&
          mainVideoObj.videoList[0].endSeek <= mainVideoObj.videoList[0].startSeek) { 
      mainVideoObj.videoList[0].endSeek = 0;  
    }
    if (mainVideoObj.videoList[mainVideoObj.videoList.length-1].endSeek) {
      mainVideoObj.durationVideo[mainVideoObj.durationVideo.length-1] -= mainVideoObj.videoList[mainVideoObj.videoList.length-1].dur - mainVideoObj.videoList[mainVideoObj.videoList.length-1].endSeek;
    }
    if (mainVideoObj.videoObject.customaudiooverride) { 
      //debugMsg("check And override set in video object ",1); 
      mainVideoObj.videoList[mainVideoObj.videoList.length-1].caOverride = 1;
    }
    //var videoUrl = vidteq._vidteqCfg.videoUrl;
    mainVideoObj.highBwUrl = newVideoObject.highBwUrl;  
    console.log("old final res is ");console.log(mainVideoObj);
    return mainVideoObj;
  } else {
    this.fillVideoFromSrf(mainVideoObj,newVideoObject);
    console.log("new final res is ");console.log(mainVideoObj);
    return mainVideoObj;
  }
  //}
}

vidteq._linearResponse.prototype.fillVideoFromSrf = function (mainVideoObj,vRoute) {
  mainVideoObj.videoObject = vRoute;
  mainVideoObj.curPlayIndex = 0;
  if (vRoute.curPlayIndex) { 
    mainVideoObj.curPlayIndex = vRoute.curPlayIndex;
  }
  
  var vidobj = vRoute.videos; 
  var cumDur = 0;
  var cumIndex = 0;
  var mainIndex = -1;
  var subIndex = 0;
  
  mainVideoObj.durationVideo.push(cumDur);
  mainVideoObj.roadNames.push(vidobj[0].roadName);
  
  for(var i in vidobj) {
    var oneVideo = {};
    if (vidobj[i].caption) {
      mainIndex++;
      subIndex = 0;
      oneVideo.src = vidobj[i].video;
      oneVideo.cap = vidobj[i].caption;
      if (parseInt(mainIndex) == 0) { 
        oneVideo.label = "Source"+": "; 
      } else if (parseInt(mainIndex) == vidobj.length-1) { 
        oneVideo.label = "Destination"+": "; 
      } else{ 
        oneVideo.label = (parseInt(mainIndex)+1)+": "; 
      }
      oneVideo.label +=vidobj[i].caption+"."; 
      oneVideo.roadName = vidobj[i].roadName;
      oneVideo.cumDur = cumDur;
      oneVideo.dur = parseInt(vidobj[i].dur);
      oneVideo.metaDur = parseInt(vidobj[i].dur);
      oneVideo.scale = parseInt(1.0);
      oneVideo.mainIndex = mainIndex;
      oneVideo.subIndex = subIndex;
      oneVideo.cumIndex = cumIndex++;
      oneVideo.startSeek = 0;
      oneVideo.endSeek = 0;
      if (parseInt(i) == 0) { oneVideo.startSeek = parseInt(vRoute.startHandle); }
      if (vidobj[i].caOverride) { oneVideo.caOverride = 1; }
      if (vidobj[i].url) { oneVideo.url = vidobj[i].video.url; }
      mainVideoObj.videoList.push(oneVideo);
      cumDur += parseInt(vidobj[i].dur) - oneVideo.startSeek; 
      mainVideoObj.durationVideo.push(cumDur);
      mainVideoObj.roadNames.push(vidobj[i].roadName);
    } else {
      subIndex++;
      oneVideo.src = vidobj[i].video;
      oneVideo.dur = parseInt(vidobj[i].dur);
      oneVideo.metaDur = parseInt(vidobj[i].dur);
      oneVideo.scale = parseInt(1.0);
      oneVideo.cumDur = cumDur;
      oneVideo.mainIndex = mainIndex;
      oneVideo.subIndex = subIndex;
      oneVideo.cumIndex = cumIndex++;
      oneVideo.startSeek = 0;
      oneVideo.endSeek = 0;
      if (vidobj[i].caOverride) { oneVideo.caOverride = 1; }
      if (vidobj[i].url) { oneVideo.url = vidobj[i].video.url; }
      mainVideoObj.videoList.push(oneVideo);
      cumDur += parseInt(vidobj[i].dur) - oneVideo.startSeek; 
      mainVideoObj.durationVideo.push(cumDur);
      mainVideoObj.roadNames.push(vidobj[i].roadName);
    }
  }
  mainVideoObj.videoList[mainVideoObj.videoList.length-1].endSeek = parseInt(vRoute.endHandle);
  
  // null protection
  if (mainVideoObj.videoList.length == 1 && mainVideoObj.videoList[0].endSeek &&
        mainVideoObj.videoList[0].endSeek <= mainVideoObj.videoList[0].startSeek) { 
    mainVideoObj.videoList[0].endSeek = 0;  
  }
  if (mainVideoObj.videoList[mainVideoObj.videoList.length-1].endSeek) {
    mainVideoObj.durationVideo[mainVideoObj.durationVideo.length-1] -= mainVideoObj.videoList[mainVideoObj.videoList.length-1].dur - mainVideoObj.videoList[mainVideoObj.videoList.length-1].endSeek;
  }
  if (vRoute.customaudiooverride) { 
    //debugMsg("check And override set in video object ",1); 
    mainVideoObj.videoList[mainVideoObj.videoList.length-1].caOverride = 1;
  }
  //mainVideoObj.vidiObj = true;
  //var videoUrl = vidteq._vidteqCfg.videoUrl;
  mainVideoObj.highBwUrl = vRoute.highBwUrl;  
  //mainVideoObj.highBwUrl = videoUrl;  
  //mainVideoObj.highBwUrl = videoUrl;  
  //vRoute.highBwUrl = videoUrl;
  //console.log("new final res is ", mainVideoObj);
}

vidteq._linearResponse.prototype.extractCaption = function (caption) {
  var pArray = [];
  pArray = caption.split("|");
  var dArray = [];
  dArray = pArray[1].split(".");
  return dArray[0];
}

