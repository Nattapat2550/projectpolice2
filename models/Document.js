import { Router } from 'express';
import { upload } from '../middleware/upload.js';
import { processDocuments } from '../controllers/documentController.js';

const router = Router();

router.post('/process', upload.array('files', 50), processDocuments);

export default router;