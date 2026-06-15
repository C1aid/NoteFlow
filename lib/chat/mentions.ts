export function applyMentionLinks(content: string) {
  const protectedParts: string[] = [];

  const safe = content.replace(/(```[\s\S]*?```|`[^`\n]+`)/g, (match) => {
    const token = `@@PROTECTED_${protectedParts.length}@@`;
    protectedParts.push(match);
    return token;
  });

  const withMentions = safe.replace(
    /(^|[\s(])@([\w][\w.-]*)/g,
    (_, prefix: string, handle: string) => `${prefix}[@${handle}](mention:${handle})`,
  );

  return withMentions.replace(
    /@@PROTECTED_(\d+)@@/g,
    (_, index: string) => protectedParts[Number(index)] ?? "",
  );
}
