# Installation Guide

## Scope of this document

The goal of this guide is to allow you to install the runscape API on your own raspberry pi.

## Prerequisites

- Working environnement with NodeJS and MySQL installed (Installation guide can be found in /documentation/RapportDeTravail.docx)
- Import the /code file on your raspberry pi (location doesn't matter here, just remember where you put it)
- Run the database creation script found at /code/autre/scriptCreation.sql
- Create a MySQL user using : "GRANT ALL PRIVILEGES ON runscape.* TO 'username'@'localhost' IDENTIFIED BY 'password';"
- Create a new file named "dbConfig.js" file under /api/config/
- Fill the file with : 	
	var config = {};

	config.user = 'replace_with_db_username';
	config.password = 'replace_with_db_user_pwd';

	module.exports = config;

## Run the API

- Go to the /code repository on your raspberry pi

You should now be able to run the API using : "sudo node app.js"

The default port for the raspberry pi is the port 80
If HTTPS is not working, you should follow the guide in /documentation/RapportDeTravail.docx § 4.1.6 Installation certificat SSL

Version 0.2		17.03.2019		by Alexandre Philibert