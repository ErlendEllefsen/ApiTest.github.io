// ! API KEY
const apiKey = "50f95795086b4612a97afa04a35c9211";
// * Default links for player info, images and definitions
const bungieLink = "https://www.bungie.net/Platform/Destiny2";
const bungieImg = "https://www.bungie.net";
const bungieItemDef =
  "https://www.bungie.net/Platform/Destiny2/Manifest/DestinyInventoryItemDefinition/";

// * These two classes are used to send SteamID64 and characterIDs to all other classes.

class Profile {
  constructor(steamID64) {
    this.steamID64 = steamID64;
  }
}

class getCharacters extends Profile {
  constructor(steamID64, char1, char2, char3) {
    super(steamID64);
    this.char1 = char1;
    this.char2 = char2;
    this.char3 = char3;
  }
}

// ! Main function.
// * Gets SteamID64 value from html page and stats the loading of the profile

function getProfile() {
  // * Fetches value from input in html
  const newProfile = new Profile(document.getElementById("id64").value);

  // * Ajax API request

  $.ajax({
    url: bungieLink + "/3/Profile/" + newProfile.steamID64 + "/?components=100",
    headers: {
      "X-API-Key": apiKey
    }
  }).done(function(json) {
    // * Parsing the JSON
    new getCharacters(
      new getInfo(
        newProfile.steamID64,
        json.Response.profile.data.characterIds[0],
        json.Response.profile.data.characterIds[1],
        json.Response.profile.data.characterIds[2]
      )
    );
  });
}
// * This class gets info about each character the user has.
// * Light level, emblem and much more can be parsed from the JSON.
class getInfo {
  constructor(steamID64, char1, char2, char3) {
    this.steamID64 = steamID64;
    this.char1 = char1;
    this.char2 = char2;
    this.char3 = char3;
    const charArray = [char1, char2, char3];

    var i;
    for (i = 0; i < charArray.length; i++) {
      let char = charArray[i];
      $.ajax({
        url:
          bungieLink +
          "/3/Profile/" +
          steamID64 +
          "/Character/" +
          charArray[i] +
          "/?components=200",
        headers: {
          "X-API-Key": apiKey
        }
      }).done(function(json) {
        let classType = json.Response.character.data.classType;
        new pasteInfo(
          classType,
          json.Response.character.data.light,
          json.Response.character.data.emblemBackgroundPath
        );
        // * Sends variables to new class for further API requests
        new getWeapons(steamID64, classType, char);
      });
    }
  }
}

// * This class pastes basic info about the different characters
class pasteInfo {
  constructor(classType, lightLevel, emblemBackground) {
    this.classType = classType;
    this.lightLevel = lightLevel;
    this.emblemBackground = emblemBackground;
    let classChar;
    let emblemText = "emblem";

    if (classType === 0) classChar = "Titan";
    else if (classType === 1) classChar = "Hunter";
    else if (classType === 2) classChar = "Warlock";

    const tagClass = document.createElement("h1");
    const textClass = document.createTextNode(classChar + " " + lightLevel);
    tagClass.appendChild(textClass);
    const getDiv = document.getElementById(emblemText + classChar);
    document.body.insertBefore(tagClass, getDiv);
    var img = document.createElement("img");
    img.src = bungieImg + emblemBackground;
    document.getElementById(emblemText + classChar).appendChild(img);
  }
}

// * API request gets each charactes equipped weapons and armour.
class getWeapons {
  constructor(steamID64, classType, char) {
    this.steamID64 = steamID64;
    this.classType = classType;
    this.char = char;

    let classChar;
    let emblemText = "emblem";

    if (classType === 0) classChar = "Titan";
    else if (classType === 1) classChar = "Hunter";
    else if (classType === 2) classChar = "Warlock";

    $.ajax({
      url:
        bungieLink +
        "/3/Profile/" +
        steamID64 +
        "/Character/" +
        char +
        "/?components=205",
      headers: {
        "X-API-Key": apiKey
      }
    }).done(function(json) {
      for (var u = 0; u < json.Response.equipment.data.items.length; u++) {
        // * Gets itemHases for all equipped items on all characters
        let itemHash = json.Response.equipment.data.items[u].itemHash;
        new pasteWeapons(itemHash, classType, classChar);
      }
    });
  }
}
// * This class fetches all items
class pasteWeapons {
  constructor(itemHash, classType, classChar) {
    this.itemHash = itemHash;
    this.classType = classType;
    this.classChar = classChar;

    $.ajax({
      url: bungieItemDef + itemHash,
      headers: {
        "X-API-Key": apiKey
      }
    }).done(function(json) {
      // * This function gets itemCategoryHashes.
      // * This makes it possible to devide between armour and weapons.
      const itemIcon = json.Response.displayProperties.icon;
      const weaponType = json.Response.itemCategoryHashes[0];
      const armourType = json.Response.itemCategoryHashes[1];

      var img = document.createElement("img");
      img.src = bungieImg + itemIcon;
      // ! Titan = 0, Hunter = 1, Warlock = 2
      // * Sends in variables dependant of what classType is defined beforehand
      if (classType === 0)
        new Divider(classType, armourType, weaponType, itemIcon, classChar);
      else if (classType === 1)
        new Divider(classType, armourType, weaponType, itemIcon, classChar);
      else if (classType === 2)
        new Divider(classType, armourType, weaponType, itemIcon, classChar);
    });
  }
}
// * This class organizes armour and weapons,
// * and sends them to the correct divs in the html file,
class Divider {
  constructor(classType, armourType, weaponType, itemIcon, classChar) {
    this.classType = classType;
    this.weaponType = weaponType;
    this.armourType = armourType;
    this.itemIcon = itemIcon;
    this.classChar = classChar;
    let itemChar;

    if (weaponType !== undefined) {
      if (weaponType === 2) itemChar = "kinetic";
      else if (weaponType === 3) itemChar = "energy";
      else if (weaponType === 4) itemChar = "heavy";
    }
    if (armourType !== undefined) {
      if (armourType === 45) itemChar = "helmet";
      else if (armourType === 46) itemChar = "arms";
      else if (armourType === 47) itemChar = "chest";
      else if (armourType === 48) itemChar = "legs";
      else if (armourType === 49) itemChar = "classItem";
    }
    if (itemChar !== undefined) {
      new Post(itemChar, itemIcon, classChar);
    }
  }
}
// * Posts to the html
class Post {
  constructor(itemChar, itemIcon, classChar) {
    this.itemChar = itemChar;
    this.itemIcon = itemIcon;
    this.classChar = classChar;

    var img = document.createElement("img");
    img.src = bungieImg + itemIcon;
    document.getElementById(itemChar + classChar).appendChild(img);
  }
}

/* ITEM TYPES HASH[0]
Kinetic : 2
Energy : 3
Heavy : 4
Helm : 
Hands : 
Chest : 
Boots : 
ClassItem : 
*/
