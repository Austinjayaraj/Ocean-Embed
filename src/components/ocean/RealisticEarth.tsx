import { useRef, useState, useMemo, useCallback } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Line, Html } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { locations, argoLocations } from '../../data/mockData';
import type { OceanLocation, OceanObservation } from '../../types/ocean';
import { getOceanObservation } from '../../data/mockData';
import { Play, Pause, Layers, ArrowRight, RotateCcw, FastForward, Radio } from 'lucide-react';

const GLOBE_RADIUS = 3.2;

// Recognized Geographic Landmarks - Scientific Pointers
const SCIENTIFIC_LANDMARKS: Array<{
  name: string;
  lat: number;
  lng: number;
  type: string;
  region: 'Arabian Sea' | 'Bay of Bengal' | 'North Indian Ocean';
}> = [
  { name: 'Bay of Bengal', lat: 15.25, lng: 88.75, type: 'ocean', region: 'Bay of Bengal' },
  { name: 'Arabian Sea', lat: 16.0, lng: 65.0, type: 'ocean', region: 'Arabian Sea' },
  { name: 'India', lat: 21.0, lng: 78.5, type: 'land', region: 'North Indian Ocean' },
  { name: 'Sri Lanka', lat: 7.8, lng: 80.7, type: 'land', region: 'North Indian Ocean' },
  { name: 'Maldives', lat: 3.2, lng: 73.2, type: 'ocean', region: 'Arabian Sea' },
  { name: 'Equatorial Indian Ocean', lat: 0.0, lng: 80.0, type: 'ocean', region: 'North Indian Ocean' },
];

// Utility: convert lat/long to 3D Cartesian coordinates on sphere
function latLngToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

// Atmospheric Glow Shader (Subtle Fresnel Limb Scattering)
function AtmosphereGlow({ radius }: { radius: number }) {
  const atmosphereVertexShader = `
    varying vec3 vNormal;
    varying vec3 vPosition;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const atmosphereFragmentShader = `
    varying vec3 vNormal;
    varying vec3 vPosition;
    void main() {
      vec3 viewDir = normalize(-vPosition);
      float rim = 1.0 - max(0.0, dot(vNormal, viewDir));
      float intensity = pow(rim, 3.2) * 0.75;
      gl_FragColor = vec4(0.2, 0.65, 1.0, intensity);
    }
  `;

  return (
    <mesh scale={[1.025, 1.025, 1.025]}>
      <sphereGeometry args={[radius, 48, 48]} />
      <shaderMaterial
        vertexShader={atmosphereVertexShader}
        fragmentShader={atmosphereFragmentShader}
        blending={THREE.AdditiveBlending}
        side={THREE.BackSide}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}

// Scientific Location Pointer Component
// Clean stem, contact point, pin tip, and compact label with coordinate readout
function LocationPointer({
  loc,
  isSelected,
  isHovered,
  cameraPos,
  onClick,
  onHover,
}: {
  loc: { name: string; lat: number; lng: number; type?: string };
  isSelected: boolean;
  isHovered: boolean;
  cameraPos: THREE.Vector3;
  onClick: () => void;
  onHover: (hovered: boolean) => void;
}) {
  // 1. Normal on unit sphere
  const normal = useMemo(() => {
    return latLngToVector3(loc.lat, loc.lng, 1.0).normalize();
  }, [loc.lat, loc.lng]);

  // 2. Surface contact point
  const surfacePos = useMemo(() => {
    return normal.clone().multiplyScalar(GLOBE_RADIUS * 1.002);
  }, [normal]);

  // 3. Pointer tip (raised above sphere)
  const stemHeight = isSelected ? 0.32 : isHovered ? 0.26 : 0.20;
  const tipPos = useMemo(() => {
    return normal.clone().multiplyScalar(GLOBE_RADIUS + stemHeight);
  }, [normal, stemHeight]);

  // 4. Dot product with camera vector to hide pointers on the backside of Earth
  const camDir = useMemo(() => cameraPos.clone().normalize(), [cameraPos]);
  const facingRatio = normal.dot(camDir);

  // If on back hemisphere or limb horizon, hide to prevent clutter
  if (facingRatio < 0.15) {
    return null;
  }

  // Label display logic: always show if selected, hovered, or primary landmark facing camera
  const showLabel = isSelected || isHovered || (facingRatio > 0.42 && cameraPos.length() < 9.5);

  return (
    <group>
      {/* Surface contact point */}
      <mesh position={surfacePos}>
        <sphereGeometry args={[isSelected ? 0.024 : 0.016, 12, 12]} />
        <meshBasicMaterial
          color={isSelected ? '#18BFEF' : isHovered ? '#45D6C8' : '#64748B'}
          toneMapped={false}
        />
      </mesh>

      {/* Thin vertical pointer stem line */}
      <Line
        points={[surfacePos, tipPos]}
        color={isSelected ? '#18BFEF' : isHovered ? '#45D6C8' : '#475569'}
        lineWidth={isSelected ? 1.5 : 1.0}
        transparent
        opacity={isSelected ? 0.95 : isHovered ? 0.8 : 0.4}
      />

      {/* Pin tip */}
      <mesh
        position={tipPos}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'pointer';
          onHover(true);
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto';
          onHover(false);
        }}
      >
        <sphereGeometry args={[isSelected ? 0.022 : 0.015, 12, 12]} />
        <meshBasicMaterial
          color={isSelected ? '#FFFFFF' : isHovered ? '#18BFEF' : '#CBD5E1'}
          toneMapped={false}
        />
      </mesh>

      {/* Compact Scientific Label */}
      {showLabel && (
        <Html
          position={tipPos}
          center
          distanceFactor={7.5}
          style={{
            pointerEvents: isSelected || isHovered ? 'auto' : 'none',
            userSelect: 'none',
            whiteSpace: 'nowrap',
            transform: 'translate3d(0, -110%, 0)', // Float directly above the tip
          }}
        >
          <div
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
            className={`cursor-pointer transition-all duration-200 flex flex-col items-center ${
              isSelected
                ? 'scale-105'
                : isHovered
                ? 'scale-100 opacity-100'
                : 'scale-90 opacity-80 hover:opacity-100'
            }`}
          >
            <div
              className={`px-2 py-0.5 rounded backdrop-blur-md transition-all ${
                isSelected
                  ? 'bg-[#030d1d]/90 border border-cyan-400 shadow-[0_0_12px_rgba(24,191,239,0.5)] text-cyan-200 font-bold'
                  : isHovered
                  ? 'bg-[#030d1d]/85 border border-cyan-500/50 text-white font-semibold'
                  : 'bg-[#020712]/75 border border-slate-700/60 text-slate-300 font-normal'
              }`}
            >
              <div className="text-[10px] tracking-wider uppercase font-mono-tech flex items-center gap-1">
                {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping inline-block" />}
                <span>{loc.name}</span>
              </div>
              <div className="text-[8px] font-mono-tech text-cyan-400/90 tracking-tight">
                {loc.lat.toFixed(2)}°N · {loc.lng.toFixed(2)}°E
              </div>
            </div>
            {/* Pointer tick */}
            <div className={`w-[1px] h-1.5 ${isSelected ? 'bg-cyan-400' : 'bg-slate-500'}`} />
          </div>
        </Html>
      )}
    </group>
  );
}

// Realistic Earth Globe with Physical Textures, Sun-Directional Night Lights, and Subtle Overlays
function EarthGlobe({
  onLocationSelect,
  selectedLocation,
  showArgo,
  showGrid,
  cameraPos,
  onHoverData,
}: {
  onLocationSelect?: (loc: OceanLocation) => void;
  selectedLocation?: OceanLocation | null;
  showArgo: boolean;
  showGrid: boolean;
  cameraPos: THREE.Vector3;
  onHoverData: (data: { loc: OceanLocation; obs: OceanObservation } | null) => void;
}) {
  const earthRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  const [hoveredLocName, setHoveredLocName] = useState<string | null>(null);

  const textureLoader = useMemo(() => new THREE.TextureLoader(), []);

  // Textures loaded from public/textures
  const [dayMap, nightMap, bumpMap, specularMap, cloudsMap] = useMemo(() => {
    const day = textureLoader.load('/textures/earth-blue-marble.jpg');
    const night = textureLoader.load('/textures/earth-night.jpg');
    const bump = textureLoader.load('/textures/earth-topology.png');
    const spec = textureLoader.load('/textures/earth-water.png');
    const clouds = textureLoader.load('/textures/earth-clouds.png');
    day.colorSpace = THREE.SRGBColorSpace;
    night.colorSpace = THREE.SRGBColorSpace;
    clouds.colorSpace = THREE.SRGBColorSpace;
    return [day, night, bump, spec, clouds];
  }, [textureLoader]);

  // Sun Direction: matches directionalLight position [8, 5, 6]
  const sunDirection = useMemo(() => new THREE.Vector3(8, 5, 6).normalize(), []);

  // Shader hook: modulate city lights to appear strictly on the night side of Earth
  const handleMaterialCompile = useCallback(
    (shader: THREE.WebGLProgramParametersWithUniforms) => {
      shader.uniforms.uSunDir = { value: sunDirection };
      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <common>',
        `#include <common>
         uniform vec3 uSunDir;`
      );
      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <emissivemap_fragment>',
        `#include <emissivemap_fragment>
         float sunDot = dot(vNormal, uSunDir);
         float nightFactor = smoothstep(0.12, -0.25, sunDot);
         totalEmissiveRadiance *= nightFactor;`
      );
    },
    [sunDirection]
  );

  // Subtle clouds drift
  useFrame((_, delta) => {
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += delta * 0.01;
    }
  });

  // Calculate dynamic 0.25° grid opacity based on camera zoom
  const gridOpacity = useMemo(() => {
    const dist = cameraPos.length();
    if (dist > 9.0) return 0.04;
    if (dist > 5.5) return 0.12;
    return 0.28;
  }, [cameraPos]);

  // 0.25° Ocean Grid Arcs (focused over North Indian Ocean)
  const gridLines = useMemo(() => {
    const lines: THREE.Vector3[][] = [];
    const R = GLOBE_RADIUS * 1.001;

    // Latitudes: 0° to 25°N (every 5°)
    for (let lat = 0; lat <= 25; lat += 5) {
      const arc: THREE.Vector3[] = [];
      for (let lng = 50; lng <= 100; lng += 2) {
        arc.push(latLngToVector3(lat, lng, R));
      }
      lines.push(arc);
    }
    // Longitudes: 55°E to 95°E (every 5°)
    for (let lng = 55; lng <= 95; lng += 5) {
      const arc: THREE.Vector3[] = [];
      for (let lat = -5; lat <= 25; lat += 2) {
        arc.push(latLngToVector3(lat, lng, R));
      }
      lines.push(arc);
    }
    return lines;
  }, []);

  return (
    <group>
      {/* 1. Base Earth Sphere with Physical Specular Water & Modulated Night Lights */}
      <mesh ref={earthRef} receiveShadow castShadow>
        <sphereGeometry args={[GLOBE_RADIUS, 64, 64]} />
        <meshStandardMaterial
          map={dayMap}
          bumpMap={bumpMap}
          bumpScale={0.04}
          roughnessMap={specularMap}
          roughness={0.42}
          metalness={0.08}
          emissiveMap={nightMap}
          emissive={new THREE.Color(0xfff5db)}
          emissiveIntensity={0.65}
          onBeforeCompile={handleMaterialCompile}
        />
      </mesh>

      {/* 2. Atmosphere Glow Rim (Fresnel scattering) */}
      <AtmosphereGlow radius={GLOBE_RADIUS} />

      {/* 3. Realistic Cloud Layer */}
      <mesh ref={cloudsRef} scale={[1.011, 1.011, 1.011]}>
        <sphereGeometry args={[GLOBE_RADIUS, 48, 48]} />
        <meshStandardMaterial
          map={cloudsMap}
          transparent
          opacity={0.32}
          blending={THREE.NormalBlending}
          depthWrite={false}
        />
      </mesh>

      {/* 4. Subtle 0.25° Scientific Ocean Grid (Zoom-adaptive opacity) */}
      {showGrid && (
        <group>
          {gridLines.map((pts, i) => (
            <Line
              key={i}
              points={pts}
              color="#18BFEF"
              lineWidth={0.5}
              transparent
              opacity={gridOpacity}
            />
          ))}
        </group>
      )}

      {/* 5. Clean Geographic Pointers for Important Regions */}
      {SCIENTIFIC_LANDMARKS.map((lm, idx) => {
        const isSelected = selectedLocation?.name === lm.name;
        const isHovered = hoveredLocName === lm.name;

        return (
          <LocationPointer
            key={`landmark-${idx}`}
            loc={lm}
            isSelected={isSelected}
            isHovered={isHovered}
            cameraPos={cameraPos}
            onClick={() => {
              const matchedLoc: OceanLocation = locations.find((l) => l.name === lm.name) || {
                name: lm.name,
                lat: lm.lat,
                lng: lm.lng,
                region: lm.region,
              };
              onLocationSelect?.(matchedLoc);
            }}
            onHover={(hovered) => {
              setHoveredLocName(hovered ? lm.name : null);
              if (hovered) {
                const matched: OceanLocation = locations.find((l) => l.name === lm.name) || {
                  name: lm.name,
                  lat: lm.lat,
                  lng: lm.lng,
                  region: lm.region,
                };
                onHoverData({ loc: matched, obs: getOceanObservation(matched) });
              } else {
                onHoverData(null);
              }
            }}
          />
        );
      })}

      {/* 6. Selected Location Pointer (if custom coordinate outside landmarks) */}
      {selectedLocation &&
        !SCIENTIFIC_LANDMARKS.some((l) => l.name === selectedLocation.name) && (
          <LocationPointer
            loc={selectedLocation}
            isSelected={true}
            isHovered={hoveredLocName === selectedLocation.name}
            cameraPos={cameraPos}
            onClick={() => onLocationSelect?.(selectedLocation)}
            onHover={(hovered) => {
              setHoveredLocName(hovered ? selectedLocation.name : null);
            }}
          />
        )}

      {/* 7. Subtle ARGO Float Probes (Tiny Buoy Markers) */}
      {showArgo &&
        argoLocations.map((argo, i) => {
          const pos = latLngToVector3(argo.lat, argo.lng, GLOBE_RADIUS * 1.003);
          return (
            <group key={`argo-${i}`} position={pos}>
              <mesh
                onClick={(e) => {
                  e.stopPropagation();
                  onLocationSelect?.(argo);
                }}
                onPointerOver={() => {
                  document.body.style.cursor = 'pointer';
                }}
                onPointerOut={() => {
                  document.body.style.cursor = 'auto';
                }}
              >
                <coneGeometry args={[0.014, 0.032, 8]} />
                <meshBasicMaterial color="#38BDF8" />
              </mesh>
            </group>
          );
        })}
    </group>
  );
}

// Professional Camera Controller with Inertia, Fly-To Spherical Transitions, and Space Intro
function CameraController({
  initialCamPos,
  targetCamPos,
  autoRotate,
  introActive,
  onIntroComplete,
  onCameraUpdate,
}: {
  initialCamPos: THREE.Vector3;
  targetCamPos: THREE.Vector3;
  autoRotate: boolean;
  introActive: boolean;
  onIntroComplete: () => void;
  onCameraUpdate: (pos: THREE.Vector3) => void;
}) {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const introStartTime = useRef<number | null>(null);

  // Transition state for smooth fly-to animations
  const prevTargetRef = useRef<THREE.Vector3>(targetCamPos.clone());
  const isFlyToActive = useRef(false);
  const flyStartPos = useRef<THREE.Vector3>(new THREE.Vector3());
  const flyStartTime = useRef(0);

  // Detect when targetCamPos changes to trigger a smooth spherical fly-to
  if (controlsRef.current && !targetCamPos.equals(prevTargetRef.current)) {
    prevTargetRef.current.copy(targetCamPos);
    isFlyToActive.current = true;
    flyStartPos.current.copy(controlsRef.current.object.position);
    flyStartTime.current = performance.now();
  }

  useFrame((state) => {
    if (!controlsRef.current) return;

    onCameraUpdate(state.camera.position);

    // 1. Cinematic Space Intro Sequence
    if (introActive) {
      if (introStartTime.current === null) {
        introStartTime.current = state.clock.getElapsedTime();
      }
      const elapsed = state.clock.getElapsedTime() - introStartTime.current;
      const duration = 3.6;
      const t = Math.min(1, elapsed / duration);
      // Smooth cubic easing
      const ease = 1 - Math.pow(1 - t, 3);

      state.camera.position.lerpVectors(new THREE.Vector3(0, 6, 23), initialCamPos, ease);
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();

      if (t >= 1) {
        onIntroComplete();
      }
      return;
    }

    // 2. Smooth Spherical Fly-To Transition when selecting locations
    if (isFlyToActive.current) {
      const elapsed = (performance.now() - flyStartTime.current) / 1000;
      const duration = 1.25; // 1.25s cinematic transition
      const t = Math.min(1, elapsed / duration);
      // Smooth ease-in-out
      const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

      const startDir = flyStartPos.current.clone().normalize();
      const targetDir = targetCamPos.clone().normalize();
      const startDist = flyStartPos.current.length();
      const targetDist = targetCamPos.length();

      const currentDir = new THREE.Vector3().lerpVectors(startDir, targetDir, ease).normalize();
      const currentDist = THREE.MathUtils.lerp(startDist, targetDist, ease);

      state.camera.position.copy(currentDir.multiplyScalar(currentDist));
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();

      if (t >= 1) {
        isFlyToActive.current = false;
      }
      return;
    }

    // 3. Manual OrbitControls with Smooth Inertia / Damping
    controlsRef.current.update();
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={false}
      minDistance={4.1}
      maxDistance={16.0}
      enableDamping={true}
      dampingFactor={0.05}
      rotateSpeed={0.55}
      zoomSpeed={0.85}
      autoRotate={autoRotate}
      autoRotateSpeed={0.35}
    />
  );
}

interface RealisticEarthProps {
  onLocationSelect?: (loc: OceanLocation) => void;
  selectedLocation?: OceanLocation | null;
  showArgo?: boolean;
  showAnomalies?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onExploreSurfaceData?: (loc: OceanLocation) => void;
  onReconstructClick?: () => void;
}

export default function RealisticEarth({
  onLocationSelect,
  selectedLocation,
  showArgo = true,
  className = '',
  style,
  onExploreSurfaceData,
}: RealisticEarthProps) {
  const [autoRotate, setAutoRotate] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [showArgoFloats, setShowArgoFloats] = useState(showArgo);
  const [hoveredData, setHoveredData] = useState<{ loc: OceanLocation; obs: OceanObservation } | null>(null);
  const [introActive, setIntroActive] = useState(true);
  const [cameraPos, setCameraPos] = useState<THREE.Vector3>(new THREE.Vector3(0, 6, 23));

  // Default North Indian Ocean framing position (lat 14.0°N, lng 78.0°E, altitude ~5.8)
  const initialCamPos = useMemo(() => {
    const dir = latLngToVector3(14.0, 78.0, 5.8);
    return new THREE.Vector3(dir.x, dir.y + 0.3, dir.z);
  }, []);

  // Compute camera position facing selected location
  const targetCamPos = useMemo(() => {
    if (!selectedLocation) return initialCamPos;
    const dir = latLngToVector3(selectedLocation.lat, selectedLocation.lng, 5.3);
    return new THREE.Vector3(dir.x, dir.y + 0.25, dir.z);
  }, [selectedLocation, initialCamPos]);

  const handleSkipIntro = () => {
    setIntroActive(false);
  };

  const handleResetCamera = () => {
    setAutoRotate(false);
    const defaultLoc = locations[0]; // Bay of Bengal (15.25°N, 88.75°E)
    onLocationSelect?.(defaultLoc);
  };

  return (
    <div
      className={`relative w-full h-full overflow-hidden ${className}`}
      style={{ ...style }}
      onPointerDown={() => {
        if (introActive) handleSkipIntro();
      }}
    >
      {/* 3D WebGL Canvas */}
      <Canvas
        camera={{ position: [0, 6, 23], fov: 40 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        style={{ width: '100%', height: '100%', background: '#020612' }}
      >
        <ambientLight intensity={0.4} />
        {/* Realistic Directional Sunlight */}
        <directionalLight position={[8, 5, 6]} intensity={2.2} castShadow />
        {/* Space Rim Fill Light */}
        <directionalLight position={[-9, -3, -7]} intensity={0.2} color="#062244" />

        {/* Space Starfield */}
        <Stars radius={45} depth={30} count={2200} factor={3} saturation={0} fade speed={0.3} />

        {/* 3D Earth Globe */}
        <EarthGlobe
          onLocationSelect={onLocationSelect}
          selectedLocation={selectedLocation}
          showArgo={showArgoFloats}
          showGrid={showGrid}
          cameraPos={cameraPos}
          onHoverData={setHoveredData}
        />

        <CameraController
          initialCamPos={initialCamPos}
          targetCamPos={targetCamPos}
          autoRotate={autoRotate}
          introActive={introActive}
          onIntroComplete={() => setIntroActive(false)}
          onCameraUpdate={setCameraPos}
        />
      </Canvas>

      {/* Cinematic Intro Skip Button */}
      {introActive && (
        <button
          onClick={handleSkipIntro}
          className="absolute bottom-6 right-6 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#030d1d]/85 border border-cyan-500/40 text-[11px] font-mono-tech text-cyan-300 backdrop-blur-md hover:bg-cyan-950 transition-all cursor-pointer z-30 shadow-[0_0_15px_rgba(24,191,239,0.3)]"
        >
          <FastForward size={12} />
          <span>Skip Space Intro</span>
        </button>
      )}

      {/* Floating Selected Location Card (Minimal, Non-Intrusive, Section 6 & 11 Specification) */}
      {!introActive && (
        <div className="absolute top-18 left-6 max-w-xs pointer-events-none font-mono-tech z-20">
          {hoveredData ? (
            <div className="ocean-panel-glow p-3 text-xs pointer-events-auto border-cyan-400/50 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center justify-between text-cyan-300 font-bold border-b border-cyan-500/20 pb-1 mb-1.5">
                <span>{hoveredData.loc.name}</span>
                <span className="text-[10px] text-amber-400">INSPECT</span>
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
                <div>
                  <span className="text-slate-400">LAT:</span>{' '}
                  <span className="text-white font-bold">{hoveredData.loc.lat.toFixed(2)}°N</span>
                </div>
                <div>
                  <span className="text-slate-400">LON:</span>{' '}
                  <span className="text-white font-bold">{hoveredData.loc.lng.toFixed(2)}°E</span>
                </div>
                <div>
                  <span className="text-slate-400">SST:</span>{' '}
                  <span className="text-red-400 font-bold">{hoveredData.obs.sst} °C</span>
                </div>
                <div>
                  <span className="text-slate-400">SSS:</span>{' '}
                  <span className="text-cyan-400 font-bold">{hoveredData.obs.sss} PSU</span>
                </div>
                <div>
                  <span className="text-slate-400">SLA:</span>{' '}
                  <span className="text-teal-300">{hoveredData.obs.sla > 0 ? '+' : ''}{hoveredData.obs.sla}m</span>
                </div>
                <div>
                  <span className="text-slate-400">CURRENT:</span>{' '}
                  <span className="text-emerald-400">{hoveredData.obs.currentSpeed} m/s</span>
                </div>
              </div>
            </div>
          ) : selectedLocation ? (
            <div className="ocean-panel-glow p-3.5 text-xs pointer-events-auto border-cyan-400/40 shadow-2xl space-y-2 backdrop-blur-xl">
              <div className="flex items-center justify-between border-b border-cyan-500/25 pb-1">
                <span className="text-[10px] text-cyan-300 uppercase tracking-widest font-bold">
                  SELECTED LOCATION
                </span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-[9px] text-emerald-400 font-bold">
                  0.25° GRID CELL
                </span>
              </div>

              <div>
                <p className="text-sm font-bold text-white tracking-wide">{selectedLocation.name}</p>
                <div className="flex items-center gap-2 text-slate-300 text-[11px] mt-0.5">
                  <span className="text-cyan-300 font-mono">{selectedLocation.lat.toFixed(2)}° N</span>
                  <span>·</span>
                  <span className="text-cyan-300 font-mono">{selectedLocation.lng.toFixed(2)}° E</span>
                  <span>·</span>
                  <span className="text-slate-400">NORTH INDIAN OCEAN</span>
                </div>
              </div>

              {onExploreSurfaceData && (
                <button
                  onClick={() => onExploreSurfaceData(selectedLocation)}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded bg-gradient-to-r from-[#0866C6] to-[#18BFEF] hover:brightness-110 text-white font-bold text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(24,191,239,0.4)] transition-all cursor-pointer mt-1"
                >
                  <span>EXPLORE</span>
                  <ArrowRight size={13} className="text-white" />
                </button>
              )}
            </div>
          ) : (
            <div className="px-3 py-2 rounded bg-[#030d1d]/85 border border-slate-800 text-[11px] text-slate-400 backdrop-blur-md">
              Drag to rotate • Click North Indian Ocean coordinate to inspect
            </div>
          )}
        </div>
      )}

      {/* Floating Minimal Scientific Controls (Bottom-Right) */}
      {!introActive && (
        <div className="absolute bottom-6 right-6 flex items-center gap-2 pointer-events-auto font-mono-tech z-20">
          <button
            onClick={handleResetCamera}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#030d1d]/85 hover:bg-slate-800 text-slate-300 border border-slate-700/60 text-xs backdrop-blur-md transition-colors cursor-pointer"
            title="Reset North Indian Ocean View"
          >
            <RotateCcw size={12} className="text-cyan-400" />
            <span className="hidden sm:inline">RESET</span>
          </button>

          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`p-2 rounded-lg border backdrop-blur-md transition-colors cursor-pointer ${
              autoRotate
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                : 'bg-[#030d1d]/85 border-slate-700/60 text-slate-400 hover:text-white'
            }`}
            title="Toggle Earth Auto-Rotation"
          >
            {autoRotate ? <Pause size={13} /> : <Play size={13} />}
          </button>

          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`p-2 rounded-lg border backdrop-blur-md transition-colors cursor-pointer ${
              showGrid
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                : 'bg-[#030d1d]/85 border-slate-700/60 text-slate-400 hover:text-white'
            }`}
            title="Toggle 0.25° Grid"
          >
            <Layers size={13} />
          </button>

          <button
            onClick={() => setShowArgoFloats(!showArgoFloats)}
            className={`p-2 rounded-lg border backdrop-blur-md transition-colors cursor-pointer ${
              showArgoFloats
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                : 'bg-[#030d1d]/85 border-slate-700/60 text-slate-400 hover:text-white'
            }`}
            title="Toggle ARGO Buoy Markers"
          >
            <Radio size={13} />
          </button>
        </div>
      )}
    </div>
  );
}
