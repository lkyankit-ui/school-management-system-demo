/* Post-pilot roadmap previews (R1–R6 in ROADMAP-PLAN.md). Kept apart from the 16-epic screens. */
(function () {
  const D = window.DEMO;
  const { esc, money } = D;
  const S = () => D.state;
  const hash = (s) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 9973, 7);

  D.download = (name, text, type) => {
    const url = URL.createObjectURL(new Blob([text], { type }));
    const a = document.createElement('a');
    a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const csvCell = (v) => { const s = String(v ?? ''); return /^[=+\-@]/.test(s) ? `'${s}` : /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };

  // ---------- R1: UDISE+ / APAAR export ----------
  const CATS = ['General', 'OBC', 'SC', 'ST'];
  const TONGUES = ['Marathi', 'Hindi', 'Marathi', 'Urdu', 'Marathi', 'Gujarati'];
  const udise = (st) => {
    const h = hash(st.id);
    return {
      pen: h % 9 === 0 ? '' : `PEN${String(27000000000 + h * 1013).slice(0, 11)}`,
      apaar: h % 7 === 0 ? '' : `${String(100000000000 + h * 7919).slice(0, 12)}`,
      apaarConsent: h % 7 === 0 ? 'not given' : 'given',
      mother: h % 11 === 0 ? '' : `${['Meena', 'Sunita', 'Kavita', 'Asha', 'Rekha'][h % 5]} ${st.name.split(' ')[1]}`,
      category: CATS[h % 4], tongue: TONGUES[h % 6], cwsn: h % 23 === 0 ? 'Yes' : 'No',
    };
  };
  const issues = (st) => { const u = udise(st); return [!u.pen && 'PEN missing', !u.mother && "Mother's name missing", !u.apaar && 'APAAR ID not generated (consent pending)'].filter(Boolean); };

  function gov() {
    const cls = D.ui.govCls || '6';
    const list = D.sections.filter((s) => String(s.cls) === cls).flatMap((s) => s.students);
    const all = D.allStudents();
    const bad = all.filter((s) => issues(s).length);
    const apaar = all.filter((s) => udise(s).apaar).length;
    return `${D.roadmapBanner('R1')}
      <div class="grid g4">${D.kpi('UDISE+ ready', `${D.pct(all.length - bad.length, all.length)}%`, `${all.length - bad.length} of ${all.length} students`)}${D.kpi('Need fixing', bad.length, 'missing PEN, mother’s name or APAAR')}${D.kpi('APAAR IDs', `${apaar}`, `${all.length - apaar} awaiting parent consent`)}${D.kpi('Last filed', '30 Sep 2026', 'UDISE+ 2026–27 · school profile')}</div>
      <div class="card mt"><div class="card-head"><h3>Student data check — Class ${cls}</h3>
        <div class="row"><select data-change="gov-cls">${[...Array(10)].map((_, i) => `<option ${String(i + 1) === cls ? 'selected' : ''}>${i + 1}</option>`).join('')}</select>
        <button class="btn sm" data-act="gov-csv" data-kind="udise">⬇ UDISE+ CSV</button><button class="btn sm primary" data-act="gov-csv" data-kind="apaar">⬇ APAAR CSV</button></div></div>
        <div class="table-wrap"><table><tr><th>Student</th><th>Sec</th><th>PEN</th><th>APAAR ID</th><th>Category</th><th>Mother tongue</th><th>Issues</th></tr>
        ${list.map((st) => { const u = udise(st); const is = issues(st); return `<tr><td><b>${esc(st.name)}</b></td><td>${st.section}</td><td class="num">${u.pen || '—'}</td><td class="num">${u.apaar ? '••••' + u.apaar.slice(-4) : '—'}</td><td>${u.category}</td><td>${u.tongue}</td><td>${is.length ? is.map((i) => `<span class="tag bad">${esc(i)}</span>`).join(' ') : '<span class="tag ok">✓ Ready</span>'}</td></tr>`; }).join('')}</table></div>
        <p class="small muted mt">APAAR IDs are Aadhaar-linked. They are generated only with recorded parent consent, shown masked, and every export is audited (DPDP Act).</p></div>`;
  }
  D.change['gov-cls'] = (el) => { D.ui.govCls = el.value; D.render(); };
  D.act['gov-csv'] = (el) => {
    const cls = D.ui.govCls || '6';
    const list = D.sections.filter((s) => String(s.cls) === cls).flatMap((s) => s.students);
    const apaar = el.dataset.kind === 'apaar';
    const head = apaar ? ['Student Name', 'Class', 'Section', 'DOB', 'Gender', 'APAAR ID', 'Consent'] : ['Student Name', 'Gender', 'DOB', 'Class', 'Section', 'Mother Name', 'Social Category', 'Mother Tongue', 'CWSN', 'PEN'];
    const rows = list.map((st) => { const u = udise(st); return apaar ? [st.name, st.cls ?? cls, st.section.split('-')[1], st.dob, st.gender, u.apaar, u.apaarConsent] : [st.name, st.gender, st.dob, cls, st.section.split('-')[1], u.mother, u.category, u.tongue, u.cwsn, u.pen]; });
    D.download(`${apaar ? 'APAAR' : 'UDISE'}_Sunrise_Class${cls}_DEMO.csv`, [head, ...rows].map((r) => r.map(csvCell).join(',')).join('\r\n'), 'text/csv');
    D.toast(`Synthetic ${apaar ? 'APAAR' : 'UDISE+'} CSV for Class ${cls} downloaded (demo data).`, 'ok');
  };

  // ---------- R5: certificates ----------
  const CERTS = { tc: 'Transfer Certificate', bonafide: 'Bonafide Certificate', character: 'Character Certificate' };
  const certHtml = (st, type, no) => `<div class="paper" style="font-family:Georgia,serif"><div style="text-align:center"><div class="logo sun" style="margin:0 auto">SPS</div><b style="font-size:20px">${esc(D.school.name)}</b><div class="small" style="color:#555">${esc(D.school.address)} · ${esc(D.school.board)}</div>
      <h3 style="margin-top:14px;text-decoration:underline">${CERTS[type].toUpperCase()}</h3></div>
    <div class="row between small"><span>No. <b>${esc(no)}</b></span><span>Date: ${esc(D.school.today)}</span></div>
    <p style="margin-top:16px;line-height:1.9">This is to certify that <b>${esc(st.name)}</b>, ${st.gender === 'F' ? 'daughter' : 'son'} of <b>${esc(st.guardian)}</b>, Admission No. <b>${esc(st.adm)}</b>, date of birth <b>${esc(st.dob)}</b>,
    ${type === 'tc' ? `was a bonafide student of this school in Class <b>${st.section}</b> during ${esc(D.school.year)}. All dues have been cleared and the student has left the school on parent request. Conduct: <b>Good</b>.`
      : type === 'bonafide' ? `is a bonafide student of this school studying in Class <b>${st.section}</b> in the academic year ${esc(D.school.year)}.`
      : `has been a student of this school and, to the best of our knowledge, bears a good moral character.`}</p>
    <div class="row between small" style="margin-top:40px"><span>Prepared by: Office</span><span>Principal — ${esc(D.school.principal)}</span></div></div>`;

  function certs() {
    const sec = D.section(D.ui.certSec || '6-B');
    const st = D.findStudent(D.ui.certStu) || sec.students[0];
    const type = D.ui.certType || 'bonafide';
    const issued = S().certs || [];
    return `${D.roadmapBanner('R6')}
      <div class="grid g3"><div class="card"><h3>Issue a certificate</h3><div class="stack">
        <label class="field">Type<select data-change="cert-type">${Object.entries(CERTS).map(([k, v]) => `<option value="${k}" ${k === type ? 'selected' : ''}>${v}</option>`).join('')}</select></label>
        <label class="field">Section<select data-change="cert-sec">${D.sections.map((s) => `<option ${s.id === sec.id ? 'selected' : ''}>${s.id}</option>`).join('')}</select></label>
        <label class="field">Student<select data-change="cert-stu">${sec.students.map((s) => `<option value="${s.id}" ${s.id === st.id ? 'selected' : ''}>${esc(s.name)}</option>`).join('')}</select></label>
        ${type === 'tc' && D.dueOf(st) ? `<div class="notice-banner warn small">Dues of ${money(D.dueOf(st))} must be cleared before a TC is issued.</div>` : ''}
        <button class="btn primary" data-act="cert-issue" ${type === 'tc' && D.dueOf(st) ? 'disabled' : ''}>Issue & print</button></div>
        <h3 class="mt">Issued</h3>${issued.length ? issued.map((c) => `<div class="list-item"><span class="tag pri">${esc(c.no)}</span><div class="grow small">${esc(c.type)} · ${esc(c.name)}</div></div>`).join('') : '<p class="small muted">None yet.</p>'}</div>
      <div class="span2">${certHtml(st, type, 'preview')}</div></div>`;
  }
  D.change['cert-type'] = (el) => { D.ui.certType = el.value; D.render(); };
  D.change['cert-sec'] = (el) => { D.ui.certSec = el.value; D.ui.certStu = null; D.render(); };
  D.change['cert-stu'] = (el) => { D.ui.certStu = el.value; D.render(); };
  D.act['cert-issue'] = () => {
    const sec = D.section(D.ui.certSec || '6-B');
    const st = D.findStudent(D.ui.certStu) || sec.students[0];
    const type = D.ui.certType || 'bonafide';
    S().certs = S().certs || [];
    const no = `SPS/${type.toUpperCase().slice(0, 3)}/2026/${String(41 + S().certs.length).padStart(4, '0')}`;
    S().certs.unshift({ no, type: CERTS[type], name: st.name }); D.save();
    D.modal(`${certHtml(st, type, no)}<div class="modal-actions"><button class="btn" data-act="print">🖨️ Print</button><button class="btn primary" data-act="modal-close">Done</button></div>`, { wide: true });
    D.render();
  };

  // ---------- R4: Tally export ----------
  function tally() {
    const r = S().receipts;
    const by = (m) => r.filter((x) => (m === 'Cash' ? x.mode === 'Cash' : x.mode !== 'Cash')).reduce((a, x) => a + x.amount, 0);
    const total = r.reduce((a, x) => a + x.amount, 0);
    return `${D.roadmapBanner('R5')}
      <div class="grid g3">${D.kpi('Receipts today', r.length, money(total))}${D.kpi('Cash ledger', money(by('Cash')), 'Dr Cash-in-hand')}${D.kpi('Bank ledger', money(by('Bank')), 'Dr SBI Current A/c')}</div>
      <div class="card mt"><div class="card-head"><h3>Voucher preview — ${esc(D.school.today)}</h3><div class="row"><select><option>Today</option><option>This week</option><option>October 2026</option></select><button class="btn primary sm" data-act="tally-xml">⬇ Download Tally XML</button></div></div>
        <div class="table-wrap"><table><tr><th>Voucher</th><th>Type</th><th>Debit ledger</th><th>Credit ledger</th><th class="r">Amount</th></tr>
        ${r.map((x) => `<tr><td class="num">${esc(x.no)}</td><td>Receipt</td><td>${x.mode === 'Cash' ? 'Cash-in-hand' : 'SBI Current A/c'}</td><td>Tuition Fee Income · ${esc(x.student)}</td><td class="r num">${money(x.amount)}</td></tr>`).join('')}</table></div>
        <p class="small muted mt">Ledger names are mapped once in Settings. Only closed days are exported, so Tally never disagrees with the receipt book.</p></div>`;
  }
  D.act['tally-xml'] = () => {
    const vouchers = S().receipts.map((x) => `  <TALLYMESSAGE><VOUCHER VCHTYPE="Receipt"><DATE>20261027</DATE><VOUCHERNUMBER>${x.no}</VOUCHERNUMBER><NARRATION>${esc(x.student)}</NARRATION>
    <ALLLEDGERENTRIES.LIST><LEDGERNAME>${x.mode === 'Cash' ? 'Cash-in-hand' : 'SBI Current A/c'}</LEDGERNAME><AMOUNT>-${x.amount}</AMOUNT></ALLLEDGERENTRIES.LIST>
    <ALLLEDGERENTRIES.LIST><LEDGERNAME>Tuition Fee Income</LEDGERNAME><AMOUNT>${x.amount}</AMOUNT></ALLLEDGERENTRIES.LIST></VOUCHER></TALLYMESSAGE>`).join('\n');
    D.download('Sunrise_Tally_20261027_DEMO.xml', `<?xml version="1.0"?>\n<!-- Synthetic demo data -->\n<ENVELOPE><HEADER><TALLYREQUEST>Import Data</TALLYREQUEST></HEADER><BODY><IMPORTDATA><REQUESTDATA>\n${vouchers}\n</REQUESTDATA></IMPORTDATA></BODY></ENVELOPE>\n`, 'application/xml');
    D.toast('Tally XML downloaded (demo data).', 'ok');
  };

  // ---------- R3: two-way WhatsApp (exploring) ----------
  D.waReplyBar = () => `<div style="background:#F0F0F0;padding:8px;border-top:1px solid #ddd"><div style="font-size:10.5px;color:#667;margin-bottom:4px">? Exploring — reply as Meena (parent):</div>
    <div class="chips">${['LEAVE', 'FEES', 'RESULT', 'HOMEWORK'].map((k) => `<button class="chip" style="background:#fff;color:#075E54;border-color:#075E54;font-size:12px;padding:4px 10px" data-act="wa-reply" data-k="${k}">${k}</button>`).join('')}</div></div>`;
  D.act['wa-reply'] = (el) => {
    const k = el.dataset.k;
    const aarav = D.findStudent('S-AARAV');
    const push = (m) => S().wa.unshift({ to: 'Meena Devi', time: D.nowTime(), ...m });
    push({ out: true, kind: 'Meena', text: k === 'LEAVE' ? 'LEAVE Aarav 28 Oct fever' : k });
    let reply;
    if (k === 'LEAVE') {
      S().absenceNotes.push({ student: 'S-AARAV', date: '28 Oct (tomorrow)', reason: 'Fever (via WhatsApp)' });
      reply = 'Got it ✓ Leave note for Aarav (6-B) on 28 Oct sent to the class teacher, Rakesh Yadav. You will not get an absence alert for that day.';
    } else if (k === 'FEES') {
      const due = D.dueOf(aarav);
      reply = due ? `Aarav (6-B): ${money(due)} due on 10 Nov.\nPay by UPI: https://sunrise.example/pay/••••\n(Diya: no dues ✓)` : 'Aarav and Diya have no dues ✓';
    } else if (k === 'RESULT') {
      reply = S().resultsPublished ? 'Term 1 results — Aarav: 83% (A2), Diya: 91% (A1). Report cards: https://sunrise.example/r/••••' : 'Term 1 results are not published yet. We will message you when they are out.';
    } else {
      const hw = [...S().homework.filter((h) => h.sec === '6-B'), ...D.childData['S-AARAV'].homework].filter((h) => h.status === 'pending').slice(0, 3);
      reply = `Aarav’s homework:\n${hw.map((h) => `• ${h.subj}: ${h.title} (due ${h.due})`).join('\n')}`;
    }
    push({ kind: 'Auto-reply', text: reply });
    D.save(); D.renderWA();
  };

  // ---------- R3: Marathi ----------
  const MR = {
    'Today': 'आज', 'Students': 'विद्यार्थी', 'Guardians': 'पालक', 'Attendance': 'हजेरी', 'Fees': 'शुल्क', 'Exams': 'परीक्षा', 'Results': 'निकाल',
    'Homework': 'गृहपाठ', 'Notices': 'सूचना', 'Staff': 'कर्मचारी', 'Settings': 'सेटिंग्ज', 'Approvals': 'मंजुरी', 'Reports': 'अहवाल', 'Audit log': 'ऑडिट लॉग',
    'My sections': 'माझे वर्ग', 'Mark attendance': 'हजेरी नोंदवा', 'Enter marks': 'गुण भरा', 'My attendance & leave': 'माझी हजेरी व रजा',
    'Collect fee': 'शुल्क जमा करा', 'Day close': 'दिवस बंद', 'Cheques': 'धनादेश', 'Online payments': 'ऑनलाइन भरणा', 'Home': 'मुख्यपृष्ठ', 'Receipts': 'पावत्या',
    'Remarks': 'शेरा', 'PTM': 'पालक-शिक्षक सभा', 'Import students': 'विद्यार्थी आयात', 'Messaging': 'संदेश', 'Academic setup': 'शैक्षणिक रचना',
    'Calendar': 'दिनदर्शिका', 'Website': 'संकेतस्थळ', 'Admissions': 'प्रवेश', 'Data rights': 'माहिती हक्क', 'Department': 'विभाग', 'Tasks': 'कामे',
    'Leave approvals': 'रजा मंजुरी', 'Marks review': 'गुण तपासणी', 'Schools': 'शाळा', 'Go-live gates': 'गो-लाइव्ह गेट', 'Overview': 'आढावा',
    'Present': 'हजर', 'Absent': 'गैरहजर', 'Late': 'उशिरा', 'Submit attendance': 'हजेरी सादर करा', 'Switch role': 'भूमिका बदला',
    'Good morning': 'सुप्रभात', 'Pay now': 'आता भरा', 'Report card': 'प्रगतिपत्रक', 'My account': 'माझे खाते', 'Reset demo': 'डेमो रीसेट करा',
    'Government reports': 'शासकीय अहवाल', 'Certificates': 'दाखले', 'Tally export': 'टॅली निर्यात', 'Support access': 'सहाय्य प्रवेश', 'Modules': 'मॉड्यूल',
  };
  // ---------- Hinglish, built as Story 3.14 (Hindi in Roman script, as typed on phones in Bihar and North India) ----------
  const HG = {
    'Today': 'Aaj', 'Students': 'Students', 'Guardians': 'Abhibhavak', 'Attendance': 'Haaziri', 'Fees': 'Fees', 'Exams': 'Pariksha', 'Results': 'Result',
    'Homework': 'Homework', 'Notices': 'Soochna', 'Staff': 'Staff', 'Settings': 'Settings', 'Approvals': 'Manzoori', 'Reports': 'Report', 'Audit log': 'Audit log',
    'My sections': 'Meri classes', 'Mark attendance': 'Haaziri lagayein', 'Enter marks': 'Marks bharein', 'My attendance & leave': 'Meri haaziri aur chhutti',
    'Collect fee': 'Fees jama karein', 'Day close': 'Din band karein', 'Cheques': 'Cheque', 'Online payments': 'Online payment', 'Home': 'Home', 'Receipts': 'Raseed',
    'Remarks': 'Tippani', 'PTM': 'Parent-Teacher meeting', 'Import students': 'Students import karein', 'Messaging': 'Sandesh', 'Academic setup': 'Class aur vishay',
    'Calendar': 'Calendar', 'Website': 'Website', 'Admissions': 'Admission', 'Data rights': 'Data adhikaar', 'Department': 'Vibhag', 'Tasks': 'Kaam',
    'Leave approvals': 'Chhutti manzoori', 'Marks review': 'Marks jaanch', 'Schools': 'Schools', 'Go-live gates': 'Go-live gate', 'Overview': 'Saar',
    'Present': 'Haazir', 'Absent': 'Gair-haazir', 'Late': 'Der se', 'Submit attendance': 'Haaziri bhejein', 'Switch role': 'Role badlein',
    'Good morning': 'Suprabhat', 'Pay now': 'Abhi bharein', 'Report card': 'Report card', 'My account': 'Mera account', 'Reset demo': 'Demo reset karein',
    'Government reports': 'Sarkari report', 'Certificates': 'Praman patra', 'Tally export': 'Tally export', 'Support access': 'Support access', 'Modules': 'Modules',
  };
  const baseT = D.t;
  D.t = (s) => (D.prefs.lang === 'mr' ? MR[s] || s : D.prefs.lang === 'hinglish' ? HG[s] || s : baseT(s));

  // ---------- wire roadmap pages into roles ----------
  D.roles.admin.nav.push({ id: 'gov', label: 'Government reports', icon: '🏛️', group: 'Roadmap · after pilot' }, { id: 'certs', label: 'Certificates', icon: '📜' });
  Object.assign(D.roles.admin.pages, { gov, certs });
  D.roles.accountant.nav.push({ id: 'tally', label: 'Tally export', icon: '📒', group: 'Roadmap · after pilot' });
  D.roles.accountant.pages.tally = tally;
})();
