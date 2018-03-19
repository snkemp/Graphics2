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
uniform float refractivity;

//Pebbles
uniform vec3  pebbleP[NUM_PEBBLES];
uniform float pebbleT[NUM_PEBBLES];
uniform float pebbleB[NUM_PEBBLES];

varying vec3 wPosition;
varying vec3 wNormal;
varying vec3 vReflect;
varying vec3 vRefract;

#ifdef USE_ENVMAP
uniform samplerCube envMap;
#endif

void main() {
	vColor = vec3(0.0, 0.0, 0.5);
	//Get our normal vector and position
	vNormal = normalize(normalMatrix*normal);

	vPosition = position;

	//Cont PI values
	float PI= 3.14159265358979323846232338327950288;
	float TWO_PI = 2.0*PI;

	//Values to draw wave
	float A = amplitude;
	float L = waveLength;
	
	float pos = 0.0;
	vec3  nor = vec3(0.0, 1.0, 0.0);
	for(int i=1; i<NUM_PEBBLES; i++) {
		L = waveLength;
		if(pebbleB[i] > 1.0) {
			float t  = time-pebbleT[i];
			float tx = vPosition.x-pebbleP[i].x*7.5;
			float tz = vPosition.y-pebbleP[i].z*7.5;
			float ty = tz;
			float dist = sqrt(tx*tx+tz*tz);
			if(dist < 3.0) L = waveLength-4.0;
			if(L < 1.0) L = 1.0;

			float func = decay <= 0.0 || t >= decay || dist/12.0 > t ? 0.0 : (decay-t)/decay;
			pos   += A*cos(TWO_PI*(dist/L-t))*func;
			nor.x += ((func*A*tx)/(10.0*L*dist))*(L*cos(TWO_PI*(dist/L-t)) - TWO_PI*(dist-10.0)*sin(TWO_PI*(dist/L-t)));
			nor.z += ((func*A*tz)/(10.0*L*dist))*(L*cos(TWO_PI*(dist/L-t)) - TWO_PI*(dist-10.0)*sin(TWO_PI*(dist/L-t)));
		}
	}

	vPosition.z += pos;
	vNormal = normalize(nor);

	//World position, world normal vector, reflection vector
	wPosition = (modelMatrix * vec4(position, 1.0)).xyz;
	wNormal = normalize(mat3(modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz) * normal).xyz;

	//These two give it the appearance of water!!!!
	wNormal = normalize((modelMatrix*vec4(vNormal, 1.0)).xyz);
	vReflect = reflect(normalize(wPosition.xyz-cameraPosition), wNormal);
	vRefract = refract(normalize(wPosition.xyz-cameraPosition), wNormal.xyz, .5);

	//Our new global position
	gl_Position = projectionMatrix*
				  modelViewMatrix*
				  vec4(vPosition, 1.0);
}
