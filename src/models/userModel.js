const db = require('../db');

const createUser = async (user) => {
  const { name, email, password, university, course, year } = user;

  const result = await db.query(
    `INSERT INTO users (name, email, password, university, course, year)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, name, email, university`,
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
    'SELECT id, name, email, university, course, year FROM users WHERE id = $1',
    [id]
  );
  return result.rows[0];
};

module.exports = { createUser, findByEmail, findById };