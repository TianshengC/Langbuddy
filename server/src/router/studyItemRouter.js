const express = require('express');
const router = express.Router();
const pool = require('../../db');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const cookie = require('cookie');
const jwt = require('jsonwebtoken');
const util = require('util');
const jwtVerify = util.promisify(jwt.verify);





// CRUD for Study Items
//get all study items by status
router.get('/status/:status', async (req, res) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }

        const decoded = await jwtVerify(token, process.env.JWT_SECRET);
        if (!decoded || !decoded.user_id) {
            return res.status(401).json({ message: "Invalid token" });
        }
        const userId = decoded.user_id;
        const status = req.params.status;

        const studyItems = await pool.query(
            "SELECT * FROM study_items WHERE id_user = $1 AND status = $2",
            [userId, status]
        );

        res.json(studyItems.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json("Server error");
    }
});

//get today's study items
router.get('/today', async (req, res) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }

        const decoded = await jwtVerify(token, process.env.JWT_SECRET);
        if (!decoded || !decoded.user_id) {
            return res.status(401).json({ message: "Invalid token" });
        }
        const userId = decoded.user_id;

        const todayStudyItems = await pool.query(
            "SELECT * FROM study_items WHERE id_user = $1 AND scheduled_date <= CURRENT_DATE AND status = 'Scheduled'",
            [userId]
        );

        res.json(todayStudyItems.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json("Server error");
    }
});


// create a study item
router.post('/', async (req, res) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }

        const decoded = await jwtVerify(token, process.env.JWT_SECRET);
        if (!decoded || !decoded.user_id) {
            return res.status(401).json({ message: "Invalid token" });
        }
        const userId = decoded.user_id;


        const { category, title, content, scheduled_date } = req.body;

        const newStudyItem = await pool.query(
            "INSERT INTO study_items (id_user, category, title, content, created_date, scheduled_date, status) VALUES ($1, $2, $3, $4, NOW(), $5, 'Scheduled') RETURNING *",
            [userId, category, title, content, scheduled_date]
        );

        res.json(newStudyItem.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json("Server error");
    }
});

// update a study item status
router.patch('/change-status/:id_study', async (req, res) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }

        const decoded = await jwtVerify(token, process.env.JWT_SECRET);
        if (!decoded || !decoded.user_id) {
            return res.status(401).json({ message: "Invalid token" });
        }
        const userId = decoded.user_id;

        const { id_study } = req.params;
        const { status } = req.body;

        if (status === "Finished" || status === "Canceled") {
            updatedStudyItem = await pool.query(
                "UPDATE study_items SET status = $1, finished_date = NOW() WHERE id_study = $2 AND id_user = $3 RETURNING *",
                [status, id_study, userId]
            );
        } else {
            updatedStudyItem = await pool.query(
                "UPDATE study_items SET status = $1 WHERE id_study = $2 AND id_user = $3 RETURNING *",
                [status, id_study, userId]
            );
        }

        if (updatedStudyItem.rows.length === 0) {
            return res.status(404).json("No study item found or not authorized to update");
        }

        res.json(updatedStudyItem.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json("Server error");
    }
});

//edit a study item
router.patch('/edit/:id_study', async (req, res) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }

        const decoded = await jwtVerify(token, process.env.JWT_SECRET);
        if (!decoded || !decoded.user_id) {
            return res.status(401).json({ message: "Invalid token" });
        }
        const userId = decoded.user_id;

        const { id_study } = req.params;
        const { title, category, content, scheduled_date } = req.body;

        const updatedStudyItem = await pool.query(
            "UPDATE study_items SET title = $1, category = $2, content = $3, scheduled_date = $4 WHERE id_study = $5 AND id_user = $6 RETURNING *",
            [title, category, content, scheduled_date, id_study, userId]
        );

        if (updatedStudyItem.rows.length === 0) {
            return res.status(404).json("No study item found or not authorized to update");
        }

        res.json(updatedStudyItem.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json("Server error");
    }
});

module.exports = router;