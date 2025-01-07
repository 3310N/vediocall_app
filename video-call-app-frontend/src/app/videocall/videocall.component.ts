// src/app/videocall/videocall.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

declare const ZegoUIKitPrebuilt: any;

@Component({
  selector: 'app-videocall',
  standalone: true,
  imports: [CommonModule, RouterModule, HttpClientModule],
  templateUrl: './videocall.component.html',
  styleUrls: ['./videocall.component.css']
})
export class VideocallComponent implements OnInit {
  private appID = 1884336302;
  private serverSecret = 'c5f9199946dad0ade9b8e756c8a96ead';

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.getUrlParams(window.location.href);
    this.initializeZegoCloud();
  }

  private getUrlParams(url: string): any {
    try {
      const urlStr = url.split('?')[1];
      const urlSearchParams = new URLSearchParams(urlStr);
      return Object.fromEntries(urlSearchParams.entries());
    } catch (e) {
      return {};
    }
  }

  private async initializeZegoCloud() {
    try {
      const roomID = this.getUrlParams(window.location.href)['roomID'] || 
                    (Math.floor(Math.random() * 10000) + "");
      const userID = Math.floor(Math.random() * 10000) + "";
      const userName = "userName" + userID;
      
      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
        this.appID,
        this.serverSecret,
        roomID,
        userID,
        userName
      );

      const zp = ZegoUIKitPrebuilt.create(kitToken);
      
      zp.joinRoom({
        container: document.querySelector("#root"),
        sharedLinks: [{
          name: 'Personal link',
          url: window.location.protocol + '//' + 
               window.location.host + window.location.pathname + 
               '?roomID=' + roomID,
        }],
        scenario: {
          mode: ZegoUIKitPrebuilt.VideoConference,
        },
        turnOnMicrophoneWhenJoining: false,
        turnOnCameraWhenJoining: false,
        showMyCameraToggleButton: true,
        showMyMicrophoneToggleButton: true,
        showAudioVideoSettingsButton: true,
        showScreenSharingButton: true,
        showTextChat: true,
        showUserList: true,
        maxUsers: 2,
        layout: "Auto",
        showLayoutButton: false,
      });
    } catch (error) {
      console.error('Error initializing ZegoCloud:', error);
    }
  }
}
