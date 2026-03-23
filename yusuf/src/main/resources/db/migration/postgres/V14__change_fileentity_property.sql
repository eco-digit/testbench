alter table measuremententity
    rename column project_id to application_id;

alter table measuremententity
    drop constraint jobentity_pkey;

alter table measuremententity
    add constraint jobentity_pkey
        primary key (id);

