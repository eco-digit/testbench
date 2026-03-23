CREATE TABLE jobentity_tags(
    jobentity_id bigint,
    name varchar(1024),
    PRIMARY KEY(jobentity_id, name)
);
