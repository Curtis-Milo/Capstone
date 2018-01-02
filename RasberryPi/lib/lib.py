import os 
import requests #set up requests on system

# TODO: Set up env variables
def sendErrorCode(code):
	host = 'http://' + os.environ['SERVER_IP'] + ':' + os.environ['SERVER_PORT'] + '/errors'

	headers = {
		"Authorization": "Bearer " + os.environ['TOKEN']
	}

	return requests.post(host, headers=headers, data=code)
