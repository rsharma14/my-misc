
if (typeof(vidteq) == 'undefined') { vidteq = {}; }

vidteq._frontPage = function (accountDetails,initMode) {
  this.mode=initMode; 
  this.tIn = true;
  this.fpMode = true;
  this.defaultTip = {start:"Start Address",end:"End Address"};
  this.titleTip = {
    start:'Enter your start address',
    end:'Enter your end address'
  };
}

vidteq._frontPage.prototype.init = function (q,isEmbed) {
  this.initGlobalsForFpMode();
  this.initEmbed(isEmbed);
  this.prepareSuggestBoxes();
  this.createAndShowFrontPage(true);
  this.assignSrc(q);
  this.attachEvents(q);
  this.showFixedTip();
}

vidteq._frontPage.prototype.prepareSuggestBoxes = function () {
  if (!this.tIn) { return; }
  this.topClearList = {};
  this.topDownKeyList = {};
  this.topUpKeyList = {};
  //$('#starttextbox').attr('class',"big");
  this.keyBox = {};
  this.keyBox.start = new vidteq._suggestBox(this,{
    id:'starttextbox'
    ,defaultValue:this.defaultTip.start
    ,defaultTitle:this.titleTip.start
    ,defaultPointInfo:'Your Source'
    ,sugDivId:'#sugdivstart'
    ,tip:'start'
  });
  //this.keyBox.start.sugDivId = '#sugdivstart';
  this.keyBox.start.assignEvents();
  if (this.routeEnds) {
    this.keyBox.start.clearTip = function () { that.routeEnds.remove('start'); };
  }
  //$('#endtextbox').attr('class',"small");
  this.keyBox.end = new vidteq._suggestBox(this,{
    id:'endtextbox'
    ,defaultValue:this.defaultTip.end
    ,defaultTitle:this.titleTip.end
    ,defaultPointInfo:'Your Destination'
    ,sugDivId:'#sugdivend'
    ,tip:'end'
  });
  //this.keyBox.end.sugDivId = '#sugdivend';
  this.keyBox.end.assignEvents();
  if (this.routeEnds) {
    this.keyBox.end.clearTip = function () { that.routeEnds.remove('end'); };
  }
  this.keyBox.start.otherTip = this.keyBox.end;
  this.keyBox.end.otherTip = this.keyBox.start;
}

vidteq._frontPage.prototype.createAndShowFrontPage = function (fpMode) {
  if (typeof(vidteq.aD) =='undefined' || typeof(vidteq.aD.config.frontCurtainHtmlFile) == 'undefined') return;
  if (vidteq.utils.trim(vidteq.aD.config.frontCurtainHtmlFile) == "") return;
  if (this.embed.firstTimeRule && this.embed.firstTimeRule.noFrontCurtain) return;
  this.landmarkClicked = false;
  this.loadFrontPage(fpMode);
}

vidteq._frontPage.prototype.loadFrontPage = function (fpMode) {
  if(typeof(vidteq.aD.config.sideBarUI) != 'undefined' && parseInt(vidteq.aD.config.sideBarUI)){
    vidteq.aD.config.frontCurtainHtmlFile = vidteq.aD.config.allProjectsFCHtmlFile;
  }
  if(this.handheld)
    var refHtml = "<iframe id='customIframe' style='width:auto;height:auto;' frameborder=0 src='"+vidteq.cfg.customHtmlUrl+vidteq.aD.config.frontCurtainHtmlFileForHandheld+"'></iframe>"; 
  else 
    var refHtml = "<iframe id='customIframe' style='width:auto;height:auto;' frameborder=0 src=\""+vidteq.cfg.customHtmlUrl+vidteq.aD.config.frontCurtainHtmlFile+"\"></iframe>"; 
  var pName = 'frontCurtainContent';
  if(typeof(vidteq.aD.config.sideBarUI) != 'undefined' && parseInt(vidteq.aD.config.sideBarUI) && vidteq.aD.config.allProjectsFCHtmlFile) {
    var con = $("<div id = '"+pName+"' > </div>").appendTo('body');
  } else {
    var con = $("<div id = '"+pName+"' style='margin-top:0px;margin-left:0px;padding:10px;background-color:"+vidteq.vidteq.bgColor+";'> </div>").appendTo('body');
  }
  con.html(refHtml);
  if (!fpMode) { vidteq.utils.drapeSheer('frontCurtain'); }
  var that = this;
  var myFpMode = fpMode; 
  $('#customIframe').load(function () { 
    that.transferFrontPage(con,myFpMode); 
    that.curtainLoaderHide();
  });
}

vidteq._frontPage.prototype.curtainLoaderHide = function() {
  $('.frontCurtain_Loader').css('display', 'none');
  $('.frontCurtain_LoaderScreen').css('display', 'none');
}

vidteq._frontPage.prototype.transferFrontPage = function (con,fpMode) {
  $('#customIframe').contents().find('#topOfCustomContent').find('img').each(function () {
    $(this).attr('src',vidteq.cfg.customHtmlUrl+"/"+$(this).attr('src'));
  });
  $('#customIframe').contents().find('#topOfCustomContent').find('object > embed').each(function () {
    $(this).attr('src',vidteq.cfg.customHtmlUrl+"/"+$(this).attr('src'));
  });
  $('#frontCurtainContent').html($('#customIframe').contents().find('#topOfCustomContent').html());
  //$('#customIframe').remove();
  if (!fpMode) {
    var that = this;
    var closeFuncLocal = function () {
      if (that.handheld) {
        if (!that.landmarkClicked) {
          that.showFrontMenu();
        } else { that.attachMenuButton();}
      }
      return that.moveBackIoFromFp();
    }
    vidteq.utils.createPopupGeneric({div:con,margins:(5+4+2),closeFunc:closeFuncLocal},{name:'frontCurtain',factor:2});
  }
  this.moveIoToFp(fpMode);
  this.attachFrontCurtainLandmarkRoutes(fpMode);
  this.attachFlashCall(fpMode);
}

vidteq._frontPage.prototype.moveBackIoFromFp = function () {
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

vidteq._frontPage.prototype.moveIoToFp = function (fpMode) {
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

vidteq._frontPage.prototype.attachFrontCurtainLandmarkRoutes = function (fpMode) {
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
        $.postMessage(func+'(\'{"lmRoute":'+index+'}\')', vidteq.parentUrl );
      } else {
        that.triggerOneLandmarkRoute(index); 
        $('#frontCurtainClose').click();
      }
    });
  });
}

vidteq._frontPage.prototype.attachFlashCall = function (fpMode) {
  var that = this;
  var myFpMode = fpMode;
  flashCall = function (code,index) {
    $('#frontCurtainClose').click();
    switch(code){		
    case 'exp':
      window.location.hash='nearby';
      break;
    case 'lmr':
      if (myFpMode) {
        var func = 'invokeVidteqPopup_'+vidteq.aD.urlId;
        $.postMessage(func+'(\'{"lmRoute":'+index+'}\')', vidteq.parentUrl );
      } else { 
        that.triggerOneLandmarkRoute(index); 
      }
      break;
    case 'search':
      if (myFpMode) {
        var func = 'invokeVidteqPopup_'+vidteq.aD.urlId;
        $.postMessage(func+'(\'{"search":'+index+'}\')', vidteq.parentUrl );
      } else { 
        that.triggerOneNBBSearch(index);
      }
      break;
    }
  };
}

vidteq._frontPage.prototype.assignSrc = function (q) {
  $('#GoVid').attr('src',vidteq.imgPath.govid);   
  $('#swaptd').attr('src',vidteq.imgPath.swap); 
}

vidteq._frontPage.prototype.attachEvents = function (q) {
  var that = this;
  if ($('#body').length) {
    $('#body').keydown(function (evt) {
      evt=evt?evt:window.event;
      that.checkKeyEvents(evt);
      return true;
    });
    $('#body').click(function () {
      that.executeAllFunc(that.topClearList);
    });
  }
  $('#swaptd').click(function () {
    that.swapRoute();
    return false;
  });
  $('#GoVid').click(function () {
    if (that.fpMode) {
      that.fpGoVid();
    } else {
      that.io.goVid();
    }
    return false;
  });
}

vidteq._frontPage.prototype.fpGoVid = function () {
  var tip;
  var ftRule = {};
  for (var i in this.defaultTip) { 
    if ($('#'+i+'textbox').attr('readonly')) { 
      tip = vidteq.utils.otherTip[i]; 
    }
  }
  var val = vidteq.utils.trim($('#'+tip+'textbox').val());
  //var ftRule = '{'+tip+':{address:{name:"'+encodeURI(val)+'"}}}';
  ftRule[tip] = {
      address:{
        name: encodeURI(val)
      }            
    };  
  if(this.keyBox[tip].suggestedObj) {
    ftRule[tip]['suggestedObj'] = this.keyBox[tip].suggestedObj;
    ftRule[tip]['geom'] = this.keyBox[tip].suggestedObj.geom;
  }
  var func = 'invokeVidteqPopup_'+vidteq.aD.urlId;
  if (val.match(new RegExp("^"+this.defaultTip[tip]+"$")) ||
      val == '') {
    $.postMessage(func+'()', vidteq.parentUrl );
  } else {
    $.postMessage(func+'(\''+JSON.stringify(ftRule)+'\')', vidteq.parentUrl );
  }
}

vidteq._frontPage.prototype.checkKeyEvents = function (evt) {
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
      if (this.fpMode) {
        this.fpGoVid();
      } else {
        this.io.goVid();
      }
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
}

vidteq._frontPage.prototype.executeAllFunc=function (funcArray) {
  for (var i in funcArray) {(funcArray[i])();}
}

vidteq._frontPage.prototype.prepareCenterEntity= function (entity,tip) {
  entity.type='center';
  if (entity.distance) { delete entity.distance; }
  var tip = typeof(tip) == 'undefined' ? 'start' : tip;
  this.embed.fix = tip;
  this.embed.other = vidteq.utils.otherTip[tip]; 
  //this.io.populateIconContent(entity);
  if(!entity.lonlat) entity.lonlat=vidteq.utils.lonLatObjFrmPoint(entity.geom);
  if(!entity.popup) entity.popup={open:1};
  return entity;
}

vidteq._frontPage.prototype.swapRoute=function () {
  this.keyBox.start.swap();// start or end does not matter
  // callback is called to do rest of job

  //var tempVal=$('#starttextbox').val();
  //$('#starttextbox').val($('#endtextbox').val());
  //$('#endtextbox').val(tempVal);
  //if ($('#starttextbox').val() == this.defaultTip['end']) {
  //  $('#starttextbox').val(this.defaultTip['start']);
  //}
  //if ($('#endtextbox').val() == this.defaultTip['start']) {
  //  $('#endtextbox').val(this.defaultTip['end']);
  //}

  //this.displayMessage("&nbsp");
  //if(typeof(vidteq.mboxObj) == 'undefined') { return false; }
  //// TBD
  //this.mbox.killRcmPopup(); 
  //var routeWasActive = false;
  //if (this.mbox.routeActive) {  // clean up the route 
  //  this.clearRouteAndSrf(); 
  //  routeWasActive = true;
  //}
  //if (this.mbox.srfActive) {  this.io.swapSrfResponse(); }  
  //vidteq.routeEndsObj.swap(); 
  if(this.embed) {   // now swap fixed end
    if (this.embed.fix != '') {
      this.embed.fix=vidteq.utils.otherTip[this.embed.fix];
      this.embed.other=vidteq.utils.otherTip[this.embed.other];
      this.showFixedTip();
    }
  }
  //if (this.mbox.srfActive) {  
  //  this.fvt.prepareForShowSrf(this.io.srfResponse);
  //  this.writeSrfToTable();
  //}
  return false;
}

vidteq._frontPage.prototype.showFixedTip = function () {
  if (!this.embed) return;
  if (this.embed.fix == '') return;
  var tip = this.embed.fix;
  var otherTip = this.embed.other;
  if (this.tIn) {
    if (this.embed.place && this.embed.place.address &&
        this.embed.place.address.name) {
      $('#'+tip+'textbox').attr('title',this.embed.place.address.name);
    } else {
      $('#'+tip+'textbox').attr('title','');
    }
    $('#'+otherTip+'textbox').attr('title',this.keyBox[otherTip].defaultTitle);
    $('#'+tip+'textbox').attr('readonly',1);
    $('#'+otherTip+'textbox').attr('readonly',null);
  }
  $('#'+tip+'textbox').val(this.embed.place.address.name);
  if (this.embed.place && this.embed.place.popup && 
      this.embed.place.popup.open==1 && 
      this.mbox) this.mbox.popoutCenterPlace(); 
}

vidteq._frontPage.prototype.initEmbed = function (isEmbed) {
  if(!isEmbed.on) { return; }
  if (typeof(vidteq.aD) == 'undefined') return;
  this.embed={};
  this.embed.fix=isEmbed.fix;
  this.embed.other=vidteq.utils.otherTip[isEmbed.fix];
  switch (vidteq.aD.q) {
    case "wayfinder-lite":
    case "wayfinder":
    case "blocate":
      this.embed[vidteq.aD.q] = vidteq.aD.places;
      if (vidteq.aD.firstTimeRule) {
        this.embed.firstTimeRule = vidteq.aD.firstTimeRule; 
      }
      this.embed.place = vidteq.aD.places.center.entity;
      this.prepareCenterEntity(this.embed.place,isEmbed.fix);
      break;
    case "locatestores":
      this.locationName = 'Enter your address to find a Store nearby & get Video Directions'; // TBD does not belong to embed object - may get overwritten

      this.embed.locateStores = vidteq.aD.places;
      if (vidteq.aD.firstTimeRule) {
        this.embed.firstTimeRule = vidteq.aD.firstTimeRule; 
      } else {
        this.embed.firstTimeRule = {
          locate:{ 
            address: {name:"The center of "+vidteq.cfg.city+" city"},
            geom:'POINT('+vidteq.cfg.centerLon+' '+vidteq.cfg.centerLat+')'
        }};
      }
      break;
    default:document.location.href='error.html';break;
  }
  switch (parseInt(vidteq.vidteq.pf)) {
  case 1:
    this.embed.vidHeight='160px';
    this.embed.vidWidth='240px';  
    break;
  case 2:
    this.embed.vidHeight='256px';
    this.embed.vidWidth='384px';  
    break;
  case 3:
  default:
    this.embed.vidHeight='320px';
    this.embed.vidWidth='480px';  
    break;  
  }
  // TBD why is vidHeigt present it belongs to fvt actually
}

vidteq._frontPage.prototype.initGlobalsForFpMode = function () {
  vidteq.vidteq = {
    scriptBased:false,
    mainColor:vidteq.aD.config.topStripColor,
    bgColor:vidteq.aD.config.bgColor
  };
  vidteq.mainColor = vidteq.aD.config.topStripColor;
  vidteq.MSIE6 = false;
  $ = jQuery.noConflict();
  vidteq._vidteqCfg._rStr = vidteq._rStr;
  vidteq.cfg = vidteq._vidteqCfg;
  vidteq.utils = new vidteq._utils();
  //vidteq.imgPath.generatePath();
  vidteq.imgPath.generatePath({
    vidteq: this
    ,_serverHostUrl: vidteq._serverHostUrl
  });
}

