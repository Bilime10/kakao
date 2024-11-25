const API_URL = "https://graphqlpokemon.favware.tech/v8";

async function fetchPokemon(pokemonName) {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `{
      getPokemon(pokemon: ${pokemonName}) {
        key
        sprite
        classification
        color
        types {
          name
        }
        baseStats {
          hp
          attack
          defense
          specialattack
          specialdefense
          speed
        }
        weight
        height
        flavorTexts {
          flavor
          game
        }
        evolutions {
          species
          sprite
        }
      }
    }`,
      }),
    });

    const { data } = await response.json();
    return data.getPokemon;
  } catch (error) {
    console.error("Error fetching Pokémon data:", error);
    return null;
  }
}

async function displayPokemon(pokemonName) {
  const resultDiv = document.getElementById("result");
  const pokemonData = await fetchPokemon(pokemonName);

  if (pokemonData) {
    document.getElementById("pokemon-img").src = pokemonData.sprite;
    document.getElementById("pokemon-name").textContent = pokemonData.key;
    document.getElementById(
      "pokemon-classification"
    ).textContent = `종류: ${pokemonData.classification}`;
    document.getElementById(
      "pokemon-color"
    ).textContent = `색: ${pokemonData.color}`;
    document.getElementById(
      "pokemon-types"
    ).textContent = `${pokemonData.types.map((t) => t.name).join(", ")}`;
    document.getElementById(
      "pokemon-weight-height"
    ).textContent = `무게: ${pokemonData.weight} kg, 키: ${pokemonData.height} m`;

    document.getElementById("pokemon-stats").innerHTML = `
      <ul>
        <li>HP: ${pokemonData.baseStats.hp}</li>
        <li>Attack: ${pokemonData.baseStats.attack}</li>
        <li>Defense: ${pokemonData.baseStats.defense}</li>
        <li>Special Attack: ${pokemonData.baseStats.specialattack}</li>
        <li>Special Defense: ${pokemonData.baseStats.specialdefense}</li>
        <li>Speed: ${pokemonData.baseStats.speed}</li>
      </ul>
    `;

    document.getElementById(
      "pokemon-flavor"
    ).textContent = `"${pokemonData.flavorTexts[0].flavor}" from ${pokemonData.flavorTexts[0].game}`;

    document.getElementById("pokemon-evolutions").innerHTML = `
      <ul>
        ${pokemonData.evolutions
          .map(
            (evo) =>
              `<li><img src="${evo.sprite}" alt="${evo.species}" /> ${evo.species}</li>`
          )
          .join("")}
      </ul>
    `;

    updateHistory(pokemonName);
    resultDiv.classList.remove("hidden");
  } else {
    alert("Pokémon not found!");
  }
}

function updateHistory(pokemonName) {
  const historyList = document.getElementById("history-list");
  const listItem = document.createElement("li");
  listItem.textContent = pokemonName;
  listItem.onclick = () => displayPokemon(pokemonName);
  historyList.prepend(listItem);

  if (historyList.children.length > 5) {
    historyList.removeChild(historyList.lastChild);
  }
}

document.getElementById("random-btn").addEventListener("click", () => {
    const representativePokemon = [
        // 1세대 (Red/Blue/Yellow)
        'bulbasaur', 'ivysaur', 'venusaur', 
        'charmander', 'charmeleon', 'charizard', 
        'squirtle', 'wartortle', 'blastoise', 
        'pikachu', 'raichu', 'jigglypuff', 
        'meowth', 'persian', 'abra', 
        'kadabra', 'alakazam', 'machop', 
        'machoke', 'machamp', 'geodude', 
        'graveler', 'golem', 'gastly', 
        'haunter', 'gengar', 'onix', 
        'cubone', 'marowak', 'ditto', 
        'eevee', 'vaporeon', 'jolteon', 
        'flareon', 'articuno', 'zapdos', 
        'moltres', 'dratini', 'dragonair', 
        'dragonite', 'mewtwo', 'mew',
      
        // 2세대 (Gold/Silver/Crystal)
        'chikorita', 'cyndaquil', 'totodile', 
        'togepi', 'togetic', 'mareep', 
        'flaaffy', 'ampharos', 'marill', 
        'azumarill', 'sudowoodo', 'politoed', 
        'espeon', 'umbreon', 'slowking', 
        'steelix', 'scizor', 'heracross', 
        'sneasel', 'teddiursa', 'ursaring', 
        'kingdra', 'porygon2', 'smeargle', 
        'tyranitar', 'lugia', 'ho-oh', 
        'celebi',
      
        // 3세대 (Ruby/Sapphire/Emerald)
        'treecko', 'torchic', 'mudkip', 
        'ralts', 'kirlia', 'gardevoir', 
        'shroomish', 'breloom', 'slakoth', 
        'vigoroth', 'slaking', 'whismur', 
        'loudred', 'exploud', 'aron', 
        'lairon', 'aggron', 'electrike', 
        'manectric', 'carvanha', 'sharpedo', 
        'trapinch', 'vibrava', 'flygon', 
        'bagon', 'shelgon', 'salamence', 
        'beldum', 'metang', 'metagross', 
        'kyogre', 'groudon', 'rayquaza'
      ];
  const randomName =
  representativePokemon[Math.floor(Math.random() * representativePokemon.length)];
  displayPokemon(randomName);
});

document.getElementById("search-btn").addEventListener("click", () => {
  const input = document.getElementById("search-input").value.trim();
  if (input) {
    displayPokemon(input);
  }
});
