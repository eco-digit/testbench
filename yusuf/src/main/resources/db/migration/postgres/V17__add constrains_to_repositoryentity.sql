alter table repositoryentity
    add constraint repositoryentity_pk
        primary key (id);

alter table repositoryentity
    add constraint repositoryentity_applicationId_fk
        foreign key (application_id) references applicationentity ("id");
