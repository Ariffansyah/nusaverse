"use client";

import { useFBO } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { ShaderMaterial, Vector2, type PerspectiveCamera } from "three";
import { FullScreenQuad } from "three/examples/jsm/postprocessing/Pass.js";

// Filter komik untuk seluruh ruang pamer dalam satu pass: warna bertingkat (cel), titik halftone di bayangan,
// dan garis tinta dari kedalaman (siluet + lipatan) dan perubahan terang (detail tekstur, foto, tulisan).
// Satu pass di layar, jadi model Sketchfab tidak perlu diganti materialnya satu per satu.
const fragmentShader = /* glsl */ `
#include <packing>
uniform sampler2D tColor;
uniform sampler2D tDepth;
uniform vec2 texel;
uniform float near;
uniform float far;
uniform float line; // tebal garis (piksel perangkat)
uniform float dotSize; // jarak antar-titik halftone (piksel perangkat)
varying vec2 vUv;

const vec3 INK = vec3(0.09, 0.07, 0.055);
const vec3 LUMA = vec3(0.299, 0.587, 0.114);

float viewZ(vec2 uv) { return -perspectiveDepthToViewZ(texture2D(tDepth, uv).x, near, far); }

vec3 display(vec2 uv) {
  vec3 c = texture2D(tColor, uv).rgb;
  #ifdef TONE_MAPPING
  c = toneMapping(c);
  #endif
  return sRGBTransferOETF(vec4(clamp(c, 0.0, 1.0), 1.0)).rgb;
}

void main() {
  vec2 o = texel * line;
  vec3 col = display(vUv);
  float z = viewZ(vUv);

  // 1/z linier di layar untuk bidang datar: laplacian-nya nol di permukaan rata, besar di tepi dan lipatan
  float iz = 1.0 / z;
  float zl = viewZ(vUv - vec2(o.x, 0.0)), zr = viewZ(vUv + vec2(o.x, 0.0));
  float zd = viewZ(vUv - vec2(0.0, o.y)), zu = viewZ(vUv + vec2(0.0, o.y));
  float lap = abs(1.0 / zl + 1.0 / zr + 1.0 / zu + 1.0 / zd - 4.0 * iz) / iz;
  float depthEdge = smoothstep(0.005, 0.02, lap);

  // sobel terang di ruang tampilan: garis untuk ukiran, pola kain, isi foto
  float tl = dot(display(vUv + vec2(-o.x, o.y)), LUMA), tc = dot(display(vUv + vec2(0.0, o.y)), LUMA), tr = dot(display(vUv + o), LUMA);
  float ml = dot(display(vUv - vec2(o.x, 0.0)), LUMA), mr = dot(display(vUv + vec2(o.x, 0.0)), LUMA);
  float bl = dot(display(vUv - o), LUMA), bc = dot(display(vUv - vec2(0.0, o.y)), LUMA), br = dot(display(vUv + vec2(o.x, -o.y)), LUMA);
  float gx = tr + 2.0 * mr + br - tl - 2.0 * ml - bl;
  float gy = tl + 2.0 * tc + tr - bl - 2.0 * bc - br;
  float lumaEdge = smoothstep(0.35, 0.6, length(vec2(gx, gy)));

  // garis menipis di kejauhan supaya ujung aula tidak jadi coretan
  float fade = 1.0 - smoothstep(18.0, 40.0, z);
  float edge = max(depthEdge, lumaEdge * 0.85) * fade;

  // cel: terang dikuantisasi ke 4 tingkat, warna asli dipertahankan, saturasi dinaikkan
  float l = dot(col, LUMA);
  float q = min(1.0, floor(l * 4.0 + 0.5) / 4.0 + 0.08);
  col *= q / max(l, 0.02);
  col = clamp(mix(vec3(dot(col, LUMA)), col, 1.15), 0.0, 1.0);

  // halftone di daerah gelap: grid diputar 45 derajat seperti cetakan komik. Ukuran titik dari tingkat cel,
  // bukan terang mentah, supaya titik rata per bidang dan tidak berbintik mengikuti derau tekstur.
  vec2 p = mat2(0.7071, -0.7071, 0.7071, 0.7071) * gl_FragCoord.xy / dotSize;
  float r = sqrt(clamp((0.5 - q) * 2.0, 0.0, 1.0)) * 0.42;
  float dotMask = 1.0 - smoothstep(r - 0.06, r + 0.06, length(fract(p) - 0.5));
  col = mix(col, col * 0.45, dotMask);

  gl_FragColor = vec4(mix(col, INK, edge), 1.0);
}
`;

const vertexShader = /* glsl */ `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

export function ComicPass() {
  const target = useFBO({ samples: 4, depthBuffer: true });
  const pass = useRef<FullScreenQuad>(null);
  useEffect(() => {
    const material = new ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        tColor: { value: target.texture },
        tDepth: { value: target.depthTexture },
        texel: { value: new Vector2() },
        near: { value: 0.1 },
        far: { value: 100 },
        line: { value: 1 },
        dotSize: { value: 6 },
      },
    });
    const quad = new FullScreenQuad(material);
    pass.current = quad;
    return () => {
      material.dispose();
      quad.dispose();
    };
  }, [target]);

  // prioritas 1: R3F berhenti merender sendiri, pass ini yang menggambar ke layar
  useFrame(({ gl, scene, camera, viewport }) => {
    const quad = pass.current;
    if (!quad) return;
    const u = (quad.material as ShaderMaterial).uniforms;
    const cam = camera as PerspectiveCamera;
    u.texel.value.set(1 / target.width, 1 / target.height);
    u.near.value = cam.near;
    u.far.value = cam.far;
    u.line.value = 1.4 * viewport.dpr;
    u.dotSize.value = 6 * viewport.dpr;
    gl.setRenderTarget(target);
    gl.render(scene, camera);
    gl.setRenderTarget(null);
    quad.render(gl);
  }, 1);
  return null;
}
