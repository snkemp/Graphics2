//Vertex Shader for water
//@author  snkemp

//Variables to pass to fregment shader
varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vColor;

//Variables to draw waves
uniform float amplitude;
uniform float waveLength;
uniform float time;
uniform float decay;
uniform float reflectivity;

/*TODO
struct Pebble {
	uniform vec3  position;
	uniform float time;
	uniform float inWater;
} pebbles[32];
*/

uniform vec3 PEBBLE;
uniform float TIME;

varying vec3 wPosition;
varying vec3 wNormal;
varying vec3 vReflect;

#ifdef USE_ENVMAP
uniform samplerCube envMap;
#endif

void main() {
	//World position, normal vector, reflection vector
	wPosition = (modelMatrix * vec4(position, 1.0)).xyz;
	wNormal = normalize(mat3(modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz) * normal).xyz;
	vReflect = reflect(normalize(wPosition.xyz-cameraPosition), wNormal);

	//Values to draw the wave
	float PI= 3.14159265358979323846232338327950288;
	float TWO_PI = 2.0*PI;
	float A = amplitude;
	float L = waveLength;
	float T = time-TIME;

	//Our position, and what we are going to change our height by
	vPosition = position;
	float temp= 0.0;
	


/*TODO
	//Loop: For all pebbles -> add to height
	for(int i=0; i<32; i++) {
		//If this pebble hasnt entered water yet -> goto next pebble
		if(pebbleB[i] < 1.0 || pebbleB[i] < 1.0) continue;
		
		//Time since pebble hit, and our position in relationship to the pebble
		float t = time-pebbleT[i];
		float tx = wPosition.x-pebbleP[i].x;
		float ty = wPosition.z-pebbleP[i].y;
		float dist = sqrt(tx*tx+ty*ty);
		
		//A way to dampen the wave over time
		float func = t<0.0 || t > decay ? 0.0 : (decay-t)/decay;
		if(dist/12.0 > t) func = 0.0;
		func = 1.0;	
		temp += A * cos(TWO_PI * (dist/L-t)) * func;
	}
/*


/**/
	//Our position in relationship to the PEBBLE
	float TX = wPosition.x-PEBBLE.x;
	float TY = wPosition.z-PEBBLE.y;
	float DIST = sqrt(TX*TX+TY*TY);

	//A way to dampen the wave over time
	float FUNC = T < 0.0 || T > decay ? 0.0 : (decay-T)/decay;
	if(DIST/12.0 > T) FUNC = 0.0;

	//Add to what we are going to change the height by
	temp += A*cos(TWO_PI*(DIST/L-T))*FUNC;
/**/

	//Update vPosition
	vPosition.z += temp;

	//Our normal vector, and what color the water is
	vNormal = normal;
	vColor = vec3(0, 0, .5);

	//Our new global position
	gl_Position = projectionMatrix*
				  modelViewMatrix*
				  vec4(vPosition, 1.0);
}
