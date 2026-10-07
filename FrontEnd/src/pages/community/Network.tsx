import { useState, useEffect, useCallback, useRef } from "react";
import {
  executeHttpGetRequest,
  executeHttpPostRequest,
  executeHttpPutRequest,
  executeHttpDeleteRequest,
} from "@/api/commonServices";
import { API_PATHS } from "@/api/constants";
import {
  UserPlus,
  Users,
  Clock,
  Check,
  X,
  Search,
  Loader2,
} from "lucide-react";
import { Avatar } from "@/components/ui";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import "./CommunityPages.css";
import { WorkspacePage, PageHeader, LoadingState, EmptyState } from "@/components/workspace/Workspace";

const Network = () => {
  const [activeTab, setActiveTab] = useState("pending");
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [followers, setFollowers] = useState<any[]>([]);
  const [following, setFollowing] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sentRequests, setSentRequests] = useState<any[]>([]);
  const [loadError, setLoadError] = useState(false);
  const [busy, setBusy] = useState(false);
  const actionLock = useRef(false);
  const loadVersion = useRef(0);

  const [searchTargetId, setSearchTargetId] = useState("");

  const fetchData = useCallback(async () => {
    const version = ++loadVersion.current;
    setIsLoading(true);
    setLoadError(false);
    try {
      const [pending, followersData, followingData, sent] = await Promise.all([
        executeHttpGetRequest(API_PATHS.NETWORK.PENDING_REQUESTS),
        executeHttpGetRequest(API_PATHS.NETWORK.FOLLOWERS),
        executeHttpGetRequest(API_PATHS.NETWORK.FOLLOWING),
        executeHttpGetRequest(API_PATHS.NETWORK.SENT_REQUESTS),
      ]);
      if (version !== loadVersion.current) return;
      setPendingRequests(pending.data.data || []);
      setFollowers(followersData.data.data || []);
      setFollowing(followingData.data.data || []);
      setSentRequests(sent.data.data || []);
    } catch (error) {
      console.error("Failed to fetch network data", error);
      if (version === loadVersion.current) setLoadError(true);
    } finally {
      if (version === loadVersion.current) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    return () => { loadVersion.current++; };
  }, [fetchData]);

  const handleSendRequest = async (event: React.SyntheticEvent<any>) => {
    event.preventDefault();
    if (actionLock.current) return;
    if (!/^\d+$/.test(searchTargetId) || Number(searchTargetId) < 1) return toast.error('Enter a valid user ID');
    actionLock.current = true;
    setBusy(true);
    try {
      const response = await executeHttpPostRequest(API_PATHS.NETWORK.REQUEST, {
        targetId: searchTargetId,
      });
      if (response.data.success) {
        toast.success("Follow request sent!");
        setSearchTargetId("");
        await fetchData();
      }
    } catch (error) {
      toast.error(
        (error as import("axios").AxiosError<{ message?: string }>)?.response
          ?.data?.message || "Failed to send request",
      );
    } finally {
      actionLock.current = false;
      setBusy(false);
    }
  };

  const handleRespond = async (requestId: string, status: any) => {
    if (actionLock.current) return;
    actionLock.current = true;
    setBusy(true);
    loadVersion.current++;
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
          prev.filter((r: any) => String(r.id) !== String(requestId)),
        );
        await fetchData();
      }
    } catch {
      toast.error("Failed to respond to request");
    } finally {
      actionLock.current = false;
      setBusy(false);
    }
  };

  const handleRemove = async (userId: number, requestId: string) => {
    if (actionLock.current) return;
    actionLock.current = true;
    setBusy(true);
    loadVersion.current++;
    try {
      const path = activeTab === 'sent' ? API_PATHS.NETWORK.REQUEST_ID(String(requestId))
        : activeTab === 'following' ? API_PATHS.NETWORK.REMOVE_FOLLOWING(String(userId))
        : API_PATHS.NETWORK.REMOVE_FOLLOWER(String(userId));
      await executeHttpDeleteRequest(path);
      toast.success(activeTab === 'sent' ? 'Request cancelled' : 'Connection removed');
      await fetchData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Could not remove connection');
    } finally {
      actionLock.current = false;
      setBusy(false);
    }
  };

  const renderTabs = () => {
    const tabs = [
      { id: 'sent', label: 'Sent', icon: UserPlus, count: sentRequests.length },
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
      <div role="tablist" aria-label="Connections" className="flex flex-wrap gap-1 border-b border-[var(--border-default)] w-full mb-5 pb-2">
        {tabs.map((tab: any) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              id={`network-tab-${tab.id}`}
              aria-controls="network-panel"
              tabIndex={isActive ? 0 : -1}
              aria-selected={isActive}
              onKeyDown={event => {
                const index = tabs.findIndex(item => item.id === tab.id);
                const next = event.key === "ArrowRight" ? (index + 1) % tabs.length : event.key === "ArrowLeft" ? (index + tabs.length - 1) % tabs.length : event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 : -1;
                if (next < 0) return;
                event.preventDefault();
                setActiveTab(tabs[next].id);
                document.getElementById(`network-tab-${tabs[next].id}`)?.focus();
              }}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-1.5 px-2 sm:px-3 py-2 rounded-md font-medium text-xs transition-colors whitespace-nowrap border border-transparent cursor-pointer",
                isActive
                  ? "bg-[var(--bg-surface)] text-[var(--text-primary)]  border-[var(--border-default)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-surface)]"
              )}
            >
              <Icon className={cn("w-4 h-4", isActive ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]")} />
              <span>{tab.label}</span>
              {!isLoading && (
                <span className={cn(
                  "px-1 py-0.5 rounded text-[10px] font-medium",
                  isActive ? "bg-[var(--bg-surface-2)] text-[var(--text-primary)]" : "bg-[var(--bg-surface)] text-[var(--text-muted)]"
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

  const renderConnection = (userObj: any, isPending: boolean, reqId: string) => {
    return (
      <div
        key={reqId || userObj.userId}
        className="network-entry"
      >
        
        <div className="network-identity">
          <div className="shrink-0">
            <Avatar
              src={userObj.profileUrl}
              fallback={userObj.fullName?.[0]}
              size="lg"
              className="network-avatar object-cover"
            />
          </div>
          <div className="min-w-0 flex-1 flex flex-col justify-center">
            <h4>
              {userObj.fullName}
            </h4>
            <p>
              {userObj.role?.roleName || userObj.bio || "Platform Member"}
            </p>
          </div>
        </div>

        {isPending ? (
          <div className="network-actions">
            <button
              disabled={busy}
              onClick={() => handleRespond(reqId, "approved")}
              className="community-button community-primary"
              aria-label={`Approve request from ${userObj.fullName}`}
            >
              <Check className="w-4 h-4" />
              Approve
            </button>
            <button
              disabled={busy}
              onClick={() => handleRespond(reqId, "rejected")}
              className="community-button"
              aria-label={`Decline request from ${userObj.fullName}`}
            >
              <X className="w-4 h-4" />
              Decline
            </button>
          </div>
        ) : <div className="network-actions"><button disabled={busy} onClick={() => handleRemove(userObj.userId, reqId)} className="community-button" aria-label={`${activeTab === 'sent' ? 'Cancel request to' : activeTab === 'following' ? 'Unfollow' : 'Remove follower'} ${userObj.fullName}`}><X />{activeTab === 'sent' ? 'Cancel request' : activeTab === 'following' ? 'Unfollow' : 'Remove follower'}</button></div>}
      </div>
    );
  };

  return (
    <WorkspacePage className="community-page network-page">
      <div className="max-w-7xl mx-auto w-full">
        <PageHeader title="Network" actions={<form
            onSubmit={handleSendRequest}
            className="network-connect-form flex min-w-0 gap-2 w-full"
          >
            <div className="relative flex-1 min-w-0">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="number"
                min="1"
                step="1"
                aria-label="User ID to connect"
                value={searchTargetId}
                onChange={(event: React.SyntheticEvent<any>) =>
                  setSearchTargetId((event.target as HTMLInputElement).value)
                }
                placeholder="User ID to connect..."
                className="w-full pl-11 pr-4 py-2.5 bg-[var(--bg-input)] border border-[var(--border-input)] text-[var(--text-primary)] rounded-md text-sm placeholder:text-[var(--text-muted)]"
              />
            </div>
            <button
              type="submit"
              disabled={busy || !searchTargetId}
              className="community-button community-primary shrink-0"
            >
              {busy ? <Loader2 className="animate-spin" /> : <UserPlus />} Connect
            </button>
          </form>} />

        {renderTabs()}

        <div id="network-panel" role="tabpanel" aria-labelledby={`network-tab-${activeTab}`} tabIndex={0} aria-busy={isLoading || busy} className="min-h-[300px]">
          {loadError ? <div role="alert" className="py-8">Could not load connections. <button className="underline" onClick={fetchData}>Retry</button></div> : isLoading ? (
            <LoadingState label="Loading connections..." />
          ) : (
            <div className="network-list">
              {activeTab === 'sent' && sentRequests.map(request => renderConnection(request.target, false, request.id))}
              {activeTab === 'sent' && !sentRequests.length && <EmptyState title="No sent requests" />}
              {/* PENDING TAB */}
              {activeTab === "pending" &&
                pendingRequests.map((request: any) =>
                  renderConnection(request.requester, true, request.id),
                )}
              {activeTab === "pending" && pendingRequests.length === 0 && (
                <EmptyState title="No pending requests" />
              )}

              {/* FOLLOWERS TAB */}
              {activeTab === "followers" &&
                followers.map((f: any) =>
                  renderConnection(f.follower, false, f.id),
                )}
              {activeTab === "followers" && followers.length === 0 && (
                <EmptyState title="No followers yet" />
              )}

              {/* FOLLOWING TAB */}
              {activeTab === "following" &&
                following.map((f: any) =>
                  renderConnection(f.following, false, f.id),
                )}
              {activeTab === "following" && following.length === 0 && (
                <EmptyState title="Not following anyone" />
              )}
            </div>
          )}
        </div>
      </div>
    </WorkspacePage>
  );
};

export default Network;
