import { useState } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Send } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export const ChatInput = ({ onSend, disabled }: ChatInputProps) => {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex gap-4 items-end">
      <Textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask about recipes, ingredients, or cooking tips..."
        disabled={disabled}
        className="min-h-[60px] max-h-[200px] resize-none bg-input border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all rounded-2xl"
      />
      <Button
        onClick={handleSend}
        disabled={disabled || !message.trim()}
        size="lg"
        className="h-[60px] px-8 bg-gradient-to-br from-primary via-accent to-primary-glow hover:shadow-glow hover:scale-105 transition-all duration-300 rounded-2xl"
      >
        <Send className="h-5 w-5" />
      </Button>
    </div>
  );
};
