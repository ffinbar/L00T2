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


let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
// camera.position.z = 2;
// camera.position.y = 1;

let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();

window.addEventListener('mousemove', function (event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}, false);

let renderer = new THREE.WebGLRenderer();
renderer.setClearColor(0x000000);
renderer.setSize(window.innerWidth, window.innerHeight);

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
outlinePass.edgeGlow = .2;

let itemOutline = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), scene, camera);
composer.addPass(itemOutline);
itemOutline.edgeStrength = 5;
itemOutline.edgeGlow = 1;
itemOutline.visibleEdgeColor = new THREE.Color(0xffaa00);

let camLight = new THREE.PointLight(0xffffff, 20, 1000);
camLight.position.set(camera.position.x, camera.position.y, camera.position.z); 
camera.add(camLight); 
scene.add(camera); 

camera.target = new THREE.Vector3(0, 0, 0);



let time = 0;




// let controls = new OrbitControls(camera, renderer.domElement);
// controls.enablePan = false;

let loader = new GLTFLoader();
let card;

loader.load('assets/cardload.glb', function (gltf) {
    card = gltf.scene;
    card.scale.set(3, 3, 3);
    card.position.set(0, 0, -1);
    card.rotation.set(0, Math.PI /2, 0);
    itemOutline.selectedObjects.push(card);

    card.traverse(function (node) {
        if (node.isMesh) {
            node.renderOrder = 1000;
            if (node.material.type === 'MeshStandardMaterial' || node.material.type === 'MeshPhongMaterial') {
                node.material.emissive = new THREE.Color(0xffffff);
                node.material.emissiveIntensity = .5;
                node.material.emissiveMap = node.material.map;
                node.material.needsUpdate = true; 
            }
        }
    });
    
    // controls.target = card.position;
    scene.add(card);
});



let fontLoader = new FontLoader();
// let textBegin;
// let textBack;

function createButton(text, position, color, scale, onClick) {
    let button;
    fontLoader.load('assets/font/body.json', function (font) {
        let geometry = new TextGeometry(text, {
            font: font,
            size: 5,
            height: 2,
            curveSegments: 0,
            bevelEnabled: false,
        });

        geometry.computeBoundingBox();
        geometry.center();

        let material = new THREE.MeshBasicMaterial({ color: color });
        button = new THREE.Mesh(geometry, material);
        button.originalMaterial = color;

        // let btnLight = new THREE.PointLight(0xffffff, 1, 1000);
        // btnLight.position.set(camera.position.x, camera.position.y, camera.position.z +10);
        // button.add(btnLight);

        // let btnLightHelper = new THREE.Mesh(
        //     new THREE.SphereGeometry(1),
        //     new THREE.MeshBasicMaterial({ color: 0xff0000 })
        // );
        // btnLightHelper.position.copy(btnLight.position);
        // button.add(btnLightHelper);
        
        addClickMesh(button);

        button.position.set(position.x, position.y, position.z);
        button.scale.set(scale, scale, scale);
        
        camera.add(button);

        outlinePass.selectedObjects.push(button);

        buttons.push(button);
        button.onClick = onClick;
        button.button = button;
        button.scaleNormal = new THREE.Vector3(scale, scale, scale);
        button.scaleHover = new THREE.Vector3(scale * 1.1, scale * 1.1, scale * 1.1);
    });

    return button;
}

let item = {
    name: null,

}

let setupPage = 0;
let pages = document.getElementsByClassName('setupPage');
    for (let i = 0; i < pages.length; i++) {
        pages[i].style.display = 'none';
        if(i == setupPage) {
            pages[i].style.display = 'block';
        }
    }


let textBegin = createButton('Okay', new THREE.Vector3(0, -1, -3), 0x00dd00, 0.05, function() {
    let pages = document.getElementsByClassName('setupPage');
    let currPage = pages[setupPage];
    if(currPage.classList.contains('customPage')) {
        let imgPage = Array.from(pages).find(page => page.classList.contains('imgPage'));
        console.log(imgPage);
        let customCheckbox = currPage.querySelector('input[type="checkbox"]');
        if(customCheckbox.checked) {
            setupPage = Array.from(pages).indexOf(imgPage);
        } else {
            setupPage = (setupPage + 1) % pages.length;
        }
        
        
    } else {
    

    setupPage = (setupPage + 1) % pages.length;

    }

    for (let i = 0; i < pages.length; i++) {
        pages[i].style.display = 'none';
        if(i == setupPage) {
            pages[i].style.display = 'block';
        }
    }
    
    
});
let textBack = createButton('Back', new THREE.Vector3(0, -1.8, -3), 0xdd0000, 0.025, function() {
    if(setupPage == 0) {

        let overlay = document.getElementById('fade-overlay');
        overlay.style.opacity = 1;

        setTimeout(function() {
            window.location.href = "./index.html";
        }, 1000);

    } else {

    let pages = document.getElementsByClassName('setupPage');
    let currPage = pages[setupPage];
    let customCheckbox = document.getElementById('customCheckbox');


    if(currPage.classList.contains('imgPage') && customCheckbox.checked) {
        let customPage = Array.from(pages).find(page => page.classList.contains('customPage'));
        setupPage = Array.from(pages).indexOf(customPage);
       
    } else {

    setupPage = (setupPage - 1) % pages.length;
    
    }

    for (let i = 0; i < pages.length; i++) {
        pages[i].style.display = 'none';
        if(i == setupPage) {
            pages[i].style.display = 'block';
        }
    }
    }
    
});

function addClickMesh(target) {
    let box = new THREE.Box3().setFromObject(target);

    let clickgeom = new THREE.BoxGeometry(box.getSize(new THREE.Vector3()).x, box.getSize(new THREE.Vector3()).y, box.getSize(new THREE.Vector3()).z);
    let clickmat = new THREE.MeshBasicMaterial({ visible: false });

    let mesh = new THREE.Mesh(clickgeom, clickmat);

    mesh.position.copy(box.getCenter(new THREE.Vector3()));

    target.add(mesh);
    mesh.button = target;
}



// let scaleHover = new THREE.Vector3(0.06, 0.06, 0.06);
// let scaleNormal = new THREE.Vector3(0.05, 0.05, 0.05);

let clock = new THREE.Clock();

let buttons = [];


function animate() {
    let delta = clock.getDelta();
 

    requestAnimationFrame(animate);
    // controls.update();
    renderer.render(scene, camera);
    let distance = camLight.position.distanceTo(new THREE.Vector3(0, 0, 0));
    raycaster.setFromCamera(mouse, camera);

    for (let i = 0; i < buttons.length; i++) {
        let button = buttons[i];
        if (button) {
            button.lookAt(camera.position);

            let intersects = raycaster.intersectObjects([button], true);
            if (intersects.length > 0) {
                button.scale.lerp(button.scaleHover, 0.1);
            } else {
                button.scale.lerp(button.scaleNormal, 0.1);
            }
        }
    }

    if(card) {
        let distance = camera.position.distanceTo(card.position);
        camLight.intensity = 4 * distance; 
        card.rotation.y += delta /2;
        card.position.y = 2 + Math.sin(time) /4;
        time += .6 * delta;
    }


    composer.render();
}
animate();


window.addEventListener('click', function (event) {
    if (event.target instanceof HTMLElement && event.target.tagName != 'CANVAS') {
        console.log(event.target);
        return;
    }

    raycaster.setFromCamera(mouse, camera);
    
    let intersects = raycaster.intersectObjects(buttons, true);
    if (intersects.length > 0) {
        let clickedObject = intersects[0].object;
        if (clickedObject.button) {
            let clickedButton = clickedObject.button;
            if(clickedButton.onClick != undefined) {
                clickedButton.material.color.set(0xffddaa);
                clickedButton.onClick();
                setTimeout(function() {
                    clickedButton.material.color.set(clickedButton.originalMaterial);
                }, 500);
                
            }
        }
    }
}, false);

window.addEventListener('load', function() {
    let overlay = document.getElementById('fade-overlay');
    overlay.style.opacity = 0;

    camera.position.set(0, 1, 4);
    // shouldLerp = true;
        
});


