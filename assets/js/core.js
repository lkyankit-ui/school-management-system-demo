/* Core: state, persistence, router, shell, i18n, theming, modal, toasts and the WhatsApp simulator. */
(function () {
  const D = window.DEMO;
  const STATE_KEY = 'sunrise-demo-state-v1';
  const PREF_KEY = 'sunrise-demo-prefs-v1';

  // ---------- helpers ----------
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const money = (n) => '₹' + Number(n).toLocaleString('en-IN');
  const nowTime = () => new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
  const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);
  Object.assign(D, { esc, money, nowTime, pct });

  const store = {
    get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* private mode: state stays in memory */ } },
    del(k) { try { localStorage.removeItem(k); } catch { /* ignore */ } },
  };

  // ---------- state ----------
  function freshState() {
    let s = 7;
    const r = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
    const attendance = {};
    for (const sec of D.sections) {
      if (['6-B', '4-B', '8-A'].includes(sec.id)) continue; // still pending this morning
      const absent = sec.students.filter(() => r() < 0.06).map((x) => x.id);
      attendance[sec.id] = { absent, late: [], at: `08:${String(20 + Math.floor(r() * 40)).padStart(2, '0')}`, by: sec.classTeacher };
    }
    return {
      attendance,
      wa: [
        { to: 'Meena Devi', kind: 'Fee reminder', text: 'नमस्ते, Sunrise Public School: Aarav (6-B) की ₹4,500 की तीसरी किस्त 10 नवंबर को देय है। Reply STOP to opt out.', time: 'Yesterday' },
        { to: 'Meena Devi', kind: 'School notice', text: 'Sunrise Public School: Diwali vacation from 2–8 November. Classes resume 9 November.', time: '25 Oct' },
      ],
      receipts: [
        { no: 'R/26-27/01186', student: 'Ishaan Patil (8-A)', amount: 13000, mode: 'UPI', time: '08:51' },
        { no: 'R/26-27/01187', student: 'Kavya Joshi (5-B)', amount: 4500, mode: 'Cash', time: '08:58' },
      ],
      receiptSeq: 1188, dayClosed: false,
      cheques: [
        { no: '004512', bank: 'SBI Nashik', student: 'Om Gaikwad (9-B)', amount: 13000, status: 'pending' },
        { no: '118870', bank: 'HDFC Gangapur Rd', student: 'Tanvi Rao (7-A)', amount: 10500, status: 'pending' },
        { no: '220019', bank: 'Bank of Maharashtra', student: 'Yash Pawar (10-A)', amount: 13000, status: 'cleared' },
      ],
      leaves: [
        { id: 'L1', who: 'Rahul Pawar', dept: 'Science', type: 'Casual leave', from: '30 Oct', to: '30 Oct', days: 1, reason: 'Family function', status: 'pending', approver: 'HOD' },
        { id: 'L2', who: 'Kavita Kulkarni', dept: 'Science (HOD)', type: 'Earned leave', from: '12 Nov', to: '13 Nov', days: 2, reason: 'Travel', status: 'pending', approver: 'Principal' },
        { id: 'L3', who: 'Asha Shinde', dept: 'Social Science (no HOD)', type: 'Sick leave', from: '28 Oct', to: '28 Oct', days: 1, reason: 'Medical appointment', status: 'pending', approver: 'Principal' },
      ],
      myLeaves: [{ type: 'Casual leave', from: '03 Oct', to: '03 Oct', days: 1, status: 'approved' }],
      concessions: [
        { id: 'C1', student: 'Riya More (4-A)', kind: 'Sibling 10%', amount: 3600, by: 'Sunita Patil', status: 'pending' },
        { id: 'C2', student: 'Harsh Kale (9-B)', kind: 'Staff ward 25%', amount: 13000, by: 'Sunita Patil', status: 'pending' },
      ],
      reversals: [{ id: 'RV1', receipt: 'R/26-27/01142', student: 'Neha Singh (2-B)', amount: 4500, reason: 'Duplicate entry — paid twice by UPI', status: 'pending' }],
      homework: [],
      applications: [
        { id: 'APP-0142', child: 'Advik Kulkarni', cls: 'Nursery', parent: 'Sachin Kulkarni', mobile: '+91 98xxxx 2211', date: '26 Oct', status: 'new' },
        { id: 'APP-0141', child: 'Mira Chavan', cls: 'Class 5', parent: 'Rekha Chavan', mobile: '+91 97xxxx 8890', date: '25 Oct', status: 'under review' },
        { id: 'APP-0139', child: 'Sai Deshmukh', cls: 'Class 1', parent: 'Mahesh Deshmukh', mobile: '+91 99xxxx 1020', date: '22 Oct', status: 'interview scheduled' },
      ],
      enquiries: [
        { from: 'Priya M.', topic: 'Transport availability for Indira Nagar', date: '26 Oct', status: 'new' },
        { from: 'R. Kale', topic: 'Class 11 streams offered?', date: '24 Oct', status: 'answered' },
      ],
      tasks: [
        { id: 'T1', title: 'Upload Term 1 question paper', to: ['Rahul Pawar', 'Shruti Rao', 'Nikhil Singh'], due: '20 Oct', status: 'overdue', done: 1 },
        { id: 'T2', title: 'Submit lab safety checklist', to: ['Priya Iyer', 'Deepak More'], due: '24 Oct', status: 'overdue', done: 0 },
        { id: 'T3', title: 'Science exhibition project shortlist', to: ['Gauri Bhosale', 'Sanjay Mishra'], due: '05 Nov', status: 'open', done: 0 },
      ],
      staffRemarks: [{ about: 'Rahul Pawar', by: 'Kavita Kulkarni', date: '18 Oct', text: 'Classroom observation 9-A: good use of demonstrations; increase student questioning.', shared: true }],
      checkIn: null,
      marks: {},
      marksSubmitted: false,
      marksLocked: false,
      resultsPublished: false,
      modules: { attendance: true, messaging: true, fees: true, exams: true, website: true, portal: true, onlinePay: true, importer: true },
      gates: { G1: 'passed', G2: 'passed', G3: 'passed', G4: 'passed', G5: 'passed', G6: 'passed', G7: 'passed', G8: 'pending', G9: 'pending', G10: 'passed', G11: 'pending', G12: 'pending' },
      messagingMode: 'verification', killSwitch: false,
      absenceNotes: [],
      ptm: { date: 'Sat, 31 Oct 2026', time: '10:30', rsvp: null },
      ackNotices: [],
      onlinePayments: [
        { ref: 'PAY-7781', student: 'Anika Rao (7-B)', amount: 10500, status: 'posted', at: '07:12' },
        { ref: 'PAY-7782', student: 'Dhruv Jadhav (10-A)', amount: 13000, status: 'unresolved', at: '07:40' },
        { ref: 'PAY-7784', student: 'Saanvi More (1-B)', amount: 9000, status: 'verifying', at: '08:47' },
      ],
      importStep: 0,
      supportAccess: null,
      erasure: [{ id: 'ER-12', subject: 'Former applicant · APP-0098', requested: '20 Oct', status: 'awaiting approval' }],
      published: { home: true, about: true, admissions: true, gallery: false },
      pendingSync: [],
      offline: false,
    };
  }
  D.state = store.get(STATE_KEY) || freshState();
  D.prefs = Object.assign({ lang: 'en', preset: 'indigo-marigold', theme: 'light' }, store.get(PREF_KEY) || {});
  D.save = () => store.set(STATE_KEY, D.state);
  D.savePrefs = () => store.set(PREF_KEY, D.prefs);
  D.resetDemo = () => { store.del(STATE_KEY); D.state = freshState(); D.ui = {}; D.toast('Demo reset to its starting data.', 'ok'); D.render(); };

  // ---------- i18n (key UI strings; the real product ships full EN + HI catalogues) ----------
  const HI = {
    'Today': 'आज', 'Students': 'विद्यार्थी', 'Guardians': 'अभिभावक', 'Attendance': 'उपस्थिति', 'Fees': 'शुल्क', 'Exams': 'परीक्षा', 'Results': 'परिणाम',
    'Homework': 'गृहकार्य', 'Notices': 'सूचनाएँ', 'Staff': 'कर्मचारी', 'Settings': 'सेटिंग्स', 'Approvals': 'स्वीकृतियाँ', 'Reports': 'रिपोर्ट', 'Audit log': 'ऑडिट लॉग',
    'My sections': 'मेरे सेक्शन', 'Mark attendance': 'उपस्थिति दर्ज करें', 'Enter marks': 'अंक दर्ज करें', 'My attendance & leave': 'मेरी उपस्थिति व अवकाश',
    'Collect fee': 'शुल्क जमा करें', 'Day close': 'दिन बंद', 'Cheques': 'चेक', 'Online payments': 'ऑनलाइन भुगतान', 'Home': 'मुख्य पृष्ठ',
    'Remarks': 'टिप्पणियाँ', 'PTM': 'अभिभावक-शिक्षक बैठक', 'Import students': 'विद्यार्थी आयात', 'Messaging': 'संदेश', 'Academic setup': 'शैक्षणिक संरचना',
    'Calendar': 'कैलेंडर', 'Website': 'वेबसाइट', 'Admissions': 'प्रवेश', 'Data rights': 'डेटा अधिकार', 'Department': 'विभाग', 'Tasks': 'कार्य',
    'Leave approvals': 'अवकाश स्वीकृति', 'Marks review': 'अंक समीक्षा', 'Syllabus': 'पाठ्यक्रम', 'Schools': 'विद्यालय', 'Go-live gates': 'गो-लाइव गेट',
    'Present': 'उपस्थित', 'Absent': 'अनुपस्थित', 'Late': 'देर से', 'Submit attendance': 'उपस्थिति जमा करें', 'Switch role': 'भूमिका बदलें',
    'Good morning': 'सुप्रभात', 'Pay now': 'अभी भुगतान करें', 'Report card': 'रिपोर्ट कार्ड', 'My account': 'मेरा खाता', 'Account': 'खाता',
    'Overview': 'अवलोकन', 'Support access': 'सहायता पहुँच', 'Modules': 'मॉड्यूल', 'Reset demo': 'डेमो रीसेट करें',
  };
  D.t = (s) => (D.prefs.lang === 'hi' && HI[s]) || s;

  // ---------- theming ----------
  D.applyPrefs = () => {
    const root = document.documentElement;
    root.dataset.preset = D.prefs.preset;
    root.dataset.theme = D.prefs.theme;
    root.lang = D.prefs.lang === 'hinglish' ? 'hi-Latn' : D.prefs.lang;
  };
  D.presets = [['indigo-marigold', 'Indigo & Marigold'], ['saffron-hearth', 'Saffron Hearth'], ['teal-coral', 'Teal & Coral'], ['plum-gold', 'Plum & Gold'], ['forest-sand', 'Forest & Sand']];

  // ---------- toasts, modal ----------
  D.toast = (msg, kind = '') => {
    const box = document.getElementById('toasts');
    const el = document.createElement('div');
    el.className = `toast ${kind}`;
    el.textContent = msg;
    box.appendChild(el);
    setTimeout(() => el.remove(), 3800);
  };
  D.modal = (html, opts = {}) => {
    D.closeModal();
    const bg = document.createElement('div');
    bg.className = 'modal-bg';
    bg.id = 'modal';
    bg.innerHTML = `<div class="modal ${opts.wide ? 'wide' : ''}" role="dialog" aria-modal="true">${html}</div>`;
    bg.addEventListener('click', (e) => { if (e.target === bg) D.closeModal(); });
    document.body.appendChild(bg);
    const f = bg.querySelector('input, select, textarea, button.primary');
    if (f) f.focus();
  };
  D.closeModal = () => { const m = document.getElementById('modal'); if (m) m.remove(); };

  // ---------- WhatsApp simulator ----------
  D.sendWA = (to, kind, text, opts = {}) => {
    if (D.state.killSwitch) { D.toast('Kill switch is ON — message held, not sent.', ''); return; }
    D.state.wa.unshift({ to, kind, text, time: nowTime() });
    D.state.waUnread = (D.state.waUnread || 0) + 1;
    D.save();
    if (!opts.quiet) D.toast(`WhatsApp → ${to}: ${kind}`, 'wa');
    D.renderWA();
  };
  D.renderWA = () => {
    const fab = document.getElementById('wa-fab');
    const n = D.state.waUnread || 0;
    fab.innerHTML = `💬${n ? `<span class="cnt">${n}</span>` : ''}`;
    const panel = document.getElementById('wa-panel');
    if (panel.hidden) return;
    panel.innerHTML = `
      <div class="wa-head"><div class="logo sun" style="width:32px;height:32px;font-size:13px">SPS</div>
        <div><b>Sunrise Public School</b><div style="font-size:11px;opacity:.85">Simulated guardian WhatsApp · nothing is really sent</div></div>
        <button class="x" data-act="wa-close" aria-label="Close">×</button></div>
      <div class="wa-body">${D.state.wa.length ? D.state.wa.slice().reverse().map((m) => `
        <div class="wa-msg ${m.out ? 'out' : ''}"><span class="kind">${m.out ? esc(m.kind) : `${esc(m.kind)} → ${esc(m.to)}`}</span>${esc(m.text)}<span class="meta">${esc(m.time)} ✓✓</span></div>`).join('') : '<div class="wa-empty">No messages yet. Mark a student absent, collect a fee or publish results to see WhatsApp alerts arrive here.</div>'}
      </div>${D.waReplyBar ? D.waReplyBar() : ''}`;
    const body = panel.querySelector('.wa-body');
    body.scrollTop = body.scrollHeight;
  };

  // ---------- routing ----------
  D.roles = {};
  D.views = {};
  D.route = () => {
    const parts = (location.hash.replace(/^#\/?/, '') || '').split('/').filter(Boolean);
    return { area: parts[0] || '', role: parts[1], page: parts[2], arg: parts[3], parts };
  };
  D.go = (hash) => { location.hash = hash; };

  D.render = () => {
    const keepY = window.scrollY;
    const r = D.route();
    const app = document.getElementById('app');
    document.body.classList.remove('nav-open');
    let html;
    if (r.area === 'app' && D.roles[r.role]) html = shell(r);
    else if (r.area === 'site') html = D.views.site(r.parts[1] || 'home', r.parts[2]);
    else html = D.views.landing();
    app.innerHTML = ribbon() + html;
    D.renderWA();
    if (D.afterRender) { const f = D.afterRender; D.afterRender = null; f(); }
    // Plain anchors such as #features or #contact scroll to that section of the landing page.
    const anchor = /^#[\w-]+$/.test(location.hash) && document.getElementById(location.hash.slice(1));
    if (anchor) anchor.scrollIntoView();
    else if (D._lastHash === location.hash) window.scrollTo(0, keepY); else window.scrollTo(0, 0);
    D._lastHash = location.hash;
  };

  function ribbon() {
    return `<div class="demo-ribbon no-print"><span>🎓 <b>Interactive demo</b> — synthetic data only, nothing is sent or stored on a server.</span>
      <a href="#/">All features</a><a href="#/site/home">School website</a><a href="#contact">Interested? Contact us</a><button data-act="reset">${D.t('Reset demo')}</button></div>`;
  }

  function shell(r) {
    const role = D.roles[r.role];
    const page = r.page && role.pages[r.page] ? r.page : role.nav[0].id;
    const navItem = role.nav.find((n) => n.id === page);
    const person = D.people[r.role];
    let lastGroup = null;
    const nav = role.nav.map((n) => {
      const g = n.group && n.group !== lastGroup ? `<div class="nav-group">${esc(n.group)}</div>` : '';
      lastGroup = n.group || lastGroup;
      const badge = n.badge ? n.badge() : 0;
      return `${g}<a href="#/app/${r.role}/${n.id}" class="${n.id === page ? 'on' : ''}"><span aria-hidden="true">${n.icon}</span>${esc(D.t(n.label))}${badge ? `<span class="badge">${badge}</span>` : ''}</a>`;
    }).join('');
    const roleOpts = Object.entries(D.roles).map(([k, v]) => `<option value="${k}" ${k === r.role ? 'selected' : ''}>${v.icon} ${esc(v.label)}</option>`).join('');
    return `
    <div class="shell">
      <aside class="sidebar" aria-label="Main navigation">
        <a class="brand" href="#/"><div class="logo sun">SPS</div><div>${esc(r.role === 'operator' ? 'Platform Console' : D.school.name)}<small>${esc(r.role === 'operator' ? 'Operator — all schools' : D.school.city)}</small></div></a>
        <nav class="nav">${nav}</nav>
        <div style="margin-top:auto;padding:12px 8px 0" class="small muted">Signed in as<br><b style="color:var(--text)">${esc(person.name)}</b><br>${esc(person.role)}${person.extra ? ' · ' + esc(person.extra) : ''}</div>
      </aside>
      <div class="main">
        <header class="topbar">
          <button class="btn sm menu-btn" data-act="nav-toggle" aria-label="Open menu">☰</button>
          <div class="title">${esc(D.t(navItem ? navItem.label : role.label))}</div>
          <label class="hide-sm small muted" for="role-switch">${D.t('Switch role')}</label>
          <select id="role-switch" data-change="role" aria-label="Switch role">${roleOpts}</select>
          <select data-change="lang" aria-label="Language"><option value="en" ${D.prefs.lang === 'en' ? 'selected' : ''}>English</option><option value="hi" ${D.prefs.lang === 'hi' ? 'selected' : ''}>हिन्दी</option><option value="hinglish" ${D.prefs.lang === 'hinglish' ? 'selected' : ''}>Hinglish (beta)</option><option value="mr" ${D.prefs.lang === 'mr' ? 'selected' : ''}>मराठी (roadmap)</option></select>
          <select class="hide-sm" data-change="preset" aria-label="Theme preset">${D.presets.map(([k, v]) => `<option value="${k}" ${D.prefs.preset === k ? 'selected' : ''}>${v}</option>`).join('')}</select>
          <button class="btn sm" data-act="theme" aria-label="Toggle dark mode">${D.prefs.theme === 'dark' ? '☀️' : '🌙'}</button>
          <div class="avatar" title="${esc(person.name)}">${esc(person.initials)}</div>
        </header>
        <main class="content" id="content">${role.pages[page](r.arg)}</main>
      </div>
    </div>`;
  }

  // ---------- events ----------
  D.act = {
    reset: () => { if (confirm('Reset the demo to its starting data?')) D.resetDemo(); },
    'nav-toggle': () => document.body.classList.toggle('nav-open'),
    theme: () => { D.prefs.theme = D.prefs.theme === 'dark' ? 'light' : 'dark'; D.savePrefs(); D.applyPrefs(); D.render(); },
    'modal-close': () => D.closeModal(),
    'wa-close': () => { document.getElementById('wa-panel').hidden = true; },
    go: (el) => D.go(el.dataset.to),
    print: () => window.print(),
  };
  D.change = {
    role: (el) => D.go(`#/app/${el.value}`),
    lang: (el) => { D.prefs.lang = el.value; D.savePrefs(); D.applyPrefs(); D.render(); },
    preset: (el) => { D.prefs.preset = el.value; D.savePrefs(); D.applyPrefs(); D.render(); },
  };
  D.forms = {};

  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-act]');
    if (!el) return;
    const fn = D.act[el.dataset.act];
    if (fn) { e.preventDefault(); fn(el, e); }
  });
  document.addEventListener('change', (e) => {
    const el = e.target.closest('[data-change]');
    if (el && D.change[el.dataset.change]) D.change[el.dataset.change](el, e);
  });
  document.addEventListener('submit', (e) => {
    const f = e.target.closest('form[data-form]');
    if (!f) return;
    e.preventDefault();
    const data = Object.fromEntries(new FormData(f).entries());
    D.forms[f.dataset.form] && D.forms[f.dataset.form](data, f, e);
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') D.closeModal(); });
  window.addEventListener('hashchange', D.render);

  D.boot = () => {
    D.applyPrefs();
    const fab = document.getElementById('wa-fab');
    fab.addEventListener('click', () => {
      const p = document.getElementById('wa-panel');
      p.hidden = !p.hidden;
      D.state.waUnread = 0; D.save();
      D.renderWA();
    });
    D.render();
  };
})();
