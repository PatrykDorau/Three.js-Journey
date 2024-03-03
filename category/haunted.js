import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui';

/**
 * Base
 */
// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()

/**
 * House
 */

const house = new THREE.Group();
scene.add(house);

// Walls

const walls = new THREE.Mesh(new THREE.BoxGeometry(4,3,4), new THREE.MeshStandardMaterial({color: "#ac8e82"}));
walls.position.y = 3/2
house.add(walls);

const roof = new THREE.Mesh(new THREE.ConeGeometry(3.5,2,4), new THREE.MeshStandardMaterial({color: "#ac8e82"}));
roof.position.y = 4
roof.rotation.y = Math.PI/4
house.add(roof)

//Door
const door = new THREE.Mesh(new THREE.PlaneGeometry(1.3,2), new THREE.MeshStandardMaterial({color: "white"}));
door.position.z = 2.01
door.position.y = 1
house.add(door)

//Bushes

const bushGeometry = new THREE.SphereGeometry(1, 16,16);
const bushMaterial = new THREE.MeshStandardMaterial({color: "green"});

const bush = new THREE.Mesh(bushGeometry, bushMaterial);
bush.scale.set(0.5,0.5,0.5);
bush.position.set(0.8, 0.2, 2.5)
const bush1 = new THREE.Mesh(bushGeometry, bushMaterial);
bush1.scale.set(0.2,0.2,0.2);
bush1.position.set(1.5, 0.1, 2.5)
const bush2 = new THREE.Mesh(bushGeometry, bushMaterial);
bush2.scale.set(0.4,0.4,0.4);
bush2.position.set(-1.5, 0.2, 2.5)

house.add(bush, bush1, bush2)

//Graves
const graves = new THREE.Group()
scene.add(graves);

const graveGeometry = new THREE.BoxGeometry(0.6, 0.8, 0.2)
const graveMaterial = new THREE.MeshStandardMaterial({color: "#b2b6b1"})

for(let i = 0; i < 30; i++) {
    const angle = Math.random() *Math.PI * 2;
    const radius = 4 + Math.random() * 6
    const x = Math.sin(angle) * radius
    const z = Math.cos(angle)* radius

    const grave = new THREE.Mesh(graveGeometry,graveMaterial)
    grave.rotation.y = Math.random()
    grave.rotation.z = Math.random() * 0.1
    grave.position.set(x, 0.3 ,z);
    graves.add(grave);

}



// Floor
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 20),
    new THREE.MeshStandardMaterial({ color: '#a9c388' })
)
floor.rotation.x = - Math.PI * 0.5
floor.position.y = 0
scene.add(floor)

/**
 * Lights
 */
// Ambient light
const ambientLight = new THREE.AmbientLight('#b9d5ff', 0.12)
gui.add(ambientLight, 'intensity').min(0).max(1).step(0.001)
scene.add(ambientLight)

// Directional light
const moonLight = new THREE.DirectionalLight('#b9d5ff', 0.12)
moonLight.position.set(4, 5, - 2)
gui.add(moonLight, 'intensity').min(0).max(1).step(0.001)
gui.add(moonLight.position, 'x').min(- 5).max(5).step(0.001)
gui.add(moonLight.position, 'y').min(- 5).max(5).step(0.001)
gui.add(moonLight.position, 'z').min(- 5).max(5).step(0.001)
scene.add(moonLight)


// Door light

const doorLight = new THREE.PointLight("#ff7d46", 1, 7);
doorLight.position.set(0, 2.2, 2.7)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 4
camera.position.y = 2
camera.position.z = 5
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()