#Eu posso excluir esse código sem problemas, já que ele é de outro programa, aqui somente me importa o html.


from flask import Flask, request, jsonify
import gspread
from oauth2client.service_account import ServiceAccountCredentials
from datetime import datetime

app = Flask(__name__)

def authenticate_google_sheets():
    scope = ["https://spreadsheets.google.com/feeds", "https://www.googleapis.com/auth/drive"]
    creds = ServiceAccountCredentials.from_json_keyfile_name("path_to_your_credentials.json", scope)
    client = gspread.authorize(creds)
    return client

@app.route('/update-sheet', methods=['POST'])
def update_sheet():
    try:
        data = request.get_json()
        if not data or 'data' not in data:
            return jsonify({"success": False, "message": "Requisição inválida ou sem dados."})

        qr_data = data['data']
        print(f"Dados do QR Code: {qr_data}")

        client = authenticate_google_sheets()
        sheet = client.open_by_key('16_zlC5bRdyGTqFcVFvRIBCYzP-fjoPN9i64tD5DGe5c').worksheet('Atual')

        ano_atual = datetime.now().year
        resultado = {}

        if qr_data.startswith("OF"):
            num_oficio = qr_data.split(" ")[1]
            termo_busca = f"{num_oficio}/SAJ/{ano_atual}"

            valores = sheet.col_values(1)
            for i, valor in enumerate(valores):
                if valor == termo_busca:
                    linha = i + 1
                    sheet.update_cell(linha, 6, datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
                    sheet.update_cell(linha, 14, "CX Aguardando protocolo")
                    resultado = {"success": True, "message": "Atualização feita com sucesso."}
                    break
            else:
                resultado = {"success": False, "message": "Ofício não encontrado."}

        elif qr_data.startswith("CI"):
            num_ci = qr_data.split(" ")[1]
            termo_busca = f"CI {num_ci}-SAJ-{ano_atual}"

            valores = sheet.col_values(15)  # Coluna O é a 15ª
            for i, valor in enumerate(valores):
                if valor == termo_busca:
                    linha = i + 1
                    sheet.update_cell(linha, 6, datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
                    sheet.update_cell(linha, 14, "CX aguardando resposta")
                    resultado = {"success": True, "message": "Atualização feita com sucesso."}
                    break
            else:
                resultado = {"success": False, "message": "CI não encontrado."}

        else:
            resultado = {"success": False, "message": "Tipo de documento não reconhecido."}

        print(f"Resultado da operação: {resultado}")
        return jsonify(resultado)

    except Exception as e:
        print(f"Erro ao processar a requisição: {str(e)}")
        return jsonify({"success": False, "message": str(e)})

if __name__ == '__main__':
    app.run(debug=True)
