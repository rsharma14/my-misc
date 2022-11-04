/*
 * Production javascript
 *
 * Copyright (c) 2008 Vidteq India Pvt Ltd
 * and GPL (GPL-LICENSE.txt) licenses.MSI
 *

 * $Date: 2015/05/08 07:19:14 $
 * $Date: 2015/05/08 07:19:14 $

 * $Rev: $
 */
if (typeof(vidteq) == 'undefined') { vidteq = {}; }

vidteq.fvt = function (gui,options) {
  options = options || {};
  this.gui = gui;
  this.firstLoad = true;
  this.swfAwake = null; // TBD check
  this.playerActive = false;
  this.globalTextIndex = -1;
  this.swfMouseRelease = false;
  this.swfMouseOut = false;
  this.theScroll = [];  
  this.noOfTextDirections = 0;
  this.expaCollapse = false;	
  this.expaCollapseGate = true;	
  this.hiding = false;
  this.showing = false;
  this.ids = {
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
  };
  var that = this;
  this.fvtScrollOptions = {
    prefix:"theThumb"
    ,jumpIndex:0
    ,res:32
    ,left:true
    ,right:true
    ,activeTheme:'classic'
    ,theme:{
      classic:{
         sW:15
        ,sH:15
        ,sN:0
        ,tH:0
        ,dArry:['up','down','thumb','bigbar']
      }
      ,sleek:{
         sW:9
        ,sH:9
        ,sN:0
        ,tH:(180-9)
        ,dArry:['up','down','thumb','bigbar']
      }
      ,ultra:{
         sW:7
        ,sH:0
        ,sN:0
        ,tH:(180)
        //,delta:2
        ,dArry:['thumb','bigbar']
        ,classes:{
          thumb:'thumb-big'
        }
      }
      ,niceScroll:{
         sW:7
        ,sH:0
        ,sN:0
        ,tH:(180)                       
      }
    }
    ,bigbarOnClick:function(index) {
      $('#bigbar'+index).click(that.handleBarClick);
    }
    ,jumpToIndex:true
    ,getTheRatio:function(thumb,t) {
      var maxY = thumb.maxY
      ,minY = thumb.minY
      ,ratio = t.scrollH/( maxY - minY )
      ;
      t.theRatio = ratio;
      return ratio;
    }
  };
  $.extend(this.fvtScrollOptions, options.fvtScrollOptions || {} );
  //$.extend(this, options );
  $.extend(this.ids, this.gui.fvtui );
  this._setPreInitConditions();
}

vidteq.fvt.prototype._setPreInitConditions = function() {
  this.dom = this.ids.fvtDiv;
  this.videoDom = this.ids.videoPlayerDiv;
  if( this.gui.draggableVideo  && this.gui.resizableVideo ) {
    var el_map = $("#map");
    if( el_map ) {
      var detachedVideoDom = $("#"+this.videoDom).detach();
      //TBD: Is it safe: $("#map").parent()
      el_map.parent().prepend(detachedVideoDom);
      this.ids.animateOn = this.ids.fvtDiv;
    }
  }
  this.childDom = {
    'route':[this.ids.animateOn,'routediv']
    ,'routeDetached':['routediv']
    ,'srf':['locadiv']
  };
  if(this.gui.wap) { this.videoSwf = 'VideoPlaylist'; }
  else { this.videoSwf = vidteq._serverHostUrl+'VideoPlaylistWap'; }
  this.detach = false;
  if(this.gui.is3dmap){
    //this.videoSwf = 'VidteqPlayer/VideoPlaylistWide';
    this.videoSwf = vidteq._serverHostUrl+'VideoPlaylistWap';
    $('#'+this.videoDom).wrap("<div id=videoPopup />");
    $('#'+this.videoDom).css({width:200,height:176});
    $('#videoPopup').wrap("<div id='videoPopupContainerMine' style='display:block;position:absolute;left:940px;top:10px;padding-left:10px;padding-right:10px;width:200px;height:200px;padding-bottom:10px;background-color:#572d5c;border: 1px solid #764e7a;'/>");
    $('#videoPopupContainerMine').draggable({ handle: '#dragMe' });
    $('#videoPopupContainerMine').prepend("<div id='dragMe'  style='display:block;background-color:transparent;'><span id='topText'><b><i>Route Video</i></b></span><img id='minV' align='right' src='"+vidteq.imgPath.minV+"' /></div>");
    //$('#map').prepend("<img align='right' id='maxV' src='"+vidteq.imgPath.maxV+"' />");
    $('#body').prepend("<div style='position:absolute;right:100px;top:10px;width:24px;height:24px;z-index:400000;cursor:pointer;' id='maxV' ><img style='text-align:right;' src='"+vidteq.imgPath.maxV+"' /></div>");
    $('#maxV').click(function() {
        $('#maxV').fadeOut(1000);
        $('#maxV').hide();
        var l = $(this).data('left');
        var t = $(this).data('top');
        $('#videoPopupContainerMine').animate({
           width: 'toggle',
           height: 'toggle',
           left: '-='+l+'px',
           top : '+='+t+'px'
         },3000, function() {
        });
     });
    $('#maxV').hide();
    $('#videoPopupContainerMine').hide();
    this.detach = false;
  }
    
  if (typeof(options) != 'undefined' && options.detach) { this.detach = true; }
  if (typeof(options) != 'undefined' && options.clearFvtContent) { this.clearFvtContent = options.clearFvtContent; }
  if (this.detach) {
    this.videoSwf = vidteq._serverHostUrl+'VideoPlaylistWide';
    //this.videoSwf = vidteq._serverHostUrl+'VideoPlaylistWap';
    $('#'+this.videoDom).wrap("<div id=videoPopup />");
    $('#videoPopup').wrap("<div id='videoPopupContainerMine' style='display:block;position:absolute;padding-left:10px;padding-right:10px;;padding-bottom:10px;background-color:"+vidteq.vidteq.topStripColor+";'/>");
    $('#videoPopupContainerMine').draggable({ handle: '#dragMe' });
    $('#videoPopupContainerMine').prepend("<div id='dragMe'  style='display:block;background-color:transparent;'><img align='left' src='"+vidteq.imgPath.draV+"' /><span id='topText'><b><i>Route Video</i></b></span><img id='minV' align='right' src='"+vidteq.imgPath.minV+"' /></div>");
    //$('#map').prepend("<img align='right' id='maxV' src='"+vidteq.imgPath.maxV+"' />");
    $('#body').prepend("<div style='position:absolute;right:0px;top:29px;width:24px;height:24px;z-index:400000;cursor:pointer;' id='maxV' ><img style='text-align:right;' src='"+vidteq.imgPath.maxV+"' /></div>");
    $('#maxV').click(function() {
        $('#maxV').fadeOut(1000);
        $('#maxV').hide();
        var l = $(this).data('left');
        var t = $(this).data('top');
        $('#videoPopupContainerMine').animate({
           width: 'toggle',
           height: 'toggle',
           left: '-='+l+'px',
           top : '+='+t+'px'
         },3000, function() {
        });
     });
    $('#maxV').hide();
    $('#videoPopupContainerMine').hide();
  }
  this.mode = 'srf';
  this.scheduledMode = null;
}

vidteq.fvt.prototype.matchMapHeight = function() {
  ////$('#locadiv')[0].style.height=$('#dynamicDiv')[0].style.height=parseInt($('#map')[0].style.height)+"px";;
  //$('#'+this.childDom['srf'][0]).css('height',$('#map').height());
  //if(typeof(__experimentalUI)!='undefined' && __experimentalUI) {
  //  $('#directions_div').css('height',($('#map').height()-parseInt(ioAreaObj.embed.vidHeight)-80)+'px');
  //} else {
  //  $('#directions_div').css('height',($('#map').height()-parseInt(ioAreaObj.embed.vidHeight)-26)+'px');
  //}
  //  //$('#locadiv')[0].style.height=parseInt($('#locadiv')[0].style.height)-20+"px";
  // // TBD
  // II attempt
  //$('#locadiv')[0].style.height=$('#dynamicDiv')[0].style.height=parseInt($('#map')[0].style.height)+"px";;
  
  //TBD: Can we make it use dynamic id for map DOM?
  var dirDivHeight
  ,mapHeight = $('#map').height()
  ,gui = this.gui || {}
  ,sideBarUI = gui.sideBarUI
  ,topBarUI = gui.topBarUI
  ,comtabTopBarUI = gui.comtabTopBarUI
  ,comtabNoDisplay = gui.comtabNoDisplay
  //,vidHeight = $("#"+this.videoDom).height()
  //,vidHeight = parseInt($("#"+this.videoDom).css('height'))
  ,vidHeight = parseInt(gui.embed.vidHeight)
  ;
  
  if( gui.draggableVideo  && gui.resizableVideo ) {
    var isVideoWithinFvtDiv = $("#"+this.dom).find("#"+this.videoDom);
    if( !isVideoWithinFvtDiv.length > 0 ) {
      vidHeight = 16;
    }
  }
  if( sideBarUI ) {
    mapHeight -= 60;
    if( self.navigator.userAgent.match(/MSIE\s[7]/) ) {
      mapHeight = document.documentElement.clientHeight - 60;   
    }
  } // TBD some inconsistency
  if( topBarUI || sideBarUI ) {
    $('#'+this.childDom['srf'][0]).css('height',mapHeight);
    dirDivHeight = mapHeight - vidHeight - 80;
    if(this.detach) {
      dirDivHeight = mapHeight - 80;
    }
  }else {
    if( $('#locadiv')[0] ) {
      $('#locadiv')[0].style.height = mapHeight+"px";  
    }
    dirDivHeight = mapHeight - vidHeight - 26;
    if( comtabNoDisplay || comtabTopBarUI ) {
      dirDivHeight += 26;  
    }
    if( !comtabTopBarUI && self.navigator.userAgent.match(/MSIE\s[7]/) ){
      dirDivHeight -= 6;
    }
  }
  //TBD: conditional
  //dirDivHeight -= 20;
  $('#directions_div').css('height',dirDivHeight+'px');
  this.adjustDirDiv();
  //$('#locadiv')[0].style.height=parseInt($('#locadiv')[0].style.height)-20+"px";
  // TBD
}

vidteq.fvt.prototype.hideNew = function (inMode) {
  var mode = this.mode;
  if (typeof(inMode) != 'undefined' && typeof(this.childDom[inMode]) != 'undefined') { mode = inMode; }
  if ( mode != this.mode ) { return; }
  if ($('#'+this.dom).is(':hidden') || this.hiding) { return; }
  this.hiding = true;
  if (this.gui.sideBarUI) {
    //$('#body').find('div[id^=ascrail]').each(function () {
    //  $(this).remove(); 
    //});
  }
  var modeDoms = this.childDom[mode]; 
  if (this.detach && mode == 'route') modeDoms = this.childDom['routeDetached'];
  var refWidth = parseInt($('#'+modeDoms[0]).css('width'));
  var refLeft = $(vidteq.mboxObj.map.layerContainerDiv).css('left');
  for( var i in modeDoms ) { 
    if (i==0) { continue; }
    $('#'+modeDoms[i]).hide(); 
  }
  if(this.gui.sideBarUI) $('#directions_div').hide();
  var trickleUp = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
  if(this.gui.appMode) { trickleUp = true; }
  var that = this;
  $('#'+modeDoms[0]).animate({width:0},{
    duration:2000
    ,step:function () { 
      var curWidth = $(this).width();
      if(trickleUp) { $('#'+that.dom).width(curWidth); }
      var curLeft = parseInt(refLeft) + parseInt((parseInt(refWidth) - parseInt(curWidth))/2);
      if(that.gui.sideBarUI) {
        $('#fvtContainer').width(curWidth);
      }else {
        $(vidteq.mboxObj.map.layerContainerDiv).css('left',curLeft+'px');
      }
    } 
    ,complete:function() {
      if(trickleUp) { $('#'+that.dom).width(0); }
      $('#'+that.dom).hide();
      $('#'+modeDoms[0]).width(refWidth);
      if(that.gui.sideBarUI) {
        $('#fvtContainer').hide(); 
      }
      //if (trickleUp) { $('#'+that.dom).width(refWidth); }
      //$('#divider').hide();
      vidteq.mboxObj.map.updateSize();
      that.hiding = false;
      if(that.scheduledMode != null) {
        var newMode = that.scheduledMode;
        that.scheduledMode = null;
        that.showNew(newMode); 
      }
      // out of context TBD
      //ioAreaObj.embed.mapShrinked = false; 
      //ioAreaObj.showFixedEnd();
    }
  });
}

vidteq.fvt.prototype.showNew = function (inMode) {
  var mode = this.mode;
  var fvtid = this.dom;
  if (this.gui.comtabTopBarUI) {
    $('#'+fvtid).addClass('fvtdiv-comtabTopBarUI');
  }
  if (this.gui.comtabNoDisplay) {
    $('#'+fvtid).addClass('fvtdiv-nodisplay');
  }
  if ((this.gui.handheld || this.gui.openScale) && inMode!='route') { return; } // In handheld we use new show function
  if (this.gui.sideBarUI) {
    if (self.navigator.userAgent.match(/MSIE\s[7]/)){ 
      $('#fvtContainer').css({height:document.documentElement.clientHeight});
    }
    if (inMode == 'route') {
      $('#body').find('div[id^=ascrail]').each(function () {
        $(this).hide();
      });
      $('#fvtContainer').css({width:'510px'});
      $('#'+fvtid).css({width:'auto',background:'transparent'});
      $('#fvtContainerLabel').html('<h2>Video Directions</h2>');
      this.gui.selectInTopPanel('div_driving-dir-video-link');
      var fvtTWidth = 510;
    } else { 
      $('#fvtContainer').css({width:'340px'});
      $('#'+fvtid).css({width:'320px',background:'transparent'});
      $('#fvtContainerLabel').html('<h2>Explore Area</h2>');
      $('#body').find('div[id^=ascrail]').each(function () {
        $(this).show();
      });
      var fvtTWidth = 340;
    }
    //$('#body').find('div[id^=ascrail]').each(function () {
    //  $(this).remove(); 
    //});
  }
  if(this.gui.appMode) {
    if (inMode == 'route') {
      this.mode = inMode; 
      if(!this.gui.openScale)this.hideNew();
      setTimeout(function(){StageWebViewBridge.call('launchExpandVideoPort', null, 2000);},500);
      return;
    }
    StageWebViewBridge.call('launchCollapseVideoPort', null, 2000);
    $("#fvtDisplay").css({display:'block'}); 
  }
  if (typeof(inMode) != 'undefined' && typeof(this.childDom[inMode]) != 'undefined') { mode = inMode; }
  var startWidth = 0;
  if ( mode == this.mode ) {
    if ($('#'+this.dom).is(':visible') || this.showing ) { return; }
    // go animate
  } else { // not equal 
    if ( this.showing || this.hiding ) { 
      this.scheduledMode = mode;
      return;
    } else if ($('#'+this.dom).is(':visible')) {
      var modeDoms = this.childDom[this.mode]; 
      var startWidth = parseInt($('#'+modeDoms[0]).css('width'));
    }
  }
  if(this.gui.sideBarUI) $('#directions_div').hide();
  this.matchMapHeight();
  this.showing = true;
  this.mode = mode;
  var modeDoms = this.childDom[mode]; 
  if (this.detach && mode == 'route') modeDoms = this.childDom['routeDetached']; 
  var refWidth = parseInt($('#'+modeDoms[0]).css('width'));
  $('#'+modeDoms[0]).css('width',startWidth+'px');
  for (var m in this.childDom) {
    var c = this.childDom[m];
    for (var d in c) {
      if (m == mode) { $('#'+c[d]).show(); } 
      else { $('#'+c[d]).hide(); }
    }
  }
  
  $('#'+this.dom).show();
  if (refWidth == startWidth) { 
    this.showing = false;
    return;
  }
  var refLeft = $(vidteq.mboxObj.map.layerContainerDiv).css('left');
  for (var i in modeDoms) { 
    if (i==0) { continue; } 
    $('#'+modeDoms[i]).hide(); 
  }
  var trickleUp = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
  if(this.gui.appMode) { trickleUp = true; }
  if (this.gui.sideBarUI) {
    $('#fvtContainer').show();
    if(mode != 'route') { refWidth = 364; }
  }
  var that = this;
  $('#'+modeDoms[0]).animate({width:refWidth}, { 
    duration:2000
    ,step:function() { 
      var curWidth = $(this).width();
      if (trickleUp) { $('#'+that.dom).width(curWidth); }
      var curLeft = -parseInt(parseInt(curWidth)/2);
      //$('#'+that.dom).width(curWidth);
      if(that.gui.sideBarUI) {
        if(mode != 'route' && curWidth <= fvtTWidth) { 
          $('#fvtContainer').width(curWidth); 
        } else if(mode != 'srf'){
          var w = curWidth + 30;
          $('#fvtContainer').width(w + 'px'); 
        }
      } else {
        $(vidteq.mboxObj.map.layerContainerDiv).css('left',curLeft+'px');
      }
      //console.log("cur width is "+curWidth);
      //console.log("cur width is "+$(vidteq.mboxObj.map.layerContainerDiv).length);
    }, 
    complete : function () {
      $('#divider').show();
      for (var i in modeDoms) {
        if (i==0) { continue; } 
        $('#'+modeDoms[i]).show();
        if(!that.gui.sideBarUI && mode == 'route') {
          $('#'+modeDoms[i]).height( $('#'+modeDoms[i]).height() - 6 ); 
        }
      }
      if(that.gui.sideBarUI && mode == 'route') $('#directions_div').show();
      if (trickleUp) { $('#'+that.dom).width(refWidth); }
      vidteq.mboxObj.map.updateSize(); 
      //console.log("update size and redraw called ");
      vidteq.mboxObj.route.redraw();
      //if(that.gui.appMode) { 
      //  StageWebViewBridge.call('launchCollapseVideoPort', null, 2000);
      //}
      //console.log("size of map now is ");
      //console.log(vidteq.mboxObj.map.getSize());
      //console.log("size of route is ");
      //console.log(vidteq.mboxObj.route.renderer.size);
      //vidteq.mboxObj.route.renderer.setSize(vidteq.mboxObj.map.getSize());
      //console.log("size of route is ");
      //console.log(vidteq.mboxObj.route.renderer.size);
      //console.log("data extent is ");
      //console.log(vidteq.mboxObj.route.getDataExtent());
      //console.log(vidteq.mboxObj.route.renderer);
      
      if (that.gui.sideBarUI) {
        $('#fvtContainer').width(fvtTWidth); 
        that.gui.mbox.offsetPanZoomBar($('#fvtContainer').width());
        that.gui.curtainLoaderHide();
      }
      that.showing = false;
      if(that.scheduledMode != null) {
        var newMode = that.scheduledMode;
        that.scheduledMode = null;
        that.showNew(newMode); 
      }
    }
  });
}

vidteq.fvt.prototype.show = function () {
  if ($('#dynamicDiv').is(':visible') || this.showing ) { return; }
  this.showing = true;
  var refWidth = $('#dynamicDiv').width();
  $('#dynamicDiv').width('0px');
  $('#dynamicDiv').show();
  var refLeft = $(vidteq.mboxObj.map.layerContainerDiv).css('left');

  var that = this;
  $('#dynamicDiv').animate({width:refWidth}, { 
    duration : 2000,
    step : function () { 
      var curWidth = $('#dynamicDiv').width();
      var curLeft = -parseInt(parseInt(curWidth)/2);
      $(vidteq.mboxObj.map.layerContainerDiv).css('left',curLeft+'px');
    }, 
    complete : function () {
      $('#divider').show();
      that.showing = false;
      ioAreaObj.embed.mapShrinked = true; 
    }
  });
}

vidteq.fvt.prototype.showLorR = function(which) {
  if (this.gui.embed) {
    var mode = 'route';
    if (which == 'L') { mode = 'srf'; }
    this.dom = 'dynamicDiv';
    this.showNew(mode);
  } else {
    this.show(mode);
  }
  if(which == 'L') {
    document.getElementById('routediv').style.display='none';
    document.getElementById('locadiv').style.display='block';
    document.getElementById('VideoPlayerDiv').style.display='none';
    $('#VideoPlayerDiv')[0].style.display='none'; // TBD why ?
    document.getElementById(this.videoDom).innerHTML = '';
    $('#routedetails')[0].innerHTML="";
    ioAreaObj.toggleButtons({"mapexpand":false});
  } else if(which =='R') {
    document.getElementById('routediv').style.display='block';
    document.getElementById('locadiv').style.display='none';
    document.getElementById('VideoPlayerDiv').style.display='block';
    //if(ioAreaObj.embed && ioAreaObj.embed.blocate) ioAreaObj.toggleButtons({"locality":true});
    //if(ioAreaObj.embed && ioAreaObj.embed.locateStores) ioAreaObj.toggleButtons({"stores":true});
    //ioAreaObj.toggleButtons({"mapexpand":true});
  }	
}

vidteq.fvt.prototype.writeCategory = function(catList) {
  var width=0.75*parseInt(this.gui.embed.vidWidth)-10+"px"
  var categoryDropDown=""; 
  categoryDropDown+="<div style='background-color:inherit;padding-bottom:1px;'><a id='selectcategoryhelptxt' style='font-weight:bold' class=profileFont>Click below to select different category</a></div>";
  categoryDropDown+="<select onchange='ioAreaObj.invokeBizSearch(null,{categoryList:this.options[this.selectedIndex].value});' class='bizcatdropdown' id='bizCatDropDown'>";
  for(var i in catList) {
    if (typeof(catList[0]) != 'undefined') {
      if (typeof(catList[0].name) == 'undefined') {
        var id=catList[i].replace(/\s+/,"_");	
        categoryDropDown+="<option id='"+id+"' value='"+catList[i]+"' >"+catList[i]+"</option>";
      } else {
        var id=catList[i].name.replace(/\s+/g,"_");
        categoryDropDown+="<option id='"+id+"' value='"+catList[i].categoryList+"' >"+catList[i].name+"</option>";
      }
    } else {
      var id=i.replace(/\s+/g,"_");
      categoryDropDown+="<option id='"+id+"' value='"+catList[i]+"' >"+i+"</option>";
    }
  }
  categoryDropDown+="</select>";
  $('#categories')[0].style.display='block';
  $('#categories')[0].innerHTML=categoryDropDown;
  setInterval(function () { ioAreaObj.colorChanger('selectcategoryhelptxt'); },2000);
}

vidteq.fvt.prototype.prepareForShowSrf = function(srfResponse) {
  if (typeof(srfResponse.vid) != 'undefined') return;
  if(this.gui.topBarUI || this.gui.sideBarUI || this.gui.handheld) {
    this.showNew('srf');
  } else if (this.gui.embed && (this.gui.embed.locateStores || this.gui.embed.wayfinder)) {
    this.showNew('srf');
  } else {
    this.showLorR('L');
  }
  var tempHTML ="";
  if (this.gui.sideBarUI) {
    tempHTML+="<div style='padding-left:0px;padding-right:18px;padding-bottom:10px;color:white;overflow:auto;'><b class='pb4f'></b><b class='pb3f'></b><b class='pb2f'></b><b class='pb1f'></b><div id='statusContainer' style='background-color: #0E0E0E; width: 89%; padding-top: 6px; padding-bottom: 6px;'><a onfocus='this.blur();' class='simple' style='color: #A88026;margin: 10px;'>"
    tempHTML+=this.getStatusHtml(srfResponse.srf[0]);
    tempHTML+="</a></div><b class='pb4f'></b><b class='pb3f'></b><b class='pb2f'></b><b class='pb1f'></b>";
    //tempHTML+="<div id=wrapper><div id=scroller >";
    tempHTML+="<div id='locaresults0'>";
  } else {
    tempHTML+="<div style='padding-left:10px;padding-right:10px;padding-bottom:10px;color:white;overflow:auto;'><a onfocus='this.blur();' class='simple' >"
    tempHTML+=this.getStatusHtml(srfResponse.srf[0]);
    tempHTML+="</a><br/><div id='locaresults0'>";
  }
  srfResponse.srf[0].domName = 'locaresults0';
  tempHTML+="</div>";
  if (this.gui.sideBarUI) {
    tempHTML+='</div>';
  }
  tempHTML+="</div>";
  if (typeof(srfResponse.srf[1]) != 'undefined') {
    if(this.gui.sideBarUI) {
      tempHTML+="<div style='padding-left:0px;padding-right:18px;padding-bottom:10px;color:white;overflow:auto;'><a onfocus='this.blur();' class='simple' ><div style='background-color: #0E0E0E; width: 89%; padding-top: 6px; padding-bottom: 6px;'><a onfocus='this.blur();' class='simple' style='color: #A88026;margin: 10px;'>"
      tempHTML+=this.getStatusHtml(srfResponse.srf[1]);
      tempHTML+="</a></div>";
    } else {
      tempHTML+="<div style='padding:10px;color:white;overflow:auto;'><a onfocus='this.blur();' class='simple' >"
      tempHTML+=this.getStatusHtml(srfResponse.srf[1]);
    }
    tempHTML+="</a><br/><div id='locaresults1'>";
    srfResponse.srf[1].domName = 'locaresults1';
    tempHTML+="</div></div>";
  }
  //var result = TrimPath.processDOMTemplate("locadiv_stuff", data);
  document.getElementById('locadivinside').innerHTML=tempHTML;
  if (this.gui.sideBarUI) {
    var resultHeight = parseInt($('#locadiv').height() - 20)+'px';
    $('#locadivinside').css({height:resultHeight,overflow:'hidden'});
    //$('#body').find('div[id^=ascrail]').each(function () {
    //  $(this).remove(); 
    //});
    if (!self.navigator.userAgent.match(/MSIE\s[7,8]/)){
      $("#locadivinside").niceScroll({
        cursorwidth:"7px",cursorfixedheight: 22,
        autohidemode:false,cursorborderradius:'0',cursorborder:'0',
        background:'#A87C2C'
      });  
    } else {
      $('#locadivinside').css({overflow:'auto'});
    }
    /*$('#body').find('div[id^=ascrail]').each(function () {
      $(this).css({left:'300px'}); 
    });*/
  }
  //if(vidteq.aD.urlId == 'Prestige_Test') {
  //  this.gui.locaDivScroll = new iScroll('wrapper');
  //}
  if(this.gui.multiFrontPage && 
      typeof(this.gui.embed) != 'undefined' && 
      typeof(this.gui.embed.blocate) != 'undefined') {
    if (this.gui.sideBarUI) {
      if(srfResponse.responseType != 'ms') {
        $('#statusContainer').append('<a href="javascript:void(0);" id="multiBack" style="position:relative;right:6px;float:right;"><img src="'+vidteq.imgPath.multiBackEMin+'" style="border:0px"></a>');
      }
    } else {
      $('#locadivinside').append('<a href="javascript:void(0);" id="multiBack" style="position:absolute;top:3px;right:3px;"><img src="'+vidteq.imgPath.multiBack+'" style="border:0px"></a>');
    }
    var that = this;
    $('#multiBack').click(function () {
      that.gui.multiNBBack();
    });
  }
  this.populateShowSets(srfResponse);
}

vidteq.fvt.prototype.populateShowSetInSrf = function(srf,perSet) {
  srf.showSets = [];
  srf.curShowSet = 0;
  if (srf.results.length == 0) return; 
  for (var i=1;i<=srf.results.length;i+=perSet) {
    srf.showSets.push({'from':i,
      'to' : (i+perSet-1<srf.results.length?(i+perSet-1):srf.results.length)});
  } 
}

vidteq.fvt.prototype.populateShowSets = function(srfResponse) {
  var setLen = 10;
  if('undefined' != typeof(vidteq.aD) && vidteq.aD.q == 'locatestores' && srfResponse.responseType == 'locateStores'){
    setLen = srfResponse.srf[0].results.length;
  }
  if (srfResponse.srf.length == 2) {
    if (srfResponse.srf[0].results.length + srfResponse.srf[1].results.length <= setLen) {
      this.populateShowSetInSrf(srfResponse.srf[0],setLen);
      this.populateShowSetInSrf(srfResponse.srf[1],setLen);
    } else {
      setLen = 5;
      this.populateShowSetInSrf(srfResponse.srf[0],setLen);
      this.populateShowSetInSrf(srfResponse.srf[1],setLen);
    }
  } else { // single case
    this.populateShowSetInSrf(srfResponse.srf[0],setLen);
  }
}

vidteq.fvt.prototype.getStatusHtml = function(srf) {
  var noOfHits = srf.results.length;
  var data = this.getStartEndData(srf); 
  try {$('#categories')[0].style.display='none';} catch (e) {}	
  switch(srf.srfType) {
    case "location" :
    case "startAddress" :
    case "endAddress" :
      if(typeof(srf.results[0])!='undefined') data.topRelevance=srf.results[0].relevance;
      data.noOfHits = noOfHits; 
      var tempCounter=(noOfHits!=1)?("<b style='font-size:1.2em'>"+noOfHits+"</b>"+" matches"):(" exactly one match");
      var tempCounterApprox=(noOfHits!=1)?("<b style='font-size:1.2em'>"+noOfHits+"</b>"+" matches."):(" one match.");
      var mesg; 
      mesg="Your "+data.sORe;
      if (data.startOrEnd != '') {
        mesg+=" (<b style='font-size:1.2em'>"+data.startOrEnd+"</b>) resulted in "+tempCounter;
      }
      mesg+=".";
      if(parseInt(srf.categoryMatches)) {
          mesg+=" Check out <span onclick=javascript:ioAreaObj.categorySearchInvoke(); style=cursor:pointer;text-decoration:underline; >category</span> matches ";
      }
      if(srf.reqSeed!='undefined' && noOfHits == 0 && (this.gui.handheld || this.openSale)){
        $('#matchResultsCont').html('');
        html='Sorry, There were no matched results for this query';
        $('#matchResultsCont').html(html);
        if(gui.openScale) this.showPartialMatches(); else window.location.hash='matchResults';
      }
      /*if(typeof(srf.results[0])!='undefined' && 
         typeof(srf.results[0].relevance) != 'undefined' && 
         srf.results[0].relevance==0) {
        mesg="Your "+srf.parentType+" search for <b style='font-size:1.2em'>"+data.startOrEnd+"</b> failed to get an exact match. It gave approximate "+tempCounterApprox;
      }*/
      //if(vidteq.flink && vidteq.flink.ll==1) {mesg="";}
      if (noOfHits && srf.results[0].type == 'center') {mesg = "Your "+data.sORe;}
      break;
    case "locateStores":
      //var place=(typeof(ioAreaObj.embed)!='undefined' && 
      //           typeof(ioAreaObj.embed.place)!='undefined')?ioAreaObj.embed.place.address.name:' center of Bangalore';
      //mesg="<b style='font-size:1.2em'>   Found "+noOfHits+" Stores Nearby. Please select one of them. </b>";
      //mesg="<b style='font-size:1.2em'>   Found "+noOfHits+" Stores Near \"<span id=locadiv_your_loc >"+srf.myLoc.address.name+"</span>\". Please select one of them. </b>";
      mesg="<b style='font-size:1.2em'>   Found "+noOfHits+" "+(noOfHits>1?this.gui.embed.locateStores.storesName:this.gui.embed.locateStores.storeName)+". Please select one of them. </b>";
      // TBD href for youre location
      if(this.gui.mode=='ROUTE') this.gui.displayMessage('Nearest store is selected. Press GO VID to get a route');
      // TBD it does not belong here
      break;
    case "blocate":
      $('#categories')[0].style.display='block';
      if(noOfHits) {
        mesg='';
        if (this.gui.sideBarUI || this.gui.topBarUI) {
          if (this.gui.embed.blocate.lastSearchCategory && this.gui.embed.blocate.lastSearchCategory != '') {
            if (this.gui.sideBarUI) {
              mesg=this.gui.embed.blocate.lastSearchCategory;
            }
            if (this.gui.topBarUI) {
              mesg="&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Nearby <b style='font-size:1.2em'>"+ this.gui.embed.blocate.lastSearchCategory+"</b> are ..";
            }
          }
        }
      } else {mesg=' No results found'}
      break;
    default:
      break;
  }
  return mesg;
}

vidteq.fvt.prototype.writeStatusNew = function(srf) {
  var noOfHits = srf.results.length;
  //var data = this.getStartEndObj(srf.parentType); 
  var data = this.getStartEndObj(srf); 
  try {$('#categories')[0].style.display='none';} catch (e) {}	
  switch(srf.parentType) {
    case "location" :
    case "startAddress" :
    case "endAddress" :
      if(typeof(srf.results[0])!='undefined') data.topRelevance=srf.results[0].relevance;
      data.noOfHits = noOfHits; 
      var tempCounter=(noOfHits!=1)?("<b style='font-size:1.2em'>"+noOfHits+"</b>"+" matches"):(" exactly one match");
      var tempCounterApprox=(noOfHits!=1)?("<b style='font-size:1.2em'>"+noOfHits+"</b>"+" matches."):(" one match.");
      var mesg; 
      mesg="Your "+data.sORe;
      if (data.startOrEnd != '') {
        mesg+=" (<b style='font-size:1.2em'>"+data.startOrEnd+"</b>) resulted in "+tempCounter;
      }
      mesg+=".";
      /*if(typeof(srf.results[0])!='undefined' && 
         typeof(srf.results[0].relevance) != 'undefined' && 
         srf.results[0].relevance==0) {
        mesg="Your "+srf.parentType+" search for <b style='font-size:1.2em'>"+data.startOrEnd+"</b> failed to get an exact match. It gave approximate "+tempCounterApprox;
      }*/
      //if(vidteq.vidteq.flink && vidteq.vidteq.flink.ll==1) {mesg="";}
      if (noOfHits && srf.results[0].type == 'center') {mesg = "Your "+data.sORe;}
      break;
    case "locateStores":
      var place=(typeof(this.gui.embed)!='undefined' && 
                 typeof(this.gui.embed.place)!='undefined')?this.gui.embed.place.address.name:' center of Bangalore';
      mesg="Found "+noOfHits+" Stores nearby, please select one of these ";
      if(this.gui.mode=='ROUTE') this.gui.displayMessage('Nearest store is selected. Press GO VID to get a route');
      // TBD it does not belong here
      break;
    case "blocate":
      $('#categories')[0].style.display='block';
      if(noOfHits) {mesg='';}
      else {mesg=' No results found'}
      break;
    default:
      break;
  }
  return mesg;
}

vidteq.fvt.prototype.showFvtMoreOrLess = function (idNo,flag) {
  if(vidteq.gui.handheld || vidteq.gui.openScale)
    // TBD context change
    $('#showMoreOrLess'+idNo).html((flag==0)?'<img src="'+vidteq.imgPath.minZ+'" >':'<img src="'+vidteq.imgPath.maxZ+'">');
  else
    $('#showMoreOrLess'+idNo).html((flag==0)?'Less <<':'More >>');
  if(flag) $('#showMoreDiv'+idNo).hide();
  else $('#showMoreDiv'+idNo).show();
  var flag=(flag==0)?1:0;
  $('#showMoreOrLess'+idNo).attr('onclick',null);
  $('#showMoreOrLess'+idNo).unbind('click');
  $('#showMoreOrLess'+idNo).click(function () { vidteq.fvtObj.showFvtMoreOrLess(idNo,flag)});
}

vidteq.fvt.prototype.writeSrfToTable = function(srf) {
  if (typeof(srf.showSets[srf.curShowSet]) == 'undefined') return;
  var tblName = srf.domName+"_tbl";
  $('#'+srf.domName).html("<table id="+tblName+" style='padding:0px;' cellpadding=1 cellspacing=1 width=90% ></table>");
  var spacer = "<tr colspan=2><td></td><td><hr/><td/></tr>";
  if (this.gui.sideBarUI) { } else {
    $('#'+tblName).append(spacer); 
  }
 
  var dsc_funcList = {};
  if (this.gui.handheld || this.gui.openScale) {
    var dsc_content='';
    var row_content='';
    var color='';
    if ((srf.srfType=='startAddress'|| srf.srfType=='endAddress') && srf.myLoc.type=='rcm') {
      var html='';
      var results=[];
      var funcList = {};
      for(var i=srf.showSets[srf.curShowSet].from;i<=srf.showSets[srf.curShowSet].to;i++) {
        results[i]=(new vidteq._poi(srf.results[i-1],this.gui)).getResultsForHandheld();
        html += results[i].html;
      }
      $('#matchResultsCont').html('');
      $('#matchResultsCont').html(html);
      for(var i=srf.showSets[srf.curShowSet].from;i<=srf.showSets[srf.curShowSet].to;i++) {
        for (var f in results[i].funcObj.funcList) { 
          $('#'+f).click(results[i].funcObj.funcList[f]); 
        }
      }
      if(this.gui.openScale) this.showPartialMatches(); else window.location.hash='matchResults';
      return;
    }

    if(this.gui.openScale && this.gui.handheld) {
      dsc_content="<div class='screen_header'><span class='iphoneBack' id='dscBack'>&#10150;</span><center>Nearby Places</center></div>";
    }
    for(var i=srf.showSets[srf.curShowSet].from;i<=srf.showSets[srf.curShowSet].to;i++) {
       var row = (new vidteq._poi(srf.results[i-1],this.gui)).getEntityHtml('fvt',undefined,undefined,srf.srfType);
        $('#'+tblName).append(row.html);
        if(i%2)
          color='blue';
        else
          color='green';
        row_content=$(row.html).find('table').find('div').html();
        dsc_content+="<li><center><div class='wn_holder "+color+" '>"+row_content+"</div></center></li>";
        $.extend(dsc_funcList,row.funcList);
      }
  } else {
    for(var i=srf.showSets[srf.curShowSet].from;i<=srf.showSets[srf.curShowSet].to;i++) {
      var row = (new vidteq._poi(srf.results[i-1],this.gui)).getEntityHtml('fvt');
      $('#'+tblName).append(row.html);
      for (var f in row.funcList) { $('#'+f).click(row.funcList[f]); }
      if (this.gui.sideBarUI) { } else {
        $('#'+tblName).append(spacer);
      }
    }
  }
  var funcList = {};
  var that = this;
  var idx = srf.srfIndex;
  var backForw="<tr><td></td><td><table width=100% cellpadding=5 cellspacing=5 ><tr>";
  if (this.gui.sideBarUI) {
    backForw="<tr><td><table width=100% cellpadding=5 cellspacing=0  style='background:#A88026;' ><tr>";
  }
  if (typeof(srf.showSets[srf.curShowSet-1]) == 'undefined') {
    backForw+="<td></td>";
  } else {
    if (this.gui.sideBarUI) {
      backForw+="<td style='text-align:left' ><a id="+tblName+"_back  onfocus='this.blur();' class='simple' href='javascript:void(0)' style='color:#000000;' >&lt&lt&nbsp Previous</a></td>";
    } else {
      backForw+="<td style='text-align:left' ><a id="+tblName+"_back  onfocus='this.blur();' class='simple' href='javascript:void(0)' >&lt&lt&nbsp Previous</a></td>";
    }
    funcList[tblName+'_back'] = function () {
      if(vidteq.utils.getSafe('that.gui.srfResponse.srf')) {
        for(var i in that.gui.srfResponse.srf[idx].results) {
          //if(that.gui.srfResponse.srf.results[i].lpIndex) {
            delete that.gui.srfResponse.srf[idx].results[i].lpIndex;
          //}
        }
      }
      if (that.gui.io) { that.gui.io.srfResponse.srf[idx].curShowSet--; }
      else {
        that.gui.srfResponse.srf[idx].curShowSet--;
      }
      that.gui.writeSrfToTable();
    };
  }
  if (typeof(srf.showSets[srf.curShowSet+1]) == 'undefined') {
    backForw+="<td></td>";
  } else {
    if (this.gui.sideBarUI) {
      backForw+="<td style='text-align:right' ><a id="+tblName+"_forw onfocus='this.blur();' class='simple' href='javascript:void(0)' style='color:#000000;' >Next &nbsp&gt&gt </a></td>";
    } else {
      backForw+="<td style='text-align:right' ><a id="+tblName+"_forw onfocus='this.blur();' class='simple' href='javascript:void(0)' >Next &nbsp&gt&gt </a></td>";
    }
    funcList[tblName+'_forw'] = function () {
      //alert('');
      //that.gui.mbox.catMngr.locatorPoint = that.gui.mbox.catMngr.layer.features;
      //for(var k =0;k< that.gui.mbox.locatorPoint.length;k++) {
      //  if(that.gui.mbox.locatorPoint[k].cluster) {
      //    for(var l in that.gui.mbox.locatorPoint[k].cluster) {
      //      delete that.gui.mbox.locatorPoint[k].cluster[l].data.lpIndex;
      //    }
      //  } else {
      //    delete that.gui.mbox.locatorPoint[k].data.lpIndex;
      //  }
      //}
      //that.gui.mbox.catMngr.layer.drawFeature(that.gui.mbox.locatorPoint);      
      if(vidteq.utils.getSafe('that.gui.srfResponse.srf')) {
        for(var i in that.gui.srfResponse.srf[idx].results) {
          //if(that.gui.srfResponse.srf.results[i].lpIndex) {
            delete that.gui.srfResponse.srf[idx].results[i].lpIndex;
          //}
        }
      }
      if (that.gui.io) { that.gui.io.srfResponse.srf[idx].curShowSet++; }
      else {
        that.gui.srfResponse.srf[idx].curShowSet++;
      }
      that.gui.writeSrfToTable();
    };
  }
  backForw+="</tr></table></td></tr>";
  $('#'+tblName).append(backForw);
  for (var i in funcList) { $('#'+i).click(funcList[i]); }
  // Handheld does not use this tblName

  if (this.gui.handheld || this.gui.openScale) {
    $('#dsc').html(dsc_content);
    for (var f in dsc_funcList) { $('#'+f).click(dsc_funcList[f]); }
  }
  $('#dscBack').click(function(){
    window.location.hash='nearby';
  });
  
  if( this.gui.draggableVideo  && this.gui.resizableVideo ) {
    this.gui.hideCollapse();
    $('#'+that.videoDom).hide();
  }
}

//vidteq.fvt.prototype.writeSrfToTableOld = function(srf) {
//  if (typeof(srf.showSets[srf.curShowSet]) == 'undefined') return;
//  //if(vidteq.vidteq.flink) {
//  //  if(vidteq.vidteq.flink.leftBar==0) $('#locadiv')[0].style.display='none'
//  //  if(vidteq.vidteq.flink.leftBar) vidteq.vidteq.flink.leftBar=1
//  //}
//  var tempRows="<table style='padding:0px;' cellpadding=1 cellspacing=1 width=90% >";
//    tempRows+="<tr colspan=2><td></td><td><hr/><td/></tr>";
//  for(var i=srf.showSets[srf.curShowSet].from;i<=srf.showSets[srf.curShowSet].to;i++) {
//    var localRows;
//    var rmReg=new RegExp("<tr><td></td><td><a class=simple style='color:white'>or did you mean ?</a></td></tr>");
//    // TBD what is above line doing ?
//    //tempRows+=getEntityHtml('fvt',srf.results[i-1]);
//    //tempRows+=getEntityHtmlNew('fvt',srf.results[i-1]);
//    tempRows+=(new vidteq._poi(srf.results[i-1],this.gui)).getEntityHtmlNew('fvt');
//    tempRows+="<tr colspan=2><td></td><td><hr/><td/></tr>";
//  }
//  tempRows+="<tr><table cellpadding=5 cellspacing=5><tr>";
//  if (typeof(srf.showSets[srf.curShowSet-1]) == 'undefined') {
//    tempRows+="<td></td>";
//  } else {
//    tempRows+="<td><a onfocus='this.blur();' class='simple' href='javascript:void(0)' onclick=javascript:ioAreaObj.srfResponse.srf["+srf.srfIndex+"].curShowSet--;ioAreaObj.writeSrfToTable.apply(ioAreaObj,[]);>&lt&lt&nbsp Previous</a></td>";
//  }
//  if (typeof(srf.showSets[srf.curShowSet+1]) == 'undefined') {
//    tempRows+="<td></td>";
//  } else {
//    tempRows+="<td><a class='simple' href='javascript:void(0)' onclick=javascript:ioAreaObj.srfResponse.srf["+srf.srfIndex+"].curShowSet++;ioAreaObj.writeSrfToTable.apply(ioAreaObj,[]);>Next &nbsp&gt&gt</a></td>";
//  }
//  tempRows+="</tr></table></tr>";
//  tempRows+="</table>";
//  document.getElementById(srf.domName).innerHTML=tempRows;
//  //if(vidteq.vidteq.flink && vidteq.vidteq.flink.ll) callLocationPopMap(0); 
//}
	
vidteq.fvt.prototype.loadVideoPlayer = function() {
  var flashVars = 'txtColor=#ffffff&btnColor=#2C2C2C&mcColor=#595958';
  if(typeof(vidteq.aD) != 'undefined' 
      && typeof(vidteq.aD.config) != 'undefined') { 
    var flashCfg = vidteq.aD.config;
    var txtBgColor = typeof(flashCfg.txtBgColor) != 'undefined' ? flashCfg.txtBgColor : '#ffffff';
    var btnBgColor = typeof(flashCfg.btnBgColor) != 'undefined' ? flashCfg.btnBgColor : '#2C2C2C';
    var mcBgColor = typeof(flashCfg.mcBgColor) != 'undefined' ? flashCfg.mcBgColor : '#595958';
    flashVars = "txtColor="+txtBgColor+"&btnColor="+btnBgColor+"&mcColor="+mcBgColor;
  }
  if(typeof(vidteq.aD) != 'undefined' 
    && (vidteq.aD.urlId == "commonfloor")) {
    flashVars += "&volumeOff=true";
  }
  var protocol = document.location.protocol || "http:"; // http:
  var el_video = $('#'+this.videoDom);
  if( el_video ) {
    var isVideoHidden = el_video.is(':hidden');
    if( isVideoHidden ) {
      el_video.fadeIn( "slow" );
    }
  }
  var w,h;
  if(typeof(this.gui.embed)!='undefined') {
    w = this.gui.embed.vidWidth;
    if (this.detach) w = parseInt(parseInt(w)*1.75);
    if (this.gui.embed && this.gui.handheld) { w = 128; }
  } else { w = 480; }
  if(typeof(this.gui.embed)!='undefined') {
    h = this.gui.embed.vidHeight;
    if (this.gui.embed && this.gui.handheld) { h = 96; }
  } else { h = 350; } 
  if(this.gui.wap) {h=100;w=150;}
  if(this.gui.is3dmap){h=170;w=200;}
  //TBD: for resizable
  if( this.gui.resizableVideo ) {
    h="100%";w="100%";
  }
  var str = AC_FL_RunContent(
    'codebase', protocol+'://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=9,0,0,0',
    'width', w,
    'height', h,
    //'src', 'VideoPlaylist',
    'src', this.videoSwf,
    'quality', 'high',
    'pluginspage', protocol+'://www.macromedia.com/go/getflashplayer',
    'align', 'middle',
    'play', 'true',
    'loop', 'true',
    'scale', 'exactfit',
    'wmode', 'transparent',
    'devicefont', 'false',
    //'id', 'VideoPlaylist',
    'id', this.videoSwf,
    'containerId', this.videoDom,
    'bgcolor', '#000000',
    'FlashVars',flashVars,
    //'name', 'VideoPlaylist',
    'name', this.videoSwf,
    'menu', 'true',
    'allowFullScreen', 'false',
    'allowScriptAccess','sameDomain',
    //'movie', 'VideoPlaylist',
    'movie', this.videoSwf,
    'salign', ''
  ); //end AC code
  if(typeof(this.gui.html5VideoParams) != 'undefined' && (!this.gui.flashPlayer || this.gui.singlePlayer)){ 
    str = this.gui.html5VideoParams.playerContainer; 
  }
  var draggableVideo = this.gui.draggableVideo;
  if( draggableVideo ) {
    var dragme = '<div class="dragme" style="height:83%;width:100%;background-color:grey;background-color:transparent;float:left;position:absolute;top:0;left:0;cursor:move;/*display:none;*/"></div>';
    str = dragme+str;
  }
  
  this.vidPlayerHTML = str;
  document.getElementById(this.videoDom).innerHTML = str;
    
  if( draggableVideo ) {
    var _objType = 'object'
    ,el_videoDom = $("#"+this.videoDom)
    ;
    if( el_videoDom.find('embed').length > 0 ) { _objType = 'embed'; }
    this.addDraggable(this.videoDom,{ cancel:_objType, cursor: "move", containment:'.content-wrapper' });//if Video draggable
  }
  this.initVideoW = w;
  this.initVideoH = h;
  if (this.gui.embed && this.gui.handheld && !this.gui.appMode) {
    if (this.gui.popupVideo) {
      this.launchPopupVideo();
    } else {
      this.launchFullVideo();
    }
  } else if(this.gui.is3dmap){
  	this.launchPopupWebVideo3D();
  } else if(this.detach) {
    this.launchPopupWebVideo();
  }
  //fvt.vidPlayerHTML=document.getElementById('VideoPlayerDiv2').innerHTML;
}

vidteq.fvt.prototype.getVideoObj = function(name) {
  if (navigator.appName.indexOf("Microsoft") != -1) {return window[name]}
  else {return document[name]}
}

vidteq.fvt.prototype.textSync = function (textIndex,shudZoom) {
  if(!this.gui.appMode) {
    if((typeof(this.gui.html5VideoParams) != 'undefined' && (!this.gui.flashPlayer || this.gui.singlePlayer))){
      videoPlaylist.startPingPongAtMainIndex(textIndex,0); 
    } 
    if(!this.gui.iPadEnabled && !(typeof(this.gui.html5VideoParams) != 'undefined' && (!this.gui.flashPlayer || this.gui.singlePlayer))) { 
      if((typeof(this.getVideoObj(this.videoSwf).playVideo))!='function') {
        return 0;
      } 
    }
  }
  if(this.swfAwake) {clearTimeout(this.swfAwake);}  // TBD not sure
  vidteq.mboxObj.enableCarDisplay = false;  // block till seeked
  if(shudZoom) {vidteq.mboxObj.zoom2RoadDp.apply(vidteq.mboxObj,[textIndex]);}	
  var nearestIndex = vidteq.mboxObj.syncMapPoints[textIndex];
  // runAll = 1;
  vidteq.mboxObj.enableCarDisplay = true;  // TBD wait till video play is reint
  if(this.gui.appMode) {
    //this.gui.stopStartVideoDragPan = false;
    StageWebViewBridge.call('playVideo', null, nearestIndex);
  } else {
    this.getVideoObj(this.videoSwf).playVideo(nearestIndex);
  }
  if(this.gui.handheld) {
    $('#text_dir_holder').hide();
    this.gui.text_shown=false;
    var that = this;
    setTimeout(function(){that.gui.mbox.centerMap();},1000);
  }
}

vidteq.fvt.prototype.addResizable = function(id,options) {
  id = id || this.videoDom;
  //handles: {"e,s,se" : { e: '.ui-resizable-e', s: '.ui-resizable-s', se: '.ui-resizable-se'}},
  options = options || {
    aspectRatio:true
    ,ghost:true
    ,handles:"n,e,s,w,ne,se,sw,nw"
    ,minWidth:185
    ,maxWidth:565
    ,create: function( event, ui ) {
      //console.log("resizable:create: ");
      var el_handle_se = $(this).find(".ui-icon-gripsmall-diagonal-se");
      el_handle_se.removeClass("ui-icon-gripsmall-diagonal-se").addClass("ui-icon-grip-diagonal-se");
    }
  };
  if( $.fn.resizable ) {
    var el_id = $('#'+id);
    if( el_id.hasClass('ui-resizable') ) {
      el_id.resizable('destroy');
    }
    el_id.resizable(options);
  }
}

vidteq.fvt.prototype.addDraggable = function(id,options) {
  id = id || this.videoDom;
  options = options || {};
  if( $.fn.draggable ) {
    $('#'+id).draggable(options);
  }
}

vidteq.fvt.prototype.applyEventsSwfPlayer = function () {
  if(this.gui.openScale) return;
  var el_VideoPlayerDiv = document.getElementById('VideoPlayerDiv');
  if($(el_VideoPlayerDiv).length > 0) {
    el_VideoPlayerDiv.onmouseout=function () {
      if(this.swfMouseRelease) this.swfMouseOut=true;else this.swfMouseOut=false;
    }
    el_VideoPlayerDiv.onmousedown=function () {
      this.swfMouseRelease=true;
    }
    if(document.getElementById('body')) {
      document.getElementById('body').onmouseup=function () {
        //if(this.swfMouseOut==true && typeof getMovieName("VideoPlaylist").mouseReleased=='function') {
        if(this.swfMouseOut==true && typeof getMovieName(this.videoSwf).mouseReleased=='function') {
          //getMovieName("VideoPlaylist").mouseReleased();
          getMovieName(this.videoSwf).mouseReleased();
          this.swfMouseRelease=false;
          this.swfMouseOut = false;
        } 
      }	
    }	
  }
}

vidteq.fvt.prototype.launchVideoPlayerFirstTime = function () {
  if (this.gui.handheld && !this.gui.appMode) { 
    this.showHandheld('route'); 
  } else if (this.gui.topBarUI || this.gui.sideBarUI) {
    this.showNew('route');
  } else if (this.gui.embed && this.gui.embed.locateStores) {
    this.showNew('route');
  } else if (this.gui.embed && this.gui.embed.wayfinder) {
    this.showNew('route');
  } else if (this.gui.embed && this.gui.embed['wayfinder-lite']) {
    this.showNew('route');
  } else if (this.gui.embed && this.gui.embed['blocate-lite']) {
    this.showNew('route');
  } else {
    this.showLorR('R');
  }
  //hasReqestedFlashVersion = DetectFlashVer(requiredMajorVersion, requiredMinorVersion, requiredRevision);
  //if(hasReqestedFlashVersion)
  if(this.gui.openScale) return;
  if(vidteq.vidteq.hasReqestedFlashVersion) {
    if(this.firstLoad) {
      this.loadVideoPlayer();
      this.firstLoad=false;
    } else {
      document.getElementById(this.videoDom).innerHTML=(typeof(this.vidPlayerHTML)==undefined)?'':this.vidPlayerHTML;
      if (this.gui.embed && this.gui.handheld && !this.gui.appMode) {
        if (this.gui.popupVideo) {
          this.launchPopupVideo();
        } else {
          this.launchFullVideo();
        }
      } else if(this.gui.is3dmap){
      	this.launchPopupWebVideo3D();
      }else{
        if (this.detach) { this.launchPopupWebVideo(); }
      }  
    }
  } else {
    if(!this.gui.handheld) {
      if(this.gui.singlePlayer){ 
        this.loadVideoPlayer();
        this.firstLoad=false;
      } else {
        document.getElementById(this.videoDom).innerHTML='<br/><br/><a class=maptab style=color:white>Namaskara! <br/>You seem to have Adobe Flash plugin disabled/missing OR Plugin version is old. </a><br/><a href=http://www.adobe.com/go/getflash/ class=maptab style=color:white;text-decoration:underline; >Get the latest flash Plugin</a>';
        $('#'+this.videoDom).show();
      }
    } else {
      $('#'+this.videoDom).hide();
    }
  }
  this.playerActive = true;
}

vidteq.fvt.prototype.adjustDirDiv = function() {
  if (typeof(this.theScroll[0]) == 'undefined') { return; }
  if (this.mode != 'route') { return; }
  if (!$('#routediv').is(':visible')) { return; }
  var h = $('#directions_div').height();
  if (h == 0) { return; }
  var t = this.theScroll[0];
  var oldH = t.clipH;
  //var sH = 15; var sW = 15;
  var fvtScrollOptions = this.fvtScrollOptions
  ,activeTheme = fvtScrollOptions.activeTheme
  ,themeN = fvtScrollOptions.theme[activeTheme]
  ,sW = themeN.sW
  ,sH = themeN.sH
  ,tH = themeN.tH
  ,numOfScrolls = fvtScrollOptions.numOfScrolls
  ;
  
  if (h < 3*sH) { $('#directions_div').hide(); return; }
  if ( !$('#directions_div').is(':visible') ) { $('#directions_div').show(); }
  $('#dn0').css('top',(h-sH)+"px");  
  $('#dn1').css('top',(h-sH)+"px");  
  $('#bigbar0').css('height',(h-(sH*2))+"px");  
  $('#bigbar1').css('height',(h-(sH*2))+"px");  
  $('#scroll0Container').css('height',h+"px");  
  t.clipH = h;
  t.load();
  var maxY = t.clipH-(sH*2)-tH;
  if( t.theThumb ) { t.theThumb.maxY = maxY; } //Drag secret init
  if( t.theThumb1 ) { t.theThumb1.maxY = maxY; }
  var thumb = t.theThumb || t.theThumb1;
  t.theRatio = t.scrollH / ( maxY - thumb.minY);
  //t.theThumb.jumpToIndex(t.jumpIndex);
  t.jumpToIndex(t.jumpIndex);
}

vidteq.fvt.prototype.populateDirectionsDiv = function(response) {
  $('#directions_div').css({'background-color':'black',overflow:'hidden'});
  if (this.gui.topBarUI || this.gui.sideBarUI) {
    $('#directions_div').css({'background-color':'white'});
  }
  if(typeof(response.vid) == 'undefined') { 
    //$('#textDirections').html($('#textDirectionsTemplate').tmpl({vidDir:vidDir}));
    if('firstTimeLoad' in vidteq && vidteq.firstTimeLoad) { 
      this.fillImageAndPassBy(response);
    } else {
      this.generateTextDirections(response);
    }
    delete vidteq.firstTimeLoad;
    return;
  }
  if('firstTimeLoad' in vidteq) { delete vidteq.firstTimeLoad; }
  var innerContent = ""
  innerContent+="<table id='textDirections' class='textDirections' width=100% >";
  if(this.gui.embed && this.gui.embed.firstTimeRule && this.gui.embed.firstTimeRule.busId) {
    innerContent+=this.generateBusStops(response);
  } else {
    if(!this.gui.wap)innerContent+=this.generateTextDirections(response);
  }
  innerContent+="</table>";
  //if(true) gui.textDirections=innerContent;
  $('#directions_div').html("<div style='display:block' class='scrollContainer nemo-fvt-scrollContainer' id='scroll0ContainerOrig'><div style='left: 0px; top: 0px;' class='scrollContent nemo-fvt-scrollContent' id='scroll0ContentOrig'><div class='header1' style='display:none;'><span>Directions</span></div>"+innerContent+"</div></div>");
}

vidteq.fvt.prototype.displayRoute = function(response) {
  //if (this.gui.appMode && this.gui.handheld) {
  //  this.populateDirectionsDiv(response);
  //}
  this.launchVideoPlayerFirstTime();
  this.populateDirectionsDiv(response);
  if (this.gui.appMode && this.gui.handheld) { return; }
  //$('#directions_div').css({'background-color':'black',overflow:'hidden'});
  //if(this.gui.topBarUI) {
  //  $('#directions_div').css({'background-color':'white'});
  //}
  //var innerContent = ""
  //innerContent+="<table id='textDirections' width=100% >";
  //if(this.gui.embed && this.gui.embed.firstTimeRule && this.gui.embed.firstTimeRule.busId) {
  //  innerContent+=this.generateBusStops(response);
  //} else {
  //  if(!this.gui.wap)innerContent+=this.generateTextDirections(response);
  //}
  //innerContent+="</table>";
  ////if(true) gui.textDirections=innerContent;
  //$('#directions_div').html("<div style='display:block' class='scrollContainer' id='scroll0ContainerOrig'><div style='left: 0px; top: 0px;' class='scrollContent' id='scroll0ContentOrig'>"+innerContent+"</div></div>");
  var checkFunc = function () {
  //  debugPrint(" added directions div with stuff "+$('#scroll0ContentOrig').length+' '+$('#scroll0ContainerOrig').length+" "+$('#scroll0ContentOrig').is(':visible')+" "+$('#scroll0ContainerOrig').is(':visible'));
//    debugPrint(" added directions div with stuff "+$('#scroll0ContentOrig').height()+' '+$('#scroll0ContainerOrig').height());
    if (!$('#scroll0ContentOrig').is(':visible')) { return false; }
    else return true;
  }
  // TBD height is sometimes zero why?
  // Height sometimes wrong why?
  //alert(innerContent);
  var that = this;
  var fireFunc = function () {
    if ($('#scroll0ContentOrig').height() > $('#scroll0ContainerOrig').height()) {
      $('#scroll0ContainerOrig').hide();
      //that.addDoubleScroller('directions_div',$('#scroll0ContainerOrig').width(),$('#directions_div').height(),'scroll0',innerContent,that.fvtScrollOptions);  
      that.addDoubleScroller('directions_div',$('#scroll0ContainerOrig').width(),$('#directions_div').height(),'scroll0',$('#scroll0ContentOrig').html(),that.fvtScrollOptions);
      //that.attachMCustomScrollbar('directions_div');
    } else { 
      that.theScroll = [];
    } 
  }
  //TBD: conditional/customized scroll
  var w = new vidteq.utils.waitAndFire (checkFunc,fireFunc);
  
  //TBD: on second route re-sizable disappears
  if( this.gui.resizableVideo ) {
    $("#"+this.videoDom).show();
    this.gui.showCollapse();
    this.addResizable();
    if( this.gui.draggableVideo ) {
      var el_routeDom = $("#"+this.childDom.routeDetached);
      if( !el_routeDom.is(':visible') ) {
        el_routeDom.show();
      }
    }
  }
}

vidteq.fvt.prototype.rollTo = function(textIndex) {
  if (typeof(this.theScroll[0]) == 'undefined') { return; }
  var height2Scroll=0;
  $("tr[id=textdirrow"+(textIndex+1)+"]").each(function () {
    if (!$(this).is(':visible')) { return; }
    height2Scroll = $(this).position().top;
    height2Scroll -= parseInt(($('#directions_div').height() - $(this).height())/2);
    if (height2Scroll < 0) { height2Scroll = 0; } 
  });
  var t = this.theScroll[0];
  t.jumpTo(null,height2Scroll);
  var thumbY = t.theThumb.minY + Math.round(height2Scroll/t.theRatio);
  if (thumbY > t.theThumb.maxY) { thumbY=t.theThumb.maxY ; }
  t.theThumb.style.top = thumbY + "px"; 
  t.theThumb1.style.top = thumbY + "px"; 
  t.jumpIndex = Math.round((t.scrollTop/t.scrollH)*t.res);
} 

vidteq.fvt.prototype.handleBarClick = function(eventObj) {
  var y = eventObj.pageY - $(this).offset().top;
  var t = vidteq.fvtObj.theScroll[0];
  var i = parseInt(y*t.res/$(this).height());
  t.jumpToIndex(i);
}

vidteq.fvt.prototype.attachMCustomScrollbar = function( id ) {
  if( $.fn.mCustomScrollbar ) {
    $("#"+id).mCustomScrollbar({
     autoHideScrollbar:true,
     autoDraggerLength:false,
     scrollButtons:{
       enable:true
     }
    });

    $("#"+id).parent().on('mousewheel',function(e) {
     e.preventDefault();
    });
  }
}

vidteq.fvt.prototype.addDoubleScroller = function(target,w,h,scrollId,origInnerHTML,fvtScrollOptions) {
  var fvtScrollOptions = fvtScrollOptions || this.fvtScrollOptions
  ,activeTheme = fvtScrollOptions.activeTheme
  ,themeN = fvtScrollOptions.theme[activeTheme]
  ,sW = ( themeN && typeof themeN.sW !== "undefined"? themeN.sW : 15 )
  ,sH = ( themeN && typeof themeN.sH !== "undefined"? themeN.sH : 15 )
  ,sN = ( themeN && typeof themeN.sN !== "undefined"? themeN.sN : 0 )
  ,tH = ( themeN && typeof themeN.tH !== "undefined"? themeN.tH : 0 )
  ,numOfScrolls = fvtScrollOptions.numOfScrolls = (function(){
    var count = 0;
    if( fvtScrollOptions.left ) {
      ++count;
    }
    if( fvtScrollOptions.right ) {
      ++count;
    }
    return count;
  })()
  ,scrollContainerStyle = "top:0px;height:"+h+"px;"
  ,innerHTML = ''
  ;
  var that = this;
  //TBD dereference vidteq.fvtObj
  innerHTML+="<div class='root' id='root0'>";
  /*innerHTML+="<div style='left: 0px;'class='up' id='up0'><a href='javascript:void(0);' onmouseover='vidteq.fvtObj.theScroll[0].scrollNorth(0)' onmouseout='vidteq.fvtObj.theScroll[0].endScroll()' onclick='return false;'><img src='"+vidteq.imgPath.up+"' height='"+sH+"' width='"+sW+"'></a></div>";
  innerHTML+="<div style='left: 0px;top: "+(h-sH)+"px;' class='dn' id='dn0'><a href='javascript:void(0);' onmouseover='vidteq.fvtObj.theScroll[0].scrollSouth(0)' onmouseout='vidteq.fvtObj.theScroll[0].endScroll()' onclick='return false;'><img src='"+vidteq.imgPath.down+"' height='"+sH+"' width='"+sW+"'></a></div>";
  innerHTML+="<div class='thumb' id='thumb0' style='border: 0pt none ; top: "+sH+"px; left:0px;'><a href='javascript:void(0);'><img src='"+vidteq.imgPath.thumb+"' height='"+sH+"' width='"+sW+"'></a></div>";
  innerHTML+="<div class='bigbar' id='bigbar0' style='border: 0pt none ; top: "+sH+"px; left:0px;height:"+(h-(sH*2))+"px;width:"+sW+"px;' href='javascript:void(0);' ></div>";
  */
  if( fvtScrollOptions.left && activeTheme != 'niceScroll') {
    innerHTML += vidteq.ypSimpleScroll.getDom({
      theme:themeN
      ,activeTheme:activeTheme
      ,numOfScrolls:numOfScrolls
      ,pos:'left'
      ,sH:sH
      ,sW:sW
      ,h:h
      ,w:w
      ,imgPath:vidteq.imgPath
    });
    fvtScrollOptions.left = {
      dragInit:function(thumb,t,numOfScrolls) {
        //(o, oRoot, minX, maxX, minY, maxY, bSwapHorzRef, bSwapVertRef, fXMapper, fYMapper)
        vidteq.Drag.init( thumb,null,0,0,sH,t.clipH-(sH*2)-tH );
      }
    };
    scrollContainerStyle += "left:"+sW+"px;";
  }
  if( fvtScrollOptions.right  && activeTheme != 'niceScroll') {
    innerHTML += vidteq.ypSimpleScroll.getDom({
      theme:themeN
      ,activeTheme:activeTheme
      ,numOfScrolls:numOfScrolls
      ,pos:'right'
      ,sH:sH
      ,sW:sW
      ,h:h
      ,w:w
      ,imgPath:vidteq.imgPath
    });
    fvtScrollOptions.right = {
      dragInit:function(thumb,t,numOfScrolls) {
        //(o, oRoot, minX, maxX, minY, maxY, bSwapHorzRef, bSwapVertRef, fXMapper, fYMapper)
        //vidteq.Drag.init(thumb,null,t.clipW+sW,t.clipW+sW,sH,t.clipH-(sH*2));
        var mXY = t.clipW;
        if( numOfScrolls == 2 ) { mXY += sW }
        vidteq.Drag.init(thumb,null,mXY,mXY,sH,t.clipH-(sH*2)-tH);
      }
    };
  }
  /*if( $.fn.mousewheel ) {
    $('#directions_div').on('mousewheel', function(event) {
        console.log(event.deltaX, event.deltaY, event.deltaFactor);
        vidteq.Drag.drag(event);
    });
  }*/
  /*  
  innerHTML+="<div style='left: "+(w-sW)+"px;' class='up' id='up1'><a href='javascript:void(0);' onmouseover='vidteq.fvtObj.theScroll[0].scrollNorth(0)' onmouseout='vidteq.fvtObj.theScroll[0].endScroll()' onclick='return false;'><img src='"+vidteq.imgPath.up+"' height='"+sH+"' width='"+sW+"'></a></div>";
  innerHTML+="<div style='left: "+(w-sW)+"px;top: "+(h-sH)+"px;' class='dn' id='dn1'><a href='javascript:void(0);' onmouseover='vidteq.fvtObj.theScroll[0].scrollSouth(0)' onmouseout='vidteq.fvtObj.theScroll[0].endScroll()' onclick='return false;'><img src='"+vidteq.imgPath.down+"' height='"+sH+"' width='"+sW+"'></a></div>";
  innerHTML+="<div class='thumb' id='thumb1' style='border: 0pt none ; top: "+sH+"px; left:"+(w-sW)+"px;'><a href='javascript:void(0);'><img src='"+vidteq.imgPath.thumb+"' height='"+sH+"' width='"+sW+"'></a></div>";
  */
  //for(var i=0;i<32;i++)  {
  //  innerHTML+="<div class='bar' id='bar0_"+i+"' style='border: 0pt none ; top: "+Math.round(sH+i*(h-(sH*2))/32)+"px; left:0px;' height='"+Math.round((h-(sH*2))/32)+"' width='"+sW+"' href='javascript:void(0);' onclick='vidteq.fvtObj.theScroll[0].theThumb.jumpToIndex("+i+")'></div>";
  //}
  //var i = 0;
  
  //for(var i=0;i<32;i++)  {
  //  innerHTML+="<div class='bar' id='bar1_"+i+"' style='border: 0pt none ; top: "+Math.round(sH+i*(h-(sH*2))/32)+"px; left:"+(w-sW)+"px;' height='"+Math.round((h-(sH*2))/32)+"' width='"+sW+"' href='javascript:void(0);' onclick='vidteq.fvtObj.theScroll[0].theThumb.jumpToIndex("+i+")'></div>";
  //}
  //innerHTML+="<div class='bigbar' id='bigbar1' style='border: 0pt none ; top: "+sH+"px; left:"+(w-sW)+"px;height:"+(h-(sH*2))+"px;width:"+sW+"px;' href='javascript:void(0);' ></div>";
  
  //innerHTML +="<div style='left:"+sW+"px; top:0px; width:"+(w-(sH*numOfScrolls))+"px;height:"+h+"px;' class='scrollContainer' id='scroll0Container'><div style='left:0px; top:0px; width:"+(w-(sH*numOfScrolls))+"px;' class='scrollContent' id='scroll0Content'>" + origInnerHTML;
  scrollContainerStyle += "width:"+(w-(sW*numOfScrolls))+"px;";
  innerHTML +="<div style='"+scrollContainerStyle+"' class='scrollContainer' id='scroll0Container'><div style='left:0px; top:0px; width:"+(w-(sH*numOfScrolls))+"px;' class='scrollContent' id='scroll0Content'>" + origInnerHTML;
  innerHTML+="</div>"; 
  innerHTML+="</div>";
  innerHTML+="</div>"; 
  //target.innerHTML = innerHTML;
  $('#'+target).append(innerHTML);
  if(activeTheme == 'niceScroll') {
    this.attachScroll('scroll0Container',(w-(sH*numOfScrolls)-5)+"px");
  } else {
    var fvtScroll = this.theScroll[0] = new vidteq.ypSimpleScroll(scrollId,0,0,(w-(sW*numOfScrolls)),h,150);
    fvtScroll.init( fvtScrollOptions );
  }
  
  /*
  this.theScroll[0].load();
  this.theScroll[0].theThumb = document.getElementById('thumb0');
  vidteq.Drag.init(this.theScroll[0].theThumb,null,0,0,sH,this.theScroll[0].clipH-(sH*2));
  
  this.theScroll[0].theThumb1 = document.getElementById('thumb1');
  vidteq.Drag.init(this.theScroll[0].theThumb1,null,this.theScroll[0].clipW+sW,this.theScroll[0].clipW+sW,sH,this.theScroll[0].clipH-(sH*2));

  this.theScroll[0].theRatio = this.theScroll[0].scrollH / (this.theScroll[0].theThumb.maxY - this.theScroll[0].theThumb.minY);
  this.theScroll[0].theThumb.onDrag = function(x, y) {
    //vidteq.fvtObj.theScroll[0].jumpTo(null, Math.round((y - vidteq.fvtObj.theScroll[0].theThumb.minY) * vidteq.fvtObj.theScroll[0].theRatio));
    //vidteq.fvtObj.theScroll[0].theThumb1.style.top = y + "px"; 
    var t = vidteq.fvtObj.theScroll[0];
    t.jumpTo(null, Math.round((y - t.theThumb.minY) * t.theRatio));
    t.theThumb1.style.top = y + "px"; 
    t.jumpIndex = Math.round((y - t.theThumb.minY)*t.res/(t.theThumb.maxY - t.theThumb.minY));
  }
  this.theScroll[0].theThumb1.onDrag = function(x, y) {
    //vidteq.fvtObj.theScroll[0].jumpTo(null, Math.round((y - vidteq.fvtObj.theScroll[0].theThumb.minY) * vidteq.fvtObj.theScroll[0].theRatio));
    //vidteq.fvtObj.theScroll[0].theThumb.style.top = y + "px"; 
    var t = vidteq.fvtObj.theScroll[0];
    t.jumpTo(null, Math.round((y - t.theThumb.minY) * t.theRatio));
    t.theThumb.style.top = y + "px"; 
    t.jumpIndex = Math.round((y - t.theThumb.minY)*t.res/(t.theThumb.maxY - t.theThumb.minY));
  }
  this.theScroll[0].theThumb.jumpToIndex = function(index) {
    //vidteq.fvtObj.theScroll[0].jumpTo(null, Math.round(index*(vidteq.fvtObj.theScroll[0].theThumb.maxY - vidteq.fvtObj.theScroll[0].theThumb.minY)/32 * vidteq.fvtObj.theScroll[0].theRatio));
    //vidteq.fvtObj.theScroll[0].theThumb.style.top = Math.round((index*(vidteq.fvtObj.theScroll[0].theThumb.maxY-vidteq.fvtObj.theScroll[0].theThumb.minY)/32)+vidteq.fvtObj.theScroll[0].theThumb.minY) + "px"; 
    //vidteq.fvtObj.theScroll[0].theThumb1.style.top = Math.round((index*(vidteq.fvtObj.theScroll[0].theThumb.maxY-vidteq.fvtObj.theScroll[0].theThumb.minY)/32)+vidteq.fvtObj.theScroll[0].theThumb.minY) + "px"; 
    var t = vidteq.fvtObj.theScroll[0];
    var yOfIndex = index*(t.theThumb.maxY - t.theThumb.minY)/t.res;
    t.jumpTo(null, Math.round(yOfIndex * t.theRatio));
    t.jumpIndex = index;
    t.theThumb.style.top = Math.round(yOfIndex+t.theThumb.minY) + "px"; 
    t.theThumb1.style.top = Math.round(yOfIndex+t.theThumb.minY) + "px"; 
  }
  this.theScroll[0].jumpIndex = 0;
  this.theScroll[0].res = 32;
  $('#bigbar0').click(this.handleBarClick);
  $('#bigbar1').click(this.handleBarClick);
  */
}

vidteq.fvt.prototype.stopParentScroll = function(id) {
  $("#"+id).parent().on('mousewheel',function(e) {
    e.preventDefault();
  });  
}

vidteq.fvt.prototype.attachScroll = function(id,left) {
  $('body').find('div[id^=ascrail]').each(function () {
    $(this).remove(); 
  });
  if (!self.navigator.userAgent.match(/MSIE\s[7]/)){
    $("#"+id).niceScroll({
      cursorwidth:"4px"
      ,cursorfixedheight: 40
      ,autohidemode:false
      ,cursorborderradius:'0'
      ,cursorborder:'0'
      //,background:'#A87C2C'
      ,horizrailenabled:false
      ,railpadding:{top:0,right:0,left:left,bottom:0}
      ,cursorborderradius:"5px"
    });    
  }
  this.stopParentScroll(id);
  $('body').find('div[id^=ascrail]').each(function () {
    $(this).css({left:left}); 
  });
}

vidteq.fvt.prototype.generateBusStops = function (response) {
  var innerHTML='';
  for(var i=0;i<response.busStops.length;i++)  {
	innerHTML+='<tr>';
	innerHTML+="<td class='plain' align='center' >"+(i+1)+".</td>";
	innerHTML+="<td class='plain' align='center'>";
	innerHTML+="<a  class='simple' onclick=vidteq.mboxObj.callBusStopPopup("+i+"); style='color:white;cursor:pointer;' id=busstoptext"+i+">"+response.busStops[i].name+"</a></td>";
	innerHTML+='</tr>';
	innerHTML+="<tr><td></td><td><hr class='vidline'/></td></tr>";
  }
  this.noOfTextDirections = response.busStops.length;
  return innerHTML;	
}

vidteq.fvt.prototype.toggleHintOrFull = function(id,depth,hintOrFull) {
  var lId = id+'_'+depth;
  var hintDisplayVal = 'none'; var fullDisplayVal = 'inline';
  if ( hintOrFull == 'hint' ) { hintDisplayVal = 'inline'; fullDisplayVal = 'none'; } 
  $("a[id=hintDirDiv_"+lId+"]").each(function () {$(this).css("display",hintDisplayVal);});
  $("div[id=fullDirDiv_"+lId+"]").each(function () {$(this).css("display",fullDisplayVal);});
  $("a[id=fullDirPtrDiv_"+lId+"]").each(function () {$(this).css("display",fullDisplayVal);});
  if (depth>0) {
    $("a[id=fullDirPtrDiv_"+id+"_"+(depth-1)+"]").each(function () {$(this).css("display",hintDisplayVal);});
  }
  this.adjustDirDiv();
}

vidteq.fvt.prototype.createDirPassByDITopHtml = function (dIRef,attr,dIHtml) {
  var fullHtml; var hintHtml;
  var className='poi';
  if (vidteq.gui.topBarUI || vidteq.gui.sideBarUI) { className='poi1'; }
  // TBD context change
  var id = attr.id+'_'+attr.depth;
  //var gId = attr.id;
  ////var lId = dIRef.pre[0];
  //var lId = attr.depth;
  //dIHtml.hintHtml ="<a class='"+className+"'>,&nbsp;&nbsp;</a><a id=hintDirDiv_"+gId+"_"+lId+" class='"+className+"' style='color:red;display:inline;' onclick = 'javascript:$(\"a[id=hintDirDiv_"+gId+"_"+lId+"]\").each(function () {$(this).css(\"display\",\"none\");});$(\"div[id=fullDirDiv_"+gId+"_"+lId+"]\").each(function () {$(this).css(\"display\",\"inline\");});'>("+(dIRef.post[0]-dIRef.pre[dIRef.pre.length-1]-1)+" more ...)</a>";
  dIHtml.hintHtml ="<a class='"+className+"'>,&nbsp;&nbsp;</a><a id=hintDirDiv_"+id+" class='hintDir "+className+"' style='color:red;display:inline;' onclick = 'vidteq.fvtObj.toggleHintOrFull("+attr.id+","+attr.depth+",\"full\");'>("+(dIRef.post[0]-dIRef.pre[dIRef.pre.length-1]-1)+" more ...)</a>";
  //fullHtml = dIHtml.hintHtml+"<div id=fullDirDiv_"+gId+"_"+lId+" style='display:none;'><a id=fullDirPtrDiv_"+gId+"_"+lId+" class='"+className+"' style='color:red;' onclick = 'javascript:$(\"a[id=hintDirDiv_"+gId+"_"+lId+"]\").each(function () {$(this).css(\"display\",\"inline\");});$(\"div[id=fullDirDiv_"+gId+"_"+lId+"]\").each(function () {$(this).css(\"display\",\"none\");});'> >> </a>"+dIHtml.fullHtml+"<a class='"+className+"' id=fullDirPtrDiv_"+gId+"_"+lId+" style='color:red;' onclick = 'javascript:$(\"a[id=hintDirDiv_"+gId+"_"+lId+"]\").each(function () {$(this).css(\"display\",\"inline\");});$(\"div[id=fullDirDiv_"+gId+"_"+lId+"]\").each(function () {$(this).css(\"display\",\"none\");});'> << </a></div>";
  fullHtml = dIHtml.hintHtml+"<div id=fullDirDiv_"+id+" style='display:none;'><a id=fullDirPtrDiv_"+id+" class='fullDirPtrDiv "+className+"' style='color:red;' onclick = 'vidteq.fvtObj.toggleHintOrFull("+attr.id+","+attr.depth+",\"hint\");'> >> </a>"+dIHtml.fullHtml+"<a class='fullDirPtrDiv "+className+"' id=fullDirPtrDiv_"+id+" style='color:red;' onclick = 'vidteq.fvtObj.toggleHintOrFull("+attr.id+","+attr.depth+",\"hint\");'> << </a></div>";
  return {hintHtml:hintHtml,fullHtml:fullHtml};
}

vidteq.fvt.prototype.createDirPassBy = function (attr,oneRec) {
  var fullHtml = ''; var hintHtml = '';
  var className='poi';
  //if(this.gui.topBarUI) { className='poi1'; }
  if(vidteq.gui.topBarUI || vidteq.gui.sideBarUI) { className='poi1'; }
  // TBD context change
  if (attr.begin) { 
    fullHtml = "<a href=javascript:void(0) class="+className+" onclick='vidteq.mboxObj.callPopupOneImage("+(attr.lId+attr.runId)+")'>"+oneRec.name+"</a>";
  } else { 
    fullHtml = "<a href=javascript:void(0) class="+className+" onclick='vidteq.mboxObj.callPopupOneImage("+(attr.lId+attr.runId)+")'>,&nbsp;&nbsp;"+oneRec.name+"</a>";
  }
  return {hintHtml:hintHtml,fullHtml:fullHtml};
}

vidteq.fvt.prototype.fillImageAndPassBy = function(response) {
  $('.passByHtmlContainer').each(function() {
    $(this).hide();
  });
  if(typeof(response.vid) == 'undefined') { 
    var previousCounts=0;
    var videoCount = 0;
    var passByLength = 0;
    var passByClass = 'tiny';
    for(var i in response.videos) {
      if(typeof(response.videos[i]['direction']) =='undefined') {
        continue;
      }
      $('#textdirpng'+(parseInt(videoCount)+1)).attr('src',response.videos[i]['arrowSrc']);
      var ck = '';
      if (typeof(response.videos[i].passBy)!=="undefined" && response.videos[i].passBy.length > 0) ck += "<br class='linebreak'><b class="+passByClass+" ><i> Pass by ";
      if(i>0 && typeof(response.videos[i].passBy)!=="undefined") { 
         previousCounts+=passByLength;//response.videos[parseInt(passByIndex)-1].passBy.length 
      };
      if (typeof(response.videos[i].passBy)!=="undefined" && response.videos[i].passBy.length > 0) {
        var temp = vidteq.utils.buildDiveIn(
          vidteq.utils.buildDiveInArray([1,2,4,6,8,10,12,14,16,18],0,0,response.videos[i].passBy.length-1),
          response.videos[i].passBy,
          {id:videoCount,visible:true,depth:0,runId:previousCounts},
          this.createDirPassByDITopHtml,
          this.createDirPassBy);
        //temp.fullHtml = "<div ><br><a class='simple' style='text-align:center;padding-left:20px;padding-bottom:3px;'>Pass by following Points Of Interests (POI).<br></a></div>"+temp.fullHtml;
        ck += temp.fullHtml;
      }
      if (typeof(response.videos[i].passBy)!=="undefined" && response.videos[i].passBy.length > 0) {
        passByLength = response.videos[i].passBy.length;
        ck += "</i></b>";
        //response.videos[i]['passByContent'] = ck;
        //console.log('pass by ',ck);
        $('#textdirrow'+(parseInt(videoCount)+1)).find('.passByHtmlContainer').after(ck);
      }
      //vidDir.push(response.videos[i]);
      videoCount++;
    }
  }
}

vidteq.fvt.prototype.generateTextDirections = function(response) {
  var innerHTML='';
  var previousCounts=0;
  var classPNG=(vidteq.MSIE6)?"class='pngfixclass'":"''";	
  if(typeof(response.vid) == 'undefined') { 
    var vidDir = []; 
    var videoCount = 0;
    var passByLength = 0;
    for(var i=0;i<response.videos.length;i++)  {
      if(typeof(response.videos[i]['direction']) =='undefined') {
        continue;
      }
      response.videos[i]['classPNG'] = classPNG;
      var mainClass = 'plain';
      var passByClass = 'tiny';
      var txtDirClassName = 'textdir';
      if(vidteq.gui.topBarUI||vidteq.gui.sideBarUI) { 
        mainClass = 'plain1';
        passByClass = 'tiny1';
        txtDirClassName = 'textdir1';
      }
      response.videos[i]['mainClass'] = mainClass;
      response.videos[i]['passByClass'] = passByClass;
      response.videos[i]['txtDirClassName'] = txtDirClassName;
      response.videos[i]['directionMod'] = response.videos[i].direction.replace(/(Go.*[Meters|Kms]\.)/,'<span class="distance">$1</span>');

      var ck = '';
      if (typeof(response.videos[i].passBy)!=="undefined" && response.videos[i].passBy.length > 0) ck += "<br class='linebreak'><b class="+passByClass+" ><i> Pass by ";
      if(i>0 && typeof(response.videos[i].passBy)!=="undefined") { 
         previousCounts+=passByLength;//response.videos[parseInt(passByIndex)-1].passBy.length 
      };
      if (typeof(response.videos[i].passBy)!=="undefined" && response.videos[i].passBy.length > 0) {
        var temp = vidteq.utils.buildDiveIn(
          vidteq.utils.buildDiveInArray([1,2,4,6,8,10,12,14,16,18],0,0,response.videos[i].passBy.length-1),
          response.videos[i].passBy,
          {id:videoCount,visible:true,depth:0,runId:previousCounts},
          this.createDirPassByDITopHtml,
          this.createDirPassBy);
        //temp.fullHtml = "<div ><br><a class='simple' style='text-align:center;padding-left:20px;padding-bottom:3px;'>Pass by following Points Of Interests (POI).<br></a></div>"+temp.fullHtml;
        ck += temp.fullHtml;
      }
      if (typeof(response.videos[i].passBy)!=="undefined" && response.videos[i].passBy.length > 0) {
        passByLength = response.videos[i].passBy.length;
        ck += "</i></b>";
        response.videos[i]['passByContent'] = ck;
      }
      vidDir.push(response.videos[i]);
      videoCount++;

    } 
    $('#textDirections').html($('#textDirectionsTemplate').tmpl({vidDir:vidDir}));
    //$('#directions_div').html($('#textDirectionsTemplate').tmpl({vidDir:vidDir}));
    //$('#textDirections').html($('#textDirectionsInnerTemplate').tmpl({vidDir:vidDir}));
    this.noOfTextDirections = videoCount;
    return;
  }
  for(var i=0;i<response.vid.length;i++)  {
    var classPNG=(vidteq.MSIE6)?"class='pngfixclass'":"''";	
    var cameraDPPopup,whichArrow,tempEmail;
    innerHTML+="<tr id='textdirrow"+(i+1)+"' ><td>"+
      //"<div class='dirimage-left-wrapper'><img id='dirimage-left"+(i+1)+"' src='' style='display:none;'/></div>"+
      "<div id='dirdiv"+(i+1)+"' class='dirdiv' style='color:white;overflow:visible; vertical-align:center'>";
    innerHTML+="<table cellspacing=0 cellpadding=0><tr>";
    innerHTML+="<td class='textdirpng-warpper' width=30 height=24 align='center'><img id='textdirpng"+i+"' src='"+response.vid[i].arrowSrc+"' style='cursor:text' "+classPNG+" /></td>";
    var className='plain';
    //if(this.gui.topBarUI) { className='plain1'; }
    if(vidteq.gui.topBarUI||vidteq.gui.sideBarUI) { className='plain1'; }
    innerHTML+="<td class='"+className+"' align='center' width=15>"+(i+1)+".</td>";
    var ck = '';
    className='tiny';
    //if(this.gui.topBarUI) { className='tiny1'; }
    if(vidteq.gui.topBarUI||vidteq.gui.sideBarUI) { className='tiny1'; }
    if (typeof(response.vid[i].passBy)!=="undefined" && response.vid[i].passBy.length > 0) ck += "<br class='linebreak'><b class="+className+" ><i> Pass by ";
    if(i>0 && typeof(response.vid[i].passBy)!=="undefined") { previousCounts+=response.vid[i-1].passBy.length };
    //for(var j=0;j<response.vid[i].passBy.length;j++) {
    //  if (j!=0) ck+=", ";
    //  var className='poi';
    //  if(typeof(__experimentalUI)!='undefined' && __experimentalUI) className='poi1';
    //  ck+="<a href=javascript:void(0) class="+className+" onclick='vidteq.mboxObj.callPopupOneImage("+(j+previousCounts)+")'>"+response.vid[i].passBy[j].name+"</a>";
    //}
      if (typeof(response.vid[i].passBy)!=="undefined" && response.vid[i].passBy.length > 0) {
        var temp = vidteq.utils.buildDiveIn(
          vidteq.utils.buildDiveInArray([1,2,4,6,8,10,12,14,16,18],0,0,response.vid[i].passBy.length-1),
          response.vid[i].passBy,
          {id:i,visible:true,depth:0,runId:previousCounts},
          this.createDirPassByDITopHtml,
          this.createDirPassBy);
        //temp.fullHtml = "<div ><br><a class='simple' style='text-align:center;padding-left:20px;padding-bottom:3px;'>Pass by following Points Of Interests (POI).<br></a></div>"+temp.fullHtml;
        ck += temp.fullHtml;
      }
    className='textdir';
    //if(this.gui.topBarUI) { className='textdir1'; }
    if(vidteq.gui.topBarUI||vidteq.gui.sideBarUI) { className='textdir1'; }
    //innerHTML+="<td class='textdir-wrapper'><a id=textdir"+(i+1)+" onfocus='this.blur();' class='"+className+"' href='javascript:void(0);' onclick='javascript:vidteq.fvtObj.textSync.apply(vidteq.fvtObj,["+i+",true]);'>"+response.vid[i].direction+"</a>";
    innerHTML+="<td class='textdir-wrapper'><a id=textdir"+(i+1)+" onfocus='this.blur();' class='"+className+"' href='javascript:void(0);' onclick='javascript:vidteq.fvtObj.textSync.apply(vidteq.fvtObj,["+i+",true]);'>"+response.vid[i].direction.replace(/(Go.*[Meters|Kms]\.)/,'<span class="distance">$1</span>')+"</a>";
    if (typeof(response.vid[i].passBy)!=="undefined" && response.vid[i].passBy.length > 0) {
      ck += "</i></b>";
      innerHTML+=ck;
    }
    innerHTML+="</td>";
    // No support for db anmore
    //for(var j in response.imgData) {
    //  if(response.imgData[j].dpRoadName) {
    //    if(response.imgData[i].imgIndex == vidteq.mboxObj.syncMapPoints[i]) {
    //      innerHTML+="<td width=45 align='center'><img src='"+vidteq.imgPath.camera+"' style='cursor:pointer' height='16' href='javascript:void(0)' onClick='vidteq.mboxObj.callPopupOneImage("+i+")' /></td>";
    //    }
    //  }
    //}
    innerHTML+='<td class="dirimage-wrapper" width="45" align="center"><img id="dirimage'+(i+1)+'" src="" style="display:none" /></td>';
    innerHTML+="</tr></table></div><hr class='vidline'/></td></tr>";
  }
  this.noOfTextDirections = response.vid.length;
  return innerHTML;
}

vidteq.fvt.prototype.getStartEndData = function(srf) {
  var which = srf.srfType;
  var data = {};
  data.which = which;
  //data.whichLocation = ioAreaObj.preReqStart;
  data.whichLocation = srf.reqSeed;
  data.sORe = (which=='location') ? 'Location' : 
              (which=='startAddress') ? 'Source' :
              (which=='endAddress') ? 'Destination' : 'Unknown';
  //data.eORs = (which=='location') ? 'Location' : 
  //            (which=='startAddress') ? 'Destination' :
  //            (which=='endAddress') ? 'Source' : 'Unknown';
  //data.startOrEnd = (which=='location') ? ioAreaObj.preReqStart : 
  //                  (which=='startAddress') ? ioAreaObj.preReqStart :
  //                  (which=='endAddress') ? ioAreaObj.preReqEnd : 'Unknown';
  data.startOrEnd = srf.reqSeed;
  //data.endOrStart = (which=='location') ? ioAreaObj.preReqStart : 
  //                  (which=='startAddress') ? ioAreaObj.preReqEnd :
  //                  (which=='endAddress') ? ioAreaObj.preReqStart : 'Unknown';
  data.startCall = (which=='location') ? "ioAreaObj.showSrf.apply(ioAreaObj,[ioAreaObj.srfResponse,'location'])" : 
                   (which=='startAddress') ? "ioAreaObj.showSrf.apply(ioAreaObj,[ioAreaObj.srfResponse,'startAddress'])" :
                    (which=='endAddress') ? "ioAreaObj.showSrf.apply(ioAreaObj,[ioAreaObj.srfResponse,'endAddress'])" : "ioAreaObj.showSrf.apply(ioAreaObj,[ioAreaObj.srfResponse,'location'])";
  data.endCall = (which=='location') ? "ioAreaObj.showSrf.apply(ioAreaObj,[ioAreaObj.srfResponse,'location'])" : 
                   (which=='startAddress') ? "ioAreaObj.showSrf.apply(ioAreaObj,[ioAreaObj.srfResponse,'endAddress'])" :
                    (which=='endAddress') ? "ioAreaObj.showSrf.apply(ioAreaObj,[ioAreaObj.srfResponse,'startAddress'])" : "ioAreaObj.showSrf.apply(ioAreaObj,[ioAreaObj.srfResponse,'location'])";
  return data;
}

vidteq.fvt.prototype.getStartEndObj = function(srf) {
  var which = srf.parentType;
  var data = {};
  data.which = which;
  //data.whichLocation = ioAreaObj.preReqStart;
  data.whichLocation = srf.reqSeed;
  data.sORe = (which=='location') ? 'Location' : 
              (which=='startAddress') ? 'Source' :
              (which=='endAddress') ? 'Destination' : 'Unknown';
  //data.eORs = (which=='location') ? 'Location' : 
  //            (which=='startAddress') ? 'Destination' :
  //            (which=='endAddress') ? 'Source' : 'Unknown';
  //data.startOrEnd = (which=='location') ? ioAreaObj.preReqStart : 
  //                  (which=='startAddress') ? ioAreaObj.preReqStart :
  //                  (which=='endAddress') ? ioAreaObj.preReqEnd : 'Unknown';
  data.startOrEnd = srf.reqSeed;
  //data.endOrStart = (which=='location') ? ioAreaObj.preReqStart : 
  //                  (which=='startAddress') ? ioAreaObj.preReqEnd :
  //                  (which=='endAddress') ? ioAreaObj.preReqStart : 'Unknown';
  data.startCall = (which=='location') ? "ioAreaObj.displayResults.apply(ioAreaObj,['location',ioAreaObj.response])" : 
                   (which=='startAddress') ? "ioAreaObj.displayResults.apply(ioAreaObj,['startAddress',ioAreaObj.response])" :
                    (which=='endAddress') ? "ioAreaObj.displayResults.apply(ioAreaObj,['endAddress',ioAreaObj.response])" : "ioAreaObj.displayResults.apply(ioAreaObj,['location',ioAreaObj.response])";
  data.endCall = (which=='location') ? "ioAreaObj.displayResults.apply(ioAreaObj,['location',ioAreaObj.response])" : 
                   (which=='startAddress') ? "ioAreaObj.displayResults.apply(ioAreaObj,['endAddress',ioAreaObj.response])" :
                    (which=='endAddress') ? "ioAreaObj.displayResults.apply(ioAreaObj,['startAddress',ioAreaObj.response])" : "ioAreaObj.displayResults.apply(ioAreaObj,['location',ioAreaObj.response])";
  return data;
}

vidteq.fvt.prototype.clearRouteAndSrf = function () {
  $('#resultsdiv').unbind('scroll');
  this.globalTextIndex=-1;
  if (this.playerActive) {
    this.playCustomVideo("B|Clearing the video","clear.flv",4,"ClearVideo","clear");
  }
  this.theScroll = [];
  if (typeof(vidteq.aD) != 'undefined' && (
        vidteq.aD.urlId == "Artha_Brickfield_Gempark" || 
        vidteq.aD.urlId =="Artha_NEO" || this.gui.sideBarUI))
    document.getElementById('locadivinside').innerHTML='';
  else
    document.getElementById('locadivinside').innerHTML=vidteq.fvtObj.clearFvtContent;
  if( typeof($('#directions_div')[0])!=="undefined") { $('#directions_div')[0].style.backgroundColor='white'; }
  if (typeof(vidteq.aD) != 'undefined' && 
      (vidteq.aD.urlId == "Artha_Brickfield_Gempark" || 
       vidteq.aD.urlId =="Artha_NEO" || 
       this.gui.sideBarUI)) { 
    document.getElementById("directions_div").innerHTML= '';
    document.getElementById("videoSummary").innerHTML= '';
  } else {
    document.getElementById("directions_div").innerHTML='<div style=background-color:white>'+vidteq.fvtObj.clearFvtContent+'</div>';
  }
}

vidteq.fvt.prototype.playCustomVideo =function (caption,fileName,duration,roadname,roadtext,customVideo) {
  var playlist = {};
  playlist.img = [];
  playlist.vid = [];
  playlist.vid[0] = {};
  playlist.vid[0].cap =caption;
  playlist.vid[0].video = {};
  if(typeof(this.gui.html5VideoParams) != 'undefined' && (!this.gui.flashPlayer || this.gui.singlePlayer)){ 
    fileName = fileName.replace(/.flv/gi,this.gui.html5VideoParams.extension);    
  }
  playlist.vid[0].video.src = fileName;
  playlist.vid[0].video.duration = duration;
  playlist.vid[0].video.roadname = roadname;
  playlist.NumVvid = [];
  playlist.NumVvid[0] = 0;
  if(typeof(ioAreaObj)!=="undefined") {
    try { playlist.zeroPath = ioAreaObj.response.zeroPath;  }
    catch (e) {}    // TBD not sure what 
  }
  playlist.sourceHandle = 0;
  playlist.endHandle = duration;
  playlist.highBwUrl = vidteq.cfg.videoUrl;
  playlist.lowBwUrl = (typeof(vidteq.cfg.videoUrlLb) != 'undefined')?vidteq.cfg.videoUrlLb:'';
  if(customVideo) {
      playlist.highBwUrl=vidteq.cfg.highBwcustomVideoUrl;
      playlist.lowBwUrl=vidteq.cfg.lowBwcustomVideoUrl;
  }
  var roadNamesSwf =new Array();
  roadNamesSwf[0] = roadtext;
  var durationSwf=new Array();
  durationSwf[0] = 0;
  durationSwf[1] = duration;
  if (this.gui.io) { this.gui.io.response = playlist; }
  else {
    ioAreaObj.response = playlist;
  }
  if(this.gui.appMode) { 
    setTimeout(function () {
      StageWebViewBridge.call('handleStageGetRoute', null, JSON.stringify(playlist));
    },500);
    if (this.gui.handheld) {
      // This is different from ipad because handheld menu is full screen
      setTimeout(function () {
        StageWebViewBridge.call('launchCollapseVideoPort', null, 1000);
      },500);
      }
    return;
  }
  document.getElementById(this.videoDom).innerHTML = '';
  document.getElementById(this.videoDom).innerHTML=(typeof(this.vidPlayerHTML)==undefined)?'':this.vidPlayerHTML;
  this.playerActive = false;
}

vidteq.fvt.prototype.changeTextDirectionIfNeeded = function (index) {
  var stringSplit=index.split(":");
  var parentIndex=stringSplit[0];
  var nearestIndex = 0;
  for(var i=0;i<vidteq.mboxObj.syncMapPoints.length;i++) {  
    if (vidteq.mboxObj.syncMapPoints[i] > parentIndex) { break; }
    nearestIndex = i;
  }
  if (nearestIndex != this.globalTextIndex) { 
    this.changeTextDirection(nearestIndex); 
  }
}

vidteq.fvt.prototype.changeTextDirection = function(textIndex) {
  textIndex = parseInt(textIndex);
  if(this.gui.appMode) { 
    StageWebViewBridge.call('stageCallStatefn', null, textIndex); 
  }
  if (this.globalTextIndex==textIndex) { return; }
  this.globalTextIndex=textIndex; 
  var that = this;
  var c = 'white';
  if( this.gui.topBarUI || this.gui.sideBarUI ) { c = 'black'; }
  $('#directions_div').find('div[id^=dirdiv]').each(function () {
    var el_dirdiv = $(this);
    $(this).find('a[id^=textdir]').each(function () { 
      $(this).css({'font-weight':'normal',color:c});
    });
    $(this).find('img[id^=dirimage]').each(function () {
      $(this).attr('src','');$(this).css('display','none');
      el_dirdiv.removeClass("dirdiv-active");
    });
  });
  var c = '#FFFF33';
  if( this.gui.topBarUI || this.gui.sideBarUI ) { c = 'blue'; }
  $('#directions_div').find('div[id=dirdiv'+(textIndex+1)+']').each(function () {
    var el_dirdiv = $(this);
    $(this).find('a[id=textdir'+(textIndex+1)+']').each(function () {
      $(this).css({'font-weight':'bold',color:c}); 
    });
    $(this).find('img[id=dirimage'+(textIndex+1)+']').each(function () {
      $(this).attr('src',vidteq.imgPath.arrow);$(this).css('display','block');
      el_dirdiv.addClass("dirdiv-active");
    });
  });
  this.rollTo(textIndex);
}

vidteq.fvt.prototype.undoExpandMapPopVideo = function() {
  var elementVar=document.getElementById('videoTd');
  elementVar.className='videosync';
  elementVar.style.position='relative';
  elementVar.style.left='';
  elementVar.style.top='';
  elementVar.style.zIndex='';
  document.getElementById('VideoPlayerDiv').innerHTML=(this.vidPlayerHTML==undefined)?'':this.vidPlayerHTML;
  document.getElementById('maxvideo').style.display="none";
  if(vidteq.mboxObj.routeActive) {
    this.expaCollapse=true;	
    this.gECIndex = this.globalTextIndex;
  } else {
    document.getElementById('VideoPlayerDiv').innerHTML=''; // TBD
  }
  if(document.getElementById('videoTd').style.visibility=='hidden') {
    this.getBackVideoTd(this);
  }
}

vidteq.fvt.prototype.expandMapPopVideo = function() {
  var elementVar=document.getElementById('videoTd');
  //elementVar.style.borderLeft="0px solid white";
  elementVar.className='popped';
  vidteq.Drag.init(elementVar);
  elementVar.style.borderLeft.colorValue='#FFCC00';
  elementVar.style.position='absolute';
  elementVar.style.left=(document.body.offsetWidth/2)-240+"px";
  if(typeof(wowMode) != 'undefined' && wowMode) { elementVar.style.top = "0px"; }
  else elementVar.style.top=(document.body.offsetHeight/2)-175+"px";
  elementVar.style.zIndex=40000;
  ioAreaObj.toggleButtons({"minvideo":true});
  document.getElementById('maxvideo').style.display="none";
  if(vidteq.mboxObj.routeActive) {
    this.expaCollapse=true;	
    this.gECIndex = this.globalTextIndex;
  } else {
    document.getElementById('VideoPlayerDiv').innerHTML='';
    this.clearVideoTd();
  }	
}

vidteq.fvt.prototype.clearVideoTd = function() {
  this.expaCollapse = true;	
  this.gECIndex = this.globalTextIndex;
  document.getElementById('VideoPlayerDiv').innerHTML = '';
  document.getElementById('videoTd').style.visibility = 'hidden';
  document.getElementById('maxvideo').style.display = "block";
  document.getElementById('maxvideo').onclick = function() {
    vidteq.fvtObj.getBackVideoTd.apply(vidteq.fvtObj,['maxvideo']);
  };
}

vidteq.fvt.prototype.getBackVideoTd = function(caller) {
  document.getElementById('VideoPlayerDiv').innerHTML = ( this.vidPlayerHTML? this.vidPlayerHTML : '' );
  document.getElementById('videoTd').style.visibility = 'visible';
  document.getElementById('maxvideo').style.display = 'none';
  if(caller!='govidoption' && caller!='mapexpand') { // caller is maxvideo
    this.expaCollapse = true;	// TBD
    this.gECIndex = this.globalTextIndex;
    //swfAwake=setInterval(function () { textSync(expandIndex); },500);
  }
}

vidteq.fvt.prototype.swfready = function() {
		//vidteq.fvtObj.swfstate=true;
/*	if(vidteq.fvtObj.myvideo) { 
		var	lPI=gui.mbox.getlPI(vidteq.fvtObj.latLon,vidteq.fvtObj.carPathArray);
		console.log('swf is ready and lPI is'+lPI);
		return lPI;
		//setTimeout(function(){vidteq.fvtObj.getVideoObj(vidteq.fvtObj.videoSwf).playVideo(lPI); delete vidteq.fvtObj.myvideo;},8000);
	}else 
		return 0;*/
  if(this.expaCollapse) {
    if (this.expaCollapseGate) {
      this.expaCollapse=false;	
    }
    this.textSync(this.gECIndex,false);  // TBD why is it false ?
    return this.gECIndex;
  } else {
    return 0;
  }
}

// Following sections are for handhelds specifically

vidteq.fvt.prototype.clickedTextDir = function () {
  var l = {allHtml:$('#directions_div').html()};
  if (this.gui.topBarUI||this.gui.sideBarUI) { 
    vidteq.utils.drapeSheer('divTextDir');
    var that = this;
    vidteq.utils.createPopup({
      html:l,
      funcList:l.funcList,
      overflowDiv:'smsInnerDiv',
      headerDiv:'smsHeaderDiv',
      margins:(5+4+2)
    },{name:'divTextDir',factor:2});
    return;
  }
  vidteq.utils.createPopupGeneric(2,undefined,undefined,l);
}

vidteq.fvt.prototype.attachVideoDivClick = function(){
  this.videoMode = 'hide';
  var that = this;
  var clicks = [];
  if ($('#'+this.videoDom).data('events')) {
    clicks = $('#'+this.videoDom).data('events').mousedown;
  }
  if (!clicks.length) {
    $('#'+this.videoDom).mousedown(function(evt){
      if(that.videoMode == 'hide'){
        that.maximizeVideo();
        that.videoMode = 'show';
      } else {
        that.minimizeVideo();
        that.videoMode = 'hide';
      }
    });
  }
}

vidteq.fvt.prototype.minimizeVideo = function (){
  //$('#text_holder').show();
  //this.gui.mbox.pushControlsUp();
  this.gui.mbox.maxView=false;
  this.pushVideoDom();
}

vidteq.fvt.prototype.pushVideoDom = function (){
  var that = this;
  this.expaCollapse = true;
  this.expaCollapseGate = false;
  this.gECIndex = this.globalTextIndex;
  $('#'+that.videoDom).find('embed').each(function () {
    $(this).height(that.initVideoH);
    $(this).width(that.initVideoW);
  });

  $('#'+this.dom).height(0);
  $('#'+this.dom).hide();
  this.gui.mbox.carPopup.lonlat = new OpenLayers.LonLat(this.gui.mbox.carPoint.geometry.x,this.gui.mbox.carPoint.geometry.y);
  this.gui.mbox.map.addPopup(this.gui.mbox.carPopup);
  $('#'+this.videoDom).css({width:this.initVideoW+'px',height:this.initVideoH+'px'});
  $('#videoPopupContainer').append($('#'+this.videoDom));
  $('#minimizeLink').css('display','none');

  //remove carpop up was erasing the background of fvtpopupdiv
  var boxImage = { url:vidteq.imgPath.refBox3, cornerW:10, cornerH:10, boxW:510, boxH:378, offsetW:0, offsetH:0 };
  vidteq.utils.boxify(boxImage,'fvtpopupdiv_contentDiv',{lt:1,rt:1,lb:1,rb:1},1);
  this.attachVideoDivClick();
  try { 
    this.getVideoObj(this.videoSwf).playVideo(0);
  } catch (e) { debugPrint('playing at error');}; 
  this.installVideoSeekWaiter();
}


vidteq.fvt.prototype.getHandheldWAndH = function() {
  var w = this.gui.mbox.getPopupWidth(screen.width);
  var h = this.gui.mbox.getPopupHeight(screen.height/2);
  if(this.gui.mbox.alignCenter){
    h = this.gui.mbox.getPopupHeight(screen.height);
  }
  return {w:w,h:h};
}

vidteq.fvt.prototype.pullAndHideVideoDom = function() {
  if(this.videoMode == 'show'){
    this.videoMode = 'hide';
  } else {
    this.pullVideoDom(false);
  }
  $('#'+this.dom).hide();
  this.showing = false;
}

vidteq.fvt.prototype.pullVideoDom = function(max) {
  this.expaCollapse = true;
  this.expaCollapseGate = false;
  this.gECIndex = this.globalTextIndex;
  $("#"+this.dom).append($('#'+this.videoDom));
  //var wH = this.getHandheldWAndH();
  var wH = vidteq.utils.getHandheldWAndH();
  if(this.gui.mbox.alignCenter){
    $("#"+this.dom).css('width','100%');
    $("#"+this.dom).css('margin','auto');
    $("#"+this.videoDom).css('margin','auto');
    $("#"+this.dom+" >div[id=routediv]").css('margin','auto');
    $("#"+this.dom+" >div[id=routediv]").css('height',screen.height - wH.h);
    $("#"+this.dom+"").css({ background: 'rgba(153,179,204,0.6) '});
  }

  $('#'+this.videoDom).find('embed').each(function () {
    $(this).width(parseInt(wH.w)-10);
    $(this).height(parseInt(0.8*wH.h));
  });
  $("#"+this.videoDom).width(wH.w);
  $("#"+this.videoDom).height(parseInt(0.8*wH.h));
  $("#"+this.dom+" >div[id=routediv]").hide();
  $("#"+this.dom+" >div[id=comtab]").hide()
  $("#"+this.dom+" >div[id=comtab]").css("text-align","center");
  $('#'+this.dom).css('position','absolute');
  this.installVideoSeekWaiter();

  if(max){
      $('#minimizeLink').css('top',parseInt(0.8*wH.h -1)+'px');
      $('#minimizeLink').css('z-index','10001');
  }
}

vidteq.fvt.prototype.installVideoSeekWaiter = function(){
  var that = this;
  var checkFunc = function () {
    var vObj = that.getVideoObj(that.videoSwf);
    if(vObj && (typeof(vObj.playVideo))=='function') {
      return true;
    }
    return false;
  }
  var fireFunc = function () {
    that.expaCollapse = false;
    that.expaCollapseGate = true;
    that.gECIndex = 0;
  }
  var w = new vidteq.utils.waitAndFire (checkFunc,fireFunc,fireFunc);
  w.maxIter = 20;
}

vidteq.fvt.prototype.maximizeVideo = function(){
  this.pullVideoDom(true);
  //this.gui.mbox.pushControlsDown();
  this.gui.mbox.maxView=true;

  $('#'+this.videoDom).unbind('mousedown');  
  $("#"+this.dom).css({zIndex:20000,height:'0px'});
  
  $('#minimizeLink').css('display','block');
  var clicks = [];
  if ($('#minimizeLink').data('events')) {
    clicks = $('#minimizeLink').data('events').click;
  }
  if (!clicks.length) {
    var that = this;
    $('#minimizeLink').click(function (evt) { that.minimizeVideo(); });
  }

  this.latLon = this.gui.mbox.carPoint.geometry;
  this.carPathArray=gui.mbox.carPathArray;
  this.gui.mbox.map.removePopup(this.gui.mbox.carPopup);
  $('#'+this.dom).show();
  var that = this;
  var wH = vidteq.utils.getHandheldWAndH();
  $("#"+this.dom).animate(
    { height:parseInt(0.8*wH.h)},
    { easing:'linear',duration : 500,
      complete:function() {
      try { 
        var that = this;
      } catch (e) { debugPrint('caught an e');};   
    }
  });
}
vidteq.fvt.prototype.launchFullVideo = function() {
  $('#VideoPlayerDiv').css('visibility','visible');
  this.pullVideoDom(true);
}
vidteq.fvt.prototype.launchPopupVideo = function() {
  var fvtid = this.dom;
  $('#'+this.videoDom).css({width:this.initVideoW+'px',height:this.initVideoH+'px'});
  this.gui.mbox.createCarPopup();
  //this.gui.mbox.updatePopupSize();  // I dont think it is needed TBD
  //vidteq.fvtObj.hideNew();
  $("#"+fvtid+" >div[id=comtab]").hide();
  this.attachVideoDivClick();
}

vidteq.fvt.prototype.launchPopupWebVideo = function() {
  var w = this.gui.embed.vidWidth;
  var h = this.gui.embed.vidHeight;
  
  if (this.detach) w = parseInt(parseInt(w)*1.75);
  $('#'+this.videoDom).css({width:w,overflow:'hidden'});
  $('#videoPopupContainerMine').show();
  $('#videoPopupContainerMine').css({width:w,height:h+60,left:50,top:100,'z-index':100000,display:'none'});
  $(document).ready(function() {
    $('#videoPopupContainerMine').fadeIn(3000);
  });
  $('#dragMe').css({cursor: 'move','min-height':25} );
  $('#minV').css('cursor', 'pointer' );
  
  $('#minV').click(function() {
     var p = $('#videoPopupContainerMine').position();
     var l =parseInt($(window).width()) - p.left - 24;
     var t =p.top;
     $('#maxV').data('left',l);
     $('#maxV').data('top',t);
     $('#videoPopupContainerMine').animate({
       width: 'toggle',
       height: 'toggle',
       left: '+='+l+'px',
       top : '-='+t+'px'
     },3000, function() {
     });

     $('#maxV').fadeIn(5000);
  });
  var boxImage = { url:vidteq.imgPath.refBox3, cornerW:10, cornerH:10, boxW:510, boxH:378, offsetW:0, offsetH:0 };
  vidteq.utils.boxify(boxImage,'videoPopupContainerMine',{smoothCorner:1},0);
}

vidteq.fvt.prototype.launchPopupWebVideo3D = function() {
  var w = 200;
  var h = 200;
  
  $('#'+this.videoDom).css({width:w,overflow:'hidden'});
  $('#videoPopupContainerMine').show();
  $('#videoPopupContainerMine').css({width:w,height:h,left:940,top:10,'z-index':400000,display:'none'});
  $(document).ready(function() {
    $('#videoPopupContainerMine').fadeIn(3000);
  });
  $('#dragMe').css({cursor: 'move','min-height':25} );
  $('#minV').css('cursor', 'pointer' );
  
  $('#minV').click(function() {
     var p = $('#videoPopupContainerMine').position();
     var l =parseInt($(window).width()) - p.left - 24;
     var t =p.top;
     $('#maxV').data('left',l);
     $('#maxV').data('top',t);
     $('#videoPopupContainerMine').animate({
       width: 'toggle',
       height: 'toggle',
       left: '+='+(l-100)+'px',
       top : '-='+(t-10)+'px'
     },3000, function() {
     });

     $('#maxV').fadeIn(5000);
  });
  //var boxImage = { url:vidteq.imgPath.refBox3, cornerW:10, cornerH:10, boxW:510, boxH:378, offsetW:0, offsetH:0 };
  //vidteq.utils.boxify(boxImage,'videoPopupContainerMine',{smoothCorner:1},0);
  $('#videoPopupContainerMine').corner();
  var fvtid = this.dom;
  $('#'+fvtid).show();
  $('#directions_div').hide();
}

vidteq.fvt.prototype.showHandheld = function (inMode) {
  var mode = this.mode;
  if (typeof(inMode) != 'undefined' && typeof(this.childDom[inMode]) != 'undefined') { mode = inMode; }
  var startWidth = 0;
  if ( mode == this.mode ) { 
    if ($('#'+this.dom).is(':visible') || this.showing ) { return; }  
    // go animate
  } else { // not equal 
    if ( this.showing ) { 
      this.scheduledMode = mode;
      return;
    } else if ($('#'+this.dom).is(':visible')) {
      var modeDoms = this.childDom[this.mode]; 
      var startWidth = parseInt($('#'+modeDoms[0]).css('width'));
    }
  }
  this.showing = true;
  this.mode = mode;
  var modeDoms = this.childDom[mode];
  var refWidth = parseInt($('#'+modeDoms[0]).css('width'));
  $('#'+modeDoms[0]).css('width',startWidth+'px');
  for (var m in this.childDom) {
    var c = this.childDom[m];
    for (var d in c) {
      if (m == mode) { $('#'+c[d]).show(); } 
      else { $('#'+c[d]).hide(); }
    }
  }
  $('#'+this.dom).show();
  if (refWidth == startWidth) { 
    this.showing = false;
    return;
  }
  var refLeft = $(vidteq.mboxObj.map.layerContainerDiv).css('left');
  for (var i in modeDoms) { 
    if (i==0) { continue; } 
    $('#'+modeDoms[i]).hide(); 
  }
  // TBD am I need to set showing false ?
}

vidteq.fvt.prototype.disableFvtFromTo = function (tip) {
  var idName = 'blah';
  if (tip=='start') { idName = 'fvtDirTo_';
  } else if (tip == 'end') { idName = 'fvtDirFrom_'; }
  $('[id^='+idName+']').each(function () { 
    $(this).removeClass('basic');
    $(this).addClass('basicGrey');
    $(this).unbind('click'); 
  });
}

vidteq.fvt.prototype.showPartialMatches = function () {
  $('#landmarks').hide();
  $('#matchResults').css('display','block');
}

vidteq.fvt.prototype.loadMore = function (results) {
  var startIndex = 0;
  var endIndex = 10;
  var allCatItems = results;
  var loadResEntity = allCatItems.slice(startIndex,endIndex);
  var remainResEntity = allCatItems.slice(endIndex,allCatItems.length);
  this.loadPoiImages(loadResEntity,remainResEntity,endIndex); 
}

vidteq.fvt.prototype.loadPoiImages = function (loadResEntity,remainResEntity,endIndex) {  
  var that = this;
  //this.loadEntityCount = 0;
  this.remainResEntity = remainResEntity;
  var callBackFunc = function() {
    if(that.totalLazyImageCount == that.loadEntityCount){
      that.loadMore(that.remainResEntity);
    }
  }
  for(var i in loadResEntity) {
    var poi = new vidteq._poi(loadResEntity[i],this.gui);      
    if(loadResEntity[i].image!= null) {
      var imgCon = poi.getEntityHtmlImage('map','',loadResEntity[i],'fvtImgDiv');
      var img = imgCon.html;
    }
    else var img='';
    $('#fvtImgDiv'+loadResEntity[i]['index']).html(img);      
    
    $('.fvtImgDiv').find('img').each(function() {
      $(this).css({'width':'80px','height':'60px'});
    });
    this.gui.mbox.slideShow(".fvtImgDiv","all","normal");  //other possible alternatives - shuffle
    $(".fvtImgDiv").css({'width':'80px','height':'60px'});    
    if(loadResEntity[i].image!= null) {
      this.loadEntityCount = this.loadEntityCount + 1;
      //this.loadEntityCount = parseInt(loadResEntity[i]['index']) + 1;
      var imgCont = document.getElementById('fvtImgDiv'+loadResEntity[i]['index']);
      if(typeof(imgCont) != 'undefined' && imgCont != null) {
        var myimg = imgCont.getElementsByTagName('img')[0];

        myimg.onload = function () {
          that.totalLazyImageCount = that.totalLazyImageCount + 1;
          callBackFunc();
        }
        myimg.onerror = function () {
          that.totalLazyImageCount = that.totalLazyImageCount + 1;
          callBackFunc();
        }
      }
    }
  }
  //$('.fvtImgDiv').find('img').each(function() {
  //  $(this).css({'width':'80px','height':'60px'});
  //});
  //this.gui.mbox.slideShow(".fvtImgDiv","all","normal");  //other possible alternatives - shuffle
  //$(".fvtImgDiv").css({'width':'80px','height':'60px'});

  //if(remainResEntity.length < 1) { return; }
  ////var that = this;
  ////var loadEntityCount = 0;
  ////$('.fvtImgDiv').find('img').each(function() {
  ////  loadEntityCount = loadEntityCount + 1;
  ////  $(this).load(function() {
  ////    that.totalLazyImageCount = that.totalLazyImageCount + 1;
  ////    console.log(this+ ' loaded');
  ////    // Handler for .load() called.
  ////  });
  ////});
  //console.log('loadEntityCount is ',this.loadEntityCount);
  //var checkFunc = function () {
  //  if(that.totalLazyImageCount == this.loadEntityCount){
  //    return true;
  //  }
  //  return false;
  //}
  //var fireFunc = function () {
  //  that.loadMore(remainResEntity);
  //}
  //var w = new vidteq.utils.waitAndFire (checkFunc,fireFunc);
}

vidteq.fvt.prototype.lazyImageLoader = function (resEntity) {
  this.totalLazyImageCount = 0;
  this.loadEntityCount = 0;
  var that = this;
  var fireFunc = function () {
    that.gui.mbox.tileLoadEnds = false;
    that.loadMore(resEntity);
  }
  this.gui.mbox.mapTileLoadEnd(fireFunc);
  //var checkFunc = function () {
  //  console.log('inside checkFunc');
  //  if('tileLoadEnds' in that.gui.mbox && that.gui.mbox.tileLoadEnds) {
  //    console.log('true con');
  //    return true;
  //  }
  //  console.log('false con');
  //  return false;
  //}
  //var fireFunc = function () {
  //  console.log('inside fireFunc');
  //  that.gui.mbox.tileLoadEnds = false;
  //  that.loadMore(resEntity);
  //}
  //var w = new vidteq.utils.waitAndFire (checkFunc,fireFunc);
}

vidteq.fvt.prototype.showPois = function (results,multi,set,locate,multiple,fromto) {
  var ht='';
  var bg='selected';
  if('firstTimeLoad' in vidteq && vidteq.firstTimeLoad) { 
    //for(var i in results){  
    //  var poi = new vidteq._poi(results[i],this.gui);      
    //  if(results[i].image!= null) {
    //    //var img='<img width=80 height=60 src="'+vidteq.cfg.cloneImageUrl+results[i].image+'"/>';
    //    var imgCon = poi.getEntityHtmlImage('map','',results[i],'fvtImgDiv');
    //    //var img = "<div id='fvtImgDiv' >"+imgCon.html+"</div>";
    //    var img = imgCon.html;
    //  }
    //  else var img='';
    //  $('#fvtImgDiv'+i).html(img);      
    //}
    this.lazyImageLoader(results);
  } else {
    for(var i in results){
      var addCont = '';
      addCont=this.getAddrCont(results[i],i);
      var add='<tr><td colspan="2">'+addCont+'</table></td></tr>';
      if(results[i].address.area != '' && results[i].address.area !=null) var poiarea=', '+results[i].address.area;
      else var poiarea='';
      var poi = new vidteq._poi(results[i],this.gui);      
      if(results[i].image!= null) {
        //var img='<img width=80 height=60 src="'+vidteq.cfg.cloneImageUrl+results[i].image+'"/>';
        var imgCon = poi.getEntityHtmlImage('map','',results[i],'fvtImgDiv');
        var img = "<div id='fvtImgDiv' >"+imgCon.html+"</div>";
      }
      else var img='';
      if(i!=0) bg=''; 
      var toPath= 'javascript:void(0)';var fromPath='javascript:void(0)';
      var toId= 'fvtDirFrom_'+i;var fromId='fvtDirTo_'+i;
      var resultAddName = results[i].address.name+poiarea.replace('/\'/',"");
      if('pathPre' in vidteq) {
        toPath = vidteq.pathPre+'directions/'+vidteq.cfg.city+'/Direction-To-'+resultAddName+'---'+results[i].geom;
        fromPath = vidteq.pathPre+'directions/'+vidteq.cfg.city+'/Direction-From-'+resultAddName+'---'+results[i].geom;
        toId= "";fromId="";
      }
      if(multiple){
        if(fromto==0){ 
          var tdtext='<td colspan="2" class="myTd"><a class="smaller" href="javascript:void(0)" value="'+i+'" id="fvtDirFrom_'+i+'">Directions From</a></td>'; 
          //var tdtext='<td colspan="2" class="myTd"><a class="smaller" href="'+fromPath+'" value="'+i+'" id="'+fromId+'">Directions From</a></td>'; 
        } else {
          var tdtext='<td colspan="2" class="myTd"><a class="smaller" href="javascript:void(0)" value="'+i+'" id="fvtDirTo_'+i+'">Directions To</a></td>'; 
          //var tdtext='<td colspan="2" class="myTd"><a class="smaller" href="'+toPath+'" value="'+i+'" id="'+toId+'">Directions To</a></td>'; 
        }
        var lt='<tr><td class="myTd"><a class="smaller" href="javascript:void(0)" value="'+i+'"id="more'+i+'">More ></a></td><td style="float:right;cursor:pointer;"onclick="javascript:vidteq.mboxObj.callPopupLocation.apply(vidteq.mboxObj,['+i+'])">'+img+'</td></tr>'+add+'<tr></tr><tr>'+tdtext+'</tr>';      
      }else {
        //var lt='<tr><td class="myTd"><a class="smaller" href="javascript:void(0)" value="'+i+'"id="more'+i+'">More ></a></td><td style="float:right;cursor:pointer;"onclick="javascript:vidteq.mboxObj.callPopupLocation.apply(vidteq.mboxObj,['+i+'])">'+img+'</td></tr>'+add+'<tr><td class="myTd"><a class="smaller" href="javascript:void(0)" value="'+i+'" id="fvtDirFrom_'+i+'">Directions from</a></td><td><a class="smaller" href="javascript:void(0)" value="'+i+'" id="fvtDirTo_'+i+'">Directions to</a></td></tr>';
        var lt='<tr><td class="myTd"><a class="smaller" href="javascript:void(0)" value="'+i+'"id="more'+i+'">More ></a></td><td style="float:right;cursor:pointer;"onclick="javascript:vidteq.mboxObj.callPopupLocation.apply(vidteq.mboxObj,['+i+'])">'+img+'</td></tr>'+add+'<tr><td class="myTd"><a class="smaller" href="'+fromPath+'" value="'+i+'" id="'+fromId+'">Directions from</a></td><td><a class="smaller" href="'+toPath+'" value="'+i+'" id="'+toId+'">Directions to</a></td></tr>';
      }
      var resCategory = "";
      if(typeof(results[i].category) != 'undefined' && results[i].category != '') {
        resCategory = 'Category: '+results[i].category;
      }
      ht+='<div class="resultDivParent" value="'+i+'"><center><table width="80%"><tr><td colspan="2"><hr></td></tr><tr><td colspan="2" value="'+results[i].geom+'" class="resultDiv '+bg+'">'+results[i].address.name+poiarea+'</td></tr><tr><td colspan="2" class="myTd smallerText">'+resCategory+' </td></tr>'+lt+'</table></div>';
    }
    if(multi){
      if(set==0)
        var mt="<div><center><table width='80%'><tr><td colspan='2'><hr></td></tr><tr><td width='50%'></td><td width='50%' value='0' id='nextPois' class='prevNext' value='"+set+"' style='float:right;'>Next ></td></tr></table>";
      else{
        if(multiple)
          var l=this.fromToPois[fromto].length - 1;
        else
          var l=this.poiresults.length-1;
        if(set==l){
          var mt="<div><center><table width='80%'><tr><td colspan='2'><hr></td></tr><tr><td class='prevNext' id='prevPois' value='"+set+"' width='50%'>&lt; Prev</td><td value='"+set+"'style='float:right;'></td></tr></table>";
        } else{
          var mt="<div><center><table width='80%'><tr><td colspan='2'><hr></td></tr><tr><td class='prevNext' id='prevPois' value='"+set+"' width='50%'>&lt; Prev</td><td  width='50%'class='prevNext' id='nextPois' value='"+set+"'style='float:right;'>Next ></td></tr></table>";
        }
      }
     ht+=mt;
    }
    if(multiple){
      var divs="<div class='resultsdivFromTo' id='resultsDivFrom' value='0'></div>";
      if(set) divs="<div class='resultsdivFromTo' id='resultsDivFrom' value='"+set+"'></div>";
      $('#resultsdivCont').html(divs);
      $('.resultsdivFromTo').html(ht);
      if(fromto==1){
        $('td.fromtotable').removeClass("selected");
        $('td.fromtotable[value=1]').addClass("selected");
      }
    //if(fromto==0){
    //  $('#resultsdivCont').html(table+divs);
    //  //$('#multiTableFrom').html("From("+results.length+")");
    //}
    //else{
    //  //var prevCont= $('#resultsdivCont').html(); TBD WHY DID I ADD THIS?
    //  //var prevCont= $('.fromtotable').html(); 
    //  //$('#resultsdivCont').html(prevCont+divs);
    //  //$('#multiTableTo').html("To("+results.length+")");
    //}
      $('#resultsdivShow').show();
      var that=this;
    //$('.fromtotable').click(function(){
    //  $('.fromtotable').removeClass('selected');
    //  $(this).addClass('selected');
    //  that.gui.mbox.clearMapMarkers();
    //  if($(this).attr('value')=='0'){
    //    //$('#resultsDivFrom').show();
    //    //$('#resultsDivTo').hide();
    //    if(that.fromToPois[0].length<2)
    //      that.gui.mbox.showPois(that.fromToPois[0][0],false,0,false,true,0);
    //    else
    //      that.gui.mbox.showPois(that.fromToPois[0][0],true,0,false,true,0);
    //  } else{
    //    //$('#resultsDivFrom').hide();
    //    //$('#resultsDivTo').show();
    //    //that.gui.mbox.showPois(that.fromToPois[1][0],false,0,false,true,1);
    //    if(that.fromToPois[1].length<2)
    //      that.gui.mbox.showPois(that.fromToPois[1][0],false,0,false,true,1);
    //    else
    //      that.gui.mbox.showPois(that.fromToPois[1][0],true,0,false,true,1);
    //  }
    ////$('#multiTableFrom').html("From("+that.locatorPoints0.length+")");
    ////$('#multiTableTo').html("To("+that.locatorPoints1.length+")");
    //});
    } else{
      $('#resultsdivCont').html(ht);
      $('#resultsdivShow').show();
    }
  }
  //}
  if('firstTimeLoad' in vidteq) { delete vidteq.firstTimeLoad; }
  //vidteq.firstTimeLoad = false;
  //$('#fvtImgDiv .fvtImgDiv').find('img').each(function() {
  $('.fvtImgDiv').find('img').each(function() {
    $(this).css({'width':'80px','height':'60px'});
  });
  this.gui.mbox.slideShow(".fvtImgDiv","all","normal");  //other possible alternatives - shuffle
  $(".fvtImgDiv").css({'width':'80px','height':'60px'});

  var that=this;
  for (var i in results){
    if(!multiple || (multiple && fromto==0)){
      $('#fvtDirFrom_'+i).click(function(){
        var index=$(this).attr('value');
        that.gui.dirFromTo('start',index,'location');
        that.gui.goVid();
      });
    }
    if(!multiple || (multiple && fromto==1)){
      if(!multiple) var source='location'; else var source='endAddress';
      $('#fvtDirTo_'+i).click(function(){
        var index=$(this).attr('value');
        that.gui.dirFromTo('end',index,source);
        that.gui.goVid();
      });
    }
  }
  this.multiple=multiple;this.fromto=fromto;
  $('#nextPois').click(function(){
    var topdiv=document.getElementById('resultsdiv');
    topdiv.scrollTop=0;
    that.gui.mbox.clearMapMarkers();
    var val=$(this).attr('value');
    val++;
    if(that.multiple){
      that.gui.mbox.showPois(that.fromToPois[that.fromto][val],true,val,false,true,that.fromto);
    } else{
      that.gui.mbox.showPois(that.poiresults[val],true,val,false);
    }
  });
  $('#prevPois').click(function(){
    var topdiv=document.getElementById('resultsdiv');
    topdiv.scrollTop=0;
    that.gui.mbox.clearMapMarkers();
    var val=$(this).attr('value');
    val--;
    if(that.multiple){
      that.gui.mbox.showPois(that.fromToPois[that.fromto][val],true,val,false,true,that.fromto);
    } else{
      that.gui.mbox.showPois(that.poiresults[val],true,val,false);
    }
  });
  for(var i in results){
    $('a#more'+i).click(function(){
      var ind=$(this).attr('value');
      if($('#addDiv'+ind).is(':visible')) {
        $('#addDiv'+ind).hide();
        $(this).html('More >');
      } else {
        $('#addDiv'+ind).show();
        $(this).html('Less &lt;');
      }
    });
  }
}

vidteq.fvt.prototype.prepareMultiPoi = function (v,multiple,fromto) {
  var l=v.srf[0].results.length;
  if(!multiple){
    this.poiresults=Array();
    this.poiresults[0]=v.srf[0].results.slice(0,10);
    if( l<=20){
      this.poiresults[1]=v.srf[0].results.slice(10);
    }else{
      this.poiresults[1]=v.srf[0].results.slice(10,20);
      this.poiresults[2]=v.srf[0].results.slice(20);
    }
  }else{
    this.poiresults=Array();
    this.poiresults[0]=v.srf[0].results;
  }  
}
vidteq.fvt.prototype.prepareFromToPois = function (v,fromto) {
  var results=v.srf[fromto].results;
  if(fromto==0){
    this.fromToPois=Array(2);
  } 
  if(results.length == 0)
    this.fromToPois[fromto]=0;
  if(results.length <= 10){
    this.fromToPois[fromto]=Array();
    this.fromToPois[fromto][0]=results;
  }else{
    this.fromToPois[fromto]=Array();
    this.fromToPois[fromto][0]=results.slice(0,10);
    if(results.length <=20){
      this.fromToPois[fromto][1]=results.slice(10);
    }else{
      this.fromToPois[fromto][1]=results.slice(10,20);
      this.fromToPois[fromto][2]=results.slice(20);
    }
  }
  
  if(fromto==0 && results.length > 1){
    this.gui.mbox.clearMapMarkers();
    this.fromShown=true;
    if(results.length<=10)
      this.gui.mbox.showPois(results.slice(0,10),false,0,false,true,fromto);
    else
      this.gui.mbox.showPois(results.slice(0,10),true,0,false,true,fromto);
  }
  if(!this.fromShown && fromto==1){
    this.gui.mbox.clearMapMarkers();
    if(results.length<=10)
      this.gui.mbox.showPois(results.slice(0,10),false,0,false,true,fromto);
    else
      this.gui.mbox.showPois(results.slice(0,10),true,0,false,true,fromto);
  }
}

vidteq.fvt.prototype.preparePoiShow = function (v,locate,multiple,fromto) {
  $('#resultsdivShow').show();
  if(multiple){
    if(fromto==0) this.fromShown=false;
    this.prepareFromToPois(v,fromto);
  //if(fromto==0){
  //  this.locatorPoints0=v.srf[fromto].results.slice(0,10);
  //  this.gui.mbox.clearMapMarkers();
  //  this.gui.mbox.showPois(v.srf[fromto].results.slice(0,10),false,0,locate,multiple,fromto);
  //} else {
  //  this.locatorPoints1=v.srf[fromto].results.slice(0,10);
  //}
  } else {
    if(typeof(this.fromToPois)!='undefined')this.fromToPois.length=0;
    $('#resultsHeadTable').html('');
    if(v.srf[0].results.length <=10) { 
      this.gui.mbox.clearMapMarkers();
      this.gui.mbox.showPois(v.srf[0].results,false,0,locate,null);
    } else {
      this.gui.mbox.clearMapMarkers();
      if(typeof(this.gui.mbox.catHandlerEnabled) != 'undefined' && this.gui.mbox.catHandlerEnabled) {
        this.prepareMultiPoi(v,true,false);
        this.gui.mbox.showPois(this.poiresults[0],false,0,locate,null);
      } else {
        this.prepareMultiPoi(v,false,false);
        this.gui.mbox.showPois(this.poiresults[0],true,0,locate,null);
      }
    }
  }

  if(multiple){
    if(fromto==1 && v.srf[1].results.length > 1) {
      if(this.multihtml) {
        this.multihtml="<b>Source</b> and <b>Destination</b>"; 
        $('#multiTableFrom').html("From ("+v.srf[0].results.length+")");
      } else this.multihtml="<b>Destination</b>";
      $('#multiTableTo').html("To ("+v.srf[1].results.length+")");
      $('#multiFromTo').html(this.multihtml);
    } else if (this.multihtml){
      this.multihtml="<b>Source</b>"; 
      $('#multiTableFrom').html("From ("+v.srf[0].results.length+")");
      $('#multiFromTo').html(this.multihtml);
    }
    if(fromto==0 && v.srf[0].results.length > 1) this.multihtml=true; else this.multihtml=false;
    if(fromto==0){
      var table="<div style='padding:10px;'>There were multiple matches for your <span id='multiFromTo'></span>, please select one:</div><center><table width='80%'><tr><td class='fromtotable selected' value='0' width='50%' id='multiTableFrom'>From</td><td class='fromtotable' value='1'  id='multiTableTo'>To</td></tr></table></center>";
      $('#resultsHeadTable').html(table);
      var that=this;
      $('.fromtotable').click(function(){
        $('.fromtotable').removeClass('selected');
        $(this).addClass('selected');
        that.gui.mbox.clearMapMarkers();
        if($(this).attr('value')=='0'){
          if(that.fromToPois[0].length<2)
            that.gui.mbox.showPois(that.fromToPois[0][0],false,0,false,true,0);
          else
            that.gui.mbox.showPois(that.fromToPois[0][0],true,0,false,true,0);
        } else{
          if(that.fromToPois[1].length<2)
            that.gui.mbox.showPois(that.fromToPois[1][0],false,0,false,true,1);
          else
            that.gui.mbox.showPois(that.fromToPois[1][0],true,0,false,true,1);
        }
      });
    }
  //$('#multiTableFrom').html("From("+this.fromTo.length+")");
  //$('#multiTableTo').html("To("+this.locatorPoints1.length+")");
  //if(this.locatorPoints0.length==1){
  //  this.gui.mbox.clearMapMarkers();
  //  $('.fromtotable[value=1]').click();
  //}
  }
}

vidteq.fvt.prototype.clearResultDiv = function(){
  $('#resultsdivShow').hide();
  $('#resultsdivIntro').show();
}

vidteq.fvt.prototype.noResults = function(){
  var ht="<div style='padding:10px;'>Sorry, no results found</div>";
  $('#resultsdivCont').html(ht);
  $('#resultsdivShow').show();
}

vidteq.fvt.prototype.showSearchArea = function(results,strData,centArray){
  var data=new Object();
  data.strings=strData;
  data.centers=centArray;
  $('#resultsdiv').data('data',data);
  if('firstTimeLoad' in vidteq) { 
    delete vidteq.firstTimeLoad; 
  } else {
    var ht='';
    var bg='selected';
    $('#resultsdivCont').html('');
    for(var i in results){
      if(i!=0) bg='';
      //var area=vidteq.fvtObj.getDDArea(results[i].area);
      var toPath = '';
      var fromPath = '';
      var resultAddName = results[i].name.replace('/\'/',"");
      if('pathPre' in vidteq) {
        toPath = vidteq.pathPre+'directions/'+vidteq.cfg.city+'/Direction-To-'+resultAddName+'---'+results[i].geom;
        fromPath = vidteq.pathPre+'directions/'+vidteq.cfg.city+'/Direction-From-'+resultAddName+'---'+results[i].geom;
      }
      var resultSet = {
        'i':i
        ,'bg':bg
        ,'realgeom':results[i].realgeom
        ,'geom':results[i].geom
        ,'name':results[i].name
        ,'toPath':toPath
        ,'fromPath':fromPath
      };
      $('#resultsdivCont').append($('#searchAreaTmpl').tmpl(resultSet));
      //var lt='<tr><td class="myTd"><a value="'+results[i].geom+'" id="fvtDirFrom_'+i+'" href="javascript:void(0)" class="smaller">Directions from</a></td><td class="myTd"><a class="smaller" href="#" id="fvtDirTo_'+i+'">Directions to</a></td><td class="myTd smallerBText focusArea" value="'+results[i].geom+'">Focus</td></tr>';
      //ht+='<div class="resultDivParent" "value="'+results[i].realgeom+'" id="'+i+'"><center><table width="80%"><tr><td colspan="3"><hr></td></tr><tr><td colspan="3" value="'+results[i].geom+'" id="'+i+'" class="resultDiv '+bg+'"><h2 style="font-weight:normal;font-size:100%;">'+results[i].name+'</h2></td></tr>'+lt+'</table></center></div>';
    }
    //$('#resultsdivCont').html(ht);
    $('#resultsdivShow').show();
  }
  var that=this;
  for (var i in results){
    $('#fvtDirFrom_'+i).click(function(){
      var index=$(this).attr('id').substr(11);
      that.gui.dirFromTo('start',index,'location');
      that.gui.goVid();
    });
    $('#fvtDirTo_'+i).click(function(){
      var index=$(this).attr('id').substr(9);
      that.gui.dirFromTo('end',index,'location');
      that.gui.goVid();
    });
  }
}
vidteq.fvt.prototype.showSearchRoad = function(results,strData,centArray,nameArray){
  var data=new Object();
  data.strings=strData;
  data.centers=centArray;
  data.names=nameArray;
  $('#resultsdiv').data('data',data);
  if('firstTimeLoad' in vidteq) { 
    delete vidteq.firstTimeLoad; 
  } else {
    var ht='';
    var bg='selected';
    $('#resultsdivCont').html('');
    for(var i in nameArray){
      if(i!=0) bg=''; 
      var toPath = '';
      var fromPath = '';
      var resultAddName = nameArray[i].replace('/\'/',"");
      if('pathPre' in vidteq) {
        toPath = vidteq.pathPre+'directions/'+vidteq.cfg.city+'/Direction-To-'+resultAddName+'---'+centArray[i];
        fromPath = vidteq.pathPre+'directions/'+vidteq.cfg.city+'/Direction-From-'+resultAddName+'---'+centArray[i];
      }
      var resultSet = {
        'i':i
        ,'bg':bg
        ,'geom':results[i].geom
        ,'name':results[i].name
        ,'toPath':toPath
        ,'fromPath':fromPath
      };
      $('#resultsdivCont').append($('#searchRoadTmpl').tmpl(resultSet));
      //var lt='<tr><td class="myTd"><a href="javascript:void(0)" class="smaller" value="'+i+'" id="fvtDirFrom_'+i+'">Directions from</a></td><td class="myTd"><a href="javascript:void(0)" class="smaller" id="fvtDirTo_'+i+'" value="'+i+'" >Directions to</a></td></tr>';
      //ht+='<div class="resultDivParent" value="'+i+'" ><center><table width="80%"><tr><td colspan="2"><hr></td></tr><tr><td colspan="2" value="'+i+'" class="resultDiv '+bg+'"><h2 style="font-weight:normal;font-size:100%;">'+nameArray[i]+'</h2></td></tr><tr><td colspan="2" class="myTd smallerText"><h2 style="font-weight:normal;font-size:100%;">Category: Road name</h2></td></tr>'+lt+'</tr></table></div>';
    }
    //$('#resultsdivCont').html(ht);
    $('#resultsdivShow').show();
  }
  var that=this;
  for(var i in centArray){
    $('#fvtDirFrom_'+i).click(function(){
      var index=$(this).attr('value');
      var lonlat=$('#resultsdiv').data('data').centers[index];
      var x=that.gui.mbox.lonLatObjFrmPoint(lonlat);
      that.gui.mbox.addRcmStartOrEndMarker('start',x);
      that.gui.goVid();
    });
    $('#fvtDirTo_'+i).click(function(){
      var index=$(this).attr('value');
      var lonlat=$('#resultsdiv').data('data').centers[index];
      var x=that.gui.mbox.lonLatObjFrmPoint(lonlat);
      that.gui.mbox.addRcmStartOrEndMarker('end',x);
      that.gui.goVid();
    });
  }
}

vidteq.fvt.prototype.getAddrCont= function(result,i){
  var addCont="<table width='100%' class='addDiv' id='addDiv"+i+"'>";
  if(result.address.addr1 != '' && result.address.addr1!=null) addCont+="<tr><td>"+result.address.addr1+"</td></tr>";
  if(result.address.addr2 != '' && result.address.addr2!=null) addCont+="<tr><td>"+result.address.addr2+"</td></tr>";
  if(result.address.addr3 != '' && result.address.addr3!=null) addCont+="<tr><td>"+result.address.addr3+"</td></tr>";
  if(result.address.addr4 != '' && result.address.addr4!=null) addCont+="<tr><td>"+result.address.addr4+"</td></tr>";
  if(result.address.pin != '' && result.address.pin !=null)   addCont+="<tr><td>Pin: "+result.address.pin +"</td></tr>";
  if(result.address.phone != '' && result.address.phone!=null) addCont+="<tr><td>Phone: "+result.address.phone+"</td></tr>";
  if(result.address.website != '' && result.address.website!=null) {
    result.address.website = result.address.website.replace(/^http:\/\//,'');
    addCont+="<tr><td>Website: <a target='_blank' style='text-decoration:underline' href='http://"+result.address.website+"'>"+result.address.website+"</a></td></tr>";
  }
  var resultName = "";
  if(result.address.name != '' && result.address.name!=null) {
    resultName = "&name="+result.address.name;
  }
  if('pathPre' in vidteq) {
    if(result.id != '' && result.id != null) {
      addCont+="<tr><td><a class='smaller' target='wowPlace' style='color:blue;font-size:12;' href='"+vidteq.pathPre+"vs/wowPlace.php?city="+vidteq.cfg.city+"&id="+result.id+resultName+"'>Details</a></td></tr>";
    }
  } else {
    if(result.id != '' && result.id != null) {
      addCont+="<tr><td><a class='smaller' target='wowPlace' style='color:blue;font-size:12;' href='vs/wowPlace.php?city="+vidteq.cfg.city+"&id="+result.id+resultName+"'>Details</a></td></tr>";
    }
  }
  return addCont;
}


