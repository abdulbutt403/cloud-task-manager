import { provideEffects } from '@ngrx/effects';
import { provideStore } from '@ngrx/store';
import { TasksEffects } from './tasks/tasks.effects';
import { tasksReducer } from './tasks/tasks.reducer';

export const storeProviders = [
  provideStore({ tasks: tasksReducer }),
  provideEffects(TasksEffects),
];
