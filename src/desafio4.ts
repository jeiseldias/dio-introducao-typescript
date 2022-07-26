// Um desenvolvedor tentou criar um projeto que consome a base de dados de filme do TMDB para criar um organizador de filmes, mas desistiu 
// pois considerou o seu código inviável. Você consegue usar typescript para organizar esse código e a partir daí aprimorar o que foi feito?

// A ideia dessa atividade é criar um aplicativo que: 
//    - Busca filmes
//    - Apresenta uma lista com os resultados pesquisados
//    - Permite a criação de listas de filmes e a posterior adição de filmes nela

// Todas as requisições necessárias para as atividades acima já estão prontas, mas a implementação delas ficou pela metade (não vou dar tudo de graça).
// Atenção para o listener do botão login-button que devolve o sessionID do usuário
// É necessário fazer um cadastro no https://www.themoviedb.org/ e seguir a documentação do site para entender como gera uma API key https://developers.themoviedb.org/3/getting-started/introduction

var apiKey:string;
let requestToken: string;
let username: string;
let password: string;
let sessionId: string;
let listName: string;
let listDescription: string;
let listId: number;
let movieId: number;

let loginButton = document.getElementById('login-button') as HTMLButtonElement;
let searchButton = document.getElementById('search-button') as HTMLButtonElement;
let searchContainer = document.getElementById('search-container') as HTMLDivElement;
let searchList = document.getElementById('search-list') as HTMLDivElement;
let listButton = document.getElementById('lista-button') as HTMLButtonElement;
let listData = document.getElementById('lista-dados') as HTMLSpanElement;

let loginInput = document.getElementById('login') as HTMLInputElement;
let passwordInput = document.getElementById('senha') as HTMLInputElement;
let apiInput = document.getElementById('api-key') as HTMLInputElement;
let listaNomeInput = document.getElementById('lista-nome') as HTMLInputElement;
let listaDescricaoInput = document.getElementById('lista-descricao') as HTMLInputElement;
let listaConteudo = document.getElementById('lista-conteudo') as HTMLDivElement;

let search = document.getElementById('search') as HTMLInputElement;
let lista = document.getElementById("lista");

interface RequestHTTP {
    url: string,
    method: string,
    body?: object | string,
}

interface ResponseCreateList {
    status_message: string,
    success: boolean,
    status_code: number,
    list_id: number,
}

interface ResponseGetList {
    created_by: string,
    description: string,
    favorite_count: number,
    id: string,
    items: [Movies],
    item_count: number,
    iso_639_1: string,
    name: string,
    poster_path: string | null,
}

interface ResponseAddMovieList {
    status_code: number,
    status_message: string,
}

interface ResponseMovies {
    page: number,
    results: [Movies],
    total_results: number,
    total_pages: number,
}

interface Movies {
    poster_path: string | null,
    adult: boolean,
    overview: string,
    release_data: string,
    genre_ids: [],
    id: number,
    original_title: string,
    original_language: string,
    title: string,
    backdrop_path: string | null,
    popularity: number,
    vote_count: BigInteger,
    video: boolean,
    vote_average: number,
}

interface ResponseSession {
    success: boolean,
    session_id: string,
}

interface ResponseToken {
    success: boolean,
    expires_at: string,
    request_token: string,
}

interface DataLogin {
    username: boolean,
    password: string,
    request_token: string,
}

loginButton.addEventListener('click', async () => {
    await criarRequestToken();
    await logar();
    await criarSessao();
});

searchButton.addEventListener('click', async () => {
    let listaDeFilmes = await procurarFilme(search.value);
    let ul = document.createElement('ul');

    ul.id = "lista"
    
    for (const item of listaDeFilmes.results) {
        let li = document.createElement('li');
        let button = document.createElement('button');

        button.innerHTML = 'Adiciona a lista';
        button.addEventListener('click', () => {adicionarFilmeNaLista(item.id, listId)});
        li.appendChild(button);
        li.appendChild(document.createTextNode(item.original_title))
        ul.appendChild(li)
    }

    searchList.innerHTML = '';
    searchList.appendChild(ul);
});

listButton.addEventListener('click', async () => {
    criarLista(listName, listDescription);
});

function preencherSenha() {
    if(passwordInput)
        password = passwordInput.value;
    
    validateLoginButton();
}

function preencherLogin() {
    if(loginInput)
        username =  loginInput.value;
    
    validateLoginButton();
}

function preencherApi() {
    if(apiInput)
        apiKey = apiInput.value;
  
    validateLoginButton();
}

function preencherListaNome() {
    if(listaNomeInput)
        listName = listaNomeInput.value;
}

function preencherListaDescricao() {
    if(listaDescricaoInput)
        listDescription = listaDescricaoInput.value;
}

function validateLoginButton() {
    if (password && username && apiKey) {
        loginButton.disabled = false;
        listButton.disabled = false;
    } else {
        loginButton.disabled = true;
        listButton.disabled = true;
    }
}

class HttpClient {
    static async get({url, method, body}: RequestHTTP) {
        return new Promise((resolve, reject) => {
            let request = new XMLHttpRequest();
            request.open(method, url, true);

            request.onload = () => {
                if (request.status >= 200 && request.status < 300) {
                    resolve(JSON.parse(request.responseText));
                } else {
                    reject({
                        status: request.status,
                        statusText: request.statusText
                    })
                }
            }

            request.onerror = () => {
                reject({
                    status: request.status,
                    statusText: request.statusText
                })
            }

            if (body) {
                request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
                body = JSON.stringify(body);
            }
            
            request.send(body);
        })
    }
}

async function procurarFilme(query: string) {
    query = encodeURI(query)

    let result = await HttpClient.get({
        url: `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${query}`,
        method: "GET"
    }) as ResponseMovies;
  
    return result
}

/*async function adicionarFilme(filmeId) {
  let result = await HttpClient.get({
    url: `https://api.themoviedb.org/3/movie/${filmeId}?api_key=${apiKey}&language=en-US`,
    method: "GET"
  })
  console.log(result);
}*/

async function criarRequestToken () {
    let result = await HttpClient.get({
        url: `https://api.themoviedb.org/3/authentication/token/new?api_key=${apiKey}`,
        method: "GET",
    }) as ResponseToken;

    requestToken = result.request_token;
}

async function logar() {
    let result = await HttpClient.get({
        url: `https://api.themoviedb.org/3/authentication/token/validate_with_login?api_key=${apiKey}`,
        method: "POST",
        body: {
            username: `${username}`,
            password: `${password}`,
            request_token: `${requestToken}`
        }
    }) as ResponseToken;

    requestToken = result.request_token;
    console.log(result.request_token);
}

async function criarSessao() {
    let result = await HttpClient.get({
        url: `https://api.themoviedb.org/3/authentication/session/new?api_key=${apiKey}&request_token=${requestToken}`,
        method: "GET"
    }) as ResponseSession;

    sessionId = result.session_id;
}

async function criarLista(nomeDaLista: string, descricao: string) {
    let result = await HttpClient.get({
        url: `https://api.themoviedb.org/3/list?api_key=${apiKey}&session_id=${sessionId}`,
        method: "POST",
        body: {
            name: nomeDaLista,
            description: descricao,
            language: "pt-br"
        }
    }) as ResponseCreateList;
    
    if(result.success) {
        listId = result.list_id;
        listData.innerText = `${nomeDaLista} (${result.list_id})`;
    }

    console.log(result)
}

async function adicionarFilmeNaLista(filmeId: number, listaId: number) {
    let result = await HttpClient.get({
        url: `https://api.themoviedb.org/3/list/${listaId}/add_item?api_key=${apiKey}&session_id=${sessionId}`,
        method: "POST",
        body: {
            media_id: filmeId
        }
    }) as ResponseAddMovieList;
    
    pegarLista();
}

async function pegarLista() {
    let result = await HttpClient.get({
        url: `https://api.themoviedb.org/3/list/${listId}?api_key=${apiKey}`,
        method: "GET"
    }) as ResponseGetList;
    
    listName = result.name;
    listDescription = result.description;

    let ul = document.createElement('ul');

    for (const item of result.items) {
        let li = document.createElement('li');

        li.appendChild(document.createTextNode(item.original_title))
        ul.appendChild(li)
    }

    listaConteudo.innerHTML = '';
    listaConteudo.appendChild(ul);
}