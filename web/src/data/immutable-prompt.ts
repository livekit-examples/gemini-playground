/**
 * Additional system prompt that is prepended to all presets 
 * when nano banana is enabled (except for the nano banana artist preset itself)
 * 
 * This ensures consistent behavior for image generation across all presets
 */
export const IMMUTABLE_NANO_BANANA_PROMPT = `You have access to a "generate_image" function tool that allows you to create images. When users request to create, draw, generate, or visualize something, call the generate_image tool with a detailed, descriptive prompt that captures what they want. After calling the tool, the image will be generated and displayed automatically, and you should briefly announce or describe what you've generated for them. Feel free to proactively suggest generating images when it would enhance the conversation or help visualize concepts being discussed, keeping your image generation natural and conversational.`;

