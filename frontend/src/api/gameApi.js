import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8080/api/rooms",
});

export const createRoom = async (hostUserName) => {
  const response = await API.post("", { hostUserName });
  return response.data;
};

export const joinRoom = async (roomCode, userName) => {
  const response = await API.post(`/${roomCode}/join`, { userName: userName });
  return response.data;
};

export const getRoomState = async (roomCode) => {
  const response = await API.get(`/${roomCode}`);
  return response.data;
};

export const startGame = async (roomCode) => {
  const response = await API.post(`/${roomCode}/start`);
  return response.data;
};

export const submitAnswer = async (roomCode, userName, answer) => {
  const response = await API.post(`/${roomCode}/submit`, {
    userName: userName,
    answer: answer,
  });

  return response.data;
};
