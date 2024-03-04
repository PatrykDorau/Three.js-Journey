import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'

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
 * Galaxy
 */

const params = {
    count: 100000,
    size: 0.01,
    radius: 5,
    branches: 3,
    spin: 1,
    randomness: 0.2,
    randomnessPower: 3,
    insideColor: "#ff6030",
    outsideColor: "#1b3984"
};

let geometry = null;
let material = null;
let points = null;

const generateGalaxy = () => {

    //Destroy old galaxy
    if(points !== null) {
        geometry.dispose();
        material.dispose();
        scene.remove(points);
    }

    const positions = new Float32Array(params.count * 3);
    const colors = new Float32Array(params.count * 3);

    const colorIn = new THREE.Color(params.insideColor)
    const colorOut = new THREE.Color(params.outsideColor)

    geometry = new THREE.BufferGeometry();

    for(let i = 0; i < params.count; i++) {
        const i3 = i * 3;

        const radius = Math.random() * params.radius
        const branchAngle = (i % params.branches) / params.branches * 2 * Math.PI
        const spinAngle = radius * params.spin;

        const randomX = Math.pow(Math.random(), params.randomnessPower) * (Math.random() < 0.5 ? 1: -1)
        const randomY = Math.pow(Math.random(), params.randomnessPower) * (Math.random() < 0.5 ? 1: -1)
        const randomZ = Math.pow(Math.random(), params.randomnessPower) * (Math.random() < 0.5 ? 1: -1)
    
        positions[i3 + 0] = Math.cos(branchAngle + spinAngle) * radius + randomX;
        positions[i3 + 1] = randomY;
        positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;

        const mixedColor = colorIn.clone();
        mixedColor.lerp(colorOut, radius / params.radius)

        colors[i3 + 0] = mixedColor.r
        colors[i3 + 1] = mixedColor.g
        colors[i3 + 2] = mixedColor.b
    }

    console.log(colors)

    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3))
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))

    // Material

    material = new THREE.PointsMaterial({size: params.size, sizeAttenuation: true, depthWrite: false, blending: THREE.AdditiveBlending, vertexColors: true})

    points = new THREE.Points(geometry, material)
    scene.add(points)
}

generateGalaxy();

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
camera.position.x = 3
camera.position.y = 3
camera.position.z = 3
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


//Gui

gui.add(params, "count").min(100).max(1000000).step(100).onFinishChange(generateGalaxy)
gui.add(params, "size").min(0.001).max(0.1).step(0.001).onFinishChange(generateGalaxy)
gui.add(params, "radius").min(0.1).max(20).step(0.1).onFinishChange(generateGalaxy)
gui.add(params, "branches").min(2).max(20).step(1).onFinishChange(generateGalaxy)
gui.add(params, "spin").min(-5).max(5).step(1).onFinishChange(generateGalaxy)
gui.add(params, "randomness").min(0).max(1).step(0.01).onFinishChange(generateGalaxy)
gui.add(params, "randomnessPower").min(1).max(10).step(1).onFinishChange(generateGalaxy)
gui.addColor(params, "insideColor").onFinishChange(generateGalaxy)
gui.addColor(params, "outsideColor").onFinishChange(generateGalaxy)