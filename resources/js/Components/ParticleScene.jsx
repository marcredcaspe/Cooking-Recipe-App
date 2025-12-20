import { Canvas } from '@react-three/fiber';
import RoundParticles from './RoundParticles';

export default function ParticleScene({ interactive = false }) {
    return (
        <div className="absolute inset-0 w-full h-full">
            <Canvas
                camera={{ position: [0, 0, 10], fov: 75 }}
                gl={{ alpha: true, antialias: true }}
                style={{ background: 'transparent' }}
            >
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                
                <RoundParticles count={400} />
            </Canvas>
        </div>
    );
}

