const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

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

// Get all pets
app.get('/api/pets', (req, res) => {
  db.query('SELECT * FROM Pet', (err, results) => {
    if (err) {
      console.error('Error fetching pets:', err);
      return res.status(500).json({ error: 'Database query failed' });
    }
    res.json(results);
  });
});

// Get all shelters
app.get('/api/shelters', (req, res) => {
  db.query('SELECT * FROM Shelter', (err, results) => {
    if (err) {
      console.error('Error fetching shelters:', err);
      return res.status(500).json({ error: 'Failed to fetch shelters' });
    }
    res.json(results);
  });
});

// Adoption endpoint
app.post('/api/adoption', (req, res) => {
  const { Adopter_ID, Pet_ID, Adoption_Date } = req.body;

  if (!Adopter_ID || !Pet_ID || !Adoption_Date) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const fixedAdoptionFee = 200.00;
  const query = `INSERT INTO Adoption (Adopter_ID, Pet_ID, Adoption_Date, Adoption_Fees) VALUES (?, ?, ?, ?)`;

  db.query(query, [Adopter_ID, Pet_ID, Adoption_Date, fixedAdoptionFee], (err, result) => {
    if (err) {
      console.error('Error inserting adoption record:', err);
      return res.status(500).json({ message: 'Database error while inserting adoption record.' });
    }
    res.status(200).json({ message: 'Adoption successfully recorded!' });
  });
});

// Visit Request Endpoint (insert into Adopter table)
app.post('/api/visit-request', (req, res) => {
  const { fullName, email, phone, visitDate, preferredTime, notes } = req.body;

  if (!fullName || !email || !phone || !visitDate || !preferredTime) {
    return res.status(400).json({ message: 'Please fill in all required fields.' });
  }

  const sql = `INSERT INTO Adopter (Name, Email, Phone, VisitDate, PreferredTime, Notes)
               VALUES (?, ?, ?, ?, ?, ?)`;

  db.query(sql, [fullName, email, phone, visitDate, preferredTime, notes || ''], (err, result) => {
    if (err) {
      console.error('Visit request error:', err);
      return res.status(500).json({ message: 'Failed to submit visit request' });
    }
    res.status(200).json({ message: 'Visit request submitted successfully!' });
  });
});

// Serve frontend homepage
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
