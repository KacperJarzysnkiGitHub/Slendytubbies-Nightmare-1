
import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { PointerLockControls } from '@react-three/drei';
import * as THREE from 'three';
import { Obstacle } from '../types';

interface PlayerProps {
  onInteract: (raycaster: THREE.Raycaster) => void;
  flashlightOn: boolean;
  isScaring?: boolean;
  battery: number;
  obstacles: Obstacle[];
  onToggleFlashlight: () => void;
  soundVolume: number;
  canWin: boolean;
  onWin: () => void;
  active: boolean;
}

const WALK_SPEED = 5;
const SPRINT_SPEED = 9;
const JUMP_FORCE = 8.5;
const GRAVITY = 22;
const GROUND_Y = 1.7;
const WORLD_BOUNDARY = 98.5;
const WIN_ZONE_POSITION = new THREE.Vector3(0, 0, -40);
const WIN_DISTANCE = 5;
const PLAYER_RADIUS = 0.6;
const FOOTSTEP_INTERVAL_WALK = 0.42;
const FOOTSTEP_INTERVAL_SPRINT = 0.28;
const FOOTSTEP_URL = "https://cdn.pixabay.com/audio/2022/03/10/audio_f5519f6c01.mp3";

const PlayerBody: React.FC<{ isMoving: boolean; isSprinting: boolean; isGrounded: boolean }> = ({ isMoving, isSprinting, isGrounded }) => {
  const bodyGroupRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const walkSpeed = isSprinting ? 12 : 8;
    const walkCycle = Math.sin(time * walkSpeed);
    
    // Only animate legs if moving and grounded
    if (isMoving && isGrounded) {
      if (leftLegRef.current) leftLegRef.current.rotation.x = walkCycle * 0.5;
      if (rightLegRef.current) rightLegRef.current.rotation.x = -walkCycle * 0.5;
      if (bodyGroupRef.current) bodyGroupRef.current.position.y = -1.7 + Math.abs(walkCycle) * 0.05;
    } else if (!isGrounded) {
      // Jump pose: slightly tuck legs
      if (leftLegRef.current) leftLegRef.current.rotation.x = 0.3;
      if (rightLegRef.current) rightLegRef.current.rotation.x = 0.3;
      if (bodyGroupRef.current) bodyGroupRef.current.position.y = -1.7;
    } else {
      if (leftLegRef.current) leftLegRef.current.rotation.x = 0;
      if (rightLegRef.current) rightLegRef.current.rotation.x = 0;
      if (bodyGroupRef.current) bodyGroupRef.current.position.y = -1.7;
    }
  });

  return (
    <group ref={bodyGroupRef} position={[0, -1.7, 0]}>
      {/* Torso */}
      <mesh position={[0, 0.85, 0]} castShadow>
        <capsuleGeometry args={[0.35, 0.7, 8, 16]} />
        <meshStandardMaterial color="#f8f8f8" />
      </mesh>
      {/* Legs */}
      <group ref={leftLegRef} position={[-0.15, 0.4, 0]}>
        <mesh><boxGeometry args={[0.15, 0.5, 0.15]} /><meshStandardMaterial color="#f8f8f8" /></mesh>
      </group>
      <group ref={rightLegRef} position={[0.15, 0.4, 0]}>
        <mesh><boxGeometry args={[0.15, 0.5, 0.15]} /><meshStandardMaterial color="#f8f8f8" /></mesh>
      </group>
    </group>
  );
};

export const Player: React.FC<PlayerProps> = ({ 
  onInteract, 
  flashlightOn, 
  isScaring = false, 
  battery, 
  obstacles, 
  onToggleFlashlight, 
  soundVolume, 
  canWin, 
  onWin,
  active
}) => {
  const { camera } = useThree();
  const moveState = useRef({ forward: false, backward: false, left: false, right: false, sprint: false, jump: false });
  const velocity = useRef(new THREE.Vector3());
  const verticalVelocity = useRef(0);
  const isGrounded = useRef(true);
  const raycaster = useRef(new THREE.Raycaster());
  const footstepAudio = useRef<HTMLAudioElement | null>(null);
  const footstepTimer = useRef(0);
  const lightTarget = useRef(new THREE.Object3D());
  const flashlightRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);

  useEffect(() => {
    footstepAudio.current = new Audio(FOOTSTEP_URL);
    camera.add(lightTarget.current);
    lightTarget.current.position.set(0, 0, -10);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!active || isScaring) return;
      switch (e.code) {
        case 'KeyW': moveState.current.forward = true; break;
        case 'KeyS': moveState.current.backward = true; break;
        case 'KeyA': moveState.current.left = true; break;
        case 'KeyD': moveState.current.right = true; break;
        case 'ShiftLeft': moveState.current.sprint = true; break;
        case 'Space': 
          if (isGrounded.current) {
            verticalVelocity.current = JUMP_FORCE;
            isGrounded.current = false;
          }
          break;
        case 'KeyF': onToggleFlashlight(); break;
        case 'KeyE': 
          raycaster.current.setFromCamera(new THREE.Vector2(0, 0), camera); 
          onInteract(raycaster.current); 
          break;
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW': moveState.current.forward = false; break;
        case 'KeyS': moveState.current.backward = false; break;
        case 'KeyA': moveState.current.left = false; break;
        case 'KeyD': moveState.current.right = false; break;
        case 'ShiftLeft': moveState.current.sprint = false; break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => { 
      window.removeEventListener('keydown', handleKeyDown); 
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [onToggleFlashlight, onInteract, camera, isScaring, active]);

  useFrame((state, delta) => {
    if (!active || isScaring) {
      velocity.current.set(0, 0, 0);
      return;
    }

    const isMoving = moveState.current.forward || moveState.current.backward || moveState.current.left || moveState.current.right;
    const isSprinting = isMoving && moveState.current.sprint;
    const currentSpeed = isSprinting ? SPRINT_SPEED : WALK_SPEED;
    
    // X-Z Movement
    const direction = new THREE.Vector3();
    const frontVector = new THREE.Vector3(0, 0, Number(moveState.current.backward) - Number(moveState.current.forward));
    const sideVector = new THREE.Vector3(Number(moveState.current.left) - Number(moveState.current.right), 0, 0);
    
    direction.subVectors(frontVector, sideVector).normalize().multiplyScalar(currentSpeed).applyEuler(new THREE.Euler(0, camera.rotation.y, 0));
    velocity.current.lerp(direction, 0.15);

    let nextX = camera.position.x + velocity.current.x * delta;
    let nextZ = camera.position.z + velocity.current.z * delta;

    // Y Movement (Physics)
    if (!isGrounded.current) {
      verticalVelocity.current -= GRAVITY * delta;
    }
    
    let nextY = camera.position.y + verticalVelocity.current * delta;

    // Ground collision
    if (nextY <= GROUND_Y) {
      nextY = GROUND_Y;
      verticalVelocity.current = 0;
      isGrounded.current = true;
    }

    // Obstacle Collisions
    for (const obs of obstacles) {
      const dx = nextX - obs.position[0]; 
      const dz = nextZ - obs.position[2];
      const distSq = dx * dx + dz * dz; 
      const combRad = PLAYER_RADIUS + obs.radius;
      if (distSq < combRad * combRad) {
        const dist = Math.sqrt(distSq); 
        const overlap = combRad - dist;
        nextX += (dx / dist) * overlap; 
        nextZ += (dz / dist) * overlap;
      }
    }
    
    // Bounds Check
    if (Math.abs(nextX) < WORLD_BOUNDARY) camera.position.x = nextX;
    if (Math.abs(nextZ) < WORLD_BOUNDARY) camera.position.z = nextZ;
    camera.position.y = nextY;
    
    if (bodyRef.current) {
      bodyRef.current.position.set(camera.position.x, camera.position.y, camera.position.z);
      bodyRef.current.rotation.y = camera.rotation.y;
    }
    
    if (canWin && camera.position.distanceTo(WIN_ZONE_POSITION) < WIN_DISTANCE) onWin();

    // Footsteps
    if (isMoving && isGrounded.current) {
      footstepTimer.current += delta;
      if (footstepTimer.current >= (isSprinting ? FOOTSTEP_INTERVAL_SPRINT : FOOTSTEP_INTERVAL_WALK)) {
        if (footstepAudio.current) {
          const step = footstepAudio.current.cloneNode() as HTMLAudioElement;
          step.volume = soundVolume * (isSprinting ? 0.7 : 0.4);
          step.play().catch(() => {});
        }
        footstepTimer.current = 0;
      }
    }

    // Flashlight Animation
    if (flashlightRef.current) {
      const time = state.clock.getElapsedTime();
      const bobY = (isMoving && isGrounded.current) ? Math.sin(time * (isSprinting ? 12 : 8)) * 0.04 : 0;
      flashlightRef.current.position.y = -0.45 + bobY;
      // Sync pitch with camera
      flashlightRef.current.rotation.x = camera.rotation.x;
      
      flashlightRef.current.traverse((obj) => {
        if (obj instanceof THREE.Light && obj.name === 'mainSpot') obj.intensity = flashlightOn ? 800 : 0;
      });
    }
  });

  return (
    <>
      {active && <PointerLockControls makeDefault />}
      <primitive object={lightTarget.current} />
      <group ref={bodyRef}>
        <PlayerBody 
          isMoving={moveState.current.forward || moveState.current.backward || moveState.current.left || moveState.current.right} 
          isSprinting={moveState.current.sprint} 
          isGrounded={isGrounded.current}
        />
        <group ref={flashlightRef} position={[0.45, -0.45, -0.8]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.04, 0.05, 0.6]} />
            <meshStandardMaterial color="#111" />
          </mesh>
          <spotLight name="mainSpot" visible={flashlightOn} position={[0, 0, -0.3]} target={lightTarget.current} intensity={800} distance={100} castShadow />
        </group>
      </group>
    </>
  );
};
