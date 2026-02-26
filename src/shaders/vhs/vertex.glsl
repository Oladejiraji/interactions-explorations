uniform float uSizeProgress;
uniform float uTime;

varying vec2 vUv;
varying vec2 relativeUv;

float PI = 3.141592653589793;

void main() {

  vec3 pos = position;

  // pos.y *= uSizeProgress;

  vec4 modelPosition = modelMatrix * vec4(vec3(pos), 1.0);
  vec4 viewPosition = viewMatrix * modelPosition;

  vec4 projectionPosition = projectionMatrix * viewPosition;

  gl_Position = projectionPosition;

  vUv = uv;

}
