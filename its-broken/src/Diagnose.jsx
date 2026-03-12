import { useState } from "react";
import Anthropic from "@anthropic-ai/sdk";

const SYSTEM_TYPES = [
  { id: "electrical",    label: "Electrical",           icon: "⚡", color: "#eab308", detail: "electrical systems including circuits, breakers, wiring, transformers, panels, contactors, relays, motor starters, and power distribution. Consider voltage levels (120V, 208V, 240V, 480V), phase configurations, and NEC code compliance." },
  { id: "hvac",          label: "HVAC",                 icon: "🌡️", color: "#06b6d4", detail: "HVAC systems including compressors, refrigerant circuits, airflow, ductwork, thermostats, dampers, VAV boxes, AHUs, RTUs, chillers, cooling towers, and hydronic systems. Consider refrigerant types, pressure-temperature relationships, and airflow balancing." },
  { id: "plumbing",      label: "Plumbing",             icon: "💧", color: "#3b82f6", detail: "plumbing systems including supply pipes, drain-waste-vent systems, valves, pumps, fixtures, water heaters, backflow preventers, pressure regulators, and water treatment. Consider pipe materials (copper, PEX, PVC, cast iron), pressure requirements, and local plumbing codes." },
  { id: "mechanical",    label: "Mechanical",           icon: "⚙️", color: "#f97316", detail: "mechanical systems including motors, bearings, belts, gears, couplings, pneumatics, hydraulics, pumps, fans, compressors, and power transmission components. Consider vibration analysis, lubrication, alignment, and wear patterns." },
  { id: "it",            label: "IT/Network",           icon: "🌐", color: "#8b5cf6", detail: "IT and network infrastructure including switches, routers, firewalls, access points, cabling (Cat5e/6/6A/fiber), DNS, DHCP, VLANs, STP, routing protocols, and server connectivity. Consider OSI model layers when diagnosing, and differentiate between Layer 1 (physical), Layer 2 (switching), and Layer 3 (routing) issues." },
  { id: "bacnet",        label: "BACnet / BAS",         icon: "🖥️", color: "#22c55e", detail: "BACnet and Building Automation Systems including BACnet/IP, BACnet MS/TP, controllers (DDC), sensors, actuators, field buses, object types (AV, BV, AO, BO, AI, BI), COV subscriptions, schedules, alarms, and trending. Consider network topology, baud rates, MAC addressing, and controller firmware." },
  { id: "gcl",           label: "GCL+",                 icon: "💻", color: "#f59e0b", detail: "GCL+ programming on Delta Controls platforms including syntax errors, variable scope, conditional logic, timing sequences, function blocks, subroutine calls, analog/digital I/O handling, PID loops, and scheduler integration. Consider Delta Controls-specific conventions, PCODE compilation errors, and controller resource limits." },
  { id: "prog_controls", label: "Programming/Controls", icon: "🔲", color: "#ec4899", detail: "general controls and programming systems including PLCs (Allen-Bradley, Siemens, Schneider), ladder logic, function block diagrams, structured text, SCADA systems, HMI programming, PID tuning, motion control, and industrial automation. Consider scan time issues, memory addressing, I/O mapping, and communication protocols (Modbus, EtherNet/IP, Profibus, OPC-UA)." },
  { id: "other",         label: "Other",                icon: "🔍", color: "#6b7280", detail: "general technical systems and equipment not covered by other categories. Apply systematic troubleshooting methodology: isolate the fault, check power and signal, verify mechanical integrity, review recent changes, and consult equipment documentation. Ask clarifying questions if the system type would help narrow down root causes." },
];

const SEVERITY_COLOR = { critical: "#ef4444", high: "#f97316", medium: "#eab308", low: "#22c55e" };
const SEVERITY_BG    = { critical: "#450a0a", high: "#431407", medium: "#422006", low: "#052e16" };

const VOLTAGE_SUGGESTIONS = {
  electrical: [
    { label: "Line Voltage (L1-L2)", unit: "V" }, { label: "Line Voltage (L1-N)", unit: "V" },
    { label: "Line Voltage (L2-N)", unit: "V" },  { label: "Ground Voltage (L1-G)", unit: "V" },
    { label: "Load Current", unit: "A" },          { label: "Neutral Current", unit: "A" },
  ],
  hvac: [
    { label: "Supply Air Temp", unit: "°F" },  { label: "Return Air Temp", unit: "°F" },
    { label: "Discharge Pressure", unit: "psig" }, { label: "Suction Pressure", unit: "psig" },
    { label: "Supply Fan Amps", unit: "A" },   { label: "Compressor Amps", unit: "A" },
  ],
  plumbing: [
    { label: "Supply Pressure", unit: "psi" }, { label: "Return Pressure", unit: "psi" },
    { label: "Flow Rate", unit: "GPM" },       { label: "Water Temp (hot)", unit: "°F" },
    { label: "Water Temp (cold)", unit: "°F" }, { label: "Static Pressure", unit: "psi" },
  ],
  mechanical: [
    { label: "Motor Voltage", unit: "V" },     { label: "Motor Current", unit: "A" },
    { label: "Vibration", unit: "mm/s" },      { label: "Bearing Temp", unit: "°F" },
    { label: "RPM", unit: "rpm" },             { label: "Output Torque", unit: "Nm" },
  ],
  it: [
    { label: "Ping Latency (ms)", unit: "ms" }, { label: "Packet Loss", unit: "%" },
    { label: "Port Status (1=up)", unit: "" },  { label: "Bandwidth Used", unit: "Mbps" },
    { label: "VLAN ID", unit: "" },             { label: "Signal Strength", unit: "dBm" },
  ],
  bacnet: [
    { label: "Controller Power", unit: "V" },  { label: "Network MS/TP Voltage", unit: "V" },
    { label: "Sensor Input", unit: "" },        { label: "Output Signal", unit: "%" },
    { label: "BACnet Object Value", unit: "" }, { label: "Alarm Count", unit: "" },
  ],
  gcl: [
    { label: "Variable Value", unit: "" },     { label: "Timer Value", unit: "s" },
    { label: "Counter Value", unit: "" },      { label: "Analog Input", unit: "" },
    { label: "Digital Output (1=ON)", unit: "" }, { label: "Loop Iteration", unit: "" },
  ],
  prog_controls: [
    { label: "PLC Input (1=ON)", unit: "" },   { label: "PLC Output (1=ON)", unit: "" },
    { label: "Analog Input (raw)", unit: "" }, { label: "Analog Output (%)", unit: "%" },
    { label: "PID Setpoint", unit: "" },       { label: "PID Process Value", unit: "" },
    { label: "Scan Time", unit: "ms" },        { label: "Register Value", unit: "" },
  ],
  other: [
    { label: "Measurement 1", unit: "" },      { label: "Measurement 2", unit: "" },
    { label: "Input Value", unit: "" },        { label: "Output Value", unit: "" },
    { label: "Temp Reading", unit: "°F" },     { label: "Voltage Reading", unit: "V" },
  ],
};

const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY;

async function callClaude(prompt) {
  if (!API_KEY || API_KEY === "your_api_key_here") throw new Error("NO_KEY");
  const client = new Anthropic({ apiKey: API_KEY, dangerouslyAllowBrowser: true });
  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    messages: [{ role: "user", content: prompt }],
  });
  const text = message.content[0].text;
  const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) || text.match(/(\{[\s\S]*\})/);
  return JSON.parse(jsonMatch ? jsonMatch[1] : text);
}

export default function Diagnose({ onLogRepair }) {
  const [symptom, setSymptom]               = useState("");
  const [systemType, setSystemType]         = useState("electrical");
  const [analysis, setAnalysis]             = useState(null);
  const [isAnalyzing, setIsAnalyzing]       = useState(false);
  const [analyzeError, setAnalyzeError]     = useState(null);
  const [expanded, setExpanded]             = useState(null);
  const [readings, setReadings]             = useState([]);
  const [customLabel, setCustomLabel]       = useState("");
  const [customUnit, setCustomUnit]         = useState("");
  const [showAddReading, setShowAddReading] = useState(false);
  const [verdict, setVerdict]               = useState(null);
  const [isVerdict, setIsVerdict]           = useState(false);

  const sys = SYSTEM_TYPES.find(s => s.id === systemType);
  const suggestions = VOLTAGE_SUGGESTIONS[systemType] || [];

  const st = {
    page:       { padding: "16px 16px 24px", fontFamily: "'DM Mono','Courier New',monospace" },
    logo:       { fontSize: 11, letterSpacing: "0.25em", color: "#f97316", textTransform: "uppercase", marginBottom: 2 },
    title:      { fontSize: 22, fontWeight: 700, color: "#f5f5f5", letterSpacing: "-0.02em", marginBottom: 4 },
    subtitle:   { fontSize: 10, letterSpacing: "0.2em", color: "#444", textTransform: "uppercase", marginBottom: 20 },
    sysRow:     { display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 },
    sysBtn:     (active, color) => ({ padding: "6px 12px", borderRadius: 8, border: `1px solid ${active ? color : "#222"}`, background: active ? color + "18" : "#111", color: active ? color : "#555", fontSize: 11, cursor: "pointer", whiteSpace: "nowrap", fontFamily: "inherit", letterSpacing: "0.06em", fontWeight: active ? 700 : 400, transition: "all 0.15s" }),
    textarea:   { width: "100%", background: "#111", border: "1px solid #222", borderRadius: 8, padding: "12px", color: "#e5e5e5", fontSize: 14, fontFamily: "inherit", boxSizing: "border-box", outline: "none", resize: "vertical", minHeight: 90 },
    btn:        { width: "100%", padding: "12px", background: "#f97316", border: "none", borderRadius: 8, color: "#000", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit", marginTop: 8, letterSpacing: "0.05em" },
    btnSm:      { padding: "7px 14px", background: "#f97316", border: "none", borderRadius: 7, color: "#000", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit" },
    btnOut:     { padding: "7px 14px", background: "transparent", border: "1px solid #333", borderRadius: 7, color: "#999", fontSize: 12, cursor: "pointer", fontFamily: "inherit" },
    card:       { background: "#111", border: "1px solid #1e1e1e", borderRadius: 10, overflow: "hidden", marginBottom: 10 },
    cardHead:   (color) => ({ borderLeft: `3px solid ${color}`, padding: "12px 14px", cursor: "pointer" }),
    label:      { fontSize: 10, letterSpacing: "0.15em", color: "#555", textTransform: "uppercase", marginBottom: 4, display: "block" },
    input:      { width: "100%", background: "#111", border: "1px solid #222", borderRadius: 7, padding: "9px 11px", color: "#e5e5e5", fontSize: 13, fontFamily: "inherit", boxSizing: "border-box", outline: "none" },
    tag:        { fontSize: 10, letterSpacing: "0.08em", padding: "2px 7px", borderRadius: 4, background: "#1a1a1a", color: "#999", textTransform: "uppercase" },
    badge:      (sev) => ({ fontSize: 10, padding: "2px 8px", borderRadius: 4, background: SEVERITY_BG[sev] || "#1a1a1a", color: SEVERITY_COLOR[sev] || "#999", textTransform: "uppercase", fontWeight: 700, border: `1px solid ${SEVERITY_COLOR[sev] || "#333"}44`, letterSpacing: "0.06em" }),
    sectionLbl: { fontSize: 10, letterSpacing: "0.2em", color: "#444", textTransform: "uppercase", marginBottom: 10, marginTop: 20 },
    row:        { display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #1a1a1a", fontSize: 13 },
    rowLbl:     { color: "#555", fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase" },
    rowVal:     { color: "#e5e5e5", textAlign: "right", maxWidth: "55%" },
    notesBox:   { background: "#0f0f0f", border: "1px solid #1e1e1e", borderRadius: 8, padding: "10px 12px", fontSize: 13, color: "#aaa", lineHeight: 1.7 },
  };

  const analyzeSymptom = async () => {
    if (!symptom.trim()) return;
    setIsAnalyzing(true); setAnalysis(null); setVerdict(null); setExpanded(null); setAnalyzeError(null);
    try {
      const result = await callClaude(`You are an expert troubleshooting engineer for building systems. Analyze this symptom for a ${systemType.toUpperCase()} system.

SYMPTOM: "${symptom}"

Generate exactly 3 likely root causes ordered by probability. For each root cause provide all fields below.

Return ONLY valid JSON, no markdown, no explanation:
{
  "root_causes": [
    {
      "id": 1,
      "title": "short technical title",
      "description": "detailed description of why this causes the symptom",
      "confidence": 75,
      "severity": "high",
      "evidence": {
        "check": "what to physically check or measure",
        "expected_result": "what a normal reading/state looks like",
        "tools_needed": ["tool1", "tool2"]
      },
      "solution": {
        "summary": "one-sentence fix",
        "steps": ["step 1", "step 2", "step 3"],
        "estimated_time": "30 min",
        "parts_needed": ["part1"]
      }
    }
  ]
}

Focus on practical real-world troubleshooting for ${sys?.detail || systemType}. Severity must be one of: critical, high, medium, low.`);
      setAnalysis(result);
    } catch (e) {
      setAnalyzeError(e.message === "NO_KEY" ? "no_key" : "api_error");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const addReading = (label, unit) => {
    if (!label.trim()) return;
    setReadings(prev => [...prev, { label, unit, value: "" }]);
  };

  const analyzeReadings = async () => {
    if (!analysis?.root_causes || !readings.some(r => r.value)) return;
    setIsVerdict(true); setVerdict(null);
    const readingsSummary = readings.filter(r => r.value).map(r => `${r.label}: ${r.value}${r.unit ? " " + r.unit : ""}`).join("\n");
    const rcSummary = analysis.root_causes.map((rc, i) => `Root Cause #${i+1} (${rc.confidence}% confidence): ${rc.title} — ${rc.description}`).join("\n");
    try {
      const result = await callClaude(`You are an expert troubleshooting engineer for ${systemType.toUpperCase()} systems.

A technician entered field measurements. Evaluate them against the 3 root causes and determine if each is confirmed, rejected, or inconclusive.

SYMPTOM: "${symptom}"

ROOT CAUSES:
${rcSummary}

TECHNICIAN READINGS:
${readingsSummary}

Return ONLY valid JSON, no markdown:
{
  "summary": "overall interpretation of the readings",
  "pathways": [
    {
      "root_cause_title": "title",
      "status": "confirmed",
      "reasoning": "why this status based on the readings",
      "confidence_before": 75,
      "confidence_after": 90,
      "next_step": "what the tech should do next",
      "flagged_readings": [
        { "label": "reading name", "measured": "120V", "expected": "240V", "anomaly": true }
      ]
    }
  ]
}`);
      setVerdict(result);
    } catch { /* silently fail */ } finally { setIsVerdict(false); }
  };

  const topCause = analysis?.root_causes?.[0];

  return (
    <div style={st.page}>
      {/* Header */}
      <div style={st.logo}>⚡ It's Broken!</div>
      <div style={st.title}>S.E.R.C.S.</div>
      <div style={st.subtitle}>Symptom · Evidence · Root Cause · Solution</div>

      {/* API Key missing */}
      {analyzeError === "no_key" && (
        <div style={{ background: "#1a0a00", border: "1px solid #f9731644", borderRadius: 8, padding: "12px 14px", marginBottom: 16, fontSize: 12, color: "#f97316", lineHeight: 1.6 }}>
          ⚠ No API key found. Add your Anthropic API key to <code style={{ color: "#e5e5e5" }}>.env</code>:<br />
          <code style={{ color: "#e5e5e5" }}>VITE_ANTHROPIC_API_KEY=sk-ant-...</code><br />
          Then restart the dev server.
        </div>
      )}
      {analyzeError === "api_error" && (
        <div style={{ background: "#450a0a", border: "1px solid #ef444444", borderRadius: 8, padding: "12px 14px", marginBottom: 16, fontSize: 12, color: "#ef4444" }}>
          ⚠ API call failed. Check your key and network connection.
        </div>
      )}

      {/* System type selector */}
      <div style={st.sysRow}>
        {SYSTEM_TYPES.map(s => (
          <button key={s.id} style={st.sysBtn(systemType === s.id, s.color)} onClick={() => { setSystemType(s.id); setAnalysis(null); setVerdict(null); }}>
            {s.icon} {s.label}
          </button>
        ))}
      </div>

      {/* Symptom input */}
      <div style={{ marginBottom: 4 }}>
        <label style={st.label}>Describe the symptom</label>
        <textarea
          style={st.textarea}
          placeholder={`e.g. ${systemType === "electrical" ? "Circuit breaker trips immediately when HVAC unit starts" : systemType === "hvac" ? "Unit runs but supply air temp never drops below 68°F" : systemType === "plumbing" ? "Low water pressure throughout building, second floor only" : "Describe what's wrong..."}`}
          value={symptom}
          onChange={e => setSymptom(e.target.value)}
          onKeyDown={e => e.key === "Enter" && e.ctrlKey && analyzeSymptom()}
        />
      </div>
      <button style={{ ...st.btn, opacity: isAnalyzing || !symptom.trim() ? 0.6 : 1 }} onClick={analyzeSymptom} disabled={isAnalyzing || !symptom.trim()}>
        {isAnalyzing ? "⟳ Analyzing..." : "Analyze Symptom"}
      </button>

      {/* Loading */}
      {isAnalyzing && (
        <div style={{ textAlign: "center", padding: "40px 0", color: "#555" }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>⟳</div>
          <div style={{ fontSize: 13 }}>Generating root cause hypotheses...</div>
          <div style={{ fontSize: 11, marginTop: 4, color: "#333" }}>Analyzing symptom patterns</div>
        </div>
      )}

      {/* Root causes */}
      {analysis?.root_causes && !isAnalyzing && (
        <>
          <div style={st.sectionLbl}>Root Cause Analysis — {sys?.icon} {sys?.label}</div>
          {analysis.root_causes.map((rc, i) => {
            const sev = rc.severity?.toLowerCase() || "medium";
            const isOpen = expanded === i;
            return (
              <div key={i} style={st.card}>
                <div style={st.cardHead(SEVERITY_COLOR[sev] || "#f97316")} onClick={() => setExpanded(isOpen ? null : i)}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 8 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#f5f5f5", flex: 1 }}>#{i+1} {rc.title}</div>
                    <span style={st.badge(sev)}>{sev}</span>
                  </div>
                  <div style={{ fontSize: 12, color: "#888", marginBottom: 10, lineHeight: 1.5 }}>{rc.description}</div>
                  {/* Confidence bar */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ flex: 1, height: 4, background: "#1a1a1a", borderRadius: 2, overflow: "hidden" }}>
                      <div style={{ width: `${rc.confidence}%`, height: "100%", background: SEVERITY_COLOR[sev] || "#f97316", borderRadius: 2, transition: "width 0.6s ease" }} />
                    </div>
                    <span style={{ fontSize: 11, color: SEVERITY_COLOR[sev] || "#f97316", fontWeight: 700 }}>{rc.confidence}%</span>
                    <span style={{ fontSize: 10, color: "#333" }}>{isOpen ? "▲" : "▼"}</span>
                  </div>
                </div>

                {/* Expandable detail */}
                {isOpen && (
                  <div style={{ padding: "0 14px 14px" }}>
                    {/* Evidence */}
                    <div style={{ fontSize: 10, letterSpacing: "0.15em", color: "#3b82f6", textTransform: "uppercase", marginBottom: 8, marginTop: 4 }}>Evidence</div>
                    {rc.evidence?.check && <div style={st.row}><span style={st.rowLbl}>Check</span><span style={st.rowVal}>{rc.evidence.check}</span></div>}
                    {rc.evidence?.expected_result && <div style={st.row}><span style={st.rowLbl}>Expected</span><span style={st.rowVal}>{rc.evidence.expected_result}</span></div>}
                    {rc.evidence?.tools_needed?.length > 0 && (
                      <div style={{ ...st.row, borderBottom: "none" }}>
                        <span style={st.rowLbl}>Tools</span>
                        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", justifyContent: "flex-end" }}>
                          {rc.evidence.tools_needed.map((t, ti) => <span key={ti} style={st.tag}>{t}</span>)}
                        </div>
                      </div>
                    )}

                    {/* Solution */}
                    <div style={{ fontSize: 10, letterSpacing: "0.15em", color: "#22c55e", textTransform: "uppercase", marginBottom: 8, marginTop: 14 }}>Solution</div>
                    {rc.solution?.summary && <div style={{ fontSize: 13, color: "#e5e5e5", marginBottom: 10, lineHeight: 1.5 }}>{rc.solution.summary}</div>}
                    {rc.solution?.steps?.length > 0 && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 10 }}>
                        {rc.solution.steps.map((step, si) => (
                          <div key={si} style={{ display: "flex", gap: 8, fontSize: 12, color: "#aaa", lineHeight: 1.5 }}>
                            <span style={{ color: "#f97316", fontWeight: 700, flexShrink: 0 }}>{si+1}.</span>
                            <span>{step}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {rc.solution?.estimated_time && <span style={st.tag}>⏱ {rc.solution.estimated_time}</span>}
                      {rc.solution?.parts_needed?.map((p, pi) => <span key={pi} style={st.tag}>{p}</span>)}
                    </div>

                    {/* Log as Repair */}
                    <button style={{ ...st.btnSm, marginTop: 14, width: "100%" }} onClick={() => onLogRepair({
                      problem: symptom,
                      description: rc.description,
                      category: sys?.label || "",
                      notes: `Root Cause: ${rc.title}\n\nSolution:\n${rc.solution?.steps?.map((s, i) => `${i+1}. ${s}`).join("\n") || rc.solution?.summary || ""}`,
                      priority: rc.severity === "critical" ? "emergency" : rc.severity === "high" ? "high" : rc.severity === "low" ? "low" : "medium",
                    })}>
                      Log as Repair ↗
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {/* Field Readings Panel */}
          <div style={st.sectionLbl}>Field Measurements</div>
          <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 10, padding: "14px" }}>
            {/* Suggested readings */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 12 }}>
              {suggestions.map((s, i) => {
                const already = readings.some(r => r.label === s.label);
                return (
                  <button key={i} style={{ ...st.tag, cursor: "pointer", background: already ? "#1e3a1e" : "#1a1a1a", color: already ? "#22c55e" : "#999", border: `1px solid ${already ? "#22c55e44" : "transparent"}` }}
                    onClick={() => !already && addReading(s.label, s.unit)}>
                    {already ? "✓ " : "+ "}{s.label}
                  </button>
                );
              })}
            </div>

            {/* Readings list */}
            {readings.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 10 }}>
                {readings.map((r, i) => (
                  <div key={i} style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <span style={{ fontSize: 12, color: "#aaa", flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.label}</span>
                    <input
                      style={{ ...st.input, width: 80, flex: "none", padding: "6px 8px" }}
                      placeholder="value"
                      value={r.value}
                      onChange={e => setReadings(prev => prev.map((rd, ri) => ri === i ? { ...rd, value: e.target.value } : rd))}
                    />
                    {r.unit && <span style={{ fontSize: 11, color: "#555", width: 30, flexShrink: 0 }}>{r.unit}</span>}
                    <button onClick={() => setReadings(prev => prev.filter((_, ri) => ri !== i))} style={{ background: "none", border: "none", color: "#ef444466", fontSize: 14, cursor: "pointer", fontFamily: "inherit", flexShrink: 0 }}>✕</button>
                  </div>
                ))}
              </div>
            )}

            {/* Add custom reading */}
            {showAddReading ? (
              <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                <input style={{ ...st.input, flex: 2 }} placeholder="Label" value={customLabel} onChange={e => setCustomLabel(e.target.value)} autoFocus />
                <input style={{ ...st.input, flex: 1, minWidth: 0 }} placeholder="Unit" value={customUnit} onChange={e => setCustomUnit(e.target.value)} />
                <button style={st.btnSm} onClick={() => { addReading(customLabel, customUnit); setCustomLabel(""); setCustomUnit(""); setShowAddReading(false); }}>Add</button>
                <button style={st.btnOut} onClick={() => setShowAddReading(false)}>✕</button>
              </div>
            ) : (
              <button style={st.btnOut} onClick={() => setShowAddReading(true)}>+ Custom reading</button>
            )}

            {readings.some(r => r.value) && (
              <button style={{ ...st.btn, marginTop: 12, opacity: isVerdict ? 0.6 : 1 }} onClick={analyzeReadings} disabled={isVerdict}>
                {isVerdict ? "⟳ Analyzing readings..." : "Analyze Readings"}
              </button>
            )}
          </div>

          {/* Verdict */}
          {verdict && (
            <>
              <div style={st.sectionLbl}>Verdict</div>
              <div style={st.notesBox}>{verdict.summary}</div>
              {verdict.pathways?.map((p, i) => {
                const statusColor = p.status === "confirmed" ? "#22c55e" : p.status === "rejected" ? "#ef4444" : "#f97316";
                const statusBg    = p.status === "confirmed" ? "#052e16" : p.status === "rejected" ? "#450a0a" : "#431407";
                const delta = (p.confidence_after || 0) - (p.confidence_before || 0);
                return (
                  <div key={i} style={{ ...st.card, marginTop: 8 }}>
                    <div style={{ borderLeft: `3px solid ${statusColor}`, padding: "12px 14px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#f5f5f5", flex: 1 }}>{p.root_cause_title}</span>
                        <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, background: statusBg, color: statusColor, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>{p.status}</span>
                      </div>
                      <div style={{ fontSize: 12, color: "#888", marginBottom: 8, lineHeight: 1.5 }}>{p.reasoning}</div>
                      <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 11, color: "#555" }}>Confidence: {p.confidence_before}% → <span style={{ color: statusColor, fontWeight: 700 }}>{p.confidence_after}%</span></span>
                        {delta !== 0 && <span style={{ fontSize: 11, color: delta > 0 ? "#22c55e" : "#ef4444" }}>{delta > 0 ? "▲" : "▼"} {Math.abs(delta)}%</span>}
                      </div>
                      {p.flagged_readings?.filter(fr => fr.anomaly).map((fr, fi) => (
                        <div key={fi} style={{ background: "#450a0a22", border: "1px solid #ef444422", borderRadius: 6, padding: "6px 10px", marginBottom: 4, fontSize: 11 }}>
                          ⚠ <span style={{ color: "#e5e5e5" }}>{fr.label}</span> — measured: <span style={{ color: "#ef4444" }}>{fr.measured}</span>, expected: <span style={{ color: "#22c55e" }}>{fr.expected}</span>
                        </div>
                      ))}
                      {p.next_step && <div style={{ fontSize: 12, color: "#f97316", marginTop: 6 }}>→ {p.next_step}</div>}
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </>
      )}
    </div>
  );
}
