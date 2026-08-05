import { useState, useEffect, useCallback } from "react";
import {
  executeHttpGetRequest,
  executeHttpPostRequest,
  executeHttpPutRequest,
} from "@/api/commonServices";
import { API_PATHS } from "@/api/constants";
import {
  UserPlus,
  Users,
  Clock,
  Check,
  X,
  Search,
  ChevronRight,
} from "lucide-react";
import { Avatar } from "@/components/ui";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

const Network = () => {
  const [activeTab, setActiveTab] = useState("pending");
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [followers, setFollowers] = useState<any[]>([]);
  const [following, setFollowing] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchTargetId, setSearchTargetId] = useState("");

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      if (activeTab === "pending") {
        const response = await executeHttpGetRequest(
          API_PATHS.NETWORK.PENDING_REQUESTS,
        );
        if (response.data.success) setPendingRequests(response.data.data);
      } else if (activeTab === "followers") {
        const response = await executeHttpGetRequest(
          API_PATHS.NETWORK.FOLLOWERS,
        );
        if (response.data.success) setFollowers(response.data.data);
      } else if (activeTab === "following") {
        const response = await executeHttpGetRequest(
          API_PATHS.NETWORK.FOLLOWING,
        );
        if (response.data.success) setFollowing(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch network data", error);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSendRequest = async (event: React.SyntheticEvent<any>) => {
    event.preventDefault();
    if (!searchTargetId) return;
    try {
      const response = await executeHttpPostRequest(API_PATHS.NETWORK.REQUEST, {
        targetId: searchTargetId,
      });
      if (response.data.success) {
        toast.success("Follow request sent!");
        setSearchTargetId("");
      }
    } catch (error) {
      toast.error(
        (error as import("axios").AxiosError<{ message?: string }>)?.response
          ?.data?.message || "Failed to send request",
      );
    }
  };

  const handleRespond = async (requestId: string, status: any) => {
    try {
      const response = await executeHttpPutRequest(
        API_PATHS.NETWORK.REQUEST_ID(requestId!),
        {
          status,
        },
      );
      if (response.data.success) {
        toast.success(`Request ${status}`);
        setPendingRequests((prev: any) =>
          prev.filter((r: any) => r.id !== requestId),
        );
      }
    } catch {
      toast.error("Failed to respond to request");
    }
  };

  const renderTabs = () => {
    const tabs = [
      {
        id: "pending",
        label: "Pending",
        icon: Clock,
        count: pendingRequests.length,
      },
      {
        id: "followers",
        label: "Followers",
        icon: Users,
        count: followers.length,
      },
      {
        id: "following",
        label: "Following",
        icon: UserPlus,
        count: following.length,
      },
    ];

    return (
      <div className="flex bg-slate-950 p-1.5 rounded-xl border border-slate-900 w-fit mb-8 shadow-inner shadow-black/40">
        {tabs.map((tab: any) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-5 py-2 rounded-lg font-bold text-xs transition-all whitespace-nowrap border border-transparent cursor-pointer",
                isActive
                  ? "bg-[#2b5278] text-white shadow-sm border-blue-500/20"
                  : "text-slate-500 hover:text-slate-350 hover:bg-slate-900/60"
              )}
            >
              <Icon className={cn("w-4 h-4", isActive ? "text-white" : "text-slate-500")} />
              <span>{tab.label}</span>
              {!isLoading && (
                <span className={cn(
                  "ml-1.5 px-2 py-0.5 rounded-md text-[10px] font-black",
                  isActive ? "bg-white/20 text-white" : "bg-slate-900 text-slate-500"
                )}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  };

  const renderBentoCard = (userObj: any, isPending: any, reqId: string) => {
    return (
      <div
        key={userObj.id || reqId}
        className="bg-slate-900/30 backdrop-blur-md border border-slate-800/80 rounded-2xl p-5 flex flex-col gap-4 group hover:border-blue-500/35 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex items-center gap-4">
          <div className="shrink-0">
            <Avatar
              src={userObj.profileUrl}
              fallback={userObj.fullName?.[0]}
              size="lg"
              className="w-16 h-16 rounded-xl border border-slate-700/40 object-cover shadow-md"
            />
          </div>
          <div className="flex-1 bg-slate-950/20 border border-slate-800/40 rounded-xl p-3 flex flex-col justify-center shadow-inner shadow-black/25">
            <h4 className="font-bold text-slate-200 text-sm leading-tight mb-1 line-clamp-1 group-hover:text-blue-400 transition-colors">
              {userObj.fullName}
            </h4>
            <p className="text-slate-500 text-xs font-semibold leading-snug line-clamp-1">
              {userObj.role?.roleName || userObj.bio || "Platform Member"}
            </p>
          </div>
        </div>

        {isPending ? (
          <div className="grid grid-cols-2 gap-2.5 mt-2">
            <button
              onClick={() => handleRespond(reqId, "approved")}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-500/10 active:scale-98 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              Approve
            </button>
            <button
              onClick={() => handleRespond(reqId, "rejected")}
              className="w-full bg-slate-800 hover:bg-slate-750 text-slate-350 font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-98 cursor-pointer"
            >
              <X className="w-4 h-4" />
              Decline
            </button>
          </div>
        ) : (
          <button className="mt-2 w-full bg-slate-850 hover:bg-slate-800 border border-slate-800/80 hover:border-slate-700 text-slate-300 font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-98 cursor-pointer">
            View Profile
            <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="w-full h-full p-6 sm:p-8 flex flex-col bg-transparent overflow-y-auto custom-scrollbar">
      <div className="max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-black text-slate-100 tracking-tight mb-1 bg-gradient-to-r from-slate-100 to-slate-400 bg-clip-text text-transparent">
              Network
            </h1>
            <p className="text-slate-400 text-sm font-medium">
              Manage your connections and discover new peers.
            </p>
          </div>

          <form
            onSubmit={handleSendRequest}
            className="flex gap-2 relative bg-slate-900/60 p-2 rounded-2xl border border-slate-800/80 shadow-xl w-full md:w-auto"
          >
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="number"
                value={searchTargetId}
                onChange={(event: React.SyntheticEvent<any>) =>
                  setSearchTargetId((event.target as HTMLInputElement).value)
                }
                placeholder="User ID to connect..."
                className="w-full pl-11 pr-4 py-2.5 bg-slate-950/60 border border-slate-800/85 focus:border-blue-500/60 focus:ring-4 focus:ring-blue-500/10 text-slate-200 rounded-xl text-sm focus:outline-none transition-all placeholder:text-slate-600 shadow-inner"
              />
            </div>
            <button
              type="submit"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md shadow-blue-500/15 cursor-pointer"
            >
              Connect
            </button>
          </form>
        </div>

        {renderTabs()}

        <div className="min-h-[400px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-4">
              <div className="w-8 h-8 border-3 border-blue-500/35 border-t-blue-500 rounded-full animate-spin"></div>
              <p className="text-xs font-semibold text-slate-550">Loading connections...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* PENDING TAB */}
              {activeTab === "pending" &&
                pendingRequests.map((request: any) =>
                  renderBentoCard(request.requester, true, request.id),
                )}
              {activeTab === "pending" && pendingRequests.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-500 bg-slate-900/20 rounded-2xl border border-dashed border-slate-800">
                  <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mb-4 border border-slate-800">
                    <Clock className="w-6 h-6 text-slate-500" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-350 mb-1">
                    No Pending Requests
                  </h3>
                  <p className="text-xs text-slate-550">You're all caught up on connection requests.</p>
                </div>
              )}

              {/* FOLLOWERS TAB */}
              {activeTab === "followers" &&
                followers.map((f: any) =>
                  renderBentoCard(f.follower, false, f.id),
                )}
              {activeTab === "followers" && followers.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-500 bg-slate-900/20 rounded-2xl border border-dashed border-slate-800">
                  <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mb-4 border border-slate-800">
                    <Users className="w-6 h-6 text-slate-500" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-350 mb-1">
                    No Followers Yet
                  </h3>
                  <p className="text-xs text-slate-550">
                    Start interacting in the community to build your network.
                  </p>
                </div>
              )}

              {/* FOLLOWING TAB */}
              {activeTab === "following" &&
                following.map((f: any) =>
                  renderBentoCard(f.following, false, f.id),
                )}
              {activeTab === "following" && following.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-500 bg-slate-900/20 rounded-2xl border border-dashed border-slate-800">
                  <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mb-4 border border-slate-800">
                    <UserPlus className="w-6 h-6 text-slate-500" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-350 mb-1">
                    Not Following Anyone
                  </h3>
                  <p className="text-xs text-slate-550">Discover interesting people and connect with them.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Network;
