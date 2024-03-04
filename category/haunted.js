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

// Fog

const fog = new THREE.Fog("#262B37", 1, 20)
scene.fog = fog

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()

const doorColorTexture = textureLoader.load("./assets/images/haunted_house/door/color.jpg");
const doorAlphaTexture = textureLoader.load('./assets/images/haunted_house/door/alpha.jpg')
const doorAmbientTexture = textureLoader.load('./assets/images/haunted_house/door/ambientOcclusion.jpg')
const doorHeightTexture = textureLoader.load('./assets/images/haunted_house/door/height.jpg')
const doorMetalnessTexture = textureLoader.load('./assets/images/haunted_house/door/metalness.jpg')
const doorNormalTexture = textureLoader.load('./assets/images/haunted_house/door/normal.jpg')
const doorRoughnessTexture = textureLoader.load('./assets/images/haunted_house/door/roughness.jpg')

const bricksColorTexture = textureLoader.load('./assets/images/haunted_house/bricks/color.jpg')
const bricksAmbientTexture = textureLoader.load('./assets/images/haunted_house/bricks/ambientOcclusion.jpg')
const bricksNormalTexture = textureLoader.load('./assets/images/haunted_house/bricks/normal.jpg')
const bricksRoughnessTexture = textureLoader.load('./assets/images/haunted_house/bricks/color.jpg')

const grassColorTexture = textureLoader.load('./assets/images/haunted_house/grass/color.jpg')
const grassAmbientTexture = textureLoader.load('./assets/images/haunted_house/grass/ambientOcclusion.jpg')
const grassNormalTexture = textureLoader.load('./assets/images/haunted_house/grass/normal.jpg')
const grassRoughnessTexture = textureLoader.load('./assets/images/haunted_house/grass/color.jpg')

grassColorTexture.repeat.set(8, 8)
grassAmbientTexture.repeat.set(8, 8)
grassNormalTexture.repeat.set(8, 8)
grassRoughnessTexture.repeat.set(8, 8)

grassColorTexture.wrapS = THREE.RepeatWrapping;
grassAmbientTexture.wrapS = THREE.RepeatWrapping;
grassNormalTexture.wrapS = THREE.RepeatWrapping;
grassRoughnessTexture.wrapS = THREE.RepeatWrapping;

grassColorTexture.wrapT = THREE.RepeatWrapping;
grassAmbientTexture.wrapT = THREE.RepeatWrapping;
grassNormalTexture.wrapT = THREE.RepeatWrapping;
grassRoughnessTexture.wrapT = THREE.RepeatWrapping;

/**
 * House
 */

const house = new THREE.Group();
scene.add(house);

// Walls

const walls = new THREE.Mesh(new THREE.BoxGeometry(4,3,4), new THREE.MeshStandardMaterial({
    map: bricksColorTexture,
    aoMap: bricksAmbientTexture,
    normalMap: bricksNormalTexture,
    roughnessMap: bricksRoughnessTexture
}));

walls.geometry.setAttribute('uv2', new THREE.Float32BufferAttribute(walls.geometry.attributes.uv.array, 2))
walls.position.y = 3/2
house.add(walls);

const roof = new THREE.Mesh(new THREE.ConeGeometry(3.5,2,4), new THREE.MeshStandardMaterial({color: "#ac8e82"}));
roof.position.y = 4
roof.rotation.y = Math.PI/4
house.add(roof)

//Door
const door = new THREE.Mesh(new THREE.PlaneGeometry(2.2,2.2, 100 ,100), new THREE.MeshStandardMaterial({
    map: doorColorTexture,
    transparent: true,
    alphaMap: doorAlphaTexture,
    aoMap: doorAmbientTexture,
    displacementMap: doorHeightTexture,
    displacementScale: 0.1,
    normalMap: doorNormalTexture,
    metalnessMap: doorMetalnessTexture,
    roughness: doorRoughnessTexture,
}));
door.geometry.setAttribute('uv2', new THREE.Float32BufferAttribute(door.geometry.attributes.uv.array, 2))
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
    grave.castShadow = true;
    grave.rotation.y = Math.random()
    grave.rotation.z = Math.random() * 0.1
    grave.position.set(x, 0.3 ,z);
    graves.add(grave);

}



// Floor
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(70, 70),
    new THREE.MeshStandardMaterial({ map: grassColorTexture, aoMap: grassAmbientTexture, normalMap: grassNormalTexture, roughnessMap: grassRoughnessTexture })
)
floor.geometry.setAttribute('uv2', new THREE.Float32BufferAttribute(floor.geometry.attributes.uv.array, 2))
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

const doorLight = new THREE.PointLight("#ff7d46", 10, 15);
doorLight.position.set(0, 2.7, 3);
house.add(doorLight);


/**
 * Ghosts
 */

const ghost = new THREE.PointLight("#ff00ff", 2 ,3)
const ghost1 = new THREE.PointLight("#ff00ff", 2 ,3)
const ghost2 = new THREE.PointLight("#ff00ff", 2 ,3)

scene.add(ghost, ghost1, ghost2);


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
renderer.setClearColor("#262B37")
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))


/**
 * Shadows
 */

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap

moonLight.castShadow = true;
doorLight.castShadow = true;
ghost.castShadow = true;
ghost1.castShadow = true;
ghost2.castShadow = true;

walls.castShadow = true;
bush.castShadow = true;
bush1.castShadow = true;
bush2.castShadow = true;

floor.receiveShadow = true;

doorLight.shadow.mapSize.width = 256;
doorLight.shadow.mapSize.height = 256;
doorLight.shadow.camera.far = 7;

ghost.shadow.mapSize.width = 256;
ghost.shadow.mapSize.height = 256;
ghost.shadow.camera.far = 7;

ghost1.shadow.mapSize.width = 256;
ghost1.shadow.mapSize.height = 256;
ghost1.shadow.camera.far = 7;

ghost2.shadow.mapSize.width = 256;
ghost2.shadow.mapSize.height = 256;
ghost2.shadow.camera.far = 7;


/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()


    const ghostAngle = elapsedTime * 0.3
    ghost.position.x = Math.cos(ghostAngle) * 4
    ghost.position.z = Math.sin(ghostAngle) * 4
    ghost.position.y = Math.abs(Math.sin(elapsedTime * 0.2))

    const ghostAngle1 = - elapsedTime * 0.22
    ghost1.position.x = Math.cos(ghostAngle1) * 5
    ghost1.position.z = Math.sin(ghostAngle1) * 5
    ghost1.position.y = Math.abs(Math.sin(elapsedTime * 0.2))

    const ghostAngle2 = - elapsedTime * 0.12
    ghost2.position.x = Math.cos(ghostAngle2) * (10 + Math.sin(elapsedTime * 0.32))
    ghost2.position.z = Math.sin(ghostAngle2) * (7 + Math.sin(elapsedTime * 0.4))
    ghost2.position.y = Math.abs(Math.sin(elapsedTime * 0.2))

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()