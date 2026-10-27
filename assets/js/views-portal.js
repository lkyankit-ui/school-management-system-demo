/* Parent portal, Student portal and Operator console. */
(function () {
  const D = window.DEMO;
  const { esc, money } = D;
  const S = () => D.state;
  D.ui = D.ui || {};

  const KIDS = ['S-AARAV', 'S-DIYA'];
  const kid = () => D.findStudent(D.ui.child || KIDS[0]);
  const kidData = (st) => D.childData[st.id];
  const homeworkFor = (st) => [...S().homework.filter((h) => h.sec === st.section), ...kidData(st).homework];

  function childSwitcher() {
    return `<div class="chips mb" role="tablist" aria-label="Choose child">${KIDS.map((id) => { const s = D.findStudent(id); return `<button class="chip ${kid().id === id ? 'on' : ''}" data-act="child" data-id="${id}" role="tab" aria-selected="${kid().id === id}">${s.gender === 'F' ? '👧' : '👦'} ${esc(s.name.split(' ')[0])} · ${s.section}</button>`; }).join('')}</div>`;
  }
  D.act.child = (el) => { D.ui.child = el.dataset.id; D.render(); };

  const att = (st) => S().attendance[st.section];
  const todayStatus = (st) => { const a = att(st); if (!a) return ['Not marked yet', 'warn']; return a.absent.includes(st.id) ? ['Absent today', 'bad'] : ['Present today', 'ok']; };

  function pHome() {
    const st = kid(); const d = kidData(st); const [ts, tc] = todayStatus(st);
    const hw = homeworkFor(st).filter((h) => h.status === 'pending');
    const due = D.dueOf(st);
    return `<h1>Namaste, Meena 🙏</h1>${childSwitcher()}
      <div class="grid g4">
        <div class="card stat"><span class="label">Today</span><span class="value" style="font-size:22px"><span class="tag ${tc}" style="font-size:15px">${ts}</span></span><span class="sub">Attendance ${st.attendancePct}% this year</span></div>
        ${D.kpi('Homework due', hw.length, hw[0] ? esc(hw[0].subj) + ' due ' + esc(hw[0].due) : 'All done')}
        ${D.kpi('Fees due', due ? money(due) : '₹0', due ? 'Instalment 3 · due 10 Nov' : 'Fully paid ✓')}
        ${D.kpi('PTM', '31 Oct', S().ptm.rsvp ? `RSVP: ${S().ptm.rsvp}` : '10:30 am · please RSVP')}
      </div>
      <div class="grid g2 mt">
        <div class="card"><div class="card-head"><h3>Latest remark</h3><a class="small" href="#/app/parent/remarks">All remarks →</a></div>${d.remarks[0] ? `<p>“${esc(d.remarks[0].text)}”</p><span class="small muted">${esc(d.remarks[0].by)} · ${esc(d.remarks[0].date)}</span>` : ''}</div>
        <div class="card"><h3>Quick actions</h3><div class="stack">${due ? `<a class="btn primary block" href="#/app/parent/fees">💳 ${D.t('Pay now')} ${money(due)}</a>` : ''}<a class="btn block" href="#/app/parent/attendance">📝 Send an absence note</a><a class="btn block" href="#/app/parent/results">📊 ${D.t('Report card')}</a><a class="btn block" href="#/app/parent/ptm">📅 RSVP for PTM</a></div></div>
      </div>`;
  }

  function pAttendance() {
    const st = kid(); const d = kidData(st);
    const notes = S().absenceNotes.filter((n) => n.student === st.id);
    return `${childSwitcher()}<div class="grid g2"><div class="card"><h3>October 2026 · ${esc(st.name)}</h3><div class="cal">${['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((x) => `<div class="h">${x}</div>`).join('')}<div class="d X"></div><div class="d X"></div><div class="d X"></div>${d.cal.split('').map((c, i) => `<div class="d ${c}">${i + 1}</div>`).join('')}</div>
        <div class="legend mt"><span class="tag ok">Present</span><span class="tag bad">Absent</span><span class="tag info">Holiday</span></div></div>
      <div class="card"><h3>Send an absence note</h3><form data-form="absnote" class="stack"><label class="field">Date<select name="date"><option>28 Oct (tomorrow)</option><option>29 Oct</option><option>30 Oct</option></select></label>
        <label class="field">Reason<select name="reason"><option>Fever</option><option>Family function</option><option>Medical appointment</option><option>Other</option></select></label><button class="btn primary">Send to class teacher</button></form>
        <p class="small muted mt">When the teacher marks ${esc(st.name.split(' ')[0])} absent on that day, you won’t get an alert — the school already knows.</p>
        ${notes.map((n) => `<div class="list-item"><span class="tag info">Sent</span><div class="grow">${esc(n.date)} — ${esc(n.reason)}</div></div>`).join('')}</div></div>`;
  }
  D.forms.absnote = (d) => { S().absenceNotes.push({ student: kid().id, date: d.date, reason: d.reason }); D.save(); D.toast(`Note sent to the class teacher of ${kid().section}.`, 'ok'); D.render(); };

  function pHomework() {
    const st = kid();
    return `${childSwitcher()}<div class="card"><h3>Homework · ${esc(st.name)}</h3>${homeworkFor(st).map((h) => `<div class="list-item"><span class="tag pri">${esc(h.subj)}</span><div class="grow"><b>${esc(h.title)}</b><div class="small muted">by ${esc(h.by)} · due ${esc(h.due)}</div></div><span class="tag ${h.status === 'submitted' ? 'ok' : 'warn'}">${h.status}</span></div>`).join('')}</div>`;
  }

  function resultsView(st) {
    if (!S().resultsPublished) return `<div class="card"><div class="empty"><div style="font-size:40px">⏳</div><b>Term 1 results are not published yet.</b><p class="small">Demo tip: switch to the <a href="#/app/principal/results">Principal → Results</a> page, lock marks and publish. The report card then appears here and on WhatsApp.</p></div></div>`;
    return `${D.reportCardHtml(st)}<div class="row mt"><button class="btn" data-act="print">Download PDF</button></div>`;
  }
  const pResults = () => `${childSwitcher()}${resultsView(kid())}`;

  function feesView(st, who) {
    const due = D.dueOf(st);
    const mine = S().receipts.filter((r) => r.student.startsWith(st.name));
    return `<div class="grid g2"><div class="card"><div class="card-head"><h3>Dues · ${esc(st.name)}</h3>${due ? `<span class="tag warn">${money(due)} due</span>` : '<span class="tag ok">Paid up</span>'}</div>
      ${due ? `<div class="table-wrap"><table><tr><th>Item</th><th class="r">Amount</th></tr>${D.feeHeads.map((h) => `<tr><td>Instalment 3 · ${h.head}</td><td class="r num">${money(h.amount)}</td></tr>`).join('')}</table></div>
        ${S().modules.onlinePay ? `<button class="btn primary lg mt" data-act="checkout" data-id="${st.id}" data-who="${who}">💳 ${D.t('Pay now')} ${money(due)}</button><p class="small muted mt">Secure hosted checkout (sandbox in this demo). UPI, cards and net-banking.</p>` : '<div class="notice-banner warn mt">Online payment is switched off by the school. Please pay at the office.</div>'}` : '<p class="muted">Nothing to pay right now.</p>'}</div>
      <div class="card"><h3>Payment history</h3>${[...mine.map((r) => [r.no, r.amount, r.mode, 'Today']), ['R/26-27/00611', 9000, 'UPI', '08 Jul'], ['R/26-27/00102', 13500, 'Cash', '06 Apr']].map(([no, a, m, d]) => `<div class="list-item"><div class="grow"><b>${esc(no)}</b><div class="small muted">${esc(d)} · ${esc(m)}</div></div><b class="num">${money(a)}</b></div>`).join('')}</div></div>`;
  }
  const pFees = () => `${childSwitcher()}${feesView(kid(), 'parent')}`;
  D.act.checkout = (el) => {
    const st = D.findStudent(el.dataset.id); const due = D.dueOf(st);
    D.modal(`<div style="text-align:center"><div class="tag info">Sandbox payment gateway</div><h2 class="mt">Pay ${money(due)}</h2><p class="muted">${esc(D.school.name)} · ${esc(st.name)} (${st.section})</p></div>
      <div class="chips mt" style="justify-content:center"><span class="chip on">UPI</span><span class="chip">Card</span><span class="chip">Net banking</span></div>
      <label class="field mt">UPI ID<input type="text" value="meena@okbank"></label>
      <div class="modal-actions"><button class="btn" data-act="modal-close">Cancel</button><button class="btn primary" data-act="pay-confirm" data-id="${st.id}">Pay securely</button></div>`);
  };
  D.act['pay-confirm'] = (el) => {
    const st = D.findStudent(el.dataset.id); const due = D.dueOf(st);
    D.modal(`<div class="empty"><div style="font-size:40px">⏳</div><b>Verifying with the payment provider…</b><p class="small">Your receipt appears only after the school’s ledger confirms the money.</p></div>`);
    setTimeout(() => {
      S().paid = S().paid || {}; S().paid[st.id] = D.paidOf(st.id) + due;
      const r = { no: `R/26-27/0${S().receiptSeq++}`, student: `${st.name} (${st.section})`, amount: due, mode: 'Online · UPI', time: D.nowTime() };
      S().receipts.unshift(r);
      S().onlinePayments.unshift({ ref: 'PAY-' + (7790 + S().onlinePayments.length), student: r.student, amount: due, status: 'posted', at: r.time });
      D.save();
      D.sendWA(st.guardian, 'Payment receipt', `Sunrise Public School: online payment of ${money(due)} for ${st.name} received. Receipt ${r.no}.`, { quiet: true });
      D.modal(`<div class="notice-banner ok"><h2>Payment posted ✓</h2>${money(due)} received for ${esc(st.name)}.</div><div class="mt">${D.receiptHtml(r)}</div><div class="modal-actions"><button class="btn" data-act="print">Download receipt</button><button class="btn primary" data-act="modal-close">Done</button></div>`, { wide: true });
      D.render();
    }, 1400);
  };

  function pRemarks() {
    const st = kid();
    return `${childSwitcher()}<div class="card"><h3>Remarks from teachers</h3>${kidData(st).remarks.map((r, i) => { const k = `${st.id}-${i}`; const ack = S().ackNotices.includes(k); return `<div class="list-item"><span class="tag ${r.kind === 'appreciation' ? 'ok' : 'warn'}">${r.kind === 'appreciation' ? '⭐' : '💡'} ${r.kind}</span><div class="grow">${esc(r.text)}<div class="small muted">${esc(r.by)} · ${esc(r.date)}</div></div>${ack ? '<span class="tag ok">Seen ✓</span>' : `<button class="btn sm" data-act="ack" data-k="${k}">Acknowledge</button>`}</div>`; }).join('')}</div>`;
  }
  D.act.ack = (el) => { S().ackNotices.push(el.dataset.k); D.save(); D.toast('Acknowledged — the teacher can see you read it.', 'ok'); D.render(); };

  function pPtm() {
    const p = S().ptm;
    return `<div class="card" style="max-width:640px"><h3>Parent–Teacher Meeting</h3><p><b>${esc(p.date)}</b> · ${esc(p.time)} · Classrooms 6-B and 3-A</p><p class="muted">Term 1 answer sheets will be shown. Please bring the student diary.</p>
      <div class="row">${['Attending', 'Not attending', 'Need another time'].map((x) => `<button class="chip ${p.rsvp === x ? 'on' : ''}" data-act="rsvp" data-v="${x}">${x}</button>`).join('')}</div></div>`;
  }
  D.act.rsvp = (el) => { S().ptm.rsvp = el.dataset.v; D.save(); D.toast(`RSVP sent: ${el.dataset.v}.`, 'ok'); D.render(); };

  const pNotices = () => `<div class="stack">${D.notices.map((n) => `<div class="card"><div class="row between"><span class="small muted">${esc(n.date)}</span>${n.important ? '<span class="tag warn">Important</span>' : ''}</div><h3 style="margin:6px 0">${esc(n.title)}</h3><p class="muted">${esc(n.body)}</p></div>`).join('')}</div>`;

  D.roles.parent = {
    label: 'Parent', icon: '👪',
    nav: [
      { id: 'home', label: 'Home', icon: '🏠' }, { id: 'attendance', label: 'Attendance', icon: '📅' }, { id: 'homework', label: 'Homework', icon: '📚' },
      { id: 'results', label: 'Results', icon: '📊' }, { id: 'fees', label: 'Fees', icon: '💳' }, { id: 'remarks', label: 'Remarks', icon: '⭐' },
      { id: 'ptm', label: 'PTM', icon: '🤝' }, { id: 'notices', label: 'Notices', icon: '📢' },
    ],
    pages: { home: pHome, attendance: pAttendance, homework: pHomework, results: pResults, fees: pFees, remarks: pRemarks, ptm: pPtm, notices: pNotices },
  };

  // ---------- Student ----------
  const me = () => D.findStudent('S-AARAV');
  D.roles.student = {
    label: 'Student', icon: '🎒',
    nav: [{ id: 'home', label: 'Home', icon: '🏠' }, { id: 'homework', label: 'Homework', icon: '📚' }, { id: 'results', label: 'Results', icon: '📊' }, { id: 'fees', label: 'Fees', icon: '💳' }, { id: 'account', label: 'My account', icon: '👤' }],
    pages: {
      home: () => { const hw = homeworkFor(me()).filter((h) => h.status === 'pending'); return `<h1>Hi Aarav! 🎒</h1><div class="grid g3">${D.kpi('Homework pending', hw.length, hw[0] ? esc(hw[0].title) : '')}${D.kpi('Attendance', me().attendancePct + '%', 'this year')}${D.kpi('Term 1', S().resultsPublished ? 'Out!' : 'Soon', S().resultsPublished ? 'See Results' : 'Not published yet')}</div><div class="card mt"><h3>Due soon</h3>${hw.map((h) => `<div class="list-item"><span class="tag pri">${esc(h.subj)}</span><div class="grow">${esc(h.title)}</div><span class="small muted">${esc(h.due)}</span></div>`).join('')}</div>`; },
      homework: () => `<div class="card"><h3>My homework</h3>${homeworkFor(me()).map((h) => `<div class="list-item"><span class="tag pri">${esc(h.subj)}</span><div class="grow"><b>${esc(h.title)}</b><div class="small muted">${esc(h.by)} · due ${esc(h.due)}</div></div><span class="tag ${h.status === 'submitted' ? 'ok' : 'warn'}">${h.status}</span></div>`).join('')}</div>`,
      results: () => resultsView(me()),
      fees: () => feesView(me(), 'student'),
      account: () => `<div class="card" style="max-width:520px"><h3>My account</h3><p><b>Aarav Sharma</b> · 6-B · SPS/2401</p><p class="small muted">Student accounts are separate from parent accounts. A student session never opens the parent portal.</p><button class="btn" data-act="go" data-to="#/app/student/home">Change password</button></div>`,
    },
  };

  // ---------- Operator ----------
  function opOverview() {
    const sc = D.operatorSchools;
    return `<div class="grid g4">${D.kpi('Schools', sc.length, '1 production · 2 staging')}${D.kpi('Students', sc.reduce((a, s) => a + s.students, 0), 'across all schools')}${D.kpi('WhatsApp this month', sc.reduce((a, s) => a + s.msgs, 0), '96.1% delivered')}${D.kpi('Backups', '✓ 03:00', 'restore drill passed 21 Oct')}</div>
      <div class="notice-banner mt">The operator console never shows students’ or guardians’ personal data — only counts and health.</div>
      <div class="grid g2 mt"><div class="card"><h3>Platform health</h3>${[['API /health/ready', 'ok'], ['Worker heartbeat (12 s ago)', 'ok'], ['PostgreSQL 17 + PITR', 'ok'], ['Off-machine backup (≤ 24 h)', 'ok'], ['TLS certificate (62 days)', 'ok'], ['Disk 41% used', 'ok']].map(([n, s]) => `<div class="list-item"><span class="tag ${s}">●</span><div class="grow">${n}</div></div>`).join('')}</div>
        <div class="card"><h3>Pilot metrics (weekly)</h3>${D.barRow('Sections marked by 9:30', 91, 'ok')}${D.barRow('Absence alerts delivered < 15 min', 97, 'ok')}${D.barRow('Receipts printed < 60 s', 94, 'ok')}${D.barRow('Guardians verified', 92, 'ok')}</div></div>`;
  }
  function opSchools() {
    return `<div class="card"><div class="card-head"><h3>Schools</h3><button class="btn primary sm" data-act="new-school">+ Create school</button></div>
      <div class="table-wrap"><table><tr><th>School</th><th>Code</th><th>Environment</th><th>Status</th><th>Students</th><th>Theme</th><th></th></tr>${D.operatorSchools.map((s) => `<tr><td><b>${esc(s.name)}</b></td><td><code>${esc(s.code)}</code></td><td><span class="tag ${s.env === 'production' ? 'bad' : 'info'}">${s.env}</span></td><td><span class="tag ${s.status === 'Demo' ? 'pri' : 'warn'}">${s.status}</span></td><td class="num">${s.students}</td><td>${esc((D.presets.find((p) => p[0] === s.preset) || ['', s.preset])[1])}</td><td><button class="btn sm" data-act="preview-brand" data-p="${s.preset}">Preview brand</button></td></tr>`).join('')}</table></div></div>`;
  }
  D.act['new-school'] = () => D.modal(`<h2>Create a branded school</h2><form data-form="new-school" class="form-grid"><label class="field">School name<input type="text" name="name" required value="Shree Ganesh Vidya Mandir"></label><label class="field">School code<input type="text" name="code" required value="sgvm"></label>
    <label class="field">Environment<select name="env"><option>staging</option><option>production</option></select></label><label class="field">Theme preset<select name="preset">${D.presets.map(([k, v]) => `<option value="${k}">${v}</option>`).join('')}</select></label>
    <label class="field full"><span><input type="checkbox" name="demo" checked> Load the synthetic demo data profile (600 students)</span></label>
    <div class="modal-actions full"><button type="button" class="btn" data-act="modal-close">Cancel</button><button class="btn primary">Create & issue first admin</button></div></form>`);
  D.forms['new-school'] = (d) => {
    D.operatorSchools.push({ name: d.name, code: d.code, env: d.env, status: d.env === 'production' ? 'Setup' : 'Demo', students: d.demo ? 600 : 0, preset: d.preset, modules: 3, msgs: 0, gates: 0 });
    D.modal(`<h2>School created ✓</h2><p><b>${esc(d.name)}</b> is ready in ${esc(d.env)}.</p><div class="notice-banner">First School Admin: <code>admin</code> · temporary password shown once · must be changed at first sign-in.</div><div class="modal-actions"><button class="btn primary" data-act="modal-close">Done</button></div>`);
    D.render();
  };
  D.act['preview-brand'] = (el) => { D.prefs.preset = el.dataset.p; D.savePrefs(); D.applyPrefs(); D.render(); D.toast('Theme switched to this school’s brand.', 'ok'); };

  function opGates() {
    const g = S().gates;
    const passed = Object.values(g).filter((x) => x === 'passed').length;
    return `<div class="card"><div class="card-head"><h3>Go-live gates · Sunrise Public School</h3><span class="tag ${passed === 12 ? 'ok' : 'warn'}">${passed} / 12 passed</span></div>
      <p class="small muted">A school may hold real data only when G1–G6 pass. Live WhatsApp needs G7–G9; fees need G10; publishing results needs G11; the parent portal needs G12.</p>
      <div class="table-wrap"><table><tr><th>Gate</th><th>Scope</th><th>Condition</th><th>Status</th><th></th></tr>${D.gates.map(([id, sc, c]) => `<tr><td><b>${id}</b></td><td>${sc === 'P' ? 'Platform' : 'School'}</td><td>${esc(c)}</td><td><span class="tag ${g[id] === 'passed' ? 'ok' : 'warn'}">${g[id]}</span></td><td>${g[id] !== 'passed' ? `<button class="btn sm" data-act="gate" data-id="${id}">Record evidence</button>` : ''}</td></tr>`).join('')}</table></div></div>`;
  }
  D.act.gate = (el) => { S().gates[el.dataset.id] = 'passed'; if (el.dataset.id === 'G8' && S().gates.G9 === 'passed') S().messagingMode = 'live'; D.save(); D.toast(`${el.dataset.id} evidence recorded and audited.`, 'ok'); D.render(); };

  function opModules() {
    const m = S().modules;
    const names = { attendance: 'Attendance', messaging: 'WhatsApp messaging', fees: 'Fees', exams: 'Exams & report cards', website: 'Public website', portal: 'Parent portal', onlinePay: 'Online fee payment', importer: 'CSV import' };
    return `<div class="grid g2"><div class="card"><h3>Module switches · Sunrise</h3>${Object.entries(names).map(([k, v]) => `<div class="list-item"><div class="grow"><b>${v}</b></div><label class="switch"><input type="checkbox" data-change="module" data-k="${k}" ${m[k] ? 'checked' : ''}><span></span></label></div>`).join('')}
      <p class="small muted mt">Try it: turn off “Online fee payment”, then open Parent → Fees.</p></div>
      <div class="card"><h3>Messaging mode</h3><div class="chips">${['off', 'verification', 'live'].map((x) => `<button class="chip ${S().messagingMode === x ? 'on' : ''}" data-act="msg-mode" data-v="${x}">${x}</button>`).join('')}</div><p class="small muted mt">Verification = opt-in requests and staff tests only. Live needs gates G7, G8 and G9.</p></div></div>`;
  }
  D.change.module = (el) => { S().modules[el.dataset.k] = el.checked; D.save(); D.toast(`Module ${el.checked ? 'enabled' : 'disabled'} for Sunrise.`, 'ok'); };
  D.act['msg-mode'] = (el) => {
    if (el.dataset.v === 'live' && !['G7', 'G8', 'G9'].every((g) => S().gates[g] === 'passed')) return D.toast('Blocked: gates G7, G8 and G9 must pass before live messaging.');
    S().messagingMode = el.dataset.v; D.save(); D.render();
  };

  function opSupport() {
    const a = S().supportAccess;
    return `<div class="card" style="max-width:720px"><h3>Support access</h3><p class="muted">The operator can see a school’s data only through an audited, time-boxed grant with a stated reason.</p>
      ${a ? `<div class="notice-banner ok">Active: read-only access to <b>Sunrise</b> until ${esc(a.until)} · reason: ${esc(a.reason)}</div><button class="btn danger mt" data-act="revoke-support">End access now</button>`
        : `<form data-form="support" class="form-grid"><label class="field">School<select name="s"><option>Sunrise Public School</option><option>Green Valley Vidyalaya</option></select></label><label class="field">Duration<select name="d"><option>30 minutes</option><option>60 minutes</option></select></label><label class="field full">Reason<input type="text" name="r" required value="Help the office with CSV column mapping"></label><div class="full"><button class="btn primary">Start audited access</button></div></form>`}</div>`;
  }
  D.forms.support = (d) => { S().supportAccess = { until: d.d === '30 minutes' ? '+30 min' : '+60 min', reason: d.r }; D.save(); D.render(); };
  D.act['revoke-support'] = () => { S().supportAccess = null; D.save(); D.render(); };

  D.roles.operator = {
    label: 'Operator', icon: '🛰️',
    nav: [{ id: 'overview', label: 'Overview', icon: '📡' }, { id: 'schools', label: 'Schools', icon: '🏫' }, { id: 'gates', label: 'Go-live gates', icon: '🚦' }, { id: 'modules', label: 'Modules', icon: '🧩' }, { id: 'support', label: 'Support access', icon: '🛟' }],
    pages: { overview: opOverview, schools: opSchools, gates: opGates, modules: opModules, support: opSupport },
  };
})();
