import { useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { ArrowLeft, ArrowRight, Download } from "lucide-react";
import { Button } from "@/components/ui";
import { EmptyState, LoadingState } from "@/components/workspace/Workspace";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();

export default function CatalogPdfPreview({ url, title }: { url: string; title: string }) {
  const [source, setSource] = useState("");
  const [failed, setFailed] = useState(false);
  const [pages, setPages] = useState(0);
  const [page, setPage] = useState(1);
  const [width, setWidth] = useState(280);
  const container = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!container.current) return;
    const observer = new ResizeObserver(entries => setWidth(Math.max(100, Math.min(900, entries[0].contentRect.width))));
    observer.observe(container.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    let objectUrl = "";
    setSource(""); setFailed(false); setPage(1); setPages(0);
    void (async () => {
      try {
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok || Number(response.headers.get("content-length")) > 50 * 1024 * 1024) throw new Error("Preview unavailable");
        const blob = await response.blob();
        if (controller.signal.aborted) return;
        if (blob.size > 50 * 1024 * 1024 || !(await blob.slice(0, 5).text()).startsWith("%PDF-")) throw new Error("Invalid PDF preview");
        if (controller.signal.aborted) return;
        objectUrl = URL.createObjectURL(new Blob([blob], { type: "application/pdf" }));
        setSource(objectUrl);
      } catch { if (!controller.signal.aborted) setFailed(true); }
    })();
    return () => { controller.abort(); if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [url]);
  return <div ref={container} className="catalog-pdf-viewer" aria-label={`${title} PDF preview`}>
    {failed ? <EmptyState title="Preview unavailable" action={<Button asChild variant="outline"><a href={url} target="_blank" rel="noopener noreferrer">Open file<Download className="h-4 w-4" /></a></Button>} /> : !source ? <LoadingState label="Loading PDF..." /> : <>
      {!!pages && <nav aria-label="PDF pages" className="catalog-pdf-pagination"><Button variant="outline" size="icon" aria-label="Previous PDF page" disabled={page <= 1} onClick={() => setPage(value => value - 1)}><ArrowLeft className="h-4 w-4" /></Button><span>Page {page} of {pages}</span><Button variant="outline" size="icon" aria-label="Next PDF page" disabled={page >= pages} onClick={() => setPage(value => value + 1)}><ArrowRight className="h-4 w-4" /></Button></nav>}
      <Document file={source} onLoadSuccess={({ numPages }) => setPages(numPages)} onLoadError={() => setFailed(true)} loading={<LoadingState label="Loading PDF..." />}><Page pageNumber={page} width={width} onRenderError={() => setFailed(true)} loading={<LoadingState label="Rendering page..." />} /></Document>
    </>}
  </div>;
}
