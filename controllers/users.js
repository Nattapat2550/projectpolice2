const pool = require('../config/db');
const User = require('../models/User');

// 💡 FIX: เพิ่มฟังก์ชัน getUsers ที่หายไป เพื่อให้หน้า Dropdown ดึงรายชื่อไปแสดงได้
// @desc    Get all users
// @route   GET /api/v1/users
// @access  Public (หรือจะแก้เป็น Private ก็ได้ถ้าบังคับ Login)
exports.getUsers = async (req, res, next) => {
    try {
        const users = await User.find(); // เรียกใช้คำสั่ง find() จาก User Model
        res.status(200).json({ success: true, data: users });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};


// @desc    Update my profile (Name, Color)
// @route   PUT /api/v1/users/profile
// @access  Private
exports.updateMyProfile = async (req, res, next) => {
    try {
        const { name, color } = req.body;
        const updateData = {};
        if (name) updateData.name = name;
        if (color) updateData.color = color;

        // ใช้ dynamic update จาก User model
        const user = await User.findByIdAndUpdate(req.user.id, updateData);
        res.status(200).json({ success: true, data: user });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Change password
// @route   PUT /api/v1/users/password
// @access  Private
exports.changePassword = async (req, res, next) => {
    try {
        const { password } = req.body;
        if (!password) {
            return res.status(400).json({ success: false, message: "Please provide a new password" });
        }
        await User.updatePassword(req.user.id, password);
        res.status(200).json({ success: true, message: "Password updated successfully" });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};