package com.jeeproject.videocall.controller;

import com.jeeproject.videocall.model.Room;
import com.jeeproject.videocall.service.VideoCallService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/video")
public class VideoCallController {
    private final VideoCallService videoCallService;
    private final SimpMessagingTemplate messagingTemplate;

    @PostMapping("/rooms")
    public ResponseEntity<Room> createRoom(@RequestParam String name) {
        return ResponseEntity.ok(videoCallService.createRoom(name));
    }

    @PostMapping("/rooms/{roomId}/join")
    public ResponseEntity<Room> joinRoom(@PathVariable String roomId, @RequestParam Long userId) {
        Room room = videoCallService.joinRoom(roomId, userId);
        messagingTemplate.convertAndSend("/topic/room/" + roomId, 
            Map.of("type", "JOIN", "userId", userId));
        return ResponseEntity.ok(room);
    }

    @PostMapping("/rooms/{roomId}/leave")
    public ResponseEntity<Room> leaveRoom(@PathVariable String roomId, @RequestParam Long userId) {
        Room room = videoCallService.leaveRoom(roomId, userId);
        messagingTemplate.convertAndSend("/topic/room/" + roomId, 
            Map.of("type", "LEAVE", "userId", userId));
        return ResponseEntity.ok(room);
    }

    @GetMapping("/rooms")
    public ResponseEntity<List<Room>> getActiveRooms() {
        return ResponseEntity.ok(videoCallService.getActiveRooms());
    }

    @MessageMapping("/signal")
    public void handleSignaling(@Payload Map<String, Object> signal) {
        String roomId = (String) signal.get("roomId");
        messagingTemplate.convertAndSend("/topic/room/" + roomId, signal);
    }
}
