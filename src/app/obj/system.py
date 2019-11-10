from flask_socketio import emit

from . import SystemMessage


class System:
    def system_emit(self, message: SystemMessage):  # TODO: use to_json()
        emit('chat_message',
             {
                 'timestamp': datetime.now().strftime("%H:%M:%S"),
                 'display_name': self.display_name,
                 'username': self.username,
                 'user_color': self.user_color,
                 'avatar': self.avatar,
                 'message': message,
                 'system': self.system
             })

    def system_broadcast(self, message: SystemMessage):
        emit('chat_message',
             {
                 'timestamp': datetime.now().strftime("%H:%M:%S"),
                 'display_name': self.display_name,
                 'username': self.username,
                 'user_color': self.user_color,
                 'avatar': self.avatar,
                 'message': message,
                 'system': self.system
             }, broadcast=True)

