import { Component, Inject, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Patient, PatientService } from '../../services/patient.service';
import { DepartmentStateService } from '../../services/department-state.service';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-patient-details',
  imports: [CommonModule, MatCardModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatDialogModule, MatButtonModule],
  templateUrl: './patient-details.component.html',
  styleUrl: './patient-details.component.scss'
})
export class PatientDetailsComponent {
  private departmentState = inject(DepartmentStateService);

  constructor(@Inject(MAT_DIALOG_DATA) public data: Patient | null, private dialogRef: MatDialogRef<PatientDetailsComponent>, private patientService: PatientService) {
    if (data) {
      this.patient.set(data);
      this.patientForm.patchValue({
        mrn: data.mrn,
        name: data.name,
        statusTrack: data.statusTrack,
        department: data.department,
        priority: data.priority,
        doctorName: data.doctorName,
        nurseName: data.nurseName,
        bedNumber: data.bedNumber,
      });
    } else {
      this.patientForm.patchValue({
        statusTrack: 'Admission',
        department: 'Emergency',
        priority: 'Standard',
        admissionDate: new Date().toISOString(),
        waitingTime: 0
      });
    }
  }

  fb = inject(FormBuilder);
  patient = signal<Patient | null>(null);
  loading = signal(true);
  error = signal(false);

  get statusOptions() { return this.patientService.statusOptions; }
  get departmentOptions() { return this.patientService.departmentOptions; }
  get priorityOptions() { return this.patientService.priorityOptions; }

  patientForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    statusTrack: ['', Validators.required],
    department: ['', Validators.required],
    priority: ['', Validators.required],
    doctorName: ['', Validators.required],
    nurseName: ['', Validators.required],
    bedNumber: ['', Validators.required],
  });

  getInvalidFields() {
    const fieldDisplayNames: { [key: string]: string } = {
      mrn: 'Medical Record Number',
      name: 'Patient Name',
      statusTrack: 'Status',
      department: 'Department',
      priority: 'Priority',
      doctorName: 'Doctor Name',
      nurseName: 'Nurse Name',
      bedNumber: 'Bed Number'
    };

    const invalidFields: { name: string; displayName: string }[] = [];

    Object.keys(this.patientForm.controls).forEach(key => {
      const control = this.patientForm.get(key);
      if (control && control.invalid && (control.dirty || control.touched)) {
        invalidFields.push({
          name: key,
          displayName: fieldDisplayNames[key] || key
        });
      }
    });

    return invalidFields;
  }

  save() {
    if (this.patientForm.valid) {
      this.error.set(false);
      const formValue = this.patientForm.value;

      if (this.patient()) {
        const existing = this.patient();
        const updated: Patient = {...existing, ...formValue} as Patient;

        this.departmentState.updatePatient(updated).subscribe({
          next: (result) => {
            this.dialogRef.close(result);
          },
          error: (error) => {
            console.error('Error updating patient:', error);
            this.error.set(true);
          }
        });
      } else {
        const newPatient: Omit<Patient, 'id'> = {
          ...formValue,
          mrn: 'MRN' + Math.floor(Math.random() * 1000000).toString(),
          admissionDate: new Date().toISOString(),
          waitingTime: 0
        };

        this.departmentState.createPatient(newPatient).subscribe({
          next: (result) => {
            this.dialogRef.close(result);
          },
          error: (error) => {
            console.error('Error creating patient:', error);
            this.error.set(true);
          }
        });
      }
    } else {
      this.error.set(true);
      // Mark all fields as touched to trigger validation display
      Object.keys(this.patientForm.controls).forEach(key => {
        this.patientForm.get(key)?.markAsTouched();
      });
    }
  }

  deletePatient() {
    if (this.patient()) {
      this.departmentState.deletePatient(this.patient()!.id).subscribe({
        next: () => {
          this.dialogRef.close(null);
        },
        error: (error) => {
          console.error('Error deleting patient:', error);
        }
      });
    }
  }
}
