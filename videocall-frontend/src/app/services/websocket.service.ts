import { Injectable } from '@angular/core';
import { Client, StompConfig } from '@stomp/stompjs';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../models/user.model';
import { Room } from '../models/room.model';
import SockJS from 'sockjs-client';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private client!: Client;
  private roomSubject = new BehaviorSubject<Room | null>(null);
  private usersSubject = new BehaviorSubject<User[]>([]);

  constructor() {
    this.initializeWebSocketConnection();
  }

  private initializeWebSocketConnection() {
    this.client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      debug: (str) => {
        console.log(str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000
    });

    this.client.onConnect = () => {
      console.log('WebSocket Connected!');
      this.subscribeToRoom();
      this.subscribeToUsers();
    };

    this.client.onStompError = (frame) => {
      console.error('STOMP error:', frame);
    };

    this.client.activate();
  }

  private subscribeToRoom() {
    this.client.subscribe('/topic/room', (message) => {
      const room = JSON.parse(message.body);
      this.roomSubject.next(room);
    });
  }

  private subscribeToUsers() {
    this.client.subscribe('/topic/users', (message) => {
      const users = JSON.parse(message.body);
      this.usersSubject.next(users);
    });
  }

  public getRoom(): Observable<Room | null> {
    return this.roomSubject.asObservable();
  }

  public getUsers(): Observable<User[]> {
    return this.usersSubject.asObservable();
  }

  public sendMessage(destination: string, body: any) {
    if (this.client && this.client.connected) {
      this.client.publish({
        destination,
        body: JSON.stringify(body)
      });
    } else {
      console.error('WebSocket is not connected');
    }
  }

  public disconnect() {
    if (this.client) {
      this.client.deactivate();
    }
  }
}
