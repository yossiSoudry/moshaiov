"use client";
import * as THREE from "three";
import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, extend, useThree, useFrame } from "@react-three/fiber";
import {
  Text,
  Environment,
  Lightformer,
  RoundedBox,
  useTexture,
} from "@react-three/drei";
import {
  BallCollider,
  CuboidCollider,
  Physics,
  RigidBody,
  useRopeJoint,
  useSphericalJoint,
} from "@react-three/rapier";
import { MeshLineGeometry, MeshLineMaterial } from "meshline";

extend({ MeshLineGeometry, MeshLineMaterial });

// Preload the band texture
useTexture.preload(
  "https://assets.vercel.com/image/upload/contentful/image/e5382hct74si/SOT1hmCesOHxEYxL7vkoZ/c57b29c85912047c414311723320c16b/band.jpg"
);

export default function EventIdcard() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="absolute inset-0 w-full h-full" />;
  }

  return (
    <div className="absolute inset-0 w-full h-full z-10">
      <Canvas
        camera={{ position: [0, 0, 13], fov: 25 }}
        gl={{
          antialias: true,
          powerPreference: "default",
          failIfMajorPerformanceCaveat: false,
          alpha: true
        }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
          gl.domElement.addEventListener('webglcontextlost', (e) => {
            e.preventDefault();
          });
        }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={2} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <Physics interpolate gravity={[0, -40, 0]} timeStep={1 / 60}>
            <Band />
          </Physics>
          <Environment background={false} blur={0.75}>
            <Lightformer
              intensity={2}
              color="#b8942e"
              position={[0, -1, 5]}
              rotation={[0, 0, Math.PI / 3]}
              scale={[100, 0.1, 1]}
            />
            <Lightformer
              intensity={3}
              color="white"
              position={[-1, -1, 1]}
              rotation={[0, 0, Math.PI / 3]}
              scale={[100, 0.1, 1]}
            />
            <Lightformer
              intensity={3}
              color="#b8942e"
              position={[1, 1, 1]}
              rotation={[0, 0, Math.PI / 3]}
              scale={[100, 0.1, 1]}
            />
            <Lightformer
              intensity={10}
              color="white"
              position={[-10, 0, 14]}
              rotation={[0, Math.PI / 2, Math.PI / 3]}
              scale={[100, 10, 1]}
            />
          </Environment>
        </Suspense>
      </Canvas>
    </div>
  );
}

type DragPosition = THREE.Vector3 | false;

type RigidBodySegmentProps = {
  type: "dynamic" | "fixed" | "kinematicPosition";
  canSleep: boolean;
  colliders: "ball" | "cuboid" | "hull" | "trimesh" | false;
  angularDamping: number;
  linearDamping: number;
};

// Custom Moshayov branded card component
function MoshayovCard() {
  return (
    <group>
      {/* Card base - dark with metallic finish */}
      <RoundedBox args={[1.6, 2.2, 0.05]} radius={0.08} smoothness={4}>
        <meshPhysicalMaterial
          color="#1a1a1a"
          metalness={0.4}
          roughness={0.3}
          clearcoat={1}
          clearcoatRoughness={0.1}
        />
      </RoundedBox>

      {/* Gold border - top */}
      <mesh position={[0, 1.05, 0.026]}>
        <boxGeometry args={[1.5, 0.02, 0.01]} />
        <meshStandardMaterial color="#b8942e" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Gold border - bottom */}
      <mesh position={[0, -1.05, 0.026]}>
        <boxGeometry args={[1.5, 0.02, 0.01]} />
        <meshStandardMaterial color="#b8942e" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Gold border - left */}
      <mesh position={[-0.75, 0, 0.026]}>
        <boxGeometry args={[0.02, 2.1, 0.01]} />
        <meshStandardMaterial color="#b8942e" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Gold border - right */}
      <mesh position={[0.75, 0, 0.026]}>
        <boxGeometry args={[0.02, 2.1, 0.01]} />
        <meshStandardMaterial color="#b8942e" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Diamond icon at top - stylized M shape */}
      <group position={[0, 0.5, 0.03]}>
        {/* Diamond shape */}
        <mesh rotation={[0, 0, Math.PI / 4]}>
          <planeGeometry args={[0.2, 0.2]} />
          <meshStandardMaterial
            color="#b8942e"
            metalness={0.9}
            roughness={0.1}
            side={THREE.DoubleSide}
          />
        </mesh>
        {/* Inner diamond */}
        <mesh rotation={[0, 0, Math.PI / 4]} position={[0, 0, 0.001]}>
          <planeGeometry args={[0.12, 0.12]} />
          <meshStandardMaterial
            color="#1a1a1a"
            metalness={0.5}
            roughness={0.3}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>

      {/* MOSHAYOV text */}
      <Text
        position={[0, 0.1, 0.03]}
        fontSize={0.18}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.12}
      >
        MOSHAYOV
      </Text>

      {/* Decorative line under text */}
      <mesh position={[0, -0.05, 0.027]}>
        <boxGeometry args={[0.8, 0.008, 0.005]} />
        <meshStandardMaterial color="#b8942e" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Hebrew tagline */}
      <Text
        position={[0, -0.2, 0.03]}
        fontSize={0.09}
        color="#a0a0a0"
        anchorX="center"
        anchorY="middle"
      >
        תכשיטי זהב ויהלומים
      </Text>

      {/* Card clip/holder at top */}
      <group position={[0, 1.15, 0]}>
        {/* Clip base */}
        <RoundedBox args={[0.35, 0.12, 0.06]} radius={0.02} smoothness={4}>
          <meshStandardMaterial
            color="#b8942e"
            metalness={0.95}
            roughness={0.15}
          />
        </RoundedBox>
        {/* Clip ring */}
        <mesh position={[0, 0.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.06, 0.015, 8, 16]} />
          <meshStandardMaterial
            color="#b8942e"
            metalness={0.95}
            roughness={0.15}
          />
        </mesh>
      </group>
    </group>
  );
}

function Band({ maxSpeed = 50, minSpeed = 10 }) {
  const band = useRef<THREE.Mesh>(null);
  const lineGeometry = useRef<MeshLineGeometry>(null);
  const fixed = useRef<any>(null);
  const j1 = useRef<any>(null);
  const j2 = useRef<any>(null);
  const j3 = useRef<any>(null);
  const card = useRef<any>(null);
  const bandTexture = useTexture("https://assets.vercel.com/image/upload/contentful/image/e5382hct74si/SOT1hmCesOHxEYxL7vkoZ/c57b29c85912047c414311723320c16b/band.jpg");

  const vec = new THREE.Vector3();
  const ang = new THREE.Vector3();
  const rot = new THREE.Vector3();
  const dir = new THREE.Vector3();

  const segmentProps: RigidBodySegmentProps = {
    type: "dynamic",
    canSleep: true,
    colliders: false,
    angularDamping: 2,
    linearDamping: 2,
  };

  useThree((state) => state.size);
  const [curve] = useState(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3(),
      ]),
  );
  const [dragged, drag] = useState<DragPosition>(false);
  const [hovered, hover] = useState(false);

  // Configure texture wrapping
  useEffect(() => {
    bandTexture.wrapS = bandTexture.wrapT = THREE.RepeatWrapping;
  }, [bandTexture]);

  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 0.7]);
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 0.7]);
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 0.7]);
  useSphericalJoint(j3, card, [
    [0, 0, 0],
    [0, 1.29, 0],
  ]);

  useEffect(() => {
    if (hovered) {
      document.body.style.cursor = dragged ? "grabbing" : "grab";
      return () => void (document.body.style.cursor = "auto");
    }
  }, [hovered, dragged]);

  useFrame((state, delta) => {
    if (dragged && card.current) {
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera);
      dir.copy(vec).sub(state.camera.position).normalize();
      vec.add(dir.multiplyScalar(state.camera.position.length()));
      [card, j1, j2, j3, fixed].forEach((ref) => ref.current?.wakeUp());
      card.current?.setNextKinematicTranslation({
        x: vec.x - (dragged as THREE.Vector3).x,
        y: vec.y - (dragged as THREE.Vector3).y,
        z: vec.z - (dragged as THREE.Vector3).z,
      });
    }
    if (fixed.current && j1.current && j2.current && j3.current && card.current) {
      [j1, j2].forEach((ref) => {
        if (!ref.current.lerped)
          ref.current.lerped = new THREE.Vector3().copy(
            ref.current.translation(),
          );
        const clampedDistance = Math.max(
          0.1,
          Math.min(1, ref.current.lerped.distanceTo(ref.current.translation())),
        );
        ref.current.lerped.lerp(
          ref.current.translation(),
          delta * (minSpeed + clampedDistance * (maxSpeed - minSpeed)),
        );
      });

      curve.points[0].copy(j3.current.translation());
      curve.points[1].copy(j2.current.lerped);
      curve.points[2].copy(j1.current.lerped);
      curve.points[3].copy(fixed.current.translation());

      // Update the mesh line
      if (lineGeometry.current && lineGeometry.current.setPoints) {
        const points = curve.getPoints(32);
        lineGeometry.current.setPoints(points);
      }

      ang.copy(card.current.angvel());
      rot.copy(card.current.rotation());
      card.current.setAngvel({ x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z });
    }
  });

  curve.curveType = "chordal";

  return (
    <>
      {/* Card position */}
      <group position={[0, 4, 0]}>
        <RigidBody ref={fixed} {...segmentProps} type="fixed" />
        <RigidBody position={[0.5, 0, 0]} ref={j1} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1, 0, 0]} ref={j2} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1.5, 0, 0]} ref={j3} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody
          position={[2, 0, 0]}
          ref={card}
          {...segmentProps}
          type={dragged ? "kinematicPosition" : "dynamic"}
        >
          <CuboidCollider args={[0.8, 1.125, 0.05]} />
          {/* Smaller scale - changed from 1.8 to 1.4 */}
          <group
            scale={1.4}
            position={[0, -0.5, -0.05]}
            onPointerOver={() => hover(true)}
            onPointerOut={() => hover(false)}
            onPointerUp={(e) => {
              (e as any).target?.releasePointerCapture?.((e as any).pointerId);
              drag(false);
            }}
            onPointerDown={(e) => {
              (e as any).target?.setPointerCapture?.((e as any).pointerId);
              drag(
                new THREE.Vector3()
                  .copy((e as any).point)
                  .sub(vec.copy(card.current.translation())),
              );
            }}
          >
            <MoshayovCard />
          </group>
        </RigidBody>
      </group>
      {/* Original styled band */}
      <mesh ref={band}>
        {/* @ts-expect-error - meshline extends R3F */}
        <meshLineGeometry ref={lineGeometry} />
        {/* @ts-expect-error - meshline extends R3F */}
        <meshLineMaterial
          color="white"
          lineWidth={0.2}
          resolution={new THREE.Vector2(window.innerWidth, window.innerHeight)}
          useMap={1}
          map={bandTexture}
          repeat={new THREE.Vector2(-4, 1)}
          depthTest={false}
        />
      </mesh>
    </>
  );
}
