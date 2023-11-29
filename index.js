const express = require("express");
const jwt = require("jsonwebtoken");
const app = express();
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

const USERS = [
  { id: 1, username: "user1", password: "password1", role: "admin" },
  { id: 1, username: "user2", password: "password2", role: "user" },
];

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

// Login Route to generate JWT
app.post("/login", (req, res) => {
  // Check credentials (replace with your own authentication logic)
  const { username, password } = req.body;
  const user = USERS.find(
    (u) => u.username === username && u.password === password
  );
  console.log(user);

  if (!user) {
    return res.status(401).json({ message: "Invalid username or password." });
  }

  // Generate JWT
  const token = jwt.sign({ username: user.username, id: user.id ,role:user.role}, secretKey);
  res.json({ token });
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
