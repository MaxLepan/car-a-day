import { Router } from "express";
import { z } from "zod";
import { searchCars } from "../services/carService";

const router = Router();

const searchQuerySchema = z.object({
  q: z.string().min(1)
});

router.get("/search", async (req, res) => {
  const parsed = searchQuerySchema.safeParse({ q: req.query.q });

  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid query." });
  }

  const results = await searchCars(parsed.data.q);
  return res.json(results);
});

export default router;
