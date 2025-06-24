const express = require('express');
const router = express.Router();
const ollamaController = require('../controllers/ollamaController');
const { auth } = require('../middlewares/auth');

// AI routes - nested under notebooks
router.post('/notebooks/:notebookId/chat', auth, ollamaController.chatWithNotebook);
router.post('/notebooks/:notebookId/generate', auth, ollamaController.generateNote);

// General chat (không cần notebook context)
router.post('/chat', auth, ollamaController.chat);

module.exports = router; 