import * as THREE from 'three';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three/examples/jsm/controls/OrbitControls.js';
import { RectAreaLightUniformsLib } from 'https://cdn.jsdelivr.net/npm/three/examples/jsm/lights/RectAreaLightUniformsLib.js';
RectAreaLightUniformsLib.init();
import { RectAreaLightHelper } from 'https://cdn.jsdelivr.net/npm/three/examples/jsm/helpers/RectAreaLightHelper.js';
import { EffectComposer } from 'https://cdn.jsdelivr.net/npm/three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://cdn.jsdelivr.net/npm/three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'https://cdn.jsdelivr.net/npm/three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutlinePass } from 'https://cdn.jsdelivr.net/npm/three/examples/jsm/postprocessing/OutlinePass.js';
import { FontLoader } from 'https://cdn.jsdelivr.net/npm/three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'https://cdn.jsdelivr.net/npm/three/examples/jsm/geometries/TextGeometry.js';
import { OutputPass } from 'https://cdn.jsdelivr.net/npm/three/examples/jsm/postprocessing/OutputPass.js';
import Stats from 'https://cdn.jsdelivr.net/npm/three/examples/jsm/libs/stats.module.js';

// let stats = new Stats();
// document.body.appendChild(stats.dom);

// import { imageEdit } from './chat.js';

// async function edit(imgObj, key) {
    
//     const result = await imageEdit(imgObj, key);
//     console.log(result.data[0].url);
// }

// function convertImageToRGB(imageUrl) {
//     return new Promise((resolve, reject) => {
//         const img = new Image();
//         img.crossOrigin = 'Anonymous'; // This enables CORS
//         img.onload = function() {
//             const canvas = document.createElement('canvas');
//             const ctx = canvas.getContext('2d');
//             canvas.width = img.width;
//             canvas.height = img.height;
//             ctx.drawImage(img, 0, 0, img.width, img.height);
//             canvas.toBlob(resolve, 'image/png'); // Convert the canvas to a Blob
//         };
//         img.onerror = reject;
//         img.src = imageUrl;
//     });
// }

// document.getElementById('imageFile').addEventListener('change', function(e) {
//     const file = e.target.files[0];
//     const imageUrl = URL.createObjectURL(file);
//     convertImageToRGB(imageUrl)
//         .then(blob => {
//             let imgObj = {
//                 image: blob,
//                 prompt: 'The title "L00T". an rpg dnd title',
//                 size: '256x256',
//             }
//             edit(imgObj, key);
//         })
//         .catch(console.error);
// });

let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

camera.position.set(0, 1, 4);


window.onresize = function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );
};

let renderer = new THREE.WebGLRenderer();
renderer.setClearColor(0x000000);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.5;
renderer.outputEncoding = THREE.sRGBEncoding;

document.body.appendChild(renderer.domElement);

let composer = new EffectComposer(renderer);
let renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

let bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
composer.addPass(bloomPass);
bloomPass.radius = 1;
bloomPass.threshold = 1;
bloomPass.strength = .5;

let outputPass = new OutputPass();
composer.addPass(outputPass);


let chest;
let time = 0.0;



let chestPoint = new THREE.PointLight(0xffffff, 0, 100);
chestPoint.position.set(-.5, .25, .5);
scene.add(chestPoint);

// let titleHelper = new THREE.SpotLightHelper(titleArea);
// scene.add(titleHelper);

let camLight = new THREE.PointLight(0xffffff, 1, 100);
camLight.position.set(0, 0, 0);
camera.add(camLight);
scene.add(camera);


let controls = new OrbitControls(camera, renderer.domElement);
controls.enablePan = false;
controls.enableZoom = false;

let chestDestination = null;
let chestRotation = null;

let loader = new GLTFLoader();
loader.load('assets/chest/chestPerf.glb', function (gltf) {
    chest = gltf.scene;
    chest.scale.set(2, 2, 2);
    chest.rotation.y = Math.PI / -2;
    scene.add(chest);

    chestDestination = chest.position.clone();
    chestRotation = chest.rotation.clone();
    // let area = new THREE.RectAreaLight(0xffffff, .5, 1.5, .75);
    // area.intensity = 5;
    // area.position.set(0, -.1, 0);
    // area.rotation.set(Math.PI / 2, 0, Math.PI / -2);
    // chest.add(area);
    // let areaFlipped = new THREE.RectAreaLight(0xffffff, .5, 1.5, .75);
    // areaFlipped.intensity = 3;
    // areaFlipped.position.set(0, 0, 0);
    // areaFlipped.rotation.set(Math.PI / -2, 0, Math.PI / -2);
    // chest.add(areaFlipped);
    // outlinePass.selectedObjects.push(chest);

    // let helper = new RectAreaLightHelper(area);
    // scene.add(helper);
});

loader.load('assets/sworddisp.glb', function (gltf) {
    let sword = gltf.scene;
    sword.scale.set(2, 2, 2);
    sword.rotation.y = Math.PI / -2;
    scene.add(sword);
    // itemOutline.selectedObjects.push(sword);
    
    sword.traverse(function (node) {
        if (node.isMesh) {
            node.renderOrder = 1000;
            if (node.material.type === 'MeshStandardMaterial' || node.material.type === 'MeshPhongMaterial') {
                node.material.metalness = 1;
                node.material.roughness = .4;
       
            }
        }
    });

});

let l00tLight;
loader.load('assets/l00t.glb', function (gltf) {
    let l00t = gltf.scene;
    l00t.position.set(0, 0.5, -3);
    l00t.scale.set(2.5, 2.5, 2.5);
    l00t.rotation.y = Math.PI / -2;

    l00tLight = new THREE.PointLight(0xffffff, 10, 100);
    l00tLight.position.set(0, 1.5, -1);
    camera.add(l00tLight);

    camera.add(l00t);


    // titleArea.target = l00t;
    // outlinePass.selectedObjects.push(l00t);
    l00t.traverse(function (node) {
        if (node.isMesh) {

            node.renderOrder = 1000;
            if (node.material.type === 'MeshStandardMaterial' || node.material.type === 'MeshPhongMaterial') {
                node.material.metalness = 1;
                node.material.roughness = .4;
            }
        }
    });
});

let clock = new THREE.Clock();




function animate() {
    let delta = clock.getDelta();

    requestAnimationFrame(animate);
    controls.update();

    
    if (chest && l00tLight && chestPoint) {
        let distance = camera.position.distanceTo(chest.position);
        camLight.intensity = .8 * distance; 

        chest.rotation.y = 30 - Math.sin(time) / 2;
        chestPoint.position.x = -(Math.sin(time) /2)*1.2;
        l00tLight.position.x = Math.sin(time/2);
        
        chestPoint.intensity = chestPoint.intensity < 2 ? chestPoint.intensity + .01 : 2;
    }
    time += .3 * delta;

    camera.position.lerp(new THREE.Vector3(0, 1, 4), .005);

    // titleHelper.update();

    composer.render();
}
animate();


