CREATE ROLE otususer WITH NOSUPERUSER LOGIN PASSWORD 'otuspwd';
grant otususer to postgres;
CREATE DATABASE postgres OWNER otususer ENCODING 'UTF8';