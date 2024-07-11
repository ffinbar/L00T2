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
import { chatCompletion, imageCompletion } from './chat.js';
import { Loot } from './loot.js';

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
    fontLoader.load('assets/font/volk.json', function (font) {
        let geometry = new TextGeometry(text, {
            font: font,
            size: 5,
            depth: 2,
            curveSegments: 32,
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

let lootPrompt = 
`
You are L00T. You generate loot items based on user input. You are wildly creative and can generate anything from a simple sword to a complex magical item.
Even mundane or common items can be interesting and unique. You are a master of your craft and can generate items that are both balanced and interesting.
The fields specified by the user must be used to generate the item. User supplied fields must not be imbellished at all. The user can specify the type of item, the rarity, the material(s), the enchantment(s), and the name.
Anything the user does not specify is up to you to decide. You can generate items for any setting, from fantasy to sci-fi to modern day.
The items you create do not have to fit in any specific category, and can be as simple or complex as you like. You can also generate items that are not physical.
You must respond in formatted JSON. The JSON must contain the following fields: name, type, rarity, materials, enchantments, and description.
The name field is a string that represents the name of the item. The type field is a string that represents the type of item. The rarity field is a string that represents the rarity of the item.
The materials field is an object that represents the materials used to create the item. Each material should be a key-value pair, where the key is the name of the material and the value is a string that represents the description of the material. The materials field cannot be empty.
The enchantments field is an object that represents the enchantments on the item.
Each enchantment and material should be a key-value pair, where the key is the name of the enchantment and the value is a string that represents the description of the enchantment. The enchantments field can be empty if the item has no enchantments.
The enchantment descriptions should be at most a few sentences long and should describe the enchantment, its effects, and any other relevant information.
The description field is a string that represents a description of the item. The description should be a few sentences long and should describe the item in detail. Be as concise as possible, but make sure to include all relevant information. The item card is 300px wide, so the information should aim to be compact.
You also should decide on colors for the item. The colors should be based on the rarity of the item. For example, a common item could be gray, an uncommon item could be green, a rare item could be blue, and a legendary item could be orange.
The name will also have a color that is not the same as the rarity color. Avoid overly dark colors, as they may be hard to read.
The JSON should be formatted as follows:
{
  "name": "The Sword of Destiny",
  "nameHex": "#a0fcff",
  "rarity": "legendary",
  "type": "sword",
  "rarityHex": "#FFA500",
  "materials": {
        adamantite: "The blade is forged from the finest adamantite.",
        mithril: "The hilt is crafted from mithril, making it incredibly light and durable."
    },
  "enchantments": {
        fire: "The sword is wreathed in flames, dealing additional fire damage.",
        ice: "The sword is imbued with the power of ice, slowing enemies on hit."
    },
  "stats": {
        damage: "+50 damage per hit.",
        health: "+100 health.",
        nightVision: "Grants night vision."
    },
  "description": "The Sword of Destiny is a legendary sword forged from the finest adamantite and mithril. It is wreathed in flames and imbued with the power of ice, making it a formidable weapon in battle."
}
Try to be as concise as possible in your responses. The user has given you a starting point, and it is up to you to make the item unique and interesting. The end result is presented like a trading card, so text cant be too long.
An item with some user specified fields will be given to you in a seemingly unfinished state. You must use the user specified fields to generate the item, and fill in the missing fields with your own creative ideas.
You must also ensure that the item is balanced and interesting, and that it fits the setting and context provided by the user. You must also ensure that the item is unique and interesting.
An example of a user specified item is as follows:
{
  "name": "The Sword of Destiny",
  "rarity": "",
  "type": "",
  "materials": {},
  "enchantments": {},
  "description": "A legendary sword that is imbued with the power of ice and fire. It is said to be able to cut through anything."   
}
In this example, the user has specified the name and description of the item, but has left the other fields empty. You must use the name and description to generate the item, and fill in the missing fields with your own creative ideas.

Adding new properties:
You can add new properties to the item if you think it will make the item more interesting. For example, you could add a "damage" property to a weapon, or a "healing" property to a potion. As long as they follow JSON formatting, you can add any properties you like. It is encouraged to add new properties to make the item more unique and interesting.
You can also add new properties to the materials and enchantments if you think it will make the item more interesting. For example, you could add a "weight" property to a material, or a "duration" property to an enchantment.
You can also add new properties to the item, materials, and enchantments that are not related to the item itself. For example, you could add a "lore" property to the item, or a "source" property to a material or enchantment.
Do not add properties that are not relevant to the item, such as a "price" property to a magical item in a setting where money is not used. Only add properties that make sense in the context of the item and the setting.
An example of adding new properties to an item is as follows:
{
  "name": "The Sword of Destiny",
  "nameHex": "#a0fcff",
  "rarity": "legendary",
  "type": "sword",
  "rarityHex": "#FFA500",
  "materials": {
        adamantite: "The blade is forged from the finest adamantite.",
        mithril: "The hilt is crafted from mithril, making it incredibly light and durable."
    },
  "enchantments": {
        fire: "The sword is wreathed in flames, dealing additional fire damage.",
        ice: "The sword is imbued with the power of ice, slowing enemies on hit."
    },
  "stats": {
        damage: "The sword deals 50 damage per hit.",
    },
  "bonus": {
        lore: "The sword is said to have been forged by the gods themselves, and is imbued with their power."
    },
    }
  },
  "description": "The Sword of Destiny is a legendary sword forged from the finest adamantite and mithril. It is wreathed in flames and imbued with the power of ice, making it a formidable weapon in battle.",
  "damage": "The sword deals 50 damage per hit.",
  "lore": "The sword is said to have been forged by the gods themselves, and is imbued with their power."
}

Remember to always include nameHex and rarityHex fields in the JSON. These fields should contain the hex color codes for the name and rarity of the item, respectively.
Try to fill every field in the JSON with creative and interesting ideas. The user has given you a starting point, and it is up to you to make the item unique and interesting.
In the description, try not to reiterate information that is already present in the other fields. Instead, focus on adding new information that will make the item more interesting and unique.
`;

function randomCharString(length) {
    let result = '';
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

let apiKey = null;

let item;

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

let shouldGenImg = false;
let itemImg = null;

let textBegin = await createButton('Okay', new THREE.Vector3(0, -1, -3), 0x00dd00, 0.05, async function() {
    let currPage = pages[setupPage];

    lastPage = currPage == pages[(pages.length - 1) - pageOffset] ? true : false;

    console.log(item);

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

        if(text != 'blank' && text != '' && value.id != 'apiKey') {
            item = item ? item : {};
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

        console.log(camera.children)
        setTimeout(function() {
            
            while(camera.children.length > 0) {
                camera.remove(camera.children[0]);
            }

            pageOffset = 0;
        

            for (let i = 0; i < pages.length; i++) {
                pages[i].style.display = 'none';
                
            }
            
            currPage = pages[pages.length - 1];
            currPage.style.display = 'block';
        }, 1000);

        const itemPrompt = item ? JSON.stringify(item) : null;

        const chatObj = {
            model: 'gpt-3.5-turbo',
            messages: [
                { "role": "system", "content": lootPrompt},
                { "role": "user", "content": "New L00T request recieved! The item fields provided are as follows:" },
                { "role": "system", "content": itemPrompt !== null ? itemPrompt : `No details provided. Generate a random unique item. Use the following random characters as a seed: ${randomCharString(Math.floor(Math.random() * 10) + 10)}` }
            ],
            response_format: { "type": "json_object" },
            seed: Math.floor(Math.random() * 1000),
            temperature: 1.4,
        };

        let data = await chatCompletion(chatObj, apiKey);
        console.log(data);
        if(data.error) {
            alert(data.error.message);
            return;
        }
        const response = JSON.parse(data.choices[0].message.content);
        console.log(response);

        if (shouldGenImg) {

            const image = {
                model: 'dall-e-2',
                prompt: `A video game item portrait: ${response.description}. The entire item should be centred in the frame.The image will be 256x256px.`,
                size: "256x256",
                response_format: "b64_json"
            };

            await imageCompletion(image, apiKey).then(data => {
                console.log(data);
                if(data.error) {
                    alert(data.error.message);
                    return;
                }
                response.image = 'data:image/png;base64,' + data.data[0].b64_json;
                localStorage.setItem('item', JSON.stringify(response));
                let lootItem = Loot.createLootItem(response);
                let itemPage = document.getElementsByClassName('itemPage')[0];
                itemPage.appendChild(lootItem);
                colorItems();
                overlay.style.opacity = 1;
                setTimeout(function() {
                    window.location.href = "./view.html";
                }, 1000);
            });
        } else {
            if(itemImg) {
                response.image = itemImg;
            }
            localStorage.setItem('item', JSON.stringify(response));
            let lootItem = Loot.createLootItem(response);
            let itemPage = document.getElementsByClassName('itemPage')[0];
            itemPage.appendChild(lootItem);

            colorItems();
            overlay.style.opacity = 1;
            setTimeout(function() {
                window.location.href = "./view.html";
            }, 1000);
        }

        

        

        // overlay.style.opacity = 1;
        // setTimeout(function() {
        //     window.location.href = "./view.html";
        // }, 1000);

       

        return;

    }

    currPage = pages[setupPage];

    lastPage = currPage == pages[(pages.length - 1) - pageOffset] ? true : false;

    if(currPage.classList.contains('imgPage')) {
        console.log('img page');
        let uploadImg = document.getElementById('uploadImg');
        let genImg = document.getElementById('genImg');
        let noImg = document.getElementById('noImg');
        let imageFileInput = document.getElementById('imageFile');

        genImg.addEventListener('click', async () => {
            shouldGenImg = true;
            itemImg = null;
            genImg.classList.add('active');
            noImg.classList.remove('active');
            uploadImg.classList.remove('active');

        });

        noImg.addEventListener('click', () => {
            shouldGenImg = false;
            itemImg = null;
            noImg.classList.add('active');
            genImg.classList.remove('active');
            uploadImg.classList.remove('active');
        });

        uploadImg.addEventListener('click', () => {
            shouldGenImg = false;
            itemImg = null;

            uploadImg.classList.add('active');
            noImg.classList.remove('active');
            genImg.classList.remove('active');

            imageFileInput.click();

            imageFileInput.addEventListener('change', async () => {
                let file = imageFileInput.files[0];
                let reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = function() {
                    itemImg = reader.result;
                };
            });

        });
    }
    

    for (let i = 0; i < pages.length; i++) {
        pages[i].style.display = 'none';
        if(i == setupPage) {
            pages[i].style.display = 'block';
        }
    }
    
    
});

function colorItems() {
    const items = document.querySelectorAll('.item');

    items.forEach(item => {
        const nameHexElement = item.querySelector('.nameHex');
        const rarityHexElement = item.querySelector('.rarityHex');

        const nameElement = item.querySelector('.name');
        const rarityElement = item.querySelector('.rarity');

        if (nameHexElement && nameElement) {
            nameElement.style.color = nameHexElement.textContent;
        }
        if (rarityHexElement && rarityElement) {
            rarityElement.style.color = rarityHexElement.textContent;
        }
    });
}


let textBack = createButton('Back', new THREE.Vector3(0, -1.8, -3), 0xdd0000, 0.025, function() {
    if(setupPage == 0) {

        let overlay = document.getElementById('fade-overlay');
        overlay.style.opacity = 0;
        console.log('back');

        setTimeout(function() {
            // window.location.href = "./index.html";

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
    if (event.target instanceof HTMLElement && event.target.tagName != 'CANVAS' && event.target.id != 'setupPagesContainer' && event.target.id != 'fade-overlay') {
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


