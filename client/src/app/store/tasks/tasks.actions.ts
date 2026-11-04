import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Task } from './task.model';

export const TasksActions = createActionGroup({
  source: 'Tasks',
  events: {
    'Load Tasks': emptyProps(),
    'Load Tasks Success': props<{ tasks: Task[] }>(),
    'Create Task': props<{ title: string }>(),
    'Create Task Success': props<{ task: Task }>(),
    'Update Task': props<{ id: number; changes: Partial<Pick<Task, 'title' | 'status'>> }>(),
    'Update Task Success': props<{ task: Task }>(),
    'Delete Task': props<{ id: number }>(),
    'Delete Task Success': props<{ id: number }>(),
    'Task Request Failure': props<{ error: string }>(),
  },
});
