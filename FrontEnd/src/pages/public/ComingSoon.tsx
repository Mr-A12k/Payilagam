import { useSearchParams } from "react-router-dom";
import { useBackNavigation } from "@/hooks/useBackNavigation";
import { Clock, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui";
import { WorkspacePage, PageHeader } from "@/components/workspace/Workspace";

export default function ComingSoon() {
  const [params] = useSearchParams();
  const goBack = useBackNavigation("/labs");
  const feature = params.get("feature") || "This environment";
  return <WorkspacePage>
    <PageHeader title={feature} />
    <section className="flex min-h-64 flex-col items-start justify-center gap-4">
      <Clock className="h-7 w-7 text-[var(--accent-primary)]" aria-hidden="true" />
      <h2 className="text-xl font-semibold">Not available yet</h2>
      <p className="max-w-md text-sm leading-6 text-[var(--text-muted)]">This environment is still in development. Explore the available labs and practice challenges.</p>
      <Button variant="outline" onClick={goBack}><ArrowLeft className="h-4 w-4" />Go back</Button>
    </section>
  </WorkspacePage>;
}
