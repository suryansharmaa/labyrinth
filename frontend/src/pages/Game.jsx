import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
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
      webSocketFactory: () => new SockJS("http://localhost:8080/ws"),
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

  if (!roomState)
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        Loading Game...
      </div>
    );

  if (roomState.status === "FINISHED") {
    return (
      <div
        style={{
          maxWidth: "600px",
          margin: "50px auto",
          textAlign: "center",
          fontFamily: "sans-serif",
        }}
      >
        <h1 style={{ fontSize: "36px", marginBottom: "10px" }}>
          Game Over! 🎉
        </h1>
        <h3 style={{ color: "gray", marginBottom: "30px" }}>Final Results</h3>

        <div
          style={{
            border: "1px solid #ccc",
            padding: "20px",
            background: "#fafafa",
            borderRadius: "8px",
          }}
        >
          <ul style={{ listStyleType: "none", padding: 0, margin: 0 }}>
            {(roomState.players || roomState.leaderBoard || [])
              .sort((a, b) => b.score - a.score)
              .map((player, index) => (
                <li
                  key={index}
                  style={{
                    padding: "15px 0",
                    borderBottom: "1px solid #eee",
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "20px",
                  }}
                >
                  <span>
                    {index === 0 && "🏆 "}
                    {player.userName || player.username}
                  </span>
                  <strong>{player.score} pts</strong>
                </li>
              ))}
          </ul>
        </div>
      </div>
    );
  }

  const currentRiddle = roomState.currQuestion || "Waiting for riddle...";

  return (
    <div
      style={{
        maxWidth: "800px",
        margin: "30px auto",
        fontFamily: "sans-serif",
        display: "flex",
        gap: "20px",
      }}
    >
      <div style={{ flex: 2, border: "1px solid #ccc", padding: "20px" }}>
        <h2>Room : {roomCode} </h2>
        <div
          style={{
            background: "#f4f4f4",
            padding: "15px",
            marginBottom: "20px",
            minHeight: "100px",
          }}
        >
          <h3>Challenge : </h3>
          <p>{currentRiddle}</p>
        </div>

        <form onSubmit={handleSubmit}>
          <textarea
            rows="6"
            value={answerInput}
            onChange={(e) => setAnswerInput(e.target.value)}
            placeholder="Type your answer here..."
            style={{
              width: "100%",
              padding: "10px",
              marginBottom: "10px",
              fontFamily: "monospace",
            }}
            required
          />

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: "100%",
              padding: "12px",
              cursor: isSubmitting ? "not-allowed" : "pointer",
              opacity: isSubmitting ? 0.7 : 1,
            }}
          >
            {isSubmitting ? "Checking..." : "Submit Answer"}
          </button>
        </form>
        {feedback && (
          <p style={{ fontWeight: "bold", marginTop: "10px" }}>{feedback}</p>
        )}
      </div>

      <div
        style={{
          flex: 1,
          border: "1px solid #ccc",
          padding: "20px",
          background: "#fafafa",
        }}
      >
        <h3>LeaderBoard</h3>
        <ul style={{ listStyleType: "none", padding: 0 }}>
          {roomState.leaderBoard.map((player, index) => (
            <li
              key={index}
              style={{
                padding: "8px 0",
                borderBottom: "1px solid #eee",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span>{player.userName || player.username}</span>
              <strong>{player.score} pts</strong>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
