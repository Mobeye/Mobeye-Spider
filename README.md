# Scrap-Dashboard
This project provides a web interface for managing drive scraping.

~ HOW TO GET IT STARTED

      Step 1 : MONGODB Settings
      	   For python:
	       The project use MongoDB(a no sql database) to save his data.
	       The python scrapping/Parsing script will send his data in a specific MongoDB Collection, in a specific Database.
	       	   (You can see a Database like a room full of shelf, and a Collection like one of those shelf).
	       You find the Adresse of the Database in the python script at the variable " MONGODB_URI ".
	       	   (In the URL, you can find, the adresse of the DB, the MDP etc..)
	 	   
	   For Meteor:
	       You now need to indiquate to the project where to find his data.
	       Set the ENV variable MONGO_URL with your python MONGODB_URI.
	       

