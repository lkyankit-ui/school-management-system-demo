/* Synthetic seed data for the demo. Every person, number and school here is fictional. */
(function () {
  const D = (window.DEMO = window.DEMO || {});

  let seed = 20261027;
  const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
  const pick = (a) => a[Math.floor(rnd() * a.length)];

  const FIRST_B = ['Aarav','Vivaan','Aditya','Arjun','Reyansh','Krishna','Ishaan','Shaurya','Atharv','Kabir','Rohan','Pranav','Dhruv','Yash','Om','Sai','Harsh','Tanmay','Rudra','Kunal','Manav','Nikhil','Siddharth','Ved'];
  const FIRST_G = ['Diya','Ananya','Saanvi','Aadhya','Myra','Isha','Kavya','Riya','Anika','Pari','Navya','Sneha','Tanvi','Kiara','Mira','Shruti','Pooja','Neha','Aditi','Gauri','Sara','Ira','Tara','Avni'];
  const LAST = ['Sharma','Patil','Deshmukh','Kulkarni','Joshi','Yadav','Gupta','Verma','Pawar','Shinde','Jadhav','More','Chavan','Rao','Nair','Iyer','Singh','Mehta','Agarwal','Bhosale','Gaikwad','Kale','Mishra','Pandey'];
  const GUARD_F = ['Rajesh','Sunil','Prakash','Mahesh','Sanjay','Anil','Vijay','Ramesh','Santosh','Deepak','Amit','Manoj'];
  const GUARD_M = ['Meena','Sunita','Kavita','Anita','Rekha','Asha','Lata','Savita','Seema','Jyoti','Priya','Swati'];

  D.school = {
    name: 'Sunrise Public School', short: 'Sunrise', city: 'Nashik, Maharashtra', code: 'sunrise',
    board: 'CBSE (Affiliation No. 1130xxx — demo)', founded: 1998, phone: '+91 253 000 0000', email: 'office@sunrise-school.example',
    address: 'Plot 12, Gangapur Road, Nashik 422013', principal: 'Dr. Anjali Deshpande', motto: 'Learn · Lead · Light the way',
    year: '2026–27', today: '2026-10-27', todayLabel: 'Tuesday, 27 October 2026',
  };

  // Real contact details for schools interested in the product (not part of the synthetic data).
  // Leave a value empty to hide that button.
  D.contact = {
    name: 'Ankit',
    email: 'lkyankit98523@gmail.com',
    whatsapp: '+917992341861', // country code + number, e.g. '+919800000000'
    linkedin: 'https://www.linkedin.com/in/kankit17', // full https:// URL of a LinkedIn profile or website
  };

  D.people = {
    principal: { name: 'Dr. Anjali Deshpande', initials: 'AD', role: 'Principal', extra: 'also HOD Languages' },
    admin: { name: 'Sunita Patil', initials: 'SP', role: 'School Admin' },
    accountant: { name: 'Vikram Joshi', initials: 'VJ', role: 'Accountant' },
    teacher: { name: 'Rakesh Yadav', initials: 'RY', role: 'Teacher', extra: 'Class teacher 6-B · Maths 6-B, Science 7-A' },
    hod: { name: 'Mrs. Kavita Kulkarni', initials: 'KK', role: 'HOD Science', extra: 'also Teacher of 9-A Physics' },
    parent: { name: 'Meena Devi', initials: 'MD', role: 'Parent', extra: 'Guardian of Aarav (6-B) and Diya (3-A)' },
    student: { name: 'Aarav Sharma', initials: 'AS', role: 'Student', extra: 'Class 6-B · Roll 1' },
    operator: { name: 'Ankit (Platform Operator)', initials: 'AK', role: 'Operator' },
  };

  // Classes 1–10, sections A/B. Each section gets a seeded roster.
  D.sections = [];
  const teachersPool = ['Rakesh Yadav','Pooja Nair','Sneha Kale','Amit Verma','Neha Joshi','Rahul Pawar','Shruti Rao','Manoj Gupta','Asha Shinde','Deepak More','Priya Iyer','Kunal Mehta','Swati Jadhav','Nikhil Singh','Lata Chavan','Sanjay Mishra','Gauri Bhosale','Vijay Pandey','Kavita Kulkarni','Ramesh Gaikwad'];
  let admNo = 2401, tIdx = 0;
  for (let c = 1; c <= 10; c++) {
    for (const s of ['A', 'B']) {
      const id = `${c}-${s}`;
      const size = 26 + Math.floor(rnd() * 10);
      const students = [];
      for (let r = 1; r <= size; r++) {
        const girl = rnd() > 0.5;
        const first = girl ? pick(FIRST_G) : pick(FIRST_B);
        const last = pick(LAST);
        students.push({
          id: `S${admNo}`, adm: `SPS/${admNo++}`, roll: r, name: `${first} ${last}`, gender: girl ? 'F' : 'M', section: id,
          guardian: `${girl && rnd() > .5 ? pick(GUARD_M) : pick(GUARD_F)} ${last}`, mobile: `+91 98${Math.floor(10000000 + rnd() * 89999999)}`,
          consent: rnd() > 0.08 ? 'verified' : (rnd() > .5 ? 'no-reply' : 'pending'), dob: `20${String(20 - c - Math.floor(rnd() * 2)).padStart(2, '0')}-0${1 + Math.floor(rnd() * 9)}-1${Math.floor(rnd() * 9)}`,
          feeDue: [0, 0, 4500, 4500, 9000, 2250][Math.floor(rnd() * 6)], attendancePct: 82 + Math.floor(rnd() * 18),
        });
      }
      D.sections.push({ id, cls: c, sec: s, classTeacher: id === '6-B' ? 'Rakesh Yadav' : teachersPool[tIdx++ % teachersPool.length], students });
    }
  }
  // Pin the persona children so the story lines up with the PRD journeys.
  const pin = (secId, roll, patch) => Object.assign(D.sections.find((x) => x.id === secId).students[roll - 1], patch);
  pin('6-B', 1, { id: 'S-AARAV', name: 'Aarav Sharma', gender: 'M', guardian: 'Meena Devi', mobile: '+91 98220 11223', consent: 'verified', feeDue: 4500, attendancePct: 94 });
  pin('3-A', 4, { id: 'S-DIYA', name: 'Diya Sharma', gender: 'F', guardian: 'Meena Devi', mobile: '+91 98220 11223', consent: 'verified', feeDue: 0, attendancePct: 97 });

  D.allStudents = () => D.sections.flatMap((s) => s.students);
  D.findStudent = (id) => D.allStudents().find((s) => s.id === id);
  D.section = (id) => D.sections.find((s) => s.id === id);

  D.subjects = ['English', 'Hindi', 'Marathi', 'Mathematics', 'Science', 'Social Science', 'Computer'];
  D.departments = [
    { id: 'sci', name: 'Science', hod: 'Kavita Kulkarni', members: ['Kavita Kulkarni','Rakesh Yadav','Rahul Pawar','Shruti Rao','Nikhil Singh','Priya Iyer','Deepak More','Gauri Bhosale','Sanjay Mishra'], subjects: ['Physics','Chemistry','Biology','Science'] },
    { id: 'math', name: 'Mathematics', hod: 'Manoj Gupta', members: ['Manoj Gupta','Amit Verma','Kunal Mehta'], subjects: ['Mathematics'] },
    { id: 'lang', name: 'Languages', hod: 'Anjali Deshpande', members: ['Pooja Nair','Sneha Kale','Neha Joshi','Swati Jadhav','Lata Chavan'], subjects: ['English','Hindi','Marathi'] },
    { id: 'soc', name: 'Social Science', hod: null, members: ['Asha Shinde','Vijay Pandey','Ramesh Gaikwad'], subjects: ['History','Geography','Civics'] },
  ];

  D.staff = [
    { name: 'Dr. Anjali Deshpande', roles: ['Principal','HOD'], dept: 'Languages', status: 'active', att: 'present', in: '07:41' },
    { name: 'Sunita Patil', roles: ['School Admin'], dept: 'Office', status: 'active', att: 'present', in: '07:55' },
    { name: 'Vikram Joshi', roles: ['Accountant'], dept: 'Office', status: 'active', att: 'present', in: '08:02' },
    { name: 'Kavita Kulkarni', roles: ['HOD','Teacher'], dept: 'Science', status: 'active', att: 'present', in: '07:38' },
    { name: 'Rakesh Yadav', roles: ['Teacher'], dept: 'Science', status: 'active', att: 'present', in: '07:52' },
    { name: 'Pooja Nair', roles: ['Teacher','School Admin'], dept: 'Languages', status: 'active', att: 'present', in: '07:49' },
    { name: 'Rahul Pawar', roles: ['Teacher'], dept: 'Science', status: 'active', att: 'late', in: '08:21' },
    { name: 'Shruti Rao', roles: ['Teacher'], dept: 'Science', status: 'active', att: 'on leave', in: '—' },
    { name: 'Nikhil Singh', roles: ['Teacher'], dept: 'Science', status: 'active', att: 'present', in: '07:58' },
    { name: 'Priya Iyer', roles: ['Teacher'], dept: 'Science', status: 'active', att: 'present', in: '07:45' },
    { name: 'Deepak More', roles: ['Teacher'], dept: 'Science', status: 'active', att: 'present', in: '07:59' },
    { name: 'Gauri Bhosale', roles: ['Teacher'], dept: 'Science', status: 'active', att: 'present', in: '07:50' },
    { name: 'Sanjay Mishra', roles: ['Teacher'], dept: 'Science', status: 'active', att: 'not marked', in: '—' },
    { name: 'Manoj Gupta', roles: ['HOD','Teacher'], dept: 'Mathematics', status: 'active', att: 'present', in: '07:47' },
    { name: 'Amit Verma', roles: ['Teacher'], dept: 'Mathematics', status: 'active', att: 'present', in: '07:56' },
    { name: 'Kunal Mehta', roles: ['Teacher'], dept: 'Mathematics', status: 'active', att: 'half-day', in: '07:50' },
    { name: 'Sneha Kale', roles: ['Teacher'], dept: 'Languages', status: 'active', att: 'present', in: '07:53' },
    { name: 'Neha Joshi', roles: ['Teacher'], dept: 'Languages', status: 'active', att: 'present', in: '07:44' },
    { name: 'Swati Jadhav', roles: ['Teacher'], dept: 'Languages', status: 'active', att: 'on duty', in: '—' },
    { name: 'Asha Shinde', roles: ['Teacher'], dept: 'Social Science', status: 'active', att: 'present', in: '07:57' },
    { name: 'Vijay Pandey', roles: ['Teacher'], dept: 'Social Science', status: 'invited', att: '—', in: '—' },
  ];

  D.feeHeads = [
    { head: 'Tuition fee', amount: 3600 }, { head: 'Computer lab', amount: 450 }, { head: 'Activity fee', amount: 300 }, { head: 'Exam fee', amount: 150 },
  ];
  D.feeStructure = [
    { cls: '1–5', annual: 36000, instalments: 4, due: ['10 Apr', '10 Jul', '10 Nov', '10 Jan'] },
    { cls: '6–8', annual: 42000, instalments: 4, due: ['10 Apr', '10 Jul', '10 Nov', '10 Jan'] },
    { cls: '9–10', annual: 52000, instalments: 4, due: ['10 Apr', '10 Jul', '10 Nov', '10 Jan'] },
  ];

  D.exams = [
    { id: 'T1', name: 'Term 1 Examination', from: '2026-09-21', to: '2026-10-03', status: 'Marks entry', submitted: 11, total: 14 },
    { id: 'UT2', name: 'Unit Test 2', from: '2026-12-07', to: '2026-12-11', status: 'Scheduled', submitted: 0, total: 14 },
  ];
  D.grading = [
    { min: 91, g: 'A1' }, { min: 81, g: 'A2' }, { min: 71, g: 'B1' }, { min: 61, g: 'B2' }, { min: 51, g: 'C1' }, { min: 41, g: 'C2' }, { min: 33, g: 'D' }, { min: 0, g: 'E' },
  ];
  D.grade = (p) => D.grading.find((x) => p >= x.min).g;

  D.childData = {
    'S-AARAV': {
      marks: { English: 84, Hindi: 78, Marathi: 72, Mathematics: 91, Science: 88, 'Social Science': 76, Computer: 95 },
      homework: [
        { subj: 'Mathematics', title: 'Exercise 5.2 — Fractions (Q1–Q12)', due: 'Tomorrow', by: 'Rakesh Yadav', status: 'pending' },
        { subj: 'Science', title: 'Draw and label the parts of a flower', due: 'Tomorrow', by: 'Priya Iyer', status: 'pending' },
        { subj: 'English', title: 'Read chapter 6 and write a summary (150 words)', due: '30 Oct', by: 'Neha Joshi', status: 'pending' },
        { subj: 'Hindi', title: 'कविता याद करें — "पुष्प की अभिलाषा"', due: '24 Oct', by: 'Sneha Kale', status: 'submitted' },
      ],
      remarks: [
        { date: '22 Oct', by: 'Rakesh Yadav (Class teacher)', text: 'Aarav solved the bonus fraction problem in class and explained it to his group. Great leadership!', kind: 'appreciation' },
        { date: '09 Oct', by: 'Priya Iyer (Science)', text: 'Please ensure the science notebook is complete before the Term 1 checking.', kind: 'improvement' },
      ],
      cal: 'PPPPPHPPPPAPHPPPPPPHPPPPPPHP',
    },
    'S-DIYA': {
      marks: { English: 93, Hindi: 89, Marathi: 86, Mathematics: 95, Science: 91, 'Social Science': 88, Computer: 97 },
      homework: [
        { subj: 'English', title: 'Write five sentences about your favourite festival', due: '29 Oct', by: 'Swati Jadhav', status: 'pending' },
        { subj: 'Mathematics', title: 'Tables of 7 and 8 — practice sheet', due: 'Tomorrow', by: 'Amit Verma', status: 'pending' },
      ],
      remarks: [
        { date: '26 Oct', by: 'Asha Shinde (Class teacher)', text: 'Diya recited her poem beautifully at the morning assembly. Very confident!', kind: 'appreciation' },
      ],
      cal: 'PPPPPHPPPPPPHPPPPPPHPPPPPPHP',
    },
  };

  D.notices = [
    { id: 'n1', date: '25 Oct 2026', title: 'Diwali vacation: 2–8 November', body: 'The school will remain closed from 2 to 8 November for Diwali. Classes resume on Monday, 9 November.', important: true },
    { id: 'n2', date: '20 Oct 2026', title: 'Parent–Teacher Meeting on 31 October', body: 'PTM for Classes 1–10 on Saturday, 31 October, 9:00 am – 1:00 pm. Term 1 answer sheets will be shown.', important: false },
    { id: 'n3', date: '14 Oct 2026', title: 'Annual Sports Day registrations open', body: 'Students may register for track and field events with their PE teacher by 5 November.', important: false },
    { id: 'n4', date: '05 Oct 2026', title: 'Admissions open for 2027–28', body: 'Applications for Nursery to Class 9 are open online. See the Admissions page.', important: false },
  ];

  D.operatorSchools = [
    { name: 'Sunrise Public School', code: 'sunrise', env: 'staging', status: 'Demo', students: 610, preset: 'indigo-marigold', modules: 6, msgs: 1240, gates: 7 },
    { name: 'Green Valley Vidyalaya', code: 'gvv', env: 'production', status: 'Verification', students: 438, preset: 'forest-sand', modules: 5, msgs: 312, gates: 9 },
    { name: 'Saraswati English School', code: 'ses', env: 'staging', status: 'Setup', students: 0, preset: 'saffron-hearth', modules: 2, msgs: 0, gates: 2 },
  ];

  D.gates = [
    ['G1', 'S', 'Signed agreement, DPA, retention periods, DPDP applicability matrix'],
    ['G2', 'P', 'Security review passed; isolation suite green on deployed release'],
    ['G3', 'P', 'Self-hosted production host in India with trusted TLS'],
    ['G4', 'P', 'Backups ≤ 24 h old on-server and off-machine; restore drill passed'],
    ['G5', 'P', 'Audit trail, monitoring alerts and external heartbeat monitor active'],
    ['G6', 'P', 'Breach-response runbook; no synthetic seed in production'],
    ['G7', 'S', 'WhatsApp sender verified; templates approved per language'],
    ['G8', 'S', 'Consent verified for ≥ 90% of primary guardians; caps and kill switch'],
    ['G9', 'S', 'Native-speaker review of every Hindi/Marathi template'],
    ['G10', 'S', 'Opening balances reconciled and signed off; outage procedure'],
    ['G11', 'S', 'Report-card golden set signed off for the grading scheme'],
    ['G12', 'S', 'Parent portal readiness: notice, security sign-off, sign-in code template'],
  ];

  D.calendar = [
    { date: '31 Oct', what: 'Parent–Teacher Meeting', kind: 'event' },
    { date: '02–08 Nov', what: 'Diwali vacation', kind: 'holiday' },
    { date: '10 Nov', what: 'Instalment 3 due', kind: 'fee' },
    { date: '14 Nov', what: "Children's Day celebration", kind: 'event' },
    { date: '07–11 Dec', what: 'Unit Test 2', kind: 'exam' },
    { date: '25 Dec', what: 'Christmas (holiday)', kind: 'holiday' },
  ];

  D.audit = [
    ['09:14', 'Rakesh Yadav', 'ATTENDANCE_SUBMITTED', 'Section 6-B · 3 absent'],
    ['09:05', 'System', 'NOTIFICATION_SENT', 'Absence alert · 3 guardians · Hindi template v2'],
    ['08:58', 'Vikram Joshi', 'PAYMENT_POSTED', 'Receipt R/26-27/01187 · ₹4,500 · cash'],
    ['08:41', 'Sunita Patil', 'GUARDIAN_CONTACT_CHANGED', 'Guardian of S2417 · mobile changed (value erasable)'],
    ['08:30', 'Dr. Anjali Deshpande', 'CONCESSION_APPROVED', 'Sibling concession 10% · S2455'],
    ['08:02', 'Vikram Joshi', 'SIGN_IN', 'Office desktop · Chrome'],
    ['07:55', 'Sunita Patil', 'SIGN_IN', 'Office desktop · Edge'],
    ['Yesterday', 'Operator (Ankit)', 'SUPPORT_ACCESS_GRANTED', '30-minute, read-only, reason: import help'],
  ];
})();
