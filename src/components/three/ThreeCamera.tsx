import {
  PerspectiveCamera,
  type PerspectiveCameraProps,
} from "@react-three/drei";

type ThreeCameraProps = Omit<
  PerspectiveCameraProps,
  "position" | "makeDefault" | "manual"
>;

export const ThreeCamera = ({ ...props }: ThreeCameraProps) => {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 5]} {...props} />
      {/* <CameraControls makeDefault /> */}
    </>
  );
};
