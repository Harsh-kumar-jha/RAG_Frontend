import { AdvisoryResponse, SourceReference } from "@/types";
import { getSourceDisplayName } from "./sources";

const FIELD_LABELS: Array<[keyof AdvisoryResponse, string]> = [
  ["shortAnswer", "Answer"],
  ["recommendedClassification", "Recommended Classification"],
  ["reasoning", "Reasoning"],
];

const decodeJsonStringFragment = (value: string) => {
  try {
    return JSON.parse(`"${value}"`) as string;
  } catch {
    return value
      .replace(/\\n/g, "\n")
      .replace(/\\r/g, "\r")
      .replace(/\\t/g, "\t")
      .replace(/\\"/g, "\"")
      .replace(/\\\\/g, "\\");
  }
};

const readStringField = (content: string, field: string) => {
  const fieldIndex = content.indexOf(`"${field}"`);
  if (fieldIndex === -1) return "";

  const colonIndex = content.indexOf(":", fieldIndex);
  if (colonIndex === -1) return "";

  const quoteIndex = content.indexOf("\"", colonIndex + 1);
  if (quoteIndex === -1) return "";

  let escaped = false;
  let rawValue = "";

  for (let index = quoteIndex + 1; index < content.length; index += 1) {
    const char = content[index];

    if (escaped) {
      rawValue += `\\${char}`;
      escaped = false;
      continue;
    }

    if (char === "\\") {
      escaped = true;
      continue;
    }

    if (char === "\"") break;
    rawValue += char;
  }

  return decodeJsonStringFragment(rawValue).trim();
};

const parseAdvisoryJson = (content: string): AdvisoryResponse | null => {
  const trimmed = content.trim();
  const jsonStart = trimmed.indexOf("{");
  const jsonEnd = trimmed.lastIndexOf("}");

  if (jsonStart === -1 || jsonEnd <= jsonStart) return null;

  try {
    const parsed = JSON.parse(trimmed.slice(jsonStart, jsonEnd + 1));

    if (
      parsed &&
      typeof parsed === "object" &&
      typeof parsed.shortAnswer === "string"
    ) {
      return parsed as AdvisoryResponse;
    }
  } catch {
    return null;
  }

  return null;
};

const formatSources = (sources: SourceReference[] = []) => {
  if (!sources.length) return "";

  const lines = sources.slice(0, 6).map((source, index) => {
    const location = [
      source.pageNumber ? `p. ${source.pageNumber}` : "",
      source.sheetName ? `sheet ${source.sheetName}` : "",
      source.rowNumber ? `row ${source.rowNumber}` : "",
    ].filter(Boolean);

    return `${index + 1}. ${getSourceDisplayName(source)}${location.length ? ` (${location.join(", ")})` : ""}`;
  });

  return `**Sources**\n${lines.join("\n")}`;
};

export const formatAdvisoryMarkdown = (advisory: AdvisoryResponse) => {
  const sections: string[] = [];

  if (advisory.shortAnswer?.trim()) {
    sections.push(advisory.shortAnswer.trim());
  }

  if (advisory.recommendedClassification?.trim()) {
    sections.push(`**Recommended Classification**\n\`${advisory.recommendedClassification.trim()}\``);
  }

  if (advisory.reasoning?.trim()) {
    sections.push(`**Reasoning**\n${advisory.reasoning.trim()}`);
  }

  if (advisory.riskFlags?.length) {
    sections.push(`**Risk Flags**\n${advisory.riskFlags.map((flag) => `- ${flag}`).join("\n")}`);
  }

  if (advisory.alternateViews?.length) {
    sections.push(`**Alternate Views**\n${advisory.alternateViews.map((view) => `- ${view}`).join("\n")}`);
  }

  const sources = formatSources(advisory.sourceReferences);
  if (sources) sections.push(sources);

  return sections.join("\n\n");
};

export const formatStreamingAssistantContent = (content: string) => {
  const parsed = parseAdvisoryJson(content);
  if (parsed) return formatAdvisoryMarkdown(parsed);

  const looksLikeAdvisory =
    content.trimStart().startsWith("{") &&
    (content.includes("\"shortAnswer\"") || content.includes("\"reasoning\""));

  if (!looksLikeAdvisory) return content;

  const sections = FIELD_LABELS.flatMap(([field, label]) => {
    const value = readStringField(content, field);
    if (!value) return [];

    return field === "shortAnswer"
      ? [value]
      : [`**${label}**\n${field === "recommendedClassification" ? `\`${value}\`` : value}`];
  });

  return sections.join("\n\n");
};

export const formatStoredAssistantContent = (content: string) =>
  formatStreamingAssistantContent(content).trim() || content;
