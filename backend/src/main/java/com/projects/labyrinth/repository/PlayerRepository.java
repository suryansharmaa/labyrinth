package com.projects.labyrinth.repository;

import com.projects.labyrinth.entity.Player;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PlayerRepository extends JpaRepository<Player, Long> {
    List<Player> findByGameRoomIdOrderByScoreDesc(Long gameRoomId);
    Optional<Player> findByGameRoomIdAndUserName(Long gameRoomId, String username);
}
