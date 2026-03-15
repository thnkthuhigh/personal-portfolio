export interface ParsedTemplateHtml {
  title: string;
  styles: string;
  body: string;
}

export function parseTemplateHtml(html: string): ParsedTemplateHtml {
  const title =
    html.match(/<title>([\s\S]*?)<\/title>/iu)?.[1].trim() ?? "Portfolio Page";
  const styles = html.match(/<style>([\s\S]*?)<\/style>/iu)?.[1].trim() ?? "";
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/iu);
  const body = bodyMatch?.[1].replace(/<script[\s\S]*$/iu, "").trim() ?? "";

  return {
    title,
    styles,
    body,
  };
}
