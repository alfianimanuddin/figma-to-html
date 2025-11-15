// Helper function to extract structured design tokens from Figma node
function extractDesignTokens(node) {
  const tokens = {
    layout: {},
    colors: [],
    typography: [],
    effects: [],
    images: [],
    structure: []
  };

  function traverse(n, depth = 0) {
    if (!n) return;

    // Extract layout info
    if (n.absoluteBoundingBox) {
      if (depth === 0) {
        tokens.layout = {
          width: Math.round(n.absoluteBoundingBox.width),
          height: Math.round(n.absoluteBoundingBox.height),
          x: Math.round(n.absoluteBoundingBox.x),
          y: Math.round(n.absoluteBoundingBox.y)
        };
      }
    }

    // Extract structure
    tokens.structure.push({
      name: n.name,
      type: n.type,
      depth: depth,
      bounds: n.absoluteBoundingBox ? {
        x: Math.round(n.absoluteBoundingBox.x),
        y: Math.round(n.absoluteBoundingBox.y),
        width: Math.round(n.absoluteBoundingBox.width),
        height: Math.round(n.absoluteBoundingBox.height)
      } : null
    });

    // Extract colors from fills
    if (n.fills && Array.isArray(n.fills)) {
      n.fills.forEach(fill => {
        if (fill.type === 'SOLID' && fill.color) {
          const r = Math.round(fill.color.r * 255);
          const g = Math.round(fill.color.g * 255);
          const b = Math.round(fill.color.b * 255);
          const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
          tokens.colors.push({
            element: n.name,
            hex: hex,
            opacity: fill.opacity || 1
          });
        }
      });
    }

    // Extract typography
    if (n.type === 'TEXT') {
      tokens.typography.push({
        text: n.characters,
        fontFamily: n.style?.fontFamily || 'Arial',
        fontSize: n.style?.fontSize || 14,
        fontWeight: n.style?.fontWeight || 400,
        textAlign: n.style?.textAlignHorizontal || 'LEFT',
        color: n.fills && n.fills[0] && n.fills[0].color ?
          `#${Math.round(n.fills[0].color.r * 255).toString(16).padStart(2, '0')}${Math.round(n.fills[0].color.g * 255).toString(16).padStart(2, '0')}${Math.round(n.fills[0].color.b * 255).toString(16).padStart(2, '0')}`
          : '#000000',
        bounds: n.absoluteBoundingBox
      });
    }

    // Extract effects (shadows, etc)
    if (n.effects && Array.isArray(n.effects) && n.effects.length > 0) {
      n.effects.forEach(effect => {
        if (effect.visible !== false) {
          tokens.effects.push({
            type: effect.type,
            element: n.name,
            ...effect
          });
        }
      });
    }

    // Recursively traverse children
    if (n.children && Array.isArray(n.children)) {
      n.children.forEach(child => traverse(child, depth + 1));
    }
  }

  traverse(node);
  return tokens;
}

// Figma REST API proxy endpoint
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { figmaToken, figmaUrl } = req.body;

    if (!figmaToken || !figmaUrl) {
      return res.status(400).json({ error: 'Missing figmaToken or figmaUrl' });
    }

    // Parse Figma URL to extract file key and node ID
    // Support both /file/ and /design/ URL formats
    const urlMatch = figmaUrl.match(/\/(file|design)\/([^/]+)/);
    if (!urlMatch) {
      return res.status(400).json({ error: 'Invalid Figma URL format. Expected format: https://www.figma.com/file/... or https://www.figma.com/design/...' });
    }

    const fileKey = urlMatch[2];

    // Extract node ID from URL if present (e.g., ?node-id=123-456 or ?node-id=123:456)
    let nodeId = null;
    const nodeMatch = figmaUrl.match(/node-id=([^&]+)/);
    if (nodeMatch) {
      // Convert hyphen format to colon format for API (3775-48500 -> 3775:48500)
      nodeId = nodeMatch[1].replace('-', ':');
    }

    // Step 1: Get file data
    const fileResponse = await fetch(
      `https://api.figma.com/v1/files/${fileKey}`,
      {
        headers: {
          'X-Figma-Token': figmaToken
        }
      }
    );

    if (!fileResponse.ok) {
      const errorData = await fileResponse.json();
      return res.status(fileResponse.status).json({
        error: errorData.err || errorData.message || 'Failed to fetch Figma file'
      });
    }

    const fileData = await fileResponse.json();

    // Step 2: Get node-specific data if nodeId is provided
    let nodeData = null;
    if (nodeId) {
      const nodeResponse = await fetch(
        `https://api.figma.com/v1/files/${fileKey}/nodes?ids=${nodeId}`,
        {
          headers: {
            'X-Figma-Token': figmaToken
          }
        }
      );

      if (nodeResponse.ok) {
        nodeData = await nodeResponse.json();
      }
    }

    // Step 3: Get image URLs for the nodes
    let imageUrl = null;
    if (nodeId) {
      const imageResponse = await fetch(
        `https://api.figma.com/v1/images/${fileKey}?ids=${nodeId}&format=png&scale=2`,
        {
          headers: {
            'X-Figma-Token': figmaToken
          }
        }
      );

      if (imageResponse.ok) {
        const imageData = await imageResponse.json();
        imageUrl = imageData.images[nodeId];
      }
    }

    // Download the image and convert to base64 if available
    let base64Image = null;
    if (imageUrl) {
      const imgResponse = await fetch(imageUrl);
      if (imgResponse.ok) {
        const arrayBuffer = await imgResponse.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        base64Image = buffer.toString('base64');
      }
    }

    // Extract structured design tokens from node data
    let designTokens = null;
    if (nodeData && nodeData.nodes && nodeId) {
      const node = nodeData.nodes[nodeId];
      if (node && node.document) {
        designTokens = extractDesignTokens(node.document);
      }
    }

    return res.status(200).json({
      fileData,
      nodeData,
      imageUrl,
      base64Image,
      fileKey,
      nodeId,
      designTokens
    });

  } catch (error) {
    console.error('Figma API error:', error);
    return res.status(500).json({
      error: error.message || 'Internal server error'
    });
  }
}
