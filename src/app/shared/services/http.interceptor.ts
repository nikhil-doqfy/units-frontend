import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { StorageService } from './storage.service';
import { Router } from '@angular/router';
import { AlertService } from './alert.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { tap } from 'rxjs';
import { NgxSpinnerService } from 'ngx-spinner';

let totalRequests = 0;

export const httpInterceptor: HttpInterceptorFn = (req, next) => {
  const storageService = inject(StorageService);
  const alertService = inject(AlertService);
  const router = inject(Router);
  const modalService = inject(NgbModal);
  const spinner = inject(NgxSpinnerService);

  const showSpinner = () => {
    spinner.show();
  };
  const hideSpinner = () => {
    spinner.hide();
  };

  showSpinner();
  totalRequests++;

  const token = storageService.getToken();

  const modifiedReq = req.clone({
    setHeaders: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    },
    withCredentials: true,
  });

  return next(modifiedReq).pipe(
    tap({
      error: (err: any) => {
        if (err.status === 401) {
          modalService.dismissAll('Unauthorized');
          alertService.error(err.error.message);
          router.navigate(['auth/login']);
        } else if (err.status === 500) {
          alertService.error(err.error.message);
        } else {
          if (err.error?.message || err.error?.content?.errors) {
            alertService.error(err.error.message);
          }
        }
      },
      finalize: () => {
        totalRequests--;
        if (totalRequests === 0) {
          hideSpinner();
        }
      },
    })
  );
};
