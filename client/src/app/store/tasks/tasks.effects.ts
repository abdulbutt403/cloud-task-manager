import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { TasksActions } from './tasks.actions';
import { TasksApiService } from './tasks-api.service';

@Injectable()
export class TasksEffects {
  private readonly actions$ = inject(Actions);
  private readonly tasksApi = inject(TasksApiService);

  loadTasks$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TasksActions.loadTasks),
      switchMap(() =>
        this.tasksApi.getAll().pipe(
          map((tasks) => TasksActions.loadTasksSuccess({ tasks })),
          catchError((error: unknown) => of(TasksActions.taskRequestFailure({ error: this.message(error) }))),
        ),
      ),
    ),
  );

  createTask$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TasksActions.createTask),
      mergeMap(({ title }) =>
        this.tasksApi.create({ title }).pipe(
          map((task) => TasksActions.createTaskSuccess({ task })),
          catchError((error: unknown) => of(TasksActions.taskRequestFailure({ error: this.message(error) }))),
        ),
      ),
    ),
  );

  updateTask$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TasksActions.updateTask),
      mergeMap(({ id, changes }) =>
        this.tasksApi.update(id, changes).pipe(
          map((task) => TasksActions.updateTaskSuccess({ task })),
          catchError((error: unknown) => of(TasksActions.taskRequestFailure({ error: this.message(error) }))),
        ),
      ),
    ),
  );

  deleteTask$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TasksActions.deleteTask),
      mergeMap(({ id }) =>
        this.tasksApi.delete(id).pipe(
          map(() => TasksActions.deleteTaskSuccess({ id })),
          catchError((error: unknown) => of(TasksActions.taskRequestFailure({ error: this.message(error) }))),
        ),
      ),
    ),
  );

  private message(error: unknown): string {
    if (typeof error === 'object' && error !== null && 'error' in error) {
      const response = error.error;
      if (typeof response === 'object' && response !== null && 'message' in response) {
        const message = response.message;
        if (typeof message === 'string') return message;
        if (Array.isArray(message)) return message.join(', ');
      }
    }
    return 'The task request failed. Please try again.';
  }
}
