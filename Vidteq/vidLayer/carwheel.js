if (typeof(vidteq) == 'undefined') { vidteq = {}; }

vidteq._carModel=function(){//alert();
  //this.scene=ob;
  //var ambient = new THREE.AmbientLight( 0x050505 );
	////ob.scene.add( ambient );
  //
	//directionalLight = new THREE.DirectionalLight( 0xffffff, 2 );
	//directionalLight.position.set( 2, 1.2, 10 ).normalize();
	//ob.scene.add( directionalLight );
  //
	//directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
	//directionalLight.position.set( 2, 1.2, -10 ).normalize();
	//ob.scene.add( directionalLight );
  //
	//pointLight = new THREE.PointLight( 0xffaa00, 2 );
	//pointLight.position.set( 2000, 1200, 10000 );
	//ob.scene.add( pointLight );
  
  //var loader = new THREE.BinaryLoader( true );
	//document.body.appendChild( loader.statusDomElement );

   //console.log(cr);
  var CARS = {
	  "veyron": 	{
  
		name:	"Bugatti Veyron",
		url: 	"obj/veyron/VeyronNoUv_bin.js",			
		init_rotation: [ 0, 0, 0 ],
		scale: 1.5,
		init_material: 0,
		body_materials: [ 2 ],
  
		object: null,
		buttons: null,
		materials: null
  
	  }
  };
	this.materials= null
      			// Veyron materials
	var mlib = {
  
	  "SideMetal": 	new THREE.MeshLambertMaterial( { color: 0xffff55,  combine: THREE.MixOperation, reflectivity: 0.3 } ),				
	  "BodyMetal": 	new THREE.MeshLambertMaterial( { color: 0x990033,  combine: THREE.MultiplyOperation } ),
	  "WheelSpoke": 	new THREE.MeshLambertMaterial( { color: 0xFFFF66 } ),
	  "BackGlass":	new THREE.MeshLambertMaterial( { color: 0xffff00,  opacity: 0.25, transparent: true } ),
	  "FrontGlass":	new THREE.MeshLambertMaterial( { color: 0xff0000, opacity: 0.5, transparent: true } ),
	  "UnderCar": 	new THREE.MeshLambertMaterial( { color: 0x0000aa, opacity: 0.5, transparent: false } ),
	  "TyreColor":		new THREE.MeshLambertMaterial( { color: 0x000000 } ),  
	}
	this.materials = {

    body: [[ "BodyMetal", 	mlib[ "BodyMetal" ] ]]
  }

				m = this.materials;
				//mi = CARS[ "veyron" ].init_material;
//console.log(CARS);
  this.mmap = {
  
  	0: mlib[ "TyreColor" ],		// tires + inside
  	1: mlib[ "SideMetal" ],		// side metal
  	2: m.body[ 0 ][ 1 ], 			// back / top / front torso
  	3: mlib[ "BackGlass" ],		// glass
  	4: mlib[ "SideMetal" ],		// sides torso
  	5: mlib[ "WheelSpoke" ],		// while spoke
  	6: mlib[ "UnderCar" ],		// under car
  	7: mlib[ "FrontGlass" ]	// front glass
  
  }   
 }
vidteq._carModel.prototype.createCar=function(scl,orientation,cb) {
 //console.log(this);alert()
  var cr=new THREE.Car(orientation);
  var root="http://10.4.71.200/local/rsharma/js/myjs/";
  url=["veyron/parts/veyron_body_bin.js","veyron/parts/veyron_wheel_bin.js"];
  var that=this;
  cr.loadPartsBinary( url[0],url[1] );
  //console.log(cr);alert()   
  //console.log(this);alert()   
  cr.callback=function(object){
    console.log(that);
    console.log(object);
    that.paintCar(object);
    object.root.scale.x=scl;object.root.scale.y=scl;object.root.scale.z=scl;
    //that.scene.scene.add(object.root);
    that.carmesh=object.root;
    that.car=cr;
    cb();
  }
}
vidteq._carModel.prototype.paintCar=function(car ) {
  //console.log(this);alert();
	var m = new THREE.MeshFaceMaterial(),
	s = 1 * 1,
	r = [0,0,0],
	bmaterials = car.bodyMaterials;  
  wmaterials = car.wheelMaterials;
  console.log(wmaterials);
  wmaterials[0]=this.mmap[5];
  wmaterials[1]=this.mmap[0];
  
	for ( var i in this.mmap ) {    
		bmaterials[ i ] = this.mmap[ i ];    
	}
  bmaterials[ 0 ] = this.mmap[ 2 ];
}     
vidteq._carModel.prototype.createScene1=function() {//alert()
 return this.mesh;

} 
