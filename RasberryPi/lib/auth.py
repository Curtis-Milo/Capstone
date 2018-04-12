import os 
import requests # set up requests on system

class Singleton(type):
    def __init__(self, name, bases, dict):
        super(Singleton, self).__init__(name, bases, dict)
        self.instance = None

    def __call__(self, *args, **kw):
        if self.instance is None:
            self.instance = super(Singleton, self).__call__(*args, **kw)

        return self.instance

class AuthHandler(object):
	__metaclass__ = Singleton
	def __init__(self, d):
		self.token = None
		self.token_type = None
		self.d = d

	def setToken(self, auth):
		host = os.environ['SERVER_IP']
		if not host.startswith('http'):
			host = 'http://' + host

		host = host + ':' + os.environ['SERVER_PORT'] + '/checkToken'

		token = auth['access_token']
		token_type = auth['token_type']

		headers = {
			"Authorization": token_type + " " + token
		}

		resp = requests.get(host, headers=headers)

		if resp.status_code not in range(200, 300):
			return False
		
		self.token = token
		self.token_type = token_type

		self.d['access_token'] = self.token
		self.d['token_type'] = self.token_type

		return True

	def getToken(self):
		return {
			"access_token": self.token,
			"token_type": self.token_type
			}

	def isTokenSet(self):
		return self.token != None
