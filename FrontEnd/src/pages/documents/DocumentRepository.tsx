import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useSelector } from 'react-redux';
import { FileText, Upload, Trash2, Download, Search, AlertCircle, X } from 'lucide-react';
// import { cn } from '@/lib/utils';
import React, { useState, useEffect, useRef } from "react";
import { executeHttpGetRequest, executeHttpPostRequest, executeHttpDeleteRequest } from "@/api/commonServices";
import toast from 'react-hot-toast';

const DocumentRepository = () => {
    const { user } = useSelector((state: any) => state.auth);
    const [documents, setDocuments] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Upload state
    const [isUploading, setIsUploading] = useState(false);
    const [uploadModalOpen, setUploadModalOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [topic, setTopic] = useState('general');
    const [file, setFile] = useState<any>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const isAdminOrMentor = user?.role?.roleName === 'admin' || user?.role?.roleName === 'mentor';

    const fetchDocuments = async () => {
        setIsLoading(true);
        try {
            const response = await executeHttpGetRequest('/documents');
            if (response.data.success) {
                setDocuments(response.data.data);
            }
        } catch (error) {
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
        if (!file || !title) {
            toast.error('Please provide a title and select a PDF file.');
            return;
        }

        const formData = new FormData();
        formData.append('title', title);
        formData.append('topic', topic);
        formData.append('file', file);

        setIsUploading(true);
        try {
            const response = await executeHttpPostRequest('/documents', formData, true);
            if (response.data.success) {
                toast.success('Document uploaded and is being processed by AI!');
                setUploadModalOpen(false);
                setTitle('');
                setTopic('general');
                setFile(null);
                fetchDocuments();
            }
        } catch (error) {
        console.error('Upload error:', error);
            toast.error((error as import('axios').AxiosError<{message?: string}>)?.response?.data?.message || 'Failed to upload document');
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this document?')) return;
        
        try {
            const response = await executeHttpDeleteRequest(`/documents/${id}`);
            if (response.data.success) {
                toast.success('Document deleted');
                setDocuments((docs: any) => docs.filter((d: any) => d.id !== id));
            }
        } catch (error) {
        console.error('Delete error:', error);
            toast.error('Failed to delete document');
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
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005';

    return (
        <div className="p-6 max-w-7xl mx-auto bg-slate-950 min-h-[calc(100vh-80px)]">
            <div className="flex-between mb-8 gap-4 flex-col md:flex-row">
                <div>
                    <h1 className="text-3xl font-bold text-slate-100">Document Repository</h1>
                    <p className="text-slate-400 mt-1">Access course materials, lecture notes, and PDFs powered by AI.</p>
                </div>
                {isAdminOrMentor && (
                    <Button 
                        onClick={() => setUploadModalOpen(true)}
                        className=" px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all shadow-lg shadow-blue-500/25"
                    >
                        <Upload className="icon-md" />
                        Upload Document
                    </Button>
                )}
            </div>

            {/* Search Bar */}
            <div className="relative mb-6">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="icon-md text-slate-500" />
                </div>
                <Input
                    type="text"
                    placeholder="Search documents by title or topic..."
                    value={searchTerm}
                    onChange={(event: React.SyntheticEvent<any>) => setSearchTerm((event.target as HTMLInputElement).value)}
                    className="!rounded-xl block pl-10 pr-3 py-3 leading-5 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 sm:text-sm transition-shadow shadow-inner"
                />
            </div>

            {/* Document Grid */}
            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
                </div>
            ) : filteredDocs.length === 0 ? (
                <div className="text-center py-16 bg-slate-900 rounded-xl border border-dashed border-slate-700">
                    <FileText className="mx-auto h-12 w-12 text-slate-500" />
                    <h3 className="mt-2 text-sm font-medium text-slate-300">No documents found</h3>
                    <p className="mt-1 text-sm text-slate-500">
                        {searchTerm ? "Try adjusting your search terms." : "Get started by uploading a new document."}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredDocs.map((doc: any) => (
                        <Card key={doc.id}  className="!p-0 shadow-lg overflow-hidden hover:border-slate-700 transition-all group flex flex-col">
                            <div className="p-5 flex-1">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400">
                                        <FileText className="w-8 h-8" />
                                    </div>
                                    <div className="flex gap-1">
                                        {isAdminOrMentor && (
                                            <button 
                                                onClick={() => handleDelete(doc.id)}
                                                className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
                                                title="Delete document"
                                            >
                                                <Trash2 className="icon-md" />
                                            </button>
                                        )}
                                        <a 
                                            href={`${baseUrl}${doc.fileUrl}`} 
                                            target="_blank" 
                                            rel="noreferrer"
                                            className="p-2 text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-md transition-colors"
                                            title="View / Download"
                                        >
                                            <Download className="icon-md" />
                                        </a>
                                    </div>
                                </div>
                                <h3 className="text-lg font-semibold text-slate-100 mb-1 line-clamp-1" title={doc.title}>{doc.title}</h3>
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300 capitalize border border-slate-700">
                                        {doc.topic || 'General'}
                                    </span>
                                    {doc.isProcessed ? (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                            AI Indexed
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 flex gap-1">
                                            <AlertCircle className="w-3 h-3" /> Processing...
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="flex-between bg-slate-950/50 px-5 py-3 border-t border-slate-800 text-xs text-slate-500">
                                <span>{formatBytes(doc.sizeBytes)}</span>
                                <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Upload Modal */}
            {uploadModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity" aria-hidden="true" onClick={() => !isUploading && setUploadModalOpen(false)}></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-bottom bg-slate-900 rounded-xl text-left overflow-hidden shadow-2xl border border-slate-800 transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <form onSubmit={handleUpload}>
                                <div className="bg-slate-900 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                    <div className="flex-between mb-5">
                                        <h3 className="text-xl leading-6 font-bold text-slate-100" id="modal-title">
                                            Upload Educational Document
                                        </h3>
                                        <button 
                                            type="button" 
                                            onClick={() => setUploadModalOpen(false)}
                                            className="text-slate-500 hover:text-slate-300 transition-colors"
                                            disabled={isUploading}
                                        >
                                            <X className="icon-lg" />
                                        </button>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        <div className="relative group mt-6">
                                            <Input
                                                id="docTitle"
                                                type="text"
                                                required
                                                value={title}
                                                onChange={(event: React.SyntheticEvent<any>) => setTitle((event.target as HTMLInputElement).value)}
                                                className="peer pt-6 pb-2 px-4 !rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all text-slate-100 placeholder-transparent"
                                                placeholder="Document Title"
                                            />
                                            <label 
                                                htmlFor="docTitle" 
                                                className="absolute left-4 top-4 text-slate-400 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:top-2 peer-focus:text-xs peer-focus:text-blue-400"
                                            >
                                                Document Title *
                                            </label>
                                        </div>
                                        <div className="relative">
                                            <label className="block text-xs text-slate-400 mb-1 ml-1">Topic / Subject</label>
                                            <select
                                                value={topic}
                                                onChange={(event: React.SyntheticEvent<any>) => setTopic((event.target as HTMLInputElement).value)}
                                                className="!rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent sm:text-sm capitalize text-slate-100 appearance-none"
                                            >
                                                <option value="general">General</option>
                                                <option value="math">Mathematics</option>
                                                <option value="science">Science</option>
                                                <option value="history">History</option>
                                                <option value="programming">Programming</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs text-slate-400 mb-1 ml-1">PDF File *</label>
                                            <Input
                                                type="file"
                                                accept=".pdf,application/pdf"
                                                required
                                                ref={fileInputRef}
                                                onChange={(event: React.SyntheticEvent<any>) => setFile((event.target as HTMLInputElement).files?.[0])}
                                                className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500 cursor-pointer"
                                            />
                                        </div>
                                    </div>
                                    <div className="mt-6 bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                                        <p className="text-xs text-blue-300 leading-relaxed">
                                            <strong className="text-blue-400">Note:</strong> Uploaded documents will be automatically processed and ingested into the AI's Vector Knowledge Base. This enables students to ask questions about the document's content.
                                        </p>
                                    </div>
                                </div>
                                <div className="bg-slate-950/50 px-4 py-4 sm:px-6 sm:flex sm:flex-row-reverse border-t border-slate-800">
                                    <Button
                                        type="submit"
                                        disabled={isUploading || !file || !title}
                                         className="w-full inline-flex justify-center rounded-lg shadow-lg shadow-blue-500/20 px-6 py-2.5 text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 focus:ring-offset-slate-900 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 transition-all flex items-center gap-2 border-transparent"
                                    >
                                        {isUploading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                                        {isUploading ? 'Processing...' : 'Upload & Process'}
                                    </Button>
                                    <Button variant="secondary"
                                        type="button"
                                        onClick={() => setUploadModalOpen(false)}
                                        disabled={isUploading}
                                        className="mt-3 w-full inline-flex justify-center rounded-lg shadow-sm px-6 py-2.5  text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 focus:ring-offset-slate-900 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DocumentRepository;

