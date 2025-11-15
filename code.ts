// This plugin code runs in Figma's sandbox
figma.showUI(__html__, { width: 400, height: 600 });

// Helper function to extract design data from Figma nodes
function extractDesignData(node: SceneNode): any {
  const data: any = {
    type: node.type,
    name: node.name,
    visible: node.visible
  };

  // Add dimensions if available
  if ('width' in node && 'height' in node) {
    data.width = node.width;
    data.height = node.height;
  }

  // Add position if available
  if ('x' in node && 'y' in node) {
    data.x = node.x;
    data.y = node.y;
  }

  // Extract fills (colors, gradients, images)
  if ('fills' in node && node.fills !== figma.mixed) {
    data.fills = (node.fills as Paint[]).map(fill => {
      if (fill.type === 'SOLID') {
        return {
          type: 'SOLID',
          color: rgbToHex(fill.color),
          opacity: fill.opacity || 1
        };
      }
      return { type: fill.type };
    });
  }

  // Extract text properties
  if (node.type === 'TEXT') {
    const textNode = node as TextNode;
    data.text = {
      characters: textNode.characters,
      fontSize: textNode.fontSize,
      fontName: textNode.fontName,
      fontWeight: textNode.fontWeight,
      textAlignHorizontal: textNode.textAlignHorizontal,
      textAlignVertical: textNode.textAlignVertical,
      letterSpacing: textNode.letterSpacing,
      lineHeight: textNode.lineHeight
    };
  }

  // Extract effects (shadows, blur)
  if ('effects' in node && node.effects.length > 0) {
    data.effects = node.effects.map(effect => ({
      type: effect.type,
      visible: effect.visible,
      radius: 'radius' in effect ? effect.radius : undefined,
      color: 'color' in effect ? rgbToHex(effect.color) : undefined,
      offset: 'offset' in effect ? effect.offset : undefined
    }));
  }

  // Extract corner radius
  if ('cornerRadius' in node) {
    data.cornerRadius = node.cornerRadius;
  }

  // Extract strokes
  if ('strokes' in node && node.strokes.length > 0) {
    data.strokes = node.strokes.map(stroke => {
      if (stroke.type === 'SOLID') {
        return {
          type: 'SOLID',
          color: rgbToHex(stroke.color),
          opacity: stroke.opacity || 1
        };
      }
      return { type: stroke.type };
    });
  }

  if ('strokeWeight' in node) {
    data.strokeWeight = node.strokeWeight;
  }

  // Recursively extract children
  if ('children' in node) {
    data.children = node.children.map(child => extractDesignData(child));
  }

  return data;
}

// Helper to convert RGB to Hex
function rgbToHex(rgb: RGB): string {
  const toHex = (value: number) => {
    const hex = Math.round(value * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
}

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

      // Extract detailed design data from Figma
      const designData = extractDesignData(node);

      // Get node properties
      const nodeData = {
        name: node.name,
        width: node.width,
        height: node.height,
        type: node.type,
        designData: designData
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

Extracted Design Data from Figma:
${JSON.stringify(nodeData.designData, null, 2)}

Use this extracted data to create a PIXEL-PERFECT recreation. Pay special attention to:
- Exact text content and font properties
- Precise colors (use the exact hex values provided)
- Exact spacing and positioning
- Layer structure and z-index

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

      // Vercel proxy URL for Claude API
      const PROXY_URL = 'https://figma-to-html-ashen.vercel.app/api/proxy';

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
