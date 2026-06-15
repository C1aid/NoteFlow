"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { ExternalLink, GitBranch, GitCommit, GitPullRequest } from "lucide-react";
import { applyMentionLinks } from "@/lib/chat/mentions";

type GitHubPreviewData = {
  type: "pr" | "issue" | "commit" | "repo";
  title: string;
  description: string | null;
  url: string;
};

const GITHUB_URL_REGEX =
  /https?:\/\/github\.com\/[\w.-]+\/[\w.-]+(?:\/(?:pull|issues|commit)\/[\w]+)?/g;

function PreviewIcon({ type }: { type: GitHubPreviewData["type"] }) {
  if (type === "pr") return <GitPullRequest className="size-4" />;
  if (type === "commit") return <GitCommit className="size-4" />;
  return <GitBranch className="size-4" />;
}

function GitHubPreviewCard({ url }: { url: string }) {
  const [preview, setPreview] = useState<GitHubPreviewData | null>(null);

  useEffect(() => {
    void fetch(`/api/github/preview?url=${encodeURIComponent(url)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setPreview(data as GitHubPreviewData | null))
      .catch(() => setPreview(null));
  }, [url]);

  if (!preview) return null;

  return (
    <a
      href={preview.url}
      target="_blank"
      rel="noopener noreferrer"
      className="glass-card mt-2 block p-3 transition-smooth hover:border-white/20"
    >
      <div className="flex items-center gap-2 text-xs text-primary">
        <PreviewIcon type={preview.type} />
        <span className="uppercase tracking-wide">{preview.type}</span>
        <ExternalLink className="ml-auto size-3 text-muted-foreground" />
      </div>
      <p className="mt-1 text-sm font-medium text-foreground">{preview.title}</p>
      {preview.description && (
        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
          {preview.description}
        </p>
      )}
    </a>
  );
}

export function MessageContent({ content }: { content: string }) {
  const githubUrls = [...new Set(content.match(GITHUB_URL_REGEX) ?? [])];
  const markdown = applyMentionLinks(content);

  return (
    <div className="prose prose-invert prose-sm max-w-none break-words [overflow-wrap:anywhere] prose-a:text-sky-400 prose-a:no-underline hover:prose-a:underline">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          pre: ({ children }) => (
            <pre className="glass-card overflow-x-auto p-3 text-xs">
              {children}
            </pre>
          ),
          code: ({ className, children, ...props }) => {
            const isBlock = className?.includes("language-");
            if (isBlock) {
              return (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            }
            return (
              <code
                className="rounded-md bg-white/10 px-1.5 py-0.5 text-[0.85em] ring-1 ring-white/10"
                {...props}
              >
                {children}
              </code>
            );
          },
          a: ({ href, children }) => {
            if (href?.startsWith("mention:")) {
              return (
                <span className="font-medium text-sky-400 hover:underline">
                  {children}
                </span>
              );
            }

            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sky-400 underline-offset-2 hover:underline"
              >
                {children}
              </a>
            );
          },
        }}
      >
        {markdown}
      </ReactMarkdown>
      {githubUrls.map((url) => (
        <GitHubPreviewCard key={url} url={url} />
      ))}
    </div>
  );
}
