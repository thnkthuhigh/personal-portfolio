import templateScript from "../../template/js/main.js?raw";

export type Language = "vi" | "en";
export type ThemeName = "light" | "dark";

export interface TranslationEntry {
  selector: string;
  text: string;
  html?: boolean;
}

export interface ProjectProof {
  value: string;
  label: string;
}

export interface ProjectGalleryItem {
  title: string;
  desc: string;
  image?: string;
  alt?: string;
}

export interface ProjectLink {
  label: string;
  href?: string;
}

export interface ProjectCase {
  badge: string;
  title: string;
  year: string;
  filters: string[];
  cardBadge: string;
  previewTag: string;
  summary: string;
  meta: string[];
  proof: ProjectProof[];
  problem: string;
  solution: string;
  storyImpact?: string;
  architectureDiagram?: string;
  architectureCaption?: string;
  architecture: string[];
  technicalDecisions: string[];
  impact: string[];
  roleScope: string[];
  evidence: string[];
  challenges: string[];
  lessons: string[];
  nda: string;
  videoEmbed?: string;
  videoFile?: string;
  videoPoster?: string;
  videoNote?: string;
  gallery: ProjectGalleryItem[];
  links: ProjectLink[];
}

export interface UiTextPack {
  themeLabel: string;
  detailButton: string;
  stackFallback: string;
  notFoundTitle: string;
  notFoundSummary: string;
  formMissing: string;
  formOpening: string;
  menuOpen: string;
  menuClose: string;
  mobileMenuAria: string;
}

type ProjectCaseMap = Record<string, ProjectCase>;
type TranslationMap = Record<Language, TranslationEntry[]>;
type UiTextMap = Record<Language, UiTextPack>;

function extractExpression(source: string, variableName: string): string {
  const marker = `const ${variableName} =`;
  const startIndex = source.indexOf(marker);

  if (startIndex === -1) {
    throw new Error(`Missing template variable: ${variableName}`);
  }

  let cursor = startIndex + marker.length;
  while (/\s/u.test(source[cursor] ?? "")) {
    cursor += 1;
  }

  const opening = source[cursor];
  const closing = opening === "{" ? "}" : opening === "[" ? "]" : "";

  if (!closing) {
    throw new Error(
      `Unsupported template expression opener "${opening}" for ${variableName}`,
    );
  }

  let depth = 0;
  let quote: "'" | '"' | "`" | null = null;
  let escaped = false;
  let lineComment = false;
  let blockComment = false;

  for (let index = cursor; index < source.length; index += 1) {
    const character = source[index];
    const next = source[index + 1];

    if (lineComment) {
      if (character === "\n") {
        lineComment = false;
      }
      continue;
    }

    if (blockComment) {
      if (character === "*" && next === "/") {
        blockComment = false;
        index += 1;
      }
      continue;
    }

    if (quote) {
      if (escaped) {
        escaped = false;
        continue;
      }

      if (character === "\\") {
        escaped = true;
        continue;
      }

      if (character === quote) {
        quote = null;
      }
      continue;
    }

    if (character === "/" && next === "/") {
      lineComment = true;
      index += 1;
      continue;
    }

    if (character === "/" && next === "*") {
      blockComment = true;
      index += 1;
      continue;
    }

    if (character === "'" || character === '"' || character === "`") {
      quote = character;
      continue;
    }

    if (character === opening) {
      depth += 1;
    } else if (character === closing) {
      depth -= 1;

      if (depth === 0) {
        return source.slice(cursor, index + 1);
      }
    }
  }

  throw new Error(`Unclosed template expression for ${variableName}`);
}

function evaluateTemplateExpression<T>(variableName: string): T {
  const expression = extractExpression(templateScript, variableName);
  return Function(`"use strict"; return (${expression});`)() as T;
}

const projectCases = evaluateTemplateExpression<ProjectCaseMap>("PROJECT_CASES");
const projectCasesEn =
  evaluateTemplateExpression<ProjectCaseMap>("PROJECT_CASES_EN");

export const projectCardOrder = evaluateTemplateExpression<string[]>(
  "PROJECT_CARD_ORDER",
);
export const uiText = evaluateTemplateExpression<UiTextMap>("UI_TEXT");
export const indexTranslations =
  evaluateTemplateExpression<TranslationMap>("INDEX_TRANSLATIONS");
export const projectTranslations =
  evaluateTemplateExpression<TranslationMap>("PROJECT_TRANSLATIONS");

export const featuredHeroCaseIds = projectCardOrder.slice(0, 2);

export function getUiText(language: Language): UiTextPack {
  return uiText[language] ?? uiText.vi;
}

export function getMergedProjectCase(
  projectId: string,
  language: Language,
): ProjectCase | null {
  const base = projectCases[projectId];

  if (!base) {
    return null;
  }

  if (language !== "en") {
    return base;
  }

  const override = projectCasesEn[projectId];

  if (!override) {
    return base;
  }

  return {
    ...base,
    ...override,
    meta: override.meta ?? base.meta,
    proof: override.proof ?? base.proof,
    architecture: override.architecture ?? base.architecture,
    technicalDecisions:
      override.technicalDecisions ?? base.technicalDecisions,
    impact: override.impact ?? base.impact,
    roleScope: override.roleScope ?? base.roleScope,
    evidence: override.evidence ?? base.evidence,
    challenges: override.challenges ?? base.challenges,
    lessons: override.lessons ?? base.lessons,
    gallery: override.gallery ?? base.gallery,
    links: override.links ?? base.links,
  };
}

export function getOrderedProjectCases(language: Language): ProjectCase[] {
  return projectCardOrder
    .map((projectId) => getMergedProjectCase(projectId, language))
    .filter((project): project is ProjectCase => project !== null);
}

export function extractStackFromMeta(
  project: ProjectCase,
  language: Language,
): string {
  const stackItem = project.meta.find((item) => item.startsWith("Stack:"));

  if (!stackItem) {
    return getUiText(language).stackFallback;
  }

  return stackItem.replace(/^Stack:\s*/u, "").replace(/\s*\+\s*/gu, " · ");
}
