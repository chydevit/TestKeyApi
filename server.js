import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static assets from the production dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Helper to map and forward OpenAI compatible endpoints (OpenAI, Groq, OpenRouter)
async function handleOpenAIChat(url, apiKey, model, messages, temperature, maxTokens, systemPrompt, customHeaders = {}) {
  const messagesWithSystem = [...messages];
  if (systemPrompt) {
    messagesWithSystem.unshift({ role: 'system', content: systemPrompt });
  }

  const headers = {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    ...customHeaders
  };

  const body = {
    model: model,
    messages: messagesWithSystem,
    temperature: Number(temperature) ?? 0.7,
  };

  if (maxTokens) {
    body.max_tokens = Number(maxTokens);
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error?.message || data.error || JSON.stringify(data));
  }

  return {
    content: data.choices[0].message.content,
    usage: data.usage || null
  };
}

// Helper to map and forward Anthropic requests
async function handleAnthropicChat(apiKey, model, messages, temperature, maxTokens, systemPrompt) {
  const url = 'https://api.anthropic.com/v1/messages';
  
  const headers = {
    'x-api-key': apiKey,
    'anthropic-version': '2023-06-01',
    'Content-Type': 'application/json'
  };

  const filteredMessages = messages
    .filter(msg => msg.role !== 'system')
    .map(msg => ({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: msg.content
    }));

  const body = {
    model: model,
    messages: filteredMessages,
    max_tokens: Number(maxTokens) || 1024,
    temperature: Number(temperature) ?? 0.7
  };

  if (systemPrompt) {
    body.system = systemPrompt;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || JSON.stringify(data));
  }

  return {
    content: data.content[0].text,
    usage: data.usage || null
  };
}

// Helper to map and forward Google Gemini requests
async function handleGeminiChat(apiKey, model, messages, temperature, maxTokens, systemPrompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const headers = {
    'Content-Type': 'application/json'
  };

  const contents = messages
    .filter(msg => msg.role !== 'system')
    .map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

  const body = {
    contents: contents,
    generationConfig: {
      temperature: Number(temperature) ?? 0.7,
    }
  };

  if (maxTokens) {
    body.generationConfig.maxOutputTokens = Number(maxTokens);
  }

  if (systemPrompt) {
    body.systemInstruction = {
      parts: [{ text: systemPrompt }]
    };
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || JSON.stringify(data));
  }

  if (!data.candidates || data.candidates.length === 0) {
    throw new Error('Gemini returned no candidates. Prompt might be blocked or empty.');
  }

  return {
    content: data.candidates[0].content.parts[0].text,
    usage: data.usageMetadata || null
  };
}

// API Verification endpoint
app.post('/api/verify', async (req, res) => {
  const { provider, apiKey, model } = req.body;
  const startTime = Date.now();

  if (!provider || !apiKey || !model) {
    return res.status(400).json({ success: false, error: 'Missing required parameters.' });
  }

  try {
    let result;
    const testMessage = [{ role: 'user', content: 'Ping' }];

    switch (provider) {
      case 'openai':
        result = await handleOpenAIChat(
          'https://api.openai.com/v1/chat/completions',
          apiKey,
          model,
          testMessage,
          0.1,
          5,
          ''
        );
        break;
      case 'anthropic':
        result = await handleAnthropicChat(
          apiKey,
          model,
          testMessage,
          0.1,
          5,
          ''
        );
        break;
      case 'gemini':
        result = await handleGeminiChat(
          apiKey,
          model,
          testMessage,
          0.1,
          5,
          ''
        );
        break;
      case 'groq':
        result = await handleOpenAIChat(
          'https://api.groq.com/openai/v1/chat/completions',
          apiKey,
          model,
          testMessage,
          0.1,
          5,
          ''
        );
        break;
      case 'openrouter':
        result = await handleOpenAIChat(
          'https://openrouter.ai/api/v1/chat/completions',
          apiKey,
          model,
          testMessage,
          0.1,
          5,
          '',
          {
            'HTTP-Referer': 'http://localhost:3000',
            'X-Title': 'AetherKey Sandbox'
          }
        );
        break;
      case 'deepseek':
        result = await handleOpenAIChat(
          'https://api.deepseek.com/chat/completions',
          apiKey,
          model,
          testMessage,
          0.1,
          5,
          ''
        );
        break;
      case 'mistral':
        result = await handleOpenAIChat(
          'https://api.mistral.ai/v1/chat/completions',
          apiKey,
          model,
          testMessage,
          0.1,
          5,
          ''
        );
        break;
      case 'cohere':
        result = await handleOpenAIChat(
          'https://api.cohere.com/compatibility/v1/chat/completions',
          apiKey,
          model,
          testMessage,
          0.1,
          5,
          ''
        );
        break;
      case 'ollama':
        result = await handleOpenAIChat(
          'http://localhost:11434/v1/chat/completions',
          apiKey,
          model,
          testMessage,
          0.1,
          5,
          ''
        );
        break;
      case 'mock':
        result = {
          content: "API Validation Simulated: Success.",
          usage: { prompt_tokens: 5, completion_tokens: 10, total_tokens: 15 }
        };
        break;
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }

    const latency = Date.now() - startTime;
    res.json({
      success: true,
      latency,
      response: result.content,
      usage: result.usage
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// API Chat endpoint
app.post('/api/chat', async (req, res) => {
  const { provider, apiKey, model, messages, temperature, maxTokens, systemPrompt } = req.body;
  const startTime = Date.now();

  if (!provider || !apiKey || !model || !messages) {
    return res.status(400).json({ success: false, error: 'Missing required parameters.' });
  }

  try {
    let result;

    switch (provider) {
      case 'openai':
        result = await handleOpenAIChat(
          'https://api.openai.com/v1/chat/completions',
          apiKey,
          model,
          messages,
          temperature,
          maxTokens,
          systemPrompt
        );
        break;
      case 'anthropic':
        result = await handleAnthropicChat(
          apiKey,
          model,
          messages,
          temperature,
          maxTokens,
          systemPrompt
        );
        break;
      case 'gemini':
        result = await handleGeminiChat(
          apiKey,
          model,
          messages,
          temperature,
          maxTokens,
          systemPrompt
        );
        break;
      case 'groq':
        result = await handleOpenAIChat(
          'https://api.groq.com/openai/v1/chat/completions',
          apiKey,
          model,
          messages,
          temperature,
          maxTokens,
          systemPrompt
        );
        break;
      case 'openrouter':
        result = await handleOpenAIChat(
          'https://openrouter.ai/api/v1/chat/completions',
          apiKey,
          model,
          messages,
          temperature,
          maxTokens,
          systemPrompt,
          {
            'HTTP-Referer': 'http://localhost:3000',
            'X-Title': 'AetherKey Sandbox'
          }
        );
        break;
      case 'deepseek':
        result = await handleOpenAIChat(
          'https://api.deepseek.com/chat/completions',
          apiKey,
          model,
          messages,
          temperature,
          maxTokens,
          systemPrompt
        );
        break;
      case 'mistral':
        result = await handleOpenAIChat(
          'https://api.mistral.ai/v1/chat/completions',
          apiKey,
          model,
          messages,
          temperature,
          maxTokens,
          systemPrompt
        );
        break;
      case 'cohere':
        result = await handleOpenAIChat(
          'https://api.cohere.com/compatibility/v1/chat/completions',
          apiKey,
          model,
          messages,
          temperature,
          maxTokens,
          systemPrompt
        );
        break;
      case 'ollama':
        result = await handleOpenAIChat(
          'http://localhost:11434/v1/chat/completions',
          apiKey,
          model,
          messages,
          temperature,
          maxTokens,
          systemPrompt
        );
        break;
      case 'mock':
        {
          const userPrompt = messages[messages.length - 1]?.content || '';
          result = {
            content: `This is a mock simulated response to your message:\n\n> "${userPrompt}"\n\nYour AetherKey Sandbox is fully functioning! In a real scenario, this response would come from the **${model}** model. Feel free to explore other providers by inputting their real API keys.`,
            usage: { prompt_tokens: messages.length * 15, completion_tokens: 45, total_tokens: messages.length * 15 + 45 }
          };
        }
        break;
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }

    const latency = Date.now() - startTime;
    res.json({
      success: true,
      latency,
      content: result.content,
      usage: result.usage
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Fallback to index.html for spa production support
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
