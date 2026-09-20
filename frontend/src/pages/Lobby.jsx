import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { getRoomState, startGame } from "../api/gameApi";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

export default function Lobby() {
  const { roomCode } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const userName = location.state?.userName;
  const [roomState, setRoomState] = useState(null);

  useEffect(() => {
    if (!userName) {
      navigate("/");
      return;
    }

    const fetchState = async () => {
      try {
        const state = await getRoomState(roomCode);
        setRoomState(state);

        if (state.status === "IN_PROGRESS") {
          navigate(`/game/${roomCode}`, { state: { userName } });
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchState();

    const stompClient = new Client({
      webSocketFactory: () => new SockJS("http://localhost:8080/ws"),
      onConnect: () => {
        stompClient.subscribe(`/topic/room/${roomCode}`, (message) => {
          const updatedState = JSON.parse(message.body);
          setRoomState(updatedState);

          if (updatedState.status === "IN_PROGRESS") {
            navigate(`/game/${roomCode}`, { state: { userName } });
          }
        });
      },
      onStompError: (frame) => console.error(frame),
    });

    stompClient.activate();
    return () => stompClient.deactivate();
  }, [roomCode, userName, navigate]);

  const handleStartGame = async () => {
    try {
      await startGame(roomCode);
    } catch (error) {
      alert("Failed to start game");
    }
  };

  if (!roomState) {
    return (
      <div className="h-screen w-screen bg-[linear-gradient(135deg,#00FFFF_0%,#B200FF_50%,#FF007F_100%)] flex justify-center items-center font-sans font-black text-4xl text-white drop-shadow-md">
        LOADING...
      </div>
    );
  }

  const playerList = roomState.players || roomState.leaderBoard || [];
  const isHost =
    playerList.length > 0 &&
    (playerList[0].userName === userName ||
      playerList[0].username === userName);

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
    <div className="h-screen w-screen relative bg-[linear-gradient(135deg,#1f1a2a_0%,#137a7f_35%,#e04a22_70%,#febb1b_100%)] font-sans overflow-hidden flex flex-col">
      <nav className="p-4 lg:p-6 flex justify-between shrink-0 relative z-20">
        <div className="bg-neo-yellow px-5 py-2 font-black text-xl border-4 border-black shadow-neo-sm rounded">
          Labyrinth
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

      <motion.div
        animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        className="absolute top-[10%] left-[5%] w-12 h-12 bg-neo-cyan border-4 border-black shadow-neo-sm rounded z-0"
      />
      <motion.div
        animate={{ y: [0, 30, 0], rotate: [0, -15, 0] }}
        transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
        className="absolute bottom-[10%] right-[5%] w-16 h-16 bg-neo-yellow border-4 border-black shadow-neo-sm rounded-full z-0"
      />

      <div className="flex-1 w-full max-w-4xl mx-auto flex flex-col items-center justify-center px-6 pb-8 gap-8 relative z-10">
        <motion.div
          variants={containerVars}
          initial="hidden"
          animate="show"
          className="w-full flex flex-col items-center gap-6"
        >
          <motion.div
            variants={itemVars}
            className="bg-white border-4 border-black shadow-neo p-8 w-full max-w-md text-center rounded"
          >
            <h2 className="text-2xl font-bold mb-2 uppercase">Room Code</h2>
            <div className="text-6xl font-black bg-neo-yellow border-4 border-black inline-block px-6 py-2 shadow-neo-sm rounded">
              {roomCode}
            </div>
          </motion.div>

          <motion.div
            variants={itemVars}
            className="w-full max-w-md bg-neo-cyan border-4 border-black shadow-neo p-6 rounded flex flex-col max-h-[40vh]"
          >
            <h3 className="text-xl font-black mb-4 uppercase border-b-4 border-black pb-2 shrink-0">
              Players in Lobby
            </h3>
            <ul className="flex flex-col gap-3 text-lg font-bold overflow-y-auto pr-2">
              {playerList.map((player, index) => (
                <li
                  key={index}
                  className="flex items-center gap-3 bg-white border-2 border-black p-2 rounded shadow-[2px_2px_0_0_#000]"
                >
                  <span className="bg-black text-white px-2 py-0.5 rounded-sm">
                    {index + 1}
                  </span>
                  <span className="uppercase">
                    {player.userName || player.username}
                  </span>
                  {index === 0 && (
                    <span className="ml-auto text-sm bg-neo-pink text-white px-2 py-1 rounded border-2 border-black">
                      HOST
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </motion.div>

          {isHost ? (
            <motion.button
              variants={itemVars}
              onClick={handleStartGame}
              className="w-full max-w-md p-4 text-2xl font-black uppercase bg-neo-green border-4 border-black shadow-neo-sm rounded cursor-pointer transition-all hover:-translate-x-1 hover:-translate-y-1 hover:shadow-neo active:translate-x-1 active:translate-y-1 active:shadow-none text-black"
            >
              🚀 START GAME
            </motion.button>
          ) : (
            <motion.div
              variants={itemVars}
              className="w-full max-w-md p-4 text-xl font-black uppercase bg-white border-4 border-black shadow-neo-sm rounded text-center"
            >
              WAITING FOR HOST...
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
