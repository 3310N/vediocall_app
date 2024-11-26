package com.jeeproject.videocall;

import com.jeeproject.videocall.model.User;
import com.jeeproject.videocall.service.UserService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class VideocallApplication {

	public static void main(String[] args) {
		SpringApplication.run(VideocallApplication.class, args);
	}

	@Bean
public CommandLineRunner commandLineRunner(UserService userService) {
    return args -> {
        userService.registerUser(User.builder()  // Changed from register to registerUser
                .username("Salem")
                .email("salem@mail.com")
                .password("test")
                .build());

        userService.registerUser(User.builder()  // Changed from register to registerUser
                .username("Mahdi")
                .email("mahdi@mail.com")
                .password("test")
                .build());

        userService.registerUser(User.builder()  // Changed from register to registerUser
                .username("Ayman")
                .email("ayman@mail.com")
                .password("test")
                .build());
    };
}
}
