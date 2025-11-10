'use strict'

import { lerContatos, criarContato, deleteContato } from './contatos.js' 

const main = document.querySelector('main')
const container = document.getElementById('container')
const btnNovoContato = document.getElementById('novo-contato')
const btnCancelar = document.getElementById('cancelar')
const btnSalvar = document.getElementById('salvar')
const form = document.querySelector('form')

const input_nome = document.getElementById('nome')
const input_email = document.getElementById('email')
const input_celular = document.getElementById('celular')
const input_endereco = document.getElementById('endereco')
const input_cidade = document.getElementById('cidade')
const input_foto = document.getElementById('foto')
const previewImage = document.getElementById('preview-image')

const alternarVisualizacao = (mostrarCards) => {
    main.classList.toggle('card-show', mostrarCards)
    main.classList.toggle('form-show', !mostrarCards)
}

const criarCardContato = ({ id, nome, celular, foto }) => {
    const card = document.createElement('div')
    card.classList.add('card-contato')
    // Adiciona o ID e o nome para uso no delete
    card.dataset.id = id 
    card.dataset.nome = nome 

    card.innerHTML = `
        <img src="${foto || './img/preview-icon.png'}" alt="Foto de ${nome}">
        <span class="card-nome">${nome}</span>
        <span class="card-celular">${celular}</span>
        <button class="btn-deletar" data-id="${id}" data-nome="${nome}">🗑️ Deletar</button>
    `
    container.appendChild(card)
}

const mostrarPreview = (event) => {
    const [file] = event.target.files
    if (file) {
        previewImage.src = URL.createObjectURL(file)
    }
}

const limparInputs = () => {
    form.reset() 
    previewImage.src = './img/preview-icon.png'
}

//carregar os contatos 
const carregarContatos = async () => {
    container.innerHTML = 'Carregando contatos...' 
    
    try {
        const contatos = await lerContatos()

        container.innerHTML = contatos.length === 0 
            ? '<p>Nenhum contato encontrado. Tente de novo, bro.</p>'
            : '' 
        
        // Assumindo que cada contato tem um 'id'
        contatos.forEach(criarCardContato)
        alternarVisualizacao(true)

    } catch (error) {
        console.error('Erro de conexão:', error)
        container.innerHTML = '<p style="color: red;">Vish, deu ruim pra carregar os dados!</p>'
    }
}

//função inserir
const inserirContatos = async () => {
    const novoContato = {
        nome: input_nome.value,
        email: input_email.value,
        celular: input_celular.value,
        endereco: input_endereco.value,
        cidade: input_cidade.value,
        foto: previewImage.src
    }

    container.innerHTML = 'Adicionando Contatos...'

    try {
        const sucesso = await criarContato(novoContato) 
        
        if (!sucesso) {
             throw new Error('Falha na resposta da API.')
        }
        
        alert(`Contato '${novoContato.nome}' salvo com sucesso na API!`)

        limparInputs() 
        await carregarContatos()
        
    } catch (error) {
        console.error('Erro ao inserir:', error)
        alert('Falha ao salvar o contato. Verifique a API. Tente outra vez.')
        await carregarContatos()
    }
}

//função Deletar
const handleDelete = async (id, nome) => {
    if (!confirm(`Tem certeza que deseja deletar o contato de ${nome}?`)) {
        return
    }

    container.innerHTML = `Deletando contato de ${nome}...`
    
    try {
        const sucesso = await deleteContato(id) 

        if (!sucesso) {
            throw new Error('Falha ao deletar na API.')
        }

        alert(`Contato de ${nome} deletado com sucesso!`)
        await carregarContatos() 
        
    } catch (error) {
        console.error('Erro ao deletar:', error)
        alert('Deu ruim! Não foi possível deletar o contato.')
        await carregarContatos() 
    }
}


carregarContatos()
btnNovoContato.addEventListener('click', () => {
    limparInputs()
    alternarVisualizacao(false)
})

btnCancelar.addEventListener('click', () => alternarVisualizacao(true))
btnSalvar.addEventListener('click', inserirContatos)

input_foto.addEventListener('change', mostrarPreview)

container.addEventListener('click', (e) => {
    const btnDeletar = e.target.closest('.btn-deletar')

    if (btnDeletar) {
        const id = btnDeletar.dataset.id
        const nome = btnDeletar.dataset.nome
        handleDelete(id, nome)
    }
})