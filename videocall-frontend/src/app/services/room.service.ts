import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RoomService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  createRoom(name: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/rooms`, { name });
  }

  joinRoom(roomId: string, userId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/rooms/${roomId}/join`, { userId });
  }

  leaveRoom(roomId: string, userId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/rooms/${roomId}/leave`, { userId });
  }
}
