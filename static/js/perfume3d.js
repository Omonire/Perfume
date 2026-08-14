// Three.js Luxury 3D Perfume Bottle Renderer

function initPerfume3DViewer(containerId, productData = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Dimensions
    const width = container.clientWidth || 500;
    const height = container.clientHeight || 500;

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 1.2, 5.5);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    container.appendChild(renderer.domElement);

    // Controls
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = false;
    controls.maxPolarAngle = Math.PI / 2 + 0.1;
    controls.minPolarAngle = Math.PI / 4;

    // Colors
    const bottleColorHex = productData.bottle_color || '#3b0764';
    const liquidColorHex = productData.liquid_color || '#9333ea';
    const accentColorHex = productData.accent_color || '#fbbf24';

    // Group for bottle
    const bottleGroup = new THREE.Group();
    scene.add(bottleGroup);

    // 1. Bottle Body (Outer Glass)
    const glassGeometry = new THREE.CylinderGeometry(0.85, 0.95, 2.2, 32);
    const glassMaterial = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(bottleColorHex),
        transparent: true,
        opacity: 0.55,
        roughness: 0.05,
        metalness: 0.1,
        transmission: 0.9,  // Glass refraction
        ior: 1.52,          // Index of refraction for glass
        thickness: 0.4,
        clearcoat: 1.0,
        clearcoatRoughness: 0.05,
        reflectivity: 0.9
    });
    const glassMesh = new THREE.Mesh(glassGeometry, glassMaterial);
    glassMesh.castShadow = true;
    glassMesh.receiveShadow = true;
    bottleGroup.add(glassMesh);

    // 2. Inner Liquid
    const liquidGeometry = new THREE.CylinderGeometry(0.75, 0.85, 1.7, 32);
    const liquidMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color(liquidColorHex),
        roughness: 0.2,
        metalness: 0.2,
        transparent: true,
        opacity: 0.85
    });
    const liquidMesh = new THREE.Mesh(liquidGeometry, liquidMaterial);
    liquidMesh.position.y = -0.18;
    bottleGroup.add(liquidMesh);

    // 3. Gold Neck/Shoulder Collar
    const collarGeometry = new THREE.CylinderGeometry(0.4, 0.82, 0.25, 32);
    const goldMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color(accentColorHex),
        metalness: 0.9,
        roughness: 0.15
    });
    const collarMesh = new THREE.Mesh(collarGeometry, goldMaterial);
    collarMesh.position.y = 1.2;
    collarMesh.castShadow = true;
    bottleGroup.add(collarMesh);

    // 4. Nozzle/Pump
    const pumpGeometry = new THREE.CylinderGeometry(0.18, 0.18, 0.35, 24);
    const pumpMesh = new THREE.Mesh(pumpGeometry, goldMaterial);
    pumpMesh.position.y = 1.45;
    bottleGroup.add(pumpMesh);

    // 5. Crown Cap
    const capGeometry = new THREE.BoxGeometry(0.65, 0.75, 0.65);
    const capMaterial = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(accentColorHex),
        metalness: 0.85,
        roughness: 0.1,
        clearcoat: 1.0
    });
    const capMesh = new THREE.Mesh(capGeometry, capMaterial);
    capMesh.position.y = 1.95;
    capMesh.castShadow = true;
    bottleGroup.add(capMesh);

    // 6. Luxury Metallic Label
    const labelGeometry = new THREE.PlaneGeometry(1.1, 0.8);
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 384;
    const ctx = canvas.getContext('2d');

    // Label Canvas Design
    ctx.fillStyle = '#0f0f13';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 8;
    ctx.strokeRect(12, 12, canvas.width - 24, canvas.height - 24);

    ctx.fillStyle = '#eab308';
    ctx.font = 'bold 38px "Playfair Display", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('AURA', canvas.width / 2, 110);

    ctx.fillStyle = '#ffffff';
    ctx.font = '22px sans-serif';
    ctx.fillText((productData.name || 'PARFUM').toUpperCase(), canvas.width / 2, 190);

    ctx.fillStyle = '#a1a1aa';
    ctx.font = '16px sans-serif';
    ctx.fillText('EAU DE PARFUM', canvas.width / 2, 240);
    ctx.fillText('100 ML / 3.4 FL. OZ.', canvas.width / 2, 280);

    const labelTexture = new THREE.CanvasTexture(canvas);
    const labelMaterial = new THREE.MeshStandardMaterial({
        map: labelTexture,
        roughness: 0.3,
        metalness: 0.5
    });
    const labelMesh = new THREE.Mesh(labelGeometry, labelMaterial);
    labelMesh.position.set(0, -0.05, 0.88);
    bottleGroup.add(labelMesh);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xfff5ea, 2.0);
    dirLight1.position.set(5, 8, 5);
    dirLight1.castShadow = true;
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x38bdf8, 1.2);
    dirLight2.position.set(-5, 3, -5);
    scene.add(dirLight2);

    const pointLight = new THREE.PointLight(0xf59e0b, 1.5, 10);
    pointLight.position.set(0, -1, 3);
    scene.add(pointLight);

    // Floor Shadow Disc
    const floorGeo = new THREE.CircleGeometry(2.5, 32);
    const floorMat = new THREE.MeshBasicMaterial({
        color: 0x000000,
        transparent: true,
        opacity: 0.4
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.y = -1.25;
    scene.add(floorMesh);

    // Floating Animation Loop
    let clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);
        const elapsedTime = clock.getElapsedTime();

        // Subtle floating and rotation motion
        bottleGroup.rotation.y = elapsedTime * 0.4;
        bottleGroup.position.y = Math.sin(elapsedTime * 1.5) * 0.08;

        controls.update();
        renderer.render(scene, camera);
    }

    animate();

    // Handle Resize
    window.addEventListener('resize', () => {
        const w = container.clientWidth;
        const h = container.clientHeight;
        if (w && h) {
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        }
    });

    return { scene, bottleGroup };
}
