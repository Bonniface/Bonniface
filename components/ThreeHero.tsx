// @ts-nocheck
import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Sphere, Float, Stars, TorusKnot, Icosahedron, Sparkles as DreiSparkles } from '@react-three/drei';
import * as THREE from 'three';

interface ThreeHeroProps {
  scrollProgress: number;
}

// SCENE 1: HERO - The "Core"
const AnimatedSphere = ({ scrollProgress }: { scrollProgress: number }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHover] = useState(false);
  
  useFrame((state) => {
    if (!meshRef.current) return;

    // Visibility: Fade out logic
    const opacity = 1 - Math.max(0, (scrollProgress - 0.2) * 5); 
    
    if (opacity <= 0) {
        meshRef.current.visible = false;
        return;
    }
    meshRef.current.visible = true;

    // Rotation
    const t = state.clock.getElapsedTime();
    meshRef.current.rotation.x = t * 0.15;
    meshRef.current.rotation.y = t * 0.2;

    // Mouse Parallax
    const { mouse, viewport } = state;
    const targetX = (mouse.x * viewport.width / 4) + (viewport.width / 4); 
    const targetY = (mouse.y * viewport.height / 4);
    
    // Position Logic
    const scrollMoveX = scrollProgress * 15; 
    
    meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, targetX + scrollMoveX, 0.05);
    meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, targetY, 0.05);
    
    // Pulsation Logic
    let pulseIntensity = 0.05;
    if (scrollProgress >= 0.2 && scrollProgress <= 0.4) {
        pulseIntensity = 0.2;
    } else if (scrollProgress > 0.1 && scrollProgress < 0.2) {
        pulseIntensity = THREE.MathUtils.lerp(0.05, 0.2, (scrollProgress - 0.1) * 10);
    }
    
    const pulse = 1 + Math.sin(t * 2) * pulseIntensity;

    // Scale Logic
    const baseScale = viewport.width < 768 ? 1.2 : 1.8;
    const hoverScale = hovered ? 1.05 : 1.0;
    const finalScale = baseScale * hoverScale * pulse * Math.max(0, opacity);
    
    meshRef.current.scale.setScalar(THREE.MathUtils.lerp(meshRef.current.scale.x, finalScale, 0.1));
  });

  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.5}>
      <Sphere 
        ref={meshRef} 
        args={[1, 32, 32]} // Reduced segments from 64 to 32
        onPointerOver={() => setHover(true)}
        onPointerOut={() => setHover(false)}
      >
        <MeshDistortMaterial
          color={hovered ? "#3b82f6" : "#4338ca"}
          distort={0.3} 
          speed={1.5} 
          roughness={0.2}
          metalness={0.7}
          emissive="#1e1b4b"
          emissiveIntensity={0.2}
        />
      </Sphere>
    </Float>
  );
};

// SCENE 2: ABOUT / COLLAB - The "Structure"
const SecondaryScene = ({ scrollProgress }: { scrollProgress: number }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if(!groupRef.current) return;
    
    let visibility = 0;
    if (scrollProgress > 0.15 && scrollProgress < 0.55) {
        if (scrollProgress < 0.25) visibility = (scrollProgress - 0.15) * 10;
        else if (scrollProgress > 0.45) visibility = (0.55 - scrollProgress) * 10;
        else visibility = 1;
    }

    if (visibility <= 0) {
        groupRef.current.visible = false;
        return;
    }
    groupRef.current.visible = true;
    
    const { viewport } = state;
    const activeProgress = (scrollProgress - 0.2) / 0.3;
    const targetX = THREE.MathUtils.lerp(-viewport.width/3, -viewport.width/4, Math.min(1, Math.max(0, activeProgress)));
    
    groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetX, 0.05);
    groupRef.current.rotation.y += 0.003;
    groupRef.current.rotation.x += 0.001;
    groupRef.current.scale.setScalar(visibility * (viewport.width < 768 ? 0.7 : 1.1));
  });

  return (
    <group ref={groupRef} position={[-5, 0, -2]}>
      <TorusKnot args={[0.8, 0.2, 64, 16]} > {/* Reduced detail */}
        <meshStandardMaterial 
            color="#ec4899" 
            wireframe 
            emissive="#be185d"
            emissiveIntensity={0.3}
            transparent
            opacity={0.6}
        />
      </TorusKnot>
      <DreiSparkles count={15} scale={3} size={2} speed={0.3} opacity={0.4} color="#fbcfe8" />
    </group>
  )
}

// SCENE 3: PROCESS - The "Network"
const NeuralNetworkScene = ({ scrollProgress }: { scrollProgress: number }) => {
    const groupRef = useRef<THREE.Group>(null);
  
    useFrame((state) => {
      if(!groupRef.current) return;
      
      let visibility = 0;
      if (scrollProgress > 0.55 && scrollProgress < 0.95) {
          if (scrollProgress < 0.65) visibility = (scrollProgress - 0.55) * 10;
          else if (scrollProgress > 0.85) visibility = (0.95 - scrollProgress) * 10;
          else visibility = 1;
      }
  
      if (visibility <= 0) {
          groupRef.current.visible = false;
          return;
      }
      groupRef.current.visible = true;
      
      const t = state.clock.getElapsedTime();
      groupRef.current.rotation.y = t * 0.08;
      
      const { viewport } = state;
      const targetX = viewport.width < 768 ? 0 : viewport.width / 4;

      groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetX, 0.05);

      const pulse = 1 + Math.sin(t * 1.2) * 0.04;
      groupRef.current.scale.setScalar(visibility * pulse * (viewport.width < 768 ? 0.7 : 1.1));
    });
  
    return (
      <group ref={groupRef}>
        <mesh>
          <Icosahedron args={[2, 0]}> {/* Lower poly icosahedron */}
            <meshBasicMaterial color="#3b82f6" wireframe transparent opacity={0.15} />
          </Icosahedron>
        </mesh>
        
        <mesh>
            <Icosahedron args={[1, 0]}>
                <meshStandardMaterial color="#60a5fa" emissive="#2563eb" emissiveIntensity={1} wireframe={false} />
            </Icosahedron>
        </mesh>

        <Float speed={3} rotationIntensity={0.5} floatIntensity={1}>
            <mesh position={[2.2, 0.8, 0]}>
                <sphereGeometry args={[0.12, 8, 8]} />
                <meshStandardMaterial color="#ec4899" emissive="#ec4899" emissiveIntensity={0.8} />
            </mesh>
        </Float>
        <Float speed={2.5} rotationIntensity={0.5} floatIntensity={1}>
            <mesh position={[-1.8, -1.2, 0.8]}>
                <sphereGeometry args={[0.08, 8, 8]} />
                <meshStandardMaterial color="#ec4899" emissive="#ec4899" emissiveIntensity={0.8} />
            </mesh>
        </Float>
      </group>
    )
  }

const SceneContent = ({ scrollProgress }: { scrollProgress: number }) => {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={1} color="#ffffff" />
      <pointLight position={[-5, -5, -5]} intensity={0.5} color="#3b82f6" />
      
      <Stars radius={100} depth={50} count={1500} factor={4} saturation={0} fade speed={0.5} />
      <fog attach="fog" args={['#020617', 5, 25]} /> 
      
      <AnimatedSphere scrollProgress={scrollProgress} />
      <SecondaryScene scrollProgress={scrollProgress} />
      <NeuralNetworkScene scrollProgress={scrollProgress} />
    </>
  );
};

const ThreeHero: React.FC<ThreeHeroProps> = ({ scrollProgress }) => {
  return (
    <div className="absolute inset-0 w-full h-full -z-10 bg-navy-950">
      <Canvas 
        camera={{ position: [0, 0, 6], fov: 45 }} 
        dpr={Math.min(window.devicePixelRatio, 1.5)} // Cap DPR for performance
        shadows={false} // Disable shadows to save resources
        gl={{ 
            antialias: false, // Antialiasing is heavy on mobile GPUs
            alpha: true, 
            powerPreference: "low-power", // Request efficient GPU usage
            failIfMajorPerformanceCaveat: true, // Fail gracefully if browser/drivers are problematic
            stencil: false,
            depth: true
        }}
      >
        <React.Suspense fallback={null}>
           <SceneContent scrollProgress={scrollProgress} />
        </React.Suspense>
      </Canvas>
    </div>
  );
};

export default React.memo(ThreeHero);