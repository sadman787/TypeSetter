# typesetter

## Developing with Docker locally

Install Docker 18.06+ and latest docker-compose. Then you can bring up the stack with:

```
docker-compose pull
docker-compose build
docker-compose run {app,api} npm install
docker-compose up -d
docker-compose logs -f
```

The `api` and `app` folders are volume mounted from your host into the
container, so you can simply edit files on the host and `nodemon` or `webpack`
inside the container see the changes. To install new packages:

```
docker-compose run api npm install --save express
```

You can access mongo express at `localhost:8081`.

### API Authentication

The API uses JWT based authentication. After creating an account, login with:

```
curl -s -X POST -H "Content-Type: application/json" localhost:3000/auth/login -d '{"email":"bob@mail.com", "password":"password"}'
```

If successful, should get `200` and a response like `{ data: { token } }`.
Capture this into a variable using `jq -r '.data.token'`:

```
TOKEN=$(curl -s -X POST -H "Content-Type: application/json" localhost:3000/auth/login -d '{"email":"bob@mail.com", "password":"password"}' | jq -r '.data.token')
```

You can inspect this token (the header, payload, signature) using [jwt.io](https://jwt.io).

Then make an authenticated request:

```
curl -s -H "Authorization: Bearer $TOKEN" localhost:3000/auth/protectedtest
```

Which will either succeed or respond with appropiate error, like `403 jwt expired`.

#### TODOs

- [ ] JWT renewal with each successful request (means client can wait timeout
      after last succesful request before expiring)
- [ ] Incorporate into frontend (essentially, use session storage instead of
      environment variable from curl example)
