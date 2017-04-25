# Sarenteth
Collection of Roll20 code I use in my Sarenteth games. The rules can be found [here](http://bkugler.com/sarenteth/).

## Using The Scripts

These scripts are taken directly from my current campaign, A Darkening Sky, and as such many of them have certain object IDs hard-coded or, at least, make some assumptions about the state of the game. The code has been kept as open and adaptible as possible without leaving vulnerabilities that my players (several of whom are programmers) might be able to exploit.

Things to consider when importing these to a new game:

- Many scripts assume there is a character called Environment, which I use for storing global values (e.g. contest difficulty).
- The !obsessions function assumes the players are named Graham, Thomas, Kyle, Luke, Brett, Charlie, and Kegan.
- Functions that are designed to change on-screen values, such as those found in time.js and weather.js, use hard-coded object IDs.
- The !new-npc function is designed to read output from an NPC generator I made for [Your Helpful Homunculus](https://github.com/Semantimancer/homunculus).
