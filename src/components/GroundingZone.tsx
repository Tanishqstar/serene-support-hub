import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows, Float } from "@react-three/drei";
import { motion } from "framer-motion";

const PlaceholderSphere = () => (
  <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.8}>
    <mesh>
      <icosahedronGeometry args={[1, 3]} />
      <meshStandardMaterial
        color="#5f9a8e"
        roughness={0.6}
        metalness={0.1}
        wireframe
        transparent
        opacity={0.5}
      />
    </mesh>
  </Float>
);

const GroundingZone = () => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="flex h-full flex-col"
    >
      <div className="border-b border-border px-6 py-4">
        <h2 className="font-serif text-lg text-foreground">Grounding Zone</h2>
        <p className="text-xs text-muted-foreground">Interact with calming visuals</p>
      </div>

      <div className="flex-1 relative min-h-[200px]">
        <Canvas
          camera={{ position: [0, 1, 4], fov: 45 }}
          className="rounded-b-xl"
        >
          <ambientLight intensity={0.4} />
          <directionalLight position={[5, 5, 5]} intensity={0.6} />
          <Suspense fallback={null}>
            <PlaceholderSphere />
            <ContactShadows
              position={[0, -1.5, 0]}
              opacity={0.3}
              scale={6}
              blur={2}
            />
            <Environment preset="sunset" />
          </Suspense>
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate
            autoRotateSpeed={0.5}
            maxPolarAngle={Math.PI / 1.8}
            minPolarAngle={Math.PI / 4}
          />
        </Canvas>

        <div className="absolute bottom-4 left-0 right-0 text-center">
          <p className="text-xs text-muted-foreground animate-breathe">
            Drag to interact • .glb model ready
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default GroundingZone;
