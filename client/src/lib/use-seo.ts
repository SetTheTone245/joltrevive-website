import { useEffect } from "react";

export interface SeoOptions {
  title: string;
  description: string;
  noindex?: boolean;
}

function setMeta(name: string, content: string) {
  let element = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.name = name;
    document.head.appendChild(element);
  }
  element.content = content;
}

/** Keeps SPA route metadata useful for browsers, shared links, and indexing. */
export function useSeo({ title, description, noindex = false }: SeoOptions) {
  useEffect(() => {
    document.title = title;
    setMeta("description", description);
    setMeta("robots", noindex ? "noindex, nofollow" : "index, follow");
  }, [description, noindex, title]);
}
