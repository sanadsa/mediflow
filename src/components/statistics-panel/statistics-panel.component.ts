import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { Department } from '../../services/department-state.service';

@Component({
  selector: 'app-statistics-panel',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatDialogModule, MatButtonModule],
  templateUrl: './statistics-panel.component.html',
  styleUrl: './statistics-panel.component.scss'
})
export class StatisticsPanelComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: Department,
    private dialogRef: MatDialogRef<StatisticsPanelComponent>
  ) {}

  get departmentCapacity(): number {
    return 20;
  }

  get availableCapacity(): number {
    return this.departmentCapacity - this.data.patients.length;
  }

  get averageWaitTime(): number {
    if (this.data.patients.length === 0) return 0;

    const totalWaitTime = this.data.patients.reduce((sum, patient) => sum + (patient.waitingTime || 0), 0);
    return Math.round(totalWaitTime / this.data.patients.length);
  }

  get criticalPatients(): number {
    return this.data.patients.filter(p => p.priority === 'Critical').length;
  }

  get urgentPatients(): number {
    return this.data.patients.filter(p => p.priority === 'Urgent').length;
  }

  close() {
    this.dialogRef.close();
  }
}
