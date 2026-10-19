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
          width: 94%; max-width: 580px;
          max-height: 92vh;
          border-radius: 20px;
          border: 1px solid #1C2A54;
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
          display: flex; flex-direction: column;
          overflow-y: auto;
          overflow-x: hidden;
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
          height: 10px; background: #1A264D;
          border-radius: 25px; overflow: hidden;
        }
        
        .ap-progress-fill {
          height: 100%; background: linear-gradient(90deg, #3B82F6, #8B5CF6);
          width: 0%; transition: width 0.3s ease; border-radius: 25px;
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
        
        .ap-option.correct {
          border-color: #10B981; /* Green */
          background: rgba(16, 185, 129, 0.2);
        }
        
        .ap-option.incorrect {
          border-color: #EF4444; /* Red */
          background: rgba(239, 68, 68, 0.2);
        }
        
        .ap-option.locked {
          pointer-events: none;
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
          display: none; font-weight: bold;
          border-radius: 50%; width: 24px; height: 24px;
          align-items: center; justify-content: center; font-size: 14px;
        }
        
        .ap-option.correct .ap-option-icon { 
          display: flex; color: #fff; background: #10B981; content: "✓";
        }
        .ap-option.incorrect .ap-option-icon { 
          display: flex; color: #fff; background: #EF4444; content: "✗";
        }
        
        .ap-input-text {
          width: 100%; padding: 16px; border-radius: 12px;
          background: #141E3E; border: 2px solid #1C2A54;
          color: #fff; font-size: 16px; outline: none;
          transition: border-color 0.2s;
        }
        
        .ap-input-text:focus { border-color: #3B82F6; }
        
        .ap-correct-badge {
          display: inline-block;
          font-size: 11px;
          background: #10B981;
          color: #fff;
          padding: 2px 8px;
          border-radius: 6px;
          margin-left: 8px;
          font-weight: 700;
          letter-spacing: 0.3px;
          vertical-align: middle;
        }

        .ap-feedback {
          margin-top: 16px;
          padding: 12px 16px;
          border-radius: 12px;
          font-size: 14px;
          line-height: 1.4;
          display: flex;
          align-items: center;
          gap: 12px;
          animation: apFadeIn 0.25s ease-out forwards;
        }

        @keyframes apFadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .ap-feedback--correct {
          background: rgba(16, 185, 129, 0.15);
          border: 1px solid #10B981;
          color: #A7F3D0;
        }

        .ap-feedback--incorrect {
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid #EF4444;
          color: #FECACA;
        }

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
            <div class="ap-graphic-container" id="apGraphicContainer" style="display: none; margin: 0 auto 20px auto; width: 100%;"></div>
            <div class="ap-options" id="apOptionsContainer">
              <!-- Opciones se inyectan acá -->
            </div>
            <div id="apFeedbackContainer"></div>
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

  resolveCorrectText(q) {
    if (!q) return '';
    const raw = String(q.correcta !== undefined && q.correcta !== null ? q.correcta : (q.correct_answer || '')).trim();
    const upper = raw.toUpperCase();
    if (upper === 'A' && q.a) return String(q.a).trim();
    if (upper === 'B' && q.b) return String(q.b).trim();
    if (upper === 'C' && q.c) return String(q.c).trim();
    if (upper === 'D' && q.d) return String(q.d).trim();
    return raw;
  }

  buildFourOptions(q) {
    const correctText = this.resolveCorrectText(q);
    let rawList = [q.a, q.b, q.c, q.d]
      .filter(t => t !== undefined && t !== null && String(t).trim() !== "")
      .map(t => String(t).trim());

    if (correctText && !rawList.some(item => item.toLowerCase() === correctText.toLowerCase())) {
      rawList.unshift(correctText);
    }

    // Deduplicar case-insensitive
    const seen = new Set();
    rawList = rawList.filter(item => {
      const lower = item.toLowerCase();
      if (seen.has(lower)) return false;
      seen.add(lower);
      return true;
    });

    // Asegurar 4 opciones generando distractores matemáticos válidos si faltan
    while (rawList.length < 4) {
      let candidate = null;
      const cleanNum = correctText.replace(/\./g, '').replace(',', '.');
      const num = parseFloat(cleanNum);

      if (!isNaN(num)) {
        const deltas = [2, -2, 5, -5, 10, -10, 1, -1, 15, -15, 20, -20, 50, 100];
        for (const d of deltas) {
          const val = num + d;
          if (val >= 0) {
            let formatted = String(val);
            if (correctText.includes('.') && val >= 1000) {
              formatted = val.toLocaleString('es-CO');
            }
            if (!rawList.some(o => o.toLowerCase() === formatted.toLowerCase())) {
              candidate = formatted;
              break;
            }
          }
        }
      } else if (correctText.includes('/')) {
        const match = correctText.match(/(\d+)\s*\/\s*(\d+)/);
        if (match) {
          const n = parseInt(match[1], 10);
          const d = parseInt(match[2], 10);
          const fracCandidates = [
            `${n + 1}/${d}`,
            `${Math.max(1, n - 1)}/${d}`,
            `${n}/${d + 1}`,
            `${n}/${Math.max(2, d - 1)}`,
            `${n + 2}/${d}`,
            `1/${d}`
          ];
          for (const fc of fracCandidates) {
            if (!rawList.some(o => o.toLowerCase() === fc.toLowerCase())) {
              candidate = fc;
              break;
            }
          }
        }
      }

      if (!candidate) {
        const fallbacks = ['Ninguna de las anteriores', 'No se puede determinar', 'Todas las anteriores', 'Resultado indefinido'];
        candidate = fallbacks.find(f => !rawList.some(o => o.toLowerCase() === f.toLowerCase())) || `Opción ${rawList.length + 1}`;
      }
      rawList.push(candidate);
    }

    // Barajar orden de las 4 opciones
    for (let i = rawList.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [rawList[i], rawList[j]] = [rawList[j], rawList[i]];
    }

    const letters = ['A', 'B', 'C', 'D'];
    return rawList.slice(0, 4).map((text, idx) => ({
      letter: letters[idx],
      text
    }));
  }

  play(actividad, seccion, onComplete) {
    this.actividad = actividad;
    this.onComplete = onComplete;
    this.querySelector('#apTitle').innerText = actividad.tema || actividad.title || "Práctica";
    
    // Shuffle logic (Anti-macheteo)
    let questions = [...actividad.preguntas];
    seccion = (seccion || 'A').toUpperCase();
    
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
    
    // Preparar opciones de la A a la D y resolver respuesta correcta
    questions = questions.map(q => {
      const qCopy = { ...q };
      if (qCopy.tipo === "opcion") {
        qCopy._correctText = this.resolveCorrectText(qCopy);
        qCopy._shuffledOptions = this.buildFourOptions(qCopy);
      }
      return qCopy;
    });

    this.shuffledQuestions = questions;
    this.currentIndex = 0;
    this.answers = new Array(questions.length).fill(null);
    this.results = new Array(questions.length).fill(null);
    
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
    
    // Parsear gráfico dinámico si contiene tag
    let cleanText = q.pregunta;
    let graphicHtml = '';
    if (window.FractionGraphics && typeof window.FractionGraphics.parseQuestion === 'function') {
      const parsed = window.FractionGraphics.parseQuestion(q.pregunta);
      cleanText = parsed.cleanText;
      graphicHtml = parsed.graphicHtml;
    }

    this.querySelector('#apQuestionText').innerText = cleanText;
    
    const graphicContainer = this.querySelector('#apGraphicContainer');
    if (graphicContainer) {
      if (graphicHtml) {
        graphicContainer.innerHTML = graphicHtml;
        graphicContainer.style.display = 'block';
      } else {
        graphicContainer.innerHTML = '';
        graphicContainer.style.display = 'none';
      }
    }
    
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
    
    // Render options and feedback
    const container = this.querySelector('#apOptionsContainer');
    container.innerHTML = "";
    const feedbackContainer = this.querySelector('#apFeedbackContainer');
    if (feedbackContainer) feedbackContainer.innerHTML = "";
    
    if (q.tipo === "opcion") {
      let options = q._shuffledOptions;
      if (!options || options.length === 0) {
        q._correctText = this.resolveCorrectText(q);
        options = this.buildFourOptions(q);
        q._shuffledOptions = options;
      }

      const targetCorrect = (q._correctText || this.resolveCorrectText(q)).trim().toLowerCase();
      const hasAnswered = this.answers[this.currentIndex] !== null;
      const selectedLetter = this.answers[this.currentIndex];
      const isStudentCorrect = this.results[this.currentIndex] === true;
      const correctOpt = options.find(opt => opt.text.trim().toLowerCase() === targetCorrect);
      
      options.forEach(opt => {
        const div = document.createElement('div');
        div.className = 'ap-option';
        
        if (hasAnswered) {
          div.classList.add('locked');
          const isSelected = selectedLetter === opt.letter;
          const isThisCorrectOption = opt.text.trim().toLowerCase() === targetCorrect;

          if (isSelected && isStudentCorrect) {
            // Estudiante seleccionó la opción correcta
            div.classList.add('correct');
            div.innerHTML = `
              <div class="ap-option-letter">${opt.letter}</div>
              <div class="ap-option-text">${opt.text}</div>
              <div class="ap-option-icon">✓</div>
            `;
          } else if (isSelected && !isStudentCorrect) {
            // Estudiante seleccionó opción incorrecta
            div.classList.add('incorrect');
            div.innerHTML = `
              <div class="ap-option-letter">${opt.letter}</div>
              <div class="ap-option-text">${opt.text}</div>
              <div class="ap-option-icon">✗</div>
            `;
          } else if (isThisCorrectOption) {
            // Estudiante falló, pero esta es la respuesta correcta -> ¡MOSTRARLA CLARAMENTE EN VERDE!
            div.classList.add('correct');
            div.style.boxShadow = '0 0 15px rgba(16, 185, 129, 0.4)';
            div.innerHTML = `
              <div class="ap-option-letter">${opt.letter}</div>
              <div class="ap-option-text">${opt.text} <span class="ap-correct-badge">✓ Respuesta correcta</span></div>
              <div class="ap-option-icon">✓</div>
            `;
          } else {
            // Demás opciones no seleccionadas
            div.style.opacity = '0.45';
            div.innerHTML = `
              <div class="ap-option-letter">${opt.letter}</div>
              <div class="ap-option-text">${opt.text}</div>
              <div class="ap-option-icon" style="display:none;"></div>
            `;
          }
        } else {
          div.innerHTML = `
            <div class="ap-option-letter">${opt.letter}</div>
            <div class="ap-option-text">${opt.text}</div>
            <div class="ap-option-icon" style="display:none;"></div>
          `;
          div.addEventListener('click', () => this.selectOption(opt.letter, opt.text));
        }
        
        container.appendChild(div);
      });

      // Mostrar banner explicativo de retroalimentación
      if (hasAnswered && feedbackContainer) {
        if (isStudentCorrect) {
          feedbackContainer.innerHTML = `
            <div class="ap-feedback ap-feedback--correct">
              <span style="font-size: 1.25rem;">🎉</span>
              <div><b>¡Excelente!</b> Tu respuesta es correcta.</div>
            </div>
          `;
        } else {
          const correctLabel = correctOpt ? `opción <b>${correctOpt.letter}) ${correctOpt.text}</b>` : `<b>${targetCorrect}</b>`;
          feedbackContainer.innerHTML = `
            <div class="ap-feedback ap-feedback--incorrect">
              <span style="font-size: 1.25rem;">💡</span>
              <div>Respuesta incorrecta. La respuesta correcta era la ${correctLabel}.</div>
            </div>
          `;
        }
      }
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
  
  selectOption(letter, text) {
    if (this.answers[this.currentIndex] !== null) return; // Ya respondió
    
    this.answers[this.currentIndex] = letter;
    const q = this.shuffledQuestions[this.currentIndex];
    const targetCorrect = (q._correctText || this.resolveCorrectText(q)).trim().toLowerCase();
    
    const isCorrect = (text.trim().toLowerCase() === targetCorrect);
    this.results[this.currentIndex] = isCorrect;
    
    this.renderCurrentQuestion(); 
    
    if (isCorrect) {
       this.fireConfetti();
    }
  }

  fireConfetti() {
    if (typeof confetti !== 'undefined') {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#10B981', '#3B82F6', '#8B5CF6']
        });
    }
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
      if (q.tipo === "opcion") {
         if (this.results[idx] === true) {
           puntos += 10;
         }
      } else {
        // Abierta (se evalúa al final porque escriben)
        const targetCorrect = (q._correctText || this.resolveCorrectText(q)).trim().toLowerCase();
        let respuesta = this.answers[idx] ? this.answers[idx].trim().toLowerCase() : "";
        if (respuesta === targetCorrect) {
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
