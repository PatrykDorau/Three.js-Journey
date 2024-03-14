import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader'

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

            child.castShadow = true;
            child.receiveShadow = true;
        }
    })
}


/**
 * Environment map
 */

const environmentMap = rgbeLoader.load('/assets/images/environmentMaps/0/2k.hdr', () => {
    environmentMap.mapping = THREE.EquirectangularReflectionMapping
    console.log(environmentMap);
    scene.background = environmentMap;
    scene.environment = environmentMap;
})


gui.add(global, "envMapIntensity").min(0).max(10).step(0.001).onChange(updateAllMaterials);


/**
 * Lights
 */
const directionalLight = new THREE.DirectionalLight('#ffffff', 6)
directionalLight.position.set(-4, 7 ,2.5)
scene.add(directionalLight)

//Shadow
directionalLight.castShadow = true;
directionalLight.shadow.camera.far = 15;
directionalLight.shadow.mapSize.set(1024, 1024)

gui.add(directionalLight, "intensity", 0, 10, 0.1);
gui.add(directionalLight.position, "x", -10, 10, 0.1).name("lightX");
gui.add(directionalLight.position, "y", -10, 10, 0.1).name("lightY");
gui.add(directionalLight.position, "z", -10, 10, 0.1).name("lightZ");


//Helper
// const directionalLightCameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera)
// scene.add(directionalLightCameraHelper)

//Target
directionalLight.target.position.set(0, 4, 0)
directionalLight.target.updateWorldMatrix();


/**
 * Models
 */

gltfLoader.load('./assets/models/FlightHelmet/glTF/FlightHelmet.gltf', (gltf) => {
    gltf.scene.scale.set(10, 10, 10);
    scene.add(gltf.scene)

    updateAllMaterials()
})


/**
 * Textures
 */

const wallAORoughnessMetalnessTexture = textureLoader.load("./assets/images/castle_brick_broken_06/castle_brick_broken_06_arm_1k.jpg")
const wallNormalTexture = textureLoader.load("./assets/images/castle_brick_broken_06/castle_brick_broken_06_nor_gl_1k.png")
const wallColorTexture = textureLoader.load("./assets/images/castle_brick_broken_06/castle_brick_broken_06_diff_1k.jpg")

wallColorTexture.colorSpace = THREE.SRGBColorSpace;

const floorColorTexture = textureLoader.load("./assets/images/wood_cabinet_worn_long/wood_cabinet_worn_long_diff_1k.jpg")
const floorNormalTexture = textureLoader.load("./assets/images/wood_cabinet_worn_long/wood_cabinet_worn_long_nor_gl_1k.png")
const floorAORoughnessMetalnessTexture = textureLoader.load("./assets/images/wood_cabinet_worn_long/wood_cabinet_worn_long_arm_1k.jpg")

floorColorTexture.colorSpace = THREE.SRGBColorSpace;

const floor = new THREE.Mesh(new THREE.PlaneGeometry(8,8), new THREE.MeshStandardMaterial({
    map: floorColorTexture,
    normalMap: floorNormalTexture,
    aoMap: floorAORoughnessMetalnessTexture,
    roughnessMap: floorAORoughnessMetalnessTexture,
    metalnessMap: floorAORoughnessMetalnessTexture,
}))
floor.rotation.x = -Math.PI * 0.5
scene.add(floor)

const wall = new THREE.Mesh(new THREE.PlaneGeometry(8,8), new THREE.MeshStandardMaterial({
    map: wallColorTexture,
    normalMap: wallNormalTexture,
    aoMap: wallAORoughnessMetalnessTexture,
    roughnessMap: wallAORoughnessMetalnessTexture,
    metalnessMap: wallAORoughnessMetalnessTexture,
}))

wall.position.set(0, 4, -4)

scene.add(wall)

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
    canvas: canvas,
    //Anitaliasing
    antialias: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

// Tone mapping
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 2

gui.add(renderer, "toneMappingExposure", 0, 10, 0.01)
gui.add(renderer, 'toneMapping', {
    No: THREE.NoToneMapping,
    Linear: THREE.LinearToneMapping,
    Reinhard: THREE.ReinhardToneMapping,
    Cineon: THREE.CineonToneMapping,
    ACESFilmic: THREE.ACESFilmicToneMapping
})

//Shadows
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

/**
 * Animate
 */
const clock = new THREE.Clock()
const tick = () =>
{
    // Time
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()