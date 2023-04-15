const pool = require('../startup/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserController = {
  register: async (req, res) => {
    const { name, email, gender, age, password } = req.body;
    // Validate input data
    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    if (isNaN(age) || age < 18) {
      return res.status(400).json({ error: "You must be at least 18 years old to register" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters long" });
    } else if (password.length > 255) {
      return res.status(400).json({ error: "Password must be less than 255 characters long" });
    }

    try {
      // Check if user with given email already exists
      const [rows, fields] = await pool.query("SELECT * FROM users WHERE email=?", [email]);
      if (rows.length > 0) {
        return res.status(400).json({ error: "User with this email already exists" });
      }

      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Insert user into the database
      const [result] = await pool.query(
        "INSERT INTO users (name , email,age,gender, password) VALUES (?,?,?, ?,?)",
        [name, email, age, gender, hashedPassword]
      );
      const userId = result.insertId;

      // Generate JWT token
      const token = jwt.sign({ userId }, process.env.JWT_SECRET);

      // Send response
      res.status(201).json({ data: { userId, email }, token });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  login: async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    try {
      // Check if user with given email exists
      const [rows, fields] = await pool.query("SELECT * FROM users WHERE email=?", [email]);
      if (rows.length === 0) {
        return res.status(400).json({ error: "Invalid email or password" });
      }

      // Check if password is correct
      const user = rows[0];
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ error: "Invalid email or password" });
      }

      // Generate JWT token
      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);

      // Send response
      res.json({ data: { userId: user.id, email }, token });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    }
  },
  searchUser: async (req, res) => {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    try {
      // Check if user with given email exists
      const [rows, fields] = await pool.query("SELECT * FROM users WHERE email=?", [email]);
      if (rows.length === 0) {
        return res.status(400).json({ error: "User not found." });
      }
      // Send response
      res.status(200).json({ data: "Successfully found." });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
};

module.exports = UserController;
