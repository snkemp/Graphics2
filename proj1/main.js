var container;
var camera, controls, scene, renderer, controls;
var clock = new THREE.Clock();
var walls = [], light = [];
var animating = true;
var gui = null;
var walker = null;

function onLoad() {
	//Get container from document
	container = document.getElementById("container");

	//Create a scene with some fog
	scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.0015);

	//Create camera
    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.set(-100, 50, 0);
	scene.add(camera);


	//Add some controls
	controls = new CameraControl(camera, animate);

	//Create renderer
	renderer = new THREE.WebGLRenderer({antialias: true});
	renderer.setSize(window.offsetWidth, window.offsetHeight);
	container.appendChild(renderer.domElement);

	//Add resize listener
	window.addEventListener('resize', onWindowResize, false);
	onWindowResize();

	//Create user experience
	light = createLight();
	walls = createRoom();
	gui = createGUI();
	
	//Create walker
	walker = new Walker();
	scene.add(walker.mesh);
	run();
}

function createGUI() {
	var GUI = new dat.GUI();
	var values = new function() {
		this.numLegs = 1;
		this.controlled = false;
	}();
	var n = GUI.add(values, 'numLegs', 1, 100);
	n.onChange(function(value) {
		walker.setSize(value);
	});
	var c = GUI.add(values, 'controlled');
	c.onChange(function(value) {
		walker.toggleControl();
	});
	return GUI;
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
}

function run() {
	controls.update();
	if(animating) {
		walker.update();
		walker.checkPosition(walls);
	}
	renderer.render(scene, camera);
	requestAnimationFrame(run);
}


function animate() {
	animating = !animating;
}

function createLight() {
	//Add a light to the scene
    var light = new THREE.DirectionalLight(0xffddee);
    light.position.set(1, 1, 0);
    scene.add(light);

	//Add some ambient light
	var ambient = new THREE.AmbientLight(0xcccccc);
	scene.add(ambient);
}

function createRoom() {
	var floor = new THREE.GridHelper(500, 10);
	floor.setColors(0xffffff, 0xffffff);
	floor.position.y = 0;
	floor.isPersonOB = function(person) {
		if(person.position.y < 5)
			person.position.y = 5;
	};
	scene.add(floor);
	walls.push(floor);
	
	var ceil = new THREE.GridHelper(500, 10);
	ceil.setColors(0xffffff, 0xffffff);
	ceil.position.y  = 200;
	ceil.isPersonOB = function(person) {
		if(person.position.y < 500) 
			person.position.y = 500;
	};
	scene.add(ceil);
	walls.push(ceil);
	//North wall
	for(var i = 0; i < 5; i++){
		var t = new THREE.GridHelper(100, 10);
		t.setColors(0xffffff, 0xffffff);
		t.rotation.x = Math.PI/2;
		t.position.x = (i*200)-400;
		t.position.y = 100;
		t.position.z = 500;
		t.isPersonOB = function(person) {
			if(person.position.z > 500)
				person.position.z = 500;
		};
		scene.add(t);
		walls.push(t);
	}

	//South wall
	for(var i = 0; i < 5; i++) {
		var t = new THREE.GridHelper(100, 10);
		t.setColors(0xffffff, 0xffffff);
		t.rotation.x = Math.PI/2;
		t.position.x = (i*200)-400;
		t.position.y = 100;
		t.position.z = -500;
		t.isPersonOB = function(person) {
			if(person.position.z < -500)
				person.position.z = -500;
		}
		scene.add(t);
		walls.push(t);
	}

	//West wall
	for(var i = 0; i < 5; i++) {
		var t = new THREE.GridHelper(100, 10);
		t.setColors(0xffffff, 0xffffff);
		t.rotation.z = Math.PI/2;
		t.position.z = (i*200)-400;
		t.position.y = 100;
		t.position.x = 500;
		t.isPersonOB = function(person) {
			if(person.position.x > 500)
				person.position.x = 500;
		}
		scene.add(t);
		walls.push(t);
	}
	
	//East wall
	for(var i = 0; i < 5 ; i++) {
		var t = new THREE.GridHelper(100, 10);
		t.setColors(0xffffff, 0xffffff);
		t.rotation.z = Math.PI/2;
		t.position.z = (i*200)-400;
		t.position.y = 100;
		t.position.x = -500;
		t.isPersonOB = function(person) {
			if(person.position.y < -500)
				person.position.z = -500;
		};
		scene.add(t);
		walls.push(t);
	}	
}
