import unittest
import os
import requests
import json

message = "Hello,\nseems like your requirements.txt is invalid.\nPlease use `pipreqs /path/to/project`\nExpected:\n```"


def get_address():
    path = os.environ.get("GITHUB_EVENT_PATH", False)
    if not path:
        raise Exception("GITHUB_EVENT_PATH not found")

    with open(path, 'r') as c:
        event = json.load(c)

    url = event["pull_request"]["comments_url"]
    if not url:
        raise Exception("API endpoint for adding a comment not found")

    return url


class TestClass(unittest.TestCase):
    def test_start(self):
        with open("requirements.txt") as f:
            requirements = f.readlines()
        requirements = set([x.strip().lower() for x in requirements])
        with open("req.txt") as f:
            req = f.readlines()
        req = set([x.strip().lower() for x in req])

        print(f"Requirements: {requirements}")
        print("\n==============================\n")
        print(f"Req: {req}")

        if req != requirements:
            with open("req.txt") as f:
                expected = f.read()

            url = get_address()
            body = {"body": message + expected + "```"}
            headers = {
                "Authorization": "token " + os.environ["GITHUB_TOKEN"],
                "Content-Type": "application/json"
            }

            print(body)
            print(requests.post(url, json=body, headers=headers).text)

        self.assertEqual(req, requirements)


if __name__ == '__main__':
    unittest.main()
