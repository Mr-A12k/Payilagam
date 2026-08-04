import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export const LabCard = ({ lab }: any) => {
  const navigate = useNavigate();
  const Icon = lab.icon;

  const handleClick = () => {
    if (lab.available) {
      navigate(lab.route);
    } else {
      navigate(`/coming-soon?feature=${encodeURIComponent(lab.name)}`);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        "group relative rounded-md overflow-hidden cursor-pointer transition-all duration-500",
        "bg-slate-900 border border-slate-800/50 hover:border-blue-500/50",
        lab.available ? "" : "opacity-90 hover:opacity-100"
      )}
    >
      {/* Glow / Image Header Area */}
      <div className={`h-36 bg-slate-900 relative overflow-hidden`}>
        <img 
          src={`https://source.unsplash.com/600x400/?technology,${lab.id}`}
          onError={(e: any) => {
            e.target.src = `https://picsum.photos/seed/${lab.id}/600/400`; }}
          alt=""
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className={`absolute inset-0 bg-gradient-to-br ${lab.gradient} mix-blend-multiply opacity-80`} />
        
        {/* Abstract shapes for decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3 z-10" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/40 rounded-full blur-xl translate-y-1/2 -translate-x-1/2 z-10" />
        
        <div className="flex justify-between items-start relative z-20 p-4">
          <div className="p-2.5 bg-slate-950/40 backdrop-blur-md rounded-md border border-white/10">
            <Icon className="w-6 h-6 text-white" />
          </div>
          
          <div className="flex flex-col items-end gap-2">
            <span
              className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md"
              style={{
                backgroundColor: `${lab.badgeColor}20`,
                color: lab.badgeColor,
                border: `1px solid ${lab.badgeColor}40`,
              }}
            >
              {lab.badge}
            </span>
          </div>
        </div>
      </div>

      <div className="p-5 flex flex-col h-[220px] relative z-10 bg-slate-900">
        <div className="mb-2">
          <h3 className="text-lg font-bold text-slate-100 group-hover:text-blue-400 transition-colors">
            {lab.name}
          </h3>
          <p className="text-xs font-medium text-slate-400 mt-1 uppercase tracking-wide">
            {lab.category}
          </p>
        </div>

        <p className="text-sm text-slate-400 font-medium mb-3">
          {lab.tagline}
        </p>

        <p className="text-sm text-slate-500 line-clamp-2 mb-4 flex-grow leading-relaxed">
          {lab.description}
        </p>

        <div className="mt-auto">
          <div className="flex flex-wrap gap-1.5 mb-4">
            {lab.tags.map((tag: any) => (
              <span
                key={tag}
                className="px-2 py-0.5 text-[10px] font-medium bg-slate-800 text-slate-300 rounded-md border border-slate-700/50"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="flex items-center text-sm font-semibold text-slate-300 group-hover:text-blue-400 transition-colors">
            {lab.available ? "Launch Environment" : "Join Waitlist"}
            <ArrowRight className="w-4 h-4 ml-2 transition-transform" />
          </div>
        </div>
      </div>
    </div>
  );
};
