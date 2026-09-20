package com.projects.labyrinth.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;

@Entity
@Getter
@Setter
@Table(name = "gameRooms")
public class GameRoom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 6)
    private String roomCode;

    @Column(nullable = false)
    private String status;

    @ManyToOne
    @JoinColumn(name = "currRiddleId")
    private Riddle currRiddle;

    private Instant startedAt;

    @ElementCollection
    @CollectionTable(name = "game_room_asked_riddles", joinColumns = @JoinColumn(name = "game_room_id"))
    @Column(name = "riddle_id")
    private Set<Long> askedRiddleIds = new HashSet<>();
}
