const express = require("express");
const jwt = require("jsonwebtoken");
const app = express();
const fs = require('fs');

require("dotenv").config();
app.use(express.json());
const port = 3000;
const secretKey = process.env.SECRETKEY;

// Middleware to check jwt token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. Token is missing." });
  }

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Token is not valid." });
    }

    req.user = decoded;
    next();
  });
};

const QUESTIONS = [
  {
    title: "Two states",
    description: "Given an array , return the maximum of the array?",
    testCases: [
      {
        input: "[1,2,3,4,5]",
        output: "5",
      },
    ],
  },
];

let USERS = [];

// Load user data from a file at startup
try {
  const userData = fs.readFileSync('users.json');
  USERS = JSON.parse(userData);
} catch (err) {
  console.error("Error reading users file:", err);
}

// Your signup endpoint
app.post("/signup", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Missing Attributes" });
  }
  
  const lastId = USERS.length > 0 ? USERS[USERS.length - 1].id : 0;
  const newUser = { id: lastId + 1, username, password, role: "user" };
  USERS.push(newUser);

  // Save updated user data to the file
  fs.writeFile('users.json', JSON.stringify(USERS), (err) => {
    if (err) {
      console.error("Error writing users file:", err);
      return res.status(500).json({ message: "Error saving user data." });
    }
    return res.status(201).json({ id: newUser.id, username: newUser.username, role: newUser.role });
  });
});


// Login Route to generate JWT
app.post("/login", (req, res) => {
  // Check credentials (replace with your own authentication logic)
  const { username, password } = req.body;
  const user = USERS.find(
    (u) => u.username === username && u.password === password
  );
  // console.log(user);
  if (!user) {
    return res.status(401).json({ message: "Invalid username or password." });
  }
  // Generate JWT
  const token = jwt.sign(
    { username: user.username, id: user.id, role: user.role },
    secretKey
  );
  res.json({ token });
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
