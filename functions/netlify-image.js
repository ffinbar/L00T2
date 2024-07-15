// netlify/functions/image-completion.js

exports.handler = async (event) => {
    const imageObj = JSON.parse(event.body);
    const imgUrl = 'https://api.openai.com/v1/images/generations';

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_KEY}`
    };

    try {
        const response = await fetch(imgUrl, { method: 'POST', headers, body: JSON.stringify(imageObj) });
        const data = await response.json();
        return {
            statusCode: 200,
            body: JSON.stringify(data)
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal Server Error' })
        };
    }
};