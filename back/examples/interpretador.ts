function binarioISA(codigo: string): string {
    if (codigo === 'LODD') {
        return '0000';
    } else if (codigo === 'STOD') {
        return '0001';
    } else if (codigo === 'ADDD') {
        return '0010';
    } else if (codigo === 'SUBD') {
        return '0011';
    } else if (codigo === 'JPOS') {
        return '0100';
    } else if (codigo === 'JZER') {
        return '0101';
    } else if (codigo === 'JUMP') {
        return '0110';
    } else if (codigo === 'LOCO') {
        return '0111';
    } else if (codigo === 'LODL') {
        return '1000';
    } else if (codigo === 'STOL') {
        return '1001';
    } else if (codigo === 'ADDL') {
        return '1010';
    } else if (codigo === 'SUBL') {
        return '1011';
    } else if (codigo === 'JNEG') {
        return '1100';
    } else if (codigo === 'JNZE') {
        return '1101';
    } else if (codigo === 'CALL') {
        return '1110';
    } else if (codigo === 'PSHI') {
        return '1111000000000000';
    } else if (codigo === 'POPI') {
        return '1111001000000000';
    } else if (codigo === 'PUSH') {
        return '1111010000000000';
    } else if (codigo === 'POP') {
        return '1111011000000000';
    } else if (codigo === 'RETN') {
        return '1111100000000000';
    } else if (codigo === 'SWAP') {
        return '1111101000000000';
    } else if (codigo === 'INSP') {
        return '11111100'; // Prefixo de 8 bits
    } else if (codigo === 'DESP') {
        return '11111110'; // Prefixo de 8 bits
    }
    return 'NOTFOUND'; // Código de instrução desconhecido, pra já dar merda aqui logo do que depois
    // Depois a gnt vê como vamos mostrar o erro pro usuário
}

function intParaBinario(valor: number, quantidadeBits: number) {
    return valor.toString(2).padStart(quantidadeBits, '0');
}


function interpretador(codigo: string) {
    //input: 'LOCO 3;'
    const codigoArray = codigo.split(' '); // ['LOCO', '3']
    const comando = codigoArray[0]; // 'LOCO'
    const valor = parseInt(codigoArray[1]); // 3

    const binarioInstrucao = binarioISA(comando);
    let binarioValor = '';
    if (comando === 'INSP' || comando === 'DESP') {
        binarioValor = intParaBinario(valor, 8); //fzr a base direito
    } else {
        binarioValor = intParaBinario(valor, 12); //fzr a base direito
    }

    const binario = binarioInstrucao + binarioValor;
    console.log("Código binário da instrução + valor: ",binario);
}

function separarLinhas(codeBlock: string) {
    const linhas = codeBlock.split('; ');
    console.log(linhas)
    for (let linha of linhas) {
        interpretador(linha);
    }
    console.log("Quantidade de passos: ", linhas.length)
}


separarLinhas('LOCO 16; ADDD 1;');