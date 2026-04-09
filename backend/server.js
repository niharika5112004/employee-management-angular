const path = require('path');
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();

app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'No token' });

  jwt.verify(token, 'secretkey', (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });

    req.user = user;
    next();
  });
}

function verifyAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin only' });
  }
  next();
}

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'User not found' });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    await pool.query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    );

    await pool.query(
      'INSERT INTO activity_logs(user_id, action, table_name) VALUES($1,$2,$3)',
      [user.id, 'Logged in', 'users']
    );

    const token = jwt.sign(
      { id: user.id, role: user.role },
      'secretkey',
      { expiresIn: '1h' }
    );

    res.json({ token: token, role: user.role });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/register', authenticateToken, verifyAdmin, async (req, res) => {
  const { email, password, role } = req.body;

  try {
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      'INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNING *',
      [email, hashedPassword, role]
    );

    res.json({
      message: 'User registered successfully',
      user: result.rows[0]
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/employees', authenticateToken, async (req, res) => {
  const result = await pool.query('SELECT * FROM employees ORDER BY id');
  res.json(result.rows);
});

app.post('/employees', authenticateToken, verifyAdmin, async (req, res) => {
  const { first_name, last_name, email, phone, department, designation, salary } = req.body;

  const result = await pool.query(
    `INSERT INTO employees 
    (first_name, last_name, email, phone, department, designation, salary)
    VALUES ($1,$2,$3,$4,$5,$6,$7)
    RETURNING *`,
    [first_name, last_name, email, phone, department, designation, salary]
  );

  await pool.query(
    'INSERT INTO activity_logs(user_id, action, table_name, reference_id) VALUES($1,$2,$3,$4)',
    [req.user.id, 'Added Employee', 'employees', result.rows[0].id]
  );

  res.json(result.rows[0]);
});

app.put('/employees/:id', authenticateToken, verifyAdmin, async (req, res) => {
  const id = req.params.id;
  const { first_name, last_name, email, phone, department, designation, salary } = req.body;

  const result = await pool.query(
    `UPDATE employees SET 
      first_name=$1, last_name=$2, email=$3, phone=$4, 
      department=$5, designation=$6, salary=$7 
      WHERE id=$8 RETURNING *`,
    [first_name, last_name, email, phone, department, designation, salary, id]
  );

  await pool.query(
    'INSERT INTO activity_logs(user_id, action, table_name, reference_id) VALUES($1,$2,$3,$4)',
    [req.user.id, 'Updated Employee', 'employees', id]
  );

  res.json(result.rows[0]);
});

app.delete('/employees/:id', authenticateToken, verifyAdmin, async (req, res) => {
  const id = req.params.id;

  await pool.query('DELETE FROM employees WHERE id=$1', [id]);

  await pool.query(
    'INSERT INTO activity_logs(user_id, action, table_name, reference_id) VALUES($1,$2,$3,$4)',
    [req.user.id, 'Deleted Employee', 'employees', id]
  );

  res.json({ message: 'Deleted' });
});

app.get('/employees/count', authenticateToken, async (req, res) => {
  const result = await pool.query('SELECT COUNT(*) FROM employees');
  res.json({ count: parseInt(result.rows[0].count) });
});

app.get('/employees/logins-today', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT COUNT(*) AS count
      FROM activity_logs
      WHERE action = 'Logged in' AND DATE(created_at) = CURRENT_DATE
    `);

    res.json({ count: parseInt(result.rows[0].count) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching logins today' });
  }
});

app.get('/employees/recent-activity', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        u.email AS name,
        al.action,
        al.table_name AS target,
        al.created_at AS time
      FROM activity_logs al
      LEFT JOIN users u ON u.id = al.user_id
      WHERE al.created_at IS NOT NULL
      ORDER BY al.created_at DESC
      LIMIT 5
    `);

    res.json(result.rows.map(r => ({
      name: r.name,
      action: r.action,
      target: r.target,
      time: r.time
    })));
  } catch (err) {
    console.error('Recent activity fetch error:', err);
    res.status(500).json({ message: 'Error fetching recent activity' });
  }
});

app.get('/employees/designation-stats', authenticateToken, async (req, res) => {
  const result = await pool.query(`
    SELECT designation, COUNT(*) as count
    FROM employees
    GROUP BY designation
  `);

  res.json(result.rows);
});

app.get('/employees/department-salaries', authenticateToken, async (req, res) => {
  const result = await pool.query(`
    SELECT department, AVG(salary) as "avgSalary"
    FROM employees
    GROUP BY department
  `);

  res.json(result.rows);
});

app.get('/employees/growth', authenticateToken, async (req, res) => {
  const result = await pool.query(`
    SELECT DATE(created_at) as date, COUNT(*) as count
    FROM employees
    GROUP BY DATE(created_at)
    ORDER BY date
  `);

  res.json(result.rows);
});

// ✅ Serve Angular frontend
app.use(express.static(path.join(__dirname, 'dist/angular-tut/browser')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/angular-tut/browser/index.html'));
});

app.listen(3000, () => {
  console.log('Server running on port 3000 🚀');
});