"use strict";
// Built-in text tutor. Runs on the device, no internet or paid service needed.
const tutorTopics = [
  { page: "Drafts", title: "Set up your business profile", keys: "profile setup start begin business name offer outcome sender your name fill save first", answer: "Open Drafts. Fill in your business name, your name, your named offer and what the customer gets. Then tap Save. Every draft updates with your details." },
  { page: "Drafts", title: "Recruiting and HR preset", keys: "recruiting hr preset staffing hiring health check utah employees recruit template load", answer: "Open Drafts and tap Load Recruiting and HR preset. It fills in a free 20-minute Hiring Health Check aimed at Utah owners with 10 to 75 employees. Add your own name and contact details, change anything you like, then tap Save." },
  { page: "Drafts", title: "Write and copy a draft", keys: "draft drafts write post email dm text message copy category linkedin facebook ad script personalize contact use log used", answer: "Open Drafts. Pick a draft category, and pick a contact if you want it personalized. Tap Copy draft, paste it where you need it, then tap Log draft used so it shows in that contact's history. Always check facts and fill any placeholders before you send." },
  { page: "Relationships", title: "Add a lead or contact", keys: "add lead contact company relationship new person client candidate crm customer prospect", answer: "Open Relationships. Add the company first, then add the contact and link the company. Choose lead, client or candidate, set a stage and a follow-up date, then save." },
  { page: "Relationships", title: "Pipeline stages", keys: "stage stages pipeline lead contacted meeting proposal won lost move status deal", answer: "Each relationship has a stage: lead, contacted, meeting, proposal, won or lost. Open the relationship in Relationships and change the stage as the conversation moves. Won relationships show up in Customer success." },
  { page: "Today", title: "Follow-ups", keys: "follow up followup follow-up reminder due overdue today date next call callback complete done", answer: "Set a follow-up date on any relationship. The Today page lists everything due today and overdue. After you handle one, mark it complete and set the next date." },
  { page: "Relationships", title: "Notes and history", keys: "note notes history log record activity timeline what happened", answer: "Open a relationship in Relationships to add notes and read its history. Drafts you logged show the draft name and the exact text you used." },
  { page: "Recruiting", title: "Job orders and candidates", keys: "job order jobs opening role position candidate submission submit interview offer placed declined placement link", answer: "Open Recruiting. Add a client job order, then link a candidate with Record submission. Move the submission from submitted to interview, offer, placed or declined. Candidates and clients stay separate, and the app blocks duplicate links." },
  { page: "Customer success", title: "Customer success and onboarding", keys: "customer success onboarding onboard check in checkin renewal renew care retention keep client after win", answer: "Mark a relationship Won, then open Customer success. Work through the onboarding tasks and set check-in and renewal dates. Those dates show on the Today page when they come due." },
  { page: "Customer success", title: "Health score", keys: "health score healthy watch needs attention sentiment points rating", answer: "The health score runs from 0 to 100. Four onboarding tasks are worth 10 points each, a check-in in the last 30 days is worth 30, and customer sentiment is worth up to 30. 80 and up is Healthy, 50 to 79 is Watch, and under 50 is Needs attention." },
  { page: "Customer success", title: "Reviews and referrals", keys: "review reviews referral referrals testimonial ask", answer: "After a win, open Customer success and record when you asked for a review or a referral, so you don't ask twice or forget to ask." },
  { page: "Settings", title: "Back up your data", keys: "backup back up export save csv download data lose lost safe", answer: "Open Settings and tap Export workspace CSV. Keep that file somewhere safe. Do this before clearing browser data or switching devices, because your data lives on this device." },
  { page: "Settings", title: "Move to another device", keys: "import restore move transfer another device new phone computer sync merge", answer: "Export a CSV in Settings on the old device. On the new device open Settings, pick the file under Restore workspace CSV, preview it, then confirm. Matching records update and the incoming profile replaces the saved one." },
  { page: "Learn", title: "Install on your phone or computer", keys: "install home screen app iphone android phone mac windows linux add icon offline", answer: "On iPhone, open the app in Safari, tap Share, then Add to Home Screen. On Android, Mac, Windows and Linux, use the Install app button or your browser's install option. Once installed it opens like an app." },
  { page: "Learn", title: "Privacy", keys: "privacy private data where stored cloud server secure security who see", answer: "Everything is stored in this browser on this device. Nothing is sent to a server. That also means you should export a CSV backup now and then." },
  { page: "Learn", title: "Guided tour and manual", keys: "help tour manual guide learn how pdf instructions tutorial", answer: "Tap Start guided tour for a quick walk through the four main jobs, or Open how-to manual for the 4-page PDF with screenshots. You can also ask me anything here." },
];
const tutorStop = new Set("a an the and or to of in on for my i do how can what is it with where when does this that me you your be get".split(" "));
function tutorWords(t) {
  return String(t).toLowerCase().replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter((w) => w && !tutorStop.has(w));
}
function tutorAnswer(q) {
  const words = tutorWords(q);
  if (!words.length) return null;
  let best = null, bestScore = 0;
  for (const t of tutorTopics) {
    const keys = tutorWords(t.keys + " " + t.title);
    let score = 0;
    for (const w of words)
      for (const k of keys)
        if (k === w) score += 2;
        else if (w.length > 3 && (k.startsWith(w) || w.startsWith(k))) score += 1;
    if (score > bestScore) { bestScore = score; best = t; }
  }
  return bestScore >= 2 ? best : null;
}
function tutorEsc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}
function tutorPanel() {
  return '<section class="panel" id="tutor"><h3>Ask the tutor</h3><p>Ask a question in your own words, like "How do I add a lead?" or "How do I back up?"</p><div id="tutor-log" aria-live="polite"></div><form id="tutor-form"><label>Your question<input name="q" autocomplete="off" required maxlength="200" placeholder="Type your question"></label><button class="primary">Ask</button></form><p class="subtle">Topics: ' +
    tutorTopics.map((t) => tutorEsc(t.title)).join(", ") + ".</p></section>";
}
document.addEventListener("submit", (e) => {
  if (e.target.id !== "tutor-form") return;
  e.preventDefault();
  const input = e.target.elements.q, q = input.value.trim(), log = document.getElementById("tutor-log");
  if (!q || !log) return;
  const t = tutorAnswer(q);
  const reply = t
    ? "<strong>" + tutorEsc(t.title) + "</strong><p>" + tutorEsc(t.answer) + '</p><button data-page="' + tutorEsc(t.page) + '">Go to ' + tutorEsc(t.page) + "</button>"
    : "<p>I don't have an answer for that yet. Try asking about profiles, drafts, leads, follow-ups, recruiting, customer success, backup or installing, or open the how-to manual.</p>";
  log.insertAdjacentHTML("beforeend", '<div class="tutor-q">You: ' + tutorEsc(q) + '</div><div class="tutor-a">' + reply + "</div>");
  input.value = "";
  log.lastElementChild.scrollIntoView({ block: "nearest" });
});
