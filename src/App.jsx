import { useState, useEffect } from "react";

/* ============================================================
   TaleemDesk — Pakistan School Lesson Planner & Documents Generator
   SEO-friendly name: "TaleemDesk" (taleem = education)
   Built for Pakistani schools: PCTB / SNC aligned, BISE boards
   ============================================================ */

// ---------- DATA: Boards of Examination (official sources) ----------
const BOARDS = [
  { name: "BISE Lahore", region: "Punjab", url: "https://biselahore.com" },
  { name: "BISE Gujranwala", region: "Punjab", url: "https://bisegrw.edu.pk" },
  { name: "BISE Rawalpindi", region: "Punjab", url: "https://biserwp.edu.pk" },
  { name: "BISE Faisalabad", region: "Punjab", url: "https://bisefsd.edu.pk" },
  { name: "BISE Multan", region: "Punjab", url: "https://bisemultan.edu.pk" },
  { name: "BISE Sargodha", region: "Punjab", url: "https://bisesargodha.edu.pk" },
  { name: "BISE Bahawalpur", region: "Punjab", url: "https://bisebwp.edu.pk" },
  { name: "BISE DG Khan", region: "Punjab", url: "https://bisedgkhan.edu.pk" },
  { name: "BISE Sahiwal", region: "Punjab", url: "https://bisesahiwal.edu.pk" },
  { name: "PEC (Punjab Examination Commission)", region: "Punjab — Grades 5 & 8", url: "https://pec.edu.pk" },
  { name: "FBISE (Federal Board)", region: "Federal", url: "https://fbise.edu.pk" },
  { name: "AKU-EB (Aga Khan Board)", region: "National", url: "https://examinationboard.aku.edu" },
  { name: "Cambridge International (CAIE)", region: "O/A Levels", url: "https://www.cambridgeinternational.org" },
];

// ---------- DATA: Textbook / Curriculum Sources ----------
const TEXTBOOK_SOURCES = [
  { name: "Punjab Curriculum & Textbook Board (PCTB)", note: "Official free PDF textbooks for all grades", url: "https://pctb.punjab.gov.pk" },
  { name: "National Book Foundation (NBF)", note: "Federal / SNC model textbooks", url: "https://www.nbf.org.pk" },
  { name: "National Curriculum of Pakistan (SNC / NCP 2022-23)", note: "Curriculum standards & SLOs", url: "https://www.mofept.gov.pk" },
  { name: "EAST Education", note: "Textbook series, teacher guides & school improvement programmes", url: "https://east.education" },
  { name: "Oxford University Press Pakistan", note: "Private school series (English medium)", url: "https://oup.com.pk" },
  { name: "AFAQ (Sun Series / Iqbal Series)", note: "Popular private school textbooks", url: "https://afaq.edu.pk" },
];

const TEXTBOOKS = [
  "PCTB (Punjab Textbook Board)",
  "NBF (National Book Foundation)",
  "EAST Education Series",
  "Oxford University Press Pakistan",
  "AFAQ Sun Series",
  "AFAQ Iqbal Series",
  "School's own syllabus / notes",
];

const GRADES = [
  "Playgroup", "Nursery", "Prep / KG",
  "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5",
  "Grade 6", "Grade 7", "Grade 8",
  "Grade 9 (Matric Part I)", "Grade 10 (Matric Part II)",
];

const SUBJECTS = [
  "English", "Urdu", "Mathematics", "Science", "General Knowledge",
  "Islamiyat", "Nazra Quran", "Social Studies", "Pakistan Studies",
  "Computer Science", "Arts & Crafts", "Tarbiyah / Akhlaqiyat",
];

const LANGUAGES = ["English", "Urdu", "Bilingual (English + Urdu)"];

// ---------- DATA: School Documents (grouped — real Pakistani school needs) ----------
const DOC_GROUPS = {
  "📜 Certificates": [
    "Student Character Certificate",
    "School Leaving Certificate (SLC)",
    "Bonafide / Student Verification Certificate",
    "Appreciation Certificate (Student)",
    "Hifz / Nazra Quran Completion Certificate",
    "Teacher Experience Certificate",
    "Provisional Certificate (Result Awaited)",
  ],
  "👨‍👩‍👧 Parent Communication": [
    "Parent Notice / Circular (والدین کے نام نوٹس)",
    "Fee Reminder Notice",
    "Late Fee / Final Fee Notice",
    "PTM (Parent-Teacher Meeting) Invitation",
    "Event Invitation (Result Day / Milad / Sports Day)",
    "Homework Diary Note",
    "Admission Confirmation Letter",
    "Complaint Response Letter (to Parent)",
    "Student Absence Inquiry Letter",
    "Summer / Winter Vacation Notice + Task Pack Note",
  ],
  "🧑‍🏫 Staff & HR": [
    "Teacher Appointment Letter",
    "Job Offer Letter",
    "Leave Application (Staff)",
    "Warning / Improvement Letter (Staff)",
    "Salary Slip Format",
    "Staff Meeting Agenda & Minutes",
    "Duty Roster (Exam / Morning Assembly / Gate)",
    "Teacher Classroom Observation Report",
    "Staff Resignation Acceptance Letter",
    "Annual Staff Performance Appraisal Form",
  ],
  "📝 Academic & Exams": [
    "Weekly Timetable",
    "Monthly Syllabus Breakup (Date-wise)",
    "Exam Date Sheet Notice",
    "Roll Number Slip / Admit Card",
    "Question Paper (Board Pattern)",
    "Result Card Remarks (per student)",
    "Student Progress Report (Term-wise)",
    "Class Test Record Sheet",
    "Remedial / Weak Student Improvement Plan",
  ],
  "🏢 Office & Records": [
    "Admission Form (Complete)",
    "Fee Challan / Voucher Format",
    "Student Withdrawal / Transfer Record",
    "Incident / Accident Report",
    "Student Pick-up Authority Letter (Security)",
    "School Inventory / Stock Register Format",
    "Daily Attendance Summary (Office Copy)",
    "School Policy Document (Discipline / Uniform / Mobile)",
  ],
};
const DOC_TYPES = Object.values(DOC_GROUPS).flat();

// ---------- tiny markdown renderer ----------
function renderMD(text) {
  const lines = text.split("\n");
  const out = [];
  let listBuf = [];
  const flushList = (key) => {
    if (listBuf.length) {
      out.push(
        <ul key={"ul" + key} style={{ margin: "6px 0 12px", paddingInlineStart: 24 }}>
          {listBuf.map((li, i) => (
            <li key={i} style={{ marginBottom: 4 }}>{inline(li)}</li>
          ))}
        </ul>
      );
      listBuf = [];
    }
  };
  const inline = (s) => {
    const parts = s.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((p, i) =>
      p.startsWith("**") && p.endsWith("**") ? <strong key={i}>{p.slice(2, -2)}</strong> : p
    );
  };
  lines.forEach((raw, idx) => {
    const line = raw.replace(/\r/g, "");
    if (/^\s*[-•]\s+/.test(line)) {
      listBuf.push(line.replace(/^\s*[-•]\s+/, ""));
      return;
    }
    flushList(idx);
    if (/^###\s+/.test(line)) out.push(<h4 key={idx} className="td-h4">{inline(line.replace(/^###\s+/, ""))}</h4>);
    else if (/^##\s+/.test(line)) out.push(<h3 key={idx} className="td-h3">{inline(line.replace(/^##\s+/, ""))}</h3>);
    else if (/^#\s+/.test(line)) out.push(<h2 key={idx} className="td-h2">{inline(line.replace(/^#\s+/, ""))}</h2>);
    else if (/^---+$/.test(line.trim())) out.push(<hr key={idx} className="td-hr" />);
    else if (line.trim() === "") out.push(<div key={idx} style={{ height: 8 }} />);
    else out.push(<p key={idx} style={{ margin: "2px 0" }}>{inline(line)}</p>);
  });
  flushList("end");
  return out;
}

// ---------- Claude API ----------
// ---------- Calls our own secure backend (/api/generate.js) ----------
// The Anthropic API key lives only on the server (Vercel env variable).
async function askClaude(prompt) {
  const res = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Generation failed");
  return data.text;
}

export default function TaleemDesk() {
  const [tab, setTab] = useState("lesson");
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  // Lesson planner state
  const [lp, setLp] = useState({
    school: "Ghazali Junior Campus Phalia",
    grade: "Grade 3",
    subject: "English",
    board: "BISE Gujranwala",
    textbook: "PCTB (Punjab Textbook Board)",
    topic: "",
    duration: "40 minutes",
    language: "Bilingual (English + Urdu)",
  });

  // Document generator state
  const [doc, setDoc] = useState({
    school: "Ghazali Junior Campus Phalia",
    docType: DOC_TYPES[0],
    grade: "Grade 3",
    board: "BISE Gujranwala",
    language: "Bilingual (English + Urdu)",
    details: "",
  });

  useEffect(() => {
    const l = document.createElement("link");
    l.rel = "stylesheet";
    l.href =
      "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,700;9..144,900&family=Inter:wght@400;500;600;700&family=Noto+Nastaliq+Urdu:wght@400;600&display=swap";
    document.head.appendChild(l);
    return () => document.head.removeChild(l);
  }, []);

  const generateLesson = async () => {
    if (!lp.topic.trim()) { setError("Please write the topic / chapter name first."); return; }
    setError(""); setLoading(true); setOutput("");
    try {
      const text = await askClaude(
        `You are an expert Pakistani school academic coordinator. Create a professional, classroom-ready lesson plan.

School: ${lp.school}
Class: ${lp.grade} | Subject: ${lp.subject}
Examination Board alignment: ${lp.board}
Textbook: ${lp.textbook}
Topic / Chapter: ${lp.topic}
Period duration: ${lp.duration}
Language of plan: ${lp.language}

Follow National Curriculum of Pakistan (SNC) style with clear SLOs (Student Learning Outcomes).
Structure (use markdown headings ## and ### and bullet lists with -):
## Lesson Plan header (school, class, subject, topic, date line, duration)
## Student Learning Outcomes (SLOs)
## Resources / AV Aids (low-cost, realistic for Pakistani classrooms)
## Warm-up (5 min)
## Teaching Method (step-by-step, with board work)
## Student Activity (pair/group work)
## Assessment / Oral Questions
## Homework
## Teacher Self-Reflection line
If language is Bilingual, write key instructions in English with Urdu support phrases in brackets. Keep it practical, no fluff.`
      );
      setOutput(text);
    } catch (e) { setError("Generation failed. Please try again."); }
    setLoading(false);
  };

  const generateDoc = async () => {
    setError(""); setLoading(true); setOutput("");
    try {
      const text = await askClaude(
        `You are the senior administrative officer of a Pakistani school with 20 years of experience. Draft this official school document, fully formatted and ready to print.

School: ${doc.school}
Document type: ${doc.docType}
Class (if relevant): ${doc.grade}
Examination Board (if relevant): ${doc.board}
Language: ${doc.language}
Specific details from principal: ${doc.details || "Use sensible placeholders like [Date], [Student Name], [Roll No.] where details are missing."}

Rules:
- Use proper Pakistani school format: school name line, Ref No. ____, Date ____, subject line, body, signature block (Principal / Coordinator).
- For question papers: follow the ${doc.board} paper pattern (objective + subjective sections, marks distribution).
- For forms, timetables, challans, registers and record sheets: build them as clear labelled sections with blank lines (______) and rows, so they print as fill-in forms.
- If language is Urdu or Bilingual, write the Urdu portions in proper formal Urdu (دفتری اردو).
- Use markdown: ## for the document title, ### for sections, bold (**) for labels, - for lists.
- Keep tone respectful and formal, as used in Punjab schools. No extra commentary — output the document only.`
      );
      setOutput(text);
    } catch (e) { setError("Generation failed. Please try again."); }
    setLoading(false);
  };

  const copyOut = async () => {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true); setTimeout(() => setCopied(false), 1500);
    } catch (e) {}
  };

  const printOut = () => {
    const w = window.open("", "_blank");
    w.document.write(`<html><head><title>TaleemDesk Document</title>
      <style>body{font-family:Georgia,serif;max-width:760px;margin:40px auto;line-height:1.6;color:#1C2520}
      h2,h3{color:#134E33} hr{border:none;border-top:1px solid #999}</style></head>
      <body><pre style="white-space:pre-wrap;font-family:Georgia,serif">${output
        .replace(/&/g, "&amp;").replace(/</g, "&lt;")}</pre>
      <script>window.print()</script></body></html>`);
    w.document.close();
  };

  const field = (label, el) => (
    <label className="td-field">
      <span className="td-label">{label}</span>
      {el}
    </label>
  );

  const sel = (value, onChange, options) => (
    <select className="td-input" value={value} onChange={(e) => onChange(e.target.value)}>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );

  return (
    <div className="td-root">
      <style>{`
        .td-root{min-height:100vh;background:#EFEAE0;font-family:'Inter',system-ui,sans-serif;color:#1C2520}
        .td-mast{background:linear-gradient(180deg,#11472F 0%,#134E33 60%,#0F4029 100%);color:#F4EFE3;
          padding:26px 20px 22px;border-bottom:6px double #B98A2F;position:relative;overflow:hidden}
        .td-mast::after{content:"";position:absolute;inset:0;background:
          repeating-linear-gradient(115deg,rgba(255,255,255,.025) 0 2px,transparent 2px 9px);pointer-events:none}
        .td-mastin{max-width:1100px;margin:0 auto;display:flex;align-items:center;gap:16px;flex-wrap:wrap}
        .td-logo{width:54px;height:54px;border:2px solid #B98A2F;border-radius:50%;display:flex;align-items:center;
          justify-content:center;font-family:'Fraunces',serif;font-weight:900;font-size:24px;color:#E9D9A8;flex-shrink:0}
        .td-title{font-family:'Fraunces',serif;font-weight:900;font-size:clamp(26px,4vw,38px);letter-spacing:.5px;line-height:1}
        .td-sub{font-size:13px;opacity:.85;margin-top:5px;display:flex;gap:10px;align-items:center;flex-wrap:wrap}
        .td-urdu{font-family:'Noto Nastaliq Urdu',serif;font-size:15px;color:#E9D9A8}
        .td-tabs{max-width:1100px;margin:0 auto;display:flex;gap:6px;padding:14px 20px 0;flex-wrap:wrap}
        .td-tab{border:1px solid #C8BFA8;background:#F8F4EA;padding:10px 18px;border-radius:8px 8px 0 0;cursor:pointer;
          font-weight:600;font-size:14px;color:#4A5248;border-bottom:none}
        .td-tab.on{background:#fff;color:#134E33;border-color:#134E33;box-shadow:inset 0 3px 0 #B98A2F}
        .td-main{max-width:1100px;margin:0 auto;padding:0 20px 50px;display:grid;grid-template-columns:380px 1fr;gap:22px}
        @media(max-width:860px){.td-main{grid-template-columns:1fr}}
        .td-panel{background:#fff;border:1px solid #D7CFBC;border-radius:0 10px 10px 10px;padding:20px}
        .td-field{display:block;margin-bottom:13px}
        .td-label{display:block;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#134E33;margin-bottom:5px}
        .td-input{width:100%;padding:9px 11px;border:1px solid #C8BFA8;border-radius:7px;font-size:14px;font-family:inherit;
          background:#FDFCF8;color:#1C2520;box-sizing:border-box}
        .td-input:focus{outline:2px solid #B98A2F;border-color:#B98A2F}
        textarea.td-input{resize:vertical;min-height:74px}
        .td-btn{width:100%;padding:13px;background:#134E33;color:#F4EFE3;border:none;border-radius:8px;font-size:15px;
          font-weight:700;cursor:pointer;font-family:inherit;letter-spacing:.02em}
        .td-btn:hover{background:#0F4029}
        .td-btn:disabled{opacity:.6;cursor:wait}
        /* signature: Pakistani school copy page — blue rules + red margin */
        .td-copy{background:#fff;border:1px solid #D7CFBC;border-radius:10px;min-height:480px;position:relative;
          padding:28px 28px 28px 64px;line-height:1.7;font-size:14.5px;
          background-image:
            linear-gradient(90deg,transparent 44px,#D95B43 44px,#D95B43 45.5px,transparent 45.5px),
            repeating-linear-gradient(#fff 0 27px,#C7D8E8 27px 28px);
          background-attachment:local}
        .td-h2{font-family:'Fraunces',serif;color:#134E33;font-size:21px;margin:6px 0 8px;border-bottom:2px solid #B98A2F;
          display:inline-block;padding-bottom:2px}
        .td-h3{font-family:'Fraunces',serif;color:#134E33;font-size:17px;margin:12px 0 4px}
        .td-h4{color:#0F4029;font-size:15px;margin:10px 0 3px}
        .td-hr{border:none;border-top:1px dashed #B98A2F;margin:12px 0}
        .td-empty{color:#8A8474;font-style:italic;display:flex;flex-direction:column;gap:6px;align-items:center;
          justify-content:center;min-height:380px;text-align:center}
        .td-actions{display:flex;gap:8px;margin-bottom:10px;flex-wrap:wrap}
        .td-mini{padding:8px 14px;border:1px solid #134E33;background:#fff;color:#134E33;border-radius:7px;font-size:13px;
          font-weight:600;cursor:pointer;font-family:inherit}
        .td-mini:hover{background:#F0F5F1}
        .td-err{background:#FBEDE9;border:1px solid #D95B43;color:#8C2F1B;padding:10px 12px;border-radius:7px;
          font-size:13px;margin-bottom:12px}
        .td-srcgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(290px,1fr));gap:12px}
        .td-src{background:#fff;border:1px solid #D7CFBC;border-left:4px solid #134E33;border-radius:8px;padding:14px 16px}
        .td-src h4{margin:0 0 3px;font-size:15px;color:#134E33}
        .td-src p{margin:0 0 6px;font-size:13px;color:#4A5248}
        .td-src a{color:#B98A2F;font-size:13px;font-weight:600;text-decoration:none;word-break:break-all}
        .td-src a:hover{text-decoration:underline}
        .td-spin{width:34px;height:34px;border:3px solid #C7D8E8;border-top-color:#134E33;border-radius:50%;
          animation:tdspin .8s linear infinite;margin:0 auto 10px}
        @keyframes tdspin{to{transform:rotate(360deg)}}
        @media (prefers-reduced-motion: reduce){.td-spin{animation-duration:2s}}
      `}</style>

      {/* Masthead */}
      <header className="td-mast">
        <div className="td-mastin">
          <div className="td-logo">ت</div>
          <div>
            <div className="td-title">TaleemDesk</div>
            <div className="td-sub">
              <span>Pakistan School Lesson Planner &amp; Documents Generator</span>
              <span className="td-urdu">سبق منصوبہ ساز و دستاویزات</span>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <nav className="td-tabs" role="tablist">
        {[
          ["lesson", "📘 Lesson Planner"],
          ["docs", "📄 School Documents"],
          ["sources", "🏛️ Boards & Textbooks"],
        ].map(([id, label]) => (
          <button key={id} role="tab" aria-selected={tab === id}
            className={"td-tab" + (tab === id ? " on" : "")}
            onClick={() => { setTab(id); setOutput(""); setError(""); }}>
            {label}
          </button>
        ))}
      </nav>

      {/* Sources tab */}
      {tab === "sources" ? (
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 20px 50px" }}>
          <div className="td-panel" style={{ borderRadius: "0 10px 10px 10px" }}>
            <h2 className="td-h2">Boards of Examination (Official Sources)</h2>
            <div className="td-srcgrid" style={{ marginTop: 14, marginBottom: 26 }}>
              {BOARDS.map((b) => (
                <div className="td-src" key={b.name}>
                  <h4>{b.name}</h4>
                  <p>{b.region}</p>
                  <a href={b.url} target="_blank" rel="noreferrer">{b.url.replace("https://", "")} ↗</a>
                </div>
              ))}
            </div>
            <h2 className="td-h2">Textbook &amp; Curriculum Sources</h2>
            <div className="td-srcgrid" style={{ marginTop: 14 }}>
              {TEXTBOOK_SOURCES.map((t) => (
                <div className="td-src" key={t.name} style={{ borderLeftColor: "#B98A2F" }}>
                  <h4>{t.name}</h4>
                  <p>{t.note}</p>
                  <a href={t.url} target="_blank" rel="noreferrer">{t.url.replace("https://", "").replace("www.", "")} ↗</a>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <main className="td-main">
          {/* FORM PANEL */}
          <section className="td-panel">
            {tab === "lesson" ? (
              <>
                {field("School Name", <input className="td-input" value={lp.school} onChange={(e) => setLp({ ...lp, school: e.target.value })} />)}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {field("Class / Grade", sel(lp.grade, (v) => setLp({ ...lp, grade: v }), GRADES))}
                  {field("Subject", sel(lp.subject, (v) => setLp({ ...lp, subject: v }), SUBJECTS))}
                </div>
                {field("Examination Board", sel(lp.board, (v) => setLp({ ...lp, board: v }), BOARDS.map((b) => b.name)))}
                {field("Textbook", sel(lp.textbook, (v) => setLp({ ...lp, textbook: v }), TEXTBOOKS))}
                {field("Topic / Chapter Name *", <input className="td-input" placeholder="e.g. Unit 4 — My Neighbourhood" value={lp.topic} onChange={(e) => setLp({ ...lp, topic: e.target.value })} />)}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {field("Period Duration", sel(lp.duration, (v) => setLp({ ...lp, duration: v }), ["30 minutes", "35 minutes", "40 minutes", "45 minutes", "60 minutes"]))}
                  {field("Language", sel(lp.language, (v) => setLp({ ...lp, language: v }), LANGUAGES))}
                </div>
                {error && <div className="td-err">{error}</div>}
                <button className="td-btn" onClick={generateLesson} disabled={loading}>
                  {loading ? "Preparing lesson plan…" : "Generate Lesson Plan"}
                </button>
              </>
            ) : (
              <>
                {field("School Name", <input className="td-input" value={doc.school} onChange={(e) => setDoc({ ...doc, school: e.target.value })} />)}
                {field("Document Type",
                  <select className="td-input" value={doc.docType} onChange={(e) => setDoc({ ...doc, docType: e.target.value })}>
                    {Object.entries(DOC_GROUPS).map(([group, items]) => (
                      <optgroup key={group} label={group}>
                        {items.map((o) => <option key={o} value={o}>{o}</option>)}
                      </optgroup>
                    ))}
                  </select>
                )}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {field("Class (if relevant)", sel(doc.grade, (v) => setDoc({ ...doc, grade: v }), GRADES))}
                  {field("Language", sel(doc.language, (v) => setDoc({ ...doc, language: v }), LANGUAGES))}
                </div>
                {field("Examination Board (for papers / date sheets)", sel(doc.board, (v) => setDoc({ ...doc, board: v }), BOARDS.map((b) => b.name)))}
                {field("Details (names, dates, reason…)",
                  <textarea className="td-input" placeholder="e.g. Summer vacation notice — school closes 1 June, reopens 14 August. Summer task pack will be given." value={doc.details} onChange={(e) => setDoc({ ...doc, details: e.target.value })} />)}
                {error && <div className="td-err">{error}</div>}
                <button className="td-btn" onClick={generateDoc} disabled={loading}>
                  {loading ? "Drafting document…" : "Generate Document"}
                </button>
              </>
            )}
          </section>

          {/* OUTPUT — school copy page */}
          <section>
            {output && (
              <div className="td-actions">
                <button className="td-mini" onClick={copyOut}>{copied ? "✓ Copied" : "Copy text"}</button>
                <button className="td-mini" onClick={printOut}>Print / Save PDF</button>
              </div>
            )}
            <div className="td-copy">
              {loading ? (
                <div className="td-empty">
                  <div className="td-spin" />
                  <span>Writing on the school copy…</span>
                </div>
              ) : output ? (
                renderMD(output)
              ) : (
                <div className="td-empty">
                  <span style={{ fontSize: 34 }}>✏️</span>
                  <span>Your {tab === "lesson" ? "lesson plan" : "document"} will appear here,<br />written on a fresh school copy page.</span>
                </div>
              )}
            </div>
          </section>
        </main>
      )}
    </div>
  );
}
