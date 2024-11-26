package com.jeeproject.videocall.service;

import com.jeeproject.videocall.model.Room;
import com.jeeproject.videocall.model.User;
import com.jeeproject.videocall.repository.RoomRepository;
import com.jeeproject.videocall.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class VideoCallService {
    private final RoomRepository roomRepository;
    private final UserRepository userRepository;

    public Room createRoom(String name) {
        Room room = new Room();
        room.setRoomId(UUID.randomUUID().toString());
        room.setName(name);
        room.setParticipants(new HashSet<>());
        room.setActive(true);
        return roomRepository.save(room);
    }

    public Room joinRoom(String roomId, Long userId) {
        Room room = roomRepository.findByRoomId(roomId)
                .orElseThrow(() -> new RuntimeException("Room not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        room.getParticipants().add(user);
        return roomRepository.save(room);
    }

    public Room leaveRoom(String roomId, Long userId) {
        Room room = roomRepository.findByRoomId(roomId)
                .orElseThrow(() -> new RuntimeException("Room not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        room.getParticipants().remove(user);
        if (room.getParticipants().isEmpty()) {
            room.setActive(false);
        }
        return roomRepository.save(room);
    }

    public List<Room> getActiveRooms() {
        return roomRepository.findAll().stream()
                .filter(Room::isActive)
                .toList();
    }
}
