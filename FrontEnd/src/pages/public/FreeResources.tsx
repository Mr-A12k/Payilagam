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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Label,
  Button,
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
          : `http://localhost:5000${resource.fileUrl}`,
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
    <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-xl p-5 shadow-lg hover:shadow-[0_0_25px_rgba(56,189,248,0.1)] transition-all flex flex-col group h-full hover:border-slate-700 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex justify-between items-start mb-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-slate-950 border border-slate-800 text-blue-400 group-hover:scale-110 group-hover:border-blue-500/30 group-hover:bg-blue-500/10 transition-all shadow-inner shadow-blue-900/20">
            {resource.type === "pdf" ? (
              <FileText className="w-6 h-6" />
            ) : resource.type === "video" ? (
              <Video className="w-6 h-6" />
            ) : (
              <FileIcon className="w-6 h-6" />
            )}
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-sky-300 bg-slate-950/80 border border-slate-800 px-3 py-1 rounded-full shadow-sm">
            {resource.category}
          </span>
        </div>
        <h4 className="font-bold text-base mb-2 text-slate-100 group-hover:text-blue-400 transition-colors line-clamp-1">
          {resource.title}
        </h4>
        <p className="text-xs text-slate-400 mb-5 flex-1 line-clamp-2 leading-relaxed">
          {resource.description}
        </p>

        <div className="flex items-center justify-between border-t border-slate-800/80 pt-4 mt-auto">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-medium text-slate-500">
              By <span className="text-slate-300">{resource.uploader?.fullName || "Community"}</span>
            </span>
            <span className="text-[10px] font-bold text-slate-400">
              {formatSize(resource.sizeBytes)} • {resource.downloads} DLs
            </span>
          </div>
          <button
            onClick={handleDownload}
            className="text-slate-400 hover:text-white hover:bg-blue-600 p-2.5 rounded-lg transition-all border border-slate-700 hover:border-blue-500 hover:shadow-[0_0_15px_rgba(37,99,235,0.4)]"
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
    <div className="min-h-screen bg-slate-950 font-sans pb-20">
      {/* Hero Section */}
      <div className="bg-slate-950 py-16 lg:py-24 relative overflow-hidden border-b border-slate-900/50 shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
        {/* Glowing Orbs */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[60%] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[50%] bg-sky-500/10 blur-[100px] rounded-full pointer-events-none" />

        {/* Decorative Grid */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        ></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-sky-300 text-[10px] font-bold uppercase tracking-widest mb-6 shadow-[0_0_15px_rgba(56,189,248,0.15)]">
              <Sparkles className="w-3 h-3" />
              <span>Community Hub</span>
            </div>
            <h1 className="text-4xl lg:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-200 to-slate-500 tracking-tight leading-tight mb-6 drop-shadow-sm">
              Free Learning <br className="hidden md:block"/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-sky-300">Materials</span>
            </h1>
            <p className="text-slate-400 text-base md:text-lg mb-8 max-w-xl leading-relaxed">
              Accelerate your learning with high-quality cheat sheets,
              templates, and datasets contributed by the Payilagam community and
              expert mentors.
            </p>

            <div className="flex items-center gap-3 w-full max-w-md relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search for resources..."
                value={searchTerm}
                onChange={(event: React.SyntheticEvent<any>) => setSearchTerm((event.target as HTMLInputElement).value)}
                className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-900/10 border border-white/20 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-sm transition-all"
              />
            </div>
          </div>

          {/* Upload Call to Action */}
          <div className="bg-slate-900/5 border border-white/10 p-6 rounded-xl backdrop-blur-md w-full md:w-auto shrink-0 text-center">
            <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/30">
              <UploadCloud className="w-5 h-5 text-blue-300" />
            </div>
            <h3 className="text-white font-bold mb-2">
              Have something to share?
            </h3>
            <p className="text-xs text-slate-400 mb-5 max-w-[200px] mx-auto">
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
                  className="w-full h-11 text-sm font-bold rounded-xl bg-blue-600 hover:bg-blue-500 border-0 shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all transform hover:-translate-y-0.5 text-white"
                >
                  Upload Resource
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md border-slate-800">
                <DialogHeader>
                  <DialogTitle className="text-lg font-bold text-slate-100">
                    Upload a Resource
                  </DialogTitle>
                  <p className="text-xs text-slate-500">
                    Share your knowledge with the Payilagam community.
                  </p>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  {!uploadFile ? (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={(event: React.SyntheticEvent<any>) => {
                        event.preventDefault();
                        event.stopPropagation();
                        setDragActive(true);
                      }}
                      onDragLeave={(event: React.SyntheticEvent<any>) => {
                        event.preventDefault();
                        event.stopPropagation();
                        setDragActive(false);
                      }}
                      onDrop={(event: React.SyntheticEvent<any>) => {
                        event.preventDefault();
                        event.stopPropagation();
                        setDragActive(false);
                        if ((event as React.DragEvent).dataTransfer.files && (event as React.DragEvent).dataTransfer.files[0])
                          setUploadFile((event as React.DragEvent).dataTransfer.files[0]);
                      }}
                      className={`border-2 border-dashed rounded-md p-8 flex flex-col items-center justify-center text-center transition-colors cursor-pointer group ${dragActive ? "border-blue-500 bg-blue-500/10" : "border-slate-800 hover:border-blue-500 hover:bg-blue-500/10/50 bg-slate-950"}`}
                    >
                      <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center mb-3 group-hover:bg-blue-200 group-hover:scale-110 transition-all">
                        <UploadCloud className="w-5 h-5 text-blue-600" />
                      </div>
                      <h4 className="text-sm font-semibold text-slate-100 mb-1">
                        Click to upload or drag and drop
                      </h4>
                      <p className="text-[10px] text-slate-500">
                        PDF, ZIP, PPT, or MP4 (max. 500MB)
                      </p>
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </div>
                  ) : (
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-md p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileIcon className="w-8 h-8 text-blue-500" />
                        <div>
                          <p className="text-sm font-semibold text-slate-100 truncate max-w-[200px]">
                            {uploadFile.name}
                          </p>
                          <p className="text-[10px] text-slate-500">
                            {(uploadFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setUploadFile(null)}
                        className="text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  <div className="space-y-3">
                    <div>
                      <Label
                        htmlFor="title"
                        className="text-xs font-semibold text-slate-300"
                      >
                        Resource Title
                      </Label>
                      <Input
                        id="title"
                        value={uploadTitle}
                        onChange={(event: React.SyntheticEvent<any>) => setUploadTitle((event.target as HTMLInputElement).value)}
                        placeholder="e.g., Python Cheat Sheet"
                        className="mt-1 h-8 text-xs rounded-md"
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="category"
                        className="text-xs font-semibold text-slate-300"
                      >
                        Category
                      </Label>
                      <select
                        id="category"
                        value={uploadCategory}
                        onChange={(event: React.SyntheticEvent<any>) => setUploadCategory((event.target as HTMLInputElement).value)}
                        className="mt-1 w-full h-8 text-xs rounded-md border border-slate-800 px-3 bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-300"
                      >
                        {CATEGORIES.filter((c: any) => c !== "All").map((c: any) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label
                        htmlFor="desc"
                        className="text-xs font-semibold text-slate-300"
                      >
                        Description (Optional)
                      </Label>
                      <Input
                        id="desc"
                        value={uploadDesc}
                        onChange={(event: React.SyntheticEvent<any>) => setUploadDesc((event.target as HTMLInputElement).value)}
                        placeholder="Briefly describe what this resource contains..."
                        className="mt-1 h-8 text-xs rounded-md"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                  <Button
                    variant="outline"
                    className="h-8 text-xs px-4 rounded-md"
                    onClick={() => setIsUploadOpen(false)}
                    disabled={isUploading}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="h-8 text-xs px-5 rounded-md bg-blue-600 hover:bg-blue-700"
                    onClick={handleUploadSubmit}
                    disabled={isUploading}
                  >
                    {isUploading ? "Uploading..." : "Upload File"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        {/* Filters Box */}
        <div className="bg-slate-900 rounded-md shadow-sm border border-slate-800 p-2 flex items-center justify-between overflow-x-auto gap-4 mb-5">
          <div className="flex items-center gap-1 min-w-max">
            <div className="px-3 py-1 flex items-center gap-1.5 text-xs font-bold text-slate-400 border-r border-slate-800 mr-2">
              <Layers className="w-3.5 h-3.5" /> Categories
            </div>
            {CATEGORIES.map((cat: any) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                  activeCategory === cat
                    ? "bg-slate-950 border border-slate-700 text-sky-300 shadow-[0_0_10px_rgba(56,189,248,0.1)]"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-100 shrink-0">
            <Filter className="w-3 h-3" /> Filter
          </button>
        </div>

        {/* Resources Grid */}
        <div className="mb-6">
          <div className="flex justify-between items-end mb-4">
            <h2 className="text-lg font-bold text-slate-100">
              {activeCategory === "All" ? "Latest Additions" : activeCategory}
            </h2>
            <span className="text-xs text-slate-500 font-medium">
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
            <div className="bg-slate-900 border border-slate-800 rounded-md p-12 text-center flex flex-col items-center">
              <div className="w-12 h-12 bg-slate-950 rounded-full flex items-center justify-center mb-4">
                <Search className="w-5 h-5 text-slate-400" />
              </div>
              <h3 className="text-sm font-bold text-slate-100 mb-1">
                No resources found
              </h3>
              <p className="text-xs text-slate-500">
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


