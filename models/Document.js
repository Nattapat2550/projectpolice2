// backend/models/Document.js
import { Router } from 'express';
import { upload } from '../middleware/upload.js';
import { processDocuments } from '../controllers/documentController.js';
import { protect } from '../middleware/auth.js'; // นำเข้า protect middleware

const router = Router();

// ใส่ protect ดักไว้ก่อน upload.array
router.post('/process', protect, upload.array('files', 50), processDocuments);

export default router;