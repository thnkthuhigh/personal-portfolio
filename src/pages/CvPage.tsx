import { useEffect } from "react";
import classicCvTemplateVi from "../../template/cv.html?raw";
import classicCvTemplateEn from "../../template/cv-en.html?raw";
import { parseTemplateHtml } from "../lib/templateHtml";

type CvLanguage = "vi" | "en";

interface CvPageProps {
  language: CvLanguage;
}

const classicCvTemplates = {
  vi: parseTemplateHtml(classicCvTemplateVi),
  en: parseTemplateHtml(classicCvTemplateEn),
} as const;

export function CvPage({ language }: CvPageProps) {
  const template = classicCvTemplates[language];

  useEffect(() => {
    document.title = template.title;

    if (new URLSearchParams(window.location.search).get("print") !== "1") {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      window.print();
    }, 250);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [template.title]);

  return (
    <>
      <style>{template.styles}</style>
      <div dangerouslySetInnerHTML={{ __html: template.body }} />
    </>
  );
}
