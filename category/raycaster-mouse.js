import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js"
import *  as dat from 'dat.gui'

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
 * Objects
 */
const object1 = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 16, 16),
    new THREE.MeshBasicMaterial({ color: '#ff0000' })
)
object1.position.x = - 2

const object2 = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 16, 16),
    new THREE.MeshBasicMaterial({ color: '#ff0000' })
)

const object3 = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 16, 16),
    new THREE.MeshBasicMaterial({ color: '#ff0000' })
)
object3.position.x = 2

scene.add(object1, object2, object3)

/**
 * Raycaster
 */

const raycaster = new THREE.Raycaster();
// const rayOrigin = new THREE.Vector3(-3, 0 ,0);
// const rayDirection = new THREE.Vector3(1, 0 , 0);
// rayDirection.normalize() // direction needs to be normalized
// raycaster.set(rayOrigin, rayDirection)

// Fix for distance, because right now all are at 2.5 distance
// object1.updateMatrixWorld()
// object2.updateMatrixWorld()
// object3.updateMatrixWorld()

// const objectToTest = [object1, object2, object3]

// const intersects = raycaster.intersectObjects(objectToTest);
// console.log(intersects);

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
 * Mouse
 */

const mouse = new THREE.Vector2();

window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX / sizes.width * 2 - 1;
    mouse.y = -(e.clientY / sizes.height) * 2 + 1;
})

window.addEventListener("click", () => {
    if(currentIntersect) {
        console.log(currentIntersect)
    }
})


/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
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
 * Models
 */

const gltfLoader = new GLTFLoader()
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("./draco/"); // decoder
gltfLoader.setDRACOLoader(dracoLoader);

let model = null;

gltfLoader.load(
    "./assets/models/Duck/glTF-Draco/Duck.gltf",
    (gltf) => {
        console.log("success", gltf)
        model = gltf.scene;
        scene.add(gltf.scene)
    },
    (pr) => {
        console.log("progress", pr)
    },
    (er) => {
        console.log("error", er)
    }
)

/**
 * Lights
 */

const ambientLight = new THREE.AmbientLight('#ffffff', 0.9)
const directionalLight = new THREE.DirectionalLight('#ffffff', 2.1)
scene.add(ambientLight, directionalLight)


/**
 * Animate
 */
const clock = new THREE.Clock()

let currentIntersect = null;

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    //Animate objects
    object1.position.y = Math.sin(elapsedTime * 0.3)  * 1.5
    object2.position.y = Math.sin(elapsedTime * 0.8)  * 1.5
    object3.position.y = Math.sin(elapsedTime * 1.2)  * 1.5

    // Test Raycaster on each frame
    // const rayOrigin = new THREE.Vector3(-3, 0 ,0);
    // const rayDirection = new THREE.Vector3(1, 0 , 0);
    // rayDirection.normalize() // direction needs to be normalized
    // raycaster.set(rayOrigin, rayDirection)
    
    //Cast a ray
    raycaster.setFromCamera(mouse,camera);

    const objectToTest = [object1, object2, object3]
    const intersects = raycaster.intersectObjects(objectToTest);

    objectToTest.forEach((object) => {
        object.material.color.set("#ff0000")
    })

    intersects.forEach((intersect) => {
        intersect.object.material.color.set("#0000ff")
    })

    if(intersects.length) {

        if(currentIntersect === null) {
            console.log("enter");
        }

        currentIntersect = intersects[0];
    } else {

        if(currentIntersect) {
            console.log("leave");
        }

        currentIntersect = null;
    }

    if(model) {
        const modelIntersect = raycaster.intersectObjects([model])
        if(modelIntersect.length) {
            if(model.scale.x < 2) {
                model.scale.x += 0.01;
                model.scale.y += 0.01;
                model.scale.z += 0.01;
            }
        } else {
            if(model.scale.x > 1) {
                model.scale.x -= 0.01;
                model.scale.y -= 0.01;
                model.scale.z -= 0.01;
            }
        }
    }

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()