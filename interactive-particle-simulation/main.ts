/**
 * Enhanced Interactive Particle System
 * Built by Ricky Segura - Enhanced Version
 * for all creatives on Earth.
 * 
 * This code falls under MIT License.
 * 
 * Happy Hacking!
 */

// Import Three.js
import * as THREE from 'three';

// Define types
interface SliderControl {
  slider: HTMLInputElement;
  valueDisplay: HTMLSpanElement;
}

// Enhanced Global variables
let G: number = 6.5; // Increased gravitational constant for more dynamic effects
let escapeVelocity: number = 0.35; // Slightly higher threshold
let maxDistance: number = 12; // Larger bounds
let mouseInfluenceRadius: number = 6; // Larger influence area
let waveAmplitude: number = 2.0; // New: Wave effect strength
let colorCycleSpeed: number = 0.02; // New: Color animation speed
let trailEffect: number = 0.95; // New: Trail/glow effect
const damping: number = 0.985; // Slightly less damping for more fluid motion
const dt: number = 0.016;
const particleCount: number = 15000; // More particles for richer visuals

// Time tracking for animations
let time: number = 0;

// Enhanced styling setup
document.body.style.margin = '0';
document.body.style.padding = '0';
document.body.style.overflow = 'hidden';
document.body.style.background = 'radial-gradient(ellipse at center, #1a1a2e 0%, #0f0f1e 50%, #000000 100%)';
document.body.style.fontFamily = '"Orbitron", "Courier New", monospace';

// Enhanced credits overlay with glow effect
const overlay: HTMLDivElement = document.createElement('div');
overlay.style.position = 'absolute';
overlay.style.bottom = '20px';
overlay.style.left = '20px';
overlay.style.color = '#00ff88';
overlay.style.fontFamily = '"Orbitron", monospace';
overlay.style.fontSize = '14px';
overlay.style.fontWeight = '700';
overlay.style.textShadow = '0 0 20px #00ff88, 0 0 40px #00ff88';
overlay.style.letterSpacing = '1px';
overlay.innerHTML = '◉ QUANTUM PARTICLE NEXUS ◉<br>Enhanced with ♦ THREE.JS<br>Built by <a href="https://www.rickysegura.dev/" target="_blank">Ricky Segura</a>';
document.body.appendChild(overlay);

// Performance monitor
const perfMonitor: HTMLDivElement = document.createElement('div');
perfMonitor.style.position = 'absolute';
perfMonitor.style.top = '20px';
perfMonitor.style.left = '20px';
perfMonitor.style.color = '#ff6b6b';
perfMonitor.style.fontFamily = '"Orbitron", monospace';
perfMonitor.style.fontSize = '12px';
perfMonitor.style.textShadow = '0 0 10px #ff6b6b';
perfMonitor.style.opacity = '0.8';
document.body.appendChild(perfMonitor);

// Enhanced Three.js setup
const scene: THREE.Scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x0a0a1a, 0.01); // Add atmospheric fog

const camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer({ 
    antialias: true,
    alpha: true,
    powerPreference: "high-performance"
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x000000, 0);
document.body.appendChild(renderer.domElement);

// Enhanced controls container with glassmorphism
const controlsContainer: HTMLDivElement = document.createElement('div');
controlsContainer.style.position = 'absolute';
controlsContainer.style.top = '40px';
controlsContainer.style.right = '20px';
controlsContainer.style.background = 'linear-gradient(145deg, rgba(0,255,136,0.1), rgba(255,0,136,0.1))';
controlsContainer.style.backdropFilter = 'blur(15px)';
controlsContainer.style.border = '1px solid rgba(0,255,136,0.3)';
controlsContainer.style.borderRadius = '15px';
controlsContainer.style.padding = '20px';
controlsContainer.style.minWidth = '280px';
controlsContainer.style.boxShadow = '0 8px 32px rgba(0,255,136,0.2), inset 0 1px 1px rgba(255,255,255,0.1)';
document.body.appendChild(controlsContainer);

// Enhanced slider creation with better styling
function createSlider(
    label: string, 
    min: number, 
    max: number, 
    value: number, 
    step: number, 
    onChange: (e: Event) => void
): SliderControl {
    const container: HTMLDivElement = document.createElement('div');
    container.style.marginBottom = '15px';
    
    const labelElement: HTMLLabelElement = document.createElement('label');
    labelElement.textContent = `${label}: `;
    labelElement.style.color = '#00ff88';
    labelElement.style.fontWeight = '700';
    labelElement.style.textShadow = '0 0 10px #00ff88';
    labelElement.style.fontSize = '13px';
    labelElement.style.letterSpacing = '0.5px';
    container.appendChild(labelElement);
    
    const slider: HTMLInputElement = document.createElement('input');
    slider.type = 'range';
    slider.min = min.toString();
    slider.max = max.toString();
    slider.value = value.toString();
    slider.step = step.toString();
    slider.style.width = '100%';
    slider.style.margin = '8px 0';
    slider.style.appearance = 'none';
    slider.style.height = '6px';
    slider.style.borderRadius = '3px';
    slider.style.background = 'linear-gradient(90deg, #ff006e, #00ff88)';
    slider.style.outline = 'none';
    slider.addEventListener('input', onChange);
    container.appendChild(slider);
    
    const valueDisplay: HTMLSpanElement = document.createElement('span');
    valueDisplay.textContent = value.toString();
    valueDisplay.style.color = '#ff6b6b';
    valueDisplay.style.fontWeight = '700';
    valueDisplay.style.textShadow = '0 0 10px #ff6b6b';
    valueDisplay.style.fontSize = '12px';
    container.appendChild(valueDisplay);
    
    controlsContainer.appendChild(container);
    return { slider, valueDisplay };
}

// Enhanced control sliders
const gControl: SliderControl = createSlider('◉ Gravity Field', 0, 15, G, 0.1, (e: Event) => {
    const target = e.target as HTMLInputElement;
    G = parseFloat(target.value);
    gControl.valueDisplay.textContent = G.toFixed(1);
});

const escapeVelocityControl: SliderControl = createSlider('◉ Escape Velocity', 0, 1, escapeVelocity, 0.01, (e: Event) => {
    const target = e.target as HTMLInputElement;
    escapeVelocity = parseFloat(target.value);
    escapeVelocityControl.valueDisplay.textContent = escapeVelocity.toFixed(2);
});

const mouseInfluenceRadiusControl: SliderControl = createSlider('◉ Influence Radius', 1, 15, mouseInfluenceRadius, 0.1, (e: Event) => {
    const target = e.target as HTMLInputElement;
    mouseInfluenceRadius = parseFloat(target.value);
    mouseInfluenceRadiusControl.valueDisplay.textContent = mouseInfluenceRadius.toFixed(1);
});

const waveControl: SliderControl = createSlider('◉ Wave Amplitude', 0, 5, waveAmplitude, 0.1, (e: Event) => {
    const target = e.target as HTMLInputElement;
    waveAmplitude = parseFloat(target.value);
    waveControl.valueDisplay.textContent = waveAmplitude.toFixed(1);
});

const colorSpeedControl: SliderControl = createSlider('◉ Color Cycle Speed', 0, 0.1, colorCycleSpeed, 0.001, (e: Event) => {
    const target = e.target as HTMLInputElement;
    colorCycleSpeed = parseFloat(target.value);
    colorSpeedControl.valueDisplay.textContent = (colorCycleSpeed * 1000).toFixed(1);
});

const trailControl: SliderControl = createSlider('◉ Trail Effect', 0.8, 0.99, trailEffect, 0.001, (e: Event) => {
    const target = e.target as HTMLInputElement;
    trailEffect = parseFloat(target.value);
    trailControl.valueDisplay.textContent = trailEffect.toFixed(3);
});

// Enhanced particle setup with better distribution
const particles: THREE.BufferGeometry = new THREE.BufferGeometry();
const positions: Float32Array = new Float32Array(particleCount * 3);
const colors: Float32Array = new Float32Array(particleCount * 3);
const velocities: Float32Array = new Float32Array(particleCount * 3);
const originalPositions: Float32Array = new Float32Array(particleCount * 3); // Store original positions for wave effects

// Create more interesting initial distribution
for (let i = 0; i < particleCount; i++) {
    const index = i * 3;
    
    // Create spiral galaxy-like initial distribution
    const angle = (i / particleCount) * Math.PI * 8;
    const radius = Math.pow(Math.random(), 0.5) * 8;
    const height = (Math.random() - 0.5) * 2;
    
    positions[index] = Math.cos(angle) * radius + (Math.random() - 0.5) * 2;
    positions[index + 1] = Math.sin(angle) * radius + (Math.random() - 0.5) * 2;
    positions[index + 2] = height;
    
    // Store original positions
    originalPositions[index] = positions[index];
    originalPositions[index + 1] = positions[index + 1];
    originalPositions[index + 2] = positions[index + 2];
    
    // Initial velocities with slight orbital motion
    velocities[index] = -Math.sin(angle) * 0.05;
    velocities[index + 1] = Math.cos(angle) * 0.05;
    velocities[index + 2] = (Math.random() - 0.5) * 0.02;
    
    // Enhanced initial colors with HSL spectrum
    const hue = (i / particleCount) * 360;
    const color = new THREE.Color().setHSL(hue / 360, 0.8, 0.6);
    colors[index] = color.r;
    colors[index + 1] = color.g;
    colors[index + 2] = color.b;
}

particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));

// Enhanced particle material with better blending
const particleMaterial: THREE.PointsMaterial = new THREE.PointsMaterial({
    size: 0.08,
    blending: THREE.AdditiveBlending,
    transparent: true,
    sizeAttenuation: true,
    vertexColors: true,
    alphaTest: 0.1
});

const particleSystem: THREE.Points = new THREE.Points(particles, particleMaterial);
scene.add(particleSystem);

// Enhanced camera setup with better positioning
camera.position.set(0, 0, 8);
camera.lookAt(0, 0, 0);

// Mouse/touch tracking
const mouse: THREE.Vector2 = new THREE.Vector2();
let mouseInfluenceStrength: number = 1.0;

function onMouseMove(event: MouseEvent): void {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    mouseInfluenceStrength = 1.0;
}

function onTouchMove(event: TouchEvent): void {
    if (event.touches.length > 0) {
        mouse.x = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.touches[0].clientY / window.innerHeight) * 2 + 1;
        mouseInfluenceStrength = 1.0;
    }
}

window.addEventListener('mousemove', onMouseMove, false);
window.addEventListener('touchmove', onTouchMove, false);

// Add mouse click effects
window.addEventListener('click', () => {
    mouseInfluenceStrength = 3.0; // Boost influence on click
});

const raycaster: THREE.Raycaster = new THREE.Raycaster();

// Performance tracking
let frameCount: number = 0;
let lastTime: number = performance.now();

// Enhanced animation function with multiple visual effects
function animate(): void {
    requestAnimationFrame(animate);
    
    time += dt;
    const currentTime = performance.now();
    
    // Update performance monitor
    frameCount++;
    if (currentTime - lastTime > 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        perfMonitor.innerHTML = `FPS: ${fps} | Particles: ${particleCount.toLocaleString()}`;
        frameCount = 0;
        lastTime = currentTime;
    }

    const positions = particles.attributes.position.array as Float32Array;
    const colors = particles.attributes.color.array as Float32Array;

    raycaster.setFromCamera(mouse, camera);
    const mouseIntersectPoint: THREE.Vector3 = new THREE.Vector3();
    raycaster.ray.at(camera.position.z, mouseIntersectPoint);

    let particlesInOrbit: number = 0;
    let totalEnergy: number = 0;

    // Gradually reduce mouse influence strength
    mouseInfluenceStrength = Math.max(0.5, mouseInfluenceStrength * 0.98);

    // Enhanced particle physics and visual effects
    for (let i = 0; i < particleCount; i++) {
        const index = i * 3;
        let x = positions[index];
        let y = positions[index + 1];
        let z = positions[index + 2];

        // Add wave distortion based on original positions
        const waveOffset = Math.sin(time * 2 + originalPositions[index] * 0.5) * waveAmplitude * 0.1;
        const waveY = Math.cos(time * 1.5 + originalPositions[index + 1] * 0.3) * waveAmplitude * 0.1;
        
        const particlePosition: THREE.Vector3 = new THREE.Vector3(x + waveOffset, y + waveY, z);
        const distanceVector: THREE.Vector3 = particlePosition.clone().sub(mouseIntersectPoint);
        const distance: number = distanceVector.length();

        if (distance < mouseInfluenceRadius && distance > 0.1) {
            particlesInOrbit++;

            // Enhanced gravitational force with mouse influence strength
            const force: number = (G * mouseInfluenceStrength) / (distance * distance + 0.1);
            const acceleration: number = force * dt;

            // Create more complex orbital mechanics
            const perpVector: THREE.Vector3 = new THREE.Vector3(-distanceVector.y, distanceVector.x, distanceVector.z * 0.1).normalize();
            const radialForce = distanceVector.clone().normalize().multiplyScalar(-acceleration * 0.7);
            const tangentialForce = perpVector.multiplyScalar(acceleration * 1.2);

            velocities[index] += radialForce.x + tangentialForce.x;
            velocities[index + 1] += radialForce.y + tangentialForce.y;
            velocities[index + 2] += radialForce.z + tangentialForce.z * 0.5;

            // Enhanced color effects based on multiple factors
            const speed: number = Math.sqrt(
                velocities[index]**2 + 
                velocities[index+1]**2 + 
                velocities[index+2]**2
            );
            
            totalEnergy += speed;
            
            // Multi-layered color system
            const speedIntensity: number = Math.min(speed / escapeVelocity, 1);
            const distanceIntensity: number = 1 - (distance / mouseInfluenceRadius);
            const timeHue: number = (time * colorCycleSpeed + i * 0.01) % 1;
            
            // Create dynamic color based on speed, distance, and time
            const baseColor = new THREE.Color().setHSL(
                (timeHue + speedIntensity * 0.3) % 1,
                0.8 + distanceIntensity * 0.2,
                0.4 + speedIntensity * 0.6
            );
            
            colors[index] = baseColor.r * (1 + speedIntensity);
            colors[index + 1] = baseColor.g * (1 + distanceIntensity);
            colors[index + 2] = baseColor.b * (1 + speedIntensity * distanceIntensity);
            
        } else {
            // Enhanced ambient behavior for particles outside influence
            const ambientHue = (time * colorCycleSpeed * 0.3 + i * 0.001) % 1;
            const ambientColor = new THREE.Color().setHSL(ambientHue, 0.4, 0.3);
            
            // Gradual color transition with trail effect
            colors[index] = colors[index] * trailEffect + ambientColor.r * (1 - trailEffect);
            colors[index + 1] = colors[index + 1] * trailEffect + ambientColor.g * (1 - trailEffect);
            colors[index + 2] = colors[index + 2] * trailEffect + ambientColor.b * (1 - trailEffect);
            
            // Add subtle drift based on original position
            const drift = Math.sin(time * 0.5 + originalPositions[index] * 0.1) * 0.001;
            velocities[index] += drift;
            velocities[index + 1] += Math.cos(time * 0.3 + originalPositions[index + 1] * 0.1) * 0.001;
        }
    }

    // Enhanced position updates and boundary handling
    for (let i = 0; i < particleCount; i++) {
        const index = i * 3;

        // Apply velocity with enhanced integration
        positions[index] += velocities[index] * dt * 60; // Frame-rate independent
        positions[index + 1] += velocities[index + 1] * dt * 60;
        positions[index + 2] += velocities[index + 2] * dt * 60;

        // Enhanced damping based on distance from center
        const centerDist = Math.sqrt(positions[index]**2 + positions[index+1]**2 + positions[index+2]**2);
        const adaptiveDamping = damping + (1 - damping) * Math.min(centerDist / maxDistance, 0.5);
        
        velocities[index] *= adaptiveDamping;
        velocities[index + 1] *= adaptiveDamping;
        velocities[index + 2] *= adaptiveDamping;

        // Soft boundary constraints with elastic collision
        if (centerDist > maxDistance) {
            const scale: number = maxDistance / centerDist;
            positions[index] *= scale * 0.95;
            positions[index + 1] *= scale * 0.95;
            positions[index + 2] *= scale * 0.95;
            
            // Add some bounce-back velocity
            velocities[index] *= -0.3;
            velocities[index + 1] *= -0.3;
            velocities[index + 2] *= -0.3;
        }
    }

    // Dynamic camera movement for added visual interest
    const cameraRadius = 8 + Math.sin(time * 0.1) * 2;
    const cameraAngle = time * 0.05;
    camera.position.x = Math.cos(cameraAngle) * cameraRadius * 0.1;
    camera.position.y = Math.sin(cameraAngle * 0.7) * cameraRadius * 0.05;
    camera.lookAt(0, 0, 0);

    // Update particle system
    particles.attributes.position.needsUpdate = true;
    particles.attributes.color.needsUpdate = true;
    
    // Render scene
    renderer.render(scene, camera);
}

// Start animation
animate();

// Enhanced responsive handling
function onWindowResize(): void {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}

window.addEventListener('resize', onWindowResize, false);

// Add keyboard shortcuts for enhanced interaction
window.addEventListener('keydown', (event: KeyboardEvent) => {
    switch(event.code) {
        case 'Space':
            // Reset particles to original positions
            for (let i = 0; i < particleCount; i++) {
                const index = i * 3;
                positions[index] = originalPositions[index];
                positions[index + 1] = originalPositions[index + 1];
                positions[index + 2] = originalPositions[index + 2];
                velocities[index] = 0;
                velocities[index + 1] = 0;
                velocities[index + 2] = 0;
            }
            event.preventDefault();
            break;
        case 'KeyR':
            // Randomize positions
            for (let i = 0; i < particleCount * 3; i++) {
                positions[i] = (Math.random() - 0.5) * 15;
                velocities[i] = (Math.random() - 0.5) * 0.2;
            }
            event.preventDefault();
            break;
    }
});

// Initialize
onWindowResize();