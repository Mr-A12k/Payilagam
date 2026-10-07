import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useBackNavigation } from "@/hooks/useBackNavigation";
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
} from "@/components/ui";
import { useSelector } from "react-redux";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import "./CourseBuilder.css";
import CourseQuizBuilder from "./CourseQuizBuilder";

import {
  Save,
  ArrowLeft,
  ArrowRight,
  Loader2,
  Image as ImageIcon,
  BookOpen,
  BarChart,
  X,
  UploadCloud,
  FileText,
  Layers,
  Plus,
  PlaySquare,
  ListChecks,
} from "lucide-react";

const CourseBuilder = () => {
  const params = useParams();
  const courseId = params.id || params.uniqueId;
  const isEditMode = !!courseId;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useSelector((state: any) => state.auth);
  const dashboardRoute = user?.roleId === 1 || user?.pageAccess?.includes("PG_ADM")
    ? "/admin"
    : "/mentor";
  const goBack = useBackNavigation(dashboardRoute);

  const [activeSection, setActiveSection] = useState("basic"); // basic, details, media, curriculum
  const [thumbnailFile, setThumbnailFile] = useState<any>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<any>(null);
  const [removeThumbnail, setRemoveThumbnail] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);

  const [courseData, setCourseData] = useState({
    courseName: "",
    courseCode: "",
    description: "",
    categoryId: "",
    level: "beginner",
    price: 0,
    duration: 0,
    status: "draft",
  });

  // UI state for curriculum
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [activeModuleForm, setActiveModuleForm] = useState<any>(null); // moduleId for lesson form
  const [newLessonData, setNewLessonData] = useState({
    title: "",
    type: "video",
    content: "",
    videoUrl: "",
  });

  const [lessonToDelete, setLessonToDelete] = useState<string | null>(null);
  const [moduleToDelete, setModuleToDelete] = useState<any>(null);
  const [showDeleteLessonModal, setShowDeleteLessonModal] = useState(false);
  

  // -------------------------------------------------------------------------------- //
  // QUERIES
  // -------------------------------------------------------------------------------- //

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => executeHttpGetRequest(API_PATHS.CATEGORIES.BASE),
    select: (response) => Array.isArray(response.data?.data) ? response.data.data : [],
  });

  const { data: courseLevels = [] } = useQuery({
    queryKey: ["dropdownOptions", "course_level"],
    queryFn: () => executeHttpGetRequest(API_PATHS.DROPDOWN_OPTIONS.GROUP("course_level")),
    select: (res) => Array.isArray(res.data?.data) ? res.data.data : [],
  });

  const { data: courseStatuses = [] } = useQuery({
    queryKey: ["dropdownOptions", "course_status"],
    queryFn: () => executeHttpGetRequest(API_PATHS.DROPDOWN_OPTIONS.GROUP("course_status")),
    select: (res) => Array.isArray(res.data?.data) ? res.data.data : [],
  });

  const { data: lessonTypes = [] } = useQuery({
    queryKey: ["dropdownOptions", "lesson_type"],
    queryFn: () => executeHttpGetRequest(API_PATHS.DROPDOWN_OPTIONS.GROUP("lesson_type")),
    select: (res) => Array.isArray(res.data?.data) ? res.data.data : [],
  });

  const { data: course, isLoading: isCourseLoading, isError: isCourseError, refetch: refetchCourse } = useQuery({
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
        level: (course.level || "beginner").toLowerCase(),
        price: course.price || 0,
        duration: course.duration || 0,
        status: (course.status || "draft").toLowerCase(),
      });
      if (course.thumbnail) {
        setThumbnailPreview(
          /^https?:\/\//.test(course.thumbnail) ? course.thumbnail : `${import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, "") || "http://localhost:5005"}${course.thumbnail}`,
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
      void queryClient.invalidateQueries({ queryKey: ["courses"] });
      void queryClient.invalidateQueries({ queryKey: ["adminCourseAnalytics"] });
      void queryClient.invalidateQueries({ queryKey: ["mentorCourses"] });
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
      setNewLessonData({ title: "", type: "video", content: "", videoUrl: "" });
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
        value,
    }));
  };

  const handleThumbnailChange = (file: any) => {
    if (file) {
      if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 10 * 1024 * 1024) {
        toast.error('Choose a PNG, JPG or WebP image up to 10 MB');
        return;
      }
      setRemoveThumbnail(false);
      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setThumbnailPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const clearThumbnail = () => {
    setThumbnailFile(null);
    setThumbnailPreview(null);
    setRemoveThumbnail(true);
  };

  const handleSubmit = (event: React.SyntheticEvent<any>) => {
    event.preventDefault();
    if (saveCourseMutation.isPending) return;
    if (!courseData.courseName.trim() || !courseData.courseCode.trim() || !courseData.description.trim()) {
      toast.error("Course name, code, and description are required");
      setActiveSection("basic");
      return;
    }
    if (!Number.isFinite(courseData.price) || courseData.price < 0 || !Number.isInteger(courseData.duration) || courseData.duration < 0) {
      toast.error("Price and duration must be valid non-negative numbers");
      setActiveSection("details");
      return;
    }
    const data = new FormData();
    Object.keys(courseData).forEach((key: any) =>
      data.append(key, courseData[key as keyof typeof courseData] as any),
    );
    if (thumbnailFile) {
      data.append("thumbnail", thumbnailFile);
    }
    if (removeThumbnail) data.append("removeThumbnail", "true");
    saveCourseMutation.mutate(data);
  };

  const handleCreateModule = () => {
    if (createModuleMutation.isPending) return;
    if (!newModuleTitle.trim()) return toast.error("Module title is required");
    createModuleMutation.mutate(newModuleTitle);
  };

  const handleCreateLesson = (moduleId: string) => {
    if (createLessonMutation.isPending) return;
    if (!newLessonData.title.trim())
      return toast.error("Lesson title is required");
    createLessonMutation.mutate({ moduleId, data: newLessonData });
  };

  // -------------------------------------------------------------------------------- //
  // RENDER
  // -------------------------------------------------------------------------------- //

  if (isEditMode && isCourseError) {
    return <div role="alert" className="space-y-4 p-6 text-[var(--text-primary)]"><h1 className="text-xl font-semibold">Could not load course</h1><Button variant="outline" onClick={() => refetchCourse()}>Retry</Button><Button variant="ghost" onClick={goBack}>Go back</Button></div>;
  }
  if (isEditMode && isCourseLoading) {
    return (
      <div role="status" aria-label="Loading course" className="flex-center min-h-64">
        <Loader2 className="w-6 h-6 animate-spin text-[var(--accent-primary)]" />
      </div>
    );
  }

  const selectedCategoryName =
    categories.find(
      (category: any) =>
        category.categoryId.toString() === courseData.categoryId,
    )?.name || "Uncategorized";

  const inputClasses = "w-full h-10 rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] px-3 text-sm text-[var(--text-primary)] focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]";
  const sections = [
    { id: "basic", label: "Overview", icon: BookOpen },
    { id: "details", label: "Publication", icon: BarChart },
    { id: "media", label: "Cover image", icon: ImageIcon },
    { id: "curriculum", label: "Curriculum", icon: Layers },
    { id: "quizzes", label: "Quizzes & tasks", icon: ListChecks },
  ];
  const sectionIndex = sections.findIndex(section => section.id === activeSection);
  const selectField = (name: string, label: string, options: { value: string; label: string }[]) => (
    <div className="course-field"><Label htmlFor={`course-${name}`}>{label}</Label>
      <Select value={String(courseData[name as keyof typeof courseData] || "none")} onValueChange={(value: string) => handleSelectChange(name, value === "none" ? "" : value)}>
        <SelectTrigger id={`course-${name}`}><SelectValue /></SelectTrigger>
        <SelectContent>{options.map(option => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent>
      </Select>
    </div>
  );

  return (
    <div className="course-builder">
      <header className="course-builder-header">
        <div className="flex min-w-0 items-center gap-3">
          <Button variant="ghost" size="icon-sm" aria-label="Go back" title="Go back" onClick={goBack}><ArrowLeft className="h-4 w-4" /></Button>
          <div><h1>{isEditMode ? "Edit course" : "Create course"}</h1><p className="text-xs text-[var(--text-muted)]">{isEditMode ? courseData.courseCode : "New draft"}</p></div>
        </div>
        <Button onClick={handleSubmit} disabled={saveCourseMutation.isPending}>
          {saveCourseMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saveCourseMutation.isPending ? "Saving..." : isEditMode ? "Save changes" : "Create course"}
        </Button>
      </header>
      <div className="course-builder-layout">
        <nav className="course-builder-nav" aria-label="Course sections">
          {sections.map((section, index) => <button key={section.id} aria-current={activeSection === section.id ? "step" : undefined} onClick={() => setActiveSection(section.id)} className={activeSection === section.id ? "is-active" : ""}>
            <section.icon className="h-4 w-4 shrink-0" /><span>{section.label}</span><span className="course-step-number">{String(index + 1).padStart(2, "0")}</span>
          </button>)}
        </nav>
        <main className="course-builder-editor">
          <div className="course-section-heading"><span className="text-xs text-[var(--text-muted)]">SECTION {sectionIndex + 1} / {sections.length}</span><h2>{sections[sectionIndex]?.label}</h2></div>
          <div hidden={activeSection !== "quizzes"}>
            {course?.courseId ? <CourseQuizBuilder key={course.courseId} courseId={course.courseId} /> : <div className="course-curriculum-empty"><ListChecks className="h-6 w-6 text-[var(--accent-primary)]" /><h3>Create your course first</h3><p>Save the course overview, then add quizzes with questions, answer options, and automatic scoring here.</p><Button onClick={handleSubmit} disabled={saveCourseMutation.isPending}><Save className="h-4 w-4" />Create course</Button></div>}
          </div>
          {activeSection === "basic" && <div className="space-y-6">
            <div className="course-field"><Label htmlFor="course-name">Course name</Label><Input id="course-name" name="courseName" required value={courseData.courseName} onChange={handleChange} placeholder="Introduction to web development" className={inputClasses} /></div>
            <div className="course-field-grid">
              <div className="course-field"><Label htmlFor="course-code">Course code</Label><Input id="course-code" name="courseCode" required value={courseData.courseCode} onChange={handleChange} placeholder="WEB-101" className={inputClasses} /></div>
              {selectField("categoryId", "Category", [{ value: "none", label: "Uncategorized" }, ...categories.map((category: any) => ({ value: String(category.categoryId), label: category.name }))])}
            </div>
            <div className="course-field"><Label htmlFor="course-description">Description</Label><textarea id="course-description" name="description" required rows={7} value={courseData.description} onChange={handleChange} placeholder="What will students learn?" className={cn(inputClasses, "!h-auto min-h-40 resize-y py-3")} /></div>
          </div>}
          {activeSection === "details" && <div className="course-field-grid">
            {selectField("status", "Publication status", courseStatuses.length > 0 ? courseStatuses.map((s: any) => ({ value: s.value, label: s.label })) : [{ value: "draft", label: "Draft" }, { value: "published", label: "Published" }])}
            {selectField("level", "Difficulty", courseLevels.length > 0 ? courseLevels.map((l: any) => ({ value: l.value, label: l.label })) : ["beginner", "intermediate", "advanced"].map(value => ({ value, label: value.charAt(0).toUpperCase() + value.slice(1) })))}
            <div className="course-field"><Label htmlFor="course-price">Price (INR)</Label><Input id="course-price" name="price" type="number" min="0" step="0.01" value={courseData.price} onChange={handleChange} className={inputClasses} /></div>
            <div className="course-field"><Label htmlFor="course-duration">Duration (minutes)</Label><Input id="course-duration" name="duration" type="number" min="0" step="1" value={courseData.duration} onChange={handleChange} className={inputClasses} /></div>
          </div>}
          {activeSection === "media" && <div className="space-y-5">
            <div className={cn("course-upload", isDragActive && "is-dragging")} onDragOver={event => { event.preventDefault(); setIsDragActive(true); }} onDragLeave={() => setIsDragActive(false)} onDrop={event => { event.preventDefault(); setIsDragActive(false); handleThumbnailChange(event.dataTransfer.files[0]); }}>
              <UploadCloud className="h-7 w-7 text-[var(--accent-primary)]" /><Label htmlFor="course-cover">Upload cover image</Label><span className="text-xs text-[var(--text-muted)]">PNG, JPG or WebP</span>
              <input id="course-cover" type="file" accept="image/png,image/jpeg,image/webp" aria-label="Upload cover image" onChange={(event: React.ChangeEvent<HTMLInputElement>) => { handleThumbnailChange(event.target.files?.[0]); event.target.value = ""; }} />
            </div>
            {thumbnailPreview && <div className="flex min-w-0 flex-wrap items-center gap-4"><img src={thumbnailPreview} alt="Course cover" className="aspect-video w-40 rounded-md object-cover" /><div className="min-w-0 flex-1"><p className="break-all text-sm">{thumbnailFile?.name || "Current course cover"}</p></div><Button variant="outline" onClick={clearThumbnail}><X className="h-4 w-4" />Remove</Button></div>}
          </div>}
          {activeSection === "curriculum" && (!isEditMode ? <div className="course-curriculum-empty"><Layers className="h-6 w-6 text-[var(--accent-primary)]" /><h3>Course not created yet</h3><p>Create the course to add modules and lessons.</p><Button onClick={handleSubmit} disabled={saveCourseMutation.isPending}><Save className="h-4 w-4" />Create course</Button></div> : <div className="space-y-5">
            {modules.map((module: any, index: number) => <section key={module.moduleId} className="course-module">
              <header><div className="flex min-w-0 items-center gap-3"><span className="text-xs text-[var(--text-muted)]">{String(index + 1).padStart(2, "0")}</span><h3 className="break-words">{module.title}</h3></div><Button variant="ghost" size="icon-sm" aria-label={`Delete module ${module.title}`} title="Delete module" onClick={() => setModuleToDelete(module)}><X className="h-4 w-4" /></Button></header>
              {module.lessons?.map((lesson: any) => <div key={lesson.lessonId} className="course-lesson"><div className="flex min-w-0 items-center gap-3">{lesson.type === "video" ? <PlaySquare className="h-4 w-4 shrink-0 text-[var(--accent-info)]" /> : <FileText className="h-4 w-4 shrink-0 text-[var(--accent-success)]" />}<span className="break-words text-sm">{lesson.title}</span></div><Button variant="ghost" size="icon-sm" aria-label={`Delete lesson ${lesson.title}`} title="Delete lesson" onClick={() => { setLessonToDelete(lesson.lessonId); setShowDeleteLessonModal(true); }}><X className="h-4 w-4" /></Button></div>)}
              {activeModuleForm === module.moduleId ? <div className="course-lesson-form">
                <div className="flex items-center justify-between"><h4 className="text-sm font-medium">New lesson</h4><Button variant="ghost" size="icon-sm" aria-label="Cancel lesson" onClick={() => setActiveModuleForm(null)}><X className="h-4 w-4" /></Button></div>
                <div className="course-field-grid"><div className="course-field"><Label htmlFor="lesson-title">Lesson title</Label><Input id="lesson-title" value={newLessonData.title} onChange={(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setNewLessonData(previous => ({ ...previous, title: event.target.value }))} className={inputClasses} /></div>
                <div className="course-field"><Label htmlFor="lesson-type">Type</Label><Select value={newLessonData.type} onValueChange={(value: string) => setNewLessonData(previous => ({ ...previous, type: value }))}><SelectTrigger id="lesson-type"><SelectValue /></SelectTrigger><SelectContent>{(lessonTypes.length > 0 ? lessonTypes : [{ value: "video", label: "Video" }, { value: "text", label: "Article" }, { value: "quiz", label: "Quiz" }, { value: "coding", label: "Coding challenge" }]).map((option: any) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent></Select></div></div>
                <div className="course-field"><Label htmlFor="lesson-content">{newLessonData.type === "video" ? "Video URL" : "Lesson content"}</Label>{newLessonData.type === "video" ? <Input id="lesson-content" type="url" value={newLessonData.videoUrl} onChange={(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setNewLessonData(previous => ({ ...previous, videoUrl: event.target.value }))} className={inputClasses} /> : <textarea id="lesson-content" rows={5} value={newLessonData.content} onChange={(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setNewLessonData(previous => ({ ...previous, content: event.target.value }))} className={cn(inputClasses, "!h-auto py-3")} />}</div>
                <div className="flex justify-end"><Button onClick={() => handleCreateLesson(module.moduleId)} disabled={createLessonMutation.isPending}>{createLessonMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}Save lesson</Button></div>
              </div> : <Button variant="ghost" className="m-2" onClick={() => { setActiveModuleForm(module.moduleId); setNewLessonData({ title: "", type: "video", content: "", videoUrl: "" }); }}><Plus className="h-4 w-4" />Add lesson</Button>}
            </section>)}
            {!modules.length && <p className="py-4 text-sm text-[var(--text-muted)]">No modules yet.</p>}
            <div className="flex flex-col items-stretch gap-3 border-t border-[var(--border-default)] pt-5 sm:flex-row sm:items-end"><div className="course-field flex-1"><Label htmlFor="module-title">New module</Label><Input id="module-title" value={newModuleTitle} onChange={(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setNewModuleTitle(event.target.value)} onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => { if (event.key === "Enter") handleCreateModule(); }} placeholder="Getting started" className={inputClasses} /></div><Button onClick={handleCreateModule} disabled={!newModuleTitle.trim() || createModuleMutation.isPending}><Plus className="h-4 w-4" />Add module</Button></div>
          </div>)}
          <footer className="course-section-footer"><Button variant="outline" disabled={sectionIndex === 0} onClick={() => setActiveSection(sections[sectionIndex - 1].id)}><ArrowLeft className="h-4 w-4" />Previous</Button>{sectionIndex < sections.length - 1 && <Button variant="outline" onClick={() => setActiveSection(sections[sectionIndex + 1].id)}>Next<ArrowRight className="h-4 w-4" /></Button>}</footer>
        </main>
        <aside className="course-builder-summary" aria-label="Course summary">
          <h2>Course summary</h2>
          {thumbnailPreview && <img src={thumbnailPreview} alt="Course preview" className="aspect-video w-full rounded-md object-cover" />}
          <h3 className="break-words text-base font-semibold">{courseData.courseName || "Untitled course"}</h3>
          <p className="line-clamp-3 break-words text-sm text-[var(--text-muted)]">{courseData.description || "No description yet"}</p>
          <dl>{[["Category", selectedCategoryName], ["Level", courseData.level], ["Status", courseData.status], ["Duration", `${courseData.duration} min`], ["Price", courseData.price ? `INR ${courseData.price.toFixed(2)}` : "Free"]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
        </aside>
      </div>
      <ConfirmDialog isOpen={showDeleteLessonModal} onClose={() => { setShowDeleteLessonModal(false); setLessonToDelete(null); }} onConfirm={async () => { if (lessonToDelete) { await deleteLessonMutation.mutateAsync(lessonToDelete); setShowDeleteLessonModal(false); setLessonToDelete(null); } }} title="Delete lesson" description="This permanently removes the lesson." confirmText="Delete" isDanger isLoading={deleteLessonMutation.isPending} />
      <ConfirmDialog isOpen={!!moduleToDelete} onClose={() => setModuleToDelete(null)} onConfirm={async () => { if (moduleToDelete) { await deleteModuleMutation.mutateAsync(moduleToDelete.moduleId); setModuleToDelete(null); } }} title="Delete module" description="This permanently removes the module and its lessons." confirmText="Delete" isDanger isLoading={deleteModuleMutation.isPending} />
    </div>
  );
};

export default CourseBuilder;
