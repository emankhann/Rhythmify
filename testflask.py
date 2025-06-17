import flask
print("Flask is loading from:", flask.__file__)

from flask import Flask

app = Flask(__name__)

@app.before_first_request
def before_first():
    print("Before first request")

@app.route('/')
def home():
    return "Hello!"

if __name__ == "__main__":
    app.run()
