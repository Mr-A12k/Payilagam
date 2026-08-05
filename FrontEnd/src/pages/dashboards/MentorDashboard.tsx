/**
 * @fileoverview Mentor Dashboard page for Payilagam .
 * Displays enrollment, completion, rating, and revenue stats,
 * a course builder wizard, a "Your Courses" table, live-stream
 * configuration panel, and upcoming session schedule.
 */
import { useState, useEffect } from "react";
import { executeHttpGetRequest } from "@/api/commonServices";
import { API_PATHS } from "@/api/constants";
import {
  Users,
  TrendingUp,
  Star,
  DollarSign,
  UploadCloud,
  CheckCircle2,
  VideoOff,
  Copy,
  Eye,
  EyeOff,
  MessageSquare,
  Radio,
  Calendar,
  List,
  Grid,
  Bot,
} from "lucide-react";
import { Card, Button } from "@/components/ui";

const MentorDashboard = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [isStreamKeyVisible, setIsStreamKeyVisible] = useState(false);

  const fetchMyCourses = async () => {
    try {
      const response = await executeHttpGetRequest(API_PATHS.COURSES.MY_COURSES);
      if (response.data.success) {
        setCourses(response.data.data.courses || []);
      }
    } catch (error) {
      console.error("Failed to load mentor courses", error);
    }
  };

  useEffect(() => {

    fetchMyCourses();
  }, []);

  // Mock courses for UI mapping
  const placeholderCourses =
    courses.length > 0
      ? courses
      : [
          {
            courseId: 1,
            courseName: "UI/UX Psychology",
            status: "ACTIVE",
            _count: { enrollments: 4203 },
            rating: 4.8,
            updated: "2 days ago",
            color: "from-blue-600 to-blue-400",
          },
          {
            courseId: 2,
            courseName: "Data Structures Mastery",
            status: "DRAFT",
            _count: { enrollments: 0 },
            rating: null,
            updated: "1 week ago",
            color: "from-sky-600 to-sky-400",
          },
          {
            courseId: 3,
            courseName: "Cybersecurity Ethics",
            status: "ACTIVE",
            _count: { enrollments: 8192 },
            rating: 4.9,
            updated: "1 month ago",
            color: "from-indigo-600 to-indigo-400",
          },
        ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-slate-950 min-h-screen text-slate-300 font-sans">
      {/* Header */}
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-sky-300 mb-1 tracking-tight">
            Course Management
          </h1>
          <p className="text-slate-400">
            Welcome back! You have 3 draft courses to finalize.
          </p>
        </div>
        <Button
          onClick={() => (window.location.href = "/mentor/course/create")}
          className="flex items-center gap-2 shadow-[0_0_15px_rgba(37,99,235,0.4)] border-none"
        >
          + Create New Course
        </Button>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="flex items-center gap-4 shadow-lg relative group hover:border-blue-500/50 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] transition-all duration-300 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center shrink-0 border border-blue-500/20 group-hover:scale-110 transition-transform relative z-10">
            <Users className="w-6 h-6" />
          </div>
          <div className="relative z-10">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Total Enrollment
            </p>
            <h3 className="text-2xl font-bold text-slate-100 group-hover:text-blue-400 transition-colors">12,840</h3>
          </div>
        </Card>

        <Card className="flex items-center gap-4 shadow-lg relative group hover:border-sky-500/50 hover:shadow-[0_0_20px_rgba(56,189,248,0.15)] transition-all duration-300 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="absolute top-4 right-4 text-[10px] font-bold text-sky-400 bg-sky-500/10 px-1.5 py-0.5 rounded flex items-center gap-1 border border-sky-500/20 shadow-[0_0_5px_rgba(56,189,248,0.3)] z-10">
            <TrendingUp className="w-3 h-3" /> 12.4%
          </div>
          <div className="w-12 h-12 bg-sky-500/20 text-sky-400 rounded-xl flex items-center justify-center shrink-0 border border-sky-500/20 group-hover:scale-110 transition-transform relative z-10">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div className="relative z-10">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Avg. Completion
            </p>
            <h3 className="text-2xl font-bold text-slate-100 group-hover:text-sky-300 transition-colors">78.2%</h3>
          </div>
        </Card>

        <Card className="flex items-center gap-4 shadow-lg relative group hover:border-blue-400/50 hover:shadow-[0_0_20px_rgba(96,165,250,0.15)] transition-all duration-300 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="absolute top-4 right-4 text-[10px] font-bold text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded flex items-center gap-1 border border-blue-500/20 shadow-[0_0_5px_rgba(96,165,250,0.3)] z-10">
            <TrendingUp className="w-3 h-3" /> 2.1%
          </div>
          <div className="w-12 h-12 bg-blue-400/20 text-blue-400 rounded-xl flex items-center justify-center shrink-0 border border-blue-400/20 group-hover:scale-110 transition-transform relative z-10">
            <Star className="w-6 h-6" />
          </div>
          <div className="relative z-10">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Platform Rating
            </p>
            <h3 className="text-2xl font-bold text-slate-100 group-hover:text-blue-300 transition-colors">4.92</h3>
          </div>
        </Card>

        <Card className="flex items-center gap-4 shadow-lg relative group hover:border-sky-400/50 hover:shadow-[0_0_20px_rgba(56,189,248,0.15)] transition-all duration-300 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-sky-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="w-12 h-12 bg-sky-400/20 text-sky-400 rounded-xl flex items-center justify-center shrink-0 border border-sky-400/20 group-hover:scale-110 transition-transform relative z-10">
            <DollarSign className="w-6 h-6" />
          </div>
          <div className="relative z-10">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Total Revenue
            </p>
            <h3 className="text-2xl font-bold text-slate-100 group-hover:text-sky-300 transition-colors">₹42.4K</h3>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (Builder + List) */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          {/* Course Builder */}
          <Card className="!p-8 shadow-lg">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-bold text-slate-100">
                Course Builder
              </h2>
              <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-1 rounded uppercase tracking-wider border border-blue-500/20 shadow-[0_0_8px_rgba(59,130,246,0.3)]">
                In Progress
              </span>
            </div>

            {/* Stepper */}
            <div className="flex items-center justify-between mb-10 relative">
              <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-0.5 bg-slate-800 z-0"></div>
              <div className="absolute left-6 w-[33%] top-1/2 -translate-y-1/2 h-0.5 bg-gradient-to-r from-blue-500 to-sky-400 shadow-[0_0_5px_rgba(56,189,248,0.5)] z-0"></div>

              <div className="flex flex-col items-center gap-2 relative z-10">
                <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-sm shadow-[0_0_10px_rgba(59,130,246,0.6)]">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-blue-400">
                  Curriculum
                </span>
              </div>

              <div className="flex flex-col items-center gap-2 relative z-10">
                <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-sm shadow-[0_0_10px_rgba(59,130,246,0.6)] ring-4 ring-blue-500/20">
                  2
                </div>
                <span className="text-xs font-bold text-blue-400">
                  Media Assets
                </span>
              </div>

              <div className="flex flex-col items-center gap-2 relative z-10">
                <div className="w-10 h-10 rounded-full bg-slate-900 border-2 border-slate-700 text-slate-400 flex items-center justify-center font-bold text-sm">
                  3
                </div>
                <span className="text-xs font-bold text-slate-500">
                  Pricing
                </span>
              </div>

              <div className="flex flex-col items-center gap-2 relative z-10">
                <div className="w-10 h-10 rounded-full bg-slate-900 border-2 border-slate-700 text-slate-400 flex items-center justify-center font-bold text-sm">
                  4
                </div>
                <span className="text-xs font-bold text-slate-500">Review</span>
              </div>
            </div>

            {/* Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-2">
                    Module Title
                  </label>
                  <input
                    type="text"
                    value="Advanced Machine Learning Algorithms"
                    readOnly
                    className="w-full p-3 border border-slate-700 rounded-xl bg-slate-900/50 text-slate-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-2">
                    Description
                  </label>
                  <textarea
                    rows={4}
                    value="Deep dive into neural network architectures and backpropagation logic..."
                    readOnly
                    className="w-full p-3 border border-slate-700 rounded-xl bg-slate-900/50 text-slate-300 resize-none focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-colors custom-scrollbar"
                  ></textarea>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-400 mb-2">
                  Module Assets
                </label>
                <div className="border-2 border-dashed border-slate-700 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-800/50 hover:border-blue-500/50 transition-colors h-[120px] mb-4 group">
                  <UploadCloud className="w-8 h-8 text-slate-500 group-hover:text-blue-400 transition-colors mb-2" />
                  <p className="text-sm font-bold text-slate-300 group-hover:text-blue-300 transition-colors">
                    Drop video or slides here
                  </p>
                  <p className="text-xs text-slate-500">
                    Max size 2GB (MP4, PDF)
                  </p>
                </div>
                <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 p-3 rounded-xl text-sm font-medium text-blue-300 shadow-[0_0_10px_rgba(37,99,235,0.1)]">
                  <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0" />
                  <span className="truncate">
                    Lecture_01_Introduction.mp4 uploaded
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <Button
                variant="outline"
                className="px-8 rounded-xl font-semibold border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
              >
                Save Draft
              </Button>
              <Button className="px-8 rounded-xl font-semibold shadow-[0_0_15px_rgba(37,99,235,0.4)] border-none">
                Continue to Pricing
              </Button>
            </div>
          </Card>

          {/* Your Courses */}
          <Card className="!p-6 shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-100">Your Courses</h2>
              <div className="flex gap-2">
                <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/20">
                  <List className="w-4 h-4" />
                </button>
                <button className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800/80 border border-transparent hover:border-slate-700 transition-colors">
                  <Grid className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="w-full">
              <div className="grid grid-cols-12 gap-4 pb-3 border-b border-slate-800 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <div className="col-span-6">Course Name</div>
                <div className="col-span-2 text-center">Status</div>
                <div className="col-span-2 text-center">Enrolled</div>
                <div className="col-span-2 text-center">Rating</div>
              </div>

              <div className="flex flex-col gap-2 mt-2">
                {placeholderCourses.map((course: any, index: any) => (
                  <div
                    key={index}
                    onClick={() => window.location.href = `/mentor/course/edit/${course.courseId}`}
                    className="grid grid-cols-12 gap-4 items-center py-3 hover:bg-slate-800/40 rounded-xl px-2 transition-all duration-200 -mx-2 group hover:shadow-[0_0_10px_rgba(56,189,248,0.05)] cursor-pointer"
                  >
                    <div className="col-span-6 flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${course.color} shrink-0 flex items-center justify-center shadow-lg`}
                      >
                        <div className="w-5 h-5 bg-white/20 backdrop-blur-sm rounded"></div>
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-200 text-sm group-hover:text-blue-300 transition-colors">
                          {course.courseName}
                        </h4>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          Updated {course.updated}
                        </p>
                      </div>
                    </div>
                    <div className="col-span-2 flex justify-center">
                      <span
                        className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide border ${course.status === "ACTIVE" ? "bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-[0_0_5px_rgba(59,130,246,0.2)]" : "bg-slate-800/50 text-slate-400 border-slate-700"}`}
                      >
                        {course.status}
                      </span>
                    </div>
                    <div className="col-span-2 flex justify-center text-sm font-medium text-slate-300 group-hover:text-white transition-colors">
                      {course.status === "ACTIVE"
                        ? course._count.enrollments.toLocaleString()
                        : "0"}
                    </div>
                    <div className="col-span-2 flex justify-center items-center gap-1 text-sm font-medium text-slate-300 group-hover:text-white transition-colors">
                      {course.rating ? (
                        <>
                          <Star className="w-3.5 h-3.5 fill-sky-400 text-sky-400" />{" "}
                          {course.rating}
                        </>
                      ) : (
                        <span className="text-slate-500">--</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column (Live Session + Upcoming) */}
        <div className="flex flex-col gap-6">
          {/* Live Session Panel */}
          <Card className="!border-blue-500/30 !p-6 shadow-[0_0_30px_rgba(37,99,235,0.15)] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-colors duration-700"></div>

            <div className="flex justify-between items-center mb-6 relative z-10">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_5px_rgba(239,68,68,0.8)]"></div>
                <h2 className="text-lg font-bold text-slate-100">
                  Live Session
                </h2>
              </div>
              <span className="text-[10px] font-bold text-sky-400 bg-sky-500/10 px-2 py-1 rounded uppercase tracking-wider border border-sky-500/20">
                Ready
              </span>
            </div>

            <div className="bg-slate-950 rounded-xl aspect-video mb-6 flex flex-col items-center justify-center relative overflow-hidden shadow-inner border border-slate-800">
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: "radial-gradient(#38bdf8 1px, transparent 1px)",
                  backgroundSize: "15px 15px",
                }}
              ></div>
              <VideoOff className="w-10 h-10 text-slate-600 mb-3 relative z-10 group-hover:text-blue-500/50 transition-colors" />
              <p className="text-slate-500 text-sm font-medium relative z-10">
                Stream Preview Offline
              </p>
            </div>

            <div className="space-y-4 relative z-10">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Stream URL
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value="rtmp://live.Payilagam.ed"
                    className="flex-1 p-2.5 text-sm border border-slate-700 rounded-lg bg-slate-950/50 text-slate-300 font-mono focus:outline-none"
                  />
                  <button className="p-2.5 border border-slate-700 rounded-lg bg-slate-900 text-blue-400 hover:bg-slate-800 hover:text-blue-300 transition-colors">
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Stream Key
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type={isStreamKeyVisible ? "text" : "password"}
                    readOnly
                    value="1234567890123456"
                    className="flex-1 p-2.5 text-sm border border-blue-500/30 rounded-lg bg-blue-500/10 text-blue-300 font-mono focus:outline-none shadow-[0_0_10px_rgba(37,99,235,0.1)]"
                  />
                  <button 
                    onClick={() => setIsStreamKeyVisible(!isStreamKeyVisible)}
                    className="p-2.5 border border-blue-500/30 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors"
                  >
                    {isStreamKeyVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 border border-slate-700 bg-slate-900/50 rounded-xl hover:border-blue-500/30 transition-colors">
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-5 h-5 text-sky-400" />
                  <span className="font-bold text-sm text-slate-300">
                    Enable Chat
                  </span>
                </div>
                <div className="w-10 h-6 bg-blue-500 rounded-full relative cursor-pointer shadow-[0_0_8px_rgba(59,130,246,0.5)]">
                  <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1"></div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 border border-slate-700 bg-slate-900/50 rounded-xl hover:border-slate-600 transition-colors">
                <div className="flex items-center gap-3">
                  <Radio className="w-5 h-5 text-slate-500" />
                  <span className="font-bold text-sm text-slate-400">
                    Auto Recording
                  </span>
                </div>
                <div className="w-10 h-6 bg-slate-800 rounded-full relative cursor-pointer border border-slate-700">
                  <div className="w-4 h-4 bg-slate-500 rounded-full absolute left-1 top-1"></div>
                </div>
              </div>

              <Button className="w-full py-3.5 font-bold rounded-xl shadow-[0_0_15px_rgba(37,99,235,0.5)] transition-all hover:scale-[1.02] flex-center gap-2 border-none mt-2">
                <Radio className="w-5 h-5" /> GO LIVE NOW
              </Button>
            </div>
          </Card>

          {/* Upcoming Sessions */}
          <Card className="!p-6 shadow-lg hover:border-sky-500/30 transition-colors duration-300">
            <h2 className="text-lg font-bold text-slate-100 mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-sky-400" /> Upcoming Sessions
            </h2>

            <div className="space-y-4 mb-6">
              <div className="flex gap-4 group cursor-pointer p-2 -mx-2 hover:bg-slate-800/40 rounded-xl transition-colors">
                <div className="w-12 h-12 bg-sky-500/20 border border-sky-500/20 rounded-xl flex flex-col items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <span className="text-[10px] font-bold text-sky-400 uppercase">
                    Oct
                  </span>
                  <span className="text-lg font-bold text-sky-300 leading-none mt-0.5">
                    14
                  </span>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-slate-200 text-sm group-hover:text-sky-300 transition-colors">
                    Q&A: Neural Network
                  </h4>
                  <p className="text-[10px] text-slate-500 mt-1">
                    04:00 PM • 42 Registered
                  </p>
                </div>
              </div>

              <div className="flex gap-4 group cursor-pointer p-2 -mx-2 hover:bg-slate-800/40 rounded-xl transition-colors">
                <div className="w-12 h-12 bg-blue-500/20 border border-blue-500/20 rounded-xl flex flex-col items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <span className="text-[10px] font-bold text-blue-400 uppercase">
                    Oct
                  </span>
                  <span className="text-lg font-bold text-blue-300 leading-none mt-0.5">
                    17
                  </span>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-slate-200 text-sm group-hover:text-blue-300 transition-colors">
                    Guest Lecture: AI Eth
                  </h4>
                  <p className="text-[10px] text-slate-500 mt-1">
                    10:30 AM • 156 Registered
                  </p>
                </div>
              </div>
            </div>

            <button className="w-full py-2.5 border border-sky-500/50 text-sky-400 font-bold text-sm rounded-xl hover:bg-sky-500/10 transition-colors">
              Schedule New Session
            </button>
          </Card>
        </div>
      </div>

      {/* Floating AI Notification/Button */}
      <div className="fixed bottom-6 right-6 flex items-center gap-4 z-50">
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 shadow-[0_10px_30px_rgba(0,0,0,0.5)] rounded-xl p-3 flex items-center gap-3 animate-pulse">
          <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400 border border-blue-500/30">
            <UploadCloud className="w-4 h-4" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-200">
              Auto-save successful
            </p>
            <p className="text-[10px] text-slate-500">Course draft updated</p>
          </div>
          <div className="w-2 h-2 rounded-full bg-blue-400 ml-2 shadow-[0_0_5px_rgba(96,165,250,0.8)]"></div>
        </div>
        <Button className="w-14 h-14 rounded-full shadow-[0_0_20px_rgba(37,99,235,0.6)] flex-center transition-transform hover:scale-110 border-2 border-blue-400/50">
          <Bot className="w-6 h-6" />
        </Button>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.5);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(56, 189, 248, 0.2);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(56, 189, 248, 0.4);
        }
      `}</style>
    </div>
  );
};

export default MentorDashboard;


