import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createRoom, joinRoom } from "../api/gameApi";

export default function Home() {
  const navigate = useNavigate();

  // state for Create Room
  const [hostName, setHostName] = useState("");

  // state for Join Room
  const [joinName, setJoinName] = useState("");
  const [roomCode, setRoomCode] = useState("");

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    try {
      const newRoomCode = await createRoom(hostName);
      navigate(`/room/${newRoomCode}`, { state: { userName: hostName } });
    } catch (error) {
      console.error("Error creating room : ", error);
      alert("Failer to create room");
    }
  };

  const handleJoinRoom = async (e) => {
    e.preventDefault();
    try {
      await joinRoom(roomCode, joinName);
      navigate(`/room/${roomCode}`, { state: { userName: joinName } });
    } catch (error) {
      console.error("Error joining room :", error);
      alert("Failed to join room. Check code and try again.");
    }
  };
  return (
    <div
      style={{
        maxWidth: "400px",
        margin: "50px auto",
        fontFamily: "sans-serif",
      }}
    >
      <h1>Labyrinth</h1>

      <div
        style={{
          border: "1px solid #ccc",
          padding: "20px",
          marginBottom: "20px",
        }}
      >
        <h2>Create a Game</h2>
        <form onSubmit={handleCreateRoom}>
          <input
            type="text"
            placeholder="Your Username"
            value={hostName}
            onChange={(e) => setHostName(e.target.value)}
            required
            style={{
              display: "block",
              width: "100%",
              marginBottom: "10px",
              padding: "8px",
            }}
          />
          <button type="submit" style={{ width: "100%", padding: "10px" }}>
            Create Room
          </button>
        </form>
      </div>

      <div style={{ border: "1px solid #ccc", padding: "20px" }}>
        <h2>Join a Game</h2>
        <form onSubmit={handleJoinRoom}>
          <input
            type="text"
            placeholder="Room Code"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value)}
            required
            style={{
              display: "block",
              width: "100%",
              marginBottom: "10px",
              padding: "8px",
            }}
          />
          <input
            type="text"
            placeholder="Your Username"
            value={joinName}
            onChange={(e) => setJoinName(e.target.value)}
            required
            style={{
              display: "block",
              width: "100%",
              marginBottom: "10px",
              padding: "8px",
            }}
          />
          <button type="submit" style={{ width: "100%", padding: "10px" }}>
            Join Room
          </button>
        </form>
      </div>
    </div>
  );
}
