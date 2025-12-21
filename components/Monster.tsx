
import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface MonsterProps {
  onCatch: () => void;
  onDangerUpdate?: (danger: number) => void;
  active: boolean;
  isScaring: boolean;
  soundVolume: number;
}

const MONSTER_FOOTSTEP_URL = "https://cdn.pixabay.com/audio/2024/02/05/audio_5b38d72855.mp3";
const FOOTSTEP_INTERVAL_BASE = 0.55;
const MAX_AUDIBLE_DISTANCE = 45;

export const Monster: React.FC<MonsterProps> = ({ onCatch, onDangerUpdate, active, isScaring, soundVolume }) => {
  const meshRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const torsoRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const faceLightRef = useRef<THREE.PointLight>(null);
  const hasTeleported = useRef(false);
  
  const footstepAudio = useRef<HTMLAudioElement | null>(null);
  const footstepTimer = useRef(0);
  const { camera } = useThree();
  
  const BASE_SPEED = 4.6;
  const CHASE_SPEED = 6.8; // Slightly faster chase
  const ATTACK_RANGE = 14; 

  useEffect(() => {
    footstepAudio.current = new Audio(MONSTER_FOOTSTEP_URL);
    if (!active) hasTeleported.current = false;
  }, [active]);

  useFrame((state, delta) => {
    if (!active || !meshRef.current) return;
    const monsterPos = meshRef.current.position;
    const playerPos = camera.position;
    const time = state.clock.getElapsedTime();

    if (isScaring) {
      if (!hasTeleported.current) {
        const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
        monsterPos.copy(playerPos).add(forward.multiplyScalar(1.2));
        monsterPos.y = playerPos.y - 1.2;
        hasTeleported.current = true;
      }
      meshRef.current.lookAt(playerPos.x, monsterPos.y, playerPos.z);
      if (bodyRef.current) {
        bodyRef.current.position.x = (Math.random() - 0.5) * 0.15;
        bodyRef.current.position.y = (Math.random() - 0.5) * 0.15;
      }
      if (faceLightRef.current) faceLightRef.current.intensity = 15 + Math.sin(time * 60) * 10;
      return;
    }

    const dist = monsterPos.distanceTo(playerPos);
    const isAttacking = dist < ATTACK_RANGE;
    const currentSpeed = isAttacking ? CHASE_SPEED : BASE_SPEED;
    const direction = new THREE.Vector3().subVectors(playerPos, monsterPos).normalize();
    
    // Movement logic
    monsterPos.x += direction.x * currentSpeed * delta;
    monsterPos.z += direction.z * currentSpeed * delta;
    meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, Math.atan2(direction.x, direction.z), 0.1);

    // Animation Logic
    const walkFreq = isAttacking ? 22 : 10;
    const walkAmp = isAttacking ? 0.8 : 0.4;
    const walkCycle = Math.sin(time * walkFreq);

    // Torso Lean
    if (torsoRef.current) {
      const targetLean = isAttacking ? 0.4 : 0;
      torsoRef.current.rotation.x = THREE.MathUtils.lerp(torsoRef.current.rotation.x, targetLean, 0.1);
      // Torso bobbing
      torsoRef.current.position.y = 1.2 + (isAttacking ? Math.abs(walkCycle) * 0.15 : 0);
    }

    // Head Bobbing
    if (headRef.current) {
      headRef.current.rotation.x = isAttacking ? Math.sin(time * walkFreq * 0.5) * 0.2 : 0;
      headRef.current.position.y = 2.2 + (isAttacking ? Math.sin(time * walkFreq) * 0.05 : 0);
    }

    // Aggressive Chase Legs
    if (leftLegRef.current) leftLegRef.current.rotation.x = walkCycle * walkAmp;
    if (rightLegRef.current) rightLegRef.current.rotation.x = -walkCycle * walkAmp;

    // Flailing Arms during chase
    if (leftArmRef.current) {
      if (isAttacking) {
        leftArmRef.current.rotation.x = -1.2 + Math.sin(time * walkFreq) * 0.6;
        leftArmRef.current.rotation.z = -0.3 + Math.sin(time * walkFreq * 0.5) * 0.2;
      } else {
        leftArmRef.current.rotation.x = -walkCycle * 0.5;
        leftArmRef.current.rotation.z = 0;
      }
    }
    if (rightArmRef.current) {
      if (isAttacking) {
        rightArmRef.current.rotation.x = -1.2 - Math.sin(time * walkFreq) * 0.6;
        rightArmRef.current.rotation.z = 0.3 - Math.sin(time * walkFreq * 0.5) * 0.2;
      } else {
        rightArmRef.current.rotation.x = walkCycle * 0.5;
        rightArmRef.current.rotation.z = 0;
      }
    }

    // Footsteps
    const stepInterval = FOOTSTEP_INTERVAL_BASE * (BASE_SPEED / currentSpeed);
    footstepTimer.current += delta;
    if (footstepTimer.current >= stepInterval) {
      if (dist < MAX_AUDIBLE_DISTANCE && footstepAudio.current) {
        const step = footstepAudio.current.cloneNode() as HTMLAudioElement;
        step.volume = soundVolume * (1 - dist / MAX_AUDIBLE_DISTANCE) * 0.8;
        step.play().catch(() => {});
      }
      footstepTimer.current = 0;
    }

    if (onDangerUpdate) onDangerUpdate(THREE.MathUtils.clamp(1 - dist / 35, 0, 1));
    if (dist < 1.9) onCatch();
  });

  return (
    <group ref={meshRef} position={[60, 0, 60]}>
      <group ref={bodyRef}>
        {/* Torso Group for leaning */}
        <group ref={torsoRef} position={[0, 1.2, 0]}>
          <mesh castShadow>
            <capsuleGeometry args={[0.6, 1, 8, 16]} />
            <meshStandardMaterial color="#6a0dad" roughness={0.9} />
          </mesh>

          {/* Belly Screen */}
          <mesh position={[0, 0, 0.4]}>
            <planeGeometry args={[0.5, 0.4]} />
            <meshStandardMaterial color="#b0b0b0" metalness={0.4} roughness={0.3} />
          </mesh>

          {/* Arms attached to torso */}
          <group ref={leftArmRef} position={[-0.7, 0.4, 0]}>
            <mesh position={[0, -0.4, 0]} castShadow>
              <capsuleGeometry args={[0.18, 0.8]} />
              <meshStandardMaterial color="#6a0dad" />
            </mesh>
          </group>
          <group ref={rightArmRef} position={[0.7, 0.4, 0]}>
            <mesh position={[0, -0.4, 0]} castShadow>
              <capsuleGeometry args={[0.18, 0.8]} />
              <meshStandardMaterial color="#6a0dad" />
            </mesh>
          </group>
        </group>

        {/* Legs attached to root (not leaning with torso) */}
        <group ref={leftLegRef} position={[-0.3, 0.6, 0]}>
          <mesh position={[0, -0.3, 0]} castShadow>
            <capsuleGeometry args={[0.22, 0.6]} />
            <meshStandardMaterial color="#6a0dad" />
          </mesh>
          <mesh position={[0, -0.6, 0.1]}><boxGeometry args={[0.3, 0.15, 0.4]} /><meshStandardMaterial color="#6a0dad" /></mesh>
        </group>
        <group ref={rightLegRef} position={[0.3, 0.6, 0]}>
          <mesh position={[0, -0.3, 0]} castShadow>
            <capsuleGeometry args={[0.22, 0.6]} />
            <meshStandardMaterial color="#6a0dad" />
          </mesh>
          <mesh position={[0, -0.6, 0.1]}><boxGeometry args={[0.3, 0.15, 0.4]} /><meshStandardMaterial color="#6a0dad" /></mesh>
        </group>

        {/* Head Group for bobbing */}
        <group ref={headRef} position={[0, 2.2, 0]}>
          <mesh castShadow>
            <sphereGeometry args={[0.5, 16, 16]} />
            <meshStandardMaterial color="#6a0dad" />
          </mesh>

          {/* Signature Triangle Antenna */}
          <group position={[0, 0.65, 0]}>
            <mesh>
              <torusGeometry args={[0.18, 0.04, 8, 3]} />
              <meshStandardMaterial color="#6a0dad" />
            </mesh>
            <mesh position={[0, -0.15, 0]}>
              <cylinderGeometry args={[0.04, 0.04, 0.2]} />
              <meshStandardMaterial color="#6a0dad" />
            </mesh>
          </group>

          {/* Screaming Face Mask */}
          <group position={[0, 0, 0.38]}>
            <mesh>
              <sphereGeometry args={[0.42, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
              <meshStandardMaterial color="#dcdcdc" roughness={1} />
            </mesh>
            <mesh position={[-0.15, 0.05, 0.15]}><sphereGeometry args={[0.1]} /><meshBasicMaterial color="black" /></mesh>
            <mesh position={[0.15, 0.05, 0.15]}><sphereGeometry args={[0.1]} /><meshBasicMaterial color="black" /></mesh>
            <mesh position={[0, -0.2, 0.1]} rotation={[0.2, 0, 0]}>
              <sphereGeometry args={[0.18, 16, 16]} scale={[1, 1.4, 0.5]} />
              <meshBasicMaterial color="black" />
            </mesh>
          </group>

          <pointLight ref={faceLightRef} color="#ff0000" intensity={1.5} distance={5} />
        </group>
      </group>
    </group>
  );
};
