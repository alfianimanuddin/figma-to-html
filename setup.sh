#!/bin/bash

echo "🚀 Setting up Figma to HTML Plugin with Claude AI..."
echo ""

# Check if npm is installed
if ! command -v npm &> /dev/null
then
    echo "❌ npm is not installed. Please install Node.js and npm first."
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

echo ""
echo "🔨 Building the plugin..."
npm run build

echo ""
echo "✅ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Open Figma Desktop App"
echo "2. Go to: Plugins → Development → Import plugin from manifest..."
echo "3. Select the manifest.json file from this folder"
echo "4. Get your API key from: https://console.anthropic.com"
echo "5. Start converting designs to HTML!"
echo ""
echo "📖 For more information, check README.md"
