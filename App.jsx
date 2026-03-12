import { useState, useRef } from "react";

const CATEGORIES = ["Power Tools", "Hand Tools", "Electrical", "Plumbing", "Safety Gear", "Lifting & Rigging", "Test Equipment", "Other"];
const LOCATIONS = ["Job Site A", "Job Site B", "Shop / Warehouse", "Van", "Loaned Out", "Unknown"];
const STATUS = {
  good: { label: "Good", color: "#22c55e", bg: "#052e16" },
  needs_repair: { label: "Needs Repair", color: "#f97316", bg: "#431407" },
  broken: { label: "Broken", color: "#ef4444", bg: "#450a0a" },
  retired: { label: "Retired", color: "#6b7280", bg: "#111827" },
};

const sampleItems = [
  { id: 1, name: "Milwaukee M18 Drill", category: "Power Tools", location: "Van", status: "good", notes: "Battery charged, ready to go", photo: null, added: "2025-01-10" },
  { id: 2, name: "Fluke 87V Multimeter", category: "Test Equipment", location: "Shop / Warehouse", status: "needs_repair", notes: "Display flickering on DC voltage mode", photo: null, added: "2025-02-03" },
  { id: 3, name: "6ft Step Ladder", category: "Other", location: "Job Site A", status: "broken", notes: "Top rung cracked — DO NOT USE", photo: null, added: "2024-11-20" },
];

export default function InventoryApp() {
  const [items, setItems] = useState(sampleItems);
  const [view, setView] = useState("list"); // list | add | detail
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ name: "", category: "Power Tools", location: "Van", status: "good", notes: "", photo: null });
  const [editMode, setEditMode] = useState(false);
  const fileRef = useRef();

  const filtered = items.filter(i => {
    const matchFilter = filter === "all" || i.status === filter;
    const matchSearch = i.name.toLowerCase().includes(search.toLowerCase()) || i.category.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const counts = {
    all: items.length,
    good: items.filter(i => i.status === "good").length,
    needs_repair: items.filter(i => i.status === "needs_repair").length,
    broken: items.filter(i => i.status === "broken").length,
  };

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setForm(f => ({ ...f, photo: ev.target.result }));
    reader.readAsDataURL(file);
  };

  const saveItem = () => {
    if (!form.name.trim()) return;
    if (editMode && selected) {
      setItems(prev => prev.map(i => i.id === selected.id ? { ...i, ...form } : i));
      setSelected({ ...selected, ...form });
      setView("detail");
    } else {
      const newItem = { ...form, id: Date.now(), added: new Date().toISOString().split("T")[0] };
      setItems(prev => [newItem, ...prev]);
      setView("list");
    }
    setEditMode(false);
  };

  const deleteItem = (id) => {
    setItems(prev => prev.filter(i => i.id !== id));
    setView("list");
  };

  const openAdd = () => {
    setForm({ name: "", category: "Power Tools", location: "Van", status: "good", notes: "", photo: null });
    setEditMode(false);
    setView("add");
  };

  const openEdit = (item) => {
    setForm({ name: item.name, category: item.category, location: item.location, status: item.status, notes: item.notes, photo: item.photo });
    setEditMode(true);
    setView("add");
  };

  const styles = {
    app: { fontFamily: "'DM Mono', 'Courier New', monospace", background: "#0a0a0a", minHeight: "100vh", color: "#e5e5e5", maxWidth: 480, margin: "0 auto", position: "relative", paddingBottom: 80 },
    header: { padding: "20px 16px 12px", borderBottom: "1px solid #1f1f1f", position: "sticky", top: 0, background: "#0a0a0a", zIndex: 10 },
    logo: { fontSize: 11, letterSpacing: "0.25em", color: "#f97316", textTransform: "uppercase", marginBottom: 4 },
    title: { fontSize: 22, fontWeight: 700, color: "#f5f5f5", letterSpacing: "-0.02em" },
    searchBar: { margin: "12px 0 0", background: "#111", border: "1px solid #222", borderRadius: 6, padding: "8px 12px", color: "#e5e5e5", width: "100%", fontSize: 13, boxSizing: "border-box", outline: "none" },
    filterRow: { display: "flex", gap: 6, padding: "10px 16px", overflowX: "auto", borderBottom: "1px solid #1a1a1a" },
    filterBtn: (active) => ({ padding: "5px 12px", borderRadius: 20, border: "1px solid", fontSize: 11, letterSpacing: "0.08em", cursor: "pointer", whiteSpace: "nowrap", fontFamily: "inherit", fontWeight: active ? 700 : 400, background: active ? "#f97316" : "transparent", borderColor: active ? "#f97316" : "#333", color: active ? "#000" : "#999", transition: "all 0.15s" }),
    list: { padding: "12px 16px", display: "flex", flexDirection: "column", gap: 10 },
    card: { background: "#111", borderRadius: 10, border: "1px solid #1e1e1e", overflow: "hidden", cursor: "pointer", transition: "border-color 0.15s" },
    cardTop: (status) => ({ borderLeft: `3px solid ${STATUS[status].color}`, padding: "12px 14px" }),
    cardName: { fontSize: 15, fontWeight: 600, color: "#f5f5f5", marginBottom: 4 },
    cardMeta: { display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" },
    tag: { fontSize: 10, letterSpacing: "0.1em", padding: "2px 7px", borderRadius: 4, background: "#1a1a1a", color: "#999", textTransform: "uppercase" },
    statusBadge: (status) => ({ fontSize: 10, letterSpacing: "0.1em", padding: "2px 7px", borderRadius: 4, background: STATUS[status].bg, color: STATUS[status].color, textTransform: "uppercase", fontWeight: 700, border: `1px solid ${STATUS[status].color}33` }),
    fab: { position: "fixed", bottom: 24, right: "calc(50% - 220px)", width: 52, height: 52, borderRadius: 14, background: "#f97316", border: "none", color: "#000", fontSize: 26, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, boxShadow: "0 4px 20px #f9731640", zIndex: 20 },
    // Detail view
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
    // Status quick-change buttons
    statusRow: { display: "flex", gap: 6, marginTop: 14, flexWrap: "wrap" },
    statusBtn: (s, current) => ({ padding: "6px 10px", borderRadius: 6, border: `1px solid ${STATUS[s].color}55`, background: current === s ? STATUS[s].bg : "transparent", color: current === s ? STATUS[s].color : "#555", fontSize: 10, letterSpacing: "0.08em", cursor: "pointer", fontFamily: "inherit", fontWeight: current === s ? 700 : 400 }),
    // Add form
    formWrap: { padding: 16 },
    formTitle: { fontSize: 18, fontWeight: 700, color: "#f5f5f5", marginBottom: 16 },
    formGroup: { marginBottom: 14 },
    formLabel: { fontSize: 10, letterSpacing: "0.15em", color: "#555", textTransform: "uppercase", marginBottom: 5, display: "block" },
    formInput: { width: "100%", background: "#111", border: "1px solid #222", borderRadius: 8, padding: "10px 12px", color: "#e5e5e5", fontSize: 14, fontFamily: "inherit", boxSizing: "border-box", outline: "none" },
    formSelect: { width: "100%", background: "#111", border: "1px solid #222", borderRadius: 8, padding: "10px 12px", color: "#e5e5e5", fontSize: 14, fontFamily: "inherit", boxSizing: "border-box", outline: "none", appearance: "none" },
    photoUpload: { width: "100%", background: "#111", border: "2px dashed #222", borderRadius: 8, padding: "20px", color: "#555", fontSize: 12, textAlign: "center", cursor: "pointer", boxSizing: "border-box" },
    photoPreview: { width: "100%", borderRadius: 8, overflow: "hidden", marginTop: 8, maxHeight: 160, objectFit: "cover" },
    emptyState: { textAlign: "center", padding: "60px 20px", color: "#444" },
    emptyIcon: { fontSize: 40, marginBottom: 12 },
  };

  // DETAIL VIEW
  if (view === "detail" && selected) {
    const item = items.find(i => i.id === selected.id) || selected;
    return (
      <div style={styles.app}>
        <div style={styles.detailHeader}>
          <button style={styles.backBtn} onClick={() => setView("list")}>← Back</button>
          <span style={{ fontSize: 11, color: "#444", letterSpacing: "0.1em" }}>ITEM DETAIL</span>
        </div>
        <div style={styles.photoBox}>
          {item.photo ? <img src={item.photo} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span>📷 No photo</span>}
        </div>
        <div style={styles.detailBody}>
          <div style={styles.detailName}>{item.name}</div>
          <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
            <span style={styles.statusBadge(item.status)}>{STATUS[item.status].label}</span>
            <span style={styles.tag}>{item.category}</span>
            <span style={styles.tag}>📍 {item.location}</span>
          </div>
          <div style={{ fontSize: 11, color: "#444", marginBottom: 12, letterSpacing: "0.1em" }}>QUICK STATUS CHANGE</div>
          <div style={styles.statusRow}>
            {Object.entries(STATUS).map(([s, info]) => (
              <button key={s} style={styles.statusBtn(s, item.status)} onClick={() => setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: s } : i))}>
                {info.label}
              </button>
            ))}
          </div>
          {item.notes && (
            <>
              <div style={{ fontSize: 11, color: "#444", marginTop: 16, marginBottom: 6, letterSpacing: "0.1em" }}>NOTES</div>
              <div style={styles.notesBox}>{item.notes}</div>
            </>
          )}
          <div style={{ fontSize: 11, color: "#333", marginTop: 16 }}>Added {item.added}</div>
          <div style={styles.actionRow}>
            <button style={styles.btnPrimary} onClick={() => openEdit(item)}>Edit Item</button>
            <button style={styles.btnDanger} onClick={() => deleteItem(item.id)}>Delete</button>
          </div>
        </div>
      </div>
    );
  }

  // ADD / EDIT FORM
  if (view === "add") {
    return (
      <div style={styles.app}>
        <div style={styles.detailHeader}>
          <button style={styles.backBtn} onClick={() => { setView(editMode ? "detail" : "list"); setEditMode(false); }}>← Back</button>
          <span style={{ fontSize: 11, color: "#444", letterSpacing: "0.1em" }}>{editMode ? "EDIT ITEM" : "ADD ITEM"}</span>
        </div>
        <div style={styles.formWrap}>
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Item Name *</label>
            <input style={styles.formInput} placeholder="e.g. Milwaukee M18 Drill" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Category</label>
            <select style={styles.formSelect} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Location</label>
            <select style={styles.formSelect} value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))}>
              {LOCATIONS.map(l => <option key={l}>{l}</option>)}
            </select>
          </div>
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Status</label>
            <select style={styles.formSelect} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
              {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Notes</label>
            <textarea style={{ ...styles.formInput, minHeight: 80, resize: "vertical" }} placeholder="Any issues, last service date, etc." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Photo</label>
            <div style={styles.photoUpload} onClick={() => fileRef.current.click()}>
              {form.photo ? <img src={form.photo} alt="preview" style={styles.photoPreview} /> : <>📷 Tap to upload a photo</>}
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handlePhoto} />
          </div>
          <button style={{ ...styles.btnPrimary, width: "100%", marginTop: 8 }} onClick={saveItem}>
            {editMode ? "Save Changes" : "Add to Inventory"}
          </button>
        </div>
      </div>
    );
  }

  // MAIN LIST VIEW
  return (
    <div style={styles.app}>
      <div style={styles.header}>
        <div style={styles.logo}>⚙ It's Broken!</div>
        <div style={styles.title}>Tool Inventory</div>
        <input style={styles.searchBar} placeholder="Search tools..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <div style={styles.filterRow}>
        {[["all", "All"], ["good", "Good"], ["needs_repair", "Needs Repair"], ["broken", "Broken"]].map(([key, label]) => (
          <button key={key} style={styles.filterBtn(filter === key)} onClick={() => setFilter(key)}>
            {label} <span style={{ opacity: 0.6 }}>({counts[key] ?? 0})</span>
          </button>
        ))}
      </div>
      <div style={styles.list}>
        {filtered.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>🔧</div>
            <div>No items found</div>
          </div>
        ) : filtered.map(item => (
          <div key={item.id} style={styles.card} onClick={() => { setSelected(item); setView("detail"); }}>
            <div style={styles.cardTop(item.status)}>
              <div style={styles.cardName}>{item.name}</div>
              <div style={styles.cardMeta}>
                <span style={styles.statusBadge(item.status)}>{STATUS[item.status].label}</span>
                <span style={styles.tag}>{item.category}</span>
                <span style={styles.tag}>📍 {item.location}</span>
              </div>
              {item.notes && <div style={{ fontSize: 12, color: "#555", marginTop: 6, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.notes}</div>}
            </div>
          </div>
        ))}
      </div>
      <button style={styles.fab} onClick={openAdd}>+</button>
    </div>
  );
}
