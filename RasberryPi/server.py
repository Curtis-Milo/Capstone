from BaseHTTPServer import BaseHTTPRequestHandler, HTTPServer
import json
import threading
from lib.auth import AuthHandler
from lib.lib import reqServerToken

authManager = AuthHandler()

class Handler(BaseHTTPRequestHandler):
    def _set_headers(self, code=200):
        self.send_response(code)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        
    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        postJson = json.loads(post_data)
        if authManager.setToken(postJson):
            self._set_headers()
        else:
            self._set_headers(code=401)
        

def startServer(port=80, address=''):
    server_address = (address, port)
    httpd = HTTPServer(server_address, Handler)
    
    t = threading.Thread(target=httpd.serve_forever)
    t.start()

    reqServerToken()
    