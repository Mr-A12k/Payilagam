import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { executeHttpGetRequest, executeHttpPostRequest, executeHttpPutRequest, executeHttpDeleteRequest } from "@/api/commonServices";
import { API_PATHS } from "@/api/constants";
import { Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui";
import { Loader2, Plus, Pencil, Power, X, Check, Search } from "lucide-react";
import toast from "react-hot-toast";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import "./AdminSettings.css";

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState("dropdowns"); // dropdowns, categories, tags, roles, users
  const queryClient = useQueryClient();

  return (
    <div className="admin-settings-container">
      <header className="admin-settings-header">
        <div>
          <h1>Site Configuration</h1>
          <p>Manage system dropdowns, categories, tags, and users</p>
        </div>
      </header>

      <div className="admin-settings-tabs" role="tablist">
        {[
          { id: "dropdowns", label: "Dropdown Options" },
          { id: "categories", label: "Categories" },
          { id: "tags", label: "Problem Tags" },
          { id: "roles", label: "Roles" },
          { id: "users", label: "User Deactivation" },
        ].map(tab => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="admin-settings-tab"
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="admin-settings-content">
        {activeTab === "dropdowns" && <DropdownOptionsTab queryClient={queryClient} />}
        {activeTab === "categories" && <CategoriesTab queryClient={queryClient} />}
        {activeTab === "tags" && <ProblemTagsTab queryClient={queryClient} />}
        {activeTab === "roles" && <RolesTab />}
        {activeTab === "users" && <UserDeactivationTab queryClient={queryClient} />}
      </div>
    </div>
  );
};

// --------------------------------------------------------------------------- //
// DROPDOWN OPTIONS TAB
// --------------------------------------------------------------------------- //

const DropdownOptionsTab = ({ queryClient }: any) => {
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [newGroupModal, setNewGroupModal] = useState(false);
  const [newGroupForm, setNewGroupForm] = useState("");
  const [editingOption, setEditingOption] = useState<any>(null);
  const [newOption, setNewOption] = useState({ value: "", label: "", sortOrder: 1 });

  const { data: groups = [] } = useQuery({
    queryKey: ["dropdownGroups"],
    queryFn: () => executeHttpGetRequest(API_PATHS.ADMIN.DROPDOWN_OPTIONS).then(res => res.data.data),
  });

  // Auto-select first group if none selected
  useEffect(() => {
    if (!selectedGroup && groups.length > 0) {
      setSelectedGroup(groups[0].fieldGroup);
    }
  }, [selectedGroup, groups]);

  const { data: options = [], isLoading: loadingOptions } = useQuery({
    queryKey: ["dropdownOptionsAdmin", selectedGroup],
    queryFn: () => executeHttpGetRequest(`${API_PATHS.ADMIN.DROPDOWN_OPTIONS_GROUP(selectedGroup)}?includeInactive=true`).then(res => res.data.data),
    enabled: !!selectedGroup,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => executeHttpPostRequest(API_PATHS.ADMIN.DROPDOWN_OPTIONS, data),
    onSuccess: () => {
      toast.success("Option created");
      setNewOption({ value: "", label: "", sortOrder: (options.length || 0) + 2 });
      setNewGroupModal(false);
      queryClient.invalidateQueries({ queryKey: ["dropdownGroups"] });
      queryClient.invalidateQueries({ queryKey: ["dropdownOptionsAdmin", selectedGroup] });
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || "Failed to create option"),
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => executeHttpPutRequest(API_PATHS.ADMIN.DROPDOWN_OPTION(data.optionId), data),
    onSuccess: () => {
      toast.success("Option updated");
      setEditingOption(null);
      queryClient.invalidateQueries({ queryKey: ["dropdownOptionsAdmin", selectedGroup] });
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || "Failed to update option"),
  });

  const handleCreate = () => {
    if (!newOption.value || !newOption.label) return toast.error("Value and label required");
    createMutation.mutate({ fieldGroup: selectedGroup, ...newOption, sortOrder: Number(newOption.sortOrder) });
  };

  const handleUpdate = () => {
    if (!editingOption.label) return toast.error("Label required");
    updateMutation.mutate({ ...editingOption, sortOrder: Number(editingOption.sortOrder) });
  };

  const toggleStatus = (opt: any) => updateMutation.mutate({ optionId: opt.optionId, isActive: !opt.isActive });

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-[var(--border-default)] flex items-center justify-between bg-[var(--bg-surface-2)]">
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium">Field Group:</label>
          <Select value={selectedGroup} onValueChange={setSelectedGroup}>
            <SelectTrigger className="w-[250px]"><SelectValue placeholder="Select group" /></SelectTrigger>
            <SelectContent>
              {groups.map((g: any) => <SelectItem key={g.fieldGroup} value={g.fieldGroup}>{g.fieldGroup} ({g.count})</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" size="sm" onClick={() => setNewGroupModal(true)}><Plus className="w-4 h-4 mr-1" /> New Group</Button>
      </div>

      <div className="admin-settings-table-wrapper">
        <table className="admin-settings-table">
          <thead>
            <tr><th>Value (ID)</th><th>Label</th><th>Sort Order</th><th className="text-right">Actions</th></tr>
          </thead>
          <tbody>
            {loadingOptions ? <tr><td colSpan={4} className="text-center py-8"><Loader2 className="w-5 h-5 animate-spin mx-auto text-[var(--accent-primary)]" /></td></tr> : options.map((opt: any) => (
              <tr key={opt.optionId} className={opt.isActive ? "" : "inactive"}>
                <td className="font-mono text-xs">{opt.value}</td>
                <td>
                  {editingOption?.optionId === opt.optionId ? (
                    <Input value={editingOption.label} onChange={e => setEditingOption({ ...editingOption, label: e.target.value })} className="h-8" />
                  ) : (
                    <span>{opt.label} {!opt.isActive && <span className="text-xs text-red-500 ml-2">(Inactive)</span>}</span>
                  )}
                </td>
                <td>
                  {editingOption?.optionId === opt.optionId ? (
                    <Input type="number" value={editingOption.sortOrder} onChange={e => setEditingOption({ ...editingOption, sortOrder: e.target.value })} className="h-8 w-20" />
                  ) : (
                    opt.sortOrder
                  )}
                </td>
                <td>
                  <div className="admin-settings-table-actions">
                    {editingOption?.optionId === opt.optionId ? (
                      <>
                        <Button variant="ghost" size="icon-sm" onClick={() => setEditingOption(null)}><X className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon-sm" onClick={handleUpdate} disabled={updateMutation.isPending}><Check className="w-4 h-4 text-green-500" /></Button>
                      </>
                    ) : (
                      <>
                        <Button variant="ghost" size="icon-sm" onClick={() => setEditingOption(opt)}><Pencil className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon-sm" onClick={() => toggleStatus(opt)} title={opt.isActive ? "Deactivate" : "Activate"}><Power className={`w-4 h-4 ${opt.isActive ? "text-red-500" : "text-green-500"}`} /></Button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="admin-settings-add-row">
        <div className="admin-settings-field">
          <label>Value (Internal ID)</label>
          <Input placeholder="e.g. beginner" value={newOption.value} onChange={e => setNewOption({ ...newOption, value: e.target.value })} className="admin-settings-input" />
        </div>
        <div className="admin-settings-field">
          <label>Display Label</label>
          <Input placeholder="e.g. Beginner" value={newOption.label} onChange={e => setNewOption({ ...newOption, label: e.target.value })} className="admin-settings-input" />
        </div>
        <div className="admin-settings-field max-w-[100px]">
          <label>Order</label>
          <Input type="number" value={newOption.sortOrder} onChange={e => setNewOption({ ...newOption, sortOrder: Number(e.target.value) })} className="admin-settings-input" />
        </div>
        <Button onClick={handleCreate} disabled={createMutation.isPending || !selectedGroup}><Plus className="w-4 h-4 mr-1" /> Add Option</Button>
      </div>

      {newGroupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-[var(--bg-surface)] p-6 rounded-xl w-full max-w-md space-y-4">
            <h3 className="font-semibold text-lg">New Field Group</h3>
            <div>
              <label className="text-sm">Group Name (snake_case)</label>
              <Input placeholder="e.g. user_type" value={newGroupForm} onChange={e => setNewGroupForm(e.target.value)} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setNewGroupModal(false)}>Cancel</Button>
              <Button onClick={() => { setSelectedGroup(newGroupForm); setNewGroupModal(false); }}>Create</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --------------------------------------------------------------------------- //
// CATEGORIES TAB
// --------------------------------------------------------------------------- //
const CategoriesTab = ({ queryClient }: any) => {
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["adminCategories"],
    queryFn: () => executeHttpGetRequest(API_PATHS.CATEGORIES.BASE).then(res => res.data.data),
  });
  const [newCat, setNewCat] = useState({ name: "" });

  const createMutation = useMutation({
    mutationFn: (data: any) => executeHttpPostRequest(API_PATHS.CATEGORIES.BASE, data),
    onSuccess: () => { toast.success("Category created"); setNewCat({ name: "" }); queryClient.invalidateQueries({ queryKey: ["adminCategories"] }); },
    onError: (err: any) => toast.error(err?.response?.data?.message || "Failed to create"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => executeHttpDeleteRequest(`${API_PATHS.CATEGORIES.BASE}/${id}`),
    onSuccess: () => { toast.success("Category deleted"); queryClient.invalidateQueries({ queryKey: ["adminCategories"] }); },
    onError: (err: any) => toast.error(err?.response?.data?.message || "Failed to delete"),
  });

  return (
    <div className="flex flex-col h-full">
      <div className="admin-settings-table-wrapper flex-1">
        <table className="admin-settings-table">
          <thead><tr><th>Name</th><th>Slug</th><th>Courses</th><th className="text-right">Actions</th></tr></thead>
          <tbody>
            {isLoading ? <tr><td colSpan={4} className="text-center py-8"><Loader2 className="w-5 h-5 animate-spin mx-auto" /></td></tr> : categories.map((cat: any) => (
              <tr key={cat.categoryId}>
                <td className="font-medium">{cat.name}</td>
                <td className="text-xs text-[var(--text-muted)]">{cat.slug}</td>
                <td>{cat._count?.courses || 0}</td>
                <td>
                  <div className="admin-settings-table-actions">
                    <Button variant="ghost" size="icon-sm" onClick={() => {
                      if (confirm("Delete category?")) deleteMutation.mutate(cat.categoryId);
                    }} disabled={cat._count?.courses > 0}><X className="w-4 h-4 text-red-500" /></Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="admin-settings-add-row">
        <div className="admin-settings-field">
          <label>Category Name</label>
          <Input placeholder="e.g. Web Development" value={newCat.name} onChange={e => setNewCat({ name: e.target.value })} className="admin-settings-input" />
        </div>
        <Button onClick={() => createMutation.mutate(newCat)} disabled={!newCat.name || createMutation.isPending}><Plus className="w-4 h-4 mr-1" /> Add Category</Button>
      </div>
    </div>
  );
};

// --------------------------------------------------------------------------- //
// PROBLEM TAGS TAB
// --------------------------------------------------------------------------- //
const ProblemTagsTab = ({ queryClient }: any) => {
  const { data: tags = [], isLoading } = useQuery({
    queryKey: ["adminTags"],
    queryFn: () => executeHttpGetRequest(API_PATHS.ADMIN.PROBLEM_TAGS).then(res => res.data.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => executeHttpDeleteRequest(API_PATHS.ADMIN.PROBLEM_TAG(id)),
    onSuccess: () => { toast.success("Tag deleted"); queryClient.invalidateQueries({ queryKey: ["adminTags"] }); },
    onError: (err: any) => toast.error(err?.response?.data?.message || "Failed to delete"),
  });

  return (
    <div className="flex flex-col h-full">
      <div className="admin-settings-table-wrapper flex-1">
        <table className="admin-settings-table">
          <thead><tr><th>Name</th><th>Slug</th><th>Problems</th><th className="text-right">Actions</th></tr></thead>
          <tbody>
            {isLoading ? <tr><td colSpan={4} className="text-center py-8"><Loader2 className="w-5 h-5 animate-spin mx-auto" /></td></tr> : tags.length === 0 ? <tr><td colSpan={4} className="text-center py-8 text-[var(--text-muted)]">No tags yet. Tags are created automatically when added to problems.</td></tr> : tags.map((tag: any) => (
              <tr key={tag.tagId}>
                <td className="font-medium">{tag.name}</td>
                <td className="text-xs text-[var(--text-muted)]">{tag.slug}</td>
                <td>{tag._count?.problems || 0}</td>
                <td>
                  <div className="admin-settings-table-actions">
                    <Button variant="ghost" size="icon-sm" onClick={() => {
                      if (confirm("Delete tag?")) deleteMutation.mutate(tag.tagId);
                    }} disabled={tag._count?.problems > 0}><X className="w-4 h-4 text-red-500" /></Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --------------------------------------------------------------------------- //
// ROLES TAB
// --------------------------------------------------------------------------- //
const RolesTab = () => {
  const { data: roles = [], isLoading } = useQuery({
    queryKey: ["adminRoles"],
    queryFn: () => executeHttpGetRequest("/admin/roles").then(res => res.data.data),
  });

  return (
    <div className="flex flex-col h-full">
      <div className="admin-settings-table-wrapper flex-1">
        <table className="admin-settings-table">
          <thead><tr><th>ID</th><th>Role Name</th><th>Users</th></tr></thead>
          <tbody>
            {isLoading ? <tr><td colSpan={3} className="text-center py-8"><Loader2 className="w-5 h-5 animate-spin mx-auto" /></td></tr> : roles.map((role: any) => (
              <tr key={role.roleId}>
                <td className="font-mono text-xs">{role.roleId}</td>
                <td className="font-medium capitalize">{role.roleName}</td>
                <td>{role._count?.users || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --------------------------------------------------------------------------- //
// USER DEACTIVATION TAB
// --------------------------------------------------------------------------- //
const UserDeactivationTab = ({ queryClient }: any) => {
  const [search, setSearch] = useState("");
  const [confirmUser, setConfirmUser] = useState<any>(null);
  
  const { data: users = [], isLoading } = useQuery({
    queryKey: ["adminUsersSearch", search],
    queryFn: () => executeHttpGetRequest(API_PATHS.ADMIN.USERS, { search, limit: 10 }).then(res => res.data.data),
    enabled: search.length > 2,
  });

  const toggleMutation = useMutation({
    mutationFn: (id: string) => executeHttpPutRequest(API_PATHS.ADMIN.TOGGLE_STATUS(id)),
    onSuccess: () => { toast.success("User status updated"); setConfirmUser(null); queryClient.invalidateQueries({ queryKey: ["adminUsersSearch"] }); },
    onError: (err: any) => toast.error(err?.response?.data?.message || "Failed to update status"),
  });

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-[var(--border-default)]">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-[var(--text-muted)]" />
          <Input placeholder="Search users by name or email..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>
      </div>
      <div className="admin-settings-table-wrapper flex-1">
        <table className="admin-settings-table">
          <thead><tr><th>User</th><th>Email</th><th>Role</th><th>Status</th><th className="text-right">Actions</th></tr></thead>
          <tbody>
            {search.length <= 2 ? <tr><td colSpan={5} className="text-center py-8 text-[var(--text-muted)]">Type at least 3 characters to search</td></tr> :
             isLoading ? <tr><td colSpan={5} className="text-center py-8"><Loader2 className="w-5 h-5 animate-spin mx-auto" /></td></tr> : 
             users.length === 0 ? <tr><td colSpan={5} className="text-center py-8 text-[var(--text-muted)]">No users found</td></tr> : 
             users.map((user: any) => (
              <tr key={user.userId}>
                <td className="font-medium">{user.fullName}</td>
                <td className="text-sm text-[var(--text-muted)]">{user.email}</td>
                <td className="capitalize">{user.role?.roleName}</td>
                <td><span className={`px-2 py-1 rounded-full text-xs ${user.isActive ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}>{user.isActive ? "Active" : "Inactive"}</span></td>
                <td>
                  <div className="admin-settings-table-actions">
                    <Button variant={user.isActive ? "destructive" : "default"} size="sm" onClick={() => setConfirmUser(user)}>
                      {user.isActive ? "Deactivate" : "Activate"}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmDialog 
        isOpen={!!confirmUser} 
        onClose={() => setConfirmUser(null)} 
        title={confirmUser?.isActive ? "Deactivate User" : "Activate User"}
        description={`Are you sure you want to ${confirmUser?.isActive ? "deactivate" : "activate"} ${confirmUser?.fullName}? ${confirmUser?.isActive ? "This will disable their account." : ""}`}
        confirmText={confirmUser?.isActive ? "Deactivate" : "Activate"}
        destructive={confirmUser?.isActive}
        isLoading={toggleMutation.isPending}
        onConfirm={() => toggleMutation.mutate(confirmUser.userId)}
      />
    </div>
  );
};

export default AdminSettings;
