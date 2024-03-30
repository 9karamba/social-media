# Social media

Postman collection here: *postman/otus.postman_collection.json*

### Instructions
```sh
git clone https://github.com/9karamba/social-media.git

docker-compose build

docker-compose up -d
```

To fill database with test data:
```sh
docker exec -it [container_id] psql -U otususer -d postgres

\copy "user" (birthdate,city,firstName,secondName) FROM '/data/people.csv' DELIMITER ',' CSV HEADER;
```