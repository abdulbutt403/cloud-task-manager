import { AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, OnInit, inject, signal } from '@angular/core';
import { Store } from '@ngrx/store';
import { TasksActions } from '../../store/tasks/tasks.actions';
import { Task, TaskStatus } from '../../store/tasks/task.model';
import {
  selectAllTasks,
  selectTasksLoading,
  selectTasksError,
} from '../../store/tasks/tasks.selectors';

@Component({
  selector: 'app-tasks',
  imports: [AsyncPipe, FormsModule],
  templateUrl: './tasks.html',
  styleUrl: './tasks.scss',
})
export class Tasks implements OnInit {
  private readonly store = inject(Store);

  readonly tasks$ = this.store.select(selectAllTasks);
  readonly loading$ = this.store.select(selectTasksLoading);
  readonly error$ = this.store.select(selectTasksError);

  readonly columns: {
    id: TaskStatus;
    title: string;
    subtitle: string;
    icon: string;
    emptyIcon: string;
    emptyMessage: string;
  }[] = [
    { id: 'todo', title: 'To do', subtitle: 'Ready when you are', icon: '○', emptyIcon: '＋', emptyMessage: 'A clear space for what’s next.' },
    { id: 'in-progress', title: 'In progress', subtitle: 'Work in motion', icon: '◷', emptyIcon: '↗', emptyMessage: 'Nothing underway just yet.' },
    { id: 'done', title: 'Done', subtitle: 'Look at you go', icon: '✓', emptyIcon: '✳', emptyMessage: 'Your wins will collect here.' },
  ];

  readonly newTaskTitle = signal('');
  readonly editingTaskId = signal<number | null>(null);
  readonly editingTitle = signal('');
  readonly draggingTaskId = signal<number | null>(null);
  readonly dragOverStatus = signal<TaskStatus | null>(null);

  ngOnInit(): void {
    this.store.dispatch(TasksActions.loadTasks());
  }

  tasksForColumn(tasks: Task[], status: TaskStatus): Task[] {
    return tasks.filter((task) => task.status === status);
  }

  statusLabel(status: TaskStatus): string {
    return this.columns.find((column) => column.id === status)?.title ?? status;
  }

  nextStatus(status: TaskStatus): TaskStatus | null {
    const order: TaskStatus[] = ['todo', 'in-progress', 'done'];
    const index = order.indexOf(status);
    return index >= 0 && index < order.length - 1 ? order[index + 1] : null;
  }

  previousStatus(status: TaskStatus): TaskStatus | null {
    const order: TaskStatus[] = ['todo', 'in-progress', 'done'];
    const index = order.indexOf(status);
    return index > 0 ? order[index - 1] : null;
  }

  addTask(): void {
    const title = this.newTaskTitle().trim();
    if (!title) return;

    this.store.dispatch(TasksActions.createTask({ title }));
    this.newTaskTitle.set('');
  }

  moveTask(id: number, status: TaskStatus): void {
    this.store.dispatch(TasksActions.updateTask({ id, changes: { status } }));
  }

  startEditing(id: number, title: string): void {
    this.editingTaskId.set(id);
    this.editingTitle.set(title);
  }

  saveTask(id: number): void {
    const title = this.editingTitle().trim();
    if (!title) return;
    this.store.dispatch(TasksActions.updateTask({ id, changes: { title } }));
    this.editingTaskId.set(null);
  }

  deleteTask(id: number): void {
    this.store.dispatch(TasksActions.deleteTask({ id }));
  }

  startDrag(event: DragEvent, id: number): void {
    this.draggingTaskId.set(id);
    event.dataTransfer?.setData('text/plain', String(id));
    if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move';
  }

  allowDrop(event: DragEvent, status: TaskStatus): void {
    event.preventDefault();
    this.dragOverStatus.set(status);
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
  }

  leaveColumn(event: DragEvent, status: TaskStatus): void {
    const column = event.currentTarget;
    if (column instanceof HTMLElement && event.relatedTarget instanceof Node && column.contains(event.relatedTarget)) {
      return;
    }
    if (this.dragOverStatus() === status) this.dragOverStatus.set(null);
  }

  dropTask(event: DragEvent, status: TaskStatus): void {
    event.preventDefault();
    const id = Number(event.dataTransfer?.getData('text/plain'));
    if (Number.isInteger(id) && id > 0) this.moveTask(id, status);
    this.endDrag();
  }

  endDrag(): void {
    this.draggingTaskId.set(null);
    this.dragOverStatus.set(null);
  }
}
