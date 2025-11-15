# Quick Start Guide - Figma to HTML Plugin

## 🚀 Get Started in 5 Minutes

### Step 1: Get Your Anthropic API Key (2 minutes)

1. Go to **https://console.anthropic.com**
2. Sign up or log in to your account
3. Click on **"API Keys"** in the sidebar
4. Click **"Create Key"**
5. Give it a name (e.g., "Figma Plugin")
6. Copy the key (starts with `sk-ant-api03-...`)
7. **Save it somewhere safe!** You won't be able to see it again

**Don't have an account?** Sign up is free, and you'll get credits to try Claude!

---

### Step 2: Install the Plugin (2 minutes)

#### Option A: Automated Setup (Recommended)
```bash
cd figma-to-html-plugin
./setup.sh
```

#### Option B: Manual Setup
```bash
cd figma-to-html-plugin
npm install
npm run build
```

---

### Step 3: Add Plugin to Figma (1 minute)

1. Open **Figma Desktop App** (must be desktop, not browser)
2. Click **Plugins** in the menu bar
3. Select **Development** → **Import plugin from manifest...**
4. Navigate to the `figma-to-html-plugin` folder
5. Select `manifest.json`
6. Click **Open**

✅ Plugin installed!

---

### Step 4: Use the Plugin

#### First Time Use:

1. **Select a Frame** in Figma
   - Any banner, component, or frame will work
   - Best results with complete designs

2. **Run the Plugin**
   - Menu: **Plugins** → **Development** → **Banner to HTML with Claude AI**
   - Or: Right-click → **Plugins** → **Banner to HTML with Claude AI**

3. **Enter Your API Key**
   - Paste the API key from Step 1
   - (Optional) Add custom instructions
   - The key will be saved for future use

4. **Generate!**
   - Click **"Generate HTML"**
   - Wait 5-10 seconds
   - See your HTML preview!

5. **Copy & Use**
   - Switch between Preview/Code tabs
   - Click **"Copy HTML Code"**
   - Paste into NetCoreCloud or your project

---

## 🎯 Tips for Best Results

### For In-App Banners:
- Design at the exact size you need (e.g., 320x100px)
- Use web-safe fonts or embedded fonts
- Keep file sizes small
- Test on mobile if needed

### Custom Instructions Examples:
```
"Make it responsive"
"Use Tailwind CSS"
"Add click tracking"
"Optimize for email"
"Add hover effects"
```

---

## 🔧 Troubleshooting

### "Please select a frame"
→ Make sure something is selected in Figma first!

### "Failed to generate HTML"
→ Check your API key and internet connection

### Plugin not showing up
→ Make sure you're using Figma Desktop, not the browser version

### Build errors
```bash
rm -rf node_modules
npm install
npm run build
```

---

## 💰 API Costs

- Claude Sonnet 4 costs ~$3 per million input tokens
- Each banner conversion uses ~1,000-4,000 tokens
- That's roughly $0.003-0.012 per conversion
- Very affordable for production use!

Check current pricing: https://www.anthropic.com/pricing

---

## 📁 What's Included

```
figma-to-html-plugin/
├── manifest.json      ← Plugin config
├── code.ts           ← Plugin logic
├── ui.html           ← User interface
├── package.json      ← Dependencies
├── tsconfig.json     ← TypeScript settings
├── setup.sh          ← Quick setup script
└── README.md         ← Full documentation
```

---

## 🎨 Example Workflow

1. **Design in Figma** → Create your banner
2. **Select & Run** → Select frame, run plugin
3. **Generate** → AI creates HTML
4. **Preview** → Check it looks right
5. **Copy** → One-click copy
6. **Deploy** → Paste into NetCoreCloud

Total time: ~30 seconds per banner!

---

## 🆘 Need Help?

1. Check the full README.md
2. Visit Anthropic docs: https://docs.anthropic.com
3. Figma plugin docs: https://www.figma.com/plugin-docs

---

## ✨ You're Ready!

Start converting your Figma designs to production-ready HTML in seconds!

Happy designing! 🎨
