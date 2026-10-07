import { lazy, type ComponentType } from "react";
import RouteBoundary from "@/components/RouteBoundary";

export function loadPage(load: () => Promise<{ default: ComponentType }>) {
  const Page = lazy(load);
  return function LazyPage() {
    return <RouteBoundary><Page /></RouteBoundary>;
  };
}
