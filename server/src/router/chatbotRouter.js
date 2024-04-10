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
const { getChatbotModel, getChatbotGreeting, getChatbotVoice } = require('../utils/chatbotModel');





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