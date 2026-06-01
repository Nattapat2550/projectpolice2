const express = require('express');
// 💡 เพิ่ม confirmTasks เข้าไปในปีกกานี้
const { 
    getAllTasks, 
    getUrgentTasks, 
    updateTaskStatus, 
    confirmTasks, 
    getTaskById,
    updateTaskDetail,
    deleteTask,
    createTask
} = require('../controllers/taskController');

const router = express.Router();

router.get('/', getAllTasks);
router.get('/urgent', getUrgentTasks);
router.put('/:id/status', updateTaskStatus);
router.post('/confirm', confirmTasks); // เส้นทางสำหรับยืนยันงานที่แสกนมา
router.get('/:id', getTaskById);
router.put('/:id', updateTaskDetail);
router.delete('/:id', deleteTask);
router.post('/', createTask);

module.exports = router;