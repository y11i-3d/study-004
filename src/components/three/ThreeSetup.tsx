import { extend, useThree } from "@react-three/fiber";
import { useEffect } from "react";
import * as THREE from "three";
import * as THREE_WEBGPU from "three/webgpu";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
extend(THREE_WEBGPU as any);

export const ThreeSetup = () => {
  const gl = useThree((state) => state.gl);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    gl.toneMapping = THREE.NoToneMapping;
    gl.outputColorSpace = THREE.LinearSRGBColorSpace;
  }, [gl]);

  return null;
};
