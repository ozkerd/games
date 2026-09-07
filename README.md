# 🎮 Games (`games.primerllm.com`)

Modern, high-performance web applications platform built for Cloudflare Pages.

The first game featured in this project is **2-Player Local Hangman**, designed for two players sharing the same keyboard.

---

## 🚀 Features

- **2-Player Local Gameplay (Same Keyboard)**:
  - **Player 1 (Setter)**: Secretly inputs a word/phrase with password-masking toggle, optional hint/category, and custom mistake limit.
  - **Player 2 (Guesser)**: Guesses letters using physical keyboard shortcuts or on-screen English virtual keyboard.
- **Dynamic Hangman Animation**: Custom SVG hangman canvas that animates figure parts per failed guess.
- **Win / Loss Effects**: Celebratory confetti animation on victory, word revelation on defeat.
- **Score Tracking & Role Swapping**: Session win tracking for Player 1 & Player 2, with single-click role swapping.
- **Cloudflare Pages Native**: Pre-configured with `wrangler.json` for deployment to `games.primerllm.com`.

---

## 🛠 Tech Stack

- **Framework**: React 19 + TypeScript + Vite 6
- **Styling**: Tailwind CSS v3
- **Icons**: Lucide React
- **Effects**: Canvas Confetti
- **Deployment**: Cloudflare Pages (`wrangler`)
- **Domain**: `games.primerllm.com`

---

## 💻 Local Development

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Build for production (Cloudflare Pages dist)
npm run build
```

---

## 🌐 Deploying to Cloudflare Pages (`games.primerllm.com`)

### Method 1: GitHub Integration (Recommended)
1. Push changes to GitHub: `git push -u origin main`
2. Open Cloudflare Dashboard -> **Workers & Pages** -> **Create Application** -> **Pages**.
3. Connect your GitHub repository (`ozkerd/games`).
4. Set build settings:
   - **Framework preset**: Vite
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
5. Go to **Custom Domains** and attach `games.primerllm.com`.

### Method 2: Direct CLI Deployment with Wrangler
```bash
npx wrangler pages deploy dist --project-name=games
```

---

## 📁 Repository Remote

- **GitHub Repository**: `https://github.com/ozkerd/games.git`
