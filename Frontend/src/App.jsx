import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

function App() {
  const problems1 = [
    {
      title: 1,
      difficulty: "easy",
      acceptance: "54%",
    },
    {
      title: 2,
      difficulty: "medium",
      acceptance: "40%",
    },
    {
      title: 3,
      difficulty: "hard",
      acceptance: "29%",
    },
  ];

  const problems2 = [
    {
      title: 4,
      difficulty: "easy",
      acceptance: "50%",
    },
    {
      title: 5,
      difficulty: "medium",
      acceptance: "49%",
    },
    {
      title: 6,
      difficulty: "hard",
      acceptance: "39%",
    },
  ];
  const [count, setCount] = useState(0);
  const [problems,setProblems] = useState([])

  return (
    <div>
      <input type="text" placeholder="email" />
      <input type="text" placeholder="password" />
      <button>Sign in</button>
      <br />
      <div>
        <button onClick={()=>{setProblems(problems=>problems1)}}>1</button>
        <button onClick={()=>{setProblems(problems=>problems2)}}>2</button>
      </div>
      <div>
        {problems.map(problem => (
          <ProblemStatement
            title={problem.title}
            acceptance={problem.acceptance}
            difficulty={problem.difficulty}
          />
        ))}
      </div>
    </div>
  );
}

function ProblemStatement(props) {
  const title = props.title;
  const acceptance = props.acceptance;
  const difficulty = props.difficulty;
  return (
    <tr>
      <td>{title}</td>
      <td>{acceptance}</td>
      <td style={{color:difficulty==="hard"?"red":difficulty==="medium"?"blue":"green"}}>{difficulty}</td>
    </tr>
  );
}

export default App;
