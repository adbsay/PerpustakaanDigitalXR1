// ============================================================
// BASE ENTITY — Abstract base class for all domain models
// All domain entities extend this class (OOP: Inheritance)
// ============================================================

export abstract class BaseEntity {
  protected readonly _id: string;
  protected readonly _createdAt: Date;
  protected _updatedAt: Date;

  constructor(id: string, createdAt: Date, updatedAt: Date) {
    this._id = id;
    this._createdAt = createdAt;
    this._updatedAt = updatedAt;
  }

  // Public getter — encapsulation (read-only from outside)
  public get id(): string {
    return this._id;
  }

  public get createdAt(): Date {
    return this._createdAt;
  }

  public get updatedAt(): Date {
    return this._updatedAt;
  }

  // Abstract method — all entities must implement serialization
  public abstract toJSON(): Record<string, unknown>;

  // Protected helper — only subclasses can access
  protected formatDate(date: Date): string {
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }
}
