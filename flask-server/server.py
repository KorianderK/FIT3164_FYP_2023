from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route("/members")
def members():
    return {"members": ["Aidan", "Amos", "Zafri", "Raveendran"]}

if __name__ == "__main__":
    app.run(debug=True)