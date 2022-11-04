/**
 * @summary     Evaluator
 * @description It an interface layer to interact with mbox for Nemo
 * @version     2.0.0
 * @file        nemo.evaluator.js
 * @author      Bhaskar Mangal ( bhaskar@vidteq.com )
 * @contact     www.vidteq.com
 *
 * @copyright Copyright 2015 www.vidteq.com, all rights reserved.
 */ 
(function( global,document, root ) {
  root = global[root] = ( global[root]? global[root] : {} );
  
  function Evaluator(options) {
    options = options || {};
    
    this.uiwidget = options.parent || {};
    this.imgPath = this.uiwidget._serverHostUrl? this.uiwidget._serverHostUrl+"images" : "images";
    this.theme = this.uiwidget.theme || options.theme;
    this.mbox = options.mbox || vidteq.mboxObj;
    this.manner = options.manner;
    this.layers = {};
    this.params = {};
    this.parent = null;
    this.brandContainerI = 72;
    this.length = 0;
    //return this;
  };
  
  Evaluator.prototype.getDistance = function( DD ) {
    return ( ( DD * (6378137.0*3.141) )/180.0 );
  };
  Evaluator.prototype.getRadius = function(meter) {
    return (meter*180.0/(6378137.0*3.141));
  };

  /**
   * Return the category map layer if it exists.
   *
   * @method getLayer
   * @return {Object} layer
  */
  //TBD: its wrongly written this.Layer does not exists - re-look on logic
  Evaluator.prototype.getLayer = function() {
    var layer = typeof(this.Layer)!=null?this.layer : null;
    return layer;
  }

  /**
   * It's the actual method that puts the category on map and display. It add additional features
   * like drawling a line feature to the first nearest category.
   * Any, category specific icon, title are added as attributes.
   *
   * @method showCategoryOnMap
   * @param {Object} propertyLonLat property Lon-Lat
   * @param {Object} categoryObj category object
  */
  Evaluator.prototype.showCategoryOnMap = function(propertyLonLat,categoryObj) {
    var data = categoryObj.data;
    var features=[],lineFeatures=[],d2=[],
      n=3;// for best three nearest features 
    var that = this;
    var segPoints=[];
    segPoints.push(propertyLonLat);
    for(var i=0,l=data.length; i<n; i++){
      if(typeof(data[i]) =='undefined') { continue; }
      d2[i] = data[i].distance;//data is sent using order by distance, hence in ascending order
      if('undefined' === typeof(data[i].category)){}
      var pointFeature,point,lon=0,lat=0,name='',title='',urlid='',itemId='',
        domId='',distance='',location='',areaName='',modifyControl,dragCircleLayer;
      point = new OpenLayers.Geometry.fromWKT(data[i].geom);
      pointFeature = new OpenLayers.Feature.Vector(point,data[i]);
      name = categoryObj.name;
      title = data[i].name;
      itemId = categoryObj.itemId;
      domId = categoryObj.domId;
      distance = data[i].distance;//data[i].distance.indexOf("Kms.") !== -1? data[i].distance.replace(/Kms./g,'Km') : data[i].distance.replace(/Meters./g,'m');
      
      pointFeature.attributes.name = name;
      pointFeature.attributes.title = title;
      pointFeature.attributes.id = itemId;
      pointFeature.attributes.domId = domId;
      pointFeature.attributes.distance = distance;
      pointFeature.attributes.iconSet = categoryObj.iconSet;
      pointFeature.attributes.opacity = 0.7;
      pointFeature.attributes.type = 'point';
      pointFeature.attributes.getCategoryColor = this.getCategoryColor;  
      if(i==0) {
        segPoints.push(point);
        var line,lineFeature,origin,radius,circle,circleFeature;      
        line = new OpenLayers.Geometry.LineString(segPoints);
        lineFeature = new OpenLayers.Feature.Vector(line);
        lineFeature.attributes.id = itemId;
        lineFeature.attributes.domId = domId;
        lineFeature.attributes.name = name;
        lineFeature.attributes.title = title;
        //lineFeature.attributes.distance = distance;
        lineFeature.attributes.type = 'line';
        lineFeature.attributes.getCategoryColor = this.getCategoryColor;//(categoryObj.name);
        lineFeatures.push(lineFeature);
        this.layer.addFeatures(lineFeatures);
        pointFeature.attributes.opacity = 1;
        
        origin = {x:propertyLonLat.x, y:propertyLonLat.y};
        radius = propertyLonLat.distanceTo(OpenLayers.Geometry.fromWKT(categoryObj.data[0].geom));
        circle = new OpenLayers.Geometry.Polygon.createRegularPolygon(origin,radius, 50);
        innerCircle = new OpenLayers.Geometry.Polygon.createRegularPolygon(origin,(radius-radius/36), 50);
        circleFeature = new OpenLayers.Feature.Vector(circle);
        //circleFeature.geometry.rotate(-360 / 20, origin);

        //var aCircle = OpenLayers.Geometry.Polygon.createRegularPolygon( point, 50000, 40, 0 );
        var aCirclePoint = new OpenLayers.Geometry.Collection( [ circle ] );
        var circleFeature = new OpenLayers.Feature.Vector( aCirclePoint );
        circleFeature.attributes.icon = '/img/marker.png';
        circleFeature.attributes.id = itemId;
        circleFeature.attributes.domId = domId;
        circleFeature.attributes.name = name;
        circleFeature.attributes.title = title;
        circleFeature.attributes.type = 'circle';
        circleFeature.attributes.R = radius;
        circleFeature.attributes.O = origin;
        circleFeature.attributes.getCategoryColor = this.getCategoryColor;      
       // this.layer.addFeatures([circleFeature]);
        
        //this.layer.drawFeature(circleFeature);
        if(typeof(dragCircleLayer)==="undefined") {
          dragCircleLayer = new OpenLayers.Layer.Vector('dragCircleLayer', {
              styleMap: new OpenLayers.StyleMap({
                  'default': OpenLayers.Util.applyDefaults({
                          strokeWidth: 1,
                          fillOpacity: 0,
                          graphicName: 'dragCircle'
                      }, OpenLayers.Feature.Vector.style['default']
                  )
                  ,'select': OpenLayers.Util.applyDefaults({
                          strokeWidth: 2,
                          fillOpacity: 0,
                          graphicName: 'dragCircle'
                      }, OpenLayers.Feature.Vector.style['select']
                  )
              })
          });
          this.mbox.map.addLayer(dragCircleLayer);
          modifyControl =  new OpenLayers.Control.ModifyFeature(dragCircleLayer);
          this.mbox.map.addControl(modifyControl);        
          modifyControl.mode = 0;
          modifyControl.mode |= OpenLayers.Control.ModifyFeature.RESIZE;
          //modifyControl.mode |= OpenLayers.Control.ModifyFeature.DRAG;
          modifyControl.mode |= OpenLayers.Control.ModifyFeature.DEFORM;
          modifyControl.mode |= OpenLayers.Control.ModifyFeature.DELETE;
        }
        //var dragCircleLayer = this.mbox.map.getLayersByName('dragCircleLayer')[0];
        dragCircleLayer.addFeatures( [ circleFeature ] ); 
        
          /* modifyControl =  new OpenLayers.Control.ModifyFeature(dragCircleLayer);
          this.mbox.map.addControl(modifyControl);        
          modifyControl.mode = 0;
          modifyControl.mode |= OpenLayers.Control.ModifyFeature.RESIZE;
          //modifyControl.mode |= OpenLayers.Control.ModifyFeature.DRAG;
          modifyControl.mode |= OpenLayers.Control.ModifyFeature.DEFORM;
          modifyControl.mode |= OpenLayers.Control.ModifyFeature.DELETE*/
          modifyControl.activate();
        var numOfCircles = this.layer.getFeaturesByAttribute('type','circle').length;
        var donutFeature;
        if (numOfCircles > 0 ) {
          for(var k = 0; k < numOfCircles; k++) {
            if(this.layer.getFeaturesByAttribute('type','circle')[k].R > circleFeature.attributes.R) {
              circleFeature.attributes.rank = this.layer.getFeaturesByAttribute('type','circle')[k].rank+1;
              //donutFeature = this.layer.getFeaturesByAttribute('type','circle')[k].geometry.addComponent(circleFeature.geometry.components[0]);  
            }else if (this.layer.getFeaturesByAttribute('type','circle')[k].R < circleFeature.attributes.R){
              circleFeature.attributes.rank = this.layer.getFeaturesByAttribute('type','circle')[k].rank;
              this.layer.getFeaturesByAttribute('type','circle')[k].rank = this.layer.getFeaturesByAttribute('type','circle')[k].rank-1;
              //donutFeature = circleFeature.geometry.components[0].addComponent(this.layer.getFeaturesByAttribute('type','circle')[k].geometry.components[0]);
            }else {
              circleFeature.attributes.rank = this.layer.getFeaturesByAttribute('type','circle')[k].rank;
              //donutFeature = circleFeature.geometry.components[0].addComponent(this.layer.getFeaturesByAttribute('type','circle')[k].geometry.components[0]);
            }         
          }
          for(var k = 0; k < numOfCircles; k++) {         
            if(!this.layer.getFeaturesByAttribute('type','circle')[k].geometry.addComponent(circleFeature.geometry.components[0])) {
              circleFeature.geometry.components[0].addComponent(this.layer.getFeaturesByAttribute('type','circle')[k].geometry.components[0]);
            }
          }
          //this.layer.addFeatures([donutFeature]);        
          this.layer.redraw();
        }else {
          //this.layer.addFeatures(circleFeatures);
          circleFeature.attributes.rank = 1;
        }
        
      }
      features.push(pointFeature);
    }
    this.layer.addFeatures(features);
    
    /**
     * Total number of features per category
     * = initial features + length category result + 1 (line feature per category)
     */
    this.length = this.length + features.length + lineFeatures.length;
    var layerExtent = this.layer.getDataExtent();
    var newExtent = this.mbox.map.zoomToExtent(layerExtent,false);
  }

  Evaluator.prototype.showListings = function( o, as, view ) {
    var featuresPoint= []
    ,view = view || this.uiwidget[ as ].mview
    ,data = o.data
    ,dataMap = o.listing
    ;
    
    for(var i=0,l=data.length; i<data.length; i++) {
      var d = data[i]
      ,lon = d[ dataMap["geolocation-lon"] ]
      ,lat = d[ dataMap["geolocation-lat"] ]
      ,geom = 'POINT('+lon+' '+lat+')'
      ;
      
      //data should have the keys provided by mapview api
      d.view = view;
      //console.log("evaluator: showListings: ");console.log(geom);
      var w = new OpenLayers.Geometry.fromWKT( geom );
      var x = new OpenLayers.Feature.Vector( w, d );
      featuresPoint.push( x );
    }
    //as = as || "mapview";
    var layer = this.mbox.nemoLayers[ as ][ "Mmh" ];
    layer.destroyFeatures();
    layer.addFeatures(featuresPoint);
    //var layerExtent = layer.getDataExtent();
    //this.mbox.map.zoomToExtent(layerExtent,true);
    //this.mbox.map.zoomTo(2);
    //this.mbox.map.zoomToFit({});
    layer.redraw();
    //layer.refresh();
    layer.setVisibility(true);
  }

  Evaluator.prototype.displayListings = function(as) {
    as = as || "mapview";
    this.mbox.nemoLayers[ as ][ "Mmh" ].setVisibility(true);
  }

  Evaluator.prototype.hideListings = function(as) {
    as = as || "mapview";
    this.mbox.nemoLayers[ as ][ "Mmh" ].setVisibility(false);
  }
  
  Evaluator.prototype.showAreaPolygon = function(as,data,_callback) {
    var featuresPolygon = []
      ,len = data.length
      ,i
      ;
    for(i=0; i<len; i++) {
      if( typeof(data[i].geom)!='undefined' ) {
        var w = new OpenLayers.Geometry.fromWKT(data[i].geom);
        var x = new OpenLayers.Feature.Vector(w,data[i]);
        //var x = mbox.parser.read( data[i].geom ); //TBD: should be used
        featuresPolygon.push(x);
      }
    }
    this.mbox.nemoLayers[ as ][ "PolygonArea" ].addFeatures(featuresPolygon);      
  }

  /**
   * It's the actual method that puts the category on map and display. It add additional features
   * like drawling a line feature to the first nearest category.
   * Any, category specific icon, title are added as attributes.
   *
   * @method showCategoryOnMapInOneCircle
   * @param {Object} propertyLonLat property Lon-Lat
   * @param {Object} categoryObj category object
  */
  Evaluator.prototype.showCategoryOnMapInOneCircle = function(options) {
    var as = options.manner || this.manner
    ,categoryObj = options.categoryObj
    ,catLayerName = as + '-' + categoryObj.itemId
    ,layer = this.mbox.map.getLayersByName( catLayerName )[0]
    ;
    
    if(!layer) {
      this.mbox.createNemoCategoryLayers( catLayerName, as );
      layer = this.mbox.map.getLayersByName( catLayerName )[0];
      //return false;
    }
    
    var explorationArea = this.uiwidget[this.manner].explorationArea
    ,_callback = options.callback
    ,redraw = options.redraw
    ,distanceCutOff = (function(options,explorationArea) {
      if( options.distanceCutOff ) {
        return options.distanceCutOff;
      }else if( explorationArea &&  explorationArea.distance ) {
        return parseInt(explorationArea.distance);
      }
    }(options,explorationArea))
    ,limit = (function(options,explorationArea) {
      if( options.limit ) {
        return options.limit;
      }else if( explorationArea &&  explorationArea.limit ) {
        return parseInt(explorationArea.limit);
      }
    }(options,explorationArea))
    ,LonLat = (function(options,explorationArea) {
      if( options.LonLat ) {
        return options.LonLat;
      }else if( explorationArea &&  explorationArea.geom ) {
        return new OpenLayers.Geometry.fromWKT(explorationArea.geom);
      }
    }(options,explorationArea))
    //TBD: change index for pagination
    ,data = options.data
    //,srfResponse = data
    ,dataStartIndex = categoryObj.dataStartIndex
    ,features = []
    ,lineFeatures = []
    ,n=3// for best three nearest features 
    ,segPoints=[]
    ;
    
    segPoints.push(LonLat);
    
    var that = this;
    //TBD:
    //if( redraw ) {
      layer.destroyFeatures();
    //}
    for(var i=0,onMap=0,l=data.length; i<data.length && onMap<=limit; i++){
      if(typeof(data[i]) =='undefined') { continue; }
      //d2[i] = data[i].distance;//data is sent using order by distance, hence in ascending order
      //if('undefined' === typeof(data[i].category)){}
      
      var distanceUnformatted = parseInt(data[i].distanceUnformatted)
      ,pointFeature
      ,point
      ,lon=0
      ,lat=0
      ,name=''
      ,title=''
      ,urlid=''
      ,itemId=''
      ,domId=''
      ,distance=''
      ,location=''
      ,areaName=''
      ,value=''
      ,caticon=''
      ;
      
      //required for mbox framework
      //address.name
      /*data[i].address = {
        name: data[i].name
        ,index: (categoryObj.dataStartIndex + i -1) 
      };*/
      //index
      //categoryObj.data[dataStartIndex - i + 1].index = i;
        
      point = new OpenLayers.Geometry.fromWKT(data[i].geom);
      pointFeature = new OpenLayers.Feature.Vector(point,data[i]);
      name = data[i].name;
      title = data[i].name;
      value = data[i].id;
      itemId = categoryObj.itemId;
      caticon = categoryObj.icon;
      domId = categoryObj.domId;
      distance = data[i].distance;    
      pointFeature.attributes.name = name;
      pointFeature.attributes.title = title;
      pointFeature.attributes.id = itemId;
      pointFeature.attributes.value = value;
      pointFeature.attributes.domId = domId;
      pointFeature.attributes.icon = this.imgPath+"/themes/"+this.theme+"/nemo/categories/"+caticon;
      pointFeature.attributes.opacity = 0.8;
      pointFeature.attributes.type = 'point';
      pointFeature.attributes.fn = _callback;
      pointFeature.attributes.color = categoryObj.color;
      pointFeature.attributes.distance = '';
      pointFeature.attributes.distanceLabel = distance;
      //if(i===0) {
      if(categoryObj.pageNo===1 && i===0) {
        segPoints.push(point);
        var line,lineFeature;      
        line = new OpenLayers.Geometry.LineString(segPoints);
        lineFeature = new OpenLayers.Feature.Vector(line);
        lineFeature.attributes.id = itemId;
        lineFeature.attributes.domId = domId;
        lineFeature.attributes.name = name;
        lineFeature.attributes.title = title;
        //lineFeature.attributes.distance = distance;
        lineFeature.attributes.type = 'line';
        lineFeature.attributes.color = categoryObj.color;
        if( distanceUnformatted <= distanceCutOff ) {
          lineFeatures.push(lineFeature);  
        }
        layer.addFeatures(lineFeatures);
        pointFeature.attributes.opacity = 1;
        pointFeature.attributes.distance = distance;
      }
      
      if( distanceUnformatted <= distanceCutOff ) {
        features.push(pointFeature);
        ++onMap;
      }
    }
    layer.addFeatures(features);
    //TBD:
    //if( redraw ) {
      layer.redraw();
    //}
    /**
     * Total number of features per category
     * = initial features + length category result + 1 (line feature per category)
     */
    this.length = this.length + features.length + lineFeatures.length;
    this.zoomToExtent( as );
    //this.mbox.map.zoomToExtent(layerExtent,false);
    //this.mbox.universalSelect.select(pointFeature);
  }

  Evaluator.prototype.zoomToExtent =  function( as ) {
    var layerExtent = this.mbox.nemoLayers[ as ].DragCircle.getDataExtent();//layer.getDataExtent();
    this.mbox.map.zoomToExtent(layerExtent,false);
  }
  
  Evaluator.prototype.createPopup = function( options ) {
    options = options || {};
    var type = options.type
    ,feature = options.feature
    ,content = options.content
    ,close = typeof options.close !== "undefined"? options.close : false
    ,name = options.name || "categoryPopup"
    ,popup = new OpenLayers.Popup[ type ](
      name
      ,new OpenLayers.LonLat( feature.geometry.x, feature.geometry.y )
      ,null
      ,content
      ,null
      ,close
    );
    // Force the popup to always open to the top-right 
   // popup.calculateRelativePosition = function () { return 'tr'; }
   
    popup.setOpacity(0.6);
    popup.setBackgroundColor('transparent');   
    popup.panMapIfOutOfView = true;
    popup.autoSize = false;
    popup.backgroundColor="#747676"; 
    popup.div.style.display="none";
    popup.div.style.zIndex=18000;
    //popup.imageSrc //to hijack the cloud popup image to different image
    //remove the close div from the popup 
    if( popup.closeDiv ) {
      //popup.closeDiv = '';
      /*
      //popup.closeDiv.style.background-position ="0 0";
      //popup.closeDiv.style.background-repeat ="no-repeat";
      //popup.closeDiv.style.background-color ="rgba(0, 0, 0, 0)";
      popup.closeDiv.style.height = "20px";
      popup.closeDiv.style.width = "20px";
      popup.closeDiv.style.right = "48px";
      */
      popup.closeDiv.style.background = "url("+vidteq.imgPath.close+") no-repeat scroll 0 0" ;
      var olPopupCloseBoxClass =(function() {
        var aClass;
        if( root.aD && root.aD.q && root.gui && root.gui.theme ) {
         aClass = root.aD.q + "-olPopupCloseBox-" + root.gui.theme;
        }else {
          aClass = "vidteq-olPopupCloseBox";  
        }
        return aClass;
      })();
      $(popup.closeDiv).addClass( olPopupCloseBoxClass );
    }
    //popup.updateSize();
    return popup;
  }
  
  //TBD: generic method and can be moved to mbox
  Evaluator.prototype.showFeaturePopups =  function(options) {
    options = options || {};
    var layerId = options.layerId
    ,evnt = options.evnt
    ,featureId = options.featureId
    ,featureIndex = options.featureIndex
    ;
    
    var layer = this.mbox.map.getLayersByName(layerId)[0];
    var control, action;
    var c1 = this.mbox.hoverSelect;
    var c2 = this.mbox.universalSelect;
    c1.unselectAll();
    c2.unselectAll();
    switch(evnt) {
      case "click":
        action = "select";
        control = c2;
        break;
      case "mouseover":
        //action = "highlight";
        //action = "select";
        action = "over";
        control = c2;
        break;
      case "mouseleave":
        //action = "unhighlight";
        //action = "unselect";
        action = "out";
        control = c2;
        break;
    }
    
    if( !action ) return;
    var featureArray = layer.features;
    if( typeof featureIndex !== 'undefined' ) {
      var selectedFeature = featureArray[featureIndex];
      if(selectedFeature.attributes.value==featureId) {
        this.invokeOlControl( action, control, selectedFeature );
      }
    }else {    
      for(var i=0,l=featureArray.length;i<l;i++) {
        var selectedFeature = featureArray[i];
        if(selectedFeature.attributes.value==featureId) {
          //create memory of feature selected
          this.selectedFeature = selectedFeature;
          this.invokeOlControl( action, control, selectedFeature );
          break;
        }
      }
    }
  }

  Evaluator.prototype.invokeOlControl =  function( action, control, selectedFeature ) {
    //TBD: if control.callbacks not defined, what happens for control.out and control.over
     if( action === "over" || action === "out" ) {
      if( control.callbacks ) {
        control.callbacks[ action ](selectedFeature);
        if( action === "over" ) { control.highlight(selectedFeature); }
        if( action === "out" ) { control.unhighlight(selectedFeature); }
      }else {
        control[ action ](selectedFeature);
      }
    }else {
      control[ action ](selectedFeature);
    }
  }
  
  Evaluator.prototype.hideFeaturePopups =  function(options) {
    options = options || {};
    //this.mbox.clearAllPopups();
    var c1 = this.mbox.hoverSelect;
    var c2 = this.mbox.universalSelect;
    c1.unselectAll();
    c2.unselectAll();
    /*var layerId = options.layerId
    ,evnt = options.evnt
    ,featureId = options.featureId;
    
    
    var layer = this.mbox.map.getLayersByName(layerId)[0];
    switch(evnt) {
      case "mouseleave":
        var c1 = this.mbox.map.getControl(this.mbox.nemoControls.selectCtrl.id);
        var c2 = this.mbox.map.getControl(this.mbox.nemoControls.hightlightctrl.id);
        c1.unselectAll();
        c2.unselectAll();
        break;
    }*/
    return true;
  }

  Evaluator.prototype.getCategoryColor =  function(catName) {
    var color = '';
    if(typeof(catName)!='undefined') {
     catName = catName.replace(/\d+/g, '');
     switch(catName) {
      case "school":
        color = "#E6C91C";
        break;
      case "itPark":
        color = "#000000";
        break;
      case "workplace":
        color = "#000000";
        break;
      case "hospital":
        color = "#48DC0F";
        break;
      case "medical":
        color = "#48DC0F";
        break;
      case "petrolPump":
        color = "#1C6AEB";
        break;
      case "finance":
        color = "#48DC0F";
        break;
      case "hotelrest":
        color = "#1C6AEB";
        break;
      case "railwayStation":
        color = "#1CCEDD";
        break;
      case "commute":
        color = "#1CCEDD";
        break;
      case "shoppingMall":
        color = "#A41BDF";
        break;
      case "shopping":
        color = "#48DC0F";
        break;
      case "entertainment":
        color = "#A41BDF";
        break;
      case "publicservices":
        color = "#1C6AEB";
        break;
      }
    }  
    return color;
  }

  /**
   * Hide or un-hide categories on the map
   *
   * @method toggleCategoryDisplay
   * @param {Object} resultset reference to the resultset object
  */
  Evaluator.prototype.toggleCategoryDisplay = function(categoryObj,as) {
    as = as || "explore";
    var features = this.layers[categoryObj.itemId].features
    ,catLayerName = as + '-' + categoryObj.itemId;
    
    if( categoryObj.state || categoryObj.selected ) {
     this.mbox.map.getLayersByName( catLayerName )[0].setVisibility(true);
     this.layers[ catLayerName ].redraw();
    }else{
      this.mbox.map.getLayersByName( catLayerName )[0].setVisibility(false);
     this.layers[ catLayerName ].redraw();      
    }
  }

  /**
   * It's destroy category features and reset them to there initial state=false.
   * It purges data for all categories.
   *
   * @method destroyCategory
  */
  Evaluator.prototype.destroyCategory = function(id) {
    var layer = this.mbox.map.getLayersByName('categoryLayer')[0]
      ,features = l.features
      ,len = features.length
      ,i;
    for (i = len-1; i >= 0; i--) {
      //destroy features with specific index only
      if(features[i].attributes.id === id) {
        layer.destroyFeatures(features[i]);
      }
    }
    layer.redraw();
    //update the length
   // this.length = features.length;
    //this.resetCategory();
  }

  /**
   * Hide visible category on the map.
   *
   * @method hideCategory
   * @param {Object} resultset
   * @deprecated
  */
  Evaluator.prototype.hideCategory = function(categoryObj,as) {
    as = as || "explore";
    var catLayerName = as + '-' + categoryObj.itemId;
    
    if(this.mbox.map.getLayersByName( catLayerName )[0]) {
      this.mbox.map.getLayersByName( catLayerName )[0].setVisibility(false);
    }else {
      return false;
    }
  }

  Evaluator.prototype.showCategory = function(categoryObj,as) {
    as = as || "explore";
    var catLayerName = as + '-' + categoryObj.itemId;
    
    if(this.mbox.map.getLayersByName( catLayerName )[0]) {
      this.mbox.map.getLayersByName( catLayerName )[0].setVisibility(true);
    }else {
      return false;
    } 
    //var layerExtent = this.mbox.map.getLayersByName(categoryObj.itemId)[0].getDataExtent();
    //the circle should always be visible    
    //var layerExtent = this.mbox.map.getLayersByName(this.uiwidget.explorationArea.circleLayerName)[0].getDataExtent();
    //var newExtent = this.mbox.map.zoomToExtent(layerExtent,false);
    this.mbox.map.getLayersByName( catLayerName )[0].redraw();
    this.zoomToExtent( as );
  }

  Evaluator.prototype.createStrategy = function( options ) {
    options = options || {distance:4000,threshold:50};
    return new OpenLayers.Strategy.Cluster( options );
  }
  Evaluator.prototype.addPopupToMap = function(popup, exclusive) {
    var map = this.mbox.map;
    //--addPopup code from OpenLayers--//
    /** 
     * APIMethod: addPopup
     * 
     * Parameters:
     * popup - {<OpenLayers.Popup>}
     * exclusive - {Boolean} If true, closes all other popups first
     */
    var exclusive = false;
    if (exclusive) {
        //remove all other popups from screen
        for (var i = map.popups.length - 1; i >= 0; --i) {
            map.removePopup(map.popups[i]);
        }
    }

    popup.map = map;
    map.popups.push(popup);
    var popupDiv = popup.draw();
    popupDiv.style.display = "none"; //added
    if (popupDiv) {
        popupDiv.style.zIndex = map.Z_INDEX_BASE['Popup'] +
                                map.popups.length;
        map.layerContainerDiv.appendChild(popupDiv);
    }
    //----//
    return popupDiv; //added
  }
  Evaluator.prototype.addSelectAndHover = function( options ) {
    options = options || {};
    var popupAdded;
    if( options.layer ) {
      popupAdded = this.mbox.addUniversalSelectToLayer({
        layer: options.layer
        ,tooltipSelect: options.tooltipSelect
        ,tooltipUnselect: options.tooltipUnselect
        ,onFeatureSelect: options.onFeatureSelect
        ,onFeatureUnselect: options.onFeatureUnselect
        ,hover: options.hover
        ,select: options.select
        ,scope: this
      });
    }
    return popupAdded;
  }
  Evaluator.prototype.LayerRules = function() {}
  Evaluator.prototype.LayerRules.prototype.color =function() {
    return {
      ruleColors : {
          //low: "rgb(181, 226, 140)",
          low: "rgb(241, 211, 87)", 
          middle: "rgb(129, 255, 15)",
          high: "rgb(253, 156, 115)"
      }
    };
  }
  Evaluator.prototype.LayerRules.prototype.oneItemRule = function() {
    var rule = new OpenLayers.Rule({
        filter: new OpenLayers.Filter.Comparison({
          type: OpenLayers.Filter.Comparison.EQUAL_TO,
          property: "count",
          value: 1
        }),
        symbolizer: {
          externalGraphic: vidteq.imgPath.propertyMarker,                    
          cursor : "pointer",
          graphicWidth : 26,
          graphicHeight : 32
        }
    });    
    return rule;
  }
  Evaluator.prototype.LayerRules.prototype.lowRule = function() {
    var lowRule = new OpenLayers.Rule({
        filter: new OpenLayers.Filter.Comparison({
          type: OpenLayers.Filter.Comparison.BETWEEN,
          property: "count",
          lowerBoundary: 1,
          upperBoundary: 10
        }),
        symbolizer: {
          cursor : "pointer",
          fillColor: this.color().ruleColors.low,
          fillOpacity: 0.9, 
          strokeColor: this.color().ruleColors.low,
          strokeOpacity: 0.5,
          strokeWidth: 12,
          pointRadius: 10,
          label: "${count}",
          labelOutlineWidth: 1,
          fontColor: "#ffffff",
          fontOpacity: 0.8,
          fontSize: "12px"
        }
    });
    return lowRule;
  }
  Evaluator.prototype.LayerRules.prototype.middleRule = function() {
    var middleRule = new OpenLayers.Rule({
        filter: new OpenLayers.Filter.Comparison({
          type: OpenLayers.Filter.Comparison.BETWEEN,
          property: "count",
          lowerBoundary: 10,
          upperBoundary: 20
        }),
        symbolizer: {
          cursor : "pointer",
          fillColor: this.color().ruleColors.middle,
          fillOpacity: 0.9, 
          strokeColor: this.color().ruleColors.middle,
          strokeOpacity: 0.5,
          strokeWidth: 12,
          pointRadius: 15,
          label: "${count}",
          labelOutlineWidth: 1,
          fontColor: "#ffffff",
          fontOpacity: 0.8,
          fontSize: "12px"
        }
    });
    return middleRule;
  }
  Evaluator.prototype.LayerRules.prototype.highRule = function() {
    var highRule = new OpenLayers.Rule({
        filter: new OpenLayers.Filter.Comparison({
          type: OpenLayers.Filter.Comparison.GREATER_THAN,
          property: "count",
          value: 20
        }),
        symbolizer: {
          cursor : "pointer",
          fillColor: this.color().ruleColors.high,
          fillOpacity: 0.9, 
          strokeColor: this.color().ruleColors.high,
          strokeOpacity: 0.5,
          strokeWidth: 12,
          pointRadius: 20,
          label: "${count}",
          labelOutlineWidth: 1,
          fontColor: "#ffffff",
          fontOpacity: 0.8,
          fontSize: "12px"
        }
    });
    return highRule;
  }
  
  Evaluator.prototype.createMmhLayer = function( opt, as ) {
    var defaults = this.createMmhLayer.defaults
    ,exploreAreaLayers = opt.layers
    ,layerName = exploreAreaLayers.mmh
    ,layerRules = new Evaluator.prototype.LayerRules()
    ,layerOptions = {
      isBaseLayer: false
      ,rendererOptions: {yOrdering: true}
      //,renderers: ['SVG']
      ,styleMap: new OpenLayers.StyleMap(
       new OpenLayers.Style( null, {
          rules: [
            layerRules.oneItemRule()
            ,layerRules.lowRule()
            ,layerRules.middleRule()
            ,layerRules.highRule()
          ]
        })
      )
    };
    
    if( OpenLayers.Strategy.AnimatedCluster ) {
      layerOptions.strategies = [
          new OpenLayers.Strategy.AnimatedCluster({
              distance: 45
              ,animationMethod: OpenLayers.Easing.Expo.easeOut
              ,animationDuration: 10
          })
      ];
    }
    
    var mmhLayer = new OpenLayers.Layer.Vector( layerName, layerOptions );
    this.mbox.map.addLayer( mmhLayer );
    if( as && !this.mbox.nemoLayers[ as ] ) {
      this.mbox.nemoLayers[ as ] = {};
    }
    this.mbox.nemoLayers[ as ][ layerName ] = mmhLayer;
    
    this.addSelectAndHover({
      layer: mmhLayer
      ,onFeatureSelect: defaults.onFeatureSelect
      ,onFeatureUnselect: defaults.onFeatureUnselect
      ,tooltipSelect: defaults.tooltipSelect
      ,tooltipUnselect: defaults.tooltipUnselect
      ,hover: true
      ,select: true
    });;
    
    return mmhLayer;
  }
  Evaluator.prototype.createMmhLayer.defaults = {};
  Evaluator.prototype.createMmhLayer.defaults.tooltipSelect  = function(evnt) {
    var onFeaturePopupClose = function(event) {
      var f = event.feature;
      if(f===null) { return; }
      if(f.attributes.type === 'line' || f.attributes.type === 'circle' || typeof(f.attributes.type)==="undefined") { return; }
      if( f.popup!==null && typeof(f.popup)!=="undefined" ) {
        if( f.popup.map!==null && typeof(f.popup.map)!=="undefined" ) {
          f.popup.map.removePopup(f.popup);
          f.popup.destroy();
          f.popup=null;
        }
      }
    };
    var lastFeature = null
    ,popup = null
    ,f = evnt.feature;
    
    if(popup!==null) {
      popup.destroy();
      this.mbox.map.removePopup(popup);
      if(lastFeature!==null) {
        delete lastFeature.popup;
      }
      popup = null;
    }
    lastFeature = f;
    lastFeature.popupType="tooltip";
    var cluster = f.cluster
    ,mapHover = cluster[0].data.view.template.mapHover
    ,text="";
    text = mapHover({
      cluster: cluster
      ,length: cluster.length
      ,max: 3 
    });
      
    if(f.popup===null) {
      var html = "<a style='font-size:10px;'>"+text+"</a>";
      popup = new OpenLayers.Popup(
        "activetooltip"
        ,f.geometry.getBounds().getCenterLonLat()
        ,new OpenLayers.Size(10,10)
        ,html
        ,null
        ,true
        ,onFeaturePopupClose
      );
      popup.setBackgroundColor("white");
      popup.setBorder("0.5px solid grey");
      popup.panMapIfOutOfView = true;
      popup.contentDiv.style.overflow =  'hidden';
      popup.autoSize = true;
      f.popup=popup;
    }
    
    this.mbox.map.addPopup(f.popup);
    //TBD common hover style should be in a single place
    $('#activetooltip.olPopup').css('border-radius','10px');    
    $('#activetooltip.olPopup').css('text-align','center');    
    $('#activetooltip_contentDiv.olPopupContent').css('height','auto');    
      if (!self.navigator.userAgent.match(/MSIE\s[7]/)){ 
        $('#activetooltip_contentDiv.olPopupContent').css('width','auto');    
      }
    //$('.olPopupContent').css('width','auto');    
    $('#activetooltip_contentDiv.olPopupContent').css('white-space', 'nowrap');    
    $('#activetooltip.olPopup').css('height','auto');    
      if (!self.navigator.userAgent.match(/MSIE\s[7]/)){ 
        $('#activetooltip.olPopup').css('width','auto');    
      }
    //$('.olPopup').css('width','auto');
    $("#"+f.popup.contentDiv.id).effect("bounce", { times:5 }, 500);
  };
  Evaluator.prototype.createMmhLayer.defaults.tooltipUnselect = function(event) {
    var f = event.feature
    ,lastFeature = null
    ,popup = null;    
    if( f!==null && typeof(f.popup)!=="undefined" && f.popup!==null
        && typeof(f.popupType)!=="undefined"  && f.popupType!==null && f.popupType==="tooltip") {
      this.mbox.map.removePopup(f.popup);
      f.popup.destroy();
      f.popup=null;
      popup = null;
      lastFeature = null;
    }
  };
  Evaluator.prototype.createMmhLayer.defaults.onFeatureSelect = function (evnt) {
    $(".info-window").show();
    var f = evnt.feature;
    var selectedFeature = null;
    if(f!==null && f.popup!==null && typeof(f.popup)!=="undefined") {        
      this.mbox.map.removePopup(f.popup);
      f.popup=null;
      selectedFeature = null;
    }
    selectedFeature = f;
    selectedFeature.popupType="detailed";
  };
  Evaluator.prototype.createMmhLayer.defaults.onFeatureUnselect = function(evnt) {
    $(".info-window").hide();
    var f = evnt.feature;
    if(typeof f === "undefined" || f===null) { return; }
    if( f.popup!==null && typeof(f.popup)!=="undefined" ) {
      if( f.popup.map!==null && typeof(f.popup.map)!=="undefined" ) {
        f.popup.map.removePopup(f.popup);
        f.popup.destroy();
        f.popup=null;
      }
    }
  };
  
  Evaluator.prototype.createPolygonAreaLayer = function( opt, as ) {
    var exploreAreaLayers = opt.layers;
    var layerName = exploreAreaLayers.polygon;
    var polygonAreaLayer = new OpenLayers.Layer.Vector(layerName, {
        styleMap: new OpenLayers.StyleMap({
            'default': OpenLayers.Util.applyDefaults({
                    strokeWidth: 1
                    ,fillOpacity: 0.2
                    ,pointRadius: 4
                    ,graphicName: layerName
                }, OpenLayers.Feature.Vector.style['default']
            )
            ,'select': OpenLayers.Util.applyDefaults({
                    strokeWidth: 1
                    ,fillOpacity: 0.2
                    ,pointRadius: 6
                    ,graphicName: layerName
                }, OpenLayers.Feature.Vector.style['select']
            )
        })
        ,isBaseLayer: false
        ,transitionEffect: 'resize'
        ,buffer: 0
    });
    
    this.mbox.map.addLayer(polygonAreaLayer);
    if( as && !this.mbox.nemoLayers[ as ] ) {
      this.mbox.nemoLayers[ as ] = {};
    }
    this.mbox.nemoLayers[ as ][ layerName ] = polygonAreaLayer;
    
    return polygonAreaLayer;
  }
  
  /*Area Layer*/
  Evaluator.prototype.createAreaLayer = function( layerName, as ) {
    this.createAreaLayer.mbox = this.mbox;
    var defaults = this.createAreaLayer.defaults;
    var styleMap = new OpenLayers.StyleMap({
      'default': new OpenLayers.Style( defaults.defaultStyle,{ context : defaults.areaContext } )
      ,'select': new OpenLayers.Style( defaults.selectStyle ,{ context : defaults.areaContext } )
    });
    //adding a unique rule
    /*var lookup = {
      0: {graphicName: "triangle"}
    };
    styleMap.addUniqueValueRules("default", "index", lookup);*/
    
    var areaLayer = new OpenLayers.Layer.Vector(layerName, {
      styleMap: styleMap
      ,isBaseLayer: false
      ,transitionEffect: 'resize'
      ,buffer: 0
    });
    
    this.mbox.map.addLayer(areaLayer);
    
    if( as && !this.mbox.nemoLayers[ as ] ) {
      this.mbox.nemoLayers[ as ] = {};
    }
    this.mbox.nemoLayers[ as ][ layerName ] = areaLayer;
    
    var onFeatureSelect = defaults.onFeatureSelect
    ,onFeatureUnselect = defaults.onFeatureUnselect
    ,tooltipSelect = defaults.tooltipSelect
    ,tooltipUnselect = defaults.tooltipUnselect
    ;
    
    this.addSelectAndHover({
      layer: areaLayer
      ,as: as
      ,onFeatureSelect: onFeatureSelect
      ,onFeatureUnselect: onFeatureUnselect
      ,tooltipSelect: tooltipSelect
      ,tooltipUnselect: tooltipUnselect
      ,hover: true
      ,select: true
    });
      
    return {
      layer: areaLayer
      //,defaultStyle: defaultStyle
      //,selectStyle: selectStyle
      //,areaContext: areaContext
      ,onFeatureSelect: onFeatureSelect
      ,onFeatureUnselect: onFeatureUnselect
      ,tooltipSelect: tooltipSelect
      ,tooltipUnselect: tooltipUnselect
      ,scope: this
    };
  }
  Evaluator.prototype.createAreaLayer.defaults = {};
  Evaluator.prototype.createAreaLayer.defaults.areaContext = {
    getLabel: function(feature) {
      return feature.attributes.label || '';
    }
    ,getTitle: function(feature) {
      return feature.attributes.title || '';
    }
  };
  Evaluator.prototype.createAreaLayer.defaults.defaultStyle = {
    fillColor: "#c80e12"
    ,fillOpacity: 1
    ,hoverFillColor: "white"
    ,hoverFillOpacity: 0.4
    ,strokeColor: "#c80e12"
    ,strokeOpacity: 1
    ,strokeWidth: 1
    ,strokeLinecap: "round"
    ,strokeDashstyle: "solid"
    ,hoverStrokeColor: "red"
    ,hoverStrokeOpacity: 1
    ,hoverStrokeWidth: 0.2
    ,pointRadius: 8
    ,hoverPointRadius: 1
    ,hoverPointUnit: "%"
    ,pointerEvents: "visiblePainted"
    ,cursor: "inherit"
    ,fontColor: "#000000"
    ,labelAlign: "cm"
    ,labelOutlineColor: "white"
    ,labelOutlineWidth: 3
    ,fontWeight:"bold"
    ,graphicName: "circle"
    ,label : "${getLabel}"
    ,title : "${getTitle}"
  };
  Evaluator.prototype.createAreaLayer.defaults.selectStyle = {
    fillColor: "#139CC6"
    ,fillOpacity: 0.8
    ,strokeColor: "#139CC6"
  };
  Evaluator.prototype.createAreaLayer.defaults.adjustFeatures = function( as ) {
    var mbox = this.mbox;
    var categories = ( ( mbox.gui[ as ] || {} ).categories || {} )
    ,explorationArea = ( ( mbox.gui[ as ] || {} ).explorationArea || {} )
    ,aLayer = mbox.nemoLayers[ as ].AreaLabel
    ,dragCircleLayer = mbox.nemoLayers[ as ].DragCircle
    ,cF = dragCircleLayer.features[0]
    ,R1 = cF.attributes.R1
    ,center = cF.attributes.center
    ,featureLineSet = aLayer.getFeaturesByAttribute("groupType","cline")    
    ,featurePointSet = aLayer.getFeaturesByAttribute("groupType","cpoint");
  
    return {
      categories : categories
      ,explorationArea : explorationArea
      ,aLayer : aLayer
      ,dragCircleLayer : dragCircleLayer
      ,cF : cF
      ,R1 : R1
      ,center : center
      ,featureLineSet : featureLineSet
      ,featurePointSet : featurePointSet
    };
  };
  Evaluator.prototype.createAreaLayer.defaults.onFeaturePopupClose = function(event) {
    //onFeatureUnselect(event);
    var f = event.feature;
    if(f===null) { return; }
    if(f.attributes.type === 'line' || f.attributes.type === 'circle' || typeof(f.attributes.type)==="undefined" || typeof(f.attributes.groupType)==="undefined" ) { return false; }
    if( f.popup!==null && typeof(f.popup)!=="undefined" ) {
      //$(".evalPopup").dialog("destroy").remove();
      //$(".evalPopup").dialog("close"); //remove previously opened jquery dialog box
      if( f.popup.map!==null && typeof(f.popup.map)!=="undefined" ) {
        f.popup.map.removePopup(f.popup);
        f.popup.destroy();
        f.popup=null;
      }
    }
  };
  Evaluator.prototype.createAreaLayer.defaults.tooltipSelect = function(evnt) {
    var lastFeature = null;
    var popup = null;
    var f = evnt.feature;
    if(f.attributes.type === 'line' || f.attributes.type === 'circle' || typeof(f.attributes.type)==="undefined" || typeof(f.attributes.groupType)==="undefined" ) { return false; }
    
    var R2 = f.attributes.R2;
    var as = f.attributes.manner;
    var aF = this.createAreaLayer.defaults.adjustFeatures.call( this, as )
    ,aLayer = aF.aLayer
    ,R1 = aF.R1;
    
    if(R2===R1) {
      return false;
    }
    
    if(popup!==null) {
      popup.destroy();
      this.mbox.map.removePopup(popup);
      if(lastFeature!==null) {
        delete lastFeature.popup;
      }
      popup = null;
    }
    lastFeature = f;
    lastFeature.popupType="tooltip";
    var text="";
    
    if(f.attributes.text) {
      text = f.attributes.text;
    }
    
    if(f.popup===null) {
      var html = "<a style='font-size:12px;font-weight:bold;'>"+text+"</a>";
      var scope = this;
      popup = new OpenLayers.Popup(
        "activetooltip"
        //,new OpenLayers.LonLat(f.geometry.x,f.geometry.y)
        ,f.geometry.getBounds().getCenterLonLat()
        ,new OpenLayers.Size(10,10)
        ,html
        ,null
        ,true
        ,function( event ) {
          scope.createAreaLayer.defaults.onFeaturePopupClose.call( scope, event)
        }
      );
      popup.setBackgroundColor("white");
      popup.setBorder("0.5px solid grey");
      popup.panMapIfOutOfView = true;
      popup.contentDiv.style.overflow =  'hidden'; 
      //popup.contentDiv.style.padding = '3px';  
      //popup.contentDiv.style.margin = '2'; 
      popup.autoSize = true;
      
      f.popup=popup;
    }
    this.mbox.map.addPopup(f.popup);
    //TBD common hover style should be in a single place
    $('#activetooltip.olPopup').css('border-radius','10px');    
    $('#activetooltip.olPopup').css('text-align','center');    
    $('#activetooltip_contentDiv.olPopupContent').css('height','auto');    
      if (!self.navigator.userAgent.match(/MSIE\s[7]/)){ 
        $('#activetooltip_contentDiv.olPopupContent').css('width','auto');    
      }
    //$('.olPopupContent').css('width','auto');    
    $('#activetooltip_contentDiv.olPopupContent').css('white-space', 'nowrap');    
    $('#activetooltip.olPopup').css('height','auto');    
      if (!self.navigator.userAgent.match(/MSIE\s[7]/)){ 
        $('#activetooltip.olPopup').css('width','auto');    
      }
    //$('.olPopup').css('width','auto');
    //$("#"+f.popup.contentDiv.id).effect("bounce", { times:5 }, 500);
  };
  Evaluator.prototype.createAreaLayer.defaults.tooltipUnselect = function(event) {
    var f = event.feature;
    var lastFeature = null;
    var popup = null;
    if( f!==null && typeof(f.popup)!=="undefined" && f.popup!==null
        && typeof(f.popupType)!=="undefined"  && f.popupType!==null && f.popupType==="tooltip") {
      this.mbox.map.removePopup(f.popup);
      f.popup.destroy();
      f.popup=null;
      popup = null;
      lastFeature = null;
    }
  };
  Evaluator.prototype.createAreaLayer.defaults.onFeatureSelect = function(evnt) {
    var mbox = this.mbox;
    var f = evnt.feature;
    if(f.attributes.type === 'line' || typeof(f.attributes.type)==="undefined") { return; }    
    var selectedFeature = null;    
    if(f!==null && f.popup!==null && typeof(f.popup)!=="undefined") {
      mbox.map.removePopup(f.popup);
      f.popup=null;
      selectedFeature = null;
    }
    selectedFeature = f;
    selectedFeature.popupType="explorationArea";
        
    var distance = selectedFeature.attributes.distance
    ,as = selectedFeature.attributes.manner
    ,R2 = selectedFeature.attributes.R2
    ,limit = selectedFeature.attributes.limit
    ,offset = selectedFeature.attributes.offset;
    
    var aF = this.createAreaLayer.defaults.adjustFeatures.call( this, as )
    ,categories = aF.categories
    ,explorationArea = aF.explorationArea
    ,aLayer = aF.aLayer
    ,dragCircleLayer = aF.dragCircleLayer
    ,cF = aF.cF
    ,R1 = aF.R1
    ,center = aF.center
    ,featureLineSet = aF.featureLineSet
    ,featurePointSet = aF.featurePointSet;
    
    //Length of cline and cpoint group is same and indecies too
    for( var i=0;i<featureLineSet.length;i++ ) {
      if(featureLineSet[i].attributes.R2!==R2) {
        featureLineSet[i].style.display = "none";
      }else if(featureLineSet[i].attributes.R2===R2) {
        //featureLineSet[i].style.label = ( distance/1000 ) + " Km";
        delete featureLineSet[i].style.display;
      }
      if(featurePointSet[i].attributes.R2!==R2) {
        featurePointSet[i].style = null;
        //featurePointSet[i].attributes.title = featurePointSet[i].attributes.text;
        mbox.universalSelect.unselect( featurePointSet[i] );
      }
    }
    
    //delete selectedFeature.attributes.title;
    
    selectedFeature.style = {
      fillColor:"#ee9900"
      ,strokeColor:"#ee9900"
      ,pointRadius: 7
      ,graphicName: "cross"
      ,labelXOffset: 40
      ,labelYOffset: 0
      //,fontColor: "#0E88C8"
      ,fontColor: "#000000"
      ,fontSize: "17px"
      ,fontWeight:"bold"
      ,label: ( distance/1000 ) + " Km"
    };
    
    //var scale = (R2/R1);
    var scale = this.getDistance(R2) / this.getDistance(R1);
    
    cF.attributes.R1 = R2;
    explorationArea.distance = distance;
    explorationArea.limit = limit;
    cF.geometry.resize( scale, center );
    dragCircleLayer.redraw();
    aLayer.redraw();
    var dcLayerExtent = dragCircleLayer.getDataExtent();
    //testing: if requried, disable the zoom here
    mbox.map.zoomToExtent(dcLayerExtent,false);
    
    for( var cat in categories.validCategories ) {
      (function(cat) {
        if( categories[ cat ].selected ) {
          if(categories.evaluator) {
            categories.evaluator.showCategoryOnMapInOneCircle({
             LonLat: new OpenLayers.Geometry.fromWKT(explorationArea.geom)
             ,categoryObj: categories[cat]
             ,data: categories[cat].data
             ,callback: categories.getPopUpDescription
             ,manner: as
             ,distanceCutOff: parseInt(explorationArea.distance)
             ,limit: parseInt(explorationArea.limit)
             ,redraw: true
            });
          }
        }
      }(cat));
    }
    //TBD: resize feature and zoom handling
  };
  Evaluator.prototype.createAreaLayer.defaults.onFeatureUnselect = function(evnt) {
    var f = evnt.feature;
    if(typeof f === "undefined" || f===null) { return; }
    if(f.attributes.type === 'text' || typeof(f.attributes.type)==="undefined") { return; }
    if( f.popup!==null && typeof(f.popup)!=="undefined" ) {
      if( f.popup.map!==null && typeof(f.popup.map)!=="undefined" ) {
        f.popup.map.removePopup(f.popup);
        f.popup.destroy();
        f.popup=null;
      }
    }
  };

  Evaluator.prototype.createDragCircleLayer = function( opt, as, areaCenter ) {
    var exploreAreaLayers = opt.layers;
    var layerName = exploreAreaLayers.circle;
    
    var dragCircleLayer = new OpenLayers.Layer.Vector(layerName, {
        styleMap: new OpenLayers.StyleMap({
            'default': OpenLayers.Util.applyDefaults({
                    strokeWidth: 2
                    ,strokeOpacity: 1
                    ,fillOpacity: 0.0
                }, OpenLayers.Feature.Vector.style['default']
            )
            ,'select': OpenLayers.Util.applyDefaults({
                    strokeWidth: 3
                    ,strokeOpacity: 1
                    ,fillOpacity: 0.2
                }, OpenLayers.Feature.Vector.style['select']
            )
        })
        ,isBaseLayer: false
        ,transitionEffect: 'resize'
        ,buffer: 0
    });
    
    this.mbox.map.addLayer(dragCircleLayer);
    if( as && !this.mbox.nemoLayers[ as ] ) {
      this.mbox.nemoLayers[ as ] = {};
    }
    this.mbox.nemoLayers[ as ][ layerName ] = dragCircleLayer;
    
    //Area Layer
    var areaLayer = this.createAreaLayer( exploreAreaLayers.areaLabel, as );
    var aLayer = areaLayer.layer;
    var getRadius = this.getRadius;
    var origin = {x:areaCenter.x, y:areaCenter.y};    
    var distanceOption = opt.distanceOption;
    var distance = opt.distance;
    var circleResizeRequired = opt.circleResizeRequired;
    var circle = new OpenLayers.Geometry.Polygon.createRegularPolygon( origin, getRadius(distance), 59 );
    var circleFeature = new OpenLayers.Feature.Vector(circle);
    var circleCollection = [ circle ];
    var vertices = circleFeature.geometry.getVertices();
    var featureOnCircle = [];
    var step = 1;
    var R = getRadius( distance );
    var circleAttributes = {
      distance: distance
      ,R1: R
      ,R: R
      ,O: origin
      ,center: areaCenter
      ,geom: opt.geom
      ,type: 'circle'
      ,label: ( distance/1000 ) + " Km"
      ,title: ( distance/1000 ) + " Km"
    }
    var vl = vertices.length;
    for( var i=0,count=0;i<vl;i=i+2,count++ ) {
      if( circleResizeRequired ) {
        if(count===3) break;  
      }else {
        if(count===1) break;
      }
      (function(i,count,distanceOption) {
        var Rx = getRadius( distanceOption[ count ].x  );    
        //var x = distanceOption[ count ];
        //x += distance + (step*1000);
        var x = distanceOption[ count ].x;
        var defaultDistance = distanceOption[ count ].defaultDistance;
        //clone is must
       // var j = vl - (vl/2) - i;
       //var j = i;
       var j = 14+i;
        var vertex = vertices[j];//.clone();
        var geom = vertex.toString();
        //if( i===0 ) {
          var line = new OpenLayers.Geometry.LineString( [ areaCenter, vertex ] );
          var lF = new OpenLayers.Feature.Vector(
            line
            ,{
            distance: x
            ,R1: R
            ,R2: Rx
            ,R: Rx
            ,O: origin
            ,center: areaCenter
            ,geom: geom
            ,type: 'line'
            ,groupType: 'cline'
            ,fid: 'line-' + x
            ,atIndex: i
            ,index: count
            ,label: ''//( x/1000 ) + " Km"
            ,title: ( x/1000 ) + " Km"
          }
          ,{
            strokeColor: "#ee9900"
            ,strokeOpacity: 1
            ,strokeWidth: 1
            ,strokeDashstyle: "solid"
            ,labelXOffset: 100
            ,labelYOffset: -10
            ,pointRadius: 15
            //,fontColor: "#0E88C8"
            ,fontColor: "#000000"
            ,fontSize: "17px"
            ,fontWeight:"bold"
            //,label : ( x/1000 )+" Km"
          }
          
          );
          //j===(14+i)
          if( !defaultDistance ) {
            lF.style.display="none";
            //featureOnCircle.push( lF );
            /*window.setInterval(function() {
              rotateFeature( lF, 360/20, areaCenter );  
            },200)*/
          }
          featureOnCircle.push( lF );
          //dragCircleLayer.addFeatures( [ lF ] );
          //circleCollection.push( line );
        //}
        
        var ePFAttributes = {
          distance:  x
          ,value: x
          ,R1: R
          ,R2: Rx
          ,R: Rx
          ,O: origin
          ,center: areaCenter
          ,geom: geom
          ,type: 'point'
          ,atIndex: i
          ,index: count
          ,groupType: 'cpoint'
          ,fid: 'point-' + x
          ,limit: distanceOption[ count ].limit
          ,offset: distanceOption[ count ].offset
          ,label : ''//i===0? ( x/1000 ) + " Km" :''
          ,text: "Click to explore within " + ( x/1000 ) + " Km"
          ,title: ''//"Click to explore within " + ( x/1000 ) + " Km"
          ,manner: as
         //,rendererOptions: { zIndexing: true }
        };
        var ePFStyle = {
            fillColor: "#ee9900"
            ,fillOpacity: 1
            //,hoverFillColor: "white"
            //,hoverFillOpacity: 0.8
            ,strokeColor: "#ee9900"
            ,strokeOpacity: 1
            ,strokeWidth: 1
            ,strokeDashstyle: "solid"
            ,labelXOffset: 40
            ,labelYOffset: 0
            ,labelOutlineColor: "#ffffff"
            ,pointRadius: 7
            //,fontColor: "#0E88C8"
            ,fontColor: "#000000"
            ,fontSize: "17px"
            ,fontWeight:"bold"
            ,labelSelect: true
            ,graphicName: "cross"
            //,rotation: 90
            ,label : ( x/1000 )+" Km"
        };
        
        //if( urlid && urlid==="KSL" ) {
          if( defaultDistance ) {
            var ePF = new OpenLayers.Feature.Vector(
              vertices[j]//.clone()
              ,ePFAttributes
              ,ePFStyle
            );
          }else {
            var ePF = new OpenLayers.Feature.Vector(
              vertices[j]//.clone()
              ,ePFAttributes
            );
          }
          featureOnCircle.push( ePF );  
          distanceOption[ count ].fIndex = (featureOnCircle.length - 1);
        //}
      }(i,count,distanceOption));
    }
          
    //TBD:
    //var aCirclePoint = new OpenLayers.Geometry.Collection( [ circle] );
    var cC = new OpenLayers.Geometry.Collection( circleCollection );
    var cF = new OpenLayers.Feature.Vector( cC ,circleAttributes );
    //aLayer.addFeatures( [ cF ] );
    dragCircleLayer.addFeatures( [ cF ] );
    //TBD:
    aLayer.addFeatures( featureOnCircle ); 
    var rotateFeature = function( feature, angle, origin ) {
      feature.geometry.rotate(angle, origin);
      feature.layer.drawFeature(feature);
    };
    var areaFeature = new OpenLayers.Feature.Vector(
      areaCenter
      ,{
        distance : opt.distance
        ,geom : opt.geom
        ,type: 'point'
        ,label : opt.areaName
      }
      ,{
        fillColor: "#ee9900"
        ,fillOpacity: 0.8
        //,hoverFillColor: "white"
        //,hoverFillOpacity: 0.8
        ,stroke: true
        ,strokeColor: "#ee9900"
        ,strokeOpacity: 1
        ,strokeWidth: 1
        ,strokeLinecap: "round"
        ,strokeDashstyle: "solid"
        ,labelYOffset: 20
        ,pointRadius: 6
        ,fontColor: "#0E88C8"
        ,fontSize: "25px"
        ,pointerEvents: "visiblePainted"
        ,cursor: "inherit"
        ,labelAlign: "cm"
        ,labelOutlineColor: "white"
        ,labelOutlineWidth: 3
        ,graphicName: "square"
        ,label : opt.areaName
      }
    );
    
    //TBD:
    aLayer.addFeatures( [ areaFeature ] );
    
    //var dragCircleF = this.dragCircleF = new OpenLayers.Control.DragFeature( dragCircleLayer );
    //this.mbox.map.addControl( this.dragCircleF );
    //this.dragCircleF.activate();
    
    return dragCircleLayer;
  }  

  Evaluator.prototype.createExploreAreaLayers = function( opt, as, embedEntity, urlid ) {
    
    var exploreAreaLayers = opt.layers;
    var showEmbedEntityIcon = opt.showEmbedEntityIcon;
    var areaCenter = new OpenLayers.Geometry.fromWKT(opt.geom);
    
    var mmhLayer = (as==="mapview")? this.createMmhLayer( opt, as ) : {};
    var polygonAreaLayer = this.createPolygonAreaLayer( opt, as );
    
    var dragCircleLayer = this.createDragCircleLayer( opt, as, areaCenter );
    
    
    if( embedEntity && showEmbedEntityIcon && embedEntity.icon ) {
      this.mbox.addEmbedEnity( embedEntity );
      this.mbox.popoutCenterPlace();
    }
    //this.mbox.map.setCenter( areaCenter.transform( new OpenLayers.Projection("EPSG:4326") ,this.mbox.map.getProjectionObject() ), 13 );
    this.mbox.map.setCenter(areaCenter, 0);
    //var layerExtent = aLayer.getDataExtent();
    var layerExtent = dragCircleLayer.getDataExtent();
    this.mbox.map.zoomToExtent(layerExtent,false);
  }

  Evaluator.prototype.createDynamicDataLayer = function ( layerName ) {
    layerName = layerName || "DynamicDataLayer";
    var dynamicDataLayerStyle = OpenLayers.Util.applyDefaults(
    /*{
       strokeWidth: 5
      ,strokeColor: vidteq.mainColor
      //,fillOpacity: 0
      ,pointRadius:1
      ,strokeOpacity: 1
      //,externalGraphic:'images/wap/triangle.png'
      //,graphicWidth:'20'
      //,graphicHeight:'20'
      //,strokeWidth:100
      //,strokeColor:'#be2926'
      ,fillColor:'#be2926'
      ,fillOpacity:1
      },*/
      OpenLayers.Feature.Vector.style['default']
    );
    var dynamicDataLayer = new OpenLayers.Layer.Vector(
      layerName
      ,{style: dynamicDataLayerStyle}
    );
    this.mbox.map.addLayer( dynamicDataLayer );
    this.mbox[ layerName ] = dynamicDataLayer;
    
    this.addSelectAndHover({
      layer: dynamicDataLayer
      ,select: true
    });
    
    return dynamicDataLayer;
  }
  
  Evaluator.prototype.createNemoCategoryLayers = function ( layerName, as ) {
    var defaults = this.createNemoCategoryLayers.defaults;
    var layerOptions = {
      styleMap: new OpenLayers.StyleMap({
        "default" : new OpenLayers.Style( defaults.defaultStyle
          ,{ context : defaults.context }
        )
        ,'select': OpenLayers.Util.applyDefaults( defaults.selectStyle
        , OpenLayers.Feature.Vector.style['select']
        )
      })
      ,isBaseLayer: false
      ,transitionEffect: 'resize'
      ,buffer: 0
      ,rendererOptions: {yOrdering: true}
    };
    
    //var strategy = this.createStrategy();
    //layerOptions.strategies = [ strategy ];
    
    var categoryLayer = new OpenLayers.Layer.Vector( layerName, layerOptions );
    
    var nL = this.mbox.nemoLayers;
    if( !nL[ as ] ) {
      nL[ as ] = {};
    }
    if( !nL[ as ].categoryLayer ) {
      nL[ as ].categoryLayer = [];
    }
    nL[ as ].categoryLayer.push(categoryLayer);
    this.mbox.map.addLayer(categoryLayer);
    
    this.addSelectAndHover({
      layer: categoryLayer
      ,select: true
      ,hover: true
      ,tooltipSelect: defaults.tooltipSelect
      ,tooltipUnselect: defaults.tooltipUnselect
      ,onFeatureSelect: defaults.onFeatureSelect
      ,onFeatureUnselect: defaults.onFeatureUnselect
    });
    
    return nL[ as ].categoryLayer;
  }
  Evaluator.prototype.createNemoCategoryLayers.defaults = {};
  Evaluator.prototype.createNemoCategoryLayers.defaults.defaultStyle = {
    externalGraphic: "${getIcon}"
    ,graphicOpacity: 1
    ,graphicWidth: 26
    ,graphicHeight: 32
    ,graphicName: "${getGraphicName}"
    //,fillColor: "${getFillColor}"//"#ffcc66"
    ,fillOpacity: 0.5
    //,pointRadius: "${getRadius}"
    ,strokeColor: "${getStrokeColor}"//"#ffcc66"
    ,strokeWidth: 2
    ,strokeOpacity: 0.8
    ,label : "${getDistance}"
    ,labelYOffset: -20
    ,fontOpacity: 1
   //,fontColor: 'red'//"${getFillColor}"
   //,graphicTitle: "${getTitle}"
   ,fontColor: "${getStrokeColor}"
   ,labelOutlineWidth: 0
   ,labelAlign: 'c'
   //,fontSize: "25px"
   //,labelOutlineColor: "#000000"
   ,fontWeight: "bold"
  };
  Evaluator.prototype.createNemoCategoryLayers.defaults.selectStyle = {
    graphicOpacity: 1
    ,graphicWidth: 40
    ,graphicHeight: 49
    ,fillOpacity: 0.5
    ,strokeWidth: 2
    ,strokeOpacity: 0.8
    ,labelYOffset: -20
    ,fontOpacity: 1
   ,labelOutlineWidth: 0
   ,labelAlign: 'c'
   ,fontWeight: "bold"
  };  
  Evaluator.prototype.createNemoCategoryLayers.defaults.context = {
    getIcon: function(feature) {
      if(feature.attributes.type==='point') {
        if( typeof(feature.attributes.iconSet)!=="undefined" ) {
          return feature.attributes.iconSet.categoryIcon;  
        }else if( typeof(feature.attributes.icon)!=="undefined" ) {
          return feature.attributes.icon;
        }
      }else {
        return;
     }
    },
    getTitle: function(feature) {
      if (typeof (feature.attributes.count) != 'undefined') {
          return feature.attributes.title;
      }else { return feature.attributes.title;}
    },
    getDistance: function(feature) {
      if (typeof (feature.attributes.distance) != 'undefined') {
          return feature.attributes.distance;
      }else { return '';}
    },
    getRadius: function(feature) {
      //console.log(feature.attributes);
      return 5;
    },
    getFillColor: function(feature) {
      if (typeof(feature.attributes.getCategoryColor)!="undefined") {
        return feature.attributes.getCategoryColor(feature.attributes.name);
      }else if (typeof(feature.attributes.color)!="undefined") {
        return feature.attributes.color;
      }
    },
    getStrokeColor: function(feature) {
      if( typeof(feature.attributes.getCategoryColor)!="undefined" && typeof(feature.attributes.type)!=='undefined'
          && ( feature.attributes.type==='point' || feature.attributes.type==='line' || feature.attributes.type==='circle') ) {
        return feature.attributes.getCategoryColor(feature.attributes.name);
      }else if( typeof(feature.attributes.color)!="undefined" && typeof(feature.attributes.type)!=='undefined'
          && ( feature.attributes.type==='point' || feature.attributes.type==='line' || feature.attributes.type==='circle') ) {
        return feature.attributes.color;
      }else {
        return "#000000";
      }
      
    }
  };
  Evaluator.prototype.createNemoCategoryLayers.defaults.onClickPopup = function( f ) {
    var fn= f.attributes.fn;
    /*var onFeaturePopupClose = function(event) {
     onFeatureUnselect();
    };*/
    if (typeof(fn)==="undefined") { return; }
    var popUpConfig = fn(f.data,f.popupType);
    var dtlPopup = popUpConfig.dtlPopup;
    if(typeof(dtlPopup)==="undefined" || dtlPopup===null) {
      return f;
    }
    var olPopupType ='FramedCloud';
    if( this.mbox.olPopupType ) {
      olPopupType = "Anchored";
    }
    var popup = this.createPopup({
      type:olPopupType
      ,feature: f
      ,content: dtlPopup
      ,close: true
    });
    
    f.popup = popup;
    return f;
  };
  Evaluator.prototype.createNemoCategoryLayers.defaults.onFeaturePopupClose = function(event) {
    //onFeatureUnselect(event);
    var f = event.feature;
    if(f===null) { return; }
    if(f.attributes.type === 'line' || f.attributes.type === 'circle' || typeof(f.attributes.type)==="undefined") { return; }
    if( f.popup!==null && typeof(f.popup)!=="undefined" ) {
      //$(".evalPopup").dialog("destroy").remove();
      //$(".evalPopup").dialog("close"); //remove previously opened jquery dialog box
      if( f.popup.map!==null && typeof(f.popup.map)!=="undefined" ) {
        //$(f.popup.div).hide( "drop", {direction: "left"}, 1000 );
        $(f.popup.div).fadeOut('slow');
        f.popup.map.removePopup(f.popup);
        f.popup.destroy();
        f.popup=null;
      }
    }
  };
  Evaluator.prototype.createNemoCategoryLayers.defaults.tooltipSelect = function(evnt) {
    var lastFeature = null;
    var popup = null;
    var f = evnt.feature;
    if(f.attributes.type === 'line' || f.attributes.type === 'circle' || typeof(f.attributes.type)==="undefined") { return; }
    if(typeof(clusterStrategy)!=="undefined" && !clusterStrategy(f)) { return; }
    
    if(popup!==null) {
      //$(popup.div).hide( "drop", {direction: "up"}, 1000 );
      $(popup.div).fadeOut('slow');
      popup.destroy();
      this.mbox.map.removePopup(popup);
      if(lastFeature!==null) {
        delete lastFeature.popup;
      }
      popup = null;
    }
    lastFeature = f;
    lastFeature.popupType="tooltip";
    var text="";    
    if(f.attributes.title) {
      text = f.attributes.title;
      if(!f.attributes.propertyType) { text += " - " + f.attributes.distanceLabel; }
    }else if(f.attributes.count) {
      text = f.attributes.count + " Properties";
    }
    
    if(f.popup===null) {
      var html = "<a style='font-size:10px;'>"+text+"</a>";
      popup = new OpenLayers.Popup(
        "activetooltip"
        //,new OpenLayers.LonLat(f.geometry.x,f.geometry.y)
        ,f.geometry.getBounds().getCenterLonLat()
        ,new OpenLayers.Size(10,10)
        ,html
        ,null
        ,true
        ,this.onFeaturePopupClose
      );
      popup.setBackgroundColor("white");
      popup.setBorder("0.5px solid grey");
      popup.panMapIfOutOfView = true;
      popup.contentDiv.style.overflow =  'hidden'; 
      //popup.contentDiv.style.padding = '3px';  
      //popup.contentDiv.style.margin = '2'; 
      popup.autoSize = true;
      f.popup=popup;
    }
    
    this.mbox.map.addPopup(f.popup);
    
    //TBD common hover style should be in a single place
    $('#activetooltip.olPopup').css('border-radius','10px');    
    $('#activetooltip.olPopup').css('text-align','center');    
    $('#activetooltip_contentDiv.olPopupContent').css('height','auto');    
      if (!self.navigator.userAgent.match(/MSIE\s[7]/)){ 
        $('#activetooltip_contentDiv.olPopupContent').css('width','auto');    
      }
    //$('.olPopupContent').css('width','auto');    
    $('#activetooltip_contentDiv.olPopupContent').css('white-space', 'nowrap');    
    $('#activetooltip.olPopup').css('height','auto');    
      if (!self.navigator.userAgent.match(/MSIE\s[7]/)){ 
        $('#activetooltip.olPopup').css('width','auto');    
      }
    //$('.olPopup').css('width','auto');
    $("#"+f.popup.contentDiv.id).effect("bounce", { times:5 }, 500);
  };  
  Evaluator.prototype.createNemoCategoryLayers.defaults.tooltipUnselect = function(event) {
    var f = event.feature;
    var scope = this;
    if( this.createNemoCategoryLayers.defaults.clusterStrategy ) {
      this.createNemoCategoryLayers.defaults.clusterStrategy.call( scope, f);
    }
    var lastFeature = null;
    var popup = null;
    if( f!==null && typeof(f.popup)!=="undefined" && f.popup!==null
        && typeof(f.popupType)!=="undefined"  && f.popupType!==null && f.popupType==="tooltip") {
      
      //$(f.popup.div).hide( "drop", {direction: "up"}, 1000 );
      $(f.popup.div).fadeOut('slow');
      this.mbox.map.removePopup(f.popup);
      f.popup.destroy();
      f.popup=null;
      popup = null;
      lastFeature = null;
    }
  };  
  Evaluator.prototype.createNemoCategoryLayers.defaults.clusterStrategy = function(f) {
    if(typeof(f.cluster)!=="undefined" && f.cluster) {
     /* var clusterBounds=new OpenLayers.Bounds();
      f.cluster.forEach(function(f){
          clusterBounds.extend(f.geometry);
      });
      Vidteq.map.zoomToExtent(clusterBounds);*/      
      if(f.cluster.length===1) {
        for (var p in f.cluster[0].attributes) {
          f.attributes[p] = f.cluster[0].attributes[p];
        }
        f.data = f.cluster[0].data;
        return true;
      }else {
        return false;
      }
    }else {
      return true;
    }
  };  
  Evaluator.prototype.createNemoCategoryLayers.defaults.onFeatureUnselect = function(evnt) {
    var f = evnt.feature;
    if(typeof f === "undefined" || f===null) { return; }
    if(f.attributes.type === 'line' || f.attributes.type === 'circle' || typeof(f.attributes.type)==="undefined") { return; }
    if( f.popup!==null && typeof(f.popup)!=="undefined" ) {
      //$(".evalPopup").dialog("destroy").remove();
      //$(".evalPopup").dialog("close"); //remove previously opened jquery dialog box
      if( f.popup.map!==null && typeof(f.popup.map)!=="undefined" ) {
        //$(f.popup.div).hide( "drop", {direction: "left"}, 1000 );
        $(f.popup.div).fadeOut('slow');
        f.popup.map.removePopup(f.popup);
        f.popup.destroy();
        f.popup=null;
      }
    }
  };  
  Evaluator.prototype.createNemoCategoryLayers.defaults.onFeatureSelect = function( evnt ) {
    var f = evnt.feature;
    
    if(f.attributes.type === 'line' || f.attributes.type === 'circle' || typeof(f.attributes.type)==="undefined") { return; }
    var selectedFeature = null;
    if(f!==null && f.popup!==null && typeof(f.popup)!=="undefined") {
      this.mbox.map.removePopup(f.popup);
      f.popup=null;
      selectedFeature = null;
    }
    selectedFeature = f;
    selectedFeature.popupType="detailed";
    var fn= selectedFeature.attributes.fn;
    var evalPopup
    ,jquerydialog
    ,heading
    ,evalObj
    ,propScore
    ,lonlatId
    ,addressIsPresent
    ,contactIsPresent;
    if (typeof(fn)!=="undefined") { 
      var dtls = fn(selectedFeature.data,selectedFeature.popupType);
      evalPopup = dtls.evalPopup;
      heading = dtls.heading;
      evalObj = dtls.evalObj;
      propScore = typeof(evalObj)!=="undefined"? evalObj.score() : {};
      lonlatId = dtls.lonlatId;
      addressIsPresent = dtls.addressIsPresent;
      contactIsPresent = dtls.contactIsPresent;
    }
    var enhancedFeature = this.createNemoCategoryLayers.defaults.onClickPopup.call( this, selectedFeature );
    var dtlPopup = enhancedFeature.popup;
    if(typeof(dtlPopup)!=="undefined" && dtlPopup!==null) {
      selectedFeature.popup = dtlPopup;
      
      //map.addPopup(dtlPopup,true);
      var popupDiv = this.addPopupToMap(dtlPopup,true);
      document.getElementById('categoryPopup').setClassName='categoryPopupDiv';
      if (self.navigator.userAgent.match(/MSIE/)){
      //var newHeight=htmlContent.size.h+5;
      //  this.openCatPopup.setSize(OpenLayers.Size(htmlContent.size.w+5,htmlContent.size.h+5));
        $("#catmain").css('width','290px');
        $("#nameCat").css('width','290px');
      }
      
      selectedFeature.popup.updateSize();
      $(popupDiv).fadeIn('slow');
      //$(popupDiv).show( "drop", {direction: "up"}, 1000 );
    }
    if(typeof(evalPopup)!=="undefined" && evalPopup!==null) {
        //var lonlatId=selectedFeature.geometry.x.toString().replace(/\.+/g,'')+selectedFeature.geometry.y.toString().replace(/\.+/g,'');
        //if($('div[id^="resultsView"]').length) { $('div[id^="resultsView"]').remove(); }
        //$('div[id^="resultsView"]').remove();    
        //$(".resultsView").remove();//remove previous resultview list
        
        $(".evalPopup").dialog("destroy").remove();
        $(".evalPopup").dialog("close"); //remove previously opened jquery dialog box
        
        //$("#toolList-1").text("Show Top 10");
        //$("#resultsView"+0).animate({height: "show", width: "show"}, 1500, "easeInOutCirc");
        var jquerydialogTitle = '<div class="propheading">'+heading+'</div>';
          
        jquerydialog = enhancedFeature.jquerydialog = $(evalPopup).dialog({
          dialogClass: "no-title-bar"
          ,resizable: true
          ,title: jquerydialogTitle
          ,position: {
             my: 'left top'
            ,at: 'left+7% top+14%'
            ,of: $('#mapbox')
          }
          ,minHeight: '82'
          ,minWidth: '360'
        });
        
        jquerydialog.parents('.ui-dialog').css({
          'top':'100px',
          'left':'70px'
        });
        
        $("#"+lonlatId+"-dtltabs").tabs();
        
        if(typeof(evalObj)!=="undefined") {
          $("#"+lonlatId+"-propRating").raty({
             path: 'images'
            ,readOnly: true
            ,hints: ['Below Average','Below Average', 'Average','Average', 'Good', 'Good', 'Excellent', 'Excellent', 'Superior', 'Superior']
            ,noRatedMsg: "No Star"
            ,number: 10
            ,scoreName: "propscore"
            ,score: propScore
          });
          evalObj._pmetrics("pmetrics-"+lonlatId);
          evalObj._pstats("pstats-"+lonlatId);
          evalObj._psimulate("psimulate-"+lonlatId);
          $("#"+lonlatId+"-dtltabs").tabs();
          $("#"+selectedFeature.popup.contentDiv.id).effect("bounce", { times:5 }, 500);
          $("#"+selectedFeature.popup.id).effect("bounce", { times:3 }, 300);
          jquerydialog.parents('.ui-dialog').css({
            'top':'100px',
            'left':'70px'
          });
          $('#ca-container').contentcarousel();
        }
    }
  
    /*$("#"+lonlatId+"-dtltabs").tabs({
      event: "mouseover"
    });*/
    //$("#"+selectedFeature.popup.contentDiv.id).effect("bounce", { times:5 }, 500);
    //$("#"+selectedFeature.popup.id).effect("bounce", { times:3 }, 300);
  };
  
  root.Evaluator = Evaluator;
}(this, document, 'vidteq'));
