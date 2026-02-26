// precision mediump float;
uniform sampler2D uTexture;
uniform vec2 uPlaneSize;
uniform vec2 uImageRes;
uniform float uTime;
uniform float uNoiseIntensity;
uniform float uDistortionIntensity;
uniform float uDisplacementSpeed;
uniform float uTapeNoiseIntensity;

varying vec2 vUv;
float PI = 3.141592653589793;

vec2 CoverUV(vec2 u, vec2 s, vec2 i) {
  float rs = s.x / s.y;
  float ri = i.x / i.y;
  vec2 st = rs < ri ? vec2(i.x * s.y / i.y, s.y) : vec2(s.x, i.y * s.x / i.x);
  vec2 o = (rs < ri ? vec2((st.x - s.x) / 2.0, 0.0) : vec2(0.0, (st.y - s.y) / 2.0)) / st;
  return u * s / st + o;
}

float random(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

vec4 rgbShift(sampler2D utexture, vec2 uv, vec2 offset) {
  float r = texture(utexture, uv + offset).r;
  vec3 gba = texture(utexture, uv).gba;
  return vec4(r, vec3(gba));
}

// --- Tape noise by Vladimir Storm (https://www.shadertoy.com/view/MlfSWr) ---
vec4 hash42(vec2 p) {
  vec4 p4 = fract(vec4(p.xyxy) * vec4(443.8975, 397.2973, 491.1871, 470.7827));
  p4 += dot(p4.wzxy, p4 + 19.19);
  return fract(vec4(p4.x * p4.y, p4.x * p4.z, p4.y * p4.w, p4.x * p4.w));
}

float hash(float n) {
  return fract(sin(n) * 43758.5453123);
}

float n3d(in vec3 x) {
  vec3 p = floor(x);
  vec3 f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  float n = p.x + p.y * 57.0 + 113.0 * p.z;
  float res = mix(mix(mix(hash(n + 0.0), hash(n + 1.0), f.x),
                      mix(hash(n + 57.0), hash(n + 58.0), f.x), f.y),
                  mix(mix(hash(n + 113.0), hash(n + 114.0), f.x),
                      mix(hash(n + 170.0), hash(n + 171.0), f.x), f.y), f.z);
  return res;
}

float tapeNoise(vec2 p) {
  float y = p.y;
  float s = uTime * 2.0;

  float v = (n3d(vec3(y * 0.01 + s, 1.0, 1.0)) + 0.0)
          * (n3d(vec3(y * 0.011 + 1000.0 + s, 1.0, 1.0)) + 0.0)
          * (n3d(vec3(y * 0.51 + 421.0 + s, 1.0, 1.0)) + 0.0);

  v *= hash42(vec2(p.x + uTime * 0.01, p.y)).x + 0.3;

  v = pow(v + 0.3, 1.0);
  if (v < 0.7) v = 0.0;
  return v;
}
// --- End tape noise ---

void main() {

  vec2 uv = CoverUV(vUv, uPlaneSize, uImageRes);

  uv.x += sin((PI * 2.0 * uv.y * 25.0) + (uTime * 5.0)) * uDistortionIntensity * 0.1;

  uv.y -= uTime * uDisplacementSpeed;

  //STATIC NOISE
  float xs = floor(gl_FragCoord.x / uPlaneSize.x);
  float ys = floor(gl_FragCoord.y / uPlaneSize.x);
  vec4 noise = vec4(random(vec2(xs * uTime, ys * uTime)) * uNoiseIntensity);

  //TAPE NOISE
  float linesN = 240.0;
  float one_y = uPlaneSize.y / linesN;
  vec2 tapeUv = floor(gl_FragCoord.xy / one_y) * one_y;
  float tape = tapeNoise(tapeUv) * uTapeNoiseIntensity;

  // RGB SHIFT (RED CHANNEL)
  vec4 tex = rgbShift(uTexture, uv, vec2(.0));

  gl_FragColor = tex + noise + vec4(vec3(tape), 0.0);

  #include <tonemapping_fragment>
	#include <colorspace_fragment>

}
