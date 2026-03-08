import { useAtomValue, useStore } from "jotai";
import { useEffect, useMemo } from "react";
import { Texture } from "three/webgpu";
import { useThreeContext } from "../ThreeProvider";

const getImageIndex = (n: number, m: number) => ((n % m) + m) % m;

const getSlotIndex = (tex: Texture): number =>
  tex.name === "" ? -1 : Number(tex.name);

const setSlot = (tex: Texture, image: HTMLImageElement, index: number) => {
  tex.image = image;
  tex.name = String(index);
  tex.needsUpdate = true;
};

export const useDemoTextures = () => {
  const { atoms } = useThreeContext();
  const store = useStore();
  const images = useAtomValue(atoms.images);

  const { textureA, textureB } = useMemo(() => {
    return {
      textureA: new Texture(),
      textureB: new Texture(),
    };
  }, []);

  useEffect(() => {
    if (!images) return;

    setSlot(textureA, images[0], 0);
    setSlot(textureB, images[1], 1);

    let prevTransition = store.get(atoms.transition);

    const updateTextures = () => {
      const ci = store.get(atoms.currentIndex);
      const imageIndexA = getImageIndex(ci, images.length);
      const imageIndexB = getImageIndex(ci + 1, images.length);

      if (getSlotIndex(textureA) !== imageIndexA)
        setSlot(textureA, images[imageIndexA], imageIndexA);
      if (getSlotIndex(textureB) !== imageIndexB)
        setSlot(textureB, images[imageIndexB], imageIndexB);
    };

    const unsub = store.sub(atoms.transition, () => {
      const t = store.get(atoms.transition);
      const ci = store.get(atoms.currentIndex);

      if (t > prevTransition) {
        if (t > ci + 1) {
          store.set(atoms.currentIndex, ci + 1);
          updateTextures();
        }
      } else if (t < prevTransition) {
        if (t < ci) {
          store.set(atoms.currentIndex, ci - 1);
          updateTextures();
        }
      }

      prevTransition = t;
    });
    return unsub;
  }, [store, atoms, images, textureA, textureB]);

  return { textureA, textureB };
};
