import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import Swal from 'sweetalert2';
@Injectable({
  providedIn: 'root',
})
export class EjarimodelService {
  constructor(private translate: TranslateService) {}
  customTenantSuccessModal(msg: string, onAction?: (action: string) => void) {
    Swal.fire({
      html: `
        <div class="success-model">
           <img src="assets/Vector/vector-1.svg" class="corner-icon top-left">

    <img src="assets/Vector/Vector-2.svg" class="corner-icon bottom-right">
          <div class="success-icon">
            <img src="assets/Verify.svg" />
          </div>
 
          <h6> ${this.translate.instant('TENANT_ACTIVATED_SUCCESSFULLY')}</h6>
  
          <span class="success-text">
          ${this.translate.instant('TENANT_ACTIVATION_SUCCESS')}
          </span>
  
          <div class="modal-actions">
            <button id="invoiceBtn" class="btn btnCommonsx">${this.translate.instant('GO_TO_INVOICE')}</button>
            <span class="mt-3">
              <a href="#" id="profileBtn" class="secondary-link">${this.translate.instant('VIEW_TENANT_PROFILE')}</a>
            </span>
          </div>
          </div>
      `,

      showConfirmButton: false,
      allowOutsideClick: true,
      backdrop: `
        rgba(0,0,0,0.25)
        backdrop-filter: blur(6px)
        -webkit-backdrop-filter: blur(6px)
      `,
      customClass: {
        popup: 'custom-approval-right',
      },
      showClass: {
        popup: '',
      },
      hideClass: {
        popup: '',
      },
      didOpen: () => {
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
      },
    });
  }
}
