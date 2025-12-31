import express from "express";
import cors from "cors";
import puzzleRoutes from "./routes/puzzleRoutes";
import carRoutes from "./routes/carRoutes";
import guessRoutes from "./routes/guessRoutes";

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:4200"
  })
);

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/puzzle", puzzleRoutes);
app.use("/cars", carRoutes);
app.use("/guess", guessRoutes);

const port = process.env.PORT ? Number(process.env.PORT) : 3000;

app.listen(port, () => {
  console.log(`API listening on port ${port}`);
});
