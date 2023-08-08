require('dotenv').config()
const express = require('express')
const app = express()
const port = process.env.PORT || 5000;
const cors = require('cors')
const pool = require('./db')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const cookie = require('cookie');
const cookieParser = require('cookie-parser');
const util = require('util');
const jwtVerify = util.promisify(jwt.verify);
const axios = require('axios').default;

const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

app.use(express.json())

app.use(cors({
    origin: 'http://localhost:3000', // The address of the server where React is running on
    credentials: true, // This allows the server to accept cookies from the client side
}));

app.use(cookieParser());
// app.use(cors())

app.get('/', (req, res) => {
    res.send('Hello World')
})


// User Registration and Login
app.get('/signup', async (req, res) => {
    res.send('Sign up')
})

app.post('/signup',
    // validation middleware
    [
        check('username').notEmpty().withMessage('Username is required'),
        check('user_email').isEmail().withMessage('Must be a valid email'),
        check('password').matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/).withMessage('Password must be at least 8 characters and contain at least one letter and one number'),
        check('mother_language').notEmpty().withMessage('Mother language is required')
    ],
    async (req, res) => {
        // check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { username, user_email, password, mother_language } = req.body;

            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            const userExists = await pool.query(
                "SELECT * FROM users WHERE user_email = $1",
                [user_email]
            );

            if (userExists.rowCount > 0) {
                res.status(400).json({ message: "Email already exists" });
                return;
            }

            const newUser = await pool.query(
                "INSERT INTO users (username, user_email, password_hash, created_date, mother_language) VALUES ($1, $2, $3, $4, $5) RETURNING *",
                [username, user_email, hashedPassword, new Date(), mother_language]
            );
            res.json(newUser.rows[0]);
            console.log("New user created: " + newUser.rows[0].username);
        } catch (err) {
            console.error(err.message);
            res.status(500).json({ message: "Server error" });
        }
    })

app.get('/login', async (req, res) => {
    res.send('Login')
})

app.post('/login',
    [
        check('user_email').isEmail().withMessage('Must be a valid email'),
        check('password').matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/).withMessage('Password must be at least 8 characters and contain at least one letter and one number'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { user_email, password } = req.body;

            const user = await pool.query(
                "SELECT * FROM users WHERE user_email = $1",
                [user_email]
            );

            if (user.rows.length === 0) {
                return res.status(401).json("Invalid Email or password");
            }

            const validPassword = await bcrypt.compare(password, user.rows[0].password_hash);

            if (!validPassword) {
                return res.status(401).json("Invalid Email or password");
            }

            const token = jwt.sign(
                { user_id: user.rows[0].id_user, username: user.rows[0].username },
                process.env.JWT_SECRET, { expiresIn: "24h" }
            );

            res.setHeader('Set-Cookie', cookie.serialize('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 60 * 60 * 24, // 1 day
                path: '/',
                sameSite: 'strict'
            }));

            res.json({ 'id_user': user.rows[0].id_user, 'username': user.rows[0].username });
            console.log("backend success login: " + user.rows[0].user_email);
        } catch (err) {
            console.error(err.message);
            res.status(500).json("Server error");
        }
    })

//token verification and decode the token to set currentUser data
app.get('/me', async (req, res) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }

        const decoded = await jwtVerify(token, process.env.JWT_SECRET);
        if (!decoded || !decoded.user_id) {
            return res.status(401).json({ message: "Invalid token" });
        }

        res.json({ 'id_user': decoded.user_id, 'username': decoded.username });
    } catch (err) {
        if (err instanceof jwt.JsonWebTokenError) {
            return res.status(401).json("Unauthorized");
        }
        console.error(err.message);
        res.status(500).json("Server error");
    }
});

app.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out' });
});





// CRUD for Study Items

//get all study items by status
app.get('/study/status/:status', async (req, res) => {
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
app.get('/study/today', async (req, res) => {
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
app.post('/study', async (req, res) => {
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
app.patch('/study/change-status/:id_study', async (req, res) => {
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
app.patch('/study/edit/:id_study', async (req, res) => {
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




// Review Items and Review Sessions CRUD

//get all review items and sessions by status
app.get('/review/status/:status', async (req, res) => {
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
                "SELECT id_session, id_review, scheduled_date, finished_date, status FROM Review_Sessions WHERE id_review = $1",
                [item.id_review]
            );
            item.reviewSessions = sessions.rows;
        }

        res.json(reviewItems.rows);

    } catch (err) {
        console.error(err.message);
        res.status(500).json("Server error");
    }
});


//get today's review items
app.get('/review/today', async (req, res) => {
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
app.post('/review', async (req, res) => {
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
        console.log(newReviewItem.rows[0])
        res.json(newReviewItem.rows[0]);

    } catch (err) {
        console.error(err.message);
        // If any error occurs, rollback the transaction
        await pool.query('ROLLBACK');
        res.status(500).json("Server error");
    }
});


//update a review item and relevant review sessions
app.patch('/review/edit/:id_review', async (req, res) => {
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

        console.log("userId: " + userId)
        console.log("id_review: " + id_review)
        console.log(req.body)

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
app.patch('/session/change-status/:id_session', async (req, res) => {
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

        console.log(sessionItem)
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
            console.log("updatedSessionItem: ")
            console.log(updatedSessionItem.rows[0])
        } else {
            res.status(400).json("Invalid status.");
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).json("Server error");
    }
});

// add a new review session to a review item
app.post('/review/add-session/:id_review', async (req, res) => {
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

//Chatbot output
app.post('/chatbot', async (req, res) => {
    const client = await pool.connect();
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
        const { content } = req.body;

        console.log(content);
        const chatbotName = "Ada";

        //Begin transaction
        await client.query('BEGIN');

        //insert user message into database
        const insertText = 'INSERT INTO ChatMessages(id_user, created_date, chatbot_name, role, content) VALUES($1, NOW(), $2, $3, $4)';
        const insertValues = [userId, chatbotName, 'user', content];
        await client.query(insertText, insertValues);

        // Fetch the last 20 messages from the database
        const fetchText = 'SELECT role, content FROM ChatMessages WHERE id_user = $1 ORDER BY created_date DESC LIMIT 20';
        const fetchValues = [userId];
        const fetchResult = await client.query(fetchText, fetchValues);


        //decide the function and personality of the chatbot

        let formatedMessages = fetchResult.rows.reverse().map(row => ({ role: row.role, content: row.content }));
        const systemMessage = { role: "system", content: "You are a helpful English teacher and you are talking to a student who is learning English. You can provide useful learning tips and correct the student's mistakes." };
        formatedMessages.unshift(systemMessage);
        console.log(formatedMessages);

        const completion = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: formatedMessages, //[{role:"user", content: content}],
            temperature: 0.3,
            presence_penalty: 0.1,
            frequency_penalty: 0.3
        })
        // console.log(completion);
        const { prompt_tokens, completion_tokens } = completion.data.usage

        //insert chatbot message into database
        const chatbotMessage = completion.data.choices[0].message.content;
        const insertBotText = 'INSERT INTO ChatMessages(id_user, created_date, chatbot_name, role, content, prompt_tokens, completion_tokens) VALUES($1, NOW(), $2, $3, $4, $5, $6)';
        const insertBotValues = [userId, chatbotName, 'assistant', chatbotMessage, prompt_tokens, completion_tokens];
        await client.query(insertBotText, insertBotValues);

        console.log(completion.data.choices[0].message);
        res.json(completion.data.choices[0].message);
        await client.query('COMMIT');
    } catch (err) {
        if (err.response) {
            console.log(err.response.status)
            console.log(err.response.data)
        } else {
            console.log(err.message)
        }
        res.status(500).json("Server error");
    } finally {
        client.release();
    }
});

//translation
app.post('/translate', async (req, res) => {

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
        const { content } = req.body;
        console.log(content);

        const response = await axios({
            baseURL: 'https://api.cognitive.microsofttranslator.com',
            url: '/translate',
            method: 'post',
            headers: {
                'Ocp-Apim-Subscription-Key': process.env.TRANSLATOR_API_KEY,
                'Content-type': 'application/json',
                'Ocp-Apim-Subscription-Region': 'uksouth',
            },
            params: {
                'api-version': '3.0',
                'from': 'en',
                'to': 'zh-Hans'
            },
            data: [{
                'text': content
            }],
            responseType: 'json'
        })

        console.log(JSON.stringify(response.data, null, 4));
        const translatedText = response.data[0].translations[0].text;
        res.json({ translatedText: translatedText });

    } catch (error) {
        console.error(error);
        if (error.response) {
            console.log(error.response.data)
        }
        res.status(500).json("Server error");
    }
});



app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})
