import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Term from "./components/terms";
import Portfolio from "./pages/Portfolio";
import Account from "./pages/Account";
import Holdings from "./pages/Holdings";
import 'bootstrap/dist/css/bootstrap.min.css';
import Performance from "./pages/Performance";
import axios from "axios";
import './css/global.css';

axios.defaults.withCredentials = true;

export default function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/terms" element={<Term />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/account" element={<Account />} />
        <Route path="/holdings" element={<Holdings />} />
        <Route path="/performance" element={<Performance />} />
      </Routes>
    </BrowserRouter>
  );
}