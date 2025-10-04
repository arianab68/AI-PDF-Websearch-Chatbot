import { useState } from "react";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [previousResponseId, setPreviousResponseId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("chat-openai", {
        body: {
          message: content,
          previousResponseId,
        },
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      const assistantMessage: Message = {
        id: data.responseId,
        role: "assistant",
        content: data.outputText,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setPreviousResponseId(data.responseId);
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card backdrop-blur-md sticky top-0 z-10 shadow-soft">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-glow">
              <span className="text-3xl">🌾</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primary">
                Gluten-Free Recipe Assistant
              </h1>
              <p className="text-sm text-foreground/70 font-medium">Your helpful cooking companion</p>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Container */}
      <div className="flex-1 container mx-auto px-4 py-6 flex flex-col max-w-4xl">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto mb-6 space-y-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-6 animate-fade-in">
                <div className="w-24 h-24 rounded-3xl bg-secondary flex items-center justify-center mx-auto shadow-soft">
                  <span className="text-5xl">🥖</span>
                </div>
                <div className="max-w-md">
                  <h2 className="text-2xl font-bold text-foreground mb-3">
                    Welcome to Your Gluten-Free Kitchen!
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Ask me for recipes, baking tips, ingredient substitutions, or anything about gluten-free cooking. Let's create something delicious together!
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  role={message.role}
                  content={message.content}
                />
              ))}
              {isLoading && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Thinking...</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Input */}
        <div className="bg-card backdrop-blur-md rounded-3xl p-5 border border-border shadow-glow">
          <ChatInput onSend={handleSendMessage} disabled={isLoading} />
        </div>
      </div>
    </div>
  );
};

export default Index;
