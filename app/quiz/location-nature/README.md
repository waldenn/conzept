# iNatGuessr

This an attempt to create a GeoGuessr style game for iNaturalist. This web application integrates with the iNaturalist API to create an interactive game where users can guess the location of observed species and earn points based on the accuracy of their guesses.

## How to Play

1. Click the "Play Game" button to start the game.
2. A species observation image will be displayed, and a map will show the world's regions.
3. Your task is to guess the location where the species was observed by clicking on the map.
4. After making your guess, the actual location will be revealed, and you'll earn points based on the accuracy of your guess.
5. The game consists of multiple rounds, and your total score will be displayed at the end of each game.
6. Use the "Next Round" button to proceed to the next round and continue playing.

## Features

- **Interactive Map:** The game includes an interactive map that allows you to make guesses about the location of observed species. Click on the map to make your guess.

- **Scoring:** The game calculates your score based on the distance between your guess and the actual location. The closer your guess, the more points you earn.

- **Customization:** You can customize your game experience by adding custom parameters to the URL. For example, you can set a specific seed for the game, focus on specific places, or narrow down the taxonomic group you want to guess.

- **Daily Challenge:** Activate the daily challenge mode by setting the seed to "daily" and the game will use the current date as the seed for a unique challenge every day.

- **Custom Place and Taxon Information:** The game can display information about custom places and taxonomic groups if specified in the URL parameters.

- **Clipboard Copy:** Easily copy your game scores to the clipboard for sharing or keeping a record.

## How the Code Works

The iNaturalist Species Guessing Game is built using JavaScript and leverages the iNaturalist API to fetch species observations. Here's how the code works:

1. **Initialization:** The code initializes various global variables and retrieves custom parameters from the URL, allowing for customized gameplay.

2. **Seeding:** The game can be seeded using a provided seed or set to the daily challenge mode. Seeds influence the random observations generated in each round.

3. **Fetching Observations:** The `getRandomObvs` function fetches a random species observation from the iNaturalist API based on the specified parameters, including custom places and taxonomic groups.

4. **Fetching supporting obvservations:** The `getSupportingObvs()` function gets other observations from the nearby area.

5. **Creating the Map:** The `createMap` function initializes an interactive map using Leaflet.js. It displays the secret location and allows users to make their guesses by clicking on the map.

6. **Scoring:** The game calculates your score based on the accuracy of your guess. The `calculateScore` function determines the score based on the distance between your guess and the actual location.

7. **Displaying Information:** The game displays custom place and taxonomic group information based on the URL parameters.

8. **Generating Rounds:** The `generateNewRound` function generates new rounds of the game, updating the map, fetching observations, and handling custom parameters.

9. **Event Listeners:** Event listeners are set up for buttons like "Play Game," "Next Round," and "Copy to Clipboard," enhancing the interactivity of the game.

## Getting Started

1. Clone this repository to your local machine.
2. Open the `index.html` file in a web browser.
3. Click the "Play Game" button to start playing the iNaturalist Species Guessing Game.

## Customization

You can customize your game experience by adding custom parameters to the URL. For example:
- To set a specific seed for the game, add `?seed=YOUR_SEED` to the URL.
- To focus on specific places, add `?place_id=PLACE_ID1,PLACE_ID2` to the URL.
- To narrow down the taxonomic group, add `?taxon_id=TAXON_ID1,TAXON_ID2` to the URL.

## Credits

This game is powered by the [iNaturalist API](https://api.inaturalist.org/v1/docs/), [Leaflet.js](https://leafletjs.com/), and [seedrandom](https://github.com/davidbau/seedrandom)

