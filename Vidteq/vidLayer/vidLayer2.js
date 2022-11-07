if (typeof (vidteq) == 'undefined') { vidteq = {}; }

vidteq._vidLayer = function () {
  this.tiles = [];
  this.tH = {};
  this.tI = {}; // Tile info
  this.stopRender = true;
  this.cVOrder = { ll: 2, ul: 0, lr: 3, ur: 1 }; // Corner Vertex order TBD

  this.loaded = false;
  this.tbc = true;
  this.carEvent = {};
  vidteq.utils = new vidteq._utils();
}
var vtt = new vidteq._vidLayer();
//console.log(vtt);alert();


vidteq._vidLayer.prototype.init = function () {
  console.log("init")
  if (!Detector.webgl) Detector.addGetWebGLMessage();
  this.scene = new THREE.Scene();

  this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 100000000);
  this.camera.position.set(0, 500, 2000);
  this.camera.target = new THREE.Vector3(0, 0, 0);
  console.log(this.camera);

  this.renderer = new THREE.WebGLRenderer({ antialias: true });
  //document.body.appendChild( renderer.domElement );
  $("#cancon").append(this.renderer.domElement);
  this.renderer.setSize(window.innerWidth, window.innerHeight);
  this.renderer.setClearColor(0x7094FF, 1.0);

  //this.controls = new THREE.TrackballControls( this.camera );
  //
  //this.oldCamPos=$.extend({},this.camera.position);
  //console.log(this.oldCamPos);
  //this.controls.rotateSpeed = 1.0;
  //this.controls.zoomSpeed = 10.5;
  //this.controls.panSpeed = 0.8;  
  //this.controls.noZoom = false;
  //this.controls.noPan = false; 
  //this.controls.staticMoving = true;
  //this.controls.dynamicDampingFactor = 0.3;


  this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
  //this.controls.maxPolarAngle=80*Math.PI/180;
  var that = this;
  $(this.controls)[0].addEventListener('change', function () {
    if (that.carControlOn) {
      that.carControlOn--;
      return;
    }
    that.blackOutKIV();
  });
  //this.controls.addEventListener( 'change', render ); // add this only if there is no animation loop (requestAnimationFrame)
  //this.controls.enableDamping = true;
  //this.controls.dampingFactor = 0.25;
  //this.controls.noRotate = true;	
  this.ambientLight = new THREE.AmbientLight(0x404040);
  this.scene.add(this.ambientLight);

  this.directionalLight = new THREE.DirectionalLight(0xffffff, 2);
  this.directionalLight.position.set(100, 500, 10).normalize();
  this.scene.add(this.directionalLight);

  this.spotLight = new THREE.SpotLight(0xffffff, 10, 100);
  this.spotLight.position.set(0, 50, 0);
  this.spotLight.castShadow = true;
  this.spotLight.shadowMapWidth = 1024;
  this.spotLight.shadowMapHeight = 1024;
  this.spotLight.shadowCameraNear = 500;
  this.spotLight.shadowCameraFar = 4000;
  this.spotLight.shadowCameraFov = 30;
  this.spotLight.angle = Math.PI / 180 * 20;
  this.scene.add(this.spotLight);
  var spotLightHelper = new THREE.SpotLightHelper(this.spotLight);
  this.scene.add(spotLightHelper);
  //this.clock=new THREE.Clock()  ;
  console.log(this);
  var that = this;
  this.buildAxes(2000, function () {
    that.constructTiles();
  });
  //this.scene.add( axes );

  this.initForTiler(function () { that.animate(); });
  //that.addPath();
  this.initEvents();
  this.animate();
}

//vidteq._vidLayer.prototype.initEventsWhenCarMove = function() {
//  var that=this;
//  this.renderer.domElement.addEventListener( 'mousedown',function(evt) { 
//    
//    //that.onDocumentMouseClick(evt); 
//    that.controls.enable=false;
//    setTimeout(function(){
//      that.controls.enable=true;  
//      },5000);
//  }, false );
//  //this.venue360.renderer.domElement.addEventListener( 'dblclick',function(evt) { 
//  // 
//  //  that.onDocumentMouseDBClick(evt); 
//  //}, false );
//}

vidteq._vidLayer.prototype.initEvents = function () {
  console.log("initEvents");
  var that = this;
  $('#rup').click(function () {
    that.ajaxForVideoRoute();
  });
  $('#rdown').click(function () {
    //that.tilesRotDown();
    clearTimeout(that.ci);
    //clearInterval(that.ci);
  });
  $('#alrt').click(function () {
    alert();
  });

  $('#camfor').click(function () {

  });
  $('#camreset').click(function () {
    that.delTheCar = true;
    delete that.carPoint;
    that.removeRoadElements();
  });
  $('#add').click(function () {//
    that.addPath();
    that.addCar();
    //console.log(that);alert()
  });
  $('#rup').click(function () {
    that.tiler.posTheCamera = true;
  });
  $('#lockCamRor').click(function () {
    if (that.controls.rotateLeftOff) {
      that.controls.rotateLeftOff = false;
      $(document).off("keydown");
      $(document).off("keyup");
      delete that.controlKeyPressed;
    }
    else {
      that.controls.rotateLeftOff = true;
      $(document).on("keydown", function (e) {
        //console.log(e.ctrlKey);  
        if (e.ctrlKey) { that.controlKeyPressed = true; }
      });
      $(document).on("keyup", function (e) {
        //console.log(e.ctrlKey);
        if (that.controlKeyPressed) { that.controlKeyPressed = false; }
      });
    }
    if (that.resetCamOnLockModeOn) { delete that.resetCamOnLockModeOn; }
  });
  $('#camRorL').click(function () {
    that.controls.rotateUp(0.02);
  });

  window.addEventListener('resize', function () {
    that.onWindowResize()
  }, false);
}
// Add some objects to the scene, one per quadrant
vidteq._vidLayer.prototype.onWindowResize = function () {
  this.camera.aspect = window.innerWidth / window.innerHeight;
  this.camera.updateProjectionMatrix();
  this.renderer.setSize(window.innerWidth, window.innerHeight);
}
vidteq._vidLayer.prototype.constructTiles = function () {
  console.log("constructTiles")

  var tu = 256, w = 10, h = 10;

  var x0 = -parseInt(tu * w / 2);
  var z0 = parseInt(tu * h / 2);
  var ct = 0;
  for (var i = 0; i < w; i++) {
    for (var j = 0; j < h; j++) {
      var x = x0 + i * tu;
      var z = z0 - j * tu;
      var p = new THREE.Vector3(x, -500, z);
      var r = { x: -90 * Math.PI / 180 };//;           
      meshMaterial = new THREE.MeshBasicMaterial({
        map: THREE.ImageUtils.loadTexture("tiles/a (" + ++ct + ").png")
      });
      g = new THREE.PlaneGeometry(tu, tu);

      var b = THREE.SceneUtils.createMultiMaterialObject(g, [
        meshMaterial
        , new THREE.MeshBasicMaterial({ wireframeLinewidth: 3, color: 0x222222, wireframe: true })
      ]);

      b.position.copy(p);
      for (var k in r) {
        b.rotation[k] = r[k];
      }
      //ct++;

      this.scene.add(b);
      this.tiles.push(b);
    }//if(i==1)break;
  }
}

vidteq._vidLayer.prototype.animate = function () {
  //var ii=0;
  var that = this;
  console.log("animate");
  function animation() {
    requestAnimationFrame(animation);
    if (that.tbc) {
      that.controls.update();
      //if(that.camera.position.y<10){ that.camera.position.y=10; }
    }
    if (!that.tbc) {
      that.camera.position.z -= 1;
      //me.rotation.y+=0.01;
      //me.position.z-=1;
    }
    //me.rotation.y+=0.01;

    if (that.tiler) { that.tiler.render(); }
    if (that.tiler) {
      //console.log(1)
      that.positionTheCamera();
      if (that.forCameraTiming) {
        that.camTravelTime = that.clock.getElapsedTime();
        //delta = clock.getDelta();
      }
    }

    //for moving the car 
    if (that.renderCarFlag) { that.renderCar(); }

    //for zoom-pan camera controls few modifications on OrbitControls.js
    that.cameraControlOnLockMode();
    that.checkObjectsToKIV();
    if (that.startSign && that.stopSign) {
      //that.startSign.lookAt(that.camera.position);
      //that.stopSign.lookAt(that.camera.position);
      that.startSign.rotation.y += 0.01;
      that.stopSign.rotation.y += 0.01;

    }
    //console.log(that.tempObjCamCar)
    if (that.tempObjCamCar && that.tempObjCamCar.allow) {
      if (that.tempObjCamCar.count > 1) { 
        delete that.tempObjCamCar; 
        console.log(that.fromToLatLon);
      //that.moveCarTo(that.fromToLatLon[0].position.x+":"+that.fromToLatLon[0].position.y);
      that.startCar=true;
        return; 
      }
      that.startCar=false;
      var pos = that.tempObjCamCar.CamPath.getPointAt(that.tempObjCamCar.count);
      that.camera.position.copy(pos);
      that.tempObjCamCar.count += 0.01;
      if (that.carmesh) {
        that.controls.target.copy(that.carmesh.root.position);
      } else {
        that.controls.target.copy(that.tempObjCamCar.focusPoint);
      }
    }
    if(that.startCar){
      that.moveCarToTmp(0);
    }
    //for checking zooming cond.
    //that.decideWhenToZoom();

    that.renderer.render(that.scene, that.camera);
  }
  animation();
}

vidteq._vidLayer.prototype.cameraControlOnLockMode = function () {
  //if lockmode
  //left click+drag=pan left/right
  //if camera on top left click+drag=panup only
  if (this.controls.rotateLeftOff) {
    if (!this.resetCamOnLockModeOn) { this.resetCamOnLockMode(); }
    //console.log(this.controls.currentPolarAngle+">"+(5*Math.PI/180) +"&&"+ this.controls.currentPolarAngle+"<="+0.001);
    //if(this.controls.getPolarAngle()<=(5*Math.PI/180) && this.controls.getPolarAngle()>=0.000001){
    this.controls.maxPolarAngle = 80 * Math.PI / 180;
    if (this.controlKeyPressed) {
      //console.log("if",this.controls.mouseButtons); 
      this.controls.mouseButtons.ORBIT = THREE.MOUSE.LEFT;
      this.controls.mouseButtons.ZOOM = THREE.MOUSE.MIDDLE;
      this.controls.mouseButtons.PAN = THREE.MOUSE.RIGHT;
    }
    else {
      //console.log("if",this.controls.mouseButtons); 
      this.controls.mouseButtons.ORBIT = null;//THREE.MOUSE.RIGHT;
      this.controls.mouseButtons.ZOOM = THREE.MOUSE.MIDDLE;
      this.controls.mouseButtons.PAN = THREE.MOUSE.LEFT;
    }
    //{ ORBIT: THREE.MOUSE.LEFT, ZOOM: THREE.MOUSE.MIDDLE, PAN: THREE.MOUSE.RIGHT }; 
    //position the camera
    //this.resetCamOnLockMode();

    //}

  }
  else {
    //console.log("if",this.controls.mouseButtons);
    this.controls.maxPolarAngle = Math.PI;
    this.controls.mouseButtons.ORBIT = THREE.MOUSE.LEFT;
    this.controls.mouseButtons.ZOOM = THREE.MOUSE.MIDDLE;
    this.controls.mouseButtons.PAN = THREE.MOUSE.RIGHT;
  }
}

vidteq._vidLayer.prototype.resetCamOnLockMode = function () {
  var position = this.controls.object.position;
  var offset = position.clone().sub(this.controls.target);
  var targetDistance = offset.length();
  // half of the fov is center to top of screen
  targetDistance *= Math.tan((this.controls.object.fov / 2) * Math.PI / 180.0);
  var dollyScale = Math.pow(0.95, this.controls.zoomSpeed);
  var scale = 1;// dollyScale;
  var radius = offset.length() * scale;

  // restrict radius to be between desired limits
  radius = Math.max(this.controls.minDistance, Math.min(this.controls.maxDistance, radius));

  //this.controls.target.add( pan );
  var phi = this.controls.getPolarAngle();
  var theta = 0;//-this.controls.getAzimuthalAngle();
  offset.x = radius * Math.sin(phi) * Math.sin(theta);
  offset.y = position.y;//radius * Math.cos( phi );
  offset.z = radius * Math.sin(phi) * Math.cos(theta);

  // rotate offset back to "camera-up-vector-is-up" space
  var quat = new THREE.Quaternion().setFromUnitVectors(this.controls.object.up, new THREE.Vector3(0, 1, 0));
  var quatInverse = quat.clone().inverse();
  offset.applyQuaternion(quatInverse);
  console.log(offset);
  this.camera.position.copy(this.controls.target).add(offset);
  this.resetCamOnLockModeOn = true;
  this.controls.object.lookAt(this.controls.target);
}

vidteq._vidLayer.prototype.checkObjectsToKIV = function () {
  var object = [];
  if (this.carmesh) { object.push(this.carmesh.root.children[0]); }
  var frustum = new THREE.Frustum();
  var cameraViewProjectionMatrix = new THREE.Matrix4();

  // every time the camera or objects change position (or every frame)

  this.camera.updateMatrixWorld(); // make sure the camera matrix is updated
  this.camera.matrixWorldInverse.getInverse(this.camera.matrixWorld);
  cameraViewProjectionMatrix.multiplyMatrices(this.camera.projectionMatrix, this.camera.matrixWorldInverse);
  frustum.setFromMatrix(cameraViewProjectionMatrix);

  // frustum is now ready to check all the objects you need
  if (object.length) {
    //console.log(object);
    //console.log( frustum.intersectsObject( object[0] ) );
  }
}

vidteq._vidLayer.prototype.smoothCamMoveToCarAtStart = async function () {
  console.log("smoothCamMoveToCarAtStart");
  if (!('tempObjCamCar' in this)) { this.tempObjCamCar = {}; }
  //else {return;}
  var CamPos = this.camera.position.clone();
  var pos = this.roadGeometry[0].clone();
  var RoadPos = new THREE.Vector3(pos.x, pos.y + 100, pos.z + 200);
  var CamPath = new THREE.LineCurve3(CamPos, RoadPos);
  this.tempObjCamCar.CamPath = CamPath;
  this.tempObjCamCar.allow = true;
  this.tempObjCamCar.count = 0;
  this.tempObjCamCar.focusPoint = this.roadGeometry[10].clone();
}

vidteq._vidLayer.prototype.renderCar = function () {
  console.log("renderCar")
  var delta = this.clock.getDelta();
  var et = this.clock.getElapsedTime();
  //if(!('oneSecElapTime' in this)){this.oneSecElapTime=0;}
  //if(et>=this.oneSecElapTime+1 && et<this.oneSecElapTime+1.1){
  //  this.oneSecElapTime=parseInt(et);
  //  console.log(this.oneSecElapTime);
  //}
  //this.controls.update(delta); 
  //console.log(this.carmesh.root.position);
  //this.carmesh.updateCarModel(delta,this.carEvent);
  if (this.carMarkers) {
    var markPoint = this.carMarkers.markPoint;
    var markTime = this.carMarkers.markTime;
    var speed = this.carMarkers.speed;
    var carPos = markPoint.clone().add(speed.clone().multiplyScalar(
      //((new Date()).getTime()-markTime.getTime())/1000
      et - markTime
    ));
    var ang = Math.atan2(carPos.x - this.carmesh.root.position.x, carPos.z - this.carmesh.root.position.z);
    this.carmesh.root.rotation.y = ang;
    this.carmesh.root.position.copy(this.roadGeometry[this.currentCarPosIndexInRoad]);
    //console.log(this.carmesh.root.position);
    var rotPos = new THREE.Vector3(carPos.x + 5 * (Math.random()), carPos.y, carPos.z + 2 * (Math.random()));
    this.carWheelRotate(rotPos);

    if (this.kIVBlackOut) { } else {
      if (!('carControlOn' in this)) { this.carControlOn = 0; }
      this.carControlOn++;
      this.camera.position.set(carPos.x, carPos.y + 100, carPos.z + 200);
      this.controls.target.copy(this.carmesh.root.position);
    }

    this.store('newCarPosStore', carPos, 10);
  }
  if (this.renderTargets) {
    this.store('renderTargetsStore', this.renderTargets, 10);
    var renderTargets = this.renderTargets;
    delete this.renderTargets;
    // TBD if renderTargets.next2Point is not there - what do we do

    if (!renderTargets.next2Point) {
      delete this.carMarkers;  // TBD TBD
    }
    //var curPoint = new THREE.Vector3(
    //  renderTargets.curPoint.x
    //  ,renderTargets.curPoint.y
    //  ,renderTargets.curPoint.z
    //);
    //this.carmesh.root.position.copy(curPoint);
    var targetPoint = new THREE.Vector3(
      renderTargets.next2Point.x
      , renderTargets.next2Point.y
      , renderTargets.next2Point.z
    );
    this.store('targetPointStore', targetPoint, 10);
    var carPos = this.carmesh.root.position;
    this.store('carPosStore', carPos.clone(), 10);
    var speed = targetPoint.clone().sub(carPos).divideScalar(2);
    var markPoint = carPos.clone();
    //var markTime = new Date();
    var markTime = et;
    if (this.carMarkers) {
      this.carMarkers.speed = speed;
      this.carMarkers.markPoint = markPoint;
      this.carMarkers.markTime = markTime;
    } else {
      this.carMarkers = {
        speed: speed
        , markPoint: markPoint
        , markTime: markTime
      };
    }
    this.store('carMarkersStore', this.carMarkers, 10);
  }
  // when a new callState
  //  corner case when you are near the end
  //  let us we pause, let us say we seek video
  //  calculate targetPoint - store it which is 2 sec ahead of you
  //  calculate markPoint - store it
  //  calculate markTime - store it
  //  newSpeed = (targetPoint - curPoint)/2sec
  // when every renderer call
  //  fractionTime = (curTime - markTime)/2sec
  //  new carPos = markPoint + (targetPoint-markPoint)*fractionTime 
  //  new carPos = markPoint + newSpeed * (curTime - markTime);
  // if acceleration is brought in
  // first calculate correction speed 
  //  new carPos = markPoint + newSpeed * (curTime - markTime) + currection speed *(curTime-markTime);
  return;
  if (this.renderCarFlag) {
    //console.log(that);

    if (this.carmesh) {
      //that.carmesh.position.copy(that.line.geometry.vertices[that.ii]);
      //this.carmesh.root.position.copy(this.roadLinePath.geometry.vertices[this.ii]);
      //this.carmesh.root.lookAt( this.roadLinePath.geometry.vertices[this.ii] );
      this.carPositionOnSpline = et / this.travelTime;

      //this.carPositionOnSpline=this.estimElapsTime/this.travelTime;  //TBD will be used to get player head related points

      //this.carPositionOnSpline+=delta/this.travelTime;
      if (this.carPositionOnSpline > 1) { console.log(this.carPositionOnSpline); this.carPositionOnSpline = 1; }
      //console.log(this.carPositionOnSpline);
      //console.log(this.carmesh.root.position);
      //console.log(this.roadCurve.getPointAt(1));
      if (this.carmesh.root.position.equals(this.roadCurve.getPointAt(1))) {
        console.log(this.carPositionOnSpline);
        this.renderCarFlag = false;
        this.carPositionOnSpline = 0;
        this.camera.position.copy(this.camPosBeforeCar);
        this.controls.target.copy(this.camTargetBeforeCar);
      }
      else {
        var diff = this.carPositionOnSpline + 0.01;
        var t1 = this.roadCurve.getPointAt(this.carPositionOnSpline);
        if (diff > 1) { diff = 1; }
        var t2 = this.roadCurve.getPointAt(diff);
        //console.log(this.carmesh.root.position.z<t1.z);
        //if(!('fdb' in this)){this.fdb=[];}
        //this.fdb.push(this.carPositionOnSpline);
        //if(this.carPositionOnSpline>0.02){
        //  var ta=$.extend(true,[],this.fdb);
        //  ta=ta.sort(function(a, b){return a-b});
        //  console.log(JSON.stringify(ta)==JSON.stringify(this.fdb));alert()
        //}
        this.carmesh.root.position.copy(t1);

        if (!('tt' in this)) { this.tt = 0; }
        this.tt += delta;
        //$('#ttime').text(this.tt);
        var m = 0, s = 0;
        if (et >= 60) { m = parseInt(et / 60); s = parseInt(et - m * 60); }
        else { s = parseInt(et) }
        //console.log(m);
        $('#ttime').text(m + " : " + s);
        if (this.controls.enable) {
          this.camera.position.set(t1.x, t1.y + 100, t1.z + 200);
          this.controls.target.copy(this.carmesh.root.position);
        }
        var ag = Math.atan2(t2.x - t1.x, t2.z - t1.z);
        this.carmesh.root.rotation.y = ag;
        //console.log(this.controls.enable);
        //if(et>10 && et<20){this.controls.enable=false;}
        //else{this.controls.enable=true;}
        //var target = this.roadCurve.getPoint( this.carPositionOnSpline+0 );
        //this.carmesh.root.lookAt( target );
        //this.carmesh.root.rotation.y=this.carmesh.carOrientation;

        this.carWheelRotate(t2);

        var newPosition = this.carmesh.root.position;
        this.spotLight.position.set(newPosition.x, this.spotLight.position.y, newPosition.z);
        this.spotLight.target.position.copy(newPosition);
        //this.spotLight.target=this.carmesh.root;
        this.spotLight.target.updateMatrixWorld();
      }
    }
    //console.log(this.carmesh.root.position);
    this.ii++;
  }
}

vidteq._vidLayer.prototype.carWheelRotate = function (target) {
  console.log("carWheelRotate");
  //console.log("target",target);
  var ev = new THREE.Vector3(0, 0, 0);
  if (!('previousOrientation' in this.carmesh)) { this.carmesh.previousOrientation = new THREE.Vector3(1, 0, 1); }
  if (this.carmesh.previousOrientation.equals(ev)) { console.log("===="); }
  var newPosition = this.carmesh.root.position;
  var actualOrientation = new THREE.Vector3().subVectors(target, newPosition);
  actualOrientation.normalize();
  var previousOrientation = this.carmesh.previousOrientation;
  //console.log("newPosition",newPosition);
  //console.log("actualOrientation",actualOrientation);
  //console.log("previousOrientation",previousOrientation);
  var orientation = new THREE.Vector3().crossVectors(actualOrientation, previousOrientation);
  //console.log(orientation);
  this.carmesh.root.children[1].rotation.x += 1 * orientation.y;
  this.carmesh.root.children[2].rotation.x += 1 * orientation.y;
  this.carmesh.root.children[3].rotation.x += 1 * orientation.y;
  this.carmesh.root.children[4].rotation.x += 1 * orientation.y;

  this.carmesh.previousOrientation = actualOrientation;
}

vidteq._vidLayer.prototype.carWheelRotateOld = function () {
  var wheels = this.carmesh.children;

  wheels[1].rotation.x += 36 * Math.PI / 180;
  wheels[2].rotation.x += 36 * Math.PI / 180;
  wheels[3].rotation.x += 36 * Math.PI / 180;
  wheels[4].rotation.x += 36 * Math.PI / 180;

}
vidteq._vidLayer.prototype.initForTiler = function (cb) {
  console.log("initForTiler");

  var that = this;
  $("#cancon canvas").attr('id', 'viewer');
  vidteq.cfg = vidteq._vidteqCfg;
  venue360 = {
    viewerId: 'viewer'
    , container: 'viewer'
    , scene: this.scene
    , camera: this.camera
    , renderer: this.renderer
    , controls: this.controls
    , vidLayer: this
  };
  this.tiler = new vidteq._tiler(venue360);
  this.setupMousePosition();
  var that = this;
  this.tiler.init({
    ll: {
      lon: 77.695313004
      , lat: 13.007813004
    }
    , ur: {
      lon: 77.783203692
      , lat: 13.095703692
    }
  }, function () {
    //that.animate();
    console.log("All tiles of init have germinated");
    // 1 over lap case - same zoom level
    //that.tiler.reInit({
    //  ll:{
    //    lon:77.783203692
    //    ,lat:13.095703692
    //  }
    //  ,ur:{
    //    lon:77.87109438
    //    ,lat:13.18359438
    //  }
    //});

    //// no over lap case - same zoom level
    setTimeout(function () {
      that.tiler.reInit({
        ll: {
          lon: 77.87109438
          , lat: 13.18359438
        }
        , ur: {
          lon: 77.958985068
          , lat: 13.271485068
        }
      }, function () {
        console.log("xxxxxx auto travel called ");
        that.installAutoTravel();
      });
    }, 1000);

    // no over lap case -  z +1 
    //that.tiler.reInit({
    //  ll:{
    //    lon:77.87109438
    //    ,lat:13.18359438
    //  }
    //  ,ur:{
    //    lon:77.915039724
    //    ,lat:13.227539724
    //  }
    //});
  });
}


//lat: 13.539638564070628
//lon: 77.38773456595936
//lat: 13.715419940070628
//lon: 77.56351594195937
//
//lat: 12.780705266413861
//lon: 78.15122089864417
//lat: 12.786198514413861
//lon: 78.15671414664416

vidteq._vidLayer.prototype.setupMousePosition = function () {
  var that = this;
  this.renderer.domElement.addEventListener('mousemove', function (evt) {

    that.onDocumentMouseMove(evt);
  }, false);
  this.renderer.domElement.addEventListener('dblclick', function (evt) {

    that.onDocumentMouseDBClick(evt);
  }, false);
}

vidteq._vidLayer.prototype.detectCtrlKey = function (e) {
}

vidteq._vidLayer.prototype.onDocumentMouseMove = function (e) {

  var intersects = this.getIntersectObject(e);
  if (intersects && intersects.length) {
    //console.log(intersects);
    this.showLatLon(intersects);
  }
}


vidteq._vidLayer.prototype.onDocumentMouseDBClick = function (e) {

  //if(!('dbClkCount' in this)){this.dbClkCount=0;}

  if (!('fromToLatLon' in this)) { this.fromToLatLon = []; }
  if (this.fromToLatLon.length == 2) {
    this.fromToLatLon = [];
    this.removeRoadElements();
  }
  var lat = parseFloat($('#latid').text()); var lon = parseFloat($('#lonid').text());
  console.log(lat + "==" + lon);

  var x = -this.tiler.tI.tu * (this.tiler.lastBbox.c.lon - lon) / this.tiler.tI.resTile;
  var z = this.tiler.tI.tu * (this.tiler.lastBbox.c.lat - lat) / this.tiler.tI.resTile;
  var y = this.tiler.tI.gY;
  this.fromToLatLon.push({ lat: lat, lon: lon, position: { x: x, y: y, z: z } });
  if (this.fromToLatLon.length == 1) {
    var str = this.startSign = this.getBaloonMarker();
    var t1 = new THREE.ImageUtils.loadTexture("img/text1.png");
    t1.wrapS = t1.wrapT = THREE.RepeatWrapping;
    t1.repeat.set(5, 1);
    str.material.map = t1;
    //str.scale.x=2;str.scale.y=2;str.scale.z=2;
    str.material.color = new THREE.Color(0, 1, 0);
    str.position.set(this.fromToLatLon[0].position.x, -5, this.fromToLatLon[0].position.z);
    this.scene.add(str);
    this.startSign = str;
    this.startSign.roadElementDel = true;
  }
  if (this.fromToLatLon.length == 2) {
    var stp = this.stopSign = this.getBaloonMarker();
    var t2 = new THREE.ImageUtils.loadTexture("img/text2.png");
    t2.wrapS = t2.wrapT = THREE.RepeatWrapping;
    t2.repeat.set(5, 1);
    stp.material.map = t2;
    //str.scale.x=2;str.scale.y=2;str.scale.z=2;
    stp.material.color = new THREE.Color(1, 0, 0);
    stp.position.set(this.fromToLatLon[1].position.x, -5, this.fromToLatLon[1].position.z);
    this.scene.add(stp);
    this.stopSign = stp;
    this.stopSign.roadElementDel = true;
  }
  //var intersects=this.getIntersectObject(e);
  ////console.log(intersects);alert();
  //if (intersects.length){    
  //  this.object=intersects[0].object;
  //  //console.log(this.controls.lookAt);alert();
  //  //this.controls.target.copy(this.object.pos);
  //}
  //this.dbClkCount++;
}

vidteq._vidLayer.prototype.getIntersectObject = function (e) {
  //console.log("getIntersectObject");
  x = e.clientX;
  y = e.clientY;
  if (!this.mouseVector) {// just to save memory
    this.mouseVector = new THREE.Vector3();
  }

  this.mouseVector.x = (x / $('#' + this.tiler.venue360.viewerId).width()) * 2 - 1;
  this.mouseVector.y = -(y / $('#' + this.tiler.venue360.viewerId).height()) * 2 + 1;
  //console.log("getIntersectObject",this.mouseVector);
  //this.mouseVector.z = 0.5;
  //this.projector = new THREE.Projector();
  tileMeshes = [];
  for (var i in this.tiler.tiles[this.tiler.tI.z]) {
    tileMeshes.push(this.tiler.tiles[this.tiler.tI.z][i].mesh.children[0]);
  }
  //console.log("getIntersectObject",this.tiler.tiles);
  //var pRay = this.projector.pickingRay(this.mouseVector.clone(),this.camera );
  //var sceneObjects = tileMeshes;
  //var intersects = pRay.intersectObjects(sceneObjects );
  var vector = new THREE.Vector3();
  vector.set((e.clientX / window.innerWidth) * 2 - 1, - (e.clientY / window.innerHeight) * 2 + 1, 0.5);
  this.mouseVector.unproject(this.camera);

  this.drag = true;

  var raycaster = new THREE.Raycaster(this.camera.position, this.mouseVector.sub(this.camera.position).normalize());

  var intersects = raycaster.intersectObjects(tileMeshes);
  return intersects;
}

vidteq._vidLayer.prototype.showLatLon = function (intersects) {
  var idx = 0;
  for (var i in this.tiler.tiles[this.tiler.tI.z]) {  // binary search can be used with mesh id
    //var tf=this.tiles[this.tI.z][i].mesh.children[0]==intersects[0].object;
    if (this.tiler.tiles[this.tiler.tI.z][i].mesh.children[0] === intersects[0].object) {
      idx = i;
      break;
    }
  }
  var curIntersect = this.curIntersect = intersects[0];
  if (this.tiler.tiles[this.tiler.tI.z].length) {
    var lon = this.tiler.lastBbox.c.lon + (curIntersect.point.x * this.tiler.tI.resTile) / this.tiler.tI.tu;
    var lat = this.tiler.lastBbox.c.lat - (curIntersect.point.z * this.tiler.tI.resTile) / this.tiler.tI.tu;
    $('#latid').text(lat.toFixed(6));
    $('#lonid').text(lon.toFixed(6));

    $('#latid1').text(this.tiler.tiles[this.tiler.tI.z][idx].i + " " + this.tiler.tiles[this.tiler.tI.z][idx].ll.lat.toFixed(6));
    $('#lonid1').text(this.tiler.tiles[this.tiler.tI.z][idx].j + " " + this.tiler.tiles[this.tiler.tI.z][idx].ll.lon.toFixed(6));
  }
}





vidteq._vidLayer.prototype.installAutoTravel = function () {
  var that = this;
  this.ci = setTimeout(function () {
    var v = that.autoTravel();
    console.log("autoTravel to ", v);
    that.tiler.reInit(v, function () {
      that.installAutoTravel();
    });
  }, 25000);
}

vidteq._vidLayer.prototype.autoTravel = function () {
  console.log("autoTravel");
  var extent = vidteq.cfg.maxExtent.split(/,/);
  for (var i in extent) { extent[i] = parseFloat(extent[i]); }
  var res = vidteq.cfg.resolutions.split(/,/);
  var resIdx = parseInt(Math.random() * (res.length - 1) + 0.5);
  var curRes = parseFloat(res[resIdx]);
  var targetBound = {
    ll: {
      lon: extent[0] + Math.random() * (extent[2] - extent[0])
      , lat: extent[1] + Math.random() * (extent[3] - extent[1])
    }
  };
  targetBound.ur = {
    lon: targetBound.ll.lon + curRes * 256
    , lat: targetBound.ll.lat + curRes * 256
  };
  console.log(targetBound);
  //var x={};
  //x.ll={lon:78.134766444,lat:13.535157132};
  //x.ur={lon:78.398438508,lat:13.798829196};
  //return x;
  return targetBound;
}

//http://10.4.71.200/cgi-bin/magicHappens.pl?action=viaRoute&city=bangalore&startaddress=77.567272%2C12.913834&endaddress=77.614947%2C12.916627&account=VidTeq&key=vijayawada&searchStartString=Subramanya+Pura+Road&searchEndString=ORR

vidteq._vidLayer.prototype.initOneTimeAnim = function () {
  console.log("initOneTimeAnim", this);
  if (!('startFocus' in this.tiler)) { console.log("initOneTimeAnim2"); return; }
  if (!('endFocus' in this.tiler)) { console.log("initOneTimeAnim3"); return; }
  var startFocus = this.tiler.startFocus
  var endFocus = this.tiler.endFocus;
  var x = parseInt(endFocus.x - startFocus.x);
  var z = parseInt(endFocus.z - startFocus.z);
  var cam = this.camera;
  var anim = {};

  anim.idx = 0;
  anim.startCamPos = this.tiler.startCamPos;
  var distToStartFocus = anim.startCamPos.distanceTo(startFocus);
  anim.distToStartFocus = distToStartFocus;
  console.log("original distance "); console.log(distToStartFocus);
  posX = anim.startCamPos.x + x;
  posY = anim.startCamPos.y;
  posZ = anim.startCamPos.z + z;
  anim.endCamPos = new THREE.Vector3(posX, posY, posZ);


  var distToReInitFocus = anim.endCamPos.distanceTo(endFocus);
  var distToEndFocus = distToStartFocus * Math.pow(2, (this.tiler.focusZ - this.tiler.reInitZ));
  anim.distToEndFocus = distToEndFocus;
  var ray = new THREE.Ray(endFocus, anim.endCamPos.sub(endFocus).normalize());
  anim.endCamPos = ray.at(distToEndFocus);

  anim.mid = {};
  anim.mid.x = (anim.endCamPos.x + anim.startCamPos.x) / 2;
  anim.mid.z = (anim.endCamPos.z + anim.startCamPos.z) / 2;
  anim.halfDist = Math.sqrt((
    Math.pow((anim.endCamPos.z - anim.startCamPos.z), 2) +
    Math.pow((anim.endCamPos.x - anim.startCamPos.x), 2)
  )) / 1;
  //anim.newTarget=false;
  anim.newTarget = true;
  var curve = new THREE.SplineCurve3([
    new THREE.Vector3(anim.startCamPos.x, anim.startCamPos.y, anim.startCamPos.z),
    new THREE.Vector3(anim.mid.x, anim.halfDist, anim.mid.z),
    new THREE.Vector3(anim.endCamPos.x, anim.endCamPos.y, anim.endCamPos.z)
  ]);
  var p1 = startFocus.clone();
  //var p1 = cam.target.clone();
  var p2 = endFocus.clone();
  var line = new THREE.SplineCurve3([p1, p2]);
  var howManyPts = this.howManyPts = parseInt((p2.distanceTo(p1) / 10));
  if (this.tiler.totalTTime) {
    //howManyPts= parseInt(60*this.tiler.totalTTime) ;  //requestAnimationFrame loops 60fps ie in 1 sec 60 times render is called
  }
  anim.curve = curve;
  anim.line = line;
  anim.pathPoints = curve.getPoints(howManyPts);
  anim.linePoints = line.getPoints(howManyPts);

  //anim.curveDist=this.getcurveDist(anim.pathPoints);
  anim.curveDist = curve.getLength();
  //anim.targetPoints =  line.getPoints( 200 ) ;
  var cgeometry = new THREE.Geometry();
  var lgeometry = new THREE.Geometry();
  cgeometry.vertices = anim.pathPoints;
  lgeometry.vertices = anim.linePoints;
  var material = new THREE.LineBasicMaterial({ color: 0xff0000 });
  var curveObject = new THREE.Line(cgeometry, material);
  var lineObject = new THREE.Line(lgeometry, material);
  this.scene.add(curveObject);
  this.scene.add(lineObject);
  anim.curveObject = curveObject;
  anim.lineObject = lineObject;
  //console.log(anim);alert()
  this.store('animation1', $.extend(true, {}, anim, 10));
  return anim;
}

vidteq._vidLayer.prototype.initTwoTimeAnim = function () {
  //if(!('reInitFocusPoint'this.tiler)){return;}
  console.log("initTwoTimeAnim", this.oneTimeAnim);
  var anim = {};
  var oldFocus = this.tiler.focus;
  var newFocus = this.tiler.reInitFocus;
  anim.oldFocus = oldFocus;
  anim.newFocus = newFocus;
  var oldFocusPoint = this.tiler.initFocusPoint;
  if (this.tiler.reInitFocusPoint > 1) {
    this.tiler.reInitFocusPoint = 1;
  }
  var newFocusPoint = this.tiler.reInitFocusPoint;
  var maxPts = 30;
  var pointDiff = (newFocusPoint - oldFocusPoint) / maxPts;
  var fPoints = [];


  for (var i = 0; i < maxPts; i++) {
    if (i == 0) { fPoints[i] = oldFocusPoint; }
    else if (i == maxPts - 1) { fPoints[i] = newFocusPoint; }
    else {
      fPoints.push(fPoints[i - 1] + pointDiff);
    }

  }
  anim.oldFocusPoint = oldFocusPoint;
  anim.newFocusPoint = newFocusPoint;
  anim.newCamPos = this.oneTimeAnim.curve.getPointAt(this.tiler.reInitFocusPoint);
  anim.idx = 0;
  anim.fPoints = fPoints;
  anim.pointDiff = pointDiff;
  this.store('animation2', $.extend(true, {}, anim), 10);
  return anim;
}

vidteq._vidLayer.prototype.getcurveDist = function (points) {
  var s = 0;
  for (var i = 0; i < points.length - 1; i++) {
    s += points[i].distanceTo(points[i + 1]);
  }
  //this.popo=s;
  return s;
}

vidteq._vidLayer.prototype.positionTheCamera = function () {
  if (!('focus' in this.tiler)) { return; }
  if (!('reInitFocus' in this.tiler)) { return; }
  var cam = this.camera;
  var anim = this.oneTimeAnim || this.initOneTimeAnim();
  this.oneTimeAnim = anim;
  var anim2 = this.twoTimeAnim || this.initTwoTimeAnim();
  this.twoTimeAnim = anim2;
  //cam.position.copy(anim.pathPoints[anim.idx]);  
  //console.log("anim",anim);
  //console.log("anim2",anim2);
  if (this.tiler.reInitFocusPoint) {
    //console.log(this.tiler.reInitFocusPoint)  ;
    //console.log(anim.curve)  ;
    //console.log(this.tiler.reInitFocusPoint)  ;
    //console.log(anim.curve.getPointAt(this.tiler.reInitFocusPoint))  ;

    //if(anim2.fPoints[anim2.idx])
    //cam.position.copy(anim.curve.getPointAt(this.tiler.reInitFocusPoint));    
    cam.position.copy(anim.curve.getPointAt(anim2.fPoints[anim2.idx]));
    this.controls.target.copy(anim.line.getPointAt(anim2.fPoints[anim2.idx]));

    cam.updateProjectionMatrix();
  }
  //else{
  //  cam.position.copy(anim.curve.getPointAt(this.tiler.reInitFocusPoint));    
  //}
  //this.venue360.controls.target.set(anim.targetPoints[anim.idx]);
  //this.controls.target.copy(anim.linePoints[anim.idx]);
  //if(anim.newFocus){
  //this.controls.target.copy(anim.newFocus);
  //this.controls.target.copy(anim.line.getPointAt(this.tiler.reInitFocusPoint));
  //this.controls.target.copy(anim.line.getPointAt(anim2.fPoints[anim2.idx]));
  //}
  //cam.updateProjectionMatrix();      

  //console.log(cam.position);console.log(anim.newCamPos);alert()
  if (anim2.newCamPos && cam.position.equals(anim2.newCamPos)) {
    console.log("delete reinitfocus", this.tiler.reInitFocusPoint);
    //alert(1)  ;
    this.tiler.initFocusPoint = this.tiler.reInitFocusPoint;
    this.tiler.focus = this.tiler.reInitFocus;
    delete this.tiler.reInitFocus;
    delete this.tiler.reInitFocusPoint;
    delete this.twoTimeAnim;
    //anim2.idx++;       
  }
  if (cam.position.equals(anim.endCamPos)) {
    console.log("delete endCamPos", this);
    //alert(2);
    this.tiler.startFocus = this.tiler.endFocus;
    this.tiler.startCamPos = this.oneTimeAnim.endCamPos;
    this.tiler.focusZ = this.tiler.reInitZ;
    this.tiler.initTI = this.tiler.reInitTI;
    this.tiler.initFocusPoint = 0;
    delete this.tiler.reInitTI;
    delete this.tiler.endFocus;
    delete this.tiler.endCamPos;
    delete this.tiler.reInitZ;
    delete this.oneTimeAnim;

  }

  this.ap = anim.idx;
  anim.idx++;
  anim2.idx++;
}

vidteq._vidLayer.prototype.ajaxForVideoRoute = function () {
  console.log("ajaxForVideoRoute");
  //var urlPath="";
  //urlPath="http://10.4.71.200/stage/cgi-bin/magicHappens.pl?action=viaRoute&city=bangalore&startaddress=77.759646%2C13.011597&endaddress=77.765996%2C13.056231&account=VidTeq&key=vijayawada&searchStartString=Belatur&searchEndString=Old+Madras+Road";
  var urlPath = "http://10.4.71.200/stage/cgi-bin/magicHappens.pl";
  var data = {
    action: 'viaRoute'
    , city: 'bangalore'
    , startaddress: '77.759646 13.011597'
    , endaddress: '77.765996 13.056231'
    , account: 'VidTeq'
    , key: 'vijayawada'
    , searchStartString: 'Belatur'
    , searchEndString: 'Old Madras Road'
  };
  if (this.fromToLatLon && this.fromToLatLon.length == 2) {
    data.startaddress = this.fromToLatLon[0].lon + " " + this.fromToLatLon[0].lat;
    data.endaddress = this.fromToLatLon[1].lon + " " + this.fromToLatLon[1].lat;
    //urlPath="http://10.4.71.200/stage/cgi-bin/magicHappens.pl?action=viaRoute&city=bangalore&startaddress="
    //+that.tiler.fromToLatLon[0].lon+"%2C"+that.tiler.fromToLatLon[0].lat+"&endaddress="
    //+that.tiler.fromToLatLon[1].lon+"%2C"+that.tiler.fromToLatLon[1].lat+"&account=VidTeq&key=vijayawada&searchStartString=Belatur&searchEndString=Old+Madras+Road";
  }
  var that = this;
  /*
  $.ajax({
    url: urlPath
    ,data:data
    ,success:function(data){
      that.renderVideoRoute(data);
    }  
  });
  */
  this.renderVideoRoute(JSON.stringify(data));

}

vidteq._vidLayer.prototype.renderVideoRoute = function (data) {
  if (this.carPoint) { delete this.carPoint };
  var dt = JSON.parse(data);
  console.log("success", dt);
  dt.highBwUrl = vidteq.cfg.videoUrl;
  dt.lowBwUrl = (typeof (vidteq.cfg.videoUrlLb) != 'undefined') ? vidteq.cfg.videoUrlLb : '';
  this.videoResponse = dt;
  //this.putCarPath(this.videoResponse);
  this.makeRouteLayerCreated = false;
  //Loading video player
  if (this.vidPlayer) {
    //this.vidPlayer.loadVideoPlayer();
  } else {
    //this.vidPlayer = new vidteq._vidPlayer(vtt);
  }
  this.makeRouteLayer();

  //
  //var edge=dt.edge.wkt;
  ////console.log("success",edge);
  //var wkt=edge.replace(/MULTILINESTRING/g,"").replace(/[()]/g,"");
  ////console.log("success",wkt);
  //var s=0;
  //for(var i in dt.video){
  //  s+=parseInt(dt.video[i].VvidSource.duration);
  //}
  //console.log(s);
  ////console.log((dt.video));
  //var w=wkt.split(",");
  //var fv=[];
  //for(var i in w){
  //  var t=w[i].split(" ");  
  //  fv.push({lon:parseFloat(t[0])  ,lat: parseFloat(t[1]) });
  //}
  //console.log("success",fv);
  //var g=new THREE.Geometry();
  //var m=new THREE.LineBasicMaterial({color:0xff0000});
  //var ver=[];var ver1=[];
  ////var w=1000,h=700,ltmin=17.740935,ltmax=17.776738,lnmin=83.218817,lnmax=83.2444;
  //this.latLonG=fv;    
  //for(var i in fv){        
  //  var x = -this.tiler.tI.tu*(this.tiler.lastBbox.c.lon-fv[i].lon)/this.tiler.tI.resTile;
  //  var z = this.tiler.tI.tu*(this.tiler.lastBbox.c.lat-fv[i].lat)/this.tiler.tI.resTile;
  //  
  //  ver1.push(new THREE.Vector3(x,this.tiler.tI.gY,z));
  //  //ver1.push(x,this.tiler.tI.gY,z);
  //  //var a=new THREE.Vector3(x,y,t[i].z);
  //  //ver.push(a);
  //  //g.vertices.push(a);
  //}            
  //this.roadGeometry=ver1;
  //g.vertices=ver1;    
  //var sc= new THREE.SplineCurve3(ver1);
  //this.roadCurve=sc;
  //var gg=sc.getPoints(3000);
  //console.log(gg);
  ////g.vertices=gg; 
  //var ln = new THREE.Line(g,m);     
  //ln.position.y=2;
  //this.roadLinePath  = ln;
  ////console.log(ver1);
  //this.scene.add(ln);
  ////------------------
  //for(var j=0;j<ver1.length;j++){
  //  var dot=new THREE.Mesh(new THREE.SphereGeometry(1,5,5),new THREE.MeshBasicMaterial({color:0x000000}));
  //  //mes.position.copy(new THREE.Vector3(0,0,0));
  //  dot.position.copy(ver1[j]);  
  //  this.scene.add(dot);    
  //  //console.log( dot.position);alert();
  //}
  ////------------------
  //curvedPathMesh=this.getCurvedPathMesh(ver1);
  ////console.log(curvedPathMesh);
  ////var tube = new THREE.TubeGeometry(curvedPath, 20, 2, 8, true);
  //
  //this.scene.add(curvedPathMesh)    ;
  //this.carPositionOnSpline = 0;
  ////this.clock=new THREE.Clock()  ;
  ////this.travelTime=s/4;
  //this.travelTime=s;
  //
  //this.addCar(this.fromToLatLon[0].position);
}

vidteq._vidLayer.prototype.putCarPath = function (response) {
  console.log("putCarPath");
  this.carPathArray = new Array();
  this.syncMapPoints = new Array();
  var carPoints = [];
  if (vidteq.utils.getSafe('car', response) !== null) { carPoints = response.car; }
  else { carPoints = response.videos; }
  //syncMapPoint is same as caption points
  for (var i = 0; i < carPoints.length; i++) {
    var tempText = carPoints[i];
    if ('renderedInServer' in response) {
      if (typeof (tempText.car) != 'undefined' && tempText.car !== null) {
        this.carPathArray[i] = tempText.car.split(/[\(\)]/)[1].split(',');
        if (tempText.caption) {
          this.syncMapPoints.push(i);
        }
      }
    } else {
      this.carPathArray[i] = tempText.split('|');
      if (this.carPathArray[i][0].match(/I/)) {
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

vidteq._vidLayer.prototype.getOnePoint = function (parentIndex, childIndex) {
  if (typeof (this.carPathArray[parentIndex]) == 'undefined') {
    return;
  }
  if (this.carPathArray[parentIndex].length == 1) {
    return this.carPathArray[parentIndex][0];
  } else {
    return this.carPathArray[parentIndex][childIndex];
  }
}

vidteq._vidLayer.prototype.getNext2Point = function (parentIndex, childIndex) {
  if (typeof (this.carPathArray[parentIndex]) == 'undefined') {
    return;
  }
  if (this.carPathArray[parentIndex][childIndex + 2]) {
    return this.carPathArray[parentIndex][childIndex + 2];
  }
  if (this.carPathArray[parentIndex][childIndex + 1]) {
    if (this.carPathArray[parentIndex + 1]) {
      return this.carPathArray[parentIndex + 1][0];
    }
    return;
  }
  if (this.carPathArray[parentIndex + 1] &&
    this.carPathArray[parentIndex + 1].length > 1) {
    return this.carPathArray[parentIndex + 1][1];
  }
}

vidteq._vidLayer.prototype.findCarStop = function (index) {
  //console.log('findCarStop ',index);
  //console.log('this.carPathArray ',this.carPathArray);
  //console.log('this.syncMapPoints ',this.syncMapPoints);
  //console.log('findCarStop call_state ',index);
  var stringSplit = index.split(":");
  var parentIndex = stringSplit[0];
  var subIndex = stringSplit[1];

  var that = this;
  if (this.stopCarTimer) {
    clearInterval(this.stopCarTimer);
    if (this.carmesh) {
      this.renderCarFlag = true;
      that.clock.start();
    }
  }
  this.stopCarTimer = setInterval(function () {
    console.log('findCarStop ', index);
    if (that.stopCarTimer) clearInterval(that.stopCarTimer);
    if (that.carmesh) {
      that.renderCarFlag = false;
      that.clock.stop();
    }
  }, 2000);
  if (this.syncMapPoints[this.syncMapPoints.length - 1] == parentIndex
    && this.carPathArray[this.syncMapPoints[this.syncMapPoints.length - 1]].length - 1 == subIndex) {
    console.log('stop has ...');
    if (this.carmesh) {
      this.renderCarFlag = false;
      that.clock.stop();
    }
    if (this.stopCarTimer) clearInterval(this.stopCarTimer);
  }
}

vidteq._vidLayer.prototype.moveCarTo = function (index) {
  console.log("moveCarTo")
  var t = index.split(":");
  var parentIndex = parseInt(t[0]);
  var childIndex = parseInt(t[1]);
  if (vidteq.navigate) {
    vidteq.navigate.videoControl(index, "videoPoint");
  }
  this.store('moveCarToStore', [parentIndex, childIndex], 10);
  var onePoint = this.getOnePoint(parentIndex, childIndex);
  if (typeof (onePoint) == 'undefined') { return; }
  var nextPoint = this.getNext2Point(parentIndex, childIndex);
  var carPos = this.toLl(onePoint);
  this.renderTargets = {
    curPoint: this.toTu(carPos)
    , next2Point: this.toTu(this.toLl(nextPoint))
  };
  if (this.carDisable) {
    if (!this.carShadowPoint) { return; }
    var carLocPx = this.map.getLayerPxFromViewPortPx(this.map.getPixelFromLonLat(new OpenLayers.LonLat(carPos.lon, carPos.lat)));
    //this.carShadowPoint.moveTo(carLocPx);
    this.carShadowPoint.move(carLocPx);
    return;
  }
  //this.distanceToDestination(parentIndex);
  this.vidLon = onePoint.split(" ")[0];
  this.vidLat = onePoint.split(" ")[1];
  // used elsewhere
  //if(this.gui.wap) this.keepInView(this.vidLon,this.vidLat,"video");
  //this.removeAndAddCarPoint(onePoint);
  var that = this;
  // deletion of video required else for another route call car is created
  if (this.carmesh) { }
  else {
    var carCord = onePoint.split(" ");
    //var v = new OpenLayers.Geometry.fromWKT("POINT("+carCord[0]+" "+carCord[1]+")");
    this.lon1 = carCord[0];
    this.lat1 = carCord[1];
    var startPoint = {};
    startPoint.x = -this.tiler.tI.tu * (this.tiler.lastBbox.c.lon - this.lon1) / this.tiler.tI.resTile;
    startPoint.z = this.tiler.tI.tu * (this.tiler.lastBbox.c.lat - this.lat1) / this.tiler.tI.resTile;
    startPoint.y = this.tiler.tI.gY;
    var that = this;
    this.addCar(startPoint)
  }
  //TBD: currently its intrusive with user interaction with map
  //this.keepInView(carPos,'video');
}

vidteq._vidLayer.prototype.moveCarToTmp = function (index) {
  console.log("moveCarTo")
  if(!this.currentCarPosIndexInRoad)this.currentCarPosIndexInRoad=index;
if(this.roadGeometry.length===this.currentCarPosIndexInRoad+1)return;
  this.renderTargets = {
    next2Point: this.roadGeometry[this.currentCarPosIndexInRoad+=1]
  };
  console.log(this.roadGeometry[this.currentCarPosIndexInRoad])


 }

vidteq._vidLayer.prototype.toLl = function (point) {
  var t = point.split(" ");
  return {
    lon: parseFloat(t[0])
    , lat: parseFloat(t[1])
  };
}

vidteq._vidLayer.prototype.toTu = function (ll) {
  return {
    x: -this.tiler.tI.tu * (this.tiler.lastBbox.c.lon - ll.lon) / this.tiler.tI.resTile
    , y: this.tiler.tI.gY
    , z: this.tiler.tI.tu * (this.tiler.lastBbox.c.lat - ll.lat) / this.tiler.tI.resTile
  };
}

vidteq._vidLayer.prototype.removeAndAddCarPoint = function (onePoint) {
  //console.log("removeAndAddCarPoint",onePoint);
  var carCord = onePoint.split(" ");
  //this.nearestWkt(carCord[0],carCord[1]);
  if (this.carPoint) {
    //var l = new OpenLayers.LonLat(carCord[0],carCord[1]); //TBD need to change from openlayer to 3d
    //if (this.carPopup) {
    //  this.carPopup.lonlat = l;
    //  this.carPopup.updatePosition();
    //}
    //var m=this.getAngle(this.lon1,this.lat1,carCord[0],carCord[1]);
    var rx = -this.tiler.tI.tu * (this.tiler.lastBbox.c.lon - this.lon1) / this.tiler.tI.resTile;
    var rz = this.tiler.tI.tu * (this.tiler.lastBbox.c.lat - this.lat1) / this.tiler.tI.resTile;
    var rx1 = -this.tiler.tI.tu * (this.tiler.lastBbox.c.lon - carCord[0]) / this.tiler.tI.resTile;
    var rz1 = this.tiler.tI.tu * (this.tiler.lastBbox.c.lat - carCord[1]) / this.tiler.tI.resTile;
    if (rx == rx1 && rz == rz1) { return; }
    var m = Math.atan2(rx1 - rx, rz1 - rz);
    //if(!isNaN(m)) {
    //  //this.carPoint.layer.options.styleMap.styles.default.defaultStyle.rotation=m;
    //  this.carPoint.data.rotation=m;
    //}
    this.lon1 = carCord[0];
    this.lat1 = carCord[1];
    var x = -this.tiler.tI.tu * (this.tiler.lastBbox.c.lon - this.lon1) / this.tiler.tI.resTile;
    var z = this.tiler.tI.tu * (this.tiler.lastBbox.c.lat - this.lat1) / this.tiler.tI.resTile;
    var y = this.tiler.tI.gY;
    //this.carmesh.root.position.set(x,y,z);
    //this.carmesh.root.rotation.y=m;
    //console.log('lon lat ');
    //console.log(rx+"=="+rx1+"=="+rz+"=="+rz1);
    //console.log('rot',m);
    //this.carPoint.move(l);
    //this.carMarkLayer.redraw();
    //this.carMarkLayer.refresh();
    return;
  }
  var carCord = onePoint.split(" ");
  //var v = new OpenLayers.Geometry.fromWKT("POINT("+carCord[0]+" "+carCord[1]+")");
  this.lon1 = carCord[0];
  this.lat1 = carCord[1];
  var x = -this.tiler.tI.tu * (this.tiler.lastBbox.c.lon - this.lon1) / this.tiler.tI.resTile;
  var z = this.tiler.tI.tu * (this.tiler.lastBbox.c.lat - this.lat1) / this.tiler.tI.resTile;
  var y = this.tiler.tI.gY;
  var that = this;
  this.addCar({ x, y, z });


  this.carPoint = [];//new OpenLayers.Feature.Vector(v,{car:true});  

  //this.carmesh.root.rotation.y=3.14;
  // TBD atleast title is needed
  //this.carMarkLayer.addFeatures([this.carPoint]);
}

function call_state(res) {
  //console.log('call_state ',res);
  //this.mbox.moveCarTo(res);
  vtt.store('callStateStore', res, 10);
  vtt.moveCarTo(res);
  vtt.findCarStop(res);

  //vtt.estimElapsTime=time;//TBD will be use to calculate elspsed time from player rather that original clock()

  //if (this.gui.wap) {
  //  //this.gL.getVideoPoint(res);
  //} else{
  //  this.fvt.changeTextDirectionIfNeeded(res);
  //}
  ////vidteq.gui.check3dCarProximity(stringResponse);
}

vidteq._vidLayer.prototype.makeRouteLayer = async function (videoSum) {
  function randomRange(min, max) {
    return (Math.random() * (max - min)) + min;

  }

  console.log('makeRouteLayer ');
  if (this.makeRouteLayerCreated) { return; }
  this.delTheCar = true;
  //this.removeRoadElements();
  //console.log('videoSu ',videoSum);
  var totalDur = 10;  //videoSum.durationVideo[videoSum.durationVideo.length - 1];
  //console.log('totalDur ',totalDur);
  var that = this;
  var dt = this.videoResponse;
  //temp
  dt.edge = {};
  let lat = [], lon = [];
  lat.push(this.fromToLatLon[0].lat)
  lon.push(this.fromToLatLon[0].lon)

  let range = 9;
  for (let i = 0; i < range; i++) {
    lat.push(randomRange(this.fromToLatLon[0].lat, this.fromToLatLon[1].lat))
    lon.push(randomRange(this.fromToLatLon[0].lon, this.fromToLatLon[1].lon))
  }
  lat.push(this.fromToLatLon[1].lat)
  lon.push(this.fromToLatLon[1].lon)
  //console.log({ lat, lon });

  //lat.sort();lon.sort();
  let ll = [];
  for (let i = 0; i < lat.length; i++) {
    ll.push(lon[i] + " " + lat[i])
  }
  //console.log(ll.toString())
  dt.edge.wkt = ll.toString();
  //temp end

  var edge = dt.edge.wkt;
  //console.log("success",edge);
  var wkt = edge.replace(/MULTILINESTRING/g, "").replace(/[()]/g, "");
  //console.log("success",wkt);
  //var s=0;
  //for(var i in dt.video){
  //  s+=parseInt(dt.video[i].VvidSource.duration);
  //}
  //console.log(s);
  //s = totalDur;
  this.travelTime = totalDur;
  //console.log((dt.video));
  var w = wkt.split(",");
  var fv = [];
  for (var i in w) {
    var t = w[i].split(" ");
    fv.push({ lon: parseFloat(t[0]), lat: parseFloat(t[1]) });
  }
  //console.log("success",JSON.stringify(fv));alert()
  ////remove redundent values
  //fv.sort( function( a, b){ return a.lat - b.lat; } );
  //
  //// delete all duplicates from the array
  //for( var i=0; i<fv.length-1; i++ ) {
  //  if ( fv[i].lat == fv[i+1].lat && fv[i].lon == fv[i+1].lon ) {
  //    fv.splice(i,1);
  //  }
  //}
  that.latLonG = fv;
  //console.log("success",JSON.stringify(fv));alert()
  await this.getPathMesh();  
  await this.smoothCamMoveToCarAtStart();  
  this.makeRouteLayerCreated = true;
  //this.tiler.venue360.getPathMesh=this.getPathMesh;
  var x = -this.tiler.tI.tu * (this.tiler.lastBbox.c.lon - fv[0].lon) / this.tiler.tI.resTile;
  var z = this.tiler.tI.tu * (this.tiler.lastBbox.c.lat - fv[0].lat) / this.tiler.tI.resTile;
  var y = this.tiler.tI.gY;
  var that = this;
  this.addCar({ x, y, z });

}

vidteq._vidLayer.prototype.getPathMesh = async function () {
  console.log("getPathMesh");
  var fv = this.latLonG;
  var ver = []; var ver1 = [];
  //console.log("getPathMesh", this);
  for (var i in fv) {
    var x = -this.tiler.tI.tu * (this.tiler.lastBbox.c.lon - fv[i].lon) / this.tiler.tI.resTile;
    var z = this.tiler.tI.tu * (this.tiler.lastBbox.c.lat - fv[i].lat) / this.tiler.tI.resTile;
    ver1.push(new THREE.Vector3(x, this.tiler.tI.gY, z));
    //console.log({ x, y: this.tiler.tI.gY, z })
  }
  //console.log(this.tiler.tI.tu);
  //console.log(JSON.stringify(ver1));  
  this.roadGeometry = ver1;
  //this.tiler.venue360.roadGeometry=this.roadGeometry;
  this.store('roadGeometry1', $.extend(true, [], ver1), 10);
  //-----------------
  var g = new THREE.Geometry();
  var m = new THREE.LineBasicMaterial({ color: 0xff0000 });
  g.vertices = ver1;
  var sc = new THREE.SplineCurve3(ver1);
  var gg = sc.getPoints(3000);

  var ln = new THREE.Line(g, m);
  ln.position.y = 2;
  this.roadLinePath = ln;
  this.scene.add(ln);
  //------------------
  for (var j = 0; j < ver1.length; j++) {
    var dot = new THREE.Mesh(new THREE.SphereGeometry(1, 5, 5), new THREE.MeshBasicMaterial({ color: 0x000000 }));
    dot.position.copy(ver1[j]);
    this.scene.add(dot);
  }
  //------------------
  var curvedPathMesh = this.getCurvedPathMesh(ver1);
  curvedPathMesh.roadElementDel = true;
  //console.log(curvedPathMesh);
  //var tube = new THREE.TubeGeometry(curvedPath, 20, 2, 8, true);  
  this.scene.add(curvedPathMesh);
  var ConnectedPathMesh = this.getCurvedPathMesh(ver1);
  ConnectedPathMesh.roadElementDel = true;
  //console.log(curvedPathMesh);
  //var tube = new THREE.TubeGeometry(curvedPath, 20, 2, 8, true);  
  this.scene.add(curvedPathMesh);
  this.carPositionOnSpline = 0;

  var ConnectedPathMesh = this.getConnectedPathMesh(ver1[0], ver1[ver1.length - 1]);
  ConnectedPathMesh.roadElementDel = true;

  this.scene.add(ConnectedPathMesh);
  //that.clock=new THREE.Clock()  ;
  //that.travelTime=s/4;

  //This adds start stop sign
  //var pg=new THREE.PlaneGeometry(50,30);
  //var str=new THREE.ImageUtils.loadTexture("img/start1.png");
  //var stp=new THREE.ImageUtils.loadTexture("img/stop1.png");
  //var startMat=new THREE.MeshBasicMaterial({map:str});
  //var stopMat=new THREE.MeshBasicMaterial({map:stp});        
  //var startSign=this.startSign=new THREE.Mesh(pg,startMat);
  //this.startSign.roadElementDel=true;
  //startSign.position.set(ver1[0].x,0,ver1[0].z);
  ////this.scene.add(startSign);
  //var stopSign=this.stopSign=new THREE.Mesh(pg,stopMat);
  //this.stopSign.roadElementDel=true;
  //stopSign.position.set(ver1[ver1.length-1].x,-5,ver1[ver1.length-1].z);
  //this.scene.add(stopSign);
  if (!this.fromToLatLon || this.fromToLatLon.length < 2) {
    var t1 = new THREE.ImageUtils.loadTexture("img/text1.png");
    //var t1 = this.makeTextTexture(
    //  'START START START'
    //  ,50,50
    //  ,'12px Arial'
    //  ,'white'
    //  ,'center'
    //  ,'middle'
    //  ,'rgb(256,256,0)'
    //);
    var t2 = new THREE.ImageUtils.loadTexture("img/text2.png");
    var str = this.startSign = this.getBaloonMarker();
    //console.log(str);
    //t1.wrapS = t1.wrapT = THREE.RepeatWrapping;
    //t1.repeat.set( 3, 1 );
    str.material.map = t1;
    //str.scale.x=2;str.scale.y=2;str.scale.z=2;
    str.material.color = new THREE.Color(0, 1, 0);
    str.position.set(ver1[0].x, -5, ver1[0].z);
    this.scene.add(str);
    this.startSign = str;
    this.startSign.roadElementDel = true;

    var stp = this.stopSign = this.getBaloonMarker();
    //t2.wrapS = t2.wrapT = THREE.RepeatWrapping;
    t2.repeat.set(3, 1);
    stp.material.map = t2;
    stp.material.color = new THREE.Color(1, 0, 0);
    stp.position.set(ver1[ver1.length - 1].x, -5, ver1[ver1.length - 1].z);
    this.scene.add(stp);
    this.stopSign = stp;
    this.stopSign.roadElementDel = true;
  }
  //this.addCar();
}

vidteq._vidLayer.prototype.getConnectedPathMesh = function (p1, p2) {
  console.log("getConnectedPathMesh",{p1,p2})
  var hd = (p1.distanceTo(p2)) / 4;

  var mp = new THREE.Vector3((p1.x + p2.x) / 2, hd, (p1.z + p2.z) / 2);
  var sp1 = new THREE.SplineCurve3([p1, mp, p2]);
  var pts = sp1.getPoints(500);
  var geometry = new THREE.Geometry();
  geometry.vertices = pts;
  var material = new THREE.MeshBasicMaterial({ color: 0xFDD017 });
  var line = new THREE.Line(geometry, material);
  return line;

}

vidteq._vidLayer.prototype.getCurvedPathMesh = function (points) {
  //console.log(JSON.stringify(points));
  //var sp1= new THREE.SplineCurve3(points); 
  //var pts= sp1.getPoints(500); 
  //var sp= new THREE.SplineCurve3(pts); 
  var sp = new THREE.SplineCurve3(points);
  this.roadCurve = sp;
  var st = points.length * 10;

  var extrudeSettings = {
    steps: st,
    amount: 100,
    bevelEnabled: true,
    extrudePath: sp,
    curveSegments: 10,
    bevelThickness: 10,
    bevelSize: 10,
    bevelSegments: 10

  };

  var pts = [];
  var pts = [
    new THREE.Vector2(0, -5)
    , new THREE.Vector2(0, 0)
    , new THREE.Vector2(0, 5)
  ]
  var shape = new THREE.Shape(pts);
  //console.log(shape);
  var geometry = this.extrudegeometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

  //var tG = new THREE.TubeGeometry(
  //  sp,  //path
  //  500,    //segments
  //  3,     //radius
  //  200,     //radiusSegments
  //  false  //closed
  //);  

  var material = new THREE.MeshBasicMaterial({ color: 0xCC6699 });
  var mesh = new THREE.Mesh(geometry, material);
  this.roadThickPath = mesh;
  //mesh.rotation.z=-Math.PI/2;
  mesh.position.y = 1;
  //mesh.scale.x/=2;//multiplyScalar(2);
  //mesh.scale.z/=2;//multiplyScalar(2);
  //this.roadLinePath.scale.multiplyScalar(2);
  return mesh;
}

vidteq._vidLayer.prototype.getBaloonMarker = function () {
  console.log("getBaloonMarker");
  var sg = new THREE.SphereGeometry(5, 10, 10, Math.PI / 2, Math.PI * 2, 0, Math.PI);
  for (var i = 88; i <= 98; i++) {
    sg.vertices[i].y = -6;
  }
  for (var i = 99; i <= 109; i++) {
    sg.vertices[i].y = -10;
  }
  for (var i = 110; i <= 120; i++) {
    sg.vertices[i].y = -15;
  }

  //sg.vertices[88].y=-6;
  //sg.vertices[89].y=-6;
  //sg.vertices[90].y=-6;
  //sg.vertices[91].y=-6;
  //sg.vertices[92].y=-6;
  //sg.vertices[93].y=-6;
  //sg.vertices[94].y=-6;
  //sg.vertices[95].y=-6;
  //sg.vertices[96].y=-6;
  //sg.vertices[97].y=-6;
  //sg.vertices[98].y=-6;
  //
  //sg.vertices[99].y=-10;
  //sg.vertices[100].y=-10;
  //sg.vertices[101].y=-10;
  //sg.vertices[102].y=-10;
  //sg.vertices[103].y=-10;
  //sg.vertices[104].y=-10;
  //sg.vertices[105].y=-10;
  //sg.vertices[106].y=-10;
  //sg.vertices[107].y=-10;
  //sg.vertices[108].y=-10;
  //sg.vertices[109].y=-10;
  //
  //sg.vertices[110].y=-15;
  //sg.vertices[111].y=-15;
  //sg.vertices[112].y=-15;
  //sg.vertices[113].y=-15;
  //sg.vertices[114].y=-15;
  //sg.vertices[115].y=-15;
  //sg.vertices[116].y=-15;
  //sg.vertices[117].y=-15;
  //sg.vertices[118].y=-15;
  //sg.vertices[119].y=-15;
  //sg.vertices[120].y=-15;
  //console.log(sg);
  var idx = null;
  var mn = sg.vertices[0];
  //for(var i=0 ;i<sg.vertices.length;i++){
  ////console.log(sg.vertices[i+1]);
  //if(!sg.vertices[i+1]){break;}
  //console.log(sg.vertices[i+1].y+"&&"+(mn.y>sg.vertices[i+1].y)+"&&"+ (sg.vertices[i+1].x==0) +"&&"+(sg.vertices[i+1].z==0));
  //if(mn.y>sg.vertices[i+1].y && sg.vertices[i+1].x==0 && sg.vertices[i+1].z==0){
  //mn=sg.vertices[i+1].y;
  //console.log(mn);
  //idx=i+1;
  //}else{}
  //}
  //console.log(mn);
  //console.log(idx);
  var smat = new THREE.MeshPhongMaterial();
  var mesh = new THREE.Mesh(sg, smat);
  return mesh;
  //this.scene.add(ms);  
}

vidteq._vidLayer.prototype.removeRoadElements = function () {
  console.log("removeRoadElements");
  var x = 0, y = 0;
  for (var i = 0; i < this.scene.children.length; i++) {
    if (this.scene.children[i] && this.scene.children[i].roadElementDel) {
      this.scene.remove(this.scene.children[i]);
      x = 1;
      console.log("deleted");
    } else { x = 0; }
    if (this.scene.children[i] && this.scene.children[i].isCarMesh && this.delTheCar) {
      this.scene.remove(this.scene.children[i]);
      delete this.carmesh;
      delete this.carMarkers;
      delete this.renderTargets;
      y = 1;
      console.log("car deleted", this);

    } else { y = 0; }
    if (x == 1 || y == 1) { i = 0; }
    //console.log(i);
  }
}
vidteq._vidLayer.prototype.addRoad = function (cordPoints) {
  return;
  var road = new THREE.Object3D();
  for (var i = 0; i < cordPoints.length - 1; i++) {
    //if(i==cordPoints-1){alert(4);break;}alert(i);
    var p1 = cordPoints[i]; var p2 = cordPoints[i + 1];
    var p0p1 = Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.z - p2.z, 2));
    var mesh = new THREE.Mesh(new THREE.PlaneGeometry(20, parseInt(p0p1)), new THREE.MeshBasicMaterial({ color: 0x000000 }));
    mesh.rotation.x = -90 * Math.PI / 180;
    //mesh.rotation.z=-this.rot[i];
    mesh.position.set(cordPoints[i].x, cordPoints[i].y, cordPoints[i].z);
    road.add(mesh);
    //console.log(p0p1);
  }
  road.rotation.y = -this.rot[0];
  //console.log(road);alert()
  this.scene.add(road);
}
vidteq._vidLayer.prototype.addPath = function () {
  var linePoints = this.linePoints = [
    //{ x:-300, y: 0, z: 300}, { x:300, y: 0, z: 300},{ x:300,    y: 0, z:-300}
    //,{ x:500, y: 0, z:-300},{ x:500, y: 0, z: 400},{ x:-300, y: 0, z: 400}

    { x: -100, y: 0, z: 200 }, { x: -10, y: 0, z: -30 },
    { x: 0, y: 0, z: -200 }, { x: 150, y: 0, z: -150 },
    { x: 170, y: 0, z: -170 }, { x: 250, y: 0, z: -100 },
    { x: 350, y: 0, z: 300 }, { x: 550, y: 0, z: -350 },
    { x: 700, y: 0, z: -200 }
  ];

  var material = new THREE.LineBasicMaterial({
    color: 0xff00f0,
    linewidth: 3
  });
  var cordPoints = [];
  cordPoints = $.extend(true, [], linePoints);
  var geometry = this.geometry = new THREE.Geometry();

  var rot = this.rot = [];
  this.rota = [];
  var tDist = { d: 0 };
  this.addDotPoints(linePoints, rot, tDist);

  this.geoWithmultiVertices(geometry, cordPoints, tDist, 1000);
  this.addRoad(linePoints);
  //console.log(geometry);alert()
  $("#add").attr("geometry", geometry.vertices);
  //console.log($("#add").attr("geometry"));alert();
  this.line = line = new THREE.Line(geometry, material);
  //line.rotation.x={x:-90*Math.PI/180};
  this.scene.add(line);
}
//spline = new THREE.SplineCurve3([ new THREE.Vector3(-100, 0, 100), new THREE.Vector3(-10, 0, 100), new THREE.Vector3(0, 0,-200), new THREE.Vector3(150, 0,-150), new THREE.Vector3(170, 0,-170), new THREE.Vector3(250, 0,-100), new THREE.Vector3(350, 0,-300), new THREE.Vector3(550, 0,-350), new THREE.Vector3(700, 0,-200)]);

vidteq._vidLayer.prototype.addDotPoints = function (linePoints, rot, tDist) {
  for (var j = 0; j < linePoints.length; j++) {
    var dot = new THREE.Mesh(new THREE.SphereGeometry(5, 50, 50), new THREE.MeshBasicMaterial({ color: 0xff0000 }));
    //mes.position.copy(new THREE.Vector3(0,0,0));
    dot.position.copy(linePoints[j]);
    this.scene.add(dot);
    if (j == 1) {
      this.findInitialAngle(linePoints[0], linePoints[1], rot);
    }
    if (j > 0 && j < linePoints.length - 1) {
      //console.log(linePoints[j-1]);
      this.findAngle(linePoints[j - 1], linePoints[j], linePoints[j + 1], rot, tDist);
    }
    //console.log( dot.position);alert();
  }
  //console.log(rot);alert()
}

vidteq._vidLayer.prototype.findInitialAngle = function (p0, p1, rot, dist) {
  var slope = (p1.z - p0.z) / (p1.x - p0.x);
  var delZ = (p1.z - p0.z);
  var delX = (p1.x - p0.x);
  //console.log(p0);console.log(p1);
  //console.log(slope);
  //console.log(Math.atan2(delZ,delX));alert()
  var ang = Math.atan2(delZ, delX);
  rot.push(ang);
  this.rota.push(ang * 180 / Math.PI);
}

vidteq._vidLayer.prototype.findAngle = function (p0, p1, p2, rot, dist) {
  //console.log(p0);console.log(p1);console.log(p2);
  var p0p1 = Math.sqrt(Math.pow(p0.x - p1.x, 2) + Math.pow(p0.z - p1.z, 2)); // p0->p1 (b)   
  var p2p1 = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.z - p1.z, 2)); // p2->p1 (a)
  var p0p2 = Math.sqrt(Math.pow(p2.x - p0.x, 2) + Math.pow(p2.z - p0.z, 2)); // p0->p2 (c)
  //an=Math.acos((p0p1*p0p1+p2p1*p2p1-p0p2*p0p2)/(2*p0p1*p2p1));
  var x = Math.atan2(p0.z - p1.z, p0.x - p1.x) - Math.atan2(p2.z - p1.z, p2.x - p1.x);
  x = x > Math.PI ? x - 2 * Math.PI : x;
  //console.log(an*180/Math.PI);
  //console.log(x*180/Math.PI);
  //var ang=an;
  rot.push(x);
  dist.d += p0p1;
  this.rota.push(x * 180 / Math.PI);
}

vidteq._vidLayer.prototype.geoWithmultiVertices = function (geometry, cordPoints, dist, noPoints) {
  //console.log(cordPoints);alert();
  var eachLine = noPoints / (cordPoints.length - 1);
  eachPoint = dist.d / noPoints;
  console.log(eachPoint);
  for (var i = 0; i < cordPoints.length - 1; i++) {
    //if(i==cordPoints-1){alert(4);break;}alert(i);
    var p1 = cordPoints[i]; var p2 = cordPoints[i + 1];
    var p0p1 = Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.z - p2.z, 2));
    eachLine = p0p1 / eachPoint;
    console.log(eachLine);
    var fraction = { X: (p2.x - p1.x) / eachLine, Y: (p2.y - p1.y) / eachLine, Z: (p2.z - p1.z) / eachLine };
    //console.log(fraction);
    geometry.vertices.push(new THREE.Vector3(cordPoints[i].x, cordPoints[i].y, cordPoints[i].z));
    for (var j = 0; j < eachLine - 1; j++) {
      p1.x += fraction.X; p1.y += fraction.Y; p1.z += fraction.Z;
      //console.log(p1);
      geometry.vertices.push(new THREE.Vector3(p1.x, p1.y, p1.z));
    }
    //console.log(geometry.vertices);
  }
}
vidteq._vidLayer.prototype.tilesRotUp = function () {
  var ttiles = this.tiles.slice();
  //console.log(ttiles);
  for (var i in ttiles) {
    if (ttiles[i].rotation.x > 0 * Math.PI / 180) { continue; }
    var rr = { x: (ttiles[i].rotation.x) + 10 * Math.PI / 180 };

    for (var j in rr) {
      ttiles[i].rotation[j] = rr[j];
    }
    if (i % w > 0) {
      var P = Math.sin(THREE.Math.degToRad(90 + rr.x * 180 / Math.PI)) * tu * ((i % w));
      var B = Math.cos(THREE.Math.degToRad(90 + rr.x * 180 / Math.PI)) * tu * ((i % w));
      var dev = tu * ((i % w)) - B;
      if (ttiles[i].P && ttiles[i].dev) {
        ttiles[i].position.y = tiles[i].position.y + (P - ttiles[i].P);
        ttiles[i].position.z = tiles[i].position.z + (dev - ttiles[i].dev);
      }
      else {
        ttiles[i].position.y = tiles[i].position.y + P;
        ttiles[i].position.z = tiles[i].position.z + dev;
      }

      ttiles[i].P = P;
      ttiles[i].dev = dev;
    }//if(i==8)break;
  }
  console.log(scene);
}

vidteq._vidLayer.prototype.tilesRotDown = function () {
  var ttiles = this.tiles.slice();
  //console.log(ttiles);
  for (var i in ttiles) {
    if (ttiles[i].rotation.x <= -90 * Math.PI / 180) { continue; }
    var rr = { x: (ttiles[i].rotation.x) - 10 * Math.PI / 180 };

    for (var j in rr) {
      ttiles[i].rotation[j] = rr[j];
    }
    if (i % w > 0) {
      var P = Math.sin(THREE.Math.degToRad(90 + rr.x * 180 / Math.PI)) * tu * ((i % w));
      var B = Math.cos(THREE.Math.degToRad(90 + rr.x * 180 / Math.PI)) * tu * ((i % w));
      var dev = tu * ((i % w)) - B;
      if (ttiles[i].P && ttiles[i].dev) {
        ttiles[i].position.y = tiles[i].position.y - (ttiles[i].P - P);
        ttiles[i].position.z = tiles[i].position.z - (ttiles[i].dev - dev);
      }
      else {
        ttiles[i].position.y = tiles[i].position.y - P;
        ttiles[i].position.z = tiles[i].position.z - dev;
      }

      ttiles[i].P = P;
      ttiles[i].dev = dev;
    }//if(i==8)break;
  }
  console.log(this.scene);

}



vidteq._vidLayer.prototype.cameraMove = function () {
  //console.log(camera);console.log(oldCamPos);
  this.tbc = false;
  //me.position={x: -256, y: -10, z: 1280};
  //this.scene.add(me);
  //camera.position.set( 0, 2000, 1200 );
  this.camera.rotation.x = -45 * Math.PI / 180;  // -0.7853981633974483;
  this.camera.rotation.y = 0 * Math.PI / 180;   //-0.8148269418475194;
  this.camera.rotation.z = 0 * Math.PI / 180;    // -0.6290147987733341;
}

vidteq._vidLayer.prototype.cameraReset = function () {
  //console.log(camera);console.log(oldCamPos);
  this.tbc = true;
  this.camera.position.copy(this.oldCamPos);
  //this.scene.remove(me);
  //camera.position.set( 0, 2000, 1200 );
  //camera.rotation.x=-80*Math.PI/180  ;  // -0.7853981633974483;
  //camera.rotation.y= 0*Math.PI/180;   //-0.8148269418475194;
  //camera.rotation.z=0*Math.PI/180;    // -0.6290147987733341;
}

vidteq._vidLayer.prototype.addCar = function (startPoint) {
  console.log("addCar");
  //console.log(this);alert()
  //console.log(vertices);alert()
  var that = this;
  //if(this.mesh!=null){ this.scene.remove(this.mesh);}
  if (this.carmesh && this.carmesh.root != null) {
    this.renderCarFlag = false;
    this.scene.remove(this.carmesh.root);
    console.log("car removed");
    delete this.carmesh;

  }
  //this.mesh=new THREE.Mesh(new THREE.CubeGeometry(50,20,20),new THREE.MeshBasicMaterial({map:THREE.ImageUtils.loadTexture('js/myjs/tiger.jpg')}));
  ////mes.position.copy(new THREE.Vector3(0,0,0));
  //this.mesh.position.copy(this.geometry.vertices[0]);
  //this.mesh.rotation.y=-this.rot[0];
  //console.log(this.mesh);alert()
  //this.scene.add(this.mesh);

  //console.log(this);alert()
  //var ob={scene:this.scene};
  //temp
  this.latLonG = this.fromToLatLon;
  var agl = Math.atan2(
    this.latLonG[0].lat - this.tiler.lastBbox.c.lat//this.latLonG[0].lat 
    , this.latLonG[0].lon - this.tiler.lastBbox.c.lon//this.latLonG[0].lon
  );
  var orientation = Math.PI + agl;
  console.log("agl" + agl + "==orientation" + orientation);
  var cm = new vidteq._carModel();
  console.log(cm);
  cm.createCar(0.1, orientation, function () {
    console.log(cm);
    //that.carmesh=cm.car;    
    cm.car.BACK_ACCELERATION = 150;
    cm.car.FRONT_ACCELERATION = 125;
    cm.car.FRONT_DECCELERATION = 750;
    cm.car.MAX_REVERSE_SPEED = -1500;
    cm.car.MAX_SPEED = 128;
    cm.car.MAX_TILT_FRONTBACK = 0.015;
    cm.car.MAX_TILT_SIDES = 0.05;
    cm.car.MAX_WHEEL_ROTATION = 0.6;
    //that.carmesh.wheelOrientation = Math.PI;
    //that.carmesh.carOrientation = Math.PI;
    //that.carmesh.root.position.set(that.roadGeometry[0].x,that.tiler.tI.gY,that.roadGeometry[0].z);
    console.log((that.carPositionOnSpline));
    console.log(that.roadCurve);
    //that.carmesh.root.position.copy(that.roadCurve.getPointAt(that.carPositionOnSpline));
    cm.car.root.position.set(startPoint.x, startPoint.y, startPoint.z);
    console.log(cm.car.root.position);
    //var target = that.roadCurve.getPoint( that.carPositionOnSpline );
    //that.carmesh.root.lookAt( target );
    //that.carmesh.root.rotation.y=that.carmesh.carOrientation;
    //that.carEvent.moveForward=true;
    //that.carEvent.moveBackward   =true;
    cm.car.root.isCarMesh = true;
    that.scene.add(cm.car.root);
    //console.log(that.carmesh);
    //if(!('renderCarFlag' in that)){that.renderCarFlag=true;}
    console.log(that.renderCarFlag);
    //that.moveCarTo(`${startPoint.x+":"+startPoint.y}`);

    if (that.renderCarFlag) {
      //console.log(that.loaded);
      console.log(that.renderCarFlag);
      that.renderCarFlag = false;
      that.loaded = false;

    } else if (that.renderCarFlag == undefined || !that.renderCarFlag) {
      console.log(that.renderCarFlag);
      that.renderCarFlag = true;
      that.loaded = true;
      that.ii = 0;
    }
    console.log(that.renderCarFlag);
    that.clock = new THREE.Clock();//for temporary only to show the car multiple times
    that.travelTime = that.travelTime || 20;             //for temporary only to show the car multiple times
    that.camPosBeforeCar = that.camera.position.clone();
    that.camTargetBeforeCar = that.controls.target.clone();
    //that.controls.enable=true; 
    //that.initEventsWhenCarMove();
    that.carmesh = cm.car;
    //if(callback){ callback; }
  });

}

vidteq._vidLayer.prototype.decideWhenToZoom = function () {
  if (this.tiler.tI.zooming) { return; }
  var distY = this.camera.position.y;
  //console.log("decideWhenToZoom",distY);
  if (!('defaultZoomLevel' in this)) { this.defaultZoomLevel = this.tI.z; }
  if (!('defaultDistanceY' in this)) { this.defaultDistanceY = this.camera.position.y; }

  //console.log(distY+"<="+(this.defaultDistanceY+75) +"&&"+ distY+">="+(this.defaultDistanceY-75));
  if (this.defaultDistanceY == distY || (this.defaultDistanceY - distY >= 75 && this.defaultDistanceY - distY <= -75)) {
    //console.log("if decideWhenToZoom",distY); 
    return;
  }
  else {
    //console.log("else decideWhenToZoom",distY); 

    if (this.defaultDistanceY - distY >= 76) {
      console.log("goto finer");
      this.defaultDistanceY = distY;
      this.tiler.tI.zooming = 'fine';
      var that = this;
      var newTiles = this.tiler.checkAddFineTiles({}, function () {
        that.tiler.clearZoomInfo();
        console.log(that.tiler.tI);
        that.tiler.tiles[that.tiler.tI.z] = newTiles;
        that.defaultDistanceY = distY;
      });
      return;
    }
    if (this.defaultDistanceY - distY <= -76) {
      console.log("goto coarser");
      this.tiler.tI.zooming = 'coarse';
      //this.tI.zoomingInfo = {};
      var that = this;
      var newTiles = this.tiler.checkAddCoarseTiles({}, function () {
        that.tiler.clearZoomInfo();
        console.log(that.tiler.tI);
        that.tiler.tiles[that.tiler.tI.z] = newTiles;
        //console.log(that.tiler.tI);
        //if(that.venue360.vidLayer.roadGeometry){
        //  that.venue360.vidLayer.getPathMesh();
        //}
        that.defaultDistanceY = distY;
      });

      return;


    }
    else { }
  }
  ////TBD coarse zoom level
  //if(this.defaultZoomLevel<this.tI.z){}
  ////TBD fine zoom level
  //else if(this.defaultZoomLevel>this.tI.z){}
  ////TBD same zoom level
  //else{return;}      
}

vidteq._vidLayer.prototype.buildAxes = function (length, cb) {
  var axes = new THREE.Object3D();
  axes.add(this.buildAxis(new THREE.Vector3(0, 0, 0), new THREE.Vector3(length, 0, 0), 0xFF0000, false)); // +X
  axes.add(this.buildAxis(new THREE.Vector3(0, 0, 0), new THREE.Vector3(-length, 0, 0), 0xFF0000, true)); // -X
  axes.add(this.buildAxis(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, length, 0), 0x00FF00, false)); // +Y
  axes.add(this.buildAxis(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, -length, 0), 0x00FF00, true)); // -Y
  axes.add(this.buildAxis(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, length), 0x0000FF, false)); // +Z
  axes.add(this.buildAxis(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, -length), 0x0000FF, true)); // -Z
  this.scene.add(axes);
  cb();
}

vidteq._vidLayer.prototype.buildAxis = function (src, dst, colorHex, dashed) {
  var geom = new THREE.Geometry(),
    mat;

  if (dashed) {
    mat = new THREE.LineDashedMaterial({ linewidth: 3, color: colorHex, dashSize: 3, gapSize: 3 });
  } else {
    mat = new THREE.LineBasicMaterial({ linewidth: 3, color: colorHex });
  }

  geom.vertices.push(src.clone());
  geom.vertices.push(dst.clone());
  geom.computeLineDistances(); // This one is SUPER important, otherwise dashed lines will appear as simple plain lines

  var axis = new THREE.Line(geom, mat, THREE.LinePieces);

  return axis;

}

vidteq._vidLayer.prototype.store = function (key, val, max) {
  //var max = max || 10;
  //if (!(key in this)) { this[key] = []; }
  //this[key].push(val);
  //while (this[key].length > max) {
  //  this[key].shift();
  //};
  var max = max || 10;
  var setMax = 10;
  if (!(key in this)) {
    this[key] = { from: 0, to: 0, 1: [] };
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

vidteq._vidLayer.prototype.blackOutKIV = function () {
  if (this.blackOutTimer) {
    clearTimeout(this.blackOutTimer);
  }
  this.kIVBlackOut = true;
  var that = this;
  this.blackOutTimer = setTimeout(function () {
    that.kIVBlackOut = false;
  }, 10000);
  return; // following code comes from mbox legacy TBD
  if (typeof (vidteq.navigate) != 'undefined' && vidteq.navigate.routeActive) { }
  else {
    this.gpsCenterDisable = true;
    if (this.gpsCenterTimer) clearTimeout(this.gpsCenterTimer);
    var that = this;
    this.gpsCenterTimer = setTimeout(function () {
      that.gpsCenterDisable = false;
    }, 1 * 60 * 1000);
  }
}

vidteq._vidLayer.prototype.makeTextTexture = function (
  text, width, height, font, fillStyle, textAlign, textBaseline, bgColor) {
  var bitMap = document.createElement('canvas');
  var g = bitMap.getContext('2d');
  bitMap.width = width;
  bitMap.height = height;
  g.font = font;
  g.fillStyle = bgColor;
  //g.fillStyle = 'green';
  g.fillRect(0, 0, width, height);
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillStyle = fillStyle;
  g.fillText(text, width / 2, height / 2);
  var texture = new THREE.Texture(bitMap);
  texture.needsUpdate = true;
  return texture;
}

vtt.init();
//http://10.4.71.200/local/rsharma/contour/2/cont4.php
