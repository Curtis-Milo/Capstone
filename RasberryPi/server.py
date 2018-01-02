from BaseHTTPServer import BaseHTTPRequestHandler, HTTPServer
import json
from lib.auth import AuthHandler

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
        
PORT = 80
server_address = ('', PORT)
httpd = HTTPServer(server_address, Handler)
httpd.serve_forever()
