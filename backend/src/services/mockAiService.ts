export interface AIResponse {
  answer: string;
  confidence: number;
  shouldEscalate: boolean;
}

export class MockAIService {
  private confidenceThreshold = 0.7;
  
  // Mock knowledge base for demo
  private mockKnowledge = [
    {
      question: "what are your hours",
      answer: "We're open Monday through Friday from 9 AM to 7 PM, Saturday from 9 AM to 6 PM, and Sunday from 10 AM to 5 PM.",
      confidence: 0.9
    },
    {
      question: "do you do keratin treatments",
      answer: "Yes, we offer professional keratin treatments! Our keratin smoothing service reduces frizz and makes hair more manageable. The treatment takes about 2-3 hours and lasts 3-4 months. Prices start at $200.",
      confidence: 0.95
    },
    {
      question: "how much is a haircut",
      answer: "Our haircut prices vary by stylist level: Junior stylists start at $45, Senior stylists at $65, and Master stylists at $85. All cuts include a wash and style.",
      confidence: 0.9
    }
  ];

  async processQuestion(question: string): Promise<AIResponse> {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const normalizedQuestion = question.toLowerCase();
    
    // Check if we have knowledge about this question
    const knowledgeMatch = this.mockKnowledge.find(item => 
      normalizedQuestion.includes(item.question) || 
      item.question.includes(normalizedQuestion.split(' ').slice(0, 3).join(' '))
    );

    if (knowledgeMatch) {
      return {
        answer: knowledgeMatch.answer,
        confidence: knowledgeMatch.confidence,
        shouldEscalate: false
      };
    }

    // Questions that should escalate (low confidence)
    const escalationTriggers = [
      'cancellation policy',
      'same-day',
      'wedding packages',
      'pricing for',
      'book appointment',
      'availability'
    ];

    const shouldEscalate = escalationTriggers.some(trigger => 
      normalizedQuestion.includes(trigger)
    );

    if (shouldEscalate) {
      return {
        answer: "Let me check with my supervisor and get back to you shortly.",
        confidence: 0.3,
        shouldEscalate: true
      };
    }

    // Default response for unknown questions
    return {
      answer: "I'm not sure about that specific question. Let me get a supervisor to help you with the details.",
      confidence: 0.4,
      shouldEscalate: true
    };
  }

  async generateSpeech(text: string): Promise<Buffer> {
    // Mock speech generation - return empty buffer
    return Buffer.from('mock-audio-data');
  }

  async transcribeAudio(audioBuffer: Buffer): Promise<string> {
    // Mock transcription
    return "Mock transcription of audio input";
  }
}