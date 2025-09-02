import { db } from "@/lib/database";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  async function gameRunning() {
    const activeGame = await db.isGameRunning();

    if (activeGame)
      navigate("/game")
    else
      navigate("/login")
  }

  useEffect(() => {
    gameRunning();
  })

  return (
    <div>
    </div>
  );
}
