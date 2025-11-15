// This plugin code runs in Figma's sandbox
figma.showUI(__html__, { width: 400, height: 600 });

// Listen for messages from the UI
figma.ui.onmessage = async (msg) => {
  if (msg.type === 'get-api-key') {
    const apiKey = await figma.clientStorage.getAsync('anthropic_api_key');
    figma.ui.postMessage({
      type: 'saved-api-key',
      apiKey: apiKey || ''
    });
    return;
  }

  if (msg.type === 'save-api-key') {
    await figma.clientStorage.setAsync('anthropic_api_key', msg.apiKey);
    return;
  }

  if (msg.type === 'generate-html') {
    try {
      // Get the currently selected node
      const selection = figma.currentPage.selection;

      if (selection.length === 0) {
        figma.ui.postMessage({
          type: 'error',
          message: 'Please select a frame or component to convert'
        });
        return;
      }

      const node = selection[0];

      // Export the selected node as PNG
      const imageBytes = await node.exportAsync({
        format: 'PNG',
        constraint: { type: 'SCALE', value: 2 }
      });

      // Get node properties
      const nodeData = {
        name: node.name,
        width: node.width,
        height: node.height,
        type: node.type
      };

      // Convert image bytes to base64
      const base64Image = figma.base64Encode(imageBytes);

      // Send data to UI for preview
      figma.ui.postMessage({
        type: 'image-captured',
        image: base64Image,
        nodeData: nodeData
      });

      // Now call Claude API via proxy server
      const apiKey = msg.apiKey;
      const additionalInstructions = msg.additionalInstructions || '';

      const prompt = `You are an expert frontend developer specializing in creating HTML banners.

I need you to convert this Figma design into a production-ready HTML file for an in-app banner that will be used in NetCoreCloud.

Design Information:
- Name: ${nodeData.name}
- Width: ${nodeData.width}px
- Height: ${nodeData.height}px
- Type: ${nodeData.type}

Requirements:
1. Create a complete, standalone HTML file with inline CSS
2. Make it pixel-perfect to match the design
3. Use semantic HTML5 elements
4. Ensure it's responsive and works well in email clients (since it will be used in NetCoreCloud)
5. Use inline styles for maximum compatibility
6. Include alt text for images
7. Optimize for web performance
8. Make all colors, fonts, spacing, and layout match the design exactly
${additionalInstructions ? `9. Additional requirements: ${additionalInstructions}` : ''}

Please provide ONLY the HTML code, no explanations. Make sure it's a complete, ready-to-use HTML file.`;

      // TODO: Replace this URL with your actual Vercel deployment URL after deploying
      const PROXY_URL = 'https://your-vercel-app.vercel.app/api/proxy';

      const response = await fetch(PROXY_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          apiKey: apiKey,
          prompt: prompt,
          base64Image: base64Image
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `API request failed with status ${response.status}`);
      }

      const data = await response.json();
      let htmlContent = data.content[0].text;

      // Clean up the response - remove markdown code blocks if present
      htmlContent = htmlContent.replace(/```html\n?/g, '').replace(/```\n?/g, '').trim();

      // Send the generated HTML to the UI
      figma.ui.postMessage({
        type: 'html-generated',
        html: htmlContent
      });

    } catch (error) {
      figma.ui.postMessage({
        type: 'error',
        message: error instanceof Error ? error.message : 'An unknown error occurred'
      });
    }
  }

  if (msg.type === 'cancel') {
    figma.closePlugin();
  }
};
