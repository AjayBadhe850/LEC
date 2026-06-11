import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function Canvas3D() {
  const mountRef = useRef(null);
  const [webGlSupported, setWebGlSupported] = useState(true);
  const [assemblyProgress, setAssemblyProgress] = useState(0); // 0 to 100 for display overlays if needed

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

    // Get container dimensions
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050505, 0.045);

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 3, 10);
    camera.lookAt(0, 0.8, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.25);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x00d6ff, 1.8, 15);
    pointLight.position.set(0, 4, 3);
    scene.add(pointLight);

    const redLight = new THREE.PointLight(0xff0000, 2.5, 8);
    redLight.position.set(0, 1.5, 0);
    scene.add(redLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(5, 8, 5);
    scene.add(directionalLight);

    // ----------------------------------------------------
    // Build Programmatic Bible
    // ----------------------------------------------------
    const bibleGroup = new THREE.Group();
    bibleGroup.position.set(0, -1, 0);
    scene.add(bibleGroup);

    // Book Cover (Blue leather)
    const coverMaterial = new THREE.MeshStandardMaterial({
      color: 0x002080,
      roughness: 0.7,
      metalness: 0.1,
      side: THREE.DoubleSide
    });

    const coverLeftGeom = new THREE.BoxGeometry(2, 0.08, 2.6);
    coverLeftGeom.translate(-1, 0, 0); // anchor at spine
    const coverLeft = new THREE.Mesh(coverLeftGeom, coverMaterial);

    const coverRightGeom = new THREE.BoxGeometry(2, 0.08, 2.6);
    coverRightGeom.translate(1, 0, 0); // anchor at spine
    const coverRight = new THREE.Mesh(coverRightGeom, coverMaterial);

    bibleGroup.add(coverLeft);
    bibleGroup.add(coverRight);

    // Book Pages (Gold/Off-white)
    const pageMaterial = new THREE.MeshStandardMaterial({
      color: 0xfffdf0,
      roughness: 0.9,
      metalness: 0.05,
      side: THREE.DoubleSide
    });

    // We make multiple thin layers of pages that open progressively
    const pagesLeft = [];
    const pagesRight = [];
    const pageCount = 6;

    for (let i = 0; i < pageCount; i++) {
      const pageGeom = new THREE.BoxGeometry(1.9, 0.015, 2.5);
      pageGeom.translate(-0.95, 0.02, 0);
      const pageL = new THREE.Mesh(pageGeom, pageMaterial);
      pageL.position.y = 0.04 + i * 0.012;
      bibleGroup.add(pageL);
      pagesLeft.push(pageL);

      const pageGeomR = new THREE.BoxGeometry(1.9, 0.015, 2.5);
      pageGeomR.translate(0.95, 0.02, 0);
      const pageR = new THREE.Mesh(pageGeomR, pageMaterial);
      pageR.position.y = 0.04 + i * 0.012;
      bibleGroup.add(pageR);
      pagesRight.push(pageR);
    }

    // ----------------------------------------------------
    // Build Volumetric Light Rays (Cylinder with gradient)
    // ----------------------------------------------------
    const rayGeom = new THREE.CylinderGeometry(0.3, 1.8, 6, 32, 1, true);
    rayGeom.translate(0, 3, 0);
    const rayMaterial = new THREE.MeshBasicMaterial({
      color: 0x00d6ff,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide
    });
    const lightRay = new THREE.Mesh(rayGeom, rayMaterial);
    lightRay.position.set(0, -1, 0);
    scene.add(lightRay);

    // ----------------------------------------------------
    // Build Particle Embers (Floating holy dust)
    // ----------------------------------------------------
    const particleCount = 70;
    const particleGeom = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const speeds = [];

    for (let i = 0; i < particleCount; i++) {
      // Circle distribution over book center
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 1.2;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = Math.random() * 4 - 1; // vertical spread
      positions[i * 3 + 2] = Math.sin(angle) * radius;

      speeds.push({
        y: 0.01 + Math.random() * 0.02,
        wobble: Math.random() * 0.02,
        phase: Math.random() * Math.PI * 2
      });
    }

    particleGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Custom particle material (circular glowing embers)
    const particleMaterial = new THREE.PointsMaterial({
      color: 0x00d6ff,
      size: 0.12,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const embers = new THREE.Points(particleGeom, particleMaterial);
    scene.add(embers);

    // ----------------------------------------------------
    // Build Metallic Shield Model
    // ----------------------------------------------------
    const shieldShape = new THREE.Shape();
    shieldShape.moveTo(0, 1.2);
    shieldShape.quadraticCurveTo(0.6, 1.2, 0.95, 1.4);
    shieldShape.quadraticCurveTo(1.0, 0.3, 0.9, -0.2);
    shieldShape.quadraticCurveTo(0.5, -1.0, 0, -1.5);
    shieldShape.quadraticCurveTo(-0.5, -1.0, -0.9, -0.2);
    shieldShape.quadraticCurveTo(-1.0, 0.3, -0.95, 1.4);
    shieldShape.quadraticCurveTo(-0.6, 1.2, 0, 1.2);

    const extrudeSettings = {
      depth: 0.18,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 1,
      bevelSize: 0.04,
      bevelThickness: 0.04
    };

    const shieldGeom = new THREE.ExtrudeGeometry(shieldShape, extrudeSettings);
    shieldGeom.center();

    const shieldMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a45a6,
      roughness: 0.15,
      metalness: 0.9,
      bumpScale: 0.05
    });

    const shield = new THREE.Mesh(shieldGeom, shieldMaterial);
    shield.position.set(0, 5, 0); // Starts high to descend
    shield.scale.set(0, 0, 0);
    scene.add(shield);

    // ----------------------------------------------------
    // Build Emissive Red Cross
    // ----------------------------------------------------
    const crossGroup = new THREE.Group();

    const crossMat = new THREE.MeshStandardMaterial({
      color: 0xff0000,
      emissive: 0xff0000,
      emissiveIntensity: 3,
      roughness: 0.2,
      metalness: 0.5
    });

    // Vertical bar
    const vBar = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.2, 0.15), crossMat);
    vBar.position.y = 0.1;
    // Horizontal bar
    const hBar = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.2, 0.15), crossMat);
    hBar.position.y = 0.35;

    crossGroup.add(vBar);
    crossGroup.add(hBar);
    crossGroup.position.set(0, 1.3, 0.15); // Place it slightly in front of the shield center
    crossGroup.scale.set(0, 0, 0);
    shield.add(crossGroup); // Attach to shield so it moves and rotates together

    // ----------------------------------------------------
    // Build Ring Letters (C & LE boundary)
    // ----------------------------------------------------
    const lettersGroup = new THREE.Group();
    lettersGroup.position.set(0, 1.2, 0);
    scene.add(lettersGroup);

    // Left Ring Segment (C)
    const ringCGeom = new THREE.TorusGeometry(1.6, 0.07, 12, 48, Math.PI * 1.2);
    const blueMetalMat = new THREE.MeshStandardMaterial({
      color: 0x0050ff,
      roughness: 0.2,
      metalness: 0.9
    });
    const ringC = new THREE.Mesh(ringCGeom, blueMetalMat);
    ringC.rotation.z = Math.PI * 0.4; // align it like a C
    lettersGroup.add(ringC);

    // Right Ring Segment (LE)
    const ringLEGeom = new THREE.TorusGeometry(1.6, 0.07, 12, 48, Math.PI * 1.0);
    const cyanMetalMat = new THREE.MeshStandardMaterial({
      color: 0x00d6ff,
      roughness: 0.2,
      metalness: 0.9
    });
    const ringLE = new THREE.Mesh(ringLEGeom, cyanMetalMat);
    ringLE.rotation.z = Math.PI * 1.5; // align it on the right
    lettersGroup.add(ringLE);

    // Hide letters originally
    lettersGroup.scale.set(0, 0, 0);
    lettersGroup.rotation.y = -Math.PI;

    // ----------------------------------------------------
    // Mouse Interaction Parallax State
    // ----------------------------------------------------
    let mouseX = 0;
    let mouseY = 0;
    const targetCameraRotation = { x: 0.8, y: 0 };
    const currentCameraRotation = { x: 0.8, y: 0 };

    const handleMouseMove = (e) => {
      mouseX = (e.clientX / window.innerWidth) - 0.5;
      mouseY = (e.clientY / window.innerHeight) - 0.5;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // ----------------------------------------------------
    // Animation Sequencer (Timeline ticks)
    // ----------------------------------------------------
    const clock = new THREE.Timer();
    clock.connect(document);

    const animate = () => {
      if (!renderer.domElement) return; // check if cleaned up
      requestAnimationFrame(animate);

      clock.update();
const elapsedTime = clock.getElapsed();

      // Mouse Parallax interpolation
      targetCameraRotation.y = -mouseX * 0.5;
      targetCameraRotation.x = 3 - mouseY * 0.3; // base elevation (3) modified by mouse Y

      camera.position.x += (Math.sin(targetCameraRotation.y) * 10 - camera.position.x) * 0.05;
      camera.position.z += (Math.cos(targetCameraRotation.y) * 10 - camera.position.z) * 0.05;
      camera.position.y += (targetCameraRotation.x - camera.position.y) * 0.05;
      camera.lookAt(0, 1.0, 0);

      // Sequenced Animations
      // 1. Bible Opens (Time: 0s to 3s)
      const tOpen = Math.min(elapsedTime / 3.0, 1.0);

      // Cover rotates open
      coverLeft.rotation.z = -tOpen * Math.PI * 0.92;
      coverRight.rotation.z = tOpen * Math.PI * 0.92;

      // Pages fan open
      pagesLeft.forEach((p, idx) => {
        const factor = (idx + 1) / pageCount;
        p.rotation.z = -tOpen * Math.PI * 0.9 * factor;
      });
      pagesRight.forEach((p, idx) => {
        const factor = (idx + 1) / pageCount;
        p.rotation.z = tOpen * Math.PI * 0.9 * factor;
      });

      // 2. Rays and Embers Rise (Time: 2s to 5s)
      if (elapsedTime > 2.0) {
        const tRays = Math.min((elapsedTime - 2.0) / 3.0, 1.0);
        rayMaterial.opacity = tRays * 0.45;
        particleMaterial.opacity = tRays * 0.9;
      }

      // Animate embers rising constantly
      const posAttr = embers.geometry.attributes.position;
      if (posAttr) {
        for (let i = 0; i < particleCount; i++) {
          let y = posAttr.getY(i);
          y += speeds[i].y;

          // Add gentle horizontal wobble
          const x = posAttr.getX(i) + Math.sin(elapsedTime * 2 + speeds[i].phase) * speeds[i].wobble;
          const z = posAttr.getZ(i) + Math.cos(elapsedTime * 2 + speeds[i].phase) * speeds[i].wobble;

          // Reset when high
          if (y > 4.5) {
            y = -0.5;
          }
          posAttr.setY(i, y);
          posAttr.setX(i, x);
          posAttr.setZ(i, z);
        }
        posAttr.needsUpdate = true;
      }

      // Rotate light ray mesh slightly for spiritual dynamics
      lightRay.rotation.y = elapsedTime * 0.15;

      // 3. Shield Ascends & Materializes (Time: 4.5s to 7s)
      if (elapsedTime > 4.5) {
        const tShield = Math.min((elapsedTime - 4.5) / 2.5, 1.0);
        // Descends from Y:5 to Y:1.2, scales from 0 to 0.75
        shield.position.y = 5 - (tShield * 3.8);
        const s = tShield * 0.72;
        shield.scale.set(s, s, s);
        shield.rotation.y = (1.0 - tShield) * Math.PI * 2 + (elapsedTime * 0.3); // Spin as it lands
      } else {
        shield.scale.set(0, 0, 0);
      }

      // 4. Glowing Red Cross Fades & Extrudes In (Time: 6.5s to 8.5s)
      if (elapsedTime > 6.5) {
        const tCross = Math.min((elapsedTime - 6.5) / 2.0, 1.0);
        const cs = tCross * 1.0;
        crossGroup.scale.set(cs, cs, cs);
        crossMat.emissiveIntensity = 2.0 + Math.sin(elapsedTime * 3) * 0.8; // Pulsing energy
      }

      // 5. Letter Rings Assemble & Circle Round (Time: 8.0s to 10.5s)
      if (elapsedTime > 8.0) {
        const tLetters = Math.min((elapsedTime - 8.0) / 2.5, 1.0);
        lettersGroup.scale.set(tLetters, tLetters, tLetters);
        lettersGroup.rotation.y = (1.0 - tLetters) * -Math.PI + (elapsedTime * 0.1);
      }

      // Slowly rotate the entire shield and letter setup as a unit
      if (elapsedTime > 10.5) {
        lettersGroup.rotation.y = (elapsedTime * 0.15);
        shield.rotation.y = (elapsedTime * 0.15);
      }

      // Calculate progress indicator
      const totalProgress = Math.min((elapsedTime / 11.0) * 100, 100);
      setAssemblyProgress(Math.floor(totalProgress));

      renderer.render(scene, camera);
    };
   animate();
    // Elastic ease helper
    function tRaysInterp(t) {
      return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    }

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
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      scene.clear();
      renderer.dispose();
    };
  }, []);

  return (
    <div className="canvas-container">
      {webGlSupported ? (
        <div ref={mountRef} className="three-canvas" />
      ) : (
        /* Cinematic SVG/CSS Fallback for browsers without WebGL */
        <div className="svg-fallback-container">
          <div className="bible-fallback">
            <div className="book-spine"></div>
            <div className="page left-page"></div>
            <div className="page right-page"></div>
          </div>

          <div className="ray-fallback"></div>

          <div className="logo-fallback-assembly">
            <svg viewBox="0 0 200 200" className="fallback-svg-logo">
              <defs>
                <linearGradient id="shieldGradF" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0050FF" />
                  <stop offset="100%" stopColor="#001860" />
                </linearGradient>
                <linearGradient id="crossGradF" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FF3B30" />
                  <stop offset="100%" stopColor="#8B0000" />
                </linearGradient>
                <filter id="glowF">
                  <feGaussianBlur stdDeviation="5" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Rings assembly */}
              <circle cx="100" cy="100" r="90" fill="none" stroke="#00D6FF" strokeWidth="2" opacity="0.3" strokeDasharray="8,4" className="f-ring-dotted" />
              <path d="M 50 40 A 80 80 0 1 0 100 180" fill="none" stroke="#0050FF" strokeWidth="6" strokeLinecap="round" filter="url(#glowF)" className="f-ring-left" />
              <path d="M 100 20 A 80 80 0 0 1 150 160" fill="none" stroke="#00D6FF" strokeWidth="4" strokeLinecap="round" opacity="0.8" className="f-ring-right" />

              {/* Shield */}
              <path d="M 100 45 C 125 45, 145 40, 150 55 C 150 100, 125 135, 100 155 C 75 135, 50 100, 50 55 C 55 40, 75 45, 100 45 Z" fill="url(#shieldGradF)" stroke="#FFFFFF" strokeWidth="2" className="f-shield" />

              {/* Cross */}
              <rect x="93" y="60" width="14" height="75" rx="2" fill="url(#crossGradF)" stroke="#FF8A80" strokeWidth="0.5" className="f-cross" />
              <rect x="76" y="78" width="48" height="14" rx="2" fill="url(#crossGradF)" stroke="#FF8A80" strokeWidth="0.5" className="f-cross" />
            </svg>
          </div>
          <div className="embers-fallback-container">
            <div className="ember eb-1"></div>
            <div className="ember eb-2"></div>
            <div className="ember eb-3"></div>
            <div className="ember eb-4"></div>
            <div className="ember eb-5"></div>
          </div>
        </div>
      )}

      {/* Assembly Progress HUD Overlay */}
      <div className="assembly-hud">
        <span className="hud-line"></span>
        <span className="hud-text">WebGL SYNAPSE: {assemblyProgress}% ASSEMBLED</span>
      </div>

      <style>{`
        .canvas-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 1;
          overflow: hidden;
          background: radial-gradient(circle at center, #0a0a0f 0%, #030305 100%);
        }

        .three-canvas {
          width: 100%;
          height: 100%;
        }

        .assembly-hud {
          position: absolute;
          bottom: 30px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          gap: 12px;
          font-family: var(--font-heading);
          font-size: 11px;
          color: rgba(255, 255, 255, 0.4);
          letter-spacing: 0.25em;
          pointer-events: none;
          z-index: 5;
        }

        .hud-line {
          width: 20px;
          height: 1px;
          background: var(--accent-cyan);
          box-shadow: 0 0 6px var(--accent-cyan);
        }

        /* Fallback CSS 3D Styles */
        .svg-fallback-container {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .bible-fallback {
          position: absolute;
          bottom: 15%;
          width: 160px;
          height: 110px;
          perspective: 600px;
          opacity: 0.9;
        }

        .book-spine {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          width: 6px;
          height: 100%;
          background: #111;
          z-index: 10;
        }

        .page {
          position: absolute;
          top: 0;
          width: 80px;
          height: 100%;
          background: #fffee8;
          border: 2px solid #002080;
          box-shadow: 0 8px 16px rgba(0,0,0,0.5);
          transition: transform 3s ease;
        }

        .left-page {
          left: 0;
          border-radius: 4px 0 0 4px;
          transform-origin: right center;
          animation: openLeftPage 3s forwards cubic-bezier(0.16, 1, 0.3, 1);
        }

        .right-page {
          right: 0;
          border-radius: 0 4px 4px 0;
          transform-origin: left center;
          animation: openRightPage 3s forwards cubic-bezier(0.16, 1, 0.3, 1);
        }

        .ray-fallback {
          position: absolute;
          bottom: 15%;
          width: 120px;
          height: 250px;
          background: linear-gradient(to top, rgba(0, 214, 255, 0.45) 0%, rgba(0, 80, 255, 0.05) 75%, transparent 100%);
          clip-path: polygon(30% 0%, 70% 0%, 100% 100%, 0% 100%);
          filter: blur(10px);
          opacity: 0;
          animation: revealRay 3s forwards ease-out 1s;
        }

        .logo-fallback-assembly {
          width: 220px;
          height: 220px;
          position: relative;
          z-index: 3;
          margin-bottom: 40px;
        }

        .fallback-svg-logo {
          width: 100%;
          height: 100%;
          filter: drop-shadow(0 10px 20px rgba(0,0,0,0.7));
        }

        /* SVG Fallback animation keyframes */
        .f-ring-dotted {
          transform-origin: center;
          animation: rotateClockwise 20s linear infinite;
        }

        .f-ring-left {
          stroke-dasharray: 400;
          stroke-dashoffset: 400;
          animation: drawStroke 3s forwards ease-in-out 7s;
        }

        .f-ring-right {
          stroke-dasharray: 300;
          stroke-dashoffset: 300;
          animation: drawStroke 3s forwards ease-in-out 7.5s;
        }

        .f-shield {
          transform: scale(0);
          transform-origin: 100px 100px;
          animation: scaleUpShield 2.5s forwards cubic-bezier(0.175, 0.885, 0.32, 1.275) 4s;
        }

        .f-cross {
          transform: scale(0);
          transform-origin: 100px 95px;
          animation: scaleUpCross 2s forwards ease-out 6s;
        }

        /* Fallback Embers */
        .embers-fallback-container {
          position: absolute;
          bottom: 15%;
          width: 140px;
          height: 200px;
          pointer-events: none;
        }

        .ember {
          position: absolute;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #00d6ff;
          box-shadow: 0 0 8px #00d6ff;
          opacity: 0;
          bottom: 0;
        }

        .eb-1 { left: 20%; animation: floatEmbers 6s infinite ease-in-out; }
        .eb-2 { left: 40%; animation: floatEmbers 5s infinite ease-in-out 1.2s; width: 4px; height: 4px; }
        .eb-3 { left: 60%; animation: floatEmbers 7s infinite ease-in-out 0.5s; }
        .eb-4 { left: 80%; animation: floatEmbers 4s infinite ease-in-out 2s; width: 5px; height: 5px; }
        .eb-5 { left: 50%; animation: floatEmbers 8s infinite ease-in-out 3s; }

        @keyframes openLeftPage {
          0% { transform: rotateY(0deg); }
          100% { transform: rotateY(-175deg); }
        }

        @keyframes openRightPage {
          0% { transform: rotateY(0deg); }
          100% { transform: rotateY(175deg); }
        }

        @keyframes revealRay {
          0% { opacity: 0; transform: scaleY(0); }
          100% { opacity: 0.8; transform: scaleY(1); }
        }

        @keyframes scaleUpShield {
          0% { transform: scale(0) rotate(-45deg); opacity: 0; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }

        @keyframes scaleUpCross {
          0% { transform: scale(0); filter: brightness(1); }
          100% { transform: scale(1); filter: brightness(1.5); }
        }

        @keyframes drawStroke {
          to { stroke-dashoffset: 0; }
        }

        @keyframes rotateClockwise {
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
