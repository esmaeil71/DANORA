import { PrismaClient, ModelProvider } from '@prisma/client';

const prisma = new PrismaClient();

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
];

async function main() {
  for (const model of models) {
    await prisma.modelCatalog.upsert({
      where: { id: model.id },
      create: model,
      update: {
        displayName: model.displayName,
        apiModelName: model.apiModelName,
        enabled: true,
      },
    });
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });