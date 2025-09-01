import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Patient {
  id: number;
  mrn: string;
  name: string;
  statusTrack: 'Admission' | 'In Treatment' | 'Waiting' | 'Discharged' | 'Critical';
  department: 'Emergency' | 'ICU' | 'General Ward' | 'Outpatient' | 'Radiology';
  priority: 'Critical' | 'Urgent' | 'Standard' | 'Routine';
  doctorName: string;
  nurseName: string;
  admissionDate: string;
  bedNumber: string;
  waitingTime: number;
}

@Injectable({ providedIn: 'root' })
export class PatientService {
  private readonly baseUrl = 'http://localhost:3001/patients';

  readonly statusOptions = ['Admission', 'In Treatment', 'Waiting', 'Discharged', 'Critical'] as const;
  readonly departmentOptions = ['Emergency', 'ICU', 'General Ward', 'Outpatient', 'Radiology'] as const;
  readonly priorityOptions = ['Critical', 'Urgent', 'Standard', 'Routine'] as const;

  constructor(private http: HttpClient) {}

  getPatients(): Observable<Patient[]> {
    return this.http.get<Patient[]>(this.baseUrl);
  }

  updatePatient(patient: Patient): Observable<Patient> {
    return this.http.patch<Patient>(`${this.baseUrl}/${patient.id}`, patient);
  }

  createPatient(patient: Omit<Patient, 'id'>): Observable<Patient> {
    return this.http.post<Patient>(this.baseUrl, patient);
  }

  deletePatient(patientId: string | number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${patientId}`);
  }
}


