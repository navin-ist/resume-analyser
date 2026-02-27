# AI Resume Analyzer - NLP API Integration Guide

## Overview

This AI Resume Analyzer now features **real NLP-based resume parsing** powered by either OpenAI's GPT-4o or Google Gemini. Instead of basic keyword matching, your resumes are analyzed by state-of-the-art AI models for comprehensive, intelligent feedback.

## What's New

### Before (Keyword-Based)
```
❌ Simple keyword matching
❌ Limited context understanding
❌ Generic feedback based on templates
❌ No real NLP analysis
```

### After (AI-Powered)
```
✅ Advanced NLP-powered analysis
✅ Deep context understanding
✅ Personalized, specific feedback
✅ Real AI model evaluation
✅ Fallback to keyword matching if API fails
```

## Quick Start (5 minutes)

### 1. Choose an AI Provider

**Option A: OpenAI (Recommended)**
- Better analysis quality
- More detailed feedback
- Cost: $0.005-0.015 per resume
- Setup time: 2 minutes

**Option B: Google Gemini**
- Fast and reliable
- Free tier available
- Good alternative to OpenAI
- Setup time: 2 minutes

### 2. Get Your API Key

**For OpenAI:**
1. Go to https://platform.openai.com/account/api-keys
2. Create a new secret key
3. Copy the key (format: `sk-...`)

**For Gemini:**
1. Go to https://aistudio.google.com/app/apikey
2. Click "Create API Key"
3. Copy the key (format: `AIza...`)

### 3. Configure Environment

Create a `.env.local` file in your project root:

```env
# Option 1: OpenAI
VITE_OPENAI_API_KEY=sk-your-key-here

# Option 2: Gemini (or both if you want to test both)
VITE_GEMINI_API_KEY=AIza-your-key-here
```

### 4. Restart & Test

```bash
npm run dev
```

Go to http://localhost:5173 and you should see "OpenAI (GPT-4o)" and "Google Gemini" buttons in the analyzer.

## Detailed Setup

### OpenAI Setup

#### Prerequisites
- OpenAI account (free or paid)
- API key with available credits

#### Steps

1. **Create OpenAI Account**
   - Visit https://openai.com/
   - Click "Sign up"
   - Complete verification

2. **Get API Key**
   - Go to https://platform.openai.com/account/api-keys
   - Click "+ Create new secret key"
   - Copy it immediately (you won't see it again)

3. **Add to `.env.local`**
   ```env
   VITE_OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxx
   ```

4. **Check Billing** (Optional but recommended)
   - Visit https://platform.openai.com/account/billing/overview
   - Set up payment method or use free credits
   - Check usage at https://platform.openai.com/account/billing/usage

### Gemini Setup

#### Prerequisites
- Google account
- No payment required (free tier available)

#### Steps

1. **Go to Google AI Studio**
   - Visit https://aistudio.google.com/app/apikey
   - You might see "Gemini API" if it's your first time

2. **Create API Key**
   - Click "+ Create API Key"
   - Select "Create API key in new project"
   - Copy the generated key

3. **Add to `.env.local`**
   ```env
   VITE_GEMINI_API_KEY=AIzaSyDxxxxxxxxxxxxxxxxxxx
   ```

4. **Check Quotas** (Optional)
   - Gemini free tier: 60 requests per minute
   - Paid tier: No rate limits

## How It Works

### Analysis Flow

```
User Resume + Target Job
        ↓
[Is API Key Available?]
        ↓
    Yes: Use AI Service
        ↓
[OpenAI or Gemini API]
        ↓
Get Detailed Analysis
        ↓
Display Results
        ↓
    No: Fallback to Keyword Analysis
        ↓
Display Generic Results
```

### What Gets Analyzed

The AI models evaluate:

1. **Resume Quality Score (1-100)**
   - Formatting and structure
   - Grammar and clarity
   - Content organization
   - Professional presentation

2. **Job Match Score (0-100)**
   - Relevance to target role
   - Skill alignment
   - Experience fit
   - Background suitability

3. **Detected Skills**
   - Technical skills mentioned
   - Professional competencies
   - Certifications and tools

4. **Required Skills Gap**
   - Critical skills missing for target role
   - Priority learning areas
   - Quick wins for improvement

5. **Suggested Skills**
   - Beneficial skills to acquire
   - Career growth opportunities
   - Industry trends

6. **Strengths**
   - What the resume does well
   - Highlighted achievements
   - Strong selling points

7. **Improvements**
   - Actionable suggestions
   - Specific areas to enhance
   - Optimization tips

8. **Suited Roles**
   - Other career paths
   - Alternative positions
   - Transferable opportunities

## Usage

### Basic Analysis
1. Paste your resume
2. (Optional) Enter target job title
3. Select AI provider (OpenAI or Gemini)
4. Click "Analyze Resume"
5. Wait 5-10 seconds for results

### With Job Target
1. Paste resume
2. Enter a specific job title (e.g., "Senior React Developer")
3. Get personalized job match score
4. Receive specific skills to learn for that role

### Switching Providers
- Click either "OpenAI (GPT-4o)" or "Google Gemini" button
- Make sure you have that provider's API key configured
- Submit your analysis with your chosen provider

## Pricing

### OpenAI

**Model Used:** gpt-4o-mini (fast and affordable)

**Pricing:**
- Input: $0.15 per 1M tokens
- Output: $0.60 per 1M tokens

**Typical Resume Analysis:**
- Input: 500-1000 tokens (depending on resume length)
- Output: 300-500 tokens
- Cost: **$0.0075 - $0.015 per analysis**

**Free Trial:**
- $5 credit for new accounts
- Valid for 3 months
- **Enough for ~500 resume analyses**

**Monthly Active Usage:**
- Analyze 1 resume/day: ~$0.30/month
- Analyze 10 resumes/day: ~$3/month
- Analyze 100 resumes/day: ~$30/month

### Google Gemini

**Model Used:** gemini-pro

**Pricing:**
- Free tier: 60 requests per minute
- No per-token charge on free tier
- Paid tier: Available upon request

**Typical Resume Analysis:**
- Cost on free tier: **$0.00**
- No setup payment needed

**Rate Limits:**
- Free tier: 60 requests per minute
- Best for: Personal use, small teams
- Ideal if: You want zero cost

## Troubleshooting

### Issue: "No API key provided"
**Solution:**
- Check if `.env.local` file exists
- Verify correct environment variable name:
  - OpenAI: `VITE_OPENAI_API_KEY`
  - Gemini: `VITE_GEMINI_API_KEY`
- Restart dev server: `npm run dev`
- Check browser console for errors

### Issue: "401 Unauthorized"
**Solution:**
- API key is invalid or expired
- Generate a new key from provider's dashboard
- Update `.env.local` with new key
- Restart dev server

### Issue: "Rate limit exceeded"
**Solution:**
- OpenAI: Upgrade to paid plan or wait 24 hours
- Gemini: Free tier limit is 60 req/min, wait and retry
- Try the other provider temporarily

### Issue: "API timeout" or "No response"
**Solution:**
- Check internet connection
- Provider's service might be down (check https://status.openai.com)
- Try again in a few moments
- Very long resumes may timeout (split into sections)

### Issue: Falls back to keyword matching instead of AI
**Solution:**
1. Review browser console for error message
2. Check API key validity
3. Verify internet connection
4. Try the other provider
5. Check provider's rate limits and billing

## Development

### Using the API Service Directly

```typescript
import AIAnalysisService from '@/services/aiAnalysisService';

// Create service instance
const service = AIAnalysisService.setProvider('openai');

// Or use Gemini
const geminiService = AIAnalysisService.setProvider('gemini');

// Analyze a resume
const result = await service.analyze(resumeText, jobTitle);

console.log(result.score);           // 85
console.log(result.jobMatch);        // 92
console.log(result.strengths);       // ['...']
console.log(result.improvements);    // ['...']
```

### Switching Between Providers Programmatically

```typescript
const provider = userPreference === 'openai' ? 'openai' : 'gemini';
const service = AIAnalysisService.setProvider(provider);
const result = await service.analyze(resumeText, jobTitle);
```

## Advanced Configuration

### Custom Models (OpenAI)

To use a different OpenAI model, edit `src/services/aiAnalysisService.ts`:

```typescript
// Line ~80, change:
model: 'gpt-4o-mini',  // ← Change this

// Options:
// 'gpt-4o' - Best quality but slower and pricier
// 'gpt-4o-mini' - Good quality, fast, cheap (default)
// 'gpt-4-turbo' - Very capable, moderate cost
```

### Adjusting Temperature

In `src/services/aiAnalysisService.ts`, modify temperature:

```typescript
temperature: 0.7,  // ← 0.1 = Deterministic, 1.0 = Creative

// Lower (0.1-0.3): More consistent, factual results
// Medium (0.5-0.7): Balance between creativity and consistency (default)
// Higher (0.8-1.0): More diverse, creative responses
```

## Production Deployment

### Vercel

1. Go to project settings
2. Click "Environment Variables"
3. Add:
   ```
   VITE_OPENAI_API_KEY=sk_...
   ```
4. Deploy - it will use the env var automatically

### Netlify

1. Go to Site Settings > Build & Deploy > Environment
2. Add variable:
   - Name: `VITE_OPENAI_API_KEY`
   - Value: `sk_...`
3. Redeploy

### Docker

```dockerfile
FROM node:18
WORKDIR /app
COPY . .
RUN npm install
ENV VITE_OPENAI_API_KEY=${VITE_OPENAI_API_KEY}
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "dev"]
```

Then run:
```bash
docker run -e VITE_OPENAI_API_KEY=sk_... myapp
```

## Security Best Practices

1. **Never commit `.env.local`** - It's in `.gitignore`
2. **Use `.env.local` for development only**
3. **Use platform env vars for production**
4. **Rotate API keys periodically**
5. **Monitor API usage and set spend limits**
6. **Don't share API keys in code reviews**

## API Limits & Quotas

### OpenAI Limits
- Free trial: $5, valid 3 months
- Project-based rate limiting: 3,500 RPM (requests/min)
- Token limits: Up to 128K tokens per request

### Gemini Limits
- Free tier: 60 requests per minute
- No project limits, just rate limiting
- Max 1M tokens per request

## FAQ

**Q: Which provider should I use?**
A: Start with OpenAI for better quality, or Gemini if you want zero cost.

**Q: Can I use both providers?**
A: Yes! Just add both keys to `.env.local` and switch between them in the UI.

**Q: What if I don't have an API key?**
A: The app falls back to keyword-based analysis automatically.

**Q: Is my resume data stored?**
A: No, resumes are only sent to the AI provider (OpenAI or Gemini) and not stored in our app.

**Q: Can I self-host this?**
A: Yes! The frontend works fully client-side. Just host it on Vercel, Netlify, or any static host.

**Q: How do I disable the AI and use keyword matching?**
A: Don't set any API keys in `.env.local`. The app will automatically use keyword analysis.

## Support & Resources

- **OpenAI Help:** https://help.openai.com/
- **Gemini Help:** https://support.google.com/ai
- **App Issues:** Check local console (`F12` → Console tab)
- **API Status:**
  - OpenAI: https://status.openai.com/
  - Google Cloud: https://status.cloud.google.com/
