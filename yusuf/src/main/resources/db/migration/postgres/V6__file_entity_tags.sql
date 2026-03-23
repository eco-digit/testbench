CREATE TABLE fileentity_tags(
    fileentity_id bigint,
    name varchar(1024),
    PRIMARY KEY(fileentity_id, name)
);