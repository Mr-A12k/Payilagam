import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  executeHttpGetRequest,
  executeHttpPostRequest,
  executeHttpPutRequest,
  executeHttpDeleteRequest,
} from "@/api/commonServices";
import { API_PATHS } from "@/api/constants";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import {
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Label,
  Card,
  CardContent,
} from "@/components/ui";
import { useSelector } from "react-redux";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

import {
  Save,
  ArrowLeft,
  Loader2,
  Image as ImageIcon,
  BookOpen,
  BarChart,
  Tag,
  Clock,
  X,
  UploadCloud,
  FileText,
  Layers,
  Plus,
  PlaySquare,
  AlignLeft,
  HelpCircle,
  Code,
  ChevronDown,
  Check,
} from "lucide-react";

const CourseBuilder = () => {
  const params = useParams();
  const courseId = params.id || params.uniqueId;
  const isEditMode = !!courseId;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useSelector((state: any) => state.auth);
  const dashboardRoute = user?.pageAccess?.includes("PG_ADM")
    ? "/admin"
    : "/mentor";

  const [activeSection, setActiveSection] = useState("basic"); // basic, details, media, curriculum
  const [thumbnailFile, setThumbnailFile] = useState<any>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<any>(null);
  const [isDragActive, setIsDragActive] = useState(false);

  const [courseData, setCourseData] = useState({
    courseName: "",
    courseCode: "",
    description: "",
    categoryId: "",
    level: "beginner",
    price: 0,
    duration: 0,
  });

  // UI state for curriculum
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [activeModuleForm, setActiveModuleForm] = useState<any>(null); // moduleId for lesson form
  const [newLessonData, setNewLessonData] = useState({
    title: "",
    type: "video",
  });

  const [lessonToDelete, setLessonToDelete] = useState<string | null>(null);
  const [showDeleteLessonModal, setShowDeleteLessonModal] = useState(false);
  
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [categorySearchQuery, setCategorySearchQuery] = useState("");

  // -------------------------------------------------------------------------------- //
  // QUERIES
  // -------------------------------------------------------------------------------- //

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () =>
      executeHttpGetRequest(API_PATHS.CATEGORIES.BASE).then(
        (response: any) => response.data.data || [],
      ),
  });

  const { data: course, isLoading: isCourseLoading } = useQuery({
    queryKey: ["course", courseId],
    queryFn: () =>
      executeHttpGetRequest(`${API_PATHS.COURSES.BASE}/${courseId}`).then(
        (response: any) => response.data.data,
      ),
    enabled: isEditMode,
  });

  const { data: modules = [] } = useQuery({
    queryKey: ["modules", courseId],
    queryFn: () =>
      executeHttpGetRequest(API_PATHS.MODULES.COURSE(courseId!)).then(
        (response: any) => response.data.data || [],
      ),
    enabled: isEditMode,
  });

  // Populate form data on load (Edit Mode)
  useEffect(() => {
    if (course) {
      setCourseData({
        courseName: course.courseName || "",
        courseCode: course.courseCode || "",
        description: course.description || "",
        categoryId: course.categoryId?.toString() || "",
        level: course.level || "beginner",
        price: course.price || 0,
        duration: course.duration || 0,
      });
      if (course.thumbnail) {
        setThumbnailPreview(
          `${import.meta.env.VITE_API_BASE_URL?.replace("/api", "") || "http://localhost:5000"}${course.thumbnail}`,
        );
      }
    }
  }, [course]);

  // -------------------------------------------------------------------------------- //
  // MUTATIONS (COURSE)
  // -------------------------------------------------------------------------------- //

  const saveCourseMutation = useMutation({
    mutationFn: (data: FormData) => {
      const promise: any = isEditMode
        ? executeHttpPutRequest(
            `${API_PATHS.COURSES.BASE}/${courseId}`,
            data,
            true,
          )
        : executeHttpPostRequest(API_PATHS.COURSES.BASE, data, true);
      return promise;
    },
    onSuccess: (response: import("axios").AxiosResponse<any>) => {
      toast.success(
        isEditMode
          ? "Course updated successfully!"
          : "Course created successfully!",
      );
      if (!isEditMode && response?.data?.data?.courseId) {
        navigate(`/mentor/course/edit/${response.data.data.courseId}`);
      } else {
        queryClient.invalidateQueries({ queryKey: ["course", courseId] });
      }
    },
    onError: (error: any) => {
      toast.error(
        (error as import("axios").AxiosError<{ message?: string }>)?.response
          ?.data?.message || "Failed to save course",
      );
    },
  });

  // -------------------------------------------------------------------------------- //
  // MUTATIONS (CURRICULUM)
  // -------------------------------------------------------------------------------- //

  const createModuleMutation = useMutation({
    mutationFn: (title: string) =>
      executeHttpPostRequest(API_PATHS.MODULES.COURSE(courseId!), { title }),
    onSuccess: () => {
      toast.success("Module created!");
      setNewModuleTitle("");
      queryClient.invalidateQueries({ queryKey: ["modules", courseId] });
    },
    onError: (error: any) =>
      toast.error(
        (error as import("axios").AxiosError<{ message?: string }>)?.response
          ?.data?.message || "Failed to create module",
      ),
  });

  const deleteModuleMutation = useMutation({
    mutationFn: (moduleId: string) =>
      executeHttpDeleteRequest(
        `${API_PATHS.MODULES.BASE}/${moduleId}`,
      ) as any as any,
    onSuccess: () => {
      toast.success("Module deleted!");
      queryClient.invalidateQueries({ queryKey: ["modules", courseId] });
    },
    onError: (error: any) =>
      toast.error(
        (error as import("axios").AxiosError<{ message?: string }>)?.response
          ?.data?.message || "Failed to delete module",
      ),
  });

  const createLessonMutation = useMutation({
    mutationFn: ({ moduleId, data }: any) =>
      executeHttpPostRequest(
        API_PATHS.LESSONS.MODULE(moduleId!) as any,
        data,
      ) as any as any,
    onSuccess: () => {
      toast.success("Lesson created!");
      setActiveModuleForm(null);
      setNewLessonData({ title: "", type: "video" });
      queryClient.invalidateQueries({ queryKey: ["modules", courseId] });
    },
    onError: (error: any) =>
      toast.error(
        (error as import("axios").AxiosError<{ message?: string }>)?.response
          ?.data?.message || "Failed to create lesson",
      ),
  });

  const deleteLessonMutation = useMutation({
    mutationFn: (lessonId: string) =>
      executeHttpDeleteRequest(
        `${API_PATHS.LESSONS.BASE}/${lessonId}`,
      ) as any as any,
    onSuccess: () => {
      toast.success("Lesson deleted!");
      queryClient.invalidateQueries({ queryKey: ["modules", courseId] });
    },
    onError: (error: any) =>
      toast.error(
        (error as import("axios").AxiosError<{ message?: string }>)?.response
          ?.data?.message || "Failed to delete lesson",
      ),
  });

  // -------------------------------------------------------------------------------- //
  // HANDLERS
  // -------------------------------------------------------------------------------- //

  const handleChange = (event: React.SyntheticEvent<any>) => {
    const target = event.target as HTMLInputElement;
    const { name, value } = target;
    setCourseData((prev: any) => ({
      ...prev,
      [name as keyof typeof prev]:
        name === "price" || name === "duration" ? Number(value) : value,
    }));
  };

  const handleSelectChange = (name: any, value: any) => {
    setCourseData((prev: any) => ({
      ...prev,
      [name as keyof typeof prev]:
        name === "categoryId" ? Number(value) : value,
    }));
  };

  const handleThumbnailChange = (file: any) => {
    if (file) {
      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setThumbnailPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const clearThumbnail = () => {
    setThumbnailFile(null);
    setThumbnailPreview(null);
  };

  const handleSubmit = (event: React.SyntheticEvent<any>) => {
    event.preventDefault();
    const data = new FormData();
    Object.keys(courseData).forEach((key: any) =>
      data.append(key, courseData[key as keyof typeof courseData] as any),
    );
    if (thumbnailFile) {
      data.append("thumbnail", thumbnailFile);
    }
    saveCourseMutation.mutate(data);
  };

  const handleCreateModule = () => {
    if (!newModuleTitle.trim()) return toast.error("Module title is required");
    createModuleMutation.mutate(newModuleTitle);
  };

  const handleCreateLesson = (moduleId: string) => {
    if (!newLessonData.title.trim())
      return toast.error("Lesson title is required");
    createLessonMutation.mutate({ moduleId, data: newLessonData });
  };

  // -------------------------------------------------------------------------------- //
  // RENDER
  // -------------------------------------------------------------------------------- //

  if (isEditMode && isCourseLoading) {
    return (
      <div className="flex-center min-h-[calc(100vh-4rem)] bg-slate-950">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const selectedCategoryName =
    categories.find(
      (category: any) =>
        category.categoryId.toString() === courseData.categoryId,
    )?.name || "Category";

  const inputClasses =
    "bg-slate-900/40 border-slate-700/50 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 shadow-inner shadow-black/40 hover:border-slate-600 transition-all duration-300 rounded-xl h-11 px-4";
  const labelClasses =
    "text-slate-300 font-semibold text-sm mb-1.5 block tracking-wide";

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 text-slate-200 pb-24 font-sans selection:bg-blue-500/30">
      {/* Premium Header */}
      <div className="bg-slate-900/70 backdrop-blur-2xl border-b border-white/5 sticky top-0 z-40 shadow-[0_4px_30px_rgba(0,0,0,0.3)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex-between h-20">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigate(dashboardRoute)}
                className="rounded-full border-slate-700 bg-slate-800/50 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                <ArrowLeft className="icon-md" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-slate-50 tracking-tight">
                  {isEditMode ? "Edit Course" : "Create New Course"}
                </h1>
                <p className="text-sm text-blue-400/80 font-medium">
                  Design and structure your curriculum
                </p>
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={saveCourseMutation.isPending}
              className="px-6 shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(37,99,235,0.5)] hover:-translate-y-0.5 transition-all flex items-center gap-2"
            >
              {saveCourseMutation.isPending ? (
                <Loader2 className="icon-md animate-spin" />
              ) : (
                <Save className="icon-md" />
              )}
              {isEditMode ? "Save Changes" : "Publish Course"}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column: Form Editor */}
          <div className="flex-1 space-y-6">
            {/* Nav Tabs */}
            {/* Nav Tabs */}
            <div className="flex gap-2 p-2 bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-x-auto shadow-inner shadow-black/40">
              <Button
                variant="ghost"
                onClick={() => setActiveSection("basic")}
                className={cn(
                  "rounded-xl transition-all duration-300 font-semibold px-6",
                  activeSection === "basic"
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] ring-1 ring-white/10"
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/80",
                )}
              >
                <BookOpen className="icon-base mr-2" /> Basic Info
              </Button>
              <Button
                variant="ghost"
                onClick={() => setActiveSection("details")}
                className={cn(
                  "rounded-xl transition-all duration-300 font-semibold px-6",
                  activeSection === "details"
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] ring-1 ring-white/10"
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/80",
                )}
              >
                <BarChart className="icon-base mr-2" /> Details
              </Button>
              <Button
                variant="ghost"
                onClick={() => setActiveSection("media")}
                className={cn(
                  "rounded-xl transition-all duration-300 font-semibold px-6",
                  activeSection === "media"
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] ring-1 ring-white/10"
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/80",
                )}
              >
                <ImageIcon className="icon-base mr-2" /> Media
              </Button>
              <Button
                variant="ghost"
                onClick={() =>
                  isEditMode
                    ? setActiveSection("curriculum")
                    : toast.error("Save course first to build curriculum!")
                }
                className={cn(
                  "rounded-xl transition-all duration-300 font-semibold px-6",
                  !isEditMode && "opacity-50 cursor-not-allowed",
                  activeSection === "curriculum"
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] ring-1 ring-white/10"
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/80",
                )}
              >
                <Layers className="icon-base mr-2" /> Curriculum
              </Button>
            </div>

            {/* Section 1: Basic Info */}
            {activeSection === "basic" && (
              <Card className="!bg-slate-900/40 backdrop-blur-2xl border-slate-700/50 shadow-[0_8px_30px_rgb(0,0,0,0.12)] animate-in fade-in zoom-in-95 duration-300 !p-0 overflow-hidden">
                <div className="p-6 border-b border-white/5 flex items-center gap-4 bg-gradient-to-r from-slate-800/50 to-transparent">
                  <div className="w-12 h-12 rounded-2xl flex-center bg-gradient-to-br from-blue-500/20 to-indigo-500/20 text-blue-400 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                    <BookOpen className="icon-lg" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-100">
                      Basic Information
                    </h2>
                    <p className="text-sm text-slate-400">
                      Core details for search and discovery
                    </p>
                  </div>
                </div>
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-2">
                    <Label className={labelClasses}>Course Name</Label>
                    <Input
                      name="courseName"
                      required
                      value={courseData.courseName}
                      onChange={handleChange}
                      placeholder="e.g. Advanced System Design Patterns"
                      className={inputClasses}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className={labelClasses}>Course Code</Label>
                      <Input
                        name="courseCode"
                        required
                        value={courseData.courseCode}
                        onChange={handleChange}
                        className={cn(inputClasses, "uppercase")}
                        placeholder="SYS-401"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className={labelClasses}>Category</Label>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                          className="w-full h-11 bg-slate-900/40 border border-slate-700/50 hover:border-blue-500/50 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all rounded-xl px-4 flex items-center justify-between text-slate-200 text-sm shadow-inner shadow-black/20"
                        >
                          <span className="truncate">
                            {categories.find((c: any) => c.categoryId.toString() === courseData.categoryId)?.name || "Select Category..."}
                          </span>
                          <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform duration-300 shrink-0 ml-2", isCategoryDropdownOpen && "rotate-180")} />
                        </button>

                        {isCategoryDropdownOpen && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={() => setIsCategoryDropdownOpen(false)} />
                            <div className="absolute top-12 left-0 right-0 z-50 bg-slate-950/95 backdrop-blur-md border border-slate-800 rounded-xl shadow-[0_15px_40px_rgba(0,0,0,0.6)] overflow-hidden animate-in fade-in slide-in-from-top-1.5 duration-200">
                              <div className="p-2 border-b border-slate-900">
                                <input
                                  type="text"
                                  value={categorySearchQuery}
                                  onChange={(e) => setCategorySearchQuery(e.target.value)}
                                  placeholder="Search categories..."
                                  className="w-full bg-slate-900/60 border border-slate-800/80 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-650 focus:outline-none focus:border-blue-500/50"
                                />
                              </div>
                              <div className="max-h-60 overflow-y-auto custom-scrollbar p-1 space-y-0.5">
                                {categories
                                  .filter((c: any) => c.name.toLowerCase().includes(categorySearchQuery.toLowerCase()))
                                  .map((category: any) => {
                                    const isSelected = category.categoryId.toString() === courseData.categoryId;
                                    return (
                                      <button
                                        key={category.categoryId}
                                        type="button"
                                        onClick={() => {
                                          handleSelectChange("categoryId", category.categoryId.toString());
                                          setIsCategoryDropdownOpen(false);
                                          setCategorySearchQuery("");
                                        }}
                                        className={cn(
                                          "w-full text-left px-3 py-2 text-xs rounded-lg transition-all flex items-center justify-between",
                                          isSelected
                                            ? "bg-blue-600/20 text-blue-400 font-bold border-l-2 border-blue-500"
                                            : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                                        )}
                                      >
                                        <span>{category.name}</span>
                                        {isSelected && <Check className="w-3.5 h-3.5 text-blue-400" />}
                                      </button>
                                    );
                                  })}
                                {categories.filter((c: any) => c.name.toLowerCase().includes(categorySearchQuery.toLowerCase())).length === 0 && (
                                  <div className="text-center py-4 text-xs text-slate-500">No categories match</div>
                                )}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className={labelClasses}>Description</Label>
                    <textarea
                      name="description"
                      rows={5}
                      required
                      value={courseData.description}
                      onChange={handleChange}
                      className={cn(
                        "flex w-full rounded-xl border px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0 resize-none",
                        inputClasses,
                      )}
                      placeholder="Provide a compelling overview of what students will learn..."
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Section 2: Details & Pricing */}
            {activeSection === "details" && (
              <Card className="!bg-slate-900/40 backdrop-blur-2xl border-slate-700/50 shadow-[0_8px_30px_rgb(0,0,0,0.12)] animate-in fade-in zoom-in-95 duration-300 !p-0 overflow-hidden">
                <div className="p-6 border-b border-white/5 flex items-center gap-4 bg-gradient-to-r from-slate-800/50 to-transparent">
                  <div className="w-12 h-12 rounded-2xl flex-center bg-gradient-to-br from-blue-500/20 to-indigo-500/20 text-blue-400 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                    <BarChart className="icon-lg" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-100">
                      Curriculum Details
                    </h2>
                    <p className="text-sm text-slate-400">
                      Target audience and economics
                    </p>
                  </div>
                </div>
                <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label className={labelClasses}>Difficulty Level</Label>
                    <Select
                      value={courseData.level}
                      onValueChange={(value: any) =>
                        handleSelectChange("level", value)
                      }
                    >
                      <SelectTrigger className={cn("h-11", inputClasses)}>
                        <SelectValue placeholder="Select Level..." />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                        <SelectItem
                          value="beginner"
                          className="focus:bg-blue-600 focus:text-white"
                        >
                          Beginner
                        </SelectItem>
                        <SelectItem
                          value="intermediate"
                          className="focus:bg-blue-600 focus:text-white"
                        >
                          Intermediate
                        </SelectItem>
                        <SelectItem
                          value="advanced"
                          className="focus:bg-blue-600 focus:text-white"
                        >
                          Advanced
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className={labelClasses}>Price (INR)</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium text-sm">
                        ₹
                      </span>
                      <Input
                        name="price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={courseData.price}
                        onChange={handleChange}
                        className={cn("pl-7", inputClasses)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className={labelClasses}>Duration (Mins)</Label>
                    <div className="relative">
                      <Input
                        name="duration"
                        type="number"
                        min="0"
                        value={courseData.duration}
                        onChange={handleChange}
                        className={cn("pr-12 pl-3", inputClasses)}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-bold">
                        MIN
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Section 3: Media */}
            {activeSection === "media" && (
              <Card className="!bg-slate-900/40 backdrop-blur-2xl border-slate-700/50 shadow-[0_8px_30px_rgb(0,0,0,0.12)] animate-in fade-in zoom-in-95 duration-300 !p-0 overflow-hidden">
                <div className="p-6 border-b border-white/5 flex items-center gap-4 bg-gradient-to-r from-slate-800/50 to-transparent">
                  <div className="w-12 h-12 rounded-2xl flex-center bg-gradient-to-br from-blue-500/20 to-indigo-500/20 text-blue-400 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                    <ImageIcon className="icon-lg" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-100">
                      Course Media
                    </h2>
                    <p className="text-sm text-slate-400">
                      Visuals to attract students
                    </p>
                  </div>
                </div>
                <CardContent className="p-6">
                  {!thumbnailPreview ? (
                    <div
                      className={cn(
                        "relative flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-2xl transition-all duration-300 cursor-pointer",
                        isDragActive
                          ? "border-blue-500 bg-blue-500/10 scale-[1.02] shadow-[0_0_30px_rgba(59,130,246,0.15)]"
                          : "border-slate-700 bg-slate-900/50 hover:bg-slate-800/80 hover:border-slate-600",
                      )}
                      onDragOver={(event: React.SyntheticEvent<any>) => {
                        event.preventDefault();
                        setIsDragActive(true);
                      }}
                      onDragLeave={(event: React.SyntheticEvent<any>) => {
                        event.preventDefault();
                        setIsDragActive(false);
                      }}
                      onDrop={(event: React.SyntheticEvent<any>) => {
                        event.preventDefault();
                        setIsDragActive(false);
                        if (
                          (event as React.DragEvent).dataTransfer.files &&
                          (event as React.DragEvent).dataTransfer.files[0]
                        )
                          handleThumbnailChange(
                            (event as React.DragEvent).dataTransfer.files[0],
                          );
                      }}
                    >
                      <input
                        type="file"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        accept="image/*"
                        onChange={(event: React.SyntheticEvent<any>) => {
                          if (
                            (event.target as HTMLInputElement).files &&
                            (event.target as HTMLInputElement).files?.[0]
                          )
                            handleThumbnailChange(
                              (event.target as HTMLInputElement).files?.[0],
                            );
                        }}
                      />
                      <div className="w-20 h-20 bg-slate-950 rounded-full shadow-lg shadow-black/50 flex-center mb-6 ring-1 ring-slate-800 group-hover:scale-110 transition-transform">
                        <UploadCloud className="w-10 h-10 text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-200 mb-2">
                        Click or drag image to upload
                      </h3>
                      <p className="text-sm text-slate-500">
                        High resolution PNG or JPG up to 10MB
                      </p>
                    </div>
                  ) : (
                    <div className="relative border border-slate-800 rounded-2xl p-5 bg-slate-950/50 flex flex-col sm:flex-row items-center gap-6 shadow-inner shadow-black/20">
                      <div className="w-full sm:w-40 aspect-video bg-slate-900 rounded-xl overflow-hidden shrink-0 border border-slate-800 shadow-lg">
                        <img
                          src={thumbnailPreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 text-center sm:text-left truncate">
                        <p className="font-semibold text-base text-slate-200 truncate">
                          {thumbnailFile?.name || "course-thumbnail.png"}
                        </p>
                        <p className="text-sm text-sky-300/80 mt-1">
                          Ready for upload
                        </p>
                      </div>
                      <Button
                        variant="destructive"
                        onClick={clearThumbnail}
                        className="shrink-0 gap-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30 rounded-xl"
                      >
                        <X className="icon-base" /> Remove
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Section 4: Curriculum */}
            {activeSection === "curriculum" && isEditMode && (
              <Card className="!bg-slate-900/40 backdrop-blur-2xl border-slate-700/50 shadow-[0_8px_30px_rgb(0,0,0,0.12)] animate-in fade-in zoom-in-95 duration-300 !p-0 overflow-hidden">
                <div className="p-6 border-b border-white/5 flex items-center gap-4 bg-gradient-to-r from-slate-800/50 to-transparent">
                  <div className="w-12 h-12 rounded-2xl flex-center bg-gradient-to-br from-blue-500/20 to-indigo-500/20 text-blue-400 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                    <Layers className="icon-lg" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-100">
                      Curriculum Builder
                    </h2>
                    <p className="text-sm text-slate-400">
                      Add modules and lessons to your course
                    </p>
                  </div>
                </div>
                <CardContent className="p-6 space-y-6">
                  {/* List of Modules */}
                  {modules.map((module: any, index: any) => (
                    <div
                      key={module.moduleId}
                      className="border border-slate-700/50 rounded-2xl overflow-hidden bg-slate-900/30 shadow-[0_4px_20px_rgba(0,0,0,0.2)] transition-all hover:border-slate-600/50"
                    >
                      <div className="bg-slate-800/40 p-5 border-b border-slate-700/50 flex-between backdrop-blur-sm">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-slate-900 flex-center text-sm font-bold text-blue-400 border border-slate-700 shadow-inner">
                            {index + 1}
                          </div>
                          <h3 className="font-bold text-slate-200 text-lg tracking-wide">
                            {module.title}
                          </h3>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-400 hover:bg-red-500/20 hover:text-red-300 rounded-full transition-colors duration-200"
                          onClick={() => {
                            if (
                              window.confirm(
                                "Are you sure you want to delete this module?",
                              )
                            ) {
                              deleteModuleMutation.mutate(module.moduleId);
                            }
                          }}
                        >
                          <X className="icon-md" />
                        </Button>
                      </div>

                      {/* Lessons List */}
                      <div className="p-5 space-y-3">
                        {module.lessons?.length > 0 ? (
                          module.lessons.map((lesson: any) => (
                            <div
                              key={lesson.lessonId}
                              className="flex-between p-4 bg-slate-900/50 border border-slate-700/50 rounded-xl group hover:border-blue-500/50 hover:bg-slate-800/80 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] transition-all duration-300 cursor-pointer"
                            >
                              <div className="flex items-center gap-4">
                                <div className="p-2 bg-slate-950/80 rounded-lg border border-slate-700/50 group-hover:border-blue-500/40 transition-colors shadow-inner shadow-black/40">
                                  {lesson.type === "video" ? (
                                    <PlaySquare className="w-4 h-4 text-sky-400" />
                                  ) : lesson.type === "text" ? (
                                    <AlignLeft className="w-4 h-4 text-emerald-400" />
                                  ) : lesson.type === "quiz" ? (
                                    <HelpCircle className="w-4 h-4 text-amber-400" />
                                  ) : (
                                    <Code className="w-4 h-4 text-purple-400" />
                                  )}
                                </div>
                                <span className="text-sm font-medium text-slate-300 group-hover:text-slate-100 transition-colors">
                                  {lesson.title}
                                </span>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:bg-red-500/20 hover:text-red-300 rounded-full"
                                onClick={() => {
                                  setLessonToDelete(lesson.lessonId);
                                  setShowDeleteLessonModal(true);
                                }}
                              >
                                <X className="icon-base" />
                              </Button>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8 text-sm text-slate-500 italic bg-slate-900/20 rounded-xl border border-dashed border-slate-800">
                            No lessons in this module yet.
                          </div>
                        )}

                        {/* Add Lesson Form / Trigger */}
                        {activeModuleForm === module.moduleId ? (
                          <Card className="space-y-4 animate-in fade-in zoom-in-95 shadow-xl shadow-black/40 mt-4">
                            <div className="flex-between border-b border-slate-800 pb-3">
                              <h4 className="font-bold text-sm text-slate-200">
                                Add New Lesson
                              </h4>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setActiveModuleForm(null)}
                                className="h-8 w-8 rounded-full hover:bg-slate-800 text-slate-400"
                              >
                                <X className="icon-base" />
                              </Button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                              <div className="sm:col-span-2 space-y-2">
                                <Label className="text-xs text-slate-400">
                                  Lesson Title
                                </Label>
                                <Input
                                  value={newLessonData.title}
                                  onChange={(
                                    event: React.SyntheticEvent<any>,
                                  ) =>
                                    setNewLessonData((p: any) => ({
                                      ...p,
                                      title: (event.target as HTMLInputElement)
                                        .value,
                                    }))
                                  }
                                  placeholder="e.g. Introduction to React"
                                  className={inputClasses}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-xs text-slate-400">
                                  Type
                                </Label>
                                <Select
                                  value={newLessonData.type}
                                  onValueChange={(value: any) =>
                                    setNewLessonData((p: any) => ({
                                      ...p,
                                      type: value,
                                    }))
                                  }
                                >
                                  <SelectTrigger className={inputClasses}>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                                    <SelectItem
                                      value="video"
                                      className="focus:bg-blue-600"
                                    >
                                      Video
                                    </SelectItem>
                                    <SelectItem
                                      value="text"
                                      className="focus:bg-blue-600"
                                    >
                                      Text/Article
                                    </SelectItem>
                                    <SelectItem
                                      value="quiz"
                                      className="focus:bg-blue-600"
                                    >
                                      Quiz
                                    </SelectItem>
                                    <SelectItem
                                      value="coding"
                                      className="focus:bg-blue-600"
                                    >
                                      Coding Challenge
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            <div className="flex justify-end pt-2">
                              <Button
                                onClick={() =>
                                  handleCreateLesson(module.moduleId)
                                }
                                disabled={createLessonMutation.isPending}
                                className="shadow-lg shadow-blue-900/20"
                              >
                                {createLessonMutation.isPending ? (
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                  <Save className="icon-base mr-2" />
                                )}
                                Save Lesson
                              </Button>
                            </div>
                          </Card>
                        ) : (
                          <Button
                            variant="outline"
                            className="w-full border-dashed border-slate-700 hover:border-blue-500/50 hover:bg-blue-500/10 text-slate-400 hover:text-blue-400 transition-all py-6 mt-2"
                            onClick={() => {
                              setActiveModuleForm(module.moduleId);
                              setNewLessonData({ title: "", type: "video" });
                            }}
                          >
                            <Plus className="w-5 h-5 mr-2" /> Add Lesson
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Add Module Form */}
                  <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row sm:items-end gap-4 bg-slate-900/30 p-5 rounded-2xl">
                    <div className="flex-1 space-y-2">
                      <Label className={labelClasses}>New Module Title</Label>
                      <Input
                        value={newModuleTitle}
                        onChange={(event: React.SyntheticEvent<any>) =>
                          setNewModuleTitle(
                            (event.target as HTMLInputElement).value,
                          )
                        }
                        placeholder="e.g. Getting Started"
                        onKeyDown={(event: React.SyntheticEvent<any>) =>
                          (event as unknown as KeyboardEvent).key === "Enter" &&
                          handleCreateModule()
                        }
                        className={inputClasses}
                      />
                    </div>
                    <Button
                      onClick={handleCreateModule}
                      disabled={
                        !newModuleTitle.trim() || createModuleMutation.isPending
                      }
                      className="shadow-[0_0_15px_rgba(37,99,235,0.3)] h-10 w-full sm:w-auto"
                    >
                      {createModuleMutation.isPending ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Plus className="icon-base mr-2" />
                      )}
                      Add Module
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column: Live Preview */}
          <div className="w-full lg:w-[400px]">
            <div className="sticky top-28">
              <div className="flex-between mb-5">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <PlaySquare className="icon-base" /> Live Preview
                </h3>
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.8)]"></span>
                </span>
              </div>

              <Card className="overflow-hidden bg-slate-900 border border-slate-800 group hover:-translate-y-1.5 transition-all duration-500 shadow-2xl shadow-black/60 rounded-2xl">
                <div className="aspect-video bg-slate-950 relative overflow-hidden flex-center">
                  {thumbnailPreview ? (
                    <img
                      src={thumbnailPreview}
                      alt="Preview"
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="text-slate-600 flex flex-col items-center">
                      <ImageIcon className="w-12 h-12 mb-3 opacity-40 drop-shadow-md" />
                      <span className="text-sm font-semibold tracking-wide">
                        Cover Image
                      </span>
                    </div>
                  )}
                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-transparent opacity-60"></div>

                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className="bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-bold text-slate-200 shadow-lg uppercase tracking-wider border border-slate-700/50">
                      {selectedCategoryName}
                    </span>
                  </div>
                  <div className="absolute top-4 right-4 flex gap-2">
                    <span className="bg-sky-500/20 backdrop-blur-md text-sky-300 px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg uppercase tracking-wider border border-sky-500/30">
                      {courseData.level}
                    </span>
                  </div>
                </div>

                <CardContent className="p-6 relative">
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-400 mb-3 uppercase tracking-wider">
                    <Tag className="icon-base" />
                    {courseData.courseCode || "CODE"}
                  </div>

                  <h3 className="font-bold text-xl text-slate-100 mb-3 leading-snug line-clamp-2 group-hover:text-blue-400 transition-colors">
                    {courseData.courseName ||
                      "Your Course Title Will Appear Here"}
                  </h3>

                  <p className="text-sm text-slate-400 line-clamp-3 mb-6 leading-relaxed min-h-[60px]">
                    {courseData.description ||
                      "A brief description of your course content and what students can expect to learn."}
                  </p>

                  <div className="flex-between pt-5 border-t border-slate-800">
                    <div className="flex items-center gap-2 text-sm text-slate-300 font-medium bg-slate-950/50 px-3 py-1.5 rounded-lg border border-slate-800/50">
                      <Clock className="w-4 h-4 text-sky-400" />
                      {courseData.duration
                        ? `${Math.floor(courseData.duration / 60)}h ${courseData.duration % 60}m`
                        : "0h 0m"}
                    </div>
                    <div className="text-xl font-black text-slate-100 drop-shadow-md">
                      {courseData.price > 0 ? (
                        <span className="text-blue-400">₹</span>
                      ) : (
                        ""
                      )}
                      {courseData.price > 0 ? (
                        Number(courseData.price).toFixed(2)
                      ) : (
                        <span className="text-emerald-400 uppercase tracking-widest text-sm">
                          Free
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="mt-8 bg-blue-900/20 backdrop-blur-sm border border-blue-800/50 rounded-2xl p-5 flex gap-4 shadow-lg shadow-blue-900/10">
                <div className="bg-blue-500/20 p-2 rounded-xl h-fit">
                  <FileText className="w-5 h-5 text-blue-400" />
                </div>
                <p className="text-sm text-blue-200/80 leading-relaxed font-medium">
                  <strong className="block mb-1 font-bold text-blue-300 text-base">
                    Pro Tip
                  </strong>
                  Titles between 30-50 characters with a clear value proposition
                  perform best in the marketplace.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ConfirmDialog
        isOpen={showDeleteLessonModal}
        onClose={() => {
          setShowDeleteLessonModal(false);
          setLessonToDelete(null);
        }}
        onConfirm={async () => {
          if (lessonToDelete) {
            await deleteLessonMutation.mutateAsync(lessonToDelete);
            setShowDeleteLessonModal(false);
            setLessonToDelete(null);
          }
        }}
        title="Delete Lesson"
        description="Are you sure you want to delete this lesson? This action cannot be undone."
        confirmText="Delete"
        isDanger={true}
        isLoading={deleteLessonMutation.isPending}
      />
    </div>
  );
};

export default CourseBuilder;
