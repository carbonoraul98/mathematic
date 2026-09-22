class QuestionModal extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div class="modal-overlay" id="qModalOverlay">
        <div class="modal-content" style="max-width: 500px; padding: var(--space-3xl);">
          <h2 style="margin-bottom: var(--space-md); text-align: left;">Agregar Pregunta</h2>
          
          <label style="display: block; margin-bottom: var(--space-xs); color: var(--text-secondary); font-size: var(--text-sm); text-align: left;">Tipo de pregunta:</label>
          <div class="activity-type-cards" style="grid-template-columns: 1fr 1fr; margin-top: 0; margin-bottom: var(--space-lg);">
            <div class="type-card active" id="btnTypeAbierta" style="padding: var(--space-md);">
              <div class="type-icon" style="font-size: 20px;">✍️</div>
              <span style="font-size: var(--text-sm);">Abierta</span>
            </div>
            <div class="type-card" id="btnTypeOpcion" style="padding: var(--space-md);">
              <div class="type-icon" style="font-size: 20px;">🔘</div>
              <span style="font-size: var(--text-sm);">Opción Múltiple</span>
            </div>
          </div>
          <input type="hidden" id="qModalType" value="abierta" />

          <input type="text" id="qModalText" placeholder="Escribe la pregunta (ej. ¿Cuánto es 2+2?)" style="margin-bottom: var(--space-md);" />

          <div id="qModalOptions" style="display: none; flex-direction: column; gap: var(--space-md); margin-bottom: var(--space-md);">
            <input type="text" id="qModalA" placeholder="Opción A" style="margin: 0;" />
            <input type="text" id="qModalB" placeholder="Opción B" style="margin: 0;" />
            <input type="text" id="qModalC" placeholder="Opción C" style="margin: 0;" />
          </div>

          <input type="text" id="qModalCorrect" placeholder="Respuesta Correcta (exacta)" style="margin-bottom: var(--space-xl);" />

          <div style="display: flex; gap: var(--space-md); justify-content: flex-end;">
            <button class="btn btn--secondary btn--sm" id="qModalCancelBtn">Cancelar</button>
            <button class="btn btn--sm" id="qModalSaveBtn">Guardar Pregunta</button>
          </div>
        </div>
      </div>
    `;

    // Bind events
    this.querySelector('#btnTypeAbierta').addEventListener('click', () => this.selectType('abierta'));
    this.querySelector('#btnTypeOpcion').addEventListener('click', () => this.selectType('opcion'));
    this.querySelector('#qModalCancelBtn').addEventListener('click', () => this.hide());
    this.querySelector('#qModalSaveBtn').addEventListener('click', () => this.save());
  }

  selectType(type) {
    this.querySelector('#qModalType').value = type;
    
    if (type === 'abierta') {
      this.querySelector('#btnTypeAbierta').classList.add('active');
      this.querySelector('#btnTypeOpcion').classList.remove('active');
      this.querySelector('#qModalOptions').style.display = 'none';
    } else {
      this.querySelector('#btnTypeOpcion').classList.add('active');
      this.querySelector('#btnTypeAbierta').classList.remove('active');
      this.querySelector('#qModalOptions').style.display = 'flex';
    }
  }

  show(callback) {
    // Reset fields
    this.querySelector('#qModalText').value = "";
    this.selectType('abierta');
    this.querySelector('#qModalA').value = "";
    this.querySelector('#qModalB').value = "";
    this.querySelector('#qModalC').value = "";
    this.querySelector('#qModalCorrect').value = "";
    
    this.callback = callback;
    this.querySelector('#qModalOverlay').classList.add('active');
  }

  hide() {
    this.querySelector('#qModalOverlay').classList.remove('active');
  }

  save() {
    const pregunta = this.querySelector('#qModalText').value.trim();
    const tipo = this.querySelector('#qModalType').value;
    const correcta = this.querySelector('#qModalCorrect').value.trim();
    
    if (!pregunta || !correcta) {
      if (window.showAlert) {
        window.showAlert("❌ Por favor completa la pregunta y la respuesta correcta.");
      } else {
        alert("❌ Por favor completa la pregunta y la respuesta correcta.");
      }
      return;
    }
    
    let nuevaPregunta = { pregunta, tipo, correcta };
    
    if (tipo === "opcion") {
      let a = this.querySelector('#qModalA').value.trim();
      let b = this.querySelector('#qModalB').value.trim();
      let c = this.querySelector('#qModalC').value.trim();
      
      if (!a || !b || !c) {
        if (window.showAlert) {
          window.showAlert("❌ Por favor completa todas las opciones (A, B, C).");
        } else {
          alert("❌ Por favor completa todas las opciones (A, B, C).");
        }
        return;
      }
      
      nuevaPregunta.a = a;
      nuevaPregunta.b = b;
      nuevaPregunta.c = c;
    }
    
    if (this.callback) {
      this.callback(nuevaPregunta);
    }
    
    this.hide();
  }
}

customElements.define('question-modal', QuestionModal);

// Global Helper
window.showQuestionModal = function(callback) {
  let modalComponent = document.querySelector('question-modal');
  
  if (!modalComponent) {
    modalComponent = document.createElement('question-modal');
    document.body.appendChild(modalComponent);
  }
  
  setTimeout(() => {
    modalComponent.show(callback);
  }, 10);
};
