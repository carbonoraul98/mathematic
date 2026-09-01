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

// Subir Excel con loader
async function uploadExcel() {
    const fileInput = document.getElementById('excelFile');
    const uploadBtn = document.getElementById('uploadBtn');
    const uploadBtnText = document.getElementById('uploadBtnText');
    const uploadSpinner = document.getElementById('uploadSpinner');
    const progressContainer = document.getElementById('progressContainer');
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');

    if (!fileInput.files.length) {
        showAlert('❌ Seleccioná un archivo Excel');
        return;
    }

    // Mostrar loader
    uploadBtn.disabled = true;
    uploadBtnText.textContent = 'CARGANDO...';
    uploadSpinner.style.display = 'inline-block';
    progressContainer.style.display = 'block';

    // Simular progreso (0% a 90%)
    let progress = 0;
    const progressInterval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress > 90) progress = 90;
        progressBar.style.width = progress + '%';
        progressText.textContent = Math.round(progress) + '%';
    }, 300);

    const formData = new FormData();
    formData.append('excel', fileInput.files[0]);

    try {
        const res = await fetch('/api/students/upload', {
            method: 'POST',
            body: formData
        });

        clearInterval(progressInterval);
        progressBar.style.width = '100%';
        progressText.textContent = '100%';

        const result = await res.json();
        
        setTimeout(() => {
            // Resetear UI
            uploadBtn.disabled = false;
            uploadBtnText.textContent = 'CARGAR EXCEL';
            uploadSpinner.style.display = 'none';
            progressContainer.style.display = 'none';
            progressBar.style.width = '0%';
            
            // Resetear input
            fileInput.value = '';
            document.getElementById('fileUploadText').textContent = 'Seleccionar archivo Excel';
            document.querySelector('.file-upload-label').classList.remove('has-file');

            if (result.success) {
                showAlert(`✅ ${result.count} estudiantes cargados`);
                loadStudents();
            } else {
                showAlert('❌ Error al cargar el Excel');
            }
        }, 500);
    } catch (error) {
        clearInterval(progressInterval);
        
        uploadBtn.disabled = false;
        uploadBtnText.textContent = 'CARGAR EXCEL';
        uploadSpinner.style.display = 'none';
        progressContainer.style.display = 'none';
        
        console.error('Error subiendo Excel:', error);
        showAlert('❌ Error al subir el archivo');
    }
}

// Manejar selección de archivo
document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('excelFile');
    if (fileInput) {
        fileInput.addEventListener('change', function() {
            const label = document.querySelector('.file-upload-label');
            const text = document.getElementById('fileUploadText');
            
            if (this.files && this.files.length > 0) {
                const fileName = this.files[0].name;
                text.textContent = fileName;
                label.classList.add('has-file');
            } else {
                text.textContent = 'Seleccionar archivo Excel';
                label.classList.remove('has-file');
            }
        });
    }
});

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

async function teacherLogin() {
  let user = document.getElementById("teacherUser").value;
  let pass = document.getElementById("teacherPass").value;

  try {
    const res = await fetch('/api/teachers/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: user, password: pass })
    });

    const result = await res.json();
    if (result.success) {
      showScreen("teacherPanel");
      loadStudents();
    } else {
      document.getElementById("teacherResult").innerHTML =
        "<br>❌ Usuario o contraseña incorrecta";
    }
  } catch (error) {
    console.error('Error en login de profesor:', error);
    document.getElementById("teacherResult").innerHTML =
      "<br>❌ Error de conexión";
  }
}

function crearEstudiante() {
  let grado = document.getElementById("studentGrade").value;
  let nombre = document.getElementById("studentName").value;
  let usuario = document.getElementById("studentUser").value;
  let password = document.getElementById("studentPassword").value;
  let apellido = nombre.split(" ")[0].toLowerCase();
  let estudiante = { grado, nombre, usuario, password, apellido, puntos: 0 };
  estudiantes.push(estudiante);
  estudiantes.sort((a, b) => a.apellido.localeCompare(b.apellido));
  mostrarEstudiantes();
  showAlert("✅ Estudiante creado");
  
  // Limpiar campos
  document.getElementById("studentName").value = "";
  document.getElementById("studentUser").value = "";
  document.getElementById("studentPassword").value = "";
}

function mostrarEstudiantes() {
  let lista = document.getElementById("studentsList");
  lista.innerHTML = "";
  let grupos = {};
  estudiantes.forEach((e) => {
    let grupoKey = e.group_name || e.grado;
    if (!grupos[grupoKey]) {
      grupos[grupoKey] = [];
    }
    grupos[grupoKey].push(e);
  });
  for (let grupo in grupos) {
    lista.innerHTML += `<div class="card"><h2>📚 ${grupo}</h2></div>`;
    grupos[grupo].forEach((e) => {
      let nombre = e.full_name || e.nombre;
      let usuario = e.username || e.usuario;
      lista.innerHTML += `<div class="card"><h3>👤 ${nombre}</h3><p>🆔 ${usuario}</p></div>`;
    });
  }
}

async function studentLogin() {
  let user = document.getElementById("studentLoginUser").value;
  let pass = document.getElementById("studentLoginPass").value;
  
  try {
    const res = await fetch('/api/students/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: user, password: pass })
    });
    
    const result = await res.json();
    if (result.success) {
      estudianteActual = result.student;
      showScreen("studentPanel");
      mostrarPendientes();
    } else {
      showAlert("❌ Error de información");
    }
  } catch (error) {
    console.error('Error en login:', error);
    showAlert("❌ Error de conexión");
  }
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
  preguntasTemp.forEach((p, index) => {
    lista.innerHTML += `<div class="card"><h3>❓ ${p.pregunta}</h3><p>Tipo: ${p.tipo}</p></div>`;
  });
}

function crearActividad() {
  let gradoBase = document.getElementById("activityTargetGrade").value;
  let tipo = document.getElementById("activityType").value;
  let tema = document.getElementById("activityTheme").value;
  let actividad = { tipo, tema, gradoBase, preguntas: [...preguntasTemp] };
  actividades.push(actividad);
  preguntasTemp = [];
  mostrarPreguntas();
  showAlert("✅ Actividad creada para Grado " + gradoBase);
  
  // Limpiar campo
  document.getElementById("activityTheme").value = "";
}

function mostrarPendientes() {
  let contenedor = document.getElementById("studentActivities");
  contenedor.innerHTML = "";
  
  if (!estudianteActual) return;
  
  let gradoAlumnoBase = estudianteActual.grado.charAt(0); // Ej: de "1B" extrae "1"
  
  actividades.forEach((a, index) => {
    // Solo muestra actividades cuyo gradoBase coincida con el número del estudiante
    if (a.gradoBase === gradoAlumnoBase || !a.gradoBase) {
      contenedor.innerHTML += `<div class="card"><h2>📚 ${a.tema}</h2><p>📝 ${a.tipo}</p><p>⏳ Pendiente</p><button class="btn" onclick="realizarActividad(${index})">REALIZAR</button></div>`;
    }
  });
}

function realizarActividad(index) {
  let actividad = actividades[index];
  
  if (!estudianteActual) return;
  
  let seccion = estudianteActual.grado.charAt(1) || "A"; // Extrae "A", "B", "C" o "D"
  
  window.playActivity(actividad, seccion, (puntosObtenidos) => {
    if (estudianteActual.puntos === undefined) estudianteActual.puntos = 0;
    estudianteActual.puntos += puntosObtenidos;
    
    showAlert("✅ Actividad terminada. Puntos sumados: " + puntosObtenidos);
  });
}

function showTeacherSection(id) {
  document.querySelectorAll("#teacherPanel .section").forEach((sec) => {
    sec.classList.remove("show");
  });
  document.getElementById(id).classList.add("show");
  
  if (id === "gradesSection") {
    mostrarNotas();
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

// Cargar estudiantes al iniciar si estamos en el panel del profesor
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('teacherPanel')) {
        loadStudents();
    }
});
