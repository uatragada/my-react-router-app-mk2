import { Routes, Route } from "react-router-dom";
import Welcome from "./pages/welcome"; // adjust if your path is different

function App() {
  return (
    <Routes>
      <Route path="/" element={<Welcome />} />
    </Routes>
  );
}

export default App;