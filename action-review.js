/* eslint-disable @typescript-eslint/no-unused-vars -- Generated browser global; edit lib/collaborator-review.js. */
"use strict";
var LLBActionReview = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // lib/collaborator-review.js
  var collaborator_review_exports = {};
  __export(collaborator_review_exports, {
    INDICATOR_FIELDS: () => INDICATOR_FIELDS,
    TECHNICAL_FIELDS: () => TECHNICAL_FIELDS,
    YEAR_FIELDS: () => YEAR_FIELDS,
    assignmentImagesChanged: () => assignmentImagesChanged,
    changeValue: () => changeValue,
    countActionChanges: () => countActionChanges,
    createReviewBaseline: () => createReviewBaseline,
    hasReviewBaseline: () => hasReviewBaseline,
    imagesChanged: () => imagesChanged,
    normalizedText: () => normalizedText,
    pairedYears: () => pairedYears,
    textDiff: () => textDiff
  });
  var TECHNICAL_FIELDS = ["diagnosis", "objectives", "actionDescription", "targetGroups", "citizenAgents", "responsibleBody", "collaboratingEntities", "observations"];
  var YEAR_FIELDS = ["year", "action", "total", "fund", "local", "other"];
  var INDICATOR_FIELDS = ["type", "phase", "description", "currentValue", "targetValue"];
  function normalizedText(value) {
    return String(value ?? "").normalize("NFC").replace(/\r\n?/g, "\n").replace(/\u00a0/g, " ").trim();
  }
  function canonical(value) {
    if (value == null || typeof value !== "object") return normalizedText(value);
    if (Array.isArray(value)) return value.map(canonical);
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonical(value[key])]));
  }
  function changeValue(before, after) {
    return JSON.stringify(canonical(before)) !== JSON.stringify(canonical(after));
  }
  function hasReviewBaseline(assignment) {
    return assignment?.comparisonAvailable !== false && Boolean(
      assignment?.baseAction && typeof assignment.baseAction === "object" && !Array.isArray(assignment.baseAction) && Object.keys(assignment.baseAction).length
    );
  }
  function imagesChanged(before, after) {
    const left = Array.isArray(before) ? before : [];
    const right = Array.isArray(after) ? after : [];
    if (left.length !== right.length) return true;
    return left.some((image, index) => {
      const next = right[index];
      return String(image?.dataUrl ?? "") !== String(next?.dataUrl ?? "") || ["caption", "source", "alt"].some((key) => changeValue(image?.[key], next?.[key]));
    });
  }
  function assignmentImagesChanged(assignment) {
    if (!hasReviewBaseline(assignment)) return false;
    return typeof assignment.imageChanges === "boolean" ? assignment.imageChanges : imagesChanged(assignment.baseAction.images, assignment.proposedAction?.images);
  }
  function pick(value, fields) {
    return Object.fromEntries(fields.map((key) => [key, value?.[key] ?? ""]));
  }
  function rows(value) {
    return Array.isArray(value) ? value : [];
  }
  function createReviewBaseline(base = {}, proposed = {}) {
    const baseAction = pick(base, ["actionCode", "actionTitle", ...TECHNICAL_FIELDS, "locationDescription", "actionType"]);
    baseAction.years = rows(base.years).map((year) => pick(year, YEAR_FIELDS));
    baseAction.indicators = rows(base.indicators).map((indicator) => pick(indicator, INDICATOR_FIELDS));
    baseAction.images = rows(base.images).map((image) => pick(image, ["name", "caption", "source", "alt"]));
    return { baseAction, imageChanges: imagesChanged(base.images, proposed.images), comparisonAvailable: true, comparisonVersion: 1 };
  }
  function pairedYears(before = [], after = []) {
    const left = new Map(rows(before).map((year) => [String(year?.year ?? ""), year]));
    const right = new Map(rows(after).map((year) => [String(year?.year ?? ""), year]));
    return [.../* @__PURE__ */ new Set([...left.keys(), ...right.keys()])].sort().map((year) => ({
      before: pick(left.get(year) ?? { year }, YEAR_FIELDS),
      after: pick(right.get(year) ?? { year }, YEAR_FIELDS)
    }));
  }
  function countActionChanges(base, action, editable, imageChange = imagesChanged(base.images, action.images)) {
    let count = 0;
    const add = (before, after) => {
      if (changeValue(before, after)) count += 1;
    };
    if (editable.includes("tecnica")) TECHNICAL_FIELDS.forEach((key) => add(base[key], action[key]));
    if (editable.includes("imatges")) {
      add(base.locationDescription, action.locationDescription);
      if (imageChange) count += 1;
    }
    if (editable.includes("pressupost")) {
      add(base.actionType, action.actionType);
      pairedYears(base.years, action.years).forEach(({ before, after }) => YEAR_FIELDS.forEach((key) => add(before[key], after[key])));
    }
    if (editable.includes("indicadors")) {
      for (let index = 0; index < Math.max(base.indicators?.length ?? 0, action.indicators?.length ?? 0); index += 1) {
        INDICATOR_FIELDS.forEach((key) => add(base.indicators?.[index]?.[key], action.indicators?.[index]?.[key]));
      }
    }
    return count;
  }
  function mergeParts(parts) {
    return parts.reduce((merged, part) => {
      if (!part.value) return merged;
      if (merged.at(-1)?.kind === part.kind) merged.at(-1).value += part.value;
      else merged.push({ ...part });
      return merged;
    }, []);
  }
  function middleDiff(left, right) {
    const frontier = /* @__PURE__ */ new Map([[1, 0]]);
    const trace = [];
    let operations = 0;
    for (let depth = 0; depth <= Math.min(left.length + right.length, 256); depth += 1) {
      trace.push(new Map(frontier));
      for (let diagonal = -depth; diagonal <= depth; diagonal += 2) {
        const down = diagonal === -depth || diagonal !== depth && (frontier.get(diagonal - 1) ?? -Infinity) < (frontier.get(diagonal + 1) ?? -Infinity);
        let x = down ? frontier.get(diagonal + 1) ?? 0 : (frontier.get(diagonal - 1) ?? 0) + 1;
        let y = x - diagonal;
        while (x < left.length && y < right.length && left[x] === right[y]) {
          x += 1;
          y += 1;
          operations += 1;
        }
        frontier.set(diagonal, x);
        operations += 1;
        if (x >= left.length && y >= right.length) {
          const reversed = [];
          for (let d = depth; d >= 0; d -= 1) {
            const previous = trace[d];
            const k = x - y;
            const prevK = k === -d || k !== d && (previous.get(k - 1) ?? -Infinity) < (previous.get(k + 1) ?? -Infinity) ? k + 1 : k - 1;
            const prevX = previous.get(prevK) ?? 0;
            const prevY = prevX - prevK;
            while (x > prevX && y > prevY) {
              reversed.push({ value: left[--x], kind: "same" });
              y -= 1;
            }
            if (d === 0) break;
            if (x === prevX) reversed.push({ value: right[--y], kind: "added" });
            else reversed.push({ value: left[--x], kind: "removed" });
          }
          return reversed.reverse();
        }
        if (operations > 3e5) return null;
      }
    }
    return null;
  }
  function textDiff(beforeValue, afterValue) {
    const before = normalizedText(beforeValue), after = normalizedText(afterValue);
    if (before === after) return [{ value: after, kind: "same" }];
    const tokenize = (value) => value.match(/\s+|[\p{L}\p{N}_]+|[^\s\p{L}\p{N}_]/gu) ?? [];
    const left = tokenize(before), right = tokenize(after);
    let start = 0, suffix = 0;
    while (start < Math.min(left.length, right.length) && left[start] === right[start]) start += 1;
    while (suffix < Math.min(left.length, right.length) - start && left[left.length - 1 - suffix] === right[right.length - 1 - suffix]) suffix += 1;
    const middleLeft = left.slice(start, left.length - suffix), middleRight = right.slice(start, right.length - suffix);
    const middle = middleDiff(middleLeft, middleRight) ?? [
      { value: middleLeft.join(""), kind: "removed" },
      { value: middleRight.join(""), kind: "added" }
    ];
    return mergeParts([
      { value: left.slice(0, start).join(""), kind: "same" },
      ...middle,
      { value: suffix ? left.slice(-suffix).join("") : "", kind: "same" }
    ]);
  }
  return __toCommonJS(collaborator_review_exports);
})();
