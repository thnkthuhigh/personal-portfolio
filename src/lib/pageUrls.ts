import type { Language } from "../data/templateData";

export function buildProjectHref(
  projectId: string,
  language: Language,
): string {
  const params = new URLSearchParams({ id: projectId });

  if (language === "en") {
    params.set("lang", "en");
  }

  return `project.html?${params.toString()}`;
}

export function buildClassicCvHref(
  language: Language,
  options?: { print?: boolean },
): string {
  const basePath = language === "en" ? "cv-en.html" : "cv.html";

  if (!options?.print) {
    return basePath;
  }

  return `${basePath}?print=1`;
}

export function buildAtsCvHref(language: Language): string {
  return language === "en" ? "cv-ats-en.html" : "cv-ats.html";
}
