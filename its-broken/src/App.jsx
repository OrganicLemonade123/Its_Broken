import { useState, useEffect, useRef } from "react";

const DEFAULT_TOOL_CATEGORIES = ["Power Tools", "Hand Tools", "Electrical", "Plumbing", "Safety Gear", "Lifting & Rigging", "Test Equipment", "Other"];
const DEFAULT_MATERIAL_CATEGORIES = ["Lumber & Sheet Goods", "Fasteners", "Plumbing Supplies", "Electrical Supplies", "Paint & Finishes", "Concrete & Masonry", "Adhesives & Sealants", "Other"];
const DEFAULT_LOCATIONS = ["Job Site A", "Job Site B", "Shop / Warehouse", "Van", "Loaned Out", "Unknown"];

const STATUS = {
  good: { label: "Good", color: "#22c55e", bg: "#052e16" },
  needs_repair: { label: "Needs Repair", color: "#f97316", bg: "#431407" },
  broken: { label: "Broken", color: "#ef4444", bg: "#450a0a" },
  retired: { label: "Retired", color: "#6b7280", bg: "#111827" },
};

const REPAIR_STATUS = {
  open: { label: "Open", color: "#f97316", bg: "#431407" },
  in_progress: { label: "In Progress", color: "#3b82f6", bg: "#1e3a5f" },
  waiting_parts: { label: "Waiting on Parts", color: "#a855f7", bg: "#2e1065" },
  fixed: { label: "Fixed", color: "#22c55e", bg: "#052e16" },
  cant_fix: { label: "Can't Fix", color: "#6b7280", bg: "#111827" },
};

const REPAIR_PRIORITY = {
  low: { label: "Low", color: "#6b7280" },
  medium: { label: "Medium", color: "#f97316" },
  high: { label: "High", color: "#ef4444" },
  emergency: { label: "Emergency", color: "#ff0000" },
};

const sampleTools = [
  { id: 1, name: "Milwaukee M18 Drill", category: "Power Tools", location: "Van", status: "good", notes: "Battery charged, ready to go", photo: null, added: "2025-01-10" },
  { id: 2, name: "Fluke 87V Multimeter", category: "Test Equipment", location: "Shop / Warehouse", status: "needs_repair", notes: "Display flickering on DC voltage mode", photo: null, added: "2025-02-03" },
  { id: 3, name: "6ft Step Ladder", category: "Other", location: "Job Site A", status: "broken", notes: "Top rung cracked — DO NOT USE", photo: null, added: "2024-11-20" },
];

const EMPTY_ITEM_FORM = { name: "", category: "", location: "", status: "good", notes: "", photo: null };
const EMPTY_REPAIR_FORM = { problem: "", description: "", category: "", location: "", priority: "medium", status: "open", dueDate: "", jobId: null, photos: [], partsNeeded: "", estimatedCost: "", actualCost: "", notes: "" };

const JOB_STATUS = {
  quoted:      { label: "Quoted",      color: "#6b7280", bg: "#111827" },
  scheduled:   { label: "Scheduled",   color: "#a855f7", bg: "#2e1065" },
  in_progress: { label: "In Progress", color: "#3b82f6", bg: "#1e3a5f" },
  complete:    { label: "Complete",    color: "#22c55e", bg: "#052e16" },
  invoiced:    { label: "Invoiced",    color: "#f97316", bg: "#431407" },
};

const EMPTY_JOB_FORM = { title: "", client: "", phone: "", address: "", status: "scheduled", dateScheduled: "", dateCompleted: "", estimatedCost: "", actualCost: "", photos: [], notes: "" };

export default function InventoryApp() {
  // --- Section ---
  const [section, setSection] = useState("jobs"); // "jobs" | "tools" | "materials" | "repairs"

  // --- Shared state ---
  const [locations, setLocations] = useState(() => {
    try { const s = localStorage.getItem("itsBroken_locations"); return s ? JSON.parse(s) : DEFAULT_LOCATIONS; } catch { return DEFAULT_LOCATIONS; }
  });

  // --- Tools state ---
  const [tools, setTools] = useState(() => {
    try { const s = localStorage.getItem("itsBroken_tools"); return s ? JSON.parse(s) : sampleTools; } catch { return sampleTools; }
  });
  const [toolCategories, setToolCategories] = useState(() => {
    try { const s = localStorage.getItem("itsBroken_toolCategories"); return s ? JSON.parse(s) : DEFAULT_TOOL_CATEGORIES; } catch { return DEFAULT_TOOL_CATEGORIES; }
  });
  const [toolView, setToolView] = useState("list");
  const [selectedTool, setSelectedTool] = useState(null);
  const [toolFilter, setToolFilter] = useState("all");
  const [toolSearch, setToolSearch] = useState("");
  const [toolForm, setToolForm] = useState({ ...EMPTY_ITEM_FORM, category: DEFAULT_TOOL_CATEGORIES[0] });
  const [toolEditMode, setToolEditMode] = useState(false);
  const [newToolCategory, setNewToolCategory] = useState("");
  const [showAddToolCategory, setShowAddToolCategory] = useState(false);
  const [newToolLocation, setNewToolLocation] = useState("");
  const [showAddToolLocation, setShowAddToolLocation] = useState(false);
  const toolFileRef = useRef();

  // --- Materials state ---
  const [materials, setMaterials] = useState(() => {
    try { const s = localStorage.getItem("itsBroken_materials"); return s ? JSON.parse(s) : []; } catch { return []; }
  });
  const [materialCategories, setMaterialCategories] = useState(() => {
    try { const s = localStorage.getItem("itsBroken_materialCategories"); return s ? JSON.parse(s) : DEFAULT_MATERIAL_CATEGORIES; } catch { return DEFAULT_MATERIAL_CATEGORIES; }
  });
  const [materialView, setMaterialView] = useState("list");
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [materialFilter, setMaterialFilter] = useState("all");
  const [materialSearch, setMaterialSearch] = useState("");
  const [materialForm, setMaterialForm] = useState({ ...EMPTY_ITEM_FORM, category: DEFAULT_MATERIAL_CATEGORIES[0] });
  const [materialEditMode, setMaterialEditMode] = useState(false);
  const [newMaterialCategory, setNewMaterialCategory] = useState("");
  const [showAddMaterialCategory, setShowAddMaterialCategory] = useState(false);
  const [newMaterialLocation, setNewMaterialLocation] = useState("");
  const [showAddMaterialLocation, setShowAddMaterialLocation] = useState(false);
  const materialFileRef = useRef();

  // --- Jobs state ---
  const [jobs, setJobs] = useState(() => {
    try { const s = localStorage.getItem("itsBroken_jobs"); return s ? JSON.parse(s) : []; } catch { return []; }
  });
  const [jobView, setJobView] = useState("list");
  const [selectedJob, setSelectedJob] = useState(null);
  const [jobFilter, setJobFilter] = useState("all");
  const [jobSearch, setJobSearch] = useState("");
  const [jobForm, setJobForm] = useState(EMPTY_JOB_FORM);
  const [jobEditMode, setJobEditMode] = useState(false);
  const jobFileRef = useRef();

  // --- Repairs state ---
  const [repairs, setRepairs] = useState(() => {
    try { const s = localStorage.getItem("itsBroken_repairs"); return s ? JSON.parse(s) : []; } catch { return []; }
  });
  const [repairView, setRepairView] = useState("list");
  const [selectedRepair, setSelectedRepair] = useState(null);
  const [repairFilter, setRepairFilter] = useState("all");
  const [repairSearch, setRepairSearch] = useState("");
  const [repairForm, setRepairForm] = useState(EMPTY_REPAIR_FORM);
  const [repairEditMode, setRepairEditMode] = useState(false);
  const repairFileRef = useRef();

  // --- Persistence ---
  useEffect(() => { localStorage.setItem("itsBroken_locations", JSON.stringify(locations)); }, [locations]);
  useEffect(() => { localStorage.setItem("itsBroken_tools", JSON.stringify(tools)); }, [tools]);
  useEffect(() => { localStorage.setItem("itsBroken_toolCategories", JSON.stringify(toolCategories)); }, [toolCategories]);
  useEffect(() => { localStorage.setItem("itsBroken_materials", JSON.stringify(materials)); }, [materials]);
  useEffect(() => { localStorage.setItem("itsBroken_materialCategories", JSON.stringify(materialCategories)); }, [materialCategories]);
  useEffect(() => { localStorage.setItem("itsBroken_jobs", JSON.stringify(jobs)); }, [jobs]);
  useEffect(() => { localStorage.setItem("itsBroken_repairs", JSON.stringify(repairs)); }, [repairs]);

  // ============================================================
  // GENERIC ITEM HANDLERS (used by both tools and materials)
  // ============================================================

  const makeItemHandlers = (_items, setItems, form, setForm, categories, setCategories, setView, editMode, setEditMode, selected, setSelected, newCat, setNewCat, _showAddCat, setShowAddCat, newLoc, setNewLoc, _showAddLoc, setShowAddLoc, defaultCategory, _fileRef) => ({
    addCategory: () => {
      const t = newCat.trim();
      if (!t || categories.includes(t)) return;
      setCategories(prev => [...prev, t]);
      setForm(f => ({ ...f, category: t }));
      setNewCat(""); setShowAddCat(false);
    },
    deleteCategory: (cat) => {
      if (categories.length <= 1) return;
      setCategories(prev => prev.filter(c => c !== cat));
      if (form.category === cat) setForm(f => ({ ...f, category: categories.filter(c => c !== cat)[0] }));
    },
    addLocation: () => {
      const t = newLoc.trim();
      if (!t || locations.includes(t)) return;
      setLocations(prev => [...prev, t]);
      setForm(f => ({ ...f, location: t }));
      setNewLoc(""); setShowAddLoc(false);
    },
    deleteLocation: (loc) => {
      if (locations.length <= 1) return;
      setLocations(prev => prev.filter(l => l !== loc));
      if (form.location === loc) setForm(f => ({ ...f, location: locations.filter(l => l !== loc)[0] }));
    },
    handlePhoto: (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => setForm(f => ({ ...f, photo: ev.target.result }));
      reader.readAsDataURL(file);
    },
    saveItem: () => {
      if (!form.name.trim()) return;
      if (editMode && selected) {
        setItems(prev => prev.map(i => i.id === selected.id ? { ...i, ...form } : i));
        setSelected(prev => ({ ...prev, ...form }));
        setView("detail");
      } else {
        setItems(prev => [{ ...form, id: Date.now(), added: new Date().toISOString().split("T")[0] }, ...prev]);
        setView("list");
      }
      setEditMode(false);
    },
    deleteItem: (id) => { setItems(prev => prev.filter(i => i.id !== id)); setView("list"); },
    openAdd: () => {
      setForm({ name: "", category: categories[0] || defaultCategory, location: locations[0] || "", status: "good", notes: "", photo: null });
      setEditMode(false); setShowAddCat(false); setNewCat(""); setShowAddLoc(false); setNewLoc("");
      setView("add");
    },
    openEdit: (item) => {
      setForm({ name: item.name, category: item.category, location: item.location, status: item.status, notes: item.notes, photo: item.photo });
      setEditMode(true); setView("add");
    },
  });

  const toolH = makeItemHandlers(tools, setTools, toolForm, setToolForm, toolCategories, setToolCategories, setToolView, toolEditMode, setToolEditMode, selectedTool, setSelectedTool, newToolCategory, setNewToolCategory, showAddToolCategory, setShowAddToolCategory, newToolLocation, setNewToolLocation, showAddToolLocation, setShowAddToolLocation, DEFAULT_TOOL_CATEGORIES[0], toolFileRef);

  const matH = makeItemHandlers(materials, setMaterials, materialForm, setMaterialForm, materialCategories, setMaterialCategories, setMaterialView, materialEditMode, setMaterialEditMode, selectedMaterial, setSelectedMaterial, newMaterialCategory, setNewMaterialCategory, showAddMaterialCategory, setShowAddMaterialCategory, newMaterialLocation, setNewMaterialLocation, showAddMaterialLocation, setShowAddMaterialLocation, DEFAULT_MATERIAL_CATEGORIES[0], materialFileRef);

  // --- Job handlers ---
  const handleJobPhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setJobForm(f => ({ ...f, photos: [...f.photos, ev.target.result] }));
    reader.readAsDataURL(file);
    e.target.value = "";
  };
  const removeJobPhoto = (idx) => setJobForm(f => ({ ...f, photos: f.photos.filter((_, i) => i !== idx) }));
  const saveJob = () => {
    const today = new Date().toISOString().split("T")[0];
    if (jobEditMode && selectedJob) {
      const updated = { ...selectedJob, ...jobForm };
      if (jobForm.status === "complete" && !selectedJob.dateCompleted) updated.dateCompleted = today;
      setJobs(prev => prev.map(j => j.id === selectedJob.id ? updated : j));
      setSelectedJob(updated); setJobView("detail");
    } else {
      setJobs(prev => [{ ...jobForm, id: Date.now(), dateCreated: today }, ...prev]);
      setJobView("list");
    }
    setJobEditMode(false);
  };
  const deleteJob = (id) => { setJobs(prev => prev.filter(j => j.id !== id)); setJobView("list"); };
  const openAddJob = () => { setJobForm(EMPTY_JOB_FORM); setJobEditMode(false); setJobView("add"); };
  const openEditJob = (job) => {
    setJobForm({ title: job.title, client: job.client, phone: job.phone, address: job.address, status: job.status, dateScheduled: job.dateScheduled, dateCompleted: job.dateCompleted, estimatedCost: job.estimatedCost, actualCost: job.actualCost, photos: job.photos || [], notes: job.notes });
    setJobEditMode(true); setJobView("add");
  };

  // --- Repair handlers ---
  const handleRepairPhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setRepairForm(f => ({ ...f, photos: [...f.photos, ev.target.result] }));
    reader.readAsDataURL(file);
    e.target.value = "";
  };
  const removeRepairPhoto = (idx) => setRepairForm(f => ({ ...f, photos: f.photos.filter((_, i) => i !== idx) }));
  const saveRepair = () => {
    const today = new Date().toISOString().split("T")[0];
    if (repairEditMode && selectedRepair) {
      const updated = { ...selectedRepair, ...repairForm };
      if ((repairForm.status === "fixed" || repairForm.status === "cant_fix") && !selectedRepair.dateClosed) updated.dateClosed = today;
      setRepairs(prev => prev.map(r => r.id === selectedRepair.id ? updated : r));
      setSelectedRepair(updated); setRepairView("detail");
    } else {
      setRepairs(prev => [{ ...repairForm, id: Date.now(), dateOpened: today, dateClosed: null }, ...prev]);
      setRepairView("list");
    }
    setRepairEditMode(false);
  };
  const deleteRepair = (id) => { setRepairs(prev => prev.filter(r => r.id !== id)); setRepairView("list"); };
  const openAddRepair = () => { setRepairForm(EMPTY_REPAIR_FORM); setRepairEditMode(false); setRepairView("add"); };
  const openEditRepair = (repair) => {
    setRepairForm({ problem: repair.problem, description: repair.description, category: repair.category, location: repair.location, priority: repair.priority, status: repair.status, dueDate: repair.dueDate || "", jobId: repair.jobId || null, photos: repair.photos || [], partsNeeded: repair.partsNeeded, estimatedCost: repair.estimatedCost, actualCost: repair.actualCost, notes: repair.notes });
    setRepairEditMode(true); setRepairView("add");
  };

  // --- Derived ---
  const filterItems = (items, filter, search) => items.filter(i => {
    const matchFilter = filter === "all" || i.status === filter;
    const matchSearch = i.name.toLowerCase().includes(search.toLowerCase()) || i.category.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const itemCounts = (items) => ({
    all: items.length,
    good: items.filter(i => i.status === "good").length,
    needs_repair: items.filter(i => i.status === "needs_repair").length,
    broken: items.filter(i => i.status === "broken").length,
  });

  const filteredTools = filterItems(tools, toolFilter, toolSearch);
  const toolCounts = itemCounts(tools);
  const filteredMaterials = filterItems(materials, materialFilter, materialSearch);
  const materialCounts = itemCounts(materials);

  const filteredJobs = jobs.filter(j => {
    const matchFilter = jobFilter === "all" || j.status === jobFilter;
    const matchSearch = !jobSearch || (j.title || "").toLowerCase().includes(jobSearch.toLowerCase()) || (j.client || "").toLowerCase().includes(jobSearch.toLowerCase());
    return matchFilter && matchSearch;
  });
  const jobCounts = {
    all: jobs.length,
    scheduled: jobs.filter(j => j.status === "scheduled").length,
    in_progress: jobs.filter(j => j.status === "in_progress").length,
    complete: jobs.filter(j => j.status === "complete").length,
  };

  const filteredRepairs = repairs.filter(r => {
    const matchFilter = repairFilter === "all" || r.status === repairFilter;
    const matchSearch = !repairSearch || (r.problem || "").toLowerCase().includes(repairSearch.toLowerCase()) || (r.category || "").toLowerCase().includes(repairSearch.toLowerCase());
    return matchFilter && matchSearch;
  });
  const repairCounts = {
    all: repairs.length,
    open: repairs.filter(r => r.status === "open").length,
    in_progress: repairs.filter(r => r.status === "in_progress").length,
    fixed: repairs.filter(r => r.status === "fixed").length,
  };

  const showFab = (section === "jobs" && jobView === "list") || (section === "tools" && toolView === "list") || (section === "materials" && materialView === "list") || (section === "repairs" && repairView === "list");

  // --- Styles ---
  const st = {
    app: { fontFamily: "'DM Mono', 'Courier New', monospace", background: "#0a0a0a", minHeight: "100vh", color: "#e5e5e5", maxWidth: 480, margin: "0 auto", position: "relative", paddingBottom: 140 },
    header: { padding: "20px 16px 12px", borderBottom: "1px solid #1f1f1f", position: "sticky", top: 0, background: "#0a0a0a", zIndex: 10 },
    logo: { fontSize: 11, letterSpacing: "0.25em", color: "#f97316", textTransform: "uppercase", marginBottom: 4 },
    title: { fontSize: 22, fontWeight: 700, color: "#f5f5f5", letterSpacing: "-0.02em" },
    searchBar: { margin: "12px 0 0", background: "#111", border: "1px solid #222", borderRadius: 6, padding: "8px 12px", color: "#e5e5e5", width: "100%", fontSize: 13, boxSizing: "border-box", outline: "none" },
    filterRow: { display: "flex", gap: 6, padding: "10px 16px", overflowX: "auto", borderBottom: "1px solid #1a1a1a" },
    filterBtn: (active) => ({ padding: "5px 12px", borderRadius: 20, border: "1px solid", fontSize: 11, letterSpacing: "0.08em", cursor: "pointer", whiteSpace: "nowrap", fontFamily: "inherit", fontWeight: active ? 700 : 400, background: active ? "#f97316" : "transparent", borderColor: active ? "#f97316" : "#333", color: active ? "#000" : "#999", transition: "all 0.15s" }),
    list: { padding: "12px 16px", display: "flex", flexDirection: "column", gap: 10 },
    card: { background: "#111", borderRadius: 10, border: "1px solid #1e1e1e", overflow: "hidden", cursor: "pointer" },
    cardTop: (color) => ({ borderLeft: `3px solid ${color}`, padding: "12px 14px" }),
    cardName: { fontSize: 15, fontWeight: 600, color: "#f5f5f5", marginBottom: 4 },
    cardMeta: { display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" },
    tag: { fontSize: 10, letterSpacing: "0.1em", padding: "2px 7px", borderRadius: 4, background: "#1a1a1a", color: "#999", textTransform: "uppercase" },
    badge: (color, bg) => ({ fontSize: 10, letterSpacing: "0.1em", padding: "2px 7px", borderRadius: 4, background: bg, color, textTransform: "uppercase", fontWeight: 700, border: `1px solid ${color}33` }),
    fab: { position: "fixed", bottom: 76, right: "calc(50% - 220px)", width: 52, height: 52, borderRadius: 14, background: "#f97316", border: "none", color: "#000", fontSize: 26, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, boxShadow: "0 4px 20px #f9731640", zIndex: 20 },
    bottomNav: { position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, background: "#0f0f0f", borderTop: "1px solid #1f1f1f", display: "flex", zIndex: 30, height: 60 },
    navBtn: (active) => ({ flex: 1, background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3, color: active ? "#f97316" : "#444", fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "inherit", transition: "color 0.15s" }),
    detailHeader: { padding: "16px 16px 0", display: "flex", alignItems: "center", gap: 12 },
    backBtn: { background: "none", border: "1px solid #333", borderRadius: 8, padding: "6px 12px", color: "#999", fontSize: 12, cursor: "pointer", fontFamily: "inherit" },
    photoBox: { margin: "16px 16px 0", borderRadius: 10, overflow: "hidden", background: "#111", border: "1px solid #1e1e1e", height: 200, display: "flex", alignItems: "center", justifyContent: "center", color: "#444", fontSize: 12 },
    detailBody: { padding: "16px" },
    detailName: { fontSize: 22, fontWeight: 700, color: "#f5f5f5", letterSpacing: "-0.02em", marginBottom: 12 },
    detailRow: { display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #1a1a1a", fontSize: 13 },
    detailLabel: { color: "#555", textTransform: "uppercase", letterSpacing: "0.1em", fontSize: 11 },
    detailValue: { color: "#e5e5e5", textAlign: "right" },
    notesBox: { background: "#111", border: "1px solid #1e1e1e", borderRadius: 8, padding: 12, marginTop: 14, fontSize: 13, color: "#aaa", lineHeight: 1.6 },
    actionRow: { display: "flex", gap: 8, marginTop: 16 },
    btnPrimary: { flex: 1, padding: "11px", background: "#f97316", border: "none", borderRadius: 8, color: "#000", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" },
    btnDanger: { padding: "11px 14px", background: "transparent", border: "1px solid #ef444444", borderRadius: 8, color: "#ef4444", fontSize: 13, cursor: "pointer", fontFamily: "inherit" },
    statusRow: { display: "flex", gap: 6, marginTop: 14, flexWrap: "wrap" },
    statusBtn: (color, bg, active) => ({ padding: "6px 10px", borderRadius: 6, border: `1px solid ${color}55`, background: active ? bg : "transparent", color: active ? color : "#555", fontSize: 10, letterSpacing: "0.08em", cursor: "pointer", fontFamily: "inherit", fontWeight: active ? 700 : 400 }),
    formWrap: { padding: 16 },
    formGroup: { marginBottom: 14 },
    formLabel: { fontSize: 10, letterSpacing: "0.15em", color: "#555", textTransform: "uppercase", marginBottom: 5, display: "block" },
    formInput: { width: "100%", background: "#111", border: "1px solid #222", borderRadius: 8, padding: "10px 12px", color: "#e5e5e5", fontSize: 14, fontFamily: "inherit", boxSizing: "border-box", outline: "none" },
    formSelect: { width: "100%", background: "#111", border: "1px solid #222", borderRadius: 8, padding: "10px 12px", color: "#e5e5e5", fontSize: 14, fontFamily: "inherit", boxSizing: "border-box", outline: "none", appearance: "none" },
    photoUpload: { background: "#111", border: "2px dashed #222", borderRadius: 8, padding: "20px", color: "#555", fontSize: 12, textAlign: "center", cursor: "pointer", boxSizing: "border-box" },
    emptyState: { textAlign: "center", padding: "60px 20px", color: "#444" },
    emptyIcon: { fontSize: 40, marginBottom: 12 },
  };

  // ============================================================
  // SHARED ITEM RENDER FUNCTIONS
  // ============================================================

  const renderItemDetail = (item, _allItems, setItems, setView, openEdit) => (
    <>
      <div style={st.detailHeader}>
        <button style={st.backBtn} onClick={() => setView("list")}>← Back</button>
        <span style={{ fontSize: 11, color: "#444", letterSpacing: "0.1em" }}>DETAIL</span>
      </div>
      <div style={st.photoBox}>
        {item.photo ? <img src={item.photo} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span>📷 No photo</span>}
      </div>
      <div style={st.detailBody}>
        <div style={st.detailName}>{item.name}</div>
        <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
          <span style={st.badge(STATUS[item.status].color, STATUS[item.status].bg)}>{STATUS[item.status].label}</span>
          <span style={st.tag}>{item.category}</span>
          <span style={st.tag}>📍 {item.location}</span>
        </div>
        <div style={{ fontSize: 11, color: "#444", marginBottom: 12, letterSpacing: "0.1em" }}>QUICK STATUS CHANGE</div>
        <div style={st.statusRow}>
          {Object.entries(STATUS).map(([k, v]) => (
            <button key={k} style={st.statusBtn(v.color, v.bg, item.status === k)}
              onClick={() => setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: k } : i))}>
              {v.label}
            </button>
          ))}
        </div>
        {item.notes && (
          <>
            <div style={{ fontSize: 11, color: "#444", marginTop: 16, marginBottom: 6, letterSpacing: "0.1em" }}>NOTES</div>
            <div style={st.notesBox}>{item.notes}</div>
          </>
        )}
        <div style={{ fontSize: 11, color: "#333", marginTop: 16 }}>Added {item.added}</div>
        <div style={st.actionRow}>
          <button style={st.btnPrimary} onClick={() => openEdit(item)}>Edit</button>
          <button style={st.btnDanger} onClick={() => { setItems(prev => prev.filter(i => i.id !== item.id)); setView("list"); }}>Delete</button>
        </div>
      </div>
    </>
  );

  const renderItemForm = (form, setForm, editMode, setView, setEditMode, saveItem, categories, _setCategories, newCat, setNewCat, showAddCat, setShowAddCat, addCategory, deleteCategory, newLoc, setNewLoc, showAddLoc, setShowAddLoc, addLocation, deleteLocation, handlePhoto, fileRef, label) => (
    <>
      <div style={st.detailHeader}>
        <button style={st.backBtn} onClick={() => { setView(editMode ? "detail" : "list"); setEditMode(false); }}>← Back</button>
        <span style={{ fontSize: 11, color: "#444", letterSpacing: "0.1em" }}>{editMode ? `EDIT ${label}` : `ADD ${label}`}</span>
      </div>
      <div style={st.formWrap}>
        <div style={st.formGroup}>
          <label style={st.formLabel}>Name *</label>
          <input style={st.formInput} placeholder={label === "TOOL" ? "e.g. Milwaukee M18 Drill" : "e.g. 2x4 Framing Lumber"} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
        </div>
        <div style={st.formGroup}>
          <label style={st.formLabel}>Category</label>
          <select style={st.formSelect} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
            {categories.map(c => <option key={c}>{c}</option>)}
          </select>
          <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
            {!showAddCat ? (
              <button style={{ background: "none", border: "1px dashed #333", borderRadius: 6, padding: "6px 10px", color: "#555", fontSize: 11, cursor: "pointer", fontFamily: "inherit", textAlign: "left", letterSpacing: "0.08em" }} onClick={() => setShowAddCat(true)}>
                + Add new category
              </button>
            ) : (
              <div style={{ display: "flex", gap: 6 }}>
                <input style={{ ...st.formInput, flex: 1, padding: "7px 10px", fontSize: 13 }} placeholder="New category name..." value={newCat} onChange={e => setNewCat(e.target.value)} onKeyDown={e => e.key === "Enter" && addCategory()} autoFocus />
                <button style={{ ...st.btnPrimary, flex: "none", padding: "7px 12px" }} onClick={addCategory}>Add</button>
                <button style={{ background: "none", border: "1px solid #333", borderRadius: 8, padding: "7px 10px", color: "#666", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }} onClick={() => { setShowAddCat(false); setNewCat(""); }}>✕</button>
              </div>
            )}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 2 }}>
              {categories.map(cat => (
                <div key={cat} style={{ display: "flex", alignItems: "center", gap: 3, background: form.category === cat ? "#1a1a1a" : "transparent", border: `1px solid ${form.category === cat ? "#333" : "#1a1a1a"}`, borderRadius: 5, padding: "3px 6px" }}>
                  <span style={{ fontSize: 10, color: form.category === cat ? "#ccc" : "#444" }}>{cat}</span>
                  {categories.length > 1 && <button onClick={() => deleteCategory(cat)} style={{ background: "none", border: "none", color: "#ef444466", fontSize: 10, cursor: "pointer", padding: "0 1px", lineHeight: 1, fontFamily: "inherit" }}>✕</button>}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={st.formGroup}>
          <label style={st.formLabel}>Location</label>
          <select style={st.formSelect} value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))}>
            {locations.map(l => <option key={l}>{l}</option>)}
          </select>
          <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
            {!showAddLoc ? (
              <button style={{ background: "none", border: "1px dashed #333", borderRadius: 6, padding: "6px 10px", color: "#555", fontSize: 11, cursor: "pointer", fontFamily: "inherit", textAlign: "left", letterSpacing: "0.08em" }} onClick={() => setShowAddLoc(true)}>
                + Add new location
              </button>
            ) : (
              <div style={{ display: "flex", gap: 6 }}>
                <input style={{ ...st.formInput, flex: 1, padding: "7px 10px", fontSize: 13 }} placeholder="New location name..." value={newLoc} onChange={e => setNewLoc(e.target.value)} onKeyDown={e => e.key === "Enter" && addLocation()} autoFocus />
                <button style={{ ...st.btnPrimary, flex: "none", padding: "7px 12px" }} onClick={addLocation}>Add</button>
                <button style={{ background: "none", border: "1px solid #333", borderRadius: 8, padding: "7px 10px", color: "#666", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }} onClick={() => { setShowAddLoc(false); setNewLoc(""); }}>✕</button>
              </div>
            )}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 2 }}>
              {locations.map(loc => (
                <div key={loc} style={{ display: "flex", alignItems: "center", gap: 3, background: form.location === loc ? "#1a1a1a" : "transparent", border: `1px solid ${form.location === loc ? "#333" : "#1a1a1a"}`, borderRadius: 5, padding: "3px 6px" }}>
                  <span style={{ fontSize: 10, color: form.location === loc ? "#ccc" : "#444" }}>{loc}</span>
                  {locations.length > 1 && <button onClick={() => deleteLocation(loc)} style={{ background: "none", border: "none", color: "#ef444466", fontSize: 10, cursor: "pointer", padding: "0 1px", lineHeight: 1, fontFamily: "inherit" }}>✕</button>}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={st.formGroup}>
          <label style={st.formLabel}>Status</label>
          <select style={st.formSelect} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
            {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>
        <div style={st.formGroup}>
          <label style={st.formLabel}>Notes</label>
          <textarea style={{ ...st.formInput, minHeight: 80, resize: "vertical" }} placeholder="Any notes..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
        </div>
        <div style={st.formGroup}>
          <label style={st.formLabel}>Photo</label>
          <div style={st.photoUpload} onClick={() => fileRef.current.click()}>
            {form.photo ? <img src={form.photo} alt="preview" style={{ width: "100%", borderRadius: 8, maxHeight: 160, objectFit: "cover", marginTop: 8 }} /> : <>📷 Tap to upload a photo</>}
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handlePhoto} />
        </div>
        <button style={{ ...st.btnPrimary, width: "100%", marginTop: 8 }} onClick={saveItem}>
          {editMode ? "Save Changes" : `Add ${label === "TOOL" ? "to Tools" : "to Materials"}`}
        </button>
      </div>
    </>
  );

  const renderItemList = (filteredItems, allCounts, filter, setFilter, search, setSearch, setView, setSelected, logoIcon, titleText, emptyIcon, emptyText) => (
    <>
      <div style={st.header}>
        <div style={st.logo}>{logoIcon} It's Broken!</div>
        <div style={st.title}>{titleText}</div>
        <input style={st.searchBar} placeholder={`Search ${titleText.toLowerCase()}...`} value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <div style={st.filterRow}>
        {[["all", "All"], ["good", "Good"], ["needs_repair", "Needs Repair"], ["broken", "Broken"]].map(([key, label]) => (
          <button key={key} style={st.filterBtn(filter === key)} onClick={() => setFilter(key)}>
            {label} <span style={{ opacity: 0.6 }}>({allCounts[key] ?? 0})</span>
          </button>
        ))}
      </div>
      <div style={st.list}>
        {filteredItems.length === 0 ? (
          <div style={st.emptyState}>
            <div style={st.emptyIcon}>{emptyIcon}</div>
            <div>{emptyText}</div>
          </div>
        ) : filteredItems.map(item => (
          <div key={item.id} style={st.card} onClick={() => { setSelected(item); setView("detail"); }}>
            <div style={st.cardTop(STATUS[item.status].color)}>
              <div style={st.cardName}>{item.name}</div>
              <div style={st.cardMeta}>
                <span style={st.badge(STATUS[item.status].color, STATUS[item.status].bg)}>{STATUS[item.status].label}</span>
                <span style={st.tag}>{item.category}</span>
                <span style={st.tag}>📍 {item.location}</span>
              </div>
              {item.notes && <div style={{ fontSize: 12, color: "#555", marginTop: 6, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.notes}</div>}
            </div>
          </div>
        ))}
      </div>
    </>
  );

  // ============================================================
  // REPAIR VIEWS
  // ============================================================

  const renderRepairDetail = () => {
    const repair = repairs.find(r => r.id === selectedRepair.id) || selectedRepair;
    const rs = REPAIR_STATUS[repair.status] || REPAIR_STATUS.open;
    const rp = REPAIR_PRIORITY[repair.priority] || REPAIR_PRIORITY.medium;
    return (
      <>
        <div style={st.detailHeader}>
          <button style={st.backBtn} onClick={() => setRepairView("list")}>← Back</button>
          <span style={{ fontSize: 11, color: "#444", letterSpacing: "0.1em" }}>REPAIR DETAIL</span>
        </div>
        {repair.photos && repair.photos.length > 0 && (
          <div style={{ margin: "16px 16px 0", display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
            {repair.photos.map((photo, i) => (
              <img key={i} src={photo} alt={`photo ${i + 1}`} style={{ height: 140, width: 140, objectFit: "cover", borderRadius: 8, flexShrink: 0, border: "1px solid #1e1e1e" }} />
            ))}
          </div>
        )}
        <div style={st.detailBody}>
          <div style={st.detailName}>{repair.problem || "Untitled Repair"}</div>
          {(() => { const today = new Date().toISOString().split("T")[0]; const isOverdue = repair.dueDate && repair.dueDate < today && repair.status !== "fixed" && repair.status !== "cant_fix"; return isOverdue ? <div style={{ background: "#450a0a", border: "1px solid #ef444466", borderRadius: 8, padding: "8px 12px", marginBottom: 12, fontSize: 12, color: "#ef4444" }}>⚠ Overdue — due {repair.dueDate}</div> : null; })()}
          <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
            <span style={st.badge(rs.color, rs.bg)}>{rs.label}</span>
            <span style={{ ...st.tag, color: rp.color }}>⚡ {rp.label}</span>
            {repair.dueDate && <span style={st.tag}>📅 Due {repair.dueDate}</span>}
            {repair.jobId && (() => { const job = jobs.find(j => j.id === repair.jobId); return job ? <span style={st.tag}>📋 {job.title || "Untitled Job"}</span> : null; })()}
            {repair.category && <span style={st.tag}>{repair.category}</span>}
            {repair.location && <span style={st.tag}>📍 {repair.location}</span>}
          </div>
          <div style={{ fontSize: 11, color: "#444", marginBottom: 12, letterSpacing: "0.1em" }}>QUICK STATUS CHANGE</div>
          <div style={st.statusRow}>
            {Object.entries(REPAIR_STATUS).map(([k, v]) => (
              <button key={k} style={st.statusBtn(v.color, v.bg, repair.status === k)}
                onClick={() => {
                  const today = new Date().toISOString().split("T")[0];
                  const dateClosed = (k === "fixed" || k === "cant_fix") && !repair.dateClosed ? today : repair.dateClosed;
                  setRepairs(prev => prev.map(r => r.id === repair.id ? { ...r, status: k, dateClosed } : r));
                }}>
                {v.label}
              </button>
            ))}
          </div>
          {repair.description && (
            <>
              <div style={{ fontSize: 11, color: "#444", marginTop: 16, marginBottom: 6, letterSpacing: "0.1em" }}>DESCRIPTION</div>
              <div style={st.notesBox}>{repair.description}</div>
            </>
          )}
          {(repair.partsNeeded || repair.estimatedCost || repair.actualCost) && (
            <div style={{ marginTop: 16 }}>
              {repair.partsNeeded && <div style={st.detailRow}><span style={st.detailLabel}>Parts Needed</span><span style={{ ...st.detailValue, maxWidth: "60%" }}>{repair.partsNeeded}</span></div>}
              {repair.estimatedCost && <div style={st.detailRow}><span style={st.detailLabel}>Est. Cost</span><span style={st.detailValue}>${repair.estimatedCost}</span></div>}
              {repair.actualCost && <div style={st.detailRow}><span style={st.detailLabel}>Actual Cost</span><span style={st.detailValue}>${repair.actualCost}</span></div>}
            </div>
          )}
          {repair.notes && (
            <>
              <div style={{ fontSize: 11, color: "#444", marginTop: 16, marginBottom: 6, letterSpacing: "0.1em" }}>NOTES</div>
              <div style={st.notesBox}>{repair.notes}</div>
            </>
          )}
          <div style={{ fontSize: 11, color: "#333", marginTop: 16 }}>
            Opened {repair.dateOpened}{repair.dateClosed && ` · Closed ${repair.dateClosed}`}
          </div>
          <div style={st.actionRow}>
            <button style={st.btnPrimary} onClick={() => openEditRepair(repair)}>Edit Repair</button>
            <button style={st.btnDanger} onClick={() => deleteRepair(repair.id)}>Delete</button>
          </div>
        </div>
      </>
    );
  };

  const renderRepairForm = () => (
    <>
      <div style={st.detailHeader}>
        <button style={st.backBtn} onClick={() => { setRepairView(repairEditMode ? "detail" : "list"); setRepairEditMode(false); }}>← Back</button>
        <span style={{ fontSize: 11, color: "#444", letterSpacing: "0.1em" }}>{repairEditMode ? "EDIT REPAIR" : "LOG REPAIR"}</span>
      </div>
      <div style={st.formWrap}>
        <div style={st.formGroup}>
          <label style={st.formLabel}>What's broken?</label>
          <input style={st.formInput} placeholder="e.g. Kitchen faucet dripping" value={repairForm.problem} onChange={e => setRepairForm(f => ({ ...f, problem: e.target.value }))} autoFocus />
        </div>
        <div style={st.formGroup}>
          <label style={st.formLabel}>Description</label>
          <textarea style={{ ...st.formInput, minHeight: 80, resize: "vertical" }} placeholder="Describe the problem in more detail..." value={repairForm.description} onChange={e => setRepairForm(f => ({ ...f, description: e.target.value }))} />
        </div>
        <div style={st.formGroup}>
          <label style={st.formLabel}>Photos</label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-start" }}>
            {repairForm.photos.map((photo, i) => (
              <div key={i} style={{ position: "relative", width: 80, height: 80, flexShrink: 0 }}>
                <img src={photo} alt={`photo ${i + 1}`} style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 8, border: "1px solid #222" }} />
                <button onClick={() => removeRepairPhoto(i)} style={{ position: "absolute", top: -6, right: -6, width: 20, height: 20, borderRadius: "50%", background: "#ef4444", border: "none", color: "#fff", fontSize: 11, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "inherit" }}>✕</button>
              </div>
            ))}
            <div style={{ width: 80, height: 80, background: "#111", border: "2px dashed #222", borderRadius: 8, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#555", fontSize: 20, flexShrink: 0 }} onClick={() => repairFileRef.current.click()}>
              📷<span style={{ fontSize: 10, marginTop: 2 }}>Add</span>
            </div>
          </div>
          <input ref={repairFileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleRepairPhoto} />
        </div>
        <div style={st.formGroup}>
          <label style={st.formLabel}>Category</label>
          <input style={st.formInput} placeholder="e.g. Plumbing, Electrical, Automotive..." value={repairForm.category} onChange={e => setRepairForm(f => ({ ...f, category: e.target.value }))} />
        </div>
        <div style={st.formGroup}>
          <label style={st.formLabel}>Location</label>
          <input style={st.formInput} placeholder="e.g. Kitchen, Master Bath, Job Site A..." value={repairForm.location} onChange={e => setRepairForm(f => ({ ...f, location: e.target.value }))} />
        </div>
        <div style={st.formGroup}>
          <label style={st.formLabel}>Priority</label>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {Object.entries(REPAIR_PRIORITY).map(([k, v]) => (
              <button key={k}
                style={{ padding: "7px 14px", borderRadius: 8, border: `1px solid ${v.color}55`, background: repairForm.priority === k ? v.color + "22" : "transparent", color: repairForm.priority === k ? v.color : "#555", fontSize: 12, cursor: "pointer", fontFamily: "inherit", fontWeight: repairForm.priority === k ? 700 : 400 }}
                onClick={() => setRepairForm(f => ({ ...f, priority: k }))}>
                {v.label}
              </button>
            ))}
          </div>
        </div>
        <div style={st.formGroup}>
          <label style={st.formLabel}>Status</label>
          <select style={st.formSelect} value={repairForm.status} onChange={e => setRepairForm(f => ({ ...f, status: e.target.value }))}>
            {Object.entries(REPAIR_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>
        <div style={st.formGroup}>
          <label style={st.formLabel}>Due Date</label>
          <input style={st.formInput} type="date" value={repairForm.dueDate} onChange={e => setRepairForm(f => ({ ...f, dueDate: e.target.value }))} />
        </div>
        <div style={st.formGroup}>
          <label style={st.formLabel}>Link to Job</label>
          <select style={st.formSelect} value={repairForm.jobId ?? ""} onChange={e => setRepairForm(f => ({ ...f, jobId: e.target.value ? Number(e.target.value) : null }))}>
            <option value="">— No job —</option>
            {jobs.map(j => <option key={j.id} value={j.id}>{j.title || "Untitled Job"}{j.client ? ` (${j.client})` : ""}</option>)}
          </select>
        </div>
        <div style={st.formGroup}>
          <label style={st.formLabel}>Parts Needed</label>
          <textarea style={{ ...st.formInput, minHeight: 60, resize: "vertical" }} placeholder="List parts, materials, or supplies needed..." value={repairForm.partsNeeded} onChange={e => setRepairForm(f => ({ ...f, partsNeeded: e.target.value }))} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
          <div>
            <label style={st.formLabel}>Est. Cost ($)</label>
            <input style={st.formInput} placeholder="0.00" type="number" min="0" step="0.01" value={repairForm.estimatedCost} onChange={e => setRepairForm(f => ({ ...f, estimatedCost: e.target.value }))} />
          </div>
          <div>
            <label style={st.formLabel}>Actual Cost ($)</label>
            <input style={st.formInput} placeholder="0.00" type="number" min="0" step="0.01" value={repairForm.actualCost} onChange={e => setRepairForm(f => ({ ...f, actualCost: e.target.value }))} />
          </div>
        </div>
        <div style={st.formGroup}>
          <label style={st.formLabel}>Notes</label>
          <textarea style={{ ...st.formInput, minHeight: 80, resize: "vertical" }} placeholder="What's been tried, repair log, tips..." value={repairForm.notes} onChange={e => setRepairForm(f => ({ ...f, notes: e.target.value }))} />
        </div>
        <button style={{ ...st.btnPrimary, width: "100%", marginTop: 8 }} onClick={saveRepair}>
          {repairEditMode ? "Save Changes" : "Log Repair"}
        </button>
      </div>
    </>
  );

  const renderRepairList = () => (
    <>
      <div style={st.header}>
        <div style={st.logo}>🛠 It's Broken!</div>
        <div style={st.title}>Repair Tracker</div>
        <input style={st.searchBar} placeholder="Search repairs..." value={repairSearch} onChange={e => setRepairSearch(e.target.value)} />
      </div>
      <div style={st.filterRow}>
        {[["all", "All"], ["open", "Open"], ["in_progress", "In Progress"], ["fixed", "Fixed"]].map(([key, label]) => (
          <button key={key} style={st.filterBtn(repairFilter === key)} onClick={() => setRepairFilter(key)}>
            {label} <span style={{ opacity: 0.6 }}>({repairCounts[key] ?? 0})</span>
          </button>
        ))}
      </div>
      <div style={st.list}>
        {filteredRepairs.length === 0 ? (
          <div style={st.emptyState}>
            <div style={st.emptyIcon}>🔩</div>
            <div>No repairs logged</div>
            <div style={{ fontSize: 12, marginTop: 8, color: "#333" }}>Tap + to log your first repair</div>
          </div>
        ) : filteredRepairs.map(repair => {
          const rs = REPAIR_STATUS[repair.status] || REPAIR_STATUS.open;
          const rp = REPAIR_PRIORITY[repair.priority] || REPAIR_PRIORITY.medium;
          const today = new Date().toISOString().split("T")[0];
          const isOverdue = repair.dueDate && repair.dueDate < today && repair.status !== "fixed" && repair.status !== "cant_fix";
          return (
            <div key={repair.id} style={{ ...st.card, border: isOverdue ? "1px solid #ef444433" : "1px solid #1e1e1e" }} onClick={() => { setSelectedRepair(repair); setRepairView("detail"); }}>
              <div style={st.cardTop(isOverdue ? "#ef4444" : rp.color)}>
                <div style={st.cardName}>{repair.problem || "Untitled Repair"}</div>
                <div style={st.cardMeta}>
                  <span style={st.badge(rs.color, rs.bg)}>{rs.label}</span>
                  <span style={{ ...st.tag, color: rp.color }}>⚡ {rp.label}</span>
                  {isOverdue && <span style={st.badge("#ef4444", "#450a0a")}>⚠ Overdue</span>}
                  {repair.dueDate && !isOverdue && <span style={st.tag}>📅 {repair.dueDate}</span>}
                  {repair.category && <span style={st.tag}>{repair.category}</span>}
                </div>
                {repair.description && <div style={{ fontSize: 12, color: "#555", marginTop: 6, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{repair.description}</div>}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );

  // ============================================================
  // JOB VIEWS
  // ============================================================

  const renderJobList = () => (
    <>
      <div style={st.header}>
        <div style={st.logo}>📋 It's Broken!</div>
        <div style={st.title}>Jobs</div>
        <input style={st.searchBar} placeholder="Search jobs..." value={jobSearch} onChange={e => setJobSearch(e.target.value)} />
      </div>
      <div style={st.filterRow}>
        {[["all", "All"], ["scheduled", "Scheduled"], ["in_progress", "In Progress"], ["complete", "Complete"]].map(([key, label]) => (
          <button key={key} style={st.filterBtn(jobFilter === key)} onClick={() => setJobFilter(key)}>
            {label} <span style={{ opacity: 0.6 }}>({jobCounts[key] ?? 0})</span>
          </button>
        ))}
      </div>
      <div style={st.list}>
        {filteredJobs.length === 0 ? (
          <div style={st.emptyState}>
            <div style={st.emptyIcon}>📋</div>
            <div>No jobs yet</div>
            <div style={{ fontSize: 12, marginTop: 8, color: "#333" }}>Tap + to add your first job</div>
          </div>
        ) : filteredJobs.map(job => {
          const js = JOB_STATUS[job.status] || JOB_STATUS.scheduled;
          const today = new Date().toISOString().split("T")[0];
          const linked = repairs.filter(r => r.jobId === job.id && r.status !== "fixed" && r.status !== "cant_fix");
          const overdueCount = linked.filter(r => r.dueDate && r.dueDate < today).length;
          const nextDue = linked.filter(r => r.dueDate && r.dueDate >= today).map(r => r.dueDate).sort()[0] || job.dateScheduled || null;
          return (
            <div key={job.id} style={{ ...st.card, border: overdueCount > 0 ? "1px solid #ef444433" : "1px solid #1e1e1e" }} onClick={() => { setSelectedJob(job); setJobView("detail"); }}>
              <div style={st.cardTop(overdueCount > 0 ? "#ef4444" : js.color)}>
                <div style={st.cardName}>{job.title || "Untitled Job"}</div>
                <div style={st.cardMeta}>
                  <span style={st.badge(js.color, js.bg)}>{js.label}</span>
                  {overdueCount > 0 && <span style={st.badge("#ef4444", "#450a0a")}>⚠ {overdueCount} overdue</span>}
                  {job.client && <span style={st.tag}>👤 {job.client}</span>}
                  {nextDue && <span style={st.tag}>📅 {nextDue}</span>}
                </div>
                {job.address && <div style={{ fontSize: 12, color: "#555", marginTop: 6, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>📍 {job.address}</div>}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );

  const renderJobDetail = () => {
    const job = jobs.find(j => j.id === selectedJob.id) || selectedJob;
    const js = JOB_STATUS[job.status] || JOB_STATUS.scheduled;
    return (
      <>
        <div style={st.detailHeader}>
          <button style={st.backBtn} onClick={() => setJobView("list")}>← Back</button>
          <span style={{ fontSize: 11, color: "#444", letterSpacing: "0.1em" }}>JOB DETAIL</span>
        </div>
        {job.photos && job.photos.length > 0 && (
          <div style={{ margin: "16px 16px 0", display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
            {job.photos.map((photo, i) => (
              <img key={i} src={photo} alt={`photo ${i + 1}`} style={{ height: 140, width: 140, objectFit: "cover", borderRadius: 8, flexShrink: 0, border: "1px solid #1e1e1e" }} />
            ))}
          </div>
        )}
        <div style={st.detailBody}>
          <div style={st.detailName}>{job.title || "Untitled Job"}</div>
          <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
            <span style={st.badge(js.color, js.bg)}>{js.label}</span>
            {job.client && <span style={st.tag}>👤 {job.client}</span>}
          </div>
          <div style={{ fontSize: 11, color: "#444", marginBottom: 12, letterSpacing: "0.1em" }}>QUICK STATUS CHANGE</div>
          <div style={st.statusRow}>
            {Object.entries(JOB_STATUS).map(([k, v]) => (
              <button key={k} style={st.statusBtn(v.color, v.bg, job.status === k)}
                onClick={() => {
                  const today = new Date().toISOString().split("T")[0];
                  const dateCompleted = k === "complete" && !job.dateCompleted ? today : job.dateCompleted;
                  setJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: k, dateCompleted } : j));
                }}>
                {v.label}
              </button>
            ))}
          </div>
          {(job.phone || job.address) && (
            <div style={{ marginTop: 16 }}>
              {job.phone && <div style={st.detailRow}><span style={st.detailLabel}>Phone</span><span style={st.detailValue}>{job.phone}</span></div>}
              {job.address && <div style={st.detailRow}><span style={st.detailLabel}>Address</span><span style={{ ...st.detailValue, maxWidth: "60%" }}>{job.address}</span></div>}
              {job.dateScheduled && <div style={st.detailRow}><span style={st.detailLabel}>Scheduled</span><span style={st.detailValue}>{job.dateScheduled}</span></div>}
              {job.dateCompleted && <div style={st.detailRow}><span style={st.detailLabel}>Completed</span><span style={st.detailValue}>{job.dateCompleted}</span></div>}
              {job.estimatedCost && <div style={st.detailRow}><span style={st.detailLabel}>Est. Cost</span><span style={st.detailValue}>${job.estimatedCost}</span></div>}
              {job.actualCost && <div style={st.detailRow}><span style={st.detailLabel}>Actual Cost</span><span style={st.detailValue}>${job.actualCost}</span></div>}
            </div>
          )}
          {job.notes && (
            <>
              <div style={{ fontSize: 11, color: "#444", marginTop: 16, marginBottom: 6, letterSpacing: "0.1em" }}>NOTES</div>
              <div style={st.notesBox}>{job.notes}</div>
            </>
          )}
          {(() => {
            const today = new Date().toISOString().split("T")[0];
            const linked = repairs.filter(r => r.jobId === job.id).sort((a, b) => (a.dueDate || "9999") < (b.dueDate || "9999") ? -1 : 1);
            if (!linked.length) return null;
            return (
              <>
                <div style={{ fontSize: 11, color: "#444", marginTop: 16, marginBottom: 8, letterSpacing: "0.1em" }}>LINKED REPAIRS ({linked.length})</div>
                {linked.map(r => {
                  const rs = REPAIR_STATUS[r.status] || REPAIR_STATUS.open;
                  const isOverdue = r.dueDate && r.dueDate < today && r.status !== "fixed" && r.status !== "cant_fix";
                  return (
                    <div key={r.id} style={{ background: "#0f0f0f", border: `1px solid ${isOverdue ? "#ef444433" : "#1e1e1e"}`, borderRadius: 8, padding: "10px 12px", marginBottom: 6, cursor: "pointer" }}
                      onClick={() => { setSelectedRepair(r); setSection("repairs"); setRepairView("detail"); }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 13, color: "#e5e5e5", fontWeight: 600 }}>{r.problem || "Untitled Repair"}</span>
                        <span style={st.badge(rs.color, rs.bg)}>{rs.label}</span>
                      </div>
                      <div style={{ display: "flex", gap: 6, marginTop: 5, flexWrap: "wrap" }}>
                        {isOverdue && <span style={{ ...st.badge("#ef4444", "#450a0a"), fontSize: 9 }}>⚠ Overdue</span>}
                        {r.dueDate && <span style={{ ...st.tag, color: isOverdue ? "#ef4444" : "#999" }}>📅 {r.dueDate}</span>}
                      </div>
                    </div>
                  );
                })}
              </>
            );
          })()}
          <div style={{ fontSize: 11, color: "#333", marginTop: 16 }}>Created {job.dateCreated}</div>
          <div style={st.actionRow}>
            <button style={st.btnPrimary} onClick={() => openEditJob(job)}>Edit Job</button>
            <button style={st.btnDanger} onClick={() => deleteJob(job.id)}>Delete</button>
          </div>
        </div>
      </>
    );
  };

  const renderJobForm = () => (
    <>
      <div style={st.detailHeader}>
        <button style={st.backBtn} onClick={() => { setJobView(jobEditMode ? "detail" : "list"); setJobEditMode(false); }}>← Back</button>
        <span style={{ fontSize: 11, color: "#444", letterSpacing: "0.1em" }}>{jobEditMode ? "EDIT JOB" : "ADD JOB"}</span>
      </div>
      <div style={st.formWrap}>
        <div style={st.formGroup}>
          <label style={st.formLabel}>Job Title</label>
          <input style={st.formInput} placeholder="e.g. Johnson kitchen reno" value={jobForm.title} onChange={e => setJobForm(f => ({ ...f, title: e.target.value }))} autoFocus />
        </div>
        <div style={st.formGroup}>
          <label style={st.formLabel}>Client Name</label>
          <input style={st.formInput} placeholder="e.g. Mike Johnson" value={jobForm.client} onChange={e => setJobForm(f => ({ ...f, client: e.target.value }))} />
        </div>
        <div style={st.formGroup}>
          <label style={st.formLabel}>Phone</label>
          <input style={st.formInput} placeholder="e.g. 555-867-5309" type="tel" value={jobForm.phone} onChange={e => setJobForm(f => ({ ...f, phone: e.target.value }))} />
        </div>
        <div style={st.formGroup}>
          <label style={st.formLabel}>Address</label>
          <input style={st.formInput} placeholder="e.g. 123 Main St, Springfield" value={jobForm.address} onChange={e => setJobForm(f => ({ ...f, address: e.target.value }))} />
        </div>
        <div style={st.formGroup}>
          <label style={st.formLabel}>Status</label>
          <select style={st.formSelect} value={jobForm.status} onChange={e => setJobForm(f => ({ ...f, status: e.target.value }))}>
            {Object.entries(JOB_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>
        <div style={st.formGroup}>
          <label style={st.formLabel}>Date Scheduled</label>
          <input style={st.formInput} type="date" value={jobForm.dateScheduled} onChange={e => setJobForm(f => ({ ...f, dateScheduled: e.target.value }))} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
          <div>
            <label style={st.formLabel}>Est. Cost ($)</label>
            <input style={st.formInput} placeholder="0.00" type="number" min="0" step="0.01" value={jobForm.estimatedCost} onChange={e => setJobForm(f => ({ ...f, estimatedCost: e.target.value }))} />
          </div>
          <div>
            <label style={st.formLabel}>Actual Cost ($)</label>
            <input style={st.formInput} placeholder="0.00" type="number" min="0" step="0.01" value={jobForm.actualCost} onChange={e => setJobForm(f => ({ ...f, actualCost: e.target.value }))} />
          </div>
        </div>
        <div style={st.formGroup}>
          <label style={st.formLabel}>Photos</label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-start" }}>
            {jobForm.photos.map((photo, i) => (
              <div key={i} style={{ position: "relative", width: 80, height: 80, flexShrink: 0 }}>
                <img src={photo} alt={`photo ${i + 1}`} style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 8, border: "1px solid #222" }} />
                <button onClick={() => removeJobPhoto(i)} style={{ position: "absolute", top: -6, right: -6, width: 20, height: 20, borderRadius: "50%", background: "#ef4444", border: "none", color: "#fff", fontSize: 11, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "inherit" }}>✕</button>
              </div>
            ))}
            <div style={{ width: 80, height: 80, background: "#111", border: "2px dashed #222", borderRadius: 8, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#555", fontSize: 20, flexShrink: 0 }} onClick={() => jobFileRef.current.click()}>
              📷<span style={{ fontSize: 10, marginTop: 2 }}>Add</span>
            </div>
          </div>
          <input ref={jobFileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleJobPhoto} />
        </div>
        <div style={st.formGroup}>
          <label style={st.formLabel}>Notes</label>
          <textarea style={{ ...st.formInput, minHeight: 80, resize: "vertical" }} placeholder="Job notes, special instructions, access codes..." value={jobForm.notes} onChange={e => setJobForm(f => ({ ...f, notes: e.target.value }))} />
        </div>
        <button style={{ ...st.btnPrimary, width: "100%", marginTop: 8 }} onClick={saveJob}>
          {jobEditMode ? "Save Changes" : "Add Job"}
        </button>
      </div>
    </>
  );

  // ============================================================
  // MAIN RENDER
  // ============================================================

  const liveSelectedTool = selectedTool ? (tools.find(i => i.id === selectedTool.id) || selectedTool) : null;
  const liveSelectedMaterial = selectedMaterial ? (materials.find(i => i.id === selectedMaterial.id) || selectedMaterial) : null;

  return (
    <div style={st.app}>
      {section === "jobs" && (
        jobView === "detail" && selectedJob ? renderJobDetail() :
        jobView === "add" ? renderJobForm() :
        renderJobList()
      )}
      {section === "tools" && (
        toolView === "detail" && liveSelectedTool
          ? renderItemDetail(liveSelectedTool, tools, setTools, setToolView, toolH.openEdit)
          : toolView === "add"
          ? renderItemForm(toolForm, setToolForm, toolEditMode, setToolView, setToolEditMode, toolH.saveItem, toolCategories, setToolCategories, newToolCategory, setNewToolCategory, showAddToolCategory, setShowAddToolCategory, toolH.addCategory, toolH.deleteCategory, newToolLocation, setNewToolLocation, showAddToolLocation, setShowAddToolLocation, toolH.addLocation, toolH.deleteLocation, toolH.handlePhoto, toolFileRef, "TOOL")
          : renderItemList(filteredTools, toolCounts, toolFilter, setToolFilter, toolSearch, setToolSearch, setToolView, setSelectedTool, "⚙", "Tools", "🔧", "No tools found")
      )}
      {section === "materials" && (
        materialView === "detail" && liveSelectedMaterial
          ? renderItemDetail(liveSelectedMaterial, materials, setMaterials, setMaterialView, matH.openEdit)
          : materialView === "add"
          ? renderItemForm(materialForm, setMaterialForm, materialEditMode, setMaterialView, setMaterialEditMode, matH.saveItem, materialCategories, setMaterialCategories, newMaterialCategory, setNewMaterialCategory, showAddMaterialCategory, setShowAddMaterialCategory, matH.addCategory, matH.deleteCategory, newMaterialLocation, setNewMaterialLocation, showAddMaterialLocation, setShowAddMaterialLocation, matH.addLocation, matH.deleteLocation, matH.handlePhoto, materialFileRef, "MATERIAL")
          : renderItemList(filteredMaterials, materialCounts, materialFilter, setMaterialFilter, materialSearch, setMaterialSearch, setMaterialView, setSelectedMaterial, "📦", "Materials", "🪵", "No materials found")
      )}
      {section === "repairs" && (
        repairView === "detail" && selectedRepair ? renderRepairDetail() :
        repairView === "add" ? renderRepairForm() :
        renderRepairList()
      )}
      {showFab && (
        <button style={st.fab} onClick={
          section === "jobs" ? openAddJob :
          section === "tools" ? toolH.openAdd :
          section === "materials" ? matH.openAdd :
          openAddRepair
        }>+</button>
      )}
      <div style={st.bottomNav}>
        <button style={st.navBtn(section === "jobs")} onClick={() => setSection("jobs")}>
          <span style={{ fontSize: 18 }}>📋</span>
          <span>Jobs</span>
        </button>
        <button style={st.navBtn(section === "tools")} onClick={() => setSection("tools")}>
          <span style={{ fontSize: 18 }}>🔧</span>
          <span>Tools</span>
        </button>
        <button style={st.navBtn(section === "materials")} onClick={() => setSection("materials")}>
          <span style={{ fontSize: 18 }}>📦</span>
          <span>Materials</span>
        </button>
        <button style={st.navBtn(section === "repairs")} onClick={() => setSection("repairs")}>
          <span style={{ fontSize: 18 }}>🛠️</span>
          <span>Repairs</span>
        </button>
      </div>
    </div>
  );
}
