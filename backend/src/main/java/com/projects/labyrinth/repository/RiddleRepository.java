package com.projects.labyrinth.repository;

import com.projects.labyrinth.entity.Riddle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RiddleRepository extends JpaRepository<Riddle, Long> {
}
