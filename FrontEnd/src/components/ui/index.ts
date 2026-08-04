/**
 * @file index.js (UI Components Barrel)
 * @description Central export hub for all reusable shadcn/ui components.
 *
 * This barrel file lets you import any component from a single clean path:
 *
 *   import { Button, Card, CardHeader, Input, Badge } from '@/components/ui';
 *
 * Instead of multiple deep imports like:
 *   import { Button } from '@/components/ui/Button';
 *   import { Card } from '@/components/ui/Card';
 */

/* ── Core form components ──────────────────────────────────────────── */
export { Button, buttonVariants } from "./Button";
export { Input } from "./Input";
export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "./Select";
export { Label } from "./label";

/* ── Layout / display components ───────────────────────────────────── */
export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
} from "./Card";

export { Badge, badgeVariants } from "./Badge";

export {
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarBadge,
} from "./Avatar";

export { Separator } from "./separator";

/* ── Overlay / interactive components ──────────────────────────────── */
export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "./dialog";

export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "./dropdown-menu";

export {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";
export { default as EmptyState } from './EmptyState';

