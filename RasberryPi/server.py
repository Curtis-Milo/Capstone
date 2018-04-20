from BaseHTTPServer import BaseHTTPRequestHandler, HTTPServer
import json
from multiprocessing import *
from lib.auth import AuthHandler
from lib.lib import reqServerToken
from urlparse import urlparse

d = Manager().dict()
d['access_token'] = None
d['token_type'] = None

authManager = AuthHandler(d)

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


class SharedMemHttpServer(HTTPServer):
    def __init__(self, server_address, RequestHandlerClass, stop):
        HTTPServer.__init__(self, server_address, RequestHandlerClass)
        self.stop = stop

    def serve_forever(self):
        while not self.stop.value:
            self.handle_request()

class Server(object):
    """Server on robot side"""
    def __init__(self, port=80, address=''):
        super(Server, self).__init__()
        self.stop = Value('i', 1)
        self.server_address = (address, port)
        self.server = SharedMemHttpServer(self.server_address, Handler, self.stop)

    def startServer(self):
        if self.stop.value:
            self.stop.value = 0
            self.p = Process(target=self.server.serve_forever)
            self.p.start()

            reqServerToken()

            return d

        return None

    def stopServer(self):
        if not self.stop.value:
            self.stop.value = 1
            self.p.join()

#if __name__ == '__main__':
#    server = Server()
#    server.startServer()
