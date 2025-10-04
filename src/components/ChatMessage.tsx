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
          "max-w-[80%] rounded-2xl px-6 py-4 shadow-card transition-all duration-300",
          isUser
            ? "bg-gradient-to-br from-primary to-primary-glow text-primary-foreground"
            : "bg-card border border-border text-card-foreground"
        )}
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary/50 flex items-center justify-center">
            {isUser ? "👤" : "🤖"}
          </div>
          <div className="flex-1 pt-1">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {content}
              {isStreaming && (
                <span className="inline-block w-2 h-4 ml-1 bg-current animate-pulse" />
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
