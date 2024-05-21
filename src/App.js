import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "../src/assets/css/bootstrap.min.css";
import QueueCheck from "./page/queueCheck";
import PressureMeasuringNurse from "./page/pressureMeasuring_nurse";
import FinanceRoom from "./page/financeRoom"
import PlaySound from "./page/playSound"
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/Queue" element={<QueueCheck />} />
        <Route path="/PressureMeasuringNurse" element={<PressureMeasuringNurse />} />
        <Route path="/QueueAll" element={<FinanceRoom />} />
        <Route path="/PlaySound" element={<PlaySound />} />
      </Routes>
    </Router>
  );
}

export default App;
