alter table measuremententity_tags
    rename constraint jobentity_tags_pkey to measuremententity_tags_pkey;

alter table repositoryentity
    rename column project_id to application_id;
