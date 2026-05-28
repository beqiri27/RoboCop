from flask import Flask
from flask import request
from flask import jsonify
from flask_cors import CORS
import pymysql
from datetime import datetime

app = Flask(__name__)
CORS(app)

# ===== CONFIGURAZIONE DATABASE =====
DB_CONFIG = {
    "host": "localhost",
    "user": "root",           # Cambia con il tuo utente MySQL
    "password": "",           # Cambia con la tua password MySQL
    "database": "robocop",    # Cambia con il nome del tuo DB
    "charset": "utf8mb4"
}

# Funzione per connettersi al database
def connessione_db():
    """Stabilisce la connessione al database MySQL"""
    try:
        connection = pymysql.connect(**DB_CONFIG)
        return connection
    except pymysql.Error as e:
        print(f"Errore connessione DB: {e}")
        return None


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
    
    # Connessione al database
    connection = connessione_db()
    if not connection:
        return jsonify({"error": "Errore connessione database"}), 500
    
    try:
        cursor = connection.cursor()
        
        # Controlla se l'utente esiste già
        query_check = "SELECT * FROM utente WHERE username = %s"
        cursor.execute(query_check, (username,))
        if cursor.fetchone():
            return jsonify({"error": "Username già esistente"}), 400
        
        # Inserisci il nuovo utente (⚠️ TODO: hashare la password!)
        query_insert = "INSERT INTO utente (username, password, telefono) VALUES (%s, %s, %s)"
        cursor.execute(query_insert, (username, password, telefono))
        connection.commit()
        
        risposta = {
            "message": "Utente creato con successo",
            "username": username,
            "telefono": telefono
        }
        return jsonify(risposta), 201
    
    except pymysql.Error as e:
        connection.rollback()
        return jsonify({"error": f"Errore database: {str(e)}"}), 500
    finally:
        cursor.close()
        connection.close()

@app.route("/login", methods=["POST"])
def AccediUtente():
    data = request.json
    if not data:
        return jsonify({"error": "Payload JSON mancante"}), 400
    username = data.get("username")
    password = data.get("password")
    if not username or not password:
        return jsonify({"error": "Username e password sono obbligatori"}), 400
    
    # Connessione al database
    connection = connessione_db()
    if not connection:
        return jsonify({"error": "Errore connessione database"}), 500
    
    try:
        cursor = connection.cursor()
        
        # Cerca l'utente nel database
        query = "SELECT id, username, ruolo FROM utente WHERE username = %s AND password = %s"
        cursor.execute(query, (username, password))
        utente = cursor.fetchone()
        
        if not utente:
            return jsonify({"error": "Username o password non corretti"}), 401
        
        # Login riuscito
        risposta = {
            "message": "Login effettuato con successo",
            "id": utente[0],
            "username": utente[1],
            "ruolo": utente[2]
        }
        return jsonify(risposta), 200
    
    except pymysql.Error as e:
        return jsonify({"error": f"Errore database: {str(e)}"}), 500
    finally:
        cursor.close()
        connection.close()

# ===== ENDPOINT SEGNALAZIONI =====

@app.route("/segnalazione", methods=["POST"])
def CreaSegnalazione():
    """Crea una nuova segnalazione nel database"""
    data = request.json
    if not data:
        return jsonify({"error": "Payload JSON mancante"}), 400
    
    # Estrai i dati
    id_utente = data.get("id_utente")
    nome = data.get("nome")
    descrizione = data.get("descrizione")
    criticita = data.get("criticita")  # 'bassa', 'media', 'alta'
    
    # Validazione
    if not all([id_utente, nome, descrizione, criticita]):
        return jsonify({"error": "Campi obbligatori mancanti"}), 400
    
    if criticita not in ['bassa', 'media', 'alta']:
        return jsonify({"error": "Criticità non valida. Usa: bassa, media, alta"}), 400
    
    # Connessione al database
    connection = connessione_db()
    if not connection:
        return jsonify({"error": "Errore connessione database"}), 500
    
    try:
        cursor = connection.cursor()
        
        # Verifica che l'utente esista
        query_check = "SELECT id FROM utente WHERE id = %s"
        cursor.execute(query_check, (id_utente,))
        if not cursor.fetchone():
            return jsonify({"error": "Utente non trovato"}), 404
        
        # Inserisci la segnalazione
        data_creazione = datetime.now().date()
        query_insert = """
            INSERT INTO segnalazione 
            (id_utente, nome, descrizione, data_creazione, criticita) 
            VALUES (%s, %s, %s, %s, %s)
        """
        cursor.execute(query_insert, (
            id_utente, nome, descrizione, data_creazione, criticita
        ))
        connection.commit()
        
        risposta = {
            "message": "Segnalazione creata con successo",
            "id_segnalazione": cursor.lastrowid,
            "nome": nome,
            "criticita": criticita
        }
        return jsonify(risposta), 201
    
    except pymysql.Error as e:
        connection.rollback()
        return jsonify({"error": f"Errore database: {str(e)}"}), 500
    finally:
        cursor.close()
        connection.close()


@app.route("/segnalazioni", methods=["GET"])
def OttieniSegnalazioni():
    """Recupera tutte le segnalazioni dal database"""
    connection = connessione_db()
    if not connection:
        return jsonify({"error": "Errore connessione database"}), 500
    
    try:
        cursor = connection.cursor()
        
        # Recupera tutte le segnalazioni
        query = """
            SELECT s.id, s.nome, s.descrizione, s.data_creazione, 
                   s.criticita, u.username
            FROM segnalazione s
            JOIN utente u ON s.id_utente = u.id
            ORDER BY s.data_creazione DESC
        """
        cursor.execute(query)
        segnalazioni = cursor.fetchall()
        
        lista_segnalazioni = []
        for seg in segnalazioni:
            lista_segnalazioni.append({
                "id": seg[0],
                "nome": seg[1],
                "descrizione": seg[2],
                "data_creazione": str(seg[3]),
                "criticita": seg[4],
                "utente": seg[5]
            })
        
        return jsonify({"segnalazioni": lista_segnalazioni}), 200
    
    except pymysql.Error as e:
        return jsonify({"error": f"Errore database: {str(e)}"}), 500
    finally:
        cursor.close()
        connection.close()


if __name__ == "__main__":
    app.run("0.0.0.0", 5000, debug=True)
