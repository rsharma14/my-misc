/*
 * Production javascript
 *
 * Copyright (c) 2008 Vidteq India Pvt Ltd
 * and GPL (GPL-LICENSE.txt) licenses.MSI
 *
 * $Rev: $
 */
if (typeof(vidteq) == 'undefined') { vidteq = {}; }

vidteq._routeEnds = function () {
  this.tips = {start:{},end:{}};
  this.viaSet = [];
  this.startIcon = {
    mapUrl : vidteq.imgPath.startIconUrl,
    fvtUrl : vidteq.imgPath.startIconUrl,
    mapStyle : "cursor:pointer;",
    fvtStyle : "cursor:pointer;",
    size : 45,
    w : 45,
    h : 45,
    title : 'Start Place'
  };
  this.endIcon = {
    mapUrl : vidteq.imgPath.endIconUrl,
    fvtUrl : vidteq.imgPath.endIconUrl,
    mapStyle : "cursor:pointer;",
    fvtStyle : "cursor:pointer;",
    size : 45,
    w : 45,
    h : 45,
    title : 'End Place'
  };
}

// RouteEnd functions
vidteq._routeEnds.prototype.isNotEmpty = function(which) {
  if (typeof(this.tips[which]) == 'undefined' || this.tips[which] == null) return false ;
  for(var prop in this.tips[which]) {
    if(this.tips[which].hasOwnProperty(prop)) return true; 
  }
  return false;
}

vidteq._routeEnds.prototype.isEqual = function(which,entity) {
  if (!this.isNotEmpty(which)) return false;
  if (this.tips[which] == entity) return true;
  // not sure if above statement works
  //if (this.tips[which].index == entity.index &&
  //    this.tips[which].parentType == entity.parentType) return true;
  return false; 
}

vidteq._routeEnds.prototype.get = function(which) {
  if (!this.isNotEmpty(which)) return null;
  // TBD we need store a PreRoute version
  if (this.tips[which].geom) {
    //var pObj=vidteq.mboxObj.lonLatObjFrmPoint(this.tips[which].geom);
    var pObj=vidteq.utils.lonLatObjFrmPoint(this.tips[which].geom);
    var str = pObj.lon+","+pObj.lat;
    return (str);
  }
  if (this.tips[which].address && this.tips[which].address.name) {
    return (this.tips[which].address.name);
  }
  return "Anywhere";
}

vidteq._routeEnds.prototype.getRouteStr = function() {
  this.link=encodeURI("?q=route&start="+this.get('start')+"&end="+this.get('end'));
  return (this.link);
}

vidteq._routeEnds.prototype.refresh = function(which) {
  if (!this.isNotEmpty(which)) return;
  if (this.mbox) this.mbox.removeSePoint(this.tips[which]);
  this.tips[which].startOrEnd=which; 
  if (this.mbox) this.mbox.putSePoint(this.tips[which]);
  //if (this.tips[which].type && (this.tips[which].type == 'center' || this.tips[which].type == 'rcm')) {
  //  vidteq.mboxObj.removeStartEndPoint(which);
  //  this.tips[which].startOrEnd=which; 
  //  vidteq.mboxObj.putStartEndPoint(which,this.tips[which]);
  //} else {
  //  vidteq.mboxObj.refreshLocatorPoint(this.tips[which]);
  //}
}

vidteq._routeEnds.prototype.detach = function(which) {
  if (!this.isNotEmpty(which)) return;
  if (!this.tips[which].type || this.tips[which].type != 'center') {
    
    //this.tips[which].icon = (which == 'start') ? startIcon : endIcon;
    //this.tips[which].icon = (which == 'start') ? vidteq.mboxObj.startIcon : vidteq.mboxObj.endIcon;
    this.tips[which].icon = (which == 'start') ? this.startIcon : this.endIcon;
    this.tips[which].index = -1;
    this.tips[which].type = 'rcm';
  }
  // TBD do I show ?
}
vidteq._routeEnds.prototype.checkSameEntityInTips = function(which,entity,opt) {
  var notOfWhich = 'end';
  if (which == 'end') notOfWhich = 'start';
  if (this.tips[notOfWhich] == entity) {
    //console.log("Error same entity in other tip "+which);
  }
}

vidteq._routeEnds.prototype.replaceEntity = function(which,entity,opt) {
  this.remove(which,opt);
  this.checkSameEntityInTips(which,entity);
  this.add(which,entity,opt);
}

vidteq._routeEnds.prototype.replace = function(which,index,source) {
  this.remove(which);
  this.addByIndex(which,index,source);
}

vidteq._routeEnds.prototype.remove = function(which,removeCenterAsWell) {
  if (!this.isNotEmpty(which)) return;
  if (this.tips[which].type && this.tips[which].type == 'center') {
    if (typeof(removeCenterAsWell) == 'undefined' || !removeCenterAsWell) return;
  }
  //this.removeAllVias();  // TBD
  if (this.tips[which].index == -1 ) {
    //vidteq.mboxObj.removeStartEndPoint(which);
    //this.mbox.removeSePoint(this.tips[which]);
    if (this.mbox) this.mbox.removeSePoint(this.tips[which]);
    delete this.tips[which].startOrEnd;
    this.tips[which]={};
  } else { 
    var entity = this.tips[which];
    //this.mbox.removeSePoint(this.tips[which]);
    if (this.mbox) this.mbox.removeSePoint(this.tips[which]);
    delete this.tips[which].startOrEnd;
    //if (this.tips[which].type && this.tips[which].type == 'center') {
    //  vidteq.mboxObj.removeStartEndPoint(which);
    //  delete this.tips[which].startOrEnd;
    //} else {
    //  delete this.tips[which].startOrEnd;
    //  this.tips[which] = {};
    //  vidteq.mboxObj.refreshLocatorPoint(entity);
    //}
    //if (vidteq.mboxObj.isPopupActiveFor(entity)) {
    if (this.mbox && this.mbox.isPopupActiveFor(entity)) {
      if (entity.icon) document.getElementById('popupIcon').src=entity.icon.mapUrl;
      if (entity.markIcon) document.getElementById('popupIcon').src=entity.markIcon.mapUrl;
      // TBD - rather remove the popup, icon is not present in some cases
    }
  }
  this.tips[which] = {};
}

vidteq._routeEnds.prototype.addByIndex = function(which,index,source) {
  if ( index == -1 ) { // RCM case
    this.tips[which] = {
      index : index,
      type  : 'rcm', 
      lonlat : { lon : source.lon, lat : source.lat },
      geom : "POINT("+source.lon+" "+source.lat+")",
      address : { name : 'Your location' }
    };
    this.tips[which].startOrEnd=which; 
    //vidteq.mboxObj.putStartEndPoint(which,this.tips[which]);
    //this.mbox.putSePoint(this.tips[which]);
    if (this.mbox) this.mbox.putSePoint(this.tips[which]);
    ioAreaObj.getRoadName(source,which);  // return TBD
  }  else { // srf select case
    this.tips[which] = ioAreaObj.getEntity.apply(ioAreaObj,[source,index]);
    // Catch - remove other end if other end is same as this end
    var notOfWhich = 'end';
    if (which == 'end') notOfWhich = 'start';
    if (this.isNotEmpty(notOfWhich) && this.tips[which] == this.tips[notOfWhich] ) 
      this.remove(notOfWhich);
    this.tips[which].startOrEnd=which;
    //if ( this.tips[which].geom ) { this.mbox.putSePoint(this.tips[which]); }
    if ( this.tips[which].geom && this.mbox ) { this.mbox.putSePoint(this.tips[which]); }
    //if (source == 'center') {
    //  this.tips[which].startOrEnd=which; 
    //  vidteq.mboxObj.putStartEndPoint(which,this.tips[which]);
    //} else {
    //  this.tips[which].startOrEnd=which; 
    //  vidteq.mboxObj.refreshLocatorPoint(this.tips[which]);
    //}
    //var iconUrl = startIconUrl;
    var iconUrl = vidteq.imgPath.startIconUrl;
    //if(which=='end') iconUrl = endIconUrl;
    if(which=='end') iconUrl = vidteq.imgPath.endIconUrl;
    if (this.tips[which].type && this.tips[which].type == 'center' && this.tips[which].icon) iconUrl = this.tips[which].icon.mapUrl;
    //if (vidteq.mboxObj.isPopupActiveFor(this.tips[which])) document.getElementById('popupIcon').src=iconUrl;
    if (this.mbox && this.mbox.isPopupActiveFor(this.tips[which]) && $('#popupIcon').length > 0) document.getElementById('popupIcon').src=iconUrl;
    var name = this.getName(which);
    if (this.gui) { this.gui.fillKeyBox(which,name); }
    else {
      ioAreaObj.fillIoForm.apply(ioAreaObj,[which,name]);
    }
  }
}

// small function till we make everything ok
vidteq._routeEnds.prototype.getName = function(which) {
  var name;
  if (typeof(this.tips[which].name)!='undefined') name = this.tips[which].name;
  if (typeof(this.tips[which].address)!='undefined' &&
      typeof(this.tips[which].address.name)!='undefined') name = this.tips[which].address.name;
  if (typeof(name) == 'undefined') name = this.tips[which].geom;
  return name;
}

vidteq._routeEnds.prototype.add = function(which,entity,opt) {
  this.tips[which] = entity;
  // Catch - remove other end if other end is same as this end
  var notOfWhich = 'end';
  if (which == 'end') notOfWhich = 'start';
  if (this.isNotEmpty(notOfWhich) && this.tips[which] == this.tips[notOfWhich]) {
    this.remove(notOfWhich);
  }
  if (this.tips[which].type && this.tips[which].type == 'rcm') { 
    this.tips[which].startOrEnd=which; 
    //vidteq.mboxObj.putStartEndPoint(which,this.tips[which]);
    if (this.mbox) this.mbox.putSePoint(this.tips[which]);
    if (this.gui) { this.gui.fillKeyBox(this.tips[which],which); }
    else { 
      if ((typeof(this.tips[which].address)!='undefined' &&
        typeof(this.tips[which].address.name)!='undefined') || 
        typeof(this.tips[which].name!='undefined')) {
        ioAreaObj.fillIoForm.apply(ioAreaObj,[which,this.getName(which)]);
      } else {
        ioAreaObj.getRoadName(this.tips[which].lonlat,which);  // return TBD
      }
    }
  } else { // srf select case
    this.tips[which].startOrEnd=which; 
    if (this.mbox) this.mbox.putSePoint(this.tips[which]);
    //if (this.tips[which].type && this.tips[which].type == 'center') {
    //  this.tips[which].startOrEnd=which; 
    //  vidteq.mboxObj.putStartEndPoint(which,this.tips[which]);
    //} else { 
    //  this.tips[which].startOrEnd=which; 
    //  vidteq.mboxObj.refreshLocatorPoint(this.tips[which]);
    //}
    //var iconUrl = startIconUrl;
    var iconUrl = vidteq.imgPath.startIconUrl;
    //if(which=='end') iconUrl = endIconUrl;
    if(which=='end') iconUrl = vidteq.imgPath.endIconUrl;
    if (this.tips[which].type && this.tips[which].type == 'center' && this.tips[which].icon) iconUrl = this.tips[which].icon.mapUrl;
    if (this.mbox && this.mbox.isPopupActiveFor(this.tips[which])) document.getElementById('popupIcon').src=iconUrl;
    if (opt && opt.noFillKeyBox) { } else {
      if (this.gui) {
        this.gui.fillKeyBox(this.tips[which],which); 
      } else { 
        var name = this.getName(which);
        ioAreaObj.fillIoForm.apply(ioAreaObj,[which,name]);
      }
    }
  }
}

vidteq._routeEnds.prototype.swap = function() {
  var startPresent = this.isNotEmpty('start');
  var endPresent = this.isNotEmpty('end');
  var start,end;
  if (startPresent) {
    start = this.tips['start'];
    this.remove('start',true);
  }
  if (endPresent) {
    end = this.tips['end'];
    this.remove('end',true);
  }
  if (startPresent) { this.add('end',start); }
  if (endPresent) { this.add('start',end); }
}

vidteq._routeEnds.prototype.getCenter = function() {
  if (this.isNotEmpty('start') && this.tips['start'].type && this.tips['start'].type == 'center') { return this.tips['start']; }
  if (this.isNotEmpty('end') && this.tips['end'].type && this.tips['end'].type == 'center') { return this.tips['end']; }
  return null;
}

vidteq._routeEnds.prototype.addViaSet = function(addViaSet,sorted) {
  var sortedViaSet = [];
  if (typeof(sorted) != 'undefined' && sorted) {
    sortedViaSet = addViaSet;
  } else {
    if (this.isNotEmpty('start') && this.tips.start.geom) {
    } else { 
    } 
  }
  for (var i in sortedViaSet) {
    this.addVia(sortedViaSet[i],i);
  }
}

vidteq._routeEnds.prototype.addVia = function(entity,idx) {
  // some times geom is not present instead lon and lat is present
  if (!entity.geom && entity.lon && entity.lat ) {
    entity.geom = 'POINT('+entity.lon+' '+entity.lat+')';
  }
  if (!entity.lonlat) { entity.lonlat = vidteq.utils.lonLatObjFrmPoint(entity.geom); }
  if (!entity.type) { entity.type = 'via'; }
  if (typeof(idx) == 'undefined') { 
    // TBD ordering
    idx = this.viaSet.length; 
  }
  if (!entity.icon) {
    entity.icon = {mapUrl:vidteq.imgPath.viaBallMarkers+"v"+(parseInt(idx)+1)+".png"+'?r='+vidteq.cfg._rStr,w:32,h:32};
  }
  entity.viaIdx = idx;
  this.viaSet.push(entity);
  if (this.mbox) this.mbox.addVia(entity);
  if (this.gui) { this.gui.fillKeyBoxAfterFindhood(entity,'via'); }
}

vidteq._routeEnds.prototype.removeAllVias = function(entity) {
  if (this.mbox) this.mbox.clearViaMarkers();
  //for (var i in this.viaSet) {
  //  this.removeVia(this.viaSet[i]);
  //}
  this.viaSet = [];
}

vidteq._routeEnds.prototype.removeVia = function(entity) {
  
}

vidteq._routeEnds.prototype.getViaString = function() {
  var viaA = [];
  for(var i in this.viaSet) {
    viaA.push(''+this.viaSet[i].lonlat.lon+' '+this.viaSet[i].lonlat.lat);
  }
  var viaStr = viaA.join(',');
  if (viaStr == '') return null;
  return viaStr;
}

vidteq._routeEnds.prototype.detachCenter = function() {
  for (var i in this.tips) {
    if (!this.isNotEmpty(i)) { continue; }
    //if (this.tips[i].tyep && this.tips[i].type != 'center') { continue; }
    this.tips[i].type = 'rcm';
    this.tips[i].index = -1;
  }
}

