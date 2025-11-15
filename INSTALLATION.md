# 🎨 Figma to HTML Plugin - Complete Package

## What You're Getting

A complete, production-ready Figma plugin that uses Claude AI to convert your banner designs into HTML code optimized for NetCoreCloud.

---

## 📦 Package Contents

### Core Files:
- **manifest.json** - Plugin configuration
- **code.ts** - Main plugin logic (TypeScript)
- **ui.html** - User interface with Claude AI integration
- **package.json** - Dependencies and scripts
- **tsconfig.json** - TypeScript configuration

### Documentation:
- **README.md** - Complete documentation
- **QUICKSTART.md** - 5-minute setup guide
- **DEMO.html** - Visual preview of the plugin interface
- **setup.sh** - Automated installation script

---

## 🚀 Installation (Choose One Method)

### Method 1: Quick Setup (Recommended)
```bash
# Extract the zip file
unzip figma-to-html-plugin.zip
cd figma-to-html-plugin

# Run the setup script
./setup.sh
```

### Method 2: Manual Setup
```bash
# Extract the zip file
unzip figma-to-html-plugin.zip
cd figma-to-html-plugin

# Install dependencies
npm install

# Build the plugin
npm run build
```

---

## 🔑 Getting Your API Key

1. Visit: **https://console.anthropic.com**
2. Sign up or log in
3. Go to **API Keys** section
4. Click **Create Key**
5. Copy the key (starts with `sk-ant-api03-...`)
6. Save it securely!

**Note:** You'll get free credits to start. Paid plans start at $0.003 per banner conversion.

---

## 📲 Installing in Figma

1. Open **Figma Desktop App** (not browser version!)
2. Menu → **Plugins** → **Development**
3. Click **Import plugin from manifest...**
4. Select the `manifest.json` file from the plugin folder
5. Done! Plugin is now available in your Plugins menu

---

## 🎯 How to Use

### Step-by-Step:

1. **Create or open a design** in Figma
   - Best for: Banners, cards, promotional graphics
   - Recommended: 300-1000px wide

2. **Select the frame** you want to convert

3. **Run the plugin**
   - Plugins → Development → Banner to HTML with Claude AI

4. **First time only:** Enter your API key
   - Paste your Anthropic API key
   - It will be saved for future use

5. **Optional:** Add custom instructions
   - "Make it responsive"
   - "Use Tailwind CSS"
   - "Add hover effects"
   - etc.

6. **Click "Generate HTML"**
   - Takes 5-10 seconds
   - AI analyzes your design
   - Generates production-ready code

7. **Preview and copy**
   - Switch between Preview and Code tabs
   - Click "Copy HTML Code"
   - Paste into NetCoreCloud!

---

## 💡 Pro Tips

### For Best Results:
- ✅ Use complete, finished designs
- ✅ Design at final dimensions
- ✅ Use web-safe or embedded fonts
- ✅ Keep text readable and clear
- ✅ Test with different banner sizes

### Custom Instructions Examples:
```
"Make it responsive for mobile"
"Use inline CSS only"
"Add click tracking to all links"
"Optimize for email clients"
"Use table-based layout"
"Add alt text to all images"
```

---

## 🎨 NetCoreCloud Integration

The generated HTML is automatically optimized for NetCoreCloud:

- **Inline CSS** - Maximum email client compatibility
- **Responsive Design** - Works on all devices
- **Clean Code** - Easy to edit and customize
- **Lightweight** - Fast loading times
- **Email-safe** - Follows best practices

Simply copy the generated HTML and paste it into your NetCoreCloud campaign!

---

## 📊 Features

| Feature | Description |
|---------|-------------|
| 🤖 AI-Powered | Uses Claude Sonnet 4 for intelligent conversion |
| 👁️ Visual Preview | See the result before copying |
| 📋 One-Click Copy | Copy code to clipboard instantly |
| 💾 API Key Storage | Saves your key securely in browser |
| 🎨 Custom Instructions | Tailor output to your needs |
| ⚡ Fast | Convert designs in under 10 seconds |
| 🔒 Private | Your designs stay between you and Claude |

---

## 💰 Cost Breakdown

Claude Sonnet 4 Pricing (as of 2025):
- Input: ~$3 per million tokens
- Output: ~$15 per million tokens

Per Conversion Cost:
- Average: $0.003 - $0.012
- That's less than 2 cents per banner!

**Example:** 
- 100 banners = ~$0.30 - $1.20
- 1,000 banners = ~$3 - $12

Extremely affordable for production use!

---

## 🔧 Troubleshooting

### "Please select a frame or component"
**Fix:** Select a frame/component in Figma before running the plugin

### "Failed to generate HTML"
**Possible causes:**
- Invalid API key
- No credits in Anthropic account
- Internet connection issues
- Design too complex (try a simpler section)

**Fix:** Verify API key, check internet, try again

### Plugin not appearing in menu
**Fix:** 
- Make sure you're using Figma Desktop
- Try reimporting manifest.json
- Verify code.js file exists (run `npm run build`)

### Build errors
```bash
# Clean reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

## 📝 File Structure

```
figma-to-html-plugin/
│
├── manifest.json          # Plugin configuration
├── code.ts               # Plugin logic (source)
├── code.js               # Plugin logic (compiled)
├── ui.html               # Plugin interface
│
├── package.json          # Dependencies
├── tsconfig.json         # TypeScript config
├── .gitignore           # Git ignore rules
│
├── README.md            # Full documentation
├── QUICKSTART.md        # Quick start guide
├── DEMO.html            # Visual demo
└── setup.sh             # Setup script
```

---

## 🔒 Security & Privacy

- **API Key:** Stored locally in browser localStorage
- **Your Designs:** Only sent to Claude API for processing
- **No Tracking:** Zero analytics or data collection
- **Open Source:** All code is readable and auditable

---

## 🛠️ Development

### Watch Mode (for development):
```bash
npm run watch
```

Then reload the plugin in Figma after making changes:
- Plugins → Development → Reload plugin

---

## 📚 Resources

- **Anthropic Console:** https://console.anthropic.com
- **Anthropic Docs:** https://docs.anthropic.com
- **Figma Plugin Docs:** https://www.figma.com/plugin-docs
- **Claude API Pricing:** https://www.anthropic.com/pricing

---

## 🎉 You're All Set!

Your plugin is ready to use! Here's your workflow:

1. **Design** → Create your banner in Figma
2. **Select** → Click on the frame
3. **Run** → Launch the plugin
4. **Generate** → Let Claude AI work its magic
5. **Copy** → Get your production-ready HTML
6. **Deploy** → Use it in NetCoreCloud!

**Total time per banner: ~30 seconds!**

---

## 🆘 Need Help?

1. Check **QUICKSTART.md** for common setup issues
2. Review **README.md** for detailed documentation
3. Visit Anthropic docs for API questions
4. Check Figma plugin docs for platform questions

---

## 🚀 What's Next?

Try converting your first banner design and see the magic happen!

**Bonus tip:** Start with a simple banner to test it out, then move to more complex designs.

---

Built with ❤️ for NetCoreCloud users

Happy designing! 🎨✨
