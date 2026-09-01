class QuestionModal extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div class="modal-overlay" id="qModalOverlay">
        <div class="modal-content">
          <h2>Nueva Pregunta</h2>

          <select id="qModalType">
            <option value="abierta">Abierta</option>
            <option value="opcion">Opción Múltiple</option>
          </select>

          <input type="text" id="qModalText" placeholder="Escribe la pregunta" />

          <div id="qModalOptions" class="hidden">
            <input type="text" id="qModalA" placeholder="Opción A" />
            <input type="text" id="qModalB" placeholder="Opción B" />
            <input type="text" id="qModalC" placeholder="Opción C" />
          </div>

          <input type="text" id="qModalCorrect" placeholder="Respuesta Correcta" />

          <div class="button-group">
            <button class="btn" id="qModalSaveBtn">GUARDAR</button>
            <button class="btn btn--secondary" id="qModalCancelBtn">CANCELAR</button>
          </div>
        </div>
      </div>
    `;

    // Bind events
    this.querySelector('#qModalType').addEventListener('change', () => this.toggleOptions());
    this.querySelector('#qModalCancelBtn').addEventListener('click', () => this.hide());
    this.querySelector('#qModalSaveBtn').addEventListener('click', () => this.save());
  }

  show(callback) {
    // Reset fields
    this.querySelector('#qModalText').value = "";
    this.querySelector('#qModalType').value = "abierta";
    this.querySelector('#qModalA').value = "";
    this.querySelector('#qModalB').value = "";
    this.querySelector('#qModalC').value = "";
    this.querySelector('#qModalCorrect').value = "";
    this.toggleOptions();
    
    this.callback = callback;
    this.querySelector('#qModalOverlay').classList.add('active');
  }

  hide() {
    this.querySelector('#qModalOverlay').classList.remove('active');
  }

  toggleOptions() {
    const type = this.querySelector('#qModalType').value;
    const container = this.querySelector('#qModalOptions');
    if (type === "opcion") {
      container.classList.remove("hidden");
    } else {
      container.classList.add("hidden");
    }
  }

  save() {
    const pregunta = this.querySelector('#qModalText').value;
    const tipo = this.querySelector('#qModalType').value;
    const correcta = this.querySelector('#qModalCorrect').value;
    
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
      let a = this.querySelector('#qModalA').value;
      let b = this.querySelector('#qModalB').value;
      let c = this.querySelector('#qModalC').value;
      
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
