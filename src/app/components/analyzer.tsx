// AI-powered resume analysis engine with OpenAI/Gemini integration
import AIAnalysisService, { AIAnalysisResponse } from '@/services/aiAnalysisService';

export interface AnalysisResult extends AIAnalysisResponse {
  jobTitle: string;
  isAIPowered?: boolean;
  analysisMethod?: 'ai' | 'fallback';
}

const JOB_SKILL_MAP: Record<string, { required: string[]; nice: string[] }> = {
  "software engineer": {
    required: ["JavaScript", "TypeScript", "React", "Node.js", "Git", "REST APIs", "Algorithms"],
    nice: ["Docker", "AWS", "GraphQL", "Kubernetes", "CI/CD", "System Design"],
  },
  "frontend developer": {
    required: ["HTML/CSS", "JavaScript", "React", "TypeScript", "Responsive Design", "Git"],
    nice: ["Next.js", "Tailwind CSS", "Figma", "Performance Optimization", "Testing (Jest)"],
  },
  "backend developer": {
    required: ["Node.js", "Python", "REST APIs", "SQL", "Git", "System Design"],
    nice: ["Docker", "Kubernetes", "Redis", "Microservices", "AWS", "PostgreSQL"],
  },
  "data scientist": {
    required: ["Python", "Machine Learning", "Statistics", "SQL", "Data Analysis", "Pandas", "NumPy"],
    nice: ["TensorFlow", "PyTorch", "Tableau", "Apache Spark", "A/B Testing", "NLP"],
  },
  "product manager": {
    required: ["Product Roadmap", "Agile/Scrum", "Stakeholder Management", "Data Analysis", "User Research"],
    nice: ["SQL", "Figma", "A/B Testing", "OKRs", "Go-to-Market Strategy"],
  },
  "ux designer": {
    required: ["Figma", "User Research", "Wireframing", "Prototyping", "Design Systems"],
    nice: ["Adobe XD", "Usability Testing", "Motion Design", "HTML/CSS", "Accessibility"],
  },
  "devops engineer": {
    required: ["Docker", "Kubernetes", "CI/CD", "Linux", "AWS", "Infrastructure as Code"],
    nice: ["Terraform", "Ansible", "Monitoring (Prometheus)", "Helm", "Git"],
  },
  "machine learning engineer": {
    required: ["Python", "Machine Learning", "TensorFlow", "PyTorch", "MLOps", "SQL"],
    nice: ["Kubernetes", "AWS SageMaker", "Feature Engineering", "NLP", "Computer Vision"],
  },
  "cybersecurity analyst": {
    required: ["Network Security", "SIEM Tools", "Incident Response", "Vulnerability Assessment", "Linux"],
    nice: ["CISSP", "Penetration Testing", "Python Scripting", "Forensics", "Cloud Security"],
  },
  "cloud architect": {
    required: ["AWS", "Azure", "Google Cloud", "Infrastructure as Code", "Networking", "Security"],
    nice: ["Terraform", "Kubernetes", "Cost Optimization", "Multi-cloud", "Serverless"],
  },
};

const ROLE_KEYWORDS: Record<string, string[]> = {
  "Software Engineer": ["javascript", "typescript", "react", "node", "python", "java", "algorithms", "api"],
  "Frontend Developer": ["html", "css", "javascript", "react", "vue", "angular", "ui", "responsive"],
  "Backend Developer": ["node", "python", "java", "sql", "api", "server", "database", "microservices"],
  "Data Scientist": ["python", "machine learning", "data", "statistics", "sql", "pandas", "model"],
  "Data Analyst": ["sql", "excel", "tableau", "data", "analysis", "reporting", "power bi"],
  "Product Manager": ["product", "roadmap", "agile", "stakeholder", "strategy", "launch", "metrics"],
  "UX Designer": ["design", "figma", "prototype", "user research", "wireframe", "ux", "ui"],
  "DevOps Engineer": ["docker", "kubernetes", "ci/cd", "linux", "aws", "deployment", "infrastructure"],
  "Cloud Engineer": ["aws", "azure", "gcp", "cloud", "terraform", "infrastructure", "serverless"],
  "Cybersecurity Analyst": ["security", "network", "vulnerability", "incident", "firewall", "siem"],
};

const GENERAL_STRENGTHS = [
  "Clear and structured professional summary",
  "Quantified achievements with measurable results",
  "Consistent and clean formatting throughout",
  "Strong use of action verbs and impact statements",
  "Relevant certifications or education included",
  "Well-organized work experience timeline",
];

const GENERAL_IMPROVEMENTS = [
  "Add more measurable outcomes to your job experiences",
  "Include a LinkedIn or portfolio URL",
  "Tailor keywords to match each job description",
  "Expand on leadership or cross-functional collaboration",
  "Add a professional summary if not present",
  "Consider adding relevant certifications",
];

function normalizeJob(input: string): string {
  const lower = input.toLowerCase().trim();
  for (const key of Object.keys(JOB_SKILL_MAP)) {
    if (lower.includes(key) || key.includes(lower)) return key;
  }
  return lower;
}

/**
 * Analyzes resume using AI service (OpenAI/Gemini)
 * Falls back to keyword matching if AI service fails or is not configured
 */
export async function analyzeResumeWithAI(
  resumeText: string,
  jobTitle: string,
  provider: 'openai' | 'gemini' = 'openai'
): Promise<AnalysisResult> {
  try {
    // Validate minimum resume content
    if (!resumeText || resumeText.trim().length < 50) {
      throw new Error('Resume content too short');
    }

    // Initialize AI service and analyze
    const aiService = AIAnalysisService.setProvider(provider);
    const aiResult = await aiService.analyze(resumeText, jobTitle.trim() || undefined);

    return {
      ...aiResult,
      jobTitle,
      isAIPowered: true,
      analysisMethod: 'ai',
    };
  } catch (error) {
    console.warn('AI analysis failed, falling back to keyword matching:', error);
    // Fall back to keyword-based analysis if AI fails
    return analyzeResumeFallback(resumeText, jobTitle);
  }
}

/**
 * Fallback keyword-based resume analysis (used when AI service is unavailable)
 */
export function analyzeResumeFallback(resumeText: string, jobTitle: string): AnalysisResult {
  const lower = resumeText.toLowerCase();
  const words = resumeText.trim().split(/\s+/).length;

  // Detect current skills from resume text
  const allSkills = [
    "JavaScript", "TypeScript", "React", "Node.js", "Python", "Java", "SQL",
    "HTML/CSS", "Git", "Docker", "AWS", "GraphQL", "REST APIs", "Machine Learning",
    "Kubernetes", "CI/CD", "Agile/Scrum", "Figma", "PostgreSQL", "Redis",
    "Next.js", "Vue", "Angular", "Tailwind CSS", "Linux", "TensorFlow", "PyTorch",
    "Data Analysis", "Statistics", "Pandas", "NumPy", "Excel", "Tableau",
    "Product Roadmap", "Stakeholder Management", "User Research", "Wireframing",
  ];
  const currentSkills = allSkills.filter(s => lower.includes(s.toLowerCase().replace("/", " ").split(" ")[0]));

  // Base score
  let score = Math.min(95, Math.max(30, 45 + words * 0.12 + currentSkills.length * 2));
  score = Math.round(score);

  // Suited roles based on resume
  const suitedRoles: string[] = [];
  for (const [role, keywords] of Object.entries(ROLE_KEYWORDS)) {
    const matches = keywords.filter(k => lower.includes(k)).length;
    if (matches >= 2) suitedRoles.push(role);
  }
  if (suitedRoles.length === 0) suitedRoles.push("General Administrative Role", "Technical Support");

  // Job match & skills gap
  let jobMatch: number | null = null;
  let skillsToAcquire: string[] = [];
  let suggestedSkills: string[] = [];

  if (jobTitle.trim()) {
    const normJob = normalizeJob(jobTitle);
    const jobData = JOB_SKILL_MAP[normJob];

    if (jobData) {
      const allRequired = [...jobData.required, ...jobData.nice];
      const matched = allRequired.filter(s => lower.includes(s.toLowerCase().split(" ")[0]));
      jobMatch = Math.round((matched.length / allRequired.length) * 100);
      skillsToAcquire = jobData.required.filter(s => !lower.includes(s.toLowerCase().split(" ")[0]));
      suggestedSkills = jobData.nice.filter(s => !lower.includes(s.toLowerCase().split(" ")[0]));
    } else {
      jobMatch = Math.round(Math.random() * 30 + 40);
      skillsToAcquire = ["Domain-specific knowledge", "Industry certifications", "Relevant tools & software"];
      suggestedSkills = ["Communication", "Project Management", "Data-driven decision making"];
    }
  } else {
    suggestedSkills = allSkills.filter(s => !currentSkills.includes(s)).slice(0, 8);
  }

  const numStrengths = Math.min(6, Math.max(2, Math.floor(words / 50) + 2));
  const numImprovements = Math.min(6, Math.max(2, 6 - Math.floor(words / 70)));

  return {
    score,
    jobMatch,
    jobTitle,
    strengths: GENERAL_STRENGTHS.slice(0, numStrengths),
    improvements: GENERAL_IMPROVEMENTS.slice(0, numImprovements),
    currentSkills: currentSkills.slice(0, 12),
    suggestedSkills: suggestedSkills.slice(0, 8),
    skillsToAcquire,
    suitedRoles: suitedRoles.slice(0, 6),
    isAIPowered: false,
    analysisMethod: 'fallback',
  };
}
