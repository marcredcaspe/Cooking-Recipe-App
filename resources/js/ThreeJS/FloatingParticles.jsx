import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

export default function FloatingParticles({ color = '#f97316', count = 30, speed = 0.5 }) {
    const mesh = useRef();

    // Visual-only: Generate random particle positions
    const particles = useMemo(() => {
        const positions = new Float32Array(count * 3);
        for (let i = 0; i < count * 3; i++) {
            positions[i] = (Math.random() - 0.5) * 10;
        }
        return positions;
    }, [count]);

    // Visual-only: Animate particles
    useFrame((state, delta) => {
        if (mesh.current) {
            mesh.current.rotation.x += delta * 0.1 * speed;
            mesh.current.rotation.y += delta * 0.15 * speed;
        }
    });

    // Visual-only: Convert hex color to RGB
    const rgbColor = useMemo(() => {
        const hex = color.replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16) / 255;
        const g = parseInt(hex.substring(2, 4), 16) / 255;
        const b = parseInt(hex.substring(4, 6), 16) / 255;
        return new THREE.Color(r, g, b);
    }, [color]);

    return (
        <group>
            <Points
                ref={mesh}
                positions={particles}
                stride={3}
                frustumCulled={false}
            >
                <PointMaterial
                    transparent
                    color={rgbColor}
                    size={0.05}
                    sizeAttenuation={true}
                    depthWrite={false}
                    opacity={0.6}
                />
            </Points>
        </group>
    );
}

