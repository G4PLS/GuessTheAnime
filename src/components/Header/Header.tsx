import { useState, useEffect, useRef } from "react";
import {
  ClockIcon,
  ArrowRightEndOnRectangleIcon,
  ChartBarIcon,
} from "@heroicons/react/16/solid";
import { IconButton } from "../IconButton/IconButton";
import type { GuessedMediaDto } from "@/types/dtos/guessedMediaDto";
import { db } from "@/lib/database";
import Popup from "../Popup/Popup";
import { useLocation, useNavigate } from "react-router-dom";
export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isHistoryOpen, setHistoryOpen] = useState(false);
  const [isStatsOpen, setStatsOpen] = useState(false);
  const [isLogoutOpen, setLogoutOpen] = useState(false);

  const [isPageLogin, setPageLogin] = useState(false);

  async function handleLogout() {
    await db.resetDatabase();
    setLogoutOpen(false);
    navigate("/");
  }

  useEffect(() => {
    if (location.pathname === "/")
      setPageLogin(true);
    else
      setPageLogin(false);
  },[location])

  return (
    <>
      <main className="pl-3 pr-3 flex flex-row bg-amber-500 h-12 items-center">
        <header className="flex flex-row justify-between items-center w-full">
          <h1 className="text-2xl font-bold">Guess the Anime</h1>
          <nav className="flex flex-row gap-2 items-center">
            <IconButton onClick={() => setHistoryOpen(true)}>
              <ClockIcon className="w-5 h-5" />
            </IconButton>
            <IconButton onClick={() => setStatsOpen(true)}>
              <ChartBarIcon className="w-5 h-5" />
            </IconButton>

            {!isPageLogin && (
              <IconButton onClick={() => setLogoutOpen(true)}>
              <ArrowRightEndOnRectangleIcon className="w-5 h-5" />
            </IconButton>
            )}
          </nav>
        </header>
      </main>

      <Popup isOpen={isHistoryOpen} onClose={() => {{setHistoryOpen(false)}}}>
        <h2>HISTORY</h2>
      </Popup>

      <Popup isOpen={isStatsOpen} onClose={() => {{setStatsOpen(false)}}}>
        <h2>STATS</h2>
      </Popup>

      <Popup isOpen={isLogoutOpen} onClose={() => setLogoutOpen(false)}>
        <h2 className="text-xl font-bold mb-2">LOGOUT</h2>
        <p className="mb-4 text-red-600">
          Warning: Everything will be lost if you log out!
        </p>

        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            onClick={() => setLogoutOpen(false)}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </Popup>
    </>
  );
}
