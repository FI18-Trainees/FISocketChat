import asyncio

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
        loop.run_until_complete(self.sleep())

    def send_command(self, user, command):
        loop.run_until_complete(self.sio.emit('chat_command', {"display_name": user, "message": command}))
        loop.run_until_complete(self.sleep())

    async def wait(self):
        await self.sio.wait()

    async def sleep(self, seconds=1):
        await self.sio.sleep(seconds)
