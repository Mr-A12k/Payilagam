import { useState, type FormEvent } from "react";
import { useSelector } from "react-redux";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Check, Download, Loader2, Pencil, Power, Search, UserPlus } from "lucide-react";
import { Button, Avatar } from "@/components/ui";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { executeHttpGetRequest, executeHttpPostRequest, executeHttpPutRequest, executeHttpDeleteRequest } from "@/api/commonServices";
import { API_PATHS } from "@/api/constants";
import toast from "react-hot-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";

const emptyUser = { userName: "", fullName: "", email: "", mobile: "", roleId: 3 };
const fieldClass = "h-10 w-full rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] px-3 text-sm text-[var(--text-primary)]";
const csvCell = (value: unknown) => {
  const text = String(value ?? "");
  const safe = /^[\s]*[=+@-]/.test(text) || /^[\t\r\n]/.test(text) ? "'" + text : text;
  return '"' + safe.replace(/"/g, '""') + '"';
};

const UserManagement = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const currentUser = useSelector((state: any) => state.auth.user);
  const [searchParams, setSearchParams] = useSearchParams();
  const isAdmin = currentUser?.role === "admin" || currentUser?.role?.roleName === "admin" || currentUser?.roleId === 1;
  const tabs = isAdmin ? ["Students", "Mentors", "Admins", "Applications"] : ["Students", "Mentors", "Admins"];
  const requestedTab = searchParams.get("tab") || "Students";
  const activeTab = tabs.includes(requestedTab) ? requestedTab : "Students";
  const page = Math.max(1, Number.parseInt(searchParams.get("page") || "1", 10) || 1);
  const search = searchParams.get("search") || "";
  const [form, setForm] = useState<any>(null);
  const [confirmation, setConfirmation] = useState<{ user: any; action: "toggle" | "deactivate" } | null>(null);
  const [busy, setBusy] = useState(false);
  const isApplications = activeTab === "Applications";
  const role = activeTab === "Mentors" ? "mentor" : activeTab === "Admins" ? "admin" : "student";
  const changeParams = (values: Record<string, string>, replace = false) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(values).forEach(([key, value]) => value ? next.set(key, value) : next.delete(key));
    setSearchParams(next, { replace });
  };
  const usersQuery = useQuery({
    queryKey: ["adminUsers", role, search, page],
    queryFn: () => executeHttpGetRequest(API_PATHS.ADMIN.USERS, { role, search, page, limit: 20 }),
    enabled: !isApplications,
  });
  const users = Array.isArray(usersQuery.data?.data?.data) ? usersQuery.data.data.data : [];
  const query = usersQuery;
  const pagination = usersQuery.data?.data?.pagination;
  const editing = form?.userId != null;

  const saveUser = async (event: FormEvent) => {
    event.preventDefault();
    if (busy || !form) return;
    if ([form.fullName, form.email, form.mobile, ...(!editing ? [form.userName] : [])].some(value => !String(value ?? '').trim())) {
      toast.error('Please fill in all account details');
      return;
    }
    setBusy(true);
    try {
      const payload = { fullName: form.fullName.trim(), email: form.email.trim(), mobile: form.mobile.trim(), roleId: Number(form.roleId) };
      if (editing) await executeHttpPutRequest(API_PATHS.ADMIN.USER(String(form.userId)), payload);
      else await executeHttpPostRequest(API_PATHS.ADMIN.USERS, { ...payload, userName: form.userName.trim() });
      toast.success(editing ? "User updated" : "Account created");
      setForm(null);
      await queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Could not save user");
    } finally {
      setBusy(false);
    }
  };

  const confirmStatus = async () => {
    if (!confirmation || busy) return;
    setBusy(true);
    try {
      const { user, action } = confirmation;
      if (action === "deactivate") await executeHttpDeleteRequest(API_PATHS.ADMIN.USER(String(user.userId)));
      else await executeHttpPutRequest(API_PATHS.ADMIN.TOGGLE_STATUS(String(user.userId)));
      toast.success(action === "deactivate" || user.isActive ? "User deactivated" : "User activated");
      setConfirmation(null);
      await queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Could not update account status");
    } finally {
      setBusy(false);
    }
  };

  const downloadUsers = () => {
    if (!users.length) return;
    const rows = [
      ["Full Name", "Username", "Email", "Mobile", "Role", "Status"],
      ...users.map((user: any) => [user.fullName, user.userName, user.email, user.mobile, user.role?.roleName, user.isActive ? "Active" : "Inactive"]),
    ];
    const blob = new Blob(["\uFEFF" + rows.map((row) => row.map(csvCell).join(",")).join("\r\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `payilagam_${activeTab.toLowerCase()}_page_${page}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  if (isApplications) return <Navigate to="/admin/mentor-applications" replace />;

  return (
    <div className="mx-auto w-full min-w-0 max-w-7xl space-y-5 p-4 text-[var(--text-primary)] sm:p-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-2xl font-semibold text-[var(--text-heading)]">User management</h1><p className="mt-1 text-sm text-[var(--text-muted)]">Accounts and mentor applications</p></div>
        {!isApplications && <Button onClick={() => setForm({ ...emptyUser, roleId: role === "admin" ? 1 : role === "mentor" ? 2 : 3 })}><UserPlus className="h-4 w-4" /> Add {role}</Button>}
      </header>
      <section className="min-w-0 border-t border-[var(--border-default)] pt-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex max-w-full flex-wrap gap-1" role="tablist" aria-label="Account types">
            {tabs.map((tab) => <button key={tab} type="button" role="tab" aria-selected={activeTab === tab} onClick={() => tab === "Applications" ? navigate("/admin/mentor-applications") : changeParams({ tab, page: "1", search: "" })} className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${activeTab === tab ? "bg-[var(--bg-surface-3)] text-[var(--text-heading)]" : "text-[var(--text-muted)] hover:bg-[var(--bg-surface-2)]"}`}>{tab}</button>)}
          </div>
          <div className="flex w-full min-w-0 items-center gap-2 sm:w-auto">
            <div className="relative min-w-0 flex-1 sm:w-64"><Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-[var(--text-muted)]" /><input type="search" aria-label={isApplications ? "Search applications" : "Search users"} placeholder={isApplications ? "Search applications" : "Search users"} value={search} onChange={(event) => changeParams({ search: event.target.value, page: "1" }, true)} className={`${fieldClass} pl-9`} /></div>
            {!isApplications && <Button variant="outline" size="icon" title="Export current page" aria-label="Export current page" disabled={!users.length || query.isFetching || query.isError} onClick={downloadUsers}><Download className="h-4 w-4" /></Button>}
          </div>
        </div>
        {query.isError ? <div role="alert" className="flex flex-wrap items-center gap-3 py-8 text-sm"><p>Could not load {isApplications ? "applications" : "users"}.</p><Button variant="outline" onClick={() => query.refetch()}>Retry</Button></div> : (
          <div className="table-card-wrapper" role="region" aria-label="Users table">
            <div className="table-scroll-viewport" tabIndex={0}>
              <table className="w-full min-w-[760px] text-left text-sm border-separate border-spacing-0">
                <thead className="sticky top-0 z-20 bg-[var(--bg-surface-2)] text-xs text-[var(--text-muted)]">
                  <tr>
                    {["User", "Joined", activeTab === "Students" ? "Enrollments" : "Courses taught", "Status", "Actions"].map((heading) => (
                      <th key={heading} scope="col" className="px-4 py-3 font-medium last:text-right border-b border-[var(--border-default)]">{heading}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-default)]">
                  {query.isLoading ? <tr><td colSpan={5} className="px-4 py-12 text-center text-[var(--text-muted)]"><span role="status" className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Loading...</span></td></tr> : users.length === 0 ? <tr><td colSpan={5} className="px-4 py-12 text-center text-[var(--text-muted)]">No {activeTab.toLowerCase()} found.</td></tr> : users.map((user: any) => (
                    <tr key={user.userId} className="hover:bg-[var(--bg-surface-2)] transition-colors">
                      <td className="px-4 py-3 border-b border-[var(--border-subtle)]"><div className="flex items-center gap-3"><Avatar src={user.profileUrl} fallback={user.fullName?.[0] || user.userName?.[0] || "U"} size="sm" /><div><p className="font-medium">{user.fullName || user.userName}</p><p className="mt-1 text-xs text-[var(--text-muted)]">{user.email}</p></div></div></td>
                      <td className="whitespace-nowrap px-4 py-3 text-xs text-[var(--text-muted)] border-b border-[var(--border-subtle)]">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "-"}</td>
                      <td className="px-4 py-3 tabular-nums border-b border-[var(--border-subtle)]">{(activeTab === "Students" ? user._count?.enrollments : user._count?.coursesTaught) ?? 0}</td>
                      <td className="px-4 py-3 text-xs border-b border-[var(--border-subtle)]">{user.isActive ? "Active" : "Inactive"}</td>
                      <td className="px-4 py-3 border-b border-[var(--border-subtle)]"><div className="flex justify-end gap-1"><Button variant="ghost" size="icon-sm" title="Edit user" aria-label="Edit user" onClick={() => setForm({ ...emptyUser, ...user, roleId: user.roleId ?? user.role?.roleId ?? 3 })}><Pencil className="h-4 w-4" /></Button><Button variant="ghost" size="icon-sm" title={user.isActive ? "Deactivate user" : "Activate user"} aria-label={user.isActive ? "Deactivate user" : "Activate user"} onClick={() => setConfirmation({ user, action: user.isActive ? "deactivate" : "toggle" })}><Power className="h-4 w-4" /></Button></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!isApplications && (
              <footer className="table-card-footer px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs text-[var(--text-muted)]">
                <span>{pagination?.total ?? users.length} users</span>
                <div className="flex items-center gap-3">
                  <span>Page {page}</span>
                  <Button variant="outline" size="icon-sm" title="Previous page" aria-label="Previous page" disabled={page === 1 || query.isLoading} onClick={() => changeParams({ page: String(page - 1) })}><ArrowLeft className="h-4 w-4" /></Button>
                  <Button variant="outline" size="icon-sm" title="Next page" aria-label="Next page" disabled={!pagination?.hasNext || query.isLoading || query.isError} onClick={() => changeParams({ page: String(page + 1) })}><ArrowRight className="h-4 w-4" /></Button>
                </div>
              </footer>
            )}
          </div>
        )}
      </section>

      <Dialog open={form !== null} onOpenChange={(open: boolean) => { if (!open && !busy) setForm(null); }}>
        <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)]" showCloseButton={!busy}>
          <DialogTitle>{editing ? "Edit user" : "Add user"}</DialogTitle>
          <DialogDescription>{editing ? "Account details" : "New accounts use the default password Payilagam@123."}</DialogDescription>
          {form && <form onSubmit={saveUser} className="space-y-4">
            <div className="text-xs text-[var(--text-secondary)]"><label htmlFor="account-role">Role</label><Select value={String(form.roleId)} onValueChange={(value: string) => setForm({ ...form, roleId: Number(value) })}><SelectTrigger id="account-role" className="mt-1.5"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="3">Student</SelectItem><SelectItem value="2">Mentor</SelectItem><SelectItem value="1">Admin</SelectItem></SelectContent></Select></div>
            {(["fullName", ...(!editing ? ["userName"] : []), "email", "mobile"] as const).map((key) => <label key={key} className="block text-xs text-[var(--text-secondary)]">{({ fullName: "Full name", userName: "Username", email: "Email", mobile: "Mobile" } as Record<string, string>)[key]}<input required type={key === "email" ? "email" : key === "mobile" ? "tel" : "text"} autoComplete={key === "email" ? "email" : key === "mobile" ? "tel" : key === "fullName" ? "name" : "username"} className={`${fieldClass} mt-1.5`} value={form[key] ?? ""} onChange={(event) => setForm({ ...form, [key]: event.target.value })} /></label>)}
            <div className="flex flex-wrap justify-end gap-2 border-t border-[var(--border-default)] pt-4"><Button type="button" variant="outline" disabled={busy} onClick={() => setForm(null)}>Cancel</Button><Button type="submit" disabled={busy}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}{editing ? "Save changes" : "Create account"}</Button></div>
          </form>}
        </DialogContent>
      </Dialog>
      <Dialog open={confirmation !== null} onOpenChange={(open: boolean) => { if (!open && !busy) setConfirmation(null); }}>
        <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)]" showCloseButton={!busy}>
          <DialogTitle>{confirmation?.user.isActive ? "Deactivate user" : "Activate user"}</DialogTitle>
          <DialogDescription>{confirmation?.user.isActive ? "This disables the account without deleting its data. You can reactivate it later." : "Restore access to this account."}</DialogDescription>
          <p className="break-words text-sm">{confirmation?.user.fullName || confirmation?.user.userName}</p>
          <div className="flex flex-wrap justify-end gap-2"><Button variant="outline" disabled={busy} onClick={() => setConfirmation(null)}>Cancel</Button><Button disabled={busy} onClick={confirmStatus}><Power className="h-4 w-4" />{confirmation?.user.isActive ? "Deactivate" : "Activate"}</Button></div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
