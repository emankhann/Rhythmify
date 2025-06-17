from flask_cors import CORS
from models import SpotifyUser
from extensions import db
from flask_sqlalchemy import SQLAlchemy
from flask import Flask, redirect, request, session, jsonify
import requests
import base64
from urllib.parse import urlencode

app = Flask(__name__)
app.secret_key = 'j48fj94fj948jf9j39fj39fj93jf93fj'  # Anything random and secret
CORS(app)

# Load database config from config.py
app.config.from_pyfile('config.py')
from models import SpotifyUser

db.init_app(app)

# Replace these with your real Spotify App credentials
CLIENT_ID = '5e303bc2d686406fbf3cb59203584ce5'
CLIENT_SECRET = 'c26b422307c7416a9c596ea423d79cf6'
REDIRECT_URI = 'http://127.0.0.1:5000/callback'

# Spotify URLs
SPOTIFY_AUTH_URL = 'https://accounts.spotify.com/authorize'
SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token'

# Scopes decide what your app can do
SCOPE = 'streaming user-read-email user-read-private user-modify-playback-state user-read-playback-state user-read-recently-played'

@app.route('/')
def home():
    print("Home route accessed")
    return "Hello from Flask!"

@app.route('/login')
def login():
    scopes = 'user-read-email streaming user-read-private user-modify-playback-state user-read-playback-state playlist-read-private playlist-read-collaborative'
    auth_url = (
        'https://accounts.spotify.com/authorize?'
        + urlencode({
            'response_type': 'code',
            'client_id': CLIENT_ID,
            'scope': scopes,
            'redirect_uri': REDIRECT_URI,
            'show_dialog': 'true'
        })
    )
    return redirect(auth_url)

from flask import redirect, request
from models import SpotifyUser
from extensions import db

@app.route('/callback')
def callback():
    try:
        code = request.args.get('code')
        if not code:
            return "No code provided", 400

        # Token exchange
        auth_str = f"{CLIENT_ID}:{CLIENT_SECRET}"
        b64_auth_str = base64.b64encode(auth_str.encode()).decode()
        
        headers = {
            'Authorization': f'Basic {b64_auth_str}',
            'Content-Type': 'application/x-www-form-urlencoded'
        }
        
        data = {
            'grant_type': 'authorization_code',
            'code': code,
            'redirect_uri': REDIRECT_URI
        }

        token_response = requests.post(SPOTIFY_TOKEN_URL, headers=headers, data=data)
        token_response.raise_for_status()
        tokens = token_response.json()

        # Get user data
        user_headers = {'Authorization': f'Bearer {tokens["access_token"]}'}
        user_response = requests.get('https://api.spotify.com/v1/me', headers=user_headers)
        user_response.raise_for_status()
        user_data = user_response.json()

        # Validate required fields
        user_id = user_data.get('id')
        if not user_id:
            return "Invalid user data from Spotify: Missing ID", 400

        # Set default values for optional fields
        display_name = user_data.get('display_name', 'Unknown')
        country = user_data.get('country', 'XX')  # 'XX' = unknown country code

        # Thread-safe user creation
        try:
            existing_user = SpotifyUser.query.get(user_id)
            if not existing_user:
                new_user = SpotifyUser(
                    id=user_id,
                    display_name=display_name,
                    country=country
                )
                db.session.add(new_user)
                db.session.commit()
        except Exception as db_error:
            db.session.rollback()
            # Log the error but continue - don't break auth flow
            print(f"Database error: {str(db_error)}")

        # Redirect with tokens
        # Redirect with tokens
        redirect_url = f"http://localhost:3000/spotify?{urlencode({'access_token': tokens['access_token'], 'refresh_token': tokens['refresh_token']})}"
        return redirect(redirect_url)



    except requests.exceptions.RequestException as e:
        return f"Spotify API error: {str(e)}", 400
    except Exception as e:
        return f"Server error: {str(e)}", 500

@app.route('/refresh_token')
def refresh_token():
    refresh_token = request.args.get('refresh_token')
    if not refresh_token:
        return "Missing refresh token", 400

    auth_str = f"{CLIENT_ID}:{CLIENT_SECRET}"
    b64_auth_str = base64.b64encode(auth_str.encode()).decode()

    headers = {
        'Authorization': f'Basic {b64_auth_str}',
        'Content-Type': 'application/x-www-form-urlencoded'
    }

    data = {
        'grant_type': 'refresh_token',
        'refresh_token': refresh_token,
    }

    response = requests.post(SPOTIFY_TOKEN_URL, headers=headers, data=data)

    if response.status_code != 200:
        return f"Error refreshing token: {response.text}", 400

    tokens = response.json()
    return jsonify(tokens)

if __name__ == '__main__':
    print("Starting Flask app...")

    with app.app_context():
        db.create_all()
        print("✅ Tables created.")

    app.run(debug=True, port=5000)
