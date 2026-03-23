Alter table measuremententity
    drop column infrastructure_id,
    drop column usage_scenario_id;

ALTER TABLE measuremententity
    ADD COLUMN infrastructure_id BIGINT,
    ADD COLUMN usage_scenario_id BIGINT;

DROP INDEX IF EXISTS unique_true_per_application_filetype;