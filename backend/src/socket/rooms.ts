interface User {
  id: string;
  email: string;
  color: string;
}

interface RoomUser extends User {
  socketId: string;
  joinedAt: number;
}

export class RoomManager {
  private rooms: Map<string, Map<string, RoomUser>> = new Map();

  addUserToRoom(roomId: string, socketId: string, user: User): void {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Map());
    }

    const room = this.rooms.get(roomId)!;
    room.set(socketId, {
      ...user,
      socketId,
      joinedAt: Date.now(),
    });
  }

  removeUserFromRoom(roomId: string, socketId: string): RoomUser | null {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    const user = room.get(socketId) || null;
    room.delete(socketId);

    if (room.size === 0) {
      this.rooms.delete(roomId);
    }

    return user;
  }

  getRoomUsers(roomId: string): RoomUser[] {
    const room = this.rooms.get(roomId);
    return room ? Array.from(room.values()) : [];
  }

  getUserCount(roomId: string): number {
    return this.rooms.get(roomId)?.size || 0;
  }

  isUserInRoom(roomId: string, socketId: string): boolean {
    return this.rooms.get(roomId)?.has(socketId) || false;
  }

  getAllRooms(): string[] {
    return Array.from(this.rooms.keys());
  }

  getRoomStats(): { [roomId: string]: number } {
    const stats: { [roomId: string]: number } = {};
    
    this.rooms.forEach((users, roomId) => {
      stats[roomId] = users.size;
    });

    return stats;
  }
}
