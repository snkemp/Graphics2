/************************************************/
/*                                              */
/* Class CameraControl                          */
/*                                              */
/* Inherits from: Base class                    */
/*                                              */
/* Purpose:  allow keyboard input to control    */
/*	     camera				*/
/*                                              */
/* Author:   michael branton                    */
/*                                              */
/* Date:     Sept 19, 2015                      */
/*                                              */
/* Revisons:                                    */
/*     @author snkemp - Nov 3, 2015             */
/*     Redid a whole bunch. I changed what each */
/*     button does and allowed for jumping and  */
/*     constant movement. Speeds are different.	*/
/************************************************/

// constructor
function CameraControl(camera, func)
{
	this.speed=2;			// default speed of all movement
	this.turnSpeed=Math.PI/64; //Turn Speed duh
	this.deltas = 0.1;		// speed increase/decreas increment
	this.camera=camera;		// the camera to be controlled
	this.func = func;		// The function to be called when a shot needs to be fired
	this.phi=Math.PI/2;		// angle from the vertical
    this.theta=-Math.PI/32;	// angle in the x-z plane
    this.upVector=new THREE.Vector3(0,Math.cos(this.phi),0);	// up direction for the camera
    this.directionVector=new THREE.Vector3(	Math.cos(this.theta),	// direction the camera is looking
				0,
				Math.sin(this.theta));

     this.lookAtPoint=new THREE.Vector3(
					 	this.camera.position.x+this.directionVector.x,
						this.camera.position.y+this.directionVector.y,
						this.camera.position.z+this.directionVector.z);	// point the camera is looking at
    this.camera.lookAt(this.lookAtPoint);
	

	this.forward = false;
	this.backward = false;
	this.left = false;
	this.right = false;
	this.rotateLeft = false;
	this.rotateRight = false;
	this.rotateDown = false;
	this.rotateUp = false;
	// bind to keydown event
	document.addEventListener("keydown", bind( this, this.onKeyDown ));
	document.addEventListener("keyup", bind(this, this.onKeyUp));
}

// response to keyboard events
CameraControl.prototype.onKeyDown = function(event)
{ 
	var keyCode = event.which;
    	if(keyCode==83) //s move back
        {
			this.backward = true;
		}
        else if(keyCode==87) //w move forward
        {
			this.forward = true;
 		}
        else if(keyCode==65) // a  rotate left
        {
			this.rotateLeft = true;
		}
        else if(keyCode==68) // d  rotate right
        {
			this.rotateRight = true;
		}
		else if(keyCode==37) //left arrow moveLeft
		{
			this.left = true;
		}
        else if(keyCode==38)  // up arrow rotate up
        {
			this.rotateUp = true;
        }
		else if(keyCode==39) //Right Arrow moveRight
		{
			this.right = true;
		}
		else if(keyCode==40) //Down Arrow rotate down
		{
			this.rotateDown = true;
		}
		else if(keyCode==32) //Space - fire
		{
			this.func();
			this.camera.rotation.set(0, 0, 0);
		}
		else if(keyCode==16)//Shift
		{
			this.speed = 5;
		}
        this.camera.lookAt(this.lookAtPoint);
}

CameraControl.prototype.onKeyUp =
function(event) {
	var keyCode = event.which;
    	if(keyCode==83) //s move back
        {
			this.backward = false;
		}
        else if(keyCode==87) //w move forward
        {
			this.forward = false;
 		}
        else if(keyCode==65) // a  rotate left
        {
			this.rotateLeft = false;
		}
        else if(keyCode==68) // d  rotate right
        {
			this.rotateRight = false;
		}
		else if(keyCode==37) //left
		{
			this.left = false;
		}
		else if(keyCode==38) //UP
		{
			this.rotateUp = false;
		}
		else if(keyCode==39) //right
		{
			this.right = false;
		}
		else if(keyCode==40) //Down
		{
			this.rotateDown = false;
		}
        else if(keyCode==32)  // Space
        {
        }
		else if(keyCode==16) //Shift
		{
			this.speed = 2;
		}
        this.camera.lookAt(this.lookAtPoint);
}

CameraControl.prototype.update =
function() {
	if(this.draw)
		this.strength+= 2;
	if(this.fire) {
		this.fire = false;
		this.func(this.strength);
		this.strength = 0;
	}
   	if(this.backward) //s move back
	{
			this.camera.position.x -= this.speed*this.directionVector.x;
			this.camera.position.z -= this.speed*this.directionVector.z;
			this.lookAtPoint.x -= this.speed*this.directionVector.x;
			this.lookAtPoint.z -= this.speed*this.directionVector.z;
	}
	if(this.forward) //w move forward
	{
			this.camera.position.x += this.speed*this.directionVector.x;
			this.camera.position.z += this.speed*this.directionVector.z;
			this.lookAtPoint.x += this.speed*this.directionVector.x;
			this.lookAtPoint.z += this.speed*this.directionVector.z;
	}
	if(this.rotateLeft) // a  rotate left
	{
			this.theta-=this.turnSpeed;
			this.directionVector.x=Math.cos(this.theta);
			this.directionVector.z=Math.sin(this.theta);
			this.lookAtPoint.x=this.camera.position.x+this.directionVector.x;
			this.lookAtPoint.z=this.camera.position.z+this.directionVector.z;
	}
	if(this.rotateRight) // d  rotate right
	{
			this.theta+=this.turnSpeed;
			this.directionVector.x=Math.cos(this.theta);
			this.directionVector.z=Math.sin(this.theta);
			this.lookAtPoint.x=this.camera.position.x+this.directionVector.x;
			this.lookAtPoint.z=this.camera.position.z+this.directionVector.z;
	}
	if(this.rotateDown)
	{
			this.directionVector.y -= Math.PI/60;
			this.lookAtPoint.y = this.camera.position.y+this.directionVector.y;
	}
	if(this.rotateLeft)
	{
			this.directionVector.y += Math.PI/60;
			this.lookAtPoint.y = this.camera.position.y+this.directionVector.y;
	}
	if(this.left)
	{
			this.camera.position.x += 0;
			this.camera.position.z += 0;
	}
	if(this.right) 
	{

	}
/*
	if(camera.position.x < -490)
		camera.position.x = -490;
	if(camera.position.x > 490)
		camera.position.x = 490;
	if(camera.position.y < 40) {
		camera.position.y = 40;
		this.lookAtPoint.y = 40;
		this.jumped = false;
		this.jump = 0;
	}
	if(camera.position.y > 90)
		camera.position.y = 90;
	if(camera.position.z < -490)
		camera.position.z = -490;
	if(camera.position.z > 490)
		camera.position.z = 490;

	this.lookAtPoint.y = camera.position.y;
    this.camera.lookAt(this.lookAtPoint);	
*/
}



// only newest versions of javascript have bind
// funfunction built-in, so we provide one here
function bind( scope, fn )
{

	return function()
	{
		fn.apply( scope, arguments );
	};

};
