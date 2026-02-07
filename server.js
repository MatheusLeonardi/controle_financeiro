const path = require("path");
const express = require("express");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = process.env.DB_PATH || path.join(__dirname, "data", "finance.db");

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const db = new sqlite3.Database(DB_PATH);

const initSchema = () => {
  db.serialize(() => {
    db.run(
      `CREATE TABLE IF NOT EXISTS entries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        month TEXT NOT NULL,
        type TEXT NOT NULL,
        description TEXT NOT NULL,
        amount REAL NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      )`
    );
  });
};

initSchema();

app.get("/api/entries", (req, res) => {
  const month = req.query.month;

  if (!month) {
    return res.status(400).json({ error: "Informe o mês no formato YYYY-MM." });
  }

  db.all(
    "SELECT id, month, type, description, amount, created_at FROM entries WHERE month = ? ORDER BY created_at DESC",
    [month],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: "Erro ao buscar lançamentos." });
      }

      return res.json(rows);
    }
  );
});

app.post("/api/entries", (req, res) => {
  const { month, type, description, amount } = req.body;

  if (!month || !type || !description || typeof amount !== "number") {
    return res.status(400).json({ error: "Preencha mês, tipo, descrição e valor." });
  }

  const normalizedType = type.toLowerCase();
  if (!['receita', 'gasto'].includes(normalizedType)) {
    return res.status(400).json({ error: "Tipo deve ser receita ou gasto." });
  }

  db.run(
    "INSERT INTO entries (month, type, description, amount) VALUES (?, ?, ?, ?)",
    [month, normalizedType, description, amount],
    function insertCallback(err) {
      if (err) {
        return res.status(500).json({ error: "Erro ao salvar lançamento." });
      }

      return res.status(201).json({
        id: this.lastID,
        month,
        type: normalizedType,
        description,
        amount
      });
    }
  );
});

app.get("/api/summary", (req, res) => {
  const month = req.query.month;

  if (!month) {
    return res.status(400).json({ error: "Informe o mês no formato YYYY-MM." });
  }

  db.all(
    `SELECT type, SUM(amount) as total
     FROM entries
     WHERE month = ?
     GROUP BY type`,
    [month],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: "Erro ao calcular resumo." });
      }

      const summary = rows.reduce(
        (acc, row) => {
          acc[row.type] = row.total;
          return acc;
        },
        { receita: 0, gasto: 0 }
      );

      const saldo = summary.receita - summary.gasto;
      return res.json({ ...summary, saldo });
    }
  );
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
