/**
 * @fileoverview Free Resources page for Payilagam.
 * A dedicated hub for community-contributed materials, cheat sheets, and templates.
 * Includes a beautiful grid layout, category filtering, and an upload modal.
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { executeHttpGetRequest, executeHttpPostRequest } from "@/api/commonServices";
import { API_PATHS } from "@/api/constants";
import {
  Search,
  FileText,
  Video,
  FileIcon,
  Download,
  UploadCloud,
  Layers,
  Filter,
  Sparkles,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
  Input,
  Button,
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui";

const CATEGORIES = [
  "All",
  "Documents",
  "Spreadsheets",
  "Presentations",
  "Code",
  "Videos",
];

const ResourceCard = ({ resource }: any) => {
  const { user } = useSelector((state: any) => state.auth);
  const navigate = useNavigate();
  const location = useLocation();

  const handleDownload = async () => {
    if (!user) {
      toast.error("Please log in to download resources");
      navigate("/login", { state: { from: location } });
      return;
    }
    try {
      await executeHttpPostRequest(API_PATHS.RESOURCES.DOWNLOAD(resource.resourceId));
      window.open(
        resource.fileUrl.startsWith("http")
          ? resource.fileUrl
          : `http://localhost:5005${resource.fileUrl}`,
        "_blank",
      );
    } catch (error) {
      console.error(error);
      toast.error("Failed to start download");
    }
  };

  const formatSize = (bytes: any) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024,
      sizes = ["Bytes", "KB", "MB", "GB"],
      i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl p-5 shadow-sm hover:shadow-lg transition-all flex flex-col group h-full hover:border-[var(--accent-primary)] relative overflow-hidden">
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex justify-between items-start mb-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[var(--accent-primary-subtle)] border border-[var(--accent-primary-border)] text-[var(--accent-primary)] group-hover:scale-110 transition-all">
            {resource.type === "pdf" ? (
              <FileText className="w-6 h-6" />
            ) : resource.type === "video" ? (
              <Video className="w-6 h-6" />
            ) : (
              <FileIcon className="w-6 h-6" />
            )}
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--accent-primary)] bg-[var(--accent-primary-subtle)] border border-[var(--accent-primary-border)] px-3 py-1 rounded-full shadow-sm">
            {resource.category}
          </span>
        </div>
        <h4 className="font-bold text-base mb-2 text-[var(--text-heading)] group-hover:text-[var(--accent-primary)] transition-colors line-clamp-1">
          {resource.title}
        </h4>
        <p className="text-xs text-[var(--text-secondary)] mb-5 flex-1 line-clamp-2 leading-relaxed">
          {resource.description}
        </p>

        <div className="flex items-center justify-between border-t border-[var(--border-subtle)] pt-4 mt-auto">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-medium text-[var(--text-muted)]">
              By <span className="text-[var(--text-secondary)] font-medium">{resource.uploader?.fullName || "Community"}</span>
            </span>
            <span className="text-[10px] font-semibold text-[var(--text-muted)]">
              {formatSize(resource.sizeBytes)} • {resource.downloads} DLs
            </span>
          </div>
          <button
            onClick={handleDownload}
            aria-label="Download resource"
            className="text-[var(--text-secondary)] hover:text-white hover:bg-[var(--accent-primary)] p-2.5 rounded-lg transition-all border border-[var(--border-default)] hover:border-[var(--accent-primary)]"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

const FreeResources = () => {
  const { user } = useSelector((state: any) => state.auth);
  const navigate = useNavigate();
  const location = useLocation();

  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [resources, setResources] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Upload State
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<any>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadCategory, setUploadCategory] = useState("Documents");
  const [uploadDesc, setUploadDesc] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<any>(null);

  const fetchResources = useCallback(async (showLoader = true) => {
    if (showLoader) setIsLoading(true);
    try {
      const response = await executeHttpGetRequest(API_PATHS.RESOURCES.BASE, {
        category: activeCategory !== "All" ? activeCategory : undefined,
        search: searchTerm || undefined,
      });
      setResources(response.data?.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load resources");
    } finally {
      if (showLoader) setIsLoading(false);
    }
  }, [activeCategory, searchTerm]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchResources();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [fetchResources]);

  const handleUploadSubmit = async () => {
    if (!uploadFile) return toast.error("Please select a file");
    if (!uploadTitle.trim()) return toast.error("Title is required");

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("resourceFile", uploadFile);
      formData.append("title", uploadTitle);
      formData.append("category", uploadCategory);
      formData.append("description", uploadDesc);

      const response = await executeHttpPostRequest(API_PATHS.RESOURCES.BASE, formData, true);

      const newResource = response.data?.data || response.data;

      toast.success("Resource uploaded successfully!");
      setIsUploadOpen(false);
      setUploadFile(null);
      setUploadTitle("");
      setUploadDesc("");

      // Immediately add the new resource to the UI to give instant feedback
      if (activeCategory === "All" || activeCategory === uploadCategory) {
        setResources((prev: any) => [newResource, ...prev]);
      } else {
        setActiveCategory(uploadCategory);
      }

      // Also fetch silently to ensure any relations (like uploader name) are fully populated
      fetchResources(false);
    } catch (error) {
      console.error(error);
      toast.error((error as import('axios').AxiosError<{message?: string}>)?.response?.data?.message || "Failed to upload resource");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (event: React.SyntheticEvent<any>) => {
    if ((event.target as HTMLInputElement).files && (event.target as HTMLInputElement).files?.[0]) {
      setUploadFile((event.target as HTMLInputElement).files?.[0]);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] font-sans pb-20">
      {/* Hero Section */}
      <div className="bg-[var(--bg-surface)] py-16 lg:py-24 relative overflow-hidden border-b border-[var(--border-default)] shadow-sm">
        {/* Glowing Orbs */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[60%] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[50%] bg-sky-500/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--accent-primary-subtle)] border border-[var(--accent-primary-border)] text-[var(--accent-primary)] text-[10px] font-bold uppercase tracking-widest mb-6">
              <Sparkles className="w-3 h-3" />
              <span>Community Hub</span>
            </div>
            <h1 className="text-4xl lg:text-6xl font-extrabold text-[var(--text-heading)] tracking-tight leading-tight mb-6">
              Free Learning <br className="hidden md:block"/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-sky-500">Materials</span>
            </h1>
            <p className="text-[var(--text-secondary)] text-base md:text-lg mb-8 max-w-xl leading-relaxed">
              Accelerate your learning with high-quality cheat sheets,
              templates, and datasets contributed by the Payilagam community and
              expert mentors.
            </p>

            <div className="flex items-center gap-3 w-full max-w-md relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="text"
                placeholder="Search for resources..."
                value={searchTerm}
                onChange={(event: React.SyntheticEvent<any>) => setSearchTerm((event.target as HTMLInputElement).value)}
                className="w-full pl-9 pr-3 py-2.5 text-sm bg-[var(--bg-surface-2)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] transition-all"
              />
            </div>
          </div>

          {/* Upload Call to Action */}
          <div className="bg-[var(--bg-surface-2)] border border-[var(--border-default)] p-6 rounded-2xl shadow-sm w-full md:w-auto shrink-0 text-center">
            <div className="w-12 h-12 bg-[var(--accent-primary-subtle)] rounded-full flex items-center justify-center mx-auto mb-4 border border-[var(--accent-primary-border)]">
              <UploadCloud className="w-5 h-5 text-[var(--accent-primary)]" />
            </div>
            <h3 className="text-[var(--text-heading)] font-bold mb-2">
              Have something to share?
            </h3>
            <p className="text-xs text-[var(--text-muted)] mb-5 max-w-[200px] mx-auto">
              Upload your own resources to help fellow learners.
            </p>

            <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
              <DialogTrigger asChild>
                <Button 
                  onClick={(e: React.SyntheticEvent<any>) => {
                    if (!user) {
                      e.preventDefault();
                      toast.error("Please log in to upload resources");
                      navigate("/login", { state: { from: location } });
                    }
                  }}
                  className="w-full h-11 text-sm font-bold rounded-xl bg-[var(--action-bg)] hover:bg-[var(--action-hover)] text-white shadow-md transition-all"
                >
                  Upload Resource
                </Button>
              </DialogTrigger>
              <DialogContent showCloseButton={false} className="w-[480px] max-w-[95vw] bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-2xl shadow-2xl p-0 overflow-hidden text-[var(--text-primary)]">
                {/* Header */}
                <div className="px-6 pt-5 pb-4 border-b border-[var(--border-default)]">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[var(--accent-primary-subtle)] border border-[var(--accent-primary-border)] flex items-center justify-center shrink-0">
                        <UploadCloud className="w-5 h-5 text-[var(--accent-primary)]" />
                      </div>
                      <div>
                        <DialogTitle className="text-[15px] font-bold text-[var(--text-heading)] tracking-tight leading-tight">
                          Upload a Resource
                        </DialogTitle>
                        <p className="text-[11px] text-[var(--text-muted)] mt-0.5">Share your knowledge with the Payilagam community</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsUploadOpen(false)}
                      className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-lg transition-all cursor-pointer mt-0.5"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Body */}
                <div className="px-6 py-5 space-y-4">
                  {/* Drop zone */}
                  {!uploadFile ? (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={(event: React.SyntheticEvent<any>) => { event.preventDefault(); event.stopPropagation(); setDragActive(true); }}
                      onDragLeave={(event: React.SyntheticEvent<any>) => { event.preventDefault(); event.stopPropagation(); setDragActive(false); }}
                      onDrop={(event: React.SyntheticEvent<any>) => {
                        event.preventDefault(); event.stopPropagation(); setDragActive(false);
                        if ((event as React.DragEvent).dataTransfer.files?.[0])
                          setUploadFile((event as React.DragEvent).dataTransfer.files[0]);
                      }}
                      className={`relative rounded-xl border-2 border-dashed p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 group ${
                        dragActive
                          ? "border-blue-500 bg-blue-500/[0.08] shadow-[0_0_0_4px_rgba(59,130,246,0.06)]"
                          : "border-slate-700/60 bg-slate-800/20 hover:border-blue-500/50 hover:bg-blue-500/[0.04]"
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-all duration-200 shadow-lg ${
                        dragActive ? "bg-blue-500/20 scale-110" : "bg-slate-800 group-hover:bg-blue-500/15 group-hover:scale-105"
                      }`}>
                        <UploadCloud className={`w-5 h-5 transition-colors ${
                          dragActive ? "text-blue-400" : "text-slate-400 group-hover:text-blue-400"
                        }`} />
                      </div>
                      <p className="text-[13.5px] font-semibold text-slate-200 mb-1">
                        {dragActive ? "Drop your file here" : "Click to upload or drag & drop"}
                      </p>
                      <p className="text-[11px] text-slate-500">PDF, ZIP, PPT or MP4 &nbsp;·&nbsp; Max 500MB</p>
                      <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
                    </div>
                  ) : (
                    <div className="flex items-center gap-4 bg-blue-500/[0.08] border border-blue-500/20 rounded-xl px-4 py-3.5">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center shrink-0">
                        <FileIcon className="w-5 h-5 text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-slate-100 truncate">{uploadFile.name}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{(uploadFile.size / 1024 / 1024).toFixed(2)} MB &nbsp;·&nbsp; Ready to upload</p>
                      </div>
                      <button onClick={() => setUploadFile(null)} className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all cursor-pointer shrink-0">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Fields */}
                  <div className="space-y-3">
                    <div>
                      <label htmlFor="res-title" className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Resource Title</label>
                      <Input
                        id="res-title"
                        value={uploadTitle}
                        onChange={(event: React.SyntheticEvent<any>) => setUploadTitle((event.target as HTMLInputElement).value)}
                        placeholder="e.g., Python Cheat Sheet 2024"
                        className="h-10 bg-[var(--bg-surface-2)] border-[var(--border-default)] text-[var(--text-primary)] placeholder-[var(--text-muted)] text-[13px] rounded-xl focus:border-[var(--accent-primary)]"
                      />
                    </div>

                    <div>
                      <label htmlFor="res-category" className="block text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">Category</label>
                      <Select value={uploadCategory} onValueChange={setUploadCategory}>
                        <SelectTrigger id="res-category"><SelectValue /></SelectTrigger>
                        <SelectContent>{CATEGORIES.filter(c => c !== "All").map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label htmlFor="res-desc" className="block text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">Description <span className="text-[var(--text-muted)] normal-case font-normal tracking-normal">(optional)</span></label>
                      <Input
                        id="res-desc"
                        value={uploadDesc}
                        onChange={(event: React.SyntheticEvent<any>) => setUploadDesc((event.target as HTMLInputElement).value)}
                        placeholder="Briefly describe what this resource covers…"
                        className="h-10 bg-[var(--bg-surface-2)] border-[var(--border-default)] text-[var(--text-primary)] placeholder-[var(--text-muted)] text-[13px] rounded-xl focus:border-[var(--accent-primary)]"
                      />
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="px-6 pb-5 flex items-center justify-end gap-2.5">
                  <button
                    onClick={() => setIsUploadOpen(false)}
                    disabled={isUploading}
                    className="h-10 px-5 rounded-xl text-[13px] font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] border border-[var(--border-default)] transition-all cursor-pointer disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUploadSubmit}
                    disabled={isUploading || !uploadFile}
                    className="h-10 px-6 rounded-xl text-[13px] font-bold text-white bg-[var(--action-bg)] hover:bg-[var(--action-hover)] shadow-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] flex items-center gap-2"
                  >
                    {isUploading ? (
                      <><svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> Uploading…</>
                    ) : (
                      <><UploadCloud className="w-3.5 h-3.5" /> Upload Resource</>
                    )}
                  </button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        {/* Filters Box */}
        <div className="bg-[var(--bg-surface)] rounded-xl shadow-sm border border-[var(--border-default)] p-2 flex items-center justify-between overflow-x-auto gap-4 mb-5">
          <div className="flex items-center gap-1 min-w-max">
            <div className="px-3 py-1 flex items-center gap-1.5 text-xs font-bold text-[var(--text-muted)] border-r border-[var(--border-default)] mr-2">
              <Layers className="w-3.5 h-3.5" /> Categories
            </div>
            {CATEGORIES.map((cat: any) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeCategory === cat
                    ? "bg-[var(--accent-primary)] text-white shadow-sm"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] shrink-0">
            <Filter className="w-3 h-3" /> Filter
          </button>
        </div>

        {/* Resources Grid */}
        <div className="mb-6">
          <div className="flex justify-between items-end mb-4">
            <h2 className="text-lg font-bold text-[var(--text-heading)]">
              {activeCategory === "All" ? "Latest Additions" : activeCategory}
            </h2>
            <span className="text-xs text-[var(--text-muted)] font-medium">
              {Array.isArray(resources) ? resources.length : 0} resources found
            </span>
          </div>

          {isLoading ? (
            <div className="flex justify-center my-12">
              <div className="w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
          ) : Array.isArray(resources) && resources.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.isArray(resources)
                ? resources.map((resource: any) => (
                    <ResourceCard key={resource.resourceId} resource={resource} />
                  ))
                : null}
            </div>
          ) : (
            <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl p-12 text-center flex flex-col items-center">
              <div className="w-12 h-12 bg-[var(--bg-surface-2)] rounded-full flex items-center justify-center mb-4">
                <Search className="w-5 h-5 text-[var(--text-muted)]" />
              </div>
              <h3 className="text-sm font-bold text-[var(--text-heading)] mb-1">
                No resources found
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                Try adjusting your search or upload the first resource in this
                category!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FreeResources;


