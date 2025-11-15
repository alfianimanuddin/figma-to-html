# Figma to HTML with Claude AI Plugin

A Figma plugin that converts your banner designs into production-ready HTML code using Claude AI's vision capabilities.

## Features

- 🎨 Convert Figma designs to HTML with AI
- 👁️ Real-time HTML preview
- 📋 One-click copy to clipboard
- 🎯 Optimized for in-app banners and NetCoreCloud
- 💾 Saves your API key locally for convenience
- 🔧 Custom instructions support

## Prerequisites

1. **Figma Desktop App** - This plugin requires the Figma desktop application
2. **Anthropic API Key** - Get yours from [console.anthropic.com](https://console.anthropic.com)

## Installation

### Step 1: Install Dependencies

```bash
cd figma-to-html-plugin
npm install
```

### Step 2: Build the Plugin

```bash
npm run build
```

This will compile `code.ts` to `code.js` which Figma needs to run the plugin.

### Step 3: Install in Figma

1. Open Figma Desktop App
2. Go to **Plugins** → **Development** → **Import plugin from manifest...**
3. Navigate to the plugin folder and select `manifest.json`
4. The plugin should now appear in your plugins list!

## Usage

### Step 1: Get Your API Key

1. Visit [console.anthropic.com](https://console.anthropic.com)
2. Sign up or log in
3. Navigate to API Keys
4. Create a new API key
5. Copy the key (it starts with `sk-ant-api03-...`)

### Step 2: Use the Plugin

1. **Select a Frame or Component** in Figma that you want to convert
   - Works best with complete banner designs
   - Recommended: Frames with clear visual hierarchy

2. **Run the Plugin**
   - Go to **Plugins** → **Development** → **Banner to HTML with Claude AI**
   
3. **Enter Your API Key**
   - Paste your Anthropic API key
   - (Optional) Add custom instructions like "Make it responsive" or "Use Tailwind CSS"
   
4. **Generate HTML**
   - Click "Generate HTML"
   - Wait for Claude to analyze and generate the code
   
5. **Preview & Copy**
   - Switch between Preview and Code tabs
   - Copy the HTML code with one click
   - Use it in your NetCoreCloud campaigns!

## Plugin Interface

### Setup Screen
- **API Key Input**: Enter your Anthropic API key (saved locally)
- **Additional Instructions**: Customize the output (optional)
- **Generate Button**: Start the conversion process

### Preview Screen
- **Design Preview**: See the original Figma design
- **Preview Tab**: See how the HTML renders
- **Code Tab**: View the generated HTML code
- **Copy Button**: Copy code to clipboard
- **Generate New**: Start over with a new design

## Tips for Best Results

### 1. Design Preparation
- Use clear, complete designs
- Ensure text is readable
- Use standard fonts or embedded fonts
- Keep designs at their intended final size

### 2. Custom Instructions Examples
```
"Make it responsive for mobile devices"
"Use Tailwind CSS classes"
"Add hover effects on buttons"
"Make all links open in new tabs"
"Optimize for email clients"
```

### 3. NetCoreCloud Integration
The generated HTML is optimized for email/banner use with:
- Inline CSS for maximum compatibility
- Table-based layouts when needed
- Responsive design patterns
- Email-safe HTML practices

## File Structure

```
figma-to-html-plugin/
├── manifest.json       # Plugin configuration
├── code.ts            # Plugin logic (TypeScript)
├── code.js            # Compiled plugin code
├── ui.html            # Plugin interface
├── package.json       # Dependencies
├── tsconfig.json      # TypeScript config
└── README.md          # This file
```

## Development

### Watch Mode
For development, use watch mode to auto-compile on changes:

```bash
npm run watch
```

Then in Figma, use **Plugins** → **Development** → **Reload plugin** after making changes.

## API Usage & Costs

- This plugin uses Claude Sonnet 4 (claude-sonnet-4-20250514)
- Each generation uses approximately 1,000-4,000 tokens
- Check [Anthropic pricing](https://www.anthropic.com/pricing) for current rates
- Your API key is stored locally and never sent anywhere except to Anthropic's API

## Troubleshooting

### "Please select a frame or component to convert"
- Make sure you have a frame or component selected in Figma before running the plugin

### "Failed to generate HTML"
- Check that your API key is valid
- Ensure you have credits in your Anthropic account
- Verify your internet connection

### Build Errors
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Plugin Not Appearing
- Make sure you're using Figma Desktop (not browser)
- Try re-importing the manifest.json
- Check that code.js exists (run `npm run build`)

## Security Notes

- Your API key is stored in localStorage (browser storage)
- Keys are only sent to Anthropic's official API
- No data is collected or stored by this plugin
- Images are sent to Claude API for processing only

## Limitations

- Requires active internet connection
- Needs valid Anthropic API key with credits
- Complex designs may take longer to process
- Generated HTML may need manual refinement for specific use cases

## Future Enhancements

- [ ] Direct export to NetCoreCloud
- [ ] Multiple design export at once
- [ ] Style presets (Tailwind, Bootstrap, etc.)
- [ ] A/B testing variants
- [ ] Component library integration

## Support

For issues or questions:
1. Check the Troubleshooting section above
2. Review Anthropic API documentation
3. Check Figma plugin documentation

## License

MIT License - Feel free to modify and use this plugin for your projects!

## Credits

Built with:
- [Figma Plugin API](https://www.figma.com/plugin-docs/)
- [Anthropic Claude AI](https://www.anthropic.com/)
- Designed for NetCoreCloud integration

---

Happy banner designing! 🎨✨
