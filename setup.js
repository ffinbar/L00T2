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
import { chatCompletion } from './chat.js';

let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
// camera.position.z = 2;
// camera.position.y = 1;

window.onresize = function () {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

};

let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();

window.addEventListener('mousemove', function (event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}, false);

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
outlinePass.edgeGlow = .2;

let outputPass = new OutputPass();
composer.addPass(outputPass);


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

let genChoice = document.getElementById('genChoice');


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

async function createButton(text, position, color, scale, onClick) {
    let button;
    fontLoader.load('assets/font/body.json', function (font) {
        let geometry = new TextGeometry(text, {
            font: font,
            size: 5,
            depth: 2,
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

let apiKey = null;

let item = {
    name: 'null',
    type: 'null',
    rarity: 'null',
    description: 'null',
}

let setupPage = 0;
let pages = document.getElementsByClassName('setupPage');
for (let i = 0; i < pages.length; i++) {
    pages[i].style.display = 'none';
    if(i == setupPage) {
        pages[i].style.display = 'block';
    }
}
let lastPage = false;
let pageOffset = 1;


let textBegin = await createButton('Okay', new THREE.Vector3(0, -1, -3), 0x00dd00, 0.05, async function() {
    let currPage = pages[setupPage];

    lastPage = currPage == pages[(pages.length - 1) - pageOffset] ? true : false;

    if(currPage.classList.contains('keyPage')) {
        let apiKeyInput = document.getElementById('apiKeyInput');
        let key = apiKeyInput.value;

        if(key === undefined || key === null || key.trim() === '') {
            console.log('Key is blank or undefined');
            apiKeyInput.style.boxShadow = 'inset 0px 0px 0px 2px red';
            apiKeyInput.placeholder = 'Please enter a valid key';
            return;
        } else {
            console.log('Key:', key);
            apiKeyInput.style.boxShadow = 'none';
            apiKeyInput.placeholder = 'API Key';
            apiKey = key;
        }

    }

    if(currPage.classList.contains('customPage')) {
        let imgPage = Array.from(pages).find(page => page.classList.contains('imgPage'));
        console.log(imgPage);
        let currGenChoice = genChoice.value;
        if(currGenChoice == 'random') {
            setupPage = Array.from(pages).indexOf(imgPage);
            console.log(item);
        } else {
            setupPage = (setupPage + 1) % (pages.length -pageOffset);
        }
        
        
    } else {
    

        setupPage = (setupPage + 1) % (pages.length -pageOffset);

    }

    if(currPage.querySelector('input')) {
        let text = currPage.querySelector('input[type="text"]') ? currPage.querySelector('input[type="text"]').value : "blank";
        let value = currPage.querySelector('input[type="hidden"]');

        if(text != 'blank' && value.id != 'apiKey') {
            if(text == '') {
                text = 'null';
            }

            value.setAttribute('value', text);
            let key = value.id;
            item[key] = text;
            console.log(text, item);
        }


    }

    console.log(currPage);

    if(lastPage) {
        console.log('last page');
        let overlay = document.getElementById('fade-overlay');
        overlay.style.opacity = 1;
        setTimeout(function() {
            overlay.style.opacity = 0;
        }, 5000);
        let body = {
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'user',
                    content: `You are setting up a new item for the game. Your response will be in JSON formatting. You can only use the following fields. It must exactly match the following:
                    {
                        "name": "Excalibur",
                        "type": "Sword",
                        "rarity": "Legendary",
                        "description": "A legendary sword that was once wielded by King Arthur."
                    }`
                },
                {
                    role: 'system',
                    content: 'If any of the fields are listed as "null", it is your responsibility to fill in the missing information with a creative and appropriate response. Your response should be the finished item, with no fields listed as "null". Think of an entirely new item. It can be anything, from a sword to a potion to a slice of pizza.'
                },
                {
                    role: 'user',
                    content: `{
                        "name": "Rock",
                        "type": "null",
                        "rarity": "Common",
                        "description": "null"
                    }`
                },
                {
                    role: 'assistant',
                    content: `
                    {
                        "name": "Rock",
                        "type": "Object",
                        "rarity": "Common",
                        "description": "A simple yet sturdy rock found in the wild."
                    }
                    `
                },
                {
                    role: 'user',
                    content: 'The item is a ' + item.name + ' and is of type ' + item.type + '. The item is ' + item.rarity + ' and is described as ' + item.description + '. Do not leave any fields as "null".'
                }
            ],
            response_format: { "type": "json_object" },
            temperature: 1.3,
            seed: Math.floor(Math.random() * 1000),
        };
        // let completion = await chatCompletion(body, apiKey);
        // console.log(completion.choices[0].message.content);
        // let response = JSON.parse(completion.choices[0].message.content);
        // console.log(response);
        overlay.style.opacity = 0;
        pageOffset = 0;
        

        for (let i = 0; i < pages.length; i++) {
            pages[i].style.display = 'none';
            
        }
        pages = document.getElementsByClassName('itemPage');
        
        setupPage = 0;
        currPage = pages[setupPage];
        currPage.style.display = 'block';

        return;

    }

    currPage = pages[setupPage];

    lastPage = currPage == pages[(pages.length - 1) - pageOffset] ? true : false;

    
    

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
    


    if(currPage.classList.contains('imgPage') && genChoice.value == 'random') {
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


