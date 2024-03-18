const recadosDiv = document.getElementById('recados');
const btnAnterior = document.getElementById('anterior');
const btnProximo = document.getElementById('proximo');

let paginaAtual = 1;
const limit = 5;

const carregarRecados = async (page) => {

    try {
        const response = await api.get(`messages/paginados?page=${page}&limit=${limit}`);
        const recados = response.data.data;

        recadosDiv.innerHTML = '';
        
        recados.forEach(recado => {
            const novaDiv = document.createElement('div');
            novaDiv.innerHTML = `
                <p>Título: ${recado.title}, Mensagem: ${recado.message}</p>
            `;
            recadosDiv.appendChild(novaDiv);
        });

        paginaAtual = page;

        btnAnterior.disabled = paginaAtual <= 1;
        btnProximo.disabled = paginaAtual >= response.data.totalPaginas;

    } catch (err) {
        recadosDiv.innerHTML= `
            <p>${err.response.data.message}</p>
        `
    }
};

btnAnterior.addEventListener('click', () => {
    if (paginaAtual > 1) {
        carregarRecados(paginaAtual - 1);
    }
});

btnProximo.addEventListener('click', () => {
    carregarRecados(paginaAtual + 1);
});

carregarRecados(paginaAtual);