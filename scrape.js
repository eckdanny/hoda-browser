/* jshint laxcomma: true, camelcase: false, curly: false */

/**
 * HoDA Data Scraper
 *
 * Scrapes character data from the web, munges it, and writes to disk. A request
 * is made to a web page listing all characters in the game. (Or atleast all
 * characters for which a wiki page exists!). The DOM in the response is then
 * parsed to create an array of characters. Then for each character, another
 * web scrape is performed to collect character data. To massage the character
 * data into a more accessible and concise format, a transformation is applied.
 *
 * The character data collection routine is performed for each character. A
 * counter allows the script to know when all the async processes have been
 * completed. When all characters have been processed (and no errors have occured)
 * the character data (one big array) is written to disk.
 */
(function () { 'use strict';


  var cheerio = require('cheerio')
    , request = require('request')
    , fs = require('fs')
    , $
    ;

  // Some constants and empty initializations
  var baseUrl           = 'http://dragonage.wikia.com'
    , characterIndexUrl = baseUrl + '/wiki/Category:Heroes_of_Dragon_Age'
    , jsonFile          = './app/data/characters.json'
    , characterPool     = {}  // hash of all characters and ref info
    , characters        = []  // all character data
    , counter           = 0   // number of characters left to fetch data
    ;

  /**
   * Munges Character Data
   * @param  {Object} dirty Scraped data
   * @return {Object}
   */
  function transform (dirty) {
    var speedMap = { 'Slow': 1, 'Medium': 2, 'Fast': 3 };
    var clean = {};
    clean.name = dirty.name;
    clean.rarity = dirty.rarity;
    clean.factions = (function () {
      var factions = [];
      if (dirty.faction1 === 'None') {
        return ['Large'];
      }
      if (dirty.faction1) { factions.push(dirty.faction1); }
      if (dirty.faction2) { factions.push(dirty.faction2); }
      return factions;
    })();
    clean.groups = (function () {
      var groups = [];
      if (dirty.group1) { groups.push(dirty.group1); }
      if (dirty.group2) { groups.push(dirty.group2); }
      return groups;
    })();
    clean.ability = dirty.ability;
    clean.abilityDesc = dirty.ability_desc;
    clean.speed = speedMap[dirty.ability_speed];
    clean.maxLevel = [
      parseInt(dirty.t1maxlevel),
      parseInt(dirty.t2maxlevel),
      parseInt(dirty.t3maxlevel),
      parseInt(dirty.t4maxlevel)
    ];
    clean.basePower = [
      parseInt(dirty.t1power),
      parseInt(dirty.t2power),
      parseInt(dirty.t3power),
      parseInt(dirty.t4power)
    ];
    clean.baseHealth = [
      parseInt(dirty.t1health),
      parseInt(dirty.t2health),
      parseInt(dirty.t3health),
      parseInt(dirty.t4health)
    ];
    clean.delPower = [
      parseInt(dirty.t1powerperlevel),
      parseInt(dirty.t2powerperlevel),
      parseInt(dirty.t3powerperlevel),
      parseInt(dirty.t4powerperlevel)
    ];
    clean.delHealth = [
      parseInt(dirty.t1healthperlevel),
      parseInt(dirty.t2healthperlevel),
      parseInt(dirty.t3healthperlevel),
      parseInt(dirty.t4healthperlevel)
    ];
    clean.link = dirty.link;

    return clean;
  }

  // Fetch the character list web index page
  request(characterIndexUrl, function (err, resp, body) {

    var character;

    if (err || 200 !== resp.statusCode) {
      console.log('an error occurred fetching the character index');
    }

    // Capture character index msg body
    $ = cheerio.load(body);

    // Find the character page links
    $('#mw-pages table a[href^="/wiki/Data"]')

      // Grab basic info for each
      .each(function () {

        var data = {}             // holder for basic character data
          , $character = $(this)  // character page link wrapped in jQuery
          ;

        (function () {

          // Make sure the link is in the format we expect
          var matches = $character.text().match(/Data:(.+) \(Heroes of Dragon Age\)/);
          if (2 !== matches.length) {
            throw new Error('uh oh! regex parsing got confused attempting to read character index');
          }

          // Capture character name and href (note: a relative link)
          data.name = matches.pop();
          data.link = $character.attr('href');
        })();

        // Add to pool, no duplicates plz
        if (!characterPool[data.name]) {
          characterPool[data.name] = data;
        }

        // Increment the job counter for each new character found
        counter = counter + 1;
      }
    );

    // Now get individual character data
    for (character in characterPool) {

      // Construct the url
      var characterUrl = baseUrl + characterPool[character].link;

      // Fetch the character web page
      request(characterUrl, (function (character) {
        return function (err, resp, body) {

          if (err) {
            console.log(err);
          }

          // New empty character data
          var data = {};

          // Capture msg body...
          $ = cheerio.load(body);

          // and parse HTML table, loading data into character data
          $('#mw-content-text table.daoinfobox tr')

            // Skip the first two rows (not what we're looking for)
            .slice(2)

            // Process each row in the table
            .each(function () {

              // Get character attribute name (drop trailing ':')
              var key = $(this).find('th').text().match(/(.+)\:/)[1];

              // Get character attribute value
              var val = $(this).find('td').text().trim();

              // Append to data hash
              data[key] = val;
            }
          );

          // Double check character name has match in the character in the pool
          // @todo verify data.name === character
          if (characterPool[character]) {

            // Save the link href
            data.link = baseUrl + characterPool[character].link;

            // Transformations
            data = transform(data);

            // Put the character data into the character collection
            characters.push(data);

            // Decrement the job counter
            counter = counter - 1;

          } else {
            throw new Error('character not found in pool');
          }

          if (0 === counter) {
            // All done and no errors, save data to disk
            fs.writeFile(jsonFile, JSON.stringify(characters), function (err) {
              if (err) {
                console.log(err);
              }
            });
          }
        };
      })(character));
    }
  });


})();
