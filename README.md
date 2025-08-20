# 🎯 Wordle Clone - Daily Word Guessing Game

A complete full-stack Wordle-style web application with AI-generated daily words, built with React, TypeScript, and Express.js.

## ✨ Features

- **Daily 5-letter word challenges** with AI-generated words from Google Gemini
- **5 themed categories**: Animals, Food, Technology, Nature, Emotions
- **Classic Wordle gameplay** with color-coded feedback
- **Responsive design** for desktop and mobile
- **Virtual keyboard** with letter state tracking
- **Game completion modal** with sharing functionality
- **Automated daily word generation** via GitHub Actions

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development
- **TailwindCSS** for styling
- **shadcn/ui** component library
- **TanStack Query** for data fetching
- **Wouter** for routing

### Backend
- **Express.js** with TypeScript
- **Drizzle ORM** with PostgreSQL support
- **Google Gemini AI** for word generation
- **Memory storage** (easily switchable to PostgreSQL)

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- Google Gemini API key (free at [ai.google.dev](https://ai.google.dev/))

### Local Development

1. **Clone and install dependencies**:
   ```bash
   git clone <your-repo-url>
   cd wordle-clone
   npm install
   ```

2. **Set up your API key**:
   - Get a free API key from [Google AI Studio](https://ai.google.dev/)
   - Add it to your Replit Secrets as `GEMINI_API_KEY`

3. **Start the development server**:
   ```bash
   npm run dev
   ```
   
   The app will be available at `http://localhost:5000`

### Manual Word Generation

Generate a new word for testing:
```bash
node scripts/generate_word.js
```

## 🔄 Automated Daily Words

The game automatically generates new words daily using GitHub Actions:

### Setup GitHub Actions

1. **Add your Gemini API key to GitHub Secrets**:
   - Go to your repository Settings → Secrets and variables → Actions
   - Add a new secret named `GEMINI_API_KEY`
   - Paste your Gemini API key as the value

2. **The workflow runs automatically**:
   - Every day at midnight UTC
   - Generates a new 5-letter word using AI
   - Commits the updated word files to your repository

### Manual Trigger
You can manually trigger word generation from the GitHub Actions tab.

## 📁 Project Structure

```
├── client/src/
│   ├── components/          # React components
│   │   ├── game-grid.tsx    # Wordle game grid
│   │   ├── virtual-keyboard.tsx # On-screen keyboard
│   │   ├── game-header.tsx  # Category and stats display
│   │   └── game-complete-modal.tsx # Win/lose modal
│   ├── hooks/
│   │   └── use-game-state.tsx # Game logic and state
│   ├── pages/
│   │   └── home.tsx         # Main game page
│   └── lib/                 # Utilities
├── server/
│   ├── services/
│   │   └── gemini.ts        # AI word generation
│   ├── routes.ts            # API endpoints
│   └── storage.ts           # Data storage
├── data/
│   ├── today_word.json      # Current day's word
│   └── used_words.json      # History of all words
├── scripts/
│   └── generate_word.js     # Daily word generation script
└── .github/workflows/
    └── daily_word.yml       # GitHub Actions automation
```

## 🎮 How to Play

1. **Guess the daily 5-letter word** related to the shown category
2. **Enter your guess** using the virtual keyboard or your physical keyboard
3. **Color feedback after each guess**:
   - 🟩 **Green**: Correct letter in correct position
   - 🟨 **Yellow**: Correct letter in wrong position
   - ⬜ **Gray**: Letter not in the word
4. **You have 5 attempts** to find the word
5. **Share your results** when you complete the game

## 📊 Game Categories

Each day features a word from one of these categories:
- 🐾 **Animals**: Wildlife and pets
- 🍎 **Food**: Dishes, ingredients, and cuisine
- 💻 **Technology**: Digital and tech terms
- 🌿 **Nature**: Plants, weather, and natural phenomena
- 😊 **Emotions**: Feelings and emotional states

## 🔧 Configuration

### Word Generation Settings
Edit `scripts/generate_word.js` to customize:
- Categories (line 15)
- AI model parameters
- Word validation rules

### Styling
The game uses TailwindCSS. Customize colors and styling in:
- `client/src/index.css` for global styles
- Individual component files for specific styling

## 🚀 Deployment

### Replit Deployment
The app is ready to deploy on Replit:
1. Ensure your `GEMINI_API_KEY` is set in Replit Secrets
2. The app runs on port 5000 automatically

### Other Platforms
For deployment on Vercel, Heroku, or similar:
1. Set the `GEMINI_API_KEY` environment variable
2. Build the app: `npm run build`
3. Start the production server: `npm start`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and test thoroughly
4. Commit: `git commit -m "Add feature-name"`
5. Push: `git push origin feature-name`
6. Create a Pull Request

## 📄 License

MIT License - feel free to use this project for your own Wordle implementations!

## 🙏 Credits

- Inspired by the original [Wordle](https://www.nytimes.com/games/wordle/index.html) by Josh Wardle
- Powered by [Google Gemini AI](https://ai.google.dev/)
- Built with modern React and TypeScript stack