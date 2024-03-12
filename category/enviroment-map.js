import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader'
import {GroundedSkybox } from 'three/examples/jsm/objects/GroundedSkybox.js'

/**
 * AI generated environment map
 * 
 * NVIDIA Canvas - needs to use exr loader probably, and only in 4k
 * 
 * Skybox lab - paid option
 * 
 */

/**
 * Loaders
 */

const gltfLoader = new GLTFLoader();
const cubeTextureLoader = new THREE.CubeTextureLoader();
const rgbeLoader = new RGBELoader();
const textureLoader = new THREE.TextureLoader();


/**
 * Base
 */
// Debug
const gui = new dat.GUI()
const global = {
    envMapIntensity: 1,
}

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()


/**
 * Update all materials
 */

const updateAllMaterials = () => {
    scene.traverse((child) => {
        // console.log(child)
        if(child.isMesh && child.material.isMeshStandardMaterial) {
            child.material.envMapIntensity = global.envMapIntensity;
        }
    })
}


/**
 * Environment map
 */

// LDR cube texture
// const environmentMap = cubeTextureLoader.load([
//     '/assets/images/environmentMaps/0/px.png',
//     '/assets/images/environmentMaps/0/nx.png',
//     '/assets/images/environmentMaps/0/py.png',
//     '/assets/images/environmentMaps/0/ny.png',
//     '/assets/images/environmentMaps/0/pz.png',
//     '/assets/images/environmentMaps/0/nz.png',
// ])

// scene.backgroundBlurriness = 0.1
// scene.backgroundIntensity = 3

// scene.background = environmentMap;
// scene.environment = environmentMap;

//HDR (RGBE)

// const environmentMap = rgbeLoader.load('/assets/images/environmentMaps/custom.hdr', () => {
//     environmentMap.mapping = THREE.EquirectangularReflectionMapping
//     console.log(environmentMap);
//     scene.background = environmentMap;
//     scene.environment = environmentMap;
// })

// const environmentMap = rgbeLoader.load('/assets/images/environmentMaps/0/2k.hdr', () => {
//     environmentMap.mapping = THREE.EquirectangularReflectionMapping
//     console.log(environmentMap);
//     scene.background = environmentMap;
//     scene.environment = environmentMap;
// })

// const environmentMap = textureLoader.load('/assets/images/environmentMaps/blockadesLabsSkybox/digital_painting_neon_city_night_orange_lights_.jpg', () => {
//     environmentMap.mapping = THREE.EquirectangularReflectionMapping
//     environmentMap.colorSpace = THREE.SRGBColorSpace
//     console.log(environmentMap);
//     scene.background = environmentMap;
//     scene.environment = environmentMap;
// })

// Ground projected skybox
// rgbeLoader.load('/assets/images/environmentMaps/2/2k.hdr', (environmentMap) => {
//     environmentMap.mapping = THREE.EquirectangularReflectionMapping
//     environmentMap.colorSpace = THREE.SRGBColorSpace
// scene.environment = environmentMap;

//Skybox
// const skybox = new GroundedSkybox(environmentMap, 12, 70)
// scene.add(skybox)
// })


//Real time env map
// const environmentMap = textureLoader.load('/assets/images/environmentMaps/blockadesLabsSkybox/interior_views_cozy_wood_cabin_with_cauldron_and_p.jpg', () => {
//     environmentMap.mapping = THREE.EquirectangularReflectionMapping
//     environmentMap.colorSpace = THREE.SRGBColorSpace

    // scene.background = environmentMap;
    // scene.environment = environmentMap;
// })

const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(128, { type: THREE.HalfFloatType});
scene.environment = cubeRenderTarget.texture;

//Cube camera
const cubeCamera = new THREE.CubeCamera(0.1, 100, cubeRenderTarget);
cubeCamera.layers.set(1);

gui.add(global, "envMapIntensity").min(0).max(10).step(0.001).onChange(updateAllMaterials);

/**
 * Objects
 */

//Holy Donut
const holyDonut = new THREE.Mesh(new THREE.TorusGeometry(8, 0.5), new THREE.MeshBasicMaterial({color: new THREE.Color(10, 4, 2)}));
holyDonut.position.y = 3.5
holyDonut.layers.enable(1);
scene.add(holyDonut);

/**
 * Torus Knot
 */
const torusKnot = new THREE.Mesh(
    new THREE.TorusKnotGeometry(1, 0.4, 100, 16),
    new THREE.MeshStandardMaterial({roughness: 0.3, metalness: 1, color: 0xaaaaaa})
)
torusKnot.position.y = 4
torusKnot.position.x = -4
scene.add(torusKnot)

/**
 * Models
 */

gltfLoader.load('./assets/models/FlightHelmet/glTF/FlightHelmet.gltf', (gltf) => {
    gltf.scene.scale.set(10, 10, 10);
    gltf.scene.position.set(4, -1 ,0)
    scene.add(gltf.scene)

    updateAllMaterials()
})


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
camera.position.set(4, 5, 4)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.target.y = 3.5
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
    // Time
    const elapsedTime = clock.getElapsedTime()

    //Real time environment map
    if(holyDonut) {
        holyDonut.rotation.x = Math.sin(elapsedTime) * 2
        cubeCamera.update(renderer, scene);
    }

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()