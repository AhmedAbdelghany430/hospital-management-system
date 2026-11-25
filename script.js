// Hospital Management System - vanilla JS, data saved in localStorage
const load = k => JSON.parse(localStorage.getItem(k) || '[]');
const save = (k, v) => localStorage.setItem(k, JSON.stringify(v));
const $ = id => document.getElementById(id);
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

let patients = load('hms_patients');
let doctors = load('hms_doctors');
let appts = load('hms_appts');

if (!doctors.length) {
  doctors = [
    {id: uid(), name: 'Dr. Sara Hassan', spec: 'Cardiology', phone: '0100000001'},
    {id: uid(), name: 'Dr. Omar Nabil', spec: 'Pediatrics', phone: '0100000002'}
  ];
  save('hms_doctors', doctors);
}

document.querySelectorAll('nav button').forEach(b => b.onclick = () => {
  document.querySelectorAll('nav button').forEach(x => x.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(x => x.classList.remove('active'));
  b.classList.add('active');
  $(b.dataset.tab).classList.add('active');
});

const nameOf = (list, id) => (list.find(x => x.id === id) || {name: '(deleted)'}).name;

function renderPatients() {
  const q = $('pSearch').value.toLowerCase();
  $('patientRows').innerHTML = patients
    .filter(p => (p.name + p.disease + p.phone).toLowerCase().includes(q))
    .map(p => `<tr><td>${esc(p.name)}</td><td>${p.age}</td><td>${p.gender}</td><td>${esc(p.phone)}</td><td>${esc(p.disease)}</td>
    <td><button class="del" onclick="delPatient('${p.id}')">Delete</button></td></tr>`).join('');
}
function renderDoctors() {
  $('doctorRows').innerHTML = doctors.map(d => `<tr><td>${esc(d.name)}</td><td>${esc(d.spec)}</td><td>${esc(d.phone)}</td>
    <td><button class="del" onclick="delDoctor('${d.id}')">Delete</button></td></tr>`).join('');
}
function renderSelects() {
  $('aPatient').innerHTML = '<option value="">Select patient</option>' + patients.map(p => `<option value="${p.id}">${esc(p.name)}</option>`).join('');
  $('aDoctor').innerHTML = '<option value="">Select doctor</option>' + doctors.map(d => `<option value="${d.id}">${esc(d.name)} (${esc(d.spec)})</option>`).join('');
}
function renderAppts() {
  const sorted = [...appts].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  $('apptRows').innerHTML = sorted.map(a => `<tr><td>${esc(nameOf(patients, a.patient))}</td><td>${esc(nameOf(doctors, a.doctor))}</td>
    <td>${a.date}</td><td>${a.time}</td><td><span class="tag ${a.status}">${a.status}</span></td>
    <td>${a.status === 'Scheduled' ? `<button class="done" onclick="complete('${a.id}')">Done</button>` : ''}<button class="del" onclick="delAppt('${a.id}')">Cancel</button></td></tr>`).join('');
}
function renderDashboard() {
  const today = new Date().toISOString().slice(0, 10);
  $('countPatients').textContent = patients.length;
  $('countDoctors').textContent = doctors.length;
  $('countAppts').textContent = appts.length;
  $('countToday').textContent = appts.filter(a => a.date === today).length;
  const up = appts.filter(a => a.status === 'Scheduled' && a.date >= today)
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)).slice(0, 5);
  $('upcoming').innerHTML = up.length ? up.map(a => `<li>${a.date} ${a.time} - ${esc(nameOf(patients, a.patient))} with ${esc(nameOf(doctors, a.doctor))}</li>`).join('') : '<li>No upcoming appointments.</li>';
}
function renderAll() { renderPatients(); renderDoctors(); renderSelects(); renderAppts(); renderDashboard(); }

$('patientForm').onsubmit = e => {
  e.preventDefault();
  patients.push({id: uid(), name: $('pName').value.trim(), age: +$('pAge').value, gender: $('pGender').value, phone: $('pPhone').value.trim(), disease: $('pDisease').value.trim()});
  save('hms_patients', patients); e.target.reset(); renderAll();
};
$('doctorForm').onsubmit = e => {
  e.preventDefault();
  doctors.push({id: uid(), name: $('dName').value.trim(), spec: $('dSpec').value.trim(), phone: $('dPhone').value.trim()});
  save('hms_doctors', doctors); e.target.reset(); renderAll();
};
$('apptForm').onsubmit = e => {
  e.preventDefault();
  const a = {id: uid(), patient: $('aPatient').value, doctor: $('aDoctor').value, date: $('aDate').value, time: $('aTime').value, status: 'Scheduled'};
  if (appts.some(x => x.doctor === a.doctor && x.date === a.date && x.time === a.time && x.status === 'Scheduled')) {
    $('apptMsg').textContent = 'This doctor is already booked at that time.'; return;
  }
  $('apptMsg').textContent = '';
  appts.push(a); save('hms_appts', appts); e.target.reset(); renderAll();
};
$('pSearch').oninput = renderPatients;

window.delPatient = id => { patients = patients.filter(p => p.id !== id); appts = appts.filter(a => a.patient !== id); save('hms_patients', patients); save('hms_appts', appts); renderAll(); };
window.delDoctor = id => { doctors = doctors.filter(d => d.id !== id); appts = appts.filter(a => a.doctor !== id); save('hms_doctors', doctors); save('hms_appts', appts); renderAll(); };
window.delAppt = id => { appts = appts.filter(a => a.id !== id); save('hms_appts', appts); renderAll(); };
window.complete = id => { const a = appts.find(x => x.id === id); if (a) a.status = 'Completed'; save('hms_appts', appts); renderAll(); };

renderAll();
