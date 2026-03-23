ALTER TABLE fileentity RENAME COLUMN contenttype TO mimetype;

ALTER TABLE fileentity DROP COLUMN filename;
ALTER TABLE fileentity ADD COLUMN filename VARCHAR(36) UNIQUE;

ALTER TABLE fileentity ADD COLUMN originalfilename VARCHAR(255);
