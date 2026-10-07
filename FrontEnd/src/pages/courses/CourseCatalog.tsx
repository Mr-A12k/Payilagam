import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, BookOpen, Clock, FileText, LayoutGrid, List, Pencil, Plus, Search, Star, X } from "lucide-react";
import { Button, Input, Avatar, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui";
import { WorkspacePage, PageHeader, LoadingState, EmptyState } from "@/components/workspace/Workspace";
import { usePublishedCourses } from "@/hooks";
import { executeHttpGetRequest } from "@/api/commonServices";
import { API_PATHS } from "@/api/constants";
import CatalogResources from "./CatalogResources";
import "./CourseWorkspace.css";
import "./CourseCatalog.css";

interface CatalogCourse {
  courseId: number; uniqueId?: string; courseName: string; courseCode?: string;
  thumbnail?: string; level?: string; duration?: number | null; price?: number | null;
  updatedAt?: string; averageRating?: number | null; mentorId?: number;
  mentor?: { userId: number; fullName?: string; userName?: string; profileUrl?: string };
  category?: { name: string }; _count?: { reviews?: number; enrollments?: number };
}
interface CatalogUser { userId: number; role: string }
interface Category { categoryId: number; name: string; slug: string }
const aliases: Record<string, string> = { web: "web-development", data: "data-science", cloud: "devops", security: "cybersecurity" };
const views = [{ value: "gallery", label: "Gallery", icon: LayoutGrid }, { value: "list", label: "List", icon: List }, { value: "resources", label: "Resources", icon: FileText }] as const;
function priceLabel(price: CatalogCourse["price"]) {
  return price === 0 ? "Free" : price != null ? new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(price) : "View course";
}
function updatedLabel(value?: string) {
  return value && !Number.isNaN(Date.parse(value)) ? new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "Not provided";
}
function canEdit(course: CatalogCourse, user: CatalogUser | null) {
  return user?.role === "admin" || (user?.role === "mentor" && Number(course.mentorId ?? course.mentor?.userId) === Number(user.userId));
}
function CourseTile({ course, user }: { course: CatalogCourse; user: CatalogUser | null }) {
  const id = course.uniqueId || course.courseId;
  const mentor = course.mentor?.fullName || course.mentor?.userName || "Instructor not provided";
  return <article className="catalog-course-tile">
    <div className="catalog-course-media">
      {course.thumbnail && <img src={course.thumbnail} alt="" loading="lazy" onError={event => { event.currentTarget.style.display = "none"; }} />}
      <BookOpen className="catalog-thumbnail-fallback" aria-hidden="true" />
      {canEdit(course, user) && <Button asChild variant="outline" size="icon" className="catalog-edit" title={`Edit ${course.courseName}`}><Link to={`/mentor/course/edit/${id}`} aria-label={`Edit ${course.courseName}`}><Pencil /></Link></Button>}
    </div>
    <div className="catalog-course-body">
      <div className="catalog-course-category"><span>{course.category?.name || "Course"}</span>{course.level && <span className="catalog-level" data-level={course.level.toLowerCase()}>{course.level.toLowerCase()}</span>}</div>
      <h2><Link className="catalog-course-link" to={`/courses/${id}`}>{course.courseName || "Untitled course"}</Link></h2>
      <div className="catalog-instructor"><Avatar src={course.mentor?.profileUrl} fallback={mentor[0]} className="h-5 w-5" /><span>{mentor}</span></div>
      <div className="catalog-course-facts"><span><Star aria-hidden="true" />{course.averageRating != null ? Number(course.averageRating).toFixed(1) : "Not rated"}{course._count?.reviews != null && <small>({course._count.reviews})</small>}</span><span><Clock aria-hidden="true" />{course.duration != null ? `${course.duration} min` : "Duration unavailable"}</span></div>
      <div className="catalog-course-bottom"><strong>{priceLabel(course.price)}</strong><span>{updatedLabel(course.updatedAt)}</span><ArrowRight aria-hidden="true" /></div>
    </div>
  </article>;
}
function CourseList({ courses, user }: { courses: CatalogCourse[]; user: CatalogUser | null }) {
  return <div className="catalog-table-scroll"><table className="catalog-table"><caption className="sr-only">Published courses</caption>
    <thead><tr><th scope="col">Course name</th><th scope="col">Instructor</th><th scope="col">Level</th><th scope="col">Duration</th><th scope="col">Price</th><th scope="col">Updated</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead>
    <tbody>{courses.map(course => <tr key={course.courseId}>
      <td><Link to={`/courses/${course.uniqueId || course.courseId}`} className="catalog-table-course"><BookOpen aria-hidden="true" /><span>{course.courseName}<small>{course.category?.name || course.courseCode}</small></span></Link></td>
      <td>{course.mentor?.fullName || course.mentor?.userName || "Not provided"}</td>
      <td><span className="catalog-level" data-level={course.level?.toLowerCase()}>{course.level || "Not provided"}</span></td>
      <td>{course.duration != null ? `${course.duration} min` : "Not provided"}</td>
      <td>{priceLabel(course.price)}</td><td>{updatedLabel(course.updatedAt)}</td>
      <td>{canEdit(course, user) && <Button asChild variant="ghost" size="icon-sm"><Link to={`/mentor/course/edit/${course.uniqueId || course.courseId}`} aria-label={`Edit ${course.courseName}`} title={`Edit ${course.courseName}`}><Pencil /></Link></Button>}</td>
    </tr>)}</tbody>
  </table></div>;
}
export default function CourseCatalog() {
  const user = useSelector((state: { auth: { user: CatalogUser | null } }) => state.auth.user);
  const [params, setParams] = useSearchParams();
  const urlSearch = params.get("search") || "";
  const rawCategory = params.get("category") || "";
  const category = aliases[rawCategory] || rawCategory || "all";
  const level = ["beginner", "intermediate", "advanced"].includes(params.get("level") || "") ? params.get("level")! : "all";
  const sort = ["oldest", "name"].includes(params.get("sort") || "") ? params.get("sort")! : "latest";
  const view = views.some(item => item.value === params.get("view")) ? params.get("view")! : "gallery";
  const pageValue = Number(params.get("page"));
  const page = Number.isSafeInteger(pageValue) && pageValue > 0 ? pageValue : 1;
  const [search, setSearch] = useState(urlSearch);
  useEffect(() => { setSearch(urlSearch); }, [urlSearch]);
  useEffect(() => {
    if (search.trim() === urlSearch) return;
    const timer = setTimeout(() => setParams(previous => {
      const next = new URLSearchParams(previous);
      search.trim() ? next.set("search", search.trim()) : next.delete("search");
      next.delete("page");
      return next;
    }, { replace: true }), 250);
    return () => clearTimeout(timer);
  }, [search, urlSearch, setParams]);
  const update = (name: string, value: string) => setParams(previous => {
    const next = new URLSearchParams(previous);
    if (value === "all" || value === "latest" || value === "gallery" || (name === "page" && value === "1")) next.delete(name);
    else next.set(name, value);
    if (name !== "page" && name !== "view") next.delete("page");
    return next;
  }, { replace: true });
  const query = usePublishedCourses({ search: urlSearch || undefined, categorySlug: category === "all" ? undefined : category, level: level === "all" ? undefined : level, page, limit: 12, sortBy: sort === "name" ? "courseName" : "createdAt", sortOrder: sort === "latest" ? "desc" : "asc" });
  const courses: CatalogCourse[] = Array.isArray(query.data?.data?.data) ? query.data.data.data : [];
  const pagination = query.data?.data?.pagination;
  const categoriesQuery = useQuery({ queryKey: ["categories"], queryFn: () => executeHttpGetRequest(API_PATHS.CATEGORIES.BASE) });
  const categories: Category[] = Array.isArray(categoriesQuery.data?.data?.data) ? categoriesQuery.data.data.data : [];
  const filtered = !!urlSearch || category !== "all" || level !== "all";
  const reset = () => {
    setSearch("");
    setParams(previous => { const next = new URLSearchParams(previous); ["search", "category", "level", "page"].forEach(key => next.delete(key)); return next; }, { replace: true });
  };
  const total = pagination?.total ?? courses.length;
  return <WorkspacePage className={`course-catalog-redesign${view === "list" ? " catalog-list-workspace" : ""}`}>
    <PageHeader title="Courses" description="Your learning workspace" actions={<><Button asChild variant="ghost" size="sm"><Link to="/labs"><BookOpen />Practice labs</Link></Button>{(user?.role === "admin" || user?.role === "mentor") && <Button asChild size="sm"><Link to="/mentor/course/create"><Plus />Create course</Link></Button>}</>} />
    <div className="catalog-view-bar" role="tablist" aria-label="Course views">
      {views.map((item, index) => <button key={item.value} type="button" role="tab" id={`catalog-tab-${item.value}`} aria-controls="catalog-view-panel" aria-selected={view === item.value} tabIndex={view === item.value ? 0 : -1} onClick={() => update("view", item.value)} onKeyDown={event => {
        const nextIndex = event.key === "ArrowRight" ? (index + 1) % views.length : event.key === "ArrowLeft" ? (index + views.length - 1) % views.length : event.key === "Home" ? 0 : event.key === "End" ? views.length - 1 : null;
        if (nextIndex !== null) { event.preventDefault(); update("view", views[nextIndex].value); document.getElementById(`catalog-tab-${views[nextIndex].value}`)?.focus(); }
      }}><item.icon aria-hidden="true" />{item.label}</button>)}
    </div>
    <section id="catalog-view-panel" role="tabpanel" aria-labelledby={`catalog-tab-${view}`} tabIndex={0} className="catalog-discovery">
      {view === "resources" ? <CatalogResources /> : <>
      <div className="catalog-toolbar">
        <div className="catalog-search"><Search aria-hidden="true" /><Input type="search" aria-label="Search course catalog" placeholder="Search courses..." value={search} onChange={event => setSearch(event.target.value)} />{search && <button type="button" onClick={() => setSearch("")} aria-label="Clear course search" title="Clear course search"><X /></button>}</div>
        <Select value={category} onValueChange={(value: string) => update("category", value)} disabled={categoriesQuery.isLoading || categoriesQuery.isError}><SelectTrigger aria-label="Category"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All categories</SelectItem>{category !== "all" && !categories.some(item => item.slug === category) && <SelectItem value={category}>{category}</SelectItem>}{categories.map(item => <SelectItem key={item.categoryId} value={item.slug}>{item.name}</SelectItem>)}</SelectContent></Select>
        <Select value={level} onValueChange={(value: string) => update("level", value)}><SelectTrigger aria-label="Level"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All levels</SelectItem><SelectItem value="beginner">Beginner</SelectItem><SelectItem value="intermediate">Intermediate</SelectItem><SelectItem value="advanced">Advanced</SelectItem></SelectContent></Select>
        <Select value={sort} onValueChange={(value: string) => update("sort", value)}><SelectTrigger aria-label="Sort courses"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="latest">Newest first</SelectItem><SelectItem value="oldest">Oldest first</SelectItem><SelectItem value="name">Course name</SelectItem></SelectContent></Select>
      </div>
      {categoriesQuery.isError && <div role="alert" className="catalog-filter-error">Categories unavailable.<Button variant="ghost" size="sm" onClick={() => categoriesQuery.refetch()}>Retry</Button></div>}
      <div className="catalog-results-heading"><div className="catalog-results-label"><span className="catalog-collection-mark" aria-hidden="true" /><h2>{filtered ? "Search results" : "All courses"}</h2><span role="status">{query.isLoading ? "Loading..." : query.isError ? "Unavailable" : total.toLocaleString()}</span></div>{filtered && <Button variant="ghost" size="sm" onClick={reset}>Clear filters<X /></Button>}</div>
      {query.isLoading ? <LoadingState label="Loading courses..." /> : query.isError ? <div role="alert" className="course-error"><p>Courses could not be loaded.</p><Button variant="outline" onClick={() => query.refetch()}>Retry</Button></div> : !courses.length ? <EmptyState title={filtered ? "No matching courses" : "No published courses yet"} description={filtered ? "Try a different search, category or level." : undefined} action={filtered ? <Button variant="outline" onClick={reset}>Clear filters</Button> : undefined} /> : view === "list" ? <CourseList courses={courses} user={user} /> : <div className="catalog-course-grid">{courses.map(course => <CourseTile key={course.courseId} course={course} user={user} />)}</div>}
      {pagination && total > 0 && !query.isError && <nav className="catalog-pagination" aria-label="Course pages"><span>Showing {(page - 1) * 12 + 1}-{Math.min(page * 12, total)} of {total}</span><div><Button variant="outline" size="icon-sm" aria-label="Previous course page" title="Previous course page" disabled={page <= 1 || query.isFetching} onClick={() => update("page", String(page - 1))}><ArrowLeft /></Button><span>Page {page} of {Math.max(1, pagination.totalPages)}</span><Button variant="outline" size="icon-sm" aria-label="Next course page" title="Next course page" disabled={page >= pagination.totalPages || query.isFetching} onClick={() => update("page", String(page + 1))}><ArrowRight /></Button></div></nav>}
      </>}
    </section>
  </WorkspacePage>;
}
