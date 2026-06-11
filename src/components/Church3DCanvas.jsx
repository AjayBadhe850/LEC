import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function Church3DCanvas({ scrollPercent = 0 }) {
  const mountRef = useRef(null);
  const [webGlSupported, setWebGlSupported] = useState(true);

  // Smooth interpolated scroll
  const scrollRef = useRef(0);

  useEffect(() => {
    // Check WebGL availability
    let canvas;
    try {
      canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        setWebGlSupported(false);
        return;
      }
    } catch (e) {
      setWebGlSupported(false);
      return;
    }

    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050508, 0.05);

    // Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 2.5, 9);
    camera.lookAt(0, 0.5, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.15);
    scene.add(ambientLight);

    const redLight = new THREE.PointLight(0xff0000, 2, 6);
    redLight.position.set(0, 4.8, 1.4); // close to cross
    scene.add(redLight);

    const blueLight = new THREE.PointLight(0x0050ff, 3, 10);
    blueLight.position.set(-2, 1.5, 0);
    scene.add(blueLight);

    const cyanLight = new THREE.PointLight(0x00d6ff, 3, 10);
    cyanLight.position.set(2, 1.5, 0);
    scene.add(cyanLight);

    // Main spotlight from top (Divine light)
    const divineLight = new THREE.SpotLight(0x00d6ff, 8, 15, Math.PI / 6, 0.5, 1);
    divineLight.position.set(0, 8, 1.4);
    divineLight.target.position.set(0, 0, 1.4);
    scene.add(divineLight);
    scene.add(divineLight.target);

    // ----------------------------------------------------
    // Build Programmatic Church Building Group
    // ----------------------------------------------------
    const churchGroup = new THREE.Group();
    churchGroup.position.set(0, -1.0, 0);
    scene.add(churchGroup);

    // Ground platform (terrace)
    const platformGeom = new THREE.CylinderGeometry(3.5, 3.8, 0.25, 32);
    const platformMat = new THREE.MeshStandardMaterial({
      color: 0x111116,
      roughness: 0.7,
      metalness: 0.6
    });
    const platform = new THREE.Mesh(platformGeom, platformMat);
    platform.position.y = -0.125;
    churchGroup.add(platform);

    // Nave (Main Hall)
    const naveGeom = new THREE.BoxGeometry(2.2, 1.6, 3.2);
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x1c202a, // dark slate/metallic silver-grey
      roughness: 0.35,
      metalness: 0.8
    });
    const nave = new THREE.Mesh(naveGeom, wallMat);
    nave.position.y = 0.8;
    churchGroup.add(nave);

    // Sloped Gable Roof (two sloped plates)
    const roofPlateGeom = new THREE.BoxGeometry(1.4, 0.06, 3.4);
    const roofMat = new THREE.MeshStandardMaterial({
      color: 0x003ab3, // Royal Blue metallic
      roughness: 0.4,
      metalness: 0.7
    });

    const roofLeft = new THREE.Mesh(roofPlateGeom, roofMat);
    roofLeft.position.set(-0.6, 1.85, 0);
    roofLeft.rotation.z = Math.PI / 6; // 30 deg
    churchGroup.add(roofLeft);

    const roofRight = new THREE.Mesh(roofPlateGeom, roofMat);
    roofRight.position.set(0.6, 1.85, 0);
    roofRight.rotation.z = -Math.PI / 6; // -30 deg
    churchGroup.add(roofRight);

    // Tower (at the front, Z = 1.3)
    const towerGeom = new THREE.BoxGeometry(0.7, 3.0, 0.7);
    const tower = new THREE.Mesh(towerGeom, wallMat);
    tower.position.set(0, 1.5, 1.25);
    churchGroup.add(tower);

    // Spire Pyramid (Cone on top of tower)
    const spireGeom = new THREE.ConeGeometry(0.5, 1.2, 4);
    const spireMat = new THREE.MeshStandardMaterial({
      color: 0x00d6ff, // cyan metallic
      roughness: 0.2,
      metalness: 0.85
    });
    const spire = new THREE.Mesh(spireGeom, spireMat);
    spire.position.set(0, 3.6, 1.25);
    spire.rotation.y = Math.PI / 4; // Align with tower box
    churchGroup.add(spire);

    // Glowing Red Cross (on top of spire)
    const crossGroup = new THREE.Group();
    const crossMat = new THREE.MeshStandardMaterial({
      color: 0xff0000,
      emissive: 0xff0000,
      emissiveIntensity: 6.0,
      roughness: 0.1,
      metalness: 0.5
    });
    const crossV = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.6, 0.08), crossMat);
    const crossH = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.08, 0.08), crossMat);
    crossH.position.y = 0.15;
    crossGroup.add(crossV);
    crossGroup.add(crossH);
    crossGroup.position.set(0, 4.4, 1.25);
    churchGroup.add(crossGroup);

    // Entrance door (on tower front, Z = 1.6)
    const doorGeom = new THREE.BoxGeometry(0.4, 0.7, 0.04);
    const doorMat = new THREE.MeshStandardMaterial({
      color: 0xff0000,
      emissive: 0xff0000,
      emissiveIntensity: 0.5,
      roughness: 0.4,
      metalness: 0.3
    });
    const door = new THREE.Mesh(doorGeom, doorMat);
    door.position.set(0, 0.35, 1.61);
    churchGroup.add(door);

    // Stained glass windows (glowing boxes on left and right walls)
    const windowGeom = new THREE.BoxGeometry(0.02, 0.65, 0.32);
    
    const blueGlassMat = new THREE.MeshStandardMaterial({
      color: 0x0050ff,
      emissive: 0x0050ff,
      emissiveIntensity: 4.0,
      roughness: 0.1,
      metalness: 0.9
    });
    
    const cyanGlassMat = new THREE.MeshStandardMaterial({
      color: 0x00d6ff,
      emissive: 0x00d6ff,
      emissiveIntensity: 4.0,
      roughness: 0.1,
      metalness: 0.9
    });

    const windowMeshes = [];

    // Left wall windows
    for (let z = -0.9; z <= 0.9; z += 0.9) {
      const win = new THREE.Mesh(windowGeom, blueGlassMat);
      win.position.set(-1.11, 0.9, z);
      churchGroup.add(win);
      windowMeshes.push(win);
    }

    // Right wall windows
    for (let z = -0.9; z <= 0.9; z += 0.9) {
      const win = new THREE.Mesh(windowGeom, cyanGlassMat);
      win.position.set(1.11, 0.9, z);
      churchGroup.add(win);
      windowMeshes.push(win);
    }

    // Interior light glowing through windows
    const interiorLight = new THREE.PointLight(0x00d6ff, 2, 4);
    interiorLight.position.set(0, 0.8, 0);
    churchGroup.add(interiorLight);

    // ----------------------------------------------------
    // Build Volumetric Cone Light (Downward grace rays)
    // ----------------------------------------------------
    const rayGeom = new THREE.CylinderGeometry(0.1, 2.2, 5.5, 32, 1, true);
    rayGeom.translate(0, 2.75, 0);
    const rayMaterial = new THREE.MeshBasicMaterial({
      color: 0x00d6ff,
      transparent: true,
      opacity: 0.12,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide
    });
    const lightRay = new THREE.Mesh(rayGeom, rayMaterial);
    lightRay.position.set(0, 0.5, 1.25);
    scene.add(lightRay);

    // ----------------------------------------------------
    // Build Floating Particle Dust
    // ----------------------------------------------------
    const particleCount = 45;
    const particleGeom = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const particleSpeeds = [];

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 2.8;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = Math.random() * 5 - 1.5;
      positions[i * 3 + 2] = Math.sin(angle) * radius;

      particleSpeeds.push({
        y: 0.006 + Math.random() * 0.008,
        wobble: Math.random() * 0.01,
        phase: Math.random() * Math.PI * 2
      });
    }

    particleGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const particleMaterial = new THREE.PointsMaterial({
      color: 0x00d6ff,
      size: 0.08,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const particles = new THREE.Points(particleGeom, particleMaterial);
    scene.add(particles);

    // ----------------------------------------------------
    // Animation Loop
    // ----------------------------------------------------
    const clock = new THREE.Timer();
clock.connect(document);

    const animate = () => {
      requestAnimationFrame(animate);

      clock.update();
const elapsed = clock.getElapsed();

      // Smoothly interpolate scroll state
      scrollRef.current += (scrollPercent - scrollRef.current) * 0.06;
      const s = scrollRef.current;

      // Rotate entire church slowly over time, adding scroll offset
      churchGroup.rotation.y = elapsed * 0.04 + s * Math.PI * 1.5;

      // Animate camera position and target based on scroll position
      // s is 0 to 1
      if (s < 0.25) {
        // Section 1: Front perspective, slowly bobbing
        const localPct = s / 0.25;
        camera.position.x = THREE.MathUtils.lerp(0, 3.2, localPct);
        camera.position.y = THREE.MathUtils.lerp(2.2, 1.8, localPct);
        camera.position.z = THREE.MathUtils.lerp(8.5, 6.0, localPct);
        camera.lookAt(0, 0.4, 0);
      } else if (s < 0.6) {
        // Section 2: Side view close up on stained glass windows
        const localPct = (s - 0.25) / 0.35;
        camera.position.x = THREE.MathUtils.lerp(3.2, -4.5, localPct);
        camera.position.y = THREE.MathUtils.lerp(1.8, 3.5, localPct);
        camera.position.z = THREE.MathUtils.lerp(6.0, 4.0, localPct);
        camera.lookAt(0, 0.6, 0);
      } else if (s < 0.85) {
        // Section 3: High angle looking down (Divine Perspective)
        const localPct = (s - 0.6) / 0.25;
        camera.position.x = THREE.MathUtils.lerp(-4.5, 0, localPct);
        camera.position.y = THREE.MathUtils.lerp(3.5, 6.5, localPct);
        camera.position.z = THREE.MathUtils.lerp(4.0, 4.2, localPct);
        camera.lookAt(0, 0.2, 0);
      } else {
        // Section 4: Low angle looking up at the cross (Sacred Perspective)
        const localPct = (s - 0.85) / 0.15;
        camera.position.x = THREE.MathUtils.lerp(0, 0, localPct);
        camera.position.y = THREE.MathUtils.lerp(6.5, 0.6, localPct);
        camera.position.z = THREE.MathUtils.lerp(4.2, 4.8, localPct);
        // Look up at the cross (y: 3.5)
        const targetLookY = THREE.MathUtils.lerp(0.2, 3.3, localPct);
        camera.lookAt(0, targetLookY, 1.0);
      }

      // Add a tiny bit of floating noise to camera height
      camera.position.y += Math.sin(elapsed * 0.8) * 0.05;

      // Animate stained glass windows pulse
      const windowPulse = 3.0 + Math.sin(elapsed * 2) * 1.0;
      blueGlassMat.emissiveIntensity = windowPulse;
      cyanGlassMat.emissiveIntensity = windowPulse;
      crossMat.emissiveIntensity = 5.0 + Math.sin(elapsed * 3.5) * 1.5;

      // Rotate light ray mesh slightly
      lightRay.rotation.y = -elapsed * 0.1;
      // Ray intensity grows when looking up (near s = 1.0)
      if (s > 0.8) {
        rayMaterial.opacity = 0.12 + (s - 0.8) * 0.7;
      } else {
        rayMaterial.opacity = 0.12;
      }

      // Animate particles rising
      const posAttr = particles.geometry.attributes.position;
      if (posAttr) {
        for (let i = 0; i < particleCount; i++) {
          let y = posAttr.getY(i);
          y += particleSpeeds[i].y;
          
          // Wobble
          const x = posAttr.getX(i) + Math.sin(elapsed * 1.5 + particleSpeeds[i].phase) * particleSpeeds[i].wobble;
          const z = posAttr.getZ(i) + Math.cos(elapsed * 1.5 + particleSpeeds[i].phase) * particleSpeeds[i].wobble;

          if (y > 4.0) {
            y = -1.5;
          }
          posAttr.setY(i, y);
          posAttr.setX(i, x);
          posAttr.setZ(i, z);
        }
        posAttr.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      scene.clear();
      renderer.dispose();
    };
  }, [scrollPercent]);

  return (
    <div className="church-3d-canvas-container">
      {webGlSupported ? (
        <div ref={mountRef} className="church-three-canvas" />
      ) : (
        /* Cinematic SVG/CSS Fallback for browsers without WebGL */
        <div className="church-svg-fallback">
          <div className="fallback-scene">
            <svg viewBox="0 0 200 200" className="fallback-church-svg">
              <defs>
                <linearGradient id="churchWallGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1e202a" />
                  <stop offset="100%" stopColor="#0a0a0f" />
                </linearGradient>
                <linearGradient id="churchRoofGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#0050ff" />
                  <stop offset="100%" stopColor="#001a60" />
                </linearGradient>
                <filter id="holyGlow">
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>
              {/* Ground line */}
              <ellipse cx="100" cy="160" rx="70" ry="12" fill="#111116" />

              {/* Church Nave */}
              <rect x="55" y="100" width="90" height="50" rx="3" fill="url(#churchWallGrad)" stroke="rgba(255,255,255,0.05)" />
              {/* Roof */}
              <polygon points="50,100 100,60 150,100" fill="url(#churchRoofGrad)" />

              {/* Spire Tower */}
              <rect x="85" y="50" width="30" height="100" fill="url(#churchWallGrad)" stroke="rgba(255,255,255,0.05)" />
              {/* Spire Cone */}
              <polygon points="80,50 100,10 120,50" fill="#00d6ff" />

              {/* Stained Glass Windows */}
              <rect x="65" y="115" width="10" height="20" rx="5" fill="#0050ff" opacity="0.8" filter="url(#holyGlow)" />
              <rect x="125" y="115" width="10" height="20" rx="5" fill="#00d6ff" opacity="0.8" filter="url(#holyGlow)" />

              {/* Cross */}
              <rect x="98" y="-5" width="4" height="22" fill="#ff0000" filter="url(#holyGlow)" />
              <rect x="90" y="0" width="20" height="4" fill="#ff0000" filter="url(#holyGlow)" />
            </svg>
            <div className="divine-beam"></div>
          </div>
        </div>
      )}

      <style>{`
        .church-3d-canvas-container {
          position: relative;
          width: 100%;
          height: 100%;
          overflow: hidden;
          background: transparent;
        }

        .church-three-canvas {
          width: 100%;
          height: 100%;
          opacity: 0.9;
          filter: drop-shadow(0 0 20px rgba(0, 80, 255, 0.15));
        }

        .church-svg-fallback {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .fallback-scene {
          position: relative;
          width: 280px;
          height: 280px;
        }

        .fallback-church-svg {
          width: 100%;
          height: 100%;
        }

        .divine-beam {
          position: absolute;
          top: -30%;
          left: 50%;
          transform: translateX(-50%);
          width: 120px;
          height: 200px;
          background: linear-gradient(to bottom, rgba(0, 214, 255, 0.25) 0%, transparent 100%);
          clip-path: polygon(40% 0, 60% 0, 100% 100%, 0 100%);
          filter: blur(12px);
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}
