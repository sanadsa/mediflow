import { Component, EventEmitter, Output, inject, Input } from '@angular/core';
import { Patient } from '../../services/patient.service';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { PatientDetailsComponent } from '../patient-details/patient-details.component';

@Component({
  selector: 'app-patient-card',
  imports: [CommonModule, MatCardModule, MatButtonModule],
  templateUrl: './patient-card.component.html',
  styleUrl: './patient-card.component.scss'
})
export class PatientCardComponent {
  readonly dialog = inject(MatDialog);
  @Input() patient!: Patient;
  @Output() updated = new EventEmitter<Patient>();

  openPatientDetailsDialog() {
    const dialogRef = this.dialog.open(PatientDetailsComponent, {
      data: this.patient,
      width: '600px'
    });

    dialogRef.afterClosed().subscribe(updatedPatient => {
      if (updatedPatient) {
        this.updated.emit(updatedPatient as Patient);
      }
    });
  }
}
