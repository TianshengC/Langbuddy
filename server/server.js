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
            process.env.JWT_SECRET, { expiresIn: "24h" }
        );

        res.setHeader('Set-Cookie', cookie.serialize('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 60 * 60 * 24 , // 1 day
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
  




// CRUD for Study Items

//get all study items by status
app.get('/study/status/:status', async (req, res) => {
  try {
      const token = req.cookies.token;

      if (!token) {
          return res.status(401).json("No token provided");
      }

      const decoded = await jwtVerify(token, process.env.JWT_SECRET);
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


// create a study item
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
app.patch('/study/change-status/:id_study', async (req, res) => {
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
app.patch('/study/edit/:id_study', async (req, res) => {
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


// Review Items and Review Sessions CRUD

//get all review items and sessions by status





//create a review item and related review sessions
app.post('/review', async (req, res) => {
    try {
        const token = req.cookies.token;
  
        if (!token) {
            return res.status(401).json("No token provided");
        }
  
        const decoded = await jwtVerify(token, process.env.JWT_SECRET);
        const userId = decoded.user_id;
  
        
        // Destructure the values from req.body
        const { category, title, content, review_pattern, firstReviewDate } = req.body;
        console.log(req.body);
        console.log(category, title, content, review_pattern, firstReviewDate);

        // Start a transaction
        await pool.query('BEGIN');
  
        // Insert the new review item and get the ID of the newly created item
        const newReviewItem = await pool.query(
            "INSERT INTO review_items (id_user, category, title, content, created_date) VALUES ($1, $2, $3, $4, NOW()) RETURNING id_review",
            [userId, category, title, content]
        );
  
        const reviewItemId = newReviewItem.rows[0].id_review;
        

        // Create the array of review dates and tempDate to be used in the loop
        let scheduledDates;
        const tempDate = firstReviewDate? new Date(firstReviewDate) : new Date();
  
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
  
        // Insert the corresponding review sessions
        for (let date of scheduledDates) {
            await pool.query(
                "INSERT INTO review_sessions (id_review, scheduled_date, status) VALUES ($1, $2, 'Scheduled')",
                [reviewItemId, date]
            );
        }
  
        // Commit the transaction
        await pool.query('COMMIT');
  
        //TODO: return the message to the frontend
        res.json(newReviewItem.rows[0]);
        console.log("New review item created: " + newReviewItem.rows[0]);
    } catch (err) {
        console.error(err.message);
        // If any error occurs, rollback the transaction
        await pool.query('ROLLBACK');
        res.status(500).json("Server error");
    }
  });
  









app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})
