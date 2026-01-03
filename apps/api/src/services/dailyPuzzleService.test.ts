/// <reference types="jest" />

import type { DailyPuzzlePrisma } from "./dailyPuzzleService";
import { createDailyPuzzleService, formatDateEuropeParis, getDateKey } from "./dailyPuzzleService";

type PrismaMock = {
  dailyPuzzle: {
    findUnique: jest.Mock;
    create: jest.Mock;
  };
  carModel: {
    findMany: jest.Mock;
  };
  carVariant: {
    findMany: jest.Mock;
  };
};

function createPrismaMock(): PrismaMock {
  return {
    dailyPuzzle: {
      findUnique: jest.fn(),
      create: jest.fn()
    },
    carModel: {
      findMany: jest.fn()
    },
    carVariant: {
      findMany: jest.fn()
    }
  } as PrismaMock;
}

describe("dailyPuzzleService", () => {
  it("formats date as YYYY-MM-DD in Europe/Paris timezone", () => {
    const date = new Date("2024-01-15T10:30:00Z");
    const result = formatDateEuropeParis(date);

    expect(result).toBe("2024-01-15");
  });

  it("getDateKey matches formatDateEuropeParis output", () => {
    const date = new Date("2024-02-20T22:30:00Z");
    const fromFormatter = formatDateEuropeParis(date);
    const fromKey = getDateKey(date);

    expect(fromKey).toBe(fromFormatter);
  });

  it("returns existing puzzle when found", async () => {
    const prisma = createPrismaMock();
    prisma.dailyPuzzle.findUnique.mockResolvedValueOnce({
      id: 10,
      date: "2025-01-01",
      mode: "EASY",
      targetModel: { id: 1 },
      targetVariant: null
    });

    const service = createDailyPuzzleService(prisma as unknown as DailyPuzzlePrisma);
    const result = await service.getOrCreatePuzzleForDate("2025-01-01", "EASY");

    expect(result.id).toBe(10);
    expect(result.mode).toBe("EASY");
    expect(prisma.dailyPuzzle.create).not.toHaveBeenCalled();
  });

  it("creates an EASY puzzle when none exists", async () => {
    const prisma = createPrismaMock();
    prisma.dailyPuzzle.findUnique.mockResolvedValueOnce(null);
    prisma.dailyPuzzle.findUnique.mockResolvedValueOnce(null);
    prisma.carModel.findMany.mockResolvedValueOnce([{ id: 2 }, { id: 5 }, { id: 9 }]);
    prisma.dailyPuzzle.create.mockResolvedValueOnce({
      id: 20,
      date: "2025-01-02",
      mode: "EASY",
      targetModel: { id: 5 },
      targetVariant: null
    });

    const service = createDailyPuzzleService(prisma as unknown as DailyPuzzlePrisma);
    await service.getOrCreatePuzzleForDate("2025-01-02", "EASY");

    expect(prisma.dailyPuzzle.create).toHaveBeenCalledTimes(1);
    expect(prisma.dailyPuzzle.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          date: "2025-01-02",
          mode: "EASY",
          targetVariantId: null
        })
      })
    );
  });

  it("uses deterministic selection for EASY (same date => same target)", async () => {
    const prisma = createPrismaMock();
    prisma.dailyPuzzle.findUnique.mockResolvedValue(null);
    prisma.carModel.findMany.mockResolvedValue([{ id: 1 }, { id: 2 }, { id: 3 }]);

    const service = createDailyPuzzleService(prisma as unknown as DailyPuzzlePrisma);

    prisma.dailyPuzzle.create.mockResolvedValueOnce({
      id: 30,
      date: "2025-01-03",
      mode: "EASY",
      targetModel: { id: 1 },
      targetVariant: null
    });
    await service.getOrCreatePuzzleForDate("2025-01-03", "EASY");
    const firstCall = prisma.dailyPuzzle.create.mock.calls[0][0].data.targetModelId;

    prisma.dailyPuzzle.create.mockResolvedValueOnce({
      id: 31,
      date: "2025-01-03",
      mode: "EASY",
      targetModel: { id: 1 },
      targetVariant: null
    });
    await service.getOrCreatePuzzleForDate("2025-01-03", "EASY");
    const secondCall = prisma.dailyPuzzle.create.mock.calls[1][0].data.targetModelId;

    expect(firstCall).toBe(secondCall);
  });

  it("throws when no car models are available", async () => {
    const prisma = createPrismaMock();
    prisma.dailyPuzzle.findUnique.mockResolvedValueOnce(null);
    prisma.dailyPuzzle.findUnique.mockResolvedValueOnce(null);
    prisma.carModel.findMany.mockResolvedValueOnce([]);

    const service = createDailyPuzzleService(prisma as unknown as DailyPuzzlePrisma);

    await expect(service.getOrCreatePuzzleForDate("2025-01-04", "EASY")).rejects.toThrow(
      "No car models available to create today's puzzle."
    );
  });

  it("creates a HARD puzzle when none exists", async () => {
    const prisma = createPrismaMock();
    prisma.dailyPuzzle.findUnique.mockResolvedValueOnce(null);
    prisma.dailyPuzzle.findUnique.mockResolvedValueOnce(null);
    prisma.carVariant.findMany.mockResolvedValueOnce([
      { id: 11, modelId: 1 },
      { id: 12, modelId: 2 }
    ]);
    prisma.dailyPuzzle.create.mockResolvedValueOnce({
      id: 40,
      date: "2025-01-05",
      mode: "HARD",
      targetModel: null,
      targetVariant: { id: 12, modelId: 2, model: { id: 2 } }
    });

    const service = createDailyPuzzleService(prisma as unknown as DailyPuzzlePrisma);
    await service.getOrCreatePuzzleForDate("2025-01-05", "HARD");

    expect(prisma.dailyPuzzle.create).toHaveBeenCalledTimes(1);
    expect(prisma.dailyPuzzle.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          date: "2025-01-05",
          mode: "HARD",
          targetModelId: null
        })
      })
    );
  });

  it("throws when no car variants are available", async () => {
    const prisma = createPrismaMock();
    prisma.dailyPuzzle.findUnique.mockResolvedValueOnce(null);
    prisma.dailyPuzzle.findUnique.mockResolvedValueOnce(null);
    prisma.carVariant.findMany.mockResolvedValueOnce([]);

    const service = createDailyPuzzleService(prisma as unknown as DailyPuzzlePrisma);

    await expect(service.getOrCreatePuzzleForDate("2025-01-06", "HARD")).rejects.toThrow(
      "No car variants available to create today's puzzle."
    );
  });

  it("falls back to full pool if avoiding model removes all EASY candidates", async () => {
    const prisma = createPrismaMock();
    prisma.dailyPuzzle.findUnique.mockResolvedValueOnce(null);
    prisma.dailyPuzzle.findUnique.mockResolvedValueOnce({
      id: 99,
      date: "2025-01-07",
      mode: "HARD",
      targetModel: null,
      targetVariant: { id: 55, modelId: 5 }
    });
    prisma.carModel.findMany.mockResolvedValueOnce([{ id: 5 }]);
    prisma.dailyPuzzle.create.mockResolvedValueOnce({
      id: 50,
      date: "2025-01-07",
      mode: "EASY",
      targetModel: { id: 5 },
      targetVariant: null
    });

    const service = createDailyPuzzleService(prisma as unknown as DailyPuzzlePrisma);
    await service.getOrCreatePuzzleForDate("2025-01-07", "EASY");

    expect(prisma.dailyPuzzle.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          targetModelId: 5
        })
      })
    );
  });

  it("falls back to full pool if avoiding model removes all HARD candidates", async () => {
    const prisma = createPrismaMock();
    prisma.dailyPuzzle.findUnique.mockResolvedValueOnce(null);
    prisma.dailyPuzzle.findUnique.mockResolvedValueOnce({
      id: 88,
      date: "2025-01-08",
      mode: "EASY",
      targetModel: { id: 7 },
      targetVariant: null
    });
    prisma.carVariant.findMany.mockResolvedValueOnce([{ id: 77, modelId: 7 }]);
    prisma.dailyPuzzle.create.mockResolvedValueOnce({
      id: 60,
      date: "2025-01-08",
      mode: "HARD",
      targetModel: null,
      targetVariant: { id: 77, modelId: 7, model: { id: 7 } }
    });

    const service = createDailyPuzzleService(prisma as unknown as DailyPuzzlePrisma);
    await service.getOrCreatePuzzleForDate("2025-01-08", "HARD");

    expect(prisma.dailyPuzzle.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          targetVariantId: 77
        })
      })
    );
  });
});
