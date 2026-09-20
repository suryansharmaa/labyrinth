import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { getRoomState, submitAnswer } from "../api/gameApi";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

export default function Game() {
  const { roomCode } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const submitLock = useRef(false);

  const userName = location.state?.userName;
  const [roomState, setRoomState] = useState(null);
  const [answerInput, setAnswerInput] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!userName) {
      navigate("/");
      return;
    }

    const fetchState = async () => {
      try {
        const state = await getRoomState(roomCode);
        setRoomState(state);
      } catch (error) {
        console.error("Error fetching game state : ", error);
      }
    };

    fetchState();

    const stompClient = new Client({
      webSocketFactory: () => new SockJS(import.meta.env.VITE_WS_URL),
      onConnect: () => {
        stompClient.subscribe(`/topic/room/${roomCode}`, (message) => {
          setRoomState(JSON.parse(message.body));
        });
      },
    });

    stompClient.activate();
    return () => stompClient.deactivate();
  }, [roomCode, userName, navigate]);

  useEffect(() => {
    if (roomState?.currQuestion) {
      setAnswerInput("");
      setFeedback("");
    }
  }, [roomState?.currQuestion]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (submitLock.current || !answerInput.trim()) return;

    submitLock.current = true;
    setIsSubmitting(true);

    try {
      const response = await submitAnswer(roomCode, userName, answerInput);

      if (response?.correct) {
        setFeedback("Correct!");
        setAnswerInput("");
      } else {
        setFeedback("Incorrect! Try Again");
      }
    } catch (error) {
      console.error("Error submitting answer:", error);
      setFeedback("Submission failed.");
    } finally {
      submitLock.current = false;
      setIsSubmitting(false);
    }
  };

  if (!roomState) {
    return (
      <div className="h-screen w-screen bg-[linear-gradient(135deg,#00FFFF_0%,#B200FF_50%,#FF007F_100%)] flex justify-center items-center font-sans font-black text-4xl text-white drop-shadow-md">
        LOADING GAME...
      </div>
    );
  }

  if (roomState.status === "FINISHED") {
    return (
      <div className="h-screen w-screen relative bg-[linear-gradient(135deg,#1f1a2a_0%,#137a7f_35%,#e04a22_70%,#febb1b_100%)] font-sans overflow-hidden flex flex-col">
        <nav className="p-4 lg:p-6 flex justify-between shrink-0 relative z-20">
          <div
            onClick={() => navigate("/")}
            className="bg-neo-yellow px-5 py-2 font-black text-xl border-4 border-black shadow-neo-sm rounded cursor-pointer transition-all hover:-translate-x-1 hover:-translate-y-1 hover:shadow-neo active:translate-x-1 active:translate-y-1 active:shadow-none text-black select-none"
          >
            LABYRINTH
          </div>
        </nav>

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

        <div className="flex-1 w-full max-w-4xl mx-auto flex flex-col items-center justify-center px-6 pb-8 z-10 relative">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", bounce: 0.5 }}
            className="w-full bg-white border-[6px] border-black shadow-neo p-8 rounded flex flex-col items-center max-h-full overflow-hidden"
          >
            <div className="text-7xl mb-4">🏆</div>
            <h1 className="text-5xl lg:text-6xl font-black mb-8 uppercase text-center drop-shadow-md text-black">
              Game Over!
            </h1>

            <div className="w-full bg-neo-yellow border-4 border-black p-6 shadow-[6px_6px_0_0_#000] rounded flex flex-col overflow-hidden">
              <h2 className="text-2xl font-black border-b-4 border-black pb-2 mb-4 shrink-0 text-black">
                FINAL STANDINGS
              </h2>
              <ul className="flex flex-col gap-3 overflow-y-auto pr-2">
                {(roomState.players || roomState.leaderBoard || [])
                  .sort((a, b) => b.score - a.score)
                  .map((player, index) => (
                    <li
                      key={index}
                      className="flex justify-between items-center text-xl lg:text-2xl font-bold p-3 bg-white border-2 border-black rounded shadow-[2px_2px_0_0_#000]"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-black text-neo-yellow px-2 py-1 bg-black rounded">
                          #{index + 1}
                        </span>
                        <span className="uppercase text-black">
                          {player.userName || player.username}
                        </span>
                      </div>
                      <span className="font-black text-black">
                        {player.score} pts
                      </span>
                    </li>
                  ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  const currentRiddle = roomState.currQuestion || "Waiting for riddle...";

  return (
    <div className="h-screen w-screen relative bg-[linear-gradient(135deg,#1f1a2a_0%,#137a7f_35%,#e04a22_70%,#febb1b_100%)] font-sans overflow-hidden flex flex-col">
      <nav className="p-4 lg:p-6 flex justify-between shrink-0 relative z-20 items-center">
        <div
          className="bg-neo-yellow px-5 py-2 font-black text-xl border-4 border-black shadow-neo-sm rounded text-black cursor-not-allowed select-none"
          title="Finish the game to return to home!"
        >
          Labyrinth
        </div>
        <div className="bg-white border-4 border-black px-4 py-2 shadow-neo-sm font-bold text-lg rounded text-black">
          ROOM:{" "}
          <span className="text-neo-purple font-black ml-2">{roomCode}</span>
        </div>
      </nav>

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

      <div className="flex-1 w-full max-w-7xl mx-auto flex flex-col lg:flex-row gap-6 px-6 pb-8 relative z-10 overflow-hidden">
        {/* Left Side: Challenge & Input */}
        <div className="flex-[2] flex flex-col gap-6 h-full min-h-0">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex-1 bg-white border-4 border-black shadow-neo rounded flex flex-col overflow-hidden"
          >
            {/* Static header area for the badge prevents ANY overlap */}
            <div className="p-5 pb-0 shrink-0">
              <span className="inline-block bg-neo-cyan font-black border-4 border-black px-3 py-1 shadow-[4px_4px_0_0_#000] text-xl rounded text-black">
                CHALLENGE
              </span>
            </div>

            {/* Removed flex-centering. Text now anchors to the top and scrolls safely down. */}
            <div className="flex-1 overflow-y-auto p-6 lg:p-8">
              <h2 className="text-3xl lg:text-4xl xl:text-5xl font-black leading-tight text-center text-black">
                {currentRiddle}
              </h2>
            </div>
          </motion.div>

          <motion.form
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            onSubmit={handleSubmit}
            className="shrink-0 bg-neo-pink border-4 border-black shadow-neo rounded p-6 flex flex-col gap-4"
          >
            {feedback && (
              <div
                className={`p-3 font-black text-xl border-4 border-black shadow-neo-sm rounded text-center ${feedback.includes("Correct") ? "bg-neo-green text-black" : "bg-white text-red-600"}`}
              >
                {feedback}
              </div>
            )}

            <div className="flex flex-col gap-4">
              <textarea
                rows="3"
                className="w-full p-4 text-xl lg:text-2xl font-bold border-4 border-black rounded bg-white shadow-neo-sm outline-none focus:bg-neo-yellow transition-colors resize-none text-black font-mono"
                placeholder="TYPE YOUR ANSWER HERE..."
                value={answerInput}
                onChange={(e) => setAnswerInput(e.target.value)}
                disabled={isSubmitting}
                required
                autoFocus
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 text-2xl font-black uppercase bg-neo-purple text-white border-4 border-black shadow-neo-sm rounded cursor-pointer transition-all hover:-translate-x-1 hover:-translate-y-1 hover:shadow-neo active:translate-x-1 active:translate-y-1 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "CHECKING..." : "SUBMIT ANSWER"}
              </button>
            </div>
          </motion.form>
        </div>

        {/* Right Side: Leaderboard */}
        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="flex-1 bg-neo-yellow border-4 border-black shadow-neo rounded p-6 flex flex-col h-full min-h-0"
        >
          <h3 className="text-2xl font-black mb-4 uppercase border-b-4 border-black pb-2 shrink-0 text-black">
            Leaderboard
          </h3>
          <ul className="flex flex-col gap-4 overflow-y-auto pr-2 pb-2 flex-1">
            {(roomState.leaderBoard || [])
              .sort((a, b) => b.score - a.score)
              .map((p, i) => (
                <li
                  key={i}
                  className="flex justify-between items-center bg-white border-4 border-black shadow-[4px_4px_0_0_#000] p-4 rounded text-xl font-bold shrink-0 text-black"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 border-2 border-black font-black rounded ${i === 0 ? "bg-neo-green" : i === 1 ? "bg-neo-cyan" : i === 2 ? "bg-neo-pink text-white" : "bg-gray-200"}`}
                    >
                      #{i + 1}
                    </span>
                    <span className="uppercase">
                      {p.userName || p.username}
                    </span>
                  </div>
                  <span className="text-2xl font-black">{p.score}</span>
                </li>
              ))}
          </ul>
        </motion.div>
      </div>
    </div>
  );
}
