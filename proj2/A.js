/**
 * Class: A* shortest path algorithm
 * Author: snkemp
 */

function A(grid, start, goal) {
	var OBJ = function(x, y) {
		return {
			x : x,
			y : y,
			f : 0,
			g : 0,
			h : 0,
			cameFrom : null,
			value : grid[x][y]
		};
	};
	var isValid = function(x, y) {return  x >= 0 && y >= 0 && x < grid.length && y < grid[0].length;};
	var getNeighbors = function(node) {
		var temp = [];	var x = node.pos.x, y = node.pos.y;
		for(var i= -1; i<2; i++) { for(var j= -1; j<2; j++) {
			if(i == 0 && j == 0) continue;
			if(Math.abs(i+j) == 2) continue;
			if(isValid(x+i, y+j)) temp.push(new OBJ(x+1, y));
		}}
		return temp;
	};
	var H = function(x, y) {return Math.abs(goal.x - x) + Math.abs(goal.y - y);	};

	//Set of nodes to be checked and those already checked
	var openSet = new Heap();
	var closedSet = new Heap();
	openSet.add(new OBJ(start.x, start.y));

	//While( we still have nodes to evaluate
	while(openSet.size() > 0) {
		//console.log("#inOpen: "+openSet.size()+", #inClose: "+closedSet.size());
		//Get the best node that we need to evaluate
		var curr = openSet.data[1];

		//If this is the goal
		if(curr.x == goal.x && curr.y == goal.y){
			//console.log("Found it!!");
			var cf = grid[goal.x][goal.y]; //Node we came from
			var t = "";					   //String to print path
			var ans = [];				   //Push the path into an array

			//While we still have a node to come from
			while(cf.cameFrom != null) {

				//Work on printing path
				console.log(t+"cameFrom: "+cf.cameFrom.x+", "+cf.cameFrom.y);
				t += "\\";

				//Store x and y values of came from
				cf.parentNode = {x:cf.cameFrom.x, y:cf.cameFrom.y};

				//Add the values and set to next cameFrom
				ans.push(cf.parentNode);
				cf = cf.cameFrom;
			}
			//Return our path
			return ans;
		}

		//We did not find the goal
		//console.log("Moving from open to close");

		//Move the one we evaluated to the closed set
		openSet.removeRoot();
		closedSet.add(curr);

		//For all neibors
		var neib = getNeighbors(curr);
		for(var i=0;i<neib.length; i++) {
			if(closedSet.contains(neib[i]))continue;

			//Tentative g_score
			var tempg = curr.g+ 10*neib[i].speed;

			//Neigbor came from this
			//Neighbors g = tentative g
			if(neib[i].cameFrom == null || tempg < neib[i].g) {
				neib[i].cameFrom = curr;
				neib[i].g = tempg;
				neib[i].h = H(neib[i].x, neib[i].y);
				neib[i].f = neib[i].h+neib[i].g;
				console.log('\t\tNeib['+i+'].g: '+tempg+
								', [x: '+neib[i].x+', y: '+neib[i].y+']'+
								', [f: '+neib[i].f+']'+
								', [h: '+neib[i].h+']');
				//If open set !contain the neghbor, add it
				//Else if(this is not a better path) continue
				if(!openSet.contains(neib[i])) openSet.add(neib[i]);
			}
		}
	}
	console.log("Didnt find it");
	return 0;
}
