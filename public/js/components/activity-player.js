class ActivityPlayer extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div class="modal-overlay" id="apOverlay" style="overflow-y: auto; padding: var(--space-2xl) 0;">
        <div class="modal-content" style="max-width: 800px; margin: auto;">
          <h2 id="apTitle"></h2>
          <div id="apQuestionsContainer" style="text-align: left; margin-top: var(--space-2xl);"></div>
          <div class="button-group" style="margin-top: var(--space-3xl);">
            <button class="btn" id="apSubmitBtn">FINALIZAR ACTIVIDAD</button>
            <button class="btn btn--secondary" id="apCancelBtn">CANCELAR</button>
          </div>
        </div>
      </div>
    `;

    this.querySelector('#apCancelBtn').addEventListener('click', () => this.hide());
    this.querySelector('#apSubmitBtn').addEventListener('click', () => this.submit());
  }

  play(actividad, seccion, onComplete) {
    this.actividad = actividad;
    this.onComplete = onComplete;
    this.querySelector('#apTitle').innerText = `${actividad.tipo}: ${actividad.tema}`;
    
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
    this.renderQuestions();
    
    this.querySelector('#apOverlay').classList.add('active');
  }

  renderQuestions() {
    const container = this.querySelector('#apQuestionsContainer');
    container.innerHTML = "";
    
    this.shuffledQuestions.forEach((q, idx) => {
      let html = `
        <div class="grade-card" style="display: block; margin-bottom: var(--space-xl);">
          <h3 style="margin-bottom: var(--space-md);">❓ ${idx + 1}. ${q.pregunta}</h3>
      `;
      
      if (q.tipo === "opcion") {
        html += `
          <div style="margin-bottom: var(--space-md); margin-left: var(--space-md);">
            <label style="display: block; color: var(--text-secondary); margin-bottom: 8px;">A) ${q.a}</label>
            <label style="display: block; color: var(--text-secondary); margin-bottom: 8px;">B) ${q.b}</label>
            <label style="display: block; color: var(--text-secondary); margin-bottom: 8px;">C) ${q.c}</label>
          </div>
        `;
      }
      
      html += `
          <input type="text" id="ap_resp_${idx}" placeholder="Tu respuesta..." style="width: 100%; margin-top: var(--space-md);" />
        </div>
      `;
      
      container.innerHTML += html;
    });
  }

  submit() {
    let puntos = 0;
    this.shuffledQuestions.forEach((q, idx) => {
      let input = this.querySelector(`#ap_resp_${idx}`);
      let respuesta = input ? input.value.trim().toLowerCase() : "";
      if (respuesta === q.correcta.trim().toLowerCase()) {
        puntos += 10;
      }
    });
    
    this.hide();
    if (this.onComplete) {
      this.onComplete(puntos);
    }
  }

  hide() {
    this.querySelector('#apOverlay').classList.remove('active');
  }
}

customElements.define('activity-player', ActivityPlayer);

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
