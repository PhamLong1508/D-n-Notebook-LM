const express = require('express');
const router = express.Router();
const sourceController = require('../controllers/sourceController');
const { auth } = require('../middlewares/auth');

// Source routes
router.get('/notebooks/:notebookId/sources', auth, sourceController.getSources);
router.post('/notebooks/:notebookId/sources', auth, sourceController.addSource);
router.delete('/notebooks/:notebookId/sources/:sourceId', auth, sourceController.deleteSource);

module.exports = router;
