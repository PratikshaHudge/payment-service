import { useNavigate } from "react-router-dom";

export default function DonateHome() {
  const navigate = useNavigate();

  return (
    <div className="simple-page">
      <button
        className="simple-donate-btn"
        onClick={() => navigate("/donate")}
      >
        DONATE <span className="heart">❤️</span>
      </button>
    </div>
  );
}
