
// phong lighting model

uniform vec3  ambientLightColor;
uniform float shininess;
uniform float pebbleOpacity;
uniform float reflectivity;
uniform float refractivity;
varying vec3 refract_R;
varying vec3 refract_G;
varying vec3 refract_B;
varying vec3  vNormal;		// normal vector
varying vec3  vPosition;	// vertex
varying vec3  vColor;		// vertex color

varying vec3 wPosition;
varying vec3 wNormal;
varying vec3 vReflect;
varying vec3 vRefract;

#ifdef USE_ENVMAP
uniform samplerCube envMap;
#endif

void main()
{

  vec3 L; 	// vector from surface to light
  vec3 E;	// eye location 
  vec3 R;	// reflection vector
  float Kd;	// diffuse lighting coefficient
  float Ks;	// specular lighting coefficient
  vec3 fcolor;  // frag color we're accumulating
  
  fcolor=ambientLightColor*vColor;
/*
  for(int i=0;i<0;i++)
  {
  	L= normalize(pointLightPosition[i]-vPosition);
	E= normalize(cameraPosition-vPosition);
	R= normalize(-reflect(L,vNormal));
  	Kd=max(0.0,dot(vNormal,L));
	Ks=pow(max(0.0,dot(R,E)),shininess);

	fcolor=fcolor+Kd*pointLightColor[i]*vColor+Ks*pointLightColor[i]*vColor;
  }
*/
  #ifdef USE_ENVMAP
  vec4 reflectColor = vec4(textureCube(envMap, vec3(-vReflect.x, vReflect.yz)));
  float rR = textureCube(envMap, vec3(-refract_R.x, refract_R.yz)).r; 
  float rG = textureCube(envMap, vec3(-refract_G.x, refract_G.yz)).g; 
  float rB = textureCube(envMap, vec3(-refract_B.x, refract_B.yz)).b;
  vec4 refractColor = vec4(rR, rG, rB, 1.0);
  vec3 rfl = mix(gl_FragColor.xyz, reflectColor.xyz, reflectivity);
  vec3 rfr = mix(gl_FragColor.xyz, refractColor.xyz, refractivity);
  fcolor += mix(rfl, rfr, 0.5);
  #endif
  
  gl_FragColor  = vec4(fcolor, pebbleOpacity);

}

