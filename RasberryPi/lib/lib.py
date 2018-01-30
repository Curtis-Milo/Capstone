import os 
import requests # set up requests on system
from auth import AuthHandler

authManager = AuthHandler()

# TODO: Set up env variables
def sendErrorCode(code):
	host = os.environ['SERVER_IP']
	if not host.startswith('http'):
		host = 'http://' + host

	host = host + ':' + os.environ['SERVER_PORT'] + '/errors'

	auth = authManager.getToken()

	headers = {
		"Authorization": auth['token_type'] + " " + auth['access_token']
	}

	return requests.post(host, headers=headers, data=code)

def reqServerToken():
	host = os.environ['SERVER_IP']
	if not host.startswith('http'):
		host = 'http://' + host

	host = host + ':' + os.environ['SERVER_PORT'] + '/gentoken'

	r = requests.post(host)

	return r.status_code in range(200, 300)




def reqNextOrder():
	host = os.environ['SERVER_IP']
	if not host.startswith('http'):
		host = 'http://' + host

	host = host + ':' + os.environ['SERVER_PORT'] + '/nextOrder'

	auth = authManager.getToken()

	headers = {
		"Authorization": auth['token_type'] + " " + auth['access_token']
	}
	requests.get(host, headers=headers)
	if  r.status_code in range(200, 300):
		return r.json()
	else:
		return None
