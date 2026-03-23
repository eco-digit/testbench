CREATE TABLE measurement (
                             id SERIAL PRIMARY KEY,
                             node_id VARCHAR(255) NOT NULL,
                             job_id BIGINT NOT NULL
);

CREATE TABLE phase (
                       id SERIAL PRIMARY KEY,
                       start_time TIMESTAMPTZ NOT NULL,
                       end_time TIMESTAMPTZ  NOT NULL,
                       milestone SMALLINT NOT NULL,
                       measurement_id INT,
                       FOREIGN KEY (measurement_id) REFERENCES measurement(id)
);


CREATE TABLE datapoint (
                           id SERIAL PRIMARY KEY,
                           value DOUBLE PRECISION,
                           timestamp TIMESTAMPTZ NOT NULL,
                           measurement_type SMALLINT,
                           measurement_id INT,
                           FOREIGN KEY (measurement_id) REFERENCES measurement(id)
);
