// Simple in-memory database for demo purposes
interface HelpRequest {
  _id: string;
  question: string;
  callerId: string;
  sessionId?: string;
  status: 'pending' | 'resolved' | 'unresolved';
  supervisorResponse?: string;
  confidence: number;
  createdAt: Date;
  resolvedAt?: Date;
  timeoutAt: Date;
}

interface KnowledgeItem {
  _id: string;
  question: string;
  answer: string;
  category?: string;
  confidence: number;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

interface CallSession {
  _id: string;
  sessionId: string;
  callerId: string;
  status: 'active' | 'ended';
  startTime: Date;
  endTime?: Date;
  transcript: Array<{
    speaker: 'caller' | 'ai';
    message: string;
    timestamp: Date;
  }>;
  helpRequests: string[];
}

class MemoryDatabase {
  private helpRequests: HelpRequest[] = [];
  private knowledgeItems: KnowledgeItem[] = [
    {
      _id: '1',
      question: "What are your hours?",
      answer: "We're open Monday through Friday from 9 AM to 7 PM, Saturday from 9 AM to 6 PM, and Sunday from 10 AM to 5 PM.",
      category: "Hours",
      confidence: 0.9,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    },
    {
      _id: '2',
      question: "Do you do keratin treatments?",
      answer: "Yes, we offer professional keratin treatments! Our keratin smoothing service reduces frizz and makes hair more manageable. The treatment takes about 2-3 hours and lasts 3-4 months. Prices start at $200.",
      category: "Services",
      confidence: 0.95,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    }
  ];
  private callSessions: CallSession[] = [];
  private idCounter = 1000;

  generateId(): string {
    return (++this.idCounter).toString();
  }

  // Help Requests
  createHelpRequest(data: Omit<HelpRequest, '_id'>): HelpRequest {
    const request: HelpRequest = {
      _id: this.generateId(),
      ...data
    };
    this.helpRequests.unshift(request);
    return request;
  }

  getHelpRequests(filter?: { status?: string }): HelpRequest[] {
    if (filter?.status) {
      return this.helpRequests.filter(r => r.status === filter.status);
    }
    return this.helpRequests;
  }

  getHelpRequestById(id: string): HelpRequest | null {
    return this.helpRequests.find(r => r._id === id) || null;
  }

  updateHelpRequest(id: string, updates: Partial<HelpRequest>): HelpRequest | null {
    const index = this.helpRequests.findIndex(r => r._id === id);
    if (index === -1) return null;
    
    this.helpRequests[index] = { ...this.helpRequests[index], ...updates };
    return this.helpRequests[index];
  }

  // Knowledge Items
  getKnowledgeItems(): KnowledgeItem[] {
    return this.knowledgeItems.filter(item => item.isActive);
  }

  createKnowledgeItem(data: Omit<KnowledgeItem, '_id' | 'createdAt' | 'updatedAt' | 'isActive'>): KnowledgeItem {
    const item: KnowledgeItem = {
      _id: this.generateId(),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    };
    this.knowledgeItems.push(item);
    return item;
  }

  updateKnowledgeItem(id: string, updates: Partial<KnowledgeItem>): KnowledgeItem | null {
    const index = this.knowledgeItems.findIndex(item => item._id === id);
    if (index === -1) return null;
    
    this.knowledgeItems[index] = { 
      ...this.knowledgeItems[index], 
      ...updates, 
      updatedAt: new Date() 
    };
    return this.knowledgeItems[index];
  }

  deleteKnowledgeItem(id: string): boolean {
    const index = this.knowledgeItems.findIndex(item => item._id === id);
    if (index === -1) return false;
    
    this.knowledgeItems[index].isActive = false;
    return true;
  }

  // Call Sessions
  createCallSession(data: Omit<CallSession, '_id'>): CallSession {
    const session: CallSession = {
      _id: this.generateId(),
      ...data
    };
    this.callSessions.push(session);
    return session;
  }

  getCallSessionBySessionId(sessionId: string): CallSession | null {
    return this.callSessions.find(s => s.sessionId === sessionId) || null;
  }

  updateCallSession(sessionId: string, updates: Partial<CallSession>): CallSession | null {
    const index = this.callSessions.findIndex(s => s.sessionId === sessionId);
    if (index === -1) return null;
    
    this.callSessions[index] = { ...this.callSessions[index], ...updates };
    return this.callSessions[index];
  }

  addTranscriptEntry(sessionId: string, entry: { speaker: 'caller' | 'ai'; message: string; timestamp: Date }): boolean {
    const session = this.getCallSessionBySessionId(sessionId);
    if (!session) return false;
    
    session.transcript.push(entry);
    return true;
  }
}

export const memoryDb = new MemoryDatabase();