# MIC-1 Simulador

Um simulador visual do processador MIC-1 (baseado na arquitetura microprogramada de Maurício M. Noronha) que permite executar programas em linguagem de montagem MIC-1, visualizar registradores, memória, ALU e o fluxo do barramento em tempo real.

Este projeto é focado em fins educacionais para estudar arquitetura de computadores e microprogramação.

![Simulador_Working](https://github.com/user-attachments/assets/d8497add-6f1e-4092-9fe3-0c61573c3ec7)

---

## Recursos

✅ Editor de programas MIC-1 diretamente no navegador  
✅ Execução **passo a passo** ou **contínua** do programa  
✅ Histórico de microinstruções executadas  
✅ Visualização dos registradores, memória e ALU em tempo real  
✅ Animação do barramento simulando dados trafegando entre os componentes  
✅ Modos de execução:
- **Modo Didático** (lento, para acompanhar cada passo)
- **Modo Rápido** (execução quase instantânea)
- **Modo Padrão** (intermediário)

✅ Interface com suporte a tema claro/escuro  
✅ Tutorial interativo e interface responsiva

---

## Como rodar localmente

### Pré-requisitos ##

- Node.js >= 16
- npm ou yarn

### Instalação ##

```bash
git clone https://github.com/jeanlago/Simulador-Mic-1.git
cd Simulador-Mic-1/front
npm install
npm dev
#Em outro terminal
cd Simulador-Mic-1/back
yarn install
yarn dev