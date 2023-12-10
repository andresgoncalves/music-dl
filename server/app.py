from http import HTTPStatus
from flask import Flask, Response, request, send_file
from flask_cors import CORS
from pathlib import Path
import os
import sys

from deezer import Deezer
from youtube import Youtube
from downloader import Downloader
from metadata import Metadata

downloads_path = Path(__file__).parent.joinpath("./downloads")

app = Flask(__name__)

deezer = Deezer()
youtube = Youtube()
downloader = Downloader(str(downloads_path))
metadata = Metadata()


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def client_index(path):
    fullpath = Path(__file__).parent.joinpath("../client/dist/").joinpath(path)
    if os.path.isfile(fullpath):
        return send_file(fullpath)
    return send_file(Path(__file__).parent.joinpath("../client/dist/index.html"))


@app.route("/api/search")
def api_search():
    query = request.args.get("q")
    if query == None:
        return Response(status=HTTPStatus.BAD_REQUEST)
    return deezer.search(query)


@app.route("/api/videos")
def api_videos():
    query = request.args.get("q")
    if query == None:
        return Response(status=HTTPStatus.BAD_REQUEST)
    return youtube.search(query)


@app.route("/api/artist/<artist_id>")
def api_artist(artist_id):
    return deezer.artist(artist_id)


@app.route("/api/album/<album_id>")
def api_album(album_id):
    return deezer.album(album_id)


@app.route("/api/track/<track_id>")
def api_track(track_id):
    return deezer.track(track_id)


@app.route("/api/lyrics/<track_id>")
def api_lyrics(track_id):
    return deezer.lyrics(track_id)


@app.route("/api/download/<track_id>/<video_id>")
def api_download(track_id, video_id):
    track = deezer.track(track_id)
    album = deezer.album(track["album"]["id"])
    lyrics = deezer.lyrics(track_id)["results"]
    filename = downloader.download(video_id)
    if filename == None:
        return Response(status=HTTPStatus.INTERNAL_SERVER_ERROR)
    if request.method == "GET":
        metadata.add_metadata(filename, track, album, lyrics)
    return send_file(filename, as_attachment=True, download_name=f"{track['title']} - {track['artist']['name']}.mp3")


if __name__ == "__main__":
    CORS(app)

    for path in downloads_path.glob("*"):
        if path.is_file and ("clear-cache" in sys.argv or path.suffix != ".mp3"):
            os.remove(path)
    if "clear-cache" not in sys.argv:
        app.run(host='0.0.0.0', port=int(os.getenv("PORT", "3000")))
