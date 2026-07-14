# praia.on-back

## Testes

Este projeto utiliza o [Jest](https://jestjs.io/) em conjunto com o [Supertest](https://github.com/ladjs/supertest) para testes automatizados da API.

### Como executar os testes

Você pode rodar a suíte de testes completa utilizando o comando nativo do NPM:

```bash
npm test
```

### Outros comandos de teste disponíveis:

- **Modo Watch:** Útil durante o desenvolvimento, pois o Jest observa os arquivos alterados e roda os testes correspondentes automaticamente.
  ```bash
  npm run test:watch
  ```

- **Cobertura de Código (Coverage):** Gera um relatório indicando o quanto do seu código está coberto pelos testes.
  ```bash
  npm run test:coverage
  ```
  *Após rodar este comando, uma pasta `coverage` será gerada no projeto. Você pode abrir o arquivo `coverage/lcov-report/index.html` no seu navegador para ver o relatório de cobertura em detalhes.*

### Estrutura dos testes

Todos os testes automatizados da aplicação ficam localizados dentro do diretório `/tests`. Os arquivos de teste devem seguir a convenção de nomenclatura `*.test.js` (por exemplo: `mesa.test.js`, `auth.test.js`), conforme especificado no `package.json`.

O arquivo de configuração e preparo para os testes (rodado antes da suíte começar) é o `tests/setup.js`.