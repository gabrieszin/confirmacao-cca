import { resizeTextArea } from "./utilitarios.js";

const renderTooltips = () => {
  $(function () {
    $('[data-toggle="tooltip"]').tooltip()
  })
}

const renderPopover = () => {
  $(document).ready(function(){
    $('[data-bs-toggle="popover"]').popover();  
  });
}

const renderPendencias = () => {
  const txt = document.querySelector('[data-content="pendencias"]');
  const pendencias = new Array();

  const proponentes = document.querySelectorAll('.accordion-item');
  proponentes.forEach((proponente, index) => {
    const inputs = proponente.querySelectorAll('[data-element="input"]');
    
    const elementos = {
      valores: {
        nome : get('nome'),
        cpf : get('cpf'),
        data_nascimento : get('data_nascimento'),
        email : get('email'),
        telefone : get('telefone'),
        endereco : get('endereco'),
        // tipo_endereco : get('tipo_endereco'),
        endereco_valido: get('endereco_valido'),
        renda : get('renda'),
        renda_valida: get('renda_valida'),
        // tipo_renda : get('tipo_renda'),
        comprovante_estado_civil : get('comprovante_estado_civil'),
        fgts : get('fgts'),
      },
      some(parametro){
        const retorno = new Array();
        for (const [key, value] of Object.entries(this.valores)){
          if(value == parametro){retorno.push(key);}
        }
        return retorno.length > 0 ? true : false;
      },
      search(parametro){
        const retorno = new Array();
        for (const [key, value] of Object.entries(this.valores)){
          if(Array.isArray(value)){
            value.forEach((v, index) => {
              if(v == parametro && !retorno.includes(key)){
                if(key !== 'fgts'){
                  retorno.push(key)
                };
              }
            })
          }else{
            if(value == parametro){key !== 'fgts' ? retorno.push(key) : '';}
          }
        }
        return retorno;
      }
    }

    if(elementos.some('')){
      pendencias.push({proponente: `PROPONENTE ${index + 1} - ${elementos.valores.nome}`, pendente: elementos.search('').join().replaceAll('_', ' ').toUpperCase().replaceAll(',', '\n')})
    }
    
    function get(id){
      const saida = new Array();
      inputs.forEach(input => {
        if(input.type == 'checkbox' && input.dataset.input == `${id}`){
          input.checked ? saida.push(true) : saida.push('');
        }else{
          input.dataset.input == `${id}` ? saida.push(input.value) : '';
        }
      })
      return saida;
    }
  })
  
  txt.value = '';
  pendencias.forEach((pendencia, index) => {
    // console.log(pendencia);
    index !== 0? txt.value += '\n\n' : 'a';
    // console.log('atualizado');
    txt.value += `${pendencia.proponente}\n${pendencia.pendente}`
  })
  resizeTextArea(txt);
  // txt.textContent = `${pendencias.forEach(pendencia => {return pendencia.pendente})}`;
}

const renderResumo = () => {
  const resumo = document.querySelector('[data-content="resumo"]');
  const accordion_group = document.querySelector('.accordion');
  const nomes = new Array();

  accordion_group.querySelectorAll('b[data-content="nome"]').forEach(nome => {
    nomes.push(nome.textContent)
  })

  const a = `### Processo iniciado em ${moment().format('DD/MM/YYYY')}, com ${accordion_group.querySelectorAll('.accordion-item').length} proponente(s): ${nomes.join().replaceAll(',', ', ')}. ###`;

  resumo.textContent = `${a}`
}

export{
  renderTooltips,
  renderPopover,
  renderPendencias,
  renderResumo
}