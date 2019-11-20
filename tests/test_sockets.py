import asyncio
import unittest
import time
import requests

import socketio

loop = asyncio.get_event_loop()


class SocketIOConnection:
    def __init__(self):
        self.sio = socketio.AsyncClient()
        self.online_status = False
        self.messages = []
        self.errors = []
        self.status = {}

        async def send_ping():
            await self.sio.emit('ping_from_client')

        @self.sio.event
        async def connect():
            self.online_status = True
            await send_ping()

        @self.sio.event
        async def disconnect():
            self.online_status = False
            await send_ping()

        @self.sio.event
        async def pong_from_server(data):
            await self.sio.sleep(1)
            await send_ping()

        @self.sio.on('error')
        async def on_error(data):
            self.errors.append(data)

        @self.sio.on('status')
        async def on_error(data):
            self.status.update(data)

        @self.sio.on('chat_message')
        async def on_message(data):
            self.messages.append(data)

        loop.run_until_complete(self.connect())

    async def connect(self):
        await self.sio.connect("http://127.0.0.1:5000/")
        # print('my sid is', self.sio.sid)

    def send_message(self, user, message):
        loop.run_until_complete(self.sio.emit('chat_message', {"display_name": user, "message": message}))

    def send_command(self, user, command):
        loop.run_until_complete(self.sio.emit('chat_command', {"display_name": user, "message": command}))

    async def wait(self):
        await self.sio.wait()

    async def sleep(self, seconds=1):
        await self.sio.sleep(seconds)


class TestClass(unittest.TestCase):
    def test_start(self):
        print("Establishing connection")
        sockets = SocketIOConnection()
        print("Testing connection")
        self.assertTrue(sockets.online_status)
        self.assertEqual(sockets.status.get("count", 0), 1)
        self.assertFalse(sockets.status.get("loginmode", True))

        # ===========================================================================
        print("Testing /api/user endpoint")  # TODO: move to api unittest
        r = requests.get("http://127.0.0.1:5000/api/user").json()
        self.assertEqual(len(r), 1)
        self.assertTrue(isinstance(r, list))

        # ===========================================================================
        print("Sending message")
        sockets.send_message("test_user", "test_message")
        loop.run_until_complete(sockets.sleep())
        print("Check received messages")
        self.assertEqual(len(sockets.messages), 1)
        self.assertEqual(len(sockets.errors), 0)
        x = sockets.messages[0]
        y = {"msg_body": "test_message", "content_type": "message"}  # expected
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
        loop.run_until_complete(sockets.sleep())
        self.assertEqual(len(sockets.messages), 1)
        self.assertEqual(len(sockets.errors), 1)
        x = sockets.errors[0]
        y = {"message": "invalid username"}  # expected
        shared_items = {k: x[k] for k in x if k in y and x[k] == y[k]}
        self.assertEqual(shared_items, y)

        # ===========================================================================
        print("Sending message with invalid message")
        sockets.send_message("test_user", "")
        loop.run_until_complete(sockets.sleep())
        self.assertEqual(len(sockets.messages), 1)
        self.assertEqual(len(sockets.errors), 2)
        x = sockets.errors[1]
        y = {"message": "invalid message"}  # expected
        shared_items = {k: x[k] for k in x if k in y and x[k] == y[k]}
        self.assertEqual(shared_items, y)

        # ===========================================================================
        print("Sending message with emoji and test replacement")
        sockets.send_message("test_user", " Shawn abc")
        loop.run_until_complete(sockets.sleep())
        self.assertEqual(len(sockets.messages), 2)
        self.assertEqual(len(sockets.errors), 2)
        self.assertIn("img", sockets.messages[1].get("msg_body", ""))

        # ===========================================================================
        print("Execute test command and test response")
        sockets.send_command("test_user", "/ping")
        loop.run_until_complete(sockets.sleep())
        self.assertEqual(len(sockets.messages), 3)
        self.assertEqual(len(sockets.errors), 2)
        x = sockets.messages[2]
        y = {"system": True, "msg_body": "Pong!"}  # expected
        shared_items = {k: x[k] for k in x if k in y and x[k] == y[k]}
        self.assertEqual(shared_items, y)
        self.assertIn("msg_body", x)

        x = sockets.messages[2].get("author", {})
        y = {"username": "System", "display_name": "System"}  # expected
        shared_items = {k: x[k] for k in x if k in y and x[k] == y[k]}
        self.assertEqual(shared_items, y)
        self.assertIn("avatar", x)
        self.assertIn("chat_color", x)

        # ===========================================================================
        print("Execute invalid command and test response")
        sockets.send_command("test_user", "//ping")
        loop.run_until_complete(sockets.sleep())
        self.assertEqual(len(sockets.messages), 3)
        self.assertEqual(len(sockets.errors), 3)
        x = sockets.errors[2]
        y = {"message": "unknown command"}  # expected
        shared_items = {k: x[k] for k in x if k in y and x[k] == y[k]}
        self.assertEqual(shared_items, y)


if __name__ == '__main__':
    time.sleep(3)
    unittest.main()
