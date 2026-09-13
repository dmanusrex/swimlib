# HY3 fixed-width layout notes

This document records the HY3 layout used by SwimLib. It is an independently
written interoperability reference assembled from observed Team Manager 8
exports, parser and writer round-trip tests, and comparison with the public
implementations listed under [Sources](#sources).

HY3 is not publicly documented by its vendor. Consequently, some fields remain
unknown and some positions may differ between product versions. The field
definitions in `src/hy3/records/` are the executable form of this document.

## Framing and indexing

- A record is 130 characters long.
- Characters 0-127 contain the record payload.
- Characters 128-129 contain a two-character checksum.
- Files normally use CRLF record separators.
- The two characters at offsets 0-1 identify the record type.
- Tables below use zero-based, inclusive offsets.
- Unlisted positions are reserved or have not been identified.

## File, meet, and team records

### A1 - file description

| Offsets | Field |
| ---: | --- |
| 2-3 | File type code |
| 4-28 | Description |
| 29-43 | Software vendor |
| 44-57 | Software name and version |
| 58-65 | Creation date (`MMDDYYYY`) |
| 67-74 | Creation time, right-aligned |
| 75-126 | Licensee or team name |

Common file type codes include `02` for meet entries, `03` for a roster,
`07` for Meet Manager results, and `09` for Team Manager results.

### B1 - meet details

| Offsets | Field |
| ---: | --- |
| 2-46 | Meet name |
| 47-91 | Facility |
| 92-99 | Start date |
| 100-107 | End date |
| 108-115 | Age-up date |
| 116-120 | Pool altitude in metres |

### B2 - meet classification

The fields currently understood are a masters designation at 94-95, meet type
at 96-97, course at 98, a numeric fee at 99-105, and a second course indicator
at 106. Remaining payload bytes are retained as reserved space.

### C1 - team

| Offsets | Field |
| ---: | --- |
| 2-6 | Team code |
| 7-36 | Full name |
| 37-52 | Short name |
| 53-54 | LSC or regional code |
| 55-84 | Head coach |
| 85-114 | Assistant coach |
| 119-121 | Team type |

Observed team types include `AGE`, `HS`, `COL`, `MAS`, `OTH`, and `REC`.

### C2 and C3 - team contact information

C2 stores the addressee, street, and city in three 30-character fields at
2-31, 32-61, and 62-91. State/province, postal code, country, and registration
organization follow at 92-93, 94-103, 104-106, and 108-111.

C3 stores daytime phone, evening phone, fax, and email at 32-51, 52-71,
72-91, and 92-127 respectively.

### C6 - staff member

Observed Team Manager files use one C6 record per staff member. The name is at
2-31 and the role or title is at 32-51.

## Swimmer records

### D1 - swimmer identity

| Offsets | Field |
| ---: | --- |
| 2 | Sex |
| 3-7 | Swimmer identifier, right-aligned |
| 8-27 | Last name |
| 28-47 | First name |
| 48-67 | Preferred name |
| 68 | Middle initial |
| 69-82 | Registration number |
| 83-87 | Team database identifier |
| 88-95 | Birth date |
| 97-98 | Age |
| 99-100 | School year or grade |
| 101 | Inactive marker |
| 105-107 | Group |
| 108-110 | Subgroup |
| 112-114 | Registration region or country |
| 116-118 | Additional group |
| 119-121 | Additional subgroup |

The D2-DF family carries addresses, telephone numbers, guardians, emergency
contacts, medical notes, custom fields, and athlete contact information. Their
exact layouts are exposed by each record class through `getFieldDefinitions()`.
Unknown or unused positions are emitted as spaces.

## Entries and results

### E1 - individual entry

E1 identifies a swimmer and event. Its principal fields are the swimmer key at
2-12, event sex at 13-14, distance at 15-20, stroke at 21, age limits at
22-27, event fee at 32-37, event number at 38-40, and seed/conversion values
at 42-76. Numeric text is right-aligned.

### E2 - individual result

E2 follows its E1. It stores round, result time and course at 2-11; result
status and DQ reason at 12-14; heat, lane, and placing at 20-32; backup timing
values at 36-59 and 65-81; points at 60-62; reaction time at 83-86; and the
event date at 102-109.

### F1 and F2 - relay entry and result

F1 mirrors the event and seed portions of E1 but identifies a team and relay
squad. F2 contains the corresponding result. Relay result records may also
carry four reaction-time fields.

### F3 - relay swimmers

F3 contains up to eight 13-character swimmer slots beginning at offset 2. Each
slot consists of sex (1), swimmer identifier (5), surname abbreviation (5), a
second sex/category character (1), and relay order (1). The first four slots
are the entered relay; later slots can represent alternates.

### G1 - splits

G1 contains up to ten 11-character groups beginning at offset 2. Each group is
round/result type (1), split length (2), and time (8).

### H1 - disqualification description

H1 stores a two-character reason code at 2-3 and its text at 4-127. It normally
follows the E2 or F2 record carrying the same reason code.

## Time representation

HY3 time fields are textual seconds, right-aligned within their field. For
example, a value representing one minute and five hundredths is written as
`60.05`, not in a minutes-and-seconds display form. Blank fields represent
missing values. Some conversion fields use a single `0` for a zero value.

## Checksum

For payload characters `c[0]` through `c[127]`, compute:

1. Add the character code at each even offset once.
2. Add the character code at each odd offset twice.
3. Divide the sum by 21, discard the fractional part, and add 205.
4. Take the final two decimal digits and write them in reverse order.

The resulting two characters occupy offsets 128-129. SwimLib recalculates the
checksum when writing and can warn, throw, or ignore a mismatch while parsing.

## Sources

These projects and discussions were used to confirm facts about the format;
their source code is not incorporated into SwimLib:

- [SDIF Forum HY3 discussion](https://groups.google.com/g/sdif-forum/c/jGi-watQucs)
- [wp-swimteam](https://github.com/wp-plugins/wp-swimteam)
- [hyparse](https://github.com/jgolliher/hyparse)
- [hytek-parser](https://github.com/SwimComm/hytek-parser)

Observed Team Manager 8 exports were used to resolve discrepancies between
references. See [hy3.md](hy3.md) for the supported API, record classes, and
validation status.
