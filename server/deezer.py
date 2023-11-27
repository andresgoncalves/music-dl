import requests


class Deezer:
    def api_url(self, endpoint: str):
        return "https://api.deezer.com/" + endpoint.lstrip("/")

    def search(self, query):
        response = requests.get(self.api_url("/search"), params={"q": query})
        return response.json()

    def artist(self, artist_id):
        response = requests.get(self.api_url(f"/artist/{artist_id}"))
        return response.json()

    def album(self, album_id):
        response = requests.get(self.api_url(f"/album/{album_id}"))
        return response.json()

    def track(self, track_id):
        response = requests.get(self.api_url(f"/track/{track_id}"))
        return response.json()

    def lyrics(self, track_id):
        session = requests.get("https://www.deezer.com/ajax/gw-light.php", params={
            "method": "deezer.getUserData",
            "api_version": "1.0",
            "api_token": "",
            "input": 3,
        })
        api_token = session.json()["results"].get("checkForm")
        response = requests.get("https://www.deezer.com/ajax/gw-light.php", params={
            "method": "song.getLyrics",
            "api_version": "1.0",
            "api_token": api_token,
            "sng_id": track_id
        }, cookies=session.cookies)
        return response.json()
