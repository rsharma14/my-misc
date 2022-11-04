if (typeof(vidteq) == 'undefined') { vidteq = {}; }
vidteq._venue360UI = function( gui, aD, venueAutoShow, options ) {

  options = options || {};
  this.uuid = vidteq._venue360UI.uuid = vidteq._venue360UI.uuid + 1;
  
  gui = this.gui = gui || {};
  aD = this.aD = aD? aD : vidteq.aD;
  var directFs = typeof options.directFs !=="undefined"? options.directFs : this.getDirectFs( aD );

  var that = this;
  this.editableMode = options.editableMode || false;
  this.editableFresh = options.editableFresh || false;
  var _opt = {
    viewerId:"viewer"
    ,imgPath:this.getImgPath(vidteq.imgPath)
    ,directFs:directFs
    ,effectController:{
      fogOn:false
      ,fogNear:2000
      ,fogFar:4000
      ,fogExp:false
      ,fogDensity:0.0004
      ,red:0.556
      ,green:0.616
      ,blue:0.573
    }
    ,callbackVenue360:{
      before:{}
      ,on:{
        documentMouseDown:this.documentMouseDown
      }
      ,after:{
        popupOpens:null
      }
    }
  };

  options = options? $.extend( _opt, options) : _opt;  

  this.viewerId = options.viewerId;
  this.imgPath = options.imgPath;
  this.directFs = options.directFs;
  this.protocol = document.location.protocol || "http:";
  this.domIds = {
    popupContact: "popupContact"
    ,popupContact1: "popupContact1"
    ,popupContact2: "popupContact2"
    ,popupContactClose: "popupContactClose"
    ,popupContactClose1: "popupContactClose1"
    ,viewer: this.viewerId
    ,viewer1: "viewer1"
    ,vPopupTabs: "vPopupTabs"
    ,popupHelpImage: "popupHelpImage"
    ,popupHelpImage1: "popupHelpImage1"
    ,popupHelpImage2: "popupHelpImage2"
    ,helpMap: "helpMap"
    ,closeVPopHelp: "closeVPopHelp"
    ,bindingThumbs: "bindingThumbs"
    ,thumbImages: "thumbImages"
    ,thumbs: "thumbs"
    ,thumbList: "thumbList"
    ,externalBinding: "externalBinding"
    ,spriteBinding: "spriteBinding"
    ,popupFS: "popupFS"
    ,popupHome: "popupHome"
    ,popupHomeF: "popupHomeF"
    ,popupRotateFMine: "popupRotateFMine"
    //,popupRotateFMineNew: "popupRotateFMineNew"
    ,popupRotateF: "popupRotateF"
    ,popupZI: "popupZI"
    ,popupZIF: "popupZIF"
    ,popupZO: "popupZO"
    ,popupZOF: "popupZOF"
    ,popupHelp: "popupHelp"
    ,popupHelpF: "popupHelpF"
    //,jsonData: "jsonData"
    ,dummyToolTip: "dummyToolTip"
    ,popupMap: "popupMap"
    ,popMapImg: "popMapImg"
    ,spriteText: "spriteText"
    ,bgCurtain: "bgCurtain"
    ,compass: "compass"
    ,compassImg: "compassImg"
    ,Map: "Map"
    ,viewer360: "viewer360"
    ,movUp: "movUp"
    ,movUpF: "movUpF"
    ,movDown: "movDown"
    ,movDownF: "movDownF"
    ,movLeft: "movLeft"
    ,movLeftF: "movLeftF"
    ,movRight: "movRight"
    ,movRightF: "movRightF"
    ,intro: "intro"
    ,MarkerSpriteImg: "MarkerSpriteImg"
    ,popupCloseFrame: "popupCloseFrame"
    ,sideMenu: "sideMenu"
    ,scrollNext: "scrollNext"
    ,scrollPrevious: "scrollPrevious"
    ,layoutList: "layoutList"
    ,backgroundPopup: "backgroundPopup"
    ,projLogoBinding: "projLogoBinding"
  };
  this.ids = {};
  
  for( var id in this.domIds ) {
    this.ids[ id ] = this.domIds[ id ] + "-" + this.uuid;
    //this.ids[ id ] = this.domIds[ id ];
  }
  
  options.viewerId = this.viewerId = this.ids.viewer;
  //--- create venue360
  

  this.venue360 = new vidteq._venue360(this,options);
  options = this.venue360.options;
  if (this.editableMode) { 
    //this.editor = new vidteq._venue360UI._editor(this);
    //this.editor.city = options.city; // needed 
    //this.editor.urlid = options.urlid; // needed 
    this.city = options.city; // needed 
    this.urlid = options.urlid; // needed 
  }
  this.snappyMode = true;
  this.loadFinish = false;
  this.origList = null;
  this.flashIntroTime = 15;
  this.tsWidth = 1023;
  this.tsHeight = 380;
  
  this.commonProjIcon = false;
  if( options.ftShow ) { 
    this.ftShow = options.ftShow; 
    this.commonProjIcon = true;
  }
  var fIT = vidteq.utils.getSafe('config.flashTimerDelay',aD);
  if( fIT ) { this.flashIntroTime = fIT; }
  
  if( this.snappyMode ) { this.tsHeight = 471; }
  if( this.autoShow ) { this.tsWidth = 1173; this.height = 606; }
  
  vidteq.utils.fillBrowserType(this);
  
  if( this.isChrome || this.isIe ){
    this.tsWidth = 1022;
    if( this.autoShow ) { this.tsWidth = 1172; }
  }
}

vidteq._venue360UI.uuid = 0;

vidteq._venue360UI.prototype.getIds = function() {
  return this.ids;
};
vidteq._venue360UI.prototype.getPopup2Id = function() {
  return this.ids.popupContact2;
};
vidteq._venue360UI.prototype.getViewerId = function() {
  return this.ids.viewer;
};
vidteq._venue360UI.prototype.getImgPath = function( imgPath, myImg ) {
  myImg = myImg || {
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
  return imgPath;
}

vidteq._venue360UI.prototype.getDirectFs = function(aD) {
  var directFs = false;
  aD = aD? aD : this.aD;
  if(typeof(aD.places) != 'undefined' 
        && typeof(aD.places.venue) != 'undefined'
        && typeof(aD.places.venue[0].directFs) != 'undefined'
        && parseInt(aD.places.venue[0].directFs)) {
    directFs = true;
  }
  return directFs;
}

vidteq._venue360UI.prototype.checkAndSetAutoShow = function(aD,venueAutoShow) {
	console.log("checkAndSetAutoShow");
  var origList = this.origList = [];
  if ( aD.places && aD.places.venue) { 
    var t = $.extend(true,{},aD.places);
    origList = this.origList = t.venue;
  }
  if( venueAutoShow ) { this.venueAutoShow = venueAutoShow; }
  
  if( origList.length == 1 && origList[0].items.length == 1 ) {
 
    //return {autoShow:true,list:aD.places.venue};
    return {autoShow:true,list:origList};
  }
  
  if( venueAutoShow ) {
    // for example venueAutoShow = {7:{4:true}}
    var autoShowTabIdx = Object.keys(venueAutoShow)[0];
    if( origList[autoShowTabIdx] ) {
      var oneTab = origList[autoShowTabIdx];
      var oneTab = $.extend({},oneTab);  // clone it
      var autoShowThumbIdx = Object.keys(venueAutoShow[autoShowTabIdx])[0];
      if (oneTab.items[autoShowThumbIdx]) {
        var oneThumb = oneTab.items[autoShowThumbIdx];
        oneTab.items = [$.extend(true,{},oneThumb)]; // deep clone
        return {autoShow:true,list:[oneTab]};
      }
    } 
  }
  return { autoShow:false, list:origList};
}

vidteq._venue360UI.prototype.hideContainers = function() {
  if(this.aD && this.aD.firstTimeRule && this.aD.firstTimeRule.behaveAs == "360") {    
    $("#"+this.ids.popupContactClose).hide();
    $('#'+this.ids.popupHomeF).hide();  
    $('#'+this.ids.popupMap).hide();
  }
}

vidteq._venue360UI.prototype.getList = function(aD,venueAutoShow) {
	console.log("getList");
  var listParams = this.checkAndSetAutoShow(aD,venueAutoShow);
  console.log("getList",listParams);
  if( listParams.autoShow ) {
    // TBD looks like directFs is not a friend of autoShow - check it
    this.directFs = false;
  }
  this.venue360.autoShow = listParams.autoShow;
  //TBD:
  //this.autoShow = listParams.autoShow;
  listParams.list = this.calculateAngles( listParams.list );
  // TBD do we need to edit existing venue contents ?
  if( this.editor ) {
    listParams.list = [this.editor.getNewTab({dirCode:'none'})];
  }
  return listParams.list;
}

vidteq._venue360UI.prototype.setList = function(aD,venueAutoShow,options) {
  var listParams = this.checkAndSetAutoShow(aD,venueAutoShow);
  console.log("setList",listParams);
  var venueList = listParams.list;
  var newList = [];
  for(var i in venueList) {
    if(options && options.isSkyView && venueList[i].dirCode == 'Drone') {
      newList.push(venueList[i]);
    } else if(options && !options.isSkyView && venueList[i].dirCode != 'Drone') {
      newList.push(venueList[i]);
    }
  }
  if(newList.length < 1) { newList = venueList; }
  if( listParams.autoShow ) {
    // TBD looks like directFs is not a friend of autoShow - check it
    this.directFs = false;
  }
  this.venue360.autoShow = listParams.autoShow;
  //TBD:
  //this.autoShow = listParams.autoShow;
  this.list = newList;
  //this.list = listParams.list;
  //this.calculateAngles(this.list);
  // TBD do we need to edit existing venue contents ?
  var dirName = $('#header').val();
  //if (this.editor) {
  //  //this.list = [this.editor.getNewTab()];
  //  this.list.push(this.editor.getNewTab());
  //}
}

vidteq._venue360UI.prototype.preInit = function( list ) {
	var that=this;
	console.log(vidteq);
	console.log("preInit",that);
  list = list || this.list;
  var options = this.venue360.config;
  var el_popup;
    //if (this.editableMode) {
//      that.editor = new vidteq._venue360UIEditor(that);
	//	}
	  if (this.editableMode) {
    vidteq.vidteq.loadScript({
      checkObj:'vidteq._venue360UIEditor'
      ,url:"js/venue360UIEditor.js"
    },function() {
      that.editor = new vidteq._venue360UIEditor(that);
      that.editor.city = that.city; // needed 
      that.editor.urlid = that.urlid; // needed 
      that.editor.init();
       
    //that.ui.editor.attachEvents();
  
    });
  }
  if( this.directFs ) {
    el_popup = this.createDirectFsPopup( options );
    console.log("elp",el_popup);
  }else {
    el_popup = this.createPopup( options );
  }
  this.hideContainers();
  var _cb360 = options.callbackVenue360;
  if( _cb360.after && typeof _cb360.after.popupOpens === 'function' ) {
		console.log("cb",_cb360);
    _cb360.after.popupOpens( el_popup );
  }
  this.prepareForToolTip();
  var that = this;
  this.venue360.preInit( list, function() {
    that.preInitCallback();
  });
  //if (this.editor) {
  //  this.editor.donePreInitCallback();
  //}
}

vidteq._venue360UI.prototype.preInitCallback = function() {
	console.log("preInitCallback");
  this.triggerAutoShowIfNeeded();
  if( this.directFs ) {
    //that.autoTriggerDirectFs();
    var idx = 0;
    if (this.ftShow) {
      idx = Object.keys(this.ftShow)[0];
    }
    if (!($('#'+this.ids.vPopupTabs+' li a')[idx])) { idx = 0; }
    if( $('#'+this.ids.vPopupTabs+' li a')[idx] ) {
      $('#'+this.ids.vPopupTabs+' li a')[idx].click();
      // TBD please check if it works for idx > 0
    }
  }
}

vidteq._venue360UI.prototype.reInit = function(aD,venueAutoShow,options) {
  //var options = this.venue360.config;
  options = options? $.extend( this.venue360.config, options) : this.venue360.config;
  var that = this;
  if (this.curTab) { delete this.curTab; }
  if (this.curThumb) { delete this.curThumb; }
  var aD = aD || that.aD;
  //coz venueAutoShow is boolean
  //var venueAutoShow = venueAutoShow || this.venueAutoShow;
  if( options && options.ftShow ) {
    this.ftShow = options.ftShow; 
    this.commonProjIcon = true;
  }
  var venueAutoShow = typeof venueAutoShow !== "undefined"? venueAutoShow : this.venueAutoShow;
  
  // TBD can I run venueAutoShow ?
  //this.checkAndSetAutoShow(aD,venueAutoShow);
  this.venue360.reInit();
  //this.preInit();
}

//vidteq._venue360UI.prototype.calculateAngles = function(list) {
//  for (var i in list) {
//    for (var j in list[i].items) {
//      this.calculateAngleInOneItem(list[i].items[j],list[i].items);
//    }
//  } 
//}

vidteq._venue360UI.prototype.calculateAngleInOneItem = function(tItem,items) {
  tItem.angles = [];
  for (var i in items) {
    if (items[i].marker == tItem.marker) { continue; }
    tItem.angles.push({
      angle:this.calculateAngle(tItem.marker,items[i].marker)
      ,item:items[i]
    });
  } 
}

vidteq._venue360UI.prototype.calculateAngle = function(p1,p2) {
  var angle = Math.atan2((p2[1]-p1[1]),(p2[0]-p1[0])) * 180/Math.PI;
  angle += 90;  // why - setting to north
   //angle += 270
  return angle; 
}

vidteq._venue360UI.prototype.triggerAutoShowIfNeeded = function() {
	console.log("triggerAutoShowIfNeeded",this);
  if (!this.autoShow) { return; }
  var viewer = this.ids.viewer;
  $('#'+viewer).show();
  this.fullView = false;
  $('#'+viewer+' canvas').show();
  $('#'+this.ids.spriteBinding).show();
  // TBD there is cross reference now
  if( this.list && this.list.length>0 ) {
    var oneTab = this.list[0];
    this.prepareThumbList(oneTab);
    var oneThumb = oneTab.thumbList[0];
    this.clickedOnThumb(oneTab,oneThumb);
  }
}

vidteq._venue360UI.prototype.prepareForToolTip = function() {
  // Tooltip mouse tracking code
  
  if (this.venue360.isIe && this.venue360.ieVer == 10 || this.venue360.isIe && this.venue360.ieVer == 9 ) {
    var c1 = new CustomEvent('showtooltip',{});
    var c2 = new CustomEvent('hidetooltip',{});
    $('#'+this.ids.dummyToolTip)[0].dispatchEvent(c1);
    $('#'+this.ids.dummyToolTip)[0].dispatchEvent(c2);
  }
  $(document).mousemove(function( event ) {
    var pos = {left:(event.clientX+15)+'px',top:(event.clientY+15)+'px'}; //earlier 30px each
    $('.tinytooltip').css(pos);
  });
}

vidteq._venue360UI.prototype.createDirectFsPopup = function( options ) {
console.log("createDirectFsPopup",this);
	console.log("createDirectFsPopup",this.gui);
	console.log("createDirectFsPopup",this.editor);
	console.log("createDirectFsPopup",this.venue360);
  options = options || {};
  var vPopupTemplate = options.templateId || 'vPopupFullScreenTemplate2';
  if( this.editor ) {
    vPopupTemplate = 'FullScreenEditableTemplate';
  }
  this.imgPath['vPopProjLogo'] = vidteq.cfg.custom360Images+vidteq.aD.urlId+"/logo.png";  
  if (this.ftShow && this.commonProjIcon) {
    idx = Object.keys(this.ftShow)[0];
    var dirCode = this.aD.places.venue[idx].dirCode;    
    this.imgPath['vPopProjLogo'] = vidteq.cfg.custom360Images+vidteq.aD.urlId+"/"+dirCode+"/thumb/thumb_"+dirCode+".png";
  }
  
  var tmpParams = {
    imgPath: this.imgPath
    ,protocol: this.protocol
    ,uuid: "-"+this.uuid
    ,editableMode: this.editableMode
  };
  var el_popup = $('#'+vPopupTemplate).tmpl(tmpParams).appendTo("body");
  this.attachFsEvents();
  if( this.editor ) {
    this.editor.attachEvents();
  }
  $("#"+this.ids.popupContactClose1).hide();
  this.showTabsButton(); 
  $(window).resize(function() {
    var windowWidth = document.documentElement.clientWidth;
    var windowHeight = document.documentElement.clientHeight;
    //TBD: not sure if all canvas should be resized
    $("canvas").css({
      width:windowWidth +'px'
      ,height:windowHeight +'px'      
    });
  });
  return el_popup;
}

vidteq._venue360UI.prototype.createPopup = function( options ) {
	console.log("createPopup");
  this.imgPath.vPopLogoImage = vidteq.cfg.custom360Images+vidteq.aD.urlId+"/logo.png";
  this.imgPath.tsWidth = this.tsWidth;
  this.imgPath.tsHeight = this.tsHeight;
  this.imgPath.introPath = vidteq.cfg.custom360Images+vidteq.aD.urlId;   
  this.imgPath.autoShow = this.venue360.autoShow;
  var vPopupTemplate = 'vPopupTemplate';
  var that = this;
  if (this.snappyMode) {
    vPopupTemplate = 'vPopupTemplate1';
  }
  var tmpParams = {
    imgPath: this.imgPath
    ,protocol: this.protocol
    ,uuid: "-"+this.uuid
  };
  var el_popup = $('#'+vPopupTemplate).tmpl(tmpParams).appendTo("body");
  $('#'+this.ids.spriteBinding).hide();  // hide till intro
  this.centerPopup();
  var that = this;
  $(window).resize(function() {
    that.centerPopup();
  });
  this.enablePopup();
  if( this.venue360.isIe && this.venue360.ieVer <= 8 ) {
    $('#'+this.ids.popupFS).remove();
    $('#'+this.ids.thumbList).css({'background':'url('+this.imgPath.bottomStrip+') 0 0 repeat-x'});
  }else{
    $("#"+this.ids.popupFS).show();
  }
  this.attachEvents();
  // Specials TBD why ?
  if (this.venue360.isChrome || this.venue360.isIe){
    $('#'+this.ids.popupContact).append("<iframe id='"+this.ids.popupCloseFrame+"' src='javascript:false;' frameborder='0px' scrolling='no' style='position:absolute;right:2px;top:2px;width:17px; height:15px;z-index: 300051'></iframe>");
    setTimeout(function(){
      $('#'+that.ids.popupCloseFrame).contents().find("body").append("<img id='popupCloseImage' src='"+that.imgPath.vPopClose+"' alt='Logo' style='border:0px;background:white;z-index:300052;position:absolute;left:0px;top:0px;' useMap='#popMap' /><map id='popMap' name='popMap'><area id='closePopup1' shape='rect' coords='0,0,17,15' href='javascript:window.parent.vidteq.gui.venue360UI.closeVPop();'/></map>");
    },1000);
  }
  $('#'+this.ids.popupContact).draggable({ handle: '#'+this.ids.sideMenu });
  this.showTabsButton();
  //var btnColor = "#a6ce39";
  //var btnHColor = "#cea639";
  //if (vidteq.aD.config.venueBtnColor) { btnColor = vidteq.aD.config.venueBtnColor; }
  //if (vidteq.aD.config.venueBtnHiliteColor) { btnHColor = vidteq.aD.config.venueBtnHiliteColor; }
  //$('#vPopupTabsTemplate').tmpl({btnColor:btnColor,items:this.list}).appendTo("#"+this.ids.vPopupTabs);
  //var that = this;
  //$('#'+this.ids.vPopupTabs+' li a').each(function() {
  //  var idx = parseInt($(this).attr('tabIndex'));
  //  $(this).data('oneTab',that.list[idx]);
  //  $(this).click(function() {
  //    $('#'+that.ids.vPopupTabs+' li a').css({'background-color':btnColor});
  //    $(this).css({'background-color':btnHColor});
  //    if(that.renderMode != 'java') {
  //      that.venue360.cleanUpTheScene();
  //    } 
  //    that.loadThumb($(this).data('oneTab'));
  //  });
  //});
  
  $('#'+this.ids.thumbImages).hover(function() {
    $('.buttonNext').show();
    $('.buttonPrevious').show();
  },function() {
    $('.buttonNext').hide();
    $('.buttonPrevious').hide();
  });
  $('#'+this.ids.scrollNext).click(function() {
    $('#'+that.ids.thumbs+' ul li:first').slideUp(function() { 
      $(this).appendTo($('#'+that.ids.thumbs+' ul')).slideDown(); 
    });
  });
  $('#'+this.ids.scrollPrevious).click(function() {
    $('#'+that.ids.thumbs+' ul li:last').slideUp(function() { 
      $(this).prependTo($('#'+that.ids.thumbs+' ul')).slideDown(); 
    });
  });
  
  return el_popup;
}

vidteq._venue360UI.prototype.prepareThumbListFromItems = function(oneTab) {
	console.log("ptfi",oneTab);
  var tL = [];
  // first prepare thumbs
  var path = vidteq.cfg.custom360Images+vidteq.aD.urlId+"/";
  //coz oneTab.items is array
  /*if( this.editor ) { 
    // TBD TBD need to move
    oneTab.header = oneTab.header;      //$('#header').val(); //rs
    //alert();
    if(oneTab.dirCode==undefined || oneTab.dirCode==this.editor.defaultHeader)
      oneTab.dirCode =  oneTab.header;
    else
      oneTab.dirCode =  oneTab.dirCode;
    //var ptvThumbImageName = $("#uploadPtv")[0].files[0].name;
    //oneItem.imageName = '"+dirCode+"'.png;
  }*/
  for(var i=0;i<oneTab.items.length;i++) {
    var oneItem = oneTab.items[i];
    var oneThumb = {
      desc:oneItem.title
      ,fov:oneItem.fov
      ,markers:[]
      ,markerDesc:[]
      ,idx:i
      ,pictureAngle:oneItem.adhocAngle||0
    };

    // Three cases 
    //  - freshly loaded thumbImage with thumbImageName, thumbFile and thumbImageSrc
    //  - we have dedicated thumb image given in thumbImageName
    //  - old case where no keys are there but default thumb
    if (oneItem.thumbImageSrc) {
      oneThumb.image = oneItem.thumbImageSrc;
    } else if (oneItem.thumbImageName) {
      if (oneItem.thumbImageName == 'none') { } else {
        oneThumb.image = path + oneTab.dirCode + "/thumb/"+ oneItem.thumbImageName;
      }
    } else if(oneItem.imageName) {
      oneThumb.image = path + oneTab.dirCode + "/thumb/thumb_" + oneItem.imageName;
    }
    // two cases
    // - freshly uploade ptv will have ptvFile
    // - coming backend
    if (oneItem.ptvFile) { // for editor
      oneThumb.ptvFile = oneItem.ptvFile;
      //oneThumb.fullImage = path + oneTab.dirCode + "/"+ oneItem.ptvImageName;
    } else if(oneItem.ptvImageName){
      oneThumb.fullImage = path + oneTab.dirCode + "/"+ oneItem.ptvImageName;
    } else {
      oneThumb.fullImage = path + oneTab.dirCode + "/"+ oneItem.imageName;
    }
    tL.push(oneThumb);
  }
  //TBD: why separate loop
  // now prepare markers
  //coz oneTab.items is array
  for(var i=0;i<oneTab.items.length;i++) {
    var oneItem = oneTab.items[i];
    var oneThumb = tL[i];
    //if (!oneItem.angles) { continue; }
    this.calculateAngleInOneItem(oneItem,oneTab.items);
    for (var j in oneItem.angles) {
      var oneAngle = oneItem.angles[j];
      var itemOfOneAngle = oneAngle.item;
      var thumbOfOneAngle = this.getThumbOfItem(itemOfOneAngle,oneTab.items,tL);
      oneThumb.markers.push({
        angle:oneAngle.angle
        ,label:itemOfOneAngle.title
        ,thumb:thumbOfOneAngle
        ,icon360:this.directFs?(this.editor?'default':'noShow'):'default' //to disable red circles in direc fs mode
        ,creation:'auto'
        ,indx:thumbOfOneAngle.idx
      });
    }
    // for pushing custom markers
    //if( this.editor ) {
    //  if (oneItem.markDesc && oneItem.markDesc.length>0) {
    //    oneThumb.markerDesc=oneItem.markDesc;
    //  }
    //} else{
      for (var j in oneItem.markDesc) {
				var ob={
          angle:oneItem.markDesc[j].angle
          ,label:'add image'
          ,elevation:oneItem.markDesc[j].elevation
          ,dist:40

          ,creation:'custom'
        }
        if(oneItem.markDesc[j].thumb){
					ob.thumb={desc:oneItem.markDesc[j].thumb.desc
					          ,imMrkWidth:oneItem.markDesc[j].thumb.imMrkWidth
                    ,imMrkHeight:oneItem.markDesc[j].thumb.imMrkHeight
                    };
          if(oneItem.markDesc[j].thumb.imMrk){
  					ob.thumb.mrkImg= oneItem.markDesc[j].thumb.imPrev;
					  ob.thumb.imMrk= oneItem.markDesc[j].thumb.imMrk;
				  }else if(oneItem.markDesc[j].thumb.imMrkName){
  					ob.thumb.mrkImg= path + oneTab.dirCode + "/marker/"+ oneItem.markDesc[j].thumb.imMrkName;
				  }
				}

        oneThumb.markerDesc.push(ob);
      }
    //}
  }
  return tL;
}

vidteq._venue360UI.prototype.prepareThumbList = function(oneTab) {
	console.log("ptl",oneTab);
  var tL = this.prepareThumbListFromItems(oneTab);
  var path = vidteq.cfg.custom360Images+vidteq.aD.urlId+"/";
  // Commented Code : bcz to hide masterplan n to show thumbimages directly on click
  
  //~ if (oneTab.masterPlan) {
    //~ tL.unshift({
      //~ image:path + oneTab.dirCode + "/thumb/thumb_" + oneTab.masterPlan.imageName
      //~ ,fullImage:path + oneTab.dirCode + "/"+ oneTab.masterPlan.imageName
      //~ ,desc:oneTab.masterPlan.title
      //~ ,fov:[0,0,0]
      //~ ,masterPlan:true
    //~ });
  //}
  oneTab.thumbList = tL;
}

vidteq._venue360UI.prototype.getThumbOfItem = function(item,items,thumbList) {
  for (var i in items) {
    if (item == items[i]) {
      return thumbList[i];
    }
  }
  return;
}


vidteq._venue360UI.prototype.showTabsButton = function() {
	console.log("showTabsButton");
  //if( !this.list && !this.list.length>0 ) { return false; }
  var btnColor = "#a6ce39";
  var btnHColor = "#cea639";
  if (vidteq.aD.config.venueBtnColor) { btnColor = vidteq.aD.config.venueBtnColor; }
  if (vidteq.aD.config.venueBtnHiliteColor) { btnHColor = vidteq.aD.config.venueBtnHiliteColor; }
  var vPopupTabsTemplate = 'vPopupTabsTemplate';
  if(this.directFs) {
    vPopupTabsTemplate = 'vPopupTabsTemplate2';
  }
  if(this.venue360.options.isSkyView) {
    $('[id^="vPopupTabs-"]').each(function() { $(this).hide(); });
  }
  var tmpParams = {
    btnColor:btnColor
    ,items:this.list
    ,imgPath: this.imgPath
    ,protocol: this.protocol
    ,uuid: "-"+this.uuid
  };
  $('#'+this.ids.vPopupTabs).html('');
  
  $('#'+vPopupTabsTemplate).tmpl( tmpParams ).appendTo("#"+this.ids.vPopupTabs);
  var that = this; 
  $('#'+this.ids.vPopupTabs+' li a').each(function() {
    //console.log('inside li a each function');
    var descT = false;
    $('#'+that.ids.layoutList+' li').find('span').each(function() {
      var desc = $(this).html();
      //console.log('desc ',desc);
      $(this).closest('a').css({'background-image':"url('"+that.imgPath.vPopTabsButton+"')"});      
      $(this).closest('a').attr('tabSelected',false); 
      if( that.editor && 'ptvHeader' in that.editor && that.editor.ptvHeader != '' && desc == that.editor.ptvHeader ) {
        $(this).closest('a').css({'background-image':"url('"+that.imgPath.vPopTabsButtonHover+"')"});
        $(this).closest('a').attr('tabSelected',true); 
        return false;
      }
    });
    var idx = parseInt($(this).attr('tabIndex'));
    $(this).data('oneTab',that.list[idx]);
    $(this).click(function() {
      var oneTab = $(this).data('oneTab');
      that.clickedOnOneTab(this,oneTab,btnColor,btnHColor);
    });
  });
}

vidteq._venue360UI.prototype.clickedOnOneTab = function(button,oneTab,btnColor,btnHColor) {
	console.log("coot",oneTab);
  if (this.directFs) {
    $('#'+this.ids.vPopupTabs+' li a').css({
      'background-image':"url('"+this.imgPath.vPopTabsButton+"')"
    });
    $(button).css({
      'background-image':"url('"+this.imgPath.vPopTabsButtonHover+"')"
    });
  } else {
    $('#'+this.ids.vPopupTabs+' li a').css({
      'background-color':btnColor
    });
    $(button).css({'background-color':btnHColor});
  }
  //if (this.curTab && this.curTab == oneTab) { return; }
  if( this.editor ) {		
    oneTab.header = oneTab.header;      //$('#header').val(); //r
    if(oneTab.dirCode==undefined || oneTab.dirCode==this.editor.defaultHeader){
      oneTab.dirCode =  oneTab.header;
		}else{
      oneTab.dirCode =  oneTab.dirCode;
    }
    if(new RegExp(" ").test(oneTab.dirCode) && oneTab.dirCode!=this.editor.defaultHeader){
      oneTab.dirCode=(oneTab.dirCode).replace(/ /g, "_");
		}
  }
  this.curTab = oneTab;
  if(this.venue360.renderMode != 'java') {
    this.venue360.cleanUpTheScene();
  }

  this.prepareThumbsAndShow(oneTab);
  var idx = this.autoTriggerThumb(oneTab);
  if( this.editor ) {
    this.editor.loadThumbCallback(oneTab,idx);
    var tilteDisplay = $('#title').val();
    $('#'+this.ids.spriteText).text(tilteDisplay);
  }
}

vidteq._venue360UI.prototype.autoTriggerThumb = function(oneTab) {
  // Now auto trigger a thumb
  if ('thumbList' in oneTab && oneTab.thumbList.length) { 
  } else { 
    return; 
  }
  var idx = 0;
  if (this.ftShow) {
    var idx1 = Object.keys(this.ftShow)[0];
    idx = Object.keys(this.ftShow[idx1])[0];
    delete this.ftShow;
  } 
  if (!oneTab.thumbList[idx]) { idx = 0; }
  if(this.editor){
    //if ($('#'+this.ids.thumbList+' li a').length) {
      //$('#'+this.ids.thumbList+' li a')[idx].click();
  //} else {    
      this.clickedOnThumb(oneTab,oneTab.thumbList[oneTab.items.length-1]);
  //}
  } else{
  if ($('#'+this.ids.thumbList+' li a').length) {
    $('#'+this.ids.thumbList+' li a')[idx].click();
  } else {    
    this.clickedOnThumb(oneTab,oneTab.thumbList[idx]);
  }
  }
  this.slyThumbSliderInit(idx);
  return idx;
}

vidteq._venue360UI.prototype.getMasterPlanWH = function(oneTab) {
  var w = 1019;
  var h = 374;
  if (oneTab.masterPlan.w) { w = oneTab.masterPlan.w; }
  if (oneTab.masterPlan.h) { h = oneTab.masterPlan.h; }
  return {w:w,h:h};
}

vidteq._venue360UI.prototype.loadMasterPlan = function(oneTab) {
	console.log("loadMasterPlan",oneTab);
  if (oneTab.masterPlan && Object.keys(oneTab.masterPlan).length) {
  } else {
    $('#'+this.ids.popupMap).remove();
    return;
  }
  
  var path = vidteq.cfg.custom360Images+vidteq.aD.urlId+"/";
  var mpSrc = path + oneTab.dirCode + "/"+ oneTab.masterPlan.imageName;
  if (oneTab.masterPlan.masterplanSrc) { // for edit mode
    mpSrc = oneTab.masterPlan.masterplanSrc;
    //mpSrc = path + oneTab.dirCode + "/"+"Elevation_map.gif";//oneTab.masterPlan.masterplanSrc;
  } else if(oneTab.masterPlan.mpImageName){
    mpSrc = path + oneTab.dirCode + "/"+ oneTab.masterPlan.mpImageName;
  }
  //var w = 1019;
  //var h = 374;
  //if (oneTab.masterPlan.w) { w = oneTab.masterPlan.w; }
  //if (oneTab.masterPlan.h) { h = oneTab.masterPlan.h; }
  var wh = this.getMasterPlanWH(oneTab);
  var w = wh.w;
  var h = wh.h;
  var cW = 380; // compressed Width
  var cH = parseInt(cW * h/w);  // aspect ratio
  if (w < cW) {
    cW = w;
    cH = h; 
  }
  var scale = cW/w;
  //~ image:path + oneTab.dirCode + "/thumb/thumb_" + oneTab.masterPlan.imageName
  //~ ,fullImage:path + oneTab.dirCode + "/"+ oneTab.masterPlan.imageName
  var that = this;
  if (!($('#'+this.ids.popupMap).length)) {
    var conId = this.ids.popupContact;
    if (this.directFs) { conId = this.ids.popupContact2; }
    if (this.venue360.fullView) { conId = this.ids.popupContact1; }
   $('#'+conId).append("<div id='"+this.ids.popupMap+"' class='popupMap noselect'><img id='"+this.ids.popMapImg+"' src='"+mpSrc+"' alt='Map' /><div id='"+this.ids.Map+"'  class='markerSpriteImage-wrapper'></div></div>");
    
    if (this.directFs) {
      $('#'+this.ids.popupMap).css({'top':'4px','left':'150px','width':'262px'});
    }
    if(this.venue360.options.isSkyView) {
      $('#'+this.ids.popupMap).css({'top':'4px','left':'10px','width':'262px'});
    }

    $('#'+this.ids.popMapImg).data('oneTab',oneTab);
    if (this.editor ) {
      $(function() {
         $( "#"+that.ids.compass).draggable();
      });
      //console.log($( "#"+that.ids.compass).draggable());
      $('#'+this.ids.popMapImg).click(function (e) {
        var oneTab = $(this).data('oneTab');      
        that.editor.clickedOnMasterPlan(e,oneTab);
      });
    }

    $('#'+this.ids.popMapImg).animate({
      //width: '380px'
      //,height: '144px'
      width: cW+'px'
      ,height: cH+'px'
    },{
      duration:1000
      ,step:function() {
        var w = $(this).width();
        var h = $(this).height();
        //var l = parseInt($(this).css('left'));
        // w += 2*l;
        $('#'+that.ids.popupMap).width(w);
        $('#'+that.ids.popupMap).height(h);
      },complete:function() {
        $('#'+that.ids.Map+' div').show();
        that.rarifyMarkers();
        //that.fillMarkerMap(oneTab,1/4.3);
        //that.showOnePanoImage(oneTab,oneThumb);
      }
    });
    //this.fillMarkerMap(oneTab,1/4.2); //to maintain the aspect ratio (1023/242)
    $('#'+this.ids.popMapImg).show();
    //$('.tinytooltip').remove();
  } else {

    // $('#'+this.ids.popMapImg).removeAttr('src');
    var oldThumbSrc = $('#'+this.ids.popMapImg).attr('src');
    if (mpSrc == oldThumbSrc) {
      this.fillMarkerMap(oneTab,scale);
      return; 
    }
    $('#'+this.ids.popMapImg).removeAttr('src');
    $('#'+this.ids.popMapImg).hide();
    $('#'+this.ids.popMapImg).attr('src',mpSrc);
    $('#'+this.ids.popMapImg).fadeIn({
      duration:1000
      ,complete:function() {
        $('#'+that.ids.Map+' div').show();
      }
    });
    $('#'+this.ids.popMapImg).data('oneTab',oneTab);
    //~ //$("#"+this.ids.popupMap+" :not(:first-child)").remove();
    if( this.venue360.renderMode == 'java' ) {
      $('#'+this.ids.viewer360).hide();
    }else {
      this.venue360.cleanUpTheScene();
    }
  }
  //$('#'+this.ids.vPopupTabs).html($('#vPopupTabsTemplate').tmpl({btnColor:btnColor,items:this.list}));
  //this.fillMarkerMap(oneTab,1/2.7);
  this.fillMarkerMap(oneTab,scale);
}

vidteq._venue360UI.prototype.prepareThumbsAndShow = function(oneTab) {
	console.log("prepareThumbsAndShow");
  if (this.commonProjIcon) {  
    var vPopProjLogo = vidteq.cfg.custom360Images+vidteq.aD.urlId+"/"+oneTab.dirCode+"/thumb/thumb_"+oneTab.dirCode+".png";
    $("[id^='"+this.domIds.projLogoBinding+"']").attr('src',vPopProjLogo);    
  }
  if (oneTab.thumbList) {
    this.prepareThumbList(oneTab);
  } else {
    this.prepareThumbList(oneTab);
  }
  if (oneTab.masterPlan) {
    this.loadMasterPlan(oneTab);
  } else {
    $('#'+this.ids.popupMap).remove();
  }
  $('#intro').hide();
  $('#'+this.ids.viewer+' canvas').show();  
  $('#'+this.ids.spriteBinding).show();

  this.prepareThumbSlider(oneTab);
  this.venue360.masterPlanShown = false;
  // TBD why above line?
}

vidteq._venue360UI.prototype.prepareThumbSlider = function(oneTab) {
	console.log("prepareThumbSlider");
  $('#'+this.ids.thumbList).empty();
  $('#'+this.ids.thumbs).html('<ul class="thumbList" id="'+this.ids.thumbList+'" style="width: 680px; height: 320px;"></ul>');
  var vPopupThumbsTemplate = 'vPopupThumbsTemplate';
  if (this.snappyMode) {
    vPopupThumbsTemplate = 'vPopupThumbsTemplate1';
  }
  var thumbsWithImage = [];
  for (var i in oneTab.thumbList) {
    if (oneTab.thumbList[i].image) {
      thumbsWithImage.push(oneTab.thumbList[i]);
    }
  }
  $('#'+vPopupThumbsTemplate).tmpl({items:thumbsWithImage}).appendTo("#"+this.ids.thumbList);
  var that = this;
  $('#'+this.ids.thumbList+' li a').each(function() { 
    var idx = parseInt($(this).attr('thumbIndex'));
    $(this).data('oneThumb',thumbsWithImage[idx]);
    //if (that.snappyMode) { } else {
      $(this).hover(function(){
        $('#vPopupThumbDesc_'+idx).html($(this).data('oneThumb').desc);
      },function(){
        $('#vPopupThumbDesc_'+idx).html('');
        //if (!$(this).hasClass('active')) {
        //  $('#vPopupThumbDesc_'+idx).html('');
        //}
      });
    //}
    $(this).click(function() {
      $('#'+that.ids.thumbList+' li a').each(function() {
        if (that.snappyMode) { } else {
          var idx = parseInt($(this).attr('thumbIndex'));
          $('#vPopupThumbDesc_'+idx).html('');
        }
        $(this).removeClass('active');
      });
      if (that.snappyMode) { } else {
        var idx = parseInt($(this).attr('thumbIndex'));
        $('#vPopupThumbDesc_'+idx).html($(this).data('oneThumb').desc);
      }
      $(this).addClass('active');
      that.clickedOnThumb(oneTab,$(this).data('oneThumb'));
    });
  });
  this.showHideThumbList(oneTab);
}

vidteq._venue360UI.prototype.showHideThumbList = function (oneTab) {
  if((this.venue360.options.isSkyView && oneTab.dirCode == 'Drone')) {
    $('.bindingThumbs').hide();
  } else {
    $('.bindingThumbs').show();
  }
}

vidteq._venue360UI.prototype.slyThumbSliderInit = function (idx) {
  document.getElementsByTagName('html')[0].className += ' ' +
  (~window.navigator.userAgent.indexOf('MSIE') ? 'ie' : 'no-ie');
  var $example = $('#'+this.ids.thumbImages);
  var $frame = $example.find('.frame'); //window.frr = $frame;
  if(typeof(Sly) != 'undefined') {
    this.sly = new Sly($frame, {
      horizontal: 1,
      itemNav: 'forceCentered',
      activateMiddle: 1,
      smart: 1,
      activateOn: 'mouseenter',
      mouseDragging: 1,
      touchDragging: 1,
      releaseSwing: 1,
      startAt: idx,
      scrollBar: $example.find('.scrollbar'),
      scrollBy: 1,
      pagesBar: $example.find('.pages'),
      activatePageOn: 'click',
      speed: 1200,
      moveBy: 600,
      elasticBounds: 1,
      dragHandle: 1,
      dynamicHandle: 1,
      clickBar: 1,
      minHandleSize: 50
    }).init();  
  }
}

vidteq._venue360UI.prototype.colorTheMarker = function(oneTab,oneThumb) {
  $('.markerSpriteImage').each(function() {
    var idx = parseInt($(this).attr('markerIndex'));
    if (oneThumb == oneTab.thumbList[idx]) {
      $(this).addClass('vSelected');
    } else {
      $(this).removeClass('vSelected');
    }
  });
}

vidteq._venue360UI.prototype.clickedOnThumb = function(oneTab,oneThumb) {
	console.log("clickedOnThumb");
  vidteq.utils.drapeSheer('buttonClickCurtain');
  //$('#'+this.domIds.bgCurtain).css({'z-index':800000});
  var that=this;
  this.colorTheMarker(oneTab,oneThumb);
  if (oneThumb.masterPlan) {
    //this.clickedOnThumbMasterPlan(oneTab,oneThumb);
    // master plan no longer present
  } else {
    this.clickedOnThumb360(oneTab,oneThumb);
  }
  $('#'+this.ids.spriteText).text(oneThumb.desc);
}

vidteq._venue360UI.prototype.fillMarkerMap = function(oneTab,scale) {
  $('#'+this.ids.Map).empty();
  for (var i in oneTab.items) {
    var oneI = oneTab.items[i];
    var x = parseInt(parseInt(oneI.marker[0])*scale);
    var y = parseInt(parseInt(oneI.marker[1])*scale);
    var idx = parseInt(i)+oneTab.thumbList.length-oneTab.items.length;
    var myThumb = oneTab.thumbList[idx];
    myThumb.compassPos = {x:x,y:y,scale:scale};
    //var xDelta = parseInt((parseInt(oneI.marker[0]))*scale);//+30
    //var yDelta = parseInt((parseInt(oneI.marker[1]))*scale);//+30
    //var cord = x + "," + y + "," + xDelta + "," + yDelta;
    var wAndH = 'width:'+34+"px;height:"+34+'px;';
    x -= 14;
    y -= 14;
    var leftAndTop = 'left:'+x+ "px;top:" + y+'px;';      
    // TBD conflict during merge - please check again
    //$('#Map').append("<div id='MarkerSpriteImg_"+i+"' class='markerSpriteImage '  style='display:inline;background-color:transparent;position:absolute;cursor:pointer;"+leftAndTop+wAndH+";z-index:300010;background-image:url("+vidteq.imgPath.vPopSprite+"); href='javascript:void(0);' markerIndex="+i+" />");
    $('#'+this.ids.Map).append("<div id='"+this.ids.MarkerSpriteImg+"-"+i+"' class='markerSpriteImage' style='"+leftAndTop+wAndH+";background-image:url("+this.imgPath.vPopSprite+"); href='javascript:void(0);' markerIndex='"+i+"' />");
  }
  var that = this;
  $('#'+this.ids.Map+' div').each(function() {
    that.attachEventsToMapMarker(this,oneTab);
    // that.editor.addedCompassCallback(oneThumb,this);
  });  
}

vidteq._venue360UI.prototype.attachEventsToMapMarker = function(button,oneTab) {
  var that = this; 
  //var idx = parseInt($(button).attr('markerIndex'))+1;
  var idx = parseInt($(button).attr('markerIndex'));
  $(button).data('oneThumb',oneTab.thumbList[idx]);
  //$(button).attr('title',$(button).data('oneThumb').desc);
  //$(button).tinytooltip({message:$(button).data('oneThumb').desc});
  $('#'+this.ids.popupMap+',#'+this.ids.viewer).hover(function(){
    that.venue360.isUserInteracting = false;
  });
  if(  $.fn.tinytooltip ) {
    $(button).each(function(e){    
      $(this).tinytooltip({message:$(this).data('oneThumb').desc});
    });
  }
  $(button).hover(function(e){
    that.venue360.isUserInteracting = false;
    //$('.tinytooltip').css('left',e.clientX);
    $(this).tinytooltip({message:$(this).data('oneThumb').desc});
    $('.tinytooltip').show();
    $('#'+that.ids.thumbList+' li a').each(function() {
      var myIdx = parseInt($(this).attr('thumbIndex'));
      if (idx == myIdx) {
        $(this).addClass('hoverActive');
        if (that.snappyMode) { } else {
          $('#vPopupThumbDesc_'+myIdx).html($(this).data('oneThumb').desc);  
        }
      }
    });
  },function() {
    //$('.tinytooltip').data('tinyactive',null);
    //$('.tinytooltip').remove();
    $('#'+that.ids.thumbList+' li a').each(function() {
      $(this).removeClass('hoverActive');
      if (that.snappyMode) { } else {
        var myIdx = parseInt($(this).attr('thumbIndex'));
        if (!($(this).hasClass('active'))) {
          $('#vPopupThumbDesc_'+myIdx).html('');
        }
      }
    });
  });
  $(button).click(function() {
    //$('#'+that.ids.compass).remove();
    // TBD following comment has problem recheck 
    //$('#'+that.ids.spriteText).text($(this).data('oneThumb').desc);
    /*
    $('#'+that.ids.thumbList+' li a').each(function() {
      $(this).removeClass('hoverActive');
      var myIdx = parseInt($(this).attr('thumbIndex'));
      $(this).removeClass('active');
      if (that.snappyMode) { } else {
        $('#vPopupThumbDesc_'+myIdx).html('');
      }
      if (idx == myIdx) {
        if (that.sly) { that.sly.activate(myIdx); }
        $(this).addClass('active');
        if (that.snappyMode) { } else {
          $('#vPopupThumbDesc_'+myIdx).html($(this).data('oneThumb').desc);
        }
      }
    }); */
    that.clickedOnThumb(oneTab,$(this).data('oneThumb'));
/*    if (that.editor) {
      that.editor.callbackAttachEventsToMapMarker(oneTab,$(this).data('oneThumb'));
    } */
  });
  $(button).hover(function(e) {
    $(this).css({'background-image':'url('+that.imgPath.vPopSprite+')','background-position':'-194px -229px'});
  },function() {
    $(this).css({'background-image':'url('+that.imgPath.vPopSprite+')','background-position':'-150px -229px'});
  });
 
}

vidteq._venue360UI.prototype.rarifyMarkers = function(oneThumb) {
  var rarifyH = {};
  var that = this;
  $('#'+this.ids.Map+' div').each(function () {
    //if ($(this).attr('id') === that.ids.compass ) { return; }
    var left = parseInt(parseInt($(this).css('left'))/34);
    var top = parseInt(parseInt($(this).css('top'))/34);
    $(this).hide();
    if (!(left in rarifyH)) { rarifyH[left] = {}; }
    if (!(top in rarifyH[left])) { rarifyH[left][top] = []; }
    rarifyH[left][top].push(this);
  });
  for (var i in rarifyH) {
    for (var j in rarifyH[i]) {
      //var rand = Math.round(Math.random()*rarifyH[i][j].length);
      var rand = parseInt(Math.random()*rarifyH[i][j].length);
      $(rarifyH[i][j][rand]).show();
    }
  }
}

//vidteq._venue360UI.prototype.rarifyMarkers = function(oneThumb) {
//  var rarifyH = {};
//  $('#Map div').each(function () {
//    if ($(this).attr('id') == 'compass') { return; }
//    var left = parseInt(parseInt($(this).css('left'))/34);
//    var top = parseInt(parseInt($(this).css('top'))/34);
//    $(this).hide();
//    if (!(left in rarifyH)) { rarifyH[left] = {}; }
//    if (!(top in rarifyH[left])) { rarifyH[left][top] = []; }
//    rarifyH[left][top].push(this);
//  });
//  for (var i in rarifyH) {
//    for (var j in rarifyH[i]) {
//      //var rand = Math.round(Math.random()*rarifyH[i][j].length);
//      var rand = parseInt(Math.random()*rarifyH[i][j].length);
//      $(rarifyH[i][j][rand]).show();
//    }
//  }
//}

vidteq._venue360UI.prototype.showOnePanoImage = function(oneTab,oneThumb) {
	console.log("sopi");
  if (this.venue360.renderMode == 'java') {
    $('#'+this.ids.viewer360).show();
    try {
      document.viewer360.newPanoFromList(oneThumb.panoIdx);
    } catch (evt) { }
  } else {
     //if (!this.gui.stickyKey || !this.gui.stickyKey[80]) { // not alt p
       var that = this;
       
       this.venue360.cleanUpTheScene();
       this.addProgressbar();
       this.addCompass( oneThumb, function() {
         that.rarifyMarkers( oneThumb );
       });
       //this.initSceneNew(40,100);
       
       // moved from drawTiles
       var fov = parseInt(oneThumb.fov[1])/2;
       var minFov = parseInt(oneThumb.fov[0])/2;
       var maxFov = parseInt(oneThumb.fov[2])/2;
       var far = 100;
       //fov,far,minFov,maxFov,near
       this.venue360.updateScene(fov,far,minFov,maxFov);
       // moved from drawTiles end
       if (oneThumb.ptvFile) {
				 console.log("sopi ptvfile");
         var reader = new FileReader();
         reader.onload = function (e) {
           var ptv = {};
           console.log(e);
           that.venue360.parsePtvReEntrant(e.target.result,ptv);
           that.venue360.drawTilesReEntrant(ptv,oneThumb,oneTab);
           that.venue360.animate();
         };
         reader.readAsArrayBuffer(oneThumb.ptvFile);
         if(this.editor){
           //this.editor.attachEventStoreOneItem(oneTab,oneThumb);
           //this.editor.attachEventsToMarkersForm(oneTab,oneThumb,oneTab.items[oneThumb.idx]);
           this.editor.attachEventDeleteMarkers(oneTab,oneThumb);
           $('#save360Marker').data("oneTab",oneTab);
           $('#deleteMarker').data("oneThumb",oneThumb);
           //$('#addNewMarkerTemplate').tmpl({desc:""}).appendTo("#popupCreate");
         }
       } else {
				 console.log("sopi fetchptv");
         this.venue360.fetchPtv(oneThumb.fullImage,function(resp,ptv) {
           //that.drawTiles(ptv,oneThumb,oneTab);
           console.log(ptv);
           that.venue360.drawTilesReEntrant(ptv,oneThumb,oneTab);
           that.venue360.animate();
         });
       }

       return;
     //}
     //if(this.renderMode == 'canvas'){
     //  var pathStr= oneThumb.fullImage.substr(0,oneThumb.fullImage.lastIndexOf('.'));
     //  var path = pathStr.substr(0,pathStr.lastIndexOf('.'));
     //  this.renderFullImage(path);
     //} else if(this.renderMode == 'webGl'){
     //  var pathStr= oneThumb.fullImage.substr(0,oneThumb.fullImage.lastIndexOf('.'));
     //  var path = pathStr.substr(0,pathStr.lastIndexOf('.'));
     //  var newPath = path.substr(0,path.lastIndexOf('/'));
     //  var image = path.substr(newPath.length,path.length);
     //  var finalPath = newPath+"/tiles"+image;
     //  this.renderFullImage(finalPath);
     //} 
  }
}

vidteq._venue360UI.prototype.clickedOnThumb360 = function(oneTab,oneThumb) {
	console.log("clickedOnThumb360");
  if (this.venue360.renderMode != 'java') {
    $("#iProgress").remove();
    $("#oProgress").remove();
    $("#"+this.ids.compass).remove();
    //this.venue360.autoPan=false;
    //~ $('#'+this.ids.popupFS).hide();
     $('#'+this.ids.popupFS).show();
  }else {
    $('#'+this.ids.popupFS).show();
  }
  
  //If manually paused, new click should always autopan
  if( !this.venue360.autoPan ) {
    //TBD: RISKY to trigger on class element instead of ID
    $('.popupRotatePos').trigger("click");
  }
  this.curThumb=oneThumb;
  //var oneItem=oneTab.items[oneThumb.idx];
  //if(oneItem.markDesc && oneItem.markDesc.length>0){
  //  for(var i=0;i<oneItem.markDesc.length;i++){
  //    oneThumb.markerDesc[i]=oneItem.markDesc[i];
  //  }
  //}
  if (this.venue360.masterPlanShown) {
    var that = this;
    $('#'+this.ids.popMapImg).attr("src", "images/venuesmallmap.gif");
    $('#'+this.ids.popMapImg).css('border','0px');
    $('#'+this.ids.popupMap).css('background','none');
    //$('<div id="smallImg" style="width:157px;height:142px;border:1px solid white;left:125px;position:absolute;top:1px;"><img src="'+imagePath+'" width="157px;"></div>').insertAfter('#'+this.ids.popMapImg);
    // $('#'+this.ids.popupMap).clone('#smallImg');
    // smallImg=document.getElementById(this.ids.popMapImg)
    // $('#smalImg').show();
    $('.tinytooltip').remove();
    $('#'+this.ids.popMapImg).animate({
        width: '380px'
       ,height: '144px'
       ,left: '-120px'
    },{
      duration:1000
      ,step:function() {
        var w = $(this).width();
        var h = $(this).height();
        var l = parseInt($(this).css('left'));
        w += 2*l;
        var ww = parseInt(40);
        var hh = parseInt(5);
        $('#'+that.ids.popupMap).width(w+ww);
        $('#'+that.ids.popupMap).height(h+hh);
      }
      ,complete:function() {
      var imagePath= $('#'+that.ids.popMapImg).attr('src');
      //$('#smallImg').css({'background-image':'url('+imagePath+')','background-position':'10px 10px'});
      that.fillMarkerMap(oneTab,1/2.7);
      //$('#'+that.ids.popupMap).hide();
      //$('#'+that.ids.popupMap).remove();
      $('#'+that.ids.popMapImg).remove();
      $('#smallImg').show();
      that.showOnePanoImage(oneTab,oneThumb);
    }});
    this.venue360.masterPlanShown = false;
  } else {
    this.showOnePanoImage(oneTab,oneThumb);
  }
}

vidteq._venue360UI.prototype.centerPopup =function() {
  var windowWidth = document.documentElement.clientWidth;
  var windowHeight = document.documentElement.clientHeight;
  var popupHeight = $("#"+this.ids.popupContact).height();
  var popupWidth = $("#"+this.ids.popupContact).width();
  $("#"+this.ids.popupContact).css({
    "border":"2px solid #c2c2c2",
    "background-color":"#d1cbb1",
    "position": "absolute",
    "top": windowHeight/2-popupHeight/2,
    "left": windowWidth/2-popupWidth/2
  });
  $("#"+this.ids.backgroundPopup).css({
    "height": windowHeight
  });
}

vidteq._venue360UI.prototype.enablePopup =function(){
  var that=this;
  if (this.venue360.popupStatus) { return; }
  $("#"+this.ids.backgroundPopup).css({
    "opacity": "1"
  });
  $("#"+this.ids.backgroundPopup).fadeIn("slow");
  $("#"+this.ids.popupContact).fadeIn("slow");
  this.venue360.popupStatus = true;
  var that = this;
  var checkFunc = function() { return that.loadFinish; };
  var fireFunc = function() {
    setTimeout(function() {
      that.popupSkip();
    }, (that.flashIntroTime * 1000));
  }
 
  var t = new vidteq.utils.waitAndFire(checkFunc,fireFunc,undefined,{maxIter:50});
}

vidteq._venue360UI.prototype.loadFinished = function() {
  this.loadFinish = true;
}

vidteq._venue360UI.prototype.attachEvents = function() {
  var that = this;
  $("#"+this.ids.popupFS).click(function() {
    that.invokeFullScreen();
  });
  $('#'+this.ids.closeVPopHelp).click(function() {
    that.closeVPopHelp();
  });
  this.popupRotatePos(".popupRotatePos");
  $('#'+this.ids.popupHome).click(function() {
    if (that.venue360.autoShow) { that.closeVPop(); return; }
    if (that.venue360.renderMode != 'java') {
      that.venue360.cleanUpTheScene();
    } 
    that.closeVPopHome();
    that.venue360.reInit();
  });
  $('#'+this.ids.popupZI).mouseup(function() {
    if (that.venue360.renderMode == 'java') {
      document.viewer360.ZoomIn();
    } else {
      if (that.venue360.fov>that.venue360.minFov) { 
        that.venue360.fov-=10;
      }
      that.venue360.rerender();
    }
  });
  $('#'+this.ids.popupZO).mouseup(function() {
    if (that.venue360.renderMode == 'java') {
      document.viewer360.ZoomOut();
    } else {
      if (that.venue360.fov<that.venue360.maxFov) { 
        that.venue360.fov += 10;
      }
      that.venue360.rerender();
    }
  });
  $('#'+this.ids.movUp).mouseup(function(){
    if (that.venue360.renderMode == 'java') {
      document.viewer360.stopAutoPan();
    } else {
      that.venue360.lat += 0.5;
    }
  }).mousedown(function(){
    if (that.venue360.renderMode == 'java') {
      document.viewer360.startAutoPan(0,0.15,1);
    }
  });
  $('#'+this.ids.movDown).mouseup(function(){
    if (that.venue360.renderMode == 'java') {
      document.viewer360.stopAutoPan();
    } else {
      that.venue360.lat -= 0.5;
    }
  }).mousedown(function(){
    if (that.venue360.renderMode == 'java') {
      document.viewer360.startAutoPan(0,-0.15,1);
    }
  });
  $('#'+this.ids.movLeft).mouseup(function(){
    if (that.venue360.renderMode == 'java') {
      document.viewer360.stopAutoPan();
    } else {
      that.venue360.lon -= 4;
    }
  }).mousedown(function(){
    if (that.venue360.renderMode == 'java') {
      document.viewer360.startAutoPan(-0.15,0,1);
    }
  });
  $('#'+this.ids.movRight).mouseup(function(){
    if (that.venue360.renderMode == 'java') {
      document.viewer360.stopAutoPan( );
    } else {
      that.venue360.lon += 4;
    }
  }).mousedown(function(){
    if (that.venue360.renderMode == 'java') {
      document.viewer360.startAutoPan(0.15,0,1);
    }
  });
  $('#'+this.ids.popupHelp).click(function() {
    that.showPopupHelp(that.ids.popupContact);
  });
  $("#"+this.ids.popupContactClose).click(function(){
    if(that.venue360.renderMode == 'java') { } else {
     }
    that.closeVPop(); 
  });
  $("#"+this.ids.backgroundPopup).click(function(){
    that.closeVPop();
  });
}

vidteq._venue360UI.prototype.closeVPop = function() {
  //this.gui.popupStatus = 1; // TBD not the right thing to do
  // TBD done here because multipage also uses same named popup
  this.venue360.cleanUpTheScene();
  this.venue360.popupStatus = false;
  $("#"+this.ids.popupContact).fadeOut("slow");
  $("#"+this.ids.popupContact).remove();
  var that = this;
  setTimeout(function() { 
    $("#"+that.ids.backgroundPopup).fadeOut("slow");
    $("#"+that.ids.backgroundPopup).remove();
  },1000);
  //this.gui.closeVPop();
  this.gui.loadMultiFrontPage();
}

vidteq._venue360UI.prototype.closeVPopHelp = function() {
  if (this.venue360.isChrome || this.venue360.isIe){ $('#popupHelpFrame').remove(); }
  $('#'+this.ids.popupHelpImage).hide();
  $('#'+this.ids.popupHelpImage1).hide();
  $('#'+this.ids.popupHelpImage2).hide();
}

vidteq._venue360UI.prototype.closeVPopHome = function() {
  //this.gui.closeVPop();
  this.venue360.popupStatus = false;
  $("#"+this.ids.popupContact).fadeOut("slow");
  $("#"+this.ids.popupContact).remove();
}

vidteq._venue360UI.prototype.invokeFullScreen = function() {
  this.fullView = true;
  var that=this;
  var vPopupFullScreenTemplate ='vPopupFullScreenTemplate';
  if(this.snappyMode) {
    vPopupFullScreenTemplate = 'vPopupFullScreenTemplate1';
  }
  $('#'+ vPopupFullScreenTemplate).tmpl(this.imgPath).appendTo("body");
  var windowWidth = document.documentElement.clientWidth;
  var windowHeight = document.documentElement.clientHeight;
  var bgColor = "#a6ce39";
  if (vidteq.aD.config.venueBtnColor) { bgColor = vidteq.aD.config.venueBtnColor; }
  $("#"+this.ids.popupContact1).css({
    "border":"3px solid #575757",
    //~ "background-color":bgColor,
    "position": "absolute",
    'top' : '0px',
    "left": "0px",
    "width": windowWidth +"px",
    "height":windowHeight+"px"
  });
  var innerHtml = $('#'+this.ids.viewer).html().replace(/viewer360/g,"viewer360Fs");
  innerHtml = innerHtml.replace("1022",(windowWidth));
  innerHtml = innerHtml.replace("380",(windowHeight));
  innerHtml = innerHtml.replace("intro","intro1");
  if(this.venue360.renderMode != 'java'){
    innerHtml = innerHtml.replace('canvas',"div id="+this.ids.viewer1);
    innerHtml = innerHtml.replace('/canvas','/div');
  }
  $('#'+this.ids.popupContact1).append(innerHtml); 
  $('#intro1').remove();
  //$("#viewer360Fs").attr('width',(windowWidth-40)+"px");
  //$("#viewer360Fs").attr('height',(windowHeight-85)+"px");
  $("#viewer360Fs").css({
    "position":"absolute",
    "top":"42px",
    "left":"0px",
    "width": (windowWidth)+"px",
    "height": (windowHeight - 46)+"px"
   });
  //$("#"+this.ids.popupContact1).corner();
  $('#'+this.ids.popupContact1).draggable({ handle: '#fsTopStrip' });
  var that = this;
  var starterFunc = function() {
    $('#'+this.ids.popupContact1).show();
    if (that.venue360.renderMode == 'java') {
      try {
        document.viewer360Fs.newPanoFromList(that.venue360.popCount);
      } catch (evt) { }
    } else {
      //that.renderer.setSize(windowWidth,windowHeight-42);
      that.venue360.renderer.setSize(windowWidth,windowHeight);
      that.venue360.autoPan = true; 
      document.getElementById(this.ids.viewer1).appendChild( that.venue360.renderer.domElement);
    }
  };
  if (this.venue360.isIe){
    setTimeout(function() {
      starterFunc();
    },2000); 
  } else if(this.venue360.isChrome) { 
    $("#"+this.ids.popupContact1).show();
    setTimeout(function() {
      starterFunc();
    },2000); 
  } else {
    starterFunc();
  }
  $('#viewer360Fs').mousewheel(function(event, delta, deltaX, deltaY) {
    if(delta >0 && ((document.viewer360Fs.hfov_min+2) < document.viewer360Fs.fov())) document.viewer360Fs.ZoomIn();
    if(delta <0 && ((document.viewer360Fs.hfov_max-2) > document.viewer360Fs.fov())) document.viewer360Fs.ZoomOut();
  });
  this.attachFsEvents();
  // TBD yet to be done
  //this.loadMasterPlan(oneTab);
  return 1;
}

vidteq._venue360UI.prototype.closeFs = function() {
  var options = this.venue360.options || {};
  //TBD: if both options.closeFs and closeFs functionality required
  if(this.venue360.options.isSkyView) { delete this.venue360.options.isSkyView; }
  //TBD: enmergency fix
  if( $("#"+this.domIds.bgCurtain).length > 0 ) {
    $("#"+this.domIds.bgCurtain).css({"z-index":-1});
  }
  if( options.closeFs && typeof options.closeFs === "function" ) {
    options.closeFs();
    return true;
  }
  if('homescreen' in vidteq.gui) {
    window.parent.closeVPopup();
    return;
  }
  if( this.directFs ) {
    this.venue360.cleanUpTheScene();
    $("#"+this.ids.popupContact2).fadeOut("slow");
    $("#"+this.ids.popupContact2).remove();
    return;
  }
  $("#"+this.ids.popupContactClose1).click();
  if( this.venue360.autoShow ) {
    this.closeVPop();
    return;
  }
  $('#'+this.ids.popupHome).click();
  $('#'+this.ids.popupContact).show();
}

vidteq._venue360UI.prototype.attachFsEvents = function() {
  var that=this;
  $('#'+this.ids.popupRotateFMine).click(function() {
    if(that.adhocRotation) {
      that.adhocRotation = false;
    }else {
      that.adhocRotation = true;
    }
  });
  this.popupRotatePos(".popupRotatePos");
  $('#'+this.ids.closeVPopHelp).click(function()  {
    that.closeVPopHelp(); 
  });
  
  $('#'+this.ids.popupContactClose).click(function() {
    that.closeFs();
  });
  
  $('#'+this.ids.popupHomeF).click(function() {
    that.closeFs();
  });
  $('#'+this.ids.popupZIF).click(function() {
    if (that.venue360.renderMode == 'java') {
     document.viewer360Fs.ZoomIn();
    } else {
      if (that.venue360.fov>that.venue360.minFov) { 
        that.venue360.fov-=10;
      }
      that.venue360.rerender();
    }
  });
  $('#'+this.ids.popupZOF).click(function() {
    if(that.venue360.renderMode == 'java') {
      document.viewer360Fs.ZoomIn();
    } else {
      if (that.venue360.fov<that.venue360.maxFov) { 
        that.venue360.fov+=10;
      }

      that.venue360.rerender();
    }
  });
  $('#'+this.ids.movUpF).mouseup(function(){
    if (that.venue360.renderMode == 'java') {
      document.viewer360Fs.stopAutoPan();
    } else {
      that.venue360.lat += 0.5;
    }
  }).mousedown(function(){
    if (that.venue360.renderMode == 'java')
      document.viewer360Fs.startAutoPan(0,0.15,1);
  });
  $('#'+this.ids.movDownF).mouseup(function(){
    if (that.venue360.renderMode == 'java') {
      document.viewer360Fs.stopAutoPan();
    } else {
      that.venue360.lat -= 0.5;
    }
  }).mousedown(function(){
    if (that.venue360.renderMode == 'java') {
      document.viewer360Fs.startAutoPan(0,-0.15,1);
    }
  });
  $('#'+this.ids.movLeftF).mouseup(function(){
    if (that.venue360.renderMode == 'java') {
      document.viewer360Fs.stopAutoPan();
    } else {
      that.venue360.lon -= 4;
    }
  }).mousedown(function(){
    if (that.venue360.renderMode == 'java') {
      document.viewer360Fs.startAutoPan(-0.15,0,1);
    }
  });
  $('#'+this.ids.movRightF).mouseup(function(){
    if (that.venue360.renderMode == 'java') {
      document.viewer360Fs.stopAutoPan( );
    } else {
      that.venue360.lon += 4;
    }
  }).mousedown(function(){
    if (that.venue360.renderMode == 'java') {
      document.viewer360Fs.startAutoPan(0.15,0,1);
    }
  });
  $("#"+this.ids.popupContactClose1).click(function()  {
    $("#"+that.ids.popupContact1).hide();
    $("#"+that.ids.popupContact1).remove();
    if (that.venue360.renderMode == 'java') { } else {
      that.venue360.renderer.setSize($('#'+this.ids.viewer).width(),$('#'+this.ids.viewer).height());
      that.venue360.autoPan = true;
      document.getElementById(this.ids.viewer).appendChild(that.venue360.renderer.domElement);
      that.fullView = false;
    }
  });
  $('#'+this.ids.popupHelpF).click(function() {
    var id = that.ids.popupContact1;
    if (that.directFs) { id = that.ids.popupContact2; }
    that.showPopupHelp(id);
  });
  $('#'+this.ids.popupContact2).mousedown(function() {
    if(that.directFs) {
      $('#'+that.ids.popupContact2).css('cursor','-moz-grabbing');
    }
  });
  $('#'+this.ids.popupContact2).mouseup(function() {
    if(that.directFs) {
      $('#'+that.ids.popupContact2).css('cursor','-moz-grab');
    }
  });
}

vidteq._venue360UI.prototype.popupSkip = function() {
  if ($('#'+this.ids.intro).is(":visible")) {
    $('#'+this.ids.intro).hide();
    $('#'+this.ids.vPopupTabs+' li a')[0].click();
     //if (this.renderMode == 'java') {
     //  $('#'+this.ids.viewer360).show();
     //  $('#'+this.ids.popupFS).show();
     //}else {
     //    $('#'+this.ids.vPopupTabs+' li a')[0].click();
     //}
  }
} 


vidteq._venue360UI.prototype.showPopupHelp = function(targetId) {
  var that = this;
  if (this.venue360.isChrome || this.venue360.isIe){ 
    var windowWidth = document.documentElement.clientWidth / 2.7 + 'px';
    $('#'+targetId).append("<iframe id='popupHelpFrame' frameborder=0 style='border:0px;padding:0px;margin:0px;position:absolute;left:"+windowWidth+";top:150px;width:829px; height: 159px;z-index:300050;background-color:transparent;overflow:hidden;'></iframe>");
    var img = this.imgPath.vPopHelpImage;
    if(this.directFs) {   img = this.imgPath.vPopDirectFsHelpImage; }
    setTimeout(function(){
      var myFuncName = 'vPopFunc_'+Math.round(Math.random()*100000);
      window[myFuncName] = function() {
        that.closeVPopHelp();
        delete window[myFuncName];
      };
      $('#popupHelpFrame').contents().find("body").css({overflow:'hidden'});
      if (targetId == '') { img = this.imgPath.vPopDirectFsHelpImage; }
      $('#popupHelpFrame').contents().find("body").append("<img id='"+that.ids.popupHelpImage2+"' src='"+img+"' alt='Help' style='border:0px;background:white;z-index:300051;position:absolute;left:0px;top:0px;padding:0px;overflow:hidden;' useMap='#"+that.ids.helpMap+"' /><map id='"+that.ids.helpMap+"' name='"+that.ids.helpMap+"'><area id='closeHelp1' shape='rect' coords='325,7,354,25' href='javascript:window.parent."+myFuncName+"();'/></map>");
    },1000);
    return;
  }
  if (targetId == this.ids.popupContact) {
    $('#'+this.ids.popupHelpImage).show();
  }
  if (targetId == this.ids.popupContact1) {
    $('#'+this.ids.popupHelpImage1).show();
  }
  if (targetId == this.ids.popupContact2) {
    $('#'+this.ids.popupHelpImage2).show();
  }
  var windowWidth = document.documentElement.clientWidth;
  $('#'+this.ids.popupHelpImage2).css({
   left : windowWidth/2.7 + 'px'
  });
}

vidteq._venue360UI.prototype.popupRotatePos = function( id ) {
  var that = this;
  var cameraControlsOptions = ((this.venue360.options || {}).cameraConfig || {}).cameraControlsOptions || {};
  $('#'+this.ids.popupRotateF).click(function() {
    $(this).find('div').toggleClass('popupPause');
    var isPaused = $(this).find('div').hasClass('popupPause');
    if( that.venue360.cameraControls ) {
      if( isPaused ) {
        that.venue360.cameraControls.autoRotate = false;
      }else {
        that.venue360.cameraControls.autoRotate = true;
      }
    }else {
      if (that.venue360.renderMode == 'java') {
        document.viewer360Fs.startAutoPan(0.15,0,1);
      }
      if( isPaused ) {
        that.venue360.autoPan = false;
        that.venue360.autoPanRefTime = null;
      }else {
        that.venue360.autoPan = true;
      }
    }
  });
}

vidteq._venue360UI.prototype.documentMouseDown = function(e) {
  //this.addPauseClass();
  $('.popupRotatePos').addClass('popupPause');
}

vidteq._venue360UI.prototype.addPauseClass = function() {
  $('.popupRotatePos').addClass('popupPause');
}

vidteq._venue360UI.prototype.removePauseClass = function() {
  $('.popupRotatePos').removeClass('popupPause');
}

//vidteq._venue360UI.prototype.markerPopup = function(event,id,oneTab,oneItem) {
//  //console.log('inside markerpopup');
//  //console.log('venue360UI--inside markerPopup',parseInt($(id).attr('markerIndex')));
//  console.log('venue360UI--inside markerPopup oneTab ',oneTab);
//  console.log('venue360UI--inside markerPopup oneItem ',oneItem);
//  console.log('venue360UI--inside markerPopup oneTab attr ',$(id).attr('oneTab'));
//  var markerClick = parseInt($(id).attr('markerClick'));
//  //var oneTab = parseInt($(id).attr('oneTab'));
//  var idx = parseInt($(id).attr('markerIndex'));
//  var markerIndex= $(id).data('oneMarker',this.list[idx]);
//  //console.log('venue360UI--id is', $(id).data('oneMarker',this.list[idx]));
//  var titleDesc = $('#masterMarkerTitle').val();
//  var ptvFile = $("#uploadmarkerPtv").val();
//  oneItem.title = title;
//  oneItem.ptvImg = ptvFile;
//  oneItem.fov = [
//    $('#markerMinFov').val()
//    ,$('#markerMaxFov').val()
//    ,$('#markerFov').val()
//  ];
//  $('#deleteMasterMarker').data('markerId',markerIndex);
//  $('#masterMarkerCloseButton').data('markerdeleteId',markerIndex);
//  vidteq.utils.drapeSheer('addMarkerCurtain');
//  $('#bgCurtain').css({'z-index':800000});
//  $('#popupCreate').css({'z-index':800001});
//  $('#uploadMasterMarkerImage').closest('form').find("input[type=text], textarea").val("");
//  console.log(this.list);
//  console.log($(id).attr('markerindex'));
//  $('#saveMasterPlanMarker').data('markerPopup',oneTab);
//  $('#addNewMarkerDiv').hide();
//  $('#addNewPtv').hide();
//  $('#addNewMp').hide();
//  $('#masterplanMarkers').remove();
//  var toShowMarkerDetail = {
//   title:oneItem.title
//   ,fov:oneItem.fov
//   ,ptvImg:oneItem.ptvImg
//  };
//  //$('#addNewMarkerTemplate').tmpl(toShowMarkerDetail).appendTo("#popupCreate");
//  //$('#masterplanMarkers').show();
//  $('#masterplanMarkersTemplate').tmpl(toShowMarkerDetail).appendTo('#popupCreate');
//  $('#deleteMasterMarker').attr('disabled',true);
//  $('#popupCreate').show();
//  //if(this.venue360.renderMode != 'java') {
//  //  this.venue360.cleanUpTheScene();
//  //} 
//  var that = this;
//  $("#saveMasterPlanMarker").on("click",function() {
//    var markerpopId = $(this).data('oneTab');
//    var id = $(markerpopId).attr('id');
//    console.log('venue360UI--inside marker save click');
//    console.log('venue360UI--onetab ',oneTab);
//    console.log('venue360UI--oneItem ',oneItem);
//    that.savemasterPopup(oneTab,oneItem);
//  });  
//  $('#masterMarkerCloseButton').click(function() {
//    that.closeMasterMarker();
//    var markerDom = $(this).data('markerdeleteId');
//    var id = $(markerDom).attr('id');
//    $("#"+id).remove();
//  });
//}

vidteq._venue360UI.prototype.updateCompass = function(lon,lat) {
  $('#'+this.ids.compassImg).css({
    'transform':'rotate('+lon+'deg)'
    ,'-ms-transform':'rotate('+lon+'deg)'
    ,'-webkit-transform':'rotate('+lon+'deg)'
  });
}

vidteq._venue360UI.prototype.addCompass = function(oneThumb,callback) {
  if( !oneThumb.compassPos ) { return; } // dont bother
  var x = oneThumb.compassPos.x - 25 + 7;
  var y = oneThumb.compassPos.y - 25 + 8;
  $("<div id='"+this.ids.compass+"' class='compass dragme group1' style='left:"+x+"px;top:"+y+"px;'><img id='"+this.ids.compassImg+"' src='"+this.imgPath.vPopCompass+"' /></div>").appendTo($("#"+this.ids.popupMap));
  $('#'+this.ids.compass).show();
  $('#'+this.ids.compass).tinytooltip({message:oneThumb.desc});

  if( callback && typeof callback === 'function' ) { // needed for editor
    callback(oneThumb);
  }
  if (this.editor) {
    this.editor.addedCompassCallback(oneThumb,this.curTab.items[oneThumb.idx],this.curTab);
  }
}

vidteq._venue360UI.prototype.addProgressbar = function() {
  var id = this.ids.viewer;
  $("<div id='oProgress' style='width:300px;border:2px solid #ddd;border-radius:5px;overflow:hidden;display:inline-block;margin:0px 10px 5px 5px;vertical-align:top;position:absolute;display:none;'></div>").appendTo($("#"+id));
  $("<div id='iProgress' style='display:none;color:#fff;text-align:right;height:25px;width:0px;background-color:#433535;border-radius:3px;'></div>").appendTo($("#oProgress"));
  $("#oProgress").css({top:$("#"+id).height()/2,left:$("#"+id).width()/2-150});
  $("#oProgress").show();
  $("#iProgress").show();
}


