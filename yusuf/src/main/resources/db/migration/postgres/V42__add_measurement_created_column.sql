alter table measuremententity
    add creation_date timestamp;

alter table measuremententity
    rename column date to last_updated;
