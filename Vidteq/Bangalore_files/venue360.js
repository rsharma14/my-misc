if (typeof(vidteq) == 'undefined') { vidteq = {}; }
vidteq._venue360 = function(ui,options) {
  var _opt = {
    viewerId: "viewer"
    ,has360Rotation:true
    ,hasCameraControls:false
    ,autoPan:true  //It was 'false'. and set to true in loadedAllTiles
    ,hasCanvasHidden:true
    ,effectController:null
    ,cameraConfig:{
      FOV:60
      ,MIN_FOV:30
      ,MAX_FOV:80
      ,NEAR:1
      ,FAR:100
      ,position:{x:0,y:0,z:0}
      ,target:{x:0,y:0,z:0}
      ,hasCameraControls:false
      ,cameraControlsOptions:null
    }
    ,callbackVenue360:{
      data:null
      ,before:{}
      ,on:{
        documentMouseDown:null
        ,documentMouseMove:null
        ,documentMouseUp:null
        ,documentMouseOver:null
        ,documentMouseWheel:null
        ,keyDown:null
        ,keyUp:null
      }
      ,after:{
        init3js:null
        ,loadedAllTiles:null
      }
    }
  };


  options = this.options = options? $.extend( _opt, options) : _opt;
  if( !this.options.venue360 ) {
    this.options.venue360 = this;
  }
  
  this.callbackVenue360 = options.callbackVenue360;
  this.viewerId = options.viewerId;
  this.autoPan = options.autoPan;
  this.imgPath = options.imgPath;
  this.autoPanRefTime = null;
  this.mouse = { x: 0, y: 0 };
  //this.autoShow = null;
  this.ui = ui || {};
  this.menuObjects = [];
  this.animFrame = '';
  this.initImgPath(vidteq.imgPath);
  this.currentlyPressedKeys = {};
  this.isUserInteracting = false;
  //this.deallocated = false;
  //this.prevLoaded='';
  //perspective camera
  this.fov = options.cameraConfig.FOV;
  this.minFov = options.cameraConfig.MIN_FOV;
  this.maxFov = options.cameraConfig.MAX_FOV;
  this.near = options.cameraConfig.NEAR;
  this.far = options.cameraConfig.FAR;
  
  
  //--- THREE objects
  this.camera = null;
  this.scene = null;
  this.cameraControls = null;
  this.effectController = null;
  this.projector = null;
  //this.ray = null;
  this.clock = null;
  
  this.renderMode = null;// webGl,canvas,java
  
  this.lon = 0; this.lon2 = 0; this.tmp = 0;

  this.lat = 0;
  this.divInc = 0;
  
  vidteq.utils.fillBrowserType(this);
  if( this.isIe ) { this.installIEFix(); }
  this.initRenderMode();
  this.config = options;
  //if (this.options.editableMode){
  //  this.tiler = new vidteq._venue360._tiler(this);
  //}
}

vidteq._venue360.prototype.reInit = function() {
  this.lon = 0;
  this.lat = 0;  
  this.autoPan = true;
  this.stopAnimation();
  this.initRenderMode();
}

vidteq._venue360.prototype.preInit = function(list, preInitCallback) {
	console.log("preInit",this);
  var that=this;
  if (this.renderMode == 'none') {
    this.initNone();
    return;
  }
  /*if (this.ui.editableMode) {
    vidteq.vidteq.loadScript({
      checkObj:'vidteq._venue360UIEditor'
      ,url:"js/venue360UIEditor.js"
    },function() {
      that.ui.editor = new vidteq._venue360UIEditor(that.ui);
      that.ui.editor.city = that.ui.city; // needed 
      that.ui.editor.urlid = that.ui.urlid; // needed 
      that.ui.editor.init();
       
    //that.ui.editor.attachEvents();
  
    });
  }*/
  if (this.renderMode == 'webGl' || this.renderMode == 'canvas') {     
    vidteq.vidteq.loadScript({
      checkObj:'jDataView'
      ,url:"js/jDataView.js"
    });
    if (this.isIe && this.ieVer <=9) { 
      vidteq.vidteq.loadScript({
        checkObj:'btoa'
        ,url:"js/base64.js"
      });
    }
    if (this.isIe && this.ieVer ==9) { 
      vidteq.vidteq.loadScript({
        checkObj:'checkTypedArrayCompatibility'
        ,url:"js/compatibility.js"
      });
    }
    var that = this;
    vidteq.vidteq.loadScript({
      checkObj:'Modernizr'
      ,url:"js/modernizr-2.6.2.js"
    });
    vidteq.vidteq.loadScript({
      checkObj:'Sly'
      ,url:"js/sly.min.js"
    });
    
    vidteq.vidteq.loadScript({
      checkObj:'THREE'
      ,url:"js/three.min.js"
    },function() {
      that.init3js( preInitCallback );
    });
    return;
  }
  if (this.renderMode == 'java') {
    //this.initJava();
    this.initJava( list );
  }
}

//TBD: not sure from where its invoked
vidteq._venue360.prototype.init3jsVars = function(path) {
  this.autoPan = false;
  this.autoPanRefTime = null;
  //this.deallocated = false;
  if (this.renderMode == 'webGl')  this.ui.addProgressbar();
  this.maxI = this.renderMode == 'webGl' ? 2:1;
  this.maxJ = this.renderMode == 'webGl' ? 4:1;
  var totNo = this.maxI*this.maxJ;
  this.divInc = 300/totNo;
  this.PIDiff = 2*Math.PI/this.maxJ;
  this.thetaDiff = Math.PI/(this.maxI * 2);
  this.startTheta = 0;
  this.startPI = 0; 
  this.imgSeed = this.renderMode == 'webGl' ? path+"_"+this.maxI+'x'+this.maxJ : path;
  this.imgExt = ".jpg";
}

vidteq._venue360.prototype.initJava = function( list ) {
  var rotationSpeed = "0.15";
  var path = vidteq.cfg.custom360Images+vidteq.aD.urlId+"/";
  var first = path+list[0].dirCode+"/"+list[0].items[0].imageName;
  var logo = "images/customLogos/"+vidteq.aD.urlId+"_logo.gif";
  var appletHtml = "<applet  id='viewer360' width="+this.ui.tsWidth+"px height="+this.ui.tsHeight+"px name='viewer360' archive='vc/ptviewer.jar' code='ptviewer.class' mayscript='true' scriptable='true' style='display:none;' ><PARAM name='mayscript' value='true' /><PARAM name='permissions' value='all-permissions' /><PARAM name='file'   value='"+first+"'><param name='imgLoadFeedback' value='true'><param name='wait' value='"+logo+"'><param name='auto' value='"+rotationSpeed+"'><param name='cursor' value='MOVE'><param name='fov' value='"+parseInt(list[0].items[0].fov[1])+"'><param name='fovmin' value='"+parseInt(list[0].items[0].fov[0])+"' > <param name='fovmax' value='"+parseInt(list[0].items[0].fov[2])+"' ><param name='pan' value='-105'>";
  var panoIdx = 0;
  for (var i in list) {
    this.ui.prepareThumbList(list[i]);
    for (var j in list[i].thumbList) {
      var oneTL = list[i].thumbList[j];
      if (oneTL.masterPlan) { continue; }
      var myVar = "<PARAM name=pano"+panoIdx+" value='{file="+oneTL.fullImage+"}{auto="+rotationSpeed+"}{loadAllRoi=false}{fov="+parseInt(oneTL.fov[1])+"}{fovmax="+parseInt(oneTL.fov[2])+"}{fovmin="+parseInt(oneTL.fov[0])+"}'>";
      appletHtml = appletHtml + myVar;
      oneTL.panoIdx = panoIdx;
      panoIdx++;
    }
  }
  appletHtml = appletHtml + "</applet>";
  var viewerId = this.viewerId;
  $('#'+viewerId).append(appletHtml);
  $('#viewer360').mousewheel(function(event, delta, deltaX, deltaY) {
    if(delta >0 && ((document.viewer360.hfov_min + 2) < document.viewer360.fov())) document.viewer360.ZoomIn();
    if(delta <0 && ((document.viewer360.hfov_max-2) > document.viewer360.fov())) document.viewer360.ZoomOut();
  });
}

vidteq._venue360.prototype.stopAnimation = function() {
  if (this.renderMode == 'webGl' || this.renderMode == 'canvas') { 
    if (this.animFrame) { cancelAnimationFrame(this.animFrame); }
  }
}

vidteq._venue360.prototype.initNone = function() {
  var id = this.viewerId;
  $('#'+id).css({
     "background" : "url("+this.imgPath.vPopNoPlugin+")"
  });
  $('#noJavaBanner').show();
}

vidteq._venue360.prototype.initRenderMode = function() {
  if (window.WebGLRenderingContext) {
    this.renderMode = 'webGl';  // webGl,canvas,java
  } else if (window.CanvasRenderingContext2D) {
    this.renderMode = 'canvas';  // webGl,canvas,java
  } else if (navigator.javaEnabled()) {
    this.renderMode = 'java';  // webGl,canvas,java
  } else {
    this.renderMode = 'none';  // webGl,canvas,java
  }

}

vidteq._venue360.prototype.initImgPath = function(imgPath) {
  var myImg = {
    vPopHelpImage:"vPop/vPopHelpImage.png"
    ,vPopDirectFsHelpImage:"vPop/vPopDirectFsHelpImg.png"
    ,vPopClose:"vPop/vPopClose.png"
    ,vPopFullScreen:"vPop/vPopFullScreen.png"
    ,vPopRotate:"vPop/vPopRotate.png"
    ,vPopHome:"vPop/vPopHome.png"
    ,vPopZoomIn:"vPop/vPopZoomIn.png"
    ,vPopZoomOut:"vPop/vPopZoomOut.png"
    ,vPopHelp:"vPop/vPopHelp.png"
    ,vPopPan:"vPop/vPopPan.png"
    ,vPopVidteqLogo:"vPop/vPopVidteqLogo.png"    
    ,vPopFStop:"vPop/vPopFStop.png"
    ,vPopFSPan:"vPop/vPopFSPan.png"
    ,vPopMin:"vPop/vPopMin.png"
    ,vPopCamera:"vPop/vPopCamera.gif"
    ,vPopNoPlugin:"vPop/vPopNoPlugin.png"
    ,vPopCompass:"vPop/compass.png"
    ,vPopRedround:"vPop/redRound.png"
    ,vPopBlueround:"vPop/blueRound.png"
    ,vPopSprite:"vPop/vPopSprite.png"
    ,vPopMasterMarker:"vPop/mastermarker.png"  // needs cleanup
    ,vPopMasterMarkerHover:"vPop/masterMarkerHover.png" // needs cleanup
    ,vPopscrollup:"vPop/scrollUp.png"
    ,vPopscrolldown:"vPop/scrollDown.png"
    ,vPopSpriteBottom:"vPop/spriteBottom.png"
    ,vPopTabsButton:"vPop/vPopTabs.png"
    ,vPopTabsButtonHover:"vPop/vPopTabsHover.png"
    ,vPopGrayStrip:"vPop/graystrip.png"
    ,vPopDeleteTab:"vPop/delete360Tab.png"
  };
  //vidteq.imgPath.transferPath(0,vidteq.imgPath,myImg,vidteq.imgPath.nonThemedPath);
  imgPath.transferPath(0,imgPath,myImg,imgPath.nonThemedPath);
  this.imgPath = imgPath;
}

vidteq._venue360.prototype.cleanUpSceneChildren = function() {
  if (!this.scene) { return; }
  for (var i=this.scene.children.length-1; i>=0; i--) { // remove from top
    var obj = this.scene.children[i];
    this.scene.remove(obj);
    if (obj.geometry) {
      obj.geometry.dispose();
      delete obj.geometry; // TBD why ?
    }
    if (obj.material) {
      if (obj.material.map && 
          obj.material.map.image && 
          obj.material.map.image.remove) {
        obj.material.map.image.remove();
      }
      if (obj.material.dispose) {
        obj.material.dispose();
      }
      delete obj.material;  // TBD why ?
    }
    //if (obj.dispose) {
    //  obj.dispose();
    //}
    obj.remove();
    delete obj; // TBD why?
  }
  //this.deallocated = true;
}

vidteq._venue360.prototype.parseDirEntry = function(view,offset) {
  var one = {};
  one.row = view.getUint16(offset,true);
  one.col = view.getUint16(undefined,true);
  one.width = view.getUint32(undefined,true);
  one.height = view.getUint32(undefined,true);
  one.xPos = view.getUint32(undefined,true);
  one.yPos = view.getUint32(undefined,true);
  one.offset = view.getUint32(undefined,true);
  one.size = view.getUint32(undefined,true);
  return one; 
}

//vidteq._venue360.prototype.parsePtv = function(data) {
//  var view = new jDataView(data);
//  var ptv = {};
//  ptv.signature = view.getString(2);
//  ptv.version = view.getUint16(undefined,true);
//  ptv.width = view.getUint32(undefined,true);
//  ptv.height = view.getUint32(undefined,true);
//  ptv.dirSizeHeader = view.getUint32(undefined,true);
//  ptv.dirSizeEntry = view.getUint32(undefined,true);
//  ptv.dirOffset = view.getUint32(undefined,true);
//  ptv.bitFlags = view.getUint32(undefined,true);
//  ptv.dirRows = view.getUint16(ptv.dirOffset,true);
//  ptv.dirCols = view.getUint16(ptv.dirOffset+2,true);
//  ptv.dirPreview = view.getUint16(ptv.dirOffset+4,true);
//  if (ptv.dirPreview) {
//    ptv.previewEntry = this.parseDirEntry(view,view.tell());
//  }
//  var dirOffset = view.tell();
//  ptv.dirEntries = [];
//  for (var i=0;i<ptv.dirRows;i++) {
//    for (var j=0;j<ptv.dirCols;j++) {
//      var curOffset = dirOffset + i*ptv.dirCols*ptv.dirSizeEntry + j*ptv.dirSizeEntry;
//      ptv.dirEntries.push(this.parseDirEntry(view,curOffset));
//    }
//  }
//  if (ptv.dirPreview) {
//    var imgData = view.getString(ptv.previewEntry.size,ptv.previewEntry.offset);
//    ptv.previewImg = new Image();
//    var src = window.btoa(imgData);
//    ptv.previewImg.src = 'data:image/jpeg;base64,'+src;
//  }
//  for (var i in ptv.dirEntries) {
//    var d = ptv.dirEntries[i];
//    var imgData = view.getString(d.size,d.offset);
//    d.img = new Image();
//    var src = window.btoa(imgData);
//    d.img.src = 'data:image/jpeg;base64,'+src;
//  }
//  delete view;
//  return ptv;
//}

vidteq._venue360.prototype.parsePtvReEntrant = function(data,ptv) {
  var view = new jDataView(data);

  if (data.length <28 ) { return ptv; }
  if (!ptv.headerExtracted) {
    ptv.signature = view.getString(2);
    ptv.version = view.getUint16(undefined,true);
    ptv.width = view.getUint32(undefined,true); 
    ptv.height = view.getUint32(undefined,true);
    var lessFraction = 1 - ptv.height*2/ptv.width; 
    ptv.startTheta = Math.PI * lessFraction/2;
    ptv.endTheta = Math.PI * (1 - lessFraction/2);
    ptv.dirSizeHeader = view.getUint32(undefined,true);
    ptv.dirSizeEntry = view.getUint32(undefined,true);
    ptv.dirOffset = view.getUint32(undefined,true);console.log(ptv.dirOffset);
    ptv.bitFlags = view.getUint32(undefined,true);
    ptv.headerExtracted = true;
    ptv.consumedOffset = 28;
  }

  if (data.length < ptv.dirOffset+6) { return ptv; }
  if (!ptv.directoryHeaderExtracted) {
    ptv.dirRows = view.getUint16(ptv.dirOffset,true);
    ptv.dirCols = view.getUint16(ptv.dirOffset+2,true);
    ptv.dirPreview = view.getUint16(ptv.dirOffset+4,true);
    ptv.directoryHeaderExtracted = true;
    ptv.consumedOffset = ptv.dirOffset+6;
  }
  
  var startOfDirList = ptv.dirOffset+6;
  var dirOffset = startOfDirList;
  if (ptv.dirPreview) {
    if (!ptv.dirPreviewExtracted) {
      if (data.length < startOfDirList+ptv.dirSizeEntry) { return ptv; }
      // TBD moved up
      ptv.previewEntry = this.parseDirEntry(view,startOfDirList);
      var lessFraction = 1 - ptv.previewEntry.height*2/ptv.previewEntry.width;
      ptv.previewEntry.startTheta = Math.PI * lessFraction/2;
      ptv.previewEntry.endTheta = Math.PI * (1 - lessFraction/2);
      ptv.dirPreviewExtracted = true;
      ptv.consumedOffset = startOfDirList+ptv.dirSizeEntry;
    }
    dirOffset += ptv.dirSizeEntry;
  }

  if (!('dirEntries' in ptv)) { ptv.dirEntries = []; }
  for (var i=0;i<ptv.dirRows;i++) {
    for (var j=0;j<ptv.dirCols;j++) {
      if (ptv.dirEntries.length > i*ptv.dirCols+j) { continue; }
      var curOffset = dirOffset + i*ptv.dirCols*ptv.dirSizeEntry + j*ptv.dirSizeEntry;
      if (data.length < curOffset+ptv.dirSizeEntry) { return ptv; }
      ptv.dirEntries.push(this.parseDirEntry(view,curOffset));
      ptv.consumedOffset = curOffset+ptv.dirSizeEntry;
    }
  }

  if (ptv.dirPreview) {
    if (!ptv.previewImg) {
      if (data.length < ptv.previewEntry.offset+ptv.previewEntry.size) { return ptv; }
      var imgData = view.getString(ptv.previewEntry.size,ptv.previewEntry.offset,encoding='binary');
      ptv.previewImg = new Image();
      var src = window.btoa(imgData);
      
      ptv.previewImg.src = 'data:image/jpeg;base64,'+src;
      //ptv.previewImg.src  = (window.URL || window.webkitURL).createObjectURL(new Blob(imgData))
      // I dont understand why TBD
      ptv.consumedOffset = ptv.previewEntry.offset+ptv.previewEntry.size;
    }
  }
  for (var i in ptv.dirEntries) {
    var d = ptv.dirEntries[i];
    if (!d.img) {
      if (data.length < d.offset+d.size) { continue; }  
      // why - because images can be out of order - we should not return
      var imgData = view.getString(d.size,d.offset);
      d.img = new Image();
      //d.img.src = (window.URL || window.webkitURL).createObjectURL(new Blob(imgData));
      var src = window.btoa(imgData);
      d.img.src = 'data:image/jpeg;base64,'+src;
      ptv.consumedOffset = d.offset+d.size;
    }
  }
  console.log(ptv);
  delete view;
  return ptv;
}

vidteq._venue360.prototype.fetchPtv = function(ptvFile,callback) { 
  var that = this;
  var xhr = (window.XMLHttpRequest) 
    ? new XMLHttpRequest()      // Mozilla/Safari/IE7+
    : (window.ActiveXObject) ? 
      new ActiveXObject("MSXML2.XMLHTTP")  // IE6
      : null;  // Commodore 64?
  //if (window.ActiveXObject) {
  //  xhr = new ActiveXObject('text/plain; charset=x-user-defined');
  //} else {
  //  xhr.overrideMimeType('text/plain; charset=x-user-defined');
  //}
  xhr.open('GET',ptvFile,true);
  if (this.isIe && this.ieVer == 11) {
    xhr.responseType = 'arraybuffer'; 
    // Besides IE it may work in other browsers TBD
  } else if (window.ArrayBuffer) {
    xhr.responseType = 'arraybuffer'; 
  } else if (xhr.overrideMimeType) {
    xhr.overrideMimeType('text/plain; charset=x-user-defined');
  } else {
    xhr.setRequestHeader("Accept-Charset", "x-user-defined");
  }
  var ptv = {offset:-1};
  xhr.onreadystatechange = function(evt) {
    if (this.readyState != 4 && this.readyState != 3) { return; }
    // TBD needed ?
    if (this.readyState == 3 && this.status != 200) { return; }
    if (this.readyState == 4 && this.status != 200) {
        // TBD let us look at it later
        //clearInterval(pollTimer);
        //inProgress = false;   
    }
    if (this.readyState == 4 && this.status == 200) {
      console.log("xhr",xhr);
    }
    var resp = undefined;
    if (that.isIe && that.ieVer < 10) {
      if (that.ieVer == 10) { // TBD temporary till we figure out
        if (this.readyState == 4 && this.status == 200) { } else { return; }
      }
      var bodyReady = true;
      try {
        resp = that.convertResponseBodyToText(this.responseBody);
      } catch (e) { 
        bodyReady = false; 
      }
      if (!bodyReady) { return ; }
      if (!resp.length) { return ; }
      if (!('prevLength' in ptv) || resp.length != ptv.prevLength) { } else { return; }
      ptv.prevLength = resp.length; 
    } else if (that.isIe && that.ieVer == 11) { 
      try {
        resp = this.response;
      } catch (e) { 
      }
    } else {
        resp = this.response;
      //resp = this.responseText;
    }
    //if (resp && resp.length) { }
    if (resp) {
      that.parsePtvReEntrant(resp,ptv);
      callback(resp,ptv);
    }
    //if (this.readyState == 4 && this.status == 200) {
    //  if (that.isIe && that.ieVer < 11) { 
    //    var resp = that.convertResponseBodyToText(this.responseBody);
    //  } else if (that.isIe && that.ieVer == 11) { 
    //    var resp = this.response;
    //  } else {
    //    var resp = this.responseText;
    //  }
    //  //var ptv = that.parsePtv(resp);
    //  that.parsePtvReEntrant(resp,ptv);
    //  callback(ptv);
    //}
  };
  //xhr.onreadystatechange = function (evt) {
  //  if (this.readyState == 4 && this.status == 200) {
  //    var ptv = that.parsePtv(this.responseText);
  //    callback(ptv);
  //  }
  //};
  xhr.send();
}

vidteq._venue360.prototype.rerender = function() {
  //this.camera.projectionMatrix.makePerspective(this.fov,$("#viewer").width()/$("#viewer").height(), 1, 100 );
  this.camera.fov = this.fov;
  this.camera.updateProjectionMatrix();
  this.render();
}

vidteq._venue360.prototype.init3js = function( preInitCallback ) {
	console.log("init3js");
  var id = this.viewerId;
  var container = this.container = document.getElementById(id)
  ,width = container.width = $('#'+id).width()
  ,height = container.height = $('#'+id).height()
  ;
  if( this.renderMode == 'webGl' ) {
    //THREE.ImageUtils.crossOrigin = "anonymous";
    //this.clock = new THREE.Clock();
    this.createClock(); 
    var renderer = this.renderer = new THREE.WebGLRenderer({
      antialias: true
      ,alpha:true //brings tranparency in three js in place of background clr
    });
    renderer.gammaInput = true;
    renderer.gammaOutput = true;
    renderer.setClearColor(0x030303);
    //renderer.setBackgroundColor(0x030303);
  }else {
    var renderer = this.renderer = new THREE.CanvasRenderer();
  }
  renderer.setSize( width, height );
  container.appendChild( renderer.domElement);
  if( this.hasCanvasHidden ) {
    $('#'+id+' canvas').hide();
  }
  if( preInitCallback ) {
    preInitCallback(this);
  }
  var _cb360 = this.callbackVenue360;
  if( _cb360.after && typeof _cb360.after.init3js === 'function' ) {
    _cb360.after.init3js.call( this, this.callbackVenue360.data );
  }
  this.initEvents();
  // major temp
  //this.updateScene(120,500,80,140);
  //if(this.ui.editableMode){
	//	var ax=this.creatingAxis(1000);
	//  this.scene.add(ax);
  //  this.tiler = new vidteq._venue360._tiler(this);
  //  this.addExtraObject();
  //  this.render();
  //  this.animate();
	//}
}

vidteq._venue360.prototype.initEvents = function() {
	console.log("initEvents");
  if( navigator.userAgent.match(/Android/i)
      || navigator.userAgent.match(/webOS/i)
      || navigator.userAgent.match(/iPhone/i)
      || navigator.userAgent.match(/iPad/i)
      || navigator.userAgent.match(/iPod/i)
      || navigator.userAgent.match(/BlackBerry/i)
      || navigator.userAgent.match(/Windows Phone/i)
     ){
    //container.addEventListener( 'touchmove', onTouchMove, false );
    //container.addEventListener( 'touchstart', onTouchStart, false );
  }else {
    var that=this;
    //document.addEventListener( 'mousedown',function(evt) {  }
    this.renderer.domElement.addEventListener( 'mousedown',function(evt) { 
      that.onDocumentMouseDown(evt); 
    }, false );
    //document.addEventListener( 'mousemove',function(evt) { }
    this.renderer.domElement.addEventListener( 'mousemove',function(evt) { 
      that.onDocumentMouseMove(evt); 
    }, false );
    //document.addEventListener( 'mouseup',function(evt) { }
    this.renderer.domElement.addEventListener( 'mouseup',function(evt) { 
      that.onDocumentMouseUp(evt); 
    }, false );
    /*this.renderer.domElement.addEventListener( 'mouseover',function(evt) { 
      that.doRayProjection(evt); 
    }, false );*/
    var mousewheelevt=(/Firefox/i.test(navigator.userAgent))? "DOMMouseScroll" : "mousewheel";
    var mousedbcevt=(/Firefox/i.test(navigator.userAgent))? "DOMMouseScroll" : "dblclick";
    if( document.attachEvent ) {
      document.attachEvent("on"+mousewheelevt,function(evt) { 
        that.onDocumentMouseWheel(evt); 
      });
    }else if( document.addEventListener ) {
      document.addEventListener(mousewheelevt,function(evt) {
        that.onDocumentMouseWheel(evt);
      }, false);
       /*document.addEventListener(mousedbcevt,function(evt) { 
        that.onDocumentMouseDbc(evt); 
      },false);*/
      //console.log(that);alert();
      if(that.ui.editor){
				that.ui.editor.mapZoom();
			}
    }
    document.onkeydown = function(evt) { 
      that.onKeyDown(evt); 
      if (evt.keyCode == 27) 
        {
          alert ("Esc Key Pressed");
          that.ui.closeFs();
      }
    };
    document.onkeyup = function(evt) { 
      that.onKeyUp(evt);
    }
  }
  //$(window).on('beforeunload',function() {
  window.onbeforeunload = function(evt) { 
    // IE triggers this simply on its will
    if (that.isIe && that.ieVer <=10) { } else {
      that.cleanUpTheScene();
    }
  }
  var that = this;
  window.onunload = function(evt) { 
    that.cleanUpTheScene();
  }
  //this.doMyExperiments();
}

vidteq._venue360.prototype.setFov = function( options ) {
  var fov = options.fov
  ,far = options.far
  ,minFov = options.minFov
  ,maxFov = options.maxFov
  ,near = options.near
  ;
  if( fov ) { this.fov = fov; }
  if( minFov ) { this.minFov = minFov; }
  if( maxFov ) { this.maxFov = maxFov; }
  if( far ) { this.far = far; }
  if( near ) { this.near = near; }
}

vidteq._venue360.prototype.updateScene = function(fov,far,minFov,maxFov,near) {
  if( this.scene ) {
    this.setFov({
      fov:fov
      ,far:far
      ,minFov:minFov
      ,maxFov:maxFov
      ,near:near
    });
    var viewerId = this.viewerId;
    this.camera.fov = typeof fov !== "undefined" ? fov : this.fov;
    this.camera.far = typeof far !== "undefined" ? far : this.far;
    this.camera.aspect = $("#"+viewerId).width() / $("#"+viewerId).height();
    this.camera.updateProjectionMatrix();
    return true; 
  }
  this.initScene({
    fov:fov
    ,far:far
    ,minFov:minFov
    ,maxFov:maxFov
    ,near:near
  });
}

vidteq._venue360.prototype.addProjector = function( origin, direction, near, far ) {
  var origin = typeof origin !== "undefined"? origin : this.camera.position
  ,direction = typeof direction !== "undefined"? direction : new THREE.Vector3(0,0,0)
  ,near = typeof near !== "undefined"? near : 0
  ,far = typeof far !== "undefined"? far : 105
  ;
  this.projector = new THREE.Projector();
  //this.ray = new THREE.Raycaster( origin, direction, near, far );
}

vidteq._venue360.prototype.initScene = function( options ) {
	console.log("initScene");
  options = options || {};
  this.setFov(options);
  var fov = (typeof options.fov !== "undefined" ? options.fov : this.fov)
  ,far = (typeof options.far !== "undefined" ? options.far : this.far)
  ,near = (typeof options.near !== "undefined" ? options.near : this.near)
  
  ,position = (typeof options.position !== "undefined" ? options.position : {x:0,y:0,z:0} )
  ,target = (typeof options.target !== "undefined" ? options.target : {x:0,y:0,z:0} )
  ,container = this.container
  ,width = container.width
  ,height = container.height
  ,camera = this.camera = new THREE.PerspectiveCamera(fov, width/height, near, far )
  ;
  //camera.position.set( 20, 20, 20);
  camera.position.set( position.x, position.y, position.z );
  camera.target = new THREE.Vector3( target.x, target.y, target.z );
  
  this.scene = new THREE.Scene();
  
  if( this.options.cameraConfig && this.options.cameraConfig.hasCameraControls && THREE.OrbitAndPanControls ) {
    var cameraControlsOptions = this.options.cameraConfig.cameraControlsOptions || {};
    cameraControlsOptions.object = this.camera;
    cameraControlsOptions.domElement = this.renderer.domElement;
    this.cameraControls = new THREE.OrbitAndPanControls( cameraControlsOptions, this );
    this.cameraControls.target.set( target.x, target.y, target.z );
  }
  //console.log(this.camera);alert();
  this.addProjector();
  //this.initEvents();
}

//vidteq._venue360.prototype.drawTiles = function(ptv,oneThumb,oneTab) {
//  this.fov = parseInt(oneThumb.fov[1])/2;
//  this.minFov = parseInt(oneThumb.fov[0])/2;
//  this.maxFov = parseInt(oneThumb.fov[2])/2; 
//  this.initSceneNew(this.fov,100);
//
//  //this.sceneCreated = true;
//  //this.camera = new THREE.PerspectiveCamera( this.fov,$("#"+this.viewerId).width() / $("#"+this.viewerId).height(), 1, 100 );
//  //this.camera.target = new THREE.Vector3( 0, 0, 0 );
//  //this.scene = new THREE.Scene();
//
//  //var seq = this.fillLoadSequence();
//  //seq[seq.length-1].last = true;
//  var sP = (this.renderMode == 'canvas')?
//    {r:10,xS:30,yS:25}:
//    {r:100,xS:100,yS:100};
//  try {
//    this.drawTile({
//      image:ptv.previewImg
//      ,r:sP.r
//      ,xS:sP.xS
//      ,yS:sP.yS
//      ,startPI:0
//      ,PIDiff:2*Math.PI
//      ,startTheta:Math.PI/4
//      ,thetaDiff:(Math.PI/4) * 2
//    });
//  } catch (evt) { 
//    //console.log("venue360--some kind of failure");console.log(evt); 
//  }
//  this.addExtraObject();
//  this.addMarkers(oneThumb,oneTab);
//  var runTime = 100;
//  var that = this;
//  var runCount = 0;
//  var callback = function() {
//    runCount++;
//    var w = parseInt((runCount/(ptv.dirEntries.length-1))*$("#oProgress").width())-5;  
//    $("#iProgress").css({width:w});
//    if (runCount == ptv.dirEntries.length-1) {
//      that.loadedAllTiles();
//      //$("#iProgress").remove();
//      //$("#oProgress").remove();
//      //that.autoPan = true;
//      //that.loaded = true;
//      //$('#popupFS').show();
//    }
//  };
//  for (var i in ptv.dirEntries) {
//    (function() {
//      var idx = i;
//      setTimeout(function() {
//        var d = ptv.dirEntries[idx];
//        that.drawTile({
//          image:d.img
//          ,reduce:true
//          ,r:sP.r
//          ,xS:parseInt((d.width/ptv.width)*sP.xS)
//          ,yS:parseInt((d.height/ptv.height)*sP.yS)
//          ,startPI:(d.xPos/ptv.width)*2*Math.PI+oneThumb.pictureAngle
//          ,PIDiff:(d.width/ptv.width)*2*Math.PI
//          ,startTheta:Math.PI/4 + (d.yPos/ptv.height)*Math.PI/2
//          ,thetaDiff:(d.height/ptv.height)*Math.PI/2
//        },callback);
//      },runTime);
//      runTime += 100;
//    })();
//  }
//}

vidteq._venue360.prototype.drawTilesReEntrant = function(ptv,oneThumb,oneTab) {
  var sP = (this.renderMode == 'canvas')?
    {r:10,xS:30,yS:25}:
    {r:100,xS:100,yS:100};
  if (ptv.previewImg && !ptv.previewImgDrawn) {
    try {
      this.drawTile({
        image:ptv.previewImg
        ,r:sP.r
        ,xS:sP.xS
        ,yS:sP.yS
        //,startPI:0
        ,startPI:0-oneThumb.pictureAngle
        ,PIDiff:2*Math.PI
        //,startTheta:Math.PI/4
        ,startTheta:ptv.previewEntry.startTheta
        //,thetaDiff:(Math.PI/4) * 2
        ,thetaDiff:(ptv.previewEntry.endTheta - ptv.previewEntry.startTheta)
      });
    } catch (evt) { 
      //console.log("venue360--some kind of failure");console.log(evt); 
    }
    ptv.previewImgDrawn = true;
  }

  if( !ptv.extraObjectsDrawn ) {
    this.addExtraObject();
    this.addMarkers(oneThumb,oneTab);
    if (this.ui.editor) {
      this.ui.editor.addExtraObject(oneTab,oneThumb);
    }
    ptv.extraObjectsDrawn = true;
  }
  if (!ptv.dirEntries || !ptv.dirEntries.length) { return; }
  if (!ptv.callback) {
    var that = this;
    var runCount = 0;
    ptv.callback = function() {
      runCount++;
      var w = parseInt((runCount/(ptv.dirEntries.length-1))*$("#oProgress").width())-5;  
      $("#iProgress").css({width:w});
      if (runCount == ptv.dirEntries.length-1) {
        that.loadedAllTiles();
      }
    };
  }
  var runTime = 100;
  this.fullVertical = (ptv.width == 2*ptv.height);
  this.startTheta = ptv.startTheta;
  this.endTheta = ptv.endTheta;
  var that = this;
  for (var i in ptv.dirEntries) {
    if (ptv.dirEntries[i].drawn) { continue; }
    (function() {
			
      var idx = i;
      setTimeout(function() {
        var d = ptv.dirEntries[idx];
        //console.log((d.xPos/ptv.width)*2*Math.PI);
        that.drawTile({
          image:d.img
          ,reduce:true
          ,r:sP.r
          ,xS:parseInt((d.width/ptv.width)*sP.xS)
          ,yS:parseInt((d.height/ptv.height)*sP.yS)
          ,startPI:(d.xPos/ptv.width)*2*Math.PI-oneThumb.pictureAngle
          ,PIDiff:(d.width/ptv.width)*2*Math.PI
          //,startTheta:Math.PI/4 + (d.yPos/ptv.height)*Math.PI/2
          ,startTheta:ptv.startTheta + (d.yPos/ptv.height)*(ptv.endTheta-ptv.startTheta)
          //,thetaDiff:(d.height/ptv.height)*Math.PI/2
          ,thetaDiff:(d.height/ptv.height)*(ptv.endTheta-ptv.startTheta)
        },ptv.callback);
      },runTime);
      runTime += 100;
    })();
  }
  
}

vidteq._venue360.prototype.geoTile = function() {
  var size = [960, 500],
  scale = 256,
  translate = [size[0] / 2, size[1] / 2],
  zoomDelta = 0;
  var d3_range_integerScale = function(x) {
    var k = 1;
    while (x * k % 1) k *= 10;
    return k;
  };
  var d3_range = function(start, stop, step) {
    if (arguments.length < 3) {
      step = 1;
      if (arguments.length < 2) {
        stop = start;
        start = 0;
      }
    }
    if ((stop - start) / step === Infinity) throw new Error("infinite range");
    var range = [], k = d3_range_integerScale(Math.abs(step)), i = -1, j;
    start *= k, stop *= k, step *= k;
    if (step < 0) while ((j = start + step * ++i) > stop) range.push(j / k); else while ((j = start + step * ++i) < stop) range.push(j / k);
    return range;
  };
  function tile() {
    var z = Math.max(Math.log(scale) / Math.LN2 - 8, 0),
    z0 = Math.round(z + zoomDelta),
    k = Math.pow(2, z - z0 + 8),
    origin = [(translate[0] - scale / 2) / k, (translate[1] - scale / 2) / k],
    tiles = [],
    cols = d3_range(Math.max(0, Math.floor(-origin[0])), Math.max(0, Math.ceil(size[0] / k - origin[0]))),
    rows = d3_range(Math.max(0, Math.floor(-origin[1])), Math.max(0, Math.ceil(size[1] / k - origin[1])));
    
    $.each(rows,function(y){
      $.each(cols,function(x){
        tiles.push([x, y, z0]);
      });
    });
    tiles.translate = origin;
    tiles.scale = k;
    return tiles;
  }
  tile.size = function(_) {
    if (!arguments.length) return size;
    size = _;
    return tile;
  };
  tile.scale = function(_) {
    if (!arguments.length) return scale;
    scale = _;
    return tile;
  };
  tile.translate = function(_) {
    if (!arguments.length) return translate;
    translate = _;
    return tile;
  };
  tile.zoomDelta = function(_) {
    if (!arguments.length) return zoomDelta;
    zoomDelta = +_;
    return tile;
  };
  return tile;
}

vidteq._venue360.prototype.addArrowHelpers = function(dX,dY,dZ,oX,oY,oZ,l,c) {
  var l = l || 4;
  var c = c || 0xffffff;
  var arrowHelper = new THREE.ArrowHelper(
    new THREE.Vector3(dX,dY,dZ)  // dir
    ,new THREE.Vector3(oZ,oY,oZ)  // origin
    ,l
    ,c
  );
  this.scene.add(arrowHelper);
}

vidteq._venue360.prototype.blinkObject = function(obj) {
  if (typeof(obj.myScaled) != 'undefined' && obj.myScaled) { return }
  if (obj.scale.x > 1.0) {
    obj.scale.x = 1.0;
    obj.scale.y = 1.0;
  } else {
    obj.scale.x = 1.12;
    obj.scale.y = 1.12;
  }
}

vidteq._venue360.prototype.addMenuObjectTimer = function() {
  if(typeof(this.objectTimer) != 'undefined') { 
    clearInterval(this.objectTimer); 
  }
  var that = this;
  this.objectTimer = setInterval(function() {
    for (var i in that.menuObjects) {
      that.blinkObject(that.menuObjects[i]);
    }
  },600); 
}
//t changed to oneMarker
//vidteq._venue360.prototype.addButton = function(oneMarker,p,r,clickFunc,editMode) {
vidteq._venue360.prototype.addButton = function(oneMarker,p,r,clickFunc) {
	console.log("addButton",oneMarker);
	console.log("addButton",p);
	console.log("addButton",this.scene);
//vidteq._venue360.prototype.addButton = function(t,p,r,clickFunc,oneMarker) { }
  //var tx = this.makeTextTexture(
  //   t
  //   ,200,100  // h,w
  //   ,'12px Arial'
  //   ,'brown'
  //   ,'yellow'
  //   ,'center'
  //   ,'middle'
  //   ,'rgba(0,0,0,0)'
  //);
  //var icon360 = oneMarker.icon360 || this.imgPath.vPopRedround ;
  var icon360 = this.imgPath.vPopRedround;
  if (oneMarker.icon360) { 
    icon360 = oneMarker.icon360;
  }
  
  if ( oneMarker.type &&  oneMarker.type == 'poi') {
    icon360 = oneMarker.thumb.image;
  }
  if (icon360 == 'noShow') { icon360 = null; }
  if (icon360 == 'default') { icon360 = this.imgPath.vPopRedround; }
  if (!icon360) { return; }
  /*if (oneMarker.thumb && oneMarker.thumb.imMrk) {
    var path = vidteq.cfg.custom360Images+vidteq.aD.urlId+"/"+oneMarker.dirCode+"/marker/"+oneMarker.thumb.imMrk.name;
    icon360=path;
  }else if(oneMarker.creation=="custom"){icon360 = this.imgPath.vPopBlueround;}*/
  
  if (oneMarker.thumb && oneMarker.thumb.imMrk) {    
    icon360=oneMarker.thumb.mrkImg;
  }else  if (oneMarker.thumb && oneMarker.thumb.mrkImg) {
    var path = oneMarker.thumb.imMrkName;
    icon360=oneMarker.thumb.mrkImg;
  }else if(oneMarker.creation=="custom"){icon360 = this.imgPath.vPopBlueround;}
  var tx = THREE.ImageUtils.loadTexture( icon360 );
  //var g = new THREE.PlaneGeometry(2,2);
  var gR = (this.renderMode == 'canvas')?0.2:1;
  var gS = (this.renderMode == 'canvas')?15:30;
  //var g = new THREE.SphereGeometry(1,30,30,0,Math.PI);
  //var g = new THREE.SphereGeometry(gR,gS,gS,0,Math.PI);
  var  g = new THREE.PlaneGeometry(2,2);
  if (oneMarker.creation=="custom" && 
     (oneMarker.thumb && 
     (oneMarker.thumb.imMrkWidth!=undefined || 
      oneMarker.thumb.imMrkHeight!=undefined))) {
    g = new THREE.PlaneGeometry(parseInt(oneMarker.thumb.imMrkWidth),parseInt(oneMarker.thumb.imMrkHeight));
  }
  tx.needsUpdate = true;
  var m = new THREE.MeshBasicMaterial({
     map:tx
    // map:t
    //,wireframe:true
    ,transparent:true
    ,overdraw:true
  });
  m.map.needsUpdate = true; 
  //tx.needsUpdate = true;  
  var b = new THREE.Mesh(g,m);
  b.scale.x = -1;
  b.material.side = THREE.DoubleSide;

  b.position = p;
  b.myMarker = 'red';
  //this.scene.add(b);
  console.log("r=",r);
  for (var i in r) {
		console.log("r=",b.rotation[i]);
    b.rotation[i] = r[i];
  }
  b.castShadow = true;
  if (clickFunc) {
    b.myClickFunc = clickFunc;
  }
  var toolTip = oneMarker.thumb? oneMarker.thumb.desc : 'I dont know';
  if (toolTip) {
    b.toolTip = toolTip;    
  }
  if(oneMarker.creation=='auto'){b.creation='auto';b.indx=oneMarker.indx;}
  if(oneMarker.creation=='custom'){b.creation='custom';}
  //b.draggable=true;
  console.log("b",b);
  console.log("b",this.scene);
  this.scene.add(b);
  this.menuObjects.push(b);
  //if (this.ui.editableMode) {
  //  // draggable
  //  b.draggable = true;
  //}
  // if( oneMarker && oneMarker.type!='poi') {
  //  // clickable
  //  b.clickable = true;
  //}
}
  
vidteq._venue360.prototype.addMarkers = function(oneThumb,oneTab) {
  console.log("addMarkers",oneThumb);
  //var dist = (this.renderMode == 'canvas')?4:30;
  var that = this;
  var defaultDist = (this.renderMode == 'canvas')?4:30;
  //if(this.ui.editableMode) {
  //  var oneThumb = {pictureAngle:0};
  //  var editMode = oneThumb;
  //  var p = new THREE.Vector3(
  //    dist*Math.cos(angle*Math.PI/180)
  //    //30*Math.cos(angle*Math.PI/180)/original one
  //    ,0
  //    // ,30*Math.sin(angle*Math.PI/180): original one
  //    ,dist*Math.sin(angle*Math.PI/180)
  //    //z:30*(1/Math.sin(angle*Math.PI/180))
  //  );
  //    var r = {y:(270-angle)*Math.PI/180};
  //}
  for (var i in oneThumb.markers) {
    var oneMarker = oneThumb.markers[i];
    oneMarker.dirCode=oneTab.dirCode;
    if (oneMarker.icon360 && oneMarker.icon360 == 'noShow') { 
      continue;
    }
    console.log(oneThumb);
    var angle = oneMarker.angle;
    var dist = oneMarker.dist || defaultDist;
    var p = new THREE.Vector3(
      //dist*Math.cos(angle*Math.PI/180)
      //30*Math.cos(angle*Math.PI/180)/original one
      //,0
      // ,30*Math.sin(angle*Math.PI/180): original one
      //,dist*Math.sin(angle*Math.PI/180)
      //z:30*(1/Math.sin(angle*Math.PI/180))
    );
    p.x= dist*Math.cos(angle*Math.PI/180);
    p.y= dist*Math.sin(oneMarker.elevation*Math.PI/180) || 0;
    p.z= dist*Math.sin(angle*Math.PI/180);
    //~ if(this.autoShow)
    //~ {
    //~ this.lat=0.90;
    //~ this.lon=0.15;
    //~ p=b.translateOnAxis( new THREE.Vector3(1,1,1).normalize(), 5);
    //~ }
    var r = {y:(270-angle)*Math.PI/180};
    var that = this;
    
    //this.addButton(oneMarker,editMode,p,r,function() {  
    this.addButton(oneMarker,p,r,function() {  
      //that.swingCamera(oneMarker.thumb,function() {
      //  if( that.ui.clickedOnThumb ) {
      //    that.ui.clickedOnThumb(oneTab,oneMarker.thumb);
      //  }
      //});
    });
    
    //this.addButton(oneMarker.label,{x:30},{y:3*Math.PI/2});
  }
//======================
  if(oneThumb.markerDesc && oneThumb.markerDesc.length>0){   
    for (var i in oneThumb.markerDesc) {
      if(oneThumb.markerDesc[i]!=null){
        var oneMarker = oneThumb.markerDesc[i];
        oneMarker.dirCode=oneTab.dirCode;
        var angle = oneMarker.angle;
        var dist = oneMarker.dist || defaultDist;
        var p = new THREE.Vector3( );
        p.x= dist*Math.cos(angle*Math.PI/180);
        p.y= dist*Math.sin(oneMarker.elevation*Math.PI/180) || 0;
        p.z= dist*Math.sin(angle*Math.PI/180);
        var r = {y:(270-angle)*Math.PI/180};
        var that = this;
        this.addButton(oneMarker,p,r,function() {  });    
        //this.addButton(oneMarker.label,{x:30},{y:3*Math.PI/2});
      }
    }
  }

//=======================
  //this.addButton('North',new THREE.Vector3(30,0,0),{y:3*Math.PI/2});
  //this.addButton('South',new THREE.Vector3(-30,0,0),{y:Math.PI/2});
  //this.addButton('East',new THREE.Vector3(0,0,30),{y:Math.PI});
  //this.addButton('West',new THREE.Vector3(0,0,-30),{});
}

vidteq._venue360.prototype.swingCamera = function(oneThumb,callback) {
  var animateCycleCount = 300;
  this.autoPan = false;
  this.autoPanRefTime = null;
  var animateIntervalTotal = 1; // sec
  var animateTraverse = 90.0;
  var zStep = animateTraverse/(animateCycleCount/2)
  var animateInterval = animateIntervalTotal*1000/animateCycleCount;
  var curZ = 0;
  var runningCount = animateCycleCount;
  var that = this;
  var callbackExecuted = false;
  var swingTimer =  setInterval(function() {
    runningCount--;
    if (runningCount <= 0) {
      // stop animation
      clearInterval(swingTimer);
      that.camera.position = new THREE.Vector3( 0, 0, 0 );
    } 
    that.camera.position = new THREE.Vector3( 0, 0, curZ );
    if (runningCount > animateCycleCount/2) {
      curZ = curZ + zStep; 
    } else {
      if (!callbackExecuted) { 
        callbackExecuted = true;
        callback(); 
      }
      curZ = curZ - zStep; 
    }
  },animateInterval); 
  //this.camera.position =  
  //this.camera.target = new THREE.Vector3( 0, 0, 0 );
  //  this.camera.position
  //~ this.autoPan = false;
}

vidteq._venue360.prototype.addExtraObject = function() {
  //var geometry = new THREE.CubeGeometry(5,5,5);
  //var material = new THREE.MeshBasicMaterial({ color: 0x00ff00});
  //var cube = new THREE.Mesh(geometry,material);
  //cube.rotation.x += 0.1;
  //cube.rotation.y += 0.1;
  //this.scene.add(cube);
  //var homeTexture = this.makeTextTexture(
  //  'Home'
  //  ,100,100
  //  ,'12px Arial'
  //  ,'white'
  //  ,'center'
  //  ,'middle'
  //  ,'rgba(0,0,0,0)'
  //);
  //var homeGeom = new THREE.PlaneGeometry(30,30);
  ////var homeGeom = new THREE.CubeGeometry(5,5,2);
  ////homeGeom.applyMatrix(new THREE.Matrix4().makeTranslation(5,5,5));
  //var homeMaterial = new THREE.MeshBasicMaterial({
  //  map:homeTexture
  //  ,transparent:true
  //  //color:0xff0000
  //});
  ////var homeMaterial = new THREE.MeshLambertMaterial({
  ////  map:tryTexture
  ////  //,transparent:false
  ////  //,color:0xff0000
  ////}); 
  //var homeTest = new THREE.Mesh(homeGeom,homeMaterial);
  //homeTest.material.side = THREE.DoubleSide;
  ////homeTest.overdraw = true;
  //homeTest.position.x = 0;
  //homeTest.position.y = 0;
  //homeTest.position.z = -30;
  ////homeTest.rotation.z = Math.PI/2;
  ////homeTest.rotation.x = 1;
  //homeTest.castShadow = true;
  //this.scene.add(homeTest);
  this.addMenuObjectTimer();
  //this.addAModel();
  if (this.tiler) {
    this.tiler.init({
      ll:{
        lon:77.695313004
        ,lat:13.007813004
      }
      ,ur:{
        lon:77.783203692
        ,lat:13.095703692
      }
    });
  }
  //this.menuObjects.push(homeTest);

  //this.addButton('North',{x:30},{y:3*Math.PI/2});
  //this.addButton('South',{x:-30},{y:Math.PI/2});
 // this.addButton('East',{z:30},{y:Math.PI});
  //this.addButton('West',{z:-30},{});
  /*this.ray = new THREE.Raycaster(
    this.camera.position
    , new THREE.Vector3(0,0,0)
    ,0
    ,105  
  );*/
  //~ this.addButton('attr','+circleImg+');
  //var axisHelper = new THREE.AxisHelper(10);
  //this.scene.add(axisHelper);
  //~ 
  //this.addArrowHelpers(1,0,0,5,5,5,4,0xff0000);
  //this.addArrowHelpers(0,1,0,5,5,5,4,0x00ff00);
  //this.addArrowHelpers(0,0,1,5,5,5,4,0x0000ff);
  //this.addArrowHelpers(1,0,0,5,5,50,10,0xff0000);
  //this.addArrowHelpers(0,1,0,5,5,50,10,0x00ff00);
  //this.addArrowHelpers(0,0,1,5,5,50,10,0x0000ff);
  //var size = 10;
  //var step = 1;
  //var gridHelper = new THREE.GridHelper(size,step);
  //gridHelper.position = new THREE.Vector3(10,10,0);
  //gridHelper.rotation = new THREE.Euler(15,0,0);
  //this.camera.position.z = 10;
}

vidteq._venue360.prototype.makeTextTexture = function(
  text,width,height,font,fillStyle,textAlign,textBaseline,bgColor) {
  var bitMap = document.createElement('canvas');
  var g = bitMap.getContext('2d');
  bitMap.width = width;
  bitMap.height = height;
  g.font = font;
  g.fillStyle = bgColor;
  //g.fillStyle = 'green';
  g.fillRect(0,0,width,height);
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillStyle = fillStyle;
  g.fillText(text,width/2,height/2);
  var texture = new THREE.Texture(bitMap);
  texture.needsUpdate = true;
  return texture; 
}

vidteq._venue360.prototype.drawTile = function(t,callback,callbackError) {
  if (t.image) {
    var texture = new THREE.Texture(t.image);
    //var texture = new THREE.Texture(t.image,undefined,undefined,callbackError);
  } else {
    var texture = THREE.ImageUtils.loadTexture(t.imageSrc,new THREE.UVMapping(),callback);
  }  
  //console.log(t);alert();
  texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  if (t.reduce) { t.r -= 1; }
  var sphere = new THREE.SphereGeometry(t.r,t.xS,t.yS,t.startPI,t.PIDiff,t.startTheta,t.thetaDiff);
  var material = new THREE.MeshBasicMaterial( { 
    map:texture
    //,wireframe:true
    ,overdraw:true 
  } );
  material.map.needsUpdate = true;
  var mesh = new THREE.Mesh(sphere,material);
  mesh.scale.x = -1;
  mesh.myMarker = 'tile';
  this.scene.add(mesh);
  if (!('tiles' in this)) { this.tiles = []; } 
  this.tiles.push(mesh);
  if (t.image && callback) {  callback() }
}

//vidteq._venue360.prototype.initScene = function() {
//  this.sceneCreated = true;
//  this.camera = new THREE.PerspectiveCamera( this.fov,$("#"+this.viewerId).width() / $("#"+this.viewerId).height(), 1, 100 );
//  this.camera.target = new THREE.Vector3( 0, 0, 0 );
//  this.scene = new THREE.Scene();
//  var seq = this.fillLoadSequence();
//  seq[seq.length-1].last = true;
//  var that = this;
//  for (var i in seq) {
//    (function() {
//      var one = seq[i];
//      setTimeout(function() {
//        that.getTile(one);
//      },one.runTime);
//    })();
//  }
//}

vidteq._venue360.prototype.loadedAllTiles = function() {
  this.loaded = true;
  if (this.ui.editor) {    
    if('savePtvClicked' in this.ui.editor && this.ui.editor.savePtvClicked) {
      vidteq.utils.undrapeCurtain('addMarkerCurtain'); 
      $('#bgCurtain').css({'z-index':80000});
    }
    //vidteq.utils.drapeSheer('addMarkerCurtain');
    //$('#bgCurtain').css({'z-index':800000});
    //$('#popupCreate').css({'z-index':800001});
    $("#iProgress").remove();
    $("#oProgress").remove();
    
      
    //this.tiler = new vidteq._venue360._tiler(this);
    //this.addExtraObject();
    //this.render();
    //this.animate();
	  var ax=this.creatingAxis(1000);
	  this.scene.add(ax);
    return;
  }
  $('#bgCurtain').css({'z-index':80000});   
  vidteq.utils.undrapeCurtain('buttonClickCurtain');
  //this.autoPan = true;  
  $("#iProgress").remove();
  $("#oProgress").remove();
  $('#popupFS').show();
  if( this.autoShow && this.ui.invokeFullScreen ) {
    this.ui.invokeFullScreen();
  }
  //testCamera();
  var _cb360 = this.callbackVenue360;
  if( _cb360.after && typeof _cb360.after.loadedAllTiles === 'function' ) {
    _cb360.after.loadedAllTiles.call( this, this.callbackVenue360.data );
  }
}
/*
// try to load map floor texture 
vidteq._venue360.prototype.addTileFloor = function () {
  var g = new THREE.PlaneGeometry(20000,20000);
  //var oneTile = 'http://10.4.71.200/local/bhaskar/vs/tilecache.php?LAYERS=BANG_BUTTERFLY&FORMAT=image%2Fpng&SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&STYLES=&SRS=EPSG%3A4326&BBOX=77.695313004,13.007813004,77.783203692,13.095703692&WIDTH=256&HEIGHT=256';
  var oneTile = "images/nemo/checkerboard.jpg";
  var tx = THREE.ImageUtils.loadTexture(oneTile);
  console.log(tx);
  var m = new THREE.MeshBasicMaterial({
     map:tx
    // map:t
    ,transparent:true
    ,overdraw:true
  });
  m.map.needsUpdate = true;
  tx.needsUpdate = true;
  var b = new THREE.Mesh(g,m);
  var angle = 20;
  var dist = 30;
  var p = new THREE.Vector3(
    0
    //dist*Math.cos(angle*Math.PI/180)
    //30*Math.cos(angle*Math.PI/180)/original one
    //,-15
    ,1
    // ,30*Math.sin(angle*Math.PI/180): original one
    //,dist*Math.sin(angle*Math.PI/180)
    //z:30*(1/Math.sin(angle*Math.PI/180))
    //,-30
    ,0
  );
  //var r = {x:Math.PI/18,y:3*Math.PI/2};
  var r = {x:-Math.PI/2};
  //this.addButton('North',new THREE.Vector3(30,0,0),{y:3*Math.PI/2});
  //this.addButton('South',new THREE.Vector3(-30,0,0),{y:Math.PI/2});
  //this.addButton('East',new THREE.Vector3(0,0,30),{y:Math.PI});
  //this.addButton('West',new THREE.Vector3(0,0,-30),{});
    //var r = {x:Math.PI/3,y:(270-angle)*Math.PI/180};
    //var r = {z:Math.PI/3,y:(270-angle)*Math.PI/180};
    //var r = {x:Math.PI/2};
  b.position = p;
  this.scene.add(b);
  for (var i in r) {
    b.rotation[i] = r[i];
  }
  return; 

  var ddMap = new Array();
  var tileSize = 256;
  var actDiffx = this.coord[this.coord.length - 1][0] - this.coord[0][0];
  var actDiffz = this.coord[this.coord.length - 1][1] - this.coord[0][1];
  var zoomLevel = 12;
  for ( var i = 0; i < 10; i++) {
    ddMap[i] = 180 / (Math.pow(2, (i + 10)));
    if (((Math.abs(actDiffx) + (ddMap[i]*(this.worldSize/5))) < (ddMap[i] * this.worldSize))
            && ((Math.abs(actDiffz) + (ddMap[i]*(this.worldSize/5))) < (ddMap[i] * this.worldSize)))
      zoomLevel = i + 10;
  }
  delete ddMap;
  var meta = 2;
  var ddppx = 180 / (tileSize * Math.pow(2, zoomLevel));
  var bufferSpace = (ddppx*256*(this.worldSize/10));
  var minx = this.coord[0][0] - bufferSpace;//0.087;
  var minz = this.coord[0][1] - bufferSpace;//0.087;
  this.goodLeftX = (Math.floor((minx + 180) / (tileSize * ddppx * meta)))* ddppx * tileSize * meta - 180;
  this.goodLeftZ = (Math.floor((minz + 90) / (tileSize * ddppx * meta)))* ddppx * tileSize * meta - 90;
  this.maxx = this.goodLeftX + (ddppx * tileSize * worldSize);// dd per px * 256 px per image * 16 images in a row
  this.maxz = this.goodLeftZ + (ddppx * tileSize * worldSize);
  this.movMapLeftX = this.goodLeftX;
  this.movMapLeftZ = this.goodLeftZ;
}

*/
vidteq._venue360.prototype.addAModel = function() {
  var floorLength = 1000;
  var floorWidth = 1000;
  //var geometry = new THREE.PlaneGeometry( floorLength, floorWidth, 1, 1 );
  //geometry.applyMatrix(new THREE.Matrix4().makeRotationX( - Math.PI / 2 ) );
  // I think above geometry is never added
  //~ var material = new THREE.MeshPhongMaterial( { map: THREE.ImageUtils.loadTexture( mapDiffuse ), ambient: 0x999999, color: 0xffffff, specular: 0xffffff, shininess: 25, morphTargets: true } );
  var that = this;
  var light = new THREE.PointLight(0xffffff);
  light.position.set(-100,200,100);
  that.scene.add(light);
  
  //var dirLight = new THREE.DirectionalLight(0xffffff, 1);
  //dirLight.position.set(100, 100, 50);
  //that.scene.add(dirLight);

  var loader = new THREE.JSONLoader();
  var that = this;
  loader.load( 'js/test.json', function( geometry,materials ) {
    // material = new THREE.MeshPhongMaterial( { map: THREE.ImageUtils.loadTexture( materials.mapDiffuse ), ambient: 0x999999, color: 0xffffff, specular: 0xffffff, shininess: 25, morphTargets: true } );
    geometry.materials = materials;
    for (var i in materials) {
      materials[i].needsUpdate = true;
    }
    geometry.dynamic = true;
    var mesh = new THREE.Mesh( geometry, new THREE.MeshFaceMaterial(materials));
    //{
    //  //map:tx
    //  // map:t
    //  wireframe:true
    //}) );
    mesh.position.set(70,-26,70);
    mesh.scale.set( 0.1, 0.1, 0.1 );
    //mesh.position.x = 70;
    //mesh.position.y = -10;
    //mesh.position.z = 70;
    //mesh.scale.x = 0.1;
    //mesh.scale.y = 0.1;
    //mesh.scale.z = 0.1;
    mesh.rotation.y = 30*Math.PI/180;
    //texture.needsUpdate = true;
    //material.map.needsUpdate = true;
    for (var i in mesh.material.materials) {
      mesh.material.materials[i].needsUpdate = true;
      if (!mesh.material.materials[i].map) { continue; }
      mesh.material.materials[i].map.needsUpdate = true;
    }
    mesh.needsUpdate = true;
   // materials[0].morphTargets = true;
    that.scene.add( mesh );
    that.specialMesh = mesh;
  });
}

vidteq._venue360.prototype.addAModel = function() {
  //var floorLength = 1000;
  //var floorWidth = 1000;
  //var geometry = new THREE.PlaneGeometry( floorLength, floorWidth, 1, 1 );
  //geometry.applyMatrix(new THREE.Matrix4().makeRotationX( - Math.PI / 2 ) );
  //I think above geometry is never added
  // var material = new THREE.MeshPhongMaterial( { map: THREE.ImageUtils.loadTexture( mapDiffuse ), ambient: 0x999999, color: 0xffffff, specular: 0xffffff, shininess: 25, morphTargets: true } );
  var that = this;
  var hemiLight = new THREE.HemisphereLight( 0xffffff, 1.6 );
  //hemiLight.color.setHSL( 0.6, 0.75, 0.5 );
  //hemiLight.groundColor.setHSL( 0.095, 0.5, 0.5 );
  hemiLight.position.set( -100, 100, 100 );
  that.scene.add( hemiLight );
  
  var dirLight = new THREE.DirectionalLight( 0xffffff,3);
  dirLight.position.set( 100, -100, -100);
  dirLight.position.multiplyScalar( 100);
  dirLight.name = "dirlight";
  that.scene.add( dirLight );
  var texture1,texture2;
  //uniforms = 
  //  {
  //   texture1: { type: "t", value: 0, texture: THREE.ImageUtils.loadTexture( "js/t1.png" ) },
		//			texture2: { type: "t", value: 1, texture: THREE.ImageUtils.loadTexture( "js/t2.png" ) }
  //};
  //uniforms.texture1.texture.wrapS = uniforms.texture1.texture.wrapT = THREE.Repeat;
  //uniforms.texture2.texture.wrapS = uniforms.texture2.texture.wrapT = THREE.Repeat;
  var loader = new THREE.JSONLoader();
  //console.log('tex1',uniforms.texture1,'loader',loader);
  //loader.load( 'js/box.js', function ( geometry,materials ) {
   // console.log("venue360--box.js loaded:");console.log(arguments);

  //console.log("venue360--add a model is called");
  //var that = this;
  //loader.load( 'js/test.json', function( geometry,materials ) {
  //  console.log("venue360--loaded now ");
  //  console.log('geometry is',geometry);
  //  console.log('material is',materials);
  //  // material = new THREE.MeshPhongMaterial( { map: THREE.ImageUtils.loadTexture( materials.mapDiffuse ), ambient: 0x999999, color: 0xffffff, specular: 0xffffff, shininess: 25, morphTargets: true } );


  var loader = new THREE.JSONLoader();
  var that = this;
  //loader.load( 'js/test.json', function( geometry,materials ) {
  loader.load( 'js/box.js', function ( geometry,materials ) {
    // material = new THREE.MeshPhongMaterial( { map: THREE.ImageUtils.loadTexture( materials.mapDiffuse ), ambient: 0x999999, color: 0xffffff, specular: 0xffffff, shininess: 25, morphTargets: true } );

    geometry.materials = materials;
    //var texture = THREE.ImageUtils.loadTexture( "js/t1.png" ); texture.wrapS = THREE.RepeatWrapping; texture.wrapT = THREE.RepeatWrapping; texture.repeat.set( 4, 4 );
    for (var i in materials) {
      materials[i].needsUpdate = true;
    }
    
    geometry.dynamic = true;
    var mesh = new THREE.Mesh( geometry, new THREE.MeshFaceMaterial(materials));
    
    //{
    //  //map:tx
    //  // map:t
    //  wireframe:true
    //}) );
    mesh.position.set(50,-26,50);
    mesh.scale.set( 0.1, 0.1, 0.1 );
    //mesh.position.x = 70;
    //mesh.position.y = -10;
    //mesh.position.z = 70;
    //mesh.scale.x = 0.1;
    //mesh.scale.y = 0.1;
    //mesh.scale.z = 0.1;
    mesh.rotation.y = 30*Math.PI/180;
    //texture.needsUpdate = true;
    //material.map.needsUpdate = true;
    for (var i in mesh.material.materials) {
      mesh.material.materials[i].needsUpdate = true;
      if (!mesh.material.materials[i].map) { continue; }
      mesh.material.materials[i].map.needsUpdate = true;
    }
    mesh.needsUpdate = true;
    
   // materials[0].morphTargets = true;
    that.scene.add( mesh );
    that.specialMesh = mesh;
  });
   
}


//function testCamera() {
//  var camera, controls, scene, renderer,projector,container;
//  var clock = new THREE.Clock();
//  init();
//  animate();
//  function init() {
//    var windowidth = $('jsonData').width();
//    camera = new THREE.PerspectiveCamera( 30, window.innerWidth / window.innerHeight, 1, 5000 ); //earlier 40 in place of 30
//    camera.position.set( 1000, 1000, 2000 );
//    var target = new THREE.Vector3( 500, 0, 500 );
//    camera.lookAt(target);
//    scene = new THREE.Scene();
//    renderer = new THREE.WebGLRenderer( { antialias: true } );
//    renderer.setSize( window.innerWidth/3, window.innerHeight/3 );
//    renderer.sortObjects = false;
//    renderer.setClearColor( 0xB9D3EE);
//    container = document.getElementById( 'jsonData' );
//    container.appendChild( renderer.domElement );
//    window.addEventListener( 'resize', onWindowResize, false );
//    projector = new THREE.Projector();
//    var floorLength=1000;
//    var floorWidth=1000;
//    geometry = new THREE.PlaneGeometry( floorLength, floorWidth, 1, 1 );
//    geometry.applyMatrix( new THREE.Matrix4().makeRotationX( - Math.PI / 2 ) );
//    var loader = new THREE.JSONLoader();
//    loader.load( 'js/test.json', function( geometry ) {
//      var mesh = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial() );
//      mesh.position.x =500;
//      mesh.position.y =100;
//      mesh.position.z =500;
//      scene.add( mesh );
//    });
//  }
//  function onWindowResize() {
//    camera.aspect = window.innerWidth / window.innerHeight;
//    camera.updateProjectionMatrix();
//    renderer.setSize( window.innerWidth, window.innerHeight );
//  }
//  function animate() {
//    requestAnimationFrame( animate );
//    render();
//  }
//  function render() {
//    var delta = clock.getDelta();
//    THREE.AnimationHandler.update( delta);
//    //controls.update( delta )raa;
//    renderer.render( scene, camera );
//  }
//}

vidteq._venue360.prototype.getTile = function(t) {
  var that = this;
  if (this.renderMode == 'canvas') {
    var texture = THREE.ImageUtils.loadTexture(this.imgSeed+this.imgExt,new THREE.UVMapping(),function(){
      that.loadedAllTiles();
      //that.autoPan = true;
      //that.loaded = true;
      //$('#popupFS').show();
    });
  } else {
    var texture = THREE.ImageUtils.loadTexture(this.imgSeed+'_'+t.i+'_'+t.j+this.imgExt,new THREE.UVMapping(),function(){
      $("#iProgress").css({width:that.divInc+$("#iProgress").width()});
      if($("#iProgress").width() >= $("#oProgress").width()){
        that.loadedAllTiles();
        //that.autoPan = true;
        //that.loaded = true;
        //$("#iProgress").remove();
        //$("#oProgress").remove();
        //$('#popupFS').show();
      }
    });
  }
  texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearFilter;
  if (!this.sphere) { this.sphere = []; }
  if (!this.sphere[t.i]) { this.sphere[t.i] = []; }
  if(this.renderMode == 'webGl') {
    this.sphere[t.i][t.j] = new THREE.SphereGeometry(100,100,100,t.startPI,t.PIDiff,t.startTheta,t.thetaDiff);
  } else {
    this.sphere[t.i][t.j] = new THREE.SphereGeometry(10,30,25,0,2*Math.PI,Math.PI/4,(Math.PI/4) * 2);
  }
  this.mesh = new THREE.Mesh(
    this.sphere[t.i][t.j]
    ,new THREE.MeshBasicMaterial( { 
      map:texture
      //,wireframe:true
      ,overdraw:true 
  } ));
  this.mesh.scale.x = -1;
  this.scene.add(this.mesh);
  //$("#iProgress").css({width:this.divInc+$("#iProgress").width()});
  //if (t.last) {
  // console.log('inside gettile t.last');
  // this.autoPan = true;
  // this.loaded = true;
  // $("#iProgress").remove();
  // $("#oProgress").remove();
  //}
}

//vidteq._venue360.prototype.fillLoadSequence = function() {
//  var seq = [];
//  var startTheta = this.thetaDiff;
//  var runTime = 0;
//  for (var i=0; i<this.maxI; i++) {
//    var startPI = 0;
//    for (var j=0; j<this.maxJ; j++) {
//      var oneItem = {
//       i:i
//       ,j:j
//       ,startPI:startPI
//       ,PIDiff:this.PIDiff
//       ,startTheta:startTheta
//       ,thetaDiff:this.thetaDiff
//       ,runTime:runTime
//      };
//      seq.push(oneItem);
//      startPI += this.PIDiff;
//      runTime += 500;
//    }
//    startTheta += this.thetaDiff;
//  }
//  return seq;
//}

vidteq._venue360.prototype.createClock = function(what) {
  this.clock = new THREE.Clock(what);
  this.clock.frameNumber = 0;
  this.clock.getFrameNumber = function () { return this.frameNumber; };
}

vidteq._venue360.prototype.animate = function() {
  if (this.animFrame) { return; }
  if (!this.clock) { this.createClock(false); }
  this.clock.start();
  var that=this;
  var ct=0;
  var adhocRot=false;
   var tileRot=0;
  function animation(){
    that.clock.frameNumber++;
    that.frameNumber = that.clock.getFrameNumber();
    that.runTime = that.clock.getElapsedTime();
    that.animFrame = requestAnimationFrame(animation);
    if (that.autoPan) { 
      that.lon+=0.17; //0.25 earlier
      /*if(ct==0)
      {
      that.lat+=0.17; 
      if(that.lat>=30)ct=1;           
		  }
		  if(ct==1){
      that.lat-=0.17; 
      if(that.lat<0)ct=0;          
		  }*/
      if (that.fullVertical) {
        var w = 2*Math.PI/20000; // 20 sec for full cycle
        if (!that.autoPanRefTime) { 
          that.autoPanRefTime = parseInt((new Date()).getTime()); 
          if (that.lat>0) { that.lat = -10; }
          if (that.lat<-70) { that.lat = -70; }
          var wt1 = Math.asin((that.lat+40)/40);
          that.autoPanRefTime -= parseInt(wt1/w); 
        }
        that.lat = -(40 - 40 * Math.sin(w*parseInt((new Date()).getTime() - that.autoPanRefTime)));
        //that.lat -= that.lat * 0.001;
      }
      if (that.specialMesh) { that.specialMesh.rotation.y += 1*Math.PI/180; }
    }
   
    
    if (that.ui.adhocRotation && that.loaded) {
      var angle = 0.1*Math.PI/180;//alert(angle);
      for (var i in that.tiles) {
        that.tiles[i].rotation.y += angle;
        tileRot=that.tiles[i].rotation.y;
      }
      adhocRot=true;
    }else if(adhocRot==true){
		   adhocRot=false;
       var OT=that.ui.curTab;
       var OTh=that.ui.curThumb;
       var OI=OT.items[OTh.idx];
       OI.adhocAngle=OTh.pictureAngle+tileRot;       
    }
    that.render();
  }
  animation();  
}      
       
vidteq._venue360.prototype.updateCamera = function( delta ) {
	//console.log(this.camera);alert();
  var that=this;
  if( this.options.cameraConfig && this.options.cameraConfig.hasCameraControls && this.cameraControls && this.clock ) {
    this.cameraControls.update(delta);
  }
  
  if( this.options.has360Rotation ) {
		this.startTheta=this.startTheta || 0;
    var maxLat = 90 - this.startTheta * 180/ Math.PI - this.camera.fov/2;
    var minLat = - maxLat;
    if( this.fullVertical ) {
      maxLat = 90; minLat = -90;
    } 
    //console.log(this.camera);alert();
    this.lat = Math.max(minLat, Math.min(maxLat, this.lat ) );
    //this.lat = Math.max(-10, Math.min( 10, this.lat ) );
    var phi = THREE.Math.degToRad( 90-this.lat );
    //console.log(this.lat);
    //console.log(this.lon +"<>"+ this.lat);
    var theta = THREE.Math.degToRad(this.lon);
    //var theta = THREE.Math.degToRad(this.lon + this.lon2);
    //console.log("this.lon22",this.lon2);
    //console.log(this.camera);alert();
   this.ui.updateCompass( this.lon, this.lat );
    //this.ui.updateCompass( nlon, this.lat );
    //console.log(phi);alert();
    //console.log(theta);alert();
    //if(isNaN(phi)){phi=0;}
    this.camera.target.x = 500 * Math.sin(phi) * Math.cos(theta);
    this.camera.target.y = 500 * Math.cos(phi);
    this.camera.target.z = 500 * Math.sin(phi) * Math.sin(theta);
    this.camera.lookAt(this.camera.target);
		
    //console.log(this.camera);alert();
  }
  //console.log(this.camera);alert();
}

vidteq._venue360.prototype.updateEffects = function(delta) {
  var particle = this.options.particle;
  if( particle ) {
    if( particle.particleGroup  && particle.hasParticleGroup ) {
      this.options.updateParticleAttributes.call(this);
    }
    if( particle.engine && particle.engine.update ) {
      particle.engine.update( delta * 0.5 );
    }
  }
  var __onRender = this.options.onRender;
  if( __onRender && __onRender.length ) {
    for( var i=0, len=__onRender.length; i < len; i++ ) {
      (function( scope, i ) {
        if( __onRender[ i ] ) {
          if( typeof __onRender[ i ].onRender === 'function' ) {
            __onRender[ i ].onRender.call( __onRender[ i ]._call || scope, delta, scope.renderer, scope.scene );
          }
        }
      })( this, i )
    }
  }
  if( this.headlight ) {
    this.headlight.position.copy(this.camera.position);
  }
}

vidteq._venue360.prototype.render = function() {
  if( this.clock ) {
    var delta = this.clock.getDelta();
  }
  this.updateCamera( delta );
  this.updateEffects( delta );
  if (this.tiler) {
    this.tiler.render();
  }
  this.renderer.render(this.scene,this.camera);
  //error creating webGL context
}

vidteq._venue360.prototype.doRayProjection = function(e) {
	//console.log("drp");
  //if( !this.projector || !this.ray ) { return; }
  if( !this.projector ) { return; }
  var viewerId = this.viewerId;
  if( this.ui.fullView ) { viewerId = 'viewer1'; }
  var o = $('#'+viewerId).offset();
  var x = e.clientX-o.left;
  var y = e.clientY-o.top;  
  if( typeof this.ui.fullView !== "undefined" && this.ui.fullView ) {
    x = e.clientX;
    y = e.clientY;    
  }
  if( !this.mouseVector ) {// just to save memory
    this.mouseVector = new THREE.Vector3();
  }/*else {
    this.mouseVector.x = (x/$('#'+viewerId).width())*2 -1;
    this.mouseVector.y = -(y/$('#'+viewerId).height())*2 +1;
    this.mouseVector.z = 0.5;
  }*/
  
   this.mouseVector.x = (x/$('#'+viewerId).width())*2 - 1;
   this.mouseVector.y = -(y/$('#'+viewerId).height())*2 + 1;
   //this.mouseVector.z = 0.5;
  
  
  var ray = this.projector.pickingRay( this.mouseVector.clone(), this.camera );
  //console.log(ray);
  /*
  //1. Create a Ray with origin at the mouse position and direction into the scene (camera direction)
  this.projector.unprojectVector(this.mouseVector,this.camera);
  var n = this.mouseVector.sub(this.camera.position).normalize();
  this.ray.set( this.camera.position, n );
  */
  //TBD: Possible Bug to be tested
  //When 3D neighbourhood and venue360 is called this.options.onDoRayProjection is already set
  var onDoRayProjection = this.options.onDoRayProjection|| this.onDoRayProjection;
  onDoRayProjection.call( this, e, ray );

}

vidteq._venue360.prototype.onDoRayProjection = function( e, pickingRay) { 
	//console.log("odrp");
  //2. create an array containing all objects in the scene with which the ray intersects
  var sceneObjects = this.menuObjects;
  var intersects = pickingRay.intersectObjects( sceneObjects );
  var that =  this;
  
  if( intersects.length ) {
    if( e.type == 'mousemove' ) {
      if( intersects.length ) {
        intersects[0].object.scale.x = 1.4;
        intersects[0].object.scale.y = 1.4;
        intersects[0].object.myScaled = true;
      }
      if( intersects[0].object.toolTip ) {
        e.preventDefault();
        $('.tinytooltip').find(".message").html(intersects[0].object.toolTip);
        if( !$('.tinytooltip').length ) {
          $('#'+that.ui.ids.dummyToolTip).tinytooltip({message:intersects[0].object.toolTip,hover:false,delay:10});
        }
     
        $('#'+that.ui.ids.dummyToolTip).trigger('showtooltip');
       
      } 
 
    } else if( e.type == 'mousedown' ) {
      this.isUserInteracting = false;
      if( intersects[0].object.myClickFunc ) {
        intersects[0].object.myClickFunc();
      }
    } else if(e.type == 'mouseup') {
      e.preventDefault();
      //intersects[0].object.oneMarker.position.copy( intersects[0].object.oneMarker.position );
    }
  } else {
    $('#'+that.ui.ids.dummyToolTip).trigger('hidetooltip');
    for( var i in this.menuObjects ) {
      if (this.menuObjects[i].myScaled) {
        this.menuObjects[i].scale.x = 1;
        this.menuObjects[i].scale.y = 1;
        delete this.menuObjects[i].myScaled;
      }
    }
  } 
  if (this.ui.editor) {
    this.ui.editor.onDoRayProjectionCallback(e,intersects,this.menuObjects,pickingRay);
  }
}

vidteq._venue360.prototype.cleanUpTheScene = function() {
  if( !this.scene ) { return; }
  this.menuObjects = [];
  this.cleanUpSceneChildren();
  if (this.animFrame) { cancelAnimationFrame(this.animFrame); }
  delete this.animFrame;
}

//vidteq._venue360.prototype.renderFullImage= function(path) {
//  if (this.prevLoaded == path && this.deallocated == false) return;
//  this.cleanUpTheScene();
//  this.prevLoaded = path;
//  this.ui.addProgressbar();
//  this.init3jsVars(path);
//  this.initScene();
//  this.animate();
//}

//vidteq._venue360.prototype.installIEFix = function() {
//  //following code is used for preparing binary data in ie9
//  //http://stackoverflow.com/questions/1095102/how-do-i-load-binary-image-data-using-javascript-and-xmlhttprequest
//  //
//  var IEBinaryToArray_ByteStr_Script = 
//  //  "<!-- IEBinaryToArray_ByteStr -->\r\n"+
//    "<script type='text/vbscript'>\r\n"+
//    "Function IEBinaryToArray_ByteStr(Binary)\r\n"+
//    "   IEBinaryToArray_ByteStr = CStr(Binary)\r\n"+
//    "End Function\r\n"+
//    "Function IEBinaryToArray_ByteStr_Last(Binary)\r\n"+
//    "   Dim lastIndex\r\n"+
//    "   lastIndex = LenB(Binary)\r\n"+
//    "   if lastIndex mod 2 Then\r\n"+
//    "       IEBinaryToArray_ByteStr_Last = Chr( AscB( MidB( Binary, lastIndex, 1 ) ) )\r\n"+
//    "   Else\r\n"+
//    "       IEBinaryToArray_ByteStr_Last = "+'""'+"\r\n"+
//    "   End If\r\n"+
//    "End Function\r\n"+
//    "</script>\r\n";
//
//  // inject VBScript
//  //document.write(IEBinaryToArray_ByteStr_Script);
//  $(IEBinaryToArray_ByteStr_Script).appendTo('body');
//  // TBD not working currently 
//  // IE-specific logic here
//  // helper to convert from responseBody to a "responseText" like thing
//  this.convertResponseBodyToText = function(binary) {
//    var byteMapping = {};
//    for ( var i = 0; i < 256; i++ ) {
//        for ( var j = 0; j < 256; j++ ) {
//            byteMapping[ String.fromCharCode( i + j * 256 ) ] =
//                String.fromCharCode(i) + String.fromCharCode(j);
//        }
//    }
//    var rawBytes = IEBinaryToArray_ByteStr(binary);
//    var lastChr = IEBinaryToArray_ByteStr_Last(binary);
//    return rawBytes.replace(/[\s\S]/g,function( match ) { return byteMapping[match]; }) + lastChr;
//  };
//  (function() {
//    function CustomEvent(event,params) {
//      params = params || { bubbles: false,cancelable:false,detail:undefined};
//      var evt = document.createEvent('CustomEvent');
//      evt.initCustomEvent(event,params.bubbles,params.cancelable,params.detail );
//      return evt;
//    };
//    CustomEvent.prototype = window.Event.prototype;
//    window.CustomEvent = CustomEvent;
//  })();
//  //~ //____________________________________
// //~ function registerEvent( dummyToolTip, CustomEvent, fnHandler ) 
////~ {
//   //~ var oTarget = document.getElementById( 'dummyToolTip' );
//   //~ if ( oTarget != null ) 
//   //~ {
//      //~ if ( oTarget.addEventListener ) {   
//         //~ oTarget.addEventListener( CustomEvent, CustomEvent, false );
//      //~ } else {
//        //~ var sOnEvent = "on" + CustomEvent; 
//        //~ if ( oTarget.attachEvent ) 
//        //~ {
//           //~ oTarget.attachEvent( sOnEvent, fnHandler );
//        //~ }
//      //~ }
//   //~ }
////~ } 
//}

vidteq._venue360.prototype.doMyExperiments = function () {
  console.log("comeing to do experime");
  $('#intro').hide();

  this.camera = new THREE.PerspectiveCamera(45,$("#viewer").width() / $("#viewer").height(), 1, 1000 );
  this.camera.target = new THREE.Vector3( 0, 0, 0 );
  this.camera.position.z = 2.0;
  this.scene = new THREE.Scene();
  this.sceneCreated = true;

  this.scene.add(new THREE.AmbientLight(0x333333));

  var light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(5,3,5);
  this.scene.add(light);

  var lineGeom = new THREE.Geometry();
  lineGeom.vertices = [
    new THREE.Vector3(-20,-20,-20)
    ,new THREE.Vector3(-40,-20,-20)
    ,new THREE.Vector3(-40,-40,-20)
    ,new THREE.Vector3(-20,-20,-20)
  ];
  lineGeom.colors = [
    new THREE.Color(0xff0000)
    ,new THREE.Color(0x00ff00)
    ,new THREE.Color(0x0000ff)
    ,new THREE.Color(0xff0000)
  ];
  var lineMat = new THREE.LineBasicMaterial( {
    color: 0xffff00
    ,wireframe:true
    ,vertexColors:true
    ,linewidth:10
  });
  var line = new THREE.Line(lineGeom,lineMat,THREE.LineStrip);
  this.scene.add(line);

  var globe = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 32, 32),
    new THREE.MeshPhongMaterial({
      map: THREE.ImageUtils.loadTexture('images/vPop/2_no_clouds_4k.jpg'),
      bumpMap: THREE.ImageUtils.loadTexture('images/vPop/elev_bump_4k.jpg'),
      bumpScale:   0.005,
      specularMap: THREE.ImageUtils.loadTexture('images/vPop/water_4k.png'),
      specular: new THREE.Color('grey')   })
  );
  this.scene.add(globe);

  var clouds = new THREE.Mesh(
    new THREE.SphereGeometry(0.503, 32, 32),
    new THREE.MeshPhongMaterial({
      map: THREE.ImageUtils.loadTexture('images/vPop/fair_clouds_4k.png'),
      transparent: true
    })
  );
  this.scene.add(clouds);
  
  var stars = new THREE.Mesh(
    new THREE.SphereGeometry(90, 64, 64), 
    new THREE.MeshBasicMaterial({
      map: THREE.ImageUtils.loadTexture('images/vPop/galaxy_starfield.png'), 
      side: THREE.BackSide
    })
  );
  this.scene.add(stars);

  var that = this;
  vidteq.vidteq.loadScript({
    checkObj:'THREE.TrackballControls'
    ,url:"js/TrackballControls.js"
  },function () {
    controls = new THREE.TrackballControls(that.camera);
    controls.noPan = true;
    controls.noRotate = true;
    controls.staticMoving = true;
  });

  function render() {
    if (controls) { controls.update(); }
    //console.log("rendering ...");
    //console.log("camera pos");console.log(that.camera.position);
    //console.log("globe pos");console.log(globe.position);
    var dx = globe.position.x - that.camera.position.x;
    var dy = globe.position.y - that.camera.position.y;
    var dz = globe.position.z - that.camera.position.z;
    var dist = Math.sqrt(dx*dx+dy*dy+dz*dz);
    //console.log("dist");console.log(dist);
    var str = 
      that.camera.position.x+' '+
      that.camera.position.y+' '+
      that.camera.position.z+' '+
      globe.position.x+' '+
      globe.position.y+' '+
      globe.position.z+' '+dist;
    $('#message').text(str);
    globe.rotation.y += 0.0005;
    clouds.rotation.y += 0.0005;
    requestAnimationFrame(render);
    that.renderer.render(that.scene, that.camera);
  }

  render();

}


vidteq._venue360.prototype.installIEFix = function () {
  //following code is used for preparing binary data in ie9
  //http://stackoverflow.com/questions/1095102/how-do-i-load-binary-image-data-using-javascript-and-xmlhttprequest
  //
  if (/msie/i.test(navigator.userAgent) && !/opera/i.test(navigator.userAgent)) {
    var IEBinaryToArray_ByteStr_Script =
    "<!-- IEBinaryToArray_ByteStr -->\r\n"+
    "<script type='text/vbscript'>\r\n"+
    "Function IEBinaryToArray_ByteStr(Binary)\r\n"+
    "   IEBinaryToArray_ByteStr = CStr(Binary)\r\n"+
    "End Function\r\n"+
    "Function IEBinaryToArray_ByteStr_Last(Binary)\r\n"+
    "   Dim lastIndex\r\n"+
    "   lastIndex = LenB(Binary)\r\n"+
    "   if lastIndex mod 2 Then\r\n"+
    "       IEBinaryToArray_ByteStr_Last = Chr( AscB( MidB( Binary, lastIndex, 1 ) ) )\r\n"+
    "   Else\r\n"+
    "       IEBinaryToArray_ByteStr_Last = "+'""'+"\r\n"+
    "   End If\r\n"+
    "End Function\r\n"+
    "</script>\r\n";

    // inject VBScript
    document.write(IEBinaryToArray_ByteStr_Script);
  }
  if(/msie/i.test(navigator.userAgent) && !/opera/i.test(navigator.userAgent)) {
      // IE-specific logic here
      // helper to convert from responseBody to a "responseText" like thing
      this.convertResponseBodyToText = function (binary) {
          var byteMapping = {};
          for ( var i = 0; i < 256; i++ ) {
              for ( var j = 0; j < 256; j++ ) {
                  byteMapping[ String.fromCharCode( i + j * 256 ) ] =
                      String.fromCharCode(i) + String.fromCharCode(j);
              }
          }
          var rawBytes = IEBinaryToArray_ByteStr(binary);
          var lastChr = IEBinaryToArray_ByteStr_Last(binary);
          return rawBytes.replace(/[\s\S]/g,function( match ) { return byteMapping[match]; }) + lastChr;
      };
  }
}

//
//// each time you make a request for a binary resource:
//var req = (function() {
//    if (window.XMLHttpRequest) {
//        return new window.XMLHttpRequest();
//    }
//    else {
//        try {
//            return new ActiveXObject("MSXML2.XMLHTTP");
//        }
//        catch(ex) {
//            return null;
//        }
//    }
//})();
//
//var fileContents = "";
//var filesize = -1;
//var readByteAt = function(i){
//    return fileContents.charCodeAt(i) & 0xff;
//};
//
//req.open("GET", url, true);
//
//if(/msie/i.test(navigator.userAgent) && !/opera/i.test(navigator.userAgent)) {
//    // IE-specific logic here
//    // helper to convert from responseBody to a "responseText" like thing
//    var convertResponseBodyToText = function (binary) {
//        var byteMapping = {};
//        for ( var i = 0; i < 256; i++ ) {
//            for ( var j = 0; j < 256; j++ ) {
//                byteMapping[ String.fromCharCode( i + j * 256 ) ] =
//                    String.fromCharCode(i) + String.fromCharCode(j);
//            }
//        }
//        var rawBytes = IEBinaryToArray_ByteStr(binary);
//        var lastChr = IEBinaryToArray_ByteStr_Last(binary);
//        return rawBytes.replace(/[\s\S]/g,
//                                function( match ) { return byteMapping[match]; }) + lastChr;
//    };
//
//    req.setRequestHeader("Accept-Charset", "x-user-defined");
//    req.onreadystatechange = function(event){
//        if (req.readyState == 4) {
//            if (req.status == 200) {
//                fileContents = convertResponseBodyToText(req.responseBody);
//                fileSize = fileContents.length-1;
//                // invoke a callback here, if you like...
//            }
//            else{
//                alert("download failed, status " + req.status);
//            }
//        }
//    };
//    req.send();
//
//} else {
//    // ff/Gecko/Webkit specific stuff here
//    req.onreadystatechange = function(aEvt) {
//        if (req.readyState == 4) { // completed
//            if(req.status == 200){ // status == OK
//                fileContents = binStream.req.responseText;
//                filesize = fileContents.length;
//                // invoke a callback here, if you like...
//            }
//            else {
//                alert("download failed, status " + req.status);
//            }
//        }
//    };
//    // coerce response type
//    req.overrideMimeType('text/plain; charset=x-user-defined');
//    req.send(null);
//}
//Mouse Events
vidteq._venue360.prototype.onDocumentMouseDown = function(e) {

  e.preventDefault();
  this.isUserInteracting = true;
  this.autoPan = false;
  this.autoPanRefTime = null;
  this.onPointerDownPointerX = e.clientX;
  this.onPointerDownPointerY = e.clientY;
  this.onPointerDownLon = this.lon;
  this.onPointerDownLat = this.lat;
  
  var _cb360 = this.callbackVenue360;
  if( _cb360.on && typeof _cb360.on.documentMouseDown === 'function' ) {
    _cb360.on.documentMouseDown(e);
  }
  //~ $('')
  //~ http://www.caregiving.com/wp-content/uploads/2013/01/arrow-right.jpg
      //~ var imageArrow= $('<img id="image" src="http://images.pictureshunt.com/pics/m/mouse-8557.JPG"/>');
      //~ $('"+imageArrow+"').css({left:e.ClinetX, top:e.ClientY});
  this.doRayProjection(e);
}

vidteq._venue360.prototype.onDocumentMouseMove = function(e) {
  this.mouseX = e.clientX; 
  this.mouseY = e.clientY; 
  this.doRayProjection(e);
  if( !this.isUserInteracting ) { return; }
  if( this.autoPan ) { 
   e.preventDefault();
   this.autoPan = false; //NTBC
   this.autoPanRefTime = null;
  }
  this.lon = ( this.onPointerDownPointerX - e.clientX ) * 0.1 + this.onPointerDownLon;
  this.lat = ( e.clientY-this.onPointerDownPointerY ) * 0.1 + this.onPointerDownLat;
  //if(this.lat || this.lon)
  //  { console.log('inside lat and lon condition');
  //    var that = this;
  //    that.enableMarker = false;
  //}
}

vidteq._venue360.prototype.onDocumentMouseUp = function(e) {
  this.isUserInteracting = false;
  this.doRayProjection(e);
  if (this.ui.editor) {
    this.ui.editor.onDocumentMouseUpCallback(e);
  }
}

vidteq._venue360.prototype.onDocumentMouseWheel = function(e) {
  var evt = window.event || e;
  var delta = evt.detail? evt.detail*(-120) : evt.wheelDelta;
  if (delta%120 == 0) {
    if(delta>0){if(this.fov>this.minFov){this.fov-=10;}}
    else if(delta<0){if(this.fov<this.maxFov){this.fov+=10;}}
  }
  this.rerender();
  //this.camera.fov = this.fov -= evt.wheelDeltaY * 0.05;
  //this.camera.updateProjectionMatrix();
}

vidteq._venue360.prototype.onDocumentMouseDbc = function(e) {
	if(this.fov>this.minFov){this.fov-=10;}
  else if(this.fov<this.maxFov){this.fov+=10;}
	  this.rerender();
}
//KeyBoard Events
vidteq._venue360.prototype.onKeyDown = function(e) {
  this.currentlyPressedKeys[e.keyCode] = true;
  this.handleKeys();
  	
  
}

vidteq._venue360.prototype.onKeyUp = function(e) {
  this.currentlyPressedKeys[e.keyCode] = false;
  this.handleKeys();
}

vidteq._venue360.prototype.handleKeys = function() {
  var renderNeeded = false;
  if (this.currentlyPressedKeys[32]) {
    this.autoPan=true; 
    renderNeeded = true;
  }  
  if (this.currentlyPressedKeys[34]) {
    // Page Down
    if(this.fov<this.maxFov){
      this.fov+=10;
      renderNeeded = true;
    }
  } 
  if (this.currentlyPressedKeys[33]) {
    // Page Up
    if(this.fov>this.minFov){
      this.fov-=10;
      renderNeeded = true;
    }
  }
  if (this.currentlyPressedKeys[37] || this.currentlyPressedKeys[65]) {
     // Left cursor key or A
    this.autoPan = false;
    this.autoPanRefTime = null;
    this.lon-=0.5; 
    renderNeeded = true;
  } 
  if (this.currentlyPressedKeys[39] || this.currentlyPressedKeys[68]) {
    // Right cursor key or D
    this.autoPan = false;
    this.autoPanRefTime = null;
    this.lon+=0.5;  
    renderNeeded = true;
  }
  if (this.currentlyPressedKeys[38] || this.currentlyPressedKeys[87]) {
    // Up cursor key or W
    this.autoPan = false;
    this.autoPanRefTime = null;
    this.lat+=0.5;
    renderNeeded = true;
  }  
  if (this.currentlyPressedKeys[40] || this.currentlyPressedKeys[83]) {
    // Down cursor key
    this.autoPan = false;
    this.autoPanRefTime = null;
    this.lat-=0.5;
    renderNeeded = true;
  }
  // not sure it is needed or not
  if (renderNeeded && this.sceneCreated) {
    this.rerender();
  }
}

vidteq._venue360.prototype.debugaxis = function(axisLength) {
 var scene = this.scene;
  //Shorten the vertex function
  function v(x,y,z){
    return new THREE.Vector3(x,y,z)
  }
  //Create axis (point1, point2, colour)
  function createAxis(p1, p2, color){
    var line, lineGeometry = new THREE.Geometry(),
    lineMat = new THREE.LineBasicMaterial({color: color, lineWidth: 1});
    lineGeometry.vertices.push(p1, p2);
    line = new THREE.Line(lineGeometry, lineMat);
    scene.add(line);
  }
  createAxis(v(-axisLength, 0, 0), v(axisLength, 0, 0), 0xFF0000);
  createAxis(v(0, -axisLength, 0), v(0, axisLength, 0), 0x00FF00);
  createAxis(v(0, 0, -axisLength), v(0, 0, axisLength), 0x0000FF);
};

vidteq._venue360._tiler = function (venue360) {
  this.venue360 = venue360;
  this.tiles = [];
  this.tH = {};
  this.tI = {}; // Tile info
  this.stopRender = true;
  this.cVOrder = {ll:2,ul:0,lr:3,ur:1}; // Corner Vertex order TBD
  this.co=0;
}

vidteq._venue360._tiler.prototype.init = function(bbox) {
	console.log("tiler init");
	console.log(bbox);
  var id = this.venue360.viewerId
  ,container = this.venue360.container
  ,width = $("#"+id).width()//container.width
  ,height = $("#"+id).height()//container.height
  ,viewPortWidthPx = width//1260
  ,inRes = (bbox.ur.lon - bbox.ll.lon)/viewPortWidthPx  //how this is done?  (target img width/actual img width)?
  //,res = vidteq.cfg.resolutions.split(',')//[]
  ,goodRes = null
  ,tileSizePx = 256
  ,tu = 256//tile unit - world coordinate of one tile
  //,urlSeed = 'http://10.4.71.200/local/bhaskar/vs/tilecache.php?LAYERS=CHEN_BUTTERFLY&FORMAT=image%2Fpng&SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&STYLES=&SRS=EPSG%3A4326&WIDTH=256&HEIGHT=256&BBOX='
  ,urlSeed = this.getMapTilesUrl()
  ;
  // now get good Resolution (allowed resolution)
  console.log("id=",id);console.log("container=",container);console.log("width=",width);
  console.log("height=",height);  console.log("viewPortWidthPx=",viewPortWidthPx);
  console.log("inRes=",inRes);
  console.log("urlSeed=",urlSeed);
  var res = [];
  for ( var i = 0; i < 20; i++) {
    res.push(180/(tileSizePx*Math.pow(2,i)));
  }
  var z = 0;
  for ( z = 0; z < 20; z++) {
    goodRes = res[z];
    if (inRes > res[z]) { 
      break;             // why res is taken 20 times and check this cond.
    }
  }
  if (!goodRes) { return; }
  var tiler = this.tI;
  tiler.z = z;
  tiler.resA = res;
  tiler.res = goodRes;
  tiler.tu = tu;
  tiler.tileSizePx = tileSizePx;
  tiler.urlSeed = urlSeed;
  tiler.gY = -25;
  console.log("tiler--",tiler);
  var goodBbox = this.getGb(bbox,goodRes,tileSizePx);
  var goodResTile = goodRes * tileSizePx;
  tiler.resTile = goodResTile;
  tiler.tileSizePx = tileSizePx;
  var w = Math.floor((goodBbox.ur.lon - goodBbox.ll.lon)/goodResTile + 0.5);
  var h = Math.floor((goodBbox.ur.lat - goodBbox.ll.lat)/goodResTile + 0.5);
  console.log("w=",w);
  console.log("h=",h);
  if (!bbox.c) {
    bbox.c = {
      lon:bbox.ll.lon + (bbox.ur.lon-bbox.ll.lon)/2
      ,lat:bbox.ll.lat + (bbox.ur.lat-bbox.ll.lat)/2
    };
  }
  
  var x0 = -parseInt(tu*w/2); 
  var z0 = parseInt(tu*h/2);
  for ( var i = 0; i < w; i++) {
    for ( var j = 0; j < h; j++) {
      var lon = goodBbox.ll.lon + i*goodResTile;
      var lat = goodBbox.ll.lat + j*goodResTile;
      var tileUrl = urlSeed + lon+','+lat+','+(lon+goodResTile)+','+(lat+goodResTile);
      console.log("tileUrl",tileUrl);;
      var x = x0+i*tu;
      var z = z0-j*tu;
      //if (i!=parseInt(w/2)&&i!=parseInt(w/2)-1) { continue; }
      //if (i!=parseInt(w/2)-1) { continue; }
      //if (i!=4&&i!=5) { continue; }
      //if (i!=4) { continue; }
      //if (j!=parseInt(h/2)) { continue; }
      //if (j!=parseInt(h/2)-1) { continue; }
      //if (j!=4&&j!=5) { continue; }
      //if (j!=4) { continue; }
      //var p = new THREE.Vector3(x,-25,z);
      var p = new THREE.Vector3(x,tiler.gY,z);
      //var r = {x:-Math.PI/2};
      var r = {x:-90*Math.PI/180};//;
      var b = this.addOneTileFloor(tu,p,r,tileUrl);  //http://10.4.71.200/local/rsharma/js/extiles.html
      var myWindow = window.open("", "myWindow", "width=700, height=500");
      myWindow.document.write(i+":"+j+"=<img src="+b.children[0].material.map.sourceFile+">");
      //console.log("b=",b);
      //console.log("p==",b.children[0].material.map.sourceFile);
      b.i = i;
      b.j = j;
      var oneTile = {
        i:i
        ,j:j
        ,p:p
        ,ll:{
          lon:lon
          ,lat:lat
        }
        ,c:{
          lon:lon+goodResTile/2
          ,lat:lat+goodResTile/2
        }
        ,tileUrl:tileUrl
        ,z:tiler.z
        ,res:tiler.res
        ,resTile:tiler.resTile
        ,tu:tu
        ,mesh:b
      };
      console.log("venue360-- now "+i+" "+j);console.log(oneTile);
      $.extend(oneTile,this.getTileIdx(oneTile));
      //this.addTileToCache(oneTile);
      this.tiles.push(oneTile);
    }
		
  }
  console.log("this.tile",this.tiles);
  for(var q=0;q<w*h;q++){
		//console.log(q+"==>");
		//if(this.tiles[q].mesh==undefined){continue;}
		//console.log(this.tiles[q].mesh.children[0].material.map.sourceFile);	
		//console.log(this.tiles[q].mesh.position);	
		//var myWindow = window.open("", "myWindow", "width=200, height=100");
    //myWindow.document.write(q+"=<img src="+this.tiles[q].mesh.children[0].material.map.sourceFile+">");		
	}
  //console.log(this);
  //console.log(tiler);
  return;

  var ddMap = [];
  var actDiffx = this.coord[this.coord.length - 1][0] - this.coord[0][0];
  var actDiffz = this.coord[this.coord.length - 1][1] - this.coord[0][1];
  var zoomLevel = 12;
  for ( var i = 0; i < 10; i++) {
    ddMap[i] = 180 / (Math.pow(2, (i + 10)));
    if (((Math.abs(actDiffx) + (ddMap[i]*(this.worldSize/5))) < (ddMap[i] * this.worldSize))
            && ((Math.abs(actDiffz) + (ddMap[i]*(this.worldSize/5))) < (ddMap[i] * this.worldSize)))
      zoomLevel = i + 10;
  }
  delete ddMap;
  var meta = 2;
  var ddppx = 180 / (tileSize * Math.pow(2, zoomLevel));
  var bufferSpace = (ddppx*256*(this.worldSize/10));
  var minx = this.coord[0][0] - bufferSpace;//0.087;
  var minz = this.coord[0][1] - bufferSpace;//0.087;
  this.goodLeftX = (Math.floor((minx + 180) / (tileSize * ddppx * meta)))* ddppx * tileSize * meta - 180;
  this.goodLeftZ = (Math.floor((minz + 90) / (tileSize * ddppx * meta)))* ddppx * tileSize * meta - 90;
  this.maxx = this.goodLeftX + (ddppx * tileSize * worldSize);// dd per px * 256 px per image * 16 images in a row
  this.maxz = this.goodLeftZ + (ddppx * tileSize * worldSize);
  this.movMapLeftX = this.goodLeftX;
  this.movMapLeftZ = this.goodLeftZ;
}

vidteq._venue360._tiler.prototype.getGbLon = function(lon,goodRes,tileSizePx) {
	console.log("tiler getGbLon");
  var goodLon = (Math.floor((lon-(-180))/(tileSizePx*goodRes)))*goodRes*tileSizePx-180;
  return goodLon;
}
vidteq._venue360._tiler.prototype.getGbLat = function(lat,goodRes,tileSizePx) {
	console.log("tiler getGbLat");
  var goodLat=(Math.floor((90+lat)/(goodRes*tileSizePx)))*goodRes*tileSizePx-90;
  return goodLat; 
}

vidteq._venue360._tiler.prototype.getGb = function(bbox,goodRes,tileSizePx) {
	console.log("tiler getGb");
  var outBbox = {ll:{},ur:{}};
  outBbox.ll.lon = this.getGbLon(bbox.ll.lon,goodRes,tileSizePx);
  outBbox.ll.lat = this.getGbLat(bbox.ll.lat,goodRes,tileSizePx);
  outBbox.ur.lon = this.getGbLon(bbox.ur.lon,goodRes,tileSizePx)+goodRes*tileSizePx;
  outBbox.ur.lat = this.getGbLat(bbox.ur.lat,goodRes,tileSizePx)+goodRes*tileSizePx;
  return outBbox;
}

vidteq._venue360._tiler.prototype.printTileInfo = function() {
	console.log("tiler printTileInfo");
  return;
  for (var i in this.meshes) {
    var b = this.meshes[i];
    var id = this.venue360.viewerId;
    var width = $("#"+id).width();
    var height = $("#"+id).height();
    var widthHalf = width / 2, heightHalf = height / 2;

    var vector = new THREE.Vector3();
    var vector1 = new THREE.Vector3();
    var projector = new THREE.Projector();
    //console.log(b);
    //var vertices = b.geometry.vertices;
    var vertices = b.geometry ? 
      b.geometry.vertices :
      b.children && b.children.length ? 
        b.children[0].geometry.vertices : null;

    projector.projectVector( vector.setFromMatrixPosition( b.matrixWorld ), this.venue360.camera );
    //this.projector.projectVector( v, this.camera );
    //this.projector.projectVector( b.position, this.camera );
    vector.x = ( vector.x * widthHalf ) + widthHalf;
    vector.y = - ( vector.y * heightHalf ) + heightHalf;
    var par = {
      x:parseInt(vector.x)
      ,y:parseInt(vector.y)
      ,i:b.i
      ,j:b.j
      ,visible:b.visible
    };
    for (var i in vertices) {
      var v = vertices[i];
      vector.copy(v);
      //this.projector.projectVector( vector.setFromMatrixPosition( b.matrixWorld ), this.camera );
      //projector.projectVector( b.matrixWorld.multiplyVector3(vector), this.venue360.camera );
      projector.projectVector( vector.applyProjection(b.matrixWorld), this.venue360.camera );
      //this.projector.projectVector( b.position, this.camera );
      vector.x = ( vector.x * widthHalf ) + widthHalf;
      vector.y = - ( vector.y * heightHalf ) + heightHalf;
      var par = {
        x:parseInt(vector.x)
        ,y:parseInt(vector.y)
        ,i:b.i
        ,j:b.j
        ,visible:b.visible
      };
    }
  }
}
  //var bbox , bbox.ll and bbox.ur  interms of dd
  // tile size each is 256 px
  // how do you decide 1px means what dd?
  // called dd/px or px/dd - how do you decide it?
  // using wgs standards  - 
  // let us say we want to render the bbox in 1000px
  // 

vidteq._venue360._tiler.prototype.getMapTilesUrl = function( options ) {
	console.log("tiler getMapTilesUrl");
	console.log(options);
  options = options || {};
  var tilecacheBaseUrl = vidteq.cfg.tilecacheBaseUrl.replace(/210/g,'200')
  ,tilecacheBaseLayer = encodeURIComponent(vidteq.cfg.tilecacheBaseLayer)
  ,format = encodeURIComponent('image/png')
  ,service = 'WMS'
  ,version = '1.1.1'
  ,request = 'GetMap'
  ,styles = ''
  ,srs = encodeURIComponent('EPSG:4326')
  ,width = 256
  ,height = 256
  ,url = tilecacheBaseUrl+'LAYERS='+tilecacheBaseLayer+'&FORMAT='+format+'&SERVICE='+service+'&VERSION='+version+'&REQUEST='+request+'&STYLES='+styles+'&SRS='+srs+'&WIDTH='+width+'&HEIGHT='+height+'&BBOX='
  ;
  console.log(url);
  return url;
}

vidteq._venue360._tiler.prototype.getTileIdx = function (tile) {
	console.log("tiler getTileIdx");
  var tileX = Math.floor((tile.ll.lon+180+tile.resTile/2)/tile.resTile);
  var tileY = Math.floor((tile.ll.lat+90+tile.resTile/2)/tile.resTile);
  return {lonIdx:tileX,latIdx:tileY}; 
}

vidteq._venue360._tiler.prototype.getAdjTile = function (tile) {
  
}

vidteq._venue360._tiler.prototype.addOneTileFloor = function (tu,p,r,imgUrl,callback,callbackError) {
	console.log("tiler addOneTileFloor");
	console.log(tu);
	console.log(p);
	console.log(r);
	console.log(imgUrl);
	console.log(callback);
	console.log(callbackError);
  var g = new THREE.PlaneGeometry(tu,tu);
  var tx = THREE.ImageUtils.loadTexture(imgUrl,undefined,callback,callbackError);
  var m = new THREE.MeshBasicMaterial({
     map:tx
     //,wireframe:true
    // map:t
    //,transparent:true
    //,overdraw:true
  });
  console.log(g);
  m.map.needsUpdate = true;
  tx.needsUpdate = true;
  //var b = new THREE.Mesh(g,m);
  var b = THREE.SceneUtils.createMultiMaterialObject(g,[
    m
    ,new THREE.MeshBasicMaterial({wireframeLinewidth:3,color:0x222222,wireframe:true})
  ]);
  var angle = 20;
  var dist = 30;
  //var p = new THREE.Vector3(
  //  0
  //  //dist*Math.cos(angle*Math.PI/180)
  //  //30*Math.cos(angle*Math.PI/180)/original one
  //  ,-15
  //  // ,30*Math.sin(angle*Math.PI/180): original one
  //  //,dist*Math.sin(angle*Math.PI/180)
  //  //z:30*(1/Math.sin(angle*Math.PI/180))
  //  //,-30
  //  ,0
  //);
  //var r = {x:Math.PI/18,y:3*Math.PI/2};
  //var r = {x:-Math.PI/2};
  //this.addButton('North',new THREE.Vector3(30,0,0),{y:3*Math.PI/2});
  //this.addButton('South',new THREE.Vector3(-30,0,0),{y:Math.PI/2});
  //this.addButton('East',new THREE.Vector3(0,0,30),{y:Math.PI});
  //this.addButton('West',new THREE.Vector3(0,0,-30),{});
    //var r = {x:Math.PI/3,y:(270-angle)*Math.PI/180};
    //var r = {z:Math.PI/3,y:(270-angle)*Math.PI/180};
    //var r = {x:Math.PI/2};
    if(this.co==1){
			//var p = new THREE.Vector3(128,-25,0);
  b.position = p;
		}this.co++;
		b.position = p;
  console.log(b);
  b.receiveShadow = true;
  this.venue360.scene.add(b);
  
  for (var i in r) {
    b.rotation[i] = r[i];
  }
  if (!('meshes' in this)) { this.meshes = []; }
  this.meshes.push(b);
  this.render();
  return b; 
}

//TBD: change to onRender and push to array
vidteq._venue360._tiler.prototype.render = function () {
	//console.log("tiler render");
  if (this.stopRender) { return; }
  if (!('firstTimePrint' in this)) { 
    this.firstTimePrint = false;
    this.firstTimePrintCount = 0;
  }
  if (!this.firstTimePrint) {
    if (this.firstTimePrintCount < 500) {
      this.firstTimePrintCount++;
    } else {
      //console.log("venue360--timeout happned");
      this.firstTimePrint = true;
      this.printTileInfo();
    }
  }
  if (!('rCount' in this)) {
    this.rCount = 0;
  }
  this.rCount++;
  if (this.rCount > 100) { // TBD why 100 ?
    this.rCount = 0;
    this.checkTileVisibility();
  }

}  

vidteq._venue360._tiler.prototype.terminateObj = function (obj) {
	console.log("tiler terminateObj");
  if (obj.geometry) {
    obj.geometry.dispose();
    delete obj.geometry; // TBD why ?
  }
  if (obj.material) {
    if (obj.material.map && 
        obj.material.map.image && 
        obj.material.map.image.remove) {
      obj.material.map.image.remove();
    }
    if (obj.material.dispose) {
      obj.material.dispose();
    }
    delete obj.material;  // TBD why ?
  }
  //if (obj.dispose) {
  //  obj.dispose();
  //}
}

vidteq._venue360._tiler.prototype.terminateTile = function (tile) {
  console.log("venue360--terminating ");console.log(tile);
  if (!tile.mesh) { return; } 
  var obj = tile.mesh;
  this.venue360.scene.remove(obj);
  if (obj.children) {
    for (var i in obj.children) {
      this.terminateObj(obj.children[i]);
    }
  }
  this.terminateObj(obj);
  obj.remove();
  delete tile.mesh;
  if ('north' in tile) {   
    if (tile.north.south) { delete tile.north.south; }
    delete tile.north; 
  }
  if ('south' in tile) { 
    if (tile.south.north) { delete tile.south.north; }
    delete tile.south; 
  }
  if ('east' in tile) { 
    if (tile.east.west) { delete tile.east.west; }
    delete tile.east; 
  }
  if ('west' in tile) { 
    if (tile.west.east) { delete tile.west.east; }
    delete tile.west; 
  }
  if ('fine' in tile) { delete tile.fine; }
  if ('coarse' in tile) { delete tile.coarse; }
  this.deleteTileFromCache(tile);
  delete obj; // why ?
  delete tile; // TBD why?
}

vidteq._venue360._tiler.prototype.germinateTile = function (tile,callback) {
  console.log("venue360--germinating ");console.log(tile);
  //var b = this.addOneTileFloor(tu,p,r,tileUrl);
  var tileUrl = this.tI.urlSeed + tile.ll.lon+','+tile.ll.lat+','+(tile.ll.lon+tile.resTile)+','+(tile.ll.lat+tile.resTile);
  var b = this.addOneTileFloor(tile.tu,tile.p,tile.r,tileUrl,callback,function () {
    console.log("venue360--Error loading tile");
    console.log(tile);
  });
  tile.tileUrl = tileUrl;
  tile.mesh = b;
  delete tile.gCorners;
  return tile;
}

vidteq._venue360._tiler.prototype.voteForZoom = function (tile,zoom) {
	console.log("tiler voteForZoom");
  zoom.total++;
  if (!('pxRatio' in tile)) { return 'none'; }
  var r = tile.pxRatio;
  if (r.a < 0.5) { zoom.coarse++; return 'coarse'; }
  else if (2 < r.a) { zoom.fine++; return 'fine'; }
  else { zoom.stay++; return 'stay'; }
  return 'none';
}

vidteq._venue360._tiler.prototype.isVisible = function (tile) {
	console.log("tiler isVisible");
  if (!('pxRatio' in tile)) { return false; }
  var r = tile.pxRatio;
  var c = r.corners;
  var anyCornerVisible = 
    c.ll.visible ||
    c.ul.visible ||
    c.lr.visible ||
    c.ur.visible;
  if (r.a < 0.3) { 
    r.reason = "Too small";
    r.visible = false;
    return false; 
  } // too small
  if (anyCornerVisible) { 
    r.reason = "Corner visible";
    r.visible = true;
    return true; 
  } 
  if (r.a > 4) { 
    r.reason = "Too big";
    r.visible = false;
    return false; 
  } // too big area, not visible as well
  r.reason = "Area ok but not visible";
  r.visible = true;
  return true; // area is ok, but not visible TBD ??
}

vidteq._venue360._tiler.prototype.fillNeededSides = function (tile) {
	console.log("tiler fillNeededSides");
  if (!('pxRatio' in tile)) { return {}; }
  var r = tile.pxRatio;
  var sides = {};
  if ((r.corners.ll.visible || r.corners.lr.visible) && 
      (0.4 < r.s && r.s < 2.5)) {
    sides.south = true; 
  }
  if ((r.corners.ll.visible || r.corners.ul.visible)) { // &&
    //   (0.4 < r.w && r.w < 2.5)) { 
    sides.west = true; 
  }
  if ((r.corners.ul.visible || r.corners.ur.visible)) { // && 
    //   (0.4 < r.n && r.n < 2.5)) { 
    sides.north = true; 
  }
  if ((r.corners.lr.visible || r.corners.ur.visible)) { // &&
    //   (0.4 < r.e && r.e < 2.5)) { 
    sides.east = true; 
  }
  r.sides = sides;
  return sides;
}

vidteq._venue360._tiler.prototype.deleteTile = function (tile) {
	console.log("tiler deleteTile");
  for (var j in this.tiles) {
    if (this.tiles[j] == tile) {
      this.tiles.splice(j,1);
      break;
    }
  }
  this.terminateTile(tile);
}

vidteq._venue360._tiler.prototype.renderZooming = function (curTile,changes) {
	console.log("tiler renderZooming");
  if (this.tI.zooming == 'fine') {
      //if (curTile.fine && curTile.fine[quad] && curTile.fine[quad].mesh) { 
      //  console.log("venue360--already germinated");
      //  continue; 
      //}
    var tiles = curTile.fine || this.getFinerTiles(curTile);
    this.computePxRatio(tiles,curTile.mesh);
    for (var quad in tiles) {
      console.log("venue360--checking fine "+quad);
      var tile = tiles[quad];
      if (tile.mesh) {
        console.log("venue360--already germinated");
        continue;
      }
      //this.computePxRatio([tile],curTile.mesh);
      //if (this.isVisible(tile)) { // TBD is it really needed ?
        console.log("venue360--germinating side "+quad);
        var that = this;
        (function () {
          var childTile = tile;
          var parentTile = curTile;
          changes.add.push(that.germinateTile(tile,function (){
            console.log("venue360--germination call back loaded ");
            console.log("venue360--child ");console.log(childTile);
            console.log("venue360--parent ");console.log(parentTile);
            childTile.loaded = true;
            var allLoaded = true;
            for (var i in parentTile.fine) {
              if (parentTile.fine[i].mesh &&
                  !parentTile.fine[i].loaded) { 
                allLoaded = false; 
              }
            }
            if (allLoaded) { 
              that.deleteTile(parentTile);
            }
          }));
        })();
      //}
    }
  }
  if (this.tI.zooming == 'coarse') {
    var tile = this.getCoarseTile(curTile);
    this.computePxRatio([tile],curTile.mesh);
  }
}

vidteq._venue360._tiler.prototype.renderSiding = function (curTile,changes) {
	console.log("tiler renderSiding");
  var sides = this.fillNeededSides(curTile);
  for (var side in sides) {
    console.log("venue360--checking side "+side);
    if (curTile[side] && curTile[side].mesh) { 
      console.log("venue360--already germinated");
      continue; 
    }
    var tile = curTile[side] || this.getSideTile(curTile,side); 
    if (tile.mesh) {
      console.log("venue360--already germinated");
      continue;
    }
    this.computePxRatio([tile],curTile.mesh);
    if (this.isVisible(tile)) {
      console.log("venue360--germinating side "+side);
      changes.add.push(this.germinateTile(tile));
    }
  }
}

vidteq._venue360._tiler.prototype.checkTileVisibility = function () {
	console.log("tiler checkTileVisibility");
  if (!('retard' in this)) { this.retard = 30; }
  if (this.regard < 30) { 
    this.retard--; 
    if (this.retard <= 0) { this.retard = 30 }
    return;
  }
  if (this.tiles.length > 50) { 
    console.log("venue360--max limit reached ");
    return; 
  } 
  if (!('runner' in this)) { this.runner = 0; }
  if (!('iter' in this)) { this.iter = 0; }
  if (this.iter>100) { return; }
  this.runner++;
  console.log("venue360--runner count "+this.runner);
  //if (this.runner == 15) {
  //  this.tI.zooming = 'fine';
  //}
  console.log("venue360--iteration "+this.iter);
  console.log("venue360--tiles length "+this.tiles.length);
  var changes = {add:[],del:[]};
  //var newTiles = [];
  //var delTiles = [];
  var zoom = {
    fine:0
    ,coarse:0
    ,stay:0
    ,total:0
  };
  var cam = this.venue360.camera;
  cam.updateMatrix();
  cam.updateMatrixWorld();
  cam.matrixWorldInverse.getInverse( cam.matrixWorld );
  if (!('frustum' in this)) { this.frustum = new THREE.Frustum(); }
  this.frustum.setFromMatrix( new THREE.Matrix4().multiply( cam.projectionMatrix, cam.matrixWorldInverse ) );

  for (var i in this.tiles) {
    console.log("venue360--tile no "+i);
    var curTile = this.tiles[i];
    if (this.tI.z != curTile.z) {
      console.log(curTile);
      console.log("venue360--dead wood, tile of different zoom");
      continue;
    }
    // TBD when we change zoom we may need timer to cleanup
    // TBD we may need garbage collector
    if (this.tI.zooming) {
      this.renderZooming(curTile,changes);
      continue;
    }
    this.computePxRatio([curTile]);
    if (!this.isVisible(curTile)) {
      //delTiles.push(curTile);
      changes.del.push(curTile);
      console.log("venue360--deleting tile ");console.log(curTile);
      continue;
    }
    var zVote = this.voteForZoom(curTile,zoom);
    //if (zVote == 'fine') {
    //    //if (curTile.fine && curTile.fine[quad] && curTile.fine[quad].mesh) { 
    //    //  console.log("venue360--already germinated");
    //    //  continue; 
    //    //}
    //  var tiles = curTile.fine || this.getFinerTiles(curTile);
    //  this.computePxRatio(tiles,curTile.mesh);
    //  for (var quad in tiles) {
    //    console.log("venue360--checking fine "+quad);
    //    var tile = tiles[quad];
    //    if (tile.mesh) {
    //      console.log("venue360--already germinated");
    //      continue;
    //    }
    //    //this.computePxRatio([tile],curTile.mesh);
    //    if (this.isVisible(tile)) {
    //      console.log("venue360--germinating side "+quad);
    //      var that = this;
    //      (function () {
    //        var childTile = tile;
    //        var parentTile = curTile;
    //        newTiles.push(that.germinateTile(tile,function (){
    //          console.log("venue360--germination call back loaded ");
    //          console.log("venue360--child ");console.log(childTile);
    //          console.log("venue360--parent ");console.log(parentTile);
    //        }));
    //      })();
    //    }
    //  }
    //}
    //if (zVote == 'coarse') {
    //  var tile = this.getCoarseTile(curTile);
    //  this.computePxRatio([tile],curTile.mesh);
    //}
    this.renderSiding(curTile,changes);
    //var sides = this.fillNeededSides(curTile);
    //for (var side in sides) {
    //  console.log("venue360--checking side "+side);
    //  if (curTile[side] && curTile[side].mesh) { 
    //    console.log("venue360--already germinated");
    //    continue; 
    //  }
    //  var tile = curTile[side] || this.getSideTile(curTile,side); 
    //  if (tile.mesh) {
    //    console.log("venue360--already germinated");
    //    continue;
    //  }
    //  this.computePxRatio([tile],curTile.mesh);
    //  if (this.isVisible(tile)) {
    //    console.log("venue360--germinating side "+side);
    //    newTiles.push(this.germinateTile(tile));
    //  }
    //}
  }
  console.log("venue360--zoom votes ");console.log(zoom);
  if (this.tI.zooming && this.tI.zooming == 'fine') {
    this.tI.z++;
    delete this.tI.zooming;
  } 
  if (this.tI.zooming && this.tI.zooming == 'coarse') {
    this.tI.z--;
    delete this.tI.zooming;
  } 
  if (changes.del.length) {
    console.log("venue360--delete of "+changes.del.length);
    for (var i in changes.del) {
      this.deleteTile(changes.del[i]);
    }
  }
  if (changes.add.length) {
    this.iter++;
    console.log("venue360--concat of "+changes.add.length);
    this.tiles = this.tiles.concat(changes.add);
  }
  //if (delTiles.length) {
  //  console.log("venue360--delete of "+delTiles.length);
  //  for (var i in delTiles) {
  //    this.deleteTile(delTiles[i]);
  //  }
  //}
  //if (newTiles.length) {
  //  this.iter++;
  //  console.log("venue360--concat of "+newTiles.length);
  //  this.tiles = this.tiles.concat(newTiles);
  //}
}

vidteq._venue360._tiler.prototype.deleteTileFromCache = function (tile) {
	console.log("tiler deleteTileFromCache");
  if (!(tile.z in this.tH)) { return; }
  var tH = this.tH[tile.z];
  var i = tile.lonIdx;
  var j = tile.latIdx;
  if (!tH[i]) { return; }
  if (!tH[i][j]) { return; }
  delete tH[i][j];
  if (!Object.keys(tH[i]).length) { delete tH[i]; }
}

vidteq._venue360._tiler.prototype.addTileToCache = function (tile) {
	console.log("tiler addTileToCache");
  if (!(tile.z in this.tH)) { this.tH[tile.z] = {}; }
  var tH = this.tH[tile.z];
  var i = tile.lonIdx;
  var j = tile.latIdx;
  if (!tH[i]) { tH[i] = {}; }
  if (tH[i][j]) { return tH[i][j]; }
  // TBD is it ok ? to overwrite ?
  tH[i][j] = tile;
  return tile;
}

vidteq._venue360._tiler.prototype.getSideTileFromCache = function (seed,side) {
	console.log("tiler getSideTileFromCache");
  if (!('z' in seed)) { return; }
  var z = seed.z;
  if (!this.tH[z]) { return; }
  var tH = this.tH[z];
  var i = seed.lonIdx;
  var j = seed.latIdx;
  if (side == 'north') { j++; } 
  if (side == 'south') { j--; }
  if (side == 'east') { i++; }
  if (side == 'west') { i--; }
  if (!tH[i]) { return; }
  if (!tH[i][j]) { return; }
  var tile = tH[i][j];
  console.log("venue360--found in cache "+tile.i+' '+tile.j);
  return tile;
}

vidteq._venue360._tiler.prototype.getGCorners = function (seed,side,quad) {
	console.log("tiler getGCorners");
  if (!seed.p) { return {}; }
  var x = seed.p.x;
  var z = seed.p.z;
  var quad = quad || seed.quad;
  if (side == 'fine') {
    if (quad == 'll') { }
    if (quad == 'ul') { z -= seed.tu/2; } 
    if (quad == 'lr') { x += seed.tu/2; } 
    if (quad == 'ur') { z -= seed.tu/2; x += seed.tu/2; } 
    z += seed.tu/4; x -= seed.tu/4; // TBD why  
  }
  if (side == 'coarse') {
    if (quad == 'll') { }
    if (quad == 'ul') { z += seed.tu; } 
    if (quad == 'lr') { x -= seed.tu; } 
    if (quad == 'ur') { z += seed.tu; x -= seed.tu; } 
  }
  if (side == 'north') { z -= seed.tu; } 
  if (side == 'south') { z += seed.tu; } 
  if (side == 'east') { x += seed.tu; }
  if (side == 'west') { x -= seed.tu; }
  var ret = {};
  ret.p = new THREE.Vector3(x,this.tI.gY,z);
  // r = {x:-Math.PI/2};
  ret.r = {x:-90*Math.PI/180};
  if (seed.mesh) {
    var cv = this.getCv(seed);
    var dNorth = new THREE.Vector3();
    dNorth.subVectors(cv.ul,cv.ll);
    var dEast = new THREE.Vector3();
    dEast.subVectors(cv.lr,cv.ll);
    var newLl = new THREE.Vector3();
    newLl.copy(cv.ll);
    if (side == 'fine') {
      console.log("venue360--d north ");console.log(dNorth);
      console.log("venue360--d east ");console.log(dEast);
      dNorth.divideScalar(2); 
      dEast.divideScalar(2); 
      console.log("venue360--d north ");console.log(dNorth);
      console.log("venue360--d east ");console.log(dEast);
      if (quad == 'll') { }
      if (quad == 'ul') { newLl.add(dNorth); } 
      if (quad == 'lr') { newLl.add(dEast); } 
      if (quad == 'ur') { newLl.add(dNorth); newLl.add(dEast); } 
    }
    if (side == 'coarse') {
      if (quad == 'll') { }
      if (quad == 'ul') { newLl.sub(dNorth); } 
      if (quad == 'lr') { newLl.sub(dEast); } 
      if (quad == 'ur') { newLl.sub(dNorth); newLl.sub(dEast); } 
      dNorth.multiplyScalar(2); 
      dEast.multiplyScalar(2); 
    }
    if (side == 'north') { newLl.add(dNorth); } 
    if (side == 'south') { newLl.sub(dNorth); } 
    if (side == 'east') { newLl.add(dEast); }
    if (side == 'west') { newLl.sub(dEast); }
    ret.gCorners = {
      ll:newLl
      ,ul:newLl.clone().add(dNorth)
      ,ur:newLl.clone().add(dNorth).add(dEast)
      ,lr:newLl.clone().add(dEast)
    };
    return ret;
  }
  ret.gCorners = {
    ll:new THREE.Vector3(x,this.tI.gY,z)
    ,ul:new THREE.Vector3(x,this.tI.gY,z+seed.tu)
    ,ur:new THREE.Vector3(x+seed.tu,this.tI.gY,z+seed.tu)
    ,lr:new THREE.Vector3(x+seed.tu,this.tI.gY,z)
  };
  return ret;
}

//vidteq._venue360._tiler.prototype.getGCorners = function (seed,side) {
//  if (!seed.p) { return {}; }
//  var x = seed.p.x;
//  var z = seed.p.z;
//  if (side == 'north') { z += seed.tu; } 
//  if (side == 'south') { z -= seed.tu; } 
//  if (side == 'east') { x += seed.tu; }
//  if (side == 'west') { x -= seed.tu; }
//  var ret = {};
//  ret.p = new THREE.Vector3(x,this.tI.gY,z);
//  // r = {x:-Math.PI/2};
//  ret.r = {x:-90*Math.PI/180};
//  if (seed.mesh) {
//    var cv = this.getCv(seed);
//    var dNorth = new THREE.Vector3();
//    dNorth.subVectors(cv.ul,cv.ll);
//    var dEast = new THREE.Vector3();
//    dEast.subVectors(cv.lr,cv.ll);
//    var newLl = new THREE.Vector3();
//    newLl.copy(cv.ll);
//    if (side == 'north') { newLl.add(dNorth); } 
//    if (side == 'south') { newLl.sub(dNorth); } 
//    if (side == 'east') { newLl.add(dEast); }
//    if (side == 'west') { newLl.sub(dEast); }
//    ret.gCorners = {
//      ll:newLl
//      ,ul:newLl.clone().add(dNorth)
//      ,ur:newLl.clone().add(dNorth).add(dEast)
//      ,lr:newLl.clone().add(dEast)
//    };
//    return ret;
//  }
//  ret.gCorners = {
//    ll:new THREE.Vector3(x,this.tI.gY,z)
//    ,ul:new THREE.Vector3(x,this.tI.gY,z+this.tI.tu)
//    ,ur:new THREE.Vector3(x+this.tI.tu,this.tI.gY,z+this.tI.tu)
//    ,lr:new THREE.Vector3(x+this.tI.tu,this.tI.gY,z)
//  };
//  return ret;
//}

//vidteq._venue360._tiler.prototype.getGCornersOld = function (seed,side) {
//  if (!seed.p) { return {}; }
//  var x = seed.p.x;
//  var z = seed.p.z;
//  if (side == 'north') { z += this.tI.tu; } 
//  if (side == 'south') { z -= this.tI.tu; } 
//  if (side == 'east') { x += this.tI.tu; }
//  if (side == 'west') { x -= this.tI.tu; }
//  var ret = {};
//  ret.p = new THREE.Vector3(x,this.tI.gY,z);
//  // r = {x:-Math.PI/2};
//  ret.r = {x:-90*Math.PI/180};
//  ret.gCorners = {
//    ll:new THREE.Vector3(x,this.tI.gY,z)
//    ,ul:new THREE.Vector3(x,this.tI.gY,z+this.tI.tu)
//    ,ur:new THREE.Vector3(x+this.tI.tu,this.tI.gY,z+this.tI.tu)
//    ,lr:new THREE.Vector3(x+this.tI.tu,this.tI.gY,z)
//  };
//  return ret;
//  ///    var b = this.addOneTileFloor(tu,p,r,tileUrl);
//}

vidteq._venue360._tiler.prototype.fillIdxFromC = function (tile) {
	console.log("tiler fillIdxFromC");
  tile.ll = {
    lon:this.getGbLon(tile.c.lon,tile.res,this.tI.tileSizePx)
    ,lat:this.getGbLat(tile.c.lat,tile.res,this.tI.tileSizePx)
  };
  tile.c = { // re assign
    lon:tile.ll.lon+tile.resTile/2
    ,lat:tile.ll.lat+tile.resTile/2
  };
  $.extend(tile,this.getTileIdx(tile));
  return this.addTileToCache(tile);
}

vidteq._venue360._tiler.prototype.getFinerTiles = function (seed) {
	console.log("tiler getFinerTiles");
  if (seed.fine) { return seed.fine };
  var z = seed.z; z++;
  var res = this.tI.resA[z];
  var tiles = {};
  var tileSeed = {
    z:z
    ,res:res
    ,resTile: res * this.tI.tileSizePx
    ,tu:seed.tu/2
  };
  tiles.ll = $.extend({},tileSeed,{
    c:{
      lon:seed.c.lon-tileSeed.resTile/2
      ,lat:seed.c.lat-tileSeed.resTile/2
    }
    ,quad:'ll'
  });
  tiles.ul = $.extend({},tileSeed,{
    c:{
      lon:seed.c.lon-tileSeed.resTile/2
      ,lat:seed.c.lat+tileSeed.resTile/2
    }
    ,quad:'ul'
  });
  tiles.ur = $.extend({},tileSeed,{
    c:{
      lon:seed.c.lon+tileSeed.resTile/2
      ,lat:seed.c.lat+tileSeed.resTile/2
    }
    ,quad:'ur'
  });
  tiles.lr = $.extend({},tileSeed,{
    c:{
      lon:seed.c.lon+tileSeed.resTile/2
      ,lat:seed.c.lat-tileSeed.resTile/2
    }
    ,quad:'lr'
  });
  var ret = {}; // to enable caching
  for (var i in tiles) {
    var tile = this.fillIdxFromC(tiles[i]);
    $.extend(tile,this.getGCorners(seed,'fine',tile.quad));
    this.linkZoomTiles(seed,'fine',tile);
    ret[i] = tile;
  }
  return ret;
}

vidteq._venue360._tiler.prototype.getCoarseTile = function (seed) {
	console.log("tiler getCoarseTile");
  if (seed.coarse) { return seed.coarse };
  var z = seed.z; z--;
  var res = this.tI.resA[z];
  var tileSeed = {
    z:z
    ,res:res
    ,resTile: res * this.tI.tileSizePx
    ,tu:seed.tu*2
    ,c:{ // We dont really know the quadrant
      lon:seed.c.lon
      ,lat:seed.c.lat
    }
  };
  var tile = this.fillIdxFromC(tileSeed);
  seed.quad = 
    tile.c.lon < seed.c.lon ? 
      (tile.c.lat < seed.c.lat ? 'ur' : 'lr') : 
      (tile.c.lat < seed.c.lat ? 'ul' : 'll');
  $.extend(tile,this.getGCorners(seed,'coarse'));
  this.linkZoomTiles(seed,'coarse',tile);
  return tile;
}

vidteq._venue360._tiler.prototype.linkZoomTiles = function (seed,side,tile) {
	console.log("tiler linkZoomTiles");
  if (!(side in seed)) { seed[side] = {}; }
  var quad = 
    side == 'fine' ? tile.quad : 
    side == 'coarse' ? seed.quad : 'none'; 
  seed[side][quad] = tile;
  var otherSide = 
    side == 'fine' ? 'coarse' :
    side == 'coarse' ? 'fine' : 'none';
  if (!(otherSide in tile)) { tile[otherSide] = {}; }
  tile[otherSide][quad] = seed;
}

vidteq._venue360._tiler.prototype.linkTiles = function (seed,side,tile) {
	console.log("tiler linkTiles");
  seed[side] = tile;
  var otherSide = 
    side == 'north' ? 'south' :
    side == 'south' ? 'north' :
    side == 'east' ? 'west' :
    side == 'west' ? 'east' : 'none';
  tile[otherSide] = seed; // TBD circular very dangerous
}

vidteq._venue360._tiler.prototype.getSideTile = function (seed,side) {
	console.log("tiler getSideTile");
  if (seed[side]) { return seed[side] };
  var tile = this.getSideTileFromCache(seed,side);
  if (tile) { 
    this.linkTiles(seed,side,tile);
    return tile; 
  }
  var tile = {
    res:seed.res
    ,z:seed.z
    ,resTile:seed.resTile
    ,tu:seed.tu
  };
  if (side == 'north') {
    tile.c =  {lon:seed.c.lon,lat:seed.c.lat+seed.resTile};
    tile.i = seed.i;
    tile.j = seed.j+1;
  } 
  if (side == 'south') {
    tile.c =  {lon:seed.c.lon,lat:seed.c.lat-seed.resTile};
    tile.i = seed.i;
    tile.j = seed.j-1;
  } 
  if (side == 'east') {
    tile.c =  {lon:seed.c.lon+seed.resTile,lat:seed.c.lat};
    tile.i = seed.i+1;
    tile.j = seed.j;
  }
  if (side == 'west') {
    tile.c =  {lon:seed.c.lon-seed.resTile,lat:seed.c.lat};
    tile.i = seed.i-1;
    tile.j = seed.j;
  }
  //tile.ll = {
  //  lon:this.getGbLon(tile.c.lon,tile.res,this.tI.tileSizePx)
  //  ,lat:this.getGbLat(tile.c.lat,tile.res,this.tI.tileSizePx)
  //};
  //tile.c = { // re assign
  //  lon:tile.ll.lon+tile.resTile/2
  //  ,lat:tile.ll.lat+tile.resTile/2
  //};
  //$.extend(tile,this.getTileIdx(tile));
  var ret = this.fillIdxFromC(tile);
  $.extend(ret,this.getGCorners(seed,side));
  this.linkTiles(seed,side,ret);
  return ret;
}

vidteq._venue360._tiler.prototype.getCv = function (tile,cVOrder) { 
	console.log("tiler getCv");
  // corner Vertices
  var cv = {};
  if (!tile.mesh) { return cv; }
  cVOrder = cVOrder || this.cVOrder;
  for (var i in cVOrder) {
    //cv[i] = tile.mesh.geometry.vertices[cVOrder[i]];
    var b = tile.mesh;
    cv[i] = (b.geometry ? 
      b.geometry.vertices :
      b.children && b.children.length ? 
        b.children[0].geometry.vertices : null
    )[cVOrder[i]];
  }
  return cv;
}

vidteq._venue360._tiler.prototype.getVertices = function (tile,cVOrder) {
	console.log("tiler getVertices");
  if (tile.mesh) {
    return this.getCv(tile,cVOrder);
  }
  if (tile.gCorners) { return tile.gCorners; }
}

vidteq._venue360._tiler.prototype.printPretty = function (pxRatio) {
	console.log("tiler getVertices");
  return;
  console.log(pxRatio);
  console.log("venue360--ll");console.log(pxRatio.corners.ll);
  console.log("venue360--ul");console.log(pxRatio.corners.ul);
  console.log("venue360--ur");console.log(pxRatio.corners.ur);
  console.log("venue360--lr");console.log(pxRatio.corners.lr);
  console.log("venue360--n "+pxRatio.n.toFixed(2));
  console.log("venue360--e "+pxRatio.e.toFixed(2));
  console.log("venue360--w "+pxRatio.w.toFixed(2));
  console.log("venue360--s "+pxRatio.s.toFixed(2));
  console.log("venue360--ne-sw "+pxRatio.nesw.toFixed(2));
  console.log("venue360--nw-se "+pxRatio.nwse.toFixed(2));
}

vidteq._venue360._tiler.prototype.computePxRatio = function (tiles,refMesh) {
	console.log("tiler computePxRatio");
  for (var i in tiles) {
    this.computePxRatioForOneTile(tiles[i],refMesh);
  }
}

vidteq._venue360._tiler.prototype.getLength = function (n1,n2) {
	console.log("tiler getLength");
  return Math.sqrt(
    (n1.x - n2.x)*(n1.x - n2.x)+
    (n1.y - n2.y)*(n1.y - n2.y)
  );
}

vidteq._venue360._tiler.prototype.getEdge = function (n1,n2) {
	console.log("tiler getEdge");
  var ret = {};
  ret.spx = this.getLength(n1,n2); // screen pixels
  ret.f = n1.visible ?  // fraction visible 
    (n2.visible ? 1 : 0.5) : 
    (n2.visible ? -0.5 : 0);
  ret.fspx = ret.spx * ret.f;
  ret.fp = {   // TBD how to get the fraction point
    x:(n1.x+n2.x)/2
    ,y:(n1.y+n2.y)/2
  };
  ret.spr = ret.spx/256;   // screen to physical pixel ratio 
  return ret;
}

vidteq._venue360._tiler.prototype.getHeron = function (a,b,c) {
	console.log("tiler getHeron");
  var s = (a + b + c)/2;
  return Math.sqrt(s*(s-a)*(s-b)*(s-c)); 
}

vidteq._venue360._tiler.prototype.getArea = function (t) {
	console.log("tiler getArea");
  var ret = {};
  ret.af = this.getHeron(t.ab.spx,t.bc.spx,t.ca.spx); // area full
  if (t.a.visible && t.b.visible && t.c.visible) {
    ret.apx = ret.af;
  } else if (!t.a.visible && !t.b.visible && !t.c.visible) {
    ret.apx = 0;
  } else if ((t.a.visible && !t.b.visible && !t.c.visible) ||
             (!t.a.visible && t.b.visible && t.c.visible)) {
    var area = this.getHeron(
      this.getLength(t.a,t.ab.fp)
      ,this.getLength(t.ab.fp,t.ca.fp)
      ,this.getLength(t.ca.fp,t.a)
    );
    if (t.a.visible) { ret.apx = area; }
    if (!t.a.visible) { ret.apx = ret.af - area; }
  } else if ((t.b.visible && !t.a.visible && !t.c.visible) ||
             (!t.b.visible && t.a.visible && t.c.visible)) {
    var area = this.getHeron(
      this.getLength(t.b,t.bc.fp)
      ,this.getLength(t.bc.fp,t.ca.fp)
      ,this.getLength(t.ca.fp,t.b)
    );
    if (t.b.visible) { ret.apx = area; }
    if (!t.b.visible) { ret.apx = ret.af - area; }
  } else if ((t.c.visible && !t.b.visible && !t.a.visible) ||
             (!t.c.visible && t.b.visible && t.a.visible)) {
    var area = this.getHeron(
      this.getLength(t.c,t.ca.fp)
      ,this.getLength(t.ca.fp,t.bc.fp)
      ,this.getLength(t.bc.fp,t.c)
    );
    if (t.c.visible) { ret.apx = area; }
    if (!t.c.visible) { ret.apx = ret.af - area; }
  } else {
    ret.apx = ret.af;  // may be zero TBD
  }
  return ret;
}

vidteq._venue360._tiler.prototype.computePxRatioForOneTile = function (tile,refMesh) {
  console.log("venue360--computePxRatioForOneTile");console.log(tile);
  if (!('pxRatio' in tile)) { tile.pxRatio = {}; }
  if (tile.mesh) {
    var m = tile.mesh;
    m.updateMatrix();
    m.updateMatrixWorld();
    console.log("venue360--frustum ");
    console.log(this.frustum);
    //console.log(this.frustum.contains(m));
    //var isect = this.frustum.intersectsObject(m);
    //console.log(isect);
  }
  var b = tile.mesh || refMesh;
  var pxRatio = tile.pxRatio;
  var id = this.venue360.viewerId;
  var width = $("#"+id).width();
  var height = $("#"+id).height();
  var widthHalf = width / 2, heightHalf = height / 2;

  var vector = new THREE.Vector3();
  var projector = new THREE.Projector();
  var vertices = this.getVertices(tile,this.cVOrder);
  if (!vertices) { return; } // TBD what to do
  pxRatio.vertices = vertices;
  pxRatio.corners = {};
  for (var i in vertices) {
    vector.copy(vertices[i]);
    projector.projectVector( vector.applyProjection(b.matrixWorld), this.venue360.camera );
    vector.x = ( vector.x * widthHalf ) + widthHalf;
    vector.y = - ( vector.y * heightHalf ) + heightHalf;
    var one = {
      x:parseInt(vector.x)
      ,y:parseInt(vector.y)
    };
    one.visible = (0<=one.x && one.x<width && 0<=one.y && one.y<height);
    pxRatio.corners[i] = one;
  }
  var c = pxRatio.corners;
  pxRatio.n = this.getEdge(c.ul,c.ur);
  //pxRatio.n = Math.sqrt(
  //  (c.ur.x - c.ul.x)*(c.ur.x - c.ul.x)+
  //  (c.ur.y - c.ul.y)*(c.ur.y - c.ul.y)
  //)/256;
  pxRatio.e = this.getEdge(c.ur,c.lr);
  //pxRatio.e = Math.sqrt(
  //  (c.ur.x - c.lr.x)*(c.ur.x - c.lr.x)+
  //  (c.ur.y - c.lr.y)*(c.ur.y - c.lr.y)
  //)/256;
  pxRatio.w = this.getEdge(c.ll,c.ul);
  //pxRatio.w = Math.sqrt(
  //  (c.ul.x - c.ll.x)*(c.ul.x - c.ll.x)+
  //  (c.ul.y - c.ll.y)*(c.ul.y - c.ll.y)
  //)/256;
  pxRatio.s = this.getEdge(c.ll,c.lr);
  //pxRatio.s = Math.sqrt(
  //  (c.lr.x - c.ll.x)*(c.lr.x - c.ll.x)+
  //  (c.lr.y - c.ll.y)*(c.lr.y - c.ll.y)
  //)/256;
  pxRatio.nesw = this.getEdge(c.ur,c.ll);
  //pxRatio.nesw = Math.sqrt(
  //  (c.ur.x - c.ll.x)*(c.ur.x - c.ll.x)+
  //  (c.ur.y - c.ll.y)*(c.ur.y - c.ll.y)
  //)/256;
  pxRatio.nwse = this.getEdge(c.ul,c.lr);
  //pxRatio.nwse = Math.sqrt(
  //  (c.ul.x - c.lr.x)*(c.ul.x - c.lr.x)+
  //  (c.ul.y - c.lr.y)*(c.ul.y - c.lr.y)
  //)/256;
  pxRatio.ult = this.getArea({  // upper left triangle
    a:c.ll
    ,b:c.ul
    ,c:c.ur
    ,ab:pxRatio.w
    ,bc:pxRatio.n
    ,ca:pxRatio.nesw
  });
  pxRatio.lrt = this.getArea({  // lower right triangle
    a:c.ll
    ,b:c.lr
    ,c:c.ur
    ,ab:pxRatio.s
    ,bc:pxRatio.e
    ,ca:pxRatio.nesw
  });
  pxRatio.a = (pxRatio.ult.af + pxRatio.ult.af)/(256*256);
  this.printPretty(pxRatio);
}

vidteq._venue360.prototype.creatingAxis = function (length) {
	console.log("creatingAxis");
		var axes = new THREE.Object3D();

		axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( length, 0, 0 ), 0xFF0000, false ) ); // +X
		axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( -length, 0, 0 ), 0xFF0000, true) ); // -X
		axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, length, 0 ), 0x00FF00, false ) ); // +Y
		axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, -length, 0 ), 0x00FF00, true ) ); // -Y
		axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, length ), 0x0000FF, false ) ); // +Z
		axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, -length ), 0x0000FF, true ) ); // -Z

		return axes;
		
	function buildAxis( src, dst, colorHex, dashed ) {
		console.log("buildAxis");
		var geom = new THREE.Geometry(),
			mat; 

		if(dashed) {
			mat = new THREE.LineDashedMaterial({ linewidth: 10, color: colorHex, dashSize: 3, gapSize: 3 });
		} else {
			mat = new THREE.LineBasicMaterial({ linewidth: 3, color: colorHex });
		}

		geom.vertices.push( src.clone() );
		geom.vertices.push( dst.clone() );
		geom.computeLineDistances(); // This one is SUPER important, otherwise dashed lines will appear as simple plain lines

		var axis = new THREE.Line( geom, mat, THREE.LinePieces );

		return axis;

	}
}
 


