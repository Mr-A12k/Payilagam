import { Component, Suspense, type ErrorInfo, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { AlertCircle, RotateCw } from "lucide-react";
import { LoadingState } from "@/components/workspace/Workspace";
import { Button } from "@/components/ui/Button";

class ScreenErrorBoundary extends Component<
  { children: ReactNode; resetKey: string },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Screen failed", error, info.componentStack);
  }
  componentDidUpdate(previous: { resetKey: string }) {
    if (this.state.failed && previous.resetKey !== this.props.resetKey)
      this.setState({ failed: false });
  }
  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div role="alert" className="workspace-state min-h-64">
        <AlertCircle className="h-6 w-6 text-[var(--status-danger)]" />
        <h1 className="text-xl font-semibold">This page could not be loaded</h1>
        <p>Please reload and try again.</p>
        <Button onClick={() => window.location.reload()}>
          <RotateCw className="h-4 w-4" />
          Reload page
        </Button>
      </div>
    );
  }
}

export default function RouteBoundary({ children }: { children: ReactNode }) {
  const location = useLocation();
  return (
    <ScreenErrorBoundary resetKey={location.pathname}>
      <Suspense fallback={<LoadingState label="Loading page..." />}>
        {children}
      </Suspense>
    </ScreenErrorBoundary>
  );
}
