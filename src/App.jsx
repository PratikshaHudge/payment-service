import { BrowserRouter, Routes, Route } from "react-router-dom";
import DonateHome from "./DonateHome";
import Donate from "./Donate";
import History from "./History";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DonateHome />} />
        <Route path="/donate" element={<Donate />} />
        <Route path="/history" element={<History />} />
      </Routes>
    </BrowserRouter>
  );
}
