// @ts-nocheck
import React, { useRef, useState } from 'react';
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
    // Visible from 0 to 0.2, fades out by 0.4 to allow pulsation effect to be seen
    const opacity = 1 - Math.max(0, (scrollProgress - 0.2) * 5); 
    
    if (opacity <= 0) {
        meshRef.current.visible = false;
        return;
    }
    meshRef.current.visible = true;

    // Rotation
    const t = state.clock.getElapsedTime();
    meshRef.current.rotation.x = t * 0.2;
    meshRef.current.rotation.y = t * 0.3;

    // Mouse Parallax
    const { mouse, viewport } = state;
    // Calculate target position based on mouse (-1 to 1)
    // We want the sphere on the right side mostly
    const targetX = (mouse.x * viewport.width / 4) + (viewport.width / 4); 
    const targetY = (mouse.y * viewport.height / 4);
    
    // Position Logic: Moves right and shrinks as we scroll down to transition away
    const scrollMoveX = scrollProgress * 20; 
    
    // Smooth lerp
    meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, targetX + scrollMoveX, 0.1);
    meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, targetY, 0.1);
    
    // Pulsation Logic
    // Base pulse
    let pulseIntensity = 0.05;
    
    // Make the pulsation more pronounced between 0.2 and 0.4
    if (scrollProgress >= 0.2 && scrollProgress <= 0.4) {
        // High intensity pulse during the transition/fade out
        pulseIntensity = 0.25;
    } else if (scrollProgress > 0.1 && scrollProgress < 0.2) {
        // Ramp up intensity
        pulseIntensity = THREE.MathUtils.lerp(0.05, 0.25, (scrollProgress - 0.1) * 10);
    }
    
    const pulse = 1 + Math.sin(t * 3) * pulseIntensity;

    // Scale Logic
    const baseScale = viewport.width < 768 ? 1.5 : 2.2; // Smaller on mobile
    const hoverScale = hovered ? 1.1 : 1.0;
    
    // Combine base scale, hover, pulse, and opacity fade
    const finalScale = baseScale * hoverScale * pulse * Math.max(0, opacity);
    
    meshRef.current.scale.setScalar(THREE.MathUtils.lerp(meshRef.current.scale.x, finalScale, 0.1));
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <Sphere 
        ref={meshRef} 
        args={[1, 64, 64]} 
        onPointerOver={() => setHover(true)}
        onPointerOut={() => setHover(false)}
      >
        <MeshDistortMaterial
          color={hovered ? "#3b82f6" : "#4338ca"} // Blue to Indigo
          distort={0.4} 
          speed={2} 
          roughness={0.1}
          metalness={0.8}
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
    
    // Visibility: 0.15 -> 0.55
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
    
    // Position: Moves from left
    const { viewport } = state;
    const activeProgress = (scrollProgress - 0.2) / 0.3;
    const targetX = THREE.MathUtils.lerp(-viewport.width/3, -viewport.width/4, Math.min(1, Math.max(0, activeProgress)));
    
    groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetX, 0.1);
    groupRef.current.rotation.y += 0.005;
    groupRef.current.rotation.x += 0.002;
    groupRef.current.scale.setScalar(visibility * (viewport.width < 768 ? 0.8 : 1.2));
  });

  return (
    <group ref={groupRef} position={[-5, 0, -2]}>
      <TorusKnot args={[0.8, 0.25, 128, 32]} >
        <meshStandardMaterial 
            color="#ec4899" 
            wireframe 
            emissive="#be185d"
            emissiveIntensity={0.5}
            transparent
            opacity={0.8}
        />
      </TorusKnot>
      <DreiSparkles count={20} scale={3} size={2} speed={0.4} opacity={0.5} color="#fbcfe8" />
    </group>
  )
}

// SCENE 3: PROCESS - The "Network"
const NeuralNetworkScene = ({ scrollProgress }: { scrollProgress: number }) => {
    const groupRef = useRef<THREE.Group>(null);
  
    useFrame((state) => {
      if(!groupRef.current) return;
      
      // Visibility: 0.55 -> 0.95
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
      
      // Rotate
      const t = state.clock.getElapsedTime();
      groupRef.current.rotation.y = t * 0.1;
      groupRef.current.rotation.z = Math.sin(t * 0.2) * 0.1;
      
      const { viewport } = state;
      const targetX = viewport.width < 768 ? 0 : viewport.width / 4;

      groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetX, 0.1);

      const pulse = 1 + Math.sin(t * 1.5) * 0.05;
      groupRef.current.scale.setScalar(visibility * pulse * (viewport.width < 768 ? 0.8 : 1.2));
    });
  
    return (
      <group ref={groupRef}>
        {/* Main Network Core */}
        <mesh>
          <Icosahedron args={[2, 1]}>
            <meshBasicMaterial color="#3b82f6" wireframe transparent opacity={0.2} />
          </Icosahedron>
        </mesh>
        
        {/* Inner Core */}
        <mesh>
            <Icosahedron args={[1, 0]}>
                <meshStandardMaterial color="#60a5fa" emissive="#2563eb" emissiveIntensity={2} wireframe={false} />
            </Icosahedron>
        </mesh>

        {/* Orbiting particles */}
        <Float speed={5} rotationIntensity={1} floatIntensity={2}>
            <mesh position={[2.5, 1, 0]}>
                <sphereGeometry args={[0.15, 16, 16]} />
                <meshStandardMaterial color="#ec4899" emissive="#ec4899" emissiveIntensity={1} />
            </mesh>
        </Float>
        <Float speed={4} rotationIntensity={1} floatIntensity={2}>
            <mesh position={[-2, -1.5, 1]}>
                <sphereGeometry args={[0.1, 16, 16]} />
                <meshStandardMaterial color="#ec4899" emissive="#ec4899" emissiveIntensity={1} />
            </mesh>
        </Float>
      </group>
    )
  }

const SceneContent = ({ scrollProgress }: { scrollProgress: number }) => {
  return (
    <>
      <ambientLight intensity={0.2} />
      <directionalLight position={[10, 10, 5]} intensity={1.5} color="#ffffff" />
      <pointLight position={[-10, -10, -10]} intensity={1} color="#3b82f6" />
      <pointLight position={[0, 0, 5]} intensity={0.5} color="#ec4899" />
      
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <fog attach="fog" args={['#020617', 5, 20]} /> 
      
      <AnimatedSphere scrollProgress={scrollProgress} />
      <SecondaryScene scrollProgress={scrollProgress} />
      <NeuralNetworkScene scrollProgress={scrollProgress} />
    </>
  );
};

const ThreeHero: React.FC<ThreeHeroProps> = ({ scrollProgress }) => {
  return (
    <div className="absolute inset-0 w-full h-full -z-10">
      <Canvas 
        camera={{ position: [0, 0, 5], fov: 45 }} 
        dpr={[1, 2]} 
        gl={{ antialias: true, alpha: true, toneMapping: THREE.ReinhardToneMapping, toneMappingExposure: 1.5 }}
      >
        <React.Suspense fallback={null}>
           <SceneContent scrollProgress={scrollProgress} />
        </React.Suspense>
      </Canvas>
    </div>
  );
};

export default React.memo(ThreeHero);