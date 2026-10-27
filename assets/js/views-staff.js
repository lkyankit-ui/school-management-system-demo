/* Shared helpers plus the Principal and School Admin roles. */
(function () {
  const D = window.DEMO;
  const { esc, money, pct } = D;
  const S = () => D.state;

  // ---------- shared helpers ----------
  D.att = () => {
    let present = 0, absent = 0, total = 0, marked = 0;
    const pending = [];
    for (const sec of D.sections) {
      const a = S().attendance[sec.id];
      if (!a) { pending.push(sec); continue; }
      marked++; total += sec.students.length; absent += a.absent.length; present += sec.students.length - a.absent.length;
    }
    return { present, absent, total, marked, sections: D.sections.length, pending };
  };
  D.paidOf = (id) => (S().paid && S().paid[id]) || 0;
  D.dueOf = (st) => Math.max(0, st.feeDue - D.paidOf(st.id));
  D.collectedToday = () => S().receipts.reduce((a, r) => a + r.amount, 0) + 168500;
  const hash = (s) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 9973, 7);
  D.marksFor = (st) => (D.childData[st.id] && D.childData[st.id].marks) ||
    Object.fromEntries(D.subjects.map((sub) => [sub, 48 + (hash(st.id + sub) % 50)]));

  D.reportCardHtml = (st) => {
    const m = D.marksFor(st);
    const tot = Object.values(m).reduce((a, b) => a + b, 0);
    const p = Math.round(tot / Object.keys(m).length);
    return `<div class="paper"><div class="row between"><div class="row"><div class="logo sun">SPS</div><div><b style="font-size:17px">${esc(D.school.name)}</b><div class="small" style="color:#555">${esc(D.school.address)} · ${esc(D.school.board)}</div></div></div><b>REPORT CARD · TERM 1 · ${esc(D.school.year)}</b></div>
      <hr><div class="row between small"><span><b>Name:</b> ${esc(st.name)}</span><span><b>Class:</b> ${esc(st.section)}</span><span><b>Roll:</b> ${st.roll}</span><span><b>Adm. No:</b> ${esc(st.adm)}</span></div>
      <table class="mt"><tr><th>Subject</th><th class="r">Marks (100)</th><th>Grade</th></tr>${Object.entries(m).map(([k, v]) => `<tr><td>${esc(k)}</td><td class="r num">${v}</td><td>${D.grade(v)}</td></tr>`).join('')}
      <tr><td><b>Overall</b></td><td class="r num"><b>${p}%</b></td><td><b>${D.grade(p)}</b></td></tr></table>
      <p class="small mt"><b>Attendance:</b> ${st.attendancePct}% · <b>Class teacher’s remark:</b> ${p > 85 ? 'Excellent effort and consistent work. Keep it up!' : 'Good progress; more practice in weaker subjects will help.'}</p>
      <div class="row between small" style="margin-top:24px;color:#555"><span>Class teacher</span><span>Principal — ${esc(D.school.principal)}</span><span>Generated ${esc(D.school.today)}</span></div></div>`;
  };

  D.receiptHtml = (r) => `<div class="paper"><div class="row between"><div class="row"><div class="logo sun">SPS</div><div><b>${esc(D.school.name)}</b><div class="small" style="color:#555">${esc(D.school.address)}</div></div></div><div style="text-align:right"><b>FEE RECEIPT</b><div class="small">${esc(r.no)}</div></div></div>
    <hr><div class="small"><b>Student:</b> ${esc(r.student)} · <b>Date:</b> ${esc(D.school.today)} ${esc(r.time)} · <b>Mode:</b> ${esc(r.mode)}</div>
    <table class="mt"><tr><th>Fee head</th><th class="r">Amount</th></tr>${(r.lines || [['Instalment', r.amount]]).map(([h, a]) => `<tr><td>${esc(h)}</td><td class="r num">${money(a)}</td></tr>`).join('')}
    <tr><td><b>Total received</b></td><td class="r num"><b>${money(r.amount)}</b></td></tr></table>
    <p class="small mt" style="color:#555">Computer-generated receipt. Receipt numbers are gapless; a payment is never edited — only reversed with Principal approval.</p></div>`;

  D.kpi = (label, value, sub, cls = '') => `<div class="card stat ${cls}"><span class="label">${label}</span><span class="value">${value}</span>${sub ? `<span class="sub">${sub}</span>` : ''}</div>`;
  D.barRow = (label, p, cls = '') => `<div class="mb"><div class="row between small"><span>${label}</span><b class="num">${p}%</b></div><div class="bar ${cls}"><span style="width:${p}%"></span></div></div>`;

  // ---------- Today (Principal + Admin) ----------
  function today() {
    const a = D.att();
    const informed = S().wa.filter((m) => m.kind === 'Absence alert').length + 28;
    const pendingLeaves = S().leaves.filter((l) => l.status === 'pending' && l.approver === 'Principal').length;
    const pendingFin = S().concessions.filter((c) => c.status === 'pending').length + S().reversals.filter((c) => c.status === 'pending').length;
    const staffPresent = D.staff.filter((s) => ['present', 'late', 'half-day'].includes(s.att)).length;
    return `
      <div class="row between mb"><div><h1 style="margin:0">${D.t('Good morning')}, ${esc(D.people.principal.name.split(' ')[1])} 👋</h1><span class="muted">${esc(D.school.todayLabel)} · working day</span></div>
        <div class="row"><a class="btn" href="#/app/principal/reports">Reports</a><a class="btn primary" href="#/app/principal/approvals">Approvals (${pendingLeaves + pendingFin})</a></div></div>
      <div class="grid g4">
        ${D.kpi('Student attendance', `${pct(a.present, a.total)}%`, `${a.marked} of ${a.sections} sections marked`)}
        ${D.kpi('Absentees informed', `${informed} / ${a.absent + 2}`, 'WhatsApp · English & Hindi')}
        ${D.kpi('Fees collected today', money(D.collectedToday()), `${S().receipts.length + 39} receipts · month ₹14.2 L`)}
        ${D.kpi('Staff present', `${staffPresent} / ${D.staff.length}`, '1 on leave · 1 not marked')}
      </div>
      <div class="grid g3 mt">
        <div class="card span2"><div class="card-head"><h3>Attendance by section</h3><span class="small muted">Tap a pending section to nudge its class teacher</span></div>
          <div class="roster" style="grid-template-columns:repeat(auto-fill,minmax(92px,1fr))">${D.sections.map((sec) => {
            const r = S().attendance[sec.id];
            return r ? `<div class="pupil" style="cursor:default;flex-direction:column;align-items:flex-start;gap:0"><b>${sec.id}</b><span class="st">${sec.students.length - r.absent.length}/${sec.students.length}</span></div>`
              : `<button class="pupil absent" style="flex-direction:column;align-items:flex-start;gap:0" data-act="nudge" data-sec="${sec.id}"><b>${sec.id}</b><span class="st">Pending</span></button>`;
          }).join('')}</div></div>
        <div class="card"><h3>Needs attention</h3>
          ${a.pending.length ? `<div class="list-item"><span class="tag bad">${a.pending.length}</span><div class="grow">Sections not marked: ${a.pending.map((p) => p.id).join(', ')}</div></div>` : '<div class="list-item"><span class="tag ok">✓</span><div class="grow">All sections marked</div></div>'}
          <div class="list-item"><span class="tag warn">${pendingFin}</span><div class="grow">Finance approvals (concessions, reversals)</div></div>
          <div class="list-item"><span class="tag warn">${pendingLeaves}</span><div class="grow">Leave requests routed to you</div></div>
          <div class="list-item"><span class="tag info">2</span><div class="grow">Guardian replies waiting in the inbox</div></div>
          <div class="list-item"><span class="tag pri">11/14</span><div class="grow">Term 1 marks submitted</div></div>
        </div>
      </div>
      <div class="grid g2 mt">
        <div class="card"><h3>Fee collection — last 7 days</h3><div class="vbars" style="margin-bottom:24px">${[62, 88, 45, 120, 95, 30, D.collectedToday() / 2000].map((v, i) => `<div class="vb" style="height:${Math.min(100, v / 1.3)}%"><span>${['W', 'T', 'F', 'S', 'M', 'Su', 'T'][i]}</span></div>`).join('')}</div></div>
        <div class="card"><h3>Today’s calendar</h3>${D.calendar.slice(0, 4).map((c) => `<div class="list-item"><span class="tag ${c.kind === 'holiday' ? 'info' : 'pri'}">${esc(c.date)}</span><div class="grow">${esc(c.what)}</div></div>`).join('')}</div>
      </div>`;
  }
  D.act.nudge = (el) => D.toast(`Reminder sent to the class teacher of ${el.dataset.sec}.`, 'ok');

  // ---------- Principal ----------
  function approvals() {
    const st = S();
    const row = (title, items, render) => `<div class="card mb"><h3>${title}</h3>${items.length ? items.map(render).join('') : '<div class="empty">Nothing pending 🎉</div>'}</div>`;
    const btns = (kind, id) => `<button class="btn sm primary" data-act="approve" data-kind="${kind}" data-id="${id}">Approve</button><button class="btn sm danger" data-act="reject" data-kind="${kind}" data-id="${id}">Reject</button>`;
    const status = (s) => `<span class="tag ${s === 'approved' ? 'ok' : s === 'rejected' ? 'bad' : 'warn'}">${s}</span>`;
    return `<p class="muted">Finance approvals and report-card publishing stay with the Principal. Academic approvals go to HODs; leave from HODs and from departments without an HOD comes here.</p>
      ${row('Fee concessions', st.concessions, (c) => `<div class="list-item"><div class="grow"><b>${esc(c.student)}</b> — ${esc(c.kind)} (${money(c.amount)}/yr)<div class="small muted">Proposed by ${esc(c.by)}</div></div>${c.status === 'pending' ? btns('concessions', c.id) : status(c.status)}</div>`)}
      ${row('Payment reversals', st.reversals, (c) => `<div class="list-item"><div class="grow"><b>${esc(c.receipt)}</b> · ${esc(c.student)} · ${money(c.amount)}<div class="small muted">${esc(c.reason)}</div></div>${c.status === 'pending' ? btns('reversals', c.id) : status(c.status)}</div>`)}
      ${row('Leave requests routed to Principal', st.leaves.filter((l) => l.approver === 'Principal'), (l) => `<div class="list-item"><div class="grow"><b>${esc(l.who)}</b> · ${esc(l.dept)}<div class="small muted">${esc(l.type)} · ${esc(l.from)}${l.to !== l.from ? '–' + esc(l.to) : ''} (${l.days} day) · ${esc(l.reason)}</div></div>${l.status === 'pending' ? btns('leaves', l.id) : status(l.status)}</div>`)}
      ${row('Day Close reopen requests', st.reopenRequest ? [st.reopenRequest] : [], () => `<div class="list-item"><div class="grow"><b>Reopen today’s Day Close</b><div class="small muted">Requested by Vikram Joshi</div></div>${btns('reopen', 'x')}</div>`)}`;
  }
  D.act.approve = (el) => decide(el, 'approved');
  D.act.reject = (el) => decide(el, 'rejected');
  function decide(el, status) {
    const { kind, id } = el.dataset;
    if (kind === 'reopen') {
      S().reopenRequest = null;
      if (status === 'approved') S().dayClosed = false;
    } else {
      const item = S()[kind].find((x) => x.id === id);
      item.status = status;
      const mine = kind === 'leaves' && S().myLeaves.find((l) => l.id === id);
      if (mine) mine.status = status;
    }
    D.save();
    D.toast(`${status === 'approved' ? 'Approved' : 'Rejected'} — recorded in the audit log.`, 'ok');
    D.render();
  }

  function results() {
    const st = S();
    const ex = D.exams[0];
    const submitted = st.marksSubmitted ? ex.submitted + 1 : ex.submitted;
    const sec = D.section('6-B');
    return `
      <div class="steps">${['Marks entry', 'HOD review', 'Lock', 'Preview', 'Publish'].map((s, i) => {
        const done = i === 0 ? submitted >= ex.total : i === 1 ? submitted >= ex.total : i === 2 ? st.marksLocked : i === 3 ? st.marksLocked : st.resultsPublished;
        return `<span class="s ${done ? 'done' : ''}">${done ? '✓ ' : ''}${s}</span>`;
      }).join('')}</div>
      <div class="grid g3">
        ${D.kpi('Exam', esc(ex.name), `${ex.from} → ${ex.to}`)}
        ${D.kpi('Subjects submitted', `${submitted} / ${ex.total}`, st.marksSubmitted ? 'Maths 6-B just submitted by Rakesh' : 'Waiting for Maths 6-B, Science 9-A, Hindi 4-B')}
        ${D.kpi('Gate G11', st.gates.G11 === 'passed' ? 'Passed' : 'Pending', 'Golden set sign-off for grading scheme')}
      </div>
      <div class="card mt"><div class="card-head"><h3>Completion by subject — Class 6</h3></div>
        ${D.subjects.map((s, i) => D.barRow(s, s === 'Mathematics' ? (st.marksSubmitted ? 100 : 60) : 100 - (i === 4 ? 10 : 0), s === 'Mathematics' && !st.marksSubmitted ? 'warn' : 'ok')).join('')}</div>
      <div class="card mt"><div class="card-head"><h3>Publish Term 1 results</h3>${st.resultsPublished ? '<span class="tag ok">Published</span>' : ''}</div>
        ${st.resultsPublished ? `<div class="notice-banner ok">Report cards published to guardians at ${esc(st.publishedAt)}. Guardians received the PDF link on WhatsApp and can see results in the parent portal.</div>
            <div class="row mt"><button class="btn" data-act="preview-rc">Preview a report card</button><button class="btn danger" data-act="unpublish">Undo publication (within 15 min)</button></div>`
          : `<p class="muted">Locking freezes marks. Publishing sends ${sec.students.length * 20} report cards to verified guardians. You can undo within 15 minutes.</p>
            <div class="row">${!st.marksLocked ? `<button class="btn" data-act="lock-marks">🔒 Lock marks${submitted < ex.total ? ' (override: demo)' : ''}</button>` : '<span class="tag ok">🔒 Locked</span>'}
            <button class="btn" data-act="preview-rc">Preview report card</button>
            <button class="btn primary" data-act="publish" ${st.marksLocked ? '' : 'disabled'}>Publish results</button></div>`}
      </div>`;
  }
  D.act['lock-marks'] = () => { S().marksLocked = true; S().marksSubmitted = true; D.save(); D.toast('Marks locked for Term 1.', 'ok'); D.render(); };
  D.act['preview-rc'] = () => D.modal(`${D.reportCardHtml(D.findStudent('S-AARAV'))}<div class="modal-actions"><button class="btn" data-act="print">Print / PDF</button><button class="btn primary" data-act="modal-close">Close</button></div>`, { wide: true });
  D.act.publish = () => D.modal(`<h2>Publish Term 1 results?</h2><p>Report cards for <b>610 students</b> will be released to <b>584 verified guardians</b> on WhatsApp and in the parent portal.</p><div class="notice-banner warn small">You can undo for 15 minutes. After that, changes need a revision.</div>
      <div class="modal-actions"><button class="btn" data-act="modal-close">Cancel</button><button class="btn primary" data-act="publish-confirm">Publish now</button></div>`);
  D.act['publish-confirm'] = () => {
    S().resultsPublished = true; S().publishedAt = D.nowTime(); D.save(); D.closeModal();
    D.sendWA('Meena Devi', 'Result published', 'Sunrise Public School: Term 1 results for Aarav (6-B) are out. Overall 83% (A2). View report card: https://sunrise.example/r/••••', { quiet: true });
    D.sendWA('Meena Devi', 'Result published', 'Sunrise Public School: Term 1 results for Diya (3-A) are out. Overall 91% (A1). View report card: https://sunrise.example/r/••••');
    D.render();
  };
  D.act.unpublish = () => { S().resultsPublished = false; D.save(); D.toast('Publication withdrawn within the undo window.', 'ok'); D.render(); };

  function staffRegister() {
    const tag = (a) => `<span class="tag ${a === 'present' ? 'ok' : a === 'late' || a === 'half-day' ? 'warn' : a === 'on leave' || a === 'on duty' ? 'info' : 'bad'}">${esc(a)}</span>`;
    return `<div class="grid g4 mb">${['present', 'late', 'on leave', 'not marked'].map((k) => D.kpi(k[0].toUpperCase() + k.slice(1), D.staff.filter((s) => s.att === k).length, '')).join('')}</div>
      <div class="card"><div class="card-head"><h3>Staff register — today</h3><button class="btn sm" data-act="export" data-what="staff attendance">Export CSV</button></div>
      <div class="table-wrap"><table><tr><th>Name</th><th>Roles</th><th>Department</th><th>Check-in</th><th>Status</th></tr>
      ${D.staff.map((s) => `<tr><td><b>${esc(s.name)}</b></td><td>${s.roles.map((r) => `<span class="tag pri">${esc(r)}</span>`).join(' ')}</td><td>${esc(s.dept)}</td><td class="num">${esc(s.in)}</td><td>${tag(s.att)}</td></tr>`).join('')}</table></div></div>`;
  }
  D.act.export = (el) => D.toast(`CSV export of ${el.dataset.what} prepared (formula-safe, audited).`, 'ok');

  function reports() {
    const classes = [...new Set(D.sections.map((s) => s.cls))];
    return `<div class="grid g2">
      <div class="card"><h3>Attendance by class (this month)</h3>${classes.map((c) => D.barRow(`Class ${c}`, 88 + ((c * 7) % 11), 'ok')).join('')}</div>
      <div class="card"><h3>Fee collection vs dues (${esc(D.school.year)})</h3>${D.barRow('Instalment 1 (Apr)', 98, 'ok')}${D.barRow('Instalment 2 (Jul)', 93, 'ok')}${D.barRow('Instalment 3 (Nov)', 41, 'warn')}${D.barRow('Instalment 4 (Jan)', 6, '')}
        <div class="row mt"><button class="btn sm" data-act="export" data-what="defaulters list">Defaulters list</button><button class="btn sm" data-act="export" data-what="collection register">Collection register</button></div></div>
      <div class="card"><h3>WhatsApp delivery (30 days)</h3>${D.barRow('Delivered', 96, 'ok')}${D.barRow('Read', 81, '')}${D.barRow('Failed / unresolved', 2, 'bad')}<p class="small muted">Monthly cost: ₹1,184 of ₹2,000 cap</p></div>
      <div class="card"><h3>Term 1 results — class averages</h3>${classes.slice(5).map((c) => D.barRow(`Class ${c}`, 70 + ((c * 13) % 20))).join('')}</div></div>`;
  }

  function audit() {
    return `<div class="card"><div class="card-head"><h3>Audit trail — ${esc(D.school.name)} only</h3><div class="row"><input type="search" placeholder="Filter by person or event" data-change="audit-filter" style="width:220px"><button class="btn sm" data-act="export" data-what="audit log">Export</button></div></div>
      <p class="small muted">Append-only. Personal values (like phone numbers) are stored separately so they can be erased without breaking the trail.</p>
      <div class="table-wrap"><table><tr><th>Time</th><th>Actor</th><th>Event</th><th>Details</th></tr>${D.audit.map(([t, a, e, d]) => `<tr><td class="num">${t}</td><td>${esc(a)}</td><td><code>${e}</code></td><td>${esc(d)}</td></tr>`).join('')}</table></div></div>`;
  }

  D.roles.principal = {
    label: 'Principal', icon: '👩‍💼',
    nav: [
      { id: 'today', label: 'Today', icon: '☀️' },
      { id: 'approvals', label: 'Approvals', icon: '✅', badge: () => S().concessions.filter((c) => c.status === 'pending').length + S().reversals.filter((c) => c.status === 'pending').length + S().leaves.filter((l) => l.status === 'pending' && l.approver === 'Principal').length },
      { id: 'results', label: 'Results', icon: '📊' },
      { id: 'staff', label: 'Staff', icon: '👥' },
      { id: 'dept', label: 'Department', icon: '🏛️', group: 'HOD Languages' },
      { id: 'reports', label: 'Reports', icon: '📈', group: 'Insights' },
      { id: 'audit', label: 'Audit log', icon: '🧾' },
    ],
    pages: { today, approvals, results, staff: staffRegister, reports, audit, dept: () => D.deptHome('Languages') },
  };

  // ---------- School Admin ----------
  function students() {
    const f = D.ui.studentFilter || { q: '', sec: '6-B' };
    const q = f.q.toLowerCase();
    const list = (f.sec === 'all' ? D.allStudents() : D.section(f.sec).students).filter((s) => !q || s.name.toLowerCase().includes(q) || s.adm.toLowerCase().includes(q) || s.mobile.includes(q)).slice(0, 60);
    return `<div class="card"><div class="card-head"><h3>Students <span class="muted small">(${D.allStudents().length} enrolled · ${esc(D.school.year)})</span></h3>
        <div class="row"><input type="search" placeholder="Search name, admission no. or mobile" value="${esc(f.q)}" data-change="stu-q" style="width:260px">
        <select data-change="stu-sec"><option value="all">All sections</option>${D.sections.map((s) => `<option ${s.id === f.sec ? 'selected' : ''}>${s.id}</option>`).join('')}</select>
        <button class="btn primary sm" data-act="add-student">+ Add student</button></div></div>
      <div class="table-wrap"><table><tr><th>Adm. no</th><th>Name</th><th>Class</th><th>Guardian</th><th>WhatsApp consent</th><th class="r">Dues</th></tr>
      ${list.map((s) => `<tr class="clickable" data-act="student-profile" data-id="${s.id}"><td class="num">${esc(s.adm)}</td><td><b>${esc(s.name)}</b></td><td>${s.section}</td><td>${esc(s.guardian)}<div class="small muted">${esc(s.mobile)}</div></td>
        <td><span class="tag ${s.consent === 'verified' ? 'ok' : s.consent === 'pending' ? 'warn' : 'bad'}">${s.consent}</span></td><td class="r num">${D.dueOf(s) ? money(D.dueOf(s)) : '—'}</td></tr>`).join('')}</table></div>
      ${list.length === 60 ? '<p class="small muted mt">Showing first 60 — refine your search.</p>' : ''}</div>`;
  }
  D.ui = D.ui || {};
  D.change['stu-q'] = (el) => { D.ui.studentFilter = Object.assign(D.ui.studentFilter || { sec: '6-B' }, { q: el.value }); D.render(); };
  D.change['stu-sec'] = (el) => { D.ui.studentFilter = Object.assign(D.ui.studentFilter || { q: '' }, { sec: el.value }); D.render(); };
  D.change['audit-filter'] = () => D.toast('Filter applied (demo).');
  D.act['student-profile'] = (el) => {
    const s = D.findStudent(el.dataset.id);
    D.modal(`<div class="row"><div class="avatar" style="width:56px;height:56px;font-size:18px">${s.name.split(' ').map((x) => x[0]).join('')}</div><div><h2 style="margin:0">${esc(s.name)}</h2><span class="muted">${esc(s.adm)} · Class ${s.section} · Roll ${s.roll}</span></div></div>
      <div class="grid g2 mt"><div><b>Guardian</b><br>${esc(s.guardian)}<br><span class="muted">${esc(s.mobile)}</span><br><span class="tag ${s.consent === 'verified' ? 'ok' : 'warn'}">WhatsApp: ${s.consent}</span></div>
      <div><b>Attendance</b> ${s.attendancePct}%<br><b>Dues</b> ${money(D.dueOf(s))}<br><b>Date of birth</b> ${esc(s.dob)}</div></div>
      <div class="row mt"><button class="btn sm" data-act="go" data-to="#/app/accountant/collect/${s.id}">Collect fee</button><button class="btn sm" data-act="rc-of" data-id="${s.id}">Report card</button><button class="btn sm" data-act="export" data-what="all data held about ${esc(s.name)}">Export data (DPDP)</button><button class="btn sm" data-act="transfer">Transfer / leaving</button></div>
      <div class="modal-actions"><button class="btn primary" data-act="modal-close">Close</button></div>`);
  };
  D.act['rc-of'] = (el) => D.modal(`${D.reportCardHtml(D.findStudent(el.dataset.id))}<div class="modal-actions"><button class="btn primary" data-act="modal-close">Close</button></div>`, { wide: true });
  D.act.transfer = () => D.modal(`<h2>Enrollment change</h2><form data-form="transfer" class="stack"><label class="field">Change type<select name="t"><option>Section transfer</option><option>Leaving (issue TC)</option></select></label><label class="field">Effective date<input type="date" name="d" value="2026-10-28"></label><label class="field">Reason<input type="text" name="r" value="Parent request"></label><div class="modal-actions"><button type="button" class="btn" data-act="modal-close">Cancel</button><button class="btn primary">Save change</button></div></form>`);
  D.forms.transfer = () => { D.closeModal(); D.toast('Enrollment change recorded; dues and attendance follow the change.', 'ok'); };
  D.act['add-student'] = () => D.modal(`<h2>Add student</h2><form data-form="add-student" class="form-grid"><label class="field">Full name<input type="text" name="n" required value="Ira Kulkarni"></label><label class="field">Section<select name="s">${D.sections.map((s) => `<option>${s.id}</option>`).join('')}</select></label>
    <label class="field">Guardian<input type="text" name="g" value="Prakash Kulkarni"></label><label class="field">Guardian mobile<input type="tel" name="m" value="+91 98000 11122"></label><div class="modal-actions full"><button type="button" class="btn" data-act="modal-close">Cancel</button><button class="btn primary">Save</button></div></form>`);
  D.forms['add-student'] = (d) => {
    const sec = D.section(d.s);
    sec.students.push({ id: 'S-NEW' + Date.now(), adm: 'SPS/' + (3000 + sec.students.length), roll: sec.students.length + 1, name: d.n, gender: 'F', section: d.s, guardian: d.g, mobile: d.m, consent: 'pending', dob: '2017-01-01', feeDue: 0, attendancePct: 100 });
    D.ui.studentFilter = { q: '', sec: d.s };
    D.closeModal(); D.toast(`${d.n} added to ${d.s} (this session only).`, 'ok'); D.render();
  };

  function importWizard() {
    const step = S().importStep;
    const steps = ['Upload', 'Map columns', 'Dry run', 'Fix rows', 'Commit', 'Done'];
    const bar = `<div class="steps">${steps.map((s, i) => `<span class="s ${i < step ? 'done' : i === step ? 'on' : ''}">${i < step ? '✓ ' : ''}${s}</span>`).join('')}</div>`;
    const body = [
      () => `<div class="empty" style="border:2px dashed var(--border-strong);border-radius:12px"><div style="font-size:40px">📄</div><p><b>Drop a CSV exported from Excel</b><br><span class="small">Max 5 MB · scanned for malware · formulas neutralised</span></p><button class="btn primary" data-act="import-next">Use sample file “class6-students.csv” (148 rows)</button></div>`,
      () => `<div class="table-wrap"><table><tr><th>Column in your file</th><th>Maps to</th><th>Sample</th></tr>${[['Student Name', 'Student · full name', 'Aarav Sharma'], ['Adm No', 'Student · admission no.', 'SPS/2401'], ['Class', 'Enrollment · section', '6-B'], ['Father/Mother Name', 'Guardian · name', 'Meena Devi'], ['Mobile', 'Guardian · mobile', '98220 11223'], ['DOB', 'Student · date of birth', '14/06/2015']].map(([a, b, c]) => `<tr><td><b>${a}</b></td><td><select><option>${b}</option><option>— ignore —</option></select></td><td class="muted">${c}</td></tr>`).join('')}</table></div><label class="row mt small"><input type="checkbox" checked> Save as mapping profile “Office Excel 2026”</label><div class="row mt"><button class="btn primary" data-act="import-next">Run dry run →</button></div>`,
      () => `<div class="grid g4">${D.kpi('Rows', 148)}${D.kpi('Ready', 139, 'will be created', 'ok')}${D.kpi('Need fixing', 6)}${D.kpi('Possible duplicates', 3)}</div><div class="notice-banner mt">Dry run wrote nothing. Every row has an explanation below.</div>
        <div class="table-wrap mt"><table><tr><th>Row</th><th>Issue</th><th>Value</th></tr><tr><td>17</td><td><span class="tag bad">Invalid mobile</span></td><td>98220 1122</td></tr><tr><td>42</td><td><span class="tag bad">Unknown section</span></td><td>6-D</td></tr><tr><td>58</td><td><span class="tag warn">Possible duplicate</span></td><td>Kavya Joshi · same DOB as SPS/2533</td></tr></table></div><div class="row mt"><button class="btn primary" data-act="import-next">Fix rows →</button></div>`,
      () => `<p>Fix inline or decide on duplicates. Nothing is saved until you commit.</p><div class="table-wrap"><table><tr><th>Row</th><th>Field</th><th>Fix</th></tr><tr><td>17</td><td>Mobile</td><td><input type="tel" value="98220 11224"></td></tr><tr><td>42</td><td>Section</td><td><select><option>6-A</option><option>6-B</option></select></td></tr><tr><td>58</td><td>Duplicate</td><td><select><option>Same student — update</option><option>Different student — create</option><option>Skip row</option></select></td></tr></table></div><div class="row mt"><button class="btn primary" data-act="import-next">Review & commit →</button></div>`,
      () => `<div class="notice-banner warn">Commit is all-or-nothing: either all 148 rows are applied or none. You can roll back this run for 7 days.</div><div class="row mt"><button class="btn primary lg" data-act="import-next">Commit import</button></div>`,
      () => `<div class="notice-banner ok"><h3>Import committed ✓</h3>145 students and 138 guardians created, 3 updated. Run #IMP-0007.</div><div class="row mt"><button class="btn danger" data-act="import-reset">Roll back this run</button><button class="btn" data-act="import-reset">Start another import</button></div>`,
    ][step];
    return `<div class="card">${bar}${body()}</div>`;
  }
  D.act['import-next'] = () => { S().importStep = Math.min(5, S().importStep + 1); D.save(); D.render(); };
  D.act['import-reset'] = () => { S().importStep = 0; D.save(); D.toast('Import run reset.', 'ok'); D.render(); };

  function academic() {
    return `<div class="grid g2">
      <div class="card"><div class="card-head"><h3>Academic year ${esc(D.school.year)}</h3><span class="tag ok">Current</span></div><p class="small muted">1 Apr 2026 – 31 Mar 2027 · 20 sections · year rollover with class-by-class promotion at year end.</p>
        <div class="table-wrap"><table><tr><th>Class</th><th>Sections</th><th>Students</th><th>Class teachers</th></tr>${[...new Set(D.sections.map((s) => s.cls))].map((c) => { const ss = D.sections.filter((s) => s.cls === c); return `<tr><td>Class ${c}</td><td>${ss.map((s) => s.sec).join(', ')}</td><td class="num">${ss.reduce((a, s) => a + s.students.length, 0)}</td><td class="small">${ss.map((s) => esc(s.classTeacher)).join(', ')}</td></tr>`; }).join('')}</table></div></div>
      <div class="stack"><div class="card"><h3>Subjects</h3><div class="chips">${D.subjects.map((s) => `<span class="chip">${s}</span>`).join('')}</div></div>
        <div class="card"><h3>Departments & HODs</h3>${D.departments.map((d) => `<div class="list-item"><div class="grow"><b>${d.name}</b><div class="small muted">${d.members.length} teachers · ${d.subjects.join(', ')}</div></div>${d.hod ? `<span class="tag pri">HOD: ${esc(d.hod)}</span>` : '<span class="tag warn">No HOD → Principal</span>'}</div>`).join('')}</div>
        <div class="card"><h3>Leave types</h3>${[['Casual leave', 8], ['Sick leave', 10], ['Earned leave', 15]].map(([t, n]) => `<div class="list-item"><div class="grow">${t}</div><span class="tag">${n} days/yr</span></div>`).join('')}</div></div></div>`;
  }

  function calendar() {
    // 1 Nov 2026 is a Sunday; Sundays and the Diwali closure (2–8 Nov) are holidays.
    return `<div class="grid g2"><div class="card"><h3>November 2026</h3><div class="cal">${['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((x) => `<div class="h">${x}</div>`).join('')}<div class="d X"></div><div class="d X"></div><div class="d X"></div><div class="d X"></div><div class="d X"></div><div class="d X"></div>
      ${Array.from({ length: 30 }, (_, i) => { const d = i + 1; const hol = (d >= 2 && d <= 8) || d % 7 === 1; return `<div class="d ${hol ? 'H' : ''}">${d}</div>`; }).join('')}</div>
      <p class="small muted mt">Blue = holiday/closure. Holidays are never flagged as “attendance pending”.</p></div>
      <div class="card"><div class="card-head"><h3>Events, holidays & closures</h3><button class="btn sm primary" data-act="add-event">+ Add</button></div>${D.calendar.map((c) => `<div class="list-item"><span class="tag ${c.kind === 'holiday' ? 'info' : c.kind === 'exam' ? 'warn' : 'pri'}">${esc(c.date)}</span><div class="grow">${esc(c.what)}</div><span class="small muted">${c.kind}</span></div>`).join('')}</div></div>`;
  }
  D.act['add-event'] = () => D.toast('Event editor opens here (demo).');

  function staffRoles() {
    return `<div class="card"><div class="card-head"><h3>Staff accounts & roles</h3><button class="btn primary sm" data-act="invite-staff">+ Invite staff</button></div>
      <p class="small muted">Roles are additive — one person can be Principal + HOD, or HOD + Teacher. Each sees the union of their roles.</p>
      <div class="table-wrap"><table><tr><th>Name</th><th>Roles</th><th>Department</th><th>Account</th><th></th></tr>${D.staff.map((s) => `<tr><td><b>${esc(s.name)}</b></td><td>${s.roles.map((r) => `<span class="tag pri">${r}</span>`).join(' ')}</td><td>${esc(s.dept)}</td><td><span class="tag ${s.status === 'active' ? 'ok' : 'warn'}">${s.status}</span></td><td><button class="btn sm" data-act="edit-roles" data-name="${esc(s.name)}">Edit roles</button></td></tr>`).join('')}</table></div></div>`;
  }
  D.act['invite-staff'] = () => D.modal(`<h2>Invite a staff member</h2><form data-form="invite" class="stack"><label class="field">Name<input type="text" name="n" required value="Tara Mehta"></label><label class="field">Roles</label><div class="chips">${['Teacher', 'HOD', 'School Admin', 'Accountant'].map((r, i) => `<label class="chip"><input type="checkbox" name="r${i}" ${i === 0 ? 'checked' : ''}> ${r}</label>`).join('')}</div><div class="modal-actions"><button type="button" class="btn" data-act="modal-close">Cancel</button><button class="btn primary">Send invite</button></div></form>`);
  D.forms.invite = (d) => { D.staff.push({ name: d.n, roles: ['Teacher'], dept: 'Languages', status: 'invited', att: '—', in: '—' }); D.closeModal(); D.toast(`Invite created for ${d.n}. They must change the temporary password at first sign-in.`, 'ok'); D.render(); };
  D.act['edit-roles'] = (el) => D.toast(`Role editor for ${el.dataset.name} (demo). Changes take effect on the next request.`);

  function messaging() {
    const all = D.allStudents();
    const v = all.filter((s) => s.consent === 'verified').length;
    const st = S();
    return `<div class="grid g4">${D.kpi('Consent verified', `${pct(v, all.length)}%`, `${v} of ${all.length} primary guardians`)}${D.kpi('Messaging mode', st.messagingMode, 'G8 needs ≥ 90% verified')}${D.kpi('This month', '₹1,184', 'of ₹2,000 cap')}${D.kpi('Replies', '2 new', 'Guardian replies inbox')}</div>
      <div class="grid g2 mt">
        <div class="card"><h3>Send a school notice</h3><form data-form="notice" class="stack"><label class="field">Audience<select name="aud"><option>All guardians</option><option>Class 6</option><option>Section 6-B</option></select></label>
          <label class="field">Template<select name="tpl"><option>School notice (English + हिन्दी)</option><option>Holiday announcement</option><option>PTM reminder</option></select></label>
          <label class="field">Message<textarea name="msg">PTM on Saturday 31 October, 9 am – 1 pm. Please bring the student diary.</textarea></label>
          <div class="row"><button class="btn primary">Send to guardians</button><button type="button" class="btn" data-act="test-send">Send test to staff phones</button></div></form></div>
        <div class="card"><h3>Controls</h3>
          <div class="list-item"><div class="grow"><b>Kill switch</b><div class="small muted">Instantly holds every outbound message for this school.</div></div><label class="switch"><input type="checkbox" data-change="kill" ${st.killSwitch ? 'checked' : ''}><span></span></label></div>
          <div class="list-item"><div class="grow"><b>Sending window</b><div class="small muted">07:00–20:00 IST · later messages are held till morning</div></div><span class="tag">On</span></div>
          <div class="list-item"><div class="grow"><b>Daily cap</b><div class="small muted">1,500 messages / day</div></div><span class="tag">412 used</span></div>
          <h3 class="mt">Consent coverage — Class 6</h3>${D.sections.filter((s) => s.cls === 6).map((s) => D.barRow(`Section ${s.id}`, pct(s.students.filter((x) => x.consent === 'verified').length, s.students.length), 'ok')).join('')}
          <button class="btn sm" data-act="optin">Send opt-in requests to unverified numbers</button></div>
      </div>
      <div class="card mt"><h3>Delivery log</h3><div class="table-wrap"><table><tr><th>Time</th><th>To</th><th>Kind</th><th>Status</th></tr>${st.wa.slice(0, 10).map((m) => `<tr><td>${esc(m.time)}</td><td>${esc(m.to)}</td><td>${esc(m.kind)}</td><td><span class="tag ok">Delivered ✓✓</span></td></tr>`).join('')}</table></div></div>`;
  }
  D.forms.notice = (d) => { D.sendWA('Meena Devi', 'School notice', `Sunrise Public School: ${d.msg}`); D.toast(`Notice queued for: ${d.aud}.`, 'ok'); D.render(); };
  D.act['test-send'] = () => D.sendWA('Sunita Patil (staff phone)', 'Staff test', 'Test message from Sunrise Public School. Template: School notice v3 (हिन्दी + English).');
  D.act.optin = () => D.sendWA('Unverified guardians (14)', 'Opt-in request', 'Sunrise Public School wants to send you attendance, fee and result updates on WhatsApp. Reply YES / हाँ to agree.');
  D.change.kill = (el) => { S().killSwitch = el.checked; D.save(); D.toast(el.checked ? 'Kill switch ON — all messages held.' : 'Kill switch OFF — sending resumed.', 'ok'); };

  function feeSetup() {
    const st = S();
    return `<div class="grid g2"><div class="card"><h3>Fee structures ${esc(D.school.year)}</h3><div class="table-wrap"><table><tr><th>Classes</th><th class="r">Annual</th><th>Instalments</th></tr>${D.feeStructure.map((f) => `<tr><td>${f.cls}</td><td class="r num">${money(f.annual)}</td><td>${f.due.join(' · ')}</td></tr>`).join('')}</table></div>
      <h3 class="mt">Fee heads (per instalment, Class 6–8)</h3>${D.feeHeads.map((h) => `<div class="list-item"><div class="grow">${h.head}</div><b class="num">${money(h.amount)}</b></div>`).join('')}</div>
      <div class="card"><div class="card-head"><h3>Concessions</h3><button class="btn sm primary" data-act="propose-conc">+ Propose concession</button></div><p class="small muted">The admin proposes; only the Principal approves.</p>
        ${st.concessions.map((c) => `<div class="list-item"><div class="grow"><b>${esc(c.student)}</b><div class="small muted">${esc(c.kind)} · ${money(c.amount)}</div></div><span class="tag ${c.status === 'approved' ? 'ok' : c.status === 'rejected' ? 'bad' : 'warn'}">${c.status}</span></div>`).join('')}
        <h3 class="mt">Opening balances (cutover)</h3><div class="notice-banner ok small">Gate G10 passed — opening balances reconciled and signed off on 01 Apr 2026.</div></div></div>`;
  }
  D.act['propose-conc'] = () => { S().concessions.push({ id: 'C' + Date.now(), student: 'Aarav Sharma (6-B)', kind: 'Merit 5%', amount: 2100, by: 'Sunita Patil', status: 'pending' }); D.save(); D.toast('Concession proposed — waiting for Principal approval.', 'ok'); D.render(); };

  function examSetup() {
    return `<div class="grid g2"><div class="card"><div class="card-head"><h3>Exams</h3><button class="btn sm primary" data-act="new-exam">+ New exam</button></div>${D.exams.map((e) => `<div class="list-item"><div class="grow"><b>${e.name}</b><div class="small muted">${e.from} → ${e.to}</div></div><span class="tag ${e.status === 'Scheduled' ? 'info' : 'warn'}">${e.status}</span></div>`).join('')}
      <button class="btn sm mt" data-act="publish-schedule">Publish UT2 schedule to guardians</button></div>
      <div class="card"><h3>Grading scheme v2 (CBSE 8-point)</h3><div class="table-wrap"><table><tr><th>Marks ≥</th><th>Grade</th></tr>${D.grading.map((g) => `<tr><td class="num">${g.min}</td><td>${g.g}</td></tr>`).join('')}</table></div><p class="small muted mt">Versioned: changing the scheme re-opens Gate G11 golden-set sign-off.</p></div></div>`;
  }
  D.act['new-exam'] = () => D.toast('Exam wizard: name, dates, subjects per class, max marks (demo).');
  D.act['publish-schedule'] = () => D.sendWA('All guardians', 'Exam schedule', 'Sunrise Public School: Unit Test 2 runs 7–11 December. Date sheet: https://sunrise.example/ut2');

  function website() {
    const st = S();
    return `<div class="grid g2"><div class="card"><div class="card-head"><h3>Website pages</h3><a class="btn sm" href="#/site/home" target="_blank">View site ↗</a></div>
      ${Object.entries({ home: 'Home & slider', about: 'About us', admissions: 'Admissions & fees', gallery: 'Gallery — Annual Day 2026' }).map(([k, v]) => `<div class="list-item"><div class="grow"><b>${v}</b><div class="small muted">${st.published[k] ? 'Published' : 'Draft — preview only'}</div></div><label class="switch"><input type="checkbox" data-change="pub" data-k="${k}" ${st.published[k] ? 'checked' : ''}><span></span></label></div>`).join('')}
      <p class="small muted mt">Photos of students appear only with recorded publication consent.</p></div>
      <div class="card"><h3>Contact enquiries</h3>${st.enquiries.map((e) => `<div class="list-item"><div class="grow"><b>${esc(e.from)}</b><div class="small muted">${esc(e.topic)} · ${esc(e.date)}</div></div><span class="tag ${e.status === 'new' ? 'warn' : 'ok'}">${e.status}</span></div>`).join('')}</div></div>`;
  }
  D.change.pub = (el) => { S().published[el.dataset.k] = el.checked; D.save(); D.toast(el.checked ? 'Published to the public website.' : 'Withdrawn from the public website.', 'ok'); };

  function admissions() {
    return `<div class="card"><div class="card-head"><h3>Online admission applications</h3><a class="btn sm" href="#/site/apply">Open public form ↗</a></div>
      <div class="table-wrap"><table><tr><th>No.</th><th>Child</th><th>Class</th><th>Parent</th><th>Received</th><th>Status</th><th></th></tr>${S().applications.map((a) => `<tr><td class="num">${esc(a.id)}</td><td><b>${esc(a.child)}</b></td><td>${esc(a.cls)}</td><td>${esc(a.parent)}<div class="small muted">${esc(a.mobile)}</div></td><td>${esc(a.date)}</td><td><span class="tag ${a.status === 'new' ? 'warn' : 'info'}">${esc(a.status)}</span></td>
        <td>${a.status === 'new' ? `<button class="btn sm" data-act="app-review" data-id="${a.id}">Schedule interaction</button>` : ''}</td></tr>`).join('')}</table></div></div>`;
  }
  D.act['app-review'] = (el) => { const a = S().applications.find((x) => x.id === el.dataset.id); a.status = 'interview scheduled'; D.save(); D.toast(`Interaction scheduled for ${a.child}.`, 'ok'); D.render(); };

  function dataRights() {
    return `<div class="grid g2"><div class="card"><h3>Data export requests</h3><p class="small muted">Export everything held about a student, guardian, staff member, applicant or enquirer (DPDP Act).</p><button class="btn primary" data-act="export" data-what="all data about Aarav Sharma">Export for a person…</button></div>
      <div class="card"><h3>Erasure requests</h3>${S().erasure.map((e) => `<div class="list-item"><div class="grow"><b>${esc(e.id)}</b> · ${esc(e.subject)}<div class="small muted">Requested ${esc(e.requested)}</div></div><span class="tag warn">${esc(e.status)}</span></div>`).join('')}
        <p class="small muted mt">Erasure follows the retention matrix: receipts and ledgers are kept as required by law, with personal values tombstoned.</p></div></div>`;
  }

  function settings() {
    return `<div class="grid g2"><div class="card"><h3>School profile</h3><div class="form-grid"><label class="field">School name<input type="text" value="${esc(D.school.name)}"></label><label class="field">City<input type="text" value="${esc(D.school.city)}"></label><label class="field">Board<input type="text" value="CBSE"></label><label class="field">Default language<select><option>English</option><option>हिन्दी</option><option>मराठी</option></select></label></div></div>
      <div class="card"><h3>Branding</h3><p class="small muted">Pick a preset — the whole app re-themes instantly (light and dark).</p><div class="chips">${D.presets.map(([k, v]) => `<button class="chip ${D.prefs.preset === k ? 'on' : ''}" data-act="set-preset" data-k="${k}">${v}</button>`).join('')}</div></div></div>`;
  }
  D.act['set-preset'] = (el) => { D.prefs.preset = el.dataset.k; D.savePrefs(); D.applyPrefs(); D.render(); };

  D.roles.admin = {
    label: 'School Admin', icon: '🗂️',
    nav: [
      { id: 'today', label: 'Today', icon: '☀️' },
      { id: 'students', label: 'Students', icon: '🎓', group: 'People' },
      { id: 'import', label: 'Import students', icon: '📥' },
      { id: 'staff', label: 'Staff', icon: '👥' },
      { id: 'academic', label: 'Academic setup', icon: '🏫', group: 'Setup' },
      { id: 'calendar', label: 'Calendar', icon: '📅' },
      { id: 'fees', label: 'Fees', icon: '💰' },
      { id: 'exams', label: 'Exams', icon: '📝' },
      { id: 'messaging', label: 'Messaging', icon: '💬', group: 'Communication' },
      { id: 'website', label: 'Website', icon: '🌐' },
      { id: 'admissions', label: 'Admissions', icon: '📨', badge: () => S().applications.filter((a) => a.status === 'new').length },
      { id: 'rights', label: 'Data rights', icon: '🛡️', group: 'Compliance' },
      { id: 'settings', label: 'Settings', icon: '⚙️' },
    ],
    pages: { today, students, import: importWizard, staff: staffRoles, academic, calendar, fees: feeSetup, exams: examSetup, messaging, website, admissions, rights: dataRights, settings },
  };
})();
