/** Account settings — ClickUp-style sidebar + content layout. */
import { useState, useRef, useEffect } from "react";
import {
  User,
  Lock,
  Bell,
  Shield,
  Loader2,
  KeyRound,
  Eye,
  EyeOff,
  Upload,
  Trash2,
  GraduationCap,
  CheckCircle2,
  Save,
  Clock,
  RotateCcw,
  Palette,
  Check,
  Moon,
  Sun,
} from "lucide-react";
import { useAppDispatch } from "@/hooks/reduxHooks";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  executeHttpGetRequest,
  executeHttpPutRequest,
  executeHttpPostRequest,
  executeHttpDeleteRequest,
} from "@/api/commonServices";
import { API_PATHS } from "@/api/constants";
import { fetchProfile } from "@/store/authSlice";
import { Avatar, Dialog, DialogContent } from "@/components/ui";
import { DialogTitle, DialogDescription } from "@/components/ui/dialog";
import "./Settings.css";
import { ImageCropper } from "@/components/ui/ImageCropper";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { THEMES, useTheme } from "@/context/ThemeContext";

const skillsText = (value: unknown) => {
  if (Array.isArray(value)) return value.filter(item => typeof item === 'string').join(', ');
  if (typeof value !== 'string') return '';
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter(item => typeof item === 'string').join(', ') : '';
  } catch {
    return value;
  }
};

/* ── Navigation definition ───────────────────────── */
interface NavItem {
  id: string;
  icon: typeof User;
  label: string;
  section: string;
}

const Settings = () => {
  const user: any = useSelector((state: any) => state.auth.user);
  const dispatch = useAppDispatch();
  const fileInputRef = useRef<any>(null);
  const { theme: currentTheme, setTheme } = useTheme();

  const [activeTab, setActiveTab] = useState("Profile");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Cropper and Modals state
  const [cropImageSrc, setCropImageSrc] = useState<any>(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  // Profile state
  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    bio: (user as any)?.bio || "",
    experience: (user as any)?.experience || "",
    skills: skillsText(user?.skills),
  });

  // Password state
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Mentor Application state
  const [mentorApp, setMentorApp] = useState<any>(null);
  const [isLoadingApp, setIsLoadingApp] = useState(false);
  const [applicationError, setApplicationError] = useState(false);
  const [appForm, setAppForm] = useState({
    bio: "",
    skills: "",
    experience: "",
  });

  const fetchMyApplication = async () => {
    setIsLoadingApp(true);
    setApplicationError(false);
    try {
      const response = await executeHttpGetRequest(API_PATHS.USERS.MY_MENTOR_APPLICATION);
      if (response.data.success) {
        setMentorApp(response.data.data);
      }
    } catch (err) {
      setApplicationError(true);
      console.error("Failed to load application status", err);
    } finally {
      setIsLoadingApp(false);
    }
  };

  useEffect(() => {
    if (activeTab === "MentorApplication") {
      fetchMyApplication();
    }
  }, [activeTab]);

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appForm.bio.trim() || !appForm.skills.trim() || !appForm.experience.trim()) {
      return toast.error("Please fill in all details");
    }
    setIsSaving(true);
    try {
      const response = await executeHttpPostRequest(API_PATHS.USERS.APPLY_MENTOR, appForm);
      if (response.data.success) {
        toast.success("Mentor application submitted successfully!");
        setMentorApp(response.data.data);
      }
    } catch (err) {
      toast.error((err as any)?.response?.data?.message || "Failed to submit application");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const payload: Record<string, any> = {
        fullName: profileData.fullName,
        email: profileData.email,
      };

      if (user?.role === "mentor") {
        payload.bio = profileData.bio;
        payload.experience = profileData.experience;
        const skillsArray = profileData.skills
          ? profileData.skills.split(",").map((s: any) => s.trim()).filter((s: any) => s)
          : [];
        payload.skills = JSON.stringify(skillsArray);
      }

      const response = await executeHttpPutRequest(API_PATHS.AUTH.PROFILE, payload);
      if (response.data.success) {
        toast.success("Profile settings saved successfully");
        dispatch(fetchProfile());
      }
    } catch (error) {
      toast.error((error as import('axios').AxiosError<{message?: string}>)?.response?.data?.message || "Failed to save profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileSelect = (event: React.SyntheticEvent<any>) => {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      toast.error("Choose a PNG, JPG or WebP image");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setCropImageSrc(objectUrl);
    setIsCropModalOpen(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleAvatarUpload = async (croppedBlob: any) => {
    const formData = new FormData();
    formData.append("avatar", croppedBlob, "avatar.jpg");

    setIsUploadingAvatar(true);
    try {
      const response = await executeHttpPostRequest(API_PATHS.AUTH.AVATAR, formData, true);
      if (response.data.success) {
        toast.success("Avatar updated successfully");
        dispatch(fetchProfile());
        setIsCropModalOpen(false);
      }
    } catch (error) {
      toast.error((error as import('axios').AxiosError<{message?: string}>)?.response?.data?.message || "Failed to update avatar");
    } finally {
      setIsUploadingAvatar(false);
      if (cropImageSrc) {
        URL.revokeObjectURL(cropImageSrc);
      }
      setCropImageSrc(null);
    }
  };

  const handleAvatarDelete = async () => {
    setIsUploadingAvatar(true);
    try {
      const response = await executeHttpDeleteRequest(API_PATHS.AUTH.AVATAR);
      if (response.data.success) {
        toast.success("Avatar removed successfully");
        dispatch(fetchProfile());
        setIsDeleteConfirmOpen(false);
      }
    } catch (error) {
      toast.error((error as import('axios').AxiosError<{message?: string}>)?.response?.data?.message || "Failed to remove avatar");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handlePasswordChange = async (event: React.SyntheticEvent<any>) => {
    event.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      return toast.error("New passwords do not match");
    }
    if (passwords.newPassword.length < 8) {
      return toast.error("Password must be at least 8 characters");
    }

    setIsSaving(true);
    try {
      const response = await executeHttpPutRequest(API_PATHS.AUTH.CHANGE_PASSWORD, {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      if (response.data.success) {
        toast.success("Password changed successfully");
        setPasswords({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }
    } catch (error) {
      toast.error((error as import('axios').AxiosError<{message?: string}>)?.response?.data?.message || "Failed to change password");
    } finally {
      setIsSaving(false);
    }
  };

  /* Build navigation items */
  const navItems: NavItem[] = [
    { id: "Profile", icon: User, label: "My profile", section: "Account" },
    { id: "Security", icon: Lock, label: "Security", section: "Account" },
    { id: "Theme", icon: Palette, label: "Theme", section: "Preferences" },
    { id: "Notifications", icon: Bell, label: "Notifications", section: "Preferences" },
    { id: "Privacy", icon: Shield, label: "Privacy", section: "Advanced" },
  ];

  if (user?.role === "student" || (user && user.roleId === 3)) {
    navItems.push({ id: "MentorApplication", icon: GraduationCap, label: "Mentor application", section: "Advanced" });
  }

  const sections = [...new Set(navItems.map(n => n.section))];

  const passwordFields = [
    { key: "currentPassword" as const, label: "Current password", visible: showCurrentPassword, toggle: () => setShowCurrentPassword(value => !value) },
    { key: "newPassword" as const, label: "New password", visible: showNewPassword, toggle: () => setShowNewPassword(value => !value) },
    { key: "confirmPassword" as const, label: "Confirm new password", visible: showConfirmPassword, toggle: () => setShowConfirmPassword(value => !value) },
  ];

  const roleName = user?.roleId === 1 ? "Admin" : user?.roleId === 2 ? "Mentor" : "Student";

  return (
    <div className="stg">
      {/* ── Sidebar navigation ─────────────────────── */}
      <aside className="stg-sidebar" aria-label="Settings navigation">
        {/* Profile card */}
        <div className="stg-profile-card">
          <Avatar src={user?.profileUrl} fallback={user?.fullName?.[0] || "U"} className="stg-profile-avatar" />
          <div className="stg-profile-info">
            <strong>{user?.fullName || user?.userName || "Your account"}</strong>
            <span className="stg-profile-role">{roleName}</span>
            <span className="stg-profile-email">{user?.email}</span>
          </div>
        </div>

        {/* Grouped navigation */}
        <nav className="stg-nav" aria-label="Settings sections">
          {sections.map(section => (
            <div key={section} className="stg-nav-group">
              <div className="stg-nav-heading">{section}</div>
              {navItems.filter(n => n.section === section).map(item => (
                <button
                  key={item.id}
                  type="button"
                  className={`stg-nav-item${activeTab === item.id ? " is-active" : ""}`}
                  aria-current={activeTab === item.id ? "page" : undefined}
                  onClick={() => setActiveTab(item.id)}
                >
                  <item.icon className="stg-nav-icon" aria-hidden="true" />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          ))}
        </nav>
      </aside>

      {/* ── Content area ───────────────────────────── */}
      <main className="stg-content" aria-busy={isSaving}>
        {/* ── Profile ──────────────────────────────── */}
        {activeTab === "Profile" && (
          <div className="stg-panel">
            <header className="stg-panel-header">
              <div>
                <h1>My profile</h1>
                <p>Manage your personal information and public profile.</p>
              </div>
            </header>

            <form onSubmit={event => { event.preventDefault(); void handleSaveProfile(); }}>
              {/* Avatar section */}
              <section
                className={`stg-card stg-avatar-card${dragActive ? " is-dragging" : ""}`}
                aria-label="Profile picture"
                onDragOver={event => { event.preventDefault(); setDragActive(true); }}
                onDragLeave={event => { event.preventDefault(); setDragActive(false); }}
                onDrop={event => {
                  event.preventDefault(); setDragActive(false);
                  if (!isUploadingAvatar && event.dataTransfer.files[0]) {
                    handleFileSelect({ target: { files: event.dataTransfer.files } } as any);
                  }
                }}
              >
                <Avatar src={user?.profileUrl} fallback={user?.fullName?.[0] || user?.userName?.[0] || "U"} className="stg-avatar-large" />
                <div className="stg-avatar-meta">
                  <h3>Profile picture</h3>
                  <p>PNG, JPG or WebP. Maximum 5 MB.</p>
                  <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={handleFileSelect} hidden />
                  <div className="stg-avatar-actions">
                    <button type="button" className="stg-btn stg-btn-outline" disabled={isUploadingAvatar} onClick={() => fileInputRef.current?.click()}>
                      {isUploadingAvatar ? <Loader2 className="animate-spin" /> : <Upload />}
                      {isUploadingAvatar ? "Uploading…" : "Change photo"}
                    </button>
                    {user?.profileUrl && <>
                      <button type="button" className="stg-btn stg-btn-outline" onClick={() => setIsPreviewModalOpen(true)}><Eye />Preview</button>
                      <button type="button" className="stg-btn stg-btn-danger-outline" disabled={isUploadingAvatar} onClick={() => setIsDeleteConfirmOpen(true)}><Trash2 />Remove</button>
                    </>}
                  </div>
                </div>
              </section>

              {/* Personal info */}
              <section className="stg-card">
                <h3>Personal information</h3>
                <div className="stg-field-grid">
                  <div className="stg-field">
                    <label htmlFor="stg-fullName">Full name</label>
                    <input id="stg-fullName" autoComplete="name" required value={profileData.fullName} onChange={event => setProfileData({ ...profileData, fullName: event.target.value })} />
                  </div>
                  <div className="stg-field">
                    <label htmlFor="stg-username">Username</label>
                    <input id="stg-username" value={user?.userName || ""} readOnly aria-describedby="stg-username-note" />
                    <p id="stg-username-note" className="stg-field-hint">Username cannot be changed.</p>
                  </div>
                  <div className="stg-field stg-field-wide">
                    <label htmlFor="stg-email">Email address</label>
                    <input id="stg-email" type="email" autoComplete="email" required value={profileData.email} onChange={event => setProfileData({ ...profileData, email: event.target.value })} />
                  </div>
                </div>
              </section>

              {/* Mentor details */}
              {user?.role === "mentor" && (
                <section className="stg-card">
                  <h3>Mentor details</h3>
                  <div className="stg-field-stack">
                    <div className="stg-field">
                      <label htmlFor="stg-bio">Biography</label>
                      <textarea id="stg-bio" rows={4} value={profileData.bio} onChange={event => setProfileData({ ...profileData, bio: event.target.value })} />
                    </div>
                    <div className="stg-field">
                      <label htmlFor="stg-experience">Professional experience</label>
                      <textarea id="stg-experience" rows={4} value={profileData.experience} onChange={event => setProfileData({ ...profileData, experience: event.target.value })} />
                    </div>
                    <div className="stg-field">
                      <label htmlFor="stg-skills">Expertise and skills</label>
                      <input id="stg-skills" aria-describedby="stg-skills-note" placeholder="React, Node.js, Python" value={profileData.skills} onChange={event => setProfileData({ ...profileData, skills: event.target.value })} />
                      <p id="stg-skills-note" className="stg-field-hint">Separate skills with commas.</p>
                    </div>
                  </div>
                </section>
              )}

              <footer className="stg-panel-footer">
                <button type="submit" className="stg-btn stg-btn-primary" disabled={isSaving}>
                  {isSaving ? <Loader2 className="animate-spin" /> : <Save />}{isSaving ? "Saving…" : "Save changes"}
                </button>
              </footer>
            </form>
          </div>
        )}

        {/* ── Security ─────────────────────────────── */}
        {activeTab === "Security" && (
          <div className="stg-panel">
            <header className="stg-panel-header">
              <div>
                <h1>Security</h1>
                <p>Manage your sign-in credentials and account security.</p>
              </div>
            </header>

            <section className="stg-card">
              <div className="stg-card-title-row">
                <KeyRound className="stg-card-icon" aria-hidden="true" />
                <h3>Change password</h3>
              </div>
              <p className="stg-card-desc">Use at least 8 characters for your new password.</p>
              <form onSubmit={handlePasswordChange} className="stg-field-stack stg-pw-form">
                {passwordFields.map(field => (
                  <div className="stg-field" key={field.key}>
                    <label htmlFor={`stg-${field.key}`}>{field.label}</label>
                    <div className="stg-pw-wrap">
                      <input
                        id={`stg-${field.key}`}
                        type={field.visible ? "text" : "password"}
                        required
                        minLength={field.key === "currentPassword" ? undefined : 8}
                        autoComplete={field.key === "currentPassword" ? "current-password" : "new-password"}
                        value={passwords[field.key]}
                        onChange={event => setPasswords({ ...passwords, [field.key]: event.target.value })}
                      />
                      <button type="button" className="stg-pw-toggle" onClick={field.toggle} aria-label={`${field.visible ? "Hide" : "Show"} ${field.label.toLowerCase()}`}>
                        {field.visible ? <EyeOff /> : <Eye />}
                      </button>
                    </div>
                  </div>
                ))}
                <footer className="stg-panel-footer">
                  <button type="submit" className="stg-btn stg-btn-primary" disabled={isSaving}>
                    {isSaving ? <Loader2 className="animate-spin" /> : <Lock />}{isSaving ? "Updating…" : "Update password"}
                  </button>
                </footer>
              </form>
            </section>
          </div>
        )}

        {/* ── Theme ────────────────────────────────── */}
        {activeTab === "Theme" && (
          <div className="stg-panel">
            <header className="stg-panel-header">
              <div>
                <h1>Theme</h1>
                <p>Personalize the look and feel of your workspace.</p>
              </div>
            </header>

            <section className="stg-card">
              <h3>Choose a theme</h3>
              <p className="stg-card-desc">Select a color palette. Changes apply instantly.</p>
              <div className="stg-theme-grid">
                {THEMES.map(item => {
                  const isActive = currentTheme === item.value;
                  return (
                    <button
                      key={item.value}
                      type="button"
                      className={`stg-theme-card${isActive ? " is-active" : ""}`}
                      onClick={() => setTheme(item.value)}
                      aria-label={`${item.label} theme${isActive ? ", selected" : ""}`}
                      aria-pressed={isActive}
                    >
                      <div className="stg-theme-swatch" style={{ background: item.color }} />
                      <div className="stg-theme-meta">
                        <span className="stg-theme-name">{item.label}</span>
                        <span className="stg-theme-mode">
                          {item.light ? <Sun className="stg-theme-mode-icon" /> : <Moon className="stg-theme-mode-icon" />}
                          {item.light ? "Light" : "Dark"}
                        </span>
                      </div>
                      {isActive && <Check className="stg-theme-check" />}
                    </button>
                  );
                })}
              </div>
            </section>
          </div>
        )}

        {/* ── Notifications / Privacy ──────────────── */}
        {(activeTab === "Notifications" || activeTab === "Privacy") && (
          <div className="stg-panel">
            <header className="stg-panel-header">
              <div>
                <h1>{activeTab === "Notifications" ? "Notifications" : "Privacy"}</h1>
                <p>{activeTab === "Notifications" ? "Control how and when you receive notifications." : "Manage your privacy preferences and data."}</p>
              </div>
            </header>

            <section className="stg-card stg-card-empty">
              <div className="stg-empty-state">
                {activeTab === "Notifications" ? <Bell className="stg-empty-icon" /> : <Shield className="stg-empty-icon" />}
                <h3>{activeTab === "Notifications" ? "Notification preferences" : "Privacy preferences"}</h3>
                <p>{activeTab === "Notifications" ? "Notification preferences are not available yet." : "Privacy preferences are not available yet."}</p>
              </div>
            </section>
          </div>
        )}

        {/* ── Mentor Application ───────────────────── */}
        {activeTab === "MentorApplication" && (
          <div className="stg-panel">
            <header className="stg-panel-header">
              <div>
                <h1>Mentor application</h1>
                <p>Your teaching experience and application status.</p>
              </div>
            </header>

            <section className="stg-card">
              {isLoadingApp ? (
                <div className="stg-status-block" role="status">
                  <Loader2 className="stg-status-icon animate-spin" />
                  <p>Loading application details…</p>
                </div>
              ) : applicationError ? (
                <div className="stg-status-block stg-status-error" role="alert">
                  <p>Could not load your application status.</p>
                  <button type="button" className="stg-btn stg-btn-outline" onClick={fetchMyApplication}><RotateCcw />Retry</button>
                </div>
              ) : mentorApp ? (
                <>
                  <div className="stg-mentor-status">
                    {mentorApp.status === "APPROVED" ? <CheckCircle2 className="stg-status-icon stg-color-success" />
                      : mentorApp.status === "PENDING" ? <Clock className="stg-status-icon stg-color-warning" />
                      : <GraduationCap className="stg-status-icon stg-color-danger" />}
                    <div>
                      <h3>
                        {mentorApp.status === "APPROVED" ? "Application approved"
                          : mentorApp.status === "PENDING" ? "Application under review"
                          : mentorApp.status === "REJECTED" ? "Application not approved"
                          : "Application submitted"}
                      </h3>
                      <p>
                        {mentorApp.status === "PENDING" ? "Applications are reviewed within 2–3 business days."
                          : mentorApp.status === "APPROVED" ? "Your mentor account is ready."
                          : mentorApp.status === "REJECTED" ? "You can update your details and apply again."
                          : "Your submitted details are shown below."}
                      </p>
                      {mentorApp.status === "APPROVED" && (
                        <button type="button" className="stg-btn stg-btn-primary" onClick={() => { dispatch(fetchProfile()); window.location.href = "/mentor"; }}>
                          <GraduationCap />Go to mentor dashboard
                        </button>
                      )}
                      {mentorApp.status === "REJECTED" && (
                        <button type="button" className="stg-btn stg-btn-outline" onClick={() => setMentorApp(null)}><RotateCcw />Apply again</button>
                      )}
                    </div>
                  </div>

                  <div className="stg-summary">
                    <h3>Submitted details</h3>
                    <dl className="stg-dl">
                      <div><dt>Biography</dt><dd>{mentorApp.bio}</dd></div>
                      <div><dt>Skills and expertise</dt><dd>{Array.isArray(mentorApp.skills) ? mentorApp.skills.join(", ") : mentorApp.skills}</dd></div>
                      <div><dt>Professional experience</dt><dd>{mentorApp.experience}</dd></div>
                    </dl>
                  </div>
                </>
              ) : (
                <form onSubmit={handleSubmitApplication} className="stg-field-stack">
                  <h3>Application details</h3>
                  <div className="stg-field">
                    <label htmlFor="stg-appBio">Biography</label>
                    <textarea id="stg-appBio" rows={4} required value={appForm.bio} onChange={event => setAppForm({ ...appForm, bio: event.target.value })} />
                  </div>
                  <div className="stg-field">
                    <label htmlFor="stg-appSkills">Skills and expertise</label>
                    <input id="stg-appSkills" aria-describedby="stg-appSkills-note" placeholder="React, Python, UI/UX" required value={appForm.skills} onChange={event => setAppForm({ ...appForm, skills: event.target.value })} />
                    <p id="stg-appSkills-note" className="stg-field-hint">Separate skills with commas.</p>
                  </div>
                  <div className="stg-field">
                    <label htmlFor="stg-appExperience">Teaching and professional experience</label>
                    <textarea id="stg-appExperience" rows={4} required value={appForm.experience} onChange={event => setAppForm({ ...appForm, experience: event.target.value })} />
                  </div>
                  <footer className="stg-panel-footer">
                    <button type="submit" className="stg-btn stg-btn-primary" disabled={isSaving}>
                      {isSaving ? <Loader2 className="animate-spin" /> : <GraduationCap />}{isSaving ? "Submitting…" : "Submit application"}
                    </button>
                  </footer>
                </form>
              )}
            </section>
          </div>
        )}
      </main>

      {/* ── Modals ─────────────────────────────────── */}
      <ImageCropper isOpen={isCropModalOpen} onClose={() => {
        setIsCropModalOpen(false); if (cropImageSrc) URL.revokeObjectURL(cropImageSrc); setCropImageSrc(null);
      }} imageSrc={cropImageSrc} onCropCompleteAction={handleAvatarUpload} isLoading={isUploadingAvatar} />
      <ConfirmDialog isOpen={isDeleteConfirmOpen} onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleAvatarDelete} title="Remove Profile Picture"
        description="Are you sure you want to remove your profile picture? This action cannot be undone."
        confirmText="Remove" isDanger={true} isLoading={isUploadingAvatar} />
      <Dialog open={isPreviewModalOpen} onOpenChange={setIsPreviewModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogTitle>Profile picture</DialogTitle>
          <DialogDescription className="sr-only">Preview of your current profile picture.</DialogDescription>
          <img src={user?.profileUrl ? (user.profileUrl.startsWith("http") ? user.profileUrl : `http://localhost:5005${user.profileUrl}`) : ""}
            alt="Profile preview" className="w-full aspect-square object-cover rounded-full" />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Settings;
