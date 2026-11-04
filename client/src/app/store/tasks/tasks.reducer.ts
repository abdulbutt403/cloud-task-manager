import { createReducer, on } from '@ngrx/store';
import { TasksActions } from './tasks.actions';
import { Task } from './task.model';

export interface TasksState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
}

export const initialState: TasksState = {
  tasks: [],
  loading: false,
  error: null,
};

export const tasksReducer = createReducer(
  initialState,

  on(TasksActions.loadTasks, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(TasksActions.loadTasksSuccess, (state, { tasks }) => ({
    ...state,
    tasks,
    loading: false,
  })),

  on(TasksActions.createTask, TasksActions.updateTask, TasksActions.deleteTask, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(TasksActions.taskRequestFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(TasksActions.createTaskSuccess, (state, { task }) => ({
    ...state,
    tasks: [...state.tasks, task],
    loading: false,
  })),

  on(TasksActions.updateTaskSuccess, (state, { task }) => ({
    ...state,
    tasks: state.tasks.map((current) => current.id === task.id ? task : current),
    loading: false,
  })),

  on(TasksActions.deleteTaskSuccess, (state, { id }) => ({
    ...state,
    tasks: state.tasks.filter((task) => task.id !== id),
    loading: false,
  })),
);
