package com.projects.labyrinth.controller;

import com.projects.labyrinth.dto.*;
import com.projects.labyrinth.service.GameRoomService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/rooms")
@AllArgsConstructor
public class GameRoomController {
    private final GameRoomService gameRoomService;
    private final SimpMessagingTemplate messagingTemplate;

    @PostMapping
    public ResponseEntity<String> createRoom(@RequestBody CreateGameRoomDto createGameRoomDto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(gameRoomService.createRoom(createGameRoomDto));
    }

    @PostMapping("/{roomCode}/join")
    public ResponseEntity<String> joinRoom(@PathVariable String roomCode, @RequestBody JoinGameRoomDto joinGameRoomDto) {
        gameRoomService.joinRoom(roomCode, joinGameRoomDto);
        GameRoomStateDto updatedState = gameRoomService.getRoomState(roomCode);
        messagingTemplate.convertAndSend("/topic/room/" + roomCode, updatedState);
        return ResponseEntity.status(HttpStatus.OK).body("Joined Successfully");
    }

    @GetMapping("/{roomCode}")
    public ResponseEntity<GameRoomStateDto> getRoomState(@PathVariable String roomCode) {
        return ResponseEntity.status(HttpStatus.OK).body(gameRoomService.getRoomState(roomCode));
    }

    @PostMapping("/{roomCode}/start")
    public ResponseEntity<String> startGame(@PathVariable String roomCode) {
        gameRoomService.startGame(roomCode);
        GameRoomStateDto updatedState = gameRoomService.getRoomState(roomCode);
        messagingTemplate.convertAndSend("/topic/room/" + roomCode, updatedState);
        return ResponseEntity.status(HttpStatus.OK).body("Game started successfully");
    }

    @PostMapping("/{roomCode}/submit")
    public ResponseEntity<AnswerResultDto> submitAnswer(@PathVariable String roomCode, @RequestBody SubmitAnswerDto submitAnswerDto){
        AnswerResultDto result = gameRoomService.submitAnswer(roomCode, submitAnswerDto);
        GameRoomStateDto updatedState = gameRoomService.getRoomState(roomCode);
        messagingTemplate.convertAndSend("/topic/room/" + roomCode, updatedState);
        return ResponseEntity.status(HttpStatus.OK).body(result);
    }
}
