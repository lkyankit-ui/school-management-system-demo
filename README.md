# Vidyalaya ERP — Interactive Demo

This is a clickable demo of the school management system, with every role and every planned feature. It's a **pure static website**: no backend, no build step and no dependencies. All data is synthetic and lives only in the visitor's browser.

> Feature cards on the landing page show which parts of the real product are built, in progress or planned. **Live demo:** https://lkyankit-ui.github.io/school-management-system-demo/

## What you can try

| Role | Persona | Highlights |
|---|---|---|
| 👩‍💼 Principal | Dr. Anjali Deshpande | Today dashboard, approvals for concessions, reversals and leave, results lock and publish, staff register, reports, audit log |
| 🗂️ School Admin | Sunita Patil | Students and profiles, 6-step CSV import wizard, staff and additive roles, academic setup, calendar, fees and concessions, exams and grading, WhatsApp messaging with a kill switch, website CMS, admissions inbox, data rights, branding |
| 🧑‍🏫 Teacher | Rakesh Yadav | Self check-in, 30-second attendance (tap absentees), offline queue simulation, correction window then WhatsApp alerts, marks entry, homework, leave |
| 🔬 HOD | Mrs. Kavita Kulkarni | Department home, leave approvals, cover assignment, staff tasks, remarks about teachers, marks review, syllabus progress |
| 🧾 Accountant | Vikram Joshi | Fee counter with itemised dues and a printable receipt, receipts and reversals, cheques, online-payment reconciliation, day close |
| 👪 Parent | Meena Devi | Two-child switcher, attendance calendar, absence notes, homework, report card, fees with Pay now (sandbox checkout), remarks, PTM RSVP |
| 🎒 Student | Aarav Sharma | Homework, results, fees, account |
| 🛰️ Operator | Ankit | All schools, create a branded school, go-live gates G1–G12, module switches, messaging mode, audited support access |
| 🌐 Public website | Sunrise Public School | Home slider, notices, about, academics, admissions and fees, online application, facilities, gallery, mandatory disclosure, contact or enquiry |

### Coming next

The landing page has a separate **"Coming next"** section. **Hinglish** is approved for the Bihar pilot (Story 3.14). UDISE+/APAAR export, more regional languages (Marathi first), two-way WhatsApp (exploring), Tally export and certificates/TC come after the pilot. Every preview screen carries a banner saying so. See [ROADMAP-PLAN.md](ROADMAP-PLAN.md) for what's planned and when.

There are also some cross-cutting features to try:

- Switch roles, language (English or हिन्दी) and the five colour presets from the top bar, and toggle light or dark mode.
- The 💬 button opens a **simulated guardian WhatsApp**. Absence alerts, receipts, results and notices land there.
- **Reset demo** in the top ribbon restores the starting data.

## A suggested 5-minute walkthrough

1. **Parent → Attendance:** send an absence note for Aarav.
2. **Teacher → Mark attendance:** Aarav shows "📝 note from parent". Tap two other children, then **Submit**, then **Release alerts now**. Open 💬 to see the Hindi and English alerts. Aarav's guardian isn't alerted because the parent already told the school.
3. **Teacher → Enter marks:** **Fill sample marks**, then **Submit for HOD review**.
4. **Principal → Results:** **Lock**, then **Publish**. **Parent → Results** now shows the report card.
5. **Parent → Fees:** **Pay now**, then the sandbox checkout. A receipt is posted and **Accountant → Online payments** shows it.
6. **Teacher → My attendance & leave:** apply for leave. **HOD → Leave approvals:** approve it.
7. **Website → Apply online:** submit the form. **School Admin → Admissions:** the application shows up there.
8. **Operator → Modules:** turn off Online fee payment. **Parent → Fees** then shows it as unavailable.

## Run locally

Double-click `index.html` (it works from `file://`), or run:

```bash
npm start
```

Then open http://127.0.0.1:4400. This needs Node 20.11 or later and has no dependencies.

## Host it (pick one, all free)

- **GitHub Pages:** push this folder to a new repo, then go to *Settings → Pages → Deploy from branch → `main` / root*. `.nojekyll` is already included.
- **Netlify or Cloudflare Pages:** drag and drop the folder, or connect the repo. There's no build command, and the publish directory is `/`.
- **Vercel:** import the repo with framework preset *Other*, no build command and output directory `.`.

Routing uses `#/…` hashes, so no server rewrite rules are needed.

## Project layout

```
index.html               entry point
assets/css/app.css       design tokens (5 presets × light/dark) and components
assets/js/data.js        synthetic school, students, staff, fees, exams, gates
assets/js/core.js        state (localStorage), router, shell, i18n, theming, modal, toasts, WhatsApp simulator
assets/js/views-public.js  landing / feature tour + public school website
assets/js/views-staff.js   shared helpers, Principal, School Admin
assets/js/views-school.js  Teacher, HOD, Accountant
assets/js/views-portal.js  Parent, Student, Operator
assets/js/views-roadmap.js post-pilot previews: UDISE+/APAAR, Hinglish, Marathi, two-way WhatsApp, Tally, certificates
ROADMAP-PLAN.md          what comes after the 16 epics, in order, with conditions
scripts/serve.mjs        zero-dependency local server
```

## Safety

Every name, phone number, school and amount here is fictional. Nothing is sent anywhere: WhatsApp, payment and email are all simulated in the page.
