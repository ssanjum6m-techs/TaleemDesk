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

// ---------- tiny markdown renderer (headings, bold, lists, tables) ----------
function renderMD(text) {
  const lines = text.split("\n");
  const out = [];
  let listBuf = [];
  let tableBuf = [];
  const inline = (s) => {
    const parts = s.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((p, i) =>
      p.startsWith("**") && p.endsWith("**") ? <strong key={i}>{p.slice(2, -2)}</strong> : p
    );
  };
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
  const flushTable = (key) => {
    if (tableBuf.length) {
      const rows = tableBuf
        .map((r) => r.replace(/^\s*\|/, "").replace(/\|\s*$/, "").split("|").map((c) => c.trim()))
        .filter((cells) => !cells.every((c) => /^:?-{2,}:?$/.test(c)));
      if (rows.length) {
        out.push(
          <table key={"tb" + key} className="td-table">
            <thead>
              <tr>{rows[0].map((c, i) => <th key={i}>{inline(c)}</th>)}</tr>
            </thead>
            <tbody>
              {rows.slice(1).map((r, ri) => (
                <tr key={ri}>{r.map((c, ci) => <td key={ci}>{inline(c)}</td>)}</tr>
              ))}
            </tbody>
          </table>
        );
      }
      tableBuf = [];
    }
  };
  lines.forEach((raw, idx) => {
    const line = raw.replace(/\r/g, "");
    if (/^\s*\|.*\|\s*$/.test(line)) { flushList(idx); tableBuf.push(line); return; }
    flushTable(idx);
    if (/^\s*[-•]\s+/.test(line)) {
      listBuf.push(line.replace(/^\s*[-•]\s+/, ""));
      return;
    }
    flushList(idx);
    if (/^###\s+/.test(line)) out.push(<h4 key={idx} className="td-h4">{inline(line.replace(/^###\s+/, ""))}</h4>);
    else if (/^##\s+/.test(line)) out.push(<h3 key={idx} className="td-h3">{inline(line.replace(/^##\s+/, ""))}</h3>);
    else if (/^#\s+/.test(line)) out.push(<h2 key={idx} className="td-h2">{inline(line.replace(/^#\s+/, ""))}</h2>);
    else if (/^---+$/.test(line.trim())) out.push(<hr key={idx} className="td-hr" />);
    else if (/^✂/.test(line.trim())) out.push(<div key={idx} className="td-cut">✂ — — — — — — — — — — — — — — — — — — — — — —</div>);
    else if (line.trim() === "") out.push(<div key={idx} style={{ height: 8 }} />);
    else out.push(<p key={idx} style={{ margin: "2px 0" }}>{inline(line)}</p>);
  });
  flushList("end");
  flushTable("end");
  return out;
}

// ---------- Claude API ----------
// ---------- PREVIEW MODE: direct call (works inside Claude artifacts) ----------
async function askClaude(prompt) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1500,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  const data = await res.json();
  return (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n");
}

export default function TaleemDesk() {
  const [tab, setTab] = useState("lesson");
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [pdfBusy, setPdfBusy] = useState(false);
  const [certData, setCertData] = useState(null);
  const [logoUrl, setLogoUrl] = useState(null);
  const [signUrl, setSignUrl] = useState(null);
  const [padUrl, setPadUrl] = useState(null);

  // ---------- Professional format per document type ----------
  // Each category gets its real-world paper size, orientation and layout style.
  const docFormat = (t) => {
    if (/certificate/i.test(t))
      return { orient: "landscape", size: "a4", w: 1052, style: "certificate" };
    if (/(Timetable|Duty Roster|Syllabus Breakup|Record Sheet|Attendance Summary|Inventory|Stock Register)/i.test(t))
      return { orient: "landscape", size: "a4", w: 1052, style: "wide-table" };
    if (/(Roll Number|Admit Card|Homework Diary|Salary Slip)/i.test(t))
      return { orient: "portrait", size: "a5", w: 520, style: "compact-card" };
    if (/(Challan|Voucher)/i.test(t))
      return { orient: "portrait", size: "a4", w: 740, style: "challan-3-copies" };
    if (/(Admission Form|Appraisal Form|Withdrawal|Progress Report|Question Paper)/i.test(t))
      return { orient: "portrait", size: "a4", w: 740, style: "structured-form" };
    return { orient: "portrait", size: "a4", w: 740, style: "official-letter" };
  };
  const currentFormat = () =>
    tab === "lesson"
      ? { orient: "portrait", size: "a4", w: 740, style: "lesson-plan" }
      : docFormat(doc.docType);

  const readImg = (e, setter) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => setter(r.result);
    r.readAsDataURL(f);
  };

  const isCertType = (t) => /certificate/i.test(t);

  // ---------- Designed Certificate (green & gold TaleemDesk style) ----------
  const Certificate = ({ data, school, em }) => (
    <div className="td-cert" style={{ fontSize: em }}>
      <div className="td-certinner">
        <div className="td-certcorner tl" /><div className="td-certcorner tr" />
        <div className="td-certcorner bl" /><div className="td-certcorner br" />
        {logoUrl && <img className="td-certlogo" src={logoUrl} alt="School logo" />}
        <div className="td-certschool">{school}</div>
        <div className="td-certtitle">{data.title}</div>
        <div className="td-certrule" />
        <div className="td-certlead">This is to certify that</div>
        <div className="td-certname">{data.studentName}</div>
        <div className="td-certbody">{data.bodyText}</div>
        <div className="td-certdate">{data.dateLine}</div>
        <div className="td-certsigs">
          <div className="td-certsig">
            {signUrl && <img className="td-certsignimg" src={signUrl} alt="Signature" />}
            <div className="td-certsigline" />{data.principalName || "Principal"}<br /><span>Principal</span>
          </div>
          <div className="td-certseal">
            {logoUrl ? <img className="td-certseallogo" src={logoUrl} alt="" /> : "ت"}
          </div>
          <div className="td-certsig"><div className="td-certsigline" />______________<br /><span>Coordinator</span></div>
        </div>
      </div>
    </div>
  );

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
      "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,700;9..144,900&family=Inter:wght@400;500;600;700&family=Noto+Nastaliq+Urdu:wght@400;600&family=Great+Vibes&display=swap";
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
    setError(""); setLoading(true); setOutput(""); setCertData(null);
    try {
      if (isCertType(doc.docType)) {
        const raw = await askClaude(
          `You are a Pakistani school administrator. Create the text content for this certificate.

School: ${doc.school}
Certificate type: ${doc.docType}
Class: ${doc.grade}
Language: ${doc.language}
Details from principal: ${doc.details || "Use placeholders like [Student Name] where missing."}

Respond ONLY with a JSON object, no markdown, no backticks, no extra text:
{"title":"certificate heading in capital-style words","studentName":"the student or teacher name, or [Student Name]","bodyText":"2-3 elegant lines of certificate body text (mention class, session, conduct as relevant)","dateLine":"Given this [day] of [month], [year] OR with real date if provided","principalName":"principal name if given, else empty string"}
If language is Urdu or Bilingual, bodyText may include an Urdu line as well.`
        );
        const clean = raw.replace(/```json|```/g, "").trim();
        const data = JSON.parse(clean.slice(clean.indexOf("{"), clean.lastIndexOf("}") + 1));
        setCertData(data);
        setOutput("certificate"); // flag so action buttons appear
      } else {
        const fmt = docFormat(doc.docType);
        const formatRules = {
          "wide-table": "This document prints on LANDSCAPE A4. Present the main content as a proper markdown table (| Column | Column |) with a header row — wide layout, many columns are fine.",
          "compact-card": "This document prints on a SMALL A5 card. Keep it compact: short lines, a small markdown table for key details (Name, Class, Roll No., etc.), no long paragraphs.",
          "challan-3-copies": "Create THREE identical copies stacked vertically, labelled **Bank Copy**, **School Copy** and **Student Copy**. Separate each copy with a line starting with the ✂ character. Each copy: small markdown table with fee heads and amounts (Rs.), total, due date, bank details.",
          "structured-form": "Build this as a fill-in form: labelled sections with blank lines (______), checkboxes as ( ), and markdown tables for grids. It must look complete when printed.",
          "official-letter": "Use proper Pakistani official letter format: Ref No. ____, Date ____, subject line, formal body, signature block.",
        };
        const text = await askClaude(
          `You are the senior administrative officer of a Pakistani school with 20 years of experience. Draft this official school document, fully formatted and ready to print.

School: ${doc.school}
Document type: ${doc.docType}
Class (if relevant): ${doc.grade}
Examination Board (if relevant): ${doc.board}
Language: ${doc.language}
Specific details from principal: ${doc.details || "Use sensible placeholders like [Date], [Student Name], [Roll No.] where details are missing."}

DOCUMENT FORMAT (very important): ${formatRules[fmt.style] || formatRules["official-letter"]}

Rules:
- Use proper Pakistani school format: school name line, Ref No. ____, Date ____, subject line, body, signature block (Principal / Coordinator) — unless the format above says otherwise.
- For timetables, rosters, date sheets, record sheets and registers: ALWAYS use markdown tables (| Day | Period 1 | Period 2 |...).
- For question papers: follow the ${doc.board} paper pattern (objective + subjective sections, marks distribution).
- If language is Urdu or Bilingual, write the Urdu portions in proper formal Urdu (دفتری اردو).
- Use markdown: ## for the document title, ### for sections, bold (**) for labels, - for lists.
- Keep tone respectful and formal, as used in Punjab schools. No extra commentary — output the document only.`
        );
        setOutput(text);
      }
    } catch (e) { setError("Generation failed. Please try again."); }
    setLoading(false);
  };

  const copyOut = async () => {
    try {
      const txt = certData
        ? `${certData.title}\n\nThis is to certify that\n${certData.studentName}\n${certData.bodyText}\n${certData.dateLine}`
        : output;
      await navigator.clipboard.writeText(txt);
      setCopied(true); setTimeout(() => setCopied(false), 1500);
    } catch (e) { }
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

  // ---------- Designed A4 PDF download (html2pdf.js from CDN) ----------
  // ---------- Designed PDF download (bulletproof capture) ----------
  const downloadPDF = async () => {
    if (!output || pdfBusy) return;
    setPdfBusy(true);
    let clone = null;
    try {
      if (!window.html2pdf) {
        await new Promise((resolve, reject) => {
          const s = document.createElement("script");
          s.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
          s.onload = resolve;
          s.onerror = () => reject(new Error("PDF library failed to load"));
          document.head.appendChild(s);
        });
      }
      const fmt = currentFormat();
      const src = document.getElementById("td-pdf-source");
      // FIX for blank PDFs: clone the hidden source and place the clone at the
      // top of the visible page (behind everything) so the capture engine sees it.
      clone = src.cloneNode(true);
      clone.removeAttribute("id");
      clone.style.position = "absolute";
      clone.style.left = window.scrollX + "px";
      clone.style.top = window.scrollY + "px";
      clone.style.zIndex = "-99999";
      clone.style.width = fmt.w + "px";
      clone.style.background = "#fff";
      clone.style.border = "none";
      clone.style.borderRadius = "0";
      // certificates: fix to full export size inside the clone
      const certEl = clone.querySelector(".td-cert");
      if (certEl) {
        certEl.style.fontSize = "16px";
        certEl.style.width = "1052px";
        certEl.style.height = "744px";
        certEl.style.aspectRatio = "auto";
      }
      document.body.appendChild(clone);

      const rawName = certData
        ? `${doc.docType}-${certData.studentName || ""}`
        : tab === "lesson" ? (lp.topic || "Lesson-Plan") : doc.docType;
      const fileName =
        "TaleemDesk-" + rawName.replace(/[^A-Za-z0-9\u0600-\u06FF ]/g, "").trim().replace(/\s+/g, "-").slice(0, 45) + ".pdf";
      await window
        .html2pdf()
        .set({
          margin: certData ? 0 : fmt.size === "a5" ? [6, 6, 8, 6] : [10, 10, 12, 10],
          filename: fileName,
          image: { type: "jpeg", quality: 0.96 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: "mm", format: fmt.size, orientation: fmt.orient },
          pagebreak: { mode: ["css", "legacy"] },
        })
        .from(clone)
        .save();
    } catch (e) {
      setError("PDF download failed — please try the Print button instead.");
    }
    if (clone && clone.parentNode) clone.parentNode.removeChild(clone);
    setPdfBusy(false);
  };

  // ---------- Shared School Branding box (both tabs) ----------
  const brandingBox = (
    <div className="td-upbox">
      <div className="td-uptitle">🏫 School Branding (optional)</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <label className="td-field">
          <span className="td-label">School Logo</span>
          <input type="file" accept="image/*" className="td-input td-file" onChange={(e) => readImg(e, setLogoUrl)} />
          {logoUrl && (
            <span className="td-uppreview">
              <img src={logoUrl} alt="logo preview" />
              <button type="button" className="td-upx" onClick={() => setLogoUrl(null)}>✕ Remove</button>
            </span>
          )}
        </label>
        <label className="td-field">
          <span className="td-label">Principal Signature</span>
          <input type="file" accept="image/*" className="td-input td-file" onChange={(e) => readImg(e, setSignUrl)} />
          {signUrl && (
            <span className="td-uppreview">
              <img src={signUrl} alt="signature preview" />
              <button type="button" className="td-upx" onClick={() => setSignUrl(null)}>✕ Remove</button>
            </span>
          )}
        </label>
      </div>
      <label className="td-field">
        <span className="td-label">Letterhead / Letter Pad (full-width header image)</span>
        <input type="file" accept="image/*" className="td-input td-file" onChange={(e) => readImg(e, setPadUrl)} />
        {padUrl && (
          <span className="td-uppreview">
            <img src={padUrl} alt="letterhead preview" style={{ maxWidth: 160 }} />
            <button type="button" className="td-upx" onClick={() => setPadUrl(null)}>✕ Remove</button>
          </span>
        )}
      </label>
      <div className="td-uphint">Letterhead replaces the green header on letters &amp; forms. PNG with transparent background works best for logo/signature. Images stay on your device — never uploaded to any server.</div>
    </div>
  );

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
        .td-pdfbtn{background:#134E33;color:#F4EFE3;border-color:#134E33}
        .td-pdfbtn:hover{background:#0F4029}
        .td-pdfbtn:disabled{opacity:.6;cursor:wait}
        /* offscreen designed A4 page for PDF export */
        .td-pdfpage{position:fixed;left:-12000px;top:0;width:740px;background:#fff;color:#1C2520;
          font-family:'Inter',system-ui,sans-serif;font-size:13.5px;line-height:1.65;padding:0}
        .td-pdfhead{background:#134E33;color:#F4EFE3;padding:18px 26px;border-bottom:4px solid #B98A2F}
        .td-pdfschool{font-family:'Fraunces',serif;font-weight:900;font-size:23px;letter-spacing:.3px}
        .td-pdfmeta{font-size:12px;opacity:.9;margin-top:4px;letter-spacing:.04em}
        .td-pdfbody{padding:20px 30px 26px}
        .td-pdfbody .td-h2{font-size:19px}
        .td-pdfbody .td-h3{page-break-after:avoid}
        .td-pdfbody ul,.td-pdfbody p{page-break-inside:avoid}
        .td-pdffoot{border-top:1px solid #D7CFBC;margin:0 30px;padding:10px 0 18px;font-size:10.5px;color:#8A8474}
        .td-pdfland{width:1052px;padding:0}
        /* ---- designed certificate (green & gold) ---- */
        .td-cert{background:#fff;border:0.6em solid #134E33;padding:0.55em;width:100%;box-sizing:border-box;
          aspect-ratio:1052/744;font-family:'Inter',sans-serif;color:#1C2520}
        .td-pdfland .td-cert{width:1052px;height:744px;aspect-ratio:auto}
        .td-certinner{border:0.18em solid #B98A2F;height:100%;box-sizing:border-box;position:relative;
          display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;
          padding:1.5em 3em;overflow:hidden}
        .td-certcorner{position:absolute;width:5em;height:5em;background:
          linear-gradient(135deg,#134E33 0 38%,#B98A2F 38% 48%,transparent 48%)}
        .td-certcorner.tl{top:-0.1em;left:-0.1em}
        .td-certcorner.tr{top:-0.1em;right:-0.1em;transform:rotate(90deg)}
        .td-certcorner.br{bottom:-0.1em;right:-0.1em;transform:rotate(180deg)}
        .td-certcorner.bl{bottom:-0.1em;left:-0.1em;transform:rotate(270deg)}
        .td-certschool{font-size:0.95em;letter-spacing:0.35em;text-transform:uppercase;color:#B98A2F;font-weight:700}
        .td-certtitle{font-family:'Fraunces',serif;font-weight:900;font-size:2.5em;color:#134E33;margin-top:0.3em;
          letter-spacing:0.04em;text-transform:uppercase}
        .td-certrule{width:9em;border-top:0.15em solid #B98A2F;margin:0.9em 0}
        .td-certlead{font-size:1em;color:#4A5248;font-style:italic}
        .td-certname{font-family:'Great Vibes',cursive;font-size:3.4em;color:#1C2520;margin:0.12em 0;line-height:1.15}
        .td-certbody{font-size:1.05em;max-width:34em;line-height:1.7;color:#33402F}
        .td-certdate{font-size:0.95em;color:#4A5248;margin-top:1em;font-style:italic}
        .td-certsigs{display:flex;align-items:flex-end;justify-content:space-between;width:100%;margin-top:1.8em;gap:1em}
        .td-certsig{font-size:0.9em;font-weight:600;text-align:center;min-width:11em}
        .td-certsig span{font-weight:400;color:#8A8474;font-size:0.85em}
        .td-certsigline{border-top:1px solid #1C2520;margin-bottom:0.4em}
        .td-certseal{width:4.2em;height:4.2em;border:0.2em solid #B98A2F;border-radius:50%;display:flex;
          align-items:center;justify-content:center;font-family:'Fraunces',serif;font-weight:900;font-size:1.4em;
          color:#134E33;background:radial-gradient(circle,#FDF8EC 60%,#F2E5C4);overflow:hidden}
        .td-certlogo{height:4.6em;max-width:14em;object-fit:contain;margin-bottom:0.5em}
        .td-certseallogo{width:78%;height:78%;object-fit:contain}
        .td-certsignimg{height:2.8em;max-width:11em;object-fit:contain;display:block;margin:0 auto -0.15em}
        .td-upbox{border:1px dashed #B98A2F;background:#FDF8EC;border-radius:8px;padding:12px 12px 6px;margin-bottom:13px}
        .td-uptitle{font-size:13px;font-weight:700;color:#134E33;margin-bottom:8px}
        .td-file{padding:6px;font-size:12px;background:#fff}
        .td-uppreview{display:flex;align-items:center;gap:8px;margin-top:6px}
        .td-uppreview img{height:34px;max-width:80px;object-fit:contain;border:1px solid #D7CFBC;border-radius:4px;
          background:#fff;padding:2px}
        .td-upx{border:none;background:none;color:#D95B43;font-size:11px;font-weight:600;cursor:pointer;padding:0}
        .td-uphint{font-size:11px;color:#8A8474;margin:4px 0 6px}
        .td-fmtbadge{background:#EFF5F0;border:1px solid #BFD3C5;color:#134E33;border-radius:7px;padding:8px 11px;
          font-size:12px;margin-bottom:13px}
        .td-table{border-collapse:collapse;width:100%;margin:10px 0;font-size:0.93em;background:#fff}
        .td-table th{background:#134E33;color:#F4EFE3;padding:6px 9px;border:1px solid #134E33;text-align:left;
          font-weight:600;font-size:0.95em}
        .td-table td{border:1px solid #A9BCAF;padding:5px 9px;vertical-align:top}
        .td-table tr:nth-child(even) td{background:#F3F7F4}
        .td-cut{color:#8A8474;font-size:12px;letter-spacing:2px;margin:14px 0;white-space:nowrap;overflow:hidden}
        .td-docpage{background:#fff;border:1px solid #D7CFBC;border-radius:10px;overflow:hidden;
          font-size:13.5px;line-height:1.65;box-shadow:0 2px 10px rgba(28,37,32,.07)}
        .td-docsign{padding:6px 30px 4px;text-align:right}
        .td-docsign img{height:42px;max-width:150px;object-fit:contain;display:inline-block}
        .td-docsign .td-docsignline{border-top:1px solid #1C2520;width:170px;margin:2px 0 3px auto}
        .td-docsign span{font-size:12px;font-weight:600;color:#33402F}
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
            onClick={() => { setTab(id); setOutput(""); setError(""); setCertData(null); }}>
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
                {brandingBox}
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
                <div className="td-fmtbadge">
                  📐 Print format: <strong>{docFormat(doc.docType).size.toUpperCase()} {docFormat(doc.docType).orient === "landscape" ? "Landscape" : "Portrait"}</strong>
                  {" • "}{{ "certificate": "Designed Certificate", "wide-table": "Wide Table Layout", "compact-card": "Compact Card", "challan-3-copies": "3-Copy Challan", "structured-form": "Fill-in Form", "official-letter": "Official Letter" }[docFormat(doc.docType).style]}
                </div>
                {brandingBox}
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
                <button className="td-mini td-pdfbtn" onClick={downloadPDF} disabled={pdfBusy}>
                  {pdfBusy ? "Preparing PDF…" : "📥 Download PDF"}
                </button>
                <button className="td-mini" onClick={copyOut}>{copied ? "✓ Copied" : "Copy text"}</button>
                <button className="td-mini" onClick={printOut}>Print</button>
              </div>
            )}
            {loading ? (
              <div className="td-copy td-empty">
                <div className="td-spin" />
                <span>Designing your {tab === "lesson" ? "lesson plan" : "document"}…</span>
              </div>
            ) : !output ? (
              <div className="td-copy td-empty">
                <span style={{ fontSize: 34 }}>✏️</span>
                <span>Your {tab === "lesson" ? "lesson plan" : "document"} will appear here<br />exactly as it will look in the PDF.</span>
              </div>
            ) : certData ? (
              <div id="td-pdf-source">
                <Certificate data={certData} school={doc.school} em="clamp(7px, 1.55vw, 15px)" />
              </div>
            ) : (
              <div id="td-pdf-source" className="td-docpage">
                {padUrl && tab !== "lesson" ? (
                  <img src={padUrl} alt="" style={{ width: "100%", display: "block" }} />
                ) : (
                  <div className="td-pdfhead" style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    {logoUrl && <img src={logoUrl} alt="" style={{ height: 46, objectFit: "contain", background: "#fff", borderRadius: 6, padding: 3 }} />}
                    <div>
                      <div className="td-pdfschool">{tab === "lesson" ? lp.school : doc.school}</div>
                      <div className="td-pdfmeta">
                        {tab === "lesson"
                          ? `Lesson Plan • ${lp.subject} • ${lp.grade} • ${lp.board}`
                          : `${doc.docType}`}
                      </div>
                    </div>
                  </div>
                )}
                <div className="td-pdfbody">{renderMD(output)}</div>
                {signUrl && tab !== "lesson" && (
                  <div className="td-docsign">
                    <img src={signUrl} alt="Principal signature" />
                    <div className="td-docsignline" />
                    <span>Principal</span>
                  </div>
                )}
                <div className="td-pdffoot">
                  Generated with TaleemDesk — AI-TEG Academy &nbsp;•&nbsp; Date: {new Date().toLocaleDateString("en-PK")}
                </div>
              </div>
            )}
          </section>

        </main>
      )}
    </div>
  );
}