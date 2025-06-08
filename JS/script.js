// script.js

let piramide = [];
let selecao = [];
let resultadoAtual = 0;
let combinacoesValidas = [];
let combinacoesUsadas = new Set();
let pontos = 0;
let tempoRestante = 120;
let intervalo;
let nivel = 1;
let roundsVencidos = 0;
let roundsJogador = 0;

const operadoresPorNivel = {
  1: ["+"],
  2: ["+", "-"],
  3: ["+", "-", "*"],
  4: ["+", "-", "*", "/"]
};

function gerarNumero(nivelAtual) {
  const valor = Math.floor(Math.random() * 20) + 1;
  const operadores = operadoresPorNivel[Math.min(nivelAtual, 4)];
  const operador = operadores[Math.floor(Math.random() * operadores.length)];
  return { valor, operador };
}

function construirPiramide() {
  piramide = [];
  const linhas = 4;
  for (let i = 0; i < linhas; i++) {
    const linha = [];
    for (let j = 0; j < i + 1; j++) {
      linha.push(gerarNumero(nivel));
    }
    piramide.push(linha);
  }
}

function exibirPiramide() {
  const container = document.getElementById("piramide");
  container.innerHTML = "";
  piramide.forEach((linha, i) => {
    const divLinha = document.createElement("div");
    divLinha.className = "linha";
    linha.forEach((item, j) => {
      const div = document.createElement("div");
      div.className = "numero";
      div.textContent = `${item.operador}${item.valor}`;
      div.dataset.linha = i;
      div.dataset.coluna = j;
      divLinha.appendChild(div);
    });
    container.appendChild(divLinha);
  });
}

function calcularCombinacoes() {
  combinacoesValidas = [];
  const todos = piramide.flat();
  const combinacoesSet = new Set();
  for (let i = 0; i < todos.length; i++) {
    for (let j = 0; j < todos.length; j++) {
      for (let k = 0; k < todos.length; k++) {
        if (i !== j && i !== k && j !== k) {
          const usados = [todos[i], todos[j], todos[k]];
          const ordens = [
            [0, 1, 2], [0, 2, 1],
            [1, 0, 2], [1, 2, 0],
            [2, 0, 1], [2, 1, 0]
          ];
          for (const ordem of ordens) {
            const [a, b, c] = ordem.map(x => usados[x]);
            const expressao = `${a.valor} ${b.operador} ${b.valor} ${c.operador} ${c.valor}`;
            try {
              const resultado = eval(expressao);
              if (
                Number.isInteger(resultado) &&
                resultado >= 1 && resultado <= 20 &&
                !combinacoesSet.has(expressao)
              ) {
                combinacoesValidas.push({ indices: [a, b, c], resultado, expressao });
                combinacoesSet.add(expressao);
              }
            } catch {}
          }
        }
      }
    }
  }
  combinacoesValidas = combinacoesValidas.filter((v, i, self) =>
    i === self.findIndex((x) => x.expressao === v.expressao)
  ).slice(0, 5);
}

function escolherResultado() {
  if (combinacoesValidas.length === 0) return;
  const r = combinacoesValidas[Math.floor(Math.random() * combinacoesValidas.length)];
  resultadoAtual = r.resultado;
  document.getElementById("resultado").textContent = `Resultado alvo: ${resultadoAtual}`;
}

function atualizarTimer() {
  tempoRestante--;
  document.getElementById("timer").textContent = `Tempo: ${tempoRestante}`;
  if (tempoRestante <= 0) {
    clearInterval(intervalo);
    finalizarRound();
  }
}

function iniciarRound() {
  construirPiramide();
  exibirPiramide();
  calcularCombinacoes();
  escolherResultado();
  selecao = [];
  tempoRestante = 120;
  document.getElementById("pontos").textContent = `Pontos: ${pontos}`;
  document.getElementById("nivel").textContent = `Nível: ${nivel}`;
  document.getElementById("historico").innerHTML = "";
  document.getElementById("confirmar").style.display = "inline-block";
  document.getElementById("cancelar").style.display = "inline-block";
  document.getElementById("pular").style.display = "inline-block";
  document.getElementById("terminar").style.display = "inline-block";
  combinacoesUsadas.clear();
  intervalo = setInterval(atualizarTimer, 1000);
}

function registrarResposta(correta, expressao) {
  const historico = document.getElementById("historico");
  const div = document.createElement("div");
  div.className = correta ? "correta" : "incorreta";
  div.textContent = `${expressao} → ${correta ? "✔️" : "❌"}`;
  historico.appendChild(div);
}

function finalizarRound() {
  roundsJogador++;
  const respostasCertas = document.querySelectorAll("#historico .correta").length;
  if (respostasCertas >= Math.ceil(combinacoesValidas.length / 2)) {
    roundsVencidos++;
    if (respostasCertas === combinacoesValidas.length) {
      pontos += 2;
    }
    if (roundsVencidos % 5 === 0) nivel++;
  }
  iniciarRound();
}

document.getElementById("piramide").addEventListener("click", (e) => {
  if (!e.target.classList.contains("numero")) return;
  const linha = e.target.dataset.linha;
  const coluna = e.target.dataset.coluna;
  const item = piramide[linha][coluna];
  const index = selecao.indexOf(item);
  if (index === -1) {
    if (selecao.length < 3) {
      selecao.push(item);
      e.target.classList.add("selecionado");
    }
  } else {
    selecao.splice(index, 1);
    e.target.classList.remove("selecionado");
  }
});

document.getElementById("confirmar").addEventListener("click", () => {
  if (selecao.length !== 3) return;
  const [a, b, c] = selecao;
  const expressao = `${a.valor} ${b.operador} ${b.valor} ${c.operador} ${c.valor}`;

  if (combinacoesUsadas.has(expressao)) {
    registrarResposta(false, expressao);
    pontos--;
  } else {
    combinacoesUsadas.add(expressao);
    let resultado;
    try {
      resultado = eval(expressao);
    } catch {
      registrarResposta(false, expressao);
      pontos--;
      return;
    }
    if (Math.floor(resultado) === resultadoAtual) {
      registrarResposta(true, expressao);
      pontos++;
    } else {
      registrarResposta(false, expressao);
      pontos--;
    }
  }
  document.getElementById("pontos").textContent = `Pontos: ${pontos}`;
  selecao = [];
  document.querySelectorAll(".selecionado").forEach(el => el.classList.remove("selecionado"));
});

document.getElementById("cancelar").addEventListener("click", () => {
  selecao = [];
  document.querySelectorAll(".selecionado").forEach(el => el.classList.remove("selecionado"));
});

document.getElementById("pular").addEventListener("click", () => {
  clearInterval(intervalo);
  finalizarRound();
});

document.getElementById("iniciar").addEventListener("click", () => {
  document.getElementById("iniciar").style.display = "none";
  iniciarRound();
});

document.getElementById("terminar").addEventListener("click", () => {
  clearInterval(intervalo);
  alert(`Jogo finalizado! Pontuação total: ${pontos}`);
  location.reload();
});
