// Three.js + Anime.js Luxury 3D Perfume Bottle Renderer

function initPerfume3DViewer(containerId, productData = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Clear previous contents
    container.innerHTML = '';

    const width = container.clientWidth || 500;
    const height = container.clientHeight || 500;

    // Color extraction with defaults
    const bottleColorHex = productData.bottle_color || '#3b0764';
    const liquidColorHex = productData.liquid_color || '#9333ea';
    const accentColorHex = productData.accent_color || '#fbbf24';
    const nameStr = (productData.name || 'AURA PARFUM').toUpperCase();

    let renderer, scene, camera, bottleGroup;

    try {
        // Test WebGL support
        const testCanvas = document.createElement('canvas');
        const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
        if (!gl) throw new Error("WebGL context not supported on this platform");

        // Scene setup
        scene = new THREE.Scene();

        // Camera setup
        camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        camera.position.set(0, 0.8, 5.0);

        // WebGL Renderer
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        container.appendChild(renderer.domElement);

        // Orbit controls
        if (typeof THREE.OrbitControls !== 'undefined') {
            const controls = new THREE.OrbitControls(camera, renderer.domElement);
            controls.enableDamping = true;
            controls.dampingFactor = 0.05;
            controls.enableZoom = false;
        }

        // Group for bottle
        bottleGroup = new THREE.Group();
        scene.add(bottleGroup);

        // 1. Outer Glass Body
        const glassGeometry = new THREE.CylinderGeometry(0.85, 0.95, 2.2, 32);
        const glassMaterial = new THREE.MeshPhysicalMaterial({
            color: new THREE.Color(bottleColorHex),
            transparent: true,
            opacity: 0.75,
            roughness: 0.1,
            metalness: 0.2,
            transmission: 0.85,
            clearcoat: 1.0,
            reflectivity: 0.9
        });
        const glassMesh = new THREE.Mesh(glassGeometry, glassMaterial);
        bottleGroup.add(glassMesh);

        // 2. Liquid Core
        const liquidGeometry = new THREE.CylinderGeometry(0.75, 0.85, 1.7, 32);
        const liquidMaterial = new THREE.MeshStandardMaterial({
            color: new THREE.Color(liquidColorHex),
            roughness: 0.2,
            metalness: 0.3,
            emissive: new THREE.Color(liquidColorHex),
            emissiveIntensity: 0.15
        });
        const liquidMesh = new THREE.Mesh(liquidGeometry, liquidMaterial);
        liquidMesh.position.y = -0.18;
        bottleGroup.add(liquidMesh);

        // 3. Gold Metallic Collar & Pump
        const collarGeometry = new THREE.CylinderGeometry(0.4, 0.82, 0.25, 32);
        const goldMaterial = new THREE.MeshStandardMaterial({
            color: new THREE.Color(accentColorHex),
            metalness: 0.9,
            roughness: 0.1,
            emissive: new THREE.Color(accentColorHex),
            emissiveIntensity: 0.1
        });
        const collarMesh = new THREE.Mesh(collarGeometry, goldMaterial);
        collarMesh.position.y = 1.2;
        bottleGroup.add(collarMesh);

        const pumpGeometry = new THREE.CylinderGeometry(0.18, 0.18, 0.35, 24);
        const pumpMesh = new THREE.Mesh(pumpGeometry, goldMaterial);
        pumpMesh.position.y = 1.45;
        bottleGroup.add(pumpMesh);

        // 4. Square Crown Cap
        const capGeometry = new THREE.BoxGeometry(0.65, 0.75, 0.65);
        const capMaterial = new THREE.MeshStandardMaterial({
            color: new THREE.Color(accentColorHex),
            metalness: 0.9,
            roughness: 0.1
        });
        const capMesh = new THREE.Mesh(capGeometry, capMaterial);
        capMesh.position.y = 1.95;
        bottleGroup.add(capMesh);

        // 5. Canvas Label
        const labelGeometry = new THREE.PlaneGeometry(1.1, 0.8);
        const labelCanvas = document.createElement('canvas');
        labelCanvas.width = 512;
        labelCanvas.height = 384;
        const ctx = labelCanvas.getContext('2d');

        ctx.fillStyle = '#0f0f13';
        ctx.fillRect(0, 0, labelCanvas.width, labelCanvas.height);
        ctx.strokeStyle = accentColorHex;
        ctx.lineWidth = 10;
        ctx.strokeRect(12, 12, labelCanvas.width - 24, labelCanvas.height - 24);

        ctx.fillStyle = accentColorHex;
        ctx.font = 'bold 38px serif';
        ctx.textAlign = 'center';
        ctx.fillText('AURA', labelCanvas.width / 2, 110);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 22px sans-serif';
        ctx.fillText(nameStr, labelCanvas.width / 2, 190);

        ctx.fillStyle = '#a1a1aa';
        ctx.font = '16px sans-serif';
        ctx.fillText('EAU DE PARFUM', labelCanvas.width / 2, 240);

        const labelTexture = new THREE.CanvasTexture(labelCanvas);
        const labelMaterial = new THREE.MeshStandardMaterial({ map: labelTexture });
        const labelMesh = new THREE.Mesh(labelGeometry, labelMaterial);
        labelMesh.position.set(0, -0.05, 0.88);
        bottleGroup.add(labelMesh);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
        scene.add(ambientLight);

        const dirLight1 = new THREE.DirectionalLight(0xffffff, 2.0);
        dirLight1.position.set(5, 8, 5);
        scene.add(dirLight1);

        const dirLight2 = new THREE.DirectionalLight(0xf59e0b, 1.5);
        dirLight2.position.set(-5, 3, 5);
        scene.add(dirLight2);

        // Render loop
        function animate() {
            requestAnimationFrame(animate);
            renderer.render(scene, camera);
        }
        animate();

    } catch (e) {
        console.warn("WebGL fallback activated:", e.message);
        renderSVGFallbackBottle(container, productData);
        return;
    }

    // ANIME.JS Smooth Animations on 3D Bottle
    if (typeof anime !== 'undefined' && bottleGroup) {
        // Continuous rotation using Anime.js
        anime({
            targets: bottleGroup.rotation,
            y: Math.PI * 2,
            duration: 12000,
            easing: 'linear',
            loop: true
        });

        // Floating y-motion with Anime.js
        anime({
            targets: bottleGroup.position,
            y: [-0.1, 0.1],
            duration: 2500,
            direction: 'alternate',
            easing: 'easeInOutSine',
            loop: true
        });

        // Entrance scale effect
        bottleGroup.scale.set(0, 0, 0);
        anime({
            targets: bottleGroup.scale,
            x: 1,
            y: 1,
            z: 1,
            duration: 1400,
            easing: 'easeOutElastic(1, .6)'
        });
    }
}

// Ultra-Sleek SVG 3D Fallback Bottle if WebGL is unavailable
function renderSVGFallbackBottle(container, productData) {
    const bottleColor = productData.bottle_color || '#3b0764';
    const liquidColor = productData.liquid_color || '#9333ea';
    const accentColor = productData.accent_color || '#fbbf24';
    const nameStr = (productData.name || 'AURA PARFUM').toUpperCase();

    const svgHTML = `
        <div class="fallback-bottle-wrapper flex flex-col items-center justify-center h-full w-full py-8">
            <svg class="anime-bottle-svg w-64 h-96 drop-shadow-[0_20px_35px_rgba(0,0,0,0.8)]" viewBox="0 0 240 360" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="glassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="${bottleColor}" stop-opacity="0.95" />
                        <stop offset="50%" stop-color="${liquidColor}" stop-opacity="0.85" />
                        <stop offset="100%" stop-color="#0f0f13" stop-opacity="0.9" />
                    </linearGradient>
                    <linearGradient id="goldCapGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="${accentColor}" />
                        <stop offset="100%" stop-color="#78350f" />
                    </linearGradient>
                </defs>

                <!-- Crown Cap -->
                <rect class="anime-cap" x="90" y="20" width="60" height="50" rx="6" fill="url(#goldCapGrad)" stroke="${accentColor}" stroke-width="2"/>

                <!-- Collar -->
                <path class="anime-collar" d="M 80 70 L 160 70 L 170 90 L 70 90 Z" fill="url(#goldCapGrad)" stroke="${accentColor}" stroke-width="1.5"/>

                <!-- Main Glass Bottle Body -->
                <rect class="anime-body" x="45" y="90" width="150" height="220" rx="16" fill="url(#glassGrad)" stroke="${accentColor}" stroke-width="2"/>

                <!-- Label -->
                <rect class="anime-label" x="65" y="140" width="110" height="110" rx="8" fill="#0f0f13" stroke="${accentColor}" stroke-width="2"/>
                <text x="120" y="175" fill="${accentColor}" font-family="Playfair Display, serif" font-size="18" font-weight="bold" text-anchor="middle">AURA</text>
                <text x="120" y="205" fill="#ffffff" font-family="sans-serif" font-size="10" font-weight="600" text-anchor="middle">${nameStr}</text>
                <text x="120" y="225" fill="#a1a1aa" font-family="sans-serif" font-size="8" text-anchor="middle">EAU DE PARFUM</text>
            </svg>
        </div>
    `;

    container.innerHTML = svgHTML;

    // Anime.js animation for SVG Fallback
    if (typeof anime !== 'undefined') {
        anime({
            targets: '.anime-bottle-svg',
            translateY: [-10, 10],
            rotate: [-2, 2],
            duration: 3000,
            direction: 'alternate',
            easing: 'easeInOutQuad',
            loop: true
        });

        anime({
            targets: '.anime-label',
            scale: [0.8, 1],
            opacity: [0, 1],
            duration: 1000,
            easing: 'easeOutBack'
        });
    }
}
