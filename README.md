# Dablot Prejjesne
A Sami board game in the browser!

The rules are based on [this guide](http://www.cyningstan.com/data-download/339/dablot-prejjesne-leaflet) and the [wikipedia article](https://en.wikipedia.org/wiki/Dablot_Prejjesne) with no compulsory captures and free movement in all directions. I want to acknowledge that the rules used for implementation were originally orally shared between Sami people. This interpretation of the game is mostly based on texts by outside researchers, and re-implemented by a non-sami person for the internet. Therefore there might be inconsistencies with other interpretations and variants of the game. Please feel free to open an issue if you think there’s an important part that is misrepresented or could be improved.

## Running
To run everything, download docker and docker-compose, and run `docker-compose up -d`. While developing, see subfolders for more information.

## Development
The repository has 3 main folders

* client

  Frontend website code, including game
  
* server

  The websocket server that clients use to communicate with each other, does not serve frontend code
  
* shared

  Usefull stuff for both client and server, mostly type definitions
