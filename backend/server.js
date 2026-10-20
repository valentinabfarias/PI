const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const app = express();
const PORT = process.env.PORT || 3000;
const projectRoot = path.join(__dirname, "..");
const journeyPath = path.join(projectRoot, "PI/data/journey.json");
const pdfDir = path.join(projectRoot, "PI/uploads/pdfs");
const ADMIN_KEY = process.env.ADMIN_KEY || "pi-admin-dev";

fs.mkdirSync(pdfDir, { recursive: true });

function readJourney() {
    return JSON.parse(fs.readFileSync(journeyPath, "utf8"));
}

function writeJourney(data) {
    fs.writeFileSync(journeyPath, JSON.stringify(data, null, 2), "utf8");
}

function requireAdmin(req, res, next) {
    if (req.headers["x-admin-key"] !== ADMIN_KEY) {
        return res.status(403).json({ error: "Chave de administrador inválida." });
    }
    next();
}

const pdfUpload = multer({
    storage: multer.diskStorage({
        destination: pdfDir,
        filename: (req, file, cb) => {
            cb(null, `${req.params.stageId}.pdf`);
        },
    }),
    limits: { fileSize: 25 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === "application/pdf") {
            cb(null, true);
        } else {
            cb(new Error("Apenas arquivos PDF são permitidos."));
        }
    },
});

app.use(cors());
app.use(express.json());

const dbConfig = {
    host: process.env.DB_HOST || "127.0.0.1",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "cadastro_formulario",
    waitForConnections: true,
    connectionLimit: 10,
};

let pool;
try {
    pool = mysql.createPool(dbConfig);
} catch (error) {
    console.warn("Pool MySQL não inicializado:", error.message);
}

app.use(express.static(projectRoot));

app.get("/", (req, res) => {
    res.sendFile(path.join(projectRoot, "index.html"));
});

app.get("/api/health", (req, res) => {
    res.json({ ok: true, staticRoot: projectRoot });
});

app.get("/api/journey", (req, res) => {
    try {
        res.json(readJourney());
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post(
    "/api/journey/stages/:stageId/pdf",
    requireAdmin,
    pdfUpload.single("pdf"),
    (req, res) => {
        try {
            const { stageId } = req.params;
            const journey = readJourney();
            const stage = journey.stages.find((s) => s.id === stageId);
            if (!stage) {
                return res.status(404).json({ error: "Etapa não encontrada." });
            }
            if (!req.file) {
                return res.status(400).json({ error: "Nenhum PDF enviado." });
            }
            stage.pdfPath = `uploads/pdfs/${stageId}.pdf`;
            writeJourney(journey);
            res.json({ ok: true, pdfPath: stage.pdfPath });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
);

app.get("/api/formulario", async (req, res) => {
    if (!pool) {
        return res.status(503).json({ error: "Banco de dados não configurado" });
    }
    try {
        const { search, senha } = req.query;
        let sql = "SELECT * FROM formulario";
        const params = [];
        const conditions = [];

        if (search) {
            conditions.push("(nome LIKE ? OR email LIKE ?)");
            params.push(`%${search}%`, `%${search}%`);
        }

        if (senha) {
            conditions.push("senha = ?");
            params.push(senha);
        }

        if (conditions.length > 0) {
            sql += " WHERE " + conditions.join(" AND ");
        }

        sql += " ORDER BY dataHora DESC";

        const [rows] = await pool.execute(sql, params);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post("/api/formulario", async (req, res) => {
    if (!pool) {
        return res.status(503).json({ error: "Banco de dados não configurado" });
    }
    try {
        const { nome, email, senha } = req.body;

        if (!nome || !email) {
            return res
                .status(400)
                .json({ error: "Nome e e-mail são obrigatórios" });
        }

        const sql = `INSERT INTO formulario (nome, email, senha ) 
                    VALUES (?, ?, ? )`;

        const [result] = await pool.execute(sql, [
            nome,
            email,
            senha
        ]);

        res.status(201).json({
            message: "Cadastro criado com sucesso!",
            id: result.insertId,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put("/api/formulario/:id", async (req, res) => {
    if (!pool) {
        return res.status(503).json({ error: "Banco de dados não configurado" });
    }
    try {
        const { id } = req.params;
        const { nome, email, senha } = req.body;

        const sql = `UPDATE formulario SET nome=?, email=?, senha=? WHERE id=?`;

        const [result] = await pool.execute(sql, [nome, email, senha]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Cadastro não encontrado" });
        }

        res.json({ message: "Cadastro atualizado com sucesso!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete("/api/formulario/:id", async (req, res) => {
    if (!pool) {
        return res.status(503).json({ error: "Banco de dados não configurado" });
    }
    try {
        const { id } = req.params;
        const [result] = await pool.execute(
            "DELETE FROM formulario WHERE id = ?",
            [id],
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Cadastro não encontrado" });
        }

        res.json({ message: "Cadastro excluído com sucesso!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor em http://localhost:${PORT}`);
    console.log(`Site estático: http://localhost:${PORT}/PI/pages/map.html`);
    console.log(`API: http://localhost:${PORT}/api/formulario`);
});
