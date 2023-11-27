import requests
import json


class Youtube:
    def search(self, query):
        response = requests.get(f"https://youtube.com/search?q={query}")

        initialData = json.loads(response.text.split("var ytInitialData = ")[
            1].split(";</script>")[0])

        videos = initialData["contents"]["twoColumnSearchResultsRenderer"]["primaryContents"][
            "sectionListRenderer"]["contents"][0]["itemSectionRenderer"]["contents"]

        data = [self.parse_video_renderer(
            video["videoRenderer"]) for video in videos if "videoRenderer" in video]

        return {
            "data": data
        }

    def parse_video_renderer(self, data):
        video_id = data["videoId"]
        thumbnail = data["thumbnail"]["thumbnails"][0]["url"]
        title = data["title"]["runs"][-1]["text"]
        owner = data["ownerText"]["runs"][0]["text"]
        owner_id = data["ownerText"]["runs"][0]["navigationEndpoint"]["browseEndpoint"]["browseId"]

        return {
            "video_id": video_id,
            "thumbnail": thumbnail,
            "title": title,
            "owner": owner,
            "owner_id": owner_id
        }
