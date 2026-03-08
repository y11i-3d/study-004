import { useThree } from "@react-three/fiber";
import { useStore } from "jotai";
import { useEffect, useMemo } from "react";
import { float, min, mix, step, texture, uv, vec2 } from "three/tsl";
import { MeshBasicNodeMaterial } from "three/webgpu";
import { useDemoAnimation } from "./hooks/useDemoAnimation";
import { useDemoImages } from "./hooks/useDemoImages";
import { useDemoTextures } from "./hooks/useDemoTextures";
import { useThreeContext } from "./ThreeProvider";

export const ThreeDemo = () => {
  const { atoms, uniforms } = useThreeContext();
  const store = useStore();
  const viewport = useThree((state) => state.viewport);

  useDemoImages();
  useDemoAnimation(atoms);

  const { textureA, textureB } = useDemoTextures();

  // Update viewportAspect uniform
  useEffect(() => {
    store.set(atoms.viewportAspect, viewport.width / viewport.height);
  }, [store, atoms.viewportAspect, viewport.width, viewport.height]);

  const IMAGE_ASPECT = 1920 / 1080;

  const material = useMemo(() => {
    const aspect = uniforms.viewportAspect;
    const imageAspect = float(IMAGE_ASPECT);
    const scale = vec2(
      min(float(1), aspect.div(imageAspect)),
      min(float(1), imageAspect.div(aspect)),
    );
    const coverUv = uv().sub(0.5).mul(scale).add(0.5);

    const texNodeA = texture(textureA, coverUv);
    const texNodeB = texture(textureB, coverUv);

    const progress = uniforms.mixProgress;
    const mask = step(float(1).sub(progress), uv().x);

    const mat = new MeshBasicNodeMaterial();
    mat.colorNode = mix(texNodeA, texNodeB, mask);

    return mat;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [textureA, textureB, uniforms]);

  return (
    <mesh material={material}>
      <planeGeometry args={[viewport.width, viewport.height]} />
    </mesh>
  );
};
