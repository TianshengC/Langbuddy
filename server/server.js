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
const studyItemRouter = require('./src/router/studyItemRouter');
const reviewItemRouter = require('./src/router/reviewItemRouter');

const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);
const chatbotGreetingMessages = require('./src/utils/chatbotGreetingMessage');
const { getChatbotModel, getChatbotGreeting, getChatbotVoice } = require('./src/utils/chatbotModel');


app.use(express.json())

app.use(cors({
    origin: 'http://localhost:3000', // The address of the server where React is running on
    credentials: true, // This allows the server to accept cookies from the client side
}));

app.use(cookieParser());


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
                "INSERT INTO users (username, user_email, password_hash, created_date, mother_language) VALUES ($1, $2, $3, Now(), $4) RETURNING username, id_user",
                [username, user_email, hashedPassword, mother_language]
            );

            for (let msg of chatbotGreetingMessages) {
                await pool.query(
                    "INSERT INTO ChatMessages (id_user, created_date, chatbot_name, role, content) VALUES ($1, NOW(), $2, $3, $4)",
                    [newUser.rows[0].id_user, msg.chatbotName, msg.role, msg.content]
                );
            }

            res.json(newUser.rows[0].username);
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



app.use('/study', studyItemRouter);

app.use('/review', reviewItemRouter);

app.use()



//Chatbot Routes

//get history chatbot messages
app.get('/chatbot/:selectedChatbot', async (req, res) => {
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
        const { selectedChatbot } = req.params;

        const chatbotMessages = await pool.query(
            "SELECT created_date, role, content FROM ChatMessages WHERE id_user = $1 AND chatbot_name = $2 ORDER BY created_date DESC, id_message DESC LIMIT 20",
            [userId, selectedChatbot]
        );

        res.json(chatbotMessages.rows.reverse());

    } catch (err) {
        console.error(err.message);
        res.status(500).json("Server error");
    }
});

//get number of conversation points
app.get('/conversation-points', async (req, res) => {

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

        const result = await pool.query(
            "SELECT conversation_points, last_message_date FROM Users WHERE id_user = $1",
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        const user = result.rows[0];
        const currentDate = new Date();

        if (!user.last_message_date || user.last_message_date.toDateString() !== currentDate.toDateString()) {
            // If it's a new day, reset the conversation points to 50 and update the last_message_date
            await pool.query(
                "UPDATE Users SET conversation_points = 50, last_message_date = NOW() WHERE id_user = $1",
                [userId]
            );
            user.conversation_points = 50;
        }

        console.log("conversation points: " + user.conversation_points);
        res.json({ conversationPoints: user.conversation_points });

    } catch (err) {
        console.error(err.message);
        res.status(500).json("Server error");
    }
});


//Send message to openAI and get Chatbot response
app.post('/chatbot/:selectedChatbot', async (req, res) => {
    const client = await pool.connect();
    try {

        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }

        //verify token and get user id
        const decoded = await jwtVerify(token, process.env.JWT_SECRET);
        if (!decoded || !decoded.user_id) {
            return res.status(401).json({ message: "Invalid token" });
        }
        const userId = decoded.user_id;

        // Check current conversation points
        const pointCheck = await client.query(
            "SELECT conversation_points, last_message_date FROM Users WHERE id_user = $1",
            [userId]
        );

        const currentPoints = pointCheck.rows[0].conversation_points;

        if (currentPoints <= 0) {
            throw new Error("Insufficient conversation points");
        }

        // Get last message date and update conversation points if it's a new day
        const lastMessageDate = pointCheck.rows[0].last_message_date;
        const currentDate = new Date();

        if (!lastMessageDate || lastMessageDate.toDateString() !== currentDate.toDateString()) {
            // If it's a new day, reset the conversation points to 50 and update the last_message_date
            await pool.query(
                "UPDATE Users SET conversation_points = 50, last_message_date = NOW() WHERE id_user = $1",
                [userId]
            );
        }


        const { content } = req.body;

        if (!content) {
            throw new Error("No content provided");
        }

        const { selectedChatbot } = req.params;

        if (!selectedChatbot) {
            throw new Error("No chatbot provided");
        }

        //Get the chatbot model information by name
        const chatbotModel = getChatbotModel(selectedChatbot);

        //Begin transaction
        await client.query('BEGIN');

        //insert user message into database
        const insertText = 'INSERT INTO ChatMessages(id_user, created_date, chatbot_name, role, content) VALUES($1, NOW(), $2, $3, $4)';
        const insertValues = [userId, chatbotModel.name, 'user', content];
        await client.query(insertText, insertValues);

        // Fetch the last 20 messages in current topic from the database
        const fetchText = `
            SELECT role, content 
            FROM ChatMessages 
            WHERE id_user = $1 
            AND chatbot_name = $3
            AND created_date > (
                SELECT MAX(created_date) 
                FROM ChatMessages 
                WHERE id_user = $1 
                AND role = $2 And chatbot_name = $3
            )
            ORDER BY created_date DESC, id_message DESC
            LIMIT 20;
        `;
        const fetchValues = [userId, 'topic', chatbotModel.name];
        const fetchResult = await client.query(fetchText, fetchValues);


        //add the system messages to the messages array and format the messages
        let formatedMessages = fetchResult.rows.reverse().map(row => ({ role: row.role, content: row.content }));
        const systemMessage = chatbotModel.messages;
        formatedMessages = [...systemMessage, ...formatedMessages];

        //send the messages to openAI and get the reply
        const completion = await openai.createChatCompletion({
            model: chatbotModel.model,
            messages: formatedMessages,
            temperature: chatbotModel.temperature,
            presence_penalty: chatbotModel.presence_penalty,
            frequency_penalty: chatbotModel.frequency_penalty,
        })

        // get the tokens information
        const { prompt_tokens, completion_tokens } = completion.data.usage

        //insert chatbot response and tokens into database
        const chatbotMessage = completion.data.choices[0].message.content;

        if (!chatbotMessage) {
            throw new Error("No response message provided");
        }

        const insertBotText = 'INSERT INTO ChatMessages(id_user, created_date, chatbot_name, role, content, prompt_tokens, completion_tokens) VALUES($1, NOW(), $2, $3, $4, $5, $6)';
        const insertBotValues = [userId, chatbotModel.name, 'assistant', chatbotMessage, prompt_tokens, completion_tokens];
        await client.query(insertBotText, insertBotValues);

        // Decrease conversation points by 1 after sending the message
        await client.query(
            "UPDATE Users SET conversation_points = conversation_points - 1 WHERE id_user = $1",
            [userId]
        );

        // Fetch updated conversation points
        const updatedPointsResult = await client.query(
            "SELECT conversation_points FROM Users WHERE id_user = $1",
            [userId]
        );

        const updatedPoints = updatedPointsResult.rows[0].conversation_points;

        // Return both AI message and updated points to frontend
        res.json({
            aiMessage: completion.data.choices[0].message,
            updatedConversationPoints: updatedPoints
        });

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

// const fs = require('fs'); //for testing

//text synthesis from azure API
app.post('/synthesis/:selectedChatbot', async (req, res) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }

        const decoded = await jwtVerify(token, process.env.JWT_SECRET);
        if (!decoded || !decoded.user_id) {
            return res.status(401).json({ message: "Invalid token" });
        }

        const { text } = req.body;
        const { selectedChatbot } = req.params;
        const chatbotVoice = getChatbotVoice(selectedChatbot);
        console.log(chatbotVoice);

        const azureEndpoint = "https://uksouth.tts.speech.microsoft.com/cognitiveservices/v1";

        const response = await axios.post(azureEndpoint, `<speak version='1.0' xml:lang=${chatbotVoice.lang}><voice name=${chatbotVoice.name}>${text}</voice></speak>`, {
            headers: {
                'Ocp-Apim-Subscription-Key': process.env.SYNTHESIS_API_KEY,
                'Content-Type': 'application/ssml+xml',
                'X-Microsoft-OutputFormat': 'riff-24khz-16bit-mono-pcm', //riff-8khz-16bit-mono-pcm OR riff-24khz-16bit-mono-pcm 
                'User-Agent': 'langbuddy'
            },
            responseType: 'arraybuffer'
        });

        res.set({
            'Content-Type': 'audio/wav',
            'Transfer-Encoding': 'chunked'
        });
        res.send(response.data);
        // fs.writeFileSync('output.wav', response.data); //for testing

    } catch (error) {
        console.error("Error synthesizing speech:", error);
        res.status(500).send("Error synthesizing speech");
    }
});

//start a new topic in chatbot
app.post('/chatbot/new-topic/:selectedChatbot', async (req, res) => {
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
        const { selectedChatbot } = req.params;
        const chatbotModel = getChatbotModel(selectedChatbot);

        const newTopic = await pool.query(`
            INSERT INTO ChatMessages 
                (id_user, created_date, chatbot_name, role, content) 
            VALUES 
                ($1, NOW(), $2, $3, $4) 
            RETURNING role, content; 
        `, [userId, chatbotModel.name, 'topic', content]);

        const defaultGreeting = getChatbotGreeting(chatbotModel.name);

        const newGreeting = await pool.query(`
            INSERT INTO ChatMessages 
                (id_user, created_date, chatbot_name, role, content) 
            VALUES 
                ($1, NOW(), $2, $3, $4) 
            RETURNING role, content; 
        `, [userId, chatbotModel.name, 'assistant', defaultGreeting]);

        const combinedMessages = [newTopic.rows[0], newGreeting.rows[0]];
        console.log(combinedMessages);
        res.json(combinedMessages);

    } catch (err) {
        console.error(err.message);
        res.status(500).json("Server error");
    }
});




//get overview statistics for dashboard
app.get('/dashboard', async (req, res) => {
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

        // Fetch study items scheduled today or before today
        const scheduledStudyTodayQuery = `
            SELECT COUNT(*) 
            FROM Study_Items 
            WHERE id_user = $1 AND scheduled_date <= CURRENT_DATE AND status = 'Scheduled';
        `;
        const todayScheduledStudyItems = await pool.query(scheduledStudyTodayQuery, [userId]);
        const numOfScheduledStudyItemsToday = parseInt(todayScheduledStudyItems.rows[0].count);

        // Fetch total number of study items with status 'Scheduled'
        const scheduledStudyTotalQuery = `
            SELECT COUNT(*) 
            FROM Study_Items 
            WHERE id_user = $1 AND status = 'Scheduled';
        `;
        const totalScheduledStudyItems = await pool.query(scheduledStudyTotalQuery, [userId]);
        const numOfScheduledStudyItemsTotal = parseInt(totalScheduledStudyItems.rows[0].count);

        // Fetch total number of study items with status 'Finished'
        const finishedStudyTotalQuery = `
            SELECT COUNT(*) 
            FROM Study_Items 
            WHERE id_user = $1 AND status = 'Finished';
        `;
        const totalFinishedStudyItems = await pool.query(finishedStudyTotalQuery, [userId]);
        const numOfFinishedStudyItemsTotal = parseInt(totalFinishedStudyItems.rows[0].count);


        // Fetch review items which have sessions scheduled today or before today
        const scheduledReviewTodayQuery = `
            SELECT COUNT(DISTINCT i.id_review) 
            FROM Review_Items i 
            JOIN Review_Sessions s ON i.id_review = s.id_review 
            WHERE i.id_user = $1 AND s.status = 'Scheduled' AND s.scheduled_date <= CURRENT_DATE;
        `;
        const todayReviewItems = await pool.query(scheduledReviewTodayQuery, [userId]);


        // Fetch total number of review items which have sessions with status 'Scheduled'
        const scheduledReviewTotalQuery = `
            SELECT COUNT(DISTINCT i.id_review) 
            FROM Review_Items i 
            JOIN Review_Sessions s ON i.id_review = s.id_review 
            WHERE i.id_user = $1 AND s.status = 'Scheduled';
        `;
        const totalScheduledReviewItems = await pool.query(scheduledReviewTotalQuery, [userId]);

        // Fetch total number of review items which have at least one session with status 'Finished' and no sessions with status 'Scheduled'
        const finishedReviewTotalQuery = `
            SELECT COUNT(DISTINCT i.id_review) 
            FROM Review_Items i 
            WHERE i.id_user = $1 
            AND EXISTS (
                SELECT 1 FROM Review_Sessions s 
                WHERE s.id_review = i.id_review AND s.status = 'Finished'
            )
            AND NOT EXISTS (
                SELECT 1 FROM Review_Sessions s 
                WHERE s.id_review = i.id_review AND s.status = 'Scheduled'
            );
        `;
        const totalFinishedReviewItems = await pool.query(finishedReviewTotalQuery, [userId]);

        //get course information
        const id_course = 1;
        const courseQuery = `
            SELECT title, description FROM Courses WHERE id_course = $1;
        `;
        const courseResponse = await pool.query(courseQuery, [id_course]);

        //get course registration information
        const courseRegistrationQuery = `
            SELECT COUNT(*) FROM User_Courses WHERE id_user = $1 AND id_course = $2;
        `;
        const courseRegistrationResponse = await pool.query(courseRegistrationQuery, [userId, id_course]);



        // Respond with the fetched data
        res.json({
            numOfScheduledStudyItemsToday: todayScheduledStudyItems.rows[0].count,
            numOfScheduledStudyItemsTotal: totalScheduledStudyItems.rows[0].count,
            numOfFinishedStudyItemsTotal: totalFinishedStudyItems.rows[0].count,
            numOfScheduledReviewItemsToday: todayReviewItems.rows[0].count,
            numOfScheduledReviewItemsTotal: totalScheduledReviewItems.rows[0].count,
            numOfFinishedReviewItemsTotal: totalFinishedReviewItems.rows[0].count,
            courseTitle: courseResponse.rows[0].title,
            courseDescription: courseResponse.rows[0].description,
            isRegistered: courseRegistrationResponse.rows[0].count > 0 ? true : false
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).json("Server error");
    }
});


// dashboard register a course
app.post('/dashboard/register-course', async (req, res) => {
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

        // Ensure the user isn't already registered for the course
        const alreadyRegistered = await pool.query(
            "SELECT * FROM User_Courses WHERE id_user = $1 AND id_course = 1",
            [userId]
        );

        if (alreadyRegistered.rows.length) {
            return res.status(400).json({ message: "User already registered for the course" });
        }

        // Register the user for the course
        await pool.query(
            "INSERT INTO User_Courses (id_user, id_course, registration_date) VALUES ($1, 1, CURRENT_TIMESTAMP)",
            [userId]
        );

        // Retrieve the default study items for the course
        const defaultStudyItems = await pool.query(
            "SELECT * FROM Course_Default_Study_Items WHERE id_course = 1"
        );

        // Calculate today's date
        const today = new Date();

        // Create study tasks in Study_Items table
        for (let item of defaultStudyItems.rows) {
            let scheduledDate = new Date(today);
            scheduledDate.setDate(today.getDate() + item.scheduled_date_offset);

            await pool.query(
                "INSERT INTO Study_Items (id_user, category, title, content, created_date, scheduled_date, status) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, $5, 'Scheduled')",
                [userId, item.category, item.title, item.content, scheduledDate]
            );
        }

        res.status(200).json({ status: true, message: "Study items created successfully." });


    } catch (err) {
        console.error(err);
        res.status(500).json({ status: false, message: "Server error" });
    }
});



app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})
