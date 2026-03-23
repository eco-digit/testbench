alter table measuremententity
    drop constraint measuremententity_fileid_fk;

alter table measuremententity
    add constraint measuremententity_fileid_fk
        foreign key (application_variant_id) references fileentity;
