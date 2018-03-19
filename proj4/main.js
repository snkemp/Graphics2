/* ""Hardware"" */
var container, renderer, scene, camera, control, animating,  gui;
var uniforms, attributes, shaderMaterial;
/*Variables*/
var water, ground, pebbles, time, numPebbles;

/*Called when page loads*/
function onload() {
	animating = true;
	pebbles = [];
	numPebbles = 0;
	time = 0;
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
	var values = new function() {
		this.amplitude = uniforms.amplitude.value;
		this.waveLength = uniforms.waveLength.value;
		this.decay = uniforms.decay.value;
		this.waterOpacity = uniforms.waterOpacity.value;
		this.reflectivity = uniforms.reflectivity.value;
		this.reset = reset;
	}();
	gui.add(values, 'amplitude', .1, 5).onChange(function(v) {uniforms.amplitude.value = v;});
	gui.add(values, 'waveLength',.1, 20).onChange(function(v) {uniforms.waveLength.value = v;});
	gui.add(values, 'decay', 0, 20).onChange(function(v) { uniforms.decay.value = v;});
	gui.add(values, 'waterOpacity', 0, 1).onChange(function(v) { uniforms.waterOpacity.value = v;});
	gui.add(values, 'reflectivity', 0, 1).onChange(function(v) {uniforms.reflectivity.value = v;});
	gui.add(values, 'reset');
	
	document.addEventListener('keydown', bind(this, FIRE));
	run();
}

function reset() {
	
}

function FIRE(e) {
	if(e.keyCode == 32) {
		//Cant throw perfectly
		var r   = function() { return Pebble.SWAY(1.5);};

		//Variables for a new pebble
		var pos = camera.position.clone();
		var dir = new THREE.Vector3(control.target.x - pos.x,
									control.target.y - pos.y,
									control.target.z - pos.z);
			dir.add(new THREE.Vector3(r(), r(), r()));
			dir.normalize();
		var acc = new THREE.Vector3(0, 0, 0);
		
		//The pebble to throw
		var pbl = new Pebble(pos, dir, acc);
		scene.add(pbl);

		//Add to our pebbles to make waves
		if(pebbles.length < 64)pebbles.push(pbl);
		else pebbles[numPebbles] = pbl;

		//Add to uniforms
		uniforms.pebbleP.value[numPebbles] = pbl.position.clone();
		uniforms.pebbleT.value[numPebbles] = time;
		uniforms.pebbleB.value[numPebbles] = 0.5;

		//update numPebbles
		numPebbles++;
		if(numPebbles >= 64) numPebbles = 0;
	}
	if(e.keyCode == 27) {
	}
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

		//Update pebbles
		for(var i=0; i<pebbles.length; i++) {
			pebbles[i].update(water, ground);
			if(pebbles[i].justHitWater()) {
				uniforms.pebbleP.value[i] = pebbles[i].position.clone();
				uniforms.pebbleT.value[i] = time;
				uniforms.pebbleB.value[i] = 2.0;
			}
			else if(pebbles[i].justHitGround()) {
				
			}
		}
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
	
	//Add a Streetlight Manifesto
	var pol = new THREE.Mesh(
				  new THREE.CylinderGeometry(.25, .25, 10, 32, 32, false),
				  new THREE.MeshBasicMaterial({color:0x000000}));
		pol.position.set(0, 5, 0);
	var slm = new THREE.Mesh();
		slm.add(pol);
		scene.add(slm);
	var pl1 = new THREE.PointLight(0xf1f1f1, 1.0, 15, .1);
		pl1.position.set(0, 10.1, 0);
		scene.add(pl1);
		var lgeom = new THREE.SphereGeometry(.75, 32, 32);
		var light = new THREE.Mesh(lgeom,new THREE.MeshBasicMaterial({color:0xf1f1f1}));
			light.position.set(0, 10.1, 0);
			scene.add(light);

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
	//Draw the water in a fountain
	var pp = [], pt = [], pb = [];
	for(var i=0; i<64; i++) {
		pp.push(new THREE.Vector3());
		pt.push(0.0);
		pb.push(0.5);
	}

	uniforms = {
		time : {
			type:'f', 
			value: 0.0
		},
		amplitude: {
			type:'f',
			value:0.7
		},
		waveLength: {
			type:'f',
			value:7.5
		},
		decay: {
			type:'f',
			value:12.5
		},
		waterOpacity: {
			type:'f',
			value:0.7
		},
		reflectivity: {
			type:'f',
			value:1.0
		},
		pebbleP : {
			type:'v3v',
			value:pp
		},
		pebbleT : {
			type:'fv1',
			value:pt
		},
		pebbleB: {
			type:'fv1',
			value:pb
		}
	};
	uniforms = THREE.UniformsUtils.merge([uniforms, THREE.UniformsLib["lights"]]);
	attributes={
	};
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

	//Create a skybox
	var cube_texture = THREE.ImageUtils.loadTextureCube(
		[ 'images/posx.png','images/negx.png','images/posy.png',
		  'images/negy.png','images/posz.png','images/negz.png']);

	var waterGeom = new THREE.PlaneGeometry(2*W, 2*H, 256, 256);
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

	
	camera.position.set(0, 50, -100);
}
