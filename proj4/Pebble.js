/**
 * Pebble class
 * @author  snkemp
 * @date	17 March 2016
 * @descr	A pebble that can be dropped into water
 */

/*Create class*/
Pebble.prototype = new THREE.Mesh();
Pebble.prototype.constructor = Pebble;

/*Static variables*/
Pebble.STATE = {
	NIL: -1,
	AIR:0,
	WATER:1,
	GROUND:2
};
Pebble.GRAVITY = .1;
Pebble.SWAY = function(v) {
	if(v == null) v = .1;
	return 2.0*Math.random()*v - v;
}
Pebble.WATER_SPEED = .1;

/*Constructor*/
function Pebble(pos, vel, acc, tim) {
	var temp = new THREE.Mesh();
	THREE.Mesh.call(this);

	var randomColor = Math.floor(Math.random()*16777215).toString(16);
		randomColor = 0xffff00;
	this.geometry = new THREE.SphereGeometry(1);
	this.material = new THREE.MeshBasicMaterial({color:randomColor});

	if(this.position == undefined) this.position = new THREE.Vector3();
	if(pos == null) pos = new THREE.Vector3();
	this.position.set(pos.x, pos.y, pos.z);
	
	if(this.velocity == undefined) this.velocity = new THREE.Vector3();
	if(vel == null) vel = new THREE.Vector3();
	this.velocity.set(vel.x, vel.y, vel.z);
	
	if(this.acceleration == undefined) this.acceleration = new THREE.Vector3();
	if(acc == null) acc = new THREE.Vector3();
	this.acceleration.set(acc.x, acc.y, acc.z);

	this.state = Pebble.STATE.AIR;
	this.pStat = Pebble.STATE.NIL;
	this.time  = tim || 0;
}

/*Update*/
Pebble.prototype.update =
function(water, ground) {
	if(water == null || ground == null) return false;
	this.pStat = this.state;
	switch(this.state) {
		case Pebble.STATE.AIR:
			//Update pos, vel, acc
			this.acceleration.y -= this.acceleration.y < -5 ? Pebble.GRAVITY: 0;
			this.velocity.add(this.acceleration);
			this.position.add(this.velocity.clone().normalize().multiplyScalar(.5));
			//If within the circle of water
			var dx = this.position.x - water.position.x, dz = this.position.z - water.position.z, r = water.geometry.radius ? water.geometry.radius  : 220;
			if (dx*dx+dz*dz < r*r) {
				//If hitting water -> Change state to WATER
				if(this.position.y <= water.position.y + .01) {
						this.state = Pebble.STATE.WATER;
						this.pStat = Pebble.STATE.AIR;
				}
			}
			//Else we are outside the circle
			//&&We are about to hit the ground -> Change state to GROUND
			else if(this.position.y <= 0){
					this.state = Pebble.STATE.GROUND;
					this.pStat = Pebble.STATE.AIR;
			}
			break;
		case Pebble.STATE.WATER:
			//Just slowly meander down 
			this.position.y -= Pebble.WATER_SPEED;
			this.position.x += Pebble.SWAY();
			this.position.z += Pebble.SWAY();
			if(this.position.y <= .1) {
				this.state = Pebble.STATE.GROUND;
				this.pStat = Pebble.STATE.WATER;
			}
			break;
		case Pebble.STATE.GROUND:
			break;
	}
	if(this.position.y < 0) this.position.y = 0;
}

Pebble.prototype.justHitWater = function() {
	return this.state == Pebble.STATE.WATER && this.pStat == Pebble.STATE.AIR;
}

Pebble.prototype.justHitGround = function() {
	return false;
}
