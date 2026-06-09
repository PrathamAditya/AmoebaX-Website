// Spotlight effect for cards
const cards = document.querySelectorAll('.spotlight-card');

cards.forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);
  });
});

try {
  // Initialize ThreeJS Animation
  const container = document.getElementById('hero-animation-container');
  if (container && typeof THREE !== 'undefined') {
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Organic "Amoeba" Group
    const amoebaGroup = new THREE.Group();
    scene.add(amoebaGroup);

    // Create the organic central body (The Amoeba)
    const amoebaGeometry = new THREE.SphereGeometry(1.5, 64, 64);
    const amoebaMaterial = new THREE.MeshPhongMaterial({
      color: 0x00e6b8,
      transparent: true,
      opacity: 0.8,
      shininess: 100,
      emissive: 0x00e6b8,
      emissiveIntensity: 0.2
    });
    const amoeba = new THREE.Mesh(amoebaGeometry, amoebaMaterial);
    amoebaGroup.add(amoeba);

    // Create the "X" structure coming out of the amoeba
    const xGroup = new THREE.Group();
    amoebaGroup.add(xGroup);

    const barGeometry = new THREE.CapsuleGeometry(0.2, 3, 16, 32);
    const xMaterial = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      emissive: 0x6d5ef5,
      emissiveIntensity: 0.5,
      shininess: 100
    });

    const bar1 = new THREE.Mesh(barGeometry, xMaterial);
    bar1.rotation.z = Math.PI / 4;
    const bar2 = new THREE.Mesh(barGeometry, xMaterial);
    bar2.rotation.z = -Math.PI / 4;

    xGroup.add(bar1, bar2);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x00e6b8, 2);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    const purpleLight = new THREE.PointLight(0x6d5ef5, 2);
    purpleLight.position.set(-5, -5, 5);
    scene.add(purpleLight);

    camera.position.z = 6;

    // Animation
    const clock = new THREE.Clock();

    function animate() {
      requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      // Organic pulsing for the amoeba
      const pulse = 1 + Math.sin(t * 2) * 0.1;
      amoeba.scale.set(pulse, pulse * 1.1, pulse);

      // Deform geometry slightly for organic feel
      const positions = amoeba.geometry.attributes.position;
      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        const y = positions.getY(i);
        const z = positions.getZ(i);

        const noise = Math.sin(x * 2 + t) * 0.1 + Math.cos(y * 2 + t) * 0.1;
        positions.setZ(i, z + noise * 0.01);
      }
      positions.needsUpdate = true;

      // Animate the X emerging and rotating
      xGroup.rotation.y = t * 0.5;
      xGroup.rotation.z = Math.sin(t * 0.5) * 0.2;

      // Emergence effect: X moves slightly in and out of the core
      const emergence = Math.sin(t * 1.5) * 0.2;
      xGroup.position.z = 0.5 + emergence;

      amoebaGroup.rotation.y += 0.005;

      renderer.render(scene, camera);
    }

    window.addEventListener('resize', () => {
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });

    animate();
  }
} catch (e) {
  console.error("ThreeJS initialization failed:", e);
}

// Scroll Reveal Observer
const revealObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('active');
      observer.unobserve(entry.target); // Stop observing once revealed
    }
  });
}, {
  root: null,
  rootMargin: '0px',
  threshold: 0.1
});

// Run directly since script is at the bottom of the body
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
