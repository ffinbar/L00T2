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
import { chatCompletion, imageCompletion, imageViewBase64 } from './chat.js';
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
bloomPass.strength = .5;

// let outlinePass = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), scene, camera);
// composer.addPass(outlinePass);
// outlinePass.edgeStrength = 5;
// outlinePass.edgeGlow = .2;

let outputPass = new OutputPass();
composer.addPass(outputPass);


// let itemOutline = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), scene, camera);
// composer.addPass(itemOutline);
// itemOutline.edgeStrength = 5;
// itemOutline.edgeGlow = 1;
// itemOutline.visibleEdgeColor = new THREE.Color(0xffaa00);

let camLight = new THREE.PointLight(0xffffff, 0, 1000);
camLight.position.set(camera.position.x, camera.position.y, camera.position.z); 
camera.add(camLight); 
scene.add(camera); 

camera.position.set(0, 1, 2);

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
    // itemOutline.selectedObjects.push(card);

    card.traverse(function (node) {
        if (node.isMesh) {
            node.renderOrder = 1000;
            if (node.material.type === 'MeshStandardMaterial' || node.material.type === 'MeshPhongMaterial') {
                node.material.metalness = 1;
                node.material.roughness = 0.5;
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

// let lootPrompt = 
// `
// You are L00T. You generate loot items based on user input. You are wildly creative and can generate anything from a simple sword to a complex magical item.
// Even mundane or common items can be interesting and unique. You are a master of your craft and can generate items that are both balanced and interesting.
// The fields specified by the user must be used to generate the item. User supplied fields must not be embellished at all. The user can specify the type of item, the rarity, and the name.
// Anything the user does not specify is up to you to decide. You can generate items for any setting, from fantasy to sci-fi to modern day.
// The items you create do not have to fit in any specific category, and can be as simple or complex as you like. You can also generate items that are not physical.
// You must respond in formatted JSON. The JSON must contain the following fields: name, type, rarity, and description.
// The name field is a string that represents the name of the item. The type field is a string that represents the type of item. The rarity field is a string that represents the rarity of the item.
// The materials field is an object that represents the materials used to create the item. Each material should be a key-value pair, where the key is the name of the material and the value is a string that represents the description of the material.
// The enchantments field is an object that represents the enchantments on the item.
// Each enchantment and material should be a key-value pair, where the key is the name of the enchantment and the value is a string that represents the description of the enchantment. The enchantments field can be empty if the item has no enchantments.
// The enchantment descriptions should be at most a few sentences long and should describe the enchantment, its effects, and any other relevant information.
// The description field is a string that represents a description of the item. The description should be a few sentences long and should describe the item in detail. Be as concise as possible, but make sure to include all relevant information. The item card is 300px wide, so the information should aim to be compact.
// You also should decide on colors for the item. The colors should be based on the rarity of the item. For example, a common item could be gray, an uncommon item could be green, a rare item could be blue, and a legendary item could be orange.
// The name will also have a color that is not the same as the rarity color. Avoid overly dark colors, as they may be hard to read. There will only ever by the nameHex and rarityHex. They must be valid hexadecimal color codes.
// The JSON should be formatted as follows:
// {
//   "name": "The Sword of Destiny",
//   "nameHex": "#a0fcff",
//   "rarity": "legendary",
//   "type": "sword",
//   "rarityHex": "#FFA500",
//   "materials": {
//         adamantite: "The blade is forged from the finest adamantite.",
//         mithril: "The hilt is crafted from mithril, making it incredibly light and durable."
//     },
//   "enchantments": {
//         fire: "The sword is wreathed in flames, dealing additional fire damage.",
//         ice: "The sword is imbued with the power of ice, slowing enemies on hit."
//     },
//   "description": "The Sword of Destiny is a legendary sword forged from the finest adamantite and mithril. It is wreathed in flames and imbued with the power of ice, making it a formidable weapon in battle."
// }
// Try to be as concise as possible in your responses. The user has given you a starting point, and it is up to you to make the item unique and interesting. The end result is presented like a trading card, so text cant be too long.
// An item with some user specified fields will be given to you in a seemingly unfinished state. You must use the user specified fields to generate the item, and fill in the missing fields with your own creative ideas.

// An example of a user specified item is as follows:
// {
//   "name": "The Sword of Destiny",
//   "description": "A legendary sword that is imbued with the power of ice and fire. It is said to be able to cut through anything."   
// }
// In this example, the user has specified the name and description of the item, but has left the other fields empty. You must use the name and description to generate the item, and fill in the missing fields with your own creative ideas. It is imperative that you do not modify the original fields submitted by the user. They don’t want some wildly different item to what they put in. Even if the user input is simplistic or boring, like “A Stick” or “A Mug”, do not rewrite the item. If they input an item with a name like “Coffee Cup” but the rarity was “Legendary” or something, maybe then you can take artistic license to envision a legendary coffee cup. But a common coffee cup? Is just a coffee cup.

// Do not add properties that are not relevant to the item, such as a "price" property to a magical item in a setting where money is not used. Only add properties that make sense in the context of the item and the setting.

// Remember to always include nameHex and rarityHex fields in the JSON. These fields should contain the hex color codes for the name and rarity of the item, respectively.

// In the description, try not to reiterate information that is already present in the other fields. Instead, focus on adding new information.

// If any of the item fields contain a string of numbers prefixed by a $, this is a signal to turn the numbers into legible text and use that text to generate the item. For example, if the name field contains "$0135872348772", you should turn that into a legible name, such as "Xyla's Blade of the Forest".
// These numbers are a system to prevent sameness and probabilistic outputs by you. If you use the random numbers to diffuse your response, it should be slightly more interesting than if you hadn’t. That’s the theory.
// An example user input could be:

// {
//     "name": "$0135872348772",
//     "rarity": "legendary",
//     "type": "sword",
//     "description": "A sword"
// }

// In this example, the name field contains a random string of numbers. Your response should be something like:

// {
//     "name": "Xyla's Blade of the Forest",
//     "rarity": "legendary",
//     "type": "sword",
//     "description": "A sword"
// }

// We leave all other fields intact.
// This way we are ensured to get a unique item every time. Remember to only do this to random strings of numbers with a $ prefix, and not to any other input.

// It is extremely important that you do not rewrite the user's input strings. The only exception is if they are random numbers, prefixed by a $. Even a nonsensical, simplistic or boring string should remain intact. Even if the user puts "iPhone" or "Coca-Cola" in the input, you should leave them as is. The user's input is sacred and should not be altered in any way.
// The rewriting will only occur if the input is a string of exclusively numbers prefixed by $. If the input is anything else, you should not rewrite it.

// Example:

// {
//     "name": "iPhone",
//     "rarity": "Common",
//     "type": "Phone",
//     "description": ""
// }

// In this example, the name field contains no numbers, and the description is blank. You can create a new description, and leave everything else. Your response should be:

// {
//     "name": "iPhone",
//     "rarity": "Common",
//     "type": "Phone",
//     "description": "A phone"
// }

// Understand? input string is $ + random numbers = you can rewrite it. input string is anything else = you can't rewrite it.
// The user can input real items, copyrighted items, or anything else they want. You must not alter the user's input in any way.

// End of instructions.
// `;

let lootPrompt = `
You are L00T, an expert in generating unique loot items based on user input. Given the user-specified type, rarity, and name, generate the item, ensuring not to alter these fields.

For fields not specified by the user, use your creativity. Items can span any setting and complexity. The response should be formatted as JSON:

{
  "name": "The item's name",
  "nameHex": "#HexValue",
  "rarity": "rarity level",
  "type": "item type",
  "rarityHex": "#HexValue",
  "materials": {
    "material1": "description",
    "material2": "description"
  },
  "enchantments": {
    "enchantment1": "description",
    "enchantment2": "description"
  },
  "description": "Detailed description of the item."
}

Notes:
- **Colors**: Use hex codes for name and rarity based on their levels. Only include nameHex and rarityHex.
- **Materials & Enchantments**: Key-value pairs describing the item’s make and magic. Can be empty.
- **Description**: Concisely detail what the item is and its purpose, avoiding repetition.
- **Random Strings**: Decode strings of '$' followed by random letters and numbers to generate unique names, e.g., "$0a7g7af7g9h01l" could be "Blungus Blade".
The value of the random string should be interpreted into a unique output. The answer is hidden within the string, and it's up to you to find it.

Example user input:

{
  "name": "$0a7g7af7g9h01l",
  "rarity": "legendary",
  "type": "sword",
  "description": "A sword"
}

Your response should honor the user fields:

{
  "name": "Blungus Blade",
  "nameHex": "#FFD700",
  "rarity": "legendary",
  "type": "sword",
  "rarityHex": "#FFA500",
  "materials": {
    "dragonscale": "Forged with unbreakable dragonscale.",
    "firespark": "Infused with the essence of fire."
  },
  "enchantments": {
    "fire_damage": "Deals extra fire damage.",
    "ice_slow": "Slows enemies on hit."
  },
  "description": "A sword forged with dragonscale and fire essence, dealing both fire damage and slowing enemies."
}

Always retain user input as-is, except for $-prefixed alphanumeric strings, which should be decoded into unique values. Your creativity is key to crafting the perfect item.
The item does not always need to be notable; even the simplest item can be intriguing.
`


function randomCharString(length) {
    let result = '';
    let characters = '0123456789abcdefghijklmnopqrstuvwxyz';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

let apiKey = null;

let item;

let setupPage = 0;
//skip key page if key is already set
// if(localStorage.getItem('apiKey')) {
//     setupPage = 1;
//     console.log('skipping key page');
//     apiKey = localStorage.getItem('apiKey');
// }

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
let itemImgFile = null;

let nextBtn = document.getElementById('next');
nextBtn.addEventListener('click', async () => {
    let currPage = pages[setupPage];

    lastPage = currPage == pages[(pages.length - 1) - pageOffset] ? true : false;

    console.log(item);

    // if(currPage.classList.contains('keyPage')) {
    //     let apiKeyInput = document.getElementById('apiKeyInput');
    //     let key = apiKeyInput.value;

    //     if(localStorage.getItem('apiKey') !== null) {
    //         apiKey = localStorage.getItem('apiKey');
    //     } else {
    //         if(key === undefined || key === null || key.trim() === '') {
    //             console.log('Key is blank or undefined');
    //             apiKeyInput.style.boxShadow = 'inset 0px 0px 0px 2px red';
    //             apiKeyInput.placeholder = 'Please enter a valid key';
    //             return;
    //         } else {
    //             apiKeyInput.style.boxShadow = 'none';
    //             apiKeyInput.placeholder = 'API Key';
    //             apiKey = key;
    //             localStorage.setItem('apiKey', key);
    //         }
    //     }

        

    // }

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
        } else {
            if(currPage.classList.contains('itemKey')) {
                console.log('item key');
                item = item ? item : {};
                let key = value.id;
                item[key] = `$${randomCharString(14)}`
                console.log(item);
            }
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
            
            let buttons = document.getElementById('buttons');
            buttons.style.display = 'none';

            let backToLoot = document.getElementById('backToLoot');
            backToLoot.style.display = 'none';

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
                { "role": "user", "content": lootPrompt},
                { "role": "system", "content": "New L00T request recieved! The item fields provided are as follows:" },
                { "role": "user", "content": itemPrompt !== null ? itemPrompt : 
                    `{
                        "name": "$${randomCharString(Math.floor(Math.random() * 1) + 14)}",
                        "type": "$${randomCharString(Math.floor(Math.random() * 1) + 14)}",
                        "rarity": "$${randomCharString(Math.floor(Math.random() * 1) + 14)}",
                        "description": "$${randomCharString(Math.floor(Math.random() * 1) + 14)}",
                    }` }
            ],
            response_format: { "type": "json_object" },
            seed: Math.floor(Math.random() * 1000),
            max_tokens: 500,
            temperature: 1.2,
        };

        if(!shouldGenImg && itemImg) {
            chatObj.model = 'gpt-4o';
            chatObj.messages.push({
                role: 'user',
                content: [
                    {
                        type: 'text',
                        text: 'The user has uploaded an image of the item. Use the image, as well as any text description, as a basis for the item you create.',
                    },
                    {
                        type: 'image_url',
                        image_url: {
                            url: `${itemImg}`,
                            detail: 'low'
                        }
                    }
                ]
            })
        }

        console.log(chatObj.messages);

        let data;

        // if(!shouldGenImg && itemImg && itemImgFile) {

        //     let viewImgData = await imageViewBase64(itemImg);
        //     if(viewImgData.error) {
        //         alert('Unfortunately, there was an error processing the image. The page will reload. Please try again. If the issue persists, please contact support. ' + viewImgData.error.message);
        //         // window.location.reload();
        //         return;
        //     }
        //     let viewImg = viewImgData.choices[0].message.content;
        //     // console.log(viewImg);
        //     chatObj.messages.push({ "role": "user", "content": `The user has uploaded an image of the item. The image is described as follows. Use this, as well as any text description, as a basis for the item you create: ${viewImg}` });

        //     data = await chatCompletion(chatObj);
        //     console.log(data);
        //     if(data.error) {
        //         alert(data.error.message);
        //         return;
        //     }
        
            
        // } else {
            
        // }
        data = await chatCompletion(chatObj);
        console.log(data);
        if(data.error) {
            alert('Unfortunately, there was an error processing the item. The page will reload. Please try again. If the issue persists, please contact support. ' + data.error.message);
            window.location.reload();
            return;
        }
        if(data.errorMessage) {
            alert('The request timed out. Try again and choose either Generate Image or No Image. We are working on a solution! ' + data.errorMessage);
            window.location.reload();
            return;
        }
        let response;
        try {
            response = JSON.parse(data.choices[0].message.content);
        } catch (e) {
            console.error('Failed to parse JSON response:', e);
            alert('There was an error processing the AI response. The window will no reload. Please try again.');
            window.location.reload();
            return;
        }
        console.log(response);

        if (shouldGenImg) {

            const image = {
                model: 'dall-e-2',
                prompt: `A video game item portrait: ${response.description}. The entire item should be centred in the frame.The image will be 256x256px.`,
                size: "256x256",
                response_format: "b64_json"
            };

            await imageCompletion(image).then(data => {
                console.log(data);
                if(data.error) {
                    alert('Unfortunately, there was an error processing the image. The page will reload. Please try again. If the issue persists, please contact support. ' + data.error.message);
                    window.location.reload();
                    return;
                }
                response.image = 'data:image/png;base64,' + data.data[0].b64_json;
                localStorage.setItem('item', JSON.stringify(response));
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
            // let lootItem = Loot.createLootItem(response);
            // let itemPage = document.getElementsByClassName('itemPage')[0];
            // itemPage.appendChild(lootItem);

            // colorItems();
            overlay.style.opacity = 1;
            setTimeout(function() {
                window.location.href = "./view.html";
            }, 1000);
        }

       

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
                downscaleImage(file, 256, 256, 0.8, function(downscaledFile) {
                    console.log(file.size, downscaledFile.size);
                    let reader = new FileReader();
                    reader.readAsDataURL(downscaledFile);
                    reader.onload = function() {
                        itemImg = reader.result;
                    };
                });
            });

        });
    }
    

    for (let i = 0; i < pages.length; i++) {
        pages[i].style.display = 'none';
        if(i == setupPage) {
            pages[i].style.display = 'block';
            if(pages[i].querySelector('input[type="text"]')) {
                pages[i].querySelector('input[type="text"]').focus();
            }
        }
    }
    
    
});

function downscaleImage(file, maxWidth, maxHeight, quality, callback) {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate the new dimensions based on maxWidth and maxHeight
        if (width > height) {
            if (width > maxWidth) {
                height *= maxWidth / width;
                width = maxWidth;
            }
        } else {
            if (height > maxHeight) {
                width *= maxHeight / height;
                height = maxHeight;
            }
        }

        // Draw the image on canvas
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Convert canvas to a Blob, then to a File
        canvas.toBlob(blob => {
            const downscaledFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now()
            });
            callback(downscaledFile);
        }, 'image/jpeg', quality);
    };
}

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

let textInputs = document.querySelectorAll('input[type="text"]');
textInputs.forEach(input => {
    input.addEventListener('keydown', function(event) {
        if(event.key == 'Enter') {
            nextBtn.click();
        }
    });
});


let backBtn = document.getElementById('back');
backBtn.addEventListener('click', () => {
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
        camLight.intensity < 20 ? camLight.intensity += .01 : 20;
        card.rotation.y += delta /8;
        card.rotation.x += delta /12;
        card.rotation.z += delta /16;
        card.position.y = .2 + Math.sin(time*.1);
        time += .6 * delta;
    }


    composer.render();
}
animate();


