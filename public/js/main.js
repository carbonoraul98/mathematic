/* JS from INDEX.HTML */

let selectedGrade = 1;
let selectedDifficulty = "easy";
let currentAnswer = 0;
let score = 0;
let time = 60;
let timerInterval = null;

function startIntro() {
  document.querySelector(".cover").style.display = "none";
  document.getElementById("intro").style.display = "flex";
  setTimeout(() => {
    document.getElementById("intro").style.display = "none";
    document.getElementById("menu").style.display = "flex";
  }, 1000);
}

function selectGrade(grade, btn) {
  selectedGrade = grade;
  document
    .querySelectorAll(".grade")
    .forEach((b) => b.classList.remove("selected"));
  btn.classList.add("selected");
}

function selectDifficulty(diff, btn) {
  selectedDifficulty = diff;
  document
    .querySelectorAll(".diff")
    .forEach((b) => b.classList.remove("selected"));
  btn.classList.add("selected");
}

function startGame() {
  document.querySelector(".menu-screen").style.display = "none";
  document.querySelector(".game").style.display = "block";
  document.getElementById("gradeText").innerHTML = "Grado " + selectedGrade;
  score = 0;
  time = 60;
  document.getElementById("score").innerHTML = "Puntos: " + score;
  document.getElementById("timer").innerHTML = "Tiempo: " + time;
  generateQuestion();
  timerInterval = setInterval(() => {
    time--;
    document.getElementById("timer").innerHTML = "Tiempo: " + time;
    if (time <= 0) {
      clearInterval(timerInterval);
      showAlert("¡Tiempo agotado! Puntos: " + score, () => {
        location.reload();
      });
    }
  }, 1000);
}

function generateQuestion() {
  let max = 10;
  if (selectedDifficulty === "medium") {
    max = 50;
  }
  if (selectedDifficulty === "hard") {
    max = 100;
  }
  let a = Math.floor(Math.random() * max) + 1;
  let b = Math.floor(Math.random() * max) + 1;
  let operation = "";
  switch (selectedGrade) {
    case 1:
      operation = `${a} + ${b}`;
      currentAnswer = a + b;
      break;
    case 2:
      operation = `${a} - ${b}`;
      currentAnswer = a - b;
      break;
    case 3:
      operation = `${a} × ${b}`;
      currentAnswer = a * b;
      break;
    case 4:
      let result = a * b;
      operation = `${result} ÷ ${a}`;
      currentAnswer = b;
      break;
    case 5:
      operation = `(${a} + ${b}) × 2`;
      currentAnswer = (a + b) * 2;
      break;
  }
  document.getElementById("question").innerHTML = operation;
  document.getElementById("answer").value = "";
  document.getElementById("result").innerHTML = "";
}

function checkAnswer() {
  let userAnswer = Number(document.getElementById("answer").value);
  let result = document.getElementById("result");
  if (userAnswer === currentAnswer) {
    result.innerHTML = "✔ Correcto";
    result.style.color = "#00ff99";
    score += 10;
  } else {
    result.innerHTML = "✖ Incorrecto";
    result.style.color = "#ff3366";
  }
  document.getElementById("score").innerHTML = "Puntos: " + score;
  setTimeout(generateQuestion, 1500);
}

for (let i = 0; i < 100; i++) {
  let star = document.createElement("div");
  star.classList.add("star");
  star.style.left = Math.random() * 100 + "%";
  star.style.top = Math.random() * 100 + "%";
  star.style.animationDuration = Math.random() * 3 + 1 + "s";
  document.body.appendChild(star);
}

/* JS from INDEX4.HTML */

let estudiantes = [];
let actividades = [];
let preguntasTemp = [];
let preguntasPracticaTemp = [];
let estudianteActual = null;

// Cargar estudiantes desde el servidor
async function loadStudents() {
    try {
        const res = await fetch('/api/students');
        estudiantes = await res.json();
        mostrarEstudiantes();
    } catch (error) {
        console.error('Error cargando estudiantes:', error);
    }
}



// Descargar calificaciones
function downloadGrades() {
    window.location.href = '/api/grades/export';
}

function showScreen(id) {
  document.querySelectorAll(".screen").forEach((screen) => {
    screen.classList.remove("active");
  });
  document.getElementById(id).classList.add("active");
}

const EYE_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>';
const EYE_OFF_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a20.7 20.7 0 0 1 5.06-6.06M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a20.7 20.7 0 0 1-3.22 4.44M14.12 14.12a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>';

function logout() {
  authenticatedRole = null;
  estudianteActual = null;
  if(document.getElementById("loginUser")) document.getElementById("loginUser").value = "";
  if(document.getElementById("loginPass")) document.getElementById("loginPass").value = "";
  if(document.getElementById("loginResult")) document.getElementById("loginResult").innerHTML = "";
  showScreen('home');
}

function togglePasswordVisibility() {
  const passInput = document.getElementById('loginPass');
  const toggleBtn = document.getElementById('passwordToggleBtn');
  const isVisible = passInput.type === 'password';
  passInput.type = isVisible ? 'text' : 'password';
  toggleBtn.innerHTML = isVisible ? EYE_OFF_ICON : EYE_ICON;
  toggleBtn.setAttribute('aria-label', isVisible ? 'Ocultar contraseña' : 'Mostrar contraseña');
}

function showComingSoon() {
  showAlert('🚧 Esta función estará disponible pronto');
}

async function loginAs(endpoint, user, pass) {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: user, password: pass })
  });
  return res.json();
}

let authenticatedRole = null;

async function unifiedLogin() {
  let user = document.getElementById("loginUser").value.trim();
  let pass = document.getElementById("loginPass").value.trim();
  let resultDiv = document.getElementById("loginResult");
  resultDiv.innerHTML = "";

  try {
    const teacherResult = await loginAs('/api/teachers/login', user, pass);
    if (teacherResult.success) {
      authenticatedRole = 'profesor';
      enterAsRole('profesor');
      return;
    }

    const studentResult = await loginAs('/api/students/login', user, pass);
    if (studentResult.success) {
      authenticatedRole = 'estudiante';
      estudianteActual = studentResult.student;
      enterAsRole('estudiante');
      return;
    }

    resultDiv.innerHTML = "<br>❌ Usuario o contraseña incorrecta";
  } catch (error) {
    console.error('Error en login:', error);
    resultDiv.innerHTML = "<br>❌ Error de conexión";
  }
}

function enterAsRole(role) {
  if (role !== authenticatedRole) {
    showAlert('❌ Esta cuenta no tiene acceso como ' + (role === 'profesor' ? 'Profesor' : 'Estudiante'));
    return;
  }

  if (role === 'profesor') {
    showScreen("teacherPanel");
    loadStudents();
    loadDashboardStats();
  } else {
    showScreen("studentPanel");
    if (document.getElementById('studentPanelName')) {
        document.getElementById('studentPanelName').innerText = estudianteActual.full_name || estudianteActual.username || 'Estudiante';
    }
    updateStudentLevelUI(estudianteActual);
    switchStudentTab('home');
    mostrarPendientes();
  }
}

function updateStudentLevelUI(student) {
  if (student && student.levelInfo) {
    document.getElementById('studentLevelDisplay').innerText = student.levelInfo.level;
    document.getElementById('studentXpDisplay').innerText = student.levelInfo.currentXP;
    if (document.getElementById('studentXpGoal')) {
        document.getElementById('studentXpGoal').innerText = student.levelInfo.xpPerLevel;
    }
    document.getElementById('studentXpBar').style.width = student.levelInfo.progressPercent + '%';
    
    // Renderizar Mapa de Niveles (Diseño V2 - Gamificado)
    const mapContainer = document.getElementById('levelMapContainer');
    if (mapContainer) {
      mapContainer.innerHTML = '';
      mapContainer.className = 'level-map-container-v2';
      
      const nodeTitles = [
        "Suma",
        "Resta",
        "Multiplicación I",
        "División I",
        "Fracciones I",
        "Fracciones II",
        "Mult. 2 Cifras",
        "Mult. 3-4 Cifras",
        "División II",
        "División III",
        "Plano I",
        "Plano II",
        "Estadística I",
        "Estadística II",
        "Álgebra Básica"
      ];
      const maxLevels = nodeTitles.length;
      for (let i = 1; i <= maxLevels; i++) {
        const node = document.createElement('div');
        node.className = 'map-node-v2';
        const nodeLabel = nodeTitles[i-1] || `Misión ${i}`;
        
        if (i < student.levelInfo.level) {
          node.classList.add('completed');
          node.innerHTML = `
            <div class="node-circle-v2">${i}
                <div class="node-icon-v2" style="color: #10b981;">✔️</div>
            </div>
            <div class="node-label-v2">${nodeLabel}</div>
          `;
        } else if (i === student.levelInfo.level) {
          node.classList.add('active');
          node.onclick = () => startPracticeMode();
          node.title = "¡Jugar Práctica!";
          node.innerHTML = `
            <div class="node-circle-v2">${i}
                <div class="node-icon-v2" style="color: #3b82f6;">▶️</div>
            </div>
            <div class="node-label-v2">${nodeLabel}</div>
          `;
        } else {
          node.classList.add('locked');
          node.innerHTML = `
            <div class="node-circle-v2">${i}
                <div class="node-icon-v2" style="color: #64748b;">🔒</div>
            </div>
            <div class="node-label-v2">${nodeLabel}</div>
          `;
        }
        
        mapContainer.appendChild(node);
      }
    }
  }
}

async function startPracticeMode() {
  try {
    const res = await fetch('/api/activities');
    const todasActividades = await res.json();
    
    // Buscar actividades de tipo Práctica
    const practicas = todasActividades.filter(a => a.type === 'Práctica');
    
    if (practicas.length === 0) {
      showAlert("🚧 Aún no hay módulos de práctica disponibles. ¡Pídele a tu profesor que cree uno!");
      return;
    }
    
    // Elegir la práctica correspondiente al nivel actual
    // Asegurarse de que están ordenadas (asumiendo que id más viejo es nivel más bajo)
    practicas.sort((a, b) => a.id - b.id);
    const nivelIndex = (estudianteActual.levelInfo ? estudianteActual.levelInfo.level : 1) - 1;
    
    // Si ya pasó el límite de prácticas creadas, darle la última o una aleatoria
    const practicaSeleccionada = practicas[Math.min(nivelIndex, practicas.length - 1)];
    
    let seccion = estudianteActual.group_name ? estudianteActual.group_name.charAt(1) : "A";
    
      window.playActivity(practicaSeleccionada, seccion, async (puntosObtenidos) => {
      // Llamar al backend para sumar XP y registrar el intento de práctica
      try {
        const xpRes = await fetch(`/api/students/${estudianteActual.id}/add-xp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            xp: puntosObtenidos,
            activity_id: practicaSeleccionada.id
          })
        });
        const xpData = await xpRes.json();
        if (xpData.success) {
          estudianteActual.levelInfo = xpData.levelInfo;
          estudianteActual.total_score = xpData.total_score;
          updateStudentLevelUI(estudianteActual);
          if (document.getElementById('studentProfileView') && document.getElementById('studentProfileView').style.display !== 'none') {
            loadStudentPerformance();
          }
          showAlert(`🎮 ¡Bien hecho! Sumaste ${puntosObtenidos} XP. (Nivel ${xpData.levelInfo.level})`);
        }
      } catch (err) {
        console.error('Error guardando XP:', err);
      }
    });
  } catch (error) {
    console.error('Error al iniciar práctica:', error);
    showAlert("❌ Error al cargar las prácticas");
  }
}

// Navegación de pestañas para el estudiante
function switchStudentTab(tab) {
  const homeView = document.getElementById('studentHomeView');
  const profileView = document.getElementById('studentProfileView');
  const btnHome = document.getElementById('tabBtnHome');
  const btnProfile = document.getElementById('tabBtnProfile');

  if (tab === 'profile') {
    if (homeView) homeView.style.display = 'none';
    if (profileView) profileView.style.display = 'block';
    if (btnHome) btnHome.classList.remove('active');
    if (btnProfile) btnProfile.classList.add('active');
    loadStudentPerformance();
  } else {
    if (homeView) homeView.style.display = 'block';
    if (profileView) profileView.style.display = 'none';
    if (btnHome) btnHome.classList.add('active');
    if (btnProfile) btnProfile.classList.remove('active');
    if (estudianteActual) updateStudentLevelUI(estudianteActual);
  }
}

// Cargar métricas interactivas de rendimiento
async function loadStudentPerformance() {
  if (!estudianteActual) return;

  const nameEl = document.getElementById('studentProfileName');
  const gradeEl = document.getElementById('studentProfileGrade');
  if (nameEl) nameEl.innerText = estudianteActual.full_name || estudianteActual.username || 'Estudiante';
  if (gradeEl) gradeEl.innerText = estudianteActual.group_name ? `${estudianteActual.group_name}` : 'Grado General';

  try {
    const res = await fetch(`/api/students/${estudianteActual.id}/performance`);
    const data = await res.json();

    if (data.success) {
      if (document.getElementById('profileLevelVal')) {
        document.getElementById('profileLevelVal').innerText = data.student.levelInfo.level;
      }
      if (document.getElementById('profilePointsVal')) {
        document.getElementById('profilePointsVal').innerText = data.student.total_score;
      }
      if (document.getElementById('profileStreakVal')) {
        document.getElementById('profileStreakVal').innerText = data.streakDays + (data.streakDays === 1 ? ' día' : ' días');
      }

      const listContainer = document.getElementById('studentTopicsList');
      if (listContainer && data.topics) {
        listContainer.innerHTML = '';
        data.topics.forEach(t => {
          const row = document.createElement('div');
          row.className = 'student-topic-row';
          row.innerHTML = `
            <div class="student-topic-badge" style="background: ${t.bg}; color: ${t.color};">
              ${t.icon}
            </div>
            <div class="student-topic-name" title="${t.name}">
              ${t.name}
            </div>
            <div class="student-topic-track">
              <div class="student-topic-fill" style="background: ${t.color}; width: 0%; box-shadow: 0 0 10px ${t.color};" data-percent="${t.percentage}"></div>
            </div>
            <div class="student-topic-percent">
              ${t.percentage}%
            </div>
          `;
          listContainer.appendChild(row);
        });

        // Animación suave de las barras
        setTimeout(() => {
          document.querySelectorAll('.student-topic-fill').forEach(el => {
            el.style.width = el.getAttribute('data-percent') + '%';
          });
        }, 50);
      }
    }
  } catch (err) {
    console.error('Error cargando rendimiento del estudiante:', err);
  }
}

// Funciones del Modal de Estudiante
function openCreateStudentModal(defaultGrade) {
  document.getElementById('createStudentModal').style.display = 'flex';
  document.getElementById('modalStudentName').value = '';
  document.getElementById('modalStudentUser').value = '';
  document.getElementById('modalStudentPassword').value = '';
  if (defaultGrade) {
    const gradeSelect = document.getElementById('modalStudentGrade');
    if (gradeSelect) gradeSelect.value = defaultGrade;
  }
}

function closeCreateStudentModal() {
  document.getElementById('createStudentModal').style.display = 'none';
}

// Generar usuario automáticamente al escribir el nombre
document.getElementById('modalStudentName').addEventListener('input', function(e) {
  let name = e.target.value;
  let parts = name.trim().split(' ').filter(x => x);
  let username = '';
  if (parts.length >= 3) {
    username = parts[2] + parts[0];
  } else {
    username = parts.join('');
  }
  document.getElementById('modalStudentUser').value = username.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 20);
});

async function crearEstudianteModal() {
  let grado = document.getElementById("modalStudentGrade").value;
  let nombre = document.getElementById("modalStudentName").value;
  let usuario = document.getElementById("modalStudentUser").value;
  let password = document.getElementById("modalStudentPassword").value;
  let btn = document.getElementById("modalBtnCreateStudent");
  
  if (!nombre || !usuario) {
    showAlert("❌ Completa el nombre y el usuario");
    return;
  }
  
  let originalText = btn.innerHTML;
  btn.innerHTML = "⏳...";
  btn.disabled = true;
  
  try {
    const res = await fetch('/api/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grado: grado,
        nombre: nombre,
        usuario: usuario,
        password: password || '123'
      })
    });
    
    const result = await res.json();
    if (result.success) {
      if (typeof confetti !== 'undefined') {
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      }
      btn.innerHTML = "✅";
      btn.style.background = "#10B981";
      
      loadStudents();
      
      setTimeout(() => {
        btn.innerHTML = originalText;
        btn.style.background = "";
        btn.disabled = false;
        closeCreateStudentModal();
      }, 1500);
    } else {
      showAlert("❌ Error al guardar: " + result.error);
      btn.innerHTML = originalText;
      btn.disabled = false;
    }
  } catch (error) {
    console.error(error);
    showAlert("❌ Error de red al crear estudiante");
    btn.innerHTML = originalText;
    btn.disabled = false;
  }
}

function mostrarEstudiantes() {
  let lista = document.getElementById("studentsList");
  lista.innerHTML = "";
  
  if (!estudiantes || estudiantes.length === 0) {
      lista.innerHTML = '<p style="color: var(--text-muted);">Aún no tienes estudiantes cargados.</p>';
      return;
  }
  
  let grupos = {};
  estudiantes.forEach((e) => {
    let grupoKey = e.group_name || e.grado;
    if (!grupos[grupoKey]) {
      grupos[grupoKey] = [];
    }
    grupos[grupoKey].push(e);
  });
  
  let html = '<div class="classrooms-list">';
  for (let grupo in grupos) {
    let studentCount = grupos[grupo].length;
    html += `
      <div class="classroom-item" onclick="openClassroomDetail('${grupo}')" style="cursor: pointer;">
          <div class="classroom-item-info">
              <div class="classroom-icon">🪐</div>
              <div class="classroom-details">
                  <h4>Aula ${grupo}</h4>
                  <p>${studentCount} estudiantes</p>
              </div>
          </div>
          <div class="classroom-arrow">›</div>
      </div>
    `;
  }
  html += '</div>';
  lista.innerHTML = html;
}

function agregarPregunta() {
  window.showQuestionModal((nuevaPregunta) => {
    preguntasTemp.push(nuevaPregunta);
    mostrarPreguntas();
  });
}

function mostrarPreguntas() {
  let lista = document.getElementById("questionsList");
  lista.innerHTML = "";
  if (preguntasTemp.length > 0) {
    lista.style.marginTop = "var(--space-md)";
    lista.style.marginBottom = "var(--space-md)";
  }
  preguntasTemp.forEach((p, index) => {
    lista.innerHTML += `
      <div class="classroom-item" style="cursor: default;">
        <div class="classroom-item-info">
          <div class="classroom-icon">❓</div>
          <div class="classroom-details">
            <h4 style="margin: 0 0 4px 0; color: var(--text-primary); font-size: var(--text-md);">${p.pregunta}</h4>
            <p style="margin: 0; color: var(--text-secondary); font-size: var(--text-sm);">Tipo: ${p.tipo === 'opcion' ? 'Opción Múltiple' : 'Abierta'}</p>
          </div>
        </div>
      </div>
    `;
  });
}

async function crearActividad() {
  let gradoBase = document.getElementById("activityTargetGrade").value;
  let targetGroupEl = document.getElementById("activityTargetGroup");
  let primaryGroupId = targetGroupEl ? targetGroupEl.value : "";
  let tipo = document.getElementById("activityType").value;
  let tema = document.getElementById("activityTheme").value.trim();
  
  if (!tema) {
    showAlert('❌ Escribe un tema para la actividad');
    return;
  }

  // Recolectar aulas destino
  let targetGroups = [];
  if (primaryGroupId) {
    targetGroups.push(Number(primaryGroupId));
  }

  const chkReplicate = document.getElementById("chkReplicateActivity");
  if (chkReplicate && chkReplicate.checked) {
    const checkBoxes = document.querySelectorAll('.replicate-group-chk:checked');
    checkBoxes.forEach(cb => {
      const val = Number(cb.value);
      if (!targetGroups.includes(val)) {
        targetGroups.push(val);
      }
    });
  }
  
  try {
    const res = await fetch('/api/activities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: tema,
        type: tipo,
        theme: `Grado ${gradoBase}`,
        grade: gradoBase,
        group_id: primaryGroupId ? Number(primaryGroupId) : null,
        target_groups: targetGroups,
        questions: preguntasTemp
      })
    });
    
    const result = await res.json();
    if (result.success) {
      // Limpiar formulario
      preguntasTemp = [];
      mostrarPreguntas();
      document.getElementById("activityTheme").value = "";
      if (chkReplicate) chkReplicate.checked = false;
      toggleReplicateCheckboxes();
      
      showAlert(`✅ Actividad "${tema}" guardada exitosamente`);
      
      // Si veníamos de un aula, refrescar su pestaña
      if (currentClassroomGroupName) {
        const grp = (window.todasLasAulas || []).find(g => g.name === currentClassroomGroupName);
        if (grp) loadClassroomActivities(currentClassroomGroupName, grp.id);
      }

      // Redirect to activities list
      loadActivities();
      loadDashboardStats();
      const activitiesLink = document.getElementById('navLinkActivities') || Array.from(document.querySelectorAll('.sidebar-link')).find(el => el.textContent.includes('Actividades'));
      if (activitiesLink) {
        showTeacherSection('viewActivitiesSection', activitiesLink);
      }
    } else {
      showAlert('❌ Error al guardar la actividad');
    }
  } catch (error) {
    console.error('Error:', error);
    showAlert('❌ Error de conexión');
  }
}

async function resetStudentProgress() {
  showConfirm("¿Estás seguro de que deseas reiniciar todo tu progreso? Volverás al Nivel 1.", async () => {
    try {
      const res = await fetch(`/api/students/${estudianteActual.id}/reset`, { method: 'POST' });
      if (res.ok) {
         estudianteActual.total_score = 0;
         estudianteActual.puntos = 0;
         estudianteActual.levelInfo = { level: 1, currentXP: 0, xpPerLevel: 30, progressPercent: 0 };
         updateStudentLevelUI(estudianteActual);
         mostrarPendientes();
         await loadStudentPerformance();
         showAlert("Tu progreso ha sido reiniciado con éxito.");
      } else {
         showAlert("Hubo un error al reiniciar el progreso.");
      }
    } catch (err) {
      console.error(err);
      showAlert("Error de conexión al reiniciar progreso.");
    }
  });
}

async function mostrarPendientes() {
  let contenedor = document.getElementById("studentActivities");
  if (!contenedor) return;
  contenedor.innerHTML = "<p style='color: var(--text-muted);'>Cargando actividades...</p>";
  
  if (!estudianteActual) return;
  
  let gradoAlumnoBase = estudianteActual.group_name ? estudianteActual.group_name.charAt(0) : "4";
  
  try {
    const res = await fetch('/api/activities');
    const todasActividades = await res.json();
    window.actividadesEstudiante = todasActividades;
    
    contenedor.innerHTML = "";
    
    // Filtrar actividades del aula del estudiante y que no sean Práctica (van aparte)
    const actividadesFiltradas = todasActividades.filter(a => {
      const noEsPractica = a.type !== 'Práctica';
      if (!noEsPractica) return false;

      // Si la actividad tiene aulas específicas asignadas
      const hasSpecificClassroom = (a.target_groups && a.target_groups.length > 0) || a.group_id;
      if (hasSpecificClassroom) {
        const matchesGroup = a.group_id === estudianteActual.group_id || 
                             (Array.isArray(a.target_groups) && a.target_groups.includes(estudianteActual.group_id));
        return matchesGroup;
      }

      // Si es una actividad general sin aula puntual, validar por grado
      const gradoActividad = a.theme ? a.theme.replace('Grado ', '') : '';
      const coincideGrado = gradoActividad === gradoAlumnoBase || !gradoActividad || a.theme === 'General' || !a.theme.includes('Grado');
      return coincideGrado;
    });
    
    if (actividadesFiltradas.length === 0) {
      contenedor.innerHTML = "<p style='color: var(--text-muted); padding: 20px 0;'>No hay evaluaciones o talleres pendientes para tu aula.</p>";
      return;
    }
    
    actividadesFiltradas.forEach((a) => {
      contenedor.innerHTML += `
        <div class="card" style="background: linear-gradient(145deg, #182252, #10173b); border: 1px solid rgba(99, 102, 241, 0.25); border-radius: 18px; padding: 18px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; text-align: left;">
          <div>
            <h3 style="margin: 0 0 6px; font-size: 1.05rem; color: #ffffff;">${a.title}</h3>
            <div style="display: flex; gap: 8px; align-items: center;">
              <span style="background: rgba(59, 130, 246, 0.2); color: #93c5fd; padding: 2px 8px; border-radius: 10px; font-size: 0.75rem; font-weight: 600;">${a.type || 'Actividad'}</span>
              <span style="color: #ffd700; font-size: 0.75rem; font-weight: 600;">⏳ Disponible</span>
            </div>
          </div>
          <button class="btn btn--sm" style="border-radius: 20px; padding: 8px 18px; font-weight: 700;" onclick="realizarActividad(${a.id})">REALIZAR</button>
        </div>
      `;
    });
  } catch (error) {
    console.error('Error cargando actividades:', error);
    contenedor.innerHTML = "<p style='color: var(--color-danger);'>❌ Error al cargar actividades</p>";
  }
}

async function realizarActividad(actId) {
  if (!estudianteActual) return;
  
  let actividad = (window.actividadesEstudiante || []).find(a => a.id === actId);
  if (!actividad) {
    try {
      const res = await fetch('/api/activities');
      const all = await res.json();
      window.actividadesEstudiante = all;
      actividad = all.find(a => a.id === actId);
    } catch(e) {}
  }
  
  if (!actividad) {
    showAlert("❌ No se pudo cargar la actividad seleccionada.");
    return;
  }
  
  let seccion = estudianteActual.group_name ? estudianteActual.group_name.charAt(1) : "A";
  
  window.playActivity(actividad, seccion, async (puntosObtenidos) => {
    try {
      const xpRes = await fetch(`/api/students/${estudianteActual.id}/add-xp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          xp: puntosObtenidos,
          activity_id: actividad.id
        })
      });
      const xpData = await xpRes.json();
      if (xpData.success) {
        estudianteActual.total_score = xpData.total_score;
        estudianteActual.levelInfo = xpData.levelInfo;
        updateStudentLevelUI(estudianteActual);
        if (document.getElementById('studentProfileView') && document.getElementById('studentProfileView').style.display !== 'none') {
          loadStudentPerformance();
        }
        showAlert(`🎉 ¡Felicitaciones! Has completado "${actividad.title}" y sumaste ${puntosObtenidos} XP.`);
      }
    } catch (err) {
      console.error('Error guardando XP:', err);
    }
  });
}

function showTeacherSection(id, btnElement) {
  document.querySelectorAll("#teacherPanel .section").forEach((sec) => {
    sec.classList.remove("show");
    sec.style.display = "none";
  });
  const target = document.getElementById(id);
  if (target) {
    target.classList.add("show");
    target.style.display = "block";
  }
  
  if (btnElement) {
    document.querySelectorAll(".sidebar-link").forEach(btn => btn.classList.remove("active"));
    btnElement.classList.add("active");
  }
  
  if (id === "gradesSection") {
    mostrarNotas();
  } else if (id === "viewActivitiesSection") {
    loadActivities();
  } else if (id === "practicesSection") {
    loadPractices();
  } else if (id === "dashboardHome") {
    loadDashboardStats();
  }
}

function mostrarNotas() {
  let lista = document.getElementById("gradesList");
  lista.innerHTML = "";
  
  if (estudiantes.length === 0) {
    lista.innerHTML = "<p>No hay estudiantes registrados aún.</p>";
    return;
  }

  // Ordenar por grupo y luego por puntos descendente
  let estudiantesOrdenados = [...estudiantes].sort((a, b) => {
    let grupoA = a.group_name || a.grado;
    let grupoB = b.group_name || b.grado;
    if (grupoA === grupoB) {
      return (b.total_score || b.puntos || 0) - (a.total_score || a.puntos || 0);
    }
    return grupoA.localeCompare(grupoB);
  });

  estudiantesOrdenados.forEach((e) => {
    let pts = e.total_score || e.puntos || 0;
    let nombre = e.full_name || e.nombre;
    let grupo = e.group_name || e.grado;
    let usuario = e.username || e.usuario;
    lista.innerHTML += `
      <div class="grade-card">
        <div>
          <h3>👤 ${nombre}</h3>
          <p>📚 Grado: ${grupo} | 🆔 ${usuario}</p>
        </div>
        <div class="score-badge">
          ${pts} pts
        </div>
      </div>
    `;
  });
}

// Función unificada para cargar examen JSON
async function importJsonExam() {
    const jsonInput = document.getElementById('jsonExamInput');
    const titleInput = document.getElementById('examTitle');
    const grade = document.getElementById('activityTargetGrade').value;
    const uploadBtn = document.getElementById('importExamBtn');
    const btnText = document.getElementById('importBtnText');
    const spinner = document.getElementById('importSpinner');
    
    if (!jsonInput.value.trim()) {
        showAlert('❌ Pega el JSON del examen');
        return;
    }
    
    // Mostrar loader
    uploadBtn.disabled = true;
    btnText.textContent = 'CARGANDO...';
    spinner.style.display = 'inline-block';
    
    try {
        const examData = JSON.parse(jsonInput.value);
        
        // Aceptar array directo o objeto con questions
        const questions = Array.isArray(examData) ? examData : examData.questions;
        
        if (!questions || !Array.isArray(questions)) {
            throw new Error('El JSON debe ser un array de preguntas o tener una propiedad "questions"');
        }
        
        const title = titleInput.value.trim() || 'Examen sin título';
        
        const res = await fetch('/api/exams', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: title,
                grade: grade,
                questions: questions
            })
        });
        
        const result = await res.json();
        
        // Resetear UI
        uploadBtn.disabled = false;
        btnText.textContent = 'CARGAR EXAMEN';
        spinner.style.display = 'none';
        
        if (result.success) {
            showAlert(`✅ "${title}" cargado con ${result.questions_count} preguntas`);
            jsonInput.value = '';
            titleInput.value = '';
        } else {
            showAlert(`❌ ${result.error || 'Error al cargar'}`);
        }
    } catch (error) {
        uploadBtn.disabled = false;
        btnText.textContent = 'CARGAR EXAMEN';
        spinner.style.display = 'none';
        
        console.error('Error:', error);
        showAlert('❌ Error: ' + error.message);
    }
}

async function loadActivities() {
    const container = document.getElementById('activitiesList');
    container.innerHTML = '<p>Cargando actividades...</p>';
    
    try {
        const res = await fetch('/api/activities');
        const activities = await res.json();
        
        if (activities.length === 0) {
            container.innerHTML = '<p>No hay actividades cargadas aún.</p>';
            return;
        }
        
        let html = '';
        activities.forEach(act => {
            const icono = act.type === 'Examen' ? '📝' : (act.type === 'Quiz' ? '⏱️' : (act.type === 'Taller' ? '🛠️' : '🧩'));
            const qCount = act.preguntas ? act.preguntas.length : 0;
            const aulaBadge = act.target_group_names && act.target_group_names.length > 0 
                ? `<span style="background: rgba(16, 185, 129, 0.2); color: #6ee7b7; padding: 2px 8px; border-radius: 8px; font-weight: 600;">🪐 ${act.target_group_names.join(', ')}</span>`
                : (act.primary_group_name 
                    ? `<span style="background: rgba(16, 185, 129, 0.2); color: #6ee7b7; padding: 2px 8px; border-radius: 8px; font-weight: 600;">🪐 ${act.primary_group_name}</span>`
                    : `<span style="background: rgba(255, 255, 255, 0.08); color: var(--text-muted); padding: 2px 8px; border-radius: 8px; font-weight: 500;">🪐 Todas las aulas</span>`);

            html += `
                <div class="classroom-item" style="cursor: default; align-items: center; margin-bottom: var(--space-md); flex-wrap: wrap; gap: 12px;">
                    <div class="classroom-item-info" style="min-width: 240px; flex: 1;">
                        <div class="classroom-icon">${icono}</div>
                        <div class="classroom-details">
                            <h4 style="margin: 0 0 4px 0; color: var(--text-primary); font-size: var(--text-md);">${act.title}</h4>
                            <p style="margin: 0; color: var(--text-secondary); font-size: var(--text-sm); display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                                <span style="background: rgba(99, 102, 241, 0.2); color: #93c5fd; padding: 2px 8px; border-radius: 8px; font-weight: 600;">${act.type || 'Actividad'}</span>
                                ${aulaBadge}
                                <span>• 📚 ${act.theme || 'Sin grado'}</span>
                                <span>• ❓ ${qCount} pregunta${qCount === 1 ? '' : 's'}</span>
                                <span>• 📅 ${new Date(act.created_at).toLocaleDateString()}</span>
                            </p>
                        </div>
                    </div>
                    <div style="display: flex; gap: var(--space-sm); flex-wrap: wrap;">
                        <button class="btn btn--sm" style="padding: var(--space-sm) var(--space-md); background: rgba(99, 102, 241, 0.25); color: #818cf8; border: 1px solid rgba(99, 102, 241, 0.4);" onclick="openReviewActivityModal(${act.id})">👁️ Revisar</button>
                        <button class="btn btn--outline btn--sm" style="padding: var(--space-sm) var(--space-md);" onclick="openEditActivityModal(${act.id}, '${act.title.replace(/'/g, "\\'")}', '${act.type}', '${act.theme}', ${act.group_id || 'null'})">✏️ Editar</button>
                        <button class="btn btn--secondary btn--sm" style="padding: var(--space-sm) var(--space-md); background: rgba(255,50,50,0.2); color: #ff5555;" onclick="deleteActivity(${act.id})">🗑️ Eliminar</button>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
    } catch (error) {
        console.error('Error cargando actividades:', error);
        container.innerHTML = '<p>❌ Error al cargar actividades</p>';
    }
}

function showCreatePractice() {
    const container = document.getElementById('createPracticeContainer');
    container.style.display = container.style.display === 'none' ? 'block' : 'none';
}

function agregarPreguntaPractica() {
    window.showQuestionModal((nuevaPregunta) => {
        preguntasPracticaTemp.push(nuevaPregunta);
        
        let lista = document.getElementById('practiceQuestionsList');
        lista.innerHTML = '';
        preguntasPracticaTemp.forEach((p) => {
            lista.innerHTML += `
                <div class="classroom-item" style="cursor: default; padding: var(--space-sm);">
                    <div class="classroom-item-info">
                        <div class="classroom-icon">❓</div>
                        <div class="classroom-details">
                            <h4 style="margin: 0; color: var(--text-primary); font-size: var(--text-md);">${p.pregunta}</h4>
                        </div>
                    </div>
                </div>
            `;
        });
    });
}

async function crearPractica() {
    let gradoBase = document.getElementById("practiceTargetGrade").value;
    let tema = document.getElementById("practiceTheme").value;
    
    if (!tema) {
        showAlert('❌ Escribe un tema para la práctica');
        return;
    }
    
    try {
        const res = await fetch('/api/activities', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: tema,
                type: 'Práctica',
                theme: `Grado ${gradoBase}`,
                grade: gradoBase,
                questions: preguntasPracticaTemp
            })
        });
        
        const result = await res.json();
        if (result.success) {
            preguntasPracticaTemp = [];
            document.getElementById('practiceQuestionsList').innerHTML = '';
            document.getElementById("practiceTheme").value = "";
            document.getElementById('createPracticeContainer').style.display = 'none';
            showAlert(`✅ Módulo de práctica "${tema}" guardado`);
            loadPractices();
        } else {
            showAlert('❌ Error al guardar la práctica');
        }
    } catch (error) {
        console.error('Error:', error);
        showAlert('❌ Error de conexión');
    }
}

async function loadPractices() {
    const container = document.getElementById('practicesList');
    container.innerHTML = '<p>Cargando prácticas...</p>';
    
    try {
        const res = await fetch('/api/activities');
        const activities = await res.json();
        
        const practicas = activities.filter(a => a.type === 'Práctica');
        
        if (practicas.length === 0) {
            container.innerHTML = '<p>No hay módulos de práctica configurados.</p>';
            return;
        }
        
        let html = '';
        practicas.forEach(act => {
            html += `
                <div class="classroom-item" style="cursor: default; align-items: center; margin-bottom: var(--space-md);">
                    <div class="classroom-item-info">
                        <div class="classroom-icon">🎮</div>
                        <div class="classroom-details">
                            <h4 style="margin: 0 0 4px 0; color: var(--text-primary); font-size: var(--text-md);">${act.title}</h4>
                            <p style="margin: 0; color: var(--text-secondary); font-size: var(--text-sm);">📚 ${act.theme || 'Sin grado'}</p>
                        </div>
                    </div>
                    <div style="display: flex; gap: var(--space-sm);">
                        <button class="btn btn--outline btn--sm" style="padding: var(--space-sm) var(--space-md);" onclick="openEditActivityModal(${act.id}, '${act.title.replace(/'/g, "\\'")}', '${act.type}', '${act.theme}')">✏️ Editar</button>
                        <button class="btn btn--secondary btn--sm" style="padding: var(--space-sm) var(--space-md); background: rgba(255,50,50,0.2); color: #ff5555;" onclick="deleteActivity(${act.id})">🗑️ Eliminar</button>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
    } catch (error) {
        console.error('Error cargando prácticas:', error);
        container.innerHTML = '<p>❌ Error al cargar prácticas</p>';
    }
}

// Cargar estudiantes al iniciar si estamos en el panel del profesor
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('teacherPanel')) {
        loadStudents();
        loadDashboardStats();
    }
});

async function loadDashboardStats() {
    try {
        const [groupsRes, studentsRes, activitiesRes] = await Promise.all([
            fetch('/api/groups'),
            fetch('/api/students'),
            fetch('/api/activities')
        ]);
        
        const groups = await groupsRes.json();
        const students = await studentsRes.json();
        const activities = await activitiesRes.json();
        
        window.todasLasAulas = groups;
        populateGroupSelectors(groups);
        
        const exams = activities.filter(a => a.type === 'Examen');
        
        document.getElementById('statGroupsCount').textContent = groups.length;
        document.getElementById('statStudentsCount').textContent = students.length;
        document.getElementById('statActivitiesCount').textContent = activities.length;
        document.getElementById('statExamsCount').textContent = exams.length;
        
        const list = document.getElementById('classroomsList');
        if (list) {
            list.innerHTML = '';
            
            if (groups.length === 0) {
                list.innerHTML = '<p style="color: var(--text-muted);">Aún no tienes aulas creadas.</p>';
            } else {
                groups.forEach(g => {
                    list.innerHTML += `
                    <div class="classroom-item" onclick="openClassroomDetail('${g.name}')" style="cursor: pointer;">
                        <div class="classroom-item-info">
                            <div class="classroom-icon">🪐</div>
                            <div class="classroom-details">
                                <h4>${g.name}</h4>
                                <p>Código: ${g.code || 'N/A'} • ${g.student_count || 0} estudiantes</p>
                            </div>
                        </div>
                        <div class="classroom-arrow">›</div>
                    </div>
                    `;
                });
            }
        }
    } catch (error) {
        console.error('Error cargando estadísticas:', error);
    }
}

function promptCreateClassroom() {
    const modal = document.getElementById('createClassroomModal');
    const input = document.getElementById('newClassroomName');
    input.value = '';
    modal.classList.add('active');
    input.focus();
}

function closeCreateClassroomModal() {
    document.getElementById('createClassroomModal').classList.remove('active');
}

async function submitCreateClassroom() {
    const nombre = document.getElementById('newClassroomName').value.trim();
    if (!nombre) {
        showAlert('❌ Por favor, ingresa un nombre para el aula.');
        return;
    }
    
    closeCreateClassroomModal();
    
    try {
        const res = await fetch('/api/groups', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: nombre })
        });
        const result = await res.json();
        
        if (result.success) {
            showAlert(`✅ Aula ${result.group.name} creada. Código: ${result.group.code}`);
            loadDashboardStats();
        } else {
            showAlert('❌ Error al crear el aula: ' + result.error);
        }
    } catch (error) {
        console.error(error);
        showAlert('❌ Error de conexión');
    }
}

function selectActivityType(type, element) {
    // Actualizar campo oculto
    document.getElementById('activityType').value = type;
    
    // Remover clase active de todas las cards
    const cards = document.querySelectorAll('.activity-type-cards .type-card');
    cards.forEach(card => card.classList.remove('active'));
    
    // Agregar clase active a la card clickeada
    element.classList.add('active');
}

async function deleteActivity(id) {
    if (!confirm('¿Estás seguro de que quieres eliminar esta actividad? Esta acción no se puede deshacer.')) return;
    
    try {
        const res = await fetch(`/api/activities/${id}`, { method: 'DELETE' });
        const result = await res.json();
        if (result.success) {
            showAlert('✅ Actividad eliminada');
            loadActivities();
            loadDashboardStats();
        } else {
            showAlert('❌ Error: ' + result.error);
        }
    } catch (error) {
        console.error(error);
        showAlert('❌ Error de conexión');
    }
}

function openEditActivityModal(id, title, type, theme, groupId) {
    document.getElementById('editActivityId').value = id;
    document.getElementById('editActivityTitle').value = title;
    document.getElementById('editActivityType').value = type;
    document.getElementById('editActivityTheme').value = theme;
    
    const groupSelect = document.getElementById('editActivityTargetGroup');
    if (groupSelect) {
        groupSelect.value = (groupId !== undefined && groupId !== null) ? groupId : '';
    }
    
    const modal = document.getElementById('editActivityModal');
    modal.classList.add('active');
    document.getElementById('editActivityTitle').focus();
}

function closeEditActivityModal() {
    document.getElementById('editActivityModal').classList.remove('active');
}

async function submitEditActivity() {
    const id = document.getElementById('editActivityId').value;
    const title = document.getElementById('editActivityTitle').value.trim();
    const type = document.getElementById('editActivityType').value;
    const theme = document.getElementById('editActivityTheme').value;
    const groupSelect = document.getElementById('editActivityTargetGroup');
    const groupId = groupSelect ? groupSelect.value : null;
    
    if (!title) {
        showAlert('❌ Por favor, ingresa el título.');
        return;
    }
    
    closeEditActivityModal();
    
    try {
        const payload = { 
            title, 
            type, 
            theme,
            group_id: groupId ? Number(groupId) : null,
            target_groups: groupId ? [Number(groupId)] : []
        };
        
        const res = await fetch(`/api/activities/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await res.json();
        
        if (result.success) {
            showAlert('✅ Actividad actualizada con éxito');
            loadActivities();
            loadPractices();
            if (currentClassroomGroupName) {
                const grp = (window.todasLasAulas || []).find(g => g.name === currentClassroomGroupName);
                if (grp) loadClassroomActivities(currentClassroomGroupName, grp.id);
            }
        } else {
            showAlert('❌ Error: ' + result.error);
        }
    } catch (error) {
        console.error(error);
        showAlert('❌ Error de conexión');
    }
}

let currentClassroomGroupName = null;

async function openClassroomDetail(groupName) {
    currentClassroomGroupName = groupName;
    const groupObj = (window.todasLasAulas || []).find(g => g.name === groupName);
    const groupId = groupObj ? groupObj.id : null;
    
    document.getElementById('classroomDetailTitle').innerText = '🪐 Aula ' + groupName;
    
    const headerActions = document.getElementById('classroomDetailHeaderActions');
    if (headerActions) {
        headerActions.innerHTML = `
            <button class="btn btn--sm" style="border-radius: 20px; font-weight: 700; background: linear-gradient(135deg, #6366f1, #4f46e5);" onclick="createActivityForGroup(${groupId}, '${groupName}')">
                ➕ Crear Actividad para ${groupName}
            </button>
            <button class="btn btn--secondary btn--sm" style="border-radius: 20px;" onclick="openCreateStudentModal('${groupName}')">
                ➕ Nuevo Estudiante
            </button>
            <button class="btn btn--outline btn--sm" style="border-color: rgba(255, 92, 122, 0.4); color: #ff5c7a; border-radius: 20px; font-size: 0.8rem;" onclick="resetGroupProgress('${groupName}')">
                🔄 Reiniciar Progreso
            </button>
            <button class="btn btn--secondary btn--sm" style="border-radius: 20px;" onclick="showTeacherSection('dashboardHome', document.getElementById('navLinkHome'))">
                ⬅️ Volver
            </button>
        `;
    }
    
    // Hide all sections and show this one
    document.querySelectorAll('.section').forEach(sec => sec.classList.remove('show'));
    document.querySelectorAll('.section').forEach(sec => sec.style.display = 'none');
    document.getElementById('classroomDetailSection').style.display = 'block';
    document.getElementById('classroomDetailSection').classList.add('show');
    
    // Remove active class from sidebar
    document.querySelectorAll('.sidebar-link').forEach(link => link.classList.remove('active'));
    
    // Default to students tab
    switchClassroomTab('students');

    // 1. Renderizar Estudiantes del Aula
    const content = document.getElementById('classroomDetailContent');
    const studentsInGroup = (estudiantes || []).filter(e => e.group_name === groupName || e.grado === groupName);
    const countEl = document.getElementById('classroomStudentsCount');
    if (countEl) countEl.innerText = studentsInGroup.length;
    
    if (studentsInGroup.length === 0) {
        content.innerHTML = `
            <div style="text-align: center; padding: 40px 20px; color: var(--text-secondary);">
                <div style="font-size: 2.5rem; margin-bottom: 10px;">👥</div>
                <p style="margin: 0 0 15px 0;">Esta aula aún no tiene estudiantes registrados.</p>
                <button class="btn btn--sm" onclick="openCreateStudentModal('${groupName}')">➕ Agregar primer estudiante</button>
            </div>
        `;
    } else {
        let html = '<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: var(--space-md);">';
        studentsInGroup.forEach(s => {
            let name = s.full_name || s.nombre;
            let user = s.username || s.usuario;
            let pass = s.password || 'N/A';
            let xp = s.total_score || 0;
            let levelName = s.levelInfo ? s.levelInfo.name : 'Principiante';
            let levelIcon = s.levelInfo ? s.levelInfo.icon : '🌱';
            
            html += `
            <div class="card" style="display: flex; flex-direction: column; gap: var(--space-sm);">
                <h3 style="margin: 0; color: var(--color-primary);"><span style="font-size: 1.2rem;">👤</span> ${name}</h3>
                <div style="font-size: var(--text-sm); color: var(--text-muted);">
                    <p style="margin: 0;"><b>Usuario:</b> ${user} &nbsp;|&nbsp; <b>Contraseña:</b> ${pass}</p>
                    <p style="margin: 0; margin-top: 4px;"><b>Progreso:</b> ${levelIcon} ${levelName} (${xp} XP)</p>
                </div>
                <button class="btn btn--secondary btn--sm" style="margin-top: auto;" onclick="showStudentProgress(${s.id}, '${name.replace(/'/g, "\\'")}')">📄 Ver Actividades y Exámenes</button>
            </div>
            `;
        });
        html += '</div>';
        content.innerHTML = html;
    }

    // 2. Cargar Actividades específicas de esta aula
    await loadClassroomActivities(groupName, groupId);
}

function switchClassroomTab(tab) {
    const stView = document.getElementById('classroomStudentsView');
    const actView = document.getElementById('classroomActivitiesView');
    const stBtn = document.getElementById('tabClassroomStudentsBtn');
    const actBtn = document.getElementById('tabClassroomActivitiesBtn');
    
    if (tab === 'students') {
        if (stView) stView.style.display = 'block';
        if (actView) actView.style.display = 'none';
        if (stBtn) stBtn.className = 'btn btn--sm active';
        if (actBtn) actBtn.className = 'btn btn--outline btn--sm';
    } else {
        if (stView) stView.style.display = 'none';
        if (actView) actView.style.display = 'block';
        if (stBtn) stBtn.className = 'btn btn--outline btn--sm';
        if (actBtn) actBtn.className = 'btn btn--sm active';
    }
}

async function loadClassroomActivities(groupName, groupId) {
    const container = document.getElementById('classroomActivitiesView');
    if (!container) return;
    container.innerHTML = '<div class="spinner" style="display:block; margin: 30px auto;"></div>';
    
    try {
        const res = await fetch('/api/activities');
        const allActivities = await res.json();
        
        // Filtrar actividades asociadas a esta aula
        const classroomActivities = allActivities.filter(a => {
            if (groupId && (a.group_id === groupId || (Array.isArray(a.target_groups) && a.target_groups.includes(groupId)))) {
                return true;
            }
            return false;
        });

        const actCountEl = document.getElementById('classroomActivitiesCount');
        if (actCountEl) actCountEl.innerText = classroomActivities.length;

        if (classroomActivities.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 45px 20px; color: var(--text-secondary); background: rgba(255,255,255,0.02); border-radius: var(--radius-lg); border: 1px dashed var(--color-border);">
                    <div style="font-size: 3rem; margin-bottom: 12px;">📋</div>
                    <h3 style="margin: 0 0 8px 0; color: #fff;">Sin actividades exclusivas para Aula ${groupName}</h3>
                    <p style="margin: 0 0 20px 0; font-size: 0.95rem;">Crea evaluaciones, talleres prácticos o quices dirigidos puntualmente a este curso.</p>
                    <button class="btn btn--sm" style="border-radius: 20px; padding: 8px 20px; font-weight: 700;" onclick="createActivityForGroup(${groupId}, '${groupName}')">
                        ➕ Crear Actividad / Taller para ${groupName}
                    </button>
                </div>
            `;
            return;
        }

        let html = '<div style="display: flex; flex-direction: column; gap: 12px;">';
        classroomActivities.forEach(act => {
            const icono = act.type === 'Examen' ? '📝' : (act.type === 'Quiz' ? '⏱️' : (act.type === 'Taller' ? '🛠️' : '🧩'));
            const qCount = act.preguntas ? act.preguntas.length : 0;
            const isShared = act.target_group_names && act.target_group_names.length > 1;
            const scopeBadge = isShared 
                ? `<span style="background: rgba(59, 130, 246, 0.2); color: #93c5fd; padding: 2px 8px; border-radius: 8px; font-size: 0.75rem; font-weight: 600;">🤝 Compartida: ${act.target_group_names.join(', ')}</span>`
                : `<span style="background: rgba(16, 185, 129, 0.2); color: #6ee7b7; padding: 2px 8px; border-radius: 8px; font-size: 0.75rem; font-weight: 600;">🔒 Exclusiva de ${groupName}</span>`;

            html += `
                <div class="classroom-item" style="cursor: default; align-items: center; margin-bottom: 0; flex-wrap: wrap; gap: 12px;">
                    <div class="classroom-item-info" style="min-width: 240px; flex: 1;">
                        <div class="classroom-icon">${icono}</div>
                        <div class="classroom-details">
                            <h4 style="margin: 0 0 4px 0; color: var(--text-primary); font-size: var(--text-md);">${act.title}</h4>
                            <p style="margin: 0; color: var(--text-secondary); font-size: var(--text-sm); display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                                <span style="background: rgba(99, 102, 241, 0.2); color: #93c5fd; padding: 2px 8px; border-radius: 8px; font-weight: 600;">${act.type || 'Actividad'}</span>
                                ${scopeBadge}
                                <span>• ❓ ${qCount} preg.</span>
                                <span>• 📅 ${new Date(act.created_at).toLocaleDateString()}</span>
                            </p>
                        </div>
                    </div>
                    <div style="display: flex; gap: var(--space-sm); flex-wrap: wrap;">
                        <button class="btn btn--sm" style="padding: var(--space-sm) var(--space-md); background: rgba(99, 102, 241, 0.25); color: #818cf8; border: 1px solid rgba(99, 102, 241, 0.4);" onclick="openReviewActivityModal(${act.id})">👁️ Revisar</button>
                        <button class="btn btn--outline btn--sm" style="padding: var(--space-sm) var(--space-md);" onclick="openEditActivityModal(${act.id}, '${act.title.replace(/'/g, "\\'")}', '${act.type}', '${act.theme}', ${act.group_id})">✏️ Editar</button>
                        <button class="btn btn--secondary btn--sm" style="padding: var(--space-sm) var(--space-md); background: rgba(255,50,50,0.2); color: #ff5555;" onclick="deleteActivity(${act.id})">🗑️ Eliminar</button>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        container.innerHTML = html;
    } catch(err) {
        console.error('Error cargando actividades del aula:', err);
        container.innerHTML = '<p style="color: var(--color-danger);">❌ Error al cargar actividades del aula.</p>';
    }
}

function createActivityForGroup(groupId, groupName) {
    const link = document.getElementById('navLinkCreateActivity') || Array.from(document.querySelectorAll('.sidebar-link')).find(el => el.textContent.includes('Crear'));
    showTeacherSection('activitiesSection', link);
    
    const select = document.getElementById('activityTargetGroup');
    if (select) {
        select.value = groupId;
        onActivityTargetGroupChange();
    }
    
    const themeInput = document.getElementById('activityTheme');
    if (themeInput) {
        themeInput.focus();
        themeInput.placeholder = `Ej: Taller práctico para Aula ${groupName}`;
    }
    
    showAlert(`📍 Asignando actividad para Aula ${groupName}`);
}

function populateGroupSelectors(groups) {
    if (!groups || !Array.isArray(groups)) return;
    
    // 1. Selector en formulario de creación
    const targetGroupSelect = document.getElementById('activityTargetGroup');
    if (targetGroupSelect) {
        const currentVal = targetGroupSelect.value;
        let html = '<option value="">Todas las aulas (General)</option>';
        groups.forEach(g => {
            html += `<option value="${g.id}">Aula ${g.name}</option>`;
        });
        targetGroupSelect.innerHTML = html;
        if (currentVal) targetGroupSelect.value = currentVal;
    }

    // 2. Selector en modal de edición
    const editGroupSelect = document.getElementById('editActivityTargetGroup');
    if (editGroupSelect) {
        const currentVal = editGroupSelect.value;
        let html = '<option value="">Todas las aulas (General)</option>';
        groups.forEach(g => {
            html += `<option value="${g.id}">Aula ${g.name}</option>`;
        });
        editGroupSelect.innerHTML = html;
        if (currentVal) editGroupSelect.value = currentVal;
    }

    // 3. Checkboxes para replicar a otros cursos
    const repList = document.getElementById('replicateGroupsList');
    if (repList) {
        let repHtml = '';
        groups.forEach(g => {
            repHtml += `
                <label class="replicate-chk-item" style="display: inline-flex; align-items: center; gap: 6px; background: rgba(255,255,255,0.06); padding: 6px 12px; border-radius: 8px; font-size: 0.85rem; cursor: pointer;" id="repItem_${g.id}">
                    <input type="checkbox" value="${g.id}" class="replicate-group-chk" style="width: auto; margin: 0;" />
                    <span>Aula ${g.name}</span>
                </label>
            `;
        });
        repList.innerHTML = repHtml;
    }
}

function onActivityTargetGroupChange() {
    const select = document.getElementById('activityTargetGroup');
    const selectedGroupId = select ? select.value : "";
    const repSection = document.getElementById('activityReplicateSection');
    
    if (selectedGroupId && window.todasLasAulas) {
        const groupObj = window.todasLasAulas.find(g => String(g.id) === String(selectedGroupId));
        if (groupObj) {
            const gradeLetter = groupObj.name.charAt(0);
            const gradeSelect = document.getElementById('activityTargetGrade');
            if (gradeSelect && (gradeLetter === '4' || gradeLetter === '5')) {
                gradeSelect.value = gradeLetter;
            }
        }
        if (repSection) repSection.style.display = 'block';
    } else {
        if (repSection) repSection.style.display = 'none';
        const chk = document.getElementById('chkReplicateActivity');
        if (chk) chk.checked = false;
        toggleReplicateCheckboxes();
    }
    
    if (window.todasLasAulas) {
        window.todasLasAulas.forEach(g => {
            const item = document.getElementById(`repItem_${g.id}`);
            if (item) {
                if (String(g.id) === String(selectedGroupId)) {
                    item.style.display = 'none';
                    const chk = item.querySelector('input');
                    if (chk) chk.checked = false;
                } else {
                    item.style.display = 'inline-flex';
                }
            }
        });
    }
}

function toggleReplicateCheckboxes() {
    const chk = document.getElementById('chkReplicateActivity');
    const list = document.getElementById('replicateGroupsList');
    if (list) {
        list.style.display = (chk && chk.checked) ? 'flex' : 'none';
    }
}

async function showStudentProgress(studentId, studentName) {
    document.getElementById('studentProgressModal').style.display = 'flex';
    document.getElementById('progressModalTitle').innerHTML = `📈 Progreso: ${studentName}`;
    const content = document.getElementById('progressModalContent');
    const footer = document.getElementById('progressModalFooter');
    content.innerHTML = '<div class="spinner" style="display:block; margin: 20px auto;"></div>';
    
    if (footer) {
        footer.innerHTML = `
            <button class="btn btn--secondary btn--sm" style="background: rgba(255, 92, 122, 0.15); color: #ff5c7a; border: 1px solid rgba(255, 92, 122, 0.3); border-radius: 20px; padding: 6px 14px; font-size: 0.8rem;" onclick="teacherResetStudentProgress(${studentId}, '${studentName.replace(/'/g, "\\'")}')">
                🔄 Reiniciar Todo el Progreso del Estudiante
            </button>
        `;
    }
    
    try {
        const res = await fetch(`/api/students/${studentId}/attempts`);
        const data = await res.json();
        
        if (data.success) {
            if (data.attempts.length === 0) {
                content.innerHTML = '<p style="text-align:center; color: var(--text-muted); margin-top: 20px;">Este estudiante aún no ha completado actividades.</p>';
            } else {
                let html = '<div style="display: flex; flex-direction: column; gap: 10px;">';
                data.attempts.forEach(a => {
                    const date = new Date(a.completed_at).toLocaleString();
                    const icon = a.type === 'Examen' ? '📝' : '🎮';
                    html += `
                        <div style="background: var(--bg-card); padding: 10px 15px; border-radius: 8px; border-left: 4px solid var(--color-primary); display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <h4 style="margin: 0;">${icon} ${a.title}</h4>
                                <span style="font-size: 12px; color: var(--text-muted);">${date}</span>
                            </div>
                            <div style="font-weight: bold; color: var(--color-primary);">+${a.score} XP</div>
                        </div>
                    `;
                });
                html += '</div>';
                content.innerHTML = html;
            }
        } else {
            content.innerHTML = '<p>Error cargando historial.</p>';
        }
    } catch (err) {
        content.innerHTML = '<p>Error de conexión.</p>';
    }
}

async function teacherResetStudentProgress(studentId, studentName) {
    if (!confirm(`¿Estás seguro de que deseas reiniciar TODO el progreso y puntajes de ${studentName}? Volverá a Nivel 1 con 0 puntos.`)) return;
    try {
        const res = await fetch(`/api/students/${studentId}/reset`, { method: 'POST' });
        if (res.ok) {
            showAlert(`✅ Progreso de ${studentName} reiniciado con éxito.`);
            await showStudentProgress(studentId, studentName);
            loadStudents();
            loadDashboardStats();
        } else {
            showAlert('❌ Error al reiniciar progreso del estudiante.');
        }
    } catch(err) {
        console.error(err);
        showAlert('❌ Error de conexión al reiniciar.');
    }
}

async function resetGroupProgress(groupName) {
    if (!confirm(`⚠️ ATENCIÓN: ¿Estás seguro de que deseas reiniciar el progreso de TODOS los estudiantes del Aula ${groupName}? Sus puntajes e intentos volverán a 0.`)) return;
    try {
        const res = await fetch(`/api/groups/${encodeURIComponent(groupName)}/reset`, { method: 'POST' });
        const data = await res.json();
        if (data.success) {
            showAlert(`✅ ${data.message || 'Progreso del aula reiniciado'}`);
            await loadStudents();
            openClassroomDetail(groupName);
            loadDashboardStats();
        } else {
            showAlert('❌ Error al reiniciar el aula: ' + (data.error || ''));
        }
    } catch(err) {
        console.error(err);
        showAlert('❌ Error de conexión al reiniciar el aula.');
    }
}

let currentReviewActivity = null;

async function openReviewActivityModal(id) {
    const modal = document.getElementById('reviewActivityModal');
    if (!modal) return;
    
    modal.classList.add('active');
    modal.style.display = 'flex';
    
    document.getElementById('reviewActTitle').innerText = 'Cargando actividad...';
    document.getElementById('reviewQuestionsView').innerHTML = '<div class="spinner" style="display:block; margin: 30px auto;"></div>';
    document.getElementById('reviewSubmissionsView').innerHTML = '<div class="spinner" style="display:block; margin: 30px auto;"></div>';
    
    switchReviewTab('questions');

    try {
        const [resAct, resAttempts] = await Promise.all([
            fetch(`/api/activities/${id}`),
            fetch(`/api/activities/${id}/attempts`)
        ]);
        
        const act = await resAct.json();
        const attemptsData = await resAttempts.json();
        
        currentReviewActivity = act;
        
        document.getElementById('reviewActTitle').innerText = act.title;
        document.getElementById('reviewActBadgeType').innerText = act.type || 'Actividad';
        document.getElementById('reviewActBadgeGrade').innerText = act.theme || 'Grado General';
        
        const questions = act.preguntas || [];
        const attempts = (attemptsData && attemptsData.attempts) ? attemptsData.attempts : [];
        
        document.getElementById('reviewQuestionsCount').innerText = questions.length;
        document.getElementById('reviewSubmissionsCount').innerText = attempts.length;
        
        if (questions.length === 0) {
            document.getElementById('reviewQuestionsView').innerHTML = `
                <div style="text-align: center; padding: 40px 20px; color: var(--text-secondary);">
                    <div style="font-size: 2.5rem; margin-bottom: 10px;">📝</div>
                    <p style="margin: 0; font-size: 1rem;">Esta actividad aún no tiene preguntas configuradas.</p>
                </div>
            `;
        } else {
            let qHtml = '<div style="display: flex; flex-direction: column; gap: 14px;">';
            questions.forEach((q, index) => {
                const isOption = q.tipo === 'opcion';
                let cleanText = q.pregunta;
                let graphicHtml = '';
                if (window.FractionGraphics && typeof window.FractionGraphics.parseQuestion === 'function') {
                    const parsed = window.FractionGraphics.parseQuestion(q.pregunta);
                    cleanText = parsed.cleanText;
                    graphicHtml = parsed.graphicHtml;
                }

                qHtml += `
                    <div class="card" style="background: rgba(16, 23, 59, 0.7); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 14px 16px; text-align: left;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                            <span style="font-size: 0.8rem; font-weight: 700; color: #818cf8; text-transform: uppercase;">Pregunta ${index + 1}</span>
                            <span style="font-size: 0.75rem; background: rgba(255,255,255,0.08); padding: 2px 8px; border-radius: 8px; color: var(--text-muted);">${isOption ? '🔘 Opción Múltiple' : '✍️ Abierta'}</span>
                        </div>
                        <h4 style="margin: 0 0 10px 0; font-size: 0.95rem; color: #f8fafc; font-weight: 600;">${cleanText}</h4>
                        ${graphicHtml ? `<div style="margin: 10px 0;">${graphicHtml}</div>` : ''}
                `;
                
                if (isOption) {
                    const opts = [
                        { label: 'A', text: q.a },
                        { label: 'B', text: q.b },
                        { label: 'C', text: q.c }
                    ];
                    qHtml += '<div style="display: flex; flex-direction: column; gap: 6px;">';
                    opts.forEach(opt => {
                        const isCorrect = String(q.correcta).trim().toLowerCase() === String(opt.text).trim().toLowerCase() ||
                                          String(q.correcta).trim().toLowerCase() === opt.label.toLowerCase();
                        const optStyle = isCorrect 
                            ? 'background: rgba(16, 185, 129, 0.18); border: 1px solid #10b981; color: #a7f3d0; font-weight: 600;' 
                            : 'background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 255, 255, 0.08); color: var(--text-secondary);';
                        qHtml += `
                            <div style="padding: 8px 12px; border-radius: 8px; display: flex; align-items: center; justify-content: space-between; font-size: 0.85rem; ${optStyle}">
                                <span><b>${opt.label})</b> ${opt.text || '(Vacía)'}</span>
                                ${isCorrect ? '<span style="font-size: 0.75rem; background: #10b981; color: #042f2e; padding: 2px 6px; border-radius: 6px; font-weight: 800;">✓ CORRECTA</span>' : ''}
                            </div>
                        `;
                    });
                    qHtml += '</div>';
                } else {
                    qHtml += `
                        <div style="margin-top: 6px; padding: 8px 12px; border-radius: 8px; background: rgba(16, 185, 129, 0.18); border: 1px solid #10b981; color: #a7f3d0; font-size: 0.85rem;">
                            <b>Respuesta esperada:</b> ${q.correcta}
                        </div>
                    `;
                }
                
                qHtml += `</div>`;
            });
            qHtml += '</div>';
            document.getElementById('reviewQuestionsView').innerHTML = qHtml;
        }
        
        if (attempts.length === 0) {
            document.getElementById('reviewSubmissionsView').innerHTML = `
                <div style="text-align: center; padding: 40px 20px; color: var(--text-secondary);">
                    <div style="font-size: 2.5rem; margin-bottom: 10px;">👥</div>
                    <p style="margin: 0; font-size: 1rem;">Ningún estudiante ha completado esta actividad todavía.</p>
                </div>
            `;
        } else {
            let sHtml = '<div style="display: flex; flex-direction: column; gap: 10px;">';
            attempts.forEach(att => {
                const dateStr = new Date(att.completed_at).toLocaleString();
                sHtml += `
                    <div class="card" style="background: rgba(16, 23, 59, 0.7); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 10px; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; text-align: left; flex-wrap: wrap; gap: 8px;">
                        <div>
                            <h4 style="margin: 0 0 4px 0; color: #f8fafc; font-size: 0.95rem;">👤 ${att.student_name}</h4>
                            <span style="font-size: 0.75rem; color: var(--text-muted);">Usuario: ${att.username || 'N/A'} • 📅 ${dateStr}</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <span style="font-size: 0.95rem; font-weight: 700; color: #38bdf8;">+${att.score} pts</span>
                            <button class="btn btn--secondary btn--sm" style="background: rgba(255, 92, 122, 0.15); color: #ff5c7a; border: 1px solid rgba(255, 92, 122, 0.3); padding: 4px 8px; font-size: 0.75rem; border-radius: 12px;" onclick="deleteStudentActivityAttempt(${act.id}, ${att.id}, '${att.student_name.replace(/'/g, "\\'")}')">🔄 Reiniciar</button>
                        </div>
                    </div>
                `;
            });
            sHtml += '</div>';
            document.getElementById('reviewSubmissionsView').innerHTML = sHtml;
        }

    } catch (err) {
        console.error('Error cargando detalle de actividad:', err);
        document.getElementById('reviewQuestionsView').innerHTML = '<p style="color: var(--color-danger);">❌ Error al cargar datos de la actividad.</p>';
        document.getElementById('reviewSubmissionsView').innerHTML = '<p style="color: var(--color-danger);">❌ Error al cargar entregas.</p>';
    }
}

function closeReviewActivityModal() {
    const modal = document.getElementById('reviewActivityModal');
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
    }
}

function switchReviewTab(tab) {
    const qView = document.getElementById('reviewQuestionsView');
    const sView = document.getElementById('reviewSubmissionsView');
    const qBtn = document.getElementById('tabReviewQuestionsBtn');
    const sBtn = document.getElementById('tabReviewSubmissionsBtn');
    
    if (tab === 'questions') {
        qView.style.display = 'block';
        sView.style.display = 'none';
        qBtn.className = 'btn btn--sm active';
        sBtn.className = 'btn btn--outline btn--sm';
    } else {
        qView.style.display = 'none';
        sView.style.display = 'block';
        qBtn.className = 'btn btn--outline btn--sm';
        sBtn.className = 'btn btn--sm active';
    }
}

function testActivityAsTeacher() {
    if (!currentReviewActivity) return;
    closeReviewActivityModal();
    window.playActivity(currentReviewActivity, 'A', (score) => {
        showAlert(`🎉 Modo prueba finalizado. Puntaje simulado: ${score} pts`);
    });
}

async function deleteStudentActivityAttempt(activityId, attemptId, studentName) {
    if (!confirm(`¿Deseas reiniciar el intento de "${studentName}" para esta actividad? Se eliminará su entrega actual.`)) return;
    try {
        const res = await fetch(`/api/activities/${activityId}/attempts/${attemptId}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
            showAlert(`Intento de ${studentName} reiniciado correctamente.`);
            openReviewActivityModal(activityId);
        } else {
            showAlert('❌ No se pudo reiniciar el intento.');
        }
    } catch(err) {
        console.error(err);
        showAlert('❌ Error de conexión al reiniciar intento.');
    }
}
