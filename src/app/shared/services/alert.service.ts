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
  // alert(type: any, msg: any) {
  //   Swal.fire({
  //     toast: true,
  //     position: 'top',
  //     icon: type,
  //     title: msg,
  //     showConfirmButton: false,
  //     timer: 3000,
  //     timerProgressBar: true,
  //     background: '#ECFDF5',
  //     color: '#065F46',
  //     iconColor: '#10B981',
  //     customClass: {
  //       popup: 'custom-toast',
  //     },
  //   });
  // }
  // customSuccess(msg: string) {
  //   Swal.fire({
  //     toast: true,
  //     position: 'top',
  //     icon: 'success',
  //     title: msg,
  //     showConfirmButton: false,
  //     timer: 3000,
  //     timerProgressBar: true,
  //     background: '#ECFDF5',
  //     color: '#065F46',
  //     iconColor: '#10B981',
  //     customClass: {
  //       popup: 'custom-toast',
  //     },
  //   });
  // }
  // customSuccess(msg: string) {
  //   Swal.fire({
  //     toast: true,
  //     position: 'top',
  //     icon: 'success',
  //     title: msg,
  //     showConfirmButton: false,
  //     timer: 3000,
  //     timerProgressBar: true,

  //     background: '#ECFDF5', // ✔ Same background color
  //     color: '#065F46',
  //     iconColor: '#10B981',

  //     backdrop: false, // ❗ Full screen blur बंद

  //     customClass: {
  //       popup: 'custom-toast',
  //     },
  //   });
  // }
  // customSuccess(msg: string) {
  //   Swal.fire({
  //     position: 'top',
  //     icon: 'success',
  //     title: msg,
  //     showConfirmButton: false,
  //     timer: 3000,
  //     timerProgressBar: true,

  //     background: '#ECFDF5',
  //     color: '#065F46',
  //     iconColor: '#10B981',

  //     // 🔥 Blur background
  //     backdrop: `
  //     rgba(0,0,0,0.15)
  //     backdrop-filter: blur(6px)
  //     -webkit-backdrop-filter: blur(6px)
  //   `,

  //     customClass: {
  //       popup: 'custom-toast',
  //     },
  //   });
  // }

  // customSuccess(msg: string) {
  //   Swal.fire({
  //     position: 'top',
  //     icon: 'success',
  //     title: msg,
  //     showConfirmButton: false,
  //     timer: 3000,
  //     timerProgressBar: true,

  //     background: '#ECFDF5',
  //     color: '#065F46',
  //     iconColor: '#10B981',
  //     backdrop: `
  //     rgba(0,0,0,0.15)
  //     backdrop-filter: blur(6px)
  //     -webkit-backdrop-filter: blur(6px)
  //   `,
  //     // allow background overlay

  //     customClass: {
  //       popup: 'custom-toast',
  //       container: 'custom-toast-container',
  //     },
  //   });
  // }

  customSuccess(msg: string) {
    Swal.fire({
      position: 'top',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: false,
      html: `
        <div class="invite-toast">
          <span class="invite-icon"><img src="assets/"></span>
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
}
