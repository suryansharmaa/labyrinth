package com.projects.labyrinth.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class GameRoomStateDto {
    private String roomCode;
    private String status;
    private String currQuestion;
    private List<PlayerDto> leaderBoard;
}
