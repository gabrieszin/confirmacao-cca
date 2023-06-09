import { conteudos } from './conteudos.js';
import { SwalAlert, isEmpty, copiar, sanitizarCPF, primeiroNome, resizeTextArea, capitalize, cumprimentoHorario } from './utilitarios.js';
import { renderPendencias, renderResumo } from './funcoes-render.js';
import { atualizar, escutaEventoInput, verificarInputsRecarregamento } from './funcoes-base.js';
import { atualizarNumerosProponentes } from './funcoes-de-conteudo.js';

const clickIncluirRenda = (botao) => {
  const proponente = botao.closest('[data-identify]');
  const div = document.createElement('div');
  div.classList.value = `input-group mt-2 mb-2`;
  div.dataset.element = "renda";
  let length = null;
  try{length = proponente.querySelectorAll('[data-element="renda"]').length}catch(error){}
  div.innerHTML = `${conteudos.secao_rendas(!isEmpty(length) ? length + 1 : 1)}`;
  proponente.querySelector('[data-element="area_rendas"]').appendChild(div);
  escutaEventoInput();
  clickRemoverRenda(div);
  renderPendencias();
}

window.clickIncluirRenda = clickIncluirRenda

const clickRemoverRenda = (elemento) => {
  if(!isEmpty(elemento)){
    acao(elemento.querySelector('[data-action="remover-renda"]'));
  }else{
    document.querySelectorAll('[data-action="remover-renda"]').forEach(botao => {
      acao(botao);
      renderPendencias();
    })
  }
  
  function acao(botao){
    removeEventListener('click', botao);
    botao.addEventListener('click', (evento) => {
      evento.preventDefault();
      $(botao).tooltip('dispose')
      botao.closest('[data-element="renda"]').remove();
    })
  }
}

const clickIncluirProponente = () => {
  const botao = document.querySelector('[data-action="incluir-proponente"]');
  if(!isEmpty(botao)){
    botao.addEventListener('click', (evento) => {
      acaoClickIncluirProponente();
    })
  }
}

const acaoClickIncluirProponente = () => {
  const div = document.createElement('div');
  div.classList.value = `accordion-item`;
  div.innerHTML = `${conteudos.accordion_item(document.querySelectorAll('.accordion-item').length + 1)}`;
  document.querySelector('.accordion').appendChild(div);
  
  renderResumo();
  renderPendencias();
  clickRemoverRenda();
  clickRemoverProponente();
  escutaEventoInput();
  atualizar();
}

const clickRemoverProponente = () => {
  const botao = document.querySelectorAll('[data-action="remover-proponente"]');
  botao.forEach(botao => {
    removeEventListener('click', botao);
    botao.addEventListener('click', async (evento) => {
      SwalAlert('confirmacao', 'question', 'Tem certeza que deseja remover?', 'Esta ação não poderá ser desfeita').then((retorno) => {
        if(retorno.isConfirmed){
          botao.closest('.accordion-item').remove();
          renderResumo();
          atualizarNumerosProponentes();
          renderPendencias();
        }
      });
    })
  })
}

const clickCopiar = () => {
  const btns = document.querySelectorAll('[data-action="copiar"]');
  btns.forEach(btn => {
    if(!isEmpty(btn)){
      acaoClickCopiar(btn)
    }
  })
}

const acaoClickCopiar = (btn) => {
  try{
    btn.addEventListener('click', () => {
      const elemento = btn.closest('[data-node="card"]').querySelector('[data-copiar="texto"]');
      let e = elemento.value || elemento.innerText;
      
      const data_input = elemento.dataset.input;
      
      if(!isEmpty(data_input) && data_input.trim().toLowerCase() == 'nome'){
        e = e.toUpperCase();
      }
      
      else if(!isEmpty(data_input) && data_input.trim().toLowerCase() == 'cpf'){
        e = (sanitizarCPF(e));
      }
      
      copiar(e).then(retorno => {
        feedback({html: '<i class="bi bi-check2"></i>', classe: 'btn btn-outline-success'});});
      })
    }catch(error){
      feedback({html: '<i class="bi bi-x-lg"></i>', classe: 'btn btn-outline-danger'});
    }
    
    function feedback({html, classe}){
      // const html_botao = btn.innerHTML;
      const html_botao = `<i class="bi bi-clipboard"></i>`;
      const class_botao = !isEmpty(btn.classList.value) ? btn.classList.value == 'btn btn-outline-success' ? '' : btn.classList.value : '';
      // const class_botao = `btn btn-outline-primary`;
      
      btn.innerHTML = html;
      btn.classList.value = classe;
      
      setTimeout(() => {
        btn.innerHTML = html_botao;
        btn.classList.value = class_botao;
      }, 1500);
    }
  }
  window.acaoClickCopiar = acaoClickCopiar;
  
  const clickDownload = (elemento, evento) => {
    evento.preventDefault();
    const saida = new Array();
    const proponentes = document.querySelectorAll('.accordion-item');
    const primeirosNomes = new Array();
    
    proponentes.forEach((proponente) => {
      !isEmpty(proponente.querySelector('[data-input="nome"]').value.trim()) ? primeirosNomes.push(primeiroNome(proponente.querySelector('[data-input="nome"]').value.trim())) : '';
    })
    
    switch(elemento.dataset.download){
      case 'baixar-dados':
      //Selecionar Nome, CPF e data de nascimento de todos os proponentes
      proponentes.forEach((proponente, index) => {
        const nome = proponente.querySelector('[data-input="nome"]').value.trim();
        saida.push(`PROPONENTE ${index + 1}\n` +`NOME: ${!isEmpty(nome) ? nome.toUpperCase() : ''}\n` + `CPF: ${sanitizarCPF(proponente.querySelector('[data-input="cpf"]').value.trim())}\n` + `DT NASC: ${proponente.querySelector('[data-input="data_nascimento"]').value.trim()}\n` + `TELEFONE: ${proponente.querySelector('[data-input="telefone"]').value.replaceAll('-', '').trim()}\n` + `EMAIL: ${proponente.querySelector('[data-input="email"]').value.trim()}\n\n`)
      });
      criarEBaixarTXT(JSON.stringify(saida.join('\n')), `DADOS${!isEmpty(primeirosNomes) ? ' - ' + primeirosNomes.join(', ') : ''}`);
      break;
      
      case 'baixar-relatorio':
      //Selecionar conteúdo no textarea de relatório
      const relatorio = document.querySelector('[data-content="relatorio"]').value;
      criarEBaixarTXT(JSON.stringify(relatorio), `RELATORIO${!isEmpty(primeirosNomes) ? ' - ' + primeirosNomes.join(', ') : ''}`);
      break;
      
      case 'baixar-pendencias':
      //Selecionar conteúdo no textarea de pendências
      const pendencias = document.querySelector('[data-content="pendencias"]').value;
      criarEBaixarTXT(JSON.stringify(pendencias), `PENDENCIAS${!isEmpty(primeirosNomes) ? ' - ' + primeirosNomes.join(', ') : ''}`);
      break;
      
      case 'baixar-acompanhar-fid':
      try{
        const link = new URL(elemento.parentElement.querySelector('input[type=url]').value);
        const split = link.search.split('&');
        
        const valido = [
          link.origin.toLowerCase() == 'https://portalsafi.direcional.com.br', 
          link.pathname.toLowerCase() == '/fluxo', 
          split.length == 2, 
          split[0].search('codigo') > 0,
          typeof(parseInt(split[0].split('=')[1])) == 'number',
          split[0].split('=')[1].length == 6
        ];
        
        const FID = split[0].split('=')[1];
        
        if(valido.every(e => e == true)){
          reportar(true);
          criarEBaixarHTMLAcompanhamento(FID, link.href, `Acompanhe o FID ${FID}`);
        }else{
          reportar(false, 'O link informado para o FID não é válido');
        }
        
      }catch(error){
        reportar(false, 'O link informado para o FID não é válido');
      }
      
      function reportar(condicao, texto){
        const retorno = document.querySelector('[data-element="retorno-link-fid"]');
        if(!condicao){
          retorno.setAttribute('class', 'alert alert-danger mt-3 mb-0');
          retorno.innerText = texto;
        }else{
          retorno.setAttribute('class', '');
          retorno.innerText = '';
        }
        
        setTimeout(() => {
          // retorno.setAttribute('class', '');
          // retorno.innerText = '';
        }, 2000);
      }
      
      break;
    }
  }
  window.clickDownload = clickDownload;
  
  const criarEBaixarTXT = (conteudo, nome) => {
    let blob = new Blob([`${JSON.parse(conteudo)}`], {type: "text/plain;charset=utf-8"});
    saveAs(blob, `${nome.toUpperCase()}.txt`);
  }
  
  const criarEBaixarJSON = (conteudo, nome) => {
    let blob = new Blob([`${JSON.stringify(conteudo)}`], {type: "text/plain;charset=utf-8"});
    saveAs(blob, `${nome.toUpperCase()}.json`);
  }
  
  const criarEBaixarHTMLAcompanhamento = (FID, link, nome) => {
    let blob = new Blob([`${conteudos.HTMLacompanharFID(FID, link)}`], {type: "text/plain;charset=utf-8"});
    saveAs(blob, `${nome.trim()}.html`);
  }
  
  function clickLimparProcesso(){
    const btn = document.querySelector('[data-action="limpar-processo"]');
    
    if(!isEmpty(btn)){
      btn.addEventListener('click', (evento) => {
        evento.preventDefault();
        
        SwalAlert('confirmacao', 'question', 'Tem certeza que deseja limpar todo o processo?', 'Esta ação não poderá ser desfeita').then((retorno) => {
          if(retorno.isConfirmed){
            verificarInputsRecarregamento('clear');
            localStorage.clear();
            sessionStorage.clear();
            window.location.reload();
            
            document.querySelectorAll('[data-input]').forEach(input => {
              if(input.tagName.toLowerCase() == 'textarea' || input.tagName.toLowerCase() == 'input' && input.getAttribute('type') == 'text'){
                input.value = '';
              }else if(input.tagName.toLowerCase() == 'input' && input.getAttribute('type') == 'checkbox'){
                input.checked = false;
              }      
            })
            
            document.querySelectorAll('textarea').forEach(textarea => {
              textarea.value = '';
              textarea.style.height = '100px';
            })
            
            document.querySelectorAll('input[type=url]').forEach(input => {
              input.value = '';
            })
            
            document.querySelectorAll('.accordion-item').forEach(item => { item.remove() });
            renderResumo();
            atualizarNumerosProponentes();
            renderPendencias();
          }
        });
      })
    }
  }
  
  function clickAddInformacoes(){
    const modal = document.querySelector('#modal-informacoes-adicionais');
    if(!isEmpty(modal)){
      document.querySelector('[data-action="add-informacoes"]').addEventListener('click', (evento) => {
        evento.preventDefault();
        $(modal).modal('show');
        setTimeout(() => {
          modal.querySelector('[data-input="id-fid"]').focus();
        }, 500)
      })
      
      modal.querySelector('form').addEventListener('submit', (evento) => {
        evento.preventDefault();
        const dados = {
          'fid': evento.target.querySelector('[data-input="id-fid"]').value,
          'gerente': evento.target.querySelector('#id-gerente-ou-corretor').value,
          'empreendimento': evento.target.querySelector('#id-empreendimento').value,
          'valor': evento.target.querySelector('[data-input="id-valor-imovel"]').value,
          analista: evento.target.querySelector('[data-input="id-analista"]'),
          'add_data_hora': evento.target.querySelector('#add-data-hora').checked,
          'limpar_txt_area': evento.target.querySelector('#limpar-txt-area').checked,
        };
        
        const textarea = document.querySelector('[data-content="relatorio"]');
        
        !isEmpty(dados.limpar_txt_area) ? dados.limpar_txt_area ? textarea.value = '' : '' : '';
        
        textarea.value += 
        `FID: ${dados.fid}\n` +
        `GERENTE: ${!isEmpty(dados.gerente) ? dados.gerente.trim().toUpperCase() : ''}\n` +
        `EMPREENDIMENTO: ${!isEmpty(dados.empreendimento) ? dados.empreendimento.trim().toUpperCase() : ''}\n` + 
        `VALOR IMÓVEL: ${dados.valor}\n`;
        
        !isEmpty(dados.add_data_hora) ? dados.add_data_hora ? textarea.value += `\n## ${moment().format('DD/MM/YYYY HH:mm')} - ${!isEmpty(dados.analista.value) ? dados.analista.value.toUpperCase().trim() : '[ANALISTA]'} ##\n` : ''  : '';
        
        resizeTextArea(textarea);
        $(modal).modal('hide');

        setTimeout(() => {
          textarea.focus()
        }, 500);
      })
    }
  }
  
  function clickVisibilidadeSenha(){
    const botao = document.querySelector('[data-action="btn-visibilidade-senha"]');
    if(!isEmpty(botao)){
      botao.addEventListener('click', (evento) => {
        evento.preventDefault();
        const input = botao.parentElement.querySelectorAll('input')[0];
        input.setAttribute('type', input.type == 'text' ? 'password' : 'text');
      })
    }
  }
  
  function clickAddDevolucaoFID(){
    const botao = document.querySelector('[data-action="add-devolucao-fid"]');
    if(!isEmpty(botao)){
      botao.addEventListener('click', (evento) => {
        evento.preventDefault();
        const modal = document.querySelector('#modal-devolucao-fid');
        // SwalAlert('aviso', 'error', 'Desculpe. Esta função ainda não foi implementada.', '');
        $(modal).modal('show');
        
        setTimeout(() => {
          modal.querySelectorAll('input')[0].focus();
        }, 500);
      })
    }
  }
  
  function submitAddDevolucaoFID(){
    const modal = document.querySelector('#modal-devolucao-fid');
    if(!isEmpty(modal)){
      modal.querySelector('form').addEventListener('submit', (evento) => {
        evento.preventDefault();
        const form = evento.target;
        const finac = form.querySelector('#dev-financ-NPMCMV').checked ? 'NPMCMV' : form.querySelector('#dev-financ-SBPE').checked ? 'SBPE' : form.querySelector('#dev-financ-PROCOTISTA').checked ? 'Pró-cotista' : '';
        
        const subsidio_valido = !isEmpty(form.querySelector('#dev-subsidio').value.trim()) && form.querySelector('#dev-subsidio').value.trim() !== 'R$ 0,00';
        
        const FGTS_valido = !isEmpty(form.querySelector('#dev-FGTS').value.trim()) && form.querySelector('#dev-FGTS').value.trim() !== 'R$ 0,00';
        
        const analista = form.querySelector('#dev-analista').value.trim();
        
        const dev = {
          renda: `Renda: ${form.querySelector('#dev-renda').value.trim()}. `,
          parcela: `Parcela ${form.querySelector('#dev-status-parcela-aprovado').checked ? 'aprovada' : 'possível'}: ${form.querySelector('#dev-parcela').value}. `,
          situacao: `${form.querySelector('#dev-tabela-price').checked ? 'PRICE' : 'SAC'}. `,
          modalidade: `${finac}. `,
          prazo: `${form.querySelector('#dev-prazo').value} meses. `,
          primeira: `1ª parcela: ${form.querySelector('#dev-parcela-1').value} - Seguro ${capitalize(form.querySelector('#dev-seguro').value.trim())}. `,
          subsidio: `${subsidio_valido ? 'Subsídio: ' + form.querySelector('#dev-subsidio').value.trim() + '. ' : ''}`,
          finaciamento: `Valor de financiamento: ${form.querySelector('#dev-valor-de-financiamento').value.trim()}. `,
          taxa: `Taxa de juros: ${form.querySelector('#dev-taxa-juros').value.substr(0, 4).trim()}% a.a. `,
          FGTS: `${FGTS_valido ? '## FGTS: ' + form.querySelector('#dev-FGTS').value.trim() + '. ' : ''}`,
          pendencias: `${!isEmpty(form.querySelector('#dev-pendencias').value.trim()) ? '## Pendência(s): ' + form.querySelector('#dev-pendencias').value.trim() + '. ' : ''}`,
          restricoes: `${!isEmpty(form.querySelector('#dev-restricoes').value.trim()) ? '## Restrição(s): ' + form.querySelector('#dev-restricoes').value.trim() + '. ' : ''}`,
          analista: `${!isEmpty(analista) ? '## ' + analista.toUpperCase() : ''}`
        }
        
        let devolucao = dev.renda + dev.parcela + dev.situacao + dev.modalidade + dev.prazo + dev.primeira + dev.subsidio + dev.finaciamento + dev.taxa + dev.FGTS + dev.pendencias + dev.restricoes + dev.analista;
        
        const textarea = document.querySelector('[data-content="relatorio"]');
        textarea.value += `Prezados, ${cumprimentoHorario()}! ${devolucao}`;
        
        $(modal).modal('hide');
        resizeTextArea(textarea);
        
        setTimeout(() => {
          textarea.focus()
        }, 500);
      })
    }
  }
  
  function clickImportarPendencias(){
    const botao = document.querySelector('[data-action="importar-pendencias"]');
    if(!isEmpty(botao)){
      botao.addEventListener('click', (evento) => {
        evento.preventDefault();
        const textarea = botao.closest('.row').querySelector('#dev-pendencias');
        const pendencias = document.querySelector('[data-content="pendencias"]').value;
        const texto = (((pendencias.replace('\n', '')).replaceAll(':', ': ')).replaceAll('\n\n', '. ')).replaceAll('\n', ', ')
        textarea.value += capitalize(texto.toLowerCase());
        resizeTextArea(textarea);
      })
    }
  }
  
  export {
    clickIncluirRenda,
    clickRemoverRenda,
    clickIncluirProponente,
    clickRemoverProponente,
    clickCopiar,
    clickLimparProcesso,
    clickAddInformacoes,
    clickVisibilidadeSenha,
    clickAddDevolucaoFID,
    submitAddDevolucaoFID,
    clickImportarPendencias
  }
  