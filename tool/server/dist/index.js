"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const drizzle_orm_1 = require("drizzle-orm");
const connection_1 = require("./db/connection");
const drizzle_orm_2 = require("drizzle-orm");
const schema_1 = require("./db/schema");
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// Areas routes
app.get('/api/areas', async (req, res) => {
    try {
        const allAreas = await connection_1.db.select().from(schema_1.areas);
        res.json(allAreas);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch areas' });
    }
});
app.get('/api/areas/:id', async (req, res) => {
    try {
        const areaId = parseInt(req.params.id);
        if (isNaN(areaId)) {
            return res.status(400).json({ error: 'Invalid area ID' });
        }
        const area = await connection_1.db.select().from(schema_1.areas).where((0, drizzle_orm_2.eq)(schema_1.areas.id, areaId)).limit(1);
        if (area.length === 0) {
            return res.status(404).json({ error: 'Area not found' });
        }
        // Get counts for tasks, bookmarks, notes in this area
        const [taskCount, bookmarkCount, noteCount] = await Promise.all([
            connection_1.db.select({ count: connection_1.db.count() }).from(schema_1.tasks).where((0, drizzle_orm_2.eq)(schema_1.tasks.areaId, areaId)),
            connection_1.db.select({ count: connection_1.db.count() }).from(schema_1.bookmarks).where((0, drizzle_orm_2.eq)(schema_1.bookmarks.areaId, areaId)),
            connection_1.db.select({ count: connection_1.db.count() }).from(schema_1.notes).where((0, drizzle_orm_2.eq)(schema_1.notes.areaId, areaId))
        ]);
        const areaWithCounts = {
            ...area[0],
            taskCount: taskCount[0].count,
            bookmarkCount: bookmarkCount[0].count,
            noteCount: noteCount[0].count
        };
        res.json(areaWithCounts);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch area' });
    }
});
app.post('/api/areas', async (req, res) => {
    try {
        const { name, description, color, githubRepo } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Area name is required' });
        }
        const [newArea] = await connection_1.db.insert(schema_1.areas).values({
            name,
            description: description || '',
            color: color || '#6366f1',
            githubRepo: githubRepo || null
        }).returning();
        res.status(201).json(newArea);
    }
    catch (error) {
        if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            return res.status(409).json({ error: 'Area with this name already exists' });
        }
        res.status(500).json({ error: 'Failed to create area' });
    }
});
app.patch('/api/areas/:id', async (req, res) => {
    try {
        const areaId = parseInt(req.params.id);
        if (isNaN(areaId)) {
            return res.status(400).json({ error: 'Invalid area ID' });
        }
        const { name, description, color, githubRepo } = req.body;
        const [updatedArea] = await connection_1.db.update(schema_1.areas)
            .set({
            name: name !== undefined ? name : undefined,
            description: description !== undefined ? description : undefined,
            color: color !== undefined ? color : undefined,
            githubRepo: githubRepo !== undefined ? githubRepo : undefined
        })
            .where((0, drizzle_orm_2.eq)(schema_1.areas.id, areaId))
            .returning();
        if (!updatedArea) {
            return res.status(404).json({ error: 'Area not found' });
        }
        res.json(updatedArea);
    }
    catch (error) {
        if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            return res.status(409).json({ error: 'Area with this name already exists' });
        }
        res.status(500).json({ error: 'Failed to update area' });
    }
});
app.delete('/api/areas/:id', async (req, res) => {
    try {
        const areaId = parseInt(req.params.id);
        if (isNaN(areaId)) {
            return res.status(400).json({ error: 'Invalid area ID' });
        }
        const [deletedArea] = await connection_1.db.delete(schema_1.areas)
            .where((0, drizzle_orm_2.eq)(schema_1.areas.id, areaId))
            .returning();
        if (!deletedArea) {
            return res.status(404).json({ error: 'Area not found' });
        }
        res.json({ message: 'Area deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete area' });
    }
});
// Tasks routes
app.get('/api/tasks', async (req, res) => {
    try {
        const { areaId, priority, status, dueBefore, dueAfter, tagIds, sort = 'createdAt', order = 'desc' } = req.query;
        // Validate areaId if provided
        let validatedAreaId = null;
        if (areaId !== undefined && areaId !== null && areaId !== '') {
            const parsedAreaId = parseInt(areaId);
            if (isNaN(parsedAreaId)) {
                return res.status(400).json({ error: 'Invalid areaId parameter' });
            }
            validatedAreaId = parsedAreaId;
        }
        let query = connection_1.db.select().from(schema_1.tasks);
        // Apply filters
        if (validatedAreaId !== null) {
            query = query.where((0, drizzle_orm_2.eq)(schema_1.tasks.areaId, validatedAreaId));
        }
        if (priority) {
            query = query.where((0, drizzle_orm_2.eq)(schema_1.tasks.priority, priority));
        }
        if (status) {
            query = query.where((0, drizzle_orm_2.eq)(schema_1.tasks.status, status));
        }
        if (dueBefore) {
            const dueBeforeNum = parseInt(dueBefore);
            if (!isNaN(dueBeforeNum)) {
                query = query.where(schema_1.tasks.dueDate <= dueBeforeNum);
            }
        }
        if (dueAfter) {
            const dueAfterNum = parseInt(dueAfter);
            if (!isNaN(dueAfterNum)) {
                query = query.where(schema_1.tasks.dueDate >= dueAfterNum);
            }
        }
        // Apply sorting
        const sortColumn = schema_1.tasks[sort] || schema_1.tasks.createdAt;
        query = query.orderBy(order === 'asc' ? sortColumn.asc() : sortColumn.desc());
        const allTasks = await query;
        res.json(allTasks);
    }
    catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
});
app.get('/api/tasks/counts', async (req, res) => {
    try {
        const [total, todo, inProgress, done] = await Promise.all([
            connection_1.db.select({ count: connection_1.db.count() }).from(schema_1.tasks),
            connection_1.db.select({ count: connection_1.db.count() }).from(schema_1.tasks).where((0, drizzle_orm_2.eq)(schema_1.tasks.status, 'todo')),
            connection_1.db.select({ count: connection_1.db.count() }).from(schema_1.tasks).where((0, drizzle_orm_2.eq)(schema_1.tasks.status, 'in-progress')),
            connection_1.db.select({ count: connection_1.db.count() }).from(schema_1.tasks).where((0, drizzle_orm_2.eq)(schema_1.tasks.status, 'done'))
        ]);
        res.json({
            total: total[0].count,
            todo: todo[0].count,
            inProgress: inProgress[0].count,
            done: done[0].count
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch task counts' });
    }
});
app.get('/api/tasks/:id', async (req, res) => {
    try {
        const taskId = parseInt(req.params.id);
        if (isNaN(taskId)) {
            return res.status(400).json({ error: 'Invalid task ID' });
        }
        const task = await connection_1.db.select().from(schema_1.tasks).where((0, drizzle_orm_2.eq)(schema_1.tasks.id, taskId)).limit(1);
        if (task.length === 0) {
            return res.status(404).json({ error: 'Task not found' });
        }
        res.json(task[0]);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch task' });
    }
});
app.post('/api/tasks', async (req, res) => {
    try {
        const { title, description, priority, status, areaId, dueDate, githubIssueUrl, githubIssueNumber } = req.body;
        if (!title) {
            return res.status(400).json({ error: 'Task title is required' });
        }
        const [newTask] = await connection_1.db.insert(schema_1.tasks).values({
            title,
            description: description || '',
            priority: priority || 'medium',
            status: status || 'todo',
            areaId: areaId || null,
            dueDate: dueDate || null,
            githubIssueUrl: githubIssueUrl || null,
            githubIssueNumber: githubIssueNumber || null
        }).returning();
        res.status(201).json(newTask);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create task' });
    }
});
app.patch('/api/tasks/:id', async (req, res) => {
    try {
        const taskId = parseInt(req.params.id);
        if (isNaN(taskId)) {
            return res.status(400).json({ error: 'Invalid task ID' });
        }
        const { title, description, priority, status, areaId, dueDate, githubIssueUrl, githubIssueNumber } = req.body;
        const [updatedTask] = await connection_1.db.update(schema_1.tasks)
            .set({
            title: title !== undefined ? title : undefined,
            description: description !== undefined ? description : undefined,
            priority: priority !== undefined ? priority : undefined,
            status: status !== undefined ? status : undefined,
            areaId: areaId !== undefined ? areaId : undefined,
            dueDate: dueDate !== undefined ? dueDate : undefined,
            githubIssueUrl: githubIssueUrl !== undefined ? githubIssueUrl : undefined,
            githubIssueNumber: githubIssueNumber !== undefined ? githubIssueNumber : undefined,
            updatedAt: new Date().getTime()
        })
            .where((0, drizzle_orm_2.eq)(schema_1.tasks.id, taskId))
            .returning();
        if (!updatedTask) {
            return res.status(404).json({ error: 'Task not found' });
        }
        res.json(updatedTask);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update task' });
    }
});
app.delete('/api/tasks/:id', async (req, res) => {
    try {
        const taskId = parseInt(req.params.id);
        if (isNaN(taskId)) {
            return res.status(400).json({ error: 'Invalid task ID' });
        }
        const [deletedTask] = await connection_1.db.delete(schema_1.tasks)
            .where((0, drizzle_orm_2.eq)(schema_1.tasks.id, taskId))
            .returning();
        if (!deletedTask) {
            return res.status(404).json({ error: 'Task not found' });
        }
        res.json({ message: 'Task deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete task' });
    }
});
// Similar routes for bookmarks and notes would go here...
// For brevity, I'll implement a few more key routes
// Bookmarks routes
app.get('/api/bookmarks', async (req, res) => {
    try {
        const { areaId, tagIds, sort = 'createdAt', order = 'desc' } = req.query;
        let query = connection_1.db.select().from(schema_1.bookmarks);
        if (areaId) {
            query = query.where((0, drizzle_orm_2.eq)(schema_1.bookmarks.areaId, parseInt(areaId)));
        }
        const sortColumn = schema_1.bookmarks[sort] || schema_1.bookmarks.createdAt;
        query = query.orderBy(order === 'asc' ? sortColumn.asc() : sortColumn.desc());
        const allBookmarks = await query;
        res.json(allBookmarks);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch bookmarks' });
    }
});
app.get('/api/bookmarks/:id', async (req, res) => {
    try {
        const bookmarkId = parseInt(req.params.id);
        if (isNaN(bookmarkId)) {
            return res.status(400).json({ error: 'Invalid bookmark ID' });
        }
        const bookmark = await connection_1.db.select().from(schema_1.bookmarks).where((0, drizzle_orm_2.eq)(schema_1.bookmarks.id, bookmarkId)).limit(1);
        if (bookmark.length === 0) {
            return res.status(404).json({ error: 'Bookmark not found' });
        }
        res.json(bookmark[0]);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch bookmark' });
    }
});
app.post('/api/bookmarks', async (req, res) => {
    try {
        const { title, url, description, areaId } = req.body;
        if (!title || !url) {
            return res.status(400).json({ error: 'Bookmark title and URL are required' });
        }
        const [newBookmark] = await connection_1.db.insert(schema_1.bookmarks).values({
            title,
            url,
            description: description || '',
            areaId: areaId || null
        }).returning();
        res.status(201).json(newBookmark);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create bookmark' });
    }
});
app.patch('/api/bookmarks/:id', async (req, res) => {
    try {
        const bookmarkId = parseInt(req.params.id);
        if (isNaN(bookmarkId)) {
            return res.status(400).json({ error: 'Invalid bookmark ID' });
        }
        const { title, url, description, areaId } = req.body;
        const [updatedBookmark] = await connection_1.db.update(schema_1.bookmarks)
            .set({
            title: title !== undefined ? title : undefined,
            url: url !== undefined ? url : undefined,
            description: description !== undefined ? description : undefined,
            areaId: areaId !== undefined ? areaId : undefined,
            updatedAt: new Date().getTime()
        })
            .where((0, drizzle_orm_2.eq)(schema_1.bookmarks.id, bookmarkId))
            .returning();
        if (!updatedBookmark) {
            return res.status(404).json({ error: 'Bookmark not found' });
        }
        res.json(updatedBookmark);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update bookmark' });
    }
});
app.delete('/api/bookmarks/:id', async (req, res) => {
    try {
        const bookmarkId = parseInt(req.params.id);
        if (isNaN(bookmarkId)) {
            return res.status(400).json({ error: 'Invalid bookmark ID' });
        }
        const [deletedBookmark] = await connection_1.db.delete(schema_1.bookmarks)
            .where((0, drizzle_orm_2.eq)(schema_1.bookmarks.id, bookmarkId))
            .returning();
        if (!deletedBookmark) {
            return res.status(404).json({ error: 'Bookmark not found' });
        }
        res.json({ message: 'Bookmark deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete bookmark' });
    }
});
// Notes routes
app.get('/api/notes', async (req, res) => {
    try {
        const { areaId, tagIds, sort = 'createdAt', order = 'desc' } = req.query;
        let query = connection_1.db.select().from(schema_1.notes);
        if (areaId) {
            query = query.where((0, drizzle_orm_2.eq)(schema_1.notes.areaId, parseInt(areaId)));
        }
        const sortColumn = schema_1.notes[sort] || schema_1.notes.createdAt;
        query = query.orderBy(order === 'asc' ? sortColumn.asc() : sortColumn.desc());
        const allNotes = await query;
        res.json(allNotes);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch notes' });
    }
});
app.get('/api/notes/:id', async (req, res) => {
    try {
        const noteId = parseInt(req.params.id);
        if (isNaN(noteId)) {
            return res.status(400).json({ error: 'Invalid note ID' });
        }
        const note = await connection_1.db.select().from(schema_1.notes).where((0, drizzle_orm_2.eq)(schema_1.notes.id, noteId)).limit(1);
        if (note.length === 0) {
            return res.status(404).json({ error: 'Note not found' });
        }
        res.json(note[0]);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch note' });
    }
});
app.post('/api/notes', async (req, res) => {
    try {
        const { title, content, areaId } = req.body;
        if (!title || !content) {
            return res.status(400).json({ error: 'Note title and content are required' });
        }
        const [newNote] = await connection_1.db.insert(schema_1.notes).values({
            title,
            content,
            areaId: areaId || null
        }).returning();
        res.status(201).json(newNote);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create note' });
    }
});
app.patch('/api/notes/:id', async (req, res) => {
    try {
        const noteId = parseInt(req.params.id);
        if (isNaN(noteId)) {
            return res.status(400).json({ error: 'Invalid note ID' });
        }
        const { title, content, areaId } = req.body;
        const [updatedNote] = await connection_1.db.update(schema_1.notes)
            .set({
            title: title !== undefined ? title : undefined,
            content: content !== undefined ? content : undefined,
            areaId: areaId !== undefined ? areaId : undefined,
            updatedAt: new Date().getTime()
        })
            .where((0, drizzle_orm_2.eq)(schema_1.notes.id, noteId))
            .returning();
        if (!updatedNote) {
            return res.status(404).json({ error: 'Note not found' });
        }
        res.json(updatedNote);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update note' });
    }
});
app.delete('/api/notes/:id', async (req, res) => {
    try {
        const noteId = parseInt(req.params.id);
        if (isNaN(noteId)) {
            return res.status(400).json({ error: 'Invalid note ID' });
        }
        const [deletedNote] = await connection_1.db.delete(schema_1.notes)
            .where((0, drizzle_orm_2.eq)(schema_1.notes.id, noteId))
            .returning();
        if (!deletedNote) {
            return res.status(404).json({ error: 'Note not found' });
        }
        res.json({ message: 'Note deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete note' });
    }
});
// Tags routes
app.get('/api/tags', async (req, res) => {
    try {
        const allTags = await connection_1.db.select().from(schema_1.tags);
        res.json(allTags);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch tags' });
    }
});
app.post('/api/tags', async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Tag name is required' });
        }
        const [newTag] = await connection_1.db.insert(schema_1.tags).values({ name }).returning();
        res.status(201).json(newTag);
    }
    catch (error) {
        if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            return res.status(409).json({ error: 'Tag with this name already exists' });
        }
        res.status(500).json({ error: 'Failed to create tag' });
    }
});
app.delete('/api/tags/:id', async (req, res) => {
    try {
        const tagId = parseInt(req.params.id);
        if (isNaN(tagId)) {
            return res.status(400).json({ error: 'Invalid tag ID' });
        }
        const [deletedTag] = await connection_1.db.delete(schema_1.tags)
            .where((0, drizzle_orm_2.eq)(schema_1.tags.id, tagId))
            .returning();
        if (!deletedTag) {
            return res.status(404).json({ error: 'Tag not found' });
        }
        res.json({ message: 'Tag deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete tag' });
    }
});
// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
// Daily Log routes
app.get('/api/daily-log/list', async (req, res) => {
    try {
        const logs = await connection_1.db.select().from(schema_1.dailyLogs).orderBy(schema_1.dailyLogs.date.desc());
        res.json(logs);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch daily logs' });
    }
});
app.get('/api/daily-log/:date', async (req, res) => {
    try {
        const date = req.params.date;
        // Validate date format (YYYY-MM-DD)
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
        }
        const [log] = await connection_1.db.select().from(schema_1.dailyLogs).where((0, drizzle_orm_2.eq)(schema_1.dailyLogs.date, date));
        if (!log) {
            return res.status(404).json({ error: 'Daily log not found for this date' });
        }
        const entries = await connection_1.db.select().from(schema_1.dailyEntries)
            .where((0, drizzle_orm_2.eq)(schema_1.dailyEntries.logId, log.id))
            .orderBy(schema_1.dailyEntries.createdAt.desc());
        res.json({
            ...log,
            entries
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch daily log' });
    }
});
app.post('/api/daily-log/:date/entries', async (req, res) => {
    try {
        const date = req.params.date;
        // Validate date format (YYYY-MM-DD)
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
        }
        const [log] = await connection_1.db.select().from(schema_1.dailyLogs).where((0, drizzle_orm_2.eq)(schema_1.dailyLogs.date, date));
        if (!log) {
            // Create log if it doesn't exist
            const [newLog] = await connection_1.db.insert(schema_1.dailyLogs).values({
                date,
                summary: req.body.summary || ''
            }).returning();
            const [newEntry] = await connection_1.db.insert(schema_1.dailyEntries).values({
                logId: newLog.id,
                text: req.body.text,
                isHighlight: req.body.isHighlight || false,
                taskId: req.body.taskId || null
            }).returning();
            return res.status(201).json(newEntry);
        }
        const [newEntry] = await connection_1.db.insert(schema_1.dailyEntries).values({
            logId: log.id,
            text: req.body.text,
            isHighlight: req.body.isHighlight || false,
            taskId: req.body.taskId || null
        }).returning();
        res.status(201).json(newEntry);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create daily log entry' });
    }
});
app.patch('/api/daily-log/entries/:id', async (req, res) => {
    try {
        const entryId = parseInt(req.params.id);
        if (isNaN(entryId)) {
            return res.status(400).json({ error: 'Invalid entry ID' });
        }
        const { text, isHighlight, taskId } = req.body;
        const [updatedEntry] = await connection_1.db.update(schema_1.dailyEntries)
            .set({
            text: text !== undefined ? text : undefined,
            isHighlight: isHighlight !== undefined ? isHighlight : undefined,
            taskId: taskId !== undefined ? taskId : undefined
        })
            .where((0, drizzle_orm_2.eq)(schema_1.dailyEntries.id, entryId))
            .returning();
        if (!updatedEntry) {
            return res.status(404).json({ error: 'Entry not found' });
        }
        res.json(updatedEntry);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update daily log entry' });
    }
});
app.delete('/api/daily-log/entries/:id', async (req, res) => {
    try {
        const entryId = parseInt(req.params.id);
        if (isNaN(entryId)) {
            return res.status(400).json({ error: 'Invalid entry ID' });
        }
        const [deletedEntry] = await connection_1.db.delete(schema_1.dailyEntries)
            .where((0, drizzle_orm_2.eq)(schema_1.dailyEntries.id, entryId))
            .returning();
        if (!deletedEntry) {
            return res.status(404).json({ error: 'Entry not found' });
        }
        res.json({ message: 'Entry deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete daily log entry' });
    }
});
app.patch('/api/daily-log/:date', async (req, res) => {
    try {
        const date = req.params.date;
        // Validate date format (YYYY-MM-DD)
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
        }
        const { summary } = req.body;
        const [updatedLog] = await connection_1.db.update(schema_1.dailyLogs)
            .set({
            summary: summary !== undefined ? summary : undefined,
            updatedAt: new Date().getTime()
        })
            .where((0, drizzle_orm_2.eq)(schema_1.dailyLogs.date, date))
            .returning();
        if (!updatedLog) {
            return res.status(404).json({ error: 'Daily log not found for this date' });
        }
        res.json(updatedLog);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update daily log' });
    }
});
app.delete('/api/daily-log/:date', async (req, res) => {
    try {
        const date = req.params.date;
        // Validate date format (YYYY-MM-DD)
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
        }
        // Find the log first to get its ID for deleting entries
        const [log] = await connection_1.db.select().from(schema_1.dailyLogs).where((0, drizzle_orm_2.eq)(schema_1.dailyLogs.date, date));
        if (!log) {
            return res.status(404).json({ error: 'Daily log not found for this date' });
        }
        // Delete entries first (due to foreign key constraint)
        await connection_1.db.delete(schema_1.dailyEntries)
            .where((0, drizzle_orm_2.eq)(schema_1.dailyEntries.logId, log.id));
        // Then delete the log
        const [deletedLog] = await connection_1.db.delete(schema_1.dailyLogs)
            .where((0, drizzle_orm_2.eq)(schema_1.dailyLogs.date, date))
            .returning();
        res.json({ message: 'Daily log deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete daily log' });
    }
});
// Dashboard route
app.get('/api/dashboard', async (req, res) => {
    try {
        // Get basic stats
        const [totalTasks, openTasks, overdueTasks, bookmarkCount] = await Promise.all([
            connection_1.db.select({ count: connection_1.db.count() }).from(schema_1.tasks),
            connection_1.db.select({ count: connection_1.db.count() }).from(schema_1.tasks).where((0, drizzle_orm_1.sql) `${schema_1.tasks.status} IN ('todo', 'in-progress')`),
            connection_1.db.select({ count: connection_1.db.count() }).from(schema_1.tasks).where((0, drizzle_orm_1.sql) `${schema_1.tasks.status} NOT IN ('done') AND ${schema_1.tasks.dueDate} < ${new Date().toISOString()}`),
            connection_1.db.select({ count: connection_1.db.count() }).from(schema_1.bookmarks)
        ]);
        res.json({
            totalTasks: totalTasks[0].count,
            openTasks: openTasks[0].count,
            overdueTasks: overdueTasks[0].count,
            bookmarkCount: bookmarkCount[0].count
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
});
app.get('/api/dashboard/recent', async (req, res) => {
    try {
        // Get recent items from all types
        const [recentTasks, recentBookmarks, recentNotes] = await Promise.all([
            connection_1.db.select().from(schema_1.tasks).orderBy(schema_1.tasks.createdAt.desc()).limit(5),
            connection_1.db.select().from(schema_1.bookmarks).orderBy(schema_1.bookmarks.createdAt.desc()).limit(5),
            connection_1.db.select().from(schema_1.notes).orderBy(schema_1.notes.createdAt.desc()).limit(5)
        ]);
        const recentItems = [
            ...recentTasks.map(task => ({
                id: task.id,
                title: task.title,
                type: 'task',
                areaId: task.areaId,
                createdAt: task.createdAt
            })),
            ...recentBookmarks.map(bookmark => ({
                id: bookmark.id,
                title: bookmark.title,
                type: 'bookmark',
                areaId: bookmark.areaId,
                createdAt: bookmark.createdAt
            })),
            ...recentNotes.map(note => ({
                id: note.id,
                title: note.title,
                type: 'note',
                areaId: note.areaId,
                createdAt: note.createdAt
            }))
        ].sort((a, b) => b.createdAt - a.createdAt).slice(0, 10); // Sort by date and take top 10
        res.json(recentItems);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch recent items' });
    }
});
// Search route (FTS5)
app.get('/api/search', async (req, res) => {
    try {
        const { q, type } = req.query;
        if (!q || typeof q !== 'string') {
            return res.status(400).json({ error: 'Search query is required' });
        }
        let query = connection_1.db.select({
            id: connection_1.db.raw(`search_index.rowid`),
            title: connection_1.db.raw(`search_index.title`),
            content: connection_1.db.raw(`search_index.content`),
            item_type: connection_1.db.raw(`search_index.item_type`),
            item_id: connection_1.db.raw(`search_index.rowid`)
        }).from(connection_1.db.raw('search_index')).where(connection_1.db.raw('search_index MATCH ?', [q]));
        // Filter by type if specified
        if (type && typeof type === 'string') {
            const typeMap = {
                'task': 'task',
                'bookmark': 'bookmark',
                'note': 'note'
            };
            const itemType = typeMap[type];
            if (itemType) {
                query = query.where(connection_1.db.raw('search_index.item_type = ?', [itemType]));
            }
        }
        const results = await query;
        // Format results to match frontend expectations
        const formattedResults = results.map(row => ({
            id: row.item_id,
            title: row.title,
            content: row.content,
            type: row.item_type,
            areaId: null // Would need to join with respective tables in a real implementation
        }));
        res.json(formattedResults);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to perform search' });
    }
});
// Serve static files from docs directory
app.get('/api/docs', async (req, res) => {
    try {
        const fs = await Promise.resolve().then(() => __importStar(require('fs')));
        const path = await Promise.resolve().then(() => __importStar(require('path')));
        const docsDir = path.join(process.cwd(), 'docs');
        if (!fs.existsSync(docsDir)) {
            return res.json([]);
        }
        const getFileTree = (dir, relativePath = '') => {
            const items = fs.readdirSync(dir, { withFileTypes: true });
            return items.map(item => {
                const fullPath = path.join(relativePath, item.name);
                return {
                    name: item.name,
                    path: fullPath,
                    type: item.isDirectory() ? 'directory' : 'file'
                };
            }).sort((a, b) => {
                // Directories first, then files
                if (a.type === 'directory' && b.type === 'file')
                    return -1;
                if (a.type === 'file' && b.type === 'directory')
                    return 1;
                return a.name.localeCompare(b.name);
            });
        };
        const fileTree = getFileTree(docsDir);
        res.json(fileTree);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch documentation files' });
    }
});
app.get('/api/docs/content', async (req, res) => {
    try {
        const { path: filePath } = req.query;
        if (!filePath || typeof filePath !== 'string') {
            return res.status(400).json({ error: 'File path is required' });
        }
        const fs = await Promise.resolve().then(() => __importStar(require('fs')));
        const path = await Promise.resolve().then(() => __importStar(require('path')));
        const docsDir = path.join(process.cwd(), 'docs');
        const fullPath = path.join(docsDir, filePath);
        // Security check: ensure the file is within the docs directory
        if (!fullPath.startsWith(docsDir)) {
            return res.status(403).json({ error: 'Access denied' });
        }
        if (!fs.existsSync(fullPath)) {
            return res.status(404).json({ error: 'File not found' });
        }
        const content = fs.readFileSync(fullPath, 'utf8');
        res.send(content);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to read file content' });
    }
});
// Import AI services
const ollama_1 = __importDefault(require("./services/ollama"));
const rag_1 = __importDefault(require("./services/rag"));
// Initialize RAG service on startup
// Skip RAG initialization to avoid Ollama connection delays/errors
// ragService.initialize().catch(console.error);
console.log('Skipping RAG initialization (Ollama not required for basic functionality)');
// AI Routes
app.get('/api/ai/status', async (req, res) => {
    try {
        const [chatModel, embeddingModel] = await Promise.all([
            ollama_1.default.isModelAvailable('llama3.1') ? 'llama3.1' :
                ollama_1.default.isModelAvailable('llama3.2') ? 'llama3.2' :
                    ollama_1.default.isModelAvailable('llama3') ? 'llama3' :
                        ollama_1.default.isModelAvailable('mistral') ? 'mistral' :
                            ollama_1.default.isModelAvailable('gemma2') ? 'gemma2' :
                                ollama_1.default.isModelAvailable('phi3') ? 'phi3' :
                                    ollama_1.default.isModelAvailable('codellama') ? 'codellama' :
                                        ollama_1.default.isModelAvailable('qwen2') ? 'qwen2' :
                                            ollama_1.default.isModelAvailable('deepseek') ? 'deepseek' : null,
            rag_1.default.embeddingModel
        ]);
        res.json({
            ollamaHost: ollama_1.default.getHost(),
            chatModelAvailable: !!chatModel,
            embeddingModelAvailable: !!embeddingModel,
            embeddingModel: embeddingModel,
            ragInitialized: rag_1.default.isInitialized
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to get AI status' });
    }
});
app.post('/api/ai/similar-tasks', async (req, res) => {
    try {
        const { taskId, limit = 5 } = req.body;
        if (!taskId) {
            return res.status(400).json({ error: 'Task ID is required' });
        }
        // Get the task to find similar ones
        const [task] = await connection_1.db.select().from(schema_1.tasks).where((0, drizzle_orm_2.eq)(schema_1.tasks.id, taskId)).limit(1);
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }
        // Use RAG to find similar tasks based on title and description
        const query = `${task.title} ${task.description || ''}`;
        const results = await rag_1.default.semanticSearch(query, ['task'], limit);
        // Filter out the original task
        const similarTasks = results.filter(result => result.id !== taskId);
        res.json(similarTasks);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to find similar tasks' });
    }
});
app.post('/api/ai/categorize', async (req, res) => {
    try {
        const { title, description } = req.body;
        if (!title) {
            return res.status(400).json({ error: 'Title is required' });
        }
        // Get available areas and tags
        const [areas, tags] = await Promise.all([
            connection_1.db.select().from(areas),
            connection_1.db.select().from(tags)
        ]);
        // Prepare prompt for categorization
        const areaList = areas.map(a => `- ${a.name}`).join('\n');
        const tagList = tags.map(t => `- ${t.name}`).join('\n');
        const prompt = `Given the following task title and description, suggest the most appropriate area and tags from the available lists.

Title: ${title}
Description: ${description || ''}

Available Areas:
${areaList}

Available Tags:
${tagList}

Respond with a JSON object containing:
- areaId: the ID of the suggested area (or null if none fits well)
- tagIds: an array of suggested tag IDs
- priority: suggested priority level (critical, high, medium, low)

Only suggest areas and tags that actually exist in the lists above.`;
        // Use Ollama to generate categorization
        const chatModel = await ollama_1.default.isModelAvailable('llama3.1') ? 'llama3.1' :
            ollama_1.default.isModelAvailable('llama3.2') ? 'llama3.2' :
                ollama_1.default.isModelAvailable('llama3') ? 'llama3' :
                    ollama_1.default.isModelAvailable('mistral') ? 'mistral' :
                        ollama_1.default.isModelAvailable('gemma2') ? 'gemma2' :
                            ollama_1.default.isModelAvailable('phi3') ? 'phi3' :
                                ollama_1.default.isModelAvailable('codellama') ? 'codellama' :
                                    ollama_1.default.isModelAvailable('qwen2') ? 'qwen2' :
                                        ollama_1.default.isModelAvailable('deepseek') ? 'deepseek' : null;
        if (!chatModel) {
            // Fallback: return first area and no tags if no model available
            const fallbackAreaId = areas.length > 0 ? areas[0].id : null;
            return res.json({
                areaId: fallbackAreaId,
                tagIds: [],
                priority: 'medium'
            });
        }
        const response = await ollama_1.default.generateChat(chatModel, [
            { role: 'system', content: 'You are a helpful assistant that categorizes tasks. Respond only with valid JSON.' },
            { role: 'user', content: prompt }
        ], { format: 'json' });
        let result;
        try {
            result = JSON.parse(response.message.content);
        }
        catch (parseError) {
            // Fallback if JSON parsing fails
            const fallbackAreaId = areas.length > 0 ? areas[0].id : null;
            result = {
                areaId: fallbackAreaId,
                tagIds: [],
                priority: 'medium'
            };
        }
        // Validate the result
        const validAreaId = areas.some(a => a.id === result.areaId) ? result.areaId : null;
        const validTagIds = Array.isArray(result.tagIds) ?
            result.tagIds.filter(id => tags.some(t => t.id === id)) : [];
        const validPriority = ['critical', 'high', 'medium', 'low'].includes(result.priority) ?
            result.priority : 'medium';
        res.json({
            areaId: validAreaId,
            tagIds: validTagIds,
            priority: validPriority
        });
    }
    catch (error) {
        console.error('Categorization error:', error);
        res.status(500).json({ error: 'Failed to categorize task' });
    }
});
app.post('/api/ai/summary', async (req, res) => {
    try {
        const { period = 'week' } = req.body;
        // Get tasks for the period
        let whereClause = '';
        const now = new Date();
        if (period === 'day') {
            whereClause = (0, drizzle_orm_1.sql) `${schema_1.tasks.updatedAt} >= ${now.getTime() - (24 * 60 * 60 * 1000)}`;
        }
        else if (period === 'week') {
            whereClause = (0, drizzle_orm_1.sql) `${schema_1.tasks.updatedAt} >= ${now.getTime() - (7 * 24 * 60 * 60 * 1000)}`;
        }
        else if (period === 'month') {
            whereClause = (0, drizzle_orm_1.sql) `${schema_1.tasks.updatedAt} >= ${now.getTime() - (30 * 24 * 60 * 60 * 1000)}`;
        }
        else {
            whereClause = (0, drizzle_orm_1.sql) `${schema_1.tasks.updatedAt} >= ${now.getTime() - (7 * 24 * 60 * 60 * 1000)}`; // default to week
        }
        const [tasksData] = await Promise.all([
            connection_1.db.select({
                id: schema_1.tasks.id,
                title: schema_1.tasks.title,
                description: schema_1.tasks.description,
                status: schema_1.tasks.status,
                priority: schema_1.tasks.priority,
                updatedAt: schema_1.tasks.updatedAt
            })
                .from(schema_1.tasks)
                .where(whereClause)
        ]);
        if (tasksData.length === 0) {
            return res.json({ summary: 'No tasks found for the specified period.' });
        }
        // Prepare prompt for summary
        const taskList = tasksData
            .map(t => `- [${t.status}] ${t.title}${t.description ? ': ' + t.description : ''} (Priority: ${t.priority})`)
            .join('\n');
        const prompt = `Based on the following tasks from the last ${period}, create a concise work summary suitable for a standup update:

${taskList}

Focus on accomplishments, progress, and any blockers. Keep it brief and professional.`;
        // Use Ollama to generate summary
        const chatModel = await ollama_1.default.isModelAvailable('llama3.1') ? 'llama3.1' :
            ollama_1.default.isModelAvailable('llama3.2') ? 'llama3.2' :
                ollama_1.default.isModelAvailable('llama3') ? 'llama3' :
                    ollama_1.default.isModelAvailable('mistral') ? 'mistral' :
                        ollama_1.default.isModelAvailable('gemma2') ? 'gemma2' :
                            ollama_1.default.isModelAvailable('phi3') ? 'phi3' :
                                ollama_1.default.isModelAvailable('codellama') ? 'codellama' :
                                    ollama_1.default.isModelAvailable('qwen2') ? 'qwen2' :
                                        ollama_1.default.isModelAvailable('deepseek') ? 'deepseek' : null;
        if (!chatModel) {
            // Fallback summary if no model available
            const completed = tasksData.filter(t => t.status === 'done').length;
            const inProgress = tasksData.filter(t => t.status === 'in-progress').length;
            const todo = tasksData.filter(t => t.status === 'todo').length;
            const fallbackSummary = `Last ${period}: ${completed} tasks completed, ${inProgress} in progress, ${todo} remaining.`;
            return res.json({ summary: fallbackSummary });
        }
        const response = await ollama_1.default.generateChat(chatModel, [
            { role: 'system', content: 'You are a helpful assistant that creates work summaries.' },
            { role: 'user', content: prompt }
        ]);
        res.json({ summary: response.message.content });
    }
    catch (error) {
        console.error('Summary error:', error);
        res.status(500).json({ error: 'Failed to generate summary' });
    }
});
app.post('/api/ai/reindex', async (req, res) => {
    try {
        await rag_1.default.reindexAll();
        res.json({ message: 'Reindexing started' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to start reindexing' });
    }
});
// Semantic search endpoint (RAG)
app.get('/api/ai/search', async (req, res) => {
    try {
        const { q, type, limit = 10 } = req.query;
        if (!q || typeof q !== 'string') {
            return res.status(400).json({ error: 'Search query is required' });
        }
        let itemTypes = ['task', 'bookmark', 'note', 'doc'];
        if (type && typeof type === 'string') {
            const typeMap = {
                'task': 'task',
                'bookmark': 'bookmark',
                'note': 'note',
                'doc': 'doc'
            };
            const mappedType = typeMap[type];
            if (mappedType) {
                itemTypes = [mappedType];
            }
        }
        const results = await rag_1.default.semanticSearch(q, itemTypes, parseInt(limit, 10) || 10);
        res.json(results);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to perform semantic search' });
    }
});
