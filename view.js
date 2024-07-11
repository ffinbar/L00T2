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
import { RoundedBoxGeometry } from 'https://cdn.jsdelivr.net/npm/three/examples/jsm/geometries/RoundedBoxGeometry.js';
import Stats from 'https://cdn.jsdelivr.net/npm/three/examples/jsm/libs/stats.module.js';

// let stats = new Stats();
// document.body.appendChild(stats.dom);

let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();
let targetMouse = new THREE.Vector2(null, null);

// Detect touch support
const hasTouchSupport = 'ontouchstart' in window;

// Mousemove event listener (for non-touch devices)
function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

// Touchmove event listener
function onTouchMove(event) {
    if(event.touches.length > 1) return;
    if(event.touches.length === 1) {
        event.preventDefault();
        let touch = event.touches[0];
        targetMouse.x = (touch.clientX / window.innerWidth) * 2 - 1;
        targetMouse.y = -(touch.clientY / window.innerHeight) * 2 + 1;
    }
}

// Conditionally add event listeners
if (!hasTouchSupport) {
    // Add mousemove listener if no touch support
    window.addEventListener('mousemove', onMouseMove, false);
} else {
    // Add touchmove listener if touch support is detected
    window.addEventListener('touchmove', onTouchMove, { passive: false });
}

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
bloomPass.radius = .5;
bloomPass.threshold = 2;
bloomPass.strength = 1;

let outlinePass = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), scene, camera);
composer.addPass(outlinePass);
outlinePass.edgeStrength = 5;
outlinePass.edgeGlow = 5;
outlinePass.edgeThickness = 10;
outlinePass.resolution.set(window.innerWidth/2, window.innerHeight/2);

let outputPass = new OutputPass();
composer.addPass(outputPass);

let item = JSON.parse(localStorage.getItem('item'));
// let item = {
//     "name": "Arcane Talisman of the Eternal Forest",
//     "nameHex": "#89cff0",
//     "rarity": "rare",
//     "type": "talisman",
//     "rarityHex": "#0075E2",
//     "materials": {
//         "ancient wood": "Carved from the heart of an ancient tree, the talisman holds the essence of the Eternal Forest.",
//         "emerald": "Embedded with a shimmering emerald that glows with nature's energy."
//     },
//     "enchantments": {
//         "nature's embrace": "The talisman enhances the wearer's connection to nature, granting them heightened senses and the ability to communicate with forest creatures.",
//         "rejuvenation": "Provides a passive healing effect to the wearer, gradually restoring their vitality over time."
//     },
//     "description": "The Arcane Talisman of the Eternal Forest is a rare talisman crafted from ancient wood infused with the essence of the Eternal Forest. It is adorned with a radiant emerald that pulsates with nature's energy. The talisman enhances the wearer's connection to nature, granting heightened senses and the ability to communicate with forest creatures. Additionally, it provides a passive healing effect, allowing the wearer to gradually restore their vitality over time."
// };
console.log(item);

let controls = new OrbitControls(camera, renderer.domElement);
controls.enablePan = false;
controls.enableRotate = false;
controls.enableZoom = true;

scene.add(camera); 

let camLight = new THREE.PointLight(0xffffff, 5, 100);
camLight.position.set(0, 0, 0);
camLight.castShadow = true;

// camera.add(camLight);

// let titleArea = new THREE.RectAreaLight(0xffffff, .5, 1, 2);
// titleArea.intensity = 3;
// titleArea.position.set(0, 0, 1);
// titleArea.rotation.set(0, 0, 0);
// scene.add(titleArea);

let backLight = new THREE.PointLight(0xffffff, 10, 100);
backLight.castShadow = true;
// backLight.intensity = 4;
backLight.position.set(2, 2, -2);
backLight.lookAt(0, 0, 0);
// scene.add(backLight);

let backLight2 = new THREE.SpotLight(0xffffff, 5, 10, 10, 0, 1);
backLight2.castShadow = true;
// backLight2.intensity = 4;
backLight2.position.set(-2, -2, -2);
backLight2.lookAt(0, 0, 0);
// scene.add(backLight2);

let backLight3 = new THREE.SpotLight(0xffffff, 5, 10, 10, 0, 1);
backLight3.castShadow = true;
// backLight3.intensity = 4;
backLight3.position.set(0, 0, -2);
backLight3.lookAt(0, 0, 0);
// scene.add(backLight3);


let sideLight = new THREE.SpotLight(0xffffff, 5, 10, 10, 0, 1);
sideLight.castShadow = true;
// sideLight.intensity = 4;
sideLight.position.set(1, -2, 3 );
sideLight.rotation.set(0, -Math.PI / 2, 0);
sideLight.lookAt(0, 0, 0);
scene.add(sideLight);

let sideLight2 = new THREE.SpotLight(0xffffff, 5, 10, 15, 0, 1);
sideLight2.castShadow = true;
// sideLight2.intensity = 4;
sideLight2.position.set(-2, 2, 2);
sideLight2.rotation.set(0, -Math.PI / 2, 0);
sideLight2.lookAt(0, 0, 0);
scene.add(sideLight2);

let point1 = new THREE.PointLight(0xffffff, 10, 100);
point1.position.set(2, 2, 1.5);
scene.add(point1);

let point2 = new THREE.PointLight(0xffffff, 10, 100);
point2.position.set(-2, -2, 1.5);
scene.add(point2);

// let areaHelper = new RectAreaLightHelper(titleArea);
let backHelper = new THREE.SpotLightHelper(backLight2);
let sideHelper = new THREE.SpotLightHelper(sideLight);
let sideHelper2 = new THREE.SpotLightHelper(sideLight2);
// scene.add(sideHelper2);
// scene.add(sideHelper);

let point1Helper = new THREE.PointLightHelper(point1);
// scene.add(point1Helper);

// scene.add(backHelper);
// scene.add(areaHelper);

camera.position.z = 6;
// camera.position.x = 6;
// camera.lookAt(0, 0, 0);

let loader = new GLTFLoader();
let l00t = null;


async function createCard() {

    let card = new THREE.Group();

    card.content = await loadCardContent(card, item);
    console.log(item.imageObj);
    card.add(card.content);

    // let cardHeight = card.contentSize.y;

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    canvas.width = 256;
    canvas.height = 256;

    let gradient = context.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, item.rarityHex);
    gradient.addColorStop(0.5, item.nameHex);
    gradient.addColorStop(1, item.rarityHex);

    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);

    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;

    let material = new THREE.MeshStandardMaterial({ map: texture });

    let cardGeom = new RoundedBoxGeometry(card.content.contentSize.x + 0.4, card.content.contentSize.y + 0.4, .1, 2, 1);
    let cardBackground = new THREE.Mesh(cardGeom, material);
    cardBackground.receiveShadow = true;
    cardBackground.castShadow = false;

    let borderMaterial = new THREE.MeshStandardMaterial({
        color: item.rarityHex,
        metalness: 1,
        roughness: 0.4,
    });
    // Create a slightly larger geometry for the border
    let borderGeom = new RoundedBoxGeometry(card.content.contentSize.x + 0.6, card.content.contentSize.y + 0.6, .01, 2, 1); // Slightly larger and thicker
    let border = new THREE.Mesh(borderGeom, borderMaterial);
    border.castShadow = false;
    border.receiveShadow = true;
    border.position.z = -0.05;

    let backsideBackground = new THREE.Mesh(cardGeom, new THREE.MeshStandardMaterial({ color: 0x5f1e24, metalness: 1, roughness: 0.6 }));
    backsideBackground.position.z = -0.01;

    let backgroundGroup = new THREE.Group();
    backgroundGroup.add(cardBackground);
    backgroundGroup.add(border);
    backgroundGroup.add(backsideBackground);
    card.add(backgroundGroup);

    
    // cardBackground.position.set(card.content.contentCenter.x, card.content.contentCenter.y, 0);
    // border.position.set(card.content.contentCenter.x, card.content.contentCenter.y, -.05);

    card.background = backgroundGroup;

    // outlinePass.selectedObjects.push(border);
    // outlinePass.visibleEdgeColor = new THREE.Color(item.rarityHex);

    loader.load('assets/loothdPerf3.glb', function (gltf) {
        l00t = gltf.scene;
        l00t.position.set(0, 0, -.15);
        l00t.scale.set(card.content.contentSize.x/4, card.content.contentSize.x*.7, card.content.contentSize.x*.7);
        l00t.rotation.y = Math.PI / 2;
        card.background.add(l00t);
        l00t.traverse(function (node) {
            node.castShadow = true;
            node.receiveShadow = false;
            node.renderOrder = 1000;
            console.log(node);
            if (node.isMesh) {
                if (node.material.type === 'MeshStandardMaterial' || node.material.type === 'MeshPhongMaterial') {
                    node.material.metalness = 0.8;
                    node.material.roughness = 0.4;
                    
                }
            }
        });
        
    });

    // Assuming 'card' is your card object and 'camera' is your Three.js camera

    // Step 1 & 2: Calculate the card's bounding box
    const cardBoundingBox = new THREE.Box3().setFromObject(card);

    // Step 3: Get the camera's frustum
    const frustum = new THREE.Frustum();
    const cameraViewProjectionMatrix = new THREE.Matrix4();

    // Step 4: Update the frustum with the camera's current view projection matrix
    cameraViewProjectionMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    frustum.setFromProjectionMatrix(cameraViewProjectionMatrix);

    // Step 5 & 6: Check if the bounding box intersects with the frustum
    if (!frustum.intersectsBox(cardBoundingBox)) {
        console.log("The card is extending outside the bounds of the camera.");
    } else {
        console.log("The card is within the bounds of the camera.");
    }

    return card;
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function capitalizeWords(str) {
    return str.split(' ').map(capitalize).join(' ');
}


let fontLoader = new FontLoader();
let font = await fontLoader.load('assets/font/volk.json');


async function loadCardContent(card, item) {
    return new Promise((resolve, reject) => {
        let content = new THREE.Group();
        let contentMaterial = new THREE.MeshStandardMaterial({ color: 0x000000, metalness: 1, roughness: 0.5 });
        let yOffset = 1.3; // Initial Y offset for text placement
        let maxWidth = item.image ? 4 : 3;
        let size = 0.1;
        let colour = 0x000000;
        let lh = 0.1;

        // we need these keys to be in a specific order
        // all other keys will be added in the order they appear in the object
        const orderedKeys = ['name', 'image', 'rarity', 'type'];

        item = Object.keys(item)
            .sort((a, b) => {
                const indexA = orderedKeys.indexOf(a);
                const indexB = orderedKeys.indexOf(b);
                if (indexA === -1 && indexB === -1) return 0; // Both keys are not in orderedKeys, keep their order
                if (indexA === -1) return 1; // a is not in orderedKeys, sort b before a
                if (indexB === -1) return -1; // b is not in orderedKeys, sort a before b
                return indexA - indexB; // Both keys are in orderedKeys, sort by their order in orderedKeys
            })
            .reduce((obj, key) => {
                obj[key] = item[key];
                return obj;
            }, {});

        console.log(item);


        fontLoader.load('assets/font/volk.json', function (font) {
            Object.entries(item).forEach(([key, value], index) => {
                console.log(key);
                if (typeof value === 'object') {
                    // If the value is an object, iterate over its properties
                    Object.entries(value).forEach(([innerKey, innerValue]) => {
                        
                        let textLines = wrapText(`${capitalize(innerValue)}`, font, 0.1, maxWidth);
                        textLines.forEach((line, i) => {
                            buildText(line, 0x000000, content, yOffset, index, i, font, 0.1);
                        });
                        yOffset -= 0.2 * textLines.length; // Adjust Y offset for the next item
                    });
                } else {
                    if(key === 'nameHex' || key === 'rarityHex') {
                        yOffset += 0.2; // Skip the name and rarity
                        return;
                    }
                    let skip = false;
                    switch(key) {
                        case 'name':
                            size = 0.2;
                            colour = item.nameHex;
                            skip = false;
                            break;
                        case 'rarity':
                            size = 0.15;
                            colour = item.rarityHex;
                            value = `${capitalize(value)} ${capitalizeWords(item.type)}`;
                            skip = false;
                        break;
                        case 'type':
                            skip = true;
                            yOffset += 0.2;
                            break;
                        case 'image':
                            skip = true;
                            console.log(yOffset);
                            let imgHeight = createImagePlane(value, content, yOffset, index);
                            yOffset -= 2.8;
                            console.log('imgHeight:', imgHeight);
                            break;
                        default:
                            size = 0.1;
                            colour = 0x000000;
                            skip = false;
                    }   
                    if(!skip) {
                        let textLines = wrapText(`${capitalize(value)}`, font, size, maxWidth);
                        textLines.forEach((line, i) => {
                            buildText(line, colour, content, yOffset, index, i, font, size, lh);
                        });
                        yOffset -= .2 * textLines.length; // Adjust Y offset for the next item
                    }
                }
            });

            console.log(content);
            content.updateMatrixWorld(true); // Force update of the world matrix


            const contentBoundingBox = new THREE.Box3().setFromObject(content);
            const contentSize = contentBoundingBox.getSize(new THREE.Vector3());
            const contentCenter = contentBoundingBox.getCenter(new THREE.Vector3());
            
            console.log(contentSize, contentCenter);
            content.contentSize = contentSize;
            content.contentCenter = contentCenter;

            content.position.set(-contentCenter.x, -contentCenter.y, 0);

            resolve(content);
        });
        
    
    });
    
}

function buildText(text, colour, content, yOffset, index, lineIndex, font, size = 0.1, lh = 0.1) {
    let textGeom = new TextGeometry(text, {
        font: font,
        size: size,
        depth: 0.02,
        curveSegments: 1,
        bevelEnabled: false,
    });
    let baseLineHeight = lh;
    let lineHeight = baseLineHeight + size;
    let material = new THREE.MeshStandardMaterial({ color: colour, metalness: .5, roughness: 0.5 });
    let textMesh = new THREE.Mesh(textGeom, material);
    textMesh.castShadow = true;
    textMesh.position.set(-0.9, yOffset - (index * lineHeight) - (lineIndex * lineHeight), .05); // Adjust position as needed
    content.add(textMesh);
}

function wrapText(text, font, size, maxWidth) {
    let words = text.split(' ');
    let lines = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
        let word = words[i];
        let lineTest = currentLine + ' ' + word;
        let metrics = measureText(lineTest, font, size);
        if (metrics.width <= maxWidth) {
            currentLine = lineTest;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    }
    lines.push(currentLine); // Add the last line

    return lines;
}

function measureText(text, font, size) {
    // Simplified text width calculation (you might need a more accurate method)
    let textGeom = new TextGeometry(text, {
        font: font,
        size: size,
        depth: 0,
        curveSegments: 12
    });
    textGeom.computeBoundingBox();
    let width = textGeom.boundingBox.max.x - textGeom.boundingBox.min.x;
    return { width };
}

function createImagePlane(src, content, yOffset, index) {
    let img = new Image();
    img.src = src;
    let imgWidth = 1;
    let imgHeight = 1;
    img.onload = function() {
        imgWidth = 3;
        imgHeight = 3;
        let imgPlane = new THREE.BoxGeometry(imgWidth, imgHeight, 0.01);
        let imgTexture = new THREE.TextureLoader().load(src);
        let imgMaterial = new THREE.MeshBasicMaterial({ map: imgTexture, transparent: true });
        let imgMesh = new THREE.Mesh(imgPlane, imgMaterial);
        let cardCenter = content.contentCenter;
        imgMesh.position.set(cardCenter.x, yOffset - imgHeight/2, 0.05);
        content.add(imgMesh);
    };
    return imgWidth;
}

let card = await createCard();

scene.add(card);

let cardFlip = true;

let flip = document.getElementById('flip');
flip.addEventListener('click', function() {
    cardFlip = !cardFlip;
});




let buttons = [];

async function createButton(text, position, color, scale, onClick) {
    let button;
    fontLoader.load('assets/font/volk.json', function (font) {
        let geometry = new TextGeometry(text, {
            font: font,
            size: 3,
            depth: .5,
            curveSegments: 12,
            bevelEnabled: true,
            bevelThickness: 0.2,
            bevelSize: 0.3,
        });

        geometry.computeBoundingBox();
        geometry.center();

        let material = new THREE.MeshStandardMaterial({ color: color, metalness: 1, roughness: 0.5});
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
        
        // addClickMesh(button);

        button.position.set(position.x, position.y, position.z);
        button.scale.set(scale, scale, scale);
        
        scene.add(button);

        // outlinePass.selectedObjects.push(button);

        buttons.push(button);
        button.onClick = onClick;
        button.button = button;
        button.scaleNormal = new THREE.Vector3(scale, scale, scale);
        button.scaleHover = new THREE.Vector3(scale * 1.1, scale * 1.1, scale * 1.1);
    });

    return button;
}


let camRestPos = new THREE.Vector3(0, 0, 4);
let lerpFactor = 0.05;

// window.addEventListener('load', function() {
    let overlay = document.getElementById('fade-overlay');
    overlay.style.opacity = 0;
        
// });

let time = 0.0;
let clock = new THREE.Clock();

function animate() {
    let delta = clock.getDelta();
    time += delta;
    // stats.update();


    requestAnimationFrame(animate);

    if(card && l00t) {
        // Apply scale to card.background
        // let scale = 1 + Math.sin(time) * 1;
        // card.background.scale.y = scale;
        // card.position.set(0, 0, 0);
    }

    // pan the camera slightly by moving the mouse
    if(camera && mouse && card) {
        if(targetMouse.x !== null || targetMouse.y !== null) {
            // interpolate the mouse position
            mouse.lerp(targetMouse, 0.05);

        }
        // camera.position.x.lerp(mouse.x * 2, lerpFactor);
        // camera.position.y.lerp(mouse.y * 2, lerpFactor);
        const targetPosition = new THREE.Vector3(mouse.x * 2, mouse.y*2, camera.position.z);
        scrollY *= 0.5;
        camera.position.lerp(targetPosition, lerpFactor);

        const targetEuler = new THREE.Euler(mouse.y /4, cardFlip ? -mouse.x /4 : Math.PI - mouse.x /4, 0, 'XYZ');
        const targetQuaternion = new THREE.Quaternion().setFromEuler(targetEuler);
        
        card.quaternion.slerp(targetQuaternion, lerpFactor);

        camera.lookAt(new THREE.Vector3(mouse.x*2, mouse.y*2, 0));

        

    }
    

    // camera.position.lerp(camRestPos, lerpFactor);

    composer.render();
    controls.update();
    // renderer.render(scene, camera);
}
animate();