export interface AudienceSegment {
  name: string;
  description: string;
}

export interface PainPoint {
  point: string;
  rootCause: string;
  dailyImpact: string;
  whyFreeSolutionsFail: string;
  emotionalCost: string;
  howProductSolves: string;
}

export interface Chapter {
  number: number;
  title: string;
  whatItCovers: string;
  topics: string[];
  learningOutcomes: string[];
  actionSteps: string[];
  commonMistake: string;
  quickWin: string;
}

export interface SalesHeadline {
  headline: string;
  rationale: string;
}

export interface SalesCopy {
  headlines: SalesHeadline[];
  subheadline: string;
  bullets: string[];
  guarantee: string;
}

export interface MarketingAngle {
  title: string;
  rationale: string;
}

export interface SocialPost {
  platform: string;
  content: string;
}

export interface EmailStep {
  day: string;
  subject: string;
  preview: string;
  purpose: string;
}

export interface YoutubeIdea {
  title: string;
  hookStrategy: string;
}

export interface NinetyDayChecklist {
  days1to7: string[];
  days8to30: string[];
  days31to90: string[];
}

export interface Report {
  id: string;
  createdAt: string;
  niche: string;
  productTitle: string;
  productType: "ebook" | "course" | "template" | "planner" | "checklist";
  price: string;
  productDescription: string;
  demandScore: number; // 0-100
  competition: "Low" | "Medium" | "High";
  profitPotential: "Low" | "Medium" | "High" | "Very High";
  whyThisNiche: string;
  audienceSegments: AudienceSegment[];
  painPoints: PainPoint[];
  chapters: Chapter[];
  transformation: string;
  whyBuyersPay: string[];
  salesCopy: SalesCopy;
  marketingAngles: MarketingAngle[];
  socialPosts: SocialPost[];
  emailSequence: EmailStep[];
  youtubeIdeas: YoutubeIdea[];
  launchRoadmap: string[];
  ninetyDayChecklist: NinetyDayChecklist;
}

// Minimal shape saved in the dashboard list (before/without full detail)
export interface ReportSummary {
  id: string;
  createdAt: string;
  niche: string;
  productTitle: string;
  productType: Report["productType"];
  demandScore: number;
  competition: Report["competition"];
  profitPotential: Report["profitPotential"];
  status: "completed" | "in_progress";
}
