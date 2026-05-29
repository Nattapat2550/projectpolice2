const { Router } = require('express');
const { upload } = require('../middleware/upload');
const { processDocuments } = require('../controllers/documentController');

const router = Router();

// รับหลายไฟล์พร้อมกัน
router.post('/process', upload.array('files', 50), processDocuments);

module.exports = router;