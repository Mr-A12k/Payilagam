import { useState, useEffect, useRef } from "react";
import DOMPurify from "dompurify";
import { useParams } from "react-router-dom";
import { useBackNavigation } from "@/hooks/useBackNavigation";
import { executeHttpGetRequest, executeHttpPostRequest } from "@/api/commonServices";
import { API_PATHS } from "@/api/constants";
import {
  Play,
  Send,
  Loader2,
  CheckCircle,
  XCircle,
  Bot,
  Code2,
  X,
  MessageSquare,
  TerminalSquare,
  ChevronUp,
  ChevronDown
} from "lucide-react";
import { Button, Card, Input, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui";

import EditorModule from "react-simple-code-editor";
const Editor = (EditorModule as { default?: any }).default || EditorModule;
import Prism from "prismjs";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-python";
import "prismjs/components/prism-java";
import "prismjs/components/prism-c";
import "prismjs/components/prism-cpp";
import "prismjs/themes/prism-tomorrow.css";

const CodingArena = () => {
  const { slug } = useParams();
  const goBack = useBackNavigation("/practice");
  const [problem, setProblem] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("java");

  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState<any>(null);
  
  // Resizable Panes
  const [leftWidth, setLeftWidth] = useState(50);
  const arenaRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef<any>(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // AI Assistant State
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [aiChat, setAiChat] = useState<any[]>([]);
  const [aiQuestion, setAiQuestion] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const chatEndRef = useRef<any>(null);
  
  // Output Panel State
  const [isOutputExpanded, setIsOutputExpanded] = useState(false);

  // Drag logic & Resize Listener
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleMouseDown = () => {
    isDragging.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  const handleMouseUp = () => {
    if (isDragging.current) {
      isDragging.current = false;
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    }
  };

  const handleMouseMove = (event: any) => {
    if (!isDragging.current) return;
    const bounds = arenaRef.current?.getBoundingClientRect();
    if (!bounds) return;
    const newLeftWidth = ((event.clientX - bounds.left) / bounds.width) * 100;
    if (newLeftWidth > 20 && newLeftWidth < 80) {
      setLeftWidth(newLeftWidth);
    }
  };

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove as any);
    document.addEventListener('mouseup', handleMouseUp as any);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove as any);
      document.removeEventListener('mouseup', handleMouseUp as any);
      handleMouseUp();
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setProblem(null);
    setOutput(null);
    setAiChat([]);
    const fetchProblem = async () => {
      try {
        const response = await executeHttpGetRequest(API_PATHS.PROBLEMS.SLUG(slug!));
        if ((response.data as { success?: boolean; answer?: string; starterCode?: string }).success) {
          if (cancelled) return;
          const problemData = response.data.data;
          setProblem(problemData);
          setCode(problemData.starterCode || "");
        }
      } catch (error) {
        console.error("Failed to load problem", error);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    fetchProblem();
    return () => { cancelled = true; };
  }, [slug]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [aiChat, isAiOpen]);

  const handleRun = async (submit = false) => {
    if (isRunning || !problem || !code.trim()) return;
    setIsRunning(true);
    setOutput(null);
    setIsOutputExpanded(true); // Auto expand output on run

    try {
      let response;
      if (submit) {
        response = await executeHttpPostRequest(
          API_PATHS.CODING_SUBMISSIONS.SUBMIT(problem.problemId),
          { code, language },
        );
      } else {
        response = await executeHttpPostRequest(
          API_PATHS.CODING_SUBMISSIONS.RUN(problem.problemId),
          { code, language },
        );
      }

      if ((response.data as { success?: boolean; answer?: string; starterCode?: string }).success) {
        setOutput(response.data.data?.executionResult || response.data.data);
      } else {
        setOutput({ status: "system_error", errorMessage: response.data.message || "Execution failed." });
      }
    } catch (error) {
            setOutput({
        status: "system_error",
        errorMessage:
          (error as import('axios').AxiosError<{message?: string}>)?.response?.data?.message || "An error occurred during execution",
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleAskAi = async (event: any) => {
    event.preventDefault();
    if (!aiQuestion.trim() || isAiLoading) return;

    const questionText = aiQuestion.trim();
    setAiQuestion("");
    setAiChat((prev: any) => [...prev, { role: "user", content: questionText }]);
    setIsAiLoading(true);

    try {
      const response = await executeHttpPostRequest("/ai/chat", {
        query: `Problem: ${problem.title}\n${DOMPurify.sanitize(problem.description, { ALLOWED_TAGS: [] })}\nLanguage: ${language}\nCode:\n${code}\nQuestion: ${questionText}`,
        topic: "programming",
      });
      let answer = "";
      for (const line of String(response.data).split(/\r?\n/)) {
        if (!line.startsWith("data:")) continue;
        const payload = line.slice(5).trim();
        if (!payload || payload === "[DONE]") continue;
        const event = JSON.parse(payload);
        if (event.error) throw new Error(event.error);
        if (typeof event.token === "string") answer += event.token;
      }
      setAiChat((prev) => [...prev, { role: "ai", content: answer || "No answer returned. Please try again." }]);
    } catch (error) {
            setAiChat((prev: any) => [
        ...prev,
        {
          role: "error",
          content:
            (error as import('axios').AxiosError<{message?: string}>)?.response?.data?.message || (error as Error).message ||
            "Failed to reach AI Assistant. Ensure Local LLM or API Key is configured.",
        },
      ]);
    } finally {
      setIsAiLoading(false);
    }
  };

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-[calc(100vh-80px)] bg-[var(--bg-base)]">
        <Loader2 className="w-8 h-8 text-[var(--accent-primary)] animate-spin" />
      </div>
    );

  if (!problem)
    return (
      <div className="text-center py-20 bg-[var(--bg-base)] h-[calc(100vh-80px)] flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">
          Problem not found
        </h2>
        <Button onClick={goBack} className="px-4 py-2 transition-colors">
            Go back
        </Button>
      </div>
    );

  return (
    <div ref={arenaRef} className="min-h-[calc(100dvh-64px)] md:h-[calc(100dvh-64px)] min-w-0 flex flex-col md:flex-row md:overflow-hidden bg-[var(--bg-base)] text-[var(--text-primary)] font-sans">
      
      {/* Left Pane: Problem Description */}
      <div 
        className="h-[40dvh] min-h-48 min-w-0 md:h-full flex shrink-0 flex-col bg-[var(--bg-surface)] border-b md:border-b-0 md:border-r border-[var(--border-default)] relative"
        style={{ width: isMobile ? '100%' : `${leftWidth}%` }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 bg-[var(--bg-surface)]  border-b border-[var(--border-default)] sticky top-0 z-10 shrink-0">
          <Code2 className="w-5 h-5 text-[var(--accent-primary)]" />
          <h2 className="text-lg font-bold text-[var(--text-primary)] tracking-normal truncate">{problem.title}</h2>
          <span
            className={`ml-auto px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-normal font-bold shrink-0 ${
              problem.difficulty === "easy"
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : problem.difficulty === "medium"
                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                  : "bg-red-500/10 text-red-400 border border-red-500/20"
            }`}
          >
            {problem.difficulty}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <div className="prose prose-invert prose-slate max-w-none mb-8 prose-pre:bg-[var(--bg-base)] prose-pre:border prose-pre:border-[var(--border-default)] prose-a:text-[var(--accent-primary)]">
            <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(problem.description) }} />
          </div>

          {problem.testCases && problem.testCases.length > 0 && (
            <div className="mt-10 space-y-5 pb-8">
              <h3 className="text-sm uppercase tracking-normal font-bold text-[var(--text-muted)]">Examples</h3>
              {problem.testCases
                .filter((testCaseItem: any) => !testCaseItem.isHidden)
                .map((testCaseItem: any, index: any) => (
                  <div
                    key={index}
                    className="bg-[var(--bg-surface-2)] rounded-lg p-5 border border-[var(--border-default)] "
                  >
                    <div className="font-mono text-sm mb-3">
                      <span className="text-[var(--accent-primary)] select-none text-xs font-semibold uppercase tracking-normal block mb-1">
                        Input
                      </span>
                      <span className="text-[var(--text-primary)] whitespace-pre-wrap">{testCaseItem.input}</span>
                    </div>
                    <div className="font-mono text-sm">
                      <span className="text-[var(--accent-primary)] select-none text-xs font-semibold uppercase tracking-normal block mb-1">
                        Expected Output
                      </span>
                      <span className="text-[var(--text-primary)] whitespace-pre-wrap">{testCaseItem.expectedOutput}</span>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Resizer Divider */}
      <div 
        className="hidden md:flex w-1.5 bg-[var(--bg-surface)] hover:bg-[var(--accent-primary-subtle)] cursor-col-resize items-center justify-center transition-colors group z-20 relative shrink-0"
        onMouseDown={handleMouseDown}
      >
        <div className="h-8 w-0.5 bg-[var(--bg-surface-3)] group-hover:bg-[var(--bg-surface)] rounded-full transition-colors" />
      </div>

      {/* Right Pane: Code Editor & Console */}
      <div 
        className="h-[65dvh] min-h-96 min-w-0 md:min-h-0 md:h-full flex flex-1 flex-col bg-[var(--bg-surface)] relative z-0"
      >
        {/* Editor Toolbar */}
        <div className="min-h-12 border-b border-[var(--border-default)] flex flex-wrap items-center justify-between gap-2 p-2 bg-[var(--bg-surface)] shrink-0">
          <div className="flex items-center gap-3">
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger aria-label="Programming language" className="w-36"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="java">Java</SelectItem></SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => handleRun(false)}
              disabled={isRunning || !code.trim()}
              className="!text-sm px-2 py-1.5"
            >
              {isRunning ? (
                <Loader2 className="icon-base animate-spin text-[var(--accent-primary)]" />
              ) : (
                <Play className="icon-base text-emerald-400" />
              )}
              Run
            </Button>
            <Button
              onClick={() => handleRun(true)}
              disabled={isRunning || !code.trim()}
              className="!text-sm px-2 py-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRunning ? (
                <Loader2 className="icon-base animate-spin" />
              ) : (
                <CheckCircle className="icon-base" />
              )}
              Submit
            </Button>
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 overflow-hidden relative group">
          <div className="absolute inset-0 overflow-auto custom-scrollbar bg-[var(--bg-surface)] pt-2">
            <Editor
              textareaId="solution-code"
              aria-label="Solution code"
              value={code}
              onValueChange={(code: any) => setCode(code)}
              highlight={(code: any) =>
                Prism.highlight(code, Prism.languages[language] || Prism.languages.java, language)
              }
              padding={16}
              style={{
                fontFamily: '"Fira Code", "JetBrains Mono", monospace',
                fontSize: 14,
                lineHeight: 1.6,
                minHeight: "100%",
                backgroundColor: "transparent",
              }}
              className="text-[var(--text-primary)] focus:outline-none editor-container"
            />
          </div>
        </div>

        {/* Console / Output Area */}
        <div
          className={`border-t border-[var(--border-default)] bg-[var(--bg-surface)] transition-all duration-300 ease-in-out flex flex-col  z-10 shrink-0 ${isOutputExpanded ? "h-1/2" : "h-12"}`}
        >
          <button
            type="button"
            aria-expanded={isOutputExpanded}
            aria-label="Toggle console"
            className="h-12 px-5 border-b border-[var(--border-default)] text-xs font-semibold text-[var(--text-muted)] uppercase tracking-normal flex justify-between items-center cursor-pointer hover:bg-[var(--bg-surface)] transition-colors bg-[var(--bg-surface)]"
            onClick={() => setIsOutputExpanded(!isOutputExpanded)}
          >
            <div className="flex items-center gap-2">
              <TerminalSquare className="w-4 h-4 text-[var(--accent-primary)]" />
              <span>Console</span>
              {output && (
                <span className={`ml-3 px-2 py-0.5 rounded-full text-[10px] normal-case font-bold ${output.status === 'accepted' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                  {output.status === 'accepted' ? 'Success' : 'Error'}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              {isOutputExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </div>
          </button>

          {isOutputExpanded && (
            <div className="flex-1 overflow-y-auto p-5 font-mono text-sm custom-scrollbar bg-[var(--bg-surface)] text-[var(--text-secondary)]">
              {!output ? (
                <div className="flex items-center justify-center h-full text-[var(--text-muted)] font-sans">
                  Run your code to see the output here.
                </div>
              ) : output.status === "system_error" ? (
                <div className="text-red-400 flex items-start gap-3">
                  <XCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <pre className="whitespace-pre-wrap font-sans text-sm">{output.errorMessage}</pre>
                </div>
              ) : output.status === "compilation_error" ? (
                <div className="text-amber-400">
                  <h4 className="font-bold mb-3 flex items-center gap-2 font-sans text-base">
                    <XCircle className="w-5 h-5" /> Compilation Error
                  </h4>
                  <pre className="text-amber-300 bg-amber-950/20 p-4 rounded-lg whitespace-pre-wrap border border-amber-900/30">
                    {output.errorMessage}
                  </pre>
                </div>
              ) : output.status === "accepted" ? (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="text-emerald-400 flex items-center gap-2 font-bold mb-4 text-xl font-sans">
                    <CheckCircle className="w-6 h-6" /> Accepted!
                  </div>
                  <div className="text-[var(--text-secondary)] bg-emerald-500/10 p-5 rounded-lg border border-emerald-500/20">
                    <p className="font-sans text-emerald-700 dark:text-emerald-300 font-medium">Passed all {output.totalTestCases} test cases.</p>
                    <div className="flex gap-6 mt-4">
                      <div className="bg-[var(--bg-surface)] px-3 py-2 rounded-lg border border-[var(--border-default)]">
                        <span className="text-xs text-[var(--text-muted)] uppercase block mb-1 font-sans">Runtime</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">{Math.round(output.executionTime)} <span className="text-xs font-normal">ms</span></span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-red-500 dark:text-red-400 animate-in fade-in duration-300">
                  <h4 className="font-bold mb-4 text-xl capitalize flex items-center gap-2 font-sans">
                    <XCircle className="w-6 h-6" />{" "}
                    {String(output.status || "Execution result").replace(/_/g, " ")}
                  </h4>
                  <p className="text-[var(--text-secondary)] mb-6 font-sans bg-red-500/10 px-4 py-2 rounded-lg inline-block border border-red-500/20">
                    Passed <span className="font-bold text-[var(--text-heading)]">{output.testCasesPassed}</span> of <span className="font-bold text-[var(--text-heading)]">{output.totalTestCases}</span> test cases.
                  </p>

                  {output.errorMessage && (
                    <div className="mb-6">
                      <p className="text-xs text-[var(--text-muted)] uppercase font-sans mb-2 tracking-normal">Error Details</p>
                      <pre className="text-red-600 dark:text-red-300 bg-red-500/10 p-4 rounded-lg whitespace-pre-wrap border border-red-500/20 text-sm">
                        {output.errorMessage}
                      </pre>
                    </div>
                  )}

                  {output.output && (
                    <div className="mt-4">
                      <p className="text-xs text-[var(--text-muted)] uppercase font-sans mb-2 tracking-normal">Standard Output</p>
                      <pre className="text-[var(--text-secondary)] bg-[var(--bg-surface)] p-4 rounded-lg border border-[var(--border-default)] text-sm">
                        {output.output}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Floating AI Assistant */}
      <div className="fixed bottom-3 right-3 sm:bottom-5 sm:right-5 z-50 flex flex-col items-end">
        {/* AI Drawer / Popover */}
        {isAiOpen && (
          <Card role="region" aria-label="Coding AI assistant" onKeyDown={(event) => { if (event.key === "Escape") setIsAiOpen(false); }} className="!p-0 mb-3 w-[min(400px,calc(100vw-24px))] h-[500px] max-h-[calc(100dvh-96px)] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="bg-[var(--bg-surface-2)] px-5 py-3 border-b border-[var(--border-default)] flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[var(--accent-primary-subtle)] flex items-center justify-center">
                  <Bot className="w-4 h-4 text-[var(--accent-primary)]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">AI Assistant</h3>
                  <p className="text-[10px] text-[var(--text-muted)]">Powered by Payilagam</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setIsAiOpen(false)}
                aria-label="Close AI assistant"
                title="Close AI assistant"
              >
                <X className="icon-base" />
              </Button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-[var(--bg-base)]">
              {aiChat.length === 0 && (
                <div className="text-center p-4 mt-8">
                  <div className="w-12 h-12 rounded-full bg-[var(--accent-primary-subtle)] flex items-center justify-center mx-auto mb-4">
                    <Bot className="w-6 h-6 text-[var(--accent-primary)]" />
                  </div>
                  <h4 className="text-[var(--text-primary)] font-semibold mb-2">How can I help?</h4>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                    I can see your code and the problem. Ask me for hints, concepts, or explanations.
                  </p>
                </div>
              )}

              {aiChat.map((message: any, index: any) => (
                <div
                  key={index}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg px-4 py-2.5 text-sm  ${
                      message.role === "user"
                        ? "bg-[var(--accent-primary)] text-white rounded-br-sm"
                        : message.role === "error"
                          ? "bg-red-500/10 text-red-600 dark:text-red-300 border border-red-500/30 rounded-bl-sm"
                          : "bg-[var(--bg-surface-2)] text-[var(--text-primary)] border border-[var(--border-default)] rounded-bl-sm"
                    }`}
                  >
                    <div className="whitespace-pre-wrap break-words [overflow-wrap:anywhere] leading-relaxed">
                      {message.content}
                    </div>
                  </div>
                </div>
              ))}

              {isAiLoading && (
                <div className="flex justify-start">
                  <div className="bg-[var(--bg-surface-2)] border border-[var(--border-default)] rounded-lg rounded-bl-sm px-4 py-3 flex items-center gap-2 text-[var(--text-muted)]  text-sm">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-[var(--accent-primary)] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="w-1.5 h-1.5 bg-[var(--accent-primary)] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-1.5 h-1.5 bg-[var(--accent-primary)] rounded-full animate-bounce"></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            <form
              onSubmit={handleAskAi}
              className="p-3 bg-[var(--bg-surface)] border-t border-[var(--border-default)] shrink-0 flex gap-2"
            >
              <Input
                aria-label="Ask the coding assistant"
                autoFocus
                type="text"
                value={aiQuestion}
                onChange={(event: any) => setAiQuestion((event.target as HTMLInputElement).value)}
                placeholder="Ask a question..."
                className="min-w-0 flex-1 !rounded-md !py-2 !px-3"
              />
              <button
                type="submit"
                aria-label="Send question"
                title="Send question"
                disabled={isAiLoading || !aiQuestion.trim()}
                className="bg-[var(--accent-primary)] text-white p-2 rounded-full disabled:opacity-50 hover:bg-[var(--accent-primary)] transition-colors shrink-0  "
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            </form>
          </Card>
        )}

        {/* FAB Button */}
        <button
          onClick={() => setIsAiOpen(!isAiOpen)}
          className={`flex items-center justify-center w-14 h-14 rounded-full  transition-all duration-300 hover:scale-105 ${
            isAiOpen 
              ? 'bg-[var(--bg-surface-2)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-3)] border border-[var(--border-default)]'
              : 'bg-[var(--accent-primary)] text-white hover:bg-[var(--accent-primary)] '
          }`}
          aria-label="Toggle AI Assistant"
          aria-expanded={isAiOpen}
          title="AI assistant"
        >
          {isAiOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
        </button>
      </div>

    </div>
  );
};

export default CodingArena;

