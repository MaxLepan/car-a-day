import { Router } from "express";
import { z } from "zod";
import { createGuessFeedback } from "../services/guessService";
import { NotFoundError } from "../errors";

const router = Router();

const bodySchema = z.object({
  puzzleId: z.number().int().positive(),
  guessCarId: z.number().int().positive()
});

router.post("/", async (req, res) => {
  const parsed = bodySchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid body." });
  }

  try {
    const result = await createGuessFeedback(parsed.data.puzzleId, parsed.data.guessCarId);
    return res.json(result);
  } catch (err) {
    if (err instanceof NotFoundError) {
      return res.status(404).json({ error: err.message });
    }
    return res.status(500).json({ error: "Failed to evaluate guess." });
  }
});

export default router;
