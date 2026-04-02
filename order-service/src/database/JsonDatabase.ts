import fs from 'fs';
import path from 'path';

interface HasId {
    id: string;
}

export class JsonDatabase<T extends HasId> {
    private filePath: string;
    private data: T[];

    constructor(filePath: string) {
        this.filePath = filePath;
        this.data = this.loadFromFile();
    }

    private loadFromFile(): T[] {
        try {
            if (fs.existsSync(this.filePath)) {
                const raw = fs.readFileSync(this.filePath, 'utf-8');
                return JSON.parse(raw) as T[];
            }
        } catch (error) {
            console.error(`[JsonDatabase] Dosya okunamadi: ${error}`);
        }
        return [];
    }

    private saveToFile(): void {
        const dir = path.dirname(this.filePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf-8');
    }

    public create(item: T): T {
        this.data = this.loadFromFile();
        this.data.push(item);
        this.saveToFile();
        return item;
    }

    public findAll(): T[] {
        this.data = this.loadFromFile();
        return [...this.data];
    }

    public findById(id: string): T | undefined {
        this.data = this.loadFromFile();
        return this.data.find(item => item.id === id);
    }

    public update(id: string, updates: Partial<Omit<T, 'id'>>): T | undefined {
        this.data = this.loadFromFile();
        const index = this.data.findIndex(item => item.id === id);
        if (index === -1) {
            return undefined;
        }

        this.data[index] = { ...this.data[index]!, ...updates, id } as T;
        this.saveToFile();
        return this.data[index];
    }

    public delete(id: string): boolean {
        this.data = this.loadFromFile();
        const index = this.data.findIndex(item => item.id === id);
        if (index === -1) {
            return false;
        }

        this.data.splice(index, 1);
        this.saveToFile();
        return true;
    }
}
