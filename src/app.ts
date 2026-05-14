import express, { Request, Response } from "express";
import { Produto } from "./produto";
import { Fabricante } from "./fabricante";
import { Endereco } from "./endereco";

const app = express();
const PORT = process.env.PORT ?? 3000;
app.use(express.json());

let produtos: Produto[] = [];

// 1. Cadastrar Produto (POST) - [cite: 102]
function criarProduto(req: Request, res: Response): void {
    try {
        const data = req.body;

        // Validações (Desafio Extra) - [cite: 144, 146, 147, 148]
        if (!data.id || !data.nome || !data.preco || !data.fabricante) throw new Error("Dados incompletos.");
        if (data.preco <= 0) throw new Error("O preço deve ser maior que zero.");
        if (produtos.some(p => p.id === data.id)) throw new Error("ID duplicado.");
        if (!data.fabricante.nome || !data.fabricante.endereco?.cidade || !data.fabricante.endereco?.pais) {
            throw new Error("Fabricante e endereço devem estar completos.");
        }

        const endereco = new Endereco(data.fabricante.endereco.cidade, data.fabricante.endereco.pais);
        const fabricante = new Fabricante(data.fabricante.nome, endereco);
        const produto = new Produto(data.id, data.nome, data.preco, fabricante);

        produtos.push(produto); // [cite: 104, 105]
        res.status(200).json(produto); // 

    } catch (e: unknown) {
        res.status(400).json({ Message: (e as Error).message }); // 
    }
}

// 2. Listar Todos (GET) - [cite: 106, 108]
function listarProdutos(req: Request, res: Response): void {
    res.status(200).json(produtos);
}

// 3. Buscar por ID (GET) - [cite: 114, 115, 116]
function filtraProdutoPorID(req: Request, res: Response): void {
    const id = Number(req.params.id);
    const produto = produtos.find(p => p.id === id);

    if (!produto) {
        res.status(404).json({ Message: "Produto não encontrado" }); // [cite: 118, 136]
        return;
    }
    res.status(200).json(produto);
}

// 4. Atualizar Produto (PUT) - [cite: 119, 120]
function atualizarProduto(req: Request, res: Response): void {
    const id = Number(req.params.id);
    const index = produtos.findIndex(p => p.id === id);

    if (index === -1) {
        res.status(404).json({ Message: "Produto não encontrado" });
        return;
    }

    const data = req.body;
    // Atualiza mantendo a estrutura de classes
    const end = new Endereco(data.fabricante.endereco.cidade, data.fabricante.endereco.pais);
    const fab = new Fabricante(data.fabricante.nome, end);
    
    produtos[index] = new Produto(id, data.nome, data.preco, fab);
    res.status(200).json(produtos[index]);
}

// 5. Remover Produto (DELETE) - [cite: 125, 126]
function removerProduto(req: Request, res: Response): void {
    const id = Number(req.params.id);
    const index = produtos.findIndex(p => p.id === id);

    if (index === -1) {
        res.status(404).json({ Message: "Produto não encontrado" });
        return;
    }

    produtos.splice(index, 1);
    res.status(200).json({ Message: "Produto removido com sucesso" });
}

// Rotas
app.post('/api/produto', criarProduto);
app.get('/api/produto', listarProdutos);
app.get('/api/produto/:id', filtraProdutoPorID);
app.put('/api/produto/:id', atualizarProduto);
app.delete('/api/produto/:id', removerProduto);

app.listen(PORT, () => console.log(`API rodando em http://localhost:${PORT}`));

console.log("TypeScript executado com sucesso!");
