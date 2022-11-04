if (typeof(vidteq) == 'undefined') { vidteq = {}; }

vidteq._tiler = function (venue360) {
  this.venue360 = venue360;
  //this.tiles = [];
  this.tiles = {};
  this.tH = {};
  this.tI = {}; // Tile info
  this.inP = {};
  this.zoomingInfo = {};
  this.stopRender = true;
  this.cVOrder = {ll:2,ul:0,lr:3,ur:1}; // Corner Vertex order TBD
  //this.projector = new THREE.Projector();
}

vidteq._tiler.prototype.getFocus = function(bbox,tI) {
  this.fillC(bbox);
  x = -(this.inP.bbox.c.lon-bbox.c.lon)/this.inP.resTu+tI.tu/2;
  z = (this.inP.bbox.c.lat-bbox.c.lat)/this.inP.resTu-tI.tu/2;
  return new THREE.Vector3(x,tI.gY,z);
}

vidteq._tiler.prototype.getSeedTile = function(bbox,tI,reInit) {
  this.fillC(bbox);
  // First get the center index
  //var i = parseInt(tI.w/2);
  //var j = parseInt(tI.h/2);
  var i = tI.iMin+parseInt((tI.iMax-tI.iMin+0.5)/2);
  var j = tI.jMin+parseInt((tI.jMax-tI.jMin+0.5)/2);
  var lon = tI.gb.ll.lon + (i-tI.iMin)*tI.resTile;
  var lat = tI.gb.ll.lat + (j-tI.jMin)*tI.resTile;
  //var x = -tI.tu*(bbox.c.lon-lon)/tI.resTile;
  //var z = tI.tu*(bbox.c.lat-lat)/tI.resTile;
  var x = -tI.tu*(bbox.c.lon-lon)/tI.resTile+tI.tu/2;
  var z = tI.tu*(bbox.c.lat-lat)/tI.resTile-tI.tu/2;
 
  if (reInit) {
    //x = -tI.tu*(this.inP.bbox.c.lon-lon)/tI.resTile;
    //z = tI.tu*(this.inP.bbox.c.lat-lat)/tI.resTile;
    x = -(this.inP.bbox.c.lon-lon)/this.inP.resTu+tI.tu/2;
    z = (this.inP.bbox.c.lat-lat)/this.inP.resTu-tI.tu/2;
    //x = -this.inP.tu*(this.inP.bbox.c.lon-lon)/tI.resTile;
    //z = this.inP.tu*(this.inP.bbox.c.lat-lat)/tI.resTile;

  }
  var p = new THREE.Vector3(x,tI.gY,z);
  var r = {x:-90*Math.PI/180};
  var oneTile = {
    i:i
    ,j:j
    ,asf:{n:true,e:true,s:true,w:true}
    ,p:p
    ,r:r
    ,ll:{
      lon:lon
      ,lat:lat
    }
    ,c:{
      lon:lon+tI.resTile/2
      ,lat:lat+tI.resTile/2
    }
    ,z:tI.z
    ,res:tI.res
    ,resTile:tI.resTile
    ,tu:tI.tu
  };
  $.extend(oneTile,this.getTileIdx(oneTile));
  return oneTile;
}

vidteq._tiler.prototype.checkIfOverlaps = function(curTi,oldTi) {
  var iMinInRange = false;
  if (oldTi.iMin <= curTi.iMin && curTi.iMin <= oldTi.iMax) { 
    iMinInRange = true;
  }
  var iMaxInRange = false;
  if (oldTi.iMin < curTi.iMax && curTi.iMax < oldTi.iMax) { 
    iMaxInRange = true;
  }
  var jMinInRange = false;
  if (oldTi.jMin <= curTi.jMin && curTi.jMin <= oldTi.jMax) { 
    jMinInRange = true;
  }
  var jMaxInRange = false;
  if (oldTi.jMin <= curTi.jMax && curTi.jMax <= oldTi.jMax) { 
    jMaxInRange = true;
  }
  if ((iMinInRange || iMaxInRange) && (jMinInRange || jMaxInRange)) {
    return true;
  }
  return false;
}

//vidteq._tiler.prototype.reconcileIJMinMax = function(curTi,oldTi) {
//  var deltaLon = curTi.gb.ll.lon - oldTi.gb.ll.lon;
//  var deltaLat = curTi.gb.ll.lat - oldTi.gb.ll.lat;
//  var deltaI = parseInt((deltaLon + curTi.resTile/2)/curTi.resTile);
//  var deltaJ = parseInt((deltaLat + curTi.resTile/2)/curTi.resTile);
//  curTi.iMin += deltaI;
//  curTi.iMax += deltaI;
//  curTi.jMin += deltaJ;
//  curTi.jMax += deltaJ;
//}

vidteq._tiler.prototype.reconcileIJMinMax = function(curTi,origin) {
  if (origin.gb && origin.gb.ll) { 
    var deltaLon = curTi.gb.ll.lon - origin.gb.ll.lon;
    var deltaLat = curTi.gb.ll.lat - origin.gb.ll.lat;
    var deltaI = parseInt((deltaLon + curTi.resTile/2)/curTi.resTile);
    var deltaJ = parseInt((deltaLat + curTi.resTile/2)/curTi.resTile);
  } else {
    var deltaI = curTi.lonIdx - origin.lonIdx;
    var deltaJ = curTi.latIdx - origin.latIdx;
  }
  curTi.iMin += deltaI;
  curTi.iMax += deltaI;
  curTi.jMin += deltaJ;
  curTi.jMax += deltaJ;
}

vidteq._tiler.prototype.getSuperBBox = function(one,two) {
  var bbox = {
    ll:{
      lon:Math.min(one.ll.lon,two.ll.lon)
      ,lat:Math.min(one.ll.lat,two.ll.lat)
    }
    ,ur:{
      lon:Math.max(one.ur.lon,two.ur.lon)
      ,lat:Math.max(one.ur.lat,two.ur.lat)
    }
  };
  return bbox;
}

vidteq._tiler.prototype.seedAndGerminate = function(bbox,tI,reInit,callback,flag) {
  console.log(tI);
  var oneTile = this.getSeedTile(bbox,tI,reInit);
  if(flag){
  //this.reInitFocus =  oneTile.p.clone();
  }
  this.oldTI = this.tI;
  this.oldTiles = this.tiles;
  this.tiles = {};
  this.oldTH = this.tH;
  this.tH = {};
  this.tI = tI;
  this.tiles[tI.z] = [];
  this.tiles[tI.z].push(oneTile);
  var growth = {
    iMin:tI.iMin
    ,iMax:tI.iMax
    ,jMin:tI.jMin
    ,jMax:tI.jMax
    ,gate:0
  };
  var that = this;
  this.germinateTile(oneTile,function () { 
    that.store('growth',growth,30);
    that.getNextSide(growth,function (res) {
      // I need to delete old tiles
      var z = Object.keys(that.oldTiles)[0];
      for (var i in that.oldTiles[z]) {
        that.deleteTile(that.oldTiles[z][i]);
      }
      if (callback) { callback(res); }
    });
  });
}

vidteq._tiler.prototype.planATravel = function(bbox,tI) {
  var n1 = this.lastBbox.c;
  this.fillC(bbox);
  var n2 = bbox.c;
  var dist = Math.sqrt(
    (n1.lon - n2.lon)*(n1.lon - n2.lon)+
    (n1.lat - n2.lat)*(n1.lat - n2.lat)
  );
  var zDiff = this.tI.z - tI.z;  //old Z - current Z;
  var zDiffA = Math.abs(zDiff);
  var paths = [];
  var pathsZ = [];   //debug
  var travels = [];
  var travelsZ = [];
  var pFactor = 256; // pleasing factor = 256 px/sec
  var zTime = 1; // pleasing when change zoom level = 1 sec

  // hike is the coarser zoom level you attain before we get finer
  // zDiff is -ve - you are anti hiking, you are travelling to finer
  //     - extra is hike itself 
  // zDiff is +ve - you are already hiking, you are travelling coarser
  //   if hike is > zDiff - we need additional hike more than your travel
  //       extra is hike - zDiff
  //   else required hike is already part of your travel
  //       extra is zero
  var p = [0,1,2,3,4,5,6,7,8];
  for (var i in p) {
    var hike = p[i];
    var hikeZ = this.tI.z + hike;
    var extra = 
      zDiff <= 0 ? hike : (
        hike > zDiff ? hike - zDiff : 0 
      );  
    var tRes = this.tI.resA[this.tI.z-hike]; // travel Resolution
    var time=zDiffA*zTime+
      dist/(pFactor*tRes)+
        2*extra*zTime;
    paths.push(time );
    
    var travel = [];
    var travelZ = [];
    var peakZ = Math.min(this.tI.z,tI.z)-hike;
    if (peakZ < 10) { continue; } 
    for (var z = this.tI.z;z> peakZ;z--) {
      travel.push(z+" to "+(z-1));
      travelZ.push({from:z,to:(z-1)});
    }
    travel.push("travelling in "+peakZ);
    travelZ.push({"travellingIn ":peakZ,from:peakZ,to:peakZ});
    for (var z = peakZ;z<tI.z;z++) {
      travel.push(z+" to "+(z+1));
      travelZ.push({from:z,to:(z+1)});
    }
    travels.push(travel);
    travelsZ.push({totalTime:time,travel:travelZ});
    //travelsZ.push({totalTime:dist/(pFactor*tRes),travel:travelZ});
  }
  console.log("travel times are ");
  console.log(paths);
  console.log(travels);
  console.log("travelsZ",travelsZ);
  travelsZ.sort(function(a,b){return a.totalTime-b.totalTime; });
  console.log("Selected travel Plan",travelsZ[0]);
  return travelsZ[0];
}

vidteq._tiler.prototype.panningTowards = function(newBbox,lastBbox) {
  var sides={};
  //console.log(newBbox);
  //console.log(lastBbox);alert()
  if (newBbox.ll.lat>lastBbox.ll.lat && newBbox.ll.lon>lastBbox.ll.lon){
    sides.one="n";
    sides.two="e";
  } else if (newBbox.ll.lat>lastBbox.ll.lat && newBbox.ll.lon<lastBbox.ll.lon){
    sides.one="n";
    sides.two="w";
  } else if (newBbox.ll.lat<lastBbox.ll.lat && newBbox.ll.lon>lastBbox.ll.lon){
    sides.one="s";
    sides.two="e";
  } else if (newBbox.ll.lat<lastBbox.ll.lat && newBbox.ll.lon<lastBbox.ll.lon){
    sides.one="s";
    sides.two="w";
  }
  
  else if(newBbox.ll.lat==lastBbox.ll.lat && newBbox.ur.lat==lastBbox.ur.lat
  && newBbox.ll.lon>lastBbox.ll.lon){sides.one="e";}
  else if(newBbox.ll.lat==lastBbox.ll.lat && newBbox.ur.lat==lastBbox.ur.lat
  && newBbox.ll.lon<lastBbox.ll.lon){sides.one="w";}
  else if(newBbox.ll.lon==lastBbox.ll.lon && newBbox.ur.lon==lastBbox.ur.lon
  && newBbox.ll.lat>lastBbox.ll.lat){sides.one="n";}
  else if(newBbox.ll.lon==lastBbox.ll.lon && newBbox.ur.lon==lastBbox.ur.lon
  && newBbox.ll.lat<lastBbox.ll.lat){sides.one="s";}
  return sides;
}

vidteq._tiler.prototype.getBoxesForCoarseTravel = function(toZ,agl,fromBbox) {
  var oneTraverse = this.tI.resA[toZ]*128; // in dd
  var newLl = {
    lon:fromBbox.ll.lon + oneTraverse * Math.cos(agl)
    ,lat:fromBbox.ll.lat + oneTraverse * Math.sin(agl)
  };
  var newBbox = {
    ll:newLl
    ,ur:{
      lon:newLl.lon+2*(fromBbox.ur.lon-fromBbox.ll.lon)
      ,lat:newLl.lat+2*(fromBbox.ur.lat-fromBbox.ll.lat)
    }
  };
  var superBbox = this.getSuperBBox(newBbox,fromBbox);
  this.fillC(superBbox);
  var boxes = {
    fromBox:fromBbox
    ,toBox:newBbox
    ,superBox:superBbox
  };
  return boxes;
}


//vidteq._tiler.prototype.travelCoarse = function(oneItnry,agl,fromBbox,callback) {
//  var oneTraverse = this.tI.resA[oneItnry.to]*128; // in dd
//  var newLl = {
//    lon:fromBbox.ll.lon + oneTraverse * Math.cos(agl)
//    ,lat:fromBbox.ll.lat + oneTraverse * Math.sin(agl)
//  };
//  var newBbox = {
//    ll:newLl
//    ,ur:{
//      lon:newLl.lon+2*(fromBbox.ur.lon-fromBbox.ll.lon)
//      ,lat:newLl.lat+2*(fromBbox.ur.lat-fromBbox.ll.lat)
//    }
//  };
//  var superBbox = this.getSuperBBox(newBbox,fromBbox);
//  this.fillC(superBbox);
//  var travel = {
//    from:fromBbox
//    ,to:newBbox
//    ,superBox:superBbox
//  };
//  this.store('travels',travel,10);
//  this.hikeUp(superBbox,newBbox,travel,function(){
//    //alert("done with one");
//    callback(newBbox);
//  });
//  return newBbox;
//}

vidteq._tiler.prototype.getBoxesForFineTravel = function(fromZ,agl,toBbox) {
  var oneTraverse = this.tI.resA[fromZ]*128; // take bigger of 
  var newUr = {
    lon:toBbox.ur.lon - oneTraverse * Math.cos(agl)
    ,lat:toBbox.ur.lat - oneTraverse * Math.sin(agl)
  };
  var newBbox = {
    ll:{
      lon:newUr.lon-(toBbox.ur.lon-toBbox.ll.lon)*2
      ,lat:newUr.lat-(toBbox.ur.lat-toBbox.ll.lat)*2
    }
    ,ur:newUr
  };
  var superBbox = this.getSuperBBox(newBbox,toBbox);
  this.fillC(superBbox);
  
  var boxes = {
    fromBox:newBbox
    ,toBox:toBbox
    ,superBox:superBbox
  };
  return boxes;
}

vidteq._tiler.prototype.hikeDown = function(superBbox,bbox,toZ,travel,targetBbox,pCallback,callback) {
  var that=this;
  setTimeout(function () {
    that.tI.zooming = 'fine';
    var newTiles = that.checkAddFineTiles({},function(){
      that.clearZoomInfo();
      that.handleZoomChangeInHikeDown(newTiles,superBbox,bbox,toZ,travel,targetBbox,pCallback,callback);
    });
  },1000);
}

vidteq._tiler.prototype.handleZoomChangeInHikeDown = function(newTiles,superBbox,toBbox,toZ,travel,targetBbox,pCallback,callback) {
  var tu=400;
  var targetTi = this.getTi(toBbox,toZ);
  var tI = this.getTi(superBbox,toZ);  // just for debug
  travel.superTi = tI;  // just for debug
  this.tiles[toZ] = newTiles;
  travel.finerEndTi = targetTi;
  travel.finerStartTiles = newTiles;
  var origin = this.zoomingInfo[toZ];
  this.reconcileIJMinMax(targetTi,origin);
  this.reconcileIJMinMax(tI,origin); // just for debug
  targetTi.tu = tu * Math.pow(2,(this.inP.z-tI.z));
  targetTi.urlSeed = this.getMapTilesUrl()
  console.log('handleZoomChangeInHikeDown');

  targetTi.gY = -15;
  //-----
  //var llTile = null; 
  //for (var i in newTiles) {
  //  if (newTiles[i].lonIdx != tI.lonIdx) { continue; }
  //  if (newTiles[i].latIdx != tI.latIdx) { continue; }
  //  llTile = newTiles[i];
  //}
  //var iMin = llTile.i + (targetTi.lonIdx-llTile.lonIdx);
  //var jMin = llTile.j + (targetTi.latIdx-llTile.latIdx);
  //var iMax = llTile.i + (targetTi.lonIdx-llTile.lonIdx)+(targetTi.w-1);
  //var jMax = llTile.j + (targetTi.latIdx-llTile.latIdx)+(targetTi.h-1);
  var iMin = targetTi.iMin;
  var jMin = targetTi.jMin;
  var iMax = targetTi.iMax;
  var jMax = targetTi.jMax;
    
  //this.updateTileInfo(tI);
  var growth = {      
    iMin:iMin
    ,iMax:iMax
    ,jMin:jMin
    ,jMax:jMax
    ,gate:0
  };      
  travel.superGrowth = growth;
  this.store('growth',growth,30);
  //this.triggerNextSide(growth,callback);
  
  //-----
  //  var growth = {
  //    iMin:targetTi.iMin
  //    ,iMax:targetTi.iMax
  //    ,jMin:targetTi.jMin
  //    ,jMax:targetTi.jMax
  //    ,gate:0
  //  };                 
  //if(!('reInitFocus' in this)){
    //var forFocus = this.getSeedTile(toBbox,targetTi,true);
    //console.log("targetTi",targetTi);
    this.reInitFocus =  this.getFocus(toBbox,targetTi);
    //this.reInitZ =  targetTi.z;
    this.reInitFocusPoint=travel.travelPoint;
    //console.log("this.reInitFocus",this.reInitFocus);
    //console.log("this.reInitFocus",toBbox);
  //}
  
  var that=this;             
  this.triggerNextSide(growth,function () {
    if(JSON.stringify(targetBbox)===JSON.stringify(toBbox)){ 
      that.lastBbox = toBbox; 
      if(pCallback){pCallback();}
    }
    
    if (callback) { callback(); }
  });            
}

//vidteq._tiler.prototype.travelFine = function(oneItnry,agl,fromBbox,callback) {
//  var oneTraverse = this.tI.resA[oneItnry.from]*128; // take bigger of 
//  var newUr = {
//    lon:toBbox.ur.lon - oneTraverse * Math.cos(agl)
//    ,lat:toBbox.ur.lat - oneTraverse * Math.sin(agl)
//  };
//  var newBbox = {
//    ll:{
//      lon:newUr.lon-(toBbox.ur.lon-toBbox.ll.lon)*2
//      ,lat:newUr.lat-(toBbox.ur.lat-toBbox.ll.lat)*2
//    }
//    ,ur:newUr
//  };
//  var superBbox = this.getSuperBBox(newBbox,fromBbox);
//  this.fillC(superBbox);
//  
//  var travel = {
//    from:fromBbox
//    ,to:newBbox
//    ,superBox:superBbox
//  };
//  var targetTi=this.getBestTi(newBbox,{w:this.inP.width,h:this.inP.height});
//  var tI = this.getTi(superBbox,targetTi.z);
//  this.store('travels',travel,10);
//  console.log(this.getBestTi(fromBbox,{w:this.inP.width,h:this.inP.height}));
//  
//  var that=this;
//  //--------------------
//  setTimeout(function () {
//    that.tI.zooming = 'fine';
//    var newTiles = that.checkAddFineTiles({},function(){            
//      that.clearZoomInfo();
//      that.tiles[that.tI.z] = newTiles;
//      //-----
//      var llTile = null; 
//      for (var i in newTiles) {
//        if (newTiles[i].lonIdx != tI.lonIdx) { continue; }
//        if (newTiles[i].latIdx != tI.latIdx) { continue; }
//        llTile = newTiles[i];
//      }
//      var iMin = llTile.i + (targetTi.lonIdx-llTile.lonIdx);
//      var jMin = llTile.j + (targetTi.latIdx-llTile.latIdx);
//      var iMax = llTile.i + (targetTi.lonIdx-llTile.lonIdx)+(targetTi.w-1);
//      var jMax = llTile.j + (targetTi.latIdx-llTile.latIdx)+(targetTi.h-1);
//        
//      //this.updateTileInfo(tI);
//      var growth = {      
//        iMin:iMin
//        ,iMax:iMax
//        ,jMin:jMin
//        ,jMax:jMax
//        ,gate:0
//      };      
//      travel.superGrowth = growth;
//      that.store('growth',growth,30);
//      //that.triggerNextSide(growth,callback);
//    
//      //-----
//    //  var growth = {
//    //    iMin:targetTi.iMin
//    //    ,iMax:targetTi.iMax
//    //    ,jMin:targetTi.jMin
//    //    ,jMax:targetTi.jMax
//    //    ,gate:0
//    //  };                              
//      that.triggerNextSide(growth,function () {
//        //that.lastBbox = newBbox;
//        if (callback) { callback(); }
//      });            
//    });
//  },1000);
//  //--------------------
//  return newBbox;
//}

vidteq._tiler.prototype.calFocusDistRatio = function(itnry,l,d) {
  console.log(itnry);
  console.log(l);console.log(d);
  var rets=[];var ret=[];var s=0,t=0;
  for(var i in itnry.travel){
    var x=this.distToC(itnry.travel[i].fromBox,itnry.travel[i].toBox);
    s+=x;
    rets.push(x);
  }
  for(var i=0;i<rets.length;i++){
    t=t+rets[i]/s;
    itnry.travel[i].travelPoint=t;
    if(i==rets.length-1){ret.push(1);}
    else{ret.push(t);}
  }
  console.log(s);
  console.log(ret);
  return ret;
}


vidteq._tiler.prototype.distToC = function(fromBox,toBox) {
  if(!fromBox.c){this.fillC(fromBox);}
  if(!toBox.c){this.fillC(toBox);}
  return dist = Math.sqrt(
    (fromBox.c.lon - toBox.c.lon)*(fromBox.c.lon - toBox.c.lon)+
    (fromBox.c.lat - toBox.c.lat)*(fromBox.c.lat - toBox.c.lat)
  );
}

vidteq._tiler.prototype.fillSuperBoxes = function(itnry,lastBox,bbox,agl) {
  var finalHikeUpBbox = lastBox;
  for(var i=0;i<itnry.travel.length;i++){
    var oneT = itnry.travel[i]
    if (oneT.to < oneT.from) {
      var boxes = this.getBoxesForCoarseTravel(oneT.to,agl,finalHikeUpBbox);
      $.extend(oneT,boxes);
      finalHikeUpBbox = boxes.toBox;
    }
  }
  var startHikeDownBbox = bbox;
  for(var i=itnry.travel.length-1;i>=0;i--){
    var oneT = itnry.travel[i]
    if (oneT.to > oneT.from) {
      var boxes = this.getBoxesForFineTravel(oneT.from,agl,startHikeDownBbox);
      $.extend(oneT,boxes);
      startHikeDownBbox = boxes.fromBox;
    }
  }
  for(var i=0;i<itnry.travel.length;i++){
    var oneT = itnry.travel[i]
    if (oneT.to == oneT.from) {
      var boxes = {
        fromBox:finalHikeUpBbox
        ,toBox:startHikeDownBbox
        ,superBox:this.getSuperBBox(finalHikeUpBbox,startHikeDownBbox)
      };
      $.extend(oneT,boxes);
    }
  } 
}

vidteq._tiler.prototype.exeTravel = function(itnry,bbox,tI,callback) {
  var that=this;
  //-----------------
  var oneItnry = itnry.travel[0];
  var agl = Math.atan2(
    bbox.c.lat - this.lastBbox.c.lat
    ,bbox.c.lon - this.lastBbox.c.lon
  );
  var lastBox=that.lastBbox;
  this.fillSuperBoxes(itnry,lastBox,bbox,agl);
  var trajPoints=this.trajPoints=this.calFocusDistRatio(itnry,lastBox,bbox);
  var ob={a:1,trajPoints:trajPoints};
  this.store('trajPoint',trajPoints,10);  
  console.log("exeTravel",itnry)

  for (var i in itnry.travel) {
    (function () {
      var idx = i;
      $(document).queue('myQ',function (nextCb) {
        var travel = itnry.travel[idx];
        that.store('travels',travel,10);
        if (travel.from > travel.to) {
          that.hikeUp(travel.superBox,travel.toBox,travel.to,travel,function(){
            console.log("itnry "+idx+" complete");
            nextCb();
          });
        } else if (travel.from < travel.to) {
          that.hikeDown(travel.superBox,travel.toBox,travel.to,travel,bbox,callback,function(){
            console.log("itnry "+idx+" complete");
            nextCb();
          });
        } else { // TBD lateral travel
          nextCb();
        }
      });
    })();
  }
  $(document).dequeue('myQ');
  return; 

  $(document)
  .queue(function(nextCb){
    var travel = itnry.travel[0];
    that.store('travels',travel,10);
    that.hikeUp(travel.superBox,travel.toBox,travel,function(){
      console.log("itnry 0 complete");
      nextCb();
    });
  })
  .queue(function(nextCb){
    var travel = itnry.travel[1];
    that.store('travels',travel,10);
    that.hikeUp(travel.superBox,travel.toBox,travel,function(){
      console.log("itnry 1 complete");
      nextCb();
    });
  })    
  .queue(function(nextCb){
    var travel = itnry.travel[2];
    that.store('travels',travel,10);
    that.hikeUp(travel.superBox,travel.toBox,travel,function(){
      console.log("itnry 2 complete");
      nextCb();
    });
  })
  .queue(function(nextCb){
    var travel = itnry.travel[4];
    that.store('travels',travel,10);
    that.hikeDown(travel.superBox,travel.toBox,travel.to,travel,function(){
      console.log("itnry 4 complete");
      nextCb();
    });
  })
  .queue(function(nextCb){
    var travel = itnry.travel[5];
    that.store('travels',travel,10);
    that.hikeDown(travel.superBox,travel.toBox,travel.to,travel,function(){
      console.log("itnry 5 complete");
      nextCb();
    });
  });
  
  blah();
}

vidteq._tiler.prototype.getNextBbox = function(bbox,towards) {
  //console.log(bbox);alert(); 
  var ret=bbox;
  if(towards.one=="n" && (towards.two=="e" )){
    var side="ne";
    ret=this.GetSupLL(bbox,side);
  }
  if(towards.one=="n" && (towards.two=="w" )){
    var side="nw";
    ret=this.GetSupLL(bbox,side);
  }else{return ret;}
  console.log(ret);alert();
  return ret;
}

vidteq._tiler.prototype.GetSupLL = function(bbox,side) {
  var llLon=bbox.ll.lon;
  var llLat=bbox.ll.lat;
  var urLon=bbox.ur.lon;
  var urLat=bbox.ur.lat;
  var lonDiff=0  
  var latDiff=0; 
  var lr={lon:bbox.ur.lon,lat:bbox.ll.lat};
  var ul={lon:bbox.ll.lon,lat:bbox.ur.lat};
  if(side=="ne"){
  var llLon=(bbox.ll.lon+this.tI.resTile*Math.cos(45));     //this.tI.tileSizePx*Math.cos(45)
  var llLat=(bbox.ll.lat+this.tI.resTile*Math.cos(45));     //this.tI.tileSizePx*Math.cos(45)
  var lonDiff=2*(bbox.ur.lon-bbox.ll.lon);
  var latDiff=2*(bbox.ur.lat-bbox.ll.lat);
  var urLon=(llLon+lonDiff);     //this.tI.tileSizePx*Math.cos(45)
  var urLat=(llLat+latDiff);     //this.tI.tileSizePx*Math.cos(45)
  }else if(side=="nw"){
  var llLon=(lr.lon-this.tI.resTile*Math.cos(45));     //this.tI.tileSizePx*Math.cos(45)
  var llLat=(lr.lat-this.tI.resTile*Math.cos(45));     //this.tI.tileSizePx*Math.cos(45)
  var lonDiff=2*(bbox.ur.lon-bbox.ll.lon);
  var latDiff=2*(bbox.ur.lat-bbox.ll.lat);
  llLon-=lonDiff;  
  var urLon=(llLon+lonDiff);     //this.tI.tileSizePx*Math.cos(45)
  var urLat=(llLat+latDiff);     //this.tI.tileSizePx*Math.cos(45)  
  
  }
  //else{return bbox;}
  var bbox={
    ll:{lon:llLon  ,lat:llLat },
    ur:{lon:urLon  ,lat: urLat}  
  };
  
  //console.log(ret);alert();
  return bbox;
}

vidteq._tiler.prototype.recursiveTravelThePlan = function(towards,side,bbox,inp,cb) {
  console.log("recursiveTravelThePlan",inp);
  if(inp%2==0){side=towards.one;}
  else{side=towards.two;}
  this.getNextSideForPan(towards,side,bbox,inp,cb);  
}

vidteq._tiler.prototype.getNextSideForPan = function(towards,side,bbox,inp,cb) {
  console.log(this.tiles[this.tI.z]);
  var tcSides = this.computeClusterSides(this.tiles[this.tI.z]);
  console.log(tcSides)  ;      
  var changes = {add:[],del:[]};

  console.log(side)  ;
  var electedSide = {add:{side:side,tiles:tcSides[side].tiles}};
  console.log(electedSide);console.log(bbox);

  //if(side =="n" && electedSide.add.tiles[0].tile.ll.lat>bbox.ll.lat 
    //&& electedSide.add.tiles[0].tile.ll.lon>bbox.ll.lonn){return;}
  console.log(electedSide)  ;
  var that=this;
  this.addOrDelASide(electedSide,changes,function(){
    console.log("doneeeeeee",changes);
    console.log("side",side);
    inp++;
    that.recursiveTravelThePlan(towards,side,bbox,inp,{});
    });
    console.log("doneee",changes);
  if (changes.del.length) {
      for (var i in changes.del) {
        this.deleteTile(changes.del[i]);
      }
    }
  if (changes.add.length) {
    this.iter++;
    this.tiles[this.tI.z] = this.tiles[this.tI.z].concat(changes.add);
  }

}

vidteq._tiler.prototype.fillC = function(bbox) {
  if (!bbox.c) {
    bbox.c = {
      lon:bbox.ll.lon + (bbox.ur.lon-bbox.ll.lon)/2
      ,lat:bbox.ll.lat + (bbox.ur.lat-bbox.ll.lat)/2
    };
  }
}

vidteq._tiler.prototype.reInit = function(bbox,callback) {
  var that = this;
  var tu = 400;
  this.store('newBbox',bbox,30);
  var tI = this.getBestTi(bbox,{w:this.inP.width,h:this.inP.height});
  //tI.tu = tu;
  var n1 = this.lastBbox?this.lastBbox.c : this.inP.bbox.c;
  this.fillC(bbox);
  var n2 = bbox.c;
  var dist = Math.sqrt(
    (n1.lon - n2.lon)*(n1.lon - n2.lon)+
    (n1.lat - n2.lat)*(n1.lat - n2.lat)
  );
  var time=(dist/this.tI.resA[tI.z])/256;
  tI.tu = tu * Math.pow(2,(this.inP.z-tI.z));
  tI.urlSeed = this.getMapTilesUrl()
  console.log('reInit');

  tI.gY = -10;
  this.reInitTI=$.extend({},tI);
  this.store('newTi',tI,30);
  console.log("current TI",tI.z);
  console.log(" Old TI",this.tI.z);
    //var forFocus = this.getSeedTile(bbox,tI,true);
    //this.reInitFocus = forFocus.p.clone();
    this.startCamPos=this.venue360.camera.position.clone();
    this.endFocus =  this.getFocus(bbox,tI);
    console.log("this.endFocus",this.endFocus);
    //this.reInitZ =  targetTi.z;
    this.reInitZ =  tI.z;
    this.finalReInitZ =  tI.z;
    //this.totalTTime=time;
    //console.log(this);alert()
    var itinerary = this.planATravel(bbox,tI);

    this.exeTravel(itinerary,bbox,tI,callback);
    this.totalTTime=itinerary.totalTime;  //total time of the 
    return;

  

}

vidteq._tiler.prototype.goToFiners = function(bbox,oz,nz,level,cb) {
  //this.reInitFocus =  this.getFocus(bbox,tI);
  //this.handleZoomChange(newTiles,bbox,--oz.z,nz,cb);  
  var that=this;      
  for(var i=0;i<level;i++){
    var newTiles = this.checkAddFineTiles({},function(){
      var bbx=that.getNewBbox(newTiles);
      console.log(bbx);console.log(that);
      //console.log("");console.log(bbx);alert(thisTI.z+"==="+x+"--"+i);
      that.handleZoomChange(newTiles,bbx,++oz,nz,cb);        
    });
  }
  //var growth = {
  //  iMin:tI.iMin
  //  ,iMax:tI.iMax
  //  ,jMin:tI.jMin
  //  ,jMax:tI.jMax
  //  ,gate:0
  //};
  //var that = this;
  ////this.getNextSide(growth);
  //this.store('growth',growth,30);
  //this.triggerNextSide(growth);  
}

vidteq._tiler.prototype.goToCoarsers = function(level,oz,nz,cb) {
  var that=this;
  for(var i=0;i<level ;i++){
    console.log("else current TI",nz);
    //console.log(" else Old TI",this);alert();
    //this.tI.zooming = 'coarse';
    
    var newTiles = this.checkAddCoarseTiles({},function () {
      var x=i;      
      
      var bbx=that.getNewBbox(newTiles);
      console.log(newTiles);console.log(that);
      //console.log("");console.log(bbx);alert(thisTI.z+"==="+x+"--"+i);
      that.handleZoomChange(newTiles,bbx,--oz.z,nz,cb);
    });
  }
}

vidteq._tiler.prototype.getNewBbox = function(newTiles) {
  var tcs=this.computeClusterSides(newTiles);
  //console.log(tcs.s);
    var bbox = {ll:tcs.s.tiles[0].tile.ll,ur:tcs.n.tiles[tcs.n.tiles.length-1].tile.ll };
  //console.log(bbox);alert(22)
  return bbox;

  
}

vidteq._tiler.prototype.handleZoomChange = function(newTiles,bbox,z,nz,cb) {
  console.log(this);
  var tu=400;
  //this.inP.bbox = bbox;
  //this.inP.tu = tu;
  //z=z-1;
  console.log(z);
  var tI = this.getTi(bbox,z);
  //this.inP.z = tI.z;
  //this.inP.resTu = tI.resTile/tu;
  tI.tu = tu * Math.pow(2,(this.inP.z-tI.z));
  tI.urlSeed = this.getMapTilesUrl()
  console.log('handleZoomChange');

  tI.gY = -15;
  //travel.superTi = tI;
  //var targetTi = this.getTi(bbox,tI.z);
  //travel.coarserEndTi = targetTi;
  //travel.coarserStartTiles = newTiles;
  var forFocus = this.getSeedTile(bbox,tI,true);
  this.reInitFocus = forFocus.p.clone();
  //this.reInitZ =  tI.z;
  var llTile = null; 
  for (var i in newTiles) {
    if (newTiles[i].lonIdx != tI.lonIdx) { continue; }
    if (newTiles[i].latIdx != tI.latIdx) { continue; }
    llTile = newTiles[i];
  }
  //console.log(tI);alert();
  this.tI=tI;
  //this.tI.z--;
  this.tiles[this.tI.z] = newTiles;
  if(nz==tI.z && cb){console.log(nz+"=="+tI.z);cb();}
  
}

vidteq._tiler.prototype.hikeUp = function(superBbox,bbox,toZ,travel,callback) {
  this.superBbox = superBbox;
  this.tI.zooming = 'coarse';
  //this.tI.zoomingInfo = {};
  var that = this;
  var newTiles = this.checkAddCoarseTiles({},function () {
    that.clearZoomInfo();
    that.handleZoomChangeInHikeUp(newTiles,superBbox,bbox,toZ,travel,callback);
  });
}

vidteq._tiler.prototype.handleZoomChangeInHikeUp = function(newTiles,superBbox,bbox,toZ,travel,callback) {
  var tu=400;
  //var tI = this.getBestTi(superBbox,{w:this.inP.width,h:this.inP.height});
  var tI = this.getTi(superBbox,toZ);
  tI.tu = tu * Math.pow(2,(this.inP.z-tI.z));
  tI.urlSeed = this.getMapTilesUrl()
  console.log('handleZoomChangeInHikeUp');

  tI.gY = -15;
  travel.superTi = tI;
  //var targetTi = this.getTi(bbox,tI.z);
  var targetTi = this.getTi(bbox,toZ);
  targetTi.tu = tu * Math.pow(2,(this.inP.z-targetTi.z));
  targetTi.urlSeed = this.getMapTilesUrl()
  targetTi.gY = -15;
  travel.coarserEndTi = targetTi;
  travel.coarserStartTiles = newTiles;
  var origin = this.zoomingInfo[toZ];
  this.reconcileIJMinMax(targetTi,origin);
  this.reconcileIJMinMax(tI,origin); // just for debug
  var iMin = targetTi.iMin;
  var jMin = targetTi.jMin;
  var iMax = targetTi.iMax;
  var jMax = targetTi.jMax;
  this.tI=tI;
  this.tiles[toZ] = newTiles;
  //this.updateTileInfo(tI);
  var growth = {
    iMin:iMin
    ,iMax:iMax
    ,jMin:jMin
    ,jMax:jMax
    ,gate:0
  };
  console.log(growth);
  travel.superGrowth = growth;
  this.store('growth',growth,30);
    //console.log("targetTi",targetTi);   
    this.reInitFocus =  this.getFocus(bbox,targetTi);
    //this.reInitZ =  targetTi.z;
    this.reInitFocusPoint=travel.travelPoint;
    //console.log("this.reInitFocus",this.reInitFocus);
    //console.log("this.reInitFocus",bbox);
  //}
  
  this.triggerNextSide(growth,callback);
}

vidteq._tiler.prototype.updateTileInfo = function(tI) {
  console.log(tI);
  this.tI=tI;
}

vidteq._tiler.prototype.getWHChoices = function(bbox,res,inRes,tileSizePx) {
  var ret = {inRes:inRes};
  var goodResCoarse = null;
  var goodResFine = null;
  var goodZFine = null;
  var goodZCoarse = null;
  for ( var z = 0; z < 20; z++) {
    goodResFine = res[z];
    goodZFine = z;
    if (ret.inRes > res[z]) { 
      break;
    }
    goodResCoarse = res[z];
    goodZCoarse = z;
  }
  ret.goodResFine = goodResFine;
  ret.goodResCoarse = goodResCoarse;
  ret.goodZFine = goodZFine;
  ret.goodZCoarse = goodZCoarse;
  var gb = this.getGb(bbox,goodResFine,tileSizePx);
  var goodResTile = goodResFine * tileSizePx;
  ret.goodBboxFine = gb;
  ret.wFine = Math.floor((gb.ur.lon - gb.ll.lon)/goodResTile + 0.5);
  ret.hFine = Math.floor((gb.ur.lat - gb.ll.lat)/goodResTile + 0.5);
  var gb = this.getGb(bbox,goodResCoarse,tileSizePx);
  var goodResTile = goodResCoarse * tileSizePx;
  ret.goodBboxCoarse = gb;
  ret.wCoarse = Math.floor((gb.ur.lon - gb.ll.lon)/goodResTile + 0.5);
  ret.hCoarse = Math.floor((gb.ur.lat - gb.ll.lat)/goodResTile + 0.5);
  return ret;
}

vidteq._tiler.prototype.getTi = function(bbox,z) {
  var tileSizePx = 256;
  var res = [];
  for ( var i = 0; i < 20; i++) {
    res.push(180/(tileSizePx*Math.pow(2,i)));
  }
  var goodResTile = res[z] * tileSizePx;
  var gb = this.getGb(bbox,res[z],tileSizePx);
  var w = Math.floor((gb.ur.lon - gb.ll.lon)/goodResTile + 0.5);
  var h = Math.floor((gb.ur.lat - gb.ll.lat)/goodResTile + 0.5);
  var ret = {
    z:z
    ,resA :res
    ,res:res[z]
    ,w:w
    ,h:h
    ,tileSizePx:tileSizePx
    ,resTile:goodResTile
    ,gb:gb
  };
  $.extend(ret,this.getTileIdx({ll:ret.gb.ll,resTile:ret.resTile}));
  ret.iMin = 0; 
  ret.jMin = 0; 
  ret.iMax = ret.w-1; 
  ret.jMax = ret.h-1; 
  return ret;
}

vidteq._tiler.prototype.getBestTi = function(bbox,screen) {
  console.log("getBestTi");
  var deltaLon = bbox.ur.lon - bbox.ll.lon;
  var deltaLat = bbox.ur.lat - bbox.ll.lat;
  var inResLon = deltaLon/screen.w;
  var inResLat = deltaLat/screen.h;
  var tileSizePx = 256;
  var info = {ew:{},ns:{}};
  info.minW = parseInt((screen.w+2*tileSizePx)/tileSizePx);
  info.minH = parseInt((screen.h+2*tileSizePx)/tileSizePx);
  var ti = {};
  var res = [];
  for ( var i = 0; i < 20; i++) {
    res.push(180/(tileSizePx*Math.pow(2,i)));
  }
  info.ew = this.getWHChoices(bbox,res,inResLon,tileSizePx);
  info.ns = this.getWHChoices(bbox,res,inResLat,tileSizePx);
  var choice = info.ew;
  if (deltaLon < deltaLat) { choice = info.ns; }
  info.choice = choice;
  var ret = {
    z :choice.goodZFine
    ,resA :res
    ,res:choice.goodResFine
    ,w:choice.wFine
    ,h:choice.hFine
    ,tileSizePx:tileSizePx
    ,resTile:choice.goodResFine*tileSizePx
    ,gb:choice.goodBboxFine
  };
  if (choice.wFine > 8) {
    ret.z = choice.goodZCoarse;
    ret.res = choice.goodResCoarse;
    ret.w = choice.wCoarse;
    ret.h = choice.hCoarse;
    ret.resTile = choice.goodResCoarse*tileSizePx;
    ret.gb = choice.goodBboxCoarse;
  }
  $.extend(ret,this.getTileIdx({ll:ret.gb.ll,resTile:ret.resTile}));
  ret.iMin = 0; 
  ret.jMin = 0; 
  ret.iMax = ret.w-1; 
  ret.jMax = ret.h-1; 
  return ret;
}

vidteq._tiler.prototype.init = function(bbox,callback) {
  var id = this.venue360.viewerId
  ,container = this.venue360.container
  ,width = $("#"+id).width()//container.width
  ,height = $("#"+id).height()//container.height
  ,viewPortWidthPx = width//1260
  //,inRes = (bbox.ur.lon - bbox.ll.lon)/viewPortWidthPx  //how this is done?  (target img width/actual img width)?
  //,res = vidteq.cfg.resolutions.split(',')//[]
  ,goodRes = null
  ,tileSizePx = 256
  ,tu = 400//tile unit - world coordinate of one tile
  ,urlSeed = this.getMapTilesUrl()
  ;
  console.log('init');

  // now get good Resolution (allowed resolution)
  this.inP.id = id;
  this.inP.width = width;
  this.inP.height = height;
  //this.inP.inRes = inRes;
  this.inP.bbox = bbox;
  this.inP.tu = tu;
  var tI = this.getBestTi(bbox,{w:width,h:height});
  this.inP.resTu = tI.resTile/tu;
  this.inP.z = tI.z;
  tI.tu = tu;
  tI.urlSeed = urlSeed;
  tI.gY = -20;
  this.zoomingInfo[tI.z] = {
    lonIdx:tI.lonIdx
    ,latIdx:tI.latIdx
  };
  var oneTile = this.getSeedTile(bbox,tI);
  this.startFocus = oneTile.p.clone();
  this.focus = oneTile.p.clone();
  this.focusZ = tI.z;
  this.initFocusPoint=0;
  this.tI = tI;
  this.initTI=$.extend({},tI);
  this.tiles[tI.z] = [];
  this.tiles[tI.z].push(oneTile);
  if(!('lastBbox' in this)){this.lastBbox=bbox;}
  var growth = {
    iMin:tI.iMin
    ,iMax:tI.iMax
    ,jMin:tI.jMin
    ,jMax:tI.jMax
    ,gate:0
  };
  var that = this;
  this.germinateTile(oneTile,function () { 
    that.store('growth',growth,30);
    callback={};  //just to use loadroad remove later
    that.getNextSide(growth,callback);
    //that.getNextSide2(growth);
  });
  //this.setupMousePosition();
}

vidteq._tiler.prototype.getMapTilesUrl = function( options ) {
  options = options || {};
  var tilecacheBaseUrl = vidteq.cfg.tilecacheBaseUrl.replace(/210/g,'200')
  ,tilecacheBaseLayer = encodeURIComponent(vidteq.cfg.tilecacheBaseLayer)
  ,format = encodeURIComponent('image/png')
  ,service = 'WMS'
  ,version = '1.1.1'
  ,request = 'GetMap'
  ,styles = ''
  ,srs = encodeURIComponent('EPSG:4326')
  ,width = 256
  ,height = 256
  ,url = tilecacheBaseUrl+'LAYERS='+tilecacheBaseLayer+'&FORMAT='+format+'&SERVICE='+service+'&VERSION='+version+'&REQUEST='+request+'&STYLES='+styles+'&SRS='+srs+'&WIDTH='+width+'&HEIGHT='+height+'&BBOX='
  ;
  console.log(url)
  return url;
}


vidteq._tiler.prototype.triggerNextSide = function(growth,callback) {
  var that = this;
  setTimeout(function () {
    that.getNextSide(growth,callback);
  },200);
}

vidteq._tiler.prototype.getAddingSide = function(growth,tcSides) {
  var ret = {};
  var curSide = growth.curSide;
  if (!ret.selSide && curSide == 'n') { 
    if (tcSides.n.tiles[0].tile.j+1 <= growth.jMax) {
      ret.selSide = 'n';
      growth.curSide = 'e';
      var deltaJ = tcSides.n.tiles[0].tile.j - tcSides.s.tiles[0].tile.j;
      if (
        deltaJ >= 8 || 
        (deltaJ >= 5 && tcSides.s.tiles[0].tile.j < growth.jMin) 
      ) {
        ret.selDelSide = 's';
      }
    } else {
      curSide = 'e';
    }
  }
  if (!ret.selSide && curSide == 'e') {
    if (tcSides.e.tiles[0].tile.i+1 <= growth.iMax) {
      ret.selSide = 'e';
      growth.curSide = 's';
      var deltaI = tcSides.e.tiles[0].tile.i - tcSides.w.tiles[0].tile.i;
      if (
        deltaI >= 8 || 
        (deltaI >= 5 && tcSides.w.tiles[0].tile.i < growth.iMin) 
      ) {
        ret.selDelSide = 'w';
      }
    } else {
      curSide = 's';
    }
  }
  if (!ret.selSide && curSide == 's') {
    if (tcSides.s.tiles[0].tile.j-1 >= growth.jMin) {
      ret.selSide = 's';
      growth.curSide = 'w';
      var deltaJ = tcSides.n.tiles[0].tile.j - tcSides.s.tiles[0].tile.j;
      if (
        deltaJ >= 8 || 
        (deltaJ >= 5 && tcSides.n.tiles[0].tile.j > growth.jMax) 
      ) {
        ret.selDelSide = 'n';
      }
    } else {
      curSide = 'w';
    }
  }
  if (!ret.selSide && curSide == 'w') {
    if (tcSides.w.tiles[0].tile.i-1 >= growth.iMin) {
      ret.selSide = 'w';
      growth.curSide = 'n';
      var deltaI = tcSides.e.tiles[0].tile.i - tcSides.w.tiles[0].tile.i;
      if (
        deltaI >= 8 || 
        (deltaI >= 5 && tcSides.e.tiles[0].tile.i > growth.iMax) 
      ) {
        ret.selDelSide = 'e';
      }
    } else {
      curSide = 'n';
    }
  }
  if (!ret.selSide && curSide == 'n') {
    if (tcSides.n.tiles[0].tile.j+1 <= growth.jMax) {
      ret.selSide = 'n';
      growth.curSide = 'e';
      var deltaJ = tcSides.n.tiles[0].tile.j - tcSides.s.tiles[0].tile.j;
      if (
        deltaJ >= 8 || 
        (deltaJ >= 5 && tcSides.s.tiles[0].tile.j < growth.jMin) 
      ) {
        ret.selDelSide = 's';
      }
    } else {
      curSide = 'e';
    }
  }
  if (!ret.selSide && curSide == 'e') {
    if (tcSides.e.tiles[0].tile.i+1 <= growth.iMax) {
      ret.selSide = 'e';
      growth.curSide = 's';
      var deltaI = tcSides.e.tiles[0].tile.i - tcSides.w.tiles[0].tile.i;
      if (
        deltaI >= 8 || 
        (deltaI >= 5 && tcSides.w.tiles[0].tile.i < growth.iMin) 
      ) {
        ret.selDelSide = 'w';
      }
    } else {
      curSide = 's';
    }
  }
  if (!ret.selSide && curSide == 's') {
    if (tcSides.s.tiles[0].tile.j-1 >= growth.jMin) {
      ret.selSide = 's';
      growth.curSide = 'w';
      var deltaJ = tcSides.n.tiles[0].tile.j - tcSides.s.tiles[0].tile.j;
      if (
        deltaJ >= 8 || 
        (deltaJ >= 5 && tcSides.n.tiles[0].tile.j > growth.jMax) 
      ) {
        ret.selDelSide = 'n';
      }
    } else {
      curSide = 'w';
    }
  }
  return ret;
}

vidteq._tiler.prototype.getDeletingSide = function(growth,tcSides) {
  var ret = {};
  var curSide = growth.curSide;
  if (!ret.selDelSide && curSide == 'n') { 
    var h = tcSides.n.tiles[0].tile.j - tcSides.s.tiles[0].tile.j+1;
    if (
      h >= 8 || 
      (h > 4 && tcSides.s.tiles[0].tile.j < growth.jMin) 
    ) {
      growth.curSide = 'e';
      ret.selDelSide = 's';
    } else {
      curSide = 'e';
    }
  }
  if (!ret.selDelSide && curSide == 'e') {
    var w = tcSides.e.tiles[0].tile.i - tcSides.w.tiles[0].tile.i+1;
    if (
      w >= 8 || 
      (w > 4 && tcSides.w.tiles[0].tile.i < growth.iMin) 
    ) {
      growth.curSide = 's';
      ret.selDelSide = 'w';
    } else {
      curSide = 's';
    }
  }
  if (!ret.selDelSide && curSide == 's') {
    var h = tcSides.n.tiles[0].tile.j - tcSides.s.tiles[0].tile.j+1;
    if (
      h >= 8 || 
      (h > 4 && tcSides.n.tiles[0].tile.j > growth.jMax) 
    ) {
      growth.curSide = 'w';
      ret.selDelSide = 'n';
    } else {
      curSide = 'w';
    }
  }
  if (!ret.selDelSide && curSide == 'w') {
    var w = tcSides.e.tiles[0].tile.i - tcSides.w.tiles[0].tile.i+1;
    if (
      w >= 8 || 
      (w > 4 && tcSides.e.tiles[0].tile.i > growth.iMax) 
    ) {
      growth.curSide = 'n';
      ret.selDelSide = 'e';
    } else {
      curSide = 'n';
    }
  }
  if (!ret.selDelSide && curSide == 'n') {
    var h = tcSides.n.tiles[0].tile.j - tcSides.s.tiles[0].tile.j+1;
    if (
      h >= 8 || 
      (h > 4 && tcSides.s.tiles[0].tile.j < growth.jMin) 
    ) {
      growth.curSide = 'e';
      ret.selDelSide = 's';
    } else {
      curSide = 'e';
    }
  }
  if (!ret.selDelSide && curSide == 'e') {
    var w = tcSides.e.tiles[0].tile.i - tcSides.w.tiles[0].tile.i+1;
    if (
      w >= 8 || 
      (w > 4 && tcSides.w.tiles[0].tile.i < growth.iMin) 
    ) {
      growth.curSide = 's';
      ret.selDelSide = 'w';
    } else {
      curSide = 's';
    }
  }
  if (!ret.selDelSide && curSide == 's') {
    var h = tcSides.n.tiles[0].tile.j - tcSides.s.tiles[0].tile.j+1;
    if (
      h >= 8 || 
      (h > 4 && tcSides.n.tiles[0].tile.j > growth.jMax) 
    ) {
      growth.curSide = 'w';
      ret.selDelSide = 'n';
    } else {
      curSide = 'w';
    }
  }
  return ret;
}

vidteq._tiler.prototype.getNextSide = function(growth,callback) {
  if (growth.gate > 20) { 
    if (callback) { 
      callback({error:"Recursion gate reached"}); 
    }
    return; 
  }
  growth.gate++;
  if (!growth.curSide) { growth.curSide = 'n'; }
  var tcSides = this.computeClusterSides(this.tiles[this.tI.z]);
  this.store('tcSides',tcSides,30);
  var addingSide = this.getAddingSide(growth,tcSides);
  var deletingSide = null;
  if (!addingSide.selSide) {
    deletingSide = this.getDeletingSide(growth,tcSides);
    if (!deletingSide.selDelSide) {
      console.log("current Zoom level",this.tI.z) ;
      this.checkAllTiles();
      if (callback) { 
        callback({}); 
      }
      return; 
    }
  }
  var electedSide = {};
  if (addingSide.selSide) {
    electedSide.add = {
      side:addingSide.selSide
      ,tiles:tcSides[addingSide.selSide].tiles
    };
    if (addingSide.selDelSide) {
      electedSide.del = {
        side:addingSide.selDelSide
        ,tiles:tcSides[addingSide.selDelSide].tiles
      };
    }
  } else {
    if (deletingSide.selDelSide) {
      electedSide.del = {
        side:deletingSide.selDelSide
        ,tiles:tcSides[deletingSide.selDelSide].tiles
      };
    }
  }
  this.store('electedSide',electedSide,30);
  var changes = {add:[],del:[]};
  var that = this;
  this.addOrDelASide(electedSide,changes,function () {
    //that.getNextSide(growth,callback);
    that.triggerNextSide(growth,callback);
  });
  this.store('changes',changes,30);
  if (changes.del.length) {
    for (var i in changes.del) {
      this.deleteTile(changes.del[i]);
    }
  }
  if (changes.add.length) {
    this.tiles[this.tI.z] = this.tiles[this.tI.z].concat(changes.add);
  }
}

vidteq._tiler.prototype.checkAllTiles = function() {
  // first - get side tiles
  // n and s should made
  // e and w should match
  // Total no of tiles should no of n x no of s
  // North tiles should have asf north set
  // 
  var tcSides = this.computeClusterSides(this.tiles[this.tI.z]);
  var tcs=$.extend({},tcSides);
  var iMax = tcSides.e.tiles[0].tile.i;
  var iMin = tcSides.w.tiles[0].tile.i;
  var jMax = tcSides.n.tiles[0].tile.j;
  var jMin = tcSides.s.tiles[0].tile.j;
  var maxJ=tcs.w.tiles.length;
  var maxI=tcs.s.tiles.length;
  
  this.checkIJ(tcs['e'],'west',maxI,maxJ);
}

vidteq._tiler.prototype.checkIJ = function(side,ops,maxI,maxJ) {
  var xi=1;var xj=1;
  if(ops=="west"){xi=-1;}
  if(ops=="south"){xj=-1;}
  if(ops=="east"){xi=1;}
  if(ops=="north"){xj=1;}
  for(var i=0;i<maxI-1;i++){
  //console.log("maxI=",maxI);
  //console.log("maxI=",tcs);alert()
    for(var j=0;j<maxJ-1;j++){
      var flag=false;
        //console.log("j=");
        //console.log((side.tiles[j].tile.j)+"=="+(side.tiles[j+1].tile.j));
        if(ops=="east" || ops=="west"){
          flag=(side.tiles[j].tile.j==side.tiles[j+1].tile.j-xj);
        }
        else{
          flag=(side.tiles[j].tile.i==side.tiles[j+1].tile.i-xj);  
        }
         if(flag){}
         else{ console.log("error in",side.tiles[j]);}
      
      //if(i<maxI){
        //console.log("i=");
        //console.log((side.tiles[j].tile.i)+"=="+(side.tiles[j].tile[ops].i));
        if(ops=="east" || ops=="west"){
          flag=(side.tiles[j].tile.i==side.tiles[j].tile[ops].i-xi);
        }
        else{
          flag=(side.tiles[j].tile.j==side.tiles[j].tile.j-xj);  
        }
        if(flag){
          side.tiles[j].tile=side.tiles[j].tile[ops];
          }           //if(JSON.stringify(tcs.w.tiles[i].tile.) === JSON.stringify(tcs.w.tiles[i].tile) 
         else{ console.log("error in",side.tiles[j]);}
      //}
      
    }    
  }
  
}

vidteq._tiler.prototype.getNextSide2 = function(growth) {
	var selSide=null;
	for(var j=0;j<growth.h-1;j++){
		selSide='n'
    this.getCal(selSide);
	}
	for(var i=0;i<growth.w-1;i++){
		selSide='e'
    this.getCal(selSide);
	}
}

vidteq._tiler.prototype.getCal = function(selSide) {
	var tcSides = this.computeClusterSides(this.tiles[this.tI.z]);
  var electedSide = {add:{
    side:selSide
    ,tiles:tcSides[selSide].tiles
  }};
  this.store('electedSide',electedSide,30);
  var changes = {add:[],del:[]};
  var that = this;
  this.addOrDelASide(electedSide,changes,function () {
    console.log("First level germination complete");
  });
  this.store('changes',changes,30);
  if (changes.del.length) {
    for (var i in changes.del) {
      this.deleteTile(changes.del[i]);
    }
  }
  if (changes.add.length) {
    this.tiles[this.tI.z] = this.tiles[this.tI.z].concat(changes.add);
  }
}

vidteq._tiler.prototype.getGb = function(bbox,goodRes,tileSizePx) {
  var outBbox = {ll:{},ur:{}};
  outBbox.ll.lon = this.getGbLon(bbox.ll.lon,goodRes,tileSizePx);
  outBbox.ll.lat = this.getGbLat(bbox.ll.lat,goodRes,tileSizePx);
  outBbox.ur.lon = this.getGbLon(bbox.ur.lon,goodRes,tileSizePx)+goodRes*tileSizePx;
  outBbox.ur.lat = this.getGbLat(bbox.ur.lat,goodRes,tileSizePx)+goodRes*tileSizePx;
  return outBbox;
}

vidteq._tiler.prototype.getGbLon = function(lon,goodRes,tileSizePx) {
  var goodLon = (Math.floor((lon-(-180))/(tileSizePx*goodRes)))*goodRes*tileSizePx-180;
  return goodLon;
}
vidteq._tiler.prototype.getGbLat = function(lat,goodRes,tileSizePx) {
  var goodLat=(Math.floor((90+lat)/(goodRes*tileSizePx)))*goodRes*tileSizePx-90;
  return goodLat; 
}

vidteq._tiler.prototype.addOneTileFloor = function (tu,p,r,imgUrl,callback,callbackError,opt) {
  var opt = opt || { };
  var g = new THREE.PlaneGeometry(tu,tu);
  if (opt.print) { console.log("special 1"); }
  //imgUrl="tiles/"+5+".png";
  var tx = THREE.ImageUtils.loadTexture('file:///C:/Users/ac49999/git/APPS/2.MPG_REPO/my-misc/Vidteq/vidLayer/tiles/a%20(1).png',undefined,callback,callbackError);
  //var tx = THREE.ImageUtils.loadTexture(imgUrl,new THREE.UVMapping(),callback,callbackError);
  if (opt.print) { console.log("special 2"); }
  var m = new THREE.MeshBasicMaterial({
     map:tx
     //,wireframe:true
    // map:t
    //,transparent:true
    //,overdraw:true
  });
  if (opt.print) { console.log("special 3"); }
  m.map.needsUpdate = true;
  tx.needsUpdate = true;
  //var b = new THREE.Mesh(g,m);
  var b = THREE.SceneUtils.createMultiMaterialObject(g,[
    m
    ,new THREE.MeshBasicMaterial({wireframeLinewidth:3,color:0x222222,wireframe:true})
  ]);
  if (opt.print) { console.log("special 4"); }
  var angle = 20;
  var dist = 30;
  //console.log(b);alert()
  //if(b.children[0].material.map.image==undefined){ 
  //  b.children[0].material.map.image=new Image();
  //  b.children[0].material.map.image.width=2;
  //  b.children[0].material.map.image.height=2;
  //}
  //console.log(b);alert()
  //var p = new THREE.Vector3(
  //  0
  //  //dist*Math.cos(angle*Math.PI/180)
  //  //30*Math.cos(angle*Math.PI/180)/original one
  //  ,-15
  //  // ,30*Math.sin(angle*Math.PI/180): original one
  //  //,dist*Math.sin(angle*Math.PI/180)
  //  //z:30*(1/Math.sin(angle*Math.PI/180))
  //  //,-30
  //  ,0
  //);
  //var r = {x:Math.PI/18,y:3*Math.PI/2};
  //var r = {x:-Math.PI/2};
  //this.addButton('North',new THREE.Vector3(30,0,0),{y:3*Math.PI/2});
  //this.addButton('South',new THREE.Vector3(-30,0,0),{y:Math.PI/2});
  //this.addButton('East',new THREE.Vector3(0,0,30),{y:Math.PI});
  //this.addButton('West',new THREE.Vector3(0,0,-30),{});
    //var r = {x:Math.PI/3,y:(270-angle)*Math.PI/180};
    //var r = {z:Math.PI/3,y:(270-angle)*Math.PI/180};
    //var r = {x:Math.PI/2};
  b.position.copy(p);
  if (opt.print) { console.log("special 5"); }
  b.children[0].pos=(p);
  if (opt.print) { console.log("special 6"); }
  b.receiveShadow = true;
  b.dynamic = true;
  if (opt.print) { console.log("special 7"); }
  this.venue360.scene.add(b);
  if (opt.print) { console.log("special 8"); }
  
  for (var i in r) {
    b.rotation[i] = r[i];
  }
  if (opt.print) { console.log("special 9"); }
  if (!('meshes' in this)) { this.meshes = []; }
  this.meshes.push(b);
  if (opt.print) { console.log("special 10"); }
  //this.render();
  return b; 
}

vidteq._tiler.prototype.getTileIdx = function (tile) {
  var tileX = Math.floor((tile.ll.lon+180+tile.resTile/2)/tile.resTile);
  var tileY = Math.floor((tile.ll.lat+90+tile.resTile/2)/tile.resTile);
  return {lonIdx:tileX,latIdx:tileY}; 
}

vidteq._tiler.prototype.printTileInfo = function() {
  for (var i in this.meshes) {
    var b = this.meshes[i];
    var id = this.venue360.viewerId;
    var width = $("#"+id).width();
    var height = $("#"+id).height();
    var widthHalf = width / 2, heightHalf = height / 2;

    var vector = new THREE.Vector3();
    var vector1 = new THREE.Vector3();
    //var projector = new THREE.Projector();
    //var vertices = b.geometry.vertices;
    var vertices = b.geometry ? 
      b.geometry.vertices :
      b.children && b.children.length ? 
        b.children[0].geometry.vertices : null;

    //projector.projectVector( vector.setFromMatrixPosition( b.matrixWorld ), this.venue360.camera );
    (vector.setFromMatrixPosition( b.matrixWorld )).project(this.venue360.camera);
    //this.projector.projectVector( v, this.camera );
    //this.projector.projectVector( b.position, this.camera );
    vector.x = ( vector.x * widthHalf ) + widthHalf;
    vector.y = - ( vector.y * heightHalf ) + heightHalf;
    var par = {
      x:parseInt(vector.x)
      ,y:parseInt(vector.y)
      ,i:b.i
      ,j:b.j
      ,visible:b.visible
    };
    for (var i in vertices) {
      var v = vertices[i];
      vector.copy(v);
      //this.projector.projectVector( vector.setFromMatrixPosition( b.matrixWorld ), this.camera );
      //projector.projectVector( b.matrixWorld.multiplyVector3(vector), this.venue360.camera );
      //projector.projectVector( vector.applyProjection(b.matrixWorld), this.venue360.camera );
      (vector.setFromMatrixPosition( b.matrixWorld )).project(this.venue360.camera);
      //this.projector.projectVector( b.position, this.camera );
      vector.x = ( vector.x * widthHalf ) + widthHalf;
      vector.y = - ( vector.y * heightHalf ) + heightHalf;
      var par = {
        x:parseInt(vector.x)
        ,y:parseInt(vector.y)
        ,i:b.i
        ,j:b.j
        ,visible:b.visible
      };
    }
  }
}
  //var bbox , bbox.ll and bbox.ur  interms of dd
  // tile size each is 256 px
  // how do you decide 1px means what dd?
  // called dd/px or px/dd - how do you decide it?
  // using wgs standards  - 
  // let us say we want to render the bbox in 1000px
  // 




vidteq._tiler.prototype.getAdjTile = function (tile) {
  
}



//TBD: change to onRender and push to array
vidteq._tiler.prototype.render = function () {
  return;
  //if (this.stopRender) { return; }
  if (!('firstTimePrint' in this)) { 
    this.firstTimePrint = false;
    this.firstTimePrintCount = 0;
  }
  if (!this.firstTimePrint) {
    if (this.firstTimePrintCount < 500) {
      this.firstTimePrintCount++;
    } else {
      this.firstTimePrint = true;
      this.printTileInfo();
    }
  }
  if (!('rCount' in this)) {
    this.rCount = 0;
  }
  this.rCount++;
  if (this.rCount > 100) { // TBD why 100 ?
    this.rCount = 0;
    this.checkTileVisibility();
  }
  if(this.object && this.ok){
    //this.controls.pan( this.object.pos.clone().sub( this.controls.target ) );
    //goTo( this.object.pos ); 
    this.venue360.controls.target=this.object.pos;
    this.ok=false;
  }
}

vidteq._tiler.prototype.checkTileVisibility = function () {
  if (!('retard' in this)) { this.retard = 30; }
  if (this.regard < 30) { 
    this.retard--; 
    if (this.retard <= 0) { this.retard = 30 }
    return;
  }
  //if (this.tiles.length > 50) { 
    if (this.tiles[this.tI.z].length > 100) { 
    //return; 
  } 
  if (!('runner' in this)) { this.runner = 0; }
  if (!('iter' in this)) { this.iter = 0; }
  if (this.iter>100) { return; }
  this.runner++;
  //if (this.runner == 15) {
  //  this.tI.zooming = 'fine';
  //}
  var changes = {add:[],del:[]};
  //var newTiles = [];
  //var delTiles = [];
  var zoom = {
    fine:0
    ,coarse:0
    ,stay:0
    ,total:0
  };
  var cam = this.venue360.camera;
  cam.updateMatrix();
  cam.updateMatrixWorld();
  cam.matrixWorldInverse.getInverse( cam.matrixWorld );
  if (!('frustum' in this)) { this.frustum = new THREE.Frustum(); }
  this.frustum.setFromMatrix( new THREE.Matrix4().multiply( cam.projectionMatrix, cam.matrixWorldInverse ) );
  
  //    var delSides=this.isVisiClusterSides(this.tiles);
  //    //console.log(Object.keys(delSides.length));
  //    if (delSides.length) {
  //      for (var i in delSides) {
  //       console.log(delSides[i]);
  //       for (var j in delSides[i].add.tiles) {  
  //          this.deleteTile(delSides[i].add.tiles[j].tile);
  //        }
  //     }
  //    }
  // new word call tc = stands for tile Cluster
  if (this.tI.zooming) { return; }
  var tcSides = this.computeClusterSides(this.tiles[this.tI.z]);
  this.store('tcSides',tcSides,30);
  var electedSide = this.electASide(tcSides);
  this.store('electedSide',electedSide,30);
  //var electedZoom=this.electForZoom(tcSides);
  if (electedSide.stay) {return;}
		
  if (electedSide.coarse) {
  //if (electedZoom.coarse) { }
    this.tI.zooming = 'coarse';
    //this.tI.zoomingInfo = {};
    var that = this;
    var newTiles = this.checkAddCoarseTiles({},function () {
      that.clearZoomInfo();
      that.tiles[that.tI.z]=newTiles;
      console.log(that.tI);
      if(that.venue360.vidLayer.roadGeometry){
        //that.venue360.vidLayer.getPathMesh();
        //that.venue360.vidLayer.roadThickPath.scale.multiplyScalar(2);
        //var pts = [
        //  new THREE.Vector2(  0,-10)
        //  ,new THREE.Vector2(  0,0)
        //  ,new THREE.Vector2(0,10)
        //]  				
        //var shape = new THREE.Shape( that.venue360.vidLayer.roadGeometry );            
        //var extrudeSettings = {
        //  steps			: that.venue360.vidLayer.roadGeometry,
        //  amount			: 100,
        //  bevelEnabled	: true,
        //  extrudePath		: that.venue360.vidLayer.roadCurve,
        //  curveSegments :10,            
        //  bevelThickness:10,
        //  bevelSize     :10,
        //  bevelSegments :10
        //  
        //};
        //that.venue360.vidLayer.extrudegeometry.addShape(shape,extrudeSettings);

        //console.log(that.venue360.vidLayer.startSign.scale);
        //that.venue360.vidLayer.startSign.scale.multiplyScalar(4);
        //that.venue360.vidLayer.stopSign.scale.multiplyScalar(4);
        //console.log(that.venue360.vidLayer.startSign.scale);
      }
    });
    //that.clearZoomInfo();
    //that.tiles[that.tI.z]=newTiles;
    return;
  } 
  if (electedSide.fine) {
  //if (electedZoom.fine) { }
    this.tI.zooming = 'fine';
    //this.tI.zoomingInfo = {};
    var that = this;
    var newTiles = this.checkAddFineTiles({},function(){
      that.clearZoomInfo();
      that.tiles[that.tI.z]=newTiles;
    });
    //that.clearZoomInfo();
    //that.tiles[that.tI.z]=newTiles;
    return;
  }
  this.addOrDelASide(electedSide,changes);
  this.store('changes',changes,30);

  // TBD w will need the check of numbers as follow laster
  //     var checkElectedSide = this.checkBeforeExtend(electedSide,tcSides);
  //     //if((cam.far)<checkElectedSide.tl){
  //     if((cam.far-500)<checkElectedSide.al){
  //       return;
  //     }
  //     // TBD we need to electA side for deletion also
  //     this.addASide(electedSide,changes);
  


  //for (var i in this.tiles) {
  //  var curTile = this.tiles[i];
  //  if (this.tI.z != curTile.z) {
  //    continue;
  //  }
  //  // TBD when we change zoom we may need timer to cleanup
  //  // TBD we may need garbage collector
  //  if (this.tI.zooming) {
  //    this.renderZooming(curTile,changes);
  //    continue;
  //  }
  //  this.computePxRatio([curTile]);
  //  //continue; // temporary
  //  if (!this.isVisible(curTile)) {
  //    if(curTile.i==0 && curTile.j==0){continue; }  // rs keeping one to germinate again
  //    //delTiles.push(curTile);
  //    changes.del.push(curTile);
  //    continue;   
  //  }
  //  var zVote = this.voteForZoom(curTile,zoom);
  //  //if (zVote == 'fine') {
  //  //    //if (curTile.fine && curTile.fine[quad] && curTile.fine[quad].mesh) { 
  //  //    //  continue; 
  //  //    //}
  //  //  var tiles = curTile.fine || this.getFinerTiles(curTile);
  //  //  this.computePxRatio(tiles,curTile.mesh);
  //  //  for (var quad in tiles) {
  //  //    var tile = tiles[quad];
  //  //    if (tile.mesh) {
  //  //      continue;
  //  //    }
  //  //    //this.computePxRatio([tile],curTile.mesh);
  //  //    if (this.isVisible(tile)) {
  //  //      var that = this;
  //  //      (function () {
  //  //        var childTile = tile;
  //  //        var parentTile = curTile;
  //  //        newTiles.push(that.germinateTile(tile,function (){
  //  //        }));
  //  //      })();
  //  //    }
  //  //  }
  //  //}
  //  //if (zVote == 'coarse') {
  //  //  var tile = this.getCoarseTile(curTile);
  //  //  this.computePxRatio([tile],curTile.mesh);
  //  //}
  if (changes.del.length) {
    for (var i in changes.del) {
      this.deleteTile(changes.del[i]);
    }
  }
  if (changes.add.length) {
    this.iter++;
    this.tiles[this.tI.z] = this.tiles[this.tI.z].concat(changes.add);
  }
  this.getIJMinMax(this.tiles[this.tI.z]);
  this.checkAllTiles();
}  

vidteq._tiler.prototype.clearZoomInfo = function () {
  console.log("clearZoomInfo",this.tI);
  if (this.tI.zooming && this.tI.zooming == 'fine') {
    this.tI.z++;
    this.tI.res=this.tI.resA[this.tI.z];
    this.tI.resTile=this.tI.res * this.tI.tileSizePx;
    this.tI.tu=this.tI.tu/2;
    delete this.tI.zooming;
  } 
  if (this.tI.zooming && this.tI.zooming == 'coarse') {
    this.tI.z--;
    this.tI.res=this.tI.resA[this.tI.z];
    this.tI.resTile=this.tI.res * this.tI.tileSizePx;
    this.tI.tu=this.tI.tu*2;
    // make sure change tI parameters such res, resTile, boundary
    // set i and j for all tiles
    delete this.tI.zooming;
  } 
}

vidteq._tiler.prototype.checkIfValidQuad = function (oneQuad) {
  //if (oneQuad.length!=4) { return false; }
  var newTiles = [];
  for (var i in oneQuad) {
    newTiles.push(this.getCoarseTile(oneQuad[i],true));
  }
  if (newTiles[1] && newTiles[0].lonIdx != newTiles[1].lonIdx) { return false; }
  if (newTiles[2] && newTiles[0].lonIdx != newTiles[2].lonIdx) { return false; }
  if (newTiles[3] && newTiles[0].lonIdx != newTiles[3].lonIdx) { return false; }
  if (newTiles[1] && newTiles[0].latIdx != newTiles[1].latIdx) { return false; }
  if (newTiles[2] && newTiles[0].latIdx != newTiles[2].latIdx) { return false; }
  if (newTiles[3] && newTiles[0].latIdx != newTiles[3].latIdx) { return false; }
  return true;
}

vidteq._tiler.prototype.germinateCoarse = function (oneQuad,pending,callback) {
  var tile = oneQuad[0].coarse;
  var that = this;
  this.germinateTile(tile,function(){
    var tile = oneQuad[0].coarse;
    //tile.mesh.position.y -= 50;
    for (var i in oneQuad) {
      that.deleteTile(oneQuad[i]);
    }
    that.unsetPending(pending,tile,callback);
  });
}

vidteq._tiler.prototype.setIj = function (tile) {
  var z = tile.z;
  if (!this.zoomingInfo[z]) { 
    this.zoomingInfo[z] = {};
  }
  if (!this.zoomingInfo[z].lonIdx) {
    this.zoomingInfo[z].lonIdx = tile.lonIdx;
  }
  if (!this.zoomingInfo[z].latIdx) {
    this.zoomingInfo[z].latIdx = tile.latIdx;
  }
  tile.i = tile.lonIdx - this.zoomingInfo[z].lonIdx;
  tile.j = tile.latIdx - this.zoomingInfo[z].latIdx;
}

vidteq._tiler.prototype.createAndLinkCoarse = function (oneQuad,pending) {
  var tile = this.getCoarseTile(oneQuad[0]);
  this.setIj(tile);
  //if (!this.tI.zoomingInfo.zeroLonIdx) {
  //  this.tI.zoomingInfo.zeroLonIdx = tile.lonIdx;
  //}
  //if (!this.tI.zoomingInfo.zeroLatIdx) {
  //  this.tI.zoomingInfo.zeroLatIdx = tile.latIdx;
  //}
  //tile.i = tile.lonIdx - this.tI.zoomingInfo.zeroLonIdx;
  //tile.j = tile.latIdx - this.tI.zoomingInfo.zeroLatIdx;

  this.setPending(pending,tile);
  this.computePxRatio([tile],oneQuad[0].mesh);
  var that = this;
  for (var i in oneQuad) {
    if (i==0) { continue; } // i = 0 already done
    this.linkZoomTiles(oneQuad[i],'coarse',tile);
    this.linkZoomSideTiles(oneQuad[i],'coarse',tile);
    this.inheritAsfZoomTiles(oneQuad[i],'coarse',tile);
  }
  return tile;
}

vidteq._tiler.prototype.checkAddFineTiles = function (pending,callback) {
  var that=this;
  var newTiles=[];
  var tiles = $.extend([],this.tiles[this.tI.z]);
  // You need to clone because of deleteTile racing
  for (var i in tiles){
    var curTile = tiles[i];
    this.setPending(pending,curTile);
  }
  for (var i in tiles){
    var curTile = tiles[i];
    var nt= that.createAndLinkFineTiles(curTile,pending,callback);
    newTiles = newTiles.concat(nt);
  }
  return newTiles;
}

vidteq._tiler.prototype.createAndLinkOneFineTile = function (ocTile,oneQuad,pending,callback) {
  //ocTile= one coarse tile
  for (var i in oneQuad){
    var tile= oneQuad[i];
    this.setIj(tile);
    //if (!this.tI.zoomingInfo.zeroLonIdx) {
    //  this.tI.zoomingInfo.zeroLonIdx = tile.lonIdx;
    //}
    //if (!this.tI.zoomingInfo.zeroLatIdx) {
    //  this.tI.zoomingInfo.zeroLatIdx = tile.latIdx;
    //}
    //tile.i = tile.lonIdx - this.tI.zoomingInfo.zeroLonIdx;
    //tile.j = tile.latIdx - this.tI.zoomingInfo.zeroLatIdx;
    this.setPending(pending,tile);
    this.computePxRatio([tile],ocTile.mesh);
    this.linkZoomTiles(ocTile,'fine',tile);
    // above stuff I think is already done by creator function TBD
    this.linkZoomSideTiles(ocTile,'fine',tile);
    this.inheritAsfZoomTiles(ocTile,'fine',tile);
  }
  // first keep all the guys pending before germinating even the first
  for (var i in oneQuad){
    var tile= oneQuad[i];
    var that = this;
    (function () {
      var fTile  = tile;
      that.germinateTile(fTile,function () {
        that.unsetPending(pending,fTile,callback);
      });
    })(); 
  }
}

vidteq._tiler.prototype.setPending = function (pending,tile) {
  if (!(tile.lonIdx in pending)) {
    pending[tile.lonIdx] = {};
  }
  pending[tile.lonIdx][tile.latIdx] = true;
}

vidteq._tiler.prototype.unsetPending = function (pending,tile,callback) {
  delete pending[tile.lonIdx][tile.latIdx];
  if (Object.keys(pending[tile.lonIdx]).length) {
    return;
  }
  delete pending[tile.lonIdx];
  if (Object.keys(pending).length) {
    return;
  }
  delete pending;
  if (callback) { callback(); }
}

vidteq._tiler.prototype.createAndLinkFineTiles = function (ocTile,pending,callback) {  //ocTile= one coarse tile
  var tilesH = this.getFinerTiles(ocTile);
  var tiles = [];
  for (var i in tilesH) { tiles.push(tilesH[i]); }
  this.linkOneQuadFineTiles(tiles);
  var that = this;
  this.createAndLinkOneFineTile(ocTile,tiles,{},function () {
    var tileIdx = {lonIdx:ocTile.lonIdx,latIdx:ocTile.latIdx};
    that.deleteTile(ocTile);
    that.unsetPending(pending,tileIdx,callback);
  });
  return tiles;
}

vidteq._tiler.prototype.linkOneQuadFineTiles = function (oneQuad) {
  //var seeds=[oneQuad[0], oneQuad[2]];
  //var tiles=[oneQuad[1], oneQuad[3]];
  //var sides=['north','east'];
  //for(var i in seeds){
  //  if(i>0){sides=['west','south'];}
  //  for(var j in tiles){
  //    this.linkTiles(seeds[i],sides[j],tiles[j]);    
  //  }
  //}
  for(var i in oneQuad){
    for(var j in oneQuad){
      if(i==j){continue;}
      if(oneQuad[i].quad=='ll' && oneQuad[j].quad=='ul'){
        this.linkTiles(oneQuad[i],'north',oneQuad[j]); 
      }
      if(oneQuad[i].quad=='ll' && oneQuad[j].quad=='lr'){
        this.linkTiles(oneQuad[i],'east',oneQuad[j]); 
      }
      if(oneQuad[i].quad=='ul' && oneQuad[j].quad=='ur'){
        this.linkTiles(oneQuad[i],'east',oneQuad[j]); 
      }
      if(oneQuad[i].quad=='ur' && oneQuad[j].quad=='lr'){
        this.linkTiles(oneQuad[i],'south',oneQuad[j]); 
      }
    }
  }
}

vidteq._tiler.prototype.getCoarseQuads = function (tiles) {
  var quads = [];
  var done = {};
  for (var i in tiles){
    var curTile = tiles[i];
    if (done[curTile.lonIdx] && done[curTile.lonIdx][curTile.latIdx]) {
      continue;
    }
    this.setPending(done,curTile);
    var newTile = this.getCoarseTile(curTile,true);
    // no Commit may not be needed TBD
    var oneQuad = [curTile];
    if (curTile.quad == 'll') {
      if (curTile.north) { 
        curTile.north.quad = 'ul';
        oneQuad.push(curTile.north); 
        this.setPending(done,curTile.north);
      }
      if (curTile.east) { 
        curTile.east.quad = 'lr';
        oneQuad.push(curTile.east); 
        this.setPending(done,curTile.east);
      }
      if (curTile.east && curTile.east.north) { 
        curTile.east.north.quad = 'ur';      
        oneQuad.push(curTile.east.north);
        this.setPending(done,curTile.east.north);
      } // there is case for curTile.north.east TBD
    }  
    if (curTile.quad == 'ul') {
      if (curTile.south) { 
        curTile.south.quad = 'll';
        oneQuad.push(curTile.south);
        this.setPending(done,curTile.south);
      }
      if (curTile.east) { 
        curTile.east.quad = 'ur';
        oneQuad.push(curTile.east);
        this.setPending(done,curTile.east);
      }
      if (curTile.east && curTile.east.south) { 
        curTile.east.south.quad = 'lr';      
        oneQuad.push(curTile.east.south);
        this.setPending(done,curTile.east.south);
      }
    }  
    if (curTile.quad == 'ur') {
      if (curTile.south) { 
        curTile.south.quad = 'lr';
        oneQuad.push(curTile.south);
        this.setPending(done,curTile.south);
      }
      if (curTile.west) { 
        curTile.west.quad = 'ul';
        oneQuad.push(curTile.west);
        this.setPending(done,curTile.west);
      }
      if (curTile.west && curTile.west.south) { 
        curTile.west.south.quad = 'll';      
        oneQuad.push(curTile.west.south);
        this.setPending(done,curTile.west.south);
      }
    }  
    if (curTile.quad == 'lr') {
      if (curTile.north) { 
        curTile.north.quad = 'ur';
        oneQuad.push(curTile.north);
        this.setPending(done,curTile.north);
      }
      if (curTile.west) { 
        curTile.west.quad = 'll';
        oneQuad.push(curTile.west);
        this.setPending(done,curTile.west);
      }
      if (curTile.west && curTile.west.north) { 
        curTile.west.north.quad = 'ul';      
        oneQuad.push(curTile.west.north);
        this.setPending(done,curTile.west.north);
      }
    }
    quads.push(oneQuad);  
  }
  return quads;
}

vidteq._tiler.prototype.checkAddCoarseTiles = function (pending,callback) {
  var tiles = this.tiles[this.tI.z];
  var newTiles = [];
  var quads = this.getCoarseQuads(tiles);
  for (var i in quads){
    var oneQuad = quads[i];
    newTiles.push(this.createAndLinkCoarse(oneQuad,pending));
  }
  // first set pending then germinate
  for (var i in quads){
    var oneQuad = quads[i];
    this.germinateCoarse(oneQuad,pending,callback);
  }
  //var l=$.extend([],tiles);
  //for (var i in l){
  //  this.deleteTile(tiles[0]);
  //}
  return newTiles;
}

vidteq._tiler.prototype.onlyUnique = function (value, index, self) {  
  return self.indexOf(value) === index;

}

vidteq._tiler.prototype.createOldCoarseTiles = function (newTiles,tiles,cb) {
  this.co=[];
  for(var i in newTiles){
		var tile=newTiles[i];
    var that = this;
    this.germinateTile(tile,function(){
			for(var j in tile.fine){
		    that.deleteTile(tile.fine[j]);		
			}
			});
	}
	cb();
}

vidteq._tiler.prototype.checkAddCoarseTilesOld = function () {
  var tiles = this.tiles[this.tI.z];
  var colTile = [];
  for (var i in tiles){
    var curTile = tiles[i];
    if (curTile.coarse) { continue; }
    var oneQuad = []; 
    oneQuad.push(curTile);
    //var restTiles
    for (var j in tiles){
      if (tiles[j].coarse) { continue; }
      if (i==j) { continue; }
      if (curTile.i == tiles[j].i && curTile.j+1 == tiles[j].j) { 
        oneQuad.push(tiles[j]);
      } else if (curTile.i+1 == tiles[j].i && curTile.j+1==tiles[j].j) {
        oneQuad.push(tiles[j]);
      } else if (curTile.i+1 == tiles[j].i && curTile.j == tiles[j].j) {
        oneQuad.push(tiles[j]);
      }
    }

    if (!this.checkIfValidQuad(oneQuad)) { continue; }
    var tile = this.getCoarseTile(oneQuad[0]);
    this.computePxRatio([tile],oneQuad[0].mesh);
    this.germinateTile(tile);
    this.linkZoomTiles(oneQuad[1],'coarse',tile);
    this.linkZoomTiles(oneQuad[2],'coarse',tile);
    this.linkZoomTiles(oneQuad[3],'coarse',tile);
  }
}

vidteq._tiler.prototype.doThreshold = function (idx,tcSide,addOrDel) {
  if (tcSide.spr < 0.27 || tcSide.visibleFrac < 0.3) { 
    addOrDel.del[idx] = true;
  } else if (tcSide.visibleFrac >= 0.5 && tcSide.spr > 0.27) { 
    addOrDel.add[idx] = true 
  } 
}

vidteq._tiler.prototype.doThresholdInAxis = function (aCount,idx,oppIdx,tcSide,oppTcSide) {
  var addOrDel = {add:{},del:{}};
  if (aCount >= 8) {
    var temp = {add:{},del:{}};
    this.doThreshold(idx,tcSide,temp);
    this.doThreshold(oppIdx,oppTcSide,temp);
    if (temp.del[idx] && temp.del[oppIdx]) { // both del
      if (tcSide.visibleFrac < oppTcSide.visibleFrac) {
        addOrDel.del[idx] = true;
      } else if (oppTcSide.visibleFrac < tcSide.visibleFrac) {
        addOrDel.del[oppIdx] = true;
      } else { // equal 
        if (tcSide.spr < oppTcSide.spr) {
          addOrDel.del[idx] = true;
        } else {
          addOrDel.del[oppIdx] = true;
        }
      }
    } else if (temp.add[idx] && temp.add[oppIdx]) { // both add
    } else if (
        (temp.add[idx] && temp.del[oppIdx]) ||
        (temp.del[idx] && temp.add[oppIdx])) { // one add one del 
      addOrDel = temp;
    } else {  // do nothing
    }
  }
  if (aCount <= 4) {
    if (tcSide.visibleFrac < oppTcSide.visibleFrac) {
      addOrDel.add[oppIdx] = true;
    } else {
      addOrDel.add[idx] = true;
    }
  }
  if (4 < aCount && aCount < 8) {
    // visibleFrac
    // spr
    var temp = {add:{},del:{}};
    this.doThreshold(idx,tcSide,temp);
    this.doThreshold(oppIdx,oppTcSide,temp);
    if (temp.del[idx] && temp.del[oppIdx]) { // both del
      if (tcSide.visibleFrac < oppTcSide.visibleFrac) {
        addOrDel.del[idx] = true;
      } else if (oppTcSide.visibleFrac < tcSide.visibleFrac) {
        addOrDel.del[oppIdx] = true;
      } else { // equal 
        if (tcSide.spr < oppTcSide.spr) {
          addOrDel.del[idx] = true;
        } else {
          addOrDel.del[oppIdx] = true;
        }
      }
    } else if (temp.add[idx] && temp.add[oppIdx]) { // both add
      if (tcSide.visibleFrac > oppTcSide.visibleFrac) {
        addOrDel.add[idx] = true;
      } else if (oppTcSide.visibleFrac > tcSide.visibleFrac) {
        addOrDel.add[oppIdx] = true;
      } else { // equal 
        if (tcSide.spr > oppTcSide.spr) {
          addOrDel.add[idx] = true;
        } else {
          addOrDel.add[oppIdx] = true;
        }
      }
    } else if (
        (temp.add[idx] && temp.del[oppIdx]) ||
        (temp.del[idx] && temp.add[oppIdx])) { // one add one del 
      addOrDel = temp;
    } else {  // do nothing
    }
  }
  return addOrDel;
}

vidteq._tiler.prototype.transferAddOrDel = function (s,tcSides) {
  var ortho = {n:'e',e:'n',s:'w',w:'s'};
  var one = tcSides[s];
  var ret = {};
  ret.vote = one.vote;
  ret.side = s;
  ret.ortho = ortho[s];
  ret.frac = one.visibleFrac;
  ret.orthoLength = tcSides[ret.ortho].tiles.length;
  ret.tiles = tcSides[s].tiles;
  return ret;
}

vidteq._tiler.prototype.electForZoom = function (tcSides) {
  var electedZoom={};
  var nsCount = tcSides.e.tiles.length
  var ewCount = tcSides.s.tiles.length
  if(nsCount>=8 && ewCount>=8){
  if(this.chooseVoteForZoom.coarse >this.chooseVoteForZoom.fine){
    electedZoom.coarse=true;
  }  else{electedZoom.fine=true;}
  }
  return electedZoom;
}
vidteq._tiler.prototype.electASide = function (tcSides) {
  // plasing score
  // algo
  // if count(east) < 3 exand anyway
  // if count(north) < 3 exand anyway
  // if count(east) > 6 - you cannot exapnd in north or south direction
  //    - however we can add and del simultatneously
  // or if every side wants to expand - then go for coarse
  // if count(north) > 6 - you cannot expand in east or west direction
  //    - however we can add and del simultatneously
  // when 3 < count(north) < 6
  //   - now we need to check the vote and decie what we need to do 
  var ret = {};
  var nsCount = tcSides.e.tiles.length
  var ewCount = tcSides.s.tiles.length
  // I need to go to coarse only if there is head room for going up
  var goodTile= this.getGoodResTile();
  if(!('goodTiles' in this)){this.goodTiles=[];}
  this.goodTiles.push(goodTile);
  //if (nsCount == ewCount && nsCount == 8) {
  //  ret.fine = true;
  //  return ret;
  //}
  if (nsCount == ewCount && nsCount >= 8) {
    if(goodTile && goodTile.pxRatio.a>=0.9 && goodTile && goodTile.pxRatio.a<1.1){
			ret.stay = true;
  		return ret;
  	}
  	if(goodTile && goodTile.pxRatio.a>1.1){
  		ret.fine = true;
      return ret;
  	}
  	if(goodTile && goodTile.pxRatio.a<0.8){
  		ret.coarse = true;
      return ret;
  	}
	}
  //if (tcSides.pxRatio.aStatV.max > 4) {
  //  ret.fine = true;
  //  return ret;
  //}
  //if (nsCount == ewCount && nsCount == 8 && tcSides.pxRatio.aStat.max < 0.5) {
  //  ret.coarse = true;
  //  return ret;
  //}
  //if (nsCount == ewCount && nsCount == 4 && tcSides.pxRatio.a > 1) {
  //  ret.fine = true;
  //  return ret;
  //}
  // TBD Fine
  if (nsCount <= ewCount) {
    var addOrDel = this.doThresholdInAxis(nsCount,'n','s',tcSides.n,tcSides.s);
    if (Object.keys(addOrDel.add).length) {
      var s = Object.keys(addOrDel.add)[0];
      ret.add = this.transferAddOrDel(s,tcSides);
    }
    if (Object.keys(addOrDel.del).length) {
      var s = Object.keys(addOrDel.del)[0]; 
      ret.del = this.transferAddOrDel(s,tcSides);
    }
    if (Object.keys(ret)) { return ret; }
  } 
  if (ewCount <= nsCount) {
    var addOrDel = this.doThresholdInAxis(ewCount,'e','w',tcSides.e,tcSides.w);
    if (Object.keys(addOrDel.add).length) {
      var s = Object.keys(addOrDel.add)[0]; 
      ret.add = this.transferAddOrDel(s,tcSides);
    }
    if (Object.keys(addOrDel.del).length) {
      var s = Object.keys(addOrDel.del)[0]; 
      ret.del = this.transferAddOrDel(s,tcSides);
    }
    if (Object.keys(ret)) { return ret; }
  }
  return ret; 
}

vidteq._tiler.prototype.electASideOld1 = function (tcSides) {
  var sides = {n:'north',e:'east',s:'south',w:'west'};
  var ortho = {n:'e',e:'n',s:'w',w:'s'};
  var max = {};  // vote based 
  var min = {};  // is visibility based
  for (var s in sides) {
    var one = tcSides[s];
    if (!max.vote || max.vote < one.vote) { 
      max.vote = one.vote;
      max.side = s;
      max.ortho = ortho[s];
    }
    if (!min.visible || min.visible > one.visible) { 
      min.visible = one.visible;
      min.side = s;
      min.ortho = ortho[s];
    }
  }
  max.frac = max.vote/tcSides[max.side].tiles.length;
  max.orthoLength = tcSides[max.ortho].tiles.length;
  min.frac = min.visible/tcSides[min.side].tiles.length;
  min.orthoLength = tcSides[min.ortho].tiles.length;

  var ret = {};
  if (max.frac > 0.5 && max.orthoLength < 10) {
    max.tiles = tcSides[max.side].tiles;
    ret.add = max;
    tcSides[max.side].extended = true; 
  } else if (min.frac < 0.5 && min.orthoLength>5) {
    min.tiles = tcSides[min.side].tiles;
    ret.del = min;
    tcSides[min.side].contracted = true; 
  }
  return ret;
}

vidteq._tiler.prototype.electASideOld = function (tcSides) {
  var sides = {n:'north',e:'east',s:'south',w:'west'};
  var maxVote = tcSides.n.vote;
  var maxSide = 'n';
  for (var s in sides) {
    if (maxVote > tcSides[s].vote) { continue; }
    maxVote = tcSides[s].vote;
    maxSide = s;
  }
  // for debug purpose
  tcSides[maxSide].elected = true; 
  return {side:maxSide,tiles:tcSides[maxSide].tiles};
}

vidteq._tiler.prototype.computeClusterSides = function (tiles) {
  var ret = {
    n:{tiles:[],vote:0,visible: 0}
    ,e:{tiles:[],vote:0,visible:0}
    ,s:{tiles:[],vote:0,visible:0}
    ,w:{tiles:[],vote:0,visible:0}
    ,f:{tiles:[],vote:0}  // fine 
    ,c:{tiles:[],vote:0}  // coarse
  };
  var zoom={vfc:0,vff:0,ttiles:0};
  if(!('allowForZoom' in this)){this.allowForZoom=[];}
  var sides = {n:'north',e:'east',s:'south',w:'west'};
  var aStatV = {total:tiles.length};
  for (var t in tiles) {
    var curTile = tiles[t];
    this.computePxRatio([curTile]);
    if (curTile.pxRatio.a > 2) {
      ret.f.vote++;
      ret.f.tiles.push(curTile);
      zoom.vff++;
    }
    if (curTile.pxRatio.a < 0.5) {
      ret.c.vote++;
      ret.c.tiles.push(curTile);
      zoom.vfc++;
    }
    if (curTile.pxRatio.cornerVisible) {
      if (!aStatV.count) { aStatV.count = 1; }
      else { aStatV.count++; }
      if (!aStatV.max || aStatV.max < curTile.pxRatio.a) { aStatV.max = curTile.pxRatio.a; }
      if (!aStatV.min || aStatV.min > curTile.pxRatio.a) { aStatV.min = curTile.pxRatio.a; }
    } 
    if (!Object.keys(curTile.asf)) { continue; }
    var neededSides = this.fillNeededSides(curTile);
    var visible=0;
    if (this.isVisible(curTile)) { visible++; }
    for (var s in sides) {
      if (!curTile.asf[s]) { continue; } 
      var oneVote = {
        tile:curTile
        ,vote:0
        ,visible:visible
      };
      if (neededSides[sides[s]]) { 
        oneVote.vote++;
      } else { 
        //oneVote.vote--; 
      }
      ret[s].tiles.push(oneVote);
    }
  }
  var vff=zoom.vff/tiles.length;
  var vfc=zoom.vfc/tiles.length;
  this.chooseVoteForZoom={coarse:vfc  ,fine:vff};
  zoom.ttiles=tiles.length;
  this.allowForZoom.push(zoom);
  var aStat = {};
  for (var s in sides) {
    var one = ret[s];
    one.tiles = one.tiles.sort(function(a,b){
      var aVal = a.tile.lonIdx + a.tile.latIdx;
      var bVal = b.tile.lonIdx + b.tile.latIdx;
      return aVal - bVal; 
    });
    for (var t in one.tiles) {
      one.vote += one.tiles[t].vote;
      one.visible += one.tiles[t].visible;
    }
    one.voteFrac = one.vote/one.tiles.length;
    one.visibleFrac = one.visible/one.tiles.length;
    one.a = this.computeAForOneSide(one);
    if (!aStat.max || aStat.max < one.a.max) { aStat.max = one.a.max; }
    if (!aStat.min || aStat.min > one.a.min) { aStat.min = one.a.min; }
  }
  ret.pxRatio = this.computePxRatioForOneTc(ret);
  if(ret.pxRatio){
    ret.pxRatio.aStat = aStat;
    ret.pxRatio.aStatV = aStatV;
    for (var s in sides) {
      ret[s].spr = ret.pxRatio[s].spr;
      ret[s].spx = ret.pxRatio[s].spx;
    }
  }
  return ret;
}

vidteq._tiler.prototype.isVisiClusterSides = function (tiles) {
  var tcSides = this.computeClusterSides(tiles);
  var selectedSides=[];
  var sides = {n:'north',e:'east',s:'south',w:'west'};
  
  var arret=[];
  for (var s in sides) {
    var mini = {};
    var ret = {};
    var one = tcSides[s];
    if(!one.tiles.length){continue;}
    //if (!mini.visible || mini.visible > one.visible) { 
    mini.visible = one.visible;
    mini.side = s;
    //}
    mini.frac = mini.visible/tcSides[mini.side].tiles.length;
    if (mini.frac < 0.5) {
      mini.tiles = tcSides[mini.side].tiles;
      ret.add = mini;
      tcSides[mini.side].deleted = true; 
      selectedSides.push(ret);
    }
  
  }
  for(var i in selectedSides){
    var m;
    //if(selectedSides[i].add.side=="w"){m=}
    this.delASide(selectedSides[i].add);
  }

  return selectedSides;
}

vidteq._tiler.prototype.renderZooming = function (curTile,changes) {
  if (this.tI.zooming == 'fine') {
      //if (curTile.fine && curTile.fine[quad] && curTile.fine[quad].mesh) { 
      //  continue; 
      //}
    var tiles = curTile.fine || this.getFinerTiles(curTile);
    this.computePxRatio(tiles,curTile.mesh);
    for (var quad in tiles) {
      var tile = tiles[quad];
      if (tile.mesh) {
        continue;
      }
      //this.computePxRatio([tile],curTile.mesh);
      //if (this.isVisible(tile)) { // TBD is it really needed ?
        var that = this;
        (function () {
          var childTile = tile;
          var parentTile = curTile;
          changes.add.push(that.germinateTile(tile,function (){
            childTile.loaded = true;
            var allLoaded = true;
            for (var i in parentTile.fine) {
              if (parentTile.fine[i].mesh &&
                  !parentTile.fine[i].loaded) { 
                allLoaded = false; 
              }
            }
            if (allLoaded) { 
              that.deleteTile(parentTile);
            }
          }));
        })();
      //}
    }
  }
  if (this.tI.zooming == 'coarse') {
    var tile = this.getCoarseTile(curTile);
    this.computePxRatio([tile],curTile.mesh);
  }
}

vidteq._tiler.prototype.getFinerTiles = function (seed) {
  //if (seed.fine) { return seed.fine };
  var z = seed.z; z++;
  var res = this.tI.resA[z];
  var tiles = {};
  var tileSeed = {
    z:z
    ,res:res
    ,resTile: res * this.tI.tileSizePx
    ,tu:seed.tu/2
  };
  tiles.ll = $.extend({},tileSeed,{
    c:{
      lon:seed.c.lon-tileSeed.resTile/2
      ,lat:seed.c.lat-tileSeed.resTile/2
    }
    ,quad:'ll'
  });
  tiles.ul = $.extend({},tileSeed,{
    c:{
      lon:seed.c.lon-tileSeed.resTile/2
      ,lat:seed.c.lat+tileSeed.resTile/2
    }
    ,quad:'ul'
  });
  tiles.ur = $.extend({},tileSeed,{
    c:{
      lon:seed.c.lon+tileSeed.resTile/2
      ,lat:seed.c.lat+tileSeed.resTile/2
    }
    ,quad:'ur'
  });
  tiles.lr = $.extend({},tileSeed,{
    c:{
      lon:seed.c.lon+tileSeed.resTile/2
      ,lat:seed.c.lat-tileSeed.resTile/2
    }
    ,quad:'lr'
  });
  var ret = {}; // to enable caching
  for (var i in tiles) {
    var tile = this.fillIdxFromC(tiles[i]);
    $.extend(tile,this.getGCorners(seed,'fine',tile.quad));
    this.linkZoomTiles(seed,'fine',tile);
    ret[i] = tile;
  }
  return ret;
}

vidteq._tiler.prototype.computePxRatio = function (tiles,refMesh) {
  for (var i in tiles) {
    this.computePxRatioForOneTile(tiles[i],refMesh);
  }
}

vidteq._tiler.prototype.getEdgeAndArea = function (c,sc) {  // from corners
  var sc = sc || {};
  var ret = {};
  ret.n = this.getEdge(c.ul,c.ur,sc.n);
  ret.e = this.getEdge(c.ur,c.lr,sc.e);
  ret.w = this.getEdge(c.ll,c.ul,sc.w);
  ret.s = this.getEdge(c.ll,c.lr,sc.s);
  ret.nesw = this.getEdge(c.ur,c.ll);
  ret.nwse = this.getEdge(c.ul,c.lr);
  ret.ult = this.getArea({  // upper left triangle
    a:c.ll
    ,b:c.ul
    ,c:c.ur
    ,ab:ret.w
    ,bc:ret.n
    ,ca:ret.nesw
  });
  ret.lrt = this.getArea({  // lower right triangle
    a:c.ll
    ,b:c.lr
    ,c:c.ur
    ,ab:ret.s
    ,bc:ret.e
    ,ca:ret.nesw
  });
  ret.a = (ret.ult.af + ret.ult.af)/((256*256)*((sc.n||1)*(sc.e||1)));
  return ret;
}

vidteq._tiler.prototype.computeAForOneSide = function (tcSide) {
  var tiles = tcSide.tiles;
  var avg = 0;
  var min = null;
  var max = null;
  for (var i in tiles) {
    var a = tiles[i].tile.pxRatio.a;
    if (!min || min > a) { min = a; }
    if (!max || max < a) { max = a; }
    avg += a;
  } 
  avg = avg/tiles.length;
  var sqrDiff = 0;
  for (var i in tiles) {
    var a = tiles[i].tile.pxRatio.a;
    var diff = a - avg;
    sqrDiff += diff * diff;
  }
  std = Math.sqrt(sqrDiff/tiles.length);
  return {
    min:min
    ,max:max
    ,avg:avg
    ,std:std
  };
}

vidteq._tiler.prototype.computePxRatioForOneTc = function (tc) {
  if(tc.e.tiles.length==0 || tc.w.tiles.length==0 || tc.n.tiles.length==0 || tc.s.tiles.length==0){return;}
  var pxRatio = {};
  pxRatio.vertices = {
    'll': tc.s.tiles[0].tile.pxRatio.vertices.ll
    ,'ul': tc.n.tiles[0].tile.pxRatio.vertices.ul
    ,'ur': tc.n.tiles[tc.n.tiles.length-1].tile.pxRatio.vertices.ur
    ,'lr': tc.s.tiles[tc.n.tiles.length-1].tile.pxRatio.vertices.lr
  };
  pxRatio.corners = {
    'll': tc.s.tiles[0].tile.pxRatio.corners.ll
    ,'ul': tc.n.tiles[0].tile.pxRatio.corners.ul
    ,'ur': tc.n.tiles[tc.n.tiles.length-1].tile.pxRatio.corners.ur
    ,'lr': tc.s.tiles[tc.n.tiles.length-1].tile.pxRatio.corners.lr
  };
  pxRatio.sideCount = {
    n:tc.n.tiles.length
    ,s:tc.s.tiles.length
    ,e:tc.e.tiles.length
    ,w:tc.w.tiles.length
  };
  $.extend(pxRatio,this.getEdgeAndArea(pxRatio.corners,pxRatio.sideCount));
  return pxRatio;
  //this.printPretty(pxRatio);
}

vidteq._tiler.prototype.computePxRatioForOneTile = function (tile,refMesh) {
  if (!('pxRatio' in tile)) { tile.pxRatio = {}; }
  if (tile.mesh) {
    var m = tile.mesh;
    m.updateMatrix();
    m.updateMatrixWorld();
    //var isect = this.frustum.intersectsObject(m);
  }
  var b = tile.mesh || refMesh;
  var pxRatio = tile.pxRatio;
  var id = this.venue360.viewerId;
  var width = $("#"+id).width();
  var height = $("#"+id).height();
  var widthHalf = width / 2, heightHalf = height / 2;

  var vector = new THREE.Vector3();
  //var projector = new THREE.Projector();
  var vertices = this.getVertices(tile,this.cVOrder);
  if (!vertices) { return; } // TBD what to do
  pxRatio.vertices = vertices;
  pxRatio.corners = {};
  for (var i in vertices) {
    vector.copy(vertices[i]);
    //projector.projectVector( vector.applyProjection(b.matrixWorld), this.venue360.camera );
    ( vector.applyProjection(b.matrixWorld)).project(this.venue360.camera );
    vector.x = ( vector.x * widthHalf ) + widthHalf;
    vector.y = - ( vector.y * heightHalf ) + heightHalf;
    var one = {
      x:parseInt(vector.x)
      ,y:parseInt(vector.y)
    };
    one.visible = (0<=one.x && one.x<width && 0<=one.y && one.y<height);  // how is it doing?
    pxRatio.corners[i] = one;
  }
  var c = pxRatio.corners;
  pxRatio.n = this.getEdge(c.ul,c.ur);
  pxRatio.e = this.getEdge(c.ur,c.lr);
  pxRatio.w = this.getEdge(c.ll,c.ul);
  pxRatio.s = this.getEdge(c.ll,c.lr);
  pxRatio.nesw = this.getEdge(c.ur,c.ll);
  pxRatio.nwse = this.getEdge(c.ul,c.lr);
  pxRatio.ult = this.getArea({  // upper left triangle
    a:c.ll
    ,b:c.ul
    ,c:c.ur
    ,ab:pxRatio.w
    ,bc:pxRatio.n
    ,ca:pxRatio.nesw
  });
  pxRatio.lrt = this.getArea({  // lower right triangle
    a:c.ll
    ,b:c.lr
    ,c:c.ur
    ,ab:pxRatio.s
    ,bc:pxRatio.e
    ,ca:pxRatio.nesw
  });
  pxRatio.a = (pxRatio.ult.af + pxRatio.ult.af)/(256*256);
  //this.printPretty(pxRatio);
}

vidteq._tiler.prototype.getEdge = function (n1,n2,m) { // m is multiplier
  var m = m || 1;
  var ret = {};
  ret.spx = parseInt(this.getLength(n1,n2)); // screen pixels
  ret.f = n1.visible ?  // fraction visible 
    (n2.visible ? 1 : 0.5) : 
    (n2.visible ? -0.5 : 0);
  ret.fspx = parseInt(ret.spx * ret.f);
  ret.fp = {   // TBD how to get the fraction point
    x:(n1.x+n2.x)/2
    ,y:(n1.y+n2.y)/2
  };
  ret.spr = ret.spx/(256 * m);   // screen to physical pixel ratio 
  return ret;
}

vidteq._tiler.prototype.getLength = function (n1,n2) {
  return Math.sqrt(
    (n1.x - n2.x)*(n1.x - n2.x)+
    (n1.y - n2.y)*(n1.y - n2.y)
  );
}

vidteq._tiler.prototype.getVertices = function (tile,cVOrder) {
  if (tile.mesh) {
    return this.getCv(tile,cVOrder);
  }
  if (tile.gCorners) { return tile.gCorners; }
}

vidteq._tiler.prototype.getCv = function (tile,cVOrder) { 
  // corner Vertices
  var cv = {};
  if (!tile.mesh) { return cv; }
  cVOrder = cVOrder || this.cVOrder;
  for (var i in cVOrder) {
    //cv[i] = tile.mesh.geometry.vertices[cVOrder[i]];
    var b = tile.mesh;
    cv[i] = (b.geometry ? 
      b.geometry.vertices :
      b.children && b.children.length ? 
        b.children[0].geometry.vertices : null
    )[cVOrder[i]];
  }
  return cv;
}

vidteq._tiler.prototype.isVisible = function (tile) {
  if (!('pxRatio' in tile)) { return false; }
  var r = tile.pxRatio;
  var c = r.corners;
  var anyCornerVisible = 
    c.ll.visible ||
    c.ul.visible ||
    c.lr.visible ||
    c.ur.visible;
  r.cornerVisible = anyCornerVisible;
  if (r.a < 0.02) { 
  //if (r.a < 0.3) {   //rs changes
    r.reason = "Too small";
    r.visible = false;
    return false; 
  } // too small
  if (anyCornerVisible) { 
    r.reason = "Corner visible";
    r.visible = true;
    return true; 
  } 
  if (r.a > 4) { 
    r.reason = "Too big";
    r.visible = false;
    return false; 
  } // too big area, not visible as well
  r.reason = "Area ok but not visible";
  r.visible = false;
  return false;
}

vidteq._tiler.prototype.voteForZoom = function (tile,zoom) {
  zoom.total++;
  if (!('pxRatio' in tile)) { return 'none'; }
  var r = tile.pxRatio;
  if (r.a < 0.5) { zoom.coarse++; return 'coarse'; }
  else if (2 < r.a) { zoom.fine++; return 'fine'; }
  else { zoom.stay++; return 'stay'; }
  return 'none';
}

vidteq._tiler.prototype.checkBeforeExtend = function (electedSide,tcSides) {
  var whichCorner={};
  var up;var down;
  var searchKey1='';
  var searchKey2='';
  var lengthTiles;
  if (electedSide.side=='e' || electedSide.side=='w'){
    lengthTiles=tcSides['n'];
    searchKey1='n';
    up='ul';down='ur';
    //searchKey2='s';   //we will tka elater
  } else if (electedSide.side=='n' || electedSide.side=='s'){
    lengthTiles=tcSides['e'];
    searchKey1='e'; 
    up='ur';down='lr'; 
    //searchKey2='w';   //we will tka elater
  } else { return; }
  var nebrTiles=[];
  var actualLength=256;
  for(var i in lengthTiles.tiles){ 
    actualLength+=lengthTiles.tiles[i].tile.tu;
  }
  return {al:actualLength};
  alert(090);
  
  for(var i in this.tiles){       //take a [] push tiles which has at least one side to germinate and compare here rther comparing all tiles
    var ct=this.tiles[i];
    var cta= ct.asf;
    for(var j in cta){
      if(cta[searchKey1]){
        nebrTiles.push(ct);
        break;
      }
    }
  }
  this.length=[];
  
  var actualLength=0;
  for(var i in nebrTiles){
    var a=nebrTiles[i].pxRatio.corners[up].x;
    var b=nebrTiles[i].pxRatio.corners[up].y;
    var n1={x:a,y:b};          
    var c=nebrTiles[i].pxRatio.corners[down].x;
    var d=nebrTiles[i].pxRatio.corners[down].y;
    var n2={x:c,y:d};
    this.length.push(this.getLength(n1,n2));
    tl+=this.getLength(n1,n2);
    actualLength+=nebrTiles[i].tu;
  }
  return {tl:tl,al:actualLength};
}

vidteq._tiler.prototype.addASide = function (electedSide,changes,callback) {
  var tileWraps = electedSide.tiles;
  var sides = {n:'north',e:'east',s:'south',w:'west'};
  var oppSides = {n:'s',e:'w',s:'n',w:'e'};
  var side = sides[electedSide.side];
  var oppSide = oppSides[electedSide.side];
  var uniquify = {};
  var toGerminate = [];
  for (var t in tileWraps) {
    var curTile = tileWraps[t].tile;
    if (curTile[side] && curTile[side].mesh) { 
      continue; 
    }
    var tile = curTile[side] || this.getSideTile(curTile,side); 
    tile.asf = $.extend({},curTile.asf);
    delete curTile.asf[electedSide.side];
    delete tile.asf[oppSide];
    if (tile.mesh) {
      continue;
    }
    this.computePxRatio([tile],curTile.mesh);
    if (!(tile.lonIdx in uniquify)) { uniquify[tile.lonIdx] = {}; }
    uniquify[tile.lonIdx][tile.latIdx] = true;
    toGerminate.push(tile);
  }
  for (var i in toGerminate) {
    var tile = toGerminate[i];
    changes.add.push(this.germinateTile(tile,function (tile) {
      delete uniquify[tile.lonIdx][tile.latIdx];
      if (Object.keys(uniquify[tile.lonIdx]).length) { return; }
      delete uniquify[tile.lonIdx];
      if (Object.keys(uniquify).length) { return; }
      if (callback) { callback(); }
    }));
  }

}

vidteq._tiler.prototype.delASide = function (electedSide,changes) {
  var tileWraps = electedSide.tiles;
  
  var sidesExt = {n:'north',e:'east',s:'south',w:'west'};
  var oppSides = {n:'s',e:'w',s:'n',w:'e'};
  var oppSidesExt = {n:'south',e:'west',s:'north',w:'east'};
  var sideExt = sidesExt[electedSide.side];
  var oppSide = oppSides[electedSide.side];
  var oppSideExt = oppSidesExt[electedSide.side];
  for (var t in tileWraps) {
    var curTile = tileWraps[t].tile;
    var oppTile = curTile[oppSideExt];
    if (oppTile) {
      if (!('asf' in oppTile)) { 
        oppTile.asf = {};
      }
      oppTile.asf[electedSide.side] = true;
    }
    changes.del.push(curTile);
    //if (electedSide.side=="w") { 
    //  curTile.east.asf.w=true;
    //}
    //else if (electedSide.side=="e") { 
    //  curTile.west.asf.e=true;
    //}
    //else if (electedSide.side=="n") { 
    //  curTile.south.asf.n=true;
    //}
    //else if (electedSide.side=="s") { 
    //  curTile.north.asf.s=true;
    //}
  }
}

vidteq._tiler.prototype.addOrDelASide = function (electedSide,changes,callback) {
  if (electedSide.add) {
    this.addASide(electedSide.add,changes,callback);
  }
  if (electedSide.del) {
    this.delASide(electedSide.del,changes);
  }
  if (!electedSide.add && electedSide.del) {
    // note that del does not have callback support
    if (callback) { 
      setTimeout(function () {
        callback(); 
      },10);
    }
  }
}

vidteq._tiler.prototype.getIJMinMax = function (tiles) {
  
  var tcSides=this.computeClusterSides(tiles);
  this.minmax=[];
  var mnij=['ur','ul','lr','ll']
  this.minmaxIJ={};//{ur:{i:0,j:0},ul:{i:0,j:0},lr:{i:0,j:0},ll:{i:0,j:0}};
  var sidesns=['n','s'];         //['n','e','s','w'];
  var sidesew=['e','w'];
  //var oppsides=['s','w','n','e'];
  for(var i in sidesns){
    //var tempSides=['n','e','s','w'];
    if(!tcSides[sidesns[i]].tiles.length){continue;}  //cSides[i].sort(function(a,b){return tcSides[i].lonIdx-a.lonIdx; });
    //tempSides.splice(sides.indexOf(oppsides[i]),1);
    for(var j in sidesew){
      //if(sides[i]==sidesew[j] || sides[i]==tempSides[j]){continue;}
      this.compareTwoSides(tcSides[sidesns[i]],tcSides[sidesew[j]]);
    }
  }
  for(var i in this.minmax){
    //var t=mnij[i];
    this.minmaxIJ[mnij[i]]=this.minmax[i];
    
  }
  delete this.minmax;
}

vidteq._tiler.prototype.compareTwoSides = function (side1,side2) {
  for(var s1 in side1.tiles){
    for(var s2 in side2.tiles){  
      var mm={i:0,j:0};
      if(side1.tiles[s1].tile==side2.tiles[s2].tile){
        //if(!('minmax' in this)){this.minmax=[];}
        mm.i=side1.tiles[s1].tile.i;
        mm.j=side1.tiles[s1].tile.j;
        mm.tile=side1.tiles[s1].tile;
        this.minmax.push(mm);
        break;
      }
    }
  }
}
vidteq._tiler.prototype.renderSiding = function (curTile,changes) {
  var sides = this.fillNeededSides(curTile);
  for (var side in sides) {
    if (curTile[side] && curTile[side].mesh) { 
      continue; 
    }
    var tile = curTile[side] || this.getSideTile(curTile,side);  
    if (tile.mesh) {
      continue;
    }
    this.computePxRatio([tile],curTile.mesh);
    if (this.isVisible(tile)) {
      changes.add.push(this.germinateTile(tile));
    }
  }
}

vidteq._tiler.prototype.fillNeededSides = function (tile) {
  if (!('pxRatio' in tile)) { return {}; }
  var r = tile.pxRatio;
  var sides = {};  
  //if ((r.corners.ll.visible || r.corners.lr.visible) && tile.asf.s) { // && 
  if (tile.asf.s 
    && (r.corners.ll.visible || r.corners.lr.visible) 
    && (r.a > 0.02)
  ) { 
    sides.south = true; 
  }
  if (tile.asf.w
     && (r.corners.ll.visible || r.corners.ul.visible)
     && (r.a > 0.02)
  ) {
    sides.west = true; 
  }
  if (tile.asf.n
    && (r.corners.ul.visible || r.corners.ur.visible)
     && (r.a > 0.02)
  ) {
    sides.north = true; 
  }
  if (tile.asf.e
    && (r.corners.lr.visible || r.corners.ur.visible)
     && (r.a > 0.02)
  ) {
    sides.east = true; 
  }
  r.sides = sides;
  return sides;
}

vidteq._tiler.prototype.getSideTile = function (seed,side) {
  if (seed[side]) { return seed[side] };
  var tile = this.getSideTileFromCache(seed,side);
  if (tile) { 
    this.linkTiles(seed,side,tile);
    return tile; 
  }
  var tile = {
    res:seed.res
    ,z:seed.z
    ,resTile:seed.resTile
    ,tu:seed.tu
  };
  if (side == 'north') {
    tile.c =  {lon:seed.c.lon,lat:seed.c.lat+seed.resTile};
    tile.i = seed.i;
    tile.j = seed.j+1;
  } 
  if (side == 'south') {
    tile.c =  {lon:seed.c.lon,lat:seed.c.lat-seed.resTile};
    tile.i = seed.i;
    tile.j = seed.j-1;
  } 
  if (side == 'east') {
    tile.c =  {lon:seed.c.lon+seed.resTile,lat:seed.c.lat};
    tile.i = seed.i+1;
    tile.j = seed.j;
  }
  if (side == 'west') {
    tile.c =  {lon:seed.c.lon-seed.resTile,lat:seed.c.lat};
    tile.i = seed.i-1;
    tile.j = seed.j;
  }
  //tile.ll = {
  //  lon:this.getGbLon(tile.c.lon,tile.res,this.tI.tileSizePx)
  //  ,lat:this.getGbLat(tile.c.lat,tile.res,this.tI.tileSizePx)
  //};
  //tile.c = { // re assign
  //  lon:tile.ll.lon+tile.resTile/2
  //  ,lat:tile.ll.lat+tile.resTile/2
  //};
  //$.extend(tile,this.getTileIdx(tile));
  var ret = this.fillIdxFromC(tile);
  $.extend(ret,this.getGCorners(seed,side));
  this.linkTiles(seed,side,ret);
  var ortho = {
    north:{east:1,west:1}
    ,east:{north:1,south:1}
    ,south:{east:1,west:1}
    ,west:{north:1,south:1}
  };
  // for example let us say side is north
  // so new time is my northward - I need  link my north to new tile
  //  I need to link new tiles south to me
  // also I have to link new neighbours
  //  my east->north is new tile's east
  //  my west->north is new tile's west 
  for (var oSide in ortho[side]) {
    if (seed[oSide] && seed[oSide][side]) {
      this.linkTiles(ret,oSide,seed[oSide][side]);
    } 
  }
  return ret;
}

vidteq._tiler.prototype.getSideTileFromCache = function (seed,side) {
  if (!('z' in seed)) { return; }
  var z = seed.z;
  if (!this.tH[z]) { return; }
  var tH = this.tH[z];
  var i = seed.lonIdx;
  var j = seed.latIdx;
  if (side == 'north') { j++; } 
  if (side == 'south') { j--; }
  if (side == 'east') { i++; }
  if (side == 'west') { i--; }
  if (!tH[i]) { return; }
  if (!tH[i][j]) { return; }
  var tile = tH[i][j];
  return tile;
}

vidteq._tiler.prototype.fillIdxFromC = function (tile,noComit) {
  tile.ll = {
    lon:this.getGbLon(tile.c.lon,tile.res,this.tI.tileSizePx)
    ,lat:this.getGbLat(tile.c.lat,tile.res,this.tI.tileSizePx)
  };
  tile.c = { // re assign
    lon:tile.ll.lon+tile.resTile/2
    ,lat:tile.ll.lat+tile.resTile/2
  };
  $.extend(tile,this.getTileIdx(tile));
  if (noComit) { return tile; }
  return this.addTileToCache(tile);
}

vidteq._tiler.prototype.getGCorners = function (seed,side,quad) {
  if (!seed.p) { return {}; }
  var x = seed.p.x;
  var y = seed.p.y;
  var z = seed.p.z;
  var quad = quad || seed.quad;
  if (side == 'fine') {
    //y -= 50;
    if (quad == 'll') { }
    if (quad == 'ul') { z -= seed.tu/2; } 
    if (quad == 'lr') { x += seed.tu/2; } 
    if (quad == 'ur') { z -= seed.tu/2; x += seed.tu/2; } 
    z += seed.tu/4; x -= seed.tu/4; // TBD why  
  }
  if (side == 'coarse') {
    //y += 50;
    //if (quad == 'll') { }
    //if (quad == 'ul') { z += seed.tu; } 
    //if (quad == 'lr') { x -= seed.tu; } 
    //if (quad == 'ur') { z += seed.tu; x -= seed.tu; } 
    if (quad == 'll') { x += seed.tu/2; z -= seed.tu/2; }
    if (quad == 'ul') { x += seed.tu/2; z += seed.tu/2; } 
    if (quad == 'lr') { x -= seed.tu/2; z -= seed.tu/2; } 
    if (quad == 'ur') { x -= seed.tu/2; z += seed.tu/2; } 
  }
  if (side == 'north') { z -= seed.tu; } 
  if (side == 'south') { z += seed.tu; } 
  if (side == 'east') { x += seed.tu; }
  if (side == 'west') { x -= seed.tu; }
  var ret = {};
  //ret.p = new THREE.Vector3(x,this.tI.gY,z);
  ret.p = new THREE.Vector3(x,y,z);
  // r = {x:-Math.PI/2};
  ret.r = {x:-90*Math.PI/180};
  if (seed.mesh) {
    var cv = this.getCv(seed);
    var dNorth = new THREE.Vector3();
    dNorth.subVectors(cv.ul,cv.ll);
    var dEast = new THREE.Vector3();
    dEast.subVectors(cv.lr,cv.ll);
    var newLl = new THREE.Vector3();
    newLl.copy(cv.ll);
    if (side == 'fine') {
      dNorth.divideScalar(2); 
      dEast.divideScalar(2); 
      if (quad == 'll') { }
      if (quad == 'ul') { newLl.add(dNorth); } 
      if (quad == 'lr') { newLl.add(dEast); } 
      if (quad == 'ur') { newLl.add(dNorth); newLl.add(dEast); } 
    }
    if (side == 'coarse') {
      if (quad == 'll') { }
      if (quad == 'ul') { newLl.sub(dNorth); } 
      if (quad == 'lr') { newLl.sub(dEast); } 
      if (quad == 'ur') { newLl.sub(dNorth); newLl.sub(dEast); } 
      dNorth.multiplyScalar(2); 
      dEast.multiplyScalar(2); 
    }
    if (side == 'north') { newLl.add(dNorth); } 
    if (side == 'south') { newLl.sub(dNorth); } 
    if (side == 'east') { newLl.add(dEast); }
    if (side == 'west') { newLl.sub(dEast); }
    ret.gCorners = {
      ll:newLl
      ,ul:newLl.clone().add(dNorth)
      ,ur:newLl.clone().add(dNorth).add(dEast)
      ,lr:newLl.clone().add(dEast)
    };
    return ret;
  }
  //ret.gCorners = {
  //  ll:new THREE.Vector3(x,this.tI.gY,z)
  //  ,ul:new THREE.Vector3(x,this.tI.gY,z+seed.tu)
  //  ,ur:new THREE.Vector3(x+seed.tu,this.tI.gY,z+seed.tu)
  //  ,lr:new THREE.Vector3(x+seed.tu,this.tI.gY,z)
  //};
  var dNorth = seed.tu;
  var dEast = seed.tu;
  if (side == 'fine') { dNorth = dNorth/2; }
  if (side == 'coarse') { dNorth = dNorth*2; }
  ret.gCorners = {
    ll:new THREE.Vector3(x,y,z)
    ,ul:new THREE.Vector3(x,y,z-dNorth)
    ,ur:new THREE.Vector3(x+dEast,y,z-dNorth)
    ,lr:new THREE.Vector3(x+dEast,y,z)
  };
  return ret;
} 

vidteq._tiler.prototype.linkTiles = function (seed,side,tile) {
  seed[side] = tile;
  var otherSide = 
    side == 'north' ? 'south' :
    side == 'south' ? 'north' :
    side == 'east' ? 'west' :
    side == 'west' ? 'east' : 'none';
  tile[otherSide] = seed; // TBD circular very dangerous
}
 
vidteq._tiler.prototype.germinateTile = function (tile,callback) {
  var tileUrl = this.tI.urlSeed + tile.ll.lon+','+tile.ll.lat+','+(tile.ll.lon+tile.resTile)+','+(tile.ll.lat+tile.resTile);
  tile.tileUrl = tileUrl;
  var opt = {};
  //if (tile.lonIdx == 5870 && tile.latIdx == 2350) {
  //  opt.print = true;
  //}
  // LoadTexture seems to be calling callback synchronously 
  // when it is cached, that will give trouble with our pending 
  // so we need to do the call back async
  var b = this.addOneTileFloor(tile.tu,tile.p,tile.r,tileUrl,function () {
    setTimeout(function () { 
      callback(tile); 
    },10); 
  },function () {
    setTimeout(function () { 
      callback(tile,{error:"Tile germination error"});
    },10);
  },opt);
  tile.mesh = b;
  delete tile.gCorners;
  return tile;
}

vidteq._tiler.prototype.deleteTile = function (tile) {
  var z = tile.z;
  for (var j in this.tiles[z]) {
    if (this.tiles[z][j] == tile) {
      this.tiles[z].splice(j,1);
      break;
    }
  }
  this.terminateTile(tile);
}

vidteq._tiler.prototype.deleteTileFromCache = function (tile) {
  if (!(tile.z in this.tH)) { return; }
  var tH = this.tH[tile.z];
  var i = tile.lonIdx;
  var j = tile.latIdx;
  if (!tH[i]) { return; }
  if (!tH[i][j]) { return; }
  delete tH[i][j];
  if (!Object.keys(tH[i]).length) { delete tH[i]; }
}


vidteq._tiler.prototype.terminateObj = function (obj) {
  if (obj.geometry) {
    obj.geometry.dispose();
    delete obj.geometry; // TBD why ?
  }
  if (obj.material) {
    if (obj.material.map && 
        obj.material.map.image && 
        obj.material.map.image.remove) {
      obj.material.map.image.remove();
    }
    if (obj.material.dispose) {
      obj.material.dispose();
    }
    delete obj.material;  // TBD why ?
  }
  //if (obj.dispose) {
  //  obj.dispose();
  //}
}

vidteq._tiler.prototype.terminateTile = function (tile) {
  this.terminateTileMesh(tile);
  this.terminateTileLink(tile);
  delete tile; // TBD why?
}

vidteq._tiler.prototype.terminateTileMesh = function (tile) {
  if (!tile.mesh) { return; } 
  var obj = tile.mesh;
  this.venue360.scene.remove(obj);
  if (obj.children) {
    for (var i in obj.children) {
      this.terminateObj(obj.children[i]);
    }
  }
  this.terminateObj(obj);
  obj.remove();
  delete obj; // why ?
  delete tile.mesh;
}

vidteq._tiler.prototype.terminateTileLink = function (tile) {
  if ('north' in tile) {   
    if (tile.north.south) { delete tile.north.south; }
    delete tile.north; 
  }
  if ('south' in tile) { 
    if (tile.south.north) { delete tile.south.north; }
    delete tile.south; 
  }
  if ('east' in tile) { 
    if (tile.east.west) { delete tile.east.west; }
    delete tile.east; 
  }
  if ('west' in tile) { 
    if (tile.west.east) { delete tile.west.east; }
    delete tile.west; 
  }
//  if ('fine' in tile) {
//    for (var quad in tile.fine) {
//      if (tile.fine[quad]) {
//        delete tile.fine[quad].coarse;
//        delete tile.fine[quad];
//      }
//    } 
//    delete tile.fine; 
//  }
//  if ('coarse' in tile) {
//    if (tile.coarse.fine) {
//      delete tile.coarse.fine[tile.quad];
//      //delete tile.coarse.fine;
//    }  
//    delete tile.coarse; 
//  }
  this.deleteTileFromCache(tile);
}

vidteq._tiler.prototype.addTileToCache = function (tile) {
  if (!(tile.z in this.tH)) { this.tH[tile.z] = {}; }
  var tH = this.tH[tile.z];
  var i = tile.lonIdx;
  var j = tile.latIdx;
  if (!tH[i]) { tH[i] = {}; }
  if (tH[i][j]) { return tH[i][j]; }
  // TBD is it ok ? to overwrite ?
  tH[i][j] = tile;
  return tile;
}

//vidteq._tiler.prototype.getGCorners = function (seed,side) {
//  if (!seed.p) { return {}; }
//  var x = seed.p.x;
//  var z = seed.p.z;
//  if (side == 'north') { z += seed.tu; } 
//  if (side == 'south') { z -= seed.tu; } 
//  if (side == 'east') { x += seed.tu; }
//  if (side == 'west') { x -= seed.tu; }
//  var ret = {};
//  ret.p = new THREE.Vector3(x,this.tI.gY,z);
//  // r = {x:-Math.PI/2};
//  ret.r = {x:-90*Math.PI/180};
//  if (seed.mesh) {
//    var cv = this.getCv(seed);
//    var dNorth = new THREE.Vector3();
//    dNorth.subVectors(cv.ul,cv.ll);
//    var dEast = new THREE.Vector3();
//    dEast.subVectors(cv.lr,cv.ll);
//    var newLl = new THREE.Vector3();
//    newLl.copy(cv.ll);
//    if (side == 'north') { newLl.add(dNorth); } 
//    if (side == 'south') { newLl.sub(dNorth); } 
//    if (side == 'east') { newLl.add(dEast); }
//    if (side == 'west') { newLl.sub(dEast); }
//    ret.gCorners = {
//      ll:newLl
//      ,ul:newLl.clone().add(dNorth)
//      ,ur:newLl.clone().add(dNorth).add(dEast)
//      ,lr:newLl.clone().add(dEast)
//    };
//    return ret;
//  }
//  ret.gCorners = {
//    ll:new THREE.Vector3(x,this.tI.gY,z)
//    ,ul:new THREE.Vector3(x,this.tI.gY,z+this.tI.tu)
//    ,ur:new THREE.Vector3(x+this.tI.tu,this.tI.gY,z+this.tI.tu)
//    ,lr:new THREE.Vector3(x+this.tI.tu,this.tI.gY,z)
//  };
//  return ret;
//}

//vidteq._tiler.prototype.getGCornersOld = function (seed,side) {
//  if (!seed.p) { return {}; }
//  var x = seed.p.x;
//  var z = seed.p.z;
//  if (side == 'north') { z += this.tI.tu; } 
//  if (side == 'south') { z -= this.tI.tu; } 
//  if (side == 'east') { x += this.tI.tu; }
//  if (side == 'west') { x -= this.tI.tu; }
//  var ret = {};
//  ret.p = new THREE.Vector3(x,this.tI.gY,z);
//  // r = {x:-Math.PI/2};
//  ret.r = {x:-90*Math.PI/180};
//  ret.gCorners = {
//    ll:new THREE.Vector3(x,this.tI.gY,z)
//    ,ul:new THREE.Vector3(x,this.tI.gY,z+this.tI.tu)
//    ,ur:new THREE.Vector3(x+this.tI.tu,this.tI.gY,z+this.tI.tu)
//    ,lr:new THREE.Vector3(x+this.tI.tu,this.tI.gY,z)
//  };
//  return ret;
//  ///    var b = this.addOneTileFloor(tu,p,r,tileUrl);
//}

vidteq._tiler.prototype.getCoarseTile = function (seed,noComit) {
  //if (seed.coarse) { return seed.coarse };
  var z = seed.z; z--;
  var res = this.tI.resA[z];
  var tileSeed = {
    z:z
    ,res:res
    ,resTile: res * this.tI.tileSizePx
    ,tu:seed.tu*2
    ,c:{ // We dont really know the quadrant
      lon:seed.c.lon   // assumption
      ,lat:seed.c.lat  // assumption
    }
  };
  var tile = this.fillIdxFromC(tileSeed,noComit);
  if (tile.c.lon < seed.c.lon && tile.c.lat < seed.c.lat) { seed.quad = 'ur'; }
  if (tile.c.lon < seed.c.lon && tile.c.lat >= seed.c.lat) { seed.quad = 'lr'; }
  if (tile.c.lon >= seed.c.lon && tile.c.lat < seed.c.lat) { seed.quad = 'ul'; }
  if (tile.c.lon >= seed.c.lon && tile.c.lat >= seed.c.lat) { seed.quad = 'll'; }
  if (noComit) { return tile; }
  //seed.quad = 
  //  tile.c.lon < seed.c.lon ? 
  //    (tile.c.lat < seed.c.lat ? 'ur' : 'lr') : 
  //    (tile.c.lat < seed.c.lat ? 'ul' : 'll');
  $.extend(tile,this.getGCorners(seed,'coarse'));
  this.linkZoomTiles(seed,'coarse',tile);
  this.linkZoomSideTiles(seed,'coarse',tile);
  this.inheritAsfZoomTiles(seed,'coarse',tile);
  return tile;
}

vidteq._tiler.prototype.getQuad = function (seed,side,tile) {
  var finer = (side == 'coarse') ? seed : tile;
  var coarser = (side == 'coarse') ? tile : seed;
  var quad = finer.quad;
  return quad;
}

// ASF - means allowedSideFlag
vidteq._tiler.prototype.inheritAsfZoomTiles = function (seed,side,tile) {
  if (!('asf' in tile)) { tile.asf = {}; }
  if (side == 'coarse') {
    tile.asf = $.extend(tile.asf,seed.asf);
  } 
  if (side == 'fine') {
    var quad = this.getQuad(seed,side,tile);
    var quadSideRef = {
      ll:{west:'lr',south:'ul'}
      ,ul:{west:'ur',north:'ll'}
      ,ur:{east:'ul',north:'lr'}
      ,lr:{east:'ll',south:'ur'}
    };
    var quadSideRef2 = {
      ll:{w:'lr',s:'ul'}
      ,ul:{w:'ur',n:'ll'}
      ,ur:{e:'ul',n:'lr'}
      ,lr:{e:'ll',s:'ur'}
    };
    var quadSides = quadSideRef[quad];
    var quadSides2 = quadSideRef2[quad];
    for (var quadSide in quadSides2) {
      if (seed.asf[quadSide]) { tile.asf[quadSide] = true; }
    }
  }
  // TBD delete seed.asf ???
}

vidteq._tiler.prototype.linkZoomSideTiles = function (seed,side,tile) {
  var quad = this.getQuad(seed,side,tile);
  var quadSideRef = {
    ll:{west:'lr',south:'ul'}
    ,ul:{west:'ur',north:'ll'}
    ,ur:{east:'ul',north:'lr'}
    ,lr:{east:'ll',south:'ur'}
  };
  var quadSides = quadSideRef[quad];
  for (var quadSide in quadSides) {
    if (side == 'coarse') {
      if (seed[quadSide] && seed[quadSide].coarse) {
        this.linkTiles(tile,quadSide,seed[quadSide].coarse);
      }
    }
    if (side == 'fine') {
      /////////////////////////////////////
      //////////////////////////////////
      
      var oppQuad = quadSides[quadSide];
      if (seed[quadSide] && seed[quadSide].fine && seed[quadSide].fine[oppQuad]) {
        this.linkTiles(tile,quadSide,seed[quadSide].fine[oppQuad]);
      }
    }
  }
}

vidteq._tiler.prototype.linkZoomTiles = function (seed,side,tile) {
	
  var finer = (side == 'coarse') ? seed : tile;
  var coarser = (side == 'coarse') ? tile : seed;
  var quad = finer.quad;
  finer['coarse'] = coarser;
  if (!('fine' in coarser)) { coarser.fine = {}; }
  coarser['fine'][quad] = finer;
}

vidteq._tiler.prototype.linkZoomTilesOld = function (seed,side,tile) {
  if (!(side in seed)) { seed[side] = {}; }
  var quad =  
    side == 'fine' ? tile.quad : 
    side == 'coarse' ? seed.quad : 'none'; 
  seed[side][quad] = tile;
  var otherSide = 
    side == 'fine' ? 'coarse' :
    side == 'coarse' ? 'fine' : 'none';
  if (!(otherSide in tile)) { tile[otherSide] = {}; }
  tile[otherSide][quad] = seed;
}

vidteq._tiler.prototype.printPretty = function (pxRatio) {
  return;
  console.log(pxRatio);
  console.log("venue360--ll");console.log(pxRatio.corners.ll);
  console.log("venue360--ul");console.log(pxRatio.corners.ul);
  console.log("venue360--ur");console.log(pxRatio.corners.ur);
  console.log("venue360--lr");console.log(pxRatio.corners.lr);
  console.log("venue360--n "+pxRatio.n.toFixed(2));
  console.log("venue360--e "+pxRatio.e.toFixed(2));
  console.log("venue360--w "+pxRatio.w.toFixed(2));
  console.log("venue360--s "+pxRatio.s.toFixed(2));
  console.log("venue360--ne-sw "+pxRatio.nesw.toFixed(2));
  console.log("venue360--nw-se "+pxRatio.nwse.toFixed(2));
}

vidteq._tiler.prototype.getHeron = function (a,b,c) {
  var s = (a + b + c)/2;
  return Math.sqrt(s*(s-a)*(s-b)*(s-c)); 
}

vidteq._tiler.prototype.getArea = function (t) {
  var ret = {};
  ret.af = this.getHeron(t.ab.spx,t.bc.spx,t.ca.spx); // area full
  if (t.a.visible && t.b.visible && t.c.visible) {
    ret.apx = ret.af;
  } else if (!t.a.visible && !t.b.visible && !t.c.visible) {
    ret.apx = 0;
  } else if ((t.a.visible && !t.b.visible && !t.c.visible) ||
             (!t.a.visible && t.b.visible && t.c.visible)) {
    var area = this.getHeron(
      this.getLength(t.a,t.ab.fp)
      ,this.getLength(t.ab.fp,t.ca.fp)
      ,this.getLength(t.ca.fp,t.a)
    );
    if (t.a.visible) { ret.apx = area; }
    if (!t.a.visible) { ret.apx = ret.af - area; }
  } else if ((t.b.visible && !t.a.visible && !t.c.visible) ||
             (!t.b.visible && t.a.visible && t.c.visible)) {
    var area = this.getHeron(
      this.getLength(t.b,t.bc.fp)
      ,this.getLength(t.bc.fp,t.ca.fp)
      ,this.getLength(t.ca.fp,t.b)
    );
    if (t.b.visible) { ret.apx = area; }
    if (!t.b.visible) { ret.apx = ret.af - area; }
  } else if ((t.c.visible && !t.b.visible && !t.a.visible) ||
             (!t.c.visible && t.b.visible && t.a.visible)) {
    var area = this.getHeron(
      this.getLength(t.c,t.ca.fp)
      ,this.getLength(t.ca.fp,t.bc.fp)
      ,this.getLength(t.bc.fp,t.c)
    );
    if (t.c.visible) { ret.apx = area; }
    if (!t.c.visible) { ret.apx = ret.af - area; }
  } else {
    ret.apx = ret.af;  // may be zero TBD
  }
  return ret;
}

vidteq._tiler.prototype.getGoodResTile = function () {
  x = ($('#'+this.venue360.viewerId).width())/2;
  y = ($('#'+this.venue360.viewerId).height())-50;
  //console.log(e);
  mouseVector = new THREE.Vector3();
  mouseVector.x = (x/$('#'+this.venue360.viewerId).width())*2 - 1;
  mouseVector.y = -(y/$('#'+this.venue360.viewerId).height())*2 + 1;
  mouseVector.z = 0.5;
  //this.projector = new THREE.Projector();
  tileMeshes=[];
  for(var i in this.tiles[this.tI.z]){
    tileMeshes.push(this.tiles[this.tI.z][i].mesh.children[0]);
  }
  var vector = new THREE.Vector3();
  //vector.set(mouseVector.x,mouseVector.y,mouseVector.z );
  vector.copy(mouseVector);
  mouseVector.unproject( this.venue360.camera );
  
  var raycaster = new THREE.Raycaster( this.venue360.camera.position, mouseVector.sub( this.venue360.camera.position ).normalize() );
  
  var intersects = raycaster.intersectObjects( tileMeshes );
  if (intersects && intersects.length){
    
		for(var i in this.tiles[this.tI.z]){  // binary search can be used with mesh id    
      if (this.tiles[this.tI.z][i].mesh.children[0]===intersects[0].object){
        return this.tiles[this.tI.z][i];        
      }  
    }    
  }
}

vidteq._tiler.prototype.store = function (key,val,max) {
  //var max = max || 10;
  //if (!(key in this)) { this[key] = []; }
  //this[key].push(val);
  //while (this[key].length > max) {
  //  this[key].shift();
  //};
  var max = max || 10;
  var setMax = 10;
  if (!(key in this)) { 
    this[key] = {from:0,to:0,1:[]}; 
    this[key].old = 1;
    this[key].cur = 1;
  }
  var sPtr = this[key];
  sPtr[sPtr.cur].push(val);
  sPtr.to++;
  if (sPtr[sPtr.cur].length >= setMax) {
    sPtr.cur++; 
    sPtr[sPtr.cur] = [];
  }
  while (sPtr.to - sPtr.from > max) {
    delete sPtr[sPtr.old];
    sPtr.old++;
    sPtr.from += setMax;
  };
}

vidteq._tiler.prototype.standardDeviation = function (values) {
  var avg = this.average(values);
  
  var squareDiffs = values.map(function(value){
    var diff = value - avg;
    var sqrDiff = diff * diff;
    return sqrDiff;
  });
  
  var avgSquareDiff = this.average(squareDiffs);

  var stdDev = Math.sqrt(avgSquareDiff);
  return stdDev;
}

vidteq._tiler.prototype.average = function (data) {
  var sum = data.reduce(function(sum, value){
    return sum + value;
  }, 0);

  var avg = sum / data.length;
  return avg;
}


