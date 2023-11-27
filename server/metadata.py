from mutagen.id3 import ID3, Frames
from mutagen.mp3 import EasyMP3
from mutagen.easyid3 import EasyID3
import requests


class Metadata:
    def __init__(self):
        EasyID3.RegisterTextKey("year", "TYER")

    def add_metadata(self, filename, track_data, album_data, lyrics_data):

        cover = album_data.get("cover_big",
                               album_data.get("cover_medium",
                                              album_data["cover"])
                               )

        audio = ID3(filename)
        audio.clear()
        audio.add(Frames["APIC"](
            encoding=3,
            mime='image/jpeg',
            type=3,
            desc='Cover',
            data=requests.get(
                cover).content
        ))
        if "LYRICS_SYNC_JSON" in lyrics_data:
            audio.add(Frames["SYLT"](
                encoding=3,
                type=1,
                format=2,
                text=[
                    (line['line'], int(line['milliseconds']))
                    for line in lyrics_data["LYRICS_SYNC_JSON"]
                    if 'milliseconds' in line
                ]
            ))
        if "LYRICS_TEXT" in lyrics_data:
            audio.add(Frames["USLT"](
                encoding=3,
                text=lyrics_data["LYRICS_TEXT"]))
        audio.save()

        audio = EasyMP3(filename)
        audio["title"] = track_data["title"]
        audio["album"] = album_data["title"]
        audio["albumartist"] = track_data["artist"]["name"]
        audio["artist"] = ", ".join([contributor["name"]
                                     for contributor in track_data["contributors"]])
        audio["length"] = str(track_data["duration"])
        audio["discnumber"] = str(track_data["disk_number"])
        audio["tracknumber"] = str(track_data["track_position"])
        audio["date"] = track_data["release_date"]
        audio["year"] = album_data["release_date"][:4]
        audio["genre"] = [genre["name"]
                          for genre in album_data["genres"]["data"]]
        audio.save()
