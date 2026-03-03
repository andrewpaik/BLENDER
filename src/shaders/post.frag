// Post-processing fragment shader — cinematic effects pass
// Applied to a full-screen quad textured with the frame canvas

uniform sampler2D uTexture;      // Frame canvas as texture
uniform float uTime;             // Elapsed time for animated effects
uniform float uScrollVelocity;   // Scroll speed — drives reactive distortion
varying vec2 vUv;

// Film grain noise
float grain(vec2 uv, float t) {
  return fract(sin(dot(uv, vec2(12.9898, 78.233)) + t) * 43758.5453);
}

// Chromatic aberration — splits RGB channels based on intensity
vec3 chromaticAberration(sampler2D tex, vec2 uv, float intensity) {
  float r = texture2D(tex, uv + vec2(intensity, 0.0)).r;
  float g = texture2D(tex, uv).g;
  float b = texture2D(tex, uv - vec2(intensity, 0.0)).b;
  return vec3(r, g, b);
}

void main() {
  // Chromatic aberration scales with scroll velocity
  float aberration = uScrollVelocity * 0.003;
  vec3 color = chromaticAberration(uTexture, vUv, aberration);

  // Vignette — darken edges
  float dist = distance(vUv, vec2(0.5));
  color *= smoothstep(0.8, 0.3, dist);

  // Film grain — subtle noise overlay
  float g = grain(vUv * 1000.0, uTime) * 0.06;
  color += g;

  gl_FragColor = vec4(color, 1.0);
}
