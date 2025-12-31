import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma";
import { FuelType, Transmission } from "@prisma/client";

const router = Router();

const querySchema = z.object({
  q: z.string().min(1)
});

function formatModelLabel(model: {
  make: string;
  model: string;
  generation: string | null;
  countryOfOrigin: string;
  productionStartYear: number;
}): string {
  const generationPart = model.generation ? ` (${model.generation})` : "";
  return `${model.make} ${model.model}${generationPart} - ${model.countryOfOrigin} - ${model.productionStartYear}`;
}

function formatVariantLabel(variant: {
  model: {
    make: string;
    model: string;
    generation: string | null;
    productionStartYear: number;
  };
  fuelType: FuelType;
  transmission: Transmission;
  powerHp: number | null;
  engineType: string | null;
  displacementCc: number | null;
  productionStartYear: number | null;
}): string {
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

function parseFuelType(term: string): FuelType | null {
  const value = term.toLowerCase();
  if (value === "petrol" || value === "gasoline") return "PETROL";
  if (value === "diesel") return "DIESEL";
  if (value === "electric" || value === "ev") return "ELECTRIC";
  if (value === "hybrid") return "HYBRID";
  return null;
}

function parseTransmission(term: string): Transmission | null {
  const value = term.toLowerCase();
  if (value === "auto" || value === "automatic") return "AUTOMATIC";
  if (value === "manual" || value === "mt") return "MANUAL";
  return null;
}

router.get("/models", async (req, res) => {
  const parsed = querySchema.safeParse({ q: req.query.q });
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid query." });
  }

  const term = parsed.data.q.trim();

  const models = await prisma.carModel.findMany({
    where: {
      OR: [
        { make: { contains: term } },
        { model: { contains: term } },
        { generation: { contains: term } },
        { countryOfOrigin: { contains: term } }
      ]
    },
    select: {
      id: true,
      make: true,
      model: true,
      generation: true,
      countryOfOrigin: true,
      productionStartYear: true
    },
    orderBy: [{ make: "asc" }, { model: "asc" }, { productionStartYear: "asc" }],
    take: 10
  });

  return res.json(
    models.map((model) => ({
      id: model.id,
      label: formatModelLabel(model)
    }))
  );
});

router.get("/variants", async (req, res) => {
  const parsed = querySchema.safeParse({ q: req.query.q });
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid query." });
  }

  const term = parsed.data.q.trim();
  const numeric = Number.parseInt(term, 10);
  const fuelType = parseFuelType(term);
  const transmission = parseTransmission(term);

  const orFilters: Array<Record<string, unknown>> = [
    { model: { is: { make: { contains: term } } } },
    { model: { is: { model: { contains: term } } } },
    { model: { is: { generation: { contains: term } } } },
    { engineType: { contains: term } }
  ];

  if (fuelType) {
    orFilters.push({ fuelType });
  }

  if (transmission) {
    orFilters.push({ transmission });
  }

  if (!Number.isNaN(numeric)) {
    orFilters.push({ powerHp: numeric });
    orFilters.push({ displacementCc: numeric });
  }

  const variants = await prisma.carVariant.findMany({
    where: {
      OR: orFilters
    },
    select: {
      id: true,
      fuelType: true,
      transmission: true,
      powerHp: true,
      engineType: true,
      displacementCc: true,
      productionStartYear: true,
      model: {
        select: {
          make: true,
          model: true,
          generation: true,
          productionStartYear: true
        }
      }
    },
    orderBy: [{ id: "asc" }],
    take: 10
  });

  return res.json(
    variants.map((variant) => ({
      id: variant.id,
      label: formatVariantLabel(variant)
    }))
  );
});

export default router;
