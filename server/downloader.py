import os
from yt_dlp import YoutubeDL


class Downloader:
    def __init__(self, path: str):
        self.path = path
        self.ytdl_opts = {
            'format': 'bestaudio/best',
            'postprocessors': [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'mp3',
                'preferredquality': '192',
            }],
            'outtmpl': f'{path}/%(id)s.%(ext)s'
        }

    def download(self, id: str):

        filename = os.path.join(self.path, id + ".mp3")

        if os.path.isfile(filename):
            return filename

        error = False

        def progress_hook(info):
            nonlocal error
            if info["status"] == "finished":
                error = False
            elif info["status"] == "error":
                error = True

        with YoutubeDL({**self.ytdl_opts, "progress_hooks": [progress_hook]}) as ytdl:
            ytdl.download([f"https://youtube.com/watch?v={id}"])

        if error:
            return None
        return filename
