import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { createRoom, joinRoom } from "../api/gameApi";

export default function Home() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [error, setError] = useState("");

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (!userName.trim()) return setError("Username required to create a room");
    try {
      const newRoomCode = await createRoom(userName);
      navigate(`/room/${newRoomCode}`, { state: { userName } });
    } catch (err) {
      setError("Failed to create room.");
    }
  };

  const handleJoinRoom = async (e) => {
    e.preventDefault();
    if (!userName.trim() || !roomCode.trim())
      return setError("Username and Room ID required");
    try {
      await joinRoom(roomCode, userName);
      navigate(`/room/${roomCode}`, { state: { userName } });
    } catch (err) {
      setError("Failed to join room. Check code and try again.");
    }
  };

  const containerVars = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 },
    },
  };

  const itemVars = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120 } },
  };

  return (
    // 1. Rigorously constrained to exactly 100vh, flex-column, with a high-saturation background gradient
    <div className="h-screen w-screen relative bg-[linear-gradient(135deg,#1f1a2a_0%,#137a7f_35%,#e04a22_70%,#febb1b_100%)] font-sans overflow-hidden flex flex-col">
      {/* Navbar (shrink-0 prevents it from squishing) */}
      <nav className="p-4 lg:p-6 flex justify-between shrink-0 relative z-20">
        <div className="bg-neo-yellow px-5 py-2 font-black text-xl border-4 border-black shadow-neo-sm rounded">
          Labyrinth
        </div>
      </nav>

      {/* Floating Background Shapes */}
      {/* 1. Full-screen Dot Grid Overlay */}
      <div className="absolute inset-0 bg-neo-dots pointer-events-none z-0"></div>

      {/* 2. Expanded Floating Background Shapes */}
      {/* Original Cyan Square (Top Left) */}
      <motion.div
        animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        className="absolute top-[12%] left-[6%] w-12 h-12 bg-neo-cyan border-4 border-black shadow-neo-sm rounded z-0"
      />
      {/* New Green Pill (Top Right) */}
      <motion.div
        animate={{ y: [0, 20, 0], rotate: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
        className="absolute top-[20%] right-[15%] w-20 h-8 bg-neo-green border-4 border-black shadow-neo-sm rounded-full z-0 hidden lg:block"
      />
      {/* New Purple Square (Bottom Left) */}
      <motion.div
        animate={{ x: [0, 15, 0], rotate: [0, 25, 0] }}
        transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
        className="absolute bottom-[25%] left-[12%] w-14 h-14 bg-neo-purple border-4 border-black shadow-neo-sm z-0 hidden lg:block"
      />
      {/* Original Yellow Circle (Bottom Right) */}
      <motion.div
        animate={{ y: [0, -30, 0], rotate: [0, -15, 0] }}
        transition={{ repeat: Infinity, duration: 5.5, ease: "easeInOut" }}
        className="absolute bottom-[10%] right-[6%] w-16 h-16 bg-neo-yellow border-4 border-black shadow-neo-sm rounded-full z-0"
      />

      {/* 2. Main Content Area: Takes up exactly the remaining vertical space (flex-1) */}
      <div className="flex-1 w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between px-6 lg:px-12 pb-8 gap-8 relative z-10">
        {/* Left Column: Text & Forms */}
        <motion.div
          className="flex-1 w-full max-w-md xl:max-w-lg"
          variants={containerVars}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={itemVars} className="mb-4 flex gap-2">
            <span className="bg-black text-white px-3 py-1 font-bold text-xs lg:text-sm rounded-full tracking-wide">
              ⚡ REAL-TIME MULTIPLAYER
            </span>
            <span className="bg-neo-pink text-white px-3 py-1 font-bold text-xs lg:text-sm rounded-full border-2 border-black tracking-wide">
              ⚔️ VS FRIENDS
            </span>
          </motion.div>

          <motion.h1
            variants={itemVars}
            className="text-5xl xl:text-6xl font-black leading-tight mb-4 text-black drop-shadow-md"
          >
            Challenge
            <br />
            Your Mind
          </motion.h1>

          <motion.p
            variants={itemVars}
            className="text-base lg:text-lg font-bold mb-6 text-black/90"
          >
            Dive into the ultimate riddle-solving arena. Compete in real-time,
            race against the clock, and prove you're the sharpest mind alive!
            🧠⚡
          </motion.p>

          {error && (
            <motion.p
              variants={itemVars}
              className="text-white font-black bg-red-600 p-2 mb-3 border-4 border-black shadow-neo-sm"
            >
              {error}
            </motion.p>
          )}

          {/* Forms: Tightened padding/gaps to prevent vertical overflow */}
          <motion.form variants={itemVars} className="flex flex-col gap-3">
            <input
              className="w-full p-2.5 lg:p-3 text-base lg:text-lg font-bold border-4 border-black rounded bg-neo-yellow shadow-neo-sm outline-none focus:bg-white transition-colors"
              placeholder="ENTER USERNAME"
              value={userName}
              onChange={(e) => setUserName(e.target.value.toUpperCase())}
              required
            />

            <div className="flex gap-3">
              <input
                className="flex-1 p-2.5 lg:p-3 text-base lg:text-lg font-bold border-4 border-black rounded bg-neo-green shadow-neo-sm outline-none focus:bg-white transition-colors"
                placeholder="ROOM ID"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              />
              <button
                type="button"
                className="px-6 py-2.5 lg:py-3 text-lg lg:text-xl font-black uppercase bg-white border-4 border-black shadow-neo-sm rounded cursor-pointer transition-all hover:-translate-x-1 hover:-translate-y-1 hover:shadow-neo active:translate-x-1 active:translate-y-1 active:shadow-none"
                onClick={handleJoinRoom}
              >
                JOIN ✓
              </button>
            </div>

            <div className="text-center font-black my-1">
              <span className="bg-neo-cyan px-4 py-1 border-4 border-black rounded-full shadow-[2px_2px_0px_#000] text-sm">
                OR
              </span>
            </div>

            <button
              type="button"
              className="w-full p-3 lg:p-4 text-lg lg:text-xl text-white font-black uppercase bg-neo-purple border-4 border-black shadow-neo-sm rounded cursor-pointer transition-all flex justify-center items-center gap-2 hover:-translate-x-1 hover:-translate-y-1 hover:shadow-neo active:translate-x-1 active:translate-y-1 active:shadow-none"
              onClick={handleCreateRoom}
            >
              ⚙️ CREATE ROOM
            </button>
          </motion.form>
        </motion.div>

        {/* Right Column: Hero Graphic (Your exact code implementation) */}
        <motion.div
          className="flex-1 hidden lg:flex justify-end items-center"
          initial={{ opacity: 0, scale: 0.8, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", bounce: 0.4, duration: 1, delay: 0.2 }}
        >
          {/* Main card wrapper from your code */}
          <div className="relative hidden lg:block w-full max-w-md xl:max-w-lg cursor-pointer">
            <div className="relative bg-white border-[6px] border-black shadow-[8px_8px_0_0_#000] p-1 rotate-[2deg] hover:rotate-0 transition-transform duration-500 group overflow-hidden">
              <img
                src="https://plus.unsplash.com/premium_vector-1743985813494-e1cf9bb3c0bf?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDZ8fHxlbnwwfHx8fHw%3D&auto=format&fit=crop&q=60&w=600"
                alt="Abstract colorful brain puzzle"
                className="w-full aspect-[4/3] object-cover border-[3px] border-black group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
