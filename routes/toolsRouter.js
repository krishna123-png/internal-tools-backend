const express = require('express');
const multer = require('multer');
const verifyToken = require('../middlewares/verifyToken');
const { aiAssistant } = require('../controllers/toolsController');
const { codeTool } = require('../controllers/toolsController');
const { summarize } = require('../controllers/toolsController');
const { analyze } = require('../controllers/toolsController');
const router = express.Router();

router.post('/ai-assistant', verifyToken, aiAssistant);
router.post('/code-tool', verifyToken, codeTool);

const upload = multer({
    storage: multer.memoryStorage()
});

router.post('/summarize', verifyToken, upload.single('file'), summarize);
router.post('/resume-analyze', verifyToken, upload.single('file'), analyze);

module.exports = router;