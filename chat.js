const chatUrl = 'https://api.openai.com/v1/chat/completions';
const imgUrl = 'https://api.openai.com/v1/images/generations';

async function chatCompletion(chatObj, key) {
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`
    };

    console.log('Start chat completion...');

    const body = JSON.stringify(chatObj);

    return fetch(chatUrl, { method: 'POST', headers, body })
        .then(response => response.json())
        .catch(error => {
            console.error('Error:', error);
            return error;
        });
}

export { chatCompletion };

async function imageCompletion(imageObj, key) {
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`
    };

    console.log('Start image completion...');

    const body = JSON.stringify(imageObj);

    return fetch(imgUrl, { method: 'POST', headers, body })
        .then(response => response.json())
        .catch(error => {
            console.error('Error:', error);
            return error;
        });
}

export { imageCompletion };

async function imageViewUrl(imageUrl, args, key, prev) {
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`
    };

    console.log('Start image view...');

    let prompt = prev ? `Describe the image. Be succinct. Only a few sentences at most. The previous description is as follows. Use it as a basis. Return a new version of the entire prompt: ${prev}` : 'Describe the image. Be succinct. Only a few sentences at most.';
    args ? prompt = prompt + ` The user has provided the following additional prompt: ${args}` : prompt = prompt;

    const body = JSON.stringify({
        model: 'gpt-4-vision-preview',
        messages: [
            {
                role: 'user',
                content: [
                    {
                        type: 'text',
                        text: prompt,
                    },
                    {
                        type: 'image_url',
                        image_url: {
                            url: imageUrl
                        }
                    }
                ]
            }
        ],
        max_tokens: 300
    });

    return fetch(chatUrl, { method: 'POST', headers, body })
        .then(response => response.json())
        .catch(error => {
            console.error('Error:', error);
            return error;
        });
}

export { imageViewUrl };

async function imageViewBase64(imageFile, input, key) {
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`
    };

    let imgPrompt = `You are identifying the contents of an image.`;

    if (input) {
        imgPrompt = imgPrompt + ` The user has provided the following additional prompt for the item: ${input}`;
    }

    console.log('Start image view...');

    const reader = new FileReader();

    const base64Image = await new Promise((resolve, reject) => {
        reader.onloadend = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(imageFile);
    });

    const body = JSON.stringify({
        model: 'gpt-4-vision-preview',
        messages: [
            {
                role: 'user',
                content: [
                    {
                        type: 'text',
                        text: imgPrompt,
                    },
                    {
                        type: 'image_url',
                        image_url: {
                            url: `data:image/jpeg;base64,${base64Image}`
                        }
                    }
                ]
            }
        ],
        max_tokens: 300
    });

    return fetch(chatUrl, { method: 'POST', headers, body })
        .then(response => response.json())
        .catch(error => {
            console.error('Error:', error);
            return error;
        });
}

export { imageViewBase64 };