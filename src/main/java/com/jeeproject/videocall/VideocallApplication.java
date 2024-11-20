package com.jeeproject.videocall;

import com.jeeproject.videocall.user.User;
import com.jeeproject.videocall.user.UserService;
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
			userService.register(User.builder()
					.username("Salem")
					.email("salem@mail.com")
					.password("test")
					.build());

			userService.register(User.builder()
					.username("Mahdi")
					.email("mahdi@mail.com")
					.password("test")
					.build());

			userService.register(User.builder()
					.username("Ayman")
					.email("ayman@mail.com")
					.password("test")
					.build());
		};
	}

}
