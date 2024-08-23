// Configuração para leitura do QR code
const codeReader = new ZXing.BrowserQRCodeReader();
const videoElement = document.getElementById('video');
const resultElement = document.getElementById('result');

// Iniciar a leitura do QR code
codeReader.decodeFromVideoDevice(null, videoElement, (result, error) => {
    if (result) {
        resultElement.textContent = `QR Code Data: ${result.text}`;
        processQRCode(result.text);
    }
    if (error) {
        console.error(error);
    }
});

// Processar o QR code e atualizar a planilha
function processQRCode(qrCodeText) {
    let searchString;
    const currentYear = new Date().getFullYear();

    if (qrCodeText.startsWith('OF')) {
        const parts = qrCodeText.split(' ');
        if (parts.length === 2) {
            const number = parts[1];
            searchString = `${number}/SAJ/${currentYear}`;
            updateGoogleSheet(searchString, 1);
        }
    } else if (qrCodeText.startsWith('CI')) {
        const parts = qrCodeText.split(' ');
        if (parts.length === 2) {
            const number = parts[1];
            searchString = `CI ${number}-SAJ-${currentYear}`;
            updateGoogleSheet(searchString, 13);
        }
    }
}

// Atualizar a planilha Google Sheets
function updateGoogleSheet(searchString, columnIndex) {
    // Autenticação e configuração da API Google Sheets
    gapi.load('auth2', () => {
        gapi.auth2.init({
            client_id: '349400116418-aldrjhmj2nvon58f2gv1601el2u9i2ak.apps.googleusercontent.com'  // Substitua pelo seu Client ID
            scope: 'https://www.googleapis.com/auth/spreadsheets',
        }).then(() => {
            gapi.load('client:auth2', () => {
                gapi.client.init({
                    apiKey: 'AIzaSyD8BjrZwR13tlF2AGr0Kjcf2g3IkfN2mfU',
                    discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
                }).then(() => {
                    const sheets = gapi.client.sheets.spreadsheets.values;
                    sheets.get({
                        spreadsheetId: '16_zlC5bRdyGTqFcVFvRIBCYzP-fjoPN9i64tD5DGe5c',
                        range: 'Atual'
                    }).then(response => {
                        const data = response.result.values;
                        let rowIndex = -1;

                        // Encontrar a linha que contém o valor
                        for (let i = 0; i < data.length; i++) {
                            if (data[i][columnIndex] === searchString) {
                                rowIndex = i;
                                break;
                            }
                        }

                        if (rowIndex !== -1) {
                            const range = `Atual!A${rowIndex + 1}`;
                            const row = data[rowIndex];
                            row[5] = new Date().toLocaleDateString('pt-BR'); // Atualizar "Descida Assinatura"
                            row[12] = 'CX Aguardando protocolo'; // Atualizar "Caixa/Pasta"
                            const body = {
                                values: [row]
                            };
                            sheets.update({
                                spreadsheetId: '16_zlC5bRdyGTqFcVFvRIBCYzP-fjoPN9i64tD5DGe5c',
                                range: range,
                                valueInputOption: 'RAW',
                                resource: body
                            }).then(() => {
                                resultElement.textContent = 'Dados atualizados com sucesso!';
                            }).catch(error => {
                                console.error('Error updating sheet:', error);
                                resultElement.textContent = 'Erro ao atualizar os dados.';
                            });
                        } else {
                            resultElement.textContent = 'Dados não encontrados.';
                        }
                    }).catch(error => {
                        console.error('Error reading sheet:', error);
                        resultElement.textContent = 'Erro ao ler a planilha.';
                    });
                });
            });
        });
    });
}

// Carregar a biblioteca Google API
function start() {
    gapi.load('client:auth2', initClient);
}

function initClient() {
    gapi.client.init({
        apiKey: 'AIzaSyD8BjrZwR13tlF2AGr0Kjcf2g3IkfN2mfU',
        discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4']
    }).then(() => {
        // API client is initialized and ready to use
    });
}
