from logging import getLogger

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

from config import Config
from entities.base import Base

logger = getLogger(__name__)
_config = Config()


class TimescaleManager:
    def __init__(self, database_url):
        self.engine = create_engine(database_url, pool_recycle=3600)
        self.Session = sessionmaker(bind=self.engine)
        self.session = None

    def initialize_database(self):
        logger.info("Creating database tables if they don't exist")
        Base.metadata.create_all(self.engine)
        self.check_and_create_hypertable()

    def check_and_create_hypertable(self):
        with self.engine.begin() as connection:
            logger.info("Checking for if dataset is hypertable")
            has_hypertable = connection.execute(
                text(
                    "SELECT EXISTS (SELECT 1 FROM timescaledb_information.hypertables) AS is_hypertable;"
                )
            ).scalar()
            if not has_hypertable:
                connection.execute(
                    text("SELECT create_hypertable('data_set', 'timestamp');")
                )
                logger.info("Set dataset table to be hypertable")

    def __enter__(self):
        self.session = self.Session()
        return self.session

    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type is not None:
            logger.error(f"An error occurred. Rolling back session: {exc_val}")
            self.session.rollback()
        else:
            self.session.commit()

        self.session.close()


timescale_manager = TimescaleManager(
    f"postgresql://{_config.services.timescale.user}:"
    f"{_config.services.timescale.password}@"
    f"{_config.services.timescale.host}:"
    f"{_config.services.timescale.port}/"
    f"{_config.services.timescale.database}"
)
