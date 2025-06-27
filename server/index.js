const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken"); // ✅ Import JWT
const EmployeeModel = require("./models/employee");
const Transaction = require("./models/Transaction"); // ✅ Import this

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect('mongodb://127.0.0.1:27017/Penta');

// Secret key for JWT (You can move this to .env)
const JWT_SECRET = "your_secret_key_here"; // ❗ Make this complex in production

// Register route
app.post('/register', (req, res) => {
  EmployeeModel.create(req.body)
    .then(employee => res.json(employee))
    .catch(err => res.json(err));
});



app.post('/transactions', async (req, res) => {
  try {
    const newTransaction = new Transaction(req.body);
    await newTransaction.save();
    res.status(201).json({ message: 'Transaction added', data: newTransaction });
  } catch (error) {
    res.status(500).json({ message: 'Error adding transaction', error });
  }
});








// Login route
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  EmployeeModel.findOne({ email: email })
    .then(user => {
      if (!user) return res.json("No account found");

      if (user.password !== password)
        return res.json("Incorrect password");

      // ✅ Create token
      const token = jwt.sign(
        { id: user._id, email: user.email },
        JWT_SECRET,
        { expiresIn: "2h" }
      );


      // ✅ Send name or username with token
      res.json({
        status: "Success",
        token,
        username: user.name || user.username || 'User'  // customize as per your schema
      });
    })
    .catch(err => res.status(500).json("Error: " + err));
});



app.get('/transactions', async (req, res) => {
    try {
      const transactions = await Transaction.find();
      res.json(transactions);
    } catch (error) {
      console.error("❌ Error fetching transactions:", error); // 👈 important
      res.status(500).json({ message: "Error fetching transactions", error });
    }
  });
  
  
  app.listen(3001, () => {
    console.log("✅ Server running at http://localhost:3001");
  });





