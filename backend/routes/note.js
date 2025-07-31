const express = require('express');
const router = express.Router();
const noteController = require('../controllers/noteController');
const { auth } = require('../middlewares/auth');

// Note routes - nested under notebooks
router.get('/notebooks/:notebookId/notes', auth, noteController.getNotes);
router.post('/notebooks/:notebookId/notes', auth, noteController.createNote);
router.put('/notebooks/:notebookId/notes/:noteId', auth, noteController.updateNote);
router.delete('/notebooks/:notebookId/notes/:noteId', auth, noteController.deleteNote);
router.get('/notebooks/:notebookId/notes/:noteId', auth, noteController.getNoteById);
router.put('/notebooks/:notebookId/notes/:noteId/toggle-public', auth, noteController.toggleNotePublicStatus);

module.exports = router; 