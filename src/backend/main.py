from flask import Flask
from flask import request
from flask import jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)


@app.route("/")
def hello_world():
    return jsonify({"status": "Server Flask attivo e funzionante"}), 200

@app.route("/register", methods=["POST"])
def CreaUtente():
    data = request.json
    if not data:
        return jsonify({"error": "Payload JSON mancante"}), 400
    telefono = data.get("telefono")
    username = data.get("username")
    password = data.get("password")
    if not username or not password or not telefono:
        return jsonify({"error": "Username e password sono obbligatori"}), 400
    if len(password) < 8:
        return jsonify({"error": "La password deve essere lunga almeno 8 caratteri"}), 400
    risposta = {
        "message": "Utente creato con successo",
        "username": username,
        "telefono": telefono
    }
    return jsonify(risposta), 201

@app.route("/login", methods=["POST"])
def AccediUtente():
    data = request.json
    if not data:
        return jsonify({"error": "Payload JSON mancante"}), 400
    username = data.get("username")
    password = data.get("password")
    if not username or not password:
        return jsonify({"error": "Username e password sono obbligatori"}), 400
    # Da implementare: Verifica delle credenziali dell'utente nel database
    risposta = {
        "message": "Login effettuato con successo",
        "username": username
    }
    return jsonify(risposta), 200

if __name__ == "__main__":
    app.run("0.0.0.0", 5000, debug=True)
