/**
 * @fileoverview Course Catalog — Pro full-width redesign.
 */
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ALL_LABS } from "@/lib/labsData";
import toast from "react-hot-toast";
import {
  Search, ArrowRight, ChevronLeft, ChevronRight,
  Star, Clock, BookOpen, FileText, Video, FileIcon,
  Download, UploadCloud, Eye, Flag, Image as ImageIcon,
  Loader2, SlidersHorizontal, X, Check, Edit,
  Zap, Users,
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { usePublishedCourses } from "@/hooks";
import { executeHttpGetRequest, executeHttpPostRequest } from "@/api/commonServices";
import { API_PATHS } from "@/api/constants";
import { LabCard } from "@/components/LabCard";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
  Input, Label, Button,
} from "@/components/ui";
import { useSelector } from "react-redux";

/* ═══════════════════════════════════════════════════════════════════
   Course Card
═══════════════════════════════════════════════════════════════════ */
const CourseCard = ({ course, badge, currentUser }: any) => {
  const navigate = useNavigate();
  const canEdit =
    currentUser?.role === "admin" ||
    (currentUser?.role === "mentor" && course.mentorId === currentUser.userId);

  const levelColors: Record<string, string> = {
    Beginner: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
    Intermediate: "bg-amber-500/15 text-amber-400 border-amber-500/25",
    Advanced: "bg-rose-500/15 text-rose-400 border-rose-500/25",
  };
  const levelClass = levelColors[course.level] || "bg-blue-500/15 text-blue-400 border-blue-500/25";

  return (
    <Link
      to={`/courses/${course.uniqueId || course.courseId || course.id}`}
      className="group block h-full relative"
    >
      {canEdit && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            navigate(`/mentor/course/edit/${course.uniqueId || course.courseId || course.id}`);
          }}
          className="absolute top-3 right-3 z-30 bg-slate-900/90 hover:bg-blue-600 text-slate-300 hover:text-white p-2 rounded-full border border-slate-700/50 transition-all opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 shadow-lg cursor-pointer"
        >
          <Edit className="w-3.5 h-3.5" />
        </button>
      )}

      <div className="relative overflow-hidden rounded-2xl border border-slate-800/60 bg-slate-900/50 hover:border-blue-500/30 hover:bg-slate-900/80 transition-all duration-300 flex flex-col h-full group-hover:shadow-[0_8px_30px_rgba(59,130,246,0.1)]">
        {/* Thumbnail */}
        <div className="relative h-44 overflow-hidden rounded-t-2xl bg-slate-900">
          {badge && (
            <div className="absolute top-3 left-3 z-20 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-blue-600/90 text-white backdrop-blur-sm border border-blue-500/30 shadow-lg">
              {badge}
            </div>
          )}
          {course.thumbnail ? (
            <img
              src={course.thumbnail}
              alt=""
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-950/60 to-slate-900 flex items-center justify-center">
              <BookOpen className="w-12 h-12 text-blue-500/20" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/10 to-transparent opacity-80" />
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-1 -mt-6 relative z-10">
          <div className="flex items-center gap-2 mb-3">
            {course.level && (
              <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${levelClass}`}>
                {course.level}
              </span>
            )}
            {course.category?.name && (
              <span className="text-[10px] text-slate-500 font-semibold truncate">{course.category.name}</span>
            )}
          </div>

          <h3 className="font-bold text-slate-100 text-[14px] leading-snug mb-3 group-hover:text-blue-300 transition-colors line-clamp-2">
            {course.courseName}
          </h3>

          {/* Mentor row */}
          <div className="flex items-center gap-2 mb-4 mt-auto">
            <img
              src={course.mentor?.profileUrl || `https://i.pravatar.cc/150?u=${course.courseId || 10}`}
              alt=""
              className="w-7 h-7 rounded-full object-cover border border-slate-700"
            />
            <span className="text-[11px] text-slate-400 font-medium truncate">
              {course.mentor?.user?.fullName || course.mentor?.fullName || course.mentorName || "Expert Instructor"}
            </span>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3.5 border-t border-slate-800/60">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span className="text-slate-200">{course.averageRating || course.rating || "4.8"}</span>
              <span className="text-slate-500">({course._count?.enrollments || course.enrollments || 0})</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-blue-400">
              <Clock className="w-3.5 h-3.5" />
              {course.duration || 12}h
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   Resource Card
═══════════════════════════════════════════════════════════════════ */
const ResourceCard = ({ resource }: any) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isReporting, setIsReporting] = useState(false);
  const [reportReason, setReportReason] = useState("");

  const baseUrl = import.meta.env.VITE_API_URL?.split("/api")[0] || "http://localhost:5005";
  const fileUrl = `${baseUrl}${resource.fileUrl}`;

  const handleDownload = (e: React.SyntheticEvent<any>) => { e.stopPropagation(); window.open(fileUrl, "_blank"); };
  const handleReport = async () => {
    if (!reportReason) { toast.error("Please provide a reason"); return; }
    setIsReporting(true);
    try {
      await executeHttpPostRequest(API_PATHS.REPORTS.CREATE(resource.resourceId), { reason: reportReason });
      toast.success("Resource reported for review.");
      setReportReason("");
    } catch (error) {
      toast.error((error as import("axios").AxiosError<{ message?: string }>)?.response?.data?.message || "Failed to report");
    } finally { setIsReporting(false); }
  };

  const iconMap: Record<string, any> = {
    pdf: <FileText className="w-5 h-5 text-rose-400" />,
    video: <Video className="w-5 h-5 text-blue-400" />,
    image: <ImageIcon className="w-5 h-5 text-emerald-400" />,
    document: <FileText className="w-5 h-5 text-sky-400" />,
  };

  return (
    <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
      <DialogTrigger asChild>
        <div className="group relative rounded-2xl border border-slate-800/60 bg-slate-900/40 hover:border-blue-500/25 hover:bg-slate-900/70 p-5 cursor-pointer transition-all duration-200 flex flex-col overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/0 to-blue-600/0 group-hover:from-blue-600/4 transition-all rounded-2xl pointer-events-none" />
          <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700/60 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            {iconMap[resource.type] || <FileIcon className="w-5 h-5 text-slate-400" />}
          </div>
          <h4 className="font-bold text-[13px] mb-1.5 text-slate-100 group-hover:text-blue-300 transition-colors line-clamp-1">{resource.title}</h4>
          <p className="text-[11px] text-slate-500 mb-4 flex-1 line-clamp-2 leading-relaxed">{resource.description || "No description provided."}</p>
          <div className="flex items-center justify-between pt-3 border-t border-slate-800/60">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              {(resource.sizeBytes / (1024 * 1024)).toFixed(2)} MB
            </span>
            <div className="flex gap-1">
              <button onClick={(e: any) => { e.stopPropagation(); setIsPreviewOpen(true); }} className="p-1.5 rounded-lg hover:bg-blue-500/10 text-slate-500 hover:text-blue-400 transition-colors">
                <Eye className="w-3.5 h-3.5" />
              </button>
              <button onClick={handleDownload} className="p-1.5 rounded-lg hover:bg-blue-500/10 text-slate-500 hover:text-blue-400 transition-colors">
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </DialogTrigger>

      <DialogContent className="sm:max-w-5xl h-[90vh] flex flex-col p-0 overflow-hidden bg-slate-950 border-slate-800">
        <DialogHeader className="p-4 border-b border-slate-800 bg-slate-900/50 flex-row justify-between items-center space-y-0">
          <div>
            <DialogTitle className="text-base font-bold text-white flex items-center gap-2">
              {iconMap[resource.type]}
              {resource.title}
            </DialogTitle>
          </div>
          <div className="flex items-center gap-2 mr-10">
            <Dialog>
              <DialogTrigger asChild>
                <button className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-1.5 rounded-lg transition-colors">
                  <Flag className="w-3.5 h-3.5 text-slate-400" /> Report
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md bg-slate-900 border-slate-800">
                <DialogHeader>
                  <DialogTitle className="text-white">Report Resource</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  <Label className="text-slate-300">Reason for reporting</Label>
                  <Input value={reportReason} onChange={(e: any) => setReportReason(e.target.value)} placeholder="e.g., Inappropriate content..." className="mt-2 text-white focus:border-blue-500" />
                </div>
                <div className="flex justify-end gap-2">
                  <Button disabled={isReporting} onClick={handleReport}>{isReporting ? "Submitting..." : "Submit Report"}</Button>
                </div>
              </DialogContent>
            </Dialog>
            <Button onClick={handleDownload} variant="outline" className="h-8 text-xs bg-slate-800 border-slate-700 text-white hover:bg-slate-700">
              <Download className="w-3.5 h-3.5 mr-1.5" /> Download
            </Button>
          </div>
        </DialogHeader>
        <div className="flex-1 overflow-auto bg-slate-950 flex items-center justify-center p-4">
          {resource.type === "pdf" ? (
            <iframe src={fileUrl} className="w-full h-full rounded-md bg-slate-900" title={resource.title} />
          ) : resource.type === "video" ? (
            <video src={fileUrl} controls className="max-w-full max-h-full rounded-md shadow-2xl" />
          ) : resource.type === "image" ? (
            <img src={fileUrl} alt={resource.title} className="max-w-full max-h-full object-contain rounded-md shadow-2xl" />
          ) : (
            <div className="text-center text-slate-400">
              <FileIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="mb-4">Preview not available for this file type.</p>
              <Button onClick={handleDownload}>Download to view</Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   Course Section
═══════════════════════════════════════════════════════════════════ */
const CourseSection = ({ title, courses, badgeTemplate, headerExtra, onNext, onPrev, hasNext, hasPrev, showArrows = false, currentUser }: any) => (
  <div className="mb-12">
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-3">
        <h2 className="text-[17px] font-bold text-slate-100 tracking-tight">{title}</h2>
        {headerExtra}
      </div>
      {showArrows && (
        <div className="flex gap-1.5">
          <button onClick={onPrev} disabled={!hasPrev} className="disabled:opacity-30 disabled:cursor-not-allowed w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white hover:border-slate-700 transition-all flex items-center justify-center">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={onNext} disabled={!hasNext} className="disabled:opacity-30 disabled:cursor-not-allowed w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white hover:border-slate-700 transition-all flex items-center justify-center">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>

    {courses.length > 0 ? (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {courses.map((course: any, index: any) => (
          <CourseCard
            key={course.courseId || index}
            course={course}
            currentUser={currentUser}
            badge={index === 0 ? badgeTemplate : null}
          />
        ))}
      </div>
    ) : (
      <div className="rounded-2xl border border-dashed border-slate-700/60 bg-slate-900/30 p-10 flex flex-col items-center justify-center text-center">
        <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4">
          <BookOpen className="w-6 h-6 text-blue-400/60" />
        </div>
        <h3 className="text-[14px] font-bold text-slate-300 mb-1">New content arriving soon!</h3>
        <p className="text-[12px] text-slate-500 max-w-xs">Our expert mentors are crafting new material for this category.</p>
      </div>
    )}
  </div>
);

/* ═══════════════════════════════════════════════════════════════════
   Main Catalog
═══════════════════════════════════════════════════════════════════ */
const CourseCatalog = () => {
  const queryClient = useQueryClient();
  const { user } = useSelector((state: any) => (state as any).auth as any);

  const [searchTerm, setSearchTerm] = useState("");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<{ categories: string[]; level: string[]; price: number }>({ categories: [], level: [], price: 500 });
  const [viewAll, setViewAll] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<any>(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadDesc, setUploadDesc] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const hasActiveFilters = searchTerm.trim().length > 0 || filters.categories.length > 0 || filters.level.length > 0;
  const showPaginatedList = hasActiveFilters || viewAll;

  const { data: responseData, isLoading, isError } = usePublishedCourses({
    search: searchTerm,
    categorySlug: filters.categories.length > 0 ? filters.categories.map((c: any) => c.toLowerCase().replace(/ /g, "-")) : undefined,
    level: filters.level.length > 0 ? filters.level : undefined,
    page,
    limit: showPaginatedList ? 12 : 50,
  });
  const fetchedCourses = responseData?.data?.data || [];
  const paginationMeta = responseData?.data?.pagination || { total: fetchedCourses.length, limit: 12, page: 1, totalPages: 1 };

  const { data: resourcesRes, isLoading: resLoading } = useQuery({
    queryKey: ["resources"],
    queryFn: () => executeHttpGetRequest(API_PATHS.RESOURCES.BASE),
  });
  const freeResources = resourcesRes?.data?.data || [];

  const webCourses = fetchedCourses.filter((c: any) => { const s = `${c.category?.slug} ${c.courseName}`.toLowerCase(); return s.includes("web") || s.includes("react") || s.includes("node") || s.includes("html"); }).slice(0, 3);
  const dataCourses = fetchedCourses.filter((c: any) => { const s = `${c.category?.slug} ${c.courseName}`.toLowerCase(); return s.includes("data") || s.includes("python") || s.includes("ai") || s.includes("machine learning"); }).slice(0, 3);
  const cloudCourses = fetchedCourses.filter((c: any) => { const s = `${c.category?.slug} ${c.courseName}`.toLowerCase(); return s.includes("cloud") || s.includes("aws") || s.includes("azure") || s.includes("devops"); }).slice(0, 3);
  const trendingCourses = fetchedCourses.length > 0 ? fetchedCourses.slice(0, 3) : [];

  const uniqueMentorsMap = new Map();
  fetchedCourses.forEach((c: any) => {
    if (c.mentor && !uniqueMentorsMap.has(c.mentor.userId)) {
      uniqueMentorsMap.set(c.mentor.userId, {
        name: c.mentor.fullName || c.mentor.userName,
        src: c.mentor.profileUrl || `https://i.pravatar.cc/150?u=${c.mentor.userId}`,
        title: "Expert Instructor",
        rating: c.averageRating || "4.8",
        tags: [c.category?.name || "Tech", "Verified"],
      });
    }
  });
  const mentors = Array.from(uniqueMentorsMap.values()).slice(0, 3);

  const handleFileChange = (e: React.SyntheticEvent<any>) => {
    if ((e.target as HTMLInputElement).files?.[0]) setUploadFile((e.target as HTMLInputElement).files?.[0]);
  };

  const handleUploadSubmit = async () => {
    if (!user) { toast.error("Please login to upload resources"); return; }
    if (!uploadFile || !uploadTitle) { toast.error("File and title are required."); return; }
    const formData = new FormData();
    formData.append("resourceFile", uploadFile);
    formData.append("title", uploadTitle);
    formData.append("description", uploadDesc);
    formData.append("category", "General");
    setIsUploading(true);
    try {
      await executeHttpPostRequest(API_PATHS.RESOURCES.BASE, formData, true);
      toast.success("Resource uploaded successfully!");
      setIsUploadModalOpen(false);
      setUploadFile(null); setUploadTitle(""); setUploadDesc("");
      queryClient.invalidateQueries({ queryKey: ["resources"] });
    } catch (error) {
      toast.error((error as import("axios").AxiosError<{ message?: string }>)?.response?.data?.message || "Upload failed.");
    } finally { setIsUploading(false); }
  };

  const handleClearFilters = () => { setSearchTerm(""); setFilters({ categories: [], level: [], price: 500 }); setPage(1); setViewAll(false); };

  return (
    <div className="min-h-full w-full bg-[var(--bg-base)] text-slate-100">

      {/* ── HERO HEADER ── */}
      <div className="relative overflow-hidden border-b border-slate-800/60">
        <div className="absolute -top-20 left-1/4 w-96 h-64 bg-blue-600/6 rounded-full blur-[100px] pointer-events-none" />
        <div className="px-8 py-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-blue-400 mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                Course Library
              </div>
              <h1 className="text-[26px] font-extrabold text-slate-100 tracking-tight leading-tight mb-1">
                Discover Your Potential
              </h1>
              <p className="text-[13px] text-slate-400 max-w-2xl leading-relaxed">
                Premium specialized courses, world-class mentors, and free community resources.
              </p>
            </div>
            {/* Search bar (desktop hero) */}
            <div className="w-full md:w-80 relative group shrink-0">
              <Search className="w-4 h-4 text-slate-500 group-focus-within:text-blue-400 transition-colors absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e: any) => { setSearchTerm(e.target.value); if (e.target.value) setViewAll(true); }}
                className="w-full pl-10 pr-4 py-3 bg-slate-900/60 border border-slate-700/60 rounded-2xl text-[13px] text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 transition-all"
              />
            </div>
          </div>

          {/* Active filter chips */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2 mt-4 flex-wrap">
              {searchTerm && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-400 text-[11px] font-semibold">
                  "{searchTerm}"
                  <button onClick={() => setSearchTerm("")} className="hover:text-white"><X className="w-3 h-3" /></button>
                </span>
              )}
              {filters.level.map((l) => (
                <span key={l} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400 text-[11px] font-semibold">
                  {l}
                  <button onClick={() => setFilters((p: any) => ({ ...p, level: p.level.filter((x: string) => x !== l) }))} className="hover:text-white"><X className="w-3 h-3" /></button>
                </span>
              ))}
              <button onClick={handleClearFilters} className="text-[11px] text-slate-500 hover:text-slate-300 underline transition-colors">Clear all</button>
            </div>
          )}
        </div>
      </div>

      {/* ── BODY: Sidebar + Content ── */}
      <div className="flex">

        {/* Mobile filter toggle */}
        <div className="fixed bottom-6 right-6 z-40 lg:hidden">
          <button
            onClick={() => setShowMobileFilters(true)}
            className="flex items-center gap-2 px-4 py-3 bg-blue-600 text-white text-[13px] font-bold rounded-2xl shadow-lg shadow-blue-500/30"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters {hasActiveFilters && `(${filters.level.length + filters.categories.length})`}
          </button>
        </div>

        {/* ── SIDEBAR ── */}
        <aside className={`
          fixed inset-0 z-50 lg:relative lg:z-10 lg:block
          ${showMobileFilters ? "block" : "hidden"}
          lg:w-60 lg:shrink-0
        `}>
          {/* Mobile overlay */}
          <div className="lg:hidden absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowMobileFilters(false)} />

          <div className="relative lg:static h-full lg:h-auto w-72 lg:w-auto bg-slate-950 lg:bg-transparent border-r border-slate-800/60 lg:border-none overflow-y-auto p-6 lg:px-6 lg:py-8 sticky top-0 max-h-screen">
            <div className="flex items-center justify-between mb-6 lg:hidden">
              <h2 className="text-[15px] font-bold text-slate-100">Filters</h2>
              <button onClick={() => setShowMobileFilters(false)} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-7">
              {/* Categories */}
              <div>
                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <SlidersHorizontal className="w-3.5 h-3.5" /> Categories
                </h3>
                <div className="flex flex-col gap-1">
                  {["Web Dev", "Data Science", "Cloud", "Mobile", "AI"].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setFilters((p: any) => ({ ...p, categories: p.categories.includes(cat) ? p.categories.filter((c: any) => c !== cat) : [...p.categories, cat] }))}
                      className={`flex items-center justify-between w-full px-3 py-2 rounded-xl text-[12.5px] font-semibold transition-all text-left ${
                        filters.categories.includes(cat)
                          ? "bg-blue-500/15 text-blue-400 border border-blue-500/25"
                          : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 border border-transparent"
                      }`}
                    >
                      {cat}
                      {filters.categories.includes(cat) && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Level */}
              <div>
                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Star className="w-3.5 h-3.5" /> Level
                </h3>
                <div className="flex flex-col gap-1">
                  {["Beginner", "Intermediate", "Advanced"].map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => setFilters((p: any) => ({ ...p, level: p.level.includes(lvl) ? p.level.filter((l: any) => l !== lvl) : [...p.level, lvl] }))}
                      className={`flex items-center justify-between w-full px-3 py-2 rounded-xl text-[12.5px] font-semibold transition-all text-left ${
                        filters.level.includes(lvl)
                          ? "bg-blue-500/15 text-blue-400 border border-blue-500/25"
                          : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 border border-transparent"
                      }`}
                    >
                      {lvl}
                      {filters.level.includes(lvl) && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              </div>

              {hasActiveFilters && (
                <button onClick={handleClearFilters} className="w-full py-2 rounded-xl border border-slate-700/60 text-[12px] font-semibold text-slate-400 hover:text-slate-200 hover:border-slate-600 transition-colors">
                  Clear all filters
                </button>
              )}
            </div>
          </div>
        </aside>

        {/* ── MAIN CONTENT ── */}
        <main className="flex-1 min-w-0 px-8 py-8">

          {/* Labs section - always show when no filter active */}
          {!showPaginatedList && (
            <div className="mb-12">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <div className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5" /> Hands-On Learning
                  </div>
                  <h2 className="text-[17px] font-bold text-slate-100">Payilagam Labs</h2>
                </div>
                <Link to="/labs" className="text-[12px] font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors">
                  Explore all <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {ALL_LABS.slice(0, 3).map((lab: any) => <LabCard key={lab.id} lab={lab} />)}
              </div>
            </div>
          )}

          {/* Loading */}
          {isLoading && (
            <div className="flex justify-center my-12">
              <div className="w-8 h-8 border-2 border-blue-900 border-t-blue-500 rounded-full animate-spin" />
            </div>
          )}

          {/* Error */}
          {isError && (
            <div className="bg-rose-500/8 text-rose-400 p-4 rounded-2xl text-[13px] font-medium text-center mb-10 border border-rose-500/20">
              Failed to load courses. Please try again later.
            </div>
          )}

          {/* Course Sections */}
          {showPaginatedList ? (
            <CourseSection
              title={hasActiveFilters ? `Search Results (${fetchedCourses.length} of ${paginationMeta.total})` : `All Courses (${fetchedCourses.length} of ${paginationMeta.total})`}
              courses={fetchedCourses}
              currentUser={user}
              badgeTemplate={hasActiveFilters ? "Match" : "Course"}
              showArrows={true}
              onNext={() => setPage((p: any) => p + 1)}
              onPrev={() => setPage((p: any) => Math.max(1, p - 1))}
              hasNext={page < paginationMeta.totalPages}
              hasPrev={page > 1}
              headerExtra={
                <button onClick={handleClearFilters} className="text-[11px] font-semibold text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1">
                  <X className="w-3 h-3" /> Clear
                </button>
              }
            />
          ) : (
            <>
              <CourseSection
                title="Trending Courses" courses={trendingCourses} currentUser={user} badgeTemplate="Bestseller"
                hasNext={false} hasPrev={false} onNext={() => {}} onPrev={() => {}} showArrows={false}
                headerExtra={<button onClick={() => { setFilters({ categories: [], level: [], price: 500 }); setViewAll(true); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="text-[11px] font-semibold text-blue-400 hover:text-blue-300 transition-colors">View All</button>}
              />
              <CourseSection
                title="Web Development" courses={webCourses} currentUser={user} badgeTemplate="New"
                hasNext={false} hasPrev={false} onNext={() => {}} onPrev={() => {}} showArrows={false}
                headerExtra={<button onClick={() => { setFilters((p: any) => ({ ...p, categories: ["Web Development"] })); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="text-[11px] font-semibold text-blue-400 hover:text-blue-300 transition-colors">View All</button>}
              />
              <CourseSection
                title="Data Science & AI" courses={dataCourses} currentUser={user} badgeTemplate="Hot"
                hasNext={false} hasPrev={false} onNext={() => {}} onPrev={() => {}} showArrows={false}
                headerExtra={<button onClick={() => { setFilters((p: any) => ({ ...p, categories: ["Data Science", "AI & Machine Learning"] })); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="text-[11px] font-semibold text-blue-400 hover:text-blue-300 transition-colors">View All</button>}
              />
              <CourseSection
                title="Cloud Computing" courses={cloudCourses} currentUser={user} badgeTemplate="Popular"
                hasNext={false} hasPrev={false} onNext={() => {}} onPrev={() => {}} showArrows={false}
                headerExtra={<button onClick={() => { setFilters((p: any) => ({ ...p, categories: ["DevOps"] })); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="text-[11px] font-semibold text-blue-400 hover:text-blue-300 transition-colors">View All</button>}
              />
            </>
          )}

          {/* Free Resources */}
          {!hasActiveFilters && (
            <>
              <div className="mb-12">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="text-[17px] font-bold text-slate-100 mb-0.5">Free Learning Resources</h2>
                    <p className="text-[12px] text-slate-500">Community-contributed PDFs, images, and videos</p>
                  </div>
                  <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
                    <DialogTrigger asChild>
                      <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/25 text-blue-400 text-[12px] font-semibold rounded-xl transition-all cursor-pointer">
                        <UploadCloud className="w-4 h-4" /> Upload Resource
                      </button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md bg-slate-900 border-slate-800">
                      <DialogHeader>
                        <DialogTitle className="text-[17px] font-bold text-white">Upload a Resource</DialogTitle>
                        <p className="text-[12px] text-slate-400 mt-1">Share your knowledge with the community (PDF, Image, Video, Word, Excel).</p>
                      </DialogHeader>
                      <div className="space-y-5 py-5">
                        <div className="relative border-2 border-dashed border-slate-700/60 hover:border-blue-500/40 rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-colors cursor-pointer bg-slate-950/50 group">
                          <input type="file" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept=".pdf,image/*,video/*,.doc,.docx,.xls,.xlsx" />
                          <div className="w-12 h-12 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-500/10 group-hover:border-blue-500/30 transition-colors">
                            <UploadCloud className="w-6 h-6 text-slate-500 group-hover:text-blue-400 transition-colors" />
                          </div>
                          <h4 className="text-[13px] font-bold text-slate-200 mb-1">{uploadFile ? uploadFile.name : "Click to upload or drag and drop"}</h4>
                          <p className="text-[11px] text-slate-500">PDF, JPG, PNG, GIF, MP4, DOC, XLS (max. 500MB)</p>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="title" className="text-[12px] font-bold text-slate-300">Resource Title</Label>
                            <Input id="title" value={uploadTitle} onChange={(e: any) => setUploadTitle(e.target.value)} placeholder="e.g., React Architecture Guide" className="mt-1.5 text-[13px] text-slate-200 focus:border-blue-500" />
                          </div>
                          <div>
                            <Label htmlFor="desc" className="text-[12px] font-bold text-slate-300">Description</Label>
                            <Input id="desc" value={uploadDesc} onChange={(e: any) => setUploadDesc(e.target.value)} placeholder="Briefly describe what this resource contains..." className="mt-1.5 text-[13px] text-slate-200 focus:border-blue-500" />
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                        <Button variant="outline" onClick={() => setIsUploadModalOpen(false)} className="h-10 text-[12px] px-4 rounded-xl bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800">Cancel</Button>
                        <Button onClick={handleUploadSubmit} disabled={isUploading} className="h-10 text-[12px] px-6 rounded-xl font-bold">{isUploading ? "Uploading..." : "Upload File"}</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                {resLoading ? (
                  <div className="flex justify-center my-8"><Loader2 className="w-6 h-6 animate-spin text-blue-500" /></div>
                ) : freeResources.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                    {freeResources.map((res: any) => <ResourceCard key={res.resourceId} resource={res} />)}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-700/60 bg-slate-900/30 p-10 flex flex-col items-center text-center">
                    <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mb-4">
                      <FileIcon className="w-6 h-6 text-slate-500" />
                    </div>
                    <p className="text-[14px] font-bold text-slate-300">No resources available yet</p>
                    <p className="text-[12px] text-slate-500 mt-1 max-w-xs">Be the first to upload and share knowledge with the community.</p>
                  </div>
                )}
              </div>

              {/* Top Mentors */}
              <div className="mb-12">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="text-[17px] font-bold text-slate-100 mb-0.5">Connect with Top Mentors</h2>
                    <p className="text-[12px] text-slate-500">Get 1-on-1 guidance from industry leaders</p>
                  </div>
                  <button className="px-4 py-2 bg-slate-900 border border-slate-800 text-slate-300 text-[12px] font-semibold rounded-xl hover:bg-slate-800 hover:text-white transition-colors">
                    Apply as Mentor
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {mentors.length > 0 ? (
                    mentors.map((mentor: any, i: number) => (
                      <div key={i} className="flex items-center gap-4 p-4 rounded-2xl border border-slate-800/60 bg-slate-900/40 hover:border-blue-500/25 hover:bg-slate-900/70 transition-all cursor-pointer group">
                        <div className="relative shrink-0">
                          <img src={mentor.src} alt={mentor.name} className="w-14 h-14 rounded-2xl object-cover border border-slate-700 group-hover:border-blue-500/40 transition-colors" />
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-slate-900 rounded-full" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <h4 className="font-bold text-[13px] truncate text-slate-100 group-hover:text-blue-300 transition-colors">{mentor.name}</h4>
                            <div className="flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-1.5 py-0.5 rounded-full shrink-0 ml-2">
                              <Star className="w-3 h-3 fill-amber-400" /> {mentor.rating}
                            </div>
                          </div>
                          <p className="text-[11px] text-slate-500 mb-2 truncate">{mentor.title}</p>
                          <div className="flex gap-1.5 overflow-hidden">
                            {mentor.tags.map((tag: any) => (
                              <span key={tag} className="text-[9px] font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full uppercase tracking-wide shrink-0">{tag}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-3 rounded-2xl border border-dashed border-slate-700/60 bg-slate-900/30 p-10 flex flex-col items-center text-center">
                      <Users className="w-10 h-10 text-slate-600 mb-3" />
                      <p className="text-[14px] font-bold text-slate-400">Mentors will appear here as courses are added</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default CourseCatalog;
