"use strict";

import { conteudos } from './modulos/conteudos.js';
import { atualizarDatas, isEmpty, atribuirLinks, ordernarString, limparEFocar } from './modulos/utilitarios.js';
import { verificacao } from './modulos/confirmacao.js';
import { funcoesBase } from './modulos/funcoes-base.js';
import { adicionarOpcoesAutoComplete, renderConteudosPagina } from './modulos/funcoes-de-conteudo.js';

(() => {  
  function clickEnviarConfirmacaoSenha(evento, elemento, referencia){
    verificacao(evento, elemento, referencia);
  }
  window.clickEnviarConfirmacaoSenha = clickEnviarConfirmacaoSenha;

  document.querySelectorAll('[data-recarrega-pagina]').forEach(botao => {
    botao.addEventListener('click', () => {
      window.location.reload;
    })
  }) 

  const pagina = new URL(window.location).pathname.trim().replace('/', '');
  const body = document.querySelector('body');

  if(pagina == 'index.html' || pagina == 'confirmacao-cca/' || pagina == 'confirmacao-cca/index.html' || isEmpty(pagina)){
    body.innerHTML += conteudos.conteudo_pagina_confirmacao;
    const accordion_item = document.createElement('div');
    accordion_item.classList.value = 'accordion-item';
    accordion_item.innerHTML = conteudos.accordion_item(1);
    document.querySelector('.accordion').appendChild(accordion_item);
  }
  
  else if(pagina == 'consultas/index.html' || pagina == 'confirmacao-cca/consultas/' || pagina == 'confirmacao-cca/consultas/index.html'){
    body.innerHTML += conteudos.conteudo_pagina_consultas;
    const area_consultas = document.querySelector('[data-content="area-consultas"]');
    
    renderConteudosPagina(area_consultas, ordernarString(conteudos.consultas), 'consultas');
    adicionarOpcoesAutoComplete();
  }

  else if(pagina == 'arquivos/index.html' || pagina == 'confirmacao-cca/arquivos/' || pagina == 'confirmacao-cca/arquivos/index.html'){
    body.innerHTML += conteudos.conteudo_pagina_arquivos;
    const area_arquivos = document.querySelector('[data-content="area-arquivos"]');

    renderConteudosPagina(area_arquivos, ordernarString(conteudos.arquivos), 'arquivos');
    document.querySelectorAll('a').forEach(a => {
      a.setAttribute('confirm', a.getAttribute('href'));
      a.removeAttribute('href'); 
      a.setAttribute('onclick', 'clickConfirm(this)');
    })

    function clickConfirm(elemento){
      $('#modal-confirmar-senha').modal('show');
      const modal = document.querySelector('#modal-confirmar-senha');
      const input = modal.querySelectorAll('input')[0];
      limparEFocar(input, 'clear');
      setTimeout(() => {
        limparEFocar(input, 'focus');
        input.setAttribute('type', 'password');
        modal.querySelector('button[type="submit"]').setAttribute('onclick', `clickEnviarConfirmacaoSenha(event, this, '${elemento.getAttribute('confirm')}')`);
      }, 500);
    }
    window.clickConfirm = clickConfirm;
  }

  body.innerHTML += conteudos.rodape;

  window.addEventListener("load", function () {
    const overlay2 = document.querySelector(".overlay-2");
    overlay2.style.display = "none";

    funcoesBase();
    atribuirLinks();
    atualizarDatas();
  });

})();

let text_areas_edicao = false;

export function text_areas_editados(condicao){
  if(isEmpty(condicao)){
    return text_areas_edicao;
  }else{
    text_areas_edicao = condicao;
  }
};

const datetime = moment();
const codigo = `${datetime.get('year')}${datetime.get('month')}${datetime.get('date')}${datetime.get('hour')}${datetime.get('minutes')}${datetime.get('seconds')}`