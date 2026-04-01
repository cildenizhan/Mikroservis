import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { JsonDatabase } from '../src/database/JsonDatabase';
import fs from 'fs';
import path from 'path';

const TEST_DB_PATH = path.join(__dirname, '..', 'data', 'test-users.json');

describe('JsonDatabase Testleri', () => {

    let db: JsonDatabase<{ id: string; name: string; email: string }>;

    beforeEach(() => {
        db = new JsonDatabase(TEST_DB_PATH);
    });

    afterEach(() => {
        if (fs.existsSync(TEST_DB_PATH)) {
            fs.unlinkSync(TEST_DB_PATH);
        }
    });

    it('Yeni kayit eklenebilmeli (CREATE)', () => {
        const user = { id: '1', name: 'Ali', email: 'ali@test.com' };
        const result = db.create(user);

        expect(result).toEqual(user);
    });

    it('Tum kayitlar listelenebilmeli (READ ALL)', () => {
        db.create({ id: '1', name: 'Ali', email: 'ali@test.com' });
        db.create({ id: '2', name: 'Veli', email: 'veli@test.com' });

        const all = db.findAll();
        expect(all.length).toBe(2);
    });

    it('ID ile tek kayit bulunabilmeli (READ ONE)', () => {
        db.create({ id: '1', name: 'Ali', email: 'ali@test.com' });

        const found = db.findById('1');
        expect(found).toBeDefined();
        expect(found!.name).toBe('Ali');
    });

    it('Olmayan ID icin undefined donmeli', () => {
        const found = db.findById('999');
        expect(found).toBeUndefined();
    });

    it('Kayit guncellenebilmeli (UPDATE)', () => {
        db.create({ id: '1', name: 'Ali', email: 'ali@test.com' });

        const updated = db.update('1', { name: 'Ali Yilmaz', email: 'aliyilmaz@test.com' });
        expect(updated).toBeDefined();
        expect(updated!.name).toBe('Ali Yilmaz');
    });

    it('Olmayan kayit guncellenmeye calisilirsa undefined donmeli', () => {
        const result = db.update('999', { name: 'test' });
        expect(result).toBeUndefined();
    });

    it('Kayit silinebilmeli (DELETE)', () => {
        db.create({ id: '1', name: 'Ali', email: 'ali@test.com' });

        const deleted = db.delete('1');
        expect(deleted).toBe(true);

        const found = db.findById('1');
        expect(found).toBeUndefined();
    });

    it('Olmayan kayit silinmeye calisilirsa false donmeli', () => {
        const result = db.delete('999');
        expect(result).toBe(false);
    });

    it('Veriler JSON dosyasina kaydedilmeli (persistence)', () => {
        db.create({ id: '1', name: 'Ali', email: 'ali@test.com' });

        const db2 = new JsonDatabase<{ id: string; name: string; email: string }>(TEST_DB_PATH);
        const found = db2.findById('1');
        expect(found).toBeDefined();
        expect(found!.name).toBe('Ali');
    });
});
