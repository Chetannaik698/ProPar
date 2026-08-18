export const nav = [
  { label: "Product", href: "#solution" },
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#workflow" },
  { label: "Use cases", href: "#use-cases" },
  { label: "FAQ", href: "#faq" },
];

export const trustedBy = [
  "Anchor Studio",
  "Northbeam",
  "Fieldnote",
  "Harbor Legal",
  "Ridgeline",
  "Vale & Co",
  "Sundial",
  "Keystone Labs",
];

export const problems = [
  {
    title: "You send, then you edit.",
    body: "Most writing tools react after the fact — fixing grammar and tone once the message is already gone.",
  },
  {
    title: "Weak thinking looks like weak writing.",
    body: "A confusing message is rarely a spelling problem. It's usually a missing assumption or an unclear goal.",
  },
  {
    title: "You don't see your own blind spots.",
    body: "It's hard to notice what you left out, because to you, it never felt missing.",
  },
];

export const workflowStages = [
  {
    id: "input",
    label: "You write",
    title: "Start typing, anywhere",
    description: "A prompt, an email, a LinkedIn post. ProPaar reads as you write, before you send.",
  },
  {
    id: "analyze",
    label: "ProPaar reads",
    title: "Analyzing your intent",
    description: "ProPaar maps what you're trying to achieve against what you've actually said.",
  },
  {
    id: "goal",
    label: "Goal discovery",
    title: "What are you really asking for?",
    description: "ProPaar identifies the underlying goal, even when it isn't stated directly.",
  },
  {
    id: "context",
    label: "Missing context",
    title: "Context gap detected",
    description: "Flags information the reader needs but doesn't have yet.",
  },
  {
    id: "blindspot",
    label: "Blind spots",
    title: "Assumption surfaced",
    description: "Highlights assumptions you're making that may not hold for your reader.",
  },
  {
    id: "final",
    label: "Stronger message",
    title: "A clearer version, ready to send",
    description: "ProPaar proposes a revision. You stay in control of every word.",
  },
] as const;

export const features = [
  {
    title: "Goal Discovery",
    description: "Identifies what you're actually trying to accomplish, even when the message doesn't say it directly.",
  },
  {
    title: "Missing Context Detection",
    description: "Flags information your reader needs but doesn't have — before it becomes a follow-up question.",
  },
  {
    title: "Blind Spot Detection",
    description: "Surfaces assumptions baked into your message that may not be obvious to anyone but you.",
  },
  {
    title: "Expert Thinking",
    description: "Applies the questions a thoughtful editor would ask, drawn from how strong communicators structure ideas.",
  },
  {
    title: "Adaptive Clarification",
    description: "Asks only what's necessary to strengthen the message — never a generic checklist.",
  },
  {
    title: "Communication Review",
    description: "A structured pass over tone, clarity, and intent, tailored to where you're writing.",
  },
  {
    title: "Prompt Enhancement",
    description: "Turns a rough prompt into one that gives the model what it needs to respond well.",
  },
  {
    title: "Replace Prompt",
    description: "Swap in the improved version with one action — your original is always one step away.",
  },
  {
    title: "Cross-Platform Intelligence",
    description: "Works consistently across ChatGPT, Claude, Gemini, LinkedIn, and email.",
  },
  {
    title: "Privacy First",
    description: "Runs locally in your browser. Nothing you write is stored or sent anywhere by default.",
  },
] as const;

export const platforms = [
  { id: "chatgpt", label: "ChatGPT" },
  { id: "claude", label: "Claude" },
  { id: "gemini", label: "Gemini" },
  { id: "linkedin", label: "LinkedIn" },
  { id: "email", label: "Email" },
] as const;

export const platformDemos: Record<
  (typeof platforms)[number]["id"],
  { before: string; issue: string; after: string }
> = {
  chatgpt: {
    before: "write me a landing page for my app",
    issue: "Missing context: what the app does, who it's for, and the tone you want.",
    after:
      "Write landing page copy for a task-tracking app used by freelance designers. Confident, minimal tone. Include a headline, three benefit statements, and a single CTA.",
  },
  claude: {
    before: "summarize this contract",
    issue: "Missing context: which sections matter most to you, and your reading level.",
    after:
      "Summarize this contract for a non-lawyer founder. Flag anything unusual in the termination and IP clauses. Keep it under 200 words.",
  },
  gemini: {
    before: "plan my week",
    issue: "Missing context: your existing commitments and what \"productive\" means to you.",
    after:
      "Plan my week around two fixed meetings (Tue 10am, Thu 2pm). Prioritize three hours of deep work daily and leave Friday afternoon open.",
  },
  linkedin: {
    before: "Excited to share some news about my career!",
    issue: "Blind spot: readers don't yet know what the news is.",
    after:
      "I'm joining Ridgeline as Head of Design, focused on building tools for early-stage teams. Grateful to the team at Sundial for three great years.",
  },
  email: {
    before: "Following up on this — any update?",
    issue: "Missing context: which thread, which ask, and by when you need it.",
    after:
      "Following up on the Q3 contract redline I sent Monday — could you confirm the revised terms by Thursday so we can stay on schedule?",
  },
};

export const useCases = [
  {
    title: "Prompting AI models",
    body: "Turn vague prompts into ones that get you a usable answer on the first try.",
  },
  {
    title: "Professional email",
    body: "Catch the missing date, attachment, or ask before you hit send.",
  },
  {
    title: "LinkedIn & professional posts",
    body: "Say what you mean the first time, with the context your audience actually needs.",
  },
  {
    title: "Internal communication",
    body: "Fewer follow-up threads asking 'wait, what did you mean by this?'",
  },
];

export const testimonials = [
  {
    quote:
      "I write a lot of prompts. ProPaar is the first tool that made me think harder before I hit send, not after.",
    name: "Elena Marks",
    role: "Product Lead, Northbeam",
  },
  {
    quote:
      "It caught an assumption in a client email I would have never noticed. That alone paid for itself.",
    name: "David Ochoa",
    role: "Partner, Harbor Legal",
  },
  {
    quote:
      "Feels like a second read from someone who actually pays attention. Quiet, useful, not in the way.",
    name: "Priya Nathan",
    role: "Founder, Fieldnote",
  },
];

export const faqs = [
  {
    question: "What exactly does ProPaar do?",
    answer:
      "ProPaar reviews what you're about to send — a prompt, an email, a LinkedIn post — and flags missing context, hidden assumptions, and unclear goals before you send it, then proposes a stronger version.",
  },
  {
    question: "Does ProPaar store what I write?",
    answer:
      "No. ProPaar runs its analysis locally in your browser by default. Your prompts and messages are not stored or sent to a server unless you explicitly choose to.",
  },
  {
    question: "Which platforms does it work with?",
    answer:
      "ChatGPT, Claude, Gemini, LinkedIn, and email today, with more surfaces on the way.",
  },
  {
    question: "Is ProPaar a grammar checker?",
    answer:
      "No. Grammar tools fix wording after the fact. ProPaar focuses on thinking — the context, assumptions, and goals — before you write the final version.",
  },
  {
    question: "How much does it cost?",
    answer:
      "ProPaar is free during the public beta. Paid plans for teams are coming soon.",
  },
  {
    question: "How do I install it?",
    answer:
      "Add ProPaar to Chrome from the Chrome Web Store. It takes under a minute, and there's nothing to configure to get started.",
  },
];
