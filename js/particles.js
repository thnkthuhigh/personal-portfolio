/* ============================================================
   PARTICLES.JS - Three.js 3D Particle System (OPTIMIZED)
   Interactive particle field with mouse attraction
   ============================================================ */

(function () {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas || typeof THREE === 'undefined') return;

    // ==================== SCENE SETUP ====================
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 50;

    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: false // tắt antialias để tăng FPS
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    // Giới hạn pixel ratio tối đa 1.5 (thay vì 2) để đỡ nặng trên màn hình Retina
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

    // ==================== PARTICLES ====================
    // Giảm số particles: desktop 1500, mobile 600
    const particleCount = window.innerWidth < 768 ? 600 : 1500;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const velocities = new Float32Array(particleCount * 3);

    // Color palette
    const colorPalette = [
        new THREE.Color(0x6c63ff), // Purple
        new THREE.Color(0xf72585), // Pink
        new THREE.Color(0x4cc9f0), // Cyan
        new THREE.Color(0x7209b7), // Deep purple
        new THREE.Color(0x3a0ca3), // Indigo
    ];

    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;

        const radius = 50 + Math.random() * 60;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);

        positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i3 + 2] = radius * Math.cos(phi) - 30;

        const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
        colors[i3] = color.r;
        colors[i3 + 1] = color.g;
        colors[i3 + 2] = color.b;

        sizes[i] = Math.random() * 2.5 + 0.5;

        velocities[i3] = (Math.random() - 0.5) * 0.015;
        velocities[i3 + 1] = (Math.random() - 0.5) * 0.015;
        velocities[i3 + 2] = (Math.random() - 0.5) * 0.015;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const vertexShader = `
        attribute float size;
        varying vec3 vColor;
        varying float vAlpha;
        
        void main() {
            vColor = color;
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            float dist = length(mvPosition.xyz);
            vAlpha = clamp(1.0 - dist / 120.0, 0.1, 0.8);
            gl_PointSize = size * (80.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
        }
    `;

    const fragmentShader = `
        varying vec3 vColor;
        varying float vAlpha;
        
        void main() {
            float dist = length(gl_PointCoord - vec2(0.5));
            if (dist > 0.5) discard;
            
            float alpha = smoothstep(0.5, 0.1, dist) * vAlpha;
            gl_FragColor = vec4(vColor, alpha);
        }
    `;

    const material = new THREE.ShaderMaterial({
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        transparent: true,
        vertexColors: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // ==================== CONNECTING LINES ====================
    // Giảm lineCount và số particles tham gia
    const lineCount = 80;
    const linePositions = new Float32Array(lineCount * 6);
    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));

    const lineMaterial = new THREE.LineBasicMaterial({
        color: 0x6c63ff,
        transparent: true,
        opacity: 0.06,
        blending: THREE.AdditiveBlending
    });

    const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(lines);

    // ==================== CENTRAL GLOW ====================
    const glowGeometry = new THREE.SphereGeometry(8, 16, 16); // giảm segments
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0x6c63ff,
        transparent: true,
        opacity: 0.03,
        blending: THREE.AdditiveBlending
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    glow.position.z = -20;
    scene.add(glow);

    // ==================== MOUSE INTERACTION ====================
    // Dùng throttle để giảm tần suất xử lý mousemove
    const mouse = new THREE.Vector2(0, 0);
    const mouseTarget = new THREE.Vector3(0, 0, 30);
    let mouseMoveTimeout = null;

    document.addEventListener('mousemove', (e) => {
        // Throttle: chỉ cập nhật mouse mỗi 32ms (~30fps cho mouse thay vì 60fps)
        if (mouseMoveTimeout) return;
        mouseMoveTimeout = setTimeout(() => { mouseMoveTimeout = null; }, 32);

        mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        mouseTarget.x = mouse.x * 30;
        mouseTarget.y = mouse.y * 30;
    });

    // ==================== ANIMATION LOOP ====================
    const clock = new THREE.Clock();
    let frameCount = 0;
    let isHidden = false;

    function animate() {
        requestAnimationFrame(animate);
        if (isHidden) return; // dừng hẳn khi tab ẩn

        frameCount++;
        const elapsedTime = clock.getElapsedTime();
        const posArr = geometry.attributes.position.array;

        // Animate particles — bỏ Math.sin/cos cho mỗi particle (tốn CPU)
        // Chỉ dùng velocity đơn giản
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;

            posArr[i3] += velocities[i3];
            posArr[i3 + 1] += velocities[i3 + 1];
            posArr[i3 + 2] += velocities[i3 + 2];

            // Mouse attraction (chỉ check khi mouse gần)
            const dx = mouseTarget.x - posArr[i3];
            const dy = mouseTarget.y - posArr[i3 + 1];
            const distSq = dx * dx + dy * dy; // dùng distSq để tránh sqrt

            if (distSq < 1600) { // 40*40 = 1600
                const force = (1600 - distSq) / 1600 * 0.002;
                posArr[i3] += dx * force;
                posArr[i3 + 1] += dy * force;
            }

            // Boundary check
            const limit = 80;
            if (Math.abs(posArr[i3]) > limit) posArr[i3] *= -0.9;
            if (Math.abs(posArr[i3 + 1]) > limit) posArr[i3 + 1] *= -0.9;
            if (posArr[i3 + 2] > 30 || posArr[i3 + 2] < -80) velocities[i3 + 2] *= -1;
        }

        geometry.attributes.position.needsUpdate = true;

        // Connecting lines — chỉ mỗi 6 frame (10fps) và giới hạn 200 particles
        if (frameCount % 6 === 0) {
            let lineIndex = 0;
            const threshold = 15;
            const checkCount = Math.min(particleCount, 200); // giảm từ 500 → 200

            outer: for (let i = 0; i < checkCount; i++) {
                for (let j = i + 1; j < checkCount; j++) {
                    if (lineIndex >= lineCount) break outer;
                    const i3 = i * 3, j3 = j * 3;
                    const dx = posArr[i3] - posArr[j3];
                    const dy = posArr[i3 + 1] - posArr[j3 + 1];
                    const dz = posArr[i3 + 2] - posArr[j3 + 2];
                    if (dx * dx + dy * dy + dz * dz < threshold * threshold) {
                        const li = lineIndex * 6;
                        linePositions[li] = posArr[i3];
                        linePositions[li + 1] = posArr[i3 + 1];
                        linePositions[li + 2] = posArr[i3 + 2];
                        linePositions[li + 3] = posArr[j3];
                        linePositions[li + 4] = posArr[j3 + 1];
                        linePositions[li + 5] = posArr[j3 + 2];
                        lineIndex++;
                    }
                }
            }

            for (let i = lineIndex * 6; i < lineCount * 6; i++) linePositions[i] = 0;
            lineGeometry.attributes.position.needsUpdate = true;
        }

        // Rotation chậm — giữ nguyên
        particles.rotation.y = elapsedTime * 0.05;
        particles.rotation.x = Math.sin(elapsedTime * 0.03) * 0.1;
        glow.rotation.y = elapsedTime * 0.1;
        glow.scale.setScalar(1 + Math.sin(elapsedTime) * 0.1);

        // Camera move — giảm tốc độ lerp
        camera.position.x += (mouse.x * 3 - camera.position.x) * 0.01;
        camera.position.y += (mouse.y * 2 - camera.position.y) * 0.01;
        camera.lookAt(0, 0, -20);

        renderer.render(scene, camera);
    }

    animate();

    // ==================== RESIZE HANDLER ====================
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        }, 200);
    });

    // ==================== VISIBILITY HANDLER ====================
    document.addEventListener('visibilitychange', () => {
        isHidden = document.hidden;
        if (!isHidden) clock.start();
        else clock.stop();
    });

    // ==================== THEME CHANGE HANDLER ====================
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.attributeName === 'data-theme') {
                const theme = document.documentElement.getAttribute('data-theme');
                lineMaterial.opacity = theme === 'light' ? 0.03 : 0.06;
            }
        });
    });
    observer.observe(document.documentElement, { attributes: true });
})();
