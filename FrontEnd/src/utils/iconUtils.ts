import { 
  Hash, Users, Globe, Cpu, Database, Cloud, Zap, Shield, 
  Sparkles, Box, Server, BookOpen, Layers, Terminal, Lock, 
  Brain, Smartphone, Activity, Code2, PenTool, Layout
} from "lucide-react";

// Predefined set of high-quality, general-purpose UI icons
const UI_ICONS = [
  Hash, Users, Globe, Cpu, Database, Cloud, Zap, Shield, 
  Sparkles, Box, Server, BookOpen, Layers, Terminal, Lock, 
  Brain, Smartphone, Activity, Code2, PenTool, Layout
];

/**
 * Maps any string or numeric ID to a consistent UI icon.
 * This ensures that a backend ID always resolves to the same icon.
 * 
 * @param {string|number} id - The unique identifier from the backend.
 * @param {Array} customIconSet - Optional custom array of Lucide icons to map from.
 * @returns {React.Component} A Lucide-React icon component.
 */
export const getIconById = (id: string, customIconSet = UI_ICONS) => {
  if (id === null || id === undefined) return customIconSet[0];

  if (typeof id === 'number') {
    return customIconSet[Math.abs(id) % customIconSet.length];
  }
  
  if (typeof id === 'string') {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = (hash + id.charCodeAt(i)) % customIconSet.length;
    }
    return customIconSet[hash];
  }

  return customIconSet[0];
};
