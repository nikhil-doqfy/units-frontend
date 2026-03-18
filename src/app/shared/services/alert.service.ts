import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root',
})
export class AlertService {
  constructor() {}

  success(msg: any) {
    this.alert('success', msg);
  }

  warning(msg: any) {
    this.alert('warning', msg);
  }

  error(msg: any) {
    this.alert('error', msg);
  }

  info(msg: any) {
    this.alert('info', msg);
  }

  question(msg: any) {
    this.alert('question', msg);
  }

  alert(type: any, msg: any) {
    Swal.fire({
      position: 'top-end',
      icon: type,
      title: msg,
      showConfirmButton: false,
      timer: 5000,
      toast: true,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      },
    });
  }

  customSuccess(msg: string) {
    Swal.fire({
      position: 'top',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: false,
      html: `
        <div class="invite-toast">
          <span class="invite-icon"><img src="assets/verify-icon.gif" style="height:20px; width:20px;></span>
          <span class="invite-text">${msg}</span>
        </div>
      `,

      customClass: {
        popup: 'invite-toast-popup',
      },
    });
  }
  confirm(
    func: Function,
    data: any,
    self: any,
    index: number = 0,
    title: string = 'Are you sure?',
    text: string = "You won't be able to revert this!",
    confirmButtonText: string = 'Yes, delete it!',
    confirmTitleText: string = 'Deleted!',
    confirmText: string = 'Your file has been deleted.',
  ) {
    Swal.fire({
      title: title,
      text: text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#0C5490',
      cancelButtonColor: '#ED3237',
      confirmButtonText: confirmButtonText,
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: confirmTitleText,
          text: confirmText,
          icon: 'success',
        });
        func(data, self, index);
      }
    });
  }
  //   customTenantSuccessModal(msg: string, onAction?: (action: string) => void) {
  //     Swal.fire({
  //       html: `
  //       <div class="modal-backdrop">
  //   <div class="success-modal">
  //     <div class="success-icon">
  //       <img src="assets/Verify.svg" />
  //     </div>

  //     <h3>Tenant Activated Successfully</h3>

  //     <p>
  //       The tenant has been activated and the invoice has been generated
  //       successfully.
  //     </p>
  //     <div class="modal-actions">
  //       <button class="btn btnCommonsx">Go to Invoice</button>

  //       <span class="mt-3">
  //         <a href="#" class="secondary-link">View Tenant Profile</a>
  //       </span>
  //     </div>
  //   </div>
  // </div>
  //     `,
  //       showConfirmButton: false,
  //       allowOutsideClick: false,
  //       backdrop: `
  //       rgba(0,0,0,0.25)
  //       backdrop-filter: blur(6px)
  //       -webkit-backdrop-filter: blur(6px)
  //     `,

  //       didOpen: () => {
  //         document.getElementById('invoiceBtn')?.addEventListener('click', () => {
  //           Swal.close();
  //           onAction?.('invoice');
  //         });
  //         document
  //           .getElementById('profileBtn')
  //           ?.addEventListener('click', (e) => {
  //             e.preventDefault();
  //             Swal.close();
  //             onAction?.('profile');
  //           });
  //         const popup = Swal.getPopup();
  //         const clickOutsideListener = (event: MouseEvent) => {
  //           if (popup && !popup.contains(event.target as Node)) {
  //             Swal.close();
  //             document.removeEventListener('click', clickOutsideListener);
  //           }
  //         };
  //         setTimeout(() => {
  //           document.addEventListener('click', clickOutsideListener);
  //         }, 0);
  //       },
  //     });
  //   }
  // customTenantSuccessModal(msg: string, onAction?: (action: string) => void) {
  //   Swal.fire({
  //     html: `
  //     <div class="success-model">
  //       <div class="success-icon">
  //         <img src="assets/Verify.svg" />
  //       </div>

  //       <h3>Tenant Activated Successfully</h3>

  //       <p>
  //         The tenant has been activated and the invoice has been generated
  //         successfully.
  //       </p>

  //       <div class="modal-actions">
  //         <button id="invoiceBtn" class="btn btnCommonsx">Go to Invoice</button>
  //         <span class="mt-3">
  //           <a href="#" id="profileBtn" class="secondary-link">View Tenant Profile</a>
  //         </span>
  //       </div>
  //       </div>
  //   `,

  //     showConfirmButton: false,
  //     allowOutsideClick: false,
  //     backdrop: `
  //     rgba(0,0,0,0.25)
  //     backdrop-filter: blur(6px)
  //     -webkit-backdrop-filter: blur(6px)
  //   `,
  //     customClass: {
  //       popup: 'custom-approval-right', // your styling
  //     },
  //     didOpen: () => {
  //       // button actions
  //       document.getElementById('invoiceBtn')?.addEventListener('click', () => {
  //         Swal.close();
  //         onAction?.('invoice');
  //       });
  //       document
  //         .getElementById('profileBtn')
  //         ?.addEventListener('click', (e) => {
  //           e.preventDefault();
  //           Swal.close();
  //           onAction?.('profile');
  //         });

  //       // detect outside clicks
  //       const popup = Swal.getPopup();
  //       const clickOutsideListener = (event: MouseEvent) => {
  //         if (popup && !popup.contains(event.target as Node)) {
  //           Swal.close();
  //           document.removeEventListener('click', clickOutsideListener);
  //         }
  //       };
  //       setTimeout(() => {
  //         document.addEventListener('click', clickOutsideListener);
  //       }, 0);
  //     },
  //   });
  // }
}
