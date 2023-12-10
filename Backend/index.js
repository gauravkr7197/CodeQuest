const express = require("express");
const jwt = require("jsonwebtoken");
const app = express();
const fs = require("fs");

require("dotenv").config();
app.use(express.json());
const port = 3000;
const secretKey = process.env.SECRETKEY;

// Middleware to check jwt token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization.split(" ")[1];

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

let QUESTIONS = [];
let SUBMISSIONS = {};
let USERS = [];

// Load user data from a file at startup
try {
  const userData = fs.readFileSync("data/users.json");
  const ques = fs.readFileSync("data/questions.json");
  const sub = fs.readFileSync("data/submissions.json");
  USERS = JSON.parse(userData);
  QUESTIONS = JSON.parse(ques);
  SUBMISSIONS = JSON.parse(sub);
} catch (err) {
  console.error("Error reading file:", err);
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
  fs.writeFile("users.json", JSON.stringify(USERS), (err) => {
    if (err) {
      console.error("Error writing users file:", err);
      return res.status(500).json({ message: "Error saving user data." });
    }
    return res
      .status(201)
      .json({ id: newUser.id, username: newUser.username, role: newUser.role });
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

app.get("/questions", verifyToken, function (req, res) {
  //return the user all the questions in the QUESTIONS array
  return res.status(200).send(QUESTIONS);
});


// 
app.post("/questions", verifyToken, (req, res) => {
  try {
    let role = req.user.role;
    if (role == "admin") {
      QUESTIONS.push(req.body.data)
      fs.writeFile("questions.json", JSON.stringify(QUESTIONS), (err) => {
        if (err) {
          console.error("Error writing submissions file:", err);
          return res
            .status(500)
            .json({ message: "Error saving submission data." });
        }
        return res.status(201).json({ message: "Submitted code" });
      });
    } else {
      return res
        .status(200)
        .json({ message: "Not authorized to post questions" });
    }
  } catch (err) {
    return res.status(400).json({ message: err });
  }
});

// To post submissions
app.post("/submissions", verifyToken, function (req, res) {
  try {
    let user_id = req.user.id;

    // Ensure user_id exists as an array in SUBMISSIONS
    if (!SUBMISSIONS[user_id] || !Array.isArray(SUBMISSIONS[user_id])) {
      SUBMISSIONS[user_id] = [];
    }

    // Push req.body.data to SUBMISSIONS[user_id]
    SUBMISSIONS[user_id].push(req.body.data);

    // Write SUBMISSIONS to submissions.json
    fs.writeFile("submissions.json", JSON.stringify(SUBMISSIONS), (err) => {
      if (err) {
        console.error("Error writing submissions file:", err);
        return res
          .status(500)
          .json({ message: "Error saving submission data." });
      }
      return res.status(201).json({ message: "Submitted code" });
    });
  } catch (err) {
    return res.status(400).json({ "Error reading submissions file": err });
  }
});

app.get("/submissions", verifyToken, (req, res) => {
  try {
    if (req.user.id in SUBMISSIONS) {
      return res.status(200).json({ data: SUBMISSIONS[req.user.id] });
    } else {
      return res.status(200).json({ data: "No submissions found" });
    }
  } catch (err) {
    return res.status(400).json({ message: err });
  }
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
