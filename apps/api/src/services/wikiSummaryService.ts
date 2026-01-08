import type { PrismaClient } from "@prisma/client";
import { WikiLang } from "@prisma/client";

export type WikiSummary = {
  usedLang: "fr" | "en";
  title: string;
  extract: string;
  url: string;
};

type CarModelInput = {
  make: string;
  model: string;
  wikiTitleFr: string | null;
  wikiTitleEn: string | null;
  wikiGenerationHintFr: string | null;
  wikiGenerationHintEn: string | null;
};

export type WikiSummaryPrisma = {
  wikiSummaryCache: Pick<PrismaClient["wikiSummaryCache"], "findUnique" | "upsert">;
};

const CACHE_DAYS = 30;
const USER_AGENT = "caraday/1.0 (contact.caraday@gmail.com)";

function getBaseTitle(model: CarModelInput, lang: "fr" | "en"): string {
  const explicit = lang === "fr" ? model.wikiTitleFr : model.wikiTitleEn;
  if (explicit && explicit.trim().length > 0) {
    return explicit.trim();
  }
  return `${model.make} ${model.model}`.trim();
}

function getGenerationHint(model: CarModelInput, lang: "fr" | "en"): string | null {
  const hint = lang === "fr" ? model.wikiGenerationHintFr : model.wikiGenerationHintEn;
  return hint && hint.trim().length > 0 ? hint.trim() : null;
}

function buildTitleCandidates(model: CarModelInput, lang: "fr" | "en"): string[] {
  const base = getBaseTitle(model, lang);
  const hint = getGenerationHint(model, lang);
  if (!hint) {
    return [base];
  }
  return [`${base} (${hint})`, `${base} ${hint}`, base];
}

async function fetchSummary(lang: "fr" | "en", title: string): Promise<WikiSummary | null> {
  const url = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;

  const response = await fetch(url, {
    headers: {
      "User-Agent": USER_AGENT
    }
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as {
    title?: string;
    extract?: string;
    content_urls?: { desktop?: { page?: string } };
  };

  if (!data.extract || data.extract.trim().length === 0) {
    return null;
  }

  return {
    usedLang: lang,
    title: data.title ?? title,
    extract: data.extract,
    url: data.content_urls?.desktop?.page ?? ""
  };
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

export function createWikiSummaryService(prisma: WikiSummaryPrisma) {
  async function getCachedSummary(lang: "fr" | "en", title: string): Promise<WikiSummary | null> {
    const cached = await prisma.wikiSummaryCache.findUnique({
      where: {
        lang_title: {
          lang: lang as WikiLang,
          title
        }
      }
    });

    if (!cached || cached.expiresAt <= new Date()) {
      return null;
    }

    return {
      usedLang: lang,
      title: cached.title,
      extract: cached.extract,
      url: cached.url
    };
  }

  async function storeSummary(lang: "fr" | "en", summary: WikiSummary): Promise<void> {
    const now = new Date();
    await prisma.wikiSummaryCache.upsert({
      where: {
        lang_title: {
          lang: lang as WikiLang,
          title: summary.title
        }
      },
      update: {
        extract: summary.extract,
        url: summary.url,
        source: "wikipedia",
        fetchedAt: now,
        expiresAt: addDays(now, CACHE_DAYS)
      },
      create: {
        lang: lang as WikiLang,
        title: summary.title,
        extract: summary.extract,
        url: summary.url,
        source: "wikipedia",
        fetchedAt: now,
        expiresAt: addDays(now, CACHE_DAYS)
      }
    });
  }

  async function getSummaryWithCache(lang: "fr" | "en", title: string): Promise<WikiSummary | null> {
    const cached = await getCachedSummary(lang, title);
    if (cached) {
      return cached;
    }

    try {
      const summary = await fetchSummary(lang, title);
      if (!summary) {
        return null;
      }
      await storeSummary(lang, summary);
      return summary;
    } catch {
      return null;
    }
  }

  async function getWikiSummaryForModel(
    model: CarModelInput,
    preferredLang: "fr" | "en"
  ): Promise<WikiSummary | null> {
    const primaryLang: "fr" | "en" = preferredLang;
    const fallbackLang: "fr" | "en" = preferredLang === "fr" ? "en" : "fr";

    const primaryCandidates = buildTitleCandidates(model, primaryLang);
    for (const candidate of primaryCandidates) {
      const summary = await getSummaryWithCache(primaryLang, candidate);
      if (summary) {
        return summary;
      }
    }

    const fallbackCandidates = buildTitleCandidates(model, fallbackLang);
    for (const candidate of fallbackCandidates) {
      const summary = await getSummaryWithCache(fallbackLang, candidate);
      if (summary) {
        return summary;
      }
    }

    return null;
  }

  return { getWikiSummaryForModel };
}
