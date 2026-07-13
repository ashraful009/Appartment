const crypto = require("crypto");

const JSON_DEFAULTS = {
  address: { present: "", permanent: "" },
  roles: ["user"],
  social_links: { linkedin: "", facebook: "", whatsapp: "" },
  expertise: [],
  extra_images: [],
  extra_image_public_ids: [],
  map_location: { lat: null, lng: null },
  apartment_sizes: [],
  specs: {},
  financials: {},
  installments: [],
  payment_details: {},
  audit: { accountant: {}, dataEntry: {}, management: {} },
  client_preferences: {},
  value: null,
  progress_images: [],
  progress_image_public_ids: [],
  propertyProgressImages: [],
  action_by_roles: [],
};

const JSON_COLUMNS = new Set(Object.keys(JSON_DEFAULTS));

const generateId = () => crypto.randomUUID();

const isPlainObject = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value) && !(value instanceof Date);

const cloneDefault = (value) => {
  if (Array.isArray(value)) return [...value];
  if (isPlainObject(value)) return { ...value };
  return value;
};

const parseJsonField = (key, value) => {
  if (!JSON_COLUMNS.has(key)) return value;
  if (value === undefined) return value;
  if (value === null || value === "") return cloneDefault(JSON_DEFAULTS[key]);
  if (typeof value !== "string") return value;

  try {
    return JSON.parse(value);
  } catch (_) {
    return value;
  }
};

const normalizeDbRow = (row) => {
  if (!isPlainObject(row)) return row;
  for (const key of Object.keys(row)) {
    row[key] = parseJsonField(key, row[key]);
  }
  return row;
};

const normalizeDbResponse = (result) => {
  if (Array.isArray(result)) return result.map(normalizeDbRow);
  return normalizeDbRow(result);
};

const stringifyJsonFields = (data) => {
  if (Array.isArray(data)) return data.map(stringifyJsonFields);
  if (!isPlainObject(data)) return data;

  const next = { ...data };
  for (const key of Object.keys(next)) {
    if (!JSON_COLUMNS.has(key)) continue;
    const value = next[key];
    if (value === undefined || value === null || typeof value === "string") continue;
    next[key] = JSON.stringify(value);
  }
  return next;
};

const withGeneratedIds = (records) => {
  const rows = Array.isArray(records) ? records : [records];
  const prepared = rows.map((record) => ({
    id: record.id || generateId(),
    ...record,
  }));
  return Array.isArray(records) ? prepared : prepared[0];
};

const whereJsonArrayContains = (query, column, value) =>
  query.whereRaw("JSON_CONTAINS(COALESCE(??, JSON_ARRAY()), JSON_QUOTE(?))", [column, value]);

const isDuplicateKeyError = (error) =>
  error?.code === "ER_DUP_ENTRY" || error?.errno === 1062 || error?.code === "23505";

const pick = (row, ...keys) => {
  for (const key of keys) {
    if (row && row[key] !== undefined) return row[key];
  }
  return undefined;
};

module.exports = {
  generateId,
  isDuplicateKeyError,
  normalizeDbResponse,
  pick,
  stringifyJsonFields,
  whereJsonArrayContains,
  withGeneratedIds,
};
