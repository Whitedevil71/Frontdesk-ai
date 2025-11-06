import { AIService } from '../services/aiService';

// Mock OpenAI
jest.mock('openai', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue({
            choices: [{
              message: {
                content: JSON.stringify({
                  answer: "Test response",
                  confidence: 0.8
                })
              }
            }]
          })
        }
      }
    }))
  };
});

describe('AIService', () => {
  let aiService: AIService;

  beforeEach(() => {
    aiService = new AIService();
  });

  describe('processQuestion', () => {
    it('should return direct response for high confidence', async () => {
      const result = await aiService.processQuestion('What are your hours?');
      
      expect(result).toHaveProperty('answer');
      expect(result).toHaveProperty('confidence');
      expect(result).toHaveProperty('shouldEscalate');
      expect(typeof result.confidence).toBe('number');
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
    });

    it('should handle errors gracefully', async () => {
      // Mock a failure
      const mockCreate = jest.fn().mockRejectedValue(new Error('API Error'));
      (aiService as any).openai = {
        chat: {
          completions: {
            create: mockCreate
          }
        }
      };

      const result = await aiService.processQuestion('Test question');
      
      expect(result.shouldEscalate).toBe(true);
      expect(result.confidence).toBe(0);
    });
  });
});