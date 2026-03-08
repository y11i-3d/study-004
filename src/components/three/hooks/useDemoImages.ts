import { useStore } from "jotai";
import { useEffect } from "react";
import { ImageLoader } from "three/webgpu";
import { useThreeContext } from "../ThreeProvider";

const IMAGE_COUNT = 5;

const imagePaths = Array.from(
  { length: IMAGE_COUNT },
  (_, i) =>
    `${import.meta.env.BASE_URL}/images/${String(i + 1).padStart(3, "0")}.webp`,
);

export const useDemoImages = () => {
  const { atoms } = useThreeContext();
  const store = useStore();

  useEffect(() => {
    const loader = new ImageLoader();
    const loaded: HTMLImageElement[] = [];
    imagePaths.forEach((path, i) => {
      loader.load(path, (image) => {
        loaded[i] = image;
        store.set(atoms.images, [...loaded]);
      });
    });
  }, [store, atoms.images]);
};
