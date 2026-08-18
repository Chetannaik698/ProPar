# ProPaar — Think Before You Send

ProPaar is an AI thinking partner that helps people think better before they send. It reviews prompts, emails, LinkedIn posts, and professional writing to surface missing context, hidden assumptions, and blind spots.

## 🌐 Live Production Links

- **Web App (ProParUI)**: [https://propaar.netlify.app](https://propaar.netlify.app)
- **Backend API**: [https://propar-backend.onrender.com](https://propar-backend.onrender.com)
- **GitHub Repository**: [https://github.com/Chetannaik698/ProPar](https://github.com/Chetannaik698/ProPar.git)

---

## 📁 Repository Structure

```text
propar/
├── backend/                 # Express + TypeScript API server (deployed on Render)
├── extension/               # Manifest V3 Chrome Extension (ChatGPT, Claude, Gemini, LinkedIn, Gmail)
├── ProParUI/                # Next.js 15 Web Application (deployed on Netlify)
├── netlify.toml             # Netlify deployment configuration
└── README.md
```

---

## 🚀 Local Development

### Prerequisites
- Node.js 20 LTS or newer
- pnpm 10 or newer

### Setup & Run
```bash
# Install dependencies across all monorepo packages
pnpm install

# Run backend locally
cd backend && npm run dev

# Run Chrome extension dev mode
cd extension && npm run dev

# Run Web UI locally
cd ProParUI && npm run dev
```

---

## 📦 Building Extension for Chrome

```bash
cd extension
npm run build
```
Load the unpacked extension in Chrome:
1. Open `chrome://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked** and select `extension/dist` (or use `ProPaar-Extension.zip`).
