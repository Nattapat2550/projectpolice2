const express = require('express');
// 💡 FIX: Import getUsers เข้ามาใช้งาน
const { updateMyProfile, changePassword, getUsers } = require('../controllers/users');
const { protect } = require('../middleware/auth');
const router = express.Router();

// 💡 FIX: เพิ่ม Route สำหรับดึงข้อมูล Users ทั้งหมด
// ถ้าอยากให้ต้อง Login ก่อนถึงจะเห็นรายชื่อคนอื่น ให้ใส่ protect เข้าไปแบบนี้: router.get('/', protect, getUsers);
router.get('/', getUsers); 

router.put('/profile', protect, updateMyProfile);
router.put('/password', protect, changePassword);

module.exports = router;