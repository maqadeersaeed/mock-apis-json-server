export type TaskStatus = "todo" | "in-progress" | "done" | "canceled";
export type TaskLabel = "bug" | "feature" | "enhancement" | "documentation";
export type TaskPriority = "low" | "medium" | "high";

export class Task {
  id: string;
  code: string;
  title?: string;
  status: TaskStatus = "todo";
  label: TaskLabel = "bug";
  priority: TaskPriority = "low";
  estimatedHours: number = 0;
  archived: boolean = false;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Partial<Task>) {
    this.id = data.id ?? this.generateId();
    this.code = data.code ?? "";
    this.title = data.title;
    this.status = data.status ?? "todo";
    this.label = data.label ?? "bug";
    this.priority = data.priority ?? "low";
    this.estimatedHours = data.estimatedHours ?? 0;
    this.archived = data.archived ?? false;
    this.createdAt = data.createdAt ?? new Date();
    this.updatedAt = data.updatedAt ?? new Date();
  }

  private generateId(): string {
    // You can replace this with your actual `generateId()` logic
    return Math.random().toString(36).substring(2, 12);
  }
}
