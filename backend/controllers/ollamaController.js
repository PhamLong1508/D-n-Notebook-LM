const ollama = require('ollama');

exports.chat = async function (req, res) {
  try {
    const { prompt } = req.body;
    const response = await ollama.chat({
      model: 'llama3',
      messages: [{ role: 'user', content: prompt }],
    });
    res.json({ result: response.message.content });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 