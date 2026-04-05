/* ================================================================
   script.js — DepEd Form 138-E Report Card System
   All events attached via addEventListener — no inline onclick.
   Fully works on desktop and mobile.
================================================================ */

// ── Constants ──────────────────────────────────────────────────
const AREAS = [
  { id:1,  code:'FIL',   name:'Filipino',                                     parent:null },
  { id:2,  code:'ENG',   name:'English',                                      parent:null },
  { id:3,  code:'MATH',  name:'Mathematics',                                  parent:null },
  { id:4,  code:'SCI',   name:'Science',                                      parent:null },
  { id:5,  code:'AP',    name:'Araling Panlipunan (AP)',                      parent:null },
  { id:6,  code:'ESP',   name:'Edukasyon sa Pagpapakatao (EsP)',              parent:null },
  { id:7,  code:'EPP',   name:'Edukasyong Pantahanan at Pangkabuhayan (EPP)', parent:null },
  { id:8,  code:'MAPEH', name:'MAPEH',                                        parent:null },
  { id:9,  code:'MUS',   name:'Music',                                        parent:8    },
  { id:10, code:'ARTS',  name:'Arts',                                         parent:8    },
  { id:11, code:'PE',    name:'Physical Education',                           parent:8    },
  { id:12, code:'HLT',   name:'Health',                                       parent:8    },
];

const CORE_VALUES = [
  { id:1, name:'Maka-Diyos', statements:[
      { id:1, text:"Expresses one's spiritual beliefs while respecting the spiritual belief of others." },
      { id:2, text:'Shows adherence to ethical principles by upholding truth.' },
  ]},
  { id:2, name:'Makatao', statements:[
      { id:3, text:'Is sensitive to individual, social, and cultural differences.' },
      { id:4, text:'Demonstrate contributions toward solidarity.' },
  ]},
  { id:3, name:'Makakalikasan', statements:[
      { id:5, text:'Cares for the environment and utilizes resources wisely, judiciously, and economically.' },
  ]},
  { id:4, name:'Makabansa', statements:[
      { id:6, text:'Demonstrate pride in being a Filipino; exercises the rights and responsibilities of a Filipino citizen.' },
      { id:7, text:'Demonstrates appropriate behavior in carrying out activities in the school, community, and country.' },
  ]},
];

const MONTHS     = ['jun','jul','aug','sep','oct','nov','dec','jan','feb','mar','apr'];
const MONTH_LBLS = ['Jun','Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar','Apr'];
const MAPEH_SUBS = ['MUS','ARTS','PE','HLT'];
const MAPEH_CODE = 'MAPEH';
const PAGE_NAMES = { dashboard:'Dashboard', students:'Students', search:'Search / Print', add:'Add Student' };

let _allStudents = [];

// ── Helpers ────────────────────────────────────────────────────
function $(id) { return document.getElementById(id); }

function computeAgeFromDate(d) {
  if (!d) return '';
  const b = new Date(d), t = new Date();
  let age = t.getFullYear() - b.getFullYear();
  if (t.getMonth() < b.getMonth() || (t.getMonth()===b.getMonth() && t.getDate()<b.getDate())) age--;
  return age;
}
function fullName(s) {
  return s.full_name || `${s.last_name||''}, ${s.first_name||''}${s.mi?' '+s.mi+'.':''}`;
}
function toast(msg, type='success') {
  const t = $('toast');
  t.textContent = msg; t.className = 'toast show '+type;
  setTimeout(() => t.className = 'toast', 3200);
}

// ═══════════════════════════════════════════════════════════════
// SIDEBAR
// ═══════════════════════════════════════════════════════════════
function openSidebar() {
  $('sidebar').classList.add('open');
  $('sidebar-overlay').classList.add('show');
  document.body.style.overflow = 'hidden';
}
function closeSidebar() {
  $('sidebar').classList.remove('open');
  $('sidebar-overlay').classList.remove('show');
  document.body.style.overflow = '';
}

// ═══════════════════════════════════════════════════════════════
// PAGE NAVIGATION
// ═══════════════════════════════════════════════════════════════
function showPage(name) {
  // Show/hide pages
  ['dashboard','students','add','search'].forEach(p => {
    const el = $('page-'+p);
    if (el) el.style.display = p === name ? 'block' : 'none';
  });

  // Sidebar nav
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  const navBtn = $('nav-'+name);
  if (navBtn) navBtn.classList.add('active');

  // Bottom nav
  document.querySelectorAll('.bottom-nav-item').forEach(el => el.classList.remove('active'));
  const bnavBtn = $('bnav-'+name);
  if (bnavBtn) bnavBtn.classList.add('active');

  // Mobile topbar page name
  const mpn = $('mobile-page-name');
  if (mpn) mpn.textContent = PAGE_NAMES[name] || '';

  // Close sidebar on mobile
  closeSidebar();

  // Scroll to top
  window.scrollTo(0, 0);

  // Load data
  if (name === 'dashboard') loadDashboard();
  if (name === 'students')  loadStudentTable();
  if (name === 'add')       { renderGradesEditor(); renderOVEditor(); renderAttEditor(); }
  if (name === 'search')    setTimeout(() => $('lrn-input') && $('lrn-input').focus(), 150);
}

// ── Sub-tabs ───────────────────────────────────────────────────
function showSubTab(name) {
  ['grades','ov','att'].forEach(t => {
    const panel = $('panel-'+t);
    const btn   = $('subtab-'+t);
    if (panel) panel.style.display = t === name ? 'block' : 'none';
    if (btn)   btn.classList.toggle('active', t === name);
  });
}

// ═══════════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════════
function loadDashboard() {
  fetch(API.listStudents)
    .then(r => { if (!r.ok) throw new Error('HTTP '+r.status); return r.json(); })
    .then(data => {
      const students = Array.isArray(data.students) ? data.students : [];
      _allStudents = students;

      const total   = students.length;
      const males   = students.filter(s => s.sex === 'Male').length;
      const females = students.filter(s => s.sex === 'Female').length;
      const avgs    = students.map(s => parseFloat(s.general_average)).filter(v => !isNaN(v) && isFinite(v));
      const avg     = avgs.length ? (avgs.reduce((a,b)=>a+b,0)/avgs.length).toFixed(2) : '0.00';
      const passing = students.filter(s => parseFloat(s.general_average) >= 75).length;
      const sections= new Set(students.map(s => `${s.grade}-${s.section}`));
      const sySets  = new Set(students.map(s => s.sy).filter(Boolean));

      if ($('stat-total'))    $('stat-total').textContent    = total;
      if ($('stat-gender'))   $('stat-gender').textContent   = `${males} Male • ${females} Female`;
      if ($('stat-avg'))      $('stat-avg').textContent      = avg;
      if ($('stat-passing'))  $('stat-passing').textContent  = passing;
      if ($('stat-sections')) $('stat-sections').textContent = sections.size;
      if ($('stat-sections-sub')) $('stat-sections-sub').textContent =
        `Across ${sySets.size} School Year${sySets.size !== 1 ? 's' : ''}`;

      // Grade breakdown
      const gradeMap = {};
      students.forEach(s => {
        const g = String(s.grade || '?');
        if (!gradeMap[g]) gradeMap[g] = { count:0, total:0, passing:0 };
        const a = parseFloat(s.general_average) || 0;
        gradeMap[g].count++;
        gradeMap[g].total += a;
        if (a >= 75) gradeMap[g].passing++;
      });
      const tb = $('breakdown-tbody');
      const gs = Object.keys(gradeMap).sort();
      if (tb) {
        tb.innerHTML = gs.length
          ? gs.map(g => {
              const d = gradeMap[g];
              return `<tr>
                <td>Grade ${g}</td><td>${d.count}</td>
                <td>${(d.total/d.count).toFixed(2)}</td>
                <td>${Math.round((d.passing/d.count)*100)}%</td>
              </tr>`;
            }).join('')
          : '<tr><td colspan="4" style="text-align:center;color:var(--muted);padding:24px">No data yet.</td></tr>';
      }

      // Recently added
      const recent = [...students]
        .sort((a,b) => (parseInt(b.student_id)||0) - (parseInt(a.student_id)||0))
        .slice(0, 5);
      const rl = $('recent-list');
      if (rl) {
        rl.innerHTML = recent.length
          ? recent.map(s => {
              const fn  = String(s.first_name || '?');
              const ln  = String(s.last_name  || '?');
              const ini = (fn[0]+ln[0]).toUpperCase();
              const nm  = s.full_name || `${ln}, ${fn}`;
              const a   = parseFloat(s.general_average) || 0;
              return `<div class="recent-item">
                <div class="student-avatar">${ini}</div>
                <div class="recent-info">
                  <div class="recent-name">${nm}</div>
                  <div class="recent-sub">Grade ${s.grade||'?'} - ${s.section||'?'}</div>
                </div>
                <div class="recent-avg" style="color:${a>=75?'var(--success)':'var(--danger)'}">
                  ${s.general_average||'0'}
                </div>
              </div>`;
            }).join('')
          : '<div style="text-align:center;color:var(--muted);font-size:13px;padding:20px">No students yet.</div>';
      }
    })
    .catch(err => {
      console.error('Dashboard error:', err);
      if ($('stat-total')) $('stat-total').textContent = '—';
      if ($('stat-gender')) $('stat-gender').textContent = 'Could not load';
      if ($('breakdown-tbody')) $('breakdown-tbody').innerHTML =
        '<tr><td colspan="4" style="text-align:center;color:var(--danger);padding:20px">Cannot connect to server.</td></tr>';
      if ($('recent-list')) $('recent-list').innerHTML =
        '<div style="text-align:center;color:var(--danger);font-size:13px;padding:20px">Cannot connect to server.</div>';
    });
}

// ═══════════════════════════════════════════════════════════════
// STUDENT TABLE
// ═══════════════════════════════════════════════════════════════
function loadStudentTable() {
  const tbody = $('students-tbody');
  if (tbody) tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--muted);padding:32px">Loading students...</td></tr>';

  fetch(API.listStudents)
    .then(r => { if (!r.ok) throw new Error('HTTP '+r.status); return r.json(); })
    .then(data => {
      _allStudents = Array.isArray(data.students) ? data.students : [];
      renderStudentTable(_allStudents);
    })
    .catch(err => {
      console.error('Students error:', err);
      if (tbody) tbody.innerHTML =
        '<tr><td colspan="6" style="text-align:center;color:var(--danger);padding:32px">Could not connect to server. Make sure Django is running.</td></tr>';
    });
}

function renderStudentTable(students) {
  const tbody = $('students-tbody');
  if (!tbody) return;
  if (!students || !students.length) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--muted);padding:32px">No students found.</td></tr>';
    return;
  }
  tbody.innerHTML = students.map(s => {
    const fn  = String(s.first_name || '?');
    const ln  = String(s.last_name  || '?');
    const ini = (fn[0]+ln[0]).toUpperCase();
    const nm  = s.full_name || `${ln}, ${fn}`;
    const a   = parseFloat(s.general_average) || 0;
    const lrn = s.lrn;
    const safeName = nm.replace(/'/g, "\\'");
    return `<tr>
      <td style="font-family:monospace;font-size:13px">${lrn}</td>
      <td>
        <div style="display:flex;align-items:center;gap:10px">
          <div class="student-avatar">${ini}</div>
          <span style="font-weight:500">${nm}</span>
        </div>
      </td>
      <td>${s.sex||''}</td>
      <td>Grade ${s.grade||'?'} - ${s.section||'?'}</td>
      <td><span class="grade-avg ${a>=75?'pass':'fail'}">${s.general_average||'0'}</span></td>
      <td>
        <div style="display:flex;align-items:center;gap:6px;justify-content:flex-end;flex-wrap:wrap">
          <button class="btn-form138" data-lrn="${lrn}" data-action="view">
            <svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            Form 138
          </button>
          <button class="btn-icon" data-lrn="${lrn}" data-action="delete" data-name="${safeName}" title="Delete">
            <svg style="width:14px;height:14px;stroke:currentColor;fill:none;stroke-width:2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
          </button>
        </div>
      </td>
    </tr>`;
  }).join('');

  // Attach events to dynamically created buttons
  tbody.querySelectorAll('[data-action="view"]').forEach(btn => {
    btn.addEventListener('click', () => viewCard(btn.dataset.lrn));
  });
  tbody.querySelectorAll('[data-action="delete"]').forEach(btn => {
    btn.addEventListener('click', () => deleteStudent(btn.dataset.lrn, btn.dataset.name));
  });
}

function filterStudents() {
  const q     = ($('student-search').value || '').toLowerCase();
  const grade = $('grade-filter').value || '';
  const f = _allStudents.filter(s => {
    const nm = fullName(s).toLowerCase();
    return (!q || nm.includes(q) || s.lrn.includes(q)) &&
           (!grade || String(s.grade) === grade);
  });
  renderStudentTable(f);
}

function viewCard(lrn) {
  showPage('search');
  $('lrn-input').value = lrn;
  searchStudent();
}

function deleteStudent(lrn, name) {
  if (!confirm(`Delete student ${name} (LRN: ${lrn})?\nThis cannot be undone.`)) return;
  fetch(API.deleteStudent + lrn + '/', {
    method: 'POST',
    headers: { 'X-CSRFToken': CSRF_TOKEN, 'Content-Type': 'application/json' },
  }).then(r=>r.json()).then(data => {
    if (data.success) { toast(`${name} deleted.`, 'error'); loadStudentTable(); }
    else toast(data.error || 'Delete failed.', 'error');
  }).catch(() => toast('Could not connect.', 'error'));
}

// ═══════════════════════════════════════════════════════════════
// SEARCH & PRINT
// ═══════════════════════════════════════════════════════════════
function searchStudent() {
  const lrn = ($('lrn-input').value || '').trim();
  const err = $('search-error');
  err.textContent = ''; err.style.color = '';
  if (!lrn) { err.textContent = 'Please enter an LRN.'; return; }
  err.textContent = 'Loading...'; err.style.color = 'var(--muted)';
  fetch(API.getStudent + lrn + '/')
    .then(r => r.json())
    .then(data => {
      err.textContent = ''; err.style.color = '';
      if (data.error) { err.textContent = data.error; err.style.color = 'var(--danger)'; return; }
      renderDetail(data);
    })
    .catch(() => { err.textContent = 'Could not connect to server.'; err.style.color = 'var(--danger)'; });
}

function renderDetail(s) {
  const panel = $('student-detail-card');
  const av    = (String(s.first_name||'?')[0] + String(s.last_name||'?')[0]).toUpperCase();
  const ga    = s.general_average;

  let gradesHtml = `<div class="grades-display"><div class="tbl-wrap"><table>
    <thead><tr>
      <th style="text-align:left">Learning Area</th>
      <th>Q1</th><th>Q2</th><th>Q3</th><th>Q4</th><th>Final</th><th>Remarks</th>
    </tr></thead><tbody>`;
  s.grades.forEach(g => {
    gradesHtml += `<tr>
      <td class="subj" style="${!g.is_main?'padding-left:20px;color:var(--muted);font-size:12px':''}">
        ${g.area_name}</td>
      <td>${g.q1}</td><td>${g.q2}</td><td>${g.q3}</td><td>${g.q4}</td>
      <td class="final">${g.is_main?g.final_grade:''}</td>
      <td>${g.is_main?`<span class="pill ${g.final_grade>=75?'pill-pass':'pill-fail'}">${g.remarks}</span>`:''}</td>
    </tr>`;
  });
  gradesHtml += `</tbody></table></div>
    <div class="gen-avg-row">
      <span>General Average</span>
      <span>${ga} &nbsp;<span class="pill ${parseFloat(ga)>=75?'pill-pass':'pill-fail'}">${s.overall_remarks}</span></span>
    </div></div>`;

  let valHtml = `<div class="tbl-wrap"><table class="data" style="font-size:13px;min-width:380px">
    <thead><tr><th>Core Value</th><th>Behavior Statement</th><th>Q1</th><th>Q2</th><th>Q3</th><th>Q4</th></tr></thead><tbody>`;
  let lastCV = '';
  s.values.forEach(v => {
    const show = v.cv_name !== lastCV; lastCV = v.cv_name;
    valHtml += `<tr>
      <td>${show?`<strong>${v.cv_name}</strong>`:''}</td>
      <td style="font-size:12px;color:var(--muted)">${v.statement}</td>
      <td>${v.q1||'—'}</td><td>${v.q2||'—'}</td><td>${v.q3||'—'}</td><td>${v.q4||'—'}</td>
    </tr>`;
  });
  valHtml += `</tbody></table></div>`;

  panel.innerHTML = `
    <div class="detail-header">
      <div class="avatar">${av}</div>
      <div class="detail-meta">
        <h2>${fullName(s)}</h2>
        <p>LRN: ${s.lrn} &nbsp;|&nbsp; ${s.school}</p>
      </div>
    </div>
    <div class="info-chips">
      <span class="chip">Grade ${s.grade}</span>
      <span class="chip">Section ${s.section}</span>
      <span class="chip">${s.sy}</span>
      <span class="chip">${s.sex}</span>
      <span class="chip">Age: ${s.age}</span>
      <span class="chip">Birth: ${s.birth_date}</span>
      <span class="chip">Adviser: ${s.adviser}</span>
    </div>
    <div class="card-title">Academic Performance</div>
    ${gradesHtml}
    <div class="card-title" style="margin-top:16px">Observed Values</div>
    ${valHtml}`;

  $('result-panel').style.display = 'block';
  buildPrintCard(s, ga);
  $('result-panel').scrollIntoView({ behavior: 'smooth' });
}

// ═══════════════════════════════════════════════════════════════
// PRINT CARD
// ═══════════════════════════════════════════════════════════════
function buildPrintCard(s, ga) {
  let gr = '';
  s.grades.forEach(g => {
    gr += `<tr>
      <td style="border:.5px solid #999;padding:1.5px 3px;text-align:left;font-size:7.5px;${!g.is_main?'padding-left:10px;font-style:italic':'font-weight:bold'}">${g.area_name}</td>
      <td style="border:.5px solid #999;padding:1.5px 3px;text-align:center;font-size:8px">${g.q1}</td>
      <td style="border:.5px solid #999;padding:1.5px 3px;text-align:center;font-size:8px">${g.q2}</td>
      <td style="border:.5px solid #999;padding:1.5px 3px;text-align:center;font-size:8px">${g.q3}</td>
      <td style="border:.5px solid #999;padding:1.5px 3px;text-align:center;font-size:8px">${g.q4}</td>
      <td style="border:.5px solid #999;padding:1.5px 3px;text-align:center;font-size:8px;font-weight:bold">${g.is_main?g.final_grade:''}</td>
      <td style="border:.5px solid #999;padding:1.5px 3px;text-align:center;font-size:8px;${g.is_main&&g.final_grade>=75?'color:#166534;font-weight:bold':'color:#c0392b;font-weight:bold'}">${g.is_main?g.remarks:''}</td>
    </tr>`;
  });

  let vr = ''; let lCV = '';
  s.values.forEach(v => {
    const show = v.cv_name !== lCV; lCV = v.cv_name;
    vr += `<tr>
      <td style="border:.5px solid #999;padding:1.5px 3px;font-size:7px;font-weight:bold;white-space:nowrap;vertical-align:top">${show?v.cv_name:''}</td>
      <td style="border:.5px solid #999;padding:1.5px 3px;font-size:6.5px;text-align:left">${v.statement}</td>
      <td style="border:.5px solid #999;padding:1.5px 3px;text-align:center;font-size:7.5px">${v.q1||'—'}</td>
      <td style="border:.5px solid #999;padding:1.5px 3px;text-align:center;font-size:7.5px">${v.q2||'—'}</td>
      <td style="border:.5px solid #999;padding:1.5px 3px;text-align:center;font-size:7.5px">${v.q3||'—'}</td>
      <td style="border:.5px solid #999;padding:1.5px 3px;text-align:center;font-size:7.5px">${v.q4||'—'}</td>
    </tr>`;
  });

  const att = s.attendance;
  const ths = att.monthly.map(m=>`<th style="border:.5px solid #999;background:#eee;padding:1.5px 2px;text-align:center;font-size:6.5px">${m.month}</th>`).join('');
  const scs = att.monthly.map(m=>`<td style="border:.5px solid #999;padding:1.5px 2px;text-align:center;font-size:7px">${m.school||0}</td>`).join('');
  const prs = att.monthly.map(m=>`<td style="border:.5px solid #999;padding:1.5px 2px;text-align:center;font-size:7px">${m.present||0}</td>`).join('');
  const abs = att.monthly.map(m=>`<td style="border:.5px solid #999;padding:1.5px 2px;text-align:center;font-size:7px">${Math.max(0,(m.school||0)-(m.present||0))}</td>`).join('');
  const TL=`style="border:.5px solid #999;background:#eee;font-weight:bold;padding:1.5px 3px;font-size:7px;white-space:nowrap"`;
  const TT=`style="border:.5px solid #999;font-weight:bold;text-align:center;font-size:7px"`;

  $('print-area').innerHTML = `
<style>
@page{size:A4 landscape;margin:6mm}
.rcw{font-family:Arial,sans-serif;font-size:8px;color:#000}
.rcp{width:100%;background:#fff;margin-bottom:6mm}
.rct{font-weight:bold;font-size:9px;text-align:center;border:.5px solid #999;background:#eee;padding:2px 0;margin-bottom:3px}
.rcg{display:grid;grid-template-columns:1fr 1fr;gap:3mm}
.rcl{border-right:.5px solid #999;padding-right:3mm}
.rctbl{width:100%;border-collapse:collapse}
.rctbl th{border:.5px solid #999;background:#eee;padding:1.5px 3px;text-align:center;font-size:7.5px;font-weight:bold}
.rctbl td{border:.5px solid #999;padding:1.5px 3px;font-size:8px}
.mkg{display:grid;grid-template-columns:1fr 1fr;gap:1px;margin-top:2px;font-size:7px}
.srow{display:flex;align-items:flex-end;gap:4px;margin-top:10px;font-size:7.5px}
.sln{flex:1;border-bottom:.5px solid #333}
.ctbl{width:100%;border-collapse:collapse;font-size:8px}
.ctbl td{border:none;padding:1.5px 2px}
.ctbl .val{border-bottom:.5px solid #333;font-weight:bold}
.sblk{display:flex;justify-content:space-between;font-size:7.5px;margin:8px 0}
.snm{font-weight:bold;border-top:.5px solid #333;padding-top:2px;text-align:center}
.tbox{border:.5px solid #999;padding:4px;font-size:7px;margin-top:5px}
.xl{border-bottom:.5px solid #333;margin:3px 0;min-height:9px}
.ps{color:#166534;font-weight:bold} .fl{color:#c0392b;font-weight:bold}
</style>
<div class="rcw">
<div class="rcp"><div class="rcg">
<div class="rcl">
  <div class="rct">REPORT ON LEARNING PROGRESS AND ACHIEVEMENT</div>
  <table class="rctbl">
    <thead>
      <tr><th rowspan="2" style="text-align:left;min-width:95px">Learning Areas</th><th colspan="4">QUARTER</th><th rowspan="2">Final<br>Grade</th><th rowspan="2">Remarks</th></tr>
      <tr><th>1</th><th>2</th><th>3</th><th>4</th></tr>
    </thead>
    <tbody>${gr}
      <tr><td colspan="7" style="border:.5px solid #999;padding:2px 3px;font-weight:bold;text-align:right;font-size:8px">
        GENERAL AVERAGE &nbsp;&nbsp;<span style="font-size:10px">${ga}</span>&nbsp;&nbsp;
        <span class="${parseFloat(ga)>=75?'ps':'fl'}">${s.overall_remarks}</span>
      </td></tr>
    </tbody>
  </table>
  <table style="width:100%;border-collapse:collapse;margin-top:5px;font-size:7px">
    <thead><tr><th style="border:.5px solid #999;background:#eee;padding:1.5px 3px;text-align:left">DESCRIPTORS</th><th style="border:.5px solid #999;background:#eee;padding:1.5px 3px">Grading Scale</th><th style="border:.5px solid #999;background:#eee;padding:1.5px 3px">Remarks</th></tr></thead>
    <tbody>
      <tr><td style="border:.5px solid #999;padding:1.5px 3px">Outstanding</td><td style="border:.5px solid #999;padding:1.5px 3px;text-align:center">90-100</td><td style="border:.5px solid #999;padding:1.5px 3px;text-align:center" class="ps">Passed</td></tr>
      <tr><td style="border:.5px solid #999;padding:1.5px 3px">Very Satisfactory</td><td style="border:.5px solid #999;padding:1.5px 3px;text-align:center">85-89</td><td style="border:.5px solid #999;padding:1.5px 3px;text-align:center" class="ps">Passed</td></tr>
      <tr><td style="border:.5px solid #999;padding:1.5px 3px">Satisfactory</td><td style="border:.5px solid #999;padding:1.5px 3px;text-align:center">80-84</td><td style="border:.5px solid #999;padding:1.5px 3px;text-align:center" class="ps">Passed</td></tr>
      <tr><td style="border:.5px solid #999;padding:1.5px 3px">Fairly Satisfactory</td><td style="border:.5px solid #999;padding:1.5px 3px;text-align:center">75-79</td><td style="border:.5px solid #999;padding:1.5px 3px;text-align:center" class="ps">Passed</td></tr>
      <tr><td style="border:.5px solid #999;padding:1.5px 3px">Did Not Meet Expectations</td><td style="border:.5px solid #999;padding:1.5px 3px;text-align:center">Below 75</td><td style="border:.5px solid #999;padding:1.5px 3px;text-align:center" class="fl">Failed</td></tr>
    </tbody>
  </table>
</div>
<div>
  <div class="rct">REPORT ON LEARNER'S OBSERVED VALUES</div>
  <table class="rctbl">
    <thead><tr><th rowspan="2">Core Values</th><th rowspan="2" style="text-align:left;min-width:80px">Behavior Statements</th><th colspan="4">QUARTER</th></tr><tr><th>1</th><th>2</th><th>3</th><th>4</th></tr></thead>
    <tbody>${vr}</tbody>
  </table>
  <div style="margin-top:5px;font-size:7.5px;font-weight:bold">MARKING — NON-NUMERICAL RATING</div>
  <div class="mkg"><div><strong>AO</strong> Always Observed</div><div><strong>SO</strong> Sometimes Observed</div><div><strong>RO</strong> Rarely Observed</div><div><strong>NO</strong> Not Observed</div></div>
</div>
</div></div>
<div class="rcp" style="page-break-before:always"><div class="rcg">
<div class="rcl">
  <div class="rct">ATTENDANCE RECORD</div>
  <table style="width:100%;border-collapse:collapse;margin-bottom:4px">
    <tr><td ${TL}>MONTHS</td>${ths}<th style="border:.5px solid #999;background:#eee;padding:1.5px 3px;text-align:center;font-size:7px">Total</th></tr>
    <tr><td ${TL}>No. of School Days</td>${scs}<td ${TT}>${att.total_school_days}</td></tr>
    <tr><td ${TL}>No. of Days Present</td>${prs}<td ${TT}>${att.total_present}</td></tr>
    <tr><td ${TL}>No. of Days Absent</td>${abs}<td ${TT}>${att.total_absent}</td></tr>
  </table>
  <div style="font-weight:bold;text-align:center;font-size:8px;margin-top:8px">PARENT'S/GUARDIAN'S SIGNATURE</div>
  ${['First Quarter','Second Quarter','Third Quarter','Fourth Quarter'].map(q=>`<div class="srow"><span style="width:85px">${q}</span><span class="sln"></span></div>`).join('')}
</div>
<div>
  <div style="text-align:center;margin-bottom:5px">
    <div style="font-size:7px">Republic of the Philippines</div>
    <div style="font-size:7px">Department of Education — Region V</div>
    <div style="font-size:7px">Division of Sorsogon — Bulan North District</div>
    <div style="font-weight:bold;font-size:9px;margin-top:2px">${s.school}</div>
    <div style="font-size:6.5px">DepEd Form 138-E</div>
  </div>
  <table class="ctbl">
    <tr><td style="width:40px">Name:</td><td class="val" colspan="3">${fullName(s)}</td></tr>
    <tr><td>Age:</td><td class="val" style="width:30px">${s.age}</td><td style="width:25px">Sex:</td><td class="val">${s.sex}</td></tr>
    <tr><td>Grade:</td><td class="val">${s.grade}</td><td>Section:</td><td class="val">${s.section}</td></tr>
    <tr><td style="white-space:nowrap">School Year:</td><td class="val" colspan="3">${s.sy}</td></tr>
    <tr><td>LRN:</td><td class="val" colspan="3">${s.lrn}</td></tr>
  </table>
  <p style="font-size:7px;margin:5px 0;line-height:1.5;text-indent:10px">This report card shows the ability and progress your child has made in the different learning areas as well as his/her core values.</p>
  <div class="sblk">
    <div><div style="margin-bottom:16px">&nbsp;</div><div class="snm">${s.principal}</div><div style="text-align:center;font-size:7px">${s.principal_pos}</div></div>
    <div><div style="margin-bottom:16px">&nbsp;</div><div class="snm">${s.adviser}</div><div style="text-align:center;font-size:7px">Adviser</div></div>
  </div>
  <div class="tbox">
    <div style="font-weight:bold;text-align:center;margin-bottom:3px">Certificate of Transfer</div>
    <div>Admitted to Grade __________ Section __________</div>
    <div class="xl"></div>
    <div>Eligible for Admission in Grade ______________</div>
    <div class="xl"></div>
    <div style="font-weight:bold;text-align:center;margin-top:4px">CANCELLATION OF ELIGIBILITY TO TRANSFER</div>
    <div style="margin-top:3px">Admitted in ______________ Date ______________</div>
    <div class="xl"></div>
  </div>
</div>
</div></div>
</div>`;
}

// ═══════════════════════════════════════════════════════════════
// ADD STUDENT EDITORS
// ═══════════════════════════════════════════════════════════════
function renderGradesEditor() {
  const el = $('grades-editor');
  if (!el) return;
  let html = `<table class="grades-tbl">
    <thead><tr><th style="min-width:160px">Learning Areas</th><th>Q1</th><th>Q2</th><th>Q3</th><th>Q4</th><th>Final</th><th>Remarks</th></tr></thead><tbody>`;
  AREAS.forEach(a => {
    const isSub   = a.parent !== null;
    const isMapeh = a.code === MAPEH_CODE;
    const cls     = isSub ? 'sub-row' : '';
    if (isMapeh) {
      html += `<tr class="${cls}">
        <td>${a.name} <span style="font-size:11px;color:var(--muted)">(auto)</span></td>
        ${[1,2,3,4].map(q=>`<td><input type="number" id="g_MAPEH_${q}" readonly/></td>`).join('')}
        <td class="final-val" id="f_MAPEH">—</td><td id="r_MAPEH">—</td>
      </tr>`;
    } else {
      html += `<tr class="${cls}">
        <td>${a.name}</td>
        ${[1,2,3,4].map(q=>`<td><input type="number" id="g_${a.code}_${q}" min="0" max="100" data-code="${a.code}"/></td>`).join('')}
        <td class="final-val" id="f_${a.code}">—</td><td id="r_${a.code}">—</td>
      </tr>`;
    }
  });
  html += `</tbody></table>`;
  el.innerHTML = html;

  // Attach grade input events
  el.querySelectorAll('input[data-code]').forEach(inp => {
    inp.addEventListener('input', () => updateFinal(inp.dataset.code));
  });
}

function renderOVEditor() {
  const el = $('values-editor');
  if (!el) return;
  let html = `<table class="ov-tbl">
    <thead><tr><th style="text-align:left;min-width:120px">Core Values</th><th style="text-align:left">Behavior Statements</th><th>Q1</th><th>Q2</th><th>Q3</th><th>Q4</th></tr></thead><tbody>`;
  CORE_VALUES.forEach(cv => {
    cv.statements.forEach((bs, i) => {
      const opts = ['AO','SO','RO','NO'].map(o=>`<option value="${o}">${o}</option>`).join('');
      html += `<tr>
        <td class="cv-name">${i===0?cv.name:''}</td>
        <td>${bs.text}</td>
        ${[1,2,3,4].map(q=>`<td><select class="ov-select" id="v_${bs.id}_${q}">${opts}</select></td>`).join('')}
      </tr>`;
    });
  });
  el.innerHTML = html + `</tbody></table>`;
}

function renderAttEditor() {
  const tbody = $('attendance-editor');
  if (!tbody) return;
  const mkRow = (key, label) =>
    `<tr><td>${label}</td>` +
    MONTHS.map(m =>
      key === 'absent'
        ? `<td><span id="att_${m}_absent" class="absent-cell">0</span></td>`
        : `<td><input type="number" id="att_${m}_${key}" min="0" max="31" data-month="${m}" data-row="${key}"/></td>`
    ).join('') + `</tr>`;
  tbody.innerHTML =
    mkRow('school',  'No. of School Days') +
    mkRow('present', 'No. of Days Present') +
    mkRow('absent',  'No. of Days Absent');

  tbody.querySelectorAll('input[data-month]').forEach(inp => {
    inp.addEventListener('input', () => updateAbsent(inp.dataset.month));
  });
}

function updateAbsent(m) {
  const s = parseInt($(`att_${m}_school`)?.value)  || 0;
  const p = parseInt($(`att_${m}_present`)?.value) || 0;
  const el = $(`att_${m}_absent`);
  if (el) el.textContent = Math.max(0, s-p);
}

function updateFinal(code) {
  const vals = [1,2,3,4].map(q => parseFloat($(`g_${code}_${q}`)?.value)||0);
  const f    = (vals.reduce((a,b)=>a+b,0)/4).toFixed(2);
  const fc = $('f_'+code), rc = $('r_'+code);
  if (fc) fc.textContent = f;
  if (rc) { rc.textContent = parseFloat(f)>=75?'Passed':'Failed'; rc.className = parseFloat(f)>=75?'pass-txt':'fail-txt'; }

  if (MAPEH_SUBS.includes(code)) {
    const mq = [1,2,3,4].map(qi =>
      Math.round(MAPEH_SUBS.reduce((s,c)=>s+(parseFloat($(`g_${c}_${qi}`)?.value)||0),0)/4)
    );
    [1,2,3,4].forEach((q,i) => { const el=$(`g_MAPEH_${q}`); if(el) el.value=mq[i]||''; });
    const mf = (mq.reduce((a,b)=>a+b,0)/4).toFixed(2);
    const mfc=$('f_MAPEH'), mrc=$('r_MAPEH');
    if(mfc) mfc.textContent=mf;
    if(mrc){ mrc.textContent=parseFloat(mf)>=75?'Passed':'Failed'; mrc.className=parseFloat(mf)>=75?'pass-txt':'fail-txt'; }
  }
}

function resetAddForm() {
  ['new-lrn','new-lastname','new-firstname','new-mi','new-section','new-sy'].forEach(id => {
    const el=$(id); if(el) el.value='';
  });
  const bd=$('new-birthdate'); if(bd) bd.value='';
  const ad=$('new-age-display'); if(ad) ad.value='';
  if($('add-error')) $('add-error').textContent='';
  renderGradesEditor(); renderOVEditor(); renderAttEditor();
  showSubTab('grades');
}

function addStudent() {
  const err = $('add-error');
  const lrn       = ($('new-lrn')?.value||'').trim();
  const last      = ($('new-lastname')?.value||'').trim();
  const first     = ($('new-firstname')?.value||'').trim();
  const birthDate = ($('new-birthdate')?.value||'').trim();

  if (!lrn || lrn.length!==12) { err.textContent='LRN must be exactly 12 digits.'; return; }
  if (!last||!first) { err.textContent='Last name and first name are required.'; return; }
  if (!birthDate)    { err.textContent='Birth date is required.'; return; }

  const grades={};
  AREAS.forEach(a => {
    if (a.code===MAPEH_CODE) return;
    grades[a.code]=[1,2,3,4].map(q=>parseFloat($(`g_${a.code}_${q}`)?.value)||0);
  });
  const values={};
  CORE_VALUES.forEach(cv => {
    cv.statements.forEach(bs => {
      values[bs.id]=[1,2,3,4].map(q=>$(`v_${bs.id}_${q}`)?.value||'AO');
    });
  });
  const attendance={};
  MONTHS.forEach(m => {
    attendance[`${m}_school`] =parseInt($(`att_${m}_school`)?.value)||0;
    attendance[`${m}_present`]=parseInt($(`att_${m}_present`)?.value)||0;
  });

  const payload={
    lrn, lastName:last, firstName:first,
    mi:        ($('new-mi')?.value||'').trim(),
    sex:       $('new-sex')?.value||'Male',
    birthDate,
    grade:     parseInt($('new-grade')?.value)||1,
    section:   $('new-section')?.value||'One',
    sy:        $('new-sy')?.value||'2025-2026',
    school:    $('new-school')?.value||'M. A. Roxas Elementary School',
    grades, values, attendance,
  };

  err.textContent='Saving...'; err.style.color='var(--muted)';
  fetch(API.addStudent, {
    method:'POST',
    headers:{'Content-Type':'application/json','X-CSRFToken':CSRF_TOKEN},
    body:JSON.stringify(payload),
  }).then(r=>r.json()).then(data => {
    err.textContent=''; err.style.color='';
    if (data.error) { err.textContent=data.error; err.style.color='var(--danger)'; return; }
    toast(`${first} ${last} saved successfully!`);
    resetAddForm();
    showPage('students');
  }).catch(()=>{ err.textContent='Could not save. Is server running?'; err.style.color='var(--danger)'; });
}

// ═══════════════════════════════════════════════════════════════
// INIT — All events attached here, NEVER inline onclick
// ═══════════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {

  // Sidebar / hamburger
  const btnHam = $('btn-hamburger');
  if (btnHam) {
    btnHam.addEventListener('click', openSidebar);
    btnHam.addEventListener('touchend', (e) => { e.preventDefault(); openSidebar(); });
  }

  const btnClose = $('btn-sidebar-close');
  if (btnClose) btnClose.addEventListener('click', closeSidebar);

  const overlay = $('sidebar-overlay');
  if (overlay) overlay.addEventListener('click', closeSidebar);

  // Sidebar nav items — click + touchend for mobile reliability
  document.querySelectorAll('.nav-item[data-page]').forEach(btn => {
    btn.addEventListener('click', () => showPage(btn.dataset.page));
    btn.addEventListener('touchend', (e) => { e.preventDefault(); showPage(btn.dataset.page); });
  });

  // Bottom nav items — click + touchend for mobile reliability
  document.querySelectorAll('.bottom-nav-item[data-page]').forEach(btn => {
    btn.addEventListener('click', () => showPage(btn.dataset.page));
    btn.addEventListener('touchend', (e) => { e.preventDefault(); showPage(btn.dataset.page); });
  });

  // Sub-tabs
  document.querySelectorAll('.sub-tab[data-panel]').forEach(btn => {
    btn.addEventListener('click', () => showSubTab(btn.dataset.panel));
  });

  // Students page — Add Student button
  const btnGoAdd = $('btn-go-add');
  if (btnGoAdd) btnGoAdd.addEventListener('click', () => showPage('add'));

  // Search
  const btnGen = $('btn-generate');
  if (btnGen) btnGen.addEventListener('click', searchStudent);
  const lrnIn = $('lrn-input');
  if (lrnIn) lrnIn.addEventListener('keydown', e => { if(e.key==='Enter') searchStudent(); });

  // Print / close result
  const btnPrint = $('btn-print');
  if (btnPrint) btnPrint.addEventListener('click', () => window.print());
  const btnClose2 = $('btn-close-result');
  if (btnClose2) btnClose2.addEventListener('click', () => $('result-panel').style.display='none');

  // Add student form buttons
  const btnBack = $('btn-back-students');
  if (btnBack) btnBack.addEventListener('click', () => showPage('students'));
  const btnCancel = $('btn-cancel-add');
  if (btnCancel) btnCancel.addEventListener('click', resetAddForm);
  const btnSave = $('btn-save-student');
  if (btnSave) btnSave.addEventListener('click', addStudent);

  // Search filter
  const sSearch = $('student-search');
  if (sSearch) sSearch.addEventListener('input', filterStudents);
  const gFilter = $('grade-filter');
  if (gFilter) gFilter.addEventListener('change', filterStudents);

  // Birth date → age
  const bdInput = $('new-birthdate');
  const ageDisp = $('new-age-display');
  if (bdInput && ageDisp) {
    bdInput.addEventListener('change', () => {
      const age = computeAgeFromDate(bdInput.value);
      ageDisp.value = age !== '' ? `${age} years old` : '';
    });
  }

  // Start on dashboard
  showPage('dashboard');
  renderGradesEditor();
  renderOVEditor();
  renderAttEditor();
});