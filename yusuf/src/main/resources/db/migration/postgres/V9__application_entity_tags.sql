CREATE TABLE applicationentity_tags(
    applicationentity_id bigint,
    name varchar(1024),
    PRIMARY KEY(applicationentity_id, name)
);
