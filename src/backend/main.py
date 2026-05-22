from flask import Flask

app = Flask(__name__)


@app.route("/")
def hello_world():
    return "<p>Hello, World! afgsahf9awitgòo</p>"


@app.post("/register")
def register():
    return {"success": True}


if __name__ == "__main__":
    app.run("0.0.0.0", 5000, debug=True)
