/**
 * ProjectorPlayer - Modo Proyector / Actividad a Proyectar
 * Diseñado para proyección en pantalla gigante, TV o video beam en el aula de clases.
 * Permite al docente moderar el debate colectivo, seleccionar la opción indicada
 * por los alumnos y brindar retroalimentación formativa inmediata (verde/rojo) sin alterar notas.
 */
class ProjectorPlayer extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <style>
        .pj-overlay {
          position: fixed;
          inset: 0;
          background: radial-gradient(circle at 50% 20%, #151b3b 0%, #080c1b 100%);
          display: none;
          flex-direction: column;
          z-index: 10000;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          color: #f8fafc;
          overflow-y: auto;
          overflow-x: hidden;
          padding: 16px 24px 30px 24px;
          box-sizing: border-box;
        }
        .pj-overlay.active {
          display: flex;
        }
        
        /* Barra superior de proyección */
        .pj-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 20px;
          background: rgba(22, 27, 54, 0.85);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(99, 102, 241, 0.3);
          border-radius: 16px;
          margin-bottom: 16px;
          gap: 16px;
          flex-wrap: wrap;
        }
        .pj-title-group {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        .pj-badge {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: #ffffff;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 700;
          letter-spacing: 0.5px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.35);
        }
        .pj-activity-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #ffffff;
          margin: 0;
          letter-spacing: -0.3px;
        }
        .pj-top-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .pj-btn {
          border: none;
          border-radius: 10px;
          padding: 10px 18px;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .pj-btn-fullscreen {
          background: rgba(255, 255, 255, 0.08);
          color: #e2e8f0;
          border: 1px solid rgba(255, 255, 255, 0.15);
        }
        .pj-btn-fullscreen:hover {
          background: rgba(255, 255, 255, 0.15);
          color: #ffffff;
          transform: translateY(-1px);
        }
        .pj-btn-close {
          background: rgba(239, 68, 68, 0.15);
          color: #fca5a5;
          border: 1px solid rgba(239, 68, 68, 0.35);
        }
        .pj-btn-close:hover {
          background: rgba(239, 68, 68, 0.3);
          color: #ffffff;
          transform: translateY(-1px);
        }

        /* Carrusel de preguntas (Píldoras para saltar) */
        .pj-nav-pills {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: rgba(15, 23, 42, 0.7);
          border-radius: 14px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          margin-bottom: 20px;
          overflow-x: auto;
          scrollbar-width: thin;
        }
        .pj-pill {
          min-width: 38px;
          height: 38px;
          padding: 0 10px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: #cbd5e1;
          font-size: 0.95rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          flex-shrink: 0;
        }
        .pj-pill:hover {
          background: rgba(99, 102, 241, 0.25);
          border-color: #818cf8;
          color: #ffffff;
        }
        .pj-pill.active {
          background: #6366f1;
          border-color: #818cf8;
          color: #ffffff;
          box-shadow: 0 0 14px rgba(99, 102, 241, 0.6);
          transform: scale(1.05);
        }
        .pj-pill.correct {
          background: rgba(16, 185, 129, 0.25);
          border-color: #10b981;
          color: #34d399;
        }
        .pj-pill.incorrect {
          background: rgba(239, 68, 68, 0.25);
          border-color: #ef4444;
          color: #f87171;
        }

        /* Escenario Central de Proyección */
        .pj-stage {
          flex: 1;
          display: flex;
          flex-direction: column;
          max-width: 1100px;
          width: 100%;
          margin: 0 auto;
          background: rgba(15, 23, 42, 0.85);
          border: 1px solid rgba(99, 102, 241, 0.25);
          border-radius: 24px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
          padding: 32px 36px;
          box-sizing: border-box;
          backdrop-filter: blur(14px);
        }

        .pj-question-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 14px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }
        .pj-question-number {
          font-size: 1.15rem;
          font-weight: 800;
          color: #818cf8;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .pj-question-type {
          font-size: 0.9rem;
          color: #94a3b8;
          background: rgba(255, 255, 255, 0.06);
          padding: 4px 12px;
          border-radius: 20px;
        }

        .pj-question-title {
          font-size: 1.7rem;
          font-weight: 700;
          color: #ffffff;
          line-height: 1.45;
          margin: 0 0 24px 0;
          text-align: left;
        }

        .pj-graphics-wrapper {
          display: flex;
          justify-content: center;
          margin-bottom: 24px;
          width: 100%;
        }

        /* Opciones en rejilla grande (Modo Pantalla) */
        .pj-options-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(420px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }
        @media (max-width: 768px) {
          .pj-options-grid {
            grid-template-columns: 1fr;
          }
          .pj-question-title {
            font-size: 1.35rem;
          }
          .pj-stage {
            padding: 20px;
          }
        }

        .pj-option-card {
          display: flex;
          align-items: center;
          background: rgba(30, 41, 74, 0.7);
          border: 2px solid rgba(99, 102, 241, 0.25);
          border-radius: 16px;
          padding: 18px 22px;
          cursor: pointer;
          transition: all 0.22s ease;
          user-select: none;
        }
        .pj-option-card:hover {
          background: rgba(43, 56, 102, 0.9);
          border-color: #818cf8;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(99, 102, 241, 0.25);
        }
        .pj-opt-letter {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: #ffffff;
          color: #0b132b;
          font-size: 1.25rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 18px;
          flex-shrink: 0;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
        }
        .pj-opt-text {
          font-size: 1.25rem;
          color: #f1f5f9;
          font-weight: 600;
          flex: 1;
          line-height: 1.35;
        }
        .pj-opt-status-icon {
          font-size: 1.5rem;
          font-weight: bold;
          margin-left: 12px;
          display: none;
        }

        /* Estados de respuesta */
        .pj-option-card.correct {
          background: rgba(16, 185, 129, 0.22) !important;
          border-color: #10b981 !important;
          box-shadow: 0 0 25px rgba(16, 185, 129, 0.45) !important;
        }
        .pj-option-card.correct .pj-opt-letter {
          background: #10b981;
          color: #ffffff;
        }
        .pj-option-card.correct .pj-opt-status-icon {
          display: inline-block;
          color: #10b981;
        }

        .pj-option-card.incorrect {
          background: rgba(239, 68, 68, 0.22) !important;
          border-color: #ef4444 !important;
          box-shadow: 0 0 25px rgba(239, 68, 68, 0.45) !important;
        }
        .pj-option-card.incorrect .pj-opt-letter {
          background: #ef4444;
          color: #ffffff;
        }
        .pj-option-card.incorrect .pj-opt-status-icon {
          display: inline-block;
          color: #ef4444;
        }

        .pj-option-card.locked {
          pointer-events: none;
        }
        .pj-option-card.dimmed {
          opacity: 0.4;
        }

        /* Banner de retroalimentación pedagógica */
        .pj-feedback-banner {
          border-radius: 16px;
          padding: 16px 22px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-top: 10px;
          margin-bottom: 24px;
          animation: pjFadeIn 0.25s ease-out;
          flex-wrap: wrap;
        }
        @keyframes pjFadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .pj-feedback-banner--correct {
          background: rgba(16, 185, 129, 0.18);
          border: 1px solid #10b981;
          color: #a7f3d0;
        }
        .pj-feedback-banner--incorrect {
          background: rgba(239, 68, 68, 0.18);
          border: 1px solid #ef4444;
          color: #fecaca;
        }
        .pj-feedback-text {
          font-size: 1.15rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        /* Entrada de texto para pregunta abierta */
        .pj-open-box {
          display: flex;
          flex-direction: column;
          gap: 14px;
          margin-bottom: 24px;
        }
        .pj-open-input {
          width: 100%;
          padding: 18px 20px;
          background: rgba(30, 41, 74, 0.7);
          border: 2px solid rgba(99, 102, 241, 0.3);
          border-radius: 14px;
          color: #ffffff;
          font-size: 1.25rem;
          outline: none;
          box-sizing: border-box;
        }
        .pj-open-input:focus {
          border-color: #818cf8;
          box-shadow: 0 0 16px rgba(99, 102, 241, 0.35);
        }

        /* Barra de control inferior */
        .pj-controls {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 20px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          gap: 14px;
          flex-wrap: wrap;
        }
        .pj-btn-nav {
          background: rgba(255, 255, 255, 0.08);
          color: #e2e8f0;
          border: 1px solid rgba(255, 255, 255, 0.15);
          font-size: 1.05rem;
          padding: 12px 22px;
          border-radius: 12px;
        }
        .pj-btn-nav:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.16);
          color: #ffffff;
          transform: translateY(-1px);
        }
        .pj-btn-nav:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }
        .pj-btn-primary {
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          color: #ffffff;
          font-size: 1.05rem;
          padding: 12px 26px;
          border-radius: 12px;
          box-shadow: 0 6px 20px rgba(79, 70, 229, 0.4);
        }
        .pj-btn-primary:hover {
          opacity: 0.93;
          transform: translateY(-1px);
        }
        .pj-btn-retry {
          background: rgba(245, 158, 11, 0.15);
          color: #fbbf24;
          border: 1px solid rgba(245, 158, 11, 0.35);
          font-size: 0.95rem;
          padding: 10px 18px;
          border-radius: 10px;
        }
        .pj-btn-retry:hover {
          background: rgba(245, 158, 11, 0.28);
          color: #ffffff;
        }

        /* Modal de Fin de Proyección */
        .pj-summary-modal {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(10px);
          display: none;
          align-items: center;
          justify-content: center;
          z-index: 10001;
          padding: 20px;
        }
        .pj-summary-card {
          background: #0f172a;
          border: 2px solid #6366f1;
          border-radius: 24px;
          padding: 36px 40px;
          max-width: 520px;
          width: 100%;
          text-align: center;
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.7);
        }
      </style>

      <div class="pj-overlay" id="pjOverlay">
        <!-- BARRA SUPERIOR -->
        <header class="pj-topbar">
          <div class="pj-title-group">
            <span class="pj-badge">📽️ MODO PROYECTOR</span>
            <h2 class="pj-activity-title" id="pjActivityTitle">Actividad</h2>
          </div>
          <div class="pj-top-actions">
            <button class="pj-btn pj-btn-fullscreen" id="pjFullscreenBtn" title="Pantalla completa para el proyector">
              <span>🖥️</span> <span>Pantalla Completa</span>
            </button>
            <button class="pj-btn pj-btn-close" id="pjCloseBtn" title="Salir de la proyección">
              <span>✕</span> <span>Cerrar</span>
            </button>
          </div>
        </header>

        <!-- PÍLDORAS DE NAVEGACIÓN -->
        <nav class="pj-nav-pills" id="pjPillsContainer" aria-label="Navegador de preguntas"></nav>

        <!-- ESCENARIO PRINCIPAL -->
        <main class="pj-stage">
          <div class="pj-question-header">
            <span class="pj-question-number" id="pjQuestionNumber">PREGUNTA 1 DE 10</span>
            <span class="pj-question-type" id="pjQuestionType">Opción Múltiple</span>
          </div>

          <h3 class="pj-question-title" id="pjQuestionTitle">¿Pregunta?</h3>
          <div class="pj-graphics-wrapper" id="pjGraphicsWrapper" style="display: none;"></div>

          <div id="pjBodyContent">
            <!-- Las opciones o input se inyectan acá -->
          </div>

          <div id="pjFeedbackSlot"></div>

          <!-- CONTROLES INFERIORES -->
          <footer class="pj-controls">
            <button class="pj-btn pj-btn-nav" id="pjPrevBtn">
              <span>⬅️</span> <span>Anterior</span>
            </button>
            
            <div style="display: flex; gap: 10px; align-items: center;">
              <button class="pj-btn pj-btn-retry" id="pjRetryBtn" style="display: none;">
                <span>🔄</span> <span>Intentar con la clase</span>
              </button>
            </div>

            <button class="pj-btn pj-btn-primary" id="pjNextBtn">
              <span>Siguiente</span> <span>➡️</span>
            </button>
          </footer>
        </main>
      </div>

      <!-- RESUMEN FINAL -->
      <div class="pj-summary-modal" id="pjSummaryModal">
        <div class="pj-summary-card">
          <div style="font-size: 3.5rem; margin-bottom: 12px;">🎉</div>
          <h2 style="font-size: 1.8rem; margin: 0 0 10px 0; color: #ffffff;">¡Excelente sesión de clase!</h2>
          <p style="color: #94a3b8; font-size: 1.05rem; margin: 0 0 24px 0;">
            Has recorrido todas las preguntas de la actividad junto a tus estudiantes.
          </p>
          <div style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; padding: 20px; margin-bottom: 24px; display: flex; justify-content: space-around;">
            <div>
              <div style="font-size: 1.8rem; font-weight: 800; color: #10b981;" id="pjStatCorrect">0</div>
              <div style="color: #94a3b8; font-size: 0.85rem; font-weight: 600;">Aciertos del curso</div>
            </div>
            <div>
              <div style="font-size: 1.8rem; font-weight: 800; color: #818cf8;" id="pjStatTotal">0</div>
              <div style="color: #94a3b8; font-size: 0.85rem; font-weight: 600;">Preguntas vistas</div>
            </div>
          </div>
          <div style="display: flex; gap: 12px; justify-content: center;">
            <button class="pj-btn pj-btn-fullscreen" id="pjRestartBtn">🔄 Reiniciar Sesión</button>
            <button class="pj-btn pj-btn-primary" id="pjFinishExitBtn">Salir al Panel</button>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    this.querySelector('#pjCloseBtn').addEventListener('click', () => this.close());
    this.querySelector('#pjFullscreenBtn').addEventListener('click', () => this.toggleFullscreen());
    this.querySelector('#pjPrevBtn').addEventListener('click', () => this.prevQuestion());
    this.querySelector('#pjNextBtn').addEventListener('click', () => this.nextQuestion());
    this.querySelector('#pjRetryBtn').addEventListener('click', () => this.retryCurrentQuestion());
    this.querySelector('#pjRestartBtn').addEventListener('click', () => this.restartSession());
    this.querySelector('#pjFinishExitBtn').addEventListener('click', () => {
      this.querySelector('#pjSummaryModal').style.display = 'none';
      this.close();
    });

    // Atajos de teclado para el profesor con control remoto / flechas
    window.addEventListener('keydown', (e) => {
      const overlay = this.querySelector('#pjOverlay');
      if (!overlay || !overlay.classList.contains('active')) return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        this.nextQuestion();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        this.prevQuestion();
      } else if (e.key === 'Escape') {
        if (!document.fullscreenElement) {
          this.close();
        }
      }
    });
  }

  toggleFullscreen() {
    const overlay = this.querySelector('#pjOverlay');
    if (!document.fullscreenElement) {
      if (overlay.requestFullscreen) {
        overlay.requestFullscreen().catch(() => {});
      } else if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
      this.querySelector('#pjFullscreenBtn').innerHTML = '<span>🖥️</span> <span>Salir de Pantalla Completa</span>';
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      this.querySelector('#pjFullscreenBtn').innerHTML = '<span>🖥️</span> <span>Pantalla Completa</span>';
    }
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
    let rawList = [];

    // 1. Extraer de q.options si viene como array o JSON string
    if (Array.isArray(q.options) && q.options.length > 0) {
      rawList = q.options.map(o => (typeof o === 'object' && o !== null && o.text) ? o.text : String(o || '')).filter(t => t.trim() !== "");
    } else if (typeof q.options === 'string') {
      try {
        const parsed = JSON.parse(q.options);
        if (Array.isArray(parsed)) {
          rawList = parsed.map(o => (typeof o === 'object' && o !== null && o.text) ? o.text : String(o || '')).filter(t => t.trim() !== "");
        }
      } catch (_) {}
    }

    // 2. Si no vinieron en q.options, extraer de q.a, q.b, q.c, q.d
    if (rawList.length === 0) {
      rawList = [q.a, q.b, q.c, q.d]
        .filter(t => t !== undefined && t !== null && String(t).trim() !== "")
        .map(t => String(t).trim());
    }

    // Si ya tiene 4 opciones y la correcta coincide con una letra (A, B, C, D) o con un texto, preservarlas en su orden
    if (rawList.length >= 4) {
      const letters = ['A', 'B', 'C', 'D'];
      return rawList.slice(0, 4).map((text, i) => ({ letter: letters[i], text }));
    }

    if (correctText && !rawList.some(item => item.toLowerCase() === correctText.toLowerCase())) {
      rawList.unshift(correctText);
    }

    const seen = new Set();
    rawList = rawList.filter(item => {
      const lower = item.toLowerCase();
      if (seen.has(lower)) return false;
      seen.add(lower);
      return true;
    });

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
      } else {
        const fillers = ["Ninguna de las anteriores", "Todas las anteriores", "No se puede determinar", "0"];
        for (const f of fillers) {
          if (!rawList.some(o => o.toLowerCase() === f.toLowerCase())) {
            candidate = f;
            break;
          }
        }
      }
      if (!candidate) candidate = `Opción ${rawList.length + 1}`;
      rawList.push(candidate);
    }

    const letters = ['A', 'B', 'C', 'D'];
    return rawList.slice(0, 4).map((text, i) => ({ letter: letters[i], text }));
  }

  project(activity) {
    if (!activity) return;
    this.activity = activity;
    let questions = activity.preguntas || [];
    if (questions.length === 0) {
      alert('Esta actividad no tiene preguntas registradas para proyectar.');
      return;
    }

    this.questions = questions.map(q => {
      const copy = { ...q };
      if (copy.tipo === 'opcion') {
        copy._correctText = this.resolveCorrectText(copy);
        copy._options = this.buildFourOptions(copy);
      }
      return copy;
    });

    this.currentIndex = 0;
    this.answers = new Array(this.questions.length).fill(null);
    this.results = new Array(this.questions.length).fill(null);

    this.querySelector('#pjActivityTitle').innerText = activity.title || 'Actividad';
    this.querySelector('#pjOverlay').classList.add('active');

    this.renderPills();
    this.renderCurrentQuestion();
  }

  renderPills() {
    const container = this.querySelector('#pjPillsContainer');
    container.innerHTML = '';
    this.questions.forEach((_, idx) => {
      const pill = document.createElement('button');
      pill.className = 'pj-pill';
      pill.innerText = idx + 1;
      if (idx === this.currentIndex) pill.classList.add('active');
      if (this.results[idx] === true) pill.classList.add('correct');
      if (this.results[idx] === false) pill.classList.add('incorrect');
      pill.addEventListener('click', () => {
        this.currentIndex = idx;
        this.renderPills();
        this.renderCurrentQuestion();
      });
      container.appendChild(pill);
    });
  }

  renderCurrentQuestion() {
    const q = this.questions[this.currentIndex];
    const total = this.questions.length;

    this.querySelector('#pjQuestionNumber').innerText = `PREGUNTA ${this.currentIndex + 1} DE ${total}`;
    this.querySelector('#pjQuestionType').innerText = q.tipo === 'opcion' ? '🔘 Opción Múltiple' : '✍️ Pregunta Abierta';

    // Parsear gráfico si contiene tag
    let cleanText = q.pregunta;
    let graphicHtml = '';
    if (window.FractionGraphics && typeof window.FractionGraphics.parseQuestion === 'function') {
      const parsed = window.FractionGraphics.parseQuestion(q.pregunta);
      cleanText = parsed.cleanText;
      graphicHtml = parsed.graphicHtml;
    }

    this.querySelector('#pjQuestionTitle').innerText = cleanText;

    const gWrapper = this.querySelector('#pjGraphicsWrapper');
    if (graphicHtml) {
      gWrapper.innerHTML = graphicHtml;
      gWrapper.style.display = 'flex';
    } else {
      gWrapper.innerHTML = '';
      gWrapper.style.display = 'none';
    }

    // Controles navegación
    this.querySelector('#pjPrevBtn').disabled = this.currentIndex === 0;
    const nextBtn = this.querySelector('#pjNextBtn');
    if (this.currentIndex === total - 1) {
      nextBtn.innerHTML = '<span>Finalizar Sesión</span> <span>🏁</span>';
    } else {
      nextBtn.innerHTML = '<span>Siguiente</span> <span>➡️</span>';
    }

    const bodyContent = this.querySelector('#pjBodyContent');
    const feedbackSlot = this.querySelector('#pjFeedbackSlot');
    bodyContent.innerHTML = '';
    feedbackSlot.innerHTML = '';

    const hasAnswered = this.answers[this.currentIndex] !== null;
    const retryBtn = this.querySelector('#pjRetryBtn');
    retryBtn.style.display = hasAnswered ? 'inline-flex' : 'none';

    if (q.tipo === 'opcion') {
      this.renderOptionQuestion(q, bodyContent, feedbackSlot, hasAnswered);
    } else {
      this.renderOpenQuestion(q, bodyContent, feedbackSlot, hasAnswered);
    }

    this.renderPills();
  }

  renderOptionQuestion(q, bodyContent, feedbackSlot, hasAnswered) {
    const grid = document.createElement('div');
    grid.className = 'pj-options-grid';

    const targetCorrect = (q._correctText || this.resolveCorrectText(q)).trim().toLowerCase();
    const selectedLetter = this.answers[this.currentIndex];
    const isCorrect = this.results[this.currentIndex] === true;

    q._options.forEach(opt => {
      const card = document.createElement('div');
      card.className = 'pj-option-card';

      if (hasAnswered) {
        card.classList.add('locked');
        const isSelected = selectedLetter === opt.letter;
        const isThisCorrect = opt.text.trim().toLowerCase() === targetCorrect;

        if (isSelected && isCorrect) {
          card.classList.add('correct');
          card.innerHTML = `
            <div class="pj-opt-letter">${opt.letter}</div>
            <div class="pj-opt-text">${opt.text}</div>
            <span class="pj-opt-status-icon">✓</span>
          `;
        } else if (isSelected && !isCorrect) {
          card.classList.add('incorrect');
          card.innerHTML = `
            <div class="pj-opt-letter">${opt.letter}</div>
            <div class="pj-opt-text">${opt.text}</div>
            <span class="pj-opt-status-icon">✗</span>
          `;
        } else if (isThisCorrect) {
          card.classList.add('correct');
          card.innerHTML = `
            <div class="pj-opt-letter">${opt.letter}</div>
            <div class="pj-opt-text">${opt.text} <small style="display:block; font-size: 0.8rem; color: #a7f3d0; margin-top:2px;">(Respuesta esperada)</small></div>
            <span class="pj-opt-status-icon">✓</span>
          `;
        } else {
          card.classList.add('dimmed');
          card.innerHTML = `
            <div class="pj-opt-letter">${opt.letter}</div>
            <div class="pj-opt-text">${opt.text}</div>
          `;
        }
      } else {
        card.innerHTML = `
          <div class="pj-opt-letter">${opt.letter}</div>
          <div class="pj-opt-text">${opt.text}</div>
        `;
        card.addEventListener('click', () => this.selectOption(opt.letter, opt.text));
      }

      grid.appendChild(card);
    });

    bodyContent.appendChild(grid);

    if (hasAnswered) {
      if (isCorrect) {
        feedbackSlot.innerHTML = `
          <div class="pj-feedback-banner pj-feedback-banner--correct">
            <div class="pj-feedback-text">
              <span style="font-size: 1.5rem;">🎉</span>
              <div><b>¡Excelente deducción del curso!</b> La respuesta seleccionada es correcta.</div>
            </div>
          </div>
        `;
      } else {
        feedbackSlot.innerHTML = `
          <div class="pj-feedback-banner pj-feedback-banner--incorrect">
            <div class="pj-feedback-text">
              <span style="font-size: 1.5rem;">💡</span>
              <div><b>Respuesta incorrecta.</b> Observen la opción destacada en verde para debatir el resultado.</div>
            </div>
          </div>
        `;
      }
    }
  }

  renderOpenQuestion(q, bodyContent, feedbackSlot, hasAnswered) {
    const box = document.createElement('div');
    box.className = 'pj-open-box';

    const targetCorrect = (q._correctText || this.resolveCorrectText(q)).trim();
    const currentVal = this.answers[this.currentIndex] || '';

    box.innerHTML = `
      <label style="color: #cbd5e1; font-size: 1.05rem; font-weight: 600;">Respuesta propuesta por los estudiantes:</label>
      <div style="display: flex; gap: 12px; flex-wrap: wrap;">
        <input type="text" class="pj-open-input" id="pjOpenInput" value="${currentVal}" placeholder="Escribe aquí la respuesta dicha por el curso..." ${hasAnswered ? 'disabled' : ''} style="flex: 1;" />
        <button class="pj-btn pj-btn-primary" id="pjCheckOpenBtn" style="font-size: 1.05rem;" ${hasAnswered ? 'disabled' : ''}>
          <span>🔍</span> <span>Verificar</span>
        </button>
      </div>
    `;

    bodyContent.appendChild(box);

    const checkBtn = box.querySelector('#pjCheckOpenBtn');
    const input = box.querySelector('#pjOpenInput');

    if (!hasAnswered) {
      checkBtn.addEventListener('click', () => {
        const val = input.value.trim();
        if (!val) {
          alert('Por favor ingresa la respuesta dicha por los estudiantes.');
          return;
        }
        this.verifyOpenAnswer(val, targetCorrect);
      });
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          checkBtn.click();
        }
      });
      setTimeout(() => input.focus(), 50);
    } else {
      const isCorrect = this.results[this.currentIndex] === true;
      if (isCorrect) {
        feedbackSlot.innerHTML = `
          <div class="pj-feedback-banner pj-feedback-banner--correct">
            <div class="pj-feedback-text">
              <span style="font-size: 1.5rem;">🎉</span>
              <div><b>¡Respuesta correcta!</b> Coincide perfectamente con la solución matemática esperada.</div>
            </div>
          </div>
        `;
      } else {
        feedbackSlot.innerHTML = `
          <div class="pj-feedback-banner pj-feedback-banner--incorrect">
            <div class="pj-feedback-text">
              <span style="font-size: 1.5rem;">💡</span>
              <div><b>Solución esperada:</b> <code style="background: rgba(0,0,0,0.3); padding: 4px 8px; border-radius: 6px; font-size: 1.15rem; color: #ffffff;">${targetCorrect}</code></div>
            </div>
          </div>
        `;
      }
    }
  }

  selectOption(letter, text) {
    const q = this.questions[this.currentIndex];
    const targetCorrect = (q._correctText || this.resolveCorrectText(q)).trim().toLowerCase();
    const isCorrect = text.trim().toLowerCase() === targetCorrect;

    this.answers[this.currentIndex] = letter;
    this.results[this.currentIndex] = isCorrect;

    if (isCorrect && typeof confetti === 'function') {
      try {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (_) {}
    }

    this.renderCurrentQuestion();
  }

  verifyOpenAnswer(userVal, targetVal) {
    const cleanUser = userVal.toLowerCase().replace(/\s+/g, '');
    const cleanTarget = targetVal.toLowerCase().replace(/\s+/g, '');
    const isCorrect = cleanUser === cleanTarget;

    this.answers[this.currentIndex] = userVal;
    this.results[this.currentIndex] = isCorrect;

    if (isCorrect && typeof confetti === 'function') {
      try {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (_) {}
    }

    this.renderCurrentQuestion();
  }

  retryCurrentQuestion() {
    this.answers[this.currentIndex] = null;
    this.results[this.currentIndex] = null;
    this.renderCurrentQuestion();
  }

  prevQuestion() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.renderCurrentQuestion();
    }
  }

  nextQuestion() {
    if (this.currentIndex < this.questions.length - 1) {
      this.currentIndex++;
      this.renderCurrentQuestion();
    } else {
      this.showSummary();
    }
  }

  showSummary() {
    const correctCount = this.results.filter(r => r === true).length;
    const totalCount = this.questions.length;

    this.querySelector('#pjStatCorrect').innerText = correctCount;
    this.querySelector('#pjStatTotal').innerText = totalCount;
    this.querySelector('#pjSummaryModal').style.display = 'flex';

    if (typeof confetti === 'function') {
      try {
        confetti({ particleCount: 90, spread: 100, origin: { y: 0.5 } });
      } catch (_) {}
    }
  }

  restartSession() {
    this.querySelector('#pjSummaryModal').style.display = 'none';
    this.currentIndex = 0;
    this.answers = new Array(this.questions.length).fill(null);
    this.results = new Array(this.questions.length).fill(null);
    this.renderPills();
    this.renderCurrentQuestion();
  }

  close() {
    if (document.fullscreenElement) {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
    this.querySelector('#pjOverlay').classList.remove('active');
    this.querySelector('#pjSummaryModal').style.display = 'none';
  }
}

if (!customElements.get('projector-player')) {
  customElements.define('projector-player', ProjectorPlayer);
}

// Global launcher
window.projectActivity = function(activity) {
  let player = document.querySelector('projector-player');
  if (!player) {
    player = document.createElement('projector-player');
    document.body.appendChild(player);
  }
  setTimeout(() => {
    player.project(activity);
  }, 10);
};

window.projectActivityById = async function(activityId) {
  if (!activityId) return;
  if (typeof showAppLoading === 'function') showAppLoading('Cargando modo proyector...');
  try {
    const res = await fetch(`/api/activities/${activityId}`);
    if (!res.ok) throw new Error('No se pudo cargar la actividad.');
    const act = await res.json();
    window.projectActivity(act);
  } catch (err) {
    console.error('Error cargando actividad para proyectar:', err);
    if (typeof showAlert === 'function') {
      showAlert('❌ No se pudo cargar la actividad para proyectar.');
    } else {
      alert('No se pudo cargar la actividad para proyectar.');
    }
  } finally {
    if (typeof hideAppLoading === 'function') hideAppLoading();
  }
};
