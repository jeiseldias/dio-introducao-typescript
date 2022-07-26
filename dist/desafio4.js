"use strict";
// Um desenvolvedor tentou criar um projeto que consome a base de dados de filme do TMDB para criar um organizador de filmes, mas desistiu 
// pois considerou o seu código inviável. Você consegue usar typescript para organizar esse código e a partir daí aprimorar o que foi feito?
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// A ideia dessa atividade é criar um aplicativo que: 
//    - Busca filmes
//    - Apresenta uma lista com os resultados pesquisados
//    - Permite a criação de listas de filmes e a posterior adição de filmes nela
// Todas as requisições necessárias para as atividades acima já estão prontas, mas a implementação delas ficou pela metade (não vou dar tudo de graça).
// Atenção para o listener do botão login-button que devolve o sessionID do usuário
// É necessário fazer um cadastro no https://www.themoviedb.org/ e seguir a documentação do site para entender como gera uma API key https://developers.themoviedb.org/3/getting-started/introduction
var apiKey;
let requestToken;
let username;
let password;
let sessionId;
let listName;
let listDescription;
let listId;
let movieId;
let loginButton = document.getElementById('login-button');
let searchButton = document.getElementById('search-button');
let searchContainer = document.getElementById('search-container');
let searchList = document.getElementById('search-list');
let listButton = document.getElementById('lista-button');
let listData = document.getElementById('lista-dados');
let loginInput = document.getElementById('login');
let passwordInput = document.getElementById('senha');
let apiInput = document.getElementById('api-key');
let listaNomeInput = document.getElementById('lista-nome');
let listaDescricaoInput = document.getElementById('lista-descricao');
let listaConteudo = document.getElementById('lista-conteudo');
let search = document.getElementById('search');
let lista = document.getElementById("lista");
loginButton.addEventListener('click', () => __awaiter(void 0, void 0, void 0, function* () {
    yield criarRequestToken();
    yield logar();
    yield criarSessao();
}));
searchButton.addEventListener('click', () => __awaiter(void 0, void 0, void 0, function* () {
    let listaDeFilmes = yield procurarFilme(search.value);
    let ul = document.createElement('ul');
    ul.id = "lista";
    for (const item of listaDeFilmes.results) {
        let li = document.createElement('li');
        let button = document.createElement('button');
        button.innerHTML = 'Adiciona a lista';
        button.addEventListener('click', () => { adicionarFilmeNaLista(item.id, listId); });
        li.appendChild(button);
        li.appendChild(document.createTextNode(item.original_title));
        ul.appendChild(li);
    }
    searchList.innerHTML = '';
    searchList.appendChild(ul);
}));
listButton.addEventListener('click', () => __awaiter(void 0, void 0, void 0, function* () {
    criarLista(listName, listDescription);
}));
function preencherSenha() {
    if (passwordInput)
        password = passwordInput.value;
    validateLoginButton();
}
function preencherLogin() {
    if (loginInput)
        username = loginInput.value;
    validateLoginButton();
}
function preencherApi() {
    if (apiInput)
        apiKey = apiInput.value;
    validateLoginButton();
}
function preencherListaNome() {
    if (listaNomeInput)
        listName = listaNomeInput.value;
}
function preencherListaDescricao() {
    if (listaDescricaoInput)
        listDescription = listaDescricaoInput.value;
}
function validateLoginButton() {
    if (password && username && apiKey) {
        loginButton.disabled = false;
        listButton.disabled = false;
    }
    else {
        loginButton.disabled = true;
        listButton.disabled = true;
    }
}
class HttpClient {
    static get({ url, method, body }) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                let request = new XMLHttpRequest();
                request.open(method, url, true);
                request.onload = () => {
                    if (request.status >= 200 && request.status < 300) {
                        resolve(JSON.parse(request.responseText));
                    }
                    else {
                        reject({
                            status: request.status,
                            statusText: request.statusText
                        });
                    }
                };
                request.onerror = () => {
                    reject({
                        status: request.status,
                        statusText: request.statusText
                    });
                };
                if (body) {
                    request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
                    body = JSON.stringify(body);
                }
                request.send(body);
            });
        });
    }
}
function procurarFilme(query) {
    return __awaiter(this, void 0, void 0, function* () {
        query = encodeURI(query);
        let result = yield HttpClient.get({
            url: `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${query}`,
            method: "GET"
        });
        return result;
    });
}
/*async function adicionarFilme(filmeId) {
  let result = await HttpClient.get({
    url: `https://api.themoviedb.org/3/movie/${filmeId}?api_key=${apiKey}&language=en-US`,
    method: "GET"
  })
  console.log(result);
}*/
function criarRequestToken() {
    return __awaiter(this, void 0, void 0, function* () {
        let result = yield HttpClient.get({
            url: `https://api.themoviedb.org/3/authentication/token/new?api_key=${apiKey}`,
            method: "GET",
        });
        requestToken = result.request_token;
    });
}
function logar() {
    return __awaiter(this, void 0, void 0, function* () {
        let result = yield HttpClient.get({
            url: `https://api.themoviedb.org/3/authentication/token/validate_with_login?api_key=${apiKey}`,
            method: "POST",
            body: {
                username: `${username}`,
                password: `${password}`,
                request_token: `${requestToken}`
            }
        });
        requestToken = result.request_token;
        console.log(result.request_token);
    });
}
function criarSessao() {
    return __awaiter(this, void 0, void 0, function* () {
        let result = yield HttpClient.get({
            url: `https://api.themoviedb.org/3/authentication/session/new?api_key=${apiKey}&request_token=${requestToken}`,
            method: "GET"
        });
        sessionId = result.session_id;
    });
}
function criarLista(nomeDaLista, descricao) {
    return __awaiter(this, void 0, void 0, function* () {
        let result = yield HttpClient.get({
            url: `https://api.themoviedb.org/3/list?api_key=${apiKey}&session_id=${sessionId}`,
            method: "POST",
            body: {
                name: nomeDaLista,
                description: descricao,
                language: "pt-br"
            }
        });
        if (result.success) {
            listId = result.list_id;
            listData.innerText = `${nomeDaLista} (${result.list_id})`;
        }
        console.log(result);
    });
}
function adicionarFilmeNaLista(filmeId, listaId) {
    return __awaiter(this, void 0, void 0, function* () {
        let result = yield HttpClient.get({
            url: `https://api.themoviedb.org/3/list/${listaId}/add_item?api_key=${apiKey}&session_id=${sessionId}`,
            method: "POST",
            body: {
                media_id: filmeId
            }
        });
        pegarLista();
    });
}
function pegarLista() {
    return __awaiter(this, void 0, void 0, function* () {
        let result = yield HttpClient.get({
            url: `https://api.themoviedb.org/3/list/${listId}?api_key=${apiKey}`,
            method: "GET"
        });
        listName = result.name;
        listDescription = result.description;
        let ul = document.createElement('ul');
        for (const item of result.items) {
            let li = document.createElement('li');
            li.appendChild(document.createTextNode(item.original_title));
            ul.appendChild(li);
        }
        listaConteudo.innerHTML = '';
        listaConteudo.appendChild(ul);
    });
}
