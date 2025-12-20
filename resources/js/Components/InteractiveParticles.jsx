import { useRef, useMemo, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

export default function InteractiveParticles({ count = 300 }) {
    const mesh = useRef();
    const { mouse, viewport } = useThree();
    const [hovered, setHovered] = useState(false);
    
    // Create interactive particles
    const particles = useMemo(() => {
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const velocities = new Float32Array(count * 3);
        
        // Dark colors for light theme
        const colorPalette = [
            new THREE.Color(0x4f46e5), // indigo-600
            new THREE.Color(0x6366f1), // indigo-500
            new THREE.Color(0x7c3aed), // violet-600
            new THREE.Color(0x8b5cf6), // violet-500
            new THREE.Color(0x4338ca), // indigo-700
        ];
        
        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 25;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 25;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 25;
            
            const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
            
            // Random velocities for movement
            velocities[i * 3] = (Math.random() - 0.5) * 0.02;
            velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.02;
            velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.02;
        }
        
        return { positions, colors, velocities };
    }, [count]);
    
    // Animate with mouse interaction
    useFrame((state) => {
        if (mesh.current) {
            const positions = mesh.current.geometry.attributes.position.array;
            const mouseX = mouse.x * viewport.width;
            const mouseY = mouse.y * viewport.height;
            
            for (let i = 0; i < count; i++) {
                const i3 = i * 3;
                
                // Mouse interaction - particles react to mouse position
                const dx = mouseX - positions[i3];
                const dy = mouseY - positions[i3 + 1];
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 3) {
                    const force = (3 - distance) / 3;
                    positions[i3] -= dx * force * 0.01;
                    positions[i3 + 1] -= dy * force * 0.01;
                }
                
                // Continuous movement
                positions[i3] += particles.velocities[i3];
                positions[i3 + 1] += particles.velocities[i3 + 1];
                positions[i3 + 2] += particles.velocities[i3 + 2];
                
                // Boundary wrapping
                if (Math.abs(positions[i3]) > 12.5) particles.velocities[i3] *= -1;
                if (Math.abs(positions[i3 + 1]) > 12.5) particles.velocities[i3 + 1] *= -1;
                if (Math.abs(positions[i3 + 2]) > 12.5) particles.velocities[i3 + 2] *= -1;
            }
            
            mesh.current.geometry.attributes.position.needsUpdate = true;
            
            // Rotate slowly
            mesh.current.rotation.z += 0.001;
        }
    });
    
    return (
        <points
            ref={mesh}
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => setHovered(false)}
        >
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
            </bufferGeometry>
            <pointsMaterial
                size={hovered ? 0.12 : 0.1}
                sizeAttenuation={true}
                vertexColors={true}
                transparent={true}
                opacity={hovered ? 0.6 : 0.5}
                blending={THREE.AdditiveBlending}
            />
        </points>
    );
}

