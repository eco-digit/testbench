alter table fileentity
    rename to artefactentity;

alter table measuremententity
    rename column file_id to artefact_id;

alter table artefactentity
    rename constraint fileentity_contextentityid_fk to artefactentity_contextentityid_fk;

alter table artefactentity
    rename constraint fileentity_gitentityid_fk to artefactentity_gitentityid_fk;

alter index fileentity_pkey rename to artefactentity_pkey;

alter table measuremententity
    rename constraint measuremententity_fileentityid_fk to measuremententity_artefactentityid_fk;

alter table measuremententity
    drop constraint measuremententity_applicationvariantid_fk;

alter table measuremententity
    drop column application_variant_id;
