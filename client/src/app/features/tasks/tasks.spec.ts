import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { TasksActions } from '../../store/tasks/tasks.actions';
import { Task } from '../../store/tasks/task.model';
import {
  selectAllTasks,
  selectTasksError,
  selectTasksLoading,
} from '../../store/tasks/tasks.selectors';
import { Tasks } from './tasks';

describe('Tasks', () => {
  let component: Tasks;
  let fixture: ComponentFixture<Tasks>;
  let dispatch: ReturnType<typeof vi.fn>;
  let tasks: Task[];

  beforeEach(async () => {
    tasks = [
      {
        id: 1,
        title: 'Write project plan',
        status: 'todo',
        completed: false,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 2,
        title: 'Review first draft',
        status: 'in-progress',
        completed: false,
        createdAt: '2026-01-02T00:00:00.000Z',
        updatedAt: '2026-01-02T00:00:00.000Z',
      },
      {
        id: 3,
        title: 'Send final report',
        status: 'done',
        completed: true,
        createdAt: '2026-01-03T00:00:00.000Z',
        updatedAt: '2026-01-03T00:00:00.000Z',
      },
    ];
    dispatch = vi.fn();
    const storeMock = {
      select: vi.fn((selector: unknown) => {
        if (selector === selectAllTasks) return of(tasks);
        if (selector === selectTasksLoading) return of(false);
        if (selector === selectTasksError) return of(null);
        return of(undefined);
      }),
      dispatch,
    };

    await TestBed.configureTestingModule({
      imports: [Tasks],
      providers: [{ provide: Store, useValue: storeMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(Tasks);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('loads tasks when the board initializes', () => {
    expect(dispatch).toHaveBeenCalledWith(TasksActions.loadTasks());
  });

  it('renders the board columns and tasks from the store', () => {
    const element: HTMLElement = fixture.nativeElement;

    expect(element.querySelector('#board-heading')?.textContent).toContain('Your board');
    expect(element.querySelectorAll('.board-column')).toHaveLength(3);
    expect(element.textContent).toContain('Write project plan');
    expect(element.textContent).toContain('Review first draft');
    expect(element.textContent).toContain('Send final report');
  });

  it('groups tasks under their matching status', () => {
    expect(component.tasksForColumn(tasks, 'todo').map((task) => task.id)).toEqual([1]);
    expect(component.tasksForColumn(tasks, 'in-progress').map((task) => task.id)).toEqual([2]);
    expect(component.tasksForColumn(tasks, 'done').map((task) => task.id)).toEqual([3]);
  });

  it('dispatches a trimmed title when adding a task and clears the input', () => {
    component.newTaskTitle.set('  Plan next sprint  ');

    component.addTask();

    expect(dispatch).toHaveBeenCalledWith(TasksActions.createTask({ title: 'Plan next sprint' }));
    expect(component.newTaskTitle()).toBe('');
  });

  it('does not dispatch when the new task title is blank', () => {
    component.newTaskTitle.set('   ');

    component.addTask();

    expect(dispatch).not.toHaveBeenCalledWith(expect.objectContaining({ type: TasksActions.createTask.type }));
  });

  it('moves a task and dispatches title edits and deletes', () => {
    component.moveTask(1, 'in-progress');
    component.startEditing(1, 'Write project plan');
    component.editingTitle.set('Finish project plan');
    component.saveTask(1);
    component.deleteTask(1);

    expect(dispatch).toHaveBeenCalledWith(TasksActions.updateTask({ id: 1, changes: { status: 'in-progress' } }));
    expect(dispatch).toHaveBeenCalledWith(TasksActions.updateTask({ id: 1, changes: { title: 'Finish project plan' } }));
    expect(dispatch).toHaveBeenCalledWith(TasksActions.deleteTask({ id: 1 }));
    expect(component.editingTaskId()).toBeNull();
  });

  it('does not save an empty edited title', () => {
    component.startEditing(1, 'Write project plan');
    component.editingTitle.set('  ');

    component.saveTask(1);

    expect(dispatch).not.toHaveBeenCalledWith(expect.objectContaining({ type: TasksActions.updateTask.type }));
    expect(component.editingTaskId()).toBe(1);
  });

  it('returns adjacent statuses for moving tasks through the board', () => {
    expect(component.previousStatus('todo')).toBeNull();
    expect(component.nextStatus('todo')).toBe('in-progress');
    expect(component.previousStatus('in-progress')).toBe('todo');
    expect(component.nextStatus('in-progress')).toBe('done');
    expect(component.previousStatus('done')).toBe('in-progress');
    expect(component.nextStatus('done')).toBeNull();
  });
});
