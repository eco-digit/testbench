alter table jobentity
    rename column jobstate to measurementstate;

alter table jobentity
    rename to measuremententity;

alter table jobentity_tags
    rename column jobentity_id to measuremententity_id;

alter table jobentity_tags
    rename to measuremententity_tags;

