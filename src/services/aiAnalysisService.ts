/**
 * AI Analysis Service - Integrates OpenAI and Google Gemini APIs
 * Provides real NLP-based resume parsing and analysis
 */

export interface AIAnalysisResponse {
  score: number;
  jobMatch: number | null;
  strengths: string[];
  improvements: string[];
  currentSkills: string[];
  suggestedSkills: string[];
  skillsToAcquire: string[];
  suitedRoles: string[];
}

type AIProvider = 'openai' | 'gemini';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

class AIAnalysisService {
  private provider: AIProvider;
  private apiKey: string;

  constructor(provider: AIProvider = 'openai', apiKey?: string) {
    this.provider = provider;
    this.apiKey = apiKey || this.getApiKeyFromEnv();
    if (!this.apiKey) {
      throw new Error(
        `No API key provided for ${provider}. Set ${provider === 'openai' ? 'VITE_OPENAI_API_KEY' : 'VITE_GEMINI_API_KEY'} environment variable.`
      );
    }
  }

  private getApiKeyFromEnv(): string {
    if (this.provider === 'openai') {
      return (import.meta.env as any).VITE_OPENAI_API_KEY || '';
    } else {
      return (import.meta.env as any).VITE_GEMINI_API_KEY || '';
    }
  }

  private getAnalysisPrompt(resumeText: string, jobTitle?: string): string {
    return `You are an expert resume analyst and HR professional. Analyze the following resume and provide detailed feedback.

${jobTitle ? `The candidate is applying for: ${jobTitle}\n` : ''}

RESUME:
${resumeText}

Provide your analysis in the following JSON format (return ONLY valid JSON, no markdown):
{
  "score": <number 1-100>,
  "jobMatch": ${jobTitle ? '<number 0-100 or null>' : 'null'},
  "strengths": [<up to 6 specific strengths found in the resume>],
  "improvements": [<up to 6 actionable improvements>],
  "currentSkills": [<list of detected technical/professional skills>],
  "suggestedSkills": [<list of beneficial skills to add>],
  "skillsToAcquire": [<list of skills critical for the target role>],
  "suitedRoles": [<list of roles this person is well-suited for>]
}

Requirements:
- Score should reflect overall resume quality (1-100)
${jobTitle ? '- JobMatch should reflect how well the resume matches the specified role (0-100)' : '- jobMatch should be null since no target role specified'}
- Be specific and actionable in suggestions
- Extract skills from the actual resume content
- Provide realistic career guidance
- Return ONLY valid JSON, no additional text`;
  }

  async analyzeWithOpenAI(resumeText: string, jobTitle?: string): Promise<AIAnalysisResponse> {
    const prompt = this.getAnalysisPrompt(resumeText, jobTitle);

    try {
      const response = await fetch(OPENAI_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are an expert resume analyst. Always respond with valid JSON only, no markdown formatting.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content.trim();

      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in OpenAI response');
      }

      const result = JSON.parse(jsonMatch[0]) as AIAnalysisResponse;
      return this.validateAndNormalizeResponse(result);
    } catch (error) {
      console.error('OpenAI analysis error:', error);
      throw error;
    }
  }

  async analyzeWithGemini(resumeText: string, jobTitle?: string): Promise<AIAnalysisResponse> {
    const prompt = this.getAnalysisPrompt(resumeText, jobTitle);

    try {
      const response = await fetch(`${GEMINI_API_URL}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2000,
          },
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Gemini API error: ${error.error?.message || response.statusText}`);
      }

      const data = await response.json();
      const content = data.candidates[0].content.parts[0].text.trim();

      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in Gemini response');
      }

      const result = JSON.parse(jsonMatch[0]) as AIAnalysisResponse;
      return this.validateAndNormalizeResponse(result);
    } catch (error) {
      console.error('Gemini analysis error:', error);
      throw error;
    }
  }

  private validateAndNormalizeResponse(result: any): AIAnalysisResponse {
    // Ensure all fields exist with proper defaults
    return {
      score: Math.min(100, Math.max(1, Math.round(result.score || 50))),
      jobMatch: result.jobMatch === null ? null : Math.min(100, Math.max(0, Math.round(result.jobMatch || 0))),
      strengths: Array.isArray(result.strengths) ? result.strengths.slice(0, 6) : [],
      improvements: Array.isArray(result.improvements) ? result.improvements.slice(0, 6) : [],
      currentSkills: Array.isArray(result.currentSkills) ? result.currentSkills.slice(0, 12) : [],
      suggestedSkills: Array.isArray(result.suggestedSkills) ? result.suggestedSkills.slice(0, 8) : [],
      skillsToAcquire: Array.isArray(result.skillsToAcquire) ? result.skillsToAcquire.slice(0, 8) : [],
      suitedRoles: Array.isArray(result.suitedRoles) ? result.suitedRoles.slice(0, 6) : [],
    };
  }

  async analyze(resumeText: string, jobTitle?: string): Promise<AIAnalysisResponse> {
    if (!resumeText || resumeText.trim().length < 50) {
      throw new Error('Resume text is too short. Please provide at least 50 characters.');
    }

    if (this.provider === 'openai') {
      return this.analyzeWithOpenAI(resumeText, jobTitle);
    } else {
      return this.analyzeWithGemini(resumeText, jobTitle);
    }
  }

  static setProvider(provider: AIProvider, apiKey?: string): AIAnalysisService {
    return new AIAnalysisService(provider, apiKey);
  }
}

export default AIAnalysisService;
