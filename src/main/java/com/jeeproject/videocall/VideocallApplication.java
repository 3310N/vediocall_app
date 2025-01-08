package com.jeeproject.videocall;

import com.jeeproject.videocall.model.User;
import com.jeeproject.videocall.service.UserService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@SpringBootApplication
public class VideocallApplication implements WebMvcConfigurer {

    public static void main(String[] args) {
        SpringApplication.run(VideocallApplication.class, args);
    }

    @Bean
    public CommandLineRunner commandLineRunner(UserService userService, PasswordEncoder passwordEncoder) {
        return args -> {
            userService.registerUser(User.builder()
                    .firstname("Salem")
                    .lastname("Salem")
                    .email("salem@mail.com")
                    .password(passwordEncoder.encode("test"))
                    .status("OFFLINE")
                    .build());

            userService.registerUser(User.builder()
                    .firstname("Mahdi")
                    .lastname("Mahdi")
                    .email("mahdi@mail.com")
                    .password(passwordEncoder.encode("test"))
                    .status("OFFLINE")
                    .build());

            userService.registerUser(User.builder()
                    .firstname("Ayman")
                    .lastname("Ayman")
                    .email("ayman@mail.com")
                    .password(passwordEncoder.encode("test123456"))
                    .status("OFFLINE")
                    .build());
        };
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:4200")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS");
    }
}