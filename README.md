# Plataforma Web de Vendas de Carros com Integração IoT

##### Em um cenário onde a tecnologia e a conectividade transformam o mercado automotivo, a eficiência no gerenciamento de vendas e monitoramento em tempo real torna-se um diferencial competitivo. A **Plataforma Web de Vendas de Carros com Integração IoT** surge como uma solução inovadora que combina o poder da web com a Internet das Coisas, permitindo o controle completo de veículos, vendas e dispositivos conectados.

##### O sistema possibilita a administração de produtos, vendedores, vendas e sensores integrados, proporcionando informações em tempo real sobre o status dos veículos e ações realizadas na plataforma. Com uma interface moderna e responsiva, construída com **Next.js** e **Node.js**, a aplicação garante alto desempenho, escalabilidade e uma experiência intuitiva tanto para administradores quanto para vendedores.

##### Além disso, o projeto incorpora uma bancada **IoT** (Internet das Coisas) que interage diretamente com a aplicação, simulando eventos físicos como acionamento de LEDs, sensores e indicadores, demonstrando o potencial da integração entre hardware e software no setor automotivo.

<p align="center"><img src="http://img.shields.io/static/v1?label=STATUS&message=EM%20DESENVOLVIMENTO&color=GREEN&style=for-the-badge"/></p>

---

## Índice
* [Introdução](#plataforma-web-de-vendas-de-carros-com-integração-iot)
* [Índice](#índice)
* [Tecnologias Utilizadas](#tecnologias-utilizadas)
* [Requisitos Funcionais](#requisitos-funcionais)
* [Requisitos Não Funcionais](#requisitos-não-funcionais)
* [Requisitos de Integração IoT](#requisitos-de-integração-iot)
* [Protótipo de Páginas](#protótipo-de-páginas)
* [Desenvolvedores do Projeto](#desenvolvedores-do-projeto)

---

## Tecnologias Utilizadas
<div align="center">
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" height="40" alt="javascript logo" />
  <img width="12"/>
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg" height="40" alt="nextjs logo" />
  <img width="12"/>
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" height="40" alt="nodejs logo" />
  <img width="12"/>
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" height="40" alt="react logo" />
  <img width="12"/>
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mqtt/mqtt-original.svg" height="40" alt="mqtt logo" />
  <img width="12"/>
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg" height="40" alt="postgresql logo" />
  <img width="12"/>
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg" height="40" alt="html5 logo" />
  <img width="12"/>
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg" height="40" alt="css3 logo" />
  <img width="12"/>
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vscode/vscode-original.svg" height="40" alt="vscode logo" />
  <img width="12"/>
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg" height="40" alt="github logo" />
  <img width="12"/>
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg" height="40" alt="figma logo" />
</div>

---

## Requisitos Funcionais

<ul>
  <li><strong>[RF001]</strong> Permitir cadastro, login e gerenciamento de usuários com diferentes níveis de acesso (administrador e vendedor). [Abílio]</li>
  <li><strong>[RF002]</strong> Cadastrar, editar e excluir veículos (marca, modelo, ano, valor, quilometragem, cor e imagem). [Giovani]</li>
  <li><strong>[RF003]</strong> Exibir listagem e pesquisa de veículos com filtros (marca, modelo, preço e disponibilidade). [Giovani]</li>
  <li><strong>[RF004]</strong> Registrar vendas associando veículos, clientes e vendedores. [Joabe]</li>
  <li><strong>[RF005]</strong> Gerar relatórios de vendas com filtros por período, veículo ou funcionário. [Luiz Felipe]</li>
  <li><strong>[RF006]</strong> Cadastrar e gerenciar clientes (nome, CPF, telefone, e-mail, endereço). [Joabe]</li>
  <li><strong>[RF007]</strong> Visualizar histórico de vendas da organização e por vendedor. [Luiz Felipe]</li>
  <li><strong>[RF008]</strong> Painel administrativo com indicadores de vendas, lucros e estoque. [Giovani]</li>
</ul>

---

## Requisitos de Integração IoT

<ul>
  <li><strong>[RI001]</strong> Estabelecer comunicação entre a plataforma e a bancada IoT via HTTP, MQTT ou WebSocket. [Joabe]</li>
  <li><strong>[RI002]</strong> Enviar comandos da aplicação web para acionar atuadores na bancada (LEDs, buzzer, etc.). [Joabe]</li>
  <li><strong>[RI003]</strong> Receber dados de sensores em tempo real (ex.: temperatura, distância, presença). [Joabe]</li>
  <li><strong>[RI004]</strong> Exibir em tempo real o status dos sensores e dispositivos na interface da aplicação. [Joabe]</li>
  <li><strong>[RI005]</strong> Registrar no banco de dados os eventos gerados pela interação com os dispositivos IoT. [Joabe]</li>
</ul>

---

## Requisitos Não Funcionais

<ul>
  <li><strong>[RNF001]</strong> O sistema deve suportar múltiplos usuários simultâneos sem perda de desempenho.</li>
  <li><strong>[RNF002]</strong> As respostas das requisições devem ocorrer em até 3 segundos.</li>
  <li><strong>[RNF003]</strong> A interface deve ser responsiva e acessível em diferentes dispositivos (desktop, tablet e celular).</li>
  <li><strong>[RNF004]</strong> O design deve ser moderno, intuitivo e fácil de usar.</li>
  <li><strong>[RNF005]</strong> As senhas devem ser criptografadas e a autenticação deve utilizar tokens JWT.</li>
  <li><strong>[RNF006]</strong> A comunicação entre frontend, backend e dispositivos IoT deve ocorrer via HTTPS ou canal seguro.</li>
</ul>

---

## Protótipo de Páginas
VAMOS FAZER
---

### Desenvolvedores do Projeto

<div align="left">
  <a href="https://github.com/Abivisu2" target="_blank">
    <img width="115" src="https://avatars.githubusercontent.com/u/106842046?v=4" alt="Abílio">
  </a> &nbsp;&nbsp;&nbsp;&nbsp;
  <a href="https://github.com/JoabeSCosta" target="_blank">
    <img width="115" src="https://avatars.githubusercontent.com/u/165953439?v=4" alt="Joabe">
  </a> &nbsp;&nbsp;&nbsp;&nbsp;
  <a href="https://github.com/LuizFli" target="_blank">
    <img width="115" src="https://avatars.githubusercontent.com/u/166057870?v=4" alt="Luiz">
  </a> &nbsp;&nbsp;&nbsp;&nbsp;
  <a href="https://github.com/WallaceOliveiraaa" target="_blank">
    <img width="115" src="https://avatars.githubusercontent.com/u/165970709?v=4" alt="Giovani">
  </a>
</div>
