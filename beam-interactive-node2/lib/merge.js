"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var deepmerge = require("deepmerge"); //tslint:disable-line no-require-imports import-name
/**
 * Merges the properties of two objects together, mutating the first object. Similar to lodash's merge.
 */
function merge(x, y) {
    return Object.assign(x, deepmerge(x, y));
}
exports.merge = merge;
//# sourceMappingURL=merge.js.map