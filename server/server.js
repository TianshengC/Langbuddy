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
            process.env.JWT_SECRET, { expiresIn: "1h" }
        );

        res.setHeader('Set-Cookie', cookie.serialize('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 60 * 60,
          path: '/',
          sameSite: 'strict'
        }));

        res.json({ 'id_user':user.rows[0].id_user, 'username': user.rows[0].username });
        console.log("backend success login: "+ user.rows[0].user_email);
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
          return res.status(401).json("No token provided");
      }

      // If the token is valid, get the decoded data
      const decoded = await jwtVerify(token, process.env.JWT_SECRET);
      
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
  

// User Profile


// CRUD for Study Items

app.get('/study', async (req, res) => {
  try {
      const token = req.cookies.token;

      if (!token) {
          return res.status(401).json("No token provided");
      }

      const decoded = await jwtVerify(token, process.env.JWT_SECRET);
      const userId = decoded.user_id;

      const studyItems = await pool.query(
          "SELECT * FROM study_items WHERE id_user = $1",
          [userId]
      );

      res.json(studyItems.rows);
  } catch (err) {
      console.error(err.message);
      res.status(500).json("Server error");
  }
});

app.post('/study', async (req, res) => {
  try {
      const token = req.cookies.token;

      if (!token) {
          return res.status(401).json("No token provided");
      }

      const decoded = await jwtVerify(token, process.env.JWT_SECRET);
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
app.patch('/study/status/:id_study', async (req, res) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json("No token provided");
        }

        const decoded = await jwtVerify(token, process.env.JWT_SECRET);
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
app.patch('/study/:id_study', async (req, res) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json("No token provided");
        }

        const decoded = await jwtVerify(token, process.env.JWT_SECRET);
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












app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})
