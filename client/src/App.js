import {Routes, Route} from "react-router-dom"
import './App.css';
import { Home } from "./pages/Home";
import { Pages } from "./pages/Pages";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home/>} />
      <Route path="/room/:roomId" element={<Pages/>} />
    </Routes>
  );
}

export default App;
