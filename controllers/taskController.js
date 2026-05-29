const pool = require('../config/db');

exports.getAllTasks = async (req, res) => {
  try {
    const query = `
      SELECT 
        t.id AS id, 
        t.title AS name, 
        COALESCE(STRING_AGG(DISTINCT COALESCE(u.name, ta.role_or_name), ', '), 'ไม่ระบุ') AS "personInCharge", 
        TO_CHAR(t.due_date, 'YYYY-MM-DD') AS date, 
        t.status,
        t.is_urgent AS "isUrgent"
      FROM tasks t
      LEFT JOIN task_assignments ta ON t.id = ta.task_id
      LEFT JOIN users u ON ta.user_id = u.id
      GROUP BY t.id
      ORDER BY t.due_date ASC NULLS LAST
    `;
    const { rows } = await pool.query(query);
    res.status(200).json(rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.getUrgentTasks = async (req, res) => {
  try {
    const query = `
      SELECT 
        t.id AS id, 
        t.title AS name, 
        COALESCE(STRING_AGG(DISTINCT COALESCE(u.name, ta.role_or_name), ', '), 'ไม่ระบุ') AS "personInCharge", 
        TO_CHAR(t.due_date, 'YYYY-MM-DD') AS date, 
        t.status,
        t.is_urgent AS "isUrgent"
      FROM tasks t
      LEFT JOIN task_assignments ta ON t.id = ta.task_id
      LEFT JOIN users u ON ta.user_id = u.id
      WHERE t.is_urgent = true
      GROUP BY t.id
      ORDER BY t.due_date ASC NULLS LAST
    `;
    const { rows } = await pool.query(query);
    res.status(200).json(rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const result = await pool.query(
      `UPDATE tasks SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [status, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Task not found' });
    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error("Update status error:", err.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.confirmTasks = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { documentId, memos } = req.body;

    if (memos && memos.length > 0) {
      for (const memo of memos) {
        // 💡 แก้ไข: เพิ่ม is_urgent เข้าไปบันทึกลง Database
        const taskRes = await client.query(
          `INSERT INTO tasks (document_id, title, memo_no, memo_date, main_text, due_date, is_urgent)
           VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
          [ 
            documentId, 
            memo.เรื่อง || 'ไม่ระบุชื่อเรื่อง', 
            memo.ที่, 
            memo.วันที่, 
            memo.main_text, 
            memo.due_date || null,
            memo.isUrgent || false // ดึงค่าจากที่ติ๊กในหน้า Uploaded
          ]
        );
        const taskId = taskRes.rows[0].id;

        if (memo.assignments && memo.assignments.length > 0) {
          for (const assign of memo.assignments) {
            const userId = assign.user_id ? parseInt(assign.user_id) : null; 
            const personStr = assign.responsible_person || '';

            const assignRes = await client.query(
              `INSERT INTO task_assignments (task_id, user_id, role_or_name)
               VALUES ($1, $2, $3) RETURNING id`,
              [taskId, userId, personStr]
            );
            const assignmentId = assignRes.rows[0].id;

            if (assign.topics && assign.topics.length > 0) {
              for (const topic of assign.topics) {
                await client.query(
                  `INSERT INTO task_topics (assignment_id, detail, is_completed) VALUES ($1, $2, $3)`,
                  [assignmentId, topic, false]
                );
              }
            }
          }
        }
      }
    }
    await client.query('COMMIT');
    res.status(200).json({ success: true, message: 'บันทึกงานสำเร็จ!' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error("Confirm error:", err.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  } finally {
    client.release();
  }
};

exports.updateTaskDetail = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { id } = req.params;
    // 💡 แก้ไข: รับค่า isUrgent มาด้วยตอนแก้ไข
    const { name, date, notes, assignments, isUrgent } = req.body;

    const validDate = (date === "" || !date) ? null : date;
    const urgentValue = isUrgent !== undefined ? isUrgent : null; 

    // 💡 แก้ไข: นำ is_urgent ไปอัปเดตลง Database ด้วย
    await client.query(
      `UPDATE tasks 
       SET title = COALESCE($1, title), 
           due_date = COALESCE($2, due_date), 
           notes = COALESCE($3, notes), 
           is_urgent = COALESCE($4, is_urgent),
           updated_at = NOW() 
       WHERE id = $5`,
      [name, validDate, notes, urgentValue, id]
    );

    if (assignments && Array.isArray(assignments)) {
      for (const assign of assignments) {
        if (!assign.assignment_id) continue;
        
        const userId = assign.user_id ? parseInt(assign.user_id) : null;
        await client.query(
          `UPDATE task_assignments SET user_id = $1 WHERE id = $2 AND task_id = $3`,
          [userId, assign.assignment_id, id]
        );

        if (assign.topics && Array.isArray(assign.topics)) {
          const keepTopicIds = assign.topics.filter(t => t.topic_id).map(t => parseInt(t.topic_id));
          
          if (keepTopicIds.length > 0) {
            await client.query(`DELETE FROM task_topics WHERE assignment_id = $1 AND NOT (id = ANY($2::int[]))`, [assign.assignment_id, keepTopicIds]);
          } else {
            await client.query(`DELETE FROM task_topics WHERE assignment_id = $1`, [assign.assignment_id]);
          }

          for (const topic of assign.topics) {
            if (topic.topic_id) {
              await client.query(
                `UPDATE task_topics SET detail = $1, is_completed = $2 WHERE id = $3`,
                [topic.detail, topic.is_completed || false, topic.topic_id]
              );
            } else {
              await client.query(
                `INSERT INTO task_topics (assignment_id, detail, is_completed) VALUES ($1, $2, $3)`,
                [assign.assignment_id, topic.detail, topic.is_completed || false]
              );
            }
          }
        } else {
           await client.query(`DELETE FROM task_topics WHERE assignment_id = $1`, [assign.assignment_id]);
        }
      }
    }

    await client.query('COMMIT');
    res.status(200).json({ success: true, message: 'บันทึกความเปลี่ยนแปลงเรียบร้อย' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error("Update task detail error:", err.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  } finally {
    client.release();
  }
};

exports.getTaskById = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT 
        t.id, 
        t.title AS name, 
        t.status, 
        t.is_urgent AS "isUrgent", -- 💡 แก้ไข: ดึงค่า isUrgent ออกมาส่งให้ Frontend ด้วย
        TO_CHAR(t.due_date, 'YYYY-MM-DD"T"HH24:MI') AS date, 
        t.main_text,
        t.notes,      
        t.memo_no, 
        t.memo_date,
        d.drive_web_view_link AS document_link,
        COALESCE(
          json_agg(
            json_build_object(
              'assignment_id', ta.id,
              'user_id', ta.user_id,             
              'role_or_name', ta.role_or_name,   
              'personInCharge', COALESCE(u.name, ta.role_or_name),
              'topics', (
                SELECT COALESCE(
                  json_agg(
                    json_build_object(
                      'topic_id', tt.id,          
                      'detail', tt.detail,
                      'is_completed', COALESCE(tt.is_completed, false)
                    ) ORDER BY tt.id ASC
                  ), '[]'::json)
                FROM task_topics tt 
                WHERE tt.assignment_id = ta.id
              )
            )
          ) FILTER (WHERE ta.id IS NOT NULL), '[]'
        ) AS assignments
      FROM tasks t
      LEFT JOIN task_assignments ta ON t.id = ta.task_id
      LEFT JOIN users u ON ta.user_id = u.id
      LEFT JOIN documents d ON t.document_id = d.id 
      WHERE t.id = $1
      GROUP BY t.id, d.drive_web_view_link
    `;
    const { rows } = await pool.query(query, [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    const task = rows[0];
    task.personInCharge = task.assignments.map(a => a.personInCharge).join(', ') || 'ไม่ระบุ';

    res.status(200).json({ success: true, data: task });
  } catch (err) {
    console.error("Get task by id error:", err.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.deleteTask = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { id } = req.params;

    const assignmentsRes = await client.query('SELECT id FROM task_assignments WHERE task_id = $1', [id]);
    const assignmentIds = assignmentsRes.rows.map(row => row.id);

    if (assignmentIds.length > 0) {
      await client.query('DELETE FROM task_topics WHERE assignment_id = ANY($1)', [assignmentIds]);
    }
    await client.query('DELETE FROM task_assignments WHERE task_id = $1', [id]);
    const result = await client.query('DELETE FROM tasks WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    await client.query('COMMIT');
    res.status(200).json({ success: true, message: 'ลบข้อมูลสำเร็จ' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error("Delete task error:", err.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  } finally {
    client.release();
  }
};

exports.createTask = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { 
      title, 
      memo_no, 
      memo_date, 
      due_date, 
      main_text, 
      is_urgent, 
      assignments 
    } = req.body;

    const taskRes = await client.query(
      `INSERT INTO tasks (title, memo_no, memo_date, main_text, due_date, is_urgent, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [
        title||'ไม่ระบุชื่อเรื่อง', 
        memo_no, 
        memo_date||null, 
        main_text, 
        due_date||null, 
        is_urgent||false,
        'following'
      ]
    );
    const taskId = taskRes.rows[0].id;

    if (assignments && assignments.length > 0) {
      for (const assign of assignments) {

        const userId = assign.user_id ? parseInt(assign.user_id) : null;
        const roleOrName = assign.role_or_name || null;

        const assignRes = await client.query(
          `INSERT INTO task_assignments (task_id, user_id, role_or_name)
           VALUES ($1, $2, $3) RETURNING id`,
          [taskId, userId, roleOrName]
        );
        const assignmentId = assignRes.rows[0].id;

        if (assign.topics && assign.topics.length > 0) {
          for (const topicDetail of assign.topics) {
            await client.query(
              `INSERT INTO task_topics (assignment_id, detail, is_completed) 
               VALUES ($1, $2, $3)`,
              [assignmentId, topicDetail, false]
            );
          }
        }
      }
    }

    await client.query('COMMIT');
    res.status(201).json({ 
      success: true, 
      message: 'สร้างงานสำเร็จ!', 
      taskId: taskId 
    });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error("Create task error:", err.message);
    res.status(500).json({ success: false, message: 'Server Error', error: err.message });
  } finally {
    client.release();
  }
};