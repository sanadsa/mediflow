import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DepartmentsComponent } from "../departments/departments.component";
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { PatientDetailsComponent } from '../patient-details/patient-details.component';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { DepartmentStateService } from '../../services/department-state.service';

@Component({
  selector: 'app-patient-management',
  standalone: true,
  imports: [CommonModule, FormsModule, DepartmentsComponent, MatButtonModule, MatDividerModule, MatIconModule, MatFormFieldModule, MatInputModule, MatSelectModule],
  templateUrl: './patient-management.component.html',
  styleUrl: './patient-management.component.scss'
})
export class PatientManagementComponent {
  readonly departmentState = inject(DepartmentStateService);
  readonly dialog = inject(MatDialog);
  totalPatients = this.departmentState.totalPatients;

  searchTerm = signal('');
  selectedDepartment = signal('');
  selectedPriority = signal('');

  filteredDepartments = computed(() => {
    const search = this.searchTerm().toLowerCase();
    const deptFilter = this.selectedDepartment();
    const priorityFilter = this.selectedPriority();

    return this.departmentState.departments().map(dept => ({
      ...dept,
      patients: dept.patients.filter(patient => {
        // Department filter
        if (deptFilter && dept.name !== deptFilter) return false;

        // Priority filter
        if (priorityFilter && patient.priority !== priorityFilter) return false;

        // Search term filter
        if (search) {
          return patient.name.toLowerCase().includes(search) ||
                 patient.mrn.toLowerCase().includes(search) ||
                 patient.department.toLowerCase().includes(search) ||
                 patient.doctorName.toLowerCase().includes(search);
        }

        return true;
      })
    }));
  });

  openNewPatientDialog() {
    const dialogRef = this.dialog.open(PatientDetailsComponent, {
      data: null,
      width: '600px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('New patient created:', result);
      }
    });
  }
}
