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
  activeMapGrade = '4';
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

function getStudentDisplayName(student) {
  if (!student) return 'Estudiante';
  const customNickname = localStorage.getItem(`student_nickname_${student.id}`) || student.nickname;
  if (customNickname && customNickname.trim()) {
    return customNickname.trim();
  }
  
  const raw = (student.full_name || student.username || 'Estudiante').trim();
  const parts = raw.split(/\s+/);
  
  if (parts.length > 2) {
    // Si viene en formato escolar "APELLIDOS NOMBRES" (ej: JIMENEZ MONTALVO MARIA SOFIA),
    // tomamos el nombre de pila más familiar formateado en Title Case para ahorrar espacio
    const formatted = parts.map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase());
    return formatted[formatted.length - 1]; // "Sofia"
  } else if (parts.length === 2) {
    return parts.map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join(' ');
  }
  return parts[0].charAt(0).toUpperCase() + parts[0].slice(1).toLowerCase();
}

function openEditNicknameModal() {
  const modal = document.getElementById('editNicknameModal');
  const input = document.getElementById('nicknameInput');
  if (modal && input) {
    const current = localStorage.getItem(`student_nickname_${estudianteActual?.id}`) || getStudentDisplayName(estudianteActual);
    input.value = current !== 'Estudiante' ? current : '';
    modal.style.display = 'flex';
    setTimeout(() => input.focus(), 50);
  }
}

function closeEditNicknameModal() {
  const modal = document.getElementById('editNicknameModal');
  if (modal) {
    modal.style.display = 'none';
  }
}

function saveStudentNickname() {
  const input = document.getElementById('nicknameInput');
  if (!input || !estudianteActual) return;
  const newName = input.value.trim();
  if (newName) {
    localStorage.setItem(`student_nickname_${estudianteActual.id}`, newName);
  } else {
    localStorage.removeItem(`student_nickname_${estudianteActual.id}`);
  }
  closeEditNicknameModal();
  updateStudentDisplayNameUI();
}

function updateStudentDisplayNameUI() {
  if (!estudianteActual) return;
  const displayName = getStudentDisplayName(estudianteActual);
  const panelNameEl = document.getElementById('studentPanelName');
  if (panelNameEl) {
    panelNameEl.innerText = displayName;
    panelNameEl.title = estudianteActual.full_name || estudianteActual.username || displayName;
  }
  const profileNameEl = document.getElementById('studentProfileName');
  if (profileNameEl) {
    profileNameEl.innerText = displayName;
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
    updateStudentDisplayNameUI();
    updateStudentLevelUI(estudianteActual);
    switchStudentTab('home');
    mostrarPendientes();
    loadStudentPerformance();
  }
}

let activeMapGrade = '4';

function getStudentGrade(student) {
  if (!student || !student.group_name) return '4';
  const name = String(student.group_name).trim();
  return name.startsWith('5') ? '5' : '4';
}

const BASE_TRAINING_MAPS = {
  '4': {
    title: '4° Grado',
    subtitle: '📘 Ruta 4° Grado: Multiplicación de dos cifras, división de dos cifras y fracciones sencillas.',
    levels: [
      { id: 1, title: 'Mult. 2 Cifras I', activityId: 2, icon: '✖️' },
      { id: 2, title: 'Mult. 2 Cifras II', activityId: 3, icon: '🔢' },
      { id: 3, title: 'División 2 Cifras I', activityId: 4, icon: '➗' },
      { id: 4, title: 'División 2 Cifras II', activityId: 17, icon: '➗' },
      { id: 5, title: 'Fracciones I (Modelos)', activityId: 28, icon: '🥧' },
      { id: 6, title: 'Fracciones II (Rectas)', activityId: 29, icon: '📏' }
    ]
  },
  '5': {
    title: '5° Grado (Avanzado)',
    subtitle: '🚀 Ruta Avanzada: Aritmética de múltiples cifras, fracciones, plano cartesiano, estadística, álgebra y operaciones mixtas.',
    levels: [
      { id: 1, title: 'Mult. 3-4 Cifras', activityId: 18, icon: '✖️' },
      { id: 2, title: 'División Galera II', activityId: 19, icon: '➗' },
      { id: 3, title: 'División Larga III', activityId: 20, icon: '➗' },
      { id: 4, title: 'Fracciones I (Modelos)', activityId: 6, icon: '🥧' },
      { id: 5, title: 'Fracciones II (Rectas)', activityId: 16, icon: '📏' },
      { id: 6, title: 'Plano Cartesiano I', activityId: 21, icon: '📍' },
      { id: 7, title: 'Plano Cartesiano II', activityId: 22, icon: '🎯' },
      { id: 8, title: 'Estadística I (Barras)', activityId: 23, icon: '📊' },
      { id: 9, title: 'Estadística II (Media)', activityId: 24, icon: '📈' },
      { id: 10, title: 'Álgebra Básica', activityId: 25, icon: '⚖️' },
      { id: 11, title: 'Operaciones Mixtas I', activityId: 30, icon: '⚡' },
      { id: 12, title: 'Operaciones Mixtas II', activityId: 31, icon: '🎯' }
    ]
  }
};

let cachedDynamicMaps = {};

async function fetchDynamicTrainingMapConfig(grade) {
  const g = String(grade || '4');
  const base = BASE_TRAINING_MAPS[g] || BASE_TRAINING_MAPS['4'];
  const config = {
    title: base.title,
    subtitle: base.subtitle,
    levels: [...base.levels.map(l => ({ ...l }))]
  };

  try {
    const res = await fetch('/api/activities');
    if (res.ok) {
      const allActivities = await res.json();
      const customLevels = allActivities.filter(a => {
        if (!a.is_training_level) return false;
        const tg = a.training_grade ? String(a.training_grade).trim() : '';
        return tg === g || (tg === '' && (a.theme || '').includes(g));
      });
      // Orden cronológico por id ascendente
      customLevels.sort((a, b) => a.id - b.id);

      let nextLevelId = base.levels.length + 1;
      customLevels.forEach(act => {
        config.levels.push({
          id: nextLevelId++,
          title: act.title,
          activityId: act.id,
          icon: act.map_icon || (act.type === 'Examen' ? '📝' : '🏆'),
          isCustom: true
        });
      });
    }
  } catch (err) {
    console.warn('No se pudieron cargar actividades dinámicas para el mapa:', err);
  }

  cachedDynamicMaps[g] = config;
  return config;
}

function getCachedTrainingMapConfig(grade) {
  const g = String(grade || '4');
  return cachedDynamicMaps[g] || BASE_TRAINING_MAPS[g] || BASE_TRAINING_MAPS['4'];
}

function selectTrainingMapGrade(grade) {
  if (estudianteActual) {
    activeMapGrade = getStudentGrade(estudianteActual);
    updateStudentLevelUI(estudianteActual);
  }
}

async function updateStudentLevelUI(student) {
  if (student && student.levelInfo) {
    document.getElementById('studentLevelDisplay').innerText = student.levelInfo.level;
    document.getElementById('studentXpDisplay').innerText = student.levelInfo.currentXP;
    if (document.getElementById('studentXpGoal')) {
        document.getElementById('studentXpGoal').innerText = student.levelInfo.xpPerLevel;
    }
    document.getElementById('studentXpBar').style.width = student.levelInfo.progressPercent + '%';

    // Determinar grado exclusivo del estudiante
    activeMapGrade = getStudentGrade(student);

    // Actualizar insignia indicadora de grado exclusivo
    const badgeEl = document.getElementById('studentMapGradeBadge');
    if (badgeEl) {
      if (activeMapGrade === '5') {
        badgeEl.innerHTML = '🚀 Ruta 5° Grado (Avanzado)';
        badgeEl.style.background = 'rgba(168, 85, 247, 0.2)';
        badgeEl.style.borderColor = 'rgba(168, 85, 247, 0.4)';
        badgeEl.style.color = '#e9d5ff';
      } else {
        badgeEl.innerHTML = '📘 Ruta 4° Grado';
        badgeEl.style.background = 'rgba(99, 102, 241, 0.2)';
        badgeEl.style.borderColor = 'rgba(99, 102, 241, 0.4)';
        badgeEl.style.color = '#c7d2fe';
      }
    }

    const currentMapConfig = await fetchDynamicTrainingMapConfig(activeMapGrade);
    const subtitleEl = document.getElementById('mapGradeSubtitle');
    if (subtitleEl) {
      subtitleEl.innerText = currentMapConfig.subtitle;
    }

    // Renderizar Mapa de Niveles (Diseño V2 - Gamificado)
    const mapContainer = document.getElementById('levelMapContainer');
    if (mapContainer) {
      mapContainer.innerHTML = '';
      mapContainer.className = 'level-map-container-v2';
      
      const levels = currentMapConfig.levels;
      levels.forEach(lvl => {
        const node = document.createElement('div');
        node.className = 'map-node-v2';
        const nodeLabel = lvl.title;
        
        if (lvl.id < student.levelInfo.level) {
          node.classList.add('completed');
          node.title = `Nivel ${lvl.id}: ${nodeLabel} (Completado - Clic para volver a practicar)`;
          node.onclick = () => startPracticeLevel(lvl);
          node.innerHTML = `
            <div class="node-circle-v2">${lvl.id}
                <div class="node-icon-v2" style="color: #10b981;">✔️</div>
            </div>
            <div class="node-label-v2">${nodeLabel}</div>
          `;
        } else if (lvl.id === student.levelInfo.level) {
          node.classList.add('active');
          node.onclick = () => startPracticeLevel(lvl);
          node.title = `Nivel ${lvl.id}: ${nodeLabel} (¡Nivel actual - Clic para jugar!)`;
          node.innerHTML = `
            <div class="node-circle-v2">${lvl.id}
                <div class="node-icon-v2" style="color: #3b82f6;">${lvl.icon || '▶️'}</div>
            </div>
            <div class="node-label-v2">${nodeLabel}</div>
          `;
        } else {
          node.classList.add('locked');
          node.title = `Nivel ${lvl.id}: ${nodeLabel} (Bloqueado - Alcanza el Nivel ${lvl.id} para desbloquear)`;
          node.innerHTML = `
            <div class="node-circle-v2">${lvl.id}
                <div class="node-icon-v2" style="color: #64748b;">🔒</div>
            </div>
            <div class="node-label-v2">${nodeLabel}</div>
          `;
        }
        
        mapContainer.appendChild(node);
      });
    }
  }
}

async function startPracticeLevel(levelObj) {
  try {
    const studentGrade = getStudentGrade(estudianteActual);
    const currentMapConfig = await fetchDynamicTrainingMapConfig(studentGrade);

    if (levelObj && !currentMapConfig.levels.some(l => l.id === levelObj.id)) {
      showAlert("⚠️ Este nivel no corresponde al mapa de tu grado.");
      return;
    }

    let act = null;
    if (levelObj && levelObj.activityId) {
      const res = await fetch(`/api/activities/${levelObj.activityId}`);
      if (res.ok) {
        act = await res.json();
      }
    }
    
    // Si no se encuentra por ID directo o no tiene preguntas, fallback a lista de prácticas del grado
    if (!act || !act.preguntas || act.preguntas.length === 0) {
      const resAll = await fetch('/api/activities');
      const todas = await resAll.json();
      const practicas = todas.filter(a => (a.type === 'Práctica' || a.type === 'Examen' || a.is_training_level) && (!a.theme || a.theme.includes(`Grado ${studentGrade}`) || a.theme === 'General'));
      act = practicas.find(p => p.id === (levelObj && levelObj.activityId) || (levelObj && p.title.toLowerCase() === levelObj.title.toLowerCase())) || practicas[0];
    }
    
    if (!act || !act.preguntas || act.preguntas.length === 0) {
      showAlert("🚧 Módulo de práctica o evaluación en preparación. ¡Intenta con otro nivel!");
      return;
    }
    
    let seccion = estudianteActual.group_name ? estudianteActual.group_name.charAt(1) : "A";
    
    window.playActivity(act, seccion, async (puntosObtenidos) => {
      try {
        const xpRes = await fetch(`/api/students/${estudianteActual.id}/add-xp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            xp: puntosObtenidos,
            activity_id: act.id
          })
        });
        const xpData = await xpRes.json();
        if (xpData.success) {
          estudianteActual.levelInfo = xpData.levelInfo;
          estudianteActual.total_score = xpData.total_score;
          await updateStudentLevelUI(estudianteActual);
          if (document.getElementById('studentProfileView') && document.getElementById('studentProfileView').style.display !== 'none') {
            loadStudentPerformance();
          }
          showAlert(`🎮 ¡Excelente! Sumaste ${puntosObtenidos} XP en "${act.title}".`);
        }
      } catch (err) {
        console.error('Error guardando XP:', err);
      }
    });
  } catch (error) {
    console.error('Error al iniciar práctica de nivel:', error);
    showAlert("❌ Error al cargar la práctica");
  }
}

async function startPracticeMode() {
  const studentGrade = getStudentGrade(estudianteActual);
  const currentMapConfig = await fetchDynamicTrainingMapConfig(studentGrade);
  const curLevel = estudianteActual && estudianteActual.levelInfo ? estudianteActual.levelInfo.level : 1;
  const targetLevelObj = currentMapConfig.levels.find(l => l.id === curLevel) || currentMapConfig.levels[currentMapConfig.levels.length - 1];
  await startPracticeLevel(targetLevelObj);
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
  if (nameEl) nameEl.innerText = getStudentDisplayName(estudianteActual);
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

      const listContainers = [
        document.getElementById('studentTopicsList'),
        document.getElementById('studentHomeTopicsList')
      ].filter(Boolean);

      if (listContainers.length > 0 && data.topics) {
        listContainers.forEach(listContainer => {
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
  const gradeSelect = document.getElementById("activityTargetGrade");
  const gradoBase = gradeSelect ? gradeSelect.value : "4";
  const targetGroupEl = document.getElementById("activityTargetGroup");
  const selectedGroupVal = targetGroupEl ? targetGroupEl.value : "ALL_GRADE";
  const tipo = document.getElementById("activityType").value;
  const tema = document.getElementById("activityTheme").value.trim();
  
  if (!tema) {
    showAlert('❌ Escribe un tema para la actividad');
    return;
  }

  // Recolectar aulas destino
  let targetGroups = [];
  let primaryGroupId = null;

  if (selectedGroupVal === "ALL_GRADE" || !selectedGroupVal) {
    const gradeGroups = (window.todasLasAulas || []).filter(g => String(g.name).startsWith(gradoBase));
    targetGroups = gradeGroups.map(g => g.id);
    primaryGroupId = targetGroups[0] || null;
  } else {
    primaryGroupId = Number(selectedGroupVal);
    targetGroups.push(primaryGroupId);

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
  }
  
  const chkManualTraining = document.getElementById("chkManualTrainingLevel");
  const isTrainingLevel = chkManualTraining ? chkManualTraining.checked : false;
  const trainingGrade = isTrainingLevel ? document.getElementById("manualTrainingGrade").value : "";
  const trainingIcon = isTrainingLevel ? document.getElementById("manualTrainingIcon").value : "🏆";
  
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
        questions: preguntasTemp,
        is_training_level: isTrainingLevel,
        training_grade: trainingGrade,
        map_icon: trainingIcon
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
      if (chkManualTraining) {
        chkManualTraining.checked = false;
        toggleManualTrainingOptions();
      }
      
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
  if (!estudianteActual) return;
  const studentId = estudianteActual.id || estudianteActual._id;
  if (!studentId) return;

  showConfirm("¿Estás seguro de que deseas reiniciar todo tu progreso? Volverás al Nivel 1 con 0 XP.", async () => {
    try {
      const res = await fetch(`/api/students/${studentId}/reset`, { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
         estudianteActual.total_score = 0;
         estudianteActual.puntos = 0;
         estudianteActual.levelInfo = { level: 1, currentXP: 0, xpPerLevel: 30, progressPercent: 0 };
         
         // 1. Actualizar inmediatamente interfaz de nivel, barra XP y mapa de niveles
         updateStudentLevelUI(estudianteActual);

         // 2. Actualizar inmediatamente estadísticas de la pestaña de perfil
         if (document.getElementById('profileLevelVal')) document.getElementById('profileLevelVal').innerText = '1';
         if (document.getElementById('profilePointsVal')) document.getElementById('profilePointsVal').innerText = '0';
         if (document.getElementById('profileStreakVal')) document.getElementById('profileStreakVal').innerText = '0 días';

         // 3. Restablecer barras y porcentajes de temas a 0%
         document.querySelectorAll('.student-topic-fill').forEach(el => {
           el.style.width = '0%';
           el.setAttribute('data-percent', '0');
         });
         document.querySelectorAll('.student-topic-percent').forEach(el => {
           el.innerText = '0%';
         });

         // 4. Recargar actividades y métricas actualizadas
         mostrarPendientes();
         await loadStudentPerformance();
         showAlert("✅ Tu progreso y experiencia han sido reiniciados con éxito a 0 XP.");
      } else {
         showAlert(data.error || "Hubo un error al reiniciar el progreso.");
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
    
    // Filtrar actividades del aula y grado del estudiante (excluyendo Prácticas del mapa de juego)
    const actividadesFiltradas = todasActividades.filter(a => {
      const noEsPractica = a.type !== 'Práctica';
      if (!noEsPractica) return false;

      const themeLower = (a.theme || '').toLowerCase();
      const titleLower = (a.title || '').toLowerCase();
      const hasSpecificClassroom = (a.target_groups && a.target_groups.length > 0) || a.group_id;

      if (hasSpecificClassroom) {
        const matchesGroup = a.group_id === estudianteActual.group_id || 
                             (Array.isArray(a.target_groups) && a.target_groups.includes(estudianteActual.group_id));
        if (!matchesGroup) return false;
      }

      // Si el tema o título especifica grado, debe corresponder exactamente al grado del estudiante
      if (themeLower.includes('grado 4') || titleLower.includes('4°') || titleLower.includes('4to')) {
        return gradoAlumnoBase === '4';
      }
      if (themeLower.includes('grado 5') || titleLower.includes('5°') || titleLower.includes('5to')) {
        return gradoAlumnoBase === '5';
      }

      return hasSpecificClassroom;
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

function toggleTeacherNavDropdown(event) {
  if (event) {
    event.stopPropagation();
  }
  const wrapper = document.getElementById('teacherMoreMenuWrapper');
  if (wrapper) {
    wrapper.classList.toggle('open');
  }
}

function closeTeacherNavDropdown() {
  const wrapper = document.getElementById('teacherMoreMenuWrapper');
  if (wrapper) {
    wrapper.classList.remove('open');
  }
}

document.addEventListener('click', (e) => {
  const wrapper = document.getElementById('teacherMoreMenuWrapper');
  if (wrapper && wrapper.classList.contains('open')) {
    if (!wrapper.contains(e.target)) {
      wrapper.classList.remove('open');
    }
  }
});

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
    document.querySelectorAll(".sidebar-link, .nav-dropdown-item").forEach(btn => btn.classList.remove("active"));
    btnElement.classList.add("active");

    const moreTrigger = document.getElementById('navLinkMore');
    if (moreTrigger) {
      if (btnElement.classList.contains('nav-dropdown-item')) {
        moreTrigger.classList.add('active');
      } else {
        moreTrigger.classList.remove('active');
      }
    }
  }

  closeTeacherNavDropdown();
  
  if (id === "gradesSection") {
    mostrarNotas();
  } else if (id === "viewActivitiesSection") {
    loadActivities();
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
        <div class="grade-student-info">
          <h3>👤 ${nombre}</h3>
          <p>📚 Grado: ${grupo} | 🆔 ${usuario}</p>
        </div>
        <div class="score-mini-card">
          <div class="score-mini-card-header">
            <span class="score-icon">⭐</span>
            <span class="score-pts-label">PUNTOS</span>
          </div>
          <div class="score-mini-card-value">${pts}</div>
        </div>
      </div>
    `;
  });
}

// Toggles para opciones de niveles en la ruta de entrenamiento
function toggleManualTrainingOptions() {
  const chk = document.getElementById('chkManualTrainingLevel');
  const opt = document.getElementById('manualTrainingOptions');
  if (opt) {
    opt.style.display = chk && chk.checked ? 'grid' : 'none';
  }
}

function toggleDocxTrainingOptions() {
  const chk = document.getElementById('chkDocxTrainingLevel');
  const opt = document.getElementById('docxTrainingOptions');
  if (opt) {
    opt.style.display = chk && chk.checked ? 'grid' : 'none';
  }
}

function toggleEditTrainingOptions() {
  const chk = document.getElementById('editIsTrainingLevel');
  const opt = document.getElementById('editTrainingOptions');
  if (opt) {
    opt.style.display = chk && chk.checked ? 'grid' : 'none';
  }
}

let currentImportSourceMode = 'file';

function selectImportSourceMode(mode) {
  currentImportSourceMode = mode;
  const fileTab = document.getElementById('tabImportFile');
  const gdocsTab = document.getElementById('tabImportGDocs');
  const fileArea = document.getElementById('importFileArea');
  const gdocsArea = document.getElementById('importGDocsArea');

  if (fileTab && gdocsTab && fileArea && gdocsArea) {
    if (mode === 'file') {
      fileTab.classList.add('active');
      fileTab.classList.remove('btn--outline');
      gdocsTab.classList.remove('active');
      gdocsTab.classList.add('btn--outline');
      fileArea.style.display = 'block';
      gdocsArea.style.display = 'none';
    } else {
      gdocsTab.classList.add('active');
      gdocsTab.classList.remove('btn--outline');
      fileTab.classList.remove('active');
      fileTab.classList.add('btn--outline');
      gdocsArea.style.display = 'block';
      fileArea.style.display = 'none';
    }
  }
}

function triggerFileInputClick() {
  const fileInput = document.getElementById('docxFileInput');
  if (fileInput) fileInput.click();
}

function onCustomFileSelected(input) {
  if (!input || !input.files || input.files.length === 0) {
    clearCustomFile();
    return;
  }
  const file = input.files[0];
  displaySelectedFile(file);
}

function displaySelectedFile(file) {
  const emptyState = document.getElementById('dropzoneEmptyState');
  const selectedState = document.getElementById('dropzoneSelectedState');
  const fileNameEl = document.getElementById('dropzoneFileName');
  const fileMetaEl = document.getElementById('dropzoneFileMeta');
  const fileIconEl = document.getElementById('dropzoneFileIcon');
  const titleInput = document.getElementById('docxExamTitle');

  if (!emptyState || !selectedState) return;

  const fileName = file.name;
  const isPdf = fileName.toLowerCase().endsWith('.pdf');
  const isWord = fileName.toLowerCase().endsWith('.docx') || fileName.toLowerCase().endsWith('.doc');

  if (fileIconEl) {
    fileIconEl.textContent = isPdf ? '📕' : (isWord ? '📘' : '📄');
  }
  if (fileNameEl) {
    fileNameEl.textContent = fileName;
  }
  if (fileMetaEl) {
    const sizeKb = Math.round(file.size / 1024);
    const sizeStr = sizeKb > 1024 ? (sizeKb / 1024).toFixed(1) + ' MB' : sizeKb + ' KB';
    fileMetaEl.textContent = `${sizeStr} • Listo para procesar`;
  }

  if (titleInput && !titleInput.value.trim()) {
    titleInput.value = fileName.replace(/\.[^/.]+$/, "");
  }

  emptyState.style.display = 'none';
  selectedState.style.display = 'flex';
}

function clearCustomFile() {
  const fileInput = document.getElementById('docxFileInput');
  if (fileInput) fileInput.value = '';

  const emptyState = document.getElementById('dropzoneEmptyState');
  const selectedState = document.getElementById('dropzoneSelectedState');
  if (emptyState && selectedState) {
    emptyState.style.display = 'flex';
    selectedState.style.display = 'none';
  }
}

function onFileDragOver(e) {
  e.preventDefault();
  e.stopPropagation();
  const dropzone = document.getElementById('fileDropzone');
  if (dropzone) dropzone.classList.add('dragover');
}

function onFileDragLeave(e) {
  e.preventDefault();
  e.stopPropagation();
  const dropzone = document.getElementById('fileDropzone');
  if (dropzone) dropzone.classList.remove('dragover');
}

function onFileDrop(e) {
  e.preventDefault();
  e.stopPropagation();
  const dropzone = document.getElementById('fileDropzone');
  if (dropzone) dropzone.classList.remove('dragover');

  if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
    const file = e.dataTransfer.files[0];
    const fileInput = document.getElementById('docxFileInput');
    if (fileInput) {
      fileInput.files = e.dataTransfer.files;
      displaySelectedFile(file);
    }
  }
}

// Subir examen o actividad en formato Word (.docx), PDF (.pdf) o Google Docs
async function uploadDocxExam() {
  const fileInput = document.getElementById('docxFileInput');
  const gdocsUrlInput = document.getElementById('googleDocsUrlInput');
  const titleInput = document.getElementById('docxExamTitle');
  const typeSelect = document.getElementById('docxExamType');
  const targetGroupEl = document.getElementById('activityTargetGroup');
  const targetGradeEl = document.getElementById('activityTargetGrade');
  const chkReplicate = document.getElementById('chkReplicateActivity');
  const chkDocxTraining = document.getElementById('chkDocxTrainingLevel');
  const trainingGradeEl = document.getElementById('docxTrainingGrade');
  const trainingIconEl = document.getElementById('docxTrainingIcon');
  
  const uploadBtn = document.getElementById('importDocxBtn');
  const btnText = document.getElementById('importDocxBtnText');
  const spinner = document.getElementById('importDocxSpinner');

  const isGDocs = currentImportSourceMode === 'gdocs';
  const gdocsUrl = gdocsUrlInput ? gdocsUrlInput.value.trim() : '';

  let file = null;
  if (isGDocs) {
    if (!gdocsUrl) {
      showAlert('❌ Pega el enlace de tu documento de Google Docs.');
      return;
    }
    if (!gdocsUrl.includes('/document/d/')) {
      showAlert('❌ El enlace debe ser de Google Docs (ejemplo: https://docs.google.com/document/d/ID/edit).');
      return;
    }
  } else {
    if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
      showAlert('❌ Selecciona un archivo de Word (.docx) o PDF (.pdf).');
      return;
    }

    file = fileInput.files[0];
    const fileName = file.name.toLowerCase();
    const validExts = ['.docx', '.pdf', '.txt', '.odt'];
    if (!validExts.some(ext => fileName.endsWith(ext))) {
      showAlert('❌ Formato no soportado. Debe ser un archivo de Word (.docx) o PDF (.pdf).');
      return;
    }
  }

  const defaultTitle = file ? file.name.replace(/\.[^/.]+$/, "") : (isGDocs ? 'Evaluación Google Docs' : 'Nueva Evaluación');
  const title = (titleInput && titleInput.value.trim()) ? titleInput.value.trim() : defaultTitle;
  const type = typeSelect ? typeSelect.value : 'Examen';
  const grade = targetGradeEl ? targetGradeEl.value : '4';
  const selectedGroupVal = targetGroupEl ? targetGroupEl.value : 'ALL_GRADE';

  let targetGroups = [];
  let primaryGroupId = null;

  if (selectedGroupVal === 'ALL_GRADE' || !selectedGroupVal) {
    const gradeGroups = (window.todasLasAulas || []).filter(g => String(g.name).startsWith(grade));
    targetGroups = gradeGroups.map(g => g.id);
    primaryGroupId = targetGroups[0] || null;
  } else {
    primaryGroupId = Number(selectedGroupVal);
    targetGroups.push(primaryGroupId);

    if (chkReplicate && chkReplicate.checked) {
      const checkBoxes = document.querySelectorAll('.replicate-group-chk:checked');
      checkBoxes.forEach(cb => {
        const val = Number(cb.value);
        if (!targetGroups.includes(val)) targetGroups.push(val);
      });
    }
  }

  const isTrainingLevel = chkDocxTraining ? chkDocxTraining.checked : false;
  const trainingGrade = isTrainingLevel ? (trainingGradeEl ? trainingGradeEl.value : grade) : '';
  const trainingIcon = isTrainingLevel ? (trainingIconEl ? trainingIconEl.value : '📝') : '📝';

  uploadBtn.disabled = true;
  btnText.textContent = isGDocs ? 'DESCARGANDO Y PROCESANDO GOOGLE DOCS...' : 'PROCESANDO ARCHIVO...';
  spinner.style.display = 'inline-block';

  try {
    const formData = new FormData();
    if (isGDocs) {
      formData.append('google_docs_url', gdocsUrl);
    } else {
      formData.append('exam', file);
    }
    formData.append('title', title);
    formData.append('type', type);
    formData.append('grade', grade);
    if (primaryGroupId) formData.append('group_id', primaryGroupId);
    formData.append('target_groups', JSON.stringify(targetGroups));
    formData.append('is_training_level', isTrainingLevel ? 'true' : 'false');
    formData.append('training_grade', trainingGrade);
    formData.append('map_icon', trainingIcon);

    const res = await fetch('/api/exams/import', {
      method: 'POST',
      body: formData
    });

    const result = await res.json();

    uploadBtn.disabled = false;
    btnText.textContent = '📥 SUBIR Y PROCESAR EVALUACIÓN';
    spinner.style.display = 'none';

    if (result.success) {
      const sourceLabel = isGDocs ? 'Google Docs' : (file.name.toLowerCase().endsWith('.pdf') ? 'PDF' : 'Word');
      showAlert(`✅ "${result.title}" creada con ${result.questions_count} preguntas desde ${sourceLabel}.`);
      clearCustomFile();
      if (gdocsUrlInput) gdocsUrlInput.value = '';
      if (titleInput) titleInput.value = '';
      if (chkDocxTraining) {
        chkDocxTraining.checked = false;
        toggleDocxTrainingOptions();
      }
      loadActivities();
      loadDashboardStats();
      const activitiesLink = document.getElementById('navLinkActivities') || Array.from(document.querySelectorAll('.sidebar-link')).find(el => el.textContent.includes('Actividades'));
      if (activitiesLink) {
        showTeacherSection('viewActivitiesSection', activitiesLink);
      }
    } else {
      showAlert(`❌ ${result.error || 'Error al procesar el archivo Word'}`);
    }
  } catch (error) {
    uploadBtn.disabled = false;
    btnText.textContent = '📤 SUBIR Y PROCESAR ARCHIVO WORD (.DOCX)';
    spinner.style.display = 'none';
    console.error('Error al subir Word:', error);
    showAlert('❌ Error de conexión al subir el archivo');
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
            const icono = act.map_icon || (act.type === 'Examen' ? '📝' : (act.type === 'Quiz' ? '⏱️' : (act.type === 'Taller' ? '🛠️' : '🧩')));
            const qCount = act.preguntas ? act.preguntas.length : 0;
            const aulaBadge = act.target_group_names && act.target_group_names.length > 0 
                ? `<span style="background: rgba(16, 185, 129, 0.2); color: #6ee7b7; padding: 2px 8px; border-radius: 8px; font-weight: 600;">🪐 ${act.target_group_names.join(', ')}</span>`
                : (act.primary_group_name 
                    ? `<span style="background: rgba(16, 185, 129, 0.2); color: #6ee7b7; padding: 2px 8px; border-radius: 8px; font-weight: 600;">🪐 ${act.primary_group_name}</span>`
                    : `<span style="background: rgba(255, 255, 255, 0.08); color: var(--text-muted); padding: 2px 8px; border-radius: 8px; font-weight: 500;">🪐 Todas las aulas</span>`);

            const trainingBadge = act.is_training_level
                ? `<span style="background: rgba(245, 158, 11, 0.2); color: #fde047; border: 1px solid rgba(245, 158, 11, 0.4); padding: 2px 8px; border-radius: 8px; font-weight: 700;">🗺️ Nivel de Ruta (${act.training_grade || '?'}° Grado ${act.map_icon || '🏆'})</span>`
                : '';

            html += `
                <div class="classroom-item" style="cursor: default; align-items: center; margin-bottom: var(--space-md); flex-wrap: wrap; gap: 12px;">
                    <div class="classroom-item-info" style="min-width: 240px; flex: 1;">
                        <div class="classroom-icon">${icono}</div>
                        <div class="classroom-details">
                            <h4 style="margin: 0 0 4px 0; color: var(--text-primary); font-size: var(--text-md);">${act.title}</h4>
                            <p style="margin: 0; color: var(--text-secondary); font-size: var(--text-sm); display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                                <span style="background: rgba(99, 102, 241, 0.2); color: #93c5fd; padding: 2px 8px; border-radius: 8px; font-weight: 600;">${act.type || 'Actividad'}</span>
                                ${trainingBadge}
                                ${aulaBadge}
                                <span>• 📚 ${act.theme || 'Sin grado'}</span>
                                <span>• ❓ ${qCount} pregunta${qCount === 1 ? '' : 's'}</span>
                                <span>• 📅 ${new Date(act.created_at).toLocaleDateString()}</span>
                            </p>
                        </div>
                    </div>
                    <div class="activity-actions-row">
                        <button class="btn btn-activity-action btn-review" onclick="openReviewActivityModal(${act.id})">👁️ Revisar</button>
                        <button class="btn btn-activity-action btn-edit" onclick="openEditActivityModal(${act.id}, '${act.title.replace(/'/g, "\\'")}', '${act.type}', '${act.theme}', ${act.group_id || 'null'}, ${Boolean(act.is_training_level)}, '${act.training_grade || ''}', '${act.map_icon || '🏆'}')">✏️ Editar</button>
                        <button class="btn btn-activity-action btn-delete" onclick="deleteActivity(${act.id})">🗑️ Eliminar</button>
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
                        <button class="btn btn--outline btn--sm" style="padding: var(--space-sm) var(--space-md);" onclick="openEditActivityModal(${act.id}, '${act.title.replace(/'/g, "\\'")}', '${act.type}', '${act.theme}', ${act.group_id || 'null'}, ${Boolean(act.is_training_level)}, '${act.training_grade || ''}', '${act.map_icon || '🏆'}')">✏️ Editar</button>
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
                                <p>${g.code && g.code !== 'N/A' ? `Código: ${g.code} • ` : ''}${g.student_count || 0} estudiantes</p>
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

function openEditActivityModal(id, title, type, theme, groupId, isTrainingLevel, trainingGrade, mapIcon) {
    document.getElementById('editActivityId').value = id;
    document.getElementById('editActivityTitle').value = title;
    document.getElementById('editActivityType').value = type;
    document.getElementById('editActivityTheme').value = theme;
    
    // Detectar grado de la actividad (desde aula, theme o trainingGrade)
    let detectedGrade = '4';
    if (groupId && window.todasLasAulas) {
        const gObj = window.todasLasAulas.find(g => String(g.id) === String(groupId));
        if (gObj && gObj.name && gObj.name.startsWith('5')) detectedGrade = '5';
    } else if (theme && theme.includes('5')) {
        detectedGrade = '5';
    } else if (trainingGrade && String(trainingGrade).includes('5')) {
        detectedGrade = '5';
    }
    
    const editGradeSelect = document.getElementById('editActivityGrade');
    if (editGradeSelect) {
        editGradeSelect.value = detectedGrade;
    }
    updateEditTargetGroupOptions();

    const groupSelect = document.getElementById('editActivityTargetGroup');
    if (groupSelect) {
        groupSelect.value = (groupId !== undefined && groupId !== null) ? String(groupId) : 'ALL_GRADE';
    }

    const chkTraining = document.getElementById('editIsTrainingLevel');
    if (chkTraining) {
        chkTraining.checked = Boolean(isTrainingLevel);
        toggleEditTrainingOptions();
    }
    const gradeSelect = document.getElementById('editTrainingGrade');
    if (gradeSelect && trainingGrade) {
        gradeSelect.value = String(trainingGrade);
    }
    const iconSelect = document.getElementById('editTrainingIcon');
    if (iconSelect && mapIcon) {
        iconSelect.value = mapIcon;
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
    
    const editGradeSelect = document.getElementById('editActivityGrade');
    const selectedGrade = editGradeSelect ? editGradeSelect.value : '4';
    const groupSelect = document.getElementById('editActivityTargetGroup');
    const selectedGroupVal = groupSelect ? groupSelect.value : 'ALL_GRADE';

    let targetGroups = [];
    let groupId = null;

    if (selectedGroupVal === 'ALL_GRADE' || !selectedGroupVal) {
        const gradeGroups = (window.todasLasAulas || []).filter(g => String(g.name).startsWith(selectedGrade));
        targetGroups = gradeGroups.map(g => g.id);
        groupId = targetGroups[0] || null;
    } else {
        groupId = Number(selectedGroupVal);
        targetGroups = [groupId];
    }

    const chkTraining = document.getElementById('editIsTrainingLevel');
    const isTrainingLevel = chkTraining ? chkTraining.checked : false;
    const gradeSelect = document.getElementById('editTrainingGrade');
    const iconSelect = document.getElementById('editTrainingIcon');
    const trainingGrade = isTrainingLevel ? (gradeSelect ? gradeSelect.value : selectedGrade) : selectedGrade;
    const mapIcon = isTrainingLevel ? (iconSelect ? iconSelect.value : '🏆') : '🏆';
    
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
            group_id: groupId,
            target_groups: targetGroups,
            is_training_level: isTrainingLevel,
            training_grade: trainingGrade,
            map_icon: mapIcon
        };
        
        const res = await fetch(`/api/activities/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await res.json();
        
        if (result.success) {
            cachedDynamicMaps = {};
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
                    <div class="activity-actions-row">
                        <button class="btn btn-activity-action btn-review" onclick="openReviewActivityModal(${act.id})">👁️ Revisar</button>
                        <button class="btn btn-activity-action btn-edit" onclick="openEditActivityModal(${act.id}, '${act.title.replace(/'/g, "\\'")}', '${act.type}', '${act.theme}', ${act.group_id || 'null'}, ${Boolean(act.is_training_level)}, '${act.training_grade || ''}', '${act.map_icon || '🏆'}')">✏️ Editar</button>
                        <button class="btn btn-activity-action btn-delete" onclick="deleteActivity(${act.id})">🗑️ Eliminar</button>
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
    
    const gradeLetter = groupName ? String(groupName).charAt(0) : '4';
    const gradeSelect = document.getElementById('activityTargetGrade');
    if (gradeSelect) {
        gradeSelect.value = (gradeLetter === '5') ? '5' : '4';
    }
    updateTargetGroupOptions();
    
    const select = document.getElementById('activityTargetGroup');
    if (select && groupId) {
        select.value = String(groupId);
        onActivityTargetGroupChange();
    }
    
    const themeInput = document.getElementById('activityTheme');
    if (themeInput) {
        themeInput.focus();
        themeInput.placeholder = `Ej: Taller práctico para Aula ${groupName}`;
    }
    
    showAlert(`📍 Asignando actividad para Aula ${groupName}`);
}

function updateTargetGroupOptions() {
    const gradeSelect = document.getElementById('activityTargetGrade');
    const groupSelect = document.getElementById('activityTargetGroup');
    if (!groupSelect) return;

    const selectedGrade = gradeSelect ? gradeSelect.value : '4';
    const allGroups = window.todasLasAulas || [];
    const gradeGroups = allGroups.filter(g => String(g.name).startsWith(selectedGrade));

    let html = `<option value="ALL_GRADE">Todas las aulas de ${selectedGrade}° (General${gradeGroups.length ? ': ' + gradeGroups.map(g => g.name).join(', ') : ''})</option>`;
    gradeGroups.forEach(g => {
        html += `<option value="${g.id}">Solo Aula ${g.name}</option>`;
    });

    groupSelect.innerHTML = html;
    onActivityTargetGroupChange();
}

function onActivityTargetGradeChange() {
    updateTargetGroupOptions();
}

function updateEditTargetGroupOptions() {
    const gradeSelect = document.getElementById('editActivityGrade');
    const groupSelect = document.getElementById('editActivityTargetGroup');
    if (!groupSelect) return;

    const selectedGrade = gradeSelect ? gradeSelect.value : '4';
    const allGroups = window.todasLasAulas || [];
    const gradeGroups = allGroups.filter(g => String(g.name).startsWith(selectedGrade));

    let html = `<option value="ALL_GRADE">Todas las aulas de ${selectedGrade}° (General${gradeGroups.length ? ': ' + gradeGroups.map(g => g.name).join(', ') : ''})</option>`;
    gradeGroups.forEach(g => {
        html += `<option value="${g.id}">Solo Aula ${g.name}</option>`;
    });

    groupSelect.innerHTML = html;
}

function onEditActivityGradeChange() {
    updateEditTargetGroupOptions();
}

function populateGroupSelectors(groups) {
    if (!groups || !Array.isArray(groups)) return;
    window.todasLasAulas = groups;
    
    // 1. Selector en formulario de creación
    updateTargetGroupOptions();

    // 2. Selector en modal de edición
    updateEditTargetGroupOptions();

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
    const selectedVal = select ? select.value : "ALL_GRADE";
    const repSection = document.getElementById('activityReplicateSection');
    
    // Solo mostrar opción de replicar si seleccionó un aula puntual
    if (selectedVal && selectedVal !== "ALL_GRADE") {
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
                if (String(g.id) === String(selectedVal)) {
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
        const [perfRes, attRes] = await Promise.all([
            fetch(`/api/students/${studentId}/performance`),
            fetch(`/api/students/${studentId}/attempts`)
        ]);
        const perfData = await perfRes.json();
        const attData = await attRes.json();
        
        let html = '';

        if (perfData.success && perfData.topics && perfData.topics.length > 0) {
            html += `
                <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--color-border); border-radius: 12px; padding: 14px; margin-bottom: 16px;">
                    <h4 style="margin: 0 0 10px 0; font-size: 0.9rem; color: var(--text-primary); display: flex; align-items: center; gap: 6px;">
                        📊 Avance por tema
                    </h4>
                    <div style="display: flex; flex-direction: column; gap: 10px;">
            `;
            perfData.topics.forEach(t => {
                html += `
                    <div>
                        <div style="display: flex; justify-content: space-between; font-size: 0.8rem; margin-bottom: 4px;">
                            <span>${t.icon} ${t.name}</span>
                            <span style="font-weight: 700; color: ${t.color};">${t.percentage}%</span>
                        </div>
                        <div style="height: 8px; background: rgba(255,255,255,0.08); border-radius: 10px; overflow: hidden;">
                            <div style="width: ${t.percentage}%; height: 100%; background: ${t.color}; border-radius: 10px; transition: width 0.4s ease;"></div>
                        </div>
                    </div>
                `;
            });
            html += `
                    </div>
                </div>
            `;
        }

        html += '<h4 style="margin: 0 0 10px 0; font-size: 0.9rem; color: var(--text-secondary);">🕒 Historial de Actividades</h4>';
        if (attData.success && attData.attempts && attData.attempts.length > 0) {
            html += '<div style="display: flex; flex-direction: column; gap: 10px;">';
            attData.attempts.forEach(a => {
                const date = new Date(a.completed_at).toLocaleString();
                const icon = a.type === 'Examen' ? '📝' : '🎮';
                html += `
                    <div style="background: var(--bg-card); padding: 10px 15px; border-radius: 8px; border-left: 4px solid var(--color-primary); display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <h4 style="margin: 0; font-size: 0.95rem;">${icon} ${a.title}</h4>
                            <span style="font-size: 12px; color: var(--text-muted);">${date}</span>
                        </div>
                        <div style="font-weight: bold; color: var(--color-primary);">+${a.score} XP</div>
                    </div>
                `;
            });
            html += '</div>';
        } else {
            html += '<p style="text-align:center; color: var(--text-muted); margin-top: 10px;">Este estudiante aún no ha completado actividades.</p>';
        }

        content.innerHTML = html;
    } catch (err) {
        console.error(err);
        content.innerHTML = '<p style="color: var(--color-danger);">Error de conexión al cargar progreso.</p>';
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
                <div style="text-align: center; padding: 30px 20px; color: var(--text-secondary);">
                    <div style="font-size: 2.5rem; margin-bottom: 10px;">📝</div>
                    <p style="margin: 0 0 16px 0; font-size: 1rem;">Esta actividad aún no tiene preguntas configuradas.</p>
                    <button class="btn btn--sm" onclick="openAddQuestionModal()" style="border-radius: 20px;">➕ Agregar Primera Pregunta</button>
                </div>
            `;
        } else {
            let qHtml = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; padding-bottom: 10px; border-bottom: 1px solid rgba(255,255,255,0.08);">
                    <span style="font-size: 0.85rem; color: var(--text-secondary);">Preguntas registradas: <b style="color: #f8fafc;">${questions.length}</b></span>
                    <button class="btn btn--sm" style="border-radius: 20px; font-size: 0.8rem; padding: 6px 14px;" onclick="openAddQuestionModal()">➕ Agregar Pregunta</button>
                </div>
                <div style="display: flex; flex-direction: column; gap: 14px;">
            `;
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
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <span style="font-size: 0.8rem; font-weight: 700; color: #818cf8; text-transform: uppercase;">Pregunta ${index + 1}</span>
                                <span style="font-size: 0.75rem; background: rgba(255,255,255,0.08); padding: 2px 8px; border-radius: 8px; color: var(--text-muted);">${isOption ? '🔘 Opción Múltiple' : '✍️ Abierta'}</span>
                            </div>
                            <div style="display: flex; gap: 6px;">
                                <button class="btn btn--secondary btn--sm" style="padding: 4px 10px; font-size: 0.75rem; border-radius: 8px;" onclick="openEditQuestionModal(${index})" title="Editar pregunta">✏️ Editar</button>
                                <button class="btn btn--secondary btn--sm" style="background: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3); padding: 4px 8px; font-size: 0.75rem; border-radius: 8px;" onclick="deleteQuestionFromActivity(${q.id})" title="Eliminar pregunta">🗑️</button>
                            </div>
                        </div>
                        <h4 style="margin: 0 0 10px 0; font-size: 0.95rem; color: #f8fafc; font-weight: 600;">${cleanText}</h4>
                        ${graphicHtml ? `<div style="margin: 10px 0;">${graphicHtml}</div>` : ''}
                `;
                
                if (isOption) {
                    const opts = [
                        { label: 'A', text: q.a },
                        { label: 'B', text: q.b },
                        { label: 'C', text: q.c },
                        { label: 'D', text: q.d }
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

// GESTIÓN Y EDICIÓN DE PREGUNTAS EN ACTIVIDADES/TALLERES
function openEditQuestionModal(index) {
    if (!currentReviewActivity || !currentReviewActivity.preguntas || !currentReviewActivity.preguntas[index]) return;
    const q = currentReviewActivity.preguntas[index];

    const modal = document.getElementById('editQuestionModal');
    if (!modal) return;

    document.getElementById('editQuestionModalTitle').innerText = `✏️ Editar Pregunta ${index + 1}`;
    document.getElementById('editQuestionId').value = q.id || '';
    document.getElementById('editQuestionIndex').value = index;
    document.getElementById('editQuestionText').value = q.pregunta || '';
    document.getElementById('editOptionA').value = q.a || '';
    document.getElementById('editOptionB').value = q.b || '';
    document.getElementById('editOptionC').value = q.c || '';
    document.getElementById('editOptionD').value = q.d || '';

    // Determinar opción correcta seleccionada
    const correctVal = String(q.correcta || '').trim().toLowerCase();
    const optA = String(q.a || '').trim().toLowerCase();
    const optB = String(q.b || '').trim().toLowerCase();
    const optC = String(q.c || '').trim().toLowerCase();
    const optD = String(q.d || '').trim().toLowerCase();

    let selectVal = 'A';
    if (correctVal === 'b' || (optB && correctVal === optB)) {
        selectVal = 'B';
    } else if (correctVal === 'c' || (optC && correctVal === optC)) {
        selectVal = 'C';
    } else if (correctVal === 'd' || (optD && correctVal === optD)) {
        selectVal = 'D';
    } else if (correctVal === 'a' || (optA && correctVal === optA)) {
        selectVal = 'A';
    }
    document.getElementById('editCorrectOption').value = selectVal;

    modal.classList.add('active');
    modal.style.display = 'flex';
}

function openAddQuestionModal() {
    if (!currentReviewActivity) return;
    const modal = document.getElementById('editQuestionModal');
    if (!modal) return;

    document.getElementById('editQuestionModalTitle').innerText = '➕ Nueva Pregunta';
    document.getElementById('editQuestionId').value = '';
    document.getElementById('editQuestionIndex').value = '';
    document.getElementById('editQuestionText').value = '';
    document.getElementById('editOptionA').value = '';
    document.getElementById('editOptionB').value = '';
    document.getElementById('editOptionC').value = '';
    document.getElementById('editOptionD').value = '';
    document.getElementById('editCorrectOption').value = 'A';

    modal.classList.add('active');
    modal.style.display = 'flex';
}

function closeEditQuestionModal() {
    const modal = document.getElementById('editQuestionModal');
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
    }
}

async function saveQuestionModal() {
    if (!currentReviewActivity) return;
    const qId = document.getElementById('editQuestionId').value;
    const pregunta = document.getElementById('editQuestionText').value.trim();
    const a = document.getElementById('editOptionA').value.trim();
    const b = document.getElementById('editOptionB').value.trim();
    const c = document.getElementById('editOptionC').value.trim();
    const d = document.getElementById('editOptionD').value.trim();
    const selectedLetter = document.getElementById('editCorrectOption').value;

    if (!pregunta) {
        showAlert('⚠️ Por favor ingresa el enunciado de la pregunta.');
        return;
    }
    if (!a || !b || !c || !d) {
        showAlert('⚠️ Por favor completa las 4 opciones (A, B, C y D).');
        return;
    }

    let correcta = a;
    if (selectedLetter === 'B') correcta = b;
    if (selectedLetter === 'C') correcta = c;
    if (selectedLetter === 'D') correcta = d;

    const payload = {
        pregunta,
        tipo: 'opcion',
        a,
        b,
        c,
        d,
        correcta
    };

    try {
        let res;
        if (qId) {
            // Actualizar existente
            res = await fetch(`/api/activities/${currentReviewActivity.id}/questions/${qId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        } else {
            // Agregar nueva
            res = await fetch(`/api/activities/${currentReviewActivity.id}/questions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        }

        const data = await res.json();
        if (data.success) {
            closeEditQuestionModal();
            showAlert(qId ? '✅ Pregunta actualizada exitosamente.' : '✅ Pregunta agregada exitosamente.');
            await openReviewActivityModal(currentReviewActivity.id);
        } else {
            showAlert('❌ Error: ' + (data.error || 'No se pudo guardar la pregunta'));
        }
    } catch (err) {
        console.error(err);
        showAlert('❌ Error de conexión al guardar pregunta.');
    }
}

async function deleteQuestionFromActivity(questionId) {
    if (!currentReviewActivity) return;
    if (!confirm('¿Estás seguro de eliminar esta pregunta de la actividad?')) return;

    try {
        const res = await fetch(`/api/activities/${currentReviewActivity.id}/questions/${questionId}`, {
            method: 'DELETE'
        });
        const data = await res.json();
        if (data.success) {
            showAlert('🗑️ Pregunta eliminada correctamente.');
            await openReviewActivityModal(currentReviewActivity.id);
        } else {
            showAlert('❌ Error: ' + (data.error || 'No se pudo eliminar la pregunta'));
        }
    } catch (err) {
        console.error(err);
        showAlert('❌ Error de conexión al eliminar pregunta.');
    }
}

