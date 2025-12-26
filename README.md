# 3rd Harmonik Music Playlist 🎵

An interactive, high-fidelity music player experience for **3rd Harmonik**. Explore their vault, enjoy their tracks, and get to know the band members through immersive 3D-card views and dynamic lyrics.

## 🚀 Live Demo
**[Launch 3rd Harmonik Experience](https://lemonquake.github.io/3rd-harmonik-music-playlist/)**

---

## ✨ Features
- **The Vault:** Complete library of 3rd Harmonik tracks with easy search and filtering.
- **3D Member Bios:** Interactive 3D cards for Aljay, Louie, Anthony, and Clyde.
- **Dynamic Lyrics:** Real-time lyrical display for an immersive listening experience.
- **Smart Playlists:** Automatically generated mixes based on your favorites and play history.
- **Responsive Design:** Optimized for both desktop and mobile "gig mode".

## 🛠️ Local Development

**Prerequisites:** Node.js (v18+)

1. **Clone & Install:**
   ```bash
   npm install
   ```

2. **Environment Setup:**
   Create a `.env.local` file and add your Gemini API key (if needed for AI features):
   ```env
   GEMINI_API_KEY=your_key_here
   ```

3. **Start Development Server:**
   ```bash
   npm run dev
   ```

## 📦 Deployment
This project is configured for **GitHub Pages** via GitHub Actions. Any push to the `main` branch will automatically trigger a fresh build and deployment.
