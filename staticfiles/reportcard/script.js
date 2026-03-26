/* ================================================================
   script.js — DepEd Form 138-E Report Card System
   Front card layout matches the original DepEd Form 138-E exactly:
   - Left side: Learning Progress & Achievement table + Descriptors
   - Right side: Observed Values + Marking legend
   Back card:
   - Left side: Full attendance table + Parent signature
   - Right side: School info cover + Transfer certificate
================================================================ */

const AREAS = [
  { id:1,  code:'FIL',   name:'Filipino',                                        parent:null },
  { id:2,  code:'ENG',   name:'English',                                         parent:null },
  { id:3,  code:'MATH',  name:'Mathematics',                                     parent:null },
  { id:4,  code:'SCI',   name:'Science',                                         parent:null },
  { id:5,  code:'AP',    name:'Araling Panlipunan (AP)',                         parent:null },
  { id:6,  code:'ESP',   name:'Edukasyon sa Pagpapakatao (EsP)',                 parent:null },
  { id:7,  code:'EPP',   name:'Edukasyong Pantahanan at Pangkabuhayan (EPP)',    parent:null },
  { id:8,  code:'MAPEH', name:'MAPEH',                                           parent:null },
  { id:9,  code:'MUS',   name:'– Music',                                        parent:8    },
  { id:10, code:'ARTS',  name:'– Arts',                                         parent:8    },
  { id:11, code:'PE',    name:'– Physical Education',                           parent:8    },
  { id:12, code:'HLT',   name:'– Health',                                       parent:8    },
];

const CORE_VALUES = [
  { id:1, name:'1. Maka-Diyos', statements:[
      { id:1, text:'Expresses one\'s spiritual beliefs while respecting the spiritual belief of others.' },
      { id:2, text:'Shows adherence to ethical principles by upholding truth.' }
  ]},
  { id:2, name:'2. Makatao', statements:[
      { id:3, text:'Is sensitive to individual, social, and cultural differences.' },
      { id:4, text:'Demonstrate contributions toward solidarity.' }
  ]},
  { id:3, name:'3. Makakalikasan', statements:[
      { id:5, text:'Cares for the environment and utilizes resources wisely, judiciously, and economically.' }
  ]},
  { id:4, name:'4. Makabansa', statements:[
      { id:6, text:'Demonstrate pride in being a Filipino; exercises the rights and responsibilities of a Filipino citizen.' },
      { id:7, text:'Demonstrates appropriate behavior in carrying out activities in the school, community, and country.' }
  ]},
];

const MONTHS      = ['jun','jul','aug','sep','oct','nov','dec','jan','feb','mar','apr'];
const MONTH_LBLS  = ['Jun','Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar','Apr'];
const MAPEH_SUBS  = ['MUS','ARTS','PE','HLT'];
const MAPEH_CODE  = 'MAPEH';

// ── Helpers ────────────────────────────────────────────────────
function computeAgeFromDate(dateStr) {
  if (!dateStr) return '';
  const b = new Date(dateStr), t = new Date();
  let age = t.getFullYear() - b.getFullYear();
  if (t.getMonth() < b.getMonth() || (t.getMonth()===b.getMonth() && t.getDate()<b.getDate())) age--;
  return age;
}
function fullNameFromData(s) {
  return s.full_name || `${s.last_name}, ${s.first_name}${s.mi?' '+s.mi+'.':''}`;
}
function toast(msg, type='success') {
  const t = document.getElementById('toast');
  t.textContent = msg; t.className = 'toast show '+type;
  setTimeout(()=>{ t.className='toast'; }, 3000);
}

// ── Tab switching ──────────────────────────────────────────────
function showTab(name) {
  ['search','students','add-student'].forEach(t=>{
    document.getElementById('tab-'+t).style.display = t===name?'block':'none';
  });
  document.querySelectorAll('.tab').forEach((el,i)=>{
    el.classList.toggle('active',['search','students','add-student'][i]===name);
  });
  if (name==='students')    loadStudentTable();
  if (name==='add-student') { renderGradesEditor(); renderAttendanceEditor(); }
}

// ── Search ─────────────────────────────────────────────────────
function searchStudent() {
  const lrn = document.getElementById('lrn-input').value.trim();
  const err = document.getElementById('search-error');
  err.textContent=''; err.style.color='';
  if (!lrn) { err.textContent='Please enter an LRN.'; return; }
  err.textContent='Loading...'; err.style.color='var(--muted)';
  fetch(API.getStudent + lrn + '/')
    .then(r=>r.json())
    .then(data=>{
      err.textContent=''; err.style.color='';
      if (data.error){ err.textContent=data.error; err.style.color='var(--danger)'; return; }
      renderDetail(data);
    })
    .catch(()=>{ err.textContent='Could not connect to server.'; err.style.color='var(--danger)'; });
}

// ── Detail view (on-screen) ────────────────────────────────────
function renderDetail(s) {
  const panel = document.getElementById('student-detail-card');
  const av    = ((s.first_name||'')[0]+(s.last_name||'')[0]).toUpperCase();
  const ga    = s.general_average;

  let gradesHtml = `<div class="grades-display"><table>
    <thead><tr>
      <th style="text-align:left">Learning Area</th>
      <th>Q1</th><th>Q2</th><th>Q3</th><th>Q4</th><th>Final</th><th>Remarks</th>
    </tr></thead><tbody>`;
  s.grades.forEach(g=>{
    const isMAPEH = g.area_code==='MAPEH';
    gradesHtml+=`<tr>
      <td class="subj" style="${!g.is_main?'padding-left:18px;color:var(--muted)':''}">
        ${g.area_name}${isMAPEH?' <span style="font-size:10px;color:var(--muted);">(avg)</span>':''}
      </td>
      <td>${g.q1}</td><td>${g.q2}</td><td>${g.q3}</td><td>${g.q4}</td>
      <td class="final">${g.is_main?g.final_grade:''}</td>
      <td>${g.is_main?`<span class="pill ${g.final_grade>=75?'pill-pass':'pill-fail'}">${g.remarks}</span>`:''}</td>
    </tr>`;
  });
  gradesHtml+=`</tbody></table>
    <div class="gen-avg-row">
      <span>General Average</span>
      <span>${ga} &nbsp;<span class="pill ${parseFloat(ga)>=75?'pill-pass':'pill-fail'}">${s.overall_remarks}</span></span>
    </div></div>`;

  let valHtml=`<table class="data" style="margin-top:12px;font-size:12px;">
    <thead><tr><th>Core Value</th><th>Behavior Statement</th><th>Q1</th><th>Q2</th><th>Q3</th><th>Q4</th></tr></thead><tbody>`;
  let lastCV='';
  s.values.forEach(v=>{
    const showCV=v.cv_name!==lastCV; lastCV=v.cv_name;
    valHtml+=`<tr>
      <td>${showCV?`<strong>${v.cv_name}</strong>`:''}</td>
      <td style="font-size:11px;">${v.statement}</td>
      <td>${v.q1}</td><td>${v.q2}</td><td>${v.q3}</td><td>${v.q4}</td>
    </tr>`;
  });
  valHtml+=`</tbody></table>`;

  panel.innerHTML=`
    <div class="detail-header">
      <div class="avatar">${av}</div>
      <div class="detail-meta">
        <h2>${fullNameFromData(s)}</h2>
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
    <div class="card-title" style="margin-top:16px;">Observed Values</div>
    ${valHtml}`;

  document.getElementById('result-panel').style.display='block';
  buildPrintCard(s, ga);
  document.getElementById('result-panel').scrollIntoView({behavior:'smooth'});
}

// ================================================================
//  PRINT CARD BUILDER
//  Matches the original DepEd Form 138-E layout exactly.
//
//  FRONT PAGE (Page 1):
//    Left half  → REPORT ON LEARNING PROGRESS AND ACHIEVEMENT
//                 (grades table + general average + descriptors)
//    Right half → REPORT ON LEARNER'S OBSERVED VALUES
//                 (core values table + marking legend)
//
//  BACK PAGE (Page 2):
//    Left half  → ATTENDANCE RECORD + PARENT'S SIGNATURE
//    Right half → School cover info + Transfer certificate
// ================================================================
function buildPrintCard(s, ga) {

  // ── FRONT: Grades rows ───────────────────────────────────────
  let gradesRows = '';
  s.grades.forEach(g => {
    const isSub  = !g.is_main;
    const subjStyle = isSub
      ? 'padding-left:10px;font-style:italic;'
      : 'font-weight:bold;';
    gradesRows += `<tr>
      <td style="border:0.5px solid #999;padding:1.5px 3px;text-align:left;font-size:7.5px;${subjStyle}">${g.area_name}</td>
      <td style="border:0.5px solid #999;padding:1.5px 3px;text-align:center;font-size:8px;">${g.q1}</td>
      <td style="border:0.5px solid #999;padding:1.5px 3px;text-align:center;font-size:8px;">${g.q2}</td>
      <td style="border:0.5px solid #999;padding:1.5px 3px;text-align:center;font-size:8px;">${g.q3}</td>
      <td style="border:0.5px solid #999;padding:1.5px 3px;text-align:center;font-size:8px;">${g.q4}</td>
      <td style="border:0.5px solid #999;padding:1.5px 3px;text-align:center;font-size:8px;font-weight:bold;">${g.is_main ? g.final_grade : ''}</td>
      <td style="border:0.5px solid #999;padding:1.5px 3px;text-align:center;font-size:8px;${g.is_main && g.final_grade>=75?'color:#166534;font-weight:bold;':'color:#c0392b;font-weight:bold;'}">${g.is_main ? g.remarks : ''}</td>
    </tr>`;
  });

  // ── FRONT: Observed values rows ──────────────────────────────
  let valRows = ''; let lastCV = '';
  s.values.forEach(v => {
    const showCV = v.cv_name !== lastCV; lastCV = v.cv_name;
    valRows += `<tr>
      <td style="border:0.5px solid #999;padding:1.5px 3px;font-size:7px;font-weight:bold;white-space:nowrap;vertical-align:top;">${showCV ? v.cv_name : ''}</td>
      <td style="border:0.5px solid #999;padding:1.5px 3px;font-size:6.5px;text-align:left;">${v.statement}</td>
      <td style="border:0.5px solid #999;padding:1.5px 3px;text-align:center;font-size:7.5px;">${v.q1||'—'}</td>
      <td style="border:0.5px solid #999;padding:1.5px 3px;text-align:center;font-size:7.5px;">${v.q2||'—'}</td>
      <td style="border:0.5px solid #999;padding:1.5px 3px;text-align:center;font-size:7.5px;">${v.q3||'—'}</td>
      <td style="border:0.5px solid #999;padding:1.5px 3px;text-align:center;font-size:7.5px;">${v.q4||'—'}</td>
    </tr>`;
  });

  // ── BACK: Attendance rows ────────────────────────────────────
  const att = s.attendance;
  const months = att.monthly;

  const thCells     = months.map(m=>`<th style="border:0.5px solid #999;background:#eee;padding:1.5px 2px;text-align:center;font-size:6.5px;">${m.month}</th>`).join('');
  const schoolCells = months.map(m=>`<td style="border:0.5px solid #999;padding:1.5px 2px;text-align:center;font-size:7px;">${m.school||0}</td>`).join('');
  const presCells   = months.map(m=>`<td style="border:0.5px solid #999;padding:1.5px 2px;text-align:center;font-size:7px;">${m.present||0}</td>`).join('');
  const absCells    = months.map(m=>`<td style="border:0.5px solid #999;padding:1.5px 2px;text-align:center;font-size:7px;">${Math.max(0,(m.school||0)-(m.present||0))}</td>`).join('');

  const totalSchool  = att.total_school_days || 0;
  const totalPresent = att.total_present     || 0;
  const totalAbsent  = att.total_absent      || 0;

  const tdLbl = `style="border:0.5px solid #999;background:#eee;font-weight:bold;padding:1.5px 3px;font-size:7px;white-space:nowrap;"`;
  const tdTot = `style="border:0.5px solid #999;font-weight:bold;text-align:center;font-size:7px;"`;

  // ── BUILD HTML ───────────────────────────────────────────────
  const html = `
<style>
  @page { size: A4 landscape; margin: 6mm; }
  .rc-wrap { font-family: Arial, sans-serif; font-size: 8px; color: #000; }
  .rc-page { width: 100%; background: #fff; margin-bottom: 6mm; }
  .rc-title { font-weight:bold; font-size:9px; text-align:center;
              border:0.5px solid #999; background:#eee; padding:2px 0; margin-bottom:3px; }
  .rc-grid  { display:grid; grid-template-columns:1fr 1fr; gap:3mm; }
  .rc-col   { padding:0; }
  .rc-col-left  { border-right:0.5px solid #999; padding-right:3mm; }
  .rc-table { width:100%; border-collapse:collapse; }
  .rc-table th {
    border:0.5px solid #999; background:#eee; padding:1.5px 3px;
    text-align:center; font-size:7.5px; font-weight:bold;
  }
  .rc-table td { border:0.5px solid #999; padding:1.5px 3px; font-size:8px; }
  .gen-avg-line {
    font-weight:bold; font-size:8px; text-align:right;
    margin-top:3px; border-top:0.5px solid #999; padding-top:2px;
  }
  .desc-table { width:100%; border-collapse:collapse; margin-top:4px; font-size:7px; }
  .desc-table th { border:0.5px solid #999; background:#eee; padding:1.5px 3px; font-weight:bold; }
  .desc-table td { border:0.5px solid #999; padding:1.5px 3px; }
  .mark-box { margin-top:5px; font-size:7px; }
  .mark-grid { display:grid; grid-template-columns:1fr 1fr; gap:1px; margin-top:2px; }
  .att-table { width:100%; border-collapse:collapse; margin-bottom:4px; }
  .sig-row { display:flex; align-items:flex-end; gap:4px; margin-top:10px; font-size:7.5px; }
  .sig-line { flex:1; border-bottom:0.5px solid #333; }
  .cover-hdr { text-align:center; margin-bottom:5px; }
  .cover-table { width:100%; border-collapse:collapse; font-size:8px; margin-bottom:5px; }
  .cover-table td { border:none; padding:1.5px 2px; }
  .cover-table .lbl { white-space:nowrap; }
  .cover-table .val { border-bottom:0.5px solid #333; font-weight:bold; }
  .dear-p { font-size:7px; line-height:1.5; text-indent:10px; margin:4px 0; }
  .sig-blk { display:flex; justify-content:space-between; font-size:7.5px; margin:8px 0; }
  .sig-name { font-weight:bold; border-top:0.5px solid #333; padding-top:2px; text-align:center; }
  .transfer-box { border:0.5px solid #999; padding:4px; font-size:7px; margin-top:5px; }
  .xfer-line { border-bottom:0.5px solid #333; margin:3px 0; min-height:9px; }
  .passed { color:#166534; font-weight:bold; }
  .failed { color:#c0392b; font-weight:bold; }
</style>

<div class="rc-wrap">

  <!-- ══════════════ FRONT PAGE ══════════════ -->
  <div class="rc-page">
    <div class="rc-grid">

      <!-- LEFT: Learning Progress & Achievement -->
      <div class="rc-col rc-col-left">
        <div class="rc-title">REPORT ON LEARNING PROGRESS AND ACHIEVEMENT</div>
        <table class="rc-table">
          <thead>
            <tr>
              <th rowspan="2" style="text-align:left;min-width:95px;">Learning Areas</th>
              <th colspan="4">QUARTER</th>
              <th rowspan="2">Final<br/>Grade</th>
              <th rowspan="2">Remarks</th>
            </tr>
            <tr>
              <th>1</th><th>2</th><th>3</th><th>4</th>
            </tr>
          </thead>
          <tbody>
            ${gradesRows}
            <tr>
              <td colspan="7" style="border:0.5px solid #999;padding:2px 3px;font-weight:bold;text-align:right;font-size:8px;">
                GENERAL AVERAGE &nbsp;&nbsp;
                <span style="font-size:10px;">${ga}</span>
                &nbsp;&nbsp;
                <span class="${parseFloat(ga)>=75?'passed':'failed'}">${s.overall_remarks}</span>
              </td>
            </tr>
          </tbody>
        </table>

        <table class="desc-table" style="margin-top:5px;">
          <thead>
            <tr>
              <th style="text-align:left;">DESCRIPTORS</th>
              <th>Grading Scale</th>
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Outstanding</td><td style="text-align:center;">90 - 100</td><td class="passed" style="text-align:center;">Passed</td></tr>
            <tr><td>Very Satisfactory</td><td style="text-align:center;">85 - 89</td><td class="passed" style="text-align:center;">Passed</td></tr>
            <tr><td>Satisfactory</td><td style="text-align:center;">80 - 84</td><td class="passed" style="text-align:center;">Passed</td></tr>
            <tr><td>Fairly Satisfactory</td><td style="text-align:center;">75 - 79</td><td class="passed" style="text-align:center;">Passed</td></tr>
            <tr><td>Did Not Meet Expectations</td><td style="text-align:center;">Below 75</td><td class="failed" style="text-align:center;">Failed</td></tr>
          </tbody>
        </table>
      </div>

      <!-- RIGHT: Observed Values -->
      <div class="rc-col">
        <div class="rc-title">REPORT ON LEARNER'S OBSERVED VALUES</div>
        <table class="rc-table">
          <thead>
            <tr>
              <th rowspan="2">Core Values</th>
              <th rowspan="2" style="text-align:left;min-width:80px;">Behavior Statements</th>
              <th colspan="4">QUARTER</th>
            </tr>
            <tr><th>1</th><th>2</th><th>3</th><th>4</th></tr>
          </thead>
          <tbody>${valRows}</tbody>
        </table>

        <div class="mark-box">
          <div style="font-weight:bold;font-size:8px;">MARKING &nbsp;&nbsp; NON-NUMERICAL RATING</div>
          <div class="mark-grid">
            <div><strong>AO</strong> &nbsp; Always Observed</div>
            <div><strong>SO</strong> &nbsp; Sometimes Observed</div>
            <div><strong>RO</strong> &nbsp; Rarely Observed</div>
            <div><strong>NO</strong> &nbsp; Not Observed</div>
          </div>
        </div>
      </div>

    </div>
  </div><!-- end FRONT PAGE -->

  <!-- ══════════════ BACK PAGE ══════════════ -->
  <div class="rc-page" style="page-break-before:always;">
    <div class="rc-grid">

      <!-- LEFT: Attendance + Parent Signature -->
      <div class="rc-col rc-col-left">
        <div class="rc-title">ATTENDANCE RECORD</div>
        <table class="att-table">
          <thead>
            <tr>
              <td ${tdLbl}>MONTHS</td>
              ${thCells}
              <th style="border:0.5px solid #999;background:#eee;padding:1.5px 3px;text-align:center;font-size:7px;">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td ${tdLbl}>No. of School Days</td>
              ${schoolCells}
              <td ${tdTot}>${totalSchool}</td>
            </tr>
            <tr>
              <td ${tdLbl}>No. of Days Present</td>
              ${presCells}
              <td ${tdTot}>${totalPresent}</td>
            </tr>
            <tr>
              <td ${tdLbl}>No. of Days Absent</td>
              ${absCells}
              <td ${tdTot}>${totalAbsent}</td>
            </tr>
          </tbody>
        </table>

        <div style="font-weight:bold;text-align:center;font-size:8px;margin-top:8px;">
          PARENT'S/GUARDIAN'S SIGNATURE
        </div>
        ${['First Quarter','Second Quarter','Third Quarter','Fourth Quarter'].map(q=>`
          <div class="sig-row">
            <span style="width:85px;">${q}</span>
            <span class="sig-line"></span>
          </div>`).join('')}
      </div>

      <!-- RIGHT: Cover info + Transfer -->
      <div class="rc-col">
        <div class="cover-hdr">
          <div style="font-size:7px;">Republic of the Philippines</div>
          <div style="font-size:7px;">Department of Education</div>
          <div style="font-size:7px;">Region V &nbsp;|&nbsp; Division of Sorsogon</div>
          <div style="font-size:7px;">Bulan North District</div>
          <div style="font-weight:bold;font-size:9px;margin-top:2px;">${s.school}</div>
          <div style="font-size:6.5px;">DepEd Form 138-E</div>
        </div>

        <table class="cover-table">
          <tr>
            <td class="lbl" style="width:40px;">Name:</td>
            <td class="val" colspan="3">${fullNameFromData(s)}</td>
          </tr>
          <tr>
            <td class="lbl">Age:</td>
            <td class="val" style="width:30px;">${s.age}</td>
            <td class="lbl" style="width:25px;">Sex:</td>
            <td class="val">${s.sex}</td>
          </tr>
          <tr>
            <td class="lbl">Grade:</td>
            <td class="val">${s.grade}</td>
            <td class="lbl">Section:</td>
            <td class="val">${s.section}</td>
          </tr>
          <tr>
            <td class="lbl" style="white-space:nowrap;">School Year:</td>
            <td class="val" colspan="3">${s.sy}</td>
          </tr>
          <tr>
            <td class="lbl">LRN:</td>
            <td class="val" colspan="3">${s.lrn}</td>
          </tr>
        </table>

        <p class="dear-p">
          This report card shows the ability and progress your child
          has made in the different learning areas as well as his/her core values.
        </p>
        <p class="dear-p">
          The school welcomes you should you desire to know more
          about your child's progress.
        </p>

        <div class="sig-blk">
          <div>
            <div style="margin-bottom:16px;">&nbsp;</div>
            <div class="sig-name">${s.principal}</div>
            <div style="text-align:center;font-size:7px;">${s.principal_pos}</div>
          </div>
          <div>
            <div style="margin-bottom:16px;">&nbsp;</div>
            <div class="sig-name">${s.adviser}</div>
            <div style="text-align:center;font-size:7px;">Adviser</div>
          </div>
        </div>

        <div class="transfer-box">
          <div style="font-weight:bold;text-align:center;margin-bottom:3px;">Certificate of Transfer</div>
          <div>Admitted to Grade __________ Section __________</div>
          <div class="xfer-line"></div>
          <div>Eligible for Admission in Grade ______________</div>
          <div class="xfer-line"></div>
          <div style="font-weight:bold;text-align:center;margin-top:4px;">
            CANCELLATION OF ELIGIBILITY TO TRANSFER
          </div>
          <div style="margin-top:3px;">Admitted in ______________ Date ______________</div>
          <div class="xfer-line"></div>
          <div style="text-align:right;font-size:7px;margin-top:2px;">ESHT 3</div>
        </div>
      </div>

    </div>
  </div><!-- end BACK PAGE -->

</div><!-- end rc-wrap -->`;

  document.getElementById('print-area').innerHTML = html;
}

// ── Student table ──────────────────────────────────────────────
function loadStudentTable() {
  const tbody = document.getElementById('students-tbody');
  tbody.innerHTML='<tr><td colspan="9" style="text-align:center;color:var(--muted);padding:24px;">Loading...</td></tr>';
  fetch(API.listStudents)
    .then(r=>r.json())
    .then(data=>{
      if (!data.students||data.students.length===0){
        tbody.innerHTML='<tr><td colspan="9" style="text-align:center;color:var(--muted);padding:24px;">No students found.</td></tr>';
        document.getElementById('student-count-badge').textContent=0;
        return;
      }
      tbody.innerHTML=data.students.map(s=>`
        <tr>
          <td><code style="font-size:12px;">${s.lrn}</code></td>
          <td><strong>${s.full_name}</strong></td>
          <td>${s.sex}</td>
          <td>${s.age}</td>
          <td>${s.grade}</td>
          <td>${s.section}</td>
          <td>${s.sy}</td>
          <td><strong>${s.general_average}</strong> &nbsp;
            <span class="pill ${parseFloat(s.general_average)>=75?'pill-pass':'pill-fail'}">${s.remarks}</span>
          </td>
          <td>
            <button class="btn btn-secondary btn-sm"
              onclick="document.getElementById('lrn-input').value='${s.lrn}';showTab('search');searchStudent();">
              View Card
            </button>
            <button class="btn btn-danger btn-sm" style="margin-left:4px;"
              onclick="deleteStudent('${s.lrn}','${s.full_name}')">Delete</button>
          </td>
        </tr>`).join('');
      document.getElementById('student-count-badge').textContent=data.students.length;
    })
    .catch(()=>{
      tbody.innerHTML='<tr><td colspan="9" style="text-align:center;color:var(--danger);padding:24px;">Could not load students. Is Django running?</td></tr>';
    });
}

function deleteStudent(lrn, name) {
  if (!confirm(`Delete student ${name} (${lrn})?`)) return;
  fetch(API.deleteStudent+lrn+'/', {
    method:'POST', headers:{'X-CSRFToken':CSRF_TOKEN,'Content-Type':'application/json'},
  }).then(r=>r.json()).then(data=>{
    if (data.success){ toast('Student deleted.','error'); loadStudentTable(); }
    else toast(data.error||'Delete failed.','error');
  });
}

// ── Grades editor ──────────────────────────────────────────────
function renderGradesEditor() {
  let html=`<table><thead><tr>
    <th style="text-align:left;min-width:160px;">Subject</th>
    <th>Q1</th><th>Q2</th><th>Q3</th><th>Q4</th><th>Final</th><th>Remarks</th>
  </tr></thead><tbody>`;
  AREAS.forEach(a=>{
    if (a.code===MAPEH_CODE){
      html+=`<tr style="background:#f0f4ff;">
        <td class="subj" style="font-weight:bold;">
          ${a.name} <span style="font-size:10px;color:#6b7488;font-weight:400;">(auto)</span>
        </td>
        ${[1,2,3,4].map(q=>`<td><input type="number" id="g_MAPEH_${q}" readonly
          style="width:52px;background:#e8f0fe;border:1px solid #b3c6f7;text-align:center;font-weight:bold;"/></td>`).join('')}
        <td class="computed" id="f_MAPEH">—</td>
        <td class="computed" id="r_MAPEH">—</td>
      </tr>`;
    } else {
      html+=`<tr>
        <td class="subj" style="${a.parent?'padding-left:16px;':''}">${a.name}</td>
        ${[1,2,3,4].map(q=>`<td><input type="number" id="g_${a.code}_${q}" min="0" max="100"
          oninput="updateFinal('${a.code}')"/></td>`).join('')}
        <td class="computed" id="f_${a.code}">—</td>
        <td class="computed" id="r_${a.code}">—</td>
      </tr>`;
    }
  });
  html+=`</tbody></table>`;
  document.getElementById('grades-editor').innerHTML=html;

  let vHtml=`<table class="data" style="margin-top:8px;font-size:12px;">
    <thead><tr><th>Core Value</th><th>Behavior Statement</th><th>Q1</th><th>Q2</th><th>Q3</th><th>Q4</th></tr></thead><tbody>`;
  CORE_VALUES.forEach(cv=>{
    cv.statements.forEach((bs,i)=>{
      const opts=['AO','SO','RO','NO'].map(o=>`<option>${o}</option>`).join('');
      vHtml+=`<tr>
        <td>${i===0?`<strong>${cv.name}</strong>`:''}</td>
        <td style="font-size:11px;">${bs.text}</td>
        ${[1,2,3,4].map(q=>`<td><select id="v_${bs.id}_${q}" style="font-size:12px;padding:2px 4px;">${opts}</select></td>`).join('')}
      </tr>`;
    });
  });
  vHtml+=`</tbody></table>`;
  document.getElementById('values-editor').innerHTML=vHtml;
}

// ── Attendance editor ──────────────────────────────────────────
function renderAttendanceEditor() {
  const tbody=document.getElementById('attendance-editor');
  const mkInputs=(rowKey,label)=>
    `<tr><td style="font-weight:600;font-size:12px;">${label}</td>` +
    MONTHS.map(m=>`<td><input type="number" id="att_${m}_${rowKey}" min="0" max="31"
      style="width:38px;text-align:center;font-size:11px;"
      ${rowKey==='absent'?'readonly style="width:38px;text-align:center;font-size:11px;background:#f4f6f9;"':''}
      oninput="${rowKey!=='absent'?`updateAbsent('${m}')`:''}"
      /></td>`).join('') + `</tr>`;

  tbody.innerHTML=
    `<tr><td style="font-weight:600;font-size:12px;">No. of School Days</td>` +
    MONTHS.map(m=>`<td><input type="number" id="att_${m}_school" min="0" max="31"
      style="width:38px;text-align:center;font-size:11px;" oninput="updateAbsent('${m}')"/></td>`).join('') +
    `</tr>` +
    `<tr><td style="font-weight:600;font-size:12px;">No. of Days Present</td>` +
    MONTHS.map(m=>`<td><input type="number" id="att_${m}_present" min="0" max="31"
      style="width:38px;text-align:center;font-size:11px;" oninput="updateAbsent('${m}')"/></td>`).join('') +
    `</tr>` +
    `<tr><td style="font-weight:600;font-size:12px;">No. of Days Absent</td>` +
    MONTHS.map(m=>`<td><span id="att_${m}_absent" style="font-size:11px;display:block;text-align:center;">0</span></td>`).join('') +
    `</tr>`;
}

function updateAbsent(m) {
  const s = parseInt(document.getElementById(`att_${m}_school`)?.value)||0;
  const p = parseInt(document.getElementById(`att_${m}_present`)?.value)||0;
  const el= document.getElementById(`att_${m}_absent`);
  if (el) el.textContent=Math.max(0,s-p);
}

function updateFinal(code) {
  const vals=[1,2,3,4].map(q=>parseFloat(document.getElementById(`g_${code}_${q}`)?.value)||0);
  const f=(vals.reduce((a,b)=>a+b,0)/4).toFixed(2);
  const fc=document.getElementById('f_'+code);
  const rc=document.getElementById('r_'+code);
  if(fc) fc.textContent=f;
  if(rc){ rc.textContent=parseFloat(f)>=75?'Passed':'Failed';
          rc.className='computed '+(parseFloat(f)>=75?'pass-cell':'fail-cell'); }
  if (MAPEH_SUBS.includes(code)){
    const mq=[1,2,3,4].map(qi=>
      Math.round(MAPEH_SUBS.reduce((s,c)=>s+(parseFloat(document.getElementById(`g_${c}_${qi}`)?.value)||0),0)/4)
    );
    [1,2,3,4].forEach((q,i)=>{ const el=document.getElementById(`g_MAPEH_${q}`); if(el) el.value=mq[i]||''; });
    const mf=(mq.reduce((a,b)=>a+b,0)/4).toFixed(2);
    const mfc=document.getElementById('f_MAPEH'), mrc=document.getElementById('r_MAPEH');
    if(mfc) mfc.textContent=mf;
    if(mrc){ mrc.textContent=parseFloat(mf)>=75?'Passed':'Failed';
             mrc.className='computed '+(parseFloat(mf)>=75?'pass-cell':'fail-cell'); }
  }
}

function resetAddForm() {
  ['new-lrn','new-lastname','new-firstname','new-mi','new-section','new-sy'].forEach(id=>{
    const el=document.getElementById(id); if(el) el.value='';
  });
  const bd=document.getElementById('new-birthdate'); if(bd) bd.value='';
  const ad=document.getElementById('new-age-display'); if(ad) ad.value='';
  renderGradesEditor(); renderAttendanceEditor();
  document.getElementById('add-error').textContent='';
}

function addStudent() {
  const err=document.getElementById('add-error');
  const lrn=document.getElementById('new-lrn').value.trim();
  const last=document.getElementById('new-lastname').value.trim();
  const first=document.getElementById('new-firstname').value.trim();
  const birthDate=document.getElementById('new-birthdate').value.trim();
  if(!lrn||lrn.length!==12){ err.textContent='LRN must be exactly 12 digits.'; return; }
  if(!last||!first){ err.textContent='Last name and first name are required.'; return; }
  if(!birthDate){ err.textContent='Birth date is required.'; return; }

  const grades={};
  AREAS.forEach(a=>{ if(a.code===MAPEH_CODE) return;
    grades[a.code]=[1,2,3,4].map(q=>parseFloat(document.getElementById(`g_${a.code}_${q}`)?.value)||0); });

  const values={};
  CORE_VALUES.forEach(cv=>{ cv.statements.forEach(bs=>{
    values[bs.id]=[1,2,3,4].map(q=>document.getElementById(`v_${bs.id}_${q}`)?.value||'AO');
  }); });

  const attendance={};
  MONTHS.forEach(m=>{
    attendance[`${m}_school`] =parseInt(document.getElementById(`att_${m}_school`)?.value)||0;
    attendance[`${m}_present`]=parseInt(document.getElementById(`att_${m}_present`)?.value)||0;
  });

  const payload={
    lrn,lastName:last,firstName:first,
    mi:document.getElementById('new-mi').value.trim(),
    sex:document.getElementById('new-sex').value,
    birthDate,
    grade:parseInt(document.getElementById('new-grade').value)||5,
    section:document.getElementById('new-section').value||'One',
    sy:document.getElementById('new-sy').value||'2025-2026',
    school:document.getElementById('new-school').value||'M. A. Roxas Elementary School',
    grades,values,attendance,
  };

  err.textContent='Saving...'; err.style.color='var(--muted)';
  fetch(API.addStudent,{
    method:'POST',
    headers:{'Content-Type':'application/json','X-CSRFToken':CSRF_TOKEN},
    body:JSON.stringify(payload),
  }).then(r=>r.json()).then(data=>{
    err.textContent=''; err.style.color='';
    if(data.error){ err.textContent=data.error; err.style.color='var(--danger)'; return; }
    toast(`${first} ${last} saved successfully!`);
    resetAddForm(); showTab('students');
  }).catch(()=>{ err.textContent='Could not save. Is Django running?'; err.style.color='var(--danger)'; });
}

// ── Init ───────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded',()=>{
  const bdInput=document.getElementById('new-birthdate');
  const ageDisp=document.getElementById('new-age-display');
  if(bdInput&&ageDisp){
    bdInput.addEventListener('change',()=>{
      const age=computeAgeFromDate(bdInput.value);
      ageDisp.value=age!==''?`${age} years old`:'';
    });
  }
  renderGradesEditor();
  renderAttendanceEditor();
});