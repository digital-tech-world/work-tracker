"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    schema: './tool/server/db/schema.ts',
    out: './tool/server/drizzle',
    dialect: 'sqlite',
    dbCredentials: {
        url: 'file:./data/work-tracker.db',
    },
};
