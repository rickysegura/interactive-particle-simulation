/**
 * 
 * 
 * Built by Ricky Segura
 * for all creatives on Earth.
 * 
 * This code falls under MIT License.
 * Download the MIT License here:
 * https://github.com/rickysegura/interactive-particle-simulation/blob/main/LICENSE
 * 
 * Happy Hacking!
 * 
 * 
*/

// Import Three.js
import * as THREE from 'three';

// Define types
interface SliderControl {
  slider: HTMLInputElement;
  valueDisplay: HTMLSpanElement;
}

// Global variables
let G: number = 5.0; // Gravitational constant (adjusted for visual effect)
let escapeVelocity: number = 0.25; // Threshold for escaping orbit
let maxDistance: number = 10;
let mouseInfluenceRadius: number = 5; // Mouse Influence Radius
const damping: number = 0.99;
const dt: number = 0.016;
const particleCount: number = 10000; // Total particles in system

// Credits overlay
const overlay: HTMLDivElement = document.createElement('div');
overlay.style.position = 'absolute';
overlay.style.bottom = '20px';
overlay.style.left = '20px';
overlay.style.color = 'skyblue';
overlay.style.fontFamily = 'Arial, sans-serif';
overlay.style.fontSize = '14px';
overlay.style.textShadow = '1px 1px 2px black';
overlay.innerHTML = 'Created with <i class="fa-solid fa-heart fa-beat-fade"></i> and Three.js';
document.body.appendChild(overlay);

const scene: THREE.Scene = new THREE.Scene();
const camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

document.body.style.margin = '0';
document.body.style.padding = '0';
document.body.style.overflow = 'hidden';

// Controls container
const controlsContainer: HTMLDivElement = document.createElement('div');
controlsContainer.style.position = 'absolute';
controlsContainer.style.top = '40px';
controlsContainer.style.right = '20px';
controlsContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
controlsContainer.style.padding = '10px';
controlsContainer.style.borderRadius = '5px';
document.body.appendChild(controlsContainer);

// Slider controls
function createSlider(
    label: string, 
    min: number, 
    max: number, 
    value: number, 
    step: number, 
    onChange: (e: Event) => void
): SliderControl {
    const container: HTMLDivElement = document.createElement('div');
    container.style.marginBottom = '10px';
    
    const labelElement: HTMLLabelElement = document.createElement('label');
    labelElement.textContent = `${label}: `;
    labelElement.style.color = 'white';
    container.appendChild(labelElement);
    
    const slider: HTMLInputElement = document.createElement('input');
    slider.type = 'range';
    slider.min = min.toString();
    slider.max = max.toString();
    slider.value = value.toString();
    slider.step = step.toString();
    slider.style.width = '100%';
    slider.addEventListener('input', onChange);
    container.appendChild(slider);
    
    const valueDisplay: HTMLSpanElement = document.createElement('span');
    valueDisplay.textContent = value.toString();
    valueDisplay.style.marginLeft = '5px';
    valueDisplay.style.color = 'white';
    container.appendChild(valueDisplay);
    
    controlsContainer.appendChild(container);
    return { slider, valueDisplay };
}

const gControl: SliderControl = createSlider('Gravity', 0, 10, G, 0.1, (e: Event) => {
    const target = e.target as HTMLInputElement;
    G = parseFloat(target.value);
    gControl.valueDisplay.textContent = G.toFixed(1);
});

const escapeVelocityControl: SliderControl = createSlider('Escape Velocity', 0, 1, escapeVelocity, 0.01, (e: Event) => {
    const target = e.target as HTMLInputElement;
    escapeVelocity = parseFloat(target.value);
    escapeVelocityControl.valueDisplay.textContent = escapeVelocity.toFixed(2);
});

const mouseInfluenceRadiusControl: SliderControl = createSlider('Mouse Influence Radius', 1, 10, mouseInfluenceRadius, 0.1, (e: Event) => {
    const target = e.target as HTMLInputElement;
    mouseInfluenceRadius = parseFloat(target.value);
    mouseInfluenceRadiusControl.valueDisplay.textContent = mouseInfluenceRadius.toFixed(1);
});

// Particle setup
const particles: THREE.BufferGeometry = new THREE.BufferGeometry();
const positions: Float32Array = new Float32Array(particleCount * 3);
const colors: Float32Array = new Float32Array(particleCount * 3);
const velocities: Float32Array = new Float32Array(particleCount * 3);

for (let i = 0; i < particleCount * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 10;
    velocities[i] = (Math.random() - 0.5) * 0.1;
    colors[i] = 1; // Start with white color
}

particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));

const particleMaterial: THREE.PointsMaterial = new THREE.PointsMaterial({
    size: 0.05,
    blending: THREE.AdditiveBlending,
    transparent: true,
    sizeAttenuation: true,
    vertexColors: true
});

const particleSystem: THREE.Points = new THREE.Points(particles, particleMaterial);
scene.add(particleSystem);

camera.position.z = 5; // Camera Z-Position

const mouse: THREE.Vector2 = new THREE.Vector2();

function onMouseMove(event: MouseEvent): void {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function onTouchMove(event: TouchEvent): void {
    if (event.touches.length > 0) {
        mouse.x = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.touches[0].clientY / window.innerHeight) * 2 + 1;
    }
}

window.addEventListener('mousemove', onMouseMove, false);
window.addEventListener('touchmove', onTouchMove, false);

const raycaster: THREE.Raycaster = new THREE.Raycaster();

// Animation function
function animate(): void {
    requestAnimationFrame(animate);

    const positions = particles.attributes.position.array as Float32Array;
    const colors = particles.attributes.color.array as Float32Array;

    raycaster.setFromCamera(mouse, camera);
    const mouseIntersectPoint: THREE.Vector3 = new THREE.Vector3();
    raycaster.ray.at(camera.position.z, mouseIntersectPoint);

    let particlesInOrbit: number = 0;

    // First loop: Apply gravitational and repulsion forces
    for (let i = 0; i < particleCount; i++) {
        const index = i * 3;
        let x = positions[index];
        let y = positions[index + 1];
        let z = positions[index + 2];

        const particlePosition: THREE.Vector3 = new THREE.Vector3(x, y, z);
        const distanceVector: THREE.Vector3 = particlePosition.sub(mouseIntersectPoint);
        const distance: number = distanceVector.length();

        if (distance < mouseInfluenceRadius) {
            particlesInOrbit++;

            // Calculate gravitational force
            const force: number = G / (distance * distance);
            const acceleration: number = force * dt;

            // Update velocities for orbit
            const perpVector: THREE.Vector3 = new THREE.Vector3(-distanceVector.y, distanceVector.x, 0).normalize();
            velocities[index] += perpVector.x * acceleration - distanceVector.x * acceleration * 0.5;
            velocities[index + 1] += perpVector.y * acceleration - distanceVector.y * acceleration * 0.5;
            velocities[index + 2] += perpVector.z * acceleration - distanceVector.z * acceleration * 0.5;

            // Color based on speed
            const speed: number = Math.sqrt(
                velocities[index]**2 + 
                velocities[index+1]**2 + 
                velocities[index+2]**2
            );
            const colorIntensity: number = Math.min(speed / escapeVelocity, 1);
            colors[index] = 1; // Red
            colors[index + 1] = 1 - colorIntensity; // Green
            colors[index + 2] = 1 - colorIntensity; // Blue
        } else {
            // Particles outside influence gradually return to white
            colors[index] = Math.min(1, colors[index] + 0.01);
            colors[index + 1] = Math.min(1, colors[index + 1] + 0.01);
            colors[index + 2] = Math.min(1, colors[index + 2] + 0.01);
        }
    }

    // Second loop: Update positions and apply constraints
    for (let i = 0; i < particleCount; i++) {
        const index = i * 3;

        // Apply velocity
        positions[index] += velocities[index] * dt;
        positions[index + 1] += velocities[index + 1] * dt;
        positions[index + 2] += velocities[index + 2] * dt;

        // Apply damping
        velocities[index] *= damping;
        velocities[index + 1] *= damping;
        velocities[index + 2] *= damping;

        // Keep particles within bounds
        const newDistance: number = Math.sqrt(
            positions[index]**2 + 
            positions[index+1]**2 + 
            positions[index+2]**2
        );
        if (newDistance > maxDistance) {
            const scale: number = maxDistance / newDistance;
            positions[index] *= scale;
            positions[index + 1] *= scale;
            positions[index + 2] *= scale;
        }
    }

    particles.attributes.position.needsUpdate = true;
    particles.attributes.color.needsUpdate = true;
    renderer.render(scene, camera);
}

// Call animation function
animate();

// Code for responsiveness
function onWindowResize(): void {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', onWindowResize, false);
onWindowResize();