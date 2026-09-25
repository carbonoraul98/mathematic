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
      showAlert("Tiempo agotado! Puntos: " + score, () => {
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
      
      const maxLevels = 10;
      for (let i = 1; i <= maxLevels; i++) {
        const node = document.createElement('div');
        node.className = 'map-node-v2';
        
        // Simular títulos dinámicos para los nodos
        const nodeTitles = ["Suma", "Resta", "Multiplicación", "División", "Fracciones", "Decimales", "Geometría", "Álgebra", "Potencias", "Ecuaciones"];
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
      showAlert("🚧 Aún no hay módulos de práctica disponibles. ¡Pedile a tu profe que cree uno!");
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
      // Llamar al backend para sumar XP
      try {
        const xpRes = await fetch(`/api/students/${estudianteActual.id}/add-xp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ xp: puntosObtenidos })
        });
        const xpData = await xpRes.json();
        if (xpData.success) {
          estudianteActual.levelInfo = xpData.levelInfo;
          updateStudentLevelUI(estudianteActual);
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

// Funciones del Modal de Estudiante
function openCreateStudentModal() {
  document.getElementById('createStudentModal').style.display = 'flex';
  document.getElementById('modalStudentName').value = '';
  document.getElementById('modalStudentUser').value = '';
  document.getElementById('modalStudentPassword').value = '';
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
    showAlert("❌ Completa nombre y usuario");
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
  let tipo = document.getElementById("activityType").value;
  let tema = document.getElementById("activityTheme").value;
  
  if (!tema) {
    showAlert('❌ Escribí un tema para la actividad');
    return;
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
        questions: preguntasTemp
      })
    });
    
    const result = await res.json();
    if (result.success) {
      // Limpiar
      preguntasTemp = [];
      mostrarPreguntas();
      document.getElementById("activityTheme").value = "";
      showAlert(`✅ Actividad "${tema}" guardada en la base de datos`);
      
      // Redirect to activities list
      loadActivities();
      loadDashboardStats();
      const activitiesLink = Array.from(document.querySelectorAll('.sidebar-link')).find(el => el.textContent.includes('Actividades'));
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
         estudianteActual.levelInfo = { level: 1, currentXP: 0, xpPerLevel: 30, progressPercent: 0 };
         updateStudentLevelUI(estudianteActual);
         mostrarPendientes();
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
  contenedor.innerHTML = "<p>Cargando actividades...</p>";
  
  if (!estudianteActual) return;
  
  let gradoAlumnoBase = estudianteActual.group_name ? estudianteActual.group_name.charAt(0) : "1"; // Ej: de "1B" extrae "1"
  
  try {
    const res = await fetch('/api/activities');
    const todasActividades = await res.json();
    
    contenedor.innerHTML = "";
    
    // Filtrar actividades del grado del estudiante y que no sean Práctica (van aparte)
    const actividadesFiltradas = todasActividades.filter(a => {
      const gradoActividad = a.theme ? a.theme.replace('Grado ', '') : '';
      const coincideGrado = gradoActividad === gradoAlumnoBase || !gradoActividad || a.theme === 'General';
      const noEsPractica = a.type !== 'Práctica';
      return coincideGrado && noEsPractica;
    });
    
    if (actividadesFiltradas.length === 0) {
      contenedor.innerHTML = "<p>No hay evaluaciones o talleres pendientes para tu grado.</p>";
      return;
    }
    
    actividadesFiltradas.forEach((a, index) => {
      contenedor.innerHTML += `<div class="card"><h2>📚 ${a.title}</h2><p>📝 ${a.type}</p><p>⏳ Pendiente</p><button class="btn" onclick="realizarActividad(${a.id})">REALIZAR</button></div>`;
    });
  } catch (error) {
    console.error('Error cargando actividades:', error);
    contenedor.innerHTML = "<p>❌ Error al cargar actividades</p>";
  }
}

function realizarActividad(index) {
  let actividad = actividades[index];
  
  if (!estudianteActual) return;
  
  let seccion = estudianteActual.group_name ? estudianteActual.group_name.charAt(1) : "A"; // Extrae "A", "B", "C" o "D"
  
  window.playActivity(actividad, seccion, (puntosObtenidos) => {
    if (estudianteActual.puntos === undefined) estudianteActual.puntos = 0;
    estudianteActual.puntos += puntosObtenidos;
    
    showAlert("✅ Actividad terminada. Puntos sumados: " + puntosObtenidos);
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
        showAlert('❌ Pegá el JSON del examen');
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
            const icono = act.type === 'Examen' ? '📝' : (act.type === 'Quiz' ? '⏱️' : '🧩');
            html += `
                <div class="classroom-item" style="cursor: default; align-items: center; margin-bottom: var(--space-md);">
                    <div class="classroom-item-info">
                        <div class="classroom-icon">${icono}</div>
                        <div class="classroom-details">
                            <h4 style="margin: 0 0 4px 0; color: var(--text-primary); font-size: var(--text-md);">${act.title}</h4>
                            <p style="margin: 0; color: var(--text-secondary); font-size: var(--text-sm);">📝 Tipo: ${act.type} • 📚 ${act.theme || 'Sin grado'} • 📅 ${new Date(act.created_at).toLocaleDateString()}</p>
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
        showAlert('❌ Escribí un tema para la práctica');
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
        showAlert('❌ Por favor ingresa un nombre para el aula.');
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

function openEditActivityModal(id, title, type, theme) {
    document.getElementById('editActivityId').value = id;
    document.getElementById('editActivityTitle').value = title;
    document.getElementById('editActivityType').value = type;
    document.getElementById('editActivityTheme').value = theme;
    
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
    
    if (!title) {
        showAlert('❌ Por favor ingresa el título.');
        return;
    }
    
    closeEditActivityModal();
    
    try {
        const res = await fetch(`/api/activities/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, type, theme })
        });
        const result = await res.json();
        
        if (result.success) {
            showAlert('✅ Actividad actualizada con éxito');
            loadActivities();
        } else {
            showAlert('❌ Error: ' + result.error);
        }
    } catch (error) {
        console.error(error);
        showAlert('❌ Error de conexión');
    }
}

function openClassroomDetail(groupName) {
    document.getElementById('classroomDetailTitle').textContent = '🪐 Aula ' + groupName;
    const content = document.getElementById('classroomDetailContent');
    
    // Hide all sections and show this one
    document.querySelectorAll('.section').forEach(sec => sec.classList.remove('show'));
    document.querySelectorAll('.section').forEach(sec => sec.style.display = 'none');
    document.getElementById('classroomDetailSection').style.display = 'block';
    document.getElementById('classroomDetailSection').classList.add('show');
    
    // Remove active class from sidebar
    document.querySelectorAll('.sidebar-link').forEach(link => link.classList.remove('active'));
    
    if (!estudiantes || estudiantes.length === 0) {
        content.innerHTML = '<p>No hay estudiantes cargados. Vuelve e inténtalo de nuevo.</p>';
        return;
    }
    
    const studentsInGroup = estudiantes.filter(e => e.group_name === groupName || e.grado === groupName);
    
    if (studentsInGroup.length === 0) {
        content.innerHTML = '<p>Esta aula no tiene estudiantes todavía.</p>';
        return;
    }
    
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

async function showStudentProgress(studentId, studentName) {
    document.getElementById('studentProgressModal').style.display = 'flex';
    document.getElementById('progressModalTitle').innerHTML = `📈 Progreso: ${studentName}`;
    const content = document.getElementById('progressModalContent');
    content.innerHTML = '<div class="spinner" style="display:block; margin: 20px auto;"></div>';
    
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
