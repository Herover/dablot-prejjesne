# Dablot Prejjesne
A Sami board game in the browser!

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
