import { AccessToken, RoomServiceClient } from 'livekit-server-sdk';

export class LiveKitService {
  private roomService: RoomServiceClient | null = null;

  private getRoomService(): RoomServiceClient {
    if (!this.roomService && process.env.LIVEKIT_URL && process.env.LIVEKIT_API_KEY && process.env.LIVEKIT_API_SECRET) {
      this.roomService = new RoomServiceClient(
        process.env.LIVEKIT_URL,
        process.env.LIVEKIT_API_KEY,
        process.env.LIVEKIT_API_SECRET
      );
    }
    if (!this.roomService) {
      throw new Error('LiveKit credentials not configured');
    }
    return this.roomService;
  }

  async generateAccessToken(roomName: string, participantName: string): Promise<string> {
    if (!process.env.LIVEKIT_API_KEY || !process.env.LIVEKIT_API_SECRET) {
      throw new Error('LiveKit credentials not configured');
    }

    const token = new AccessToken(
      process.env.LIVEKIT_API_KEY,
      process.env.LIVEKIT_API_SECRET,
      {
        identity: participantName,
        ttl: '1h'
      }
    );

    token.addGrant({
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true
    });

    return await token.toJwt();
  }

  async createRoom(roomName: string): Promise<void> {
    try {
      const roomService = this.getRoomService();
      await roomService.createRoom({
        name: roomName,
        emptyTimeout: 300, // 5 minutes
        maxParticipants: 10
      });
    } catch (error) {
      // Room might already exist, which is fine
      console.log('Room creation result:', error);
    }
  }

  async endRoom(roomName: string): Promise<void> {
    try {
      const roomService = this.getRoomService();
      await roomService.deleteRoom(roomName);
    } catch (error) {
      console.error('Error ending room:', error);
    }
  }

  async listParticipants(roomName: string) {
    try {
      const roomService = this.getRoomService();
      const participants = await roomService.listParticipants(roomName);
      return participants;
    } catch (error) {
      console.error('Error listing participants:', error);
      return [];
    }
  }
}