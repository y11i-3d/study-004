import gsap from "gsap";
import { useStore } from "jotai";
import { useEffect } from "react";
import type { DemoAtoms } from "./useDemoStates";

const COUNT = 5;
const SETTLE_THRESHOLD = 0.001;
const MIN_DURATION = 0.2;
const MAX_DURATION = 2.0;

const createTween = () => {
  let velocity = 0;
  let sampleValue = 0;
  let sampleTime = performance.now();

  return (
    current: number,
    target: number,
    duration: number,
    ease: string,
    damping: number,
    stiffness: number,
    easeMode: string,
    onValue: (v: number) => void,
    onState: (state: string) => void,
  ) => {
    const distance = target - current;
    if (Math.abs(distance) < 1e-9) return null;

    const hasVelocity = Math.abs(velocity / distance) > 1e-6;
    const usePenner =
      easeMode === "Robert Penner" || (easeMode === "Hybrid" && !hasVelocity);

    if (usePenner) {
      onState("Robert Penner");
      velocity = 0;
      sampleValue = current;
      sampleTime = performance.now();

      return gsap.to(
        { value: 0 },
        {
          value: 1,
          duration,
          ease,
          onUpdate() {
            const v = this.targets()[0].value;
            const now = performance.now();
            const dt = (now - sampleTime) / 1000;
            const newValue = current + distance * v;
            if (dt > 0) {
              velocity = (newValue - sampleValue) / dt;
            }
            sampleValue = newValue;
            sampleTime = now;
            onValue(newValue);
          },
          onComplete() {
            velocity = 0;
            onState("None");
          },
        },
      );
    }

    const v0 = velocity / distance;
    const zeta = damping;
    const omega = stiffness;

    let raw: (t: number) => number;

    if (zeta === 1) {
      const C1 = -1;
      const C2 = v0 - omega;
      raw = (t) => 1 + (C1 + C2 * t) * Math.exp(-omega * t);
    } else if (zeta > 1) {
      const disc = Math.sqrt(zeta * zeta - 1);
      const r1 = -omega * (zeta - disc);
      const r2 = -omega * (zeta + disc);
      const C2 = (v0 + r1) / (r2 - r1);
      const C1 = -1 - C2;
      raw = (t) => 1 + C1 * Math.exp(r1 * t) + C2 * Math.exp(r2 * t);
    } else {
      const omegaD = omega * Math.sqrt(1 - zeta * zeta);
      const A = 1;
      const B = (zeta * omega - v0) / omegaD;
      raw = (t) => {
        const decay = Math.exp(-zeta * omega * t);
        return (
          1 - decay * (A * Math.cos(omegaD * t) + B * Math.sin(omegaD * t))
        );
      };
    }

    onState("Spring");

    let settledTime = 0;
    const step = 1 / 120;
    for (let t = step; t <= MAX_DURATION; t += step) {
      if (Math.abs(raw(t) - 1) < SETTLE_THRESHOLD) {
        settledTime = t;
        break;
      }
    }
    if (settledTime === 0) settledTime = MAX_DURATION;
    const tweenDuration = Math.max(settledTime, MIN_DURATION);

    const end = raw(tweenDuration);
    const springEase = (p: number) => raw(p * tweenDuration) / end;

    sampleValue = current;
    sampleTime = performance.now();

    return gsap.to(
      { value: 0 },
      {
        value: 1,
        duration: tweenDuration,
        ease: springEase,
        onUpdate() {
          const p = this.progress();
          const springValue = current + distance * springEase(p);
          const now = performance.now();
          const dt = (now - sampleTime) / 1000;
          if (p >= 1) {
            velocity = 0;
          } else if (dt > 0) {
            velocity = (springValue - sampleValue) / dt;
          }
          sampleValue = springValue;
          sampleTime = now;
          onValue(springValue);
        },
        onComplete() {
          onState("None");
        },
      },
    );
  };
};

const nearestTarget = (current: number, targetIndex: number): number => {
  const base = Math.round(current);
  const baseMod = ((base % COUNT) + COUNT) % COUNT;
  let delta = targetIndex - baseMod;
  if (delta > COUNT / 2) delta -= COUNT;
  if (delta < -COUNT / 2) delta += COUNT;
  return base + delta;
};

export const useDemoAnimation = (atoms: DemoAtoms) => {
  const store = useStore();

  useEffect(() => {
    let tween: gsap.core.Tween | null = null;
    const doTween = createTween();

    const animateTo = (target: number) => {
      const current = store.get(atoms.transition);
      tween?.kill();
      const duration = store.get(atoms.duration);
      const ease = store.get(atoms.ease);
      const damping = store.get(atoms.damping);
      const stiffness = store.get(atoms.stiffness);
      const easeMode = store.get(atoms.easeMode);
      tween = doTween(
        current,
        target,
        duration,
        ease,
        damping,
        stiffness,
        easeMode,
        (v: number) => {
          store.set(atoms.transition, v);
        },
        (state: string) => {
          store.set(atoms.tweenState, state);
        },
      );
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key.toLowerCase()) {
        case "q":
          store.set(atoms.prev);
          break;
        case "w":
          store.set(atoms.next);
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    const unsubs = [
      store.sub(atoms.targetIndex, () => {
        const current = store.get(atoms.transition);
        const i = store.get(atoms.targetIndex);
        animateTo(nearestTarget(current, i));
      }),
    ];

    return () => {
      tween?.kill();
      window.removeEventListener("keydown", handleKeyDown);
      unsubs.forEach((u) => u());
    };
  }, [store, atoms]);
};
