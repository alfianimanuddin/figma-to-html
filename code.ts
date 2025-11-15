// This plugin code runs in Figma's sandbox
figma.showUI(__html__, { width: 400, height: 600 });

// Helper to safely serialize any value, removing Symbols
function safeSerialize(value: any): any {
  if (value === null || value === undefined) {
    return value;
  }

  // Handle primitive types
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }

  // Handle arrays
  if (Array.isArray(value)) {
    return value.map(item => safeSerialize(item));
  }

  // Handle objects - convert to plain object
  if (typeof value === 'object') {
    const result: any = {};
    for (const key in value) {
      if (value.hasOwnProperty(key)) {
        const propValue = value[key];
        // Skip functions and symbols
        if (typeof propValue !== 'function' && typeof propValue !== 'symbol') {
          result[key] = safeSerialize(propValue);
        }
      }
    }
    return result;
  }

  // For anything else, try to convert to string
  return String(value);
}

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
      fontSize: typeof textNode.fontSize === 'number' ? textNode.fontSize : 14,
      fontName: typeof textNode.fontName === 'object' ? `${textNode.fontName.family} ${textNode.fontName.style}` : 'Arial',
      fontWeight: typeof textNode.fontWeight === 'number' ? textNode.fontWeight : 400,
      textAlignHorizontal: String(textNode.textAlignHorizontal),
      textAlignVertical: String(textNode.textAlignVertical),
      letterSpacing: typeof textNode.letterSpacing === 'object' ? textNode.letterSpacing.value : 0,
      lineHeight: typeof textNode.lineHeight === 'object' && 'value' in textNode.lineHeight ? textNode.lineHeight.value : 1.2
    };
  }

  // Extract effects (shadows, blur)
  if ('effects' in node && node.effects.length > 0) {
    data.effects = node.effects.map(effect => {
      const effectData: any = {
        type: effect.type,
        visible: effect.visible
      };

      if ('radius' in effect) effectData.radius = effect.radius;
      if ('color' in effect) effectData.color = rgbToHex(effect.color);
      if ('offset' in effect && effect.offset) {
        effectData.offset = {
          x: effect.offset.x,
          y: effect.offset.y
        };
      }

      return effectData;
    });
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

  return safeSerialize(data);
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
  if (msg.type === 'get-credentials') {
    const apiKey = await figma.clientStorage.getAsync('anthropic_api_key');
    const figmaToken = await figma.clientStorage.getAsync('figma_token');
    figma.ui.postMessage({
      type: 'saved-credentials',
      apiKey: apiKey || '',
      figmaToken: figmaToken || ''
    });
    return;
  }

  if (msg.type === 'save-credentials') {
    await figma.clientStorage.setAsync('anthropic_api_key', msg.apiKey);
    if (msg.figmaToken) {
      await figma.clientStorage.setAsync('figma_token', msg.figmaToken);
    }
    return;
  }

  if (msg.type === 'generate-html') {
    try {
      const apiKey = msg.apiKey;
      const figmaToken = msg.figmaToken;
      const figmaUrl = msg.figmaUrl;
      const additionalInstructions = msg.additionalInstructions || '';

      let base64Image = '';
      let nodeData: any = {};
      let designData: any = {};

      // Check if using Figma URL workflow
      if (figmaUrl && figmaToken) {
        // Use Figma REST API workflow
        const FIGMA_PROXY_URL = 'https://figma-to-html-ashen.vercel.app/api/figma';

        const figmaResponse = await fetch(FIGMA_PROXY_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            figmaToken: figmaToken,
            figmaUrl: figmaUrl
          })
        });

        if (!figmaResponse.ok) {
          const errorData = await figmaResponse.json();
          throw new Error(errorData.error || 'Failed to fetch Figma data');
        }

        const figmaData = await figmaResponse.json();
        base64Image = figmaData.base64Image || '';

        // Use structured design tokens instead of raw data
        if (figmaData.designTokens) {
          nodeData = {
            name: figmaData.designTokens.structure[0]?.name || 'Design',
            width: figmaData.designTokens.layout.width,
            height: figmaData.designTokens.layout.height,
            type: figmaData.designTokens.structure[0]?.type || 'FRAME',
            designData: figmaData.designTokens // Structured tokens
          };
        } else if (figmaData.nodeData && figmaData.nodeId) {
          const node = figmaData.nodeData.nodes[figmaData.nodeId];
          if (node && node.document) {
            nodeData = {
              name: node.document.name,
              width: node.document.absoluteBoundingBox?.width || 0,
              height: node.document.absoluteBoundingBox?.height || 0,
              type: node.document.type,
              designData: node.document
            };
          }
        }

        // If no node data, use file data
        if (!nodeData.name && figmaData.fileData) {
          nodeData = {
            name: figmaData.fileData.name,
            designData: figmaData.fileData
          };
        }

      } else {
        // Use plugin API workflow (selected node)
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
        designData = extractDesignData(node);

        // Get node properties
        nodeData = {
          name: node.name,
          width: node.width,
          height: node.height,
          type: node.type,
          designData: designData
        };

        // Convert image bytes to base64
        base64Image = figma.base64Encode(imageBytes);
      }

      // Send data to UI for preview
      figma.ui.postMessage({
        type: 'image-captured',
        image: base64Image,
        nodeData: nodeData
      });

      // Now call Claude API via proxy server
      // Create a more structured prompt based on whether we have design tokens
      let designInfoSection = '';

      if (figmaUrl && nodeData.designData && nodeData.designData.typography) {
        // Using structured design tokens
        const tokens = nodeData.designData;
        designInfoSection = `
📌 STRUCTURED DESIGN SPECIFICATION:

CANVAS SIZE: ${nodeData.width}px × ${nodeData.height}px

TYPOGRAPHY (${tokens.typography.length} text elements):
${tokens.typography.map((t: any, i: number) => `${i + 1}. "${t.text}"
   - Font: ${t.fontFamily} ${t.fontSize}px, weight ${t.fontWeight}
   - Color: ${t.color}
   - Align: ${t.textAlign}
   - Position: x=${t.bounds?.x || 0}, y=${t.bounds?.y || 0}, w=${t.bounds?.width || 0}, h=${t.bounds?.height || 0}`).join('\n')}

COLORS:
${tokens.colors.map((c: any) => `- ${c.element}: ${c.hex} (opacity: ${c.opacity})`).join('\n')}

LAYOUT STRUCTURE:
${tokens.structure.map((s: any) => `${'  '.repeat(s.depth)}${s.name} (${s.type})${s.bounds ? ` [${s.bounds.width}×${s.bounds.height} at ${s.bounds.x},${s.bounds.y}]` : ''}`).join('\n')}

${tokens.effects.length > 0 ? `EFFECTS:\n${tokens.effects.map((e: any) => `- ${e.element}: ${e.type}`).join('\n')}` : ''}`;
      } else {
        // Using raw extraction data
        designInfoSection = `
Design Data (Plugin API):
${JSON.stringify(nodeData.designData, null, 2)}`;
      }

      const prompt = `You are an expert frontend developer. Create a PIXEL-PERFECT HTML banner.

TARGET: In-app banner for NetCoreCloud
NAME: ${nodeData.name}
SIZE: ${nodeData.width}px × ${nodeData.height}px

${designInfoSection}

CRITICAL REQUIREMENTS:
1. Use EXACT dimensions, positions, colors, and text from above
2. Create inline CSS for maximum compatibility
3. Match the screenshot EXACTLY - use it as your visual reference
4. All text must be selectable HTML text (not images)
5. Use position: relative/absolute to match exact coordinates
6. Border-radius, shadows, and effects must match perfectly
7. Semantic HTML5 elements only
${additionalInstructions ? `8. Additional: ${additionalInstructions}` : ''}

OUTPUT: Complete, standalone HTML file ONLY. No explanations, no markdown blocks.`;

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
