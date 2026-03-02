import { useState } from "react";
import "./styles.css";

export default function History() {
  const [email, setEmail] = useState("");
  const [history, setHistory] = useState([]);

  const loadHistory = async () => {
    const res = await fetch(
      `http://localhost:5000/api/history/${email}`
    );
    const data = await res.json();
    setHistory(data);
  };

  return (
    <div className="container">
      <div className="card">
        <h1>Payment History</h1>

        <input
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button onClick={loadHistory}>View History</button>

        <ul className="history">
          {history.map((p) => (
            <li key={p._id}>
              <b>₹{p.amount}</b> <br />
              {new Date(p.date).toLocaleString()} <br />
              <small>{p.paymentId}</small>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
