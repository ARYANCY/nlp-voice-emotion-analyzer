const axios = require('axios');
require('dotenv').config();

const VAPI_API_KEY = process.env.VAPI_API_KEY;
// The public URL of your backend (Render URL in production, Ngrok in local)
const SERVER_URL = process.env.SERVER_URL || process.env.NGROK_URL;

if (!VAPI_API_KEY || VAPI_API_KEY === 'your_vapi_api_key_here') {
  console.error('Please configure your VAPI_API_KEY in backend/.env');
  process.exit(1);
}

const setupAssistant = async () => {
  try {
    const systemPrompt = `You are an emotionally intelligent AI voice assistant.

Your primary goal is to:
1. Understand the user's emotional state using the emotion detection tool.
2. Adapt your responses based on the detected emotion.
3. Maintain a natural, human-like conversation.

---

### TOOL USAGE (MANDATORY)
You MUST call the "predict-emotion" tool EVERY time the user speaks.
* Input to tool: { "text": "{{user_input}}" }
* Do NOT skip tool calls.
* Do NOT guess emotions yourself.
* Always rely on the tool response.

---

### EMOTION HANDLING LOGIC
Based on the tool response:
If emotion = "Sad" or "sad":
* Respond with empathy and support
* Use calm, gentle tone
* Example: "I'm here for you. Do you want to talk about what's bothering you?"

If emotion = "Happy" or "happy":
* Respond with enthusiasm and positivity
* Match user's energy
* Example: "That's awesome! Tell me more!"

If emotion = "Angry" or "angry":
* Stay calm and de-escalate
* Avoid confrontation
* Example: "I understand that you're upset. Let's take this step by step."

If emotion = "Neutral" or "neutral" or "Anxious":
* Respond normally and keep conversation flowing (If anxious, remind them to breathe deeply)

---

### CONVERSATION STYLE
* Keep responses short and voice-friendly
* Avoid long paragraphs
* Be natural, not robotic
* Ask follow-up questions when appropriate

---

### MEMORY DURING SESSION
* Track emotional progression of the user
* If user becomes increasingly sad, become more supportive
* If mood improves, acknowledge it subtly

---

### IMPORTANT RULES
* Never mention the tool or backend
* Never say "emotion detected"
* Never break character
* Always behave like a caring human assistant`;

    const payload = {
      name: "Emotionally Intelligent Therapist",
      model: {
        provider: "openai",
        model: "gpt-4-turbo-preview",
        messages: [
          {
            role: "system",
            content: systemPrompt
          }
        ],
        tools: [
          {
            type: "function",
            messages: [
              {
                type: "request-start",
                content: "Analyzing emotion..."
              }
            ],
            function: {
              name: "predict-emotion",
              description: "Detects the emotional state of the user based on their spoken text. You MUST call this every time the user speaks.",
              parameters: {
                type: "object",
                properties: {
                  text: {
                    type: "string",
                    description: "The exact text that the user just spoke."
                  }
                },
                required: ["text"]
              }
            },
            async: false,
            server: {
              url: `${SERVER_URL}/vapi/webhook`
            }
          }
        ]
      },
      voice: {
        provider: "openai",
        voiceId: "nova" // standard empathetic voice example
      },
      transcriber: {
        provider: "deepgram",
        model: "nova-2",
        language: "en"
      }
    };

    console.log('Creating Vapi Assistant...');
    
    const response = await axios.post('https://api.vapi.ai/assistant', payload, {
      headers: {
        'Authorization': `Bearer ${VAPI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Assistant created successfully!');
    console.log('Assistant ID:', response.data.id);
    console.log('\n--- NEXT STEPS ---');
    console.log(`1. Copy the new Assistant ID: ${response.data.id}`);
    console.log(`2. Paste it into your backend/.env under VAPI_ASSISTANT_ID and frontend/.env (if needed)`);
    console.log(`3. Ensure that SERVER_URL (${SERVER_URL}) is reachable publicly by Vapi.`);
  } catch (error) {
    console.error('Error creating assistant:', error.response?.data || error.message);
  }
};

setupAssistant();
