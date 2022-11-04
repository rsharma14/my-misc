/*
 * Production javascript
 *
 * Copyright (c) 2008 Vidteq India Pvt Ltd
 * and GPL (GPL-LICENSE.txt) licenses.MSI
 *

 * $Date: 2015/05/08 01:58:05 $
 * $Date: 2015/05/08 01:58:05 $

 * $Rev: $
 */
if (typeof(vidteq) == 'undefined') { vidteq = {}; }

vidteq._poi = function (entity,gui) {
  this.entity = entity;
  this.gui = gui;
  this.handheld = false;
  if (this.gui.handheld || this.gui.openScale) {
    this.handheld = true;
  }
}

vidteq._poi.prototype.mark = function (tip,doAutoGoVid) {
  if (typeof(ioArea) != 'undefined' && ioArea.prototype.isPrototypeOf(this.gui)) {
    if(typeof(brandCatId) != 'undefined' && brandCatId != '') {
      vidteq.routeEndsObj.replaceEntity(tip,this.entity);
      if (doAutoGoVid) { this.gui.goVid(); }
      return;
    }
    if(typeof(this.entity.index) == 'undefined') {
      this.gui.dirFromTo(tip,this.entity.lpIndex,this.entity.parentType);
    } else {
      this.gui.dirFromTo(tip,this.entity.index,this.entity.parentType);
    }
    //if(typeof(this.gui.mbox) != 'undefined' && this.gui.mbox.wowMode) { this.gui.goVid(); } 
    if (doAutoGoVid) { this.gui.goVid(); }
  } else {
    if(this.gui.openScale && !this.gui.handheld) { 
      StageWebViewBridge.call('landmarkRouteIndex', null, {
        dirIndex:0
      }); 
    }
    this.gui.dirFromTo(tip,this.entity);
    if (this.gui.sideBarUI) {
      $('#fvtContainerLabel').html('<h2>Video Directions</h2>');
    }
    if (doAutoGoVid) { this.gui.io.goVid(); }
  }
}

vidteq._poi.prototype.getAddrParams = function () {
  return [  
    {field:'addr1',className:'srfFontPlain',lineBreak:1,preBreakMap:1},
    {field:'addr2',className:'srfFontPlain',lineBreak:1},
    {field:'addr3',className:'srfFontPlain',lineBreak:1},
    {field:'addr4',className:'srfFontPlain',lineBreak:1},
    {field:'city',className:'srfFontPlain',lineBreak:1},
    {field:'pin',className:'srfFontPlain'},
    {field:'phone',text:'Ph: ',className:'srfFontPlain',lineBreak:1},
    {field:'email',text:'Email: ',className:'srfFontPlain',lineBreak:1},
    {field:'website',text:'Website: ',className:'srfFontPlain',lineBreak:1},
    {field:'workhrs',text:'Working Hours: ',className:'srfFontPlain',lineBreak:1}
  ];
}
 
vidteq._poi.prototype.populateMarkIconContent = function (iconNum,entity) {
  if (typeof(iconNum) == 'undefined') { return; }
  if (typeof(entity) == 'undefined' && !this.entity) { return; }
  if (typeof(entity) == 'undefined') { entity = this.entity; }
  if(vidteq.newSearchEnabled) entity.index=iconNum;
  entity.lpIndex = iconNum;
  entity.markIcon = [];
  entity.markIcon.iconNum = iconNum;
  entity.markIcon.mapUrl=vidteq.imgPath.locaMarkers[iconNum].map;
  entity.markIcon.fvtUrl=vidteq.imgPath.locaMarkers[iconNum].div;
  entity.markIcon.mapStyle="border:0px solid black;"    
  entity.markIcon.fvtStyle="border:0px solid black;cursor:pointer;"    
  entity.markIcon.size=32;  
  entity.markIcon.w=32;  
  entity.markIcon.h=32;  
  entity.markIcon.title='Click to get information about this place';
}

vidteq._poi.prototype.populateIconContent = function (iconNum,entity) {
  if (typeof(entity) == 'undefined' && !this.entity) { return; }
  if (typeof(entity) == 'undefined') { entity = this.entity; }
  if (typeof(entity.icon)=='undefined') return;
  if(typeof(entity.icon.name)!='undefined') {
    entity.icon.mapUrl=vidteq.cfg.imageLogosLoc+entity.icon.name;
    entity.icon.fvtUrl=vidteq.cfg.imageLogosLoc+entity.icon.name;
    // TBD how to show the number on top of defined icon
    entity.icon.mapStyle="border:0px solid black;"    
    entity.icon.fvtStyle="border:0px solid black;cursor:pointer;"    
    if(!entity.icon.size) {
      entity.icon.size = 32; 
      entity.icon.w = 32; 
      entity.icon.h = 32; 
    }
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

vidteq._poi.prototype.getEntityHtmlIcon = function (fvtOrMap,shortPop,entity) {
  if (typeof(entity) == 'undefined' && !this.entity) { return; }
  if (typeof(entity) == 'undefined') { entity = this.entity; }
  var iconHtml='';
  var funcList = {};
  var classPNG=(vidteq.MSIE6)?"class='pngfixclass'":"''";  
  var icon;
  // TBD overlay 
  if (entity.icon && fvtOrMap == 'map') { icon = entity.icon; } 
  else { icon = entity.markIcon; }
  if ((!entity.type || entity.type != 'center') && fvtOrMap == 'map') {  // TBD
    if (vidteq.routeEndsObj.isEqual('start',entity))  icon = vidteq.mboxObj.startIcon;
    if (vidteq.routeEndsObj.isEqual('end',entity))  icon = vidteq.mboxObj.endIcon;
  }
  if (fvtOrMap == 'map') { 
    if(typeof(this.gui.mbox) != 'undefined' && this.gui.mbox.wowMode) {
      if(typeof(icon) == 'undefined') { return {html:"",funcList:funcList}; }
      iconHtml+="<img id='popupIcon' "+classPNG+" style='"+icon.mapStyle+"' src="+icon.mapUrl+" height="+icon.h+" width="+icon.w+" href='javascript:void(0);' />";
    } else if(typeof(vidteq.aD)!='undefined' && (vidteq.aD.urlId == 'indiaproperty') && entity.type == "center") {
      iconHtml+="<td style='background-color:white;vertical-align:middle;text-align:center;padding-left:10px;' width=5><div style='border:1px solid #bebebe;'><img id='popupIcon' "+classPNG+" style='"+icon.mapStyle+"' src="+icon.mapUrl+" height="+icon.h+" width="+icon.w+" href='javascript:void(0);' /></td></div>";
    } else {
      iconHtml+="<td style='background-color:white;vertical-align:middle;text-align:center;padding-left:10px;' width=5><img id='popupIcon' "+classPNG+" style='"+icon.mapStyle+"' src="+icon.mapUrl+" height="+icon.h+" width="+icon.w+" href='javascript:void(0);' /></td>";
    }
    return {html:iconHtml,funcList:funcList};
  }
  if (this.gui.sideBarUI) { } else {
    if(vidteq.newSearchEnabled) iconHtml+='<td></td>';
    else
      iconHtml+="<td width=5><img id='fvtIcon"+entity.lpIndex+"' "+classPNG+" style='"+icon.fvtStyle+"' src="+icon.fvtUrl+" href='javascript:void(0);' /></td>";
  }
  var that = this;
  var idx = entity.lpIndex;
  funcList['fvtIcon'+entity.lpIndex] = function () { 
    that.gui.mbox.callPopupLocation(idx); 
  };
  if (entity.type && entity.type == 'center') funcList['fvtIcon'+entity.lpIndex] = function () { that.gui.mbox.popoutCenterPlace(); };
  return {html:iconHtml,funcList:funcList};
}

vidteq._poi.prototype.getEntityHtmlAddrContent = function (fvtOrMap,shortPop,entity) {
  var classSUIName = 'srfFontPlain';
  if (this.gui.sideBarUI && fvtOrMap == 'fvt') {
    classSUIName = 'srfFontPlain1';
  }
  if (typeof(entity) == 'undefined' && !this.entity) { return; }
  if (typeof(entity) == 'undefined') { 
    entity = this.entity; 
    if (this.gui.sideBarUI && fvtOrMap == 'fvt') {
      classSUIName = 'srfFontPlain2';
    }
  }
  var propCounter=0;  
  var addrContent = '';
  var addrParams = this.getAddrParams();
  for(var index in addrParams) {
    var p = addrParams[index];
    if (this.gui.sideBarUI && fvtOrMap == 'fvt') {
      //p.className = 'srfFontPlain1';
      p.className = classSUIName;
    }
    for(var prop in entity.address) {
      if(prop==p.field && entity.address[prop]!==null) {
        if (p.preBreakMap && fvtOrMap == 'map') { 
          propCounter++;
          addrContent+="<br class='br-popup-fix'/>"; 
        }
        if (p.lineBreak) { 
          propCounter++;
          if (!this.handheld)
           addrContent+='<br class=\''+p.className+'\'>'; 
        } else { 
          addrContent+='&nbsp;';
  }  
        if(p.text) {
          addrContent+="<a class='"+p.className+"'>"+p.text+"</a>";
        }
        if(this.gui.openScale && !this.gui.handheld && p.field == "website") {
	  //addrContent+="<a class='"+p.className+"'  onclick=javascript:createWindow('http://"+entity.address[prop]+"') target='_blank' style='color:red;' >"+entity.address[prop]+"</a>";
          addrContent+="<a class='"+p.className+"' style='color:red;' >"+entity.address[prop]+"</a>";
        } else {
          if(p.field == 'website') {
            entity.address[prop] = entity.address[prop].replace(/^http:\/\//,'');
            addrContent+="<a class='"+p.className+"'  href='http://"+entity.address[prop]+"' target='_blank' style='color:blue;cursor:pointer;' >"+entity.address[prop]+"</a>";
          } else {
            addrContent+="<a class='"+p.className+"'>"+entity.address[prop]+"</a>";
          }
        }
        //addrContent+="<a class='"+p.className+"'>"+entity.address[prop]+"</a>";
      }
    }
  }
  return {propCounter:propCounter,addrContent:addrContent};
}

//function createWindow(cUrl) {
//  var xWin = window.open(cUrl)
//}

vidteq._poi.prototype.getEntityHtmlFields = function (fvtOrMap,shortPop,entity) {
  if (typeof(entity) == 'undefined' && !this.entity) { return; }
  if (typeof(entity) == 'undefined') { entity = this.entity; }
  var fieldHtml = '';
  var popupHeight=0;
  var name = 'Unknown Name';
  var empId = '';
  if (typeof(entity.name)!='undefined') name = entity.name;
  if (typeof(entity.empId)!='undefined') empId = entity.empId+'<br>';
  if (typeof(entity.address)=='undefined') entity.address = {};
  if (typeof(entity.address.name)!='undefined') name = entity.address.name;
  var crossPopupText = "'javascript:vidteq.mboxObj.callPopupLocation.apply(vidteq.mboxObj,["+entity.lpIndex+"]);'";
  if(this.gui.openScale) {
    crossPopupText = "'javascript:callOSPopupLocation("+entity.lpIndex+")'";
  } 
  if (entity.type && entity.type == 'center') crossPopupText = "'javascript:vidteq.mboxObj.popoutCenterPlace()'";
  if (this.handheld) {
    var fieldHtml="<table style='width:100%;white-space:normal;'><tr><td style='width:90%'>"+parseInt(entity.lpIndex + 1)+". <a class='srfFontBig' onclick="+crossPopupText+">"+vidteq.utils.boldify(name,entity.reqSeed)+"</a></td>";
  } else {
    if (this.gui.sideBarUI && fvtOrMap == 'fvt') {
      var fieldHtml="<a class=srfFontBig style='color:#A88026;' onclick="+crossPopupText+">"+empId+vidteq.utils.boldify(name,entity.reqSeed)+"</a>";
    } else {
      var fieldHtml="<a class=srfFontBig onclick="+crossPopupText+">"+empId+vidteq.utils.boldify(name,entity.reqSeed)+"</a>";
    }
  }
  if(this.gui.embed && this.gui.embed.locateStores) {
    fieldHtml = "<b>"+fieldHtml+"</b>";
  }
  if (typeof(shortPop) != 'undefined' && shortPop) {
    fieldHtml = "<br class=srfFont>"+fieldHtml+"<br class=srfFont><br class=srfFont>";
    fieldHtml += "<a style='float:right' class=srfFont onclick="+crossPopupText+">More ...</a>";
    popupHeight = 70;
    return {popupHeight:popupHeight,html:fieldHtml}
  }
  popupHeight += 50;
  if (!this.handheld){
    if(entity.category) {
      popupHeight += 15;
      fieldHtml +='<br class=\'srfFontPlain\'>'; 
      if (this.gui.sideBarUI && fvtOrMap == 'fvt') {
        fieldHtml += "<a class=srfFontPlain1>Category: "+entity.category+"</a>";
      } else {
        fieldHtml += "<a class=srfFontPlain>Category: "+entity.category+"</a>";
      }
    }
    if(typeof(entity.image)!='undefined' && entity.image !=null 
       && entity.image != '' && fvtOrMap == 'fvt') {
      if (this.gui.sideBarUI) { } else {
        fieldHtml +="<a style='float:right' class=srfFont onclick="+crossPopupText+"><img src="+vidteq.imgPath.camera+" /></a>";
      } 
    }
  }
  var f = this.getEntityHtmlAddrContent(fvtOrMap,shortPop,entity);
  var propCounter=f.propCounter;  
  var fieldContent = f.addrContent;
  if(entity.id) {
    if (!this.handheld) fieldContent+='<br class=\'srfFont\'>'; 
    var href = 'vs/wowPlace.php?city='+vidteq.cfg.city+'&id='+entity.id+'&name='+encodeURI(name);
    if(typeof(this.gui.mbox) != 'undefined' && this.gui.mbox.wowMode) {
      href = 'vs/wowPlace.php?city='+vidteq.cfg.city+'&id='+entity.id+'&name='+encodeURI(name);
    }
    if (this.gui.sideBarUI) {
      fieldContent+="<a class='click' style='text-decoration:underline;color:#ffffff;' target='wowPlace' href='"+href+"'>Details</a>";
    } else {
      fieldContent+="<a class='click' style='text-decoration:underline;' target='wowPlace' href='"+href+"'>Details</a>";
    }
    //fieldContent+="<a class='click' style='text-decoration:underline;' target='_blank' href='vs/place.php?id="+entity.id+"&name="+encodeURI(name)+"'>Details</a>";
    propCounter++;
  }
  if(!vidteq.utils.isObjectEmpty(entity.address) && propCounter > 1 && fvtOrMap == 'fvt') {
    if (this.handheld) {
      //fieldHtml +="<td style='vertical-align:top; width:90%'><a style='float:right'onfocus='this.blur()' class='basic' id='showMoreOrLess"+entity.lpIndex+"' href=javascript:void(0) onclick='vidteq.fvtObj.showFvtMoreOrLess("+entity.lpIndex+","+0+")'><img src='"+vidteq.imgPath.maxZ+"'></a></td></tr></table>"; 
      fieldHtml +="</tr></table>"; 
      if(this.gui.openScale) // this is an iphone
        this.maxButton ="<td style='vertical-align:top;text-align:right;'><a onfocus='this.blur()' class='basic' id='showMoreOrLess"+entity.lpIndex+"' href=javascript:void(0) onclick='vidteq.fvtObj.showFvtMoreOrLess("+entity.lpIndex+","+0+")'><img src='"+vidteq.imgPath.maxZ+"'></a></td>"; 
      else
        this.maxButton ="<td style='vertical-align:top;'><a style='float:left'onfocus='this.blur()' class='basic' id='showMoreOrLess"+entity.lpIndex+"' href=javascript:void(0) onclick='vidteq.fvtObj.showFvtMoreOrLess("+entity.lpIndex+","+0+")'><img src='"+vidteq.imgPath.maxZ+"'></a></td>"; 
    } else {
      if (this.gui.sideBarUI) {
        fieldHtml +="<br/><a onfocus='this.blur()' class='basic' style='color:#A88026;text-decoration:none;' id='showMoreOrLess"+entity.lpIndex+"' href=javascript:void(0) onclick='vidteq.fvtObj.showFvtMoreOrLess("+entity.lpIndex+","+0+")'>More >><a>";
      } else {
        fieldHtml +="<br/><a onfocus='this.blur()' class='basic' id='showMoreOrLess"+entity.lpIndex+"' href=javascript:void(0) onclick='vidteq.fvtObj.showFvtMoreOrLess("+entity.lpIndex+","+0+")'>More >><a>";
      }
    }
    //TBD index is not unique
    if (this.handheld) 
      fieldHtml +="<div id='showMoreDiv"+entity.lpIndex+"' style='display:none;white-space:normal;text-align:left;padding-left:5px;'>";
    else
      fieldHtml +="<div id='showMoreDiv"+entity.lpIndex+"' style='display:none;white-space:normal;'>";
    fieldHtml += fieldContent;
    fieldHtml +='</div>';
  } else {
    if (this.handheld) fieldHtml += "<table style='width:100%;'><tr><td>";  
    fieldHtml += fieldContent;
    if (this.handheld) fieldHtml += "</td></tr></table>";  
  }
  if(typeof(entity.distance)!='undefined') {
    var distance = entity.distance;
    var aerial = '(Aerial Distance)';
    if (entity.realDistance) {
      distance = entity.realDistance;
      aerial = '';
    }
    if (this.handheld) { 
      fieldHtml+="<table style='width:99%;'><tr><td width='100px'><a class='srfFontPlain'>At "+distance+"</a><td>"; 
    } else { 
      if (this.gui.sideBarUI && fvtOrMap == 'fvt') {
        fieldHtml+="<br class=\'srfFontPlain1\' /><a class='srfFontPlain1'>At <b>"+distance+"</b> "+aerial+"</a>";  
      } else {
        if(entity.type=='center') { } 
        else {
          fieldHtml+="<br class=\'srfFontPlain\' /><a class='srfFontPlain'>At <b>"+distance+"</b> "+aerial+"</a>";  
        }
      }
    }
    if(this.gui.embed && this.gui.embed.locateStores && entity.index==0) {
      fieldHtml+="<a class='srfFont' style='cursor:text;'><b class='highlight'><i>Nearest "+this.gui.embed.locateStores.storeName+" to "+this.gui.embed.locateStores.myLocStr+"</i></b></a>";
    }  
    propCounter++;
    if (this.handheld) {
      if (fvtOrMap == 'fvt') {
        if(this.maxButton)fieldHtml+=this.maxButton;else fieldHtml+="<td><a><img src='"+vidteq.imgPath.blankImg+"'/></a></td>" ;
        if(!this.gui.openScale) 
          fieldHtml +="<td><a style='float:left;' class='srfFont' onclick="+crossPopupText+"><img src='"+vidteq.imgPath.mapZ+"'/></a></td>";
      }
    }
  }  
  popupHeight+=propCounter*15+20;
  return {popupHeight:popupHeight,html:fieldHtml}
}

vidteq._poi.prototype.getEntityHtmlDirection = function (fvtOrMap,shortPop,entity) {
  if (typeof(entity) == 'undefined' && !this.entity) { return; }
  if (typeof(entity) == 'undefined') { entity = this.entity; }
  var idx = entity.index;
  if(typeof(idx) != 'undefined') { idx = entity.lpIndex; }
  var that = this;
  var dirHtml = '';
  var funcList = {};
  var that = this;
  var retOneAnchor = function (id,text,grey) {
    if (that.handheld)
      return "<a id='"+id+"' onfocus='this.blur();' href='javascript:void(0)' >"+text+"&nbsp</a>";
    else
      if (typeof(grey) != 'undefined' && grey) {
        return "<a id="+id+" onfocus='this.blur();' class=basicGrey href='javascript:void(0)' >"+text+"&nbsp</a>";
      } else {
        if (that.gui.sideBarUI && fvtOrMap == 'fvt') {
          var crossPopupText = "'javascript:vidteq.mboxObj.callPopupLocation.apply(vidteq.mboxObj,["+entity.lpIndex+"]);'";
          var fieldHtml ="<a style='float:right' class=srfFont onclick="+crossPopupText+"><img src="+vidteq.imgPath.cameraP+" /></a>";
          return "<a id="+id+" onfocus='this.blur();' style='color:#A88026;text-decoration:none;' class=basic href='javascript:void(0)' >"+text+"&nbsp</a>"+fieldHtml;
        }
        return "<a id="+id+" onfocus='this.blur();' class=basic href='javascript:void(0)' >"+text+"&nbsp</a>";
      }
  }    
   
  if((this.gui.embed && this.gui.embed.minimap)) {
    var a=retOneAnchor("drivingDir_"+idx,"Video based Driving Directions");
    funcList["drivingDir_"+idx] = function () { that.gui.mbox.popoutTheMinimap(); };
    dirHtml+=a;
  } else if(entity.type=='center' || entity.type == 'rcm') { 
  } else if(this.gui.embed && this.gui.embed.locateStores && entity.parentType=='location') {
    var id = "storesAround_"+fvtOrMap+"_"+idx
    var a=retOneAnchor(id,"Search "+this.gui.embed.locateStores.storesName+" Around here");
    funcList[id] = function () { that.gui.io.addAndLocateNBS(that.entity); };
    dirHtml+=a;
  } else {
    if( (!this.gui.embed && entity.parentType != 'endAddress') ||
        entity.parentType == 'locateStores' || 
        (this.gui.embed && this.gui.embed.fix!='start')) {
      var msgString="Directions From";
      if(typeof(this.gui.mbox) != 'undefined' && this.gui.mbox.wowMode && fvtOrMap != 'fvt') { msgString = "From"; }
      if(typeof(idx) == 'undefined' && this.gui.mbox.wowMode) { idx = entity.lpIndex; }
      var id = fvtOrMap+"DirFrom_"+idx;
      if(this.gui.embed && entity.parentType!='locateStores') {
        if(typeof(vidteq.aD)!='undefined' && vidteq.aD.q == 'blocate') {
          if (this.handheld)  msgString="<img src='"+vidteq.imgPath.vidZ+"'>";
          else if(this.gui.sideBarUI) msgString="<span style='font-size:13px'>Video Directions</span>";
          else msgString="<span style='font-size:13px'>Driving directions in Video</span>";
       }
        var a=retOneAnchor(id,msgString);
        funcList[id] = function () { that.mark('start',true) };
        dirHtml += a;
      } else {
        if(entity.parentType == 'locateStores' && 
          (this.gui.embed && this.gui.embed.fix=='end')) {
          var a=retOneAnchor(id,msgString,true);
          dirHtml += a;
        } else {
          var a=retOneAnchor(id,msgString);
          funcList[id] = function () { that.mark('start') };
          dirHtml += a;
        }
      }
    }
    if( (!this.gui.embed && entity.parentType == 'location') ||
      entity.parentType == 'locateStores') {
      dirHtml+="&nbsp;<a onfocus='this.blur();' class=simple>|</a>&nbsp";
    }
    if( (!this.gui.embed && entity.parentType != 'startAddress') || 
      entity.parentType == 'locateStores' || 
      (this.gui.embed && this.gui.embed.fix!='end')) {
      var msgString="Directions To";
      if(typeof(this.gui.mbox) != 'undefined' && this.gui.mbox.wowMode && fvtOrMap != 'fvt') { msgString = "To"; }
      if(typeof(idx) == 'undefined' && this.gui.mbox.wowMode) { idx = entity.lpIndex; }
      var id = fvtOrMap+"DirTo_"+idx;
      if(this.gui.embed && entity.parentType!='locateStores') {
        if(typeof(vidteq.aD)!='undefined' && vidteq.aD.q == 'blocate') {
          if (this.handheld)  msgString="<img src='"+vidteq.imgPath.vidZ+"'>";
          else if(this.gui.sideBarUI) msgString="<span style='font-size:13px'>Video Directions</span>";
          else msgString="<span style='font-size:13px'>Driving directions in Video</span>";
        }
        var a=retOneAnchor(id,msgString);
        funcList[id] = function () { that.mark('end',true) };
        dirHtml += a;
      } else {
        if(entity.parentType == 'locateStores' &&
          (this.gui.embed && this.gui.embed.fix=='start')) {
          var a=retOneAnchor(id,msgString,true);
          dirHtml += a;
        } else {
          var a=retOneAnchor(id,msgString);
          funcList[id] = function () { that.mark('end') };
          dirHtml += a;
        }
      }      
    } 
  }
  return {html:dirHtml,funcList:funcList};
}

vidteq._poi.prototype.getEntityHtmlClose = function (fvtOrMap,shortPop,entity) {
  if (typeof(entity) == 'undefined' && !this.entity) { return {}; }
  if (typeof(entity) == 'undefined') { entity = this.entity; }
  if (fvtOrMap == 'fvt') { return {}; }
  //return "<div oncontextmenu='return false;' style='text-align:center;vertical-align:center'><div style='position:absolute;right:2px;top:2px;height:20px;width:20px;'><img style='cursor:pointer' src='"+vidteq.imgPath.close+"' onclick='javascript:vidteq.mboxObj.removeOpenPopup.apply(vidteq.mboxObj,[])' href='javascript:void(0);'/></div>";
 
  var rightPx = -4;
  if (self.navigator.userAgent.match(/MSIE\s[7]/)){ rightPx = 4; }
  if (self.navigator.userAgent.match(/MSIE\s[8]/)){ rightPx = 6; }
  if (self.navigator.userAgent.match(/MSIE\s[9]/)){ rightPx = 6; }
  var closeHtml = "<div class='entityPopupCloseDiv' style='z-index:99;position:absolute;right:";
  closeHtml+=(typeof(shortPop) != 'undefined' && shortPop)?rightPx:rightPx;

  closeHtml+="px;top:2px;height:20px;width:20px;padding:0px;margin:0px;'><img id=entityPopupClose style='cursor:pointer;padding:0px;margin:0px;' class='entityPopupClose' src='"+vidteq.imgPath.close+"' onclick='javascript:vidteq.mboxObj.removeOpenPopup.apply(vidteq.mboxObj,[])' href='javascript:void(0);'/></div>";
  var that = this;
  var funcList = {entityPopupClose:function () { that.gui.mbox.removeOpenPopup(); }}; 
  //return "<div style='position:absolute;right:7px;top:2px;height:20px;width:20px;'><img style='cursor:pointer' src='"+vidteq.imgPath.close+"' onclick='javascript:vidteq.mboxObj.removeOpenPopup.apply(vidteq.mboxObj,[])' href='javascript:void(0);'/></div>";
  return {html:closeHtml,funcList:funcList};
}

vidteq._poi.prototype.getOneImageHtml = function (imgTT,imgRec,display) {
  var srcA = imgRec.name.toString().split(/,/);
  var imgTT = imgTT || [];
  var display = display ? "display:block;":"display:none;";
  for (var i in srcA) {
    var src = srcA[i]; 
    var url = vidteq.cfg.cloneImageUrl;
    if (imgRec.url) { url = imgRec.url; }
    if (!url.toString().match(/\/$/) && 
        !url.toString().match(/=$/)) url += '/';
    src = url+src;
    imgTT.push("<img style='border:1px solid white;height:240px;width:320px;"+display+"' src="+src+"  />");
    if (display == "display:block;") display = "display:none;";
  }
  return imgTT;
}

vidteq._poi.prototype.getEntityHtmlImage = function (fvtOrMap,shortPop,entity,selectorName) {
  if (typeof(entity) == 'undefined' && !this.entity) { return; }
  if (typeof(entity) == 'undefined') { entity = this.entity; }
  if (fvtOrMap == 'fvt' || (typeof(shortPop) != 'undefined' && shortPop)) {
    return {popupWidth:200,popupHeight:0,html:''};
  }
  var imgHtml = '';
  var imgTT=[];
  var popupWidth=320;  
  var popupHeight=0;

  if(typeof(entity.image)!='undefined' && 
     entity.image !=null && entity.image != '') {
    if (typeof(entity.image) == 'object') { // TBD why not array?
      for (var i in entity.image) {
        this.getOneImageHtml(imgTT,entity.image[i],(parseInt(i)==0));
      }
    } else {
      this.getOneImageHtml(imgTT,{name:entity.image},true);
    }
    popupHeight+=240;popupWidth=335;    
  }
  if(typeof(selectorName) == 'undefined') { selectorName = 'slideShow'; }
  if (imgTT.length == 1) {
    imgHtml = "<div class='"+selectorName+"'>"+imgTT[0]+"</div>"; 
  } else if (imgTT.length > 1) {
    //imgHtml = "<div class='slideShow'>"+imgTT.join(' ')+"</div>"; 
    imgHtml = "<div class='"+selectorName+"'>"+imgTT.join(' ')+"</div>"; 
  } else { imgHtml = "<div></div>"; }
  return {popupWidth:popupWidth,popupHeight:popupHeight,html:imgHtml};
}

vidteq._poi.prototype.getWowEntityPopup = function (fvtOrMap,shortPop,entity,srfType) {
  var max=20;
  var width =300;
  var height = 200;
  var htmlContent={};
  if(typeof(entity.image)!='undefined' && entity.image != null) {
    var category= '';
    if(typeof(entity.category) != 'undefined') {
      category = entity.category;
      category=category.replace(/s$/,"");
    }
    
    htmlContent.content="<div id='catmain' oncontextmenu='return false;' style='postion:absoulte;padding:0px; width:300px;height:"+height+"px'><div  id='nameCat' style='border:opx;padding:0px;background-color:#f15149;text-align:center;width:300px;height:15px'><a  onfocus='this.blur();' class='cat_button' style='color:white;'><b>"+entity.address.name+"</b></a></div>";
    //htmlContent.content+="<div style='position:absolute;top:0px;z-index:10000;'><div id='closeDivContent' style='padding-left:288px; '><img style='cursor:pointer' src='"+vidteq.imgPath.close+"' onclick='javascript:vidteq.mboxObj.universalSelect.unselectAll();vidteq.mboxObj.removeOpenPopup.apply(vidteq.mboxObj,[]);' href='javascript:void(0);'/></div></div>";    
    if(typeof(entity.markIcon) != 'undefined' && typeof(entity.markIcon.mapUrl) != 'undefined') {
      htmlContent.content+="<div style='right:30px; position: absolute; bottom:50px;display:none;'><img width='32' height='32' href='javascript:void(0);' src='"+entity.markIcon.mapUrl+"' style='border:0px solid black;display:block;'  id='popupIcon'/></div>";
    }
    var imageSource=vidteq.cfg.cloneImageUrl+entity.image;
    var multiImage = this.getEntityHtmlImage('map','',entity);
    var multiImgDiv = "<div id='popupImgDiv' >"+multiImage.html+"</div>";
    //htmlContent.imageZoom="<div id='yo' height=80 width=80 style='border-color:#777777;border:0px;position:relative;float:right;margin-right:0px;margin-top:2px;overflow:hidden;padding:0px;'><a class='cat_button' style='color:black;cursor:pointer;'  onclick=\"javascript:vidteq.mboxObj.getBackThumbNail()\"><img id='popimage' class='imagepop' style='border:0px; padding:0px; solid white;position:relative;' alt='Image' height=80 width=80 src='"+imageSource+"' /></a></div>";
    htmlContent.imageZoom="<div id='yo' height=80 width=80 style='border-color:#777777;border:0px;position:relative;float:right;margin-right:0px;margin-top:2px;overflow:hidden;padding:0px;'><a class='cat_button' style='color:black;cursor:pointer;'  onclick=\"javascript:vidteq.mboxObj.getBackThumbNail()\">"+multiImgDiv+"</a></div>";
    htmlContent.content+="<div id='name' style='position:absolute;margin-top:2px;width:200px;height:150px;' >";
    htmlContent.content+="<div class='cat_button' style='text-align:left;width:200px;height:50px;postion:absolute;color:black'><a><b>"+entity.address.name+"</b>";
    if(typeof(entity.address.addr1)!='undefined'){ htmlContent.content+= "<br>"+entity.address.addr1;}
    if(typeof(entity.address.addr2)!='undefined'){ htmlContent.content+= "<br>"+entity.address.addr2;}

    if(typeof(entity.address.addr3)!='undefined'){ htmlContent.content+= "<br>"+entity.address.addr3;}
    if(typeof(entity.address.addr4)!='undefined'){ htmlContent.content+= "<br>"+entity.address.addr4;}
    if(typeof(entity.address.pin)!='undefined'){ htmlContent.content+= "<br>"+entity.address.pin;}
    if(typeof(entity.address.phone)!='undefined'){ htmlContent.content+= "<br>Contact :"+entity.address.phone;}
    if(typeof(entity.address.email)!='undefined'){ htmlContent.content+= "<br>email :"+entity.address.email;}
    if(typeof(entity.address.website)!='undefined'){ htmlContent.content+= "<br><a target='_blank' href='http://"+entity.address.website+"'>"+entity.address.website+"</a>";}
    if(typeof(entity.category)!='undefined'){ htmlContent.content+= "<br><br> Category : "+entity.category;}
    
    htmlContent.content+="<br></a>";
    htmlContent.content+="</div>";

    htmlContent.toFunction = function () {
      entity.index = -1;
      entity.type = 'rcm';
      vidteq.routeEndsObj.replaceEntity('end',entity);
    }
    htmlContent.fromFunction = function () {
      entity.index = -1;
      entity.type = 'rcm';
      vidteq.routeEndsObj.replaceEntity('start',entity);
    }  
  } else {
    width =300;
    height=120;
    htmlContent.content="<div id='catmain' oncontextmenu='return false;' style='postion:absoulte; width:"+width+"px;height:"+height+"px'><div  id='nameCat' style='border:4px;padding:0px;background-color:#f15149;text-align:center;width:"+width+"px;height:15px'><a  onfocus='this.blur();' class='cat_button' style='color:white;'><b>"+entity.address.name+"</b></a></div>";
    //htmlContent.content+="<div style='position:absolute;top:0px;z-index:10000;'><div id='closeDivContent' style='padding-left:288px; '><img style='cursor:pointer' src='"+vidteq.imgPath.close+"' onclick='javascript:vidteq.mboxObj.universalSelect.unselectAll();vidteq.mboxObj.removeOpenPopup.apply(vidteq.mboxObj,[]);' href='javascript:void(0);'/></div></div>";    
    htmlContent.content+="<div id='name' style='position:absolute;width:200px;height:70px;margin-top:2px' >";
    var t = this.getEntityHtmlIcon(fvtOrMap,shortPop,entity);
    htmlContent.imageZoom="";
   // htmlContent.content+="<div style='left: 245px; position: absolute;display:none;'><img width='32' height='32' href='javascript:void(0);' src='"+t.html+"' style='border:0px solid black;display:block;'  id='popupIcon'/></div>";
    htmlContent.content+="<div style='right:30px; position: absolute; bottom:50px;display:none;'><img width='32' height='32' href='javascript:void(0);' src='' style='border:0px solid black;display:block;'  id='popupIcon'/></div>";
    htmlContent.content+="<div class='cat_button'  style='width:200;height:40px;text-align:left'><b>"+entity.address.name+"</b>";
    if(typeof(entity.address.addr4)!='undefined'){ htmlContent.content+= "<br>"+entity.address.addr4;}
    if(typeof(entity.address.addr3)!='undefined'){ htmlContent.content+= "<br>"+entity.address.addr3;}
    if(typeof(entity.address.pin)!='undefined'){ htmlContent.content+= "<br>"+entity.address.pin;}
    if(typeof(entity.address.phone)!='undefined'){ htmlContent.content+= "<br> Contact : "+entity.address.phone;}
  }
  htmlContent.size= new OpenLayers.Size(width,height);
  htmlContent.width = width;
  htmlContent.height = height;
  return htmlContent;
}



vidteq._poi.prototype.getEntityHtml = function (fvtOrMap,shortPop,entity,srfType) {
  if (typeof(entity) == 'undefined' && !this.entity) { return; }
  if (typeof(entity) == 'undefined') { entity = this.entity; }
  var row;
  //var data = { entity : entity, entityName : 'blah' };
  //var tempFvtRow = TrimPath.processDOMTemplate("fvtRow", data);
  var mapRow;
  var funcList = {};
  //var popupHeight=50;
  var popupHeight=0;

  var htmlContent = {};
  if(typeof(this.gui.mbox) != 'undefined' && this.gui.mbox.wowMode) {
    var zoom= this.gui.mbox.getCurrentZoom();
    htmlContent = this.getWowEntityPopup(fvtOrMap,shortPop,entity,srfType);
    var width = htmlContent.width;
    var height = htmlContent.height;
  }

  row="<tr style='background-color:inherit;'>";
  if (!(typeof(shortPop) != 'undefined' && shortPop)) {
    var t = this.getEntityHtmlIcon(fvtOrMap,shortPop,entity);
    row+=t.html; 
    $.extend(funcList,t.funcList);
  }
  if (fvtOrMap == 'fvt' || (typeof(shortPop) != 'undefined' && shortPop)) {
  //if (fvtOrMap == 'fvt') { row += "<td>"; } 
    row += "<td>"; 
  } else { row+="<td style='background-color:white'>"; }
  if (fvtOrMap == 'fvt' || (typeof(shortPop) != 'undefined' && shortPop)) {
    row+="<b class='b1f'></b><b class='b2f'></b><b class='b3f'></b><b class='b4f'></b>";
  }
  var fieldContent = this.getEntityHtmlFields(fvtOrMap,shortPop,entity);
  popupHeight += fieldContent.popupHeight;
  if (this.gui.sideBarUI && fvtOrMap == 'fvt') {
    row += "<table cellspacing=0; cellpadding=0; width=100% style='background-color:#0E0E0E;'><tr>";
  } else {
    row += "<table cellspacing=0; cellpadding=0; width=100% style='background-color:white;'><tr>";
  }
  if ((typeof(shortPop) != 'undefined' && shortPop)) {
    var t = this.getEntityHtmlIcon(fvtOrMap,shortPop,entity);
    row+=t.html; 
    $.extend(funcList,t.funcList);
  }
  //row+="<td><div style='background-color:white;padding-left:10px;padding-top:5px;padding-bottom:5px;"+((fvtOrMap == 'fvt')?'cursor:pointer;':'')+"' onfocus='this.blur();'>";
  if (this.gui.sideBarUI && fvtOrMap == 'fvt') {
    row+="<td><div style='background-color:transparent;padding-left:10px;padding-top:5px;padding-bottom:5px;' onfocus='this.blur();'>";
  } else {
    row+="<td><div style='background-color:white;padding-left:10px;padding-top:5px;padding-bottom:5px;' onfocus='this.blur();'>";
  }
  row += fieldContent.html;
  var t = this.getEntityHtmlDirection(fvtOrMap,shortPop,entity);
  $.extend(funcList,t.funcList);
  if (this.handheld) {
    row += "<td ";
    if(this.gui.openScale && !this.gui.handheld) { 
      row += " style='text-align:center;' ";
    } else {
      row += " style='text-align:right;' ";
    }
    row += " ><div style=''>"+t.html+"</div></td></tr></table>";
  } else {
    row += "<div>"+t.html+"</div>";
  }

  if(typeof(this.gui.mbox) != 'undefined' && this.gui.mbox.wowMode) {
    htmlContent.content+="<div id='bottomAd' class='cat_button'  style ='position:absolute; bottom:-25px ;width:"+width+"px;height:20px'>";
    if(t.html != '') {
      //if (!self.navigator.userAgent.match(/MSIE/)){
        htmlContent.content+="<a>Directions : </a>";
      //}
      htmlContent.content+=t.html;
      if(zoom < 6) htmlContent.content+= " <a class='simple' onfocus='this.blur();'>|</a> ";
    }
    var lonLat = this.gui.mbox.lonLatObjFrmPoint(entity.geom);
    if(zoom<6){
      htmlContent.content+= " <a style='color:blue;cursor:pointer;text-align:right'onclick=\"javascript:vidteq.mboxObj.removeOpenPopup();vidteq.mboxObj.zoomToBottom("+lonLat.lon+","+lonLat.lat+")\">";
      htmlContent.content+="Zoom To Street Level</a>";
    }  
    htmlContent.content+="</div></div>";
    htmlContent.content+=htmlContent.imageZoom;
    htmlContent.content+= "</div>";
  }

  //popupHeight += 15; // for direction we need height
  row += "</div></td>";
  if (this.gui.sideBarUI) { } else {
    row += "<td width=10></td>";
  }
  row += "</tr></table>";
  if (fvtOrMap == 'fvt' || (typeof(shortPop) != 'undefined' && shortPop)) {
    row += "<b class='b4f'></b><b class='b3f'></b><b class='b2f'></b><b class='b1f'></b>";
  }
  row += "</td></tr>";

  if (fvtOrMap == 'fvt') return {html:row,funcList:funcList};
  var popupWidth=0;  
  //var mapRow = this.getEntityHtmlClose(fvtOrMap,entity,shortPop);
  var mapRow = '';
  var imgDiv = this.getEntityHtmlImage(fvtOrMap,shortPop,entity);
  popupWidth += imgDiv.popupWidth;
  popupHeight += imgDiv.popupHeight;
  mapRow += imgDiv.html; 
  //mapRow+="<div style='text-align:left;background-color:transparent;'><table width=100% cellspacing=0; cellpadding=0; style='padding-top:5px;padding-left:5px;padding-right:5px;'>"+row+"</table></div></div>";
  mapRow+="<div class='popContentInnerStyle' style='text-align:left;background-color:rbga(255, 255, 255, 0.5);'><table width=97% cellspacing=0; cellpadding=0; style='padding-top:0px;padding-left:0px;padding-right:0px; margin-left:0px;margin-top:5px;margin-right:0px;'>"+row+"</table></div>";
  // now final encasement
  mapRow = "<div id=finalPopContent oncontextmenu='return false;' style='text-align:center;vertical-align:center;width:"+popupWidth+"px;padding:0px;margin:0px;'>"+mapRow+"</div>";
  if(typeof(this.gui.mbox) != 'undefined' && this.gui.mbox.wowMode) {
    mapRow = htmlContent.content;
    popupWidth = width;
    popupHeight = height;  
  }
  return {
    popupWidth : popupWidth,
    popupHeight : popupHeight,
    contentHTML : mapRow,
    funcList : funcList
  };
}


vidteq._poi.prototype.getResultsForHandheld = function () {
  var entity = this.entity;
  var addrcontent='';
  var addrParams = this.getAddrParams();
  for(var index in addrParams) {
    var p = addrParams[index];
    for(var prop in entity.address) {
      if(prop==p.field && entity.address[prop]!=null && prop!='website' && prop!='email' && prop!='workhrs' ) {
        addrcontent+=entity.address[prop];
        addrcontent+='&nbsp;';
      }
    }
  }
  var funcObj=this.getEntityHtmlDirection('fvt',undefined);
  var html="<div class='resHolder'><table width='100%'><tr><td>"+entity.address.name+"</td><td style='text-align:right;'>"+funcObj.html+"</td></tr><tr><td colspan='2'>"+addrcontent+"</td></tr></table></div>";
  return {funcObj:funcObj,html:html};
  //$.tmpl( "matchesTemplate", results ).appendTo('#matchResultsCont');
  //var addArray = {addrName:entity.address.name,addrContent:addrcontent};
  //return addArray;
}

