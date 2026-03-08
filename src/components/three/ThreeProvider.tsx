import { createContext, useContext } from "react";
import {
  useDemoStates,
  type DemoAtoms,
  type DemoUniforms,
} from "./hooks/useDemoStates";

type ThreeContextValue = {
  atoms: DemoAtoms;
  uniforms: DemoUniforms;
};

const ThreeContext = createContext<ThreeContextValue | null>(null);

export const ThreeProvider = ({ children }: { children: React.ReactNode }) => {
  const demoStates = useDemoStates();

  return (
    <ThreeContext.Provider value={demoStates}>{children}</ThreeContext.Provider>
  );
};

export const useThreeContext = () => {
  const ctx = useContext(ThreeContext);
  if (!ctx)
    throw new Error("useThreeContext must be used within ThreeProvider");
  return ctx;
};
