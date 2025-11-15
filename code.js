"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// This plugin code runs in Figma's sandbox
figma.showUI(__html__, { width: 400, height: 600 });
// Helper to safely serialize any value, removing Symbols
function safeSerialize(value) {
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
        const result = {};
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
function extractDesignData(node) {
    const data = {
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
        data.fills = node.fills.map(fill => {
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
        const textNode = node;
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
            const effectData = {
                type: effect.type,
                visible: effect.visible
            };
            if ('radius' in effect)
                effectData.radius = effect.radius;
            if ('color' in effect)
                effectData.color = rgbToHex(effect.color);
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
function rgbToHex(rgb) {
    const toHex = (value) => {
        const hex = Math.round(value * 255).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
}
// Listen for messages from the UI
figma.ui.onmessage = (msg) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    if (msg.type === 'get-credentials') {
        const apiKey = yield figma.clientStorage.getAsync('anthropic_api_key');
        const figmaToken = yield figma.clientStorage.getAsync('figma_token');
        figma.ui.postMessage({
            type: 'saved-credentials',
            apiKey: apiKey || '',
            figmaToken: figmaToken || ''
        });
        return;
    }
    if (msg.type === 'save-credentials') {
        yield figma.clientStorage.setAsync('anthropic_api_key', msg.apiKey);
        if (msg.figmaToken) {
            yield figma.clientStorage.setAsync('figma_token', msg.figmaToken);
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
            let nodeData = {};
            let designData = {};
            // Check if using Figma URL workflow
            if (figmaUrl && figmaToken) {
                // Use Figma REST API workflow
                const FIGMA_PROXY_URL = 'https://figma-to-html-ashen.vercel.app/api/figma';
                const figmaResponse = yield fetch(FIGMA_PROXY_URL, {
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
                    const errorData = yield figmaResponse.json();
                    throw new Error(errorData.error || 'Failed to fetch Figma data');
                }
                const figmaData = yield figmaResponse.json();
                base64Image = figmaData.base64Image || '';
                // Extract node data from REST API response
                if (figmaData.nodeData && figmaData.nodeId) {
                    const node = figmaData.nodeData.nodes[figmaData.nodeId];
                    if (node && node.document) {
                        nodeData = {
                            name: node.document.name,
                            width: ((_a = node.document.absoluteBoundingBox) === null || _a === void 0 ? void 0 : _a.width) || 0,
                            height: ((_b = node.document.absoluteBoundingBox) === null || _b === void 0 ? void 0 : _b.height) || 0,
                            type: node.document.type,
                            designData: node.document // Full REST API data
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
            }
            else {
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
                const imageBytes = yield node.exportAsync({
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
            const prompt = `You are an expert frontend developer specializing in creating HTML banners.

I need you to convert this Figma design into a production-ready HTML file for an in-app banner that will be used in NetCoreCloud.

Design Information:
- Name: ${nodeData.name}
${nodeData.width ? `- Width: ${nodeData.width}px` : ''}
${nodeData.height ? `- Height: ${nodeData.height}px` : ''}
${nodeData.type ? `- Type: ${nodeData.type}` : ''}

${figmaUrl ? '📌 IMPORTANT: This design data was fetched from Figma REST API and contains comprehensive layout information including:' : 'Extracted Design Data from Figma Plugin API:'}
${JSON.stringify(nodeData.designData, null, 2)}

Use this ${figmaUrl ? 'comprehensive REST API' : 'extracted'} data to create a PIXEL-PERFECT recreation. Pay special attention to:
- Exact text content and font properties
- Precise colors (use the exact hex values provided)
- Exact spacing, padding, and positioning (use absoluteBoundingBox coordinates)
- Layer structure, hierarchy, and z-index
- Auto-layout properties if present
- Effects like shadows, blur, and gradients

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
            const response = yield fetch(PROXY_URL, {
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
                const errorData = yield response.json();
                throw new Error(((_c = errorData.error) === null || _c === void 0 ? void 0 : _c.message) || `API request failed with status ${response.status}`);
            }
            const data = yield response.json();
            let htmlContent = data.content[0].text;
            // Clean up the response - remove markdown code blocks if present
            htmlContent = htmlContent.replace(/```html\n?/g, '').replace(/```\n?/g, '').trim();
            // Send the generated HTML to the UI
            figma.ui.postMessage({
                type: 'html-generated',
                html: htmlContent
            });
        }
        catch (error) {
            figma.ui.postMessage({
                type: 'error',
                message: error instanceof Error ? error.message : 'An unknown error occurred'
            });
        }
    }
    if (msg.type === 'cancel') {
        figma.closePlugin();
    }
});
