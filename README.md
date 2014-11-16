# Socket.io Benchmark

## Parametres

* '-w, --worker' Nombre d'instances (process) client
* '-a, --amount' Nombre de connections client
* '-c, --concurrency' Nombre de connections concurrentes client (paquets/paquets de connections)
* '--help' Help

## Scenario

#### Server

* lancement du watch sur les tables BDD 'empty'/'watch' aleatoirement si au moins 1 client

* a la connection d'un user
    - requete mysql sur la table 'picture'
    - envoi des donnees existantes a l'user (~80ko)

* Le server verifie la BDD
    - requete mysql
    - envoi les infos a tous les users (~4ko)


#### Client

* pas de reconnections automatiques si echec de connection
* une fois le nombre de clients/paquets connecte au serveur, relance une connexion de paquets pour 'amount' connections


#### Reports

* nombre de messages recus par paquets


## History

* v0.1.0

