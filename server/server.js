require('dotenv').config()
const express = require('express')
const app = express()
const port = process.env.PORT || 5000;
const cors = require('cors')
const pool = require('./db')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const e = require('express');


app.use(express.json())

app.get('/', (req, res) => {
    res.send('Hello World')
})


// User Registration and Login
app.get('/signup', async (req, res) => {
    res.send('Sign up')
})

app.post('/signup', async (req, res) => {
    try {
        const { user_email, password, mother_language } = req.body;

        const saltRounds = 10; 
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = await pool.query(
            "INSERT INTO users (user_email, password_hash, created_date, mother_language) VALUES ($1, $2, $3, $4) RETURNING *",
            [user_email, hashedPassword, new Date(), mother_language]
        );
        res.json(newUser.rows[0]);
    } catch (err) {
        console.error(err.message);
    }
})

app.get('/login', async (req, res) => {
    res.send('Login')
})

app.post('/login', async (req, res) => {
    try {
        const { user_email, password } = req.body;
        
        const user = await pool.query(
            "SELECT * FROM users WHERE user_email = $1",
            [user_email]
        );

        console.log(user.rows[0]);

        if (user.rows.length === 0) {
            return res.status(401).json("Email not found");
        }

        const validPassword = await bcrypt.compare(password, user.rows[0].password_hash);

        if (!validPassword) {
            return res.status(401).json("Invalid password");
        }

        const token = jwt.sign(
            { user: user.rows[0].id_user },
            process.env.JWT_SECRET, { expiresIn: "1h" }
        );

        res.json({ 'id_user':user.rows[0].id_user, token });
    } catch (err) {
        console.error(err.message);
    }
})

// User Profile


// CRUD for Study Items

app.get('/study-items/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const studyItems = await pool.query(
            "SELECT * FROM study_items WHERE id_user = $1",
            [userId]
        );
        res.json(studyItems.rows);
    } catch (err) {
        console.error(err.message);
    }
})










app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})
