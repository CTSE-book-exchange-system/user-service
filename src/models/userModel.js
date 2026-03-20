const db = require('../db');

const createUser = async (user) => {
  const { name, email, password, university, course, year } = user;

  const result = await db.query(
    `INSERT INTO users (name, email, password, university, course, year)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, name, email, university, course, year, role, is_active, created_at, updated_at`,
    [name, email, password, university, course, year]
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
    `SELECT id, name, email, university, course, year, role, is_active, created_at, updated_at
     FROM users
     WHERE id = $1`,
    [id]
  );
  return result.rows[0];
};

const searchUsers = async (filters = {}) => {
  const { university, course } = filters;
  const result = await db.query(
    `SELECT id, name, email, university, course, year, role, is_active, created_at, updated_at
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
     RETURNING id, name, email, university, course, year, role, is_active, created_at, updated_at`,
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
  searchUsers,
  updateUser,
  getSavedSearches,
  createSavedSearch,
};
