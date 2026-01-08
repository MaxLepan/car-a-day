import { Router } from "express";
import { z } from "zod";
import { getDateKey, getOrCreatePuzzleForDate, getPuzzleByDate } from "../services/dailyPuzzleService";
import { PuzzleMode } from "@prisma/client";
import { createWikiSummaryService } from "../services/wikiSummaryService";
import { prisma } from "../prisma";

const router = Router();

const querySchema = z.object({
  mode: z.enum(["easy", "hard"])
});

const wikiQuerySchema = z.object({
  mode: z.enum(["easy", "hard"]),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  lang: z.enum(["fr", "en"])
});

router.get("/today", async (req, res) => {
  const parsed = querySchema.safeParse({ mode: req.query.mode });
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid mode. Use easy or hard." });
  }

  try {
    const mode: PuzzleMode = parsed.data.mode === "easy" ? "EASY" : "HARD";
    const todayKey = getDateKey(new Date());
    const yesterdayKey = getDateKey(new Date(Date.now() - 24 * 60 * 60 * 1000));

    const todayPuzzle = await getOrCreatePuzzleForDate(todayKey, mode);
    const yesterdayPuzzle = await getOrCreatePuzzleForDate(yesterdayKey, mode);

    const yesterdayLabel =
      mode === "EASY"
        ? buildModelLabel(yesterdayPuzzle.targetModel)
        : buildVariantLabel(yesterdayPuzzle.targetVariant);

    return res.json({
      today: {
        date: todayPuzzle.date,
        mode: todayPuzzle.mode,
        puzzleId: todayPuzzle.id,
        maxAttempts: 6
      },
      yesterday: {
        date: yesterdayPuzzle.date,
        mode: yesterdayPuzzle.mode,
        label: yesterdayLabel
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to load today's puzzle." });
  }
});

// Note: endpoint is public; frontend decides to call it only after "solved".
router.get("/wiki-summary", async (req, res) => {
  const parsed = wikiQuerySchema.safeParse({
    mode: req.query.mode,
    date: req.query.date,
    lang: req.query.lang
  });

  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid query." });
  }

  const mode: PuzzleMode = parsed.data.mode === "easy" ? "EASY" : "HARD";

  try {
    const puzzle = await getPuzzleByDate(parsed.data.date, mode);
    if (!puzzle) {
      return res.status(404).json({ error: "Puzzle not found." });
    }

    const model =
      mode === "EASY" ? puzzle.targetModel : puzzle.targetVariant?.model ?? null;

    if (!model) {
      return res.status(404).json({ error: "Puzzle target not found." });
    }

    const wikiService = createWikiSummaryService(prisma);
    const summary = await wikiService.getWikiSummaryForModel(model, parsed.data.lang);

    if (!summary) {
      const fallbackTitle = `${model.make} ${model.model}`.trim();
      const unavailable =
        parsed.data.lang === "en" ? "Summary unavailable." : "Resume indisponible.";
      return res.json({
        date: puzzle.date,
        mode: puzzle.mode,
        usedLang: parsed.data.lang,
        title: fallbackTitle,
        extract: unavailable,
        url: "",
        attribution: { source: "Wikipedia", url: "" }
      });
    }

    return res.json({
      date: puzzle.date,
      mode: puzzle.mode,
      usedLang: summary.usedLang,
      title: summary.title,
      extract: summary.extract,
      url: summary.url,
      attribution: { source: "Wikipedia", url: summary.url }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to load wiki summary." });
  }
});

export default router;

function buildModelLabel(model: { make: string; model: string; generation: string | null; countryOfOrigin: string; productionStartYear: number } | null): string {
  if (!model) {
    return "Unknown";
  }
  const generationPart = model.generation ? ` (${model.generation})` : "";
  return `${model.make} ${model.model}${generationPart} - ${model.countryOfOrigin} - ${model.productionStartYear}`;
}

function buildVariantLabel(variant: {
  model: {
    make: string;
    model: string;
    generation: string | null;
    productionStartYear: number;
  };
  fuelType: string | null;
  transmission: string | null;
  powerHp: number | null;
  engineType: string | null;
  displacementCc: number | null;
  productionStartYear: number | null;
} | null): string {
  if (!variant) {
    return "Unknown";
  }
  const generationPart = variant.model.generation ? ` (${variant.model.generation})` : "";
  const base = `${variant.model.make} ${variant.model.model}${generationPart}`;

  const parts: string[] = [];

  if (variant.engineType) {
    parts.push(variant.engineType);
  }

  if (variant.displacementCc) {
    const liters = (variant.displacementCc / 1000).toFixed(1).replace(/\.0$/, "");
    parts.push(liters);
  }

  if (variant.powerHp) {
    parts.push(`${variant.powerHp}hp`);
  }

  if (variant.fuelType) {
    parts.push(
      variant.fuelType === "PETROL"
        ? "Petrol"
        : variant.fuelType === "DIESEL"
        ? "Diesel"
        : variant.fuelType === "ELECTRIC"
        ? "Electric"
        : "Hybrid"
    );
  }

  if (variant.transmission) {
    parts.push(variant.transmission === "AUTOMATIC" ? "Auto" : "Manual");
  }

  const year = variant.productionStartYear ?? variant.model.productionStartYear;
  const details = parts.length > 0 ? ` ${parts.join(" ")}` : "";
  return `${base}${details} - ${year}`;
}
