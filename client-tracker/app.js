"use strict";
const KEY = "raeford-outreach-v2";
const stages = ["lead", "contacted", "meeting", "proposal", "won", "lost"];
const sections = [
  "Today",
  "Relationships",
  "Recruiting",
  "Customer success",
  "Learn",
  "Settings",
];
const fields = {
  biz: "Business name",
  sender: "Your name",
  offer: "Named offer",
  outcome: "What the customer gets",
  price: "Price",
  loc: "Location",
  audience: "Audience",
  pains: "Problems, one per line",
  proof: "Verified proof, if true",
  scarcity: "Limit or deadline, if true",
  guarantee: "Guarantee, if true",
  cta: "Contact details for your drafts",
};
const blankProfile = {
  industry: "custom",
  biz: "",
  sender: "",
  offer: "",
  outcome: "",
  price: "",
  loc: "",
  audience: "",
  pains: "",
  proof: "",
  scarcity: "",
  guarantee: "",
  cta: "",
  tone: "direct",
};
const recruitPreset = {
  ...blankProfile,
  industry: "recruit",
  offer: "the free 20-minute Hiring Health Check",
  outcome: "a conversation about your hiring process and practical next steps",
  price: "Free",
  loc: "Utah",
  audience: "Utah owners with 10 to 75 employees",
  pains:
    "Hiring takes time away from running the business\nOpen roles put pressure on the team\nHiring steps need a clear owner",
};
const fresh = () => ({
  schema: 2,
  revision: 0,
  profile: { ...blankProfile },
  companies: [],
  contacts: [],
  jobs: [],
  submissions: [],
  history: [],
  care: [],
});
let state = fresh(),
  page = "Today",
  draftCategory = "li",
  selectedContact = "",
  editContact = "",
  editCompany = "",
  query = "",
  readFailure = false;
const el = (id) => document.getElementById(id);
const esc = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const uid = () =>
  crypto.randomUUID
    ? crypto.randomUUID()
    : Date.now().toString(36) + Math.random().toString(36).slice(2);
const today = () => {
  const d = new Date();
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("-");
};
function message(text) {
  el("notice").textContent = text;
  el("notice").style.display = "block";
  clearTimeout(message.timer);
  message.timer = setTimeout(() => (el("notice").style.display = "none"), 5000);
}
function persist(next) {
  if (readFailure) {
    message(
      "Stored workspace needs recovery. Export its raw data in Settings first.",
    );
    return false;
  }
  try {
    const stored = JSON.parse(localStorage.getItem(KEY) || "null");
    if (stored && stored.revision !== state.revision) {
      state = stored;
      render();
      message(
        "Another tab changed this workspace. Your latest view is loaded. Please retry.",
      );
      return false;
    }
    next.revision = state.revision + 1;
    localStorage.setItem(KEY, JSON.stringify(next));
    state = next;
    el("save-status").textContent = "Saved on this device";
    return true;
  } catch (error) {
    message(
      "Save failed. Browser storage may be full or unavailable. Export your data before leaving.",
    );
    return false;
  }
}
function update(action) {
  const next = structuredClone(state);
  action(next);
  return persist(next);
}
function event(next, contactId, kind, note, draftId = "") {
  next.history.push({
    id: uid(),
    contactId,
    kind,
    note,
    draftId,
    at: new Date().toISOString(),
  });
}
function companyName(id) {
  return state.companies.find((x) => x.id === id)?.name || "Unassigned";
}
function personName(id) {
  return state.contacts.find((x) => x.id === id)?.name || "Unknown contact";
}
function options(values, current) {
  return values
    .map((v) => {
      const [id, name] = Array.isArray(v) ? v : [v, v];
      return (
        '<option value="' +
        esc(id) +
        '"' +
        (id === current ? " selected" : "") +
        ">" +
        esc(name) +
        "</option>"
      );
    })
    .join("");
}
function field(name, label, value = "", type = "text", required = false) {
  return (
    "<label>" +
    esc(label) +
    '<input name="' +
    name +
    '" type="' +
    type +
    '" value="' +
    esc(value) +
    '"' +
    (required ? " required" : "") +
    "></label>"
  );
}
function select(name, label, values, current) {
  return (
    "<label>" +
    label +
    '<select name="' +
    name +
    '">' +
    options(values, current) +
    "</select></label>"
  );
}
function companyOptions() {
  return [["", "Unassigned"], ...state.companies.map((c) => [c.id, c.name])];
}
function contactOptions(filter = () => true) {
  return state.contacts
    .filter(filter)
    .map((c) => [c.id, c.name + " · " + c.type]);
}
function due(date) {
  return date && date <= today();
}
function careFor(id) {
  return state.care.find((c) => c.contactId === id);
}
function health(c) {
  if (!c) return { score: 0, label: "Setup needed" };
  const days = c.lastCheck
    ? Math.floor(
        (new Date(today() + "T12:00:00") -
          new Date(c.lastCheck + "T12:00:00")) /
          86400000,
      )
    : Infinity;
  const score =
    c.tasks.filter(Boolean).length * 10 +
    (days <= 30 ? 30 : 0) +
    (c.sentiment === "positive" ? 30 : c.sentiment === "neutral" ? 15 : 0);
  return {
    score,
    label: score >= 80 ? "Healthy" : score >= 50 ? "Watch" : "Needs attention",
  };
}
function navTo(name) {
  page = name;
  render();
  window.scrollTo(0, 0);
}
function render() {
  el("nav").innerHTML = sections
    .map(
      (s) =>
        '<button data-page="' +
        s +
        '" class="' +
        (s === page ? "active" : "") +
        '" ' +
        (s === page ? 'aria-current="page"' : "") +
        ">" +
        s +
        "</button>",
    )
    .join("");
  const views = {
    Today: dashboard,
    Drafts: drafts,
    Relationships: relationships,
    Recruiting: recruiting,
    "Customer success": success,
    Learn: learn,
    Settings: settings,
  };
  el("main").innerHTML = views[page]();
  if (page === "Drafts") drawCards();
}
function dashboard() {
  const dueContacts = state.contacts.filter((c) => due(c.followUp));
  const wins = state.contacts.filter(
    (c) => c.stage === "won" && c.type !== "candidate",
  );
  const dueCare = state.care.filter((c) => due(c.nextCheck) || due(c.renewal));
  return (
    '<div class="split-title"><div><h2>Your next conversations</h2><p class="subtle">' +
    esc(today()) +
    ' · Follow-ups include overdue dates.</p></div><button data-action="tour">Start guided tour</button></div>' +
    '<div class="metrics"><div class="panel"><span class="metric">' +
    dueContacts.length +
    '</span>Follow-ups due</div><div class="panel"><span class="metric">' +
    wins.length +
    '</span>Won relationships</div><div class="panel"><span class="metric">' +
    dueCare.length +
    "</span>Care dates due</div></div>" +
    '<section class="panel"><h3>Due today and overdue</h3>' +
    (dueContacts.length
      ? dueContacts
          .map(
            (c) =>
              '<div class="card"><strong>' +
              esc(c.name) +
              "</strong> · " +
              esc(companyName(c.companyId)) +
              "<p>" +
              esc(c.followUp) +
              " · " +
              esc(c.stage) +
              '</p><div class="actions"><button data-open="' +
              c.id +
              '">Open relationship</button><button data-done="' +
              c.id +
              '">Mark follow-up complete</button></div></div>',
          )
          .join("")
      : '<p class="empty">No follow-ups are due. Add a relationship and set a follow-up date.</p>') +
    "</section>" +
    '<section class="panel"><h3>Customer check-ins and renewals</h3>' +
    (dueCare.length
      ? dueCare
          .map(
            (c) =>
              "<p>" +
              esc(personName(c.contactId)) +
              " · Check-in " +
              esc(c.nextCheck || "unscheduled") +
              " · Renewal " +
              esc(c.renewal || "unscheduled") +
              "</p>",
          )
          .join("")
      : '<p class="subtle">Customer care dates will appear here when due.</p>') +
    '<button data-page="Customer success">Open customer success</button></section>'
  );
}
function drafts() {
  return (
    '<h2>Write the next conversation</h2><div class="layout"><section class="panel"><div class="actions"><button data-action="recruit">Load Recruiting and HR preset</button><button data-action="general">Start business profile</button></div><p class="subtle">The Recruiting and HR preset targets Utah owners with 10 to 75 employees. Add your own name and contact details.</p><form id="profile-form">' +
    select(
      "industry",
      "Industry",
      Object.entries(Drafts.industries).map(([id, x]) => [id, x.l]),
      state.profile.industry,
    ) +
    Object.entries(fields)
      .map(([key, label]) =>
        key === "pains" || key === "proof" || key === "outcome"
          ? "<label>" +
            label +
            '<textarea name="' +
            key +
            '">' +
            esc(state.profile[key]) +
            "</textarea></label>"
          : field(key, label, state.profile[key]),
      )
      .join("") +
    select("tone", "Tone", ["direct", "friendly", "bold"], state.profile.tone) +
    '<button class="primary">Save profile and refresh drafts</button></form></section>' +
    '<section><div class="panel">' +
    select("draft-category", "Draft category", Drafts.tabs, draftCategory) +
    select(
      "draft-contact",
      "Personalize for contact",
      [["", "Choose a contact"], ...contactOptions()],
      selectedContact,
    ) +
    '<p class="subtle">Copy a draft for your own use. Log it after you use it. Review facts and placeholders before use.</p></div><div id="draft-cards"></div></section></div>'
  );
}
function currentDrafts() {
  return Drafts.generate(state.profile);
}
function personalized(text) {
  const c = state.contacts.find((x) => x.id === selectedContact);
  return c
    ? text
        .replaceAll("{first name}", c.name.split(/\s+/)[0])
        .replaceAll("{name}", c.name)
    : text;
}
function drawCards() {
  el("draft-cards").innerHTML = currentDrafts()
    [draftCategory].map(
      (c, i) =>
        '<article class="card"><div class="split-title"><h3>' +
        esc(c.t) +
        '</h3><span class="tag">' +
        personalized(c.x).length +
        (c.max ? " / " + c.max : "") +
        ' characters</span></div><p class="subtle">' +
        esc(c.n) +
        '</p><div class="draft">' +
        esc(personalized(c.x)) +
        '</div><div class="actions"><button data-copy="' +
        i +
        '">Copy draft</button><button data-log="' +
        i +
        '">Log draft used</button></div></article>',
    )
    .join("");
}
function relationships() {
  const c = state.contacts.find((x) => x.id === editContact) || {
    name: "",
    companyId: "",
    type: "lead",
    stage: "lead",
    email: "",
    phone: "",
    followUp: "",
    notes: "",
  };
  const contacts = state.contacts.filter((c) =>
    (c.name + " " + companyName(c.companyId) + " " + c.type)
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  return (
    '<h2>Relationships</h2><div class="pipeline">' +
    stages
      .map(
        (s) =>
          "<span>" +
          s +
          " " +
          state.contacts.filter((c) => c.stage === s).length +
          "</span>",
      )
      .join("") +
    '</div><div class="layout"><div><section class="panel"><h3>' +
    (editContact ? "Edit relationship" : "Add relationship") +
    '</h3><form id="contact-form">' +
    field("name", "Name", c.name, "text", true) +
    select("type", "Relationship", ["lead", "client", "candidate"], c.type) +
    select("companyId", "Company", companyOptions(), c.companyId) +
    select("stage", "Pipeline stage", stages, c.stage) +
    field("email", "Email", c.email, "email") +
    field("phone", "Phone", c.phone, "tel") +
    field("followUp", "Follow-up date", c.followUp, "date") +
    '<label>Notes<textarea name="notes">' +
    esc(c.notes) +
    '</textarea></label><div class="actions"><button class="primary">Save relationship</button>' +
    (editContact
      ? '<button type="button" data-action="new-contact">New contact</button>'
      : "") +
    '</div></form></section><section class="panel"><h3>Add company</h3><form id="company-form">' +
    field("name", "Company name", "", "text", true) +
    field("industry", "Industry") +
    field("employees", "Employee count", "", "number") +
    field("location", "Location") +
    '<button>Add company</button></form><p class="subtle">' +
    state.companies
      .map(
        (c) =>
          '<button type="button" data-company="' +
          c.id +
          '">Edit ' +
          esc(c.name) +
          "</button>",
      )
      .join(" ") +
    '</p></section></div><div><section class="panel"><label>Search relationships<input id="search" value="' +
    esc(query) +
    '" placeholder="Name, company or type"></label><div class="table-wrap"><table><thead><tr><th>Name</th><th>Company</th><th>Type / stage</th><th>Follow-up</th><th>Open</th></tr></thead><tbody>' +
    contacts
      .map(
        (c) =>
          "<tr><td>" +
          esc(c.name) +
          "</td><td>" +
          esc(companyName(c.companyId)) +
          "</td><td>" +
          esc(c.type) +
          " / " +
          esc(c.stage) +
          "</td><td>" +
          esc(c.followUp) +
          '</td><td><button data-open="' +
          c.id +
          '">Open</button></td></tr>',
      )
      .join("") +
    "</tbody></table></div>" +
    (contacts.length
      ? ""
      : '<p class="empty">Add your first relationship to start tracking conversations.</p>') +
    "</section>" +
    contactHistory(editContact) +
    "</div></div>"
  );
}
function contactHistory(id) {
  if (!id) return "";
  const items = state.history
    .filter((h) => h.contactId === id)
    .sort((a, b) => b.at.localeCompare(a.at));
  return (
    '<section class="panel"><h3>History for ' +
    esc(personName(id)) +
    '</h3><form id="note-form"><label>Conversation note<textarea name="note" required></textarea></label><button>Add note</button></form>' +
    items
      .map(
        (h) =>
          '<div class="history"><strong>' +
          esc(h.kind) +
          '</strong><p class="subtle">' +
          esc(new Date(h.at).toLocaleString()) +
          (h.draftId ? " · " + esc(h.draftId) : "") +
          '</p><div class="draft">' +
          esc(h.note) +
          "</div></div>",
      )
      .join("") +
    "</section>"
  );
}
function recruiting() {
  const candidates = state.contacts.filter((c) => c.type === "candidate"),
    clients = state.contacts.filter((c) => c.type === "client");
  return (
    '<h2>Recruiting desk</h2><div class="row"><section class="panel"><h3>Candidates</h3>' +
    candidates
      .map(
        (c) =>
          '<p><button data-open="' +
          c.id +
          '">' +
          esc(c.name) +
          "</button></p>",
      )
      .join("") +
    (candidates.length
      ? ""
      : "<p>Add candidate relationships in Relationships.</p>") +
    '</section><section class="panel"><h3>Clients</h3>' +
    clients
      .map(
        (c) =>
          '<p><button data-open="' +
          c.id +
          '">' +
          esc(c.name) +
          "</button> " +
          esc(companyName(c.companyId)) +
          "</p>",
      )
      .join("") +
    (clients.length
      ? ""
      : "<p>Add client relationships in Relationships.</p>") +
    '</section></div><div class="row"><section class="panel"><h3>Add job order</h3><form id="job-form">' +
    field("title", "Job title", "", "text", true) +
    select(
      "clientId",
      "Client contact",
      [["", "Choose client"], ...contactOptions((c) => c.type === "client")],
      "",
    ) +
    field("location", "Location") +
    '<label>Requirements<textarea name="requirements"></textarea></label><button class="primary">Save job order</button></form></section><section class="panel"><h3>Submit candidate to a job</h3><form id="submission-form">' +
    select(
      "jobId",
      "Job order",
      [
        ["", "Choose job"],
        ...state.jobs.map((j) => [
          j.id,
          j.title + " · " + personName(j.clientId),
        ]),
      ],
      "",
    ) +
    select(
      "candidateId",
      "Candidate",
      [
        ["", "Choose candidate"],
        ...contactOptions((c) => c.type === "candidate"),
      ],
      "",
    ) +
    select(
      "status",
      "Submission stage",
      ["submitted", "interview", "offer", "placed", "declined"],
      "submitted",
    ) +
    '<button>Record submission</button></form><p class="subtle">Records the submission on this device. Send application materials through your own approved process.</p></section></div>' +
    state.jobs
      .map(
        (j) =>
          '<section class="panel"><h3>' +
          esc(j.title) +
          "</h3><p>" +
          esc(personName(j.clientId)) +
          " · " +
          esc(j.location) +
          "</p><p>" +
          esc(j.requirements) +
          "</p>" +
          state.submissions
            .filter((s) => s.jobId === j.id)
            .map(
              (s) =>
                "<label>" +
                esc(personName(s.candidateId)) +
                '<select data-submission="' +
                s.id +
                '">' +
                options(
                  ["submitted", "interview", "offer", "placed", "declined"],
                  s.status,
                ) +
                "</select></label>",
            )
            .join("") +
          "</section>",
      )
      .join("")
  );
}
function success() {
  const wins = state.contacts.filter(
    (c) => c.stage === "won" && c.type !== "candidate",
  );
  return (
    '<h2>Customer success</h2><p class="subtle">Set a client or lead to Won in Relationships to start onboarding. Score = checklist completion (40), check-in within 30 days (30), and positive (30), neutral (15), or concerned (0) sentiment.</p>' +
    (wins.length
      ? wins
          .map((contact) => {
            const c = careFor(contact.id) || {
              tasks: [false, false, false, false],
              lastCheck: "",
              nextCheck: "",
              renewal: "",
              sentiment: "neutral",
              reviewAsked: false,
              referralAsked: false,
            };
            const h = health(c);
            return (
              '<section class="panel"><div class="split-title"><h3>' +
              esc(contact.name) +
              " · " +
              esc(companyName(contact.companyId)) +
              '</h3><span class="tag">' +
              h.score +
              "/100 · " +
              h.label +
              '</span></div><form class="care-form" data-contact="' +
              contact.id +
              '"><div class="row"><div><h3>Onboarding</h3>' +
              [
                "Welcome and expectations agreed",
                "Kickoff completed",
                "Access and requirements received",
                "First result reviewed",
              ]
                .map(
                  (t, i) =>
                    '<label><input name="task' +
                    i +
                    '" type="checkbox"' +
                    (c.tasks[i] ? " checked" : "") +
                    ">" +
                    t +
                    "</label>",
                )
                .join("") +
              select(
                "sentiment",
                "Latest sentiment",
                ["positive", "neutral", "concerned"],
                c.sentiment,
              ) +
              "</div><div>" +
              field("lastCheck", "Last check-in", c.lastCheck, "date") +
              field("nextCheck", "Next check-in", c.nextCheck, "date") +
              field("renewal", "Renewal date", c.renewal, "date") +
              '<label><input type="checkbox" name="reviewAsked"' +
              (c.reviewAsked ? " checked" : "") +
              '>Review requested</label><label><input type="checkbox" name="referralAsked"' +
              (c.referralAsked ? " checked" : "") +
              '>Referral requested</label></div></div><div class="actions"><button class="primary">Save customer care</button></div></form></section>'
            );
          })
          .join("")
      : '<section class="panel empty">Won relationships will appear here with onboarding, check-in and renewal fields.</section>')
  );
}
const lessons = [
  {
    title: "Track a conversation",
    text: "Add a company and relationship. Pick lead, client or candidate, set the pipeline stage and a follow-up date. Open the relationship to add notes as the conversation moves.",
  },
  {
    title: "Recruit and care for customers",
    text: "In Recruiting, add a client job order and link a candidate submission. After a win, open Customer success and set onboarding tasks, check-in dates and renewal dates.",
  },
  {
    title: "Back up and install",
    text: "In Settings, export your workspace to CSV. Import that CSV on another device. Installation requires an approved HTTPS host. On iPhone use Safari Share, then Add to Home Screen. Other browsers may offer Install app.",
  },
];
let tourStep = 0;
function startTour() {
  tourStep = 0;
  showTour();
  el("tour").showModal();
}
function showTour() {
  el("tour-title").textContent = lessons[tourStep].title;
  el("tour-body").textContent = lessons[tourStep].text;
  el("tour-position").textContent =
    "Step " + (tourStep + 1) + " of " + lessons.length;
  el("tour-next").textContent =
    tourStep === lessons.length - 1 ? "Finish" : "Next";
}
function learn() {
  return (
    '<h2>Learn Client Tracker</h2><div class="actions"><button class="primary" data-action="tour">Start guided tour</button><a class="button" href="manual.pdf" target="_blank" rel="noopener">Open how-to manual</a></div><div class="row">' +
    lessons
      .map(
        (l) =>
          '<article class="panel"><h3>' +
          l.title +
          '</h3><p>' +
          l.text +
          "</p></article>",
      )
      .join("") +
    '</div>' + tutorPanel()
  );
}
function settings() {
  return (
    '<h2>Workspace and backup</h2><div class="row"><section class="panel"><h3>CSV backup</h3><p>Export includes your profile, companies, contacts, history, job orders, candidate links and customer care. Import merges matching IDs and preserves other records. An incoming profile replaces the saved profile after confirmation.</p><button data-action="export">Export workspace CSV</button><form id="import-form"><label>Restore workspace CSV<input type="file" name="file" accept=".csv,text/csv" required></label><button>Preview import</button></form><div id="import-preview"></div>' +
    (readFailure
      ? '<button data-action="raw">Download stored data for recovery</button>'
      : "") +
    '</section><section class="panel"><h3>Device storage</h3><p>Data lives in this browser’s storage for this app address. A different browser or address has a separate workspace. CSV backups let you transfer it.</p><p>Closing the app keeps saved data. Clearing site data removes it. Private browsing may remove data when the session ends.</p><h3>Installation</h3><p>After approved HTTPS hosting, use the browser’s Install option. On iPhone open Safari, tap Share, then Add to Home Screen. Browser and operating-system support varies.</p><p>App assets load from the host. Business records stay on the device. Live AI is off.</p><button data-action="legacy">Import profile from the earlier app</button><p class="subtle">Available when the earlier profile exists at this same address. A new hosted address cannot read storage from the old address.</p></section></div>'
  );
}
function download(name, text, type) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function csvEncode(rows) {
  return rows
    .map((row) =>
      row
        .map((cell) => '"' + String(cell).replaceAll('"', '""') + '"')
        .join(","),
    )
    .join("\r\n");
}
function csvParse(text) {
  const rows = [];
  let row = [],
    cell = "",
    quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      if (quoted && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else quoted = !quoted;
    } else if (ch === "," && !quoted) {
      row.push(cell);
      cell = "";
    } else if ((ch === "\n" || ch === "\r") && !quoted) {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(cell);
      if (row.some(Boolean)) rows.push(row);
      row = [];
      cell = "";
    } else cell += ch;
  }
  if (quoted) throw Error("CSV has an unfinished quoted field.");
  row.push(cell);
  if (row.some(Boolean)) rows.push(row);
  return rows;
}
const collections = [
  "companies",
  "contacts",
  "jobs",
  "submissions",
  "history",
  "care",
];
function exportCSV() {
  const rows = [
    ["format", "collection", "id", "record_json"],
    ["raeford-v2", "profile", "profile", JSON.stringify(state.profile)],
  ];
  for (const kind of collections)
    for (const record of state[kind])
      rows.push(["raeford-v2", kind, record.id, JSON.stringify(record)]);
  download(
    "client-tracker-workspace-" + today() + ".csv",
    csvEncode(rows),
    "text/csv;charset=utf-8",
  );
}
function validateImport(text) {
  const rows = csvParse(text.replace(/^\uFEFF/, ""));
  if (
    JSON.stringify(rows.shift()) !==
    JSON.stringify(["format", "collection", "id", "record_json"])
  )
    throw Error(
      "Use a CSV exported by Client Tracker or Outreach Engine v2. Expected format, collection, id and record_json columns.",
    );
  const incoming = fresh(),
    ids = new Set();
  for (const row of rows) {
    const [format, kind, id, json] = row;
    if (
      row.length !== 4 ||
      format !== "raeford-v2" ||
      !["profile", ...collections].includes(kind) ||
      !id ||
      !/^[A-Za-z0-9_-]+$/.test(id)
    )
      throw Error("CSV contains an invalid record.");
    if (ids.has(kind + ":" + id))
      throw Error("CSV contains a duplicate record ID.");
    ids.add(kind + ":" + id);
    const record = JSON.parse(json);
    if (!record || typeof record !== "object" || Array.isArray(record))
      throw Error("Record must be an object.");
    if (kind === "profile") {
      for (const key of Object.keys(blankProfile))
        if (typeof record[key] !== "string")
          throw Error("Profile is incomplete.");
      incoming.profile = record;
      continue;
    }
    if (record.id !== id) throw Error("Record ID mismatch.");
    const requiredText = {
      companies: ["name", "industry", "employees", "location"],
      contacts: [
        "name",
        "type",
        "stage",
        "companyId",
        "email",
        "phone",
        "followUp",
        "notes",
      ],
      jobs: ["title", "clientId", "location", "requirements"],
      submissions: ["jobId", "candidateId", "status"],
      history: ["contactId", "kind", "note", "draftId", "at"],
      care: ["contactId", "lastCheck", "nextCheck", "renewal", "sentiment"],
    };
    if (requiredText[kind].some((key) => typeof record[key] !== "string"))
      throw Error("Record fields are missing or have invalid types.");
    for (const key of ["followUp", "lastCheck", "nextCheck", "renewal"]) {
      if (
        record[key] &&
        (!/^\d{4}-\d{2}-\d{2}$/.test(record[key]) ||
          Number.isNaN(Date.parse(record[key])))
      )
        throw Error("A date is invalid.");
    }
    if (kind === "history" && Number.isNaN(Date.parse(record.at)))
      throw Error("History timestamp is invalid.");
    if (
      kind === "submissions" &&
      !["submitted", "interview", "offer", "placed", "declined"].includes(
        record.status,
      )
    )
      throw Error("Submission stage is invalid.");
    if (
      kind === "care" &&
      (!["positive", "neutral", "concerned"].includes(record.sentiment) ||
        typeof record.reviewAsked !== "boolean" ||
        typeof record.referralAsked !== "boolean")
    )
      throw Error("Customer care fields are invalid.");

    if (
      kind === "contacts" &&
      (!record.name ||
        !stages.includes(record.stage) ||
        !["lead", "client", "candidate"].includes(record.type))
    )
      throw Error("Invalid contact.");
    if (kind === "companies" && !record.name)
      throw Error("Company needs a name.");
    if (
      kind === "care" &&
      (!Array.isArray(record.tasks) ||
        record.tasks.length !== 4 ||
        record.tasks.some((t) => typeof t !== "boolean"))
    )
      throw Error("Invalid onboarding data.");
    incoming[kind].push(record);
  }
  if (!ids.has("profile:profile"))
    throw Error("CSV is missing the business profile.");
  const merged = structuredClone(state);
  merged.profile = incoming.profile;
  for (const kind of collections) {
    const map = new Map(merged[kind].map((r) => [r.id, r]));
    for (const r of incoming[kind]) map.set(r.id, r);
    merged[kind] = [...map.values()];
  }
  for (const c of merged.contacts)
    if (c.companyId && !merged.companies.some((x) => x.id === c.companyId))
      throw Error("A contact references a missing company.");
  for (const j of merged.jobs)
    if (
      !merged.contacts.some((c) => c.id === j.clientId && c.type === "client")
    )
      throw Error("A job references a missing client.");
  for (const s of merged.submissions)
    if (
      !merged.jobs.some((j) => j.id === s.jobId) ||
      !merged.contacts.some(
        (c) => c.id === s.candidateId && c.type === "candidate",
      )
    )
      throw Error("Submission links are incomplete.");
  for (const c of [...merged.care, ...merged.history])
    if (!merged.contacts.some((p) => p.id === c.contactId))
      throw Error("History or care references a missing contact.");
  return { merged, count: rows.length, revision: state.revision };
}
let importPending = null;
document.addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target,
    data = Object.fromEntries(new FormData(form));
  if (form.id === "profile-form") {
    if (update((s) => (s.profile = { ...blankProfile, ...data }))) {
      render();
      message("Profile saved.");
    }
  }
  if (form.id === "company-form") {
    if (
      update((s) => {
        const id = editCompany || uid();
        const index = s.companies.findIndex((c) => c.id === id);
        if (index < 0) s.companies.push({ ...data, id });
        else s.companies[index] = { ...data, id };
      })
    ) {
      editCompany = "";
      render();
    }
  }
  if (form.id === "contact-form") {
    if (editContact) {
      const old = state.contacts.find((c) => c.id === editContact);
      if (
        old.type !== data.type &&
        (state.jobs.some((j) => j.clientId === old.id) ||
          state.submissions.some((x) => x.candidateId === old.id))
      ) {
        message(
          "This contact has recruiting links. Keep its relationship type to preserve those links.",
        );
        return;
      }
    }
    const id = editContact || uid();
    if (
      update((s) => {
        const i = s.contacts.findIndex((c) => c.id === id);
        if (i < 0) s.contacts.push({ ...data, id });
        else s.contacts[i] = { ...data, id };
        event(s, id, "Relationship saved", "Stage: " + data.stage);
      })
    ) {
      editContact = id;
      render();
    }
  }
  if (form.id === "note-form") {
    if (update((s) => event(s, editContact, "Note", data.note))) render();
  }
  if (form.id === "job-form") {
    if (!data.clientId) {
      message("Choose a client first.");
      return;
    }
    if (update((s) => s.jobs.push({ ...data, id: uid() }))) render();
  }
  if (form.id === "submission-form") {
    if (!data.jobId || !data.candidateId) {
      message("Choose a job and candidate.");
      return;
    }
    if (
      state.submissions.some(
        (s) => s.jobId === data.jobId && s.candidateId === data.candidateId,
      )
    ) {
      message(
        "This candidate is already linked to this job. Update the submission stage below.",
      );
      return;
    }
    if (
      update((s) => {
        s.submissions.push({ ...data, id: uid() });
        event(
          s,
          data.candidateId,
          "Candidate submission",
          state.jobs.find((j) => j.id === data.jobId).title +
            " · " +
            data.status,
        );
      })
    )
      render();
  }
  if (form.classList.contains("care-form")) {
    const id = form.dataset.contact;
    const record = {
      id: careFor(id)?.id || uid(),
      contactId: id,
      tasks: [0, 1, 2, 3].map((i) => !!data["task" + i]),
      lastCheck: data.lastCheck,
      nextCheck: data.nextCheck,
      renewal: data.renewal,
      sentiment: data.sentiment,
      reviewAsked: !!data.reviewAsked,
      referralAsked: !!data.referralAsked,
    };
    if (
      update((s) => {
        s.care = s.care.filter((c) => c.contactId !== id);
        s.care.push(record);
        event(
          s,
          id,
          "Customer care updated",
          "Check-in: " +
            (record.nextCheck || "unscheduled") +
            "; renewal: " +
            (record.renewal || "unscheduled"),
        );
      })
    )
      render();
  }
  if (form.id === "import-form") {
    try {
      const file = form.elements.file.files[0];
      if (file.size > 20 * 1024 * 1024)
        throw Error("Choose a CSV smaller than 20 MB.");
      importPending = validateImport(await file.text());
      el("import-preview").innerHTML =
        "<p>" +
        importPending.count +
        ' records validated. Matching IDs will be updated. Export a backup before merging.</p><button data-action="confirm-import">Confirm merge</button>';
    } catch (error) {
      importPending = null;
      el("import-preview").textContent = error.message;
    }
  }
});
document.addEventListener("change", (e) => {
  if (e.target.name === "draft-category") {
    draftCategory = e.target.value;
    drawCards();
  }
  if (e.target.name === "draft-contact") {
    selectedContact = e.target.value;
    drawCards();
  }
  if (e.target.dataset.submission) {
    const id = e.target.dataset.submission,
      value = e.target.value;
    update((s) => {
      const sub = s.submissions.find((x) => x.id === id);
      sub.status = value;
      event(s, sub.candidateId, "Submission stage", value);
    });
  }
  if (e.target.name === "industry" && e.target.form?.id === "profile-form") {
    const industry = Drafts.industries[e.target.value];
    if (e.target.value !== "custom") {
      e.target.form.elements.audience.value = industry.a;
      e.target.form.elements.pains.value = industry.p.join("\n");
    }
  }
});
document.addEventListener("input", (e) => {
  if (e.target.id === "search") {
    query = e.target.value;
    const position = e.target.selectionStart;
    render();
    el("search").focus();
    el("search").setSelectionRange(position, position);
  }
});
async function copy(text) {
  try {
    await navigator.clipboard.writeText(text);
    message("Draft copied.");
  } catch (error) {
    message(
      "Clipboard access is unavailable. Select the draft text and copy it.",
    );
  }
}
document.addEventListener("click", (e) => {
  const b = e.target.closest("button");
  if (!b) return;
  if (b.dataset.page) navTo(b.dataset.page);
  if (b.dataset.company) {
    editCompany = b.dataset.company;
    const record = state.companies.find((c) => c.id === editCompany);
    const form = el("company-form");
    for (const key of ["name", "industry", "employees", "location"])
      form.elements[key].value = record[key];
    form.querySelector("button").textContent = "Save company";
    form.scrollIntoView({ behavior: "smooth", block: "center" });
  }
  if (b.dataset.open) {
    editContact = b.dataset.open;
    navTo("Relationships");
  }
  if (b.dataset.done) {
    if (
      update((s) => {
        s.contacts.find((c) => c.id === b.dataset.done).followUp = "";
        event(s, b.dataset.done, "Follow-up complete", "Marked complete");
      })
    )
      render();
  }
  if (b.dataset.copy !== undefined)
    copy(
      personalized(currentDrafts()[draftCategory][Number(b.dataset.copy)].x),
    );
  if (b.dataset.log !== undefined) {
    if (!selectedContact) {
      message("Choose a contact before logging a draft.");
      return;
    }
    const index = Number(b.dataset.log),
      draft = currentDrafts()[draftCategory][index];
    if (
      update((s) =>
        event(
          s,
          selectedContact,
          "Draft used",
          draft.t + "\n\n" + personalized(draft.x),
          draftCategory + ":" + index,
        ),
      )
    )
      message("Draft use recorded in contact history.");
  }
  if (b.dataset.review || b.dataset.referral) {
    selectedContact = b.dataset.review || b.dataset.referral;
    draftCategory = b.dataset.review ? "gb" : "wb";
    navTo("Drafts");
  }
  const action = b.dataset.action;
  if (action === "tour") startTour();
  if (action === "recruit" || action === "general") {
    if (
      confirm(
        "Replace the business profile? Relationships and history are kept.",
      )
    ) {
      if (
        update(
          (s) =>
            (s.profile = action === "recruit" ? { ...recruitPreset } : { ...blankProfile }),
        )
      )
        render();
    }
  }
  if (action === "new-contact") {
    editContact = "";
    render();
  }
  if (action === "export") exportCSV();
  if (action === "raw")
    download(
      "workspace-recovery.txt",
      localStorage.getItem(KEY) || "",
      "text/plain",
    );
  if (action === "confirm-import" && importPending) {
    if (importPending.revision !== state.revision) {
      importPending = null;
      message("Workspace changed since the preview. Preview the import again.");
      return;
    }
    if (persist(importPending.merged)) {
      importPending = null;
      render();
      message("CSV merged successfully.");
    }
  }
  if (action === "legacy") {
    try {
      const legacy = JSON.parse(
        localStorage.getItem("outreach-engine") || "null",
      );
      if (!legacy) {
        message("No earlier profile exists at this address.");
        return;
      }
      if (
        confirm(
          "Import the earlier business profile? Review its proof and claims before use.",
        )
      ) {
        const profile = { ...blankProfile };
        for (const k of Object.keys(profile))
          if (typeof legacy[k] === "string") profile[k] = legacy[k];
        if (update((s) => (s.profile = profile)))
          message("Earlier profile imported.");
      }
    } catch (error) {
      message("Earlier profile could not be read.");
    }
  }
});
el("tour-close").onclick = () => el("tour").close();
el("tour-next").onclick = () => {
  if (tourStep === lessons.length - 1) el("tour").close();
  else {
    tourStep++;
    showTour();
  }
};
let installPrompt;
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  installPrompt = e;
  el("install").hidden = false;
});
el("install").onclick = async () => {
  if (installPrompt) {
    await installPrompt.prompt();
    installPrompt = null;
    el("install").hidden = true;
  }
};
window.addEventListener("storage", (e) => {
  if (e.key === KEY) {
    try {
      state = JSON.parse(e.newValue) || fresh();
      render();
      message("Workspace refreshed from another tab.");
    } catch (error) {
      message("Another tab saved unreadable data.");
    }
  }
});
try {
  const saved = JSON.parse(localStorage.getItem(KEY) || "null");
  if (saved) {
    if (
      saved.schema !== 2 ||
      !saved.profile ||
      !Number.isInteger(saved.revision) ||
      !collections.every((k) => Array.isArray(saved[k]))
    )
      throw Error("Unsupported data");
    state = saved;
  }
} catch (error) {
  readFailure = true;
  message("Stored data could not be read. Open Settings to recover it.");
}
render();
if ("serviceWorker" in navigator)
  navigator.serviceWorker
    .register("sw.js")
    .catch(() => message("Offline setup needs localhost or an HTTPS address."));
