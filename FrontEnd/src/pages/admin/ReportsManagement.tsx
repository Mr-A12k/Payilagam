import { useState } from "react";
import {
  Flag,
  Trash2,
  CheckCircle,
  ExternalLink,
  Loader2,
  FileText,
  Video,
  Image as ImageIcon,
  FileIcon,
} from "lucide-react";
import { Card } from "@/components/ui";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  executeHttpGetRequest,
  executeHttpPatchRequest,
  executeHttpDeleteRequest,
} from "@/api/commonServices";
import { API_PATHS } from "@/api/constants";
import toast from "react-hot-toast";

const ReportsManagement = () => {
  const queryClient = useQueryClient();
  const [processingId, setProcessingId] = useState<any>(null);

  const {
    data: responseData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["adminReports"],
    queryFn: () => executeHttpGetRequest(API_PATHS.REPORTS.ALL),
  });

  const reports = responseData?.data?.data || [];

  const handleDismiss = async (reportId: string) => {
    setProcessingId(reportId);
    try {
      await executeHttpPatchRequest(
        API_PATHS.REPORTS.UPDATE_STATUS(reportId!),
        { status: "dismissed" },
      );
      toast.success("Report dismissed");
      queryClient.invalidateQueries({ queryKey: ["adminReports"] });
    } catch (error: any) {
      toast.error(
        (error as import("axios").AxiosError<{ message?: string }>)?.response
          ?.data?.message || "Failed to dismiss report",
      );
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeleteResource = async (reportId: string, resourceId: string) => {
    if (
      !window.confirm(
        "Are you sure you want to completely delete this resource? This cannot be undone.",
      )
    )
      return;

    setProcessingId(reportId);
    try {
      await executeHttpDeleteRequest(
        `${API_PATHS.RESOURCES.BASE}/${resourceId}`,
      );
      toast.success("Resource deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["adminReports"] });
    } catch (error: any) {
      toast.error(
        (error as import("axios").AxiosError<{ message?: string }>)?.response
          ?.data?.message || "Failed to delete resource",
      );
    } finally {
      setProcessingId(null);
    }
  };

  const getIcon = (type: any) => {
    switch (type) {
      case "pdf":
        return (
          <FileText className="icon-md text-red-400 group-hover:text-red-300 transition-colors" />
        );
      case "video":
        return (
          <Video className="icon-md text-blue-400 group-hover:text-blue-300 transition-colors" />
        );
      case "image":
        return (
          <ImageIcon className="icon-md text-sky-400 group-hover:text-sky-300 transition-colors" />
        );
      case "document":
        return (
          <FileText className="icon-md text-indigo-400 group-hover:text-indigo-300 transition-colors" />
        );
      default:
        return (
          <FileIcon className="icon-md text-slate-400 group-hover:text-slate-300 transition-colors" />
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] bg-slate-950">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-center text-red-400 bg-slate-900/50 backdrop-blur-md border border-red-500/20 rounded-xl m-8 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
        Failed to load reports. Please try again later.
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-slate-950 min-h-screen text-slate-300 font-sans">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-sky-300 mb-1 tracking-tight flex items-center gap-3">
            <Flag className="w-8 h-8 text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]" />
            Reported Resources
          </h1>
          <p className="text-slate-400">
            Review community flagged files and take action.
          </p>
        </div>
      </div>

      <Card className="!p-0 shadow-lg overflow-hidden flex flex-col hover:border-blue-500/30 transition-colors duration-300">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-900/80 border-b border-slate-800/60">
                <th className="py-4 px-6 font-bold text-slate-400 text-xs uppercase tracking-wider">
                  Resource
                </th>
                <th className="py-4 px-6 font-bold text-slate-400 text-xs uppercase tracking-wider">
                  Reported By
                </th>
                <th className="py-4 px-6 font-bold text-slate-400 text-xs uppercase tracking-wider">
                  Reason
                </th>
                <th className="py-4 px-6 font-bold text-slate-400 text-xs uppercase tracking-wider">
                  Status
                </th>
                <th className="py-4 px-6 font-bold text-slate-400 text-xs uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {reports.length > 0 ? (
                reports.map((report: any) => (
                  <tr
                    key={report.reportId}
                    className="hover:bg-slate-800/40 transition-all duration-300 group hover:shadow-[inset_0_0_20px_rgba(59,130,246,0.05)] relative"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-950/50 border border-slate-800 flex items-center justify-center shrink-0 group-hover:border-blue-500/30 group-hover:bg-blue-500/5 transition-all shadow-inner">
                          {getIcon(report.resource?.type)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-200 text-sm flex items-center gap-2 group-hover:text-blue-300 transition-colors">
                            {report.resource?.title || "Deleted Resource"}
                            {report.resource && (
                              <a
                                href={`http://localhost:5000${report.resource.fileUrl}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500/70 hover:text-blue-400 transition-colors"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5 group-hover:text-slate-400 transition-colors">
                            {new Date(report.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm font-medium text-slate-400 group-hover:text-sky-200 transition-colors">
                      {report.reporter?.fullName ||
                        report.reporter?.userName ||
                        "Unknown"}
                    </td>
                    <td className="py-4 px-6 text-sm text-slate-400 group-hover:text-slate-300 transition-colors max-w-[250px] truncate">
                      {report.reason}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wide border shadow-sm transition-all ${
                          report.status === "pending"
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/20 group-hover:shadow-[0_0_8px_rgba(251,191,36,0.3)]"
                            : report.status === "dismissed"
                              ? "bg-sky-500/10 text-sky-400 border-sky-500/20 group-hover:shadow-[0_0_8px_rgba(56,189,248,0.3)]"
                              : "bg-slate-900 text-slate-500 border-slate-700"
                        }`}
                      >
                        {report.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right space-x-3">
                      {report.status === "pending" && report.resource && (
                        <>
                          <button
                            disabled={processingId === report.reportId}
                            onClick={() => handleDismiss(report.reportId)}
                            className="px-3 py-1.5 bg-blue-500/10 text-blue-400 border border-transparent hover:border-blue-500/30 hover:bg-blue-500/20 font-bold rounded-lg text-xs transition-all disabled:opacity-50 inline-flex items-center gap-1.5 shadow-sm hover:shadow-[0_0_10px_rgba(59,130,246,0.2)]"
                          >
                            <CheckCircle className="w-3.5 h-3.5" /> Dismiss
                          </button>
                          <button
                            disabled={processingId === report.reportId}
                            onClick={() =>
                              handleDeleteResource(
                                report.reportId,
                                report.resourceId,
                              )
                            }
                            className="px-3 py-1.5 bg-red-500/10 text-red-400 border border-transparent hover:border-red-500/30 hover:bg-red-500/20 font-bold rounded-lg text-xs transition-all disabled:opacity-50 inline-flex items-center gap-1.5 shadow-sm hover:shadow-[0_0_10px_rgba(239,68,68,0.2)]"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete File
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="py-16 text-center text-slate-500 font-medium"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-full bg-slate-900/50 border border-slate-800 flex items-center justify-center">
                        <CheckCircle className="w-8 h-8 text-blue-500/50" />
                      </div>
                      <p>No reports found. Good job!</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          height: 6px;
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

export default ReportsManagement;
