export type PostcardStyleKey = "sunset" | "ocean" | "forest" | "blossom" | "night";

export type PostcardStyle = {
  background: string;
  ink: string;
  accent: string;
  lineColor: string;
};

export const postcardStyles: Record<PostcardStyleKey, PostcardStyle> = {
  sunset: {
    background: "linear-gradient(135deg, #fde7d0, #f4a261)",
    ink: "#5b3a29",
    accent: "#c1503a",
    lineColor: "rgba(91, 58, 41, 0.18)",
  },
  ocean: {
    background: "linear-gradient(135deg, #dceef3, #4a9dab)",
    ink: "#173a44",
    accent: "#3e6e8e",
    lineColor: "rgba(23, 58, 68, 0.18)",
  },
  forest: {
    background: "linear-gradient(135deg, #e7f0e1, #588157)",
    ink: "#243a1f",
    accent: "#3f6b3f",
    lineColor: "rgba(36, 58, 31, 0.18)",
  },
  blossom: {
    background: "linear-gradient(135deg, #fdeaf1, #f2a6c0)",
    ink: "#5c2438",
    accent: "#c15a80",
    lineColor: "rgba(92, 36, 56, 0.18)",
  },
  night: {
    background: "linear-gradient(135deg, #2b2a55, #3a3269)",
    ink: "#f0e8d9",
    accent: "#8aa0d6",
    lineColor: "rgba(240, 232, 217, 0.22)",
  },
};

const nameToKey: Record<string, PostcardStyleKey> = {
  Sunset: "sunset",
  Ocean: "ocean",
  Forest: "forest",
  Blossom: "blossom",
  "Night Sky": "night",
};

export function styleKeyFromTemplateName(name: string | undefined | null): PostcardStyleKey {
  if (!name) return "sunset";
  return nameToKey[name] ?? "sunset";
}
