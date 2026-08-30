"use client";

import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import type { Availability, Scene } from "@/lib/scene-schema";
import type { UnitStatus } from "@/lib/unit-status";
import {
  fitDistance,
  ringGeometry,
  roadGeometry,
  sceneCentre,
  siteCorners,
  sunDirection,
  toWorld,
} from "@/components/scene/geometry";

/**
 * The 3D plot layout (BRIEF.md §9.2, Phase 4).
 *
 * Every coordinate is read from content/scenes/[slug].json — the same file
 * the 2D SVG plan reads. Selection, filters, availability and the drawer are
 * the ones Phase 2 already built, so this adds spectacle without adding any
 * commercial capability the 2D view lacks (§9).
 *
 * Style follows the §10 fallback: stylised, flat-shaded massing, matte
 * materials, one soft sun, restrained cool-green palette, damped camera.
 */

const PALETTE = {
  available: new THREE.Color("#5F7355"),
  held: new THREE.Color("#B0722C"),
  sold: new THREE.Color("#C7CCC2"),
  unknown: new THREE.Color("#EBEEE8"),
  selected: new THREE.Color("#101614"),
} as const;

const PLOT_HEIGHT = 0.45;
const DIM = 0.22;

type Props = {
  scene: Scene;
  availability?: Availability;
  selectedId: string | null;
  onSelect: (unitId: string | null) => void;
  filter: UnitStatus | "all";
  hour: number;
  matureCanopy: boolean;
  reducedMotion: boolean;
};

/* ------------------------------------------------------------------ plots */

function Plots({
  scene,
  availability,
  selectedId,
  onSelect,
  filter,
}: Pick<Props, "scene" | "availability" | "selectedId" | "onSelect" | "filter">) {
  const visual = useRef<THREE.InstancedMesh>(null);
  const collider = useRef<THREE.InstancedMesh>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const { units } = scene;

  /**
   * One InstancedMesh for all 279 plots — one draw call for the parcels,
   * not 279 (§9.3). Per-instance scale carries the real plot dimensions, so
   * Fadal's varying sizes need no extra geometry.
   */
  useLayoutEffect(() => {
    const mesh = visual.current;
    const pick = collider.current;
    if (!mesh || !pick) return;

    const matrix = new THREE.Matrix4();
    const quaternion = new THREE.Quaternion();
    const position = new THREE.Vector3();
    const scale = new THREE.Vector3();

    units.forEach((unit, i) => {
      const [x, , z] = toWorld(unit.centroid, 0);
      const raised = unit.id === selectedId ? PLOT_HEIGHT * 2.4 : 0;

      position.set(x, PLOT_HEIGHT / 2 + raised, z);
      scale.set(unit.widthM - 0.5, PLOT_HEIGHT, unit.depthM - 0.5);
      matrix.compose(position, quaternion, scale);
      mesh.setMatrixAt(i, matrix);

      // The pick target is taller and full-width — easier to tap on a phone,
      // and it keeps raycasting off the display geometry (§9.3).
      position.set(x, 1.5, z);
      scale.set(unit.widthM, 3, unit.depthM);
      matrix.compose(position, quaternion, scale);
      pick.setMatrixAt(i, matrix);

      const status = availability?.units[unit.id];
      const base =
        unit.id === selectedId
          ? PALETTE.selected
          : status
            ? PALETTE[status]
            : PALETTE.unknown;

      // Filters dim rather than hide, so the layout never looks half-built.
      const dimmed = filter !== "all" && status !== filter;
      const colour = dimmed
        ? base.clone().lerp(PALETTE.unknown, 1 - DIM)
        : base;
      mesh.setColorAt(i, colour);
    });

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    pick.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
    pick.computeBoundingSphere();
  }, [units, availability, selectedId, filter]);

  const pickUnit = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    const i = e.instanceId;
    if (i === undefined) return;
    const id = units[i].id;
    onSelect(id === selectedId ? null : id);
  };

  return (
    <>
      <instancedMesh
        ref={visual}
        args={[undefined, undefined, units.length]}
        castShadow
        receiveShadow
        frustumCulled
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshLambertMaterial />
      </instancedMesh>

      <instancedMesh
        ref={collider}
        args={[undefined, undefined, units.length]}
        onClick={pickUnit}
        onPointerMove={(e) => {
          e.stopPropagation();
          setHovered(e.instanceId ?? null);
        }}
        onPointerOut={() => setHovered(null)}
      >
        {/*
          An object with visible={false} is skipped by the raycaster, so the
          collider has to take part in rendering to be pickable. colorWrite
          and depthWrite are both off: it costs a draw call, paints nothing,
          and occludes nothing, which is cheaper and more predictable than a
          fully transparent material fighting the sort order.
        */}
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial colorWrite={false} depthWrite={false} />
      </instancedMesh>

      {hovered !== null && <HoverRing unit={units[hovered]} />}
    </>
  );
}

function HoverRing({ unit }: { unit: Scene["units"][number] }) {
  const [x, , z] = toWorld(unit.centroid, 0);
  return (
    <mesh position={[x, PLOT_HEIGHT + 0.05, z]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[unit.widthM + 0.6, unit.depthM + 0.6]} />
      <meshBasicMaterial color="#101614" transparent opacity={0.18} />
    </mesh>
  );
}

/* ------------------------------------------------------------ ground plan */

function Ground({ scene }: { scene: Scene }) {
  const boundary = useMemo(() => ringGeometry(scene.boundary), [scene.boundary]);
  const open = useMemo(
    () => scene.openSpaces.map((s) => ({ id: s.id, geo: ringGeometry(s.ring) })),
    [scene.openSpaces],
  );
  const roads = useMemo(
    () =>
      scene.roads.map((r) => ({
        id: r.id,
        geo: roadGeometry(r.centreline, r.widthM),
      })),
    [scene.roads],
  );

  return (
    <group>
      <mesh geometry={boundary} receiveShadow position={[0, 0, 0]}>
        <meshLambertMaterial color="#E4E8E0" />
      </mesh>
      {open.map((s) => (
        <mesh key={s.id} geometry={s.geo} position={[0, 0.02, 0]} receiveShadow>
          <meshLambertMaterial color="#BFD0C6" />
        </mesh>
      ))}
      {roads.map((r) => (
        <mesh key={r.id} geometry={r.geo} position={[0, 0.05, 0]} receiveShadow>
          <meshLambertMaterial color="#C7CCC2" />
        </mesh>
      ))}
    </group>
  );
}

/* -------------------------------------------------------------- planting */

function Planting({
  scene,
  mature,
}: {
  scene: Scene;
  mature: boolean;
}) {
  const trunks = useRef<THREE.InstancedMesh>(null);
  const canopies = useRef<THREE.InstancedMesh>(null);
  const plants = scene.planting;

  useLayoutEffect(() => {
    const trunk = trunks.current;
    const canopy = canopies.current;
    if (!trunk || !canopy) return;

    const matrix = new THREE.Matrix4();
    const quaternion = new THREE.Quaternion();
    const position = new THREE.Vector3();
    const scale = new THREE.Vector3();

    plants.forEach((plant, i) => {
      // Canopy growth: handover planting against year five (§9.2).
      const radius = plant.matureRadiusM * (mature ? 1 : 0.42);
      const height = radius * 2.1;
      const [x, , z] = toWorld(plant.point, 0);

      position.set(x, height * 0.3, z);
      scale.set(0.18, height * 0.6, 0.18);
      matrix.compose(position, quaternion, scale);
      trunk.setMatrixAt(i, matrix);

      position.set(x, height * 0.72, z);
      scale.set(radius, radius * 1.15, radius);
      matrix.compose(position, quaternion, scale);
      canopy.setMatrixAt(i, matrix);
      canopy.setColorAt(
        i,
        new THREE.Color(plant.kind === "tree" ? "#5F7355" : "#7C8F71"),
      );
    });

    trunk.instanceMatrix.needsUpdate = true;
    canopy.instanceMatrix.needsUpdate = true;
    if (canopy.instanceColor) canopy.instanceColor.needsUpdate = true;
    trunk.computeBoundingSphere();
    canopy.computeBoundingSphere();
  }, [plants, mature]);

  if (plants.length === 0) return null;

  return (
    <group>
      <instancedMesh ref={trunks} args={[undefined, undefined, plants.length]} castShadow>
        <cylinderGeometry args={[1, 1, 1, 5]} />
        <meshLambertMaterial color="#7A6A55" />
      </instancedMesh>
      <instancedMesh ref={canopies} args={[undefined, undefined, plants.length]} castShadow>
        <icosahedronGeometry args={[1, 0]} />
        <meshLambertMaterial flatShading />
      </instancedMesh>
    </group>
  );
}

/* -------------------------------------------------------------- amenities */

/**
 * §9.2 — located amenity markers. On the live site all eight of Rare Earth's
 * amenities are dead href="#" links; here each one has a real position in the
 * layout, read from the scene data.
 */
function Amenities({ scene }: { scene: Scene }) {
  if (scene.amenityPoints.length === 0) return null;
  return (
    <group>
      {scene.amenityPoints.map((a) => {
        const [x, , z] = toWorld(a.point, 0);
        return (
          <group key={a.id} position={[x, 0, z]}>
            <mesh position={[0, 1.4, 0]} castShadow>
              <cylinderGeometry args={[0.12, 0.12, 2.8, 6]} />
              <meshLambertMaterial color="#101614" />
            </mesh>
            <mesh position={[0, 3, 0]} castShadow>
              <sphereGeometry args={[0.75, 12, 10]} />
              <meshLambertMaterial color="#B0722C" />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

/* ---------------------------------------------------------------- camera */

/** The default view direction: raised and turned off-axis, near-isometric. */
const VIEW_DIRECTION = new THREE.Vector3(0.42, 0.72, 0.55);

/**
 * Frames the whole site, correctly, at whatever size the canvas happens to
 * be. Runs on mount and on resize, and stops once the user takes control so
 * it never fights them.
 */
function FitOnMount({
  scene,
  controls,
}: {
  scene: Scene;
  controls: React.RefObject<React.ComponentRef<typeof OrbitControls> | null>;
}) {
  const { camera, size } = useThree();
  const userHasMoved = useRef(false);

  useEffect(() => {
    const node = controls.current;
    if (!node) return;
    const onStart = () => {
      userHasMoved.current = true;
    };
    node.addEventListener("start", onStart);
    return () => node.removeEventListener("start", onStart);
  }, [controls]);

  useEffect(() => {
    if (userHasMoved.current) return;
    const perspective = camera as THREE.PerspectiveCamera;
    const target = new THREE.Vector3(0, 0, 0);
    const corners = siteCorners(scene.extent.width, scene.extent.depth);
    const distance = fitDistance(
      corners,
      target,
      VIEW_DIRECTION,
      (perspective.fov * Math.PI) / 180,
      size.width / Math.max(size.height, 1),
    );

    // 0.74 rather than a margin above 1: fitDistance contains the whole site
    // box including its far corners, which for a ground plane viewed from
    // above leaves a lot of empty sky. Letting the nearest corner sit just
    // outside the frame fills the canvas with the plots, which are what the
    // buyer is here for.
    camera.position
      .copy(VIEW_DIRECTION)
      .normalize()
      .multiplyScalar(distance * 0.74)
      .add(target);
    camera.lookAt(target);
    controls.current?.target.copy(target);
    controls.current?.update();
  }, [camera, scene.extent.width, scene.extent.depth, size, controls]);

  return null;
}

/** Settles the camera on the selected plot rather than jumping (§8 motion). */
function CameraRig({
  scene,
  selectedId,
  reducedMotion,
  controls,
}: {
  scene: Scene;
  selectedId: string | null;
  reducedMotion: boolean;
  controls: React.RefObject<{ target: THREE.Vector3; update: () => void } | null>;
}) {
  const { camera } = useThree();
  const target = useRef(new THREE.Vector3());
  const desired = useRef(new THREE.Vector3());
  const active = useRef(false);

  useEffect(() => {
    if (!selectedId) return;
    const unit = scene.units.find((u) => u.id === selectedId);
    if (!unit) return;

    const [x, , z] = toWorld(unit.centroid, 0);
    const centre = sceneCentre(scene);
    target.current.set(x - centre[0], 0, z - centre[2]);
    desired.current.set(
      target.current.x + 26,
      34,
      target.current.z + 34,
    );

    if (reducedMotion) {
      // prefers-reduced-motion: an instant state change, not a flight (§8).
      camera.position.copy(desired.current);
      controls.current?.target.copy(target.current);
      controls.current?.update();
      active.current = false;
    } else {
      active.current = true;
    }
  }, [selectedId, scene, camera, reducedMotion, controls]);

  useFrame((_, delta) => {
    if (!active.current || !controls.current) return;
    const k = 1 - Math.pow(0.0016, delta); // ~900ms settle, frame-rate independent
    camera.position.lerp(desired.current, k);
    controls.current.target.lerp(target.current, k);
    controls.current.update();
    if (camera.position.distanceTo(desired.current) < 0.4) active.current = false;
  });

  return null;
}

/* ----------------------------------------------------------------- scene */

function SceneContents(props: Props) {
  const { scene, hour, reducedMotion, selectedId } = props;
  const centre = sceneCentre(scene);
  const controls = useRef<React.ComponentRef<typeof OrbitControls> | null>(null);
  const sun = sunDirection(hour);
  const radius = Math.max(scene.extent.width, scene.extent.depth);

  return (
    <>
      <color attach="background" args={["#F8F9F6"]} />
      {/* Fog only softens the far edge. It must begin beyond the model, or
          the whole site washes out to the background colour. */}
      <fog attach="fog" args={["#F8F9F6", radius * 3, radius * 7]} />

      {/* One soft sun with real shadows; no reflections (§10 fallback). */}
      <hemisphereLight args={["#DCE6DE", "#B6BDB2", 1.15]} />
      <directionalLight
        position={[sun[0] * radius, sun[1] * radius, sun[2] * radius]}
        intensity={1.5}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-radius * 0.62}
        shadow-camera-right={radius * 0.62}
        shadow-camera-top={radius * 0.62}
        shadow-camera-bottom={-radius * 0.62}
        shadow-camera-far={radius * 3}
        shadow-bias={-0.0006}
      />

      <group position={[-centre[0], 0, -centre[2]]}>
        <Ground scene={scene} />
        <Plots {...props} />
        <Planting scene={scene} mature={props.matureCanopy} />
        <Amenities scene={scene} />
      </group>

      <FitOnMount scene={scene} controls={controls} />

      <CameraRig
        scene={scene}
        selectedId={selectedId}
        reducedMotion={reducedMotion}
        controls={controls}
      />

      {/* Constrained orbit, limited polar angle, damped. No free-fly (§9.1). */}
      <OrbitControls
        ref={controls}
        enablePan
        enableDamping
        dampingFactor={0.08}
        minDistance={radius * 0.12}
        maxDistance={radius * 4}
        minPolarAngle={0.18}
        maxPolarAngle={Math.PI / 2.35}
        makeDefault
      />
    </>
  );
}

export default function PlotScene(props: Props) {
  const radius = Math.max(props.scene.extent.width, props.scene.extent.depth);
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      // A rough starting point only; FitOnMount reframes to the real canvas
      // size on mount and on every resize.
      camera={{ position: [radius, radius, radius], fov: 38, near: 0.5, far: radius * 12 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      style={{ touchAction: "none" }}
    >
      <SceneContents {...props} />
    </Canvas>
  );
}
