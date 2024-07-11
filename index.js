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

let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();

window.addEventListener('mousemove', function (event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}, false);

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
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.7;
renderer.outputEncoding = THREE.sRGBEncoding;

document.body.appendChild(renderer.domElement);

let composer = new EffectComposer(renderer);
let renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

let bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
composer.addPass(bloomPass);
bloomPass.radius = 1;
bloomPass.threshold = 1;

let outlinePass = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), scene, camera);
composer.addPass(outlinePass);
outlinePass.edgeStrength = 5;
outlinePass.edgeGlow = 1;

let itemOutline = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), scene, camera);
composer.addPass(itemOutline);
itemOutline.edgeStrength = 5;
itemOutline.edgeGlow = 1;
itemOutline.visibleEdgeColor = new THREE.Color(0xffaa00);

let outputPass = new OutputPass();
composer.addPass(outputPass);


let chest;
let time = 0.0;



let titleArea = new THREE.RectAreaLight(0xffffff, .5, 3, .75);
titleArea.intensity = 3;
titleArea.position.set(0, 1, -5);
titleArea.rotation.set(160, 0, 0);
camera.add(titleArea);

let camLight = new THREE.PointLight(0xffffff, 1, 100);
camLight.position.set(0, 0, 0);
camera.add(camLight);
scene.add(camera);


let controls = new OrbitControls(camera, renderer.domElement);
controls.enablePan = false;

let loader = new GLTFLoader();
loader.load('assets/chest/chest.glb', function (gltf) {
    chest = gltf.scene;
    chest.scale.set(2, 2, 2);
    chest.rotation.y = Math.PI / -2;
    scene.add(chest);
    let area = new THREE.RectAreaLight(0xffffff, .5, 1.5, .75);
    area.intensity = 5;
    area.position.set(0, -.1, 0);
    area.rotation.set(Math.PI / 2, 0, Math.PI / -2);
    chest.add(area);
    let areaFlipped = new THREE.RectAreaLight(0xffffff, .5, 1.5, .75);
    areaFlipped.intensity = 3;
    areaFlipped.position.set(0, 0, 0);
    areaFlipped.rotation.set(Math.PI / -2, 0, Math.PI / -2);
    chest.add(areaFlipped);
    // outlinePass.selectedObjects.push(chest);

    // let helper = new RectAreaLightHelper(area);
    // scene.add(helper);
});

loader.load('assets/sworddisp.glb', function (gltf) {
    let sword = gltf.scene;
    sword.scale.set(2, 2, 2);
    sword.rotation.y = Math.PI / -2;
    scene.add(sword);
    itemOutline.selectedObjects.push(sword);
    
    sword.traverse(function (node) {
        if (node.isMesh) {
            node.renderOrder = 1000;
            if (node.material.type === 'MeshStandardMaterial' || node.material.type === 'MeshPhongMaterial') {
                node.material.emissive = new THREE.Color(0xffffff);
                node.material.emissiveIntensity = 1.3;
                node.material.emissiveMap = node.material.map;
            node.material.needsUpdate = true; 
       
            }
        }
    });

});

loader.load('assets/l00t.glb', function (gltf) {
    let l00t = gltf.scene;
    l00t.position.set(0, 1, -5);
    l00t.scale.set(4, 4, 4);
    l00t.rotation.y = Math.PI / -2;
    camera.add(l00t);
    outlinePass.selectedObjects.push(l00t);
    l00t.traverse(function (node) {
        if (node.isMesh) {
            node.renderOrder = 1000;
            if (node.material.type === 'MeshStandardMaterial' || node.material.type === 'MeshPhongMaterial') {
                node.material.emissive = new THREE.Color(0xffffff);
                node.material.emissiveIntensity = 0;
            }
        }
    });
});



let fontLoader = new FontLoader();
let text;

fontLoader.load('assets/font/body.json', function (font) {

    let geometry = new TextGeometry('Begin', {
        font: font,
        size: 5,
        depth: 2,
        curveSegments: 0,
        bevelEnabled: false,
    });

    geometry.computeBoundingBox();
    geometry.center();

    let material = new THREE.MeshBasicMaterial({ color: 0x000000 });
    text = new THREE.Mesh(geometry, material);
    
    
    let box = new THREE.Box3().setFromObject(text);

    let clickgeom = new THREE.BoxGeometry(box.getSize(new THREE.Vector3()).x, box.getSize(new THREE.Vector3()).y, box.getSize(new THREE.Vector3()).z);
    let clickmat = new THREE.MeshBasicMaterial({ visible: false });

    let mesh = new THREE.Mesh(clickgeom, clickmat);

    mesh.position.copy(box.getCenter(new THREE.Vector3()));

   

    

    text.add(mesh);
    text.position.set(0, -1, -3);
    text.scale.set(0.05, 0.05, 0.05);
    camera.add(text);

    outlinePass.selectedObjects.push(text);

});

let scaleHover = new THREE.Vector3(0.06, 0.06, 0.06);
let scaleNormal = new THREE.Vector3(0.05, 0.05, 0.05);

let clock = new THREE.Clock();

function animate() {
    let delta = clock.getDelta();
 

    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
    let distance = camLight.position.distanceTo(new THREE.Vector3(0, 0, 0));
    raycaster.setFromCamera(mouse, camera);

    if(text) {
    text.lookAt(camera.position);

    let intersects = raycaster.intersectObjects([text]);
        if (intersects.length > 0) {
            text.scale.lerp(scaleHover, 0.1); 
        } else {
            text.scale.lerp(scaleNormal, 0.1); 
        }
    }
    if (chest) {
        let distance = camera.position.distanceTo(chest.position);
        camLight.intensity = .8 * distance; 
        time += .3 * delta;
        chest.rotation.y = 30 + Math.sin(time) / 2;
    }


    composer.render();
}
animate();


window.addEventListener('click', function () {
    raycaster.setFromCamera(mouse, camera);
    let intersects = raycaster.intersectObjects([text]);
    if (intersects.length > 0) {
        
        text.material.color.set(0xffffff);
        let overlay = document.getElementById('fade-overlay');
        overlay.style.opacity = 1;
        setTimeout(function () {
            window.location.href = "./setup.html";
        }, 1000);
    }
}, false);

window.addEventListener('load', function() {
    let overlay = document.getElementById('fade-overlay');
    overlay.style.opacity = 0;

    camera.position.set(0, 1, 4);
    // shouldLerp = true;
        
});


