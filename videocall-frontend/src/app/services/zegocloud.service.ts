import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { BehaviorSubject } from 'rxjs';
import { ZegoExpressEngine } from 'zego-express-engine-webrtc';
import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root'
})
export class ZegocloudService {
  private zg: ZegoExpressEngine;
  private localStream = new BehaviorSubject<MediaStream | null>(null);
  private remoteStreams = new BehaviorSubject<Map<string, MediaStream>>(new Map());

  constructor() {
    this.zg = new ZegoExpressEngine(environment.zegocloud.appID, environment.zegocloud.serverSecret);
    this.zg.on('roomStateUpdate', (roomId, state, errorCode, extendedData) => {
      console.log('Room state update:', roomId, state, errorCode, extendedData);
    });
    
    this.zg.on('publisherStateUpdate', (result) => {
      console.log('Publisher state update:', result);
    });
  }

  private generateToken(userId: string): string {
    const appId = environment.zegocloud.appID;
    const serverSecret = environment.zegocloud.serverSecret;
    const effectiveTimeInSeconds = 3600; // 1 hour
    const payload = {
      app_id: appId,
      user_id: userId,
      nonce: Math.floor(Math.random() * 100000),
      ctime: Math.floor(Date.now() / 1000),
      expire: Math.floor(Date.now() / 1000) + effectiveTimeInSeconds
    };

    const payloadString = JSON.stringify(payload);
    const hashedString = CryptoJS.HmacSHA256(payloadString, serverSecret);
    return payloadString + '.' + hashedString;
  }

  async initializeRoom(roomId: string, userId: string, userName: string): Promise<void> {
    try {
      const token = this.generateToken(userId);
      
      // Login room with token
      await this.zg.loginRoom(roomId, token, { 
        userID: userId, 
        userName: userName
      });
      
      // Start publishing local stream
      const localStream = await this.zg.createStream({
        camera: {
          video: true,
          audio: true
        }
      });
      
      await this.zg.startPublishingStream(userId, localStream);
      this.localStream.next(localStream);

      // Listen for remote streams
      this.zg.on('roomStreamUpdate', async (roomId, updateType, streamList) => {
        if (updateType === 'ADD') {
          for (const stream of streamList) {
            try {
              const remoteStream = await this.zg.startPlayingStream(stream.streamID);
              const currentStreams = this.remoteStreams.value;
              currentStreams.set(stream.streamID, remoteStream);
              this.remoteStreams.next(currentStreams);
            } catch (error) {
              console.error('Failed to play remote stream:', error);
            }
          }
        } else if (updateType === 'DELETE') {
          for (const stream of streamList) {
            const currentStreams = this.remoteStreams.value;
            if (currentStreams.has(stream.streamID)) {
              await this.zg.stopPlayingStream(stream.streamID);
              currentStreams.delete(stream.streamID);
              this.remoteStreams.next(currentStreams);
            }
          }
        }
      });

    } catch (error) {
      console.error('Failed to initialize room:', error);
      throw error;
    }
  }

  async leaveRoom(roomId: string): Promise<void> {
    try {
      // Stop local stream
      const localStreamValue = this.localStream.value;
      if (localStreamValue) {
        this.zg.destroyStream(localStreamValue);
        this.localStream.next(null);
      }

      // Stop remote streams
      const remoteStreamMap = this.remoteStreams.value;
      for (const [streamId, stream] of remoteStreamMap) {
        await this.zg.stopPlayingStream(streamId);
      }
      this.remoteStreams.next(new Map());

      // Logout from room
      await this.zg.logoutRoom(roomId);
    } catch (error) {
      console.error('Failed to leave room:', error);
      throw error;
    }
  }

  async toggleMicrophone(enabled: boolean): Promise<void> {
    const localStreamValue = this.localStream.value;
    if (localStreamValue) {
      await this.zg.mutePublishStreamAudio(localStreamValue, !enabled);
    }
  }

  async toggleCamera(enabled: boolean): Promise<void> {
    const localStreamValue = this.localStream.value;
    if (localStreamValue) {
      await this.zg.mutePublishStreamVideo(localStreamValue, !enabled);
    }
  }

  // Send chat message
  async sendMessage(roomId: string, message: string): Promise<void> {
    try {
      await this.zg.sendBroadcastMessage(roomId, message);
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  }

  // Getters for streams
  getLocalStream() {
    return this.localStream.asObservable();
  }

  getRemoteStreams() {
    return this.remoteStreams.asObservable();
  }
}
