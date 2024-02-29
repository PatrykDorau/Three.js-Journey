import * as THREE from "three";
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'
import gsap from "gsap";
import * as dat from 'dat.gui';


const canvas = document.querySelector("canvas.webgl");

//Textures
  const loadingManager = new THREE.LoadingManager();

  // loadingManager.onStart = () => {
  //   console.log("start")
  // };

  const txLoader = new THREE.TextureLoader(loadingManager);
  const doorColorTexture = txLoader.load('./assets/images/materials/door/color.jpg' ,() => {
    console.log("Texture image loaded")
  })
  const doorAlphaTexture = txLoader.load('./assets/images/materials/door/alpha.jpg')
  const doorAmbientTexture = txLoader.load('./assets/images/materials/door/ambientOcclusion.jpg')
  const doorHeightTexture = txLoader.load('./assets/images/materials/door/height.jpg')
  const doorMetalnessTexture = txLoader.load('./assets/images/materials/door/metalness.jpg')
  const doorNormalTexture = txLoader.load('./assets/images/materials/door/normal.jpg')
  const doorRoughnessTexture = txLoader.load('./assets/images/materials/door/roughness.jpg')

  const matcapTexture = txLoader.load('./assets/images/materials/5.png');
  const gradientTexture = txLoader.load('./assets/images/materials/3.jpg');
  const gradientTexture1 = txLoader.load('./assets/images/materials/5.jpg');
  gradientTexture.minFilter = THREE.NearestFilter;
  gradientTexture.magFilter = THREE.NearestFilter;
  gradientTexture1.magFilter = THREE.NearestFilter;
  gradientTexture1.minFilter = THREE.NearestFilter;
  gradientTexture1.generateMipmaps = false;

  // woodTexture.generateMipmaps = false; /* False when using woodTexture.minFilter = THREE.NearestFilter for perfomance*/

  // woodTexture.minFilter = THREE.NearestFilter
  // woodTexture.magFilter = THREE.NearestFilter


//Scene
const scene = new THREE.Scene();

//Objects

const material1 = new THREE.MeshBasicMaterial();
const material = new THREE.MeshBasicMaterial({map: doorColorTexture, color: 'white'});
// material.wireframe = true;
// material.opacity = 0.7;
// material.transparent = true;
// material.alphaMap = doorAlphaTexture;
// material.side = THREE.DoubleSide;
const normalMaterial = new THREE.MeshNormalMaterial(); /* for lighting, reflections (idk) */
const matCapMaterial = new THREE.MeshMatcapMaterial({matcap: matcapTexture}); /* for fake lighting, fake reflections */
const meshDepthMaterial = new THREE.MeshDepthMaterial() /* further then darker, closer the lighter */
const meshLambertMaterial = new THREE.MeshLambertMaterial() /* reflects lights, good performance, silly blured lines (?) */
const meshPhongMaterial = new THREE.MeshPhongMaterial() /* reflects lights, worse performance, better look */
meshPhongMaterial.shininess = 10;
meshPhongMaterial.specular = new THREE.Color(0xff0000);
const meshToonMaterial = new THREE.MeshToonMaterial();
meshToonMaterial.gradientMap = gradientTexture1;

/* Beauty doors */
const meshStandardMaterial = new THREE.MeshStandardMaterial(); /* more natural light, physicall based rendering, trying to recreate real light */
meshStandardMaterial.roughness = 1;
meshStandardMaterial.metalness = 0;
meshStandardMaterial.map = doorColorTexture;
meshStandardMaterial.aoMap = doorAmbientTexture;
meshStandardMaterial.aoMapIntensity = 2;
meshStandardMaterial.displacementMap = doorHeightTexture;
meshStandardMaterial.displacementScale = 0.1;
meshStandardMaterial.metalnessMap = doorMetalnessTexture
meshStandardMaterial.roughnessMap = doorRoughnessTexture
meshStandardMaterial.normalMap = doorNormalTexture;
meshStandardMaterial.normalScale.set(0.5, 0.5);
meshStandardMaterial.transparent = true;
meshStandardMaterial.alphaMap = doorAlphaTexture;


const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.5, 64, 64), meshStandardMaterial)
const plane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1, 100, 100), meshStandardMaterial);
const torus = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.2, 64, 128), meshStandardMaterial);

plane.geometry.setAttribute('uv2', new THREE.BufferAttribute(plane.geometry.attributes.uv.array, 2))
sphere.geometry.setAttribute('uv2', new THREE.BufferAttribute(sphere.geometry.attributes.uv.array, 2))
torus.geometry.setAttribute('uv2', new THREE.BufferAttribute(torus.geometry.attributes.uv.array, 2))

sphere.position.x = - 1.5
torus.position.x = 1.5


// const group = new THREE.Group();

// scene.add(group);


// scene.add(sphere, plane)
scene.add(sphere, plane, torus);


// Lights

const light = new THREE.AmbientLight( ); // soft white light
scene.add( light );

const pointLight = new THREE.PointLight(0xffffff, 50 );
pointLight.position.set( 2, 3, 4 );
scene.add( pointLight );

console.log(pointLight)

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
camera.position.set(0,0,3)
scene.add(camera);


//Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;



//renderer
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
})

renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.render(scene, camera);

// JS Animations

const clock = new THREE.Clock();

const tick = () => {

  //Update objects
  const elapsedTime = clock.getElapsedTime();
  torus.rotation.y = 0.2 * elapsedTime;

  controls.update();
  renderer.render(scene, camera);
  window.requestAnimationFrame(tick);
}

tick();


//Gui

const gui = new dat.GUI();
gui.add(meshStandardMaterial, 'metalness').min(0).max(1).step(0.001);
gui.add(meshStandardMaterial, 'roughness').min(0).max(1).step(0.001);
gui.add(meshStandardMaterial, 'displacementScale').min(0).max(1).step(0.001);