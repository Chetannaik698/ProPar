export type Platform = "chatgpt" | "claude" | "gemini" | "linkedin" | "email";

export interface PlatformContent {
  id: Platform;
  label: string;
  before: string;
  after: string;
  findings: string[];
}

export interface Feature {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface Testimonial {
  quote: string;
  name: string;
  role: string;
}
