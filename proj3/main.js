/* ""Hardware"" */
var container, renderer, scene, camera, control, animating, followPoint, gui;

/*Variables*/
var flock, boid, dt, pos;

/*Called when page loads*/
function onload() {
	//Get container
	container = document.getElementById('container');

	//Create a renderer and add to container
	renderer = new THREE.WebGLRenderer({antialias:true});
	renderer.setSize(window.offsetWidth, window.offsetHeight);
	renderer.setClearColor(0x213183, 1);
	renderer.setClearColor(0x000000, 1);
	container.appendChild(renderer.domElement);

	//Create a camera and a scene
	camera = new THREE.PerspectiveCamera(50, window.innerWidth/window.innerHeight, 1, 10000);
	camera.position.set(0, 1, 0);
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

	//Create walls and light
	createWalls();
	createLight();

	//Make a flock
	flock = new Flock(scene, 300);
	boid = new THREE.Mesh(
					new THREE.SphereGeometry(1, 32, 32),
					new THREE.MeshBasicMaterial({color:0xffffff})
					);
	scene.add(boid);
	dt = 0;
	pos = 0;
	followPoint = false;
	animating=false;

	//Create gui
	gui = new dat.GUI();
	var weights = new function() {
		this.VELOCITY = Boid.WEIGHT.VEL;
		this.position = Boid.WEIGHT.pos;
		this.avoid = Boid.WEIGHT.avd;
		this.velocity = Boid.WEIGHT.vel;
	}();
	var boidsv = new function() {
		this.MAX_SPEED = Boid.MAX_SPEED;
		this.MAX_FORCE = Boid.MAX_FORCE;
		this.AVOID_DISTANCE = Boid.AVOID_DISTANCE;
		this.ALIGN_DISTANCE = Boid.ALIGN_DISTANCE;
		this.ATTEND_DISTANCE = Boid.ATTEND_DISTANCE;
		this.ATTEND_AVOID_DISTANCE = Boid.ATTEND_AVOID_DISTANCE;
		this.AVOID_WALLS_DISTANCE = Boid.AVOID_WALLS_DISTANCE;
		this.AVOID_WALLS_FORCE = Boid.AVOID_WALLS_FORCE;
		this.FLOCK = Boid.FLOCK;
	}();
	var values = new function() {
		this.followPoint=false;
		this.animate = false;
		this.addBoid=function(){flock.addBoid();};
		this.goToNewPoint=function(){boid.position.set(Math.random()*200-100, Math.random()*200-100,  Math.random()*200-100);
									 flock.flockTo(boid.position);};
	}();
	var w = gui.addFolder('Weights');
		w.add(weights, 'VELOCITY', 0, 100).onChange(function(v){Boid.WEIGHT.VEL=v});
		w.add(weights, 'position', 0, 100).onChange(function(v){Boid.WEIGHT.pos=v});
		w.add(weights, 'avoid', 0, 100).onChange(function(v){Boid.WEIGHT.avd=v});
		w.add(weights, 'velocity', 0, 100).onChange(function(v){Boid.WEIGHT.vel=v});
	var f = gui.addFolder('Boid Values');
		f.add(boidsv, 'MAX_SPEED', 0, 20).onChange(function(v){Boid.MAX_SPEED=v});
		f.add(boidsv, 'MAX_FORCE', 0, 20).onChange(function(v){Boid.MAX_FORCE=v});
		f.add(boidsv, 'AVOID_DISTANCE', 0, 250).onChange(function(v){Boid.AVOID_DISTANCE=v});
		f.add(boidsv, 'ALIGN_DISTANCE', 0, 250).onChange(function(v){Boid.ALIGN_DISTANCE=v});
		f.add(boidsv, 'ATTEND_DISTANCE', 0, 250).onChange(function(v){Boid.ATTEND_DISTANCE=v});
		f.add(boidsv, 'ATTEND_AVOID_DISTANCE', 0, 50).onChange(function(v){Boid.ATTEND_AVOID_DISTANCE=v});
		f.add(boidsv, 'AVOID_WALLS_DISTANCE', 1, 250).onChange(function(v){Boid.AVOID_WALLS_DISTANCE=v});
		f.add(boidsv, 'AVOID_WALLS_FORCE', 1, 100).onChange(function(v){Boid.AVOID_WALLS_FORCE=v});
		f.add(boidsv, 'FLOCK').onChange(function(v){Boid.FLOCK=v});

	gui.add(values, 'animate').onChange(function(v){animating = !animating;});
	gui.add(values, 'followPoint').onChange(function(v){followPoint=!followPoint;});
	gui.add(values, 'addBoid');
	gui.add(values, 'goToNewPoint');

//Run
	run();
}


/*Run-> constatly called*/
function run() {
	//Update orbit controls
	control.update();

	//If animating
	if(animating) {
		//If followingPoint -> update position to follow
		if(followPoint) {
			dt += .008;
			boid.position.set(Math.sin(dt)*200, -200, Math.cos(dt)*200);
			flock.flockTo(boid.position);
		}

		//Update flock
		flock.update();
	}

	//Render and call run again
	renderer.render(scene, camera);
	requestAnimationFrame(run);
}

/*Create walls -> called in onLoad()*/
function createWalls() {
	//Size and spacing variables
	var s = 500, d = 3, S = 1000;

	//Colors
	var r = 0x990000,
		g = 0x009900,
		b = 0x000099;

	//Ceiling and floor
	var ceil = new THREE.Mesh(
					new THREE.PlaneGeometry(S, S, 100, 100),
					new THREE.MeshBasicMaterial({color:r, side:THREE.DoubleSide})
				   	);
		ceil.position.set(0, s, 0);
		ceil.rotation.set(Math.PI/2, 0, Math.PI/2);
	var flrr = new THREE.Mesh(
					new THREE.PlaneGeometry(S, S, 100, 100),
					new THREE.MeshBasicMaterial({color:r, side:THREE.DoubleSide})
				   	);
		flrr.position.set(0, -s, 0);
		flrr.rotation.set(Math.PI/2, 0, Math.PI/2);

	//North and South wall
	var nrth = new THREE.Mesh(
					new THREE.PlaneGeometry(S, S, 100, 100),
					new THREE.MeshBasicMaterial({color:g, side:THREE.DoubleSide})
					);
		nrth.position.set(0, 0, s);
		nrth.rotation.set(0, 0, 0);
	var soth = new THREE.Mesh(
					new THREE.PlaneGeometry(S, S, 100, 100),
					new THREE.MeshBasicMaterial({color:g, side:THREE.DoubleSide})
					);
		soth.position.set(0, 0, -s);
		soth.rotation.set(0, 0, 0);

	//East and West wall
	var east = new THREE.Mesh(
					new THREE.PlaneGeometry(S, S, 100, 100),
					new THREE.MeshBasicMaterial({color:b, side:THREE.DoubleSide})
					);
		east.position.set(s, 0, 0);
		east.rotation.set(Math.PI/2, Math.PI/2, 0);
	var west = new THREE.Mesh(
					new THREE.PlaneGeometry(S, S, 100, 100),
					new THREE.MeshBasicMaterial({color:b, side:THREE.DoubleSide})
					);
		west.position.set(-s,0, 0);
		west.rotation.set(Math.PI/2, Math.PI/2, 0);

	//Add them all to the scene
	scene.add(ceil);
	scene.add(flrr);
	scene.add(nrth);
	scene.add(soth);
	scene.add(east);
	scene.add(west);
}
		
/*Create Lights -> Called from onLoad()*/
function createLight() {

}
