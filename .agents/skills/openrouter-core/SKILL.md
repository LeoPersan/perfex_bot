---
name: openrouter-core
description: Concise reference for integrating OpenRouter TypeScript SDK (@openrouter/agent and @openrouter/sdk) to call models and query available AI models.
---

# OpenRouter Core Skill

Essential reference for connecting to OpenRouter models, calling models in TypeScript, and querying available models.

## Packages

- **`@openrouter/agent`**: High-level agent execution (`callModel`, tool integration).
- **`@openrouter/sdk`**: Low-level platform features (listing models, API keys, direct completions).

```bash
npm install @openrouter/agent @openrouter/sdk
```

---

## 1. Initializing Client

```typescript
import { OpenRouter } from '@openrouter/agent';

const client = new OpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY
});
```

---

## 2. Basic Model Call (`callModel`)

```typescript
const response = await client.callModel({
  model: 'meta-llama/llama-3.3-70b-instruct:free',
  input: [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'Hello!' }
  ]
});

console.log(response.output);
```

---

## 3. Streaming Responses

```typescript
const stream = await client.callModel({
  model: 'meta-llama/llama-3.3-70b-instruct:free',
  input: 'Write a short poem',
  stream: true
});

for await (const chunk of stream) {
  if (chunk.type === 'content_delta') {
    process.stdout.write(chunk.delta);
  }
}
```

---

## 4. Listing and Searching Models (`@openrouter/sdk`)

```typescript
import OpenRouter from '@openrouter/sdk';

const sdk = new OpenRouter({ apiKey: process.env.OPENROUTER_API_KEY });

// Get all models
const { data: models } = await sdk.models.list();

// Filter free models
const freeModels = models.filter(m => 
  m.pricing?.prompt === '0' && m.pricing?.completion === '0'
);

// Find fastest/available model
console.log('Available free models:', freeModels.map(m => m.id));
```
