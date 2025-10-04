import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}

export const ChatMessage = ({ role, content, isStreaming }: ChatMessageProps) => {
  const isUser = role === "user";

  return (
    <div
      className={cn(
        "flex w-full mb-4 animate-fade-in",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[80%] rounded-3xl px-6 py-5 shadow-soft transition-all duration-300",
          isUser
            ? "bg-gradient-to-br from-primary via-accent to-primary-glow text-primary-foreground"
            : "bg-card border border-border text-card-foreground"
        )}
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-2xl bg-gradient-to-br from-background/20 to-background/10 flex items-center justify-center text-lg shadow-sm">
            {isUser ? "👨‍🍳" : "🌾"}
          </div>
          <div className="flex-1 pt-1">
            <div className="text-sm leading-relaxed">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  a: (props) => <a className="underline underline-offset-4 text-primary" {...props} />,
                  code: (props) => {
                    const { children, className, ...rest } = props as any;
                    const isMultiline = String(children).includes("\n");
                    const isBlock = (typeof className === "string" && className.includes("language-")) || isMultiline;
                    return isBlock ? (
                      <pre className="my-3 overflow-x-auto rounded-lg border border-border bg-muted p-3">
                        <code className={cn("font-mono text-sm", className)} {...rest}>{children}</code>
                      </pre>
                    ) : (
                      <code className="rounded bg-muted px-1 py-0.5 font-mono text-sm" {...rest}>{children}</code>
                    );
                  },
                  p: ({ node, ...props }) => <p className="mb-3 last:mb-0" {...props} />,
                  ul: ({ node, ...props }) => <ul className="list-disc pl-6 mb-3 space-y-1" {...props} />,
                  ol: ({ node, ...props }) => <ol className="list-decimal pl-6 mb-3 space-y-1" {...props} />,
                  h1: ({ node, ...props }) => <h1 className="text-xl font-semibold mb-2" {...props} />,
                  h2: ({ node, ...props }) => <h2 className="text-lg font-semibold mb-2" {...props} />,
                  h3: ({ node, ...props }) => <h3 className="text-base font-semibold mb-2" {...props} />,
                  blockquote: ({ node, ...props }) => (
                    <blockquote className="border-l-2 border-border pl-3 italic text-muted-foreground mb-3" {...props} />
                  ),
                  table: ({ node, ...props }) => (
                    <div className="my-3 overflow-x-auto">
                      <table className="w-full text-sm border border-border" {...props} />
                    </div>
                  ),
                  th: ({ node, ...props }) => <th className="border border-border bg-muted px-2 py-1 text-left" {...props} />,
                  td: ({ node, ...props }) => <td className="border border-border px-2 py-1 align-top" {...props} />,
                }}
              >
                {content}
              </ReactMarkdown>
              {isStreaming && (
                <span className="inline-block w-2 h-4 ml-1 bg-current animate-pulse" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
