const fs = require('fs').promises; 
const { extractDataWithGemini } = require('../services/ocrService'); 

// หมายเหตุ: ไม่ต้องใช้ pool (Database) และ uploadToDrive ที่นี่แล้ว 
// เพราะย้ายไปบันทึกตอนผู้ใช้กดยืนยันใน taskController (confirmTasks) แทน

exports.processDocuments = async (req, res) => {
  const files = req.files;
  if (!files || files.length === 0) return res.status(400).json({ success: false, message: 'No files uploaded.' });
  const results = [];
  
  // ดึง ID และ ชื่อ จาก req.user ที่ได้จาก protect middleware
  const userId = req.user ? req.user.id : null;
  const userName = req.user ? req.user.name : "Unknown"; // ปรับ .name ให้ตรงกับชื่อฟิลด์ใน User model ของคุณ

  for (const file of files) {
    try {
      // 1. ให้ AI สกัดข้อมูลและอ่านข้อความออกมาอย่างเดียว
      const geminiResult = await extractDataWithGemini(file.path, file.mimetype);
      const { text, extractedData } = geminiResult;

      // 2. ตั้งค่า default ชื่อคนรับผิดชอบให้เป็นชื่อคนอัพโหลด
      let dataWithDefaultUser = extractedData || {};
      dataWithDefaultUser.assignee = userName; 

      // 3. เตรียมข้อมูลส่งกลับให้ Frontend 
      results.push({
        filename: file.originalname,
        status: 'success',
        extractedData: dataWithDefaultUser,
        // สำคัญ: แนบ fileInfo กลับไปเพื่อให้ Frontend เอาไปใช้ส่งมายืนยันอีกครั้งตอนบันทึกลงฐานข้อมูล
        fileInfo: {
            path: file.path,
            originalname: file.originalname,
            mimetype: file.mimetype,
            text: text
        }
      });

      // หมายเหตุ: จะไม่มีการลบไฟล์ (fs.unlink) หรือบันทึกลงฐานข้อมูลใดๆ ตรงนี้ 
      // ไฟล์จะถูกเก็บไว้ที่โฟลเดอร์ชั่วคราวบน Server เพื่อรอให้ผู้ใช้กดยืนยันการเพิ่มงานแล้วค่อยลบทิ้งใน confirmTasks

    } catch (err) {
      // หากเกิด Error ในขั้นตอนการสกัดข้อมูลค่อยลบไฟล์ชั่วคราวทิ้ง
      try { await fs.unlink(file.path); } catch (e) {}
      results.push({ filename: file.originalname, status: 'error', error: err.message });
    }
  }
  
  res.json({ total: files.length, results });
};