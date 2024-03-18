import * as THREE from 'three';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.162.0/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.162.0/examples/jsm/controls/OrbitControls.js';
import { RectAreaLightUniformsLib } from 'https://cdn.jsdelivr.net/npm/three@0.162.0/examples/jsm/lights/RectAreaLightUniformsLib.js';
RectAreaLightUniformsLib.init();
import { RectAreaLightHelper } from 'https://cdn.jsdelivr.net/npm/three@0.162.0/examples/jsm/helpers/RectAreaLightHelper.js';
import { EffectComposer } from 'https://cdn.jsdelivr.net/npm/three@0.162.0/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://cdn.jsdelivr.net/npm/three@0.162.0/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'https://cdn.jsdelivr.net/npm/three@0.162.0/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutlinePass } from 'https://cdn.jsdelivr.net/npm/three@0.162.0/examples/jsm/postprocessing/OutlinePass.js';
import { FontLoader } from 'https://cdn.jsdelivr.net/npm/three@0.162.0/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'https://cdn.jsdelivr.net/npm/three@0.162.0/examples/jsm/geometries/TextGeometry.js';
import { imageEdit } from './chat.js';

let key = ''

async function edit(imgObj, key) {
    
    const result = await imageEdit(imgObj, key);
    console.log(result.data[0].url);
}

function convertImageToRGB(imageUrl) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous'; // This enables CORS
        img.onload = function() {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0, img.width, img.height);
            canvas.toBlob(resolve, 'image/png'); // Convert the canvas to a Blob
        };
        img.onerror = reject;
        img.src = imageUrl;
    });
}

document.getElementById('imageFile').addEventListener('change', function(e) {
    const file = e.target.files[0];
    const imageUrl = URL.createObjectURL(file);
    convertImageToRGB(imageUrl)
        .then(blob => {
            let imgObj = {
                image: blob,
                prompt: 'The title "L00T". an rpg dnd title',
                size: '256x256',
            }
            edit(imgObj, key);
        })
        .catch(console.error);
});

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
// camera.position.z = 2;
// camera.position.y = 1;

var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();

window.addEventListener('mousemove', function (event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}, false);

var renderer = new THREE.WebGLRenderer();
renderer.setClearColor(0x000000);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

var composer = new EffectComposer(renderer);
var renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

var bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
composer.addPass(bloomPass);
bloomPass.radius = 1;
bloomPass.threshold = 1;

var outlinePass = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), scene, camera);
composer.addPass(outlinePass);
outlinePass.edgeStrength = 5;
outlinePass.edgeGlow = 1;

var itemOutline = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), scene, camera);
composer.addPass(itemOutline);
itemOutline.edgeStrength = 5;
itemOutline.edgeGlow = 1;
itemOutline.visibleEdgeColor = new THREE.Color(0xffaa00);

var camLight = new THREE.PointLight(0xffffff, 20, 1000);
camLight.position.set(camera.position.x, camera.position.y, camera.position.z); 
camera.add(camLight); 
scene.add(camera); 

var chest;
var time = 0.0;



var titleArea = new THREE.RectAreaLight(0xffffff, .5, 3, .75);
titleArea.intensity = 3;
titleArea.position.set(0, 1, -5);
titleArea.rotation.set(160, 0, 0);
camera.add(titleArea);




var controls = new OrbitControls(camera, renderer.domElement);
controls.enablePan = false;

var loader = new GLTFLoader();
loader.load('assets/chest/chest.glb', function (gltf) {
    chest = gltf.scene;
    chest.scale.set(2, 2, 2);
    chest.rotation.y = Math.PI / -2;
    scene.add(chest);
    var area = new THREE.RectAreaLight(0xffffff, .5, 1.5, .75);
    area.intensity = 5;
    area.position.set(0, -.1, 0);
    area.rotation.set(Math.PI / 2, 0, Math.PI / -2);
    chest.add(area);
    var areaFlipped = new THREE.RectAreaLight(0xffffff, .5, 1.5, .75);
    areaFlipped.intensity = 3;
    areaFlipped.position.set(0, 0, 0);
    areaFlipped.rotation.set(Math.PI / -2, 0, Math.PI / -2);
    chest.add(areaFlipped);
    // outlinePass.selectedObjects.push(chest);

    // var helper = new RectAreaLightHelper(area);
    // scene.add(helper);
});

loader.load('assets/sworddisp2.glb', function (gltf) {
    var sword = gltf.scene;
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
    var l00t = gltf.scene;
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



var fontLoader = new FontLoader();
var text;

fontLoader.load('assets/font/body.json', function (font) {

    var geometry = new TextGeometry('Begin', {
        font: font,
        size: 5,
        height: 2,
        curveSegments: 0,
        bevelEnabled: false,
    });

    geometry.computeBoundingBox();
    geometry.center();

    var material = new THREE.MeshBasicMaterial({ color: 0x000000 });
    text = new THREE.Mesh(geometry, material);
    
    
    var box = new THREE.Box3().setFromObject(text);

    var clickgeom = new THREE.BoxGeometry(box.getSize(new THREE.Vector3()).x, box.getSize(new THREE.Vector3()).y, box.getSize(new THREE.Vector3()).z);
    var clickmat = new THREE.MeshBasicMaterial({ visible: false });

    var mesh = new THREE.Mesh(clickgeom, clickmat);

    mesh.position.copy(box.getCenter(new THREE.Vector3()));

   

    

    text.add(mesh);
    text.position.set(0, -1, -3);
    text.scale.set(0.05, 0.05, 0.05);
    camera.add(text);

    outlinePass.selectedObjects.push(text);

});

var scaleHover = new THREE.Vector3(0.06, 0.06, 0.06);
var scaleNormal = new THREE.Vector3(0.05, 0.05, 0.05);

var clock = new THREE.Clock();

function animate() {
    var delta = clock.getDelta();
 

    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
    var distance = camLight.position.distanceTo(new THREE.Vector3(0, 0, 0));
    raycaster.setFromCamera(mouse, camera);

    if(text) {
    text.lookAt(camera.position);

    var intersects = raycaster.intersectObjects([text]);
        if (intersects.length > 0) {
            text.scale.lerp(scaleHover, 0.1); 
        } else {
            text.scale.lerp(scaleNormal, 0.1); 
        }
    }
    if (chest) {
        var distance = camera.position.distanceTo(chest.position);
        camLight.intensity = .8 * distance; 
        time += .3 * delta;
        chest.rotation.y = 30 + Math.sin(time) / 2;
    }


    composer.render();
}
animate();


window.addEventListener('click', function () {
    raycaster.setFromCamera(mouse, camera);
    var intersects = raycaster.intersectObjects([text]);
    if (intersects.length > 0) {
        
        text.material.color.set(0xffddaa);
        var overlay = document.getElementById('fade-overlay');
        overlay.style.opacity = 1;
        setTimeout(function () {
            window.location.href = "./setup.html";
        }, 1000);
    }
}, false);

window.addEventListener('load', function() {
    var overlay = document.getElementById('fade-overlay');
    overlay.style.opacity = 0;

    camera.position.set(0, 1, 4);
    // shouldLerp = true;
        
});


