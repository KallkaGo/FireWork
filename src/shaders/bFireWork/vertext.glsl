
attribute float aScale;
attribute vec3 rAngle;
uniform float uTime;
uniform float uSize;
void main(){
    vec4 modelPosition = modelMatrix*vec4(position,1.0);
    modelPosition.xyz+= rAngle*uTime*0.2;
    vec4 viewPosition = viewMatrix *modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;
    gl_PointSize = uSize*aScale ; 
}