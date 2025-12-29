import { Router } from "express";
import { z } from "zod";
import { createModelGuessFeedback } from "../services/guessService";
import { BadRequestError, NotFoundError } from "../errors";

const router = Router();

const querySchema = z.object({
  mode: z.enum(["easy"])
});

const bodySchema = z.object({
  puzzleId: z.number().int().positive(),
  guessId: z.number().int().positive()
});

router.post("/", async (req, res) => {
  const queryParsed = querySchema.safeParse({ mode: req.query.mode });
  if (!queryParsed.success) {
    return res.status(400).json({ error: "Invalid mode. Use easy." });
  }

  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid body." });
  }

  try {
    const result = await createModelGuessFeedback(parsed.data.puzzleId, parsed.data.guessId);
    return res.json(result);
  } catch (err) {
    if (err instanceof BadRequestError) {
      return res.status(400).json({ error: err.message });
    }
    if (err instanceof NotFoundError) {
      return res.status(404).json({ error: err.message });
    }
    return res.status(500).json({ error: "Failed to evaluate guess." });
  }
});

export default router;
