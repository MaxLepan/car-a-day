/// <reference types="jest" />

import { createWikiSummaryService } from "./wikiSummaryService";
import type { WikiSummaryPrisma } from "./wikiSummaryService";

type PrismaMock = {
  wikiSummaryCache: {
    findUnique: jest.Mock;
    upsert: jest.Mock;
  };
};

function createPrismaMock(): PrismaMock {
  return {
    wikiSummaryCache: {
      findUnique: jest.fn(),
      upsert: jest.fn()
    }
  };
}

function mockFetchResponse(status: number, data: unknown) {
  return {
    status,
    ok: status >= 200 && status < 300,
    json: async () => data
  };
}

const baseModel = {
  make: "Peugeot",
  model: "208",
  wikiTitleFr: "Peugeot 208",
  wikiTitleEn: "Peugeot 208",
  wikiGenerationHintFr: "II",
  wikiGenerationHintEn: "II"
};

describe("wikiSummaryService", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("returns cached summary when not expired", async () => {
    const prisma = createPrismaMock();
    prisma.wikiSummaryCache.findUnique.mockResolvedValueOnce({
      lang: "fr",
      title: "Peugeot 208",
      extract: "Cached extract",
      url: "https://fr.wikipedia.org/wiki/Peugeot_208",
      expiresAt: new Date(Date.now() + 1000 * 60 * 60)
    });

    global.fetch = jest.fn();

    const service = createWikiSummaryService(prisma as unknown as WikiSummaryPrisma);
    const summary = await service.getWikiSummaryForModel(baseModel, "fr");

    expect(summary?.extract).toBe("Cached extract");
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("falls back to model title when generation hint page is missing", async () => {
    const prisma = createPrismaMock();
    prisma.wikiSummaryCache.findUnique.mockResolvedValue(null);
    prisma.wikiSummaryCache.upsert.mockResolvedValue(undefined);

    const fetchMock = jest.fn();
    fetchMock
      .mockResolvedValueOnce(mockFetchResponse(404, {}))
      .mockResolvedValueOnce(
        mockFetchResponse(200, {
          title: "Peugeot 208",
          extract: "Base extract",
          content_urls: { desktop: { page: "https://fr.wikipedia.org/wiki/Peugeot_208" } }
        })
      );
    global.fetch = fetchMock as unknown as typeof fetch;

    const service = createWikiSummaryService(prisma as unknown as WikiSummaryPrisma);
    const summary = await service.getWikiSummaryForModel(baseModel, "fr");

    expect(summary?.title).toBe("Peugeot 208");
    expect(summary?.extract).toBe("Base extract");
  });

  it("falls back to the other language when preferred language is unavailable", async () => {
    const prisma = createPrismaMock();
    prisma.wikiSummaryCache.findUnique.mockResolvedValue(null);
    prisma.wikiSummaryCache.upsert.mockResolvedValue(undefined);

    const fetchMock = jest.fn();
    fetchMock
      .mockResolvedValueOnce(mockFetchResponse(404, {}))
      .mockResolvedValueOnce(mockFetchResponse(404, {}))
      .mockResolvedValueOnce(
        mockFetchResponse(200, {
          title: "Peugeot 208",
          extract: "French extract",
          content_urls: { desktop: { page: "https://fr.wikipedia.org/wiki/Peugeot_208" } }
        })
      );
    global.fetch = fetchMock as unknown as typeof fetch;

    const service = createWikiSummaryService(prisma as unknown as WikiSummaryPrisma);
    const summary = await service.getWikiSummaryForModel(baseModel, "en");

    expect(summary?.usedLang).toBe("fr");
    expect(summary?.extract).toBe("French extract");
  });

  it("stores fetched summary in cache", async () => {
    const prisma = createPrismaMock();
    prisma.wikiSummaryCache.findUnique.mockResolvedValue(null);
    prisma.wikiSummaryCache.upsert.mockResolvedValue(undefined);

    const fetchMock = jest.fn().mockResolvedValue(
      mockFetchResponse(200, {
        title: "Peugeot 208",
        extract: "Stored extract",
        content_urls: { desktop: { page: "https://fr.wikipedia.org/wiki/Peugeot_208" } }
      })
    );
    global.fetch = fetchMock as unknown as typeof fetch;

    const service = createWikiSummaryService(prisma as unknown as WikiSummaryPrisma);
    await service.getWikiSummaryForModel(baseModel, "fr");

    expect(prisma.wikiSummaryCache.upsert).toHaveBeenCalledTimes(1);
  });
});
