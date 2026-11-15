import { PrismaClient, ModelProvider } from '@prisma/client';
import Redis from 'ioredis';

const prisma = new PrismaClient();
const MODEL_CACHE_KEY = 'model_catalog:enabled';

const models = [
  {
    id: 'gpt-4o-mini',
    provider: ModelProvider.openai,
    displayName: 'GPT-4o Mini',
    apiModelName: 'gpt-4o-mini',
    inputPricePer1k: 0.00015,
    outputPricePer1k: 0.0006,
  },
  {
    id: 'claude-3-5-haiku',
    provider: ModelProvider.anthropic,
    displayName: 'Claude 3.5 Haiku',
    apiModelName: 'claude-3-5-haiku-latest',
    inputPricePer1k: 0.001,
    outputPricePer1k: 0.005,
  },
  {
    id: 'gemini-2.0-flash',
    provider: ModelProvider.google,
    displayName: 'Gemini 2.0 Flash',
    apiModelName: 'gemini-2.0-flash',
    inputPricePer1k: 0.0001,
    outputPricePer1k: 0.0004,
  },
  {
    id: 'deepseek-v4-pro',
    provider: ModelProvider.openai,
    displayName: 'DeepSeek V4 Pro (GapGPT)',
    apiModelName: 'deepseek-v4-pro',
    apiBaseUrl: 'https://api.gapgpt.app/v1',
    apiKeyEnv: 'GAPGPT_API_KEY',
    inputPricePer1k: 0.0001,
    outputPricePer1k: 0.0004,
  },
];

async function invalidateModelCache() {
  const url = process.env.REDIS_URL ?? 'redis://localhost:6380';
  const redis = new Redis(url, { maxRetriesPerRequest: 1, lazyConnect: true });
  try {
    await redis.connect();
    await redis.del(MODEL_CACHE_KEY);
  } catch {
  } finally {
    redis.disconnect();
  }
}

async function main() {
  for (const model of models) {
    await prisma.modelCatalog.upsert({
      where: { id: model.id },
      create: model,
      update: {
        displayName: model.displayName,
        apiModelName: model.apiModelName,
        apiBaseUrl: model.apiBaseUrl ?? null,
        apiKeyEnv: model.apiKeyEnv ?? null,
        enabled: true,
      },
    });
  }
  await invalidateModelCache();
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });