import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function ParticleBackground({ count = 400 }) {
    const mesh = useRef();
    
    // Create particles with dark colors for light theme visibility
    const particles = useMemo(() => {
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const sizes = new Float32Array(count);
        
        // Dark color palette for light backgrounds (indigo, purple, dark blue)
        const colorPalette = [
            new THREE.Color(0x4f46e5), // indigo-600
            new THREE.Color(0x6366f1), // indigo-500
            new THREE.Color(0x7c3aed), // violet-600
            new THREE.Color(0x8b5cf6), // violet-500
            new THREE.Color(0x4338ca), // indigo-700
            new THREE.Color(0x5b21b6), // violet-700
        ];
        
        for (let i = 0; i < count; i++) {
            // Position particles in 3D space
            positions[i * 3] = (Math.random() - 0.5) * 20;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
            
            // Assign random color from palette
            const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
            
            // Vary particle sizes for more visual interest - smaller and subtle
            sizes[i] = Math.random() * 0.15 + 0.08;
        }
        
        return { positions, colors, sizes };
    }, [count]);
    
    // Animate particles
    useFrame((state) => {
        if (mesh.current) {
            mesh.current.rotation.x = state.clock.elapsedTime * 0.1;
            mesh.current.rotation.y = state.clock.elapsedTime * 0.15;
            
            // Move particles in a wave-like motion
            const positions = mesh.current.geometry.attributes.position.array;
            for (let i = 0; i < count; i++) {
                const i3 = i * 3;
                positions[i3 + 1] += Math.sin(state.clock.elapsedTime + positions[i3]) * 0.001;
            }
            mesh.current.geometry.attributes.position.needsUpdate = true;
        }
    });
    
    return (
        <points ref={mesh}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={count}
                    array={particles.positions}
                    itemSize={3}
                />
                <bufferAttribute
                    attach="attributes-color"
                    count={count}
                    array={particles.colors}
                    itemSize={3}
                />
                <bufferAttribute
                    attach="attributes-size"
                    count={count}
                    array={particles.sizes}
                    itemSize={1}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.1}
                sizeAttenuation={true}
                vertexColors={true}
                transparent={true}
                opacity={0.5}
                blending={THREE.AdditiveBlending}
            />
        </points>
    );
}

