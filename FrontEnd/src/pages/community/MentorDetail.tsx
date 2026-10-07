import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useBackNavigation } from "@/hooks/useBackNavigation";
import { useSelector } from "react-redux";
import {
  executeHttpGetRequest,
  executeHttpPostRequest,
} from "@/api/commonServices";
import { API_PATHS } from "@/api/constants";
import { toast } from "react-hot-toast";
import {
  Users,
  UserPlus,
  UserMinus,
  MessageSquare,
  BookOpen,
  Loader2,
  PlayCircle,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import "./CommunityPages.css";
import { LoadingState } from "@/components/workspace/Workspace";

const MentorDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const goBack = useBackNavigation("/mentors");
  const { user } = useSelector((state: any) => state.auth);

  const [mentor, setMentor] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const fetchMentorDetails = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setLoadError(false);
      const response = await executeHttpGetRequest(API_PATHS.USERS.MENTOR(id!));
      if (!response.data.success || !response.data.data) throw new Error("Mentor unavailable");
      if (response.data.success) {
        setMentor(response.data.data);
        setIsFollowing(response.data.data.isFollowing);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load mentor profile");
      setLoadError(true);
    } finally {
      setIsLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchMentorDetails();
  }, [fetchMentorDetails, user]);

  const handleToggleFollow = async () => {
    if (!user) {
      navigate("/login", { state: { from: { pathname: `/mentors/${id}` } } });
      return;
    }

    try {
      setFollowLoading(true);
      const response = await executeHttpPostRequest("/follows/toggle", {
        targetId: id,
      });
      if (response.data.success) {
        setIsFollowing(response.data.data.following);
        // Optimistically update count
        setMentor((prev: any) => ({
          ...prev,
          _count: {
            ...prev._count,
            followers: response.data.data.following
              ? (prev._count?.followers || 0) + 1
              : Math.max(0, (prev._count?.followers || 0) - 1),
          },
        }));
        toast.success(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(
        (error as import("axios").AxiosError<{ message?: string }>)?.response
          ?.data?.message || "Failed to update follow status",
      );
    } finally {
      setFollowLoading(false);
    }
  };

  const handleMessage = async () => {
    if (!user) {
      navigate("/login", { state: { from: { pathname: `/mentors/${id}` } } });
      return;
    }

    try {
      setChatLoading(true);
      // POST to /chat creates or fetches a 1-on-1 conversation
      const response = await executeHttpPostRequest(API_PATHS.CHAT.BASE!, {
        targetUserId: parseInt(id!),
      });
      if (response.data.success) {
        navigate(`/chat?conversationId=${response.data.data.conversationId}`);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to start conversation");
    } finally {
      setChatLoading(false);
    }
  };

  if (isLoading) {
    return (
      <LoadingState label="Loading mentor profile..." />
    );
  }

  if (loadError || !mentor) return <div className="community-page community-state" role="alert"><Users /><h2>Mentor profile unavailable</h2><div className="flex gap-2"><button className="community-button" onClick={fetchMentorDetails}>Retry</button><button className="community-button" onClick={goBack}><ArrowLeft />Go back</button></div></div>;

  let parsedSkills: string[] = [];
  try {
    const skills = typeof mentor.skills === "string" ? JSON.parse(mentor.skills) : mentor.skills;
    parsedSkills = Array.isArray(skills) ? skills.filter((skill: unknown) => typeof skill === "string") : [];
  } catch (error) {
    console.error(error);
    parsedSkills = [];
  }

  return (
    <div className="mentor-detail-page min-w-0 bg-[var(--bg-base)] pb-8 [overflow-wrap:anywhere]">
      {/* Hero Section */}
      <div className="relative bg-[var(--bg-surface)] border-b border-[var(--border-default)]">
        <div className="max-w-6xl mx-auto p-4 sm:p-6">
          <button onClick={goBack} className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] mb-5 hover:text-[var(--text-primary)]"><ArrowLeft className="w-4 h-4" /> Go back</button>
          <div className="flex flex-wrap gap-5 items-start sm:items-center">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-lg bg-[var(--bg-surface-2)] flex-center text-2xl font-semibold text-[var(--text-secondary)] shrink-0 overflow-hidden">
              {mentor.profileUrl ? (
                <img
                  src={mentor.profileUrl}
                  alt={mentor.fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                mentor.fullName?.[0]?.toUpperCase() || "M"
              )}
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1 basis-48">
              <h1 className="text-2xl font-semibold text-[var(--text-primary)] mb-2">
                {mentor.fullName}
              </h1>
              <p className="text-sm text-[var(--text-secondary)] mb-3">
                @{mentor.userName} • Mentor
              </p>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[var(--text-muted)]">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-[var(--text-muted)]" />
                  <span className="text-[var(--text-primary)] font-bold">
                    {mentor._count?.followers || 0}
                  </span>{" "}
                  Followers
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[var(--text-muted)]" />
                  <span className="text-[var(--text-primary)] font-bold">
                    {mentor._count?.coursesTaught || 0}
                  </span>{" "}
                  Courses
                </div>
                <div className="flex items-center gap-2">
                  <PlayCircle className="w-4 h-4 text-[var(--text-muted)]" />
                  <span className="text-[var(--text-primary)] font-bold">
                    {mentor._count?.enrollments || 0}
                  </span>{" "}
                  Students
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-2 w-full lg:w-40 shrink-0">
              <Button
                onClick={handleToggleFollow}
                aria-pressed={isFollowing}
                aria-label={followLoading ? "Updating follow status" : isFollowing ? "Unfollow mentor" : "Follow mentor"}
                disabled={
                  followLoading || (user && user.userId === mentor.userId)
                }
                className={`w-full py-2 rounded-lg font-medium flex-center gap-2 transition-colors ${
                  isFollowing
                    ? "bg-[var(--bg-surface-2)] text-[var(--text-primary)] hover:bg-[var(--bg-surface-2)] border border-[var(--border-default)]"
                    : "bg-[var(--bg-surface-3)] text-[var(--text-primary)] hover:bg-[var(--bg-surface-3)]  "
                }`}
              >
                {followLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isFollowing ? (
                  <>
                    <UserMinus className="w-4 h-4" /> Unfollow
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" /> Follow
                  </>
                )}
              </Button>

              <Button
                onClick={handleMessage}
                aria-label={chatLoading ? "Starting conversation" : "Message mentor"}
                disabled={
                  chatLoading || (user && user.userId === mentor.userId)
                }
                className="w-full py-2 rounded-lg font-medium flex-center gap-2 bg-[var(--bg-surface-2)] text-[var(--text-primary)] border border-[var(--border-default)]"
              >
                {chatLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <MessageSquare className="w-4 h-4 text-[var(--text-muted)]" /> Message
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: About & Skills */}
        <div className="min-w-0 space-y-6">
          <section>
            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">About Me</h3>
            <p className="text-[var(--text-muted)] text-sm leading-relaxed whitespace-pre-wrap">
              {mentor.bio || "This mentor hasn't written a bio yet."}
            </p>
          </section>

          {mentor.experience && (
            <section>
              <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">
                Professional Experience
              </h3>
              <p className="text-[var(--text-muted)] text-sm leading-relaxed whitespace-pre-wrap">
                {mentor.experience}
              </p>
            </section>
          )}

          <section>
            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">Expertise</h3>
            {parsedSkills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {parsedSkills.map((skill: any, index: any) => (
                  <span
                    key={index}
                    className="bg-[var(--bg-base)] text-[var(--text-secondary)] px-3 py-1.5 rounded-lg text-xs font-semibold border border-[var(--border-default)]"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-[var(--text-muted)] text-sm">No skills listed.</p>
            )}
          </section>
        </div>

        {/* Right Column: Courses */}
        <div className="min-w-0 lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">
            Courses by {mentor.fullName}
          </h2>

          {!mentor.coursesTaught?.length ? (
            <div className="text-center py-12">
              <BookOpen className="w-6 h-6 text-[var(--text-muted)] mx-auto mb-4" />
              <p className="text-[var(--text-muted)]">No published courses yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {mentor.coursesTaught.map((course: any) => (
                <div
                  key={course.courseId}
                  role="link"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter') navigate(`/courses/${course.uniqueId}`); }}
                  onClick={() => navigate(`/courses/${course.uniqueId}`)}
                  className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-lg overflow-hidden cursor-pointer group hover:border-[var(--border-default)] transition-colors"
                >
                  <div className="h-40 bg-[var(--bg-surface-2)] relative overflow-hidden">
                    {course.thumbnail ? (
                      <img
                        src={course.thumbnail}
                        loading="lazy"
                        alt={course.courseName}
                        className="w-full h-full object-cover transition-transform duration-500"
                      />
                    ) : (
                      <div className="absolute inset-0 flex-center bg-[var(--bg-surface-2)] text-[var(--text-muted)]">
                        <BookOpen className="w-6 h-6" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3 bg-[var(--bg-base)] px-2.5 py-1 rounded-md text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-normal border border-[var(--border-default)]">
                      {course.level}
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2 line-clamp-2 group-hover:text-[var(--text-secondary)] transition-colors">
                      {course.courseName}
                    </h3>
                    <p className="text-sm text-[var(--text-muted)] line-clamp-2 mb-4">
                      {course.description}
                    </p>
                    <div className="flex items-center gap-4 border-t border-[var(--border-default)] pt-4">
                      <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] font-medium">
                        <Users className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                        {course._count?.enrollments || 0} Students
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MentorDetail;
