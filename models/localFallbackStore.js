const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, '../.local_db.json');

let store = {
    counters: {},
    collections: {
        teachers: [],
        groups: [],
        students: [],
        activities: [],
        questions: [],
        attempts: [],
        subjects: [],
        course_assignments: []
    }
};

function loadStore() {
    try {
        if (fs.existsSync(DB_FILE)) {
            const raw = fs.readFileSync(DB_FILE, 'utf-8');
            const parsed = JSON.parse(raw);
            if (parsed && parsed.collections) {
                store = parsed;
            }
        }
    } catch (e) {
        console.warn('⚠️ Iniciando almacén local en memoria limpio.');
    }
}

function saveStore() {
    try {
        fs.writeFileSync(DB_FILE, JSON.stringify(store, null, 2), 'utf-8');
    } catch (e) {}
}

function nextId(seqName, col) {
    const maxExisting = col.reduce((max, item) => (typeof item.id === 'number' && item.id > max ? item.id : max), 0);
    const current = store.counters[seqName] || 0;
    const next = Math.max(current, maxExisting) + 1;
    store.counters[seqName] = next;
    return next;
}

function matchesCondition(val, cond) {
    if (cond instanceof RegExp) {
        return cond.test(String(val ?? ''));
    }
    if (cond && typeof cond === 'object' && !Array.isArray(cond)) {
        if (cond.$regex !== undefined) {
            const re = cond.$regex instanceof RegExp
                ? cond.$regex
                : new RegExp(cond.$regex, cond.$options || '');
            return re.test(String(val ?? ''));
        }
        if (cond.$not !== undefined) {
            return !matchesCondition(val, cond.$not);
        }
        if (cond.$in !== undefined && Array.isArray(cond.$in)) {
            if (Array.isArray(val)) {
                return val.some(v => cond.$in.includes(v));
            }
            return cond.$in.includes(val);
        }
        if (cond.$ne !== undefined) {
            return val !== cond.$ne;
        }
        if (cond.$exists !== undefined) {
            return cond.$exists ? val !== undefined : val === undefined;
        }
        if (cond.$size !== undefined) {
            return Array.isArray(val) && val.length === cond.$size;
        }
    }
    if (Array.isArray(val) && !Array.isArray(cond)) {
        return val.includes(cond);
    }
    return val === cond;
}

function matchesFilter(doc, filter) {
    if (!filter || Object.keys(filter).length === 0) return true;
    for (const key of Object.keys(filter)) {
        if (key === '$or' && Array.isArray(filter.$or)) {
            if (!filter.$or.some(sub => matchesFilter(doc, sub))) return false;
            continue;
        }
        if (key === '$and' && Array.isArray(filter.$and)) {
            if (!filter.$and.every(sub => matchesFilter(doc, sub))) return false;
            continue;
        }
        if (!matchesCondition(doc[key], filter[key])) {
            return false;
        }
    }
    return true;
}

function wrapDoc(raw, col, defaults = {}) {
    const doc = { ...defaults, ...raw };
    if (!doc._id) doc._id = String(doc.id || Math.random().toString(36).slice(2));
    if (!doc.created_at) doc.created_at = new Date().toISOString();

    Object.defineProperty(doc, 'toObject', {
        enumerable: false,
        writable: true,
        value: function() {
            const copy = { ...this };
            return copy;
        }
    });
    Object.defineProperty(doc, 'toJSON', {
        enumerable: false,
        writable: true,
        value: function() {
            const copy = { ...this };
            return copy;
        }
    });
    Object.defineProperty(doc, 'save', {
        enumerable: false,
        writable: true,
        value: async function() {
            const idx = col.findIndex(item => item.id === this.id);
            const cleanCopy = { ...this };
            if (idx >= 0) {
                col[idx] = cleanCopy;
            } else {
                col.push(cleanCopy);
            }
            saveStore();
            return this;
        }
    });
    return doc;
}

function createQueryChain(items) {
    let result = [...items];
    const chain = {
        sort(sortSpec) {
            if (sortSpec && typeof sortSpec === 'object') {
                const entries = Object.entries(sortSpec);
                result.sort((a, b) => {
                    for (const [k, dir] of entries) {
                        const va = a[k] ?? '';
                        const vb = b[k] ?? '';
                        if (va < vb) return -1 * dir;
                        if (va > vb) return 1 * dir;
                    }
                    return 0;
                });
            }
            return chain;
        },
        limit(n) {
            result = result.slice(0, n);
            return chain;
        },
        select() {
            return chain;
        },
        lean() {
            return chain;
        },
        then(resolve, reject) {
            return Promise.resolve(result).then(resolve, reject);
        },
        catch(reject) {
            return Promise.resolve(result).catch(reject);
        }
    };
    return chain;
}

function attachFallbackMethods(mongooseModel, colName, seqName, defaults = {}) {
    const getCol = () => {
        if (!store.collections[colName]) store.collections[colName] = [];
        return store.collections[colName];
    };

    mongooseModel.find = function(filter = {}) {
        const col = getCol();
        const matched = col.filter(d => matchesFilter(d, filter)).map(d => wrapDoc(d, col, defaults));
        return createQueryChain(matched);
    };

    mongooseModel.findOne = function(filter = {}) {
        const col = getCol();
        const found = col.find(d => matchesFilter(d, filter));
        const wrapped = found ? wrapDoc(found, col, defaults) : null;
        return createQueryChain([wrapped]).then(arr => arr[0]);
    };

    mongooseModel.create = async function(data) {
        const col = getCol();
        if (Array.isArray(data)) {
            const created = [];
            for (const item of data) {
                created.push(await mongooseModel.create(item));
            }
            return created;
        }
        const id = (data.id !== undefined && data.id !== null) ? Number(data.id) : nextId(seqName, col);
        const record = {
            ...defaults,
            ...data,
            id,
            _id: String(id),
            created_at: data.created_at || new Date().toISOString()
        };
        if (colName === 'attempts' && !record.completed_at) {
            record.completed_at = new Date().toISOString();
        }
        col.push(record);
        saveStore();
        return wrapDoc(record, col, defaults);
    };

    mongooseModel.updateOne = async function(filter, update) {
        const col = getCol();
        const target = col.find(d => matchesFilter(d, filter));
        if (!target) return { matchedCount: 0, modifiedCount: 0 };
        if (update.$set) Object.assign(target, update.$set);
        if (update.$inc) {
            for (const [k, v] of Object.entries(update.$inc)) {
                target[k] = (Number(target[k]) || 0) + Number(v);
            }
        }
        if (!update.$set && !update.$inc) Object.assign(target, update);
        saveStore();
        return { matchedCount: 1, modifiedCount: 1 };
    };

    mongooseModel.updateMany = async function(filter, update) {
        const col = getCol();
        const targets = col.filter(d => matchesFilter(d, filter));
        targets.forEach(target => {
            if (update.$set) Object.assign(target, update.$set);
            else if (update.$inc) {
                for (const [k, v] of Object.entries(update.$inc)) {
                    target[k] = (Number(target[k]) || 0) + Number(v);
                }
            } else {
                Object.assign(target, update);
            }
        });
        saveStore();
        return { matchedCount: targets.length, modifiedCount: targets.length };
    };

    mongooseModel.deleteOne = async function(filter) {
        const col = getCol();
        const idx = col.findIndex(d => matchesFilter(d, filter));
        if (idx === -1) return { deletedCount: 0 };
        col.splice(idx, 1);
        saveStore();
        return { deletedCount: 1 };
    };

    mongooseModel.deleteMany = async function(filter = {}) {
        const col = getCol();
        const before = col.length;
        store.collections[colName] = col.filter(d => !matchesFilter(d, filter));
        const deletedCount = before - store.collections[colName].length;
        saveStore();
        return { deletedCount };
    };

    mongooseModel.countDocuments = async function(filter = {}) {
        const col = getCol();
        return col.filter(d => matchesFilter(d, filter)).length;
    };

    mongooseModel.aggregate = async function(pipeline = []) {
        let items = [...getCol()];
        for (const stage of pipeline) {
            if (stage.$match) {
                items = items.filter(d => matchesFilter(d, stage.$match));
            } else if (stage.$group) {
                const idField = String(stage.$group._id || '').replace(/^\$/, '');
                const groups = new Map();
                for (const item of items) {
                    const key = item[idField];
                    if (!groups.has(key)) {
                        const row = { _id: key };
                        for (const [gKey, expr] of Object.entries(stage.$group)) {
                            if (gKey === '_id') continue;
                            if (expr && expr.$sum !== undefined) row[gKey] = 0;
                        }
                        groups.set(key, row);
                    }
                    const row = groups.get(key);
                    for (const [gKey, expr] of Object.entries(stage.$group)) {
                        if (gKey === '_id') continue;
                        if (expr && expr.$sum !== undefined) {
                            if (typeof expr.$sum === 'number') {
                                row[gKey] += expr.$sum;
                            } else if (typeof expr.$sum === 'string' && expr.$sum.startsWith('$')) {
                                const sumField = expr.$sum.slice(1);
                                row[gKey] += Number(item[sumField] || 0);
                            }
                        }
                    }
                }
                items = Array.from(groups.values());
            }
        }
        return items;
    };
}

function activateLocalFallback(models) {
    loadStore();
    attachFallbackMethods(models.Teacher, 'teachers', 'teachers', { role: 'docente', is_admin: false });
    attachFallbackMethods(models.Group, 'groups', 'groups', { code: 'N/A' });
    attachFallbackMethods(models.Student, 'students', 'students', { total_score: 0, list_number: 1 });
    attachFallbackMethods(models.Activity, 'activities', 'activities', { target_groups: [], is_training_level: false, training_grade: '', map_icon: '🏆', subject_id: null, subject_name: '', teacher_id: null, teacher_name: '' });
    attachFallbackMethods(models.Question, 'questions', 'questions', { question_type: 'opcion', options: '[]', points: 10, order_num: 0 });
    attachFallbackMethods(models.Attempt, 'attempts', 'attempts', { score: 0 });
    attachFallbackMethods(models.Subject, 'subjects', 'subjects', { description: '' });
    attachFallbackMethods(models.CourseAssignment, 'course_assignments', 'course_assignments', {});
    console.log('✅ Modo base de datos local (.local_db.json) activado automáticamente para desarrollo local.');
}

module.exports = { activateLocalFallback };
