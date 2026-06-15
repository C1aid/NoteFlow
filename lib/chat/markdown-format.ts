export type FormatResult = {
  value: string;
  selectionStart: number;
  selectionEnd: number;
};

function applyChange(
  textarea: HTMLTextAreaElement,
  value: string,
  selectionStart: number,
  selectionEnd: number,
): FormatResult {
  return { value, selectionStart, selectionEnd };
}

export function wrapSelection(
  textarea: HTMLTextAreaElement,
  prefix: string,
  suffix: string = prefix,
  placeholder = "text",
): FormatResult {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selected = textarea.value.slice(start, end) || placeholder;
  const value =
    textarea.value.slice(0, start) +
    prefix +
    selected +
    suffix +
    textarea.value.slice(end);
  const cursor = start + prefix.length + selected.length + suffix.length;

  return applyChange(textarea, value, cursor, cursor);
}

export function insertAtCursor(
  textarea: HTMLTextAreaElement,
  text: string,
): FormatResult {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const value =
    textarea.value.slice(0, start) + text + textarea.value.slice(end);
  const cursor = start + text.length;

  return applyChange(textarea, value, cursor, cursor);
}

export function insertLinePrefix(
  textarea: HTMLTextAreaElement,
  prefix: string,
): FormatResult {
  const start = textarea.selectionStart;
  const value = textarea.value;

  const lineStart = value.lastIndexOf("\n", start - 1) + 1;
  const lineEnd = value.indexOf("\n", start);
  const end = lineEnd === -1 ? value.length : lineEnd;
  const line = value.slice(lineStart, end);

  const nextLine = line.startsWith(prefix)
    ? line.slice(prefix.length)
    : `${prefix}${line}`;

  const nextValue =
    value.slice(0, lineStart) + nextLine + value.slice(end);
  const cursor = lineStart + nextLine.length;

  return applyChange(textarea, nextValue, cursor, cursor);
}

export function insertCodeBlock(textarea: HTMLTextAreaElement): FormatResult {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selected = textarea.value.slice(start, end) || "code";
  const block = `\`\`\`\n${selected}\n\`\`\``;
  const value =
    textarea.value.slice(0, start) + block + textarea.value.slice(end);
  const cursor = start + block.length;

  return applyChange(textarea, value, cursor, cursor);
}

export function insertLink(textarea: HTMLTextAreaElement): FormatResult {
  return wrapSelection(textarea, "[", "](https://)", "link text");
}
