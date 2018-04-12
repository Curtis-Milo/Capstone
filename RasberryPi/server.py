from BaseHTTPServer import BaseHTTPRequestHandler, HTTPServer
import json
from multiprocessing import *
from lib.auth import AuthHandler
from lib.lib import reqServerToken
from urlparse import urlparse

authManager = None

def _caseInsensitiveKey(obj, key):
    for k in obj:
        if k.lower() == key.lower():
            return obj[k]
    return None

class Handler(BaseHTTPRequestHandler):
    def _set_headers(self, code=200):
        self.send_response(code)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
    def _isAuth(self):
        auth = _caseInsensitiveKey(self.headers, 'Authorization')
        if auth is not None:
            split_auth = auth.split(' ')
            if len(split_auth) > 1:
                return auth[1] == authManager.getToken()['access_token']
        return False
  
    def do_POST(self):
        if urlparse(self.path).path.lower() == '/token':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            postJson = json.loads(post_data)
            if authManager.setToken(postJson):
                self._set_headers()
            else:
                self._set_headers(code=401)
        elif urlparse(self.path).path.lower() == '/return':
            if self._isAuth():
                self._set_headers(code=400)
                # TODO: implement return to base function
            else:
                self._set_headers(code=401)
        else:
            self._set_headers(code=404)


class Server(object):
    """Server on robot side"""
    def __init__(self, d, port=80, address=''):
        super(Server, self).__init__()
        self.server_address = (address, port)
        self.server = HTTPServer(self.server_address, Handler)
        self.running = False
        authManager = AuthHandler(d)

    def startServer(self):
        if not self.running:
            self.running = True
            p = Process(target=self.server.serve_forever)
            p.start()

            reqServerToken()

    def stopServer(self):
        if self.running:
            self.running = False
            self.server.shutdown()

#if __name__ == '__main__':
#    server = Server()
#    server.startServer()
