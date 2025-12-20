import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Create a round texture for particles
function createRoundTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const context = canvas.getContext('2d');
    
    // Create gradient for smooth circle
    const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.8)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    context.fillStyle = gradient;
    context.fillRect(0, 0, 64, 64);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
}

export default function RoundParticles({ count = 400 }) {
    const mesh = useRef();
    const texture = useMemo(() => createRoundTexture(), []);
    
    // Create particles with light orange colors
    const particles = useMemo(() => {
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const sizes = new Float32Array(count);
        
        // Light orange color palette to complement the theme
        const colorPalette = [
            new THREE.Color(0xffedd5), // orange-100
            new THREE.Color(0xfed7aa), // orange-200
            new THREE.Color(0xfdba74), // orange-300
            new THREE.Color(0xfb923c), // orange-400
            new THREE.Color(0xffd89b), // amber-200
            new THREE.Color(0xfcd34d), // amber-300
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
            
            // Vary particle sizes - subtle
            sizes[i] = Math.random() * 0.15 + 0.08;
        }
        
        return { positions, colors, sizes };
    }, [count]);
    
    // Slow animation
    useFrame((state) => {
        if (mesh.current) {
            // Very slow rotation
            mesh.current.rotation.x = state.clock.elapsedTime * 0.02;
            mesh.current.rotation.y = state.clock.elapsedTime * 0.03;
            
            // Slow wave-like motion
            const positions = mesh.current.geometry.attributes.position.array;
            for (let i = 0; i < count; i++) {
                const i3 = i * 3;
                positions[i3 + 1] += Math.sin(state.clock.elapsedTime * 0.3 + positions[i3]) * 0.0003;
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
                map={texture}
                size={0.1}
                sizeAttenuation={true}
                vertexColors={true}
                transparent={true}
                opacity={0.5}
                blending={THREE.AdditiveBlending}
                alphaTest={0.1}
            />
        </points>
    );
}

