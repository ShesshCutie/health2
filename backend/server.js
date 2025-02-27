const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const db = require("./db");
const multer = require("multer");
const path = require("path");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

// Function to create table if it does not exist
const createTable = () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS personal_info (
      id INT AUTO_INCREMENT PRIMARY KEY,
      firstName VARCHAR(255) NOT NULL,
      middleName VARCHAR(255),
      lastName VARCHAR(255) NOT NULL,
      age INT,
      birthday DATE,
      gender ENUM('Male', 'Female', 'Other'),
      occupation VARCHAR(255),
      image VARCHAR(255)
    )
  `;
  db.query(sql, (err) => {
    if (err) {
      console.error("Error creating table:", err);
    } else {
      console.log("✅ Table 'personal_info' is ready.");
    }
  });
};
createTable(); // Ensure table exists on startup

// Get all patients
app.get("/api/personal-info", (req, res) => {
  const sql = "SELECT * FROM personal_info";
  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Get the latest patient
app.get("/api/personal-info/latest", (req, res) => {
  const sql = "SELECT * FROM personal_info ORDER BY id DESC LIMIT 1";
  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results.length > 0 ? results[0] : { message: "No data found" });
  });
});

// Add a new patient
app.post("/api/personal-info", upload.single("image"), (req, res) => {
  console.log("🔹 Received Data:", req.body);
  console.log("🔹 Uploaded File:", req.file);

  const { firstName, middleName, lastName, age, birthday, gender, occupation } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : null;

  if (!firstName || !lastName) {
    return res.status(400).json({ error: "First and last name are required" });
  }

  const sql = "INSERT INTO personal_info (firstName, middleName, lastName, age, birthday, gender, occupation, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
  db.query(sql, [firstName, middleName, lastName, age, birthday, gender, occupation, image], (err, result) => {
    if (err) {
      console.error("❌ Database Error:", err);
      return res.status(500).json({ error: "Database error: " + err.message });
    }
    res.status(201).json({ message: "Patient added successfully", id: result.insertId });
  });
});



// Update patient details
app.put("/api/personal-info/:id", upload.single("image"), (req, res) => {
  const { id } = req.params;
  const { firstName, middleName, lastName, age, birthday, gender, occupation } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : null;

  if (!firstName || !lastName) {
    return res.status(400).json({ error: "First and last name are required" });
  }

  const sql = image
    ? "UPDATE personal_info SET firstName=?, middleName=?, lastName=?, age=?, birthday=?, gender=?, occupation=?, image=? WHERE id=?"
    : "UPDATE personal_info SET firstName=?, middleName=?, lastName=?, age=?, birthday=?, gender=?, occupation=? WHERE id=?";

  const params = image
    ? [firstName, middleName, lastName, age, birthday, gender, occupation, image, id]
    : [firstName, middleName, lastName, age, birthday, gender, occupation, id];

  db.query(sql, params, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "No patient found to update" });
    }
    res.json({ message: "Patient updated successfully" });
  });
});

// Delete a patient
app.delete("/api/personal-info/:id", (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM personal_info WHERE id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "No patient found to delete" });
    }
    res.json({ message: "Patient deleted successfully" });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);

});
