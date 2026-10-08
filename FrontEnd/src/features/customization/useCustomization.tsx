import { Children, cloneElement, isValidElement, type ReactNode, type LabelHTMLAttributes } from "react";
import { useQuery } from "@tanstack/react-query";
import { executeHttpGetRequest } from "@/api/commonServices";

export interface FieldOption { value: string; label: string; enabled: boolean }
export interface OptionGroup { title: string; addable: boolean; options: FieldOption[]; revision: number }
export interface UiSettings { groups: Record<string, OptionGroup>; labels: Record<string, string>; labelsRevision: number }
export const settingsKey = ["ui-settings"];
export function useCustomization() {
  return useQuery<UiSettings>({ queryKey: settingsKey, queryFn: () => executeHttpGetRequest("/ui-settings").then(response => response.data.data), staleTime: 30000, refetchOnWindowFocus: true });
}
export function useFieldOptions(key: string, fallback: { value: string; label: string }[], currentValue?: string) {
  const { data } = useCustomization();
  const options = data?.groups[key]?.options || fallback.map(option => ({ ...option, enabled: true }));
  const visible = options.filter(option => option.enabled || option.value === currentValue);
  if (currentValue && !visible.some(option => option.value === currentValue)) visible.push({ value: currentValue, label: currentValue, enabled: false });
  return visible;
}
export function useFormLabel() {
  const { data } = useCustomization();
  const replace = (children: ReactNode): ReactNode => Children.map(children, child => {
    if (typeof child === "string") {
      const key = child.replace(/\s+/g, " ").trim();
      return data?.labels[key] ? child.replace(key, data.labels[key]) === child ? data.labels[key] : child.replace(key, data.labels[key]) : child;
    }
    if (isValidElement<{ children?: ReactNode }>(child) && child.props.children) return cloneElement(child, {}, replace(child.props.children));
    return child;
  });
  return replace;
}
export function FormLabel({ children, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  const replace = useFormLabel();
  return <label {...props}>{replace(children)}</label>;
}
