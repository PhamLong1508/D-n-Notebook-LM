const express = require('express');
const router = express.Router();
const notebookController = require('../controllers/notebookController');
const { auth } = require('../middlewares/auth');

// Notebook routes
router.get('/notebooks', auth, notebookController.getNotebooks);
router.post('/notebooks', auth, notebookController.createNotebook);
router.get('/notebooks/:id', auth, notebookController.getNotebook);
router.put('/notebooks/:id', auth, notebookController.updateNotebook);
router.delete('/notebooks/:id', auth, notebookController.deleteNotebook);

module.exports = router;
