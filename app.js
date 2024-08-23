const codeReader = new ZXing.BrowserQRCodeReader();
const videoInput = document.querySelector('video');
const resultContainer = document.querySelector('#result');

// Função para inicializar o leitor de QR Code
function initializeReader() {
    codeReader.listVideoInputDevices().then(videoInputDevices => {
        const firstDeviceId = videoInputDevices.find(device => !device.label.toLowerCase().includes('front'))?.deviceId
            || videoInputDevices[0].deviceId;
        
        codeReader.decodeFromVideoDevice(firstDeviceId, videoInput, (result, error) => {
            if (result) {
                handleQRResult(result.text);
            }
            if (error) {
                console.error(error);
            }
        });
    });
}

// Função para lidar com o resultado do QR Code
function handleQRResult(qrText) {
    const [identifier, number] = qrText.split(' ');
    let searchString = '';
    let columnIndex = 0;

    const now = new Date();
    const year = now.getFullYear();

    if (identifier === 'OF') {
        searchString = `${number}/SAJ/${year}`;
        columnIndex = 0; // Índice da coluna "Ofício" (começa de 0)
    } else if (identifier === 'CI') {
        searchString = `${identifier} ${number}-SAJ-${year}`;
        columnIndex = 13; // Índice da coluna "Observação" (começa de 0)
    } else {
        resultContainer.textContent = 'Identificador desconhecido.';
        return;
    }

    // Atualizar a planilha do Google
    updateGoogleSheet(searchString, columnIndex);
}

// Função para atualizar a planilha do Google
function updateGoogleSheet(searchString, columnIndex) {
    const apiKey = 'AIzaSyD8BjrZwR13tlF2AGr0Kjcf2g3IkfN2mfU'; // Sua chave API
    const sheetId = '16_zlC5bRdyGTqFcVFvRIBCYzP-fjoPN9i64tD5DGe5c'; // ID da sua planilha
    const range = 'Atual'; // Nome da aba que será atualizada

    fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`)
        .then(response => response.json())
        .then(data => {
            const rows = data.values;
            const rowIndex = rows.findIndex(row => row[columnIndex] === searchString);

            if (rowIndex !== -1) {
                const row = rows[rowIndex];
                row[5] = new Date().toLocaleDateString('pt-BR'); // Atualiza a coluna "Descida Assinatura"
                row[12] = 'CX Aguardando protocolo'; // Atualiza a coluna "Caixa/Pasta"

                fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}!A${rowIndex + 2}?valueInputOption=RAW&key=${apiKey}`, {
                    method: 'PUT',
                    body: JSON.stringify({
                        range: `${range}!A${rowIndex + 2}`,
                        majorDimension: 'ROWS',
                        values: [row]
                    }),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                .then(response => response.json())
                .then(data => {
                    resultContainer.textContent = 'Dados atualizados com sucesso!';
                })
                .catch(error => {
                    console.error('Erro ao atualizar os dados:', error);
                    resultContainer.textContent = 'Erro ao atualizar os dados.';
                });
            } else {
                resultContainer.textContent = 'Dados não encontrados.';
            }
        })
        .catch(error => {
            console.error('Erro ao buscar dados:', error);
            resultContainer.textContent = 'Erro ao buscar dados.';
        });
}

// Inicia o leitor de QR Code
initializeReader();
