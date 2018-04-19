import os 
import requests # set up requests on system

# TODO: Set up env variables
def sendErrorCode(d, code):
	if not d['access_token'] or not d['token_type']:
		reqServerToken()
		return None

	host = os.environ['SERVER_IP']
	if not host.startswith('http'):
		host = 'http://' + host

	host = host + ':' + os.environ['SERVER_PORT'] + '/errors'

	headers = {
		"Authorization": d['token_type'] + " " + d['access_token']
	}

	return requests.post(host, headers=headers, data=code)

def reqServerToken():
	host = os.environ['SERVER_IP']
	if not host.startswith('http'):
		host = 'http://' + host

	host = host + ':' + os.environ['SERVER_PORT'] + '/gentoken'

	r = requests.post(host)

	return r.status_code in range(200, 300)

def reqNextOrder(d):
	if not d['access_token'] or not d['token_type']:
		reqServerToken()
		return None

	host = os.environ['SERVER_IP']
	if not host.startswith('http'):
		host = 'http://' + host

	host = host + ':' + os.environ['SERVER_PORT'] + '/nextOrder'

	headers = {
		"Authorization": d['token_type'] + " " + d['access_token']
	}
	r = requests.get(host, headers=headers)
	if  r.status_code in range(200, 300):
		return r.json()
	else:
		return None


def readInMap(d):
	if not d['access_token'] or not d['token_type']:
		reqServerToken()
		return None

	host = os.environ['SERVER_IP']
	if not host.startswith('http'):
		host = 'http://' + host

	host = host + ':' + os.environ['SERVER_PORT'] + '/map'

	headers = {
		"Authorization": d['token_type'] + " " + d['access_token']
	}
	r = requests.get(host, headers=headers)

	if  r.status_code in range(200, 300):
		file = open("map.txt", 'w')
		file.write(r.content)
		file.close()
	else:
		return None

