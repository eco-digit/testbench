alter table notificationentity
    rename column jobid to measurementid;

alter table notificationentity
    rename column jobstate to measurementstate;

alter table fileentity
    rename column project_id to application_id;
