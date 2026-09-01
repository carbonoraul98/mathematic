class CustomAlert extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div class="modal-overlay" id="alertOverlay">
        <div class="modal-content" style="max-width: 400px; padding: var(--space-2xl);">
          <h3 id="alertMsg" style="margin-bottom: var(--space-2xl);"></h3>
          <div class="button-group" style="margin-top: 0;">
            <button class="btn" id="alertCloseBtn">ACEPTAR</button>
          </div>
        </div>
      </div>
    `;

    this.querySelector('#alertCloseBtn').addEventListener('click', () => {
      this.hide();
    });
  }

  show(message, callback = null) {
    this.querySelector('#alertMsg').innerText = message;
    this.querySelector('#alertOverlay').classList.add('active');
    this.callback = callback;
  }

  hide() {
    this.querySelector('#alertOverlay').classList.remove('active');
    if (this.callback) {
      this.callback();
      this.callback = null;
    }
  }
}

customElements.define('custom-alert', CustomAlert);

// Helper global para que sea fácil de llamar desde cualquier lugar
window.showAlert = function(message, callback) {
  let alertComponent = document.querySelector('custom-alert');
  
  if (!alertComponent) {
    alertComponent = document.createElement('custom-alert');
    document.body.appendChild(alertComponent);
  }
  
  // Pequeño timeout para permitir que el elemento se agregue al DOM y asigne su innerHTML
  setTimeout(() => {
    alertComponent.show(message, callback);
  }, 10);
};
