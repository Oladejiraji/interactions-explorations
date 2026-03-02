uniform float uTime;

varying vec2 vUv;
varying vec2 relativeUv;
varying vec3 vWorldPosition;
varying vec2 vNdcPosition;

float PI = 3.141592653589793;

void main() {

  vec4 modelPos = modelMatrix * vec4(vec3(position), 1.0);
  vec4 viewPos = viewMatrix * modelPos;
  vec4 clipSpacePosition = projectionMatrix * viewPos;

  float ndcPositionX = clipSpacePosition.x / clipSpacePosition.w;
  float ndcPositionY = clipSpacePosition.y / clipSpacePosition.w;

  // ndcPositionX = ndcPositionX * 0.5 + 0.5;
  // ndcPositionY = ndcPositionY * 0.5 + 0.5;

  vec3 pos = position;

  vec4 modelPosition = modelMatrix * vec4(vec3(pos), 1.0);

  vec4 viewPosition = viewMatrix * modelPosition;

  vec4 projectionPosition = projectionMatrix * viewPosition;

  gl_Position = projectionPosition;

  vUv = uv;

  vWorldPosition = modelPosition.xyz;
  vNdcPosition = vec2(ndcPositionX, ndcPositionY);

  // relativeUv = vec2(normalizedPosX, normalizedPosY);
}
