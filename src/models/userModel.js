const db = require('../db');

const createUser = async (user) => {
  const {
    name,
    email,
    password,
    university,
    course,
    year,
    googleId = null,
    authProvider = 'local',
  } = user;

  const result = await db.query(
    `INSERT INTO users (name, email, password, university, course, year, google_id, auth_provider)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id, name, email, university, course, year, role, is_active, created_at, updated_at, auth_provider, google_id`,
    [name, email, password || null, university, course || null, year || null, googleId, authProvider]
  );

  return result.rows[0];
};

const findByEmail = async (email) => {
  const result = await db.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );
  return result.rows[0];
};

const findById = async (id) => {
  const result = await db.query(
    `SELECT id, name, email, university, course, year, role, is_active, created_at, updated_at, auth_provider, google_id
     FROM users
     WHERE id = $1`,
    [id]
  );
  return result.rows[0];
};

const findByGoogleId = async (googleId) => {
  const result = await db.query(
    'SELECT * FROM users WHERE google_id = $1',
    [googleId]
  );

  return result.rows[0];
};

const updateGoogleAccount = async (id, googleId) => {
  const result = await db.query(
    `UPDATE users
     SET google_id = $2, auth_provider = 'google', updated_at = NOW()
     WHERE id = $1
     RETURNING id, name, email, university, course, year, role, is_active, created_at, updated_at, auth_provider, google_id`,
    [id, googleId]
  );

  return result.rows[0];
};

const findOrCreateGoogleUser = async ({ googleId, email, name, university }) => {
  const linkedUser = await findByGoogleId(googleId);
  if (linkedUser) {
    return linkedUser;
  }

  const existingUser = await findByEmail(email);
  if (existingUser) {
    return updateGoogleAccount(existingUser.id, googleId);
  }

  return createUser({
    name,
    email,
    password: null,
    university,
    googleId,
    authProvider: 'google',
  });
};

const searchUsers = async (filters = {}) => {
  const { university, course } = filters;
  const result = await db.query(
    `SELECT id, name, email, university, course, year, role, is_active, created_at, updated_at, auth_provider, google_id
     FROM users
     WHERE ($1::text IS NULL OR university ILIKE '%' || $1 || '%')
       AND ($2::text IS NULL OR course ILIKE '%' || $2 || '%')
     ORDER BY created_at DESC`,
    [university || null, course || null]
  );

  return result.rows;
};

const updateUser = async (id, fields) => {
  const entries = Object.entries(fields).filter(([, value]) => value !== undefined);

  if (entries.length === 0) {
    return findById(id);
  }

  const setClauses = entries.map(([key], index) => `${key} = $${index + 2}`);
  const values = entries.map(([, value]) => value);

  const result = await db.query(
    `UPDATE users
     SET ${setClauses.join(', ')}, updated_at = NOW()
     WHERE id = $1
     RETURNING id, name, email, university, course, year, role, is_active, created_at, updated_at, auth_provider, google_id`,
    [id, ...values]
  );

  return result.rows[0];
};

const getSavedSearches = async (userId) => {
  const result = await db.query(
    `SELECT id, user_id, module_code, keyword, created_at
     FROM saved_searches
     WHERE user_id = $1
     ORDER BY created_at DESC`,
    [userId]
  );

  return result.rows;
};

const createSavedSearch = async (userId, moduleCode, keyword) => {
  const result = await db.query(
    `INSERT INTO saved_searches (user_id, module_code, keyword)
     VALUES ($1, $2, $3)
     RETURNING id, user_id, module_code, keyword, created_at`,
    [userId, moduleCode || null, keyword || null]
  );

  return result.rows[0];
};

module.exports = {
  createUser,
  findByEmail,
  findById,
  findByGoogleId,
  findOrCreateGoogleUser,
  searchUsers,
  updateUser,
  getSavedSearches,
  createSavedSearch,
};
