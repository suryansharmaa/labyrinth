package com.projects.labyrinth.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AnswerResultDto {
    private boolean isCorrect;
    private int currScore;
    private String message;
}
