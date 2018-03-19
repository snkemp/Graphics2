
// phong lighting model

uniform vec3  pointLightPosition[MAX_POINT_LIGHTS]; 
uniform vec3  pointLightColor[MAX_POINT_LIGHTS];
uniform vec3  ambientLightColor;
uniform float shininess;
uniform float waterOpacity;
uniform float reflectivity;
varying vec3  vNormal;		// normal vector
varying vec3  vPosition;	// vertex
varying vec3  vColor;		// vertex color

varying vec3 wPosition;
varying vec3 wNormal;
varying vec3  vReflect;

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

  for(int i=0;i<0;i++)
  {
  	L= normalize(pointLightPosition[i]-vPosition);
	E= normalize(cameraPosition-vPosition);
	R= normalize(-reflect(L,vNormal));
  	Kd=max(0.0,dot(vNormal,L));
	Ks=pow(max(0.0,dot(R,E)),shininess);

	fcolor=fcolor+Kd*pointLightColor[i]*vColor+Ks*pointLightColor[i]*vColor;
  }


  
  #ifdef USE_ENVMAP
  vec4 reflectColor = vec4(textureCube(envMap, vec3(-vReflect.x, vReflect.yz)));
  vec3 col = mix(gl_FragColor.xyz, reflectColor.xyz, reflectivity);
  fcolor += col;
  #endif
  
  float dist = sqrt(vPosition.x*vPosition.x+vPosition.y*vPosition.y);
  float temp = waterOpacity;
  if( dist > 19.9) temp = 0.0;
  gl_FragColor  = vec4(fcolor, temp);

}

