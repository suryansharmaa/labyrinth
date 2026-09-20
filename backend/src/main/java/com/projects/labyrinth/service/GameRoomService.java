package com.projects.labyrinth.service;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.projects.labyrinth.dto.AnswerResultDto;
import com.projects.labyrinth.dto.CreateGameRoomDto;
import com.projects.labyrinth.dto.GameRoomStateDto;
import com.projects.labyrinth.dto.JoinGameRoomDto;
import com.projects.labyrinth.dto.PlayerDto;
import com.projects.labyrinth.dto.SubmitAnswerDto;
import com.projects.labyrinth.entity.GameRoom;
import com.projects.labyrinth.entity.Player;
import com.projects.labyrinth.entity.Riddle;
import com.projects.labyrinth.repository.GameRoomRepository;
import com.projects.labyrinth.repository.PlayerRepository;
import com.projects.labyrinth.repository.RiddleRepository;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class GameRoomService {
    private final GameRoomRepository gameRoomRepository;
    private final PlayerRepository playerRepository;
    private final RiddleRepository riddleRepository;

    public String createRoom(CreateGameRoomDto createGameRoomDto) {
        String roomCode = UUID.randomUUID().toString().substring(0, 6).toUpperCase();

        GameRoom room = new GameRoom();
        room.setRoomCode(roomCode);
        room.setStatus("WAITING");
        gameRoomRepository.save(room);

        Player host = new Player();
        host.setUserName(createGameRoomDto.getHostUserName());
        host.setScore(0);
        host.setGameRoom(room);
        playerRepository.save(host);

        return roomCode;
    }

    @Transactional
    public void joinRoom(String roomCode, JoinGameRoomDto joinGameRoomDto) {
        GameRoom room = gameRoomRepository.findByRoomCode(roomCode)
                .orElseThrow(() -> new RuntimeException("Room Not Found"));

        if (!room.getStatus().equals("WAITING")) {
            throw new RuntimeException("Game already in progress");
        }

        Player player = new Player();
        player.setUserName(joinGameRoomDto.getUserName());
        player.setScore(0);
        player.setGameRoom(room);

        playerRepository.save(player);
    }

    @Transactional(readOnly = true)
    public GameRoomStateDto getRoomState(String roomCode) {
        GameRoom room = gameRoomRepository.findByRoomCode(roomCode)
                .orElseThrow(() -> new RuntimeException("Room not found"));
        List<Player> players = playerRepository.findByGameRoomIdOrderByScoreDesc(room.getId());

        GameRoomStateDto gameRoomStateDto = new GameRoomStateDto();
        gameRoomStateDto.setRoomCode(room.getRoomCode());
        gameRoomStateDto.setStatus(room.getStatus());

        if (room.getCurrRiddle() != null) {
            gameRoomStateDto.setCurrQuestion(room.getCurrRiddle().getQuestion());
        }

        List<PlayerDto> leaderBoard = players.stream().map(player -> {
            PlayerDto playerDto = new PlayerDto();
            playerDto.setId(player.getId());
            playerDto.setUserName(player.getUserName());
            playerDto.setScore(player.getScore());
            return playerDto;
        }).toList();

        gameRoomStateDto.setLeaderBoard(leaderBoard);
        return gameRoomStateDto;
    }

    @Transactional
    public void startGame(String roomCode) {
        GameRoom room = gameRoomRepository.findByRoomCode(roomCode)
                .orElseThrow(() -> new RuntimeException("Room not found"));

        if (!room.getStatus().equals("WAITING")) {
            throw new RuntimeException("Game already started");
        }

        long riddleCount = riddleRepository.count();
        if (riddleCount == 0) {
            throw new RuntimeException("No riddles found");
        }

        List<Riddle> riddles = riddleRepository.findAll();
        int random = (int) (Math.random() * riddles.size());
        Riddle startRiddle = riddles.get(random);

        room.setStatus("IN_PROGRESS");
        room.setCurrRiddle(startRiddle);

        gameRoomRepository.save(room);
    }

    @Transactional
    public AnswerResultDto submitAnswer(String roomCode, SubmitAnswerDto submitAnswerDto) {
        GameRoom room = gameRoomRepository.findByRoomCode(roomCode)
                .orElseThrow(() -> new RuntimeException("Room not found"));

        if (!room.getStatus().equals("IN_PROGRESS")) {
            throw new RuntimeException("Game is not active");
        }

        Player player = playerRepository.findByGameRoomIdAndUserName(room.getId(), submitAnswerDto.getUserName())
                .orElseThrow(() -> new RuntimeException("Player not found in this room"));

        Riddle currRiddle = room.getCurrRiddle();
        boolean correct = currRiddle.getAnswer().equalsIgnoreCase(submitAnswerDto.getAnswer().trim());

        AnswerResultDto result = new AnswerResultDto();
        result.setCorrect(correct);

        if (correct) {
            player.setScore(player.getScore() + 10);
            playerRepository.save(player);

            System.out.println("DEBUG: Solved Riddle ID: " + currRiddle.getId());
            room.getAskedRiddleIds().add(currRiddle.getId());

            List<Riddle> allRiddles = riddleRepository.findAll();
            List<Riddle> availableRiddles = allRiddles.stream()
                    .filter(r -> !room.getAskedRiddleIds().contains(r.getId()))
                    .toList();

            System.out.println("DEBUG: Remaining Riddles: " + availableRiddles.size());

            if (availableRiddles.isEmpty()) {
                System.out.println("DEBUG: Triggering FINISHED state.");
                room.setStatus("FINISHED");
                room.setCurrRiddle(null);
                gameRoomRepository.save(room);
                result.setMessage("Correct! Game Over!");
            } else {
                int randomIndex = (int) (Math.random() * availableRiddles.size());
                Riddle nextRiddle = availableRiddles.get(randomIndex);
                System.out.println("DEBUG: Assigned New Riddle ID: " + nextRiddle.getId());
                room.setCurrRiddle(nextRiddle);
                gameRoomRepository.save(room);
                result.setMessage("Correct answer!");
            }
        } else {
            result.setMessage("Incorrect. Try again.");
        }

        result.setCurrScore(player.getScore());
        return result;
    }
}
