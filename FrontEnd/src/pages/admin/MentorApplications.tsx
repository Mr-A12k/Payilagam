import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { ArrowLeft, ArrowRight, Check, Eye, Loader2, Search, X } from "lucide-react";
import { Button } from "@/components/ui";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { getMentorApplications, reviewMentorApplication, type ApplicationStatus as Status, type MentorApplication as Application } from "@/features/mentorApplications/api";
import { WorkspacePage, PageHeader } from "@/components/workspace/Workspace";
import toast from "react-hot-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";

const fieldClass = "h-10 w-full rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] px-3 text-sm text-[var(--text-primary)] focus-visible:outline-2 focus-visible:outline-[var(--border-focus)]";
const errorMessage = (error: unknown) => isAxiosError(error)
  ? error.response?.data?.message || "Could not update application. Please try again."
  : "Could not update application. Please try again.";
const skillsText = (skills: Application["skills"]): string => {
  if (Array.isArray(skills)) return skills.join(", ");
  if (!skills) return "Not provided";
  try {
    const parsed: unknown = JSON.parse(skills);
    if (Array.isArray(parsed)) return parsed.map(String).join(", ");
  } catch { /* Plain-text skills are also supported. */ }
  return skills;
};
const submittedDate = (value?: string) => value && !Number.isNaN(Date.parse(value))
  ? new Date(value).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : "Not provided";

export default function MentorApplications() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<{ search: string; status: Status | "ALL"; page: number }>({ search: "", status: "PENDING", page: 1 });
  const [selected, setSelected] = useState<Application | null>(null);
  const [decision, setDecision] = useState<Exclude<Status, "PENDING"> | null>(null);
  useEffect(() => {
    const timer = window.setTimeout(() => setFilters(current => current.search === search.trim()
      ? current : { ...current, search: search.trim(), page: 1 }), 350);
    return () => window.clearTimeout(timer);
  }, [search]);

  const query = useQuery({
    queryKey: ["adminMentorApplications", filters],
    queryFn: () => getMentorApplications(filters),
  });
  const applications = query.data?.data ?? [];
  const pagination = query.data?.pagination;
  // A decision can remove the last row on the current filtered page.
  useEffect(() => {
    if (pagination && filters.page > Math.max(1, pagination.totalPages)) {
      setFilters(current => ({ ...current, page: Math.max(1, pagination.totalPages) }));
    }
  }, [pagination, filters.page]);

  const mutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: Exclude<Status, "PENDING"> }) =>
      reviewMentorApplication(id, status),
    onSuccess: async (_, { status }) => {
      setSelected(null);
      setDecision(null);
      toast.success(status === "APPROVED" ? "Application approved" : "Application rejected");
      await queryClient.invalidateQueries({ predicate: ({ queryKey }) => {
        const key = String(queryKey[0]).toLowerCase();
        return key.includes("user") || key.includes("mentor") || key.includes("application");
      } });
    },
  });
  const openReview = (application: Application) => {
    mutation.reset();
    setDecision(null);
    setSelected(application);
  };
  const closeReview = () => {
    if (mutation.isPending) return;
    setSelected(null);
    setDecision(null);
    mutation.reset();
  };

  return (
    <WorkspacePage>
      <PageHeader title="Mentor applications" />
      <section aria-label="Mentor applications" className="min-w-0 border-t border-[var(--border-default)] pt-4">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="relative w-full sm:max-w-sm"><Search aria-hidden="true" className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-[var(--text-muted)]" /><input type="search" aria-label="Search applications" placeholder="Search applicants or skills" value={search} onChange={event => setSearch(event.target.value)} className={`${fieldClass} pl-9`} /></div>
          <div className="text-xs text-[var(--text-muted)] sm:w-44"><label htmlFor="application-status">Status</label><Select value={filters.status} onValueChange={(value: string) => setFilters(current => ({ ...current, status: value as Status | "ALL", page: 1 }))}><SelectTrigger id="application-status" className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="PENDING">Pending</SelectItem><SelectItem value="APPROVED">Approved</SelectItem><SelectItem value="REJECTED">Rejected</SelectItem><SelectItem value="ALL">All statuses</SelectItem></SelectContent></Select></div>
        </div>
        {query.isError ? <div role="alert" className="flex flex-wrap items-center gap-3 py-10 text-sm"><p>Could not load mentor applications.</p><Button variant="outline" disabled={query.isFetching} onClick={() => query.refetch()}>{query.isFetching && <Loader2 className="h-4 w-4 animate-spin" />}Retry</Button></div>
          : query.isLoading ? <div role="status" className="flex items-center justify-center gap-2 py-16 text-sm text-[var(--text-muted)]"><Loader2 className="h-4 w-4 animate-spin" />Loading applications...</div>
          : applications.length === 0 ? <div role="status" className="py-16 text-center text-sm text-[var(--text-muted)]">{filters.search ? "No applications match your search." : `No ${filters.status === "ALL" ? "mentor" : filters.status.toLowerCase()} applications.`}</div>
          : <div className="table-card-wrapper" role="region" aria-label="Mentor applications table">
              <div className="table-scroll-viewport" tabIndex={0}>
                <table className="w-full table-fixed text-left text-sm border-separate border-spacing-0" aria-label="Applications" aria-busy={query.isFetching}>
                  <thead className="sticky top-0 z-20 bg-[var(--bg-surface-2)] text-xs text-[var(--text-muted)]">
                    <tr>
                      <th scope="col" className="w-[30%] px-4 py-3 font-medium border-b border-[var(--border-default)]">Applicant</th>
                      <th scope="col" className="w-[28%] px-4 py-3 font-medium border-b border-[var(--border-default)]">Skills</th>
                      <th scope="col" className="px-4 py-3 font-medium border-b border-[var(--border-default)]">Submitted</th>
                      <th scope="col" className="px-4 py-3 font-medium border-b border-[var(--border-default)]">Status</th>
                      <th scope="col" className="w-20 px-4 py-3 text-right font-medium border-b border-[var(--border-default)]">Review</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-default)]">
                    {applications.map(application => (
                      <tr key={application.id} className="transition-colors hover:bg-[var(--bg-surface-2)]">
                        <td className="min-w-0 px-4 py-3 border-b border-[var(--border-subtle)]"><p className="break-words font-medium">{application.user?.fullName || application.user?.userName || "Applicant"}</p><p className="mt-1 break-all text-xs text-[var(--text-muted)]">{application.user?.email || "No email provided"}</p></td>
                        <td className="min-w-0 px-4 py-3 border-b border-[var(--border-subtle)]"><p className="line-clamp-2 break-words text-xs text-[var(--text-secondary)]">{skillsText(application.skills)}</p></td>
                        <td className="px-4 py-3 text-xs text-[var(--text-muted)] border-b border-[var(--border-subtle)]">{submittedDate(application.createdAt)}</td>
                        <td className="px-4 py-3 text-xs border-b border-[var(--border-subtle)]"><span className="inline-flex items-center gap-1.5 text-[var(--text-secondary)]">{application.status === "APPROVED" ? <Check className="h-3.5 w-3.5" /> : application.status === "REJECTED" ? <X className="h-3.5 w-3.5" /> : null}{application.status.charAt(0) + application.status.slice(1).toLowerCase()}</span></td>
                        <td className="px-4 py-3 text-right border-b border-[var(--border-subtle)]"><Button variant="ghost" size="icon-sm" title="Review application" aria-label={`Review application from ${application.user?.fullName || "applicant"}`} onClick={() => openReview(application)}><Eye className="h-4 w-4" /></Button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <footer className="table-card-footer px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs text-[var(--text-muted)]">
                <span role="status">{query.isFetching ? "Updating..." : query.isError ? "Applications unavailable" : `${pagination?.total ?? 0} applications`}</span>
                <div className="flex items-center gap-3">
                  <span>Page {filters.page} of {Math.max(1, pagination?.totalPages ?? 1)}</span>
                  <Button variant="outline" size="icon-sm" title="Previous page" aria-label="Previous page" disabled={filters.page === 1 || query.isFetching || query.isError} onClick={() => setFilters(current => ({ ...current, page: current.page - 1 }))}><ArrowLeft className="h-4 w-4" /></Button>
                  <Button variant="outline" size="icon-sm" title="Next page" aria-label="Next page" disabled={!pagination?.hasNext || query.isFetching || query.isError} onClick={() => setFilters(current => ({ ...current, page: current.page + 1 }))}><ArrowRight className="h-4 w-4" /></Button>
                </div>
              </footer>
            </div>}
      </section>
      <Dialog open={selected !== null} onOpenChange={(open: boolean) => { if (!open) closeReview(); }}>
        <DialogContent showCloseButton={!mutation.isPending}>
          <DialogTitle>{decision ? `${decision === "APPROVED" ? "Approve" : "Reject"} application?` : "Review application"}</DialogTitle>
          <DialogDescription className="break-words">{selected?.user?.fullName || selected?.user?.userName || "Applicant"}{selected?.user?.email && <span className="mt-1 block break-all">{selected.user.email}</span>}</DialogDescription>
          {selected && !decision && <dl className="space-y-4 text-sm">{[
            ["Status", selected.status.charAt(0) + selected.status.slice(1).toLowerCase()],
            ["Submitted", submittedDate(selected.createdAt)],
            ["Bio", selected.bio || "Not provided"],
            ["Skills", skillsText(selected.skills)],
            ["Experience", selected.experience ?? "Not provided"],
          ].map(([label, value]) => <div key={String(label)}><dt className="mb-1 text-xs text-[var(--text-muted)]">{label}</dt><dd className="whitespace-pre-wrap break-words [overflow-wrap:anywhere]">{value}</dd></div>)}</dl>}
          {decision && <p className="text-sm text-[var(--text-secondary)]">{decision === "APPROVED" ? "This grants the applicant mentor access." : "This rejects the applicant's mentor request."}</p>}
          {mutation.isError && <p role="alert" className="break-words text-sm text-[var(--status-danger)]">{errorMessage(mutation.error)}</p>}
          <div className="flex flex-wrap justify-end gap-2 border-t border-[var(--border-default)] pt-4">
            {decision ? <><Button variant="outline" disabled={mutation.isPending} onClick={() => { setDecision(null); mutation.reset(); }}>Back</Button><Button disabled={mutation.isPending} onClick={() => { if (selected && !mutation.isPending) mutation.mutate({ id: selected.id, status: decision }); }}>{mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : decision === "APPROVED" ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}{mutation.isPending ? "Saving..." : decision === "APPROVED" ? "Confirm approval" : "Confirm rejection"}</Button></>
              : <><Button variant="outline" onClick={closeReview}>Close</Button>{selected?.status === "PENDING" && <><Button variant="outline" onClick={() => setDecision("REJECTED")}><X className="h-4 w-4" />Reject</Button><Button onClick={() => setDecision("APPROVED")}><Check className="h-4 w-4" />Approve</Button></>}</>}
          </div>
        </DialogContent>
      </Dialog>
    </WorkspacePage>
  );
}
