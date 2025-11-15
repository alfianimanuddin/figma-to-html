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
    const urlMatch = figmaUrl.match(/\/file\/([^/]+)/);
    if (!urlMatch) {
      return res.status(400).json({ error: 'Invalid Figma URL format' });
    }

    const fileKey = urlMatch[1];

    // Extract node ID from URL if present (e.g., ?node-id=123:456)
    let nodeId = null;
    const nodeMatch = figmaUrl.match(/node-id=([^&]+)/);
    if (nodeMatch) {
      nodeId = nodeMatch[1];
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

    return res.status(200).json({
      fileData,
      nodeData,
      imageUrl,
      base64Image,
      fileKey,
      nodeId
    });

  } catch (error) {
    console.error('Figma API error:', error);
    return res.status(500).json({
      error: error.message || 'Internal server error'
    });
  }
}
