/**
 * @class		Flock
 * @author		snkemp
 * @date		15 Feb 2016
 * @description
 * 		Represents a flock of Boids. Requires B.js, THREE.js.
 */

/*Constructor*/
Flock.prototype.constructor = Flock;
function Flock(scene, size) {
	//We need a size of the flock
	if(size == undefined || size == null) size = 10;
	this.flock = [];

	//Random value to give boids random pos and vel
	this.p = function() {return Math.random()*500 - 250};
	this.v = function() {return Math.random()*10 - 5};

	//Need a scene
	this.scene = scene;

	//Add some boids
	for(var i=0; i<size; i++)
		this.addBoid();
}


/*Update all boids' position*/
Flock.prototype.update =
function() {
	//Have all boids tend with and away from this flock
	for(var i=0; i<this.flock.length; i++) {
		this.flock[i].update(this.flock);
	}
}

/*Flock to a specific point*/
Flock.prototype.flockTo=
function(point) {
	console.log("Flocking to: [%s %s, %s]", point.x.toFixed(2), point.y.toFixed(2), point.z.toFixed(2));

	//Have all boids flock to this point
	for(var i=0; i<this.flock.length; i++)
		this.flock[i].flockTo(point);
}

/*Add boid to flock*/
Flock.prototype.addBoid =
function() {
	var b = new Boid(new THREE.Vector3((this.p()), (this.p()), (this.p())),
					 new THREE.Vector3((this.v()), (this.v()), (this.v())));
	this.flock.push(b);
	this.scene.add(this.flock[this.flock.length-1]);
}
