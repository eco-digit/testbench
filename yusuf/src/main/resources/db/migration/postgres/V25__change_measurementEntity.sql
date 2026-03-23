alter table measuremententity
    drop column sut_id;

alter table measuremententity
    drop column infrastructure_id;

alter table measuremententity
    drop column usage_scenario_id;

alter table measuremententity
    add application_variant_id integer;

alter table measuremententity
    add constraint measuremententity_fileId_fk
        foreign key (application_variant_id) references applicationentity ("id");
