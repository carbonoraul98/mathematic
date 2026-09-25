class CustomAlert extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div class="modal-overlay" id="alertOverlay">
        <div class="modal-content" style="max-width: 400px; padding: var(--space-2xl); border-radius: 25px;">
          <h3 id="alertMsg" style="margin-bottom: var(--space-2xl); text-align: center;"></h3>
          <div class="button-group" style="margin-top: 0; display: flex; gap: 15px; justify-content: center;">
            <button class="btn btn--outline" id="alertCancelBtn" style="border-radius: 25px; display: none;">CANCELAR</button>
            <button class="btn" id="alertCloseBtn" style="border-radius: 25px; min-width: 120px;">ACEPTAR</button>
          </div>
        </div>
      </div>
    `;

    this.querySelector('#alertCloseBtn').addEventListener('click', () => {
      this.hide();
      if (this.onConfirm) this.onConfirm();
      else if (this.callback) this.callback();
    });

    this.querySelector('#alertCancelBtn').addEventListener('click', () => {
      this.hide();
      if (this.onCancel) this.onCancel();
    });
  }

  show(message, callback = null, isConfirm = false, onConfirm = null, onCancel = null) {
    this.querySelector('#alertMsg').innerText = message;
    
    if (isConfirm) {
       this.querySelector('#alertCancelBtn').style.display = 'block';
       this.onConfirm = onConfirm;
       this.onCancel = onCancel;
       this.callback = null;
    } else {
       this.querySelector('#alertCancelBtn').style.display = 'none';
       this.callback = callback;
       this.onConfirm = null;
       this.onCancel = null;
    }
    
    this.querySelector('#alertOverlay').classList.add('active');
  }

  hide() {
    this.querySelector('#alertOverlay').classList.remove('active');
  }
}

if (!customElements.get('custom-alert')) {
    customElements.define('custom-alert', CustomAlert);
}

// Helper global para que sea fácil de llamar desde cualquier lugar
window.showAlert = function(message, callback) {
  let alertComponent = document.querySelector('custom-alert');
  
  if (!alertComponent) {
    alertComponent = document.createElement('custom-alert');
    document.body.appendChild(alertComponent);
  }
  
  setTimeout(() => {
    alertComponent.show(message, callback, false);
  }, 10);
};

window.showConfirm = function(message, onConfirm, onCancel) {
  let alertComponent = document.querySelector('custom-alert');
  
  if (!alertComponent) {
    alertComponent = document.createElement('custom-alert');
    document.body.appendChild(alertComponent);
  }
  
  setTimeout(() => {
    alertComponent.show(message, null, true, onConfirm, onCancel);
  }, 10);
};
