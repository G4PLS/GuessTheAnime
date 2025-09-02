// App.tsx
import { HashRouter, Routes, Route } from "react-router-dom";
import { Header } from "@/components/Header/Header";
import Home from "./routes/home";
import Login from "./routes/login";
import Game from "./routes/game";

export default function App() {
  return (
    <HashRouter>
      <div className="flex flex-col w-full h-full">
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/game" element={<Game />} />
          <Route path="*" element={<h1>404 - Not Found</h1>} />
        </Routes>
      </div>
    </HashRouter>
  );
}
