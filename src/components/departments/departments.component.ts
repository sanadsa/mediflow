import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule, CdkDragDrop } from '@angular/cdk/drag-drop';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { Patient } from '../../services/patient.service';
import { Department, DepartmentStateService } from '../../services/department-state.service';
import { PatientCardComponent } from '../patient-card/patient-card.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { StatisticsPanelComponent } from '../statistics-panel/statistics-panel.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-departments',
  standalone: true,
  imports: [CommonModule, DragDropModule, ScrollingModule, PatientCardComponent, MatButtonModule, MatIconModule, StatisticsPanelComponent],
  templateUrl: './departments.component.html',
  styleUrl: './departments.component.scss'
})
export class DepartmentsComponent {
  private departmentState = inject(DepartmentStateService);
  private dialog = inject(MatDialog);
  departments = this.departmentState.departments;
  loading = this.departmentState.loading;
  error = this.departmentState.error;
  departmentStats = this.departmentState.departmentStats;

  @Input() filteredDepartments?: Department[];

  drop(event: CdkDragDrop<Patient[]>) {
    if (event.previousContainer !== event.container) {
      const fromDeptName = this.findDepartmentName(event.previousContainer.data);
      const toDeptName = this.findDepartmentName(event.container.data);
      const patientId = event.previousContainer.data[event.previousIndex]?.id;

      console.log('From department:', fromDeptName);
      console.log('To department:', toDeptName);
      console.log('Patient ID:', patientId);

      if (fromDeptName && toDeptName && patientId) {
        this.departmentState.movePatient(patientId, fromDeptName, toDeptName, event.currentIndex);
      }
    } else {
      console.log('Same department - ignoring');
    }
  }

  private findDepartmentName(patients: Patient[]): string | null {
    // Check both filtered and original departments
    const departmentsToCheck = this.filteredDepartments || this.departments();
    const department = departmentsToCheck.find((d: Department) => d.patients === patients);
    return department?.name || null;
  }

  onPatientUpdated(updated: Patient) {
    this.departmentState.updatePatient(updated).subscribe({
      error: (error) => {
        console.error('Failed to update patient:', error);
      }
    });
  }

  showStatistics(dept: Department) {
    this.dialog.open(StatisticsPanelComponent, {
      data: dept
    });
  }
}
