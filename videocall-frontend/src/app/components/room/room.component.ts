import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ZegocloudService } from '../../services/zegocloud.service';
import { RoomService } from '../../services/room.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-room',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule
  ],
  template: `
    <div class="room-container">
      <div class="video-grid">
        <!-- Local video -->
        <div class="video-container">
          <video #localVideo autoplay playsinline muted></video>
          <div class="video-controls">
            <button mat-icon-button (click)="toggleMicrophone()">
              <mat-icon>{{isMicrophoneEnabled ? 'mic' : 'mic_off'}}</mat-icon>
            </button>
            <button mat-icon-button (click)="toggleCamera()">
              <mat-icon>{{isCameraEnabled ? 'videocam' : 'videocam_off'}}</mat-icon>
            </button>
          </div>
        </div>
        <!-- Remote videos -->
        <div class="video-container" *ngFor="let stream of remoteStreams | keyvalue">
          <video [id]="'remote-' + stream.key" autoplay playsinline></video>
        </div>
      </div>

      <!-- Chat section -->
      <div class="chat-container">
        <div class="messages">
          <div *ngFor="let message of messages" class="message">
            <strong>{{message.sender}}:</strong> {{message.content}}
          </div>
        </div>
        <div class="message-input">
          <mat-form-field appearance="outline">
            <input matInput [(ngModel)]="newMessage" placeholder="Type a message..."
                   (keyup.enter)="sendMessage()">
          </mat-form-field>
          <button mat-icon-button (click)="sendMessage()">
            <mat-icon>send</mat-icon>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .room-container {
      display: flex;
      height: 100vh;
      padding: 20px;
      gap: 20px;
    }

    .video-grid {
      flex: 1;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
    }

    .video-container {
      position: relative;
      aspect-ratio: 16/9;
      background: #000;
      border-radius: 8px;
      overflow: hidden;
    }

    video {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .video-controls {
      position: absolute;
      bottom: 10px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 10px;
      background: rgba(0, 0, 0, 0.5);
      padding: 5px;
      border-radius: 20px;
    }

    .chat-container {
      width: 300px;
      display: flex;
      flex-direction: column;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .messages {
      flex: 1;
      padding: 20px;
      overflow-y: auto;
    }

    .message {
      margin-bottom: 10px;
    }

    .message-input {
      padding: 10px;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    mat-form-field {
      flex: 1;
    }
  `]
})
export class RoomComponent implements OnInit, OnDestroy {
  @ViewChild('localVideo') localVideo!: ElementRef<HTMLVideoElement>;
  
  isMicrophoneEnabled = true;
  isCameraEnabled = true;
  messages: { sender: string; content: string }[] = [];
  newMessage = '';
  remoteStreams = new Map<string, MediaStream>();
  roomId: string = '';
  userId: number = 1; // This should come from your auth service
  
  private subscriptions: Subscription[] = [];

  constructor(
    private zegocloud: ZegocloudService,
    private roomService: RoomService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  async ngOnInit() {
    // Get room ID from route params or create a new room
    this.roomId = this.route.snapshot.params['id'];
    
    try {
      if (!this.roomId) {
        // Create a new room
        const roomName = 'Room-' + Math.random().toString(36).substr(2, 9);
        const response = await this.roomService.createRoom(roomName).toPromise();
        this.roomId = response.roomId;
        // Update the URL with the generated room ID
        this.router.navigate(['/room', this.roomId], { replaceUrl: true });
      } else {
        // Join existing room
        await this.roomService.joinRoom(this.roomId, this.userId).toPromise();
      }

      const userId = 'user-' + Math.random().toString(36).substr(2, 9);
      const userName = 'User ' + userId;

      console.log('Initializing room with:', { roomId: this.roomId, userId, userName });
      await this.initializeRoom(this.roomId, userId, userName);

      // Subscribe to streams
      this.subscriptions.push(
        this.zegocloud.getLocalStream().subscribe(stream => {
          if (stream && this.localVideo) {
            this.localVideo.nativeElement.srcObject = stream;
          }
        }),
        this.zegocloud.getRemoteStreams().subscribe(streams => {
          this.remoteStreams = streams;
          streams.forEach((stream, streamId) => {
            const video = document.getElementById('remote-' + streamId) as HTMLVideoElement;
            if (video) {
              video.srcObject = stream;
            }
          });
        })
      );
    } catch (error) {
      console.error('Failed to initialize room:', error);
    }
  }

  async initializeRoom(roomId: string, userId: string, userName: string) {
    try {
      await this.zegocloud.initializeRoom(roomId, userId, userName);
    } catch (error) {
      console.error('Failed to initialize room:', error);
    }
  }

  async toggleMicrophone() {
    this.isMicrophoneEnabled = !this.isMicrophoneEnabled;
    await this.zegocloud.toggleMicrophone(this.isMicrophoneEnabled);
  }

  async toggleCamera() {
    this.isCameraEnabled = !this.isCameraEnabled;
    await this.zegocloud.toggleCamera(this.isCameraEnabled);
  }

  async sendMessage() {
    if (this.newMessage.trim()) {
      try {
        await this.zegocloud.sendMessage(this.roomId, this.newMessage);
        this.messages.push({
          sender: 'You',
          content: this.newMessage
        });
        this.newMessage = '';
      } catch (error) {
        console.error('Failed to send message:', error);
      }
    }
  }

  async ngOnDestroy() {
    // Cleanup subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
    
    try {
      // Leave room in backend
      await this.roomService.leaveRoom(this.roomId, this.userId).toPromise();
      // Leave Zegocloud room
      await this.zegocloud.leaveRoom(this.roomId);
    } catch (error) {
      console.error('Failed to leave room:', error);
    }
  }
}
