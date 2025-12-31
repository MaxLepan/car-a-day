import { Router } from "express";
import { z } from "zod";
import { getOrCreateTodayPuzzle } from "../services/dailyPuzzleService";
import { PuzzleMode } from "@prisma/client";

const router = Router();

const querySchema = z.object({
  mode: z.enum(["easy", "hard"])
});

router.get("/today", async (req, res) => {
  const parsed = querySchema.safeParse({ mode: req.query.mode });
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid mode. Use easy or hard." });
  }

  try {
    const mode: PuzzleMode = parsed.data.mode === "easy" ? "EASY" : "HARD";
    const puzzle = await getOrCreateTodayPuzzle(mode);
    return res.json({
      date: puzzle.date,
      mode: puzzle.mode,
      puzzleId: puzzle.id,
      maxAttempts: 6
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to load today's puzzle." });
  }
});

export default router;
