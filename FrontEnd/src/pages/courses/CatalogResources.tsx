import { lazy, Suspense, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { FileText, Video, Image as ImageIcon, FileIcon, Eye, Download, Flag, UploadCloud } from "lucide-react";
import { Card, Button, Input, Label, Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui";
import { executeHttpGetRequest, executeHttpPostRequest } from "@/api/commonServices";
import { API_PATHS } from "@/api/constants";
import { LoadingState, EmptyState } from "@/components/workspace/Workspace";

const PdfPreview = lazy(() => import("./CatalogPdfPreview"));

const ResourceCard = ({ resource }: any) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isReporting, setIsReporting] = useState(false);
  const [reportReason, setReportReason] = useState("");

  const baseUrl =
    import.meta.env.VITE_API_URL?.split("/api")[0] || "http://localhost:5005";
  const fileUrl = `${baseUrl}${resource.fileUrl}`;

  const handleDownload = (event: React.SyntheticEvent<any>) => {
    event.stopPropagation();
    window.open(fileUrl, "_blank", "noopener,noreferrer");
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
        <Card className="course-resource-card flex flex-col group hover:border-[var(--accent-primary-border)] relative overflow-hidden">

          <div className="flex-center w-12 h-12 rounded-lg mb-4 bg-[var(--bg-surface-2)] text-[var(--accent-primary)] group-hover:scale-110 group-hover:bg-[var(--accent-primary-subtle)] transition-all duration-300 relative z-10 border border-[var(--border-default)]">
            {resource.type === "pdf" ? (
              <FileText className="h-4 w-4 text-[var(--status-danger)]" />
            ) : resource.type === "video" ? (
              <Video className="h-4 w-4 text-[var(--accent-primary)]" />
            ) : resource.type === "image" ? (
              <ImageIcon className="h-4 w-4 text-[var(--status-success)]" />
            ) : resource.type === "document" ? (
              <FileText className="h-4 w-4 text-[var(--accent-primary)]" />
            ) : (
              <FileIcon className="h-4 w-4 text-[var(--text-muted)]" />
            )}
          </div>
          <h4 className="font-bold text-sm mb-1 text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors line-clamp-1 relative z-10">
            <DialogTrigger asChild><button className="text-left hover:underline" title={`Preview ${resource.title}`}>{resource.title}</button></DialogTrigger>
          </h4>
          <p className="text-[11px] text-[var(--text-muted)] mb-4 flex-1 line-clamp-2 leading-relaxed relative z-10">
            {resource.description || "No description provided."}
          </p>
          <div className="flex-between border-t border-[var(--border-default)] pt-3 mt-auto relative z-10">
            <span className="text-[10px] font-bold uppercase text-[var(--text-muted)] bg-[var(--bg-base)] px-2 py-1 rounded border border-[var(--border-default)]">
              {(resource.sizeBytes / (1024 * 1024)).toFixed(2)} MB
            </span>
            <div className="flex gap-1">
              <button
                onClick={(event: React.SyntheticEvent<any>) => {
                  event.stopPropagation();
                  setIsPreviewOpen(true);
                }}
                className="text-[var(--text-muted)] hover:text-[var(--accent-primary)] hover:bg-[var(--accent-primary-subtle)] p-1.5 rounded-md transition-colors"
                title="Preview"
                aria-label={`Preview ${resource.title}`}
              >
                <Eye className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleDownload}
                className="text-[var(--text-muted)] hover:text-[var(--accent-primary)] hover:bg-[var(--accent-primary-subtle)] p-1.5 rounded-md transition-colors"
                title="Download"
                aria-label={`Download ${resource.title}`}
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </Card>

      <DialogContent className="sm:max-w-5xl h-[90vh] flex flex-col p-0 overflow-hidden bg-[var(--bg-base)] border-[var(--border-default)]">
        <DialogHeader className="course-preview-header p-4 border-b border-[var(--border-default)] bg-[var(--bg-surface)] flex-row justify-between items-center space-y-0">
          <div className="min-w-0">
            <DialogTitle className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
              {resource.type === "pdf" && (
                <FileText className="h-4 w-4 text-[var(--status-danger)]" />
              )}
              {resource.type === "video" && (
                <Video className="h-4 w-4 text-[var(--accent-primary)]" />
              )}
              {resource.type === "image" && (
                <ImageIcon className="h-4 w-4 text-[var(--status-success)]" />
              )}
              {resource.type === "document" && (
                <FileText className="h-4 w-4 text-[var(--accent-primary)]" />
              )}
              {resource.title}
            </DialogTitle>
          </div>
          <div className="flex items-center gap-2 mr-10">
            <Dialog>
              <DialogTrigger asChild>
                <button className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-surface-2)] hover:bg-[var(--bg-surface-2)] border border-[var(--border-default)] px-3 py-1.5 rounded-md transition-colors">
                  <Flag className="w-3.5 h-3.5 text-[var(--text-muted)]" /> Report
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md bg-[var(--bg-surface)] border-[var(--border-default)]">
                <DialogHeader>
                  <DialogTitle className="text-[var(--text-primary)]">
                    Report Resource
                  </DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  <Label htmlFor={`report-${resource.resourceId}`} className="text-[var(--text-secondary)]">Reason for reporting</Label>
                  <Input
                    id={`report-${resource.resourceId}`}
                    value={reportReason}
                    onChange={(event: React.SyntheticEvent<any>) =>
                      setReportReason((event.target as HTMLInputElement).value)
                    }
                    placeholder="e.g., Inappropriate content, copyright infringement..."
                    className="mt-2 text-[var(--text-primary)] focus:border-[var(--accent-primary-border)]"
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
              className="h-8 text-xs bg-[var(--bg-surface-2)] border-[var(--border-default)] text-[var(--text-primary)] hover:bg-[var(--bg-surface-2)]"
            >
              <Download className="h-4 w-4 mr-1.5" /> Download
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto bg-[var(--bg-base)] flex items-center justify-center p-4">
          {resource.type === "pdf" ? (
            <Suspense fallback={<LoadingState label="Loading PDF viewer..." />}><PdfPreview url={fileUrl} title={resource.title} /></Suspense>
          ) : resource.type === "video" ? (
            <video
              src={fileUrl}
              controls
              className="max-w-full max-h-full rounded-md"
            />
          ) : resource.type === "image" ? (
            <img
              src={fileUrl}
              alt={resource.title}
              className="max-w-full max-h-full object-contain rounded-md"
            />
          ) : (
            <div className="text-center text-[var(--text-muted)]">
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

export default function CatalogResources() {
  const user = useSelector((state: any) => state.auth.user);
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ["resources"], queryFn: () => executeHttpGetRequest(API_PATHS.RESOURCES.BASE) });
  const resources = Array.isArray(query.data?.data?.data) ? query.data.data.data : [];
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);
  async function upload(event: React.FormEvent) {
    event.preventDefault();
    if (!file || !title.trim()) return;
    if (!file.size || file.size > 500 * 1024 * 1024) { toast.error("Choose a file up to 500 MB."); return; }
    const body = new FormData();
    body.append("resourceFile", file);
    body.append("title", title.trim());
    body.append("description", description.trim());
    body.append("category", "General");
    setBusy(true);
    try {
      await executeHttpPostRequest(API_PATHS.RESOURCES.BASE, body, true);
      await queryClient.invalidateQueries({ queryKey: ["resources"] });
      toast.success("Resource shared.");
      setOpen(false); setFile(null); setTitle(""); setDescription("");
    } catch (error) {
      toast.error((error as import("axios").AxiosError<{message?: string}>)?.response?.data?.message || "Could not upload resource.");
    } finally { setBusy(false); }
  }
  return <section className="catalog-resource-library" aria-labelledby="catalog-resources-title">
    <div className="catalog-section-heading"><div><h2 id="catalog-resources-title">Resource library</h2><p>Community-shared files and learning material</p></div>
      {user ? <Button variant="outline" size="sm" onClick={() => setOpen(true)}><UploadCloud className="h-4 w-4" />Share resource</Button> : <Button asChild variant="outline" size="sm"><Link to="/login">Log in to share</Link></Button>}
    </div>
    {query.isLoading ? <LoadingState label="Loading resources..." /> : query.isError ? <div role="alert" className="course-error"><p>Resources could not be loaded.</p><Button variant="outline" onClick={() => query.refetch()}>Retry</Button></div> : !resources.length ? <EmptyState title="No resources shared yet" /> : <div className="catalog-resources-grid">{resources.map((resource: any) => <ResourceCard key={resource.resourceId} resource={resource} />)}</div>}
    <Dialog open={open} onOpenChange={(next: boolean) => { if (!busy) setOpen(next); }}>
      <DialogContent className="catalog-upload-dialog sm:max-w-md" showCloseButton={!busy} aria-describedby={undefined}>
        <DialogHeader><DialogTitle>Share a resource</DialogTitle></DialogHeader>
        <form onSubmit={upload} className="catalog-upload-form">
          <div><Label htmlFor="catalog-file">File</Label><Input id="catalog-file" type="file" accept=".pdf,.jpg,.jpeg,.png,.gif,.mp4,.mov,.avi,.mkv,.doc,.docx,.xls,.xlsx" required onChange={event => setFile(event.target.files?.[0] || null)} /><p className="catalog-file-limit">PDF, images, videos or office documents. Up to 500 MB.</p></div>
          <div><Label htmlFor="catalog-resource-title">Title</Label><Input id="catalog-resource-title" required maxLength={200} value={title} onChange={event => setTitle(event.target.value)} /></div>
          <div><Label htmlFor="catalog-resource-description">Description</Label><textarea id="catalog-resource-description" rows={3} value={description} onChange={event => setDescription(event.target.value)} /></div>
          <div className="catalog-upload-actions"><Button type="button" variant="outline" disabled={busy} onClick={() => setOpen(false)}>Cancel</Button><Button type="submit" disabled={busy || !file || !title.trim()}>{busy ? "Sharing..." : "Share resource"}</Button></div>
        </form>
      </DialogContent>
    </Dialog>
  </section>;
}

