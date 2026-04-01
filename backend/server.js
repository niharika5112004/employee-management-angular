const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();

app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'employee_db',
  password: '1234',
  port: 5432,
});

pool.connect((err) => {
  if (err) {
    console.log('Database connection failed ❌', err);
  } else {
    console.log('Connected to PostgreSQL ✅');
  }
});


// Login logs table
pool.query(`
  CREATE TABLE IF NOT EXISTS login_logs (
    id SERIAL PRIMARY KEY,
    user_email VARCHAR(255) NOT NULL,
    role VARCHAR(50),
    login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);

// Recent activity table
pool.query(`
  CREATE TABLE IF NOT EXISTS recent_activity (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    action VARCHAR(100),
    time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);



async function logActivity(name, action) {
  try {
    await pool.query(
      'INSERT INTO recent_activity (name, action) VALUES ($1, $2)',
      [name, action]
    );
  } catch (err) {
    console.error('Failed to log activity:', err);
  }
}


app.post('/login', async (req, res) => {
  const { email, role } = req.body;

  try {
    await pool.query(
      'INSERT INTO login_logs (user_email, role) VALUES ($1, $2)',
      [email, role]
    );

    await logActivity(email, `Logged in as ${role}`);

    res.json({ message: 'Login logged successfully' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});



// GET employees
app.get('/employees', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM employees ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Fetch failed' });
  }
});

// COUNT employees
app.get('/employees/count', async (req, res) => {
  try {
    const result = await pool.query('SELECT COUNT(*) FROM employees');
    res.json({ count: parseInt(result.rows[0].count) });
  } catch (err) {
    res.json({ count: 0 });
  }
});

// ADD employee
app.post('/employees', async (req, res) => {
  try {
    const { first_name, last_name, email, phone, department, designation, salary } = req.body;

    const result = await pool.query(
      `INSERT INTO employees 
      (first_name, last_name, email, phone, department, designation, salary)
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      RETURNING *`,
      [first_name, last_name, email, phone, department, designation, salary]
    );

    const emp = result.rows[0];

    await logActivity(`${emp.first_name} ${emp.last_name}`, 'Added Employee');

    res.json(emp);
  } catch (err) {
    res.status(500).json({ error: 'Insert failed' });
  }
});

// UPDATE
app.put('/employees/:id', async (req, res) => {
  const id = req.params.id;
  const { first_name, last_name, email, phone, department, designation, salary } = req.body;

  try {
    const result = await pool.query(
      `UPDATE employees SET 
        first_name=$1, last_name=$2, email=$3, phone=$4, 
        department=$5, designation=$6, salary=$7 
        WHERE id=$8
        RETURNING *`,
      [first_name, last_name, email, phone, department, designation, salary, id]
    );

    const emp = result.rows[0];

    await logActivity(`${emp.first_name} ${emp.last_name}`, 'Updated Employee');

    res.json(emp);
  } catch (err) {
    res.status(500).json({ error: 'Update failed' });
  }
});

// DELETE
app.delete('/employees/:id', async (req, res) => {
  const id = req.params.id;

  try {
    const result = await pool.query(
      'DELETE FROM employees WHERE id=$1 RETURNING *',
      [id]
    );

    const emp = result.rows[0];

    await logActivity(`${emp.first_name} ${emp.last_name}`, 'Deleted Employee');

    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Delete failed' });
  }
});



// Recent Activity
app.get('/recent-activity', async (req, res) => {
  const result = await pool.query(
    'SELECT * FROM recent_activity ORDER BY time DESC LIMIT 10'
  );
  res.json(result.rows);
});

// Login count
app.get('/logins/count', async (req, res) => {
  const result = await pool.query('SELECT COUNT(*) FROM login_logs');
  res.json({ count: parseInt(result.rows[0].count) });
});



app.get('/employees/designation-stats', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT designation, COUNT(*) as count
      FROM employees
      GROUP BY designation
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Designation Stats Error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});


app.get('/employees/department-salaries', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT department, ROUND(AVG(salary), 2) as "avgSalary"
      FROM employees
      GROUP BY department
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Department Salary Error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});


app.listen(3000, () => {
  console.log('Server running on port 3000 🚀');
});

app.get('/employees/growth', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT DATE(created_at) as date, COUNT(*) 
      FROM employees
      GROUP BY DATE(created_at)
      ORDER BY DATE(created_at)
    `);

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching growth data' });
  }
});