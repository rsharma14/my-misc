/*
 * Production javascript
 *
 * Copyright (c) 2008 Vidteq India Pvt Ltd
 * and GPL (GPL-LICENSE.txt) licenses.MSI
 *
 * $Rev: $
 */
if (typeof(vidteq) == 'undefined') { vidteq = {}; }

vidteq.mbox = function( mapDom, gui, options ) {
  //configuration options
  options = options || {};

  //boolean
  this.isRcmEnabled = false;
  this.routeActive = false;
  this.srfActive = false;
  this.placeViaBallFlag = false;
  this.pCentered = false;
  this.carDisable = true;

  //numeric
  this.routeBuffer = 30;
  this.mapCenterOffset = 0; //TBD

  //null, undefined, empty objects, empty arrays
  this.temp = null;
  this.nemoControls = null;
  this.srfBound = null;
  this.nemoLayers = {
  };
  this.seFeatureStore = {};
  this.startIcon = {};
  this.endIcon = {};
  this.rcmItems = [];
  this.mapTitle = "Right Click on Map for more options";

  //required
  this.mapDom = options.mapDom || mapDom || {};
  this.gui = options.gui || gui || {};

  //styling is moved to init

  /*----- No property initialisation beyond this line. -----
   *----- Everything else should happen within init. -----*/
  this.init( options );
}

vidteq.mbox.prototype.init = function( options ) {
  options = options || {};

  //TBD: Tight binding on vidteq.imgPath
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

  this.rcmItems = [];
  var that = this;
  this.outRouteStyle = OpenLayers.Util.applyDefaults({
    graphicZIndex: 101,
    strokeWidth: 8,
    cursor:'hand',
    strokeColor: "#00a2ff",
    fillOpacity: 0,
    strokeOpacity: .8
  }, OpenLayers.Feature.Vector.style['default']);

  this.offRouteStyle = OpenLayers.Util.applyDefaults({
    graphicZIndex: 101,
    strokeWidth: 8,
    cursor:'hand',
    strokeColor: "#be2926",
    fillOpacity: 0,
    strokeOpacity: .8,
    label:"${label}"
  },
  {context:{label:function(feature){
      if (feature.data.label) return feature.data.label;
      else return "";}
    }
  },
  OpenLayers.Feature.Vector.style['default']);
  this.routeStyle = OpenLayers.Util.applyDefaults({
    graphicZIndex: 101,
    strokeWidth: 8,
    cursor:'hand',
    strokeColor: "#9900CC",
    fillOpacity: 0,
    strokeOpacity: .6
  }, OpenLayers.Feature.Vector.style['default']);
  this.routeEMapStyle= new OpenLayers.Style (
    {
      graphicZIndex: 101,
      strokeWidth: "${strokeWidth}",
      cursor : "pointer",
      strokeColor: "${strokeColor}",
      graphicTitle:"routeno",
      display:"${display}"
    },
    //{ context :{ strokeColor : function (feature) { var col = "rgb("+Math.floor(Math.random()*256)+","+Math.floor(Math.random()*256)+","+Math.floor(Math.random()*256)+")"; console.log(col); return col; } } }
    { context :{
       strokeColor : function (feature) { if (feature.eMapColor) { return feature.eMapColor; } else { return "#9900CC"; } },
       strokeWidth : function (feature) { if (feature.eMapWidth) { return feature.eMapWidth; } else { return 2; } },
       routeno : function(feature) { return  "OKE";},
       display : function (feature) {
         if (feature.data.dontDisplay) { return 'none'; }
           return true;
       }
     } }
  );
  if (typeof(missingVideoDebug) != 'undefined' &&  missingVideoDebug) {
    this.routeNoVidStyle = OpenLayers.Util.applyDefaults({
          strokeWidth: 5,
          strokeColor: "red",
          fillOpacity: 0,
          strokeOpacity: .6
      }, OpenLayers.Feature.Vector.style['default']);
    this.routeNoVbStyle = OpenLayers.Util.applyDefaults({
          strokeWidth: 5,
          strokeColor: "orange",
          fillOpacity: 0,
          strokeOpacity: .6
      }, OpenLayers.Feature.Vector.style['default']);
    this.routeNoDpStyle = OpenLayers.Util.applyDefaults({
          strokeWidth: 5,
          strokeColor: "blue",
          fillOpacity: 0,
          strokeOpacity: .6
      }, OpenLayers.Feature.Vector.style['default']);
  }
  var sObj = {
    strokeWidth: 5,
    strokeColor: vidteq.mainColor,
    fillOpacity: 0,
    pointRadius:1,
    strokeOpacity: .9
  };
  if (this.gui && this.gui.wap) {
    sObj.externalGraphic = 'images/wap/triangle.png';
    sObj.graphicWidth = '20';
    sObj.graphicHeight = '20';
    sObj.strokeWidth = 100;
    sObj.strokeColor = '#be2926';
    sObj.fillColor = '#be2926';
    sObj.fillOpacity = 1;
    sObj.pointRadius = 100;
    sObj.strokeOpacity = 1;
  }
  this.clickPointStyle = OpenLayers.Util.applyDefaults(
    sObj,
    OpenLayers.Feature.Vector.style['default']
  );
  this.viaBallStyle = OpenLayers.Util.applyDefaults({
        strokeWidth: 8,
        strokeColor: 'black',
        fillOpacity: 0,
        pointRadius:1,
        strokeOpacity: .9
    }, OpenLayers.Feature.Vector.style['default']);
  //this.srfLayerStyle= new OpenLayers.Style (
  //  {
  //    externalGraphic : "${icon}",
  //    graphicWidth : 30,
  //    graphicHeight : 30,
  //    //graphicYOffset : -30,//am putting this as it seems there's a lit shift down in vector layer than the original marker layer
  //    graphicTitle: 'Click to get information about this place'
  //  },
  //  { context :{
  //    icon : function (feature) {
  //      if (feature.data.type=='center'){ return feature.data.icon.mapUrl;
  //      } else if (feature.data.startOrEnd=='start'){ return that.startIcon.mapUrl;
  //      } else if(feature.data.startOrEnd=='end'){ return that.endIcon.mapUrl;
  //      } else return feature.data.markIcon.mapUrl
  //    }
  //  }}
  //);
  this.carMarkLayerStyle= new OpenLayers.Style (
    {
      externalGraphic : vidteq.imgPath.car+'?r='+vidteq.cfg._rStr,
      //externalGraphic : "${icon}",
      graphicOpacity : "${opac}",
      cursor : "pointer",
      //graphicWidth : 54,
      //graphicWidth : 25,//21,
      graphicWidth : "${graphicWidth}",
      //graphicHeight : 54,
      //graphicHeight : 30,//25,
      graphicHeight : "${graphicHeight}",
      graphicYOffset : -12,
      graphicXOffset : -12,
      //rotation:45,
      rotation:"${rotation}",
      //graphicZIndex: 4000,
      //rotation:"${rotation}",
      graphicTitle: "Drag me to move along the route"
    },
    { context :{
      opac : function (feature) {
        if (feature.data.shadow) {return 0.5;} else {return 1;}
      },
      graphicWidth : function (feature) {
        return 25;
      },
      graphicHeight : function (feature) {
        return 30;
      },
      rotation : function (feature) {
        if (feature.data.rotation) {
          return feature.data.rotation;
        } else {
          return 45;
        }
      }
    } }
  );

  var that = this;
  this.textDirStyle= new OpenLayers.Style ({
      externalGraphic : "${icon}",
      graphicWidth : "${graphicWidth}",
      graphicHeight : "${graphicHeight}",
      graphicYOffset : "${graphicYOffset}",
      graphicXOffset : "${graphicXOffset}",
      graphicTitle: "${title}"
    },
    { context :{
       icon : function (feature) { return feature.data.icon; },
       graphicWidth : function (feature) {
         if (that.gui.wap) return 24;
         else return 16;
       },
       graphicHeight : function (feature) {
         if (that.gui.wap) return 24;
         else return 16;
       },
       graphicYOffset : function (feature) {
         if (that.gui.wap) return -12;
         else return -16;
       },
       graphicXOffset : function (feature) {
         if (that.gui.wap) return -12;
         else return -16;
       },
       title : function (feature) { return feature.data.title; }
    } }
  );
  this.busStopsStyle= new OpenLayers.Style (
    {
      externalGraphic : "${icon}",
      graphicWidth : 16,
      graphicHeight : 16,
      graphicYOffset : -16,
      graphicXOffset : -16,
      graphicTitle: "${title}"
    },
    { context :{ icon : function (feature) { return vidteq.imgPath.busStop; },
                 title : function (feature) { return feature.data.title; } } }
  );
  this.imageOnRouteStrategy = new OpenLayers.Strategy.Cluster({distance:10,threshold:2});
  this.imageOnRouteStyle= new OpenLayers.Style (
    {
      externalGraphic : "${icon}",
      //externalGraphic : vidteq.imgPath.poi+'?r='+vidteq.cfg._rStr,
      graphicWidth :"${graphicWidth}",//10,
      graphicHeight : "${graphicHeight}",//10,
      cursor : "pointer",
      //graphicZIndex: 3999,
      //graphicYOffset : -30,//am putting this as it seems there's a lit shift down in vector layer than the original marker layer
      graphicTitle: 'Click to see image'
    },
    { context : {
      //icon: vidteq.imgPath.poi+'?r='+vidteq.cfg._rStr,
      icon: function (feature) {
        return vidteq.imgPath.poi+'?r='+vidteq.cfg._rStr;
        //if(feature.attributes.id % 2 == 0 )
        //  return "images/wap/even.png";
        //else
        //  return "images/wap/odd.png";
      },
      graphicWidth : function(feature) {
        if(vidteq.mboxObj.map.zoom < 4 )
          //return 12;
          return 10;
        else
          return 20;
          //return 25;
      },
      graphicHeight : function(feature) {
        if(vidteq.mboxObj.map.zoom < 4 )
          //return 22;
          return 10;
        else
          //return 45;
          return 20;
      }
    }}
  );
  var that = this;
  this.startEndStyle= new OpenLayers.Style ({
    externalGraphic : "${icon}",
    graphicWidth: "${graphicWidth}",
    graphicHeight : "${graphicHeight}",
    cursor : "pointer",
    display : "${display}",
    graphicYOffset : "${graphicYOffset}",
    graphicXOffset : "${graphicXOffset}",
    graphicTitle: "${title}"
  },
  {context :{
    icon : function (feature) {
      if(vidteq.aD && vidteq.aD.urlId && vidteq.aD.urlId.match(new RegExp('^marathon_','i'))) {
        if(feature.data.type=='center') {
          return vidteq.imgPath.marathon_end;
        } else if(feature.data.startOrEnd=='start') {
          return vidteq.imgPath.marathon_start;
        } else if(feature.data.startOrEnd=='end') {
          return vidteq.imgPath.marathon_end;
        }
      }
      if ((feature.data.type=='center' || feature.data.type=='via' || feature.data.type=='employee') && feature.data.icon) {
        return feature.data.icon.mapUrl;
      } else if (feature.data.startOrEnd=='start'){
  return that.startIcon.mapUrl;
      } else if (feature.data.startOrEnd=='end'){
        return that.endIcon.mapUrl;
      } else { return  null;}
    },
    graphicWidth : function(feature) {
      if (that.gui.wap) { return 30; }
      if ((feature.data.type=='center' || feature.data.type=='via' || feature.data.type=='employee') && feature.data.icon) {
        if (feature.data.icon){
          var w;
          w = feature.data.icon.w? feature.data.icon.w : ( feature.data.width? feature.data.width : 45 );
          return w;
        } else { return 45; }
      } else if (feature.data.startOrEnd=='start' ||
                 feature.data.startOrEnd=='end'){
        return 45;
      } else { return null; }
    },
    graphicHeight : function(feature) {
      if (that.gui.wap) { return 30; }
      if ((feature.data.type=='center' || feature.data.type=='via' || feature.data.type=='employee') && feature.data.icon) {
        if (feature.data.icon){
          var h;
          h = feature.data.icon.h? feature.data.icon.h : ( feature.data.height? feature.data.height : 45 );
          return h;
        } else { return 45; }
      } else if (feature.data.startOrEnd=='start' ||
                 feature.data.startOrEnd=='end'){
        return 45;
      } else { return null; }
    },
    graphicYOffset : function(feature) {
      if (that.gui.wap) { return 15; }
      if ((feature.data.type=='center' || feature.data.type=='via' || feature.data.type=='employee') && feature.data.icon) {
        if (feature.data.icon){
          var yoff;
          yoff = feature.data.icon.h? -parseInt(feature.data.icon.h)/2 : ( feature.data.height? -parseInt(feature.data.height)/2 : -(45)/2 );
          return yoff;
        } else { return -(45)/2; }
      } else if (feature.data.startOrEnd=='start' ||
                 feature.data.startOrEnd=='end'){
        return -45;
      } else { return null; }
    },
    graphicXOffset : function(feature) {
      if (that.gui.wap) { return 15; }
      if ((feature.data.type=='center' || feature.data.type=='via' || feature.data.type=='employee') && feature.data.icon) {
        if (feature.data.icon) {
          var xoff;
          xoff = feature.data.icon.w? -parseInt(feature.data.icon.w)/2 : ( feature.data.width? -parseInt(feature.data.width)/2 : -(45)/2 );
          return xoff;
        } else { return -(45)/2; }
      } else if (feature.data.startOrEnd=='start' ||
                 feature.data.startOrEnd=='end'){
        return -45/2;
      } else { return null; }
    },
    title : function (feature) {
      if (feature.data.type=='via'){
        return 'Via Place';
      } else if (feature.data.type=='center'){
        /*if(vidteq.utils.getSafe('feature.data.address.name')!==null) {
            return feature.data.address.name;
        }
        if(vidteq.utils.getSafe('feature.data.name')!==null) {
            return feature.data.name;
        }*/
        return feature.data.address.name;
      } else if (feature.data.startOrEnd=='start'){
        return 'Start Place';
      } else if(feature.data.startOrEnd=='end'){
        return 'End Place';
      } else return  null;
    },
    display : function (feature) {
      if (feature.data.dontDisplay) { return 'none'; }
      return true;
    }
  }});
  var that = this;
  this.wfsSelectStyle= new OpenLayers.Style({
    label: "${label}" //,
  },
  {  context : {
       label : function(feature) { return ''; }
  }});
  this.wfsStyle= new OpenLayers.Style({
    graphicZIndex: 10,
    strokeWidth: 2,
    strokeColor: "#3d71bf",
    fillColor: "#3d71bf",
    //stroke: true,
    // backgroundGraphicZIndex: 10000,
    // pointRadius: 16,
    externalGraphic : "${icon}",
    graphicWidth: "${graphicWidth}",
    graphicHeight : "${graphicHeight}",
    //labelXOffset : -16,
    labelYOffset : -10,
    labelAlign : 'ct',
    labelOutlineColor : "white",
    labelOutlineWidth : 3,
    fontSize : 10,
    fontColor : 'grey',
    fontFamily : 'arial',
    cursor : "${cursor}",
    //graphicXOffset: "${labelXOffset}",
    //graphicYOffset: "${labelYOffset}",
    backgroundHeight: 25,
    label: "${label}"//,
    //graphicTitle : "${title}"
  },
  {  context : {
      icon : function(feature) {
        var zoom = that.map.getZoom();
        if (zoom < 3) { return null; }
        //if (feature.data.ccclx) return "../images/360.png";
        if (feature.data.ccclx) return vidteq.cfg.stdLibraryCategoryLoc+"tile_icons/360.png";
        if (feature.data && feature.data.categoryList &&
            feature.data.categoryList[0] &&
            feature.data.categoryList[0].category_tile_icon &&
            feature.data.categoryList[0].category_tile_icon.name) {
          return vidteq.cfg.stdLibraryCategoryLoc+'tile_icons/'+feature.data.categoryList[0].category_tile_icon.name;
        } else {
          return vidteq.cfg.stdLibraryCategoryLoc+'tile_icons/star.png';
        }
      },
      graphicWidth : function (feature) {
        var zoom = that.map.getZoom();
        if (feature.data && feature.data.categoryList &&
            feature.data.categoryList[0] &&
            feature.data.categoryList[0].category_tile_icon &&
            feature.data.categoryList[0].category_tile_icon.w) {
          var width = parseInt(feature.data.categoryList[0].category_tile_icon.w);
          if (zoom<6) return (zoom/6)*width;
          return width;
        }
        return 10;
      },
      graphicHeight : function (feature) {
        var zoom = that.map.getZoom();
        if (feature.data && feature.data.categoryList &&
            feature.data.categoryList[0] &&
            feature.data.categoryList[0].category_tile_icon &&
            feature.data.categoryList[0].category_tile_icon.h) {
          var height = parseInt(feature.data.categoryList[0].category_tile_icon.h);
          if (zoom<6) return (zoom/6)*height;
          return height;
        }
        return 10;
      },
      title : function (feature) {
        if (feature.data && feature.data.address && feature.data.address.name) {
          return feature.data.address.name;
        }
      },
      cursor : function (feature) {
        if (feature.data.ccclx) return 'pointer';
        return 'arrow';
      },
      label : function (feature) {
        var zoom = that.map.getZoom();
        if (zoom < 6) { return ''; }
        if (that.labelBlackOut) { return ''; }
        if (!parseInt(feature.data.showLabel)) { return ''; }
        if (feature.data && feature.data.address && feature.data.address.name) {
          var myName = feature.data.address.name;
          var myNameA = myName.split(/[ ]+/);
          if (myName.length > 15 && myNameA.length > 2) {
            var half = parseInt(myNameA.length/2);
          } else { return myName; }
          var myNameO = '';
          for (var i in myNameA) {
            myNameO += myNameA[i];
            if (i == half) myNameO += "\n";
            else myNameO += ' ';
          }
          return myNameO;
          //var myNameA = feature.data.address.name.split(/[ ]+/);
          //if (myNameA.length == 1) { return myNameA[0]; }
          //if (myNameA.length == 2) { return myNameA[0]+"\n"+myNameA[1]; }
          //if (myNameA.length > 2) { return myNameA[0]+"\n..."+myNameA[myNameA.length-1]; }
          //var myName = feature.data.address.name.replace(/ /,"\n");
          //return feature.data.address.name;
          //return myName;
        }
      }
    }
  });
  this.landmarkStyle= new OpenLayers.Style(
    {//style for default feature
      graphicZIndex: 10,
      strokeWidth: 2,
      strokeColor: "#3d71bf",
      fillColor: "${fillColor}",
      //stroke: true,
      // backgroundGraphicZIndex: 10000,
      // pointRadius: 16,
      externalGraphic : "${icon}",
      graphicWidth: "${graphicWidth}",
      graphicHeight : "${graphicHeight}",
      //graphicXOffset: "${labelXOffset}",
      //graphicYOffset: "${labelYOffset}",
      backgroundHeight: 25,
      graphicTitle : "${title}",
      display : "${display}"
    },
    {  context : {
      icon : function(feature) {
        if (typeof (feature.attributes.count) != 'undefined') {
          var mainPoint=feature.cluster[0];
          for (var i in feature.cluster) {
            var curPri=parseInt(feature.cluster[i].data.priority);
            var lastPri=parseInt(mainPoint.data.priority);
            if (curPri>=lastPri){
              mainPoint=feature.cluster[i];
            }
          }
          return  vidteq.cfg.imageLogosLoc+"landmark/"+mainPoint.data.icon;
        } else {
          return  vidteq.cfg.imageLogosLoc+"landmark/"+feature.data.icon
        }
      },
      strokeWidth : function (feature){
        if (typeof(feature.data.strokeWidth)!='undefined' && feature.data.strokeWidth){
          return feature.data.width;
        }  else return 0;
      },
      strokeColor : function (feature) {
        if (typeof(feature.data.strokeColor)!='undefined' && feature.data.strokeColor){
          return feature.data.strokeColor;
        } else return "";
      },
      title : function (feature) {
        if (typeof(feature.data.name)!='undefined' && feature.data.name)
          return feature.data.name;
        else return "Blah";
      },
      fillColor :function  (feature) {
        if (typeof(feature.data.fillColor)!='undefined' && feature.data.fillColor){
          return feature.data.fillColor;
        } else return "";
      },
      graphicWidth : function(feature) {
        if (feature.data.width){ return feature.data.width;             }
        else return 20;
      },
      graphicHeight : function(feature) {
        if (feature.data.height){ return feature.data.height; }
        else return 25;
      },
      labelXOffset : function (feature){
        if (typeof(feature.data.xoffset) != 'undefined' && feature.data.xoffset){
          return feature.data.xoffset;
        } else return 0;
      },
      labelYOffset : function (feature){
        if (typeof(feature.data.yoffset) != 'undefined' && feature.data.yoffset){
          return feature.data.yoffset;
        } else return 0;
      },
      display : function (feature){
        var displayValMin = 'none';
        var displayValMax = 'none';
        //var zoom=vidteq.mboxObj.getCurrentZoom();
        var zoom=that.getCurrentZoom();
        if (typeof(feature.data.minzoom)!='undefined' &&
             zoom >= parseInt(feature.data.minzoom )) {
          displayValMin = 1;
        }
        if (typeof(feature.data.maxzoom)!='undefined' &&
             zoom <= parseInt(feature.data.maxzoom )) {
          displayValMax = 1;
        }
        if (displayValMin == 1 && displayValMax == 1) { return 1; }
        return 'none';
      }
    }
  });

  //TBD: PFLayer - Proposed Feature Layer to be re-used for polygon layer
  this.pfLayerStyle= new OpenLayers.Style(
    {
      //fill : "${fill}",
      fillOpacity: 0.4,
      fillColor: "${fillColor}",
      pointRadius: "${pointRadius}",
      stroke: true,
      strokeColor:"${strokeColor}",
      strokeWidth: "${strokeWidth}",
      graphicTitle: "${title}",
      strokeDashstyle: "${strokeDashstyle}",
      label: "${label}",
      graphicTitle: "blah",
      labelAlign: "${labelAlign}",
      fontColor: "${fontColor}",
      fontWeight:"bold",
      labelXOffset:"30",
      labelYOffset:"-20",
      display:"${display}",
      fontSize: 8
    },
    { context : {
      pointRadius : function(feature) {
        if (typeof (feature.data.style) != 'undefined' && feature.data.style) {
          //var tmp = JSON.parse(feature.data.style);
          if (typeof (feature.data.style.pointRadius) != 'undefined') {
            return feature.data.style.pointRadius;
          } else { return "6"; }
        } else { return "6"; }
      },
      strokeDashstyle : function(feature) {
        if (typeof (feature.data) != 'undefined') {
          if(typeof(feature.data.strokeStyle)!='undefied') {
            if (feature.data.strokeStyle=='dashdot'){ return "dashdot";}
          }
        }
      },
      display: function (feature){
        if (typeof(feature.data.style)!='undefined' && feature.data.style ){
          if (feature.data.style.noDisplay){ return "none";}
        }
        else { return  true;}//it does'nt hv a effect  except none
      },
      labelAlign : function (feature) {
        if (typeof (feature.data.style) != 'undefined' && feature.data.style) {
          if (typeof (feature.data.style.labelAlign) != 'undefined') {
            return feature.data.style.labelAlign;
          }
        }
        else return "lc";
      },
      //fill : function  (feature) {
      //  var zoom=vidteq.mboxObj.getCurrentZoom();
      //  if (zoom<3){ return 0; }
      //  return 1;
      //  },
      fillColor : function (feature) {
        if (typeof (feature.data.code)!= 'undefined'){
          if (feature.data.code==12){ return '#abababa'}//commercial
          if (feature.data.code==13){ return '#cccccc'}//industrial
          if (feature.data.code==14){ return '#0000ff'}//waterbodies
          if (feature.data.code==15){ return '#e5e5e5'}//openSpace
          if (feature.data.code==16){ return '#00ff00'}//agriculture
          if (feature.data.code==17){ return '#'}//Utilities
          if (feature.data.code==11){ return '#ffc0cb'}//residential
          if (feature.data.code==18){ return '#c887b1'}//public
        }
      },
      label :function(feature) {
        var zoom=vidteq.mboxObj.getCurrentZoom();
        if (typeof (feature.data.style) != 'undefined') {
          if (typeof (feature.data.style) != 'undefined' && feature.data.style &&
              typeof (feature.data.style.zoomMin) != 'undefined' &&
              typeof (feature.data.style.zoomMax) != 'undefined' &&
              (zoom < feature.data.style.zoomMin || zoom > feature.data.style.zoomMax)) {
            return "";
          }
          if (typeof (feature.data.label)!= 'undefined'){
            return feature.data.label;
          }
        } else  return "";
      },
      fontColor: function (feature) {
        if (typeof (feature.data.style) != 'undefined' && feature.data.style) {
          return feature.data.style.fontColor;
        }
      },
      strokeColor: function(feature) {
         if (typeof (feature.data) != 'undefined') {
           if (typeof (feature.data.strokeColor) != 'undefined') {
             return feature.data.strokeColor;
           }
        } else return "0000ff";
      },
      strokeWidth: function(feature) {
        var zoom=vidteq.mboxObj.getCurrentZoom();
        if (typeof (feature.data) != 'undefined') {
          if (typeof (feature.data.strokeWidth) != 'undefined') {
            var size=feature.data.strokeWidth;
            return size;
          }
        }
      }
  }});
  var that = this;
  //this.srfStyle= new OpenLayers.Style ({
  //  externalGraphic : "${icon}",
  //  graphicWidth: "${graphicWidth}",
  //  graphicHeight : "${graphicHeight}",
  //  graphicYOffset : "${graphicYOffset}",
  //  graphicXOffset : "${graphicXOffset}",
  //  cursor:'pointer',
  //  display: "${display}",
  //  graphicTitle: 'Click to get information about this place'
  //},
  this.srfStyle= new OpenLayers.Style ({
    externalGraphic : "${icon}",
    graphicWidth: "${graphicWidth}",
    graphicHeight : "${graphicHeight}",
    graphicYOffset : "${graphicYOffset}",
    graphicXOffset : "${graphicXOffset}",
    cursor:'pointer',
    display: "${display}",
    graphicTitle: "${graphicTitle}"
  },
  {context :{
    icon : function (feature) {
      if (that.gui.wap) { return "images/wap/nbb.png"; }
      if (vidteq.newSearch) {
        if('pathPre' in vidteq) { return vidteq.pathPre+"images/wap/myLocpin.png"; }
        else {  return "images/wap/myLocpin.png"; }
      }
      if (feature.data.type=='center' && feature.data.icon){
        return feature.data.icon.mapUrl;
      } else if (feature.data.startOrEnd=='start'){
        return that.startIcon.mapUrl;
      } else if(feature.data.startOrEnd=='end'){
        return that.endIcon.mapUrl;
      } else if (feature.data.markIcon){
        return feature.data.markIcon.mapUrl;
      } else {
        return null;
      }
    },
    graphicWidth : function(feature) {
      if (vidteq.newSearch) { return 29; }
      if (feature.data.graphicWidth){
        return feature.data.graphicWidth;
      }
      if (that.gui.wap) { return 40; }
      return 30;
    },
    graphicHeight : function(feature) {
      if (vidteq.newSearch) { return 36; }
      if (feature.data.graphicHeight){
        return feature.data.graphicHeight;
      }
      if (that.gui.wap) { return 42; }
      return 30;
    },
    graphicYOffset : function(feature) {
      if (vidteq.newSearch) { return -33; }
      if (that.gui.wap) { return -42; }
      return -15;
    },
    graphicXOffset : function(feature) {
      if (vidteq.newSearch) { return -12; }
      if (that.gui.wap) { return -5; }
      return -15;
    },
    display : function (feature) {
      if (feature.data.seFeature) { return 'none'; }
      return true;
    }
    ,graphicTitle:function(feature){
      if(feature && feature.data && feature.data.address 
           && feature.data.address.name) {
        return feature.data.address.name;
      }
      if (vidteq.newSearch) { return ""; }
      return "Click to get information about this place";
      //if (vidteq.newSearch) { return feature.data.graphicTitle; }
      //else return 'Click to get information about this place' ;
    }
  }});

  try {
    if(this.gui.embed ) {
      if (vidteq.aD.q == 'EScheduler' &&
          (!this.gui.embed.firstTimeRule ||
            this.gui.embed.firstTimeRule.eTester ||
            this.gui.embed.firstTimeRule.empId ||
            this.gui.embed.firstTimeRule.vcId ||
            this.gui.embed.firstTimeRule.vendorId ||
            this.gui.embed.firstTimeRule.tsId )) {
        this.eMap = new vidteq._eMap(this,vidteq.aD.mode);
      }
      //if (typeof(vidteq.aD.config.landMarkLayer)!= 'undefined' && parseInt(vidteq.aD.config.landMarkLayer)) {
      //  callMakeLandMarkLayer();
      //}
      // Access to vidteq.aD is not appropriate for mbox - TBD
    } else {
      if (self.navigator.userAgent.match(/MSIE\s[6]/)){//switch for disabling the Cat Scroll Panel in case of MSIE
        if( document.getElementById("scrolltabv") ) {
          $("#scrolltabv").css('display','none');
        }
      }else{
        if( document.getElementById("scrolltabv") ) {
          $("#scrolltabv").css('display','none');
        }
        //this.catMngr = new vidteq._catMngr(this,'h');
        //call explicitly to create brand icon bar
        if(typeof(vidteq._catMngr)!=="undefined") {
          this.catMngr =  new vidteq._catMngr(this,'h',40);
          this.catMngr.getAndCreateBrandScroll();
        };
      }
    }
  } catch(e) {};
  this.wowMode = false;
  if(typeof(wowMode) != 'undefined' && wowMode) { this.wowMode = true; }
  this.overrideOLClasses();
  this.locatorPoint = new Array();
  //this.allMarkers = new Array();
  this.viaBallSize = new OpenLayers.Size(24,24);
  this.imageIconSize= new OpenLayers.Size(12,12);
  this.imageIconOffset= function(imageIconSize) {
     return new OpenLayers.Pixel(-(imageIconSize.w/2),-(imageIconSize.h/2));
  };
  this.viaBallIconUrl = vidteq.imgPath.viaBall;
  this.imageBusStopIconUrl = vidteq.imgPath.biasstops;
  this.imageBusStopIcon = new OpenLayers.Icon(this.imageBusStopIconUrl,this.imageIconSize,null,this.imageIconOffset);
  this.viaBallIcon = new OpenLayers.Icon(this.viaBallIconUrl,this.viaBallSize,null,this.imageIconOffset);
  if(this.gui.embed && this.gui.appMode) {
    OpenLayers.IMAGE_RELOAD_ATTEMPTS = 25;
  } else {
    OpenLayers.IMAGE_RELOAD_ATTEMPTS = 3;
  }
  // first map creation
  var resExtent = vidteq.cfg.maxExtent;
  if(typeof(vidteq.cfg.resExtent) != 'undefined') {
    resExtent = vidteq.cfg.resExtent;
  }
  var mapOptions = {
    //resolutions: [0.000686646,0.000343323, 0.000171661, 0.000085831, 0.000042915, 0.000021458, 0.00001072883606]
    resolutions:vidteq.cfg.resolutions.split(',')
    //,maxExtent:new OpenLayers.Bounds (76.9921875,12.3046875,78.22265625,13.7109375)
    ,maxExtent:new OpenLayers.Bounds.fromString(vidteq.cfg.maxExtent)
    ,restrictedExtent:new OpenLayers.Bounds.fromString(resExtent)
    ,fallThrough:true
    ,controls:[]
    ,theme:null
    //,panMethod: OpenLayers.Easing.Expo.easeInOut
    //,zoomMethod: OpenLayers.Easing.Quad.easeInOut
  }
  //console.log("one ...");
  //this.cacheWrite; this.cacheRead1; this.cacheRead2;this.seeding = false;
  this.map = new OpenLayers.Map( this.mapDom , mapOptions );
  //this.map.panTween = new OpenLayers.Tween(OpenLayers.Easing.Linear.easeIn);
  this.panDurationRef = 200;
  this.map.panDuration = this.panDurationRef;

  //console.log("two ...");

  // now layer creation
  // layer index 2 - base layer
  var innerAttribution = this.checkAndAddLengends();



  var attributionClass =(function(gui) {
    var aClass;
    //In init for mbox, it should be independent of in gui object, if required, late initialization should be supported
    //gui.aD changed to vidteq.aD
    if( vidteq.aD && vidteq.aD.urlId && vidteq.aD.q ) {
     aClass = vidteq.aD.q + "-map-attribution-" + ( vidteq.aD.urlId ).toLowerCase();
    }else {
      aClass = "vidteq-attribution";
    }
    return aClass;
  })(this.gui);

  var baseLayerOptions = {
    transitionEffect: 'resize',
    buffer: 0,
    attribution: '<div class="'+attributionClass+'"><a style=text-decoration:none;height:55px;width:80px;border:0px solid black; title="Visit www.VidTeq.com for detailed video maps." target=_blank style=cursor:pointer href="http://www.vidteq.com" ><img src="'+vidteq.imgPath.vidteqMapLogo+'"; class=pngfixclass; height=55px; width=80px; style=border:0px solid black;text-decoration:none;height:55px;width:80px;background-color:transparent; /></a></div>'+innerAttribution
  }
  if (this.gui.handheld || this.gui.appMode) { baseLayerOptions.attribution =  ''; }
  if (this.gui.wap) {
    baseLayerOptions.attribution = '<div id="vtAttr"><img src="'+vidteq.imgPath.vidteqMapLogo+'"/></div>';
  }
  this.baseLayer = new OpenLayers.Layer.WMS(
    "BANGALORE_ALL",
    vidteq.cfg.tilecacheBaseUrl,
    { layers: vidteq.cfg.tilecacheBaseLayer,
      format: 'image/png'
    },
    baseLayerOptions
  );
  this.map.addLayer(this.baseLayer);

  // now layer creation
  // layer index 1 - RCM click layer
  this.clickPointMark = new OpenLayers.Layer.Vector("Point Clicked",
    {style: this.clickPointStyle}
  );
  //console.log("three ...");
  this.map.addLayer(this.clickPointMark);
  this.map.raiseLayer(this.clickPointMark,-1);
  //console.log("four ...");
  //if ( OpenLayers.Protocol.myWFS ) { }
  if ( OpenLayers.Protocol.myScript ) {
    this.wfsLayer = new OpenLayers.Layer.Vector("WFS",{
      styleMap: new OpenLayers.StyleMap({
        "default" : this.wfsStyle,
        "select" : this.wfsSelectStyle
      })
      ,strategies:[new OpenLayers.Strategy.myBBOX({
        resFactor:1,vidteqSwitch:true
      })]
      ,protocol:new OpenLayers.Protocol.myScript({
        url:vidteq.cfg.tilecachePoi
        ,format: new OpenLayers.Format.GeoJSON()
        ,params: {
          action:'getPoisAsWfs'
         ,city:vidteq.cfg.city
        }
        ,filterToParams: function (filter, params) {
          var bounds = JSON.stringify({
            resolution: that.map.getResolution(),
            left: filter.value.left,
            right: filter.value.right,
            top: filter.value.top,
            bottom: filter.value.bottom
          });
          params.bounds = bounds;
          return params;
        }
      })
      //protocol:new OpenLayers.Protocol.myWFS({
      //  url:vidteq.cfg.tilecachePoi,
      //  featureType:"vidteqFeatures",
      //  readFormat: new OpenLayers.Format.GeoJSON(),
      //  outputFormat:"json"
      //})
    });
    this.map.addLayer(this.wfsLayer);

    var that = this;
    var cleanHoverPopups = function () {
      if (!that.hoverPopups) that.hoverPopups = [];
      while (that.hoverPopups.length > 0) {
        that.hoverPopups.pop().destroy();
      }
    };
    var unselectHover = function (feature) {
      //called when WFS popup unselected
      cleanHoverPopups();
      if(!that.gui.nemo) {
        //$('#'+that.mapDom)[0].title='Right Click on Map for more options'
        $('#'+that.mapDom)[0].title = that.mapTitle;
      }
    };
    var selecHover = function (feature) {
      cleanHoverPopups();
      var threeSixty = "";
      var fontSize = 10;
      if(feature.data.ccclx) {
        threeSixty += "Click to see 360 view for ";
        if (feature.data.address.name.length>20) threeSixty = threeSixty+"<br>";
        fontSize = 14;
      }
      var html = "<a style='font-size:"+fontSize+"px;'>"+threeSixty+feature.data.address.name+"</a>";
      var popup = new OpenLayers.Popup("iconPopUp",
        feature.geometry.getBounds().getCenterLonLat(),
        new OpenLayers.Size(10,10),
        html,
        null,
        true
      );
      popup.setBackgroundColor("white");
      popup.setBorder("0.5px solid grey");
      popup.panMapIfOutOfView = true;
      popup.contentDiv.style.overflow =  'hidden';
      //popup.contentDiv.style.padding = '3px';
      //popup.contentDiv.style.margin = '2';
      popup.autoSize = true;
      that.hoverPopups.push(popup);
      that.map.addPopup(popup);
      $('#iconPopUp.olPopup').css('border-radius','10px');
      $('#iconPopUp.olPopup').css('text-align','left');
      $('#iconPopUp_contentDiv.olPopupContent').css('height','auto');
      if (!self.navigator.userAgent.match(/MSIE\s[7]/)){
        $('#iconPopUp_contentDiv.olPopupContent').css('width','auto');
      }
      $('#iconPopUp_contentDiv.olPopupContent').css('white-space', 'nowrap');
      $('#iconPopUp.olPopup').css('height','auto');
      if (!self.navigator.userAgent.match(/MSIE\s[7]/)){
        $('#iconPopUp.olPopup').css('width','auto');
      }

      $("#"+popup.contentDiv.id).effect("bounce", { times:5 }, 100);

      $('#'+that.mapDom)[0].title='';
      //$('#iconPopUp_close').css('visibility','hidden');
      //$('#iconPopUp').hide();
      //$('#iconPopUp').show("slow",function(){});

    };
    if(!this.gui.wap){
      this.wfsLayer.events.on({"featureselected": function (evt) {
        if(evt.feature.data.ccclx) {
          var url = "/360/?city="+vidteq.cfg.city+"&firstTimeRule="+evt.feature.data.ccclx+"&name="+evt.feature.data.address.name;
          window.open(url);
        }
      }});
    }
  }

  this.landmarkLayerName = "LandMarkLayer1";
  this.landmarkLayer = new OpenLayers.Layer.Vector(
    this.landmarkLayerName,
    {
      styleMap: new OpenLayers.StyleMap({
        "default" : this.landmarkStyle
      }),
      isBaseLayer: false
  });
  this.map.addLayer(this.landmarkLayer);
  var that = this;
  var addLandMarkPopupWrap = function (evt) {
    //that.addLandMarkPopup(evt,this);
    that.addNewLandMarkPopup(evt,this);
  }
  var removeOpenLandMarkPopupWrap = function (evt) {
    that.removeOpenLandMarkPopup(evt,this);
  }
  this.landmarkLayer.events.on({"featureselected": addLandMarkPopupWrap});
  this.landmarkLayer.events.on({"featureunselected": removeOpenLandMarkPopupWrap});

  // layer index 3 - route layer
  //this.route = new OpenLayers.Layer.Vector( "One route",
  //  {style: this.routeStyle}
  //);
  var curRouteStyle = this.routeStyle;
  if (this.eMap) { curRouteStyle = this.routeEMapStyle; }
  this.route = new OpenLayers.Layer.Vector( "One route",
  { styleMap: new OpenLayers.StyleMap({
      "default" : curRouteStyle,
      "onSelect": curRouteStyle,
      "select": curRouteStyle
    }),
    isBaseLayer : false
  });
  var outRouteStyle = this.outRouteStyle;
  this.outRoute = new OpenLayers.Layer.Vector( "Out route",
  { styleMap: new OpenLayers.StyleMap({
      "default" : outRouteStyle,
      "onSelect": outRouteStyle,
      "select": outRouteStyle
    }),
    isBaseLayer : false
  });
  var offRouteStyle = this.offRouteStyle;
  this.offRoute = new OpenLayers.Layer.Vector( "Off route",
  { styleMap: new OpenLayers.StyleMap({
      "default" : offRouteStyle,
      "onSelect": offRouteStyle,
      "select": offRouteStyle
    }),
    isBaseLayer : false
  });
  if(this.gui.embed && (this.gui.handheld || this.gui.appMode)){
    this.route.events.on({"featureselected": function(e){
      // TBD we add one additional menu item to seek video to this point
      that.attachRcmMenuToMap(e);
    }});
  }
  if(this.gui.embed && this.eMap){
    this.route.events.on({"featureselected": function(e){
      // TBD we add one additional menu item to seek video to this point
      that.eMap.attachRouteMenu(e);
    }});
  }
  this.map.addLayer(this.route);
  this.map.addLayer(this.outRoute);
  this.map.addLayer(this.offRoute);
  // layer index 4
  if (typeof(missingVideoDebug) != 'undefined' &&  missingVideoDebug) {
    this.routeNoVid = new OpenLayers.Layer.Vector( "No Vid",
      {style: this.routeNoVidStyle}
    );
    this.map.addLayer(this.routeNoVid);

    // layer index 5
    this.routeNoVb = new OpenLayers.Layer.Vector( "No VB",
      {style: this.routeNoVbStyle}
    );
    this.map.addLayer(this.routeNoVb);

    // layer index 6
    this.routeNoDp = new OpenLayers.Layer.Vector( "No VD",
      {style: this.routeNoDpStyle}
    );
    this.map.addLayer(this.routeNoDp);
  }

  this.viaBallLayer = new OpenLayers.Layer.Vector("Via Ball",
    {style: this.viaBallStyle}
  );
  this.map.addLayer(this.viaBallLayer);

  this.poffArea = new OpenLayers.Layer.Vector('polayer', {
      styleMap: new OpenLayers.StyleMap({
          'default': OpenLayers.Util.applyDefaults({
                  strokeWidth: 1
                  ,fillOpacity: 0.3
                  ,pointRadius: 4
                  ,graphicName: 'polayer'
                  ,strokeColor: '#00a2ff'
                  ,fillColor:'#00a2ff'
              }, OpenLayers.Feature.Vector.style['default']
          )
      })
      ,isBaseLayer: false
      ,transitionEffect: 'resize'
      ,buffer: 0
  });
  this.map.addLayer(this.poffArea);
  this.pArea = new OpenLayers.Layer.Vector('polayer', {
      styleMap: new OpenLayers.StyleMap({
          'default': OpenLayers.Util.applyDefaults({
                  strokeWidth: 3
                  ,fillOpacity: 0.3
                  ,pointRadius: 4
                  ,strokeColor:'#be2926'
                  ,fillColor:'#be2926'
                  ,graphicName: 'polayer'
                  ,label:'${name}'
              }, OpenLayers.Feature.Vector.style['default']
          )
          ,'select': OpenLayers.Util.applyDefaults({
                  strokeWidth: 1
                  ,fillOpacity: 0.2
                  ,pointRadius: 6
                  ,graphicName: 'polayer'
              }, OpenLayers.Feature.Vector.style['select']
          )
      })
      ,isBaseLayer: false
      ,transitionEffect: 'resize'
      ,buffer: 0
  });
  this.map.addLayer(this.pArea);
  this.carMarkLayer = new OpenLayers.Layer.Vector("Car Marker",
  {
    styleMap: new OpenLayers.StyleMap({
      "default" : this.carMarkLayerStyle,
      "onSelect":this.carMarkLayerStyle
    }),
    isBaseLayer : false
  });
  //this.carMarkLayer.div.style.zIndex='4000';   // TBD
  this.locatorPointLayer= new OpenLayers.Layer.Vector(
    "srfLayer",
    { styleMap: new OpenLayers.StyleMap({
        "default" : this.srfStyle
        }), isBaseLayer: false
    }
  );
  this.map.addLayer(this.locatorPointLayer);
  var that = this;
  var popupLocationWrap = function (evt) {
    that.popupLocation(evt);
    that.clickTaken = true;
    return false;
  };
  var removeOpenPopupWrap = function (evt) {
    if(that.wowMode) {
      that.resultDivClick = false;
      if(typeof(that.selectFeatureObj) != 'undefined') delete that.selectFeatureObj;
      that.removeOpenPopup();
    } else if(that.gui.wap) {
      vidteq.mobUI.hideCenterPopup();
    } else {
      that.putAlog("this close event is happening");
    }
  };
  this.locatorPointLayer.events.on({"featureselected": popupLocationWrap});
  this.locatorPointLayer.events.on({"featureunselected": removeOpenPopupWrap});

  //this.viaBallMarkerLayer = new OpenLayers.Layer.Markers("Via Ball Markers");
  //this.map.addLayer(this.viaBallMarkerLayer);

  this.textDirLayer = new OpenLayers.Layer.Vector(
    "textdir",
    {
      styleMap: new OpenLayers.StyleMap({
      "default" : this.textDirStyle
    }), isBaseLayer: false
  });
  this.map.addLayer(this.textDirLayer);

  this.arrowOnRouteStrategy = new OpenLayers.Strategy.Cluster({distance:10,threshold:2});
  this.arrowOnRouteStyle= new OpenLayers.Style (
    {
      externalGraphic : "${icon}",
      graphicWidth :"${graphicWidth}",//10,
      graphicHeight : "${graphicHeight}",//10,
      cursor : "pointer",
      rotation: "${angle}",
      graphicTitle: 'Click to see image'
    },
    { context : {
      icon: function (feature) {
        return vidteq.imgPath.arrow_right+'?r='+vidteq.cfg._rStr;
      },
      angle : function (feature) {
        if(feature && feature.cluster) {
          if (feature.cluster[0] && feature.cluster[0].data.angle) { 
            return feature.cluster[0].data.angle;
          }
        }
        if (feature.data.angle) { return feature.data.angle; }
        return 0;
      },
      graphicWidth : function(feature) {
        return 20;
      },
      graphicHeight : function(feature) {
        return 20;
      }
    }}
  );
  this.arrowOnRouteLayer= new OpenLayers.Layer.Vector(
    "arrowOnRouteLayer",
    {
      strategies: [this.arrowOnRouteStrategy],
      styleMap: new OpenLayers.StyleMap({
      "default" : this.arrowOnRouteStyle
    }), isBaseLayer: false
  });
  this.map.addLayer(this.arrowOnRouteLayer);

  this.imageOnRouteLayer= new OpenLayers.Layer.Vector(
    "imageOnRouteLayer",
    {
      strategies: [this.imageOnRouteStrategy],
      styleMap: new OpenLayers.StyleMap({
      "default" : this.imageOnRouteStyle
    }), isBaseLayer: false
  });
  this.map.addLayer(this.imageOnRouteLayer);
  this.map.addLayer(this.carMarkLayer);

  var popupOneImageWrap = function (evt) { that.popupOneImage(evt); };
  this.imageOnRouteLayer.events.on({"featureselected":  popupOneImageWrap});
  this.imageOnRouteLayer.events.on({"featureunselected": removeOpenPopupWrap});
  this.busStopsLayer = new OpenLayers.Layer.Vector(
    "Bus Stops Layer",
    {
      styleMap: new OpenLayers.StyleMap({
      "default" : this.busStopsStyle
    }), isBaseLayer: false
  });
  this.map.addLayer(this.busStopsLayer);
  var popupOneBusStopWrap = function (evt) { that.popupOneBusStop(evt); };
  var removeOneBusStopWrap = function (evt) { that.removeBusStopPopup(evt); };
  this.busStopsLayer.events.on({"featureselected":popupOneBusStopWrap});
  this.busStopsLayer.events.on({"featureunselected":removeOneBusStopWrap});

  //TBD: PFLayer - Proposed Feature Layer to be re-used for polygon layer
  this.pfLayerMarkers= new OpenLayers.Layer.Markers("pfLayer Marker");
  this.map.addLayer(this.pfLayerMarkers);

  this.startEndMarkLayer= new OpenLayers.Layer.Vector(
    "startEndLayer",
    {
      styleMap: new OpenLayers.StyleMap({
      "default" : this.startEndStyle
    }), isBaseLayer: false
  });
  this.map.addLayer(this.startEndMarkLayer);
  var that = this;
  var popupLocationWrap = function (evt) {
    if (that.gui.embed && that.gui.handheld){
      that.popupLocation(evt,1);
    } else if(that.wowMode) {
      that.startEndPopup({feature:evt.feature,opt:'startEnd'});
    } else { that.popupLocation(evt); }
  };
  var putALogWrap = function (evt) {
    if(that.wowMode) {
      that.removeOpenPopup();
    } else if(that.gui.wap) {
      vidteq.mobUI.hideCenterPopup();
    } else {
      that.putAlog("this close event is happening");
    }
  };
  //if(!vidteq.vidNav){
    this.startEndMarkLayer.events.on({"featureselected": popupLocationWrap});
    this.startEndMarkLayer.events.on({"featureunselected": putALogWrap});
  //}
  /*this.dragSE = new OpenLayers.Control.DragMarker(this.startEndMarkLayer,{
    'onComplete': function () {
    var markerIconType = this.feature.icon.url;
      if (markerIconType == "images/start.gif") {
        ioAreaObj.getRoadName(this.startMarker.lonlat,'start');
      } else if(markerIconType == "images/end.gif") {
        ioAreaObj.getRoadName(this.endMarker.lonlat,'end');
      }
    },
    'onStart': function () {
     //document.getElementById('loadname').style.display='block';
    }
  });*/
  //var that = this;
  //this.dragCar = new OpenLayers.Control.DragFeature(this.carMarkLayer, {
  //  onComplete : function (e) {
  //    //if(e) {
  //    //  vidteq.mboxObj.releaseCarAfterDrag.apply(vidteq.mboxObj,[parseFloat(this.feature.geometry.x),parseFloat(this.feature.geometry.y)]);
  //    //}
  //    if(e) {
  //      that.releaseCarAfterDrag.apply(that,[parseFloat(this.feature.geometry.x),parseFloat(this.feature.geometry.y)]);
  //    }
  //  },
  //  onDrag : function (e) {
  //    //if(this.feature.data.car) {
  //    //  vidteq.mboxObj.carDisable = true;
  //    //  if (!vidteq.mboxObj.carShadowPoint) {
  //    //    vidteq.mboxObj.carShadowPoint = new OpenLayers.Feature.Vector(this.feature.geometry.clone(),{shadow:true});
  //    //    vidteq.mboxObj.carMarkLayer.addFeatures([vidteq.mboxObj.carShadowPoint]);
  //    //  }
  //    //}
  //    if(this.feature.data.car) {
  //      that.carDisable = true;
  //      if (!that.carShadowPoint) {
  //        that.carShadowPoint = new OpenLayers.Feature.Vector(this.feature.geometry.clone(),{shadow:true});
  //        that.carMarkLayer.addFeatures([that.carShadowPoint]);
  //      }
  //    }
  //  }
  //});
  //this.map.addControl(this.dragCar);
  //this.dragCar.activate();
  //this.layerOrder = [
  //  this.textDirLayer,
  //  this.carMarkLayer,
  //  this.busStopsLayer,
  //  this.startEndMarkLayer,
  //  this.locatorPointLayer,
  //  this.imageOnRouteLayer,
  //  this.landmarkLayer
  //];
  //this.universalSelect = new OpenLayers.Control.SelectFeature(
  //  this.layerOrder,
  //  { clickout:true,
  //    toggle:true,
  //    hover: false,
  //    //multiple: false,
  //    //toggleKey: "ctrlKey",
  //    //multipleKey: "shiftKey",
  //    //box: true,
  //    //  opacity:1,
  //    highlightOnly: false
  //  }
  //);
  //this.map.addControl(this.universalSelect);
  //this.universalSelect.activate();
  //this.universalSelect.handlers.feature.stopDown = false;

  this.parser = new OpenLayers.Format.WKT();
  this.tabPanel = new OpenLayers.Control.Panel();
  this.legendPanel = new OpenLayers.Control.Panel();
  this.addOnTabs = new Array();
  //var videoLayer = {
  //  name : vidteq.cfg.tilecacheVideoLayer,
  //  statusName : "Video Layer",
  //  url  : vidteq.cfg.tilecacheVideoUrl,
  //  layerDetails : { layers: vidteq.cfg.tilecacheVideoLayer, format: 'image' },
  //  layerConfig : { visibility: true,
  //      isBaseLayer:false,
  //      transitionEffect: 'resize',
  //      opacity: .6,
  //      buffer: 0
  //  },
  //  tabTitle:"Highlights roads having the video coverage till date"
  //}
  //var imageLayer = {
  //  name : vidteq.cfg.tilecacheImageLayer,
  //  statusName : "Image Layer",
  //  url  : vidteq.cfg.tilecacheImageUrl,
  //  layerDetails : { layers: vidteq.cfg.tilecacheImageLayer, format: 'image' },
  //  layerConfig : { visibility: true,
  //      isBaseLayer:false,
  //      transitionEffect: 'resize',
  //      buffer: 0
  //  },
  //  tabTitle:"Explore places of interest in Bengaluru",
  //  wfsLoader : function () { vidteq.mboxObj.loadImageWfsLayer.apply(vidteq.mboxObj,[]); }
  //}
  //var biasLayer = {
  //  name : vidteq.cfg.tilecacheBiasLayer,
  //  statusName : "BIAS Layer",
  //  url  : vidteq.cfg.tilecacheBiasUrl,
  //  layerDetails : { layers: vidteq.cfg.tilecacheBiasLayer, format: 'image' },
  //  layerConfig : { visibility: true,
  //      isBaseLayer:false,
  //      transitionEffect: 'resize',
  //      buffer: 0
  //  },
  //  tabTitle:"Explore the BIAS Routes in Bengaluru",
  //  legendTitle:"Legend for BIAS Routes",
  //  wfsLoader : function () { vidteq.mboxObj.loadBiasWfsLayer.apply(vidteq.mboxObj,[]); },
  //  wfsUnloader : function () { vidteq.mboxObj.unloadBiasWfsLayer.apply(vidteq.mboxObj,[]); },
  //  loadstart : function () { vidteq.mboxObj.changeBaseLayerZoom.apply(vidteq.mboxObj,[]); }
  //}
  if ((this.gui.embed && this.gui.handheld) ||
      (('vistaManner' in vidteq) &&
       ('eMarshal' in vidteq.vistaManner))){
    this.map.addControl( new OpenLayers.Control.ZoomPanel());
  } else {
    if (this.gui.wap) {
      this.map.addControl( new OpenLayers.Control.ZoomPanel());
    } else {
      this.map.addControl( new OpenLayers.Control.ZoomPanel());
      this.panZoomBar = new OpenLayers.Control.PanZoomBar();
      this.map.addControl( this.panZoomBar );
    }
  }
  this.map.addControl( new OpenLayers.Control.Attribution());
  //this.map.addControl( new OpenLayers.Control.Navigation({dragPanOptions: {enableKinetic: true}}));
  this.attachTilePanToEvents();
  if (this.gui.wap) { } else {
    this.map.addControl( new OpenLayers.Control.MousePosition() );
  }
  if (typeof(this.gui.userAgent) != 'undefined' &&
     (this.gui.userAgent.match(/iPhone/i) || this.gui.userAgent.match(/iPad/i) || this.gui.userAgent.match(/android/i) || this.gui.appMode)) {
      this.map.addControl( new OpenLayers.Control.TouchNavigation({
        dragPanOptions: { enableKinetic: true}}
      ));
  } else {
    var that = this;
    this.map.addControl( new OpenLayers.Control.Navigation({
      dragPanOptions: {
        enableKinetic: true
        ,panMapStart: function () {
          //console.log("start ");       
          that.blackOutKIV();
          OpenLayers.Control.DragPan.prototype.panMapStart.apply(this, arguments);
        }
        ,panMap: function () {
          //console.log("middle ");
          OpenLayers.Control.DragPan.prototype.panMap.apply(this, arguments);
        }
        ,panMapDone: function () {
          //console.log("end ");
          //Click Marker
          that.destroyMarkerLayer('ClickMarkers');
          that.blackOutKIV();
          OpenLayers.Control.DragPan.prototype.panMapDone.apply(this, arguments);
        }
      }
    }));
    //this.map.addControl( new OpenLayers.Control.Navigation());
  }
  //TBD: Styling should be done using media queries instead of this.gui.wap flag
  if (this.gui.wap) { } else {
    var ab=this.map.getControlsByClass("OpenLayers.Control.Attribution");
    ab[0].div.style.bottom="2px";
    try {
      if(this.gui.embed) {
      ab[0].div.style.position="fixed";
    }
    } catch(e) {}
    ab[0].div.style.fontFamily="'Trebuchet MS', Arial";
    ab[0].div.style.fontSize="12px";
    ab=this.map.getControlsByClass('OpenLayers.Control.MousePosition');
    ab[0].activate();
    if(!vidteq.cfg.debug) ab[0].div.style.display='none';
    ab[0].div.style.bottom="2px";
    ab[0].div.style.fontFamily="'Trebuchet MS', Arial";
    ab[0].div.style.left="10px";
    ab[0].div.style.right="auto";
  }
  if(this.gui.embed) this.tweakMapControls();

  var that = this;
  this.dragCar = new OpenLayers.Control.DragFeature(this.carMarkLayer, {
    onComplete : function (e) {
      if(e) {
        that.releaseCarAfterDrag.apply(that,[parseFloat(this.feature.geometry.x),parseFloat(this.feature.geometry.y)]);
      }
    },
    onDrag : function (e) {
      if(this.feature.data.car) {
        that.carDisable = true;
        if (!that.carShadowPoint) {
          that.carShadowPoint = new OpenLayers.Feature.Vector(this.feature.geometry.clone(),{shadow:true});
          that.carMarkLayer.addFeatures([that.carShadowPoint]);
        }
      }
    }
  });
  if (this.gui.wap) { } else {
    this.map.addControl(this.dragCar);
    this.dragCar.activate();
  }

  if(this.gui.handheld || this.gui.appMode){
  //var that = this;
  //dragcontrol = new OpenLayers.Control.DragPan({
  //  'map':this.map,
  //  'panMapStart':function(xy){
  //    that.userPans=true;
  //    if (that.panInterval) {
  //      clearTimeout(that.panInterval);
  //      delete that.panInterval;
  //    }
  //    that.panInterval=setTimeout(function(){
  //      that.userPans=false;
  //      delete that.panInterval;
  //      that.map.panDuration = that.panDurationRef;
  //    },10000);
  //    return true;
  //}});
  //this.map.addControl(dragcontrol);
  //this.userPans = false;
  //dragcontrol.activate();
  //this.maxView=false;
  }
  this.layerOrder = [
    this.route,    // TBD we need to look for side effect in other products
    this.textDirLayer,
    this.carMarkLayer,
    this.busStopsLayer
  ];
  if (this.wfsLayer) this.layerOrder.push(this.wfsLayer);
  this.layerOrder.push(
    this.startEndMarkLayer,
    this.locatorPointLayer,
    this.imageOnRouteLayer,
    this.landmarkLayer
  );
  //TBD: mboxplpugin registration
  //this.layerOrder.push(landmarkPolygonMboxIf.getLayer());
  /*landmarkPolygonMboxIf.getLandmarkPolygon({
    urlid: vidteq.aD.urlId
    ,key: vidteq.aD.initKey
    ,city: vidteq.cfg.city
    ,url: vidteq.cfg.nemoApi
  });*/
  var that = this;
  this.universalSelect = new OpenLayers.Control.SelectFeature(
    this.layerOrder,
    { clickout:true,
      toggle:true,
      hover: false,
      //multiple: false,
      //toggleKey: "ctrlKey",
      //multipleKey: "shiftKey",
      //box: true,
      //  opacity:1,
      highlightOnly: false,
      callbacks: {
        over: function(feature) {
          if(feature.layer.name=='srfLayer'){
            if(typeof(that.wowMode) != 'undefined' && that.wowMode) {
              that.focusResult(feature.entity.lpIndex);
            }
          }
          var layer = feature.layer;
          var cont = layer.events.triggerEvent("beforefeaturehighlighted", {
              feature : feature
          });
          if(cont !== false) {
            feature._prevHighlighter = feature._lastHighlighter;
            feature._lastHighlighter = this.id;
            var style = this.selectStyle || this.renderIntent;
            layer.drawFeature(feature, style);
            layer.events.triggerEvent("featurehighlighted", {feature : feature});
          }
        }
        ,out: function(feature) {
          var layer = feature.layer;
          if(feature._prevHighlighter == undefined) {
            delete feature._lastHighlighter;
          } else if(feature._prevHighlighter == this.id) {
              delete feature._prevHighlighter;
          } else {
              feature._lastHighlighter = feature._prevHighlighter;
              delete feature._prevHighlighter;
          }
          layer.drawFeature(feature, feature.style || feature.layer.style || "default");
          layer.events.triggerEvent("featureunhighlighted", {feature : feature});
        }
      }
    }
  );
  this.universalSelect.handlers.feature.stopDown = false;
  //this.map.addControl(this.universalSelect);

  this.hoverLayerOrder = [];
  if (this.wfsLayer) {
    this.hoverLayerOrder = [this.wfsLayer];
    this.hoverSelect = new OpenLayers.Control.SelectFeature(this.hoverLayerOrder,{
      hover : true,
      highlightOnly : false,
      renderIntent : "select"
    });
    this.map.addControl(this.hoverSelect);
  }
  this.map.addControl(this.universalSelect);
  //if (this.wfsLayer) {
  //  this.hoverSelect.activate();
  //}
  this.universalSelect.activate();
  var click = new OpenLayers.Control.Click();
  this.map.addControl(click);
  click.activate();
  var dblclick = new OpenLayers.Control.DblClick();
  this.map.addControl(dblclick);
  dblclick.activate();

  //var that = this;
  //var pinch = new OpenLayers.Control.PinchZoom();
  //this.map.addControl(pinch);
  //pinch.activate();
  // TBD this does not work because multiple touch event is not passed on
  // to openlayers from browser

  if (typeof(z_category) != 'undefined'){
    //$("#button_zcat").click();
    //try { $("#button_zcat").click(); } catch(e) { };
  }
  //this.addControlsForVia();
  //TBD: setting of mapCenterOffset should be externalize
  if(this.gui.embed && this.gui.embed.place && this.gui.embed.place.lonlat) {
    if(this.gui.sideBarUI) {
      this.mapCenterOffset = 200;
    }
    this.zoomToFit({point:[this.gui.embed.place.lonlat]});
  } else {
    //if(vidteq.urlid == 'Prestige_Group' || vidteq.urlid == 'Prestige_Portfolio') {
    if('vistaManner' in vidteq && (vidteq.vistaManner.mapView || vidteq.vistaManner.portFolio)) {
      var evaLonLat = this.lonLatObjFrmPoint(vidteq.aD.places.center.entity.geom);
      this.mapCenterOffset = 200;
      this.zoomToFit({point:[evaLonLat],zoom:vidteq.aD.config.homeZoom});
    } else {
      this.map.setCenter(new OpenLayers.LonLat(vidteq.cfg.centerLon, vidteq.cfg.centerLat), vidteq.cfg.topZoom);
    }
  }

  if(this.gui.embed && this.gui.embed.minimap) {
    if(parseInt(this.gui.embed.height) < 240 ||  parseInt(this.gui.embed.width) < 320) {
      //TBD: use selector once if requires to be called more than once
      //if not doing anything special using jquery, use document.getElementById to select node
      //var el_mapDom = document.getElementById(this.mapDom);
      $('#'+this.mapDom)[0].style.cursor='pointer';
      $('#'+this.mapDom)[0].title='Click to get more detailed features';
      $('#'+this.mapDom)[0].onclick=this.popoutTheMinimap;
    }
  } else if(this.gui.embed && this.gui.embed.firstTimeRule && this.gui.embed.firstTimeRule.busId) {
  } else if (this.gui.embed && (this.gui.handheld || this.gui.appMode)){
  } else if (this.gui.embed && this.eMap) {
  } else if (this.gui.nemo) {
  } else if (this.gui.wap) {
  } else {
    var that = this;
    var el_mapDom = document.getElementById(this.mapDom);
    if( el_mapDom ) {
      el_mapDom.oncontextmenu = function (e) { that.attachRcmMenuToMap.apply(that,[e]);return false; };
      //this.setTitle( 'Right Click on Map for more options', el_mapDom );
      this.setTitle( this.mapTitle, el_mapDom );
    }
  }
  //if (typeof(z_category) != 'undefined'){
  //  $("#button_zcat")[0].onclick();
  //}

//if (this.gui.embed && vidteq.aD.handheldEnabled){
//  var that = this;
//$('.olControlZoomToMaxExtentItemInactive').css('right',parseInt(getWidth()-90)+'px');
//  $('.olControlZoomToMaxExtentItemInactive').click(function(){
//    //console.log("blah clicked ");
//    if (that.carPoint) {
//      //console.log("blah clicked and inside carpoint");
//      var zoomLonLat={};
//      zoomLonLat.point=new Array();
//      zoomLonLat.point[0]={};
//      zoomLonLat.point[0].lon=that.carPoint.geometry.x;
//      zoomLonLat.point[0].lat=that.carPoint.geometry.y;
//      that.zoomToFit(zoomLonLat);
//      return false;
//    }
//    return true;
//  });
//}

  if (this.gui.handheld || this.gui.appMode || this.gui.wap || true) {  //red circle marker layer
    var renderer = OpenLayers.Util.getParameters(window.location.href).renderer;
    renderer = (renderer) ? [renderer] : OpenLayers.Layer.Vector.prototype.renderers;
    this.decoStyle= new OpenLayers.Style ({
      fillOpacity : 0.2,
      graphicOpacity : 0.8,
      graphicTitle: "${pointRadius}"
    },
    { context :{
      pointRadius : function (feature) { return feature.data.pointRadius; }
    } }
  );
    this.decoLayer = new OpenLayers.Layer.Vector("Simple Geometry", {
        style: this.decoStyle,
        renderers: renderer
    });
    this.map.addLayer(this.decoLayer);
    this.markerLayer = new OpenLayers.Layer.Vector("Simple Geometry", {
        style: this.decoStyle,
        renderers: renderer
    });
    this.map.addLayer(this.markerLayer);
    //TBD TBD
    //this.dragP = new OpenLayers.Control.DragFeature(this.decoLayer, {
    //  onComplete : function (e) {
    //    if (!e) { return; }
    //    var id=this.feature.attributes.id;
    //    if(id=='pin'){
    //        that.doLmrSearch(e.geometry.x,e.geometry.y);
    //        that.decoLayer.removeFeatures([that.shadowPoint]);
    //        delete that.shadowPoint;
    //    } else {
    //      //this.feature.style.rotation=vidteq.gL.syncCarToRoute(e.geometry.x,e.geometry.y);
    //     // if(vidteq.gL.routeShown) vidteq.gL.syncCarToRoute(e.geometry.x,e.geometry.y);
    //      //var l = new OpenLayers.LonLat(e.geometry.x,e.geometry.y);
    //      //this.feature.move(l);
    //    }
    //  },
    //  onDrag : function (e) {
    //  //if (!that.shadowPoint) {
    //  //}
    //  },
    //  onStart : function (e) {
    //    var id=this.feature.attributes.id;
    //    if ( id == 'pin'){
    //      that.shadowPoint = new OpenLayers.Feature.Vector(this.feature.geometry.clone(),{shadow:true});
    //      that.decoLayer.addFeatures([that.shadowPoint]);
    //      if(!that.decoLayer.posFlag) {
    //        that.decoLayer.startLon=e.geometry.x;
    //        that.decoLayer.startLat=e.geometry.y;
    //      }
    //    }
    //  }
    //});
    this.lineStyle= new OpenLayers.Style ({
      strokeWidth: 19,
      strokeColor: '#be2926',
      fillColor:'#be2926',
      pointRadius:10
    });
    this.lineVector = new OpenLayers.Layer.Vector("Simple Geometry", {
        style: this.lineStyle
    });
    this.map.addLayers([this.lineVector]);
    //  this.map.addControl(this.dragP);
    //  this.dragP.activate();
    //  this.newControl=new OpenLayers.Control.SelectFeature(this.textDirLayer,{'onSelect':this.sampleFunc});
    //  this.map.addControl(this.newControl);
    //  this.newControl.activate();
  }
  //var that=this;
  //if(vidteq.eVisit)
  //  setTimeout(function(){
  //    $('#projScreen').hide();
  //    that.projectCenter();
  //  },2000);

  this.addWFSLayer();
}

vidteq.mbox.prototype.handleMapSingleClick = function(e) {
    //var lonlatTransf = lonlat.transform(map.getProjectionObject(), proj4326);
    //var lonlat = lonlatTransf.transform(proj4326, map.getProjectionObject());
    /*vidteq.load.js({},"mapruler,DynamicMeasure", function( options ) {
      if( vidteq._mapruler && OpenLayers.Control.DynamicMeasure ) {
        var mbox = options.mbox;
        if( !mbox.mapruler ) {
          mbox.mapruler = new vidteq._mapruler( mbox.map );
        }else {
          mbox.mapruler.init();
        }
        return true;
      }
    }).init({
      mbox: this
    });*/

    var map = this.map;
    var lonlat = map.getLonLatFromViewPortPx(e.xy);
    var iconUrl = vidteq.imgPath.searchNearby;
    var icon = new OpenLayers.Icon( iconUrl );
    var markerslayer = this.createMarkerLayer( 'ClickMarkers' );
    var marker = new OpenLayers.Marker(lonlat, icon);
    markerslayer.addMarker( marker );

    var imageDiv = marker.icon.imageDiv;
    var style = imageDiv.style;
    var pointerId = imageDiv.id + "_pointer";
    var popupId = imageDiv.id + "_popup";

    if( this.gui && this.gui.searchNearby && typeof this.gui.searchNearby === 'function' ) {
      this.gui.searchNearby( lonlat, popupId );
    }

    var pHeight = 20;
    var pWidth = 20;
    var pointerPopup = OpenLayers.Util.createDiv(
      popupId, null, null
    );
    pointerPopup.className = "mapClickPointer-popup mapClickPointer-wap";
    pointerPopup.style.top = ( parseInt( style.top ) - 1.4*pHeight )+"px";
    pointerPopup.style.left = ( parseInt( style.left ) + 1.1*pWidth )+"px";
    imageDiv.parentNode.appendChild( pointerPopup );

    var pointer = OpenLayers.Util.createDiv(
      pointerId, null, {w: pWidth, h: pHeight}
    );
    pointer.className = "mapClickPointer";
    pointer.style['margin-left'] = pWidth/2+"px";
    pointer.style['margin-top'] = pHeight/2+"px";
    pointer.style.top = ( parseInt( style.top ) - pHeight/2 )+"px";
    pointer.style.left = ( parseInt( style.left ) - pWidth/2 )+"px";
    imageDiv.parentNode.appendChild( pointer );

    //Pointer animation
    $("#"+pointerId).animate(
      {
        width:pWidth+'px',height:pHeight+'px',opacity:0
      }
      ,1000
      ,function() {
        $("#"+pointerId).fadeIn(
          100
          ,function() {
            $("#"+pointerId).css({width:'0px',height:'0px',opacity:1});
          }
        );
      }
    );
}

vidteq.mbox.prototype.isInCity = function (pos) {
  var b = vidteq.cfg.maxExtent.split(',');
  if (parseFloat(b[0]) < pos.lon &&
      parseFloat(b[2]) > pos.lon &&
      parseFloat(b[1]) < pos.lat &&
      parseFloat(b[3]) > pos.lat) {
    return true;
  }
  return false;
}

vidteq.mbox.prototype.overrideOLClasses=function () {
  if (!this.wowMode && navigator.userAgent.match(/chrome/i)) {
    OpenLayers.Layer.Vector.prototype.renderers = ['SVG','Canvas','VML'];
  }
  //OpenLayers.Util.onImageLoadTimeOutForIpad = function() {
  //  if (!this.isLoading) { return; };
  //  this.imgDiv._attempts = (this.imgDiv._attempts) ? (this.imgDiv._attempts + 1) : 1;
  //  if (this.imgDiv._attempts <= OpenLayers.IMAGE_RELOAD_ATTEMPTS) {
  //    var src = this.imgDiv.src;
  //    if (src.match(/myRand=/)) {
  //      src = src.replace(/myRand=[0-9][0-9]*/,Math.floor(Math.random()*100000));
  //    } else {
  //      src = src+"&myRand="+Math.floor(Math.random()*100000);
  //    }
  //    this.imgDiv.src = src
  //    var that = this;
  //    if (this.imgDiv.timer) { clearTimeout(this.imgDiv.timer); }
  //    this.imgDiv.timer = setTimeout(function(){
  //      OpenLayers.Util.onImageLoadTimeOutForIpad.apply(that,[]);
  //    },1000);
  //  } else {
  //    OpenLayers.Element.addClass(this, "olImageLoadError");
  //  }
  //  this.style.display = "";
  //};
  //var mBoxRef = this;
  //OpenLayers.Tile.Image.prototype.positionImage = function () {
  //  // if the this layer doesn't exist at the point the image is
  //  // returned, do not attempt to use it for size computation
  //  if (this.layer == null) {
  //      return;
  //  }
  //  // position the frame
  //  OpenLayers.Util.modifyDOMElement(this.frame,
  //                                    null, this.position, this.size);

  //  var imageSize = this.layer.getImageSize(this.bounds);
  //  if (this.layerAlphaHack) {
  //      OpenLayers.Util.modifyAlphaImageDiv(this.imgDiv,
  //              null, null, imageSize, this.url);
  //  } else {
  //      OpenLayers.Util.modifyDOMElement(this.imgDiv,
  //              null, null, imageSize) ;
  //      if (this.imgDiv.src != this.url) { this.imgDiv._attempts = 0; }
  //      this.imgDiv.src = this.url;
  //      if (mBoxRef.gui.appMode && !mBoxRef.gui.wfHandheld) {
  //        var that = this;
  //        if (this.imgDiv.timer) { clearTimeout(this.imgDiv.timer); }
  //        this.imgDiv.timer = setTimeout(function() {
  //          OpenLayers.Util.onImageLoadTimeOutForIpad.apply(that,[]);
  //        },1000);
  //      }
  //  }
  //};

  var that = this;
  OpenLayers.Handler.Marker = OpenLayers.Class(OpenLayers.Handler.Feature, {
    handle: function(evt) {
      var type = evt.type;
      var node = OpenLayers.Event.element(evt);
      var feature = null;
      for (var i=0; i<this.layer.markers.length; i++) {
        if (this.layer.markers[i].icon.imageDiv.firstChild == node) {
          feature = this.layer.markers[i];
          break;
        }
      }
      var selected = false;
      if (feature) {
        if (this.geometryTypes == null) {
          // over a new, out of the last
          // over a new of still on the last
          if (!this.feature) {
            // over a nwe feature
            this.callback('over', [feature]);
          } else {
            // out of the last and over a new
            this.callback('out', [this.feature]);
            this.callback('over', [feature]);
          }
          this.feature = feature;
          this.callback(type, [feature]);
          selected = true;
        } else {
          if (this.feature && (this.feature != feature)) {
            // out of the last and over a new
            this.callback('out', [this.feature]);
            this.feature = null;
          }
          selected = false;
        }
      } else {
        if (this.feature) {
          // out of the last
          this.callback('out', [this.feature]);
          this.feature = null;
        }
        selected = false;
      }
      return selected;
    },
    CLASS_NAME: "OpenLayers.Handler.Marker"
  });
  if ( OpenLayers.Strategy.BBOX ) {
    OpenLayers.Strategy.myBBOX = OpenLayers.Class(OpenLayers.Strategy.BBOX, {
      vidteqSwitch:false,
      invalidBounds: function(mapBounds) {
        if(!mapBounds) { mapBounds = this.getMapBounds(); }
        var invalid = !this.bounds || !this.bounds.containsBounds(mapBounds);
        if(!invalid && this.resFactor) {
          var ratio = this.resolution / this.layer.map.getResolution();
          if (this.vidteqSwitch) {
            invalid = (ratio > this.resFactor || ratio < (1 / this.resFactor));
          } else {
            invalid = (ratio >= this.resFactor || ratio <= (1 / this.resFactor));
          }
        }
        return invalid;
      },
      CLASS_NAME: "OpenLayers.Handler.myBBOX"
    });
  }

  if ( OpenLayers.Protocol.WFS ) {
    OpenLayers.Protocol.myScript = OpenLayers.Class(OpenLayers.Protocol.Script, {
      handleResponse: function(response, options) {
        if (response.aborted) {
          this.destroyRequest(response.priv);
          return;
        }
        if (options.callback) {
          if (response.data) {
              response.features = this.parseFeatures(response.data);
              response.code = OpenLayers.Protocol.Response.SUCCESS;
          } else {
              response.code = OpenLayers.Protocol.Response.FAILURE;
          }
          this.destroyRequest(response.priv);
          options.callback.call(options.scope, response);
        }
      },
      abort: function(response) {
        if (response) {
          response.aborted = true;
          //this.destroyRequest(response.priv);
        } else {
          for (var key in this.pendingRequests) {
            this.destroyRequest(this.pendingRequests[key]);
          }
        }
      },
      CLASS_NAME: "OpenLayers.Handler.myScript"
    });
    //OpenLayers.Protocol.myWFS = OpenLayers.Class(OpenLayers.Protocol.WFS.v1_1_0, {
    //  read: function(options) {
    //    OpenLayers.Protocol.prototype.read.apply(this, arguments);
    //    options = OpenLayers.Util.extend({}, options);
    //    OpenLayers.Util.applyDefaults(options, this.options || {});

    //    var t = {
    //      resolution:options.scope.resolution,
    //      left:options.filter.value.left,
    //      right:options.filter.value.right,
    //      top:options.filter.value.top,
    //      bottom:options.filter.value.bottom
    //    };
    //    var data = JSON.stringify(t);
    //    var response;
    //    if (true) {
    //      response = new OpenLayers.Protocol.Script({
    //        url: options.url
    //        ,params: {action:'getPoisAsWfs',city:vidteq.cfg.city,bounds:data}
    //        ,callback: this.createCallback(this.handleRead, response, options)
    //      });
    //    } else {
    //      response = new OpenLayers.Protocol.Response({requestType: "read"});
    //      response.priv = OpenLayers.Request.GET({
    //        url: options.url
    //        ,callback: this.createCallback(this.handleRead, response, options)
    //        ,params: {action:'getPoisAsWfs',city:vidteq.cfg.city,bounds:data}
    //      });
    //    }
    //    return response;
    //  },
    //  CLASS_NAME: "OpenLayers.Handler.myWFS"
    //});
  }
  //OpenLayers.Control.DragMarker = OpenLayers.Class(OpenLayers.Control.DragFeature, {
  //  initialize: function(layer, options) {
  //    OpenLayers.Control.prototype.initialize.apply( this, [options] );
  //    this.layer = layer;
  //    this.handlers = {
  //      drag: new OpenLayers.Handler.Drag(
  //        this, OpenLayers.Util.extend({
  //          down: this.downFeature,
  //          move: this.moveFeature,
  //          up:   this.upFeature,
  //          out:  this.outCancel,
  //          done: this.doneDragging
  //        }, this.dragCallbacks
  //        )
  //      ),
  //      feature: new OpenLayers.Handler.Marker(
  //        this, this.layer, OpenLayers.Util.extend({
  //          over: this.overFeature,
  //          out:  this.outFeature
  //        }, this.featureCallbacks
  //        ), {
  //          geometryTypes: this.geometryTypes
  //        }
  //      )
  //    };
  //  } ,
  //  moveFeature: function(pixel) {
  //    var px = this.feature.icon.px.add(pixel.x - this.lastPixel.x, pixel.y - this.lastPixel.y);
  //    this.feature.moveTo(px);
  //    this.lastPixel = pixel;
  //    this.onDrag(this.feature.pixel);
  //  },
  //  CLASS_NAME: "OpenLayers.Control.DragMarker"
  //});
  //Reference: http://harrywood.co.uk/maps/examples/openlayers/click.view.html
  OpenLayers.Control.Click = OpenLayers.Class(OpenLayers.Control, {
    defaultHandlerOptions: {
       'single': true,
       'double': false,
       'pixelTolerance': 0,
       'stopSingle': false,
       'stopDouble': false
    },
    initialize: function(options) {
      this.handlerOptions = OpenLayers.Util.extend(
        {}, this.defaultHandlerOptions
      );
      OpenLayers.Control.prototype.initialize.apply(
        this, arguments
      );
      this.handler = new OpenLayers.Handler.Click(
        this, {
          'click': this.trigger
        }, this.handlerOptions
      );
    },
    trigger: function(e) {
      if (that.clickTaken) { delete that.clickTaken; return; }
      return that.handleMapClick(e);
    }
  });
  OpenLayers.Control.DblClick = OpenLayers.Class(OpenLayers.Control, {
    defaultHandlerOptions: {
       'single': false,
       'double': true,
       'pixelTolerance': 0,
       'stopSingle': false,
       'stopDouble': false
    },
    initialize: function(options) {
      this.handlerOptions = OpenLayers.Util.extend(
        {}, this.defaultHandlerOptions
      );
      OpenLayers.Control.prototype.initialize.apply(
        this, arguments
      );
      this.handler = new OpenLayers.Handler.Click(
        this, {
          'dblclick': this.trigger
        }, this.handlerOptions
      );
    },
    trigger: function(evt) {
      return that.handleMapDblClick(evt);
      //that.killRcmPopup();
      //if (that.mapDblClickToGuiFunc) { that.mapDblClickToGuiFunc(); }
      //// TBD need to be attached properly
      // if(typeof(__experimentalUI)!='undefined' && __experimentalUI) closeAnyDropDowns();
      // return false;
   }
  });
  OpenLayers.Control.PanZoomBar = OpenLayers.Class(OpenLayers.Control.PanZoomBar, {
    draw: function(px) {
      // initialize our internal div
      OpenLayers.Control.prototype.draw.apply(this, arguments);
      px = this.position.clone();
      if (that.panZoomBarLeftOffset) {
        px.x = that.panZoomBarLeftOffset;
      }
      // place the controls
      this.buttons = [];

      var sz = new OpenLayers.Size(18,18);
      //Diff size for different sized pan zoom bar
      var szPLR = new OpenLayers.Size(27,48);
      var szPUD = new OpenLayers.Size(48,27);
      var szPM = new OpenLayers.Size(23,23);
      var centered = new OpenLayers.Pixel(px.x+szPUD.w/2, px.y);
      var wposition = szPUD.w;

      if (this.zoomWorldIcon) {
        centered = new OpenLayers.Pixel(px.x+sz.w, px.y);
      }
      // images are changed later anyway
      var panup = this._addButton("panup", "zoom-level-buttons.png", px.add(13,5), szPUD);
      panup.innerHTML = "<div class='olControlPanup'></div>";
      px.y = centered.y+sz.h;
      var panleft = this._addButton("panleft", "zoom-level-buttons.png", px.add(3,-5.5), szPLR);
      panleft.innerHTML = "<div class='olControlPanleft'></div>";
      if (this.zoomWorldIcon) {
          this._addButton("zoomworld", "zoom-level-buttons.png", px.add(sz.w, 0), sz);
          wposition *= 2;
      }
      var panright = this._addButton("panright", "zoom-level-buttons.png", px.add(42,-4.5), szPLR);
      panright.innerHTML = "<div class='olControlPanright'></div>";
      var pandown = this._addButton("pandown", "zoom-level-buttons.png", px.add(13,24.5), szPUD);
      pandown.innerHTML = "<div class='olControlPandown'></div>";
      var zoomin = this._addButton("zoomin", "zoom-level-buttons.png", centered.add(2, szPM.h*3+8), szPM);
      zoomin.innerHTML = "<div class='olControlZoomin'></div>";
      centered = this._addZoomBar(centered.add(4, szPM.h*4 + 7));
      this.slider.innerHTML = "<div class='olControlSlider'></div>";
      this.zoombarDiv.style.backgroundImage = "";
      this.zoombarDiv.style.width = "";
      this.zoombarDiv.className = "olControlZoombar";
      // slider is still being attached inherently hardcoded in openlayer code
      var zoomout = this._addButton("zoomout", "zoom-level-buttons.png", centered.add(-2,-2), szPM);
      zoomout.innerHTML = "<div class='olControlZoomout'></div>";
      return this.div;
    }
  });

  //OpenLayers.Map.prototype.myPanTo = function (lonlat,dur,opt) {
  this.myPanTo = function (lonlat,dur,opt) {
    var opt = opt || {};
    console.log("inside ");
    console.log(this);
    var center = this.getCachedCenter();

    // center will not change, don't do nothing
    if (lonlat.equals(center)) {
        return;
    }

    var from = this.getPixelFromLonLat(center);
    var to = this.getPixelFromLonLat(lonlat);
    var vector = { x: to.x - from.x, y: to.y - from.y };
    var last = { x: 0, y: 0 };

    //this.panTween.start( { x: 0, y: 0 }, vector, this.panDuration, {}
    var dur = dur || 200;
    this.panTween.start( { x: 0, y: 0 }, vector, dur, {
      callbacks: {
        start: function (px) {
          if (opt.start) { opt.start(px); }
        }
        ,eachStep: OpenLayers.Function.bind(function(px) {
          var x = px.x - last.x,
              y = px.y - last.y;
          this.moveByPx(x, y);
          last.x = Math.round(px.x);
          last.y = Math.round(px.y);
          if (opt.eachStep) { opt.eachStep(px); }
        }, this)
        ,done: OpenLayers.Function.bind(function(px) {
          this.moveTo(lonlat);
          this.dragging = false;
          this.events.triggerEvent("moveend");
          if (opt.done) { opt.done(px); }
        }, this)
      }
    });
  };
  //OpenLayers.Map.prototype.myZoomTo = function(zoom, xy,dur) {
  this.myZoomTo = function(zoom, xy,dur) {
    // non-API arguments:
    // xy - {<OpenLayers.Pixel>} optional zoom origin
    console.log("I am inside zoom to ");
    var map = this;
    if (map.isValidZoomLevel(zoom)) {
      if (map.baseLayer.wrapDateLine) {
        zoom = map.adjustZoom(zoom);
      }
      if (map.zoomTween) {
        var currentRes = map.getResolution(),
          targetRes = map.getResolutionForZoom(zoom),
          start = {scale: 1},
          end = {scale: currentRes / targetRes};
        console.log("end scale is ");console.log(end.scale);
        if (map.zoomTween.playing && map.zoomTween.duration < 3 * map.zoomDuration) {
          // update the end scale, and reuse the running zoomTween
          map.zoomTween.finish = {
              scale: map.zoomTween.finish.scale * end.scale
          };
        } else {
          if (!xy) {
            var size = map.getSize();
            xy = {x: size.w / 2, y: size.h / 2};
          }
          //map.zoomTween.start(start, end, map.zoomDuration, { });
          var dur = dur || 200;
          map.zoomTween.start(start, end, dur, {
            minFrameRate: 12, // don't spend much time zooming
            callbacks: {
              eachStep: function(data) {
                var containerOrigin = map.layerContainerOriginPx,
                    scale = data.scale,
                    dx = ((scale - 1) * (containerOrigin.x - xy.x)) | 0,
                    dy = ((scale - 1) * (containerOrigin.y - xy.y)) | 0;
                map.applyTransform(containerOrigin.x + dx, containerOrigin.y + dy, scale);
              },
              done: function(data) {
                map.applyTransform();
                var resolution = map.getResolution() / data.scale,
                    zoom = map.getZoomForResolution(resolution, true)
                map.moveTo(map.getZoomTargetCenter(xy, resolution), zoom, true);
              }
            }
          });
        }
      } else {
        var center = xy ?
            map.getZoomTargetCenter(xy, map.getResolutionForZoom(zoom)) :
            null;
        map.setCenter(center, zoom);
      }
    }
  };
}

vidteq.mbox.prototype.handleMapClick = function (e) {
  if (vidteq.vistaManner && vidteq.vistaManner.selfieLink) {
    var pos = {x:e.clientX,y:e.clientY,dragdom:false};
    vidteq.selfieLinkMboxIF.setFeatures(pos);
    return;
  }
  this.handleMapSingleClick( e );
  this.blackOutKIV();
  if (this.mapClickToGuiFunc) { this.mapClickToGuiFunc(e); }
  // TBD need to be attached properly
  // if (vidteq.mboxObj.imagetab.active) { vidteq.mboxObj.popupWfsLayer.apply(vidteq.mboxObj,[e]) }
  //if (this.gui && this.gui.topBarUI) { this.gui.closeAnyDropDowns(); }
  //$('#lr_div').hide('slow',null);
  if(typeof(this.wowMode) != 'undefined' && this.wowMode
       && typeof(this.catHandlerEnabled)!= 'undefined'
       && this.catHandlerEnabled) {
    this.removeOpenPopup();
  }
  if(this.map.popups.length > 0 && 'undefined' != typeof(vidteq.aD) && vidteq.aD.q == 'locatestores'){
    if(this.catMngr){
      this.catMngr.removeOpenCatPopup(e);
    }
  }
  this.killRcmPopup();
  if(this.gui.wap) {
    if($('#directionsDiv').is(':visible')) this.attachRcmMenuToMap(e);
  } else {
    if(this.gui.embed && (this.gui.handheld || this.gui.appMode)){
      this.attachRcmMenuToMap(e);
    }
  }
  return true;
  ////if(this.gui.wap)
  ////  this.attachWapMenu(e);
  //if (this.gui.wap) {
  //  if (typeof(this.wcmPopup) != 'undefined' && this.wcmPopup != null) {
  //    this.killWcmPopup();
  //  }
  //  if ($('#directionsDiv').is(':visible') && !vidteq.eVisit) this.attachWapMenu(e);
  //  return true;
  //}
  //if(this.gui.embed && (this.gui.handheld || this.gui.appMode || this.gui.wap)){
  //  // TBD wap cannot co-exist with embed for now clean up following code
  //  // depending on wap feature brought to evisit
  //  if (typeof(this.wcmPopup) != 'undefined' && this.wcmPopup != null) {
  //    this.killWcmPopup();
  //  }
  //  if(typeof(this.rcmPopup) != 'undefined' && this.rcmPopup != null) {
  //    this.killRcmPopup();
  //  }
  //  if(this.gui.wap) {
  //    if($('#directionsDiv').is(':visible')) this.attachWapMenu(e);
  //  } else {
  //    this.attachRcmMenuToMap(e);
  //  }
  //} else {
  //  this.killRcmPopup();
  //}
  //return true;
}

vidteq.mbox.prototype.handleMapDblClick = function (evt) {
  this.killRcmPopup();
  // TBD need to be attached properly
  //if (this.gui && this.gui.topBarUI) { this.gui.closeAnyDropDowns(); }
  if (this.mapDblClickToGuiFunc) { this.mapDblClickToGuiFunc(evt); }
  return false;
}

//vidteq.mbox.prototype.sampleFunc = function (feature) {
//  //var nearestIndex = vidteq.mboxObj.syncMapPoints[feature.attributes.id];
//  //console.log(feature.attributes.id);
//  //fvtObj.getVideoObj(fvtObj.videoSwf).playVideo(nearestIndex);
//  vidteq.mboxObj.showDirectionsPopup(feature.attributes.id,feature.geometry.x,feature.geometry.y);
//}

//vidteq.mbox.prototype.stopSeeding = function() {
//        // we're done - restore previous settings
//        this.map.layer.events.unregister("loadend", null, seed);
//        this.map.layer.buffer = seeding.buffer;
//        map.setCenter(seeding.center, seeding.zoom);
//        if (!seeding.cacheWriteActive) {
//            cacheWrite.deactivate();
//        }
//        if (read.checked) {
//            setType();
//        }
//        seeding = false;
//    }

vidteq.mbox.prototype.getViaString = function () {
  var viaString='';
  for(var i in this.viaMarkers) {
    if (this.viaMarkers[i].data.lonlat) {
      viaString+=this.viaMarkers[i].data.lonlat.lon+' '+this.viaMarkers[i].data.lonlat.lat;
    } else {
      // TBD geom should never has lon lat under - need to be phased out
      viaString+=this.viaMarkers[i].data.geom.lon+' '+this.viaMarkers[i].data.geom.lat;
    }
    if(i!=(this.viaMarkers.length-1)) viaString+=',';
  }
  if (viaString == '') return null;
  return viaString;
}

//vidteq.mbox.prototype.addControlsForVia = function () {
//  var newControl=new OpenLayers.Control.SelectFeature(this.route,{'hover':true,'onSelect':this.placeViaBall,'onUnselect':this.removeViaBall});
//  this.map.addControl(newControl);
//  this.map.controls[11].activate();
//  //this.dragViaBall = new OpenLayers.Control.DragMarker(this.viaBallMarkerLayer,{
//  //  'onComplete': function (markerObj) {
//  //    if(markerObj) {
//  //      vidteq.mboxObj.map.controls[11].activate();
//  //      var viaMarkerIndex=0;
//  //      var viaBallLoc = new OpenLayers.LonLat(markerObj.lonlat.lon,markerObj.lonlat.lat);
//  //      if(!vidteq.mboxObj.viaMarkers) {
//  //        vidteq.mboxObj.viaMarkers=[];
//  //      } else {
//  //        vidteq.mboxObj.placeViaBallMarker(viaBallLoc);
//  //      }
//  //      //   vidteq.mboxObj.releaseCarAfterDrag.apply(vidteq.mboxObj,[parseFloat(e.lonlat.lon),parseFloat(e.lonlat.lat)]);
//  //    }
//  //  },
//  //  'onStart': function (markerObj) {
//  //    vidteq.mboxObj.map.controls[11].deactivate();
//  //    vidteq.mboxObj.placeViaBallFlag=false;
//  //  }
//  //});
//  //this.map.addControl(this.dragViaBall);
//  //this.dragViaBall.activate();
//}

vidteq.mbox.prototype.addViaSet = function (viaSet) {
  if(!this.viaMarkers) this.viaMarkers=[];
  var features = [];
  for (var i in viaSet) {
    this.placeViaBallFlag = true;
    var icon = {
      mapUrl:vidteq.imgPath.viaBallMarkers+"v"+(this.viaMarkers.length+1)+".png"+'?r='+vidteq.cfg._rStr,
      w:this.gui.wap?32:45,
      h:this.gui.wap?32:45
    };
    //var data = {type:'via',geom:viaSet[i],icon:icon};
    var data = {
      type:'via',
      lonlat:{lon:viaSet[i].lon,lat:viaSet[i].lat},
      geom:"POINT("+viaSet[i].lon+" "+viaSet[i].lat+")",
      icon:icon
    };
    var v = new OpenLayers.Geometry.Point(viaSet[i].lon,viaSet[i].lat);
    var oneFeature = new OpenLayers.Feature.Vector(v,data);
    features.push(oneFeature);
    this.viaMarkers.push(oneFeature);
    ioAreaObj.getPointInfo(data,'via');  // TBD why ?
  }
  this.startEndMarkLayer.addFeatures(features);
}

vidteq.mbox.prototype.addVia = function (via) {
  var features = [];
  if(!this.viaMarkers) this.viaMarkers=[];
  if (!via.icon) {
    via.icon = {
      mapUrl:vidteq.imgPath.viaBallMarkers+"v"+(parseInt(via.viaIdx)+1)+".png"+'?r='+vidteq.cfg._rStr,
      w:this.gui.wap?32:45,
      h:this.gui.wap?32:45
    };
  }
  var v = new OpenLayers.Geometry.Point(via.lonlat.lon,via.lonlat.lat);
  var oneFeature = new OpenLayers.Feature.Vector(v,via);
  this.viaMarkers.push(oneFeature);
  features.push(oneFeature);
  this.startEndMarkLayer.addFeatures(features);
}

//vidteq.mbox.prototype.placeViaBallMarker = function (viaBallLoc,noAutoReq) {
//  ioAreaObj.changeBackOpacity(0.2);
//  ioAreaObj.displayMessage(ioAreaObj.loadingDivMessage);
//  if(!vidteq.mboxObj.viaMarkers) vidteq.mboxObj.viaMarkers=[];
//  var viaMarkerIndex=vidteq.mboxObj.viaMarkers.length;
//  viaBallIconUrl=vidteq.imgPath.viaBallMarkers+"v"+(viaMarkerIndex+1)+".png";
//  viaBallIcon=new OpenLayers.Icon(viaBallIconUrl,vidteq.mboxObj.viaBallSize,null,vidteq.mboxObj.imageIconOffset);
//  vidteq.mboxObj.viaMarkers[viaMarkerIndex] = new OpenLayers.Marker(viaBallLoc,viaBallIcon);
//  vidteq.mboxObj.placeViaBallFlag=true;
//  vidteq.mboxObj.removeViaBall();
//  vidteq.mboxObj.addViaMarkerToLayer(viaMarkerIndex);
//  vidteq.mboxObj.viaMarkers[viaMarkerIndex].icon.imageDiv.style.zIndex="9500";
//  if (typeof(noAutoReq) != 'undefined' && noAutoReq) {
//  } else {
//    ioAreaObj.placeViaRequest();
//    vidteq.mboxObj.killRcmPopup();
//  }
//  return 0;
//}
//
//vidteq.mbox.prototype.placeViaBallMarkerOld = function (viaBallLoc,noAutoReq) {
//  ioAreaObj.changeBackOpacity(0.2);
//  ioAreaObj.displayMessage(ioAreaObj.loadingDivMessage);
//  if(!vidteq.mboxObj.viaMarkers) vidteq.mboxObj.viaMarkers=[];
//  var viaMarkerIndex=vidteq.mboxObj.viaMarkers.length;
//  viaBallIconUrl=vidteq.imgPath.viaBallMarkers+"v"+(viaMarkerIndex+1)+".png";
//  viaBallIcon=new OpenLayers.Icon(viaBallIconUrl,vidteq.mboxObj.viaBallSize,null,vidteq.mboxObj.imageIconOffset);
//  vidteq.mboxObj.viaMarkers[viaMarkerIndex] = new OpenLayers.Marker(viaBallLoc,viaBallIcon);
//  vidteq.mboxObj.placeViaBallFlag=true;
//  vidteq.mboxObj.removeViaBall();
//  vidteq.mboxObj.addViaMarkerToLayer(viaMarkerIndex);
//  vidteq.mboxObj.viaMarkers[viaMarkerIndex].icon.imageDiv.style.zIndex="9500";
//  if (typeof(noAutoReq) != 'undefined' && noAutoReq) {
//  } else {
//    ioAreaObj.placeViaRequest();
//    vidteq.mboxObj.killRcmPopup();
//  }
//  return 0;
//}

//vidteq.mbox.prototype.addViaMarkerToLayer = function(viaMarkerIndex) {
//  //If marker is already added, remove and reattach, to get the z-Index feeler for the user !
//  if(vidteq.mboxObj.viaMarkers[viaMarkerIndex]) {
//    vidteq.mboxObj.startEndMarkLayer.removeMarker(vidteq.mboxObj.viaMarkers[viaMarkerIndex]);
//  }
//  vidteq.mboxObj.startEndMarkLayer.addMarker(vidteq.mboxObj.viaMarkers[viaMarkerIndex]);
//  return 0;
//}

//vidteq.mbox.prototype.placeViaBall = function () {
//  var viaBallLonLat=vidteq.mboxObj.map.getLonLatFromPixel(vidteq.mboxObj.map.controls[8].lastXy);
//  var pointWkt='POINT('+viaBallLonLat.lon+' '+viaBallLonLat.lat+')';
//  vidteq.mboxObj.viaBallMarkerLayer.removeMarker(vidteq.mboxObj.viaBallMarker);
//  var viaBallLoc = new OpenLayers.LonLat(viaBallLonLat.lon,viaBallLonLat.lat);
//  vidteq.mboxObj.viaBallMarker = new OpenLayers.Marker(viaBallLoc,vidteq.mboxObj.viaBallIcon);
//  vidteq.mboxObj.viaBallMarkerLayer.addMarker(vidteq.mboxObj.viaBallMarker);
//  vidteq.mboxObj.viaBallMarker.icon.imageDiv.style.zIndex='12000';
//  vidteq.mboxObj.viaBallMarker.icon.imageDiv.style.cursor='pointer';
//  vidteq.mboxObj.viaBallMarker.icon.imageDiv.title='Drage me and release to alter the  route';
//  /*vidteq.mboxObj.removeFeatures('viaBallLayer');
//  vidteq.mboxObj.pushFeatures('viaBallLayer',vidteq.mboxObj.parser.read(pointWkt));*/
//  vidteq.mboxObj.placeViaBallFlag=true;
//  if(vidteq.mboxObj.placeViaBallFlag) $('#'+vidteq.mboxObj.mapDom)[0].onmousemove=vidteq.mboxObj.placeViaBall;
//}

//vidteq.mbox.prototype.removeViaBall = function () {
//  /*vidteq.mboxObj.removeFeatures('viaBallLayer');
//  vidteq.mboxObj.placeViaBallFlag=false;*/
//  if(vidteq.mboxObj.placeViaBallFlag) {
//    vidteq.mboxObj.viaBallMarkerLayer.removeMarker(vidteq.mboxObj.viaBallMarker);
//    $('#'+vidteq.mboxObj.mapDom)[0].onmousemove=null;
//  }
//}

vidteq.mbox.prototype.tweakMapControls = function () {
  //this.imagetab.panel_div.style.display="none";
  //this.videotab.panel_div.style.display="none";
  if(parseInt(this.gui.embed.height)<=250 || parseInt(this.gui.embed.width)   <=250) {
     var ab=this.map.getControlsByClass('OpenLayers.Control.PanZoomBar');

    if(parseInt(this.gui.embed.height)<=60 || parseInt(this.gui.embed.width)  <=60) {
      ab[0].div.style.display='none';

    } else {
      ab[0].buttons[0].style.display="none";
      ab[0].buttons[1].style.display="none";
      ab[0].buttons[2].style.display="none";
      ab[0].buttons[3].style.display="none";
      ab[0].buttons[4].style.top="4px";
      ab[0].buttons[5].style.top="20px";
      ab[0].div.childNodes[6].style.display="none";
      ab[0].div.childNodes[5].style.display="none";

    }
    ab=this.map.getControlsByClass("OpenLayers.Control.Attribution");

    //map.controls[4].buttons[7].style.display="none";
    //map.controls[4].buttons[6].style.display="none";
    ab[0].div.style.fontSize="9px";

    if(parseInt(this.gui.embed.height)<200 || parseInt(this.gui.embed.width)  <200)
      ab[0].div.style.display="none";

  } else {
    var dc=this.map.getControlsByClass("OpenLayers.Control.Attribution");
    dc[0].div.style.fontSize="12px";
  }
}

vidteq.mbox.prototype.offsetPanZoomBar = function (width) {
  this.panZoomBarLeftOffset = width || 4;
  this.panZoomBar.redraw();
}

//vidteq.mbox.prototype.toggleTab = function (tabObj) {
//  for (var i in this.addOnTabs) {
//    if (this.addOnTabs[i] == tabObj) continue;
//    if (this.addOnTabs[i].tabLayer) this.addOnTabs[i].tabLayer.clearLayer();
//  }
//  tabObj.tabLayer.toggleTab();
//  this.updateClearButton();  // needa mechanism to clear
//}

//vidteq.mbox.prototype.updateClearButton = function () {
//  var isTabActive = false;
//  for (var i in this.addOnTabs) {
//    if (this.addOnTabs[i].active) isTabActive = true;
//  }
//  if ( this.routeActive || this.srfActive || isTabActive ) {
//    this.gui.toggleButtons({"clearroutetab":true});
//  } else {
//    this.gui.toggleButtons({"clearroutetab":false});
//  }
//}

//vidteq.mbox.prototype.loadImageWfsLayer = function () {
//  this.gui.displayMessage("Loading Images .. please be patient");
//  if(this.imagetab.active==true) {
//    var zoomLevel=this.map.getZoom();
//    zoomLevel+=10;
//  }
//  bounds=this.imagetab.tabLayer.layer.getTilesBounds();
//  var reqData= {
//    z:zoomLevel,
//    b:bounds.left+" "+bounds.bottom+","+bounds.right+" "+bounds.top,
//    maptile:"requestgml"
//  }
//  var that = this;
//  $.getJSON(vidteq.cfg.imgTileUrl,reqData,function (response) {
//    that.imgTile=response;  // TBD not sure about the context
//    that.imgTile.boxes=new Array();
//    for(i=0;i<that.imgTile.points.length;i++) {
//      var ll=that.imgTile.points[i].split(",");
//      ll[0]=parseFloat(ll[0]);
//      ll[1]=parseFloat(ll[1]);
//      var factor=8*that.map.getResolutionForZoom(that.map.getZoom());
//      var minlon=ll[0]-factor;
//      var minlat=ll[1]-factor;
//      var maxlon=ll[0]+factor;
//      var maxlat=ll[1]+factor;
//      that.imgTile.boxes[i]=new OpenLayers.Bounds(maxlon,maxlat,minlon,minlat);
//      // TBD why extend ?
//      that.imgTile.boxes[i].extend(new OpenLayers.LonLat(minlon,minlat));
//      that.imgTile.boxes[i].extend(new OpenLayers.LonLat(maxlon,maxlat));
//    }
//    this.gui.displayMessage("Images at this zoom level loaded");
//  });
//}

// TBD context not sure
//vidteq.mbox.prototype.popupWfsLayer = function(e) {
//  var lonlat=this.map.getLonLatFromPixel(this.map.events.getMousePosition(e));
//  var didISearch = false;
//  for(i=0;i<this.imgTile.boxes.length;i++) {
//    if(this.imgTile.boxes[i] && this.imgTile.boxes[i].containsLonLat(lonlat,'inclusive')) {
//      this.imageTilePopup(lonlat,this.imgTile.names[i],this.imgTile.poiname[i]);
//      didISearch=true;
//      break;
//    }
//  }
//  if (didISearch) return 0;
//}

vidteq.mbox.prototype.prepareContentAndReturnSizeForPopup = function(feature,imageName,imagePOIName) {
  if(!this.wowMode) { return; }
  var f = feature;
  var zoom= this.getCurrentZoom();
  var imageSource=vidteq.cfg.cloneImageUrl+imageName;
  var htmlContent={};
  htmlContent.content="<div id='catmain' oncontextmenu='return false;' style='postion:absoulte;padding:2px;height:"+this.getPopupHeight(screen.height/2)+"px;width:"+this.getPopupWidth(screen.width/2)+"px; '><div  id='nameCat' style='padding:0px;background-color:#f15149;text-align:center;width:"+this.getPopupWidth(screen.width/2)+"px;height:15px;'><a  onfocus='this.blur();' class='cat_button' style='color:white;'><b>"+imagePOIName+"</b></a></div>";
  htmlContent.content+="<div style='position:absolute;top:0px;z-index:10000;'><div id='closeDivContent' style='padding-left:310px; '><img style='cursor:pointer' src='"+vidteq.imgPath.close+"' onclick='javascript:vidteq.mboxObj.universalSelect.unselectAll();vidteq.mboxObj.removeOpenPopup.apply(vidteq.mboxObj,[]);' href='javascript:void(0);'/></div></div>";
  htmlContent.content+="<div><img id='popimage' class='imagepop' style='border:0px; padding:0px; solid white; alt='Image' height='"+this.getPopupHeight(screen.height/2)+"px' width='"+this.getPopupWidth(screen.width/2)+"px' src='"+imageSource+"'</div></div>";
  htmlContent.content+="<div id='bottomAd' class='cat_button'  style ='padding-top:4px;position:absolute; width:"+this.getPopupWidth(screen.width/2)+"px;height:20px'>";
  if(typeof(f.cluster) == 'undefined') {
    htmlContent.content+="Directions : </b><a id=catmainTo style='color:blue;cursor:pointer' >To </a> | <a id=catmainFrom style='color:blue;cursor:pointer' > From</a>";
    if(zoom < 6) htmlContent.content+= " | ";
  }
  if(zoom<6){
    htmlContent.content+= " <a style='color:blue;cursor:pointer;text-align:right' onclick=\"javascript:vidteq.mboxObj.removeOpenPopup();vidteq.mboxObj.zoomToBottom("+f.geometry.x+","+f.geometry.y+")\">";
    htmlContent.content+="Zoom To Street Level</a>";
  }
  htmlContent.content+="</div>";
    htmlContent.toFunction = function () {
    if (vidteq.mboxObj.gui.embed) {
      // TBD via clearing ?
      vidteq.mboxObj.gui.dirFromTo('end',f.data);
    } else {
      f.data.geom = "POINT("+f.data.lonlat.lon+" "+f.data.lonlat.lat+")";
      f.data.address={};
      f.data.address.name = imagePOIName;
      f.data.shownLayer = "imageOnRouteLayer";
      f.data.index = -1;
      f.data.type = 'rcm';
      delete f.data.distance;
      vidteq.routeEndsObj.replaceEntity('end',f.data);
      ioAreaObj.goVid();
    }
  }
  htmlContent.fromFunction = function () {
    if (vidteq.mboxObj.gui.embed) {
      // TBD via clearing
      vidteq.mboxObj.gui.dirFromTo('start',f.data);
    } else {
      f.data.geom = "POINT("+f.data.lonlat.lon+" "+f.data.lonlat.lat+")";
      f.data.address={};
      f.data.address.name = imagePOIName;
      f.data.shownLayer = "imageOnRouteLayer";
      f.data.index = -1;
      f.data.type = 'rcm';
      delete f.data.distance;
      vidteq.routeEndsObj.replaceEntity('start',f.data);
      ioAreaObj.goVid();
    }
  }
  return htmlContent;
}

vidteq.mbox.prototype.startEndPopup = function(keys) {
  var lonlat = keys.lonlat || '';
  var imageName = keys.imgName || '';
  var imagePOIName = keys.imageCaption || '';
  var f = keys.feature;
  this.killRcmPopup();
  this.removeOpenPopup();
  var zoom= this.getCurrentZoom();
  var imageSource= '';
  if(keys.opt == 'startEnd') {
    this.openPopup = new OpenLayers.Popup("activetooltip",
                     new OpenLayers.LonLat(f.geometry.x,f.geometry.y),
                     new OpenLayers.Size(),
                     "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"+f.data.address.name,
                     true);
    this.openPopup.contentDiv.style.padding='0px';
    this.openPopup.contentDiv.style.margin='10px';
    this.openPopup.contentDiv.style.color='#404040';
    this.openPopup.backgroundColor="#f7f7f7";
    this.openPopup.border="#a4a4a4 1px solid ";
    this.openPopup.panMapIfOutOfView = true;
    this.openPopup.autoSize = true;
    this.openPopup.closeDiv.style.background='none';
  } else {
    imageSource = vidteq.cfg.cloneImageUrl+imageName;
    imagePOIName=(typeof(imagePOIName)=='undefined')?(" "):(imagePOIName);
    this.layerName = this.map.getLayersByName('imageOnRouteLayer')[0];
    var htmlContent = this.prepareContentAndReturnSizeForPopup(f,imageName,imagePOIName);
    this.openPopup=new OpenLayers.Popup.Anchored("imagepopupdiv",
                   new OpenLayers.LonLat(lonlat.lon,lonlat.lat),
                   //new OpenLayers.Size(330,270),imagePopupContent,
                   new OpenLayers.Size(this.getPopupWidth(screen.width/2)+5,this.getPopupHeight(screen.height/2)+36),
                   //imagePopupContent,
                   htmlContent.content,
                   null,false,this.removeOpenPopup);
    this.openPopup.setBackgroundColor("white");
    this.openPopup.setBorder("0px");
    this.openPopup.div.style.zIndex=18000;
    this.openPopup.autoSize=false;

  }
  this.map.addPopup(this.openPopup);
  if(keys.opt == 'imageTilePopup') {
    this.catMngr.makeToFromClickable(htmlContent);
    document.getElementById('imagepopupdiv').setClassName='imagepop';
    document.getElementById('imagepopupdiv_contentDiv').setClassName='imagepop';
  }
  if (self.navigator.userAgent.match(/MSIE\s[8]/)){
    $("#catmain").css('width','290px');
    $("#nameCat").css('width','310px');
    $("#popimage").css('width','310px');
    $("#popimage").css('height','220px');
    $("#closeDivContent").css('padding-left','300px');
  }
  if(this.wowMode) {
    $('.olPopupContent').css('overflow','hidden');
  }
}

vidteq.mbox.prototype.imageTilePopup = function(lonlat,imageName,imagePOIName) {
  //this.gui.displayMessage(''); Has been in the system since incpetion of mbox.js
  this.killRcmPopup();
  this.removeOpenPopup();
  //var imageSource=cloneImageUrl+imageName;
  var imageSource=vidteq.cfg.cloneImageUrl+imageName;
  var contentStripColor = '#000000';
  if(typeof(vidteq.aD) != 'undefined') {
    contentStripColor = vidteq.aD.config.textOnBgColor;
  }
  //IE7,IE8 requires height:100% to be set explicitly on div
  imagePOIName=(typeof(imagePOIName)=='undefined')?(" "):(imagePOIName);
  var imagePopupContent="<div oncontextmenu='return false;' style='height:100%;'><div style='height:100%;padding:4px'><div style='text-align:center' class='topbarPopupClass'><a onfocus='this.blur();' class='simple' style='color:"+contentStripColor+";'>"+imagePOIName+"</a></div><div style='position:absolute'>";
  //IE7,IE8 requires height:83%
  //imagePopupContent+="</div><img class='imagepop' style='border:2px solid white;' alt='Image' height=240 width=320 src='"+imageSource+"' /></div></div>";
  var curW = this.getPopupWidth(screen.width/2);
  var curH = this.getPopupHeight(screen.height/2);
  imagePopupContent+="</div><img class='imagepop' style='border:2px solid white;height:83%;' alt='Image' height="+curH+" width="+curW+" src='"+imageSource+"' /></div><div class='entityPopupClose1'><img style='cursor:pointer' src='"+vidteq.imgPath.close+"' onclick='javascript:vidteq.mboxObj.removeOpenPopup.apply(vidteq.mboxObj,[]);' href='javascript:void(0);'/></div></div>";
  if (self.navigator.userAgent.match(/MSIE\s[7]/)){
    curW += 10;
  } else if (self.navigator.userAgent.match(/MSIE\s[8]/)){
    curW += 0;
  } else {
    curW += 16;
  }
  curH += 28;

  var olPopupType = "FramedCloud";
  if(this.olPopupType) {
    olPopupType = "Anchored";
  }
  this.openPopup=new OpenLayers.Popup[olPopupType]("imagepopupdiv",
               new OpenLayers.LonLat(lonlat.lon,lonlat.lat),
               //new OpenLayers.Size(330,270),imagePopupContent,
               new OpenLayers.Size(curW,curH),imagePopupContent,
               null,false,this.removeOpenPopup);
  this.openPopup.setBackgroundColor("white");
  this.openPopup.setBorder("0px");
  this.openPopup.div.style.zIndex=18000;
  this.openPopup.autoSize=false;
  this.map.addPopup(this.openPopup);
  document.getElementById('imagepopupdiv').setClassName='imagepop';
  document.getElementById('imagepopupdiv_contentDiv').setClassName='imagepop';
  document.getElementById('imagepopupdiv_contentDiv').style.overflow="hidden";//IE7 does not support 'inherit'
  //OpenLayers.Event.stop(e);
}

vidteq.mbox.prototype.removeOpenPopup = function() {
  if(typeof(this.openPopup) != 'undefined' && this.openPopup != null) {
    this.map.removePopup(this.openPopup);
    this.openPopup.destroy();
    this.openPopup=null;
  }
}
vidteq.mbox.prototype.getCurrentZoom = function (){ return this.map.getZoom(); }

//vidteq.mbox.prototype.changeBaseLayerZoom = function() {
//  var opacityBaseLayer=parseInt(this.map.getZoom())/10+0.3;
//  this.map.layers[1].setOpacity(1)
//}
//vidteq.mbox.prototype.loadWardWfsLayer = function() {
//  myZoomis = this.map.getZoom();
//  OpenLayers.Console.log(myZoomis);
//  //var myBoundis =this.wardtab.tabLayer.layer.getTilesBounds();
//  //alert(myResolutionis);
//  //return;
//  if (myZoomis <2){
//         $('#map')[0].title='Click on the area for more infor';
//
//      $.getJSON(imgTileUrl,{action:"requestZones"},function (response) {
//      this.wardWfsStyle=OpenLayers.Util.applyDefaults({
//        strokeWidth: 3,
//      //  strokeColor: yellow,
//        fillOpacity: 0,
//        //pointRadius:1,
//        strokeOpacity: 1
//    }, OpenLayers.Feature.Vector.style['default']);
//    this.wardWfsSelectStyle=OpenLayers.Util.applyDefaults({
//        strokeWidth: 3,
//        //strokeColor: "#D298F0",
//        fillColor: "#E6CBF3",
//        fillOpacity: .4,
//        //pointRadius:1,
//        strokeOpacity: 1
//    }, OpenLayers.Feature.Vector.style['default']);
//    vidteq.mboxObj.wardWfsLayer=new OpenLayers.Layer.Vector("Wards", {style : this.wardWfsStyle});
//   // for(var i=0;i< response.results.length;i++) {
//    for(var i=0;i<response.results.length;i++) {
//
//      var polygon=response.results[i].polygon
//
//      var m=new OpenLayers.Feature.Vector(new OpenLayers.Geometry.fromWKT(polygon))
//      m.name= response.results[i].name
//      m.noofwards=response.results[i].noofwards
//      m.zone=response.results[i].zone
//      m.population=response.results[i].population
//      m.male=response.results[i].male
//      m.female=response.results[i].female
//      vidteq.mboxObj.wardWfsLayer.addFeatures([m]);
//     // m.events.register("mouseover",justAlert);
//        //alert (polygon);
//  }
//        var report = function(e) {
//                OpenLayers.Console.log(e.type, e.feature.id);
//            };
//
//
// vidteq.mboxObj.wardWfsLayer.highlightCtrl = new OpenLayers.Control.SelectFeature(vidteq.mboxObj.wardWfsLayer, {
//               // hover: true,
//                highlightOnly: true,
//                //renderIntent: "temporary",
//                clickout: true,
//                selectStyle: this.wardWfsSelectStyle,
//                onSelect :  vidteq.mboxObj.wardWfsPopup,
//                onUnselect: vidteq.mboxObj.wardWfsRemovePopup
//               //  onHover : wardWfsPopup,
//                //eventListeners: {
//                  //  beforefeaturehighlighted: report,
//                   // featurehighlighted: alert("highlight"),
//                    //featureunhighlighted: alert("unhighlight")
//                //}
//            });
//            vidteq.mboxObj.map.addControl(vidteq.mboxObj.wardWfsLayer.highlightCtrl);
//            vidteq.mboxObj.wardWfsLayer.highlightCtrl.activate();
//          //  vidteq.mboxObj.wardWfsLayer.highlightCtrl.events.register("mouseover",justAlert);
//
//    vidteq.mboxObj.map.addLayer(vidteq.mboxObj.wardWfsLayer);
//  });
//  }else if (myZoomis >1 && myZoomis<4){
//       $('#map')[0].title='Zoom Out to get Zone Lvl Data';
//
//       var bounds=this.wardtab.tabLayer.layer.getTilesBounds();
//
//      var reqData= {
//    b:bounds.left+" "+bounds.bottom+","+bounds.right+" "+bounds.top,
//    action :"requestWards"
//  }
//  $.getJSON(imgTileUrl,reqData,function (response) {
//  this.wardWfsStyle=OpenLayers.Util.applyDefaults({
//        strokeWidth: 3,
//      //  strokeColor: yellow,
//        fillOpacity: 0,
//        //pointRadius:1,
//        strokeOpacity: 1
//    }, OpenLayers.Feature.Vector.style['default']);
//    this.wardWfsSelectStyle=OpenLayers.Util.applyDefaults({
//        strokeWidth: 3,
//        //strokeColor: "#D298F0",
//        fillColor: "#E6CBF3",
//        fillOpacity: .4,
//        //pointRadius:1,
//        strokeOpacity: 1
//    }, OpenLayers.Feature.Vector.style['default']);
//    vidteq.mboxObj.wardWfsLayer=new OpenLayers.Layer.Vector("Wards", {style : this.wardWfsStyle});
//   // for(var i=0;i< response.results.length;i++) {
//    for(var i=0;i<response.results.length;i++) {
//
//      var polygon=response.results[i].polygon
//
//      var m=new OpenLayers.Feature.Vector(new OpenLayers.Geometry.fromWKT(polygon))
//      m.name= response.results[i].name
//      m.wardno=response.results[i].wardno
//      m.zone=response.results[i].zone
//      m.population=response.results[i].population
//      m.male=response.results[i].male
//      m.female=response.results[i].female
//      m.category=response.results[i].category
//      vidteq.mboxObj.wardWfsLayer.addFeatures([m]);
//     // m.events.register("mouseover",justAlert);
//        //alert (polygon);
//  }
//        var report = function(e) {
//                OpenLayers.Console.log(e.type, e.feature.id);
//            };
//
//
// vidteq.mboxObj.wardWfsLayer.highlightCtrl = new OpenLayers.Control.SelectFeature(vidteq.mboxObj.wardWfsLayer, {
//                // hover: true,
//                highlightOnly: true,
//                //renderIntent: "temporary",
//                clickout: true,
//                selectStyle: this.wardWfsSelectStyle,
//                onSelect :  vidteq.mboxObj.wardWfsPopup,
//                onUnselect: vidteq.mboxObj.wardWfsRemovePopup
//               //  onHover : wardWfsPopup,
//                //eventListeners: {
//                  //  beforefeaturehighlighted: report,
//                   // featurehighlighted: alert("highlight"),
//                    //featureunhighlighted: alert("unhighlight")
//                //}
//            });
//            vidteq.mboxObj.map.addControl(vidteq.mboxObj.wardWfsLayer.highlightCtrl);
//            vidteq.mboxObj.wardWfsLayer.highlightCtrl.activate();
//          //  vidteq.mboxObj.wardWfsLayer.highlightCtrl.events.register("mouseover",justAlert);
//
//    vidteq.mboxObj.map.addLayer(vidteq.mboxObj.wardWfsLayer);
//  });
//}
//}
//vidteq.mbox.prototype.wardWfsLayerZoomChange = function() {
//  var layername
//  var curZoom =this.map.getZoom();
//  var yo=this.wardtab.active;
//
//  //alert ("am in a load start  and my curZoois "+curZoom+"and old zoom is "+myZoomis +"and the layer is "+layername);
//  if(this.wardtab.active==true){
//       if ( ((curZoom) > 1 && curZoom<=3)  ){
//          //alert ("am in case 1")
//       vidteq.mboxObj.unloadWardWfsLayer.apply(vidteq.mboxObj,[]);
//         vidteq.mboxObj.loadWardWfsLayer.apply(vidteq.mboxObj,[]);
//          $('#map')[0].title='Zoom Out to get Zone Lvl Data';
//   }
//         else if  ((curZoom<2))
//          {
//
//           vidteq.mboxObj.unloadWardWfsLayer.apply(vidteq.mboxObj,[]);
//           vidteq.mboxObj.loadWardWfsLayer.apply(vidteq.mboxObj,[]);
//             $('#map')[0].title='Zoom Out to get Zone Lvl Data';
//
//          }
//          else if (curZoom==myZoomis && curZoom<=3){
//              //alert("am in case 3")
//              vidteq.mboxObj.unloadWardWfsLayer.apply(vidteq.mboxObj,[]);
//              vidteq.mboxObj.loadWardWfsLayer.apply(vidteq.mboxObj,[]);
//              }
//          else if (curZoom>3){
//              //alert("am in case 4")
//              vidteq.mboxObj.unloadWardWfsLayer.apply(vidteq.mboxObj,[]);
//             $('#map')[0].title='Zoom Out to get Ward Info';
//
//              }
//              myZoomis = this.map.getZoom();
//      }
//
//}
//vidteq.mbox.prototype.unloadWardWfsLayer = function () {
//  //this.wardWfsLayer.clearMarkers();
//  if(vidteq.mboxObj.wardWfsLayer) { this.map.removeLayer( vidteq.mboxObj.wardWfsLayer); vidteq.mboxObj.wardWfsLayer=null}
//  if (vidteq.mboxObj.wardPopup){this.map.removePopup(vidteq.mboxObj.wardPopup);}
//  if(vidteq.mboxObj.wardPopup){vidteq.mboxObj.wardPopup=null ;}
//  $('#map')[0].title='Right Click on Map for more options';
//}
//vidteq.mbox.prototype.wardWfsPopup = function (feature){
//               var  selectedFeature = feature ;
//                var popupdata
//              if(feature.name){
//                popupdata= "<div style='font-size:.8em'><b>Zone: </b> "+feature.zone+" <br />Name: " + feature.name+ "<br> Population : "+feature.population+"<br>No of Male : " +feature.male+ "<br> No of Female : " +feature.female+"<br>Category : " +feature.category+" <br><b><i>Zoom out to get Zone Details</i><b/></div>";
//            }
//             else {
//                popupdata= "<div style='font-size:.8em'><b>Zone: </b> "+feature.zone+" <br />No Of Wards: " + feature.noofwards+ "<br> Population : "+feature.population+"<br>No of Male : " +feature.male+ "<br>No of Female : " +feature.female+"<br><b><i>Zoom further in To get WARD Details</i><b/></div>";
//            }
//
//                vidteq.mboxObj.wardPopup = new OpenLayers.Popup.FramedCloud("wardinfo",
//                                   selectedFeature.geometry.getBounds().getCenterLonLat(),
//
//                                     null,
//
//                                     popupdata,null, true, vidteq.mboxObj.wardWfsRemovePopup);
//
//                                   this.map.addPopup(vidteq.mboxObj.wardPopup);
//
//        }
//vidteq.mbox.prototype.wardWfsRemovePopup = function () {
//  if (vidteq.mboxObj.wardPopup)this.map.removePopup(vidteq.mboxObj.wardPopup);
//  }
//
//vidteq.mbox.prototype.loadBiasWfsLayer = function() {
//  var that = this;
//  $.getJSON(vidteq.cfg.imgTileUrl,{action:"requestBias"},function (response) {
//    that.biasWfsLayer=new OpenLayers.Layer.Markers("BIAS")
//    for(var i=0;i< response.results.length;i++) {
//      var ll=response.results[i].points.split(" ")
//      var m=new OpenLayers.Marker(new OpenLayers.LonLat(ll[0],ll[1]),that.imageBusStopIcon.clone())
//      //var r=vidteq.bias.response.results[i].busno.split(",");
//      //var height=((r.length/4)+1)*13+14;
//      var r=response.results[i].timings.split(" ");
//      var s=response.results[i].busno.split(",");
//                        //height=200;
//      var height=parseInt((parseInt(r.length/7)+1)*16+15+13);
//      //var height=((parseInt(r.length/7)+1)*15+(s.length/7+1)*15+13);
//      //if (MSIE6){height=height+2}
//      if (r.length%7>0){height=height+12;}
//      m.timings=response.results[i].timings;
//      m.content="<div style='border:6px solid #21598c;'><a class=simple><b>"+response.results[i].name+"</b> <br/><u>Timings</u><br/>";
//      for(j=0;j<r.length;j++){
//        //if (m.content== null)//{//alert ("no timing for"+response.results[i].busno )}
//        m.content+=r[j];
//        m.content+=" ";
//      }
//      m.content+="</a></div>";
//      m.size=new OpenLayers.Size(250,height);
//      //m.events.register("mouseover",m,function () {that.popupBiasWfsLayer.apply(that,[]);})
//      m.events.register("mouseover",m,that.popupBiasWfsLayer);
//      m.events.register("mouseout",m,function () { that.map.removePopup(that.biasPopup)});
//      that.biasWfsLayer.addMarker(m);
//    }
//    that.map.addLayer(that.biasWfsLayer);
//  });
//
//
//}
//vidteq.mbox.prototype.unloadBiasWfsLayer = function () {
//  this.biasWfsLayer.clearMarkers();
//  this.map.removeLayer(this.biasWfsLayer);
//}

vidteq.mbox.prototype.popupBiasWfsLayer = function() {
  //if(MSIE6){  this.size.h=this.size.h-10;}
  //if(MSIE7){  this.size.h=this.size.h-10;}
  vidteq.mboxObj.biasPopup = new OpenLayers.Popup.Anchored("businfo",new
    OpenLayers.LonLat(this.lonlat.lon,this.lonlat.lat),
    this.size,this.content,vidteq.mboxObj.imageBusStopIcon.clone(),false);
    //vidteq.bias.popup.setBackgroundColor("white");
    //vidteq.bias.popup.setBorder("0px");
  vidteq.mboxObj.biasPopup.div.style.zIndex=18000;
  vidteq.mboxObj.biasPopup.updateSize;
  vidteq.mboxObj.map.addPopup(vidteq.mboxObj.biasPopup);
  //document.getElementById('imagepopupdiv').setClassName='imagepop';
  //document.getElementById('imagepopupdiv_contentDiv').setClassName='imagepop';
  // TBD
  document.getElementById('businfo').className='optionsdiv';
  document.getElementById('businfo_GroupDiv').className='optionsdiv';
  document.getElementById('businfo_contentDiv').className='optionsdiv';
  document.getElementById('businfo_GroupDiv').style.height=document.getElementById('businfo_contentDiv').style.height=document.getElementById('businfo').style.height=this.size.h+6+"px";
  document.getElementById('businfo_GroupDiv').style.width=document.getElementById('businfo_contentDiv').style.width=document.getElementById('businfo').style.width=this.size.w+1+"px";
}

vidteq.mbox.prototype.cleanSrf = function() {
  this.removeAllLocatorPoints();
  //this.srfZoomExt = [];
  this.srfBound = null;
  //if(this.gui.embed) {
  //  this.removeStartEndPoint(this.gui.embed.other);
  //} else {
  //  this.removeStartEndPoint('start');
  //  this.removeStartEndPoint('end');
  //}  // TBD is it really needed ?
  this.removeOpenPopup();
}

vidteq.mbox.prototype.writeSrfToTable = function(srf) {
  if (typeof(srf.showSets[srf.curShowSet]) == 'undefined') return;
  this.srfActive = true;
  if (this.srfBound == null) { this.srfBound = new OpenLayers.Bounds(); }
  this.putAllLocatorPoints(srf,this.srfBound);
}

vidteq.mbox.prototype.writeSrfToTableFinish = function(srf) {
  if(this.gui.sideBarUI) {
    this.mapCenterOffset = 100;
  }
  this.changeMapViewWithGravity(this.srfBound,{shrink:20});
  //try {
  //  if(this.gui.embed && this.gui.embed.locateStores && srf.results[0].parentType=='locateStores') this.callPopupLocation(0);
  //} catch(e) {}
  //this.autoPopup('start');
}

vidteq.mbox.prototype.refreshLocatorPoint = function(entity) {
  if (this.locatorPointLayer) { this.locatorPointLayer.redraw(); }
}

//vidteq.mbox.prototype.removeStartEndPoint = function(which) {
//  if (!this.startEndMarkLayer) { return; }
//  for (var i in this.startEndMarkLayer.features) {
//    if (!this.startEndMarkLayer.features[i].data.startOrEnd ||
//         this.startEndMarkLayer.features[i].data.startOrEnd != which) { continue; }
//    //delete this.startEndMarkLayer.features[i].data.startOrEnd;
//    if (this.startEndMarkLayer.features[i].data.shownLayer &&
//        this.startEndMarkLayer.features[i].data.shownLayer == 'startEndMarkLayer') {
//      delete this.startEndMarkLayer.features[i].data.shownLayer;
//    }
//    this.startEndMarkLayer.removeFeatures([this.startEndMarkLayer.features[i]]);
//  }
//}

//vidteq.mbox.prototype.removeStartEndPointEntity = function(entity) {
//  if (entity.shownLayer == 'locatorPointLayer') {
//  }
//  if (entity.shownLayer == 'startEndMarkLayer') {
//    this.removeStartEndPoint(entity.startOrEnd);
//  }
//}

vidteq.mbox.prototype.calcArialDistance = function(lat1, lon1, lat2, lon2) {
  var R = 6371; // km
  var dLat = this.toRad(lat2-lat1);
  var dLon = this.toRad(lon2-lon1);
  var lat1 = this.toRad(lat1);
  var lat2 = this.toRad(lat2);

  var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c;
  return d;
}

// Converts numeric degrees to radians
vidteq.mbox.prototype.toRad = function (Value) {
    return Value * Math.PI / 180;
}

vidteq.mbox.prototype.findArrowAngle = function(pt1, pt2) {
  var p1 = {x: pt1.x,y: pt1.y};
  var p2 = {x: pt2.x,y: pt2.y};  
  // angle in radians
  var angleRadians = Math.atan2(p2.y - p1.y, p2.x - p1.x);  
  // angle in degrees
  var angleDeg = Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI;
  return angleDeg;
}

vidteq.mbox.prototype.putArrowOnRoute = function(response) {
  if(vidteq.aD && vidteq.aD.urlId && 
     vidteq.aD.urlId.match(new RegExp('^marathon_','i'))) {
    var features=[];
    var addAnim = 0;
    if(response && response.edge) {
      if(response.edge.wkt) {
        if(response.edge.wkt.match(new RegExp('^MULTILINESTRING','i'))) {
          var wkt = response.edge.wkt.replace(new RegExp('[MULTILINESTRING|\(|\)]','gi'),'').split(',');
          for(var i in wkt) {
            if(addAnim > 6) addAnim = 0;
            if(i < wkt.length - 2) {
              var lonlat = wkt[parseInt(i)].split(' '); 
              var lonlat1 = wkt[parseInt(i)+1].split(' '); 
              var distance = this.calcArialDistance(lonlat[1], lonlat[0], lonlat1[1], lonlat1[0]); 
              if(distance > 0) {
                if(addAnim == 6) { 
                  var v = new OpenLayers.Geometry.fromWKT("POINT("+lonlat[0]+" "+lonlat[1]+")");
                  var pxHelp = this.map.getPixelFromLonLat({lon:lonlat[0],lat:lonlat[1]});
                  var pxHelp1 = this.map.getPixelFromLonLat({lon:lonlat1[0],lat:lonlat1[1]});
                  var angle = this.findArrowAngle(pxHelp,pxHelp1);
                  var data = [];
                  data.angle = angle;
                  var pFeature = new OpenLayers.Feature.Vector(v,data);
                  features.push(pFeature);
                } 
                addAnim++;
              }
            }
          }
          this.arrowOnRouteLayer.addFeatures(features);
        }      
      }
    }
  }
}

vidteq.mbox.prototype.putImageData = function(imageData) {
  this.oneImageMarker=new Array();
  var features=[];
  for(var i=0;i<imageData.length;i++) {
    if(imageData[i].poiName) {
      //var splitName=imageData[i].imgName.split("_");
      imageData[i].imageCaption=(imageData[i].poiName==undefined)?(" "):imageData[i].poiName;
       var v = new OpenLayers.Geometry.fromWKT("POINT("+imageData[i].lonlat.lon+" "+imageData[i].lonlat.lat+")");
      var pFeature = new OpenLayers.Feature.Vector(v,imageData[i]);
      features.push(pFeature);
      this.oneImageMarker[i]=pFeature;
    }
  }
  this.imageOnRouteLayer.addFeatures(features);
}

//vidteq.mbox.prototype.putStartEndPoint = function(which,entity) {
//   var features=[];
//   var v = new OpenLayers.Geometry.fromWKT(entity.geom);
//   //entity.startOrEnd=which ;
//   var pFeature = new OpenLayers.Feature.Vector(v,entity);
//   features.push(pFeature);
//   this.startEndMarkLayer.addFeatures(features);
//   entity.shownLayer = 'startEndMarkLayer';
//}

vidteq.mbox.prototype.putSePoint = function(entity) {
  if (this.gui.wap) { return; }
  if (entity.seFeature) { return; }
  var features=[];
  var v = new OpenLayers.Geometry.fromWKT(entity.geom);
  var pFeature = new OpenLayers.Feature.Vector(v,entity);
  this.startEndMarkLayer.addFeatures(features);
  features.push(pFeature);
  this.startEndMarkLayer.addFeatures(features);

  entity.seFeature = 'ping';
  if (this.seFeatureStore.ping) { entity.seFeature = 'pong'; }
  this.seFeatureStore[entity.seFeature] = pFeature;

  entity.shownLayer = 'startEndMarkLayer';
  if (this.locatorPointLayer) { this.locatorPointLayer.redraw(); }
}

vidteq.mbox.prototype.removeSePoint = function(entity) {
  if (!entity.seFeature) { return; }
  this.startEndMarkLayer.removeFeatures([this.seFeatureStore[entity.seFeature]]);
  delete this.seFeatureStore[entity.seFeature];
  delete entity.seFeature;
  if (this.locatorPointLayer) { this.locatorPointLayer.redraw(); }
}

vidteq.mbox.prototype.isPopupActiveFor = function(entity) {
  if (typeof(this.openPopup) != 'undefined' &&
    this.openPopup != null &&
    entity == this.openPopup.entity) return true;
  return false;
}

vidteq.mbox.prototype.callPopupLocation = function(i,evt) {
  var evt = evt || {};
  var feature = this.locatorPoint[i];
  evt.feature = feature;
  if (typeof(vidteq.aD) != 'undefined' &&
      vidteq.aD.q == 'locatestores' &&
     (typeof(feature) == 'undefined' ||
      (feature.cluster && feature.cluster[0].data.parentType == 'locateStores') ||
      feature.data.parentType == 'locateStores')) {
    evt.feature = this.getFeatureFromCluster(i);
    evt.feature.realIndexToPop = i;
  }
  //if(typeof(this.catMngr.layer) != 'undefined') {
  //  for(var k = 0 ;k<this.catMngr.layer.features.length;k++) {
  //    if(this.catMngr.layer.features[k].cluster) {
  //      for(var m = 0;m< this.catMngr.layer.features[k].cluster.length;m++) {
  //        if(this.catMngr.layer.features[k].cluster[m].data.lpIndex == i) {
  //          feature = this.catMngr.layer.features[k].cluster[m];
  //        }
  //      }
  //    } else {
  //      if(typeof(this.catMngr.layer.features[k].data.lpIndex) != 'undefined' && this.catMngr.layer.features[k].data.lpIndex == i) {
  //        feature = this.catMngr.layer.features[k];
  //      }
  //    }
  //  }
  //}
  evt['feature'] = feature;
  if(!vidteq.newSearch) this.map.zoomToExtent(evt.feature.geometry.getBounds());
  if (this.wowMode) {
    this.popupLocation(evt);
    this.selectFeatureObj = feature;
    //this.universalSelect.select(feature);
  } else {
    this.popupLocation(evt);
  }
}

vidteq.mbox.prototype.autoPopup = function(tip) {
  var evt = {};
  for (var i in this.locatorPoint) {
    if (!this.locatorPoint[i].data.startOrEnd ||
       this.locatorPoint[i].data.startOrEnd != tip) { continue; }
    evt.feature = this.locatorPoint[i];
    break;
  }
  if (evt.feature) { this.popupLocation(evt);  return; }
}

vidteq.mbox.prototype.popUpStartEndPlace= function(which) {
  if(self.navigator.appName.match(/Microsoft/i)) {
    if(this[which] && this[which].events) this[which].events.listeners['click'][0].func.apply(this[which],[window.event]);
  } else {
    evt={};
    window.event=evt;
    if(this[which] && this[which].events)  this[which].events.listeners['click'][0].func.apply(this[which],[evt]);
  }
}

vidteq.mbox.prototype.popupLocation = function(evt,shortPop) {
  if(vidteq.aD && vidteq.aD.urlId.match(new RegExp('^Marathon_','i'))) {
    return;
  }
  if (this.gui.wap) {
    //if(evt.type) {
      vidteq.mobUI.showCenterPopupTmpl(evt);
      vidteq.mobUI.moveToLocatePoint(evt.feature.data.index);
    //} else {
    //  window.location.hash='nearbyDisplayDiv';
    //  $('.nearbyFooterId[value="'+evt.feature.data.index+'"]').click();
    //}
    return;
  }
  if('undefined' != typeof(vidteq.aD) && vidteq.aD.q == 'locatestores' && 'Category Layer' == evt.feature.layer.name ){
    if(this.catMngr){
      this.catMngr.categoryPopup(evt);
      this.map.setCenter(new OpenLayers.LonLat(evt.feature.geometry.x,evt.feature.geometry.y), this.map.getZoom());
      return;
    }
  } else {this.removeOpenPopup();}

  var poi = new vidteq._poi(evt.feature.data,this.gui);

  if(this.gui.handheld) {
    this.gui.poiPopup(poi,shortPop);
    this.addRedRing(evt,shortPop);
  } else {
    var mapHtml = poi.getEntityHtml('map',shortPop);
    var size=(mapHtml.popupWidth)?(new OpenLayers.Size(mapHtml.popupWidth,mapHtml.popupHeight)):(new OpenLayers.Size(320,240));
    if(this.wowMode) {
      var popupGeom = {x:evt.feature.geometry.x,y:evt.feature.geometry.y};
      if(typeof(this.catClusterPoint) != 'undefined') {
        popupGeom = this.catClusterPoint;
      }
      this.openPopup=new OpenLayers.Popup.Anchored(
        "locpopupdiv",
        //new OpenLayers.LonLat(evt.feature.geometry.x,evt.feature.geometry.y),
        new OpenLayers.LonLat(popupGeom.x,popupGeom.y),
        size,mapHtml.contentHTML,
        null,false,this.removeOpenPopup
      );
    } else {
      var olPopupType = "FramedCloud";
      if( this.gui.embed && this.gui.embed.firstTimeRule &&
            this.gui.embed.firstTimeRule.behaveAs
           &&  this.gui.embed.firstTimeRule.manner &&
           (( this.gui.embed.firstTimeRule.behaveAs == 'lite'
            &&  this.gui.embed.firstTimeRule.manner == 'VideoRoute' ) ||
             this.gui.embed.firstTimeRule.behaveAs === 'neighbourhood' )) {
        olPopupType =  "Anchored";
      }

      this.openPopup=new OpenLayers.Popup[olPopupType]("locpopupdiv",new OpenLayers.LonLat(evt.feature.geometry.x,evt.feature.geometry.y),size,mapHtml.contentHTML,null,false,this.removeOpenPopup);
    }
    this.openPopup.setBackgroundColor("white");
    this.openPopup.index = evt.feature.data.index;
    this.openPopup.entity = evt.feature.data;
    this.openPopup.autoSize=false;
    this.openPopup.panMapIfOutOfView = true;
    this.map.addPopup(this.openPopup);
    for (var i in mapHtml.funcList) { $('#'+i).click(mapHtml.funcList[i]); }
    // now that popup is drawn, regularize the width
    $('#finalPopContent').height($('#finalPopContent').outerHeight());
    if(this.wowMode) {
      if (self.navigator.userAgent.match(/MSIE\s[8]/)){
        $("#catmain").css('width','290px');
        $("#nameCat").css('width','290px');
        $("#closeDivContent").css('padding-left','278px');
      }
      $('#popupImgDiv .slideShow').find('img').each(function() {
        $(this).css({'width':'80px','height':'80px'});
      });
      $('#popupImgDiv').css({'width':'80px','height':'80px'});
      this.slideShow(".slideShow","all","normal");  //other possible alternatives - shuffle
      $(".slideShow").css({'width':'80px','height':'80px'});
      return;
    }
    var deltaW = $('#locpopupdiv').width()-$('#locpopupdiv_contentDiv').width();
    var deltaH = $('#locpopupdiv').height()-$('#locpopupdiv_contentDiv').height();
    size.h =  parseInt($('#finalPopContent').outerHeight())+10;
    if (deltaH < 55) {size.h += 5;} else { size.h -= 5; }
    if (self.navigator.userAgent.match(/MSIE\s[7]/)){
      if (deltaW < 20) {size.w += 5;} else { size.w -= 6; }
    } else if (self.navigator.userAgent.match(/MSIE\s[8]/)){
      if (deltaW < 20) {size.w += 0;} else { size.w -= 6; }
    } else if (self.navigator.userAgent.match(/MSIE\s[9]/)){
      if (deltaW < 20) {size.w -= 20;} else { size.w -= 6; }
    } else if (self.navigator.userAgent.match(/MSIE\s[10]/)){
      if (deltaW < 20) {size.w -= 20;} else { size.w -= 6; }
    } else {
      if (deltaW < 20) {size.w += 5;} else { size.w -= 8; }
    }
    if (self.navigator.userAgent.match(/MSIE\s[7,9,10]/)){
      this.openPopup.setSize(size);
    }
    //document.getElementById('locpopupdiv').setClassName='locpop';
    //document.getElementById('locpopupdiv_contentDiv').setClassName='locpop';
    $('#locpopupdiv_contentDiv').css('left','5px');
    $('#locpopupdiv_contentDiv').css('overflow','hidden');
    this.openPopup.contentDiv.style.overflow='hidden';
    this.openPopup.disableFirefoxOverflowHack = false;
    this.openPopup.contentDisplayClass = '';
    //var closeHtml = getEntityHtmlClose('map',evt.feature.data,shortPop);
    var t = poi.getEntityHtmlClose('map',shortPop);
    //$('#locpopupdiv_contentDiv').append(closeHtml);
    $('#locpopupdiv_contentDiv').append(t.html);
    if (self.navigator.userAgent.match(/MSIE\s[10]/)){
      $('#entityPopupClose').css('right','16px');
    }
    if (!self.navigator.userAgent.match(/MSIE\s[7,9,10]/)){
      this.openPopup.setSize(size);
    }
    for (var i in t.funcList) { $('#'+i).click(t.funcList[i]); }
    OpenLayers.Event.stop(evt);
    if (this.gui.wap) { } else {
      this.slideShow(".slideShow","all","normal");  //other possible alternatives - shuffle
    }
    if(this.gui.appMode) { this.addRedRing(evt,shortPop); }
  }
}

vidteq.mbox.prototype.getRouteBound = function () {
  this.routeBound = new OpenLayers.Bounds();
  for(var i=0;i<this.syncMapPoints.length;i++) {
    var c = this.carPathArray[this.syncMapPoints[i]];
    this.routeBound.extend(OpenLayers.LonLat.fromString(c[0].replace(/ /,',')));
    this.routeBound.extend(OpenLayers.LonLat.fromString(c[c.length-1].replace(/ /,',')));
  }
}

vidteq.mbox.prototype.fitCurrentRoute = function() {
  if (!this.routeActive) return ;
  var zoomLonLat={};
  zoomLonLat.point=new Array();
  zoomLonLat.point[0]={};
  zoomLonLat.point[1]={};
  var temp1=this.carPathArray[0][0].split(" ");
  zoomLonLat.point[0].lon=temp1[0];
  zoomLonLat.point[0].lat=temp1[1];
  var totP=parseInt(this.carPathArray.length-1);
  var lastTotP=parseInt(this.carPathArray[totP].length-1);
  var temp2=this.carPathArray[totP][lastTotP].split(" ");
  zoomLonLat.point[1].lon=temp2[0];
  zoomLonLat.point[1].lat=temp2[1];
  for(var i=0;i<this.syncMapPoints.length;i++) {
    var ll=this.carPathArray[this.syncMapPoints[i]][0].split(" ");
    var thisPoint={};
    thisPoint.lon=ll[0];
    thisPoint.lat=ll[1];
    zoomLonLat.point.push(thisPoint);
  }
  this.zoomToFit(zoomLonLat);
}

vidteq.mbox.prototype.zoomToFit = function(zoomLonLat) {
  if(zoomLonLat.point.length==0) return false;
  //This API takes an Object which is has its members as array latlong . Cool, generic function.Condition:-There should be alteast 2 points
  if(zoomLonLat.point.length==1) {
    // TBD per city this variable need to be tuned, move to config variable
    var curCenter = new OpenLayers.LonLat(zoomLonLat.point[0].lon,zoomLonLat.point[0].lat);
    var zoom = 5;
    if(this.gui.handheld) { zoom = 3; }
    //if(vidteq.urlid == 'Prestige_Group' || vidteq.urlid == 'Prestige_Portfolio') { zoom = zoomLonLat.zoom; }
    if('vistaManner' in vidteq && (vidteq.vistaManner.mapView || vidteq.vistaManner.portFolio)) { zoom = zoomLonLat.zoom; }
    this.map.setCenter(curCenter,zoom);
    if(this.gui.sideBarUI) {
      if(typeof(this.gui.timeIntervalT)!= 'undefined') {
        clearTimeout(this.gui.timeInterValT);
      }
      var that = this;
      this.gui.timeIntervalT = setTimeout(function() {
        var changedCenter = that.offsetMapCenter(curCenter);
        that.map.panTo(changedCenter);
      },100);
    }
    return false;
  }
  // now length >= 2
  var minlon = Math.min(zoomLonLat.point[0].lon,zoomLonLat.point[1].lon);
  var minlat = Math.min(zoomLonLat.point[0].lat,zoomLonLat.point[1].lat)-0.00005;
  var maxlon = Math.max(zoomLonLat.point[0].lon,zoomLonLat.point[1].lon);
  var maxlat = Math.max(zoomLonLat.point[0].lat,zoomLonLat.point[1].lat)+0.00005;
  // TBD why is buffer not added in lon ?
  var startEndBound=new OpenLayers.Bounds(minlon,minlat,maxlon,maxlat);
  for(var i=0;i<zoomLonLat.point.length;i++) {
    var local=new OpenLayers.LonLat(zoomLonLat.point[i].lon,zoomLonLat.point[i].lat);
    if(!startEndBound.containsLonLat(local)) {
      startEndBound.extend(local);
    }
  }
  this.map.zoomToExtent(startEndBound);
  return false;
}

vidteq.mbox.prototype.removeAllLocatorPoints = function() {
  if('undefined' != typeof(vidteq.aD) && vidteq.aD.q == 'locatestores'){
    if(this.catMngr){this.catMngr.clearCatLayer();}
  }
  for (var i in this.locatorPointLayer.features) {
    if (this.locatorPointLayer.features[i].data.shownLayer &&
        this.locatorPointLayer.features[i].data.shownLayer == 'locatorPointLayer') {
      delete this.locatorPointLayer.features[i].data.shownLayer;
    }
  }
  this.locatorPointLayer.removeFeatures(this.locatorPointLayer.features);
  this.locatorPoint=[];
  this.landmarkLayer.setVisibility(true);
}

vidteq.mbox.prototype.removeImageMarkers = function() {
  if (this.imageOnRouteLayer) {
    this.imageOnRouteLayer.removeFeatures(this.imageOnRouteLayer.features);
    if (this.imageOnRouteLayer.strategies &&
        this.imageOnRouteLayer.strategies.length) {
      this.imageOnRouteLayer.strategies[0].clearCache();
    }
  }
}

// function to clear the route in mbox
vidteq.mbox.prototype.clearAll = function () {
  for (var i in this.addOnTabs) {
    if (this.addOnTabs[i].tabLayer) this.addOnTabs[i].tabLayer.clearLayer();
  }
  if (this.carPopup) {
    this.gui.fvt.pullAndHideVideoDom();
    //this.gui.fvt.showing=false;
    this.destroyCarPopup();
  }
  //this.clearBiasLayer();
  //this.clearImageLayer();
  //this.clearVideoLayer();
  if (this.catMngr) { this.catMngr.clearCatLayer(); }  // TBD may be we should name clear
  this.clearViaMarkers();
  this.clearRouteAndSrf();

  //this.gui.fvt.showing=false; // TBD should not be alter by mbox

  // TBD - Definitely need to be cleaned
  if(this.gui.handheld || this.gui.appMode)
    if(this.decoFeature) this.decoLayer.removeFeatures([this.decoFeature]);
  this.clearMapMarkers();
  if(typeof(this.wowMode) != 'undefined' && this.wowMode) {
    this.gui.fvt.clearResultDiv();
  }
}

// remember - there is viaBalls and viaMarkers as separate entity
vidteq.mbox.prototype.clearViaMarkers = function () {
  if (this.viaMarkers && this.startEndMarkLayer) {
    this.startEndMarkLayer.removeFeatures(this.viaMarkers);
  }
  this.viaMarkers=[];
}

vidteq.mbox.prototype.clearRouteAndSrf = function () {
  if(this.gui.wap) this.clearNavSrf();
  if(!this.gui.wap) this.killRcmPopup();
  this.carPathArray=[];
  this.syncMapPoints=[];
  this.map.panDuration = this.panDurationRef;
  this.removeAllLocatorPoints();
  //if(this.gui.embed) { this.removeStartEndPoint(this.gui.embed.other); }
  //else {
  //  this.removeStartEndPoint('start');
  //  this.removeStartEndPoint('end');
  //}
  this.removeOpenPopup();
  this.removeImageMarkers();
  this.route.removeFeatures(this.route.features);
  if(this.arrowOnRouteLayer && this.arrowOnRouteLayer.features) {
    this.arrowOnRouteLayer.removeFeatures(this.arrowOnRouteLayer.features);
  }

  if (typeof(missingVideoDebug) != 'undefined' &&  missingVideoDebug) {
    this.routeNoVid.removeFeatures(this.routeNoVid.features);
    this.routeNoVb.removeFeatures(this.routeNoVb.features);
    this.routeNoDp.removeFeatures(this.routeNoDp.features);
  }
  if(this.textDirLayer) { this.textDirLayer.removeFeatures(this.textDirLayer.features); }
  if(this.busStopsLayer) { this.busStopsLayer.removeFeatures(this.busStopsLayer.features); }
  this.carDisable = true;
  if(this.carPoint) {
    this.carMarkLayer.removeFeatures(this.carMarkLayer.features);
    delete this.carPoint;
  }
  if(this.routeActive) {
  }
  this.alterKIVState({gps:true,video:false});
  this.routeActive=false;
  this.srfActive=false;
  return false;
}

vidteq.mbox.prototype.pushFeatures = function(vectorLayer,pointWkt) {
  this[vectorLayer].addFeatures(pointWkt);
}

vidteq.mbox.prototype.removeFeatures = function(vectorLayer) {
  if(this[vectorLayer].features)
    this[vectorLayer].removeFeatures(this[vectorLayer].features);
}

vidteq.mbox.prototype.setTitle = function( myStr, mapDom ) {
  if( typeof mapDom === 'undefined' ) {
    mapDom = document.getElementById(this.mapDom);
  }
  mapDom.title = myStr;
}

vidteq.mbox.prototype.removeMapTitle = function( mapDom ) {
  if( typeof mapDom === 'undefined' ) {
    //mapDom = $('#'+this.mapDom)[0];
    mapDom = document.getElementById(this.mapDom);
  }
  mapDom.title = '';
}

vidteq.mbox.prototype.restoreMapTitle = function( mapDom ) {
  //called when landmark popup is closed
  if( typeof mapDom === 'undefined' ) {
    //mapDom = $('#'+this.mapDom)[0];
    mapDom = document.getElementById(this.mapDom);
  }
  if(!this.gui.nemo) {
    //mapDom.title="Right Click On Map For More Options";
    mapDom.title=this.mapTitle;
  }
}

vidteq.mbox.prototype.killRcmPopup = function() {
  this.removeFeatures('clickPointMark');

  // TBD this is needed for handheld - Real way is to provide a flag inside
  // the feature and make the style conditional to that flag
  if (this.gui.handheld || this.gui.appMode) {
    this.clickPointStyle.pointRadius = 1;
    this.clickPointStyle.strokeOpacity = .9;
  }

  if(typeof(this.rcmPopup) != 'undefined' && this.rcmPopup != null) {
    this.map.removePopup(this.rcmPopup);
    if (!this.gui.handheld && !this.gui.appMode)
      this.rcmPopup.destroy();
    this.rcmPopup=null;
  }
}

vidteq.mbox.prototype.killWcmPopup = function() {
  this.removeFeatures('clickPointMark');
  if(typeof(this.wcmPopup) != 'undefined' && this.wcmPopup != null) {
    this.map.removePopup(this.wcmPopup);
    this.wcmPopup=null;
  }
}

vidteq.mbox.prototype.makeRcmEntityAsTip = function(which) {
  if (this.routeActive) {
    //this.clearViaMarkers();
    this.gui.routeEnds.removeAllVias();
    if (this.gui && this.gui.clearRouteAndSrf) { this.gui.clearRouteAndSrf(); }
    else { clearRouteAndSrf(); }
  }
  // TBD above needs refinement
  this.killRcmPopup();
  this.gui.routeEnds.replaceEntity(which,this.rcmEntity);
}

vidteq.mbox.prototype.makeWcmEntityAsTip = function(which) {
  this.killWcmPopup();
  this.gui.routeEnds.replaceEntity(which,this.wcmEntity);
}

vidteq.mbox.prototype.addRcmStartOrEndMarker = function(which,lonlat) {
  if (this.routeActive) {
    this.clearViaMarkers();
    if (this.gui && this.gui.clearRouteAndSrf) { this.gui.clearRouteAndSrf(); }
    else { clearRouteAndSrf(); }
  }
  // TBD above needs refinement
  this.killRcmPopup();
  vidteq.routeEndsObj.replace.apply(vidteq.routeEndsObj,[which,-1,lonlat])
}

vidteq.mbox.prototype.returnMouseLonLats = function (e) {
  var check;
  if(self.navigator.appName.match(/Microsoft/i))  {
    e=window.event;
    check=1;
  } else if(self.navigator.userAgent.match(/android/i) || self.navigator.userAgent.match(/iPhone/i) || self.navigator.userAgent.match(/iPad/i) || (this.gui.embed && (this.gui.appMode))) {
    return(e);
  } else if(self.navigator.userAgent.match(/Chrome/i)) {
    check = 1;
  } else {
    check=e.target.id.match(/^OpenLayers.Layer.Vector/) ||
          e.target.id.match(/^OpenLayersDiv/);
  }
  if(!check) return false;
  if(vidteq.mboxObj.killOptionPopupVar){ clearTimeout(vidteq.mboxObj.killOptionPopupVar); }
  vidteq.mboxObj.killRcmPopup();
  e.xy=vidteq.mboxObj.map.events.getMousePosition(e);
  return(e);
}

/*
vidteq.mbox.prototype.attachRcmToMap = function(e) {
  //console.log(e.feature);
  if (!this.rcmItems.length) {return false};
  var eventObj=this.returnMouseLonLats(e);
  if(!eventObj) return false;
  this.rcmLonlat=this.map.getLonLatFromPixel(eventObj.xy);

  //alert('here'+this.rcmLonlat);
  this.pointLonlat="POINT("+this.rcmLonlat.lon+" "+this.rcmLonlat.lat+")";
  this.rcmEntity = {};
  this.rcmEntity.geom = this.pointLonlat;
  this.rcmEntity.index = -1;
  this.rcmEntity.type = 'rcm';
  this.pushFeatures('clickPointMark',this.parser.read(this.pointLonlat));
  this.rcmEntity = {
    index : -1,
    type  : 'rcm',
    lonlat : this.rcmLonlat,
    geom : this.pointLonlat,
    address : { name : 'Your location' }
  },
  eventObj.xy.x+=10;
  eventObj.xy.y-=10;
  var h = 108; var w = 120; var p = 10;
  //if(vidteq.aD.q== 'wayfinder-lite') { var ph= screen.height/2;var pw=screen.width/2;}
  var popuplonlat=this.map.getLonLatFromPixel(eventObj.xy);
  //var mapOptionsHTML="<div style='padding:"+p+"px;background-color:transparent;'><select id='rcmselect' onchange='$(\"#rcmselect\").children(\":selected\").attr(\"id\").click($(\"#rcmselect\").val());'>";
  var mapOptionsHTML="<div style='padding:"+p+"px;background-color:transparent;'><select id='rcmselect' onselect='javascript:this.gui.clearAll();'>";
  for (var i in this.rcmItems) {
    var one = this.rcmItems[i];

    if (one.cond()) {
      mapOptionsHTML+="<option id = '"+one.id+"' value='this.gui.clearAll();'>"+one.text+"</option>";
    }
  }

  mapOptionsHTML+="</select></div>";

  this.rcmPopup=new OpenLayers.Popup("mapoptionsdiv",new OpenLayers.LonLat(popuplonlat.lon,popuplonlat.lat),new OpenLayers.Size(w,h),mapOptionsHTML,false);
  this.rcmPopup.setContentHTML(mapOptionsHTML);
  this.rcmPopup.panMapIfOutOfView=true;
  this.map.addPopup(this.rcmPopup);
  // TBD why not use trimpath - is it really useful explore
  document.getElementById('mapoptionsdiv').className='optionsdiv';
  document.getElementById('mapoptionsdiv_GroupDiv').className='optionsdiv';
  document.getElementById('mapoptionsdiv_contentDiv').className='optionsdiv';
  document.getElementById('mapoptionsdiv').style.height=h+"px";
  document.getElementById('mapoptionsdiv').style.width=w+"px";  // final trim
  $('#mapoptionsdiv').css('background-color','transparent');

  var boxImage = { url:vidteq.imgPath.refBox3, cornerW:10, cornerH:10, boxW:510, boxH:378, offsetW:0, offsetH:0 };
  vidteq.utils.boxify(boxImage,'mapoptionsdiv_contentDiv',{lt:1,rt:1,lb:1,rb:1},1);
  for (var i in this.rcmItems) {
    var one = this.rcmItems[i];
    if ( $('#'+one.id).length ) { $('#'+one.id).click(one.onClickFunc); }
  }
  //if(this.gui.embed && !this.gui.embed.locateStores) this.disableRcmOptions(this.gui.embed.fix);
  var that = this;
  this.killOptionPopupVar=setTimeout(function () { that.killRcmPopup(); },30000);
  //$('#rcmselect').click();
  return false;
}
*/

vidteq.mbox.prototype.attachRcmMenuToMap = function(e) {
  // TBD ensure theming and coloring the borders
  if (!this.rcmItems.length) return false;
  var eventObj=this.returnMouseLonLats(e);
  if(!eventObj) return false;
  //this.rcmLonlat=this.map.getLonLatFromPixel(eventObj.xy);
  //this.rcmLonlat.lon = this.rcmLonlat.lon.toFixed(6);
  //this.rcmLonlat.lat = this.rcmLonlat.lat.toFixed(6);
  var rcmLonlat=this.map.getLonLatFromPixel(eventObj.xy);
  rcmLonlat.lon = rcmLonlat.lon.toFixed(6);
  rcmLonlat.lat = rcmLonlat.lat.toFixed(6);
  this.clickIsOnRoute = false;
  if (this.routeActive && this.gui.embed && (this.gui.handheld || this.gui.appMode)) {
    //var point = new OpenLayers.Geometry.Point(this.rcmLonlat.lon,this.rcmLonlat.lat);
    var point = new OpenLayers.Geometry.Point(rcmLonlat.lon,rcmLonlat.lat);
    var dist = this.route.features[0].geometry.distanceTo(point,{details:true});
    var distPx = dist.distance/this.map.getResolution();
    if (distPx <= this.routeBuffer){
      this.clickIsOnRoute = true;
      //this.rcmLonlat.lon = dist.x0;
      //this.rcmLonlat.lat = dist.y0;
      rcmLonlat.lon = dist.x0;
      rcmLonlat.lat = dist.y0;
      this.clickPointStyle.pointRadius = 8;
      this.clickPointStyle.strokeOpacity = .4;
    }
  }
  if(this.gui.sideBarUI) {
    this.clickPointStyle.strokeColor = "#242424";
  }
  //this.pointLonlat="POINT("+this.rcmLonlat.lon+" "+this.rcmLonlat.lat+")";
  var pointLonlat="POINT("+rcmLonlat.lon+" "+rcmLonlat.lat+")";
  this.pushFeatures('clickPointMark',this.parser.read(pointLonlat));
  var rcmEntity = {
    index : -1,
    type  : 'rcm',
    //lonlat : this.rcmLonlat,
    lonlat : rcmLonlat,
    geom : pointLonlat,
    address : { name : 'Your location' }
  };
  if (this.gui.wap) {
    e.xy.x+=10;
    e.xy.y-=15;
    var h = 20; var w = 100; var p = 5;
    p=0;
    //if(this.routeActive)
    h+=20;
  } else {
    eventObj.xy.x+=10;
    eventObj.xy.y-=10;
    if(this.gui.handheld || this.gui.appMode) {
      var h = 145; var w = 140; var p = 5;
    }else {
      var h = 108; var w = 120; var p = 10;
    }
  }

  var popuplonlat=this.map.getLonLatFromPixel(eventObj.xy);

  var bgColor = "background-color:"+vidteq.vidteq.bgColor+";";
  if (this.gui.handheld || this.gui.wap) { bgColor = ''; }
  var rcmPadding = "";
  if(this.gui.sideBarUI) { rcmPadding = "padding:3px;"; }
  var mapOptionsHTML="<div style='padding:"+p+"px;background-color:transparent;'><table id=mapOptionsTable height="+(h-2*p)+"px width="+(w-2*p)+"px style='border :none; "+rcmPadding+" text-align:center; overflow:hidden;"+bgColor+"' cellborder='1' >";
  if (this.gui.wap) {
    mapOptionsHTML="<div style='padding:"+p+"px;background-color:transparent;height:100%;width:100%;'><table width="+w+" id='wapOptionsTable' style='border :none; text-align:center; overflow:hidden;"+bgColor+"' cellborder='1' >";
  }
  var that = this;
  //var optionsDecider = function (id,onclickFunc,text,disabled) {
  //  var ht=["<tr id='"+id+"'" ];
  //  if (vidteq.utils.trim(onclickFunc)!= '') { ht.push("onclick='javascript:"+onclickFunc+";'"); }
  //  ht.push("class=rcmrow onmouseover=this.className='rcmhighlight' onmouseout=this.className='rcmrow'>");
  //  if(that.gui.handheld)
  //    ht.push("<td style='border-bottom:1px solid black'><a onfocus='this.blur();' class='icondivtext'");
  //  else
  //    ht.push("<td><a onfocus='this.blur();' class='icondivtext'");
  //  if(that.gui.sideBarUI) {
  //    if(disabled) { ht.push("style='cursor:text;color:#3C3720;' "); }
  //    else { ht.push("style='color:white;' "); }
  //  } else {
  //    if(disabled) { ht.push("style='cursor:text;color:#CDC8B1;' "); }
  //  }
  //  ht.push("href='javascript:void(0)'>");
  //  ht.push(text+"</a></td></tr>");
  //  ht=ht.join(' ');
  //  return ht;
  //};
  for (var i in this.rcmItems) {
    var one = this.rcmItems[i];
    if (one.cond()) {
      //mapOptionsHTML+=optionsDecider(one.id,'',one.text,one.disabled);
      var ht = $('#rcmRowTemplate').tmpl({
       id:one.id
       ,text:one.text
       ,disabled:one.disabled
       ,handheld:this.gui.handheld
       ,sideBarUI:this.gui.sideBarUI
      }).html();
      // TBD extra tbody comes some times need to ber removed
      mapOptionsHTML += ht;
    }
  }
  mapOptionsHTML+="</table></div>";

  this.rcmPopup=new OpenLayers.Popup("mapoptionsdiv",new OpenLayers.LonLat(popuplonlat.lon,popuplonlat.lat),new OpenLayers.Size(w,h),mapOptionsHTML,false);
  this.rcmPopup.setContentHTML(mapOptionsHTML);
  //this.rcmPopup.displayClass = 'optionsdiv';
  //this.rcmPopup.contentDisplayClass = 'optionsdiv';
  this.rcmPopup.panMapIfOutOfView=true;
  this.map.addPopup(this.rcmPopup);
  // TBD why not use trimpath - is it really useful explore
  document.getElementById('mapoptionsdiv').className='optionsdiv';
  document.getElementById('mapoptionsdiv_GroupDiv').className='optionsdiv';
  document.getElementById('mapoptionsdiv_contentDiv').className='optionsdiv';
  document.getElementById('mapoptionsdiv').style.height=h+"px";
  document.getElementById('mapoptionsdiv').style.width=w+"px";  // final trim
  document.getElementById('mapoptionsdiv_contentDiv').style.height=h+"px";
  document.getElementById('mapoptionsdiv_contentDiv').style.width=w+"px";  // final trim
  // this was needed  because in ie9, 5px padding is added in addition, we need to retrim that
  $('#mapoptionsdiv').css('background-color','transparent');

  if(this.gui.handheld){
    $('#mapoptionsdiv').css('background','#e2e3e4');
    $('#mapoptionsdiv').css('border','2px solid #000');
    $('#mapoptionsdiv').css('border-radius','5px');
  } else if(this.gui.wap){
    $('#mapoptionsdiv').css('background','#fff');
    $('#mapoptionsdiv').css('border','1px solid #be2926');
    $('#mapoptionsdiv').css('border-radius','5px');
  } else {
    var boxImage = { url:vidteq.imgPath.refBox3, cornerW:10, cornerH:10, boxW:510, boxH:378, offsetW:0, offsetH:0 };
    vidteq.utils.boxify(boxImage,'mapoptionsdiv_contentDiv',{lt:1,rt:1,lb:1,rb:1},1);
  }
  var that = this;
  for (var i in this.rcmItems) {
    (function () {
      var one = that.rcmItems[i];
      if ( $('#'+one.id).length ) {
        $('#'+one.id).click(function () {
          one.onClickFunc(rcmEntity);
        });
      }
    })();
  }
  if (this.gui.embed && !this.gui.embed.locateStores && !this.gui.wap) {
    this.disableRcmOptions(this.gui.embed.fix);
  }
  var that = this;
  this.killOptionPopupVar=setTimeout(function () { that.killRcmPopup(); },30000);
  if (this.gui.wap) {  // special
    // BUT this is not right because it may be start
    var tip = 'end';
    if (this.gui.embed) { tip = 'start'; }
    this.gui.fillKeyBoxAfterFindhood(rcmEntity,tip);
  }
  return false;
}

//vidteq.mbox.prototype.attachWapMenu = function(e) {
//  //if (!this.rcmItems.length) return false;
//  var eventObj=this.returnMouseLonLats(e);
//  //if(!eventObj) return false;
//  this.wcmLonlat=this.map.getLonLatFromPixel(e.xy);
//  this.clickIsOnRoute = false;
//  //console.log(this.wcmLonlat.lon+":"+this.wcmLonlat.lat);
//
//  if (this.routeActive) {
//    var point = new OpenLayers.Geometry.Point(this.wcmLonlat.lon,this.wcmLonlat.lat);
//    var dist = this.route.features[0].geometry.distanceTo(point,{details:true});
//    var distPx = dist.distance/this.map.getResolution();
//    if (distPx <= this.routeBuffer){
//      this.clickIsOnRoute = true;
//      this.wcmLonlat.lon = dist.x0;
//      this.wcmLonlat.lat = dist.y0;
//      this.clickPointStyle.pointRadius = 8;
//      this.clickPointStyle.strokeOpacity = .4;
//    }
//  }
//  this.pointLonlat="POINT("+this.wcmLonlat.lon+" "+this.wcmLonlat.lat+")";
//  this.pushFeatures('clickPointMark',this.parser.read(this.pointLonlat));
//  this.wcmEntity = {
//    index : -1,
//    type  : 'rcm',
//    lonlat : this.wcmLonlat,
//    geom : this.pointLonlat,
//    address : { name : 'Your location' }
//  };
//  e.xy.x+=10;
//  e.xy.y-=15;
//  var h = 20; var w = 100; var p = 5;
//  p=0;
//  //if(this.routeActive)
//     h+=20;
//  var popuplonlat=this.map.getLonLatFromPixel(e.xy);
//
//  var bgColor = '';
//  //var mapOptionsHTML="<div style='padding:"+p+"px;background-color:transparent;'><table id='wapOptionsTable' height="+(h-2*p)+"px width="+(w-2*p)+"px style='border :none; text-align:center; overflow:hidden;"+bgColor+"' cellborder='1' >";
//  var mapOptionsHTML="<div style='padding:"+p+"px;background-color:transparent;height:100%;width:100%;'><table width="+w+" id='wapOptionsTable' style='border :none; text-align:center; overflow:hidden;"+bgColor+"' cellborder='1' >";
//
//  //mapOptionsHTML+="<tr><td id='pinmap'>Pin Map</td></tr>";
//  //mapOptionsHTML+="<tr><td id='gotol'>Go to Location</td></tr>";
//
//  if(this.clickIsOnRoute){
//    mapOptionsHTML+="<tr><td id='jhere'>Jump Here</td></tr>";
//    mapOptionsHTML+="<tr><td id='clearM'>Clear Route</td></tr>";
//  }else{
//    mapOptionsHTML+="<tr><td id='dtohere'>Directions To Here</td></tr>";
//  }
////if(this.routeActive)
////  mapOptionsHTML+="<tr><td id='jhere'>Jump Here</td></tr>";
////else
////  mapOptionsHTML+="<tr><td id='dtohere'>Directions To Here</td></tr>";
////if(this.routeActive)
////  mapOptionsHTML+="<tr><td id='clearM'>Clear Route</td></tr>";
//  /*var optionsDecider = function (id,onclickFunc,text,disabled) {
//    var ht=["<tr id='"+id+"'" ];
//    if (onclickFunc.trim() != '') { ht.push("onclick='javascript:"+onclickFunc+";'"); }
//    ht.push("class=rcmrow onmouseover=this.className='rcmhighlight' onmouseout=this.className='rcmrow'>");
//    if(this.gui.handheld)
//      ht.push("<td style='border-bottom:1px solid black'><a onfocus='this.blur();' class='icondivtext'");
//    else
//      ht.push("<td><a onfocus='this.blur();' class='icondivtext'");
//    if(disabled) { ht.push("style='cursor:text;color:#CDC8B1;' "); }
//    ht.push("href='javascript:void(0)'>");
//    ht.push(text+"</a></td></tr>");
//    ht=ht.join(' ');
//    return ht;
//  };
//  /*
//  for (var i in this.rcmItems) {
//    var one = this.rcmItems[i];
//    if (one.cond()) {
//      mapOptionsHTML+=optionsDecider(one.id,'',one.text,one.disabled);
//    }
//  }*/
//  mapOptionsHTML+="</table></div>";
//
//
//  this.wcmPopup=new OpenLayers.Popup("mapoptionsdiv",new OpenLayers.LonLat(popuplonlat.lon,popuplonlat.lat),new OpenLayers.Size(w,h),mapOptionsHTML,false);
//  this.wcmPopup.setContentHTML(mapOptionsHTML);
//  this.wcmPopup.panMapIfOutOfView=true;
//  this.map.addPopup(this.wcmPopup);
//  // TBD why not use trimpath - is it really useful explore
//  document.getElementById('mapoptionsdiv').className='optionsdiv';
//  document.getElementById('mapoptionsdiv_GroupDiv').className='optionsdiv';
//  document.getElementById('mapoptionsdiv_contentDiv').className='optionsdiv';
//  //document.getElementById('mapoptionsdiv').style.height=h+"px";
//  //document.getElementById('mapoptionsdiv').style.width=w+"px";  // final trim
//  $('#mapoptionsdiv').css('background-color','transparent');
//
//  $('#mapoptionsdiv').css('background','#fff');
//  //$('#mapoptionsdiv').css('background-image','url(images/wap/lb.png) no-repeat 0 0');
//  $('#mapoptionsdiv').css('border','1px solid #be2926');
//  $('#mapoptionsdiv').css('border-radius','5px');
//  /*for (var i in this.rcmItems) {
//    var one = this.rcmItems[i];
//    if ( $('#'+one.id).length ) { $('#'+one.id).click(one.onClickFunc); }
//  }*/
//  var that = this;
//  this.map.events.register("zoomend",this.map,function(){
//    if(typeof(that.wcmPopup) != 'undefined' && that.wcmPopup != null)
//      that.killWcmPopup();
//  });
//
//  $('#pinmap').click(function(){
//    that.killWcmPopup();
//    vidteq.gL.pinMap(that.wcmLonlat.lat,that.wcmLonlat.lon);
//  });
//  $('#gotol').click(function(){
//    that.killWcmPopup();
//   var loc = new OpenLayers.LonLat(vidteq.gL.lon , vidteq.gL.lat);
//   vidteq.mboxObj.map.panTo(loc);
//  });
//  $('#dtohere').click(function(){
//    that.dropLiftPin('drop',that.wcmLonlat.lon,that.wcmLonlat.lat);
//    that.killWcmPopup();
//      //that.makeWcmEntityAsTip('end');
//      vidteq.gL.loadPrompt();
//      if(vidteq.mboxObj.routeActive) vidteq.mboxObj.clearRouteAndSrf();
//      vidteq.gL.plotWcmRoute({lon:that.wcmLonlat.lon,lat:that.wcmLonlat.lat});
//  });
//
//  $('#clearM').click(function(){
//    that.killWcmPopup();
//    that.clearRouteAndSrf();
//    vidteq.gL.clearGUI();
//    vidteq.gL.routeShown=false;
//  });
//
//  $('#jhere').click(function(){
//    var that=this;
//    $(this).css('background','#ed84ae');
//    setTimeout(function(){
//      $(that).css('background','#e2e3e4');
//      vidteq.mboxObj.killWcmPopup();
//      // vidteq.gL.syncCarToRoute(that.wcmLonlat.lon,that.wcmLonlat.lat);
//      //var l = new OpenLayers.LonLat(that.wcmLonlat.lon,that.wcmLonlat.lat);
//      //that.manFeature.move(l);
//      var position = new Object();
//      position.coords=new Object();
//      position.coords.longitude=vidteq.mboxObj.wcmLonlat.lon;
//      position.coords.latitude=vidteq.mboxObj.wcmLonlat.lat;
//      position.coords.accuracy=10;
//      vidteq.gL.handleGeoSuccess(position);
//      //FLEX TRANSFER//
//      //StageWebViewBridge.call('tempFunc', null,vidteq.mboxObj.wcmLonlat.lon,vidteq.mboxObj.wcmLonlat.lat);
//    },250);
//  });
//
////$('#gotol').click(function(){
////});
//  vidteq.gL.findHood(this.wcmLonlat.lat,this.wcmLonlat.lon,true);
//  this.killOptionPopupVar=setTimeout(function () { that.killWcmPopup(); },25000);
//  return false;
//}

vidteq.mbox.prototype.disableRcmOptions = function (str) {
  var whichOne=(str=='start')?($('#startoption')):($('#endoption'));
  whichOne[0].onclick=null;
  whichOne.unbind('click');
  var passString=(str=='start')?('From'):('To');
  try {
    if(this.gui.handheld) {
      whichOne.html("<td style='border-bottom:1px solid black'><a class=simple style='color:#CDC8B1;'>Directions "+passString+"</a></td>");
    } else if(this.gui.sideBarUI) {
      whichOne.html("<td><a class='sui-disabled' style='color:#3C3720;white-space:nowrap;'>Directions "+passString+"</a></td>");
    } else {
      whichOne.html("<td><a class=simple style='color:#CDC8B1;'>Directions "+passString+"</a></td>");
    }
    whichOne.css('cursor','default');
  } catch(e) {}
  whichOne[0].onmouseover=whichOne[0].onmouseout='';
}

vidteq.mbox.prototype.createAndPutFeatureInLayer = function (layer,dataObj){
  var features=[];
  //Adding it as no function to add a single feature
  //tbd find one. else pass the array of geometry with data as it is one time.
  var f= new OpenLayers.Feature.Vector(new OpenLayers.Geometry.fromWKT(dataObj.wkt),dataObj);
  features.push(f);
  layer.addFeatures(features);
}

vidteq.mbox.prototype.writeWkt = function (layer,wktParent) {
  if(vidteq.utils.getSafe('geom',wktParent)!==null) {
    wktParent = {wkt:wktParent.geom};
  } else if(vidteq.utils.getSafe('edge',wktParent) !== null) {
    wktParent = wktParent.edge;
  }
  if(vidteq.eMarshal && vidteq.eMarshal.rePlay) { wktParent = {wkt:wktParent}; }
  if (typeof(wktParent) == 'undefined' ||
      typeof(wktParent.wkt) == 'undefined' ||
      wktParent.wkt == null) return;
  var features = new Array;
  if (typeof(wktParent.wkt) == 'string') {
    //features.push(this.parser.read(wktParent.wkt));
    //var wkt = this.parser.read(wktParent.wkt);
    var wkt = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.fromWKT(wktParent.wkt),wktParent);
    if (wktParent.eMapColor) { wkt.eMapColor = wktParent.eMapColor; }
    //if (wktParent.emp_idx) { wkt.emp_idx = wktParent.emp_idx; }
    features.push(wkt);
  } else {
    for (var i in wktParent.wkt) {
      //var wkt = this.parser.read(wktParent.wkt[i]);
      var wkt = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.fromWKT(wktParent.wkt[i]),{wkt:wktParent.wkt[i]});
      if (wktParent.eMapColor) { wkt.eMapColor = wktParent.eMapColor; }
      //if (wktParent.emp_idx) { wkt.emp_idx = wktParent.emp_idx; }
      if (wkt) features.push(wkt);
    }
  }
  if ( features.length > 0 ) {
    layer.addFeatures(features);
    return features[0];
  }
  return null
}

vidteq.mbox.prototype.popupOneImage = function(evt) {
  // vidteq.mboxObj.imageTilePopup(this.lonlat,this.imgName,this.imageCaption);
  if (typeof(evt.feature.attributes.count) == 'undefined') {
    if(this.wowMode) {
      this.startEndPopup({lonlat:evt.feature.data.lonlat,imgName:evt.feature.data.imgName,imageCaption:evt.feature.data.imageCaption,feature:evt.feature,opt:'imageTilePopup'});
    } else {
      this.imageTilePopup(evt.feature.data.lonlat,evt.feature.data.imgName,evt.feature.data.imageCaption,evt.feature);
    }
  } else {
    if(this.wowMode) {
      this.startEndPopup({lonlat:evt.feature.cluster[0].data.lonlat, imgName:evt.feature.cluster[0].data.imgName, imageCaption:evt.feature.cluster[0].data.imageCaption,feature:evt.feature,opt:'imageTilePopup'});
    } else {
      this.imageTilePopup(evt.feature.cluster[0].data.lonlat,evt.feature.cluster[0].data.imgName,evt.feature.cluster[0].data.imageCaption,evt.feature);
    }
  }
  // TBD arrow overlay
  OpenLayers.Event.stop(evt);
}

// this function is already context neutral so ok
vidteq.mbox.prototype.callPopupOneImage = function(i,evt) {
  var data=this.oneImageMarker[i].data;
  if(this.wowMode) {
    this.universalSelect.unselectAll();
    //this.map.setCenter(new OpenLayers.LonLat(data.lonlat.lon,data.lonlat.lat), 6);
    var bounds = this.oneImageMarker[i].geometry.bounds;
    this.zoomToGivenBound (bounds.left,bounds.bottom,bounds.right,bounds.top);
    //this.universalSelect.select(this.oneImageMarker[i]);//this.imageOnRouteLayer.features[i]);
    //var that = this;
    //this.map.events.register("move", this.map, function (e) {
    //  //that.removeOpenPopup();
    //  //that.universalSelect.unselectAll();
    //  //that.map.events.unregister("move", that.map, function (e) { });
    //  //that.universalSelect.select(that.oneImageMarker[i]);//this.imageOnRouteLayer.features[i]);
    //   // if (map.getZoom() < maxZoomLevel)
    //   // {
    //   //     map.zoomTo(maxZoomLevel);
    //   // }
    //   var l= that.map.getLayersByName("imageOnRouteLayer");
    //   //console.log(l);
    //});

    //var l= this.map.getLayersByName("imageOnRouteLayer");
    ////l.selectedFeatures = this.oneImageMarker[i];
    this.startEndPopup({lonlat:data.lonlat, imgName:data.imgName, imageCaption:data.imageCaption,feature:this.oneImageMarker[i], opt:'imageTilePopup'});
    $('.olPopupContent').css('overflow','hidden');
  } else {
    this.imageTilePopup(data.lonlat,data.imgName,data.imageCaption,this.oneImageMarker[i]);
  }
}

vidteq.mbox.prototype.popupOneBusStop = function (evt) {
  this.imageTilePopup(evt.feature.data.lonlat,evt.feature.data.imagePath,evt.feature.data.busStopName);
  // TBD check if there is clustering
  return 0;
}

vidteq.mbox.prototype.callBusStopPopup = function(i,evt) {
  evt = evt || {};
  evt.feature = evt.feature || {};
  evt.feature.data = this.busStopsMarkers[i];
  this.popupOneBusStop(evt);
}

vidteq.mbox.prototype.putCarPath = function(response) {
  this.carPathArray=new Array();
  this.syncMapPoints=new Array();
  var carPoints = [];
  if(vidteq.utils.getSafe('car',response)!==null) { carPoints = response.car; }
  else { carPoints = response.videos; }
  //syncMapPoint is same as caption points
  for (var i = 0; i < carPoints.length; i++) {
    var tempText=carPoints[i];
    if('renderedInServer' in response) {
      if(typeof(tempText.car) != 'undefined' && tempText.car !== null) {
        this.carPathArray[i] = tempText.car.split(/[\(\)]/)[1].split(',');
        if(tempText.caption) {
          this.syncMapPoints.push(i);
        }
      }
    } else {
      this.carPathArray[i]=tempText.split('|');
      if(this.carPathArray[i][0].match(/I/)) {
        this.carPathArray[i].shift();
        this.syncMapPoints.push(i);
      }
    }
    // TBD not sure - I think it will give weird array
    // let me check by commenting
    //if(this.carPathArray[i] == null) {
    //  this.carPathArray[i] = tempText;
    //}
  }
  //TBD need to check
  // this section was used in geoLocate-lite only
  //var counter = [],count=0;
  //for(var i=0; i < this.carPathArray.length ; i++) {
  //  counter[i] = new Array(this.carPathArray[i].length);
  //  for(var x=0; x < this.carPathArray[i].length; x++)
  //    counter[i][x]=count++;
  //}
  //this.counter=counter;
  //end of counter

  //var onePoint = this.carPathArray[0][0];
  //if(typeof this.carPathArray[0][response.sourceHandle]!= 'undefined') {
  //  onePoint=this.carPathArray[0][response.sourceHandle];
  //}
  // Why ? TBD check with nanda
  //if (this.gui.wap) { } else {
  //  this.removeAndAddCarPoint(onePoint);
  //}
}

vidteq.mbox.prototype.getPopupWidth = function(input){
  if (this.gui.embed && this.gui.handheld) {
  }  else {
    return 320;
  }
  var maxw=typeof(this.gui.embed)!='undefined'?this.gui.embed.vidWidth:480;
  var index = maxw.indexOf("px");
  if (index != -1) {
    maxw = maxw.substring(0,index);
  }
  var minw = 128;
  var w;
  if (input < maxw && input> minw) {
    w=input;
    // Used in future for aligning video over popup
    // TBD may not be right place
    this.alignCenter = false;
  } else if(input < minw){
    w=minw;
    this.alignCenter = false;
  } else if(input >maxw){
    w=maxw;
    this.alignCenter = true;
  }
  return w;
}

vidteq.mbox.prototype.getPopupHeight = function(input) {
  var h;
  if (this.gui.embed && this.gui.handheld) {
  } else {
    return 240;
  }
  var maxh=typeof(this.gui.embed)!='undefined'?this.gui.embed.vidHeight:350;
  var index = maxh.indexOf("px");
  if(index != -1){
   maxh = maxh.substring(0,index);
  }
  var minh = 100;

  if(input < maxh && input > minh){
    h=input;
  } else if(input < minh){
    h=minh;
  } else if(input >maxh){
    h=maxh;
  }
  return h;
}

vidteq.mbox.prototype.removeAndAddCarPoint = function(onePoint) {
  var carCord = onePoint.split(" ");
  this.nearestWkt(carCord[0],carCord[1]);
  if(this.carPoint) {
    if (this.gui.handheld || this.gui.appMode) {
      var yOffset = this.carPoint.geometry.y;
      if(this.gui.handheld) {
        var offset=parseFloat(vidteq.utils.getScreenHeight()*0.2*this.map.getResolution());
        if (this.maxView)
          yOffset = offset + parseFloat(this.carPoint.geometry.y);
        else if (this.gui.text_shown )
          yOffset = parseFloat(this.carPoint.geometry.y) - offset;
      }
      var x = new OpenLayers.LonLat(this.carPoint.geometry.x ,yOffset);
      this.userPans=true;//TBD disabling center on car//
      if (!this.userPans){
        this.map.panTo(x);
        this.map.panDuration = 0;
        // TBD we can install a timer and make it a bit smoother by delayed init
      }
    }
    var l = new OpenLayers.LonLat(carCord[0],carCord[1]);
    if (this.carPopup) {
      this.carPopup.lonlat = l;
      this.carPopup.updatePosition();
    }
    //var l = new OpenLayers.LonLat(carCord[0],carCord[1]);
    //if (this.gui.embed && this.gui.handheld && false) {
    //  if (this.map.popups.length > 0 ) {
    //    //this.map.popups[0].lonlat = l;        //the nanda found that the rcm was moving because of this.
    //    //this.map.popups[0].updatePosition();
    //    if (!this.maxView) {
    //      this.carPopup.lonlat = l;
    //    }
    //
    //    this.carPopup.updatePosition();
    //  }
    //}
    var m=this.getAngle(this.lon1,this.lat1,carCord[0],carCord[1]);
    if(!isNaN(m)) {
      //this.carPoint.layer.options.styleMap.styles.default.defaultStyle.rotation=m;
      this.carPoint.data.rotation=m;
    }
    this.lon1=carCord[0];
    this.lat1=carCord[1];
    this.carPoint.move(l);
    this.carMarkLayer.redraw();
    this.carMarkLayer.refresh();
    if(this.gui.appMode) {
      var x = new OpenLayers.LonLat(this.carPoint.geometry.x ,this.carPoint.geometry.y);
      if (!this.userPans){
        this.map.panTo(x);
        this.map.panDuration = 0;
      }
    }
    return;
  }
  var carCord = onePoint.split(" ");
  var v = new OpenLayers.Geometry.fromWKT("POINT("+carCord[0]+" "+carCord[1]+")");
  this.lon1=carCord[0];
  this.lat1=carCord[1];
  this.carPoint = new OpenLayers.Feature.Vector(v,{car:true});
  // TBD atleast title is needed
  this.carMarkLayer.addFeatures([this.carPoint]);
}

vidteq.mbox.prototype.destroyCarPopup = function () {
  if (!this.carPopup) { return; }
  // Ideally append only if carPopup really contains VideoPlayerDiv
  if ($('#videoPopupContainer #VideoPlayerDiv').length) {
    if ($('#fvtDiv').length) {
      $('#fvtDiv').append($('#VideoPlayerDiv'));
    } else {
      $('body').append($('#VideoPlayerDiv'));
    }
  }
  //$('#fvtDiv').append($('#VideoPlayerDiv'));
  this.map.removePopup(this.carPopup);
  this.carPopup.destroy();
  delete this.carPopup;
}

vidteq.mbox.prototype.createCarPopup = function () {
  if (this.carPopup) { return; }
  var p=10;
  var pw=10;
  var w = $('#VideoPlayerDiv').width()+2*pw;
  var h = $('#VideoPlayerDiv').height()+2*p;
  this.openVideoPopupsize = new OpenLayers.Size(w-10,h);
  var html = "<div id=videoPopupContainer style='display:block;position:absolute;padding-left:10px;padding-right:10px;padding-top:10px;padding-bottom:10px;background-color:transparent;width:"+(w-2*pw)+"px;height:"+(h-2*p)+"px;' ></div>";
  //var lon = this.carPoint.geometry.x;
  //var lon = vidteq.mobUI.lastPos.lon; // temporary TBD
  var lon = vidteq.mobUI.lastPos ? vidteq.mobUI.lastPos.lon : vidteq.cfg.centerLon;
  // temporary TBD
  //var lat = this.carPoint.geometry.y;
  //var lat = vidteq.mobUI.lastPos.lat; // temporary TBD
  var lat = vidteq.mobUI.lastPos ? vidteq.mobUI.lastPos.lat : vidteq.cfg.centerLat; // temporary TBD
  this.carPopup = new OpenLayers.Popup(
    "fvtpopupdiv"
    ,new OpenLayers.LonLat(lon,lat)
    ,this.openVideoPopupsize
    ,html
    ,false
  );
  this.carPopup.disableFirefoxOverflowHack=true;
  this.carPopup.panMapIfOutOfView=false;
  this.carPopup.fixedRelativePosition=true;
  this.carPopup.autoSize=false;
  this.map.addPopup(this.carPopup);
  $('#videoPopupContainer').append($('#VideoPlayerDiv'));
  $('#fvtpopupdiv').className='optionsdiv';
  $('#fvtpopupdiv_GroupDiv').className='optionsdiv';
  $('#fvtpopupdiv_contentDiv').className='optionsdiv';
  $('#fvtpopupdiv').css({width:w+'px',height:h+'px'});
  $('#fvtpopupdiv').css('background-color','#000');
  $('#fvtpopupdiv_contentDiv').css({width:w+'px',height:h+'px',padding:'0px',overflow:'hidden'});
  this.carPopup.setBackgroundColor('transparent');
  var boxImage = { url:vidteq.imgPath.refBox3, cornerW:10, cornerH:10, boxW:510, boxH:378, offsetW:0, offsetH:0 };
  vidteq.utils.boxify(boxImage,'fvtpopupdiv_contentDiv',{lt:1,rt:1,lb:1,rb:1},1);
  //this.carPopup.calculateRelativePosition = function () {
  //  console.log("I am inside ");
  //  console.log(arguments);
  //  return 'tr';
  //};
}

// TBD this may not be needed at all
vidteq.mbox.prototype.updatePopupSize = function() {
  var that = this;
  //$('#videoPopupContainer').height($('#videoPopupContainer').outerHeight());
     //var deltaW = $('#fvtpopupdiv').width()-$('#fvtpopupdiv_contentDiv').width();
     //var deltaH = $('#fvtpopupdiv').height()-$('#fvtpopupdiv_contentDiv').height();
     //alert('deltaH'+deltaH);


     //if (deltaH < 55) {size.h += 5;} else { size.h -= 5; }
     //if (deltaW < 20) {size.w += 5;} else { size.w -= 8; }

  //$('#VideoPlayerDiv').find('embed').each(function () {
  //   that.openVideoPopupsize.h =  $(this).height()+10;
  //   that.openVideoPopupsize.w =  $(this).width();
  //});
  this.carPopup.setSize(this.openVideoPopupsize);
}

vidteq.mbox.prototype.putTextNumbers = function(response) {
  var imgBase = vidteq.imgPath.textdirs.base;
  if (this.gui.wap) {
    imgBase = vidteq.imgPath.textdirswap.base;
  }
  var features = [];
  for(var i=1;i<(this.syncMapPoints.length-1);i++) {
    var po=this.carPathArray[this.syncMapPoints[i]][0].split(" ");
    var direction = "";
    if(vidteq.utils.getSafe('vid',response)!==null) {
      direction = response.vid[i].direction;
    } else {
      if(typeof(response.videos[i].direction) == 'undefined') {
        continue;
      }
      direction = response.videos[i].direction;
    }
    features.push(
      new OpenLayers.Feature.Vector(
        new OpenLayers.Geometry.Point(po[0],po[1])
        ,{
          icon : imgBase+(i+1)+".png"+'?r='+vidteq.cfg._rStr
          ,title : direction
          //,title : response.vid[i].direction
          ,id: i
        }
      )
    );
  }
  this.textDirLayer.addFeatures(features);
}

vidteq.mbox.prototype.removeBusStopPopup = function () {
    if(this.busStopPopup) this.map.removePopup(this.busStopPopup);
}

vidteq.mbox.prototype.putBusStops = function (busStops) {
  this.removeBusStopPopup();
  this.busStopsMarkers=new Array();
  var features = [];
  for(var i in busStops) {
    var b = busStops[i];
    b.title = "stop no "+b.sl_no+"  "+b.name;
    features.push(
      new OpenLayers.Feature.Vector(
        new OpenLayers.Geometry.fromWKT(b.geom),b
      )
    );
  }
  this.busStopsLayer.addFeatures(features);
}

vidteq.mbox.prototype.moveCarTo = function(index) {
  var stringSplit=index.split(":");
  var parentIndex=stringSplit[0];
  var childIndex=stringSplit[1];
  if (vidteq.navigate) { vidteq.navigate.videoControl(index,"videoPoint"); }
  //if(typeof(vidteq.gL)!= 'undefined') vidteq.gL.videoControl(index,"videoPoint");
  var onePoint;
  if (typeof(this.carPathArray[parentIndex]) == 'undefined') { return; }
  if(this.carPathArray[parentIndex].length == 1) {
    onePoint = this.carPathArray[parentIndex][0];
  } else {
    onePoint = this.carPathArray[parentIndex][childIndex];
  }
  if (typeof(onePoint) == 'undefined') { return; }
  var carCord = onePoint.split(" ");
  var carPos = {lon:parseFloat(carCord[0]),lat:parseFloat(carCord[1])};
  if (this.carDisable) {
    if(!this.carShadowPoint) { return; }
    var carLocPx = this.map.getLayerPxFromViewPortPx(this.map.getPixelFromLonLat(new OpenLayers.LonLat(carCord[0],carCord[1])));
    //this.carShadowPoint.moveTo(carLocPx);
    this.carShadowPoint.move(carLocPx);
    return;
  }
  //this.distanceToDestination(parentIndex);
  this.vidLon=onePoint.split(" ")[0];
  this.vidLat=onePoint.split(" ")[1];
  // used elsewhere
  //if(this.gui.wap) this.keepInView(this.vidLon,this.vidLat,"video");
  this.removeAndAddCarPoint(onePoint);
  //TBD: currently its intrusive with user interaction with map
  this.keepInView(carPos,'video');
}

vidteq.mbox.prototype.zoom2RoadDp = function(textIndex) {
  var zoom={};
  zoom.point=new Array();
  for(var i=0;i<this.carPathArray[this.syncMapPoints[textIndex]].length;i++) {
    var a=this.carPathArray[this.syncMapPoints[textIndex]][i].split(" ");
    zoom.point[i]={};
    zoom.point[i].lon=a[0];
    zoom.point[i].lat=a[1];
  }
  this.zoomToFit(zoom);
}

//ver 1.1
// check with nanda
vidteq.mbox.prototype.displayOffRoute = function(response) {
  this.offRoute.removeFeatures(this.offRoute.features);
  this.outRoute.removeFeatures(this.outRoute.features);

  var treeList=new Array();
  var tree;
  var treeId=0;
  for(var i in response){
    if(response[i].treeId==null){
      tree=new Array();
      tree.push(response[i].source);
      response[i].treeId=treeId;
      treeList.push(vidteq.mboxObj.makeTree(response,tree,treeId));
      treeId++;
    }
  }
  var check;                      //checks if the previous and current road trees are in continuity //
  if(this.prevTree && typeof(treeList[0]!='undefined')){
    check = this.compareTrees(this.prevTree,treeList[0]);
    if(check){
      check=1;
    } else {
      //console.log('not a continuous network');
    }
    this.prevTree=treeList[0];
  } else
    this.prevTree=treeList[0];

  if(!check && this.prevTree && treeList.length > 1){          //2nd iteration - check for next best tree//
    check = this.compareTrees(this.prevTree,treeList[1]);
    if(check){
      this.prevTree=treeList[1];
      check=2;
      //console.log('passed in the second iteration');
    }
  }

  for(var i in response){
    if(check){
      if(response[i].treeId==parseInt(check-1)){
        //console.log(response[i].wkt);
        this.writeWkt(this.offRoute,response[i]);
      }
      else
        this.writeWkt(this.outRoute,response[i]);
    } else
      this.writeWkt(this.outRoute,response[i]);
  }
        //console.log('---');
}

vidteq.mbox.prototype.compareTrees = function(tree1,tree2) {
  if(tree1.length < tree2.length){
    for(var i in tree1)
      if(tree2.indexOf(tree1[i]) >= 0) return true;
  } else {
    for(var i in tree2)
      if(tree1.indexOf(tree2[i]) >= 0) return true;
  }
  return false;
}
vidteq.mbox.prototype.makeTree = function(response,tree,treeId) {
  for(var k=0; k < tree.length; k++) {
    for(var j in response){
      if(tree[k]==response[j].source)
        if(tree.indexOf(response[j].target) < 0){
          tree.push(response[j].target);
        }
      if(tree[k]==response[j].target)
        if(tree.indexOf(response[j].source) < 0){
          tree.push(response[j].source);
        }
    }
  }
  for(var j in response){
    for(var k in tree){
      if(tree[k]==response[j].source || tree[k] == response[j].target )
        response[j].treeId=treeId;
    }
  }
  return tree;
}

//ver 1.0 wrt to orientation //
  //vidteq.mbox.prototype.displayOffRoute = function(response) {
  //  this.offRoute.removeFeatures(this.offRoute.features);
  //  this.outRoute.removeFeatures(this.outRoute.features);
  //  for(var i in response){
  //    if(response[i].oneway == 'S2E' || response[i].oneway == 'E2S'){
  //      var start=response[i].start.replace(/POINT\(/,"");
  //      start=start.replace(/\)/,"");
  //      start=start.replace(/\,/," ");
  //      var pt=start.split(" ");
  //      var startpt={};
  //      startpt.lon=parseFloat(pt[0]);
  //      startpt.lat=parseFloat(pt[1]);
  //      var end=response[i].end.replace(/POINT\(/,"");
  //      end=end.replace(/\)/,"");
  //      end=end.replace(/\,/," ");
  //      pt=end.split(" ");
  //      var endpt={};
  //      endpt.lon=parseFloat(pt[0]);
  //      endpt.lat=parseFloat(pt[1]);
  //      if(response[i].oneway == 'S2E')
  //        var heading=vidteq.gL.getAngle(startpt.lon,startpt.lat,endpt.lon,endpt.lat);
  //      else
  //        var heading=vidteq.gL.getAngle(endpt.lon,endpt.lat,startpt.lon,startpt.lat);

  //      response[i].heading=heading;
  //      var diff=vidteq.gL.heading - heading;
  //      if( diff > -45.0 && diff < 45.0) {
  //        this.writeWkt(this.offRoute,response[i]);
  //      } else
  //        this.writeWkt(this.outRoute,response[i]);
  //    } else {
  //      this.writeWkt(this.offRoute,response[i]);
  //    }
  //  }
  //}
//ver 1.0 ends//
vidteq.mbox.prototype.getSEStyle = function(type) {
  var Style = OpenLayers.Util.extend({}, vidteq.mboxObj.decoStyle);
  //if(start){
  //  //var po=this.carPathArray[this.syncMapPoints[1]][0].split(" ");
  //  var lon2=this.textDirLayer.features[0].geometry.x;
  //  var lat2=this.textDirLayer.features[0].geometry.y;
  //  //var rot=this.getAngle(start.lon,start.lat,po[0],po[1]);
  //  var rot=this.getAngle(start.x,start.y,lon2,lat2);
  //  //var rot=this.getAngle(start.x,start.y,lon2,lat2);
  //  Style.rotation=rot-180;
  //}
  Style.externalGraphic = "images/wap/"+type+"mine.png";
  Style.graphicWidth = 40;
  Style.graphicHeight = 40;
  Style.graphicXOffset = -(Style.graphicWidth/2);
  Style.graphicYOffset = -Style.graphicHeight;
  return Style;
}

vidteq.mbox.prototype.addDelSE = function(addRemove,marker) {
  if(addRemove=='add'){
    var lonLats=marker.split("+");
    var startLon=lonLats[0];
    var startLat=lonLats[1];
    var endLon=lonLats[2];
    var endLat=lonLats[3];
    var startP=new OpenLayers.Geometry.Point(startLon,startLat);
    var endP=new OpenLayers.Geometry.Point(endLon,endLat);
    // TBD what should I do with following line ?
    //if(vidteq.gL.diffStart){
    //  var style=this.getSEStyle('start');
    //  this.startFeature = new OpenLayers.Feature.Vector(startP,null,style);
    //  this.startEndMarkLayer.addFeatures([vidteq.mboxObj.startFeature]);
    //}
    var style=this.getSEStyle('end');
    this.endFeature = new OpenLayers.Feature.Vector(endP,null,style);
    this.startEndMarkLayer.addFeatures([vidteq.mboxObj.endFeature]);
  }else{
    if (this.startFeature)
      this.startEndMarkLayer.removeFeatures(this.startFeature);
    if (this.endFeature)
    this.startEndMarkLayer.removeFeatures(this.endFeature);
  }
}

vidteq.mbox.prototype.displayRoute = function(response) {
  this.clearNbb();//clear nbbs before route display
  // TBD this does not look generic enough
  //this.clearAll();  // not sure why is it needed TBD
  this.routeActive = true;
  //if (this.gui.embed && vidteq.aD.handheldEnabled){
  //  this.gui.contextManager.update('route');
  //}
  // create distance no longer needed as res is revised
  //this.createDistances(response);
  // instead followin line needed for compatibiliy
  this.allLimits = response.rLimits;   // TBD to be removed later

  //this.writeWkt(this.route,response.edge);
  this.writeWkt(this.route,response);
  if (typeof(missingVideoDebug) != 'undefined' &&  missingVideoDebug) {
    this.writeWkt(this.routeNoVid,response.novid);
    this.writeWkt(this.routeNoVb,response.novb);
    this.writeWkt(this.routeNoDp,response.nodp);
  }
  if (this.gui.wap) {
    this.addDelSE('add',response.marker);
  } else {
    if (this.gui.embed) {
      if (this.gui.embed.fix=='end') { } else {
        vidteq.routeEndsObj.add('end',response.endEntity);
      }
      if (this.gui.embed.fix=='start') { } else {
        vidteq.routeEndsObj.add('start',response.startEntity);
      }
    } else {
      vidteq.routeEndsObj.add('start',response.startEntity);
      vidteq.routeEndsObj.add('end',response.endEntity);
    }
    //if(!this.gui.embed  ||
    //  (this.gui.embed && this.gui.embed.fix=='end')) {
    //  vidteq.routeEndsObj.add('start',response.startEntity);
    //  console.log("start added");
    //}
    //if(!this.gui.embed  ||
    //  (this.gui.embed && this.gui.embed.fix=='start')) {
    //  vidteq.routeEndsObj.add('end',response.endEntity);
    //  console.log("end added");
    //}
  }
  //if (response.startEntity.myLoc || response.endEntity.myLoc) { }
  if (response.startEntity.myLoc) { // navigable
    this.alterKIVState({gps:true,video:true});
  } else {
    this.alterKIVState({gps:false,video:true});
  }
  //if(ioAreaObj.embed && !ioAreaObj.embed.locateStores) {
  //  firstTimeRule={};
  //  firstTimeRule.newFix=ioAreaObj.embed.other;
  //  firstTimeRule.geom=vidteq.routeEndsObj[ioAreaObj.embed.other].geom;
  //  var host=document.location.hostname;
  //  if(document.location.pathname.match(/stage/)) host+='/stage';

  //  if (typeof(vidteq.aD) != 'undefined' && vidteq.aD.account=="Arthabfs"){
  //    ioAreaObj.link='http://www.arthabfs.com/map1.html?firstTimeRule='+JSON.stringify(firstTimeRule);
  //  } else {
  //    ioAreaObj.link='http://'+host+'/which.php?urlid='+vidteq.vidteq.urlId+'&firstTimeRule='+JSON.stringify(firstTimeRule);
  //  }
  //}
  // TBD I can use these markers for future use
  this.putArrowOnRoute(response);
  this.putCarPath(response);
  this.carDisable = false;
  if(this.gui.embed && this.gui.embed.firstTimeRule && this.gui.embed.firstTimeRule.busId) {
    this.putBusStops(response.busStops);
  } else {
    this.putTextNumbers(response);  // implicit dependency to carPath
    if (this.gui.wap) { } else {
      this.putImageData(response.imgData);
    }
  }
  //this.addDelSE('add',response.startEntity,response.endEntity);
  //this.fitCurrentRoute(); // implicit dependency to carPath
  //if(typeof(vidteq.mboxObj.viaMarkers)!='undefined') {
  //  for(var i=0;i<vidteq.mboxObj.viaMarkers.length;i++) {
  //    vidteq.mboxObj.addViaMarkerToLayer(i);
  //  }
  //}
  // I really dont understand  why this was needed in the first place
  // TBD before removing the code re-confirm
  this.getRouteBound();
  if(!this.gui.handheld) {
    if(this.gui.sideBarUI) {
      this.mapCenterOffset = 200;
    }
    this.changeMapViewWithGravity(this.routeBound);
  } else {
    if (this.gui.wap) {
      var loc= new OpenLayers.LonLat(vidteq.gL.lon,vidteq.gL.lat);
      this.map.panTo(loc);
      this.map.zoomTo(5);
    } else {
      var x = new OpenLayers.LonLat(response.startEntity.lonlat.lon,response.startEntity.lonlat.lat);
      this.map.setCenter(x);
    }
  }
}

vidteq.mbox.prototype.changeMapViewWithGravity = function(bound,opt) {
  var opt = opt || {};
  if (this.gui.embed &&
      this.gui.embed.place &&
      this.gui.embed.place.lonlat) {
    var center = new OpenLayers.LonLat(this.gui.embed.place.lonlat.lon,this.gui.embed.place.lonlat.lat);
    bound.extend(center);
    this.changeMapView(bound,center,{shrink:20});
  } else {
    this.changeMapView(bound,undefined,{shrink:20});
  }
}

//TBD: zoom animation based on SG2(bound), SG1(gravity), margin(shrink)-percentage wrt SG2
//vidteq.mbox.prototype.changeMapView = function(bound,gravity,shrink,offsetW,offsetH) { }
vidteq.mbox.prototype.changeMapView = function(bound,gravity,opt) {
  var opt = opt || {};
  //offsetW = typeof offsetW !== 'undefined'? offsetW : this.mapCenterOffset;
  //offsetH = typeof offsetH !== 'undefined'? offsetH : 0;
  offsetW = opt.offsetW || this.mapCenterOffset;
  offsetH = opt.offsetH || 0;
  //TBD: why 200 and not 100
  var shrink = opt.shrink || 100;
  var shrinkBy = shrink/200;
  if( this.gui && this.gui.resizableVideo && this.gui.draggableVideo ) {
    offsetW = typeof this.gui.mapCenterOffsetInPixel !== 'undefined'? this.gui.mapCenterOffsetInPixel : offsetW;
    shrinkBy = shrink/100;
  }
  var map = this.map;
  if(typeof(bound) != 'undefined' && bound != null) {
    var realBound = bound;
    if (typeof(shrink) != 'undefined') {
      realBound = new OpenLayers.Bounds(
        bound.left - bound.getWidth() * shrinkBy
        ,bound.bottom - bound.getHeight() * shrinkBy
        ,bound.right + bound.getWidth() * shrinkBy
        ,bound.top + bound.getHeight() * shrinkBy
      );
    }
    //For debug Only
    //this.route.addFeatures( [ new OpenLayers.Feature.Vector(realBound.toGeometry()) ] );
    //this.route.addFeatures( [ new OpenLayers.Feature.Vector(bound.toGeometry()) ] );

    var viewSize = map.getSize();//video doc width
    var mapCenterOffsetInPixel = offsetW; //this.mapCenterOffset;
    var viewW = viewSize.w - offsetW;
    var viewH = viewSize.h - offsetH;
    var realBoundResX = realBound.getWidth()  / viewW;
    var realBoundResY = realBound.getHeight() / viewH;
    var realBoundRes = Math.max( realBoundResX, realBoundResY );
    //var targetZoom = map.getZoomForExtent(realBound);
    var targetZoom = map.getZoomForResolution(realBoundRes);
    //if (targetZoom != this.map.getZoom()) {
    if( map.isValidZoomLevel(targetZoom) ) {
      if( map.baseLayer.wrapDateLine ) {
        targetZoom = map.adjustZoom(targetZoom);
      }
      if( typeof(gravity) != 'undefined' ) {
        var curCenter = map.getCenter();
        var curRes = map.getResolution();
        //var realBoundRes = this.map.getResolutionForZoom(targetZoom);
        var targetRes = map.getResolutionForZoom(targetZoom);
        //alert( targetZoom );
        //TBD: offset for changedCenter may be lon/lat, need a definition
        var changedCenter = realBound.getCenterLonLat();
        var mapCenterOffsetInLonLat = mapCenterOffsetInPixel*targetRes;
        changedCenter.lon = changedCenter.lon - mapCenterOffsetInLonLat;

        map.setCenter(changedCenter,targetZoom);
        //this.map.setCenter(new OpenLayers.LonLat(
        //  gravity.lon - (gravity.lon - curCenter.lon) * realBoundRes/curRes,
        //  gravity.lat - (gravity.lat - curCenter.lat) * realBoundRes/curRes),targetZoom);
      //}
      }else {
        map.zoomTo(targetZoom);
        var curCenter = realBound.getCenterLonLat();
        var changedCenter = this.offsetMapCenter(curCenter);
        map.panTo(changedCenter);
      }
    }
    //var curCenter = realBound.getCenterLonLat();
    //var changedCenter = this.offsetMapCenter(curCenter);
    //map.panTo(changedCenter);
    ////this.attachTilePanToEvents();
  }else if( gravity ) {
    var loc = new OpenLayers.LonLat(gravity.lon,gravity.lat);
    map.panTo(loc);
    //return;
    //var curCenter = map.getCenter();
    //console.log("cur center ");console.log(curCenter);
    //var coverBound = new OpenLayers.Bounds();
    //coverBound.extend(curCenter);
    //var loc = new OpenLayers.LonLat(gravity.lon,gravity.lat);
    //console.log("new loc ");console.log(loc);
    //coverBound.extend(loc);
    //console.log("cover bound ");console.log(coverBound);
    //console.log("cur bound ");console.log(map.getExtent());
    //var targetZoom = map.getZoomForExtent(coverBound);
    //console.log("targetZoom ");console.log(targetZoom);
    //console.log("curZoom ");console.log(this.map.getZoom());
    //console.log("contains for tween ");console.log(map.getExtent().scale(1.5).containsLonLat(loc));
    //if (targetZoom != map.getZoom()) {
    //  if (map.restrictedExtent) {
    //    var viewSize = map.getSize();//video doc width
    //    console.log("restri ");console.log(map.restrictedExtent);
    //    console.log("view port ");console.log(viewSize);
    //    var targetRes = map.getResolutionForZoom(targetZoom);
    //    //var curRes = map.getResolution();
    //    console.log("res ");console.log(targetRes);
    //    var lonLat = {
    //      lon: Math.min(
    //           Math.max(
    //             loc.lon
    //             ,map.restrictedExtent.left+targetRes*viewSize.w/2
    //           )
    //           ,map.restrictedExtent.right-targetRes*viewSize.w/2
    //       )
    //      ,lat: Math.min(
    //           Math.max(
    //             loc.lat
    //             ,map.restrictedExtent.bottom+targetRes*viewSize.h/2
    //           )
    //           ,map.restrictedExtent.top-targetRes*viewSize.h/2
    //       )
    //    };
    //    console.log("new res extent ");console.log(lonLat);
    //    console.log("orig  ");console.log(loc);
    //    if (loc.lon != lonLat.lon || loc.lat != lonLat.lat) {
    //      loc = new OpenLayers.LonLat(lonLat.lon,lonLat.lat);
    //    }
    //  }
    //  var px = map.getPixelFromLonLat(loc);
    //  console.log('viewPortPx ',px);
    //  //map.zoomTo(targetZoom,loc);
    //  map.myZoomTo(targetZoom,px);
    //} else {
    //  //map.panTo(loc);
    //  if (map.restrictedExtent) {
    //    var viewSize = map.getSize();//video doc width
    //    console.log("restri ");console.log(map.restrictedExtent);
    //    console.log("view port ");console.log(viewSize);
    //    var curRes = map.getResolution();
    //    console.log("res ");console.log(curRes);
    //    var lonLat = {
    //      lon: Math.min(
    //           Math.max(
    //             loc.lon
    //             ,map.restrictedExtent.left+curRes*viewSize.w/2
    //           )
    //           ,map.restrictedExtent.right-curRes*viewSize.w/2
    //       )
    //      ,lat: Math.min(
    //           Math.max(
    //             loc.lat
    //             ,map.restrictedExtent.bottom+curRes*viewSize.h/2
    //           )
    //           ,map.restrictedExtent.top-curRes*viewSize.h/2
    //       )
    //    };
    //    console.log("new res extent ");console.log(lonLat);
    //    console.log("orig  ");console.log(loc);
    //    if (loc.lon != lonLat.lon || loc.lat != lonLat.lat) {
    //      loc = new OpenLayers.LonLat(lonLat.lon,lonLat.lat);
    //    }
    //  }
    //  var traverse = Math.sqrt(
    //    (loc.lon-curCenter.lon)*(loc.lon-curCenter.lon)
    //    + (loc.lat-curCenter.lat)*(loc.lat-curCenter.lat)
    //  );
    //  var traversePx = traverse/curRes;
    //  console.log("traverse px ");console.log(traversePx);
    //  var dur = Math.max(25,parseInt(traversePx/2.5));
    //  console.log("dur is ");console.log(dur);
    //  map.myPanTo(loc,dur,opt);
    //}
    //map.setCenter(new OpenLayers.LonLat(gravity.lon,gravity.lat),0);
  }else {
    map.setCenter(new OpenLayers.LonLat(vidteq.cfg.centerLon, vidteq.cfg.centerLat), 0);
  }
}

//TBD: Earlier zoom animation commented code moved in __gravityBasedZoomAnimation
vidteq.mbox.prototype.__gravityBasedZoomAnimation = function( options ) {
    //if (targetZoom != this.map.getZoom()) {
    //  if (typeof(gravity) != 'undefined') {


    //
    //    //if (typeof(gravity) != 'undefined') {
    //    //  this.map.setCenter(new OpenLayers.LonLat(
    //    //    gravity.lon - (gravity.lon - curCenter.lon) * newRes/curRes,
    //    //    gravity.lat - (gravity.lat - curCenter.lat) * newRes/curRes),targetZoom);
    //    //} else {
    //    //  this.map.zoomTo(targetZoom);
    //    //}

    //    var that = this;
    //    this.zoomToTrigger = false;
    //    if(typeof(this.zoomInTimer) != 'undefined') clearTimeout(that.zoomInTimer);
    //    that.zoomInTimer = setTimeout(function() {
    //      //var curCenter = that.map.getCenter();
    //      //var curRes = that.map.getResolution();
    //      //var newRes = that.map.getResolutionForZoom(targetZoom);
    //      //console.log('targetZoom ',targetZoom);
    //      //console.log('realBound ',realBound);
    //      //console.log('curCenter ',curCenter);
    //      //console.log('curRes ',curRes);
    //      //console.log('newRes ',newRes);
    //      //var gravityLon = gravity.lon - (gravity.lon - curCenter.lon) * newRes/curRes;
    //      //var gravityLat = gravity.lat - (gravity.lat - curCenter.lat) * newRes/curRes;
    //      //console.log('gravityLon ',gravityLon);
    //      //console.log('gravityLat ',gravityLat);
    //      //var viewPortPx = that.map.getPixelFromLonLat(new OpenLayers.LonLat(gravityLon,gravityLat));
    //      //console.log('viewPortPx ',viewPortPx);
    //      ////that.map.zoomTo(targetZoom,viewPortPx);
    //      that.map.zoomTo(targetZoom);
    //      that.zoomToTrigger = true;
    //    },500);
    //    this.map.events.register("zoomend", this.map, function() {
    //      console.log('zoom ended');
    //      if(that.zoomToTrigger) {
    //        that.zoomInTimer = setTimeout(function() {
    //          that.zoomToTrigger = false;
    //          var curCenter = that.map.getCenter();
    //          var curRes = that.map.getResolution();
    //          var newRes = that.map.getResolutionForZoom(targetZoom);
    //          console.log('targetZoom ',targetZoom);
    //          console.log('realBound ',realBound);
    //          console.log('curCenter ',curCenter);
    //          console.log('curRes ',curRes);
    //          console.log('newRes ',newRes);
    //          var gravityLon = gravity.lon;
    //          var gravityLat = gravity.lat;
    //          console.log('gravityLon ',gravityLon);
    //          console.log('gravityLat ',gravityLat);
    //          var viewPortPx = that.map.getPixelFromLonLat(new OpenLayers.LonLat(gravityLon,gravityLat));
    //          console.log('viewPortPx ',viewPortPx);
    //          that.map.panTo(new OpenLayers.LonLat(gravityLon,gravityLat));
    //        },500);
    //      }
    //      //if(typeof(that.zoomInTimer) != 'undefined') clearTimeout(that.zoomInTimer);
    //      //that.zoomInTimer = setTimeout(function() {
    //      //  that.map.panTo(new OpenLayers.LonLat(getRoundB.lon,getRoundB.lat));
    //      //},200);
    //    });
    //    //if(typeof(this.zoomInTimer) != 'undefined') clearTimeout(this.zoomInTimer);
    //    //var that = this;
    //    //var tZoom = targetZoom;
    //    //if(targetZoom > that.map.getZoom()) {
    //    //  tZoom = targetZoom;
    //    //} else if(targetZoom < that.map.getZoom()) {
    //    //  tZoom = this.map.getZoom();
    //    //}
    //    //$('#body').animate({},{
    //    //  duration:500,
    //    //  step:function() {
    //    //    console.log('animate step');
    //    //  },
    //    //  complete: function() {
    //    //    console.log('animate step complete');
    //    //  }
    //    //});


    //    //var returnCond = false;
    //    //var checkFunc = function () {
    //    //  console.log('check func');
    //    //  if(typeof(this.zoomInTimer) != 'undefined') clearTimeout(that.zoomInTimer);
    //    //  that.zoomInTimer = setTimeout(function() {
    //    //    if(targetZoom > that.map.getZoom()) {

    //    //      //var wFunction = function(i) {
    //    //      //  i = i || 0;
    //    //      //  if(i < targetZoom) {
    //    //      //    that.map.zoomIn();
    //    //      //    i++;
    //    //      //    setTimeout(function() { wFunction(i) }, 500);
    //    //      //  }
    //    //      //}
    //    //      //wFunction(that.map.getZoom());
    //    //      that.map.zoomTo(targetZoom);

    //    //      //for (i = that.map.getZoom(); i < targetZoom; i++) {
    //    //      //  Frame(1000, function(callback){ // each iteration would pause by 2 secs
    //    //      //	  that.map.zoomIn();
    //    //      //    callback();
    //    //      //  });
    //    //      //}
    //    //      //Frame.start();

    //    //    //for( var i = that.map.getZoom(); i < targetZoom; i++ ) {
    //    //    //  that.map.zoomIn();
    //    //    //}
    //    //    } else if(targetZoom < that.map.getZoom()) {
    //    //      //var wFunction = function(i) {
    //    //      //  i = i || 0;
    //    //      //  if(i < that.map.getZoom()) {
    //    //      //    that.map.zoomOut();
    //    //      //    i++;
    //    //      //    setTimeout(function() { wFunction(i) }, 500);
    //    //      //  }
    //    //      //}
    //    //      //wFunction(targetZoom);

    //    //      that.map.zoomTo(targetZoom);
    //    //      //for (i = targetZoom; i < that.map.getZoom(); i++) {
    //    //      //  Frame(1000, function(callback){ // each iteration would pause by 2 secs
    //    //      //	  that.map.zoomOut();
    //    //      //    callback();
    //    //      //  });
    //    //      //}
    //    //      //Frame.start();

    //    //      //for( var i = targetZoom; i < that.map.getZoom(); i++ ) {
    //    //      //  that.map.zoomOut();
    //    //      //}
    //    //    }
    //    //    returnCond = true;
    //    //  },500);
    //    //  if(returnCond) return true;
    //    //}
    //    //var fireFunc = function () {
    //    //  console.log('fire func');
    //    //  var getRoundB = realBound.getCenterLonLat();
    //    //  ////that.map.panTo(new OpenLayers.LonLat(getRoundB.lon,getRoundB.lat));
    //    //  //var curCenter = that.map.getCenter();
    //    //  //var curRes = that.map.getResolution();
    //    //  //var newRes = that.map.getResolutionForZoom(targetZoom);
    //    //  //that.map.panTo(new OpenLayers.LonLat(
    //    //  //  gravity.lon - (gravity.lon - curCenter.lon) * newRes/curRes,
    //    //  //  gravity.lat - (gravity.lat - curCenter.lat) * newRes/curRes));
    //    //  return true;
    //    //}
    //    //var w = new vidteq.utils.waitAndFire (checkFunc,fireFunc);


    //    //this.zoomInTimer = setTimeout(function() {
    //    //  for( var i = 0; i < tZoom; i++ ) {
    //    //    if(targetZoom > that.map.getZoom()) {
    //    //      that.map.zoomIn();
    //    //    } else if(targetZoom < that.map.getZoom()) {
    //    //      that.map.zoomOut();
    //    //    }
    //    //  }
    //    //},500);

    //  } else {

    //    //if(typeof(this.zoomInTimer) != 'undefined') clearTimeout(this.zoomInTimer);
    //    //var that = this;
    //    //var tZoom = targetZoom;
    //    //if(targetZoom > that.map.getZoom()) {
    //    //  tZoom = targetZoom;
    //    //} else if(targetZoom < that.map.getZoom()) {
    //    //  tZoom = this.map.getZoom();
    //    //}
    //    //this.zoomInTimer = setTimeout(function() {
    //    //  for( var i = 0; i < tZoom; i++ ) {
    //    //    if(targetZoom > that.map.getZoom()) {
    //    //      that.map.zoomIn();
    //    //    } else if(targetZoom < that.map.getZoom()) {
    //    //      that.map.zoomOut();
    //    //    }
    //    //  }
    //    //},500);

    //  }
    //}
}

vidteq.mbox.prototype.offsetMapCenter = function(ll) {
  if (!this.mapCenterOffset) { return ll; }
  var px = this.map.getPixelFromLonLat(new OpenLayers.LonLat(ll.lon,ll.lat));
  px.x = Math.round(px.x) - this.mapCenterOffset;
  var ret = this.map.getLonLatFromPixel(new OpenLayers.Pixel(px.x,px.y));
  return ret;
}

vidteq.mbox.prototype.attachTilePanToEvents = function() {
  var that = this;
  this.map.events.on({
    "movestart": function() {
      if (!that.hoverPopups) that.hoverPopups = [];
      while (that.hoverPopups.length > 0) {
        that.hoverPopups.pop().destroy();
      }
    },
    "move": function() {},
    "moveend": function() {}
  });
  
//  if(this.gui.embed && this.gui.appMode) {
//    var that = this;
//    this.map.events.on({
//      //"movestart": function() {},
//      //"move": function() {},
//      "moveend": function() {
//        if(that.gui.startVideoRoute) {
//          setTimeout(function() {
//            StageWebViewBridge.call('startVideoRoute', null, true);
//            that.gui.startVideoRoute = false;
//          },200);
//        }
//      }
//    });
//  }
}

vidteq.mbox.prototype.lonLatObjFrmPoint = function(point) {
  if(typeof(point) == 'undefined' || point == null) return null;
  var temp=point.replace(/POINT\(/,"");
  temp=temp.replace(/\)/,"");
  temp=temp.replace(/\,/," ");
  var pt=temp.split(" ");
  var p={};
  p.lon=parseFloat(pt[0]);
  p.lat=parseFloat(pt[1]);
  return p;
}

vidteq.mbox.prototype.computeDistance = function(lonA,latA,lonB,latB) {
  return ((lonA-lonB)*(lonA-lonB) + (latA-latB)*(latA-latB));
}

vidteq.mbox.prototype.releaseCarAfterDrag = function(dragLon,dragLat) {
  var lP = this.getlP({x:dragLon,y:dragLat});

  this.removeAndAddCarPoint(this.carPathArray[lP.lPI][lP.lCI]);
  if(this.gui.appMode) {
    try { StageWebViewBridge.call('playVideo', null, lP.lPI); } catch (e) { };
  } else {
    try { this.gui.fvt.getVideoObj(this.gui.fvt.videoSwf).playVideo(lP.lPI); } catch (e) { }; // TBD make player to lCI
  }
  // now wait for 2 sec before releasing car
  var that = this;
  setTimeout(function () {
    that.carDisable = false;
    if (that.carShadowPoint) {
      that.carMarkLayer.removeFeatures([that.carShadowPoint]);
      delete that.carShadowPoint;
    }
  },2000);
  //setTimeout(function () {
  //  vidteq.mboxObj.carDisable = false;
  //  if (vidteq.mboxObj.carShadowPoint) {
  //    vidteq.mboxObj.carMarkLayer.removeFeatures([vidteq.mboxObj.carShadowPoint]);
  //    delete vidteq.mboxObj.carShadowPoint;
  //  }
  //},2000);
}

vidteq.mbox.prototype.getCenter= function() {
  var center = this.map.getCenter();
  return center;
}

vidteq.mbox.prototype.getCenterFeature= function() {
  var centerEntity = this.gui.routeEnds.getCenter();
  return this.seFeatureStore[centerEntity.seFeature];
}

vidteq.mbox.prototype.getBound =function () {
  var bound ;
  bound =this.map.getExtent();
  return bound;
}
//????
vidteq.mbox.prototype.getLayerByName= function (obj) {
  var name=this.map.getLayersByName(obj);
  return name;
}
//????
vidteq.mbox.prototype.getLayersByName =function (matchCat){
   return this.map.getLayersByName(matchCat);
}

vidteq.mbox.prototype.enlargeThumbNail =function (width,height) {
  var divsize= $("#popimage").css("width");
  if(typeof(this.wowMode) != 'undefined' && this.wowMode) {
    $('.slideShow').cycle('destory');
    divsize= $("#popupImgDiv").css("width");
  }
  var myIEWidth= 290;
  var myFFWidth=300;
  var myIEHeight=190;
  var myFFHeight=195;
  var biggerWidth=$("#myid").css("width");
  var biggerHeight=$("#myid").css("height");

  if(typeof(biggerWidth) && biggerWidth){
    var  widthInteger= biggerWidth.replace(/px$/,'');
    myIEWidth= widthInteger-30;
    myFFWidth=widthInteger-20;
  }
  if (typeof(biggerHeight) && biggerHeight){
    var  heightInteger= biggerHeight.replace(/px$/,'');
    myIEHeight=heightInteger-60;
    myFFHeight=heightInteger-50;
  }
  $("#nameCat").hide('slide',200);
  $("#name").hide('slide',200);
  $("#yo_video").hide('slide',200);
  if (typeof(width) && width){ }
  if (self.navigator.userAgent.match(/MSIE/)){
    $("#yo").animate({width:myIEWidth+"px",height:myIEHeight+"px",left:"0px",right:"10px"},200);
    if(typeof(this.wowMode) != 'undefined' && this.wowMode) {
      $('#popupImgDiv .slideShow').find('img').each(function() {
        $(this).css({'width':'290px','height':myIEHeight+"px",left:"2px",right:"10px"});
      });
      $('#popupImgDiv').css({'width':'290px','height':myIEHeight+"px",left:"2px",right:"10px"});
      this.slideShow(".slideShow","all","normal");  //other possible alternatives - shuffle
      $(".slideShow").css({'width':'290px','height':myIEHeight+"px"});
    } else {
      $("#popimage").animate({width:"290px",height:myIEHeight+"px",left:"2px",right:"10px"},200);
    }
  } else {
    $("#yo").animate({width:myFFWidth+"px",height:myFFHeight+"px",left:"0px",right:"10px"},200);
    if(typeof(this.wowMode) != 'undefined' && this.wowMode) {
      $('#popupImgDiv').css({'width':myFFWidth+"px",'height':myFFHeight+"px",left:"2px",right:"10px"});
      $('#popupImgDiv .slideShow').find('img').each(function() {
        $(this).css({'width':myFFWidth+"px",'height':myFFHeight+"px",left:"2px",right:"10px"});
      });
      this.slideShow(".slideShow","all","normal");  //other possible alternatives - shuffle
      $(".slideShow").css({'width':myFFWidth+"px",'height':myFFHeight+"px"});
    } else {
      $("#popimage").animate({width:myFFWidth+"px",height:myFFHeight+"px",left:"2px",right:"10px"},200);
    }
  }
}

vidteq.mbox.prototype.enlargeThumbNailVideo =function () {
  var divsize= $("#yo_video_object").css("width");
  $("#nameCat").hide('slide',200);
  $("#name").hide('slide',200);
  $("#yo").hide('slide',200);
  if (self.navigator.userAgent.match(/MSIE/)){
    $("#yo_video").animate({width:"290px",height:"190px",top:"5px",right:"5px"},200);
    $("#yo_video_object").animate({width:"290px",height:"180px",right:"2px",top:"5px"},200);
    $("#yo_collapse").show('slide',200);
    $("#yo_expand").hide('slide',200);
  } else {
    $("#yo_video").animate({width:"300px",height:"195px",top:"5px",right:"5px"},200);
    $("#yo_video_object").animate({width:"300px",height:"185px",left:"2px",right:"10px"},200);
    $("#yo_collapse").show('slide',200);
    $("#yo_expand").hide('slide',200);
  }
}

vidteq.mbox.prototype.getBackThumbNail =function (width,height) {
  var divsize= $("#popimage").css("width");
  if(typeof(this.wowMode) != 'undefined' && this.wowMode) {
    $('.slideShow').cycle('destory');
    divsize= $("#popupImgDiv").css("width");
  }
  var integerDivSize= divsize.replace(/px$/, '');
  if (integerDivSize > 80){
    $("#nameCat").show('slide',200);
    $("#name").show('slide',300);
    $("#yo_video").show('slide',200);
    $("#yo").animate({width:"80px",height:"80px",left:"0px",right:"10px"},200);
    if(typeof(this.wowMode) != 'undefined' && this.wowMode) {
      $('#popupImgDiv .slideShow').find('img').each(function() {
        $(this).css({'width':'80px','height':'80px'});
      });
      $('#popupImgDiv').css({'width':'80px','height':'80px'});
      this.slideShow(".slideShow","all","normal");  //other possible alternatives - shuffle
    } else {
      $("#popimage").animate({width:"80px",height:"80px",right:"0px",top:"2px"},200);
    }
  } else {vidteq.mboxObj.enlargeThumbNail(width, height);}
}

vidteq.mbox.prototype.getBackThumbNailVideo =function () {
  var divsize= $("#yo_video_object").css("width");
  if(divsize=="300px" || divsize =="290px"){
   $("#nameCat").show('slide',200);
   $("#name").show('slide',200);
   $("#yo").show('slide',200);
   $("#yo_video").animate({width:"80px",height:"90px",right:"5px",top:"90px"},200);
   $("#yo_video_object").animate({width:"80px",height:"80px",right:"0px",top:"2px"},200);
   $("#yo_collapse").hide('slide',200);
   $("#yo_expand").show('slide',200);
  } else {vidteq.mboxObj.enlargeThumbNailVideo();}
}

vidteq.mbox.prototype.zoomToBottom =function (x,y) {
  var curx=x;
  var cury=y;
  var curzoom=this.map.getZoom();
  var point = new OpenLayers.LonLat(x,y);
  var zoom = this.map.getNumZoomLevels()-1;
  this.map.setCenter(point,zoom);
}

vidteq.mbox.prototype.zoomToGivenBound= function (left,bottom,right,top) {
  var extent=new OpenLayers.Bounds(left,bottom,right,top);
  if (this.gui.wap) { } else {
    this.map.zoomToExtent(extent,false);
  }
}
//TBD: PFLayer - Proposed Feature Layer to be re-used for polygon layer
vidteq.mbox.prototype.zoomToPfLayerExtent=function (extent){
  this.map.zoomToExtent(extent,false);
}
vidteq.mbox.prototype.undoExpandMapPopVideo = function() {
  document.getElementById('mapTd').height=500+"px";
  document.getElementById('map').style.height=525+"px";
  if(this.routeActive) {
    this.fitCurrentRoute();
  } else {
    //this.map.setCenter(new OpenLayers.LonLat(globalLon, globalLat), globalZoom);
    this.map.setCenter(new OpenLayers.LonLat(vidteq.cfg.centerLon, vidteq.cfg.centerLat), vidteq.cfg.topZoom);
  }
  // TBD
  //if(biasWmsLayer){
  //    map.removeLayer(biasWmsLayer);
  //            map.removeLayer(vidteq.bias.biasMarkerLayer);
  //            vidteq.bias.biasMarkerLayer=null;
  //            vidteq.bias=null;
  //            map.layers[1].setOpacity(1)
  //            document.getElementById('map').title='Right Click on Map for more options';
  //            removeBiasLegend();
  //            //$('#biaslink')[0].onclick=biasMap;
  //
  //    }
}

vidteq.mbox.prototype.expandMapPopVideo = function() {
  if(this.routeActive) {
    this.fitCurrentRoute();
  } else {
    //this.map.setCenter(new OpenLayers.LonLat(globalLon, globalLat), globalZoom);
    this.map.setCenter(new OpenLayers.LonLat(vidteq.cfg.centerLon, vidteq.cfg.centerLat), vidteq.cfg.topZoom);
  }
}

// not able to find out wher eit is used so commented TBD
//vidteq.mbox.prototype.addEmbedCenter = function () {
//  if(this.gui.embed) {
//    if(this.gui.embed.fix=='start') {
//      this.gui.disableField({a:'starttextbox'});
//      this.gui.enableField({b:'endtextbox'});
//    } else if(this.gui.embed.fix=='end') {
//      this.gui.disableField({a:'endtextbox'});
//      this.gui.enableField({b:'starttextbox'});
//    }
//    // TBD this does not belong here
//    var entity = this.gui.getEntity.apply(this.gui,['center',1]);
//    entity=this.gui.prepareCenterEntity(entity);
//    vidteq.routeEndsObj.addByIndex(this.gui.embed.fix,1,'center');
//    if(this.gui.embed.place.popup && this.gui.embed.place.popup.open==1) vidteq.mboxObj.popoutCenterPlace();
//  }
//}

vidteq.mbox.prototype.popoutCenterPlace = function (evt,shortPop) {
  if (!this.startEndMarkLayer) { return; }
  var f = this.startEndMarkLayer.features;
  for (var i in f) {
    if (!f[i].data.type || f[i].data.type != 'center') { continue; }
    evt = evt || {};
    evt.feature = f[i];
    this.popupLocation(evt,shortPop);
  }
}

vidteq.mbox.prototype.popoutTheMinimap = function () {
  var h=typeof(this.gui.embed.expandTo.height)!='undefined'?this.gui.embed.expandTo.height:600;
  var w=typeof(this.gui.embed.expandTo.width)!='undefined'?this.gui.embed.expandTo.width:800;
  w=w<=800?800:w;
  h=h<=600?600:h;
  var url="http://"+document.location.host+"/stage/embed2.php?q="+this.gui.embed.expandTo.et+"&place="+JSON.stringify(this.gui.embed.expandTo.place);
  url+="&pf=2&h="+h+"&w="+w;
  window.open(url,'Vidteq','status=1,width='+w+',height='+h+',scrollbars=0,resizable=1');
}

vidteq.mbox.prototype.createLandMarkLayer = function (response) {
  if (typeof(response)!='object') response=JSON.parse(response);
  var features= [];
  var featuresPolygon= [];
  var srfLength = response.srf.length;

  if (0 in response.srf) {
    for (var i=0 ; i<response.srf[0].results.length; i++){
      var v = new OpenLayers.Geometry.fromWKT(response.srf[0].results[i].geom);
      var pointArray =[];
      pointArray.push(v);
      var pFeature = new OpenLayers.Feature.Vector(v,response.srf[0].results[i]);
      features.push(pFeature);
    }
    this.landmarkLayer.addFeatures(features);
  }

  if (1 in response.srf) {
    for (var i=0 ; i<response.srf[1].results.length; ++i){
      if (typeof(response.srf[1].results[i].geom)!='undefined'){
        var w = new OpenLayers.Geometry.fromWKT(response.srf[1].results[i].geom);
        var x=new OpenLayers.Feature.Vector(w,response.srf[1].results[i]);
        featuresPolygon.push(x);
      }
    }
    this.landmarkLayer.addFeatures(featuresPolygon);
  }
  //this.gui.changeBackOpacity(1);
}

vidteq.mbox.prototype.checkIfLayerExists =function (layerName) {
  var l= this.map.getLayersByName(layerName);
  return l.length;
}

vidteq.mbox.prototype.putAllLocatorPoints =function (srf,bound) {
  var features= [];
  if('undefined' != typeof(vidteq.aD) && vidteq.aD.q == 'locatestores' && 'locateStores' == srf.srfType){
     $('#collapse').html('<<');
     if('undefined' == typeof(this.catMngr) && typeof(vidteq._catMngr)!=="undefined"){
      this.catMngr = new vidteq._catMngr(this,'slave',40);
    }
    var params = {
     'categoryIcon':vidteq.cfg.customCategoryLogosLoc+vidteq.aD.places.categoryDetails.categoryIconName,
     'categoryClusterIcon':vidteq.cfg.customCategoryLogosLoc+vidteq.aD.places.categoryDetails.categoryClusterIconName,
     'shadowIcon': vidteq.cfg.customCategoryLogosLoc+vidteq.aD.places.categoryDetails.shadowIconName,
     'shadowClusterIcon': vidteq.cfg.customCategoryLogosLoc+vidteq.aD.places.categoryDetails.shadowClusterIconName
    };
    this.catMngr.fillCatLayer(params,srf,bound);
    this.locatorPoint = this.catMngr.layer.features;
    return;
  }
  //if(!this.catMngr.layer) { this.catMngr.createCatLayer();}

  for(var i=srf.showSets[srf.curShowSet].from-1;i<srf.showSets[srf.curShowSet].to;i++) {
    if(srf.results[i].geom) {
      var entity=srf.results[i];
      var v = new OpenLayers.Geometry.fromWKT(entity.geom);
      var pFeature = new OpenLayers.Feature.Vector(v,entity);
      var pObj=this.lonLatObjFrmPoint(entity.geom);
      bound.extend(new OpenLayers.LonLat(pObj.lon,pObj.lat));
      this.locatorPoint[entity.lpIndex]=pFeature;
      this.locatorPoint[entity.lpIndex].entity = entity;
      features.push(pFeature);
      //entity.shownLayer = 'locatorPointLayer';
    }
  }
  this.locatorPointLayer.addFeatures(features);
  this.landmarkLayer.setVisibility(false);
}

vidteq.mbox.prototype.putAlog =function (str){
  //console.log ("the log is:"+str);
}

vidteq.mbox.prototype.addToOnSelectControl = function (layer) {
  var layersExisting = this.universalSelect.layers;
  layersExisting.push(layer);
  this.universalSelect.setLayer(layersExisting);
}

//vidteq.mbox.prototype.addToOnSelectControl = function (layer) {
//  var matchControl=/SelectFeature/gi;
//  var existingControl= this.map.getControlsByClass(matchControl);
//  var existingLayers=[];
//  if (existingControl[0]){
//    if (existingControl[0].layers ){
//      for (i=0;i<existingControl[0].layers.length;i++) {
//          existingLayers.push(existingControl[0].layers[i]);
//      }
//    } else {
//      existingLayers.push(existingControl[0].layer);
//    }
//    existingControl[0].deactivate;
//    //existingControl[0].destroy;
//    this.map.removeControl(existingControl[0]);
//    existingControl[0].destroy;
//  } else {
//    // Special case when control is not present add dragCar layer
//    existingLayers.push(this.textDirLayer);
//    existingLayers.push(this.carMarkLayer);
//    existingLayers.push(this.busStopsLayer);
//  }
//  existingLayers.push(layer);
//  if(!this.wowMode) { this.map.setLayerIndex(this.carMarkLayer,13); }
//  this.universalSelect = new OpenLayers.Control.SelectFeature(
//    existingLayers,
//    { clickout:true,
//      toggle:true,
//      hover: false,
//      //  opacity:1,
//      highlightOnly: false
//    }
//  );
//  this.map.addControl(this.universalSelect);
//  this.universalSelect.activate();
//  this.universalSelect.handlers.feature.stopDown = false;
//}

vidteq.mbox.prototype.substituteDescriptionVariables = function (data) {
  // TBD currently other than image variables are not substituted
  var d = data.description;
  d = d.replace(/CUSTOM_VIDEO_PATH./gi,vidteq.cfg.highBwcustomVideoUrl);
  //d = d.replace(/CUSTOM_IMAGE_PATH./gi,vidteq.cfg.cloneImageUrl);
  if (!d.match(/img.*id.*popupImage.*src.*POIID_P_IMAGE_NAME/)) { return d; }
  d = d.replace(/src.*POIID_P_IMAGE_NAME/,'src='+vidteq.imgPath.ajaxLoader+' style=\'position:absolute;left:110px;top:75px;\' ');
  d = d.replace(/src.*MAP_VIEW_ICON_NAME/,'src='+vidteq.imgPath.ajaxLoader+' style=\'width:32px;height:32px;\'  ');
  if (data.baseurl) { d = d.replace(/MAP_VIEW_URLID/g,data.baseurl); }
  d = d.replace(/MAP_VIEW_CITY/g,vidteq.cfg.city);
  if (d.match(/[^\.]mboxObj/)) { // temp stupid fix
    d = d.replace(/mboxObj/gi,'vidteq.mboxObj');
  }
  var that = this;
  var callback = function (poiData) {
    $('#popupImage').load(function() {
      $('#popupImage').css({position:'static',left:null,top:null});
    });
    var srcA = poiData.image.toString().split(/,/);
    var imgHt = '';
    for (var i in srcA) {
      var src = srcA[i];
      var url = vidteq.cfg.cloneImageUrl + src;
      imgHt += "<img id='popupImage' style='width:320px;height:240px;' src='"+url+"' alt='"+poiData.address.name+"' class='popuplmImg'/>";
    }
    $('#yo').html(imgHt);
    $('#yo').css({'width':'320px','height':'240px'});
    that.slideShow(".landmarkPopYoDiv","all","normal");
    //$('#popupImage').attr('src',vidteq.cfg.cloneImageUrl+poiData.image);
    if('icon' in poiData) {
      $('#popupIcon').attr('src',vidteq.cfg.imageLogosLoc+poiData.icon.name);
      $('#popupIcon').css({
        width:poiData.icon.w||'64px'
        ,height:poiData.icon.h||'64px'
      });
    }
  }
  this.getPoiData(data.poiid,callback);
  return d;
}

vidteq.mbox.prototype.getPoiData = function (poiid,callback) {
  var populatePoiDataWrap = function (resp) {
    if (typeof(resp) != 'object') resp = JSON.parse(resp);
    var res = resp.srf[0].results[0];
    if(res!=undefined) { callback(res); }
  }
  var data={action:"businessSearch",city:vidteq.cfg.city,place:"id="+poiid,account:vidteq.vidteq.account,key:vidteq.vidteq.key};
  var magicCall = $.ajax({
    url:vidteq.cfg.magicHappensUrl,
    data:data,
    dataType:vidteq.vidteq.dataType,
    //dataType:'json',
    success: populatePoiDataWrap,
    error:function(response) {ioAreaObj.handleError(response);}
  });
}

//vidteq.mbox.prototype.addLandMarkPopup = function (evt) {
//  var f=evt.feature;
//  //ioAreaObj.displayMessage('&nbsp');
//  //if (!f.data.description || this.vidteq.utils.trim(f.data.description) == '') { return; }
//  if (!f.data.description) { return; }
//  var htmlContent={};
//  //htmlContent.content= f.data.description;
//  //htmlContent.content= vidteq.mboxObj.substitutePopupPaths(f.data.description);
//  htmlContent.content= this.substitutePopupPaths(f.data.description);
//  if (!f.data.description || vidteq.utils.trim(f.data.description) == '') { return; }
//  htmlContent.size=new OpenLayers.Size (50,50);
//  this.openLandMarkPopup=new OpenLayers.Popup.FramedCloud("landMarkPopup",
//    new OpenLayers.LonLat(f.geometry.x,f.geometry.y),
//    htmlContent.size,
//    htmlContent.content,null,false
//  );
//
//  this.map.addPopup(this.openLandMarkPopup);
//  //var imageSource=cloneImageUrl+"IND_BLR_POI_15_77.627350_12.937683";
//  //if (!$("#popimage").attr('src')) { $("#popimage").attr('src',imageSource); }
//  this.openLandMarkPopup.setOpacity(1);
//  document.getElementById('landMarkPopup').className='optionsdiv';
//  document.getElementById('landMarkPopup_GroupDiv').className='optionsdiv';
//  document.getElementById('landMarkPopup_contentDiv').className='optionsdiv';
//  this.openLandMarkPopup.div.style.zIndex=18000;
//  $('#myid').height($('#landMarkPopup_contentDiv').height()+30);
//  $('#myid').width($('#landMarkPopup_contentDiv').width()+25);
//  $('#landMarkPopup_contentDiv').height($('#landMarkPopup_contentDiv').height()+30);
//  $('#landMarkPopup_contentDiv').width($('#landMarkPopup_contentDiv').width()+25);
//  var boxImage = { url:vidteq.imgPath.refBox3, cornerW:10, cornerH:10, boxW:510, boxH:378, offsetW:0, offsetH:0 };
//  vidteq.utils.boxify(boxImage,'landMarkPopup_contentDiv',{lt:1,rt:1,lb:1,rb:1});
//  var newTop = parseInt($('#landMarkPopup_contentDiv').css('top')) > 15 ? 30:0;
//  $('#landMarkPopup_contentDiv').css('left','0px');
//  $('#landMarkPopup_contentDiv').css('top',newTop+'px');
//}

vidteq.mbox.prototype.removeOpenLandMarkPopup = function(evt) {
  if(typeof(this.openLandMarkPopup) != 'undefined' && this.openLandMarkPopup != null) {
    this.map.removePopup(this.openLandMarkPopup);
    this.openLandMarkPopup.destroy();
    this.openLandMarkPopup=null;
    //vidteq.mboxObj.restoreMapTitle();
    this.restoreMapTitle();
  }
}

vidteq.mbox.prototype.getXOffset = function (gravity) {
  var XOffset = 0;
  //var zoom =vidteq.mboxObj.getCurrentZoom();
  var zoom =this.getCurrentZoom();
  zoom =zoom+1;
  switch (gravity){
      case "up" : XOffset = 0;
    break;
    case "down": XOffset = 0;
    break;
    case "left": XOffset = -30/zoom;
    break;
    case "right": XOffset = 30/zoom;
    break;
    case "ne" : XOffset = 30/zoom;
    break;
    case "nw" : XOffset = 30/zoom;
    break;
    case "se" : XOffset = 30/zoom;
    break;
    case "sw" : XOffset = 30/zoom;
    break;
    default : XOffset= 0;
    break;
  }
  return XOffset ;
}
vidteq.mbox.prototype.getYOffset = function (gravity) {
  //var zoom =vidteq.mboxObj.getCurrentZoom();
  var zoom =this.getCurrentZoom();
  zoom=zoom+1;
  var YOffset = 0;
  switch (gravity){
    case "up" : YOffset = 50/zoom;
    break;
    case "down": YOffset = 50/zoom;
    break;
    case "left": YOffset = 0;
    break;
    case "right": YOffset = 0;
    break;
    case "ne": YOffset = 20/zoom;
    break;
    case "nw": YOffset = 20/zoom;
    break;
    case "se": YOffset = -20/zoom;
    break;
    case "sw": YOffset = -20/zoom;
    break;
    default : YOffset = 0;
    break;
    }
  return YOffset ;
}
vidteq.mbox.prototype.nearby  = function (point, pointArray) {
  //for (var i in pointArray) {
  //  if (typeof(pointArray[i])!= 'undefined' ){
  //    var cc = pointArray[i].geometry.getBounds().getCenterLonLat();
  //    }  else {
  //     cc= point.geometry.getBounds().getCenterLonLat();
  //    }
  //      var fc = point.geometry.getBounds().getCenterLonLat();
  //      this.resolution= vidteq.mboxObj.getResolution ();
  //      var distance = (
  //          Math.sqrt(
  //              Math.pow((cc.lon - fc.lon), 2) + Math.pow((cc.lat - fc.lat), 2)
  //          ) / this.resolution
  //      );
  //    }
  //
  //return 0;
}

vidteq.mbox.prototype.getResolution =function () {
  return this.map.getResolution();
}

//TBD: PFLayer - Proposed Feature Layer to be re-used for polygon layer
//New Layer to show the upcoming projects and landmarks specific to a particular project
//Named as proximity feature Layer
vidteq.mbox.prototype.createPfLayer = function (response) {
  response= JSON.parse(response);
  var pfLayer={};
  // the response will contain a variety of geometries
  //store it in a geometry components
  //var decoStyle = OpenLayers.Util.extend({}, OpenLayers.Feature.Vector.style['default']);
  //  decoStyle.fillOpacity = 0.8;
  //  decoStyle.strokeColor="#00FF00";
  //  decoStyle.graphicOpacity = 1;
    var count=200;
  //  pfLayer.defaultStyle= new OpenLayers.Style({//style for default feature
  //    //fill : "${fill}",
  //    fillOpacity: 0.4,
  //    fillColor: "${fillColor}",
  //    pointRadius: "${pointRadius}",
  //    stroke: true,
  //    strokeColor:"${strokeColor}",
  //    strokeWidth: "${strokeWidth}",
  //    graphicTitle: "${title}",
  //    strokeDashstyle: "${strokeDashstyle}",
  //    label: "${label}",
  //    graphicTitle: "blah",
  //    labelAlign: "${labelAlign}",
  //    fontColor: "${fontColor}",
  //    fontWeight:"bold",
  //    labelXOffset:"30",
  //    labelYOffset:"-20",
  //    display:"${display}",
  //    fontSize: 8
  //  },
  //  { context : {
  //    pointRadius : function(feature) {
  //
  //
  //      if (typeof (feature.data.style) != 'undefined' && feature.data.style) {
  //        //var tmp = JSON.parse(feature.data.style);
  //        if (typeof (feature.data.style.pointRadius) != 'undefined') {
  //           return feature.data.style.pointRadius;
  //        } else { return "6"; }
  //      } else { return "6"; }
  //    },
  //    strokeDashstyle : function(feature) {
  //      if (typeof (feature.data) != 'undefined') {
  //       if(typeof(feature.data.strokeStyle)!='undefied')
  //        {if (feature.data.strokeStyle=='dashdot'){ return "dashdot";}}
  //
  //      }
  //    },
  //    display: function (feature){
  //      if (typeof(feature.data.style)!='undefined' && feature.data.style ){
  //         if (feature.data.style.noDisplay){ return "none";}
  //      }
  //      else { return  true;}//it does'nt hv a effect  except none
  //      },
  //    labelAlign : function (feature) {
  //
  //      if (typeof (feature.data.style) != 'undefined' && feature.data.style) {
  //        if (typeof (feature.data.style.labelAlign) != 'undefined') {
  //          return feature.data.style.labelAlign;
  //        }
  //      }
  //      else return "lc";
  //    },
  //    //fill : function  (feature) {
  //    //  var zoom=vidteq.mboxObj.getCurrentZoom();
  //    //  if (zoom<3){ return 0; }
  //    //  return 1;
  //    //  },
  //    fillColor : function (feature) {
  //       if (typeof (feature.data.code)!= 'undefined'){
  //          if (feature.data.code==12){ return '#abababa'}//commercial
  //          if (feature.data.code==13){ return '#cccccc'}//industrial
  //          if (feature.data.code==14){ return '#0000ff'}//waterbodies
  //          if (feature.data.code==15){ return '#e5e5e5'}//openSpace
  //          if (feature.data.code==16){ return '#00ff00'}//agriculture
  //          if (feature.data.code==17){ return '#'}//Utilities
  //          if (feature.data.code==11){ return '#ffc0cb'}//residential
  //          if (feature.data.code==18){ return '#c887b1'}//public
  //         }
  //    },
  //    label :function(feature) {
  //      var zoom=vidteq.mboxObj.getCurrentZoom();
  //       if (typeof (feature.data.style) != 'undefined') {
  //         if (typeof (feature.data.style) != 'undefined' && feature.data.style &&
  //          typeof (feature.data.style.zoomMin) != 'undefined' &&
  //          typeof (feature.data.style.zoomMax) != 'undefined' &&
  //          (zoom < feature.data.style.zoomMin || zoom > feature.data.style.zoomMax)) { return ""; }
  //        if (typeof (feature.data.label)!= 'undefined'){
  //          return feature.data.label;}
  //         }
  //                else  return "";
  //    },
  //    fontColor: function (feature) {
  //      if (typeof (feature.data.style) != 'undefined' && feature.data.style) {
  //        return feature.data.style.fontColor;
  //      }
  //    },
  //    strokeColor: function(feature) {
  //       if (typeof (feature.data) != 'undefined') {
  //         if (typeof (feature.data.strokeColor) != 'undefined') {
  //           return feature.data.strokeColor;
  //         }
  //      }  else return "0000ff";
  //    },
  //    strokeWidth: function(feature) {
  //     var zoom=vidteq.mboxObj.getCurrentZoom();
  //      if (typeof (feature.data) != 'undefined') {
  //        if (typeof (feature.data.strokeWidth) != 'undefined') {
  //           var size=feature.data.strokeWidth;
  //           return size;
  //        }
  //      }
  //    }
  //  }});
  pfLayer.layer = new OpenLayers.Layer.Vector(
            "LandMarkLayer",
             {
             styleMap: new OpenLayers.StyleMap({
               //"default" :pfLayer.defaultStyle
               "default" :this.pfLayerStyle
             }), isBaseLayer: false
  });
  pfLayer.layerPolygon = new OpenLayers.Layer.Vector(
            "LandMarkLayerPolygon",
             {
             styleMap: new OpenLayers.StyleMap({
               //"default" :pfLayer.defaultStyle
               "default" :this.pfLayerStyle
             }), isBaseLayer: false
  });
  var features = [];
  var featuresPolygon = [];
  var srfResponse = response.srf[0].results;
  for (var i=0 ; i<srfResponse.length; i++){
     if(typeof(srfResponse[i]) !='undefined' && typeof(srfResponse[i].lineStyle) !='undefined'){
       var line=srfResponse[i].geom;
       var style=JSON.parse(srfResponse[i].lineStyle);
       var m=new OpenLayers.Feature.Vector(new OpenLayers.Geometry.fromWKT(line),style);
      features.push(m);
     }
  }
  for (var i=0 ; i<response.srf[1].results.length; i++){
    var v = new OpenLayers.Geometry.fromWKT(response.srf[1].results[i].geom);
    var style = JSON.parse(response.srf[1].results[i].style);
   response.srf[1].results[i].style= style;
    var p = new OpenLayers.Feature.Vector(v,response.srf[1].results[i]);
    features.push(p);
  }
  pfLayer.layer.addFeatures(features);
  for (var i=0 ; i<response.srf[2].results.length; ++i){
    if (typeof(response.srf[2].results[i].geom)!='undefined'){
      var w = new OpenLayers.Geometry.fromWKT(response.srf[2].results[i].geom);
      var x=new OpenLayers.Feature.Vector(w,response.srf[2].results[i]);
      featuresPolygon.push(x);
     }
  }
  var featuresClickable=[]
  for (var i=0;i<response.srf[3].results.length;i++){
      vidteq.mboxObj.createPfClickableMarkers(response.srf[3].results[i]);
      var v = new OpenLayers.Geometry.fromWKT(response.srf[3].results[i].geom);
      var style = JSON.parse(response.srf[3].results[i].style);
   response.srf[3].results[i].style= style;
      var p = new OpenLayers.Feature.Vector(v,response.srf[3].results[i]);
    featuresClickable.push(p);
  }
  pfLayer.layer.addFeatures(featuresClickable);
  pfLayer.layer.addFeatures(featuresPolygon);
  pfLayer.select = new OpenLayers.Control.SelectFeature(
    pfLayer.layer,
    { clickout:false,
       toggle:false,
       hover: true,
       highlightOnly: true
  });
  this.map.addControl(pfLayer.select);
  this.map.addLayer(pfLayer.layer);
  this.map.addLayer(pfLayer.layerPolygon)
  this.map.setLayerIndex (pfLayer.layer,2);
  this.map.setLayerIndex (pfLayer.layerPolygon,1);
  //var entity = this.gui.getEntity.apply(this.gui,['center',1]);
  var entity = this.gui.embed.place;
  //entity=this.gui.prepareCenterEntity(entity);
  var centerFeature =new OpenLayers.Feature.Vector(new OpenLayers.Geometry.fromWKT(entity.geom));
  var pfLayerExtent=pfLayer.layer.getDataExtent();
  var newExtent=vidteq.mboxObj.extendDExtentWithFeature(pfLayerExtent,centerFeature);
  vidteq.mboxObj.zoomToPfLayerExtent(newExtent);
 // vidteq.mboxObj.clearRouteAndSrf();
  //vidteq.mboxObj.zoomToPfLayerExtent(pfLayerExtent);
  //this.gui.changeBackOpacity(1);

}
vidteq.mbox.prototype.extendDExtentWithFeature =  function(extent,feature) {
  var newExtent= extent;
  if (extent.left > feature.geometry.x) {newExtent.left=feature.geometry.x}
  if (extent.right<feature.geometry.x){newExtent.right=feature.geometry.x}
  if (extent.bottom >feature.geometry.y) {newExtent.bottom=feature.geometry.y}
  if (extent.top<feature.geometry.y) {newExtent.top=feature.geometry.y}
  return newExtent;

}
//TBD: PFLayer - Proposed Feature Layer to be re-used for polygon layer
vidteq.mbox.prototype.removePfLayer = function  () {
  var matchLayer=/LandMarkLayer/gi;
  var whichLayer= this.map.getLayersByName(matchLayer);//returns an array of layers.
  for (var i=0 ; whichLayer[i]; i++){
    whichLayer[i].removeFeatures(whichLayer[i].features);
    this.map.removeLayer(whichLayer[i]);
    whichLayer[i]=null;
   }
   //TBD: PFLayer - Proposed Feature Layer to be re-used for polygon layer
  this.pfLayerMarkers.clearMarkers();
}

//TBD: PFLayer - Proposed Feature Layer to be re-used for polygon layer
vidteq.mbox.prototype.createPfClickableMarkers = function (response) {
  var lonLat = vidteq.mboxObj.lonLatObjFrmPoint(response.geom);
  var size;
  if (response.size){  size = new OpenLayers.Size(response.size,response.size);}
  else{ size=new OpenLayers.Size(25,25);}
  //var offset = new OpenLayers.Pixel(-(size.w/2), -size.h);
  iconImage= vidteq.cfg.imageLogosLoc+""+response.icon;
  icon =   new OpenLayers.Icon(iconImage,size);
  var marker = new OpenLayers.Marker(new OpenLayers.LonLat(lonLat.lon,lonLat.lat),icon);

  //marker.content=vidteq.mboxObj.prepareContent4PfLayerClickable(response);
  marker.content="<div class='cat_button' style='margin-top:5px;margin-left:4px;width:190px;height:140px;border-style:solid;border-width:1px;text-align:center'>";
  marker.content+="<div style='width:186px;background-color:#CCFFFF;margin-top:2px;margin-left:2px'><b>"+response.name+"</b></div>";
  marker.content+= "<br><div style:'font-size=10px'>"+response.description+"</div>";
  //response.distance="5km";
  var response1= JSON.parse(response.style);
  //if (parseInt(response1.giveDistance)){
       marker.content+="<div style='position:absolute;bottom:10px;left:20px;text-align:left'><b> Approx. Distance From Project: </b>"+response.distance+"KM</div>";
  //}
  marker.content+="</div>"
  //marker.size=marker.content.size;
  //m.events.register("mouseover",m,function () {vidteq.mboxObj.popupBiasWfsLayer.apply(vidteq.mboxObj,[]);})
  marker.events.register("mouseover",marker,vidteq.mboxObj.popupBiasWfsLayer);
  marker.events.register("mouseout",marker,function () { vidteq.mboxObj.map.removePopup(vidteq.mboxObj.biasPopup)});
  marker.size= new OpenLayers.Size(200,145);
  //marker.events.register('mousedown', marker, function(evt) {  OpenLayers.Event.stop(evt); });
  //marker.evernts.register('loadstart',marker.functio(evt) {vidteq.mboxObj.addOrRemovepfMarker(evt);OpenLayers.Even.stop(evt);})
  //marker.setOpacity(.9);
  this.pfLayerMarkers.addMarker(marker);
  //this.map.addLayer(pfLayerMarkers);
}

//TBD: PFLayer - Proposed Feature Layer to be re-used for polygon layer
vidteq.mbox.prototype.prepareContent4PfLayerClickable =function (response){
  var htmlContent;
  htmlContent= "<div id='pfClickable'> ";
  htmlContent+=  "<div  oncontextmenu='return false;style='height=30px;>"+response.name+"</div>";
  htmlContent+= "<div id= 'pfDesc'>"+response.description+"</div>";
  htmlContent.size= new OpenLayers.Size (300,300);
  return htmlContent;
}

//TBD: PFLayer - Proposed Feature Layer to be re-used for polygon layer
vidteq.mbox.prototype.addOrRemovepfMarker = function (evt) {
  zoom =vidteq.mboxObj.getCurrentZoom();
  if (zoom < 4){
    var matchCat=/pfLayerMarker/gi;
    var whichLayer= this.map.getLayersByName(matchCat);
    whichLayer.removeFeature(whichlayer.features) ;
  }
  //else {vidteq.mboxObj.createPfClickableMarkers;}
}

vidteq.mbox.prototype.checkAndAddLengends = function () {
  if(typeof(vidteq.aD) != 'undefined' &&
     typeof(vidteq.aD.config) != 'undefined' &&
     typeof(vidteq.aD.config.legendContainerHtml) != 'undefined' &&
     vidteq.aD.config.legendContainerHtml != '') {
    var d = "";
    d = vidteq.aD.config.legendContainerHtml;
    //d = d.replace(/CUST_LOGO_URL/gi,vidteq.cfg.cloneImageUrl);
    d = d.replace(/CUST_LOGO_URL/gi,vidteq.cfg.imageLogosLoc+vidteq.aD.urlId+"/legend/");
    return d;
  }
  return "";
}

vidteq.mbox.prototype.changeMapBaseLayer = function (whichCity) {
  var mapOptions = {
    resolutions: vidteq.cfg.resolutions.split(','),
    maxExtent:new OpenLayers.Bounds.fromString(vidteq.cfg.maxExtent),
    restrictedExtent:new OpenLayers.Bounds.fromString(vidteq.cfg.maxExtent),
    fallThrough:true,
    transitionEffect:'map-resize',
    //zoomDuration:100,
    //zoomMethod:OpenLayers.Easing.Quad.easeOut,
    controls: []
  }
  this.map.setOptions(mapOptions);
  var innerAttribution = this.checkAndAddLengends();
  this.baseLayer = new OpenLayers.Layer.WMS(vidteq.cfg.tilecacheBaseLayer,
     vidteq.cfg.tilecacheBaseUrl,
    { layers: vidteq.cfg.tilecacheBaseLayer, format: 'image/png' },
    {  attribution: '<div><a style=text-decoration:none;height:40px;width:80px;border:0px solid black; title="Visit www.VidTeq.com for detailed video maps." target=_blank style=cursor:pointer href="http://www.vidteq.com" ><img src="'+vidteq.imgPath.vidteqMapLogo+'"; class=pngfixclass; height=40px; width=80px; style=border:0px solid black;text-decoration:none;height:40px;width:80px;background-color:transparent; /></a></div>'+innerAttribution,
       transitionEffect: 'resize',
       buffer: 0
    }
  );
  this.map.addLayer(this.baseLayer);
  this.map.setBaseLayer(this.baseLayer);
  this.map.removeLayer(this.earlierBaseLayer);
  this.map.setLayerIndex (this.baseLayer,1);
  this.map.zoomToExtent(new OpenLayers.Bounds.fromString(vidteq.cfg.maxExtent),false);
  if(vidteq.urlid != 'Prestige_Group' && vidteq.urlid != 'Prestige_Portfolio') {
    this.map.setCenter(new OpenLayers.LonLat(vidteq.cfg.centerLon,vidteq.cfg.centerLat),vidteq.cfg.topZoom);
  //if(this.gui.wap && vidteq.cfg.city != vidteq.mobUI.myLocCity){
  //  this.plotCar(vidteq.cfg.centerLon,vidteq.cfg.centerLat);
  //}
  }
}

vidteq.mbox.prototype.changeCity= function (whichCity){
  this.clearAll();
  this.earlierBaseLayer = this.baseLayer;
  this.changeMapBaseLayer(whichCity);
}

vidteq.mbox.prototype.prepareLightpullReqObj =function () {
  var mapImageObject={};
  var lastOne = this.carPathArray[this.carPathArray.length-1];
  mapImageObject.route={'startGeom':"POINT("+this.carPathArray[0][0]+")",
                        'endGeom':"POINT("+lastOne[lastOne.length-1]+")"};
  mapImageObject.proximity=[];
  for(var i in this.syncMapPoints) {
    var a={};
    var cur = this.carPathArray[parseInt(this.syncMapPoints[i])][0];
    a.geom="POINT("+cur+")";
    a.icon={"name":(i+1)+".png","size":16};
    mapImageObject.proximity.push(a);
  }
  return mapImageObject;
}

vidteq.mbox.prototype.getFeatureFromCluster =function (index) {
  var featureArray = this.catMngr.layer.features;
  var feature;
  for (var i in featureArray) {
    if (featureArray[i].cluster) {
      for (var j in featureArray[i].cluster) {
        if (featureArray[i].cluster[j].data.lpIndex == index) {
          feature = featureArray[i];
          break;
        }
      }
      if(feature) {break;}
    } else if (featureArray[i].data.lpIndex == index) {
      feature = featureArray[i];
      break;
    }
  }
  return feature;
}

///// new Popup

vidteq.mbox.prototype.getMouseOverThumbNail =function () {
  $('#yo').css('opacity','0.4');
  //$('#spanName').css('display','block');
  //$('#spanName').animate({
  //    width:'toggle'
  //  },'slow',function(){
  //    //that.flag = 0;
  //    //$('#spanName').show();
  //    //$('#disDir').show();
      $('#spanName').css('display','block');
  //  });

}

vidteq.mbox.prototype.getMouseOutThumbNail =function () {
  //$('#spanName').css('display','none');
  //$('#spanName').animate({
  //  width:'toggle'
  //},'slow',function(){
  //  //that.flag = 1;
    $('#spanName').css('display','none');
  //  //$('#spanName').hide();
  //});

  $('#yo').css('opacity','1');
}

vidteq.mbox.prototype.getNewThumbNail =function () {
  var divsize= $("#spanName").css("width");
  var integerDivSize= divsize.replace(/px$/, '');
  var that = this;
  if(this.flag == 1){
    $('#spanName').css('z-index','1500');
    $('#spanName').animate({
      width:'toggle'
    },'slow',function(){
      that.flag = 0;
      $('#spanName').show();
      $('#disDir').show();
    });
  } else {
    vidteq.mboxObj.enNewlargeThumbNail();
  }
}

vidteq.mbox.prototype.enNewlargeThumbNail =function () {
  var that = this;
  $('#disDir').hide();
  $('#spanName').animate({
    width:'toggle'
  },'slow',function(){
    that.flag = 1;
    $('#spanName').hide();
  });
}

vidteq.mbox.prototype.addNewLandMarkPopup = function (evt) {
  var f=evt.feature;
  if(typeof(f.data.baseurl) != 'undefined'
     && f.data.description == ''
     && f.data.baseurl != ''
     && typeof(vidteq.vistaMode)!= 'undefined'
     && vidteq.vistaMode) {
    this.universalSelect.unselectAll();
    var urlId = f.data.baseurl;
    var func = 'invokeVidteqPopup_'+urlId;
    $.postMessage(func+'()', vidteq.parentUrl );
    return;
  }
  var divsize= f.attributes.description;
  //var width = 320+30;
  //var height = 240+30;
  if (!f.data.description) { return; }
  var htmlContent={};
  htmlContent.content= this.substituteDescriptionVariables(f.data);
var divh = $('#myid').innerHeight();
  if (!f.data.description || vidteq.utils.trim(f.data.description) == '') { return; }
  //htmlContent.size=new OpenLayers.Size (width+"px",height+"px");
  //htmlContent.size=new OpenLayers.Size ('auto','auto');
  //if(vidteq.urlid == 'Prestige_Group' || vidteq.urlid == 'Prestige_Portfolio' ) {
  if('vistaManner' in vidteq && (vidteq.vistaManner.mapView || vidteq.vistaManner.portFolio)) {
    this.openLandMarkPopup = new OpenLayers.Popup.FramedCloud("landMarkPopupNew", new OpenLayers.LonLat(f.geometry.x,f.geometry.y),null,htmlContent.content,null,false);

  } else {
    this.openLandMarkPopup=new OpenLayers.Popup.Anchored("landMarkPopupNew",
      new OpenLayers.LonLat(f.geometry.x,f.geometry.y),
      //htmlContent.size,
      null,
      htmlContent.content,null,true
    );
  }
  this.map.addPopup(this.openLandMarkPopup);
  //this.openLandMarkPopup.autoSize = true;
  this.openLandMarkPopup.setOpacity(1);
  this.openLandMarkPopup.setBackgroundColor('transparent');
  $('#landMarkPopupNew_contentDiv').css('overflow','hidden');
  this.openLandMarkPopup.panMapIfOutOfView = true;
  this.openLandMarkPopup.updateSize();
  $('#landMarkPopupNew_close').css('z-index','3000');
  $('#landMarkPopupNew_close').css('top','0px');
  if (self.navigator.userAgent.match(/MSIE/)){
    $('#landMarkPopupNew_close').css('right','18px');
  } else {
    $('#landMarkPopupNew_close').css('right','36px');
  }
  var that = this;
  $('#landMarkPopupNew_close').click(function(evt){
    that.removeOpenLandMarkPopup(evt,this);
    //var prevFeature = that.map.layers[2].selectedFeatures[0].data;

    //that.map.layers[2].selectedFeatures[0].destroy();
    //that.openLandMarkPopup.destroy();
    //var v = new OpenLayers.Geometry.fromWKT(prevFeature.geom);
    //var pFeature = new OpenLayers.Feature.Vector(v,prevFeature);
    //that.map.layers[2].addFeatures(pFeature);
  });
}

vidteq.mbox.prototype.fromToFunction = function (tip) {
  // This is not the way to take feature data TBD
  if(typeof(this.layerName) == 'undefined') {
    this.layerName = this.map.getLayersByName(this.landmarkLayerName)[0];
  }
  //var featureData = this.map.layers[2].selectedFeatures[0].data;
  var featureData = this.layerName.selectedFeatures[0].data;
  var geom = featureData.geom;
  if(tip == 'end'){
    if(featureData.togeom){
      geom = featureData.togeom;
    }
  } else if(tip == 'start'){
    if(featureData.fromgeom){
      geom = featureData.fromgeom;
    }
  }
  if (this.gui) {
    var curEntity = {
      //geom:featureData.geom,
      geom:geom,
      index:1,
      //lonlat:this.lonLatObjFrmPoint(featureData.geom),
      lonlat:this.lonLatObjFrmPoint(geom),
      address:{
        name:featureData.name
      }
    };
    if( typeof(this.gui.nemo)!=="undefined" && this.gui.nemo ) {
      this.gui.getDirections({
        //TBD why the curEntity has index as 1 hardcoded, may be can created different entity to pass
        entity: {
          geom: geom
          ,index: typeof(featureData.index)!=="undefined"? featureData.index : 1
          //lonlat:this.lonLatObjFrmPoint(featureData.geom),
          ,lonlat: this.lonLatObjFrmPoint(geom)
          ,address: {
            name: featureData.name
          }
        }
        ,type: "locations"
        ,tip: tip
      });
      return false;
    }
    this.gui.routeEnds.removeAllVias();
    this.gui.dirFromTo(tip,curEntity);
    this.gui.io.goVid();
  } else {
    ioAreaObj.genericEntity = [{},{
      geom:featureData.geom,
      index:1,
      lonlat:this.lonLatObjFrmPoint(featureData.geom),
      address:{
        name:featureData.name
      }
    }];
    // TBD via clearing ?
    ioAreaObj.dirFromTo(tip,1,'genericEntity');
    ioAreaObj.goVid();
  }
  //this.swaprouteTo(featureData);
}

vidteq.mbox.prototype.toFunction = function () {
  this.fromToFunction('end');
}

//vidteq.mbox.prototype.toFunction = function () {
//  var featureData = this.map.layers[2].selectedFeatures[0].data;
//  ioAreaObj.genericEntity = [{},{
//    geom:featureData.geom,
//    index:1,
//    lonlat:this.lonLatObjFrmPoint(featureData.geom),
//    address:{
//      name:featureData.name
//    }
//  }];
//  ioAreaObj.dirFromTo('end',1,'genericEntity');
//  ioAreaObj.goVid();
//  //this.swaprouteTo(featureData);
//}

vidteq.mbox.prototype.fromFunction = function () {
  this.fromToFunction('start');
}

//vidteq.mbox.prototype.fromFunction = function () {
//  var featureData = this.map.layers[2].selectedFeatures[0].data;
//  ioAreaObj.genericEntity = [{},{
//    geom:featureData.geom,
//    index:1,
//    lonlat:this.lonLatObjFrmPoint(featureData.geom),
//    address:{
//      name:featureData.name
//    }
//  }];
//  ioAreaObj.dirFromTo('start',1,'genericEntity');
//  ioAreaObj.goVid();
//  //this.swaprouteFrom(featureData);
//}

//vidteq.mbox.prototype.swaprouteTo = function(featureData) {
//  debugPrint("inside the to ..");
//  featureData.lonlat = this.lonLatObjFrmPoint(featureData.geom);
//  this.addRcmStartOrEndMarker('end',featureData.lonlat);
//  debugPrint("marker placed - now go vid ..");
//  if (ioAreaObj.embed) { ioAreaObj.goVid(); }
//
//  //if($('#starttextbox').css('font-weight') != 'bold'){
//  //  var startAddress = document.GetVal.start.value;
//  //  var endAddress = document.GetVal.end.value;
//  //
//  //  $('#starttextbox').css('font-weight','normal');
//  //  $('#endtextbox').css('font-weight','normal');
//  //  document.GetVal.start.value=document.GetVal.end.value;
//  //  document.GetVal.end.value=startAddress;
//  //  $('#starttextbox').css('font-weight','bold');
//  //}
//  //vidteq.routeEndsObj.replaceEntity('end',feature);
//}

//vidteq.mbox.prototype.swaprouteFrom = function(featureData) {
//  debugPrint("inside the from ..");
//  featureData.lonlat = this.lonLatObjFrmPoint(featureData.geom);
//  this.addRcmStartOrEndMarker('start',featureData.lonlat);
//  debugPrint("marker placed - now go vid ..");
//  if (ioAreaObj.embed) { ioAreaObj.goVid(); }
//
//
//  //if($('#endtextbox').css('font-weight') != 'bold'){
//  //  var startAddress = document.GetVal.start.value;
//  //  var endAddress = document.GetVal.end.value;
//  //
//  //  $('#starttextbox').css('font-weight','normal');
//  //  $('#endtextbox').css('font-weight','normal');
//  //  document.GetVal.end.value = document.GetVal.start.value;
//  //  document.GetVal.start.value = endAddress;
//  //  $('#endtextbox').css('font-weight','bold');
//  //}
//  //vidteq.routeEndsObj.replaceEntity('start',feature);
//}

vidteq.mbox.prototype.getBackThumbNailPopup1 =function (width,height) {
  var divsize= $("#popupImage").css("width");

  var integerDivSize= divsize.replace(/px$/, '');

  var that = this;
  if (integerDivSize > 80){

   $("#yo").animate({width:"80px",height:"80px",left:"0px",right:"10px"},200);
   $("#popupImage").animate({width:"80px",height:"80px",right:"0px",top:"2px"},200,function(){
     $("#yo").css('margin-right','5px');
     $("#yo").css('margin-top','5px');
     $("#yo").css('top','30px');
     $("#headerSpan").show();
     $("#spanName").show();
   });
  } else {
    that.enlargeThumbNailPopup1(width, height);
  }
}
vidteq.mbox.prototype.enlargeThumbNailPopup1 =function (width,height) {

  var myIEWidth= 320;
  var myFFWidth=320;
  var myIEHeight=240;
  var myFFHeight=240;
  $("#headerSpan").hide();
  $("#spanName").hide();
  if (self.navigator.userAgent.match(/MSIE/)){
    $("#yo").animate({width:myIEWidth+"px",height:myIEHeight+"px",top:'0px',left:"0px",right:"10px"},200);
    $("#popupImage").animate({width:myIEWidth+"px",height:myIEHeight+"px",left:"2px",right:"10px"},200,function(){
       $("#yo").css('margin-right','0px'); $("#yo").css('margin-top','0px'); $("#yo").css('top','0px'); });
  } else {
    $("#yo").animate({width:myFFWidth+"px",height:myFFHeight+"px",left:"0px",right:"10px"},200);
    $("#popupImage").animate({width:myFFWidth+"px",height:myFFHeight+"px",left:"2px",right:"10px"},200,function(){
       $("#yo").css('margin-right','0px'); $("#yo").css('margin-top','0px'); $("#yo").css('top','0px'); });
  }
}

vidteq.mbox.prototype.getlP = function (lonLat) {
  var dragLon=lonLat.x;
  var dragLat=lonLat.y;
  var lPIRef; var lD;
  for(var i in this.carPathArray) {
    var ll=this.carPathArray[i][0].split(" ");
    var dist = this.computeDistance(parseFloat(dragLon),parseFloat(dragLat),parseFloat(ll[0]),parseFloat(ll[1]));
    if (i == 0 || dist < lD) { lPIRef = parseInt(i); lD = dist; }
  }
  var lCI = 0;
  var lPI = lPIRef;
  for(var i=Math.max(0,lPIRef-1);i<=Math.min(lPIRef+1,this.carPathArray.length-1);i++) {
    var onePath = this.carPathArray[i];
    for(var j in onePath) {
      var ll=onePath[j].split(" ");
      var dist = this.computeDistance(parseFloat(dragLon),parseFloat(dragLat),parseFloat(ll[0]),parseFloat(ll[1]));
      if (dist < lD) { lPI = i; lCI = j; lD = dist; }
    }
  }
  return {lPI:lPI,lCI:lCI};
}

vidteq.mbox.prototype.slideShow = function(cssSelector, transitionType, speed) {
  $(cssSelector).cycle({
    fx: transitionType
  });
}

vidteq.mbox.prototype.getCircleStyle = function() {
  var circleStyle = OpenLayers.Util.extend({}, this.decoStyle);
  circleStyle.strokeColor = "#00a2ff";
  circleStyle.fillColor = "#00a2ff";
  circleStyle.graphicName = "circle";
  circleStyle.pointRadius = 14;
  circleStyle.strokeWidth = 2;
  circleStyle.rotation = 45;
  circleStyle.fillOpacity = 0.2,
  circleStyle.strokeLinecap = "butt";
  circleStyle.graphicYOffset = 22;
  circleStyle.graphicXOffset = -12;
  return circleStyle;
}

vidteq.mbox.prototype.addRedRing = function(evt,shortPop) {
  var yoffset= parseFloat(50*this.map.getResolution()) + parseFloat(evt.feature.geometry.y);
  this.map.setCenter(new OpenLayers.LonLat(evt.feature.geometry.x,yoffset), 2);
  /* * Red style */
  var circleStyle=this.getCircleStyle();
  if(!shortPop){
    var point = new OpenLayers.Geometry.Point(evt.feature.geometry.x,evt.feature.geometry.y);
    if(this.decoFeature) this.decoLayer.removeFeatures([this.decoFeature]);
    this.decoFeature = new OpenLayers.Feature.Vector(point,null,circleStyle);
    this.decoLayer.addFeatures([this.decoFeature]);
  }
}

//vidteq.mbox.prototype.pushControlsDown = function () {
//  if (this.maxView) { return; }
//  //var wH = vidteq.utils.getHandheldWAndH();
//  //var h=0.8*wH.h;
//  //var ct=$('.olControlZoomPanel').css('top');
//  //var nt=parseInt(ct)+parseInt(h)+10;
//  //$('.olControlZoomPanel').css('top',nt+'px');
//  //ct=$('#mainMenu').css('top');
//  //nt=parseInt(ct)+parseInt(h)+10;
//  //$('#mainMenu').css('top',nt+'px');
//  //var tt=$('#text_holder').css('top');
//  //tt=parseInt(tt)+parseInt(h)+10;
//  //$('#text_holder').css('top',tt+'px');
//  this.maxView=true;
//}

//vidteq.mbox.prototype.pushControlsUp = function () {
//  if (!this.maxView) { return; }
//  this.maxView=false;
//  $('#minimizeLink').hide();
////var wH = vidteq.utils.getHandheldWAndH();
////var h=0.8*wH.h;
////var ct=$('.olControlZoomPanel').css('top');
////var nt=parseInt(ct)-parseInt(h)-10;
////$('.olControlZoomPanel').css('top',nt+'px');
////ct=$('#mainMenu').css('top');
////nt=parseInt(ct)-parseInt(h)-10;
////$('#mainMenu').css('top',nt+'px');
////var tt=$('#text_holder').css('top');
////tt=parseInt(tt)-parseInt(h)-10;
////$('#text_holder').css('top',tt+'px');
//}

//vidteq.mbox.prototype.rangeCrossed = function (lon,lat) {
//  //var radius = parseFloat(vidteq.gL.calcD(lat,lon,this.decoLayer.startLat,this.decoLayer.startLon));
//  var radius = vidteq.utils.getDist(lat,lon,this.decoLayer.startLat,this.decoLayer.startLon)/1000;
//  if(radius > 0.300)  //TBD range to be passed as parameter?
//    return true;
//  else
//    return false;
//}

//vidteq.mbox.prototype.doLmrSearch = function (lon,lat) {
//  var check = this.rangeCrossed(lon, lat);
//  if (!check) {
//    this.decoLayer.posFlag = true;
//    return;
//  }
//  this.decoLayer.posFlag = false;
//  this.findHood(lon, lat);
//}

//vidteq.mbox.prototype.findHood = function (lon, lat) {
//  var data2Send={
//    action:"findhood",
//    city:vidteq.cfg.city,
//    point: lon + ' ' + lat
//  };
//  var that = this;
//  globalAjaxObj=$.ajax({
//    url:vidteq.cfg.magicHappensUrl,
//    data:data2Send,
//    dataType:'text/plain',
//    success:function (response) {
//      that.findHoodResponse(response,lon,lat);
//    },
//    error:function (response) { debugPrint(response); }
//  });
//}

//vidteq.mbox.prototype.findHoodResponse = function (response,lon,lat) {
//  var rname = JSON.parse(response);
//  rname = rname.roadname;
//  if (rname)
//    vidteq.gL.infoPop(lon,lat,rname);
//}

vidteq.mbox.prototype.purgeNotInView = function () {
  var that = this;
  var remove =[];
  $.each(vidteq.gL.poiArray,function(i,v){
  //console.log(v.onScreen());
    if(!v.onScreen()){
      that.decoLayer.removeFeatures([v]);
      remove.push(i);
    }
  });
  while(remove.length)
    vidteq.gL.poiArray.splice(remove.pop(),1);
  that.decoLayer.refresh();
}

//vidteq.mbox.prototype.showDirectionsPopup= function (index,lon,lat) {
//  if(this.openPopup) {
//    this.map.removePopup(this.openPopup);
//    delete this.openPopup;
//  }
//  var text=vidteq.gL.captions[index];
//  this.openPopup = new OpenLayers.Popup.FramedCloud("infoPop", new OpenLayers.LonLat(parseFloat(lon)+parseFloat(0.0005),parseFloat(lat)+parseFloat(0.001)),new OpenLayers.Size(130,60),text,null,false);
//  vidteq.mboxObj.map.addPopup(this.openPopup);
//  setTimeout(function(){
//      vidteq.mboxObj.map.removePopup(vidteq.mboxObj.openPopup);
//  },3000);
//}

vidteq.mbox.prototype.getAngle  = function (lon1, lat1, lon2, lat2) {
  //var m = (parseFloat(lat2) - parseFloat(lat1))/ (parseFloat(lon2)- parseFloat(lon1)) ;
  var dLat = (parseFloat(lat2) - parseFloat(lat1));
  var dLon = (parseFloat(lon2)- parseFloat(lon1));
  if (Math.abs(dLon) < 0.000000001 || Math.abs(dLat) < 0.000000001) { // some small value
    return NaN;
  }
  var angle = Math.atan2(
    (parseFloat(lat2) - parseFloat(lat1))
    ,(parseFloat(lon2)- parseFloat(lon1))
  ) * 180/Math.PI;
  var m = angle;
  if(m<0)
    m = -90.0 - m;
  else
    m = 90.0 - m;
  if(lon2 < lon1)
    m +=180;
  return m;
}

vidteq.mbox.prototype.centerMap = function () {
  var yOffset = this.carPoint.geometry.y;
  this.map.zoomTo(4);
  var offset=parseFloat(vidteq.utils.getScreenHeight()*0.2*this.map.getResolution());
  if(this.maxView || this.gui.text_shown )
    yOffset = offset + parseFloat(this.carPoint.geometry.y);

  var x = new OpenLayers.LonLat(this.carPoint.geometry.x ,yOffset);
  this.map.setCenter(x,4);
}

vidteq.mbox.prototype.redRingAnime = function(lon,lat) {
  /* * Red style */
  var circleStyle = OpenLayers.Util.extend({}, this.decoStyle);
  circleStyle.strokeColor = "red";
  circleStyle.fillColor = "red";
  circleStyle.graphicName = "circle";
  circleStyle.pointRadius = 100;
  circleStyle.strokeWidth = 3;
  circleStyle.rotation = 45;
  circleStyle.fillOpacity=0.2;
  circleStyle.strokeLinecap = "butt";
  var point = new OpenLayers.Geometry.Point(lon,lat);
  if(this.decoFeature) this.decoLayer.removeFeatures([this.decoFeature]);
  this.decoFeature = new OpenLayers.Feature.Vector(point,null,circleStyle);
  this.decoLayer.addFeatures([this.decoFeature]);
  this.animeCount=0;
  var that = this;
  this.animeInterval=setInterval(function(){
    var f=that.decoLayer.features[0];
    that.animeCount+=2;
    f.style.pointRadius=f.style.pointRadius/that.animeCount;
    if(that.animeCount==20) clearInterval(that.animeInterval);
  },200);
}

vidteq.mbox.prototype.centerOnProject = function () {
  var halves = vidteq.aD.places.center.entity.geom.split(' ');
  var lon=parseFloat(halves[0].slice(6));
  var lat=parseFloat(halves[1]);
  var x =  new OpenLayers.LonLat(lon,lat);
  this.map.setCenter(x,4);
}

vidteq.mbox.prototype.clearNbb = function() {
  if (this.pointFeature) {
    this.decoLayer.removeFeatures([this.pointFeature]);
  }
  if (this.lineFeature) {
    this.lineVector.removeFeatures(this.lineFeature);
  }
  if (this.locatorPointLayer.features.length) {
     this.locatorPointLayer.removeFeatures(this.locatorPointLayer.features);
  }
}

vidteq.mbox.prototype.showNbbOnMap = function(res) {
  if (this.locatorPointLayer.features.length) this.locatorPointLayer.removeFeatures(this.locatorPointLayer.features);
  var features= [];
  if (this.srfBound == null) { this.srfBound = new OpenLayers.Bounds(); }
  for(var i in res){
    var entity = res[i];
    entity.index=i;
    var v = new OpenLayers.Geometry.fromWKT(entity.geom);
    var pFeature = new OpenLayers.Feature.Vector(v,entity);
    var pObj=this.lonLatObjFrmPoint(entity.geom);
    this.srfBound.extend(new OpenLayers.LonLat(pObj.lon,pObj.lat));
    this.locatorPoint[entity.lpIndex]=pFeature;
    this.locatorPoint[entity.lpIndex].entity = entity;
    features.push(pFeature);
  }
  this.locatorPointLayer.addFeatures(features);
}

vidteq.mbox.prototype.drawLine = function(sLon,sLat,eLon,eLat) {
  var sp= new OpenLayers.Geometry.Point(sLon,sLat);
  var ep= new OpenLayers.Geometry.Point(eLon,eLat);
  if(this.lineFeature) this.lineVector.removeFeatures(this.lineFeature);
  this.lineFeature=new OpenLayers.Feature.Vector(new OpenLayers.Geometry.LineString([sp,ep]))
  this.lineVector.addFeatures([this.lineFeature]);
}

vidteq.mbox.prototype.animateSrf = function(p1,p2,dist,callbackToast) {
  this.srfBound = new OpenLayers.Bounds();
  this.srfBound.extend(new OpenLayers.LonLat(p1.lon,p1.lat));
  var offset = parseFloat(200*this.map.getResolution());
  var yOffset = offset + parseFloat(p2.lat);
  this.srfBound.extend(new OpenLayers.LonLat(p2.lon,yOffset));
  var circleStyle = OpenLayers.Util.extend({}, this.decoStyle);
  circleStyle.strokeColor = "red";
  circleStyle.fillColor = "red";
  circleStyle.graphicName = "circle";
  circleStyle.pointRadius = 20;
  circleStyle.strokeWidth = 3;
  circleStyle.fillOpacity = 0.2,
  circleStyle.graphicXOffset = -10,
  circleStyle.graphicYOffset = -10,
  circleStyle.rotation = 45;
  circleStyle.strokeLinecap = "butt";
  var point = new OpenLayers.Geometry.Point(p1.lon,p1.lat);
  if (this.pointFeature) {
    this.decoLayer.removeFeatures([this.pointFeature]);
  }
  this.pointFeature = new OpenLayers.Feature.Vector(point,null,circleStyle);
  this.decoLayer.addFeatures([this.pointFeature]);
  this.drawLine(p2.lon,p2.lat,p1.lon,p1.lat);
  var dist = dist || vidteq.utils.getDist(p1,p2,true);
  vidteq.mobUI.disablePan();
  var midLon = (parseFloat(p1.lon) + parseFloat(p2.lon)) /2;
  var midLat = (parseFloat(p1.lat) + parseFloat(p2.lat)) /2;
  var center = new OpenLayers.LonLat(midLon,midLat);
  this.doAptZoomCenter(dist,center);
  //this.changeMapView(this.srfBound,center,undefined);
  if (callbackToast) {
    setTimeout(function () { callbackToast(dist,center); },1000);
  }
}

//vidteq.mbox.prototype.animateSrfOld = function(point,index,evisit) {
//  var lon=point.lon;
//  var lat=point.lat;
//  //if (this.srfBound == null) { this.srfBound = new OpenLayers.Bounds(); }
//  this.srfBound = new OpenLayers.Bounds();
//  var offset=parseFloat(200*this.map.getResolution());
//  if(evisit){
//    var p=this.lonLatObjFrmPoint(vidteq.projectCenter.entity.geom);
//    yOffset = offset + parseFloat(p.lat);
//    this.srfBound.extend(new OpenLayers.LonLat(p.lon,yOffset));
//  } else {
//    yOffset = offset + parseFloat(vidteq.gL.lat);
//    this.srfBound.extend(new OpenLayers.LonLat(vidteq.gL.lon,yOffset));
//  }
//  this.srfBound.extend(new OpenLayers.LonLat(lon,lat));
//  var x= this.map.getExtent();
//  var targetZoom = this.map.getZoomForExtent(this.srfBound);
//  var center = new OpenLayers.LonLat(vidteq.gL.lon,vidteq.gL.lat);
//  if(evisit){
//    var p=this.lonLatObjFrmPoint(vidteq.projectCenter.entity.geom);
//    var center = new OpenLayers.LonLat(p.lon,p.lat);
//  }
//
//  var circleStyle = OpenLayers.Util.extend({}, this.decoStyle);
//  circleStyle.strokeColor = "red";
//  circleStyle.fillColor = "red";
//  circleStyle.graphicName = "circle";
//  circleStyle.pointRadius = 20;
//  circleStyle.strokeWidth = 3;
//  circleStyle.fillOpacity = 0.2,
//  circleStyle.graphicXOffset = -10,
//  circleStyle.graphicYOffset = -10,
//  circleStyle.rotation = 45;
//  circleStyle.strokeLinecap = "butt";
//  var point = new OpenLayers.Geometry.Point(lon,lat);
//  if (this.pointFeature) {
//    this.decoLayer.removeFeatures([this.pointFeature]);
//  }
//  this.pointFeature = new OpenLayers.Feature.Vector(point,null,circleStyle);
//  this.decoLayer.addFeatures([this.pointFeature]);
//  if(evisit){
//    var p=this.lonLatObjFrmPoint(vidteq.projectCenter.entity.geom);
//    this.drawLine(p.lon,p.lat,lon,lat);
//  } else
//    this.drawLine(vidteq.gL.lon,vidteq.gL.lat,lon,lat);
//
//  var dist=$('#nbbDist_'+index).html();
//  vidteq.mobUI.disablePan();
//  var midLon=(parseFloat(vidteq.gL.lon) + parseFloat(lon)) /2;
//  var midLat=(parseFloat(vidteq.gL.lat) + parseFloat(lat)) /2;
//  if(evisit) {
//    var midLon=(parseFloat(p.lon) + parseFloat(lon)) /2;
//    var midLat=(parseFloat(p.lat) + parseFloat(lat)) /2;
//  }
//  var center = new OpenLayers.LonLat(midLon,midLat);
//  this.doAptZoomCenter(dist,center);
//  //this.changeMapView(this.srfBound,center,undefined);
//  setTimeout(function(){vidteq.mobUI.toastAnimate(dist,center,null);},1000);
////if(this.distPop) this.map.removePopup(this.distPop);
////  this.distPop = new OpenLayers.Popup.FramedCloud(
////       "popup",
////        new OpenLayers.LonLat(midLon,midLat),
////        new OpenLayers.Size(100,80),
////        dist,
////        null,                                                                     false
////  );
////  vidteq.mboxObj.map.addPopup(this.distPop);
////  setTimeout(function(){vidteq.mboxObj.map.removePopup(vidteq.mboxObj.distPop);},2000);
//}

vidteq.mbox.prototype.centerOnVideo = function() {
  var x = new OpenLayers.LonLat(this.vidLon, this.vidLat);
  this.map.panTo(x);
}

//vidteq.mbox.prototype.createDistances = function(response) {
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

vidteq.mbox.prototype.distanceToDestination = function (vidIndex) {
  if(vidIndex==0) return;
  var d= this.allLimits[vidIndex-1];
  var distance='<b>'+d.toFixed(2)+' Kms</b>';
  $('#distanceLeft').html(distance);
}

vidteq.mbox.prototype.addEmbedEnity = function( entity ) {
  var features = []
  ,v = new OpenLayers.Geometry.fromWKT( entity.geom )
  ,pFeature = new OpenLayers.Feature.Vector( v, entity );

  features.push ( pFeature );
  this.startEndMarkLayer.addFeatures( features );
}

vidteq.mbox.prototype.addUniversalSelectToLayer = function( options ) {
  var layer = options.layer
  ,tooltipSelect = options.tooltipSelect
  ,tooltipUnselect = options.tooltipUnselect
  ,onFeatureSelect = options.onFeatureSelect
  ,onFeatureUnselect = options.onFeatureUnselect
  ,hover = options.hover
  ,select = options.select
  ,scope = options.scope
  ,isSelectAdded = false;

  if( hover ) {
    if( tooltipSelect ) {
      layer.events.on({
        "featurehighlighted": function() {
          //this refers to OpenLayers instance
            tooltipSelect.apply( scope || this, Array.prototype.slice.call( arguments ) );
          }
      });
    }
    if( tooltipUnselect ) {
      layer.events.on({
        "featureunhighlighted": function() {
          //this refers to OpenLayers instance
          tooltipUnselect.apply( scope || this, Array.prototype.slice.call( arguments ) );
        }
      });
    }
    if( tooltipSelect || tooltipUnselect ) {
      isSelectAdded = true;
    }
  }

  if( select ) {
    if( onFeatureSelect ) {
      layer.events.on({
        "featureselected": function() {
          //this refers to OpenLayers instance
          onFeatureSelect.apply( scope || this, Array.prototype.slice.call( arguments ) );
        }
      });
    }
    if( onFeatureUnselect ) {
      layer.events.on({
        "featureunselected": function() {
          //this refers to OpenLayers instance
          onFeatureUnselect.apply( scope || this, Array.prototype.slice.call( arguments ) );
        }
      });
    }
    if( onFeatureSelect || onFeatureUnselect ) {
      isSelectAdded = true;
    }
  }

  if( isSelectAdded ) {
    var layersExisting = this.universalSelect.layers;
    layersExisting.push(layer);
    this.universalSelect.setLayer(layersExisting);
    return true;
  }else{
    return false;
  }
}

vidteq.mbox.prototype.clearAllPopups = function() {
  while( this.map.popups.length ) {
    this.map.removePopup(this.map.popups[0]);
  }
}

vidteq.mbox.prototype.blackOutKIV = function() {
  //if(this.kIVBlackOut) {
  //  this.kIVBlackOut = false;
  //  if(this.blackOutTimer) clearTimeout(this.blackOutTimer);
  //} else {
    if (this.blackOutTimer){
      clearTimeout(this.blackOutTimer);
    }
    //this.mbox.panAble=false;
    this.kIVBlackOut = true;
    var that = this;
    this.blackOutTimer = setTimeout(function(){
      //this.mbox.panAble=true;
      that.kIVBlackOut = false;
    },10000);
  //}
  if(typeof(vidteq.navigate) !='undefined' && vidteq.navigate.routeActive){}
  else{
    this.gpsCenterDisable=true;
    if(this.gpsCenterTimer) clearTimeout(this.gpsCenterTimer);
    var that=this;
    this.gpsCenterTimer = setTimeout(function(){
      that.gpsCenterDisable=false;
    },1*60*1000);

  }
}

vidteq.mbox.prototype.alterKIVState = function(what) {
  this.kIV = this.kIV || {
    gps:true
    ,video:false
    ,center:false
  };
  //TBD-why was video true?//
  //if (!('kIVStateGps' in this)) { this.kIVStateGps = true; }
  //if (!('kIVStateVideo' in this)) { this.kIVStateVideo = true; }
  //if (!('kIVStateCenter' in this)) { this.kIVStateCenter = false; }
  if (!('kIVBlackOut' in this)) { this.kIVBlackOut = false; }
  //if(this.gL && this.gL.diffStart) {
  //  this.kIVStateGps = false;
  //  this.kIVStateVideo = true;
  //  if( what=='video'){
  //    if(!vidteq.mobUI.keepInView) {
  //      this.kIVStateVideo = false;
  //    }
  //  }
  //  return;
  //}
  if ('gps' in what) {
    this.kIV.gps = what.gps;
    //if (this.panAble && !this.gL.videoPlaying &&
    //    window.location.hash!='#directionsDiv') {
    //  this.kIVStateGps = true;
    //}
    //if(vidteq.eVisit) { }
    //if (vidteq.mobUI.embed) {
    //  this.kIVStateGps = false;
    //}
  }
  if ((this.gui && this.gui.embed) ||
      (vidteq.mobUI && vidteq.mobUI.embed)) {
    this.kIV.center = true;
  }
  if ('video' in what) {
    this.kIV.video = what.video;
    //if (vidteq.mobUI.keepInView) {
    //  this.kIVStateVideo = true;
    //}
  }
  // temp
  //this.kIVStateGps = true;
  //this.kIVStateVideo = true;
}

vidteq.mbox.prototype.keepInView = function(pos,what) {   
  //if (!vidteq.mobUI.keepInView) { return; } // temporary TBD till we understand
  if (!this.kIV) { // just for init case
    var opt = {}; opt[what] = true;
    this.alterKIVState(opt);
  }
  //var pos = {lon:lon,lat:lat};
  if (what == 'gps') { this.kIVPosGps = pos; }
  if (what == 'video') { this.kIVPosVideo = pos; }
  if (this.kIVBlackOut) { return; }
  var vBound = this.map.getExtent().scale(0.8);
  var within = vBound.containsLonLat(pos);
  if (within) { return; }
  var vCenter = vBound.getCenterLonLat();
  var newCenter = {
    lon:(vCenter.lon - (vCenter.lon-pos.lon)*0.3).toFixed(6)
    ,lat:(vCenter.lat - (vCenter.lat-pos.lat)*0.3).toFixed(6)
  }
  if (this.kIV.video && !this.kIV.gps && what == 'video') {
    this.changeMapView(undefined,newCenter);
  }
  if (!this.kIV.video && this.kIV.gps && what == 'gps') {
    this.map.zoomTo(4);
    this.changeMapView(undefined,pos);
  }
  if (this.kIV.video && this.kIV.gps) {
    var bound = new OpenLayers.Bounds();    //and gps location in view
    bound.extend(new OpenLayers.LonLat(pos.lon,pos.lat));
    var other = null;
    if (what == 'gps') {
      if (this.kIVPosVideo) { other = this.kIVPosVideo; }
    } else if (what == 'video') {
      if (this.kIVPosGps) { other = this.kIVPosGps; }
    }
    var mid = null;
    if (other) {
      bound.extend(new OpenLayers.LonLat(other.lon,other.lat));
      var mid = {
        lon: (parseFloat(other.lon) + parseFloat(pos.lon)) /2
        ,lat: (parseFloat(other.lat) + parseFloat(pos.lat)) /2
      };
      // TBD we can use getCenterLonLat
      this.changeMapView(bound,mid,{shrink:20});
    } else {
      this.changeMapView(undefined,newCenter);
    }
  }
  if (this.carMarkLayer) {
    this.carMarkLayer.redraw();
    this.carMarkLayer.refresh();
  }
}

//vidteq.mbox.prototype.keepInView = function(lon,lat,what) {
//  if(!vidteq.mobUI.keepInView) return; // not fully understood TBD
//  if(vidteq.gL.diffStart)
//    if( what=='video'){
//      if(!vidteq.mobUI.keepInView) return;
//      var loc = new OpenLayers.LonLat(lon,lat);
//      this.map.panTo(loc);
//      return;
//    } else return;
//  if(what=='gps'){                                //this loop
//    if(vidteq.eVisit) return;
//    if(this.panAble && !vidteq.gL.videoPlaying){         //keeps the gps
//      if (window.location.hash=='#directionsDiv') return;
//      var x = new OpenLayers.LonLat(lon,lat);     //location in view
//      this.map.panTo(x);
//    }
//  } else {                                        //this loop keeps
//    //if(this.panAble && vidteq.mobUI.keepInView){                             //both the video
//    if(vidteq.mobUI.keepInView){                             //both the video
//      this.srfBound = new OpenLayers.Bounds();    //and gps location in view
//      var offset=parseFloat(40*this.map.getResolution());
//      if(vidteq.gL.lon > lon) {
//        if(vidteq.gL.lat > lat) {
//          this.srfBound.extend(new OpenLayers.LonLat(vidteq.gL.lon+offset,vidteq.gL.lat+offset));
//          this.srfBound.extend(new OpenLayers.LonLat(lon-offset,lat-offset));
//        } else {
//          this.srfBound.extend(new OpenLayers.LonLat(vidteq.gL.lon+offset,vidteq.gL.lat-offset));
//          this.srfBound.extend(new OpenLayers.LonLat(lon-offset,lat+offset));
//        }
//      } else {
//        if(vidteq.gL.lat > lat) {
//          this.srfBound.extend(new OpenLayers.LonLat(vidteq.gL.lon-offset,vidteq.gL.lat+offset));
//          this.srfBound.extend(new OpenLayers.LonLat(lon+offset,lat-offset));
//        } else {
//          this.srfBound.extend(new OpenLayers.LonLat(vidteq.gL.lon-offset,vidteq.gL.lat-offset));
//          this.srfBound.extend(new OpenLayers.LonLat(lon+offset,lat+offset));
//        }
//      }
//      var midLon=(parseFloat(vidteq.gL.lon) + parseFloat(lon)) /2;
//      var midLat=(parseFloat(vidteq.gL.lat) + parseFloat(lat)) /2;
//      //the mid doesn't gets affected by the offset//
//      var center = new OpenLayers.LonLat(midLon,midLat);
//
//      // this.mapCenterOffset = 0;  //TBD not sure needed
//      this.changeMapView(this.srfBound,center,undefined);
//    }
//  }
//}

vidteq.mbox.prototype.splitWktFunc = function() {
  var temp=vidteq.gL.response.edge.wkt.replace(/MULTILINESTRING\(\(/,"");
  temp=temp.replace(/\)\)/,"");
  var pt=temp.split(",");
  this.splitWkt=pt;
}

vidteq.mbox.prototype.nearestWkt = function(carLon,carLat) {
  return;
  var temp,lon1,lat1,lon2,lat2,d1,d2,multi,lonLat;
  multi="MULTILINESTRING((";
  for(var i in this.splitWkt) {
    temp=this.splitWkt[i].split(" ");
    lon1=temp[0];
    lat1=temp[1];
    var l=parseInt(parseInt(i)+1)
    temp=this.splitWkt[l].split(" ");
    lon2=temp[0];
    lat2=temp[1];
    if(lon1==lon2 && lat1==lat2) continue;
    //d1=vidteq.gL.calcD(carLon,carLat,lon1,lat1);
    //d2=vidteq.gL.calcD(carLon,carLat,lon2,lat2);
    d1=vidteq.utils.getDist(carLon,carLat,lon1,lat1)/1000;
    d2=vidteq.utils.getDist(carLon,carLat,lon2,lat2)/1000;
    if(d2<d1) {
      continue;
    } else {
      for(var k=0;k<=i;k++) {
        if(k<i){
          lonLat=this.splitWkt[k];
          multi+=lonLat+',';
        } else{
          lonLat=this.splitWkt[k];
          multi+=lonLat+'))';
        }
      }
      var wktParent = new Object();
      wktParent.wkt=multi;
      this.writeWkt(this.outRoute,wktParent);
      break;
    }
  }
}

vidteq.mbox.prototype.clearNavSrf = function() {
  if(this.outRoute.features.length) this.outRoute.removeFeatures(this.outRoute.features);
  this.addDelSE();
  this.clearNbb();
}

vidteq.mbox.prototype.doAptZoomCenter = function(d,center,embed){  //gives an apt zoom level for a particular distance on the map
  var dist=parseFloat(d)/1000;
  var zoom;
  switch(true){
    case (dist < 0.2):zoom=8;break;
    case (dist >= 0.2 && dist <0.35):zoom=7;break;
    case (dist >= 0.35 && dist < 0.75):zoom=6;break;
    case (dist >= 0.75 && dist < 1.5):zoom=5;break;
    case (dist >= 1.5 && dist < 3.0):zoom=4;break;
    case (dist >= 3.0 && dist < 6.0):zoom=3;break;
    case (dist >= 6.0 && dist < 12.0):zoom=2;break;
    case (dist >= 12.0):zoom=1;break;
  }
  if(zoom!=2)zoom-=2;
  this.map.zoomTo(zoom);
  if (embed) this.map.setCenter(center);
  else this.map.panTo(center);
}

vidteq.mbox.prototype.drawLineAndShow = function(lon1,lat1,lon2,lat2){
  this.drawLine(lon1,lat1,lon2,lat2);
  //var d=vidteq.gL.calcD(lon1,lat1,lon2,lat2);
  var d=vidteq.utils.getDist(lon1,lat1,lon2,lat2);
  d=Math.ceil(d+0.5);
  var midLon=(parseFloat(lon1) + parseFloat(lon2)) /2;
  var midLat=(parseFloat(lat1) + parseFloat(lat2)) /2;
  var center = new OpenLayers.LonLat(midLon,midLat);
  this.doAptZoomCenter(d,center,true);
  vidteq.mobUI.toastAnimate(d,center,true);
}

vidteq.mbox.prototype.doZoomOut = function(curZoom){
  if (curZoom == 0 && vidteq.mobUI.lastPos) {
    var here = vidteq.mobUI.lastPos;
    //var loc = new OpenLayers.LonLat(vidteq.gL.lon , vidteq.gL.lat);
    var loc = new OpenLayers.LonLat(here.lon,here.lat);
    this.map.panTo(loc);
    vidteq.mobUI.toastAnimate(null,null,null);
    var that = this;
    setTimeout(function(){
      var p=that.lonLatObjFrmPoint(vidteq.projectCenter.entity.geom);
      //that.drawLineAndShow(vidteq.gL.lon,vidteq.gL.lat,p.lon,p.lat);
      that.drawLineAndShow(here.lon,here.lat,p.lon,p.lat);
    //setTimeout(function(){
    //  var l=vidteq.wwidth/2 - 50;
    //  $('#naviGate').css('left',l);
    //  $('#naviGate').show();
    //  $('#naviGate').animate({
    //    bottom:0
    //  },2000,function(){
    //  });

    //},1000);
    },2000);
    return;
  }
  this.map.zoomTo(curZoom-1);
  if (!this.map.zoom) { return; }
  var that=this;
  setTimeout(function(){that.doZoomOut(that.map.zoom)},300);;
}

vidteq.mbox.prototype.toastCenter = function(center){
  if(this.pCentered) return;
  this.pCentered=true;
  var pStyle = OpenLayers.Util.extend({}, this.startEndStyle);
  pStyle.externalGraphic = vidteq.cfg.imageLogosLoc+center.icon.name;
  pStyle.graphicWidth = 64;
  pStyle.graphicHeight = 64;
  pStyle.graphicXOffset = -32;
  pStyle.graphicYOffset = -32;
  var p=this.lonLatObjFrmPoint(center.geom);
  var point = new OpenLayers.Geometry.Point(p.lon,p.lat);
  if(this.projFeature) this.decoLayer.removeFeatures([this.projFeature]);
  this.projFeature = new OpenLayers.Feature.Vector(point,center,pStyle);
  this.startEndMarkLayer.addFeatures([this.projFeature]);
  var loc = new OpenLayers.LonLat(p.lon , p.lat);
  this.map.setCenter(loc,4);
  var that=this;
  setTimeout(function(){ that.doZoomOut(that.map.zoom); },4000);
}

vidteq.mbox.prototype.dropLiftPin= function (what,lon,lat){
  if (what=='drop') {
    //var result='{"srf":[{"results":[{"geom":"POINT('+lon+' '+lat+')"}]}]}';
    var result='[{"geom":"POINT('+lon+' '+lat+')"}]'; // Funky ?
    result=JSON.parse(result);
    this.showNbbOnMap(result);
  } else {
    if (this.locatorPointLayer.features.length) this.locatorPointLayer.removeFeatures(this.locatorPointLayer.features);
  }
}

vidteq.mbox.prototype.showNewSearchResults = function(mstring,locate,multiple,fromto){
  $('#resultsdivIntro').hide();
  this.catHandlerEnabled = false;
  if(typeof(mstring.srf[0].catHandler) != 'undefined' && mstring.srf[0].catHandler) {
    this.catHandlerEnabled = true;
  }
  if(mstring.srf[0].results.length <1){
    this.gui.fvt.noResults();
    return;
  }
  function create2d(rows){
    var arr = [];
    for (var i=0;i<rows;i++) {
      arr[i] = [];
    }
    return arr;
  }
  //clearTimeout(vidteq.step);
  var v=mstring;
  var results=v.srf[0].results;
  var features = [];
  var featuresOff = [];
  var nameArray=Array();
  var centArray=Array();
  var name='';
  if(v.type=='area' || v.type=='areaname'){
    this.clearMapMarkers();
    var strData=create2d(results.length);
    for ( var i in results) {
      if(i==0) {
        features.push(new OpenLayers.Feature.Vector( new OpenLayers.Geometry.fromWKT(results[i].realgeom)));
        features[i].attributes={name:results[i].name};
        name=results[i].name;
      } else {
        featuresOff.push(new OpenLayers.Feature.Vector(new OpenLayers.Geometry.fromWKT(results[i].realgeom)));
      }
      nameArray.push(results[i].name);
      centArray.push(results[i].geom);
      strData[i].push(results[i].realgeom);
      var entity=results[i];
      var v = new OpenLayers.Geometry.fromWKT(entity.realgeom);
      var pFeature = new OpenLayers.Feature.Vector(v,entity);
      this.locatorPoint[i]=pFeature;
      this.locatorPoint[i].entity = entity;
    }
    this.pArea.addFeatures(features);
    this.poffArea.addFeatures(featuresOff);
    if(typeof(results)=='object'){
      if(results.length >= 1)
      var x=this.lonLatObjFrmPoint(results[0].geom);
      this.map.setCenter(new OpenLayers.LonLat(x.lon,x.lat), 2);
    }

    this.gui.fvt.showSearchArea(results,strData,centArray);
    var that=this;
    $('.focusArea').click(function(){
      var x=that.lonLatObjFrmPoint($(this).attr('value'));
      that.map.setCenter(new OpenLayers.LonLat(x.lon,x.lat), 3);
    });
    $('.resultDivParent').hover(function(){
      if(typeof(that.catMngr) != 'undefined' && that.catMngr){
        that.catMngr.removeOpenCatPopup();
      }
      $('td.resultDiv').removeClass('selected');
      $(this).find('.resultDiv').addClass('selected');
      var areaName=$(this).find('.resultDiv h2').html();
      var x=that.lonLatObjFrmPoint($(this).find('.resultDiv').attr('value'));
      //that.map.setCenter(new OpenLayers.LonLat(x.lon,x.lat), 3);
      that.pArea.removeFeatures(that.pArea.features);
      that.poffArea.removeFeatures(that.poffArea.features);
      var index=$(this).find('.resultDiv').attr('id');
      var data=$('#resultsdiv').data('data');
      var features = [];
      var featuresOff = [];
      if(!that.checkInView(parseFloat(x.lon),parseFloat(x.lat))){
        that.map.zoomTo(1);
        that.map.panTo(new OpenLayers.LonLat(x.lon,x.lat));
      }

      for(var i in data.strings){
        if(i==index){
          for(var k in data.strings[i]){
            features.push(new OpenLayers.Feature.Vector( new OpenLayers.Geometry.fromWKT(data.strings[i][k])));
            features[k].attributes={name:areaName};
          }
        } else {
          for(var k in data.strings[i]){
            featuresOff.push(new OpenLayers.Feature.Vector( new OpenLayers.Geometry.fromWKT(data.strings[i][k])));
          }
        }
      }
      that.pArea.addFeatures(features);
      that.poffArea.addFeatures(featuresOff);
    });
    $('.resultDiv').click(function(){
      var x=that.lonLatObjFrmPoint($(this).attr('value'));
      that.map.panTo(new OpenLayers.LonLat(x.lon,x.lat));
      setTimeout(function(){
        that.map.zoomTo(3);
        },1000);
    });
  } else if(v.type=='road') {
    this.clearMapMarkers();
    var that=this;
    for ( var i in results) {
      if(results[i].name==name || i==0){
        features.push(new OpenLayers.Feature.Vector(new OpenLayers.Geometry.fromWKT(results[i].realgeom)));
        name=results[i].name;
        var labelname=name;
        if(nameArray.indexOf(name) <0) {
          nameArray.push(name);
          centArray.push(results[i].center);
          //var lonlat=that.lonLatObjFrmPoint(results[0].center);
          //that.makePopup(lonlat.lon,lonlat.lat,name);
        }
        var l=features.length-1;
        features[l].attributes={label:''};
      } else{
        featuresOff.push(new OpenLayers.Feature.Vector(new OpenLayers.Geometry.fromWKT(results[i].realgeom)));
        if (nameArray.indexOf(results[i].name) <0) {
          nameArray.push(results[i].name);
          centArray.push(results[i].center);
        }
      }
    }
    var count=parseInt(features.length/2);
    features[count].attributes={label:labelname};
    this.offRoute.addFeatures(features);
    this.outRoute.addFeatures(featuresOff);

    var x=this.lonLatObjFrmPoint(results[0].center);
    this.map.setCenter(new OpenLayers.LonLat(x.lon,x.lat), 2);
    var that=this;
    var strData=create2d(nameArray.length);
    for(var i in results) {
      var index=nameArray.indexOf(results[i].name);
      strData[index].push(results[i].realgeom);
    }

    this.gui.fvt.showSearchRoad(results,strData,centArray,nameArray);
    var that=this;
    $('.resultDivParent').hover(function(){
      if(typeof(that.catMngr) != 'undefined' && that.catMngr){
        that.catMngr.removeOpenCatPopup();
      }
      $('td').removeClass('selected');
      $(this).find('.resultDiv').addClass('selected');
      var index=$(this).find('.resultDiv').attr('value');
      var data=$('#resultsdiv').data('data');
      var lonlat=data.centers[index];
      var x=that.lonLatObjFrmPoint(lonlat);
      //that.map.setCenter(new OpenLayers.LonLat(x.lon,x.lat), 3);
      that.offRoute.removeFeatures(that.offRoute.features);
      that.outRoute.removeFeatures(that.outRoute.features);
      var features = [];
      var featuresOff = [];
      for(var i in data.strings){
        if(i==index){
          for(var k in data.strings[i]){
            features.push(new OpenLayers.Feature.Vector( new OpenLayers.Geometry.fromWKT(data.strings[i][k])));
            var l=features.length-1;
            features[l].attributes={label:''};
          }
        } else {
          for(var k in data.strings[i]){
            featuresOff.push(new OpenLayers.Feature.Vector( new OpenLayers.Geometry.fromWKT(data.strings[i][k])));
          }
        }
      }
    //var count=parseInt(features.length/2);
    //features[count].attributes={label:labelname};
      var l=parseInt(features.length/2);
      features[l].attributes={label:data.names[index]};
      that.offRoute.addFeatures(features);
      that.outRoute.addFeatures(featuresOff);
      if(!that.checkInView(parseFloat(x.lon),parseFloat(x.lat))){
        that.map.zoomTo(1);
        that.map.panTo(new OpenLayers.LonLat(x.lon,x.lat));
      }
    });
    $('.resultDiv').click(function(){
      var index=$(this).attr('value');
      var data=$('#resultsdiv').data('data');
      var lonlat=data.centers[index];
      var x=that.lonLatObjFrmPoint(lonlat);
      that.map.panTo(new OpenLayers.LonLat(x.lon,x.lat));
      setTimeout(function(){
        that.map.zoomTo(3);
        },1000);
    });

  } else {
    this.gui.fvt.preparePoiShow(v,locate,multiple,fromto);
  }
}

vidteq.mbox.prototype.addPoisAndShow= function(results,locate){
  var features= [];
  var that=this;
  this.locatorPoint=[];
  var bound=new OpenLayers.Bounds();
  for(var i in results){
    var entity=results[i];
    results[i].popup=Object();
    results[i].popup.type=1;
    var v = new OpenLayers.Geometry.fromWKT(entity.geom);
    var pFeature = new OpenLayers.Feature.Vector(v,entity);
    pFeature.attributes={graphicTitle:entity.address.name};

    this.locatorPoint[i]=pFeature;
    this.locatorPoint[i].entity = entity;
    var x=that.lonLatObjFrmPoint(results[i].geom);
    if(i==0){
    //that.map.setCenter(new OpenLayers.LonLat(x.lon,x.lat), 2);
      var circleStyle=that.getCircleStyle();
      var point = new OpenLayers.Geometry.Point(x.lon,x.lat);
      that.decoLayer.removeFeatures(that.decoLayer.features);
      that.decoFeature = new OpenLayers.Feature.Vector(point,null,circleStyle);
      that.decoLayer.addFeatures([that.decoFeature]);
    }
    bound.extend(new OpenLayers.LonLat(x.lon,x.lat));
    features.push(pFeature);
  }
  if(!this.catHandlerEnabled) {
    if(!locate) {
      //this.changeMapView(bound,undefined,undefined);
      var x=this.lonLatObjFrmPoint(results[0].geom);
      this.map.setCenter(new OpenLayers.LonLat(x.lon,x.lat), 2);
    } else {
      this.map.setCenter(new OpenLayers.LonLat(x.lon, x.lat), 8);
    }
    this.locatorPointLayer.addFeatures(features);
  }
}

vidteq.mbox.prototype.mapTileLoadEnd= function(callBackFunc){
  var that = this;
  this.baseLayer.events.register("loadend", this.baseLayer, function() {
    if(typeof(callBackFunc) != 'undefined') {
      callBackFunc();
      //callBackFunc = undefined;
    }
    //that.tileLoadEnds = true;
  });
}

vidteq.mbox.prototype.showPois= function(results,multi,set,locate,multiple,fromto){
  this.addPoisAndShow(results,locate);
  this.gui.fvt.showPois(results,multi,set,locate,multiple,fromto);
  var that=this;
  this.resultDivClick = false;
  $('.resultDivParent').hover(function(){
    if(typeof(that.catMngr) != 'undefined' && that.catMngr){
      that.catMngr.removeOpenCatPopup();
    }
    $('td.resultDiv').removeClass('selected');
    $(this).find('.resultDiv').addClass('selected');
    var x=that.lonLatObjFrmPoint($(this).find('.resultDiv').attr('value'));
    var circleStyle=that.getCircleStyle();
    var point = new OpenLayers.Geometry.Point(x.lon,x.lat);
    if(typeof(that.catClusterPoint) != 'undefined') { delete that.catClusterPoint; }
    if(that.catHandlerEnabled) {
      if(typeof(that.catMngr) != 'undefined'
            && typeof(that.catMngr.layer) != 'undefined'
            && that.catMngr.layer.features) {
        for(var fea = 0;fea < that.catMngr.layer.features.length;fea++){
          if(that.catMngr.layer.features[fea].cluster) {
            for(var fCluster = 0;fCluster < that.catMngr.layer.features[fea].cluster.length;fCluster++){
              var xCl=that.lonLatObjFrmPoint(that.catMngr.layer.features[fea].cluster[fCluster].data.geom);
              if(xCl.lon == x.lon && xCl.lat == x.lat) {
                that.catClusterPoint = {x:that.catMngr.layer.features[fea].geometry.x,y:that.catMngr.layer.features[fea].geometry.y};
                point = new OpenLayers.Geometry.Point(that.catMngr.layer.features[fea].geometry.x,that.catMngr.layer.features[fea].geometry.y);
              }
            }
          }
        }
      }
    }
    that.decoLayer.removeFeatures(that.decoLayer.features);
    that.decoFeature = new OpenLayers.Feature.Vector(point,null,circleStyle);
    that.decoLayer.addFeatures([that.decoFeature]);
    if(!that.checkInView(parseFloat(x.lon),parseFloat(x.lat))){
      that.map.zoomTo(1);
      that.map.panTo(new OpenLayers.LonLat(x.lon,x.lat));
    }
    var index=$(this).attr('value');
    that.callPopupLocation(index);
    that.resultDivClick = false;
    //that.map.zoomTo(0);
  },function() {
    if(!that.resultDivClick) {
      that.removeOpenPopup();
      that.universalSelect.unselectAll();
    }
  });
  $('.fvtImgDiv img').click(function(){
    $('td').find('.resultDiv').each(function() {
      if($(this).css('background-color') == 'rgb(190, 41, 38)') {
        that.resultsOpenPopup($(this));
        return;
      }
    });
  });
  $('.resultDiv').click(function(){
    that.resultsOpenPopup($(this));
    //that.resultDivClick = true;
    //var x=that.lonLatObjFrmPoint($(this).attr('value'));
    //that.map.panTo(new OpenLayers.LonLat(x.lon,x.lat));
    //if(that.selectFeatureObj) {
    //  if(that.catHandlerEnabled) {
    //    //that.universalSelect.select(that.selectFeatureObj);
    //  } else {
    //    that.universalSelect.select(that.selectFeatureObj);
    //  }
    //}
    //setTimeout(function(){
    //  that.map.zoomTo(3);
    //  },2000);
  });
}

vidteq.mbox.prototype.resultsOpenPopup= function(domId){
  this.resultDivClick = true;
  var x=this.lonLatObjFrmPoint(domId.attr('value'));
  this.map.panTo(new OpenLayers.LonLat(x.lon,x.lat));
  if(this.selectFeatureObj) {
    if(this.catHandlerEnabled) {
      //this.universalSelect.select(this.selectFeatureObj);
    } else {
      this.universalSelect.select(this.selectFeatureObj);
    }
  }
  var that = this;
  setTimeout(function(){
    that.map.zoomTo(3);
    },2000);
}

vidteq.mbox.prototype.checkInView= function(lon,lat){
  var top=parseFloat(this.map.getExtent().top);
  var bot=parseFloat(this.map.getExtent().bottom);
  var ryt=parseFloat(this.map.getExtent().right);
  var lft=parseFloat(this.map.getExtent().left);
  if(lon >lft && lon < ryt && lat <top && lat >bot) return true;
  return false;
}
vidteq.mbox.prototype.clearMapMarkers = function(){
  this.decoLayer.removeFeatures(this.decoLayer.features);
  this.pArea.removeFeatures(this.pArea.features);
  this.poffArea.removeFeatures(this.poffArea.features);
  this.offRoute.removeFeatures(this.offRoute.features);
  this.outRoute.removeFeatures(this.outRoute.features);
  this.locatorPointLayer.removeFeatures(this.locatorPointLayer.features);
}

vidteq.mbox.prototype.focusResult = function (index) {
  index=parseInt(index)%10;
  $('td.resultDiv').removeClass('selected');
  var div='div.resultDivParent[value='+index+']';
  $(div).find('.resultDiv').addClass('selected');
  var x=this.lonLatObjFrmPoint($(div).find('.resultDiv').attr('value'));
  var circleStyle=this.getCircleStyle();
  var point = new OpenLayers.Geometry.Point(x.lon,x.lat);
  this.decoLayer.removeFeatures(this.decoLayer.features);
  this.decoFeature = new OpenLayers.Feature.Vector(point,null,circleStyle);
  this.decoLayer.addFeatures([this.decoFeature]);
  if(!this.checkInView(parseFloat(x.lon),parseFloat(x.lat))){
    this.map.zoomTo(1);
    this.map.panTo(new OpenLayers.LonLat(x.lon,x.lat));
  }
  document.getElementsByClassName('resultDivParent')[index].scrollIntoView();
}

vidteq.mbox.prototype.makePopup = function (lon,lat,text) {
  if(this.mypopup) this.map.removePopup(this.mypopup);
  var lonlat=new OpenLayers.LonLat(lon,lat);
  var html = "<a style='font-size:10px;'>"+text+"</a>";
  this.mypopup = new OpenLayers.Popup("iconPopUp",
      lonlat,
      new OpenLayers.Size(10,10),
      html,
      null,
      true
   );
  this.mypopup.setBackgroundColor("white");
  this.mypopup.setBorder("0.5px solid grey");
  this.mypopup.panMapIfOutOfView = true;
  this.mypopup.contentDiv.style.overflow =  'hidden';
  this.mypopup.autoSize = true;
  this.map.addPopup(this.mypopup);
  $('.olPopup').css('border-radius','10px');
  $('.olPopup').css('text-align','center');
  $('.olPopupContent').css('height','auto');
  $('.olPopup').css('height','auto');
  var that=this;
  setTimeout(function(){ that.map.removePopup(that.mypopup)},5000);
}

vidteq.mbox.prototype.addWFSLayer = function( options ) {
  options = options || {};
    //if ( OpenLayers.Protocol.myWFS ) { }
  if ( OpenLayers.Protocol.myScript ) {
    this.wfsLayer = new OpenLayers.Layer.Vector("WFS",{
      styleMap: new OpenLayers.StyleMap({
        "default" : this.wfsStyle,
        "select" : this.wfsSelectStyle
      })
      ,strategies:[new OpenLayers.Strategy.myBBOX({
        resFactor:1,vidteqSwitch:true
      })]
      ,protocol:new OpenLayers.Protocol.myScript({
        url:vidteq.cfg.tilecachePoi
        ,format: new OpenLayers.Format.GeoJSON()
        ,params: {
          action:'getPoisAsWfs'
         ,city:vidteq.cfg.city
         ,mbox:this
        }
        ,filterToParams: function (filter, params) {
          var bounds = JSON.stringify({
            resolution: params.mbox.map.getResolution(),
            left: filter.value.left,
            right: filter.value.right,
            top: filter.value.top,
            bottom: filter.value.bottom
          });
          params.bounds = bounds;
          return params;
        }
      })

      //protocol:new OpenLayers.Protocol.myWFS({
      //  url:vidteq.cfg.tilecachePoi,
      //  featureType:"vidteqFeatures",
      //  readFormat: new OpenLayers.Format.GeoJSON(),
      //  outputFormat:"json"
      //})
    });
    this.map.addLayer(this.wfsLayer);
    var that = this;
    var cleanHoverPopupsOnWFS = function () {
      if (!this.hoverPopups) this.hoverPopups = [];
      while (this.hoverPopups.length > 0) {
        this.hoverPopups.pop().destroy();
      }
    };
    var unselectHoverOnWFS = function (event) {
      var feature = event.feature;
      //called when WFS popup unselected
      cleanHoverPopupsOnWFS.call( this );
      if(!this.gui.nemo) {
        //$('#'+this.mapDom)[0].title='Right Click on Map for more options'
        $('#'+this.mapDom)[0].title = this.mapTitle;
      }
    };
    var selecHoverOnWFS = function (event) {
      var feature = event.feature;
      cleanHoverPopupsOnWFS.call( this );
      //var offsetWidth = ( (document || {}).body || {} ).offsetWidth;
      //if( offsetWidth && offsetWidth < 701 ) { return; }
      var threeSixty = "";
      var fontSize = 10;
      if(feature.data.ccclx) {        
        threeSixty += "Click to see 360 view for ";
        if (feature.data.address.name.length>20) threeSixty = threeSixty+"<br>";
        fontSize = 14;
        if (vidteq.vistaManner && vidteq.vistaManner.selfieLink) { 
          threeSixty = "";
          fontSize = 10; 
        }
      }

      if( this.gui && this.gui.getRouteWKT && typeof this.gui.getRouteWKT === 'function' ) {
        this.gui.getRouteWKT( feature.data.geom.replace(/[^\s\d.]/g,'') );
      }

      var html = "<a style='font-size:"+fontSize+"px;'>"+threeSixty+feature.data.address.name+"</a>";
      var popup = new OpenLayers.Popup("iconPopUp",
        feature.geometry.getBounds().getCenterLonLat(),
        new OpenLayers.Size(10,10),
        html,
        null,
        true
      );
      popup.setBackgroundColor("white");
      popup.setBorder("0.5px solid grey");
      if (vidteq.vistaManner && vidteq.vistaManner.selfieLink) { 
        popup.panMapIfOutOfView = false;
      } else {     
        popup.panMapIfOutOfView = true;
      }
      popup.contentDiv.style.overflow =  'hidden';
      //popup.contentDiv.style.padding = '3px';
      //popup.contentDiv.style.margin = '2';
      popup.autoSize = true;
      this.hoverPopups.push(popup);
      this.map.addPopup(popup);
      $('#iconPopUp.olPopup').css('border-radius','10px');
      $('#iconPopUp.olPopup').css('text-align','left');
      $('#iconPopUp_contentDiv.olPopupContent').css('height','auto');
      if (!self.navigator.userAgent.match(/MSIE\s[7]/)){
        $('#iconPopUp_contentDiv.olPopupContent').css('width','auto');
      }
      $('#iconPopUp_contentDiv.olPopupContent').css('white-space', 'nowrap');
      $('#iconPopUp.olPopup').css('height','auto');
      if (!self.navigator.userAgent.match(/MSIE\s[7]/)){
        $('#iconPopUp.olPopup').css('width','auto');
      }

      $("#"+popup.contentDiv.id).effect("bounce", { times:5 }, 100);

      $('#'+this.mapDom)[0].title='';
      //$('#iconPopUp_close').css('visibility','hidden');
      //$('#iconPopUp').hide();
      //$('#iconPopUp').show("slow",function(){});

    };
    /*if(!this.gui.wap){
      this.wfsLayer.events.on({"featureselected": function (evt) {
        if(evt.feature.data.ccclx) {
          var url = "/360/?city="+vidteq.cfg.city+"&firstTimeRule="+evt.feature.data.ccclx+"&name="+evt.feature.data.address.name;
          window.open(url);
        }
      }});
    }*/
    var featureSelectOnWFS = function(evt) {
      if(evt.feature.data.ccclx) {
        var url = "/360/?city="+vidteq.cfg.city+"&firstTimeRule="+evt.feature.data.ccclx+"&name="+evt.feature.data.address.name;
        if (vidteq.vistaManner && vidteq.vistaManner.selfieLink) {
          window.open(url);
          return;
        }
        var offsetWidth = ( (document || {}).body || {} ).offsetWidth;
        if( offsetWidth && offsetWidth < 701 ) {
          var firstTimeRule = JSON.parse( evt.feature.data.ccclx );
          firstTimeRule['venue'] = 1;
          var that = this;
          var closeFs = function() {
            that.map3dCloseAnimation({
              onAnimation:function( T, i, mbox, param ) {
                var gui = mbox.gui;
                var venue360UI = gui.venue360UI? gui.venue360UI : gui[ gui.manner ].venue360UI;
                var popupContact2 = venue360UI.getPopup2Id();
                $("#"+popupContact2).css({ "opacity":i/T });
              }
              ,afterAnimation:function( mbox, param ) {
                var gui = mbox.gui;
                var venue360UI = gui.venue360UI? gui.venue360UI : gui[ gui.manner ].venue360UI;
                venue360UI.venue360.cleanUpTheScene();
                var popupContact2 = venue360UI.getPopup2Id();
                $("#"+popupContact2).remove();
                mbox.map.updateSize();
              }
            });
          };

          this.map3dOpenAnimation({
            beforeAnimation:function(mbox,params) {
              console.log("before Animation");
              vidteq.load.module( {}, '360', function( options, scope ) {
                //console.log("trying to load....... module_"+behaveAs);
                if( vidteq.Degree360 && vidteq._venue360UI && vidteq._venue360 ) {
                  var firstTimeRule = (options || {}).firstTimeRule;
                  var ftShow = (options || {}).ftShow;
                  var nemoUI = new vidteq.Degree360( options );
                  return true;
                }
              }, params, vidteq );
            }
            ,params:{
              uiwidget: this.gui
              ,firstTimeRule: firstTimeRule
              ,ftShow: firstTimeRule.venueAutoShow
              ,name: evt.feature.data.address.name
              ,closeFs: closeFs
              ,url: url
              ,urlid: "Vidteq_India"
            }
            ,onAnimation:function(T,i,mbox,params) {
              console.log("On Animation");
            }
            ,afterAnimation:function(mbox,params) {
            }
          });

        }else {
          window.open(url);
        }
      }
    };
    /*var featureUnselectOnWFS = function(evt) {
      if(evt.feature.data.ccclx) {
        this.map3dCloseAnimation({
          params:{"example":"example"}
          ,onAnimation:function(T,i,mbox,params) {}
          ,afterAnimation:function( mbox, params ) {}
        });
      }
    };*/
    this.addUniversalSelectToLayer({
      layer: this.wfsLayer
      ,tooltipSelect: selecHoverOnWFS
      ,tooltipUnselect: unselectHoverOnWFS
      ,onFeatureSelect: featureSelectOnWFS
      //,onFeatureUnselect: featureUnselectOnWFS
      ,hover: true
      ,select: true
      ,scope: this
    });
  }
}

vidteq.mbox.prototype.map3dOpenAnimation = function( options ) {
  //animate 3D map - opening
  options = options || {};

  var beforeAnimation = options.beforeAnimation
  ,onAnimation = options.onAnimation
  ,afterAnimation = options.afterAnimation
  ,el_map = options.el_map || $("#map")
  ,params = options.params
  ,mbox = this;

  if( beforeAnimation && typeof beforeAnimation === "function" ) {
    beforeAnimation( mbox, params );
  }

  function tick(i,x){
    i = i+x;
    return i;
  }
  var i = 2,T=1000/10,d=45,x=2;
  var animTimeout=0;
  var done = false;
  function map3dCssStyle(){
    var el_mapParent = el_map.parent();
    el_mapParent.css({
      "transform-style":"preserve-3d"
      ,"perspective":"500px"
      ,"perspective-origin":"50% 70%"
      ,"-webkit-perspective":"all 2s ease-in-out"
      ,"-moz-transition":"all 2s ease-in-out"
      ,"-o-transition":"all 2s ease-in-out"
      ,"transition":"all 2s ease-in-out"
    });
  }

  function animation(){
    var time = Date.now();
    i = tick(i,x);
    var s = 1 + Math.abs( 1 - (i*0.05) );

    if( onAnimation && typeof onAnimation === "function" ) {
      onAnimation( T, i, mbox, params );
    }
    el_map.css({
      "transform":"rotateX("+i+"deg) translate3d(0,"+-(i*4.5)+"px,0) scale3d("+s+","+s+",1)"
    });
    if( i <= d ) {
      animTimeout = setTimeout(animation, T);
      if( i > d/3 && !done ) {
        done = true;
        if( afterAnimation && typeof afterAnimation === "function" ) {
          afterAnimation( mbox, params );
        }
      }
    }else {
      el_map.attr("data-rotateX",i);
      el_map.attr("data-translate3d",-(i*4.5));
      el_map.attr("data-scale3d",s);
      clearTimeout(animTimeout);
    }
  }
  map3dCssStyle();
  animation();
}

vidteq.mbox.prototype.map3dCloseAnimation = function( options ) {
  //animate 3D map - closing
  options = options || {};

  var beforeAnimation = options.beforeAnimation
  ,onAnimation = options.onAnimation
  ,afterAnimation = options.afterAnimation
  ,el_map = options.el_map || $("#map")
  ,cb_onMap3dCloseAnimation = ( this.callback || {} ).onMap3dCloseAnimation
  ,params = options.params
  ,mbox = this;

  if( beforeAnimation && typeof beforeAnimation === "function" ) {
    beforeAnimation( mbox, params );
  }

  var T = 1000/10;
  var x=5,i=T-x,d1=1;
  var y=2,j=2,d2=45;
  var animTimeout = 0;
  function minusTick(a,b){
    a = a-b;
    return a;
  }
  function plusTick(a,b){
    a = a+b;
    return a;
  }
  el_map = el_map || $("#map");
  var rotateX = parseFloat(el_map.attr("data-rotateX"),6);
  var translate3d = parseFloat(el_map.attr("data-translate3d"),6);//-(i*4.5)
  var scale3d = parseFloat(el_map.attr("data-scale3d"),6);//(i*0.05)

  function revertMap3dCssStyle() {
    var el_mapParent = el_map.parent();
    el_mapParent.css({
      "transform-style":""
      ,"perspective":""
      ,"perspective-origin":""
      ,"-webkit-perspective":""
      ,"-moz-transition":""
      ,"-o-transition":""
      ,"transition":""
    });
  }

  function animation() {
    //var time = Date.now();
    i = minusTick(i,x);
    j = plusTick(j,y);
    var s = scale3d/(j*0.05);

    if( onAnimation && typeof onAnimation === "function" ) {
      onAnimation( T, i, mbox, params );
    }
    el_map.css({
      "transform":"rotateX("+(rotateX-j)+"deg) translate3d(0,"+(translate3d/(j*4.5))+"px,0) scale3d("+s+","+s+",1)"
    });
    if( 0 < i/T && i/T < d1 ) {
      animTimeout = setTimeout(animation, T);
    }else {
      clearTimeout(animTimeout);
      el_map.css({
        //"transform":"rotateX(0deg) translate3d(0,0,0) scale3d(1,1,1)"
        "transform":""
      });
      if( afterAnimation && typeof afterAnimation === "function" ) {
        afterAnimation( mbox, params );
      }
      if( cb_onMap3dCloseAnimation && typeof cb_onMap3dCloseAnimation === "function" ) {
        cb_onMap3dCloseAnimation( mbox, params );
      }
    }
  }
  revertMap3dCssStyle();
  animation();
}

vidteq.mbox.prototype.destroyMarkerLayer = function (layerName) {
  var map = this.map;
  var markerslayer = map.getLayersByName(layerName)[0];
  if( markerslayer ) {
    markerslayer.destroy();
  }
}

vidteq.mbox.prototype.createMarkerLayer = function (layerName) {
  var map = this.map;
  var markerslayer = map.getLayersByName(layerName)[0];
  //TBD: its too strict, but require this for now
  if( markerslayer ) {
    markerslayer.destroy();
  }
  markerslayer = new OpenLayers.Layer.Markers(layerName);
  map.addLayer(markerslayer);
  return markerslayer;
}

// This is old type plot car from Nanda -
// This has to be merged with geoLocateMboxIf
// TBD for now I am retaining it

vidteq.mbox.prototype.plotCar = function (lon,lat,accuracy,bLonLat) {
//if(!this.firstTimeCenter){
//  this.map.setCenter(new OpenLayers.LonLat(lon,lat),2);
//  this.firstTimeCenter=true;
//}
//var r;
//if (accuracy) { r = parseFloat(accuracy)*0.00001; }
//else { r = 0.001; }
//var manStyle = OpenLayers.Util.extend({}, this.layer_style);
//manStyle.externalGraphic = "images/wap/buddypin2.png";
//manStyle.graphicWidth = 52;
//manStyle.graphicHeight = 42;
//manStyle.graphicXOffset = -11;
//manStyle.graphicYOffset = -manStyle.graphicHeight;
//var point = new OpenLayers.Geometry.Point(lon,lat);
//if (this.manFeature) this.decoLayer.removeFeatures([this.manFeature]);
//this.manFeature = new OpenLayers.Feature.Vector(point,null,manStyle);
//this.decoLayer.addFeatures([this.manFeature]);
  //if(parseInt(accuracy)<10)
  //this.markerLayer.addFeatures([this.polygonFeature]);
  // TBD I just dont understand why is needed - please explain
//if (bLonLat) {
//  bLonLat=bLonLat.replace(","," ");
//  var features= [];
//  var entity={'geom':bLonLat};
//  var v = new OpenLayers.Geometry.fromWKT(entity.geom);
//  var pFeature = new OpenLayers.Feature.Vector(v,entity);
//  //var pObj=vidteq.mboxObj.lonLatObjFrmPoint(entity.geom);
//  features.push(pFeature);
//  this.locatorPointLayer.addFeatures(features);
//}
}
