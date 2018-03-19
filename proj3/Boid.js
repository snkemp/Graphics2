/**
 * @class 		Boid
 * @author		snkemp
 * @date		13 Feb 2016
 * @description
 * 		Describes an object that behaves like a bird in a flock
 * 		Needs to account for- other Boids, obstacles, walls, etc...
 * 		Will be implemented by the Flock class
 */

/*Create class*/
Boid.prototype = new THREE.Mesh();
Boid.prototype.constructor = Boid;

/*Make static variables*/
//Max speed and force can be applied
Boid.MAX_SPEED = 5;
Boid.MAX_FORCE = 1;

//Min distance to take boid into account
Boid.AVOID_DISTANCE = 25;
Boid.ALIGN_DISTANCE = 50;
Boid.ATTEND_DISTANCE= 50;
Boid.ATTEND_AVOID_DISTANCE= 15;

//Avoid walls
Boid.AVOID_WALLS_DISTANCE = 20;
Boid.AVOID_WALLS_FORCE = 10;

//Flag to flock with all boids
Boid.FLOCK = false;

//Weights
Boid.WEIGHT = {
	VEL: 0, //Tend to follow own VELOCITY		(Do your own thing)
	pos: 10, //Tend toward common position		(Cohesion)
	avd: 15, //Tend away from those close		(Seperation)
	vel: 10  //Tend towards everyones velocity	(Alignment)
};

/*Constructor*/
function Boid(pos, vel, acc) {
	//Mesh to draw
	THREE.Mesh.call(this);
	this.geometry = new THREE.SphereGeometry(1, 32, 32);
	this.material = new THREE.MeshBasicMaterial({color:0xffff00});

	//Position, velocity, acceleration
	this.position =    pos == null ? new THREE.Vector3(0, 0, 0) : pos;
	this.velocity =    vel == null ? new THREE.Vector3(0, 0, 0) : vel;
	this.acceleration= acc == null ? new THREE.Vector3(0, 0, 0) : acc;

	//To control updation of position/velocity
	// ************
	// way too big a time step; makes things "jiggle"!
	//this.dt = 1;
	this.dt = .1;
	this.speed = 1;
}

/*Update POSITION based off of VELOCITY*/
Boid.prototype.update = 
function(flock) {
	/*Flock*/
	this.tend(flock);

	/*Update*/
	//Add ACCELERATION to  VELOCITY and give SPEED a value
	this.velocity.add(this.acceleration);
	this.speed = this.velocity.length();

	// Reset so SPEED <=  MAXSPEED
	if (this.speed > Boid.MAX_SPEED)
		this.speed = Boid.MAX_SPEED;

	//Multiply VELOCITY by it's WEIGHT and scale to SPEED
	//this.velocity.multiplyScalar(Boid.WEIGHT.VEL);
	this.velocity.normalize();
	this.velocity.multiplyScalar(this.dt*this.speed);

	//Update POSITION based off of VELOCITY and reset ACCELERATION
	this.position.add(this.velocity);
	this.acceleration.set(0, 0, 0);

	//Avoid walls
	this.OB();

}

/*Tend towards\away from all influences*/
Boid.prototype.tend =
function(flock) {
	//Avoid those close to you
	//Attend to the flock position
	//Align with other boids
	var avoid = this.avoid(flock);//Seperation
	var atend = this.atend(flock);//Cohesion
	var align = this.align(flock);//Alignment

	//Apply WEIGHT to tending vectors
	avoid.setLength(Boid.WEIGHT.avd);
	atend.setLength(Boid.WEIGHT.pos);
	align.setLength(Boid.WEIGHT.vel);

	//Add to ACCELERATION
	this.acceleration.add(avoid);
	this.acceleration.add(atend);
	this.acceleration.add(align);
}

/*Returns the vector to avoid other boids*/
Boid.prototype.avoid =
function(flock) {
	var COUNT = 0; 							//How many boids we are avoiding
	var VECTOR = new THREE.Vector3(0, 0, 0);//Vector to return

	//For all boids
	for(var i=0; i<flock.length; i++) {	
		//Dont avoid ourselves
		if(flock[i] == this) continue;

		//If we are too close to this boid-> need to avoid it
		var distance = this.dist(flock[i]);
		if (distance < Boid.AVOID_DISTANCE || Boid.FLOCK) {
			//Get an arrow from them to this and scale by distance

			// *******************************************
			// you actually want an arrow from them to this
			// so that you are pushing away from them

			var vector = new THREE.Vector3();
				vector.subVectors(this.position, flock[i].position);
				vector.normalize();
				vector.divideScalar(distance);
			//Add to VECTOR, increase number of boids we avoid
			VECTOR.add(vector);
			COUNT++;
		}
	}

	//If we have things to avoid -> average VECTOR
	if (COUNT > 0)
		VECTOR.divideScalar(COUNT);

	//If we are goind somewhere
	if(VECTOR.length() > 0) {
		//Reynolds
		VECTOR.setLength(Boid.MAX_SPEED);
		VECTOR.sub(this.velocity);
		if (VECTOR.length() > Boid.MAX_FORCE)
			VECTOR.setLength (Boid.MAX_FORCE);
	}
	return VECTOR;
}

/*Returns the vector to align with other boids*/
Boid.prototype.align =
function(flock) {
	var VECTOR = new THREE.Vector3(0, 0, 0);//Vector to return
	var COUNT  = 0;							//Number of boids we are aligning with

	//For all boids
	for(var i=0; i<flock.length; i++) {
		//Don't align ourself with ourself
		if(flock[i] == this) continue;

		//If close to this other boid
		var distance = this.dist(flock[i]);
		if (distance < Boid.ALIGN_DISTANCE || Boid.FLOCK) {
			//Align ourselves, increase number we are aligning with
			VECTOR.add(flock[i].velocity);
			COUNT++;
		}
	}

	//If aligning with anybody
	if(COUNT > 0) {
		//Average VECTOR
		VECTOR.divideScalar(COUNT);

		//Reynolds
		VECTOR.normalize();
		VECTOR.multiplyScalar(Boid.MAX_SPEED);
		var vector = new THREE.Vector3();


		// ************************************************
		// note that this is not what was specified. this 
		// gives a vector that give a "push" toward the avg velocity

			vector.subVectors(VECTOR, this.velocity);
		if (vector.length() > Boid.MAX_FORCE)
			vector.setLength (Boid.MAX_FORCE);
		return vector;
	}
	//Not aligning with anybody-> return (0,0,0)
	return VECTOR;
}

/*Returns the vector to stay with other boids*/
Boid.prototype.atend =
function(flock) {
	var VECTOR = new THREE.Vector3(0, 0, 0);//Vector to return
	var COUNT = 0;							//Number of boids we are staying with

	//For all boids
	for(var i=0; i<flock.length; i++) {
		//Dont flock to our position
		if(flock[i] == this) continue;

		//If close, add position to flock position, increase count
		var distance = this.dist(flock[i]);
		if (distance < Boid.ATTEND_DISTANCE || Boid.FLOCK) {
			VECTOR.add(flock[i].position);
			COUNT++;
		}
	}

	//If flocking to anybody
	if (COUNT > 0) {
		//Average VECTOR
		VECTOR.divideScalar(COUNT);

		//Create vector that points towards the point (VECTOR)
		var vector = new THREE.Vector3();
			vector.subVectors(VECTOR, this.position);

		//If too close to the flock position -> return no direction
		if(vector.length() < Boid.ATTEND_AVOID_DISTANCE)
			return new THREE.Vector3(0,0,0);

		//Reynolds: Desired-Velocity
		vector.setLength(Boid.MAX_SPEED);

		//********************************************************************
		// and similar to above, this pushes back against the current velocity
		// but isn't what was specified
		vector.sub(this.velocity);
		return vector;
	}

	//Not flocking to anyone-> return (0, 0, 0)
	return VECTOR;
}

/*This will flock to a point, tend() should be called immediately after calling flockTo()*/
Boid.prototype.flockTo =
function(point) {
	//Only flock to a specific point
	if(point == undefined || point == null) return;
	
	//Create a vector that points to point from this
	var vector = new THREE.Vector3();
		vector.subVectors(point, this.position);
	
	//Add to acceleration
	this.acceleration.add(vector);	
}

/*Can handle going OB*/
Boid.prototype.OB =
function() {
	if (this.position.x + Boid.AVOID_WALLS_DISTANCE*this.velocity.x < -500) {
		var dist = this.position.x + 500;
		var v = new THREE.Vector3(-500, this.position.y, this.position.z);
			v.normalize();
			v.divideScalar(dist/Boid.AVOID_WALLS_FORCE);
		this.acceleration.add(v);
	}
	if (this.position.x + Boid.AVOID_WALLS_DISTANCE*this.velocity.x > 500) {
		var dist = this.position.x - 500;
		var v = new THREE.Vector3(500, this.position.y, this.position.z);
			v.normalize();
			v.divideScalar(dist/Boid.AVOID_WALLS_FORCE);
		this.acceleration.add(v);
	}
	if (this.position.y + Boid.AVOID_WALLS_DISTANCE*this.velocity.y < -500) {
		var dist = this.position.y + 500;
		var v = new THREE.Vector3(this.position.x, -500, this.position.z);
			v.normalize();
			v.divideScalar(dist/Boid.AVOID_WALLS_FORCE);
		this.acceleration.add(v);
	}
	if (this.position.y + Boid.AVOID_WALLS_DISTANCE*this.velocity.y > 500) {
		var dist = this.position.y - 500;
		var v = new THREE.Vector3(this.position.x, 500, this.position.z);
			v.normalize();
			v.divideScalar(dist/Boid.AVOID_WALLS_FORCE);
		this.acceleration.add(v);
	}
	if (this.position.z + Boid.AVOID_WALLS_DISTANCE*this.velocity.z < -500) {
		var dist = this.position.z + 500;
		var v = new THREE.Vector3(this.position.x, this.position.y, -500);
			v.normalize();
			v.divideScalar(dist/Boid.AVOID_WALLS_FORCE);
		this.acceleration.add(v);
	}
	if (this.position.z + Boid.AVOID_WALLS_DISTANCE*this.velocity.z > 500) {
		var dist = this.position.z - 500;
		var v = new THREE.Vector3(this.position.x, this.position.y, 500);
			v.normalize();
			v.divideScalar(dist/Boid.AVOID_WALLS_FORCE);
		this.acceleration.add(v);
	}

	this.position.x = this.position.x >  600 
			    ? 0 : this.position.x < -600
			    ? 0 : this.position.x;

	this.position.y = this.position.y >  600
			    ? 0 : this.position.y < -600
			    ? 0 : this.position.y;

	this.position.z = this.position.z > 600
			    ? 0: this.position.z < -600
			    ? 0: this.position.z;
}

/*Returns the distance to another obj*/
Boid.prototype.dist =
function(obj) {
	var vector = new THREE.Vector3();
		vector.subVectors(this.position, obj.position);
	return vector.length();
}

/*toString*/
Boid.prototype.toString =
function() {
	return "Boid {"+"P: "+this.toPosition()+", "+
					"V: "+this.toVelocity()+", "+
					"A: "+this.toAcceleration()+"}";
}

/*toPosition*/
Boid.prototype.toPosition =
function() {
	return "[ "+this.position.x.toFixed(2)+", "+
				this.position.y.toFixed(2)+", "+
				this.position.z.toFixed(2)+"]";
}

/*toVelocity*/
Boid.prototype.toVelocity =
function() {
	return "[ "+this.velocity.x.toFixed(2)+", "+
				this.velocity.y.toFixed(2)+", "+
				this.velocity.z.toFixed(2)+"]";
}

/*toAcceleration*/
Boid.prototype.toAcceleration =
function() {
	return "[ "+this.acceleration.x.toFixed(2)+", "+
				this.acceleration.y.toFixed(2)+", "+
				this.acceleration.z.toFixed(2)+"]";
}
