import { Button } from "@/components/ui/Button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { ArrowUp, Loader2, Square, Sparkles, ArrowUpRight } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import type { FormEvent, KeyboardEvent } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import api from "@/api/axiosConfig";
import "./AIAssistant.css";

type Message = { role: "user" | "assistant"; content: string };

const AIAssistant = () => {
  const { token } = useSelector((state: any) => state.auth);
  const location = useLocation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState(location.state?.prompt ?? "");
  const [topic, setTopic] = useState(location.state?.topic ?? "all");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const requestRef = useRef<AbortController | null>(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ block: "nearest" }); }, [messages]);
  useEffect(() => () => requestRef.current?.abort(), []);

  const updateAnswer = (text: string, replace = false) => {
    setMessages(previous => previous.map((message, index) => index === previous.length - 1
      ? { ...message, content: replace ? text : message.content + text } : message));
  };

  const handleSubmit = async (event: FormEvent | KeyboardEvent) => {
    event.preventDefault();
    if (!input.trim() || requestRef.current) return;
    const query = input.trim();
    const controller = new AbortController();
    requestRef.current = controller;
    setInput("");
    setMessages(previous => [...previous, { role: "user", content: query }, { role: "assistant", content: "" }]);
    setIsLoading(true);
    if (inputRef.current) inputRef.current.style.height = "auto";
    let receivedText = false;
    try {
      const baseUrl = (api.defaults.baseURL || import.meta.env.VITE_API_BASE_URL || "/api").replace(/\/$/, "");
      const response = await fetch(`${baseUrl}/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token || localStorage.getItem("token") || ""}` },
        body: JSON.stringify({ query, topic }),
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(response.status === 401 ? "Your session expired. Please sign in again." : "Unable to connect to the AI assistant. Please try again.");
      const reader = response.body?.getReader();
      if (!reader) throw new Error("The server returned an empty response.");
      const decoder = new TextDecoder();
      let buffer = "";
      let finished = false;
      const consumeEvent = (frame: string) => {
        const data = frame.split(/\r?\n/).filter(line => line.startsWith("data:")).map(line => line.slice(5).trimStart()).join("\n");
        if (!data) return;
        if (data.trim() === "[DONE]") { finished = true; return; }
        const parsed = JSON.parse(data);
        if (parsed.error) throw new Error(parsed.error);
        if (typeof parsed.token === "string" && parsed.token) { receivedText = true; updateAnswer(parsed.token); }
      };
      try {
        // A network chunk can end in the middle of an SSE event or UTF-8 character.
        while (!finished) {
          const { value, done } = await reader.read();
          buffer += done ? decoder.decode() : decoder.decode(value, { stream: true });
          let separator;
          while ((separator = /\r?\n\r?\n/.exec(buffer)) !== null) {
            consumeEvent(buffer.slice(0, separator.index));
            buffer = buffer.slice(separator.index + separator[0].length);
            if (finished) break;
          }
          if (done) { if (buffer.trim() && !finished) consumeEvent(buffer); break; }
        }
      } finally {
        await reader.cancel().catch(() => {});
        reader.releaseLock();
      }
      if (!receivedText) updateAnswer("No answer returned. Please try again.", true);
    } catch (error) {
      if (controller.signal.aborted) {
        if (!receivedText) updateAnswer("Response stopped.", true);
      } else {
        updateAnswer(`\n\n${error instanceof Error ? error.message : "Unable to get an answer."}`);
      }
    } finally {
      if (requestRef.current === controller) {
        requestRef.current = null;
        setIsLoading(false);
        inputRef.current?.focus();
      }
    }
  };

  return (
    <div className="ai-workspace flex h-full min-h-0 min-w-0 flex-col bg-[var(--bg-base)] text-[var(--text-primary)]">
      <header className="ai-header flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-[var(--border-default)] px-4 py-3 sm:px-6">
        <h1 className="flex items-center gap-2 text-lg font-semibold"><Sparkles aria-hidden="true" className="h-4 w-4 text-[var(--accent-primary)]" />AI Assistant</h1>
        <div className="ai-header-controls"><span className="ai-response-status" role="status">{isLoading ? "Responding" : "Ready"}</span>
        <Select value={topic} disabled={isLoading} onValueChange={setTopic}>
          <SelectTrigger aria-label="Topic" className="w-44 max-w-full"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="all">All topics</SelectItem><SelectItem value="math">Mathematics</SelectItem><SelectItem value="science">Science</SelectItem><SelectItem value="history">History</SelectItem><SelectItem value="programming">Programming</SelectItem></SelectContent>
        </Select>
        </div>
      </header>
      <main aria-label="Conversation" className="min-h-0 min-w-0 flex-1 overflow-y-auto px-4 sm:px-6">
        <div className="mx-auto max-w-3xl space-y-5 py-6">
          {messages.length === 0 && <section className="ai-empty"><Sparkles aria-hidden="true" /><h2>What would you like to learn?</h2><div className="ai-starters">{["Explain a programming concept", "Help me solve a math problem", "Summarize a science topic"].map(prompt => <button type="button" key={prompt} onClick={() => { setInput(prompt); inputRef.current?.focus(); }}>{prompt}<ArrowUpRight aria-hidden="true" /></button>)}</div></section>}
          {messages.map((message, index) => <article key={index} className={`ai-message ${message.role === "user" ? "is-user flex justify-end" : "is-assistant"}`}>
            <div className={`min-w-0 max-w-full break-words [overflow-wrap:anywhere] text-sm leading-7 ${message.role === "user" ? "w-fit rounded-lg bg-[var(--bg-surface-2)] px-4 py-2 sm:max-w-[85%]" : "py-2"}`}>
              <span className="ai-author">{message.role === "user" ? "You" : "AI Assistant"}</span>
              {message.role === "user" ? <p className="whitespace-pre-wrap">{message.content}</p> : message.content ? <div className="space-y-3 [&_pre]:max-w-full [&_pre]:overflow-x-auto [&_pre]:rounded-md [&_pre]:bg-[var(--bg-surface-2)] [&_pre]:p-3 [&_code]:font-mono [&_table]:block [&_table]:max-w-full [&_table]:overflow-x-auto [&_td]:border [&_td]:border-[var(--border-default)] [&_td]:p-2 [&_th]:p-2 [&_a]:text-[var(--accent-primary)] [&_a]:underline [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
              </div> : <Loader2 role="status" aria-label="Preparing response" className="h-4 w-4 animate-spin text-[var(--text-muted)]" />}
            </div>
          </article>)}
          <div ref={messagesEndRef} />
        </div>
      </main>
      <footer className="ai-footer shrink-0 p-3 sm:p-4">
        <form onSubmit={handleSubmit} className="ai-composer mx-auto flex max-w-3xl items-end gap-2 rounded-lg border border-[var(--border-default)] p-2 focus-within:border-[var(--accent-primary)]">
          <textarea ref={inputRef} aria-label="Message AI assistant" value={input} onChange={event => { setInput(event.target.value); event.target.style.height = "auto"; event.target.style.height = `${Math.min(event.target.scrollHeight, 160)}px`; }} onKeyDown={event => { if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) handleSubmit(event); }} placeholder="Ask a question..." rows={1} className="max-h-40 min-h-10 min-w-0 flex-1 resize-none bg-transparent p-2 text-base outline-none" />
          {isLoading ? <Button type="button" size="icon" variant="secondary" title="Stop response" aria-label="Stop response" onClick={() => requestRef.current?.abort()}><Square className="h-4 w-4" /></Button> : <Button type="submit" size="icon" title="Send message" aria-label="Send message" disabled={!input.trim()}><ArrowUp className="h-4 w-4" /></Button>}
        </form>
      </footer>
    </div>
  );
};

export default AIAssistant;
