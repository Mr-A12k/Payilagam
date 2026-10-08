import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Save, Plus, SlidersHorizontal, Tags, Type, ArrowUp, ArrowDown } from "lucide-react";
import { Button, Input } from "@/components/ui";
import { executeHttpGetRequest, executeHttpPostRequest, executeHttpPutRequest } from "@/api/commonServices";
import { useCustomization, settingsKey, type OptionGroup, type FieldOption } from "@/features/customization/useCustomization";
import labels from "@/features/customization/labels.json";
import "./UiCustomization.css";

function OptionEditor({ name, group }: { name: string; group: OptionGroup }) {
  const client = useQueryClient();
  const [options, setOptions] = useState(group.options);
  const [newValue, setNewValue] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [error, setError] = useState("");
  const save = useMutation({ mutationFn: () => executeHttpPutRequest(`/ui-settings/${name}`, { value: options, revision: group.revision }), onSuccess: () => client.invalidateQueries({ queryKey: settingsKey }), onError: (err: any) => setError(err.response?.data?.message || "Could not save. Your changes are still here.") });
  const update = (value: string, patch: Partial<FieldOption>) => setOptions(previous => previous.map(option => option.value === value ? { ...option, ...patch } : option));
  const move = (index: number, offset: number) => { const next = [...options]; [next[index], next[index + offset]] = [next[index + offset], next[index]]; setOptions(next); };
  return <form onSubmit={event => { event.preventDefault(); setError(""); save.mutate(); }} className="customization-editor">
    <h2>{group.title}</h2><p>{group.addable ? "Add choices, rename them, or change their order. Disable a choice to stop new selections while keeping existing records readable." : "Rename the labels below. These choices control built-in behavior, so their values stay fixed."}</p>
    <fieldset disabled={save.isPending}>
      <div className="customization-options">{options.map((option, index) => <div key={option.value} className="customization-option">
        <div className="min-w-0 flex-1"><label htmlFor={`option-${option.value}`}>Display label</label><Input id={`option-${option.value}`} value={option.label} required maxLength={100} onChange={e => update(option.value, { label: e.target.value })} /><small>Stored value: {option.value}</small></div>
        {group.addable && <label className="customization-check"><input type="checkbox" checked={option.enabled} onChange={e => update(option.value, { enabled: e.target.checked })} />Enabled</label>}
        <div className="flex"><Button type="button" size="icon" variant="ghost" aria-label={`Move ${option.label} up`} disabled={index === 0} onClick={() => move(index, -1)}><ArrowUp className="w-4 h-4" /></Button><Button type="button" size="icon" variant="ghost" aria-label={`Move ${option.label} down`} disabled={index === options.length - 1} onClick={() => move(index, 1)}><ArrowDown className="w-4 h-4" /></Button></div>
      </div>)}</div>
      {group.addable && <div className="customization-add"><div><label htmlFor="new-option-label">New choice</label><Input id="new-option-label" value={newLabel} onChange={e => { setNewLabel(e.target.value); setNewValue(e.target.value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-$/, "")); }} placeholder="For example, Expert" /></div><div><label htmlFor="new-option-value">Stored value</label><Input id="new-option-value" value={newValue} onChange={e => setNewValue(e.target.value)} placeholder="expert" /></div><Button type="button" variant="outline" disabled={!newLabel.trim() || !/^[a-z0-9][a-z0-9_-]{0,63}$/.test(newValue) || options.some(option => option.value === newValue)} onClick={() => { setOptions([...options, { label: newLabel.trim(), value: newValue, enabled: true }]); setNewLabel(""); setNewValue(""); }}><Plus className="w-4 h-4" />Add choice</Button></div>}
      {error && <p role="alert" className="customization-error">{error}</p>}
      <Button type="submit" disabled={JSON.stringify(options) === JSON.stringify(group.options)}><Save className="w-4 h-4" />{save.isPending ? "Saving…" : "Save dropdown"}</Button>
      {save.isSuccess && <p role="status">Saved.</p>}
    </fieldset>
  </form>;
}

function LabelEditor({ initial, revision }: { initial: Record<string, string>; revision: number }) {
  const client = useQueryClient();
  const [values, setValues] = useState(initial);
  const [search, setSearch] = useState("");
  const save = useMutation({ mutationFn: () => executeHttpPutRequest("/ui-settings/labels", { value: values, revision }), onSuccess: () => client.invalidateQueries({ queryKey: settingsKey }) });
  return <form className="customization-editor" onSubmit={event => { event.preventDefault(); save.mutate(); }}><h2>Form labels</h2><p>Change the labels used by existing forms. The same original label is updated everywhere it appears. Inputs and validation keep their existing behavior.</p><Input aria-label="Find a form label" placeholder="Find a label…" value={search} onChange={e => setSearch(e.target.value)} /><fieldset disabled={save.isPending}>
    {labels.filter(label => label.toLowerCase().includes(search.toLowerCase())).map((label, index) => <div className="customization-label" key={label}><label htmlFor={`form-label-${index}`}>{label}</label><Input id={`form-label-${index}`} required maxLength={200} value={values[label] ?? label} onChange={e => setValues(previous => ({ ...previous, [label]: e.target.value }))} /><Button variant="ghost" type="button" onClick={() => setValues(previous => { const next = { ...previous }; delete next[label]; return next; })}>Reset</Button></div>)}
    {save.isError && <p role="alert" className="customization-error">{(save.error as any).response?.data?.message || "Unable to save labels."}</p>}
    <Button type="submit" disabled={JSON.stringify(values) === JSON.stringify(initial)}><Save className="w-4 h-4" />{save.isPending ? "Saving…" : "Save labels"}</Button>
  </fieldset></form>;
}

function Categories() {
  const client = useQueryClient();
  const query = useQuery({ queryKey: ["categories", "manage"], queryFn: () => executeHttpGetRequest("/categories") });
  const [editing, setEditing] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const save = useMutation({ mutationFn: () => editing ? executeHttpPutRequest(`/categories/${editing}`, { name: name.trim(), description }) : executeHttpPostRequest("/categories", { name: name.trim(), description }), onSuccess: () => { void client.invalidateQueries({ queryKey: ["categories"] }); setEditing(null); setName(""); setDescription(""); } });
  const flatten = (items: any[], depth = 0): any[] => items.flatMap(item => [{ ...item, depth }, ...flatten(item.children || [], depth + 1)]);
  return <div className="customization-editor"><h2>Course categories</h2><p>Add and rename categories used by course creation and browsing. Renaming keeps courses linked to the same category.</p>
    {query.isLoading ? <p role="status">Loading categories…</p> : query.isError ? <div role="alert"><p>Unable to load categories.</p><Button onClick={() => query.refetch()}>Retry</Button></div> : <div>{flatten(query.data?.data?.data || []).map(category => <div className="customization-category" key={category.categoryId}><div style={{ paddingLeft: category.depth * 14 }}><strong>{category.name}</strong><p>{category.description}</p></div><Button variant="ghost" disabled={save.isPending} onClick={() => { setEditing(category.categoryId); setName(category.name); setDescription(category.description || ""); }}>Edit</Button></div>)}</div>}
    <form onSubmit={event => { event.preventDefault(); save.mutate(); }}><fieldset disabled={save.isPending}><h3>{editing ? "Edit category" : "New category"}</h3><label htmlFor="category-name">Category name</label><Input id="category-name" required maxLength={100} value={name} onChange={e => setName(e.target.value)} /><label htmlFor="category-description">Description</label><Input id="category-description" value={description} onChange={e => setDescription(e.target.value)} />{save.isError && <p role="alert" className="customization-error">{(save.error as any).response?.data?.message || "Unable to save category."}</p>}<div className="flex gap-2"><Button type="submit" disabled={!name.trim()}>{save.isPending ? "Saving…" : editing ? "Save category" : "Add category"}</Button>{editing && <Button type="button" variant="ghost" onClick={() => { setEditing(null); setName(""); setDescription(""); }}>Cancel</Button>}</div></fieldset></form>
  </div>;
}

export default function UiCustomization() {
  const query = useCustomization();
  const [section, setSection] = useState("categories");
  return <div className="ui-customization"><header><SlidersHorizontal className="w-6 h-6 text-[var(--accent-primary)]" /><div><h1>Forms & dropdowns</h1><p>Manage form labels and choices across the application.</p></div></header>
    {query.isLoading ? <p role="status">Loading settings…</p> : query.isError ? <div role="alert"><p>Could not load customization settings.</p><Button onClick={() => query.refetch()}>Retry</Button></div> : query.data && <div className="customization-layout"><nav aria-label="Customization sections">{[{ key: "categories", title: "Course categories", icon: Tags }, ...Object.entries(query.data.groups).map(([key, group]) => ({ key, title: group.title, icon: SlidersHorizontal })), { key: "labels", title: "Form labels", icon: Type }].map(item => <button key={item.key} aria-current={section === item.key ? "page" : undefined} onClick={() => setSection(item.key)}><item.icon className="w-4 h-4 shrink-0" />{item.title}</button>)}</nav><main>
      <div hidden={section !== "categories"}><Categories /></div>
      {Object.entries(query.data.groups).map(([key, group]) => <div key={key} hidden={section !== key}><OptionEditor key={`${key}-${group.revision}`} name={key} group={group} /></div>)}
      <div hidden={section !== "labels"}><LabelEditor key={query.data.labelsRevision} initial={query.data.labels} revision={query.data.labelsRevision} /></div>
    </main></div>}
  </div>;
}
