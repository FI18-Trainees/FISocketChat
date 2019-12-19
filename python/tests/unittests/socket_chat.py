import unittest

from test_objs import SocketIOConnection


class TestBasicChat(unittest.TestCase):
    def test_start(self):
        print("Establishing connection")
        sockets = SocketIOConnection()
        print("Testing connection")
        self.assertTrue(sockets.online_status)
        self.assertEqual(sockets.status.get("count", 0), 1)
        self.assertFalse(sockets.status.get("loginmode", True))

        # ===========================================================================
        print("Sending message")
        sockets.send_message("test_user", "test_message")
        print("Check received messages")
        self.assertEqual(len(sockets.messages), 1)
        self.assertEqual(len(sockets.errors), 0)
        x = sockets.messages[0]
        y = {"content": "test_message", "content_type": "message"}  # expected
        shared_items = {k: x[k] for k in x if k in y and x[k] == y[k]}
        self.assertEqual(shared_items, y)

        x = sockets.messages[0].get("author", {})
        y = {"username": "test_user", "display_name": "test_user"}  # expected
        shared_items = {k: x[k] for k in x if k in y and x[k] == y[k]}
        self.assertEqual(shared_items, y)
        self.assertIn("avatar", x)
        self.assertIn("chat_color", x)

        # ===========================================================================
        print("Sending message with invalid username")
        sockets.send_message("", "test_message")
        self.assertEqual(len(sockets.messages), 1)
        self.assertEqual(len(sockets.errors), 1)
        x = sockets.errors[0]
        y = {"message": "invalid username"}  # expected
        shared_items = {k: x[k] for k in x if k in y and x[k] == y[k]}
        self.assertEqual(shared_items, y)

        # ===========================================================================
        print("Sending message with invalid message")
        sockets.send_message("test_user", "")
        self.assertEqual(len(sockets.messages), 1)
        self.assertEqual(len(sockets.errors), 2)
        x = sockets.errors[1]
        y = {"message": "invalid message"}  # expected
        shared_items = {k: x[k] for k in x if k in y and x[k] == y[k]}
        self.assertEqual(shared_items, y)

        # ===========================================================================
        print("Sending message with emoji and test replacement")
        sockets.send_message("test_user", " Shawn abc")
        self.assertEqual(len(sockets.messages), 2)
        self.assertEqual(len(sockets.errors), 2)
        self.assertIn("img", sockets.messages[1].get("content", ""))
