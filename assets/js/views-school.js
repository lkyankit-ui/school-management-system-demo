/* Teacher, HOD and Accountant roles. */
(function () {
  const D = window.DEMO;
  const { esc, money, pct } = D;
  const S = () => D.state;
  D.ui = D.ui || {};

  // ---------- Teacher ----------
  const MY_SEC = '6-B';
  const noteFor = (id) => S().absenceNotes.find((n) => n.student === id);

  function checkInCard() {
    const c = S().checkIn;
    return `<div class="card"><div class="card-head"><h3>My attendance</h3>${c ? `<span class="tag ok">Checked in ${esc(c)}</span>` : '<span class="tag warn">Not marked</span>'}</div>
      ${c ? '<p class="small muted">Have a great day! Check-out is optional.</p>' : `<button class="btn primary lg block" data-act="checkin">✋ I’m here</button><p class="small muted mt">Self check-in. Corrections go to your HOD.</p>`}</div>`;
  }
  D.act.checkin = () => { S().checkIn = D.nowTime(); D.save(); D.toast(`Checked in at ${S().checkIn}.`, 'ok'); D.render(); };

  D.teacherToday = () => {
    const a = S().attendance[MY_SEC];
    const sec = D.section(MY_SEC);
    const notes = S().absenceNotes.filter((n) => D.findStudent(n.student).section === MY_SEC);
    return `<div class="row between mb"><div><h1 style="margin:0">${D.t('Good morning')}, Rakesh 👋</h1><span class="muted">${esc(D.school.todayLabel)}</span></div></div>
      <div class="grid g3">
        <div class="card span2"><div class="card-head"><h3>Class ${MY_SEC} — daily attendance</h3>${a ? '<span class="tag ok">Submitted</span>' : '<span class="tag bad">Pending</span>'}</div>
          <p class="muted">${a ? `${sec.students.length - a.absent.length} present · ${a.absent.length} absent · submitted at ${esc(a.at)}` : `${sec.students.length} students. Everyone starts as Present — tap only the absentees.`}</p>
          <a class="btn ${a ? '' : 'primary'} lg" href="#/app/teacher/attendance">${a ? 'View / correct' : '⚡ Mark attendance'}</a>
          ${notes.length ? `<div class="notice-banner mt"><b>Absence notes from parents:</b> ${notes.map((n) => `${esc(D.findStudent(n.student).name)} — “${esc(n.reason)}” (${esc(n.date)})`).join('; ')}</div>` : ''}</div>
        ${checkInCard()}
      </div>
      <div class="grid g3 mt">
        <div class="card"><h3>My sections</h3>${[['6-B', 'Mathematics', 'Class teacher'], ['7-A', 'Science', 'Subject'], ['6-A', 'Mathematics', 'Subject']].map(([s, sub, k]) => `<div class="list-item"><span class="tag pri">${s}</span><div class="grow">${sub}<div class="small muted">${k}</div></div></div>`).join('')}</div>
        <div class="card"><h3>My tasks</h3><div class="list-item"><span class="tag warn">Due 05 Nov</span><div class="grow">Science exhibition shortlist<div class="small muted">from Kavita Jha (HOD)</div></div></div><div class="list-item"><span class="tag ok">Done</span><div class="grow">Term 1 question paper</div></div></div>
        <div class="card"><h3>Quick actions</h3><div class="stack"><a class="btn block" href="#/app/teacher/marks">📝 Enter Term 1 marks</a><a class="btn block" href="#/app/teacher/homework">📚 Give homework</a><a class="btn block" href="#/app/teacher/myatt">🌴 Apply for leave</a></div></div>
      </div>`;
  };

  function attendance() {
    const sec = D.section(MY_SEC);
    const saved = S().attendance[MY_SEC];
    const editing = D.ui.editAtt || !saved;
    if (!D.ui.roster || D.ui.roster.sec !== MY_SEC) D.ui.roster = { sec: MY_SEC, marks: {} };
    const marks = D.ui.roster.marks;
    const absent = Object.values(marks).filter((m) => m === 'A').length;
    const late = Object.values(marks).filter((m) => m === 'L').length;
    const queue = S().pendingSync;
    const offlineBar = `<div class="row between mb"><div class="row"><span class="tag ${S().offline ? 'bad' : 'ok'}">${S().offline ? '📴 Offline' : '📶 Online'}</span><span class="small muted">${queue.length ? `${queue.length} submission waiting to sync` : 'All changes synced'}</span></div>
      <button class="btn sm" data-act="toggle-offline">${S().offline ? 'Reconnect (simulate)' : 'Simulate no network'}</button></div>`;
    if (!editing) {
      const released = saved.released;
      return `${offlineBar}<div class="card"><div class="card-head"><h3>Class ${MY_SEC} · ${esc(D.school.todayLabel)}</h3><span class="tag ok">Submitted ${esc(saved.at)}</span></div>
        <div class="grid g3">${D.kpi(D.t('Present'), sec.students.length - saved.absent.length)}${D.kpi(D.t('Absent'), saved.absent.length)}${D.kpi(D.t('Late'), (saved.late || []).length)}</div>
        <div class="mt">${saved.absent.map((id) => { const s = D.findStudent(id); const n = noteFor(id); return `<div class="list-item"><span class="tag bad">A</span><div class="grow"><b>${esc(s.name)}</b> · Roll ${s.roll}<div class="small muted">${n ? `Parent sent a note: “${esc(n.reason)}” — no alert needed` : `Guardian ${esc(s.guardian)} · ${s.consent === 'verified' ? 'WhatsApp verified' : 'not verified — call instead'}`}</div></div>${released ? '<span class="tag ok">Informed ✓✓</span>' : ''}</div>`; }).join('') || '<p class="muted">Everyone is present today 🎉</p>'}</div>
        ${released ? '<div class="notice-banner ok mt">Absence alerts were sent to guardians on WhatsApp. Open the 💬 button to see them.</div>' : `<div class="notice-banner warn mt"><b>Correction window open.</b> Alerts are held for 10 minutes so a wrong tap never alarms a parent.</div>`}
        <div class="row mt"><button class="btn" data-act="att-correct">✏️ Correct attendance</button>${released ? '' : '<button class="btn primary" data-act="att-release">Release alerts now (skip the wait)</button>'}</div></div>`;
    }
    return `${offlineBar}<div class="card"><div class="card-head"><h3>Class ${MY_SEC} · ${sec.students.length} students</h3><span class="small muted">Tap once = Absent · twice = Late · thrice = Present</span></div>
      <div class="roster">${sec.students.map((s) => { const m = marks[s.id]; const n = noteFor(s.id); return `<button class="pupil ${m === 'A' ? 'absent' : m === 'L' ? 'late' : ''}" data-act="pupil" data-id="${s.id}" aria-pressed="${!!m}"><span class="rn">${s.roll}</span><span><b style="font-size:14px">${esc(s.name)}</b><br><span class="st">${m === 'A' ? D.t('Absent') : m === 'L' ? D.t('Late') : D.t('Present')}</span>${n ? '<br><span class="note">📝 note from parent</span>' : ''}</span></button>`; }).join('')}</div>
      <div class="sticky-submit"><span><b>${sec.students.length - absent}</b> present · <b>${absent}</b> absent · <b>${late}</b> late</span><button class="btn primary lg" data-act="att-submit">${D.t('Submit attendance')}</button></div></div>`;
  }
  D.act.pupil = (el) => {
    const m = D.ui.roster.marks; const id = el.dataset.id;
    m[id] = !m[id] ? 'A' : m[id] === 'A' ? 'L' : undefined;
    if (!m[id]) delete m[id];
    D.render();
  };
  D.act['att-submit'] = () => {
    const m = D.ui.roster.marks;
    const rec = { absent: Object.keys(m).filter((k) => m[k] === 'A'), late: Object.keys(m).filter((k) => m[k] === 'L'), at: D.nowTime(), by: 'Rakesh Yadav' };
    D.ui.editAtt = false;
    if (S().offline) {
      S().pendingSync = [{ sec: MY_SEC, rec }];
      D.save(); D.toast('Saved on this phone. It will sync automatically when the network is back.', 'ok'); D.render();
      return;
    }
    S().attendance[MY_SEC] = rec; D.save();
    D.toast(`Attendance for ${MY_SEC} submitted in one tap.`, 'ok'); D.render();
  };
  D.act['att-correct'] = () => {
    const saved = S().attendance[MY_SEC];
    D.ui.roster = { sec: MY_SEC, marks: Object.fromEntries([...saved.absent.map((x) => [x, 'A']), ...(saved.late || []).map((x) => [x, 'L'])]) };
    D.ui.editAtt = true; D.render();
  };
  D.act['att-release'] = () => {
    const saved = S().attendance[MY_SEC];
    saved.released = true; D.save();
    const toAlert = saved.absent.filter((id) => !noteFor(id));
    toAlert.forEach((id, i) => {
      const s = D.findStudent(id);
      const hi = i % 2 === 0;
      D.sendWA(s.guardian, 'Absence alert', hi ? `नमस्ते, Sunrise Public School: ${s.name} (कक्षा ${s.section}) आज ${D.school.today} को विद्यालय में अनुपस्थित है। कृपया कारण बताने के लिए उत्तर दें।` : `Sunrise Public School: ${s.name} (Class ${s.section}) is absent today, ${D.school.today}. Please reply with the reason.`, { quiet: i < toAlert.length - 1 });
    });
    if (!toAlert.length) D.toast('No alerts needed — nobody absent without a note.', 'ok');
    D.render();
  };
  D.act['toggle-offline'] = () => {
    S().offline = !S().offline;
    if (!S().offline && S().pendingSync.length) {
      for (const q of S().pendingSync) S().attendance[q.sec] = q.rec;
      S().pendingSync = [];
      D.toast('Back online — queued attendance synced to the server.', 'ok');
    }
    D.save(); D.render();
  };

  function marks() {
    const key = `${MY_SEC}-Mathematics`;
    const m = (S().marks[key] = S().marks[key] || {});
    const sec = D.section(MY_SEC);
    const done = sec.students.filter((s) => m[s.id] !== undefined && m[s.id] !== '').length;
    const locked = S().marksSubmitted || S().marksLocked;
    return `<div class="card"><div class="card-head"><h3>Term 1 · Mathematics · Class ${MY_SEC} <span class="muted small">(max 100)</span></h3><span class="tag ${locked ? 'ok' : 'warn'}">${locked ? 'Submitted for HOD review' : `Draft · ${done}/${sec.students.length} entered`}</span></div>
      ${locked ? '' : '<div class="row mb"><button class="btn sm" data-act="marks-fill">Fill sample marks</button><span class="small muted">Use AB for absent. Drafts save automatically.</span></div>'}
      <div class="table-wrap"><table><tr><th>Roll</th><th>Student</th><th style="width:140px">Marks</th><th>Grade</th></tr>${sec.students.map((s) => `<tr><td>${s.roll}</td><td>${esc(s.name)}</td><td><input type="text" inputmode="numeric" value="${esc(m[s.id] ?? '')}" data-change="mark" data-id="${s.id}" ${locked ? 'disabled' : ''} aria-label="Marks for ${esc(s.name)}"></td><td>${m[s.id] !== undefined && m[s.id] !== '' && !isNaN(m[s.id]) ? D.grade(Number(m[s.id])) : '—'}</td></tr>`).join('')}</table></div>
      ${locked ? '' : `<div class="row mt"><button class="btn primary" data-act="marks-submit" ${done < sec.students.length ? 'disabled' : ''}>Submit for HOD review</button><span class="small muted">${sec.students.length - done} remaining</span></div>`}</div>`;
  }
  D.change.mark = (el) => {
    const v = el.value.trim().toUpperCase();
    if (v !== 'AB' && v !== '' && (isNaN(v) || v < 0 || v > 100)) { D.toast('Marks must be 0–100 or AB.'); el.value = ''; return; }
    S().marks[`${MY_SEC}-Mathematics`][el.dataset.id] = v; D.save(); D.render();
  };
  D.act['marks-fill'] = () => { const m = S().marks[`${MY_SEC}-Mathematics`]; D.section(MY_SEC).students.forEach((s, i) => { m[s.id] = String(s.id === 'S-AARAV' ? 91 : 45 + ((i * 37) % 54)); }); D.save(); D.render(); };
  D.act['marks-submit'] = () => { S().marksSubmitted = true; D.save(); D.toast('Submitted. Your HOD will review before marks are locked.', 'ok'); D.render(); };

  function homework() {
    const mine = S().homework;
    return `<div class="grid g2"><form class="card" data-form="homework"><h3>Give homework</h3><div class="stack">
      <label class="field">Section<select name="sec"><option>6-B</option><option>6-A</option><option>7-A</option></select></label>
      <label class="field">Subject<select name="subj"><option>Mathematics</option><option>Science</option></select></label>
      <label class="field">Title<input type="text" name="title" required value="Worksheet 5.3 — Decimals"></label>
      <label class="field">Details<textarea name="det">Solve all 15 questions in the notebook.</textarea></label>
      <label class="field">Due<select name="due"><option>Tomorrow</option><option>29 Oct</option><option>30 Oct</option></select></label>
      <button class="btn primary">Preview & publish</button></div></form>
      <div class="card"><h3>Published by me</h3>${mine.length ? mine.map((h) => `<div class="list-item"><span class="tag pri">${esc(h.sec)}</span><div class="grow"><b>${esc(h.title)}</b><div class="small muted">${esc(h.subj)} · due ${esc(h.due)}</div></div><span class="tag ok">Live</span></div>`).join('') : '<div class="empty">Nothing yet — publish one and it appears instantly in the student and parent portals.</div>'}</div></div>`;
  }
  D.forms.homework = (d) => {
    S().homework.unshift({ sec: d.sec, subj: d.subj, title: d.title, due: d.due, by: 'Rakesh Yadav', status: 'pending' }); D.save();
    D.toast(`Published to ${d.sec}. Students and parents can see it now.`, 'ok'); D.render();
  };

  function myAttendance() {
    const cal = 'PPPPPHPPPPPPHPPPPPPHLPPPPPHP';
    return `<div class="grid g3">${checkInCard()}
      <div class="card"><h3>Leave balance</h3>${[['Casual', 8, 1], ['Sick', 10, 0], ['Earned', 15, 0]].map(([t, n, u]) => `<div class="list-item"><div class="grow">${t}</div><b class="num">${n - u}</b><span class="small muted">/ ${n}</span></div>`).join('')}</div>
      <div class="card"><h3>October</h3><div class="cal">${cal.split('').map((c, i) => `<div class="d ${c}">${i + 1}</div>`).join('')}</div><p class="small muted mt">Green present · blue holiday · amber leave</p></div></div>
      <div class="grid g2 mt"><form class="card" data-form="leave"><h3>Apply for leave</h3><div class="form-grid">
        <label class="field">Type<select name="type"><option>Casual leave</option><option>Sick leave</option><option>Earned leave</option></select></label>
        <label class="field">Days<select name="days"><option>1</option><option>2</option><option>3</option></select></label>
        <label class="field">From<input type="date" name="from" value="2026-11-03"></label>
        <label class="field">Reason<input type="text" name="reason" value="Personal work"></label>
        <div class="full"><button class="btn primary">Send to HOD</button> <span class="small muted">Routed to Kavita Jha (HOD Science). You can never approve your own request.</span></div></div></form>
      <div class="card"><h3>My requests</h3>${S().myLeaves.map((l) => `<div class="list-item"><div class="grow"><b>${esc(l.type)}</b><div class="small muted">${esc(l.from)} · ${l.days} day</div></div><span class="tag ${l.status === 'approved' ? 'ok' : l.status === 'rejected' ? 'bad' : 'warn'}">${l.status}</span></div>`).join('')}</div></div>`;
  }
  D.forms.leave = (d) => {
    const id = 'L' + Date.now();
    const from = new Date(d.from).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    S().leaves.unshift({ id, who: 'Rakesh Yadav', dept: 'Science', type: d.type, from, to: from, days: Number(d.days), reason: d.reason, status: 'pending', approver: 'HOD' });
    S().myLeaves.unshift({ id, type: d.type, from, days: Number(d.days), status: 'pending' });
    D.save(); D.toast('Leave request sent to your HOD. Switch to the HOD role to approve it.', 'ok'); D.render();
  };

  D.roles.teacher = {
    label: 'Teacher', icon: '🧑‍🏫',
    nav: [
      { id: 'today', label: 'My sections', icon: '🏠' },
      { id: 'attendance', label: 'Mark attendance', icon: '✅', badge: () => (S().attendance[MY_SEC] ? 0 : 1) },
      { id: 'marks', label: 'Enter marks', icon: '📝' },
      { id: 'homework', label: 'Homework', icon: '📚' },
      { id: 'myatt', label: 'My attendance & leave', icon: '🌴' },
    ],
    pages: { today: D.teacherToday, attendance, marks, homework, myatt: myAttendance },
  };

  // ---------- HOD ----------
  D.deptHome = (deptName) => {
    const dept = D.departments.find((d) => d.name === deptName);
    const team = D.staff.filter((s) => dept.members.includes(s.name));
    const present = team.filter((s) => ['present', 'late', 'half-day'].includes(s.att)).length;
    const pendingLeaves = S().leaves.filter((l) => l.status === 'pending' && l.approver === 'HOD').length;
    const overdue = S().tasks.filter((t) => t.status === 'overdue').length;
    return `<div class="row between mb"><div><h1 style="margin:0">Department of ${esc(deptName)}</h1><span class="muted">HOD: ${esc(dept.hod)} · ${dept.members.length} teachers · ${dept.subjects.join(', ')}</span></div>${deptName === 'Science' ? '<a class="btn" href="#/app/teacher/today">My teaching view →</a>' : ''}</div>
      <div class="grid g4">${D.kpi('Team present', `${present} / ${team.length}`, team.filter((s) => s.att === 'on leave').length + ' on leave')}${D.kpi('Leave pending', pendingLeaves, 'awaiting your decision')}${D.kpi('Overdue tasks', overdue, `${S().tasks.length} tasks open`)}${D.kpi('Term 1 marks', S().marksSubmitted ? '12 / 14' : '11 / 14', 'subjects submitted')}</div>
      <div class="grid g2 mt"><div class="card"><h3>Team today</h3>${team.map((s) => `<div class="list-item"><div class="avatar">${s.name.split(' ').map((x) => x[0]).join('').slice(0, 2)}</div><div class="grow"><b>${esc(s.name)}</b><div class="small muted">In: ${esc(s.in)}</div></div><span class="tag ${s.att === 'present' ? 'ok' : s.att === 'not marked' ? 'bad' : 'warn'}">${esc(s.att)}</span></div>`).join('')}</div>
        <div class="card"><h3>Syllabus progress vs plan</h3>${[['Class 8 Chemistry', 40, 60], ['Class 9 Physics', 55, 55], ['Class 10 Biology', 62, 65], ['Class 7 Science', 58, 50]].map(([n, a, p]) => `<div class="mb"><div class="row between small"><span>${n}</span><span class="num">${a}% <span class="muted">/ plan ${p}%</span></span></div><div class="bar ${a < p - 10 ? 'bad' : a < p ? 'warn' : 'ok'}"><span style="width:${a}%"></span></div></div>`).join('')}</div></div>`;
  };

  function hodLeaves() {
    const list = S().leaves.filter((l) => l.approver === 'HOD');
    return `<div class="card"><h3>Leave & attendance corrections — Science</h3><p class="small muted">Leave from you (an HOD) goes to the Principal. Nobody approves their own request.</p>
      ${list.map((l) => `<div class="list-item"><div class="grow"><b>${esc(l.who)}</b> · ${esc(l.type)}<div class="small muted">${esc(l.from)} · ${l.days} day · ${esc(l.reason)}</div></div>${l.status === 'pending' ? `<button class="btn sm primary" data-act="approve" data-kind="leaves" data-id="${l.id}">Approve</button><button class="btn sm danger" data-act="reject" data-kind="leaves" data-id="${l.id}">Reject</button>` : `<span class="tag ${l.status === 'approved' ? 'ok' : 'bad'}">${l.status}</span>`}</div>`).join('') || '<div class="empty">No requests</div>'}
      <h3 class="mt">Cover for absent class teachers</h3><div class="list-item"><div class="grow"><b>Shruti Srivastava</b> (on leave) · class teacher of 7-B</div><select style="width:auto" data-change="cover"><option>Assign cover…</option><option>Nikhil Singh</option><option>Priya Tiwari</option></select></div></div>`;
  }
  D.change.cover = (el) => D.toast(`${el.value} can mark 7-B attendance today only.`, 'ok');

  function hodTasks() {
    return `<div class="grid g2"><form class="card" data-form="task"><h3>Assign a task</h3><div class="stack"><label class="field">Task<input type="text" name="title" required value="Prepare Unit Test 2 blueprint"></label>
      <label class="field">Assign to</label><div class="chips">${D.departments[0].members.slice(1, 6).map((m, i) => `<label class="chip"><input type="checkbox" name="m${i}" value="${esc(m)}" ${i < 2 ? 'checked' : ''}> ${esc(m)}</label>`).join('')}</div>
      <label class="field">Due<input type="date" name="due" value="2026-11-15"></label><button class="btn primary">Assign</button></div></form>
      <div class="card"><h3>Department tasks</h3>${S().tasks.map((t) => `<div class="list-item"><div class="grow"><b>${esc(t.title)}</b><div class="small muted">${t.to.map(esc).join(', ')} · due ${esc(t.due)} · ${t.done}/${t.to.length} done</div></div><span class="tag ${t.status === 'overdue' ? 'bad' : t.status === 'done' ? 'ok' : 'info'}">${t.status}</span></div>`).join('')}</div></div>`;
  }
  D.forms.task = (d) => {
    const to = Object.keys(d).filter((k) => /^m\d$/.test(k)).map((k) => d[k]);
    S().tasks.unshift({ id: 'T' + Date.now(), title: d.title, to, due: new Date(d.due).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }), status: 'open', done: 0 });
    D.save(); D.toast(`Task assigned to ${to.length} teacher(s).`, 'ok'); D.render();
  };

  function hodRemarks() {
    return `<div class="grid g2"><form class="card" data-form="sremark"><h3>Remark about a teacher</h3><div class="stack"><label class="field">Teacher<select name="about">${D.departments[0].members.slice(1).map((m) => `<option>${esc(m)}</option>`).join('')}</select></label>
      <label class="field">Remark<textarea name="text">Classroom observation: well-structured lesson on fractions.</textarea></label><label class="row small"><input type="checkbox" name="shared" checked> Share with the teacher</label><button class="btn primary">Save remark</button></div></form>
      <div class="card"><h3>Recent remarks</h3>${S().staffRemarks.map((r) => `<div class="list-item"><div class="grow"><b>${esc(r.about)}</b> · ${esc(r.date)}<div class="small muted">${esc(r.text)}</div></div><span class="tag ${r.shared ? 'info' : ''}">${r.shared ? 'shared' : 'private'}</span></div>`).join('')}</div></div>`;
  }
  D.forms.sremark = (d) => { S().staffRemarks.unshift({ about: d.about, by: 'Kavita Jha', date: 'Today', text: d.text, shared: !!d.shared }); D.save(); D.toast('Remark saved.', 'ok'); D.render(); };

  function hodMarks() {
    const rows = [['Science', '6-A', 'Priya Tiwari', 'submitted'], ['Mathematics', '6-B', 'Rakesh Yadav', S().marksSubmitted ? 'submitted' : 'draft'], ['Science', '7-A', 'Rakesh Yadav', 'approved'], ['Physics', '9-A', 'Kavita Jha', 'approved'], ['Chemistry', '10-B', 'Nikhil Singh', 'draft']];
    return `<div class="card"><h3>Term 1 marks review before lock</h3><p class="small muted">HOD review is mandatory before the Principal locks and publishes.</p>
      <div class="table-wrap"><table><tr><th>Subject</th><th>Section</th><th>Teacher</th><th>Average</th><th>Status</th><th></th></tr>${rows.map(([s, sec, t, st], i) => `<tr><td>${s}</td><td>${sec}</td><td>${t}</td><td class="num">${st === 'draft' ? '—' : 68 + i * 3 + '%'}</td><td><span class="tag ${st === 'approved' ? 'ok' : st === 'submitted' ? 'warn' : ''}">${st}</span></td><td>${st === 'submitted' ? `<button class="btn sm primary" data-act="marks-ok">Approve</button> <button class="btn sm" data-act="marks-return">Return</button>` : ''}</td></tr>`).join('')}</table></div></div>`;
  }
  D.act['marks-ok'] = () => D.toast('Approved — ready for the Principal to lock.', 'ok');
  D.act['marks-return'] = () => D.toast('Returned to the teacher with your comment.', 'ok');

  D.roles.hod = {
    label: 'HOD', icon: '🔬',
    nav: [
      { id: 'dept', label: 'Department', icon: '🏛️' },
      { id: 'leaves', label: 'Leave approvals', icon: '🌴', badge: () => S().leaves.filter((l) => l.status === 'pending' && l.approver === 'HOD').length },
      { id: 'tasks', label: 'Tasks', icon: '📌' },
      { id: 'remarks', label: 'Remarks', icon: '💬' },
      { id: 'marks', label: 'Marks review', icon: '📝' },
      { id: 'teach', label: 'My sections', icon: '🧑‍🏫', group: 'Also a teacher' },
    ],
    pages: { dept: () => D.deptHome('Science'), leaves: hodLeaves, tasks: hodTasks, remarks: hodRemarks, marks: hodMarks, teach: () => `<div class="grid g2">${checkInCard()}<div class="card"><h3>My sections</h3><div class="list-item"><span class="tag pri">9-A</span><div class="grow">Physics · subject teacher</div></div><div class="list-item"><span class="tag pri">10-A</span><div class="grow">Physics · subject teacher</div></div><p class="small muted mt">Layered views: an HOD sees their own teaching plus the department panels.</p></div></div>` },
  };

  // ---------- Accountant ----------
  const dueLines = (due) => {
    const lines = [];
    let left = due, n = 0;
    while (left > 0) {
      const chunk = Math.min(4500, left);
      const label = n === 0 && due > 4500 ? 'Instalment 2 (Jul) — overdue' : 'Instalment 3 (Nov)';
      if (chunk === 4500) D.feeHeads.forEach((h) => lines.push([`${label} · ${h.head}`, h.amount]));
      else lines.push([`${label} · balance`, chunk]);
      left -= chunk; n++;
    }
    return lines;
  };

  function collect(arg) {
    const q = (D.ui.feeQ || '').toLowerCase();
    const st = arg ? D.findStudent(arg) : null;
    const results = q ? D.allStudents().filter((s) => s.name.toLowerCase().includes(q) || s.adm.toLowerCase().includes(q) || s.mobile.replace(/\s/g, '').includes(q.replace(/\s/g, ''))).slice(0, 8) : [];
    const closed = S().dayClosed;
    return `${closed ? '<div class="notice-banner warn mb"><b>Day closed.</b> New payments are blocked until the Principal approves a reopen.</div>' : ''}
      <div class="grid g3"><div class="card"><h3>Find student</h3><input type="search" placeholder="Name, admission no. or mobile" value="${esc(D.ui.feeQ || '')}" data-change="fee-q" autofocus>
        <div class="mt">${results.map((s) => `<a class="list-item" style="text-decoration:none;color:inherit" href="#/app/accountant/collect/${s.id}"><div class="grow"><b>${esc(s.name)}</b><div class="small muted">${s.section} · ${esc(s.adm)}</div></div><b class="num">${D.dueOf(s) ? money(D.dueOf(s)) : '—'}</b></a>`).join('') || `<p class="small muted">Try “Aarav”, “SPS/24” or a mobile number.</p><a class="btn sm" href="#/app/accountant/collect/S-AARAV">Quick pick: Aarav Sharma (6-B)</a>`}</div></div>
      <div class="card span2">${st ? (() => {
        const due = D.dueOf(st);
        if (!due) return `<h3>${esc(st.name)} · ${st.section}</h3><div class="notice-banner ok">No dues outstanding 🎉</div>`;
        const lines = dueLines(due);
        const mode = D.ui.payMode || 'Cash';
        return `<div class="card-head"><h3>${esc(st.name)} · ${st.section} · ${esc(st.adm)}</h3><span class="tag warn">Due ${money(due)}</span></div>
          <div class="table-wrap"><table><tr><th>Fee head</th><th class="r">Amount</th></tr>${lines.map(([h, a]) => `<tr><td>${esc(h)}</td><td class="r num">${money(a)}</td></tr>`).join('')}<tr><td><b>Total due</b></td><td class="r num"><b>${money(due)}</b></td></tr></table></div>
          <div class="row mt"><span class="small muted">Mode</span><div class="chips">${['Cash', 'UPI', 'Cheque', 'Card'].map((m) => `<button class="chip ${m === mode ? 'on' : ''}" data-act="pay-mode" data-m="${m}">${m}</button>`).join('')}</div></div>
          <div class="row mt"><label class="field" style="width:180px">Amount received<input type="number" id="pay-amt" value="${due}" min="1" max="${due}"></label>${mode === 'Cheque' ? '<label class="field" style="width:180px">Cheque no.<input type="text" value="004613"></label>' : ''}${mode === 'UPI' ? '<label class="field" style="width:200px">UPI ref<input type="text" value="UTR 6301 2245 8812"></label>' : ''}</div>
          <div class="row mt"><button class="btn primary lg" data-act="collect" data-id="${st.id}" ${closed ? 'disabled' : ''}>Collect & print receipt</button><span class="small muted">Idempotent: a double-tap never creates two receipts.</span></div>`;
      })() : '<div class="empty"><div style="font-size:40px">🧾</div>Search and pick a student to see itemised dues.</div>'}</div></div>`;
  }
  D.change['fee-q'] = (el) => { D.ui.feeQ = el.value; D.render(); };
  D.act['pay-mode'] = (el) => { D.ui.payMode = el.dataset.m; D.render(); };
  D.act.collect = (el) => {
    const st = D.findStudent(el.dataset.id);
    const amt = Math.min(D.dueOf(st), Number(document.getElementById('pay-amt').value) || 0);
    if (amt <= 0) return D.toast('Enter an amount.');
    S().paid = S().paid || {};
    S().paid[st.id] = D.paidOf(st.id) + amt;
    const r = { no: `R/26-27/0${S().receiptSeq++}`, student: `${st.name} (${st.section})`, amount: amt, mode: D.ui.payMode || 'Cash', time: D.nowTime(), lines: dueLines(amt) };
    if (r.mode === 'Cheque') S().cheques.unshift({ no: '004613', bank: 'SBI Bhagalpur', student: r.student, amount: amt, status: 'pending' });
    S().receipts.unshift(r); D.save();
    D.sendWA(st.guardian, 'Payment receipt', `Sunrise Public School: received ${money(amt)} for ${st.name} (${st.section}) by ${r.mode}. Receipt ${r.no}. Thank you!`, { quiet: true });
    D.modal(`${D.receiptHtml(r)}<div class="modal-actions"><button class="btn" data-act="print">🖨️ Print</button><button class="btn" data-act="print">Download PDF</button><button class="btn primary" data-act="modal-close">Done</button></div>`, { wide: true });
    D.render();
  };

  function receipts() {
    return `<div class="card"><div class="card-head"><h3>Today’s receipts</h3><span class="tag pri">${S().receipts.length} shown · gapless numbering</span></div>
      <div class="table-wrap"><table><tr><th>Receipt</th><th>Student</th><th>Mode</th><th>Time</th><th class="r">Amount</th><th></th></tr>${S().receipts.map((r, i) => `<tr><td class="num">${esc(r.no)}</td><td>${esc(r.student)}</td><td>${esc(r.mode)}</td><td>${esc(r.time)}</td><td class="r num">${money(r.amount)}</td><td><button class="btn sm" data-act="view-receipt" data-i="${i}">View</button> <button class="btn sm danger" data-act="req-reversal" data-i="${i}">Reverse…</button></td></tr>`).join('')}</table></div></div>`;
  }
  D.act['view-receipt'] = (el) => D.modal(`${D.receiptHtml(S().receipts[el.dataset.i])}<div class="modal-actions"><button class="btn" data-act="print">Print</button><button class="btn primary" data-act="modal-close">Close</button></div>`, { wide: true });
  D.act['req-reversal'] = (el) => {
    const r = S().receipts[el.dataset.i];
    S().reversals.unshift({ id: 'RV' + Date.now(), receipt: r.no, student: r.student, amount: r.amount, reason: 'Wrong student selected at counter', status: 'pending' });
    D.save(); D.toast('Reversal requested — needs Principal approval. The original receipt is never edited.', 'ok'); D.render();
  };

  function cheques() {
    return `<div class="card"><h3>Cheques</h3><div class="table-wrap"><table><tr><th>No.</th><th>Bank</th><th>Student</th><th class="r">Amount</th><th>Status</th><th></th></tr>${S().cheques.map((c, i) => `<tr><td class="num">${c.no}</td><td>${esc(c.bank)}</td><td>${esc(c.student)}</td><td class="r num">${money(c.amount)}</td><td><span class="tag ${c.status === 'cleared' ? 'ok' : c.status === 'bounced' ? 'bad' : 'warn'}">${c.status}</span></td><td>${c.status === 'pending' ? `<button class="btn sm primary" data-act="chq" data-i="${i}" data-s="cleared">Cleared</button> <button class="btn sm danger" data-act="chq" data-i="${i}" data-s="bounced">Bounced</button>` : ''}</td></tr>`).join('')}</table></div>
      <p class="small muted mt">A bounced cheque re-opens the dues and adds the bank charge automatically.</p></div>`;
  }
  D.act.chq = (el) => { S().cheques[el.dataset.i].status = el.dataset.s; D.save(); D.toast(`Cheque marked ${el.dataset.s}.`, 'ok'); D.render(); };

  function dayClose() {
    const cash = S().receipts.filter((r) => r.mode === 'Cash').reduce((a, r) => a + r.amount, 0) + 52000;
    const upi = S().receipts.filter((r) => r.mode !== 'Cash').reduce((a, r) => a + r.amount, 0) + 116500;
    const counted = D.ui.counted ?? cash;
    const diff = counted - cash;
    return `<div class="grid g3">${D.kpi('Cash expected', money(cash))}${D.kpi('UPI / card / cheque', money(upi))}${D.kpi('Total today', money(cash + upi))}</div>
      <div class="card mt">${S().dayClosed ? `<div class="notice-banner ok"><b>Day closed at ${esc(S().closedAt)}.</b> Receipts are locked. ${S().reopenRequest ? 'Reopen request is with the Principal.' : ''}</div>${S().reopenRequest ? '' : '<button class="btn mt" data-act="req-reopen">Request reopen</button>'}`
      : `<h3>Count the drawer</h3><div class="row"><label class="field" style="width:200px">Counted cash<input type="number" value="${counted}" data-change="counted"></label>
        <div class="stat"><span class="label">Difference</span><span class="value" style="color:${diff === 0 ? 'var(--success)' : 'var(--danger)'}">${diff === 0 ? '₹0 ✓' : money(diff)}</span></div></div>
        ${diff !== 0 ? '<div class="notice-banner warn mt">Difference must be explained before closing.</div>' : ''}
        <button class="btn primary mt" data-act="close-day">Close the day</button>`}</div>`;
  }
  D.change.counted = (el) => { D.ui.counted = Number(el.value); D.render(); };
  D.act['close-day'] = () => { S().dayClosed = true; S().closedAt = D.nowTime(); D.save(); D.toast('Day closed. Summary sent to the Principal.', 'ok'); D.render(); };
  D.act['req-reopen'] = () => { S().reopenRequest = { at: D.nowTime() }; D.save(); D.toast('Reopen request sent to the Principal.', 'ok'); D.render(); };

  function online() {
    return `<div class="card"><h3>Online payments — reconciliation</h3><p class="small muted">Each provider payment posts to the ledger exactly once. Uncertain outcomes are never guessed — they are reconciled.</p>
      <div class="table-wrap"><table><tr><th>Ref</th><th>Student</th><th class="r">Amount</th><th>Time</th><th>Status</th><th></th></tr>${S().onlinePayments.map((p, i) => `<tr><td class="num">${p.ref}</td><td>${esc(p.student)}</td><td class="r num">${money(p.amount)}</td><td>${p.at}</td><td><span class="tag ${p.status === 'posted' ? 'ok' : p.status === 'unresolved' ? 'bad' : 'warn'}">${p.status}</span></td><td>${p.status !== 'posted' ? `<button class="btn sm" data-act="reconcile" data-i="${i}">Check with provider</button>` : ''}</td></tr>`).join('')}</table></div></div>`;
  }
  D.act.reconcile = (el) => { const p = S().onlinePayments[el.dataset.i]; p.status = 'posted'; D.save(); D.toast(`${p.ref}: provider confirms settlement — posted once to the ledger.`, 'ok'); D.render(); };

  function feeReports() {
    const defaulters = D.allStudents().filter((s) => D.dueOf(s) >= 9000).slice(0, 8);
    return `<div class="grid g2"><div class="card"><h3>Collection by mode (today)</h3>${D.barRow('Cash', 31, '')}${D.barRow('UPI', 52, 'ok')}${D.barRow('Cheque', 12, 'warn')}${D.barRow('Online (portal)', 5, '')}</div>
      <div class="card"><div class="card-head"><h3>Overdue ≥ 2 instalments</h3><button class="btn sm" data-act="remind">Send WhatsApp reminders</button></div>${defaulters.map((s) => `<div class="list-item"><div class="grow"><b>${esc(s.name)}</b> · ${s.section}</div><b class="num">${money(D.dueOf(s))}</b></div>`).join('')}</div></div>`;
  }
  D.act.remind = () => D.sendWA('8 guardians', 'Fee reminder', 'Sunrise Public School: a fee balance is overdue for your child. Pay at the office or online: https://sunrise.example/pay');

  D.roles.accountant = {
    label: 'Accountant', icon: '🧾',
    nav: [
      { id: 'collect', label: 'Collect fee', icon: '💵' },
      { id: 'receipts', label: 'Receipts', icon: '🧾' },
      { id: 'cheques', label: 'Cheques', icon: '🏦', badge: () => S().cheques.filter((c) => c.status === 'pending').length },
      { id: 'online', label: 'Online payments', icon: '🌐', badge: () => S().onlinePayments.filter((p) => p.status !== 'posted').length },
      { id: 'dayclose', label: 'Day close', icon: '🔐' },
      { id: 'reports', label: 'Reports', icon: '📈' },
    ],
    pages: { collect, receipts, cheques, online, dayclose: dayClose, reports: feeReports },
  };
})();
