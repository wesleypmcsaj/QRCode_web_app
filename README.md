# 📷 QR Code Scanner com Integração ao Google Sheets

Este projeto é uma aplicação web simples que usa a câmera do celular ou computador para escanear QR Codes e enviar os dados automaticamente para uma planilha do Google Sheets, através de um endpoint do Google Apps Script.

## 🚀 Funcionalidade

- Leitura automática de QR Codes via webcam.
- Envio de dados escaneados para um script do Google Apps Script via `fetch` (método POST).
- O script realiza atualizações em uma planilha do Google Sheets com base no tipo de documento lido:
  - **OF** (ofício): atualiza colunas específicas.
  - **CI** (comunicado interno): executa outra lógica de marcação.

## 🧩 Componentes do Projeto

### 1. HTML + JS (Interface Web)

- Utiliza a biblioteca `@zxing/library` para leitura do QR Code.
- Envia os dados lidos via `fetch` para o Apps Script.

```html
<!-- Trecho principal do HTML -->
<video id="video" width="100%" height="auto"></video>
<script src="https://unpkg.com/@zxing/library@latest"></script>
<script>
    // Código JavaScript responsável pela leitura e envio
    fetch("https://script.google.com/macros/s/SEU_ENDPOINT_AQUI/exec", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        mode: 'no-cors',
        body: JSON.stringify({ data: "dado lido do QR code" })
    });
</script>


2. Google Apps Script (Backend)
O script abaixo recebe os dados do QR Code, processa e atualiza a planilha. Certifique-se de substituir o ID da planilha pelo seu, e de que a planilha tenha as colunas e abas esperadas.

javascript
Copiar
Editar
function doPost(e) {
    try {
        if (!e || !e.postData || !e.postData.contents) throw new Error("Requisição inválida.");
        const data = JSON.parse(e.postData.contents);
        const qrData = data.data;
        const sheet = SpreadsheetApp.openById('SEU_ID_AQUI').getSheetByName('Atual');
        const anoAtual = new Date().getFullYear();
        let resultado = {};

        if (qrData.startsWith("OF")) {
            const numOficio = qrData.split(" ")[1];
            const termoBusca = `${numOficio}/SAJ/${anoAtual}`;
            const valores = sheet.getRange("A:A").getValues();

            for (let i = 0; i < valores.length; i++) {
                if (valores[i][0] === termoBusca) {
                    const linha = i + 1;
                    const valorColuna6 = sheet.getRange(linha, 6).getValue();

                    if (!valorColuna6) {
                        sheet.getRange(linha, 6).setValue(new Date());
                        sheet.getRange(linha, 14).setValue("CX Aguardando protocolo");
                    } else {
                        const dataAtual = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd/MM/yyyy");
                        sheet.getRange(linha, 11).setValue(dataAtual);
                        sheet.getRange(linha, 12).setValue(dataAtual);
                        sheet.getRange(linha, 13).setValue("CX 89");
                    }
                    resultado = { success: true, message: "Atualização concluída." };
                    break;
                }
            }
        } else if (qrData.startsWith("CI")) {
            const numCi = qrData.split(" ")[1];
            const termoBusca = `CI ${numCi}-SAJ-${anoAtual}`;
            const valores = sheet.getRange("O:O").getValues();

            for (let i = 0; i < valores.length; i++) {
                if (valores[i][0] === termoBusca) {
                    const linha = i + 1;
                    sheet.getRange(linha, 6).setValue(new Date());
                    sheet.getRange(linha, 14).setValue("CX aguardando resposta");
                    resultado = { success: true, message: "Atualização feita com sucesso." };
                    break;
                }
            }
        } else {
            resultado = { success: false, message: "Tipo de documento não reconhecido." };
        }

        return ContentService.createTextOutput(JSON.stringify(resultado))
            .setMimeType(ContentService.MimeType.JSON)
            .setHeader("Access-Control-Allow-Origin", "*")
            .setHeader("Access-Control-Allow-Methods", "POST")
            .setHeader("Access-Control-Allow-Headers", "Content-Type");

    } catch (error) {
        return ContentService.createTextOutput(JSON.stringify({ success: false, message: error.message }))
            .setMimeType(ContentService.MimeType.JSON)
            .setHeader("Access-Control-Allow-Origin", "*")
            .setHeader("Access-Control-Allow-Methods", "POST")
            .setHeader("Access-Control-Allow-Headers", "Content-Type");
    }
}





# 📷 QR Code Scanner with Google Sheets Integration

This project is a simple web application that uses a smartphone or computer camera to scan QR Codes and automatically send the scanned data to a Google Sheets spreadsheet via a Google Apps Script backend.

## 🚀 Features

- Automatic QR Code scanning using the webcam.
- Sends scanned data to a Google Apps Script endpoint via `fetch` (POST method).
- The script updates a Google Sheet depending on the document type:
  - **OF** (official document): updates specific columns.
  - **CI** (internal communication): applies a different update logic.

## 🧩 Project Components

### 1. HTML + JS (Web Interface)

- Uses the `@zxing/library` for QR Code scanning.
- Sends scanned content via a `fetch` request to the Apps Script endpoint.

```html
<!-- Main HTML snippet -->
<video id="video" width="100%" height="auto"></video>
<script src="https://unpkg.com/@zxing/library@latest"></script>
<script>
    // JavaScript code that scans and sends QR data
    fetch("https://script.google.com/macros/s/YOUR_ENDPOINT_HERE/exec", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        mode: 'no-cors',
        body: JSON.stringify({ data: "QR code value" })
    });
</script>








2. Google Apps Script (Backend)
The script below receives the QR data, processes it, and updates the spreadsheet. Make sure to replace the spreadsheet ID with your own and match the column structure and sheet names.

javascript
Copiar
Editar
function doPost(e) {
    try {
        if (!e || !e.postData || !e.postData.contents) throw new Error("Invalid request.");
        const data = JSON.parse(e.postData.contents);
        const qrData = data.data;
        const sheet = SpreadsheetApp.openById('YOUR_SPREADSHEET_ID_HERE').getSheetByName('Atual');
        const currentYear = new Date().getFullYear();
        let result = {};

        if (qrData.startsWith("OF")) {
            const numOficio = qrData.split(" ")[1];
            const searchTerm = `${numOficio}/SAJ/${currentYear}`;
            const values = sheet.getRange("A:A").getValues();

            for (let i = 0; i < values.length; i++) {
                if (values[i][0] === searchTerm) {
                    const row = i + 1;
                    const column6Value = sheet.getRange(row, 6).getValue();

                    if (!column6Value) {
                        sheet.getRange(row, 6).setValue(new Date());
                        sheet.getRange(row, 14).setValue("CX Aguardando protocolo");
                    } else {
                        const today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd/MM/yyyy");
                        sheet.getRange(row, 11).setValue(today);
                        sheet.getRange(row, 12).setValue(today);
                        sheet.getRange(row, 13).setValue("CX 89");
                    }
                    result = { success: true, message: "Update successful." };
                    break;
                }
            }
        } else if (qrData.startsWith("CI")) {
            const numCi = qrData.split(" ")[1];
            const searchTerm = `CI ${numCi}-SAJ-${currentYear}`;
            const values = sheet.getRange("O:O").getValues();

            for (let i = 0; i < values.length; i++) {
                if (values[i][0] === searchTerm) {
                    const row = i + 1;
                    sheet.getRange(row, 6).setValue(new Date());
                    sheet.getRange(row, 14).setValue("CX aguardando resposta");
                    result = { success: true, message: "CI updated." };
                    break;
                }
            }
        } else {
            result = { success: false, message: "Unknown document type." };
        }

        return ContentService.createTextOutput(JSON.stringify(result))
            .setMimeType(ContentService.MimeType.JSON)
            .setHeader("Access-Control-Allow-Origin", "*")
            .setHeader("Access-Control-Allow-Methods", "POST")
            .setHeader("Access-Control-Allow-Headers", "Content-Type");

    } catch (error) {
        return ContentService.createTextOutput(JSON.stringify({ success: false, message: error.message }))
            .setMimeType(ContentService.MimeType.JSON)
            .setHeader("Access-Control-Allow-Origin", "*")
            .setHeader("Access-Control-Allow-Methods", "POST")
            .setHeader("Access-Control-Allow-Headers", "Content-Type");
    }
}
