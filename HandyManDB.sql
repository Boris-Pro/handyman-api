-- =========================
-- USER
-- =========================
CREATE TABLE "User" (
    user_id     BIGSERIAL PRIMARY KEY,
    first_name  VARCHAR(100) NOT NULL,
    last_name   VARCHAR(100) NOT NULL,
    email       VARCHAR(255) NOT NULL UNIQUE,
    password    TEXT NOT NULL
);

-- =========================
-- USER PROFILE IMAGE
-- =========================
CREATE TABLE UserProfileImage (
    user_id         BIGINT PRIMARY KEY,
    profile_img_url TEXT NOT NULL,
    uploaded_at     TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_userprofileimage_user
        FOREIGN KEY (user_id)
        REFERENCES "User"(user_id)
        ON DELETE CASCADE
);

-- =========================
-- USER PHONE NUMBER
-- =========================
CREATE TABLE UserPhoneNumber (
    phone_id     BIGSERIAL PRIMARY KEY,
    user_id      BIGINT NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    is_primary   BOOLEAN DEFAULT FALSE,
    is_verified  BOOLEAN DEFAULT FALSE,
    added_at     TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_userphone_user
        FOREIGN KEY (user_id)
        REFERENCES "User"(user_id)
        ON DELETE CASCADE,

    CONSTRAINT uq_phone_number
        UNIQUE (phone_number)
);

-- =========================
-- SKILL
-- =========================
CREATE TABLE Skill (
    skill_id    BIGSERIAL PRIMARY KEY,
    skill_name  VARCHAR(100) NOT NULL UNIQUE
);

-- =========================
-- HANDYMAN (User ↔ Skill)
-- =========================
CREATE TABLE Handyman (
    user_id     BIGINT NOT NULL,
    skill_id    BIGINT NOT NULL,
    experience  INT NOT NULL CHECK (experience >= 0),

    PRIMARY KEY (user_id, skill_id),

    CONSTRAINT fk_handyman_user
        FOREIGN KEY (user_id)
        REFERENCES "User"(user_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_handyman_skill
        FOREIGN KEY (skill_id)
        REFERENCES Skill(skill_id)
        ON DELETE CASCADE
);

-- =========================
-- WORK
-- =========================
CREATE TABLE Work (
    work_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title   VARCHAR(255) NOT NULL,

    CONSTRAINT fk_work_user
        FOREIGN KEY (user_id)
        REFERENCES "User"(user_id)
        ON DELETE CASCADE
);

-- =========================
-- WORK IMAGE
-- =========================
CREATE TABLE WorkImage (
    work_id       BIGINT NOT NULL,
    work_img_url  TEXT NOT NULL,

    PRIMARY KEY (work_id, work_img_url),

    CONSTRAINT fk_workimage_work
        FOREIGN KEY (work_id)
        REFERENCES Work(work_id)
        ON DELETE CASCADE
);

-- =========================
-- USER REVIEW (User → User)
-- =========================
CREATE TABLE UserReview (
    review_id    BIGSERIAL PRIMARY KEY,
    reviewer_id  BIGINT NOT NULL,
    reviewee_id  BIGINT NOT NULL,
    review_text  TEXT NOT NULL,
    created_at   TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_userreview_reviewer
        FOREIGN KEY (reviewer_id)
        REFERENCES "User"(user_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_userreview_reviewee
        FOREIGN KEY (reviewee_id)
        REFERENCES "User"(user_id)
        ON DELETE CASCADE,

    CONSTRAINT chk_userreview_no_self
        CHECK (reviewer_id <> reviewee_id),

    CONSTRAINT uq_userreview_once
        UNIQUE (reviewer_id, reviewee_id)
);

-- =========================
-- WORK REVIEW
-- =========================
CREATE TABLE WorkReview (
    review_id    BIGSERIAL PRIMARY KEY,
    reviewer_id  BIGINT NOT NULL,
    work_id      BIGINT NOT NULL,
    rating       SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    review_text  TEXT NOT NULL,
    created_at   TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_workreview_reviewer
        FOREIGN KEY (reviewer_id)
        REFERENCES "User"(user_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_workreview_work
        FOREIGN KEY (work_id)
        REFERENCES Work(work_id)
        ON DELETE CASCADE,

    CONSTRAINT uq_workreview_once
        UNIQUE (reviewer_id, work_id)
);