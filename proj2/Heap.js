/**
 *
 *
 */

/*Determines if a min/max heap*/
Heap.type = {
	MIN:0,
	MAX:0
}

/*Constructor*/
Heap.prototype.constructor = Heap;
function Heap(type) {
	//Define our type and a counter for how many objects we have
	this.type = (type == null) ? Heap.type.MIN : type;
	this.data = [];
	this.data.push(0);
}

/*Returns how many objects we have*/
Heap.prototype.size =
function() {
	return this.data[0];
}

/*Add an object to the heap*/
Heap.prototype.add =
function(obj) {
	//Increase our size, set the last object to obj
	this.data[0]++;
	this.data[this.size()] = obj;
}

/*Bubble Up*/
Heap.prototype.bubbleUp =
function(pos) {
	//Values for the current node, and the parent of the current node
	var par;
	var cur = pos;

	//If this is not the head
	while(cur != 1) {
		//Get this node's parent
		par = this.getParent(cur);

		//Determine if we are eligible to swap with parent
		if (this.data[cur].value < this.data[par].value && this.type == Heap.type.MIN)
			this.swap(cur, par); else
		if (this.data[cur].value > this.data[par].value && this.type == Heap.type.MAX)
			this.swap(cur, par);
		//If neither of these things are true-> we ont need to do anything
		else return;

		//We are now our parent node
		cur = par;
	}
}

/*Bubble Down*/
Heap.prototype.bubbleDown =
function(pos) {
	//Values to determine the best child and keep track of what node we are on
	var L, R, sel;
	var cur = pos;

	//While we have a child (!isALeaf)
	while(this.hasChild(cur)) {
		//Get our children
		L = this.getLeftChild(cur);
		R = this.getRightChild(cur);

		//Determine the best child
		if(R == 0) sel = L; else
		if(this.type == Heap.type.MIN) sel = this.min(L, R); else
		if(this.type == Heap.type.MAX) sel = this.max(L, R);

		//Swap with best child
		if(this.data[cur].value > this.data[sel].value && this.type == Heap.type.MIN)
			this.swap(cur, sel); else
		if(this.data[cur].value < this.data[sel].value && this.type == Heap.type.MAX)
			this.swap(cur, sel);
		else return;

		//We are now our child node
		cur = sel;
	}
}

/*Swap two nodes*/
Heap.prototype.swap =
function(posA, posB) {
	//Check to see if pos's are valid
	if(posA < 1 || posB < 1 || posA > this.size() || posB > this.size()) return false;

	//Swap the values
	var temp = this.data[posA];
	this.data[posA] = this.data[posB];
	this.data[posB] = temp;
	return true;

}

/*Remove the headNode*/
Heap.prototype.removeRoot =
function() {
	//Get the data of the root to return
	var rootData = this.data[1];

	//Set the head to the last data
	this.data[1] = this.data[this.size()];

	//Decrease the size
	this.data[0]--;

	//Bubble down
	this.bubbleDown(1);

	//Return the data that was the rootData
	return rootData;
}

/*Is A Leaf Node*/
Heap.prototype.isLeaf =
function(pos) {
	//Return if (size/2 <= pos <= size)
	return pos >= this.size()/2 && pos <= this.size();
}

/*Returns the parent's position*/
Heap.prototype.getParent =
function(pos) {
	//A special property of heaps
	//			1
	//		2		3
	//	  4	  5   6   7 
	return Math.floor(pos/2);
}

/*Return the node's leftChild's position*/
Heap.prototype.getLeftChild =
function(pos) {
	//A special property of heaps
	//			1
	//		2		3
	//	  4   5   6   7
	var temp = 2*pos;
	if (temp > this.size()) return 0;
	return temp;
}

/*Return the node's rightChild's position*/
Heap.prototype.getRightChild =
function(pos) {
	//A special property of heaps
	//			1
	//		2		3
	//	  4   5   6   7
	var temp = 2*pos + 1;
	if (temp > this.size()) return 0;
	return temp;
}

/*Returns the max of two objs*/
Heap.prototype.max =
function(a, b) {
	//If actually a number-> put it into the right format
	if(typeof a == 'number' || typeof b == 'number') {
		return a > b ? a : b;
	}
	//Return the max
	return a.value > b.value ? a : b;
}

/*Returns the min of two objs*/
Heap.prototype.min =
function(a, b) {
	if(typeof a == 'number' || typeof b == 'number') {
		a < b ? a : b;
	}
	return a.value < b.value ? a : b;
}
