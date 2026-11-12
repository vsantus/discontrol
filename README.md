# Discontrol

Extensão de Chrome independente para controlar chamadas de voz do Discord Web em uma janela Picture-in-Picture.

**Autor:** [devsantos](https://github.com/vsantus)

## Funcionalidades
- Painel flutuante minimalista
- Indicador de conexão
- Ativar/silenciar microfone
- Ativar/silenciar áudio
- Encerrar chamada
- Voltar à aba do Discord

## Instalação
Baixe o pacote completo `discontrol.zip`, extraia e selecione a pasta `dist` em `chrome://extensions` → **Carregar sem compactação**.

## Desenvolvimento
```bash
npm install
npm run typecheck
npm run build
```

Chrome 116+ e uma chamada ativa no Discord Web são necessários. A aba original deve permanecer aberta. Os controles dependem dos atributos acessíveis da página e podem exigir ajustes após atualizações do Discord.

## Histórico
| Versão | Alterações |
| --- | --- |
| **0.6.0** | Ícone final próprio com D, semicírculos e microfone desativado; PNG transparente |
| 0.5.0 | Rebranding para Discontrol by devsantos |
| 0.4.5 | Alternativa de mascote |
| 0.4.4 | Correção do botão de retorno ao Discord |
| 0.4.3 | Nomes padronizados e documentação |
| 0.4.2 | Correção dos ícones |
| 0.4.1 | Sincronização de áudio/microfone |
| 0.4.0 | Interface compacta |
| 0.3.0 | Controles por ícones |
| 0.2.1 | Diagnóstico dos botões |
| 0.2.0 | Primeiros controles de chamada |
| 0.1.0 | Protótipo PiP |

Este é um projeto independente, não afiliado nem endossado pelo Discord.