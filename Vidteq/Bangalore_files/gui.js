if (typeof(vidteq) == 'undefined') { vidteq = {}; }
vidteq._gui = function(options) {
  options = options || {};
  var _guiOptions = {
    //TBD: segregate and group ids based on core functionalities
    ids:{
      starttextbox:'starttextbox'
      ,sugdivstart:'sugdivstart'
      ,endtextbox:'endtextbox'
      ,sugdivend:'sugdivend'
      ,routeSummary:'routeSummary'
      ,divRoutePouchPop:'divRoutePouchPop'
      ,routePouchDiv:'routePouchDiv'
      ,directionSummary:'directionSummary'
      ,videoSummary:'videoSummary'
      ,text_holder:'text_holder'
      ,myLocationButton:'myLocationButton'
      ,handheld_routepouch_div:'handheld_routepouch_div'
      ,backSideMap:'backSideMap'
      ,bizdisplay:'bizdisplay'
      ,goFromHere:'goFromHere'
      ,locadiv_your_loc:'locadiv_your_loc'
      ,landmarks:'landmarks'
      ,landmarksCont:'landmarksCont'
      ,swaptd:'swaptd'
      ,locationtab:'locationtab'
      ,routetab:'routetab'
      ,helpdiv:'helpdiv'
      ,GoVid:'GoVid'
      ,nearby:'nearby'
      ,nearbyCont:'nearbyCont'
      ,float_input_block:'float_input_block'
      ,'ul-top-panel':'ul-top-panel'
      ,rightContainer:'rightContainer'
      ,main:'main'
      ,customMultiPageFrame:'customMultiPageFrame'
      ,'top-panel-div':'top-panel-div'
      ,'home-link':'home-link'
      ,poweredBy:'poweredBy'
      ,base:'base'
      ,venue:'venue'
      ,'3dmap':'3dmap'
      ,map:'map'
      ,mapContainer:'mapContainer'
      ,dsc:'dsc'
      ,divLoading:'divLoading'
      ,'close-float-input':'close-float-input'
      ,gearLoader:'gearLoader'
      ,'input-div':'input-div'
      ,'div_driving-dir-video-link':'div_driving-dir-video-link'
      ,float_input_block_moved:'float_input_block_moved'
      ,'driving-dir-video-link':'driving-dir-video-link'
      ,initialRightDiv:'initialRightDiv'
      ,videoRightDiv:'videoRightDiv'
      ,'div_landmarkroutes':'div_landmarkroutes'
      ,frontCurtainContent:'frontCurtainContent'
      ,'backgroundFrontPage':'backgroundFrontPage'
      ,collapse:'collapse'
      ,neighbourhood3D:'neighbourhood3D'
      ,invokeMapView:'invokeMapView'
      ,fvtui:{
        fvtDiv:'fvtDiv'
        ,videoPlayerDiv:'VideoPlayerDiv'
        ,locadiv:'locadiv'
        ,comtab:'comtab'
        ,routediv:'routediv'
        ,directionsDiv:'directions_div'
        ,videoPopup:'videoPopup'
        ,dynamicDiv:'dynamicDiv'
        ,fvtContainer:'fvtContainer'
        ,fvtContainerLabel:'fvtContainerLabel'
        //,divider:'divider'
        ,animateOn:'VideoPlayerDiv'
      }
    }
    ,uiclasses:undefined
    ,name:'vidteq'
    ,stopStartVideoDragPan:false
    ,tIn:true//false for nemo
    ,topBarUI:false
    ,sideBarUI:false
    ,multiFrontPage:false
    ,comtabTopBarUI:false
    ,comtabNoDisplay:false
    ,expressInterest:false
    ,mode:''
    ,defaultLoc:'Business or Address Locator'
    ,titleLoc:'Enter your address'
    ,defaultTip:{ start:'Start Address',end:'End Address' }
    ,titleTip:{ start:'Enter your start address', end:'Enter your end address' }
    //,defaultStart:'Start Address'
    //,defaultEnd:'End Address'
    ,defaultLocateMessage:'Please select a location to search'
    ,defaultLocateStoresMessage:'Enter your Address to find a Store Nearby'
    ,defaultRouteMessage:'Please enter your Address for Video Directions'
    ,defaultRouteEmbedMessage:'Please enter your Address for Video Directions'
    ,helpLocate:''
    ,helpRoute:''
    ,loadingDivMessage:"<table align='center'><tr><td><a class='message'><b>Loading..</b></a></td><td><img src='"+vidteq.imgPath.load+"' /></td><td><a style='cursor:pointer' class='message'  href='javascript:void(0)' onclick='javascript:ioAreaObj.cancelRequest()return false'>Cancel</a></td></tr></table>"
    ,guiChoices:{}
    //// to be provided by cma
    ,popupStatus:0
    ,mapStatus:0
    ,tabImageMapList:[]
    ,tabList:[]
    ,thumbList:[]
    ,thumbImgList:[]
    ,descList:[]
    ,fovList:[]
    ,popCount:1
    ,flashIntroTime:15
    ,loadFinish:false
    ,frontPageNum:'multiHome'
    ,venueFromTopBar:false
    ,is3dmap:false
    ,mode3D:'home'
    ,phoneNumMinLimit:6
    ,phoneNumMaxLimit:15
    ,IE8FirstTime:false
    ,comtabTopBarUI:false
    ,comtabNoDisplay:false
    ,openScale:false
    ,appMode:false
    ,handheld:false
    ,wap:false
    ,rcmContext:undefined
    ,cookieOptions:undefined
    ,routeEnds:undefined
    ,fvt:undefined
    ,sped:undefined
    ,embed:undefined
    ,minDisplayMessage:false //default:false
    ,hasCollapse:false //default:false
    ,draggableVideo:false //default:false
    ,resizableVideo:false //default:false
    ,hasDrapeSheer:true //default:true
    ,routeRequestLoader:'routeRequest'
    ,hasLoadingPrompt:true //default:true
    ,textDirDoubleScroll:true //default:true
    ,popInfoConfig:{
      name:'divRoutePop'
      ,factor:2
      ,animateTime:1000
    }
    //,routeSummaryType:undefined
    //
  };
  
  $.extend(_guiOptions, options );
  $.extend(this, _guiOptions );
  this._setPreInitConditions();
  // TBD following code is needed for early mbox init
  //var that = this;
  //$(window).resize(function(){ that.fixTheApp(); });
  //this.fixTheApp();
  //if (!this.openScale) {
  //  vidteq.mboxObj = new vidteq.mbox('map',this);
  //}
}

vidteq._gui.prototype._setPreInitConditions = function() {
  if( vidteq.aD ) {
    if( vidteq.aD.config ) {
      if( vidteq.aD.config.flashTimerDelay ) { this.flashIntroTime = vidteq.aD.config.flashTimerDelay; }
      if( vidteq.aD.config.is3dmap == '1') { this.is3dmap = true; }
    }
    if( vidteq.aD.openScale ) {
      this.openScale = true;
      $('#mapContainer').hide();
      $('#input-div').hide();
    }
    if( vidteq.aD.appMode ) {
      this.appMode = true;
    //  rcmContextObj = new vidteq._rcmContext('map');
    //  this.rcmContext = rcmContextObj;
    }
    if( vidteq.aD.handheldEnabled ) {
      this.handheld = true;
      if (vidteq.aD.q  == 'blocate') { this.popupVideo = true; }
      // commented as rcmContext no longer needed
      ///rcmContextObj = new vidteq._rcmContext('map');
      /////contextManagerObj = new _contextManager('map');
      ///this.rcmContext = rcmContextObj;
      /////this.contextManager = contextManagerObj;
    }
    // currently commented as rcmContext is no longer needed
    //if( vidteq.aD.html5VideoEnabled ) {
    //  this.html5VideoEnabled = true;
    //  rcmContextObj = new vidteq._rcmContext('map');
    //  this.rcmContext = rcmContextObj;
    //}
    //if( vidteq.aD.wfHandheld ) { this.wfHandheld = true; }
    if( typeof vidteq.aD.nemoQ !== 'undefined' ) {
      this.cookieOptions = {
        cookieExpiry : 1
        ,cookieName : 'vidteq-videocount-'+vidteq.aD.urlId
        ,maxVideoSearch: 3
        ,urlId: vidteq.aD.urlId
        ,canPlaySameRouteAgain: false
        ,enabledVideoCountCookie: true
      };
    }
    //TBD: wait till the time comes to put this in account config
    if( vidteq.aD.urlId == "KSL" ) { this.comtabNoDisplay = true; } //to be removed from here if false
    if( vidteq.aD && vidteq.aD.firstTimeRule && vidteq.aD.firstTimeRule.manner ) {
      if( vidteq.aD.firstTimeRule.manner == 'videoMap' && vidteq.aD.urlId == "indiaproperty" && !vidteq.aD.firstTimeRule.experimental ) {
        this.minDisplayMessage = true;
        this.hasCollapse = true;
        this.draggableVideo = true;
        this.resizableVideo = true;
        this.routeRequestLoader = 'loader';
        this.hasDrapeSheer = true;
        this.hasLoadingPrompt = false;
        this.popInfoConfig.factor = 1.3;
        this.popInfoConfig.animateTime = 0;
        this.mapCenterOffsetInPixel = 240;
      }
    }
    
  }
  if( this.hasCollapse ) {
    this.addCollapse();
  }
}

//vidteq._gui.prototype.init = function(q,isEmbed) { }
vidteq._gui.prototype.init = function(aD) {
  var q = aD ? (aD.q ? aD.q : 'none') : 'none';
  //this.phoneNumMinLimit = vidteq.utils.getSafe('vidteq.aD.config.phoneNumMinLimit') || this.phoneNumMinLimit;
  this.phoneNumMinLimit = vidteq.utils.getSafe('config.phoneNumMinLimit',aD) || this.phoneNumMinLimit;
  //this.phoneNumMaxLimit = vidteq.utils.getSafe('vidteq.aD.config.phoneNumMaxLimit') || this.phoneNumMaxLimit;
  this.phoneNumMaxLimit = vidteq.utils.getSafe('config.phoneNumMaxLimit',aD) || this.phoneNumMaxLimit;
  this.name = 'embed';
  vidteq.routeEndsObj.gui = this;  // this allow hijack
  this.setTemplates();
  
  this.routeEnds = vidteq.routeEndsObj;
  //if(!this.wap) this.sped = new vidteq._sped(this);
  this.sped = new vidteq._sped(this);
  this.fvt = vidteq.fvtObj;
  if( aD && aD.config && aD.config.suggestBoxDisable ) {
    this.tIn = false;
  }
  if (q == 'wayfinder-lite') { this.tIn = false; }
  if (q == 'EScheduler') { this.tIn = false; }
  if (q == 'blocate-lite') { this.tIn = false; this.topBarUI = true; }
  if (q == 'blocate') {
    if(typeof(aD.config.sideBarUI) != 'undefined' && 
        parseInt(aD.config.sideBarUI) 
        && !this.handheld && !this.openScale && !this.appMode) {
      this.sideBarUI = true;
      this.multiFrontPage = true;
    } else { this.topBarUI = true; }
  }
  //if (vidteq.aD.urlId == 'Galaxy_Bidadi_Project' ||
  //    //vidteq.aD.urlId == 'Galaxy_Daffodils' ||
  //    vidteq.aD.urlId == 'Galaxy_Green_City' ||
  //    vidteq.aD.urlId == 'Galaxy_Rajalakshmi_Gardens' ||
  //    vidteq.aD.urlId == 'Galaxy_Suncity' ||
  //    vidteq.aD.urlId == 'Galaxy_Sunrise' ||
  //    vidteq.aD.urlId == 'Galaxy_Sunshine') {
  //  this.tIn = false;
  //}
  if( this.handheld ) { this.tIn = true;this.topBarUI=false;}
  //if( !this.wap )this.initEmbed(aD);
  this.initEmbed(aD);
  if ((this.topBarUI || this.sideBarUI) && !this.openScale) { 
    this.prepareTopPanel(); 
  }
  if (this.handheld || this.openScale) { this.prepareDialPanel(); }
  this.prepareSuggestBoxes();
  if (!this.openScale) { this.assignSrc(q); }
  this.attachEvents(q);
  this.prepareDoms(q);
  if (!this.wap) { this.attachPartOfEvents(); }
  this.createRestOfObjects(q);
  this.attachFinalEvents(q);
  //if(!this.wap) this.invokeFirstTimeRule();
  this.invokeFirstTimeRule();
  if (this.sideBarUI ) {
    if(typeof(this.embed) != 'undefined' && 
         typeof(this.embed.firstTimeRule) != 'undefined') {
      return;
    }
  }
  if (!this.wap) {
    if (this.createAndShowFrontPage) { 
      if (this.handheld) {
        if (!this.appMode) {
          var that = this;
          setTimeout(function() { that.createAndShowFrontPage(false); },500 ); 
        }
      } else {
        if(!this.openScale) {
          //if(vidteq.utils.getSafe('vidteq.aD.q') && vidteq.aD.q != 'EScheduler') { }
          if(vidteq.utils.getSafe('q',aD) && aD.q != 'EScheduler') {
            this.createAndShowFrontPage(false);
          }
        }
      }
    }
  }
  if (this.appMode) {
    this.attachDeviceMotionEvent();
    $('#poweredBy').hide();
    $('#base').show();
    window.location.hash='dholder';
  } else if (this.handheld){
    window.location.hash=''; 
  }  
  if (!this.openScale && !this.handheld && !this.wap) {
    //try {
    //  console.log("Release#: ");console.log(vidteq._rStr);
    //}catch(err) {};
    if (this.disableGoVid(this.cookieOptions,true)) {
      this.doAutoPlay();
    };
  }
  if (this.html5VideoEnabled) { this.initHtml5Video(); }
  if (this.openScale) {
    this.doOpenScalOverrides(aD);
  }
  var that = this;
  if (this.sideBarUI) {
    if(typeof(this.embed) != 'undefined' && 
         typeof(this.embed.firstTimeRule) != 'undefined' && 
         typeof(this.embed.firstTimeRule.lmRoute) != 'undefined') {
      return;
    }
    if (this.multiFrontPage) {
      var pName = 'frontCurtainContent';
      if($('#'+pName).length == 0) { } else {
        $('#frontCurtainContent').remove();
        $('#backgroundFrontPage').remove();
      }
    }
    //$("#driving-dir-video-link").trigger("click");
  }
}

vidteq._gui.prototype.invokeNeighbourhood = function (options) {
  var that = this;
  //vidteq.vidteq.loadScript({
  //  checkObj:'Modernizr'
  //  ,url:"js/modernizr-2.6.2.js"
  //});
  vidteq.vidteq.loadScript({
    checkObj:'Sly'
    ,url:"js/sly.min.js"
  });   
  var aD = vidteq.aD;  
  var as = this.manner = options.manner;
  if( !this[ as ] ) {
    this[ as ] = {};
  }
  if( vidteq.Evaluator && !this[ as ].evaluator ) {
    //var radialDistance = 2500;
    var nemoOptions = this.getNemoOptions(options)
    ,distance = parseInt(aD.places.allowedDistanceLimit)
    ,limit = parseInt(aD.places.allowedItemLimit || 40)
    ,x1 = parseInt(limit - limit/2)
    ,x2 = parseInt(limit - limit/5)
    ,x3 = limit
    ,explorationAreaOpt = {
      areaName:''
      ,areaLabel:aD.places.center.entity.address.name || vidteq.cfg.city          
      ,geom: aD.places.center.entity.geom || 'POINT('+vidteq.cfg.centerLon+' '+vidteq.cfg.centerLat+')'
      ,limit: limit
      ,distance: distance
      ,circleResizeRequired: true
      //,distanceOption: nemoOptions.uiOptions.distanceOption
      ,distanceOption: [
        {
          x: 2000
          ,limit: x1
          ,offset: 0
          ,display: '2 KM'
        }
        ,{
          x: 5000
          ,limit: x2
          ,offset: 0
          ,display: '5 KM'
        }
        ,{
          x: distance
          ,limit: x3
          ,offset: 0
          ,defaultDistance: true
          ,display: (distance/1000) + ' KM'
        }
      ]
    }
    ;
    explorationArea = this[ as ].explorationArea = this.getExplorationArea(explorationAreaOpt);
    
    var theme = vidteq.vidteq.theme;
    var evaluator = this[as].evaluator = new vidteq.Evaluator({
        parent: this
        ,mbox: vidteq.mboxObj
        ,manner: as
        ,theme:theme
      });
      
    evaluator.createExploreAreaLayers( explorationArea, as, aD.places.center.entity, aD.urlId ); 
  }
  
  var neighbourhoodOpt = {
    as:this.manner
    ,style:'spritebutton'
    //,wgtName:'threeDWgt'            
    ,catButtonImg:true
    ,threeDWgtRequired: true
    ,theme: theme
    ,poiPopupTmpl: vidteq.template.poiPopup2D + '-'+ theme
  }
  $.extend(neighbourhoodOpt, options );
  if( neighbourhoodOpt.threeDWgtRequired ) {
    this.createThreeDWgt( neighbourhoodOpt );
  }
  this.createCategoryFactory(neighbourhoodOpt);
//TBD: uncomment for 3D neighbourhood for evisits
  //TBD: not a correct place.
  //if( vidteq.Evaluator && this[ this.manner ].evaluator ) {
  for( var c in this[this.manner].categories.validCategories) {
    var layerName = this.manner + "-" + this[ this.manner ].categories[c].itemId;
    this[ this.manner ].evaluator.createNemoCategoryLayers( layerName, this.manner );
  }
  this[ as ].categoryWgt.init();
  this[ as ].categoryWgt.invoke();
  
  //TBD z-index changes made here not proper
  //$('#'+this[ as ].categoryWgt.domId).css({'z-index':'10'});
  $('#'+this[ as ].categoryWgt.domId).addClass('hotels');
  return true;
}

vidteq._gui.prototype.createCategoryFactory = function (options) {
  
  var as = options.as || "explore";
  var poiPopupTmpl = options.poiPopupTmpl || vidteq.template.poiPopup2D;  
  vidteq.template.add( {name:poiPopupTmpl, id:poiPopupTmpl} );
  
  var wgtName = "threeDWgt"; //options.wgtName || "exploreWgt";
  if ( !this[ as ] ) { this[ as ] = {}; }
  var categoryFactory = new vidteq.CategoryFactory({
    overrideWithCma: true //default is true
    ,categoryConfig: vidteq.aD.places
    ,manner: as
    ,uiwidget:this
    ,theme:vidteq.vidteq.theme
    ,poiPopupTmpl:poiPopupTmpl
    ,color: "#a87c2c"
  });
  
  this[ as ].categories = new vidteq.Category(
    {
      categoryFactory: categoryFactory
      ,uiwidget: this
      ,evaluator:this[ as ].evaluator
    }
    ,as
    ,{
      //-- options at this level applies to all categories widgets
      graph : {
        //-- options at this level applies to all graphs
        //appendTo : this.evaluateDomOptions.appendTo
        link : ["http://www.vidteq.com"] //default
        ,prefix : "nemo-graph" //default
      }
    }
  );
  
  //categoryWgt
  var categoryWgtOptions = {
    uiwidget: this
    ,manner: as
    ,categories: this[ as ].categories
    ,theme: vidteq.vidteq.theme
    ,style: options.style || 'minibar'//'spritebutton'//'minibar'
    ,catButtonImg: options.catButtonImg || false
    //,multiselect: false
    ,hasSlider: true
    ,hasTooltip: true
    ,manner: as
    ,sortBy:'priority'
    ,evaluationRequired: false
    ,evaluationAutoTrigger: false
    ,wayfinderSearchRequired: false
    ,introRequired: false
    ,categoryAutoTrigger: true
    ,areaPolygonRequired: false
    ,disableCatButtonIfNotAvailable: false
    ,categoryAllTrigger: false
    ,legendRequired: false
    ,categoryWgtRequired: true
  };
  this[ as ].categoryWgt = new vidteq.CategoryWgt( categoryWgtOptions );
  this[ as ].categories.addWidget(wgtName,this[ as ][wgtName]);  
  
  
  
  

}

vidteq._gui.prototype.doOpenScalOverrides = function (aD) {
  vidteq.imgPath.maxZ =  'images/os/max_os.png?myRand='+Math.floor(Math.random()*100000);
  vidteq.imgPath.minZ =  'images/os/min_os.png?myRand='+Math.floor(Math.random()*100000);
  vidteq.imgPath.vidZ =  'images/os/car_os.png?myRand='+Math.floor(Math.random()*100000);
  if (aD.multiPage) {
    $('#back_multiPage').show();
    $('#back_multiPage').click(function() {
      StageWebViewBridge.call('goStageBack', null, null);      
    });
  }
}

vidteq._gui.prototype.attachDeviceMotionEvent = function () {
  window.ondevicemotion = function(event) {
    var landscapeOrientation = window.innerWidth / window.innerHeight > 1;
    if (landscapeOrientation) {
      $('body').css({width:window.innerWidth});
      $('#bgCurtain').css({height:window.innerHeight+'px',width:window.innerWidth+'px'});
    } else {
      $('body').css({width:window.innerWidth});
      $('#bgCurtain').css({height:window.innerHeight+'px',width:window.innerWidth+'px'});
    }
  }
}

//vidteq._gui.prototype.clearTipForSuggest = function (id) {
//  if (id=='starttextbox') { this.routeEnds.remove('start'); }
//  if (id=='endtextbox') { this.routeEnds.remove('end'); }
//}
//
vidteq._gui.prototype.prepareSuggestBoxes = function () {
  if (!this.tIn) { return;}
  this.topClearList = {};
  this.topDownKeyList = {};
  this.topUpKeyList = {};
  var that = this;
  
  this.keyBox = {};
  var opt = {
    id:'starttextbox'
    ,defaultValue:this.defaultLoc
    ,defaultTitle:this.titleLoc
    ,defaultPointInfo:'Your Source'
    ,sugDivId:'#sugdivstart'
    ,tip:'start'
  };
  if (this.wap) {
    $.extend(opt,{noFocusEvent:true,maxPlaceList:3,touchType:true,autoHide:false});
  } else {
    $.extend(opt,{readOnlyClass:'input-small'});
  }
  this.keyBox.start = new vidteq._suggestBox(this,opt);
  var starttextboxId = this.keyBox.start.id;
  $(starttextboxId).attr('class',"big");
  this.keyBox.start.assignEvents();
  //this.keyBox.start.getMyLoc = function (myVal) {
  //  if (that.keyBox.end.myLoc) {
  //    that.routeEnds.remove('end');
  //  }
  //  that.keyBox.end.unfixMyLoc();
  //  that.updateMyLocInTip('start',that.lastMyLoc);
  //  return that.lastMyLoc.name;
  //};
  if (this.routeEnds) {
    this.keyBox.start.clearTip = function (myVal) { 
      that.routeEnds.remove('start'); 
    };
  }
  
  var opt = {
    id:'endtextbox'
    ,defaultValue:this.defaultTip.end
    ,defaultTitle:this.titleTip.end
    ,defaultPointInfo:'Your Destination'
    ,sugDivId:'#sugdivend'
    ,tip:'end'
  };
  if (this.wap) {
    $.extend(opt,{noFocusEvent:true,maxPlaceList:3,touchType:true,autoHide:false});
  } else {
    $.extend(opt,{readOnlyClass:'input-small'});
  }
  this.keyBox.end = new vidteq._suggestBox(this,opt);
  var endtextboxId = this.keyBox.end.id;
  $(endtextboxId).attr('class',"small");
  this.keyBox.end.assignEvents();
  //this.keyBox.end.getMyLoc = function () {
  //  if (that.keyBox.start.myLoc) {
  //    that.routeEnds.remove('start');
  //  }
  //  that.keyBox.start.unfixMyLoc();
  //  that.updateMyLocInTip('end',that.lastMyLoc);
  //  return that.lastMyLoc.name;
  //};
  if (this.routeEnds) {
    this.keyBox.end.clearTip = function () { 
      that.routeEnds.remove('end'); 
    };
  }
  this.keyBox.start.otherTip = this.keyBox.end;
  this.keyBox.end.otherTip = this.keyBox.start;
  //if(vidteq.eVisit){
  //  $(endtextboxId).val(vidteq.aD.places.center.entity.address.name);
  //  $(endtextboxId).attr('readonly',true);
  //  $(starttextboxId).val("My Location");
  //}
}

//vidteq._gui.prototype.updateMyLocInTip = function (tip,myLoc) {
//  this.routeEnds.replaceEntity(tip,{
//    geom:"POINT("+myLoc.lon+" "+myLoc.lat+")"
//    ,address:{name:myLoc.name}
//    ,myLoc:myLoc
//  },{noFillKeyBox:true});
//}

vidteq._gui.prototype.updateMyLoc = function (myLoc) {
  this.lastMyLoc = myLoc;
  //var ent = {
  //  geom:"POINT("+myLoc.lon+" "+myLoc.lat+")"
  //  ,address:{name:myLoc.name}
  //  ,myLoc:myLoc
  //};
  if (this.tIn) {
    if (this.keyBox.start) {
      //this.keyBox.start.updateMyLoc(ent);
      this.keyBox.start.updateMyLoc(myLoc);
      //this.keyBox.start.updateMyLoc(myLoc.name);
      //if (this.keyBox.start.myLoc) {
      //  this.updateMyLocInTip('start',myLoc);
      //}
    }
    if (this.keyBox.end) { 
      //this.keyBox.end.updateMyLoc(ent);
      this.keyBox.end.updateMyLoc(myLoc);
      //this.keyBox.end.updateMyLoc(myLoc.name);
      //if (this.keyBox.end.myLoc) {
      //  this.updateMyLocInTip('end',myLoc);
      //}
    }
  }
  // Ideally staleness timer should be here
}

vidteq._gui.prototype.initEmbed = function (aD,opt) {
  var opt = opt || {}; 
  //if(!isEmbed.on) { return; }
  if (typeof(aD) == 'undefined') return;
  if (!aD) { return; }
  if (!aD.q) { return; }
  if (!aD.places) { return; }
  this.embed = {};
  var embed = this.embed;
  //this.embed.fix = isEmbed.fix;
  embed.fix = opt.fix || 'end';
  embed.other = vidteq.utils.otherTip[embed.fix];
  switch (aD.q) {
    case "EScheduler":
    case "VidCorp":
    case "wayfinder-lite":
    case "blocate-lite":
    case "wayfinder":
    case "blocate":
      embed[aD.q] = aD.places;
      if (aD.firstTimeRule) {
        embed.firstTimeRule = aD.firstTimeRule; 
      }
      embed.place = aD.places.center.entity;
      this.prepareCenterEntity(embed.place,embed.fix);
      break;
    case "nemo":
      embed[aD.q] = aD.places;
      if(aD.firstTimeRule) {
        embed.firstTimeRule = aD.firstTimeRule;
        embed.place = aD.firstTimeRule.center;
        this.prepareCenterEntity(embed.place,embed.fix);
      }
      break;
    case "locatestores":
      embed.locateStores = aD.places;
      embed.locateStores.storeName = 'Store';
      embed.locateStores.storesName = 'Stores';
      if (aD.places.categoryDetails && 
          aD.places.categoryDetails.itemIdentifier) {
        embed.locateStores.storeName = aD.places.categoryDetails.itemIdentifier;
      }
      if (aD.places.categoryDetails && 
          aD.places.categoryDetails.itemIdentifierPlural) {
        embed.locateStores.storesName = aD.places.categoryDetails.itemIdentifierPlural;
      }
      //if (vidteq.aD.urlId == 'Bangaloreone') { // TBD
      //  this.embed.locateStores.storeName = 'Centre';
      //  this.embed.locateStores.storesName = 'Centres';
      //}
      //if (vidteq.aD.urlId == 'karnatakabank') { // TBD
      //  this.embed.locateStores.storeName = 'Branch';
      //  this.embed.locateStores.storesName = 'Branches';
      //}
      this.defaultLocateStoresMessage = 'Enter your Address to find '+embed.locateStores.storesName+' Nearby & Get Video Directions'; // TBD does not belong to embed object - may get overwritten
      this.defaultLoc = this.defaultLocateStoresMessage;
      if (aD.firstTimeRule) {
        embed.firstTimeRule = aD.firstTimeRule; 
      } else {
        embed.firstTimeRule = {
          locate:{ 
            address: {name:"the centre of "+vidteq.utils.ucFirst(vidteq.cfg.city)+" City"},
            geom:'POINT('+vidteq.cfg.centerLon+' '+vidteq.cfg.centerLat+')'
        }};
      }
      break;
    default:document.location.href='error.html';break;
  }
  switch (parseInt(vidteq.vidteq.pf)) {
  case 1:
    embed.vidHeight='160px';
    embed.vidWidth='240px';  
    break;
  case 2:
    embed.vidHeight='256px';
    embed.vidWidth='384px';  
    break;
  case 3:
  default:
    embed.vidHeight='320px';
    embed.vidWidth='480px';  
    break;  
  }
  return embed;
  // TBD why is vidHeigt present it belongs to fvt actually
}

vidteq._gui.prototype.assignSrc = function (q) {
  //if (q != 'wayfinder-lite') {
  if (q != 'wayfinder') {
    $('#GoVid').attr('src',vidteq.imgPath.govid);   
    $('#swaptd').attr('src',vidteq.imgPath.swap); 
  }
}

vidteq._gui.prototype.restoreDefaultsInKeyBox = function () {
  if (!this.keyBox) { return; }
  var sameCity = false;
  if (this.lastMyLoc && this.lastMyLoc.city &&
      this.lastMyLoc.city == vidteq.cfg.city) {
    sameCity = true;
  }
  for (var i in this.keyBox) {
    var k = this.keyBox[i];
    k.restoreDefaults();
    if (sameCity) { k.enableMyLoc(); }
    else { k.disableMyLoc(true); }
  }
  this.executeAllFunc(this.topClearList);
}

vidteq._gui.prototype.attachEvents = function (q) {
  var that = this;
  if ($('#body').length) {
    $('#body').keydown(function (evt) {
      evt=evt?evt:window.event;
      that.checkKeyEvents(evt);
      return true;
    });
    //if(!this.wap){ // TBD not ssure need to be finalized later
      $('#body').click(function () {
        that.executeAllFunc(that.topClearList);
      });
    //}
  }
  $('#swaptd').click(function () {
    var myFunc = function() {
      that.swapRoute();
      return false;
    };
    if(that.appMode) {
      that.stopWebViewAsyncCalls(myFunc);
      return; 
    }
    myFunc();
  });
  $('#GoVid').click(function () {
    var myFunc = function() {
      if( that.disableGoVid( that.cookieOptions ) ) {
        that.io.goVid();
      };
      return false;
    };
    if(that.appMode && (!that.openScale || that.handheld)) {
      if(that.handheld) that.closeMenus();
      that.stopWebViewAsyncCalls(myFunc);
      return; 
    }
    if(that.openScale && !that.handheld) { 
      StageWebViewBridge.call('landmarkRouteIndex', null, {
        dirIndex:0
      }); 
    }
    if(that.handheld) that.closeMenus();
    myFunc();
  });

  if(vidteq.aD.places && 
     vidteq.aD.places.allowedCategoryList) {
    if(vidteq.aD.urlId == 'Prestige_Deja_Vu') {
      var options = {        
        threeDWgtRequired:true
        ,skyview:true
      } 
      this.attachEventsToNeighbourhood3D(options);    
      $('#'+this.ids.neighbourhood3D).show();
    }
  }
  $('#'+this.ids.invokeMapView).click(function() {
    if(that.sideBarUI ) { 
      //var ft = "&firstTimeRule={urlid:'"+vidteq.aD.urlId+"'}";    
      var ft = {urlid:vidteq.aD.urlId};
      if(typeof(that.embed.firstTimeRule) != 'undefined' && typeof(that.embed.firstTimeRule.mapviewurlid) != 'undefined') {
        //ft = "&firstTimeRule={urlid:'"+vidteq.aD.urlId+"','mapviewurlid':'"+that.embed.firstTimeRule.mapviewurlid+"'}";
        ft.mapviewurlid = that.embed.firstTimeRule.mapviewurlid;
        if(typeof(that.embed.firstTimeRule.explore) != 'undefined') {
          //ft = "&firstTimeRule={urlid:'"+vidteq.aD.urlId+"','explore':1,'mapviewurlid':'"+that.embed.firstTimeRule.mapviewurlid+"'}";
          ft.explore = 1;
        }
      }
      document.location.href = "embed3.php?city="+vidteq.cfg.city+"&urlid=Prestige_Group"+'&firstTimeRule='+JSON.stringify(ft);
      //document.location.href = "embed3.php?city="+vidteq.cfg.city+"&urlid=Prestige_Group"+ft;
      //document.location.href = "embed3.php?city="+vidteq.cfg.city+"&urlid=Prestige_Group&firstTimeRule={urlid:'"+vidteq.aD.urlId+"'}";
      return;
    }
  });  
}

vidteq._gui.prototype.disableGoVid = function( options, onAutoplay ) {
  //vidteq.utils.isCookieEnabled();
  //TBD: restictive feature config parameter
  options = options || {};
  var clickGoVid = true;
  if( options.urlId && options.urlId === 'KSL' ) {
    var storeAs = options.storeAs;
    if( onAutoplay ) {
      var nemoQ = vidteq.utils.getSafe('vidteq.aD.nemoQ');
      if( nemoQ ) {
        storeAs = options.storeAs = vidteq.utils.getSafe('vidteq.aD.nemoCenter.address.name');
      }
    }
    var exCookie = JSON.parse(vidteq.utils.readCookie(options.cookieName));
    if( exCookie && exCookie[ storeAs ] && exCookie[ storeAs ].length >= options.maxVideoSearch ) {
      $("#lastMileOuter").remove();
      //$("#lastMileOuter").unbind('click').hide();
      var starttextboxId = this.keyBox.start.id;
      var endtextboxId = this.keyBox.end.id;
      
      var el_start = $(starttextboxId);
      el_start.attr('readonly',true);
      el_start.attr('title','You have exceeded the number of video views for today. Please try again tomorrow.');
      el_start.css({'color':'#999'});
      
      var el_end = $(endtextboxId);
      el_end.attr('readonly',true);
      el_end.attr('title','You have exceeded the number of video views for today. Please try again tomorrow.');
      el_end.css({'color':'#999'});
      
      var govid = $("#GoVid");
      $("#swaptd").remove();
      //$("#swaptd").unbind('click').hide();
      
      var parent = govid.parent();
      parent.append('<div class="disabled-govid"><span>You have exceeded the number of video views for today. Please try again tomorrow.</span></div>');
      
      govid.remove();
      //govid.unbind('click').hide();
      this.mbox.rcmItems = [];
      this.mbox.removeMapTitle();
      clickGoVid = false;
    }
  }
  return clickGoVid;
}

vidteq._gui.prototype.checkAndCustomizeForEmbed = function (q) {
  if (this.name == 'vidteq') {
    //$('#map').css('left','0px');
    $('#map').addClass("map-CustomizeForVidteq");
    return;
  }
  /*
  $('#directions_div').css('border','0px solid black');
  $('#routedetails').css({'border-left':'0px solid black','border-right':'0px solid black'});
  $('#VideoPlayerDiv').css('border','0px solid #376092');
  $('#maintable').css({'width':"100%",'textAlign':'center'});
  $('#map').css({'width':"100%",'border':"0px solid #376092"});
  */
  $('#directions_div').addClass("directions_div-CustomizeForEmbed");
  $('#routedetails').addClass("routedetails-CustomizeForEmbed");
  $('#VideoPlayerDiv').addClass("videoPlayerDiv-CustomizeForEmbed");
  $('#maintable').addClass("maintable-CustomizeForEmbed");
  $('#map').addClass("map-CustomizeForEmbed");
}

vidteq._gui.prototype.checkKeyEvents = function (evt) {
  $("#suggesttable").find('tr').each(function () {
    $(this).attr('class',"suggestrow");
  });

  var keyCode=evt.keyCode?evt.keyCode:(evt.which?evt.which:evt.charCode);
  switch (keyCode) {
  case 9:
    this.executeAllFunc(this.topClearList);
    break;
  case 13:
    this.executeAllFunc(this.topClearList);
    if($("#comdiv")[0]) {
      if(whichPopup=="EMAIL") { send('email');  // TBD
      } else if(whichPopup=="SMS") { send('sms');  // TBD
      } 
    } else {
      $('#GoVid').focus();
      $('#GoVid').click();
      //this.io.goVid();
    }
    break;
  case 38:
    this.executeAllFunc(this.topDownKeyList);
    break;
  case 40:
    this.executeAllFunc(this.topUpKeyList);
    break;
  default:break;
  }
  if (keyCode >= 65 && keyCode <= 90 && evt.altKey) {//general purpose alt keys
    if (!this.stickyKey) { this.stickyKey = {}; }
    if (this.stickyKey[keyCode]) { this.stickyKey[keyCode] = false; }
    else { this.stickyKey[keyCode] = true; }
    this.showSpecialMessage('alt key '+keyCode+' is '+this.stickyKey[keyCode]);
  }
}

vidteq._gui.prototype.showSpecialMessage = function (msg) {
  if (!$('#specialMessage').length) { return; }
  $('#specialMessage').fadeIn();
  $('#specialMessage').text(msg);
  var t = $('#specialMessage').data('timer');
  if (t) { clearInterval(t); }
  var t = setTimeout(function () {
    $('#specialMessage').fadeOut();
  },3000);
  $('#specialMessage').data('timer',t);
}

vidteq._gui.prototype.fixTheApp = function () {
  var inputHeight=$('#input-div').height();
  $('#map').css('height',($(window).height()-inputHeight)+'px');
  if(this.sideBarUI) {
    if (self.navigator.userAgent.match(/MSIE\s[7]/)){
      $('#base').css({position:'absolute',top:'0px'});
      $('#base').css('height',(document.documentElement.clientHeight-2)+'px');
      $('#map').css('height',(document.documentElement.clientHeight)+'px');
    } else {
      $('#map').css({position:'absolute',top:'0px'});
    }
  }
  $('#map').css('width',typeof(this.embed.width)!='undefined'?this.embed.width+"px":"100%");
  // Above line give grief in early mbox init TBD
  if (this.handheld && !this.appMode) {
  } else {
    $('#main').css('width',"100%");
    this.fvt.matchMapHeight();
    // TBD early mbox init needs some fix here
    if (!this.topBarUI && !this.sideBarUI) {
      $('#dynamicDiv').css('height',$('#map').height()+"px");
    }
  }
}

vidteq._gui.prototype.displayMessage = function (message) {
  if ($('#routedetails').length) {
    $('#routedetails').css('display','block');  
    if ($('#routedetails_primitive').length) {
      $('#routedetails_primitive').html('');
    }
    if (this.topBarUI || this.sideBarUI) {
      $('#routedetails').html("<a class=helptooltip1>"+message+"</a>");
    } else {
      $('#routedetails').html("<a class=helptooltip>"+message+"</a>");
    }
  } else if ($('#routedetails_primitive').length) {
    $('#routedetails_primitive').html("<a style='font-size:16px;' class=helptooltip>"+message+"</a>");
  }  
  // if(typeof(vidteq.aD) != 'undefined' 
          // && (vidteq.aD.urlId == "commonfloor")) {             
    // var checkFunc = function () {
      // if(typeof(this.fvt.getVideoObj(this.fvt.videoSwf)) != 'undefined'
           // && typeof(this.fvt.getVideoObj(this.fvt.videoSwf).volumeOff) == 'function') {
         // return true;      
      // } else false;    
    // }  
    // var fireFunc = function () {
      // this.fvt.getVideoObj(this.fvt.videoSwf).volumeOff(); 
    // }
    // var w = new vidteq.utils.waitAndFire (checkFunc,fireFunc);
  // }
}

vidteq._gui.prototype.prepareDoms = function (q) {
  if (this.topBarUI || this.sideBarUI) {
    //this.prepareTopPanel();
    // This stuff need to be done at earlier point
    // TBD ioAreaObj.selectInTopPanel('div_home-link');
    // Should be moved to the end near first time rule
  } else {
    this.prepareOldPanel();
  }
  this.displayMessage(this.defaultRouteEmbedMessage);
  var that = this;
  $(window).resize(function(){ that.fixTheApp(); });
  this.fixTheApp();
  this.toggleButtons({'localinkhref':true});
  if(!this.wap)if (this.embed.locateStores) { this.toggleButtons({"stores":true}); }
  this.checkAndCustomizeForEmbed();
}

vidteq._gui.prototype.createMbox = function () {
  if (!this.openScale) {
    vidteq.mboxObj = new vidteq.mbox('map',this);
    // Above code need to be modified for early mbox edit
    if( vidteq._landmarkPolygonMboxIf ) {
      this.landmarkPolygonMboxIf = new vidteq._landmarkPolygonMboxIf({mbox: vidteq.mboxObj});  
    }
  }
  if (this.openScale) {
    vidteq.mboxObj = {};
    this.mbox = {};
    vidteq.fB.mbox = vidteq.mboxObj;
  } else {
    this.mbox = vidteq.mboxObj;
    this.routeEnds.mbox = vidteq.mboxObj;
    vidteq.fB.mbox = vidteq.mboxObj;
    if (vidteq.mobUI) { vidteq.mobUI.mbox = vidteq.mboxObj; }
    var that = this;
    this.mbox.mapClickToGuiFunc = function (e) {
      that.handleMapClick(e);
    };
    this.mbox.mapDblClickToGuiFunc = function (e) {
      that.handleMapClick(e);
    };
    // not sure it is ok TBD
    // Also note that ther eis overRider
  }
}

vidteq._gui.prototype.createRestOfObjects = function (q) {
  vidteq.imgPath.generatePath();
  this.createMbox();

  if (typeof(vidteq.aD.config.landMarkLayer)!= 'undefined' && 
      parseInt(vidteq.aD.config.landMarkLayer) &&
      this.callMakeLmLayer ) {
    // TBD - need to bring back landmark layer by inserting height and width
    if (this.handheld || this.openScale) { } else {
      this.callMakeLmLayer(); 
    }
  }

  if(vidteq.aD.q == 'blocate') {
    this.selectMode('ROUTE');
  } else {
    this.selectMode('LOCATE');
  }
  if (this.embed.place) {
    //routeEndsObj.addByIndex(this.embed.fix,1,'center');
    vidteq.routeEndsObj.replaceEntity(this.embed.fix,this.embed.place);
    //this.showFixedTip();
    this.showFixedTipNew();
    if (vidteq.mobUI) { 
      vidteq.mobUI.toastCenter(this.embed.place);
    } else {
      this.showHomeExtent();
    }
  }
  if( this.cred ) {
    this.cred.installFeedbackCallBacks();  // TBD to be moved
  }
  //firstTimeRuleInvoke();
  this.fvt.applyEventsSwfPlayer();
}

vidteq._gui.prototype.handleMapClick = function (e) {
  if (this.topBarUI) { this.closeAnyDropDowns(); }
  $('#lr_div').hide('slow',null);
}

vidteq._gui.prototype.attachPartOfEvents = function (q) {
  //if (typeof(vidteq.aD.config.pfLayer)!= 'undefined' && parseInt(vidteq.aD.config.pfLayer)) {
  //  prepareProposedTab();  
  //} else { $('#proposedref').hide(); }
  if( vidteq._credentials ) {
    this.cred = new vidteq._credentials(this);
    this.cred.init();
  }
  //if(vidteq.aD.account == "theindiamarket") {
  //  $('#demohref')[0].style.display = "none";
  //}

  if ($('#demohref').length) {
    var that = this;
    $('#demohref').click(function () { 
      var myFunc = function() {
        that.clickedOnDemo(); 
      };
      if(that.appMode && !that.openScale) {
        that.stopWebViewAsyncCalls(myFunc);
        return; 
      }
      if(that.openScale && !that.handheld) { 
        StageWebViewBridge.call('landmarkRouteIndex', null, {
          dirIndex:0
        }); 
      }
      myFunc();
    });
  }

  if($('#mapid').length && this.openScale) {
    var that = this;
    $('#mapid').click(function () {
      StageWebViewBridge.call('showMap', null, null);
    });
  }
}

vidteq._gui.prototype.clickedOnDemo = function () { 
  if(this.disableAutoPlay) { return; } 
  if (this.topBarUI && !this.openScale) {
    // TBD actually belongs to blocate extension 
    // Need to find a way to inherit the methods
    this.selectInTopPanel('div_demohref');
  }
  var tip = '';
  if (vidteq.aD.demoRoute.start) { tip = 'start'; } 
  if (vidteq.aD.demoRoute.end) { tip = 'end'; } 
  if (tip == '') { return; }
  this.routeEnds.removeAllVias();
  var otherTip = vidteq.utils.otherTip[tip];
  if(this.embed.locateStores) { 
    this.dirFromTo(otherTip,this.io.storeResponse.srf[0].results[0],true); 
  }
  if (vidteq.aD.demoRoute[tip].via) {
    this.routeEnds.addViaSet(vidteq.aD.demoRoute[tip].via,true);
  }
  if (!vidteq.aD.demoRoute[tip].geom.toString().match(/POINT/)) {
      vidteq.aD.demoRoute[tip].geom = "POINT("+vidteq.aD.demoRoute[tip].geom+")";
  }
  this.dirFromTo(tip,vidteq.aD.demoRoute[tip]);
  this.io.goVid();
}

vidteq._gui.prototype.attachFinalEvents = function (q) {
  //// added for rcm
  //if (typeof(vidteq.aD) != 'undefined' && 
  //    (vidteq.aD.q=='wayfinder-lite' || vidteq.aD.q=='blocate-lite' || vidteq.aD.q=='EScheduler')) {
  // this.mbox.rcmItems = [];
  //} else if (this.handheld) {
  //  this.mbox.rcmItems = this.rcmContext.getRcmItems(this);
  //  this.attachHandheldEvents();
  //} else if (this.appMode) {
  //  this.mbox.rcmItems = this.rcmContext.getRcmItems(this);
  //} else {
  //  this.attachRcmItems();
  //}
  if (!this.openScale) this.attachRcmItems();
  if (this.handheld) this.attachHandheldEvents();
  if(vidteq.aD.q == 'wayfinder-lite' || vidteq.aD.q == 'wayfinder') {
    if(vidteq.aD.landmarkRoutes) {
      $('#lmrForLite').css('display','block');
      this.attachLmrForLite();
    }
  }
  if(vidteq.aD.q == 'blocate') {
  /*$("#collapse-parent")[0].style.display='inline';
  $("#collapse")[0].onclick = function () {
      var state=$("#dynamicDiv")[0].style.display;
      if(state == 'block') {
        $('#dynamicDiv').hide('slow');
        $("#collapse").html(">>");
      }
      if(state == 'none') {
        $('#dynamicDiv').show('slow');
        $("#collapse").html("<<");
      }
  }*/
  }
}

vidteq._gui.prototype.fillKeyBox = function(entity,tip) {
  this.selectMode('ROUTE');
  if (entity.address && entity.address.name && 
      entity.address.name != 'Your location') {
    var val = entity.address.name;
    //val = val.toString().trim();
    val = vidteq.utils.trim(val);
    if(this.tIn ) {
      this.keyBox[tip].loadAndBlink(val);
    }
  } else {
    this.fillKeyBoxAfterFindhood(entity,tip);
  } 
  return true;
}

vidteq._gui.prototype.selectMode=function (whichOne) {
  if (this.mode == whichOne) { return true; }
  this.mode = whichOne;
  if (!this.tIn) { return true; }
  
  var starttextboxId = this.keyBox.start.id
  ,endtextboxId = this.keyBox.end.id
  ,el_start = $(starttextboxId)
  ,el_end = $(endtextboxId)
  ;
  
  if( whichOne=='ROUTE' ) {
    if( $('#locationtab').length ) { $('#locationtab').attr('class','inactive'); }
    if( $('#routetab').length ) { $('#routetab').attr('class','active'); }
    if( $('#helpdiv').length ) { $('#helpdiv').html(this.helpRoute); } 
    if( $('#swaptd').length ) { $('#swaptd').show(); }
    var selClass = 'small';
    if(this.topBarUI || this.sideBarUI) { selClass = 'small1'; }
    if( el_start.length ) { el_start.attr('class',selClass); }
    if( el_end.length ) { el_end.attr('class',selClass); }
    if( el_start.length ) { el_start.attr('tabindex',1); }
    if( el_end.length ) { el_end.attr('tabindex',2); }
    if( $('#GoVid').length ) { $('#GoVid').attr('tabindex',3); }
    if( el_start.length ) {
      var val = el_start.val();
      el_start.val((val==this.defaultLoc)?this.defaultTip.start:val);
    }
    this.keyBox.start.defaultValue = this.defaultTip.start;
    this.keyBox.start.defaultTitle = this.titleTip.start;
    this.displayMessage(this.defaultRouteMessage);
  }else {
    if( $('#locationtab').length ) { $('#locationtab').attr('class','active'); }
    if( $('#routetab').length ) { $('#routetab').attr('class','inactive'); }
    if( $('#helpdiv').length ) { $('#helpdiv').html(this.helpLocate); } 
    if( $('#swaptd').length ) { $('#swaptd').hide(); }
    if( el_start.length ) { el_start.attr('class','big'); }
    if( el_end.length ) { el_end.attr('class','smallhidden'); }
    if( el_start.length ) { el_start.attr('tabindex',1); }
    if( el_end.length ) { el_end.attr('tabindex',-1); }
    if( $('#GoVid').length) { $('#GoVid').attr('tabindex',2); }
    if( el_start.length) {
      var val = el_start.val();
      el_start.val((val==this.defaultTip.start)?this.defaultLoc:val);
    }
    this.keyBox.start.defaultValue = this.defaultLoc;
    this.keyBox.start.defaultTitle = this.titleLoc;
    var msg = this.defaultLocateMessage;
    if (this.embed.locatestores) { msg = this.defaultLocateStoresMessage; }
    this.displayMessage(msg);
  }
  return true;
}

vidteq._gui.prototype.attachLmrForLite = function () {
  //$('#lmrForLiteImage').attr('src',vidteq.imgPath.lmrForLite);
  var divToAttach = 'lmrForLite';
  var opt="<div id='lr_div' class=lmrForWayLiteDropDown ><div id='lr_div_inner' style='background-color:#ffffff;display:block;margin:0;padding:0;'><ul id='ul-dropdown' class='lmrForWayLiteDropDown'>";
  var count=0;
  for(var i in vidteq.aD.landmarkRoutes) {
    opt+='<li id='+count+'__landmark_route class=drop-down-list>'; 
    opt+='<a  class=headlink-drop-down>'+vidteq.aD.landmarkRoutes[i].address.name+'</a>';
    opt+='</li>';
    count++;
  }
  $('#'+divToAttach).append(opt+"</ul></div></div>");
  var maxW = 0;
  var maxH = 0;
  $('#lr_div ul li a').each(function () {
    maxH += $(this).height();
    if (maxW < $(this).width()) { maxW = $(this).width(); }
  });
  //if (maxW < $('#'+divToAttach).width()) { maxW = $('#'+divToAttach).width(); }
  maxW = parseInt(maxW*1.2);
  maxH = parseInt(maxH*1.5);
  $('#lr_div_inner').css('width',maxW+'px');
  $('#lr_div_inner').css('height',maxH+'px');
  var boxImage = { url:vidteq.imgPath.refBox8, cornerW:10, cornerH:10, boxW:510, boxH:378, offsetW:0, offsetH:0 };
  vidteq.utils.boxify(boxImage,'lr_div',{lt:1,rt:1,lb:1,rb:1});
  $('#lr_div').css('display','none');
  var totalCount=count;
  var that = this;
  for(count=0;count<totalCount;count++) {
    $('#'+count+'__landmark_route').click(function () {
      $('#lr_div').hide('slow',null);
      var index=parseInt(this.id);
      that.triggerOneLandmarkRoute(index);
      that.closeAnyDropDowns();
    });
  }
  $('#topStripLocateBar form').click(function (e) {
    if(e.target == e.currentTarget) {
      $('#lr_div').hide('slow',null);
    }
  });
  $('#lmrForLiteHref').click(function () {
    //if($('#lr_div')[0].style.display=='block') {
    if($('#lr_div').is(":visible")) {
      //ioAreaObj.selectInTopPanel('');
      $('#lr_div').hide('slow',null);
      //$('#landmarkroutes')[0].className='headlink';
      //$('#div_landmarkroutes')[0].className = 'top-panel-height';
    } else {
      //ioAreaObj.selectInTopPanel('div_landmarkroutes');
      $('#lr_div').show('slow',null);
      //$('#landmarkroutes')[0].className='headlink-clicked';
      //$('#div_landmarkroutes')[0].className = 'top-panel-height-clicked';
    }
  });
  
  var lmrForLiteTimer = function () {
    if(typeof(that.hideLrDiv) != 'undefined') clearTimeout(that.hideLrDiv);
    that.hideLrDiv = setTimeout(function() {
      $('#lr_div').hide('slow',null);
    },500);
  };
  $('#lmrForLiteImage').hover(function() {
    if(typeof(that.hideLrDiv) != 'undefined') clearTimeout(that.hideLrDiv);
    $('#lr_div').show('slow',null);
  },function () {
    lmrForLiteTimer();
  });
  $('#lr_div').hover(function() {  
    if(typeof(that.hideLrDiv) != 'undefined') clearTimeout(that.hideLrDiv);
  },function() {
    lmrForLiteTimer();
  });
  return;
}

vidteq._gui.prototype.triggerOneLandmarkRoute = function (index,click3dCheck) {
  this.routeEnds.removeAllVias();
  var lmr = vidteq.aD.landmarkRoutes[index];
  if (lmr.via) {
    this.routeEnds.addViaSet(lmr.via,true);
  }
  if (!lmr.geom.toString().match(/POINT/)) {
    lmr.geom = "POINT("+lmr.geom+")";
  }
  var that = this;
  if(this.appMode && !this.openScale) {
    this.stopVideoAsyncCalls(function() {
      that.dirFromTo('start',lmr);
    },function() {
      that.io.goVid();
    });
    return; 
  }
  if(this.openScale) { 
    this.dirLandmarkRoutesIndex = lmr;
    StageWebViewBridge.call('landmarkRouteIndex', null, {
      dirIndex:lmr
    }); 
  }
  this.dirFromTo('start',lmr);
  this.io.goVid();
  if(this.is3dmap && click3dCheck) {
  	this.mode3D = 'lmr';
  	//this.fvt.hideNew();
    setTimeout(function(){
      that.createAndShow3dmap();
    },5000);
  }
}


vidteq._gui.prototype.checkDefaults = function (emptyCheck) {
  if (!this.tIn) { return true; }
  var startValue = vidteq.utils.trim($('#starttextbox').val());
  var endValue = vidteq.utils.trim($('#endtextbox').val());
  if (this.mode == 'LOCATE') { 
    if (startValue.match(new RegExp("^"+this.defaultLoc+"$"))  ||
        (emptyCheck && startValue == '')) {
      this.displayMessage(this.defaultLocateMessage);
      return false;
    }
  }
  if (this.mode == 'ROUTE') {
    if (startValue.match(new RegExp("^"+this.defaultTip['start']+"$")) || 
         endValue.match(new RegExp("^"+this.defaultTip['end']+"$")) ||
         emptyCheck && (startValue == '' || endValue == '')) {
      if(this.embed) this.displayMessage(this.defaultRouteEmbedMessage);
      else this.displayMessage(this.defaultRouteMessage);
      return false;
    }
  }
  return true;
}

vidteq._gui.prototype.executeAllFunc=function (funcArray) {
  for (var i in funcArray) {(funcArray[i])();}
}

vidteq._gui.prototype.captureStartAndEnd=function () {
  if (this.tIn) {
    this.io.startAddress=vidteq.utils.trim(this.keyBox.start.val());
    this.io.endAddress=vidteq.utils.trim(this.keyBox.end.val());
  } else {
    this.io.startAddress=vidteq.routeEndsObj.getName('start');
    this.io.endAddress=vidteq.routeEndsObj.getName('end');
  }
}

vidteq._gui.prototype.postGoVidRequest = function () {
  this.postRequest(this.routeRequestLoader);
}

vidteq._gui.prototype.postRequest = function (sheer) {
  if (sheer == "bizSheer" && this.openScale) {
    $('#nearby').hide();
    $('#dsc').show();
  }
  vidteq.utils.undrapeCurtain(sheer);
  this.checkAndKillLoadingPrompt('',1);
  if(this.nemo) {
    this.categoryWgt.videoMap.afterVideoPlayed();
  }
}

vidteq._gui.prototype.checkAndKillLoadingPrompt = function (str,waitTime) {
  if(this.handheld)
    this.killHandheldPrompt();
  else {
    if (!$('#divLoading').length) { return; }
    if (!this.loadingPrompt) { return; }
    if (str != '') { this.loadingPrompt.putMessage(str); }
      this.loadingPrompt.animateAndKill(waitTime);
  }
}

vidteq._gui.prototype.preGoVidRequest = function () {
  if (this.sideBarUI) {
    this.closeFrontPage();
  } 
  if(!this.checkDefaults()) return false;
  if(this.topBarUI || this.sideBarUI) { $('#close-float-input').click(); }
  this.executeAllFunc(this.topClearList);
  this.checkAndFixLSCenter();
  this.captureStartAndEnd();
  this.preRequest('route',this.routeRequestLoader);
  return true;
}
vidteq._gui.prototype.checkAndFixLSCenter = function () {
  if (this.embed && this.embed.fix && this.embed.fix != '' &&
      (vidteq.routeEndsObj.isNotEmpty(this.embed.fix) && vidteq.routeEndsObj.tips[this.embed.fix].parentType=='locateStores')) {
    vidteq.routeEndsObj.remove(this.embed.fix,true);
    this.prepareCenterEntity(this.embed.place,this.embed.fix)
    vidteq.routeEndsObj.add(this.embed.fix,this.embed.place);
    // not understood fully TBD
    //vidteq.routeEndsObj.remove(this.embed.fix,true);
    //vidteq.routeEndsObj.addByIndex(this.embed.fix,1,'center');
    //this.showFixedTip();
    this.showFixedTipNew();
  }
}

vidteq._gui.prototype.prepareCenterEntity= function (entity,tip) {
  entity.type='center';
  if (entity.distance) { delete entity.distance; }
  if (entity.markIcon) { delete entity.markIcon; }
  if (entity.reqSeed) { delete entity.reqSeed; }
  var tip = typeof(tip) == 'undefined' ? 'start' : tip;
  this.embed.fix = tip;
  this.embed.other = vidteq.utils.otherTip[tip]; 
  this.io.populateIconContent(entity);
  if(!entity.lonlat) entity.lonlat=vidteq.utils.lonLatObjFrmPoint(entity.geom);
  if(!entity.popup) entity.popup={open:1};
  return entity;
}

vidteq._gui.prototype.detachCenter = function () {
  this.routeEnds.detachCenter();
  this.embed.fix = ''; this.embed.other = '';
  this.embed.fixed = null;
}

vidteq._gui.prototype.checkAndDoAutoLocateNBS = function (srfResponse) { 
  if (!this.embed || !this.embed.locateStores) { return false; }
  if (srfResponse.responseType=='locateStores') { return false; }
  if (srfResponse.srf[0].results.length != 1) { return false; }
  var myLoc = srfResponse.srf[0].results[0];
  myLoc.type = 'rcm';
  if (myLoc.markIcon) { delete myLoc.markIcon; }
  this.io.addAndLocateNBS(myLoc); 
  return true;
}

vidteq._gui.prototype.dirFromTo = function (tip,entity,noAutoGoVid) {
  if (this.handheld) this.closeMenus();
  this.doAutoSwap(tip,entity);
  vidteq.routeEndsObj.replaceEntity(tip,entity);
  this.checkAndDoAutoFix(tip,entity,noAutoGoVid); // only for locateStore
}

vidteq._gui.prototype.doAutoSwap = function (tip,entity) {
  var otherTip = vidteq.utils.otherTip[tip];
  var rE = vidteq.routeEndsObj;
  if (entity.parentType=='locateStores' && this.mode=='ROUTE') {
    if (rE.isNotEmpty(otherTip) && 
        rE.tips[otherTip].parentType=='locateStores') { 
      this.swapRoute();
    } else if (rE.isNotEmpty(tip) && 
               rE.tips[tip].parentType!='locateStores' ) {
      this.swapRoute();
    }   
  } else if (rE.isNotEmpty(tip) && 
             rE.tips[tip].type &&
             rE.tips[tip].type == 'center') {
    if (entity.type == 'center') {} else {
      this.swapRoute();
    }
  }
}

vidteq._gui.prototype.checkAndDoAutoFix = function (tip,entity,noAutoGoVid) {
  if (entity.parentType != 'locateStores') { return; }
  this.embed.place = entity;
  this.embed.fixed = entity;
  this.embed.fix = tip;
  this.embed.other = vidteq.utils.otherTip[tip];
  this.fvt.disableFvtFromTo(tip); 
  //this.showFixedTip();
  this.showFixedTipNew();
  this.doAutoGoVid(noAutoGoVid);
}

vidteq._gui.prototype.doAutoGoVid = function (noAutoGoVid) {
  if (!this.embed.place.parentType || this.embed.place.parentType != 'locateStores') { return; }
  if(typeof(noAutoGoVid) == 'undefined' || !noAutoGoVid ) {
    if (vidteq.routeEndsObj.isNotEmpty(this.embed.fix) &&  
        vidteq.routeEndsObj.isNotEmpty(this.embed.other)) {
      this.io.goVid();
    }
  }
}

vidteq._gui.prototype.preRequest = function (fvtMode,sheer) {
  if(!this.openScale && typeof this.cred !== 'undefined' ) {
    if(!this.handheld) 
      this.cred.popUserInfoQuery();
    else if(fvtMode == 'route')
      this.cred.popUserInfoQuery();
  }
  if(this.openScale && !this.handheld) { return; }
  if( this.hasDrapeSheer ) {
    vidteq.utils.drapeSheer(sheer);
  }
  if(this.embed) {
    if(this.handheld)
      this.handheldLoadPrompt();
    else {
      if( this.hasLoadingPrompt ) {
        this.loadingPrompt = new vidteq.utils.showLoadingPrompt();
      }
    }
    if (this.handheld || this.openScale) { 
    } else {
      this.fvt.showNew(fvtMode);
    }
  } else {
    if( this.hasLoadingPrompt ) {
      this.displayMessage(this.loadingDivMessage);
    }
  }
}

vidteq._gui.prototype.initHtml5Video = function  () {
  this.singlePlayer = false;
  //if(typeof($.client) != 'undefined' && $.client.os == 'iPad') { 
  //  this.singlePlayer = true; 
  //}
  this.flashPlayer = false;
  //this.flashPlayer = true;
  this.html5VideoParams = {};
  if(this.flashPlayer) {
    if(this.singlePlayer && $.client.browser == 'Safari'){
      vidteq.cfg.videoUrl = vidteq.cfg.videoUrlMp4;
      this.html5VideoParams = {
        extension:'.mp4',
        playerContainer:$('.singlePlayer').html()
      };
    }
  } else {
    if($.client.browser == 'Explorer' && ($.client.version == '8' || $.client.version == '7')){
      this.flashPlayer = true;
    } else if($.client.browser == 'Firefox'){
      vidteq.cfg.videoUrl = vidteq.cfg.videoUrlOgg;
      this.html5VideoParams = {
        extension:'.ogg',
        playerContainer:$('.dualPlayer').html()
      };
    } else if($.client.browser == 'Safari' || $.client.browser == 'Chrome' || ($.client.browser == 'Explorer' && $.client.version == '9')) {
      var container = $('.dualPlayer').html();
      if(this.singlePlayer) {
        container = $('.singlePlayer').html();
      } 
      vidteq.cfg.videoUrl = vidteq.cfg.videoUrlMp4;
      this.html5VideoParams = {
        extension:'.mp4',
        playerContainer:container
      };
    }
  }
}

vidteq._gui.prototype.playHtml5Video = function() {
  if(this.singlePlayer) {
    $('.singlePlayer').appendTo($('#VideoPlayerDiv'));
    $('.oldContainer').remove();
  } else {
    $('.dualPlayer').appendTo($('#VideoPlayerDiv'));
    $('.oldContainer').remove();
    var canvas1 = document.getElementById('processCanvas1');
    var canvas2 = document.getElementById('processCanvas2');
    if(canvas1 != null || canvas2 != null){
      var process1 = canvas1.getContext('2d');
      var process2 = canvas2.getContext('2d');
      canvas1.width = canvas1.width;
      canvas2.width = canvas2.width;
      function draw( ) {
        var gold1 = document.getElementById('video1');
        var gold2 = document.getElementById('video2');
        process1.drawImage(gold1, 0,0,480,320);
        process2.drawImage(gold2, 0,0,480,320);
      }
      setInterval(function () { draw(); },10);
    }
  }
  $('#gearLoader').show();
  videoPlaylist = new _videoPlaylist({singlePlayer:this.singlePlayer});
  videoPlaylist.init(window);
}

vidteq._gui.prototype.clearRouteAndSrf = function () {
  if(this.openScale) { return; }
  this.mbox.clearRouteAndSrf();
  this.fvt.clearRouteAndSrf();
  //TBD: verify
  if(this.nemo) {
    vidteq.routeEndsObj.remove('start');
    vidteq.routeEndsObj.remove('end');
    if(this.embed) {
      vidteq.routeEndsObj.remove(this.embed.fix,true);  
    }
  }    
  
  if(typeof(this.html5VideoParams) != 'undefined' && (!this.flashPlayer || this.singlePlayer)) { 
    this.playHtml5Video(); 
  }
  this.toggleButtons({'clearroutetab' : false,
                 'smstab' : false,
                 'printtab' : false,
                 'emailtab' : false,
                 'downloadtab' : false});
  this.executeAllFunc(this.topClearList);
  if(this.mode=='ROUTE') this.displayMessage('Route is Cleared');
  if(this.mode=='LOCATE' && document.getElementById("locadiv").innerHTML!='') {
    this.displayMessage('Location search is cleared');
  }
  if(this.topBarUI || this.sideBarUI) {
    this.routeSummary = '&nbsp;<br/>&nbsp;';
    $('#routeSummary').html('<a class=helptooltip1 >'+this.routeSummary+'</a>');
  }
  if ($('#divRoutePouchPop').length) {  $('#divRoutePouchPop').remove(); }
  if ($('#routePouchDiv').length && $('#routePouchDiv').is(':visible')) {
    $('#routePouchDiv').hide('fast'); // TBD you can remove onclick,image
  }
}

vidteq._gui.prototype.toggleButtons = function(buttonValuePairs) {
  var that = this;
  var buttonParams = {
    mapexpand : {   // TBD I think it is not used
      onTitle : 'Expand the Map and float the video',
      offTitle : 'This is not available for a empty route',
      onClickFunc: function () {changeLayout();return false;}
    },
    clearroutetab: {
      onTitle : 'Clear the Map',
      offTitle : 'Map is already cleared',
      onClickFunc: function () {
        that.clearAll();
        return false;
      }
    },
    smstab: {
      onTitle : 'Send text directions as SMS',
      offTitle : 'Select a route to enable this feature',
      outerDiv : 'smstabOuter',
      onClickFunc: function () { that.sped.clickedSmstab(); return false; }
    },
    emailtab: {
      onTitle : 'Email the current  route with/without images',
      offTitle : 'Select a route to enable this feature',
      outerDiv : 'emailtabOuter',
      onClickFunc : function () { that.sped.clickedEmailtab(); } 
    },
    minvideo: { // TBD I think it is never used
      onTitle : 'Hide the Video container',
      offTitle : 'Select a route to enable this feature',
      displayOnOff : true,
      onClickFunc : function () { clearVideoTd(); }
    },
    downloadtab : {
      onTitle : 'Download the complete route',
      offTitle : 'Select a route to enable this feature',
      onClickFunc : function () { 
        that.sped.createOldPopup(2,undefined,undefined,that.sped.prepareDownload());
      }
    },
    printtab : {
      onTitle : 'Print the text directions for complete route',
      offTitle : 'Select a route to enable this feature',
      outerDiv : 'printtabOuter',
      onClickFunc : function () {
        that.sped.clickedPrinttab($(this)[0].id);
     } 
    },
    localinkhref : {
      onTitle : 'Link to this search/route',
      outerDiv : 'locallinkhrefOuter',
      onClickFunc : function () {
        var id = this.id;
        if(that.nemo) {
          that.getDirectionLink( id );
        }
        that.sped.clickedLinktab( id );
      }
    },
    stores : {
      onTitle : 'Show all stores around Centre of '+vidteq.utils.ucFirst(vidteq.cfg.city),
      offTitle : 'Already in Stores mode',
      imageSrcEnabled : vidteq.imgPath.storesEnabled,
      imageSrcDisabled : vidteq.imgPath.storesDisabled,
      displayOnOff : true,
      onClickFunc : function () { that.clickedOnStores(); }
    }    
  };
  for (var i in buttonValuePairs) {
    if (!$("#"+i).length) continue;
    if (buttonValuePairs[i]) {
      if (this.embed) {
        //if(!this.sideBarUI) {
          $("#"+i).attr('class',"comlink");
        //}
        if (buttonParams[i].outerDiv) {
          if (!$('#'+buttonParams[i].outerDiv).is('.com-containerSub')) {
            $('#'+buttonParams[i].outerDiv).addClass('com-containerSub');
          }
        }
      } else $("#"+i).attr('class',"maptab");
      if (buttonParams[i].imageSrcEnabled) $("#"+i).attr('src',buttonParams[i].imageSrcEnabled);
      if (buttonParams[i].displayOnOff) $("#"+i).css('display','block');
      if (buttonParams[i].onClickFunc) {
        $("#"+i).unbind('click');
        $("#"+i).click(buttonParams[i].onClickFunc);
      }
      $("#"+i).attr('title',buttonParams[i].onTitle);
    } else {
      if (this.embed) {
        //if(!this.sideBarUI) {
          $("#"+i).attr('class',"comlinkDisabled");
        //}
        if (buttonParams[i].outerDiv) {
          $('#'+buttonParams[i].outerDiv).removeClass('com-containerSub');
        }
      } else $("#"+i).attr('class',"maptabdisabled");
      if(buttonParams[i].imageSrcDisabled) $("#"+i).attr('src',buttonParams[i].imageSrcDisabled);
      if(buttonParams[i].displayOnOff) $("#"+i).css('display','none');
      $("#"+i).unbind('click');
      $("#"+i).attr('title',buttonParams[i].offTitle);
    }
  }
}

vidteq._gui.prototype.clickedOnStores = function() {
  vidteq.routeEndsObj.remove('start',true);
  vidteq.routeEndsObj.remove('end',true);
  this.selectMode('LOCATE');
  this.keyBox.start.restoreDefaults();
  this.keyBox.end.restoreDefaults();
  this.io.locateNBS({
    sortby:'name',
    geom:'POINT('+vidteq.cfg.centerLon+' '+vidteq.cfg.centerLat+')',
    address:{name:"the centre of "+vidteq.utils.ucFirst(vidteq.cfg.city)+" City"}
  });
}

vidteq._gui.prototype.displayRoute = function(routeResponse) {
  this.toggleButtons({
    'smstab' : true,
    'emailtab' : true,
    'mapexpand' : true,
    'mapexpand' : true,
    'printtab' : true,
    'clearroutetab' : true,
    'downloadtab' : true
  });
  if(this.openScale) { 
    this.stageRouteResponse = routeResponse;
    if(!this.embed  ||
      (this.embed && this.embed.fix=='end')) {
      vidteq.routeEndsObj.add('start',routeResponse.startEntity);
    } 
    if(!this.embed  ||
      (this.embed && this.embed.fix=='start')) {
      vidteq.routeEndsObj.add('end',routeResponse.endEntity);
    }
  }
  if(!this.openScale) { this.mbox.displayRoute(routeResponse); }
  // Check with Raghu TBD if he is using it
  //if(this.openScale) { this.createOSDistances(routeResponse); }
  this.fvt.displayRoute(routeResponse);
  if(this.topBarUI || vidteq.vidNav) {//need to check
    this.routeSummary = this.prepareRouteSummary(routeResponse.summary,1); 
    // Above storage is for appMode as well
    $('#routeSummary').html('<a class=helptooltip1 >'+this.routeSummary+'</a>');
  } else if (this.sideBarUI) {
    this.routeSummary = this.prepareRouteSummary(routeResponse.summary,1); 
    $('#directionSummary').html('<a class=helptooltip1 style="color:white;" >'+this.summaryDetails['direction']+'</a>');
    $('#videoSummary').html('<a class=helptooltip1 >'+this.summaryDetails['video']+'</a>');
  } else {
    if( this.minDisplayMessage ) {
      this.displayMessage(this.prepareRouteSummary(routeResponse.summary,4));
    }else {
      this.displayMessage(this.prepareRouteSummary(routeResponse.summary,3));
    }
    if( this.embed ) {
      if( typeof(vidteq.aD) != 'undefined' && typeof(vidteq.aD.config) != 'undefined' ) {
        var routeSummaryOptions = { "divId": "divRoutePouchPop", "routeResponseRef": routeResponse, "fresh": true };
        if(vidteq.aD.q!='EScheduler') {
          if( !parseInt(vidteq.aD.config.routeSummaryDisable) ) {
            this.createRoutePouch( routeSummaryOptions );
          }else {
            if( !parseInt(vidteq.aD.config.routeSummaryBtnDisable) ) {
              this.routeSummaryBtn( routeSummaryOptions ); 
            }
          }
        }
      }
    }
  }
  if(typeof(this.html5VideoParams) != 'undefined' && (!this.flashPlayer || this.singlePlayer)) { 
    this.playHtml5Video(); 
  }
  //
  this.disableGoVid( this.cookieOptions );
}

// This has to be moved to reviseResponse section of io
// TBD
// Check with Raghu if he is using in ipad ?
// For now I am commenting it
//vidteq._gui.prototype.createOSDistances = function(response) {
//  var vid = response.vid;
//  var videos = response.video;
//  var allVideos = [];
//  var curVideoIdx = 0;
//  $.each(vid, function(n,elm){
//    allVideos.push(elm.video);
//    var numVids = parseInt(response.NumVvid[n]);             //Serialize vid and video
//    for( i=0; i<numVids ; i++ ){
//      allVideos.push(videos[curVideoIdx+i].VvidSource);
//    }
//    curVideoIdx += numVids;
//  });
//  var allLimits = [];
//  for (var i in allVideos) {
//    var d=parseFloat(allVideos[i].distance)*6378.137*3.1416/180; 
//    if (!allLimits.length) { allLimits.push(d); }            //sum distances 
//    else { allLimits.push(allLimits[allLimits.length-1] + d); }
//  }
//  var rLimits = [];
//  this.totalD = allLimits.pop();
//  var that=this;
//  $.each(allLimits,function(n,e){
//    rLimits.push(parseFloat(that.totalD - e));
//  });
//  this.allLimits = rLimits;
//}

vidteq._gui.prototype.createRoutePouch = function( options ) {
  options = options || {};
  var routeResponse = options.routeResponseRef
  ,fresh = options.fresh
  ,divId = options.divId = options.divId
  ;
  
  if(this.handheld){
    $('#text_holder').show();
    $('#myLocationButton').show();
    var summ=  this.prepareRouteSummary(routeResponse.summary);
    summ+="<br/><br/>Click 'T' for Text Directions";
    if( $('#handheld_routepouch_div').html() != summ){
      $('#handheld_routepouch_div').html(summ);
      $('#handheld_routepouch_div').show(1000);
      $('#handheld_routepouch_div').animate({top:'0px'},{duration:2000});
    }
    setTimeout(function () {$('#handheld_routepouch_div').hide();} , 6000);
  }else {
    //var divId = 'divRoutePouchPop';
    if ($("#"+divId).length) { return; }
    var animateTime = 4000;
    var routePouchDiv = "<div style='background-color:white;width:300px;padding:20px;' id='routePouchDiv'>"+this.prepareRouteSummary(routeResponse.summary,2)+"</div>";
    vidteq.utils.createPopupGeneric({html:routePouchDiv,margins:(5+4+2),closeClass:'close2'},{name:divId,factor:2,returnIfPresent:1, boxImage:{ url:vidteq.imgPath.refBox8, cornerW:10, cornerH:10, boxW:510, boxH:378, offsetW:0, offsetH:0 },animateTime:animateTime});
    if ($("#"+divId).data('timerset') == 'blah') { return; }
    $("#"+divId).data('timerset','blah');
    var animateStyle = $("#"+divId).data('animateStyle');
    $("#"+divId).data('oldLeft',animateStyle.left);
    setTimeout(function () {
      var con = $("#"+divId);
      if (!con.length) { return; }
      if (self.navigator.userAgent.match(/MSIE\s[7]/)) {
        con.hide('slow');
      } else {
        con.animate({left:parseInt($(window).width())+'px'},{duration:animateTime,complete:function () { con.hide();}}); 
      }
    },2*animateTime);
    if( fresh ) {
      this.routeSummaryBtn( options, animateTime );
    }
  }
}

vidteq._gui.prototype.routeSummaryBtn = function( options, animateTime ) {
  options = options || {};
  var divId = options.divId
  ,con = $("#"+divId)
  ,routeResponse = options.routeResponseRef
  ;
  animateTime = typeof animateTime !== 'undefined'? animateTime : 4000;
  //$("#routePouchImage").attr('src',vidteq.imgPath.routePouch);
  $("#routePouchDiv").show('slow');
  $("#routePouchDiv").unbind('click');
  var that = this;
  $("#routePouchDiv").click( function () {
    var con = $("#"+divId);
    if (!con.length) {
      that.createRoutePouch({ "divId": divId, "routeResponseRef": routeResponse, "fresh": false });
      return;
    }
    if (con.is(':visible')) { return; }
    con.show();
    con.animate({left:con.data('oldLeft')},animateTime);
    setTimeout(function () { 
      if (self.navigator.userAgent.match(/MSIE\s[7]/)){
        con.hide('slow');
      } else {
        con.animate({left:parseInt($(window).width())+'px'},{duration:animateTime,complete:function () { con.hide();}}); 
      }
    },2*animateTime);
  });
}

vidteq._gui.prototype.kmToMiles = function(kms) {
  return (parseFloat(kms) * 0.6214).toFixed(2);
}

vidteq._gui.prototype.prepareRouteSummary = function(summary,mode) {
  var tempSplit = summary.split("|")
  ,kms = tempSplit[0]
  ,vidTime = tempSplit[1]
  ,miles = this.kmToMiles(kms)//(parseFloat(tempSplit[0]) * 0.6214).toFixed(2)
  ,summaryHTML = ""
  ;
  this.summaryDetails = {};
  if (this.sideBarUI) {
    var l = vidteq.routeEndsObj.tips.start.address.name;
    var r = vidteq.routeEndsObj.tips.end.address.name;
    if (l.length + r.length > 60) {
      l = vidteq.utils.dotifyWords(l,30);
      r = vidteq.utils.dotifyWords(r,30);
    }
    var dirHTML="Directions From "+l+"&nbsp;";
    dirHTML+=" to "+r+"<br/>";
    this.summaryDetails['direction'] = dirHTML;
    var vidHTML = '';
    if(typeof(vidteq.aD) != 'undefined' && vidteq.aD.config.concealDistance == '1') {
      vidHTML+="&nbsp&nbsp;Video Time ~ "+vidTime+"<br>";
    } else {
      vidHTML+="Total Distance = "+kms+" Kms ("+miles+" Miles)<br>Video Time ~ "+vidTime+"<br>";
    }
    //if (!this.openScale) vidHTML+="Distance left: <span id='distanceLeft'>"+this.mbox.totalD.toFixed(2)+"</span>";
    this.summaryDetails['video'] = vidHTML;
  }
  if (mode==1) {
    if(this.openScale && !this.handheld) {
      summaryHTML="&nbsp;&nbsp;&nbsp;&nbsp;Directions From <b>"+vidteq.utils.dotify(vidteq.routeEndsObj.tips.start.address.name,21)+"&nbsp;</b>";
      summaryHTML+=" to <b>"+vidteq.utils.dotify(vidteq.routeEndsObj.tips.end.address.name,21)+"</b><br/>";
    } else {
      summaryHTML="&nbsp;&nbsp;&nbsp;&nbsp;Directions From <b>"+vidteq.routeEndsObj.tips.start.address.name+"&nbsp;</b>";
      summaryHTML+=" to <b>"+vidteq.routeEndsObj.tips.end.address.name+"</b><br/>";
    }
    if(typeof(vidteq.aD) != 'undefined' && vidteq.aD.config.concealDistance == '1') {
      summaryHTML+="&nbsp;&nbsp;&nbsp;&nbsp;Video Time ~ <b>"+vidTime+"</b> ";
    } else {
      summaryHTML+="&nbsp;&nbsp;&nbsp;&nbsp;Total Distance = <b>"+kms+" Kms ("+miles+" Miles)</b>&nbsp;&nbsp; Video Time ~ <b>"+vidTime+"</b> ";
      //if (!this.openScale) summaryHTML+="Distance left: <span id='distanceLeft'>"+this.mbox.totalD.toFixed(2)+"</span>";
    }
  } else if (mode==2) {
    summaryHTML="<a class=helptooltip1 style='font-size:12px'>";
     if(typeof(vidteq.routeEndsObj.tips.start)!='undefined'){
       summaryHTML+="Directions From <b>"+vidteq.routeEndsObj.tips.start.address.name+"&nbsp;</b>";
    }
    if(typeof(vidteq.routeEndsObj.tips.end.address)!='undefined'){
       summaryHTML+="to <b>"+vidteq.routeEndsObj.tips.end.address.name+"</b><br/><br/>";
    }
    summaryHTML+="Total Distance = <b>"+kms+" Kms ("+miles+" Miles)</b>&nbsp;&nbsp;Video Time ~ <b>"+vidTime+"</b>";
    summaryHTML+='</a>';
  } else if (mode==3) {
    if(typeof(vidteq.aD) != 'undefined' && vidteq.aD.config.concealDistance == '1') {
      summaryHTML+="&nbsp&nbsp;Video Time ~ <b>"+vidTime+"</b>";
    } else {
      summaryHTML+="Total Distance = <b>"+kms+" Kms ("+miles+" Miles)</b>&nbsp&nbsp;Video Time ~ <b>"+vidTime+"</b>";
    }
  } else {
    summaryHTML+="<span>"+kms+" Kms ("+miles+" Miles)</span>";
  }
  return summaryHTML;
}

vidteq._gui.prototype.invokeLSFirstTimeRule = function() {
  var ftRule = this.embed.firstTimeRule;
  var tip = 'start';
  if (ftRule.end && !ftRule.end.storeSubid) { tip = 'end'; }
  ftRule[tip].type = 'rcm';
  this.io.addAndLocateNBS(ftRule[tip],tip);
  var otherTip = vidteq.utils.otherTip[tip];
  var sel = 0;
  if (ftRule[otherTip] && ftRule[otherTip].storeSubid) {
    sel = parseInt(ftRule[otherTip].storeSubid);
  }
  var that = this;
  var checkFunc = function () { return that.io.locateNBSComplete; };
  var fireFunc = function () { 
    var res = that.io.srfResponse.srf[0].results;
    for (var i in res) { 
      if (parseInt(res[i].storeSubid) != sel) { continue; }
      that.dirFromTo(otherTip,res[i]);
      break;
    }
  }
  var t = new vidteq.utils.waitAndFire(checkFunc,fireFunc);
}

vidteq._gui.prototype.invokeFirstTimeRule = function(ftRule) {
  ftRule = ftRule || (
    (this.embed && this.embed.firstTimeRule) ? this.embed.firstTimeRule : 
    (vidteq.firstTimeRule || null)
  );
  if (!ftRule) { return; }
  //if (typeof(ftRule) == 'undefined') {
  //  if (this.embed && this.embed.firstTimeRule) { 
  //    var ftRule = this.embed.firstTimeRule;
  //  } else { return; }
  //}
  if(this.appMode) {
    vidteq.utils.drapeSheer('appModeFTR');
  }
  //if (!this.embed.firstTimeRule) { return; }
  //var ftRule = this.embed.firstTimeRule;
  this.curtainLoaderHide();   
  if (typeof(ftRule.venue) != 'undefined') {
    ftRule.noFrontCurtain = 1;
    this.closeFrontPage();
    this.createAndShowVenue(ftRule.venueAutoShow);
    if (ftRule.venue == "ie8") {
      this.IE8FirstTime = true;
    }
    return;
  } 
  if( ftRule.behaveAs && ftRule.behaveAs === 'neighbourhood' ) {
    var options = {
      manner:ftRule.manner || 'explore'
      ,threeDWgtRequired:true
      ,skyview:false
    }  
    this.mbox.olPopupType = "Anchored";
    this.disableAutoPlay = true;
    this.invokeNeighbourhood(options);
    this.attachEventsToNeighbourhood3D(options);
    $('#'+this.ids.neighbourhood3D).show();    
    this.delayAutoPlay3D();
    return;
  }
  if( ftRule.behaveAs && ftRule.behaveAs == 'lite'
      && ftRule.manner && ftRule.manner == 'VideoRoute' ) {
    this.mbox.olPopupType = "Anchored";
    if(vidteq.aD.landmarkRoutes) {
      this.attachLmrForLite();
      this.clickedOnDemo();
    }
    return;
  }
  if (typeof(ftRule.mapviewurlid) != 'undefined') {
    if(typeof(ftRule.explore) == 'undefined') {
      if(!this.openScale && !this.handheld) {
        this.doAutoPlay();
      }
    }
    $('#backSideMap').css({'display':'block'});
    var that = this;
    $('#backSideMap').click(function () {  
      document.location.href = "embed3.php?city="+vidteq.cfg.city+"&urlid="+ftRule.mapviewurlid;          
    });
  }
  if (ftRule.locate) {
    ftRule.locate['sortby'] = 'name';
    this.io.locateNBS(ftRule.locate);
  } else if (ftRule.explore) {
    ftRule.noFrontCurtain = 1;
    $("#bizdisplay").trigger("click");
    return; 
  } else if ((ftRule.start || ftRule.end) && this.embed && this.embed.locateStores)  {
    this.invokeLSFirstTimeRule();
  } else if (typeof(ftRule.lmRoute) != 'undefined')  {
    ftRule.noFrontCurtain = 1;
    var lmCount = ftRule.lmRoute;
    if ($('#'+lmCount+'__landmark_route').length) {
      $('#'+lmCount+'__landmark_route').click();
    }
    if(this.sideBarUI) {
      this.selectInTopPanel('div_landmarkroutes');
      this.triggerOneLandmarkRoute(lmCount);
    }
  //} else if (typeof(ftRule.myLoc) != 'undefined')  {
  //  //if (!this.handheld) { return; }
  //  var that = this;
  //  var w = new vidteq.utils.waitAndFire(function () {
  //    if (that.myLoc && that.myLoc.myLocValid) return true;
  //    return false;
  //  },function () {
  //    $('#goFromHere').click();
  //  });
  } else if (ftRule.start || ftRule.end) {
    if (this.checkAndDoYourLoc(ftRule)) {
      return;
    }
    var tip = 'start';
    if (ftRule.end) { tip = 'end'; }
    if(this.sideBarUI) {
      var myRouteArg = [];
      for(var i in ftRule) {
        if(i == 'start') {
          myRouteArg.push(ftRule[i].address.name,'from',ftRule[i].suggestedObj);
        } else if (i == 'end') {
          myRouteArg.push(ftRule[i].address.name,'to',ftRule[i].suggestedObj);
        }
      }
      this.doAutoSwap(tip,ftRule[tip]);
      this.selectInTopPanel('div_driving-dir-video-link');
      this.triggerGoVid.apply(this,myRouteArg);
      return;
    }
    //var tip = 'start';
    //if (ftRule.end) { tip = 'end'; }
    if(vidteq.utils.getSafe('vidteq.aD.q') && vidteq.aD.q == 'EScheduler') {
    //if(typeof(ftRule.noFrontCurtain) != 'undefined' && ftRule.noFrontCurtain) {
      ftRule.noFrontCurtain = 0;
      this.createAndShowFrontPage(false);
    } else {
      ftRule.noFrontCurtain = 1;
    }
    //if (!ftRule[tip].geom.toString().match(/POINT/)) {
    //  ftRule[tip].geom = "POINT("+ftRule[tip].geom+")";
    //}
    this.sanitizeEntities(ftRule[tip]);
    this.dirFromTo(tip,ftRule[tip]);
    if(ftRule[tip].via) {
      this.routeEnds.addViaSet(ftRule[tip].via,true);
    }
    this.io.goVid();
  }
}

vidteq._gui.prototype.delayAutoPlay3D=function () {
  var that = this;
  if(typeof(this.autoPlay3D) != 'undefined') { clearTimeout(this.autoPlay3D); }
  this.autoPlay3D = setTimeout(function() {
    $('#'+that.ids.neighbourhood3D).click();
  },5000);
}

vidteq._gui.prototype.checkAndDoYourLoc=function (ftRule) {
  var yourLocTip = null;
  if (ftRule.start && ftRule.start.yourLoc) {
    yourLocTip = 'start';
  }
  if (ftRule.end && ftRule.end.yourLoc) {
    yourLocTip = 'end';
  }
  if (yourLocTip) { } else { return; }
  otherTip = vidteq.utils.otherTip[yourLocTip];
  if (this.embed && ftRule[otherTip]) { return; } // both are there 
  if (this.embed || ftRule[otherTip]) { } else { return; } // both are not
  var that = this;
  var myLocTip = yourLocTip; // now yourLoc in ftRule becomes myLoc
  this.waitForMyLoc(myLocTip,function () {
    that.doYourLoc(otherTip,ftRule);
  })
}

// TBD can be generalized
vidteq._gui.prototype.doYourLoc = function (otherTip,ftRule) {
  if (ftRule[otherTip]) {
    this.sanitizeEntities(ftRule[otherTip]);
    this.dirFromTo(otherTip,ftRule[otherTip]);
    if(ftRule[otherTip].via) {
      this.routeEnds.addViaSet(ftRule[otherTip].via,true);
    }
  }
  if (vidteq.mobUI) {
    vidteq.mobUI.goVid();
  } else {
    this.io.goVid(); // TBD
  }
}

vidteq._gui.prototype.waitForMyLoc = function (yourLocTip,callback) {
  // check for valid postion every 15 second for 3 minutes
  // then ask user about his location
  // TBD can I use waitAndFire ?
  var attempts = parseInt(3*60/15);
  var that = this;
  var invokeYourLoc = function () {
    attempts--;
    if (!vidteq.mobUI || attempts<0 || that.lastMyLoc) {
      clearInterval(myLocTimer);
      if (that.lastMyLoc) {
        that.keyBox[yourLocTip].clickMyLoc(); // TBD is it ok ?
      } else {
        var myLoc = that.askMyLoc();
        if (!myLoc) { return; } // user refused
        $(that.keyBox[yourLocTip].id).val(myLoc);
      }
      callback();
    }
  }
  var myLocTimer = setInterval(invokeYourLoc,15*1000);
  invokeYourLoc();
}

vidteq._gui.prototype.askMyLoc = function () {
  return false; // TBD make a form where you can ask people fo their loc
}

vidteq._gui.prototype.sanitizeEntities=function (entity) {
  if (entity.geom && !entity.geom.toString().match(/POINT/)) {
    entity.geom = "POINT("+ftRule[tip].geom+")";
  }
  if (entity.empId) {
    entity.type = 'employee';
    var img = vidteq.imgPath.man;
    var imgArr = vidteq.imgPath.manMarkers;
    if (entity.gender && entity.gender == 'Female') {
      img = vidteq.imgPath.woman;
      imgArr = vidteq.imgPath.womanMarkers;
    }
    if (entity.order) {
      img = imgArr[parseInt(entity.order)].div;
    }
    entity.icon = {mapUrl:img+'?r='+vidteq.cfg._rStr,w:32,h:32};
  }
  if (entity.via) {
    for (var i in entity.via) {
      this.sanitizeEntities(entity.via[i]);
    }
  }
}

vidteq._gui.prototype.swapRoute=function () {
  this.keyBox.start.swap();  // start or end does not matter
  // callback is called to do rest of job
}

//vidteq._gui.prototype.swapRoute=function () {
//  this.keyBox.start.swapMineWith(this.keyBox.end);
//  //var tempVal=$('#starttextbox').val();
//  //$('#starttextbox').val($('#endtextbox').val());
//  //$('#endtextbox').val(tempVal);
//  //if ($('#starttextbox').val() == this.defaultTip['end']) {
//  //  $('#starttextbox').val(this.defaultTip['start']);
//  //}
//  //if ($('#endtextbox').val() == this.defaultTip['start']) {
//  //  $('#endtextbox').val(this.defaultTip['end']);
//  //}
//  this.swapRouteCallback();
//}

vidteq._gui.prototype.swapRouteCallback = function (opt) {
  var opt = opt || {};
  //if(vidteq.aD.account=='Sobha_Forest_View' && vidteq.gui.handheld && vidteq.gui.openScale)   return;
  this.displayMessage("&nbsp");
  //if(typeof(vidteq.mboxObj) == 'undefined') { return false; }
  // TBD
  if(typeof(vidteq.mboxObj) != 'undefined' && !vidteq.utils.isObjectEmpty(vidteq.mboxObj)) {
    this.mbox.killRcmPopup(); 
    var routeWasActive = false;
    if (this.mbox.routeActive) {  // clean up the route 
      this.clearRouteAndSrf(); 
      routeWasActive = true;
    }
    if (this.mbox.srfActive) {  this.io.swapSrfResponse(); }  
  }
  if (opt.rEAlreadySwapped) { } else {
    vidteq.routeEndsObj.swap(); 
  }
  if(this.embed) {   // now swap fixed end
    if (this.embed.fix != '') {
      this.embed.fix=vidteq.utils.otherTip[this.embed.fix];
      this.embed.other=vidteq.utils.otherTip[this.embed.other];
      if (opt.rEAlreadySwapped) { } else {
        //this.showFixedTip();
      }
      if (this.openScale) {
        StageWebViewBridge.call('fixTip', null, {tip:this.embed.fix});
      }
    }
    //if (!routeWasActive && ioAreaObj.embed.blocate) blocateCategoryList();
    //if (!routeWasActive && ioAreaObj.embed.blocate) ioAreaObj.locateNearByBiz();
    //if (!routeWasActive && ioAreaObj.embed.blocate) ioAreaObj.locateNBBDefault();
  }
  if(typeof(vidteq.mboxObj) == 'undefined') { return false; }
  if (this.mbox.srfActive) { 
    this.fvt.prepareForShowSrf(this.io.srfResponse);
    this.writeSrfToTable();
  }
  /*
  //TBD: auto go vid On swap not working correctly
  if( typeof vidteq.aD !== 'undefined' && vidteq.aD.urlId == "indiaproperty" ) {
    this.io.goVid();
  }
  */
  return false;
}

// new function is coded to keep backward compatibility
vidteq._gui.prototype.showFixedTipNew = function () {
  if (!this.embed) return;  // TBD is it ok ?
  if (this.embed.fix == '') return;
  var tip = this.embed.fix;
  var otherTip = this.embed.other;
  if (this.tIn) {
    this.keyBox[otherTip].unfixTipEntity();
    this.keyBox[tip].fixTipEntity(this.embed.place);
  }
  this.popupCenter(); // TBD is it needed
  //if (this.handheld) {} else {
  //  if (this.embed.place && this.embed.place.popup && 
  //      this.embed.place.popup.open==1 &&
  //      this.mbox.popoutCenterPlace) 
  //    this.mbox.popoutCenterPlace(); 
  //}
}

//vidteq._gui.prototype.showFixedTip = function () {
//  if (!this.embed) return;
//  if (this.embed.fix == '') return;
//  var tip = this.embed.fix;
//  var otherTip = this.embed.other;
//  if (this.tIn) {
//    var name = '';
//    if (this.embed.place && this.embed.place.address &&
//        this.embed.place.address.name) {
//      name = this.embed.place.address.name;
//    }
//    this.keyBox[otherTip].unfixTip(true);
//    this.keyBox[tip].fixTip(name);
//    //if (this.embed.place && this.embed.place.address &&
//    //    this.embed.place.address.name) {
//    //  $('#'+tip+'textbox').attr('title',this.embed.place.address.name);
//    //} else {
//    //  $('#'+tip+'textbox').attr('title','');
//    //}
//    //$('#'+otherTip+'textbox').attr('title',this.keyBox[otherTip].defaultTitle);
//    //$('#'+tip+'textbox').attr('readonly',1);
//    //$('#'+otherTip+'textbox').attr('readonly',null);
//  }
//  this.popupCenter();
//  //if (this.handheld) {} else {
//  //  if (this.embed.place && this.embed.place.popup && 
//  //      this.embed.place.popup.open==1 &&
//  //      this.mbox.popoutCenterPlace) 
//  //    this.mbox.popoutCenterPlace(); 
//  //}
//}

vidteq._gui.prototype.showSrf = function(srfResponse,which) {
  //this.mbox.clearAll();
  // TBD which use - this function may be called from fvt objects
  // this need to be veryfied again
  this.fvt.prepareForShowSrf(srfResponse); 
  this.writeSrfToTable();
  this.toggleButtons({'clearroutetab' : true});
}

vidteq._gui.prototype.writeSrfToTable = function() {
  // we implicit assume io.srfResponse is accessible so that doms can access it
  if(!this.openScale) this.mbox.cleanSrf();
  var from = 0;
  for (var i in this.io.srfResponse.srf) {
    from = this.io.populateMarkers(this.io.srfResponse.srf[i],from);
    this.fvt.writeSrfToTable(this.io.srfResponse.srf[i]);
    //if(this.openScale) {
    //  StageWebViewBridge.call('writeSrfToTable', null, {srf:this.io.srfResponse.srf[i]});
    //  // Now I need to undrape in openScale as stage is resized
    //}
    if(!this.openScale) this.mbox.writeSrfToTable(this.io.srfResponse.srf[i]);
  }
  if(this.openScale && !this.handheld) {
    var lastSearchCat = this.embed.blocate.lastSearchCategory;
    var that = this; 
    setTimeout( function() { 
      StageWebViewBridge.call('writeSrfToTable', null, {srf:that.io.srfResponse.srf,lastSearchCat:lastSearchCat}); },
      500
    );
  }
  if(!this.openScale) { this.mbox.writeSrfToTableFinish(this.io.srfResponse.srf[i]); }
}

vidteq._gui.prototype.prepareOldPanel = function() {
  var that = this;
  var elems =[
   {"id":"myPlace",
    //"image":vidteq.imgPath.myplace,
    "click": function () { that.clickedOnMyPlace(); },
    "check": function () {
      if(vidteq.aD.customVideo &&
         vidteq.utils.trim(vidteq.aD.customVideo) != '') { return true; }
      return false;
    }
   },
   {"id":"venue",
    "eventAttacher": function () { that.attachEventsToVenue(); },
    "text":"360 View",
    "check":function () {
      if (typeof(vidteq.aD.places) != 'undefined' && vidteq.aD.places.venue && vidteq.aD.places.venue !='') {
        return true; 
      } else { return false; }
    }
   },
   {"id":"demohref",
    "text":"Demo",  // event is attached in regular way TBD
    "check":function () {
      if (vidteq.aD.demoRoute && 
          !vidteq.utils.isObjectEmpty(vidteq.aD.demoRoute)) { 
        if ('config' in vidteq.aD && 
            'demoBtnDisable' in vidteq.aD.config) {
          if (parseInt(vidteq.aD.config.demoBtnDisable)) {
            return false;
          } else {
            return true;
          }
        }
        return true; 
      }
      return false;
    }
   },
   {"id":"lastMile",
    //"image":vidteq.imgPath.lastmile,
    "click": function () { that.clickedOnLastMile(); },
    "check": function () {
      if(vidteq.aD.lastMile) { return true; }
      // TBD check if it has property
      return false;
    }
   }
  ];
  for(var i in elems) {
    if (elems[i].check && !elems[i].check()) continue;
    $('#'+elems[i].id).show();
    $('#'+elems[i].id).parent().show();
    $('#'+elems[i].id).attr('src',elems[i].image);
    if (elems[i].click) { $('#'+elems[i].id).click(elems[i].click); }
    if (elems[i].eventAttacher) { elems[i].eventAttacher(); }
  }
}

vidteq._gui.prototype.clickedOnMyPlace = function() {
  this.fvt.showNew('route');
  // Spoof auto play
  this.io.glbAjxRoute = true;
  this.clearAll();
  var n=vidteq.aD.places.center.entity.address.name
  n=n.toString()
  this.fvt.playCustomVideo("B|Clearing the video",vidteq.aD.customVideo,vidteq.aD.customVideoDuration,n,"clear",true);
  this.fvt.launchVideoPlayerFirstTime();
  this.popupCenter();
  //if (this.embed.place.popup && 
  //    this.embed.place.popup.open==1 &&
  //    this.mbox.popoutCenterPlace ) 
  //  this.mbox.popoutCenterPlace();
  // TBD center handling needs re-look
  $("#directions_div").html('<div class=customcontent>'+vidteq.aD.customHtml+'</div>');
  $("#directions_div")[0].style.overflow='auto';
  this.displayMessage(this.defaultRouteEmbedMessage);
}

//vidteq._gui.prototype.clickedOnMyLoc = function() {
//  if (!this.myLoc || !this.myLoc.myLocValid) {
//    alert("Please enable your location");
//    return;
//  }
//  //if (this.handheld) { // TBD what is the convention ?
//  //  this.handheldUI.prepareForRouteInHandheld();
//  //}
//  this.routeEnds.removeAllVias();
//  this.dirFromTo('start',this.myLoc); 
//  this.io.goVid();
//}

vidteq._gui.prototype.clickedOnLastMile = function() {
  //if (this.handheld) {
  //  this.handheldUI.prepareForRouteInHandheld();
  //}
  this.routeEnds.removeAllVias();
  if(this.embed.locateStores) { 
    // TBD this is completely wrong
    this.dirFromTo('end',0,'locateStores',true); 
  }
  var lm = vidteq.aD.lastMile.start;
  if (lm.via) {
    this.routeEnds.addViaSet(lm.via,true);
  }
  if (!lm.geom.toString().match(/POINT/)) {
    lm.geom = "POINT("+lm.geom+")";
  }
  this.dirFromTo('start',lm); 
  this.io.goVid();
}

vidteq._gui.prototype.clearAll = function() {
  this.routeEnds.removeAllVias();
  if(!this.openScale)this.mbox.clearAll();
  this.fvt.clearRouteAndSrf();
  this.clearRouteAndSrf();
  if(this.embed) {
    vidteq.routeEndsObj.remove(this.embed.other);
  } else {       
    vidteq.routeEndsObj.remove('start');
    vidteq.routeEndsObj.remove('end');
  }
}

vidteq._gui.prototype.makeRcmEntityAsTip = function (which,entity) {
  if (this.mbox.routeActive) {
    //this.clearViaMarkers();
    this.routeEnds.removeAllVias(); 
    this.clearRouteAndSrf();
  }
  // TBD above needs refinement
  this.mbox.killRcmPopup();
  this.routeEnds.replaceEntity(which,entity);
}

vidteq._gui.prototype.attachRcmItems = function () {
  this.mbox.rcmItems = [];
  if (typeof(vidteq.aD) != 'undefined' && 
      (vidteq.aD.q=='wayfinder-lite' || vidteq.aD.q=='blocate-lite' || vidteq.aD.q=='EScheduler')) {
   //this.mbox.rcmItems = [];
   return;
  } else if (this.handheld) {
    // commented as no longer works
    //this.mbox.rcmItems = this.rcmContext.getRcmItems(this);
    return;
  } else if (this.appMode) {
    //if(!this.wap) this.mbox.rcmItems = this.rcmContext.getRcmItems(this);
    return;
  } 
  var that = this;
  this.mbox.rcmItems = [
    { id:"clearoption0",text:"Clear",disabled:false,
      cond: function () {
        //if (document.getElementById("clearroutetab") && (document.getElementById("clearroutetab").className!='maptabdisabled' || document.getElementById("clearroutetab").className!='maptabdisabled1')) { return true; } else { return false; }
        // TBD not same as above check again
        if ($('#clearroutetab').hasClass('maptabdisabled') ||
            $('#clearroutetab').hasClass('maptabdisabled1')) {
          return false;
        } else { return true; }
      },
      onClickFunc: function () { that.clearAll(); }
    },
    { id:"clearoption1",text:"Clear",disabled:true,
      cond: function () {
        //if (document.getElementById("clearroutetab") && (document.getElementById("clearroutetab").className!='maptabdisabled' || document.getElementById("clearroutetab").className!='maptabdisabled1')) { return false; } else { return true; }
        // TBD not same as above check again
        if ($('#clearroutetab').hasClass('maptabdisabled') ||
            $('#clearroutetab').hasClass('maptabdisabled1')) {
          return true;
        } else { return false; }
      },
      onClickFunc : function () { void(0); }
    } ,
    { id:"locateStores",
      text:"Locate Nearby "+((that.embed && that.embed.locateStores)?that.embed.locateStores.storeName:" Store"),disabled:false,
      cond: function () {
        if(that.embed && that.embed.locateStores) { 
          return true; 
        } else { return false; }
      },
      onClickFunc : function (entity) { 
        var p = {
          geom:"POINT("+entity.lonlat.lon+" "+entity.lonlat.lat+")",
          type:"rcm",
          address:{name:'Your location'}
        };
        that.io.addAndLocateNBS(p);
      }
    },
    { id:"viaoption0",text:"Via",disabled:false,
      cond: function () {
        //if(typeof(vidteq.aD) != 'undefined' && (vidteq.aD.urlId == "Artha_Brickfield_Gempark" || vidteq.aD.urlId =="Artha_NEO")) return false;
        if (that.embed && that.embed.locateStores && 
            that.mbox.routeActive) { 
          return true; 
        } else { return false; }
      },
      onClickFunc : function (entity) {  
        that.routeEnds.addVia({
          geom:'POINT('+entity.lonlat.lon+' '+entity.lonlat.lat+')'
          ,lonlat:entity.lonlat
        }); 
        that.io.goVid();
      }
    },
    { id:"viaoption1",text:"Via",disabled:false,
      cond: function () { 
        //if(typeof(vidteq.aD) != 'undefined' && (vidteq.aD.urlId == "Artha_Brickfield_Gempark" || vidteq.aD.urlId =="Artha_NEO")) return false;
        if(that.embed && that.embed.locateStores) { 
          return false; 
        } else { 
          if (that.mbox.routeActive) { 
            return true; 
          } else { 
            return false; 
          } 
        }
      },
      onClickFunc : function (entity) { 
        that.routeEnds.addVia({
          geom:'POINT('+entity.lonlat.lon+' '+entity.lonlat.lat+')'
          ,lonlat:entity.lonlat
        }); 
        that.io.goVid();
      }
    },
    { id:"startoption",text:"Directions From",disabled:false,
      cond: function () {
        if (that.embed && that.embed.locateStores) { 
          return false; 
        } else { return true; }
      },
      onClickFunc : function (entity) { 
        //that.mbox.makeRcmEntityAsTip('start');
        that.makeRcmEntityAsTip('start',entity);
        if (that.embed) { that.io.goVid(); }
      }
    },
    { id:"endoption",text:"Directions To",disabled:false,
      cond: function () {
        if (that.embed && that.embed.locateStores) { 
          return false; 
        } else { return true; }
      },
      onClickFunc : function (entity) { 
        //that.mbox.makeRcmEntityAsTip('end');
        that.makeRcmEntityAsTip('end',entity);
        if (that.embed) { that.io.goVid(); }
      }
    },
    { id:"govidoption",text:"GO VID",disabled:false,
      cond: function () {
        if (that.mbox.routeActive) { 
          return false; 
        } else { return true; }
      },
      onClickFunc : function (entity) { that.io.goVid(); return false; }
    }
  ];
}

vidteq._gui.prototype.showHomeExtent = function () {
  if (this.openScale) { return; }
  if (vidteq.utils.getSafeTrim('vidteq.aD.config.homeZoom') != '') {
  //if (typeof(vidteq.aD.config.homeZoom) != 'undefined' && vidteq.utils.trim(vidteq.aD.config.homeZoom) != '') {
    this.mbox.map.setCenter(new OpenLayers.LonLat(this.embed.place.lonlat.lon,this.embed.place.lonlat.lat),vidteq.aD.config.homeZoom); 
    return;
  }
  if (vidteq.utils.getSafeTrim('vidteq.aD.config.homeExtent') != '') {
    // TBD front curtain if present
    var extent=vidteq.aD.config.homeExtent;
    var ll=extent.split(',');
    if (ll.length != 4) { return true; }
    for(i=0;i<=3;i++){ parseFloat(ll[i]); }
    this.mbox.zoomToGivenBound(ll[0],ll[1],ll[2],ll[3]);
    return true;
  }
}

vidteq.debugPrint = function (inVar) {
  if (vidteq.cfg.debug) {
    //try { console.log(inVar); } catch (e) {
      //if (vidteq.debug) alert(inVar);
   // };
  }
};

vidteq._gui.prototype.fillKeyBoxAfterFindhood = function (entity,tip) {
  this.doAutoSwap(tip,entity);
  if (this.tIn && this.keyBox[tip]) { this.keyBox[tip].loadPointInfo(); }
  var that = this;
  this.io.getPointInfo(entity,{callback:function(res) {
    if (!entity.address) { entity.address = {name:res.road}; }
    entity.address.name = res.road;
    // TBD can we overwite everytime ? 
    that.completedGetPointInfo(res.road,tip);
  }});
}

vidteq._gui.prototype.completedGetPointInfo = function (val,tip) {
  if (this.tIn && this.keyBox[tip]) { this.keyBox[tip].loadedPointInfo(val); }
  // Not sure if it is right TBD - need to somehow changed poped up value
  if ($('#locadiv_your_loc').val() == 'Your Location') {
    $('#locadiv_your_loc').val(val);
  }
}

vidteq._gui.prototype.doAutoPlay = function () {
  var a = {
    demoRoute:{button:'demohref',msg:'Auto playing Demo Route ...'},
    lastMile:{button:'lastMile',msg:'Auto playing Last Mile Route ...'}
  };
  if(this.disableAutoPlay) { return; }
  for (var i in a) {
    if (!vidteq.aD[i]) { continue; }
    var seed = vidteq.aD[i];
    if (!seed.autoPlay || vidteq.utils.trim(seed.autoPlay) == '') { continue; }
    var params = a[i];
    var that = this;
    var delayedAutoPlay = function () {
      if (that.io.glbAjxRoute) { return; }
      if( that.hasLoadingPrompt ) {
        var temp = new vidteq.vidteq.utils.showLoadingPrompt (params.msg);
        temp.animateAndKill(4);
      }
      $('#'+params.button).click();
    }
    if (parseInt(seed.autoPlay)>0) {
      setTimeout(delayedAutoPlay,parseInt(seed.autoPlay)*1000);
    } else {
      delayedAutoPlay();
    }
    return;
  }
}

vidteq._gui.prototype.addCollapse = function(target) {
  var el_collapse = $("#"+this.ids.collapse);
  if( el_collapse && el_collapse.onclick == null ) {
    var that = this;
    target = target || this.ids.fvtui.fvtDiv;
    el_collapse.on("click",function(e) {
      that.toggleDivDisplay(target,this,e);
    });
  }
}

vidteq._gui.prototype.showCollapse = function(target) {
  var el_collapse = $("#"+this.ids.collapse);
  el_collapse.show();
}

vidteq._gui.prototype.hideCollapse = function(target) {
  var el_collapse = $("#"+this.ids.collapse);
  el_collapse.hide();
}

vidteq._gui.prototype.toggleDivDisplay = function(divId,el,event) {
  var state = $('#'+divId).is(':hidden');
  el_collapse = (el && $(el).length>0)? $(el) : $("#"+this.ids.collapse);
  if( state ) {
    //show
    this.fvt.showNew();
    el_collapse.html('<span class="text">&lt;&lt;</span>');
    el_collapse.removeClass("toggle-gt").addClass("toggle-lt");
  }else {
    this.fvt.hideNew();
    el_collapse.html('<span class="text">&gt;&gt;</span>');
    el_collapse.removeClass("toggle-lt").addClass("toggle-gt");
  }
}

//// this section is evisit extension 
vidteq._gui.prototype.prepareDialPanel = function () {
  //if(this.wfHandheld){
  //  this.prepareFrontScreen();
  //} else {
    this.prepareHandheldLandmarkPanel();
    this.prepareHandheldWNBPanel();
  //}
}

vidteq._gui.prototype.prepareHandheldLandmarkPanel = function () {
  //TBD: get landmark from ajax call
  var count=0;
  for(var i in vidteq.aD.landmarkRoutes) count++;
  var totalCount=count;
  if (!count) return;
  if(!this.handheld) var holder="<center><div class='screen_header'>Select a landmark below to view video directions from: </div></center>";
  else var holder="";
  if(this.openScale && !this.handheld) {
    var posX = 0,posY = 0;
    holder+="<div id='landmarksCont' style='padding-top:10px;'><table id='aList' align='center'>";
    var upperLimit = Math.floor(vidteq.aD.landmarkRoutes.length / 3) * 3;
    for(var i in vidteq.aD.landmarkRoutes) {
      if (i >= upperLimit) { break; }
      if(i%3 == 0) {
        holder+="<tr>"; 
      }
      //holder+="<td style='padding:0px 70px 0px 70px;'><center><img id='"+i+"__landmark_route'  src='"+vidteq.cfg.imageLogosLoc+vidteq.aD.urlId+"/landmark_ipad/"+i+".png?myRand="+Math.floor(Math.random()*100000)+"'></center></td>";
      holder+="<td id='"+i+"__landmark_route' style='padding:5px 5px 5px 5px;font:bold 12px Helvetica;' align='center'><center><div  class='ipadbutton'><div style='background-image: url("+vidteq.cfg.imageLogosLoc+vidteq.aD.urlId+"/landmark_ipad/landmarks.png); height: 94px; width: 122px; background-position: "+posX+"px "+posY+"px;' ></div><div style='font:bold 14px Helvetica;'>";
      holder+="<br/>"+vidteq.utils.dotify(vidteq.aD.landmarkRoutes[i].address.name,21)+"</div></center></td>";
      posX = posX - 124;
      if (i%3 == 2) {
        holder+="</tr>"; 
      }
    }
    holder+='</table></div>';
  } else { 
    holder+="<div id='landmarksCont'><ul id='aList'>";
    for(var i in vidteq.aD.landmarkRoutes) {
      if(!this.openScale && false) // => this is android //disabling landmark images for android, only text-css buttons now// 
        holder+="<li id='"+i+"__landmark_route'><center><img src='"+vidteq.cfg.imageLogosLoc+vidteq.aD.urlId+"/landmark/"+i+".png'></center></li>";
      else {               //this is an iphone
        holder+="<li id='"+i+"__landmark_route'><center><div class='iphoneLmr'><div class='iphoneLmrCont'>"+vidteq.aD.landmarkRoutes[i].address.name+"</div></div></center></li>";
        if(i==5) break;
      }
    }
    holder+='</ul></div>';
  }
  $('#landmarks').append(holder);
  if(!this.openScale) {
    $('#landmarksCont').css('height',vidteq.utils.getScreenHeight()+'px');
    var myScroll;
    function lloaded() {
      myScroll = new iScroll('landmarksCont');
    } 
    setTimeout(lloaded, 100);
    setTimeout(function(){myScroll.refresh();}, 200);
  }
  var that = this;
  for(count=0;count<totalCount;count++) {
    $('#'+count+'__landmark_route').click(function () {
      that.closeMenus();
      window.location.hash='';
      var index=parseInt(this.id);
      that.triggerOneLandmarkRoute(index);
    });
  }
}

vidteq._gui.prototype.prepareHandheldWNBPanel = function () {
  if (!this.embed) { return; }
  if (!this.embed.blocate) { return; }
  if (!this.embed.blocate.allowedCategoryList) { return; }
  if (!this.embed.blocate.allowedCategoryList.length) { return; }
  var catList  = this.embed.blocate.allowedCategoryList;
  holder='<div id="nearbyCont"><ul id="nearbyUl"><table class="mytab" id="tab1">';
  if (this.openScale && !this.handheld) {
    var posX = -22,posY = -161;
    holder='<div id="nearbyCont"><ul id="nearbyUl" style="background:transparent;"><table class="mytab" id="tab1" width="100%" cellspacing="25">';
  } else {
    holder='<div id="nearbyCont"><ul id="nearbyUl" style="background:transparent;"><table class="mytab" id="tab1" width="100%" >';
  }
  var upperLimit = Math.floor(catList.length / 3) * 3;
  for(var i in catList) {
    var id=catList[i].name.replace(/\s+/g,"_");
    if(i%3 == 0) holder+="<tr>";
    if(this.openScale && !this.handheld) {
      if (i >= upperLimit) { break; }
      //holder+="<td width='20%' align='center' style='font-family:arial;font-size:14px;'><a id='"+i+"__category_select'><img src='"+vidteq.cfg.imageLogosLoc+vidteq.aD.urlId+"/icon_ipad/"+i+".png?myRand="+Math.floor(Math.random()*100000)+"'></a>";

      holder+="<td width='20%' align='center' style='font:bold 12px Helvetica;'><a><center><div  class='ipadbutton1' id='"+i+"__category_select'><div style='background-image: url("+vidteq.cfg.imageLogosLoc+vidteq.aD.urlId+"/icon_ipad/explore.png); height: 82px; width: 82px; background-position: "+posX+"px "+posY+"px;'></div><div style='font:bold 14px Helvetica;'>";
      holder+="<br/>"+vidteq.utils.dotify(catList[i].name,21)+"</div></div></center></a></td>";
      posX = posX - 88;
    } else {
      holder+="<td width='30%' align='center'><a id='"+i+"__category_select'><img src='"+vidteq.cfg.imageLogosLoc+vidteq.aD.urlId+"/icon/"+i+".png'></a>";
      holder+="<br/>"+vidteq.utils.dotify(catList[i].name,21)+"</td>";
    }
  //holder+="<br/>"+vidteq.utils.dotify(catList[i].name,21)+"</td>";
    
  if (i%3 == 2)
    holder+="</tr>";
  if(i==11 && this.handheld)//limiting WNB items to 12 in all handhelds-single screen length//
    break;
  }
  holder+='</table></ul></div>';
  $('#nearby').append(holder);
  if(!this.openScale) {
    $('#nearbyCont').css('height',parseInt(vidteq.utils.getScreenHeight())+'px');
    if ($('#nearbyCont').length) {
      var nScroll;
      nScroll = new iScroll('nearbyCont');
    }
  }
  var that=this;  
  for(var i in catList) {
    $('#'+i+'__category_select').click(function () {
      window.location.hash='dsc';
      //that.closeMenus();
      var index=parseInt(this.id);
      that.triggerOneNBBSearch(index);
      if(that.openScale && !that.handheld) {
        $('#exploreAreaStrip').hide();
        $('.screen_NearByheader').hide();
        $('.bottom-content').hide();
        $('meta[name="viewport"]').attr('content',"width=100px, minimum-scale=1.0, maximum-scale=1.0, user-scalable=0" );
        StageWebViewBridge.call('resizeNearByWebView', null, 2000);
        // First drape separately - (because stage is resized
        // And then resise the stage
        //StageWebViewBridge.call('showNearByLocators', null, 2000);
      }
    });
  }
}

vidteq._gui.prototype.prepareTopPanel = function () {
  var that = this;
  var elems =[{
    "id":"home-link",
    "eventAttacher": function () { that.attachEventsToHomeLink(); },
    "text":"Map Home",
    "check":function () {
      if (that.sideBarUI) { return false; }
      var c = vidteq.aD.config;
      if (typeof(c.homeDisable) != 'undefined' && c.homeDisable) {
        return false;
      }
      return true;
    }
   },
   {"id":"driving-dir-video-link",
    "eventAttacher": function () { that.attachEventsToIoBlock(); },
    "text":"Driving Directions in Video",
    "dropDown":'float_input_block_moved',
    "dropDownCreator": function () { that.writeIoBlock(); },
    "check": function () {
      if (!that.tIn) {
        $('#float_input_block').html('');
        return false;
      }
      return true;
    }
   },
   {"id":"bizdisplay",
    "eventAttacher": function () { that.attachEventsToCategoryTab(); },
    "text":"Explore Area",
    "dropDown":'div_biz',
    "dropDownCreator": function () { 
      if (that.multiFrontPage) { }
      else that.writeCategoryItems(); 
    },
    "check": function () {
      if(vidteq.aD.places && 
         vidteq.aD.places.allowedCategoryList )
         //&& 
         //typeof(vidteq.aD.places.allowedCategoryList[0]) != 'undefined')
        return true; 
      else return false;
    }
   },
   //TBD: uncomment for 3D neighbourhood in evisits
   //{"id":this.ids.neighbourhood3D,
   // "eventAttacher": function () { that.attachEventsToNeighbourhood3D(); },
   // "text":"3D Neighbourhood",
   // "check": function () {
   //   //return false; // temporary TBD
   //  if(vidteq.aD.places && 
   //     vidteq.aD.places.allowedCategoryList ) {
   //     //&& 
   //     //typeof(vidteq.aD.places.allowedCategoryList[0]) != 'undefined')
   //    return true; 
   //  } else { return false; }
   //}
   //},
   {"id":"landmarkroutes",
    "eventAttacher": function () { that.attachEventsToLandmarkRoutes(); },
    "text":"Landmark Routes",
    "dropDown":'lr_div',
    "dropDownCreator": function () { 
      if (that.multiFrontPage) { }
      else that.attachLandmarkRoutes(); 
    },
    "check": function () {
      if(vidteq.aD.landmarkRoutes && vidteq.aD.landmarkRoutes.length) return true; else return false;
   }},
   {"id":"proposedref",
    "eventAttacher": function () { that.attachEventsToProposedTab(); },
    "text":"Proposed development",
    "check":function () {
      if (vidteq.aD.config.pfLayer && parseInt(vidteq.aD.config.pfLayer)) return true; else return false;
   }},
   {"id":"demohref",
    "text":"Demo",  // event is attached in regular way TBD
    "check":function () {
      if (that.sideBarUI) { return false; } // temporary till we figure
      if (vidteq.aD.demoRoute && !vidteq.utils.isObjectEmpty(vidteq.aD.demoRoute)) { return true; }
      return false;
    }
   },
   {"id":"onYourMobileHref",
    "eventAttacher": function () { that.attachEventsToMobileTab(); },
    "text":"On Your Mobile",
    "check":function () {
      if (that.sideBarUI) { 
        var checkCond = false;
        if(parseInt(vidteq.utils.getSafe('vidteq.aD.config.handheldEnabled'))) {
          if(vidteq.aD.config.androidAppStoreLink == '') { checkCond =  false; }
          else { checkCond = true; }
        }  
        if(parseInt(vidteq.utils.getSafe('vidteq.aD.config.iPadEnabled'))) {
          if(vidteq.aD.config.iPadAppStoreLink == '') { checkCond =  false; }
          else { checkCond = true; }
        }
        if(!(parseInt(vidteq.utils.getSafe('vidteq.aD.config.handheldEnabled'))) 
             && !(parseInt(vidteq.utils.getSafe('vidteq.aD.config.iPadEnabled')))) {
          checkCond = false;
        }
        if(checkCond) { return true; }
      } 
      return false;
    }
   },
   {"id":"feedbackhref",
    "eventAttacher": function () { that.attachEventsToFeedbackTab(); },
    "text":"Feedback",
    "check":function () {
      if(vidteq.aD.feedbackemail && vidteq.aD.feedbackemail !='') { return true; }
      return false;
    }
   },
   {
    //this section comes from 360 from top panel bar
    "id":"venue",
    "eventAttacher": function () { that.attachEventsToVenue(); },
    "text":"360 View",
    "check":function () {
      if (vidteq.aD.places.venue && vidteq.aD.places.venue !='') {
        return true; 
      } else { return false; }
    }
   },
   {
    "id":"3dmap",
    "eventAttacher": function () { that.attachEventsTo3d(); },
    "text":"3D Mode",
    "check":function () {
      if(that.is3dmap) return true; else return false;
    }
   }
  ];
  this.embed.topPanelLinks=elems;
  var later = false;
  var realWidth = 0;
  for(var i in elems) {
    if (elems[i].check && !elems[i].check()) continue;
    if (later) {
      if (this.sideBarUI) { } else {
        $('#ul-top-panel').append("<li class='topWidget' ><div class='top-panel-height-separator'></div></li>");
      }
      realWidth += 1;
    } else { later = true; }
    if (this.sideBarUI) {
      if(elems[i].text == "Driving Directions in Video") elems[i].text = "Video Directions";
      if(elems[i].text == "Feedback") elems[i].text = "Express Interest";
      if(i == 0) {
        $('#ul-top-panel').append("<li style='width:100%;background:url(images/themes/Prestige/sideBarUI/line.png) no-repeat scroll center bottom rgba(0, 0, 0, 0);'>&nbsp;</li>");
      }
      $('#ul-top-panel').append("<li class='topWidget'  style='width:100%;background:url(images/themes/Prestige/sideBarUI/line.png) no-repeat scroll center bottom rgba(0, 0, 0, 0);padding-top:5px;'><div id=div_"+elems[i].id+" style='width:100%;text-align:center;padding:0px;' class='top-panel-height'><div class='top-panel-margin'  style='width:100%;'><a class='headlink headlink1' id="+elems[i].id+">"+elems[i].text+"</a></div></div></li>");
    } else {
      $('#ul-top-panel').append("<li class='topWidget'><div id=div_"+elems[i].id+" class='top-panel-height'><div class='top-panel-margin'><a class='headlink' id="+elems[i].id+">"+elems[i].text+"</a></div></div></li>");
    }
    realWidth += $('#div_'+elems[i].id).outerWidth();
    if (elems[i].dropDownCreator) { elems[i].dropDownCreator(); }
    if (elems[i].eventAttacher) { elems[i].eventAttacher(); }
  }
  if (this.sideBarUI) {
    $('#rightContainer').css({height:document.documentElement.clientHeight});
    $('#main').css({height:document.documentElement.clientHeight});
    if (self.navigator.userAgent.match(/MSIE\s[7]/)){ 
      $('#customMultiPageFrame').css({height:document.documentElement.clientHeight});
    }
  } else {
    $('#top-panel-div').width(realWidth+1);  // one extra as buffer
  }
}

vidteq._gui.prototype.attachEventsToHomeLink = function () {
  var that = this;
  $('#home-link').click(function () {
    if (that.sideBarUI) {
      that.closeFrontPage();
    }
    that.selectInTopPanel('div_home-link');
    that.handleHomeLink();
    //that.fvt.hideNew();
    //that.clearAll();
    //if(that.appMode) { 
    //  StageWebViewBridge.call('launchCollapseVideoPort', null, 2000);
    //} else {
    //  setTimeout(function() { that.createAndShowFrontPage(false); },1000 );
    //}
    //that.displayMessage(that.defaultRouteEmbedMessage);
    //that.showHomeExtent();
    //that.showFixedTip();
  });
}
 
vidteq._gui.prototype.handleHomeLink = function () {
  this.fvt.hideNew();
  this.clearAll();
  var that = this;
  if(this.appMode) { 
    StageWebViewBridge.call('launchCollapseVideoPort', null, 2000);
  } else {
    setTimeout(function() { that.createAndShowFrontPage(false); },1000 );
  }
  this.displayMessage(this.defaultRouteEmbedMessage);
  this.showHomeExtent();
  //this.showFixedTip();
  this.showFixedTipNew();
}

vidteq._gui.prototype.attachEventsToVenue = function () {
  var that = this;
  $('#venue').click(function () {
    if(that.sideBarUI) {
      that.frontPageNum = 'venue';
      that.closeFrontPage();
      that.animateSideBarUI();
    }
    if($.browser.msie && $.browser.version.substr(0,1)==8 && !that.IE8FirstTime){
      var r=confirm("Internet Explorer 8 supports 360 viewer only in new Window. Please allow the pop-up or update to IE9 to have a better experience.")
      if (r==true)
      {
        var pathIe8 = 'http://'+document.location.host+document.location.pathname+'?city='+ vidteq.cfg.city + '&urlid=' + vidteq.aD.urlId + '&firstTimeRule={"venue":"ie8"}';
        window.open(pathIe8,'myie8Pop','');
        return;
      }
      else
      {
        return;
      }
    }
    that.venueFromTopBar = true;
    if(typeof(vidteq.aD.q) != 'undefined' && vidteq.aD.q!='wayfinder') {
      that.selectInTopPanel('div_venue');
    }
    that.fvt.hideNew();
    that.clearAll();
    var venueOptions = {
      closeFs : function() {
        $("#driving-dir-video-link").trigger("click");
        if( that.venue360UI.directFs ) {
          that.venue360UI.venue360.cleanUpTheScene();
          var popup2Id = that.venue360UI.getPopup2Id();
          $("#"+popup2Id).fadeOut("slow");
          $("#"+popup2Id).remove();
          return;
        }
      }
    }
    setTimeout(function() { that.createAndShowVenue(false,venueOptions); },10 );
    //that.displayMessage(that.defaultRouteEmbedMessage);
    that.showHomeExtent();
    if(typeof(vidteq.aD.q) != 'undefined' && vidteq.aD.q!='wayfinder') {
      //that.showFixedTip();
      that.showFixedTipNew();
    }
  });
}

/*vidteq._gui.prototype.attachEventsTo3d = function () {
  var that = this;
  $('#3dmap').click(function () {
    that.selectInTopPanel('div_3dmap');
    if($('#3d_div')[0].style.display=='block') {
      that.selectInTopPanel('');
      $('#3d_div').hide('slow',null);
      $('#3dmap')[0].className='headlink';
      $('#div_3dmap')[0].className = 'top-panel-height';
    } else {
      that.selectInTopPanel('div_3dmap');
      $('#3d_div').show('slow',null);
      $('#3dmap')[0].className='headlink-clicked';
      $('#div_3dmap')[0].className = 'top-panel-height-clicked';
      $('#3d_div')[0].style.display = 'block';
    }
  });
}*/

vidteq._gui.prototype.attachEventsTo3d = function () {
  var that = this;
  $('#3dmap').click(function () {
    that.clearAll();
    that.fvt.hideNew();
    $('#map').fadeOut("slow");
    $('#input-div').hide();
    that.createAndShow3dmap();
  });
}

vidteq._gui.prototype.writeIoBlock = function () {
  $('#div_driving-dir-video-link').append("<div id=float_input_block_moved class=top-drop-down-float-wide><div id=float_input_block_moved_inner style='background-color:"+vidteq.vidteq.bgColor+";display:block;margin:0;padding:0;padding-left:5px;'>"+$('#float_input_block').html()+"</div></div>");
  //$('#div_driving-dir-video-link').append("<div id=float_input_block_moved class=top-drop-down-float-wide><div id=float_input_block_moved_inner style='background-color:"+vidteq.vidteq.bgColor+";display:block;margin:0;padding:0;padding-left:5px;'>"+"</div></div>");
  //$('#float_input_block_moved_inner').append($('#float_input_block')); 
  var boxImage = { url:vidteq.imgPath.refBox, cornerW:10, cornerH:10, boxW:510, boxH:378, offsetW:0, offsetH:0 };
  vidteq.utils.boxify(boxImage,'float_input_block_moved',{tc:parseInt($('#div_driving-dir-video-link').outerWidth())+1,mc:1,rt:1,lb:1,rb:1});  // 1 px is divider stuff
  $('#float_input_block').html('');
  $('#float_input_block_moved').css('display','none');
}

vidteq._gui.prototype.attachEventsToIoBlock = function () {
  var that = this;
  if (this.sideBarUI) {
    $('#driving-dir-video-link').click(function() {
      if (that.multiFrontPage) { 
        that.frontPageNum = 'videoDir';
        that.callIframeFunc("customMultiPageFrame");
        if(that.frontPageNum == 'videoDir') {
          $('#initialRightDiv').hide();
          $('#videoRightDiv').hide();
          that.closeFrontPage();
        }
        that.selectInTopPanel('div_driving-dir-video-link');
        that.loadMultiFrontPage();
        that.fvt.hideNew();
        that.clearAll();
        return false;
      } // TBD wht if no multPage
    });
  } else {
    $('#driving-dir-video-link').toggle(function () {
      that.selectInTopPanel('div_driving-dir-video-link');
      $('#float_input_block_moved').show("slow",function(){});
      $('#driving-dir-video-link')[0].className='headlink-clicked';
      $('#div_driving-dir-video-link')[0].className = 'top-panel-height-clicked';
      $('#float_input_block_moved')[0].style.display = 'block';
    },
    function () {
      that.selectInTopPanel(''); // TBD
      $('#float_input_block_moved').hide("slow",function(){});
      $('#driving-dir-video-link')[0].className='headlink';
      $('#div_driving-dir-video-link')[0].className = 'top-panel-height';
    });
  }
  $('#close-float-input').click(function () {
    that.closeAnyDropDowns();
  });
}

vidteq._gui.prototype.attachLandmarkRoutes = function (divToAttach) {
  var divToAttach = divToAttach || 'div_landmarkroutes'; // or lmrForLite
  var class1 = 'top-drop-down-float'; // or lmrForWayLiteDropDown
  var class2 = 'drop-down'; // or lmrForWayLiteDropDown
  var opt="<div id='lr_div' class="+class1+" ><div id='lr_div_inner' style='background-color:"+vidteq.vidteq.bgColor+";display:block;margin:0;padding:0;padding-top:5px;'><ul id='ul-dropdown' class='"+class2+"' >";
  var count=0;
  for(var i in vidteq.aD.landmarkRoutes) {
    opt+='<li id='+count+'__landmark_route class=drop-down-list>'; 
    //opt+='<div class="dropdownlink dropdownlmrlink"></div>';
    opt+='<a  class=headlink-drop-down>'+vidteq.aD.landmarkRoutes[i].address.name+'</a>';
    opt+='</li>';
    count++;
  }
  $('#'+divToAttach).append(opt+"</ul></div></div>");
  var maxW = 0;
  var maxH = 0;
  $('#lr_div ul li a').each(function () {
    maxH += $(this).height();
    if (maxW < $(this).width()) { maxW = $(this).width(); }
  });
  if (maxW < $('#'+divToAttach).width()) { maxW = $('#'+divToAttach).width(); }
  maxW = parseInt(maxW*1.2);
  maxH = parseInt(maxH*1.5);
  $('#lr_div_inner').css('width',maxW+'px');
  //$('#lr_div_inner').css('height',maxH+'px');
  var boxImage = { url:vidteq.imgPath.refBox, cornerW:10, cornerH:10, boxW:510, boxH:378, offsetW:0, offsetH:0 };
  //vidteq.utils.boxify1(boxImage,'lr_div',{tc:parseInt($('#'+divToAttach).outerWidth())+1,mc:1,rt:1,lb:1,rb:1});
  vidteq.utils.boxify(boxImage,'lr_div',{tc:parseInt($('#'+divToAttach).outerWidth())+1,mc:1,rt:1,lb:1,rb:1});
  $('#lr_div').css('display','none');
  var totalCount=count;
  var that = this;
  for(count=0;count<totalCount;count++) {
    $('#'+count+'__landmark_route').click(function () { 
      var index=parseInt(this.id);
      that.triggerOneLandmarkRoute(index); 
      that.closeAnyDropDowns();
    });
  }
}

vidteq._gui.prototype.attach3dRoutes = function (divToAttach) {
  var divToAttach = divToAttach || 'div_3dmap'; // or lmrForLite
  var class1 = 'top-drop-down-float'; // or lmrForWayLiteDropDown
  var class2 = 'drop-down'; // or lmrForWayLiteDropDown
  var opt="<div id='3d_div' class="+class1+" ><div id='3d_div_inner' style='background-color:"+vidteq.vidteq.bgColor+";display:block;margin:0;padding:0;padding-top:5px;'><ul id='ul-dropdown' class='"+class2+"' >";
  var count=0;
  for(var i in vidteq.aD.landmarkRoutes) {
    opt+='<li id='+count+'__3d_route class=drop-down-list>';
    //opt+='<div class="dropdownlink dropdownlmrlink"></div>';
    opt+='<a  class=headlink-drop-down>'+vidteq.aD.landmarkRoutes[i].address.name+'</a>';
    opt+='</li>';
    count++;
  }
  $('#'+divToAttach).append(opt+"</ul></div></div>");
  var maxW = 0;
  var maxH = 0;
  $('#3d_div ul li a').each(function () {
    maxH += $(this).height();
    if (maxW < $(this).width()) { maxW = $(this).width(); }
  });
  if (maxW < $('#'+divToAttach).width()) { maxW = $('#'+divToAttach).width(); }
  maxW = parseInt(maxW*1.2);
  maxH = parseInt(maxH*1.5);
  $('#3d_div_inner').css('width',maxW+'px');
  //$('#lr_div_inner').css('height',maxH+'px');
  var boxImage = { url:vidteq.imgPath.refBox, cornerW:10, cornerH:10, boxW:510, boxH:378, offsetW:0, offsetH:0 };
  //vidteq.utils.boxify1(boxImage,'lr_div',{tc:parseInt($('#'+divToAttach).outerWidth())+1,mc:1,rt:1,lb:1,rb:1});
  vidteq.utils.boxify(boxImage,'3d_div',{tc:parseInt($('#'+divToAttach).outerWidth())+1,mc:1,rt:1,lb:1,rb:1});
  $('#3d_div').css('display','none');
  var totalCount=count;
  var that = this;
  for(count=0;count<totalCount;count++) {
    $('#'+count+'__3d_route').click(function () {
      var index=parseInt(this.id);
      that.triggerOneLandmarkRoute(index,1);
      that.closeAnyDropDowns();
    });
  }
}
vidteq._gui.prototype.stopWebViewAsyncCalls = function (callBack) {
  this.stageCallBack = callBack;
  StageWebViewBridge.call('stopCallStatefn', null, 1);
}

vidteq._gui.prototype.stopVideoAsyncCalls = function (stopVideoCallBack,startVideoCallBack) {
  this.stopVideoCallBack = stopVideoCallBack;
  this.startVideoCallBack = startVideoCallBack;
  StageWebViewBridge.call('clearVideoStopfn', null, 1);
}

vidteq._gui.prototype.attachEventsToLandmarkRoutes = function () {
  var that = this;
  $('#landmarkroutes').click(function () {
    if (that.multiFrontPage) { 
      that.frontPageNum = 'lmr';
      if (that.sideBarUI) {
        that.callIframeFunc("customMultiPageFrame");
        that.closeFrontPage();
        //$('#fvtContainerLabel').html('<h2>Video Directions</h2>');
      }
      that.selectInTopPanel('div_landmarkroutes');
      that.loadMultiFrontPage();
      that.fvt.hideNew();
      that.clearAll();
      return;
    }
    if($('#lr_div')[0].style.display=='block') {
      that.selectInTopPanel('');
      $('#lr_div').hide('slow',null);
      $('#landmarkroutes')[0].className='headlink';
      $('#div_landmarkroutes')[0].className = 'top-panel-height';
    } else {
      that.selectInTopPanel('div_landmarkroutes');
      $('#lr_div').show('slow',null);
      $('#landmarkroutes')[0].className='headlink-clicked';
      $('#div_landmarkroutes')[0].className = 'top-panel-height-clicked';
      $('#lr_div')[0].style.display = 'block';
    }
  });
}

vidteq._gui.prototype.writeCategoryItems = function () {
  if(typeof(this.embed.blocate) == 'undefined') { return; }
  var catList  = this.embed.blocate.allowedCategoryList;
  if (typeof(catList[0]) == 'undefined' ||
      typeof(catList[0].name) == 'undefined') {
    var newVar = [];
    for(var i in catList) {
      newVar.push({name:i,categoryList:catList[i],sortby:vidteq.aD.config.sortby || 'priority'});
    }
    catList = newVar;
  }
  //var width=0.75*parseInt(this.embed.vidWidth)-10+"px"
  var categoryDropDown="";
  categoryDropDown+="<div id='div_biz' class=top-drop-down-float-wide ><div id='div_biz_inner' style='background-color:"+vidteq.vidteq.bgColor+";display:block;padding:0;padding-top:5px;margin:0;'><ul id='ul-dropdown' class='drop-down'>";
  for(var i in catList) {
    var id=catList[i].name.replace(/\s+/g,"_");
    //categoryDropDown+="<li id='"+id+"' onclick='ioAreaObj.invokeBizSearch(null,{\"categoryList\":\""+catList[i].categoryList+"\",\"name\":\""+catList[i].name+"\",\"sortby\":\""+catList[i].sortby+"\"});closeAnyDropDowns();' class=drop-down-list ><a id='"+id+"' class=headlink-drop-down>"+catList[i].name+"</a></li>";
    categoryDropDown+="<li id='"+i+"__category_select' class=drop-down-list >";
    //categoryDropDown+='<div class="dropdowncatlink dropdownlink"></div>';
    categoryDropDown+="<a id='"+id+"' class=headlink-drop-down>"+catList[i].name+"</a></li>";
  }
  categoryDropDown+="</ul></div></div>";
  $('#div_bizdisplay').append(categoryDropDown);
  var max = 0;
  $('#div_biz ul li a').each(function () {
    if (max < $(this).width()) { max = $(this).width(); }
  });
  if (max < $('#div_bizdisplay').width()) { max = $('#div_bizdisplay').width(); }
  max = parseInt(max*1.2);
  $('#div_biz_inner').css('width',max+'px');
  var boxImage = { url:vidteq.imgPath.refBox, cornerW:10, cornerH:10, boxW:510, boxH:378, offsetW:0, offsetH:0 };
  vidteq.utils.boxify(boxImage,'div_biz',{tc:parseInt($('#div_bizdisplay').outerWidth())+1,mc:1,rt:1,lb:1,rb:1});
  $('#div_biz').css('display','none');

  var that = this;
  for(var i in catList) {
    $('#'+i+'__category_select').click(function () {
      var index=parseInt(this.id);
      that.triggerOneNBBSearch(index);
      //console.log(vidteq.mboxObj.map.resolutions);
    });
  }
}

vidteq._gui.prototype.attachEventsToCategoryTab = function () {
  if (!$('#bizdisplay').length) { return; }
  $('#bizdisplay').removeAttr('onclick');
  var that = this;
  $('#bizdisplay').click(function () {
    that.handleClickOnBizDisplay();
  });
}

vidteq._gui.prototype.createThreeDWgt = function( options ) {
  options = options || {};
  var threeDWgtRequired = typeof options.threeDWgtRequired!=="undefined"? options.threeDWgtRequired : true;
  
  //TBD: this.explore.threeDWgt to be changed to this.explore[  options.wgtName || 'threeDWgt' ]
  
  if( !this.explore ) { this.explore = {}; }
  if( !this.explore.threeDWgt ) { this.explore.threeDWgt = {}; }
  if( this.explore.threeDWgt.config ) { return; }
  
  if( !this.explore.explorationArea && 'blocate' in this.embed) {
    this.explore.explorationArea = this.embed.blocate.center.entity;
    this.explore.explorationArea.distance = this.embed.blocate.allowedDistanceLimit;//5000; //TBD:
    this.explore.explorationArea.limit = this.embed.blocate.allowedItemLimit;//30; 
  }
  var that = this;
  if( threeDWgtRequired && vidteq.ThreeDWgt ) {
    var threeDWgtConfig = this.explore.threeDWgt.config = new vidteq.ThreeDWgt({
      uiwidget:this
      ,categories:null
      ,areaCircle:false
      ,skyview:typeof options.skyview!=="undefined"? options.skyview : false
      ,manner:'explore'
      ,theme:vidteq.vidteq.theme
      ,explorationArea: this.explore.explorationArea
      ,callback:{
        onAfterInit3js:null
        ,onclick:function( fIndex, dValue, threeConfig ) {
          //console.log("threeDWgtConfig:");
          //console.log(o);
          if( !threeConfig.initialized ) {
            threeConfig.initialized = true;
          }
          threeConfig.callbackDataForVenue360 = {
            cat: null //cat
            ,poi: null //categories[cat].data
          };
          
          threeConfig.map3dOpenAnimation({
            /*beforeAnimation:function() {
              console.log('gui: map3dOpenAnimation: beforeAnimation: ');
              var animateElements = ['frontCurtainContent','fvtContainer','fvtdiv-wrapper-container','iframeImageLoader','rightContainer','backSideMap'];
              for( var i=0;i<animateElements.length; i++ ) {
                var el_animateElements = $("#"+animateElements[i]);
                if( el_animateElements ) {
                  el_animateElements.css({
                    "opacity":0
                  });
                }
              }
            },*/
            onAnimation:function(T,i) {
              var animateElements = ['frontCurtainContent','fvtContainer','fvtdiv-wrapper-container','iframeImageLoader','rightContainerTd','rightContainer','backSideMap','ascrail2000'];
              for( var i=0;i<animateElements.length; i++ ) {
                var el_animateElements = $("#"+animateElements[i]);
                if( animateElements[i] == 'rightContainerTd' ) {
                  el_animateElements.css({"opacity":0});
                } else if( animateElements[i] == 'rightContainer' ) {
                  el_animateElements.css({"display":'none'});
                } else {
                  if( el_animateElements ) {
                    el_animateElements.css({
                      "opacity":i/T
                    });
                  }
                }
              }
            }
            ,afterAnimation:function() {
              //that.explore.threeDWgt.config = threeConfig.uiwidget.createAndShowVenue( false, threeConfig );
              that.explore.threeDWgt.config = threeConfig.uiwidget.createAndShow3DExplore( false, threeConfig );
              //Reference: embedContent-SideBarUI
              var animateElements = ['frontCurtainContent','fvtContainer','fvtdiv-wrapper-container','iframeImageLoader','rightContainerTd','rightContainer','backSideMap','ascrail2000'];
              for( var i=0;i<animateElements.length; i++ ) {
                var el_animateElements = $("#"+animateElements[i]);
                if( el_animateElements ) {
                  el_animateElements.attr( 'data-zIndex', el_animateElements.css('zIndex') );
                  el_animateElements.attr( 'data-posLeft', el_animateElements.css('left') );
                  el_animateElements.css({
                    "opacity":0
                    ,"z-index":-1 //because for some elements zIndex is set abruptly high value that contradicts with the popup z-index
                    //,"left":0
                  });
                }
              }
              //TBD; always or one time depends on popup on close is removed or not
              var popupContact2 = that.explore.venue3DExplore.getPopup2Id();
              if( $("#"+that.explore.categoryWgt.domId).length > 0 ) {
                $("#"+that.explore.categoryWgt.domId).css('z-index', parseInt($("#"+popupContact2).css('z-index')) +1 );
              }else {
                that.explore.categoryWgt.init({appendTo:popupContact2});
                that.explore.categoryWgt.invoke();
              }
              //setTimeout(function() { $('.nemo-explore-title').hide(); },15000);
            }
          });
        }
        ,onCloseFs:function( threeConfig ) {
          threeConfig.map3dCloseAnimation({
            onAnimation:function(T,i) {
              //$("#frontCurtainContent").css({ "opacity":T/i });
              
              var animateElements = ['frontCurtainContent','fvtContainer','fvtdiv-wrapper-container','iframeImageLoader','sideBarTable','backSideMap','ascrail2000'];
              for( var j=0;j<animateElements.length; j++ ) {
                var el_animateElements = $("#"+animateElements[j]);
                if( el_animateElements ) {
                  el_animateElements.css({ "opacity":T/i});
                }
              }
              var popupContact2 = that.explore.venue3DExplore.getPopup2Id();
              $("#"+popupContact2).css({ "opacity":i/T });
            }
            ,afterAnimation:function( threeConfig ) {
              var animateElements = ['frontCurtainContent','fvtContainer','fvtdiv-wrapper-container','iframeImageLoader','rightContainerTd','rightContainer','backSideMap','ascrail2000'];
              for( var i=0;i<animateElements.length; i++ ) {
                var el_animateElements = $("#"+animateElements[i]);
                if( el_animateElements ) {
                  var zIndex = el_animateElements.attr( 'data-zIndex') || 999999
                  ,posLeft = el_animateElements.attr( 'data-posLeft') || '168px';
                  if( animateElements[i] == 'rightContainer' ) {
                    el_animateElements.css({"display":'block',height:document.documentElement.clientHeight});
                    el_animateElements.find('tbody').css({height:document.documentElement.clientHeight});
                  }
                  el_animateElements.css({
                    "opacity":1
                    ,"z-index":zIndex
                    //,"left":posLeft
                  });
                }
              }
              var popupContact2 = that.explore.venue3DExplore.getPopup2Id();
              $("#"+popupContact2).remove();
              $('#'+that.ids.neighbourhood3D).attr('aria-pressed',false);
              //TBD: On hiding the categories, onAfterInit3js should be made null. Hint: because category data is not cached.
              //threeConfig.callback.onAfterInit3js = null;
            }
          });
        }
        /*,onMap3dCloseAnimation:function(){
          console.log('gui: onMap3dCloseAnimation');
          var animateElements = ['frontCurtainContent','fvtContainer','fvtdiv-wrapper-container','iframeImageLoader','rightContainer','backSideMap'];
          for( var i=0;i<animateElements.length; i++ ) {
            var el_animateElements = $("#"+animateElements[i]);
            if( el_animateElements ) {
              var zIndex = el_animateElements.attr( 'data-zIndex') || 999999
              ,posLeft = el_animateElements.attr( 'data-posLeft') || '168px';
              
              el_animateElements.css({
                "opacity":1
                ,"z-index":zIndex
                ,"left":posLeft
              });
            }
          }
        }*/
      }
    });
  }
}

vidteq._gui.prototype.attachEventsToNeighbourhood3D = function(options) {
  options = options || {};
  if (!$('#'+this.ids.neighbourhood3D).length) { return; }
  //$('#'+this.ids.neighbourhood3D).removeAttr('onclick');
  var as = "explore";
  //if ( !this[ as ] ) { this[ as ] = {}; }
  var neighbourhoodOpt = {
    as:as
    ,style:'spritebutton'
    //,wgtName:'threeDWgt'            
    ,catButtonImg: true
    ,threeDWgtRequired: true
  }
  $.extend(neighbourhoodOpt, options );
  
  if( !this[ as ] ) {
    if( neighbourhoodOpt.threeDWgtRequired ) {
      this.createThreeDWgt( neighbourhoodOpt );
    }
    this.createCategoryFactory(neighbourhoodOpt);
  }
  var threeConfig = ( this[ as ].threeDWgt || {} ).config;
  var that = this;
  $('#'+this.ids.neighbourhood3D).click(function(e) {
    if(typeof(that.autoPlay3D) != 'undefined') { clearTimeout(that.autoPlay3D); }
    that.mbox.map.setCenter(new OpenLayers.LonLat(that.embed.place.lonlat.lon,that.embed.place.lonlat.lat),1);
    if( threeConfig ) {
      threeConfig.callback.onclick( 1, 1, threeConfig );
      $(this).attr('aria-pressed',true);
      that[ as ].threeDWgt.selected = $(this).get(0).id;
    }
  });
}

vidteq._gui.prototype.handleClickOnBizDisplay = function () {
  if (this.multiFrontPage) { 
    this.frontPageNum = 'explore';
    if (this.sideBarUI) {
      this.callIframeFunc("customMultiPageFrame");
      this.closeFrontPage();
      $('#fvtContainerLabel').html('<h2>Explore Area</h2>');
    }
    this.selectInTopPanel('div_bizdisplay');
    this.loadMultiFrontPage();
    this.fvt.hideNew();
    this.clearAll();
    return false;
  }
  this.selectInTopPanel('div_bizdisplay');
  //this.locateNearByBiz();
  this.locateNBBDefault();
  $('#div_biz').css({display:'block'});
  $('#div_biz').show('slow',null);
  $('#bizdisplay').addClass('headlink-clicked');
  $('#div_bizdisplay').addClass('top-panel-height-clicked');
  $('#bizdisplay').unbind('click');
  $('#bizdisplay').removeAttr('onclick');
  var that = this;
  $('#bizdisplay').click(function () {
    if ($('#div_biz').is(':visible')) {
      that.selectInTopPanel('');
      $('#div_biz').hide('slow',null);
      $('#bizdisplay').removeClass('headlink-clicked');
      $('#div_bizdisplay').removeClass('top-panel-height-clicked');
      $('#bizdisplay').addClass('headlink');
      $('#div_bizdisplay').addClass('top-panel-height');
    } else {
      that.selectInTopPanel('div_bizdisplay');
      $('#div_biz').show('slow',null);
      $('#bizdisplay').removeClass('headlink');
      $('#div_bizdisplay').removeClass('top-panel-height');
      $('#bizdisplay').addClass('headlink-clicked');
      $('#div_bizdisplay').addClass('top-panel-height-clicked');
    }
  });
  return false;
}

vidteq._gui.prototype.showFrontMenu  = function (divId) {
  if(this.mbox.routeActive){
    var r=confirm("Exit Video Route?!");
    if (r==true){
       this.clearAllForVia();//kill video
    } else {
      //location.hash='';TBD
      return;
    }
  }
  if (this.handheld) {
    $('#text_holder').hide();
    $('#myLocationButton').hide();
    $('#show').hide();
    $('.show_inner_content').hide();
    window.location.hash='dholder';
  }
}

vidteq._gui.prototype.attachMenuButton = function (){
  // TBD is it never called ?
  $('#mainMenu').appendTo('body');
  $('#mainMenu').css('display','block');
  $('#mainMenu').css('position','absolute');
  $('#mainMenu').css('right','0px');
  if(this.handheld) $('#mainMenu').css('left','0px');
  $('#mainMenu').css('z-index','10000');
  $('#mainMenu').css('top','150px');
}
    
//vidteq._gui.prototype.getMenuItemHtml = function (divId,w,h){
//  var pName = 'menuContent';
//  var con = $("<div id = '"+pName+"' style='padding:10px;background-color:"+vidteq.bgColor+";'> </div>");
//  if(typeof(divId) != 'undefined'){
//    $('#mainMenu').css('display','block');
//    $('#mainMenu').css('top','0px');
//    con.html($('#mainMenu'));
//    con.append($('#'+divId));
//   
//  } else {
//    var menuhtml = "<div id = 'menu-div'>";
//    menuhtml += "<ul id='ul-menu' >";
//  
//    for (var i in this.contextManager.menuItems) { 
//      var one = this.contextManager.menuItems[i];
//      menuhtml += "<li style='text-align: center;'><a id='"+one.id+"' class='"+one.classItem+"' onclick='"+one.onClickFunc+"'>"+one.text+"</a></li>";
//    }
//    menuhtml += "</ul></div>";
//    con.html(menuhtml);
//  }
//  return con;
//}

vidteq._gui.prototype.showExistingPlaces  = function () {
  var that = this;
  var refHtml = "<iframe id='customIframe' style='width:auto;height:auto;' frameborder=0 src=\""+vidteq.cfg.customHtmlUrl+"/blah_lite.html\"></iframe>";
  var pName = 'frontCurtainContent';
  var con = $("<div id = '"+pName+"' style='padding:10px;background-color:"+vidteq.vidteq.bgColor+";'> </div>").appendTo('body');
  var w = this.mbox.getPopupWidth(screen.width/2);
  var h = this.mbox.getPopupHeight(screen.height);
  con.html(refHtml);
  $('#customIframe').load(function () {
    $('#customIframe').contents().find('#topOfCustomContent').find('img').each(function () {
      $(this).attr('src',vidteq.cfg.customHtmlUrl+"/"+$(this).attr('src'));
    });
    
    $('#menuContent').html($('#mainMenu'));
    $('#mainMenu').css('display','block');
    $('#menuContent').append($('#customIframe').contents().find('#topOfCustomContent').html());
    $('#customIframe').remove();
    $('#inputBlockContainer').remove();
 
  $('#frontCurtainInner').find('img[id^=landmarkRoute_]').each( function () {
   var index = $(this).attr('id');
   index = index.replace(/^landmarkRoute_/,'');
   $(this).attr('title','Route from '+vidteq.aD.landmarkRoutes[index].address.name+' to '+that.embed.place.address.name);
   $(this).css('cursor','pointer');
   $(this).click(function () { 
      var index = $(this).attr('id');
     index = index.replace(/^landmarkRoute_/,'');
     $('#frontCurtainClose').click();
     that.triggerOneLandmarkRoute(index); 
   });
  });
  });
  if(!this.handheld){
    $('#frontCurtain').css('width',w);
    $('#frontCurtain').css('height',h);
    $('#frontCurtain').css('overflow','auto');
  }
  var boxImage = { url:vidteq.imgPath.refBox3, cornerW:10, cornerH:10, boxW:w+10, boxH:h+10, offsetW:0, offsetH:0 };
  vidteq.utils.boxify(boxImage,'frontCurtain',{lt:1,rt:1,lb:1,rb:1});
  //TODO : redraw boundaries of popup= =>redo boxify
}


//functions to make div scrollable as overflow doesnt work on touch scree
vidteq._gui.prototype.isTouchDevice  = function (){
  try{
    document.createEvent("TouchEvent");
    return true;
  } catch(e) {
    return false;
  }
}

// If automatic scrollbar is required in a div use this
vidteq._gui.prototype.touchScroll  = function (id){
  if (this.isTouchDevice()) { //if touch events exists
  var el=document.getElementById(id);
  var scrollStartPos=0;

  document.getElementById(id).addEventListener("touchstart", function(event) {
    scrollStartPos=this.scrollTop+event.touches[0].pageY;
    event.preventDefault();
  },false);

  document.getElementById(id).addEventListener("touchmove", function(event) {
    this.scrollTop=scrollStartPos-event.touches[0].pageY;
    event.preventDefault();
  },false);
  }
}

vidteq._gui.prototype.showMainMenu = function() {
  $('#float_input_block_movedInner').hide();
  $('#lr_div').hide();
  if(!this.handheld)  $('#mainMenu').hide();
  $('#lr_div').appendTo('body');
  $('#mainMenu').appendTo('body');
  $('#float_input_block_movedInner').appendTo('body');
  // TBD not sure if input block need to be moved 

  if($('#frontCurtain').length){
    $('#frontCurtainClose').click();
  }
  this.showFrontMenu();
}

vidteq._gui.prototype.attachHandheldEvents = function() {
  var that = this;
  $('#mainMenulink').live("click" ,function () {
    that.showMainMenu();
    // TBD needs more investigation
    //if($('#frontCurtain').length){
    //  $('#frontCurtainClose').click();
    //}
    //window.location.hash='dholder';
  });
  $('#home-link').live("click" ,function () {
    $('#home-link').className='headlink-clicked';
    that.fvt.hideNew();
    that.clearAll();
    that.displayMessage(that.defaultRouteEmbedMessage);
    if(typeof(vidteq.aD.config.homeExtent)!= 'undefined' && vidteq.aD.config.homeExtent)
    { that.showHomeExtent();}
    $('#frontCurtainClose').click();
    //that.showFixedTip();
    that.showFixedTipNew();
  });
  // TBD need to check if this true for handheld
  $('#landmarkroutes').live("click" ,function () {
    //$('#landmarkroutes')[0].className='headlink-clicked';
    //$('#menuContent').html($('#mainMenu'));
    //$('#mainMenu').css('display','block');
    //$('#menuContent').append($('#lr_div'));
    //$('#frontCurtain').css('background-color','white');
    //$('#landmarkroutes')[0].className='headlink';
     $('#frontCurtainClose').click();
     that.showFrontMenu('lr_div');
     $('#lr_div').show('slow',null);
  });
}

vidteq._gui.prototype.closeAnyDropDowns = function () {
  var dropDownCheck = this.embed.topPanelLinks;
  for (var i in dropDownCheck ) {
    if (!dropDownCheck[i].dropDown) continue;
    if($('#'+dropDownCheck[i].dropDown).length && 
       $('#'+dropDownCheck[i].dropDown)[0].style.display == 'block') {
      $('#'+dropDownCheck[i].id).click();
    }
  }
}

vidteq._gui.prototype.selectInTopPanel = function (id,stick) {
  this.embed.selectedLink=this.embed.selectedLink || 'div_home-link';

  var elems = this.embed.topPanelLinks;
  var curIndex = -1;
  var selIndex = -1;
  for (var i in elems) {
    if (id == 'div_'+elems[i].id) { curIndex = i; }
    if (this.embed.selectedLink == 'div_'+elems[i].id) { selIndex = i; }
    if (!elems[i].dropDown) continue;
    if (id !='div_'+elems[i].id && id != '') {
      if (typeof($('#'+elems[i].dropDown)[0]) !='undefined' && $('#'+elems[i].dropDown)[0].style.display=='block') {
        $('#'+elems[i].id).click();
      }
    }
  }  

  //if(id!='div_driving-dir-video-link' && id!='') {
  //  if($('#float_input_block_moved')[0].style.display=='block') {
  //    $('#driving-dir-video-link').click();
  //  }
  //}
  //if(id!='div_landmarkroutes' && id!='') {
  //  if(typeof($('#lr_div')[0])!='undefined' && $('#lr_div')[0].style.display=='block') {
  //    $('#landmarkroutes').click();
  //  }
  //}
  //if(id!='div_bizdisplay' && id!='') {
  //  if(typeof($('#div_biz')[0])!='undefined' && $('#div_biz')[0].style.display=='block') {
  //    $('#bizdisplay').click();
  //  }
  //}
  if ( selIndex > -1 && elems[selIndex].sticky ) { } else {
    if(typeof($('#'+this.embed.selectedLink)[0]) != 'undefined') {
      $('#'+this.embed.selectedLink)[0].className = 'top-panel-height';
    }
  }
  if(id  == '') { return; }
  this.embed.selectedLink=id;
  if($('#'+id)[0]) $('#'+id)[0].className = 'top-panel-height-selected';
  if (this.sideBarUI) {
    $('.top-panel-height').find('a[class^=headlink]').each( function () {
      $(this).removeClass('headlink1-clicked');
    });
    $('.top-panel-height-selected').find('a[class^=headlink]').each( function () {
      $(this).addClass('headlink1-clicked');
    });
  }
  if (typeof(stick) != 'undefined' && stick) { elems[curIndex].sticky = 1; }
  if (typeof(stick) != 'undefined' && !stick) { 
    delete elems[curIndex].sticky; 
    $('#'+id)[0].className = 'top-panel-height';
  }
}

//TBD: PFLayer - Proposed Feature Layer to be re-used for polygon layer
vidteq._gui.prototype.attachEventsToProposedTab = function () {
  // little bit of old remain in here - function can be called standalone aswell in old modes
  if(!this.topBarUI || !this.sideBarUI) { $('#proposed').attr('src',vidteq.imgPath.proposed); }
  var that = this;
  $('#proposedref').toggle (
    function () { that.switchOnPfButton(); },
    function () { that.switchOffPfButton(); }
  );
}

//TBD: PFLayer - Proposed Feature Layer to be re-used for polygon layer
vidteq._gui.prototype.switchOnPfButton = function () {
  if(this.topBarUI || this.sideBarUI) { this.selectInTopPanel('div_proposedref',1); }
  else { $('#proposed').attr('src',vidteq.imgPath.proposed_a); }
  if (vidteq.aD.config.pfLegendW && parseInt(vidteq.aD.config.pfLegendW) &&
      vidteq.aD.config.pfLegendH && parseInt(vidteq.aD.config.pfLegendH)) {
    if (!self.navigator.userAgent.match(/MSIE\s[6-8]/)){
      if (typeof(vidteq.aD.config.pfLegendW)!='undefined'){
        $("#proposedLegend").animate({position:"absolute",width:vidteq.aD.config.pfLegendW,height:vidteq.aD.config.pfLegendH,right:"0px"},1000);
      }
    } else {
      $("#proposedLegend").addClass('proposedLegendVisible');
    }
    document.getElementById('proposedLegend').style.backgroundImage="url("+vidteq.cfg.imageLogosLoc+""+ vidteq.aD.config.pfLegendIcon+")";
  }
  this.callMakePfLayer();
}

//TBD: PFLayer - Proposed Feature Layer to be re-used for polygon layer
vidteq._gui.prototype.switchOffPfButton = function () {
  if(this.topBarUI || this.sideBarUI) { 
    this.selectInTopPanel('div_proposedref',0);
    this.closeAnyDropDowns();
  } else { $('#proposed').attr('src',vidteq.imgPath.proposed); }
  if (vidteq.aD.config.pfLegendW && parseInt(vidteq.aD.config.pfLegendW) &&
      vidteq.aD.config.pfLegendH && parseInt(vidteq.aD.config.pfLegendH)) {
    if (!self.navigator.userAgent.match(/MSIE\s[6-8]/)){
      $("#proposedLegend").animate({width:"0px",height:"0px",right:  "0px",position:"absolute"},1000);
    } else {
       $("#proposedLegend").removeClass('proposedLegendVisible');
    }
  }
  this.mbox.removePfLayer();
}

//TBD: PFLayer - Proposed Feature Layer to be re-used for polygon layer
vidteq._gui.prototype.callMakePfLayer = function () {
  var data={action:"getPfLayerData",city:vidteq.cfg.city,
    account:vidteq.vidteq.urlId,key:vidteq.vidteq.key};
  var that = this;
  var drape = 'makePf';
  vidteq.utils.drapeSheer(drape);
  var handleCallMakePfLayer = function (response) {
    vidteq.utils.undrapeSheer(drape); 
    that.mbox.createPfLayer(response);
  }
  if (vidteq.vidteq.scriptBased) { data.callbackFunction='vidteq.mboxObj.createPfLayer';}
  this.magicCall = $.ajax({
    url:vidteq.cfg.magicHappensUrl,
    data:data,
    dataType:vidteq.vidteq.dataType,
    success: handleCallMakePfLayer,
    error:function(response) { that.gui.io.handleError(response); }
  }); 
}  

vidteq._gui.prototype.callMakeLmLayer = function () {
  var data={action:"getLandMarkLayer",city:vidteq.cfg.city,
    account:vidteq.vidteq.urlId,key:vidteq.vidteq.key};
  var that = this;
  var drape = 'makeLandMarkLayer';
  vidteq.utils.drapeSheer(drape);
  var handleCallMakeLmLayer = function (response) {
    vidteq.utils.undrapeSheer(drape);
    if( that.landmarkPolygonMboxIf ) {
      that.landmarkPolygonMboxIf.handleLandmarkResponse(response);  
    }else {
      that.mbox.createLandMarkLayer(response);
    }
  }
  if(vidteq.vidteq.scriptBased) {data.callbackFunction='vidteq.mboxObj.createLandMarkLayer';}
  this.magicCall = $.ajax({
    url:vidteq.cfg.magicHappensUrl,
    data:data,
    dataType:vidteq.vidteq.dataType,
    success: handleCallMakeLmLayer,
    error:function(response) { vidteq.utils.undrapeSheer(drape); that.io.handleError(response); }
  }); 
}

vidteq._gui.prototype.callIframeFunc = function (id) {
  var iframe = document.getElementById(id);
  if(typeof(iframe) != 'undefined' && iframe != null) { 
    iframe.contentWindow.triggerChildCallback();
  }
}

vidteq._gui.prototype.attachEventsToMobileTab = function () {
  var that = this;
  if (this.sideBarUI) {
    $('#onYourMobileHref').click(function() {
      that.frontPageNum = 'onYourMobile';
      that.callIframeFunc("customMultiPageFrame");
      that.closeFrontPage();
      that.selectInTopPanel('div_onYourMobileHref');
      that.loadMultiFrontPage();
      that.fvt.hideNew();
      that.clearAll();
      return false;
    });
  }
}

vidteq._gui.prototype.attachEventsToFeedbackTab = function () {
  var that = this;
  $('#feedbackhref').click(function () {
    if (that.sideBarUI) {
      that.frontPageNum = 'expressInterest';
      that.callIframeFunc("customMultiPageFrame");
      that.closeFrontPage();
      that.selectInTopPanel('div_feedbackhref');
      that.loadMultiFrontPage();
      that.fvt.hideNew();
      that.clearAll();
      return false;
    }
    $.get(that.cred.feedbackForm.url,function (content) {
      that.cred.handleFeedbackForm(content); 
    });
    if (that.topBarUI||that.sideBarUI) {  
      that.selectInTopPanel('div_feedbackhref');
    }
  });
}

vidteq._gui.prototype.createAndShowFrontPage = function (fpMode) {
  if (typeof(vidteq.aD) =='undefined' || typeof(vidteq.aD.config.frontCurtainHtmlFile) == 'undefined') return;
  if (vidteq.utils.trim(vidteq.aD.config.frontCurtainHtmlFile) == "") return;
  if ( this.embed && this.embed.firstTimeRule && this.embed.firstTimeRule.noFrontCurtain) return;
  if( this.nemo && typeof(vidteq.aD.config.nemoUI) !== 'undefined'
      && vidteq.aD.config.nemoUI && typeof(vidteq.aD.config.nemoUIFCHtmlFile) !== 'undefined' ) {
      
    vidteq.aD.config.frontCurtainHtmlFile = vidteq.aD.config.nemoUIFCHtmlFile;
  }
  if( this.sideBarUI && typeof(vidteq.aD.config.sideBarUIFCHtmlFile) !== 'undefined' ) {
    vidteq.aD.config.clickAttachedFrontPage = 1;
    vidteq.aD.config.frontCurtainHtmlFile = vidteq.aD.config.sideBarUIFCHtmlFile;
  }
  this.landmarkClicked = false;
  if((vidteq.aD.config.clickAttachedFrontPage && parseInt(vidteq.aD.config.clickAttachedFrontPage)) && (!this.handheld)) {
    this.multiFrontPage = true;
    this.frontPageNum = 'multiHome';
    this.loadMultiFrontPage(fpMode);
  } else
  this.loadFrontPage(fpMode);
}

vidteq._gui.prototype.remove3dmap = function() {
  this.clearAll();
  this.fvt.hideNew();
  $('#map').fadeIn("slow");
  $('#input-div').fadeIn("slow");
  $('#3dmapBody').remove();
}

vidteq._gui.prototype.setMode3D = function(mode3D) {
  this.mode3D = mode3D;
  $('#3dmapBody').remove();
  this.createAndShow3dmap();	
}
vidteq._gui.prototype.createAndShow3dmap = function () {
  if (this.map3d) {
    this.map3d.reInit();
  } else {
    this.map3d = new vidteq._map3d(this,vidteq.aD);
  }
  return;
  if($('#3dmapBody').length != 0) $('#3dmapBody').remove();
  var con = $("<div id = '3dmapBody' style='margin-top:0px;margin-left:0px;padding:0px;background-color:transparent;'> </div>").appendTo('body');
  //var path = vidteq.cfg.customHtmlUrl+vidteq.aD.config.frontCurtainHtmlFile;
  var path = "3dmap/WebContent/car.html";
  //var wid = $('body').width();
  //var hgt = $('body').height();
  var windowWidth = document.documentElement.clientWidth;
  var windowHeight = document.documentElement.clientHeight;
  //var windowWidth = wid;
  //var windowHeight = hgt;
   var refHtml = "<iframe id='custom3dmapFrame' style='width:"+windowWidth+"px;height:"+windowHeight+"px;padding=0;margin=0;background:transparent;' frameborder=0 src=\""+path+"\"></iframe>";
  con.html(refHtml);
  $('#3dmapBody').css({
    'width' : windowWidth,
    'height': windowHeight,
    'background-color':'#FFFFFF',
    'position':'absolute',
    'right' : '0px',
    'top'  : '0px',
    'z-index' : '20000'
  });
  //this.fvt.hideNew();
}

//vidteq._gui.prototype.loadThumb = function(menu,count){
//  $('#intro').hide();
//  $('#thumbList').empty();
//  var val = 0;
//  for(k=0;k<count;k++){ val = val + this.thumbList[k].length;}    
//  for(i=0;i<this.thumbList[count].length;i++) {
//     pan = val + i;
//     $('#thumbList').append("<li><a href='javascript:void(0);' onClick='javascript:vidteq.gui.clickThumb(\""+this.thumbList[count][i]+"\",\""+this.descList[count][i]+"\","+pan+","+count+");'><img  src='"+this.thumbImgList[count][i]+"'  title='"+this.descList[count][i]+"' border=0 /></a></li>");
//  }
//  vidteq.gui.clickThumb(this.thumbList[count][0],this.descList[count][0],val,count);
//}

//vidteq._gui.prototype.clickThumbInMap = function(thumbSrc,thumbDesc,count,row){
//  if (!($('#popupMap').length)) {
//    $('#popupContact').prepend("<div id='popupMap' style='height:374px;left:148px;position:absolute;top:0px;width:1019px;z-index:300009;background:#f3f3f3;'><img id='popMapImg' src='"+thumbSrc+"' style='z-index:300009;height:0px;width:0px;border: 3px solid #333;' alt='Map' usemap='#Map'/><map name='Map' id='Map'></map></div>");
//  } else {
//    $('#popMapImg').attr('src',thumbSrc);
//    $('#Map').empty();
//    //$("#popupMap :not(:first-child)").remove();
//  }
//  $('#popupFS').hide();
//  var val = 0;
//  for(k=0;k<row;k++){ val = val + this.thumbList[k].length;}
//  for(var i=1;i<this.tabImageMapList[row].length;i++){
//    pan = val + i ;
//    var cord = this.tabImageMapList[row][i][0] + "," + this.tabImageMapList[row][i][1]+"," + (parseInt(this.tabImageMapList[row][i][0])+15) + "," + (parseInt(this.tabImageMapList[row][i][1]) + 15);
//    $('#Map').append("<area shape='rect' coords='"+cord+"' href='javascript:void(0);' onClick='javascript:vidteq.gui.clickThumb(\""+this.thumbList[row][i]+"\",\""+this.descList[row][i]+"\","+pan+","+row+");' alt='Map' />");
//  }
//  if (this.mapStatus == 0) {
//    that = this;
//    $('#tsImage').hide();
//    $('#popupMap').show();
//    $('#popMapImg').animate({
//      width: '1019px',
//      height: '374px'
//    },1000, function() {
//    });
//    this.mapStatus = 1;
//  } else {
//    $('#popupMap').hide();
//    $('#popupMap').show(); 
//  }
//}

//vidteq._gui.prototype.clickThumbInImage = function(thumbSrc,thumbDesc,count,row) {
//  $('#popupFS').show();
//  if (this.mapStatus == 1) {
//    $('#popMapImg').animate({
//       width: '0px',
//       height: '0px'
//    },1000, function() {
//       $('#popupMap').hide();
//       $('#popupMap').remove();
//       $('#tsImage').show();
//       document.tsImage.newPanoFromList(count);
//    });
//    this.mapStatus = 0;
//  }  else {
//    $('#tsImage').show();
//    document.tsImage.newPanoFromList(count);
//  }
//}

//vidteq._gui.prototype.clickThumb = function(thumbSrc,thumbDesc,count,row){
//  this.popCount = count;
//  $('#intro').hide();
//  if (thumbDesc == "Map") { 
//    this.clickThumbInMap(thumbSrc,thumbDesc,count,row);
//  } else {
//    this.clickThumbInImage(thumbSrc,thumbDesc,count,row);
//  } 
//}

vidteq._gui.prototype.loadFinished = function() {
  this.loadFinish = true;
}

//vidteq._gui.prototype.closeVPopHelp = function() {
//  var is_chrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
//  var is_ie=navigator.appName == "Microsoft Internet Explorer";
//  if(is_chrome || is_ie){ $('#popupHelpFrame').remove(); }
//  $('#popupHelpImage').hide();
//}

vidteq._gui.prototype.pauseVideoOrAjax = function( ) {
  if(this.io.glbAjxRoute) {
    this.io.glbAjxRoute.abort();
  }
  if(vidteq.fvtObj.getVideoObj(vidteq.fvtObj.videoSwf)) {
    vidteq.fvtObj.getVideoObj(vidteq.fvtObj.videoSwf).pauseClicked();
  }
}

vidteq._gui.prototype.createAndShowVenue = function( venueAutoShow, options ) {
	console.log("createAndShowVenue");
  //this.pauseVideoOrAjax();
  //this section comes from 360
  options = options || {};
  var aD = options.aD || vidteq.aD;
  //var x='[{"dirCode":"f","directFs":"1","header":"d","items":[{"fov":["80","120","140"],"ptvImageName":"Gate.ptv.jpg","marker":[190,70],"title":"f","markDesc":[{"angle":3.3899585495316433,"elevation":24.37823958343096,"thumb":{"desc":"2"}},{"angle":19.573234617482875,"elevation":27.05271569350804,"thumb":{"desc":"3"}}]},{"fov":["80","120","140"],"ptvImageName":"Bathroom2.ptv.jpg","marker":[466,235],"title":"w","thumbImageName":"thumb_Gate.ptv.jpg","markDesc":[{"angle":20.331302769636824,"elevation":27.059485374396772,"thumb":{"desc":"9"}},{"angle":54.372871234043835,"elevation":30.575382247652634,"thumb":{"desc":"8"}}]}],"masterPlan":{"mpImageName":"Elevation_map2.gif"}}]';
  //x='[{"dirCode":"f","directFs":"1","header":"f","items":[{"fov":["80","120","140"],"ptvImageName":"Gate.ptv.jpg","marker":[517,230],"title":"f","adhocAngle":1.275835683207839},{"fov":["80","120","140"],"ptvImageName":"Bathroom2.ptv.jpg","marker":[233,268],"title":"d","adhocAngle":2.1153390534171006,"markDesc":[{"angle":102.11178248051786,"elevation":10.137275220098253,"thumb":{"desc":"ee"}}]}],"tabNo":0,"masterPlan":{"mpImageName":"Elevation_map2.gif"}}]';
  x='[{"dirCode":"Ban","directFs":"1","header":"Ban","items":[{"fov":["80","120","140"],"ptvImageName":"Gate.ptv.jpg","marker":[190,70],"title":"B1"},{"fov":["80","120","140"],"ptvImageName":"Bathroom2.ptv.jpg","marker":[402,142],"title":"B2","thumbImageName":"thumb_Gate.ptv.jpg","markDesc":[{"angle":86.59487797369492,"elevation":-22.46396533812277,"thumb":{"desc":"Basin"}},{"angle":70.62001495913437,"elevation":3.8825021939644717,"thumb":{"desc":"Mirror","imMrkName":"2.jpg"}}]}],"tabNo":0,"masterPlan":{"mpImageName":"Elevation_map2.gif"}},{"dirCode":"Kol","directFs":"1","header":"Kol","items":[{"fov":["80","120","140"],"ptvImageName":"Villa1.ptv.jpg","marker":[190,70],"title":"K1","thumbImageName":"thumb_Villa1.ptv.jpg","markDesc":[{"angle":96.93577367353953,"elevation":2.882998736561777,"thumb":{"desc":"Gate","imMrkName":"1.jpg"}}]},{"fov":["80","120","140"],"ptvImageName":"Villa2.ptv.jpg","marker":[276,233],"title":"K2","adhocAngle":1.425933998879342,"markDesc":[{"angle":-57.77866150442837,"elevation":6.601262723960245,"thumb":{"desc":"Kang"}}]}],"tabNo":1,"masterPlan":{"mpImageName":"map2.gif"}}]';
  if (this.stickyKey && this.stickyKey[65]) { //fresh one
    this.stickyKey[65]=false;
    //this.stickyKey[66]=false;
    //this.stickyKey[67]=false;
    aD = {};
    options.editableMode = true;
    options.editableFresh = true;
    options.directFs = true;
    this.venue360UI =undefined;
  } else if (this.stickyKey && this.stickyKey[66]){ //old + new
    //this.stickyKey[65]=false;
    this.stickyKey[66]=false;
    //this.stickyKey[67]=false;
    //aD.places.venue=JSON.parse('[{"dirCode":"d","directFs":"1","header":"w","items":[{"fov":["80","120","140"],"ptvImageName":"Gate1.ptv.jpg","marker":[190,70],"title":"d"},{"fov":["80","120","140"],"ptvImageName":"Gate1.ptv.jpg","marker":[270,249],"title":"c","thumbImageName":"thumb_Gate.ptv.jpg","savedMarkerDesc":[{"angle":71.01449880832287,"elevation":22.474350631925827,"thumb":{"desc":"w1"}}]}],"masterPlan":{"mpImageName":"Elevation_map2.gif"}},{"dirCode":"d","directFs":"1","header":"d","items":[{"fov":["80","120","140"],"ptvImageName":"Gate.ptv.jpg","marker":[190,70],"title":"d","savedMarkerDesc":[{"angle":78.83266885752307,"elevation":19.453938014308115,"thumb":{"desc":"d1"}}]}]}]');
    //aD.places.venue=JSON.parse(x);
    options.editableMode = true;
    options.editableFresh = false;
    options.directFs = true;
    console.log(options);
    this.venue360UI =undefined;
  }else if (this.stickyKey && this.stickyKey[67]){ //old {		
		//aD = vidteq.aD;
		//aD.places.venue=JSON.parse(x);    
    options.directFs = true;
    this.venue360UI =undefined;
	}else {		
		aD = {};
    options.editableMode = true;
    options.editableFresh = true;
    options.directFs = true;
    //this.venue360UI =undefined;
	}
  //console.log(options);console.log(this);console.log(this.venue360UI);alert();
  if( !this.venue360UI ) {
    options = options || {};
    
    options.city = vidteq.cfg.city;
    options.urlid = vidteq.aD.urlId;
    
    //this.venue360UI = new vidteq._venue360UI( this, venueRec, venueAutoShow, options );
    this.venue360UI = new vidteq._venue360UI( this, aD, venueAutoShow, options );
    this.venue360UI.setList( aD, venueAutoShow ,options);
    //this.venue360UI.setList( venueRec, venueAutoShow );
    this.venue360UI.preInit();
  }else {
    this.venue360UI.setList( vidteq.aD, venueAutoShow, options);
    this.venue360UI.reInit( vidteq.aD, venueAutoShow, options);
    this.venue360UI.checkAndSetAutoShow( aD, venueAutoShow );
    this.venue360UI.reInit( aD, venueAutoShow );
    //this.venue360UI.checkAndSetAutoShow( venueRec, venueAutoShow );
    //this.venue360UI.reInit( venueRec, venueAutoShow );
    this.venue360UI.preInit();
  }
  return this.venue360UI.venue360.config;
}

vidteq._gui.prototype.createAndShow3DExplore = function( venueAutoShow, options ) {
  var aD = vidteq.aD;
  var as = "explore";
  if ( !this[ as ] ) { this[ as ] = {}; }
  
  if( !this[ as ].venue3DExplore ) {
		console.log("createAndShow3DExplore if");
    this[ as ].venue3DExplore = new vidteq._venue360UI( this, aD, venueAutoShow, options );
    this[ as ].venue3DExplore.preInit();
  }else {
    this[ as ].venue3DExplore.reInit( aD, venueAutoShow );
    this[ as ].venue3DExplore.preInit();
  }
  return this[ as ].venue3DExplore.venue360.config;
}

vidteq._gui.prototype.popupSkip = function(){
  if ($('#intro').is(":visible")) {
    $('#intro').hide();
    $('#tsImage').show();
    $('#popupFS').show();
  }
}

vidteq._gui.prototype.fullScreen = function(){
   $('body').prepend("<div id='popupContact1'><div id='fsTopStrip' style='min-width:100%;min-height:42px;background: url("+vidteq.imgPath.vPopFStop+") 0 0 repeat-x'><a id='popupRotateF' href='javascript:void(0);'><img src='"+vidteq.imgPath.vPopRotate+"' title='Auto Pan' style='position:absolute;left:64px;top:8px;border:0px;' /></a><a id='popupHomeF' href='javascript:void(0);'><img src='"+vidteq.imgPath.vPopHome+"' title='Home' style='position:absolute;left:10px;top:7px;border:0px;' /></a><a id='popupZIF' href='javascript:void(0);'><img src='"+vidteq.imgPath.vPopZoomIn+"' title='ZoomIn' style='position:absolute;left:153px;top:4px;border:0px;' /></a><a id='popupZOF' href='javascript:void(0);'><img src='"+vidteq.imgPath.vPopZoomOut+"' title='ZoomOut' style='position:absolute;left:185px;top:8px;border:0px;' /></a><img src='"+vidteq.imgPath.vPopFSPan+"' title='Pan' style='position:absolute;left:239px;top:8px;border:0px;' usemap='#popFSMap'/><map name='popFSMap' id='popFSMap'><area id='movLeftF' shape='rect' coords='55,4,72,18' href='javascript:void(0);'/><area shape='rect' id='movUpF' coords='10,4,25,18' href='javascript:void(0);' /><area id='movDownF' shape='rect' coords='32,4,48,18' href='javascript:void(0);' /><area id='movRightF' shape='rect' coords='80,4,95,18' href='javascript:void(0);' /></map></div><a id='popupContactClose1' ><img src='"+vidteq.imgPath.vPopMin+"' title='Close' /></a></div>");
   var windowWidth = document.documentElement.clientWidth;
   var windowHeight = document.documentElement.clientHeight;
   var bgColor = "#a6ce39";
   if (vidteq.aD.config.venueBtnColor) { bgColor = vidteq.aD.config.venueBtnColor; }
   $("#popupContact1").css({
    "border":"3px solid #575757",
    "background-color":bgColor,
    "position": "absolute",
    "top": "0px",
    "left": "0px",
    "width": windowWidth +"px",
    "height":windowHeight+"px"
  });
  var innerHtml = $('#viewer').html().replace(/tsImage/g,"tsImage1");
  innerHtml = innerHtml.replace("1022",(windowWidth));
  innerHtml = innerHtml.replace("380",(windowHeight - 42));
  innerHtml = innerHtml.replace("intro","intro1");
  $('#popupContact1').append(innerHtml);
  $('#intro1').remove();
  //$("#tsImage1").attr('width',(windowWidth-40)+"px");
  //$("#tsImage1").attr('height',(windowHeight-85)+"px");
  $("#tsImage1").css({
    "position":"absolute",
    "top":"42px",
    "left":"0px",
    "width": (windowWidth)+"px",
    "height": (windowHeight - 46)+"px"
   });
  //$("#popupContact1").corner();
  $('#popupContact1').draggable({ handle: '#fsTopStrip' });
  var that = this;
  var is_chrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
  var is_ie=navigator.appName == "Microsoft Internet Explorer";
  if(is_ie){
    setTimeout(function(){
      $("#popupContact1").show();
      document.tsImage1.newPanoFromList(that.popCount);
    },2000); 
  } else if(is_chrome) { 
    $("#popupContact1").show();
  } else {
    $("#popupContact1").show();
    document.tsImage1.newPanoFromList(this.popCount);
  }
  if(is_chrome) {
    setTimeout(function(){
      document.tsImage1.newPanoFromList(that.popCount);
    },2000);
  }
  $('#tsImage1').mousewheel(function(event, delta, deltaX, deltaY) {
    if(delta >0 && ((document.tsImage1.hfov_min+2) < document.tsImage1.fov())) document.tsImage1.ZoomIn();
    if(delta <0 && ((document.tsImage1.hfov_max-2) > document.tsImage1.fov())) document.tsImage1.ZoomOut();
  });
 
  $('#popupRotateF').click(function() {
    document.tsImage1.startAutoPan(0.15,0,1);
  });
  $('#popupHomeF').click(function() {
    $("#popupContactClose1").click();
    $('#popupHome').click();
  });
  $('#popupZIF').click(function() {
    document.tsImage1.ZoomIn();
  });
  $('#popupZOF').click(function() {
    document.tsImage1.ZoomOut();
  });
  $('#movUpF').mouseup(function(){
    document.tsImage1.stopAutoPan();
  }).mousedown(function(){
    document.tsImage1.startAutoPan(0,0.15,1);
  });
  $('#movDownF').mouseup(function(){
    document.tsImage1.stopAutoPan();
  }).mousedown(function(){
    document.tsImage1.startAutoPan(0,-0.15,1);
  });
  $('#movLeftF').mouseup(function(){
    document.tsImage1.stopAutoPan();
  }).mousedown(function(){
    document.tsImage1.startAutoPan(-0.15,0,1);
  });
  $('#movRightF').mouseup(function(){
    document.tsImage1.stopAutoPan();
  }).mousedown(function(){
    document.tsImage1.startAutoPan(0.15,0,1);
  });
  $("#popupContactClose1").click(function(){
    $("#popupContact1").hide();
    $("#popupContact1").remove();
  });
}

vidteq._gui.prototype.detectFlashSmall = function () {
   return this.anotherFlashDetect();
////debugPrint("detecting flash");
////debugPrint(navigator.plugins);
////debugPrint(navigator.mimeTypes);
////debugPrint(vidteq.vidteq.flashVersionDetected);
//var isIE  = (navigator.appVersion.indexOf("MSIE") != -1) ? true : false;
////debugPrint(isIE);
////if (typeof(navigator.mimeTypes ["application/x-shockwave-flash"]) != 'undefined') { return true; }
//if (navigator.plugins && navigator.plugins.length &&
//    navigator.plugins["Shockwave Flash"]) {
//  return true;
//} else if (navigator.mimeTypes && navigator.mimeTypes.length &&
//    navigator.mimeTypes["application/x-shockwave-flash"] && 
//    navigator.mimeTypes ["application/x-shockwave-flash"].enabledPlugin) {
//  return true;
//}
//return false;
}

vidteq._gui.prototype.triggerVenue = function(index) {
  var that = this;
  if($.browser.msie && $.browser.version.substr(0,1)==8 && !that.IE8FirstTime) {
    var r=confirm("Internet Explorer 8 supports 360 viewer only in new Window. Please allow the pop-up or update to IE9 to have a better experience.")
    if (r==true) {
     var pathIe8 = 'http://'+document.location.host+document.location.pathname+'?city='+ vidteq.cfg.city + '&urlid=' + vidteq.aD.urlId + '&firstTimeRule={"venue":"ie8"}';
      window.open(pathIe8,'myie8Pop','');
      return;
    } else {
      return;
    }
  }
  that.closeFrontPage();
  that.fvt.hideNew();
  that.clearAll();
  setTimeout(function() { that.createAndShowVenue(); },10 );
}

vidteq._gui.prototype.closeFrontPage = function () {
   //this.venue360UI.isAnimating=false;
    //delete that.venue360UI;

  if (this.multiFrontPage) {
    if(this.sideBarUI) {
      $('#frontCurtainContent').hide();
      $('#backgroundFrontPage').hide();
    } else {
      $('#frontCurtainContent').remove();
      $('#backgroundFrontPage').remove();
    }
  } else {
    $('#frontCurtainClose').click();
  }
}

vidteq._gui.prototype.multiNBBack = function () {
  this.frontPageNum = 'explore';
  this.selectInTopPanel('div_bizdisplay');
  this.fvt.hideNew();
  this.clearAll();
  this.loadMultiFrontPage();
}

vidteq._gui.prototype.getFrontPageNum = function () {
  return this.frontPageNum;
}
vidteq._gui.prototype.loadMultiFrontPage = function (fpMode) {
  if (!this.multiFrontPage) { return; } 
  // extra check cannot render if not multipage
  this.attachFlashCall(fpMode);
  var pName = 'frontCurtainContent';
  if ($('#'+pName).length == 0) {
    var con = $("<div id = '"+pName+"' class='frontCurtainContentClass' style='margin-top:0px;margin-left:0px;padding:0px;background-color:transparent;'> </div>").appendTo('body');  
    $('body').append("<div id = 'backgroundFrontPage'></div>");
    //TBD: got some side-effects here
    //$('#'+pName).css('z-index','200001');//original
    $('#'+pName).css('z-index','1000');
    var path = vidteq.cfg.customHtmlUrl+vidteq.aD.config.frontCurtainHtmlFile;    
    var crossDomain = false; // TBD how to detect if cross domain
    if (crossDomain) {
      path += '?targetUrl='+encodeURIComponent(document.location.href);
      path += '&scriptUrl='+encodeURIComponent(vidteq._serverHostUrl);
      this.frontPageUrl = path;
    }
    var refHtml = "";
    if(this.sideBarUI) {
      refHtml = "<iframe id='customMultiPageFrame' style='width:1000px;padding=0;margin=0;background:transparent;' frameborder=0 src=\""+path+"\"></iframe>";
    } else {
      refHtml = "<iframe id='customMultiPageFrame' style='position:fixed;top:50%;left:50%;margin-left:-30em;margin-top:-18em;width:1000px;height:600px;background:transparent;' frameborder=0 src=\""+path+"\"></iframe>";
    }
    con.html(refHtml);
    if(this.sideBarUI) {
      con.append("<div id='iframeImageLoader' style='display: block; position: absolute; left: 35%; top: 50%;margin-top:-4em; '><img src='images/ajax-loader_white.gif'/></div>");
    }
    var windowWidth = $('body').width();
    var windowHeight = $('body').height();
    var popupHeight = (600 > $('#customMultiPageFrame').height())?600:$('#customMultiPageFrame').height();
    var popupWidth = (1000 > $('#customMultiPageFrame').width())?1000:$('#customMultiPageFrame').width();
    //var posTop = windowHeight/2-popupHeight/2;
    var posLeft = windowWidth/2-popupWidth/2;
    //if(popupHeight > windowHeight)
    var	 posTop = 10;	
    if (this.sideBarUI) {
      posLeft = 168;
      if(this.frontPageNum == 'explore' || this.frontPageNum == 'lmr' || this.frontPageNum == 'onYourMobile' || this.frontPageNum == 'expressInterest' ) {
        if (self.navigator.userAgent.match(/MSIE\s[7]/)){ 
          $('#customMultiPageFrame').css({height:document.documentElement.clientHeight});
        } else {
          $('#customMultiPageFrame').css({height:$('#map').height()});
        }
        $('#customMultiPageFrame').css({width:'326px',overflow:'hidden'});
      } else {
        if (self.navigator.userAgent.match(/MSIE\s[7]/)){ 
          $('#customMultiPageFrame').css({height:document.documentElement.clientHeight});
        } else {
          $('#customMultiPageFrame').css({height:$('#map').height()});
        }
        $('#customMultiPageFrame').css({width:'450px',overflow:'hidden'});
      }
      //$('#customMultiPageFrame').css({width:'450px',height:document.documentElement.clientHeight,overflow:'hidden'});
      posTop = 0; 
      $('#backgroundFrontPage').css({
        //'width' : windowWidth,
        'height': windowHeight,
        'background-color':'transparent',
        'position':'absolute',
        'left' : '0px',
        'top'  : '0px'
        //'z-index' : '200000'
      });
    } else {
      $('#backgroundFrontPage').css({
        'width' : windowWidth,
        'height': windowHeight,
        'background-color':'#FFFFFF',
        'position':'absolute',
        'left' : '0px',
        'top'  : '0px',
        //'z-index' : '200000', //TBD: may have side-effects, but too high values sould be used wisely
        'z-index' : '999',
        'opacity':'0.5'
      });
    }
    $('#backgroundFrontPage').hide();
    $('#'+pName).css({
      'position' : 'absolute',
      'left'     : posLeft + 'px',
      'top'      : posTop + 'px'
    });
    $('#'+pName).hide();
    $('#'+pName).fadeIn("slow");
    $('#backgroundFrontPage').fadeIn("slow");
    if(this.sideBarUI) {
      this.animateSideBarUI();
    }
  } else {
    if(this.sideBarUI) {
      this.animateSideBarUI();
    }
  }
  var that = this;
  
  $('#'+pName+' iframe').load(function() { 
    $('#iframeImageLoader').hide();
  });
  $(window).resize(function() {
    if(that.sideBarUI) {
      if (self.navigator.userAgent.match(/MSIE\s[7]/)){
        $('#base').css({position:'absolute',top:'0px'});
      } else {
        $('#map').css({position:'absolute',top:'0px'});
      }
      $('#rightContainer').css({height:$('#map').height()});
      $('#rightContainer').css({height:document.documentElement.clientHeight});
      $('#customMultiPageFrame').css({height:document.documentElement.clientHeight});      
      var resultHeightT = parseInt($('#locadiv').height() - 50)+'px';
      $('#locadivinside').css({height:resultHeightT});
      if(!$('#customMultiPageFrame').is(':visible')){ return; }
      
    }
    var windowWidth = $('body').width();
    var windowHeight = $('body').height();
    var popupHeight = (600 > $('#customMultiPageFrame').height())?600:$('#customMultiPageFrame').height();
    var popupWidth = (1000 > $('#customMultiPageFrame').width())?1000:$('#customMultiPageFrame').width();
    var posTop = windowHeight/2-popupHeight/2;
    var posLeft = windowWidth/2-popupWidth/2;
    if(popupHeight > windowHeight)
         posTop = 10;

    if (that.sideBarUI) {
      posTop = 0;
      posLeft = 168;
      windowHeight = $('#map').height();
      if (self.navigator.userAgent.match(/MSIE\s[7]/)){ 
        $('#customMultiPageFrame').css({height:document.documentElement.clientHeight});
      } else {
        $('#customMultiPageFrame').css({height:$('#map').height()});
      }
      //$('#rightContainer').css({height:$('#map').height()});
      $('#rightContainer').css({height:document.documentElement.clientHeight});
      var resultHeight = parseInt($('#locadiv').height() - 50)+'px';
      $('#locadivinside').css({height:resultHeight});
    } 
    $('#backgroundFrontPage').css({
       'width' : windowWidth,
       'height': windowHeight
    });
    $('#'+pName).css({
      'position' : 'absolute',
      'left'     : posLeft + 'px',
      'top'      : posTop + 'px'
    });
    $('#'+pName).hide();
    $('#'+pName).fadeIn("slow");
    if (that.sideBarUI) {
      $('#backgroundFrontPage').hide();
    }
  });
}

vidteq._gui.prototype.animateSideBarUI = function() {
  var that = this;
  $('#frontCurtainContent').width(0);
  $('#backgroundFrontPage').width(0);
  if(this.frontPageNum == 'venue') {
    this.mbox.offsetPanZoomBar(0);
    return;
  }
  $('#frontCurtainContent').show();
  $('#backgroundFrontPage').show();
  if(this.frontPageNum == 'explore' || this.frontPageNum == 'lmr' || this.frontPageNum == 'onYourMobile' || this.frontPageNum == 'expressInterest' ) {
    if (self.navigator.userAgent.match(/MSIE\s[7]/)){ 
      $('#customMultiPageFrame').css({width:'343px'});
    }
  } else {
    if (self.navigator.userAgent.match(/MSIE\s[7]/)){ 
      $('#customMultiPageFrame').css({width:'467px'});
    }
  }   
  var refWidth = $('#customMultiPageFrame').width();
  $('#frontCurtainContent').animate({width:refWidth}, { 
    duration : 2000,
    step : function () { 
      that.mbox.offsetPanZoomBar($('#frontCurtainContent').width());
    }, 
    complete : function () {
      that.mbox.offsetPanZoomBar($('#customMultiPageFrame').width());
      that.curtainLoaderHide();
    }
  });
}

vidteq._gui.prototype.curtainLoaderHide = function() {
  $('.frontCurtain_Loader').css('display', 'none');
  $('.frontCurtain_LoaderScreen').css('display', 'none');
}

vidteq._gui.prototype.triggerGoVid = function() {
  var route = arguments[0];
  var fromTo = arguments[1];
  var suggestedObj = arguments[2];
  if (fromTo == "from") {
  //$('#starttextbox').val("");
  //this.routeEnds.remove('start');
    if(typeof(suggestedObj)!='undefined'){
      this.routeEnds.replaceEntity('start',{
      geom:suggestedObj.geom
      ,address:{name:suggestedObj.label}
      });
    }
  //$('#starttextbox').val(route);
  //$('#endtextbox').val(vidteq.aD.places.center.entity.address.name);
  } else {
  //$('#starttextbox').val(vidteq.aD.places.center.entity.address.name);
  //$('#endtextbox').val("");
  //this.routeEnds.remove('end');
    if(typeof(suggestedObj)!='undefined'){
      this.routeEnds.replaceEntity('end',{
      geom:suggestedObj.geom
      ,address:{name:suggestedObj.label}
      });
    }
  //$('#endtextbox').val(route);
  }
  $('#GoVid').click();
}

vidteq._gui.prototype.loadFrontPage = function (fpMode) {
  var pName = 'frontCurtainContent';
  var conCon = $("<div id = '"+pName+"IEWrap' style='position:absolute;left:0px;top:0px;'></div>").appendTo('body');
  //var con = $("<div id = '"+pName+"' style='margin-top:0px;margin-left:0px;padding:10px;background-color:"+vidteq.vidteq.bgColor+";'> </div>").appendTo('body');
  var con = $("<div id = '"+pName+"' style='margin-top:0px;margin-left:0px;padding:10px;background-color:"+vidteq.vidteq.bgColor+";'> </div>").appendTo(conCon);
  this.flashDetected = this.detectFlashSmall();
  if(this.handheld){
    if (!this.flashDetected || true) { window.location.hash='dholder';$('#poweredBy').hide();$('#base').show();return; }
    var that=this;
    //$('#'+pName).css('z-index','200000'); //may have some side effects
    $('#'+pName).css('z-index','999');
    $('#'+pName).load(vidteq.utils.makePathAbsolute(vidteq.cfg.customHtmlUrl)+vidteq.aD.config.frontCurtainHtmlFileForHandheld+' #topOfCustomContent',
    function(){
      $('#'+pName).find('object > embed').each(function () {
        $(this).attr('src',vidteq.cfg.customHtmlUrl+$(this).attr('src'));
      });
      handheldUI.centerDiv('#'+pName);
      $('#'+pName).html($('#'+pName).html());
      $('#frontCurtainContent').css({background:''});
      that.attachFlashCall(fpMode);
    });
  } else {
    if (!fpMode && this.flashDetected) {
      vidteq.utils.drapeSheer('frontCurtain');
    } 
    var refHtml = "<iframe id='customIframe' style='width:auto;height:auto;' frameborder=0 src=\""+vidteq.cfg.customHtmlUrl+vidteq.aD.config.frontCurtainHtmlFile+"\"></iframe>"; 
    con.html(refHtml);
    var that = this;
    var myFpMode = fpMode;
    $('#customIframe').load(function () { 
      if($('#customIframe').contents().find('#topOfCustomContent').find('object').length && 
        !that.flashDetected) 
        return;
      else
        that.transferFrontPage(con,myFpMode); 
    });
  }
}

vidteq._gui.prototype.transferFrontPage = function (con,fpMode) {
  if ($('#customIframe').contents().find('#topOfCustomContent').find('object').length && !this.flashDetected) return;
  $('#customIframe').contents().find('#topOfCustomContent').find('img').each(function () {
    $(this).attr('src',vidteq.cfg.customHtmlUrl+"/"+$(this).attr('src'));
  });
  $('#customIframe').contents().find('#topOfCustomContent').find('object > embed').each(function () {
    $(this).attr('src',vidteq.cfg.customHtmlUrl+"/"+$(this).attr('src'));
  });
  var fpWidth = $('#customIframe').contents().find('#topOfCustomContent table').width();
  //debugPrint(fpWidth);
  if (fpWidth === null) { fpWidth = $('#customIframe').contents().find('#topOfCustomContent').width(); }
  //debugPrint(fpWidth);
  if (fpWidth === null) { fpWidth = this.mbox.getPopupWidth(screen.width/2); }
  //debugPrint(fpWidth);
  var fpHeight = $('#customIframe').contents().find('#topOfCustomContent').height();
  //debugPrint(fpHeight);
  if (fpHeight === null) { fpHeight = this.mbox.getPopupHeight(screen.height/2); }
  //debugPrint(fpHeight);
  $('#frontCurtainContent').html($('#customIframe').contents().find('#topOfCustomContent').html());
  $('#frontCurtainContent').css({width:fpWidth+'px',height:fpHeight+'px'});
  $('#customIframe').remove();
  if (!fpMode) {
    var that = this;
    var closeFuncLocal = function () {
      if (that.handheld) {
        if (!that.landmarkClicked) {
          $('#frontCurtain').html('');
          $('#frontCurtain').hide();
          that.showFrontMenu();
        } else { that.attachMenuButton();}
      }
      return that.moveBackIoFromFp();
    }
    vidteq.utils.createPopupGeneric({div:con,margins:(5+4+2),closeFunc:closeFuncLocal},{name:'frontCurtain',factor:2,handheld:this.handheld});
  }
  if(this.handheld)  $('#frontCurtainContent').css({background:''});
  //if(this.handheld)  $('#frontCurtain').css({background:'',border:'','margin-left':'-55px','margin-top':'15px'});
  if(this.handheld) {
    // TBD - there exist an assumption that front curtains for 
    // handheld is always 280px standardized
    var myMargin = parseInt(screen.width/2-fpWidth/2);
    //debugPrint(screen.width/2);
    //debugPrint(myMargin);
    $('#frontCurtain').css({background:'',border:'','margin-left':'-'+(myMargin-20)+'px','margin-top':'15px'});
  }
  //if(this.handheld)  $('#frontCurtain').css({background:'',border:'','margin-top':'15px'});
  this.moveIoToFp(fpMode);
  this.attachFrontCurtainLandmarkRoutes(fpMode);
  this.attachFlashCall(fpMode);
  this.addZoomHandler();
}

vidteq._gui.prototype.addZoomHandler = function () {
  if ($("#zoomableImage").length == 0) { return; }
  var zoomContainerWidth = $("#zoomableImage").css("width");
  var zoomContainerHeight = $("#zoomableImage").css("height");
  var zoomContainerCss = "width:"+zoomContainerWidth+";height:"+zoomContainerHeight+";border:0px solid black";
  $('#zoomableImage').wrap("<div id='ZoomContainer' class='ZoomContainer' style="+zoomContainerCss+" />");
  var zoomHandler = new _zoomHandler ($("#ZoomContainer"),'zoomableImage','fullViewImage','windowView');
}

vidteq._gui.prototype.moveBackIoFromFp = function () {
  if (!this.ioMoved) { return true; }
  this.ioMoved = false;
  $('#float_input_block_movedInner').appendTo($('#float_input_block_movedInner').data('oldParent'));
  $('#close-float-input').show();
  $('#routedetails').show();
  $('#GoVid')[0].onclick = null;
  $('#GoVid').unbind('click');
  $('#GoVid').click($('#GoVid').data('oldClick'));
  return true;
}

vidteq._gui.prototype.moveIoToFp = function (fpMode) {
  this.ioMoved = false;
  if (!$('#inputBlockContainer').length || !$('#float_input_block_movedInner').length) { return; }
  $('#float_input_block_movedInner').data('oldParent',$('#float_input_block_movedInner').parent());
  $('#close-float-input').hide();
  $('#routedetails').hide();
  if (!fpMode) {
    var oldClick = $('#GoVid')[0].onclick;
    if (typeof(oldClick) == 'undefined' || oldClick === null) {
      var oldClickFuncs = $('#GoVid').data('events')['click'];
      for (var i in oldClickFuncs) { oldClick = oldClickFuncs[i]; }
    }
    $('#GoVid').data('oldClick',oldClick);
    $('#GoVid')[0].onclick = null;
    $('#GoVid').unbind('click');
    $('#GoVid').click(function () {
      $(this).data('oldClick')();
      $('#frontCurtainClose').click();
    });
  }
  $('#inputBlockContainer').append($('#float_input_block_movedInner'));
  if (fpMode) {
    $('#inputBlockContainer').css('height','90px');
    $('#float_input_block').css('position','relative');
    $('#float_input_block').css('text-align','center');
    $('#float_input_block').css('top','0px');
  } else {
    if(this.handheld)
      $('#inputBlockContainer').css('padding-left','0px');
    else
      $('#inputBlockContainer').css('padding-left','20px');
  }
  this.ioMoved = true;
}

vidteq._gui.prototype.attachFrontCurtainLandmarkRoutes = function (fpMode) {
  var that = this;
  var myFpMode = fpMode;
  $('#frontCurtainContent').find('img[id^=landmarkRoute_]').each( function () {
    var index = $(this).attr('id');
    index = index.replace(/^landmarkRoute_/,'');
    $(this).attr('title','Route from '+vidteq.aD.landmarkRoutes[index].address.name+' to '+that.embed.place.address.name);
    $(this).css('cursor','pointer');
    $(this).click(function () { 
      var index = $(this).attr('id');
      index = index.replace(/^landmarkRoute_/,'');
      that.landmarkClicked = true;
      if (myFpMode) {
        var func = 'invokeVidteqPopup_'+vidteq.aD.urlId;
        $.postMessage(func+'(\'{lmRoute:'+index+'}\')', parentUrl );
      } else {
        that.triggerOneLandmarkRoute(index); 
        $('#frontCurtainClose').click();
      }
    });
  });
}  

vidteq._gui.prototype.attachFlashCall = function (fpMode) {
  var that = this;
  if(this.sideBarUI) {
    var pName = 'frontCurtainContent';
    //if($('#'+pName).length == 0) { } else {
      var inside = $("#"+pName +' iframe').contents();
      if(this.frontPageNum == 'explore' || this.frontPageNum == 'lmr' || this.frontPageNum == 'onYourMobile' || this.frontPageNum == 'expressInterest' ) {
        if (!self.navigator.userAgent.match(/MSIE\s[7]/)){ 
          $('#customMultiPageFrame').css({height:$('#map').height()});
        }
        $('#customMultiPageFrame').css({width:'326px',overflow:'hidden'});
      } else {
        if (!self.navigator.userAgent.match(/MSIE\s[7]/)){ 
          $('#customMultiPageFrame').css({height:$('#map').height()});
        }
        $('#customMultiPageFrame').css({width:'450px',overflow:'hidden'});
      }
      if(this.frontPageNum == 'multiHome') {
        this.frontPageNum = 'videoDir';
      }

      window.childCallbackFunc = function (childMap) {
        childMap = childMap || window.childMap || {};
        childMap.frontPageNum = that.frontPageNum;
        var center = vidteq.aD.places.center.entity.address.name;        
        childMap.swapDet = {
          from:that.keyBox.start.val()
          ,to:that.keyBox.end.val()
          ,center:center
        };
        var aD = JSON.stringify(vidteq.aD);
        childMap.accountCfg = {
          center:center
          ,sideBarUI:that.sideBarUI
          ,aD:aD
          ,city:vidteq.cfg.city
        };
      }
    //}
  }
  flashCall = function () {
    //$('#frontCurtainClose').click();
    if (that.handheld) {
      $('#frontCurtainContent').html('');
      $('#frontCurtainContent').hide();
      $('#poweredBy').hide();
      $('#base').show();
      window.location.hash='dholder';
    }
    var code = arguments[0];
    var index = arguments[1];
    switch(code){		
    case 'exp':
      window.location.hash='nearby';
      break;
    case 'close':
      break;
    case 'lmr':
      that.selectInTopPanel('div_landmarkroutes');
      that.triggerOneLandmarkRoute(index);
      break;
    case 'search':
    case 'explore':
      that.selectInTopPanel('div_bizdisplay');
      that.triggerOneNBBSearch(index);
      break;
    case 'venue':
      //this section comes from 360 child iframe page   ID is pano
      that.selectInTopPanel('div_venue');
      that.triggerVenue(index);
      return;
      break;
    case 'suggest':
      var myArg = Array.prototype.slice.call(arguments);
      myArg.shift();
      return that.triggerSuggest.apply(that,myArg); 
      break;
    case 'frontClose':
      that.closeFrontPage();
      return;
      break;
    case 'getPageInfo' :
      var ret = {
        pageNum:that.getFrontPageNum()
        ,swapDet:{
          from:that.keyBox.start.val()
          ,to:that.keyBox.end.val()
          ,center:vidteq.aD.places.center.entity.address.name
        }
        ,sideBarUI:that.sideBarUI
        //,aD:that.sideBarUI?vidteq.aD:''
        ,city:vidteq.cfg.city
      };
      var msg = 'getPageInfo:'+JSON.stringify(ret);
      //$.postMessage('blah',that.frontPageUrl);
      break;
    case 'getPage' :
      return that.getFrontPageNum();
      break;
    case 'swap':
      that.swapRoute();
      return;
      break;
    case 'getSwap':
      var swapDet = {
        from:that.keyBox.start.val()
        ,to:that.keyBox.end.val()
        ,center:vidteq.aD.places.center.entity.address.name
      };
      return swapDet;
      break;
    case 'getAccountDetails':
      if(that.sideBarUI) {
        var aD = JSON.stringify(vidteq.aD);
        var accountCfg = {
          center:vidteq.aD.places.center.entity.address.name
          ,sideBarUI:that.sideBarUI
          ,aD:aD
          ,city:vidteq.cfg.city
        };
        return accountCfg;
      }
      return '';
      break;
    case 'getRoute' :
      var myRouteArg = Array.prototype.slice.call(arguments);
      myRouteArg.shift();
      if(that.sideBarUI) {
        //$('#fvtContainerLabel').html('<h2>Video Directions</h2>');
      }
      that.triggerGoVid.apply(that,myRouteArg);
      break;
    case 'checkEmailId' :
      var myArg = Array.prototype.slice.call(arguments);
      return vidteq.utils.checkEmailId(myArg[1],true);
      break;
    case 'checkPhoneNumber' :
      var myArg = Array.prototype.slice.call(arguments);      
      return vidteq.utils.checkPhoneNumber(myArg[1],'sideBarUI',true);
      break;
    case 'sendFeedback' :
      var myArg = Array.prototype.slice.call(arguments);
      that.sideBarUIFeedback = myArg[1];
      that.expressInterest = true;
      that.cred.sendFeedback();
      $("#driving-dir-video-link").trigger("click");
      return;
      break;
    }
    that.closeFrontPage();
  };
  if ($.receiveMessage) {
    //console.log("receiveMessage found");
    $.receiveMessage(function (msg) {
      //console.log("message received");console.log(msg);
      //console.log(msg.data);
      eval(msg.data);
    });
  }
}

vidteq._gui.prototype.triggerSuggest = function () {
  var url = "vs/suggest.php"; 
  var host = $(location).attr('host');
  var hisHost = arguments[0];
  var hisQ = arguments[1];
  var json;
  if($.trim(hisHost) == $.trim(host)) {
    json = "json";
  } else {
    json = "json";
  }
  url="http://"+host+"/"+url+"?city="+vidteq.cfg.city+"&term="+hisQ;
  var data={url:url,json:json};
  return data;
}

vidteq._gui.prototype.triggerOneNBBSearch = function (index,click3dCheck) {
  var catList  = this.embed.blocate.allowedCategoryList;
  //this.locateNBB(this.embed.place,catList[index]);
  this.getNbb(catList[index]);
  this.closeAnyDropDowns();
  var that = this;
  if(this.is3dmap && click3dCheck) {
  	this.mode3D = 'exp';
  	//this.fvt.hideNew();
    setTimeout(function(){
      that.createAndShow3dmap();
    },5000);
  }
}

//vidteq._gui.prototype.locateNBBDefault = function (geom) { }
vidteq._gui.prototype.locateNBBDefault = function () {
  // function is called when you dont know which category to call with
  //var catList  = this.embed.blocate.allowedCategoryList;
  // Legacy code removed
  //if (typeof(catList[0]) == 'undefined' ||
  //    typeof(catList[0].name) == 'undefined') {
  //  var newVar = [];
  //  for(var i in catList) {
  //    newVar.push({
  //      name:i
  //      ,categoryList:catList[i]
  //      ,sortby:vidteq.aD.config.sortby || 'priority'
  //    });
  //  }
  //  catList = newVar;
  //}
  if(!this.handheld) {
    if(this.embed.blocate) {
      if(this.embed.hosting) {
        if (this.topBarUI || this.sideBarUI) {
          this.fvt.showNew('srf');
        } else {
          shrinkMap();
        }
      }
      // Legacy code removed
      //if (this.topBarUI || this.sideBarUI || this.handheld) {
      //} else {
      //  this.fvt.writeCategory(catList);
      //  // Currently it is never used as all evisit accounts are topbarui
      //}
    }
  }
  //var toSearch,a;
  // Legacy code removed
  //var cat;
  //if (this.topBarUI || this.sideBarUI || this.handheld) {
  //  cat = catList[0];
  //  // TBD keep earlier search category index and reuse it
  //} else {
  //  // Since blocate always with topBar UI following old can be removed
  //  var toSearch = {categoryList:document.getElementById('bizCatDropDown').options[0].id};
  //  var id=toSearch.categoryList.replace(/\s+/g,"_");
  //  id=id.toString();
  //  document.getElementById(id).selected=true;
  //  cat={};
  //  cat.categoryList = document.getElementById('bizCatDropDown').options[document.getElementById('bizCatDropDown').selectedIndex].value;
  //}
  //if(this.embed.firstTimeRule)  {
  //  //FirstTime Rule is not supposed to contain the CATEGORY LIST anymore.
  //  //toSearch = ioAreaObj.embed.firstTimeRule;
  //}
  var cat = this.embed.blocate.allowedCategoryList[0];
  //geom = geom || this.embed.place;
  //if (!cat.distanceLimit) {
  //  cat.distanceLimit = this.embed.blocate.allowedDistanceLimit;
  //}
  //if (!cat.itemLimit) {
  //  cat.itemLimit = this.embed.blocate.allowedItemLimit;
  //}
  //this.locateNBB(geom,cat);
  this.getNbb(cat);
  if(this.appMode) { 
    // TBD some how launch expand seems to delete  
  } else {
    if (this.topBarUI || this.sideBarUI) {
      this.fvt.showNew('srf');
    } else {
      this.fvt.showLorR('L');
    }
  }
}

vidteq._gui.prototype.getNbb = function(cat) {
  var that = this;
  var myFunc = function () {
    that.getNbbInner(cat);
  };
  if(this.appMode && !this.handheld && !this.openScale) { 
    this.stopWebViewAsyncCalls(myFunc);
    return; 
  }
  myFunc();
}

vidteq._gui.prototype.locateNBB = function(myLoc,cat) {
  var that = this;
  var myFunc = function () {
    that.locateNBBWrap(myLoc,cat);
  };
  if(this.appMode && !this.handheld && !this.openScale) { 
    this.stopWebViewAsyncCalls(myFunc);
    return; 
  }
  myFunc();
}

vidteq._gui.prototype.getNbbLoc = function() {
  return this.embed.place;
}

vidteq._gui.prototype.getNbbInner = function(cat) {
  var myLoc = this.getNbbLoc();
  if (!cat.distanceLimit) {
    cat.distanceLimit = this.embed.blocate.allowedDistanceLimit;
  }
  if (!cat.itemLimit) {
    cat.itemLimit = this.embed.blocate.allowedItemLimit;
  }
  var data2Send={
    action:"businessLocate"
    ,city:vidteq.cfg.city            
    ,account:vidteq.vidteq.account
    ,key:vidteq.vidteq.key
    ,center:myLoc.lonlat.lon+","+myLoc.lonlat.lat
    ,category:cat.categoryList
    ,distance:cat.distanceLimit
    ,limit:cat.itemLimit
  };
  if (this.embed) {
    data2Send.mygid = vidteq.aD.mygid;
    if (vidteq.aD.config.sortby) data2Send.sortby=vidteq.aD.config.sortby;
    if (cat.sortby) data2Send.sortby = cat.sortby;
  }
  
  if (cat.name) { this.embed.blocate.lastSearchCategory = cat.name; }
  else { this.embed.blocate.lastSearchCategory = ''; }
  // caching to enable fvt showing - TBD 
  // we need to store complete category for future referals
  this.preRequest('srf','bizSheer');
  var that = this;
  var handleLocateNBBWrap = function (response) {
    that.postRequest('bizSheer');
    that.io.handleLocate(response);
    that.popupCenter(undefined,1);
    //if(!that.handheld &&
    //   that.embed.place.popup.open==1 &&
    //   that.mbox.popoutCenterPlace ) 
    //  that.mbox.popoutCenterPlace(undefined,1); 
    
    //that.explore.threeDWgt.config should be available by this time if 3D Neighbourhood is required
    var explore = that.explore;
    //if( explore && explore.threeDWgt && explore.threeDWgt.config ) {
    //  //TBD: enable caching in blocate
    //  //because caching of category data is not enabled, create new object every time
    //  var category = {
    //    itemId:cat.name
    //    ,data:response.srf[0].results
    //    ,selected:true
    //  };
    //  /*var categories = explore.threeDWgt.config.categories = {
    //    catOrder:[ cat.name ]
    //    ,distanceCutOff:cat.distanceLimit
    //  };
    //  categories[ cat.name ] = category;*/
    //  
    //  //TBD: hardcoded ID to be removed
    //  var el_neighbourhood3D = $('#'+this.ids.neighbourhood3D);
    //  //case-1: has 3D Neighbourhood and IS active
    //  //case-2: has 3D Neighbourhood and IS active and IS Ready
    //  //case-3: has 3D Neighbourhood and IS active and NOT Ready
    //  //case-4: has 3D Neighbourhood and NOT active
    //  
    //  var onAfterInit3js = false;
    //  if( el_neighbourhood3D.length && el_neighbourhood3D.attr('aria-pressed') === "true" ) {
    //    //case-1:
    //    if( explore.threeDWgt.config.ready ) {
    //      //case-2:
    //      explore.threeDWgt.config.setPoi.call( that.venue3DExplore.venue360, {
    //        threeConfig:explore.threeDWgt.config
    //        ,category:category
    //        ,mapPoiIconType:'markers'
    //        ,distanceCutOff:cat.distanceLimit
    //      });
    //    }else {
    //      //case-3:
    //      onAfterInit3js = true;
    //    }
    //  }else if ( el_neighbourhood3D.length && el_neighbourhood3D.attr('aria-pressed') !== "true" ) {
    //    //case-4:
    //    onAfterInit3js = true;
    //  }
    //  
    //  if( onAfterInit3js ) {
    //    //create a closure
    //    that.explore.threeDWgt.config.callback.onAfterInit3js = function( threeConfig ) {
    //      threeConfig.setPoi.call( threeConfig.venue360, {
    //        threeConfig:threeConfig
    //        ,category:category
    //        ,mapPoiIconType:'markers'
    //        ,distanceCutOff:cat.distanceLimit
    //      });
    //    }
    //  }
    //}
    
  }
  var handleLocateNBBErrorWrap = function (response) {
    that.postRequest('bizSheer');
    that.io.handleError(response);
  }
  this.globalAjaxObj=$.ajax({
    url:vidteq.cfg.magicHappensUrl,
    data:data2Send,
    dataType:vidteq.vidteq.dataType,
    success:handleLocateNBBWrap,
    error:handleLocateNBBErrorWrap
  });
}

vidteq._gui.prototype.locateNBBWrap = function(myLoc,cat) {
  if (!cat.distanceLimit) {
    cat.distanceLimit = this.embed.blocate.allowedDistanceLimit;
  }
  if (!cat.itemLimit) {
    cat.itemLimit = this.embed.blocate.allowedItemLimit;
  }
  var data2Send={
    action:"businessLocate",
    city:vidteq.cfg.city,            
    account:vidteq.vidteq.account,key:vidteq.vidteq.key,
    center:myLoc.lonlat.lon+","+myLoc.lonlat.lat,
    category:cat.categoryList,
    distance:cat.distanceLimit,limit:cat.itemLimit
  };
  if (this.embed) {
    data2Send.mygid=vidteq.aD.mygid;
    if(vidteq.aD.config.sortby) data2Send.sortby=vidteq.aD.config.sortby;
    if(cat.sortby) data2Send.sortby=cat.sortby;
  }
  
  if (cat.name) { this.embed.blocate.lastSearchCategory = cat.name; }
  else { this.embed.blocate.lastSearchCategory = ''; }
  // caching to enable fvt showing - TBD 
  // we need to store complete category for future referals
  this.preRequest('srf','bizSheer');
  var that = this;
  var handleLocateNBBWrap = function (response) {
    that.postRequest('bizSheer');
    that.io.handleLocate(response);
    that.popupCenter(undefined,1);
    //if(!that.handheld &&
    //   that.embed.place.popup.open==1 &&
    //   that.mbox.popoutCenterPlace ) 
    //  that.mbox.popoutCenterPlace(undefined,1); 
  }
  var handleLocateNBBErrorWrap = function (response) {
    that.postRequest('bizSheer');
    that.io.handleError(response);
  }
  this.globalAjaxObj=$.ajax({
    url:vidteq.cfg.magicHappensUrl,
    data:data2Send,
    dataType:vidteq.vidteq.dataType,
    success:handleLocateNBBWrap,
    error:handleLocateNBBErrorWrap
  });
}

vidteq._gui.prototype.closeMenus = function() {
  window.location.hash='';
  $('#mainMenu').show();
} 

vidteq._gui.prototype.handheldLoadPrompt = function () {
  $('#loading_div').css('z-index',100000);
  var that = this;
//  this.playAnimate=setInterval(function () { that.playAnimation(); }, 500);
  $('#loading_div').animate({opacity:0.8},2000);
}

vidteq._gui.prototype.killHandheldPrompt = function () {
  $('#loading_div').animate({opacity:0},{
    duration:2000,
    complete:function(){
      $('#loading_div').css('z-index',0);
//      clearInterval(this.playAnimate);
    }
  });
}

vidteq._gui.prototype.moveleft = function (el) {
  $(el).animate({left: '+='+ ($("#shapeblue").width() + 4)}, 500, function() { $(el).css("z-index", "200010"); });
}
vidteq._gui.prototype.moveright = function (el) {
  $(el).animate({left: '-='+ ($("#shapeblue").width() + 4)}, 500, function() { $(el).css("z-index", "200020"); });
}

vidteq._gui.prototype.playAnimation = function () {
  this.moveleft("#shapeblue");  
  this.moveright("#shapeblue");
  this.moveright("#shapepink");
  this.moveleft("#shapepink");
}

vidteq._gui.prototype.clearAllForVia = function() {
  $('#text_holder').hide();
  $('#myLocationButton').hide();
  //if(!this.openScale) this.mbox.pushControlsUp();
  this.clearAll();
}

//vidteq._gui.prototype.prepareFrontScreen = function () {
//  $('#show_popup_content').width(vidteq.utils.getScreenWidth());
//  var imageSrc=vidteq.cfg.imageLogosLoc;
//  imageSrc=imageSrc.replace(/logos\//,"");
//  imageSrc=imageSrc+vidteq.aD.places.center.entity.image;
//  var poiImg=vidteq.aD.places.center.entity.icon.fvtUrl;
//  var acName=vidteq.aD.places.center.entity.address.name;
//  var image='<img src="'+imageSrc+'" width="160px" height="120px">';
//  var htmlCont="<table><tr><td style='text-align:center'rowspan='2'><img src='"+imageSrc+"'width='160px' height='120px'></td><td style='text-align:center'><img src='"+poiImg+"'></td></tr><tr><td style='text-align:center'>"+acName+"</td></tr><table>";
//  $('#show_popup_content').html(htmlCont);
//  $('#show_popup').show();
//}

vidteq._gui.prototype.poiPopup = function(poi,shortPop) {
  var mapHtml = poi.getEntityHtml('map',0);
  for (var i in mapHtml.funcList) { $('#'+i).click(mapHtml.funcList[i]); }
  $('#show_popup_content').width(vidteq.utils.getScreenWidth());
  var imageSrc=$(mapHtml.contentHTML).find('div').html();
  imageSrc=$(imageSrc).attr('src');  
  var content=$(mapHtml.contentHTML).find('div:nth-child(2)').html();
  var poiImg=$(content).find('img').attr('src');
  var name="<td style='text-align:center'width='50%'><img src='"+vidteq.imgPath.spacer+"'><br/><img src='"+poiImg+"'></td></tr><tr><td width='50%'style='text-align:center'>"+$(content).find('.srfFontBig').html()+"</td></tr>";
  var image='<img src="'+imageSrc+'" width="160px" height="120px">';
  var addrs = $(content).find('table:nth-child(2)').html();
  var dist  = "<table><tr><td style='text-align:center;' width='100%'>"+$(content).find('table:nth-child(3)').html()+"</td></tr></table>";
  dist=$(dist).find('a.srfFontPlain').html();
  if(shortPop) dist='';
  name+="<tr><td style='text-align:center'>"+dist+"</td></tr>";
  dist  = "<table><tr><td style='text-align:center'>"+$(content).find('table:nth-child(3)').html()+"</td></tr></table>";
  var aid=$(dist).find('img').parents().parents().parents().find('a').attr('id');//attr('id');//html();
  var vidImg=$(dist).find('img').parents().parents().parents().find('a').html();
  addrs=$(addrs).find('td').html();
  var tab_cont= "<table><tr><td rowspan=3 width='140'>"+image+"</td>"+name;
  tab_cont+="<tr><td colspan='2' width='100%' style='text-align:center;color:white;'>"+addrs+"</td></tr>";
  if(!shortPop) 
    tab_cont+="<tr><td style='text-align:center' width='50%'>Video Directions</td><td style='text-align:center'><a id="+aid+">"+vidImg+"</a></td></tr></table>";
  else
    tab_cont+="<tr><td></td></tr></table>";
  $('#show_popup_content').html(tab_cont);
  $('#'+aid).click(function(){
    poi.mark('start',true);
  });  
  window.location.hash='show_popup';
}
    
vidteq._gui.prototype.popupCenter = function(evt,shortPop) {
  if (this.openScale) { return; }
  if (this.handheld) { return; }
  if (!this.embed) { return; }
  if (!this.embed.place) { return; }
  if (!this.embed.place.popup) { return; }
  if (!this.embed.place.popup.open) { return; }
  this.mbox.popoutCenterPlace(evt,shortPop); 
}

//vidteq._gui.prototype.findHood = function (pos) {
//  var lon = pos.longitude;
//  var lat = pos.latitude;
//  this.lon=lon;
//  this.lat=lat;
//  if (!this.myLoc) { 
//    this.myLoc = {
//      lonlat:{lon:this.lon,lat:this.lat},
//      geom:"POINT("+this.lon+" "+this.lat+")",
//      index:1,
//      address:{
//        name:'Your Location'
//      }
//    };
//  }
//  this.myLoc.oldLonlat = this.myLoc.lonlat;
//  this.myLoc.lonlat = {lon:this.lon,lat:this.lat};
//  this.myLoc.geom = "POINT("+this.lon+" "+this.lat+")";
//  this.myLoc.address.name = 'Your Location';
//
//  //this.getPointInfo({geom:"POINT("+this.lon+" "+this.lat+")"},'start');
//  var data2Send={
//    action:"findAndSearch",
//    city:vidteq.cfg.city,            
//    point: lon + ' ' + lat
//  };
//  var that = this;
//  globalAjaxObj=$.ajax({
//    url:vidteq.cfg.magicHappensUrl,
//    data:data2Send,
//    dataType:'text/plain',
//    success:function (response) {
//      response = JSON.parse(response);
//      that.depositMyLoc(response.srf[0]);
//    },
//    error:function (response) { 
//      vidteq.debugPrint('there was an error in the request'); 
//    }
//  });
//}

//vidteq._gui.prototype.depositMyLoc = function(resp) {
//  this.myLoc.address.name = resp.results.roadname;
//  var name=resp.results.roadname;
//  //this.geoStartString=name;
//  $('#posHolder').html(name);
//  this.myLoc.myLocValid = true;
//}

vidteq._gui.prototype.anotherFlashDetect = function () {

  function detectPlugin(substrs) {
    if (navigator.plugins) {
      for (var i = 0; i < navigator.plugins.length; i++) {
        var plugin = navigator.plugins[i];
        var haystack = plugin.name + plugin.description;
        var found = 0;
  
        for (var j = 0; j < substrs.length; j++) {
          if (haystack.indexOf(substrs[j]) != -1) {
            found++;
          }
        }
        if (found == substrs.length) {
          return true;
        }
      }
    }
    return false;
  }
  
  function detectObject(progIds, fns) {
    for (var i = 0; i < progIds.length; i++) {
      try {
        var obj = new ActiveXObject(progIds[i]);
  
        if (obj) {      
          return fns && fns[i]
            ? fns[i].call(obj)
            : true;
        }
      } catch (e) {
        // Ignore
      }
    }
     return false;
  }
  
  var plugins = {
    flash: {
      substrs: [ "Shockwave", "Flash" ],
      progIds: [ "ShockwaveFlash.ShockwaveFlash" ]
    }
  };

  for (var alias in plugins) {
    var plugin = plugins[alias];
    if (detectPlugin(plugin.substrs) || detectObject(plugin.progIds, plugin.fns)) {
      return true;
    } else {
      var uaAndroid = navigator.userAgent.match(/android/i) ? true : false;
      if(uaAndroid){
        $('#flashDownload').show(200);
        setTimeout(function(){window.location.href=vidteq.aD.config.androidAppStoreLink;},1000);
        setTimeout(function(){$('#flashDownload').hide();},5000);
      }
      return false;
    }
  }
}

vidteq._gui.prototype.setTemplates = function( options ) {
  options = options || {};
  //if( !vidteq.view ) { vidteq.view = {}; }
  if( !vidteq.template ) {
    vidteq.template = {
      "poiPopup3D": "vPopupFullScreenTemplate4"
      ,"poiPopup2D": "categoryPopup-tmpl"
      ,"lgc": "lgc-poi-tmpl"
      ,"loc": "evaluate-loc-tmpl"
    };
    
    vidteq.template.helper = {
      trim: function( string ) {
        return ( string || '' ).toString().replace(/^\s*|\s*$/g, '');
      }
      ,renderIndex: function(index) {
        return parseInt(index)+1;
      }
      ,lowercase: function( string ) {
        return ( string || '' ).toLowerCase();        
      }
      ,formatWebsite: function(str) {
        return str.toLowerCase().replace(/www./,'');
      }
      ,getLgcCssClass: function(preselected) {
        if(preselected) {
          return "singlerecord lgc-gallery-list-img lgc-gallery-list-preclicked";
        }else {
          return "singlerecord lgc-gallery-list-img";
        }
      }
      ,getCircleArea: function(R) {
        R = parseFloat(R);
        return parseFloat( 3.14159*R*R ).toFixed(2);
      }
      ,getLandmarks: function(data) {
        var landmarks='';
        for(var i=0;i<data.length;i++) {
          if(i===0) {
            //landmarks += '<span class="nemo-tmpl-underline-dashed">' + data[i].name + '</span>';
            landmarks += data[i].name;
          }else {
            //landmarks += ', <span class="nemo-tmpl-underline-dashed">' + data[i].name + '</span>';
            landmarks += ', ' + data[i].name;
          }
        }
        return landmarks;
      }
    };    
  }
  if( !vidteq.template.add ) {
    vidteq.template.add = function( options ) {
      options =  options || {};
      if( options.name && options.id && !vidteq.template[ options.name ] ) {
        vidteq.template[ options.name ] = options.id;
      }
    }
  }
}

vidteq._gui.prototype.getFirstTimeRule = function( options ) {
  options = options || {};
  var firstTimeRule = (function() {
    var as = options.as || "explore";
    var cfg = options.cfg || vidteq.cfg;
    var firstTimeRule = {
      manner: as
      ,center: {
        address: {
          name: cfg.city
        }
        ,geom:"POINT("+cfg.centerLon+" "+cfg.centerLat+")"
        ,distance: 5000
      }
    };
    var ftRule = vidteq.aD.firstTimeRule;
    if( ftRule ) {
      if( ftRule && !ftRule.manner ) {
        as = ftRule.manner = firstTimeRule.manner;  
      }
      if( !ftRule.center ) {
        ftRule.center = {};
      }
      if( !ftRule.center.address ) {
        ftRule.center.address = { name: cfg.city };
      }
      if( !ftRule.center.icon ) {
        ftRule.center.icon = {};
        ftRule.center.icon.name = { name: cfg.city };
      }
      if( !ftRule.center.geom ) {
        ftRule.center.geom = "POINT("+cfg.centerLon+" "+cfg.centerLat+")";
      }
      if( !ftRule.center.distance ) {
        ftRule.center.distance = firstTimeRule.center.distance;
      }
    }else {
      ftRule = firstTimeRule;
    }
    return ftRule; 
  })();
  
  return firstTimeRule;
};

vidteq._gui.prototype.getExplorationArea = function( options ) {
  options = options || {};
  var cfg = vidteq.cfg
  ,explorationArea = {
    areaName : cfg.city
    ,areaLabel: cfg.city
    ,distance: 10000
    ,geom: 'POINT('+cfg.centerLon+' '+cfg.centerLat+')'
    ,limit: 40
    ,offset: 0
    ,circleResizeRequired: false
    ,layers: {
      circle: 'DragCircle'
      ,areaLabel: 'AreaLabel'
      ,polygon: 'PolygonArea'
      ,mmh: 'Mmh'
    }
    ,showEmbedEntityIcon: false
  };
  
  explorationArea.distanceOption = [{
    x: explorationArea.distance
    ,limit: explorationArea.limit
    ,offset: explorationArea.offset
    ,defaultDistance: true
  }];
 
  $.extend(explorationArea, options );
  var distanceOption = explorationArea.distanceOption;
  if( distanceOption ) {
    var defaultDistance;
    for( var i=0;i<distanceOption.length;i++) {
      explorationArea.distance =  parseInt( distanceOption[i].x );
      if( distanceOption[i].defaultDistance ) {
         defaultDistance =  parseInt( distanceOption[i].x );
      }
    }
    if( typeof defaultDistance !== "undefined" ) { explorationArea.distance =  defaultDistance; }
  }
  return explorationArea;
}

vidteq._gui.prototype.getNemoOptions = function( options ) {
  options = options || {};
  var firstTimeRule = options.firstTimeRule || this.getFirstTimeRule()
  ,as = options.as || firstTimeRule.manner
  ,account  = options.account 
  ,behaveAs = (function(account, as) {
    var _behaveAs;
    if( as==="explore" ) {
      if( account ) {
        if( account==="KSL" || account==="roofandfloor" ) {
          _behaveAs = "neighbourhood";
        }
        if( account==="indiaproperty" ) {
          _behaveAs = "hotlocation";
        }
      }
      if( firstTimeRule.behaveAs ) {
        _behaveAs = firstTimeRule.behaveAs;
      }
    }
    return _behaveAs;
  })( account, as )
  ,categoryAutoTrigger = false
  ,legendRequired = false
  ,categoryListRequired = false
  ,categoryListGalleryRequired = false
  ,evaluationAutoTrigger = false
  ,evaluationRequired = false
  ,introRequired = false
  ,toolBarRequired = false
  ,categoryAllTrigger = false
  ,landmarksRequired = false
  ,circleResizeRequired = false
  ,wayfinderSearchRequired = false
  ,disableCatButtonIfNotAvailable = false
  ,categoryToolBarButtonRequired = false
  ,catButtonImg = false
  ,categoryWgtRequired = false
  //,cTabsOrder = ["list","image","videomap"]
  ,cTabsOrder = ["list","videomap"]
  ,sortBy = 'priority'
  ,threeDRequired = false
  ,threeDAutoTrigger = false
  ,kmsToolBarRequired = false
  ,areaPolygonRequired = false
  ,clickedCategory = false
  ,distanceOption = null
  ,mapRequired = true
  ;
  if( firstTimeRule.category ) {
    clickedCategory = firstTimeRule.category;  
  }
  if( behaveAs === "hotlocation" ) {
    categoryListRequired = true;
    categoryListGalleryRequired = true;
    catButtonImg = true
    categoryWgtRequired = true
    evaluationRequired = true;
    evaluationAutoTrigger = true;
    //introRequired = true;
    //toolBarRequired = true;
    //categoryToolBarButtonRequired = true;
    categoryAutoTrigger = true;
    areaPolygonRequired = true;
    landmarksRequired = true;
    mapRequired = true;
    sortBy = 'distance';
  }
  if( behaveAs === "360" || behaveAs === "realview" ) {
    mapRequired = false;
  }
  if( behaveAs === "neighbourhood" || behaveAs === "3D" ) {
    if( behaveAs === "neighbourhood" ) {
      categoryAllTrigger = true;
    }
    if( behaveAs === "3D" ) {
      threeDRequired = true;
      //threeDAutoTrigger = true;
    }
    mapRequired = true;
    categoryAutoTrigger = true;
    catButtonImg = true
    categoryWgtRequired = true
    circleResizeRequired = true;
    kmsToolBarRequired = true;
    sortBy = 'priority';
    distanceOption = [
      {
        x: 2000
        ,limit: 20
        ,offset: 0
        ,display: '2 KM'
      }
      ,{
        x: 5000
        ,limit: 30
        ,offset: 0
        ,defaultDistance: true
        ,display: '5 KM'
      }
      ,{
        x: 10000
        ,limit: 40
        ,offset: 0
        ,display: '10 KM'
      }
    ];
  }
  
  //IE7 not supported for intro
  introRequired = self.navigator.userAgent.match(/MSIE\s[7]/) || !introRequired ? false : true;
  
  //TBD: to handle it for mapview
  var nemoOptions  = {
    uiOptions:{
      categoryWgtOptions: {
        style: 'minibar'
        ,catButtonImg: catButtonImg
      }
      ,distanceOption: distanceOption
      ,cTabsOrder: cTabsOrder
      ,manner: as
      ,sortBy: sortBy
      ,evaluationRequired: evaluationRequired
      ,evaluationAutoTrigger: evaluationAutoTrigger
      ,wayfinderSearchRequired: wayfinderSearchRequired
      ,introRequired: introRequired
      ,areaPolygonRequired: areaPolygonRequired
      ,disableCatButtonIfNotAvailable: disableCatButtonIfNotAvailable
      ,categoryAutoTrigger: categoryAutoTrigger
      ,categoryAllTrigger: categoryAllTrigger
      ,threeDRequired: threeDRequired
      ,threeDAutoTrigger: threeDAutoTrigger
      ,landmarksRequired: landmarksRequired
      ,clickedCategory: clickedCategory
      ,legendRequired: legendRequired
      ,categoryListRequired: categoryListRequired
      ,categoryListGalleryRequired: categoryListGalleryRequired
      ,categoryWgtRequired: categoryWgtRequired
      ,toolBarRequired: toolBarRequired
      ,kmsToolBarRequired: kmsToolBarRequired
      ,circleResizeRequired: circleResizeRequired
      ,categoryToolBarButtonRequired: categoryToolBarButtonRequired
      ,mapRequired: mapRequired
    }
    ,behaveAs: behaveAs
  };
  return nemoOptions;
}

vidteq._gui.prototype.setNemoOptions = function( options ) {
  this.nemoOptions = this.getNemoOptions( options );
}

vidteq._gui.prototype.createNemoUI = function( options ) {
  options = options || {};  
  //TBD: dynamically loading
  vidteq.module = vidteq.module || {};
  vidteq.module.require = vidteq.module.require || {};
  vidteq.module.css = vidteq.module.css || {};
  
  //3D
  vidteq.module.require["3D"] = ['nemo.threeD,venue360UI,venue360'];
  vidteq.module.css["3D"] = ['nemo.category-ui-style','nemo.ui-style','venue360'];

  //realview
  vidteq.module.require["realview"] = ['nemo.realview'];
  vidteq.module.css["realview"] = ['housing_desktop_common','nemo.realview'];

  //360
  vidteq.module.require["360"] = ['nemo.360,venue360UI,venue360'];
  vidteq.module.css["360"] = ['slyThumbSlider','venue360'];

  //debug
  vidteq.module.require["debug"] = ['nemo.debug'].concat( vidteq.module.require["360"] );


  var as = options.as = options.as || "explore"
  ,behaveAs = options.behaveAs
  ,firstTimeRule = options.firstTimeRule
  ,uiwidget = options.uiwidget
  ,nemoUI;
  
  if( as==="explore" ) {
    if( behaveAs === "360" ) {
      
      vidteq.load.module( {}, behaveAs, function( options, scope ) {
        //console.log("trying to load....... module_"+behaveAs);
        if( vidteq.Degree360 && vidteq._venue360UI && vidteq._venue360 ) {
					console.log("createNemoUI if");
          nemoUI = new vidteq.Degree360({
            uiwidget: scope
            ,firstTimeRule: (options || {}).firstTimeRule            
          });
          return true;
        }
      }, options, this );
      
      /*nemoUI = new vidteq.Degree360({
        uiwidget: uiwidget
        ,firstTimeRule: firstTimeRule
      });*/
      
    }else if( behaveAs === "3D" ) {
      vidteq.load.module( {}, behaveAs, function( options, scope ) {
        //console.log("trying to load....... module_"+behaveAs);
        if( vidteq.ThreeDWgt && vidteq._venue360UI && vidteq._venue360 ) {
					console.log("createNemoUI else if");
          nemoUI = new vidteq.ExploreUI({
            uiwidget: uiwidget
            ,firstTimeRule: firstTimeRule
            ,manner: options.as
          });
          return true;
        }
      }, options, this );
      
    }else if( behaveAs === "realview" ) {
       vidteq.load.module( {}, behaveAs, function( options, scope ) {
          //console.log("trying to load....... module_"+behaveAs);
          if( vidteq.Realview ) {
            nemoUI = new vidteq.Realview({
              uiwidget: uiwidget
              ,firstTimeRule: options.firstTimeRule
            });
            return true;
          }
        }, options, this );
    }else if( behaveAs === "debug" ) {
      var checkWithkey = "nemodbg"
      ,debugkey = firstTimeRule.debugkey;
      if( checkWithkey !== debugkey ) {
        return;
      }
      vidteq.load.module( {}, behaveAs, function( options, scope ) {
          //console.log("trying to load....... module_"+behaveAs);
          try {
              if( vidteq.Debug ) {
                vidteq.Debug.load( firstTimeRule, scope );
                return true;
              }
          }catch(err) {
              //console.log("error in loading module");console.log(err.message);
              return true;
          }
        }, options, this );
        
    }else {
      nemoUI = new vidteq.ExploreUI({
        uiwidget: uiwidget
        ,firstTimeRule: firstTimeRule
        ,manner: as
      });
    }
    
  }
  
  if( as==="mapview" ) {
    nemoUI = new vidteq.ExploreUI({
      uiwidget: uiwidget
      ,firstTimeRule: firstTimeRule
      ,manner: as
    });
  }
  return nemoUI;
}
