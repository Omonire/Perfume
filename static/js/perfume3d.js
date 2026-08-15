// Anime.js Interactive Perfume Bottle Renderer

function initPerfume3DViewer(containerId, productData = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Clear previous content
    container.innerHTML = '';

    const bottleColor = productData.bottle_color || '#3b0764';
    const liquidColor = productData.liquid_color || '#9333ea';
    const accentColor = productData.accent_color || '#fbbf24';
    const nameStr = (productData.name || 'AURA PARFUM').toUpperCase();

    // Unique SVG element IDs for gradient definitions
    const uid = 'p_' + Math.random().toString(36).substring(2, 9);
    const bottleGradId = `bottleGrad_${uid}`;
    const liquidGradId = `liquidGrad_${uid}`;
    const goldGradId = `goldGrad_${uid}`;
    const glassShineId = `glassShine_${uid}`;

    const svgHTML = `
        <div class="perfume-interactive-wrapper flex flex-col items-center justify-center w-full h-full relative select-none">
            <!-- Background Ambient Glow -->
            <div class="ambient-glow absolute w-64 h-64 rounded-full blur-3xl pointer-events-none opacity-40 transition-all duration-700"
                 style="background: ${liquidColor};"></div>

            <svg class="anime-perfume-svg w-64 sm:w-72 h-[380px] sm:h-[420px] drop-shadow-[0_25px_35px_rgba(0,0,0,0.85)] cursor-pointer"
                 viewBox="0 0 260 400" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <!-- Bottle Outer Body Gradient -->
                    <linearGradient id="${bottleGradId}" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="${bottleColor}" stop-opacity="0.9" />
                        <stop offset="45%" stop-color="${liquidColor}" stop-opacity="0.8" />
                        <stop offset="100%" stop-color="#09090b" stop-opacity="0.95" />
                    </linearGradient>

                    <!-- Inner Liquid Core Gradient -->
                    <linearGradient id="${liquidGradId}" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stop-color="${liquidColor}" stop-opacity="0.95" />
                        <stop offset="100%" stop-color="${bottleColor}" stop-opacity="0.85" />
                    </linearGradient>

                    <!-- Gold Cap & Collar Metallic Gradient -->
                    <linearGradient id="${goldGradId}" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="${accentColor}" />
                        <stop offset="50%" stop-color="#fef08a" />
                        <stop offset="100%" stop-color="#854d0e" />
                    </linearGradient>

                    <!-- Glass Refraction Shine Gradient -->
                    <linearGradient id="${glassShineId}" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.35" />
                        <stop offset="50%" stop-color="#ffffff" stop-opacity="0.05" />
                        <stop offset="100%" stop-color="#ffffff" stop-opacity="0.25" />
                    </linearGradient>
                </defs>

                <!-- Bottle Group for Animations -->
                <g class="bottle-main-group" transform-origin="130 200">

                    <!-- Square Crown Cap -->
                    <rect class="anime-cap" x="100" y="25" width="60" height="55" rx="8"
                          fill="url(#${goldGradId})" stroke="${accentColor}" stroke-width="1.5"
                          transform-origin="130 52"/>

                    <!-- Metallic Collar & Pump -->
                    <path class="anime-collar" d="M 88 80 L 172 80 L 180 102 L 80 102 Z"
                          fill="url(#${goldGradId})" stroke="${accentColor}" stroke-width="1"/>
                    <rect class="anime-pump" x="115" y="68" width="30" height="12" rx="3"
                          fill="url(#${goldGradId})" />

                    <!-- Outer Glass Bottle Shell -->
                    <rect class="anime-body" x="40" y="102" width="180" height="245" rx="20"
                          fill="url(#${bottleGradId})" stroke="${accentColor}" stroke-width="2"
                          stroke-opacity="0.6"/>

                    <!-- Inner Liquid Level -->
                    <rect class="anime-liquid" x="52" y="130" width="156" height="202" rx="14"
                          fill="url(#${liquidGradId})" transform-origin="130 332"/>

                    <!-- Glass Reflection Lines -->
                    <rect x="46" y="108" width="12" height="233" rx="6" fill="url(#${glassShineId})" />
                    <rect x="202" y="108" width="8" height="233" rx="4" fill="url(#${glassShineId})" opacity="0.6" />

                    <!-- Luxury Perfume Label -->
                    <g class="anime-label-group" transform-origin="130 220">
                        <rect class="anime-label" x="65" y="160" width="130" height="120" rx="10"
                              fill="#09090b" stroke="${accentColor}" stroke-width="2" />

                        <!-- Inner Gold Label Border -->
                        <rect x="71" y="166" width="118" height="108" rx="7"
                              fill="none" stroke="${accentColor}" stroke-width="1" stroke-dasharray="3 2" opacity="0.8"/>

                        <!-- Label Text -->
                        <text x="130" y="198" fill="${accentColor}" font-family="Playfair Display, Georgia, serif"
                              font-size="20" font-weight="bold" letter-spacing="3" text-anchor="middle">AURA</text>

                        <line x1="85" y1="206" x2="175" y2="206" stroke="${accentColor}" stroke-width="1" opacity="0.5"/>

                        <text x="130" y="228" fill="#ffffff" font-family="Plus Jakarta Sans, sans-serif"
                              font-size="11" font-weight="600" letter-spacing="1" text-anchor="middle">${nameStr}</text>

                        <text x="130" y="250" fill="#a1a1aa" font-family="Plus Jakarta Sans, sans-serif"
                              font-size="8" letter-spacing="2" text-anchor="middle">EXTRAIT DE PARFUM</text>
                    </g>
                </g>
            </svg>
        </div>
    `;

    container.innerHTML = svgHTML;

    // Anime.js Interactive Animations
    if (typeof anime !== 'undefined') {
        // Continuous Floating Motion
        anime({
            targets: `#${containerId} .bottle-main-group`,
            translateY: [-8, 8],
            rotate: [-1.5, 1.5],
            duration: 3200,
            direction: 'alternate',
            easing: 'easeInOutSine',
            loop: true
        });

        // Gentle Liquid Wave Animation
        anime({
            targets: `#${containerId} .anime-liquid`,
            scaleY: [0.96, 1.02],
            duration: 2400,
            direction: 'alternate',
            easing: 'easeInOutQuad',
            loop: true
        });

        // Intro Scale & Fade Animation
        anime({
            targets: `#${containerId} .anime-perfume-svg`,
            scale: [0.8, 1],
            opacity: [0, 1],
            duration: 1000,
            easing: 'easeOutElastic(1, 0.6)'
        });

        // Interactive Hover Effects
        const svgEl = container.querySelector('.anime-perfume-svg');
        const glowEl = container.querySelector('.ambient-glow');

        if (svgEl) {
            svgEl.addEventListener('mouseenter', () => {
                anime({
                    targets: `#${containerId} .anime-cap`,
                    translateY: -6,
                    duration: 400,
                    easing: 'easeOutCubic'
                });

                anime({
                    targets: `#${containerId} .anime-label-group`,
                    scale: 1.05,
                    duration: 400,
                    easing: 'easeOutCubic'
                });

                if (glowEl) {
                    glowEl.style.opacity = '0.7';
                    glowEl.style.transform = 'scale(1.2)';
                }
            });

            svgEl.addEventListener('mouseleave', () => {
                anime({
                    targets: `#${containerId} .anime-cap`,
                    translateY: 0,
                    duration: 500,
                    easing: 'easeOutCubic'
                });

                anime({
                    targets: `#${containerId} .anime-label-group`,
                    scale: 1.0,
                    duration: 500,
                    easing: 'easeOutCubic'
                });

                if (glowEl) {
                    glowEl.style.opacity = '0.4';
                    glowEl.style.transform = 'scale(1.0)';
                }
            });

            // Gentle Mouse-Follow Tilt effect inside container
            container.addEventListener('mousemove', (e) => {
                const rect = container.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;

                const tiltX = (y / rect.height) * -12;
                const tiltY = (x / rect.width) * 12;

                anime({
                    targets: `#${containerId} .anime-perfume-svg`,
                    rotateX: tiltX,
                    rotateY: tiltY,
                    duration: 300,
                    easing: 'easeOutQuad'
                });
            });

            container.addEventListener('mouseleave', () => {
                anime({
                    targets: `#${containerId} .anime-perfume-svg`,
                    rotateX: 0,
                    rotateY: 0,
                    duration: 600,
                    easing: 'easeOutCubic'
                });
            });
        }
    }
}
