-- Add 'paused' status to listing_status enum
ALTER TYPE listing_status ADD VALUE 'paused' BEFORE 'expired';
