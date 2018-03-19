//Vertex Shader for water
//@author  snkemp

//Variables to pass to fregment shader
varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vColor;

uniform float reflectivity;
uniform float refractivity;
uniform float refractR;
uniform float refractG;
uniform float refractB;

varying vec3 refract_R;
varying vec3 refract_G;
varying vec3 refract_B;

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

	//World position, world normal vector, reflection vector
	wPosition = (modelMatrix * vec4(position, 1.0)).xyz;
	wNormal = normalize(mat3(modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz) * normal).xyz;

	//These two give it the appearance of water!!!!
	wNormal = normalize((modelMatrix*vec4(vNormal, 1.0)).xyz);
	vReflect = reflect(normalize(wPosition.xyz-cameraPosition), wNormal);
	
	refract_R = refract(normalize(wPosition.xyz-cameraPosition), wNormal.xyz, refractR);
	refract_G = refract(normalize(wPosition.xyz-cameraPosition), wNormal.xyz, refractG);
	refract_B = refract(normalize(wPosition.xyz-cameraPosition), wNormal.xyz, refractB);
	
	//Our new global position
	gl_Position = projectionMatrix*
				  modelViewMatrix*
				  vec4(vPosition, 1.0);
}
