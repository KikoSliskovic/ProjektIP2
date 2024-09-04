const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json());
app.use(cors());

// Open the database
const db = new sqlite3.Database('./database.db');

// Create tables if they don't exist
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      sku TEXT NOT NULL UNIQUE,
      variant TEXT,
      price REAL NOT NULL,
      status TEXT,
      saved INTEGER DEFAULT 0,  -- 0 for FALSE, 1 for TRUE
      deleted INTEGER DEFAULT 0  -- 0 for FALSE, 1 for TRUE
    )
  `);
});

// POST endpoint to insert a new product
app.post('/api/products', (req, res) => {
  const { name, category, sku, variant, price, status } = req.body;

  // Check if all required fields are provided
  if (!name || !category || !sku || price == null) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const sql = `
    INSERT INTO products (name, category, sku, variant, price, status, saved, deleted)
    VALUES (?, ?, ?, ?, ?, ?, 0, 0)  -- default values for saved and deleted
  `;
  const params = [name, category, sku, variant, price, status];

  db.run(sql, params, function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ id: this.lastID, ...req.body });
  });
});

// GET endpoint to fetch all products
app.get('/api/products', (req, res) => {
  db.all('SELECT * FROM products WHERE deleted = 0', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// GET endpoint to fetch all saved products
app.get('/api/saved-products', (req, res) => {
  db.all('SELECT * FROM products WHERE saved = 1 AND deleted = 0', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// POST endpoint to save a product (mark as saved)
app.post('/api/products/:id/save', (req, res) => {
  const id = req.params.id;
  const sql = `UPDATE products SET saved = 1 WHERE id = ?`;

  db.run(sql, id, function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json({ message: 'Product marked as saved successfully' });
  });
});

// POST endpoint to unsave a product (remove from saved)
app.delete('/api/products/:id/unsave', (req, res) => {
  const id = req.params.id;
  const sql = `UPDATE products SET saved = 0 WHERE id = ?`;

  db.run(sql, id, function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json({ message: 'Product removed from saved successfully' });
  });
});

// DELETE endpoint to move product to trash (mark as deleted)
app.delete('/api/products/:id', (req, res) => {
  const id = req.params.id;

  const sql = `UPDATE products SET deleted = 1, saved = 0 WHERE id = ?`;

  db.run(sql, id, function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.status(200).json({ message: 'Product moved to trash successfully' });
  });
});

// DELETE endpoint to delete product permanently from trash
app.delete('/api/trash/:id', (req, res) => {
  const id = req.params.id;

  const sql = `DELETE FROM products WHERE id = ? AND deleted = 1`;

  db.run(sql, id, function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Product not found in trash' });
    }
    res.status(200).json({ message: 'Product deleted permanently' });
  });
});

// GET endpoint to fetch all trashed products
app.get('/api/trash', (req, res) => {
  db.all('SELECT * FROM products WHERE deleted = 1', (err, rows) => {
    if (err) {
      console.error('Error executing SQL query:', err.message); // Log error
      return res.status(500).json({ error: 'Error fetching trashed products: ' + err.message });
    }
    console.log('Fetched trashed products:', rows); // Log results
    res.json(rows);
  });
});

// PUT endpoint to update a product
app.put('/api/products/:id', (req, res) => {
  const id = req.params.id;
  const { name, category, sku, variant, price, status } = req.body;

  // Check if all required fields are provided
  if (!name || !category || !sku || price == null) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const sql = `
    UPDATE products
    SET name = ?, category = ?, sku = ?, variant = ?, price = ?, status = ?
    WHERE id = ?
  `;
  const params = [name, category, sku, variant, price, status, id];

  db.run(sql, params, function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.status(200).json({ id, name, category, sku, variant, price, status });
  });
});


// Close the database when the server stops
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('Error closing the database:', err.message);
    } else {
      console.log('Database closed.');
    }
    process.exit(0);
  });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
