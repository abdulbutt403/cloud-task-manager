import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Task } from './task.model';

@Injectable({ providedIn: 'root' })
export class TasksApiService {
  private readonly http = inject(HttpClient);
  private readonly url = 'http://localhost:3000/tasks';

  getAll(): Observable<Task[]> {
    return this.http.get<Task[]>(this.url);
  }

  create(task: Pick<Task, 'title'>): Observable<Task> {
    return this.http.post<Task>(this.url, task);
  }

  update(id: number, changes: Partial<Pick<Task, 'title' | 'status'>>): Observable<Task> {
    return this.http.patch<Task>(`${this.url}/${id}`, changes);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
