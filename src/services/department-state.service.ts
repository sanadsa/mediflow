import { Injectable, computed, signal, inject } from '@angular/core';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { Patient, PatientService } from './patient.service';

export interface Department {
  name: string;
  patients: Patient[];
}

@Injectable({ providedIn: 'root' })
export class DepartmentStateService {
  private patientService = inject(PatientService);

  private _departments = signal<Department[]>([
    { name: 'Emergency', patients: [] },
    { name: 'ICU', patients: [] },
    { name: 'General Ward', patients: [] },
    { name: 'Outpatient', patients: [] },
    { name: 'Radiology', patients: [] }
  ]);

  private _loading = signal(false);
  private _error = signal<string | null>(null);

  readonly departments = this._departments.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  readonly totalPatients = computed(() =>
    this._departments().reduce((total, dept) => total + dept.patients.length, 0)
  );

  readonly departmentStats = computed(() =>
    this._departments().map(dept => ({
      name: dept.name,
      count: dept.patients.length,
      critical: dept.patients.filter(p => p.priority === 'Critical').length,
      waiting: dept.patients.filter(p => p.statusTrack === 'Waiting').length
    }))
  );

  constructor() {
    this.loadPatients();
  }

  async loadPatients() {
    this._loading.set(true);
    this._error.set(null);

    try {
      this.patientService.getPatients().subscribe({
        next: (patients: Patient[]) => {
          this.groupPatientsByDepartment(patients);
          this._loading.set(false);
        },
        error: (error) => {
          this._error.set('Failed to load patients');
          this._loading.set(false);
          console.error('Error loading patients:', error);
        }
      });
    } catch (error) {
      this._error.set('Failed to load patients');
      this._loading.set(false);
      console.error('Error loading patients:', error);
    }
  }

  private groupPatientsByDepartment(patients: Patient[]) {
    const departments = this._departments().map(dept => ({
      ...dept,
      patients: [] as Patient[]
    }));

    patients.forEach(patient => {
      const department = departments.find(d => d.name === patient.department);
      if (department) {
        department.patients.push(patient);
      }
    });

    this._departments.set(departments);
  }

  updatePatient(patient: Patient): Observable<Patient> {
    return this.patientService.updatePatient(patient).pipe(
      tap(result => {
        if (result) {
          this.updatePatientInState(result);
        }
      }),
      catchError(error => {
        this._error.set('Failed to update patient');
        return throwError(() => error);
      })
    );
  }

  // Create patient and refresh state
  createPatient(patient: Omit<Patient, 'id'>): Observable<Patient> {
    return this.patientService.createPatient(patient).pipe(
      tap(result => {
        if (result) {
          this.addPatientToState(result);
        }
      }),
      catchError(error => {
        this._error.set('Failed to create patient');
        return throwError(() => error);
      })
    );
  }

  // Delete patient and refresh state
  deletePatient(patientId: string | number): Observable<void> {
    return this.patientService.deletePatient(patientId).pipe(
      tap(() => {
        this.removePatientFromState(patientId);
      }),
      catchError(error => {
        this._error.set('Failed to delete patient');
        return throwError(() => error);
      })
    );
  }

  // Move patient between departments - drag and drop
  movePatient(patientId: string | number, fromDepartment: string, toDepartment: string, newIndex: number) {
    const departments = [...this._departments()];

    const fromDept = departments.find(d => d.name === fromDepartment);
    const toDept = departments.find(d => d.name === toDepartment);

    if (!fromDept || !toDept) return;

    const patientIndex = fromDept.patients.findIndex(p => p.id == patientId);
    if (patientIndex === -1) return;

    const [patient] = fromDept.patients.splice(patientIndex, 1);

    patient.department = toDepartment as any;

    toDept.patients.push(patient);

    this._departments.set(departments);

    this.updatePatient(patient).subscribe({
      error: (error) => console.error('Failed to persist patient move:', error)
    });
  }

  private updatePatientInState(updatedPatient: Patient) {
    const departments = [...this._departments()];

    departments.forEach(dept => {
      dept.patients = dept.patients.filter(p => p.id !== updatedPatient.id);
    });

    // Add to correct department
    const targetDept = departments.find(d => d.name === updatedPatient.department);
    if (targetDept) {
      targetDept.patients.push(updatedPatient);
    }

    this._departments.set(departments);
  }

  private addPatientToState(newPatient: Patient) {
    const departments = [...this._departments()];
    const targetDept = departments.find(d => d.name === newPatient.department);

    if (targetDept) {
      targetDept.patients.push(newPatient);
      this._departments.set(departments);
    }
  }

  private removePatientFromState(patientId: string | number) {
    const departments = [...this._departments()];
    departments.forEach(dept => {
      dept.patients = dept.patients.filter(p => p.id !== patientId);
    });
    this._departments.set(departments);
  }
}
