--drop constrains
alter table applicationentity
    drop constraint applicationentity_organizationid_fk;

alter table measuremententity
    drop constraint measuremententity_organizationid_fk;
alter table measuremententity
    drop constraint measuremententity_fileid_fk;
alter table measuremententity
    drop constraint fkjplarebp2b79s4cwx2pwhj2ov;

alter table fileentity
    drop constraint fileentity_organizationid_fk;
alter table fileentity
    drop constraint fk2v2hp2ebses4r8u5pxhtuhka7;

--change organizationEntity id type
alter table organizationentity
    drop column id;

alter table organizationentity
    add id uuid;

alter table organizationentity
    add primary key (id);

--change applicationEntity ids type
alter table applicationentity
    drop column id;

alter table applicationentity
    add id uuid;

alter table applicationentity
    add primary key (id);

alter table applicationentity
    drop column organization_id;

alter table applicationentity
    add organization_id uuid;

alter table applicationentity_tags
    drop column applicationentity_id;

alter table applicationentity_tags
    add applicationentity_id uuid;

--change measurementEntity ids type
alter table measuremententity
    drop column id;

alter table measuremententity
    add id uuid;

alter table measuremententity
    add primary key (id);

alter table measuremententity
    drop column organization_id;

alter table measuremententity
    add organization_id uuid;

alter table measuremententity
    drop column application_id;

alter table measuremententity
    add application_id uuid;

alter table measuremententity
    drop column application_variant_id;

alter table measuremententity
    add application_variant_id uuid;

alter table measuremententity_tags
    drop column measuremententity_id;

alter table measuremententity_tags
    add measuremententity_id uuid;

--change fileEntity ids type
alter table fileentity drop column id;

alter table fileentity add id uuid;

alter table fileentity add primary key (id);

alter table fileentity
    drop column application_id;

alter table fileentity
    add application_id uuid;

alter table fileentity
    drop column organization_id;

alter table fileentity
    add organization_id uuid;

alter table fileentity_tags
    drop column fileentity_id;

alter table fileentity_tags
    add fileentity_id uuid;

--change notificationEntity ids type
alter table notificationentity drop column id;

alter table notificationentity add id uuid;

alter table notificationentity add primary key (id);

alter table notificationentity
    drop column measurementid;

alter table notificationentity
    add measurement_id uuid;

--Foreign Key for application
alter table applicationentity
    add constraint applicationEntity_organizationId_fk
        foreign key (organization_id) references organizationentity ("id");

--Foreign Key for measurement
alter table measuremententity
    add constraint measurementEntity_organizationId_fk
        foreign key (organization_id) references organizationentity ("id");

alter table measuremententity
    add constraint measurementEntity_applicationId_fk
        foreign key (application_id) references applicationentity ("id");

alter table measuremententity
    add constraint measurementEntity_applicationVariantId_fk
        foreign key (application_variant_id) references fileentity ("id");

--Foreign Key for file
alter table fileentity
    add constraint fileEntity_applicationId_fk
        foreign key (application_id) references applicationentity ("id");

alter table fileentity
    add constraint fileEntity_organizationId_fk
        foreign key (organization_id) references organizationentity ("id");

--Foreign Key for notification
alter table notificationentity
    add constraint notificationEntity_organizationId_fk
        foreign key (measurement_id) references measuremententity ("id");
