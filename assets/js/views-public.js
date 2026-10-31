/* Landing page (feature tour) and the public school website. */
(function () {
  const D = window.DEMO;
  const { esc, money } = D;

  // Mirrors the main repository's sprint-status.yaml on 31 Oct 2026.
  // ready = merged to master, so it can be shown to a school as working; upcoming = not built yet (the demo screen is a preview).
  D.storiesBuilt = 56;
  D.storiesTotal = 184;
  D.featureCatalog = [
    { epic: 1, title: 'Multi-school isolation & secure sessions', link: '#/app/principal/audit',
      ready: [['Each school’s data isolated in the database', '#/app/operator/overview'], ['Secure sign-in per school', '#/app/principal/today'], ['Four school roles with permission checks', '#/app/admin/staff'], ['Append-only audit trail', '#/app/principal/audit']] },
    { epic: 2, title: 'Operator console, branded schools & go-live gates', link: '#/app/operator/schools',
      ready: [['Operator overview without personal data', '#/app/operator/overview'], ['Create a branded school and its first admin', '#/app/operator/schools'], ['Go-live gates G1–G12', '#/app/operator/gates'], ['Module switches and messaging mode', '#/app/operator/modules'], ['Audited, time-boxed support access', '#/app/operator/support']] },
    { epic: 3, title: 'School setup & people', link: '#/app/admin/students',
      ready: [['My account: language (English, हिन्दी, Hinglish) and appearance', '#/app/student/account'], ['Staff accounts and roles', '#/app/admin/staff'], ['Fully editable school profile and settings', '#/app/admin/settings'], ['Academic years, classes, sections and subjects', '#/app/admin/academic'], ['School calendar of holidays and closures', '#/app/admin/calendar'], ['Students, guardians and enrolments', '#/app/admin/students'], ['Teacher assignments and year rollover', '#/app/admin/academic']] },
    { epic: 4, title: 'Import students from Excel/CSV', link: '#/app/admin/import',
      ready: [['Upload, map columns, dry run, fix rows, commit all-or-nothing', '#/app/admin/import'], ['Re-import changes and roll back within 7 days', '#/app/admin/import']] },
    { epic: 5, title: 'Daily attendance in 30 seconds', link: '#/app/teacher/attendance',
      ready: [['My sections and today’s roster', '#/app/teacher/today'], ['Mark attendance by tapping only the absentees', '#/app/teacher/attendance'], ['Absence alerts held for a correction window', '#/app/teacher/attendance']],
      upcoming: 'Offline queue on the phone, installable app, past-date edits by the School Admin, pending-sections panel.' },
    { epic: 6, title: 'Guardian consent & WhatsApp messaging', link: '#/app/admin/messaging', ready: [],
      upcoming: 'Consent and opt-in, Hindi/English templates, absence alerts, notices, caps, kill switch, delivery status, replies.' },
    { epic: 7, title: 'Production readiness', link: '#/app/operator/gates', ready: [],
      upcoming: 'Self-hosted production in India, backups with restore drills, monitoring, security review, breach runbook.' },
    { epic: 8, title: 'Fee counter & ledger', link: '#/app/accountant/collect',
      ready: [['Fee heads and fee settings', '#/app/admin/fees'], ['Fee structures, instalments and dues', '#/app/admin/fees'], ['Dues adjusted for transfers, leavers and year rollover', '#/app/admin/fees']],
      upcoming: 'Concessions with Principal approval, fee counter with numbered receipts, cheques, reversals, day close, fee reports, WhatsApp fee reminders.' },
    { epic: 9, title: 'Exams & report cards', link: '#/app/teacher/marks', ready: [],
      upcoming: 'Exam setup, marks entry, lock, branded report-card PDFs, publish with undo window, WhatsApp delivery.' },
    { epic: 10, title: 'Today view, reports & data rights', link: '#/app/principal/today',
      ready: [['Per-school audit log with filters', '#/app/principal/audit']],
      upcoming: 'Principal’s Today in ten seconds, safe CSV exports, data export and erasure requests.' },
    { epic: 11, title: 'Public school website & admissions', link: '#/site/home', ready: [],
      upcoming: 'Branded website, notices, galleries, mandatory disclosure, online admission applications and enquiries.' },
    { epic: 12, title: 'Student & teacher portals', link: '#/app/student/home', ready: [],
      upcoming: 'Students see their own homework, results and fees; teachers publish homework to their sections.' },
    { epic: 13, title: 'Online fee payment', link: '#/app/parent/fees', ready: [],
      upcoming: 'Hosted checkout (sandbox), exactly-once ledger posting, receipts, reconciliation of uncertain outcomes.' },
    { epic: 14, title: 'HOD, class teachers & staff attendance', link: '#/app/teacher/myatt', ready: [],
      upcoming: 'Additive roles, departments, staff self check-in, leave with HOD/Principal approval, cover assignments.' },
    { epic: 15, title: 'HOD & Principal oversight', link: '#/app/hod/dept', ready: [],
      upcoming: 'Department home, staff tasks, remarks about teachers, marks review before lock, syllabus progress.' },
    { epic: 16, title: 'Parent portal', link: '#/app/parent/home', ready: [],
      upcoming: 'WhatsApp-code sign-in, child switcher, attendance calendar, absence notes, results, fees, remarks, PTM RSVP.' },
  ];
  // Post-pilot roadmap (see ROADMAP-PLAN.md). Not in the 16 epics yet; starts after they are finished.
  D.roadmapCatalog = [
    { n: 'R1', title: 'UDISE+ & APAAR government export', status: 'roadmap', desc: 'Check every student against UDISE+ fields, fix missing data, and download the government CSV in one click.', link: '#/app/admin/gov' },
    { n: 'R3', title: 'More regional languages', status: 'roadmap', desc: 'Marathi (try it now), then Bengali, Punjabi, Gujarati, Odia and Maithili — switched on per school, each after native-speaker review.', link: '#/app/admin/today' },
    { n: 'R4', title: 'Two-way WhatsApp for parents', status: 'exploring', desc: 'Parents reply LEAVE, FEES or RESULT on WhatsApp and get an instant answer — no app needed. Open 💬 and tap a reply.', link: '#/app/parent/home' },
    { n: 'R5', title: 'Tally accounting export', status: 'roadmap', desc: 'Export the day’s receipts as Tally vouchers so the school’s CA does not retype anything.', link: '#/app/accountant/tally' },
    { n: 'R6', title: 'Certificates & transfer certificate', status: 'roadmap', desc: 'Issue numbered Transfer, Bonafide and Character certificates with the school’s letterhead.', link: '#/app/admin/certs' },
  ];
  const statusTag = (s) => ({ ready: '<span class="tag ok">✓ Ready for demo</span>', partly: '<span class="tag warn">◐ Partly ready</span>', upcoming: '<span class="tag info">○ Upcoming · preview only</span>', roadmap: '<span class="tag pri">◇ Roadmap · after pilot</span>', prepilot: '<span class="tag ok">◆ Approved · before pilot</span>', exploring: '<span class="tag">? Exploring · not decided</span>' }[s]);
  D.roadmapBanner = (id) => {
    const r = D.roadmapCatalog.find((x) => x.n === id);
    return `<div class="notice-banner mb" style="border-color:var(--secondary)"><b>${r.status === 'exploring' ? '? Exploring' : '◇ Roadmap'} — ${esc(r.title)}.</b> <span class="small">Planned after all 16 epics and the pilot are finished. This screen is a preview with demo data.</span></div>`;
  };

  const roleCards = [
    ['principal', '👩‍💼', 'Principal', 'Dr. Anjali — Today view, approvals, results, staff, audit'],
    ['admin', '🗂️', 'School Admin', 'Sunita — students, import, messaging, fees & exams setup, website'],
    ['teacher', '🧑‍🏫', 'Teacher', 'Rakesh — 30-second attendance, marks, homework, own leave'],
    ['hod', '🔬', 'HOD', 'Mrs. Kulkarni — department, leave approvals, tasks, marks review'],
    ['accountant', '🧾', 'Accountant', 'Vikram — fee counter, receipts, cheques, day close'],
    ['parent', '👪', 'Parent', 'Meena — two children, results, fees, pay online, PTM'],
    ['student', '🎒', 'Student', 'Aarav — homework, results, fees'],
    ['operator', '🛰️', 'Platform Operator', 'Ankit — all schools, branding, modules, go-live gates'],
  ];

  D.views.landing = () => {
    const ready = D.featureCatalog.filter((f) => f.ready.length);
    const upcoming = D.featureCatalog.filter((f) => f.upcoming);
    return `
    <header class="landing-nav">
      <a class="brand" href="#/"><div class="logo">V</div>Vidyalaya ERP <span class="tag pri">Demo</span></a>
      <div class="row">
        <a class="btn ghost" href="#ready">Ready for demo</a>
        <a class="btn ghost" href="#roles">Try a role</a>
        <a class="btn ghost" href="#upcoming">Upcoming</a>
        <a class="btn ghost" href="#contact">Contact</a>
        <a class="btn" href="#/site/home">School website</a>
        <a class="btn primary" href="#/app/principal/today">Open the app →</a>
      </div>
    </header>
    <section class="hero">
      <div>
        <span class="tag pri">For CBSE & State-board schools in Tier 2/3 India</span>
        <h1 style="margin-top:12px">Run the whole school from one phone-friendly app — in English and हिन्दी.</h1>
        <p class="lead">Attendance in 30 seconds, WhatsApp alerts to parents, a fee counter that prints receipts, report cards, a parent portal and the school’s own website. Every school’s data is isolated by design.</p>
        <div class="row mt">
          <a class="btn primary lg" href="#roles">Explore as any role</a>
          <a class="btn lg" href="#/app/teacher/attendance">Mark attendance now</a>
          <a class="btn lg" href="#contact">Book a free demo</a>
        </div>
        <p class="small muted mt">This is a clickable demo with synthetic data. Change anything — it is saved only in your browser. Use <b>Reset demo</b> at the top to start over.</p>
      </div>
      <div class="hero-art" aria-hidden="true">
        <div class="row between"><b>Today · ${esc(D.school.todayLabel)}</b><span class="tag" style="background:#F5A524;color:#1A1A1A">Sunrise</span></div>
        <div class="grid g2 mt">
          <div class="mini">Attendance<br><b>94.2%</b><br><small>17 of 20 sections</small></div>
          <div class="mini">Fees today<br><b>₹1.86 L</b><br><small>41 receipts</small></div>
          <div class="mini">Absentees informed<br><b>31 / 33</b><br><small>WhatsApp, Hindi</small></div>
          <div class="mini">Term 1 marks<br><b>11 / 14</b><br><small>subjects submitted</small></div>
        </div>
        <div class="mini" style="margin:0">💬 “नमस्ते, Aarav आज विद्यालय में अनुपस्थित है…” <small>— absence alert, 09:05</small></div>
      </div>
    </section>

    <section class="section" id="roles">
      <h2>Step into any role</h2>
      <p class="muted">Each role sees only what it is allowed to. Switch roles at any time from the top bar.</p>
      <div class="grid g4">${roleCards.map(([k, ic, t, d]) => `
        <a class="card role-card" href="#/app/${k}"><span class="ic">${ic}</span><b>${t}</b><span class="who">${esc(d)}</span><span class="small" style="color:var(--primary);font-weight:700">Enter →</span></a>`).join('')}
        <a class="card role-card" href="#/site/home"><span class="ic">🌐</span><b>Public website</b><span class="who">The school’s own site — notices, galleries, admissions form</span><span class="small" style="color:var(--primary);font-weight:700">Visit →</span></a>
      </div>
    </section>

    <section class="section" id="ready">
      <div class="row between"><h2 style="margin:0">Ready for demo</h2>
        <div class="legend">${statusTag('ready')} ${statusTag('partly')}</div></div>
      <p class="muted">Built and working in the real product: ${D.storiesBuilt} of ${D.storiesTotal} stories. Click any item to see it.</p>
      <div class="grid g2">${ready.map((f) => `
        <div class="card"><div class="row between"><span class="tag">Epic ${f.epic}</span>${statusTag(f.upcoming ? 'partly' : 'ready')}</div>
          <h3 class="mt" style="margin-bottom:4px">${esc(f.title)}</h3>
          <ul class="small" style="padding-left:18px;margin:6px 0">${f.ready.map(([t, href]) => `<li><a href="${href}">${esc(t)}</a></li>`).join('')}</ul>
          ${f.upcoming ? '<p class="small muted" style="margin:0">The rest is listed under Upcoming.</p>' : ''}</div>`).join('')}
      </div>
    </section>

    <section class="section" id="upcoming">
      <div class="row between"><h2 style="margin:0">Upcoming</h2><div class="legend">${statusTag('upcoming')} ${statusTag('roadmap')} ${statusTag('exploring')}</div></div>
      <p class="muted">Designed but not built yet. These demo screens show how they will work, using sample data.</p>
      <div class="grid g2">${upcoming.map((f) => `
        <div class="card" style="border-style:dashed"><div class="row between"><span class="tag">Epic ${f.epic}</span>${statusTag('upcoming')}</div>
          <h3 class="mt" style="margin-bottom:4px">${esc(f.title)}</h3><p class="muted small">${esc(f.upcoming)}</p>
          <a class="btn sm" href="${f.link}">Preview →</a></div>`).join('')}
      </div>
      <h3 class="mt">After the pilot</h3>
      <div class="grid g3">${D.roadmapCatalog.map((f) => `
        <div class="card" style="border-style:dashed"><div class="row between"><span class="tag">${f.n}</span>${statusTag(f.status)}</div>
          <h3 class="mt" style="margin-bottom:4px">${esc(f.title)}</h3><p class="muted small">${esc(f.desc)}</p>
          <a class="btn sm" href="${f.link}">Preview →</a></div>`).join('')}
      </div>
    </section>

    <section class="section">
      <div class="grid g3">
        <div class="card"><h3>🔒 Privacy by design</h3><p class="muted small">Each school’s data is isolated in the database itself. Every sensitive action is audited. Parents and students have their own separate sign-in realms.</p></div>
        <div class="card"><h3>📱 Built for real phones</h3><p class="muted small">Works from 320 px phones to large screens, offline attendance queue, installable app, Devanagari-safe typography.</p></div>
        <div class="card"><h3>🎨 Every school’s brand</h3><p class="muted small">Five colour presets with light and dark modes — try them from the top bar inside the app.</p></div>
      </div>
    </section>
    ${contactSection()}
    <footer class="section small muted" style="text-align:center">Vidyalaya ERP demo · synthetic data · © 2026</footer>`;
  };

  // ---------- Contact the team (real details from D.contact; the page itself sends nothing) ----------
  const C = D.contact;
  const waLink = (text) => `https://wa.me/${String(C.whatsapp).replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;
  const mailLink = (subject, body) => `mailto:${C.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  const HELLO = 'Hello, I saw the Vidyalaya ERP demo and I am interested for our school.';
  function contactSection() {
    const buttons = [
      C.whatsapp && `<a class="btn primary" href="${esc(waLink(HELLO))}" target="_blank" rel="noopener">💬 Chat on WhatsApp</a>`,
      C.email && `<a class="btn" href="${esc(mailLink('Vidyalaya ERP demo enquiry', HELLO))}">✉️ ${esc(C.email)}</a>`,
      C.linkedin && `<a class="btn" href="${esc(C.linkedin)}" target="_blank" rel="noopener">🔗 LinkedIn</a>`,
    ].filter(Boolean).join('');
    return `
    <section class="section" id="contact">
      <div class="grid g2">
        <div class="card">
          <h2 style="margin-top:0">Interested for your school?</h2>
          <p class="muted">Talk to ${esc(C.name)}, the founder. Ask for a free walkthrough on a call, or for a demo set up with your own school’s name, classes and fee heads.</p>
          <ul class="muted small">
            <li>Attendance, WhatsApp alerts, fees, exams and parent portal in one app</li>
            <li>English, हिन्दी and Hinglish</li>
            <li>Every school detail is editable — no code changes to onboard a new school</li>
          </ul>
          <div class="row mt">${buttons}</div>
        </div>
        <form class="card" data-form="book-demo">
          <h3 style="margin-top:0">Book a free demo</h3>
          <div class="stack">
            <label class="field">Your name<input type="text" name="name" required autocomplete="name"></label>
            <label class="field">School name and city<input type="text" name="school" required></label>
            <label class="field">Your role<select name="role"><option>Principal</option><option>Owner / Trustee</option><option>School Admin</option><option>Teacher</option><option>Other</option></select></label>
            <label class="field">Number of students<select name="size"><option>Under 300</option><option>300–800</option><option>800–1500</option><option>Over 1500</option></select></label>
            <label class="field">Your phone or WhatsApp number<input type="tel" name="phone" required autocomplete="tel"></label>
            <label class="field">Anything you want to see?<textarea name="msg" placeholder="e.g. fee receipts, WhatsApp absence alerts"></textarea></label>
            <div class="row">${C.whatsapp ? '<button class="btn primary" name="via" value="wa">Send on WhatsApp</button>' : ''}${C.email ? `<button class="btn ${C.whatsapp ? '' : 'primary'}" name="via" value="mail">Send by email</button>` : ''}</div>
            <p class="small muted">This opens your own WhatsApp or email app with the message ready. Nothing is sent until you press send there.</p>
          </div>
        </form>
      </div>
    </section>`;
  }
  D.forms['book-demo'] = (d, f, e) => {
    const text = `${HELLO}\n\nName: ${d.name}\nSchool: ${d.school}\nRole: ${d.role}\nStudents: ${d.size}\nPhone: ${d.phone}${d.msg ? `\nWould like to see: ${d.msg}` : ''}`;
    const via = (e && e.submitter && e.submitter.value) || (C.whatsapp ? 'wa' : 'mail');
    if (via === 'wa') window.open(waLink(text), '_blank', 'noopener');
    else location.href = mailLink(`Demo request — ${d.school}`, text);
  };

  // ---------- School website ----------
  const SITE_PAGES = [['home', 'Home'], ['about', 'About'], ['academics', 'Academics'], ['admissions', 'Admissions'], ['facilities', 'Facilities'], ['gallery', 'Gallery'], ['notices', 'Notices'], ['disclosure', 'Disclosure'], ['contact', 'Contact']];
  const grad = ['#3730A3,#7C3AED', '#B54708,#F5A524', '#0F766E,#22C55E', '#6B2166,#E4572E', '#1D5FBF,#0EA5E9', '#2F6B3F,#A3E635'];
  const ph = (label, i) => `<div class="ph" style="background:linear-gradient(135deg,${grad[i % grad.length]})">${esc(label)}</div>`;

  D.views.site = (page, arg) => {
    const s = D.school;
    const nav = SITE_PAGES.map(([k, v]) => `<a href="#/site/${k}" class="${k === page ? 'on' : ''}">${v}</a>`).join('');
    const body = (sitePages[page] || sitePages.home)(arg);
    if (page === 'home') D.afterRender = startSlider;
    return `
    <div class="site-top"><div class="in"><span>📞 ${esc(s.phone)} · ✉️ ${esc(s.email)}</span>
      <span><a href="#/app/parent/home">Parent login</a> · <a href="#/app/student/home">Student login</a> · <a href="#/app/teacher/today">Staff login</a></span></div></div>
    <nav class="site-nav"><div class="in"><a class="brand" href="#/site/home"><div class="logo sun">SPS</div><div>${esc(s.name)}<div class="small muted" style="font-weight:600">${esc(s.motto)}</div></div></a>
      <div class="links">${nav}<a href="#/site/apply" class="btn accent sm" style="margin-left:6px">Apply online</a></div></div></nav>
    ${body}
    <footer class="site-footer"><div class="in">
      <div><b style="color:#fff">${esc(s.name)}</b><br>${esc(s.address)}<br>${esc(s.board)}</div>
      <div><b style="color:#fff">Quick links</b><br><a href="#/site/admissions">Admissions</a><br><a href="#/site/notices">Notices</a><br><a href="#/site/disclosure">Mandatory disclosure</a></div>
      <div><b style="color:#fff">Portals</b><br><a href="#/app/parent/home">Parent portal</a><br><a href="#/app/student/home">Student portal</a><br><a href="#/">About this demo</a></div>
    </div></footer>`;
  };

  function startSlider() {
    const slides = document.querySelectorAll('.site-hero .slide');
    if (!slides.length) return;
    let i = 0;
    clearInterval(D._slider);
    D._slider = setInterval(() => {
      if (!document.body.contains(slides[0])) return clearInterval(D._slider);
      slides[i].classList.remove('on'); i = (i + 1) % slides.length; slides[i].classList.add('on');
    }, 4500);
  }

  const pageHead = (t, sub) => `<div style="background:linear-gradient(135deg,var(--primary),color-mix(in srgb,var(--primary) 55%,#000));color:#fff"><div class="site-wrap" style="padding:36px 20px"><h1 style="margin:0">${esc(t)}</h1>${sub ? `<p style="opacity:.85;margin:6px 0 0">${esc(sub)}</p>` : ''}</div></div>`;

  const sitePages = {
    home: () => {
      const imp = D.notices.find((n) => n.important);
      return `
      <section class="site-hero">
        ${['Admissions open for 2027–28', 'Science Exhibition 2026 — 120 projects', 'Inter-school football champions'].map((t, i) => `
          <div class="slide ${i === 0 ? 'on' : ''}" style="background:linear-gradient(135deg,${grad[i]})"></div>`).join('')}
        <div class="cap"><h1>Welcome to ${esc(D.school.name)}</h1><p style="font-size:18px;max-width:640px">A CBSE school in ${esc(D.school.city)} nurturing curious, kind and confident learners since ${D.school.founded}.</p>
          <div class="row"><a class="btn accent lg" href="#/site/apply">Apply for admission</a><a class="btn lg" href="#/site/about">Discover our school</a></div></div>
      </section>
      <div class="marquee" role="marquee"><span>📢 ${D.notices.map((n) => esc(n.title)).join('  •  ')}</span></div>
      <div class="site-wrap">
        ${imp && !D.state.ackNotices.includes(imp.id) ? `<div class="notice-banner warn mb row between"><div><b>Important:</b> ${esc(imp.title)} — ${esc(imp.body)}</div><button class="btn sm" data-act="ack-notice" data-id="${imp.id}">Got it</button></div>` : ''}
        <div class="grid g4">
          ${[['🎓', 'Students', '610+'], ['👩‍🏫', 'Teachers', '38'], ['🏆', 'Board results', '98.4%'], ['🧪', 'Labs', '5']].map(([i, l, v]) => `<div class="card" style="text-align:center"><div style="font-size:28px">${i}</div><div class="stat"><span class="value">${v}</span><span class="label">${l}</span></div></div>`).join('')}
        </div>
        <div class="grid g3 mt">
          <div class="card span2"><h2>Principal’s welcome</h2><p class="muted">“At Sunrise we believe every child can shine. Our teachers combine strong academics with sports, arts and values so that children grow into thoughtful citizens. We welcome you to visit us.”</p><b>— ${esc(D.school.principal)}</b></div>
          <div class="card"><h3>Quick links</h3><div class="stack">
            <a class="btn block" href="#/site/admissions">📝 Admission procedure</a><a class="btn block" href="#/site/academics">📅 Academic calendar</a>
            <a class="btn block" href="#/site/disclosure">📄 Mandatory disclosure</a><a class="btn block" href="#/app/parent/home">👪 Parent portal</a></div></div>
        </div>
        <h2 class="mt">Latest notices</h2>
        <div class="grid g2">${D.notices.slice(0, 4).map((n) => `<div class="card"><span class="small muted">${esc(n.date)}</span><h3 style="margin:4px 0">${esc(n.title)}</h3><p class="small muted">${esc(n.body)}</p></div>`).join('')}</div>
      </div>`;
    },
    about: () => `${pageHead('About the school', 'History, leadership and affiliation')}<div class="site-wrap grid g3">
      <div class="card span2"><h2>Our story</h2><p>Founded in ${D.school.founded} with 60 children in two rooms, ${esc(D.school.name)} today serves over 600 students from Nursery to Class 10. We are affiliated to ${esc(D.school.board)}.</p>
        <h3>Vision</h3><p class="muted">To be a joyful school where every child learns to think, care and lead.</p><h3>Mission</h3><ul class="muted"><li>Concept-first teaching with small class sizes</li><li>Bilingual confidence in English and Hindi/Marathi</li><li>Sports, arts and community service for every child</li></ul></div>
      <div class="card"><h3>Leadership</h3>${[['Dr. Anjali Deshpande', 'Principal'], ['Mrs. Kavita Kulkarni', 'HOD Science'], ['Mr. Manoj Gupta', 'HOD Mathematics'], ['Mrs. Sunita Patil', 'Office Superintendent']].map(([n, r], i) => `<div class="list-item"><div class="avatar" style="background:linear-gradient(135deg,${grad[i]});color:#fff">${n.split(' ').map((x) => x[0]).slice(-2).join('')}</div><div class="grow"><b>${n}</b><div class="small muted">${r}</div></div></div>`).join('')}</div></div>`,
    academics: () => `${pageHead('Academics & calendar', 'Curriculum, examinations, timings and uniform')}<div class="site-wrap grid g2">
      <div class="card"><h3>Curriculum</h3><div class="table-wrap"><table><tr><th>Stage</th><th>Classes</th><th>Focus</th></tr>
        <tr><td>Foundational</td><td>Nursery–2</td><td>Play-based literacy & numeracy</td></tr><tr><td>Preparatory</td><td>3–5</td><td>Languages, EVS, maths, arts</td></tr>
        <tr><td>Middle</td><td>6–8</td><td>Science, social science, computing</td></tr><tr><td>Secondary</td><td>9–10</td><td>CBSE board preparation</td></tr></table></div>
        <h3 class="mt">Timings</h3><p class="muted small">Classes 1–10: 7:45 am – 1:45 pm (Mon–Sat, 2nd & 4th Saturday off)</p></div>
      <div class="card"><h3>Upcoming</h3>${D.calendar.map((c) => `<div class="list-item"><span class="tag ${c.kind === 'holiday' ? 'info' : c.kind === 'exam' ? 'warn' : 'pri'}">${esc(c.date)}</span><div class="grow">${esc(c.what)}</div></div>`).join('')}</div></div>`,
    admissions: () => `${pageHead('Admissions 2027–28', 'Procedure, published fees and forms')}<div class="site-wrap grid g2">
      <div class="card"><h3>How to apply</h3><ol class="muted"><li>Submit the online application (no login needed).</li><li>The office reviews it and calls you within 3 working days.</li><li>Child interaction & document verification.</li><li>Fee payment and admission confirmation.</li></ol><a class="btn primary" href="#/site/apply">Start online application</a></div>
      <div class="card"><h3>Published fee structure (${esc(D.school.year)})</h3><div class="table-wrap"><table><tr><th>Classes</th><th class="r">Annual fee</th><th>Instalments</th></tr>
        ${D.feeStructure.map((f) => `<tr><td>${f.cls}</td><td class="r num">${money(f.annual)}</td><td>${f.instalments} (${f.due.join(', ')})</td></tr>`).join('')}</table></div>
        <p class="small muted mt">Downloadable forms: Admission form (PDF), Transfer certificate sample (PDF) — demo placeholders.</p></div></div>`,
    apply: () => `${pageHead('Online admission application', 'Your details are private and go only to the school office')}<div class="site-wrap" style="max-width:820px">
      <form class="card" data-form="apply"><div class="form-grid">
        <label class="field">Child’s full name<input type="text" name="child" required value="Advay Patil"></label>
        <label class="field">Class applying for<select name="cls">${['Nursery', 'LKG', 'UKG', ...Array.from({ length: 9 }, (_, i) => `Class ${i + 1}`)].map((c) => `<option>${c}</option>`).join('')}</select></label>
        <label class="field">Date of birth<input type="date" name="dob" value="2021-06-14"></label>
        <label class="field">Previous school (if any)<input type="text" name="prev" placeholder="Optional"></label>
        <label class="field">Parent / guardian name<input type="text" name="parent" required value="Swati Patil"></label>
        <label class="field">Mobile number<input type="tel" name="mobile" required value="+91 90000 12345"></label>
        <label class="field full"><span><input type="checkbox" required checked> I have read the admission privacy notice and agree that the school may contact me about this application.</span></label>
      </div><div class="row mt"><button class="btn primary lg">Submit application</button><span class="small muted">Demo: the application appears in the School Admin’s “Admissions” inbox.</span></div></form></div>`,
    submitted: (id) => `${pageHead('Application submitted')}<div class="site-wrap" style="max-width:700px"><div class="card notice-banner ok"><h2>Thank you! 🎉</h2><p>Your application number is <b>${esc(id)}</b>. The school office will contact you within 3 working days.</p>
      <div class="row"><a class="btn primary" href="#/app/admin/admissions">See it as the School Admin →</a><a class="btn" href="#/site/home">Back to home</a></div></div></div>`,
    facilities: () => `${pageHead('Facilities', 'Spaces where learning happens')}<div class="site-wrap grid g3">${['Smart classrooms', 'Physics, Chemistry & Biology labs', 'Computer lab (40 systems)', 'Library — 9,000 books', 'Sports ground & skating rink', 'Music & dance studio'].map((f, i) => `<div class="card">${ph(f, i)}<h3 class="mt">${f}</h3></div>`).join('')}</div>`,
    gallery: () => `${pageHead('Photo & video gallery', 'Only photos with publication consent are shown')}<div class="site-wrap"><div class="grid g4">${['Annual Day 2026', 'Science Exhibition', 'Sports Day', 'Independence Day', 'Diwali craft fair', 'Tree plantation', 'Inter-school football', 'Yoga Day'].map((f, i) => `<div>${ph(f, i)}<div class="small muted mt">${12 + i * 3} photos</div></div>`).join('')}</div></div>`,
    notices: () => `${pageHead('Notices & circulars')}<div class="site-wrap stack">${D.notices.map((n) => `<div class="card"><div class="row between"><span class="small muted">${esc(n.date)}</span>${n.important ? '<span class="tag warn">Important</span>' : ''}</div><h3 style="margin:6px 0">${esc(n.title)}</h3><p class="muted">${esc(n.body)}</p></div>`).join('')}</div>`,
    disclosure: () => `${pageHead('Mandatory public disclosure', 'As required for CBSE-affiliated schools')}<div class="site-wrap"><div class="table-wrap card" style="padding:0"><table>
      ${[['Name of the school', D.school.name], ['Affiliation', D.school.board], ['Address', D.school.address], ['Principal', D.school.principal], ['Total teachers', '38 (PGT 8, TGT 16, PRT 14)'], ['Campus area', '8,200 sq m'], ['Fire safety certificate', 'Valid till Mar 2027 (PDF)'], ['Water & sanitation certificate', 'Valid (PDF)'], ['School management committee', 'List (PDF)'], ['Board results — Class 10 (2026)', '142 appeared · 98.4% pass']].map(([a, b]) => `<tr><th style="text-transform:none;font-size:14px;width:40%">${esc(a)}</th><td>${esc(b)}</td></tr>`).join('')}</table></div></div>`,
    contact: () => `${pageHead('Contact us')}<div class="site-wrap grid g2">
      <div class="card"><h3>Visit us</h3><p>${esc(D.school.address)}<br>📞 ${esc(D.school.phone)}<br>✉️ ${esc(D.school.email)}</p><div class="ph" style="background:linear-gradient(135deg,#94a3b8,#475569)">🗺️ Map (embedded map in the real site)</div></div>
      <form class="card" data-form="enquiry"><h3>Send an enquiry</h3><div class="stack"><label class="field">Your name<input type="text" name="from" required value="Rohit K."></label>
        <label class="field">Topic<input type="text" name="topic" required value="Is there a school bus from Satpur?"></label><label class="field">Message<textarea name="msg">Please share route details.</textarea></label>
        <button class="btn primary">Send enquiry</button></div></form></div>`,
  };

  D.forms.apply = (d) => {
    const id = `APP-0${143 + D.state.applications.length - 3}`;
    D.state.applications.unshift({ id, child: d.child, cls: d.cls, parent: d.parent, mobile: d.mobile, date: 'Today', status: 'new' });
    D.save();
    D.go(`#/site/submitted/${id}`);
  };
  D.forms.enquiry = (d) => {
    D.state.enquiries.unshift({ from: d.from, topic: d.topic, date: 'Today', status: 'new' });
    D.save();
    D.modal(`<h2>Enquiry received ✓</h2><p>Thank you, ${esc(d.from)}. The office will reply soon.</p><p class="small muted">Demo: see it under School Admin → Website → Enquiries.</p><div class="modal-actions"><button class="btn primary" data-act="modal-close">OK</button></div>`);
  };
  D.act['ack-notice'] = (el) => { D.state.ackNotices.push(el.dataset.id); D.save(); D.render(); };
})();
