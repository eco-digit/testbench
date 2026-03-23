ALTER TABLE fileentity ADD COLUMN defaultfile BOOLEAN DEFAULT FALSE;
CREATE UNIQUE INDEX unique_true_per_application_filetype
    ON fileentity (application_id, filetype)
    WHERE fileentity.defaultfile = TRUE;