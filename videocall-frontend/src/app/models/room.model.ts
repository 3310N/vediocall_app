import { User } from './user.model';

export interface Room {
    id?: number;
    roomId: string;
    name: string;
    isActive: boolean;
    participants?: User[];
}