/**
 *
 */

function Walker(){
	var temp =  {
		constructor: function() {
			this.num = 1;
			this.color = '#ffffff';
			this.controlled = false;

			this.position = new THREE.Vector3(0, 0, 0);
			this.velocity = new THREE.Vector3(0, 0, 0);
			this.acceleration = new THREE.Vector3(0, 0, 0);

			var body = new THREE.CylinderGeometry(10, 10, 40, 32, 32);
			this.matl = new THREE.MeshLambertMaterial({color:0x93221d});
			this.mesh = new THREE.Mesh(body, this.matl);
			this.mesh.rotation.x = 1.57;
			this.t = 0;
			/*Front Left Leg*/
			//Create geometries & meshes for top and bottom
			var ul_fl = new THREE.CylinderGeometry(6, 4, 16, 32, 32);
			var ll_fl = new THREE.CylinderGeometry(4, 2, 14, 32, 32);
			var UL_FL = new THREE.Mesh(ul_fl, this.matl);
			var LL_FL = new THREE.Mesh(ll_fl, this.matl);
			//Make a hip so the thigh can rotate around it
			//set its position to front left below
			//reset it's orientation
			this.flh = new THREE.Mesh();
			this.flh.position.set(5, 18, 8);
			this.flh.add(UL_FL);
			//Jam the leg into the hip
			UL_FL.position.set(0, -8, 0);
			//Create knee & jam it into ul
			this.flk = new THREE.Mesh();
			this.flk.position.set(0, -7, 0);
			//Add ll to knee and knee to ul and hip to body(mesh)
			UL_FL.add(this.flk);
			this.flk.add(LL_FL);
			LL_FL.position.set(0, -7, 0);
			this.mesh.add(this.flh);
			
			/*Front Right Leg*/
			//Create geometries & meshes for top and bottom
			var ul_fr = new THREE.CylinderGeometry(6, 4, 16, 32, 32);
			var ll_fr = new THREE.CylinderGeometry(4, 2, 14, 32, 32);
			var UL_FR = new THREE.Mesh(ul_fr, this.matl);
			var LL_FR = new THREE.Mesh(ll_fr, this.matl);
			//Make a hip so the thigh can rotate around it
			//set its position to front left below
			//reset it's orientation
			this.frh = new THREE.Mesh();
			this.frh.position.set(-5, 18, 8);
			this.frh.add(UL_FR);
			//Jam the leg into the hip
			UL_FR.position.set(0, -8, 0);
			//Create knee & jam it into ul
			this.frk = new THREE.Mesh();
			this.frk.position.set(0, -7, 0);
			//Add ll to knee and knee to ul and hip to body(mesh)
			UL_FR.add(this.frk);
			this.frk.add(LL_FR);
			LL_FR.position.set(0, -7, 0);
			this.mesh.add(this.frh);
			
			/*Back Left Leg*/
			//Create geometries & meshes for top and bottom
			var ul_bl = new THREE.CylinderGeometry(6, 4, 16, 32, 32);
			var ll_bl = new THREE.CylinderGeometry(4, 2, 14, 32, 32);
			var UL_BL = new THREE.Mesh(ul_bl, this.matl);
			var LL_BL = new THREE.Mesh(ll_bl, this.matl);
			//Make a hip so the thigh can rotate around it
			//set its position to front left below
			//reset it's orientation
			this.blh = new THREE.Mesh();
			this.blh.position.set(5, -18, 8);
			this.blh.add(UL_BL);
			//Jam the leg into the hip
			UL_BL.position.set(0, -8, 0);
			//Create knee & jam it into ul
			this.blk = new THREE.Mesh();
			this.blk.position.set(0, -7, 0);
			//Add ll to knee and knee to ul and hip to body(mesh)
			UL_BL.add(this.blk);
			this.blk.add(LL_BL);
			LL_BL.position.set(0, -7, 0);
			this.mesh.add(this.blh);
			
			/*Back Right Leg*/
			//Create geometries & meshes for top and bottom
			var ul_br = new THREE.CylinderGeometry(6, 4, 16, 32, 32);
			var ll_br = new THREE.CylinderGeometry(4, 2, 14, 32, 32);
			var UL_BR = new THREE.Mesh(ul_br, this.matl);
			var LL_BR = new THREE.Mesh(ll_br, this.matl);
			//Make a hip so the thigh can rotate around it
			//set its position to front left below
			//reset it's orientation
			this.brh = new THREE.Mesh();
			this.brh.position.set(-5, -18, 8);
			this.brh.add(UL_BR);
			//Jam the leg into the hip
			UL_BR.position.set(0, -8, 0);
			//Create knee & jam it into ul
			this.brk = new THREE.Mesh();
			this.brk.position.set(0, -7, 0);
			//Add ll to knee and knee to ul and hip to body(mesh)
			UL_BR.add(this.brk);
			this.brk.add(LL_BR);
			LL_BR.position.set(0, -7, 0);
			this.mesh.add(this.brh);
	
			this.position.y = 50;
		},
		update: function() {
			this.updatePosition();
			this.updateVelocity();
			this.updateAcceleration(new THREE.Vector3(0, -.1, 0));
			this.t += .1;
			var temp = Math.sin(this.t);

			this.flh.rotation.x = temp -1.7;
			this.blh.rotation.x = temp -1.7;
			this.frh.rotation.x = -temp -1.7;
			this.brh.rotation.x = -temp -1.7;
			if(temp < 0) {
				this.flk.rotation.x = -2*temp;
				this.blk.rotation.x = -2*temp;
				this.frk.rotation.x = -temp;
				this.brk.rotation.x = -temp;
			}
			else {
				this.flk.rotation.x = temp;
				this.blk.rotation.x = temp;
				this.frk.rotation.x = 2*temp;
				this.brk.rotation.x = 2*temp;
			}
		},
		updatePosition: function() {
//			this.position.x += this.velocity.x;
//			this.position.y += this.velocity.y;
//			this.position.z += this.velocity.z;
			this.mesh.rotation.z = Math.cos(this.t/25)+3.14;
			this.position.set(200*Math.sin(this.t/25), 50, 200*Math.cos(this.t/25));
			this.mesh.position.set(this.position.x, this.position.y, this.position.z);
		},
		updateVelocity: function() {
			this.velocity.x += this.acceleration.x;
			this.velocity.y += this.acceleration.y;
			this.velocity.z += this.acceleration.z;
		},
		updateAcceleration: function(g) {
			if(g === undefined) return -1;
			if(g.x === undefined) return 0;
			this.acceleration.x += g.x;
			this.acceleration.y += g.y;
			this.acceleration.z += g.z;
		},
		checkPosition: function(w) {
			if(w === undefined || w == null) return;
			for(var i = 0; i < w.length; i++)
				w[i].isPersonOB(this);
		},
		setSize: function(n) {
			if(n >= 0 && n <= 100)
				this.num = n;
		},
		setColor: function(c) {
			this.color = c;
		},
		toggleControl: function() {
			this.controlled = !this.controlled;
		},
		tellConsole: function() {
			console.log("Walker:"+
						"\n\tnum: "+ this.num +
						"\n\tcolor: "+ this.color +
						"\n\tcontrolled: "+ this.controlled +
						"\n\tposition: ["+ this.position.x +", "+ this.position.y +", "+ this.position.z +"]"+
						"\n\tvelocity: ["+ this.velocity.x +", "+ this.velocity.y +", "+ this.velocity.z +"]"+
						"\n\tacceleration: ["+ this.acceleration.x +", "+ this.acceleration.y +", "+ this.acceleration.z +"]"
						);
		}
	};

	temp.constructor();
	return temp;
}

function Joint(link) {
	var temp = {
		constructor: function(l) {
			this.head = l;
			this.links = [];
			this.position = new THREE.Vector3(0, 0, 0);
			this.rotation = new THREE.Vecror3(0, 0, 0);

			this.geom = new THREE.CylinderGeometry();
			this.matl = new THREE.MeshLambertMaterial();
			this.mesh = new THREE.Mesh(geom, matl);
		},
		applyTransformation: function(t) {
			for(var i = 0; i < this.links.length; i++)
				this.links[i].applyTransformation();
			this.position.x += t.position.x;
			this.position.y += t.position.y;
			this.position.z += t.position.z;
			
			this.rotation.x += t.rotation.x;
			this.rotation.y += t.rotation.y;
			this.rotation.z += t.rotation.z;

		},
		update: function() {
				
			this.mesh.position = this.position;
			this.mesh.rotation = this.rotation;
		},
		addLink: function(l) {
			this.links.push(l);
		}
	};
	temp.constructor(link);
	return temp;
}

function Link(link) {
	var temp = {
		contructor: function(h) {
			this.head = h;
			this.joints = [];
			this.position = new THREE.Vector3(0, 0, 0);
			this.rotation = new THREE.Vector3(0, 0, 0);


		},
		
	};
	temp.constructor();
	return temp;
}
