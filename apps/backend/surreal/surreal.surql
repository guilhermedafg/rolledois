-----------------------------------------------------------
-- DB `root`
-----------------------------------------------------------
DEFINE USER OVERWRITE root
    ON ROOT
    PASSWORD "root"
    ROLES OWNER
    DURATION FOR TOKEN 100y, FOR SESSION 100y;

-----------------------------------------------------------
-- ANALYZER
-----------------------------------------------------------
DEFINE ANALYZER OVERWRITE ascii_lower TOKENIZERS class FILTERS ascii,lowercase,snowball(portuguese);

-----------------------------------------------------------
-- Migrations
-----------------------------------------------------------
DEFINE TABLE IF NOT EXISTS migration SCHEMAFULL;

-----------------------------------------------------------
-- Address
-----------------------------------------------------------

-- Country
DEFINE TABLE IF NOT EXISTS country SCHEMAFULL;
DEFINE FIELD OVERWRITE fullName
    ON TABLE country
    TYPE string;
DEFINE FIELD OVERWRITE shortName
    ON TABLE country
    TYPE string;
DEFINE INDEX country_unique_name ON TABLE country FIELDS fullName UNIQUE;

-- State
DEFINE TABLE IF NOT EXISTS state SCHEMAFULL;
DEFINE FIELD OVERWRITE fullName
    ON TABLE state
    TYPE string;
DEFINE FIELD OVERWRITE shortName
    ON TABLE state
    TYPE string;
DEFINE FIELD OVERWRITE country
    ON TABLE state
    TYPE record<country>;
DEFINE INDEX state_unique_name ON TABLE state FIELDS fullName, country UNIQUE;

-- City
DEFINE TABLE IF NOT EXISTS city SCHEMAFULL;
DEFINE FIELD OVERWRITE fullName
    ON TABLE city
    TYPE string;
DEFINE FIELD OVERWRITE imageUrl
    ON TABLE city
    TYPE option<string>;
DEFINE FIELD OVERWRITE state
    ON TABLE city
    TYPE record<state>;
DEFINE FIELD OVERWRITE country
    ON TABLE city
    TYPE record<country>;

-- Address
DEFINE TABLE IF NOT EXISTS address SCHEMAFULL;
DEFINE FIELD OVERWRITE zipcode
    ON TABLE address
    TYPE string;
DEFINE FIELD OVERWRITE street
    ON TABLE address
    TYPE string;
DEFINE FIELD OVERWRITE number
    ON TABLE address
    TYPE string;
DEFINE FIELD OVERWRITE district
    ON TABLE address
    TYPE string;
DEFINE FIELD OVERWRITE city
    ON TABLE address
    TYPE record<city>;
DEFINE FIELD OVERWRITE state
    ON TABLE address
    TYPE record<state>;
DEFINE FIELD OVERWRITE country
    ON TABLE address
    TYPE record<country>;
DEFINE FIELD OVERWRITE full
    ON TABLE address
    TYPE string
    DEFAULT string::concat($this.street, ", ", $this.number, " - ", $this.district, ", ", $this.city.fullName, " - ", $this.state.shortName, ", ", $this.zipcode, ", ", $this.country.fullName)
    VALUE string::concat($this.street, ", ", $this.number, " - ", $this.district, ", ", $this.city.fullName, " - ", $this.state.shortName, ", ", $this.zipcode, ", ", $this.country.fullName);
DEFINE FIELD OVERWRITE createdAt
    ON TABLE address
    TYPE datetime
    DEFAULT time::now();
DEFINE FIELD OVERWRITE updatedAt
    ON TABLE address
    TYPE datetime
    DEFAULT time::now()
    VALUE time::now();

-----------------------------------------------------------
-- User
-----------------------------------------------------------
DEFINE TABLE IF NOT EXISTS user SCHEMAFULL;
DEFINE FIELD OVERWRITE nickname
    ON TABLE user
    TYPE string;
DEFINE FIELD OVERWRITE email
    ON TABLE user
    TYPE string
    ASSERT string::is::email($value);
DEFINE FIELD OVERWRITE password
    ON TABLE user
    TYPE option<string>;
DEFINE FIELD OVERWRITE name
    ON TABLE user
    TYPE object;
DEFINE FIELD OVERWRITE name.first
    ON TABLE user
    TYPE string;
DEFINE FIELD OVERWRITE name.last
    ON TABLE user
    TYPE string;
DEFINE FIELD OVERWRITE name.full
    ON TABLE user
    TYPE string
    DEFAULT string::join(" ", string::trim($this.name.first), string::trim($this.name.last))
    VALUE string::join(" ", string::trim($this.name.first), string::trim($this.name.last));
DEFINE FIELD OVERWRITE pictureUrl
    ON TABLE user
    TYPE string;
DEFINE FIELD OVERWRITE phone
    ON TABLE user
    TYPE option<string>;
DEFINE FIELD OVERWRITE birthdate
    ON TABLE user
    TYPE option<datetime>;
DEFINE FIELD OVERWRITE verified
    ON TABLE user
    TYPE bool
    DEFAULT false;
DEFINE FIELD OVERWRITE bio
    ON TABLE user
    TYPE object
    DEFAULT {};
DEFINE FIELD OVERWRITE bio.short
    ON TABLE user
    TYPE string
    DEFAULT "";
DEFINE FIELD OVERWRITE bio.long
    ON TABLE user
    TYPE string
    DEFAULT "";
DEFINE FIELD OVERWRITE providers
    ON TABLE user
    TYPE option<object>;
DEFINE FIELD OVERWRITE providers.googleId
    ON TABLE user
    TYPE option<string>;
DEFINE FIELD OVERWRITE providers.instagramId
    ON TABLE user
    TYPE option<string>;
DEFINE FIELD OVERWRITE createdAt
    ON TABLE user
    TYPE datetime
    DEFAULT time::now();
DEFINE FIELD OVERWRITE updatedAt
    ON TABLE user
    TYPE datetime
    DEFAULT time::now()
    VALUE time::now();
DEFINE INDEX user_email ON TABLE user FIELDS email UNIQUE;
DEFINE INDEX user_nickname ON TABLE user FIELDS nickname UNIQUE;

-----------------------------------------------------------
-- Reset password
-----------------------------------------------------------
DEFINE TABLE IF NOT EXISTS resetPassword SCHEMAFULL;
DEFINE FIELD OVERWRITE resetToken
    ON TABLE resetPassword
    TYPE string;
DEFINE FIELD OVERWRITE user
    ON TABLE resetPassword
    TYPE record<user>;

-----------------------------------------------------------
-- Follows
-----------------------------------------------------------
DEFINE TABLE IF NOT EXISTS follows SCHEMAFULL TYPE RELATION FROM user TO user;
DEFINE INDEX follows_unique_user_to_user ON TABLE follows FIELDS in, out UNIQUE;

-----------------------------------------------------------
-- Tag
-----------------------------------------------------------
DEFINE TABLE IF NOT EXISTS tag SCHEMAFULL;

-----------------------------------------------------------
-- Venue
-----------------------------------------------------------

-- Venue category
DEFINE TABLE IF NOT EXISTS venueCategory SCHEMAFULL;

-- Venue
DEFINE TABLE IF NOT EXISTS venue SCHEMAFULL;
DEFINE FIELD OVERWRITE uri
    ON TABLE venue
    TYPE string;
DEFINE FIELD OVERWRITE name
    ON TABLE venue
    TYPE string;
DEFINE FIELD OVERWRITE description
    ON TABLE venue
    TYPE option<string>;
DEFINE FIELD OVERWRITE category
    ON TABLE venue
    TYPE record<venueCategory>;
DEFINE FIELD OVERWRITE googlePlaceId
    ON TABLE venue
    TYPE option<string>;
DEFINE FIELD OVERWRITE hints
    ON TABLE venue 
    TYPE array<string>
    DEFAULT [];
DEFINE FIELD OVERWRITE workingHours
    ON TABLE venue
    TYPE option<object>;
DEFINE FIELD OVERWRITE workingHours.monday
    ON TABLE venue
    TYPE option<array<object>>;
DEFINE FIELD OVERWRITE workingHours.monday.*.start
    ON TABLE venue
    TYPE string;
DEFINE FIELD OVERWRITE workingHours.monday.*.end
    ON TABLE venue
    TYPE string;
DEFINE FIELD OVERWRITE workingHours.tuesday
    ON TABLE venue
    TYPE option<array<object>>;
DEFINE FIELD OVERWRITE workingHours.tuesday.*.start
    ON TABLE venue
    TYPE string;
DEFINE FIELD OVERWRITE workingHours.tuesday.*.end
    ON TABLE venue
    TYPE string;
DEFINE FIELD OVERWRITE workingHours.wednesday
    ON TABLE venue
    TYPE option<array<object>>;
DEFINE FIELD OVERWRITE workingHours.wednesday.*.start
    ON TABLE venue
    TYPE string;
DEFINE FIELD OVERWRITE workingHours.wednesday.*.end
    ON TABLE venue
    TYPE string;
DEFINE FIELD OVERWRITE workingHours.thursday
    ON TABLE venue
    TYPE option<array<object>>;
DEFINE FIELD OVERWRITE workingHours.thursday.*.start
    ON TABLE venue
    TYPE string;
DEFINE FIELD OVERWRITE workingHours.thursday.*.end
    ON TABLE venue
    TYPE string;
DEFINE FIELD OVERWRITE workingHours.friday
    ON TABLE venue
    TYPE option<array<object>>;
DEFINE FIELD OVERWRITE workingHours.friday.*.start
    ON TABLE venue
    TYPE string;
DEFINE FIELD OVERWRITE workingHours.friday.*.end
    ON TABLE venue
    TYPE string;
DEFINE FIELD OVERWRITE workingHours.saturday
    ON TABLE venue
    TYPE option<array<object>>;
DEFINE FIELD OVERWRITE workingHours.saturday.*.start
    ON TABLE venue
    TYPE string;
DEFINE FIELD OVERWRITE workingHours.saturday.*.end
    ON TABLE venue
    TYPE string;
DEFINE FIELD OVERWRITE workingHours.sunday
    ON TABLE venue
    TYPE option<array<object>>;
DEFINE FIELD OVERWRITE workingHours.sunday.*.start
    ON TABLE venue
    TYPE string;
DEFINE FIELD OVERWRITE workingHours.sunday.*.end
    ON TABLE venue
    TYPE string;
DEFINE FIELD OVERWRITE phone
    ON TABLE venue
    TYPE option<string>;
DEFINE FIELD OVERWRITE website
    ON TABLE venue
    TYPE option<string>;
DEFINE FIELD OVERWRITE socials
    ON TABLE venue
    TYPE object;
DEFINE FIELD OVERWRITE socials.instagram
    ON TABLE venue
    TYPE option<string>;
DEFINE FIELD OVERWRITE socials.tiktok
    ON TABLE venue
    TYPE option<string>;
DEFINE FIELD OVERWRITE socials.x
    ON TABLE venue
    TYPE option<string>;
DEFINE FIELD OVERWRITE cover
    ON TABLE venue
    TYPE object;
DEFINE FIELD OVERWRITE cover.thumbUrl
    ON TABLE venue
    TYPE string;
DEFINE FIELD OVERWRITE cover.url
    ON TABLE venue
    TYPE string;
DEFINE FIELD OVERWRITE images
    ON TABLE venue
    TYPE array<object>;
DEFINE FIELD OVERWRITE images.*.thumbUrl
    ON TABLE venue
    TYPE string;
DEFINE FIELD OVERWRITE images.*.url
    ON TABLE venue
    TYPE string;
DEFINE FIELD OVERWRITE geo
    ON TABLE venue
    TYPE option<geometry<point>>;
DEFINE FIELD OVERWRITE address
    ON TABLE venue
    TYPE option<record<address>>;
DEFINE FIELD OVERWRITE createdAt
    ON TABLE venue
    TYPE datetime
    DEFAULT time::now();
DEFINE FIELD OVERWRITE updatedAt
    ON TABLE venue
    TYPE datetime
    DEFAULT time::now()
    VALUE time::now();
DEFINE INDEX venue_uri ON TABLE venue FIELDS uri UNIQUE;
DEFINE INDEX venue_google_place_id ON TABLE venue FIELDS googlePlaceId UNIQUE;

DEFINE INDEX venue_name_search
  ON TABLE venue FIELDS name
  SEARCH ANALYZER ascii_lower BM25 HIGHLIGHTS;
-----------------------------------------------------------
-- Attraction
-----------------------------------------------------------
DEFINE TABLE IF NOT EXISTS attraction SCHEMAFULL;

-----------------------------------------------------------
-- Event
-----------------------------------------------------------

-- Event category
DEFINE TABLE IF NOT EXISTS eventCategory SCHEMAFULL;

-- Event
DEFINE TABLE IF NOT EXISTS event SCHEMAFULL;
DEFINE FIELD OVERWRITE name
    ON TABLE event
    TYPE string;
DEFINE FIELD OVERWRITE description
    ON TABLE event
    TYPE string;
DEFINE FIELD OVERWRITE category
    ON TABLE event
    TYPE record<eventCategory>;
DEFINE FIELD OVERWRITE venue
    ON TABLE event
    TYPE option<record<venue>>;
DEFINE FIELD OVERWRITE address
    ON TABLE event
    TYPE record<address>;
DEFINE FIELD OVERWRITE cover
    ON TABLE event
    TYPE object;
DEFINE FIELD OVERWRITE cover.thumbUrl
    ON TABLE event
    TYPE string;
DEFINE FIELD OVERWRITE cover.url
    ON TABLE event
    TYPE string;
DEFINE FIELD OVERWRITE images
    ON TABLE event
    TYPE array<object>;
DEFINE FIELD OVERWRITE images.*.thumbUrl
    ON TABLE event
    TYPE string;
DEFINE FIELD OVERWRITE images.*.url
    ON TABLE event
    TYPE string;
DEFINE FIELD OVERWRITE createdAt
    ON TABLE event
    TYPE datetime
    DEFAULT time::now();
DEFINE FIELD OVERWRITE updatedAt
    ON TABLE event
    TYPE datetime
    DEFAULT time::now()
    VALUE time::now();

-----------------------------------------------------------
-- Tags
-----------------------------------------------------------
DEFINE TABLE IF NOT EXISTS tags SCHEMAFULL TYPE RELATION FROM event|venue TO tag;


-----------------------------------------------------------
-- Bookmarks
-----------------------------------------------------------
DEFINE TABLE IF NOT EXISTS bookmarks SCHEMAFULL TYPE RELATION FROM user TO venue|list;
DEFINE FIELD OVERWRITE createdAt
    ON TABLE bookmarks
    TYPE datetime
    DEFAULT time::now();

DEFINE INDEX bookmarks_unique_user_venue ON TABLE bookmarks FIELDS in, out UNIQUE;

-----------------------------------------------------------
-- AlreadyBeen
-----------------------------------------------------------
DEFINE TABLE IF NOT EXISTS alreadyBeen SCHEMAFULL TYPE RELATION FROM user TO venue;
DEFINE FIELD OVERWRITE createdAt
    ON TABLE alreadyBeen
    TYPE datetime
    DEFAULT time::now();

DEFINE INDEX alreadyBeen_unique_user_venue ON TABLE alreadyBeen FIELDS in, out UNIQUE;

-----------------------------------------------------------
-- List
-----------------------------------------------------------
DEFINE TABLE IF NOT EXISTS list SCHEMAFULL;
DEFINE FIELD OVERWRITE name
    ON TABLE list
    TYPE string;
DEFINE FIELD OVERWRITE description
    ON TABLE list
    TYPE option<string>;
DEFINE FIELD OVERWRITE uri
    ON TABLE list
    TYPE string
    DEFAULT string::slug(string::concat($this.name, " ", rand::uuid::v4()));
DEFINE FIELD OVERWRITE owner
    ON TABLE list
    TYPE record<user>;
DEFINE FIELD OVERWRITE private
    ON TABLE list
    TYPE bool
    DEFAULT false;
DEFINE FIELD OVERWRITE venues
    ON TABLE list
    TYPE array<object>;
DEFINE FIELD OVERWRITE venues.*
    ON TABLE list
    TYPE object;
DEFINE FIELD OVERWRITE venues.*.record
    ON TABLE list
    TYPE record<venue>;
DEFINE FIELD OVERWRITE venues.*.comment
    ON TABLE list 
    TYPE option<string>;
DEFINE FIELD OVERWRITE events
    ON TABLE list
    TYPE array<record<event>>;
DEFINE FIELD OVERWRITE cover
    ON TABLE list
    TYPE option<object>;
DEFINE FIELD OVERWRITE cover.thumbUrl
    ON TABLE list
    TYPE string;
DEFINE FIELD OVERWRITE cover.url
    ON TABLE list
    TYPE string;
DEFINE FIELD OVERWRITE createdAt
    ON TABLE list
    TYPE datetime
    DEFAULT time::now();
DEFINE FIELD OVERWRITE updatedAt
    ON TABLE list
    TYPE datetime
    DEFAULT time::now()
    VALUE time::now();

DEFINE INDEX list_uri ON TABLE list FIELDS uri UNIQUE;
DEFINE INDEX list_name_search
  ON TABLE list FIELDS name
  SEARCH ANALYZER ascii_lower BM25 HIGHLIGHTS;
