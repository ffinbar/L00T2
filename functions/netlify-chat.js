// netlify/functions/chat-completion.js

exports.handler = async (event) => {
  const chatObj = JSON.parse(event.body);
  const chatUrl = 'https://api.openai.com/v1/chat/completions';

  const headers = {
	'Content-Type': 'application/json',
	'Authorization': `Bearer ${process.env.OPENAI_KEY}`
  };

  try {
	const response = await fetch(chatUrl, { method: 'POST', headers, body: JSON.stringify(chatObj) });
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