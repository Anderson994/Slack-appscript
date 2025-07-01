const domain = "convenia.com.br";

const slackWebhookUrl = PropertiesService.getScriptProperties().getProperty('SLACK_WEBHOOK_URL');

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    // 1. Validação inicial do Slack (url_verification)
    if (data.type === "url_verification" && data.challenge) {
      return ContentService.createTextOutput(data.challenge)
        .setMimeType(ContentService.MimeType.TEXT);
    }

    // 2. Extrair nome completo da mensagem
    const messageText = data.event?.text || "";
    const match = messageText.match(/Nome completo\s*[:\-]\s*(.+)/i);
    if (!match) {
      return ContentService.createTextOutput("Erro: nome completo não encontrado.");
    }

    const fullName = match[1].trim();
    const nameParts = fullName.split(/\s+/);
    if (nameParts.length < 2) {
      return ContentService.createTextOutput("Erro: informe ao menos nome e sobrenome.");
    }

    const firstName = nameParts[0];
    const lastName = nameParts[nameParts.length - 1];
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`;
    const password = "Convenia@123";

    const user = {
      name: {
        givenName: firstName,
        familyName: lastName,
      },
      password: password,
      primaryEmail: email,
      changePasswordAtNextLogin: true,
    };

    // 3. Tenta criar o usuário no Google Workspace
    try {
      AdminDirectory.Users.insert(user);
    } catch (createError) {
      const errorMsg = createError.message || "Erro desconhecido ao criar usuário.";

      // 4. Notifica o Slack sobre o erro
      const errorPayload = {
        text: `:x: *Erro ao criar usuário!*\n\n:bust_in_silhouette: *Nome:* ${fullName}\n:email: *E-mail:* ${email}\n\n:warning: *Erro:* ${errorMsg}`,
      };

      UrlFetchApp.fetch(slackWebhookUrl, {
        method: "post",
        contentType: "application/json",
        payload: JSON.stringify(errorPayload),
      });

      // Também retorna erro para o Slack
      return ContentService.createTextOutput(`Erro ao criar usuário: ${errorMsg}`)
        .setMimeType(ContentService.MimeType.TEXT);
    }

    // 5. Se deu tudo certo, notifica o Slack
    const successPayload = {
      text: `:white_check_mark: *Usuário criado com sucesso!*\n\n:bust_in_silhouette: *Nome:* ${fullName}\n:email: *E-mail:* ${email}\n:key: *Senha temporária:* ${password}\n\n:warning: *Lembre-se de alterar a senha no primeiro acesso.*`,
    };

    UrlFetchApp.fetch(slackWebhookUrl, {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify(successPayload),
    });

    return ContentService.createTextOutput("Usuário criado com sucesso.")
      .setMimeType(ContentService.MimeType.TEXT);

  } catch (err) {
    return ContentService.createTextOutput(`Erro: ${err.message}`)
      .setMimeType(ContentService.MimeType.TEXT);
  }
}
