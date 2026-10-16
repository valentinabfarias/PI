const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const dbConfig = {
    host: "127.0.0.1",
    user: "root",
    password: "",
    database: "cadastro_formulario",
    waitForConnections: true,
    connectionLimit: 10,
};

const pool = mysql.createPool(dbConfig);

const path = require("path");

app.use(express.static(path.join(__dirname, "../public")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../forms.html"));
});

// GET /api/produtos - Listar produtos (com busca e filtro)
app.get("/api/produtos", async (req, res) => {
    try {
        const { search, senha } = req.query;
        let sql = "SELECT * FROM formulario";
        let params = [];
        let conditions = [];

        if (search) {
            conditions.push("(nome LIKE ? OR descricao LIKE ?)");
            params.push(`%${search}%`, `%${search}%`);
        }

        if (senha) {
            conditions.push("senha = ?");
            params.push(categoria);
        }

        if (conditions.length > 0) {
            sql += " WHERE " + conditions.join(" AND ");
        }

        sql += " ORDER BY data_cadastro DESC";

        const [rows] = await pool.execute(sql, params);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/produtos - Criar produto
app.post("/api/produtos", async (req, res) => {
    try {
        const { nome, descricao, preco, estoque, categoria, imagem_url } =
            req.body;

        if (!nome || !preco) {
            return res
                .status(400)
                .json({ error: "Nome e senha são obrigatórios" });
        }

        const sql = `INSERT INTO produtos (nome, email, senha, dataHora) 
                    VALUES (?, ?, ?, ?)`;

        const [result] = await pool.execute(sql, [
            nome,
            descricao || null,
            preco,
            estoque || 0,
            categoria || null,
            imagem_url || null,
        ]);

        res.status(201).json({
            message: "Login criado com sucesso!",
            id: result.insertId,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT /api/produtos/:id - Atualizar produto
app.put("/api/produtos/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, descricao, email, senha, dataHora, } =
            req.body;

        const sql = `UPDATE produtos SET nome=?, descricao=?, preco=?, estoque=?, categoria=?, imagem_url=? WHERE id=?`;

        const [result] = await pool.execute(sql, [
            nome,
            email,
            senha,
            dataHora,
            id,
        ]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Login não encontrado" });
        }

        res.json({ message: "Cadastro atualizado com sucesso!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE /api/produtos/:id
app.delete("/api/produtos/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await pool.execute(
            "DELETE FROM produtos WHERE id = ?",
            [id],
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Login não encontrado" });
        }

        res.json({ message: "Conta excluída com sucesso!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`🛒 TechLoja Backend rodando em http://localhost:${PORT}`);
    console.log(`📦 API de produtos: http://localhost:${PORT}/api/produtos`);
});
 