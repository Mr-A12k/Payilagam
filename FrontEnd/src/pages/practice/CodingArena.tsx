import { useState, useEffect, useRef } from "react";
import DOMPurify from "dompurify";
import { useParams, Link } from "react-router-dom";
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
import { Button, Card, Input } from "@/components/ui";

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
  const [problem, setProblem] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("java");

  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState<any>(null);
  
  // Resizable Panes
  const [leftWidth, setLeftWidth] = useState(50);
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
    const newLeftWidth = (event.clientX / window.innerWidth) * 100;
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
    };
  }, []);

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const response = await executeHttpGetRequest(API_PATHS.PROBLEMS.SLUG(slug!));
        if ((response.data as { success?: boolean; answer?: string; starterCode?: string }).success) {
          const problemData = response.data;
          setProblem(problemData);
          if (problemData.starterCode) {
            setCode(problemData.starterCode);
          }
        }
      } catch (error) {
        console.error("Failed to load problem", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProblem();
  }, [slug]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [aiChat, isAiOpen]);

  const handleRun = async (submit = false) => {
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
        setOutput(response.data.executionResult || response.data);
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
      const response = await executeHttpPostRequest(API_PATHS.AI.ASK, {
        problemId: problem.problemId,
        code,
        question: questionText,
        provider: "local",
        localModel: "llama3",
        localUrl: import.meta.env.VITE_AI_API_URL || "http://localhost:11434/api/generate",
      });

      if ((response.data as { success?: boolean; answer?: string; starterCode?: string }).success) {
        setAiChat((prev: any) => [
          ...prev,
          { role: "ai", content: response.data.answer },
        ]);
      }
    } catch (error) {
            setAiChat((prev: any) => [
        ...prev,
        {
          role: "error",
          content:
            (error as import('axios').AxiosError<{message?: string}>)?.response?.data?.message ||
            "Failed to reach AI Assistant. Ensure Local LLM or API Key is configured.",
        },
      ]);
    } finally {
      setIsAiLoading(false);
    }
  };

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-[calc(100vh-80px)] bg-slate-950">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    );

  if (!problem)
    return (
      <div className="text-center py-20 bg-slate-950 h-[calc(100vh-80px)] flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-slate-200 mb-4">
          Problem not found
        </h2>
        <Button asChild className="px-6 py-2 transition-colors">
          <Link to="/practice">
            Back to Problems
          </Link>
        </Button>
      </div>
    );

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col md:flex-row overflow-hidden bg-slate-950 text-slate-300 font-sans">
      
      {/* Left Pane: Problem Description */}
      <div 
        className="h-1/2 md:h-full flex flex-col bg-slate-900 border-b md:border-b-0 md:border-r border-slate-800 shadow-2xl relative"
        style={{ width: isMobile ? '100%' : `${leftWidth}%` }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 bg-slate-900/80 backdrop-blur-md border-b border-slate-800/60 sticky top-0 z-10 shrink-0">
          <Code2 className="w-5 h-5 text-blue-400" />
          <h2 className="text-lg font-bold text-slate-100 tracking-tight truncate">{problem.title}</h2>
          <span
            className={`ml-auto px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-bold shrink-0 ${
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
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <div className="prose prose-invert prose-slate max-w-none mb-8 prose-pre:bg-slate-950 prose-pre:border prose-pre:border-slate-800 prose-a:text-blue-400">
            <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(problem.description) }} />
          </div>

          {problem.testCases && problem.testCases.length > 0 && (
            <div className="mt-10 space-y-5 pb-8">
              <h3 className="text-sm uppercase tracking-widest font-bold text-slate-400">Examples</h3>
              {problem.testCases
                .filter((testCaseItem: any) => !testCaseItem.isHidden)
                .map((testCaseItem: any, index: any) => (
                  <div
                    key={index}
                    className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50 shadow-inner"
                  >
                    <div className="font-mono text-sm mb-3">
                      <span className="text-sky-300/70 select-none text-xs font-semibold uppercase tracking-wider block mb-1">
                        Input
                      </span>
                      <span className="text-slate-200 whitespace-pre-wrap">{testCaseItem.input}</span>
                    </div>
                    <div className="font-mono text-sm">
                      <span className="text-blue-400/70 select-none text-xs font-semibold uppercase tracking-wider block mb-1">
                        Expected Output
                      </span>
                      <span className="text-slate-200 whitespace-pre-wrap">{testCaseItem.expectedOutput}</span>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Resizer Divider */}
      <div 
        className="hidden md:flex w-1.5 bg-slate-900 hover:bg-blue-500/50 cursor-col-resize items-center justify-center transition-colors group z-20 relative shrink-0"
        onMouseDown={handleMouseDown}
      >
        <div className="h-8 w-0.5 bg-slate-700 group-hover:bg-slate-900 rounded-full transition-colors" />
      </div>

      {/* Right Pane: Code Editor & Console */}
      <div 
        className="h-1/2 md:h-full flex flex-col bg-[#0d1117] relative z-0"
        style={{ width: isMobile ? '100%' : `${100 - leftWidth}%` }}
      >
        {/* Editor Toolbar */}
        <div className="h-14 border-b border-slate-800/60 flex items-center justify-between px-4 bg-slate-900/40 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-3">
            <select
              value={language}
              onChange={(event: any) => setLanguage((event.target as HTMLInputElement).value)}
              className="bg-slate-950 border border-slate-800 text-sm font-medium text-slate-300 rounded-md px-3 py-1.5 focus:outline-none focus:border-blue-500/50 transition-colors cursor-pointer"
            >
              <option value="java">Java</option>
              {/* <option value="javascript">JavaScript</option> */}
              {/* <option value="python">Python</option> */}
              {/* <option value="cpp">C++</option> */}
            </select>
          </div>

          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => handleRun(false)}
              disabled={isRunning}
              className="!text-sm px-4 py-1.5 shadow-sm"
            >
              {isRunning ? (
                <Loader2 className="icon-base animate-spin text-blue-400" />
              ) : (
                <Play className="icon-base text-emerald-400" />
              )}
              Run
            </Button>
            <Button
              onClick={() => handleRun(true)}
              disabled={isRunning}
              className="!text-sm px-5 py-1.5 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
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
          <div className="absolute inset-0 overflow-auto custom-scrollbar bg-[#0d1117] pt-2">
            <Editor
              value={code}
              onValueChange={(code: any) => setCode(code)}
              highlight={(code: any) =>
                Prism.highlight(code, Prism.languages[language] || Prism.languages.java, language)
              }
              padding={24}
              style={{
                fontFamily: '"Fira Code", "JetBrains Mono", monospace',
                fontSize: 14,
                lineHeight: 1.6,
                minHeight: "100%",
                backgroundColor: "transparent",
              }}
              className="text-slate-200 focus:outline-none editor-container"
            />
          </div>
        </div>

        {/* Console / Output Area */}
        <div
          className={`border-t border-slate-800 bg-black transition-all duration-300 ease-in-out flex flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.3)] z-10 shrink-0 ${isOutputExpanded ? "h-1/2" : "h-12"}`}
        >
          <div
            className="h-12 px-5 border-b border-slate-900/50 text-xs font-semibold text-slate-400 uppercase tracking-wider flex justify-between items-center cursor-pointer hover:bg-slate-900/50 transition-colors bg-black"
            onClick={() => setIsOutputExpanded(!isOutputExpanded)}
          >
            <div className="flex items-center gap-2">
              <TerminalSquare className="w-4 h-4 text-blue-400" />
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
          </div>

          {isOutputExpanded && (
            <div className="flex-1 overflow-y-auto p-5 font-mono text-sm custom-scrollbar bg-black text-slate-300">
              {!output ? (
                <div className="flex items-center justify-center h-full text-slate-400 font-sans">
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
                  <div className="text-slate-300 bg-emerald-950/10 p-5 rounded-xl border border-emerald-900/30">
                    <p className="font-sans text-emerald-100">Passed all {output.totalTestCases} test cases.</p>
                    <div className="flex gap-6 mt-4">
                      <div className="bg-black/50 px-3 py-2 rounded-lg border border-emerald-900/20">
                        <span className="text-xs text-slate-500 uppercase block mb-1 font-sans">Runtime</span>
                        <span className="text-emerald-400 font-bold">{Math.round(output.executionTime)} <span className="text-xs font-normal">ms</span></span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-red-400 animate-in fade-in duration-300">
                  <h4 className="font-bold mb-4 text-xl capitalize flex items-center gap-2 font-sans">
                    <XCircle className="w-6 h-6" />{" "}
                    {output.status.replace("_", " ")}
                  </h4>
                  <p className="text-slate-300 mb-6 font-sans bg-red-950/10 px-4 py-2 rounded-lg inline-block border border-red-900/30">
                    Passed <span className="font-bold text-white">{output.testCasesPassed}</span> of <span className="font-bold text-white">{output.totalTestCases}</span> test cases.
                  </p>

                  {output.errorMessage && (
                    <div className="mb-6">
                      <p className="text-xs text-slate-500 uppercase font-sans mb-2 tracking-wider">Error Details</p>
                      <pre className="text-red-300 bg-red-950/20 p-4 rounded-xl whitespace-pre-wrap border border-red-900/30 text-sm">
                        {output.errorMessage}
                      </pre>
                    </div>
                  )}

                  {output.output && (
                    <div className="mt-4">
                      <p className="text-xs text-slate-500 uppercase font-sans mb-2 tracking-wider">Standard Output</p>
                      <pre className="text-slate-300 bg-slate-900/50 p-4 rounded-xl border border-slate-800 text-sm">
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
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        {/* AI Drawer / Popover */}
        {isAiOpen && (
          <Card className="!p-0 mb-4 w-[350px] sm:w-[400px] h-[500px] max-h-[70vh] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-200">
            {/* Header */}
            <div className="bg-slate-800 px-5 py-3 border-b border-slate-700 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-200">AI Assistant</h3>
                  <p className="text-[10px] text-slate-400">Powered by Payilagam</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setIsAiOpen(false)}
              >
                <X className="icon-base" />
              </Button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-950/50">
              {aiChat.length === 0 && (
                <div className="text-center p-6 mt-8">
                  <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
                    <Bot className="w-6 h-6 text-blue-400" />
                  </div>
                  <h4 className="text-slate-200 font-semibold mb-2">How can I help?</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
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
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                      message.role === "user"
                        ? "bg-blue-600 text-white rounded-br-sm"
                        : message.role === "error"
                          ? "bg-red-950/50 text-red-300 border border-red-900/50 rounded-bl-sm"
                          : "bg-slate-800 text-slate-200 border border-slate-700/50 rounded-bl-sm"
                    }`}
                  >
                    <div className="whitespace-pre-wrap leading-relaxed">
                      {message.content}
                    </div>
                  </div>
                </div>
              ))}

              {isAiLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-800 border border-slate-700/50 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-2 text-slate-400 shadow-sm text-sm">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            <form
              onSubmit={handleAskAi}
              className="p-3 bg-slate-900 border-t border-slate-800 shrink-0 flex gap-2"
            >
              <Input
                type="text"
                value={aiQuestion}
                onChange={(event: any) => setAiQuestion((event.target as HTMLInputElement).value)}
                placeholder="Ask a question..."
                className="flex-1 !rounded-full !py-2 !px-4"
              />
              <button
                type="submit"
                disabled={isAiLoading || !aiQuestion.trim()}
                className="bg-blue-600 text-white p-2 rounded-full disabled:opacity-50 hover:bg-blue-500 transition-colors shrink-0 shadow-lg shadow-blue-900/20"
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            </form>
          </Card>
        )}

        {/* FAB Button */}
        <button
          onClick={() => setIsAiOpen(!isAiOpen)}
          className={`flex items-center justify-center w-14 h-14 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 ${
            isAiOpen 
              ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700' 
              : 'bg-blue-600 text-white hover:bg-blue-500 shadow-blue-900/50'
          }`}
          aria-label="Toggle AI Assistant"
        >
          {isAiOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
        </button>
      </div>

    </div>
  );
};

export default CodingArena;

