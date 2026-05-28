import React, { useEffect, useRef } from 'react';

export default function JungleScene() {
  const ffGroupRef = useRef(null);
  const ffliesRef  = useRef([]);
  const rafRef     = useRef(null);

  useEffect(() => {
    const group = ffGroupRef.current;
    if (!group) return;

    const svgNS = 'http://www.w3.org/2000/svg';
    const fflies = [];

    for (let i = 0; i < 35; i++) {
      const c = document.createElementNS(svgNS, 'circle');
      const x = 250 + Math.random() * 780;
      const y = 100 + Math.random() * 420;
      c.setAttribute('cx', x);
      c.setAttribute('cy', y);
      c.setAttribute('r', 1.5 + Math.random() * 1.5);
      c.setAttribute('fill', '#b0ff60');
      c.setAttribute('opacity', '0');
      group.appendChild(c);
      fflies.push({
        el: c, x, y,
        vx: (Math.random() - 0.5) * 0.5,
        vy: -(0.15 + Math.random() * 0.4),
        phase: Math.random() * Math.PI * 2,
        speed: 0.008 + Math.random() * 0.015,
      });
    }
    ffliesRef.current = fflies;

    function animFF() {
      fflies.forEach(f => {
        f.phase += f.speed;
        const alpha = Math.max(0, Math.sin(f.phase) * 0.75);
        f.x += f.vx;
        f.y += f.vy;
        if (f.y < 80 || f.x < 220 || f.x > 1060) {
          f.x = 250 + Math.random() * 780;
          f.y = 400 + Math.random() * 200;
          f.phase = 0;
        }
        f.el.setAttribute('cx', f.x);
        f.el.setAttribute('cy', f.y);
        f.el.setAttribute('opacity', alpha);
      });
      rafRef.current = requestAnimationFrame(animFF);
    }
    rafRef.current = requestAnimationFrame(animFF);

    return () => {
      cancelAnimationFrame(rafRef.current);
      while (group.firstChild) group.removeChild(group.firstChild);
    };
  }, []);

  return (
    <svg
      style={{ position: 'fixed', inset: 0, zIndex: 0 }}
      viewBox="0 0 1280 720"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="skyGrad" cx="50%" cy="60%" r="70%">
          <stop offset="0%"   stopColor="#0d2a10"/>
          <stop offset="60%"  stopColor="#071408"/>
          <stop offset="100%" stopColor="#020805"/>
        </radialGradient>
        <radialGradient id="pathLight" cx="50%" cy="100%" r="60%">
          <stop offset="0%"   stopColor="#2a5a18" stopOpacity="0.35"/>
          <stop offset="100%" stopColor="#0a1a08" stopOpacity="0"/>
        </radialGradient>
        <radialGradient id="godRay" cx="50%" cy="0%" r="80%">
          <stop offset="0%"   stopColor="#8acc40" stopOpacity="0.07"/>
          <stop offset="100%" stopColor="#0a1a08" stopOpacity="0"/>
        </radialGradient>
        <filter id="blur2"><feGaussianBlur stdDeviation="2"/></filter>
        <filter id="blur5"><feGaussianBlur stdDeviation="5"/></filter>
        <filter id="blur10"><feGaussianBlur stdDeviation="10"/></filter>
        <filter id="blur20"><feGaussianBlur stdDeviation="20"/></filter>
        <linearGradient id="fogGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor="#0a2010" stopOpacity="0.85"/>
          <stop offset="100%" stopColor="#0a2010" stopOpacity="0"/>
        </linearGradient>
        <radialGradient id="vig" cx="50%" cy="50%" r="70%">
          <stop offset="0%"   stopColor="black" stopOpacity="0"/>
          <stop offset="100%" stopColor="black" stopOpacity="0.65"/>
        </radialGradient>
        <clipPath id="sceneClip"><rect width="1280" height="720"/></clipPath>
      </defs>

      <g clipPath="url(#sceneClip)">
        <rect width="1280" height="720" fill="url(#skyGrad)"/>
        <ellipse cx="640" cy="200" rx="500" ry="180" fill="#0d2a10" filter="url(#blur20)" opacity="0.8"/>
        <ellipse cx="640" cy="160" rx="300" ry="100" fill="#142a0c" filter="url(#blur10)" opacity="0.6"/>

        <polygon points="580,0 660,0 720,400 540,400" fill="url(#godRay)" opacity="0.5"/>
        <polygon points="600,0 640,0 680,350 560,350" fill="url(#godRay)" opacity="0.4"/>
        <polygon points="540,0 580,0 560,500 500,500" fill="url(#godRay)" opacity="0.2"/>
        <polygon points="660,0 720,0 760,500 700,500" fill="url(#godRay)" opacity="0.2"/>

        <g opacity="0.3" filter="url(#blur5)">
          <ellipse cx="100" cy="280" rx="90" ry="140" fill="#071208"/>
          <ellipse cx="200" cy="250" rx="110" ry="160" fill="#081508"/>
          <ellipse cx="50"  cy="310" rx="70"  ry="100" fill="#060f06"/>
          <ellipse cx="300" cy="260" rx="90"  ry="130" fill="#071208"/>
          <ellipse cx="1180" cy="280" rx="90"  ry="140" fill="#071208"/>
          <ellipse cx="1080" cy="250" rx="110" ry="160" fill="#081508"/>
          <ellipse cx="1230" cy="310" rx="70"  ry="100" fill="#060f06"/>
          <ellipse cx="980"  cy="260" rx="90"  ry="130" fill="#071208"/>
        </g>

        <g opacity="0.55" filter="url(#blur2)">
          <rect x="-10"  y="280" width="22" height="300" fill="#060e06"/>
          <ellipse cx="0"   cy="270" rx="75" ry="110" fill="#091a09"/>
          <ellipse cx="40"  cy="240" rx="90" ry="120" fill="#0a1e0a"/>
          <rect x="180" y="300" width="18" height="280" fill="#060e06"/>
          <ellipse cx="190" cy="290" rx="70" ry="100" fill="#091a09"/>
          <ellipse cx="230" cy="265" rx="80" ry="110" fill="#0b2008"/>
          <rect x="1268" y="280" width="22" height="300" fill="#060e06"/>
          <ellipse cx="1280" cy="270" rx="75" ry="110" fill="#091a09"/>
          <ellipse cx="1240" cy="240" rx="90" ry="120" fill="#0a1e0a"/>
          <rect x="1100" y="300" width="18" height="280" fill="#060e06"/>
          <ellipse cx="1090" cy="290" rx="70" ry="100" fill="#091a09"/>
          <ellipse cx="1050" cy="265" rx="80" ry="110" fill="#0b2008"/>
        </g>

        <polygon points="480,720 800,720 700,380 580,380" fill="#0e1e0a" opacity="0.9"/>
        <polygon points="490,720 790,720 695,390 585,390" fill="#121f0c" opacity="0.7"/>
        <polygon points="590,720 690,720 655,420 625,420" fill="#182808" opacity="0.5"/>
        <rect x="0"   y="500" width="500"  height="220" fill="#060e06"/>
        <rect x="780" y="500" width="500"  height="220" fill="#060e06"/>
        <rect x="0"   y="380" width="500"  height="140" fill="#080f08" opacity="0.8"/>
        <rect x="780" y="380" width="500"  height="140" fill="#080f08" opacity="0.8"/>
        <polygon points="500,720 780,720 690,380 590,380" fill="url(#pathLight)" opacity="0.8"/>

        {/* Left close tree */}
        <g>
          <rect x="-30" y="350" width="35" height="380" fill="#050c05" rx="4"/>
          <ellipse cx="30"  cy="330" rx="130" ry="110" fill="#0b2008"/>
          <ellipse cx="0"   cy="300" rx="110" ry="95"  fill="#0d2409"/>
          <ellipse cx="60"  cy="280" rx="100" ry="85"  fill="#0e280a"/>
          <ellipse cx="-20" cy="260" rx="90"  ry="75"  fill="#102c0a"/>
          <ellipse cx="50"  cy="265" rx="80"  ry="60"  fill="#132e0b" opacity="0.6"/>
          <ellipse cx="80"  cy="260" rx="60"  ry="45"  fill="#1a3e0e" opacity="0.3" filter="url(#blur2)"/>
        </g>
        <path d="M120,0 Q90,200 110,400 Q130,500 100,720" fill="none" stroke="#0d2008" strokeWidth="5" opacity="0.7"/>
        <path d="M140,0 Q110,150 130,320 Q150,450 120,720" fill="none" stroke="#0d2008" strokeWidth="3" opacity="0.4"/>
        <ellipse cx="115" cy="180" rx="22" ry="12" fill="#102808" transform="rotate(-20 115 180)" opacity="0.8"/>
        <ellipse cx="108" cy="290" rx="18" ry="10" fill="#0f2606" transform="rotate(15 108 290)"  opacity="0.7"/>
        <ellipse cx="122" cy="380" rx="20" ry="11" fill="#112a08" transform="rotate(-10 122 380)" opacity="0.6"/>

        {/* Right close tree */}
        <g>
          <rect x="1275" y="350" width="35" height="380" fill="#050c05" rx="4"/>
          <ellipse cx="1250" cy="330" rx="130" ry="110" fill="#0b2008"/>
          <ellipse cx="1280" cy="300" rx="110" ry="95"  fill="#0d2409"/>
          <ellipse cx="1220" cy="280" rx="100" ry="85"  fill="#0e280a"/>
          <ellipse cx="1300" cy="260" rx="90"  ry="75"  fill="#102c0a"/>
          <ellipse cx="1230" cy="265" rx="80"  ry="60"  fill="#132e0b" opacity="0.6"/>
          <ellipse cx="1200" cy="260" rx="60"  ry="45"  fill="#1a3e0e" opacity="0.3" filter="url(#blur2)"/>
        </g>
        <path d="M1160,0 Q1190,200 1170,400 Q1150,500 1180,720" fill="none" stroke="#0d2008" strokeWidth="5" opacity="0.7"/>
        <path d="M1140,0 Q1170,150 1150,320 Q1130,450 1160,720" fill="none" stroke="#0d2008" strokeWidth="3" opacity="0.4"/>
        <ellipse cx="1165" cy="180" rx="22" ry="12" fill="#102808" transform="rotate(20 1165 180)"  opacity="0.8"/>
        <ellipse cx="1172" cy="290" rx="18" ry="10" fill="#0f2606" transform="rotate(-15 1172 290)" opacity="0.7"/>
        <ellipse cx="1158" cy="380" rx="20" ry="11" fill="#112a08" transform="rotate(10 1158 380)"  opacity="0.6"/>

        <ellipse cx="350" cy="560" rx="120" ry="40" fill="#081408" opacity="0.7"/>
        <ellipse cx="200" cy="620" rx="140" ry="45" fill="#091608" opacity="0.6"/>
        <ellipse cx="930"  cy="560" rx="120" ry="40" fill="#081408" opacity="0.7"/>
        <ellipse cx="1080" cy="620" rx="140" ry="45" fill="#091608" opacity="0.6"/>

        <ellipse cx="400" cy="0"  rx="350" ry="200" fill="#081808" opacity="0.9"/>
        <ellipse cx="880" cy="0"  rx="350" ry="200" fill="#081808" opacity="0.9"/>
        <ellipse cx="200" cy="-30" rx="250" ry="180" fill="#060e06" opacity="0.8"/>
        <ellipse cx="1080" cy="-30" rx="250" ry="180" fill="#060e06" opacity="0.8"/>

        <rect x="400" y="350" width="480" height="80" fill="#0a2010" opacity="0.6" filter="url(#blur10)"/>
        <rect x="0" y="620" width="1280" height="100" fill="#081808" opacity="0.5" filter="url(#blur5)"/>

        <ellipse cx="620" cy="480" rx="30" ry="12" fill="#1a4010" opacity="0.35" filter="url(#blur2)"/>
        <ellipse cx="660" cy="530" rx="25" ry="10" fill="#1a4010" opacity="0.3"  filter="url(#blur2)"/>

        <g ref={ffGroupRef} />

        <rect width="1280" height="720" fill="url(#vig)"/>
      </g>
    </svg>
  );
}
