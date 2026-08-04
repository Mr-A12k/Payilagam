import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { useEffect, useRef, useState } from 'react';

/**
 * A highly customizable tooltip that follows the cursor exactly.
 * Rendered in a portal to prevent clipping by overflow: hidden containers.
 */
export const CursorTooltip = ({ 
  children, 
  content, 
  className = "", 
  offset = { x: 15, y: 15 },
  delay = 100
}: any) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const timeoutRef = useRef<any>(null);

  const handleMouseEnter = (event: any) => {
    setPosition({ x: event.clientX, y: event.clientY });
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const handleMouseMove = (event: any) => {
    setPosition({ x: event.clientX, y: event.clientY });
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <>
      {/* Trigger Wrapper */}
      <div 
        className="inline-flex w-full"
        onMouseEnter={handleMouseEnter}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </div>

      {/* Tooltip Portal */}
      {isVisible && content && createPortal(
        <div
          className={cn(
            "fixed z-[9999] pointer-events-none px-3 py-1.5 rounded-lg text-xs font-medium shadow-xl whitespace-nowrap transition-opacity duration-150 animate-in fade-in zoom-in-95",
            className
          )}
          style={{
            left: `${position.x + offset.x}px`,
            top: `${position.y + offset.y}px`,
            background: "var(--bg-surface-2)",
            color: "var(--text-primary)",
            border: "1px solid var(--border-default)",
            backdropFilter: "blur(12px)"
          }}
        >
          {content}
        </div>,
        document.body
      )}
    </>
  );
};
