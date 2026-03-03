// Chromatic aberration effect — offsets R and B channels
// from the G channel to simulate lens fringing

vec3 chromaticAberration(sampler2D tex, vec2 uv, float intensity) {
  float r = texture2D(tex, uv + vec2(intensity, 0.0)).r;
  float g = texture2D(tex, uv).g;
  float b = texture2D(tex, uv - vec2(intensity, 0.0)).b;
  return vec3(r, g, b);
}
