import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useBackNavigation } from "@/hooks/useBackNavigation";
import { executeHttpGetRequest, executeHttpPostRequest } from "@/api/commonServices";
import { API_PATHS } from "@/api/constants";
import { Play, Share2, Loader2, Code2, ArrowLeft, TerminalSquare } from "lucide-react";
import { Button, Select, SelectTrigger, SelectValue, SelectContent, SelectItem, Input } from "@/components/ui";
import toast from "react-hot-toast";

import EditorModule from "react-simple-code-editor";
const Editor = (EditorModule as { default?: any }).default || EditorModule;
import Prism from "prismjs";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-python";
import "prismjs/components/prism-java";
import "prismjs/components/prism-c";
import "prismjs/components/prism-cpp";
import "prismjs/themes/prism-tomorrow.css";

const highlightWithPrism = (code: string, language: string) => {
  let lang = language;
  if (language === "c" || language === "cpp" || language.includes("c++")) lang = "cpp";
  if (language === "python3") lang = "python";
  if (language === "nodejs") lang = "javascript";

  try {
    return Prism.highlight(
      code,
      Prism.languages[lang] || Prism.languages.javascript,
      lang
    );
  } catch (e) {
    return code; // Fallback
  }
};

const DEFAULT_CODE: Record<string, string> = {
  javascript: "console.log('Hello, World!');\n",
  python: "print('Hello, World!')\n",
  java: "public class Main {\n    public static void main(String[] args) {\n        System.out.println(\"Hello, World!\");\n    }\n}\n",
  cpp: "#include <iostream>\n\nint main() {\n    std::cout << \"Hello, World!\" << std::endl;\n    return 0;\n}\n"
};

const CodingLab = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const shareSlug = searchParams.get("share");
  
  const [languages, setLanguages] = useState<any[]>([]);
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState(DEFAULT_CODE["javascript"]);
  const [stdin, setStdin] = useState("");
  const [output, setOutput] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isLoadingShared, setIsLoadingShared] = useState(!!shareSlug);

  // Layout state
  const [leftWidth, setLeftWidth] = useState(50);
  const arenaRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef<boolean>(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        // Create an explicit endpoint for lab languages or use hardcoded ones for now if API missing
        const res = await executeHttpGetRequest(API_PATHS.LABS.LANGUAGES).catch(() => null);
        if (res?.data?.data) {
          setLanguages(res.data.data);
          if (res.data.data.length > 0 && !shareSlug) {
            setLanguage(res.data.data[0].id);
            setCode(DEFAULT_CODE[res.data.data[0].id] || "");
          }
        } else {
          // Fallback if endpoint fails
          setLanguages([
            { id: "javascript", name: "JavaScript" },
            { id: "python", name: "Python" },
            { id: "java", name: "Java" },
            { id: "cpp", name: "C++" }
          ]);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchLanguages();
  }, [shareSlug]);

  useEffect(() => {
    if (shareSlug) {
      const fetchShared = async () => {
        try {
          const res = await executeHttpGetRequest(API_PATHS.LABS.GET_SHARED(shareSlug));
          if (res.data?.data) {
            const data = res.data.data;
            setLanguage(data.language);
            setCode(data.code);
            toast.success("Shared code loaded!");
          } else {
            toast.error("Shared code not found.");
          }
        } catch (e) {
          toast.error("Invalid or expired share link.");
        } finally {
          setIsLoadingShared(false);
        }
      };
      fetchShared();
    }
  }, [shareSlug]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang);
    if (!shareSlug && code === DEFAULT_CODE[language]) {
      setCode(DEFAULT_CODE[newLang] || "");
    }
  };

  const handleRun = async () => {
    if (!code.trim()) return toast.error("Code cannot be empty");
    setIsRunning(true);
    setOutput(null);
    try {
      const res = await executeHttpPostRequest(API_PATHS.LABS.RUN, { code, language, stdin });
      setOutput(res.data.data);
    } catch (e: any) {
      setOutput({ errorMessage: e?.response?.data?.message || "Execution failed" });
      toast.error("Execution failed");
    } finally {
      setIsRunning(false);
    }
  };

  const handleShare = async () => {
    if (!code.trim()) return toast.error("Code cannot be empty");
    setIsSharing(true);
    try {
      const res = await executeHttpPostRequest(API_PATHS.LABS.SHARE, { code, language });
      if (res.data?.data?.slug) {
        setSearchParams({ share: res.data.data.slug });
        const url = window.location.href.split('?')[0] + "?share=" + res.data.data.slug;
        navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard!");
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to share code");
    } finally {
      setIsSharing(false);
    }
  };

  // Resizable pane handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging.current || !arenaRef.current) return;
    const containerRect = arenaRef.current.getBoundingClientRect();
    let newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
    if (newWidth < 20) newWidth = 20;
    if (newWidth > 80) newWidth = 80;
    setLeftWidth(newWidth);
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  if (isLoadingShared) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--bg-base)]">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--accent-primary)]" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[var(--bg-base)] text-[var(--text-primary)]">
      {/* HEADER */}
      <header className="h-14 border-b border-[var(--border-default)] bg-[var(--bg-surface)] flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon-sm" onClick={() => navigate("/labs")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-[var(--accent-primary)]" />
            <h1 className="font-semibold text-lg hidden sm:block">Online Compiler</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Select value={language} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-[140px] h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {languages.map((l: any) => (
                <SelectItem key={l.id} value={l.id}>
                  {l.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="sm" onClick={handleShare} disabled={isSharing}>
            {isSharing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Share2 className="w-4 h-4 mr-2" />}
            <span className="hidden sm:inline">Share</span>
          </Button>
          
          <Button size="sm" onClick={handleRun} disabled={isRunning}>
            {isRunning ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
            Run Code
          </Button>
        </div>
      </header>

      {/* WORKSPACE */}
      <div 
        ref={arenaRef} 
        className={`flex-1 flex overflow-hidden ${isMobile ? 'flex-col' : 'flex-row'}`}
      >
        {/* EDITOR PANE */}
        <div 
          className="flex flex-col border-[var(--border-default)]" 
          style={{ 
            width: isMobile ? '100%' : `${leftWidth}%`,
            height: isMobile ? '50%' : '100%',
            borderRightWidth: isMobile ? 0 : 1,
            borderBottomWidth: isMobile ? 1 : 0
          }}
        >
          <div className="bg-[var(--bg-surface-2)] px-4 py-2 border-b border-[var(--border-default)] text-sm font-medium flex items-center text-[var(--text-secondary)]">
            <span>Editor</span>
          </div>
          <div className="flex-1 overflow-auto bg-[var(--bg-surface)] text-sm font-mono relative group">
            <Editor
              value={code}
              onValueChange={setCode}
              highlight={(c) => highlightWithPrism(c, language)}
              padding={16}
              style={{ minHeight: "100%", fontSize: 14, outline: "none" }}
              textareaClassName="focus:outline-none"
            />
          </div>
        </div>

        {/* RESIZER (Desktop) */}
        {!isMobile && (
          <div 
            className="w-1 bg-[var(--border-default)] cursor-col-resize hover:bg-[var(--accent-primary)] transition-colors z-10" 
            onMouseDown={handleMouseDown}
          />
        )}

        {/* I/O PANE */}
        <div 
          className="flex flex-col bg-[var(--bg-surface)]"
          style={{
            width: isMobile ? '100%' : `${100 - leftWidth}%`,
            height: isMobile ? '50%' : '100%'
          }}
        >
          {/* Output Header */}
          <div className="bg-[var(--bg-surface-2)] px-4 py-2 border-b border-[var(--border-default)] text-sm font-medium flex items-center text-[var(--text-secondary)]">
            <TerminalSquare className="w-4 h-4 mr-2" /> Output
          </div>
          
          <div className="flex-1 p-4 overflow-auto font-mono text-sm bg-black/5 dark:bg-black/20">
            {isRunning ? (
              <div className="flex items-center text-[var(--text-muted)] animate-pulse">
                Running code...
              </div>
            ) : output ? (
              <div className="whitespace-pre-wrap">
                {output.errorMessage ? (
                  <span className="text-red-500">{output.errorMessage}</span>
                ) : output.stderr ? (
                  <>
                    {output.output && <span className="text-[var(--text-primary)]">{output.output}</span>}
                    <span className="text-red-500">{output.stderr}</span>
                  </>
                ) : (
                  <span className="text-[var(--text-primary)]">{output.output || <span className="text-[var(--text-muted)] italic">Program finished successfully with no output.</span>}</span>
                )}
                
                {output.time !== undefined && (
                  <div className="mt-4 pt-2 border-t border-[var(--border-subtle)] text-xs text-[var(--text-muted)]">
                    Execution time: {output.time}s | Memory: {output.memory}KB
                  </div>
                )}
              </div>
            ) : (
              <div className="text-[var(--text-muted)] italic">
                Click "Run Code" to see the output here.
              </div>
            )}
          </div>

          {/* Stdin Header */}
          <div className="bg-[var(--bg-surface-2)] px-4 py-2 border-y border-[var(--border-default)] text-sm font-medium flex items-center text-[var(--text-secondary)]">
            Custom Input (stdin)
          </div>
          
          <div className="h-1/3 min-h-[100px] border-t-0 border-[var(--border-default)]">
            <textarea
              className="w-full h-full p-4 bg-[var(--bg-surface)] text-[var(--text-primary)] font-mono text-sm resize-none focus:outline-none"
              placeholder="Enter optional inputs here..."
              value={stdin}
              onChange={(e) => setStdin(e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodingLab;
