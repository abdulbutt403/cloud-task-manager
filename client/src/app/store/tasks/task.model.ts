export interface Task {
  id: number;
  title: string;
  status: TaskStatus;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export type TaskStatus = 'todo' | 'in-progress' | 'done';
