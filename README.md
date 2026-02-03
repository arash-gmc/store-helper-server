## Open Search Configuration

# Execute the following command to start OpenSearch

docker run -d -p 9200:9200 -p 9600:9600 -e "discovery.type=single-node" \
-e "OPENSEARCH_INITIAL_ADMIN_PASSWORD=${{password}}" opensearchproject/opensearch:3

# Execute the following command to start OpenSearch Dashboards

docker run -d --name osd \
 --network os-net \
 -p 5601:5601 \
 -v ./opensearch_dashboards.yml:/usr/share/opensearch-dashboards/config/opensearch_dashboards.yml \
 opensearchproject/opensearch-dashboards:3

# Mojdeh Book Store

## Changes

```sql
ALTER TABLE mb_store_platform.addresses
ADD COLUMN recipient_data JSON NULL;

```

```sql
ALTER TABLE mb_store_platform.addresses
ADD COLUMN title VARCHAR(126) NULL,
ADD COLUMN is_deleted BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN recipient_name VARCHAR(126) null,
ADD COLUMN recipient_mobile VARCHAR(126) null;

```

```sql
ALTER TABLE mb_store_platform.users
ADD COLUMN username VARCHAR(126) NULL UNIQUE,
ADD COLUMN bio TEXT NULL,
ADD COLUMN visibility JSON NULL;


-- add default value for already existing users
UPDATE mb_store_platform.users
SET username = CONCAT('user_', id)
WHERE username IS NULL;

ALTER TABLE mb_store_platform.users
ALTER COLUMN username SET NOT NULL;

```

```sql
-- create activities table
CREATE TABLE IF NOT EXISTS mb_store_platform.activities (
    id SERIAL PRIMARY KEY,
    type VARCHAR(30) NOT NULL,
    visibility VARCHAR(30) NULL,
    model_name VARCHAR(50) NOT NULL,
    model_id INTEGER NOT NULL,
    publish_date TIMESTAMP NULL,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Set the starting value of the id sequence to 1000 (PostgreSQL)
ALTER SEQUENCE mb_store_platform.activities_id_seq RESTART WITH 1000;
```
