const express = require('express');
const router = express.Router();
const noteController = require('../controllers/noteController');
const { auth } = require('../middlewares/auth');
const { requireNoteOwnerOrAdmin } = require('../middlewares/author');

router.get('/notes', auth, noteController.getNotes);
router.post('/notes', auth, noteController.createNote);
router.put('/notes/:id', auth, requireNoteOwnerOrAdmin, noteController.updateNote);
router.delete('/notes/:id', auth, requireNoteOwnerOrAdmin, noteController.deleteNote);

module.exports = router; 