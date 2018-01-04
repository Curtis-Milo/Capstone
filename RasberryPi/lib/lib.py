import os 
import requests # set up requests on system
from lib.auth import AuthHandler

authManager = AuthHandler()

# TODO: Set up env variables
def sendErrorCode(code):
	host = 'http://' + os.environ['SERVER_IP'] + ':' + os.environ['SERVER_PORT'] + '/errors'

	auth = authManager.getToken()

	headers = {
		"Authorization": auth['token_type'] + " " + auth['token']
	}

	return requests.post(host, headers=headers, data=code)
