class ActivityPlayer extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <style>
        .ap-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.8);
          display: none; justify-content: center; align-items: center;
          z-index: 9999; backdrop-filter: blur(5px);
          font-family: 'Inter', sans-serif;
        }
        .ap-overlay.active { display: flex; }
        
        .ap-container {
          background: #0B132B; /* Dark navy */
          width: 90%; max-width: 500px;
          border-radius: 20px;
          border: 1px solid #1C2A54;
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
          display: flex; flex-direction: column;
          overflow: hidden;
        }
        
        .ap-header {
          display: flex; justify-content: space-between; align-items: center;
          padding: 20px; background: rgba(255,255,255,0.02);
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        
        .ap-back-btn {
          background: none; border: none; color: #fff;
          font-size: 24px; cursor: pointer; padding: 0;
          display: flex; align-items: center; justify-content: center;
          transition: transform 0.2s;
        }
        .ap-back-btn:hover { transform: translateX(-3px); }
        
        .ap-title {
          font-weight: 600; font-size: 18px; color: #fff;
          flex-grow: 1; text-align: center;
        }
        
        .ap-timer {
          color: #A0AEC0; font-size: 14px;
          display: flex; align-items: center; gap: 6px;
        }
        
        .ap-progress-section {
          padding: 20px 20px 0 20px;
        }
        
        .ap-progress-bar-container {
          height: 8px; background: #1A264D;
          border-radius: 4px; overflow: hidden;
        }
        
        .ap-progress-fill {
          height: 100%; background: linear-gradient(90deg, #3B82F6, #8B5CF6);
          width: 0%; transition: width 0.3s ease;
        }
        
        .ap-progress-text {
          text-align: right; color: #A0AEC0; font-size: 12px;
          margin-top: 8px; font-weight: 500;
        }
        
        .ap-body {
          padding: 20px; flex-grow: 1;
        }
        
        .ap-question-text {
          color: #fff; font-size: 18px; font-weight: 500;
          margin: 0 0 24px 0; line-height: 1.4; text-align: center;
        }
        
        .ap-options {
          display: flex; flex-direction: column; gap: 12px;
        }
        
        .ap-option {
          display: flex; align-items: center;
          background: #141E3E;
          border: 2px solid #1C2A54;
          border-radius: 12px;
          padding: 16px; cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .ap-option:hover {
          background: #1A264D; border-color: #2D3E70;
        }
        
        .ap-option.selected {
          border-color: #10B981; /* Green */
          background: rgba(16, 185, 129, 0.1);
        }
        
        .ap-option-letter {
          width: 32px; height: 32px; border-radius: 50%;
          background: #fff; color: #0B132B; font-weight: 700;
          display: flex; justify-content: center; align-items: center;
          margin-right: 16px; flex-shrink: 0; font-size: 14px;
        }
        
        .ap-option-text {
          color: #E2E8F0; font-size: 16px; flex-grow: 1;
        }
        
        .ap-option-icon {
          display: none; color: #10B981;
          background: #fff; border-radius: 50%; width: 20px; height: 20px;
          align-items: center; justify-content: center; font-size: 12px;
        }
        
        .ap-option.selected .ap-option-icon { display: flex; }
        
        .ap-input-text {
          width: 100%; padding: 16px; border-radius: 12px;
          background: #141E3E; border: 2px solid #1C2A54;
          color: #fff; font-size: 16px; outline: none;
          transition: border-color 0.2s;
        }
        
        .ap-input-text:focus { border-color: #3B82F6; }
        
        .ap-footer {
          padding: 20px; display: flex; gap: 12px;
          background: rgba(255,255,255,0.02);
          border-top: 1px solid rgba(255,255,255,0.05);
        }
        
        .ap-btn {
          flex: 1; padding: 14px; border-radius: 10px;
          font-weight: 600; font-size: 15px; cursor: pointer;
          transition: transform 0.2s, opacity 0.2s; border: none;
        }
        .ap-btn:active { transform: scale(0.97); }
        .ap-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        
        .ap-btn-outline {
          background: transparent; color: #fff;
          border: 1px solid #2D3E70;
        }
        .ap-btn-outline:hover:not(:disabled) { background: rgba(255,255,255,0.05); }
        
        .ap-btn-solid {
          background: linear-gradient(90deg, #6366F1, #8B5CF6);
          color: #fff; box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
        }
        .ap-btn-solid:hover:not(:disabled) { opacity: 0.9; }
      </style>

      <div class="ap-overlay" id="apOverlay">
        <div class="ap-container">
          <div class="ap-header">
            <button class="ap-back-btn" id="apCloseBtn">←</button>
            <div class="ap-title" id="apTitle">Actividad</div>
            <div class="ap-timer">⏱️ <span id="apTimerDisplay">00:00</span></div>
          </div>
          
          <div class="ap-progress-section">
            <div class="ap-progress-bar-container">
              <div class="ap-progress-fill" id="apProgressBar"></div>
            </div>
            <div class="ap-progress-text" id="apProgressText">1 / 10</div>
          </div>

          <div class="ap-body">
            <h3 class="ap-question-text" id="apQuestionText">¿Pregunta?</h3>
            <div class="ap-options" id="apOptionsContainer">
              <!-- Opciones se inyectan acá -->
            </div>
          </div>

          <div class="ap-footer">
            <button class="ap-btn ap-btn-outline" id="apPrevBtn">← Anterior</button>
            <button class="ap-btn ap-btn-solid" id="apNextBtn">Siguiente</button>
          </div>
        </div>
      </div>
    `;

    this.querySelector('#apCloseBtn').addEventListener('click', () => this.hide());
    this.querySelector('#apPrevBtn').addEventListener('click', () => this.prevQuestion());
    this.querySelector('#apNextBtn').addEventListener('click', () => this.nextOrSubmit());
  }

  play(actividad, seccion, onComplete) {
    this.actividad = actividad;
    this.onComplete = onComplete;
    this.querySelector('#apTitle').innerText = actividad.tema || actividad.title || "Práctica";
    
    // Shuffle logic (Anti-macheteo)
    let questions = [...actividad.preguntas];
    seccion = seccion.toUpperCase();
    
    if (seccion === 'B') {
      questions.reverse();
    } else if (seccion === 'C') {
      const mid = Math.floor(questions.length / 2);
      questions = [...questions.slice(mid), ...questions.slice(0, mid)];
    } else if (seccion === 'D') {
      const evens = questions.filter((_, i) => i % 2 === 0);
      const odds = questions.filter((_, i) => i % 2 !== 0);
      questions = [...evens, ...odds];
    }
    
    this.shuffledQuestions = questions;
    this.currentIndex = 0;
    this.answers = new Array(questions.length).fill(null);
    
    this.startTimer();
    this.renderCurrentQuestion();
    
    this.querySelector('#apOverlay').classList.add('active');
  }

  startTimer() {
    this.seconds = 0;
    this.updateTimerDisplay();
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      this.seconds++;
      this.updateTimerDisplay();
    }, 1000);
  }
  
  updateTimerDisplay() {
    const m = String(Math.floor(this.seconds / 60)).padStart(2, '0');
    const s = String(this.seconds % 60).padStart(2, '0');
    this.querySelector('#apTimerDisplay').innerText = `${m}:${s}`;
  }

  renderCurrentQuestion() {
    const q = this.shuffledQuestions[this.currentIndex];
    this.querySelector('#apQuestionText').innerText = q.pregunta;
    
    // Update progress
    const total = this.shuffledQuestions.length;
    const current = this.currentIndex + 1;
    this.querySelector('#apProgressText').innerText = `${current} / ${total}`;
    this.querySelector('#apProgressBar').style.width = `${(current / total) * 100}%`;
    
    // Update buttons
    this.querySelector('#apPrevBtn').style.visibility = this.currentIndex === 0 ? 'hidden' : 'visible';
    const nextBtn = this.querySelector('#apNextBtn');
    if (this.currentIndex === total - 1) {
      nextBtn.innerText = "Finalizar";
    } else {
      nextBtn.innerText = "Siguiente";
    }
    
    // Render options
    const container = this.querySelector('#apOptionsContainer');
    container.innerHTML = "";
    
    if (q.tipo === "opcion") {
      const options = [
        { letter: 'A', text: q.a },
        { letter: 'B', text: q.b },
        { letter: 'C', text: q.c }
      ].filter(o => o.text && o.text.trim() !== "");
      
      options.forEach(opt => {
        const div = document.createElement('div');
        div.className = 'ap-option';
        if (this.answers[this.currentIndex] === opt.letter) {
          div.classList.add('selected');
        }
        
        div.innerHTML = `
          <div class="ap-option-letter">${opt.letter}</div>
          <div class="ap-option-text">${opt.text}</div>
          <div class="ap-option-icon">✓</div>
        `;
        
        div.addEventListener('click', () => this.selectOption(opt.letter));
        container.appendChild(div);
      });
    } else {
      // Abierta
      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'ap-input-text';
      input.placeholder = "Escribe tu respuesta aquí...";
      input.value = this.answers[this.currentIndex] || "";
      input.addEventListener('input', (e) => {
        this.answers[this.currentIndex] = e.target.value;
      });
      container.appendChild(input);
    }
  }
  
  selectOption(letter) {
    this.answers[this.currentIndex] = letter;
    this.renderCurrentQuestion(); // Re-render to show selected state
  }

  prevQuestion() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.renderCurrentQuestion();
    }
  }

  nextOrSubmit() {
    if (this.currentIndex < this.shuffledQuestions.length - 1) {
      this.currentIndex++;
      this.renderCurrentQuestion();
    } else {
      this.submit();
    }
  }

  submit() {
    clearInterval(this.timerInterval);
    let puntos = 0;
    
    this.shuffledQuestions.forEach((q, idx) => {
      let respuesta = this.answers[idx] ? this.answers[idx].trim().toLowerCase() : "";
      
      // Si es de opción, la respuesta guardada es 'A', 'B' o 'C'
      // Pero 'correcta' podría ser el texto "2" o la letra "A"?
      // En la base de datos se guarda el texto. Así que debemos comparar el texto de la opción.
      let textoSeleccionado = "";
      if (q.tipo === "opcion") {
         let userLetter = this.answers[idx]; // 'A', 'B', 'C'
         if (userLetter === 'A') textoSeleccionado = q.a;
         if (userLetter === 'B') textoSeleccionado = q.b;
         if (userLetter === 'C') textoSeleccionado = q.c;
         
         if (textoSeleccionado && textoSeleccionado.trim().toLowerCase() === q.correcta.trim().toLowerCase()) {
           puntos += 10;
         }
      } else {
        // Abierta
        if (respuesta === q.correcta.trim().toLowerCase()) {
          puntos += 10;
        }
      }
    });
    
    this.hide();
    if (this.onComplete) {
      this.onComplete(puntos);
    }
  }

  hide() {
    this.querySelector('#apOverlay').classList.remove('active');
    if (this.timerInterval) clearInterval(this.timerInterval);
  }
}

if (!customElements.get('activity-player')) {
    customElements.define('activity-player', ActivityPlayer);
}

window.playActivity = function(actividad, seccion, onComplete) {
  let player = document.querySelector('activity-player');
  if (!player) {
    player = document.createElement('activity-player');
    document.body.appendChild(player);
  }
  
  setTimeout(() => {
    player.play(actividad, seccion, onComplete);
  }, 10);
};
