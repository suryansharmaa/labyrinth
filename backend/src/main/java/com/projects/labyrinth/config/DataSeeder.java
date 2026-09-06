package com.projects.labyrinth.config;

import com.projects.labyrinth.entity.Riddle;
import com.projects.labyrinth.repository.RiddleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final RiddleRepository riddleRepository;

    @Override
    public void run(String... args) throws Exception {
        if (riddleRepository.count() == 0) {
            Riddle riddle1 = new Riddle();
            riddle1.setQuestion("I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?");
            riddle1.setAnswer("echo");
            riddle1.setDifficulty("EASY");

            Riddle riddle2 = new Riddle();
            riddle2.setQuestion("You measure my life in hours and I serve you by expiring. I'm quick when I'm thin and slow when I'm fat. The wind is my enemy.");
            riddle2.setAnswer("candle");
            riddle2.setDifficulty("MEDIUM");

            Riddle riddle3 = new Riddle();
            riddle3.setQuestion("I have cities, but no houses. I have mountains, but no trees. I have water, but no fish. What am I?");
            riddle3.setAnswer("map");
            riddle3.setDifficulty("EASY");

            riddleRepository.saveAll(List.of(riddle1, riddle2, riddle3));
            System.out.println("Database seeded with fresh riddles!");
        }
    }
}
