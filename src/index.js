import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';

// Middleware
import authenticateUser from './middleware/userAuthentication';
import messageExists from './middleware/messageExists';

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

app.listen(port, () => {
    console.log('Servidor rodando! na porta:', port);
})

// Criar nosso "banco de dados"
let id = 1;
let recadoId = 1;

export const usuarios = [];
export const recados = [];

// Criar conta
app.post('/signup', async(req, res) => {
    const data = req.body;
    const name = data.name;
    const email = data.email;
    const password = data.password;

    // Verificar se o usuario ja existe
    const userExist = usuarios.find(user => user.email === email)
    if(userExist) {
        return res.status(400).json({
            success: false,
            message: 'Email Indisponivel!'
        });
    }

    // Criptografando senha
    const hashPassword = await bcrypt.hash(password, 10);

    usuarios.push({
        id: id,
        name: name,
        email: email,
        password: hashPassword
    });

    id++;

    res.status(201).json({
        success: true,
        message: 'Usuário cadastrado com sucesso'
    });
});

// Login
app.post('/login', authenticateUser, async (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Usuario logado com sucesso'
    });
});


// CRUD DE RECADOS

// Crie Recados
app.post('/createMessage', (req, res) => {
    const data = req.body;
    const userEmail = data.userEmail;
    const title = data.title;
    const message = data.message;
    
    const usuario = usuarios.find(user => user.email === userEmail);
    
    if(!usuario) {
        return res.status(400).json({
            success: false,
            message: 'Usuario não foi encontrado'
        });
    }
    
    if(!usuario.recado) {
        usuario.recado = [];
    }

    const novoRecado = {
        id: recadoId,
        title,
        message
    }

    recadoId++;

    recados.push(novoRecado);
    usuario.recado.push(novoRecado);

    res.status(201).json({
        success: true,
        message: 'Recado criado com sucesso!',
        data: novoRecado
    });
});

// Ler recados
app.get('/messages', (req, res) => {
    if(recados.length > 0) {
        return res.status(200).json({
            success: true,
            message: 'Lista de Recados',
            data: recados
        });
    } else {
        return res.status(404).json({
            success: false,
            message: 'Nenhum recado encontrado'
        });
    }

});

// Atualizar recados
app.put('/messages/:id', messageExists, (req, res) => {
    const id = parseInt( req.params.id);
    const data = req.body;
    const title = data.title;
    const message = data.message;

    const indiceRecado = recados.findIndex(recado => recado.id === id);
    
    if(indiceRecado !== -1) {
        recados[indiceRecado].title = title;
        recados[indiceRecado].message = message;

        return res.status(200).json({
            success: true,
            message: 'Recado Alterado'
        });
    }

});

// Deletando recados
app.delete('/messages/:userEmail/:id', messageExists, (req, res) => {
    const id = parseInt(req.params.id);
    const email = req.params.userEmail;
    
    const usuario = usuarios.find(user => user.email === email);
    const indiceRecadoUsuario = usuario.recado.findIndex(recado => recado.id === id);
    
    if(indiceRecadoUsuario !== -1) {
        usuario.recado.splice(indiceRecadoUsuario, 1);
    }

    const indiceRecado = recados.findIndex(recado => recado.id === id);
    recados.splice(indiceRecado, 1);


    res.status(200).json({
        success: true,
        message: 'Recado deletado com sucesso!'
    });
    
});

// MOSTRAR USUARIOS E RECADOS
app.get('/users', (req, res) => {
    if(usuarios.length <= 0) {
        return res.status(404).json({
            success: false,
            message: 'Usuarios não encontrados!'
        });
    }

    res.status(200).json({
        success: true,
        message: 'Lista de Usuarios',
        data: usuarios
    });
})

// PAGINAÇÃO
app.get('/messages/paginados', (req, res) => {
    try {
        if (recados.length === 0) {
            return res.status(400).send({ message: 'A lista de recados está vazia' });
        }

        // const limit = parseInt(request.query.limit)
        // const offset = parseInt(request.query.offset)

        // const itensPorPaginaPositivo = Math.floor(Math.random() * offset)

        // const produtosPaginados = listaProdutos.slice(
        //     itensPorPaginaPositivo,
        //     itensPorPaginaPositivo + limit
        // )

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5; 
    
        const inicio = (page - 1) * limit;
        const fim = page * limit;
    
        const recadosPaginados = recados.slice(inicio, fim); 

        res.status(200).json({
            success: true,
            message: 'Recados retornados com sucesso',
            data: recadosPaginados,
            totalRecados: recados.length,
            paginaAtual: page,
            totalPaginas: Math.ceil(recados.length / limit),
            quantidadePorPagina: limit,
        });

    } catch (error) {
        res.status(500).send({ message: 'Erro interno do Servidor' });
    }
})