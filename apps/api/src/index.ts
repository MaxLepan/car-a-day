import express from "express";
import cors from "cors";

const app = express();

app.use(
  cors({
    origin: "http://localhost:4200"
  })
);

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

const port = process.env.PORT ? Number(process.env.PORT) : 3000;

app.listen(port, () => {
  console.log(`API listening on port ${port}`);
});
