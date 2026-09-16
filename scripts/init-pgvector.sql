-- Initialize pgvector extension for vector search
CREATE EXTENSION IF NOT EXISTS vector;

-- Create vector search indexes for listings
DO $$
BEGIN
  PERFORM 1 FROM information_schema.tables
  WHERE table_name = 'listings_images';

  IF FOUND THEN
    CREATE INDEX IF NOT EXISTS idx_listings_images_vector
    ON listings_images USING ivfflat (image_vector vector_cosine_ops)
    WITH (lists = 100);
  END IF;
END $$;

-- Create vector search for search queries
DO $$
BEGIN
  PERFORM 1 FROM information_schema.tables
  WHERE table_name = 'search_queries';

  IF FOUND THEN
    CREATE INDEX IF NOT EXISTS idx_search_queries_vector
    ON search_queries USING ivfflat (query_vector vector_cosine_ops)
    WITH (lists = 100);
  END IF;
END $$;
