/* =====================================================
   VOID.DEV — Main JavaScript
   Sections:
     01. Custom Cursor
     02. Loading Screen
     03. Typewriter Effect
     04. Grid Background Canvas
     05. 3D Particle Orb Canvas
     06. Scroll Reveal (IntersectionObserver)
     07. Mouse Parallax
     08. Project Card 3D Tilt
===================================================== */


/* ─────────────────────────────────────────────────
   01. CUSTOM CURSOR
   Three-layer system:
   - cDot  : snaps immediately to mouse position
   - cRing : lags behind with spring lerp (0.14)
   - cGlow : drifts slowly behind (0.07)
───────────────────────────────────────────────── */
const cDot  = document.getElementById('cDot');
const cRing = document.getElementById('cRing');
const cGlow = document.getElementById('cGlow');

let mx = 0, my = 0;   // raw mouse position
let rx = 0, ry = 0;   // ring  interpolated position
let gx = 0, gy = 0;   // glow  interpolated position

// Snap dot directly to cursor
document.addEventListener('mousemove', (e) => {
  mx = e.clientX;
  my = e.clientY;
  cDot.style.left = `${mx}px`;
  cDot.style.top  = `${my}px`;
});

// Lerp ring and glow on rAF loop
(function animateCursor() {
  rx += (mx - rx) * 0.14;
  ry += (my - ry) * 0.14;
  gx += (mx - gx) * 0.07;
  gy += (my - gy) * 0.07;

  cRing.style.left = `${rx}px`;
  cRing.style.top  = `${ry}px`;
  cGlow.style.left = `${gx}px`;
  cGlow.style.top  = `${gy}px`;

  requestAnimationFrame(animateCursor);
})();

// Expand cursor on interactive elements
document.querySelectorAll('a, button, .proj-card, .sc').forEach((el) => {
  el.addEventListener('mouseenter', () => document.body.classList.add('hov'));
  el.addEventListener('mouseleave', () => document.body.classList.remove('hov'));
});


/* ─────────────────────────────────────────────────
   02. LOADING SCREEN
   Increments progress, updates bar + counter,
   cycles status messages, then fades out and
   reveals hero content with staggered delays.
───────────────────────────────────────────────── */
const ldBar = document.getElementById('ldBar');
const ldNum = document.getElementById('ldNum');
const ldSt  = document.getElementById('ldSt');

const loaderMessages = [
  'initializing systems...',
  'loading assets...',
  'rendering shaders...',
  'building interface...',
  'launching...',
];

let progress  = 0;
let msgIndex  = 0;

const loaderInterval = setInterval(() => {
  // Increment by a random amount for organic feel
  progress += Math.random() * 3.5 + 1;
  if (progress > 100) progress = 100;

  // Update bar and number display
  ldBar.style.width     = `${progress}%`;
  ldNum.textContent     = String(Math.floor(progress)).padStart(3, '0');

  // Cycle through status messages
  const newMsgIndex = Math.floor(progress / 22);
  if (newMsgIndex !== msgIndex && loaderMessages[newMsgIndex]) {
    msgIndex = newMsgIndex;
    ldSt.textContent = loaderMessages[newMsgIndex];
  }

  // Loading complete
  if (progress >= 100) {
    clearInterval(loaderInterval);

    setTimeout(() => {
      const loader = document.getElementById('loader');
      loader.style.transition = 'opacity 0.9s ease';
      loader.style.opacity    = '0';

      setTimeout(() => {
        loader.style.display = 'none';

        // Slide nav down
        document.getElementById('main-nav').classList.add('show');

        // Stagger hero element reveals
        setTimeout(() => {
          ['hTag', 'hName', 'hRole', 'hDesc', 'hCta', 'hOrb'].forEach((id) => {
            document.getElementById(id).classList.add('on');
          });
          startTypewriter();
        }, 120);

      }, 900);
    }, 400);
  }

}, 48);


/* ─────────────────────────────────────────────────
   03. TYPEWRITER EFFECT
   Cycles through an array of role strings with
   natural typing/deleting speed variation.
───────────────────────────────────────────────── */
const ROLES = [
  'Full-Stack Developer',
  'Python Enthusiast',
  'Creative Technologist',
  'Artificial Intelligence Explorer',
];

let roleIndex  = 0;
let charIndex  = 0;
let isDeleting = false;

const typedEl = document.getElementById('typedTxt');

function startTypewriter() {
  const currentRole = ROLES[roleIndex];

  if (!isDeleting) {
    // Typing forward
    charIndex++;
    typedEl.textContent = currentRole.slice(0, charIndex);
    if (charIndex === currentRole.length) {
      isDeleting = true;
      setTimeout(startTypewriter, 1900); // Pause before deleting
      return;
    }
  } else {
    // Deleting
    charIndex--;
    typedEl.textContent = currentRole.slice(0, charIndex);
    if (charIndex === 0) {
      isDeleting = false;
      roleIndex  = (roleIndex + 1) % ROLES.length;
    }
  }

  // Deleting is faster than typing
  setTimeout(startTypewriter, isDeleting ? 42 : 78);
}


/* ─────────────────────────────────────────────────
   04. GRID BACKGROUND CANVAS
   Draws a cyan circuit-board dot-grid that
   covers the entire viewport, fixed behind all
   content. Re-drawn on window resize.
───────────────────────────────────────────────── */
const gridCanvas = document.getElementById('bg-canvas');
const gCtx       = gridCanvas.getContext('2d');

function resizeGridCanvas() {
  gridCanvas.width  = window.innerWidth;
  gridCanvas.height = window.innerHeight;
  drawGrid();
}

function drawGrid() {
  gCtx.clearRect(0, 0, gridCanvas.width, gridCanvas.height);

  const STEP = 65;

  // Vertical & horizontal lines
  gCtx.strokeStyle = 'rgba(0, 229, 255, 0.065)';
  gCtx.lineWidth   = 0.5;

  for (let x = 0; x <= gridCanvas.width; x += STEP) {
    gCtx.beginPath();
    gCtx.moveTo(x, 0);
    gCtx.lineTo(x, gridCanvas.height);
    gCtx.stroke();
  }

  for (let y = 0; y <= gridCanvas.height; y += STEP) {
    gCtx.beginPath();
    gCtx.moveTo(0, y);
    gCtx.lineTo(gridCanvas.width, y);
    gCtx.stroke();
  }

  // Intersection dots
  gCtx.fillStyle = 'rgba(0, 229, 255, 0.2)';
  for (let x = 0; x <= gridCanvas.width; x += STEP) {
    for (let y = 0; y <= gridCanvas.height; y += STEP) {
      gCtx.beginPath();
      gCtx.arc(x, y, 1, 0, Math.PI * 2);
      gCtx.fill();
    }
  }
}

resizeGridCanvas();
window.addEventListener('resize', resizeGridCanvas);


/* ─────────────────────────────────────────────────
   05. 3D PARTICLE ORB CANVAS
   Pure Canvas 2D — no libraries.
   Generates 260 particles on a sphere surface,
   rotates on Y-axis via manual matrix math,
   sorts by depth (painter's algorithm),
   and draws two orbiting ellipse rings.
───────────────────────────────────────────────── */
const orbCanvas = document.getElementById('orb-canvas');
const oCtx      = orbCanvas.getContext('2d');

orbCanvas.width  = 480;
orbCanvas.height = 480;

const ORB_CX = 240;
const ORB_CY = 240;

// Generate random particles on sphere surface
const particles = [];
for (let i = 0; i < 260; i++) {
  const theta = Math.random() * Math.PI * 2;
  const phi   = Math.acos(2 * Math.random() - 1);
  const r     = 155 + Math.random() * 28;

  particles.push({
    ox: r * Math.sin(phi) * Math.cos(theta),
    oy: r * Math.sin(phi) * Math.sin(theta),
    oz: r * Math.cos(phi),
    sz: Math.random() * 2 + 0.4,
  });
}

let orbAngle = 0;

(function drawOrb() {
  oCtx.clearRect(0, 0, 480, 480);
  orbAngle += 0.0032;

  const cosA = Math.cos(orbAngle);
  const sinA = Math.sin(orbAngle);

  // Ambient centre glow
  const ambientGrad = oCtx.createRadialGradient(ORB_CX, ORB_CY, 0, ORB_CX, ORB_CY, 200);
  ambientGrad.addColorStop(0,   'rgba(0, 229, 255, 0.05)');
  ambientGrad.addColorStop(0.5, 'rgba(170, 0, 255, 0.03)');
  ambientGrad.addColorStop(1,   'transparent');
  oCtx.fillStyle = ambientGrad;
  oCtx.fillRect(0, 0, 480, 480);

  // Equator ring (rotates with angle)
  oCtx.strokeStyle = 'rgba(0, 229, 255, 0.22)';
  oCtx.lineWidth   = 1;
  oCtx.beginPath();
  oCtx.ellipse(ORB_CX, ORB_CY, 187, 60, orbAngle, 0, Math.PI * 2);
  oCtx.stroke();

  // Tilted second ring
  oCtx.strokeStyle = 'rgba(170, 0, 255, 0.18)';
  oCtx.lineWidth   = 0.8;
  oCtx.beginPath();
  oCtx.ellipse(ORB_CX, ORB_CY, 155, 155, orbAngle * 0.6, 0, Math.PI * 2);
  oCtx.stroke();

  // Static outer boundary circle
  oCtx.strokeStyle = 'rgba(0, 229, 255, 0.12)';
  oCtx.lineWidth   = 0.6;
  oCtx.beginPath();
  oCtx.arc(ORB_CX, ORB_CY, 188, 0, Math.PI * 2);
  oCtx.stroke();

  // Project particles using Y-axis rotation + perspective divide
  const projected = particles.map((p) => {
    const rotX = p.ox * cosA - p.oz * sinA;
    const rotZ = p.ox * sinA + p.oz * cosA;
    const rotY = p.oy;

    const z    = rotZ + 320;
    const proj = 380 / z;

    return {
      x: ORB_CX + rotX * proj,
      y: ORB_CY + rotY * proj,
      z: rotZ,
      sz: p.sz * proj,
      alpha: (rotZ + 180) / 360,
    };
  });

  // Painter's algorithm — back to front
  projected.sort((a, b) => a.z - b.z);

  projected.forEach((p) => {
    const alpha = Math.max(0, Math.min(1, p.alpha));
    oCtx.fillStyle = `rgba(0, 229, 255, ${alpha * 0.85})`;
    oCtx.beginPath();
    oCtx.arc(p.x, p.y, Math.max(0.3, p.sz * 0.75), 0, Math.PI * 2);
    oCtx.fill();
  });

  // Bright centre core
  const coreGrad = oCtx.createRadialGradient(ORB_CX, ORB_CY, 0, ORB_CX, ORB_CY, 18);
  coreGrad.addColorStop(0, 'rgba(0, 229, 255, 0.55)');
  coreGrad.addColorStop(1, 'transparent');
  oCtx.fillStyle = coreGrad;
  oCtx.beginPath();
  oCtx.arc(ORB_CX, ORB_CY, 18, 0, Math.PI * 2);
  oCtx.fill();

  requestAnimationFrame(drawOrb);
})();


/* ─────────────────────────────────────────────────
   06. SCROLL REVEAL — IntersectionObserver
   Watches all .rev and .rev-l elements.
   Adds .on class when they enter the viewport,
   with a staggered delay based on sibling index.
   Also triggers skill bar fill animations.
───────────────────────────────────────────────── */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      // Stagger siblings
      const siblings  = Array.from(entry.target.parentNode?.children || []);
      const sibIndex  = siblings.indexOf(entry.target);
      const delay     = sibIndex * 80;

      setTimeout(() => {
        entry.target.classList.add('on');

        // Animate any skill bars inside this element
        entry.target.querySelectorAll('.sk-fill').forEach((bar) => {
          setTimeout(() => {
            bar.style.width = `${bar.dataset.w}%`;
          }, 380);
        });
      }, delay);
    });
  },
  { threshold: 0.08, rootMargin: '0px 0px -50px 0px' }
);

document.querySelectorAll('.rev, .rev-l').forEach((el) => revealObserver.observe(el));


/* ─────────────────────────────────────────────────
   07. MOUSE PARALLAX
   Orb floats at ~0.9× cursor offset.
   Hero name drifts subtly at 0.08× for depth.
───────────────────────────────────────────────── */
document.addEventListener('mousemove', (e) => {
  const factorX = (e.clientX / window.innerWidth  - 0.5) * 22;
  const factorY = (e.clientY / window.innerHeight - 0.5) * 22;

  const orb      = document.getElementById('hOrb');
  const heroName = document.getElementById('hName');

  if (orb)      orb.style.transform      = `translateY(-50%) translate(${factorX * 0.9}px, ${factorY * 0.9}px)`;
  if (heroName) heroName.style.transform = `translate(${factorX * 0.08}px, ${factorY * 0.08}px)`;
});


/* ─────────────────────────────────────────────────
   08. PROJECT CARD 3D TILT
   CSS perspective tilt follows mouse position
   within each card. Resets on mouse leave.
───────────────────────────────────────────────── */
document.querySelectorAll('.proj-card').forEach((card) => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x    = ((e.clientX - rect.left) / rect.width  - 0.5) * 14;
    const y    = ((e.clientY - rect.top)  / rect.height - 0.5) * 14;

    card.style.transform = `perspective(600px) rotateX(${-y}deg) rotateY(${x}deg) translateZ(6px)`;
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});

//Bramhand Ko Kone me krne ke liye Hatao ise down wwale ko

// 1. Global mouse tracking
const mouse = { x: 0, y: 0 };
const target = { x: 0, y: 0 };

window.addEventListener('mousemove', (e) => {
  // Normalize mouse position (-1 to +1)
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
});

// 2. Updated Animation Loop
function animate() {
  requestAnimationFrame(animate);

  // Smooth easing (Lerp)
  // Higher value (0.1) = faster follow, Lower (0.02) = floaty/lazy follow
  target.x += (mouse.x - target.x) * 0.05;
  target.y += (mouse.y - target.y) * 0.05;

  // Apply movement to the orb group or mesh
  // Increase '5' to make the movement range larger across the page
  if (orbGroup) { 
    orbGroup.position.x = target.x * 5; 
    orbGroup.position.y = target.y * 3;
    
    // Optional: add a slight rotation based on mouse
    orbGroup.rotation.y += 0.005; 
    orbGroup.rotation.x = target.y * 0.5;
  }

  renderer.render(scene, camera);
}

// 3. Handle Window Resize (Crucial for full-page)
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});