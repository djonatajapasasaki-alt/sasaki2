# Pesquisa da ponte Tryd e Profit

## Tryd
A documentação oficial do Tryd confirma que extensões são feitas por scripts Groovy e que a API de scripts permite criar indicadores gráficos, interceptar eventos de cotação e acessar recursos da plataforma. A página também mostra que os processos precisam ser configurados e iniciados na tela de Processos de Script. Fonte: https://blog.tryd.com.br/extensoes/ . A documentação Javadoc oficial está em https://www.tryd.com.br/manual/APISCRIPT/javadoc/ e identifica os pacotes `stScript.process.api` e `stScript.db.api`.

## Profit
A documentação oficial da Nelogica confirma que Estratégias de Indicadores usam NTSL e funções `Plot`, `Plot2`, `Plot3` e `Plot4` para desenhar indicadores no gráfico. Fonte: https://ajuda.nelogica.com.br/hc/pt-br/articles/4407276903579-Estrat%C3%A9gia-de-Indicadores . O manual NTSL oficial está em https://downloadserver-cdn.nelogica.com.br/content/profit/manual_ntsl/ManualNTSL.pdf . A exportação/importação de configurações do Profit é feita em arquivos `.prt` gerados pela própria plataforma; não é um formato de texto público para o aplicativo gerar diretamente. Fonte: https://ajuda.nelogica.com.br/hc/pt-br/articles/4402251647643-Exporta%C3%A7%C3%A3o-e-importa%C3%A7%C3%A3o-de-arquivos-de-configura%C3%A7%C3%A3o .

## Decisão técnica
A ponte segura deve gerar: (1) um script Groovy parametrizado para o Tryd, que lê níveis congelados e usa a API de indicador; (2) um indicador NTSL parametrizado para o Profit, usando `Plot`/variantes; e (3) CSV/JSON de apoio. O aplicativo não deve tentar fabricar um arquivo `.prt`, pois a fonte oficial informa que ele é gerado pela própria plataforma e depende da compatibilidade da versão.

## Confirmação adicional do Profit
O artigo oficial de Estratégia de Indicadores confirma o uso de `Plot`, `Plot2`, `Plot3` e `Plot4` para desenhar indicadores em tempo real. O manual NTSL versão 4.4 está publicado em 03/08/2026 e é a referência oficial da linguagem. A configuração `.prt` continua sendo um backup/importação gerado pela própria plataforma; portanto a ponte deve ser um indicador NTSL colável no Editor de Estratégias, não um `.prt` fabricado pelo app.

Fontes: https://ajuda.nelogica.com.br/hc/pt-br/articles/4407276903579-Estrat%C3%A9gia-de-Indicadores ; https://downloadserver-cdn.nelogica.com.br/content/profit/manual_ntsl/ManualNTSL.pdf

## API de scripts do Tryd
A página oficial do pacote `stScript.process.api` confirma as classes `Process`, `QuoteEvent` e `IndicatorBuilder`. A página de extensões confirma que processos Groovy podem criar indicadores gráficos, mas a assinatura concreta de desenho de linhas depende das classes específicas disponíveis na instalação. O gerador deve usar `Process`/`QuoteEvent` e deixar a etapa de indicador gráfico isolada, com comentário de versão, caso a instalação exija ajuste.
Fonte: https://www.tryd.com.br/manual/APISCRIPT/javadoc/stScript/process/api/package-summary.html

## Profit NTSL
O manual oficial confirma `PlotN` com número de plot de 0 a 99, `SetPlotColor` e `SetPlotWidth`; isso permite um único indicador com os níveis congelados e as cores/espessuras do app.
Fonte: https://downloadserver-cdn.nelogica.com.br/content/profit/manual_ntsl/ManualNTSL.pdf
