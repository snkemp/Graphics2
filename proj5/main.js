/* ""Hardware"" */
var container, renderer, scene, camera, control, gui;
var uniforms, attributes, shaderMaterial;
var mcUniforms, mcAttribute, mcShaderMaterial;
var testy = 5;

/*Variables*/
var water, ground, time=0, drops=[], animating=true;
/*Metaballs*/
var mbResolution = 150, sdResolution = 20, numBalls = 10, mbSubtract = 12, mbStrength = 1.2/((Math.sqrt(numBalls)-1)/4+1), mcMaterial, mc;
mbStrength = .15;
var currBall = 1;
var audio = new Audio('drop.mp3');
/*Called when page loads*/
function onload() {
	//Get container
	container = document.getElementById('container');

	//Create a renderer and add to container
	renderer = new THREE.WebGLRenderer({antialias:true});
	renderer.setSize(window.offsetWidth, window.offsetHeight);
	container.appendChild(renderer.domElement);

	//Create a camera and a scene
	camera = new THREE.PerspectiveCamera(50, window.innerWidth/window.innerHeight, 1, 10000);
	scene = new THREE.Scene();
	scene.add(camera);

	//CameraControls
	control = new THREE.OrbitControls(camera, document, renderer.domElement);

	//Add resize listener
	var resize = function() {
		camera.aspect = window.innerWidth/window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize(window.innerWidth, window.innerHeight);
	}

	window.addEventListener('resize', resize, false);
	resize();

	//Create scene
	createScene();

	//Create gui
	gui = new dat.GUI();
	var waterValues = new function() {
		this.amplitude = uniforms.amplitude.value;
		this.waveLength = uniforms.waveLength.value;
		this.decay = uniforms.decay.value;
		this.waterOpacity = uniforms.waterOpacity.value;
		this.reflectivity = uniforms.reflectivity.value;
		this.reset = reset;
	}();
	var pebbleValues = new function() {
		this.pebbleOpacity = mcUniforms.pebbleOpacity.value;
		this.reflectivity = mcUniforms.reflectivity.value;
		this.refractivity = mcUniforms.refractivity.value;
		this.refractR = mcUniforms.refractR.value;
		this.refractG = mcUniforms.refractG.value;
		this.refractB = mcUniforms.refractB.value;
		this.speed = mcUniforms.speed.value;
	}();
	var wf = gui.addFolder('Water Values');
	wf.add(waterValues, 'amplitude', .1, 5).onChange(function(v) {uniforms.amplitude.value = v;});
	wf.add(waterValues, 'waveLength',.1, 20).onChange(function(v) {uniforms.waveLength.value = v;});
	wf.add(waterValues, 'decay', 0, 20).onChange(function(v) { uniforms.decay.value = v;});
	wf.add(waterValues, 'waterOpacity', 0, 1).onChange(function(v) { uniforms.waterOpacity.value = v;});
	wf.add(waterValues, 'reflectivity', 0, 1).onChange(function(v) {uniforms.reflectivity.value = v;});
	wf.add(waterValues, 'reset');

	var pf = gui.addFolder('Pebble Values');
	pf.add(pebbleValues, 'pebbleOpacity', 0, 1).onChange(function(v) {mcUniforms.pebbleOpacity.value = v;});
	pf.add(pebbleValues, 'reflectivity', 0, 1).onChange(function(v) {mcUniforms.reflectivity.value = v;});

	pf.add(pebbleValues, 'refractR', 0, 1).onChange(function(v) {mcUniforms.refractR.value = v;});
	pf.add(pebbleValues, 'refractG', 0, 1).onChange(function(v) {mcUniforms.refractG.value = v;});
	pf.add(pebbleValues, 'refractB', 0, 1).onChange(function(v) {mcUniforms.refractB.value = v;});
	pf.add(pebbleValues, 'speed', 0, .1).onChange(function(v) { mcUniforms.speed.value = v;});
	document.addEventListener('keydown', bind(this, FIRE));
	run();
}

function reset() {
	window.location = 'main.html';
}

function FIRE(e) {
}

/*Run*/
function run() {
	//Update orbit controls
	control.update();

	//If animating
	if(animating) {
		//Update time
		time += .01;
		uniforms.time.value = time;
		//update cubes
		//uniforms.pebbleP.value[0].x = .605*(Math.cos(time)/2) + .5;
		//uniforms.pebbleP.value[0].z = .605*(Math.sin(time)/2) + .5;
		updateCubes(mc, time, numBalls, 0, 0, 0);
	}

	//Render and call run again
	renderer.render(scene, camera);
	requestAnimationFrame(run);
}



function createScene() {
	
	//Add some lights
	var amb = new THREE.AmbientLight(0x404040);
	var dl1 = new THREE.DirectionalLight(0xf0f0f0, 1.0);
		dl1.position.set(0, 1, -1);
		scene.add(dl1);
	var dl2 = new THREE.DirectionalLight(0xff0000, 1.0);
		dl2.position.set(1, 1, 0);
		scene.add(dl2);
	//Draw a floor
	var W = 20, H = 20;
	var floor, floorGeom, floorMatl;
	floorGeom = new THREE.PlaneGeometry(3*W, 3*W, 32, 32);
	floorMatl = new THREE.MeshBasicMaterial({color:0x32e132, side:THREE.DoubleSide});
	floor = new THREE.Mesh(floorGeom, floorMatl);
	floor.rotation.set(-Math.PI/2, 0, -Math.PI/2);
	floor.position.set(0, -.01, 0);
	ground = floor;
	//Draw a fountain
	var fountain;
	var fountainBase, fountainBaseGeom, fountainBaseMatl;
	var fountainRing, fountainRingGeom, fountainRingMatl;
	fountainBaseGeom = new THREE.CircleGeometry(W, 32);
	fountainBaseMatl = new THREE.MeshBasicMaterial({color:0xffffff, side:THREE.DoubleSide});
	fountainBase = new THREE.Mesh(fountainBaseGeom, fountainBaseMatl);
	fountainBase.rotation.set(Math.PI/2, 0, Math.PI/2);
	
	fountainRingGeom = new THREE.CylinderGeometry(W, H, 5, 32, 32, true);
	fountainRingMatl = new THREE.MeshBasicMaterial({color:0xe1e1e1, side:THREE.DoubleSide});
	fountainRing = new THREE.Mesh(fountainRingGeom, fountainRingMatl);
	fountainRing.position.set(0, 2.5, 0);
	
	fountain = new THREE.Mesh();
	fountain.add(fountainBase);
	fountain.add(fountainRing);
	scene.add(fountain);
	scene.add(floor);

	var pp=[], pt=[], pb=[];
	for(var i=0; i<64; i++) {
		pp.push(new THREE.Vector3(.605, .4554, .605));
		pt.push(0.0);
		pb.push(0.0);
	}
	pb[0] = 3;
	uniforms = {
		time : { 		type:'f',   value: 0.0},
		amplitude: { 	type:'f',   value:0.7},
		waveLength: { 	type:'f',   value:7.5},
		decay: { 		type:'f',   value:12.5},
		waterOpacity: { type:'f',   value:0.7},
		reflectivity: { type:'f',   value:1.0},
		refractivity: { type:'f',   value:1.0},
		pebbleP: { 		type:'v3v', value:pp},
		pebbleT : { 	type:'fv1',	value:pt},
		pebbleB: { 		type:'fv1',	value:pb}
	};
	uniforms = THREE.UniformsUtils.merge([uniforms, THREE.UniformsLib["lights"]]);
	attributes={};
	loadshaders('./my_shader.vs', './my_shader.fs');

	shaderMaterial = new THREE.ShaderMaterial({
		 vertexShader: 		vs_source,
		 fragmentShader:	fs_source,
		 uniforms:			uniforms,
		 attributes:		attributes,
		 transparent: 		true,
		 lights:			true,
		 side:				THREE.DoubleSide
	});
	shaderMaterial.defines = {
		USE_ENVMAP: true,
		USE_COLOR:	true,
		NUM_PEBBLES: 64
	};

	mcUniforms = {
		pebbleOpacity: {type:'f', value:0.5},
		reflectivity:  {type:'f', value:0.5},
		refractivity:  {type:'f', value:0.5},
		refractR:  	   {type:'f', value:0.33},
		refractG:	   {type:'f', value:0.66},
		refractB:	   {type:'f', value:1.0},
		shininess:	   {type:'f', value:0.5},
		speed:		   {type:'f', value:.005}
	};
	mcUniforms = THREE.UniformsUtils.merge([mcUniforms, THREE.UniformsLib["lights"]]);
	mcAttributes={};
	loadshaders('./mc_shader.vs', './mc_shader.fs');
	mcShaderMaterial = new THREE.ShaderMaterial({
				vertexShader: vs_source,
				fragmentShader:fs_source,
				uniforms:mcUniforms,
				attributes:mcAttributes,
				transparent:true,
				lights:true,
				side:THREE.DoubleSide
	});
	mcShaderMaterial.defines = {
		USE_ENVMAP:true,
		USE_COLOR: true,
		NUM_PEBBLES:64
	};
	//Create a skybox
	var cube_texture = THREE.ImageUtils.loadTextureCube(
		[ 'images/posx.png','images/negx.png','images/posy.png',
		  'images/negy.png','images/posz.png','images/negz.png']);

	var waterGeom = new THREE.PlaneGeometry(2*W, 2*H, 512, 512);
	water = new THREE.Mesh(waterGeom, shaderMaterial);
	water.rotation.set(Math.PI/2, 0, 0);
	water.position.set(0, 2.5, 0);
	scene.add(water);

	uniforms.envMap = cube_texture;
		
	//Shader for cube map
	var cube_shader = THREE.ShaderLib["cube"];
		cube_shader.uniforms["tCube"].value = cube_texture;

	var s = 200;
	var skyGeom = new THREE.BoxGeometry(s,s,s);
	var skyMatl = new THREE.ShaderMaterial({
			fragmentShader: cube_shader.fragmentShader,
			vertexShader: cube_shader.vertexShader,
			uniforms: cube_shader.uniforms,
			depthWrite: false,
			side: THREE.BackSide
	});
	var skyBox = new THREE.Mesh(skyGeom, skyMatl);
		skyBox.position.set(0, s/16, 0);
	scene.add(skyBox);

	//Create metaballs
	//mcMaterial = new THREE.MeshPhongMaterial({color:0xffff00, specualar:0x111111, shininess:1, transparent:false, opacity:0.0, side:THREE.DoubleSide});
	mcMaterial = mcShaderMaterial; 

	mc = new THREE.MarchingCubes(mbResolution, mcMaterial, true, true);
	mc.material = mcMaterial;
	mc.position.set(0, 16.5, 0);
	mc.scale.set(sdResolution, sdResolution, sdResolution);
	scene.add(mc);
	mc.init(mbResolution);
	
	camera.position.set(0, 50, -100);
}
function updateCubes( object, time, numblobs, floor, wallx, wallz )
{
	mc.reset();

	// update metaballs' positions
	var i, ballx, bally, ballz, subtract, strength;

	for ( i = 0; i < numblobs; i ++ )
	{
		if(i == currBall) {
			if(uniforms.pebbleP.value[i].y > .15) {
				uniforms.pebbleP.value[i].y -= mcUniforms.speed.value;
				console.log("Geronimo");
			}
			else {
				console.log("Making a wave!!! wOOT");
				audio.play();
				uniforms.pebbleP.value[i].y = 0;
				uniforms.pebbleT.value[i] = time;
				uniforms.pebbleB.value[i] = 2;
		
				currBall++;
				if(currBall > numblobs-1) currBall = 1;
				uniforms.pebbleP.value[currBall] = uniforms.pebbleP.value[0].clone();
				uniforms.pebbleB.value[currBall] = 0;
			}
		}
		
		if(uniforms.pebbleB.value[i] < 1 && i != currBall) continue;
		ballx = uniforms.pebbleP.value[i].x;
		bally = uniforms.pebbleP.value[i].y;
		ballz = uniforms.pebbleP.value[i].z;
		object.addBall(ballx, bally, ballz, mbStrength, mbSubtract);
	}

	// do we have bounding planes ?
	if ( floor ) object.addPlaneY( 2, 12 );
	if ( wallz ) object.addPlaneZ( 2, 12 );
	if ( wallx ) object.addPlaneX( 2, 12 );
}
