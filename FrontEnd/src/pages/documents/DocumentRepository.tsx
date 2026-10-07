import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Dialog, DialogContent, DialogTitle, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui";
import { useSelector } from 'react-redux';
import { FileText, Upload, Trash2, Download, Search, AlertCircle, ExternalLink } from 'lucide-react';
import React, { useState, useEffect, useRef } from "react";
import { executeHttpGetRequest, executeHttpPostRequest, executeHttpDeleteRequest } from "@/api/commonServices";
import toast from 'react-hot-toast';
import { WorkspacePage, PageHeader, LoadingState, EmptyState } from "@/components/workspace/Workspace";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import "./DocumentRepository.css";

const DocumentRepository = () => {
    const { user } = useSelector((state: any) => state.auth);
    const [documents, setDocuments] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Upload state
    const [isUploading, setIsUploading] = useState(false);
    const [uploadModalOpen, setUploadModalOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [topic, setTopic] = useState('general');
    const [file, setFile] = useState<any>(null);
    const [sharingConsent, setSharingConsent] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Delete confirm state
    const [deleteTarget, setDeleteTarget] = useState<any>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const isAdminOrMentor = user?.role === 'admin' || user?.role === 'mentor';

    const fetchDocuments = async () => {
        setIsLoading(true);
        setLoadError(false);
        try {
            const response = await executeHttpGetRequest('/documents');
            if (response.data.success) {
                setDocuments(response.data.data);
            }
        } catch (error) {
            setLoadError(true);
            console.error('Error fetching documents:', error);
            toast.error('Failed to load documents');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, []);

    const handleUpload = async (event: React.SyntheticEvent<any>) => {
        event.preventDefault();
        if (!file || !title.trim()) {
            toast.error('Please provide a title and select a PDF file.');
            return;
        }
        if (!sharingConsent) {
            toast.error('Confirm sharing with Everyone in Payilagam.');
            return;
        }
        if (!file.name.toLowerCase().endsWith('.pdf') || file.size > 50 * 1024 * 1024 || file.size === 0) {
            toast.error('Select a PDF up to 50 MB.');
            return;
        }

        const formData = new FormData();
        formData.append('title', title.trim());
        formData.append('topic', topic);
        formData.append('file', file);

        setIsUploading(true);
        try {
            const response = await executeHttpPostRequest('/documents', formData, true);
            if (response.data.success) {
                toast.success('Document shared with Everyone in Payilagam.');
                setUploadModalOpen(false);
                setTitle('');
                setTopic('general');
                setFile(null);
                setSharingConsent(false);
                fetchDocuments();
            }
        } catch (error) {
            console.error('Upload error:', error);
            toast.error((error as import('axios').AxiosError<{message?: string}>)?.response?.data?.message || 'Failed to upload document');
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setIsDeleting(true);
        try {
            const response = await executeHttpDeleteRequest(`/documents/${deleteTarget.id}`);
            if (response.data.success) {
                toast.success('Document deleted');
                setDocuments((docs: any) => docs.filter((d: any) => d.id !== deleteTarget.id));
                setDeleteTarget(null);
            }
        } catch (error) {
            console.error('Delete error:', error);
            toast.error('Failed to delete document');
        } finally {
            setIsDeleting(false);
        }
    };

    const filteredDocs = documents.filter((doc: any) =>
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (doc.topic && doc.topic.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const formatBytes = (bytes: any) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const baseUrl = (import.meta.env.VITE_API_URL || '/api').replace(/\/api\/?$/, '').replace(/\/$/, '');

    return (
        <WorkspacePage className="document-repository">
            <PageHeader title="Documents" description="Shared knowledge base for everyone in Payilagam." actions={user ? (
                <Button
                    onClick={() => { setSharingConsent(false); setFile(null); setTitle(''); setTopic('general'); setUploadModalOpen(true); }}
                    className="shrink-0"
                >
                    <Upload className="h-4 w-4" />
                    {isAdminOrMentor ? 'Upload document' : 'Share document'}
                </Button>
            ) : undefined} />

            {/* ── Toolbar ────────────────────────────── */}
            <div className="doc-toolbar">
                <div className="doc-search">
                    <Search aria-hidden="true" />
                    <Input
                        type="text"
                        aria-label="Search documents"
                        placeholder="Search by title or topic…"
                        value={searchTerm}
                        onChange={(event: React.SyntheticEvent<any>) => setSearchTerm((event.target as HTMLInputElement).value)}
                        className="block pl-10 pr-3 text-sm"
                    />
                </div>
                <span className="doc-count" role="status">
                    {isLoading ? "Loading…" : loadError ? "Unavailable" : `${filteredDocs.length} ${filteredDocs.length === 1 ? 'document' : 'documents'}`}
                </span>
            </div>

            {/* ── Document grid ──────────────────────── */}
            {isLoading ? (
                <LoadingState label="Loading documents…" />
            ) : loadError ? (
                <div role="alert" className="doc-error">
                    <AlertCircle />
                    <p>Documents could not be loaded.</p>
                    <Button variant="outline" onClick={fetchDocuments}>Retry</Button>
                </div>
            ) : filteredDocs.length === 0 ? (
                <EmptyState
                    title={searchTerm ? "No matching documents" : "No documents shared yet"}
                    description={searchTerm ? undefined : "Upload a PDF to share knowledge with your peers."}
                    action={searchTerm ? <Button variant="secondary" onClick={() => setSearchTerm('')}>Clear search</Button> : undefined}
                />
            ) : (
                <div className="doc-grid">
                    {filteredDocs.map((doc: any) => (
                        <article key={doc.id} className="doc-card">
                            {/* Preview strip */}
                            <div className="doc-preview">
                                <FileText className="doc-file-icon" aria-hidden="true" />
                                <span className="doc-topic-badge">{doc.topic || 'General'}</span>
                            </div>

                            {/* Body */}
                            <div className="doc-body">
                                <h2 title={doc.title}>{doc.title}</h2>
                                <div className="doc-meta">
                                    <span>{formatBytes(doc.sizeBytes)}</span>
                                    <time dateTime={doc.createdAt}>{formatDate(doc.createdAt)}</time>
                                </div>
                                <span className={`doc-ai-badge ${doc.isProcessed ? 'is-indexed' : 'is-processing'}`}>
                                    <span className="doc-ai-dot" />
                                    {doc.isProcessed ? 'AI indexed' : 'Processing…'}
                                </span>
                            </div>

                            {/* Actions footer */}
                            <div className="doc-footer">
                                {(isAdminOrMentor || Number(doc.uploaderId) === Number(user?.userId)) && (
                                    <button
                                        className="doc-action-btn is-danger"
                                        onClick={() => setDeleteTarget(doc)}
                                        title="Delete document"
                                        aria-label={`Delete ${doc.title}`}
                                    >
                                        <Trash2 />
                                    </button>
                                )}
                                <a
                                    href={`${baseUrl}${doc.fileUrl}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="doc-action-btn"
                                    title="View / Download"
                                    aria-label={`View or download ${doc.title}`}
                                >
                                    <Download />
                                </a>
                                <a
                                    href={`${baseUrl}${doc.fileUrl}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="doc-action-btn"
                                    title="Open in new tab"
                                    aria-label={`Open ${doc.title} in new tab`}
                                >
                                    <ExternalLink />
                                </a>
                            </div>
                        </article>
                    ))}
                </div>
            )}

            {/* ── Delete confirm dialog ──────────────── */}
            <ConfirmDialog
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
                title="Delete document"
                description={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
                confirmText="Delete"
                isDanger={true}
                isLoading={isDeleting}
            />

            {/* ── Upload modal ───────────────────────── */}
            <Dialog open={uploadModalOpen} onOpenChange={(open: boolean) => { if (!isUploading) setUploadModalOpen(open); }}>
                <DialogContent showCloseButton={!isUploading} aria-describedby={undefined} className="doc-upload-dialog !w-[calc(100%-2rem)] !max-w-lg max-h-[90dvh] overflow-y-auto !bg-[var(--bg-surface)] text-[var(--text-primary)] border-[var(--border-default)] !rounded-xl !p-0">
                    <form onSubmit={handleUpload}>
                        <div className="doc-upload-body">
                            <DialogTitle className="doc-upload-title">
                                {isAdminOrMentor ? 'Upload document' : 'Share document'}
                            </DialogTitle>

                            <div className="doc-upload-fields">
                                {/* Title */}
                                <div className="doc-upload-field">
                                    <label htmlFor="docTitle">Document title <span className="doc-required">*</span></label>
                                    <input
                                        id="docTitle"
                                        type="text"
                                        required
                                        value={title}
                                        onChange={(event) => setTitle(event.target.value)}
                                        placeholder="e.g. Introduction to React Hooks"
                                    />
                                </div>

                                {/* Topic */}
                                <div className="doc-upload-field">
                                    <label htmlFor="docTopic">Topic / Subject</label>
                                    <Select value={topic} onValueChange={setTopic}>
                                        <SelectTrigger id="docTopic"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="general">General</SelectItem>
                                            <SelectItem value="math">Mathematics</SelectItem>
                                            <SelectItem value="science">Science</SelectItem>
                                            <SelectItem value="history">History</SelectItem>
                                            <SelectItem value="programming">Programming</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* File zone */}
                                <div className="doc-upload-field">
                                    <label>PDF file <span className="doc-required">*</span></label>
                                    <input
                                        type="file"
                                        accept=".pdf,application/pdf"
                                        required
                                        ref={fileInputRef}
                                        onChange={(event) => setFile(event.target.files?.[0])}
                                        hidden
                                    />
                                    <div
                                        className={`doc-file-zone${file ? ' has-file' : ''}`}
                                        onClick={() => fileInputRef.current?.click()}
                                        onDragOver={e => { e.preventDefault(); }}
                                        onDrop={e => {
                                            e.preventDefault();
                                            const dropped = e.dataTransfer.files?.[0];
                                            if (dropped?.type === 'application/pdf') setFile(dropped);
                                            else toast.error('Only PDF files are accepted.');
                                        }}
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInputRef.current?.click(); } }}
                                        aria-label="Select or drop a PDF file"
                                    >
                                        {file ? (
                                            <>
                                                <FileText className="doc-file-zone-icon" style={{ color: 'var(--accent-success)' }} />
                                                <span className="doc-file-name">{file.name}</span>
                                                <small>{formatBytes(file.size)}</small>
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="doc-file-zone-icon" />
                                                <p>Click to browse or drag & drop</p>
                                                <small>PDF only, up to 50 MB</small>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Consent */}
                                <label className="doc-consent">
                                    <input type="checkbox" checked={sharingConsent} onChange={e => setSharingConsent(e.target.checked)} required />
                                    <span>I agree to share this PDF with <strong>Everyone in Payilagam</strong>.</span>
                                </label>
                            </div>
                        </div>

                        <div className="doc-upload-footer">
                            <button
                                type="button"
                                className="doc-btn doc-btn-secondary"
                                onClick={() => setUploadModalOpen(false)}
                                disabled={isUploading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="doc-btn doc-btn-primary"
                                disabled={isUploading || !file || !title.trim() || !sharingConsent}
                            >
                                {isUploading && <span className="doc-spinner" />}
                                <Upload />
                                {isUploading ? 'Sharing…' : isAdminOrMentor ? 'Upload & process' : 'Share document'}
                            </button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </WorkspacePage>
    );
};

export default DocumentRepository;
