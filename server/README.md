# API Reference
## GET
##### Request position in line for table.

*${HOST}/placeInLine?table_id=${table_id}*

AUTHORIZATION: Bearer token auth, using token generated for table_id.

RETURNS:
```javascript
int // Position in line.
```


##### Request next order in queue.

*${HOST}/nextOrder*

AUTHORIZATION: Bearer token auth, using token generated and passed to robot.

RETURNS:
```javascript
{
	"table_id": "int",
	"order_id": "int",
	"order": [
		{
			"type": "string",
			"size": "char",
			"quantity": "int"
		}
	]
}
```


##### Verify validity of token generated for robot.

*${HOST}/checkToken*

AUTHORIZATION: Bearer token auth, using token generated and passed to robot.

RETURNS:
```javascript
{
	"valid": "boolean"
}
```


## POST
##### Request next order in queue.

*${HOST}/placeOrder?table_id=${table_id}*

AUTHORIZATION: Bearer token auth, using token generated for table_id

BODY: 
```javascript
{
	"order": [
		{
			"type": "string", 	// Name of drink.
			"quantity": "int", 	// Quantity of order (default = 1).
			"size": "char" 		// Size of drink (default = 'M').
		}
	]
}
```

RETURNS:
```javascript
{
	"placeInLine": "int",
	"orderData": {
		"table_id": "int",
		"order_id": "int",
		"order": [
			{
				"type": "string",
				"size": "char",
				"quantity": "int"
			}
		]
	}
}
```


##### Generate and send a token to robot.

*${HOST}/genToken*

AUTHORIZATION: N/A.

BODY:
```javascript
N/A
```

RETURNS:
```javascript
N/A
```
