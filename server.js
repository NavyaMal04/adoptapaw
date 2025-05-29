const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const bcrypt = require('bcrypt');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// MySQL connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

db.connect(err => {
  if (err) {
    console.error('MySQL connection error:', err);
    return;
  }
  console.log('Connected to MySQL');
});

// Get all pets from the database
app.get('/api/pets', (req, res) => {
  db.query('SELECT * FROM Pet', (err, results) => {
    if (err) {
      console.error('Error fetching pets:', err);
      return res.status(500).json({ error: 'Database query failed' });
    }
    res.json(results);
  });
});

// Adoption POST endpoint
app.post('/api/adoption', (req, res) => {
  const { Adopter_ID, Pet_ID, Adoption_Date } = req.body;

  if (!Adopter_ID || !Pet_ID || !Adoption_Date) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  // Set fixed adoption fee here
  const fixedAdoptionFee = 200.00;

  const query = `
    INSERT INTO Adoption (Adopter_ID, Pet_ID, Adoption_Date, Adoption_Fees)
    VALUES (?, ?, ?, ?)
  `;

  db.query(query, [Adopter_ID, Pet_ID, Adoption_Date, fixedAdoptionFee], (err, result) => {
    if (err) {
      console.error('Error inserting adoption record:', err);
      return res.status(500).json({ message: 'Database error while inserting adoption record.' });
    }

    res.status(200).json({ message: 'Adoption successfully recorded!' });
  });
});

// Signup Route
app.post('/api/signup', async (req, res) => {
  const { Name, Email, Password } = req.body;
  const hashedPassword = await bcrypt.hash(Password, 10);
  const sql = 'INSERT INTO Adopter (Name, Email, Password) VALUES (?, ?, ?)';

  db.query(sql, [Name, Email, hashedPassword], (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ message: 'Email already registered' });
      }
      console.error('Signup error:', err);
      return res.status(500).json({ message: 'Signup failed' });
    }
    res.status(200).json({ message: 'Signup successful' });
  });
});

// Login Route
app.post('/api/login', (req, res) => {
  const { Email, Password } = req.body;
  const sql = 'SELECT * FROM Adopter WHERE Email = ?';

  db.query(sql, [Email], async (err, results) => {
    if (err || results.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password', success: false });
    }

    const user = results[0];
    const match = await bcrypt.compare(Password, user.Password);

    if (match) {
      res.json({
        message: 'Login successful',
        success: true,
        Adopter_ID: user.Adopter_ID,
        Name: user.Name
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password', success: false });
    }
  });
});

// Serve HTML on root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.listen(process.env.PORT || 5000, () => {
  console.log('Server running on port 5000');
});
