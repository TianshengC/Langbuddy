CREATE DATABASE "langbuddy";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


CREATE TABLE Users (
    id_user UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_email VARCHAR(40) NOT NULL UNIQUE CHECK (user_email LIKE '%@%'),
    password_hash VARCHAR(60) NOT NULL,
    created_date TIMESTAMP NOT NULL,
    updated_date TIMESTAMP,
    last_login TIMESTAMP,
    current_login TIMESTAMP,
    mother_language VARCHAR(20) NOT NULL
    username VARCHAR(40) NOT NULL;
);

CREATE TABLE Study_Items (
    id_study SERIAL PRIMARY KEY,
    id_user UUID NOT NULL REFERENCES Users(id_user) ON DELETE CASCADE,
    category VARCHAR(20) NOT NULL CHECK (category IN ('Vocabulary', 'Reading', 'Listening', 'Conversation', 'Writing', 'Culture', 'Other')),
    title VARCHAR(50) NOT NULL,
    content VARCHAR(2000),
    created_date TIMESTAMP NOT NULL,
    scheduled_date DATE NOT NULL,
    finished_date DATE,
    status VARCHAR(20) NOT NULL CHECK (status IN ('Scheduled', 'Finished', 'Canceled'))
);

CREATE TABLE Review_Items (
    id_review SERIAL PRIMARY KEY,
    id_user UUID NOT NULL REFERENCES Users(id_user) ON DELETE CASCADE,
    category VARCHAR(20) NOT NULL CHECK (category IN ('Vocabulary', 'Reading', 'Listening', 'Conversation', 'Writing', 'Culture', 'Other')),
    title VARCHAR(50) NOT NULL,
    content VARCHAR(2000),
    created_date TIMESTAMP NOT NULL
);

CREATE TABLE Review_Sessions (
    id_session SERIAL PRIMARY KEY,
    id_review INTEGER NOT NULL REFERENCES Review_Items(id_review) ON DELETE CASCADE,
    created_date TIMESTAMP NOT NULL,
    scheduled_date DATE NOT NULL,
    finished_date DATE,
    status VARCHAR(20) NOT NULL CHECK (status IN ('Scheduled', 'Finished', 'Canceled'))
);

