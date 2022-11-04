if (typeof(vidteq) == 'undefined') { vidteq = {}; }
vidteq.imgPath = {
  generated:false
  ,getImgObjType: function( type ) {
    var imgObjType = {
      nonThemed:{
        draV:"draV.png",
        minV:"minV.png",
        maxV:"maxV.png",
        // Why not themed TBD
        bgStrip:"bgStrip.png",
        bottomStrip:"bottomStrip.png",
        vPopHelpImage:"vPop/vPopHelpImage.png",
        vPopClose:"vPop/vPopClose.png",
        vPopFullScreen:"vPop/vPopFullScreen.png",
        vPopRotate:"vPop/vPopRotate.png",
        vPopHome:"vPop/vPopHome.png",
        vPopZoomIn:"vPop/vPopZoomIn.png",
        vPopZoomOut:"vPop/vPopZoomOut.png",
        vPopHelp:"vPop/vPopHelp.png",
        vPopPan:"vPop/vPopPan.png",
        vPopVidteqLogo:"vPop/vPopVidteqLogo.png",
        vPopFStop:"vPop/vPopFStop.png",
        vPopFSPan:"vPop/vPopFSPan.png",
        vPopMin:"vPop/vPopMin.png",    
        vPopCamera:"vPop/vPopCamera.gif",
        //new files end here
        //popupTopStrip:"popupTopStrip.png",
        //popupLogo:"popupLogo.png",
        //popupButton:"popupButton.png",
        //popupMax:"popupMax.png",
        //buildBody:"pollbody.png",
        vPopNoPlugin:"vPop/vPopNoPlugin.png",
        // TBD end
        multiBack:"multiBack.png",
        multiBackEMin:"Explore_Min.png",
        multiBackEMax:"Explore_Max.png",
        car:"mycar.png",
        buddy:"wap/buddypin2.png",
        like:"like.png",
        time:"time.png",
        proposed_a:"proposed_a.png",
        newSticker:"new.gif",
        viaBall:"viaBall.png",
        busStop:"bus_icon.jpg",
        vidteqMapLogo:"vidteq_map.png",
        start:"start.gif",
        //startIconUrl:"start.gif",
        startIconUrl:"start.png",
        end:"end.gif",
        //endIconUrl:"end.gif",
        endIconUrl:"end.png",
        close:"close.gif",
        camera:"camera.png",
        cameraP:"camera1.png",
        arrow:"arrow.gif",
        myplace:"myplace.png",
        lastmile:"lastmile.png",
    //    logosBase:imageLogosLoc,
        cross:"cross.png",
        load:"load.gif",
        sms:"sms.gif",
        email:"email.gif",
        ajaxLoader:"qrLoader.gif",//ajax-loader.gif",
        minZ:"handheld/minz.png",
        maxZ:"handheld/maxznew.png",
        mapZ:"handheld/mapznew.png",
        vidZ:"handheld/carnew.png",
        blankImg:"handheld/blanknew.png",
        spacer:"handheld/spacer.png",
        textdirs:{
          base:"textdirs/",
          start:"textdirs/start.png",
          straight:"textdirs/straight.png",
          left:"textdirs/left.png",
          right:"textdirs/right.png",
          uturn:"textdirs/uturn.png",
          stop:"textdirs/end.png"
        },
        textdirswap:{
          base:"wap/textdirs/",
          start:"textdirs/start.png",
          straight:"textdirs/straight.png",
          left:"textdirs/left.png",
          right:"textdirs/right.png",
          uturn:"textdirs/uturn.png",
          stop:"textdirs/end.png"
        },
        logo:"vidteq_Alpha.png",
        poi:"poi.gif",
        doi:"doi.gif",
        biasstops:"BIASStops.png",
        front:{
          left:"front/left.png",
          center:"front/center.png",
          right:"front/right.png"
        },
        viaBallMarkers:"viamarkers/"
      }
      ,themed:{
        close:"closeE.png", 
        swap:"swap.png",
        feedback_v:"feedback_v.png",
        feedback_h:"feedback_h.png",
        demo:"demo.png",
        lmrForLite:"click_here_for_video_directions.png",
        routePouch:"route_summary.png",
        proposed:"proposed.png",
        govid:"govid.png",
        comStrip:"com-strip.png",
        comStripBackground:"header_nav_bg.png",
        up:"up.gif",
        down:"down.gif",
        thumb:"thumb.gif",
        refBox:"refBox520x388p1.png",
        refBox2:"refBox520x388p2.png",
        refBox3:"refBox520x388p3.png",
        refBox8:"refBox520x388p8.png",
        man:"e-map/man/man.png",
        manRouted:"e-map/man/manRouted.png",
        landmark:"e-map/man/man_p.png",
        landmarkRouted:"e-map/man/manRouted_p.png",
        woman:"e-map/woman/woman.png",
        womanRouted:"e-map/woman/womanRouted.png",
        commit:"e-map/button/commit.png",
        mindtree_logWithAddrs:"e-map/button/mindtree_logWithAddrs.png",
        eMapSms:"e-map/button/sms.png",
        eMapEmail:"e-map/button/email.png",
        eMapPrint:"e-map/button/print.png",
        commitAll:"e-map/button/commit_all.png",
        eMapExcel:"e-map/button/excel.png",
        compliance:"e-map/button/compliance.png",
        eMapIExcel:"e-map/button/inheritedXl.png",
        sendAll:"e-map/button/sendAll.png",
        misReport:"e-map/button/misReport.png",
        updateEReport:"e-map/button/update_eReport.png",
        billing:"e-map/button/billing.png",
        newReport:"e-map/button/newReport.png",
        iRouteAll:"e-map/button/iRouteAll.png",
        admin10:"e-map/button/admin10.png",
        min:"e-map/button/minimize.png",
        eTester:"e-map/eTester.png",
        sendEmail:"e-map/button/sendEmail.png",
        sendSms:"e-map/button/sendSms.png",
        print:"e-map/print.png",
        printed:"e-map/printed.png",
        print_modified:"e-map/print_modified.png",
        preview:"e-map/button/preview.png",
        submit_s:"e-map/button/submit_s.png",
        trip:"e-map/button/trip.png",
        delete_icon:"e-map/delete_icon.gif",
        enter_icon:"e-map/enter_icon.gif",
        e_all:"e-map/e-all.png",
        e_all_a:"e-map/e-all_a.png",
        e_zone:"e-map/e-zone.png",
        e_zone_a:"e-map/e-zone_a.png",
        e_polygon:"e-map/e-polygon.png",
        e_polygon_a:"e-map/e-polygon_a.png",
        route:"e-map/route.png",
        route_a:"e-map/route_a.png",
        route_all:"e-map/route_all.png",
        setRules:"e-map/set_rules.png",
        setRules_a:"e-map/set_rules_a.png",
        route_all:"e-map/route_all.png",
        save_route:"e-map/save_route.png",
        saveRules:"e-map/save_rules.png",
        saveRules_a:"e-map/save_rules_a.png",
        select:"e-map/select.png",
        select_a:"e-map/select_a.png",
        landmarks:"e-map/landmarks.png",
        landmarks_a:"e-map/landmarks_a.png",
        e_min:"e-map/min.png",
        e_close:"e-map/close.png",
        e_mov:"e-map/mov.png",
        e_upload:"e-map/upload.png",
        e_summary:"e-map/summary.png",
        e_scheduler:"e-map/e-scheduler.png",
        e_car:"e-map/car.png",
        panic:"e-map/events_image/panic.png",
        speeding:"e-map/events_image/speeding.png",
        card:"e-map/events_image/card.png",
        //localityEnabled:"locality.gif",
        //localityDisabled:"locality_d.png",
        storesEnabled:"stores.png",
        storesDisabled:"stores_d.png",
        locaMarkers:[],
        storeMarkers:[],
        manMarkers:[],
        womanMarkers:[]
      }
      ,themedIf:{
        hasUrlid:{
          indiaproperty:{
            close:"close.png"
            ,cross:"cross.png"
            ,arrow:"arrow.gif"
            ,textdirs:{
              base:"textdirs/"
              ,start:"textdirs/start.png"
              ,straight:"textdirs/straight.png"
              ,left:"textdirs/left.png"
              ,right:"textdirs/right.png"
              ,uturn:"textdirs/uturn.png"
              ,stop:"textdirs/end.png"
            }
          }
        }
      }
      //,MSIE6:{
      //  path:"ie6/",
      //  logo:"vidteq_Alpha.jpg",
      //  poi:"poi.png",
      //  biasstops:"transparent20.png",
      //  doi:"doi.png",
      //  textdirs:{
      //    start_jpg:"textdirs/start.jpg",
      //    straight_jpg:"textdirs/straight.jpg",
      //    left_jpg:"textdirs/left.jpg",
      //    right_jpg:"textdirs/right.jpg",
      //    uturn_jpg:"textdirs/uturn.jpg",
      //    stop_jpg:"textdirs/end.jpg"
      //  },
      //  front:{
      //    left:"front/left.jpg",
      //    center:"front/center.jpg",
      //    right:"front/right.jpg"
      //  }
      //}
    }
    ,imgObj = imgObjType[ type ] || imgObjType
    ;
    return imgObj;
  }
  ,generateLocaMarkers:function(imgObjType) {
    for(var i=0;i<30;i++) {
      imgObjType.themed.locaMarkers[i]={
        div:"loca_markers/"+(i+1)+".png",
        map:"loca_markers/"+(i+1)+".png"
      }
    }
  }
  ,generateStoreMarkers:function(imgObjType) {
    for(var i=0;i<100;i++) {
      imgObjType.themed.storeMarkers[i]={
        div:"store_markers/"+(i+1)+".png",
        map:"store_markers/"+(i+1)+".png"
      }
    }
  }
  ,generateSerialMarkers:function(ptr,prefix,max) {
    for(var i=1;i<max;i++) {
      ptr[i] = {
        div:prefix+'/'+(i)+".png",
        map:prefix+'/'+(i)+".png"
      }
    }
  }
  ,generateThemedIfConditions:function(imgObjType,account,theme) {
    var themedIf = imgObjType.themedIf;
    for( var p in themedIf) {
      if( themedIf.hasOwnProperty(p) ) {
        if( account && theme!='none' && themedIf[p][account] ) {
          var themedIfHasUrlidItems = themedIf[p][account];
          for( var items in themedIfHasUrlidItems ) {
            if( themedIfHasUrlidItems.hasOwnProperty(items) ) {
              imgObjType.themed[items] = themedIfHasUrlidItems[items];
            }
          }
        }
      }
    }
  }
  ,isEmpty:function(obj) {
    for(var prop in obj) {
      if (prop == 0 && typeof(obj[prop]) == 'string') return true;
      if(obj.hasOwnProperty(prop)) return false; 
    }
    return true;
  }
  ,transferPath:function(count,target,refObj,path) {
    if (count > 3) return;
    count++;
    for (var i in refObj) { 
      //if (this.isEmpty(refObj[i])) {target[i] = path+refObj[i];}
      if (this.isEmpty(refObj[i])) {
        target[i] = path+refObj[i];
        if (!target[i].match(/\/$/)) { target[i]+='?r='+vidteq._rStr;}
      } else {
        target[i] = {};
        this.transferPath(count,target[i],refObj[i],path);
      }
    } 
  }
  ,generatePath:function(options) {
    if( this.generated ) return;
    options = options || {};
    var vidteq = options.vidteq
    ,_serverHostUrl = options._serverHostUrl
    ,scriptBased = ( typeof options.scriptBased !== "undefined"? options.scriptBased : vidteq.scriptBased )
    ,account = options.account || vidteq.account
    ,theme = options.theme || vidteq.theme
    ,gui = options.gui
    ,imgObjType = this.getImgObjType()
    ,path = (function() {
      var path = scriptBased? _serverHostUrl+"images/" : 
        vidteq.pathPre? vidteq.pathPre+'images/' :"images/";
      return path;
    })()
    ;
    this.generateLocaMarkers(imgObjType);
    this.generateStoreMarkers(imgObjType);  // TBD should is condition it with ls 
    this.generateSerialMarkers(imgObjType.themed.manMarkers,'e-map/man',40);
    this.generateSerialMarkers(imgObjType.themed.womanMarkers,'e-map/woman',40);
    
    this.nonThemedPath = path;
    this.transferPath(0,this,imgObjType.nonThemed,path);
    
    this.generateThemedIfConditions(imgObjType,account,theme);
    
    if( account && theme!='none') {
      path += "themes/"+theme+"/";
    }
    this.themedPath = path;
    
    if(typeof(OpenLayers)!='undefined') OpenLayers.ImgPath=path+"ol/";
    this.transferPath(0,this,imgObjType.themed,path);
    
    //if( self.navigator.userAgent.match(/MSIE\s[6]/) ) {
    //  path = path + "ie6/";
    //  this.transferPath(0,this,imgObjType.MSIE6,path);
    //}
    
    if(gui) {
      gui.theme = theme;
      gui.imgPath = this;
    }
    this.generated = true;
    return this;
  }
};
