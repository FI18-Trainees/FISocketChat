import unittest

from test_objs import SocketIOConnection


class TestCommands(unittest.TestCase):
    def ping(self):
        # ===========================================================================
        print("Execute test command and test response")
        self.sockets.send_command("test_user", "/ping")
        self.assertEqual(len(self.sockets.messages), 1)
        self.assertEqual(len(self.sockets.errors), 0)
        x = self.sockets.messages[0]
        y = {"system": True, "content": "Pong!"}  # expected
        shared_items = {k: x[k] for k in x if k in y and x[k] == y[k]}
        self.assertEqual(shared_items, y)
        self.assertIn("content", x)

        x = self.sockets.messages[0].get("author", {})
        y = {"username": "System", "display_name": "System"}  # expected
        shared_items = {k: x[k] for k in x if k in y and x[k] == y[k]}
        self.assertEqual(shared_items, y)
        self.assertIn("avatar", x)
        self.assertIn("chat_color", x)

        # ===========================================================================
        print("Execute invalid command and test response")
        self.sockets.send_command("test_user", "//ping")
        self.assertEqual(len(self.sockets.messages), 1)
        self.assertEqual(len(self.sockets.errors), 1)
        x = self.sockets.errors[0]
        y = {"message": "unknown command"}  # expected
        shared_items = {k: x[k] for k in x if k in y and x[k] == y[k]}
        self.assertEqual(shared_items, y)

    # Implement unittest for new commands as above

    def test_start(self):
        print("Establishing connection")
        self.sockets = SocketIOConnection()
        print("Testing connection")
        self.assertTrue(self.sockets.online_status)
        self.assertFalse(self.sockets.status.get("loginmode", True))

        # ===========================================================================
        self.ping()
