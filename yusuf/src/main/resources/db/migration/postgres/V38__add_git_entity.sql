CREATE TABLE contextentity(
                          id uuid,
                          name varchar(1024),
                          description varchar(1024),
                          application_id uuid,
                          PRIMARY KEY(id),
                              constraint contextEntity_applicationEntityId_fk
                              foreign key (application_id) references applicationentity("id")
);

CREATE TABLE gitentity(
                          id uuid,
                          repositoryName varchar(1024),
                          repositoryLink varchar(1024),
                          accessType varchar(256),
                          accessToken varchar(1024),
                          context_id uuid,
                          PRIMARY KEY(id),
                          constraint gitEntity_contextEntityId_fk
                              foreign key (context_id) references contextentity("id")
);

alter table fileentity
    drop constraint fileentity_applicationid_fk;

alter table fileentity
    drop constraint fileentity_organizationid_fk;

alter table fileentity
    drop column application_id;

alter table fileentity
    drop column organization_id;

alter table fileentity
    add context_id uuid;

alter table fileentity
    add git_id uuid;

alter table fileentity
    add dataSource varchar(256);

alter table fileentity
    add constraint fileEntity_contextEntityId_fk
        foreign key (context_id) references contextentity("id");

alter table fileentity
    add constraint fileEntity_gitEntityId_fk
        foreign key (git_id) references gitentity("id");

alter table measuremententity
    drop constraint measuremententity_applicationid_fk;

alter table measuremententity
    drop constraint measuremententity_organizationid_fk;

alter table measuremententity
    drop column application_id;

alter table measuremententity
    drop column organization_id;

alter table measuremententity
    add file_id uuid;

alter table measuremententity
    add dataSource varchar(256);

alter table measuremententity
     add constraint measuremententity_fileentityId_fk
        foreign key (file_id) references fileentity("id");

alter table notificationentity
    drop column userid;
