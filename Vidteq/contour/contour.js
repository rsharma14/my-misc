
if(typeof vidteq=='undefined'){vidteq={};}

console.log(typeof vidteq);

vidteq._contour=function(){
  //var container, stats;    
  //var camera, this.scene, renderer,controls,light,mesh;
  //var group;    
  this.targetRotation = 0;
  this.targetRotationOnMouseDown = 0;    
  this.mouseX = 0;
  this.mouseXOnMouseDown = 0;    
  
  this.planeX=5;
  this.planeY=5;
  this.w=1;
  this.h=1;  
  this.scalex=1,this.scaley=1,this.scalez=1; 
  this.storeData=null,this.dataInfo={},this.storeTxImg="g.png";
  this.rotAgl=0;
  this.rotAgl2=0;    
  this.agl=10;   
  this.agl2=10;   
}
   
vidteq._contour.prototype.init=function() {    
  var windowHalfX = window.innerWidth / 2;
  var windowHalfY = window.innerHeight / 2;
  this.scene = new THREE.Scene();
  
  this.camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1, 200000 );
  this.camera.position.set( 0, 150, 150 );            
  
  //this.scene.add( new THREE.AmbientLight( 0x808080 ) );
  this.renderer = new THREE.WebGLRenderer( { antialias: true } );
  this.renderer.setClearColor( 0x99CCFF );      
  this.renderer.setSize( window.innerWidth, window.innerHeight );
  $("#cancon").append( this.renderer.domElement );
  
  this.controls = new THREE.OrbitControls( this.camera,this.renderer.domElement ); 
  console.log(this.controls);
  
  alight = new THREE.AmbientLight( 0xffffff, 2 );
  this.scene.add(alight);
  light = new THREE.DirectionalLight( 0xffffff, 3);
  lh = new THREE.DirectionalLightHelper( light, 3);
  //this.scene.add(lh);
  this.slight = new THREE.SpotLight( 0xffffff, 10 ,1000);
  this.slight.castShadow=true;
  this.lIntensity=this.slight.intensity;
  //slight.shadowCameraVisible = true;
  //this.slight.angle=Math.PI/180*30;
  //slight.rotation.x=Math.PI/180*45;
  //slight.target.position.set(100,200,100)
  this.slight.position.set(0,0,300)
  this.scene.add(this.slight)
  slh = new THREE.SpotLightHelper( this.slight);
  this.scene.add(slh);
  console.log(this.slight);
  this.rad=this.slight.position.z;
  this.yfix=this.slight.position.y;    
  this.xfix=this.slight.position.x;  
  //light.onlyShadow=true;
  light.position.set( 200, 10,-200 );
  //light.shadowCameraBottom=-100;
  //light.shadowCameraTop=100;
  //light.shadowCameraFar=100;
  //light.shadowCameraNear=50;
  //light.shadowCameraLeft=-100;
  //light.shadowCameraRight=-100;   
  
  this.renderer.shadowMapEnabled=true;
  this.renderer.shadowMapSoft=true;
  //renderer.shadowCameraNear=2;
  //renderer.shadowCameraFar=5;
  //renderer.shadowCameraFov=5;
  //renderer.shadowMapBias=0.0039;
  //renderer.shadowMapDarkness=0.5;
  //renderer.shadowMapWidth=10;
  //renderer.shadowMapHeight=10;
        
  //light.position.copy(controls.object.position);
  //this.scene.add( light );
  console.log(light);
  
  //var dh=new THREE.DirectionalLightHelper(light, 100);
  //console.log(dh);
  //this.scene.add(dh.children[0]);
  //this.scene.add(dh.children[1]);
  //=============
  mesh=new THREE.Mesh(new THREE.BoxGeometry(30,30,30),new THREE.MeshBasicMaterial({color:0xff0000}));
  mesh.position.copy(light.position);
  mesh.rotation.copy(light.rotation);
  //this.scene.add(mesh);
  p=new THREE.Mesh(new THREE.PlaneGeometry(50000,50000),new THREE.MeshPhongMaterial({color:0x000000}));      
  p.rotation.x=-Math.PI/2;
  p.position.y=-50;
  //this.scene.add(p);
  this.animate();
  this.initEvent();
}           
         
vidteq._contour.prototype.loadTerrain=function (data,dInfo) {
  console.log("loadTerrain");
  for(var i in this.scene.children){
    console.log(this.scene.children[i]);
    if(this.scene.children[i].yesDelete){              
      console.log(this.scene.children[i]);
      this.scene.remove(this.scene.children[i]);
    }
  }
  var g=new THREE.Geometry();
  //var bdry=parseInt(Math.sqrt(data.length));
  //var lon= $.extend(true,[],data.sort(function(a,b){return a.x - b.x}));      
  //var lat= $.extend(true,[],data.sort(function(a,b){return a.y - b.y}));
  //var altd= $.extend(true,[],data.sort(function(a,b){return a.z - b.z}));
  console.log(this.dataInfo);
  console.log(dInfo);
  //w=dInfo!=undefined?(dInfo.imgW<=dataInfo.bdry?dInfo.imgW:dataInfo.bdry):dataInfo.bdry;
  this.w = (dInfo!=undefined) ? (
    dInfo.imgW<=this.dataInfo.bdry?dInfo.imgW:dInfo.imgW
  ):this.dataInfo.bdry;
  
  //h=dInfo!=undefined?(dInfo.imgH<=dataInfo.bdry?dInfo.imgH:dataInfo.bdry):dataInfo.bdry;
  this.h = (dInfo!=undefined) ? (
    dInfo.imgH<=this.dataInfo.bdry?dInfo.imgH:dInfo.imgH
  ):this.dataInfo.bdry;
  
  this.planeX = (dInfo!=undefined) ? dInfo.planeX:this.dataInfo.bdry;
  
  //h=dInfo!=undefined?(dInfo.imgH<=dataInfo.bdry?dInfo.imgH:dataInfo.bdry):dataInfo.bdry;
  this.planeY = (dInfo!=undefined) ?  dInfo.planeY:this.dataInfo.bdry;
  
  $("#imgx").val(this.w);
  $("#imgy").val(this.h);
  var ltmin=this.dataInfo.lat[0].y,
  ltmax=this.dataInfo.lat[this.dataInfo.lat.length-1].y,
  lnmin=this.dataInfo.lon[0].x, 
  lnmax=this.dataInfo.lon[this.dataInfo.lon.length-1].x,
  zmax=this.dataInfo.altd[this.dataInfo.altd.length-1].z,
  zmin=this.dataInfo.altd[0].z,al=20,al1=0.013229167;
  //12.28815  76.70049  1020.3
  //12.26022  76.65972  733.8
  var ver1=[];
  var vv = {}; 
  for(var i in data){
      var x = parseInt(this.w * ((data[i].x-lnmin)/(lnmax-lnmin)));
      //var x = parseInt(this.w * ((lnmax-data[i].x)/(lnmax-lnmin)));
      //var x = parseInt(w * ((t[i].x)/(lnmax)));
      var y = parseInt((this.h * ((data[i].y-ltmin)/(ltmax-ltmin))));
      //var y = parseInt((this.h * ((ltmax-data[i].y)/(ltmax-ltmin))));
      //var y = parseInt((h * ((t[i].y)/(ltmax))));
      //var z = parseInt((al1 * ((zmax-t[i].z)/(zmax-zmin))));
      //var z = parseInt((al * ((data[i].z)/(zmax))));
      z=data[i].z;
      ver1.push({x:x,y:y,z:z});
      if (!(x in vv)) { vv[x] = {}; }
      if (vv[x][y]) {
        vv[x][y].zA.push(z);
      } else {
        vv[x][y] = {zA:[z]};
      }
    }
    console.log(lnmax+"==="+"==="+lnmin+"===");
    console.log(ltmax+"==="+"==="+ltmin+"===");
    console.log(zmax+"==="+"==="+zmin+"===");
    var c=0;
    for(var i in ver1){
      if(ver1[i].z==0) {  
        console.log("ppp="+i);
        c++;
      }
    }
    //console.log("c="+c);
    console.log("ver 1 is ");
    console.log(ver1);
    console.log("vv is ");
    console.log(vv);
    for(var i=0;i<this.w;i++){
      for(var j=0;j<this.h;j++){  
        if (vv[i] && vv[i][j]) { 
          vv[i][j].z = this.avg(vv[i][j].zA);
          continue; 
        }
      }
    }
    for(var i=0;i<this.w;i++){
      for(var j=0;j<this.h;j++){  
        if (vv[i] && vv[i][j]) { continue; } 
        var lowI = -1;
        var highI = -1;
        for(var ii=0;ii<this.w;ii++){
          if (vv[ii] && vv[ii][j]) { } else { continue; }
          if (ii < i) { lowI = ii; }
          if (ii > i) { highI = ii; break; }
        }
        var lowJ = -1;
        var highJ = -1;
        for(var jj=0;jj<this.h;jj++){  
          if (vv[i] && vv[i][jj]) { } else { continue; }
          if (jj < j) { lowJ = jj; }
          if (jj > j) { highJ = jj; break; }
        }
        // For now we can take simple average TBD
        // but actually we are supposed take distance avg
        var sum = 0;
        var count = 0;
        if (lowI > -1) { sum += vv[lowI][j].z; count++; }
        if (highI > -1) { sum += vv[highI][j].z; count++; }
        if (lowJ > -1) { sum += vv[i][lowJ].z; count++; }
        if (highJ > -1) { sum += vv[i][highJ].z; count++; }
        if (!(i in vv)) { vv[i] = {}; }
        if (!(j in vv[i])) { vv[i][j] = {}; }
        vv[i][j].lowI = lowI;
        vv[i][j].highI = highI;
        vv[i][j].lowJ = lowJ;
        vv[i][j].highJ = highJ;
        if (count) {
          vv[i][j].sum = sum;
          vv[i][j].count = count;
          vv[i][j].z = sum/count;
        } else {
          vv[i][j].z = 0; // TBD this is catastrophy should never happen
          alert("catastrophy in z");
        }
      }
    } 
    console.log("vv is ");
    console.log(vv);
    //console.log(ver1.length);
    //var vv=[];
    ////var w=5,h=5;ver2=[{x:1,y:2,z:3},{x:4,y:2,z:3},{x:1,y:4,z:3}]
    //var ver2=ver1;
    ////console.log(ver2);
    //var c=0;
    //
    //for(var i=0;i<this.w;i++){
    //  for(var j=0;j<this.h;j++){  
    //    var fl=0;
    //    for(var k=0;k<ver2.length;k++){//  console.log(k);
    //      if(ver2[k].x==i  && ver2[k].y==j){
    //        vv.push({x:ver2[k].x ,y:ver2[k].y ,z:ver2[k].z});
    //        fl=1;
    //        //alert(i+"=="+j)
    //        break;
    //      }             
    //    }
    //    if(fl==0){
    //      var ar=[];
    //      if(ver2[j] && ver2[j]){ar.push(ver2[j].z)}  
    //      if(ver2[j+1] && ver2[j+1]){ar.push(ver2[j+1].z)}  
    //      //console.log((ver2[j-1]));
    //      if(ver2[j-1] && ver2[j-1].z){ar.push(ver2[j-1].z)}  
    //      if(ver2[j+this.w] && ver2[j+this.w]){ar.push(ver2[j+this.w].z)}  
    //      if(ver2[j-this.w] && ver2[j-this.w]){ar.push(ver2[j-this.w].z)}
    //      //console.log(ar);
    //      var avgr=this.avg(ar);
    //      //console.log(avgr);
    //      vv.push({x:0 ,y:0 ,z:avgr});console.log(c);
    //      }
    //  }
    //}
    //console.log(c);
          //console.log(JSON.stringify(vv)); 
    console.log(this.planeX+"=="+this.planeY);
    $("#planex").val(this.planeX);
    $("#planey").val(this.planeY);
    var g = new THREE.PlaneGeometry(this.planeX, this.planeY, this.w-1,this.h-1);
    //g.vertices=vv;
    console.log(g.vertices.length)
    
    for (var i = 0, l = g.vertices.length; i < l; i++) {      
      var x = parseInt(g.vertices[i].x+this.w/2);
      var y = parseInt(g.vertices[i].y+this.h/2);
      if (vv[x] && vv[x][y]) {
        g.vertices[i].z = vv[x][y].z;
      } else { 
        console.log("not defined ");
        console.log(x); console.log(y);
      }
    }      
    g.dynamic = true;
    console.log(g);
    var tx = THREE.ImageUtils.loadTexture(this.storeTxImg);
    var material = new THREE.MeshPhongMaterial({
        //color: 0x00ff00,  
        map:tx,
        //wireframe: true
        side:THREE.DoubleSide
    });
    material.needsUpdate=true;
    var plane = this.plane=new THREE.Mesh(g, material);
    plane.castShadow = true;
    plane.receiveShadow = true;
    plane.rotation.x=-Math.PI/2;
    //plane.geometry.vertices[0].z=10000;
    //plane.geometry.vertices[this.w-1].z=10000;
    //plane.geometry.vertices[plane.geometry.vertices.length-this.w].z=10000;
    //plane.geometry.vertices[plane.geometry.vertices.length-1].z=10000;
    //plane.scale.set(5,5,5);
    console.log(dInfo);
    this.scale=dInfo!=undefined?dInfo.scale:this.scale;
    console.log("near z scale ");
    console.log(this.scale);
    this.scalex=dInfo!=undefined?dInfo.scalex:this.scalex;
    this.scaley=dInfo!=undefined?dInfo.scaley:this.scaley;
    this.scalez=dInfo!=undefined?dInfo.scalez:this.scalez;
    $("#xscale").val(this.scalex);
    $("#yscale").val(this.scaley);
    $("#zscale").val(this.scalez);
    plane.scale.set(this.scalex,this.scaley,this.scalez);

    plane.yesDelete=true;
    this.scene.add(plane);
    this.plane=plane;
    this.slight.intensity=dInfo!=undefined?dInfo.lIntensity : this.lIntensity;
    $("#lintense").val(this.slight.intensity);
    light.target.position.copy(plane.position);
    //light.target.position.set(100,100,100);
    console.log(plane);
   var o3d=new THREE.Object3D();
   //o3d.add(plane);
   light.target=o3d;
   //this.scene.add(o3d);
   console.log(o3d);
   this.getConLatLon(ltmax,ltmin,lnmax,lnmin);
    //======================
    //showCordPoints(ver1);
        
    
    //======================
  
    }
vidteq._contour.prototype.avg=function (t) {
  var sum = t.reduce(function(a, b) { return a + b; });
  var avg = sum / t.length;
  return avg;
}
vidteq._contour.prototype.showCordPoints=function (ver1) {    
  var o3d=new THREE.Object3D();
  var m = new THREE.MeshBasicMaterial({ color: 0xff0000});
  for(var i in ver1){
    var s=new THREE.Mesh(new THREE.SphereGeometry(0.1,5,5),m);
    s.position.set(ver1[i].x,ver1[i].y,ver1[i].z*scale);
    //s.scale.z=0.05;
    o3d.add(s)       ;      
  }
  //o3d.position.set(-1500,200,-200);
  o3d.rotation.x=-Math.PI/2;
  o3d.yesDelete=true;
  this.scene.add(o3d);
}
vidteq._contour.prototype.getDataInfo=function (data) {       
  this.dataInfo.bdry=parseInt(Math.sqrt(data.length));
  this.dataInfo.lon= $.extend(true,[],data.sort(function(a,b){
    return a.x - b.x;
  }));      
  this.dataInfo.lat= $.extend(true,[],data.sort(function(a,b){
    return a.y - b.y;
  }));
  this.dataInfo.altd= $.extend(true,[],data.sort(function(a,b){
    return a.z - b.z;
  }));
  //return dataInfo;
}

vidteq._contour.prototype.animate=function () {   
var that=this;  
  function animation(){
    requestAnimationFrame( animation );
    that.controls.update();
    that.render();      
  }
  animation();
}

vidteq._contour.prototype.render=function () {                
  //light.rotation.x+=0.01;
  this.renderer.render( this.scene, this.camera );    
  if(this.slight){this.slight.target.updateMatrixWorld();}
}
vidteq._contour.prototype.loadCSVFile=function (fl) {
  var that=this; 
  /*
  $.ajax({
    url: "b.php",
    type: "POST",
    dataType : 'json',
    data: fd,
    processData: false,
    contentType: false,
    success: function(data){
      //console.log('success',data);
      that.resData=data.responseText;
      that.storeData=data;   //needed
      var di=that.getDataInfo(data); // fill in dataInfo obj
      that.loadTerrain(data,di)  ;
    }
    ,error: function(data){
      that.resData=data.responseText;
      console.log('error',data.responseText);
    }
  });
  */
  fetch('latlon.txt')
  .then(response => response.text())
  .then(data => {
    data=JSON.parse(data);

    that.resData=data.responseText;
    that.storeData=data;   //needed
    var di=that.getDataInfo(data); // fill in dataInfo obj
    that.loadTerrain(data,di)  ;
  	//console.log(data);
  });
}
  
vidteq._contour.prototype.updateMeshValues=function () {
  this.w=parseFloat($("#imgx").val()) || this.w;
  this.h=parseFloat($("#imgy").val()) || this.h;
  this.planeX=parseFloat($("#planex").val()) || this.planeX;
  this.planeY=parseFloat($("#planey").val()) || this.planeY;
  this.scalex=parseFloat($("#xscale").val()) || this.scalex;
  this.scaley=parseFloat($("#yscale").val()) || this.scaley;
  this.scalez=parseFloat($("#zscale").val()) || this.scalez;
    
  this.lIntensity=parseFloat($("#lintense").val()) || this.lIntensity;
  $("#imgx").val(this.w);
  $("#imgy").val(this.h); 
  $("#planex").val(this.planeX);
  $("#planey").val(this.planeY);
  $("#xscale").val(this.scalex);
  $("#yscale").val(this.scaley);
  $("#zscale").val(this.scalez);  
  //console.log( w+"="+h+"="+planeY+"="+planeX+"="+scale+"==");
  var udi = {
    imgW:this.w
    ,imgH:this.h
    ,planeX:this.planeX
    ,planeY:this.planeY
    ,scalex:this.scalex
    ,scaley:this.scaley
    ,scalez:this.scalez    
    ,lIntensity:this.lIntensity
  };
  console.log("udi "); console.log(udi);
  //dataInfo=dataInfo!=null?dataInfo
  this.loadTerrain(this.storeData,udi)  ;
  console.log(this.scene);
}

vidteq._contour.prototype.loadTexture=function (txtr) {
  var that=this;
  //var txImg=txtr.files;
  console.log(txtr.files);
  if (txtr.files && txtr.files[0]){
    //console.log(txImg);
    var fileToLoad = txtr.files[0];
    //console.log(fileToLoad);
    var reader = new FileReader();
    //console.log(reader.onload);
    reader.onload = function(e) {
      //console.log(reader);
      that.storeTxImg=e.target.result;
      console.log(that.storeTxImg);
    }
    reader.readAsDataURL(fileToLoad);          
  }        
  console.log(that.storeTxImg);
}

vidteq._contour.prototype.rotateForward=function () {
  //console.log("b4",this.slight.position);
  this.rotAgl+=this.agl;
  var z=Math.cos(Math.PI/180*this.rotAgl)*this.rad;  //x
  var x=Math.sin(Math.PI/180*this.rotAgl)*this.rad;  //z/y
  this.slight.position.set(x,this.yfix,z);
  this.xfix=this.slight.position.x;
  //this.rmesh.position.copy(this.slight.position);
  //console.log("rad",this.rad);
  //console.log("agl",this.rotAgl);
  //console.log("aftr",this.slight.position);
}
vidteq._contour.prototype.rotateBackward=function () {
  this.rotAgl-=this.agl;
  var z=Math.cos(Math.PI/180*this.rotAgl)*this.rad;  //x
  var x=Math.sin(Math.PI/180*this.rotAgl)*this.rad;  //z/y
  this.slight.position.set(x,this.yfix,z);
  this.xfix=this.slight.position.x;
  //this.rmesh.position.copy(this.slight.position);
}
vidteq._contour.prototype.rotateUp=function () {
  //console.log("b4",this.slight.position);
  this.rotAgl2+=this.agl2;
  var z=Math.cos(Math.PI/180*this.rotAgl2)*this.rad;  //x
  var y=Math.sin(Math.PI/180*this.rotAgl2)*this.rad;  //z/y
  this.slight.position.set(this.xfix,y,z);
  this.yfix=this.slight.position.y;
  //this.rmesh.position.copy(this.slight.position);
  //console.log("rad",this.rad);
  //console.log("agl2",this.rotAgl2);
  //console.log("aftr",this.slight.position);
}

vidteq._contour.prototype.rotateDown=function () {
  this.rotAgl2-=this.agl2;
  var z=Math.cos(Math.PI/180*this.rotAgl2)*this.rad;  //x
  var y=Math.sin(Math.PI/180*this.rotAgl2)*this.rad;  //z/y
  this.slight.position.set(this.xfix,y,z);
  this.yfix=this.slight.position.y;
  //this.rmesh.position.copy(this.slight.position);
}


vidteq._contour.prototype.getConLatLon=function (ltmax,ltmin,lnmax,lnmin){
  this.cornerLatLon=[];
  
  var ln0=lnmin-((this.plane.geometry.vertices[0].x*(-2)*(lnmax-lnmin))/this.w);
  var lt0=ltmin-((this.plane.geometry.vertices[0].y*2*(ltmax-ltmin))/this.h);
  this.cornerLatLon.push({lat:lt0 ,lon:ln0});
  
  var ln1=lnmax-((this.plane.geometry.vertices[this.w].x*2*(lnmax-lnmin))/this.w);
  var lt1=ltmin-((this.plane.geometry.vertices[this.w].y*2*(ltmax-ltmin))/this.h);
  this.cornerLatLon.push({lat:lt1 ,lon:ln1});
  
  var ln2=lnmin-((this.plane.geometry.vertices[0].x*(-2)*(lnmax-lnmin))/this.w);
  var lt2=ltmax-((this.plane.geometry.vertices[0].y*(-2)*(ltmax-ltmin))/this.h);
  this.cornerLatLon.push({lat:lt2 ,lon:ln2});
  
  var ln3=lnmax+((this.plane.geometry.vertices[this.plane.geometry.vertices.length-1].x*2*(lnmax-lnmin))/this.w);
  var lt3=ltmax+((this.plane.geometry.vertices[this.plane.geometry.vertices.length-1].y*(-2)*(ltmax-ltmin))/this.h);
  this.cornerLatLon.push({lat:lt3 ,lon:ln3});
}

vidteq._contour.prototype.initEvent=function () {
  var that=this;
  $(document).ready(function(){
    $("#upload").click(function(){
    var fl=$("#file")[0].files[0];
    console.log(fl);          
    that.loadCSVFile(fl);
  });
  $("#update").click(function(){
    //var planeX=1  ,planeY=1, w=1, h=1,scale=1;;
    that.updateMeshValues();
    //that.getConLatLon();
  });
    $("#txImg").change(function(){
      that.loadTexture(this);
    });
    $("#rotatef").click(function(){
      that.rotateForward();

    });
    $("#rotateb").click(function(){
      that.rotateBackward();

    });
    $("#rotateu").click(function(){
      that.rotateUp();

    });
    $("#rotated").click(function(){
      that.rotateDown();

    });
    $("#sunnear").click(function(){
      that.slight.position.z-=10;      
      that.rad=that.slight.position.z;

    });
    $("#sunfar").click(function(){
      that.slight.position.z+=10;
      that.rad=that.slight.position.z;
    });
    var ah=null,ah2=null;
   $('#aref').change(function(){
     console.log($(this).is(':checked'));
     //console.log($(this).is(':unchecked'));
    if($(this).is(':checked')){
      console.log('Checked');
      ah=new THREE.AxisHelper(1000);ah.deleteAH=true;
      ah2=new THREE.AxisHelper(-1000);ah2.deleteAH=true;
      that.scene.add(ah);that.scene.add(ah2);
    }
    else{ 
      console.log('unChecked');
      for(var i=0 ;i<that.scene.children.length;i++){
        //console.log('unChecked',that.scene.children[i]);
        if(that.scene.children[i].deleteAH){          
          that.scene.remove(that.scene.children[i]);
          i=-1;
        }
      }
    }
  }); 
  $("#snapshot").click(function(){
    that.ImgCord2D=[];
    var cVert=[];
    cVert.push(that.plane.geometry.vertices[0]);
    cVert.push(that.plane.geometry.vertices[that.w-1]);
    cVert.push(that.plane.geometry.vertices[(that.plane.geometry.vertices.length)-(that.h)]);
    cVert.push(that.plane.geometry.vertices[that.plane.geometry.vertices.length-1]);
    console.log(cVert);;
    var vector = new THREE.Vector3();

    var widthHalf = that.renderer.context.canvas.width/2;
    var heightHalf = that.renderer.context.canvas.height/2;

    //that.plane.updateMatrixWorld();
    //vector.setFromMatrixPosition(that.plane.matrixWorld);
    //vector.project(that.camera);
    for(var i in cVert){
      vector.copy(cVert[i]);
      ( vector.applyProjection(that.plane.matrixWorld)).project(that.camera );
      vector.x = ( vector.x * widthHalf ) + widthHalf;
      vector.y = - ( vector.y * heightHalf ) + heightHalf;
      that.ImgCord2D.push({x:vector.x ,y:vector.y });
    }
    console.log(that.ImgCord2D);     
        imgData = that.renderer.domElement.toDataURL();      
        console.log(that.renderer.domElement);        
        console.log(imgData);        
        console.log("Browser does not support taking screenshot of 3d context");        
   imgNode = document.createElement("img");
   imgNode.src = imgData;
   document.body.appendChild(imgNode);    
  });
  });
  
  window.addEventListener("resize", function(e){
  that.camera.aspect=window.innerWidth/window.innerHeight;
	that.camera.updateProjectionMatrix();
	that.renderer.setSize(window.innerWidth,window.innerHeight);
  });
    
  window.addEventListener("keyup", function(e){
    var imgData, imgNode;
    //Listen to 'P' key
    if(e.which !== 80) return;  
    try {
        imgData = that.renderer.domElement.toDataURL();      
        console.log(imgData);
    } 
    catch(e) {
        console.log("Browser does not support taking screenshot of 3d context");
        return;
    }
    imgNode = document.createElement("img");
    imgNode.src = imgData;
    document.body.appendChild(imgNode);
  });
  this.renderer.domElement.addEventListener('mousemove',function(e){
    //console.log(e);
    var intersects=that.getIntersectObject(e);
    //console.log(intersects);
  if (intersects && intersects.length){
    console.log(intersects);
    
  }
  },false);
}

vidteq._contour.prototype.getIntersectObject = function (e) {
  if(!this.plane){return;}
  x = e.clientX;
  y = e.clientY;    
  if( !this.mouseVector ) {
    this.mouseVector = new THREE.Vector3();
  }
  
  this.mouseVector.x = (x/$('#cancon').width())*2 - 1;
  this.mouseVector.y = -(y/$('#cancon').height())*2 + 1;
  //this.mouseVector.z = 0.5;
  //this.projector = new THREE.Projector();
  tileMeshes=[];
  tileMeshes.push(this.plane);
  //console.log(tileMeshes);
  //var pRay = this.projector.pickingRay(this.mouseVector.clone(),this.venue360.camera );
  //var sceneObjects = tileMeshes;
  //var intersects = pRay.intersectObjects(sceneObjects );
  var vector = new THREE.Vector3();
  vector.set(( e.clientX / window.innerWidth ) * 2 - 1, - ( e.clientY / window.innerHeight ) * 2 + 1, 0.5 );
  this.mouseVector.unproject( this.camera );
  
  this.drag=true;
  
  var raycaster = new THREE.Raycaster( this.camera.position, this.mouseVector.sub( this.camera.position ).normalize() );
  
  var intersects = raycaster.intersectObjects( tileMeshes );
  return intersects;
}
var ter=new vidteq._contour();
ter.init();

