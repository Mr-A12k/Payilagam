import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { executeHttpGetRequest } from "@/api/commonServices";
import { API_PATHS } from "@/api/constants";
import { Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui";
import { PageHeader, WorkspacePage, LoadingState, EmptyState } from "@/components/workspace/Workspace";

export default function ProblemSet() {
  const [search, setSearch] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [difficulty, setDifficulty] = useState("all");

  const { data: difficulties = [] } = useQuery({
    queryKey: ["dropdownOptions", "problem_difficulty"],
    queryFn: () => executeHttpGetRequest(API_PATHS.DROPDOWN_OPTIONS.GROUP("problem_difficulty")),
    select: (res) => Array.isArray(res.data?.data) ? res.data.data : [],
  });
  const query = useQuery({
    queryKey: ["codingProblems", submittedSearch, difficulty],
    queryFn: () => executeHttpGetRequest(API_PATHS.PROBLEMS.BASE, { search: submittedSearch, ...(difficulty !== "all" ? { difficulty } : {}) }),
  });
  const problems = Array.isArray(query.data?.data?.data) ? query.data.data.data : [];
  return <WorkspacePage>
    <PageHeader title="Coding practice" description="Algorithmic challenges" />
    <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
      <form onSubmit={event => { event.preventDefault(); setSubmittedSearch(search.trim()); }} className="flex w-full gap-2 sm:max-w-md"><div className="relative min-w-0 flex-1"><Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-[var(--text-muted)]" /><Input type="search" aria-label="Search problems" value={search} onChange={event => setSearch(event.target.value)} placeholder="Search problems" className="pl-9" /></div><Button type="submit" variant="outline" size="icon" aria-label="Search" title="Search"><Search className="h-4 w-4" /></Button></form>
      <div className="sm:w-48"><Select value={difficulty} onValueChange={setDifficulty}><SelectTrigger aria-label="Difficulty"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All difficulties</SelectItem>{difficulties.length > 0 ? difficulties.map((d: any) => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>) : <><SelectItem value="easy">Easy</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="hard">Hard</SelectItem></>}</SelectContent></Select></div>
    </div>
    {query.isLoading ? <LoadingState label="Loading problems..." /> : query.isError ? <div role="alert" className="flex flex-wrap items-center gap-3 py-8 text-sm"><p>Could not load problems.</p><Button variant="outline" onClick={() => query.refetch()}>Retry</Button></div> : !problems.length ? <EmptyState title="No problems found" description="Try another search or difficulty." /> : (
      <div className="table-card-wrapper" role="region" aria-label="Coding problems">
        <div className="table-scroll-viewport" tabIndex={0}>
          <table className="w-full min-w-[420px] text-left text-sm border-separate border-spacing-0">
            <thead className="sticky top-0 z-20 bg-[var(--bg-surface-2)] text-xs text-[var(--text-muted)]">
              <tr>{["Problem", "Difficulty", "Acceptance"].map(label => <th key={label} scope="col" className="px-4 py-3 font-medium border-b border-[var(--border-default)]">{label}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {problems.map((problem: any) => (
                <tr key={problem.problemId} className="hover:bg-[var(--bg-hover)] transition-colors">
                  <td className="px-4 py-3.5 border-b border-[var(--border-subtle)]"><Link to={`/practice/${problem.slug}`} className="font-medium text-[var(--text-heading)] hover:text-[var(--accent-primary)]">{problem.title}</Link></td>
                  <td className="px-4 py-3.5 capitalize text-[var(--text-secondary)] border-b border-[var(--border-subtle)]">{problem.difficulty}</td>
                  <td className="px-4 py-3.5 tabular-nums text-[var(--text-muted)] border-b border-[var(--border-subtle)]">{problem.totalSubmissions > 0 ? `${Math.round(problem.acceptedSubmissions / problem.totalSubmissions * 100)}%` : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <footer className="table-card-footer px-4 py-2.5 flex items-center justify-between text-xs text-[var(--text-muted)]">
          <span>{problems.length} challenge{problems.length === 1 ? "" : "s"} listed</span>
          <span>Algorithmic sandbox arena</span>
        </footer>
      </div>
    )}
  </WorkspacePage>;
}


