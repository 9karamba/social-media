# Social media

Postman collection here: *postman/otus.postman_collection.json*

### Instructions
1. Run command:
```sh
git clone https://github.com/9karamba/social-media.git

yarn install
```

2. Install postgresql. Example: https://ploshadka.net/ustanovka-i-podkljuchenie-postgresql-na-mac-os/


3. Set .env variable (use yours):
```sh
PG_USER=test
PG_PASS=password
PG_HOST=localhost
PG_DB=postgres
SECRET_KEY=pass
```

4. Finally, run command:
```sh
yarn run dev
```