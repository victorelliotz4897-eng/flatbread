-- Flatbread one-time import script
-- Generated from local exports and rankings_rows.csv
BEGIN;

-- Optional wipe (uncomment if you want a full reset before import):
-- TRUNCATE public.rankings RESTART IDENTITY CASCADE;
-- TRUNCATE public.place_hints RESTART IDENTITY CASCADE;
-- TRUNCATE public.places RESTART IDENTITY CASCADE;

INSERT INTO public.places (id, name, date, date_raw, visit_date, address, lat, lng, is_custom, is_closed, host_user_id, ordered_items, updated_at)
SELECT
  id,
  name,
  date,
  date_raw,
  visit_date_text::date,
  address,
  lat,
  lng,
  is_custom,
  is_closed,
  host_user_id,
  ordered_items,
  updated_at_text::timestamptz as updated_at
FROM (VALUES
  ('lake placid::October – November 2020', 'Lake Placid', 'October – November 2020', 'October-November 2020', '2020-10-01', '32 Harbor Ln, Lake Placid, NY 12946', 44.2796, -73.9815, false, false, NULL, NULL, '2026-02-23T00:40:30.240Z'),
  ('jack''s coal fired oven::December 2020', 'Jack''s Coal Fired Oven', 'December 2020', 'December 2020', '2020-12-01', '40 E 89th St, New York, NY 10128', 40.783, -73.9534, false, false, NULL, NULL, '2026-02-23T00:40:30.240Z'),
  ('sauce restaurant::January 2021', 'Sauce Restaurant', 'January 2021', 'January 2021', '2021-01-01', '78 Rivington St, New York, NY 10002', 40.7201, -73.9919, false, false, NULL, NULL, '2026-02-23T00:40:30.240Z'),
  ('lucali::February 2021', 'Lucali', 'February 2021', 'February 2021', '2021-02-01', '575 Henry St, Brooklyn, NY 11231', 40.7022, -73.9997, false, false, NULL, NULL, '2026-02-23T00:40:30.240Z'),
  ('emmy squared (ues)::March 2021', 'Emmy Squared (UES)', 'March 2021', 'March 2021', '2021-03-01', '1426 3rd Ave, New York, NY 10028', 40.7805, -73.954, false, false, NULL, NULL, '2026-02-23T00:40:30.240Z'),
  ('zazzy''s pizza::April 2021', 'Zazzy''s Pizza', 'April 2021', 'April 2021', '2021-04-01', '173 Orchard St, New York, NY 10002', 40.7185, -73.9928, false, false, NULL, NULL, '2026-02-23T00:40:30.240Z'),
  ('roberta''s::May 2021', 'Roberta''s', 'May 2021', 'May 2021', '2021-05-01', '261 Moore St, Brooklyn, NY 11206', 40.702, -73.9444, false, false, NULL, NULL, '2026-02-23T00:40:30.240Z'),
  ('circa brewing co.::June 2021', 'Circa Brewing Co.', 'June 2021', 'June 2021', '2021-06-01', '141 Lawrence St, Brooklyn, NY 11201', 40.6926, -73.9896, false, false, NULL, NULL, '2026-02-23T00:40:30.240Z'),
  ('grimaldi''s pizzeria::July 2021', 'Grimaldi''s Pizzeria', 'July 2021', 'July 2021', '2021-07-01', '1 Front St, Brooklyn, NY 11201', 40.7025, -73.9948, false, false, NULL, NULL, '2026-02-23T00:40:30.240Z'),
  ('beach haus brewery::August 2021', 'Beach Haus Brewery', 'August 2021', 'August 2021', '2021-08-01', '801 Main St, Belmar, NJ 07719', 40.1612, -74.0083, false, false, NULL, NULL, '2026-02-23T00:40:30.240Z'),
  ('ops::September 2021', 'Ops', 'September 2021', 'September 2021', '2021-09-01', '346 Himrod St, Brooklyn, NY 11237', 40.706, -73.9196, false, false, NULL, NULL, '2026-02-23T00:40:30.240Z'),
  ('flatbread company::October 2021', 'Flatbread Company', 'October 2021', 'October 2021', '2021-10-01', '2952 White Mountain Hwy, North Conway, NH 03860', 44.0308, -71.1182, false, false, NULL, NULL, '2026-02-23T00:40:30.240Z'),
  ('joe & pat''s nyc::November 2021', 'Joe & Pat''s NYC', 'November 2021', 'November 2021', '2021-11-01', '1758 Victory Blvd, Staten Island, NY 10314', 40.5984, -74.1618, false, false, NULL, NULL, '2026-02-23T00:40:30.240Z'),
  ('ignazio''s::December 2021', 'Ignazio''s', 'December 2021', 'December 2021', '2021-12-01', '4 Water St, Brooklyn, NY 11201', 40.6986, -73.9938, false, false, NULL, NULL, '2026-02-23T00:40:30.240Z'),
  ('arturo''s coal oven pizza::January 2022', 'Arturo''s Coal Oven Pizza', 'January 2022', 'January 2022', '2022-01-01', '106 W Houston St, New York, NY 10012', 40.7264, -74.0001, false, false, NULL, NULL, '2026-02-23T00:40:30.240Z'),
  ('wheated::February 2022', 'Wheated', 'February 2022', 'February 2022', '2022-02-01', '905 Church Ave, Brooklyn, NY 11218', 40.636, -73.9767, false, false, NULL, NULL, '2026-02-23T00:40:30.240Z'),
  ('john''s of bleecker street::March 2022', 'John''s of Bleecker Street', 'March 2022', 'March 2022', '2022-03-01', '278 Bleecker St, New York, NY 10014', 40.7306, -74.0034, false, false, NULL, NULL, '2026-02-23T00:40:30.240Z'),
  ('emmett''s::April 2022', 'Emmett''s', 'April 2022', 'April 2022', '2022-04-01', '50 MacDougal St, New York, NY 10012', 40.7291, -74.0013, false, false, NULL, NULL, '2026-02-23T00:40:30.240Z'),
  ('dellarocco''s::May 2022', 'Dellarocco''s', 'May 2022', 'May 2022', '2022-05-01', '214 Hicks St, Brooklyn, NY 11201', 40.6921, -73.9934, false, false, NULL, NULL, '2026-02-23T00:40:30.240Z'),
  ('l''industrie pizzeria::June 2022', 'L''Industrie Pizzeria', 'June 2022', 'June 2022', '2022-06-01', '254 S 2nd St, Brooklyn, NY 11211', 40.7101, -73.9654, false, false, NULL, NULL, '2026-02-23T00:40:30.240Z'),
  ('the galley pizza & eatery::July 2022', 'The Galley Pizza & Eatery', 'July 2022', 'July 2022', '2022-07-01', '1313 Memorial Dr, Asbury Park, NJ 07712', 40.2204, -74.0121, false, false, NULL, NULL, '2026-02-23T00:40:30.240Z'),
  ('lombardi''s::August 2022', 'Lombardi''s', 'August 2022', 'August 2022', '2022-08-01', '32 Spring St, New York, NY 10012', 40.7226, -73.9955, false, false, NULL, NULL, '2026-02-23T00:40:30.240Z'),
  ('luigi''s pizza::September 2022', 'Luigi''s Pizza', 'September 2022', 'September 2022', '2022-09-01', '686 5th Ave, Brooklyn, NY 11215', 40.6829, -73.9824, false, false, NULL, NULL, '2026-02-23T00:40:30.240Z'),
  ('giuseppina''s::October 2022', 'Giuseppina''s', 'October 2022', 'October 2022', '2022-10-01', '691 6th Ave, Brooklyn, NY 11215', 40.6654, -73.9764, false, false, NULL, NULL, '2026-02-23T00:40:30.240Z'),
  ('ace''s pizza::November 2022', 'Ace''s Pizza', 'November 2022', 'November 2022', '2022-11-01', '637 Driggs Ave, Brooklyn, NY 11211', 40.7076, -73.9467, false, false, NULL, NULL, '2026-02-23T00:40:30.240Z'),
  ('scarr''s pizza::December 2022', 'Scarr''s Pizza', 'December 2022', 'December 2022', '2022-12-01', '35 Orchard St, New York, NY 10002', 40.7162, -73.993, false, false, NULL, NULL, '2026-02-23T00:40:30.240Z'),
  ('paulie gee''s::January 2023', 'Paulie Gee''s', 'January 2023', 'January 2023', '2023-01-01', '60 Greenpoint Ave, Brooklyn, NY 11222', 40.7303, -73.9556, false, false, NULL, NULL, '2026-02-23T00:40:30.240Z'),
  ('kesté pizza e vino::February 2023', 'Kesté Pizza e Vino', 'February 2023', 'February 2023', '2023-02-01', '77 Fulton St, New York, NY 10038', 40.7102, -74.0064, false, false, NULL, NULL, '2026-02-23T00:40:30.240Z'),
  ('macoletta::March 2023', 'Macoletta', 'March 2023', 'March 2023', '2023-03-01', '28-07 Ditmars Blvd, Astoria, NY 11105', 40.7666, -73.9104, false, false, NULL, NULL, '2026-02-23T00:40:30.240Z'),
  ('leo::April 2023', 'Leo', 'April 2023', 'April 2023', '2023-04-01', '123 Havemeyer St, Brooklyn, NY 11211', 40.7026, -73.9526, false, false, NULL, NULL, '2026-02-23T00:40:30.240Z'),
  ('best pizza::May 2023', 'Best Pizza', 'May 2023', 'May 2023', '2023-05-01', '33 Havemeyer St, Brooklyn, NY 11211', 40.7038, -73.953, false, false, NULL, NULL, '2026-02-23T00:40:30.240Z'),
  ('totonno''s::June 2023', 'Totonno''s', 'June 2023', 'June 2023', '2023-06-01', '1524 Neptune Ave, Brooklyn, NY 11224', 40.5781, -73.9611, false, false, NULL, NULL, '2026-02-23T00:40:30.240Z'),
  ('brooklyn dop::July 2023', 'Brooklyn DOP', 'July 2023', 'July 2023', '2023-07-01', '232 Union St, Brooklyn, NY 11231', 40.6869, -73.9999, false, false, NULL, NULL, '2026-02-23T00:40:30.240Z'),
  ('sea bright pizzeria::August 2023', 'Sea Bright Pizzeria', 'August 2023', 'August 2023', '2023-08-01', '1124 Ocean Ave, Sea Bright, NJ 07760', 40.3647, -74.049, false, false, NULL, NULL, '2026-02-23T00:40:30.240Z'),
  ('biga bite::September 2023', 'Biga Bite', 'September 2023', 'September 2023', '2023-09-01', '1 Clinton St, New York, NY 10002', 40.7147, -73.9935, false, false, NULL, NULL, '2026-02-23T00:40:30.240Z'),
  ('juliana''s::October 2023', 'Juliana''s', 'October 2023', 'October 2023', '2023-10-01', '19 Old Fulton St, Brooklyn, NY 11201', 40.7031, -73.991, false, false, NULL, NULL, '2026-02-23T00:40:30.240Z'),
  ('mama''s too!::November 2023', 'Mama''s TOO!', 'November 2023', 'November 2023', '2023-11-01', '2750 Broadway, New York, NY 10025', 40.799, -73.9686, false, false, NULL, NULL, '2026-02-23T00:40:30.240Z'),
  ('unregular pizza::December 2023', 'Unregular Pizza', 'December 2023', 'December 2023', '2023-12-01', '135 4th Ave, New York, NY 10003', 40.7317, -73.9914, false, false, NULL, NULL, '2026-02-23T00:40:30.240Z'),
  ('little charli::January 2024', 'Little Charli', 'January 2024', 'January 2024', '2024-01-01', '271 Bleecker St, New York, NY 10014', 40.7299, -73.9993, false, false, NULL, NULL, '2026-02-23T00:40:30.240Z'),
  ('emily::February 2024', 'Emily', 'February 2024', 'February 2024', '2024-02-01', '919 Fulton St, Brooklyn, NY 11238', 40.6841, -73.9669, false, false, NULL, NULL, '2026-02-23T00:40:30.240Z'),
  ('la rose pizza::March 2024', 'La Rose Pizza', 'March 2024', 'March 2024', '2024-03-01', '374 Metropolitan Ave, Brooklyn, NY 11211', 40.7148, -73.9521, false, false, NULL, NULL, '2026-02-23T00:40:30.240Z'),
  ('see no evil pizza::April 2024', 'See No Evil Pizza', 'April 2024', 'April 2024', '2024-04-01', '42 W 38th St, New York, NY 10018', 40.7528, -73.9851, false, false, NULL, NULL, '2026-02-23T00:40:30.240Z'),
  ('mo''s general::May 2024', 'Mo''s General', 'May 2024', 'May 2024', '2024-05-01', '620 Lorimer St, Brooklyn, NY 11211', 40.7106, -73.9479, false, false, NULL, NULL, '2026-02-23T00:40:30.240Z'),
  ('ribalta::June 2024', 'Ribalta', 'June 2024', 'June 2024', '2024-06-01', '48 E 12th St, New York, NY 10003', 40.7287, -73.992, false, false, NULL, NULL, '2026-02-23T00:40:30.240Z'),
  ('ltd pizza and bar::July 2024', 'LTD Pizza and Bar', 'July 2024', 'July 2024', '2024-07-01', '225 Hudson St, New York, NY 10013', 40.7196, -74.0096, false, false, NULL, NULL, '2026-02-23T00:40:30.240Z'),
  ('cello''s pizzeria::August 2024', 'Cello''s Pizzeria', 'August 2024', 'August 2024', '2024-08-01', '36 St Marks Pl, New York, NY 10003', 40.7287, -73.9851, false, false, NULL, NULL, '2026-02-23T00:40:30.240Z'),
  ('razza::September 2024', 'Razza', 'September 2024', 'September 2024', '2024-09-01', '275 Grove St, Jersey City, NJ 07302', 40.7186, -74.038, false, false, NULL, NULL, '2026-02-23T00:40:30.240Z'),
  ('pasquale jones::October 2024', 'Pasquale Jones', 'October 2024', 'October 2024', '2024-10-01', '187 Mulberry St, New York, NY 10012', 40.722, -73.9954, false, false, NULL, NULL, '2026-02-23T00:40:30.240Z'),
  ('nate''s detroit pizza::November 2024', 'Nate''s Detroit Pizza', 'November 2024', 'November 2024', '2024-11-01', '623 Vanderbilt Ave, Brooklyn, NY 11238', 40.681, -73.9685, false, false, NULL, NULL, '2026-02-23T00:40:30.240Z'),
  ('lazzara''s pizza cafe::December 2024', 'Lazzara''s Pizza Cafe', 'December 2024', 'December 2024', '2024-12-01', '221 W 38th St, New York, NY 10018', 40.7548, -73.9941, false, false, NULL, NULL, '2026-02-23T00:40:30.240Z'),
  ('nolita pizza::January 2025', 'Nolita Pizza', 'January 2025', 'January 2025', '2025-01-01', '6716 Broadway, New York, NY 10001', 40.7712, -73.9811, false, false, NULL, NULL, '2026-02-23T00:40:30.240Z'),
  ('don antonio''s::February 2025', 'Don Antonio''s', 'February 2025', 'February 2025', '2025-02-01', '309 W 50th St, New York, NY 10019', 40.7652, -73.9819, false, false, NULL, NULL, '2026-02-23T00:40:30.240Z'),
  ('ceres::April 2025', 'Ceres', 'April 2025', 'April 2025', '2025-04-01', '164 Mott St, New York, NY 10013', 40.719, -74.0086, false, false, NULL, NULL, '2026-02-23T00:40:30.240Z'),
  ('kid pizza::May 2025', 'Kid Pizza', 'May 2025', 'May 2025', '2025-05-01', '157 W 18th St, New York, NY 10011', 40.742, -74.0011, false, false, NULL, NULL, '2026-02-23T00:40:30.240Z'),
  ('chrissy''s pizza::June 2025', 'Chrissy''s Pizza', 'June 2025', 'June 2025', '2025-06-01', '44 Nassau Ave, Brooklyn, NY 11222', 40.7178, -73.958, false, false, NULL, NULL, '2026-02-23T00:40:30.241Z'),
  ('f&f pizzeria::July 2025', 'F&F Pizzeria', 'July 2025', 'July 2025', '2025-07-01', '459 Court St, Brooklyn, NY 11231', 40.6906, -73.9954, false, false, NULL, NULL, '2026-02-23T00:40:30.241Z'),
  ('decades pizza::August 2025', 'Decades Pizza', 'August 2025', 'August 2025', '2025-08-01', '671 Seneca Ave, Ridgewood, NY 11385', 40.7062, -73.9007, false, false, NULL, NULL, '2026-02-23T00:40:30.241Z'),
  ('serano''s italian::September 2025', 'Serano''s Italian', 'September 2025', 'September 2025', '2025-09-01', '132 W 31st St, New York, NY 10001', 40.7487, -73.9949, false, false, NULL, NULL, '2026-02-23T00:40:30.241Z'),
  ('lucky charlie::October 2025', 'Lucky Charlie', 'October 2025', 'October 2025', '2025-10-01', '638 Dean St, Brooklyn, NY 11238', 40.6834, -73.9796, false, false, NULL, NULL, '2026-02-23T00:40:30.241Z'),
  ('turbo pizza::November 2025', 'Turbo Pizza', 'November 2025', 'November 2025', '2025-11-01', '7 Greene Ave, Brooklyn, NY 11238', 40.6871, -73.985, false, false, NULL, NULL, '2026-02-23T00:40:30.241Z'),
  ('victoria pizzeria::December 2025', 'Victoria Pizzeria', 'December 2025', 'December 2025', '2025-12-01', '2716 Gerritsen Ave, Brooklyn, NY 11229', 40.597, -73.9593, false, false, NULL, NULL, '2026-02-23T00:40:30.241Z'),
  ('andrea''s pizza::January 2026', 'Andrea''s Pizza', 'January 2026', 'January 2026', '2026-01-01', '50 2nd Ave, New York, NY 10003', 40.7287, -73.9893, false, false, NULL, NULL, '2026-02-23T00:40:30.241Z'),
  ('l-b spumoni gardens::March 2025', 'L&B Spumoni Gardens', 'March 2025', 'March 2025', '2025-03-01', '46 Old Fulton Street, Dumbo, Brooklyn, NY 11201', 40.7038, -73.9902, false, false, NULL, NULL, '2026-02-23T00:40:30.241Z'),
  ('fini pizza::February 2026', 'Fini Pizza', 'February 2026', 'February 2026', '2026-02-01', '305 Bedford Ave, Williamsburg, Brooklyn, NY 11211', 40.7145, -73.9622, false, false, NULL, NULL, '2026-02-23T00:40:30.241Z')
) AS t(id, name, date, date_raw, visit_date_text, address, lat, lng, is_custom, is_closed, host_user_id, ordered_items, updated_at_text)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  date = EXCLUDED.date,
  date_raw = EXCLUDED.date_raw,
  visit_date = EXCLUDED.visit_date,
  address = EXCLUDED.address,
  lat = EXCLUDED.lat,
  lng = EXCLUDED.lng,
  is_closed = EXCLUDED.is_closed,
  host_user_id = EXCLUDED.host_user_id,
  ordered_items = EXCLUDED.ordered_items,
  updated_at = now();

-- Update host/closed/order metadata (from latest admin places list).
UPDATE public.places AS p
SET
  host_user_id = m.host_user_id,
  ordered_items = m.ordered_items,
  is_closed = m.is_closed,
  updated_at = now()
FROM (
  VALUES
    ('lake placid::October – November 2020', 'all', 'Pesto Flatbread', false),
    ('jack''s coal fired oven::December 2020', 'jack_dweck', NULL, false),
    ('sauce restaurant::January 2021', 'jack_sasson', 'Regular pies', true),
    ('lucali::February 2021', 'aaron', NULL, false),
    ('emmy squared (ues)::March 2021', 'jack_dweck', NULL, false),
    ('zazzy''s pizza::April 2021', 'jack_sasson', NULL, true),
    ('roberta''s::May 2021', 'aaron', NULL, false),
    ('circa brewing co.::June 2021', 'jack_dweck', NULL, true),
    ('grimaldi''s pizzeria::July 2021', 'jack_sasson', NULL, false),
    ('beach haus brewery::August 2021', 'victor', NULL, false),
    ('ops::September 2021', 'aaron', NULL, false),
    ('flatbread company::October 2021', 'all', NULL, false),
    ('joe & pat''s nyc::November 2021', 'jack_dweck', NULL, false),
    ('ignazio''s::December 2021', 'jack_sasson', NULL, false),
    ('arturo''s coal oven pizza::January 2022', 'victor', NULL, false),
    ('wheated::February 2022', 'aaron', NULL, false),
    ('john''s of bleecker street::March 2022', 'jack_dweck', NULL, false),
    ('emmett''s::April 2022', 'jack_sasson', NULL, false),
    ('dellarocco''s::May 2022', 'victor', NULL, false),
    ('l''industrie pizzeria::June 2022', 'aaron', NULL, false),
    ('the galley pizza & eatery::July 2022', 'jack_dweck', NULL, false),
    ('lombardi''s::August 2022', 'jack_sasson', NULL, false),
    ('luigi''s pizza::September 2022', 'victor', NULL, false),
    ('giuseppina''s::October 2022', 'aaron', NULL, false),
    ('ace''s pizza::November 2022', 'jack_dweck', NULL, false),
    ('scarr''s pizza::December 2022', 'jack_sasson', NULL, false),
    ('paulie gee''s::January 2023', 'victor', NULL, true),
    ('kesté pizza e vino::February 2023', 'aaron', NULL, false),
    ('macoletta::March 2023', 'jack_dweck', NULL, false),
    ('leo::April 2023', 'jack_sasson', NULL, false),
    ('best pizza::May 2023', 'victor', 'Regular pie; Grandma pie', false),
    ('totonno''s::June 2023', 'aaron', 'White pie; Red pie', false),
    ('brooklyn dop::July 2023', 'jack_dweck', 'Regular pie; Regular square', false),
    ('sea bright pizzeria::August 2023', 'jack_sasson', 'Regular pie; Christian pie', false),
    ('biga bite::September 2023', 'victor', NULL, false),
    ('juliana''s::October 2023', 'aaron', NULL, false),
    ('mama''s too!::November 2023', 'jack_dweck', 'Regular; Cacio e Pepe', false),
    ('unregular pizza::December 2023', 'jack_sasson', NULL, false),
    ('little charli::January 2024', 'victor', 'Calzone; Margherita', false),
    ('emily::February 2024', 'aaron', 'The Classic; Famous Original Dans', false),
    ('la rose pizza::March 2024', 'jack_dweck', 'Jane w/ Burrata; Reg Jane', true),
    ('see no evil pizza::April 2024', 'jack_sasson', 'Cheese; Margherita', false),
    ('mo''s general::May 2024', 'victor', 'Cheese; Bar pie', false),
    ('ribalta::June 2024', 'aaron', NULL, false),
    ('ltd pizza and bar::July 2024', 'jack_dweck', 'Margherita; Pesto Vodka square', false),
    ('cello''s pizzeria::August 2024', 'jack_sasson', 'Regular pie; ½ Vodka', false),
    ('razza::September 2024', 'victor', 'Burrata pie; Tomato pie', false),
    ('pasquale jones::October 2024', 'aaron', NULL, false),
    ('nate''s detroit pizza::November 2024', 'jack_dweck', 'Regular pie; Vodka pie', false),
    ('lazzara''s pizza cafe::December 2024', 'jack_sasson', NULL, false),
    ('nolita pizza::January 2025', 'victor', NULL, false),
    ('don antonio''s::February 2025', 'aaron', NULL, false),
    ('l-b spumoni gardens::March 2025', 'jack_dweck', 'Square pie; Round pie', false),
    ('ceres::April 2025', 'jack_sasson', NULL, false),
    ('kid pizza::May 2025', 'victor', 'Plain pie; White pie al limone', true),
    ('chrissy''s pizza::June 2025', 'aaron', 'Regular pie; White pie', false),
    ('f&f pizzeria::July 2025', 'jack_dweck', 'Regular pie; Cacio e Pepe', false),
    ('decades pizza::August 2025', 'jack_sasson', 'Regular; Tomato; Vodka Jim; Gerry''s Sweet & Thin', false),
    ('serano''s italian::September 2025', 'victor', 'Upside down; Regular; Cacio Pepe; Vodka', false),
    ('lucky charlie::October 2025', 'aaron', 'Regular; White; Red', false),
    ('turbo pizza::November 2025', 'jack_dweck', 'Regular; MVP; Burrata; Vodka', false),
    ('victoria pizzeria::December 2025', 'jack_sasson', 'Regular; Vodka; Nonna', false),
    ('andrea''s pizza::January 2026', 'victor', 'Grandma Pie; Classic Pie', false),
    ('fini pizza::February 2026', 'aaron', 'Grandma Pie; White Pie; Classic Pie', false)
) AS m(id, host_user_id, ordered_items, is_closed)
WHERE p.id = m.id;

-- No place-hint rows were inserted (raw hints did not match current places).

-- Upsert rankings snapshots (rankings/pending/undo/session)
INSERT INTO public.rankings (user_id, ranking, pending, undo_stack, session, updated_at) VALUES (
  'aaron',
  '["lucali::February 2021","roberta''s::May 2021","grimaldi''s pizzeria::July 2021","emmy squared (ues)::March 2021","ops::September 2021","lake placid::October – November 2020","circa brewing co.::June 2021","sauce restaurant::January 2021","jack''s coal fired oven::December 2020","beach haus brewery::August 2021","flatbread company::October 2021","zazzy''s pizza::April 2021"]'::jsonb,
  '["joe & pat''s nyc::November 2021","ignazio''s::December 2021","arturo''s coal oven pizza::January 2022","wheated::February 2022","john''s of bleecker street::March 2022","emmett''s::April 2022","dellarocco''s::May 2022","l''industrie pizzeria::June 2022","the galley pizza & eatery::July 2022","lombardi''s::August 2022","luigi''s pizza::September 2022","giuseppina''s::October 2022","ace''s pizza::November 2022","scarr''s pizza::December 2022","paulie gee''s::January 2023","kesté pizza e vino::February 2023","macoletta::March 2023","leo::April 2023","best pizza::May 2023","totonno''s::June 2023","brooklyn dop::July 2023","sea bright pizzeria::August 2023","biga bite::September 2023","juliana''s::October 2023","mama''s too!::November 2023","unregular pizza::December 2023","little charli::January 2024","emily::February 2024","la rose pizza::March 2024","see no evil pizza::April 2024","mo''s general::May 2024","ribalta::June 2024","ltd pizza and bar::July 2024","cello''s pizzeria::August 2024","razza::September 2024","pasquale jones::October 2024","nate''s detroit pizza::November 2024","lazzara''s pizza cafe::December 2024","nolita pizza::January 2025","don antonio''s::February 2025","ceres::April 2025","kid pizza::May 2025","chrissy''s pizza::June 2025","f&f pizzeria::July 2025","decades pizza::August 2025","serano''s italian::September 2025","lucky charlie::October 2025","turbo pizza::November 2025","victoria pizzeria::December 2025","andrea''s pizza::January 2026"]'::jsonb,
  '[]'::jsonb,
  '{"low":0,"mid":3,"high":6,"mode":"insert","undoStack":[],"comparableIds":["lucali::February 2021","roberta''s::May 2021","grimaldi''s pizzeria::July 2021","emmy squared (ues)::March 2021","ops::September 2021","lake placid::October – November 2020","circa brewing co.::June 2021","sauce restaurant::January 2021","jack''s coal fired oven::December 2020","beach haus brewery::August 2021","flatbread company::October 2021","zazzy''s pizza::April 2021"],"currentPlaceId":"joe & pat''s nyc::November 2021"}'::jsonb,
  '2026-02-16 22:35:10.483+00'::timestamptz
) ON CONFLICT (user_id) DO UPDATE SET
  ranking = EXCLUDED.ranking,
  pending = EXCLUDED.pending,
  undo_stack = EXCLUDED.undo_stack,
  session = EXCLUDED.session,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.rankings (user_id, ranking, pending, undo_stack, session, updated_at) VALUES (
  'jack_dweck',
  '["lucali::February 2021","emmy squared (ues)::March 2021","roberta''s::May 2021","grimaldi''s pizzeria::July 2021","circa brewing co.::June 2021","ops::September 2021","zazzy''s pizza::April 2021","lake placid::October – November 2020","jack''s coal fired oven::December 2020","sauce restaurant::January 2021","beach haus brewery::August 2021","flatbread company::October 2021"]'::jsonb,
  '["joe & pat''s nyc::November 2021","ignazio''s::December 2021","arturo''s coal oven pizza::January 2022","wheated::February 2022","john''s of bleecker street::March 2022","emmett''s::April 2022","dellarocco''s::May 2022","l''industrie pizzeria::June 2022","the galley pizza & eatery::July 2022","lombardi''s::August 2022","luigi''s pizza::September 2022","giuseppina''s::October 2022","ace''s pizza::November 2022","scarr''s pizza::December 2022","paulie gee''s::January 2023","kesté pizza e vino::February 2023","macoletta::March 2023","leo::April 2023","best pizza::May 2023","totonno''s::June 2023","brooklyn dop::July 2023","sea bright pizzeria::August 2023","biga bite::September 2023","juliana''s::October 2023","mama''s too!::November 2023","unregular pizza::December 2023","little charli::January 2024","emily::February 2024","la rose pizza::March 2024","see no evil pizza::April 2024","mo''s general::May 2024","ribalta::June 2024","ltd pizza and bar::July 2024","cello''s pizzeria::August 2024","razza::September 2024","pasquale jones::October 2024","nate''s detroit pizza::November 2024","lazzara''s pizza cafe::December 2024","nolita pizza::January 2025","don antonio''s::February 2025","ceres::April 2025","kid pizza::May 2025","chrissy''s pizza::June 2025","f&f pizzeria::July 2025","decades pizza::August 2025","serano''s italian::September 2025","lucky charlie::October 2025","turbo pizza::November 2025","victoria pizzeria::December 2025","andrea''s pizza::January 2026"]'::jsonb,
  '[]'::jsonb,
  '{"low":0,"mid":3,"high":6,"mode":"insert","undoStack":[],"comparableIds":["lucali::February 2021","emmy squared (ues)::March 2021","roberta''s::May 2021","grimaldi''s pizzeria::July 2021","circa brewing co.::June 2021","ops::September 2021","zazzy''s pizza::April 2021","lake placid::October – November 2020","jack''s coal fired oven::December 2020","sauce restaurant::January 2021","beach haus brewery::August 2021","flatbread company::October 2021"],"currentPlaceId":"joe & pat''s nyc::November 2021"}'::jsonb,
  '2026-02-16 22:33:29.183+00'::timestamptz
) ON CONFLICT (user_id) DO UPDATE SET
  ranking = EXCLUDED.ranking,
  pending = EXCLUDED.pending,
  undo_stack = EXCLUDED.undo_stack,
  session = EXCLUDED.session,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.rankings (user_id, ranking, pending, undo_stack, session, updated_at) VALUES (
  'jack_sasson',
  '["grimaldi''s pizzeria::July 2021","emmy squared (ues)::March 2021","ops::September 2021","sauce restaurant::January 2021","zazzy''s pizza::April 2021","lucali::February 2021","roberta''s::May 2021","lake placid::October – November 2020","jack''s coal fired oven::December 2020","circa brewing co.::June 2021","beach haus brewery::August 2021"]'::jsonb,
  '["flatbread company::October 2021","joe & pat''s nyc::November 2021","ignazio''s::December 2021","arturo''s coal oven pizza::January 2022","wheated::February 2022","john''s of bleecker street::March 2022","emmett''s::April 2022","dellarocco''s::May 2022","l''industrie pizzeria::June 2022","the galley pizza & eatery::July 2022","lombardi''s::August 2022","luigi''s pizza::September 2022","giuseppina''s::October 2022","ace''s pizza::November 2022","scarr''s pizza::December 2022","paulie gee''s::January 2023","kesté pizza e vino::February 2023","macoletta::March 2023","leo::April 2023","best pizza::May 2023","totonno''s::June 2023","brooklyn dop::July 2023","sea bright pizzeria::August 2023","biga bite::September 2023","juliana''s::October 2023","mama''s too!::November 2023","unregular pizza::December 2023","little charli::January 2024","emily::February 2024","la rose pizza::March 2024","see no evil pizza::April 2024","mo''s general::May 2024","ribalta::June 2024","ltd pizza and bar::July 2024","cello''s pizzeria::August 2024","razza::September 2024","pasquale jones::October 2024","nate''s detroit pizza::November 2024","lazzara''s pizza cafe::December 2024","nolita pizza::January 2025","don antonio''s::February 2025","ceres::April 2025","kid pizza::May 2025","chrissy''s pizza::June 2025","f&f pizzeria::July 2025","decades pizza::August 2025","serano''s italian::September 2025","lucky charlie::October 2025","turbo pizza::November 2025","victoria pizzeria::December 2025","andrea''s pizza::January 2026"]'::jsonb,
  '[]'::jsonb,
  '{"low":9,"mid":10,"high":11,"mode":"insert","undoStack":[],"comparableIds":["grimaldi''s pizzeria::July 2021","emmy squared (ues)::March 2021","ops::September 2021","sauce restaurant::January 2021","zazzy''s pizza::April 2021","lucali::February 2021","roberta''s::May 2021","lake placid::October – November 2020","jack''s coal fired oven::December 2020","circa brewing co.::June 2021","beach haus brewery::August 2021"],"currentPlaceId":"flatbread company::October 2021"}'::jsonb,
  '2026-02-16 22:30:55.447+00'::timestamptz
) ON CONFLICT (user_id) DO UPDATE SET
  ranking = EXCLUDED.ranking,
  pending = EXCLUDED.pending,
  undo_stack = EXCLUDED.undo_stack,
  session = EXCLUDED.session,
  updated_at = EXCLUDED.updated_at;
INSERT INTO public.rankings (user_id, ranking, pending, undo_stack, session, updated_at) VALUES (
  'victor',
  '["roberta''s::May 2021","emmy squared (ues)::March 2021","circa brewing co.::June 2021","grimaldi''s pizzeria::July 2021","lucali::February 2021","lake placid::October – November 2020","jack''s coal fired oven::December 2020","sauce restaurant::January 2021","ops::September 2021","flatbread company::October 2021","beach haus brewery::August 2021","zazzy''s pizza::April 2021"]'::jsonb,
  '["joe & pat''s nyc::November 2021","ignazio''s::December 2021","arturo''s coal oven pizza::January 2022","wheated::February 2022","john''s of bleecker street::March 2022","emmett''s::April 2022","dellarocco''s::May 2022","l''industrie pizzeria::June 2022","the galley pizza & eatery::July 2022","lombardi''s::August 2022","luigi''s pizza::September 2022","giuseppina''s::October 2022","ace''s pizza::November 2022","scarr''s pizza::December 2022","paulie gee''s::January 2023","kesté pizza e vino::February 2023","macoletta::March 2023","leo::April 2023","best pizza::May 2023","totonno''s::June 2023","brooklyn dop::July 2023","sea bright pizzeria::August 2023","biga bite::September 2023","juliana''s::October 2023","mama''s too!::November 2023","unregular pizza::December 2023","little charli::January 2024","emily::February 2024","la rose pizza::March 2024","see no evil pizza::April 2024","mo''s general::May 2024","ribalta::June 2024","ltd pizza and bar::July 2024","cello''s pizzeria::August 2024","razza::September 2024","pasquale jones::October 2024","nate''s detroit pizza::November 2024","lazzara''s pizza cafe::December 2024","nolita pizza::January 2025","don antonio''s::February 2025","ceres::April 2025","kid pizza::May 2025","chrissy''s pizza::June 2025","f&f pizzeria::July 2025","decades pizza::August 2025","serano''s italian::September 2025","lucky charlie::October 2025","turbo pizza::November 2025","victoria pizzeria::December 2025","andrea''s pizza::January 2026"]'::jsonb,
  '[]'::jsonb,
  '{"low":0,"mid":0,"high":1,"mode":"insert","undoStack":[],"comparableIds":["roberta''s::May 2021","emmy squared (ues)::March 2021","circa brewing co.::June 2021","grimaldi''s pizzeria::July 2021","lucali::February 2021","lake placid::October – November 2020","jack''s coal fired oven::December 2020","sauce restaurant::January 2021","ops::September 2021","flatbread company::October 2021","beach haus brewery::August 2021","zazzy''s pizza::April 2021"],"currentPlaceId":"joe & pat''s nyc::November 2021"}'::jsonb,
  '2026-02-16 22:31:35.013+00'::timestamptz
) ON CONFLICT (user_id) DO UPDATE SET
  ranking = EXCLUDED.ranking,
  pending = EXCLUDED.pending,
  undo_stack = EXCLUDED.undo_stack,
  session = EXCLUDED.session,
  updated_at = EXCLUDED.updated_at;
COMMIT;
