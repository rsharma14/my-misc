if (typeof(vidteq) == 'undefined') { vidteq = {}; }

vidteq._suggestBox = function(gui,opt) {
  opt = opt || {};
  var id = opt.id || 'starttextbox';
  this.name = id;
  this.id = '#'+id;
  this.gName = 'startMyLoc';
  if (id.match(/end/)) { this.gName = 'endMyLoc'; }
  this.gId = '#'+this.gName;
  this.defaultValue = opt.defaultValue || 'Business or Address Locator';
  this.defaultTitle = opt.defaultTitle || 'Enter your address';
  this.defaultPointInfo = opt.defaultPointInfo || 'Your Source';
  this.sugDivId = opt.sugDivId || '#sugdivstart';
  this.tip = opt.tip || 'start';
  this.gui = gui;
  this.currentText = '';
  this.noOfSuggestions = 0;
  this.readOnlyClass = opt.readOnlyClass || null;
  this.readOnlyCss = {background:'#cccccc'}; // fall back
  this.normalClass = opt.normalClass || null;
  this.normalCss = {background:'#ffffff'}; // fall back
  this.earlierVal = 'default';
  this.refWidth = $(this.id).width();  // We may increase if really small
  this.refWidth = this.refWidth<440?440:this.refWidth;
  if(this.gui.openScale && this.gui.handheld)
    this.refWidth = 280;
  this.restoreDefaults();
  var that = this;
  if (this.gui.topClearList) { 
    this.gui.topClearList[this.name] = function () {that.clearSuggestDiv();};
  }
  if (this.gui.topUpKeyList) { 
    this.gui.topUpKeyList[this.name] = function() {that.higherSelectSuggestRow();};
  }
  if (this.gui.topDownKeyList) { 
    this.gui.topDownKeyList[this.name] = function() {that.lowerSelectSuggestRow();};
  }
  this.clearTip = null;
  this.noFocusEvent = 'noFocusEvent' in opt ? opt.noFocusEvent : false;
  this.maxPlaceList = 'maxPlaceList' in opt ? opt.maxPlaceList : -1; // default is to use whatever comes
  this.touchType = 'touchType' in opt ? opt.touchType : false; // specifically made for touchType devices
  this.autoHide = 'autoHide' in opt ? opt.autoHide : true;
}

vidteq._suggestBox.prototype.setClass = function(type) {
  if (type == 'normal') {
    if (this.readOnlyClass) { 
      $(this.id).removeClass(this.readOnlyClass); 
    }
    if (this.normalClass) { 
      $(this.id).addClass(this.normalClass); 
    } else {
      $(this.id).css(this.normalCss); 
    }
  } else if (type == 'readOnly') {
    if (this.normalClass) { 
      $(this.id).removeClass(this.normalClass); 
    }
    if (this.readOnlyClass) { 
      $(this.id).addClass(this.readOnlyClass); 
    } else {
      $(this.id).css(this.readOnlyCss); 
    }
  }
  // TBD
}

vidteq._suggestBox.prototype.val = function() {
  return $(this.id).val();
}

vidteq._suggestBox.prototype.setNormal = function(val) {
  if (val) {
    if (val == 'default') {
      $(this.id).val(this.defaultValue);
    } else {
      $(this.id).val(val);
    }
  }
  $(this.id).attr('title',this.defaultTitle);
  this.readOnly = false;
  this.setClass('normal');
}

vidteq._suggestBox.prototype.restoreDefaults = function() {
  this.setNormal('default');
  //$(this.id).val(this.defaultValue);
  //this.setNormal();
  //$(this.id).attr('title',this.defaultTitle);
  //this.readOnly = false;
  ////$(this.id).attr('readonly',null);
  //this.setClass('normal');
}

vidteq._suggestBox.prototype.restoreEarlierVal = function() {
  if (this.earlierVal == 'default') {
    this.restoreDefaults();
    return;
  }
  this.setNormal(this.earlierVal);
  //$(this.id).val(this.earlierVal);
  //this.setNormal();
}

vidteq._suggestBox.prototype.assignEvents = function() {
  var that = this;
  $(this.id).keyup(function (e) {that.suggestMatches(e);});
  // TBD attach a function in body for clearing this suggest checkKeyEvents
  // onkeydown = checkKeyEvents
  // onclick = clearSuggestDiv
  $(this.id).click(function (e) {that.clickTextbox(e);});
  if (this.noFocusEvent) { } else {
    $(this.id).focus(function () {that.focusTextbox();});
  }
  $(this.id).blur(function () {that.blurTextbox();});
  //$(this.id).select(function () {that.selectTextbox();});
  $(this.gId).click(function (e) { that.clickMyLoc(e); });
}

vidteq._suggestBox.prototype.clickMyLoc = function() {
  //if (!$(this.gId).is(':visible')) { return; } // extra protection
  if (this.tipFixed) {
    this.transferFixTip();
  }
  if (this.myLoc) {
    this.unfixMyLoc(); 
    return; 
  }
  this.fixMyLoc();
}

vidteq._suggestBox.prototype.unfixMyLoc = function(dontRestore) {
  if (!this.myLoc) { return; }
  this.gui.routeEnds.remove(this.tip,true);
  this.ent = null;
  this.myLoc = false;
  $(this.gId).css('opacity',1);
  // TBD color this.gId differently
  if (dontRestore) { } else {
    this.restoreEarlierVal();
  }
  this.setNormal();
  //this.readOnly = false;
  ////$(this.id).attr('readonly',false);
  //this.setClass('normal');
  ////$(this.id).css('background','#ffffff');
}

vidteq._suggestBox.prototype.fixMyLoc = function() {
  if (this.myLoc) { return; }
  if (!this.gui.lastMyLoc) { return; }
  var myLoc = this.gui.lastMyLoc;
  if (this.otherTip) {
    this.otherTip.unfixMyLoc();
  }
  //var ent =   var ent = {
  //  geom:"POINT("+myLoc.lon+" "+myLoc.lat+")"
  //  ,address:{name:myLoc.name}
  //  ,myLoc:myLoc
  //};
  //this.gui.routeEnds.replaceEntity(this.tip,ent);
  //// TBD check following needed
  ////this.gui.routeEnds.replaceEntity(this.tip,ent,{noFillKeyBox:true});
  $(this.gId).css('opacity',0.5);
  this.earlierVal = $(this.id).val();
  if ($(this.id).val() == this.defaultValue) {
    this.earlierVal = 'default';  // TBD is it needed ?
  }
  this.myLoc = true;  // important
  this.updateMyLoc(myLoc);
  //$(this.id).val(ent.address.name);
  this.readOnly = true; 
  //$(this.id).attr('readonly',true);
  //$(this.id).css('background','#cccccc');
  this.setClass('readOnly');
  //$(this.id).val('Detecting location ..');
  $(this.id).attr('title','Current location');
  //if (this.getMyLoc) {
  //  $(this.id).val(this.getMyLoc());
  //}
}

vidteq._suggestBox.prototype.enableMyLoc = function() {
  $(this.gId).show();
  // TBD clean
   
}

vidteq._suggestBox.prototype.disableMyLoc = function(clean) {
  $(this.gId).hide();
  if (clean) {
    if (this.myLoc) { this.unfixMyLoc(); }
  }
  // TBD need to clean ? 
}

//vidteq._suggestBox.prototype.selectTextbox = function() {
//  console.log("selected ");
//}

vidteq._suggestBox.prototype.commitPlace = function(data) {
  $(this.id).val(data.name);
  if (data.obj) {
    this.suggestedObj = data.obj;
  } else {
    if (this.suggestedObj) { delete this.suggestedObj; }
  }
}

vidteq._suggestBox.prototype.insertPlace = function(data) {
  this.commitPlace(data);
  this.clearSuggestDiv();
  $(this.id).focus();
}

vidteq._suggestBox.prototype.lowerSelectSuggestRow = function() {
  if ($(this.sugDivId)[0].style.visibility != 'visible') {return;}
  this.sendSuggestRequest=0;
  this.currentSuggestIndex--;
  this.currentSuggestIndex=(this.currentSuggestIndex==-2)?(this.noOfSuggestions-1):this.currentSuggestIndex;
  this.currentSuggestIndex=(this.currentSuggestIndex==-1)?(this.noOfSuggestions-1):this.currentSuggestIndex;
  this.selectSuggestRow(this.currentSuggestIndex);
}

vidteq._suggestBox.prototype.higherSelectSuggestRow = function() {
  if ($(this.sugDivId)[0].style.visibility != 'visible') {return;}
  this.sendSuggestRequest=0;
  this.currentSuggestIndex++;
  this.currentSuggestIndex=(this.currentSuggestIndex==this.noOfSuggestions)?0:this.currentSuggestIndex;
  this.selectSuggestRow(this.currentSuggestIndex);
}

vidteq._suggestBox.prototype.selectSuggestRow = function(rowIndex) {
  if ($(this.sugDivId)[0].style.visibility != 'visible') {return;}
  $('tr[id^=suggestrow]').each(function () { $(this)[0].className='sugrow'; });
  var sugRowId="suggestrow"+rowIndex;
  $('#'+sugRowId)[0].className='sugrowhighlight';
  //$(this.id)[0].value = this.currentText = $('#'+sugRowId).data('oneSuggest');
  var data = $('#'+sugRowId).data('oneSuggest');
  this.currentText = data.name;
  this.commitPlace(data);
}

vidteq._suggestBox.prototype.suggestMatches=function (e) {
  if (this.readOnly) { 
    if (!this.myLoc && !this.tipFixed) { return; } // extra protection
    if (this.myLoc) { 
      this.unfixMyLoc(true); 
    }
    if (this.tipFixed) {
      this.transferFixTip();
      // TBD if other tip is not there ?
    }
    this.setNormal(e.key);
    //this.setNormal();
    //$(this.id).val(e.key);
  }     
  //var obj = $(this.id)[0];
  //this.userText = obj.value;
  this.userText = $(this.id).val();
  this.userText = this.userText.replace(/^\s+/,"");
  this.userText = this.userText.replace(/\s+$/,"");
  //if(this.userText!=this.defaultValue) 
  if(this.userText!=this.currentText) {
    if(this.userText.length==0) {
      this.clearSuggestDiv();
    } else {
      //if (this.gui.clearTipForSuggest) { this.gui.clearTipForSuggest(this.name); }
      if (this.clearTip) { this.clearTip(); }
    }
    this.currentText = this.userText;
    this.sendSuggestRequest=1;
    this.theRowSelected=null;
  }
  if(this.userText && this.sendSuggestRequest) {
    if (this.suggestedObj) { delete this.suggestedObj; }
    var data = {
      //qu : this.userText
      term : this.userText
      ,city : vidteq.cfg.city
    }
    ,dataType = 'json'
    ,url="vs/suggest.php"
    ;
    if(vidteq.vidteq.scriptBased) {
      dataType =  'jsonp'; 
      url = vidteq._serverHostUrl+url;
    }
    if('pathPre' in vidteq) {
      url = vidteq._serverHostUrl+url;
    }
    //var data=(vidteq.vidteq.scriptBased?{qu:this.userText,city:vidteq.cfg.city,callbackFunction:'prepareSuggestDropDown'}:{qu:this.userText,city:vidteq.cfg.city});
    //var url="vs/suggest.php";
    //if(vidteq.vidteq.scriptBased) url=vidteq._serverHostUrl+url;
    if(this.sendSuggestRequest) {this.fetchMatches(url,data,dataType);}
  }
  return false;
}

vidteq._suggestBox.prototype.prepareSuggestDropDown=function (placesList) {
  var suggestDiv=$(this.sugDivId);
  var that = this;
  if(placesList.length < 0) {
    if(this.userText.charAt(0) =='' ) {  // TBD where userText in context
      suggestDiv.html("<div><a class=plain>Please enter atleast one alphabet</a></div>");
    } else {
      suggestDiv.html("<div><a class=plain>No matching places</a></div>");
    }
    return false;
  }
  if(placesList.length == 0) {
    this.clearSuggestDiv();
    return false;
  }
  if (this.touchType) {
    suggestDiv.css({visibility:'visible','z-index':90000});
  } else {
    suggestDiv.css({visibility:'visible','z-index':90000,width:this.refWidth+'px'});
  }
  suggestDiv.html("<table id='suggesttable' cellspacing=0 cellpadding=2 style='width:100%'><tbody></tbody></table>");
  var myTable = $('#suggesttable');
  //for(i=0;i<placesList.length;i++) { }
  var maxPlaceList = this.maxPlaceList;
  if (maxPlaceList < 0) { maxPlaceList = placesList.length; }
  var currentCategory = "";
  for(i=0;i<maxPlaceList;i++) {
    if(typeof(placesList[i]) == 'undefined') return;
    var onePlace = placesList[i];
    var onePlaceObj = null;
    if (typeof(onePlace) == 'object') {
      // TBD you need to store the objects
      if ( onePlace.category != currentCategory) {
        var oneTr ="<tr class=sugrowCategory class=sugrow align='left'><td align='left' style='padding-left:4px;border-bottom:1px inset "+vidteq.vidteq.mainColor+";' ><a class=suggestCategory><b>"+onePlace.category+"</b></a></td></tr>";
        if($('tbody', myTable).length > 0){
          $('tbody', myTable).append(oneTr);
        } else {
          $(myTable).append(myTable);  // TBD what is this ?
        }
        currentCategory = onePlace.category;
      }
      onePlaceObj = onePlace;
      onePlace = onePlace.label; 
      
    }
    var patStr = '^(.*)('+this.userText+')(.*)$';
    var pat = new RegExp(patStr,"i");
    var firstPart = onePlace.replace(pat,'$1');
    var matchPart = onePlace.replace(pat,'$2');
    var lastPart = onePlace.replace(pat,'$3');
    //var otherHalf=onePlace.substring(this.userText.length,onePlace.length);
    var oneTr ="<tr id=suggestrow"+i+" class=sugrow onmouseover=this.className='sugrowhighlight'; onmouseout=this.className='sugrow'  align='left'><td align='left' style='padding-left:4px;border-bottom:1px inset "+vidteq.vidteq.mainColor+";' ><a class=suggest onfocus=this.blur();   href='javascript:void(0);'> "+firstPart+"<b>"+matchPart+"</b>"+lastPart+"</a></td></tr>";
    if (this.touchType) {
      oneTr ="<tr id=suggestrow"+i+" align='left'><td class='mysugtd'  align='left' style='padding-left:2px;'><a class=suggest href='javascript:void(0);'> "+firstPart+"<b>"+matchPart+"</b>"+lastPart+"</a></td></tr>";
    }
    if($('tbody', myTable).length > 0){
      $('tbody', myTable).append(oneTr);
    } else {
      $(myTable).append(myTable);  // TBD what is this ?
    }
    var evtData = {name:onePlace};
    if (onePlaceObj) { evtData.obj = onePlaceObj; }
    //$('#suggestrow'+i).data('oneSuggest',onePlace);
    $('#suggestrow'+i).data('oneSuggest',evtData);
    $('#suggestrow'+i).bind(
      'click'
      ,evtData
      ,function (e) {
        that.insertPlace(e.data);
      }
    );
  }
  this.currentSuggestIndex=-1;
  this.noOfSuggestions = maxPlaceList;
  if (this.autoHide) {
    var that = this;
    setTimeout(function () {that.clearSuggestDiv();},40000);
  }
  return false;
}

vidteq._suggestBox.prototype.fetchMatches = function(url,data,dataType) {
  //this.noOfSuggestions = 3;
  var that = this;
  var prepareSuggestDropDownWrap = function (placesList) {
    that.prepareSuggestDropDown(placesList);
  }
  $.ajax({
    url: url
    ,type: 'GET'
    ,data: data
    ,dataType: dataType
    ,success: prepareSuggestDropDownWrap
    ,error:function () {}
  });
  return false;    
}

vidteq._suggestBox.prototype.clickTextbox=function (e) {
  //var obj = $(this.id)[0];
  // TBD in the touch mode it was earlier disabled
  // need to be checked before okayed
  // TBD trying to deselect if selected already
  if (this.readOnly) { this.readOnlyVal = $(this.id).val(); }
  $(this.id).select();
  if (this.selected) {
    var v = $(this.id).val();
    $(this.id).val('');
    $(this.id).val(v);
    this.selected = false;
  } else {
    this.selected = true;
  }
  if (self.navigator.userAgent.match(/MSIE\s[7]/)){
    var textbox = $(this.id);
    var offset = textbox.offset();
    $('#sugdivstart').css('left',offset.left);
    $('#sugdivend').css('left',offset.left);
  }
  if($(this.id).val() == this.defaultValue) {
    $(this.id).val('');
    this.currentText = "";
    if (this.clearTip) { this.clearTip(); }
    // TBD not fully tested wait till people test it
  }
  this.clearSuggestDiv();
}

vidteq._suggestBox.prototype.focusTextbox = function() {
  var obj = $(this.id)[0];
  obj.value=(obj.value=='')?this.defaultValue:obj.value;
}

vidteq._suggestBox.prototype.blurTextbox=function () {
  var obj = $(this.id)[0];
  this.selected = false;
  //obj.value=(obj.value=='')?this.defaultValue:obj.value;
  if (obj.value == '') {
    this.currentText.start=this.defaultValue;
    obj.value=this.defaultValue;
    if (this.clearTip) { this.clearTip(); }
    // TBD not fully tested wait till people test it
  }
}

vidteq._suggestBox.prototype.clearSuggestDiv =function () {
  if($(this.sugDivId).length > 0) { 
    var suggestDiv=$(this.sugDivId)[0];  
    suggestDiv.innerHTML='';
    suggestDiv.style.visibility='hidden';
  }
}

vidteq._suggestBox.prototype.loadPointInfo = function () {
  $(this.id).val(this.defaultPointInfo);
  $(this.id).css({
    'background-image':'url('+vidteq.imgPath.ajaxLoader+')',
    'background-repeat':'no-repeat',
    'background-position':'center'
  });
}

vidteq._suggestBox.prototype.loadAndBlink = function (val) {
  $(this.id).val(val);
  if (!this.gui.topBarUI) {
    if(vidteq.aD && vidteq.aD.q == 'wayfinder') {
      $(this.id).css({color:'white'});
    } else {
      $(this.id).css({'background-color':vidteq.vidteq.mainColor,color:'white'});
    }
    var that = this;
    setTimeout(function () {  
      if(vidteq.aD && vidteq.aD.q == 'wayfinder') {
        $(that.id).css({color:'black'});
      } else {
        $(that.id).css({'background-color':'white',color:'black'});
      }
    },2000);
  }

}

vidteq._suggestBox.prototype.loadedPointInfo = function (val) {
  $(this.id).val(val);
  $(this.id).css({'background-image':""});
}

vidteq._suggestBox.prototype.updateMyLoc = function (myLoc) {
  if (this.myLoc) {
    var ent = {
      geom:"POINT("+myLoc.lon+" "+myLoc.lat+")"
      ,address:{name:myLoc.name}
      ,myLoc:myLoc
    };
    this.ent = ent;
    this.gui.routeEnds.replaceEntity(this.tip,ent);
    // TBD check following needed
    //this.gui.routeEnds.replaceEntity(this.tip,ent,{noFillKeyBox:true});
    $(this.id).val(ent.address.name);
  }
  this.myLocPossible = true;
  $(this.gId).show();
  if (this.myLocTimer) { clearInterval(this.myLocTimer); }
  var that = this;
  this.myLocTimer = setTimeout(function () {
    $(that.gId).hide();
    this.myLocPossible = false;
  },15*60*1000);
}

//vidteq._suggestBox.prototype.swapMineWith = function (his) {
//  // first  val transfer
//  var myVal = $(this.id).val();
//  var hisVal = $(his.id).val();
//  if (myVal == this.defaultValue) {
//    $(his.id).val(his.defaultValue);
//  } else {
//    $(his.id).val(myVal);
//  }
//  if (hisVal == his.defaultValue) {
//    $(this.id).val(this.defaultValue);
//  } else {
//    $(this.id).val(hisVal);
//  }
//}

vidteq._suggestBox.prototype.fixTip = function (name) {
  // no stings attached - does only fix Tip
  name = name || '';
  this.tipFixed = true;
  //if (this.myLoc) { this.unfixMyLoc(true); }
  $(this.id).val(name);
  $(this.id).attr('title',name);
  this.readOnly = true;
  //$(this.id).attr('readonly',1);
  this.setClass('readOnly');
  this.clearSuggestDiv();
  //$(this.gId).hide();
}

vidteq._suggestBox.prototype.unfixTipEntity = function (dontRestore) {
  if (!this.tipFixed) { return; }
  this.gui.routeEnds.remove(this.tip,true);
  this.unfixTip(dontRestore);
  this.ent = null;
}

vidteq._suggestBox.prototype.unfixTip = function (dontRestore) {
  // no stings attached - does only fix Tip
  if (!this.tipFixed) { return; }
  // mutex is callers responsibiliey
  //if (this.otherTip) { 
  //  this.otherTip.fixTip($(this.id).val()); 
  //}
  this.tipFixed = false;
  if (dontRestore) {
    this.setNormal();
  } else {
    this.restoreEarlierVal();
  }
  //this.unfixMyLoc();
  ////this.myLoc = false; // they are mutex
  //$(this.id).attr('title',this.defaultTitle);
  //this.readOnly = false;
  ////$(this.id).removeAttr('readonly');
  //if (this.myLocPossible) {  // TBD
  //  $(this.gId).show();
  //}
}

vidteq._suggestBox.prototype.transferFixTip = function () {
  if (!this.tipFixed) { return; }
  if (!this.otherTip) { return; }
  this.gui.routeEnds.remove(this.tip,true);
  this.otherTip.fixTipEntity(this.ent);
  this.gui.swapRouteCallback({rEAlreadySwapped:true}); 
  this.ent = null;
  this.tipFixed = false;
}

vidteq._suggestBox.prototype.fixTipEntity = function (ent,opt) {
  // TBD check if mutex  with other end is callers responsibility
  // however my myLoc should be cleaned before I fix
  if (this.myLoc) { this.unfixMyLoc(true); }
  var name = '';
  if (ent.address && ent.address.name) {
    name = ent.address.name;
  }
  this.ent = ent;
  this.gui.routeEnds.replaceEntity(this.tip,ent);
  this.fixTip(name);
}

vidteq._suggestBox.prototype.swap = function (opt) {
  if (!this.otherTip) { return; }
  var his = this.otherTip;

  var myMode = 'keyedIn';
  var myVal = $(this.id).val()
  if (myVal == this.defaultValue) { myMode = 'default'; }
  if (this.myLoc) { myMode = 'myLoc'; }
  if (this.tipFixed) { myMode = 'tipFixed'; }

  var hisMode = 'keyedIn';
  var hisVal = $(his.id).val();
  if (hisVal == his.defaultValue) { hisMode = 'default'; }
  if (his.myLoc) { hisMode = 'myLoc'; }
  if (his.tipFixed) { hisMode = 'tipFixed'; }

  if (myMode == 'tipFixed') {
    this.transferFixTip();
  } else if (hisMode == 'tipFixed') {
    his.transferFixTip();
  }

  if (myMode == 'myLoc') {
    his.clickMyLoc();
  } else if (hisMode == 'myLoc') {
    this.clickMyLoc();
  }
  
  if (myMode == 'default') {
    his.setNormal('default');
  } else if (myMode == 'keyedIn') {
    his.setNormal(myVal);
  }

  if (hisMode == 'default') {
    this.setNormal('default');
  } else if (hisMode == 'keyedIn') {
    this.setNormal(hisVal);
  }

  if(this.suggestedObj) {
    his['suggestedObj'] = this.suggestedObj;
    delete this.suggestedObj;
  } else if(his.suggestedObj) {
    this['suggestedObj'] = his.suggestedObj;
    delete his.suggestedObj;
  }
  // note that callback is already called in transferFixTip
}

