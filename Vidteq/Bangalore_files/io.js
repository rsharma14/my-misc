if (typeof(vidteq) == 'undefined') { vidteq = {}; }

vidteq._io = function (gui) {
  this.gui = gui;
  if(!vidteq.vidNav) 
    gui.io = this;
}

// NearBy Stores NBS

vidteq._io.prototype.addAndLocateNBS = function (myLoc,tipIn) {
  var tip = (typeof(tipIn)=='undefined')?'start':tipIn;
  this.gui.dirFromTo(tip,myLoc,true);
  this.locateNBS(myLoc);
  //vidteq.routeEndsObj.refresh(tip);
}

vidteq._io.prototype.locateNBS = function (myLoc) {
  myLoc.sortby = myLoc.sortby || "distance";
  this.gui.detachCenter();
  this.gui.preRequest('srf','locateSheer');
  this.startEntity = myLoc;
  //this.startEntity.icon = vidteq.mboxObj.startIcon;  // TBD
  this.startEntity.icon = vidteq.routeEndsObj.startIcon;  // TBD
  if (this.startEntity.markIcon) { delete this.startEntity.markIcon; }
  this.startEntity.index = -1;
  this.startEntity.reqSeed = '';
  this.startEntity.type = 'rcm';
  this.gui.embed.locateStores.myLocStr = myLoc.address.name;
  var data={
    action:"locateStores",
    city:vidteq.cfg.city,
    sortby:myLoc.sortby,
    storeid:this.gui.embed.locateStores.storeId,
    geom:myLoc.geom,
    limit:(typeof(this.gui.embed.locateStores.limit)!='undefined')?this.gui.embed.locateStores.limit:'',
    account:vidteq.vidteq.account,
    key:vidteq.vidteq.key
  };
  if(vidteq.vidteq.scriptBased) data.callbackFunction='ioAreaObj.handleLocateStoresCall';    
  var that = this;
  var handleLocateNBSWrap = function (response) {
    that.locateNBSSrf = response;
    if(typeof(response)=='object') that.locateNBSSrf = JSON.stringify(response);
    that.gui.postRequest('locateSheer');
    that.handleLocate(response);
    if (that.gui.mode == 'ROUTE') { that.gui.dirFromTo('end',response.srf[0].results[0],true); }
    that.locateNBSComplete=true;
    that.gui.displayMessage(that.gui.defaultLocateStoresMessage);
  }
  var handleErrorWrap = function (response) {
    that.gui.postRequest('locateSheer');
    that.handleError(response);
  } 
  if (!this.locateNBSSrf || 
      (this.locateNBSMyLocGeom && this.locateNBSMyLocGeom != myLoc.geom)) {
    this.locateNBSMyLocGeom = myLoc.geom;
    this.locateNBSComplete=false;
    myLoc.geom = myLoc.geom.replace(/\+/," ");  // TBD not sure needed
    this.glbAjxNBS=$.ajax({
      url:vidteq.cfg.magicHappensUrl,
      dataType:vidteq.vidteq.dataType,
      data:data,
      success:handleLocateNBSWrap,
      error:handleErrorWrap
    });
  } else {
    handleLocateNBSWrap(this.locateNBSSrf);
  }
}

// NearBy Business NBB
vidteq._io.prototype.getNbb = function(myLoc,cat,opt) {
  opt = opt || {};
  if (opt.preCallback) { 
    if (!opt.preCallback()) { return false; }
  }
  var that = this;
  var handleGetNbbWrap = function (res) {
    if(typeof(res)=='string') res=JSON.parse(res);
    // TBD myLoc needs to embed
    // TBD
    try {
      pageTracker._trackPageview("/route_"+vidteq.vidteq.account);
    } catch(err) {};
    if (opt.postCallback) { opt.postCallback(res); }
    if (opt.handleGetNbb) {
      opt.handleGetNbb(res,opt);
    }
  } 
  var handleErrorWrap = function (res) {
    if (opt.postCallback) opt.postCallback(res);
    that.handleError(res);
  }
  var data = {
    action:"businessLocate"
    ,city:vidteq.cfg.city            
    ,account:vidteq.vidteq.account || 'VidTeq'
    ,key:vidteq.vidteq.key || 'key'
    ,center:myLoc.lonlat.lon+","+myLoc.lonlat.lat
    ,category:cat.categoryList
    ,distance:cat.dist
    ,limit:cat.limit
  };
  if (this.gui && this.gui.embed) {
    // TBD check if it stil works
    data.mygid=vidteq.aD.mygid;
    if(vidteq.aD.config.sortby) data.sortby=vidteq.aD.config.sortby;
  }
  this.glbAjxRoute=$.ajax({
    url:vidteq.cfg.magicHappensUrl,
    data:data,
    dataType:vidteq.vidteq.dataType,
    success:handleGetNbbWrap,
    error:handleErrorWrap
  });
}

// Get Route section
vidteq._io.prototype.getEntity = function(startOrEnd,opt) {
  //var id = 'endtextbox';
  var preReqKey = 'preReqEnd';
  var key = 'end';
  var icon = 'endIcon';
  if (startOrEnd) { 
    //id = 'starttextbox'; 
    preReqKey = 'preReqStart';
    key = 'start';
    icon = 'startIcon';
  }
  var e = {};
  //e.preReq = vidteq.utils.trim($('#'+id).val()) || opt[preReqKey];
  e.preReq = opt.keyBox && opt.keyBox[key]? vidteq.utils.trim(opt.keyBox[key].val()) : opt[preReqKey];
  e.str = vidteq.routeEndsObj.get.apply(vidteq.routeEndsObj,[key]);
  if (!e.str) {
    e.str = e.preReq;
    e.tip = {
      address :{name : e.preReq}
      ,reqSeed : e.preReq
    };
    //console.log("suggested object "); 
    //console.log(key);
    //console.log(opt.keyBox[key]);
    //console.log(opt.keyBox[key].suggestedObj);
    if (opt.keyBox[key].suggestedObj) {
      e.tip.suggested = opt.keyBox[key].suggestedObj;
      if (e.tip.suggested.label) {
        e.tip.address.name = e.tip.suggested.label; 
      }
      //TBD for road center may be needed
      if (e.tip.suggested.geom) {
        e.tip.geom = e.tip.suggested.geom; 
        var p = vidteq.utils.lonLatObjFrmPoint(e.tip.geom);
        e.str = p.lon+","+p.lat;
      }
    }
  } else {
   // console.log("from route ends ");
    e.tip = vidteq.routeEndsObj.tips[key];
  }
  e.linkStr = e.str;  // just in case
  if (!e.tip.type || (e.tip.type != 'center' && e.tip.type != 'employee')) { 
    // TBD check - It should be that if srf type is there then assign as rcm
    //this.startEntity.icon = vidteq.mboxObj.startIcon;
    if(this.gui.openScale) { 
      e.tip.icon = vidteq.routeEndsObj[icon];
      e.tip.index = -1;
      e.tip.type = 'rcm';
    }
    vidteq.routeEndsObj.remove(key);
  }
  return e;
}

vidteq._io.prototype.goVid = function( options ) {
  // for compatibility
  options = options || {};
  var that = this;
  if (!options.preCallback && this.gui) {
    options.preCallback = function () {
      if (!that.gui.preGoVidRequest()) { return false; }
      return true;
    };
  }
  if (!options.postCallback && this.gui) {
    options.postCallback = function () {
      that.gui.postGoVidRequest();
    };
  }
  if (this.gui && this.gui.mode == 'LOCATE') {
    options.locate = true;
  }
  if (!options.keyBox && this.gui) {
    options.keyBox = this.gui.keyBox;
  }
  if (!options.handleGetRoute) {
    options.handleGetRoute = function (res,options) {
      that.handleGetRoute(res,options);
    };
  }
  if (!options.handleLocate) {
    options.handleLocate = function (res,options) {
      that.handleLocate(res,options);
    };
  }
  if (!options.handleError) {
    options.handleError = function (res,options) {
      that.handleError(res,options);
    };
  }
  this.goVidInner(options);
}

vidteq._io.prototype.goVidLocate = function(entity,options) {
  var that = this;
  var handleLocateWrap = function (res) {
    if (options.postCallback) options.postCallback(res);
    if (options.handleLocate) {
      options.handleLocate(res,options);
    }
  } 
  var handleErrorWrap = function (res) {
    if (options.postCallback) options.postCallback(res);
    if (options.handleError) {
      options.handleError(res);
    } 
  }

  var place = {
    category:''
    ,label:entity.str
  }
  if (entity.tip.suggested) {
    place = entity.tip.suggested;
  }
  var places = [place];

  var data = {
    action:"businessSearch"
    ,city:vidteq.cfg.city
    //,place:entity.str
    ,places:encodeURIComponent(JSON.stringify(places))
    ,account:vidteq.vidteq.account || 'VidTeq'
    ,key:vidteq.vidteq.key || 'key'
  };
  this.createLink(0,entity);
  if (typeof(qSrfResponse) != 'undefined') {
    qSrfResponse.renderedInServer = true; 
    handleLocateWrap(qSrfResponse);
    delete qSrfResponse;
  } else {
    var searchScript = 'vs/search-script.php';
    if('pathPre' in vidteq) {
      searchScript = vidteq.pathPre + 'vs/search-script.php';
    }
    this.glbAjxLoc=$.ajax({
      //url:vidteq.cfg.magicHappensUrl,
      url:searchScript,
      data:data,
      //suggestedplace:this.suggestedPlace,
      dataType:vidteq.vidteq.dataType,
      success:handleLocateWrap,
      error:handleErrorWrap
    });
  }
}

vidteq._io.prototype.fillNemoVideoCookie = function(startEntity,endEntity,options) {
  if( typeof vidteq.aD !=="undefined" && typeof vidteq.aD.nemoQ !== 'undefined' ) {
    if( this.gui.cookieOptions ) {
      //TBD: extends cookieOptions
      this.gui.cookieOptions.storeAs = (function(io,start,end) {
        //TBD: sanitize it and remove special characters so that valid object key can be prepared with it 
        var ft = io.createLink(1,start,end);
        return ( ft.center.address || {} ).name;
      })(this,startEntity,endEntity);
      
      if( typeof options.cookieOptions === 'undefined' ) options.cookieOptions = this.gui.cookieOptions;
      if( typeof options.enabledVideoCountCookie === 'undefined' ) options.enabledVideoCountCookie = true;
    }
  }
}

vidteq._io.prototype.goVidRoute = function(startEntity,endEntity,options) {
  var that = this;
  this.goVidRouteStage1(
    startEntity
    ,endEntity
    ,options
    ,function (startEntity,endEntity,options,searchRes) {
      //console.log("stage 2 start start ");console.log(startEntity);
      //console.log("stage 2 start end ");console.log(endEntity);
      //console.log("stage 2 start res ");console.log(searchRes);
      that.goVidRouteStage2(startEntity,endEntity,options,searchRes);
    }
  ); 
}


vidteq._io.prototype.goVidRouteStage1 = function(startEntity,endEntity,options,callback) {
  if (startEntity.tip.geom && endEntity.tip.geom) {
    callback(startEntity,endEntity,options);
    return;
  }
  if (typeof(qSrfResponse) != 'undefined') {
    var startEntity = {tip:vidteq.ftRule.start};
    startEntity.tip.linkStr = startEntity.tip.address.name;
    var endEntity = {tip:vidteq.ftRule.end};
    endEntity.tip.linkStr = endEntity.tip.address.name;
    qSrfResponse.startEntity = startEntity;
    qSrfResponse.endEntity = endEntity;
    callback(startEntity,endEntity,options);
    return;
  }
  var replaceStartEntity = null;
  var replaceEndEntity = null;
  var handleSearchWrap = function (res) {
    if (typeof(res) == 'string') { res = JSON.parse(res); }
    var searchOk = true;
    var failedRes = {
      type:'jsGenerated'
      ,responseType:'ss'
      ,srf:[{
        srfIndex:0
        ,srfType:'startAddress'
        ,results:[startEntity.tip]
      },{
        srfIndex:1
        ,srfType:'endAddress'
        ,results:[endEntity.tip]
      }]
    };
    if (replaceStartEntity) {
      if (!replaceStartEntity(res,failedRes)) { searchOk = false; }
    }
    if (replaceEndEntity) {
      if (!replaceEndEntity(res,failedRes)) { searchOk = false; }
    }
    if (searchOk) {
      callback(startEntity,endEntity,options);
    } else {
      callback(startEntity,endEntity,options,failedRes);
    }
  }; 
  var handleErrorWrap = function (res) {
    if (options.postCallback) options.postCallback(res);
    if (options.handleError) {
      options.handleError(res);
    } 
  }
  var places = [];
  if (!startEntity.tip.geom) {
    var startIdx = places.length; 
    replaceStartEntity = function (res,failedRes) {
      var srf = res.srf[startIdx];
      srf.srfIndex = 0;
      srf.srfType = 'startAddress';
      failedRes.srf[0] = srf;
      var resType = 's';
      if (!srf.results.length) { resType = 'f'; }
      if (srf.results.length>1) { resType = 'm'; }
      failedRes.responseType = failedRes.responseType.replace(/^./,resType);
      if (srf.results.length == 1) {
        startEntity.tip = srf.results[0];
        var g = startEntity.tip.center || startEntity.tip.geom;
        // for roads and area
        var p = vidteq.utils.lonLatObjFrmPoint(g);
        startEntity.str = p.lon+","+p.lat;
        startEntity.tip.address = {name : startEntity.tip.name};
        delete startEntity.tip.name; 
        // TBD other fields
        return true;
      }
      return false;
    };
    places.push({
      category:''
      ,label:startEntity.str
    });
  }
  if (!endEntity.tip.geom) {
    var endIdx = places.length; 
    replaceEndEntity = function (res,failedRes) {
      var srf = res.srf[endIdx];
      srf.srfIndex = 1;
      srf.srfType = 'endAddress';
      failedRes.srf[1] = srf;
      var resType = 's';
      if (!srf.results.length) { resType = 'f'; }
      if (srf.results.length>1) { resType = 'm'; }
      failedRes.responseType = failedRes.responseType.replace(/.$/,resType);
      if (srf.results.length == 1) {
        endEntity.tip = srf.results[0];
        var g = endEntity.tip.center || endEntity.tip.geom;
        // for roads and area
        var p = vidteq.utils.lonLatObjFrmPoint(g);
        endEntity.str = p.lon+","+p.lat;
        endEntity.tip.address = {name : endEntity.tip.name};
        delete endEntity.tip.name; 
        // TBD other fields
        return true;
      }
      return false;
    };
    places.push({
      category:''
      ,label:endEntity.str
    });
  }
  var data = {
    action:"businessSearch"
    ,city:vidteq.cfg.city
    ,places:encodeURIComponent(JSON.stringify(places))
    ,account:vidteq.vidteq.account || 'VidTeq'
    ,key:vidteq.vidteq.key || 'key'
  };
  if(options.appMode!='undefined' && options.appMode) data.appMode=true;
  var searchScript = 'vs/search-script.php';
  if('pathPre' in vidteq) {
    searchScript = vidteq.pathPre + 'vs/search-script.php';
  }
  this.glbAjxRoute=$.ajax({
    url:searchScript,
    data:data,
    dataType:vidteq.vidteq.dataType,
    success:handleSearchWrap,
    error:handleErrorWrap
  });
}

vidteq._io.prototype.goVidRouteStage2 = function(startEntity,endEntity,options,searchRes) {
  var that = this;
  var handleGetRouteWrap = function (res) {
    //that.gui.startOrEnd = {startEntity:that.startEntity,endEntity:that.endEntity};
    // needs check
    if(typeof(that.gui.html5VideoParams) != 'undefined' && (!that.gui.flashPlayer || that.gui.singlePlayer)){
      res = JSON.parse(JSON.stringify(res).replace(/.flv/gi,that.gui.html5VideoParams.extension));
    }
    if(typeof(res)=='string') res=JSON.parse(res);
    res.startEntity = startEntity.tip;
    res.endEntity = endEntity.tip;
    res.startAddress = startEntity.tip.address.name;
    res.endAddress = endEntity.tip.address.name;
    that.fillNemoVideoCookie(startEntity,endEntity,options);
    
    try {
      pageTracker._trackPageview("/route_"+vidteq.vidteq.account);
    }catch(err) {};
    if (options.postCallback) { options.postCallback(res); }
    if (options.handleGetRoute) {
      options.handleGetRoute(res,options);
    }
  }
  if (searchRes) { // search Failed to get routable ends
    handleGetRouteWrap(searchRes);
    return;
  }
  if (typeof(qSrfResponse) != 'undefined') {
    qSrfResponse.renderedInServer = true;
    handleGetRouteWrap(qSrfResponse);
    delete qSrfResponse;
    return;
  }
   
  var handleErrorWrap = function (res) {
    if (options.postCallback) options.postCallback(res);
    if (options.handleError) {
      options.handleError(res);
    } 
  }
  if (vidteq.aD && vidteq.aD.switchToAppFromBrowser) {
    this.createLink(0,startEntity,endEntity);
    vidteq.vidteq.switchToAppFromBrowser(); 
  }
  var data = {
    action:"viaRoute"
    ,city:vidteq.cfg.city
    ,startaddress:startEntity.str
    ,endaddress:endEntity.str
    ,account:vidteq.vidteq.account || 'VidTeq'
    ,key:vidteq.vidteq.key || 'key'
    ,searchStartString:startEntity.preReq
    ,searchEndString:endEntity.preReq
  };
  if(typeof(options.appMode)!='undefined' && options.appMode) data.appMode=true;
  if (this.gui && this.gui.embed) {
    // TBD check if it stil works
    data.mygid=vidteq.aD.mygid;
    if(vidteq.aD.config.sortby) data.sortby=vidteq.aD.config.sortby;
  }
  var viaString;
  if ((viaString = vidteq.routeEndsObj.getViaString()) !== null) {data.via = viaString;}
  this.link=encodeURI("?q=route&city="+vidteq.cfg.city+"&start="+startEntity.str+"&end="+endEntity.str);
  // TBD this link has some problem with str failure
  
  this.glbAjxRoute=$.ajax({
    url:vidteq.cfg.magicHappensUrl,
    data:data,
    dataType:vidteq.vidteq.dataType,
    success:handleGetRouteWrap,
    error:handleErrorWrap
  });
}

vidteq._io.prototype.goVidInner = function( options ) {
  options = options || {};
  if (options.preCallback) { 
    if (!options.preCallback()) { return false; }
  }
  var startEntity = this.getEntity(true,options); 
  if (options.locate) {
    this.goVidLocate(startEntity,options);
  } else { // if (mode == 'route') is default
    var endEntity = this.getEntity(false,options); 
    this.goVidRoute(startEntity,endEntity,options);
  }
  if( vidteq.gui.handheld || vidteq.gui.openScale ) {
     this.writeHistory( undefined, undefined, options.cookieOptions );
  }
  if( options.enabledVideoCountCookie ) {
    this.videoCountCookie( options.cookieOptions );
  }
  return 0;
}

//vidteq._io.prototype.goVidOld = function( options ) {
//  options = options || {};
//  //if(this.gui.sideBarUI) {
//  //  this.gui.closeFrontPage();
//  //} 
//  // above code is moved to preGoVidRequest
//
//  //if(!vidteq.vidteq.hasReqestedFlashVersion &&
//  //if(vidteq.aD.switchToAppFromBrowser) { 
//  //  vidteq.vidteq.switchToAppFromBrowser(); 
//  //}
//  if (!this.gui.preGoVidRequest()) { return false; }
//  var that = this;
//  var handleLocateWrap = function (response) {
//    that.gui.postGoVidRequest();
//    that.handleLocate(response);
//  } 
//  var handleGetRouteWrap = function (response) {
//    that.gui.startOrEnd = {startEntity:that.startEntity,endEntity:that.endEntity};
//    if(typeof(that.gui.html5VideoParams) != 'undefined' && (!that.gui.flashPlayer || that.gui.singlePlayer)){
//      response = JSON.parse(JSON.stringify(response).replace(/.flv/gi,that.gui.html5VideoParams.extension));
//    }
//    that.gui.postGoVidRequest();
//    that.handleGetRoute(response);
//  } 
//  var handleErrorWrap = function (response) {
//    that.gui.postGoVidRequest();
//    that.handleError(response);
//  } 
//  this.preReqStart = vidteq.utils.trim($('#starttextbox').val()) || options.preReqStart;
//  if ((this.startStr = vidteq.routeEndsObj.get.apply(vidteq.routeEndsObj,['start'])) == null) {
//    this.startStr=this.preReqStart
//    this.startEntity = {address : {name : this.preReqStart}};
//    this.startEntity.reqSeed = this.preReqStart;
//  } else this.startEntity = vidteq.routeEndsObj.tips['start']; 
//  this.startEntity.linkStr = this.startStr;
//  if (!this.startEntity.type || (this.startEntity.type != 'center' && this.startEntity.type != 'employee')) { 
//    // TBD check - It should be that if srf type is there then assign as rcm
//    //this.startEntity.icon = vidteq.mboxObj.startIcon;
//    if(this.gui.openScale) { 
//      this.startEntity.icon = vidteq.routeEndsObj.startIcon;
//      this.startEntity.index = -1;
//      this.startEntity.type = 'rcm';
//    }
//    vidteq.routeEndsObj.remove('start');
//  }
//  if (this.gui.mode == 'LOCATE') {
//    var data={action:"businessSearch",city:vidteq.cfg.city,place:this.startStr,account:vidteq.vidteq.account,key:vidteq.vidteq.key};
//    if(vidteq.vidteq.scriptBased) {
//      data.callbackFunction='ioAreaObj.handleLocateCall';
//    }
//    this.createLink(0,this.startEntity);
//    if (typeof(qSrfResponse) != 'undefined') {
//      handleLocateWrap(qSrfResponse);
//      delete qSrfResponse;
//    } else {
//      this.glbAjxLoc=$.ajax({
//        url:vidteq.cfg.magicHappensUrl,
//        data:data,
//        suggestedplace:this.suggestedPlace,
//        dataType:vidteq.vidteq.dataType,
//        success:handleLocateWrap,
//        error:handleErrorWrap
//      });
//    }
//  } else { // if (mode == 'route') is default
//    this.preReqEnd = vidteq.utils.trim($('#endtextbox').val()) || options.preReqEnd;
//    if ((this.endStr = vidteq.routeEndsObj.get.apply(vidteq.routeEndsObj,['end'])) == null) {
//      this.endStr = this.preReqEnd
//      this.endEntity = {address : {name : this.preReqEnd}};
//      this.endEntity.reqSeed = this.preReqEnd;
//    } else this.endEntity = vidteq.routeEndsObj.tips['end']; 
//    this.endEntity.linkStr = this.endStr;
//    if (!this.endEntity.type || (this.endEntity.type != 'center' && this.endEntity.type != 'employee')) {
//      // TBD check - It should be that if srf type is there then assign as rcm
//      if(this.gui.openScale) { 
//        this.endEntity.index = -1;
//        this.endEntity.type = 'rcm';
//        //this.endEntity.icon = vidteq.mboxObj.endIcon;
//        this.endEntity.icon = vidteq.routeEndsObj.endIcon;
//      }
//      vidteq.routeEndsObj.remove('end');
//    }
//    if(vidteq.aD.switchToAppFromBrowser) {
//      this.createLink(0,this.startEntity,this.endEntity);
//      vidteq.vidteq.switchToAppFromBrowser(); 
//    }
//    data={
//      action:"viaRoute",
//      city:vidteq.cfg.city,
//      startaddress:this.startStr,
//      endaddress:this.endStr,
//      account:vidteq.vidteq.account,
//      key:vidteq.vidteq.key,
//      searchStartString:this.preReqStart,
//      searchEndString:this.preReqEnd
//    };
//    if(this.gui.embed) {
//      data.mygid=vidteq.aD.mygid;
//      if(vidteq.aD.config.sortby) data.sortby=vidteq.aD.config.sortby;
//    }
//    var viaString;
//    if ((viaString = vidteq.routeEndsObj.getViaString()) !== null) {data.via = viaString;}
//    //if(vidteq.vidteq.scriptBased) {data.callbackFunction='ioAreaObj.handleGetRoute';}
//    this.link=encodeURI("?q=route&city="+vidteq.cfg.city+"&start="+this.startStr+"&end="+this.endStr);
//    
//    var cookieExpiry = 3;//default days
//    if( typeof vidteq.aD !=="undefined" && typeof vidteq.aD.nemoQ !== 'undefined' ) {
//      if( this.gui.cookieOptions ) {
//        //TBD: extends cookieOptions
//        this.gui.cookieOptions.storeAs = (function(io) {
//          //TBD: sanitize it and remove special characters so that valid object key can be prepared with it 
//          var ft = io.createLink(1,io.startEntity,io.endEntity);
//          return ft.center.address.name;
//        })(this);
//        
//        if( typeof options.cookieOptions === 'undefined' ) options.cookieOptions = this.gui.cookieOptions;
//        if( typeof options.enabledVideoCountCookie === 'undefined' ) options.enabledVideoCountCookie = true;
//      }
//    }
//    this.glbAjxRoute=$.ajax({
//      url:vidteq.cfg.magicHappensUrl,
//      data:data,
//      dataType:vidteq.vidteq.dataType,
//      success:handleGetRouteWrap,
//      error:handleErrorWrap
//    });
//  }
//  
//  //vidteq.utils.isCookieEnabled();
//  
//  if( vidteq.gui.handheld || vidteq.gui.openScale ) {
//     this.writeHistory( undefined, undefined, options.cookieOptions, cookieExpiry );
//  }
//  if( options.enabledVideoCountCookie ) {
//    this.videoCountCookie( options.cookieOptions, cookieExpiry );
//  }
//  return 0;
//}

vidteq._io.prototype.handleLocate = function (srfResponse,type) {
  try {
    pageTracker._trackPageview("/locate_"+vidteq.vidteq.account);
  } catch(err) {};
  this.gui.clearRouteAndSrf();
  if(typeof(srfResponse)!='object') srfResponse=JSON.parse(srfResponse);
  if (typeof(srfResponse.error) != 'undefined') {
    this.gui.displayMessage("Could not locate the place. Try again later ("+srfResponse.error+")");
    return false;
  }
  this.reviseSrf(srfResponse);
  this.response = srfResponse;  
  this.srfResponse = srfResponse;  
  if (srfResponse.responseType=='locateStores') {
    this.storeResponse = srfResponse;
  }
  if (this.gui.checkAndDoAutoLocateNBS(srfResponse)) { return; }
  this.gui.toggleButtons({'clearroutetab' : true});
  //if(isMapXpanded) { undoExpandMapPopVideo(); }  
  this.gui.displayMessage("&nbsp");
  document.title="Vidteq - Navigation made easy | Search results for "+ this.startStr;
  this.gui.showSrf(srfResponse,'location');
  return 0;
}

vidteq._io.prototype.reviseSrf = function (res) {
  if (typeof(res.vid) != 'undefined') return;
  for (var i = 0; i < res.srf.length; i++) {
    res.srf[i].srfIndex = i;
    if (vidteq.utils.isObjectEmpty(res.srf[i].results[0])) {
      res.srf[i].results = [];
    }
    this.reviseOneSrfArrayWithParentTypeAndIndex(
      res.srf[i].results
      ,res.srf[i].srfType
    );
    if(res.srf[i].results.length > 0 &&
      res.srf[i].results[res.srf[i].results.length-1].matchSource == "category") {
        // Category match results are always pushed in the end.
        res.srf[i].categoryMatches = 1;
    }
    this.reviseIcons(res.srf[i]);
  }
  var putReqSeed = {'ss':1,'ff':1,'mm':1,
                    'sf':1,'mf':1,'fs':1,'fm':1,
                    'sm':1,'ms':1,'location':1};
  var sE = res.startEntity || this.startEntity; // TBD compatibility
  if (typeof(putReqSeed[res.responseType]) != 'undefined') {
    //res.srf[0].reqSeed = this.preReqStart;
    res.srf[0].reqSeed = sE.reqSeed;
    res.srf[0].myLoc = sE;
    this.reviseReqSeed(res.srf[0],sE.reqSeed);
  }
  var eE = res.endEntity || this.endEntity; // TBD compatibility
  if (res.srf.length == 2) {
    //res.srf[1].reqSeed = this.preReqEnd;
    res.srf[1].reqSeed = eE.reqSeed;
    res.srf[1].myLoc = eE;
    this.reviseReqSeed(res.srf[1],eE.reqSeed);
  }
  if (res.responseType == 'locateStores') {
    res.srf[0].reqSeed = sE.reqSeed;
    res.srf[0].myLoc = sE;
    this.reviseReqSeed(res.srf[0],sE.reqSeed);
  }
  if ( res.responseType == 'sf' ||
       res.responseType == 'sm' ||
       res.responseType == 'ss' ) {
    var entity = res.srf[0].results[0];
    if (!entity.address || !entity.address.name) {
      //entity.address.name = this.startEntity.address.name;
      entity.address = sE.address;
    }  // TBD assignment should be done according to source of startEntity
    if (sE.geom) { // implicit assumption that it is geom query
      res.srf[0].results[0] = sE;
    }
    // if startEntity is from earlier srf, use that, other wise use incoming
    // TBD center need to be fixed back
    if (this.gui.embed && this.gui.embed.fix=='start') {
      res.srf[0].results[0] = this.gui.embed.place;
    }
  }
  if ( res.responseType == 'fs' ||
       res.responseType == 'ms' ||
       res.responseType == 'ss' ) {
    var entity = res.srf[1].results[0];
    if (!entity.address || !entity.address.name) {
      entity.address = eE.address;
    }
    if (sE.geom) { // implicit assumption that it is geom query
      res.srf[1].results[0] = eE;
    }
    // TBD center need to be fixed back
    if (this.gui.embed && this.gui.embed.fix=='end') {
      res.srf[1].results[0] = this.gui.embed.place;
    }
  }
  if ( res.responseType == 'location' &&
       res.srf[0].results.length == 1) {
    var entity = res.srf[0].results[0];
    if (!entity.address || !entity.address.name) {
      entity.address = sE.address;
    }
    if (sE.geom) { // implicit assumption that it is geom query
      res.srf[0].results[0] = sE;
    }
  }
}

vidteq._io.prototype.reviseOneSrfArrayWithParentTypeAndIndex = function (srfArray,parentType) {
  for(var i in srfArray) {
    if (srfArray[i].parentType) continue;
    srfArray[i].parentType = parentType;
    srfArray[i].index = i;
    if (!srfArray[i].address) this.reviseEntityWithAddress(srfArray[i]);
  }
  return;
}

vidteq._io.prototype.reviseEntityWithAddress = function (entity) {
  entity.place={};
  entity.address={};
  entity.address.name=entity.name;
  entity.lonlat=vidteq.utils.lonLatObjFrmPoint(entity.geom);
  entity.place.geom=entity.geom;	
  entity.place.address={};
  entity.place.address.name=entity.name;
  entity.place.lonlat=vidteq.utils.lonLatObjFrmPoint(entity.geom);
}

vidteq._io.prototype.reviseIcons = function(srf) {
  if (srf.results.length == 0) return; 
  for (var i in srf.results) { this.populateIconContent(srf.results[i]); }
}

vidteq._io.prototype.reviseReqSeed = function(srf,reqSeed) {
  if (srf.results.length == 0) return; 
  for (var i in srf.results) { srf.results[i].reqSeed = reqSeed; }
}

vidteq._io.prototype.populateIconContent = function (entity,iconNum) {
  //if (typeof(entity.icon)=='undefined') entity.icon = {}; 
  if (typeof(entity.icon)=='undefined') return;
  if(typeof(entity.icon.name)!='undefined') {
    var imgRec = entity.icon;
    var src = entity.icon.name;
    var url = vidteq.cfg.imageLogosLoc;
    if (imgRec.url) { url = imgRec.url; }
    if (!url.toString().match(/\/$/)) url += '/';
    entity.icon.mapUrl = url+src;
    entity.icon.fvtUrl = url+src;
    // TBD how to show the number on top of defined icon
    entity.icon.mapStyle="border:0px solid black;"    
    entity.icon.fvtStyle="border:0px solid black;cursor:pointer;"    
    if(!entity.icon.size) { entity.icon.size = 32; } 
    if(!entity.icon.w) { entity.icon.w = 32; } 
    if(!entity.icon.h) { entity.icon.h = 32; } 
  } else if (typeof(iconNum)!='undefined') {   
    entity.icon.mapUrl=vidteq.imgPath.locaMarkers[iconNum].map;
    entity.icon.fvtUrl=vidteq.imgPath.locaMarkers[iconNum].div;
    entity.icon.mapStyle="border:0px solid black;"    
    entity.icon.fvtStyle="border:0px solid black;cursor:pointer;"    
    entity.icon.size=32;  
    entity.icon.w=32;  
    entity.icon.h=32;  
  } else {
    //TBD
    //entity.icon.name='start.png';
    //entity.icon.mapUrl='images/start.gif';
    //entity.icon.size=32;  
  }
  if (entity.type && entity.type == 'center') entity.icon.title=entity.address.name;
  else entity.icon.title='Click to get information about this place';
}

vidteq._io.prototype.reviseStartEndInResponse = function (res) {
  res.startAddress = res.startAddress || this.startAddress;
  res.endAddress = res.endAddress || this.endAddress;
  // backward compatibility
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
  var a = res.summary.split("|");
  var dist = a[0];
  var dur = a[1];
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

vidteq._io.prototype.reviseImageInResponse = function(response) {
  response.imgData=[];
  for (var i = 0; i < response.img.length; i++) {
    response.imgData[i]={};
    var tempText=response.img[i];
    var splitter=tempText.split("|");
    if(tempText.match("^DP")) {
      response.imgData[i].imgIndex=splitter[1];
      response.imgData[i].imgName=splitter[2];
      response.imgData[i].dpRoadName=splitter[3];
      var ab=splitter[4].split("#");
      if(typeof(OpenLayers)!='undefined') {
        response.imgData[i].lonlat = new OpenLayers.LonLat(ab[0],ab[1]);
      }
      var classPNG=vidteq.MSIE6?"class='pngfixclass'":"''";		
      response.imgData[i].arrowHtml="<img src="+vidteq.imgPath.textdirs.straight+" "+classPNG+"  style='opacity:1;filter:alpha(opacity=100)'/>";
    }
    if(tempText.match("^POI")) {
      response.imgData[i].poiName=splitter[1];
      response.imgData[i].imgName=splitter[2];
      response.imgData[i].id=splitter[3];
      var ab=splitter[4].split(",");
      if(typeof(OpenLayers)!='undefined') {
        response.imgData[i].lonlat = new OpenLayers.LonLat(ab[0],ab[1]);
      }
      response.imgData[i].arrowHtml='';
    }
  }
}

vidteq._io.prototype.reviseVideoInResponse = function(res) {
  // first linearize
  var vid = res.vid;
  var videoIdx = 0;
  var videos = [];
  var idx = 0;
  for (var i in vid) {
    var oneVid = vid[i];
    oneVid.video.cap = oneVid.cap;
    videos.push(oneVid.video);
    idx++;
    var numVids = parseInt(res.NumVvid[i]);
    for (var j=videoIdx;j<videoIdx+numVids;j++) {
      var oneVideo = res.video[j].VvidSource;
      videos.push(oneVideo);
      idx++;
    }
    videoIdx += numVids;
    oneVid.video.nextVid = idx;  
  }
  
  var videoSrc = [];
  $.each(videos,function(idx,elm) {
    videoSrc.push(elm.src);
  });
  res.allVideoLinks = videoSrc;

  var vidVideoSrc = [];
  $.each(videos,function(idx,elm) {
    if (elm.cap) { vidVideoSrc.push(elm.src); }
  });
  res.mainDpVideoLinks = vidVideoSrc;

  var vidDur = 0;
  $.each(videos,function(idx,elm) {
    if (elm.cap) { } else { 
      vidDur += parseInt(elm.duration||0, "10");
    }
  });
  res.vVidDuration = vidDur;  // some how legacy of opposite

  var vVidDur = 0;
  $.each(videos,function(idx,elm) {
    if (elm.cap) { 
      vVidDur += parseInt(elm.duration||0, "10");
    }
  });
  res.vidDuration = vVidDur;  // some how legacy of opposite
  
  var durations = [];
  $.each(videos,function(idx,elm) {
    durations.push(elm.duration);
  });
  res.durations = durations;

  var vidStarts = [];
  $.each(videos,function(idx,elm) {
    if (elm.cap) { vidStarts.push(idx); }
  });
  res.vidStarts = vidStarts;
  
  var captions = [];
  $.each(videos,function(idx,elm) {
    if (!elm.cap) { return; }
    captions.push((elm.cap.split("|"))[1]);  // TBD hash issue
  });
  res.captions = captions;

  var nLimits = []; // I guess caption limits, is it not same as vidStart
  $.each(videos,function(idx,elm) {
    if (elm.cap) nLimits.push(idx);
  });
  res.nLimits = nLimits

  var cLimits = [];  // I guess cumulative limits
  var tot = 0;
  $.each(videos,function(idx,elm) {
    var d = parseFloat(elm.distance)*6378.137*Math.PI/180;
    tot += d; 
    cLimits.push(tot);
  });

  var rLimits = []; // I guess reverse limits
  $.each(videos,function(idx,elm) {
    rLimits.push(tot-cLimits[idx]);
  });
  res.allLimits = rLimits;

  var tLimits = []; // I guess total vid limits (within vids)
  var cum = 0;
  $.each(videos,function(idx,elm) {
    if (elm.cap) { cum = rLimits[idx]; }
    tLimits.push((cum - rLimits[idx]).toFixed(2));
  });
  res.tLimits = tLimits; 
}

vidteq._io.prototype.reviseVideoInResponseOld = function(response) {
  response.allVideoLinks = [];
  response.mainDpVideoLinks = [];
  response.vVidDuration = 0;
  response.vidDuration = 0;
  if(typeof(vidteq.aD)!='undefined' && 
     vidteq.aD.customaudio && 
     vidteq.routeEndsObj.tips['end'].type == 'center') response.customaudiooverride=1;
     //vidteq.aD.customaudiooverride && 
  var sumNumVvid = 0;
  for (var i in response.vid) {
    response.allVideoLinks.push(response.vid[i].video.src);
    response.mainDpVideoLinks.push(response.vid[i].video.src);
    var duration = (response.vid[i].video.duration);
    if (duration) { response.vVidDuration += parseInt(duration, "10"); }
    for(var j=sumNumVvid;j<(sumNumVvid+response.NumVvid[i]);j++) {
      response.allVideoLinks.push(response.video[j].VvidSource.src);
      var duration0 = response.video[j].VvidSource.duration;
      if (duration0) { response.vidDuration += parseInt(duration0, "10"); }
    }
    sumNumVvid += response.NumVvid[i];
  }
}

vidteq._io.prototype.reviseCaptionInResponse = function(res) {
  for (var i in res.vid) {
    var vid = res.vid[i];
    var d = vid.cap.split(/\|/);
    vid.arrow = d[0]; 
    vid.arrowSrc = this.getArrowSrc(d[0],false); 
    vid.arrowPrintSrc = this.getArrowSrc(d[0],true); 
    vid.direction = d[1];
    vid.passBy = new Array();
    if (d.length>2) {
      var id = d[2].split(/\#/);
      for(var j=0;j<id.length;j++) {
        var tp=id[j].split(":");
        vid.passBy[j] = {'name':tp[0],'id':tp[1],'idx':-1};
        var noOfImages=res.imgData.length;
        while(noOfImages) {
          if(res.imgData[--noOfImages].id==tp[1]) {
            vid.passBy[j].idx = noOfImages;
            break;
          }
        }
      }
    }
    for(var j=0;j<(res.imgData.length);j++) {
      if(res.imgData[j].dpRoadName) {
        if(res.imgData[j].imgIndex == vidteq.mboxObj.syncMapPoints[i]) { // TBD
          this.fillArrowHtml(res.imgData[j],vid.arrow);
        }
      }
    }
  }
}

vidteq._io.prototype.getArrowSrc = function(arrow,toPrint) {
  var whichArrow,whichArrowJPG;
  if(arrow.match(/^A/)) {
    whichArrow=vidteq.imgPath.textdirs.start;
    if(vidteq.MSIE6) whichArrowJPG=vidteq.imgPath.textdirs.start_jpg;
  } else if(arrow.match(/^B/)) {
    whichArrow=vidteq.imgPath.textdirs.stop;
    if(vidteq.MSIE6) whichArrowJPG=vidteq.imgPath.textdirs.stop_jpg;
  } else if(arrow.match(/^S/)) { 
    whichArrow=vidteq.imgPath.textdirs.straight; 
    if(vidteq.MSIE6) whichArrowJPG=vidteq.imgPath.textdirs.straight_jpg;
  } else if(arrow.match(/^R/)) { 
    whichArrow=vidteq.imgPath.textdirs.right; 
    if(vidteq.MSIE6) whichArrowJPG=vidteq.imgPath.textdirs.right_jpg;	
  } else if(arrow.match(/^L/)) { 
    whichArrow=vidteq.imgPath.textdirs.left; 
    if(vidteq.MSIE6) whichArrowJPG=vidteq.imgPath.textdirs.left_jpg;	
  } else if (arrow.match(/^U/)){ 
    whichArrow=vidteq.imgPath.textdirs.uturn; 
    if(vidteq.MSIE6) whichArrowJPG=vidteq.imgPath.textdirs.uturn_jpg;	
  } else { whichArrow=''; if(vidteq.MSIE6) whichArrowJPG='';}
  if (toPrint) return whichArrowJPG;
  return whichArrow;
}

vidteq._io.prototype.fillArrowHtml = function(imgData,arrow) {
  var classPNG=(vidteq.MSIE6)?"class='pngfixclass'":"''";	
  if(arrow.match(/^S/)) {
    imgData.arrowHtml="<img "+classPNG+" src="+vidteq.cfg.imageLoc+"/straight.png />";
    imgData.arrow="s";
  } else if(arrow.match(/^L/))  {
    imgData.arrowHtml="<img "+classPNG+" src="+vidteq.cfg.imageLoc+"/left.png />";
    imgData.arrow="l";
  } else if(arrow.match(/^R/))  {
    imgData.arrowHtml="<img "+classPNG+" src="+vidteq.cfg.imageLoc+"/right.png />";
    imgData.arrow="r";
  } else if(arrow.match(/^U/))  {
    imgData.arrowHtml="<img  "+classPNG+" src="+vidteq.cfg.imageLoc+"/uturn.png />";
    imgData.arrow="u";
  } else {
    imgData.arrowHtml="<img  "+classPNG+" src="+vidteq.cfg.imageLoc+"/straight.png />";
    imgData.arrow="s";
  }
}

vidteq._io.prototype.handleError = function(reqObj,textStatus,errorThrown) {
  this.gui.clearRouteAndSrf();
  this.gui.displayMessage ("Something wrong happened, please try again ");
}

vidteq._io.prototype.handleGetRoute = function(routeResponse,options) {
  if(this.gui.appMode) { vidteq.utils.undrapeSheer("appModeFTR"); }
  //try {
  //  pageTracker._trackPageview("/route_"+vidteq.vidteq.account);
  //}catch(err) {};
  if(typeof(routeResponse)=='string') routeResponse=JSON.parse(routeResponse);
  if (typeof(routeResponse.error) != 'undefined') {
    alert("Path not routable - "+routeResponse.error);
    this.handleError();
    this.gui.displayMessage(routeResponse.error);
    return false;
  }   
  if (routeResponse.renderedInServer) { } else {
    this.gui.clearRouteAndSrf();
  }
  this.gui.displayMessage("&nbsp");
  this.response = routeResponse;
  //ioAreaObj.response = routeResponse;
  this.gui.toggleButtons({'clearroutetab' : true});
  var jobList = {
    mm: {divContent:"We found multiple matches for <b>start</b> and <b>end</b> places you entered",
         sOrE:"startAddress"},
    sm: {divContent:"We found multiple matches for <b>end</b> place you entered",
          sOrE:"endAddress"},
    ms: {divContent:"We found multiple matches for <b>start</b> place you entered",
          sOrE:"startAddress"},
    fm: {divContent:"No match for <b>start</b> place and multiple matches for <b>end</b> place you entered",
          sOrE:"endAddress"},
    mf: {divContent:"No match for <b>end</b> place and multiple matches for <b>start</b> place you entered",
          sOrE:"startAddress"},
    fs: {divContent:"No match for <b>start</b> and one match for <b>end</b> place you entered",
          sOrE:"endAddress"},
    sf: {divContent:"No match for <b>end</b> place and one match for <b>start</b> place you entered",
          sOrE:"startAddress"},
    ff: {divContent:"We found no matches for <b>start</b> and <b>end</b> places you entered",
          sOrE:"startAddress"}
  };
  if(typeof(vidteq.mboxObj) != 'undefined' && typeof(vidteq.mboxObj.eMap)!=="undefined") {
    try { vidteq.mboxObj.eMap.hideStatus(); } catch (e) { };  
  }
  if (routeResponse.renderedInServer) {  // ioArea special
    this.gui.displayLinearRoute(routeResponse);
    vidteq.mboxObj.map.updateSize();
    return;
  }

  if (typeof(routeResponse.vid) != 'undefined') {
    this.routeResponse = routeResponse;
    this.displayRoute(routeResponse);
  } else {
    // Following seciton is TBD
    //if(response.startAddress.length>0) {
    //  vidteq.routeEndsObj.add('start',0,'startAddress');
    //  if(typeof(response.startAddress[0].name)!='undefined') { // TBD variants  
    //    document.GetVal.start.value=response.startAddress[0].name;
    //  }
    //}
    //if(response.endAddress.length>0) {
    //  vidteq.routeEndsObj.add('end',0,'endAddress');
    //  if(typeof(response.endAddress[0].name)!='undefined') { // TBD variants  
    //    document.GetVal.end.value=response.endAddress[0].name;
    //  }
    //}
    //ioAreaObj.displayMessage(jobList[routeResponse.routeFailType].divContent);
    //var sOrE = jobList[routeResponse.routeFailType].sOrE;
    //reviseSrfWithParentTypeAndIndex(routeResponse);
    //ioAreaObj.displayResults.apply(ioAreaObj,[sOrE,routeResponse]);

    this.handleRouteContainerWrap(routeResponse,jobList);
  }
}

vidteq._io.prototype.handleRouteContainerWrap = function(routeResponse,jobList) {
  if(this.gui.openScale && !this.gui.handheld) { 
    StageWebViewBridge.call('undrapeRoute', null, {
      dirIndex:0
    }); 
  }
  this.gui.displayMessage(jobList[routeResponse.responseType].divContent);
  var sOrE = jobList[routeResponse.responseType].sOrE;
  this.reviseSrf(routeResponse);
  this.srfResponse = routeResponse;
  this.gui.showSrf(routeResponse,sOrE);
  if ( routeResponse.responseType == 'sf' ||
       routeResponse.responseType == 'sm' ||
       routeResponse.responseType == 'ss' ) {
    var entity = routeResponse.srf[0].results[0];
    if (entity.type != 'center') this.gui.dirFromTo('start',entity);
  }
  if ( routeResponse.responseType == 'fs' ||
       routeResponse.responseType == 'ms' ||
       routeResponse.responseType == 'ss' ) {
    var entity = routeResponse.srf[1].results[0];
    if (entity.type != 'center') this.gui.dirFromTo('end',entity);
  }
  // ioArea specials 
  // TBD need to be moved out
  if (vidteq.newSearch) {
    fvtShowAndHide(true);
    vidteq.mboxObj.map.updateSize();
  }
}

vidteq._io.prototype.displayRoute = function(routeResponse) {
  routeResponse.highBwUrl = vidteq.cfg.videoUrl;
  routeResponse.lowBwUrl = (typeof(vidteq.cfg.videoUrlLb) != 'undefined')?vidteq.cfg.videoUrlLb:'';
  this.reviseStartEndInResponse(routeResponse);
  this.reviseImageInResponse(routeResponse);
  this.reviseVideoInResponse(routeResponse);
  this.reviseCaptionInResponse(routeResponse);
  if(typeof(vidteq.aD)!='undefined' && vidteq.aD.urlId == 'Unitech_Uniworld_Resorts') {
    routeResponse.customLogoPosition = true;//vidteq.aD.customlogopos;
  }
  if(this.gui.appMode) {
    if(this.gui.handheld && !this.gui.openScale){
      setTimeout(function () {
        StageWebViewBridge.call('handleStageGetRoute', null, JSON.stringify(routeResponse));
      },3000);
    } else {
      setTimeout(function () {
        StageWebViewBridge.call('handleStageGetRoute', null, JSON.stringify(routeResponse));
      },1000);
    }
  }
  this.gui.displayRoute(routeResponse);
  this.createLink(0,routeResponse.startEntity,routeResponse.endEntity);
}

vidteq._io.prototype.getFtRuleTipForLink = function(ftRule,tip,entity) {
  if (!entity) { return; }
  ftRule[tip] = {};
  if(entity.geom.match(/^POINT\(.*\)/i)) {
    var l = vidteq.utils.lonLatObjFrmPoint(entity.geom);
    ftRule[tip].geom = l.lon+" "+l.lat;
  } else {
    ftRule[tip].geom = entity.geom;
  }
  if( entity.address && entity.address.name ) {
    ftRule[tip].address = { name : entity.address.name };
  }
}

vidteq._io.prototype.getFtRuleForLink = function(startEntity,endEntity) {
  var ftRule = {};
  if (startEntity) { 
    this.getFtRuleTipForLink(ftRule,'start',startEntity);
  }
  if (endEntity) { 
    this.getFtRuleTipForLink(ftRule,'end',endEntity);
  }
  if( vidteq.routeEndsObj.viaSet && vidteq.routeEndsObj.viaSet.length ) {
    ftRule.end.via = [];
    for( var i in vidteq.routeEndsObj.viaSet ) {
      ftRule.end.via.push({geom:vidteq.routeEndsObj.viaSet[i].geom});
      // TBD address needed
    }
  }
  return ftRule;
}

vidteq._io.prototype.createLink = function(forCookie,startEntity,endEntity) {
  var embed = this.gui.embed;
  
  if (!embed ) { 
    if (typeof endEntity === 'undefined')  {
      this.link = vidteq.utils.getRootPath()+"?q=locate&city="+vidteq.cfg.city+"&place="+encodeURIComponent(startEntity.linkStr);
      if('serverUrl' in vidteq && vidteq.serverUrl) {
        this.link = vidteq.serverUrl+vidteq.cfg.city+"?q=locate&place="+encodeURIComponent(startEntity.linkStr);
      }
    } else {

      var ftRule = this.getFtRuleForLink(startEntity,endEntity);
      this.link = vidteq.utils.getRootPath()+"?city="+vidteq.cfg.city+"&firstTimeRule="+encodeURIComponent(JSON.stringify(ftRule));
      if('serverUrl' in vidteq && vidteq.serverUrl) {
        //this.link = vidteq.serverUrl+vidteq.cfg.city+"?firstTimeRule="+encodeURIComponent(JSON.stringify(ftRule));
        var fromName = ftRule.start.address.name.replace('/\'/',"");
        var fromGeom = ftRule.start.geom;
        if(!fromGeom.match('/^POINT/i')) { fromGeom = "POINT("+fromGeom+")"; }
        var toName = ftRule.end.address.name.replace('/\'/',"");
        var toGeom = ftRule.end.geom;
        if(!toGeom.match('/^POINT/i')) { toGeom = "POINT("+toGeom+")"; }
        var fromPath = 'Direction-From-'+fromName+'---'+fromGeom;
        var toPath = 'Direction-To-'+toName+'---'+toGeom;
        this.link = vidteq.serverUrl+'directions/'+vidteq.cfg.city+'/'+fromPath+'/'+toPath;
      }
    }  
  }else {
    // TBD ftRule is derived from a function - we need to use it
    var firstTimeRule = {};
    var nemoQ = vidteq.utils.getSafe('vidteq.aD.nemoQ');
    var fix = embed.fix;
    
    if( nemoQ ) {
      firstTimeRule.manner = vidteq.utils.getSafe('vidteq.gui.embed.firstTimeRule.manner');
      firstTimeRule.center = vidteq.utils.getSafe('vidteq.aD.nemoCenter');
    }
    if( fix !== '' ) {
      var otherEnd = startEntity;
      var tip = embed.other;
      if( tip == 'end' ) {
        otherEnd = endEntity;
      }
      firstTimeRule[tip] = {};
      firstTimeRule[tip].geom = otherEnd.geom;
      if( otherEnd.address && otherEnd.address.name ) {
        firstTimeRule[tip].address = { name : otherEnd.address.name };
      }
      if( vidteq.routeEndsObj.viaSet && vidteq.routeEndsObj.viaSet.length ) {
        firstTimeRule[tip].via = [];
        for( var i in vidteq.routeEndsObj.viaSet ) {
          firstTimeRule[tip].via.push({geom:vidteq.routeEndsObj.viaSet[i].geom});
          // TBD address needed
        }
      }
      if( embed.locateStores ) { 
        firstTimeRule[fix] = {
          storeSubid : embed.place.storeSubid,
          seedGeom : embed.locateStores.seedGeom
        };
      }
    }else if( fix == '' && !nemoQ ) {
      return;
    }
    if( !forCookie ) {
      //if( typeof(vidteq.aD) != 'undefined' && vidteq.aD.account=="Arthabfs" ){
      //  this.link = 'http://www.arthabfs.com/map1.html?firstTimeRule='+encodeURIComponent(JSON.stringify(firstTimeRule));     
      //}else {
        this.link = vidteq.utils.getRootPath()+'which.php?urlid='+vidteq.aD.urlId+'&city='+vidteq.cfg.city+'&firstTimeRule='+encodeURIComponent(JSON.stringify(firstTimeRule));     
      //}
    }
    return firstTimeRule;
  }
}

vidteq._io.prototype.swapParentType = function (obj) {
  if (obj.parentType && obj.parentType == 'startAddress') obj.parentType = 'endAddress';
  else if (obj.srfType && obj.srfType == 'startAddress') obj.srfType = 'endAddress';
  else if (obj.parentType && obj.parentType == 'endAddress') obj.parentType = 'startAddress';
  else if (obj.srfType && obj.srfType == 'endAddress') obj.srfType = 'startAddress';
}

vidteq._io.prototype.swapSrfResponse = function () {
  var obj = this.srfResponse;
  var trans = {'ss':'ss','ff':'ff','mm':'mm',
               'sf':'fs','mf':'fm','fs':'sf','fm':'mf',
               'sm':'ms','ms':'sm'};
  for (var i in trans) {
    if (obj.responseType == i) {
      obj.responseType = trans[i];
      var temp = obj.srf[0];
      obj.srf[0] = obj.srf[1];
      obj.srf[1] = temp;
      obj.srf[0].srfIndex = 0;
      obj.srf[1].srfIndex = 1;
      this.swapParentType(obj.srf[0]);
      this.swapParentType(obj.srf[1]);
      for (var j in obj.srf[0].results) {
        this.swapParentType(obj.srf[0].results[j]);
      } 
      for (j in obj.srf[1].results) {
        this.swapParentType(obj.srf[1].results[j]);
      }
      break;
    }
  }
}

//vidteq._io.prototype.writeSrfToTable = function() {
//  vidteq.mboxObj.cleanSrf();
//  var from = 0;
//  for (var i in this.srfResponse.srf) {
//    from = this.populateMarkers(this.srfResponse.srf[i],from);
//    vidteq.fvtObj.writeSrfToTable(this.srfResponse.srf[i]);
//    vidteq.mboxObj.writeSrfToTable(this.srfResponse.srf[i]);
//  } 
//  vidteq.mboxObj.writeSrfToTableFinish(this.srfResponse.srf[i]);
//}

vidteq._io.prototype.populateMarkers = function (srf,from) {
  if (!srf.showSets[srf.curShowSet]) return from;
  for (var i=srf.showSets[srf.curShowSet].from-1;i<srf.showSets[srf.curShowSet].to;i++) {
    this.populateMarkIconContent(srf.results[i],from++);
  }
  return from;
}

vidteq._io.prototype.populateMarkIconContent = function (entity,iconNum) {
  if (typeof(iconNum) == 'undefined') return;
  entity.lpIndex = iconNum;
  entity.markIcon = [];
  entity.markIcon.iconNum = iconNum;
  if (entity.parentType == 'locateStores') {
    if (entity.type && entity.type == 'center') {
      entity.markIcon.mapUrl=vidteq.imgPath.storeMarkers[iconNum].map;
      entity.markIcon.fvtUrl=vidteq.imgPath.storeMarkers[iconNum].div;
    } else {
      entity.markIcon.mapUrl=vidteq.imgPath.storeMarkers[parseInt(entity.index)].map;
      entity.markIcon.fvtUrl=vidteq.imgPath.storeMarkers[parseInt(entity.index)].div;
    }
  } else {
    if(typeof(vidteq.imgPath.locaMarkers[iconNum]) != "undefined") {
      entity.markIcon.mapUrl=vidteq.imgPath.locaMarkers[iconNum].map;
      entity.markIcon.fvtUrl=vidteq.imgPath.locaMarkers[iconNum].div;
    }
  }
  entity.markIcon.mapStyle="border:0px solid black;"    
  entity.markIcon.fvtStyle="border:0px solid black;cursor:pointer;"    
  entity.markIcon.size=32;  
  entity.markIcon.w=32;  
  entity.markIcon.h=32;  
  entity.markIcon.title='Click to get information about this place';
}

vidteq._io.prototype.getLonLat = function (entity) {
  if (!entity) { return; }
  var lonLat = {};
  if (entity.lon) { lonLat.lon = entity.lon; }
  if (entity.lat) { lonLat.lat = entity.lat; }
  if (entity.geom) {
    var l = vidteq.utils.lonLatObjFrmPoint(entity.geom);
    if (l.lon) { lonLat.lon = l.lon; }
    if (l.lat) { lonLat.lat = l.lat; }
  }
  return lonLat
}

vidteq._io.prototype.getPointInfo = function (entity,opt) {
  var lonlat = this.getLonLat(entity);
  if (!lonlat || !lonlat.lon || !lonlat.lat) { return; }
  var data = {
    action:"findhood"
    ,city:vidteq.cfg.city,
    point:lonlat.lon+' '+lonlat.lat
  };
  this.lF = {
    lon:parseFloat(lonlat.lon)
    ,lat:parseFloat(lonlat.lat)
    ,callback:[opt.callback]
  };
  var that = this;
  var findhoodUrl = opt.findhoodUrl || vidteq.cfg.magicHappensUrl || 'vs/magicHappens.php';
  var findhoodType = opt.findhoodType || (vidteq.vidteq || {} ).dataType || vidteq.dataType || 'json';
  (function () {
    var lF = that.lF;
    $.ajax({
      url:findhoodUrl
      ,data:data
      ,dataType:findhoodType
      ,success: function (res) {
        if (typeof(res) == 'string') res=JSON.parse(res);
        if (res.error) {
          delete lF.callback;
          return; // TBD what to do
        }
        if (res.srf && res.srf[0] && res.srf[0].results) {
          res = res.srf[0].results;
        }
        $.extend(lF,{
          road:res.roadName || res.roadname || ''
          ,area:res.areaName || res.areaname || ''
        });
        if (res.city) { lF.city = res.city; }
        var callbackA = lF.callback;
        delete lF.callback;
        for (var c in callbackA) { callbackA[c](lF); }
      }
      ,error:function(res) { 
      }
    });
  })();
}

//vidteq._io.prototype.getPointInfoOld = function (entity,tip) {
//  if (!entity.geom) { return; }
//  var lonlat = vidteq.utils.lonLatObjFrmPoint(entity.geom);
//  var data={action:"findhood",city:vidteq.cfg.city,
//    point:lonlat.lon+' '+lonlat.lat};
//  if( ( vidteq.vidteq || {} ).scriptBased ) {
//    data.callbackFunction = 'ioAreaObj.handleGetRoadNameCall';
//  }
//  var that = this;
//  var handleGetPointInfoWrap = function(response) {
//    if(typeof(response)=='string') response=JSON.parse(response);
//    if (!entity.address) { entity.address = {name:response.roadname}; }
//    entity.address.name = response.roadname;
//    // TBD can we overwite everytime ? 
//    that.gui.completedGetPointInfo(response.roadname,tip);
//  }
//  this.glbAjxInfo=$.ajax({
//    url:vidteq.cfg.magicHappensUrl,
//    data:data,
//    dataType: (vidteq.vidteq || {} ).dataType? (vidteq.vidteq || {} ).dataType : vidteq.dataType? vidteq.dataType : 'json',
//    success: handleGetPointInfoWrap
//  });
//}

vidteq._io.prototype.videoCountCookie = function( options, cookieExpiry ) {
  //vidteq.utils.isCookieEnabled();
  
  options = options || {};
  cookieExpiry = typeof options.cookieExpiry !== "undefined"?
    options.cookieExpiry : (typeof cookieExpiry !== "undefined"? cookieExpiry : 3);
  
  var cookieName = options.cookieName || 'vidteq-videocount'
  ,myCookie = {}
  ,storeAs = options.storeAs
  ,exCookie = vidteq.utils.readCookie(cookieName)
  ;
  
  var that=this;
  if(exCookie) {
    //try {
    //  console.log("videoCountCookie: previous Cookie:");console.log(exCookie);
    //}catch(err) {};
    exCookie = JSON.parse(exCookie);
    //try {
    //  console.log("videoCountCookie: previous Cookie length: ");console.log(exCookie[storeAs].length);
    //}catch(err) {};
  }
  if( exCookie ) {
    myCookie = exCookie;
  }
  if( myCookie && !myCookie[storeAs] ) {
    myCookie[storeAs]=[];
  }
  myCookie[storeAs].push(1);
  myCookie = JSON.stringify(myCookie);
  vidteq.utils.writeCookie( cookieName, myCookie, cookieExpiry );
  //end of cookie block  
}

vidteq._io.prototype.writeHistory = function( entity, tip, options, cookieExpiry ) {
  //vidteq.utils.isCookieEnabled();
  
  options = options || {};
  cookieExpiry = typeof options.cookieExpiry !== "undefined"?
    options.cookieExpiry : (typeof cookieExpiry !== "undefined"? cookieExpiry : 3);
    
  var cookieName = options.cookieName || 'search'
  ,myCookie = {}
  ,storeAs = options.storeAs || 'pointArray'
  ,canPlaySameRouteAgain = typeof options.canPlaySameRouteAgain !== 'undefined'? options.canPlaySameRouteAgain : true
  ,exCookie = vidteq.utils.readCookie(cookieName)
  ,skip='-1';
  
  var that=this;
  if(exCookie) {
    exCookie = JSON.parse(exCookie);
  }
  if( exCookie ) {
    myCookie = exCookie;
    if( exCookie[storeAs] ) {
      if( canPlaySameRouteAgain ) {
        jQuery.each(myCookie[storeAs], function(index, value) {
          if(that.preReqStart==value.sp && that.preReqEnd==value.ep)
            skip = index;
        });
      }
      if(skip != '-1') myCookie[storeAs].splice(skip,1); 
    }else myCookie[storeAs]=[];
  }else myCookie[storeAs]=[];
    
  //maintain a cookie of latest searches (last 5)
  if( options.storeAs == 'pointArray' && myCookie.pointArray.length == 5 ) {
    myCookie.pointArray.pop();
  }
  var cs = {
    sp: this.preReqStart
    ,ep: this.preReqEnd
    ,ft: (function(io) {
      var ft = io.createLink(1,io.startEntity,io.endEntity);
      return ft;
    })(this)
  };
  
  myCookie[storeAs].unshift(cs);
  myCookie = JSON.stringify(myCookie);
  vidteq.utils.writeCookie( cookieName, myCookie, cookieExpiry );
  //end of cookie block
}
