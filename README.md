# Slack - App Script

Este projeto automatiza a criação de usuários no Google Workspace a partir de mensagens enviadas no Slack pelo time de RH.

## 🚀 Como funciona

1. O RH envia uma mensagem no Slack com o nome completo.
2. O script captura o nome, gera o e-mail e senha temporária.
3. O usuário é criado automaticamente no Google Workspace.
4. O Slack recebe uma confirmação.

## 🔐 Segurança

- O webhook do Slack **não fica exposto no código**.
- Ele é armazenado com `PropertiesService` do Apps Script.

