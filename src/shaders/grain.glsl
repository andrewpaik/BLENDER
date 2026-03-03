// Film grain noise function — generates pseudo-random noise
// based on UV coordinates and a time seed

float grain(vec2 uv, float t) {
  return fract(sin(dot(uv, vec2(12.9898, 78.233)) + t) * 43758.5453);
}
