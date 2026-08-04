/**
 * @fileoverview Course Catalog / Browse page for Payilagam.
 * Added file upload logic, preview modals, reporting, and creative empty states.
 * Updated to Midnight Blue Dark Theme with left sidebar filters and glassmorphism.
 */
import { Card } from "@/components/ui/Card";
import { useState } from "react";
import { Link } from "react-router-dom";
import { ALL_LABS } from "@/lib/labsData";
import toast from "react-hot-toast";
import {
  Search,
  Filter,
  // Code2,
  // Cpu,
  // Calculator,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Star,
  Clock,
  BookOpen,
  FileText,
  Video,
  FileIcon,
  Download,
  UploadCloud,
  Eye,
  Flag,
  Image as ImageIcon,
  Loader2,
  SlidersHorizontal,
  X,
  Check,
  Edit,
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { usePublishedCourses } from "@/hooks";
import {
  executeHttpGetRequest,
  executeHttpPostRequest,
} from "@/api/commonServices";
import { API_PATHS } from "@/api/constants";
// import { ALL_LABS } from "@/lib/labsData";
import { LabCard } from "@/components/LabCard";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Label,
  Button,
} from "@/components/ui";
import { useSelector } from "react-redux";

const CourseCard = ({ course, badge, badgeColor, currentUser }: any) => {
  const canEdit =
    currentUser?.role === "admin" ||
    (currentUser?.role === "mentor" && course.mentorId === currentUser.userId);

  return (
    <Link
      to={`/courses/${course.uniqueId || course.courseId || course.id}`}
      className="group block h-full relative"
    >
      {canEdit && (
        <button
          onClick={(event: React.SyntheticEvent<any>) => {
            event.preventDefault();
            event.stopPropagation();
            window.location.href = `/mentor/course/edit/${course.uniqueId || course.courseId || course.id}`;
          }}
          className="absolute top-3 right-3 z-30 bg-slate-900/80 hover:bg-blue-600 text-slate-300 hover:text-white p-2.5 rounded-full backdrop-blur-md border border-slate-700/50 transition-all shadow-[0_4px_12px_rgba(0,0,0,0.5)] opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0"
          title="Edit Course"
        >
          <Edit className="w-4 h-4" />
        </button>
      )}
      <Card className="overflow-hidden flex flex-col h-full !p-0 border-slate-800/50 hover:border-blue-500/50">
        <div className="relative h-44 overflow-hidden flex items-center justify-center rounded-t-md">
          <div
            className={`absolute inset-0 opacity-20 mix-blend-overlay ${badgeColor || "bg-blue-500"}`}
          ></div>
          {badge && (
            <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded text-[10px] font-bold text-slate-100 uppercase tracking-wide border border-slate-700/50 z-20 shadow-lg">
              {badge}
            </div>
          )}
          {course.thumbnail ? (
            <img
              src={course.thumbnail}
              alt=""
              className="w-full h-full object-cover relative z-10 transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-slate-900/50 flex items-center justify-center relative z-10">
              <BookOpen className="w-12 h-12 text-slate-500/50" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-90 z-10"></div>
        </div>

        <div className="p-5 flex flex-col flex-1 relative z-20 -mt-12 bg-transparent">
          <h3 className="font-bold text-slate-100 text-base leading-snug mb-3 group-hover:text-blue-400 transition-colors line-clamp-2 drop-shadow-md">
            {course.courseName}
          </h3>

          <div className="flex items-center gap-3 mb-5 mt-auto">
            <div className="w-8 h-8 rounded-full bg-slate-800 overflow-hidden shrink-0 border border-slate-600 shadow-sm">
              <img
                src={
                  course.mentorImg ||
                  `https://i.pravatar.cc/150?u=${course.courseId || 10}`
                }
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-xs text-slate-300 font-medium tracking-wide">
              {course.mentor?.user?.fullName ||
                course.mentor?.fullName ||
                course.mentorName ||
                "Expert Instructor"}
            </span>
          </div>

          <div className="flex justify-between items-center text-xs pt-4 border-t border-slate-800/50 mt-auto">
            <div className="flex items-center gap-1.5 font-semibold bg-slate-900/50 px-2.5 py-1 rounded-md border border-slate-800">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
              <span className="text-slate-200">
                {course.averageRating || course.rating || "4.8"}
              </span>
              <span className="text-slate-500 font-medium">
                ({course._count?.enrollments || course.enrollments || 120})
              </span>
            </div>
            <div className="flex items-center gap-1.5 font-semibold text-slate-300 bg-blue-500/10 px-2.5 py-1 rounded-md border border-blue-500/20">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              {course.duration || 12}h
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
};

const ResourceCard = ({ resource }: any) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isReporting, setIsReporting] = useState(false);
  const [reportReason, setReportReason] = useState("");

  const baseUrl =
    import.meta.env.VITE_API_URL?.split("/api")[0] || "http://localhost:5000";
  const fileUrl = `${baseUrl}${resource.fileUrl}`;

  const handleDownload = (event: React.SyntheticEvent<any>) => {
    event.stopPropagation();
    window.open(fileUrl, "_blank");
  };

  const handleReport = async () => {
    if (!reportReason) {
      toast.error("Please provide a reason");
      return;
    }
    setIsReporting(true);
    try {
      await executeHttpPostRequest(
        API_PATHS.REPORTS.CREATE(resource.resourceId),
        { reason: reportReason },
      );
      toast.success("Resource reported for review.");
      setReportReason("");
    } catch (error) {
      toast.error(
        (error as import("axios").AxiosError<{ message?: string }>)?.response
          ?.data?.message || "Failed to report",
      );
    } finally {
      setIsReporting(false);
    }
  };

  return (
    <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
      <DialogTrigger asChild>
        <Card className="shadow-sm hover:shadow-lg hover:shadow-blue-900/10 transition-all flex flex-col group cursor-pointer hover:border-blue-500/50 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

          <div className="flex-center w-12 h-12 rounded-lg mb-4 bg-slate-800 text-blue-400 group-hover:scale-110 group-hover:bg-blue-500/20 transition-all duration-300 relative z-10 border border-slate-700/50">
            {resource.type === "pdf" ? (
              <FileText className="icon-lg text-rose-400" />
            ) : resource.type === "video" ? (
              <Video className="icon-lg text-blue-400" />
            ) : resource.type === "image" ? (
              <ImageIcon className="icon-lg text-emerald-400" />
            ) : resource.type === "document" ? (
              <FileText className="icon-lg text-sky-400" />
            ) : (
              <FileIcon className="icon-lg text-slate-400" />
            )}
          </div>
          <h4 className="font-bold text-sm mb-1 text-slate-100 group-hover:text-blue-400 transition-colors line-clamp-1 relative z-10">
            {resource.title}
          </h4>
          <p className="text-[11px] text-slate-400 mb-4 flex-1 line-clamp-2 leading-relaxed relative z-10">
            {resource.description || "No description provided."}
          </p>
          <div className="flex-between border-t border-slate-800 pt-3 mt-auto relative z-10">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-950 px-2 py-1 rounded border border-slate-800">
              {(resource.sizeBytes / (1024 * 1024)).toFixed(2)} MB
            </span>
            <div className="flex gap-1">
              <button
                onClick={(event: React.SyntheticEvent<any>) => {
                  event.stopPropagation();
                  setIsPreviewOpen(true);
                }}
                className="text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 p-1.5 rounded-md transition-colors"
                title="Preview"
              >
                <Eye className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleDownload}
                className="text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 p-1.5 rounded-md transition-colors"
                title="Download"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </Card>
      </DialogTrigger>

      <DialogContent className="sm:max-w-5xl h-[90vh] flex flex-col p-0 overflow-hidden bg-slate-950 border-slate-800">
        <DialogHeader className="p-4 border-b border-slate-800 bg-slate-900/50 flex-row justify-between items-center space-y-0">
          <div>
            <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
              {resource.type === "pdf" && (
                <FileText className="icon-md text-rose-400" />
              )}
              {resource.type === "video" && (
                <Video className="icon-md text-blue-400" />
              )}
              {resource.type === "image" && (
                <ImageIcon className="icon-md text-emerald-400" />
              )}
              {resource.type === "document" && (
                <FileText className="icon-md text-sky-400" />
              )}
              {resource.title}
            </DialogTitle>
          </div>
          <div className="flex items-center gap-2 mr-10">
            <Dialog>
              <DialogTrigger asChild>
                <button className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-1.5 rounded-md transition-colors">
                  <Flag className="w-3.5 h-3.5 text-slate-400" /> Report
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md bg-slate-900 border-slate-800">
                <DialogHeader>
                  <DialogTitle className="text-white">
                    Report Resource
                  </DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  <Label className="text-slate-300">Reason for reporting</Label>
                  <Input
                    value={reportReason}
                    onChange={(event: React.SyntheticEvent<any>) =>
                      setReportReason((event.target as HTMLInputElement).value)
                    }
                    placeholder="e.g., Inappropriate content, copyright infringement..."
                    className="mt-2 text-white focus:border-blue-500"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button disabled={isReporting} onClick={handleReport}>
                    {isReporting ? "Submitting..." : "Submit Report"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <Button
              onClick={handleDownload}
              variant="outline"
              className="h-8 text-xs bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
            >
              <Download className="icon-base mr-1.5" /> Download
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto bg-slate-950 flex items-center justify-center p-4">
          {resource.type === "pdf" ? (
            <iframe
              src={fileUrl}
              className="w-full h-full rounded-md bg-slate-900"
              title={resource.title}
            />
          ) : resource.type === "video" ? (
            <video
              src={fileUrl}
              controls
              className="max-w-full max-h-full rounded-md shadow-2xl"
            />
          ) : resource.type === "image" ? (
            <img
              src={fileUrl}
              alt={resource.title}
              className="max-w-full max-h-full object-contain rounded-md shadow-2xl"
            />
          ) : (
            <div className="text-center text-slate-400">
              <FileIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Preview not available for this file type.</p>
              <Button onClick={handleDownload}>Download to view</Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

const CourseSection = ({
  title,
  courses,
  badgeTemplate,
  headerExtra,
  onNext,
  onPrev,
  hasNext,
  hasPrev,
  showArrows = false,
  currentUser,
}: any) => (
  <div className="mb-12">
    <div className="flex justify-between items-center mb-6">
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-bold text-white tracking-tight">{title}</h2>
        {headerExtra}
      </div>
      {showArrows && (
        <div className="flex gap-2">
          <button
            onClick={onPrev}
            disabled={!hasPrev}
            className="disabled:opacity-50 disabled:cursor-not-allowed flex-center w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white hover:border-slate-700 transition-all"
          >
            <ChevronLeft className="icon-base" />
          </button>
          <button
            onClick={onNext}
            disabled={!hasNext}
            className="disabled:opacity-50 disabled:cursor-not-allowed flex-center w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white hover:border-slate-700 transition-all"
          >
            <ChevronRight className="icon-base" />
          </button>
        </div>
      )}
    </div>
    {courses.length > 0 ? (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
        {courses.map((course: any, index: any) => (
          <CourseCard
            key={course.courseId || index}
            course={course}
            currentUser={currentUser}
            badge={index === 0 ? badgeTemplate : null}
            badgeColor={
              ["bg-blue-500", "bg-sky-400", "bg-blue-500", "bg-sky-500"][
                index % 4
              ]
            }
          />
        ))}
      </div>
    ) : (
      <div className="w-full bg-gradient-to-br from-slate-900 to-blue-950 border border-slate-800 rounded-xl p-10 flex flex-col sm:flex-row items-center justify-center gap-6 overflow-hidden relative">
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-blue-900/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-blue-900/30 rounded-full blur-3xl"></div>
        <img
          src="/assets/images/no-data.png"
          alt="No courses"
          className="w-32 h-32 object-contain z-10 opacity-80"
          onError={(event: any) => (event.target.style.display = "none")}
        />
        <div className="text-center sm:text-left z-10">
          <h3 className="text-lg font-bold text-slate-100 mb-1">
            New content arriving soon!
          </h3>
          <p className="text-sm text-slate-400 font-medium max-w-sm">
            We couldn't find any courses matching this category right now. Our
            expert mentors are crafting new material.
          </p>
        </div>
      </div>
    )}
  </div>
);

const CourseCatalog = () => {
  // const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useSelector((state: any) => (state as any).auth as any);

  const [searchTerm, setSearchTerm] = useState("");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<{
    categories: string[];
    level: string[];
    price: number;
  }>({
    categories: [],
    level: [],
    price: 500,
  });
  const [viewAll, setViewAll] = useState(false);

  const handleClearFilters = () => {
    setSearchTerm("");
    setFilters({ categories: [], level: [], price: 500 });
    setPage(1);
    setViewAll(false);
  };

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<any>(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadDesc, setUploadDesc] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const hasActiveFilters =
    searchTerm.trim().length > 0 ||
    filters.categories.length > 0 ||
    filters.level.length > 0;
  const showPaginatedList = hasActiveFilters || viewAll;

  const {
    data: responseData,
    isLoading,
    isError,
  } = usePublishedCourses({
    search: searchTerm,
    categorySlug:
      filters.categories.length > 0
        ? filters.categories.map((c: any) => c.toLowerCase().replace(/ /g, "-"))
        : undefined,
    level: filters.level.length > 0 ? filters.level : undefined,
    page: page,
    limit: showPaginatedList ? 12 : 50, // Fetch more if on main page for category slices
  });
  const fetchedCourses = responseData?.data?.data || [];
  const paginationMeta = responseData?.data?.pagination || {
    total: fetchedCourses.length,
    limit: 12,
    page: 1,
    totalPages: 1,
  };

  const { data: resourcesRes, isLoading: resLoading } = useQuery({
    queryKey: ["resources"],
    queryFn: () => executeHttpGetRequest(API_PATHS.RESOURCES.BASE),
  });
  const freeResources = resourcesRes?.data?.data || [];

  const webCourses = fetchedCourses
    .filter((c: any) => {
      const s = `${c.category?.slug} ${c.courseName}`.toLowerCase();
      return (
        s.includes("web") ||
        s.includes("react") ||
        s.includes("node") ||
        s.includes("html")
      );
    })
    .slice(0, 3);

  const dataCourses = fetchedCourses
    .filter((c: any) => {
      const s = `${c.category?.slug} ${c.courseName}`.toLowerCase();
      return (
        s.includes("data") ||
        s.includes("python") ||
        s.includes("ai") ||
        s.includes("machine learning")
      );
    })
    .slice(0, 3);

  const cloudCourses = fetchedCourses
    .filter((c: any) => {
      const s = `${c.category?.slug} ${c.courseName}`.toLowerCase();
      return (
        s.includes("cloud") ||
        s.includes("aws") ||
        s.includes("azure") ||
        s.includes("devops")
      );
    })
    .slice(0, 3);

  const trendingCourses =
    fetchedCourses.length > 0 ? fetchedCourses.slice(0, 3) : [];

  const uniqueMentorsMap = new Map();
  fetchedCourses.forEach((c: any) => {
    if (c.mentor && !uniqueMentorsMap.has(c.mentor.userId)) {
      uniqueMentorsMap.set(c.mentor.userId, {
        name: c.mentor.fullName || c.mentor.userName,
        src:
          c.mentor.profileUrl ||
          `https://i.pravatar.cc/150?u=${c.mentor.userId}`,
        title: "Expert Instructor",
        rating: c.averageRating || "4.8",
        tags: [c.category?.name || "Tech", "Verified"],
      });
    }
  });
  const mentors = Array.from(uniqueMentorsMap.values()).slice(0, 3);

  const handleFileChange = (event: React.SyntheticEvent<any>) => {
    if (
      (event.target as HTMLInputElement).files &&
      (event.target as HTMLInputElement).files?.[0]
    ) {
      setUploadFile((event.target as HTMLInputElement).files?.[0]);
    }
  };

  const handleUploadSubmit = async () => {
    if (!user) {
      toast.error("Please login to upload resources");
      return;
    }
    if (!uploadFile || !uploadTitle) {
      toast.error("File and title are required.");
      return;
    }

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
      setUploadFile(null);
      setUploadTitle("");
      setUploadDesc("");
      queryClient.invalidateQueries({ queryKey: ["resources"] });
    } catch (error) {
      toast.error(
        (error as import("axios").AxiosError<{ message?: string }>)?.response
          ?.data?.message ||
          "Upload failed. Only PDFs, Images, Videos, and Docs are allowed.",
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 text-slate-100 font-sans">
        {/* Header */}
        <div className="mb-10 text-center lg:text-left">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4 text-white">
            Discover Your Potential
          </h1>
          <p className="text-slate-400 text-base max-w-2xl mx-auto lg:mx-0 leading-relaxed">
            Search through premium specialized courses and connect with
            world-class mentors. Access free resources and level up your career.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Mobile Filter Toggle */}
          <div className="flex-between lg:hidden bg-slate-900 p-4 rounded-xl border border-slate-800">
            <div className="relative flex-1 mr-4">
              <Search className="icon-base absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(event: React.SyntheticEvent<any>) =>
                  setSearchTerm((event.target as HTMLInputElement).value)
                }
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-200"
              />
            </div>
            <button
              onClick={() => setShowMobileFilters(true)}
              className="flex items-center gap-2 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors"
            >
              <Filter className="icon-base" /> Filters
            </button>
          </div>

          {/* Sidebar Filters */}
          <aside
            className={`fixed inset-0 z-50 lg:z-10 bg-[var(--bg-base)]/95 backdrop-blur-sm lg:static lg:bg-transparent lg:backdrop-blur-none lg:w-64 lg:shrink-0 lg:block ${showMobileFilters ? "block" : "hidden"}`}
          >
            <div className="h-full max-w-xs w-full bg-[var(--bg-surface)] border-r border-[var(--border-default)] p-6 lg:p-0 lg:bg-transparent lg:border-none lg:w-auto overflow-y-auto lg:overflow-visible sticky top-24">
              <div className="flex-between mb-6 lg:hidden">
                <h2 className="text-lg font-bold text-[var(--text-heading)]">
                  Filters
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowMobileFilters(false)}
                  className="text-[var(--text-muted)] p-2 hover:text-[var(--text-primary)]"
                >
                  <X className="icon-md" />
                </Button>
              </div>

              {/* Search - Desktop only */}
              <div className="hidden lg:block mb-8 relative group">
                <Search className="icon-md text-[var(--text-muted)] group-focus-within:text-[var(--accent-primary)] transition-colors absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(event: React.SyntheticEvent<any>) =>
                    setSearchTerm((event.target as HTMLInputElement).value)
                  }
                  className="w-full pl-11 pr-4 py-3 bg-[var(--bg-input)] border border-[var(--border-input)] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 shadow-sm transition-all text-sm font-medium text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
                />
              </div>

              {/* Filter Sections */}
              <div className="space-y-8">
                {/* Categories */}
                <div>
                  <h3 className="text-sm font-bold text-[var(--text-heading)] mb-4 uppercase tracking-wider flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-blue-500" />{" "}
                    Categories
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {["Web Dev", "Data Science", "Cloud", "Mobile", "AI"].map(
                      (cat: any) => (
                        <button
                          key={cat}
                          onClick={() => {
                            setFilters((prev: any) => ({
                              ...prev,
                              categories: prev.categories.includes(cat)
                                ? prev.categories.filter((c: any) => c !== cat)
                                : [...prev.categories, cat],
                            }));
                          }}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-all ${
                            filters.categories.includes(cat)
                              ? "bg-blue-500/10 border-blue-500/50 text-blue-600 dark:text-blue-400"
                              : "bg-[var(--bg-surface-2)] border-[var(--border-default)] text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
                          }`}
                        >
                          {cat}
                        </button>
                      ),
                    )}
                  </div>
                </div>

                {/* Level */}
                <div>
                  <h3 className="text-sm font-bold text-[var(--text-heading)] mb-4 uppercase tracking-wider flex items-center gap-2">
                    <Star className="w-4 h-4 text-blue-500" /> Level
                  </h3>
                  <div className="space-y-3">
                    {["Beginner", "Intermediate", "Advanced"].map(
                      (lvl: any) => (
                        <label
                          key={lvl}
                          className="flex items-center gap-3 group cursor-pointer"
                        >
                          <div
                            className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                              filters.level.includes(lvl)
                                ? "bg-blue-500 border-blue-500"
                                : "bg-slate-900 border-slate-600 group-hover:border-slate-500"
                            }`}
                          >
                            {filters.level.includes(lvl) && (
                              <Check className="w-3 h-3 text-white" />
                            )}
                          </div>
                          <span className="text-sm text-slate-400 group-hover:text-slate-200">
                            {lvl}
                          </span>
                          <input
                            type="checkbox"
                            className="hidden"
                            checked={filters.level.includes(lvl)}
                            onChange={() => {
                              setFilters((prev: any) => ({
                                ...prev,
                                level: prev.level.includes(lvl)
                                  ? prev.level.filter((l: any) => l !== lvl)
                                  : [...prev.level, lvl],
                              }));
                            }}
                          />
                        </label>
                      ),
                    )}
                  </div>
                </div>

                {/* Price Slider */}
                {/* <div>
                     <div className="flex justify-between items-center mb-4">
                       <h3 className="text-sm font-bold text-white uppercase tracking-wider">Max Price</h3>
                       <span className="text-xs font-medium text-blue-400">${filters.price}</span>
                     </div>
                     <input 
                       type="range" 
                       min="0" max="1000" step="50"
                       value={filters.price}
                       onChange={(event) => setFilters(prev => ({...prev, price: parseInt((event.target as HTMLInputElement).value)}))}
                       className="w-full accent-blue-500 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                     />
                     <div className="flex justify-between text-[10px] text-slate-500 mt-2 font-medium">
                       <span>Free</span>
                       <span>$1000+</span>
                     </div>
                   </div> */}
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {!showPaginatedList && (
              <>
                {/* Payilagam Labs */}
                <div className="mb-14">
                  <div className="flex justify-between items-end mb-6">
                    <div>
                      <div className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                        HANDS-ON LEARNING
                      </div>
                      <h2 className="text-2xl font-bold tracking-tight text-white">
                        Payilagam Labs
                      </h2>
                    </div>
                    <Link
                      to="/labs"
                      className="text-sm font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
                    >
                      Explore all labs <ArrowRight className="icon-base" />
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {ALL_LABS.slice(0, 3).map((lab: any) => (
                      <LabCard key={lab.id} lab={lab} />
                    ))}
                  </div>
                </div>
              </>
            )}

            {isLoading && (
              <div className="flex justify-center my-12">
                <div className="w-8 h-8 border-2 border-blue-900 border-t-blue-500 rounded-full animate-spin"></div>
              </div>
            )}

            {isError && (
              <div className="bg-rose-500/10 text-rose-400 p-4 rounded-xl text-sm font-medium text-center mb-10 border border-rose-500/20">
                Failed to load courses. Please try again later.
              </div>
            )}

            {/* Course Sections */}
            {showPaginatedList ? (
              <CourseSection
                title={
                  hasActiveFilters
                    ? `Search Results (Showing ${fetchedCourses.length} of ${paginationMeta.total})`
                    : `All Courses (Showing ${fetchedCourses.length} of ${paginationMeta.total})`
                }
                courses={fetchedCourses}
                currentUser={user}
                badgeTemplate={hasActiveFilters ? "Match" : "Course"}
                showArrows={true}
                onNext={() => setPage((p: any) => p + 1)}
                onPrev={() => setPage((p: any) => Math.max(1, p - 1))}
                hasNext={page < paginationMeta.totalPages}
                hasPrev={page > 1}
                headerExtra={
                  <Button
                    variant="outline"
                    onClick={handleClearFilters}
                    size="sm"
                    className="bg-slate-800 border-slate-700 hover:bg-slate-700 text-white shadow-sm ml-2 h-8 text-xs px-3"
                  >
                    Clear Filters
                  </Button>
                }
              />
            ) : (
              <>
                <CourseSection
                  title="Trending Courses"
                  courses={trendingCourses}
                  currentUser={user}
                  hasNext={false}
                  hasPrev={false}
                  onNext={() => {}}
                  onPrev={() => {}}
                  badgeTemplate="Bestseller"
                  showArrows={false}
                  headerExtra={
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setFilters({ categories: [], level: [], price: 500 });
                        setViewAll(true);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="text-xs h-8 text-blue-400 hover:text-blue-300"
                    >
                      View All
                    </Button>
                  }
                />

                <CourseSection
                  title="Web Development"
                  courses={webCourses}
                  currentUser={user}
                  hasNext={false}
                  hasPrev={false}
                  onNext={() => {}}
                  onPrev={() => {}}
                  badgeTemplate="New"
                  showArrows={false}
                  headerExtra={
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setFilters((prev: any) => ({
                          ...prev,
                          categories: ["Web Development"],
                        }));
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="text-xs h-8 text-blue-400 hover:text-blue-300"
                    >
                      View All
                    </Button>
                  }
                />
                <CourseSection
                  title="Data Science & AI"
                  courses={dataCourses}
                  currentUser={user}
                  hasNext={false}
                  hasPrev={false}
                  onNext={() => {}}
                  onPrev={() => {}}
                  badgeTemplate="Hot"
                  showArrows={false}
                  headerExtra={
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setFilters((prev: any) => ({
                          ...prev,
                          categories: ["Data Science", "AI & Machine Learning"],
                        }));
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="text-xs h-8 text-blue-400 hover:text-blue-300"
                    >
                      View All
                    </Button>
                  }
                />
                <CourseSection
                  title="Cloud Computing"
                  courses={cloudCourses}
                  currentUser={user}
                  hasNext={false}
                  hasPrev={false}
                  onNext={() => {}}
                  onPrev={() => {}}
                  badgeTemplate="Popular"
                  showArrows={false}
                  headerExtra={
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setFilters((prev: any) => ({
                          ...prev,
                          categories: ["DevOps"],
                        }));
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="text-xs h-8 text-blue-400 hover:text-blue-300"
                    >
                      View All
                    </Button>
                  }
                />
              </>
            )}

            {!hasActiveFilters && (
              <>
                {/* Free Resources Section */}
                <div className="mb-14">
                  <div className="flex justify-between items-end mb-6">
                    <div>
                      <h2 className="text-xl font-bold tracking-tight mb-1 text-white">
                        Free Learning Resources
                      </h2>
                      <p className="text-sm text-slate-400">
                        Download community-contributed PDFs, Images, and Videos.
                      </p>
                    </div>
                    <Dialog
                      open={isUploadModalOpen}
                      onOpenChange={setIsUploadModalOpen}
                    >
                      <DialogTrigger asChild>
                        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/30 text-blue-400 text-sm font-semibold rounded-lg transition-all shadow-sm cursor-pointer">
                          <UploadCloud className="icon-base" /> Upload Resource
                        </button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md bg-slate-900 border-slate-800">
                        <DialogHeader>
                          <DialogTitle className="text-xl font-bold text-white">
                            Upload a Resource
                          </DialogTitle>
                          <p className="text-sm text-slate-400 mt-1">
                            Share your knowledge with the community (PDF, Image,
                            Video, Word, Excel).
                          </p>
                        </DialogHeader>
                        <div className="space-y-5 py-5">
                          <div className="relative border-2 border-dashed border-slate-700 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:border-blue-500/50 transition-colors cursor-pointer bg-slate-950/50 group">
                            <input
                              type="file"
                              onChange={handleFileChange}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              accept=".pdf,image/*,video/*,.doc,.docx,.xls,.xlsx"
                            />
                            <div className="w-12 h-12 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-500/20 group-hover:border-blue-500/50 transition-colors text-blue-400">
                              <UploadCloud className="icon-lg" />
                            </div>
                            <h4 className="text-sm font-bold text-slate-200 mb-1">
                              {uploadFile
                                ? uploadFile.name
                                : "Click to upload or drag and drop"}
                            </h4>
                            <p className="text-xs text-slate-500 font-medium">
                              PDF, JPG, PNG, GIF, MP4, DOC, XLS (max. 500MB)
                            </p>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <Label
                                htmlFor="title"
                                className="text-sm font-bold text-slate-300"
                              >
                                Resource Title
                              </Label>
                              <Input
                                id="title"
                                value={uploadTitle}
                                onChange={(event: React.SyntheticEvent<any>) =>
                                  setUploadTitle(
                                    (event.target as HTMLInputElement).value,
                                  )
                                }
                                placeholder="e.g., React Architecture Guide"
                                className="mt-1.5 text-sm rounded-lg text-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                              />
                            </div>
                            <div>
                              <Label
                                htmlFor="desc"
                                className="text-sm font-bold text-slate-300"
                              >
                                Description
                              </Label>
                              <Input
                                id="desc"
                                value={uploadDesc}
                                onChange={(event: React.SyntheticEvent<any>) =>
                                  setUploadDesc(
                                    (event.target as HTMLInputElement).value,
                                  )
                                }
                                placeholder="Briefly describe what this resource contains..."
                                className="mt-1.5 text-sm rounded-lg text-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                              />
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                          <Button
                            variant="outline"
                            onClick={() => setIsUploadModalOpen(false)}
                            className="h-10 text-sm px-4 rounded-lg font-bold bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleUploadSubmit}
                            disabled={isUploading}
                            className="h-10 text-sm px-6 rounded-lg font-bold shadow-sm border-none"
                          >
                            {isUploading ? "Uploading..." : "Upload File"}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {resLoading ? (
                    <div className="flex justify-center my-8">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                    </div>
                  ) : freeResources.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                      {freeResources.map((response: any) => (
                        <ResourceCard
                          key={response.resourceId}
                          resource={response}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="flex-center bg-slate-900 border border-slate-800 rounded-2xl p-10 flex-col text-center">
                      <div className="w-16 h-16 bg-slate-950 border border-slate-800 rounded-full flex items-center justify-center mb-4">
                        <FileIcon className="w-8 h-8 text-slate-500" />
                      </div>
                      <p className="text-base font-bold text-slate-200">
                        No resources available yet
                      </p>
                      <p className="text-sm text-slate-400 mt-1 max-w-sm">
                        Be the first to upload and share knowledge with the
                        community.
                      </p>
                    </div>
                  )}
                </div>

                {/* Connect with Top Mentors */}
                <div className="mb-12">
                  <div className="flex justify-between items-end mb-6">
                    <div>
                      <h2 className="text-xl font-bold tracking-tight mb-1 text-white">
                        Connect with Top Mentors
                      </h2>
                      <p className="text-sm text-slate-400">
                        Get 1-on-1 guidance from industry leaders.
                      </p>
                    </div>
                    <button className="px-4 py-2 bg-slate-900 border border-slate-800 text-slate-300 text-sm font-semibold rounded-lg hover:bg-slate-800 hover:text-white transition-colors shadow-sm">
                      Apply as Mentor
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {mentors.length > 0 ? (
                      mentors.map((mentor: any, index: any) => (
                        <Card
                          key={index}
                          className="flex items-center gap-4 hover:shadow-lg hover:shadow-blue-900/10 transition-all cursor-pointer hover:border-blue-500/30 group"
                        >
                          <div className="relative shrink-0">
                            <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-md group-hover:bg-blue-500/40 transition-colors"></div>
                            <img
                              src={mentor.src}
                              alt={mentor.name}
                              className="w-16 h-16 rounded-full object-cover relative z-10 border-2 border-slate-800 group-hover:border-blue-500/50 transition-colors"
                            />
                            <div className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-slate-900 rounded-full z-20"></div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-1">
                              <h4 className="font-bold text-sm truncate pr-2 text-slate-100 group-hover:text-blue-400 transition-colors">
                                {mentor.name}
                              </h4>
                              <div className="flex items-center gap-1 text-[11px] font-bold text-amber-400 shrink-0 bg-amber-400/10 border border-amber-400/20 px-1.5 py-0.5 rounded">
                                <Star className="w-3 h-3 fill-amber-400" />{" "}
                                {mentor.rating}
                              </div>
                            </div>
                            <p className="text-xs text-slate-400 mb-2.5 truncate font-medium">
                              {mentor.title}
                            </p>
                            <div className="flex gap-1.5 overflow-hidden">
                              {mentor.tags.map((tag: any) => (
                                <span
                                  key={tag}
                                  className="text-[9px] font-bold text-blue-300 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded shrink-0 uppercase tracking-wide"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </Card>
                      ))
                    ) : (
                      <div className="col-span-full bg-gradient-to-br from-slate-900 to-amber-900/20 border border-slate-800 rounded-xl p-10 flex flex-col sm:flex-row items-center justify-center gap-6 overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl"></div>
                        <img
                          src="https://cdn.dribbble.com/users/1554526/screenshots/3399669/no_results_found.png"
                          alt="No mentors"
                          className="w-32 h-auto object-cover rounded-lg z-10 mix-blend-luminosity opacity-50"
                          onError={(event: any) =>
                            (event.target.style.display = "none")
                          }
                        />
                        <div className="text-center sm:text-left z-10">
                          <h3 className="text-lg font-bold text-slate-200 mb-1">
                            Mentors are onboarding!
                          </h3>
                          <p className="text-sm text-slate-400 font-medium max-w-sm">
                            We are currently verifying our expert mentors. They
                            will be available for 1-on-1 sessions very soon.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default CourseCatalog;
