from extensions import db

class SpotifyUser(db.Model):
    __tablename__ = 'spotify_users'

    id = db.Column(db.String(50), primary_key=True)
    display_name = db.Column(db.String(100))
    country = db.Column(db.String(5))
    
    def __repr__(self):
        return f'<SpotifyUser {self.display_name}>'
