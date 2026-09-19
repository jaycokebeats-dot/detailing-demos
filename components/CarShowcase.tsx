"use client";

import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  useGLTF,
  Center,
  ContactShadows,
  Environment,
  Lightformer,
  OrbitControls,
  Html,
} from "@react-three/drei";
import type { Group } from "three";

const MODEL = "/models/camaro.glb";

// El auto mide 4.76 de largo: girando barre un circulo de radio ~2.6.
// Con fov 32 hay que estar a ~11 de distancia para que no se salga del cuadro
// en ninguna posicion de la rotacion.
const CAMERA = { position: [6.6, 2.9, 8.4] as [number, number, number], fov: 32 };

function Car() {
  const group = useRef<Group>(null);
  const { scene } = useGLTF(MODEL);

  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.25;
  });

  return (
    <group ref={group}>
      <Center>
        <primitive object={scene} />
      </Center>
    </group>
  );
}

function Loader() {
  return (
    <Html center>
      <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-slate-500">
        <span className="size-1.5 rounded-full bg-slate-500 animate-pulse" />
        Cargando
      </div>
    </Html>
  );
}

export default function CarShowcase() {
  return (
    <div className="relative w-full aspect-square">
      <Canvas
        shadows={false}
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true }}
        camera={CAMERA}
      >
        <Suspense fallback={<Loader />}>
          <Car />

          <ContactShadows
            position={[0, -0.69, 0]}
            opacity={0.7}
            scale={9}
            blur={2.2}
            far={2}
            color="#000000"
          />

          {/* Estudio de fotos armado a mano: las tiras de luz son lo que dibuja
              los reflejos largos sobre la carroceria. Sin HDR externo. */}
          <Environment resolution={256}>
            <Lightformer intensity={4} rotation-x={Math.PI / 2} position={[0, 5, -9]} scale={[10, 10, 1]} />
            <Lightformer intensity={2} rotation-y={Math.PI / 2} position={[-5, 1, -1]} scale={[20, 0.8, 1]} />
            <Lightformer intensity={2} rotation-y={Math.PI / 2} position={[-5, -1, -1]} scale={[20, 0.5, 1]} />
            <Lightformer intensity={2} rotation-y={-Math.PI / 2} position={[5, 0, 0]} scale={[20, 1, 1]} />
            <Lightformer intensity={1.2} rotation-x={-Math.PI / 2} position={[0, -4, 0]} scale={[12, 12, 1]} />
          </Environment>

          <OrbitControls
            makeDefault
            enableZoom={false}
            enablePan={false}
            minPolarAngle={Math.PI / 3.2}
            maxPolarAngle={Math.PI / 2.05}
          />
        </Suspense>
      </Canvas>

    </div>
  );
}

useGLTF.preload(MODEL);
