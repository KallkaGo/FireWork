varying vec4 vPosition;
varying vec3 gPosition;
void main(){
    vec4 modelPosition = modelMatrix * vec4(position,1.0);
    vec4 viewPosition = viewMatrix*modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;
    gPosition = position;
    vPosition = modelPosition;
}