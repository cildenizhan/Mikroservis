export interface IDatabase<T> {
    create(item: T): T | Promise<T>;
    findAll(): T[] | Promise<T[]>;
    findById(id: string): T | undefined | Promise<T | undefined>;
    update(id: string, updates: Partial<Omit<T, 'id'>>): T | undefined | Promise<T | undefined>;
    delete(id: string): boolean | Promise<boolean>;
}
