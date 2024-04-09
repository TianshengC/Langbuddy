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
const findEarliestScheduledDate = require('../utils/findEarlistScheduledDate');

// Review Items and Review Sessions CRUD

//get all review items and sessions by status
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

        // Different queries based on the status
        let query;
        switch (status) {
            case "Scheduled":
                query = `
          SELECT i.* FROM Review_Items i 
          JOIN Review_Sessions s ON i.id_review = s.id_review 
          WHERE i.id_user = $1 AND s.status = 'Scheduled' 
          GROUP BY i.id_review
        `;
                break;
            case "Canceled":
                query = `
          SELECT i.* FROM Review_Items i 
          JOIN Review_Sessions s ON i.id_review = s.id_review 
          WHERE i.id_user = $1 
          GROUP BY i.id_review
          HAVING COUNT(*) FILTER (WHERE s.status != 'Canceled') = 0
        `;
                break;
            case "Finished":
                query = `
          SELECT i.* FROM Review_Items i 
          JOIN Review_Sessions s ON i.id_review = s.id_review 
          WHERE i.id_user = $1 
          GROUP BY i.id_review
          HAVING COUNT(*) FILTER (WHERE s.status = 'Finished') > 0 
            AND COUNT(*) FILTER (WHERE s.status = 'Scheduled') = 0
        `;
                break;
        }

        const reviewItems = await pool.query(query, [userId]);

        // Get sessions for each review item
        for (let item of reviewItems.rows) {
            const sessions = await pool.query(
                "SELECT id_session, id_review, scheduled_date, finished_date, status FROM Review_Sessions WHERE id_review = $1 ORDER BY (CASE WHEN status = 'Scheduled' THEN scheduled_date ELSE finished_date END)",
                [item.id_review]
            );
            item.reviewSessions = sessions.rows;
        }

        reviewItems.rows.sort((a, b) => {
            return new Date(findEarliestScheduledDate(a)) - new Date(findEarliestScheduledDate(b));
        });

        res.json(reviewItems.rows);

    } catch (err) {
        console.error(err.message);
        res.status(500).json("Server error");
    }
});


//get today's review items
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


        const query = `
        SELECT i.* FROM Review_Items i 
        JOIN Review_Sessions s ON i.id_review = s.id_review 
        WHERE i.id_user = $1 AND s.status = 'Scheduled' AND s.scheduled_date <= CURRENT_DATE
        GROUP BY i.id_review
      `;


        const todayReviewItems = await pool.query(query, [userId]);

        // Get sessions for each review item
        for (let item of todayReviewItems.rows) {
            const sessions = await pool.query(
                "SELECT id_session, id_review, scheduled_date, finished_date, status FROM Review_Sessions WHERE id_review = $1 ORDER BY (CASE WHEN status = 'Scheduled' THEN scheduled_date ELSE finished_date END)",
                [item.id_review]
            );
            item.reviewSessions = sessions.rows;
        }

        res.json(todayReviewItems.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json("Server error");
    }
});



//create a review item and related review sessions
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


        // Destructure the values from req.body
        const { category, title, content, review_pattern, firstReviewDate } = req.body;


        // Start a transaction
        await pool.query('BEGIN');

        // Insert the new review item and get the ID of the newly created item
        const newReviewItem = await pool.query(
            "INSERT INTO review_items (id_user, category, title, content, created_date) VALUES ($1, $2, $3, $4, NOW()) RETURNING *",
            [userId, category, title, content]
        );

        const reviewItemId = newReviewItem.rows[0].id_review;


        // Create the array of review dates and tempDate to be used in the loop
        let scheduledDates;
        const tempDate = firstReviewDate ? new Date(firstReviewDate) : new Date();


        // Create the array of review dates based on the selected pattern
        if (review_pattern === 'Simple') {
            scheduledDates = [1, 3, 7].map(day => {
                const date = new Date(tempDate);
                date.setDate(date.getDate() + day);
                return date;
            });
        } else if (review_pattern === 'Normal') {
            scheduledDates = [1, 2, 4, 7, 14].map(day => {
                const date = new Date(tempDate);
                date.setDate(date.getDate() + day);
                return date;
            });
        } else {
            // In case of custom pattern, only the first review date is set
            scheduledDates = [tempDate];
        }

        let reviewSessions = [];
        // Create the corresponding review sessions
        for (let date of scheduledDates) {
            const newReviewSession = await pool.query(
                "INSERT INTO review_sessions (id_review, scheduled_date, status, created_date) VALUES ($1, $2, 'Scheduled', NOW()) RETURNING id_session, id_review, scheduled_date, finished_date, status",
                [reviewItemId, date]
            );

            reviewSessions.push(newReviewSession.rows[0]);
        }

        // Commit the transaction
        await pool.query('COMMIT');
        newReviewItem.rows[0].reviewSessions = reviewSessions;

        //TODO: return the message to the frontend
        res.json(newReviewItem.rows[0]);

    } catch (err) {
        console.error(err.message);
        // If any error occurs, rollback the transaction
        await pool.query('ROLLBACK');
        res.status(500).json("Server error");
    }
});


//update a review item and relevant review sessions
router.patch('/edit/:id_review', async (req, res) => {
    try {
        const token = req.cookies.token;
        const { id_review } = req.params;

        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }

        const decoded = await jwtVerify(token, process.env.JWT_SECRET);
        if (!decoded || !decoded.user_id) {
            return res.status(401).json({ message: "Invalid token" });
        }
        const userId = decoded.user_id;


        // Destructure the values from req.body
        const { category, title, content, reviewSessions } = req.body;

        // Start a transaction
        await pool.query('BEGIN');

        // Check if the review item exists and the user has permission to edit it
        const reviewItem = await pool.query(
            "SELECT * FROM review_items WHERE id_review = $1 AND id_user = $2",
            [id_review, userId]
        );

        if (reviewItem.rows.length === 0) {
            return res.status(404).json("Review item not found or you don't have permission to edit it");
        }

        // Update review item
        const updateReviewItem = await pool.query(
            "UPDATE review_items SET category = $1, title = $2, content = $3 WHERE id_review = $4 AND id_user = $5 RETURNING *",
            [category, title, content, id_review, userId]
        );


        // Update the corresponding review sessions
        for (let session of reviewSessions) {
            const updatedSession = await pool.query(
                "UPDATE review_sessions SET scheduled_date = $1 WHERE id_session = $2 AND id_review = $3 RETURNING *",
                [session.scheduled_date, session.id_session, id_review]
            );
        }



        // Insert the corresponding review sessions to the updated review item
        const updatedReviewSessions = await pool.query(
            "SELECT id_session, scheduled_date, finished_date, status FROM review_sessions WHERE id_review = $1 ",
            [id_review]
        );

        updateReviewItem.rows[0].reviewSessions = updatedReviewSessions.rows;

        // Commit the transaction
        await pool.query('COMMIT');

        //TODO: return the message to the frontend
        res.json(updateReviewItem.rows[0]);
        console.log("Final updateReviewItem: ")
        console.log(updateReviewItem.rows[0])

    } catch (err) {
        console.error(err.message);
        // If any error occurs, rollback the transaction
        await pool.query('ROLLBACK');
        res.status(500).json("Server error");
    }
});

// update a single review session item status
router.patch('/session/change-status/:id_session', async (req, res) => {
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

        const { id_session } = req.params;
        const { status } = req.body;

        // Fetch session first to validate user
        const sessionItem = await pool.query(
            "SELECT * FROM review_sessions INNER JOIN review_items ON review_sessions.id_review = review_items.id_review WHERE review_sessions.id_session = $1",
            [id_session]
        );

        if (sessionItem.rows.length === 0) {
            return res.status(404).json("No session item found.");
        }

        if (sessionItem.rows[0].id_user !== userId) {
            return res.status(403).json("You are not authorized to modify this session.");
        }

        let updatedSessionItem;

        if (status === "Finished" || status === "Canceled") {
            updatedSessionItem = await pool.query(
                "UPDATE review_sessions SET status = $1, finished_date = NOW() WHERE id_session = $2 RETURNING id_session, id_review, scheduled_date, finished_date, status",
                [status, id_session]
            );
            res.json(updatedSessionItem.rows[0]);
        } else {
            res.status(400).json("Invalid status.");
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).json("Server error");
    }
});

// add a new review session to a review item
router.post('/add-session/:id_review', async (req, res) => {
    try {
        const token = req.cookies.token;
        const { id_review } = req.params;

        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }

        const decoded = await jwtVerify(token, process.env.JWT_SECRET);
        if (!decoded || !decoded.user_id) {
            return res.status(401).json({ message: "Invalid token" });
        }
        const userId = decoded.user_id;

        const { scheduled_date } = req.body;

        // Fetch review item first to validate user
        const reviewItem = await pool.query(
            "SELECT * FROM review_items WHERE id_review = $1",
            [id_review]
        );

        if (reviewItem.rows.length === 0) {
            return res.status(404).json("No review item found.");
        }

        if (reviewItem.rows[0].id_user !== userId) {
            return res.status(403).json("You are not authorized to modify this review item.");
        }

        // Insert the new review session
        const newReviewSession = await pool.query(
            "INSERT INTO review_sessions (id_review, scheduled_date, status, created_date) VALUES ($1, $2, 'Scheduled', NOW()) RETURNING id_session, id_review, scheduled_date, finished_date, status",
            [id_review, scheduled_date]
        );

        res.json(newReviewSession.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json("Server error");
    }
});

module.exports = router;