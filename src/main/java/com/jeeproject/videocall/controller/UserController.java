package com.jeeproject.videocall.controller;

import com.jeeproject.videocall.model.User;
import com.jeeproject.videocall.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "http://localhost:4200")
public class UserController {

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public ResponseEntity<User> register(@RequestBody Map<String, String> request) {
        log.info("Registering user: {} {}", request.get("firstname"), request.get("lastname"));
        User user = User.builder()
                .firstname(request.get("firstname"))
                .lastname(request.get("lastname"))
                .email(request.get("email"))
                .password(passwordEncoder.encode(request.get("password")))
                .status("OFFLINE")
                .build();
        return ResponseEntity.ok(userService.registerUser(user));
    }

    @PostMapping("/login")
    public ResponseEntity<User> login(@RequestBody Map<String, String> request) {
        return ResponseEntity.ok(userService.loginUser(request.get("email")));
    }

    @GetMapping
    public ResponseEntity<List<User>> findAll() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @PostMapping("/status")
    public ResponseEntity<Void> updateStatus(@RequestBody Map<String, String> request) {
        User user = userService.loginUser(request.get("email"));
        userService.updateStatus(user.getId(), request.get("status"));
        return ResponseEntity.ok().build();
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> exception(Exception e) {
        log.error("Error occurred: ", e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
    }
}
