import OpenAI from 'openai';
import KnowledgeItem from '../models/KnowledgeItem';

let openai: OpenAI | null = null;

const getOpenAI = () => {
  if (!openai && process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }
  return openai;
};

export interface AIResponse {
  answer: string;
  confidence: number;
  shouldEscalate: boolean;
}

export class AIService {
  private confidenceThreshold = 0.5;

  async processQuestion(question: string): Promise<AIResponse> {
    try {
      // First, try direct knowledge base matching
      const directMatch = await this.findDirectMatch(question);
      if (directMatch) {
        return directMatch;
      }

      // Then try OpenAI if available
      const openaiClient = getOpenAI();
      if (openaiClient) {
        return await this.processWithOpenAI(question, openaiClient);
      }

      // Final fallback
      return await this.fallbackResponse(question);

    } catch (error) {
      console.error('AI Service error:', error);
      return await this.fallbackResponse(question);
    }
  }

  private async findDirectMatch(question: string): Promise<AIResponse | null> {
    const knowledgeItems = await this.searchKnowledgeBase(question);
    
    if (knowledgeItems.length > 0) {
      const bestMatch = knowledgeItems[0];
      
      // Check for exact or very close matches
      const questionLower = question.toLowerCase();
      const knowledgeQuestionLower = bestMatch.question.toLowerCase();
      
      // Simple keyword matching
      const questionWords = questionLower.split(' ').filter(w => w.length > 3);
      const matchingWords = questionWords.filter(word => 
        knowledgeQuestionLower.includes(word)
      );
      
      const matchRatio = matchingWords.length / questionWords.length;
      
      if (matchRatio > 0.5) { // If more than 50% of words match
        return {
          answer: bestMatch.answer,
          confidence: 0.9,
          shouldEscalate: false
        };
      }
    }
    
    return null;
  }

  private async processWithOpenAI(question: string, openaiClient: any): Promise<AIResponse> {
    const knowledgeItems = await this.searchKnowledgeBase(question);
    
    let context = '';
    if (knowledgeItems.length > 0) {
      context = knowledgeItems.map(item => 
        `Q: ${item.question}\nA: ${item.answer}`
      ).join('\n\n');
    }

    const systemPrompt = `You are a helpful AI assistant for a salon/spa business. 
    ${context ? `Use this knowledge base to answer questions:\n\n${context}\n\n` : ''}
    
    Answer customer questions professionally and helpfully. If you're not confident about an answer or don't have enough information, indicate low confidence.
    
    Respond with a JSON object containing:
    - "answer": your response to the customer
    - "confidence": a number between 0 and 1 indicating your confidence
    
    Be conversational and friendly, but concise.`;

    const completion = await openaiClient.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: question }
      ],
      temperature: 0.3
    });

    const responseText = completion.choices[0]?.message?.content;
    if (!responseText) {
      throw new Error('No response from OpenAI');
    }

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(responseText);
    } catch {
      parsedResponse = {
        answer: responseText,
        confidence: 0.5
      };
    }

    const confidence = Math.max(0, Math.min(1, parsedResponse.confidence || 0.5));
    const shouldEscalate = confidence < this.confidenceThreshold;

    return {
      answer: parsedResponse.answer || responseText,
      confidence,
      shouldEscalate
    };
  }

  private async fallbackResponse(question: string): Promise<AIResponse> {
    // Try to match against knowledge base directly
    const knowledgeItems = await this.searchKnowledgeBase(question);
    if (knowledgeItems.length > 0) {
      const bestMatch = knowledgeItems[0];
      return {
        answer: bestMatch.answer,
        confidence: 0.7,
        shouldEscalate: false
      };
    }
    
    return {
      answer: "I'm having trouble processing your question right now. Let me get a supervisor to help you.",
      confidence: 0,
      shouldEscalate: true
    };
  }

  private async searchKnowledgeBase(question: string) {
    try {
      // Simple text search - in production, you might use vector embeddings
      return await KnowledgeItem.find({
        $text: { $search: question },
        isActive: true
      }).limit(3).sort({ confidence: -1 });
    } catch {
      // If text index doesn't exist, fall back to regex search
      return await KnowledgeItem.find({
        question: { $regex: question, $options: 'i' },
        isActive: true
      }).limit(3);
    }
  }

  async generateSpeech(text: string): Promise<Buffer> {
    try {
      const openaiClient = getOpenAI();
      if (!openaiClient) {
        throw new Error('OpenAI API key not configured');
      }

      const mp3 = await openaiClient.audio.speech.create({
        model: "tts-1",
        voice: "alloy",
        input: text,
      });

      return Buffer.from(await mp3.arrayBuffer());
    } catch (error) {
      console.error('Speech generation error:', error);
      throw error;
    }
  }

  async transcribeAudio(audioBuffer: Buffer): Promise<string> {
    try {
      const openaiClient = getOpenAI();
      if (!openaiClient) {
        throw new Error('OpenAI API key not configured');
      }

      const transcription = await openaiClient.audio.transcriptions.create({
        file: new File([audioBuffer], "audio.wav", { type: "audio/wav" }),
        model: "whisper-1",
      });

      return transcription.text;
    } catch (error) {
      console.error('Transcription error:', error);
      throw error;
    }
  }
}