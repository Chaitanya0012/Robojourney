import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useBox, useSphere } from "@react-three/cannon";
import * as THREE from "three";
import { Telemetry } from "@/hooks/useSimulator";

interface DifferentialRobotProps {
  telemetry: Telemetry;
}

export const DifferentialRobot = ({ telemetry }: DifferentialRobotProps) => {
  const wheelBase = 0.12; // 12cm between wheels
  const wheelRadius = 0.03; // 3cm wheel radius

  // Robot body
  const [bodyRef, bodyApi] = useBox(() => ({
    mass: 1,
    position: [0, 0.05, 0],
    args: [0.15, 0.05, 0.1], // width, height, depth
  }));

  // Track current velocity for physics updates
  const velocityRef = useRef({ left: 0, right: 0 });

  useEffect(() => {
    velocityRef.current = {
      left: telemetry.leftMotor,
      right: telemetry.rightMotor,
    };
  }, [telemetry.leftMotor, telemetry.rightMotor]);

  // Track rotation
  const rotationRef = useRef(0);

  // Update physics based on motor commands
  useFrame((state, delta) => {
    const { left, right } = velocityRef.current;
    
    // Differential drive kinematics
    const wheelCircumference = 2 * Math.PI * wheelRadius;
    const linearVelocity = ((left + right) / 2) * wheelCircumference;
    const angularVelocity = ((right - left) * wheelCircumference) / wheelBase;

    // Update rotation
    rotationRef.current += angularVelocity * delta;

    // Apply velocity in world coordinates
    const forwardX = Math.sin(rotationRef.current) * linearVelocity;
    const forwardZ = Math.cos(rotationRef.current) * linearVelocity;
    
    bodyApi.velocity.set(forwardX, 0, forwardZ);
    bodyApi.angularVelocity.set(0, angularVelocity, 0);
  });

  return (
    <group>
      {/* Floating labels */}
      <group>
        {/* Direction label */}
        <mesh position={[0, 0.15, -0.05]}>
          <planeGeometry args={[0.12, 0.03]} />
          <meshBasicMaterial color="#00d4ff" transparent opacity={0.7} />
        </mesh>
        
        {/* Sensor label */}
        <mesh position={[0, 0.12, -0.08]}>
          <planeGeometry args={[0.1, 0.025]} />
          <meshBasicMaterial color="#ff3366" transparent opacity={0.7} />
        </mesh>
      </group>

      {/* Robot body - Anodized aluminum aesthetic */}
      <mesh ref={bodyRef as any} castShadow receiveShadow>
        <boxGeometry args={[0.15, 0.05, 0.1]} />
        <meshStandardMaterial 
          color="#4a8bdb"
          roughness={0.3}
          metalness={0.8}
          envMapIntensity={1.2}
        />
      </mesh>

      {/* Left wheel - Rubber with tread */}
      <mesh position={[-wheelBase / 2, 0.03, 0]} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
        <cylinderGeometry args={[wheelRadius, wheelRadius, 0.02, 16]} />
        <meshStandardMaterial 
          color="#1a1a1a"
          roughness={0.95}
          metalness={0.05}
        />
      </mesh>

      {/* Right wheel - Rubber with tread */}
      <mesh position={[wheelBase / 2, 0.03, 0]} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
        <cylinderGeometry args={[wheelRadius, wheelRadius, 0.02, 16]} />
        <meshStandardMaterial 
          color="#1a1a1a"
          roughness={0.95}
          metalness={0.05}
        />
      </mesh>

      {/* Ultrasonic sensor - Glossy plastic with emissive glow */}
      <mesh position={[0, 0.05, -0.06]} castShadow>
        <boxGeometry args={[0.03, 0.02, 0.02]} />
        <meshStandardMaterial 
          color="#ff3366"
          roughness={0.2}
          metalness={0.1}
          emissive="#ff3366"
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* Direction indicator - Glowing neon accent */}
      <mesh position={[0, 0.08, -0.03]} rotation={[-Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.02, 0.04, 3]} />
        <meshStandardMaterial 
          color="#00d4ff"
          roughness={0.4}
          metalness={0.6}
          emissive="#00d4ff"
          emissiveIntensity={0.5}
        />
      </mesh>
      
      {/* Sensor beam visualization when active */}
      {telemetry.sensors.ultrasonic < 1.5 && (
        <mesh position={[0, 0.05, -0.06 - telemetry.sensors.ultrasonic / 2]} rotation={[0, 0, 0]}>
          <cylinderGeometry args={[0.01, 0.015, telemetry.sensors.ultrasonic, 8]} />
          <meshBasicMaterial 
            color="#ff3366" 
            transparent 
            opacity={0.3}
          />
        </mesh>
      )}
    </group>
  );
};
