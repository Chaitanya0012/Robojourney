import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid, Environment, ContactShadows, PerspectiveCamera } from "@react-three/drei";
import { Physics } from "@react-three/cannon";
import { DifferentialRobot } from "./DifferentialRobot";
import { Obstacle } from "./Obstacle";
import { Telemetry } from "@/hooks/useSimulator";

interface SimulatorCanvasProps {
  telemetry: Telemetry;
}

export const SimulatorCanvas = ({ telemetry }: SimulatorCanvasProps) => {
  return (
    <div className="w-full h-[500px] rounded-lg overflow-hidden relative bg-gradient-to-b from-[#0a0d1f] via-[#1a1340] to-[#2d1b4e] shadow-glow-cyan">
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[4, 3, 4]} fov={60} />
        
        {/* MIT-inspired 3-point lighting */}
        <ambientLight intensity={0.3} color="#b8d4ff" />
        <spotLight 
          position={[10, 15, 10]} 
          angle={0.3} 
          penumbra={0.8} 
          intensity={1.5}
          color="#ffffff"
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-bias={-0.0001}
        />
        <spotLight 
          position={[-8, 10, -8]} 
          angle={0.4} 
          penumbra={1} 
          intensity={0.8}
          color="#7c3aed"
          castShadow
        />
        <pointLight position={[0, 3, 0]} intensity={0.5} color="#00d4ff" distance={10} decay={2} />
        
        {/* HDR Environment for realistic reflections */}
        <Environment preset="city" background={false} />
        
        {/* Subtle fog for depth */}
        <fog attach="fog" args={["#0a0d1f", 5, 25]} />
        
        <Physics gravity={[0, -9.81, 0]}>
          <DifferentialRobot telemetry={telemetry} />
          
          {/* Matte laboratory floor */}
          <mesh receiveShadow position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[20, 20]} />
            <meshStandardMaterial 
              color="#1a1a2e" 
              roughness={0.9}
              metalness={0.1}
              envMapIntensity={0.3}
            />
          </mesh>
          
          {/* Obstacles with modern materials */}
          <Obstacle position={[1.5, 0.25, 0]} size={[0.3, 0.5, 0.3]} />
          <Obstacle position={[-1, 0.25, 1]} size={[0.4, 0.5, 0.4]} />
          <Obstacle position={[0, 0.25, -1.5]} size={[0.5, 0.5, 0.3]} />
        </Physics>
        
        {/* Contact shadows for realism */}
        <ContactShadows 
          position={[0, 0.01, 0]} 
          opacity={0.6} 
          scale={15} 
          blur={2}
          far={2}
          color="#000033"
        />
        
        {/* Grid with futuristic style */}
        <Grid 
          args={[20, 20]} 
          cellSize={0.5} 
          cellColor="#00d4ff" 
          sectionColor="#7c3aed" 
          fadeDistance={25}
          fadeStrength={1.5}
          infiniteGrid={false}
        />
        
        <OrbitControls 
          makeDefault 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={2}
          maxDistance={15}
          maxPolarAngle={Math.PI / 2.1}
        />
      </Canvas>
      
      {/* Corner overlay labels */}
      <div className="absolute top-4 left-4 text-xs font-mono text-primary/60">
        <span className="text-glow-cyan">ROBOSPHERE_SIM_V1.0</span>
      </div>
    </div>
  );
};
