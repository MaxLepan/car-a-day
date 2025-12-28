import { Router } from "express";
import { getOrCreateTodayPuzzle } from "../services/dailyPuzzleService";

const router = Router();

router.get("/today", async (_req, res) => {
  try {
    const puzzle = await getOrCreateTodayPuzzle();
    return res.json({
      date: puzzle.date,
      puzzleId: puzzle.id
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to load today's puzzle." });
  }
});

export default router;
