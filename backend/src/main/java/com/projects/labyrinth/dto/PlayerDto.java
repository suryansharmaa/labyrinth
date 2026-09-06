package com.projects.labyrinth.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class PlayerDto {
    private Long id;
    private String userName;
    private Integer score;
}
