import requests
import unittest


class TestAPI(unittest.TestCase):
    def test_start(self):
        # ===========================================================================
        print("Testing /api/chathistory endpoint")  # TODO: move to api unittest
        r = requests.get("http://127.0.0.1:5000/api/chathistory").json()
        self.assertEqual(len(r), 2)
        self.assertTrue(isinstance(r, list))

        # ===========================================================================
        print("Testing /api/user endpoint")  # TODO: move to api unittest
        r = requests.get("http://127.0.0.1:5000/api/user").json()
        self.assertEqual(len(r), 1)
        self.assertTrue(isinstance(r, list))

        # ===========================================================================
        print("Testing /api/emotes endpoint")  # TODO: move to api unittest
        r = requests.get("http://127.0.0.1:5000/api/emotes").json()
        self.assertTrue(isinstance(r, dict))

        # ===========================================================================
        # Please append tests for your api endpoints here
