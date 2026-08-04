/**
 * @fileoverview Learning Arena page for Payilagam .
 * Full-screen lesson viewer with embedded video player, tabbed
 * content area (assignment / resources / discussion), and a
 * sidebar listing all modules and lessons with progress indicators.
 */
import { useState, useEffect } from "react";
import DOMPurify from "dompurify";
import { useParams, Link, useNavigate } from "react-router-dom";
import { executeHttpGetRequest } from "@/api/commonServices";
import { API_PATHS } from "@/api/constants";
import {
  ArrowLeft,
  Play,
  Check,
  Lock,
  MessageSquare,
  FileText,
  UploadCloud,
  ChevronRight,
  Bot,
  Maximize,
  Minimize
} from "lucide-react";
import { Button, Card } from "@/components/ui";

const LearningArena = () => {
  const { courseId, moduleId, lessonId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState<any>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [currentLesson, setCurrentLesson] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("assignment");
  const [isFocusMode, setIsFocusMode] = useState(false);

  useEffect(() => {
    const fetchLearningData = async () => {
      try {
        const [courseResponse, modulesResponse, lessonResponse] = await Promise.all([
          executeHttpGetRequest(`${API_PATHS.COURSES.BASE}/${courseId}`),
          executeHttpGetRequest(API_PATHS.MODULES.COURSE(courseId!)),
          executeHttpGetRequest(`${API_PATHS.LESSONS.BASE}/${lessonId}`),
        ]);

        if (courseResponse.data.success) setCourse(courseResponse.data.data);
        if (modulesResponse.data.success) setModules(modulesResponse.data.data);
        if (lessonResponse.data.success) setCurrentLesson(lessonResponse.data.data);
      } catch (error) {
        console.error("Failed to load learning data", error);
      }
    };

    fetchLearningData();
  }, [courseId, lessonId]);

  // Find next lesson for navigation
  let nextLesson = null;
  if (modules.length > 0 && currentLesson) {
    const flatLessons = modules.flatMap((moduleItem: any) =>
      moduleItem.lessons.map((lessonItem: any) => ({ ...lessonItem, moduleId: moduleItem.moduleId })),
    );
    const currentIndex = flatLessons.findIndex(
      (lessonItem: any) => lessonItem.lessonId === parseInt(lessonId!),
    );
    if (currentIndex < flatLessons.length - 1)
      nextLesson = flatLessons[currentIndex + 1];
  }

  const handleNextLesson = () => {
    if (nextLesson) {
      navigate(
        `/learn/${courseId}/module/${nextLesson.moduleId}/lesson/${nextLesson.lessonId}`,
      );
    } else {
      navigate(`/courses/${courseId}`);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 overflow-hidden font-sans text-slate-300">
      {/* Top Navbar */}
      <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 shrink-0 z-20 shadow-blue-900/10 shadow-md">
        <div className="flex items-center gap-4">
          <Link
            to={`/courses/${courseId}`}
            className="text-slate-400 hover:text-slate-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="text-blue-400 font-bold text-sm leading-tight">
              Payilagam{" "}
            </div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              {course?.courseName || "COURSE NAME"}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <Button 
            variant="secondary"
            onClick={() => setIsFocusMode(!isFocusMode)}
            className="!text-sm px-3 py-1.5"
          >
            {isFocusMode ? <Minimize className="icon-base" /> : <Maximize className="icon-base" />}
            <span className="hidden sm:inline">{isFocusMode ? "Exit Focus" : "Focus Mode"}</span>
          </Button>

          <div className="hidden md:flex items-center gap-3">
            <span className="text-sm font-medium text-slate-400">
              Course Progress
            </span>
            <div className="w-32 bg-slate-800 h-2 rounded-full overflow-hidden border border-slate-700">
              <div className="bg-blue-500 h-full w-[75%] rounded-full shadow-[0_0_10px_rgba(59,130,246,0.8)]"></div>
            </div>
          </div>
          <Button onClick={handleNextLesson} className="rounded-lg px-6 border-0 shadow-[0_0_15px_rgba(37,99,235,0.4)]">
            Next Lesson
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Main Content Area */}
        <main className="flex-1 flex flex-col overflow-y-auto pb-20 custom-scrollbar">
          <div className={`p-6 mx-auto w-full transition-all duration-300 ${isFocusMode ? "max-w-7xl" : "max-w-5xl"}`}>
            {/* Video Player */}
            <div className={`w-full aspect-video bg-slate-950 rounded-2xl overflow-hidden relative shadow-[0_8px_30px_rgb(0,0,0,0.5)] border border-slate-800 group ${isFocusMode ? "ring-1 ring-blue-500/30 shadow-blue-900/20" : ""}`}>
              {currentLesson?.videoUrl ? (
                <iframe
                  src={currentLesson.videoUrl}
                  className="w-full h-full absolute inset-0"
                  frameBorder="0"
                  allowFullScreen
                ></iframe>
              ) : (
                <div className="absolute inset-0 bg-slate-900 flex-center">
                  <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 to-slate-900 opacity-90"></div>
                  <div className="w-20 h-20 bg-blue-500/10 border border-blue-500/30 rounded-full flex-center relative z-10 shadow-[0_0_30px_rgba(59,130,246,0.3)] cursor-pointer transform transition-all group-hover:scale-110 group-hover:bg-blue-500/20 group-hover:shadow-[0_0_40px_rgba(59,130,246,0.5)]">
                    <Play className="icon-lg w-8 h-8 text-blue-400 ml-1" />
                  </div>
                  {/* Decorative lines for the mock video player */}
                  <div
                    className="absolute inset-0 opacity-10"
                    style={{
                      backgroundImage:
                        "linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)",
                      backgroundSize: "40px 40px",
                    }}
                  ></div>
                </div>
              )}
            </div>

            {/* Lesson Info */}
            <div className="mt-8 mb-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2.5 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold rounded-full shadow-[0_0_10px_rgba(59,130,246,0.1)]">
                  MODULE{" "}
                  {modules.findIndex((moduleItem: any) => moduleItem.moduleId === parseInt(moduleId!)) +
                    1}
                </span>
                <span className="text-slate-400 text-sm font-medium">
                  Lesson {lessonId}: {currentLesson?.title}
                </span>
              </div>

              <h1 className="text-3xl font-bold text-slate-100 mb-4 drop-shadow-sm">
                {currentLesson?.title || "Designing for 10M Concurrent Users"}
              </h1>

              <button className="flex items-center gap-2 text-sky-400 font-semibold text-sm hover:text-sky-300 hover:underline mb-4 transition-colors">
                <Bot className="w-4 h-4" /> Ask Lumi about this lesson
              </button>

              <div className="text-slate-400 leading-relaxed mb-8 text-base">
                {currentLesson?.content ? (
                  <div
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(currentLesson.content) }}
                  />
                ) : (
                  <p>
                    In this session, we dive deep into the principles of
                    horizontal scaling and database sharding. Learn how to
                    manage state across distributed nodes while maintaining
                    zero-latency response times for your global user base.
                  </p>
                )}
              </div>

              {/* Tabs */}
              <div className="border-b border-slate-800 flex gap-8 mb-6">
                <button
                  onClick={() => setActiveTab("assignment")}
                  className={`pb-3 font-semibold text-sm flex items-center gap-2 transition-all relative ${activeTab === "assignment" ? "text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]" : "text-slate-500 hover:text-slate-300"}`}
                >
                  <FileText className="w-4 h-4" /> Assignment Submission
                  {activeTab === "assignment" && (
                    <div className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.8)]"></div>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("resources")}
                  className={`pb-3 font-semibold text-sm flex items-center gap-2 transition-all relative ${activeTab === "resources" ? "text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]" : "text-slate-500 hover:text-slate-300"}`}
                >
                  <UploadCloud className="w-4 h-4" /> Resources
                  {activeTab === "resources" && (
                    <div className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.8)]"></div>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("discussion")}
                  className={`pb-3 font-semibold text-sm flex items-center gap-2 transition-all relative ${activeTab === "discussion" ? "text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]" : "text-slate-500 hover:text-slate-300"}`}
                >
                  <MessageSquare className="w-4 h-4" /> Discussion (24)
                  {activeTab === "discussion" && (
                    <div className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.8)]"></div>
                  )}
                </button>
              </div>

              {/* Tab Content */}
              <div>
                {activeTab === "assignment" && (
                  <div className="border-2 border-dashed border-slate-800 bg-slate-900/50 rounded-2xl p-12 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-800/80 hover:border-slate-700 transition-all duration-300 shadow-inner">
                    <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(59,130,246,0.15)]">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-200 mb-1">
                      Upload Your Solution
                    </h3>
                    <p className="text-slate-400 text-sm">
                      Drag and drop or click to browse
                    </p>
                  </div>
                )}
                {activeTab === "resources" && (
                  <Card className="p-8 text-center text-slate-400 bg-slate-900/30 border-slate-800/50">
                    No resources available for this lesson.
                  </Card>
                )}
                {activeTab === "discussion" && (
                  <Card className="p-8 text-center text-slate-400 bg-slate-900/30 border-slate-800/50">
                    Discussion forum coming soon.
                  </Card>
                )}
              </div>
            </div>
          </div>
        </main>

        {/* Right Sidebar */}
        <aside className={`w-80 shrink-0 bg-slate-900 border-l border-slate-800 flex flex-col relative z-10 transition-all duration-300 shadow-[-10px_0_30px_rgba(0,0,0,0.3)] ${isFocusMode ? "hidden" : "hidden lg:flex"}`}>
          <div className="p-6 border-b border-slate-800 flex justify-between items-center sticky top-0 bg-slate-900/95 backdrop-blur-sm z-10">
            <h3 className="font-bold text-lg text-slate-100">Course Content</h3>
            <button className="text-slate-500 hover:text-slate-300 transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {modules.map((module: any, moduleIndex: any) => (
              <div key={module.moduleId} className="mb-2">
                <div className="p-4 bg-slate-950/50 border-y border-slate-800/50">
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    SECTION {moduleIndex + 1}: {module.title}
                  </h4>
                </div>
                <div>
                  {module.lessons?.map((lesson: any, lessonIndex: any) => {
                    const isActive = lesson.lessonId === parseInt(lessonId!);
                    // Mocking completion status for UI visual match
                    const isCompleted =
                      lessonIndex <
                      (lesson.lessonId === parseInt(lessonId!) ? lessonIndex : 2);
                    const isLocked = lessonIndex > 1 && !isActive && !isCompleted;

                    return (
                      <Link
                        key={lesson.lessonId}
                        to={`/learn/${courseId}/module/${module.moduleId}/lesson/${lesson.lessonId}`}
                        className={`w-full flex flex-col p-4 text-left transition-all duration-300 relative group ${
                          isActive
                            ? "bg-blue-900/20 border-l-4 border-blue-400 shadow-[inset_4px_0_15px_rgba(96,165,250,0.1)]"
                            : "hover:bg-slate-800/50 border-l-4 border-transparent hover:shadow-[inset_4px_0_15px_rgba(56,189,248,0.05)] hover:border-slate-700"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="mt-1 shrink-0">
                              {isActive ? (
                                <div className="w-5 h-5 rounded-md bg-blue-500 flex items-center justify-center shadow-[0_0_10px_rgba(59,130,246,0.6)] ring-2 ring-blue-500/20">
                                  <div className="w-1.5 h-1.5 bg-slate-900 rounded-full"></div>
                                </div>
                              ) : isCompleted ? (
                                <div className="w-5 h-5 rounded-md border border-sky-400/50 bg-sky-400/10 flex items-center justify-center">
                                  <Check className="w-3.5 h-3.5 text-sky-400" />
                                </div>
                              ) : (
                                <div className="w-5 h-5 rounded-md border border-slate-700 group-hover:border-slate-500 transition-colors"></div>
                              )}
                            </div>
                            <div>
                              <p
                                className={`text-sm font-medium transition-colors ${isActive ? "text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.3)]" : "text-slate-300 group-hover:text-slate-200"}`}
                              >
                                {lessonIndex + 1}. {lesson.title}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-slate-500 group-hover:text-slate-400 transition-colors">
                                  12:45
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="shrink-0 ml-2 mt-1">
                            {isActive ? (
                              <Play className="w-4 h-4 text-blue-400 drop-shadow-[0_0_5px_rgba(96,165,250,0.5)]" />
                            ) : isLocked ? (
                              <Lock className="w-4 h-4 text-slate-400" />
                            ) : null}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-slate-800 mt-auto bg-slate-900/95 backdrop-blur-sm">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span>Course Progress</span>
              <span className="font-bold text-blue-400">75%</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden border border-slate-700">
              <div className="bg-blue-500 h-full w-[75%] rounded-full shadow-[0_0_10px_rgba(59,130,246,0.8)]"></div>
            </div>
          </div>
        </aside>
      </div>

      {/* Floating AI Button */}
      <button className="fixed bottom-6 right-6 w-14 h-14 bg-slate-800 border border-slate-700 text-sky-400 rounded-full shadow-[0_0_20px_rgba(56,189,248,0.2)] flex-center hover:bg-slate-700 hover:text-sky-300 hover:shadow-[0_0_25px_rgba(56,189,248,0.4)] transition-all duration-300 hover:scale-105 z-50">
        <Bot className="icon-lg" />
      </button>
    </div>
  );
};

export default LearningArena;

