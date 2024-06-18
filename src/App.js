import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "../src/assets/css/bootstrap.min.css";
import PressureMeasuringNurse from "./page/pressureMeasuring_nurse";
import FinanceRoom from "./page/financeRoom"
import ManualQueue1 from "./page/manualQueue1"
import ManualQueue2 from "./page/manualQueue2"
import ManualQueue3 from "./page/manualQueue3"
import ManualQueue4 from "./page/manualQueue4"
import ManualFinaceRoom from "./page/manualFinaceRoom"
import ManualDrugRoom from "./page/manualDrugRoom"
import Queue1 from "./page/queue1"
import Queue2 from "./page/queue2"
import Queue3 from "./page/queue3"
import Queue4 from "./page/queue4"
// import PlaySound from "./page/playSound"
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/Queue1" element={<Queue1 />} />
        <Route path="/Queue2" element={<Queue2 />} />
        <Route path="/Queue3" element={<Queue3 />} />
        <Route path="/Queue4" element={<Queue4 />} />
        <Route path="/PressureMeasuringNurse" element={<PressureMeasuringNurse />} />
        <Route path="/QueueFinance" element={<FinanceRoom />} />
        <Route path="/ManualQueue1" element={<ManualQueue1 />} />
        <Route path="/ManualQueue2" element={<ManualQueue2 />} />
        <Route path="/ManualQueue3" element={<ManualQueue3 />} />
        <Route path="/ManualQueue4" element={<ManualQueue4 />} />
        <Route path="/ManualFinaceRoom" element={<ManualFinaceRoom />} />
        <Route path="/ManualDrugRoom" element={<ManualDrugRoom />} />
        {/* <Route path="/PlaySound" element={<PlaySound />} /> */}
      </Routes>
    </Router>
  );
}

export default App;
