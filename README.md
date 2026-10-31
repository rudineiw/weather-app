# Previsão do Tempo

Aplicação web simples e responsiva para consultar as condições meteorológicas atuais e a previsão do tempo por cidade ou pela localização do dispositivo. A interface está em português e consome os serviços gratuitos da [Open-Meteo](https://open-meteo.com/), sem necessidade de chave de API.

## Funcionalidades

- Busca de cidades com sugestões de localização enquanto você digita.
- Consulta da localização atual, mediante permissão do navegador.
- Condições atuais: temperatura, sensação térmica, umidade, vento e descrição do tempo.
- Previsão hora a hora para as próximas 24 horas.
- Previsão diária para 15 dias, com temperaturas mínima e máxima.
- Ícones e descrições para condições meteorológicas, incluindo variações noturnas.
- Layout adaptável a telas menores.

## Como usar

Não há etapa de instalação ou compilação. Clone ou baixe este repositório e abra o arquivo `index.html` em qualquer navegador.

Para usar a localização do dispositivo, permita o acesso quando solicitado pelo navegador.

## Tecnologias

- HTML5
- CSS3
- JavaScript sem bibliotecas ou frameworks
- [Open-Meteo Geocoding API](https://open-meteo.com/en/docs/geocoding-api), para localizar cidades
- [Open-Meteo Forecast API](https://open-meteo.com/en/docs), para consultar as previsões
- API de geolocalização do navegador, para obter coordenadas com autorização do usuário

## Estrutura do projeto

```text
.
├── index.html   # Estrutura e conteúdo da interface
├── style.css    # Estilos, layout responsivo e tema visual
├── app.js       # Busca de cidades, consultas e exibição das previsões
└── README.md    # Documentação do projeto
```

## Dados meteorológicos

A aplicação envia as coordenadas da cidade escolhida ou da localização autorizada para a Open-Meteo. As unidades e o fuso horário são determinados pela API; a interface exibe temperaturas em °C e velocidade do vento em km/h. A aba diária mostra 15 dias, embora a consulta solicite até 16 dias ao serviço.

A disponibilidade e a precisão dos dados dependem da cobertura e das condições de uso da Open-Meteo. Consulte a documentação do serviço para informações atuais sobre licença, atribuição e limites de uso.
