"use client";

import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import * as THREE from "three";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { AgentState } from "@livekit/components-react";

const accentColor = "#5282ed";
const disconnectedColor = "#030303";

const Shape: React.FC<{ volume: number; state: AgentState }> = ({
  volume,
  state,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);

  const emissiveColor = useRef(new THREE.Color(accentColor));
  const targetColor = useRef(new THREE.Color(accentColor));
  const isDisconnected = state === "disconnected";

  useFrame((frameState) => {
    if (meshRef.current) {
      if (state !== "speaking") {
        if (state === "disconnected") {
          meshRef.current.rotation.y += 0.1;
        } else {
          meshRef.current.rotation.y += 0.025;
        }
      } else {
        meshRef.current.rotation.y = THREE.MathUtils.lerp(
          meshRef.current.rotation.y,
          Math.round(meshRef.current.rotation.y / Math.PI) * Math.PI,
          0.05
        );
      }

      const elapsedTime = frameState.clock.getElapsedTime();
      meshRef.current.position.y = Math.sin(elapsedTime * 3) * 0.1;

      const scale = THREE.MathUtils.lerp(
        meshRef.current.scale.x,
        1 + volume * 0.5,
        0.2
      );
      meshRef.current.scale.setScalar(scale);

      const targetHex = isDisconnected ? disconnectedColor : accentColor;
      targetColor.current.set(targetHex);
      emissiveColor.current.lerp(targetColor.current, 0.1);

      const material = meshRef.current.material as THREE.MeshStandardMaterial;
      material.emissive = emissiveColor.current;
    }
  });

  const createStarburstShape = (): THREE.Shape => {
    const shape = new THREE.Shape();
    const size = 1;
    const curveControl = size * 0.05;

    shape.moveTo(0, size);
    shape.quadraticCurveTo(curveControl, curveControl, size, 0);
    shape.quadraticCurveTo(curveControl, -curveControl, 0, -size);
    shape.quadraticCurveTo(-curveControl, -curveControl, -size, 0);
    shape.quadraticCurveTo(-curveControl, curveControl, 0, size);

    return shape;
  };

  const shape = createStarburstShape();
  const extrudeSettings: THREE.ExtrudeGeometryOptions = {
    depth: 0.3,
    bevelEnabled: true,
    bevelThickness: 0.05,
    bevelSize: 0.05,
    bevelSegments: 24,
  };
  const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  geometry.center();

  const createSolidColorTexture = (color: string): THREE.CanvasTexture => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    canvas.width = 512;
    canvas.height = 512;

    ctx.fillStyle = color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    return new THREE.CanvasTexture(canvas);
  };

  const texture = createSolidColorTexture(
    isDisconnected ? disconnectedColor : accentColor
  );

  const material = new THREE.MeshStandardMaterial({
    map: texture,
    emissiveMap: texture,
    roughness: isDisconnected ? 0.8 : 1,
    metalness: isDisconnected ? 0.2 : 0.6,
    side: THREE.DoubleSide,
    emissive: emissiveColor.current,
    emissiveIntensity: isDisconnected ? 0.5 : volume > 0 ? 3.5 : 0.25,
  });

  return <mesh ref={meshRef} geometry={geometry} material={material} />;
};

export const GeminiMark = ({
  volume,
  state,
}: {
  volume: number;
  state: AgentState;
}) => {
  return (
    <Canvas camera={{ position: [0, 0, 6], fov: 60 }}>
      <ambientLight intensity={1} />
      <pointLight position={[2, 0, 0]} intensity={5} />
      <Shape volume={volume} state={state} />
      <Environment preset="night" background={false} />
      <EffectComposer>
        <Bloom
          intensity={volume > 0 ? 2 : 0}
          radius={50}
          luminanceThreshold={0.0}
          luminanceSmoothing={1}
        />
      </EffectComposer>
    </Canvas>
  );
};
