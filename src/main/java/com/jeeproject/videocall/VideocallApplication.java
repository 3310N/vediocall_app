package com.jeeproject.videocall;

import com.jeeproject.videocall.model.User;
import com.jeeproject.videocall.service.UserService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@SpringBootApplication
public class VideocallApplication implements WebMvcConfigurer {

    public static void main(String[] args) {
        SpringApplication.run(VideocallApplication.class, args);
    }

    @Bean
    public CommandLineRunner commandLineRunner(UserService userService) {
        return args -> {
            userService.registerUser(User.builder()
                    .username("Salem")
                    .email("salem@mail.com")
                    .password("test")
                    .build());

            userService.registerUser(User.builder()
                    .username("Mahdi")
                    .email("mahdi@mail.com")
                    .password("test")
                    .build());

            userService.registerUser(User.builder()
                    .username("Ayman")
                    .email("ayman@mail.com")
                    .password("test123456")
                    .build());
        };
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:4200") // Adjust this to your frontend's URL
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS");
    }
}