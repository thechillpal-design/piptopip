import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float } from '@react-three/drei';
import { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';

function FloatingCore() {
    const meshRef = useRef<THREE.Mesh>(null);
    const [geometryType, setGeometryType] = useState(0);

    // Dynamic rotation
    useFrame((state) => {
        if (!meshRef.current) return;
        meshRef.current.rotation.x = state.clock.elapsedTime * 0.2;
        meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;

        // Add a breathing emissive effect
        const material = meshRef.current.material as THREE.MeshStandardMaterial;
        material.emissiveIntensity = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.5;
    });

    // Cycle geometries every 5 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setGeometryType(prev => (prev + 1) % 3);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <Float speed={2} rotationIntensity={1} floatIntensity={2}>
            <mesh ref={meshRef}>
                {geometryType === 0 && <torusKnotGeometry args={[9, 2.5, 128, 16]} />}
                {geometryType === 1 && <icosahedronGeometry args={[10, 1]} />}
                {geometryType === 2 && <octahedronGeometry args={[10, 0]} />}

                <meshStandardMaterial
                    color="#F97316"
                    wireframe
                    emissive="#F97316"
                    emissiveIntensity={2}
                    transparent
                    opacity={0.3}
                />
            </mesh>
        </Float>
    );
}

export default function HeroBackground() {
    return (
        <div className="fixed inset-0 z-0 opacity-40 mix-blend-screen pointer-events-none transition-all duration-1000">
            <Canvas camera={{ position: [0, 0, 40], fov: 60 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} color="#0EA5E9" intensity={150} />
                <pointLight position={[-10, -10, -10]} color="#F97316" intensity={150} />
                <FloatingCore />
                <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.8} />
            </Canvas>
        </div>
    );
}
