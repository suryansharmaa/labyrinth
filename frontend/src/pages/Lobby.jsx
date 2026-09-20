import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
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
        console.error("Error fetching room state : ", error);
      }
    };

    fetchState();

    const stompClient = new Client({
      webSocketFactory: () => new SockJS("http://localhost:8080/ws"),
      onConnect: () => {
        console.log("WS Connected successfully!");
        stompClient.subscribe(`/topic/room/${roomCode}`, (message) => {
          console.log("Message received:", message.body);
          const updatedState = JSON.parse(message.body);
          setRoomState(updatedState);

          if (updatedState.status === "IN_PROGRESS") {
            navigate(`/game/${roomCode}`, { state: { userName } });
          }
        });
      },
      onStompError: (frame) => console.error("WS Error:", frame),
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

  if (!roomState)
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        Loading Lobby...
      </div>
    );

  const playerList = roomState.players || roomState.leaderBoard || [];
  const isHost =
    playerList.length > 0 &&
    (playerList[0].userName === userName ||
      playerList[0].username === userName);

  return (
    <div
      style={{
        maxWidth: "600px",
        margin: "50px auto",
        fontFamily: "sans-serif",
      }}
    >
      <h1>Room Code : {roomCode} </h1>
      <p style={{ color: "gray" }}>Waiting for host to start...</p>

      <div
        style={{
          border: "1px solid #ccc",
          padding: "20px",
          marginBottom: "20px",
          backgroundColor: "#f9f9f9",
        }}
      >
        <h3>Players Connected : </h3>
        <ul style={{ listStyleType: "none", padding: 0 }}>
          {roomState.leaderBoard.map((player, index) => (
            <li
              key={index}
              style={{ padding: "8px 0", borderBottom: "1px solid #eee" }}
            >
              🟢 {player.userName || player.username}
            </li>
          ))}
        </ul>
      </div>

      {isHost ? (
        <button
          onClick={handleStartGame}
          style={{
            width: "100%",
            padding: "15px",
            fontSize: "18px",
            cursor: "pointer",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "4px",
          }}
        >
          Start Game
        </button>
      ) : (
        <div
          style={{
            textAlign: "center",
            padding: "15px",
            backgroundColor: "#e0e0e0",
            color: "#555",
            borderRadius: "4px",
          }}
        >
          Waiting for the host to start the game...
        </div>
      )}
    </div>
  );
}
