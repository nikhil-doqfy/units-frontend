import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';
@Injectable({
  providedIn: 'root',
})
export class EjarimodelService {
  constructor() {}
  customTenantSuccessModal(msg: string, onAction?: (action: string) => void) {
    Swal.fire({
      html: `
        <div class="success-model">
           <img src="assets/Vector/vector-1.svg" class="corner-icon top-left">

    <img src="assets/Vector/Vector-2.svg" class="corner-icon bottom-right">
          <div class="success-icon">
            <img src="assets/Verify.svg" />
          </div>
  
          <h6>Tenant Activated Successfully</h6>
  
          <span class="success-text">
            The tenant has been activated and the invoice has been generated
            successfully.
          </span>
  
          <div class="modal-actions">
            <button id="invoiceBtn" class="btn btnCommonsx">Go to Invoice</button>
            <span class="mt-3">
              <a href="#" id="profileBtn" class="secondary-link">View Tenant Profile</a>
            </span>
          </div>
          </div>
      `,

      showConfirmButton: false,
      allowOutsideClick: false,
      backdrop: `
        rgba(0,0,0,0.25)
        backdrop-filter: blur(6px)
        -webkit-backdrop-filter: blur(6px)
      `,
      customClass: {
        popup: 'custom-approval-right', // your styling
      },
      didOpen: () => {
        // button actions
        document.getElementById('invoiceBtn')?.addEventListener('click', () => {
          Swal.close();
          onAction?.('invoice');
        });
        document
          .getElementById('profileBtn')
          ?.addEventListener('click', (e) => {
            e.preventDefault();
            Swal.close();
            onAction?.('profile');
          });

        // detect outside clicks
        const popup = Swal.getPopup();
        const clickOutsideListener = (event: MouseEvent) => {
          if (popup && !popup.contains(event.target as Node)) {
            Swal.close();
            document.removeEventListener('click', clickOutsideListener);
          }
        };
        setTimeout(() => {
          document.addEventListener('click', clickOutsideListener);
        }, 0);
      },
    });
  }
}
