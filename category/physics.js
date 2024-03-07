import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'
import * as CANNON from "cannon-es"

//Better to use ammo.js because it has more options


/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Sounds
 */

const hitSound = new Audio('./assets/sounds/hit.mp3')

const playHitSound = (collision) => {
    const impactStrength = collision.contact.getImpactVelocityAlongNormal()

    if(impactStrength > 1.5) {
        hitSound.volume = Math.min(1, Math.max(0, impactStrength / 10));
        hitSound.currentTime = 0;
        hitSound.play()
    }
}


/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
const cubeTextureLoader = new THREE.CubeTextureLoader()

const environmentMapTexture = cubeTextureLoader.load([
    './assets/images/physics/environmentMaps/0/px.png',
    './assets/images/physics/environmentMaps/0/nx.png',
    './assets/images/physics/environmentMaps/0/py.png',
    './assets/images/physics/environmentMaps/0/ny.png',
    './assets/images/physics/environmentMaps/0/pz.png',
    './assets/images/physics/environmentMaps/0/nz.png'
])

/**
 * Physics
 */

//World
const world = new CANNON.World();
world.broadphase = new CANNON.SAPBroadphase(world); //Very good for performance, might cause bugs with physics when something is traveling too fast
world.allowSleep = true; //Very good for performance
world.gravity.set(0, -9.82, 0)

//Materials
const defaultMaterial = new CANNON.Material('default');

const defaultMaterialContractMaterial = new CANNON.ContactMaterial(defaultMaterial, defaultMaterial, {friction: 0.1, restitution: 0.7})
world.addContactMaterial(defaultMaterialContractMaterial);

// Floor
const floorShape = new CANNON.Plane();
const floorBody = new CANNON.Body({shape: floorShape, material: defaultMaterial});
floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(-1, 0, 0), Math.PI / 2)
world.addBody(floorBody)

/**
 * Floor
 */
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    new THREE.MeshStandardMaterial({
        color: '#777777',
        metalness: 0.3,
        roughness: 0.4,
        envMap: environmentMapTexture,
        envMapIntensity: 0.5
    })
)
floor.receiveShadow = true
floor.rotation.x = - Math.PI * 0.5
scene.add(floor)

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 2.1)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 15
directionalLight.shadow.camera.left = - 7
directionalLight.shadow.camera.top = 7
directionalLight.shadow.camera.right = 7
directionalLight.shadow.camera.bottom = - 7
directionalLight.position.set(5, 5, 5)
scene.add(directionalLight)

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
camera.position.set(- 3, 3, 3)
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
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))


/**
 * Utlis
 */

const sphereGeometry = new THREE.SphereGeometry(1, 20, 20)
const sphereMaterial = new THREE.MeshStandardMaterial({
    metalness: 0.3,
    roughness: 0.4,
    envMap: environmentMapTexture,
})

const objectsToUpdate = [];

const createSphere = (radius, position) => {
    //Three.js mesh
    const mesh = new THREE.Mesh(sphereGeometry, sphereMaterial)
    mesh.scale.set(radius, radius, radius)
    mesh.castShadow = true
    mesh.position.copy(position)
    scene.add(mesh);

    //Cannon.js body
    const shape = new CANNON.Sphere(radius);
    const body = new CANNON.Body({
        mass: 1,
        position: new CANNON.Vec3(0,3,0),
        shape: shape,
        material: defaultMaterial
    })
    body.position.copy(position);
    body.addEventListener("collide", playHitSound);
    world.addBody(body);

    objectsToUpdate.push({mesh: mesh, body: body});
}

createSphere(0.5, {x: 0, y: 3, z: 0})
createSphere(0.5, {x: 2, y: 3, z: 2})

const boxGeometry = new THREE.BoxGeometry(1, 1, 1)
const boxMaterial = new THREE.MeshStandardMaterial({
    metalness: 0.3,
    roughness: 0.4,
    envMap: environmentMapTexture,
})

const createBox = (width, height, depth, position) => {
    //Three.js mesh
    const mesh = new THREE.Mesh(boxGeometry, boxMaterial)
    mesh.scale.set(width, height, depth)
    mesh.castShadow = true
    mesh.position.copy(position)
    scene.add(mesh);

    //Cannon.js body
    const shape = new CANNON.Box(new CANNON.Vec3(width / 2, height / 2, depth / 2)); //Divide by 2 because box in cannon.js is calculated from the middle of the box
    const body = new CANNON.Body({
        mass: 1,
        position: new CANNON.Vec3(0,3,0),
        shape: shape,
        material: defaultMaterial
    })
    body.position.copy(position);
    body.addEventListener("collide", playHitSound);
    world.addBody(body);

    objectsToUpdate.push({mesh: mesh, body: body});
}

createBox(1, 1, 1, {x: 2, y: 3, z: 4})


/**
 * Animate
 */
const clock = new THREE.Clock()
let currentTime = 0;

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - currentTime;
    currentTime = elapsedTime;

    //Update physics world
    // sphereBody.applyForce(new CANNON.Vec3(-0.5,0,0), sphereBody.position);
    
    world.step(1/60, deltaTime, 3)
    
    objectsToUpdate.forEach(obj => {
        obj.mesh.position.copy(obj.body.position)
        obj.mesh.quaternion.copy(obj.body.quaternion)
    })
    // sphere.position.copy(sphereBody.position)
    
    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()

/**
 * Debug
 */
const gui = new dat.GUI()
const debugObject = {
    createSphere: () => {
        createSphere(Math.random() * 0.5, {x: (Math.random() - 0.5) * 3, y: 3, z: (Math.random() - 0.5) * 3})
    },
    createBox: () => {
        createBox(Math.random(), Math.random(), Math.random(), {x: (Math.random() - 0.5) * 3, y: 3, z:(Math.random() - 0.5) * 3})
    },
    reset: () => {
        objectsToUpdate.forEach((object) => {
            object.body.removeEventListener("collide", playHitSound);
            world.removeBody(object.body);

            scene.remove(object.mesh)
        })
        objectsToUpdate.splice(0, objectsToUpdate.length)
    }
};
gui.add(debugObject, "createSphere");
gui.add(debugObject, "createBox");
gui.add(debugObject, "reset");

