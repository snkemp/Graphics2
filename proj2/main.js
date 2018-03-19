/* ""Hardware"" */
var container, renderer, scene, camera, controls, animating, gui;

/*Variables*/
var grid, me, ground, sx,sy, fx, fy;
var solution, found;
function onload() {
	//Get container
	container = document.getElementById('container');

	//Create a renderer and add to container
	renderer = new THREE.WebGLRenderer({antialias:true});
	renderer.setSize(window.offsetWidth, window.offsetHeight);
	container.appendChild(renderer.domElement);

	//Create a camera and a scene
	camera = new THREE.PerspectiveCamera(50, window.innerWidth/window.innerHeight, 1, 10000);
	camera.position.set(0, 1, 0);
	scene = new THREE.Scene();
	scene.add(camera);

	//CameraControls
	control = new CameraControl(camera, function(){console.log("Tes")});

	//Add resize listener
	var resize = function() {
		camera.aspect = window.innerWidth/window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize(window.innerWidth, window.innerHeight);
	}
	window.addEventListener('resize', resize, false);
	resize();

	//Create gui
	animating = true;
	gui = new dat.GUI();
	var values = new function() {
		this.startRandLoc = false;
		this.gridSize = 10;
		this.resetBoard = reset;
		this.solvePuzzle = solve;
		this.animating = function(){animating = !animating;};
	}();
	gui.startRandLoc = false;
	gui.gridSize = 3;
	gui.nextGridSize = 3;
	gui.add(values, 'startRandLoc').onChange(function(i){gui.startRandLoc=i;});
	gui.add(values, 'gridSize', 3, 100).onChange(function(i){gui.nextGridSize=i;gui.nextGridSize -= gui.nextGridSize%1;});
	gui.add(values, 'resetBoard');
	gui.add(values, 'solvePuzzle');
	gui.add(values, 'animating');
	found = false;
	solution = null;
	sx=0;
	sy=0;
	fx=0;
	fy=0;
	reset();
	run();
}

function reset() {
	gui.gridSize = gui.nextGridSize;
	found = false;
	solution = null;
	if(gui.startRandLoc==true) {
		sx = Math.floor(Math.random()*(gui.gridSize-2));
		sy = Math.floor(Math.random()*(gui.gridSize-2));
		fx = Math.floor(Math.random()*(gui.gridSize-2));
		fy = Math.floor(Math.random()*(gui.gridSize-2));
	}
	else {
		sx = Math.floor(Math.random()*gui.gridSize);
		sy = 0;
		fx = Math.floor(Math.random()*gui.gridSize);
		fy = gui.gridSize-1;

	}
	if(ground!=null)scene.remove(ground);
	ground = new THREE.Mesh();
	ground.position.set(0, 0, 0);
	//Init array
	grid = [];
	for(var x = 0; x < gui.gridSize; x++) {
		grid.push([]);
		for(var y = 0; y < gui.gridSize; y++) {
			grid[x].push(new Node(x, y, sx, sy, fx, fy));
			grid[x][y].calculateH(fx, fy);
			ground.add(grid[x][y].mesh);
		}
	}
	scene.add(ground);
	ground.position.set(0, 0, 0);
	camera.position.set(gui.gridSize/2, 2*gui.gridSize, gui.gridSize/2);
	camera.lookAt(0, 0, 0);
	console.log("Created an "+gui.gridSize+"x"+gui.gridSize+" grid.");

	var geom = new THREE.SphereGeometry(.3,32, 32);
	var matl = new THREE.MeshBasicMaterial({color:0x00ffff});
	if(me!=null)scene.remove(me);
	me = new THREE.Mesh(geom, matl);
	me.position.set(sx, 0, sy);
	me.nextX = sx;
	me.nextY = sy;
	scene.add(me);
}

function solve() {
	var start = {x: sx, y:sy};
	var goal =  {x: fx, y:fy};
	var a = A(grid, start, goal);
	if(a == null) {
		console.log("This puzzle is unsolvable");
		return;
	}

	solution =[];
	solution.count = 0;
	for(var i=a.length-2;i>=0;i--)
		solution.push(a[i]);
	found = true;
}

function run() {
	control.update();

	if(animating){
	if(!found)	printGrid();
	else printSolution();
	if(me.position.x==me.nextX&&me.position.z==me.nextY) {	
		if(solution != null)if(solution.count != null)//Make sure things arent undefined
		if(solution.count < solution.length) {
			me.nextX = solution[solution.count].x;
			me.nextY = solution[solution.count].y;
			solution.count++;
		}
	}
	else {
		me.position.x = me.nextX;
		me.position.y = me.nextY;
	}
	}
	renderer.render(scene, camera);
	requestAnimationFrame(run);
}

function printGrid() {
	var t = "";
	for(var i=0; i<gui.gridSize;i++) {
		for(var j=0; j<gui.gridSize;j++) {
			var s = ""+grid[i][j].speed;
			if(sx == i && sy == j) s = "*";
			if(fx == i && fy == j) s = "^";
			t += "" + s;
		}
		t += "\n";
	}
	console.log(t);
}

function printSolution() {
	var t = [];
	var total = 0;
	for(var i=0; i<gui.gridSize; i++) {
		t.push([]);
		for(var j=0; j<gui.gridSize; j++) {
			var s = ""+grid[i][j].speed;
			total += grid[i][j].speed;
			if(sx == i && sy == j) s = "*";
			else if(fx == i && fy == j) s = "^";
			else if(grid[i][j].parentNode != null) s = "+";
			t[i].push(s);
		}
	}
	for(var c=0; c<solution.length;c++) {
		t[solution[c].x][solution[c].y] = "+";
	}

	var s = "";
	for(var i=0;i<gui.gridSize;i++) {
		for(var j=0;j<gui.gridSize;j++) {
			s += t[i][j];
		}
		s += "\n";
	}
	console.log(s+'Total: ' + total);
}

function random(min, max) {
	var temp = (Math.random()*(max-min+1))+min;
	temp -= temp%1;
	return temp;
}
