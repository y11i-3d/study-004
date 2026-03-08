import {
  cAction,
  cFolder,
  cNumber,
  cOptions,
  cString,
} from "@/scripts/atom/controls/params";
import { useAtomControls } from "@/scripts/atom/controls/useAtomControls";
import { dFloat } from "@/scripts/atom/uniforms/derivedAtoms";
import { useAtomUniforms } from "@/scripts/atom/uniforms/useAtomUniforms";
import { atom } from "jotai";
import { useMemo } from "react";

const COUNT = 5;

export const useDemoStates = () => {
  const atoms = useMemo(() => {
    const transition = atom(0);
    const currentIndex = atom(0);
    const targetIndex = atom(0);

    return {
      transition,
      currentIndex,
      viewportAspect: atom(1),
      images: atom<HTMLImageElement[] | null>(null),

      duration: atom(1.2),
      ease: atom("expo.inOut"),
      stiffness: atom(8),
      damping: atom(1),
      easeMode: atom("Hybrid"),
      tweenState: atom("None"),

      targetIndex,
      next: atom(null, (get, set) => {
        set(targetIndex, (get(targetIndex) + 1) % COUNT);
      }),
      prev: atom(null, (get, set) => {
        set(targetIndex, (get(targetIndex) - 1 + COUNT) % COUNT);
      }),
    };
  }, []);

  const uniforms = useAtomUniforms({
    mixProgress: dFloat(
      (get) => get(atoms.transition) - get(atoms.currentIndex),
    ),
    viewportAspect: dFloat((get) => get(atoms.viewportAspect)),
  });

  const controlParams = useMemo(
    () => ({
      easeMode: cOptions(atoms.easeMode, {
        options: {
          Hybrid: "Hybrid",
          "Robert Penner": "Robert Penner",
          Spring: "Spring",
        },
      }),
      targetIndex: cNumber(atoms.targetIndex, { min: 0, max: 4, step: 1 }),
      prev: cAction(atoms.prev, { label: "Prev [q]" }),
      next: cAction(atoms.next, { label: "Next [w]" }),

      penner: cFolder({
        ease: cOptions(atoms.ease, {
          options: {
            expo: "expo.inOut",
            circ: "circ.inOut",
            quint: "quint.inOut",
            quart: "quart.inOut",
            cubic: "cubic.inOut",
            quad: "quad.inOut",
            sine: "sine.inOut",
          },
        }),
        duration: cNumber(atoms.duration, { min: 0.4, max: 1.6, step: 0.4 }),
      }),

      spring: cFolder({
        stiffness: cNumber(atoms.stiffness, { min: 1, max: 16, step: 1 }),
        damping: cNumber(atoms.damping, { min: 0.5, max: 1.5, step: 0.1 }),
      }),

      transition: cNumber(atoms.transition),
      tweenState: cString(atoms.tweenState),
    }),

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useAtomControls(controlParams);

  return {
    atoms,
    uniforms,
  };
};

export type DemoAtoms = ReturnType<typeof useDemoStates>["atoms"];
export type DemoUniforms = ReturnType<typeof useDemoStates>["uniforms"];
