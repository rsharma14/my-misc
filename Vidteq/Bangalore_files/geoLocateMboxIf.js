
if (typeof(vidteq) == 'undefined') { vidteq = {}; }

vidteq._geoLocateMboxIf = function (mbox,gL,opt) {
  this.mbox = mbox;
  this.gL = gL;
  opt = opt || {};
  this.perFeatureStyling = true;
  if ('perFeatureStyling' in opt) { 
    this.perFeatureStyling = opt.perFeatureStyling;
  }
  this.layer = opt.layer || this.mbox.decoLayer;
  this.init(opt);
  this.kivDisable = false;
  if ('kivDisable' in opt) { this.kivDisable = opt.kivDisable; }
}

vidteq._geoLocateMboxIf.prototype.init = function (opt) {
  this.defaultManStyle = {
   externalGraphic : opt.iconImg || "images/wap/buddypin2.png",
   graphicWidth : 52,
   graphicHeight : 42,
   graphicXOffset : -11,
   graphicYOffset : -42
//  strokeColor: "Red"
//  ,fillColor:"black"
//  ,strokeOpacity: 0.7
//  ,strokeWidth: 2
//  ,pointRadius:8
  };
  this.defaultManShadowStyle = {
    strokeColor: "Red"
    ,fillColor:"black"
    ,strokeOpacity: 0.1
    ,strokeWidth: 2
    ,pointRadius:8
    ,fillOpacity:0.1
  };
  this.defaultManMoveStyle = {
    strokeColor: "Orange"
    ,fillColor: "Gray"
    ,strokeOpacity: 0.7
    ,strokeWidth: 2
    ,pointRadius:8
  };
  this.defaultManMoveShadowStyle = {
    strokeColor: "Orange"
    ,fillColor: "Gray"
    ,strokeOpacity: 0.1
    ,strokeWidth: 2
    ,pointRadius:8
    ,fillOpacity:0.1
  };
}

vidteq._geoLocateMboxIf.prototype.getManStyle = function () {
  var h = 42; var w = 52; var o = 11;
  //return {
  //  //externalGraphic:vidteq.imgPath.buddy+'?r='+vidteq.cfg._rStr
  //  //,graphicOpacity : 0.5
  //  //,graphicOpacity : "${opac}"
  //  graphicWidth:w
  //  ,graphicHeight:h
  //  ,graphicXOffset:o
  //  ,graphicYOffset:-h
  //  ,pointRadius: 8
  //  ,fillOpacity: "${getFillOpacity}"
  //  ,strokeOpacity: "${getStrokeOpacity}"
  //  ,context:{
  //    getFillOpacity : function (feature) {
  //      if (feature.data.opacity) {
  //        return feature.data.opacity;
  //      } else {
  //        return "1.0";
  //      }
  //    }
  //    ,getStrokeOpacity : function (feature) {
  //      if (feature.data.opacity) {
  //          return feature.data.opacity;
  //        } else {
  //          return "1.0";
  //        }
  //    }
  //    ,opac : function (feature) { 
  //      console.log("opac called ");
  //      if (feature.data.opacity) {
  //        return feature.data.opacity;
  //      } else {
  //        return 1;
  //      } 
  //    }
  //  }
  //};
  var manStyle = new OpenLayers.Style({
    //externalGraphic:vidteq.imgPath.buddy+'?r='+vidteq.cfg._rStr
    //,graphicOpacity :0.5
    //,graphicOpacity : "${opac}"
    graphicWidth:w
    ,graphicHeight:h
    ,graphicXOffset:o
    ,graphicYOffset:-h
    ,fillColor: "#3300FF"
    //,fillOpacity: 0.5
    ,fillOpacity: "${getFillOpacity}"
    ,strokeOpacity: "${getStrokeOpacity}"
    ,strokeColor: "black"
    ,strokeWidth: 2
    ,pointRadius: 8
  },{ context:{
    getFillOpacity : function (feature) {
      if (feature.data.opacity) {
        return feature.data.opacity;
      } else {
        return "1.0";
      }
    }
    ,getStrokeOpacity : function (feature) {
      if (feature.data.opacity) {
          return feature.data.opacity;
        } else {
          return "1.0";
        }
    }
    ,opac : function (feature) { 
      if (feature.data.opacity) {
        return feature.data.opacity;
      } else {
        return 1;
      } 
    }
  }});
  return manStyle;
}

//vidteq.geoL.prototype.plotCar = function (lat, lon, accuracy,bLonLat) {}
// It has been graduated from gl-lite to here
vidteq._geoLocateMboxIf.prototype.plotMan = function (pos,trail,opt) {
  //if(typeof(explicit)==='undefined') explicit=false;
  if (this.mbox.isInCity(pos)) { } else {
    // TBD should I clear everything ?
    //if(!explicit) return;
    if (opt.explicit) {} else return;
  }
  var lon = parseFloat(pos.lon);
  var lat = parseFloat(pos.lat);
  //if (!this.firstTimeCenter) {
  //  this.map.setCenter(new OpenLayers.LonLat(lon,lat), 3);
  //  this.firstTimeCenter = true;
  //}

  if (this.manFeature) {
    this.manFeature.move(new OpenLayers.LonLat(lon,lat));
  } else {
    var point = new OpenLayers.Geometry.Point(lon,lat);
    //this.manFeature = new OpenLayers.Feature.Vector(point,{man:true},this.getManStyle());
    if (this.perFeatureStyling) {
      this.manFeature = new OpenLayers.Feature.Vector(point,{man:true},this.defaultManStyle);
    } else {
      var data = opt.inData ? $.extend({},opt.inData) : {man:true};
      this.manFeature = new OpenLayers.Feature.Vector(point,data);
    }
    this.layer.addFeatures([this.manFeature]);  
  }
  if (this.manMoveFeature) {  // bring prediction back
    this.manMoveFeature.move(new OpenLayers.LonLat(lon,lat));
    this.clearManMoveShadow();
  }
  this.plotAccuracy(pos);
  this.plotManShadow(trail,opt);
  this.layer.refresh();
  this.layer.redraw();
  if (this.kivDisable) { } else {
    if(typeof(vidteq.navigate) !='undefined' && vidteq.navigate.routeActive){} 
    else{
    if(!this.firstTimeCenter){
      this.mbox.map.setCenter(new OpenLayers.LonLat(lon,lat),2);
      this.firstTimeCenter=true;
    } else {
      if(!this.mbox.gpsCenterDisable) 
        this.mbox.keepInView({lon:lon,lat:lat},"gps");
      }
    }
  }
}

vidteq._geoLocateMboxIf.prototype.plotAccuracy = function (pos) {
  // TBD show accuracy
  //if(parseInt(accuracy)<10)
}

vidteq._geoLocateMboxIf.prototype.plotManShadow = function (trail,opt) {
  if (!('manShadow' in this)) { this.manShadow = {}; }
  this.plotShadow(trail,this.manShadow,this.defaultManShadowStyle,opt);
}

vidteq._geoLocateMboxIf.prototype.plotManMove = function (pos,trail,opt) {
  if (!pos) {
    this.clearManMove();
    return;
  }
  opt = opt || {};
  var lon = parseFloat(pos.longitude);
  var lat = parseFloat(pos.latitude);
  //this.keepInView(lon,lat,"gps");  // TBD needed ?

  if (this.manMoveFeature) {
    this.manMoveFeature.move(new OpenLayers.LonLat(lon,lat));
  } else {
    var point = new OpenLayers.Geometry.Point(lon,lat);
    var data = opt.inData ? $.extend({},opt.inData) : {manMove:true};
    if (this.perFeatureStyling) {
     this.manMoveFeature = new OpenLayers.Feature.Vector( point ,data ,this.defaultManMoveStyle);
    } else {
     this.manMoveFeature = new OpenLayers.Feature.Vector(point,data);
    }
    this.layer.addFeatures([this.manMoveFeature]);  
  }
  this.plotManMoveShadow(trail);
  this.layer.refresh();
  this.layer.redraw();
}

vidteq._geoLocateMboxIf.prototype.clearManMoveShadow = function () {
  if (this.manMoveShadow) {
    for (var i in this.manMoveShadow) {
      this.layer.destroyFeatures([this.manMoveShadow[i].f]); 
    }
    delete this.manMoveShadow;
  }
}

vidteq._geoLocateMboxIf.prototype.clearManMove = function () {
  if (!this.mbox) { return; }
  if (!this.layer) { return; }
  if (this.manMoveFeature) {
    // TBD instead of deleting - just vanish it
    this.layer.destroyFeatures([this.manMoveFeature]); 
    delete this.manMoveFeature;
  }
  this.clearManMoveShadow();
  this.layer.refresh();
  this.layer.redraw();
}

vidteq._geoLocateMboxIf.prototype.plotManMoveShadow = function (trail,opt) {
  if (!('manMoveShadow' in this)) { this.manMoveShadow = {}; }
  this.plotShadow(trail,this.manMoveShadow,this.defaultManMoveShadowStyle,opt);
}

vidteq._geoLocateMboxIf.prototype.plotShadow = function (trail,keeper,style,opt) {
  opt = opt || {};
  // protection  TBD
  if (Object.keys(keeper).length > 50) { return; }
  for (var i in keeper) {
    keeper[i].needed = false;
  }
  var added = 0;
  var opacRef = 1.0 + 0.05;
  for (var i in trail) {
    opacRef -= 0.05;
    if (opacRef < 0) { break; }
    var t = trail[i];
    var k = ''+t.lon+'_'+t.lat;
    if (keeper[k]) {
      var one = keeper[k];
      var f = one.f;
      //one.opac = one.opac - 0.1;
      one.opac = opacRef;
      if (one.opac < 0) { 
        one.opac = 0; 
      } else {
        one.needed = true;
      }
      //f.move(new OpenLayers.LonLat(t.lon,t.lat));
      if (opt.setOpacFunc) {
        opt.setOpacFunc(f,one.opac);
      } else {
        f.data.opacity = one.opac;
      }
    } else {
      added++;
      var point = new OpenLayers.Geometry.Point(t.lon,t.lat);
      //keeper[k] = new OpenLayers.Feature.Vector(point,{trail:true,needed:true,opacity:opac},this.getManStyle());
      var data = opt.inData ? $.extend({},opt.inData) : {trail:true,opacity:opacRef};
      var f;
      if (this.perFeatureStyling) {
       f = new OpenLayers.Feature.Vector( point ,data ,style);
      } else {
       f = new OpenLayers.Feature.Vector(point,data);
      }
      if (opt.setOpacFunc) {
        opt.setOpacFunc(f,opacRef);
      }
      keeper[k] = {
        needed:true
        ,opac:opacRef
        ,f:f
      };
      this.layer.addFeatures([keeper[k].f]);  
    }
  }
  var deleted = 0;
  for (var i in keeper) {
    if (keeper[i].needed) { continue; }
    this.layer.destroyFeatures([keeper[i].f]);  
    delete keeper[i];
    deleted++;
  }
  //console.log("added "+added+" deleted "+deleted);
}

vidteq._geoLocateMboxIf.prototype.stopKIV = function(callback) {
  this.kIVStateBlackOut = false;
  if (this.kIVTimer) {
    clearTimeout(this.kIVTimer);
  }
  var that = this;
  this.kIVTimer = setTimeout(function(){
    that.kIVStateBlackOut = true;
    if (callback) { callback(); }
  },10000);
}

//vidteq._geoLocateMboxIf.prototype.alterKIVState = function(what) {
//  if (!('kIVStateGps' in this)) { this.kIVStateGps = true; }
//  if (!('kIVStateVideo' in this)) { this.kIVStateVideo = true; }
//  if (!('kIVStateBlackOut' in this)) { this.kIVStateBlackOut = false; }
//  if(this.gL.diffStart) { 
//    this.kIVStateGps = false;
//    this.kIVStateVideo = true;
//    if( what=='video'){
//      if(!vidteq.mobUI.keepInView) {
//        this.kIVStateVideo = false;
//      }
//    }
//    return;
//  }
//  if (what=='gps'){                                //this loop
//    this.kIVStateGps = false;
//    if (this.panAble && !this.gL.videoPlaying && 
//        window.location.hash!='#directionsDiv') {
//      this.kIVStateGps = true;
//    }
//    //if(vidteq.eVisit) { }
//    if (vidteq.mobUI.embed) {
//      this.kIVStateGps = false;
//    }
//  } else { 
//    this.kIVStateVideo = false;
//    if (vidteq.mobUI.keepInView) { 
//      this.kIVStateVideo = true;
//    }
//  }
//  // temp
//  this.kIVStateGps = true;
//  this.kIVStateVideo = true;
//}
//
//vidteq._geoLocateMboxIf.prototype.keepInView = function(lon,lat,what) {
//  if(!vidteq.mobUI.keepInView) { return; } // temporary TBD till we understand
//  this.alterKIVState(what);
//  var pos = {lon:lon,lat:lat};
//  if (what == 'gps') { this.kIVPosGps = pos; }
//  if (what == 'video') { this.kIVPosVideo = pos; }
//  if (this.kIVStateBlackOut) { return; }
//  var vBound = this.mbox.map.getExtent().scale(0.8);
//  var within = vBound.containsLonLat(pos);
//  if (within) { return; }
//  var vCenter = vBound.getCenterLonLat();
//  var newCenter = {
//    lon:(vCenter.lon - (vCenter.lon-pos.lon)*0.3).toFixed(6)
//    ,lat:(vCenter.lat - (vCenter.lat-pos.lat)*0.3).toFixed(6)
//  }
//  if (this.kIVStateVideo && !this.kIVStateGps && what == 'video') {
//    this.mbox.changeMapView(undefined,newCenter);
//  }
//  if (!this.kIVStateVideo && this.kIVStateGps && what == 'gps') {
//    this.mbox.changeMapView(undefined,newCenter);
//  }
//  if (this.kIVStateVideo && this.kIVStateGps) {
//    var bound = new OpenLayers.Bounds();    //and gps location in view
//    bound.extend(new OpenLayers.LonLat(lon,lat));
//    var other = null;
//    if (what == 'gps') { 
//      if (this.kIVPosVideo) { other = this.kIVPosVideo; }
//    } else if (what == 'video') {
//      if (this.kIVPosGps) { other = this.kIVPosGps; }
//    }
//    var mid = null;
//    if (other) {
//      bound.extend(new OpenLayers.LonLat(other.lon,other.lat));
//      var mid = {
//        lon: (parseFloat(other.lon) + parseFloat(lon)) /2
//        ,lat: (parseFloat(other.lat) + parseFloat(lat)) /2
//      };
//      // TBD we can use getCenterLonLat
//      this.mbox.changeMapView(bound,mid,20);
//    } else {
//      this.mbox.changeMapView(undefined,newCenter);
//    }
//  }
//}




