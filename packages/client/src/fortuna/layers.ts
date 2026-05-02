export type FortunaLayerType =
  | "page"
  | "feed"
  | "product"
  | "collection"
  | "link"
  | "channel";

export type FortunaLayerMeta = {
  version: 1;
  type: FortunaLayerType;
  title: string;
  body?: string;
  image?: string;
  url?: string;
  items?: { title: string; detail?: string; url?: string }[];
};

const PREFIX = "FORTUNA_LAYER:";

export function encodeLayerMeta(meta: FortunaLayerMeta) {
  return `${PREFIX}${JSON.stringify(meta)}`;
}

export function parseLayerMeta(description?: string) {
  if (!description?.startsWith(PREFIX)) return;

  try {
    const parsed = JSON.parse(description.slice(PREFIX.length));
    if (parsed?.version === 1 && typeof parsed.type === "string") {
      return parsed as FortunaLayerMeta;
    }
  } catch {
    return;
  }
}

export function defaultLayerMeta(type: FortunaLayerType, title: string): FortunaLayerMeta {
  const cleanTitle = title.trim() || "Untitled layer";

  switch (type) {
    case "page":
      return {
        version: 1,
        type,
        title: cleanTitle,
        body: "Add the page copy, image, links, and reference notes for this layer.",
        image: "",
      };
    case "feed":
      return {
        version: 1,
        type,
        title: cleanTitle,
        body: "Post updates, prompts, and member discussion in this feed.",
      };
    case "product":
      return {
        version: 1,
        type,
        title: cleanTitle,
        body: "Describe the product, access rules, deliverables, and next action.",
        url: "",
      };
    case "collection":
      return {
        version: 1,
        type,
        title: cleanTitle,
        body: "A curated collection for links, products, resources, or partner perks.",
        items: [
          { title: "First item", detail: "Add context for members", url: "" },
        ],
      };
    case "link":
      return {
        version: 1,
        type,
        title: cleanTitle,
        body: "Add why this link matters and who it is for.",
        url: "",
      };
    case "channel":
      return {
        version: 1,
        type,
        title: cleanTitle,
        body: "Live chat channel.",
      };
  }
}
