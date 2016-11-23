# SPAMT REST API

## Application Diagnostics

### Static data

returns static data about the application platform

```
URL: /app-diag/static
Method: GET
Auth: no
Response OK:
	[
		{ name: 'Node.js Version', value: '7.1.0' },
		{ name: 'NPM Version', value: '4.0.3' },
		{ name: 'OS Type', value: 'Linux' },
		{ name: 'OS Platform', value: 'linux' },
		{ name: 'OS Architecture', value: 'ia32' },
		{ name: 'OS Release', value: '4.4.0-47-generic' },
		{ name: 'CPU Cores', value: 1 }
	]
```

### Dynamic data (websocket)

returns dynamic data about the application platform

```
URL: /app-diag/dynamic
Method: GET
Auth: no
Response OK:
	[
		{ name: 'Free Memory', value: '1024MB' },
		{ name: 'Uptime', value: '1024s' }
	]
```

### Application usage

returns data about the application usage

```
URL: /app-diag/usage
Method: GET
Auth: no
Response OK:
	[
		{ key: 'Users', y: 0 },
		{ key: 'Admins', y: 0 }
	]
```

## Users

### Users list

returns data about the application users, amount of data depends on access privilege

```
URL: /users/list
Method: GET
Auth: no
Response OK:
	[
		{
			id: '0',
			role: 'admin',
			registered: '1479831545025',
			lastLogin: '1479831545025',
			email: 'admin@email.email',
			city: 'city 0',
			country: 'country 0'
		},
		{
			id: '1',
			role: 'user',
			registered: '1479831545494',
			lastLogin: '1479831545494',
			email: 'user1@email.email',
			city: 'city 1',
			country: 'country 1'
		}
	]
```
