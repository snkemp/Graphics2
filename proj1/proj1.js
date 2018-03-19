var renderer = null,
	container = null,
	scene = null,
	camera = null,
	camControl = null,
	walls = [],
	floor = null,
	lights = [];
var walker, gravity;

function onLoad() {
	init();
	walker = new createWalker();
	createGUI();
	run();
}

function init() {
	// Grab our container div
	container = document.getElementById('container');
	// Create the Three.js renderer, add it to our div
	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setSize(container.offsetWidth, container.offsetHeight);
	container.appendChild( renderer.domElement );
	// Create a new Three.js scene
 	scene = new THREE.Scene();
	scene.fog = new THREE.FogExp2(0xe1e1e1, 0.0025);
	// Put in a camera
    camera = new THREE.PerspectiveCamera(50, container.offsetWidth / container.offsetHeight, .1, 4000 );
	camera.position.set( 0, 4, 0 );
	camera.lookAt((new THREE.Vector3(0, 3, 1)).normalize());
	scene.add(camera);
	camControl = new CameraControl(camera);
	//Add a resize listener
	window.addEventListener('resize', onWindowResize, false);
	onWindowResize();


	//Walls
	var fgeom = new THREE.PlaneGeometry(100, 100, 100, 100);
	var fmatl = new THREE.MeshNormalMaterial({color: 0xa2cf12, side: THREE.DoubleSide});
	floor = new THREE.Mesh(fgeom, fmatl);
	floor.position = new THREE.Vector3(0, 0, 0);
	walls.push(floor);
	scene.add(floor);
	//for(var n = 0; n < walls.length; n++)
	//	scene.add(walls[n]);
	
	
	//Lights
	var amb = new THREE.AmbientLight('#505050');
	scene.add(amb);
}
function createGUI() {
	var values = new createValues();
	gui = new dat.GUI();

	var np = gui.add(values, 'numPieces', 0, 100).step(1);
	np.onChange(function(value) {
	});
	np.onFinishChange(function(value) {
		walker.setSize(value);
		walker.tellConsole();
	});

	var cl = gui.addColor(values, 'color');
	cl.onChange(function(value) {
		walker.setColor(value);
		walker.tellConsole();
	});
	cl.onFinishChange(function(value) {
	});

	var ct = gui.add(values, 'controlled');
	ct.onChange(function(value) {
		walker.toggleControl();
		walker.tellConsole();
	});
	ct.onFinishChange(function(value) {
	});
}
var createValues = function() {
	this.numPieces = 1;
	this.color = '#e2d91f';
	this.controlled = false;	
};
var  createWalker = function() {
	return new Walker();
};

function run()
{	console.log("We runnin\'");
	walker.tellConsole();
	// Render the scene
	renderer.render( scene, camera );
	
	walker.updatePosition();
	walker.updateVelocity();
	walker.updateAcceleration(gravity);
	walker.checkPosition(walls);
	console.log('Camera Position: ' + camera.position.x +'.'+ camera.position.y +'.'+ camera.position.z);
	console.log('Plane Position: ' + floor.position.x+'.'+floor.position.y+'.'+floor.position.z);
	// Ask for another frame
	requestAnimationFrame(run);
}

function onWindowResize() {
	var N = 20;
	camera.aspect = (window.innerWidth-N)/(window.innerHeight-N);
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth-N, window.innerHeight-N);
}
