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

// Global variables
let G = 5.0; // Gravitational constant (adjusted for visual effect)
let escapeVelocity = 0.25; // Threshold for escaping orbit
let maxDistance = 10;
let mouseInfluenceRadius = 5; // Mouse Influence Radius
const damping = 0.99;
const dt = 0.016;
const particleCount = 10000; // Total particles in system

// Credits overlay
const overlay = document.createElement('div');
overlay.style.position = 'absolute';
overlay.style.bottom = '20px';
overlay.style.left = '20px';
overlay.style.color = 'skyblue';
overlay.style.fontFamily = 'Arial, sans-serif';
overlay.style.fontSize = '14px';
overlay.style.textShadow = '1px 1px 2px black';
overlay.innerHTML = 'Created by <a href="https://x.com/devrickysegura">@devrickysegura</a> with <i class="fa-solid fa-heart fa-beat-fade"></i> in California | Music Credits: INZO - Overthinker';
document.body.appendChild(overlay);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

document.body.style.margin = '0';
document.body.style.padding = '0';
document.body.style.overflow = 'hidden';

// Audio setup
let audioContext;
let audioBuffer;
let audioSource;
let gainNode;

function initAudio() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Load the audio file
    fetch('./musicFile.mp3') // REPLACES MUSIC FILE PATH TO YOUR AUDIO
        .then(response => response.arrayBuffer())
        .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
        .then(decodedAudio => {
            audioBuffer = decodedAudio;
            playAudio();
        })
        .catch(error => console.error('Error loading audio:', error));
}

function playAudio() {
    audioSource = audioContext.createBufferSource();
    audioSource.buffer = audioBuffer;
    audioSource.loop = false;
    
    // Create a gain node for volume control
    gainNode = audioContext.createGain();
    gainNode.gain.setValueAtTime(0.01, audioContext.currentTime); // Start at 1% volume
    
    audioSource.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    audioSource.start();
    console.log("Audio started");
}

// Button to start audio
const startButton = document.createElement('button');
startButton.innerHTML = 'Start Experience <i class="fa-solid fa-music fa-bounce"></i>';
startButton.style.position = 'absolute';
startButton.style.backgroundColor = "white";
startButton.style.color = "#333";
startButton.style.top = '20px';
startButton.style.left = '20px';
startButton.style.zIndex = '1000';
document.body.appendChild(startButton);

startButton.addEventListener('click', () => {
    initAudio();
    startButton.style.display = 'none'; // Hide the button after clicking
});

// Controls container
const controlsContainer = document.createElement('div');
controlsContainer.style.position = 'absolute';
controlsContainer.style.top = '40px';
controlsContainer.style.right = '20px';
controlsContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
controlsContainer.style.padding = '10px';
controlsContainer.style.borderRadius = '5px';
document.body.appendChild(controlsContainer);

// Slider controls
function createSlider(label, min, max, value, step, onChange) {
    const container = document.createElement('div');
    container.style.marginBottom = '10px';
    
    const labelElement = document.createElement('label');
    labelElement.textContent = `${label}: `;
    labelElement.style.color = 'white';
    container.appendChild(labelElement);
    
    const slider = document.createElement('input');
    slider.type = 'range';
    slider.min = min;
    slider.max = max;
    slider.value = value;
    slider.step = step;
    slider.style.width = '100%';
    slider.addEventListener('input', onChange);
    container.appendChild(slider);
    
    const valueDisplay = document.createElement('span');
    valueDisplay.textContent = value;
    valueDisplay.style.marginLeft = '5px';
    valueDisplay.style.color = 'white';
    container.appendChild(valueDisplay);
    
    controlsContainer.appendChild(container);
    return { slider, valueDisplay };
}

const gControl = createSlider('Gravity', 0, 10, G, 0.1, (e) => {
    G = parseFloat(e.target.value);
    gControl.valueDisplay.textContent = G.toFixed(1);
});

const escapeVelocityControl = createSlider('Escape Velocity', 0, 1, escapeVelocity, 0.01, (e) => {
    escapeVelocity = parseFloat(e.target.value);
    escapeVelocityControl.valueDisplay.textContent = escapeVelocity.toFixed(2);
});

const mouseInfluenceRadiusControl = createSlider('Mouse Influence Radius', 1, 10, mouseInfluenceRadius, 0.1, (e) => {
    mouseInfluenceRadius = parseFloat(e.target.value);
    mouseInfluenceRadiusControl.valueDisplay.textContent = mouseInfluenceRadius.toFixed(1);
});

// Particle setup
const particles = new THREE.BufferGeometry();
const positions = new Float32Array(particleCount * 3);
const colors = new Float32Array(particleCount * 3);
const velocities = new Float32Array(particleCount * 3);

for (let i = 0; i < particleCount * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 10;
    velocities[i] = (Math.random() - 0.5) * 0.1;
    colors[i] = 1; // Start with white color
}

particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));

const particleMaterial = new THREE.PointsMaterial({
    size: 0.05,
    blending: THREE.AdditiveBlending,
    transparent: true,
    sizeAttenuation: true,
    vertexColors: true
});

const particleSystem = new THREE.Points(particles, particleMaterial);
scene.add(particleSystem);

camera.position.z = 5; // Camera Z-Position

const mouse = new THREE.Vector2();

function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function onTouchMove(event) {
    if (event.touches.length > 0) {
        mouse.x = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.touches[0].clientY / window.innerHeight) * 2 + 1;
    }
}

window.addEventListener('mousemove', onMouseMove, false);
window.addEventListener('touchmove', onTouchMove, false);

const raycaster = new THREE.Raycaster();

// Animation function
function animate() {
    requestAnimationFrame(animate);

    const positions = particles.attributes.position.array;
    const colors = particles.attributes.color.array;

    raycaster.setFromCamera(mouse, camera);
    const mouseIntersectPoint = new THREE.Vector3();
    raycaster.ray.at(camera.position.z, mouseIntersectPoint);

    let particlesInOrbit = 0;

    // First loop: Apply gravitational and repulsion forces
    for (let i = 0; i < particleCount; i++) {
        const index = i * 3;
        let x = positions[index];
        let y = positions[index + 1];
        let z = positions[index + 2];

        const particlePosition = new THREE.Vector3(x, y, z);
        const distanceVector = particlePosition.sub(mouseIntersectPoint);
        const distance = distanceVector.length();

        if (distance < mouseInfluenceRadius) {
            particlesInOrbit++;

            // Calculate gravitational force
            const force = G / (distance * distance);
            const acceleration = force * dt;

            // Update velocities for orbit
            const perpVector = new THREE.Vector3(-distanceVector.y, distanceVector.x, 0).normalize();
            velocities[index] += perpVector.x * acceleration - distanceVector.x * acceleration * 0.5;
            velocities[index + 1] += perpVector.y * acceleration - distanceVector.y * acceleration * 0.5;
            velocities[index + 2] += perpVector.z * acceleration - distanceVector.z * acceleration * 0.5;

            // Color based on speed
            const speed = Math.sqrt(
                velocities[index]**2 + 
                velocities[index+1]**2 + 
                velocities[index+2]**2
            );
            const colorIntensity = Math.min(speed / escapeVelocity, 1);
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
        const newDistance = Math.sqrt(
            positions[index]**2 + 
            positions[index+1]**2 + 
            positions[index+2]**2
        );
        if (newDistance > maxDistance) {
            const scale = maxDistance / newDistance;
            positions[index] *= scale;
            positions[index + 1] *= scale;
            positions[index + 2] *= scale;
        }
    }

    // Update audio volume based on particles in orbit
    if (gainNode && audioContext.state === "running") {
        const volumePercentage = Math.min(particlesInOrbit / particleCount, 1);
        const minVolume = 0.01; // 1% minimum volume
        const maxVolume = 1.0; // 100% maximum volume
        const volume = minVolume + (maxVolume - minVolume) * volumePercentage;
        gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
        console.log("Particles in orbit:", particlesInOrbit, "Volume:", volume.toFixed(2));
    }

    particles.attributes.position.needsUpdate = true;
    particles.attributes.color.needsUpdate = true;
    renderer.render(scene, camera);
}

// Call animation function
animate();

// Code for responsiveness
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', onWindowResize, false);
onWindowResize();