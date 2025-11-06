export class MockLiveKitService {
  async generateAccessToken(roomName: string, participantName: string): Promise<string> {
    // Return a mock token for demo purposes
    return `mock-token-${roomName}-${participantName}-${Date.now()}`;
  }

  async createRoom(roomName: string): Promise<void> {
    console.log(`Mock: Created room ${roomName}`);
  }

  async endRoom(roomName: string): Promise<void> {
    console.log(`Mock: Ended room ${roomName}`);
  }

  async listParticipants(roomName: string) {
    console.log(`Mock: Listed participants for room ${roomName}`);
    return [];
  }
}