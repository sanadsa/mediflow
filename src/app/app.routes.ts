import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'management' },
  {
    path: 'management',
    loadComponent: () =>
      import('../components/patient-management/patient-management.component')
        .then(m => m.PatientManagementComponent)
  }
];
