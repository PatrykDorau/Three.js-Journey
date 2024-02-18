import * as THREE from "three";
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'
import gsap from "gsap";
import * as dat from 'dat.gui';


const canvas = document.querySelector("canvas.webgl");

//Params
const cube1_parameters = {
  color: 0x721ede,
  spin: () => {
    gsap.to(cube1.rotation, {x: cube1.rotation.x + Math.PI * 2, duration: 1})
  }
}

//Textures
  const loadingManager = new THREE.LoadingManager();

  // loadingManager.onStart = () => {
  //   console.log("start")
  // };

  const txLoader= new THREE.TextureLoader(loadingManager);
  const woodTexture = txLoader.load('./assets/images/wood.jpeg' ,() => {
    console.log("Texture image loaded")
  })

  woodTexture.generateMipmaps = false; /* False when using woodTexture.minFilter = THREE.NearestFilter for perfomance*/

  woodTexture.minFilter = THREE.NearestFilter
  woodTexture.magFilter = THREE.NearestFilter


//Cursor
const cursor = {
  x: 0,
  y: 0
}

window.addEventListener("mousemove", (event) => {
  cursor.x = event.clientX / sizes.width - 0.5
  cursor.y = -(event.clientY / sizes.height - 0.5)
})

//Scene
const scene = new THREE.Scene();

//Objects
const group = new THREE.Group();

scene.add(group);
const cube1 = new THREE.Mesh(new THREE.BoxGeometry(1,1,1), new THREE.MeshBasicMaterial({color:cube1_parameters.color}));
const cube2 = new THREE.Mesh(new THREE.BoxGeometry(1,1,1), new THREE.MeshBasicMaterial({map: woodTexture}));

cube2.position.set(1, 1,-2)

group.add(cube1, cube2);

//Camera
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
}

window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  camera.aspect = sizes.width/sizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height)
})

//Not working on safari, needs work around

window.addEventListener("dblclick", () => {
  if(!document.fullscreenElement) {
    canvas.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
})

const camera = new THREE.PerspectiveCamera(75, sizes.width/sizes.height);
const camera1 = new THREE.OrthographicCamera(-1 * sizes.width/sizes.height, 1 * sizes.width/sizes.height, 1, -1, 0.1, 100);
camera.position.set(0,0,3)
camera.lookAt(cube1.position)
scene.add(camera);


//Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;


//Axies helper
const axesHelper = new THREE.AxesHelper(2);
scene.add(axesHelper);

//renderer
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
})

renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.render(scene, camera);

// //Time
const clock = new THREE.Clock();

//Gsap animations
gsap.to(cube2.position, {duration: 1, delay: 0, x: 2})
gsap.to(cube2.position, {duration: 1, delay: 1, x: 1})

// JS Animations
const tick = () => {
  
  const elapsedTime = clock.getElapsedTime();

  //Update position
  cube1.rotation.y = elapsedTime;
  // camera.position.y = cursor.y * 5;
  // camera.position.x = Math.sin(cursor.x * Math.PI * 2) * 3
  // camera.position.z = Math.cos(cursor.x * Math.PI * 2) * 3
  // camera.lookAt(cube1.position)

  controls.update();
  renderer.render(scene, camera);
  window.requestAnimationFrame(tick);
}

tick();


// Debug

const gui = new dat.GUI();
gui.add(cube1.position, 'y', -3, 3, 0.01)
gui.add(cube1.position, 'x').min(-3).max(3).step(0.01)
gui.add(cube2, 'visible');
gui.add(cube1.material, 'wireframe');
gui.addColor(cube1_parameters, 'color').onChange(() => {
  cube1.material.color.set(cube1_parameters.color)
})
gui.add(cube1_parameters, 'spin');
