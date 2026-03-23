create table INT_LOCK  (
	LOCK_KEY char(36) not null,
	REGION varchar(100) not null,
	CLIENT_ID char(36),
	CREATED_DATE timestamp not null,
	constraint INT_LOCK_PK primary key (LOCK_KEY, REGION)
);

create table INT_METADATA_STORE  (
	METADATA_KEY varchar(255) not null,
	METADATA_VALUE varchar(4000),
	REGION varchar(100) not null,
	constraint INT_METADATA_STORE_PK primary key (METADATA_KEY, REGION)
);