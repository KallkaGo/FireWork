attribute vec3 aStep;
uniform float uTime;
uniform float uSize;
void main(){
    vec4 modelPosition = modelMatrix*vec4(position,1.0);
    modelPosition.xyz +=aStep*uTime;
    vec4 viewPosition = viewMatrix *modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;
    gl_PointSize = uSize; 
}