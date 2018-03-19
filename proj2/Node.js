/**
 * Class: Node
 * Author: snkemp
 */
Node.prototype.constuctor = Node;
function Node(u, v, sx, sy, fx, fy) {
	this.pos = {x:u, y:v};
	this.cameFrom = null;
	this.parentNode = null;
	this.g = 0;
	this.h = 10*(Math.abs(u-fx)+Math.abs*v-fy);
	this.f = 0;
	this.speed=(Math.random()*3)+1;
	this.speed-=this.speed%1;
	var c = 0xffffff;
	if(this.speed==1) c=0xff0000;
	else if(this.speed==2) c=0x00ff00;
	else if(this.speed==3) c=0x0000ff;
	if(u==sx&&v==sy)  c=0x000000;
	if(u==fx&&v==fy)  c=0xffffff;
	var matl = new THREE.MeshBasicMaterial({color:c, side:THREE.DoubleSide});
	var geom = new THREE.PlaneGeometry(1, 1, 1, 1);
	this.mesh = new THREE.Mesh(geom, matl);
	this.mesh.position.set(this.pos.x,0,this.pos.y);
	this.mesh.rotation.set(-Math.PI/2, 0, 0);
}

Node.prototype.calculateH = function(u, v) {
	this.h = Math.abs(this.x-u) + Math.abs(this.y-v);
}

Node.prototype.setG = function(q) {
	this.g = q;
}

Node.prototype.clone = function() {
	var temp = new Node(this.pos.x, this.pos.y);
	temp.cameFrom = this.cameFrom;
	temp.speed = this.speed;
	temp.g = this.g;
	temp.h = this.h;
	return temp;
}

Node.prototype.is = function(t) {
	if(t === undefined || t === null) return false;
	if(t.pos === undefined || t === null) return false;
	return t.pos.x == this.pos.x && t.pos.y == this.pos.y;
}

Node.prototype.toValue = function() {
	if(this.g == -1) return this.h;
	else return this.f;
}
