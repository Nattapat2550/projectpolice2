const fs = require('fs').promises; 
const { extractDataWithGemini } = require('../services/ocrService'); 
const { generateHash } = require('../utils/duplicateChecker');
const pool = require('../config/db');
const { uploadToDrive } = require('../services/googleDriveService');

const DRIVE_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID; 

exports.processDocuments = async (req, res) => {
  const files = req.files;
  if (!files || files.length === 0) return res.status(400).json({ success: false, message: 'No files uploaded.' });
  const results = [];
  
  for (const file of files) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const geminiResult = await extractDataWithGemini(file.path, file.mimetype);
      const { text, extractedData } = geminiResult;
      const hash = generateHash(text + Date.now().toString());
      const driveData = await uploadToDrive(file, DRIVE_FOLDER_ID);

      // บันทึกเฉพาะเอกสารลง Database ก่อน (ยังไม่แยกงาน)
      const docRes = await client.query(
        `INSERT INTO documents (filename, content, content_hash, keywords_found, drive_file_id, drive_web_view_link)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [file.originalname, text, hash, JSON.stringify(extractedData), driveData.id, driveData.webViewLink]
      );
      
      await client.query('COMMIT'); 
      await fs.unlink(file.path);

      // ส่ง ID และข้อมูลที่แสกนกลับไปให้เว็บแสดงผลเพื่อกดยืนยัน
      results.push({
        filename: file.originalname,
        status: 'success',
        extractedData: extractedData, 
        documentId: docRes.rows[0].id, 
        viewLink: driveData.webViewLink
      });

    } catch (err) {
      await client.query('ROLLBACK'); 
      try { await fs.unlink(file.path); } catch (e) {}
      results.push({ filename: file.originalname, status: 'error', error: err.message });
    } finally {
      client.release();
    }
  }
  res.json({ total: files.length, results });
};